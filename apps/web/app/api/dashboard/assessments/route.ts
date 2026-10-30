import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { addPracticeAssessment, deletePracticeAssessment, MAX_ASSESSMENTS_PER_EXAM } from '@repo/database/qbank';
import { NextRequest, NextResponse } from 'next/server';
import { isScoredExam, isValidScore } from '@/lib/score-predictor';

const SOURCES = ['NBME', 'UWSA', 'FREE_120', 'OTHER'] as const;
type Source = (typeof SOURCES)[number];

const MAX_LABEL_LENGTH = 40;
const MAX_AGE_DAYS = 730;

/** Parses a YYYY-MM-DD date as UTC noon, rejecting future dates and anything older than two years. */
const parseTakenAt = (value: unknown) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  const now = Date.now();
  // One day of slack so a user west of UTC logging "today" is never rejected as future.
  if (date.getTime() > now + 86_400_000) return null;
  if (date.getTime() < now - MAX_AGE_DAYS * 86_400_000) return null;
  return date;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preference = await database.userPreference.findUnique({ where: { clerkUserId: userId } });
  if (!preference) {
    return NextResponse.json({ error: 'Select an exam in onboarding first.' }, { status: 400 });
  }
  if (!isScoredExam(preference.exam)) {
    return NextResponse.json(
      { error: 'Your exam reports pass or fail, so there is no three-digit score to log.' },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const source = body?.source as Source | undefined;
  const label = typeof body?.label === 'string' ? body.label.trim() : '';
  const score = typeof body?.score === 'number' ? body.score : Number(body?.score);
  const takenAt = parseTakenAt(body?.takenAt);

  if (!source || !SOURCES.includes(source)) {
    return NextResponse.json({ error: 'Choose which practice exam this was.' }, { status: 400 });
  }
  if (!label || label.length > MAX_LABEL_LENGTH) {
    return NextResponse.json({ error: `Name must be 1 to ${MAX_LABEL_LENGTH} characters.` }, { status: 400 });
  }
  if (!isValidScore(score)) {
    return NextResponse.json({ error: 'Score must be a whole number from 1 to 300.' }, { status: 400 });
  }
  if (!takenAt) {
    return NextResponse.json({ error: 'Enter a valid date that is not in the future.' }, { status: 400 });
  }

  const result = await addPracticeAssessment({
    clerkUserId: userId,
    examType: preference.exam,
    source,
    label,
    score,
    takenAt,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: `You can log up to ${MAX_ASSESSMENTS_PER_EXAM} practice exams. Delete an old one first.` },
      { status: 409 }
    );
  }
  return NextResponse.json({ id: result.id });
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const deleted = await deletePracticeAssessment(userId, id);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
