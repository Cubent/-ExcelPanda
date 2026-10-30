/**
 * Mock data for /dashboard/predictor, used only when debugBypass() is on.
 * Pick a scenario with /dashboard/predictor?mock=<name>.
 */
export type MockExam = 'STEP_1' | 'STEP_2_CK' | 'STEP_3' | 'ABIM';

type MockAssessment = { id: string; source: string; label: string; score: number; takenAt: Date };

export type MockSignals = {
  windowDays: number;
  questionsAnswered: number;
  recent: { pct: number; correct: number; total: number };
  changeVsPriorPct: number | null;
  review: { pct: number; correct: number; total: number; hasData: boolean };
  weakestSystems: { name: string; attempts: number; accuracyPct: number }[];
};

export type MockScenario = {
  exam: MockExam;
  assessments: MockAssessment[];
  signals: MockSignals;
  outcome: { id: string; score: number | null; passed: boolean; takenAt: Date } | null;
  setupPending: boolean;
};

export const MOCK_SCENARIOS = ['rising', 'borderline', 'stale', 'empty', 'step3', 'step1', 'abim', 'outcome', 'setup'] as const;
export type MockName = (typeof MOCK_SCENARIOS)[number];

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

const healthySignals: MockSignals = {
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

const quietSignals: MockSignals = {
  windowDays: 30,
  questionsAnswered: 0,
  recent: { pct: 0, correct: 0, total: 0 },
  changeVsPriorPct: null,
  review: { pct: 0, correct: 0, total: 0, hasData: false },
  weakestSystems: [],
};

const ck = (id: string, source: string, label: string, score: number, age: number): MockAssessment => ({
  id,
  source,
  label,
  score,
  takenAt: daysAgo(age),
});

export const getMockScenario = (name: string | undefined): { name: MockName; data: MockScenario } => {
  const picked: MockName = (MOCK_SCENARIOS as readonly string[]).includes(name ?? '') ? (name as MockName) : 'rising';

  const base: MockScenario = {
    exam: 'STEP_2_CK',
    assessments: [],
    signals: healthySignals,
    outcome: null,
    setupPending: false,
  };

  const rising = [
    ck('m3', 'NBME', 'NBME 12', 247, 3),
    ck('m2', 'UWSA', 'UWSA 1', 236, 16),
    ck('m1', 'NBME', 'NBME 10', 226, 30),
  ];

  switch (picked) {
    case 'borderline':
      return {
        name: picked,
        data: {
          ...base,
          assessments: [ck('b1', 'NBME', 'NBME 11', 221, 5)],
          signals: { ...healthySignals, recent: { pct: 52, correct: 130, total: 250 }, changeVsPriorPct: -3 },
        },
      };
    case 'stale':
      return { name: picked, data: { ...base, assessments: [ck('s1', 'UWSA', 'UWSA 2', 244, 70)] } };
    case 'empty':
      return { name: picked, data: { ...base, signals: quietSignals } };
    case 'step3':
      return {
        name: picked,
        data: { ...base, exam: 'STEP_3', assessments: [ck('t2', 'NBME', 'Step 3 practice 2', 211, 4), ck('t1', 'NBME', 'Step 3 practice 1', 204, 18)] },
      };
    case 'step1':
      return { name: picked, data: { ...base, exam: 'STEP_1' } };
    case 'abim':
      return { name: picked, data: { ...base, exam: 'ABIM' } };
    case 'outcome':
      return {
        name: picked,
        data: { ...base, assessments: rising, outcome: { id: 'o1', score: 249, passed: true, takenAt: daysAgo(10) } },
      };
    case 'setup':
      return { name: picked, data: { ...base, setupPending: true } };
    default:
      return { name: 'rising', data: { ...base, assessments: rising } };
  }
};
