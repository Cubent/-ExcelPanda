import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { sanitizeAnswers } from '@/lib/onboarding-answers';
import { OnboardingFlow } from './onboarding-flow';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const { step } = await searchParams;
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

  // Coming back from a cancelled payment: reopen the paywall (or the offer) with the answers already given.
  const resume = step === 'paywall' || step === 'offer' ? step : null;
  return <OnboardingFlow initialAnswers={resume ? sanitizeAnswers(profile?.answers) : undefined} resume={resume} />;
}
