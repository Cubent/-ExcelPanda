import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendGA4Purchase } from '../../../../lib/ga4-measurement-protocol';
import { sendMetaPurchase } from '../../../../lib/meta-capi';
import { sendPaymentFailedEmail } from '../../../../lib/payment-failed-email';
import { buildPaymentIssue } from '../../../../lib/subscription';
import { syncSubscription } from '../../../../lib/subscription-sync';

// Stripe is the system of record for billing state — this handler is the
// ONLY place that ever writes to the Subscription table. Never write to it
// from any other route (e.g. /api/checkout), or the two sources can drift.
const RELEVANT_EVENTS = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Billing is not configured yet' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Signature verification needs the exact raw request body — do not parse
  // it as JSON before this.
  const rawBody = await request.text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (RELEVANT_EVENTS.has(event.type)) {
    await syncSubscription(event.data.object as Stripe.Subscription);
  }

  // Report real payments to Meta Ads and Google Ads (via GA4). Trial invoices
  // are $0, so only charges count.
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice;
    if (invoice.amount_paid > 0) {
      // The subscription metadata sits under `parent` on newer Stripe API
      // versions and at the top level (`subscription_details`) on older ones.
      const subscriptionMetadata =
        invoice.parent?.subscription_details?.metadata ??
        (invoice as unknown as {
          subscription_details?: { metadata?: Record<string, string> | null };
        }).subscription_details?.metadata;

      await Promise.all([
        sendMetaPurchase({
          eventId: invoice.id ?? `${event.id}`,
          eventTime: invoice.status_transitions?.paid_at ?? invoice.created,
          email: invoice.customer_email,
          clerkUserId: subscriptionMetadata?.clerkUserId,
          value: invoice.amount_paid / 100,
          currency: invoice.currency,
        }),
        sendGA4Purchase({
          eventId: invoice.id ?? `${event.id}`,
          clientId: subscriptionMetadata?.gaClientId,
          value: invoice.amount_paid / 100,
          currency: invoice.currency,
        }),
      ]);
    }
  }

  // A failed renewal charge on an established subscription (not the first
  // charge right after the trial ends, which gets no email). Email the
  // customer a link to fix it, same wording and deadline as the in-app
  // banner (dashboard/components/dashboard-shell.tsx).
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice;
    const email = invoice.customer_email;
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

    if (email && customerId) {
      const subscriptionRef =
        invoice.parent?.subscription_details?.subscription ??
        (invoice as unknown as { subscription?: string | Stripe.Subscription }).subscription;
      const subscriptionId = typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id;

      let trialEnd: number | null = null;
      if (subscriptionId) {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
          trialEnd = stripeSubscription.trial_end;
        } catch (error) {
          console.error('Could not retrieve subscription for payment-failed email:', error);
        }
      }

      const issue = buildPaymentIssue(
        invoice.status_transitions?.finalized_at ?? invoice.created,
        trialEnd
      );

      if (!issue.afterTrial) {
        try {
          const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_WEB_URL ?? 'https://www.medprepinstitute.org'}/dashboard/account`,
          });

          await sendPaymentFailedEmail({
            email,
            accessEndsAt: issue.accessEndsAt,
            portalUrl: portalSession.url,
          });
        } catch (error) {
          console.error('Could not send payment-failed email:', error);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
