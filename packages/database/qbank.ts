import { AI_SYSTEM_NAME, getOrCreateAiSystem } from './ai-practice';
import { database } from './index';
import { AssessmentSource, ExamType, ObjectiveStatus, SessionMode } from '@prisma/client';

const CONSECUTIVE_QUESTIONS_BEFORE_SWITCH = 3;
export const SET_SIZE = 5;
export const SETS_TO_UNLOCK_STUDY_GUIDE = 3;
export const REVIEWS_TO_UNLOCK_STUDY_GUIDE = 1;

// Focus tokens for AI-generated disciplines are encoded as "ai:<discipline>"
// rather than a real System id, so /dashboard/topics can offer each AI
// discipline as its own focusable row (sized by title count) without a
// separate System per discipline. Real system ids never contain a colon.
const AI_FOCUS_PREFIX = 'ai:';

function splitFocusTokens(focusSystemIds: string[]) {
  const systemIds: string[] = [];
  const aiDisciplines: string[] = [];
  for (const token of focusSystemIds) {
    if (token.startsWith(AI_FOCUS_PREFIX)) aiDisciplines.push(token.slice(AI_FOCUS_PREFIX.length));
    else systemIds.push(token);
  }
  return { systemIds, aiDisciplines };
}

/**
 * Builds the LearningObjective-scoping filter for a focus selection that may
 * mix real system ids and "ai:<discipline>" tokens. Empty focus means no
 * filter at all (sample from everything, AI system included). Also reports
 * whether the scope is AI-only: AI titles aren't yield-curated like
 * hand-authored content, so an AI-only scope samples uniformly at random
 * instead of by yieldWeight (see `findNextObjective`).
 */
async function buildScopeFilter(examType: ExamType, focusSystemIds: string[]) {
  if (!focusSystemIds.length) {
    // "Whole exam" is only actually mixed if real, yield-curated content
    // still exists — if every system is the AI pool, sample randomly here too.
    const hasRealSystem = await database.system.findFirst({
      where: { examType, name: { not: AI_SYSTEM_NAME } },
      select: { id: true },
    });
    return { filter: {}, isAiOnly: !hasRealSystem };
  }

  const { systemIds, aiDisciplines } = splitFocusTokens(focusSystemIds);
  const clauses: Record<string, unknown>[] = [];
  if (systemIds.length) clauses.push({ systemId: { in: systemIds } });
  if (aiDisciplines.length) {
    const aiSystem = await getOrCreateAiSystem(examType);
    clauses.push({ systemId: aiSystem.id, discipline: { in: aiDisciplines } });
  }
  const isAiOnly = aiDisciplines.length > 0 && systemIds.length === 0;
  if (!clauses.length) return { filter: {}, isAiOnly };
  return { filter: clauses.length === 1 ? clauses[0] : { OR: clauses }, isAiOnly };
}

/**
 * The label to show for a question/review/history row: AI-pool content
 * displays its discipline (e.g. "Anatomy") so it reads naturally alongside
 * hand-authored topics of the same name, rather than a generic "AI
 * Generated" bucket label everywhere. `isAiGenerated` is still reported
 * separately so the UI can add a small "not reviewed" disclosure badge.
 */
function describeSource(learningObjective: { discipline: string; system: { name: string } }) {
  const isAiGenerated = learningObjective.system.name === AI_SYSTEM_NAME;
  return {
    isAiGenerated,
    displayName: isAiGenerated ? learningObjective.discipline : learningObjective.system.name,
  };
}

/**
 * The "topic" a learning objective belongs to for breadth/saturation
 * tracking: a real system's id, or `ai:<discipline>` for AI-pool content.
 * All AI-pool objectives share one literal System row, so raw `systemId`
 * can't tell disciplines apart the way it can for real content — this is
 * the same identity scheme `buildScopeFilter`'s focus tokens already use.
 */
function topicIdentity(learningObjective: { systemId: string; discipline: string; system: { name: string } }) {
  return learningObjective.system.name === AI_SYSTEM_NAME
    ? `${AI_FOCUS_PREFIX}${learningObjective.discipline}`
    : learningObjective.systemId;
}

/** The scope filter that excludes just the recently-saturated topic (a real system, or one AI discipline). */
async function buildAvoidTopicFilter(examType: ExamType, identity: string): Promise<Record<string, unknown>> {
  if (identity.startsWith(AI_FOCUS_PREFIX)) {
    const aiSystem = await getOrCreateAiSystem(examType);
    return { NOT: { systemId: aiSystem.id, discipline: identity.slice(AI_FOCUS_PREFIX.length) } };
  }
  return { systemId: { not: identity } };
}

/**
 * AI-pool objectives, grouped by discipline into "virtual topics" — used by
 * both the Topics page and the dashboard's per-topic accuracy breakdown so
 * each AI discipline appears as its own focusable/reportable row (sized by
 * title count), the same way a real System does, without needing a real
 * System row per discipline. `ai:<discipline>` is the same focus token
 * `buildScopeFilter` understands.
 */
async function getAiDisciplineGroups(examType: ExamType) {
  const aiSystem = await database.system.findFirst({ where: { examType, name: AI_SYSTEM_NAME } });
  if (!aiSystem) return [];

  const objectives = await database.learningObjective.findMany({
    where: { systemId: aiSystem.id },
    select: { id: true, discipline: true },
  });

  const byDiscipline = new Map<string, string[]>();
  for (const o of objectives) {
    const ids = byDiscipline.get(o.discipline) ?? [];
    ids.push(o.id);
    byDiscipline.set(o.discipline, ids);
  }

  return [...byDiscipline.entries()]
    .map(([discipline, objectiveIds]) => ({ systemId: `${AI_FOCUS_PREFIX}${discipline}`, name: discipline, objectiveIds }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

type ScoredProgress = {
  easeFactor: number;
  interval: number;
  correctStreak: number;
  /** Null when the objective has never been missed, so nothing is due for review. */
  nextReviewAt: Date | null;
  status: ObjectiveStatus;
};

/**
 * Simplified binary-response SM-2. Real SM-2 takes a 0-5 quality rating;
 * since a multiple-choice attempt only gives us correct/incorrect, this
 * collapses that into fixed ease adjustments. Same shape (ease factor +
 * growing interval on success, reset on failure) as the real thing.
 *
 * Reviews are only scheduled for objectives the user has missed: a miss
 * schedules one for tomorrow, and once an objective is on the review
 * schedule, correct answers keep spacing it out. A correct answer on an
 * objective that was never missed schedules nothing.
 */
export function scoreAttempt(
  previous: {
    easeFactor: number;
    interval: number;
    correctStreak: number;
    nextReviewAt: Date | null;
  } | null,
  isCorrect: boolean
): ScoredProgress {
  const easeFactor = previous?.easeFactor ?? 2.5;
  const correctStreak = previous?.correctStreak ?? 0;
  const interval = previous?.interval ?? 0;

  let nextEaseFactor: number;
  let nextInterval: number;
  let nextStreak: number;

  if (isCorrect) {
    nextStreak = correctStreak + 1;
    nextEaseFactor = Math.min(3, easeFactor + 0.1);
    if (nextStreak === 1) {
      nextInterval = 1;
    } else if (nextStreak === 2) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * nextEaseFactor);
    }
  } else {
    nextStreak = 0;
    nextEaseFactor = Math.max(1.3, easeFactor - 0.2);
    nextInterval = 1;
  }

  const neverMissed = isCorrect && !previous?.nextReviewAt;
  let nextReviewAt: Date | null = null;
  if (neverMissed) {
    nextInterval = 0;
  } else {
    nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + nextInterval);
  }

  const status: ObjectiveStatus = !isCorrect
    ? ObjectiveStatus.LEARNING
    : nextStreak >= 3
      ? ObjectiveStatus.MASTERED
      : ObjectiveStatus.REVIEW;

  return { easeFactor: nextEaseFactor, interval: nextInterval, correctStreak: nextStreak, nextReviewAt, status };
}

/** Finds the user's in-progress set for this exam, or starts a new one. */
export async function getOrCreateActiveSession(
  clerkUserId: string,
  examType: ExamType,
  mode: SessionMode = SessionMode.SEMESTER
) {
  // Oldest incomplete first, not newest: a next set can now be prepared and
  // created ahead of time, while the current one is still in progress (see
  // prepareUpcomingSet in apps/web/lib/prepare-practice-set.ts), so more
  // than one completedAt: null session can legitimately exist at once. The
  // one the user should actually be working through is always the oldest
  // of those, since the newer one is queued, not started yet.
  const active = await database.studySession.findFirst({
    where: { clerkUserId, examType, mode, completedAt: null },
    orderBy: { createdAt: 'asc' },
  });
  if (active) return active;

  return database.studySession.create({
    data: { clerkUserId, examType, mode },
  });
}

type PickedQuestion = NonNullable<Awaited<ReturnType<typeof pickUnseenVariation>>>;
type PickedObjective = NonNullable<Awaited<ReturnType<typeof findNextObjective>>>;

type PickOptions = {
  /** Learning objectives already reserved earlier in the same batch pick, so a second slot never repeats one. */
  excludeObjectiveIds?: string[];
  /** Rolling window of the most-recent system ids (newest first) for breadth-aware saturation checks. When
   * omitted, it's derived from real attempt history — used when picking one question at a time. */
  recentSystemIdsWindow?: string[];
};

/** A picked slot for a set: the objective is always present; `question` is null when the caller must generate one (AI-pool titles with no content yet). */
export type QuestionPick = { objective: PickedObjective; question: PickedQuestion | null; isReview: boolean };

/**
 * Yield-weight ordering makes sense for hand-curated content, but AI-pool
 * titles are all yieldWeight 50 with no curation behind the number — so an
 * AI-only scope instead samples uniformly at random among eligible titles
 * ("random 5 of the remaining N", per how the AI pool is meant to behave),
 * while a real (or mixed) scope keeps the original deterministic ordering.
 */
async function findNextObjective(
  examType: ExamType,
  where: Record<string, unknown>,
  randomize: boolean
) {
  if (!randomize) {
    return database.learningObjective.findFirst({
      where,
      orderBy: { yieldWeight: 'desc' },
      include: { system: true },
    });
  }

  const eligibleCount = await database.learningObjective.count({ where });
  if (eligibleCount === 0) return null;
  return database.learningObjective.findFirst({
    where,
    include: { system: true },
    skip: Math.floor(Math.random() * eligibleCount),
  });
}

/**
 * Priority-queue question selection:
 *   1. Overdue spaced-repetition reviews (a variation of a previously-missed LO)
 *   2. Weak areas: LOs the user has started but is under 50% on, not yet mastered
 *      (never ones whose review is scheduled for a later date)
 *   3. Next unseen LO by yield weight, favoring breadth once a system is "saturated"
 *
 * Steps 1 and 2 always resolve to a real Question (you can't have progress on
 * an objective without one having existed). Step 3 can return an objective
 * with `question: null` when it lands on an AI-pool title that has never
 * been generated before — the caller (an apps/web API route, which can call
 * OpenAI) is responsible for generating and persisting content for those,
 * then this same picker will find it via `pickUnseenVariation` next time.
 */
async function pickOneQuestion(
  clerkUserId: string,
  examType: ExamType,
  focusSystemIds: string[],
  options: PickOptions = {}
): Promise<QuestionPick | null> {
  const now = new Date();
  const { filter: scopeFilter, isAiOnly } = await buildScopeFilter(examType, focusSystemIds);
  const excludeObjectiveIds = options.excludeObjectiveIds ?? [];
  const excludeFilter = excludeObjectiveIds.length
    ? { learningObjectiveId: { notIn: excludeObjectiveIds } }
    : {};

  // 1. Overdue reviews
  const dueProgress = await database.userObjectiveProgress.findFirst({
    where: {
      clerkUserId,
      nextReviewAt: { lte: now },
      learningObjective: { examType, ...scopeFilter },
      ...excludeFilter,
    },
    orderBy: { nextReviewAt: 'asc' },
    include: { learningObjective: { include: { system: true } } },
  });

  if (dueProgress) {
    const question = await pickUnseenVariation(clerkUserId, dueProgress.learningObjectiveId);
    if (question) return { objective: dueProgress.learningObjective, question, isReview: true };
  }

  // 2. Weak areas: attempted before, accuracy under 50%, not mastered.
  // Respects the review schedule: an objective whose review is booked for a
  // later date must not come back early (and be labelled "Review") just
  // because the user is currently under 50% on it.
  const weakProgress = await database.userObjectiveProgress.findMany({
    where: {
      clerkUserId,
      OR: [{ nextReviewAt: null }, { nextReviewAt: { lte: now } }],
      status: { in: [ObjectiveStatus.LEARNING, ObjectiveStatus.REVIEW] },
      learningObjective: { examType, ...scopeFilter },
      ...excludeFilter,
    },
    include: { learningObjective: { include: { system: true } } },
  });

  for (const progress of weakProgress) {
    const attempts = await database.userQuestionAttempt.findMany({
      where: { clerkUserId, question: { learningObjectiveId: progress.learningObjectiveId } },
    });
    const accuracy = attempts.length ? attempts.filter((a) => a.isCorrect).length / attempts.length : 1;
    if (accuracy < 0.5) {
      const question = await pickUnseenVariation(clerkUserId, progress.learningObjectiveId);
      if (question) return { objective: progress.learningObjective, question, isReview: true };
    }
  }

  // 3. Next unseen LO, breadth-aware
  let recentSystemIds: string[];
  if (options.recentSystemIdsWindow) {
    recentSystemIds = options.recentSystemIdsWindow;
  } else {
    const recentAttempts = await database.userQuestionAttempt.findMany({
      where: { clerkUserId },
      orderBy: { attemptedAt: 'desc' },
      take: CONSECUTIVE_QUESTIONS_BEFORE_SWITCH,
      include: { question: { include: { learningObjective: { include: { system: true } } } } },
    });
    recentSystemIds = recentAttempts.map((a) => topicIdentity(a.question.learningObjective));
  }

  const isSaturated =
    recentSystemIds.length === CONSECUTIVE_QUESTIONS_BEFORE_SWITCH &&
    recentSystemIds.every((id) => id === recentSystemIds[0]);

  const seenObjectiveIds = (
    await database.userObjectiveProgress.findMany({
      where: { clerkUserId, learningObjective: { examType } },
      select: { learningObjectiveId: true },
    })
  ).map((p) => p.learningObjectiveId);

  const allExcludedObjectiveIds = [...new Set([...seenObjectiveIds, ...excludeObjectiveIds])];

  // Only let "saturation" force a topic switch away from the recent one if
  // that topic is actually still in scope under the current focus.
  const shouldAvoidRecentSystem =
    isSaturated && (!focusSystemIds.length || focusSystemIds.some((t) => t === recentSystemIds[0]));

  const avoidFilter = shouldAvoidRecentSystem
    ? await buildAvoidTopicFilter(examType, recentSystemIds[0])
    : {};

  const nextObjective = await findNextObjective(
    examType,
    {
      examType,
      ...scopeFilter,
      ...avoidFilter,
      id: { notIn: allExcludedObjectiveIds.length ? allExcludedObjectiveIds : undefined },
    },
    isAiOnly
  );

  if (!nextObjective) return null;

  const question = await pickUnseenVariation(clerkUserId, nextObjective.id);
  return { objective: nextObjective, question, isReview: false };
}

/** Picks a single question — kept for callers that only ever need one at a time. */
export async function pickNextQuestion(
  clerkUserId: string,
  examType: ExamType,
  focusSystemIds: string[] = []
): Promise<QuestionPick | null> {
  return pickOneQuestion(clerkUserId, examType, focusSystemIds);
}

/**
 * Picks up to `count` questions in one go — used to fill an entire practice
 * set upfront, rather than picking one question at a time as the user
 * answers through it. Maintains the same priority-queue and breadth-aware
 * system-rotation logic as `pickNextQuestion`, but tracks which learning
 * objectives have already been reserved earlier in this same batch (so the
 * set never repeats an objective) and rolls the "recent system" window
 * forward locally instead of only reading it from already-recorded attempts.
 * Some picks may come back with `question: null` (AI-pool titles with no
 * content generated yet) — see `pickOneQuestion`'s doc comment.
 */
export async function pickQuestionSet(
  clerkUserId: string,
  examType: ExamType,
  focusSystemIds: string[] = [],
  count: number = SET_SIZE
): Promise<QuestionPick[]> {
  const picks: QuestionPick[] = [];
  const excludeObjectiveIds: string[] = [];

  const recentAttempts = await database.userQuestionAttempt.findMany({
    where: { clerkUserId },
    orderBy: { attemptedAt: 'desc' },
    take: CONSECUTIVE_QUESTIONS_BEFORE_SWITCH,
    include: { question: { include: { learningObjective: { include: { system: true } } } } },
  });
  let recentSystemIdsWindow = recentAttempts.map((a) => topicIdentity(a.question.learningObjective));

  for (let i = 0; i < count; i++) {
    const picked = await pickOneQuestion(clerkUserId, examType, focusSystemIds, {
      excludeObjectiveIds,
      recentSystemIdsWindow,
    });
    if (!picked) break;

    picks.push(picked);
    excludeObjectiveIds.push(picked.objective.id);
    recentSystemIdsWindow = [topicIdentity(picked.objective), ...recentSystemIdsWindow].slice(
      0,
      CONSECUTIVE_QUESTIONS_BEFORE_SWITCH
    );
  }

  return picks;
}

/**
 * The question already served in this session but not yet answered, if any —
 * lets a user navigate away from /dashboard/practice and come back to the
 * exact same question at the exact same step, instead of the algorithm
 * picking a new one.
 */
export async function getPendingSessionQuestion(sessionId: string) {
  const pending = await database.sessionQuestion.findFirst({
    where: { sessionId, answeredAt: null },
    orderBy: { order: 'asc' },
    include: {
      question: { include: { choices: true, learningObjective: { include: { system: true } } } },
    },
  });

  if (!pending) return null;
  return { question: pending.question, isReview: pending.isReview };
}

/**
 * Per-slot correctness for every question served in this session so far, in
 * order: `true`/`false` once answered, `null` while still pending. Since a
 * StudySession maps 1:1 to one set (it's marked complete once SET_SIZE
 * questions are answered and a fresh session is created for the next set),
 * this is exactly "this set's" progress — used to render each dot in
 * `SetProgress` by actual correctness instead of just a raw answered count.
 */
export async function getSessionProgress(sessionId: string): Promise<(boolean | null)[]> {
  const sessionQuestions = await database.sessionQuestion.findMany({
    where: { sessionId },
    orderBy: { order: 'asc' },
    select: { questionId: true, answeredAt: true },
  });
  if (!sessionQuestions.length) return [];

  const attempts = await database.userQuestionAttempt.findMany({
    where: { sessionId, questionId: { in: sessionQuestions.map((s) => s.questionId) } },
    select: { questionId: true, isCorrect: true },
  });
  const correctByQuestion = new Map(attempts.map((a) => [a.questionId, a.isCorrect]));

  return sessionQuestions.map((sq) => (sq.answeredAt ? (correctByQuestion.get(sq.questionId) ?? null) : null));
}

/** Records that `question` has been served (but not yet answered) in `sessionId`. */
export async function markQuestionServed(sessionId: string, questionId: string, isReview: boolean) {
  const order = await database.sessionQuestion.count({ where: { sessionId } });
  return database.sessionQuestion.create({
    data: { sessionId, questionId, order, isReview, answeredAt: null },
  });
}

async function pickUnseenVariation(clerkUserId: string, learningObjectiveId: string) {
  const attemptedQuestionIds = (
    await database.userQuestionAttempt.findMany({
      where: { clerkUserId, question: { learningObjectiveId } },
      select: { questionId: true },
    })
  ).map((a) => a.questionId);

  const question = await database.question.findFirst({
    where: {
      learningObjectiveId,
      id: { notIn: attemptedQuestionIds.length ? attemptedQuestionIds : undefined },
    },
    include: { choices: true, learningObjective: { include: { system: true } } },
  });

  if (question) return question;

  // Every variation has been seen already — fall back to any question for this LO.
  return database.question.findFirst({
    where: { learningObjectiveId },
    include: { choices: true, learningObjective: { include: { system: true } } },
  });
}

/**
 * Records an attempt, updates the user's mastery state for that question's
 * learning objective (SM-2 scheduling), and attaches it to the given study
 * session — completing the session once it hits SET_SIZE questions.
 */
export async function recordAttempt(params: {
  clerkUserId: string;
  questionId: string;
  chosenAnswerId: string;
  sessionId: string;
  isReview: boolean;
  errorType?: 'CONCEPT' | 'RECALL' | 'CARELESS' | 'TIME';
}) {
  const question = await database.question.findUniqueOrThrow({
    where: { id: params.questionId },
    include: { choices: true },
  });
  const chosen = question.choices.find((c) => c.id === params.chosenAnswerId);
  const isCorrect = Boolean(chosen?.isCorrect);

  const pending = await database.sessionQuestion.findFirst({
    where: { sessionId: params.sessionId, questionId: params.questionId, answeredAt: null },
  });
  // The pending row (set when the question was served) is authoritative;
  // params.isReview is only a fallback if no such row exists.
  const isReview = pending?.isReview ?? params.isReview;

  const [priorCorrectCount, priorIncorrectCount] = await Promise.all([
    database.userQuestionAttempt.count({ where: { clerkUserId: params.clerkUserId, isCorrect: true } }),
    database.userQuestionAttempt.count({ where: { clerkUserId: params.clerkUserId, isCorrect: false } }),
  ]);
  const isFirstCorrectEver = isCorrect && priorCorrectCount === 0;
  const isFirstIncorrectEver = !isCorrect && priorIncorrectCount === 0;

  await database.userQuestionAttempt.create({
    data: {
      clerkUserId: params.clerkUserId,
      questionId: params.questionId,
      chosenAnswerId: params.chosenAnswerId,
      isCorrect,
      isReview,
      errorType: isCorrect ? undefined : params.errorType,
      sessionId: params.sessionId,
    },
  });

  const existingProgress = await database.userObjectiveProgress.findUnique({
    where: {
      clerkUserId_learningObjectiveId: {
        clerkUserId: params.clerkUserId,
        learningObjectiveId: question.learningObjectiveId,
      },
    },
  });

  const scored = scoreAttempt(existingProgress, isCorrect);

  await database.userObjectiveProgress.upsert({
    where: {
      clerkUserId_learningObjectiveId: {
        clerkUserId: params.clerkUserId,
        learningObjectiveId: question.learningObjectiveId,
      },
    },
    create: {
      clerkUserId: params.clerkUserId,
      learningObjectiveId: question.learningObjectiveId,
      status: scored.status,
      easeFactor: scored.easeFactor,
      interval: scored.interval,
      correctStreak: scored.correctStreak,
      nextReviewAt: scored.nextReviewAt,
      lastAttemptAt: new Date(),
    },
    update: {
      status: scored.status,
      easeFactor: scored.easeFactor,
      interval: scored.interval,
      correctStreak: scored.correctStreak,
      nextReviewAt: scored.nextReviewAt,
      lastAttemptAt: new Date(),
    },
  });

  if (pending) {
    await database.sessionQuestion.update({
      where: { id: pending.id },
      data: { answeredAt: new Date() },
    });
  } else {
    // Fallback for any attempt not preceded by markQuestionServed.
    const order = await database.sessionQuestion.count({ where: { sessionId: params.sessionId } });
    await database.sessionQuestion.create({
      data: {
        sessionId: params.sessionId,
        questionId: params.questionId,
        order,
        isReview,
        answeredAt: new Date(),
      },
    });
  }

  const answeredInSession = await database.sessionQuestion.count({
    where: { sessionId: params.sessionId, answeredAt: { not: null } },
  });
  if (answeredInSession >= SET_SIZE) {
    await database.studySession.update({
      where: { id: params.sessionId },
      data: { completedAt: new Date() },
    });
  }

  const learningObjective = await database.learningObjective.findUniqueOrThrow({
    where: { id: question.learningObjectiveId },
    include: { system: true },
  });

  return {
    isCorrect,
    correctAnswerId: question.choices.find((c) => c.isCorrect)?.id,
    explanation: question.explanation,
    choices: question.choices.map((c) => ({
      id: c.id,
      text: c.text,
      isCorrect: c.isCorrect,
      explanation: c.explanation,
      sortOrder: c.sortOrder,
    })),
    learningObjectiveId: question.learningObjectiveId,
    learningObjectiveTitle: learningObjective.title,
    learningObjectiveSummary: learningObjective.summary ?? learningObjective.title,
    isFirstCorrectEver,
    isFirstIncorrectEver,
    answeredInSession,
    isSetComplete: answeredInSession >= SET_SIZE,
    isAiGenerated: describeSource(learningObjective).isAiGenerated,
  };
}

/**
 * Per-question correct/incorrect breakdown for a just-completed set, shown
 * on the set-completion summary screen before the user starts the next one.
 */
export async function getSessionSummary(clerkUserId: string, sessionId: string) {
  const session = await database.studySession.findFirst({ where: { id: sessionId, clerkUserId } });
  if (!session) return null;

  const attempts = await database.userQuestionAttempt.findMany({
    where: { clerkUserId, sessionId },
    orderBy: { attemptedAt: 'asc' },
    include: {
      question: { include: { learningObjective: { include: { system: true } } } },
    },
  });

  return {
    correctCount: attempts.filter((a) => a.isCorrect).length,
    total: attempts.length,
    questions: attempts.map((a) => ({
      isCorrect: a.isCorrect,
      isReview: a.isReview,
      stem: a.question.stem,
      system: describeSource(a.question.learningObjective).displayName,
      objectiveTitle: a.question.learningObjective.title,
    })),
  };
}

/** Stats for the dashboard Overview: totals + Study Guide unlock progress. */
export async function getOverviewStats(clerkUserId: string, examType: ExamType) {
  const [questionsAnswered, setsCompleted, reviewsAnswered] = await Promise.all([
    database.userQuestionAttempt.count({ where: { clerkUserId, question: { learningObjective: { examType } } } }),
    database.studySession.count({ where: { clerkUserId, examType, completedAt: { not: null } } }),
    database.userQuestionAttempt.count({
      where: { clerkUserId, isReview: true, question: { learningObjective: { examType } } },
    }),
  ]);

  const setsProgress = Math.min(setsCompleted, SETS_TO_UNLOCK_STUDY_GUIDE);
  const reviewsProgress = Math.min(reviewsAnswered, REVIEWS_TO_UNLOCK_STUDY_GUIDE);
  const studyGuideUnlocked =
    setsCompleted >= SETS_TO_UNLOCK_STUDY_GUIDE && reviewsAnswered >= REVIEWS_TO_UNLOCK_STUDY_GUIDE;

  return {
    questionsAnswered,
    setsCompleted,
    reviewsAnswered,
    setsProgress,
    reviewsProgress,
    studyGuideUnlocked,
  };
}

/**
 * All past attempts on the same learning objective as `questionId`'s LO,
 * oldest first, for the "How you got here" timeline — each past attempt
 * surfaces the explanation of whichever variation question was shown then.
 */
export async function getObjectiveHistory(clerkUserId: string, learningObjectiveId: string) {
  return database.userQuestionAttempt.findMany({
    where: { clerkUserId, question: { learningObjectiveId } },
    orderBy: { attemptedAt: 'asc' },
    include: { question: true },
  });
}

/** The user's personal note on a learning objective, if any. */
export async function getNote(clerkUserId: string, learningObjectiveId: string) {
  return database.userQuestionNote.findUnique({
    where: { clerkUserId_learningObjectiveId: { clerkUserId, learningObjectiveId } },
  });
}

export async function upsertNote(clerkUserId: string, learningObjectiveId: string, content: string) {
  if (!content.trim()) {
    await database.userQuestionNote
      .delete({ where: { clerkUserId_learningObjectiveId: { clerkUserId, learningObjectiveId } } })
      .catch(() => null);
    return null;
  }

  return database.userQuestionNote.upsert({
    where: { clerkUserId_learningObjectiveId: { clerkUserId, learningObjectiveId } },
    create: { clerkUserId, learningObjectiveId, content },
    update: { content },
  });
}

export async function isBookmarked(clerkUserId: string, questionId: string) {
  const bookmark = await database.userBookmark.findUnique({
    where: { clerkUserId_questionId: { clerkUserId, questionId } },
  });
  return Boolean(bookmark);
}

/** Toggles a bookmark on/off, returning the new state. */
export async function toggleBookmark(clerkUserId: string, questionId: string) {
  const existing = await database.userBookmark.findUnique({
    where: { clerkUserId_questionId: { clerkUserId, questionId } },
  });

  if (existing) {
    await database.userBookmark.delete({ where: { id: existing.id } });
    return false;
  }

  await database.userBookmark.create({ data: { clerkUserId, questionId } });
  return true;
}

const DAILY_ACTIVITY_DAYS = 14;
const UPCOMING_REVIEWS_WINDOW_DAYS = 7;

function accuracyOf(attempts: { isCorrect: boolean }[]) {
  const total = attempts.length;
  const correct = attempts.filter((a) => a.isCorrect).length;
  return { pct: total ? Math.round((correct / total) * 100) : 0, correct, total };
}

export const STATS_RANGE_DAYS = { '7d': 7, '14d': 14, '30d': 30, '6m': 180 } as const;
export type StatsRangeKey = keyof typeof STATS_RANGE_DAYS;

/**
 * Accuracy + activity for an arbitrary trailing window, used by the
 * dashboard's time-range selector. Buckets by day for windows up to 30 days,
 * and by week beyond that (a 6-month view of 180 daily bars would be
 * unreadable), matching however granular `DailyActivityChart` can render.
 */
export async function getRangeStats(clerkUserId: string, examType: ExamType, rangeDays: number) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - rangeDays + 1);
  startDate.setHours(0, 0, 0, 0);

  const attempts = await database.userQuestionAttempt.findMany({
    where: { clerkUserId, question: { learningObjective: { examType } }, attemptedAt: { gte: startDate } },
    select: { isCorrect: true, attemptedAt: true },
  });

  const bucketDays = rangeDays > 30 ? 7 : 1;
  const bucketCount = Math.ceil(rangeDays / bucketDays);
  const dailyActivity: { date: string; correct: number; incorrect: number }[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = new Date(startDate);
    bucketStart.setDate(startDate.getDate() + i * bucketDays);
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketStart.getDate() + bucketDays);
    const inBucket = attempts.filter((a) => a.attemptedAt >= bucketStart && a.attemptedAt < bucketEnd);
    dailyActivity.push({
      date: bucketStart.toISOString(),
      correct: inBucket.filter((a) => a.isCorrect).length,
      incorrect: inBucket.filter((a) => !a.isCorrect).length,
    });
  }

  return { recentAccuracy: accuracyOf(attempts), dailyActivity };
}

/**
 * Real dashboard analytics: accuracy, exam coverage, daily activity (for the
 * hover chart), upcoming reviews, and per-system topic accuracy. All
 * computed from actual attempts/progress — no placeholder numbers.
 */
export async function getDashboardAnalytics(clerkUserId: string, examType: ExamType) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - DAILY_ACTIVITY_DAYS + 1);
  fourteenDaysAgo.setHours(0, 0, 0, 0);
  const in7Days = new Date(now);
  in7Days.setDate(now.getDate() + UPCOMING_REVIEWS_WINDOW_DAYS);

  const [allAttempts, recentAttempts, totalObjectives, seenObjectiveIds, systems, upcomingReviews] =
    await Promise.all([
      database.userQuestionAttempt.findMany({
        where: { clerkUserId, question: { learningObjective: { examType } } },
        select: { isCorrect: true },
      }),
      database.userQuestionAttempt.findMany({
        where: {
          clerkUserId,
          question: { learningObjective: { examType } },
          attemptedAt: { gte: sevenDaysAgo },
        },
        select: { isCorrect: true },
      }),
      database.learningObjective.count({ where: { examType } }),
      database.userObjectiveProgress.findMany({
        where: { clerkUserId, learningObjective: { examType } },
        select: { learningObjectiveId: true },
      }),
      database.system.findMany({
        where: { examType, name: { not: AI_SYSTEM_NAME } },
        orderBy: { sortOrder: 'asc' },
        include: { objectives: { select: { id: true } } },
      }),
      database.userObjectiveProgress.count({
        where: { clerkUserId, learningObjective: { examType }, nextReviewAt: { gte: now, lte: in7Days } },
      }),
    ]);

  const upcomingReviewsPreview = await database.userObjectiveProgress.findMany({
    where: { clerkUserId, learningObjective: { examType }, nextReviewAt: { gte: now, lte: in7Days } },
    orderBy: { nextReviewAt: 'asc' },
    take: 2,
    include: { learningObjective: { include: { system: true } } },
  });

  const dailyAttempts = await database.userQuestionAttempt.findMany({
    where: { clerkUserId, question: { learningObjective: { examType } }, attemptedAt: { gte: fourteenDaysAgo } },
    select: { isCorrect: true, attemptedAt: true },
  });

  const dailyActivity: { date: string; correct: number; incorrect: number }[] = [];
  for (let i = 0; i < DAILY_ACTIVITY_DAYS; i++) {
    const day = new Date(fourteenDaysAgo);
    day.setDate(fourteenDaysAgo.getDate() + i);
    const dayKey = day.toDateString();
    const forDay = dailyAttempts.filter((a) => a.attemptedAt.toDateString() === dayKey);
    dailyActivity.push({
      date: day.toISOString(),
      correct: forDay.filter((a) => a.isCorrect).length,
      incorrect: forDay.filter((a) => !a.isCorrect).length,
    });
  }

  const seenSet = new Set(seenObjectiveIds.map((p) => p.learningObjectiveId));
  const aiDisciplineGroups = await getAiDisciplineGroups(examType);
  const topicGroups = [
    ...systems.map((s) => ({ systemId: s.id, systemName: s.name, objectiveIds: s.objectives.map((o) => o.id) })),
    ...aiDisciplineGroups.map((g) => ({ systemId: g.systemId, systemName: g.name, objectiveIds: g.objectiveIds })),
  ];

  const topicAccuracy = await Promise.all(
    topicGroups.map(async ({ systemName, objectiveIds }) => {
      const seenInSystem = objectiveIds.filter((id) => seenSet.has(id)).length;
      const attempts = objectiveIds.length
        ? await database.userQuestionAttempt.findMany({
            where: { clerkUserId, question: { learningObjectiveId: { in: objectiveIds } } },
            select: { isCorrect: true },
          })
        : [];
      const acc = accuracyOf(attempts);
      return {
        systemName,
        totalObjectives: objectiveIds.length,
        seenObjectives: seenInSystem,
        accuracyPct: acc.pct,
        started: attempts.length > 0,
      };
    })
  );

  return {
    overallAccuracy: accuracyOf(allAttempts),
    last7DaysAccuracy: accuracyOf(recentAttempts),
    examCoverage: {
      pct: totalObjectives ? Math.round((seenSet.size / totalObjectives) * 100) : 0,
      seenCount: seenSet.size,
      totalObjectives,
    },
    dailyActivity,
    upcomingReviews,
    upcomingReviewsPreview: upcomingReviewsPreview.map((p) => ({
      system: describeSource(p.learningObjective).displayName,
      objectiveTitle: p.learningObjective.title,
      nextReviewAt: p.nextReviewAt,
    })),
    topicAccuracy,
  };
}

/** Every system for this exam with real seen% and question counts, for /dashboard/topics. */
export async function getTopicsOverview(clerkUserId: string, examType: ExamType) {
  const [preference, systems, seenObjectiveIds, aiDisciplineGroups] = await Promise.all([
    database.userPreference.findUnique({ where: { clerkUserId } }),
    database.system.findMany({
      where: { examType, name: { not: AI_SYSTEM_NAME } },
      orderBy: { name: 'asc' },
      include: { objectives: { select: { id: true, _count: { select: { questions: true } } } } },
    }),
    database.userObjectiveProgress.findMany({
      where: { clerkUserId, learningObjective: { examType } },
      select: { learningObjectiveId: true },
    }),
    getAiDisciplineGroups(examType),
  ]);

  const seenSet = new Set(seenObjectiveIds.map((p) => p.learningObjectiveId));

  const realTopics = systems.map((system) => {
    const totalObjectives = system.objectives.length;
    const seenInSystem = system.objectives.filter((o) => seenSet.has(o.id)).length;
    const totalQuestions = system.objectives.reduce((sum, o) => sum + o._count.questions, 0);
    return {
      systemId: system.id,
      name: system.name,
      seenPct: totalObjectives ? Math.round((seenInSystem / totalObjectives) * 100) : 0,
      totalQuestions,
    };
  });

  // AI-pool "topics": one row per discipline, sized by title count (not by
  // how many have been generated yet) — a title is available to practice as
  // soon as it exists, generated on first real use.
  const aiTopics = aiDisciplineGroups.map((group) => {
    const totalTitles = group.objectiveIds.length;
    const seenInGroup = group.objectiveIds.filter((id) => seenSet.has(id)).length;
    return {
      systemId: group.systemId,
      name: group.name,
      seenPct: totalTitles ? Math.round((seenInGroup / totalTitles) * 100) : 0,
      totalQuestions: totalTitles,
    };
  });

  return { topics: [...realTopics, ...aiTopics], focusSystemIds: preference?.focusSystemIds ?? [] };
}

/**
 * Sets which systems the user wants to drill (empty = "All topics", no
 * filter). Also clears any unanswered pending question in the active
 * session, so the change takes effect on the very next question served.
 */
export async function setUserFocus(clerkUserId: string, examType: ExamType, systemIds: string[]) {
  await database.userPreference.update({
    where: { clerkUserId },
    data: { focusSystemIds: systemIds },
  });

  const activeSession = await database.studySession.findFirst({
    where: { clerkUserId, examType, completedAt: null },
  });

  if (activeSession) {
    await database.sessionQuestion.deleteMany({
      where: { sessionId: activeSession.id, answeredAt: null },
    });
  }
}

/**
 * Full attempt history for /dashboard/history: every question the user has
 * answered, newest first, with bookmark status and the user's note. Notes are
 * saved per learning objective (the concept), so every attempt on a concept
 * carries the same note. The list view shows just a preview; the full
 * stem/choices/explanation ride along so a click can open the detail popup
 * without a second fetch.
 */
export async function getAttemptHistory(clerkUserId: string, examType: ExamType) {
  const [attempts, bookmarks, notes] = await Promise.all([
    database.userQuestionAttempt.findMany({
      where: { clerkUserId, question: { learningObjective: { examType } } },
      orderBy: { attemptedAt: 'desc' },
      include: {
        question: {
          include: {
            choices: true,
            learningObjective: { include: { system: true } },
          },
        },
      },
    }),
    database.userBookmark.findMany({
      where: { clerkUserId, question: { learningObjective: { examType } } },
      select: { questionId: true },
    }),
    database.userQuestionNote.findMany({
      where: { clerkUserId, learningObjective: { examType } },
      select: { learningObjectiveId: true, content: true },
    }),
  ]);

  const bookmarkedIds = new Set(bookmarks.map((b) => b.questionId));
  const noteByObjective = new Map(notes.map((n) => [n.learningObjectiveId, n.content]));

  return attempts.map((attempt) => ({
    id: attempt.id,
    isCorrect: attempt.isCorrect,
    isReview: attempt.isReview,
    attemptedAt: attempt.attemptedAt,
    isBookmarked: bookmarkedIds.has(attempt.questionId),
    note: noteByObjective.get(attempt.question.learningObjectiveId)?.trim() || null,
    system: describeSource(attempt.question.learningObjective).displayName,
    isAiGenerated: describeSource(attempt.question.learningObjective).isAiGenerated,
    objectiveTitle: attempt.question.learningObjective.title,
    objectiveSummary: attempt.question.learningObjective.summary ?? attempt.question.learningObjective.title,
    stem: attempt.question.stem,
    explanation: attempt.question.explanation,
    chosenAnswerId: attempt.chosenAnswerId,
    choices: attempt.question.choices
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({
        id: c.id,
        text: c.text,
        isCorrect: c.isCorrect,
        explanation: c.explanation,
      })),
  }));
}

/**
 * Every scheduled review (past or future) for the exam, for the
 * /dashboard/review calendar. Not windowed to a single month — the
 * component filters client-side so navigating months needs no refetch.
 */
export async function getReviewCalendar(clerkUserId: string, examType: ExamType) {
  const rows = await database.userObjectiveProgress.findMany({
    where: { clerkUserId, learningObjective: { examType }, nextReviewAt: { not: null } },
    orderBy: { nextReviewAt: 'asc' },
    include: { learningObjective: { include: { system: true } } },
  });

  return rows.map((row) => ({
    date: row.nextReviewAt!.toISOString(),
    system: describeSource(row.learningObjective).displayName,
    objectiveTitle: row.learningObjective.title,
  }));
}

export type StudyGuideQa = { stem: string; chosenText: string | null; isCorrect: boolean; correctText: string };
export type StudyGuideCandidate = {
  learningObjectiveId: string;
  title: string;
  missedCount: number;
  attemptCount: number;
  lastAttemptAt: Date;
  qa: StudyGuideQa[];
};

const STUDY_GUIDE_MAX_ENTRIES = 15;

/**
 * Learning objectives the user has missed at least once, paired with ONLY
 * that objective's own question/answer history (stem + choice texts +
 * correctness) — never the user's broader profile, other objectives, or
 * anything beyond what's needed to explain that specific gap. This is the
 * sole input to the Study Guide's AI summary generation.
 */
export async function getStudyGuideCandidates(
  clerkUserId: string,
  examType: ExamType
): Promise<StudyGuideCandidate[]> {
  const attempts = await database.userQuestionAttempt.findMany({
    where: { clerkUserId, question: { learningObjective: { examType } } },
    orderBy: { attemptedAt: 'desc' },
    include: {
      chosenAnswer: true,
      question: { include: { choices: true, learningObjective: true } },
    },
  });

  const byObjective = new Map<
    string,
    { title: string; missed: number; attempts: number; lastAttemptAt: Date; qa: StudyGuideQa[] }
  >();

  for (const a of attempts) {
    const lo = a.question.learningObjective;
    const bucket = byObjective.get(lo.id) ?? {
      title: lo.title,
      missed: 0,
      attempts: 0,
      lastAttemptAt: a.attemptedAt,
      qa: [],
    };
    bucket.attempts += 1;
    if (!a.isCorrect) bucket.missed += 1;
    bucket.qa.push({
      stem: a.question.stem,
      chosenText: a.chosenAnswer?.text ?? null,
      isCorrect: a.isCorrect,
      correctText: a.question.choices.find((c) => c.isCorrect)?.text ?? '',
    });
    byObjective.set(lo.id, bucket);
  }

  const candidates = [...byObjective.entries()]
    .filter(([, bucket]) => bucket.missed > 0)
    .map(([learningObjectiveId, bucket]) => ({
      learningObjectiveId,
      title: bucket.title,
      missedCount: bucket.missed,
      attemptCount: bucket.attempts,
      lastAttemptAt: bucket.lastAttemptAt,
      qa: bucket.qa,
    }));

  return candidates.sort((a, b) => b.missedCount - a.missedCount).slice(0, STUDY_GUIDE_MAX_ENTRIES);
}

/** Candidates whose stored summary is missing or stale (new attempts since it was generated). */
export async function getStaleStudyGuideCandidates(clerkUserId: string, examType: ExamType) {
  const candidates = await getStudyGuideCandidates(clerkUserId, examType);
  if (!candidates.length) return [];

  const existing = await database.studyGuideEntry.findMany({
    where: { clerkUserId, learningObjectiveId: { in: candidates.map((c) => c.learningObjectiveId) } },
    select: { learningObjectiveId: true, missedCount: true, attemptCount: true },
  });
  const existingByLo = new Map(existing.map((e) => [e.learningObjectiveId, e]));

  return candidates.filter((c) => {
    const entry = existingByLo.get(c.learningObjectiveId);
    return !entry || entry.missedCount !== c.missedCount || entry.attemptCount !== c.attemptCount;
  });
}

/**
 * Persists a freshly-generated (or regenerated) summary for one objective.
 * If the entry was previously marked reviewed but has now been missed again
 * (missedCount grew past what it was at review time), it returns to Active.
 */
export async function saveStudyGuideSummary(
  clerkUserId: string,
  learningObjectiveId: string,
  data: { summary: string; missedCount: number; attemptCount: number; lastAttemptAt: Date }
) {
  const existing = await database.studyGuideEntry.findUnique({
    where: { clerkUserId_learningObjectiveId: { clerkUserId, learningObjectiveId } },
  });

  const shouldUnreview =
    Boolean(existing?.isReviewed) &&
    existing?.reviewedAtMissCount != null &&
    data.missedCount > existing.reviewedAtMissCount;

  return database.studyGuideEntry.upsert({
    where: { clerkUserId_learningObjectiveId: { clerkUserId, learningObjectiveId } },
    create: {
      clerkUserId,
      learningObjectiveId,
      summary: data.summary,
      missedCount: data.missedCount,
      attemptCount: data.attemptCount,
      lastAttemptAt: data.lastAttemptAt,
    },
    update: {
      summary: data.summary,
      missedCount: data.missedCount,
      attemptCount: data.attemptCount,
      lastAttemptAt: data.lastAttemptAt,
      ...(shouldUnreview ? { isReviewed: false, reviewedAtMissCount: null } : {}),
    },
  });
}

/** The user's Study Guide entries, joined with display-ready topic/title info. */
export async function getStudyGuideEntries(
  clerkUserId: string,
  examType: ExamType,
  options: { isReviewed?: boolean; sort?: 'recent' | 'missed'; limit?: number } = {}
) {
  const rows = await database.studyGuideEntry.findMany({
    where: {
      clerkUserId,
      ...(options.isReviewed !== undefined ? { isReviewed: options.isReviewed } : {}),
      learningObjective: { examType },
    },
    include: { learningObjective: { include: { system: true } } },
    orderBy: options.sort === 'recent' ? { lastAttemptAt: 'desc' } : { missedCount: 'desc' },
    ...(options.limit ? { take: options.limit } : {}),
  });

  return rows.map((row) => ({
    id: row.id,
    objectiveTitle: row.learningObjective.title,
    topic: describeSource(row.learningObjective).displayName,
    summary: row.summary,
    missedCount: row.missedCount,
    attemptCount: row.attemptCount,
    isReviewed: row.isReviewed,
    updatedAt: row.updatedAt,
  }));
}

/** Marks a Study Guide entry as reviewed; it returns to Active if missed again later. */
export async function markStudyGuideReviewed(clerkUserId: string, entryId: string) {
  const entry = await database.studyGuideEntry.findFirst({ where: { id: entryId, clerkUserId } });
  if (!entry) return null;
  return database.studyGuideEntry.update({
    where: { id: entryId },
    data: { isReviewed: true, reviewedAtMissCount: entry.missedCount },
  });
}

// ---------------------------------------------------------------------------
// Score predictor (/dashboard/predictor)
// ---------------------------------------------------------------------------

const SIGNAL_WINDOW_DAYS = 30;
/** A system needs at least this many recent attempts before it can be called a weak spot. */
const MIN_SYSTEM_ATTEMPTS_FOR_SIGNAL = 8;
/** Below this many attempts in the prior window, a trend against it would be noise. */
const MIN_PRIOR_ATTEMPTS_FOR_TREND = 10;
const WEAK_SYSTEMS_SHOWN = 3;
export const MAX_ASSESSMENTS_PER_EXAM = 50;

/**
 * Real practice signals from the user's own MedPrep attempts: recent accuracy,
 * its change against the previous window, spaced-review accuracy, and the
 * weakest systems. These describe how practice is going; they are never turned
 * into a three-digit score (see apps/web/lib/score-predictor.ts for why).
 */
export async function getPredictorSignals(clerkUserId: string, examType: ExamType) {
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(now.getDate() - SIGNAL_WINDOW_DAYS);
  const priorStart = new Date(now);
  priorStart.setDate(now.getDate() - SIGNAL_WINDOW_DAYS * 2);

  const [questionsAnswered, attempts] = await Promise.all([
    database.userQuestionAttempt.count({ where: { clerkUserId, question: { learningObjective: { examType } } } }),
    database.userQuestionAttempt.findMany({
      where: { clerkUserId, question: { learningObjective: { examType } }, attemptedAt: { gte: priorStart } },
      select: {
        isCorrect: true,
        isReview: true,
        attemptedAt: true,
        question: { select: { learningObjective: { select: { discipline: true, system: { select: { name: true } } } } } },
      },
    }),
  ]);

  const recent = attempts.filter((a) => a.attemptedAt >= windowStart);
  const prior = attempts.filter((a) => a.attemptedAt < windowStart);
  const recentAcc = accuracyOf(recent);
  const priorAcc = accuracyOf(prior);

  const bySystem = new Map<string, { correct: number; total: number }>();
  for (const a of recent) {
    const name = describeSource(a.question.learningObjective).displayName;
    const entry = bySystem.get(name) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (a.isCorrect) entry.correct += 1;
    bySystem.set(name, entry);
  }
  const weakestSystems = [...bySystem.entries()]
    .filter(([, v]) => v.total >= MIN_SYSTEM_ATTEMPTS_FOR_SIGNAL)
    .map(([name, v]) => ({ name, attempts: v.total, accuracyPct: Math.round((v.correct / v.total) * 100) }))
    .sort((x, y) => x.accuracyPct - y.accuracyPct)
    .slice(0, WEAK_SYSTEMS_SHOWN);

  const reviewAttempts = recent.filter((a) => a.isReview);
  const reviewAcc = accuracyOf(reviewAttempts);

  return {
    windowDays: SIGNAL_WINDOW_DAYS,
    questionsAnswered,
    recent: recentAcc,
    changeVsPriorPct: priorAcc.total >= MIN_PRIOR_ATTEMPTS_FOR_TREND && recentAcc.total > 0 ? recentAcc.pct - priorAcc.pct : null,
    review: { ...reviewAcc, hasData: reviewAcc.total > 0 },
    weakestSystems,
  };
}

export async function listPracticeAssessments(clerkUserId: string, examType: ExamType) {
  return database.practiceAssessment.findMany({
    where: { clerkUserId, examType },
    orderBy: { takenAt: 'desc' },
    select: { id: true, source: true, label: true, score: true, takenAt: true },
  });
}

export async function addPracticeAssessment(params: {
  clerkUserId: string;
  examType: ExamType;
  source: AssessmentSource;
  label: string;
  score: number;
  takenAt: Date;
}): Promise<{ ok: true; id: string } | { ok: false; reason: 'limit' }> {
  const existing = await database.practiceAssessment.count({
    where: { clerkUserId: params.clerkUserId, examType: params.examType },
  });
  if (existing >= MAX_ASSESSMENTS_PER_EXAM) return { ok: false, reason: 'limit' };
  const row = await database.practiceAssessment.create({ data: params, select: { id: true } });
  return { ok: true, id: row.id };
}

/** Scoped by clerkUserId so one user can never delete another's entry by guessing an id. */
export async function deletePracticeAssessment(clerkUserId: string, id: string) {
  const result = await database.practiceAssessment.deleteMany({ where: { id, clerkUserId } });
  return result.count > 0;
}

export async function recordExamOutcome(params: {
  clerkUserId: string;
  examType: ExamType;
  score: number | null;
  passed: boolean;
  takenAt: Date;
}) {
  return database.examOutcome.create({ data: params, select: { id: true } });
}

export async function getLatestExamOutcome(clerkUserId: string, examType: ExamType) {
  return database.examOutcome.findFirst({
    where: { clerkUserId, examType },
    orderBy: { createdAt: 'desc' },
    select: { id: true, score: true, passed: true, takenAt: true },
  });
}
