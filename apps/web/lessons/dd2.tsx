// Data & Dashboards, unit 2: advanced Power Query.
import { Cell } from './kbd';
import { DD_SHEET, FILES, FOLDERS, SRC, isErr, qCol, qHas, qLoaded, qSteps, qTable, qstep } from './dd-util';
import { info } from './dsl';
import type { LessonContent } from './types';
import type { PqStep } from '@/components/sheet/pq';

const NUM = (col: string): PqStep => ({ op: 'changeType', col, to: 'number' });
const ORDERS: PqStep[] = [...SRC('orders.csv'), NUM('Amount')];
const CUST: PqStep[] = SRC('customers.csv');
const cfg = (initial: Record<string, PqStep[]>, noGetData = true) => ({ files: FILES, folders: FOLDERS, initial, noGetData });
const mergeStep = (kind: 'left' | 'inner' | 'leftAnti' | 'full', expand: string[] = ['Name']): PqStep => ({ op: 'merge', with: 'customers', leftKey: 'CustID', rightKey: 'CustID', kind, expand });
const names = (c: Parameters<typeof qCol>[0]) => qCol(c, 'Name');

// ---------------------------------------------------------------------------
export const pqMerge: LessonContent = {
  key: 'dd-pq-merge',
  title: 'Merge queries (lookups)',
  sheet: DD_SHEET,
  query: cfg({ orders: ORDERS, customers: CUST }),
  steps: [
    info('intro', 'A VLOOKUP that survives refresh', (
      <p>
        <strong>Merge</strong> joins two queries on a matching column, the way XLOOKUP would, but for the whole table at once. Two queries are ready: <strong>orders</strong> holds an order and a
        customer ID, <strong>customers</strong> holds the names. Click a tab to look at each.
      </p>
    )),
    qstep({
      id: 'merge', title: 'Bring in the customer name',
      body: (
        <p>
          On the <strong>orders</strong> tab choose <strong>Merge queries</strong>: merge with <strong>customers</strong> on <strong>CustID</strong> in both, join kind <strong>left</strong>, and bring in{' '}
          <strong>Name</strong>.
        </p>
      ),
      hint: 'Matching column in this query: CustID. Matching column in the other query: CustID. Columns to bring in: Name.',
      success: 'Every order now has a name. Order 1004 (customer C9) found no match, so it is empty.',
      check: (c) => JSON.stringify(names(qTable(c, 'orders'))) === JSON.stringify(['Ana', 'Ben', 'Ana', null, 'Cy']),
      sol: [{ name: 'orders', steps: [mergeStep('left')] }],
    }),
    qstep({
      id: 'filter', title: 'Drop the orders with no customer',
      body: <p>Filter <strong>Name</strong> so that only rows that are <strong>notNull</strong> remain.</p>,
      hint: 'Filter rows: Name, notNull.',
      success: 'Four orders with a known customer.',
      check: (c) => qTable(c, 'orders')?.rows.length === 4 && names(qTable(c, 'orders')).every((v) => typeof v === 'string'),
      sol: [{ name: 'orders', steps: [{ op: 'filter', col: 'Name', cmp: 'notNull', value: '' }] }],
    }),
    qstep({
      id: 'load', title: 'Load it',
      body: <p>Close &amp; Load the <strong>orders</strong> query. The name is in column <Cell>D</Cell>.</p>,
      hint: 'Make sure the orders tab is selected.',
      success: 'The merged table is on the sheet.',
      check: (c) => qLoaded(c, 'orders') && c.raw('D1') === 'Name' && c.raw('D2') === 'Ana',
      sol: [{ name: 'orders', steps: [], load: true }],
    }),
  ],
};

// ---------------------------------------------------------------------------
export const pqJoins: LessonContent = {
  key: 'dd-pq-joins',
  title: 'Join kinds',
  sheet: DD_SHEET,
  query: cfg({ orders: ORDERS, customers: CUST }),
  steps: [
    info('intro', 'The join kind decides which rows survive', (
      <>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>left</strong>: all rows of this query, plus matches (what you used).
          </li>
          <li>
            <strong>inner</strong>: only rows that match in both.
          </li>
          <li>
            <strong>leftAnti</strong>: only rows of this query with <em>no</em> match. A fast way to find orphans.
          </li>
          <li>
            <strong>full</strong>: everything from both.
          </li>
        </ul>
      </>
    )),
    qstep({
      id: 'inner', title: 'Inner join',
      body: <p>Merge orders with customers on <strong>CustID</strong>, join kind <strong>inner</strong>, bringing in <strong>Name</strong>.</p>,
      hint: 'Same as before; only the join kind changes.',
      success: 'Four rows. The unmatched order is gone.',
      check: (c) => qTable(c, 'orders')?.rows.length === 4 && qSteps(c, 'orders').some((s) => s.op === 'merge' && s.kind === 'inner'),
      sol: [{ name: 'orders', steps: [mergeStep('inner')] }],
    }),
    qstep({
      id: 'anti', title: 'Find the orphans',
      body: <p>Delete the merge step (× on hover), then merge again with join kind <strong>leftAnti</strong>. Which order has no customer?</p>,
      hint: 'Left anti keeps the rows of orders that have no match.',
      success: 'Order 1004: customer C9 is missing from the customer list. That is a data-quality problem worth fixing at the source.',
      check: (c) => qTable(c, 'orders')?.rows.length === 1 && qCol(qTable(c, 'orders'), 'OrderID')[0] === '1004',
      sol: [{ name: 'orders', remove: ['merge'], steps: [mergeStep('leftAnti', [])] }],
    }),
    qstep({
      id: 'full', title: 'Full outer join',
      body: <p>Replace the step with a <strong>full</strong> join, bringing in <strong>Name</strong>. Customer Di placed no orders; where do they appear?</p>,
      hint: 'Delete the merge step, merge again with join kind full.',
      success: 'Six rows: five orders plus Di, who has no order.',
      check: (c) => qTable(c, 'orders')?.rows.length === 6 && qSteps(c, 'orders').some((s) => s.op === 'merge' && s.kind === 'full'),
      sol: [{ name: 'orders', remove: ['merge'], steps: [mergeStep('full')] }],
    }),
  ],
};

// ---------------------------------------------------------------------------
export const pqAppend: LessonContent = {
  key: 'dd-pq-append',
  title: 'Append queries (stack tables)',
  sheet: DD_SHEET,
  query: cfg({ jan: SRC('jan.csv'), feb: SRC('feb.csv'), mar: SRC('mar.csv') }),
  steps: [
    info('intro', 'Same columns, more rows', (
      <p>
        <strong>Append</strong> stacks one table under another. Columns are matched by <em>name</em>, not by position, and a column missing from one table is filled with null. Three monthly queries are ready.
      </p>
    )),
    qstep({
      id: 'two', title: 'Stack February under January',
      body: <p>On the <strong>jan</strong> tab choose <strong>Append queries</strong> and append <strong>feb</strong>.</p>,
      hint: 'Append queries: pick feb.',
      success: 'Four rows: two from each month.',
      check: (c) => qTable(c, 'jan')?.rows.length === 4,
      sol: [{ name: 'jan', steps: [{ op: 'append', with: 'feb' }] }],
    }),
    qstep({
      id: 'three', title: 'Add March',
      body: <p>Append <strong>mar</strong> as well.</p>,
      hint: 'Append queries again.',
      success: 'Six rows.',
      check: (c) => qTable(c, 'jan')?.rows.length === 6,
      sol: [{ name: 'jan', steps: [{ op: 'append', with: 'mar' }] }],
    }),
    qstep({
      id: 'total', title: 'Total by item',
      body: <p>Change <strong>Qty</strong> to number, then <strong>Group by Item</strong> with the sum of Qty, named <strong>Total</strong>.</p>,
      hint: 'Two steps: Change type, then Group by.',
      success: 'Pen 12, Bag 6, Book 9.',
      check: (c) => {
        const t = qTable(c, 'jan');
        return !!t && t.cols.join() === 'Item,Total' && JSON.stringify(t.rows) === JSON.stringify([['Pen', 12], ['Bag', 6], ['Book', 9]]);
      },
      sol: [{ name: 'jan', steps: [NUM('Qty'), { op: 'groupBy', by: ['Item'], aggs: [{ name: 'Total', col: 'Qty', agg: 'sum' }] }] }],
    }),
  ],
};

// ---------------------------------------------------------------------------
export const pqFolder: LessonContent = {
  key: 'dd-pq-folder',
  title: 'Combine files from a folder',
  sheet: DD_SHEET,
  query: cfg({}, false),
  steps: [
    info('intro', 'One query for every monthly file', (
      <p>
        If every month arrives as a file with the same layout, you do not append them by hand. <strong>From Folder</strong> reads every file in the folder, stacks them, and adds a{' '}
        <strong>Source.Name</strong> column so you know where each row came from. Drop next month's file in the folder and Refresh.
      </p>
    )),
    qstep({
      id: 'folder', title: 'Get data from the Monthly folder',
      body: <p>Open <strong>Get Data…</strong> and choose <strong>From folder: Monthly</strong>.</p>,
      hint: 'The list shows both files and folders.',
      success: 'Six rows from three files, with the file name in Source.Name.',
      check: (c) => qTable(c, 'Monthly')?.rows.length === 6 && !!qTable(c, 'Monthly')?.cols.includes('Source.Name'),
      sol: [{ name: 'Monthly', steps: [{ op: 'combineFolder', folder: 'Monthly' }] }],
    }),
    qstep({
      id: 'type', title: 'Type the quantity',
      body: <p>Change <strong>Qty</strong> to <strong>number</strong>.</p>,
      hint: 'Change type: Qty, number.',
      success: 'Now it sums.',
      check: (c) => qTable(c, 'Monthly')?.types?.Qty === 'number',
      sol: [{ name: 'Monthly', steps: [NUM('Qty')] }],
    }),
    qstep({
      id: 'by', title: 'Total per file',
      body: <p>Group by <strong>Source.Name</strong>, the sum of Qty, named <strong>Total</strong>.</p>,
      hint: 'Group by Source.Name.',
      success: 'jan 7, feb 10, mar 10.',
      check: (c) => JSON.stringify(qTable(c, 'Monthly')?.rows) === JSON.stringify([['jan.csv', 7], ['feb.csv', 10], ['mar.csv', 10]]),
      sol: [{ name: 'Monthly', steps: [{ op: 'groupBy', by: ['Source.Name'], aggs: [{ name: 'Total', col: 'Qty', agg: 'sum' }] }] }],
    }),
    qstep({
      id: 'load', title: 'Load it',
      body: <p>Close &amp; Load.</p>,
      hint: 'Close & Load.',
      success: 'A monthly summary that rebuilds itself.',
      check: (c) => qLoaded(c, 'Monthly') && c.raw('A2') === 'jan.csv',
      sol: [{ name: 'Monthly', steps: [], load: true }],
    }),
  ],
};

// ---------------------------------------------------------------------------
export const pqUnpivot: LessonContent = {
  key: 'dd-pq-unpivot',
  title: 'Unpivot & pivot',
  sheet: DD_SHEET,
  query: cfg({ wide: [...SRC('wide.csv')], long: [...SRC('long.csv'), NUM('Sales')] }),
  steps: [
    info('intro', 'Wide for people, long for analysis', (
      <p>
        A report with one column per month is easy to read but hard to chart, filter or total. <strong>Unpivot</strong> turns those month columns into rows (attribute and value). <strong>Pivot</strong> does the
        reverse.
      </p>
    )),
    qstep({
      id: 'unpivot', title: 'Unpivot the months',
      body: <p>On the <strong>wide</strong> tab use <strong>Unpivot other columns</strong>: keep <strong>Product</strong>, attribute name <strong>Month</strong>, value name <strong>Sales</strong>.</p>,
      hint: 'Unpivot other columns turns everything except the kept columns into rows.',
      success: 'Six rows: Product, Month, Sales.',
      check: (c) => qTable(c, 'wide')?.cols.join() === 'Product,Month,Sales' && qTable(c, 'wide')?.rows.length === 6,
      sol: [{ name: 'wide', steps: [{ op: 'unpivotOthers', keep: ['Product'], attr: 'Month', value: 'Sales' }] }],
    }),
    qstep({
      id: 'subset', title: 'Unpivot only some columns',
      body: <p>Switch to a fresh table by deleting that step, then <strong>Unpivot selected columns</strong> for just <strong>Jan</strong> and <strong>Feb</strong>.</p>,
      hint: 'Delete the unpivot step first. Then Unpivot selected columns: Jan and Feb.',
      success: 'Mar stayed as its own column; Jan and Feb became rows.',
      check: (c) => qTable(c, 'wide')?.cols.join() === 'Product,Mar,Attribute,Value' && qTable(c, 'wide')?.rows.length === 4,
      sol: [{ name: 'wide', remove: ['unpivotOthers'], steps: [{ op: 'unpivot', cols: ['Jan', 'Feb'], attr: 'Attribute', value: 'Value' }] }],
    }),
    qstep({
      id: 'pivot', title: 'Pivot back',
      body: <p>Open the <strong>long</strong> tab. Use <strong>Pivot column</strong>: turn <strong>Month</strong> into headers, values from <strong>Sales</strong>, combine duplicates by <strong>sum</strong>.</p>,
      hint: 'Pivot column: Month, Sales, sum.',
      success: 'One row per product with a column for each month.',
      check: (c) => qTable(c, 'long')?.cols.join() === 'Product,Jan,Feb,Mar' && qTable(c, 'long')?.rows.length === 2,
      sol: [{ name: 'long', steps: [{ op: 'pivot', attr: 'Month', value: 'Sales', agg: 'sum' }] }],
    }),
  ],
};

// ---------------------------------------------------------------------------
export const pqGroup: LessonContent = {
  key: 'dd-pq-group',
  title: 'Group by & summarise',
  sheet: DD_SHEET,
  query: cfg({
    sales: [
      ...SRC('sales.csv'),
      { op: 'transformText', cols: ['Product', 'Region'], fn: 'trim' },
      { op: 'transformText', cols: ['Product', 'Region'], fn: 'proper' },
      { op: 'replace', col: 'Units', find: 'n/a', with: '0' },
      NUM('Units'),
      NUM('Price'),
    ],
  }),
  steps: [
    info('intro', 'Summaries before the sheet', (
      <p>
        <strong>Group by</strong> collapses rows into one row per group with a sum, count, average, minimum or maximum. It is a PivotTable inside the query, so the sheet receives a small, ready table.
      </p>
    )),
    qstep({
      id: 'sum', title: 'Total units per region',
      body: <p>Group by <strong>Region</strong>, the <strong>sum</strong> of <strong>Units</strong>, named <strong>Units</strong>.</p>,
      hint: 'Group by: Region. Operation: sum. Of column: Units.',
      success: 'North 13, South 10, East 12.',
      check: (c) => JSON.stringify(qTable(c, 'sales')?.rows) === JSON.stringify([['North', 13], ['South', 10], ['East', 12]]),
      sol: [{ name: 'sales', steps: [{ op: 'groupBy', by: ['Region'], aggs: [{ name: 'Units', col: 'Units', agg: 'sum' }] }] }],
    }),
    qstep({
      id: 'sort', title: 'Rank them',
      body: <p>Sort <strong>Units</strong> from largest to smallest.</p>,
      hint: 'Sort: Units, descending.',
      success: 'North leads.',
      check: (c) => qCol(qTable(c, 'sales'), 'Region').join() === 'North,East,South',
      sol: [{ name: 'sales', steps: [{ op: 'sort', col: 'Units', asc: false }] }],
    }),
    qstep({
      id: 'load', title: 'Load the summary',
      body: <p>Close &amp; Load. A chart or PivotTable can sit on top of it.</p>,
      hint: 'Close & Load.',
      success: 'A three-row table on the sheet.',
      check: (c) => qLoaded(c, 'sales') && c.raw('A2') === 'North' && c.value('B2') === 13,
      sol: [{ name: 'sales', steps: [], load: true }],
    }),
  ],
};

// ---------------------------------------------------------------------------
export const pqTest: LessonContent = {
  key: 'dd-pq-test',
  title: 'Unit test: Power Query',
  sheet: DD_SHEET,
  query: cfg({ orders: ORDERS, customers: CUST }),
  steps: [
    info('intro', 'Put the whole unit together', (
      <p>
        Build one report from two sources: <strong>sales by customer name</strong>, best first, loaded to the sheet.
      </p>
    )),
    qstep({
      id: 'join', title: '1. Add the customer name',
      body: <p>Merge <strong>orders</strong> with <strong>customers</strong> on CustID, <strong>inner</strong> join, bringing in Name.</p>,
      hint: 'Merge queries on the orders tab.',
      success: 'Four matched orders.',
      check: (c) => qTable(c, 'orders')?.rows.length === 4 && qTable(c, 'orders')?.cols.includes('Name') === true,
      sol: [{ name: 'orders', steps: [mergeStep('inner')] }],
    }),
    qstep({
      id: 'total', title: '2. Total per customer',
      body: <p>Group by <strong>Name</strong>, the sum of <strong>Amount</strong>, named <strong>Total</strong>.</p>,
      hint: 'Group by Name.',
      success: 'Three customers.',
      check: (c) => qTable(c, 'orders')?.rows.length === 3 && qTable(c, 'orders')?.cols.join() === 'Name,Total',
      sol: [{ name: 'orders', steps: [{ op: 'groupBy', by: ['Name'], aggs: [{ name: 'Total', col: 'Amount', agg: 'sum' }] }] }],
    }),
    qstep({
      id: 'sort', title: '3. Best customer first',
      body: <p>Sort <strong>Total</strong> descending.</p>,
      hint: 'Sort: Total, descending.',
      success: 'Cy 200, Ana 165, Ben 80.',
      check: (c) => qCol(qTable(c, 'orders'), 'Name').join() === 'Cy,Ana,Ben',
      sol: [{ name: 'orders', steps: [{ op: 'sort', col: 'Total', asc: false }] }],
    }),
    qstep({
      id: 'load', title: '4. Load it',
      body: <p>Close &amp; Load the orders query.</p>,
      hint: 'Close & Load.',
      success: 'Unit complete.',
      check: (c) => qLoaded(c, 'orders') && c.raw('A2') === 'Cy' && c.value('B2') === 200,
      sol: [{ name: 'orders', steps: [], load: true }],
    }),
  ],
};

export const DD2 = [pqMerge, pqJoins, pqAppend, pqFolder, pqUnpivot, pqGroup, pqTest];
void isErr;
void qHas;
