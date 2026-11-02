// Advanced Formulas, units 1 and 2: dynamic arrays, then LET and LAMBDA.
import * as E from '@/components/sheet/engine';
import { custom, grid, info, task } from './dsl';
import { Cell, F, K } from './kbd';
import { HEADER, ROWS, SALES, SHEET, revenue, sortRows, spill, uniq, units } from './adv-util';
import type { LessonContent } from './types';

const cellsOf = (rows: (string | number)[][]) => rows.map((r) => [...r]);
const A5 = (rows: typeof ROWS) => cellsOf(rows.map((r) => [...r]));
const noteSpill = (
  <p>
    The blue outline shows the <strong>spill range</strong>. Only the top-left cell holds the formula; the rest are filled by it.
  </p>
);

// ---------------------------------------------------------------------------
// Unit 1 · Dynamic arrays
// ---------------------------------------------------------------------------
export const spillLesson: LessonContent = {
  key: 'adv-spill',
  title: 'Spill ranges',
  sheet: SHEET,
  steps: [
    info('intro', 'One formula, many cells', (
      <>
        <p>
          In modern Excel a formula that returns <strong>several values</strong> does not need to be copied. It <strong>spills</strong> into the empty cells
          beside and below it, all from one formula. This is called a <strong>dynamic array</strong>. It needs Excel 2021 or Microsoft 365.
        </p>
        <p>
          This course uses a bigger sheet so results have room. Keep the cells <strong>below and to the right</strong> of a formula empty, or it cannot spill.
        </p>
      </>
    )),
    spill({
      id: 'seq', title: 'Your first spill',
      body: (
        <>
          <p>
            In <Cell>G2</Cell> type <F>{'=SEQUENCE(5)'}</F>. It returns the numbers 1 to 5 down the column.
          </p>
          {noteSpill}
        </>
      ),
      hint: 'SEQUENCE(rows) counts from 1.',
      success: 'Five cells from one formula. Click G4: the formula is not there, it lives in G2.',
      seed: {}, fresh: true, at: 'G2', expect: [[1], [2], [3], [4], [5]], exact: true, uses: ['SEQUENCE'], sol: { G2: '=SEQUENCE(5)' },
    }),
    spill({
      id: 'grid', title: 'Rows and columns',
      body: (
        <p>
          Give SEQUENCE two numbers, rows then columns. In <Cell>G2</Cell> type <F>{'=SEQUENCE(3,4)'}</F> for a 3 × 4 block.
        </p>
      ),
      hint: 'It fills across each row first.',
      success: '12 numbers in a 3 × 4 grid, from one formula.',
      seed: {}, fresh: true, at: 'G2', expect: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]], exact: true, uses: ['SEQUENCE'], sol: { G2: '=SEQUENCE(3,4)' },
    }),
    custom({
      id: 'blocked', title: 'The #SPILL! error',
      body: (
        <>
          <p>
            <Cell>G2</Cell> shows <strong>#SPILL!</strong>. Something is sitting in the way. Find the blocking cell in the spill path and clear it (select it and press{' '}
            <K>Delete</K>).
          </p>
          <p>Other causes: merged cells in the way, and spilling inside an Excel Table (dynamic arrays do not work there).</p>
        </>
      ),
      hint: 'The formula wants G2:G6. Look in that column.',
      success: 'Cleared. The formula spills as soon as its path is empty.',
      seed: { G2: '=SEQUENCE(5)', G4: 'x' }, fresh: true, select: 'G4',
      check: (c) => c.raw('G4') === '' && c.value('G6') === 5 && c.raw('G2').startsWith('=SEQUENCE'),
      sol: { cells: { G4: '' } },
    }),
    task({
      id: 'ref', title: 'Refer to the whole spill with #',
      body: (
        <>
          <p>
            <Cell>G2</Cell> holds a spilling formula. Refer to the <em>entire</em> result with the <strong>spill operator</strong> <F>{'#'}</F> after its anchor
            cell. In <Cell>I2</Cell> type <F>{'=SUM(G2#)'}</F>.
          </p>
        </>
      ),
      hint: 'G2# means "everything G2 spills into". It grows and shrinks with the formula.',
      success: '15. If the spill changes size, the total follows.',
      seed: { G2: '=SEQUENCE(5)' }, fresh: true, select: 'I2',
      cells: { I2: 15 }, uses: 'SUM', also: (c) => c.raw('I2').includes('#'), sol: { I2: '=SUM(G2#)' },
    }),
    custom({
      id: 'grow', title: 'Resize by changing one number',
      body: <p>Edit the formula in <Cell>G2</Cell> so it makes <strong>8</strong> numbers instead of 5. The spill grows by itself.</p>,
      hint: 'Change SEQUENCE(5) to SEQUENCE(8).',
      success: 'Eight cells, and nothing was copied or dragged.',
      seed: { G2: '=SEQUENCE(5)', I2: '=SUM(G2#)' }, fresh: true, select: 'G2',
      check: (c) => /SEQUENCE\(\s*8\s*\)/i.test(c.raw('G2')) && c.value('G9') === 8 && c.value('I2') === 36 && !c.editing,
      sol: { cells: { G2: '=SEQUENCE(8)' } },
    }),
  ],
};

const byUnitsDesc = sortRows(ROWS, { by: units, desc: true });
const regionTotalRows = (region: string) => ROWS.filter((r) => r[0] === region);

export const sortFunctions: LessonContent = {
  key: 'adv-sort',
  title: 'SORT & SORTBY',
  sheet: SHEET,
  steps: [
    info('intro', 'A live sorted copy', (
      <>
        <p>
          The old Sort button rearranges your data once. <strong>SORT</strong> and <strong>SORTBY</strong> create a <strong>live sorted copy</strong> that
          rebuilds itself when the data changes, and leave the original untouched.
        </p>
        <p>
          <F>{'=SORT(array, [sort_index], [order], [by_col])'}</F> · order is <F>{'1'}</F> for ascending, <F>{'-1'}</F> for descending.
        </p>
        <p>
          The 20 orders are in <Cell>A1:E21</Cell>. Results spill to the right from column G.
        </p>
      </>
    )),
    spill({
      id: 'col', title: 'Sort one column',
      body: <p>In <Cell>G2</Cell> list all the <strong>Units</strong> values, biggest first: <F>{'=SORT(D2:D21,1,-1)'}</F>.</p>,
      hint: 'Order -1 means descending.',
      success: '14 at the top, 2 at the bottom.',
      seed: SALES, fresh: true, at: 'G2', expect: byUnitsDesc.map((r) => [r[3]]), exact: true, uses: ['SORT'], sol: { G2: '=SORT(D2:D21,1,-1)' },
    }),
    spill({
      id: 'table', title: 'Sort the whole table',
      body: (
        <p>
          Sort every row by <strong>Units</strong> (column 4 of the block), biggest first. In <Cell>G2</Cell> type <F>{'=SORT(A2:E21,4,-1)'}</F>. The sort index
          says <em>which column of the block</em> to sort by.
        </p>
      ),
      hint: 'The index counts columns inside A2:E21, so Units is 4.',
      success: 'All five columns reordered together. The original data is unchanged on the left.',
      seed: SALES, fresh: true, at: 'G2', expect: A5(byUnitsDesc), exact: true, uses: ['SORT'], sol: { G2: '=SORT(A2:E21,4,-1)' },
    }),
    spill({
      id: 'sortby', title: 'Sort by two keys with SORTBY',
      body: (
        <>
          <p>
            <strong>SORTBY</strong> sorts one range by <em>other</em> ranges, as many as you like. Sort the table by <strong>Region</strong> (A to Z) and then by{' '}
            <strong>Units</strong> (biggest first):
          </p>
          <p>
            <F>{'=SORTBY(A2:E21,A2:A21,1,D2:D21,-1)'}</F>
          </p>
        </>
      ),
      hint: 'Pairs of: sort-by range, order.',
      success: 'East first, then North, South, West, each with the biggest orders on top.',
      seed: SALES, fresh: true, at: 'G2',
      expect: A5(sortRows(ROWS, { by: (r) => r[0] }, { by: units, desc: true })), exact: true, uses: ['SORTBY'],
      sol: { G2: '=SORTBY(A2:E21,A2:A21,1,D2:D21,-1)' },
    }),
    spill({
      id: 'calc', title: 'Sort by a calculation',
      body: (
        <>
          <p>
            The sort key can be a <strong>calculation that does not exist on the sheet</strong>. List the regions ordered by <em>revenue</em> (units × price), biggest
            first:
          </p>
          <p>
            <F>{'=SORTBY(A2:A21,D2:D21*E2:E21,-1)'}</F>
          </p>
        </>
      ),
      hint: 'D2:D21*E2:E21 multiplies two columns row by row, as an array.',
      success: 'No helper column needed. The key was computed on the fly.',
      seed: SALES, fresh: true, at: 'G2', expect: sortRows(ROWS, { by: revenue, desc: true }).map((r) => [r[0]]), exact: true, uses: ['SORTBY'],
      sol: { G2: '=SORTBY(A2:A21,D2:D21*E2:E21,-1)' },
    }),
    spill({
      id: 'top', title: 'Combine with TAKE',
      body: (
        <>
          <p>
            Wrap a sort in <strong>TAKE</strong> to keep only the first rows. A top-5 leaderboard of the biggest orders:
          </p>
          <p>
            <F>{'=TAKE(SORT(A2:E21,4,-1),5)'}</F>
          </p>
        </>
      ),
      hint: 'TAKE(array, rows) keeps the first rows.',
      success: 'A live top 5. Change the data and the leaderboard updates.',
      seed: SALES, fresh: true, at: 'G2', expect: A5(byUnitsDesc.slice(0, 5)), exact: true, uses: ['TAKE', 'SORT'], sol: { G2: '=TAKE(SORT(A2:E21,4,-1),5)' },
    }),
  ],
};

const north = ROWS.filter((r) => r[0] === 'North');
const northBig = ROWS.filter((r) => r[0] === 'North' && r[3] >= 8);
const eastWest = ROWS.filter((r) => r[0] === 'East' || r[0] === 'West');
const pens = sortRows(ROWS.filter((r) => r[2] === 'Pen'), { by: units, desc: true });

export const filterFunction: LessonContent = {
  key: 'adv-filter',
  title: 'FILTER',
  sheet: SHEET,
  steps: [
    info('intro', 'Return only the rows you want', (
      <>
        <p>
          <F>{'=FILTER(array, include, [if_empty])'}</F>. The <strong>include</strong> argument is a column of TRUE/FALSE, one per row, usually a test like{' '}
          <F>{'A2:A21="North"'}</F>. Rows where it is TRUE are returned.
        </p>
        <p>
          Unlike the Filter button, FILTER leaves your data alone and builds a <strong>separate result that updates live</strong>.
        </p>
      </>
    )),
    spill({
      id: 'one', title: 'One condition',
      body: <p>List only the <strong>North</strong> orders in <Cell>G2</Cell>: <F>{'=FILTER(A2:E21,A2:A21="North")'}</F>.</p>,
      hint: 'The test A2:A21="North" gives 20 TRUE/FALSE values.',
      success: 'Five North orders, all five columns.',
      seed: SALES, fresh: true, at: 'G2', expect: A5(north), exact: true, uses: ['FILTER'], sol: { G2: '=FILTER(A2:E21,A2:A21="North")' },
    }),
    spill({
      id: 'and', title: 'AND: multiply the tests',
      body: (
        <>
          <p>
            Both conditions must hold: <strong>North</strong> <em>and</em> <strong>Units of 8 or more</strong>. Multiply the two tests (TRUE × TRUE = 1):
          </p>
          <p>
            <F>{'=FILTER(A2:E21,(A2:A21="North")*(D2:D21>=8))'}</F>
          </p>
        </>
      ),
      hint: 'Each test goes in its own brackets.',
      success: 'Two rows left. Multiplication works as AND.',
      seed: SALES, fresh: true, at: 'G2', expect: A5(northBig), exact: true, uses: ['FILTER'],
      sol: { G2: '=FILTER(A2:E21,(A2:A21="North")*(D2:D21>=8))' },
    }),
    spill({
      id: 'or', title: 'OR: add the tests',
      body: (
        <>
          <p>
            Either condition will do: <strong>East</strong> <em>or</em> <strong>West</strong>. Add the tests:
          </p>
          <p>
            <F>{'=FILTER(A2:E21,(A2:A21="East")+(A2:A21="West"))'}</F>
          </p>
        </>
      ),
      hint: 'Addition works as OR: any TRUE makes the sum above zero.',
      success: 'All East and West orders, in their original order.',
      seed: SALES, fresh: true, at: 'G2', expect: A5(eastWest), exact: true, uses: ['FILTER'],
      sol: { G2: '=FILTER(A2:E21,(A2:A21="East")+(A2:A21="West"))' },
    }),
    spill({
      id: 'empty', title: 'When nothing matches',
      body: (
        <>
          <p>
            If no row matches, FILTER returns <strong>#CALC!</strong>. Give it a friendly fallback as the third argument:
          </p>
          <p>
            <F>{'=FILTER(A2:E21,A2:A21="Mars","No orders")'}</F>
          </p>
        </>
      ),
      hint: 'The third argument is the "if empty" result.',
      success: 'A clear message instead of an error.',
      seed: SALES, fresh: true, at: 'G2', expect: [['No orders']], uses: ['FILTER'], sol: { G2: '=FILTER(A2:E21,A2:A21="Mars","No orders")' },
    }),
    spill({
      id: 'combo', title: 'FILTER then SORT',
      body: (
        <>
          <p>
            Dynamic array functions nest. Show all <strong>Pen</strong> orders, biggest units first:
          </p>
          <p>
            <F>{'=SORT(FILTER(A2:E21,C2:C21="Pen"),4,-1)'}</F>
          </p>
        </>
      ),
      hint: 'FILTER runs first, SORT works on its result.',
      success: 'Seven pen orders, sorted. A report in one formula.',
      seed: SALES, fresh: true, at: 'G2', expect: A5(pens), exact: true, uses: ['SORT', 'FILTER'], sol: { G2: '=SORT(FILTER(A2:E21,C2:C21="Pen"),4,-1)' },
    }),
  ],
};

const regions = uniq(ROWS.map((r) => r[0]));
const regionUnits = regions.map((g) => regionTotalRows(g).reduce((s, r) => s + r[3], 0));
const VISITORS = grid([['Visitor'], ['Ana'], ['Ben'], ['Ana'], ['Cleo'], ['Dev'], ['Ben'], ['Eli']]);

export const uniqueFunction: LessonContent = {
  key: 'adv-unique',
  title: 'UNIQUE',
  sheet: SHEET,
  steps: [
    info('intro', 'A list with no repeats', (
      <>
        <p>
          <strong>UNIQUE</strong> removes duplicates and returns each distinct value once. It is live: add an order for a new region and the list grows by
          itself. Handy for dropdown lists, report headings and counting distinct items.
        </p>
      </>
    )),
    spill({
      id: 'regions', title: 'Distinct values',
      body: <p>List each <strong>Region</strong> once in <Cell>G2</Cell>: <F>{'=UNIQUE(A2:A21)'}</F>.</p>,
      hint: 'They come out in the order they first appear.',
      success: 'North, South, East, West.',
      seed: SALES, fresh: true, at: 'G2', expect: regions.map((r) => [r]), exact: true, uses: ['UNIQUE'], sol: { G2: '=UNIQUE(A2:A21)' },
    }),
    task({
      id: 'count', title: 'Count distinct values',
      body: (
        <>
          <p>
            How many different <strong>reps</strong> are there? Wrap UNIQUE in COUNTA: <F>{'=COUNTA(UNIQUE(B2:B21))'}</F> in <Cell>G2</Cell>.
          </p>
        </>
      ),
      hint: 'UNIQUE gives the list, COUNTA counts it.',
      success: '4 reps. This used to need a long, awkward formula.',
      seed: SALES, fresh: true, select: 'G2',
      cells: { G2: uniq(ROWS.map((r) => r[1])).length }, uses: ['COUNTA', 'UNIQUE'], sol: { G2: '=COUNTA(UNIQUE(B2:B21))' },
    }),
    spill({
      id: 'sorted', title: 'Sorted distinct list',
      body: <p>List the distinct <strong>products</strong> alphabetically: <F>{'=SORT(UNIQUE(C2:C21))'}</F>.</p>,
      hint: 'UNIQUE first, then SORT.',
      success: 'Bag, Book, Lamp, Pen.',
      seed: SALES, fresh: true, at: 'G2', expect: [['Bag'], ['Book'], ['Lamp'], ['Pen']], exact: true, uses: ['SORT', 'UNIQUE'], sol: { G2: '=SORT(UNIQUE(C2:C21))' },
    }),
    spill({
      id: 'once', title: 'Exactly once',
      body: (
        <>
          <p>
            The third argument <F>{'TRUE'}</F> keeps only values that appear <strong>exactly once</strong>. Who visited only one time? In <Cell>G2</Cell>:
          </p>
          <p>
            <F>{'=UNIQUE(A2:A8,FALSE,TRUE)'}</F>
          </p>
        </>
      ),
      hint: 'The second argument (FALSE) means compare rows, not columns.',
      success: 'Cleo, Dev and Eli came once. Ana and Ben came twice.',
      seed: VISITORS, fresh: true, at: 'G2', expect: [['Cleo'], ['Dev'], ['Eli']], exact: true, uses: ['UNIQUE'], sol: { G2: '=UNIQUE(A2:A8,FALSE,TRUE)' },
    }),
    spill({
      id: 'totals', title: 'A total next to every unique item',
      body: (
        <>
          <p>
            <Cell>G2</Cell> already lists the unique regions. In <Cell>H2</Cell> add each region's total units with one formula, using the spill operator as the
            criteria:
          </p>
          <p>
            <F>{'=SUMIFS(D2:D21,A2:A21,G2#)'}</F>
          </p>
        </>
      ),
      hint: 'G2# is the whole list of regions, so SUMIFS returns one total per region.',
      success: 'A mini summary table from two formulas, and it stays in sync with the data.',
      seed: { ...SALES, G2: '=UNIQUE(A2:A21)' }, fresh: true, at: 'H2', expect: regionUnits.map((n) => [n]), exact: true, uses: ['SUMIFS'],
      also: (c) => c.raw('H2').includes('#'), sol: { H2: '=SUMIFS(D2:D21,A2:A21,G2#)' },
    }),
  ],
};

const times = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => (r + 1) * (c + 1)));
const marchDays = Array.from({ length: 7 }, (_, i) => [E.formatDate(E.dateToSerial(2026, 3, 1) + i, 'ddd d mmm')]);

export const sequenceFunction: LessonContent = {
  key: 'adv-sequence',
  title: 'SEQUENCE & RANDARRAY',
  sheet: SHEET,
  steps: [
    info('intro', 'Generate data with a formula', (
      <>
        <p>
          <F>{'SEQUENCE(rows, [columns], [start], [step])'}</F> builds a list or a grid of numbers. It is the tool for row numbers, calendars, test data and lookup
          tables. <strong>RANDARRAY</strong> does the same with random numbers.
        </p>
      </>
    )),
    spill({
      id: 'step', title: 'Start and step',
      body: <p>Make the first five even numbers in <Cell>G2</Cell>: <F>{'=SEQUENCE(5,1,2,2)'}</F> (5 rows, 1 column, start at 2, step 2).</p>,
      hint: 'The third argument is the start, the fourth the step.',
      success: '2, 4, 6, 8, 10.',
      seed: {}, fresh: true, at: 'G2', expect: [[2], [4], [6], [8], [10]], exact: true, uses: ['SEQUENCE'], sol: { G2: '=SEQUENCE(5,1,2,2)' },
    }),
    spill({
      id: 'times', title: 'A times table from two sequences',
      body: (
        <>
          <p>
            A column array times a row array makes a full grid. In <Cell>A2</Cell> type:
          </p>
          <p>
            <F>{'=SEQUENCE(9)*SEQUENCE(1,9)'}</F>
          </p>
        </>
      ),
      hint: 'Nine rows down times nine columns across.',
      success: 'A 9 × 9 times table from one formula. Excel "broadcasts" a column against a row.',
      seed: {}, fresh: true, at: 'A2', expect: times, exact: true, uses: ['SEQUENCE'], sol: { A2: '=SEQUENCE(9)*SEQUENCE(1,9)' },
    }),
    spill({
      id: 'dates', title: 'A week of dates',
      body: (
        <>
          <p>
            Combine functions: seven dates starting 1 March 2026, shown as day names, with TEXT:
          </p>
          <p>
            <F>{'=TEXT(SEQUENCE(7,1,DATE(2026,3,1)),"ddd d mmm")'}</F>
          </p>
        </>
      ),
      hint: 'Dates are numbers, so SEQUENCE can count them.',
      success: 'Sun 1 Mar to Sat 7 Mar. A calendar column from one formula.',
      seed: {}, fresh: true, at: 'G2', expect: marchDays, exact: true, uses: ['TEXT', 'SEQUENCE'], sol: { G2: '=TEXT(SEQUENCE(7,1,DATE(2026,3,1)),"ddd d mmm")' },
    }),
    custom({
      id: 'rand', title: 'Random numbers',
      body: (
        <>
          <p>
            <F>{'=RANDARRAY(3,4,1,100,TRUE)'}</F> in <Cell>G2</Cell> makes a 3 × 4 block of random <strong>whole</strong> numbers from 1 to 100 (the last argument TRUE
            means whole numbers).
          </p>
          <p>
            RANDARRAY is <strong>volatile</strong>: it picks new numbers every time the sheet recalculates.
          </p>
        </>
      ),
      hint: 'Rows, columns, minimum, maximum, whole numbers.',
      success: 'New random numbers on every change. Great for samples, risky anywhere you need stable results.',
      seed: {}, fresh: true, select: 'G2',
      check: (c) => {
        if (!/RANDARRAY/i.test(c.raw('G2'))) return false;
        for (let r = 0; r < 3; r++) {
          for (let k = 0; k < 4; k++) {
            const v = c.value(E.keyOf(6 + k, 1 + r));
            if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 100) return false;
          }
        }
        return c.display('K2') === '' && c.display('G5') === '';
      },
      sol: { cells: { G2: '=RANDARRAY(3,4,1,100,TRUE)' } },
    }),
  ],
};

export const unit1Test: LessonContent = {
  key: 'adv-unit1-test',
  title: 'Unit 1 test',
  sheet: SHEET,
  steps: [
    info('intro', 'Dynamic arrays test', <p>Five tasks with spilling formulas. The 20 orders are in A1:E21.</p>),
    spill({
      id: 'seq', title: '1. SEQUENCE',
      body: <p>In <Cell>G2</Cell> make the numbers 10, 20, 30, 40, 50 with SEQUENCE.</p>,
      hint: '=SEQUENCE(5,1,10,10)',
      success: 'Correct.',
      seed: SALES, fresh: true, at: 'G2', expect: [[10], [20], [30], [40], [50]], exact: true, uses: ['SEQUENCE'], sol: { G2: '=SEQUENCE(5,1,10,10)' },
    }),
    spill({
      id: 'sort', title: '2. SORT',
      body: <p>List every Region and Rep pair as sorted rows, by Rep A to Z: sort the first two columns <Cell>A2:B21</Cell> by column 2.</p>,
      hint: '=SORT(A2:B21,2,1)',
      success: 'Correct.',
      seed: SALES, fresh: true, at: 'G2', expect: sortRows(ROWS, { by: (r) => r[1] }).map((r) => [r[0], r[1]]), exact: true, uses: ['SORT'], sol: { G2: '=SORT(A2:B21,2,1)' },
    }),
    spill({
      id: 'filter', title: '3. FILTER',
      body: <p>Show every order handled by <strong>Dev</strong> (all five columns).</p>,
      hint: '=FILTER(A2:E21,B2:B21="Dev")',
      success: 'Correct.',
      seed: SALES, fresh: true, at: 'G2', expect: A5(ROWS.filter((r) => r[1] === 'Dev')), exact: true, uses: ['FILTER'], sol: { G2: '=FILTER(A2:E21,B2:B21="Dev")' },
    }),
    task({
      id: 'unique', title: '4. UNIQUE',
      body: <p>In <Cell>G2</Cell> count how many <strong>distinct products</strong> were sold.</p>,
      hint: '=COUNTA(UNIQUE(C2:C21))',
      success: 'Correct: 4.',
      seed: SALES, fresh: true, select: 'G2',
      cells: { G2: 4 }, uses: ['COUNTA', 'UNIQUE'], sol: { G2: '=COUNTA(UNIQUE(C2:C21))' },
    }),
    task({
      id: 'ref', title: '5. The spill operator',
      body: <p><Cell>G2</Cell> spills the numbers 1 to 10. In <Cell>I2</Cell> total the whole spill with <F>{'#'}</F>.</p>,
      hint: '=SUM(G2#)',
      success: 'Unit 1 complete: 55.',
      seed: { G2: '=SEQUENCE(10)' }, fresh: true, select: 'I2',
      cells: { I2: 55 }, uses: ['SUM'], also: (c) => c.raw('I2').includes('#'), sol: { I2: '=SUM(G2#)' },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 2 · LET & LAMBDA
// ---------------------------------------------------------------------------
const totalRevenue = ROWS.reduce((s, r) => s + revenue(r), 0);
const northAvgUnits = north.reduce((s, r) => s + r[3], 0) / north.length;
const bestRegion = regions[regionUnits.indexOf(Math.max(...regionUnits))];

export const letFunction: LessonContent = {
  key: 'adv-let',
  title: 'LET',
  sheet: SHEET,
  steps: [
    info('intro', 'Name the pieces of a formula', (
      <>
        <p>
          <F>{'=LET(name1, value1, name2, value2, ..., result)'}</F> lets you give names to intermediate results and then use them. Long formulas become readable, and a
          calculation used three times is only calculated once. LET needs Excel 2021 or Microsoft 365.
        </p>
      </>
    )),
    task({
      id: 'first', title: 'Your first LET',
      body: <p>In <Cell>G2</Cell> name the first order's revenue and take 20% of it: <F>{'=LET(rev,D2*E2,rev*0.2)'}</F>.</p>,
      hint: 'Name, value, then the final calculation.',
      success: '4 (revenue 20, times 0.2).',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: 4 }, uses: ['LET'], sol: { G2: '=LET(rev,D2*E2,rev*0.2)' },
    }),
    task({
      id: 'two', title: 'Several names',
      body: <p>Add the 20% tax to the first price with two names: <F>{'=LET(p,E2,t,0.2,p*(1+t))'}</F> in <Cell>G2</Cell>.</p>,
      hint: 'Each name is followed by its value, in pairs.',
      success: '2.4. The final argument is always the result.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: 2.4 }, uses: ['LET'], sol: { G2: '=LET(p,E2,t,0.2,p*(1+t))' },
    }),
    task({
      id: 'array', title: 'A name can hold an array',
      body: <p>Total revenue across all orders. Name the array of per-row revenue, then add it up: <F>{'=LET(r,D2:D21*E2:E21,SUM(r))'}</F>.</p>,
      hint: 'D2:D21*E2:E21 is 20 revenues at once.',
      success: 'Total revenue, with no helper column.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: totalRevenue }, uses: ['LET', 'SUM'], sol: { G2: '=LET(r,D2:D21*E2:E21,SUM(r))' },
    }),
    task({
      id: 'reuse', title: 'Use a name twice',
      body: (
        <>
          <p>
            Average <strong>North</strong> units. The filtered list is needed twice (the sum and the count), so name it:
          </p>
          <p>
            <F>{'=LET(n,FILTER(D2:D21,A2:A21="North"),SUM(n)/COUNT(n))'}</F>
          </p>
        </>
      ),
      hint: 'Without LET you would repeat the FILTER twice.',
      success: '6.6 units on average. The FILTER ran once.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: northAvgUnits }, uses: ['LET', 'FILTER'], sol: { G2: '=LET(n,FILTER(D2:D21,A2:A21="North"),SUM(n)/COUNT(n))' },
    }),
    task({
      id: 'best', title: 'Which region sold the most units?',
      body: (
        <>
          <p>A real LET formula, in steps. Type it in <Cell>G2</Cell>:</p>
          <p>
            <F>{'=LET(reg,UNIQUE(A2:A21),tot,SUMIFS(D2:D21,A2:A21,reg),INDEX(reg,MATCH(MAX(tot),tot,0)))'}</F>
          </p>
          <p>
            Each line is a step: the list of regions, their totals, then the one with the biggest total.
          </p>
        </>
      ),
      hint: 'reg is a list, tot is the list of totals, INDEX/MATCH picks the winner.',
      success: 'West. Read it top to bottom: it explains itself.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: bestRegion }, uses: ['LET'],
      sol: { G2: '=LET(reg,UNIQUE(A2:A21),tot,SUMIFS(D2:D21,A2:A21,reg),INDEX(reg,MATCH(MAX(tot),tot,0)))' },
    }),
  ],
};

const isLambdaName = (c: { data: E.SheetData }, n: string) => /^=\s*LAMBDA\s*\(/i.test(c.data.names?.[n.toUpperCase()] ?? '');

export const lambdaFunction: LessonContent = {
  key: 'adv-lambda',
  title: 'LAMBDA',
  sheet: SHEET,
  tools: ['names'],
  steps: [
    info('intro', 'Write your own function', (
      <>
        <p>
          <F>{'=LAMBDA(parameter1, parameter2, ..., calculation)'}</F> creates a function without any code. Save it under a name and you can use it everywhere like a built-in
          one: <F>{'=TAX(100)'}</F>.
        </p>
        <p>
          Names are created in <strong>Formulas → Name Manager</strong>. Use the <strong>Name Manager</strong> button in the toolbar.
        </p>
      </>
    )),
    task({
      id: 'direct', title: 'Try a LAMBDA in a cell',
      body: (
        <>
          <p>
            Before saving a LAMBDA you can test it by calling it straight away: put the inputs in brackets after it. In <Cell>G2</Cell> type:
          </p>
          <p>
            <F>{'=LAMBDA(x,x*0.2)(100)'}</F>
          </p>
        </>
      ),
      hint: 'x takes the value 100, and the calculation returns 100 × 0.2.',
      success: '20.',
      seed: {}, fresh: true, select: 'G2', cells: { G2: 20 }, uses: ['LAMBDA'], sol: { G2: '=LAMBDA(x,x*0.2)(100)' },
    }),
    custom({
      id: 'define', title: 'Save it as a name',
      body: (
        <>
          <p>
            Open the <strong>Name Manager</strong>. Name: <F>{'TAX'}</F>. Refers to: <F>{'=LAMBDA(x,x*0.2)'}</F>. Press <strong>Add name</strong>.
          </p>
        </>
      ),
      hint: 'Type the name TAX and the LAMBDA formula starting with an equals sign.',
      success: 'TAX is now your own function.',
      seed: {}, fresh: true, select: 'G2',
      check: (c) => isLambdaName(c, 'TAX'),
      sol: { names: { TAX: '=LAMBDA(x,x*0.2)' }, events: ['define-name'] },
    }),
    task({
      id: 'use', title: 'Use your function',
      body: <p>In <Cell>G2</Cell> type <F>{'=TAX(250)'}</F>. It works just like SUM or ROUND.</p>,
      hint: 'You wrote TAX, so you can call it.',
      success: '50. One definition, used anywhere in the workbook.',
      seed: {}, fresh: true, select: 'G2', meta: { names: { TAX: '=LAMBDA(x,x*0.2)' } },
      cells: { G2: 50 }, also: (c) => /TAX\(/i.test(c.raw('G2')), sol: { G2: '=TAX(250)' },
    }),
    custom({
      id: 'two', title: 'Two inputs',
      body: (
        <>
          <p>
            Define <F>{'MARGIN'}</F> as <F>{'=LAMBDA(rev,cost,(rev-cost)/rev)'}</F> in the Name Manager. Then in <Cell>G2</Cell> type <F>{'=MARGIN(200,150)'}</F>.
          </p>
        </>
      ),
      hint: 'Parameters are separated by commas, and the last item is the calculation.',
      success: '0.25: a 25% margin. Any number of inputs works.',
      seed: {}, fresh: true, select: 'G2',
      check: (c) => isLambdaName(c, 'MARGIN') && c.value('G2') === 0.25 && /MARGIN\(/i.test(c.raw('G2')) && !c.editing,
      sol: { names: { MARGIN: '=LAMBDA(rev,cost,(rev-cost)/rev)' }, cells: { G2: '=MARGIN(200,150)' }, events: ['define-name'] },
    }),
    custom({
      id: 'text', title: 'It works on text too',
      body: (
        <>
          <p>
            Define <F>{'INITIALS'}</F> as <F>{'=LAMBDA(n,LEFT(n,1)&MID(n,FIND(" ",n)+1,1))'}</F>, then in <Cell>G2</Cell> type <F>{'=INITIALS("Ana Lopez")'}</F>.
          </p>
        </>
      ),
      hint: 'First letter plus the letter after the space.',
      success: 'AL.',
      seed: {}, fresh: true, select: 'G2',
      check: (c) => isLambdaName(c, 'INITIALS') && c.value('G2') === 'AL' && /INITIALS\(/i.test(c.raw('G2')) && !c.editing,
      sol: { names: { INITIALS: '=LAMBDA(n,LEFT(n,1)&MID(n,FIND(" ",n)+1,1))' }, cells: { G2: '=INITIALS("Ana Lopez")' }, events: ['define-name'] },
    }),
  ],
};

const bigSmall = ROWS.map((r) => [r[3] >= 8 ? 'Big' : 'Small']);

export const mapReduceScan: LessonContent = {
  key: 'adv-map-reduce',
  title: 'MAP, REDUCE & SCAN',
  sheet: SHEET,
  steps: [
    info('intro', 'Loop over data without code', (
      <>
        <p>
          These three functions take a <strong>LAMBDA</strong> and apply it to every item:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>MAP</strong>: transform each item, returns an array the same shape
          </li>
          <li>
            <strong>REDUCE</strong>: fold the whole array into one value
          </li>
          <li>
            <strong>SCAN</strong>: like REDUCE, but keeps every step (a running total)
          </li>
        </ul>
      </>
    )),
    spill({
      id: 'map', title: 'MAP one array',
      body: (
        <>
          <p>
            Label every order Big (8+ units) or Small. <F>{'MAP(array, LAMBDA(item, calculation))'}</F>:
          </p>
          <p>
            <F>{'=MAP(D2:D21,LAMBDA(u,IF(u>=8,"Big","Small")))'}</F>
          </p>
        </>
      ),
      hint: 'u stands for each Units value in turn.',
      success: '20 labels from one formula.',
      seed: SALES, fresh: true, at: 'G2', expect: bigSmall, exact: true, uses: ['MAP'], sol: { G2: '=MAP(D2:D21,LAMBDA(u,IF(u>=8,"Big","Small")))' },
    }),
    spill({
      id: 'map2', title: 'MAP two arrays together',
      body: (
        <>
          <p>
            MAP can walk through <strong>several arrays in step</strong>. Revenue per order from Units and Price:
          </p>
          <p>
            <F>{'=MAP(D2:D21,E2:E21,LAMBDA(u,p,u*p))'}</F>
          </p>
        </>
      ),
      hint: 'One LAMBDA parameter per array.',
      success: 'Twenty revenues (the same as D2:D21*E2:E21, but with room for real logic).',
      seed: SALES, fresh: true, at: 'G2', expect: ROWS.map((r) => [revenue(r)]), exact: true, uses: ['MAP'], sol: { G2: '=MAP(D2:D21,E2:E21,LAMBDA(u,p,u*p))' },
    }),
    spill({
      id: 'scan', title: 'SCAN: a running total',
      body: (
        <>
          <p>
            <F>{'SCAN(start, array, LAMBDA(total, item, ...))'}</F> returns the total after each item:
          </p>
          <p>
            <F>{'=SCAN(0,D2:D21,LAMBDA(a,v,a+v))'}</F>
          </p>
        </>
      ),
      hint: 'a is the running total so far, v is the current item.',
      success: 'A cumulative column of units.',
      seed: SALES, fresh: true, at: 'G2',
      expect: ROWS.map((_, i) => [ROWS.slice(0, i + 1).reduce((s, r) => s + r[3], 0)]), exact: true, uses: ['SCAN'], sol: { G2: '=SCAN(0,D2:D21,LAMBDA(a,v,a+v))' },
    }),
    task({
      id: 'reduce', title: 'REDUCE to one value',
      body: (
        <>
          <p>
            REDUCE folds an array into a single answer. The factorial of 5 (1×2×3×4×5):
          </p>
          <p>
            <F>{'=REDUCE(1,SEQUENCE(5),LAMBDA(acc,v,acc*v))'}</F>
          </p>
        </>
      ),
      hint: 'Start at 1, multiply by each number in turn.',
      success: '120.',
      seed: {}, fresh: true, select: 'G2', cells: { G2: 120 }, uses: ['REDUCE'], sol: { G2: '=REDUCE(1,SEQUENCE(5),LAMBDA(acc,v,acc*v))' },
    }),
    task({
      id: 'text', title: 'REDUCE with text',
      body: (
        <>
          <p>
            Join the unique regions into one line, separated by spaces:
          </p>
          <p>
            <F>{'=REDUCE("",UNIQUE(A2:A21),LAMBDA(a,v,a&v&" "))'}</F>
          </p>
        </>
      ),
      hint: 'Start with empty text and add each region plus a space.',
      success: 'North South East West.',
      seed: SALES, fresh: true, select: 'G2',
      cells: { G2: (v) => typeof v === 'string' && v.trim() === 'North South East West' }, uses: ['REDUCE'], sol: { G2: '=REDUCE("",UNIQUE(A2:A21),LAMBDA(a,v,a&v&" "))' },
    }),
  ],
};

const MATRIX = grid([
  ['Rep', 'Jan', 'Feb', 'Mar', 'Apr'],
  ['Ana', 120, 150, 90, 200],
  ['Ben', 80, 95, 110, 60],
  ['Cleo', 150, 130, 170, 160],
  ['Dev', 70, 85, 90, 120],
]);
const M = [
  [120, 150, 90, 200],
  [80, 95, 110, 60],
  [150, 130, 170, 160],
  [70, 85, 90, 120],
];

export const byRowByCol: LessonContent = {
  key: 'adv-byrow',
  title: 'BYROW, BYCOL & MAKEARRAY',
  sheet: SHEET,
  steps: [
    info('intro', 'Work row by row or column by column', (
      <>
        <p>
          <strong>BYROW</strong> runs a LAMBDA on every <em>row</em> of a block and returns one answer per row. <strong>BYCOL</strong> does the same per column.{' '}
          <strong>MAKEARRAY</strong> builds a grid by calling a LAMBDA with each (row, column) position.
        </p>
        <p>
          Four reps' monthly sales are in <Cell>B2:E5</Cell>.
        </p>
      </>
    )),
    spill({
      id: 'byrow', title: 'BYROW',
      body: (
        <>
          <p>
            Total each rep (each row). You can pass a function name straight in:
          </p>
          <p>
            <F>{'=BYROW(B2:E5,SUM)'}</F> in <Cell>G2</Cell>.
          </p>
        </>
      ),
      hint: 'Four rows in, four totals out.',
      success: 'Ana 560, Ben 345, Cleo 610, Dev 365.',
      seed: MATRIX, fresh: true, at: 'G2', expect: M.map((r) => [r.reduce((a, b) => a + b, 0)]), exact: true, uses: ['BYROW'], sol: { G2: '=BYROW(B2:E5,SUM)' },
    }),
    spill({
      id: 'bycol', title: 'BYCOL',
      body: (
        <>
          <p>
            The best figure in each month (each column), in <Cell>B7</Cell>:
          </p>
          <p>
            <F>{'=BYCOL(B2:E5,LAMBDA(c,MAX(c)))'}</F>
          </p>
        </>
      ),
      hint: 'c is one whole column at a time.',
      success: 'Jan 150, Feb 150, Mar 170, Apr 200, across a row.',
      seed: MATRIX, fresh: true, at: 'B7', expect: [[150, 150, 170, 200]], exact: true, uses: ['BYCOL'], sol: { B7: '=BYCOL(B2:E5,LAMBDA(c,MAX(c)))' },
    }),
    spill({
      id: 'logic', title: 'A rule for every row',
      body: (
        <>
          <p>
            Label each rep <strong>Star</strong> if the year-to-date total is 500 or more, otherwise <strong>Ok</strong>:
          </p>
          <p>
            <F>{'=BYROW(B2:E5,LAMBDA(r,IF(SUM(r)>=500,"Star","Ok")))'}</F>
          </p>
        </>
      ),
      hint: 'r is the whole row, so SUM(r) adds that row.',
      success: 'Ana and Cleo are Stars.',
      seed: MATRIX, fresh: true, at: 'G2', expect: M.map((r) => [r.reduce((a, b) => a + b, 0) >= 500 ? 'Star' : 'Ok']), exact: true, uses: ['BYROW'],
      sol: { G2: '=BYROW(B2:E5,LAMBDA(r,IF(SUM(r)>=500,"Star","Ok")))' },
    }),
    spill({
      id: 'spread', title: 'Spread of each row',
      body: (
        <p>
          How far apart are each rep's best and worst month? <F>{'=BYROW(B2:E5,LAMBDA(r,MAX(r)-MIN(r)))'}</F> in <Cell>G2</Cell>.
        </p>
      ),
      hint: 'Highest minus lowest, per row.',
      success: '110, 50, 40, 50.',
      seed: MATRIX, fresh: true, at: 'G2', expect: M.map((r) => [Math.max(...r) - Math.min(...r)]), exact: true, uses: ['BYROW'], sol: { G2: '=BYROW(B2:E5,LAMBDA(r,MAX(r)-MIN(r)))' },
    }),
    spill({
      id: 'make', title: 'MAKEARRAY: build a grid',
      body: (
        <>
          <p>
            Build a 4 × 4 <strong>identity matrix</strong> (1 on the diagonal, 0 elsewhere) in <Cell>G2</Cell>:
          </p>
          <p>
            <F>{'=MAKEARRAY(4,4,LAMBDA(r,c,IF(r=c,1,0)))'}</F>
          </p>
        </>
      ),
      hint: 'The LAMBDA receives the row and column number of each cell.',
      success: 'A diagonal of ones. MAKEARRAY can generate any pattern you can write as a rule.',
      seed: {}, fresh: true, at: 'G2', expect: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], exact: true, uses: ['MAKEARRAY'],
      sol: { G2: '=MAKEARRAY(4,4,LAMBDA(r,c,IF(r=c,1,0)))' },
    }),
  ],
};

const PRICES = grid([['Price'], [10], [20], [50], [80], [100]]);
const hasNames = (c: { data: E.SheetData }, ...n: string[]) => n.every((x) => isLambdaName(c, x));

export const lambdaLibrary: LessonContent = {
  key: 'adv-lambda-library',
  title: 'Reusable function libraries',
  sheet: SHEET,
  tools: ['names'],
  steps: [
    info('intro', 'Build once, use everywhere', (
      <>
        <p>
          Named LAMBDAs can <strong>call each other</strong>, so you can build small trusted pieces and combine them: a <strong>TAX</strong> function, then a{' '}
          <strong>GROSS</strong> price function that uses TAX. Fix the tax rule in one place and every workbook formula changes.
        </p>
        <p>
          Good habits: short clear names, one job per function, and a note somewhere saying what each does.
        </p>
      </>
    )),
    custom({
      id: 'define', title: 'Define two linked functions',
      body: (
        <>
          <p>
            In the Name Manager add <F>{'TAX'}</F> = <F>{'=LAMBDA(p,p*0.2)'}</F>, then <F>{'GROSS'}</F> = <F>{'=LAMBDA(p,p+TAX(p))'}</F>.
          </p>
        </>
      ),
      hint: 'Add TAX first, then GROSS, which calls TAX.',
      success: 'GROSS uses TAX, so changing the rate in one place updates both.',
      seed: PRICES, fresh: true, select: 'G2',
      check: (c) => hasNames(c, 'TAX', 'GROSS') && /TAX\(/i.test(c.data.names?.GROSS ?? ''),
      sol: { names: { TAX: '=LAMBDA(p,p*0.2)', GROSS: '=LAMBDA(p,p+TAX(p))' }, events: ['define-name'] },
    }),
    task({
      id: 'use', title: 'Call the library',
      body: <p>In <Cell>G2</Cell> type <F>{'=GROSS(50)'}</F>.</p>,
      hint: 'GROSS calls TAX behind the scenes.',
      success: '60 (50 plus 10 tax).',
      seed: PRICES, fresh: true, select: 'G2', meta: { names: { TAX: '=LAMBDA(p,p*0.2)', GROSS: '=LAMBDA(p,p+TAX(p))' } },
      cells: { G2: 60 }, also: (c) => /GROSS\(/i.test(c.raw('G2')), sol: { G2: '=GROSS(50)' },
    }),
    spill({
      id: 'map', title: 'Pass your function to MAP',
      body: (
        <>
          <p>
            A named LAMBDA can be handed to MAP by name. Gross-up the whole price list <Cell>A2:A6</Cell>:
          </p>
          <p>
            <F>{'=MAP(A2:A6,GROSS)'}</F>
          </p>
        </>
      ),
      hint: 'No brackets after GROSS: you are passing the function itself.',
      success: '12, 24, 60, 96, 120. Your own function applied to a whole column.',
      seed: PRICES, fresh: true, at: 'G2', meta: { names: { TAX: '=LAMBDA(p,p*0.2)', GROSS: '=LAMBDA(p,p+TAX(p))' } },
      expect: [[12], [24], [60], [96], [120]], exact: true, uses: ['MAP'], sol: { G2: '=MAP(A2:A6,GROSS)' },
    }),
    custom({
      id: 'change', title: 'Change the rule in one place',
      body: (
        <>
          <p>
            The tax rate went up to 25%. Edit just the <strong>TAX</strong> definition in the Name Manager to <F>{'=LAMBDA(p,p*0.25)'}</F> (adding the name again replaces it).
            Watch the MAP result update.
          </p>
        </>
      ),
      hint: 'Open the Name Manager, name TAX, new formula, Add name.',
      success: '12.5, 25, 62.5... every result moved. This is why libraries beat copied formulas.',
      seed: { ...PRICES, G2: '=MAP(A2:A6,GROSS)' }, fresh: true, select: 'G2', meta: { names: { TAX: '=LAMBDA(p,p*0.2)', GROSS: '=LAMBDA(p,p+TAX(p))' } },
      check: (c) => /0\.25/.test(c.data.names?.TAX ?? '') && c.value('G2') === 12.5 && c.value('G6') === 125,
      sol: { names: { TAX: '=LAMBDA(p,p*0.25)' }, events: ['define-name'] },
    }),
  ],
};

export const unit2Test: LessonContent = {
  key: 'adv-unit2-test',
  title: 'Unit 2 test',
  sheet: SHEET,
  tools: ['names'],
  steps: [
    info('intro', 'LET & LAMBDA test', <p>Five tasks. The orders are in A1:E21 and the rep matrix is used for BYROW.</p>),
    task({
      id: 'let', title: '1. LET',
      body: <p>In <Cell>G2</Cell> use LET to name the first order's revenue and return it with 10% added.</p>,
      hint: '=LET(r,D2*E2,r*1.1)',
      success: 'Correct: 22.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: 22 }, uses: ['LET'], sol: { G2: '=LET(r,D2*E2,r*1.1)' },
    }),
    custom({
      id: 'lambda', title: '2. Your own function',
      body: (
        <p>
          In the Name Manager define <F>{'DOUBLE'}</F> as a LAMBDA that doubles its input. Then in <Cell>G2</Cell> use it to double 21.
        </p>
      ),
      hint: '=LAMBDA(x,x*2), then =DOUBLE(21)',
      success: 'Correct: 42.',
      seed: {}, fresh: true, select: 'G2',
      check: (c) => isLambdaName(c, 'DOUBLE') && c.value('G2') === 42 && /DOUBLE\(/i.test(c.raw('G2')) && !c.editing,
      sol: { names: { DOUBLE: '=LAMBDA(x,x*2)' }, cells: { G2: '=DOUBLE(21)' }, events: ['define-name'] },
    }),
    spill({
      id: 'map', title: '3. MAP',
      body: <p>In <Cell>G2</Cell> use MAP to show each order's Units doubled.</p>,
      hint: '=MAP(D2:D21,LAMBDA(u,u*2))',
      success: 'Correct.',
      seed: SALES, fresh: true, at: 'G2', expect: ROWS.map((r) => [r[3] * 2]), exact: true, uses: ['MAP'], sol: { G2: '=MAP(D2:D21,LAMBDA(u,u*2))' },
    }),
    spill({
      id: 'byrow', title: '4. BYROW',
      body: <p>In <Cell>G2</Cell> find each rep's best month with BYROW on <Cell>B2:E5</Cell>.</p>,
      hint: '=BYROW(B2:E5,MAX)',
      success: 'Correct.',
      seed: MATRIX, fresh: true, at: 'G2', expect: M.map((r) => [Math.max(...r)]), exact: true, uses: ['BYROW'], sol: { G2: '=BYROW(B2:E5,MAX)' },
    }),
    spill({
      id: 'scan', title: '5. SCAN',
      body: <p>In <Cell>G2</Cell> keep a running total of the Units column with SCAN.</p>,
      hint: '=SCAN(0,D2:D21,LAMBDA(a,v,a+v))',
      success: 'Unit 2 complete.',
      seed: SALES, fresh: true, at: 'G2', expect: ROWS.map((_, i) => [ROWS.slice(0, i + 1).reduce((s, r) => s + r[3], 0)]), exact: true, uses: ['SCAN'],
      sol: { G2: '=SCAN(0,D2:D21,LAMBDA(a,v,a+v))' },
    }),
  ],
};

void HEADER;
