/**
 * Score estimate for /dashboard/predictor.
 *
 * What this is, and is not: it turns practice-exam scores the USER logged
 * (NBME forms, UWSA, the Free 120, ...) into a range. It never converts
 * MedPrep question accuracy into a three-digit score, because MedPrep's
 * AI-generated vignettes have no validated mapping to real exam scores, and
 * inventing one would give students false precision.
 *
 * Every number below that is a judgement call rather than a published fact is
 * marked TUNABLE. They are deliberately conservative (wide ranges) and should
 * be revisited once enough `ExamOutcome` rows exist to calibrate against.
 */

export type ScoredExam = 'STEP_2_CK' | 'STEP_3';

export type LoggedAssessment = { score: number; takenAt: Date };

/** Exams that report a three-digit score, so a numeric estimate is meaningful. */
export const isScoredExam = (exam: string): exam is ScoredExam => exam === 'STEP_2_CK' || exam === 'STEP_3';

/**
 * Passing standards on the three-digit scale. These change; confirm on
 * USMLE.org. Step 2 CK: 218 for exams on or after 2025-07-01 (was 214).
 * Step 3: 200 for exams on or after 2024-01-01 (was 198). Last verified 2026-10.
 */
export const PASSING_STANDARD: Record<ScoredExam, number> = { STEP_2_CK: 218, STEP_3: 200 };

/**
 * First-time US MD examinee distribution for Step 2 CK, used only for the
 * percentile estimate: mean about 250, SD about 15 (2024 to 2025). It is a
 * normal approximation, not an official USMLE conversion.
 */
const STEP_2_CK_MEAN = 250;
const STEP_2_CK_SD = 15;

export const MIN_SCORE = 1;
export const MAX_SCORE = 300;

/** TUNABLE: only the most recent N logged exams feed the estimate. */
const MAX_ASSESSMENTS_USED = 4;
/** TUNABLE: an exam taken this many days ago counts half as much as one taken today. */
const HALF_LIFE_DAYS = 21;
/** TUNABLE: minimum half-width of the range by number of exams used. A single exam carries several points of error. */
const MIN_HALF_WIDTH_BY_COUNT = { 1: 12, 2: 10, 3: 8 } as const;
/** An estimate older than this is flagged as out of date. */
export const STALE_AFTER_DAYS = 42;

const DAY_MS = 86_400_000;

export type Confidence = 'low' | 'medium' | 'higher';

export type ScoreEstimate = {
  low: number;
  high: number;
  center: number;
  usedCount: number;
  confidence: Confidence;
  daysSinceLatest: number;
  stale: boolean;
  /** Points gained per 14 days across the exams used (OLS slope), or null if there is not enough spread to say. */
  trendPer14Days: number | null;
  passingStandard: number;
  /** center minus passing standard. */
  marginAtCenter: number;
  /** low end of the range minus passing standard; negative means the range reaches below the line. */
  marginAtLow: number;
  /** Step 2 CK only; null for Step 3, where we have no distribution to cite. */
  percentileAtCenter: number | null;
};

export const isValidScore = (score: number) =>
  Number.isInteger(score) && score >= MIN_SCORE && score <= MAX_SCORE;

/** Standard normal CDF via the Abramowitz and Stegun erf approximation (max error about 1.5e-7). */
export const normalCdf = (z: number) => {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const poly =
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  const erf = 1 - poly * Math.exp(-(z * z) / 2);
  return 0.5 * (1 + (z < 0 ? -erf : erf));
};

export const step2CkPercentile = (score: number) => {
  const pct = Math.round(normalCdf((score - STEP_2_CK_MEAN) / STEP_2_CK_SD) * 100);
  return Math.min(99, Math.max(1, pct));
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Ordinary least squares slope of score against time, in points per day. */
const slopePerDay = (points: { score: number; day: number }[]) => {
  const n = points.length;
  const meanX = points.reduce((s, p) => s + p.day, 0) / n;
  const meanY = points.reduce((s, p) => s + p.score, 0) / n;
  const denom = points.reduce((s, p) => s + (p.day - meanX) ** 2, 0);
  if (denom === 0) return null;
  return points.reduce((s, p) => s + (p.day - meanX) * (p.score - meanY), 0) / denom;
};

export const estimateScore = (
  exam: ScoredExam,
  assessments: LoggedAssessment[],
  now: Date = new Date()
): ScoreEstimate | null => {
  const used = assessments
    .filter((a) => isValidScore(a.score) && a.takenAt.getTime() <= now.getTime())
    .sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime())
    .slice(0, MAX_ASSESSMENTS_USED);
  if (used.length === 0) return null;

  const ageDays = (a: LoggedAssessment) => Math.max(0, (now.getTime() - a.takenAt.getTime()) / DAY_MS);

  let weightSum = 0;
  let weighted = 0;
  for (const a of used) {
    const w = 0.5 ** (ageDays(a) / HALF_LIFE_DAYS);
    weightSum += w;
    weighted += w * a.score;
  }
  const center = weighted / weightSum;

  const scores = used.map((a) => a.score);
  const spread = Math.max(...scores) - Math.min(...scores);
  const count = used.length;
  const floor = MIN_HALF_WIDTH_BY_COUNT[Math.min(count, 3) as 1 | 2 | 3];
  const half = Math.max(floor, spread / 2);

  const low = clamp(Math.round(center - half), MIN_SCORE, MAX_SCORE);
  const high = clamp(Math.round(center + half), MIN_SCORE, MAX_SCORE);
  const roundedCenter = Math.round(center);

  const daysSinceLatest = Math.floor(ageDays(used[0]));
  const stale = daysSinceLatest > STALE_AFTER_DAYS;

  let confidence: Confidence = 'low';
  if (count >= 3 && daysSinceLatest <= 21) confidence = 'higher';
  else if (count >= 2 && daysSinceLatest <= STALE_AFTER_DAYS) confidence = 'medium';

  const oldest = used[used.length - 1];
  const spanDays = (used[0].takenAt.getTime() - oldest.takenAt.getTime()) / DAY_MS;
  let trendPer14Days: number | null = null;
  if (count >= 2 && spanDays >= 7) {
    const slope = slopePerDay(used.map((a) => ({ score: a.score, day: a.takenAt.getTime() / DAY_MS })));
    if (slope !== null) trendPer14Days = Math.round(slope * 14 * 10) / 10;
  }

  const passingStandard = PASSING_STANDARD[exam];
  return {
    low,
    high,
    center: roundedCenter,
    usedCount: count,
    confidence,
    daysSinceLatest,
    stale,
    trendPer14Days,
    passingStandard,
    marginAtCenter: roundedCenter - passingStandard,
    marginAtLow: low - passingStandard,
    percentileAtCenter: exam === 'STEP_2_CK' ? step2CkPercentile(roundedCenter) : null,
  };
};
