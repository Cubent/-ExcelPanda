import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Post-auth landing point. Checks onboarding in the DB and sends the user to
// /onboarding or /dashboard with a real HTTP redirect.
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const profile = await database.userProfile.findUnique({
    where: { clerkUserId: userId },
  });

  const target = profile?.onboardingCompletedAt ? '/dashboard' : '/onboarding';
  return NextResponse.redirect(new URL(target, request.url));
}
