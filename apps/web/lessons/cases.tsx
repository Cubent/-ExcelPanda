// Real-world cases: small, realistic sheets solved step by step.
import { grid, info, task } from './dsl';
import { Cell, F } from './kbd';
import type { LessonContent } from './types';

const fill = (col: string, rows: number[], f: (r: number) => string) => Object.fromEntries(rows.map((r) => [`${col}${r}`, f(r)]));

// ---------------------------------------------------------------------------
const BUDGET = {
  ...grid([['Item', 'Budget', 'Actual', 'Over / under'], ['Rent', 1100, 1100], ['Food', 400, 460], ['Transport', 150, 120], ['Fun', 200, 260], ['Savings', 300, 300]]),
  A7: 'Total', F1: 'Income', G1: '3200', F3: 'Items over budget', F4: 'Left this month', F5: 'Biggest overspend',
};
export const caseBudget: LessonContent = {
  key: 'case-budget',
  title: 'Case: the monthly budget',
  steps: [
    info('intro', 'Where did the money go?', (
      <p>
        You have a household budget and what was actually spent. Work out the totals, find what went over, and see what is left. Income is in <Cell>G1</Cell>.
      </p>
    )),
    task({
      id: 'totals', title: 'Totals',
      body: <p>In <Cell>B7</Cell> and <Cell>C7</Cell> total the budget and the actual columns.</p>,
      hint: '=SUM(B2:B6)',
      success: '2,150 budgeted, 2,240 spent.',
      seed: BUDGET, fresh: true, select: 'B7', cells: { B7: 2150, C7: 2240 }, uses: 'SUM', sol: { B7: '=SUM(B2:B6)', C7: '=SUM(C2:C6)' },
    }),
    task({
      id: 'diff', title: 'Over or under',
      body: <p>Fill <Cell>D2:D6</Cell> with actual minus budget (<F>=C2-B2</F> and down).</p>,
      hint: 'Positive means overspent.',
      success: '0, 60, -30, 60, 0.',
      cells: { D2: 0, D3: 60, D4: -30, D5: 60, D6: 0 }, sol: fill('D', [2, 3, 4, 5, 6], (r) => `=C${r}-B${r}`),
    }),
    task({
      id: 'count', title: 'How many went over?',
      body: <p>In <Cell>G3</Cell> count the items that are over budget.</p>,
      hint: '=COUNTIF(D2:D6,">0")',
      success: '2 items.',
      cells: { G3: 2 }, uses: 'COUNTIF', sol: { G3: '=COUNTIF(D2:D6,">0")' },
    }),
    task({
      id: 'left', title: 'What is left',
      body: <p>In <Cell>G4</Cell> subtract the total spent from the income.</p>,
      hint: '=G1-C7',
      success: '960 left over.',
      cells: { G4: 960 }, sol: { G4: '=G1-C7' },
    }),
    task({
      id: 'worst', title: 'The biggest overspend',
      body: <p>In <Cell>G5</Cell> return the name of the item with the largest overspend.</p>,
      hint: '=INDEX(A2:A6,MATCH(MAX(D2:D6),D2:D6,0))',
      success: 'Food (tied with Fun at 60; the first wins).',
      cells: { G5: 'Food' }, uses: ['INDEX', 'MATCH', 'MAX'], sol: { G5: '=INDEX(A2:A6,MATCH(MAX(D2:D6),D2:D6,0))' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const REPORT = {
  ...grid([['Region', 'Product', 'Units', 'Price', 'Revenue'], ['North', 'Pen', 10, 2.5], ['South', 'Book', 4, 12], ['East', 'Bag', 2, 30], ['North', 'Book', 6, 12], ['South', 'Pen', 12, 2.5], ['East', 'Pen', 20, 2.5]]),
  G1: 'Total revenue', G2: 'North revenue', G3: 'Average order', G4: 'Biggest order is in',
};
export const caseReport: LessonContent = {
  key: 'case-report',
  title: 'Case: the sales report',
  steps: [
    info('intro', 'A quick report for the boss', (
      <p>
        Six orders came in. Build the revenue column, then answer the four questions your manager asks every Monday. Results go in <Cell>H1:H4</Cell>.
      </p>
    )),
    task({
      id: 'rev', title: 'Revenue per order',
      body: <p>Fill <Cell>E2:E7</Cell> with units times price.</p>,
      hint: '=C2*D2 and down',
      success: '25, 48, 60, 72, 30, 50.',
      seed: REPORT, fresh: true, select: 'E2', cells: { E2: 25, E3: 48, E4: 60, E5: 72, E6: 30, E7: 50 }, sol: fill('E', [2, 3, 4, 5, 6, 7], (r) => `=C${r}*D${r}`),
    }),
    task({
      id: 'total', title: 'Total revenue',
      body: <p>In <Cell>H1</Cell> add up the revenue.</p>,
      hint: '=SUM(E2:E7)',
      success: '285.',
      cells: { H1: 285 }, uses: 'SUM', sol: { H1: '=SUM(E2:E7)' },
    }),
    task({
      id: 'north', title: 'One region',
      body: <p>In <Cell>H2</Cell> total the revenue for <strong>North</strong> only.</p>,
      hint: '=SUMIF(A2:A7,"North",E2:E7)',
      success: '97.',
      cells: { H2: 97 }, uses: 'SUMIF', sol: { H2: '=SUMIF(A2:A7,"North",E2:E7)' },
    }),
    task({
      id: 'avg', title: 'Average order',
      body: <p>In <Cell>H3</Cell> find the average revenue per order.</p>,
      hint: '=AVERAGE(E2:E7)',
      success: '47.5.',
      cells: { H3: 47.5 }, uses: 'AVERAGE', sol: { H3: '=AVERAGE(E2:E7)' },
    }),
    task({
      id: 'top', title: 'The biggest order',
      body: <p>In <Cell>H4</Cell> return the region of the largest order.</p>,
      hint: '=INDEX(A2:A7,MATCH(MAX(E2:E7),E2:E7,0))',
      success: 'North.',
      cells: { H4: 'North' }, uses: ['INDEX', 'MATCH', 'MAX'], sol: { H4: '=INDEX(A2:A7,MATCH(MAX(E2:E7),E2:E7,0))' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const STOCK = {
  ...grid([['Item', 'Qty', 'Reorder at', 'Unit cost', 'Value', 'Status'], ['Pen', 120, 50, 0.5], ['Book', 8, 10, 12], ['Bag', 15, 5, 30], ['Mug', 4, 6, 8], ['Cap', 30, 10, 15]]),
  H1: 'Items to reorder', H2: 'Total stock value', H3: 'Cost to restock',
};
export const caseInventory: LessonContent = {
  key: 'case-inventory',
  title: 'Case: the stock check',
  steps: [
    info('intro', 'What needs ordering?', (
      <p>
        A small shop keeps its stock in a sheet. Value the stock, flag what is running low, and cost the order. Answers go in <Cell>I1:I3</Cell>.
      </p>
    )),
    task({
      id: 'value', title: 'Value each item',
      body: <p>Fill <Cell>E2:E6</Cell> with quantity times unit cost.</p>,
      hint: '=B2*D2 and down',
      success: '60, 96, 450, 32, 450.',
      seed: STOCK, fresh: true, select: 'E2', cells: { E2: 60, E3: 96, E4: 450, E5: 32, E6: 450 }, sol: fill('E', [2, 3, 4, 5, 6], (r) => `=B${r}*D${r}`),
    }),
    task({
      id: 'status', title: 'Flag low stock',
      body: <p>In <Cell>F2:F6</Cell> show "Reorder" when the quantity is at or below the reorder level, otherwise "OK".</p>,
      hint: '=IF(B2<=C2,"Reorder","OK")',
      success: 'Book and Mug need reordering.',
      cells: { F2: 'OK', F3: 'Reorder', F4: 'OK', F5: 'Reorder', F6: 'OK' }, uses: 'IF', sol: fill('F', [2, 3, 4, 5, 6], (r) => `=IF(B${r}<=C${r},"Reorder","OK")`),
    }),
    task({
      id: 'count', title: 'How many to reorder?',
      body: <p>In <Cell>I1</Cell> count the items flagged Reorder.</p>,
      hint: '=COUNTIF(F2:F6,"Reorder")',
      success: '2.',
      cells: { I1: 2 }, uses: 'COUNTIF', sol: { I1: '=COUNTIF(F2:F6,"Reorder")' },
    }),
    task({
      id: 'stock', title: 'Total stock value',
      body: <p>In <Cell>I2</Cell> add up the value column.</p>,
      hint: '=SUM(E2:E6)',
      success: '1,088.',
      cells: { I2: 1088 }, uses: 'SUM', sol: { I2: '=SUM(E2:E6)' },
    }),
    task({
      id: 'restock', title: 'Cost to restock',
      body: <p>Order enough to reach <strong>twice</strong> the reorder level for each flagged item. In <Cell>I3</Cell> total the cost.</p>,
      hint: '=SUMPRODUCT((F2:F6="Reorder")*(C2:C6*2-B2:B6)*D2:D6)',
      success: '208: Book 12 x 12 = 144 plus Mug 8 x 8 = 64.',
      cells: { I3: 208 }, uses: 'SUMPRODUCT', sol: { I3: '=SUMPRODUCT((F2:F6="Reorder")*(C2:C6*2-B2:B6)*D2:D6)' },
    }),
  ],
};

export const CASES = [caseBudget, caseReport, caseInventory];
