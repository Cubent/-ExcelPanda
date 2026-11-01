import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { OnboardingFlow } from './onboarding-flow';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  const profile = await database.userProfile.findUnique({
    where: { clerkUserId: userId },
  });
  if (profile?.onboardingCompletedAt) {
    redirect('/dashboard');
  }

  return <OnboardingFlow />;
}
