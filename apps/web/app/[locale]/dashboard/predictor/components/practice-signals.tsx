import Link from 'next/link';
import type { getPredictorSignals } from '@repo/database/qbank';

type Signals = Awaited<ReturnType<typeof getPredictorSignals>>;

const CARD_CLASS =
  'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#120A2E]';

const KICKER = 'text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400';
const BIG = 'mt-2 text-3xl font-bold text-[#06005A] dark:text-white';
const HELP = 'mt-1 text-xs text-gray-500 dark:text-gray-400';

/** Same rule as the Topic accuracy bars on the Overview: green at 50% or better, brand orange below. */
const barColor = (pct: number) => (pct >= 50 ? 'bg-green-500' : 'bg-[#C46B10]');

/** `wide` lays the two cards side by side when there is no logger column next to them (pass/fail exams). */
export const PracticeSignals = ({ signals, wide = false }: { signals: Signals; wide?: boolean }) => {
  const { recent, changeVsPriorPct, review, weakestSystems, windowDays, questionsAnswered } = signals;

  return (
    <div className={wide ? 'grid gap-6 lg:grid-cols-2 lg:items-start' : 'flex flex-col gap-6'}>
      <div className={CARD_CLASS}>
        <p className="text-sm font-semibold text-[#06005A] dark:text-white">How your MedPrep practice is going</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          Real numbers from your own answers. We do not convert them into a score: MedPrep&apos;s questions are not
          calibrated to the real exam&apos;s scoring, so an accuracy-to-score formula would be a guess.
        </p>

        {recent.total === 0 ? (
          <p className="mt-5 text-sm text-gray-600 dark:text-gray-300">
            No answers in the last {windowDays} days.{' '}
            <Link href="/dashboard/practice" className="font-semibold text-[#06005A] hover:underline dark:text-[#C46B10]">
              Start a set
            </Link>{' '}
            to see your signals, or{' '}
            <Link href="/dashboard/predictor?sample=rising" className="font-semibold text-[#06005A] hover:underline dark:text-[#C46B10]">
              see an example with sample data
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className={KICKER}>Accuracy</p>
              <p className={BIG}>{recent.pct}%</p>
              <p className={HELP}>
                Last {windowDays} days &middot; {recent.total} questions
                {changeVsPriorPct !== null && (
                  <>
                    {' '}
                    &middot;{' '}
                    <span className={changeVsPriorPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-[#C46B10]'}>
                      {changeVsPriorPct >= 0 ? '+' : '−'}
                      {Math.abs(changeVsPriorPct)} pts
                    </span>{' '}
                    vs prior
                  </>
                )}
              </p>
            </div>
            <div>
              <p className={KICKER}>Spaced review</p>
              <p className={BIG}>{review.hasData ? `${review.pct}%` : '—'}</p>
              <p className={HELP}>{review.hasData ? `${review.total} reviews answered` : 'No reviews answered yet'}</p>
            </div>
            <div className="col-span-2 border-t border-gray-100 pt-4 dark:border-white/5">
              <p className={KICKER}>Questions answered</p>
              <p className="mt-1 text-xl font-bold text-[#06005A] dark:text-white">{questionsAnswered}</p>
              <p className={HELP}>All time, this exam</p>
            </div>
          </div>
        )}
      </div>

      {weakestSystems.length > 0 && (
        <div className={CARD_CLASS}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#06005A] dark:text-white">Weakest areas right now</p>
            <Link href="/dashboard/topics" className="text-sm font-medium text-[#06005A] hover:underline dark:text-[#C46B10]">
              Focus topics &rarr;
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {weakestSystems.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#06005A] dark:text-white">{s.name}</span>
                  <span className="shrink-0 text-gray-500 dark:text-gray-400">
                    {s.accuracyPct}% &middot; {s.attempts} questions
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                  <div className={`h-full rounded-full ${barColor(s.accuracyPct)}`} style={{ width: `${s.accuracyPct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
