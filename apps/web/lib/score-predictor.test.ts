import { describe, expect, it } from 'vitest';
import {
  estimateScore,
  isScoredExam,
  isValidScore,
  normalCdf,
  PASSING_STANDARD,
  step2CkPercentile,
} from './score-predictor';

const NOW = new Date('2026-10-30T12:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

describe('isValidScore / isScoredExam', () => {
  it('accepts only integers from 1 to 300', () => {
    expect(isValidScore(1)).toBe(true);
    expect(isValidScore(300)).toBe(true);
    expect(isValidScore(0)).toBe(false);
    expect(isValidScore(301)).toBe(false);
    expect(isValidScore(240.5)).toBe(false);
    expect(isValidScore(Number.NaN)).toBe(false);
  });

  it('treats only Step 2 CK and Step 3 as numerically scored', () => {
    expect(isScoredExam('STEP_2_CK')).toBe(true);
    expect(isScoredExam('STEP_3')).toBe(true);
    expect(isScoredExam('STEP_1')).toBe(false);
    expect(isScoredExam('ABIM')).toBe(false);
  });
});

describe('normalCdf / percentile', () => {
  it('matches known normal values', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(1)).toBeCloseTo(0.8413, 3);
    expect(normalCdf(-1)).toBeCloseTo(0.1587, 3);
    expect(normalCdf(2)).toBeCloseTo(0.9772, 3);
  });

  it('maps Step 2 CK scores onto a mean-250, SD-15 curve and stays within 1 to 99', () => {
    expect(step2CkPercentile(250)).toBe(50);
    expect(step2CkPercentile(265)).toBe(84);
    expect(step2CkPercentile(218)).toBe(2);
    expect(step2CkPercentile(300)).toBe(99);
    expect(step2CkPercentile(1)).toBe(1);
  });
});

describe('estimateScore', () => {
  it('returns null when nothing usable is logged', () => {
    expect(estimateScore('STEP_2_CK', [], NOW)).toBeNull();
    expect(estimateScore('STEP_2_CK', [{ score: 0, takenAt: daysAgo(1) }], NOW)).toBeNull();
    expect(estimateScore('STEP_2_CK', [{ score: 240, takenAt: daysAgo(-3) }], NOW)).toBeNull();
  });

  it('centers a single exam on its score with the widest floor and low confidence', () => {
    const e = estimateScore('STEP_2_CK', [{ score: 240, takenAt: daysAgo(3) }], NOW)!;
    expect(e.center).toBe(240);
    expect(e.low).toBe(228);
    expect(e.high).toBe(252);
    expect(e.confidence).toBe('low');
    expect(e.usedCount).toBe(1);
    expect(e.trendPer14Days).toBeNull();
  });

  it('weights newer exams more than older ones', () => {
    const e = estimateScore(
      'STEP_2_CK',
      [
        { score: 220, takenAt: daysAgo(42) },
        { score: 250, takenAt: daysAgo(2) },
      ],
      NOW
    )!;
    expect(e.center).toBeGreaterThan(235);
    expect(e.center).toBeLessThan(250);
  });

  it('uses only the four most recent exams', () => {
    const e = estimateScore(
      'STEP_2_CK',
      [
        { score: 100, takenAt: daysAgo(80) },
        { score: 240, takenAt: daysAgo(30) },
        { score: 242, takenAt: daysAgo(20) },
        { score: 244, takenAt: daysAgo(10) },
        { score: 246, takenAt: daysAgo(2) },
      ],
      NOW
    )!;
    expect(e.usedCount).toBe(4);
    expect(e.low).toBeGreaterThan(200);
  });

  it('widens the range past the floor when exams disagree', () => {
    const e = estimateScore(
      'STEP_2_CK',
      [
        { score: 220, takenAt: daysAgo(10) },
        { score: 260, takenAt: daysAgo(2) },
        { score: 240, takenAt: daysAgo(6) },
      ],
      NOW
    )!;
    expect(e.high - e.low).toBeGreaterThanOrEqual(40);
  });

  it('clamps the range to 1 to 300', () => {
    const e = estimateScore('STEP_2_CK', [{ score: 298, takenAt: daysAgo(1) }], NOW)!;
    expect(e.high).toBe(300);
    const lowE = estimateScore('STEP_2_CK', [{ score: 3, takenAt: daysAgo(1) }], NOW)!;
    expect(lowE.low).toBe(1);
  });

  it('grades confidence by count and recency, and flags stale estimates', () => {
    const three = [
      { score: 236, takenAt: daysAgo(18) },
      { score: 240, takenAt: daysAgo(10) },
      { score: 244, takenAt: daysAgo(3) },
    ];
    expect(estimateScore('STEP_2_CK', three, NOW)!.confidence).toBe('higher');

    const two = [
      { score: 240, takenAt: daysAgo(30) },
      { score: 244, takenAt: daysAgo(20) },
    ];
    expect(estimateScore('STEP_2_CK', two, NOW)!.confidence).toBe('medium');

    const stale = estimateScore('STEP_2_CK', [{ score: 244, takenAt: daysAgo(60) }], NOW)!;
    expect(stale.stale).toBe(true);
    expect(stale.confidence).toBe('low');
  });

  it('reports an upward trend in points per 14 days, and none without enough spread', () => {
    const rising = estimateScore(
      'STEP_2_CK',
      [
        { score: 230, takenAt: daysAgo(28) },
        { score: 240, takenAt: daysAgo(14) },
        { score: 250, takenAt: daysAgo(0) },
      ],
      NOW
    )!;
    expect(rising.trendPer14Days).toBeCloseTo(10, 0);

    const sameWeek = estimateScore(
      'STEP_2_CK',
      [
        { score: 230, takenAt: daysAgo(5) },
        { score: 250, takenAt: daysAgo(2) },
      ],
      NOW
    )!;
    expect(sameWeek.trendPer14Days).toBeNull();
  });

  it('measures margin against each exam\'s passing standard', () => {
    const ck = estimateScore('STEP_2_CK', [{ score: 230, takenAt: daysAgo(1) }], NOW)!;
    expect(ck.passingStandard).toBe(PASSING_STANDARD.STEP_2_CK);
    expect(ck.marginAtCenter).toBe(12);
    expect(ck.marginAtLow).toBe(0);

    const s3 = estimateScore('STEP_3', [{ score: 205, takenAt: daysAgo(1) }], NOW)!;
    expect(s3.passingStandard).toBe(200);
    expect(s3.marginAtCenter).toBe(5);
    expect(s3.marginAtLow).toBeLessThan(0);
  });

  it('gives a percentile for Step 2 CK only', () => {
    expect(estimateScore('STEP_2_CK', [{ score: 250, takenAt: daysAgo(1) }], NOW)!.percentileAtCenter).toBe(50);
    expect(estimateScore('STEP_3', [{ score: 230, takenAt: daysAgo(1) }], NOW)!.percentileAtCenter).toBeNull();
  });
});
