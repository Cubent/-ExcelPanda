import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { getLatestExamOutcome, getPredictorSignals, listPracticeAssessments } from '@repo/database/qbank';
import { Play, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { estimateScore, isScoredExam, PASSING_STANDARD } from '@/lib/score-predictor';
import { AssessmentLogger } from './components/assessment-logger';
import { EstimateCard } from './components/estimate-card';
import { ExamOutcomeForm } from './components/exam-outcome-form';
import { PracticeSignals } from './components/practice-signals';
import { TrendChart } from './components/trend-chart';

const CARD_CLASS =
  'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#120A2E]';

// Prisma's "table does not exist" code. The predictor's tables ship in a
// migration that is applied to the database separately from the code deploy
// (scripts/vercel-build.sh does not run `prisma migrate deploy`), so a deploy can
// briefly land first. Degrade that one page instead of erroring for everyone.
const isMissingTable = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'P2021';

type ViewProps = {
  exam: 'STEP_1' | 'STEP_2_CK' | 'STEP_3' | 'ABIM';
  assessments: { id: string; source: string; label: string; score: number; takenAt: string }[];
  signals: Awaited<ReturnType<typeof getPredictorSignals>>;
  outcome: { score: number | null; passed: boolean; takenAt: Date } | null;
  setupPending: boolean;
  estimate: ReturnType<typeof estimateScore>;
};

/** A dark hero card for the page's single most important message, like the Overview's Study Guide card. */
const HeroNotice = ({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) => (
  <div className="rounded-2xl bg-[#000C3F] p-6 sm:p-8">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C46B10]">{kicker}</p>
        <h2 className="font-[family-name:var(--font-display)] mt-2 text-xl font-bold text-white">{title}</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">{children}</p>
      </div>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#C46B10]/15 text-[#C46B10]">
        <Sparkles className="size-4" />
      </div>
    </div>
  </div>
);

const PredictorView = ({ exam, assessments: serialized, signals, outcome, setupPending, estimate }: ViewProps) => {
  const scored = isScoredExam(exam);
  const showLogger = scored && !setupPending;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Dashboard</p>
          <h1 className="font-[family-name:var(--font-display)] mt-3 text-3xl font-bold tracking-tight text-[#06005A] dark:text-white sm:text-4xl">
            Score Predictor
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-gray-500 dark:text-gray-400">
            {scored
              ? 'An estimate built from the practice exams you log, shown as a range against the passing standard. A planning tool, not an official score.'
              : 'Your exam reports pass or fail, so there is no three-digit score to predict. Here is how your practice is going.'}
          </p>
        </div>
        <Link
          href="/dashboard/practice"
          className="inline-flex items-center gap-2 rounded-full bg-[#06005A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a0080]"
        >
          <Play className="size-3.5 fill-current" />
          {signals.questionsAnswered === 0 ? 'Start practicing' : 'Continue practicing'}
        </Link>
      </div>

      <div className="mt-8">
        {setupPending && (
          <HeroNotice kicker="Score estimate" title="Practice exam logging is being set up">
            Your score estimate will be available here shortly. In the meantime, your practice signals are below.
          </HeroNotice>
        )}

        {showLogger && isScoredExam(exam) && <EstimateCard exam={exam} estimate={estimate} />}

        {!scored && (
          <HeroNotice
            kicker={exam === 'STEP_1' ? 'Step 1' : 'ABIM'}
            title={exam === 'STEP_1' ? 'Step 1 is pass/fail' : 'ABIM reports pass or fail'}
          >
            {exam === 'STEP_1'
              ? 'Step 1 no longer reports a three-digit score, so any number we gave you would be invented. The goal is a comfortable pass. Use your recent accuracy, your weak areas and your spaced-review results below to judge readiness.'
              : 'The ABIM exam reports a pass or fail outcome, so we do not predict a score. Use your recent accuracy, your weak areas and your spaced-review results below to judge readiness.'}
          </HeroNotice>
        )}
      </div>

      <div className={`mt-6 grid gap-6 ${showLogger ? 'lg:grid-cols-[1.6fr_1fr] lg:items-start' : ''}`}>
        {showLogger && isScoredExam(exam) && (
          <div id="practice-exams" className={`${CARD_CLASS} scroll-mt-24`}>
            <p className="text-sm font-semibold text-[#06005A] dark:text-white">Your practice exams</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Log the three-digit score from each full practice exam. Spreading them over the last several weeks works
              better than clustering them. See{' '}
              <Link
                href="/blog/how-many-nbme-practice-exams-step-2-ck"
                className="font-medium text-[#06005A] hover:underline dark:text-[#C46B10]"
              >
                how many to take and when
              </Link>
              .
            </p>
            <TrendChart
              points={serialized.map((a) => ({ score: a.score, takenAt: a.takenAt }))}
              passing={PASSING_STANDARD[exam]}
            />
            <div className="mt-4">
              <AssessmentLogger assessments={serialized} />
            </div>
          </div>
        )}

        <PracticeSignals signals={signals} wide={!showLogger} />
      </div>

      {!setupPending && (
        <div className={`${CARD_CLASS} mt-6`}>
          <p className="text-sm font-semibold text-[#06005A] dark:text-white">Already taken your exam?</p>
          {outcome ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Thank you. You logged {outcome.score !== null ? `a score of ${outcome.score}` : outcome.passed ? 'a pass' : 'a result'}{' '}
              from{' '}
              {outcome.takenAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}. Real
              results are how this tool gets more accurate over time.
            </p>
          ) : (
            <>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                Optional. Comparing real results with what students practiced is how we will make this estimate more
                accurate over time.
              </p>
              <ExamOutcomeForm scored={scored} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

const PredictorPage = async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const preference = await database.userPreference.findUnique({ where: { clerkUserId: userId } });
  if (!preference) return null;

  const exam = preference.exam;
  const scored = isScoredExam(exam);

  let setupPending = false;
  const guard = async <T,>(run: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await run();
    } catch (error) {
      if (!isMissingTable(error)) throw error;
      setupPending = true;
      return fallback;
    }
  };

  const [signals, assessments, outcome] = await Promise.all([
    getPredictorSignals(userId, exam),
    scored ? guard(() => listPracticeAssessments(userId, exam), []) : Promise.resolve([]),
    guard(() => getLatestExamOutcome(userId, exam), null),
  ]);

  const estimate = isScoredExam(exam) ? estimateScore(exam, assessments) : null;
  const serialized = assessments.map((a) => ({
    id: a.id,
    source: a.source,
    label: a.label,
    score: a.score,
    takenAt: a.takenAt.toISOString(),
  }));

  return (
    <PredictorView
      exam={exam}
      assessments={serialized}
      signals={signals}
      outcome={outcome}
      setupPending={setupPending}
      estimate={estimate}
    />
  );
};

export default PredictorPage;
