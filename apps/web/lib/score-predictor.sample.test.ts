import { describe, expect, it } from 'vitest';
import { estimateScore, PASSING_STANDARD } from './score-predictor';
import { getSample, isSampleName, SAMPLE_SCENARIOS } from './score-predictor.sample';

describe('sample data', () => {
  it('only accepts known scenario names', () => {
    for (const name of SAMPLE_SCENARIOS) expect(isSampleName(name)).toBe(true);
    for (const bad of ['', 'RISING', 'nonsense', undefined, null, 5]) expect(isSampleName(bad)).toBe(false);
  });

  it('gives pass/fail exams signals only, with no scores', () => {
    for (const exam of ['STEP_1', 'ABIM'] as const) {
      expect(getSample('rising', exam).assessments).toEqual([]);
      expect(getSample('rising', exam).signals.recent.total).toBeGreaterThan(0);
    }
  });

  it('every scenario produces a valid estimate for both scored exams', () => {
    for (const exam of ['STEP_2_CK', 'STEP_3'] as const) {
      for (const name of SAMPLE_SCENARIOS) {
        const { assessments } = getSample(name, exam);
        const est = estimateScore(exam, assessments);
        expect(est, `${exam}/${name}`).not.toBeNull();
        expect(est!.low).toBeGreaterThanOrEqual(1);
        expect(est!.high).toBeLessThanOrEqual(300);
      }
    }
  });

  it('tells the same story for Step 3 as for Step 2 CK: identical margin to each exam\'s own passing standard', () => {
    for (const name of SAMPLE_SCENARIOS) {
      const ck = estimateScore('STEP_2_CK', getSample(name, 'STEP_2_CK').assessments)!;
      const s3 = estimateScore('STEP_3', getSample(name, 'STEP_3').assessments)!;
      expect(s3.marginAtCenter).toBe(ck.marginAtCenter);
      expect(s3.marginAtLow).toBe(ck.marginAtLow);
      expect(s3.passingStandard).toBe(PASSING_STANDARD.STEP_3);
    }
  });

  it('scenarios behave as named', () => {
    const rising = estimateScore('STEP_2_CK', getSample('rising', 'STEP_2_CK').assessments)!;
    expect(rising.trendPer14Days).toBeGreaterThan(0);
    expect(rising.marginAtLow).toBeGreaterThan(0);

    const borderline = estimateScore('STEP_2_CK', getSample('borderline', 'STEP_2_CK').assessments)!;
    expect(borderline.marginAtLow).toBeLessThan(0);
    expect(borderline.marginAtCenter).toBeGreaterThanOrEqual(0);

    expect(estimateScore('STEP_2_CK', getSample('stale', 'STEP_2_CK').assessments)!.stale).toBe(true);
  });

  it('returns assessments newest first', () => {
    const times = getSample('rising', 'STEP_2_CK').assessments.map((a) => a.takenAt.getTime());
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });
});
