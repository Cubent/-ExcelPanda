// Data & Dashboards, unit 1: Power Query basics.
import { Cell } from './kbd';
import { FILES, FOLDERS, SRC, DD_SHEET, isErr, qCol, qHas, qLoaded, qSteps, qTable, qstep } from './dd-util';
import { info } from './dsl';
import type { LessonContent } from './types';
import type { PqStep } from '@/components/sheet/pq';

const CLEAN: PqStep[] = [
  ...SRC('sales.csv'),
  { op: 'transformText', cols: ['Product'], fn: 'trim' },
  { op: 'transformText', cols: ['Product', 'Region'], fn: 'proper' },
  { op: 'replace', col: 'Units', find: 'n/a', with: '0' },
  { op: 'changeType', col: 'Units', to: 'number' },
  { op: 'changeType', col: 'Price', to: 'number' },
];
const cfg = (initial: Record<string, PqStep[]> = {}) => ({ files: FILES, folders: FOLDERS, initial, noGetData: Object.keys(initial).length > 0 });
const bare = { files: FILES, folders: FOLDERS };

// ---------------------------------------------------------------------------
export const pqIntro: LessonContent = {
  key: 'dd-pq-intro',
  title: 'Meet Power Query',
  sheet: DD_SHEET,
  query: bare,
  steps: [
    info('intro', 'A repeatable way to clean data', (
      <>
        <p>
          <strong>Power Query</strong> is Excel's data-preparation tool. You build a query once, as a list of <strong>applied steps</strong>, and Excel replays it every time the source changes. No more
          copy, paste and fix by hand each month.
        </p>
        <p>This course uses a simulated Power Query editor next to your sheet. The steps and results match the real one, so what you learn transfers.</p>
      </>
    )),
    qstep({
      id: 'get', title: 'Get data from a file',
      body: <p>Open <strong>Get Data…</strong> in the Power Query tab and choose <strong>From file: sales.csv</strong>.</p>,
      hint: 'The Get Data list is in the top-left of the editor.',
      success: 'A query named sales appeared, with a Source step.',
      check: (c) => qSteps(c, 'sales').some((s) => s.op === 'source'),
      sol: [{ name: 'sales', steps: [{ op: 'source', file: 'sales.csv' }] }],
    }),
    qstep({
      id: 'headers', title: 'Promote the first row to headers',
      body: <p>The column names are still in row 1 of the data. Choose <strong>Use first row as headers</strong> and press <strong>Apply step</strong>.</p>,
      hint: 'Pick the transform in the list, then Apply step.',
      success: 'Date, Region, Product, Units, Price are now headers.',
      check: (c) => qTable(c, 'sales')?.cols[0] === 'Date' && qHas(c, 'sales', 'promoteHeaders'),
      sol: [{ name: 'sales', steps: [{ op: 'promoteHeaders' }] }],
    }),
    qstep({
      id: 'load', title: 'Close & Load to the sheet',
      body: (
        <p>
          Choose <strong>Close &amp; Load</strong>, then open the <strong>Data</strong> tab. The table lands in <Cell>A1</Cell>.
        </p>
      ),
      hint: 'Close & Load is at the top-right of the editor.',
      success: 'The result is now on your sheet, and Excel remembers how it was made.',
      check: (c) => qLoaded(c, 'sales') && c.raw('A1') === 'Date' && c.raw('E2') !== '',
      sol: [{ name: 'sales', steps: [], load: true }],
    }),
  ],
};

// ---------------------------------------------------------------------------
export const pqTypes: LessonContent = {
  key: 'dd-pq-types',
  title: 'Data types & errors',
  sheet: DD_SHEET,
  query: cfg({ sales: SRC('sales.csv') }),
  steps: [
    info('intro', 'Text that looks like a number is not a number', (
      <>
        <p>
          Everything in a CSV arrives as text. Setting the right <strong>data type</strong> is the first step of nearly every query, and the place where bad values show up as errors.
        </p>
      </>
    )),
    qstep({
      id: 'num', title: 'Change Units to a number',
      body: <p>Use <strong>Change type</strong> on the <strong>Units</strong> column, type <strong>number</strong>. One row will turn into an error.</p>,
      hint: 'Row 3 contains "n/a", which cannot become a number.',
      success: 'The n/a row is now an error. The rest are numbers.',
      check: (c) => qTable(c, 'sales')?.types?.Units === 'number' && qCol(qTable(c, 'sales'), 'Units').filter(isErr).length === 1,
      sol: [{ name: 'sales', steps: [{ op: 'changeType', col: 'Units', to: 'number' }] }],
    }),
    qstep({
      id: 'err', title: 'Remove the errors',
      body: <p>Use <strong>Remove errors</strong> on the Units column to drop the broken row.</p>,
      hint: 'Pick Remove errors, choose Units, Apply step.',
      success: '5 clean rows are left.',
      check: (c) => qTable(c, 'sales')?.rows.length === 5 && qCol(qTable(c, 'sales'), 'Units').every((v) => typeof v === 'number'),
      sol: [{ name: 'sales', steps: [{ op: 'removeErrors', col: 'Units' }] }],
    }),
    qstep({
      id: 'price', title: 'Type Price and Date',
      body: <p>Set <strong>Price</strong> to <strong>number</strong> and <strong>Date</strong> to <strong>date</strong>. Two steps.</p>,
      hint: 'Change type needs one column at a time.',
      success: 'Typed columns sort and calculate correctly.',
      check: (c) => qTable(c, 'sales')?.types?.Price === 'number' && qTable(c, 'sales')?.types?.Date === 'date',
      sol: [{ name: 'sales', steps: [{ op: 'changeType', col: 'Price', to: 'number' }, { op: 'changeType', col: 'Date', to: 'date' }] }],
    }),
    qstep({
      id: 'load', title: 'Load the typed table',
      body: <p>Close &amp; Load. Dates arrive as real dates and the numbers can be summed.</p>,
      hint: 'Close & Load, top-right.',
      success: 'Typed data on the sheet.',
      check: (c) => qLoaded(c, 'sales') && c.raw('A1') === 'Date' && typeof c.value('D2') === 'number',
      sol: [{ name: 'sales', steps: [], load: true }],
    }),
  ],
};

// ---------------------------------------------------------------------------
export const pqClean: LessonContent = {
  key: 'dd-pq-clean',
  title: 'Cleaning text & values',
  sheet: DD_SHEET,
  query: cfg({ sales: SRC('sales.csv') }),
  steps: [
    info('intro', 'Messy text is the usual problem', (
      <p>
        Extra spaces, MIXED case and placeholders like "n/a" make the same item look like several. Power Query fixes them with one step each, and the fixes re-run on every refresh.
      </p>
    )),
    qstep({
      id: 'trim', title: 'Trim the spaces',
      body: <p>The first product is <strong>" pen "</strong> with spaces around it. Use <strong>Format text</strong> with <strong>trim</strong> on <strong>Product</strong>.</p>,
      hint: 'Format text (trim, case), column Product, transform trim.',
      success: 'The spaces are gone.',
      check: (c) => qCol(qTable(c, 'sales'), 'Product')[0] === 'pen',
      sol: [{ name: 'sales', steps: [{ op: 'transformText', cols: ['Product'], fn: 'trim' }] }],
    }),
    qstep({
      id: 'case', title: 'Make the case consistent',
      body: <p>Now use <strong>proper</strong> on <strong>Product</strong> and <strong>Region</strong> so "BOOK", "book" and "Book" all match.</p>,
      hint: 'You can pick both columns in one step.',
      success: 'Pen, Book and Bag only.',
      check: (c) => {
        const t = qTable(c, 'sales');
        return qCol(t, 'Product').every((v) => ['Pen', 'Book', 'Bag'].includes(String(v))) && qCol(t, 'Region').every((v) => ['North', 'South', 'East'].includes(String(v)));
      },
      sol: [{ name: 'sales', steps: [{ op: 'transformText', cols: ['Product', 'Region'], fn: 'proper' }] }],
    }),
    qstep({
      id: 'replace', title: 'Replace a placeholder',
      body: <p>Replace <strong>n/a</strong> in <strong>Units</strong> with <strong>0</strong>.</p>,
      hint: 'Replace values: column Units, find n/a, replace with 0.',
      success: 'No more n/a.',
      check: (c) => qCol(qTable(c, 'sales'), 'Units').every((v) => v !== 'n/a') && qHas(c, 'sales', 'replace'),
      sol: [{ name: 'sales', steps: [{ op: 'replace', col: 'Units', find: 'n/a', with: '0' }] }],
    }),
    qstep({
      id: 'split', title: 'Split a column',
      body: <p>Split <strong>Date</strong> at the delimiter <strong>-</strong> into year, month and day columns.</p>,
      hint: 'Split column, column Date, delimiter -.',
      success: 'Date.1, Date.2 and Date.3 were created.',
      check: (c) => !!qTable(c, 'sales')?.cols.includes('Date.3'),
      sol: [{ name: 'sales', steps: [{ op: 'splitColumn', col: 'Date', delimiter: '-' }] }],
    }),
  ],
};

// ---------------------------------------------------------------------------
export const pqRows: LessonContent = {
  key: 'dd-pq-rows',
  title: 'Filtering, sorting & columns',
  sheet: DD_SHEET,
  query: cfg({ sales: CLEAN }),
  steps: [
    info('intro', 'Keep only what you need', (
      <p>Fewer rows and columns make everything after them faster and clearer. These are the everyday shaping steps.</p>
    )),
    qstep({
      id: 'filter', title: 'Filter rows',
      body: <p>Keep only the rows where <strong>Region</strong> is <strong>North</strong>.</p>,
      hint: 'Filter rows: Region, =, North.',
      success: 'Three North rows.',
      check: (c) => qTable(c, 'sales')?.rows.length === 3 && qCol(qTable(c, 'sales'), 'Region').every((v) => v === 'North'),
      sol: [{ name: 'sales', steps: [{ op: 'filter', col: 'Region', cmp: '=', value: 'North' }] }],
    }),
    qstep({
      id: 'sort', title: 'Sort',
      body: <p>Delete the filter step (the × beside it), then sort <strong>Units</strong> from largest to smallest.</p>,
      hint: 'Hover the step to see ×. Then Sort: Units, descending.',
      success: 'The biggest sale is on top.',
      check: (c) => qTable(c, 'sales')?.rows.length === 6 && qCol(qTable(c, 'sales'), 'Units')[0] === 12 && qSteps(c, 'sales').every((s) => s.op !== 'filter'),
      sol: [{ name: 'sales', steps: [{ op: 'sort', col: 'Units', asc: false }], remove: ['filter'] }],
    }),
    qstep({
      id: 'cols', title: 'Choose columns',
      body: <p>Keep only <strong>Region</strong>, <strong>Product</strong> and <strong>Units</strong>.</p>,
      hint: 'Choose columns to keep, then click the three names.',
      success: 'Three columns.',
      check: (c) => qTable(c, 'sales')?.cols.join(',') === 'Region,Product,Units',
      sol: [{ name: 'sales', steps: [{ op: 'keepColumns', cols: ['Region', 'Product', 'Units'] }] }],
    }),
    qstep({
      id: 'dups', title: 'Remove duplicates',
      body: <p>Keep one row per <strong>Product</strong> with <strong>Remove duplicates</strong>.</p>,
      hint: 'Pick Product as the column.',
      success: 'Three products.',
      check: (c) => qTable(c, 'sales')?.rows.length === 3,
      sol: [{ name: 'sales', steps: [{ op: 'removeDuplicates', cols: ['Product'] }] }],
    }),
  ],
};

// ---------------------------------------------------------------------------
export const pqAdd: LessonContent = {
  key: 'dd-pq-add',
  title: 'Adding columns',
  sheet: DD_SHEET,
  query: cfg({ sales: CLEAN }),
  steps: [
    info('intro', 'Calculate once, in the query', (
      <p>A custom column is computed for every row on every refresh, so the work never has to be redone in the sheet.</p>
    )),
    qstep({
      id: 'custom', title: 'Add a custom column',
      body: <p>Add a column named <strong>Revenue</strong> with the formula <strong>[Units]*[Price]</strong>.</p>,
      hint: 'Add custom column. Square brackets name a column.',
      success: 'Revenue: 20, 36, 0, 24, 54, 75.',
      check: (c) => JSON.stringify(qCol(qTable(c, 'sales'), 'Revenue')) === JSON.stringify([20, 36, 0, 24, 54, 75]),
      sol: [{ name: 'sales', steps: [{ op: 'addColumn', name: 'Revenue', formula: '[Units]*[Price]' }] }],
    }),
    qstep({
      id: 'cond', title: 'Add a conditional column',
      body: <p>Add <strong>Size</strong>: <strong>Big</strong> when Units is at least 10, otherwise <strong>Small</strong>.</p>,
      hint: 'Conditional column: if Units >= 10 then Big else Small.',
      success: 'Two Big rows.',
      check: (c) => qCol(qTable(c, 'sales'), 'Size').filter((v) => v === 'Big').length === 2 && qCol(qTable(c, 'sales'), 'Size').filter((v) => v === 'Small').length === 4,
      sol: [{ name: 'sales', steps: [{ op: 'conditionalColumn', name: 'Size', col: 'Units', cmp: '>=', value: '10', then: 'Big', else: 'Small' }] }],
    }),
    qstep({
      id: 'part', title: 'Extract a date part',
      body: <p>Change <strong>Date</strong> to a date, then use <strong>Extract date part</strong> to make a <strong>Month</strong> column.</p>,
      hint: 'Two steps: Change type to date, then Extract date part (month).',
      success: 'Months 1, 1, 1, 2, 2, 3.',
      check: (c) => JSON.stringify(qCol(qTable(c, 'sales'), 'Month')) === JSON.stringify([1, 1, 1, 2, 2, 3]),
      sol: [{ name: 'sales', steps: [{ op: 'changeType', col: 'Date', to: 'date' }, { op: 'datePart', col: 'Date', part: 'month', name: 'Month' }] }],
    }),
    qstep({
      id: 'load', title: 'Load it',
      body: <p>Close &amp; Load. The calculated columns arrive as plain values.</p>,
      hint: 'Close & Load.',
      success: 'Revenue is in column F.',
      check: (c) => qLoaded(c, 'sales') && c.value('F2') === 20,
      sol: [{ name: 'sales', steps: [], load: true }],
    }),
  ],
};

// ---------------------------------------------------------------------------
export const pqRefresh: LessonContent = {
  key: 'dd-pq-refresh',
  title: 'Steps, parameters & refresh',
  sheet: DD_SHEET,
  query: { files: FILES, folders: FOLDERS, params: { Min: '5' }, noGetData: true, initial: { sales: [...CLEAN, { op: 'filter', col: 'Units', cmp: '>', value: '@Min' }] } },
  steps: [
    info('intro', 'The query is a recipe', (
      <>
        <p>
          Every applied step builds on the one above. Click an earlier step to see the data <em>at that point</em>. A <strong>parameter</strong> is a value you can change without editing the steps,
          for example a minimum.
        </p>
      </>
    )),
    info('look', 'Travel back in time', (
      <p>
        Click the <strong>first step</strong> in Applied steps to see the raw data, then the <strong>last step</strong> to return. Each step is a snapshot, and deleting one (the × on hover) re-runs
        everything after it.
      </p>
    )),
    qstep({
      id: 'load', title: 'Load the query',
      body: <p>Close &amp; Load. Only rows with Units over the <strong>Min</strong> parameter (5) are loaded.</p>,
      hint: 'Close & Load.',
      success: 'Three rows on the sheet.',
      check: (c) => qLoaded(c, 'sales') && c.raw('A2') !== '' && c.raw('A5') === '',
      sol: [{ name: 'sales', steps: [], load: true }],
    }),
    qstep({
      id: 'param', title: 'Change the parameter, then Refresh',
      body: <p>Set the <strong>@Min</strong> box to <strong>8</strong>. A <strong>Refresh</strong> button appears. Press it.</p>,
      hint: 'The parameter box is at the top-right of the editor.',
      success: 'Refresh re-ran every step with the new value. Only the 10 and 12 remain.',
      check: (c) => c.query?.params.Min === '8' && qLoaded(c, 'sales') && c.query?.loaded.sales.rows.length === 2,
      sol: [{ name: 'sales', steps: [], params: { Min: '8' }, load: true }],
    }),
  ],
};

export const DD1 = [pqIntro, pqTypes, pqClean, pqRows, pqAdd, pqRefresh];
