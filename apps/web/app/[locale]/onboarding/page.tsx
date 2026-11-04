import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { sanitizeAnswers } from '@/lib/onboarding-answers';
import { hasAccess } from '@/lib/subscription';
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
  // Coming back from a cancelled payment: reopen the paywall (or the offer) with the answers already given.
  // This applies even to an account that finished onboarding earlier, as long as it has no plan yet.
  const wantsPaywall = step === 'paywall' || step === 'offer';
  const paid = hasAccess({ status: profile?.subscriptionStatus ?? null });
  if (profile?.onboardingCompletedAt && !(wantsPaywall && !paid)) {
    redirect('/dashboard');
  }
  const resume = wantsPaywall ? step : null;
  return <OnboardingFlow initialAnswers={resume ? sanitizeAnswers(profile?.answers) : undefined} resume={resume as 'paywall' | 'offer' | null} />;
}
