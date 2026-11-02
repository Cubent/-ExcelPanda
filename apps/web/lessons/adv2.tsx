// Advanced Formulas, units 3 and 4: array thinking, and advanced lookups.
import type { ReactNode } from 'react';
import * as E from '@/components/sheet/engine';
import { custom, grid, info, task } from './dsl';
import { Cell, F } from './kbd';
import { ROWS, SALES, SHEET, revenue, sortRows, spill, uniq } from './adv-util';
import type { LessonContent } from './types';

const A5 = (rows: typeof ROWS) => rows.map((r) => [...r]);
const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
const northUnits = sum(ROWS.filter((r) => r[0] === 'North').map((r) => r[3]));
const southPenUnits = sum(ROWS.filter((r) => r[0] === 'South' && r[2] === 'Pen').map((r) => r[3]));
const northWestUnits = sum(ROWS.filter((r) => r[0] === 'North' || r[0] === 'West').map((r) => r[3]));

// ---------------------------------------------------------------------------
// Unit 3 · Array thinking
// ---------------------------------------------------------------------------
export const booleanArrays: LessonContent = {
  key: 'adv-boolean-arrays',
  title: 'Boolean arithmetic',
  sheet: SHEET,
  steps: [
    info('intro', 'TRUE and FALSE are numbers in disguise', (
      <>
        <p>
          A test over a column, such as <F>{'A2:A21="North"'}</F>, gives a column of TRUE and FALSE. Multiply it by 1 and TRUE becomes 1, FALSE becomes 0. That turns
          conditions into <strong>arithmetic</strong>, and arithmetic can add, count and combine anything.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>AND</strong> = multiply tests: <F>{'(test1)*(test2)'}</F>
          </li>
          <li>
            <strong>OR</strong> = add tests (then &gt; 0): <F>{'(test1)+(test2)'}</F>
          </li>
          <li>
            <F>{'--'}</F> (a double minus) is a quick way to turn TRUE/FALSE into 1/0
          </li>
        </ul>
      </>
    )),
    task({
      id: 'count', title: 'Count with a test',
      body: <p>Count the North orders without COUNTIF: <F>{'=SUM((A2:A21="North")*1)'}</F> in <Cell>G2</Cell>.</p>,
      hint: 'Five TRUEs become five 1s.',
      success: '5.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: 5 }, uses: ['SUM'], sol: { G2: '=SUM((A2:A21="North")*1)' },
    }),
    task({
      id: 'sum', title: 'Sum with a test',
      body: <p>Total North units: multiply the test by the units column, <F>{'=SUM((A2:A21="North")*D2:D21)'}</F>.</p>,
      hint: 'Only the North rows keep their units; the rest become 0.',
      success: `${northUnits}. A SUMIF built from arithmetic.`,
      seed: SALES, fresh: true, select: 'G2', cells: { G2: northUnits }, uses: ['SUM'], sol: { G2: '=SUM((A2:A21="North")*D2:D21)' },
    }),
    task({
      id: 'and', title: 'AND with two tests',
      body: <p>Units of <strong>South Pens</strong>: <F>{'=SUM((A2:A21="South")*(C2:C21="Pen")*D2:D21)'}</F>.</p>,
      hint: 'Three things multiplied: test, test, numbers.',
      success: `${southPenUnits} (8 + 11).`,
      seed: SALES, fresh: true, select: 'G2', cells: { G2: southPenUnits }, uses: ['SUM'], sol: { G2: '=SUM((A2:A21="South")*(C2:C21="Pen")*D2:D21)' },
    }),
    task({
      id: 'or', title: 'OR with two tests',
      body: (
        <>
          <p>
            Units from <strong>North or West</strong>. Add the tests, check the result is above zero, then multiply:
          </p>
          <p>
            <F>{'=SUM(((A2:A21="North")+(A2:A21="West")>0)*D2:D21)'}</F>
          </p>
        </>
      ),
      hint: 'A row is in if either test is true.',
      success: `${northWestUnits} units.`,
      seed: SALES, fresh: true, select: 'G2', cells: { G2: northWestUnits }, uses: ['SUM'], sol: { G2: '=SUM(((A2:A21="North")+(A2:A21="West")>0)*D2:D21)' },
    }),
    task({
      id: 'dbl', title: 'The double minus',
      body: <p>Count orders of more than 8 units: <F>{'=SUM(--(D2:D21>8))'}</F>. The <F>{'--'}</F> turns TRUE/FALSE into 1/0.</p>,
      hint: 'Two minus signs in a row.',
      success: '5 big orders.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: ROWS.filter((r) => r[3] > 8).length }, uses: ['SUM'], sol: { G2: '=SUM(--(D2:D21>8))' },
    }),
  ],
};

const SCORES = grid([['Task', 'Score', 'Weight'], ['Essay', 80, 0.2], ['Project', 90, 0.3], ['Exam', 70, 0.5]]);

export const sumproductLesson: LessonContent = {
  key: 'adv-sumproduct',
  title: 'SUMPRODUCT',
  sheet: SHEET,
  steps: [
    info('intro', 'The Swiss-army formula', (
      <>
        <p>
          <strong>SUMPRODUCT</strong> multiplies arrays item by item and adds the results. It also accepts conditions, so it handles totals, weighted averages and
          multi-condition sums. It has worked in every Excel version for decades.
        </p>
      </>
    )),
    task({
      id: 'rev', title: 'Total revenue in one step',
      body: <p>Units times price, added up: <F>{'=SUMPRODUCT(D2:D21,E2:E21)'}</F> in <Cell>G2</Cell>.</p>,
      hint: 'No helper column for revenue needed.',
      success: 'Total revenue.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: sum(ROWS.map(revenue)) }, uses: ['SUMPRODUCT'], sol: { G2: '=SUMPRODUCT(D2:D21,E2:E21)' },
    }),
    task({
      id: 'cond', title: 'Add a condition',
      body: <p>Revenue from <strong>North</strong> only: <F>{'=SUMPRODUCT((A2:A21="North")*D2:D21*E2:E21)'}</F>.</p>,
      hint: 'The test multiplies in like before.',
      success: 'North revenue.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: sum(ROWS.filter((r) => r[0] === 'North').map(revenue)) }, uses: ['SUMPRODUCT'],
      sol: { G2: '=SUMPRODUCT((A2:A21="North")*D2:D21*E2:E21)' },
    }),
    task({
      id: 'weighted', title: 'A weighted average',
      body: (
        <>
          <p>
            Scores count with different weights. The weighted average is the sum of score × weight divided by the sum of the weights:
          </p>
          <p>
            <F>{'=SUMPRODUCT(B2:B4,C2:C4)/SUM(C2:C4)'}</F>
          </p>
        </>
      ),
      hint: '80×0.2 + 90×0.3 + 70×0.5.',
      success: '78. A plain AVERAGE would say 80, which ignores the weights.',
      seed: SCORES, fresh: true, select: 'E2', cells: { E2: 78 }, uses: ['SUMPRODUCT'], sol: { E2: '=SUMPRODUCT(B2:B4,C2:C4)/SUM(C2:C4)' },
    }),
    task({
      id: 'two', title: 'Two conditions and a calculation',
      body: <p>Revenue of <strong>West Pens</strong>: <F>{'=SUMPRODUCT((A2:A21="West")*(C2:C21="Pen")*D2:D21*E2:E21)'}</F>.</p>,
      hint: 'Two tests, then units × price.',
      success: 'West pens revenue.',
      seed: SALES, fresh: true, select: 'G2',
      cells: { G2: sum(ROWS.filter((r) => r[0] === 'West' && r[2] === 'Pen').map(revenue)) }, uses: ['SUMPRODUCT'],
      sol: { G2: '=SUMPRODUCT((A2:A21="West")*(C2:C21="Pen")*D2:D21*E2:E21)' },
    }),
  ],
};

export const arrayConstants: LessonContent = {
  key: 'adv-array-constants',
  title: 'Array constants',
  sheet: SHEET,
  steps: [
    info('intro', 'Lists typed straight into a formula', (
      <>
        <p>
          Curly brackets make an <strong>array constant</strong>: <F>{'{1,2,3}'}</F> is a row of three numbers, <F>{'{1;2;3}'}</F> is a column. A comma starts a new column, a semicolon
          starts a new row. They let a formula carry its own small list with no helper cells.
        </p>
      </>
    )),
    task({
      id: 'sum', title: 'A grid of numbers',
      body: <p>Add a 2 × 3 grid typed inline: <F>{'=SUM({1,2,3;4,5,6})'}</F> in <Cell>G2</Cell>.</p>,
      hint: 'Rows are separated by semicolons.',
      success: '21.',
      seed: {}, fresh: true, select: 'G2', cells: { G2: 21 }, uses: ['SUM'], sol: { G2: '=SUM({1,2,3;4,5,6})' },
    }),
    task({
      id: 'countif', title: 'COUNTIF with a list of criteria',
      body: (
        <>
          <p>
            Count North <em>and</em> South orders. COUNTIF given two criteria returns two counts, and SUM adds them:
          </p>
          <p>
            <F>{'=SUM(COUNTIF(A2:A21,{"North","South"}))'}</F>
          </p>
        </>
      ),
      hint: 'One COUNTIF for each item in the curly brackets.',
      success: '10 orders.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: ROWS.filter((r) => r[0] === 'North' || r[0] === 'South').length }, uses: ['SUM', 'COUNTIF'],
      sol: { G2: '=SUM(COUNTIF(A2:A21,{"North","South"}))' },
    }),
    task({
      id: 'compare', title: 'Compare against a list',
      body: (
        <>
          <p>
            A column compared with a row gives a grid. Count orders from <strong>North or East</strong>:
          </p>
          <p>
            <F>{'=SUMPRODUCT(--(A2:A21={"North","East"}))'}</F>
          </p>
        </>
      ),
      hint: '20 rows × 2 items = 40 comparisons.',
      success: '10 orders.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: ROWS.filter((r) => r[0] === 'North' || r[0] === 'East').length }, uses: ['SUMPRODUCT'],
      sol: { G2: '=SUMPRODUCT(--(A2:A21={"North","East"}))' },
    }),
    task({
      id: 'join', title: 'Join a typed list',
      body: <p>Build a text line from three typed words: <F>{'=TEXTJOIN(", ",TRUE,{"Mon","Tue","Wed"})'}</F>.</p>,
      hint: 'TEXTJOIN accepts arrays.',
      success: 'Mon, Tue, Wed.',
      seed: {}, fresh: true, select: 'G2', cells: { G2: 'Mon, Tue, Wed' }, uses: ['TEXTJOIN'], sol: { G2: '=TEXTJOIN(", ",TRUE,{"Mon","Tue","Wed"})' },
    }),
    custom({
      id: 'index', title: 'Pick from an inline list',
      body: (
        <p>
          In <Cell>G2</Cell> use <F>{'=INDEX({10,20,30,40},3)'}</F> and in <Cell>G3</Cell> use <F>{'=MATCH(30,{10,20,30,40},0)'}</F>.
        </p>
      ),
      hint: 'INDEX picks by position, MATCH finds a position.',
      success: '30 and 3.',
      seed: {}, fresh: true, select: 'G2',
      check: (c) => c.value('G2') === 30 && c.value('G3') === 3 && /INDEX/i.test(c.raw('G2')) && /MATCH/i.test(c.raw('G3')) && !c.editing,
      sol: { cells: { G2: '=INDEX({10,20,30,40},3)', G3: '=MATCH(30,{10,20,30,40},0)' } },
    }),
  ],
};

export const reshapeFunctions: LessonContent = {
  key: 'adv-reshape',
  title: 'TAKE, DROP, CHOOSECOLS & stacking',
  sheet: SHEET,
  steps: [
    info('intro', 'Cut, reorder and combine blocks', (
      <>
        <p>
          A family of newer functions reshapes blocks of data: <strong>TAKE</strong> and <strong>DROP</strong> keep or remove rows and columns,{' '}
          <strong>CHOOSECOLS</strong> reorders columns, and <strong>HSTACK</strong> / <strong>VSTACK</strong> glue blocks side by side or one above the other.
        </p>
      </>
    )),
    spill({
      id: 'take', title: 'TAKE the first rows',
      body: <p>The first 3 orders: <F>{'=TAKE(A2:E21,3)'}</F> in <Cell>G2</Cell>. A negative number would take from the end.</p>,
      hint: 'TAKE(array, rows, [columns]).',
      success: 'Three rows, five columns.',
      seed: SALES, fresh: true, at: 'G2', expect: A5(ROWS.slice(0, 3)), exact: true, uses: ['TAKE'], sol: { G2: '=TAKE(A2:E21,3)' },
    }),
    spill({
      id: 'drop', title: 'DROP what you do not need',
      body: <p>Take the first 6 orders, then drop the first 3 of those: <F>{'=DROP(TAKE(A2:E21,6),3)'}</F>.</p>,
      hint: 'TAKE runs first, DROP trims its result.',
      success: 'Orders 4 to 6.',
      seed: SALES, fresh: true, at: 'G2', expect: A5(ROWS.slice(3, 6)), exact: true, uses: ['DROP', 'TAKE'], sol: { G2: '=DROP(TAKE(A2:E21,6),3)' },
    }),
    spill({
      id: 'cols', title: 'Reorder columns',
      body: <p>Show Product, then Region, then Units: <F>{'=CHOOSECOLS(A2:E21,3,1,4)'}</F>.</p>,
      hint: 'The numbers are column positions inside the block.',
      success: 'Three columns in your order.',
      seed: SALES, fresh: true, at: 'G2', expect: ROWS.map((r) => [r[2], r[0], r[3]]), exact: true, uses: ['CHOOSECOLS'], sol: { G2: '=CHOOSECOLS(A2:E21,3,1,4)' },
    }),
    spill({
      id: 'hstack', title: 'HSTACK adds a computed column',
      body: (
        <>
          <p>
            Put the Region next to a revenue column that does not exist on the sheet:
          </p>
          <p>
            <F>{'=HSTACK(A2:A21,D2:D21*E2:E21)'}</F>
          </p>
        </>
      ),
      hint: 'HSTACK glues blocks left to right.',
      success: 'Two columns: region and revenue.',
      seed: SALES, fresh: true, at: 'G2', expect: ROWS.map((r) => [r[0], revenue(r)]), exact: true, uses: ['HSTACK'], sol: { G2: '=HSTACK(A2:A21,D2:D21*E2:E21)' },
    }),
    spill({
      id: 'vstack', title: 'VSTACK joins blocks vertically',
      body: (
        <>
          <p>
            Two small lists sit in <Cell>A1:B3</Cell> and <Cell>A5:B7</Cell>. Combine them into one with <F>{'=VSTACK(A1:B3,A5:B7)'}</F> in <Cell>G2</Cell>.
          </p>
        </>
      ),
      hint: 'VSTACK puts one block under the other.',
      success: 'Six rows from two lists.',
      seed: { ...grid([['North', 10], ['South', 20], ['East', 30]]), ...grid([['West', 40], ['Mid', 50], ['Far', 60]], 0, 4) }, fresh: true, at: 'G2',
      expect: [['North', 10], ['South', 20], ['East', 30], ['West', 40], ['Mid', 50], ['Far', 60]], exact: true, uses: ['VSTACK'], sol: { G2: '=VSTACK(A1:B3,A5:B7)' },
    }),
  ],
};

const GRID3 = { ...grid([[1, 2, 3, 4], [5, '', 7, 8], [9, 10, 11, '']]) };
for (const k of Object.keys(GRID3)) if (GRID3[k] === '') delete GRID3[k];

export const tocolWrap: LessonContent = {
  key: 'adv-tocol',
  title: 'TOCOL, TOROW & WRAPROWS',
  sheet: SHEET,
  steps: [
    info('intro', 'Flatten and re-shape', (
      <>
        <p>
          <strong>TOCOL</strong> and <strong>TOROW</strong> flatten any block into one column or one row. <strong>WRAPROWS</strong> / <strong>WRAPCOLS</strong> go the other way,
          cutting a list into rows of a size you choose. Together they re-shape awkward data.
        </p>
        <p>
          A 3 × 4 block with two gaps sits in <Cell>A1:D3</Cell>.
        </p>
      </>
    )),
    spill({
      id: 'tocol', title: 'Flatten to a column',
      body: <p>Make one column of every value, skipping blanks: <F>{'=TOCOL(A1:D3,1)'}</F> in <Cell>G2</Cell>. The 1 means "ignore blanks".</p>,
      hint: 'Without the 1, blank cells would come through as 0.',
      success: 'Ten numbers in a column.',
      seed: GRID3, fresh: true, at: 'G2', expect: [[1], [2], [3], [4], [5], [7], [8], [9], [10], [11]], exact: true, uses: ['TOCOL'], sol: { G2: '=TOCOL(A1:D3,1)' },
    }),
    spill({
      id: 'torow', title: 'Flatten to a row',
      body: <p>TOROW does the same into a single row. Flatten just <Cell>A1:B3</Cell>: <F>{'=TOROW(A1:B3,1)'}</F>.</p>,
      hint: 'It reads row by row.',
      success: '1, 2, 5, 9, 10 across.',
      seed: GRID3, fresh: true, at: 'G2', expect: [[1, 2, 5, 9, 10]], exact: true, uses: ['TOROW'], sol: { G2: '=TOROW(A1:B3,1)' },
    }),
    spill({
      id: 'wrap', title: 'Wrap into rows of 5',
      body: (
        <>
          <p>
            Flatten, then re-shape into rows of five:
          </p>
          <p>
            <F>{'=WRAPROWS(TOCOL(A1:D3,1),5)'}</F>
          </p>
        </>
      ),
      hint: 'TOCOL gives 10 values, WRAPROWS cuts them into 2 rows of 5.',
      success: 'A clean 2 × 5 block.',
      seed: GRID3, fresh: true, at: 'G2', expect: [[1, 2, 3, 4, 5], [7, 8, 9, 10, 11]], exact: true, uses: ['WRAPROWS', 'TOCOL'], sol: { G2: '=WRAPROWS(TOCOL(A1:D3,1),5)' },
    }),
    task({
      id: 'count', title: 'Count values in a messy block',
      body: <p>How many numbers are in the block? <F>{'=COUNT(TOCOL(A1:D3,1))'}</F> in <Cell>G2</Cell>.</p>,
      hint: 'Flatten first, then count.',
      success: '10.',
      seed: GRID3, fresh: true, select: 'G2', cells: { G2: 10 }, uses: ['COUNT', 'TOCOL'], sol: { G2: '=COUNT(TOCOL(A1:D3,1))' },
    }),
  ],
};

export const unit3Test: LessonContent = {
  key: 'adv-unit3-test',
  title: 'Unit 3 test',
  sheet: SHEET,
  steps: [
    info('intro', 'Array thinking test', <p>Five tasks combining array arithmetic and reshaping.</p>),
    task({
      id: 'bool', title: '1. Boolean arithmetic',
      body: <p>In <Cell>G2</Cell> total the units for <strong>East</strong> using a test multiplied by the Units column (no SUMIF).</p>,
      hint: '=SUM((A2:A21="East")*D2:D21)',
      success: 'Correct.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: sum(ROWS.filter((r) => r[0] === 'East').map((r) => r[3])) }, uses: ['SUM'], also: (c) => !/SUMIF/i.test(c.raw('G2')),
      sol: { G2: '=SUM((A2:A21="East")*D2:D21)' },
    }),
    task({
      id: 'sp', title: '2. SUMPRODUCT',
      body: <p>In <Cell>G2</Cell> find the revenue of <strong>Lamp</strong> orders using SUMPRODUCT.</p>,
      hint: '=SUMPRODUCT((C2:C21="Lamp")*D2:D21*E2:E21)',
      success: 'Correct.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: sum(ROWS.filter((r) => r[2] === 'Lamp').map(revenue)) }, uses: ['SUMPRODUCT'],
      sol: { G2: '=SUMPRODUCT((C2:C21="Lamp")*D2:D21*E2:E21)' },
    }),
    task({
      id: 'const', title: '3. Array constant',
      body: <p>In <Cell>G2</Cell> count orders for <strong>Bag or Lamp</strong> with an inline list of criteria.</p>,
      hint: '=SUM(COUNTIF(C2:C21,{"Bag","Lamp"}))',
      success: 'Correct.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: ROWS.filter((r) => r[2] === 'Bag' || r[2] === 'Lamp').length }, uses: ['COUNTIF'],
      sol: { G2: '=SUM(COUNTIF(C2:C21,{"Bag","Lamp"}))' },
    }),
    spill({
      id: 'cols', title: '4. CHOOSECOLS',
      body: <p>In <Cell>G2</Cell> show just <strong>Rep</strong> and <strong>Units</strong> for the first 4 orders.</p>,
      hint: '=CHOOSECOLS(TAKE(A2:E21,4),2,4)',
      success: 'Correct.',
      seed: SALES, fresh: true, at: 'G2', expect: ROWS.slice(0, 4).map((r) => [r[1], r[3]]), exact: true, uses: ['CHOOSECOLS'], sol: { G2: '=CHOOSECOLS(TAKE(A2:E21,4),2,4)' },
    }),
    spill({
      id: 'wrap', title: '5. Re-shape',
      body: <p>In <Cell>G2</Cell> turn the numbers 1 to 12 into a 3-row, 4-column block (rows of 4).</p>,
      hint: '=WRAPROWS(SEQUENCE(12),4)',
      success: 'Unit 3 complete.',
      seed: {}, fresh: true, at: 'G2', expect: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]], exact: true, uses: ['WRAPROWS'], sol: { G2: '=WRAPROWS(SEQUENCE(12),4)' },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 4 · Advanced lookups
// ---------------------------------------------------------------------------
export const xlookupArrays: LessonContent = {
  key: 'adv-xlookup-arrays',
  title: 'XLOOKUP: rows, lists and wildcards',
  sheet: SHEET,
  steps: [
    info('intro', 'More than one cell at a time', (
      <>
        <p>
          XLOOKUP is far more than a price finder. It can return a <strong>whole row</strong> at once, answer <strong>many lookups with one formula</strong>, match
          with <strong>wildcards</strong>, and search from the <strong>bottom up</strong>.
        </p>
      </>
    )),
    spill({
      id: 'row', title: 'Return a whole row',
      body: (
        <>
          <p>
            Find the first order handled by <strong>Dev</strong> and return all five columns: look in the Rep column, return the whole block.
          </p>
          <p>
            <F>{'=XLOOKUP("Dev",B2:B21,A2:E21)'}</F>
          </p>
        </>
      ),
      hint: 'The return range is the full table. The result spills across.',
      success: 'North, Dev, Bag, 3, 25: the first Dev row.',
      seed: SALES, fresh: true, at: 'G2', expect: [[...ROWS.find((r) => r[1] === 'Dev')!]], exact: true, uses: ['XLOOKUP'], sol: { G2: '=XLOOKUP("Dev",B2:B21,A2:E21)' },
    }),
    spill({
      id: 'many', title: 'Many lookups at once',
      body: (
        <>
          <p>
            Give XLOOKUP a list of things to find. Units of the first order for <strong>Ana</strong> and for <strong>Cleo</strong>:
          </p>
          <p>
            <F>{'=XLOOKUP({"Ana";"Cleo"},B2:B21,D2:D21)'}</F>
          </p>
        </>
      ),
      hint: 'The semicolon makes a vertical list.',
      success: '10 and 12: one answer per name.',
      seed: SALES, fresh: true, at: 'G2', expect: [[ROWS.find((r) => r[1] === 'Ana')![3]], [ROWS.find((r) => r[1] === 'Cleo')![3]]], exact: true, uses: ['XLOOKUP'],
      sol: { G2: '=XLOOKUP({"Ana";"Cleo"},B2:B21,D2:D21)' },
    }),
    task({
      id: 'wild', title: 'Wildcards: match mode 2',
      body: (
        <>
          <p>
            The price list holds longer names. Find the price of anything containing "cable". Match mode <F>{'2'}</F> turns on wildcards (<F>{'*'}</F> and <F>{'?'}</F>):
          </p>
          <p>
            <F>{'=XLOOKUP("*cable*",A2:A4,B2:B4,"none",2)'}</F>
          </p>
        </>
      ),
      hint: 'Arguments: find, look in, return, if not found, match mode.',
      success: '7.5, the USB cable.',
      seed: grid([['Item', 'Price'], ['Wireless mouse', 15], ['USB cable', 7.5], ['Laptop stand', 32]]), fresh: true, select: 'G2',
      cells: { G2: 7.5 }, uses: ['XLOOKUP'], sol: { G2: '=XLOOKUP("*cable*",A2:A4,B2:B4,"none",2)' },
    }),
    task({
      id: 'last', title: 'Search from the bottom',
      body: (
        <>
          <p>
            Units from <strong>Ana</strong>'s <em>most recent</em> (last) order. The sixth argument <F>{'-1'}</F> searches last to first:
          </p>
          <p>
            <F>{'=XLOOKUP("Ana",B2:B21,D2:D21,"none",0,-1)'}</F>
          </p>
        </>
      ),
      hint: 'Match mode 0 is exact, search mode -1 starts at the bottom.',
      success: '11, Ana\'s last order.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: [...ROWS].reverse().find((r) => r[1] === 'Ana')![3] }, uses: ['XLOOKUP'],
      sol: { G2: '=XLOOKUP("Ana",B2:B21,D2:D21,"none",0,-1)' },
    }),
    task({
      id: 'next', title: 'The next one up',
      body: (
        <>
          <p>
            A ladder of thresholds is in <Cell>A2:A6</Cell>. For a quantity of <strong>5</strong> you want the <em>next larger</em> threshold's label. Match mode{' '}
            <F>{'1'}</F> means "exact or next larger":
          </p>
          <p>
            <F>{'=XLOOKUP(5,A2:A6,B2:B6,"-",1)'}</F>
          </p>
        </>
      ),
      hint: 'Mode -1 would give the next smaller instead.',
      success: 'Bronze: the first threshold at or above 5 is 10.',
      seed: grid([['Up to', 'Tier'], [1, 'Tiny'], [10, 'Bronze'], [25, 'Silver'], [50, 'Gold'], [100, 'Platinum']]), fresh: true, select: 'G2',
      cells: { G2: 'Bronze' }, uses: ['XLOOKUP'], sol: { G2: '=XLOOKUP(5,A2:A6,B2:B6,"-",1)' },
    }),
  ],
};

export const xmatchLesson: LessonContent = {
  key: 'adv-xmatch',
  title: 'XMATCH',
  sheet: SHEET,
  steps: [
    info('intro', 'The modern MATCH', (
      <>
        <p>
          <F>{'XMATCH(find, array, [match_mode], [search_mode])'}</F> returns a <strong>position</strong>. Like XLOOKUP it can search from the bottom, use wildcards and look up many items at once.
          Position numbers are what INDEX needs, so XMATCH + INDEX is a flexible pair.
        </p>
      </>
    )),
    task({
      id: 'first', title: 'The first match',
      body: <p>Where does <strong>Bag</strong> first appear in the Product column? <F>{'=XMATCH("Bag",C2:C21)'}</F> in <Cell>G2</Cell>.</p>,
      hint: 'It counts positions inside C2:C21, starting at 1.',
      success: '4: the fourth order is the first Bag.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: ROWS.findIndex((r) => r[2] === 'Bag') + 1 }, uses: ['XMATCH'], sol: { G2: '=XMATCH("Bag",C2:C21)' },
    }),
    task({
      id: 'last', title: 'The last match',
      body: <p>The position of the <em>last</em> Pen order: <F>{'=XMATCH("Pen",C2:C21,0,-1)'}</F>.</p>,
      hint: 'Search mode -1 starts from the bottom.',
      success: '20.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: ROWS.map((r) => r[2]).lastIndexOf('Pen') + 1 }, uses: ['XMATCH'], sol: { G2: '=XMATCH("Pen",C2:C21,0,-1)' },
    }),
    spill({
      id: 'many', title: 'Several positions at once',
      body: <p>The first position of <strong>Lamp</strong> and of <strong>Bag</strong>: <F>{'=XMATCH({"Lamp","Bag"},C2:C21)'}</F>.</p>,
      hint: 'Commas make a row of answers.',
      success: '5 and 4.',
      seed: SALES, fresh: true, at: 'G2', expect: [[ROWS.findIndex((r) => r[2] === 'Lamp') + 1, ROWS.findIndex((r) => r[2] === 'Bag') + 1]], exact: true, uses: ['XMATCH'],
      sol: { G2: '=XMATCH({"Lamp","Bag"},C2:C21)' },
    }),
    task({
      id: 'index', title: 'XMATCH feeds INDEX',
      body: <p>Which rep sold the first Lamp? <F>{'=INDEX(B2:B21,XMATCH("Lamp",C2:C21))'}</F>.</p>,
      hint: 'XMATCH finds the position, INDEX returns the rep at that position.',
      success: 'Ana.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: ROWS.find((r) => r[2] === 'Lamp')![1] }, uses: ['INDEX', 'XMATCH'], sol: { G2: '=INDEX(B2:B21,XMATCH("Lamp",C2:C21))' },
    }),
    task({
      id: 'wild', title: 'Wildcard position',
      body: <p>Position of the first name that starts with <strong>B</strong>: <F>{'=XMATCH("B*",A2:A6,2)'}</F>.</p>,
      hint: 'Match mode 2 allows wildcards.',
      success: '3.',
      seed: grid([['Name'], ['Ana'], ['Cleo'], ['Ben'], ['Bea'], ['Dev']]), fresh: true, select: 'G2', cells: { G2: 3 }, uses: ['XMATCH'], sol: { G2: '=XMATCH("B*",A2:A6,2)' },
    }),
  ],
};

const DISC = grid([['Min qty', 'Discount'], [1, 0], [10, 0.05], [50, 0.1], [100, 0.15], [500, 0.2]]);
const MONTHLY = grid([['', 'Jan', 'Feb', 'Mar'], ['North', 100, 110, 120], ['South', 80, 90, 95], ['East', 60, 70, 85], ['West', 50, 65, 75]]);

export const nearestTwoWay: LessonContent = {
  key: 'adv-nearest',
  title: 'Nearest match & two-way lookups',
  sheet: SHEET,
  steps: [
    info('intro', 'Bands, brackets and grids', (
      <>
        <p>
          Two classic jobs: find the <strong>band</strong> a number falls into (an approximate match), and read a value from a <strong>grid</strong> by row and column name (a two-way
          lookup).
        </p>
      </>
    )),
    task({
      id: 'band', title: 'Which discount band?',
      body: (
        <>
          <p>
            Quantity discounts are in <Cell>A2:B6</Cell>. For an order of <strong>75</strong> items, find the discount of the largest threshold not above 75 (match mode{' '}
            <F>{'-1'}</F>):
          </p>
          <p>
            <F>{'=XLOOKUP(75,A2:A6,B2:B6,0,-1)'}</F>
          </p>
        </>
      ),
      hint: '75 falls between 50 and 100, so it takes the 50 band.',
      success: '0.1, a 10% discount.',
      seed: DISC, fresh: true, select: 'G2', cells: { G2: 0.1 }, uses: ['XLOOKUP'], sol: { G2: '=XLOOKUP(75,A2:A6,B2:B6,0,-1)' },
    }),
    task({
      id: 'next', title: 'Next larger',
      body: <p>For a budget of <strong>60</strong>, which threshold comes next up? <F>{'=XLOOKUP(60,A2:A6,A2:A6,0,1)'}</F>.</p>,
      hint: 'Mode 1 means exact or the next larger.',
      success: '100.',
      seed: DISC, fresh: true, select: 'G2', cells: { G2: 100 }, uses: ['XLOOKUP'], sol: { G2: '=XLOOKUP(60,A2:A6,A2:A6,0,1)' },
    }),
    task({
      id: 'two', title: 'A two-way lookup',
      body: (
        <>
          <p>
            A grid of sales by region and month is in <Cell>A1:D5</Cell>. Read <strong>South</strong> in <strong>Feb</strong> by nesting two XLOOKUPs: the inner one picks the month
            <em> column</em>, the outer one picks the region <em>row</em>:
          </p>
          <p>
            <F>{'=XLOOKUP("South",A2:A5,XLOOKUP("Feb",B1:D1,B2:D5))'}</F>
          </p>
        </>
      ),
      hint: 'The inner XLOOKUP returns a whole column of the grid.',
      success: '90.',
      seed: MONTHLY, fresh: true, select: 'G2', cells: { G2: 90 }, uses: ['XLOOKUP'], sol: { G2: '=XLOOKUP("South",A2:A5,XLOOKUP("Feb",B1:D1,B2:D5))' },
    }),
    task({
      id: 'cells', title: 'Drive it from cells',
      body: (
        <>
          <p>
            Put <strong>East</strong> in <Cell>G1</Cell> and <strong>Mar</strong> in <Cell>G2</Cell>. In <Cell>G3</Cell> write the two-way lookup using those cells:
          </p>
          <p>
            <F>{'=XLOOKUP(G1,A2:A5,XLOOKUP(G2,B1:D1,B2:D5))'}</F>
          </p>
        </>
      ),
      hint: 'The formula should not contain the words East or Mar.',
      success: '85. Change G1 or G2 and the answer follows.',
      seed: { ...MONTHLY, G1: 'East', G2: 'Mar' }, fresh: true, select: 'G3',
      cells: { G3: 85 }, uses: ['XLOOKUP'], also: (c) => /G1/i.test(c.raw('G3')) && /G2/i.test(c.raw('G3')), sol: { G3: '=XLOOKUP(G1,A2:A5,XLOOKUP(G2,B1:D1,B2:D5))' },
    }),
  ],
};

const LINES = grid([['Item', 'Value'], ['a', 10], ['b', 20], ['c', 30], ['d', 40], ['e', 50], ['f', 60], ['g', 70]]);

export const indirectOffset: LessonContent = {
  key: 'adv-indirect-offset',
  title: 'INDIRECT & OFFSET (and why to avoid them)',
  sheet: SHEET,
  steps: [
    info('intro', 'Powerful, but slow', (
      <>
        <p>
          <strong>INDIRECT</strong> turns <em>text</em> into a reference (<F>{'INDIRECT("A"&5)'}</F> means A5). <strong>OFFSET</strong> moves a reference by rows and columns. Both are{' '}
          <strong>volatile</strong>: Excel recalculates them (and everything that depends on them) after <em>every</em> change, which slows big workbooks. The other volatile functions
          are NOW, TODAY, RAND, RANDARRAY, RANDBETWEEN, and CELL or INFO in some forms.
        </p>
        <p>
          Preferred: <strong>INDEX</strong>, direct references, Tables and XLOOKUP. Use INDIRECT or OFFSET only when you genuinely need a reference built from text.
        </p>
      </>
    )),
    task({
      id: 'indirect', title: 'Build a reference from text',
      body: (
        <>
          <p>
            <Cell>G1</Cell> holds the number <strong>4</strong>. Read the matching row of the Value column by building the address:
          </p>
          <p>
            <F>{'=INDIRECT("B"&G1+1)'}</F> in <Cell>G2</Cell>.
          </p>
        </>
      ),
      hint: '"B"&5 makes the text B5, and INDIRECT reads that cell.',
      success: '40 (the value in B5).',
      seed: { ...LINES, G1: '4' }, fresh: true, select: 'G2', cells: { G2: 40 }, uses: ['INDIRECT'], sol: { G2: '=INDIRECT("B"&G1+1)' },
    }),
    task({
      id: 'offset', title: 'Move by rows and columns',
      body: <p>Add up three values starting two rows below B1: <F>{'=SUM(OFFSET(B1,2,0,3,1))'}</F> (start, rows down, columns across, height, width).</p>,
      hint: 'That covers B3:B5.',
      success: '90 (20 + 30 + 40).',
      seed: LINES, fresh: true, select: 'G2', cells: { G2: 90 }, uses: ['OFFSET', 'SUM'], sol: { G2: '=SUM(OFFSET(B1,2,0,3,1))' },
    }),
    task({
      id: 'sheet', title: 'Pick a sheet by name',
      body: (
        <>
          <p>
            INDIRECT can read a sheet chosen in a cell. <Cell>G1</Cell> says <strong>Feb</strong>. Sheets named Jan, Feb, Mar each hold a Units column in B2:B5. Add the chosen sheet:
          </p>
          <p>
            <F>{'=SUM(INDIRECT(G1&"!B2:B5"))'}</F>
          </p>
        </>
      ),
      hint: 'Change G1 to Jan and the answer changes.',
      success: '25 for February.',
      seed: { G1: 'Feb' }, fresh: true, select: 'G2',
      meta: { ext: { Jan: grid([['Product', 'Units'], ['Pen', 10], ['Book', 4], ['Bag', 3], ['Lamp', 2]]), Feb: grid([['Product', 'Units'], ['Pen', 12], ['Book', 6], ['Bag', 2], ['Lamp', 5]]), Mar: grid([['Product', 'Units'], ['Pen', 8], ['Book', 7], ['Bag', 5], ['Lamp', 3]]) } },
      cells: { G2: 25 }, uses: ['INDIRECT'], sol: { G2: '=SUM(INDIRECT(G1&"!B2:B5"))' },
    }),
    task({
      id: 'replace', title: 'Replace a volatile formula',
      body: (
        <>
          <p>
            <Cell>G2</Cell> uses <F>{'=OFFSET(B1,4,0)'}</F> to read B5. That recalculates constantly. Rewrite it with a <strong>non-volatile</strong> formula that gives the same answer, for
            example <F>{'=INDEX(B1:B8,5)'}</F> or <F>{'=B5'}</F>.
          </p>
        </>
      ),
      hint: 'No OFFSET and no INDIRECT in the result.',
      success: '40, with no volatility.',
      seed: { ...LINES, G2: '=OFFSET(B1,4,0)' }, fresh: true, select: 'G2',
      cells: { G2: 40 }, also: (c) => !/OFFSET|INDIRECT|NOW|TODAY|RAND/i.test(c.raw('G2')), sol: { G2: '=INDEX(B1:B8,5)' },
    }),
  ],
};

const JAN = grid([['Product', 'Units'], ['Pen', 10], ['Book', 4], ['Bag', 3], ['Lamp', 2]]);
const FEB = grid([['Product', 'Units'], ['Pen', 12], ['Book', 6], ['Bag', 2], ['Lamp', 5]]);
const MAR = grid([['Product', 'Units'], ['Pen', 8], ['Book', 7], ['Bag', 5], ['Lamp', 3]]);
const MONTH_ROWS = [
  ['Pen', 10], ['Book', 4], ['Bag', 3], ['Lamp', 2],
  ['Pen', 12], ['Book', 6], ['Bag', 2], ['Lamp', 5],
  ['Pen', 8], ['Book', 7], ['Bag', 5], ['Lamp', 3],
];
const sheetTable = (name: string, rows: (string | number)[][]): ReactNode => (
  <table key={name} className="my-1 w-40 overflow-hidden rounded-lg border border-[#1F4D3A]/15 text-left text-xs">
    <caption className="bg-[#1F4D3A] px-2 py-1 text-left font-semibold text-[#C7F000]">Sheet “{name}”</caption>
    <tbody>
      {rows.map((r) => (
        <tr key={String(r[0])} className="border-t border-[#1F4D3A]/10">
          <td className="px-2 py-0.5">{r[0]}</td>
          <td className="px-2 py-0.5 text-right">{r[1]}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
const MONTH_TABLES = (
  <div className="flex flex-wrap justify-center gap-2">
    {sheetTable('Jan', [['Pen', 10], ['Book', 4], ['Bag', 3], ['Lamp', 2]])}
    {sheetTable('Feb', [['Pen', 12], ['Book', 6], ['Bag', 2], ['Lamp', 5]])}
    {sheetTable('Mar', [['Pen', 8], ['Book', 7], ['Bag', 5], ['Lamp', 3]])}
  </div>
);
const MONTH_META = { ext: { Jan: JAN, Feb: FEB, Mar: MAR } };
const STACKED = 'VSTACK(Jan!A2:B5,Feb!A2:B5,Mar!A2:B5)';

export const manySheets: LessonContent = {
  key: 'adv-many-sheets',
  title: 'Consolidate many sheets',
  sheet: SHEET,
  meta: MONTH_META,
  steps: [
    info('intro', 'One formula across every month', (
      <>
        <p>
          Reports often come as one sheet per month with the same layout. Three sheets, <strong>Jan</strong>, <strong>Feb</strong> and <strong>Mar</strong>, each list four products and their
          units:
        </p>
        {MONTH_TABLES}
        <p>
          <strong>VSTACK</strong> can pile them into one list so any formula can work on all of it at once.
        </p>
      </>
    )),
    task({
      id: 'sum', title: 'Add three sheets',
      body: <p>Total units across all three months: <F>{'=SUM(Jan!B2:B5,Feb!B2:B5,Mar!B2:B5)'}</F>.</p>,
      hint: 'A sheet name, an exclamation mark, then the range.',
      success: '67.',
      seed: {}, fresh: true, select: 'G2', cells: { G2: 67 }, uses: ['SUM'], sol: { G2: '=SUM(Jan!B2:B5,Feb!B2:B5,Mar!B2:B5)' },
    }),
    spill({
      id: 'stack', title: 'Stack them',
      body: <p>Pile all three sheets into one 12-row list: <F>{`=${STACKED}`}</F>.</p>,
      hint: 'VSTACK takes any number of blocks.',
      success: 'Twelve rows from three sheets, in one formula.',
      seed: {}, fresh: true, at: 'G2', expect: MONTH_ROWS, exact: true, uses: ['VSTACK'], sol: { G2: `=${STACKED}` },
    }),
    task({
      id: 'filter', title: 'Total one product across all sheets',
      body: (
        <>
          <p>
            Name the stacked list with LET, then filter and add. All <strong>Pen</strong> units over the three months:
          </p>
          <p>
            <F>{`=LET(all,${STACKED},SUM(FILTER(CHOOSECOLS(all,2),CHOOSECOLS(all,1)="Pen")))`}</F>
          </p>
        </>
      ),
      hint: 'CHOOSECOLS picks the product column (1) and the units column (2).',
      success: '30 pens (10 + 12 + 8).',
      seed: {}, fresh: true, select: 'G2', cells: { G2: 30 }, uses: ['LET', 'VSTACK', 'FILTER'],
      sol: { G2: `=LET(all,${STACKED},SUM(FILTER(CHOOSECOLS(all,2),CHOOSECOLS(all,1)="Pen")))` },
    }),
    spill({
      id: 'unique', title: 'A list of every product',
      body: <p>List each product once, from the combined data: <F>{`=UNIQUE(CHOOSECOLS(${STACKED},1))`}</F>.</p>,
      hint: 'Stack, take the first column, remove duplicates.',
      success: 'Pen, Book, Bag, Lamp.',
      seed: {}, fresh: true, at: 'G2', expect: [['Pen'], ['Book'], ['Bag'], ['Lamp']], exact: true, uses: ['UNIQUE', 'VSTACK'], sol: { G2: `=UNIQUE(CHOOSECOLS(${STACKED},1))` },
    }),
  ],
};

export const unit4Test: LessonContent = {
  key: 'adv-unit4-test',
  title: 'Unit 4 test',
  sheet: SHEET,
  meta: MONTH_META,
  steps: [
    info('intro', 'Advanced lookups test', <p>Five tasks. The orders are in A1:E21; the Jan, Feb and Mar sheets exist for the last task.</p>),
    spill({
      id: 'row', title: '1. A whole row',
      body: <p>In <Cell>G2</Cell> return the whole first order for <strong>Cleo</strong> with one XLOOKUP.</p>,
      hint: '=XLOOKUP("Cleo",B2:B21,A2:E21)',
      success: 'Correct.',
      seed: SALES, fresh: true, at: 'G2', expect: [[...ROWS.find((r) => r[1] === 'Cleo')!]], exact: true, uses: ['XLOOKUP'], sol: { G2: '=XLOOKUP("Cleo",B2:B21,A2:E21)' },
    }),
    task({
      id: 'last', title: '2. Last match',
      body: <p>In <Cell>G2</Cell> find the Units of the <em>last</em> order from <strong>Dev</strong>.</p>,
      hint: '=XLOOKUP("Dev",B2:B21,D2:D21,"none",0,-1)',
      success: 'Correct.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: [...ROWS].reverse().find((r) => r[1] === 'Dev')![3] }, uses: ['XLOOKUP'],
      sol: { G2: '=XLOOKUP("Dev",B2:B21,D2:D21,"none",0,-1)' },
    }),
    task({
      id: 'pos', title: '3. A position',
      body: <p>In <Cell>G2</Cell> find the position of the first <strong>West</strong> order using XMATCH.</p>,
      hint: '=XMATCH("West",A2:A21)',
      success: 'Correct.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: ROWS.findIndex((r) => r[0] === 'West') + 1 }, uses: ['XMATCH'], sol: { G2: '=XMATCH("West",A2:A21)' },
    }),
    task({
      id: 'band', title: '4. A discount band',
      body: <p>In <Cell>G2</Cell> find the discount for a quantity of <strong>120</strong> using the table in A2:B6.</p>,
      hint: '=XLOOKUP(120,A2:A6,B2:B6,0,-1)',
      success: 'Correct.',
      seed: DISC, fresh: true, select: 'G2', cells: { G2: 0.15 }, uses: ['XLOOKUP'], sol: { G2: '=XLOOKUP(120,A2:A6,B2:B6,0,-1)' },
    }),
    task({
      id: 'sheets', title: '5. Across sheets',
      body: <p>In <Cell>G2</Cell> total the <strong>Lamp</strong> units across Jan, Feb and Mar.</p>,
      hint: 'Stack with VSTACK, filter on Lamp, sum.',
      success: 'Unit 4 complete: 10.',
      seed: {}, fresh: true, select: 'G2', cells: { G2: 10 }, uses: ['FILTER'],
      sol: { G2: `=LET(all,${STACKED},SUM(FILTER(CHOOSECOLS(all,2),CHOOSECOLS(all,1)="Lamp")))` },
    }),
  ],
};

void uniq;
void sortRows;
void E;
