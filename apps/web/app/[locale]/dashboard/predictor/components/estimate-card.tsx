import { ArrowDownRight, ArrowUpRight, Gauge, Info, Sparkles } from 'lucide-react';
import type { Confidence, ScoreEstimate } from '@/lib/score-predictor';
import { RangeBar } from './range-bar';

const CONFIDENCE_COPY: Record<Confidence, { label: string; detail: string }> = {
  low: { label: 'Low confidence', detail: 'Based on one exam, or an exam that is no longer recent. Log another to tighten the range.' },
  medium: { label: 'Medium confidence', detail: 'Based on two recent exams. A third will narrow the picture.' },
  higher: { label: 'Higher confidence', detail: 'Based on three or more recent exams.' },
};

const examName = (exam: 'STEP_2_CK' | 'STEP_3') => (exam === 'STEP_2_CK' ? 'Step 2 CK' : 'Step 3');

const plural = (n: number) => (n === 1 ? '' : 's');

const marginSentence = (e: ScoreEstimate) => {
  const pass = e.passingStandard;
  if (e.marginAtLow >= 0) {
    return `Even the low end of your range is ${e.marginAtLow} point${plural(e.marginAtLow)} above the passing standard (${pass}).`;
  }
  if (e.marginAtCenter >= 0) {
    return `Your estimate is ${e.marginAtCenter} point${plural(e.marginAtCenter)} above the passing standard (${pass}), but the low end of your range falls ${Math.abs(e.marginAtLow)} below it.`;
  }
  return `Your estimate is ${Math.abs(e.marginAtCenter)} point${plural(Math.abs(e.marginAtCenter))} below the passing standard (${pass}). Use this to adjust your plan, not as a verdict.`;
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

export const EstimateCard = ({
  exam,
  estimate,
}: {
  exam: 'STEP_2_CK' | 'STEP_3';
  estimate: ScoreEstimate | null;
}) => {
  if (!estimate) {
    return (
      <div className="rounded-2xl bg-[#000C3F] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C46B10]">
              {examName(exam)} score estimate
            </p>
            <h2 className="font-[family-name:var(--font-display)] mt-2 text-xl font-bold text-white">
              Log a practice exam to get your estimate
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
              Add the three-digit score from an NBME form, UWSA or the Free 120. We turn your recent results into a range
              and show where it sits against the passing standard. Two or three exams, spaced over several weeks, give the
              most useful picture.
            </p>
            <a href="#practice-exams" className="mt-3 inline-block text-xs font-medium text-[#C46B10] hover:underline">
              Add your first practice exam &darr;
            </a>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#C46B10]/15 text-[#C46B10]">
            <Sparkles className="size-4" />
          </div>
        </div>
      </div>
    );
  }

  const conf = CONFIDENCE_COPY[estimate.confidence];
  const trend = estimate.trendPer14Days;

  return (
    <div className="rounded-2xl bg-[#000C3F] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C46B10]">
            {examName(exam)} score estimate
          </p>
          <h2 className="font-[family-name:var(--font-display)] mt-2 text-5xl font-bold tracking-tight text-white">
            {estimate.low}
            <span className="px-1 text-white/40">&ndash;</span>
            {estimate.high}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            centered on <span className="font-semibold text-white">{estimate.center}</span>
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#C46B10]/15 text-[#C46B10]">
          <Gauge className="size-4" />
        </div>
      </div>

      <RangeBar low={estimate.low} high={estimate.high} center={estimate.center} passing={estimate.passingStandard} />

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-white/10 px-3 py-1 text-white">{conf.label}</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-white/70">
          {estimate.usedCount} exam{plural(estimate.usedCount)} used
        </span>
        {trend !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
              trend >= 0 ? 'bg-green-400/15 text-green-300' : 'bg-[#C46B10]/20 text-[#e8a35a]'
            }`}
          >
            {trend >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {trend >= 0 ? '+' : '−'}
            {Math.abs(trend)} points per 2 weeks
          </span>
        )}
      </div>

      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/85">{marginSentence(estimate)}</p>

      {estimate.percentileAtCenter !== null && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
          At the center of your range, that is roughly the {estimate.percentileAtCenter}
          {ordinalSuffix(estimate.percentileAtCenter)} percentile among first-time US MD examinees. This uses a normal
          approximation (mean about 250, SD about 15), not an official USMLE conversion.
        </p>
      )}

      {estimate.stale && (
        <p className="mt-4 max-w-2xl rounded-xl bg-[#C46B10]/15 px-4 py-3 text-sm text-[#e8a35a]">
          Your most recent exam was {estimate.daysSinceLatest} days ago, so this may no longer reflect where you are. Take
          a fresh one for a current estimate.
        </p>
      )}

      <p className="mt-5 flex max-w-2xl gap-2 text-xs leading-relaxed text-white/50">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <span>
          {conf.detail} Practice exams are imperfect predictors, so this range is intentionally wide. Passing standards
          change; confirm the current number on USMLE.org.
        </span>
      </p>
    </div>
  );
};
