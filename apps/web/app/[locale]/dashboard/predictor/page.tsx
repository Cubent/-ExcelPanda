import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { getLatestExamOutcome, getPredictorSignals, listPracticeAssessments } from '@repo/database/qbank';
import { Play, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { estimateScore, isScoredExam, PASSING_STANDARD } from '@/lib/score-predictor';
import { getSample, isSampleName, SAMPLE_LABELS, SAMPLE_SCENARIOS, type SampleName } from '@/lib/score-predictor.sample';
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
  /** When set, the page shows read-only sample data and nothing can be logged or saved. */
  sample?: SampleName;
  /** 'requested' = the user opened ?sample=; 'setup' = the logging tables are not available yet. */
  sampleReason?: 'requested' | 'setup';
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

const SampleBanner = ({
  exam,
  current,
  reason,
}: {
  exam: ViewProps['exam'];
  current: SampleName;
  reason: 'requested' | 'setup';
}) => (
  <div className="mb-6 rounded-xl border border-[#C46B10]/40 bg-[#C46B10]/10 p-4 text-sm text-[#8a4a0b] dark:text-[#e8a35a]">
    {reason === 'setup' ? (
      <>
        <p className="font-semibold">Practice exam logging is being set up.</p>
        <p className="mt-1">
          You are seeing sample data so you can preview this page. These are example numbers, not your results, and your
          own estimate will appear here once logging is available.
        </p>
      </>
    ) : (
      <>
        <p className="font-semibold">Sample data: these are example numbers, not your results.</p>
        <p className="mt-1">Nothing here is saved. Log your own practice exams to replace it.</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link href="/dashboard/predictor" className="font-bold underline">
            Back to my data
          </Link>
          {isScoredExam(exam) &&
            SAMPLE_SCENARIOS.map((name) => (
              <Link
                key={name}
                href={`/dashboard/predictor?sample=${name}`}
                className={name === current ? 'font-bold underline' : 'underline'}
              >
                {SAMPLE_LABELS[name]}
              </Link>
            ))}
        </p>
      </>
    )}
  </div>
);

/** Read-only list used in sample mode, so the logging form can never write against sample numbers. */
const SampleExamList = ({ assessments }: { assessments: ViewProps['assessments'] }) => (
  <ul className="divide-y divide-gray-100 dark:divide-white/10">
    {assessments.map((a) => (
      <li key={a.id} className="flex items-center justify-between gap-3 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#06005A] dark:text-white">{a.label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(a.takenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
          </p>
        </div>
        <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[#06005A] dark:text-white">{a.score}</span>
      </li>
    ))}
  </ul>
);

const PredictorView = ({ exam, assessments: serialized, signals, outcome, setupPending, estimate, sample, sampleReason = 'requested' }: ViewProps) => {
  const scored = isScoredExam(exam);
  const showLogger = scored && !setupPending;

  return (
    <div>
      {sample && <SampleBanner exam={exam} current={sample} reason={sampleReason} />}

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

      {/* flex + gap so any stack of hero cards is always spaced apart */}
      <div className="mt-8 flex flex-col gap-6">
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
              {sample ? <SampleExamList assessments={serialized} /> : <AssessmentLogger assessments={serialized} />}
            </div>
          </div>
        )}

        <PracticeSignals signals={signals} wide={!showLogger} />
      </div>

      {!setupPending && !sample && (
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

/** Read-only sample data for this user's exam. Never reads or writes their own records. */
const sampleView = (exam: ViewProps['exam'], name: SampleName, reason: 'requested' | 'setup') => {
  const { assessments, signals } = getSample(name, exam);
  const estimate = isScoredExam(exam) ? estimateScore(exam, assessments) : null;
  return (
    <PredictorView
      exam={exam}
      assessments={assessments.map((a) => ({ ...a, takenAt: a.takenAt.toISOString() }))}
      signals={signals}
      outcome={null}
      setupPending={false}
      estimate={estimate}
      sample={name}
      sampleReason={reason}
    />
  );
};

// No default for the props object: Next's build-time page type check rejects an `| undefined` first parameter.
const PredictorPage = async ({ searchParams }: { searchParams?: Promise<{ sample?: string }> }) => {
  const { userId } = await auth();
  if (!userId) return null;

  const preference = await database.userPreference.findUnique({ where: { clerkUserId: userId } });
  if (!preference) return null;

  const exam = preference.exam;
  const scored = isScoredExam(exam);

  // ?sample=<name> shows read-only example data. It sits after the auth and
  // exam checks, and the dashboard layout's own gates run before this page, so
  // it is only ever shown to a signed-in user who is allowed to be here.
  const requested = (await searchParams)?.sample;
  if (isSampleName(requested)) return sampleView(exam, requested, 'requested');

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

  // The logging tables ship in a migration applied separately from the code deploy. Until it
  // lands, a student on a scored exam gets a clearly labelled sample instead of an empty page.
  // Pass/fail exams have no estimate to preview, so they just lose the optional result form.
  if (setupPending && scored) return sampleView(exam, 'rising', 'setup');

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
