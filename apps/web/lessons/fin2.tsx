// Excel for Finance, units 3 to 5: statements, modelling practice and capstones.
import * as E from '@/components/sheet/engine';
import * as Fin from '@/components/sheet/finance';
import * as T from '@/components/sheet/tools';
import { custom, grid, info, task } from './dsl';
import { Cell, F } from './kbd';
import { FIN_SHEET, allFormulas, cents, within } from './fin-util';
import type { LessonContent } from './types';

const base = (cells: Record<string, string>): E.SheetData => ({ ...E.emptyData(), cells });
const rect = (label: string) => E.parseRectLabel(label) as E.Rect;
const lab = (rows: [string, string | number][], r0 = 1) => Object.fromEntries(rows.flatMap(([a, b], i) => [[`A${r0 + i}`, a], ...(b === '' ? [] : [[`B${r0 + i}`, String(b)]])]));

// ---------------------------------------------------------------------------
// Unit 3 · Financial statements
// ---------------------------------------------------------------------------
const INC = {
  ...lab([['Revenue', 500000], ['Cost of goods sold', 300000], ['Operating expenses', 120000], ['Depreciation', 20000], ['Interest', 10000], ['Tax rate', 0.25]]),
  A8: 'Gross profit', A9: 'EBITDA', A10: 'EBIT', A11: 'Profit before tax', A12: 'Tax', A13: 'Net income', A14: 'Net margin',
};
export const finIncome: LessonContent = {
  key: 'fin-income',
  title: 'Income statement',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'From revenue to net profit', (
      <>
        <p>The income statement walks down from sales to profit, subtracting a layer of cost at each step:</p>
        <p>
          <strong>Revenue − COGS = gross profit</strong>, <strong>− operating expenses = EBITDA</strong>, <strong>− depreciation = EBIT</strong>, <strong>− interest = profit before tax</strong>,{' '}
          <strong>− tax = net income</strong>.
        </p>
      </>
    )),
    task({
      id: 'top', title: 'Gross profit and EBITDA',
      body: <p>In <Cell>B8</Cell> revenue minus COGS; in <Cell>B9</Cell> subtract operating expenses from gross profit.</p>,
      hint: '=B1-B2 then =B8-B3.',
      success: '200,000 and 80,000.',
      seed: INC, fresh: true, select: 'B8', cells: { B8: 200000, B9: 80000 }, sol: { B8: '=B1-B2', B9: '=B8-B3' },
    }),
    task({
      id: 'mid', title: 'EBIT and profit before tax',
      body: <p>In <Cell>B10</Cell> subtract depreciation from EBITDA; in <Cell>B11</Cell> subtract interest.</p>,
      hint: '=B9-B4 then =B10-B5.',
      success: '60,000 and 50,000.',
      cells: { B10: 60000, B11: 50000 }, sol: { B10: '=B9-B4', B11: '=B10-B5' },
    }),
    task({
      id: 'bottom', title: 'Tax and net income',
      body: <p>In <Cell>B12</Cell> tax is profit before tax times the rate; in <Cell>B13</Cell> net income is what remains.</p>,
      hint: '=B11*B6 then =B11-B12.',
      success: '12,500 tax, 37,500 net income.',
      cells: { B12: 12500, B13: 37500 }, sol: { B12: '=B11*B6', B13: '=B11-B12' },
    }),
    task({
      id: 'margin', title: 'Net margin',
      body: <p>In <Cell>B14</Cell> divide net income by revenue.</p>,
      hint: '=B13/B1',
      success: '7.5%: for every 100 of sales, 7.50 is profit.',
      cells: { B14: 0.075 }, sol: { B14: '=B13/B1' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const BAL = {
  ...lab([['Cash', 40000], ['Receivables', 30000], ['Inventory', 50000], ['Property & equipment', 180000], ['Total assets', '']]),
  ...lab([['Payables', 35000], ['Debt', 100000], ['Total liabilities', '']], 7),
  ...lab([['Share capital', 100000], ['Retained earnings', 65000], ['Total equity', '']], 11),
  A15: 'Liabilities + equity', A16: 'Check',
};
export const finBalance: LessonContent = {
  key: 'fin-balance',
  title: 'Balance sheet',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'What you own and who funds it', (
      <p>
        The balance sheet is a snapshot. <strong>Assets</strong> (what the business owns) must equal <strong>liabilities</strong> (what it owes) plus <strong>equity</strong> (what is left for owners). If the two sides
        differ, something is wrong.
      </p>
    )),
    task({
      id: 'assets', title: 'Total assets',
      body: <p>In <Cell>B5</Cell> add the four asset lines.</p>,
      hint: '=SUM(B1:B4)',
      success: '300,000.',
      seed: BAL, fresh: true, select: 'B5', cells: { B5: 300000 }, uses: 'SUM', sol: { B5: '=SUM(B1:B4)' },
    }),
    task({
      id: 'le', title: 'Liabilities and equity',
      body: <p>Total liabilities in <Cell>B9</Cell>, total equity in <Cell>B13</Cell>, and their sum in <Cell>B15</Cell>.</p>,
      hint: '=SUM(B7:B8), =SUM(B11:B12), =B9+B13',
      success: '135,000 + 165,000 = 300,000.',
      cells: { B9: 135000, B13: 165000, B15: 300000 }, sol: { B9: '=SUM(B7:B8)', B13: '=SUM(B11:B12)', B15: '=B9+B13' },
    }),
    task({
      id: 'check', title: 'A balance check',
      body: <p>In <Cell>B16</Cell> return "Balanced" when assets equal liabilities plus equity: <F>{'=IF(ROUND(B5-B15,2)=0,"Balanced","ERROR")'}</F>.</p>,
      hint: 'ROUND avoids false alarms from tiny decimals.',
      success: 'Balanced. Every real model carries a check like this.',
      cells: { B16: 'Balanced' }, uses: ['IF', 'ROUND'], sol: { B16: '=IF(ROUND(B5-B15,2)=0,"Balanced","ERROR")' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const CFS = {
  ...lab([['Net income', 37500], ['Depreciation', 20000], ['Change in receivables', -5000], ['Change in inventory', -8000], ['Change in payables', 3000], ['Cash from operations', '']]),
  ...lab([['Capital expenditure', -30000], ['Cash from investing', '']], 8),
  ...lab([['Debt repaid', -10000], ['Dividends', -5000], ['Cash from financing', '']], 11),
  A15: 'Net change in cash', A16: 'Opening cash', B16: '40000', A17: 'Closing cash',
};
export const finCfs: LessonContent = {
  key: 'fin-cfs',
  title: 'Cash-flow statement',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Where did the cash go?', (
      <>
        <p>
          The <strong>indirect method</strong> starts with net income and corrects it to cash: add back non-cash costs like depreciation, and adjust for working capital. <strong>More receivables or inventory</strong> uses cash
          (negative); <strong>more payables</strong> provides cash (positive).
        </p>
        <p>Three sections: operations, investing and financing.</p>
      </>
    )),
    task({
      id: 'ops', title: 'Cash from operations',
      body: <p>In <Cell>B6</Cell> add net income, depreciation and the three working-capital changes.</p>,
      hint: '=SUM(B1:B5)',
      success: '47,500, more than the 37,500 profit because depreciation is not a cash cost.',
      seed: CFS, fresh: true, select: 'B6', cells: { B6: 47500 }, uses: 'SUM', sol: { B6: '=SUM(B1:B5)' },
    }),
    task({
      id: 'inv', title: 'Investing and financing',
      body: <p>In <Cell>B9</Cell> investing (just capex) and in <Cell>B13</Cell> add debt repaid and dividends.</p>,
      hint: '=B8 and =SUM(B11:B12)',
      success: '-30,000 and -15,000.',
      cells: { B9: -30000, B13: -15000 }, sol: { B9: '=B8', B13: '=SUM(B11:B12)' },
    }),
    task({
      id: 'net', title: 'Net change and closing cash',
      body: <p>In <Cell>B15</Cell> add the three sections; in <Cell>B17</Cell> add the change to opening cash.</p>,
      hint: '=B6+B9+B13 then =B16+B15',
      success: '+2,500, closing at 42,500.',
      cells: { B15: 2500, B17: 42500 }, sol: { B15: '=B6+B9+B13', B17: '=B16+B15' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const LNK = {
  ...lab([['Net income', 37500], ['Dividends', 5000], ['Opening retained earnings', 65000], ['Closing retained earnings', ''], ['Opening cash', 40000], ['Cash from operations', 47500], ['Capex', -30000], ['Debt repaid', -10000], ['Closing cash', ''], ['Non-cash assets (closing)', 283000], ['Total assets', ''], ['Liabilities (closing)', 128000], ['Share capital', 100000], ['Liabilities + equity', ''], ['Check', '']]),
};
export const finLink: LessonContent = {
  key: 'fin-link',
  title: 'Linking the three statements',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'One model, three statements', (
      <>
        <p>
          The statements are connected. <strong>Net income</strong> from the income statement flows into <strong>retained earnings</strong> on the balance sheet and starts the cash-flow statement. The{' '}
          <strong>closing cash</strong> from the cash-flow statement is the <strong>cash</strong> on the balance sheet.
        </p>
        <p>If you link them correctly, the balance sheet balances by itself. That is the proof.</p>
      </>
    )),
    task({
      id: 're', title: 'Retained earnings roll forward',
      body: <p>In <Cell>B4</Cell>: opening retained earnings plus net income minus dividends.</p>,
      hint: '=B3+B1-B2',
      success: '97,500.',
      seed: LNK, fresh: true, select: 'B4', cells: { B4: 97500 }, sol: { B4: '=B3+B1-B2' },
    }),
    task({
      id: 'cash', title: 'Closing cash from the cash-flow statement',
      body: <p>In <Cell>B9</Cell>: opening cash plus operations, capex and debt repaid, minus the dividends paid (<Cell>B2</Cell>).</p>,
      hint: '=B5+B6+B7+B8-B2',
      success: '42,500.',
      cells: { B9: 42500 }, sol: { B9: '=B5+B6+B7+B8-B2' },
    }),
    task({
      id: 'totals', title: 'Both sides of the balance sheet',
      body: <p>In <Cell>B11</Cell> total assets (cash plus non-cash assets). In <Cell>B14</Cell> liabilities plus share capital plus closing retained earnings.</p>,
      hint: '=B9+B10 and =B12+B13+B4',
      success: '325,500 on both sides.',
      cells: { B11: 325500, B14: 325500 }, sol: { B11: '=B9+B10', B14: '=B12+B13+B4' },
    }),
    task({
      id: 'check', title: 'Does it balance?',
      body: <p>In <Cell>B15</Cell> return "Balanced" or "ERROR".</p>,
      hint: '=IF(ROUND(B11-B14,2)=0,"Balanced","ERROR")',
      success: 'Balanced.',
      cells: { B15: 'Balanced' }, uses: 'IF', sol: { B15: '=IF(ROUND(B11-B14,2)=0,"Balanced","ERROR")' },
    }),
    custom({
      id: 'flex', title: 'Change a driver',
      body: <p>Raise <strong>Dividends</strong> in <Cell>B2</Cell> to <strong>8000</strong>. Cash and retained earnings both fall by 3,000, so it still balances.</p>,
      hint: 'Type 8000 in B2.',
      success: 'Still balanced. A linked model stays consistent when inputs change.',
      select: 'B2',
      check: (c) => c.value('B2') === 8000 && c.value('B15') === 'Balanced' && c.value('B11') === 322500 && !c.editing,
      sol: { cells: { B2: '8000' } },
    }),
  ],
};

// ---------------------------------------------------------------------------
const RAT = {
  ...lab([['Revenue', 500000], ['Gross profit', 200000], ['Net income', 37500], ['Current assets', 120000], ['Inventory', 50000], ['Current liabilities', 35000], ['Total debt', 100000], ['Equity', 165000]]),
  A10: 'Gross margin', A11: 'Net margin', A12: 'Current ratio', A13: 'Quick ratio', A14: 'Debt to equity', A15: 'Return on equity',
};
export const finRatios: LessonContent = {
  key: 'fin-ratios',
  title: 'Financial ratios',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Turn statements into signals', (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Profitability</strong>: gross margin, net margin, return on equity.
        </li>
        <li>
          <strong>Liquidity</strong>: can it pay bills soon? Current ratio = current assets / current liabilities. Quick ratio ignores inventory, which is slow to turn into cash.
        </li>
        <li>
          <strong>Leverage</strong>: how much debt? Debt to equity.
        </li>
      </ul>
    )),
    task({
      id: 'margins', title: 'Margins',
      body: <p>Gross margin in <Cell>B10</Cell> (gross profit / revenue) and net margin in <Cell>B11</Cell> (net income / revenue).</p>,
      hint: '=B2/B1 and =B3/B1',
      success: '40% and 7.5%.',
      seed: RAT, fresh: true, select: 'B10', cells: { B10: 0.4, B11: 0.075 }, sol: { B10: '=B2/B1', B11: '=B3/B1' },
    }),
    task({
      id: 'liq', title: 'Liquidity',
      body: <p>Current ratio in <Cell>B12</Cell>; quick ratio in <Cell>B13</Cell> (current assets minus inventory, over current liabilities).</p>,
      hint: '=B4/B6 and =(B4-B5)/B6',
      success: '3.43 and 2.00. Comfortably able to pay its bills.',
      cells: { B12: within(120000 / 35000, 1e-6), B13: 2 }, sol: { B12: '=B4/B6', B13: '=(B4-B5)/B6' },
    }),
    task({
      id: 'lev', title: 'Leverage and return',
      body: <p>Debt to equity in <Cell>B14</Cell>; return on equity in <Cell>B15</Cell> (net income / equity).</p>,
      hint: '=B7/B8 and =B3/B8',
      success: '0.61 and 22.7%.',
      cells: { B14: within(100000 / 165000, 1e-6), B15: within(37500 / 165000, 1e-6) }, sol: { B14: '=B7/B8', B15: '=B3/B8' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const U3T = { ...lab([['Revenue', 400000], ['Costs', 330000], ['Tax rate', 0.2], ['Opening cash', 10000], ['Capex', 15000], ['Equity', 80000]]), A8: 'Net income', A9: 'Free cash flow', A10: 'Closing cash', A11: 'Return on equity' };
export const finUnit3Test: LessonContent = {
  key: 'fin-unit3-test',
  title: 'Unit 3 test',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Statements test', <p>Four tasks on a small business.</p>),
    task({
      id: 'ni', title: '1. Net income',
      body: <p>In <Cell>B8</Cell> subtract costs from revenue, then take off tax.</p>,
      hint: '=(B1-B2)*(1-B3)',
      success: '56,000.',
      seed: U3T, fresh: true, select: 'B8', cells: { B8: 56000 }, sol: { B8: '=(B1-B2)*(1-B3)' },
    }),
    task({
      id: 'fcf', title: '2. Free cash flow',
      body: <p>In <Cell>B9</Cell> subtract capex from net income.</p>,
      hint: '=B8-B5',
      success: '41,000.',
      cells: { B9: 41000 }, sol: { B9: '=B8-B5' },
    }),
    task({
      id: 'cash', title: '3. Closing cash',
      body: <p>In <Cell>B10</Cell> add free cash flow to opening cash.</p>,
      hint: '=B4+B9',
      success: '51,000.',
      cells: { B10: 51000 }, sol: { B10: '=B4+B9' },
    }),
    task({
      id: 'roe', title: '4. Return on equity',
      body: <p>In <Cell>B11</Cell> divide net income by equity.</p>,
      hint: '=B8/B6',
      success: '70%.',
      cells: { B11: 0.7 }, sol: { B11: '=B8/B6' },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 4 · Modelling best practice
// ---------------------------------------------------------------------------
const AUD = { ...lab([['Revenue', 1000], ['Costs', 600], ['Tax rate', 0.2]]), A5: 'Profit before tax', B5: '=B1-B2', A6: 'Tax', B6: '=B5*0.2' };
export const finColours: LessonContent = {
  key: 'fin-colours',
  title: 'Audit a model',
  sheet: FIN_SHEET,
  toolbar: true,
  steps: [
    info('intro', 'Make the model readable at a glance', (
      <>
        <p>Professional models follow simple conventions:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Typed inputs in <span className="font-semibold text-[#1d4ed8]">blue</span>; formulas in black.
          </li>
          <li>
            <strong>No hard-coded numbers inside formulas.</strong> If 0.2 is the tax rate, it lives in a cell with a label.
          </li>
        </ul>
        <p>Here is a tiny model to audit.</p>
      </>
    )),
    custom({
      id: 'hard', title: 'Find the hidden number',
      body: <p>The tax in <Cell>B6</Cell> is <F>=B5*0.2</F>, with the rate buried in the formula. The rate already sits in <Cell>B3</Cell>. Fix the formula to use it.</p>,
      hint: 'Replace 0.2 with B3.',
      success: '80, the same answer, but now changing the tax rate changes the model.',
      seed: AUD, fresh: true, select: 'B6',
      check: (c) => !c.editing && /B3/.test(c.raw('B6')) && !/0\.2/.test(c.raw('B6')) && c.value('B6') === 80,
      sol: { cells: { B6: '=B5*B3' } },
    }),
    custom({
      id: 'blue', title: 'Colour the inputs',
      body: <p>Give <Cell>B1:B3</Cell> the same blue font colour. Leave the formulas black.</p>,
      hint: 'Select B1:B3, then choose a blue font colour.',
      success: 'Now anyone can see which cells to change and which to leave alone.',
      select: 'B1',
      check: (c) => {
        const x = c.style('B1').color;
        return !!x && c.style('B2').color === x && c.style('B3').color === x && !c.style('B5').color && !c.style('B6').color;
      },
      sol: { styles: { B1: { color: '#1d4ed8' }, B2: { color: '#1d4ed8' }, B3: { color: '#1d4ed8' } } },
    }),
  ],
};

// ---------------------------------------------------------------------------
const CHK = { ...lab([['Product A', 100], ['Product B', 250], ['Product C', 150], ['Reported total', 520]]), A6: 'Check', A7: 'Status' };
export const finChecks: LessonContent = {
  key: 'fin-checks',
  title: 'Checks & balances',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Let the model tell you when it is wrong', (
      <p>
        A <strong>check cell</strong> compares two numbers that should agree, such as a sum of parts against a reported total, and shows "OK" or "CHECK". Use ROUND so tiny decimal noise does not raise false alarms.
      </p>
    )),
    task({
      id: 'check', title: 'Write the check',
      body: <p>In <Cell>B6</Cell>: <F>{'=IF(ROUND(SUM(B1:B3)-B4,2)=0,"OK","CHECK")'}</F>. With these numbers it should shout.</p>,
      hint: 'The parts add to 500 but the total says 520.',
      success: 'CHECK. The model found a problem.',
      seed: CHK, fresh: true, select: 'B6', cells: { B6: 'CHECK' }, uses: ['IF', 'ROUND', 'SUM'], sol: { B6: '=IF(ROUND(SUM(B1:B3)-B4,2)=0,"OK","CHECK")' },
    }),
    custom({
      id: 'fix', title: 'Fix the data',
      body: <p>The reported total in <Cell>B4</Cell> is a typo. Correct it to <strong>500</strong>.</p>,
      hint: 'Type 500 in B4.',
      success: 'OK. The check turned green on its own.',
      select: 'B4',
      check: (c) => c.raw('B4').trim() === '500' && c.value('B6') === 'OK' && /IF/i.test(c.raw('B6')) && !c.editing,
      sol: { cells: { B4: '500' } },
    }),
    task({
      id: 'master', title: 'One status for the whole model',
      body: <p>In <Cell>B7</Cell> summarise: <F>{'=IF(B6="OK","Model OK","Fix errors")'}</F>. Put this at the top of a real model.</p>,
      hint: 'It reads the check cell.',
      success: 'Model OK.',
      cells: { B7: 'Model OK' }, uses: 'IF', sol: { B7: '=IF(B6="OK","Model OK","Fix errors")' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const NM = { ...lab([['Revenue', 50000], ['Tax rate', 0.2]]), A4: 'Net revenue' };
export const finNamed: LessonContent = {
  key: 'fin-named',
  title: 'Named ranges & structure',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Formulas you can read', (
      <p>
        <strong>=Revenue*(1-TaxRate)</strong> explains itself; <strong>=B1*(1-B2)</strong> does not. Name your key inputs and your formulas read like sentences. Select the cell, click the Name Box, type the name and
        press Enter.
      </p>
    )),
    custom({
      id: 'tax', title: 'Name the tax rate',
      body: <p>Click <Cell>B2</Cell>, then in the Name Box type <strong>TaxRate</strong> and press Enter.</p>,
      hint: 'The Name Box shows "B2" now.',
      success: 'B2 is called TaxRate.',
      seed: NM, fresh: true, select: 'B2',
      check: (c) => c.data.names?.TAXRATE === 'B2' && c.events.has('define-name'),
      sol: { names: { TAXRATE: 'B2' }, events: ['define-name'] },
    }),
    custom({
      id: 'rev', title: 'Name the revenue',
      body: <p>Do the same for <Cell>B1</Cell> and call it <strong>Revenue</strong>.</p>,
      hint: 'Click B1, type Revenue in the Name Box.',
      success: 'Two names.',
      select: 'B1', meta: { names: { TAXRATE: 'B2' } },
      check: (c) => c.data.names?.REVENUE === 'B1' && c.events.has('define-name'),
      sol: { names: { REVENUE: 'B1' }, events: ['define-name'] },
    }),
    task({
      id: 'use', title: 'Write it in words',
      body: <p>In <Cell>B4</Cell>: <F>=Revenue*(1-TaxRate)</F>.</p>,
      hint: 'Names work like cell references, with no dollar signs.',
      success: '40,000.',
      select: 'B4', meta: { names: { TAXRATE: 'B2', REVENUE: 'B1' } }, cells: { B4: 40000 },
      also: (c) => /REVENUE/i.test(c.raw('B4')) && /TAXRATE/i.test(c.raw('B4')),
      sol: { B4: '=Revenue*(1-TaxRate)' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const SCN = { ...lab([['Scenario', 'Base'], ['Revenue now', 100000], ['Growth', ''], ['Next year', '']]), D1: 'Scenario', E1: 'Growth', D2: 'Base', E2: '0.05', D3: 'Upside', E3: '0.12', D4: 'Downside', E4: '-0.04' };
const SCN_LISTS = { B1: ['Base', 'Upside', 'Downside'] };
export const finScenario: LessonContent = {
  key: 'fin-scenario',
  title: 'Scenario switch',
  sheet: FIN_SHEET,
  meta: { lists: SCN_LISTS },
  steps: [
    info('intro', 'One dropdown flips the model', (
      <p>
        Keep every scenario's assumptions in a small table, then let one <strong>selector cell</strong> choose which row the model reads. Changing the dropdown re-runs the whole forecast.
      </p>
    )),
    task({
      id: 'growth', title: 'Look up the growth rate',
      body: <p>In <Cell>B3</Cell> fetch the growth for the chosen scenario: <F>=XLOOKUP(B1,D2:D4,E2:E4)</F>.</p>,
      hint: 'Find B1 in the scenario list and return from the growth column.',
      success: '5% for Base.',
      seed: SCN, fresh: true, select: 'B3', cells: { B3: 0.05 }, uses: 'XLOOKUP', sol: { B3: '=XLOOKUP(B1,D2:D4,E2:E4)' },
    }),
    task({
      id: 'next', title: 'Project next year',
      body: <p>In <Cell>B4</Cell> grow revenue: <F>=B2*(1+B3)</F>.</p>,
      hint: 'Revenue times one plus growth.',
      success: '105,000.',
      cells: { B4: 105000 }, sol: { B4: '=B2*(1+B3)' },
    }),
    custom({
      id: 'flip', title: 'Flip the switch',
      body: <p>Choose <strong>Downside</strong> in <Cell>B1</Cell> with its dropdown.</p>,
      hint: 'Click B1, then the arrow.',
      success: '96,000. The model followed the selector.',
      select: 'B1',
      check: (c) => c.raw('B1') === 'Downside' && c.value('B4') === 96000 && c.events.has('dropdown'),
      sol: { cells: { B1: 'Downside' }, events: ['dropdown'] },
    }),
  ],
};

// ---------------------------------------------------------------------------
const SEN_BASE = { A1: 'Price', B1: '20', A2: 'Units', B2: '100', A3: 'Fixed costs', B3: '1200', A4: 'Profit', B4: '=B1*B2-B3', D1: '=B4', E1: '18', F1: '20', G1: '22', D2: '80', D3: '100', D4: '120', A6: 'Break-even units' };
const SEN_DONE = T.dataTable(base(SEN_BASE), rect('D1:G4'), 'B1', 'B2').cells;
export const finSensitivity: LessonContent = {
  key: 'fin-sensitivity',
  title: 'Sensitivity analysis',
  sheet: FIN_SHEET,
  tools: ['datatable'],
  steps: [
    info('intro', 'How wrong can I be?', (
      <p>
        Every model rests on assumptions. <strong>Sensitivity analysis</strong> shows how the answer moves when two key inputs change together. A <strong>data table</strong> computes the whole grid from a single formula.
      </p>
    )),
    custom({
      id: 'table', title: 'Build the grid',
      body: (
        <p>
          Select <Cell>D1:G4</Cell>, press <strong>Data table</strong>, set <strong>Row input</strong> to <strong>B1</strong> (price) and <strong>Column input</strong> to <strong>B2</strong> (units).
        </p>
      ),
      hint: 'Prices run across the top (row input); units run down the side (column input).',
      success: 'Profit for every price and volume combination.',
      seed: SEN_BASE, fresh: true, select: 'D1',
      check: (c) => ['E2', 'F2', 'G2', 'E3', 'F3', 'G3', 'E4', 'F4', 'G4'].every((k) => c.raw(k) === SEN_DONE[k]),
      sol: { cells: SEN_DONE, events: ['data-table'] },
    }),
    task({
      id: 'be', title: 'Break-even volume',
      body: <p>In <Cell>B6</Cell> how many units cover the fixed costs at the current price? <F>=B3/B1</F>.</p>,
      hint: 'Fixed costs divided by price.',
      success: '60 units. Compare it with the grid: the left column is where it gets tight.',
      seed: SEN_DONE, select: 'B6', cells: { B6: 60 }, sol: { B6: '=B3/B1' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const U4T = { ...lab([['Revenue', 1000], ['Costs', 700], ['Tax rate', 0.25]]), A4: 'Tax', B4: '=(B1-B2)*0.25', A5: 'Check' };
export const finUnit4Test: LessonContent = {
  key: 'fin-unit4-test',
  title: 'Unit 4 test',
  sheet: FIN_SHEET,
  toolbar: true,
  steps: [
    info('intro', 'Best-practice test', <p>Clean up a small model in four steps.</p>),
    custom({
      id: 'hard', title: '1. Remove the hard-coded rate',
      body: <p>The formula in <Cell>B4</Cell> has 0.25 typed inside. Make it use <Cell>B3</Cell>.</p>,
      hint: '=(B1-B2)*B3',
      success: '75.',
      seed: U4T, fresh: true, select: 'B4',
      check: (c) => !c.editing && /B3/.test(c.raw('B4')) && !/0\.25/.test(c.raw('B4')) && c.value('B4') === 75,
      sol: { cells: { B4: '=(B1-B2)*B3' } },
    }),
    task({
      id: 'check', title: '2. Add a check',
      body: <p>In <Cell>B5</Cell> return "OK" when the tax equals profit times the rate, else "CHECK".</p>,
      hint: '=IF(ROUND(B4-(B1-B2)*B3,2)=0,"OK","CHECK")',
      success: 'OK.',
      select: 'B5', cells: { B5: 'OK' }, uses: ['IF', 'ROUND'], sol: { B5: '=IF(ROUND(B4-(B1-B2)*B3,2)=0,"OK","CHECK")' },
    }),
    custom({
      id: 'name', title: '3. Name the rate',
      body: <p>Name <Cell>B3</Cell> <strong>TaxRate</strong>.</p>,
      hint: 'Name Box.',
      success: 'Named.',
      select: 'B3',
      check: (c) => c.data.names?.TAXRATE === 'B3' && c.events.has('define-name'),
      sol: { names: { TAXRATE: 'B3' }, events: ['define-name'] },
    }),
    custom({
      id: 'blue', title: '4. Colour the inputs',
      body: <p>Make <Cell>B1:B3</Cell> blue.</p>,
      hint: 'Font colour in the toolbar.',
      success: 'Unit complete.',
      select: 'B1',
      check: (c) => {
        const x = c.style('B1').color;
        return !!x && c.style('B2').color === x && c.style('B3').color === x && !c.style('B4').color;
      },
      sol: { styles: { B1: { color: '#1d4ed8' }, B2: { color: '#1d4ed8' }, B3: { color: '#1d4ed8' } } },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 5 · Capstones
// ---------------------------------------------------------------------------
const ST = {
  ...lab([['Year 1 revenue', 100000], ['Revenue growth', 0.3], ['COGS % of revenue', 0.4], ['Year 1 opex', 50000], ['Opex growth', 0.1]]),
  A7: '', B7: 'Y1', C7: 'Y2', D7: 'Y3', A8: 'Revenue', A9: 'COGS', A10: 'Opex', A11: 'Profit', A12: 'Cumulative',
};
const yrs = ['B', 'C', 'D'];
const ST_REV = { B8: '=B1', C8: '=B8*(1+$B$2)', D8: '=C8*(1+$B$2)', B9: '=B8*$B$3', C9: '=C8*$B$3', D9: '=D8*$B$3' };
const ST_PROFIT = { B10: '=B4', C10: '=B10*(1+$B$5)', D10: '=C10*(1+$B$5)', B11: '=B8-B9-B10', C11: '=C8-C9-C10', D11: '=D8-D9-D10' };
const ST_CUM = { B12: '=B11', C12: '=B12+C11', D12: '=C12+D11' };
export const finCapStartup: LessonContent = {
  key: 'fin-cap-startup',
  title: 'Capstone: startup plan',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'A three-year plan', (
      <p>
        You are building a three-year plan for a startup. Assumptions are in <Cell>B1:B5</Cell>; the plan goes in rows 8 to 12 across <Cell>B:D</Cell> (Year 1 to 3). Every cell is a formula that reads the assumptions.
      </p>
    )),
    custom({
      id: 'rev', title: '1. Revenue and COGS',
      body: <p>Year 1 revenue is <Cell>B1</Cell>; later years grow by <Cell>B2</Cell>. COGS is revenue times <Cell>B3</Cell>. Lock the assumptions with $.</p>,
      hint: 'C8 =B8*(1+$B$2); B9 =B8*$B$3. Fill right.',
      success: 'Revenue 100k, 130k, 169k.',
      seed: ST, fresh: true, select: 'B8',
      check: (c) => !c.editing && allFormulas(c, Object.keys(ST_REV)) && c.value('D8') === 169000 && Math.abs(Number(c.value('D9')) - 67600) < 0.01,
      sol: { cells: ST_REV },
    }),
    custom({
      id: 'profit', title: '2. Opex and profit',
      body: <p>Opex starts at <Cell>B4</Cell> and grows by <Cell>B5</Cell>. Profit is revenue minus COGS minus opex.</p>,
      hint: 'C10 =B10*(1+$B$5); B11 =B8-B9-B10.',
      success: 'Profit 10,000, 23,000, 40,900.',
      select: 'B10',
      check: (c) => !c.editing && allFormulas(c, Object.keys(ST_PROFIT)) && Math.abs(Number(c.value('B11')) - 10000) < 0.01 && Math.abs(Number(c.value('C11')) - 23000) < 0.01 && Math.abs(Number(c.value('D11')) - 40900) < 0.01,
      sol: { cells: ST_PROFIT },
    }),
    custom({
      id: 'cum', title: '3. Cumulative profit',
      body: <p>Row 12: Year 1 equals its profit; each later year adds that year's profit to the previous cumulative figure.</p>,
      hint: 'C12 =B12+C11.',
      success: '73,900 after three years.',
      select: 'B12',
      check: (c) => !c.editing && allFormulas(c, Object.keys(ST_CUM)) && Math.abs(Number(c.value('D12')) - 73900) < 0.01,
      sol: { cells: ST_CUM },
    }),
    custom({
      id: 'flex', title: '4. Test a scenario',
      body: <p>What if growth is faster? Set <strong>Revenue growth</strong> in <Cell>B2</Cell> to <strong>0.5</strong>.</p>,
      hint: 'Type 0.5 in B2.',
      success: 'Year 3 revenue jumps to 225,000. One input, the whole plan.',
      select: 'B2',
      check: (c) => c.value('B2') === 0.5 && c.value('D8') === 225000 && !c.editing,
      sol: { cells: { B2: '0.5' } },
    }),
  ],
};

// ---------------------------------------------------------------------------
const LN = {
  A1: 'Bank', B1: 'Rate', C1: 'Years', D1: 'Fee', E1: 'Payment', F1: 'Total cost',
  A2: 'Bank A', B2: '0.055', C2: '5', D2: '0', A3: 'Bank B', B3: '0.049', C3: '5', D3: '500',
  H1: 'Choose', I1: 'Bank A', H2: 'Total cost', H3: 'Loan', I3: '10000',
};
const costA = -Fin.pmt(0.055 / 12, 60, 10000) * 60;
const costB = -Fin.pmt(0.049 / 12, 60, 10000) * 60 + 500;
const LN_LISTS = { I1: ['Bank A', 'Bank B'] };
export const finCapLoan: LessonContent = {
  key: 'fin-cap-loan',
  title: 'Capstone: loan comparison',
  sheet: FIN_SHEET,
  meta: { lists: LN_LISTS },
  steps: [
    info('intro', 'Which loan is really cheaper?', (
      <p>
        A lower rate is not always cheaper once fees are included. Compare two 10,000 loans by monthly payment and total cost, then use a dropdown to pick one. The loan amount is in <Cell>I3</Cell>.
      </p>
    )),
    custom({
      id: 'pay', title: '1. Monthly payments',
      body: <p>In <Cell>E2</Cell> compute the payment as a positive number: <F>=-PMT(B2/12,C2*12,$I$3)</F>. Fill down to <Cell>E3</Cell>.</p>,
      hint: 'The negative sign flips the result.',
      success: '191.01 and 188.25.',
      seed: LN, fresh: true, select: 'E2',
      check: (c) => !c.editing && allFormulas(c, ['E2', 'E3']) && /PMT/i.test(c.raw('E2')) && Math.abs(Number(c.value('E2')) - -Fin.pmt(0.055 / 12, 60, 10000)) < 0.006 && Math.abs(Number(c.value('E3')) - -Fin.pmt(0.049 / 12, 60, 10000)) < 0.006,
      sol: { cells: { E2: '=-PMT(B2/12,C2*12,$I$3)', E3: '=-PMT(B3/12,C3*12,$I$3)' } },
    }),
    custom({
      id: 'cost', title: '2. Total cost including the fee',
      body: <p>In <Cell>F2</Cell> multiply the payment by the number of months and add the fee: <F>=E2*C2*12+D2</F>. Fill down.</p>,
      hint: 'Payments times months, plus fee.',
      success: 'Bank B costs less overall even after its fee.',
      select: 'F2',
      check: (c) => !c.editing && allFormulas(c, ['F2', 'F3']) && Math.abs(Number(c.value('F2')) - costA) < 0.01 && Math.abs(Number(c.value('F3')) - costB) < 0.01,
      sol: { cells: { F2: '=E2*C2*12+D2', F3: '=E3*C3*12+D3' } },
    }),
    task({
      id: 'sel', title: '3. Show the chosen loan',
      body: <p>In <Cell>I2</Cell> look up the total cost of the bank chosen in <Cell>I1</Cell>: <F>=XLOOKUP(I1,A2:A3,F2:F3)</F>.</p>,
      hint: 'Find I1 in the bank names.',
      success: 'Bank A for now.',
      seed: { E2: '=-PMT(B2/12,C2*12,$I$3)', E3: '=-PMT(B3/12,C3*12,$I$3)', F2: '=E2*C2*12+D2', F3: '=E3*C3*12+D3' }, select: 'I2', cells: { I2: cents(costA) }, uses: 'XLOOKUP', sol: { I2: '=XLOOKUP(I1,A2:A3,F2:F3)' },
    }),
    custom({
      id: 'pick', title: '4. Compare with the dropdown',
      body: <p>Choose <strong>Bank B</strong> in <Cell>I1</Cell>.</p>,
      hint: 'Click I1, then the arrow.',
      success: 'The total cost updates. Dropdown-driven tools like this are what clients actually use.',
      select: 'I1',
      check: (c) => c.raw('I1') === 'Bank B' && Math.abs(Number(c.value('I2')) - costB) < 0.01 && c.events.has('dropdown'),
      sol: { cells: { I1: 'Bank B' }, events: ['dropdown'] },
    }),
  ],
};

// ---------------------------------------------------------------------------
const FCF = [10000, 12000, 14000, 16000, 18000];
const DCF = { A1: 'Year', ...Object.fromEntries(FCF.flatMap((v, i) => [[`${'BCDEF'[i]}1`, String(i + 1)], [`${'BCDEF'[i]}2`, String(v)]])), A2: 'Free cash flow', H1: 'WACC', I1: '0.1', H2: 'Terminal growth', I2: '0.02', H4: 'PV of cash flows', H5: 'Terminal value', H6: 'PV of terminal value', H7: 'Enterprise value', H8: 'EV at 9% WACC' };
const PV_FCF = Fin.npv(0.1, FCF);
const TV = (18000 * 1.02) / (0.1 - 0.02);
const PV_TV = TV / 1.1 ** 5;
export const finCapDcf: LessonContent = {
  key: 'fin-cap-dcf',
  title: 'Capstone: DCF valuation',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'What is a business worth today?', (
      <p>
        A <strong>discounted cash flow</strong> valuation adds the present value of forecast free cash flows to a <strong>terminal value</strong> that captures everything after the forecast. The terminal value uses the
        growing-perpetuity formula: <strong>last cash flow × (1 + g) / (WACC − g)</strong>.
      </p>
    )),
    task({
      id: 'pv', title: '1. Present value of the forecast',
      body: <p>In <Cell>I4</Cell> discount the five cash flows: <F>=NPV(I1,B2:F2)</F>.</p>,
      hint: 'NPV starts discounting from year 1, which is right here.',
      success: 'About 51,631: the next five years in today\'s money.',
      seed: DCF, fresh: true, select: 'I4', cells: { I4: cents(PV_FCF) }, uses: 'NPV', sol: { I4: '=NPV(I1,B2:F2)' },
    }),
    task({
      id: 'tv', title: '2. Terminal value',
      body: <p>In <Cell>I5</Cell>: <F>=F2*(1+I2)/(I1-I2)</F>.</p>,
      hint: 'Last cash flow grown one year, divided by WACC minus growth.',
      success: '229,500 at the end of year 5.',
      cells: { I5: cents(TV) }, sol: { I5: '=F2*(1+I2)/(I1-I2)' },
    }),
    task({
      id: 'pvtv', title: '3. Discount the terminal value',
      body: <p>It arrives at the end of year 5, so in <Cell>I6</Cell>: <F>=I5/(1+I1)^5</F>.</p>,
      hint: 'Discount five years.',
      success: 'About 142,501. Most of the value is in the terminal value, which is why the assumptions matter.',
      cells: { I6: cents(PV_TV) }, sol: { I6: '=I5/(1+I1)^5' },
    }),
    task({
      id: 'ev', title: '4. Enterprise value',
      body: <p>In <Cell>I7</Cell> add the two present values.</p>,
      hint: '=I4+I6',
      success: 'About 194,133: the value of the business today.',
      cells: { I7: cents(PV_FCF + PV_TV) }, sol: { I7: '=I4+I6' },
    }),
    task({
      id: 'sens', title: '5. A lower discount rate',
      body: <p>In <Cell>I8</Cell> recompute the enterprise value at a 9% WACC in one formula: <F>=NPV(0.09,B2:F2)+F2*(1+I2)/(0.09-I2)/(1.09)^5</F>.</p>,
      hint: 'Same three parts with 0.09 in place of I1.',
      success: 'About 15% higher for one point off the rate. Valuations are sensitive.',
      cells: { I8: cents(Fin.npv(0.09, FCF) + (18000 * 1.02) / (0.09 - 0.02) / 1.09 ** 5) }, uses: 'NPV', sol: { I8: '=NPV(0.09,B2:F2)+F2*(1+I2)/(0.09-I2)/(1.09)^5' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const PERS = { ...lab([['Monthly income', 3200], ['Rent', 1100], ['Food', 400], ['Transport', 150], ['Other', 350]]), A7: 'Total spending', A8: 'Monthly saving', A9: 'Saving rate', A10: 'Monthly needed for goal', A11: 'Months to goal', D1: 'Goal', E1: '15000', D2: 'Years', E2: '3', D3: 'Savings rate (yearly)', E3: '0.03' };
const SAVE = 1200;
export const finCapPersonal: LessonContent = {
  key: 'fin-cap-personal',
  title: 'Capstone: personal planner',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'A budget with a goal', (
      <p>
        Income and spending are in <Cell>B1:B5</Cell>. The goal is in <Cell>E1:E3</Cell>: save 15,000 in 3 years in an account paying 3% a year. You will find how much you save now, how much you <em>need</em> to save, and
        how long the current plan takes.
      </p>
    )),
    task({
      id: 'spend', title: '1. Spending and saving',
      body: <p>In <Cell>B7</Cell> total spending (rows 2 to 5) and in <Cell>B8</Cell> income minus spending.</p>,
      hint: '=SUM(B2:B5) and =B1-B7',
      success: '2,000 spent, 1,200 saved.',
      seed: PERS, fresh: true, select: 'B7', cells: { B7: 2000, B8: 1200 }, sol: { B7: '=SUM(B2:B5)', B8: '=B1-B7' },
    }),
    task({
      id: 'rate', title: '2. Saving rate',
      body: <p>In <Cell>B9</Cell> divide saving by income.</p>,
      hint: '=B8/B1',
      success: '37.5%.',
      cells: { B9: 0.375 }, sol: { B9: '=B8/B1' },
    }),
    task({
      id: 'need', title: '3. What the goal requires',
      body: <p>In <Cell>B10</Cell> find the monthly deposit that reaches the goal (positive): <F>=-PMT(E3/12,E2*12,0,E1)</F>.</p>,
      hint: 'PV is 0, FV is the goal.',
      success: 'About 399 a month. You save far more than that.',
      cells: { B10: cents(-Fin.pmt(0.03 / 12, 36, 0, 15000)) }, uses: 'PMT', sol: { B10: '=-PMT(E3/12,E2*12,0,E1)' },
    }),
    task({
      id: 'months', title: '4. How soon at your current saving?',
      body: <p>In <Cell>B11</Cell> find the months needed saving 1,200 a month: <F>=NPER(E3/12,-B8,0,E1)</F>.</p>,
      hint: 'NPER(rate, payment, pv, fv).',
      success: 'About 12.3 months.',
      cells: { B11: within(Fin.nper(0.03 / 12, -SAVE, 0, 15000), 1e-6) }, uses: 'NPER', sol: { B11: '=NPER(E3/12,-B8,0,E1)' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const FINAL = {
  A1: 'Car loan payment', A2: 'Project NPV', A3: 'Project IRR', A4: 'Revenue variance %', A5: 'Current ratio', A6: 'Balance check',
  D1: '-8000', D2: '3000', D3: '3500', D4: '4000', F1: 'Budget', G1: '50000', F2: 'Actual', G2: '54500', F3: 'Assets', G3: '90000', F4: 'Liabilities', G4: '60000', F5: 'Equity', G5: '30000',
};
export const finFinal: LessonContent = {
  key: 'fin-final',
  title: 'Course final',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Six finance tasks', <p>Everything from the course in one sheet. Inputs are in columns D and G.</p>),
    task({
      id: 'pmt', title: '1. Car loan',
      body: <p>In <Cell>B1</Cell> find the monthly payment (positive) on 15,000 at 6% over 48 months.</p>,
      hint: '=-PMT(0.06/12,48,15000)',
      success: '352.28.',
      seed: FINAL, fresh: true, select: 'B1', cells: { B1: cents(-Fin.pmt(0.005, 48, 15000)) }, uses: 'PMT', sol: { B1: '=-PMT(0.06/12,48,15000)' },
    }),
    task({
      id: 'npv', title: '2. Project NPV',
      body: <p>Flows are in <Cell>D1:D4</Cell> (investment first). In <Cell>B2</Cell> find the NPV at 8%.</p>,
      hint: '=D1+NPV(0.08,D2:D4)',
      success: 'Positive.',
      cells: { B2: cents(-8000 + Fin.npv(0.08, [3000, 3500, 4000])) }, uses: 'NPV', sol: { B2: '=D1+NPV(0.08,D2:D4)' },
    }),
    task({
      id: 'irr', title: '3. Project IRR',
      body: <p>In <Cell>B3</Cell> find its internal rate of return.</p>,
      hint: '=IRR(D1:D4)',
      success: 'Above 8%, so accept.',
      cells: { B3: within(Fin.irr([-8000, 3000, 3500, 4000]), 1e-6) }, uses: 'IRR', sol: { B3: '=IRR(D1:D4)' },
    }),
    task({
      id: 'var', title: '4. Revenue variance',
      body: <p>In <Cell>B4</Cell> show actual (<Cell>G2</Cell>) versus budget (<Cell>G1</Cell>) as a percent of budget.</p>,
      hint: '=(G2-G1)/G1',
      success: '9%.',
      cells: { B4: 0.09 }, sol: { B4: '=(G2-G1)/G1' },
    }),
    task({
      id: 'ratio', title: '5. Current ratio',
      body: <p>In <Cell>B5</Cell> treat assets as current assets and liabilities as current liabilities: divide G3 by G4.</p>,
      hint: '=G3/G4',
      success: '1.5.',
      cells: { B5: 1.5 }, sol: { B5: '=G3/G4' },
    }),
    task({
      id: 'check', title: '6. Balance check',
      body: <p>In <Cell>B6</Cell> return "Balanced" when assets equal liabilities plus equity.</p>,
      hint: '=IF(ROUND(G3-(G4+G5),2)=0,"Balanced","ERROR")',
      success: 'Course complete.',
      cells: { B6: 'Balanced' }, uses: ['IF', 'ROUND'], sol: { B6: '=IF(ROUND(G3-(G4+G5),2)=0,"Balanced","ERROR")' },
    }),
  ],
};
void yrs;

export const FIN2 = [
  finIncome, finBalance, finCfs, finLink, finRatios, finUnit3Test,
  finColours, finChecks, finNamed, finScenario, finSensitivity, finUnit4Test,
  finCapStartup, finCapLoan, finCapDcf, finCapPersonal, finFinal,
];
