import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const findPreference = vi.fn();
const getPredictorSignals = vi.fn();
const listPracticeAssessments = vi.fn();
const getLatestExamOutcome = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({ auth: () => authMock() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@repo/database', () => ({ database: { userPreference: { findUnique: (a: unknown) => findPreference(a) } } }));
vi.mock('@repo/database/qbank', () => ({
  getPredictorSignals: (...a: unknown[]) => getPredictorSignals(...a),
  listPracticeAssessments: (...a: unknown[]) => listPracticeAssessments(...a),
  getLatestExamOutcome: (...a: unknown[]) => getLatestExamOutcome(...a),
}));

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const signals = {
  windowDays: 30,
  questionsAnswered: 80,
  recent: { pct: 68, correct: 34, total: 50 },
  changeVsPriorPct: null,
  review: { pct: 0, correct: 0, total: 0, hasData: false },
  weakestSystems: [],
};

const render = async () => {
  const { default: Page } = await import('../app/[locale]/dashboard/predictor/page');
  return renderToStaticMarkup(await Page());
};

describe('Score Predictor page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authMock.mockResolvedValue({ userId: 'user_1' });
    getPredictorSignals.mockResolvedValue(signals);
    getLatestExamOutcome.mockResolvedValue(null);
  });

  it('renders nothing for signed-out users', async () => {
    authMock.mockResolvedValue({ userId: null });
    expect(await render()).toBe('');
  });

  it('Step 2 CK with logged exams: estimate, chart, logger form and outcome form', async () => {
    findPreference.mockResolvedValue({ exam: 'STEP_2_CK' });
    listPracticeAssessments.mockResolvedValue([
      { id: 'a2', source: 'UWSA', label: 'UWSA 2', score: 246, takenAt: daysAgo(3) },
      { id: 'a1', source: 'NBME', label: 'NBME 12', score: 236, takenAt: daysAgo(18) },
    ]);
    const html = await render();
    expect(html).toContain('Score Predictor');
    expect(html).toContain('Step 2 CK score estimate');
    expect(html).toContain('passing standard (218)');
    expect(html).toContain('role="img"'); // trend chart (2 exams)
    expect(html).toContain('UWSA 2');
    expect(html).toContain('NBME 12');
    expect(html).toContain('Add practice exam');
    expect(html).toContain('How your MedPrep practice is going');
    expect(html).toContain('Already taken your exam?');
    expect(html).toContain('Save my result');
    expect(html).not.toContain('NaN');
    expect(html).not.toContain('undefined');
  });

  it('Step 2 CK with nothing logged: empty state and no chart', async () => {
    findPreference.mockResolvedValue({ exam: 'STEP_2_CK' });
    listPracticeAssessments.mockResolvedValue([]);
    const html = await render();
    expect(html).toContain('Log a practice exam to get your estimate');
    expect(html).not.toContain('role="img"');
  });

  it('Step 1 is pass/fail: no score estimate and no exam logger', async () => {
    findPreference.mockResolvedValue({ exam: 'STEP_1' });
    const html = await render();
    expect(html).toContain('Step 1 is pass/fail');
    expect(html).not.toContain('score estimate');
    expect(html).not.toContain('Add practice exam');
    expect(listPracticeAssessments).not.toHaveBeenCalled();
    expect(html).toContain('How your MedPrep practice is going');
  });

  it('ABIM is pass/fail too', async () => {
    findPreference.mockResolvedValue({ exam: 'ABIM' });
    const html = await render();
    expect(html).toContain('ABIM reports pass or fail');
    expect(html).not.toContain('Add practice exam');
  });

  it('thanks the user instead of re-asking once an outcome is logged', async () => {
    findPreference.mockResolvedValue({ exam: 'STEP_2_CK' });
    listPracticeAssessments.mockResolvedValue([]);
    getLatestExamOutcome.mockResolvedValue({ id: 'o1', score: 247, passed: true, takenAt: daysAgo(10) });
    const html = await render();
    expect(html).toContain('a score of 247');
    expect(html).not.toContain('Save my result');
  });

  it('degrades gracefully, without erroring, when the migration has not been applied yet', async () => {
    findPreference.mockResolvedValue({ exam: 'STEP_2_CK' });
    const missing = Object.assign(new Error('The table `public.practice_assessments` does not exist'), { code: 'P2021' });
    listPracticeAssessments.mockRejectedValue(missing);
    getLatestExamOutcome.mockRejectedValue(missing);
    const html = await render();
    expect(html).toContain('Practice exam logging is being set up');
    expect(html).toContain('How your MedPrep practice is going');
    expect(html).not.toContain('Add practice exam');
    expect(html).not.toContain('Save my result');
  });

  it('still surfaces unrelated database errors instead of hiding them', async () => {
    findPreference.mockResolvedValue({ exam: 'STEP_2_CK' });
    listPracticeAssessments.mockRejectedValue(Object.assign(new Error('connection lost'), { code: 'P1001' }));
    await expect(render()).rejects.toThrow('connection lost');
  });
});
