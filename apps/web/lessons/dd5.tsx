// Data & Dashboards, unit 5: interactive reporting, and the course final.
import * as E from '@/components/sheet/engine';
import * as T from '@/components/sheet/tools';
import type { PqStep } from '@/components/sheet/pq';
import { custom, grid, info, task } from './dsl';
import { Cell, F } from './kbd';
import { DASH } from './dd4';
import { DD_SHEET, FILES, FOLDERS, MODEL_REL, MODEL_TABLES, REL_PRODUCT, SRC, approx, mCell, mReport, mRels, mVal, qCol, qLoaded, qTable, qstep } from './dd-util';
import type { LessonContent, StepCtx } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const base = (cells: Record<string, string>): E.SheetData => ({ ...E.emptyData(), cells });
const NUM = (col: string): PqStep => ({ op: 'changeType', col, to: 'number' });

// ---------------------------------------------------------------------------
export const intDropdown: LessonContent = {
  key: 'dd-int-dropdown',
  title: 'A dropdown that drives the page',
  sheet: DD_SHEET,
  meta: { lists: { F1: MONTHS } },
  steps: [
    info('intro', 'Let the reader pick', (
      <p>
        An interactive dashboard has one or more <strong>input cells</strong>: a dropdown the reader changes. Every KPI is a formula that reads that cell, so changing it updates the whole page.
        Monthly data sits in <Cell>A1:C7</Cell>; the selector is <Cell>F1</Cell>.
      </p>
    )),
    task({
      id: 'lookup', title: 'Look up the selected month',
      body: <p>In <Cell>F2</Cell> return the revenue for the month in <Cell>F1</Cell>: <F>=XLOOKUP(F1,A2:A7,B2:B7)</F>.</p>,
      hint: 'Look for F1 in the Month column and return from the Revenue column.',
      success: '120 for Jan.',
      seed: { ...DASH, F1: 'Jan' }, fresh: true, select: 'F2', cells: { F2: 120 }, uses: 'XLOOKUP', sol: { F2: '=XLOOKUP(F1,A2:A7,B2:B7)' },
    }),
    custom({
      id: 'pick', title: 'Change the selection',
      body: <p>Select <Cell>F1</Cell>, open its dropdown arrow and choose <strong>Apr</strong>. Watch <Cell>F2</Cell>.</p>,
      hint: 'Click F1, then the arrow, then Apr.',
      success: '150: the number followed the dropdown.',
      select: 'F1',
      check: (c) => c.events.has('dropdown') && c.raw('F1') === 'Apr' && c.value('F2') === 150,
      sol: { cells: { F1: 'Apr' }, events: ['dropdown'] },
    }),
    task({
      id: 'target', title: 'A second KPI from the same selector',
      body: <p>In <Cell>F3</Cell> look up that month's <strong>target</strong> the same way.</p>,
      hint: 'Return from column C instead.',
      success: '130. Both KPIs follow one dropdown.',
      cells: { F3: 130 }, uses: 'XLOOKUP', sol: { F3: '=XLOOKUP(F1,A2:A7,C2:C7)' },
    }),
    task({
      id: 'gap', title: 'The gap',
      body: <p>In <Cell>F4</Cell> subtract: <F>=F2-F3</F>.</p>,
      hint: 'Revenue minus target.',
      success: '+20.',
      cells: { F4: 20 }, sol: { F4: '=F2-F3' },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const intDynamic: LessonContent = {
  key: 'dd-int-dynamic',
  title: 'Dynamic titles & rankings',
  sheet: DD_SHEET,
  steps: [
    info('intro', 'Words should change too', (
      <p>
        A title that says "Revenue for Apr" when April is selected, and "…Mar" when March is, tells readers what they are looking at. Rankings such as "top 3 months" use <strong>LARGE</strong> so they re-sort
        themselves.
      </p>
    )),
    task({
      id: 'title', title: 'A dynamic title',
      body: <p>In <Cell>F2</Cell> build the title with text and the selector: <F>{'="Revenue for "&F1'}</F>.</p>,
      hint: 'Join text and a cell with &.',
      success: '"Revenue for Apr".',
      seed: { ...DASH, F1: 'Apr' }, fresh: true, select: 'F2', cells: { F2: 'Revenue for Apr' }, sol: { F2: '="Revenue for "&F1' },
    }),
    task({
      id: 'ytd', title: 'Year to date',
      body: (
        <>
          <p>
            In <Cell>F3</Cell> add up revenue from January to the selected month. The position of the month is <F>MATCH(F1,A2:A7,0)</F>, so:
          </p>
          <p>
            <F>=SUMPRODUCT((ROW(A2:A7)-1&lt;=MATCH(F1,A2:A7,0))*B2:B7)</F>
          </p>
        </>
      ),
      hint: 'It keeps only the rows up to the selected one, then adds them.',
      success: '495 for Jan to Apr.',
      cells: { F3: 495 }, uses: ['SUMPRODUCT', 'MATCH'], sol: { F3: '=SUMPRODUCT((ROW(A2:A7)-1<=MATCH(F1,A2:A7,0))*B2:B7)' },
    }),
    task({
      id: 'top', title: 'Best three months',
      body: <p>In <Cell>G2</Cell> use <F>=LARGE(B2:B7,1)</F>, and in <Cell>G3</Cell> and <Cell>G4</Cell> use 2 and 3.</p>,
      hint: 'LARGE(range, k) returns the k-th biggest value.',
      success: '160, 150, 145.',
      cells: { G2: 160, G3: 150, G4: 145 }, uses: 'LARGE', sol: { G2: '=LARGE(B2:B7,1)', G3: '=LARGE(B2:B7,2)', G4: '=LARGE(B2:B7,3)' },
    }),
    task({
      id: 'names', title: 'Name them',
      body: <p>In <Cell>H2</Cell> return the month that earned the biggest revenue in G2: <F>=XLOOKUP(G2,B2:B7,A2:A7)</F>.</p>,
      hint: 'Look up the number, return the month.',
      success: 'May. Fill H3 and H4 the same way for a live leaderboard.',
      cells: { H2: 'May' }, uses: 'XLOOKUP', sol: { H2: '=XLOOKUP(G2,B2:B7,A2:A7)' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const REGION_ROWS = [
  ['Region', 'Month', 'Revenue'],
  ['North', 'Jan', 120],
  ['East', 'Jan', 80],
  ['North', 'Feb', 135],
  ['East', 'Feb', 95],
  ['South', 'Jan', 60],
  ['South', 'Feb', 70],
];
const REGION = grid(REGION_ROWS);
const TBL_R = { name: 'Table1', range: 'A1:C7' };
const EAST = { range: 'A1:C7', cols: { 0: { values: ['East'] } } };
export const intSlicer: LessonContent = {
  key: 'dd-int-slicer',
  title: 'Slicers & visible-only totals',
  sheet: DD_SHEET,
  tools: ['table', 'filter', 'slicer'],
  steps: [
    info('intro', 'Click to filter the whole report', (
      <p>
        A <strong>slicer</strong> is a set of buttons that filter a table. Totals that must follow the filter should use <strong>SUBTOTAL</strong>, which ignores hidden rows. Plain SUM would keep counting them.
      </p>
    )),
    custom({
      id: 'slicer', title: 'Add a slicer',
      body: <p>Press <strong>Slicer</strong>, choose <strong>Region</strong>, then click <strong>East</strong>.</p>,
      hint: 'The slicer panel appears beside the table.',
      success: 'Only East rows are visible.',
      seed: REGION, fresh: true, select: 'A2', meta: { tables: [TBL_R], filter: undefined, hidden: undefined, slicers: [] },
      check: (c) => !!c.data.slicers?.some((s) => s.col === 0) && JSON.stringify(c.data.filter?.cols[0]?.values) === JSON.stringify(['East']),
      sol: { data: { slicers: [{ col: 0, name: 'Region' }], filter: EAST, hidden: T.computeHidden(base(REGION), EAST) }, events: ['slicer-click'] },
    }),
    custom({
      id: 'subtotal', title: 'A total that follows the slicer',
      body: <p>In <Cell>F1</Cell> total the visible revenue with <F>=SUBTOTAL(109,C2:C7)</F>.</p>,
      hint: 'Function 109 means SUM, ignoring hidden rows.',
      success: '175 for East. Change the slicer and it moves with it.',
      seed: REGION, select: 'F1', meta: { tables: [TBL_R], slicers: [{ col: 0, name: 'Region' }], filter: EAST, hidden: T.computeHidden(base(REGION), EAST) },
      check: (c) => c.value('F1') === 175 && /SUBTOTAL\s*\(/i.test(c.raw('F1')) && !c.editing,
      sol: { cells: { F1: '=SUBTOTAL(109,C2:C7)' } },
    }),
    custom({
      id: 'count', title: 'Count the visible rows',
      body: <p>In <Cell>F2</Cell> count the visible revenue entries with <F>=SUBTOTAL(103,C2:C7)</F>.</p>,
      hint: '103 is COUNTA, ignoring hidden rows.',
      success: '2 rows. The KPI strip now describes exactly what the slicer shows.',
      select: 'F2', meta: { tables: [TBL_R], slicers: [{ col: 0, name: 'Region' }], filter: EAST, hidden: T.computeHidden(base(REGION), EAST) },
      check: (c) => c.value('F2') === 2 && /SUBTOTAL\s*\(/i.test(c.raw('F2')) && !c.editing,
      sol: { cells: { F1: '=SUBTOTAL(109,C2:C7)', F2: '=SUBTOTAL(103,C2:C7)' } },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const intToggle: LessonContent = {
  key: 'dd-int-toggle',
  title: 'Switch what the dashboard shows',
  sheet: DD_SHEET,
  meta: { lists: { F1: ['Revenue', 'Target'] } },
  steps: [
    info('intro', 'One page, several views', (
      <p>
        A single selector can swap the <em>measure</em> shown: revenue, target, or anything else, instead of building one page per metric. The trick is a formula that picks a column using the selector.
      </p>
    )),
    task({
      id: 'if', title: 'Choose with IF',
      body: <p>In <Cell>F2</Cell> total revenue when F1 says Revenue and the target when it says Target: <F>{'=IF(F1="Revenue",SUM(B2:B7),SUM(C2:C7))'}</F>.</p>,
      hint: 'The two branches are the two totals.',
      success: '800.',
      seed: { ...DASH, F1: 'Revenue' }, fresh: true, select: 'F2', cells: { F2: 800 }, uses: 'IF', sol: { F2: '=IF(F1="Revenue",SUM(B2:B7),SUM(C2:C7))' },
    }),
    custom({
      id: 'switch', title: 'Flip the switch',
      body: <p>Choose <strong>Target</strong> in <Cell>F1</Cell>.</p>,
      hint: 'Dropdown on F1.',
      success: '750. The same formula now reads the other column.',
      select: 'F1',
      check: (c) => c.events.has('dropdown') && c.raw('F1') === 'Target' && c.value('F2') === 750,
      sol: { cells: { F1: 'Target' }, events: ['dropdown'] },
    }),
    task({
      id: 'index', title: 'Scale it with INDEX and MATCH',
      body: (
        <>
          <p>With many measures, IF gets long. Pick the column by its header instead. In <Cell>F3</Cell>:</p>
          <p>
            <F>=SUM(INDEX(B2:C7,0,MATCH(F1,B1:C1,0)))</F>
          </p>
        </>
      ),
      hint: 'MATCH finds which column the header is in; INDEX with row 0 returns that whole column.',
      success: '750 again, and it works for any number of columns.',
      cells: { F3: 750 }, uses: ['INDEX', 'MATCH', 'SUM'], sol: { F3: '=SUM(INDEX(B2:C7,0,MATCH(F1,B1:C1,0)))' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const REGION_Q: PqStep[] = [
  ...SRC('sales.csv'),
  { op: 'transformText', cols: ['Region'], fn: 'proper' },
  { op: 'replace', col: 'Units', find: 'n/a', with: '0' },
  NUM('Units'),
  NUM('Price'),
  { op: 'addColumn', name: 'Revenue', formula: '[Units]*[Price]' },
  { op: 'filter', col: 'Region', cmp: '=', value: '@Region' },
];
export const intRefresh: LessonContent = {
  key: 'dd-int-refresh',
  title: 'Refresh the whole report',
  sheet: DD_SHEET,
  query: { files: FILES, folders: FOLDERS, params: { Region: 'North' }, noGetData: true, initial: { sales: REGION_Q } },
  steps: [
    info('intro', 'From source to dashboard, in one click', (
      <p>
        The payoff of everything so far: the query cleans the data, the sheet formulas read the loaded table, and a single <strong>Refresh</strong> updates every number. You never repeat the cleaning by hand.
      </p>
    )),
    qstep({
      id: 'load', title: 'Load the North sales',
      body: <p>The query keeps rows for the region in the <strong>@Region</strong> parameter (North). Close &amp; Load.</p>,
      hint: 'Close & Load.',
      success: 'Three North rows, with a Revenue column in F.',
      check: (c) => qLoaded(c, 'sales') && c.raw('A1') === 'Date' && c.value('F2') === 20,
      sol: [{ name: 'sales', steps: [], load: true }],
    }),
    custom({
      id: 'kpi', title: 'A KPI that reads the table',
      body: <p>In <Cell>H1</Cell> total the Revenue column: <F>=SUM(F2:F20)</F>.</p>,
      hint: 'A long range so the formula still works when more rows arrive.',
      success: '95.',
      select: 'H1', view: 'sheet',
      check: (c) => c.value('H1') === 95 && /SUM\s*\(/i.test(c.raw('H1')) && !c.editing,
      sol: { cells: { H1: '=SUM(F2:F20)' }, view: 'sheet' },
    }),
    qstep({
      id: 'refresh', title: 'Change the region and Refresh',
      body: <p>Open the Power Query tab, change <strong>@Region</strong> to <strong>South</strong> and press <strong>Refresh</strong>. Then look at <Cell>H1</Cell>.</p>,
      hint: 'Type South in the @Region box, then Refresh.',
      success: '90. The data, the cleaning and the KPI all updated from one parameter.',
      check: (c) => c.query?.params.Region === 'South' && qLoaded(c, 'sales') && c.value('H1') === 90,
      sol: [{ name: 'sales', steps: [], params: { Region: 'South' }, load: true }],
    }),
  ],
};

// ---------------------------------------------------------------------------
const FIN_Q: Record<string, PqStep[]> = { orders: [...SRC('orders.csv'), NUM('Amount')], customers: SRC('customers.csv') };
const cc = (c: StepCtx) => c.chart?.config;
export const finalTest: LessonContent = {
  key: 'dd-final',
  title: 'Course final: build the report',
  sheet: DD_SHEET,
  query: { files: FILES, folders: FOLDERS, noGetData: true, initial: FIN_Q },
  model: { ...MODEL_REL, relationships: [], allow: { relationships: true, measures: true, report: true } },
  chart: { allow: { types: ['column', 'bar', 'line'], options: true, axisTitles: true } },
  steps: [
    info('intro', 'Everything together', (
      <p>
        You will prepare data with Power Query, show it on the sheet with KPIs, chart it, then build a small data model with a measure. Six tasks.
      </p>
    )),
    qstep({
      id: 'query', title: '1. Prepare the data',
      body: (
        <p>
          Merge <strong>orders</strong> with <strong>customers</strong> on CustID (inner), group by <strong>Name</strong> with the sum of Amount named <strong>Total</strong>, sort Total descending, and Close &amp;
          Load.
        </p>
      ),
      hint: 'Four steps on the orders query: merge, group by, sort, load.',
      success: 'Cy 200, Ana 165, Ben 80 on the sheet.',
      check: (c) => qLoaded(c, 'orders') && c.raw('A2') === 'Cy' && c.value('B2') === 200 && qCol(qTable(c, 'orders'), 'Name').join() === 'Cy,Ana,Ben',
      sol: [
        {
          name: 'orders',
          steps: [
            { op: 'merge', with: 'customers', leftKey: 'CustID', rightKey: 'CustID', kind: 'inner', expand: ['Name'] },
            { op: 'groupBy', by: ['Name'], aggs: [{ name: 'Total', col: 'Amount', agg: 'sum' }] },
            { op: 'sort', col: 'Total', asc: false },
          ],
          load: true,
        },
      ],
    }),
    task({
      id: 'kpi', title: '2. Headline KPI',
      body: <p>In <Cell>E2</Cell> total all customers' sales.</p>,
      hint: '=SUM(B2:B4)',
      success: '445.',
      select: 'E2', cells: { E2: 445 }, uses: 'SUM', sol: { E2: '=SUM(B2:B4)' }, view: 'sheet',
    }),
    task({
      id: 'top', title: '3. Top customer and their share',
      body: <p>In <Cell>E3</Cell> return the top customer's share of the total as <strong>B2/E2</strong>.</p>,
      hint: 'The first row is the largest because you sorted.',
      success: '44.9%.',
      select: 'E3', cells: { E3: 200 / 445 }, sol: { E3: '=B2/E2' },
    }),
    custom({
      id: 'chart', title: '4. Chart the ranking',
      body: <p>In the Chart tab show <strong>A1:B4</strong> as a <strong>bar</strong> chart with a title.</p>,
      hint: 'Range A1:B4, type Bar, give it a title.',
      success: 'The ranking, at a glance.',
      view: 'chart',
      check: (c) => cc(c)?.type === 'bar' && c.chart?.data.categories.length === 3 && (cc(c)?.title ?? '').trim().length > 2,
      sol: { chart: { type: 'bar', range: 'A1:B4', title: 'Sales by customer' }, view: 'chart' },
    }),
    custom({
      id: 'model', title: '5. Model and measure',
      body: <p>In the Data Model tab link <strong>Sales[ProductID]</strong> to <strong>Products[ProductID]</strong> and add a <strong>Revenue</strong> measure (SUMX of units times price).</p>,
      hint: 'One relationship, one measure.',
      success: 'A model that any report can reuse.',
      view: 'model',
      check: (c) => mRels(c).some((r) => r.from === REL_PRODUCT.from && r.to === REL_PRODUCT.to) && mVal(c, 'Revenue') === 294,
      sol: { model: { relationships: [REL_PRODUCT], measures: { Revenue: 'SUMX(Sales, Sales[Units] * Sales[Price])' } }, view: 'model' },
    }),
    custom({
      id: 'report', title: '6. Report by category',
      body: <p>Rows <strong>Products[Category]</strong>, value <strong>Revenue</strong>.</p>,
      hint: 'Pick the field and click the Revenue button.',
      success: 'Course complete.',
      view: 'model',
      check: (c) => mReport(c)?.rowField === 'Products[Category]' && mCell(c, 'Gear', 'Revenue') === 175 && approx(mCell(c, 'Stationery', 'Revenue'), 119),
      sol: { model: { report: { rowField: 'Products[Category]', measures: ['Revenue'] } }, view: 'model' },
    }),
  ],
};
void MODEL_TABLES;

export const DD5 = [intDropdown, intDynamic, intSlicer, intToggle, intRefresh, finalTest];
