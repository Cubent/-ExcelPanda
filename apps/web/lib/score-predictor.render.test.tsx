import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EstimateCard } from '../app/[locale]/dashboard/predictor/components/estimate-card';
import { PracticeSignals } from '../app/[locale]/dashboard/predictor/components/practice-signals';
import { TrendChart } from '../app/[locale]/dashboard/predictor/components/trend-chart';
import { estimateScore } from './score-predictor';

const NOW = new Date();
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

describe('EstimateCard', () => {
  it('shows an empty state with no exams', () => {
    const html = renderToStaticMarkup(<EstimateCard exam="STEP_2_CK" estimate={null} />);
    expect(html).toContain('Log a practice exam');
  });

  it('shows the range, percentile for Step 2 CK, and the passing line', () => {
    const e = estimateScore('STEP_2_CK', [{ score: 250, takenAt: daysAgo(2) }])!;
    const html = renderToStaticMarkup(<EstimateCard exam="STEP_2_CK" estimate={e} />);
    expect(html).toContain('238');
    expect(html).toContain('262');
    expect(html).toContain('50th percentile');
    expect(html).toContain('passing standard (218)');
    expect(html).toContain('Low confidence');
  });

  it('says plainly when the estimate is below the passing standard, and omits percentile for Step 3', () => {
    const e = estimateScore('STEP_3', [{ score: 190, takenAt: daysAgo(2) }])!;
    const html = renderToStaticMarkup(<EstimateCard exam="STEP_3" estimate={e} />);
    expect(html).toContain('below the passing standard (200)');
    expect(html).not.toContain('percentile');
  });

  it('flags a stale estimate', () => {
    const e = estimateScore('STEP_2_CK', [{ score: 240, takenAt: daysAgo(60) }])!;
    expect(renderToStaticMarkup(<EstimateCard exam="STEP_2_CK" estimate={e} />)).toContain('60 days ago');
  });
});

describe('TrendChart', () => {
  it('renders nothing for fewer than two points', () => {
    expect(renderToStaticMarkup(<TrendChart points={[{ score: 240, takenAt: daysAgo(1).toISOString() }]} passing={218} />)).toBe('');
  });

  it('renders an accessible chart with a point per exam and the passing line', () => {
    const html = renderToStaticMarkup(
      <TrendChart
        points={[
          { score: 230, takenAt: daysAgo(14).toISOString() },
          { score: 244, takenAt: daysAgo(1).toISOString() },
        ]}
        passing={218}
      />
    );
    expect(html).toContain('role="img"');
    expect(html).toContain('Passing standard is 218');
    expect((html.match(/<circle/g) ?? []).length).toBe(2);
    expect(html).not.toContain('NaN');
  });
});

describe('PracticeSignals', () => {
  const base = {
    windowDays: 30,
    questionsAnswered: 120,
    recent: { pct: 71, correct: 71, total: 100 },
    changeVsPriorPct: 4,
    review: { pct: 64, correct: 16, total: 25, hasData: true },
    weakestSystems: [{ name: 'Cardiovascular', attempts: 12, accuracyPct: 50 }],
  };

  it('shows real numbers and never a three-digit predicted score', () => {
    const html = renderToStaticMarkup(<PracticeSignals signals={base} />);
    expect(html).toContain('71%');
    expect(html).toContain('+4 pts');
    expect(html).toContain('Cardiovascular');
    expect(html).toContain('not calibrated');
  });

  it('shows an empty state when there are no recent answers', () => {
    const html = renderToStaticMarkup(
      <PracticeSignals signals={{ ...base, recent: { pct: 0, correct: 0, total: 0 }, changeVsPriorPct: null, weakestSystems: [] }} />
    );
    expect(html).toContain('No answers in the last 30 days');
  });
});
