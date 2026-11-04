import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const profile = await database.userProfile.findUnique({ where: { clerkUserId: userId }, select: { stripeCustomerId: true } });
  if (!profile?.stripeCustomerId) return NextResponse.json({ error: 'No subscription to manage yet.' }, { status: 404 });

  const session = await stripe().billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: `${new URL(req.url).origin}/profile`,
  });
  return NextResponse.json({ url: session.url });
}
