'use server';

import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { sanitizeAnswers as sanitize, type Answers } from '@/lib/onboarding-answers';

export async function completeOnboarding(input: Answers) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  const answers = sanitize(input);
  const level = typeof answers.level === 'string' ? answers.level : null;
  const goal = typeof answers.goal === 'string' ? answers.goal : null;

  await database.userProfile.upsert({
    where: { clerkUserId: userId },
    create: {
      clerkUserId: userId,
      excelLevel: level,
      goal,
      answers,
      onboardingCompletedAt: new Date(),
    },
    update: {
      excelLevel: level,
      goal,
      answers,
      onboardingCompletedAt: new Date(),
    },
  });

  redirect('/dashboard');
}
