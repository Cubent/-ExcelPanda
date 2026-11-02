// Data Analysis & Pivots, unit 5: what-if analysis, forecasting and the course test.
import * as E from '@/components/sheet/engine';
import { type PivotConfig, pivotCell } from '@/components/sheet/pivot';
import * as T from '@/components/sheet/tools';
import { custom, grid, info, task } from './dsl';
import { Cell, F, K } from './kbd';
import type { LessonContent, StepCtx } from './types';

type Cells = Record<string, string>;
const base = (cells: Cells): E.SheetData => ({ ...E.emptyData(), cells });
const rect = (label: string) => E.parseRectLabel(label) as E.Rect;
const within = (v: E.Scalar, n: number, eps: number) => typeof v === 'number' && Math.abs(v - n) <= eps;

// ---------------------------------------------------------------------------
// Goal Seek
// ---------------------------------------------------------------------------
const PROFIT = { A1: 'Price', B1: '20', A2: 'Units', B2: '100', A3: 'Fixed costs', B3: '1200', A4: 'Profit', B4: '=B1*B2-B3' };
const GROWTH = { A1: 'Start', B1: '1000', A2: 'Rate', B2: '0.05', A3: 'Years', B3: '10', A4: 'End', B4: '=B1*(1+B2)^B3' };
const rateNeeded = 2 ** (1 / 10) - 1;

export const goalSeekLesson: LessonContent = {
  key: 'da-goal-seek',
  title: 'Goal Seek',
  tools: ['goalseek'],
  steps: [
    info('intro', 'Work backwards from the answer', (
      <>
        <p>
          Normally you type inputs and read the result. <strong>Goal Seek</strong> runs it in reverse: you say "I want <strong>B4</strong> to equal 1000" and
          Excel finds the input value that makes it true. In Excel: <strong>Data → What-If Analysis → Goal Seek</strong>.
        </p>
        <p>
          It needs three things: the <strong>formula cell</strong> to set, the <strong>target value</strong>, and the <strong>one input cell</strong> it may
          change.
        </p>
      </>
    )),
    custom({
      id: 'price', title: 'What price gives a profit of 1000?',
      body: (
        <>
          <p>
            Profit in <Cell>B4</Cell> is 800 today. Press <strong>Goal seek</strong>: Set cell <strong>B4</strong>, To value <strong>1000</strong>, By changing{' '}
            <strong>B1</strong>.
          </p>
        </>
      ),
      hint: 'The formula cell is the one that gets set; the input is the one that changes.',
      success: 'Price 22. Excel changed B1 until B4 reached 1000.',
      seed: PROFIT, fresh: true, select: 'B4',
      check: (c) => within(c.value('B4'), 1000, 0.5) && within(c.value('B1'), 22, 0.05) && c.raw('B4').startsWith('='),
      sol: { cells: { B1: '22' }, events: ['goal-seek'] },
    }),
    custom({
      id: 'units', title: 'How many units are needed?',
      body: (
        <p>
          Reset: price 20. Find the <strong>Units</strong> needed (change <strong>B2</strong>) for a profit of <strong>1500</strong>.
        </p>
      ),
      hint: 'Set cell B4 to 1500 by changing B2.',
      success: '135 units. The input can be any cell the formula depends on.',
      seed: PROFIT, fresh: true, select: 'B4',
      check: (c) => within(c.value('B4'), 1500, 0.5) && within(c.value('B2'), 135, 0.05) && c.raw('B4').startsWith('='),
      sol: { cells: { B2: '135' }, events: ['goal-seek'] },
    }),
    custom({
      id: 'rate', title: 'A growth rate to double your money',
      body: (
        <p>
          1000 grows at <strong>B2</strong> a year for 10 years. What rate (change <strong>B2</strong>) makes the End value in <Cell>B4</Cell> reach{' '}
          <strong>2000</strong>?
        </p>
      ),
      hint: 'It works for non-linear formulas like (1+rate)^years too.',
      success: 'About 7.18% a year.',
      seed: GROWTH, fresh: true, select: 'B4',
      check: (c) => within(c.value('B4'), 2000, 0.5) && within(c.value('B2'), rateNeeded, 0.001) && c.raw('B4').startsWith('='),
      sol: { cells: { B2: String(Number.parseFloat(rateNeeded.toPrecision(10))) }, events: ['goal-seek'] },
    }),
    task({
      id: 'algebra', title: 'Or solve it with a formula',
      body: (
        <>
          <p>
            For simple problems a formula is better than Goal Seek because it stays live. Units needed for a 1500 profit is{' '}
            <em>(target + fixed costs) ÷ price</em>. In <Cell>D1</Cell> type <F>{'=(1500+B3)/B1'}</F>.
          </p>
        </>
      ),
      hint: '(1500 + 1200) / 20.',
      success: '135 again. Goal Seek is for formulas that are hard to rearrange.',
      seed: PROFIT, fresh: true, select: 'D1',
      cells: { D1: 135 }, sol: { D1: '=(1500+B3)/B1' },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------
const SC = { A1: 'Scenario', B1: 'Base', A3: 'Revenue now', B3: '1000', A4: 'Growth', A5: 'Next year', E1: 'Scenario', F1: 'Growth', E2: 'Best', F2: '0.15', E3: 'Base', F3: '0.08', E4: 'Worst', F4: '0.02' };
const SC_LISTS = { B1: ['Best', 'Base', 'Worst'] };
const SC_FULL = { ...SC, B4: '=XLOOKUP(B1,E2:E4,F2:F4)', B5: '=B3*(1+B4)' };

export const scenarios: LessonContent = {
  key: 'da-scenarios',
  title: 'Scenarios',
  meta: { lists: SC_LISTS },
  steps: [
    info('intro', 'Best, base and worst case', (
      <>
        <p>
          Planners rarely trust one number. They run <strong>scenarios</strong>: best, base and worst case. Excel has a Scenario Manager, but most
          professionals build a simple <strong>switch</strong>: one drop-down cell that selects a row from an assumptions table, and every formula
          follows it.
        </p>
      </>
    )),
    custom({
      id: 'pick', title: 'Use the scenario switch',
      body: (
        <p>
          <Cell>B1</Cell> is a drop-down. Click it, open the ▼ list and choose <strong>Best</strong>.
        </p>
      ),
      hint: 'You can also press Alt + ↓ on the cell.',
      success: 'The switch is set to Best.',
      seed: SC, fresh: true, select: 'B1',
      check: (c) => c.events.has('dropdown') && c.raw('B1') === 'Best',
      sol: { cells: { B1: 'Best' }, events: ['dropdown'] },
    }),
    task({
      id: 'lookup', title: 'Pull in the growth assumption',
      body: (
        <>
          <p>
            Make <Cell>B4</Cell> read the growth for whichever scenario is chosen in B1:
          </p>
          <p>
            <F>{'=XLOOKUP(B1,E2:E4,F2:F4)'}</F>
          </p>
        </>
      ),
      hint: 'Look up B1 in the scenario names, return the growth next to it.',
      success: '0.08 for Base.',
      seed: SC, fresh: true, select: 'B4',
      cells: { B4: 0.08 }, uses: 'XLOOKUP', sol: { B4: '=XLOOKUP(B1,E2:E4,F2:F4)' },
    }),
    task({
      id: 'forecast', title: 'Build the forecast',
      body: (
        <p>
          In <Cell>B5</Cell> project next year's revenue: current revenue times (1 + growth): <F>{'=B3*(1+B4)'}</F>.
        </p>
      ),
      hint: 'B3 is revenue now and B4 is the growth.',
      success: '1080 in the Base case.',
      seed: { ...SC, B4: '=XLOOKUP(B1,E2:E4,F2:F4)' }, select: 'B5',
      cells: { B5: 1080 }, sol: { B5: '=B3*(1+B4)' },
    }),
    custom({
      id: 'worst', title: 'Flip to the worst case',
      body: <p>Now use the drop-down to choose <strong>Worst</strong>. Every formula updates at once.</p>,
      hint: 'B5 should fall to 1020.',
      success: '1020. Switch scenarios and the whole model follows. That is a real planning tool.',
      seed: SC_FULL, select: 'B1',
      check: (c) => c.raw('B1') === 'Worst' && c.value('B5') === 1020 && c.events.has('dropdown'),
      sol: { cells: { B1: 'Worst' }, events: ['dropdown'] },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Data tables
// ---------------------------------------------------------------------------
const DT_BASE = { A1: 'Price', B1: '20', A2: 'Units', B2: '100', A3: 'Costs', B3: '1200', A4: 'Profit', B4: '=B1*B2-B3' };
const DT_ONE = { ...DT_BASE, E1: '=B4', D2: '80', D3: '100', D4: '120' };
const DT_TWO = { ...DT_BASE, D1: '=B4', E1: '18', F1: '20', G1: '22', D2: '80', D3: '100', D4: '120' };
const DT_ONE_DONE = T.dataTable(base(DT_ONE), rect('D1:E4'), null, 'B2').cells;
const DT_TWO_DONE = T.dataTable(base(DT_TWO), rect('D1:G4'), 'B1', 'B2').cells;

export const dataTables: LessonContent = {
  key: 'da-data-tables',
  title: 'Data tables',
  tools: ['datatable'],
  steps: [
    info('intro', 'A sensitivity grid in one go', (
      <>
        <p>
          How does profit change if the price or the units change? A <strong>data table</strong> answers a whole grid of "what if" questions at once.
          You give it a formula, a list of trial values for one or two inputs, and it fills in every result.
        </p>
        <p>
          In Excel: <strong>Data → What-If Analysis → Data Table</strong>. Here, select the block and press <strong>Data table</strong>.
        </p>
      </>
    )),
    custom({
      id: 'one', title: 'One input',
      body: (
        <>
          <p>
            Units to try are in <Cell>D2:D4</Cell>, the profit formula (=B4) in <Cell>E1</Cell>. Select <Cell>D1:E4</Cell>, press <strong>Data table</strong>, leave
            the Row input empty and set <strong>Column input cell</strong> to <strong>B2</strong>.
          </p>
        </>
      ),
      hint: 'The trial values run down the column, so use the Column input cell.',
      success: '400, 800, 1200: the profit at 80, 100 and 120 units.',
      seed: DT_ONE, fresh: true, select: 'D1',
      check: (c) => c.raw('E2') === DT_ONE_DONE.E2 && c.raw('E3') === DT_ONE_DONE.E3 && c.raw('E4') === DT_ONE_DONE.E4,
      sol: { cells: DT_ONE_DONE, events: ['data-table'] },
    }),
    custom({
      id: 'two', title: 'Two inputs',
      body: (
        <>
          <p>
            Now vary price <em>and</em> units. The formula (=B4) is in the corner <Cell>D1</Cell>, prices across <Cell>E1:G1</Cell>, units down{' '}
            <Cell>D2:D4</Cell>. Select <Cell>D1:G4</Cell> and set <strong>Row input</strong> = <strong>B1</strong> (the price) and{' '}
            <strong>Column input</strong> = <strong>B2</strong> (the units).
          </p>
        </>
      ),
      hint: 'Row input is for the values across the top. Column input is for the values down the side.',
      success: 'A 3 × 3 grid. Look at the corners: 240 at the lowest price and units, 1440 at the highest.',
      seed: DT_TWO, fresh: true, select: 'D1',
      check: (c) => ['E2', 'F2', 'G2', 'E3', 'F3', 'G3', 'E4', 'F4', 'G4'].every((k) => c.raw(k) === DT_TWO_DONE[k]),
      sol: { cells: DT_TWO_DONE, events: ['data-table'] },
    }),
    custom({
      id: 'read', title: 'Read the grid',
      body: (
        <p>
          At <strong>120 units</strong> what is the <strong>lowest price</strong> in the grid that still gives a profit of 1000 or more? Type that price in{' '}
          <Cell>H1</Cell>.
        </p>
      ),
      hint: 'Look along the 120 row: 960, 1200, 1440.',
      success: '20. The grid shows the margin for error before you commit to a price.',
      seed: DT_TWO_DONE, select: 'H1',
      check: (c) => c.value('H1') === 20 && c.raw('H1').trim() === '20' && !c.editing,
      sol: { cells: { H1: '20' } },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Trends & forecasting
// ---------------------------------------------------------------------------
const XS = [1, 2, 3, 4, 5, 6];
const YS = [100, 112, 125, 131, 148, 160];
const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
const slope = (() => {
  const mx = mean(XS);
  const my = mean(YS);
  return XS.reduce((s, x, i) => s + (x - mx) * (YS[i] - my), 0) / XS.reduce((s, x) => s + (x - mx) ** 2, 0);
})();
const intercept = mean(YS) - slope * mean(XS);
const TREND = grid([['Month', 'Sales'], ...XS.map((x, i) => [x, YS[i]])]);

export const forecasting: LessonContent = {
  key: 'da-forecast',
  title: 'Trends & forecasting',
  steps: [
    info('intro', 'Draw the line through the data', (
      <>
        <p>
          Six months of sales are in <Cell>A2:B7</Cell>. A <strong>linear trend</strong> is the straight line that fits them best. Its{' '}
          <strong>slope</strong> is how much sales rise per month, its <strong>intercept</strong> is where the line starts, and{' '}
          <strong>FORECAST</strong> reads a future value off the line.
        </p>
        <p>
          Careful: the further you extrapolate beyond the data, the less you should trust it.
        </p>
      </>
    )),
    task({
      id: 'slope', title: 'SLOPE',
      body: (
        <p>
          In <Cell>D1</Cell> find the monthly rise: <F>{'=SLOPE(B2:B7,A2:A7)'}</F>. The first range is the thing you predict (sales), the second is the
          thing you predict from (month).
        </p>
      ),
      hint: 'Known Y first, then known X.',
      success: 'About 11.6 more sales each month.',
      seed: TREND, fresh: true, select: 'D1',
      cells: { D1: (v) => within(v, slope, 1e-6) }, uses: 'SLOPE', sol: { D1: '=SLOPE(B2:B7,A2:A7)' },
    }),
    task({
      id: 'intercept', title: 'INTERCEPT',
      body: (
        <p>
          In <Cell>D2</Cell> find where the line starts: <F>{'=INTERCEPT(B2:B7,A2:A7)'}</F>.
        </p>
      ),
      hint: 'Same two ranges as SLOPE.',
      success: 'About 87.',
      seed: TREND, select: 'D2',
      cells: { D2: (v) => within(v, intercept, 1e-6) }, uses: 'INTERCEPT', sol: { D2: '=INTERCEPT(B2:B7,A2:A7)' },
    }),
    task({
      id: 'forecast', title: 'FORECAST',
      body: (
        <>
          <p>
            Predict <strong>month 7</strong> in <Cell>D3</Cell>:
          </p>
          <p>
            <F>{'=FORECAST(7,B2:B7,A2:A7)'}</F>
          </p>
        </>
      ),
      hint: 'FORECAST(x_to_predict, known_y, known_x).',
      success: 'About 168.',
      seed: TREND, select: 'D3',
      cells: { D3: (v) => within(v, intercept + slope * 7, 1e-6) }, uses: 'FORECAST', sol: { D3: '=FORECAST(7,B2:B7,A2:A7)' },
    }),
    task({
      id: 'manual', title: 'Same answer by hand',
      body: (
        <p>
          FORECAST is just <em>intercept + slope × x</em>. Build month 12 in <Cell>D4</Cell> from D1 and D2: <F>{'=D2+D1*12'}</F>. (Month 12 is far
          from the data. Treat it as a rough guide only.)
        </p>
      ),
      hint: 'D1 is the slope and D2 is the intercept.',
      success: 'About 227. Compare with a plain =FORECAST(12, ...) and you get the same number.',
      seed: { ...TREND, D1: '=SLOPE(B2:B7,A2:A7)', D2: '=INTERCEPT(B2:B7,A2:A7)' }, select: 'D4',
      cells: { D4: (v) => within(v, intercept + slope * 12, 1e-6) }, sol: { D4: '=D2+D1*12' },
    }),
  ],
};

const AD = [10, 15, 20, 25, 30, 35];
const SALES_AD = [102, 118, 135, 140, 162, 170];
const SHOE = [5, 9, 6, 10, 7, 8];
const PAY = [50, 52, 51, 49, 53, 51];
const corr = (x: number[], y: number[]) => {
  const mx = mean(x);
  const my = mean(y);
  const sxy = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0);
  return sxy / Math.sqrt(x.reduce((s, v) => s + (v - mx) ** 2, 0) * y.reduce((s, v) => s + (v - my) ** 2, 0));
};
const ADS = grid([['Ad spend', 'Sales'], ...AD.map((a, i) => [a, SALES_AD[i]])]);
const WEAK = grid([['Shoe size', 'Pay'], ...SHOE.map((a, i) => [a, PAY[i]])]);

export const correlation: LessonContent = {
  key: 'da-correlation',
  title: 'Correlation',
  steps: [
    info('intro', 'Do two things move together?', (
      <>
        <p>
          <strong>CORREL</strong> measures how closely two columns move together, from <strong>-1</strong> to <strong>+1</strong>. Near +1: when one
          rises, the other rises. Near -1: one rises as the other falls. Near 0: no straight-line link. <strong>RSQ</strong> squares it: the share of one
          column's ups and downs explained by the other.
        </p>
        <p>
          Remember: <strong>correlation is not causation</strong>. Ice-cream sales and sunburn rise together, but one does not cause the other.
        </p>
      </>
    )),
    task({
      id: 'correl', title: 'CORREL',
      body: (
        <p>
          Does ad spend track sales? In <Cell>D1</Cell> type <F>{'=CORREL(A2:A7,B2:B7)'}</F>.
        </p>
      ),
      hint: 'The order of the two ranges does not matter.',
      success: 'About 0.99. Almost a perfect straight-line link.',
      seed: ADS, fresh: true, select: 'D1',
      cells: { D1: (v) => within(v, corr(AD, SALES_AD), 1e-6) }, uses: 'CORREL', sol: { D1: '=CORREL(A2:A7,B2:B7)' },
    }),
    task({
      id: 'rsq', title: 'RSQ',
      body: (
        <p>
          In <Cell>D2</Cell> find the share explained: <F>{'=RSQ(B2:B7,A2:A7)'}</F>.
        </p>
      ),
      hint: 'RSQ(known_y, known_x).',
      success: 'About 0.98: ad spend explains ~98% of the variation in sales here.',
      seed: ADS, select: 'D2',
      cells: { D2: (v) => within(v, corr(AD, SALES_AD) ** 2, 1e-6) }, uses: 'RSQ', sol: { D2: '=RSQ(B2:B7,A2:A7)' },
    }),
    custom({
      id: 'answer', title: 'Does it drive sales?',
      body: (
        <p>
          A correlation above <strong>0.8</strong> is strong. In <Cell>D3</Cell> answer <strong>Yes</strong> or <strong>No</strong>: is there a strong link
          between ad spend and sales in this data?
        </p>
      ),
      hint: 'Compare D1 with 0.8.',
      success: 'Yes, a strong link. (Whether ads cause it still needs a proper test.)',
      seed: { ...ADS, D1: '=CORREL(A2:A7,B2:B7)' }, select: 'D3',
      check: (c) => c.raw('D3').trim().toLowerCase() === 'yes' && !c.editing,
      sol: { cells: { D3: 'Yes' } },
    }),
    custom({
      id: 'weak', title: 'A weak link',
      body: (
        <>
          <p>
            Now check shoe size against pay. Type <F>{'=CORREL(A2:A7,B2:B7)'}</F> in <Cell>D1</Cell>, then answer <strong>No</strong> in{' '}
            <Cell>D3</Cell> if there is no strong link.
          </p>
        </>
      ),
      hint: 'The result will be close to zero.',
      success: 'About -0.15: shoe size tells you almost nothing about pay.',
      seed: WEAK, fresh: true, select: 'D1',
      check: (c) => /correl/i.test(c.raw('D1')) && within(c.value('D1'), corr(SHOE, PAY), 1e-6) && c.raw('D3').trim().toLowerCase() === 'no' && !c.editing,
      sol: { cells: { D1: '=CORREL(A2:A7,B2:B7)', D3: 'No' } },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Final test
// ---------------------------------------------------------------------------
const d = (y: number, m: number, day: number) => `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const SALES_ROWS = [
  ['Date', 'Region', 'Product', 'Units', 'Revenue', 'Cost'],
  [d(2026, 1, 5), 'North', 'Pen', 10, 20, 8], [d(2026, 1, 12), 'South', 'Book', 4, 36, 20], [d(2026, 1, 20), 'East', 'Pen', 12, 24, 10],
  [d(2026, 1, 28), 'North', 'Book', 6, 54, 30], [d(2026, 2, 3), 'South', 'Pen', 8, 16, 7], [d(2026, 2, 10), 'East', 'Book', 3, 27, 15],
  [d(2026, 2, 18), 'West', 'Bag', 5, 125, 60], [d(2026, 2, 25), 'North', 'Pen', 9, 18, 8], [d(2026, 3, 4), 'South', 'Book', 7, 63, 35],
  [d(2026, 3, 11), 'West', 'Pen', 14, 28, 12], [d(2026, 3, 19), 'East', 'Bag', 2, 50, 24], [d(2026, 3, 27), 'North', 'Bag', 4, 100, 48],
];
const S = grid(SALES_ROWS);
const SORTED = T.sortRows(base(S), rect('A1:F13'), [{ col: 1, asc: true }, { col: 4, asc: false }], true).cells;
const REG = grid([['Region', 'Revenue'], ['North', 192], ['South', 115], ['East', 101], ['West', 153]]);
const piv = (c: StepCtx) => c.pivot;

export const finalTest: LessonContent = {
  key: 'da-final-test',
  title: 'Final test',
  tools: ['table', 'sort', 'goalseek'],
  pivot: { source: 'A1:F13' },
  chart: { allow: {} },
  steps: [
    { ...info('intro', 'Data Analysis final test', <p>Six tasks across the whole course: tables, sorting, pivots, charts, what-if and forecasting.</p>), seed: S, fresh: true, select: 'A1', resetPanels: true },
    custom({
      id: 'table', title: '1. Make it a table',
      body: <p>Turn the sales data into a <strong>table</strong>.</p>,
      hint: 'Click inside the data and press Table.',
      success: 'Table1.',
      seed: S, fresh: true, select: 'B3',
      check: (c) => c.data.tables?.length === 1 && c.data.tables[0].range === 'A1:F13',
      sol: { data: { tables: [{ name: 'Table1', range: 'A1:F13' }] }, events: ['table'] },
    }),
    custom({
      id: 'sort', title: '2. Sort',
      body: <p>Sort by <strong>Region</strong> (A to Z) and, within each region, by <strong>Revenue</strong> (Largest to Smallest).</p>,
      hint: 'Custom sort, two levels.',
      success: 'Correct.',
      seed: S, fresh: true, select: 'B3',
      check: (c) => Object.entries(SORTED).every(([k, v]) => c.raw(k) === v),
      sol: { cells: SORTED, events: ['sort'] },
    }),
    custom({
      id: 'pivot', title: '3. PivotTable',
      body: <p>In the PivotTable tab, total <strong>Units</strong> for each <strong>Region</strong>.</p>,
      hint: 'Rows = Region, Sum of Units.',
      success: 'Correct.',
      seed: S, fresh: true, select: 'A1', view: 'pivot', resetPanels: true,
      check: (c) => piv(c)?.config.rows === 'Region' && piv(c)?.config.values[0]?.field === 'Units' && pivotCell(piv(c)?.result ?? ({} as never), 'North') === 29,
      sol: { pivot: { source: 'A1:F13', rows: 'Region', values: [{ field: 'Units', agg: 'sum' }] } as PivotConfig, view: 'pivot' },
    }),
    custom({
      id: 'chart', title: '4. Chart',
      body: <p>Chart revenue by region (A1:B5) as a <strong>column</strong> or <strong>bar</strong> chart.</p>,
      hint: 'Chart tab, range A1:B5.',
      success: 'Correct.',
      seed: REG, fresh: true, select: 'A1', view: 'chart', resetPanels: true,
      check: (c) => ['column', 'bar'].includes(c.chart?.config.type ?? '') && (c.chart?.data.categories.length ?? 0) === 4,
      sol: { chart: { type: 'column', range: 'A1:B5' }, view: 'chart' },
    }),
    custom({
      id: 'goal', title: '5. Goal Seek',
      body: <p>Using the profit model, find the <strong>price</strong> (change B1) that makes profit in B4 equal <strong>1000</strong>.</p>,
      hint: 'Goal seek: set B4 to 1000 by changing B1.',
      success: 'Price 22.',
      seed: PROFIT, fresh: true, select: 'B4', view: 'sheet', resetPanels: true,
      check: (c) => within(c.value('B4'), 1000, 0.5) && within(c.value('B1'), 22, 0.05) && c.raw('B4').startsWith('='),
      sol: { cells: { B1: '22' }, events: ['goal-seek'] },
    }),
    task({
      id: 'forecast', title: '6. Forecast',
      body: <p>Using the six months of sales, forecast <strong>month 7</strong> in <Cell>D1</Cell> with a straight-line trend.</p>,
      hint: '=FORECAST(7,B2:B7,A2:A7)',
      success: 'Data Analysis & Pivots complete!',
      seed: TREND, fresh: true, select: 'D1',
      cells: { D1: (v) => within(v, intercept + slope * 7, 1e-6) }, uses: 'FORECAST', sol: { D1: '=FORECAST(7,B2:B7,A2:A7)' },
    }),
  ],
};
