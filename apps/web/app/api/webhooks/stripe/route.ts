import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { planFromPriceId, stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const fromUnix = (n: number | null | undefined) => (n ? new Date(n * 1000) : null);

/** Copies a Stripe subscription onto the user's profile. Lifetime owners are never downgraded by it. */
async function syncSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const item = sub.items.data[0];
  const plan = planFromPriceId(item?.price.id) ?? (sub.metadata?.plan as string | undefined) ?? null;
  // Newer API versions keep the billing period on the item, older ones on the subscription.
  const periodEnd =
    (item as unknown as { current_period_end?: number } | undefined)?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end;

  const where = { stripeCustomerId: customerId };
  const existing = await database.userProfile.findUnique({ where, select: { plan: true } });
  if (!existing || existing.plan === 'lifetime') return;

  await database.userProfile.update({
    where,
    data: {
      stripeSubscriptionId: sub.id,
      plan,
      subscriptionStatus: sub.status === 'unpaid' || sub.status === 'incomplete_expired' ? 'canceled' : sub.status,
      trialEndsAt: fromUnix(sub.trial_end),
      currentPeriodEnd: fromUnix(periodEnd),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get('stripe-signature');
  if (!secret || !signature) return NextResponse.json({ error: 'Webhook not configured.' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.clerkUserId;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
      if (!userId || !customerId) break;
      await database.userProfile.updateMany({ where: { clerkUserId: userId, onboardingCompletedAt: null }, data: { onboardingCompletedAt: new Date() } });

      if (session.mode === 'payment' && session.payment_status === 'paid' && session.metadata?.plan === 'lifetime') {
        await database.userProfile.update({
          where: { clerkUserId: userId },
          data: {
            stripeCustomerId: customerId,
            plan: 'lifetime',
            subscriptionStatus: 'lifetime',
            cancelAtPeriodEnd: false,
            trialEndsAt: null,
            currentPeriodEnd: null,
          },
        });
      } else if (session.mode === 'subscription' && session.subscription) {
        await database.userProfile.update({ where: { clerkUserId: userId }, data: { stripeCustomerId: customerId } });
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
        await syncSubscription(await stripe().subscriptions.retrieve(subId));
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
