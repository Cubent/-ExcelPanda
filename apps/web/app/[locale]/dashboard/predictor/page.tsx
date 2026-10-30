import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { getLatestExamOutcome, getPredictorSignals, listPracticeAssessments } from '@repo/database/qbank';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { debugBypass } from '@/lib/debug-bypass';
import { getMockScenario, MOCK_SCENARIOS } from '@/lib/score-predictor.mock';
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
  debugBanner?: ReactNode;
};

const PredictorView = ({ exam, assessments: serialized, signals, outcome, setupPending, estimate, debugBanner }: ViewProps) => {
  const scored = isScoredExam(exam);
  return (
    <div>
      {debugBanner}
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">Dashboard</p>
      <h1 className="font-[family-name:var(--font-display)] mt-3 text-3xl font-bold tracking-tight text-[#06005A] dark:text-white sm:text-4xl">
        Score Predictor
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
        {scored
          ? 'An estimate built from the practice exams you log, shown as a range against the passing standard. It is a planning tool, not an official score.'
          : 'Your exam reports pass or fail, so there is no three-digit score to predict. Here is how your practice is going.'}
      </p>

      <div className="mt-8 max-w-3xl space-y-6">
        {setupPending && (
          <div className={CARD_CLASS}>
            <p className="text-sm font-semibold text-[#06005A] dark:text-white">Practice exam logging is being set up</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Your score estimate will be available here shortly. In the meantime, your practice signals are below.
            </p>
          </div>
        )}

        {scored && !setupPending && (
          <>
            <EstimateCard exam={exam} estimate={estimate} />

            <div className={CARD_CLASS}>
              <p className="text-sm font-semibold text-[#06005A] dark:text-white">Your practice exams</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                Log the three-digit score from each full practice exam. Spreading them over the last several weeks works
                better than clustering them. See{' '}
                <Link href="/blog/how-many-nbme-practice-exams-step-2-ck" className="font-medium underline">
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
          </>
        )}

        {!scored && (
          <div className={CARD_CLASS}>
            <p className="text-sm font-semibold text-[#06005A] dark:text-white">
              {exam === 'STEP_1' ? 'Step 1 is pass/fail' : 'ABIM reports pass or fail'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {exam === 'STEP_1'
                ? 'Step 1 no longer reports a three-digit score, so any number we gave you would be invented. The goal is a comfortable pass. Use your recent accuracy, your weak areas and your spaced-review results below to judge readiness.'
                : 'The ABIM exam reports a pass or fail outcome, so we do not predict a score. Use your recent accuracy, your weak areas and your spaced-review results below to judge readiness.'}
            </p>
          </div>
        )}

        <PracticeSignals signals={signals} />

        {!setupPending && (
        <div className={CARD_CLASS}>
          <p className="text-sm font-semibold text-[#06005A] dark:text-white">Already taken your exam?</p>
          {outcome ? (
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Thank you. You logged {outcome.score !== null ? `a score of ${outcome.score}` : outcome.passed ? 'a pass' : 'a result'}{' '}
              from{' '}
              {outcome.takenAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}. Real results
              are how this tool gets more accurate over time.
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                Optional. Comparing real results with what students practiced is how we will make this estimate more
                accurate over time.
              </p>
              <ExamOutcomeForm scored={scored} />
            </>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

/** LOCAL DEBUGGING ONLY: renders the real view from fixtures in lib/score-predictor.mock.ts. */
const MockPredictor = ({ name }: { name?: string }) => {
  const { name: picked, data } = getMockScenario(name);
  const estimate = isScoredExam(data.exam) ? estimateScore(data.exam, data.assessments) : null;
  return (
    <PredictorView
      exam={data.exam}
      assessments={data.assessments.map((a) => ({ ...a, takenAt: a.takenAt.toISOString() }))}
      signals={data.signals}
      outcome={data.outcome}
      setupPending={data.setupPending}
      estimate={estimate}
      debugBanner={
        <div className="mb-6 rounded-xl border-2 border-dashed border-[#C46B10] bg-[#C46B10]/10 p-4 text-sm text-[#8a4a0b] dark:text-[#e8a35a]">
          <p className="font-semibold">DEBUG: mock data, auth bypassed (scenario: {picked})</p>
          <p className="mt-1">Nothing here is saved, and the forms will fail because there is no signed-in user.</p>
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {MOCK_SCENARIOS.map((m) => (
              <Link key={m} href={`/dashboard/predictor?mock=${m}`} className={m === picked ? 'font-bold underline' : 'underline'}>
                {m}
              </Link>
            ))}
          </p>
        </div>
      }
    />
  );
};

const PredictorPage = async ({ searchParams }: { searchParams?: Promise<{ mock?: string }> } = {}) => {
  // Local debugging only (see lib/debug-bypass.ts): never true in a deployed build.
  if (debugBypass()) {
    const { mock } = (await searchParams) ?? {};
    return <MockPredictor name={mock} />;
  }

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

  const estimate = scored ? estimateScore(exam, assessments) : null;
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
