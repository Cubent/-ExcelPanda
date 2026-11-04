'use server';

import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';

type Answers = Record<string, string | string[]>;

// Keep only plain string / string[] values so nothing odd gets persisted.
function sanitize(input: Answers): Answers {
  const clean: Answers = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    if (typeof value === 'string') {
      clean[key.slice(0, 40)] = value.slice(0, 80);
    } else if (Array.isArray(value)) {
      clean[key.slice(0, 40)] = value
        .filter((v): v is string => typeof v === 'string')
        .slice(0, 12)
        .map((v) => v.slice(0, 80));
    }
  }
  return clean;
}

/** Saves the answers and marks onboarding done, without leaving the page (used before checkout). */
export async function saveOnboarding(input: Answers) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  const answers = sanitize(input);
  const level = typeof answers.level === 'string' ? answers.level : null;
  const goal = typeof answers.goal === 'string' ? answers.goal : null;
  await database.userProfile.upsert({
    where: { clerkUserId: userId },
    create: { clerkUserId: userId, excelLevel: level, goal, answers, onboardingCompletedAt: new Date() },
    update: { excelLevel: level, goal, answers, onboardingCompletedAt: new Date() },
  });
  return { ok: true as const };
}

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
