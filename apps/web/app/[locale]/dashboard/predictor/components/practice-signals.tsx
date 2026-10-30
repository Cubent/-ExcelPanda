import Link from 'next/link';
import type { getPredictorSignals } from '@repo/database/qbank';

type Signals = Awaited<ReturnType<typeof getPredictorSignals>>;

const CARD_CLASS =
  'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#120A2E]';

const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
    <p className="font-[family-name:var(--font-display)] mt-1 text-3xl font-bold text-[#06005A] dark:text-white">{value}</p>
    {sub && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{sub}</p>}
  </div>
);

export const PracticeSignals = ({ signals }: { signals: Signals }) => {
  const { recent, changeVsPriorPct, review, weakestSystems, windowDays, questionsAnswered } = signals;

  return (
    <div className={CARD_CLASS}>
      <p className="text-sm font-semibold text-[#06005A] dark:text-white">How your MedPrep practice is going</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        Real numbers from your own answers. We do not convert them into a score: MedPrep&apos;s questions are not calibrated
        to the real exam&apos;s scoring, so an accuracy-to-score formula would be a guess.
      </p>

      {recent.total === 0 ? (
        <p className="mt-5 text-sm text-gray-600 dark:text-gray-300">
          No answers in the last {windowDays} days.{' '}
          <Link href="/dashboard/practice" className="font-semibold text-[#06005A] hover:underline dark:text-[#C46B10]">
            Start a set
          </Link>{' '}
          to see your signals.
        </p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-3">
            <Stat
              label={`Accuracy, last ${windowDays} days`}
              value={`${recent.pct}%`}
              sub={
                changeVsPriorPct === null
                  ? `${recent.total} questions`
                  : `${recent.total} questions · ${changeVsPriorPct >= 0 ? '+' : '−'}${Math.abs(changeVsPriorPct)} pts vs prior ${windowDays} days`
              }
            />
            <Stat
              label="Spaced-review accuracy"
              value={review.hasData ? `${review.pct}%` : '—'}
              sub={review.hasData ? `${review.total} reviews` : 'No reviews answered yet'}
            />
            <Stat label="Questions answered" value={String(questionsAnswered)} sub="All time, this exam" />
          </div>

          {weakestSystems.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Weakest areas right now</p>
              <ul className="mt-2 space-y-2">
                {weakestSystems.map((s) => (
                  <li key={s.name} className="flex items-center justify-between text-sm">
                    <span className="text-[#06005A] dark:text-white">{s.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {s.accuracyPct}% over {s.attempts} questions
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/topics"
                className="mt-3 inline-block text-sm font-medium text-[#06005A] hover:underline dark:text-[#C46B10]"
              >
                Focus these topics &rarr;
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};
