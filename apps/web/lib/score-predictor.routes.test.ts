import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const findPreference = vi.fn();
const addPracticeAssessment = vi.fn();
const deletePracticeAssessment = vi.fn();
const recordExamOutcome = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({ auth: () => authMock() }));
vi.mock('@repo/database', () => ({ database: { userPreference: { findUnique: (a: unknown) => findPreference(a) } } }));
vi.mock('@repo/database/qbank', () => ({
  MAX_ASSESSMENTS_PER_EXAM: 50,
  addPracticeAssessment: (a: unknown) => addPracticeAssessment(a),
  deletePracticeAssessment: (u: string, id: string) => deletePracticeAssessment(u, id),
  recordExamOutcome: (a: unknown) => recordExamOutcome(a),
}));

const post = (body: unknown) =>
  new Request('http://localhost/api', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
const today = () => new Date().toISOString().slice(0, 10);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
const valid = { source: 'NBME', label: 'NBME 12', score: 238, takenAt: today() };

describe('POST /api/dashboard/assessments', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authMock.mockResolvedValue({ userId: 'user_1' });
    findPreference.mockResolvedValue({ exam: 'STEP_2_CK' });
    addPracticeAssessment.mockResolvedValue({ ok: true, id: 'a1' });
  });

  it('rejects signed-out requests', async () => {
    authMock.mockResolvedValue({ userId: null });
    const { POST } = await import('../app/api/dashboard/assessments/route');
    expect((await POST(post(valid))).status).toBe(401);
    expect(addPracticeAssessment).not.toHaveBeenCalled();
  });

  it('saves a valid exam against the signed-in user and their current exam', async () => {
    const { POST } = await import('../app/api/dashboard/assessments/route');
    const res = await POST(post(valid));
    expect(res.status).toBe(200);
    expect(addPracticeAssessment).toHaveBeenCalledWith(
      expect.objectContaining({ clerkUserId: 'user_1', examType: 'STEP_2_CK', source: 'NBME', label: 'NBME 12', score: 238 })
    );
  });

  it.each([
    ['score above 300', { ...valid, score: 301 }],
    ['score of zero', { ...valid, score: 0 }],
    ['fractional score', { ...valid, score: 238.5 }],
    ['non-numeric score', { ...valid, score: 'abc' }],
    ['unknown source', { ...valid, source: 'KAPLAN' }],
    ['empty name', { ...valid, label: '   ' }],
    ['overlong name', { ...valid, label: 'x'.repeat(41) }],
    ['malformed date', { ...valid, takenAt: '10/30/2026' }],
    ['future date', { ...valid, takenAt: daysFromNow(5) }],
    ['date over two years old', { ...valid, takenAt: daysFromNow(-800) }],
  ])('rejects %s', async (_name, body) => {
    const { POST } = await import('../app/api/dashboard/assessments/route');
    expect((await POST(post(body))).status).toBe(400);
    expect(addPracticeAssessment).not.toHaveBeenCalled();
  });

  it('refuses to log a three-digit score for pass/fail exams', async () => {
    findPreference.mockResolvedValue({ exam: 'STEP_1' });
    const { POST } = await import('../app/api/dashboard/assessments/route');
    expect((await POST(post(valid))).status).toBe(400);
    findPreference.mockResolvedValue({ exam: 'ABIM' });
    expect((await POST(post(valid))).status).toBe(400);
    expect(addPracticeAssessment).not.toHaveBeenCalled();
  });

  it('returns 409 when the per-exam limit is reached', async () => {
    addPracticeAssessment.mockResolvedValue({ ok: false, reason: 'limit' });
    const { POST } = await import('../app/api/dashboard/assessments/route');
    expect((await POST(post(valid))).status).toBe(409);
  });

  it('only deletes the signed-in user\'s own entry', async () => {
    deletePracticeAssessment.mockResolvedValue(false);
    const { DELETE } = await import('../app/api/dashboard/assessments/route');
    const { NextRequest } = await import('next/server');
    const res = await DELETE(new NextRequest('http://localhost/api/dashboard/assessments?id=other_users_row', { method: 'DELETE' }));
    expect(res.status).toBe(404);
    expect(deletePracticeAssessment).toHaveBeenCalledWith('user_1', 'other_users_row');
  });
});

describe('POST /api/dashboard/exam-outcome', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authMock.mockResolvedValue({ userId: 'user_1' });
    findPreference.mockResolvedValue({ exam: 'STEP_2_CK' });
    recordExamOutcome.mockResolvedValue({ id: 'o1' });
  });

  it('requires a valid score for scored exams and stores pass/fail only for others', async () => {
    const { POST } = await import('../app/api/dashboard/exam-outcome/route');
    expect((await POST(post({ passed: true, takenAt: today() }))).status).toBe(400);
    expect((await POST(post({ passed: true, score: 999, takenAt: today() }))).status).toBe(400);
    expect((await POST(post({ passed: true, score: 247, takenAt: today() }))).status).toBe(200);
    expect(recordExamOutcome).toHaveBeenCalledWith(expect.objectContaining({ score: 247, passed: true, examType: 'STEP_2_CK' }));

    findPreference.mockResolvedValue({ exam: 'STEP_1' });
    expect((await POST(post({ passed: false, takenAt: today() }))).status).toBe(200);
    expect(recordExamOutcome).toHaveBeenLastCalledWith(expect.objectContaining({ score: null, passed: false, examType: 'STEP_1' }));
  });

  it('rejects a missing pass flag and future dates', async () => {
    const { POST } = await import('../app/api/dashboard/exam-outcome/route');
    expect((await POST(post({ score: 247, takenAt: today() }))).status).toBe(400);
    expect((await POST(post({ passed: true, score: 247, takenAt: daysFromNow(9) }))).status).toBe(400);
  });
});
