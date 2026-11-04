import { auth, currentUser } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { PLAN_PRICE, TRIAL_DAYS, isPlan, stripe } from '@/lib/stripe';
import { sanitizeAnswers } from '@/lib/onboarding-answers';
import { hasAccess } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { plan?: unknown; answers?: unknown; returnTo?: unknown };
  if (!isPlan(body.plan)) return NextResponse.json({ error: 'Unknown plan.' }, { status: 400 });
  const plan = body.plan;
  const price = PLAN_PRICE[plan];
  if (!price) return NextResponse.json({ error: 'This plan is not available yet.' }, { status: 500 });

  const s = stripe();
  const profile = await database.userProfile.findUnique({ where: { clerkUserId: userId } });
  const origin = new URL(req.url).origin;

  // Already paying: send them to manage it instead of buying twice.
  if (profile && hasAccess({ status: profile.subscriptionStatus }) && profile.stripeCustomerId) {
    const portal = await s.billingPortal.sessions.create({ customer: profile.stripeCustomerId, return_url: `${origin}/profile` });
    return NextResponse.json({ url: portal.url });
  }

  // From onboarding: keep the answers, but do NOT mark onboarding complete until the payment goes through.
  const fromOnboarding = body.returnTo === 'paywall' || body.returnTo === 'offer';
  if (fromOnboarding && body.answers) {
    const answers = sanitizeAnswers(body.answers);
    await database.userProfile.upsert({
      where: { clerkUserId: userId },
      create: { clerkUserId: userId, answers },
      update: { answers },
    });
  }

  let customerId = profile?.stripeCustomerId ?? null;
  if (!customerId) {
    const user = await currentUser();
    const customer = await s.customers.create({
      email: user?.primaryEmailAddress?.emailAddress,
      name: user?.fullName ?? undefined,
      metadata: { clerkUserId: userId },
    });
    customerId = customer.id;
    await database.userProfile.upsert({
      where: { clerkUserId: userId },
      create: { clerkUserId: userId, stripeCustomerId: customerId },
      update: { stripeCustomerId: customerId },
    });
  }

  const common = {
    customer: customerId,
    client_reference_id: userId,
    allow_promotion_codes: true,
    success_url: `${origin}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    // Cancelling sends people back to the step they were on.
    cancel_url: fromOnboarding ? `${origin}/onboarding?step=${body.returnTo}` : `${origin}/subscribe`,
    metadata: { clerkUserId: userId, plan },
  };

  const session =
    plan === 'lifetime'
      ? await s.checkout.sessions.create({
          ...common,
          mode: 'payment',
          line_items: [{ price, quantity: 1 }],
        })
      : await s.checkout.sessions.create({
          ...common,
          mode: 'subscription',
          line_items: [{ price, quantity: 1 }],
          payment_method_collection: 'always',
          // The limited offer is a discount instead of the free trial, so it is billed straight away.
          subscription_data: {
            ...(plan === 'annual_offer' ? {} : { trial_period_days: TRIAL_DAYS }),
            metadata: { clerkUserId: userId, plan },
          },
        });

  return NextResponse.json({ url: session.url });
}
