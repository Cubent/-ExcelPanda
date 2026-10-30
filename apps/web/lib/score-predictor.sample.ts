import { PASSING_STANDARD, type ScoredExam, isScoredExam } from './score-predictor';

/**
 * Sample data for /dashboard/predictor?sample=<name>. Shown only on request, only
 * to a signed-in user who already passed the dashboard's gates, and never saved.
 * It exists so the page is understandable before someone has logged an exam.
 */
export const SAMPLE_SCENARIOS = ['rising', 'borderline', 'stale'] as const;
export type SampleName = (typeof SAMPLE_SCENARIOS)[number];

export const SAMPLE_LABELS: Record<SampleName, string> = {
  rising: 'Improving',
  borderline: 'Close to the line',
  stale: 'Out of date',
};

type Exam = 'STEP_1' | 'STEP_2_CK' | 'STEP_3' | 'ABIM';

export type SampleSignals = {
  windowDays: number;
  questionsAnswered: number;
  recent: { pct: number; correct: number; total: number };
  changeVsPriorPct: number | null;
  review: { pct: number; correct: number; total: number; hasData: boolean };
  weakestSystems: { name: string; attempts: number; accuracyPct: number }[];
};

export type SampleAssessment = { id: string; source: string; label: string; score: number; takenAt: Date };

export const isSampleName = (value: unknown): value is SampleName =>
  typeof value === 'string' && (SAMPLE_SCENARIOS as readonly string[]).includes(value);

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

const HEALTHY: SampleSignals = {
  windowDays: 30,
  questionsAnswered: 842,
  recent: { pct: 71, correct: 355, total: 500 },
  changeVsPriorPct: 6,
  review: { pct: 66, correct: 99, total: 150, hasData: true },
  weakestSystems: [
    { name: 'Biostatistics & Epidemiology', attempts: 14, accuracyPct: 48 },
    { name: 'Cardiovascular', attempts: 22, accuracyPct: 55 },
    { name: 'Renal', attempts: 17, accuracyPct: 61 },
  ],
};

/**
 * Step 2 CK scores are the template. Step 3 sample scores are shifted so they sit
 * the same distance from that exam's own passing standard, so the story each
 * scenario tells is the same for both exams.
 */
const CK_SCORES: Record<SampleName, { age: number; score: number; source: string; label: string }[]> = {
  rising: [
    { age: 30, score: 226, source: 'NBME', label: 'NBME 10' },
    { age: 16, score: 236, source: 'UWSA', label: 'UWSA 1' },
    { age: 3, score: 247, source: 'NBME', label: 'NBME 12' },
  ],
  borderline: [{ age: 5, score: 221, source: 'NBME', label: 'NBME 11' }],
  stale: [{ age: 70, score: 244, source: 'UWSA', label: 'UWSA 2' }],
};

export const getSample = (name: SampleName, exam: Exam) => {
  const signals: SampleSignals =
    name === 'borderline'
      ? { ...HEALTHY, recent: { pct: 52, correct: 130, total: 250 }, changeVsPriorPct: -3 }
      : HEALTHY;

  let assessments: SampleAssessment[] = [];
  if (isScoredExam(exam)) {
    const scoredExam: ScoredExam = exam;
    const shift = PASSING_STANDARD[scoredExam] - PASSING_STANDARD.STEP_2_CK;
    assessments = CK_SCORES[name]
      .map((a, i) => ({
        id: `sample-${name}-${i}`,
        source: a.source,
        label: scoredExam === 'STEP_2_CK' ? a.label : `Practice exam ${CK_SCORES[name].length - i}`,
        score: a.score + shift,
        takenAt: daysAgo(a.age),
      }))
      .sort((x, y) => y.takenAt.getTime() - x.takenAt.getTime());
  }
  return { assessments, signals };
};
