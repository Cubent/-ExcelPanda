import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EstimateCard } from '../app/[locale]/dashboard/predictor/components/estimate-card';
import { PracticeSignals } from '../app/[locale]/dashboard/predictor/components/practice-signals';
import { RangeBar } from '../app/[locale]/dashboard/predictor/components/range-bar';
import { estimateScore } from './score-predictor';

const pct = (html: string, prop: 'left' | 'width', nth = 0) =>
  Number([...html.matchAll(new RegExp(`${prop}:([0-9.]+)%`, 'g'))][nth]?.[1]);

describe('RangeBar', () => {
  it('describes the range for screen readers', () => {
    const html = renderToStaticMarkup(<RangeBar low={229} high={250} center={239} passing={218} />);
    expect(html).toContain('role="img"');
    expect(html).toContain('Estimated range 229 to 250, centered on 239, against a passing standard of 218');
    expect(html).toContain('passing 218');
  });

  it('is green when the whole range clears the passing standard', () => {
    const html = renderToStaticMarkup(<RangeBar low={229} high={250} center={239} passing={218} />);
    expect(html).toContain('bg-green-400');
    expect(html).not.toContain('bg-[#C46B10]');
  });

  it('is brand orange when any of the range is below the passing standard', () => {
    const html = renderToStaticMarkup(<RangeBar low={209} high={233} center={221} passing={218} />);
    expect(html).toContain('bg-[#C46B10]');
    expect(html).not.toContain('bg-green-400');
  });

  it('keeps every marker inside the track, even at the ends of the scale', () => {
    for (const [low, high, center] of [[1, 20, 10], [280, 300, 290], [215, 221, 218]] as const) {
      const html = renderToStaticMarkup(<RangeBar low={low} high={high} center={center} passing={218} />);
      const lefts = [...html.matchAll(/left:([0-9.]+)%/g)].map((m) => Number(m[1]));
      expect(lefts.length).toBeGreaterThan(0);
      for (const l of lefts) {
        expect(l).toBeGreaterThanOrEqual(0);
        expect(l).toBeLessThanOrEqual(100);
      }
      expect(html).not.toContain('NaN');
    }
  });

  it('places the band and passing line proportionally and keeps a visible minimum width', () => {
    const html = renderToStaticMarkup(<RangeBar low={230} high={230} center={230} passing={218} />);
    // Axis rounds to 205..245 around these values; a zero-width range still gets a visible band.
    expect(pct(html, 'width')).toBeGreaterThanOrEqual(1.5);
    const html2 = renderToStaticMarkup(<RangeBar low={229} high={250} center={239} passing={218} />);
    // Passing line sits left of the band when the whole range clears it.
    const lefts = [...html2.matchAll(/left:([0-9.]+)%/g)].map((m) => Number(m[1]));
    expect(Math.min(...lefts)).toBeLessThan(pct(html2, 'left'));
  });
});

describe('Dashboard design conventions', () => {
  const NOW = new Date();
  const e = estimateScore('STEP_2_CK', [{ score: 247, takenAt: new Date(NOW.getTime() - 3 * 86_400_000) }])!;

  it('the estimate is the dark navy hero card with the orange uppercase kicker, like the Overview', () => {
    const html = renderToStaticMarkup(<EstimateCard exam="STEP_2_CK" estimate={e} />);
    expect(html).toContain('bg-[#000C3F]');
    expect(html).toContain('text-[#C46B10]');
    expect(html).toContain('uppercase');
    expect(html).toContain('font-[family-name:var(--font-display)]');
  });

  it('the empty state is also a navy hero and links down to the logger', () => {
    const html = renderToStaticMarkup(<EstimateCard exam="STEP_2_CK" estimate={null} />);
    expect(html).toContain('bg-[#000C3F]');
    expect(html).toContain('href="#practice-exams"');
  });

  const signals = {
    windowDays: 30,
    questionsAnswered: 100,
    recent: { pct: 70, correct: 70, total: 100 },
    changeVsPriorPct: -4,
    review: { pct: 60, correct: 6, total: 10, hasData: true },
    weakestSystems: [
      { name: 'Renal', attempts: 10, accuracyPct: 49 },
      { name: 'Cardiovascular', attempts: 10, accuracyPct: 50 },
    ],
  };

  it('weak-area bars follow the Overview rule: green at 50% or better, orange below', () => {
    const html = renderToStaticMarkup(<PracticeSignals signals={signals} />);
    const renal = html.slice(html.indexOf('Renal'));
    expect(renal.slice(0, renal.indexOf('Cardiovascular'))).toContain('bg-[#C46B10]');
    const cardio = html.slice(html.indexOf('Cardiovascular'));
    expect(cardio).toContain('bg-green-500');
  });

  it('colors a negative change orange and uses a real minus sign', () => {
    const html = renderToStaticMarkup(<PracticeSignals signals={signals} />);
    expect(html).toContain('−4');
    expect(html).toContain('text-[#C46B10]');
  });

  it('lays the cards side by side only when asked to (pass/fail exams)', () => {
    expect(renderToStaticMarkup(<PracticeSignals signals={signals} wide />)).toContain('lg:grid-cols-2');
    expect(renderToStaticMarkup(<PracticeSignals signals={signals} />)).not.toContain('lg:grid-cols-2');
  });

  it('works in dark mode: every light surface has a dark counterpart', () => {
    const html = renderToStaticMarkup(<PracticeSignals signals={signals} />);
    expect(html).toContain('dark:bg-[#120A2E]');
    expect(html).toContain('dark:text-white');
  });
});
