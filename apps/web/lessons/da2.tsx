// Data Analysis & Pivots, units 3 and 4: pivot tables and charts.
import * as E from '@/components/sheet/engine';
import { type PivotConfig, pivotCell } from '@/components/sheet/pivot';
import { custom, grid, info, task } from './dsl';
import { Cell, F, K } from './kbd';
import type { LessonContent, StepCtx } from './types';

type Cells = Record<string, string>;

// ---------------------------------------------------------------------------
// Unit 3 · Pivot tables
// ---------------------------------------------------------------------------
const d = (y: number, m: number, day: number) => `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const SALES = grid([
  ['Date', 'Region', 'Product', 'Units', 'Revenue', 'Cost'],
  [d(2026, 1, 5), 'North', 'Pen', 10, 20, 8],
  [d(2026, 1, 12), 'South', 'Book', 4, 36, 20],
  [d(2026, 1, 20), 'East', 'Pen', 12, 24, 10],
  [d(2026, 1, 28), 'North', 'Book', 6, 54, 30],
  [d(2026, 2, 3), 'South', 'Pen', 8, 16, 7],
  [d(2026, 2, 10), 'East', 'Book', 3, 27, 15],
  [d(2026, 2, 18), 'West', 'Bag', 5, 125, 60],
  [d(2026, 2, 25), 'North', 'Pen', 9, 18, 8],
  [d(2026, 3, 4), 'South', 'Book', 7, 63, 35],
  [d(2026, 3, 11), 'West', 'Pen', 14, 28, 12],
  [d(2026, 3, 19), 'East', 'Bag', 2, 50, 24],
  [d(2026, 3, 27), 'North', 'Bag', 4, 100, 48],
]);
const SRC = 'A1:F13';
const PIV = { source: SRC };

const cfg = (c: StepCtx): PivotConfig | null => c.pivot?.config ?? null;
const cell = (c: StepCtx, row: string, col?: string) => (c.pivot ? pivotCell(c.pivot.result, row, col) : null);
const close = (v: number | null, n: number, eps = 0.01) => v !== null && Math.abs(v - n) < eps;
const sum = (field: string) => ({ field, agg: 'sum' as const });

export const firstPivot: LessonContent = {
  key: 'da-first-pivot',
  title: 'Your first PivotTable',
  pivot: { source: SRC },
  steps: [
    {
      ...info('intro', 'What a PivotTable does', (
        <>
          <p>
            You have <strong>12 orders</strong>. Which region sells the most? A <strong>PivotTable</strong> answers that in seconds: it groups rows by one
            field and totals another, without a single formula.
          </p>
          <p>
            Look at the data first, then open the <strong>PivotTable</strong> tab above the sheet.
          </p>
        </>
      )),
      seed: SALES, fresh: true, select: 'A1', resetPanels: true,
    },
    custom({
      id: 'rows', title: 'Rows and Values',
      body: (
        <>
          <p>
            In the PivotTable tab set <strong>Rows</strong> to <strong>Region</strong>, then press <strong>+ Add value</strong> and choose{' '}
            <strong>Revenue</strong> (summarised by <strong>Sum</strong>).
          </p>
          <p>
            <strong>Rows</strong> are the groups down the side. <strong>Values</strong> are the numbers calculated for each group.
          </p>
        </>
      ),
      hint: 'Rows = Region. Value = Sum of Revenue.',
      success: 'North 192, South 115, East 101, West 153. That is every region in one table.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Region' && !cfg(c)?.cols && cfg(c)?.values.length === 1 && cfg(c)?.values[0].field === 'Revenue' && cfg(c)?.values[0].agg === 'sum' && cell(c, 'North') === 192,
      sol: { pivot: { ...PIV, rows: 'Region', values: [sum('Revenue')] }, view: 'pivot' },
    }),
    custom({
      id: 'cols', title: 'Spread across the Columns',
      body: (
        <p>
          Put <strong>Product</strong> in <strong>Columns</strong>. Now you see region against product, with row and column totals.
        </p>
      ),
      hint: 'Columns = Product.',
      success: 'North sold 38 of Pens and 54 of Books... and 100 of Bags. A cross-tab.',
      view: 'pivot',
      check: (c) => cfg(c)?.rows === 'Region' && cfg(c)?.cols === 'Product' && cell(c, 'North', 'Pen') === 38 && cell(c, 'North', 'Book') === 54,
      sol: { pivot: { ...PIV, rows: 'Region', cols: 'Product', values: [sum('Revenue')] }, view: 'pivot' },
    }),
    custom({
      id: 'units', title: 'Change what you measure',
      body: (
        <p>
          Same layout, new question: how many <strong>Units</strong> were sold? Change the value field from Revenue to <strong>Units</strong>.
        </p>
      ),
      hint: 'Use the first drop-down under Values.',
      success: 'North sold 19 pens (10 + 9). Same grouping, different measure.',
      view: 'pivot',
      check: (c) => cfg(c)?.rows === 'Region' && cfg(c)?.cols === 'Product' && cfg(c)?.values[0]?.field === 'Units' && cell(c, 'North', 'Pen') === 19,
      sol: { pivot: { ...PIV, rows: 'Region', cols: 'Product', values: [sum('Units')] }, view: 'pivot' },
    }),
    custom({
      id: 'answer', title: 'Read the answer',
      body: (
        <>
          <p>
            Set the pivot back to <strong>Rows = Region</strong>, no Columns, and <strong>Sum of Revenue</strong>. Which region earns the most?
          </p>
          <p>
            Go to the <strong>Data</strong> tab and type that region's name in <Cell>H1</Cell>.
          </p>
        </>
      ),
      hint: 'The biggest total is 192.',
      success: 'North it is. A pivot turns a question into a few clicks.',
      view: 'pivot',
      check: (c) => cfg(c)?.rows === 'Region' && !cfg(c)?.cols && cfg(c)?.values[0]?.field === 'Revenue' && c.raw('H1').trim().toLowerCase() === 'north' && !c.editing,
      sol: { pivot: { ...PIV, rows: 'Region', values: [sum('Revenue')] }, cells: { H1: 'North' }, view: 'sheet' },
    }),
  ],
};

export const summarizeBy: LessonContent = {
  key: 'da-summarize-by',
  title: 'Summarize by',
  pivot: { source: SRC, features: { showAs: true } },
  steps: [
    {
      ...info('intro', 'Sum is only the start', (
        <>
          <p>
            Each value can be summarised as a <strong>Sum</strong>, <strong>Count</strong>, <strong>Average</strong>, <strong>Max</strong> or{' '}
            <strong>Min</strong>. And you can show it as a <strong>percentage</strong> of the total. One field, many different answers.
          </p>
        </>
      )),
      seed: SALES, fresh: true, select: 'A1', resetPanels: true,
    },
    custom({
      id: 'avg', title: 'Average',
      body: (
        <p>
          What is the <strong>average Revenue per order</strong> for each <strong>Product</strong>? Rows = Product, Value = <strong>Average</strong> of
          Revenue.
        </p>
      ),
      hint: 'Change "Sum" to "Average" in the value row.',
      success: 'Books average 45 per order, Bags about 91.67.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Product' && cfg(c)?.values[0]?.field === 'Revenue' && cfg(c)?.values[0]?.agg === 'average' && close(cell(c, 'Book'), 45),
      sol: { pivot: { ...PIV, rows: 'Product', values: [{ field: 'Revenue', agg: 'average' }] }, view: 'pivot' },
    }),
    custom({
      id: 'count', title: 'Count',
      body: <p>How many <strong>orders</strong> did each <strong>Region</strong> make? Rows = Region, Value = <strong>Count</strong> of Revenue.</p>,
      hint: 'Count counts rows, whatever the field.',
      success: 'North has 4 orders, South and East 3, West 2.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Region' && cfg(c)?.values[0]?.agg === 'count' && cell(c, 'North') === 4 && cell(c, 'West') === 2,
      sol: { pivot: { ...PIV, rows: 'Region', values: [{ field: 'Revenue', agg: 'count' }] }, view: 'pivot' },
    }),
    custom({
      id: 'max', title: 'Max',
      body: <p>What was the <strong>biggest single order</strong> (Revenue) for each Product? Use <strong>Max</strong>.</p>,
      hint: 'Rows = Product, value = Max of Revenue.',
      success: 'Bags peak at 125.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Product' && cfg(c)?.values[0]?.agg === 'max' && cell(c, 'Bag') === 125 && cell(c, 'Pen') === 28,
      sol: { pivot: { ...PIV, rows: 'Product', values: [{ field: 'Revenue', agg: 'max' }] }, view: 'pivot' },
    }),
    custom({
      id: 'pct', title: 'Show values as a percentage',
      body: (
        <>
          <p>
            Show each region's <strong>share of total revenue</strong>. Rows = Region, Value = Sum of Revenue, then set{' '}
            <strong>Show values as</strong> to <strong>% of Grand Total</strong>.
          </p>
        </>
      ),
      hint: 'The Show values as drop-down sits under the Values area.',
      success: 'North is 34.2% of all revenue. The grand total reads 100%.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Region' && cfg(c)?.values[0]?.show === 'pctTotal' && close(cell(c, 'North'), 192 / 561, 0.001),
      sol: { pivot: { ...PIV, rows: 'Region', values: [{ field: 'Revenue', agg: 'sum', show: 'pctTotal' }] }, view: 'pivot' },
    }),
  ],
};

export const grouping: LessonContent = {
  key: 'da-grouping',
  title: 'Grouping dates',
  pivot: { source: SRC, features: { group: true } },
  steps: [
    {
      ...info('intro', 'Turn daily rows into months and quarters', (
        <>
          <p>
            Our orders have exact dates. Nobody wants a row per day. <strong>Grouping</strong> rolls dates up into{' '}
            <strong>months, quarters or years</strong> so trends appear.
          </p>
        </>
      )),
      seed: SALES, fresh: true, select: 'A1', resetPanels: true,
    },
    custom({
      id: 'month', title: 'Group by month',
      body: (
        <p>
          Set <strong>Rows</strong> to <strong>Date</strong>, use <strong>Group Rows by → Months</strong>, and sum <strong>Revenue</strong>.
        </p>
      ),
      hint: 'Pick the Group Rows by drop-down after choosing the Date field.',
      success: 'January 134, February 186, March 241. Sales are climbing.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Date' && cfg(c)?.group === 'month' && cell(c, 'Jan 2026') === 134 && cell(c, 'Mar 2026') === 241,
      sol: { pivot: { ...PIV, rows: 'Date', group: 'month', values: [sum('Revenue')] }, view: 'pivot' },
    }),
    custom({
      id: 'quarter', title: 'Group by quarter',
      body: <p>Roll it up further: group the same pivot by <strong>Quarters</strong>.</p>,
      hint: 'Q1 covers January to March.',
      success: 'One quarter, 561. Higher levels hide detail and show the big picture.',
      view: 'pivot',
      check: (c) => cfg(c)?.rows === 'Date' && cfg(c)?.group === 'quarter' && cell(c, 'Q1 2026') === 561,
      sol: { pivot: { ...PIV, rows: 'Date', group: 'quarter', values: [sum('Revenue')] }, view: 'pivot' },
    }),
    custom({
      id: 'cross', title: 'Months against products',
      body: (
        <p>
          Group by <strong>Months</strong> again and add <strong>Product</strong> in <strong>Columns</strong>.
        </p>
      ),
      hint: 'Rows = Date (months), Columns = Product.',
      success: 'Bags took off in March: 150.',
      view: 'pivot',
      check: (c) => cfg(c)?.rows === 'Date' && cfg(c)?.group === 'month' && cfg(c)?.cols === 'Product' && cell(c, 'Mar 2026', 'Bag') === 150,
      sol: { pivot: { ...PIV, rows: 'Date', group: 'month', cols: 'Product', values: [sum('Revenue')] }, view: 'pivot' },
    }),
  ],
};

export const calculatedFields: LessonContent = {
  key: 'da-calculated-fields',
  title: 'Calculated fields',
  pivot: { source: SRC, features: { calc: true } },
  steps: [
    {
      ...info('intro', 'Add your own measure', (
        <>
          <p>
            The data has <strong>Revenue</strong> and <strong>Cost</strong> but no profit column. A <strong>calculated field</strong> adds a new
            measure inside the pivot, built from the other fields.
          </p>
          <p>
            Formulas use field names: <F>{'Revenue-Cost'}</F>. The pivot first adds up each field, then applies the formula.
          </p>
        </>
      )),
      seed: SALES, fresh: true, select: 'A1', resetPanels: true,
    },
    custom({
      id: 'profit', title: 'Profit by region',
      body: (
        <>
          <p>
            In the <strong>Calculated field</strong> box, name it <strong>Profit</strong>, formula <strong>Revenue-Cost</strong>, press{' '}
            <strong>Add field</strong>. Then set Rows = Region and Values = <strong>Profit</strong>.
          </p>
        </>
      ),
      hint: 'The new field appears in the Values drop-down.',
      success: 'North makes 98, South 53, East 52 and West 81.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.calc?.some((f) => f.name === 'Profit') === true && cfg(c)?.rows === 'Region' && cfg(c)?.values[0]?.field === 'Profit' && cell(c, 'North') === 98,
      sol: { pivot: { ...PIV, rows: 'Region', values: [sum('Profit')], calc: [{ name: 'Profit', formula: 'Revenue-Cost' }] }, view: 'pivot' },
    }),
    custom({
      id: 'margin', title: 'Profit margin',
      body: (
        <p>
          Add another calculated field called <strong>Margin</strong> with the formula <strong>(Revenue-Cost)/Revenue</strong>, and show it by
          Region.
        </p>
      ),
      hint: 'Brackets first: profit divided by revenue.',
      success: 'North margin is about 51%. It is a ratio of totals, which is right.',
      view: 'pivot',
      check: (c) => cfg(c)?.calc?.some((f) => f.name === 'Margin') === true && cfg(c)?.values[0]?.field === 'Margin' && close(cell(c, 'North'), 98 / 192, 0.001),
      sol: { pivot: { ...PIV, rows: 'Region', values: [sum('Margin')], calc: [{ name: 'Profit', formula: 'Revenue-Cost' }, { name: 'Margin', formula: '(Revenue-Cost)/Revenue' }] }, view: 'pivot' },
    }),
    custom({
      id: 'both', title: 'Two measures side by side',
      body: <p>Show <strong>Sum of Revenue</strong> and <strong>Profit</strong> together: two value rows, Rows = Region.</p>,
      hint: 'Press + Add value for the second measure.',
      success: 'Revenue and profit next to each other.',
      view: 'pivot',
      check: (c) => (cfg(c)?.values.length ?? 0) >= 2 && cfg(c)?.values.some((v) => v.field === 'Revenue') === true && cfg(c)?.values.some((v) => v.field === 'Profit') === true && cell(c, 'North', 'Profit') === 98,
      sol: { pivot: { ...PIV, rows: 'Region', values: [sum('Revenue'), sum('Profit')], calc: [{ name: 'Profit', formula: 'Revenue-Cost' }] }, view: 'pivot' },
    }),
  ],
};

export const pivotSlicers: LessonContent = {
  key: 'da-pivot-slicers',
  title: 'Filters & slicers',
  pivot: { source: SRC, features: { filter: true, slicers: true } },
  steps: [
    {
      ...info('intro', 'Filter the whole pivot', (
        <>
          <p>
            A <strong>report filter</strong> limits the pivot to one value of a field. A <strong>slicer</strong> does it with clickable buttons and
            can keep several values.
          </p>
        </>
      )),
      seed: SALES, fresh: true, select: 'A1', resetPanels: true,
    },
    custom({
      id: 'filter', title: 'Report filter',
      body: <p>Rows = Region, Value = Sum of Revenue. Add a <strong>Report filter</strong> on <strong>Product = Pen</strong>.</p>,
      hint: 'Use the Report filter drop-downs.',
      success: 'Only pen sales are counted: North 38.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Region' && cfg(c)?.filter?.field === 'Product' && cfg(c)?.filter?.value === 'Pen' && cell(c, 'North') === 38,
      sol: { pivot: { ...PIV, rows: 'Region', values: [sum('Revenue')], filter: { field: 'Product', value: 'Pen' } }, view: 'pivot' },
    }),
    custom({
      id: 'slicer', title: 'A slicer',
      body: (
        <>
          <p>
            Remove the report filter. Use <strong>Slicer</strong> on <strong>Product</strong>, then switch off <strong>Pen</strong> and{' '}
            <strong>Bag</strong> so only <strong>Book</strong> is selected.
          </p>
        </>
      ),
      hint: 'Click a slicer button to toggle it.',
      success: 'Books only: South 99, North 54, East 27, and West disappears (no books).',
      view: 'pivot', resetPanels: true,
      check: (c) => !cfg(c)?.filter && JSON.stringify(cfg(c)?.slicers?.Product) === JSON.stringify(['Book']) && cell(c, 'South') === 99,
      sol: { pivot: { ...PIV, rows: 'Region', values: [sum('Revenue')], slicers: { Product: ['Book'] } }, view: 'pivot' },
    }),
  ],
};

export const refreshPivot: LessonContent = {
  key: 'da-refresh',
  title: 'Refresh & source data',
  pivot: { source: SRC },
  steps: [
    {
      ...info('intro', 'A pivot is a snapshot', (
        <>
          <p>
            A PivotTable does <strong>not</strong> update when the source data changes. It keeps the numbers from when it was last built. You must
            press <strong>Refresh</strong>. This catches people out constantly.
          </p>
        </>
      )),
      seed: SALES, fresh: true, select: 'A1', resetPanels: true,
    },
    custom({
      id: 'build', title: 'Build the pivot',
      body: <p>Rows = Region, Value = Sum of Revenue.</p>,
      hint: 'North should show 192.',
      success: 'North 192.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Region' && cfg(c)?.values[0]?.field === 'Revenue' && cell(c, 'North') === 192,
      sol: { pivot: { ...PIV, rows: 'Region', values: [sum('Revenue')] }, view: 'pivot' },
    }),
    custom({
      id: 'change', title: 'Change the source',
      body: (
        <>
          <p>
            Go to the <strong>Data</strong> tab and change the first order's revenue in <Cell>E2</Cell> from 20 to <strong>120</strong>. Then come
            back to the pivot.
          </p>
        </>
      ),
      hint: 'Click E2, type 120, Enter. Watch the pivot warn you it is stale.',
      success: 'The pivot still says 192. It has not noticed the change.',
      view: 'sheet', select: 'E2',
      check: (c) => c.value('E2') === 120 && c.pivot?.fresh === false && !c.editing,
      sol: { cells: { E2: '120' }, view: 'sheet' },
    }),
    custom({
      id: 'refresh', title: 'Press Refresh',
      body: <p>Open the PivotTable tab and press <strong>Refresh</strong>.</p>,
      hint: 'The Refresh button glows when the pivot is out of date.',
      success: 'North is now 292. Always refresh before you report numbers.',
      view: 'pivot',
      check: (c) => c.pivot?.fresh === true && cell(c, 'North') === 292,
      sol: { pivot: { ...PIV, rows: 'Region', values: [sum('Revenue')] }, view: 'pivot' },
    }),
  ],
};

export const unit3Test: LessonContent = {
  key: 'da-unit3-test',
  title: 'Unit 3 test',
  pivot: { source: SRC, features: { showAs: true, group: true, calc: true } },
  steps: [
    {
      ...info('intro', 'PivotTable test', <p>Five pivot questions on the sales data. Build each in the PivotTable tab.</p>),
      seed: SALES, fresh: true, select: 'A1', resetPanels: true,
    },
    custom({
      id: 'sum', title: '1. Total by region',
      body: <p>Total <strong>Revenue</strong> for each <strong>Region</strong>.</p>,
      hint: 'Rows = Region, Sum of Revenue.',
      success: 'Correct.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Region' && cfg(c)?.values[0]?.field === 'Revenue' && cfg(c)?.values[0]?.agg === 'sum' && cell(c, 'West') === 153,
      sol: { pivot: { ...PIV, rows: 'Region', values: [sum('Revenue')] }, view: 'pivot' },
    }),
    custom({
      id: 'avg', title: '2. Average units',
      body: <p>The <strong>average Units per order</strong> for each <strong>Product</strong>.</p>,
      hint: 'Average of Units by Product.',
      success: 'Correct.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Product' && cfg(c)?.values[0]?.field === 'Units' && cfg(c)?.values[0]?.agg === 'average' && close(cell(c, 'Bag'), 11 / 3, 0.001),
      sol: { pivot: { ...PIV, rows: 'Product', values: [{ field: 'Units', agg: 'average' }] }, view: 'pivot' },
    }),
    custom({
      id: 'month', title: '3. Revenue by month',
      body: <p>Total Revenue by <strong>month</strong>.</p>,
      hint: 'Group the Date field by months.',
      success: 'Correct.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.group === 'month' && cell(c, 'Feb 2026') === 186,
      sol: { pivot: { ...PIV, rows: 'Date', group: 'month', values: [sum('Revenue')] }, view: 'pivot' },
    }),
    custom({
      id: 'share', title: '4. Share of total',
      body: <p>Each <strong>Product</strong>'s share of total Revenue, as a percentage of the grand total.</p>,
      hint: 'Show values as % of Grand Total.',
      success: 'Correct.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Product' && cfg(c)?.values[0]?.show === 'pctTotal' && close(cell(c, 'Bag'), 275 / 561, 0.001),
      sol: { pivot: { ...PIV, rows: 'Product', values: [{ field: 'Revenue', agg: 'sum', show: 'pctTotal' }] }, view: 'pivot' },
    }),
    custom({
      id: 'profit', title: '5. Profit',
      body: <p>Add a <strong>Profit</strong> calculated field (Revenue minus Cost) and show it by <strong>Product</strong>.</p>,
      hint: 'Formula: Revenue-Cost.',
      success: 'Unit 3 complete.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Product' && cfg(c)?.values[0]?.field === 'Profit' && cell(c, 'Bag') === 275 - 132,
      sol: { pivot: { ...PIV, rows: 'Product', values: [sum('Profit')], calc: [{ name: 'Profit', formula: 'Revenue-Cost' }] }, view: 'pivot' },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 4 · Charts
// ---------------------------------------------------------------------------
const MONTHS = grid([
  ['Month', 'Revenue', 'Margin %'],
  ['Jan', 120, 0.22], ['Feb', 150, 0.25], ['Mar', 90, 0.18], ['Apr', 200, 0.3], ['May', 170, 0.27], ['Jun', 210, 0.31],
]);
const REGIONS = grid([['Region', 'Revenue'], ['North', 192], ['South', 115], ['East', 101], ['West', 153]]);
const SHARE = grid([['Brand', 'Share'], ['Alpha', 45], ['Beta', 30], ['Gamma', 15], ['Delta', 10]]);
const LONG = grid([['Product', 'Sales'], ['Wireless noise-cancelling headphones', 420], ['Ergonomic standing desk converter', 310], ['USB-C docking station', 260], ['Mechanical keyboard', 180], ['Laptop sleeve', 90]]);

const chart = (c: StepCtx) => c.chart;
const cc = (c: StepCtx) => c.chart?.config;
const sers = (c: StepCtx) => c.chart?.data.series.length ?? 0;
const cats = (c: StepCtx) => c.chart?.data.categories.length ?? 0;

const pickChart = (id: string, title: string, body: React.ReactNode, seed: Cells, range: string, type: string | string[], n: number, hint: string, success: string) =>
  custom({
    id, title, body, hint, success, seed, fresh: true, select: 'A1', view: 'chart', resetPanels: true,
    check: (c) => (Array.isArray(type) ? type : [type]).includes(cc(c)?.type ?? '') && cats(c) === n && !cc(c)?.fromPivot,
    sol: { chart: { range, type: (Array.isArray(type) ? type[0] : type) as 'line' }, view: 'chart' },
  });

export const pickRightChart: LessonContent = {
  key: 'da-pick-chart',
  title: 'Pick the right chart',
  chart: {},
  steps: [
    {
      ...info('intro', 'The chart must fit the question', (
        <>
          <p>A good chart answers one question at a glance. A bad one makes people think. The rules of thumb:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Change over time</strong> → <strong>Line</strong>
            </li>
            <li>
              <strong>Compare a few categories</strong> → <strong>Column</strong> (or Bar)
            </li>
            <li>
              <strong>Share of a whole</strong> (parts add to 100%) → <strong>Pie</strong> with few slices
            </li>
            <li>
              <strong>Long labels or rankings</strong> → <strong>Bar</strong> (horizontal)
            </li>
          </ul>
          <p>
            Open the <strong>Chart</strong> tab, type the data range (or select it in the Data tab and press "Use selected cells").
          </p>
        </>
      )),
      seed: MONTHS, fresh: true, select: 'A1', resetPanels: true,
    },
    pickChart('trend', 'Show a trend', <p>Chart the monthly <strong>Revenue</strong> (A1:B7) so people see how it changes over time.</p>, MONTHS, 'A1:B7', 'line', 6, 'Time on the horizontal axis points to a Line chart.', 'A line shows the climb (with a dip in March).'),
    pickChart('compare', 'Compare categories', <p>Compare <strong>Revenue</strong> between the four regions (A1:B5).</p>, REGIONS, 'A1:B5', ['column', 'bar'], 4, 'A Column chart lines up the four bars side by side.', 'Columns make the differences easy to compare.'),
    pickChart('share', 'Show a share of the whole', <p>These four brands split the market (A1:B5). Show each brand's <strong>share</strong>.</p>, SHARE, 'A1:B5', 'pie', 4, 'Shares of a whole: Pie.', 'A pie works because there are only four slices and they sum to a whole.'),
    pickChart('ranking', 'Rank long names', <p>Rank these products by <strong>Sales</strong> (A1:B6). The names are long.</p>, LONG, 'A1:B6', 'bar', 5, 'Long names read best along the side: Bar.', 'A horizontal bar gives long labels room.'),
  ],
};

export const buildChart: LessonContent = {
  key: 'da-build-chart',
  title: 'Build & edit a chart',
  chart: { allow: { axisTitles: true } },
  steps: [
    {
      ...info('intro', 'From range to chart', (
        <>
          <p>
            A chart needs a tidy block: a <strong>label column</strong> and <strong>value columns</strong> with headers. Excel reads the headers as
            series names. Then you polish it: title, labels, axis titles, remove clutter.
          </p>
        </>
      )),
      seed: MONTHS, fresh: true, select: 'A1', resetPanels: true,
    },
    custom({
      id: 'column', title: 'A column chart with a title',
      body: <p>Build a <strong>Column</strong> chart of A1:B7 and give it a title that mentions revenue.</p>,
      hint: 'Pick Column, type A1:B7 as the range, then fill in Chart title.',
      success: 'The title tells the reader what they are looking at.',
      view: 'chart', resetPanels: true,
      check: (c) => cc(c)?.type === 'column' && sers(c) === 1 && cats(c) === 6 && /revenue/i.test(cc(c)?.title ?? ''),
      sol: { chart: { type: 'column', range: 'A1:B7', title: 'Monthly revenue' }, view: 'chart' },
    }),
    custom({
      id: 'labels', title: 'Add data labels',
      body: <p>Switch on <strong>Data labels</strong> so people can read exact values without hunting along the axis.</p>,
      hint: 'Tick the Data labels box.',
      success: 'Values sit on top of each bar.',
      view: 'chart',
      check: (c) => cc(c)?.type === 'column' && cc(c)?.labels === true && /revenue/i.test(cc(c)?.title ?? ''),
      sol: { chart: { type: 'column', range: 'A1:B7', title: 'Monthly revenue', labels: true }, view: 'chart' },
    }),
    custom({
      id: 'legend', title: 'Remove what is not needed',
      body: <p>With one series, the <strong>Legend</strong> only repeats the title. Turn it off.</p>,
      hint: 'Untick Legend.',
      success: 'Less clutter. Every element on a chart should earn its place.',
      view: 'chart',
      check: (c) => cc(c)?.legend === false && cc(c)?.labels === true && sers(c) === 1,
      sol: { chart: { type: 'column', range: 'A1:B7', title: 'Monthly revenue', labels: true, legend: false }, view: 'chart' },
    }),
    custom({
      id: 'axes', title: 'Name the axes',
      body: <p>Add a <strong>horizontal axis title</strong> (for example Month) and a <strong>vertical axis title</strong> (for example Revenue ($)).</p>,
      hint: 'Both axis title boxes should have text.',
      success: 'Now nobody has to guess the units.',
      view: 'chart',
      check: (c) => !!cc(c)?.xTitle?.trim() && !!cc(c)?.yTitle?.trim() && cc(c)?.legend === false,
      sol: { chart: { type: 'column', range: 'A1:B7', title: 'Monthly revenue', labels: true, legend: false, xTitle: 'Month', yTitle: 'Revenue ($)' }, view: 'chart' },
    }),
  ],
};

export const comboChart: LessonContent = {
  key: 'da-combo-chart',
  title: 'Combo & secondary axis',
  chart: { allow: { axisTitles: true } },
  steps: [
    {
      ...info('intro', 'Two measures, one chart', (
        <>
          <p>
            <strong>Revenue</strong> is in hundreds. <strong>Margin %</strong> is between 0 and 1. Put them on the same scale and the margin line is flat at the
            bottom. A <strong>combo chart</strong> draws revenue as <strong>columns</strong> and margin as a <strong>line</strong>, and a{' '}
            <strong>secondary axis</strong> gives the line its own scale on the right.
          </p>
        </>
      )),
      seed: MONTHS, fresh: true, select: 'A1', resetPanels: true,
    },
    custom({
      id: 'combo', title: 'Make a combo chart',
      body: <p>Choose <strong>Combo</strong> and chart the whole table, A1:C7.</p>,
      hint: 'Two series: Revenue as columns, Margin % as a line.',
      success: 'Columns plus a line. But the line is squashed flat.',
      view: 'chart', resetPanels: true,
      check: (c) => cc(c)?.type === 'combo' && sers(c) === 2 && cats(c) === 6,
      sol: { chart: { type: 'combo', range: 'A1:C7' }, view: 'chart' },
    }),
    custom({
      id: 'secondary', title: 'Move the line to a secondary axis',
      body: <p>Tick <strong>Second series on secondary axis</strong>.</p>,
      hint: 'The right-hand axis (in red) belongs to Margin %.',
      success: 'The margin line now has room to show its trend.',
      view: 'chart',
      check: (c) => cc(c)?.type === 'combo' && cc(c)?.secondary === true && sers(c) === 2,
      sol: { chart: { type: 'combo', range: 'A1:C7', secondary: true }, view: 'chart' },
    }),
    custom({
      id: 'finish', title: 'Finish it properly',
      body: <p>Add a <strong>title</strong> and turn on <strong>Data labels</strong>. A finished combo chart tells its story on its own.</p>,
      hint: 'Title: something like "Revenue and margin".',
      success: 'Revenue in columns, margin as a line. Two answers, one glance.',
      view: 'chart',
      check: (c) => cc(c)?.type === 'combo' && cc(c)?.secondary === true && cc(c)?.labels === true && (cc(c)?.title ?? '').trim().length >= 6,
      sol: { chart: { type: 'combo', range: 'A1:C7', secondary: true, labels: true, title: 'Revenue and margin' }, view: 'chart' },
    }),
  ],
};

const REPT_SEED = grid([['Month', 'Revenue'], ['Jan', 120], ['Feb', 150], ['Mar', 90], ['Apr', 200], ['May', 170], ['Jun', 210]]);
const bars = (n: number) => (v: E.Scalar) => typeof v === 'string' && /^[|█■#▌=]+$/.test(v) && v.length === n;

export const miniCharts: LessonContent = {
  key: 'da-mini-charts',
  title: 'Mini charts in cells',
  steps: [
    info('intro', 'A chart inside a cell', (
      <>
        <p>
          You do not always need a full chart. The <F>{'REPT'}</F> function repeats a character, so it can draw a tiny bar right inside a cell. It
          is a classic dashboard trick that stays live as the data changes.
        </p>
        <p>
          <F>{'=REPT("|",B2/10)'}</F> prints 12 bars for 120.
        </p>
      </>
    )),
    task({
      id: 'rept', title: 'Draw a bar',
      body: (
        <p>
          In <Cell>C2</Cell> type <F>{'=REPT("|",B2/10)'}</F>. You can use <F>{'"█"'}</F> instead of <F>{'"|"'}</F> if you can type it.
        </p>
      ),
      hint: 'The second argument is how many times to repeat.',
      success: '12 bars for Jan.',
      seed: REPT_SEED, fresh: true, select: 'C2',
      cells: { C2: bars(12) }, uses: 'REPT', sol: { C2: '=REPT("|",B2/10)' },
    }),
    task({
      id: 'fill', title: 'Fill it down',
      body: <p>Fill <Cell>C2</Cell> down to <Cell>C7</Cell> to draw all six months.</p>,
      hint: 'Select C2:C7, then Ctrl + D.',
      success: 'A little bar chart that updates when the numbers change.',
      seed: { ...REPT_SEED, C2: '=REPT("|",B2/10)' }, select: 'C2',
      cells: { C2: bars(12), C3: bars(15), C5: bars(20), C7: bars(21) }, uses: 'REPT',
      sol: Object.fromEntries([3, 4, 5, 6, 7].map((r) => [`C${r}`, `=REPT("|",B${r}/10)`])),
    }),
    task({
      id: 'label', title: 'Add the number',
      body: (
        <>
          <p>
            Show the value <em>and</em> the bar in <Cell>D2</Cell>: <F>{'=B2&" "&REPT("|",B2/10)'}</F>.
          </p>
        </>
      ),
      hint: '& glues text together. The space goes in quotes.',
      success: '120 followed by the bar.',
      seed: REPT_SEED, select: 'D2',
      cells: { D2: (v) => typeof v === 'string' && /^120 \|{12}$/.test(v) || (typeof v === 'string' && /^120 [█■#▌=]{12}$/.test(v)) }, uses: 'REPT',
      sol: { D2: '=B2&" "&REPT("|",B2/10)' },
    }),
  ],
};

export const chartDesign: LessonContent = {
  key: 'da-chart-design',
  title: 'Design for clarity',
  chart: { allow: { axisTitles: true }, initial: { type: 'column', range: 'A1:B7', legend: true, labels: false, gridlines: true, title: '' } },
  steps: [
    {
      ...info('intro', 'This chart is hard to read', (
        <>
          <p>
            Open the <strong>Chart</strong> tab. It shows monthly revenue, but it has no title, a pointless legend, loud gridlines and no labels. Clear
            charts follow a few simple rules:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Say the insight in the title</li>
            <li>Remove everything that does not help</li>
            <li>Label the values directly</li>
            <li>Use the chart type that fits the data</li>
          </ul>
        </>
      )),
      seed: MONTHS, fresh: true, select: 'A1', resetPanels: true, view: 'chart',
    },
    custom({
      id: 'title', title: 'Write a title that says something',
      body: <p>Give it a title of at least a few words that states the point, such as "Revenue grew 75% from January to June".</p>,
      hint: 'A title that names the takeaway beats "Chart 1".',
      success: 'Readers know what to notice before they look.',
      view: 'chart',
      check: (c) => (cc(c)?.title ?? '').trim().split(/\s+/).length >= 3,
      sol: { chart: { type: 'column', range: 'A1:B7', title: 'Revenue grew 75% since January' }, view: 'chart' },
    }),
    custom({
      id: 'clutter', title: 'Cut the clutter',
      body: <p>Turn off the <strong>Legend</strong> (one series) and the <strong>Gridlines</strong>, and turn on <strong>Data labels</strong>.</p>,
      hint: 'Three checkboxes.',
      success: 'Cleaner, and the numbers are right on the bars.',
      view: 'chart',
      check: (c) => cc(c)?.legend === false && cc(c)?.gridlines === false && cc(c)?.labels === true && (cc(c)?.title ?? '').trim().length > 0,
      sol: { chart: { type: 'column', range: 'A1:B7', title: 'Revenue grew 75% since January', legend: false, gridlines: false, labels: true }, view: 'chart' },
    }),
    custom({
      id: 'type', title: 'Right type for the story',
      body: <p>The story is a <strong>trend over time</strong>. Switch the chart type to <strong>Line</strong>.</p>,
      hint: 'Pick Line.',
      success: 'The line shows the rise and the March dip at a glance.',
      view: 'chart',
      check: (c) => cc(c)?.type === 'line' && cc(c)?.legend === false && cc(c)?.labels === true,
      sol: { chart: { type: 'line', range: 'A1:B7', title: 'Revenue grew 75% since January', legend: false, gridlines: false, labels: true }, view: 'chart' },
    }),
  ],
};

export const pivotCharts: LessonContent = {
  key: 'da-pivot-charts',
  title: 'Pivot charts',
  pivot: { source: SRC },
  chart: { allow: { pivot: true } },
  steps: [
    {
      ...info('intro', 'A chart that follows the pivot', (
        <>
          <p>
            A <strong>PivotChart</strong> is a chart tied to a PivotTable. Change the pivot and the chart redraws. It is the fastest way to explore
            data visually.
          </p>
        </>
      )),
      seed: SALES, fresh: true, select: 'A1', resetPanels: true,
    },
    custom({
      id: 'pivot', title: 'Build the pivot',
      body: <p>In the PivotTable tab: Rows = <strong>Region</strong>, Value = Sum of <strong>Revenue</strong>.</p>,
      hint: 'You will chart this next.',
      success: 'North 192, South 115, East 101, West 153.',
      view: 'pivot', resetPanels: true,
      check: (c) => cfg(c)?.rows === 'Region' && cfg(c)?.values[0]?.field === 'Revenue' && cell(c, 'North') === 192,
      sol: { pivot: { ...PIV, rows: 'Region', values: [sum('Revenue')] }, view: 'pivot' },
    }),
    custom({
      id: 'chart', title: 'Chart the pivot',
      body: <p>Open the <strong>Chart</strong> tab, choose <strong>PivotTable</strong> as the source and pick a <strong>Column</strong> chart.</p>,
      hint: 'Use the Sheet range / PivotTable buttons.',
      success: 'The four regions are charted straight from the pivot.',
      view: 'chart',
      check: (c) => cc(c)?.fromPivot === true && cc(c)?.type === 'column' && cats(c) === 4,
      sol: { chart: { type: 'column', fromPivot: true }, view: 'chart' },
    }),
    custom({
      id: 'follow', title: 'Change the pivot, the chart follows',
      body: <p>Go back to the PivotTable tab and change Rows to <strong>Product</strong>. Then look at the chart again.</p>,
      hint: 'The chart should now show Bag, Book, Pen.',
      success: 'Three products now. The chart rebuilt itself.',
      view: 'pivot',
      check: (c) => cfg(c)?.rows === 'Product' && cc(c)?.fromPivot === true && JSON.stringify(c.chart?.data.categories) === JSON.stringify(['Bag', 'Book', 'Pen']),
      sol: { pivot: { ...PIV, rows: 'Product', values: [sum('Revenue')] }, chart: { type: 'column', fromPivot: true }, view: 'pivot' },
    }),
  ],
};

export const unit4Test: LessonContent = {
  key: 'da-unit4-test',
  title: 'Unit 4 test',
  chart: { allow: { axisTitles: true } },
  steps: [
    { ...info('intro', 'Charts test', <p>Five chart tasks. Use the Chart tab.</p>), seed: MONTHS, fresh: true, select: 'A1', resetPanels: true },
    custom({
      id: 'trend', title: '1. The right type',
      body: <p>Chart monthly <strong>Revenue</strong> (A1:B7) to show the trend over time.</p>,
      hint: 'Line.',
      success: 'Correct.',
      view: 'chart', resetPanels: true,
      check: (c) => cc(c)?.type === 'line' && sers(c) === 1 && cats(c) === 6,
      sol: { chart: { type: 'line', range: 'A1:B7' }, view: 'chart' },
    }),
    custom({
      id: 'title', title: '2. Title and labels',
      body: <p>Make it a <strong>Column</strong> chart with a <strong>title</strong> and <strong>data labels</strong>.</p>,
      hint: 'Column, A1:B7, any title, tick Data labels.',
      success: 'Correct.',
      view: 'chart', resetPanels: true,
      check: (c) => cc(c)?.type === 'column' && cc(c)?.labels === true && (cc(c)?.title ?? '').trim().length >= 3,
      sol: { chart: { type: 'column', range: 'A1:B7', labels: true, title: 'Monthly revenue' }, view: 'chart' },
    }),
    custom({
      id: 'combo', title: '3. Two measures',
      body: <p>Chart <strong>Revenue and Margin %</strong> together so the margin line is readable.</p>,
      hint: 'Combo with the second series on the secondary axis.',
      success: 'Correct.',
      view: 'chart', resetPanels: true,
      check: (c) => cc(c)?.type === 'combo' && cc(c)?.secondary === true && sers(c) === 2,
      sol: { chart: { type: 'combo', range: 'A1:C7', secondary: true }, view: 'chart' },
    }),
    custom({
      id: 'pie', title: '4. Share of a whole',
      body: <p>Show brand <strong>Share</strong> (A1:B5 of the new data) as a pie chart.</p>,
      hint: 'Pie, range A1:B5.',
      success: 'Correct.',
      seed: SHARE, fresh: true, select: 'A1', view: 'chart', resetPanels: true,
      check: (c) => cc(c)?.type === 'pie' && cats(c) === 4,
      sol: { chart: { type: 'pie', range: 'A1:B5' }, view: 'chart' },
    }),
    task({
      id: 'bar', title: '5. A bar in a cell',
      body: <p>Back on the Data tab, in <Cell>C2</Cell> draw a bar for the first share (45) with <F>REPT</F>, one character per 5.</p>,
      hint: '=REPT("|",B2/5)',
      success: 'Unit 4 complete.',
      seed: SHARE, fresh: true, select: 'C2', view: 'sheet', resetPanels: true,
      cells: { C2: bars(9) }, uses: 'REPT', sol: { C2: '=REPT("|",B2/5)' },
    }),
  ],
};
