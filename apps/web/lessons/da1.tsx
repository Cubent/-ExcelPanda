// Data Analysis & Pivots, units 1 and 2: tables, sorting, filtering and cleaning.
import * as E from '@/components/sheet/engine';
import * as T from '@/components/sheet/tools';
import { custom, grid, info, task } from './dsl';
import { Cell, F, K } from './kbd';
import type { LessonContent, StepCtx } from './types';

type Cells = Record<string, string>;
const base = (cells: Cells): E.SheetData => ({ ...E.emptyData(), cells });
/** True when every given cell holds exactly the expected text. */
const same = (c: StepCtx, want: Cells) => Object.entries(want).every(([k, v]) => c.raw(k) === v);
/** Cells in a rectangle that are blank. */
const blankAll = (c: StepCtx, keys: string[]) => keys.every((k) => c.raw(k).trim() === '');
const rect = (label: string) => E.parseRectLabel(label) as E.Rect;
const sortedBy = (cells: Cells, label: string, levels: T.SortLevel[], header = true, tables?: E.TableDef[]) =>
  T.sortRows({ ...base(cells), tables }, rect(label), levels, header).cells;

const ORDERS = [
  ['Region', 'Product', 'Units', 'Price'],
  ['North', 'Pen', 10, 2],
  ['South', 'Book', 4, 9],
  ['North', 'Book', 6, 9],
  ['East', 'Pen', 12, 2],
  ['South', 'Pen', 8, 2],
  ['East', 'Book', 3, 9],
  ['West', 'Bag', 5, 25],
  ['West', 'Pen', 9, 2],
];
const ORD = grid(ORDERS);
const TBL = { name: 'Table1', range: 'A1:D9' };
const withTotal = (cells: Cells, last = 9): Cells => {
  const out: Cells = { ...cells, E1: 'Total' };
  for (let r = 2; r <= last; r++) out[`E${r}`] = '=[@Units]*[@Price]';
  return out;
};

// ---------------------------------------------------------------------------
// Unit 1 · Tables, sorting & filtering
// ---------------------------------------------------------------------------
export const formatTable: LessonContent = {
  key: 'da-format-table',
  title: 'Format as Table',
  tools: ['table'],
  steps: [
    info('intro', 'Turn a range into a Table', (
      <>
        <p>
          A normal range is just cells. An Excel <strong>Table</strong> is a smart block: it has a name, banded rows, filter arrows,
          and it <strong>grows by itself</strong> when you add data. Formulas can refer to its columns by name.
        </p>
        <p>
          Below are 8 orders. Use the <strong>Table</strong> button in the toolbar. In real Excel the shortcut is <K>Ctrl</K> + <K>T</K>.
        </p>
      </>
    )),
    custom({
      id: 'make', title: 'Create a table',
      body: (
        <p>
          Click any cell inside the data, such as <Cell>B3</Cell>, then press the <strong>Table</strong> button.
        </p>
      ),
      hint: 'Excel finds the whole block of connected data for you.',
      success: 'The header turned dark, rows are banded and the table is named Table1.',
      seed: ORD, fresh: true, select: 'B3',
      check: (c) => c.data.tables?.length === 1 && c.data.tables[0].range === 'A1:D9',
      sol: { data: { tables: [TBL] }, events: ['table'] },
    }),
    custom({
      id: 'grow', title: 'Type under it and it grows',
      body: (
        <p>
          Click <Cell>A10</Cell>, directly under the table, and type one more order: <strong>West</strong>, <strong>Bag</strong>,{' '}
          <strong>3</strong>, <strong>25</strong> (use <K>Tab</K> between cells).
        </p>
      ),
      hint: 'Type West, Tab, Bag, Tab, 3, Tab, 25, Enter.',
      success: 'The table expanded to row 10 on its own. Nothing to resize.',
      seed: ORD, select: 'A10', meta: { tables: [TBL] },
      check: (c) => c.data.tables?.[0]?.range === 'A1:D10' && !!c.raw('A10') && !!c.raw('B10') && !!c.raw('C10') && !!c.raw('D10') && !c.editing,
      sol: { cells: { A10: 'West', B10: 'Bag', C10: '3', D10: '25' }, data: { tables: [{ ...TBL, range: 'A1:D10' }] } },
    }),
    custom({
      id: 'calc', title: 'Add a calculated column',
      body: (
        <>
          <p>
            Click <Cell>E1</Cell> and type <strong>Total</strong>. The table grows to the right. Then in <Cell>E2</Cell> type{' '}
            <F>{'=[@Units]*[@Price]'}</F> (you can click the cells instead of typing).
          </p>
          <p>
            <strong>[@Units]</strong> means "the Units value in this row". Excel fills the whole column for you.
          </p>
        </>
      ),
      hint: 'Type Total, Enter. Then click E2 and type =[@Units]*[@Price], Enter.',
      success: 'One formula, ten rows. New rows will calculate by themselves too.',
      seed: { ...ORD, A10: 'West', B10: 'Bag', C10: '3', D10: '25' }, select: 'E1', meta: { tables: [{ ...TBL, range: 'A1:D10' }] },
      check: (c) =>
        c.data.tables?.[0]?.range === 'A1:E10' && c.raw('E1').trim().toLowerCase() === 'total' && c.raw('E2').startsWith('=') && c.value('E2') === 20 && c.value('E10') === 75 && !c.editing,
      sol: { cells: withTotal({ ...ORD, A10: 'West', B10: 'Bag', C10: '3', D10: '25' }, 10), data: { tables: [{ ...TBL, range: 'A1:E10' }] } },
    }),
  ],
};

const SORT_TWO = sortedBy(ORD, 'A1:D9', [{ col: 0, asc: true }, { col: 2, asc: false }]);

export const sortData: LessonContent = {
  key: 'da-sort',
  title: 'Sort',
  tools: ['sort'],
  steps: [
    info('intro', 'Put your data in order', (
      <>
        <p>
          Sorting rearranges <strong>whole rows</strong>, so each order keeps its own product and price. Never sort one column on its
          own, or the data gets scrambled. Excel (and this sheet) sorts the connected block together.
        </p>
      </>
    )),
    custom({
      id: 'quick', title: 'Sort by one column',
      body: (
        <p>
          Click a cell in the <strong>Units</strong> column, such as <Cell>C2</Cell>, and press <strong>Sort Z→A</strong> to put the
          biggest orders first.
        </p>
      ),
      hint: 'The sort follows the column your cell is in.',
      success: 'Biggest first, and every row stayed intact.',
      seed: ORD, fresh: true, select: 'C2',
      check: (c) => {
        const units = [2, 3, 4, 5, 6, 7, 8, 9].map((r) => c.value(`C${r}`) as number);
        const rows = [2, 3, 4, 5, 6, 7, 8, 9].map((r) => ['A', 'B', 'C', 'D'].map((col) => c.raw(`${col}${r}`)).join('|'));
        const orig = ORDERS.slice(1).map((r) => r.join('|'));
        return units.every((u, i) => i === 0 || units[i - 1] >= u) && [...rows].sort().join() === [...orig].sort().join();
      },
      sol: { cells: sortedBy(ORD, 'A1:D9', [{ col: 2, asc: false }]), events: ['sort'] },
    }),
    custom({
      id: 'two', title: 'Sort by two columns',
      body: (
        <>
          <p>
            Group by region, and inside each region put the biggest orders first. Open <strong>Custom sort</strong> and set: Sort by{' '}
            <strong>Region</strong> (A to Z), then by <strong>Units</strong> (Largest to Smallest).
          </p>
          <p>
            (Two quick sorts also work: sort by Units first, then by Region, because the sort is stable.)
          </p>
        </>
      ),
      hint: 'Click Add level for the second column.',
      success: 'East, North, South, West, each ordered by Units.',
      seed: ORD, fresh: true, select: 'A2',
      check: (c) => same(c, SORT_TWO),
      sol: { cells: SORT_TWO, events: ['sort'] },
    }),
    custom({
      id: 'formula', title: 'Tables sort their formulas safely',
      body: (
        <p>
          This table has a <strong>Total</strong> column. Sort it by Total, biggest first: click a cell in column E and press{' '}
          <strong>Sort Z→A</strong>. The formulas travel with their rows.
        </p>
      ),
      hint: 'The biggest total is West Bag at 125.',
      success: 'Totals are in order and each row still calculates its own total.',
      seed: withTotal(ORD), fresh: true, select: 'E2', meta: { tables: [{ ...TBL, range: 'A1:E9' }] },
      check: (c) => {
        const tot = [2, 3, 4, 5, 6, 7, 8, 9].map((r) => c.value(`E${r}`) as number);
        return tot[0] === 125 && tot.every((t, i) => i === 0 || tot[i - 1] >= t) && c.raw('E4') === '=[@Units]*[@Price]';
      },
      sol: { cells: sortedBy(withTotal(ORD), 'A1:E9', [{ col: 4, asc: false }], true, [{ name: 'Table1', range: 'A1:E9' }]), events: ['sort'] },
    }),
  ],
};

const FILTER_BASE: E.FilterState = { range: 'A1:D9', cols: {} };
const filt = (cols: E.FilterState['cols']) => {
  const d = T.applyFilter(base(ORD), { ...FILTER_BASE, cols });
  return { filter: d.filter, hidden: d.hidden };
};
const hiddenEq = (c: StepCtx, cols: E.FilterState['cols']) => JSON.stringify([...(c.data.hidden ?? [])].sort((a, b) => a - b)) === JSON.stringify(filt(cols).hidden);

export const filterData: LessonContent = {
  key: 'da-filter',
  title: 'Filter & search',
  tools: ['filter'],
  steps: [
    info('intro', 'Show only what you need', (
      <>
        <p>
          A <strong>filter</strong> hides the rows that do not match. The rows are not deleted. Clear the filter and they all come back.
          Turn it on with the <strong>Filter</strong> button (<K>Ctrl</K> + <K>Shift</K> + <K>L</K> in Excel).
        </p>
      </>
    )),
    custom({
      id: 'on', title: 'Turn the filter on',
      body: <p>Click inside the data and press the <strong>Filter</strong> button. Arrows appear in the header row.</p>,
      hint: 'Click any cell in the data first.',
      success: 'Every header has a drop-down arrow now.',
      seed: ORD, fresh: true, select: 'B3',
      check: (c) => !!c.data.filter,
      sol: { data: { filter: FILTER_BASE }, events: ['filter-on'] },
    }),
    custom({
      id: 'value', title: 'Filter by a value',
      body: (
        <p>
          Click the arrow in <strong>Region</strong>, untick <strong>(Select All)</strong>, tick only <strong>South</strong> and press{' '}
          <strong>OK</strong>.
        </p>
      ),
      hint: 'Rows that do not say South disappear.',
      success: 'Only the South orders remain. Look at the row numbers: they skip the hidden rows.',
      seed: ORD, select: 'A1', meta: { filter: FILTER_BASE, hidden: [] },
      check: (c) => JSON.stringify(c.data.filter?.cols[0]?.values) === JSON.stringify(['South']) && hiddenEq(c, { 0: { values: ['South'] } }),
      sol: { data: filt({ 0: { values: ['South'] } }), events: ['filter'] },
    }),
    custom({
      id: 'number', title: 'Filter by a number',
      body: (
        <p>
          Show only orders with <strong>more than 5 Units</strong>. Open the arrow on <strong>Units</strong>, choose the <strong>&gt;</strong>{' '}
          operator, type <strong>5</strong> and press OK.
        </p>
      ),
      hint: 'The first drop-down in the menu holds the operators.',
      success: 'Orders of 4, 3 and 5 units are hidden.',
      seed: ORD, select: 'A1', meta: { filter: FILTER_BASE, hidden: [] },
      check: (c) => c.data.filter?.cols[2]?.op === '>' && Number(c.data.filter?.cols[2]?.val) === 5 && hiddenEq(c, { 2: { op: '>', val: '5' } }),
      sol: { data: filt({ 2: { op: '>', val: '5' } }), events: ['filter'] },
    }),
    custom({
      id: 'two', title: 'Combine two filters',
      body: (
        <p>
          Filters on different columns work together (AND). Show only <strong>Pen</strong> orders from <strong>East</strong> or{' '}
          <strong>West</strong>.
        </p>
      ),
      hint: 'Filter Product to Pen, then Region to East and West.',
      success: 'Just two rows: East Pen and West Pen.',
      seed: ORD, select: 'A1', meta: { filter: FILTER_BASE, hidden: [] },
      check: (c) =>
        JSON.stringify([...(c.data.filter?.cols[1]?.values ?? [])].sort()) === JSON.stringify(['Pen']) &&
        JSON.stringify([...(c.data.filter?.cols[0]?.values ?? [])].sort()) === JSON.stringify(['East', 'West']) &&
        hiddenEq(c, { 1: { values: ['Pen'] }, 0: { values: ['East', 'West'] } }),
      sol: { data: filt({ 1: { values: ['Pen'] }, 0: { values: ['East', 'West'] } }), events: ['filter'] },
    }),
    custom({
      id: 'clear', title: 'Clear the filter',
      body: <p>A filter is on (South only). Bring every row back with the <strong>Clear</strong> button in the arrow menu, or switch the filter off.</p>,
      hint: 'Press the Filter button again to switch it off.',
      success: 'All rows are back. Filtering never deletes anything.',
      seed: ORD, select: 'A1', meta: { filter: { ...FILTER_BASE, cols: { 0: { values: ['South'] } } }, hidden: filt({ 0: { values: ['South'] } }).hidden },
      check: (c) => !c.data.hidden?.length,
      sol: { data: { filter: undefined, hidden: undefined }, events: ['filter-off'] },
    }),
  ],
};

const TBL_E = { name: 'Table1', range: 'A1:E9' };
const ORD_TOTAL = withTotal(ORD);

export const structuredRefs: LessonContent = {
  key: 'da-structured-refs',
  title: 'Structured references',
  steps: [
    info('intro', 'Formulas that read like English', (
      <>
        <p>
          Instead of <F>{'=SUM(E2:E9)'}</F>, a table lets you write <F>{'=SUM(Table1[Total])'}</F>. The name refers to the whole
          <strong> column</strong>, and it grows as you add rows. That makes totals that never miss a new row.
        </p>
        <p>
          Here is a table called <strong>Table1</strong> with columns Region, Product, Units, Price and Total.
        </p>
      </>
    )),
    task({
      id: 'sum', title: 'Sum a column by name',
      body: (
        <p>
          In <Cell>G1</Cell> type <F>{'=SUM(Table1[Total])'}</F>.
        </p>
      ),
      hint: 'Type Table1, then [ and pick Total, or just type it all.',
      success: '320.',
      seed: ORD_TOTAL, fresh: true, select: 'G1', meta: { tables: [TBL_E] },
      cells: { G1: 320 }, uses: 'SUM', also: (c) => /TABLE1\[TOTAL\]/i.test(c.raw('G1')),
      sol: { G1: '=SUM(Table1[Total])' },
    }),
    task({
      id: 'avg', title: 'Average a column',
      body: (
        <p>
          In <Cell>G2</Cell> find the average price: <F>{'=AVERAGE(Table1[Price])'}</F>.
        </p>
      ),
      hint: 'Same shape, different column.',
      success: '7.5.',
      seed: ORD_TOTAL, select: 'G2', meta: { tables: [TBL_E] },
      cells: { G2: 7.5 }, uses: 'AVERAGE', sol: { G2: '=AVERAGE(Table1[Price])' },
    }),
    task({
      id: 'countifs', title: 'Conditions with column names',
      body: (
        <>
          <p>
            In <Cell>G3</Cell> count the East orders: <F>{'=COUNTIF(Table1[Region],"East")'}</F>.
          </p>
          <p>
            In <Cell>G4</Cell> total the South sales: <F>{'=SUMIFS(Table1[Total],Table1[Region],"South")'}</F>.
          </p>
        </>
      ),
      hint: 'G3 should be 2 and G4 should be 52.',
      success: 'No cell addresses anywhere, and every formula says what it means.',
      seed: ORD_TOTAL, select: 'G3', meta: { tables: [TBL_E] },
      cells: { G3: 2, G4: 52 }, uses: { G3: 'COUNTIF', G4: 'SUMIFS' },
      sol: { G3: '=COUNTIF(Table1[Region],"East")', G4: '=SUMIFS(Table1[Total],Table1[Region],"South")' },
    }),
    custom({
      id: 'grow', title: 'Add a row, the total follows',
      body: (
        <p>
          <Cell>G1</Cell> totals the Total column. Add a new order in row 10: <strong>West</strong>, <strong>Pen</strong>, <strong>6</strong>,{' '}
          <strong>2</strong>. The table grows, the Total fills itself, and <Cell>G1</Cell> updates.
        </p>
      ),
      hint: 'Click A10 and type the four values with Tab between them.',
      success: '332. The old-style =SUM(E2:E9) would have missed the new row.',
      seed: { ...ORD_TOTAL, G1: '=SUM(Table1[Total])' }, select: 'A10', meta: { tables: [TBL_E] },
      check: (c) => c.data.tables?.[0]?.range === 'A1:E10' && c.value('G1') === 332 && !c.editing,
      sol: { cells: { A10: 'West', B10: 'Pen', C10: '6', D10: '2', E10: '=[@Units]*[@Price]' }, data: { tables: [{ ...TBL_E, range: 'A1:E10' }] } },
    }),
  ],
};

const TBL_E_TOTALS = { name: 'Table1', range: 'A1:E10', totals: true };
const TOTALS_CELLS: Cells = { ...ORD_TOTAL, A10: 'Total', E10: '=SUBTOTAL(109,E2:E9)' };

export const totalsSlicers: LessonContent = {
  key: 'da-totals-slicers',
  title: 'Totals row & slicers',
  tools: ['totals', 'filter', 'slicer'],
  steps: [
    info('intro', 'Instant summaries and click-to-filter', (
      <>
        <p>
          A table can show a <strong>Total row</strong> in one click. It uses <strong>SUBTOTAL</strong>, which only adds the rows you can
          see, so the total follows your filter. A <strong>slicer</strong> is a panel of buttons that filters the table.
        </p>
      </>
    )),
    custom({
      id: 'totals', title: 'Turn on the Total row',
      body: <p>Click inside the table and press the <strong>Total row</strong> button.</p>,
      hint: 'A Total line appears under the last row.',
      success: 'A SUBTOTAL formula sits under each numeric column.',
      seed: ORD_TOTAL, fresh: true, select: 'B3', meta: { tables: [TBL_E] },
      check: (c) => c.data.tables?.[0]?.totals === true && c.raw('E10').startsWith('=SUBTOTAL'),
      sol: { cells: TOTALS_CELLS, data: { tables: [TBL_E_TOTALS] }, events: ['totals-row'] },
    }),
    custom({
      id: 'filtered', title: 'The total follows the filter',
      body: (
        <>
          <p>
            Filter <strong>Region</strong> to <strong>South</strong> only. The Total row now shows just the visible rows. Type that
            total into <Cell>H1</Cell>.
          </p>
        </>
      ),
      hint: 'Use the arrow on Region. South has two orders: 36 + 16.',
      success: '52. SUBTOTAL ignores hidden rows. SUM would still show 320.',
      seed: TOTALS_CELLS, select: 'A1',
      meta: { tables: [TBL_E_TOTALS], filter: { range: 'A1:E9', cols: {} }, hidden: [] },
      check: (c) => JSON.stringify(c.data.filter?.cols[0]?.values) === JSON.stringify(['South']) && c.value('E10') === 52 && c.value('H1') === 52 && c.raw('H1').trim() !== '' && !c.editing,
      sol: { cells: { H1: '52' }, data: { filter: { range: 'A1:E9', cols: { 0: { values: ['South'] } } }, hidden: T.computeHidden(base(ORD_TOTAL), { range: 'A1:E9', cols: { 0: { values: ['South'] } } }) }, events: ['filter'] },
    }),
    custom({
      id: 'slicer', title: 'Add a slicer',
      body: (
        <p>
          Press <strong>Slicer</strong>, choose <strong>Region</strong>, then click the <strong>East</strong> button in the slicer panel
          that appears.
        </p>
      ),
      hint: 'The first click selects just that value.',
      success: 'One click filters the table. Clear it with the × in the slicer header.',
      seed: ORD_TOTAL, select: 'B3', meta: { tables: [TBL_E], filter: undefined, hidden: undefined, slicers: [] },
      check: (c) => !!c.data.slicers?.some((s) => s.col === 0) && JSON.stringify(c.data.filter?.cols[0]?.values) === JSON.stringify(['East']),
      sol: {
        data: {
          slicers: [{ col: 0, name: 'Region' }],
          filter: { range: 'A1:E9', cols: { 0: { values: ['East'] } } },
          hidden: T.computeHidden(base(ORD_TOTAL), { range: 'A1:E9', cols: { 0: { values: ['East'] } } }),
        },
        events: ['slicer-click'],
      },
    }),
  ],
};

const FOUR = sortedBy(ORD, 'A1:D9', [{ col: 1, asc: true }, { col: 2, asc: false }]);
const BOOKS = { range: 'A1:D9', cols: { 1: { values: ['Book'] }, 2: { op: '>=' as const, val: '4' } } };

export const unit1Test: LessonContent = {
  key: 'da-unit1-test',
  title: 'Unit 1 test',
  tools: ['table', 'totals', 'sort', 'filter'],
  steps: [
    info('intro', 'Tables, sort and filter test', <p>Five tasks on the order data. Use the toolbar buttons or the shortcuts.</p>),
    custom({
      id: 'table', title: '1. Make it a table',
      body: <p>Turn the order data into a table.</p>,
      hint: 'Click inside the data and press Table.',
      success: 'Table1.',
      seed: ORD, fresh: true, select: 'B3',
      check: (c) => c.data.tables?.length === 1 && c.data.tables[0].range === 'A1:D9',
      sol: { data: { tables: [TBL] }, events: ['table'] },
    }),
    custom({
      id: 'sort', title: '2. Sort in two levels',
      body: (
        <p>
          Sort by <strong>Product</strong> (A to Z) and, within each product, by <strong>Units</strong> (Largest to Smallest).
        </p>
      ),
      hint: 'Custom sort lets you add the second level.',
      success: 'Bag, Book, Pen, each with the biggest orders first.',
      seed: ORD, fresh: true, select: 'A2',
      check: (c) => same(c, FOUR),
      sol: { cells: FOUR, events: ['sort'] },
    }),
    custom({
      id: 'filter', title: '3. Filter',
      body: (
        <p>
          Show only <strong>Book</strong> orders with <strong>Units of 4 or more</strong>.
        </p>
      ),
      hint: 'Product = Book, Units >= 4. That leaves two rows.',
      success: 'South (4) and North (6).',
      seed: ORD, fresh: true, select: 'A1', meta: { filter: FILTER_BASE, hidden: [] },
      check: (c) => JSON.stringify(c.data.filter?.cols[1]?.values) === JSON.stringify(['Book']) && c.data.filter?.cols[2]?.op === '>=' && Number(c.data.filter?.cols[2]?.val) === 4 && hiddenEq(c, BOOKS.cols),
      sol: { data: filt(BOOKS.cols), events: ['filter'] },
    }),
    task({
      id: 'formula', title: '4. Structured reference',
      body: (
        <p>
          In <Cell>G1</Cell> total the Units of every <strong>Pen</strong> order with <F>{'SUMIFS'}</F> and the table's column names.
        </p>
      ),
      hint: '=SUMIFS(Table1[Units],Table1[Product],"Pen")',
      success: '39.',
      seed: ORD, fresh: true, select: 'G1', meta: { tables: [TBL] },
      cells: { G1: 39 }, uses: 'SUMIFS', also: (c) => /TABLE1\[/i.test(c.raw('G1')),
      sol: { G1: '=SUMIFS(Table1[Units],Table1[Product],"Pen")' },
    }),
    custom({
      id: 'totals', title: '5. Total row',
      body: <p>Show the table's <strong>Total row</strong>.</p>,
      hint: 'Click inside the table, then press Total row.',
      success: 'Unit 1 complete.',
      seed: ORD, fresh: true, select: 'B3', meta: { tables: [TBL] },
      check: (c) => c.data.tables?.[0]?.totals === true,
      sol: { data: { tables: [{ ...TBL, range: 'A1:D10', totals: true }] }, cells: { A10: 'Total', C10: '=SUBTOTAL(109,C2:C9)', D10: '=SUBTOTAL(109,D2:D9)' }, events: ['totals-row'] },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 2 · Cleaning messy data
// ---------------------------------------------------------------------------
const CUST = [
  ['Name', 'Email', 'City'],
  ['Ana Lopez', 'ana@mail.com', 'Madrid'],
  ['Ben Kim', 'ben@work.org', 'Seoul'],
  ['ana lopez', 'ana@mail.com', 'Madrid'],
  ['Cleo Park', 'cleo@mail.com', 'Oslo'],
  ['Ben Kim', 'ben@work.org', 'Seoul'],
  ['Dev Shah', 'dev@mail.com', 'Pune'],
  ['Cleo Park', 'cleo@mail.com', 'Bergen'],
  ['Eli Ross', 'eli@work.org', 'Rome'],
];
const CU = grid(CUST);
const dedupe = (cols: number[]) => T.removeDuplicates(base(CU), rect('A1:C9'), cols, true).data.cells;
const DUP_ALL = dedupe([0, 1, 2]);
const DUP_EMAIL = dedupe([1]);

export const removeDuplicatesLesson: LessonContent = {
  key: 'da-remove-duplicates',
  title: 'Remove duplicates',
  tools: ['dedupe'],
  steps: [
    info('intro', 'Same person, many rows', (
      <>
        <p>
          Exports and merged lists repeat rows. <strong>Remove Duplicates</strong> keeps the first copy and deletes the rest. It
          ignores capital letters, so "Ana Lopez" and "ana lopez" count as the same.
        </p>
        <p>
          You choose which columns must match. Match on <em>all</em> columns for exact copies, or on one column such as Email.
        </p>
      </>
    )),
    task({
      id: 'flag', title: 'First, flag the repeats',
      body: (
        <>
          <p>
            Always look before you delete. In <Cell>D2</Cell> type <F>{'=COUNTIF($B$2:$B$9,B2)>1'}</F> and fill it down to <Cell>D9</Cell>.
            TRUE means that email appears more than once.
          </p>
        </>
      ),
      hint: 'Lock the range with $ so it does not slide when you fill down.',
      success: 'Six rows share an email with another row. Dev and Eli are unique.',
      seed: CU, fresh: true, select: 'D2',
      cells: { D2: true, D3: true, D4: true, D5: true, D6: true, D7: false, D8: true, D9: false }, uses: 'COUNTIF',
      sol: Object.fromEntries([2, 3, 4, 5, 6, 7, 8, 9].map((r) => [`D${r}`, `=COUNTIF($B$2:$B$9,B${r})>1`])),
    }),
    custom({
      id: 'all', title: 'Remove exact copies',
      body: (
        <p>
          Press <strong>Remove duplicates</strong>, keep <strong>all three columns</strong> ticked (a row must match completely) and press OK.
        </p>
      ),
      hint: 'Rows 4 and 6 are exact copies of earlier rows (case does not matter).',
      success: '2 duplicates removed, 6 unique rows remain. Cleo in Bergen stayed because her city differs.',
      seed: CU, fresh: true, select: 'B3',
      check: (c) => same(c, DUP_ALL),
      sol: { cells: DUP_ALL, events: ['dedupe'] },
    }),
    custom({
      id: 'email', title: 'Match on one column',
      body: (
        <p>
          Now keep <strong>one row per email address</strong>. Open Remove duplicates again on the original list, untick Name and City so
          only <strong>Email</strong> is ticked, and press OK.
        </p>
      ),
      hint: 'Only the Email checkbox should be ticked.',
      success: '3 removed, 5 remain: one row per email. The first occurrence of each is kept.',
      seed: CU, fresh: true, select: 'B3',
      check: (c) => same(c, DUP_EMAIL),
      sol: { cells: DUP_EMAIL, events: ['dedupe'] },
    }),
  ],
};

const NAMES_COMMA = grid([['Name'], ['Lopez, Ana'], ['Kim, Ben'], ['Park, Cleo'], ['Shah, Dev']]);
const T2C_COMMA = T.textToColumns(base(NAMES_COMMA), 0, 1, 4, [',']).cells;
const SKU = grid([['Code'], ['SKU-4821-RED'], ['SKU-1077-BLU'], ['SKU-9034-GRN']]);
const T2C_SKU = T.textToColumns(base(SKU), 0, 1, 3, ['-']).cells;
const DATES = grid([['Date'], ['2026/03/15'], ['2026/04/01'], ['2026/12/25']]);
const T2C_DATE = T.textToColumns(base(DATES), 0, 1, 3, ['/']).cells;
const NAMES_SPACE = grid([['Full name'], ['Ana Lopez'], ['Ben Kim'], ['Cleo Park']]);
const T2C_SPACE = T.textToColumns(base(NAMES_SPACE), 0, 1, 3, [' ']).cells;

export const textToColumnsLesson: LessonContent = {
  key: 'da-text-to-columns',
  title: 'Text to columns',
  tools: ['text2col'],
  steps: [
    info('intro', 'Split one column into many', (
      <>
        <p>
          Data often arrives as one long string: <strong>"Lopez, Ana"</strong> or <strong>"SKU-4821-RED"</strong>.{' '}
          <strong>Text to Columns</strong> splits it at a separator you choose (a comma, space, dash and so on) and spreads the pieces into
          the columns to the right.
        </p>
        <p>
          Warning: it <strong>overwrites</strong> the cells to the right, so leave empty room.
        </p>
      </>
    )),
    custom({
      id: 'comma', title: 'Split at a comma',
      body: (
        <p>
          Select <Cell>A2:A5</Cell> (the names, not the header), press <strong>Text to columns</strong>, tick <strong>Comma</strong> and press
          Finish.
        </p>
      ),
      hint: 'Click A2, then Shift + ↓ three times.',
      success: 'Surnames in column A, first names in column B.',
      seed: NAMES_COMMA, fresh: true, select: 'A2',
      check: (c) => same(c, T2C_COMMA),
      sol: { cells: T2C_COMMA, events: ['text-to-columns'] },
    }),
    custom({
      id: 'space', title: 'Split at a space',
      body: (
        <p>
          Split <strong>Ana Lopez</strong> style names at the <strong>Space</strong> (select <Cell>A2:A4</Cell> first).
        </p>
      ),
      hint: 'Tick Space and untick Comma.',
      success: 'First name and surname are in their own columns.',
      seed: NAMES_SPACE, fresh: true, select: 'A2',
      check: (c) => same(c, T2C_SPACE),
      sol: { cells: T2C_SPACE, events: ['text-to-columns'] },
    }),
    custom({
      id: 'other', title: 'Any separator: "Other"',
      body: (
        <p>
          Product codes use a dash: <strong>SKU-4821-RED</strong>. Select <Cell>A2:A4</Cell>, tick <strong>Other</strong> and type a{' '}
          <strong>-</strong> in the box.
        </p>
      ),
      hint: 'The Other box takes one or more characters.',
      success: 'Three columns: SKU, number and colour.',
      seed: SKU, fresh: true, select: 'A2',
      check: (c) => same(c, T2C_SKU),
      sol: { cells: T2C_SKU, events: ['text-to-columns'] },
    }),
    task({
      id: 'dates', title: 'Rebuild a real date',
      body: (
        <>
          <p>
            Dates like <strong>2026/03/15</strong> split at <strong>/</strong> into year, month and day (columns A, B, C). Now build a true date
            in <Cell>D2</Cell> from the pieces:
          </p>
          <p>
            <F>{'=DATE(A2,B2,C2)'}</F>
          </p>
        </>
      ),
      hint: 'The columns are already split for you. Write the DATE formula and fill it down to D4.',
      success: 'Real dates you can sort, filter and do maths on.',
      seed: T2C_DATE, fresh: true, select: 'D2',
      cells: { D2: E.dateToSerial(2026, 3, 15), D3: E.dateToSerial(2026, 4, 1), D4: E.dateToSerial(2026, 12, 25) }, uses: 'DATE',
      sol: { D2: '=DATE(A2,B2,C2)', D3: '=DATE(A3,B3,C3)', D4: '=DATE(A4,B4,C4)' },
    }),
  ],
};

const FF = grid([['Full name', 'First name', 'Initials', 'Last, First'], ['Ana Lopez'], ['Ben Kim'], ['Cleo Park'], ['Dev Shah']]);
const FF_EMAIL = grid([['Email', 'Username'], ['ana.lopez@mail.com'], ['ben.kim@work.org'], ['cleo.park@mail.com'], ['dev.shah@work.org']]);

export const flashFillLesson: LessonContent = {
  key: 'da-flash-fill',
  title: 'Flash Fill',
  tools: ['flash'],
  steps: [
    info('intro', 'Fill by example', (
      <>
        <p>
          Type the <strong>first answer yourself</strong> in the column next to your data. <strong>Flash Fill</strong> spots the pattern and
          fills the rest. In Excel it is <K>Ctrl</K> + <K>E</K>; here use the <strong>Flash fill</strong> button.
        </p>
        <p>
          The pattern comes from the cell on the <em>left</em>, so keep your example right next to the data.
        </p>
      </>
    )),
    custom({
      id: 'first', title: 'Pull out first names',
      body: (
        <p>
          In <Cell>B2</Cell> type <strong>Ana</strong> and press <K>Enter</K>. You land on <Cell>B3</Cell>. Now press <strong>Flash fill</strong>.
        </p>
      ),
      hint: 'The example must be directly above the cell you flash fill from.',
      success: 'Ben, Cleo, Dev. Excel worked out "take the first word".',
      seed: FF, fresh: true, select: 'B2',
      check: (c) => c.raw('B2').trim() === 'Ana' && c.raw('B3') === 'Ben' && c.raw('B4') === 'Cleo' && c.raw('B5') === 'Dev',
      sol: { cells: { B2: 'Ana', B3: 'Ben', B4: 'Cleo', B5: 'Dev' }, events: ['flash-fill'] },
    }),
    custom({
      id: 'initials', title: 'Make initials',
      body: (
        <p>
          In <Cell>C2</Cell> type the initials <strong>AL</strong>, press Enter and Flash fill.
        </p>
      ),
      hint: 'Capital letters: the pattern is "first letter of each word".',
      success: 'AL, BK, CP, DS.',
      seed: FF, select: 'C2',
      check: (c) => c.raw('C2').trim() === 'AL' && c.raw('C3') === 'BK' && c.raw('C4') === 'CP' && c.raw('C5') === 'DS',
      sol: { cells: { C2: 'AL', C3: 'BK', C4: 'CP', C5: 'DS' }, events: ['flash-fill'] },
    }),
    custom({
      id: 'swap', title: 'Reorder the words',
      body: (
        <p>
          In <Cell>D2</Cell> type <strong>Lopez, Ana</strong> (surname, comma, first name), Enter and Flash fill.
        </p>
      ),
      hint: 'The example shows the new order and the comma.',
      success: 'Kim, Ben, Park, Cleo, Shah, Dev.',
      seed: FF, select: 'D2',
      check: (c) => c.raw('D2').trim() === 'Lopez, Ana' && c.raw('D3') === 'Kim, Ben' && c.raw('D4') === 'Park, Cleo' && c.raw('D5') === 'Shah, Dev',
      sol: { cells: { D2: 'Lopez, Ana', D3: 'Kim, Ben', D4: 'Park, Cleo', D5: 'Shah, Dev' }, events: ['flash-fill'] },
    }),
    custom({
      id: 'user', title: 'Usernames from emails',
      body: (
        <p>
          Emails are <strong>ana.lopez@mail.com</strong>. In <Cell>B2</Cell> type just the first name in capitals, <strong>ANA</strong>, Enter,
          Flash fill.
        </p>
      ),
      hint: 'Text before the first dot, in capitals.',
      success: 'ANA, BEN, CLEO, DEV.',
      seed: FF_EMAIL, fresh: true, select: 'B2',
      check: (c) => c.raw('B2').trim() === 'ANA' && c.raw('B3') === 'BEN' && c.raw('B4') === 'CLEO' && c.raw('B5') === 'DEV',
      sol: { cells: { B2: 'ANA', B3: 'BEN', B4: 'CLEO', B5: 'DEV' }, events: ['flash-fill'] },
    }),
  ],
};

const FR1 = grid([['Region'], ['N. America'], ['S. America'], ['N. America'], ['Europe']]);
const FR1_DONE = T.findReplace(base(FR1), 'N.', 'North', { matchCase: true }).data.cells;
const FR2 = grid([['Country'], ['UK'], ['UKRAINE'], ['UK'], ['Luke']]);
const FR2_DONE = T.findReplace(base(FR2), 'UK', 'United Kingdom', { wholeCell: true, matchCase: true }).data.cells;
const FR3 = grid([['Label'], ['Dept 1: Sales'], ['Dept 2: Sales'], ['Dept 3: Ops']]);
const FR3_DONE = T.findReplace(base(FR3), 'Dept ?: ', '').data.cells;
const FR4 = grid([['Note'], ['Total  (est)'], ['Net  (est)'], ['Gross  (est)']]);
const FR4_DONE = T.findReplace(T.findReplace(base(FR4), '  (est)', '').data, 'Total', 'Sum').data.cells;

export const findReplaceLesson: LessonContent = {
  key: 'da-find-replace',
  title: 'Find & Replace',
  tools: ['find'],
  steps: [
    info('intro', 'Fix a thousand cells at once', (
      <>
        <p>
          Press <K>Ctrl</K> + <K>H</K> (or the <strong>Find &amp; replace</strong> button). Type what to find and what to put instead. Options
          control how strict the match is:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Match case</strong>: capitals must match
          </li>
          <li>
            <strong>Match entire cell</strong>: the whole cell must equal the text, not just contain it
          </li>
          <li>
            Wildcards: <F>{'?'}</F> is any one character, <F>{'*'}</F> is any run of characters
          </li>
        </ul>
      </>
    )),
    custom({
      id: 'abbr', title: 'Expand an abbreviation',
      body: (
        <p>
          Replace <strong>N.</strong> with <strong>North</strong> everywhere. Tick <strong>Match case</strong>, then Replace All.
        </p>
      ),
      hint: 'Find what: N.   Replace with: North',
      success: '"N. America" became "North America" (twice). "S. America" is untouched.',
      seed: FR1, fresh: true, select: 'A2',
      check: (c) => same(c, FR1_DONE),
      sol: { cells: FR1_DONE, events: ['find-replace'] },
    }),
    custom({
      id: 'whole', title: 'Match the entire cell',
      body: (
        <>
          <p>
            Replace <strong>UK</strong> with <strong>United Kingdom</strong>, but <strong>UKRAINE</strong> and <strong>Luke</strong> must stay
            as they are. Tick <strong>Match entire cell</strong> and <strong>Match case</strong>.
          </p>
        </>
      ),
      hint: 'Without "Match entire cell", UKRAINE would become "United KingdomRAINE".',
      success: 'Only the cells that were exactly UK changed.',
      seed: FR2, fresh: true, select: 'A2',
      check: (c) => same(c, FR2_DONE),
      sol: { cells: FR2_DONE, events: ['find-replace'] },
    }),
    custom({
      id: 'wild', title: 'Use a wildcard',
      body: (
        <p>
          Remove the "Dept 1: " style prefix. Find <strong>Dept ?: </strong> (the <strong>?</strong> stands for any single character, and note the
          space after the colon) and replace it with nothing.
        </p>
      ),
      hint: 'Leave "Replace with" empty.',
      success: 'Only Sales, Sales and Ops are left.',
      seed: FR3, fresh: true, select: 'A2',
      check: (c) => same(c, FR3_DONE),
      sol: { cells: FR3_DONE, events: ['find-replace'] },
    }),
    custom({
      id: 'two', title: 'Two passes',
      body: (
        <p>
          First delete the text <strong>{'  (est)'}</strong> (two spaces and the word in brackets), then replace <strong>Total</strong> with{' '}
          <strong>Sum</strong>. You can run Find &amp; replace as many times as you like.
        </p>
      ),
      hint: 'Two separate Replace All runs.',
      success: 'Sum, Net, Gross.',
      seed: FR4, fresh: true, select: 'A2',
      check: (c) => same(c, FR4_DONE),
      sol: { cells: FR4_DONE, events: ['find-replace'] },
    }),
  ],
};

const TXT = grid([['Amount'], ['1,250 USD'], ['980 USD'], ['2,100 USD']]);
const DTXT = grid([['Order date'], ['20260315'], ['20260401'], ['20261225']]);

export const textNumbers: LessonContent = {
  key: 'da-text-numbers',
  title: 'Numbers & dates stored as text',
  steps: [
    info('intro', 'When Excel will not add it up', (
      <>
        <p>
          A column of numbers that will not sum is usually <strong>text in disguise</strong>: a currency code, a stray space, a date written
          as 20260315. Excel left-aligns it and ignores it in totals.
        </p>
        <p>
          The cure: <strong>strip the noise, then convert</strong> with <strong>VALUE</strong> or <strong>DATE</strong>.
        </p>
      </>
    )),
    task({
      id: 'isnum', title: 'Test with ISNUMBER',
      body: (
        <p>
          In <Cell>B2</Cell> type <F>{'=ISNUMBER(A2)'}</F> and fill down to <Cell>B4</Cell>. FALSE means "this is text".
        </p>
      ),
      hint: 'The amounts all end in " USD", so Excel reads them as text.',
      success: 'FALSE for all three, so SUM would give 0.',
      seed: TXT, fresh: true, select: 'B2',
      cells: { B2: false, B3: false, B4: false }, uses: 'ISNUMBER',
      sol: { B2: '=ISNUMBER(A2)', B3: '=ISNUMBER(A3)', B4: '=ISNUMBER(A4)' },
    }),
    task({
      id: 'value', title: 'Strip and convert',
      body: (
        <>
          <p>
            In <Cell>B2</Cell> remove " USD" and turn the rest into a number, then fill down:
          </p>
          <p>
            <F>{'=VALUE(SUBSTITUTE(A2," USD",""))'}</F>
          </p>
        </>
      ),
      hint: 'SUBSTITUTE cleans, VALUE converts.',
      success: '1250, 980, 2100. Real numbers now (right-aligned).',
      seed: TXT, select: 'B2',
      cells: { B2: 1250, B3: 980, B4: 2100 }, uses: ['VALUE', 'SUBSTITUTE'],
      sol: { B2: '=VALUE(SUBSTITUTE(A2," USD",""))', B3: '=VALUE(SUBSTITUTE(A3," USD",""))', B4: '=VALUE(SUBSTITUTE(A4," USD",""))' },
    }),
    task({
      id: 'sum', title: 'Now it adds up',
      body: (
        <p>
          In <Cell>B5</Cell> total the converted column with <F>{'=SUM(B2:B4)'}</F>.
        </p>
      ),
      hint: 'Try =SUM(A2:A4) as well and notice it gives 0.',
      success: '4330.',
      seed: { ...TXT, B2: '=VALUE(SUBSTITUTE(A2," USD",""))', B3: '=VALUE(SUBSTITUTE(A3," USD",""))', B4: '=VALUE(SUBSTITUTE(A4," USD",""))' }, select: 'B5',
      cells: { B5: 4330 }, uses: 'SUM', sol: { B5: '=SUM(B2:B4)' },
    }),
    task({
      id: 'date', title: 'Rebuild a date from digits',
      body: (
        <>
          <p>
            <strong>20260315</strong> is eight digits of text, not a date. In <Cell>B2</Cell> build the real date and fill down:
          </p>
          <p>
            <F>{'=DATE(LEFT(A2,4),MID(A2,5,2),RIGHT(A2,2))'}</F>
          </p>
        </>
      ),
      hint: 'Take the year, month and day with LEFT, MID and RIGHT.',
      success: '15 Mar 2026, 1 Apr 2026, 25 Dec 2026.',
      seed: DTXT, fresh: true, select: 'B2',
      cells: { B2: E.dateToSerial(2026, 3, 15), B3: E.dateToSerial(2026, 4, 1), B4: E.dateToSerial(2026, 12, 25) }, uses: 'DATE',
      sol: Object.fromEntries([2, 3, 4].map((r) => [`B${r}`, `=DATE(LEFT(A${r},4),MID(A${r},5,2),RIGHT(A${r},2))`])),
    }),
  ],
};

const BLANKS = grid([['Region', 'Sales'], ['North', 100], ['', 120], ['', 90], ['South', 80], ['', 70]]);
const GAPS = grid([['Name'], ['Ana'], [''], ['Ben'], [''], ['Cleo']]);
const SORT_GAPS = T.sortRows(base(GAPS), rect('A1:A6'), [{ col: 0, asc: true }], true).cells;

export const blanksErrors: LessonContent = {
  key: 'da-blanks-errors',
  title: 'Blanks & errors',
  tools: ['sort'],
  steps: [
    info('intro', 'Gaps and errors break analysis', (
      <>
        <p>
          Blank cells in a category column break pivots and filters. Errors spread through totals. Find them, then fix them with simple
          tools.
        </p>
      </>
    )),
    task({
      id: 'count', title: 'Count the blanks',
      body: (
        <p>
          In <Cell>D1</Cell> count the empty Region cells: <F>{'=COUNTBLANK(A2:A6)'}</F>.
        </p>
      ),
      hint: 'Three Region cells are empty.',
      success: '3.',
      seed: BLANKS, fresh: true, select: 'D1',
      cells: { D1: 3 }, uses: 'COUNTBLANK', sol: { D1: '=COUNTBLANK(A2:A6)' },
    }),
    task({
      id: 'filldown', title: 'Fill the gaps downward',
      body: (
        <>
          <p>
            A report lists the region once and leaves the rows under it blank. Repeat it in column C. In <Cell>C2</Cell> type{' '}
            <F>{'=IF(A2="",C1,A2)'}</F> and fill down to <Cell>C6</Cell>. (C1 is a text header, but C2 has a real region so it never needs it.)
          </p>
        </>
      ),
      hint: '"If this cell is blank, use the cell above; otherwise use this cell."',
      success: 'North, North, North, South, South. Every row now has a region.',
      seed: BLANKS, select: 'C2',
      cells: { C2: 'North', C3: 'North', C4: 'North', C5: 'South', C6: 'South' }, uses: 'IF',
      sol: Object.fromEntries([2, 3, 4, 5, 6].map((r) => [`C${r}`, `=IF(A${r}="",C${r - 1},A${r})`])),
    }),
    custom({
      id: 'sort', title: 'Push blanks to the bottom',
      body: (
        <p>
          Sorting is a quick way to gather blank rows together. Sort the Name column <strong>A to Z</strong> and the empty cells sink to the
          bottom.
        </p>
      ),
      hint: 'Click a cell in the Name column and press Sort A→Z.',
      success: 'Ana, Ben, Cleo, then the blanks. Blanks always sort last.',
      seed: GAPS, fresh: true, select: 'A2',
      check: (c) => same(c, SORT_GAPS),
      sol: { cells: SORT_GAPS, events: ['sort'] },
    }),
    task({
      id: 'ifna', title: 'Tame a lookup error',
      body: (
        <p>
          <Cell>D2</Cell> looks up a customer that is not in the list and shows <strong>#N/A</strong>. Wrap it so it shows{' '}
          <strong>No data</strong> instead.
        </p>
      ),
      hint: '=IFNA(VLOOKUP("Zed",A2:B6,2,FALSE),"No data")',
      success: 'A tidy message instead of an error.',
      seed: { ...BLANKS, D2: '=VLOOKUP("Zed",A2:B6,2,FALSE)' }, fresh: true, select: 'D2',
      cells: { D2: 'No data' }, uses: 'IFNA', sol: { D2: '=IFNA(VLOOKUP("Zed",A2:B6,2,FALSE),"No data")' },
    }),
  ],
};

const U2A = grid([['Name', 'Email'], ['Ana', 'ana@mail.com'], ['Ben', 'ben@work.org'], ['Ana B', 'ana@mail.com'], ['Cleo', 'cleo@mail.com']]);
const U2A_DONE = T.removeDuplicates(base(U2A), rect('A1:B5'), [1], true).data.cells;
const U2B = grid([['Code'], ['A-17'], ['B-22'], ['C-03']]);
const U2B_DONE = T.textToColumns(base(U2B), 0, 1, 3, ['-']).cells;
const U2C = grid([['Full name', 'Surname'], ['Ana Lopez'], ['Ben Kim'], ['Cleo Park']]);

export const unit2Test: LessonContent = {
  key: 'da-unit2-test',
  title: 'Unit 2 test',
  tools: ['dedupe', 'text2col', 'flash', 'find'],
  steps: [
    info('intro', 'Cleaning test', <p>Five cleaning jobs. Use the data tools or formulas, whichever fits.</p>),
    custom({
      id: 'dedupe', title: '1. One row per email',
      body: <p>Remove the duplicate <strong>emails</strong>, keeping the first row of each.</p>,
      hint: 'Tick only the Email column in Remove duplicates.',
      success: 'Done.',
      seed: U2A, fresh: true, select: 'B2',
      check: (c) => same(c, U2A_DONE),
      sol: { cells: U2A_DONE, events: ['dedupe'] },
    }),
    custom({
      id: 'split', title: '2. Split the code',
      body: <p>Split the codes <strong>A-17</strong> style at the dash into two columns.</p>,
      hint: 'Select A2:A4 first. Choose Other and type -.',
      success: 'Letters in A, numbers in B.',
      seed: U2B, fresh: true, select: 'A2',
      check: (c) => same(c, U2B_DONE),
      sol: { cells: U2B_DONE, events: ['text-to-columns'] },
    }),
    custom({
      id: 'flash', title: '3. Surnames',
      body: <p>In column B, type <strong>Lopez</strong> next to Ana Lopez and let Flash fill finish the other surnames.</p>,
      hint: 'Type Lopez in B2, Enter, then Flash fill.',
      success: 'Lopez, Kim, Park.',
      seed: U2C, fresh: true, select: 'B2',
      check: (c) => c.raw('B2').trim() === 'Lopez' && c.raw('B3') === 'Kim' && c.raw('B4') === 'Park',
      sol: { cells: { B2: 'Lopez', B3: 'Kim', B4: 'Park' }, events: ['flash-fill'] },
    }),
    custom({
      id: 'replace', title: '4. Find & replace',
      body: <p>Replace every <strong>Mt.</strong> with <strong>Mount</strong> in the list.</p>,
      hint: 'Find what: Mt.   Replace with: Mount',
      success: 'Mount Etna, Mount Fuji.',
      seed: grid([['Peak'], ['Mt. Etna'], ['Mt. Fuji'], ['Everest']]), fresh: true, select: 'A2',
      check: (c) => c.raw('A2') === 'Mount Etna' && c.raw('A3') === 'Mount Fuji' && c.raw('A4') === 'Everest',
      sol: { cells: { A2: 'Mount Etna', A3: 'Mount Fuji' }, events: ['find-replace'] },
    }),
    task({
      id: 'convert', title: '5. Convert text to numbers',
      body: <p>In <Cell>B2</Cell> turn "1,250 USD" in A2 into the number 1250.</p>,
      hint: '=VALUE(SUBSTITUTE(A2," USD",""))',
      success: 'Unit 2 complete.',
      seed: TXT, fresh: true, select: 'B2',
      cells: { B2: 1250 }, uses: ['VALUE'], sol: { B2: '=VALUE(SUBSTITUTE(A2," USD",""))' },
    }),
  ],
};
