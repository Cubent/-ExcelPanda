import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { cache } from 'react';

// One DB lookup per request, shared by the layout and the page. Redirects
// logged-out visitors home and unfinished users to onboarding.
export const getProfile = cache(async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  const profile = await database.userProfile.findUnique({
    where: { clerkUserId: userId },
  });
  if (!profile?.onboardingCompletedAt) {
    redirect('/onboarding');
  }

  const answers = (profile.answers ?? {}) as Record<string, unknown>;
  const str = (k: string) => (typeof answers[k] === 'string' ? (answers[k] as string) : undefined);

  return {
    userId,
    name: str('name'),
    level: str('level'),
    goal: str('goal'),
    minutes: str('minutes'),
    role: str('role'),
    joinedAt: profile.createdAt,
  };
});
