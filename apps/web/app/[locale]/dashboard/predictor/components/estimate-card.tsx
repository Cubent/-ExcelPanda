import { ArrowDownRight, ArrowUpRight, Info } from 'lucide-react';
import type { Confidence, ScoreEstimate } from '@/lib/score-predictor';

const CARD_CLASS =
  'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#120A2E]';

const CONFIDENCE_COPY: Record<Confidence, { label: string; detail: string }> = {
  low: { label: 'Low confidence', detail: 'Based on one exam, or an exam that is no longer recent. Log another to tighten the range.' },
  medium: { label: 'Medium confidence', detail: 'Based on two recent exams. A third will narrow the picture.' },
  higher: { label: 'Higher confidence', detail: 'Based on three or more recent exams.' },
};

const examName = (exam: 'STEP_2_CK' | 'STEP_3') => (exam === 'STEP_2_CK' ? 'Step 2 CK' : 'Step 3');

const marginSentence = (e: ScoreEstimate) => {
  const pass = e.passingStandard;
  if (e.marginAtLow >= 0) {
    return `Even the low end of your range is ${e.marginAtLow} point${e.marginAtLow === 1 ? '' : 's'} above the passing standard (${pass}).`;
  }
  if (e.marginAtCenter >= 0) {
    return `Your estimate is ${e.marginAtCenter} point${e.marginAtCenter === 1 ? '' : 's'} above the passing standard (${pass}), but the low end of your range falls ${Math.abs(e.marginAtLow)} below it.`;
  }
  return `Your estimate is ${Math.abs(e.marginAtCenter)} point${Math.abs(e.marginAtCenter) === 1 ? '' : 's'} below the passing standard (${pass}). Use this to adjust your plan, not as a verdict.`;
};

export const EstimateCard = ({
  exam,
  estimate,
}: {
  exam: 'STEP_2_CK' | 'STEP_3';
  estimate: ScoreEstimate | null;
}) => {
  if (!estimate) {
    return (
      <div className={CARD_CLASS}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
          {examName(exam)} score estimate
        </p>
        <h2 className="font-[family-name:var(--font-display)] mt-2 text-2xl font-bold text-[#06005A] dark:text-white">
          Log a practice exam to get your estimate
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Add the three-digit score from an NBME form, UWSA or the Free 120 below. We turn your recent results into a
          range and show how it sits against the passing standard. Two or three exams, spaced over several weeks, give
          the most useful picture.
        </p>
      </div>
    );
  }

  const conf = CONFIDENCE_COPY[estimate.confidence];
  const trend = estimate.trendPer14Days;

  return (
    <div className={CARD_CLASS}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
        {examName(exam)} score estimate
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
        <p className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-[#06005A] dark:text-white">
          {estimate.low}
          <span className="px-1 text-gray-400 dark:text-gray-500">&ndash;</span>
          {estimate.high}
        </p>
        <p className="pb-1 text-sm text-gray-500 dark:text-gray-400">
          centered on <span className="font-semibold text-[#06005A] dark:text-white">{estimate.center}</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-[#06005A]/10 px-3 py-1 text-[#06005A] dark:bg-white/10 dark:text-white">
          {conf.label}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600 dark:bg-white/10 dark:text-gray-300">
          {estimate.usedCount} exam{estimate.usedCount === 1 ? '' : 's'} used
        </span>
        {trend !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
              trend >= 0
                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                : 'bg-[#C46B10]/10 text-[#C46B10]'
            }`}
          >
            {trend >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {trend >= 0 ? '+' : '−'}
            {Math.abs(trend)} points per 2 weeks
          </span>
        )}
      </div>

      <p className="mt-5 text-sm leading-relaxed text-gray-700 dark:text-gray-200">{marginSentence(estimate)}</p>

      {estimate.percentileAtCenter !== null && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          At the center of your range, that is roughly the {estimate.percentileAtCenter}
          {ordinalSuffix(estimate.percentileAtCenter)} percentile among first-time US MD examinees. This uses a normal
          approximation (mean about 250, SD about 15), not an official USMLE conversion.
        </p>
      )}

      {estimate.stale && (
        <p className="mt-4 rounded-xl bg-[#C46B10]/10 px-4 py-3 text-sm text-[#8a4a0b] dark:text-[#e8a35a]">
          Your most recent exam was {estimate.daysSinceLatest} days ago, so this may no longer reflect where you are.
          Take a fresh one for a current estimate.
        </p>
      )}

      <p className="mt-4 flex gap-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <span>
          {conf.detail} Practice exams are imperfect predictors, so this range is intentionally wide. Passing standards
          change; confirm the current number on USMLE.org.
        </span>
      </p>
    </div>
  );
};

const ordinalSuffix = (n: number) => {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};
