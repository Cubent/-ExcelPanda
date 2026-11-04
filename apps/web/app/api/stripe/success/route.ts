import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * Where Stripe sends people after a finished checkout. Only now is onboarding marked complete, so someone who
 * cancels the payment is still on the paywall step. The checkout session is verified before anything is saved.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL('/', url.origin));

  const sessionId = url.searchParams.get('session_id');
  if (sessionId) {
    try {
      const session = await stripe().checkout.sessions.retrieve(sessionId);
      const mine = session.client_reference_id === userId;
      const done = session.status === 'complete';
      if (mine && done) {
        await database.userProfile.updateMany({
          where: { clerkUserId: userId, onboardingCompletedAt: null },
          data: { onboardingCompletedAt: new Date() },
        });
      }
    } catch {
      // Fall through: the webhook completes onboarding too.
    }
  }
  return NextResponse.redirect(new URL('/dashboard?subscribed=1', url.origin));
}
