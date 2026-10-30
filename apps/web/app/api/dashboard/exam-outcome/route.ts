import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { recordExamOutcome } from '@repo/database/qbank';
import { NextResponse } from 'next/server';
import { isScoredExam, isValidScore } from '@/lib/score-predictor';

/**
 * Records the user's real exam result, entered voluntarily after test day.
 * This is the ground truth a future calibrated predictor needs.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preference = await database.userPreference.findUnique({ where: { clerkUserId: userId } });
  if (!preference) {
    return NextResponse.json({ error: 'Select an exam in onboarding first.' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.passed !== 'boolean') {
    return NextResponse.json({ error: 'Say whether you passed.' }, { status: 400 });
  }

  let score: number | null = null;
  if (isScoredExam(preference.exam)) {
    const raw = typeof body?.score === 'number' ? body.score : Number(body?.score);
    if (!isValidScore(raw)) {
      return NextResponse.json({ error: 'Score must be a whole number from 1 to 300.' }, { status: 400 });
    }
    score = raw;
  }

  const date = typeof body?.takenAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.takenAt) ? new Date(`${body.takenAt}T12:00:00Z`) : null;
  const now = Date.now();
  if (!date || Number.isNaN(date.getTime()) || date.getTime() > now + 86_400_000 || date.getTime() < now - 730 * 86_400_000) {
    return NextResponse.json({ error: 'Enter a valid exam date that is not in the future.' }, { status: 400 });
  }

  await recordExamOutcome({
    clerkUserId: userId,
    examType: preference.exam,
    score,
    passed: body.passed,
    takenAt: date,
  });
  return NextResponse.json({ ok: true });
}
