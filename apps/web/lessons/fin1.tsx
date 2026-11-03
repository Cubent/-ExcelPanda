// Excel for Finance, units 1 and 2: time value of money, budgets and forecasts.
import * as Fin from '@/components/sheet/finance';
import { custom, grid, info, task } from './dsl';
import { Cell, F } from './kbd';
import { FIN_SHEET, allFormulas, cents, col, within } from './fin-util';
import type { LessonContent } from './types';

const K = (s: string) => s; // readability marker for formula text

// ---------------------------------------------------------------------------
// Unit 1 · Time value of money
// ---------------------------------------------------------------------------
const INT = { ...grid([['Principal', 1000], ['Rate', 0.05], ['Years', 3]]), A5: 'Simple interest', A6: 'Compound balance', A7: 'Extra from compounding', A8: 'Effective rate (6% monthly)' };
export const finInterest: LessonContent = {
  key: 'fin-interest',
  title: 'Simple & compound interest',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Money grows on its own growth', (
      <>
        <p>
          <strong>Simple interest</strong> is paid only on the original amount. <strong>Compound interest</strong> is paid on the amount <em>plus</em> the interest already earned, so growth
          accelerates. The compound formula is <strong>principal × (1 + rate) ^ years</strong>.
        </p>
        <p>
          Inputs are in <Cell>B1:B3</Cell>: 1,000 at 5% for 3 years.
        </p>
      </>
    )),
    task({
      id: 'simple', title: 'Simple interest',
      body: <p>In <Cell>B5</Cell> multiply principal, rate and years: <F>=B1*B2*B3</F>.</p>,
      hint: 'Three cells multiplied together.',
      success: '150.',
      seed: INT, fresh: true, select: 'B5', cells: { B5: 150 }, sol: { B5: '=B1*B2*B3' },
    }),
    task({
      id: 'compound', title: 'Compound balance',
      body: <p>In <Cell>B6</Cell> grow the principal: <F>=B1*(1+B2)^B3</F>.</p>,
      hint: 'The ^ symbol raises to a power.',
      success: '1,157.63.',
      cells: { B6: 1157.625 }, sol: { B6: '=B1*(1+B2)^B3' },
    }),
    task({
      id: 'extra', title: 'What compounding added',
      body: <p>In <Cell>B7</Cell> find how much more compounding earned than simple interest: <F>=B6-B1-B5</F>.</p>,
      hint: 'Balance minus principal minus simple interest.',
      success: '7.63. Small over 3 years, enormous over 30.',
      cells: { B7: 7.625 }, sol: { B7: '=B6-B1-B5' },
    }),
    task({
      id: 'effect', title: 'Compounding more often',
      body: <p>A 6% rate compounded <strong>monthly</strong> really earns more than 6% a year. In <Cell>B8</Cell>: <F>=EFFECT(0.06,12)</F>.</p>,
      hint: 'EFFECT(nominal rate, periods per year).',
      success: '6.17% effective annual rate.',
      cells: { B8: within(Fin.effect(0.06, 12), 1e-6) }, uses: 'EFFECT', sol: { B8: '=EFFECT(0.06,12)' },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const finCore: LessonContent = {
  key: 'fin-core',
  title: 'PV, FV, PMT, NPER & RATE',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Five functions, one equation', (
      <>
        <p>
          Every loan and savings plan is the same equation with five parts: <strong>rate</strong>, number of periods (<strong>nper</strong>), regular payment (<strong>pmt</strong>), present value (
          <strong>pv</strong>) and future value (<strong>fv</strong>). Give Excel four and it finds the fifth.
        </p>
        <p>
          <strong>Sign matters.</strong> Money you pay out is negative, money you receive is positive. That is why PMT for a loan comes back negative.
        </p>
        <p>
          Always match the rate to the period: a yearly rate on monthly payments needs <strong>rate/12</strong> and <strong>years*12</strong>.
        </p>
      </>
    )),
    task({
      id: 'fv', title: 'FV: what will I have?',
      body: <p>You save 200 a month at 6% a year for 10 years. In <Cell>B1</Cell>: <F>=FV(0.06/12,10*12,-200)</F>.</p>,
      hint: 'Deposits are money paid out, so the payment is -200.',
      success: '32,775.87.',
      seed: { A1: 'Savings pot', A2: 'Loan payment', A3: 'Affordable loan', A4: 'Months to repay', A5: 'Yearly rate' }, fresh: true, select: 'B1',
      cells: { B1: cents(Fin.fv(0.005, 120, -200)) }, uses: 'FV', sol: { B1: '=FV(0.06/12,10*12,-200)' },
    }),
    task({
      id: 'pmt', title: 'PMT: what is the payment?',
      body: <p>A 25,000 loan at 7.5% over 5 years, paid monthly. In <Cell>B2</Cell>: <F>=PMT(0.075/12,60,25000)</F>.</p>,
      hint: 'The result is negative: it is money you pay.',
      success: '-500.95 a month.',
      cells: { B2: cents(Fin.pmt(0.075 / 12, 60, 25000)) }, uses: 'PMT', sol: { B2: '=PMT(0.075/12,60,25000)' },
    }),
    task({
      id: 'pv', title: 'PV: how much can I borrow?',
      body: <p>You can pay 400 a month for 4 years at 6%. In <Cell>B3</Cell>: <F>=PV(0.06/12,48,-400)</F>.</p>,
      hint: 'PV(rate, nper, payment).',
      success: 'About 17,032 is the most you can borrow.',
      cells: { B3: cents(Fin.pv(0.005, 48, -400)) }, uses: 'PV', sol: { B3: '=PV(0.06/12,48,-400)' },
    }),
    task({
      id: 'nper', title: 'NPER: how long?',
      body: <p>You owe 5,000 at 1.5% a month and pay 250 a month. In <Cell>B4</Cell>: <F>=NPER(0.015,-250,5000)</F>.</p>,
      hint: 'NPER(rate, payment, pv).',
      success: 'About 24 months.',
      cells: { B4: within(Fin.nper(0.015, -250, 5000), 1e-6) }, uses: 'NPER', sol: { B4: '=NPER(0.015,-250,5000)' },
    }),
    task({
      id: 'rate', title: 'RATE: what is the interest?',
      body: <p>A 9,000 loan is repaid with 36 payments of 300. In <Cell>B5</Cell> find the <em>yearly</em> rate: <F>=RATE(36,-300,9000)*12</F>.</p>,
      hint: 'RATE returns the monthly rate. Multiply by 12.',
      success: 'About 12.2% a year.',
      cells: { B5: within(Fin.rate(36, -300, 9000) * 12, 1e-6) }, uses: 'RATE', sol: { B5: '=RATE(36,-300,9000)*12' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const LOAN = { ...grid([['Loan', 12000], ['Annual rate', 0.06], ['Months', 12]]), A4: 'Payment', A5: 'Total interest' };
const FRAME = {
  ...LOAN,
  A6: 'Month', B6: 'Payment', C6: 'Interest', D6: 'Principal', E6: 'Balance',
  A7: '0', E7: '=B1',
  ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`A${8 + i}`, String(i + 1)])),
};
const PAY = Fin.pmt(0.005, 12, -12000);
const loanRow = (r: number) => ({ [`B${r}`]: '=$B$4', [`C${r}`]: `=E${r - 1}*$B$2/12`, [`D${r}`]: `=B${r}-C${r}`, [`E${r}`]: `=E${r - 1}-D${r}` });
const LOAN_ALL = Object.assign({}, ...Array.from({ length: 12 }, (_, i) => loanRow(8 + i)));
export const finLoan: LessonContent = {
  key: 'fin-loan',
  title: 'Loan schedules',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'See where every payment goes', (
      <p>
        An <strong>amortisation schedule</strong> splits each payment into <strong>interest</strong> (the balance times the monthly rate) and <strong>principal</strong> (the rest). Early payments are mostly interest;
        later ones are mostly principal. You build one row, then fill it down.
      </p>
    )),
    task({
      id: 'pay', title: 'The monthly payment',
      body: <p>In <Cell>B4</Cell> compute the payment as a positive number: <F>=PMT(B2/12,B3,-B1)</F>.</p>,
      hint: 'Make the loan negative so the payment comes out positive.',
      success: '1,032.80 a month.',
      seed: LOAN, fresh: true, select: 'B4', cells: { B4: cents(PAY) }, uses: 'PMT', sol: { B4: '=PMT(B2/12,B3,-B1)' },
    }),
    custom({
      id: 'row', title: 'Build the first row',
      body: (
        <>
          <p>
            Month 1 is row 8. Opening balance is the row above (<Cell>E7</Cell>). Fill:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Cell>B8</Cell> payment <F>=$B$4</F>
            </li>
            <li>
              <Cell>C8</Cell> interest <F>=E7*$B$2/12</F>
            </li>
            <li>
              <Cell>D8</Cell> principal <F>=B8-C8</F>
            </li>
            <li>
              <Cell>E8</Cell> balance <F>=E7-D8</F>
            </li>
          </ul>
        </>
      ),
      hint: 'The dollar signs lock the payment and rate so they survive filling down.',
      success: 'Interest 60, principal 972.80, balance 11,027.20.',
      seed: FRAME, select: 'B8',
      check: (c) => !c.editing && allFormulas(c, ['B8', 'C8', 'D8', 'E8']) && c.value('C8') === 60 && Math.abs(Number(c.value('E8')) - (12000 - (PAY - 60))) < 0.006,
      sol: { cells: loanRow(8) },
    }),
    custom({
      id: 'fill', title: 'Fill it down',
      body: <p>Copy <Cell>B8:E8</Cell> down to <Cell>row 19</Cell>. The last balance should reach zero.</p>,
      hint: 'Select B8:E8, copy, select B9:E19 and paste. Or drag the fill handle.',
      success: 'Balance 0.00 after 12 payments. Interest shrinks every month.',
      select: 'B8',
      check: (c) => !c.editing && allFormulas(c, [...col('C', 8, 19), ...col('E', 8, 19)]) && Math.abs(Number(c.value('E19'))) < 0.01 && Math.abs(Number(c.value('C9')) - Number(c.value('E8')) * 0.005) < 1e-6,
      sol: { cells: LOAN_ALL },
    }),
    task({
      id: 'total', title: 'Total interest',
      body: <p>In <Cell>B5</Cell> add up the interest column: <F>=SUM(C8:C19)</F>.</p>,
      hint: 'SUM over C8:C19.',
      success: '393.57 in total.',
      cells: { B5: cents(PAY * 12 - 12000) }, uses: 'SUM', sol: { B5: '=SUM(C8:C19)' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const NPV_DATA = { ...grid([['Year', 'Cash flow'], [0, -10000], [1, 3000], [2, 4200], [3, 5000], [4, 4000]]), D1: 'Rate', E1: '0.1', D2: 'NPV', D3: 'IRR', D4: 'Decision' };
const NPV_VAL = -10000 + Fin.npv(0.1, [3000, 4200, 5000, 4000]);
export const finNpv: LessonContent = {
  key: 'fin-npv',
  title: 'NPV & IRR',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Is the investment worth it?', (
      <>
        <p>
          <strong>NPV</strong> (net present value) discounts future cash flows to today's money and adds them up. Positive NPV means the project earns more than your required rate.
        </p>
        <p>
          <strong>IRR</strong> (internal rate of return) is the rate at which NPV would be exactly zero. Accept when IRR beats your required rate.
        </p>
        <p>
          <strong>Trap:</strong> Excel's NPV treats the first value as one period away, not today. The upfront investment (year 0) is added <em>outside</em> the function.
        </p>
      </>
    )),
    task({
      id: 'npv', title: 'Net present value',
      body: <p>In <Cell>E2</Cell> add the year-0 flow to the discounted rest: <F>=B2+NPV(E1,B3:B6)</F>.</p>,
      hint: 'NPV covers years 1 to 4 only (B3:B6).',
      success: '2,686.96.',
      seed: NPV_DATA, fresh: true, select: 'E2', cells: { E2: cents(NPV_VAL) }, uses: 'NPV', sol: { E2: '=B2+NPV(E1,B3:B6)' },
    }),
    task({
      id: 'irr', title: 'Internal rate of return',
      body: <p>In <Cell>E3</Cell> use all the flows including year 0: <F>=IRR(B2:B6)</F>.</p>,
      hint: 'IRR takes the whole range, starting with the investment.',
      success: 'About 21.2%, far above the 10% required.',
      cells: { E3: within(Fin.irr([-10000, 3000, 4200, 5000, 4000]), 1e-6) }, uses: 'IRR', sol: { E3: '=IRR(B2:B6)' },
    }),
    task({
      id: 'decide', title: 'Make the call',
      body: <p>In <Cell>E4</Cell> return "Accept" when NPV is positive, else "Reject": <F>{'=IF(E2>0,"Accept","Reject")'}</F>.</p>,
      hint: 'A positive NPV adds value.',
      success: 'Accept.',
      cells: { E4: 'Accept' }, uses: 'IF', sol: { E4: '=IF(E2>0,"Accept","Reject")' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const XDATES = ['2008-01-01', '2008-03-01', '2008-10-30', '2009-02-15', '2009-04-01'];
const XVALS = [-10000, 2750, 4250, 3250, 2750];
const XDATA = { A1: 'Date', B1: 'Amount', D1: 'Rate', E1: '0.09', D2: 'XNPV', D3: 'XIRR', ...Object.fromEntries(XDATES.flatMap((d, i) => [[`A${i + 2}`, d], [`B${i + 2}`, String(XVALS[i])]])) };
export const finXnpv: LessonContent = {
  key: 'fin-xnpv',
  title: 'XNPV & XIRR',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Cash flows rarely arrive on schedule', (
      <p>
        NPV and IRR assume equal gaps between flows. Real investments pay on specific dates. <strong>XNPV</strong> and <strong>XIRR</strong> take a list of dates, discount each flow by the exact number of days, and
        return annual figures. Unlike NPV, XNPV includes the first flow as today.
      </p>
    )),
    task({
      id: 'xnpv', title: 'XNPV',
      body: <p>Dates are in <Cell>A2:A6</Cell> and amounts in <Cell>B2:B6</Cell>. In <Cell>E2</Cell>: <F>=XNPV(E1,B2:B6,A2:A6)</F>.</p>,
      hint: 'XNPV(rate, values, dates). Values come first.',
      success: '2,086.65.',
      seed: XDATA, fresh: true, select: 'E2', cells: { E2: cents(2086.65) }, uses: 'XNPV', sol: { E2: '=XNPV(E1,B2:B6,A2:A6)' },
    }),
    task({
      id: 'xirr', title: 'XIRR',
      body: <p>In <Cell>E3</Cell> find the annual return: <F>=XIRR(B2:B6,A2:A6)</F>.</p>,
      hint: 'XIRR(values, dates).',
      success: '37.3% a year.',
      cells: { E3: within(0.373362535, 1e-4) }, uses: 'XIRR', sol: { E3: '=XIRR(B2:B6,A2:A6)' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const U1T = { A1: 'Mortgage payment', A2: 'Savings pot', A3: 'Project NPV', A4: 'Loan interest', ...grid([[''], [''], [''], ['']], 3, 0), E1: '-5000', E2: '2000', E3: '2000', E4: '2000' };
export const finUnit1Test: LessonContent = {
  key: 'fin-unit1-test',
  title: 'Unit 1 test',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Time value of money test', <p>Four tasks. Remember the sign convention and the rate/period match.</p>),
    task({
      id: 'pmt', title: '1. Mortgage payment',
      body: <p>In <Cell>B1</Cell> find the monthly payment (as a positive number) on 200,000 at 5% over 30 years.</p>,
      hint: '=-PMT(0.05/12,360,200000)',
      success: '1,073.64.',
      seed: U1T, fresh: true, select: 'B1', cells: { B1: cents(-Fin.pmt(0.05 / 12, 360, 200000)) }, uses: 'PMT', sol: { B1: '=-PMT(0.05/12,360,200000)' },
    }),
    task({
      id: 'fv', title: '2. Savings pot',
      body: <p>In <Cell>B2</Cell> find the value after saving 1,000 a year for 5 years at 4%.</p>,
      hint: '=FV(0.04,5,-1000)',
      success: '5,416.32.',
      cells: { B2: cents(Fin.fv(0.04, 5, -1000)) }, uses: 'FV', sol: { B2: '=FV(0.04,5,-1000)' },
    }),
    task({
      id: 'npv', title: '3. Project NPV',
      body: <p>The flows are in <Cell>E1:E4</Cell> (-5,000 now, then 2,000 a year for 3 years). In <Cell>B3</Cell> find the NPV at 8%.</p>,
      hint: '=E1+NPV(0.08,E2:E4)',
      success: '152.',
      cells: { B3: cents(-5000 + Fin.npv(0.08, [2000, 2000, 2000])) }, uses: 'NPV', sol: { B3: '=E1+NPV(0.08,E2:E4)' },
    }),
    task({
      id: 'interest', title: '4. Total interest',
      body: <p>In <Cell>B4</Cell> find the total interest paid on that mortgage (positive): payment times 360 minus the loan.</p>,
      hint: '=B1*360-200000',
      success: '186,511.',
      cells: { B4: cents(-Fin.pmt(0.05 / 12, 360, 200000) * 360 - 200000) }, sol: { B4: '=B1*360-200000' },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 2 · Budgets & forecasts
// ---------------------------------------------------------------------------
const BUD = { A1: 'INPUTS', A2: 'Units sold', B2: '1200', A3: 'Price', B3: '25', A4: 'Cost per unit', B4: '14', A5: 'Fixed costs', B5: '6000', A7: 'CALCULATIONS', A8: 'Revenue', A9: 'Variable costs', A10: 'Profit' };
export const finBudget: LessonContent = {
  key: 'fin-budget',
  title: 'Budget layout',
  sheet: FIN_SHEET,
  toolbar: true,
  steps: [
    info('intro', 'Inputs, calculations, outputs', (
      <>
        <p>A model people trust keeps three things apart:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Inputs</strong>: assumptions you type. Mark them in <span className="font-semibold text-[#1d4ed8]">blue</span>.
          </li>
          <li>
            <strong>Calculations</strong>: formulas that only use inputs. Black.
          </li>
          <li>
            <strong>Outputs</strong>: the answers, summarised for the reader.
          </li>
        </ul>
        <p>Never type a number into the middle of a formula. Change inputs in one place and everything follows.</p>
      </>
    )),
    task({
      id: 'calc', title: 'Calculate from the inputs',
      body: (
        <p>
          In <Cell>B8</Cell> revenue <F>=B2*B3</F>; in <Cell>B9</Cell> variable costs <F>=B2*B4</F>; in <Cell>B10</Cell> profit <F>=B8-B9-B5</F>.
        </p>
      ),
      hint: 'Reference the input cells, never retype the numbers.',
      success: 'Revenue 30,000, variable costs 16,800, profit 7,200.',
      seed: BUD, fresh: true, select: 'B8', cells: { B8: 30000, B9: 16800, B10: 7200 }, sol: { B8: '=B2*B3', B9: '=B2*B4', B10: '=B8-B9-B5' },
    }),
    custom({
      id: 'blue', title: 'Mark the inputs',
      body: <p>Give the four input cells <Cell>B2:B5</Cell> the same <strong>blue font colour</strong>, and leave the formulas alone.</p>,
      hint: 'Select B2:B5, then pick a blue font colour.',
      success: 'A reader can see at a glance what they may change.',
      select: 'B2',
      check: (c) => {
        const x = c.style('B2').color;
        return !!x && ['B3', 'B4', 'B5'].every((k) => c.style(k).color === x) && !c.style('B8').color && !c.style('B9').color && !c.style('B10').color;
      },
      sol: { styles: { B2: { color: '#1d4ed8' }, B3: { color: '#1d4ed8' }, B4: { color: '#1d4ed8' }, B5: { color: '#1d4ed8' } } },
    }),
    custom({
      id: 'flow', title: 'Change an input, watch the output',
      body: <p>Raise the <strong>Price</strong> in <Cell>B3</Cell> to <strong>28</strong>. Profit in B10 should follow.</p>,
      hint: 'Type 28 in B3.',
      success: '10,800. One input, the whole model updates.',
      select: 'B3',
      check: (c) => c.value('B3') === 28 && c.value('B10') === 10800 && !c.editing,
      sol: { cells: { B3: '28' } },
    }),
  ],
};

// ---------------------------------------------------------------------------
const VAR_ROWS = [['Revenue', 100000, 108000], ['Materials', 40000, 45000], ['Wages', 30000, 29000], ['Rent', 12000, 12000], ['Marketing', 8000, 9500]];
const VAR = grid([['Item', 'Budget', 'Actual', 'Variance', 'Var %', 'Flag'], ...VAR_ROWS]);
const flagF = (r: number) => (r === 2 ? `=IF(D2=0,"On budget",IF(D2>0,"Fav","Adv"))` : `=IF(D${r}=0,"On budget",IF(D${r}>0,"Adv","Fav"))`);
export const finVariance: LessonContent = {
  key: 'fin-variance',
  title: 'Variance analysis',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Actual versus budget', (
      <p>
        <strong>Variance</strong> is actual minus budget, in money and as a percent of budget. Whether a variance is good depends on the line: more revenue is <em>favourable</em>, more cost is{' '}
        <em>adverse</em>.
      </p>
    )),
    task({
      id: 'var', title: 'Variance in money',
      body: <p>In <Cell>D2</Cell> subtract budget from actual (<F>=C2-B2</F>) and fill down to <Cell>D6</Cell>.</p>,
      hint: 'Actual minus budget.',
      success: '8,000, 5,000, -1,000, 0, 1,500.',
      seed: VAR, fresh: true, select: 'D2', cells: { D2: 8000, D3: 5000, D4: -1000, D5: 0, D6: 1500 }, sol: Object.fromEntries([2, 3, 4, 5, 6].map((r) => [`D${r}`, `=C${r}-B${r}`])),
    }),
    task({
      id: 'pct', title: 'Variance as a percent',
      body: <p>In <Cell>E2</Cell> divide the variance by the budget (<F>=D2/B2</F>) and fill down to <Cell>E6</Cell>.</p>,
      hint: 'Variance over budget.',
      success: '8%, 12.5%, -3.3%, 0%, 18.75%.',
      cells: { E2: 0.08, E3: 0.125, E4: -1000 / 30000, E5: 0, E6: 0.1875 }, sol: Object.fromEntries([2, 3, 4, 5, 6].map((r) => [`E${r}`, `=D${r}/B${r}`])),
    }),
    task({
      id: 'flag', title: 'Favourable or adverse',
      body: (
        <>
          <p>
            Revenue is good when up; costs are good when down. Fill <Cell>F2:F6</Cell> with "Fav", "Adv" or "On budget". Revenue (row 2): <F>{'=IF(D2=0,"On budget",IF(D2>0,"Fav","Adv"))'}</F>. For the cost
            rows swap Fav and Adv.
          </p>
        </>
      ),
      hint: 'Rows 3 to 6 are costs.',
      success: 'Fav, Adv, Fav, On budget, Adv.',
      cells: { F2: 'Fav', F3: 'Adv', F4: 'Fav', F5: 'On budget', F6: 'Adv' }, uses: 'IF', sol: Object.fromEntries([2, 3, 4, 5, 6].map((r) => [`F${r}`, flagF(r)])),
    }),
  ],
};

// ---------------------------------------------------------------------------
const ROLL = grid([['Month', 'Sales'], ['Jan', 100], ['Feb', 104], ['Mar', 110], ['Apr', 108], ['May', 115], ['Jun', 120], ['Jul (f)', ''], ['Aug (f)', ''], ['Sep (f)', '']]);
const R8 = (108 + 115 + 120) / 3;
const R9 = (115 + 120 + R8) / 3;
const R10 = (120 + R8 + R9) / 3;
export const finRolling: LessonContent = {
  key: 'fin-rolling',
  title: 'Rolling forecasts',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'A forecast that keeps moving', (
      <p>
        A <strong>rolling forecast</strong> always looks a fixed number of months ahead, using the latest data. With a moving average, each new month is the average of the previous three. You do not need OFFSET: a normal
        relative reference slides one row each time you fill down.
      </p>
    )),
    task({
      id: 'jul', title: 'Forecast July',
      body: <p>In <Cell>B8</Cell> average the last three actual months: <F>=AVERAGE(B5:B7)</F>.</p>,
      hint: 'April, May and June.',
      success: '114.3.',
      seed: ROLL, fresh: true, select: 'B8', cells: { B8: within(R8, 1e-6) }, uses: 'AVERAGE', sol: { B8: '=AVERAGE(B5:B7)' },
    }),
    task({
      id: 'roll', title: 'Roll it forward',
      body: <p>Fill the formula down to <Cell>B10</Cell>. Each row averages the three rows above it, including earlier forecasts.</p>,
      hint: 'Drag the fill handle from B8 to B10.',
      success: '116.4 and 116.9.',
      cells: { B9: within(R9, 1e-6), B10: within(R10, 1e-6) }, uses: 'AVERAGE', sol: { B9: '=AVERAGE(B6:B8)', B10: '=AVERAGE(B7:B9)' },
    }),
    task({
      id: 'q3', title: 'The quarter',
      body: <p>In <Cell>B12</Cell> total the forecast quarter: <F>=SUM(B8:B10)</F>.</p>,
      hint: 'SUM over the three forecast cells.',
      success: '347.7.',
      cells: { B12: within(R8 + R9 + R10, 1e-6) }, uses: 'SUM', sol: { B12: '=SUM(B8:B10)' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const SEAS = {
  ...grid([['Year', 'Q1', 'Q2', 'Q3', 'Q4'], ['Y1', 80, 100, 120, 140], ['Y2', 88, 110, 130, 150], ['Y3', 96, 120, 140, 160]]),
  A6: 'Average', A7: 'Index', A9: 'Next year total', B9: '520', A10: 'Q1 forecast',
};
export const finSeasonality: LessonContent = {
  key: 'fin-seasonality',
  title: 'Seasonality',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Some quarters are always bigger', (
      <p>
        A <strong>seasonal index</strong> compares each quarter's average to the overall average. An index of 0.74 means that quarter normally sells 26% below average. Multiply the average quarter of next year's forecast
        by the index to get a seasonal forecast.
      </p>
    )),
    task({
      id: 'avg', title: 'Average per quarter',
      body: <p>In <Cell>B6</Cell> average the three years of Q1 (<F>=AVERAGE(B2:B4)</F>) and fill right to <Cell>E6</Cell>.</p>,
      hint: 'Fill right so the column letters change.',
      success: '88, 110, 130, 150.',
      seed: SEAS, fresh: true, select: 'B6', cells: { B6: 88, C6: 110, D6: 130, E6: 150 }, uses: 'AVERAGE', sol: Object.fromEntries(['B', 'C', 'D', 'E'].map((l) => [`${l}6`, `=AVERAGE(${l}2:${l}4)`])),
    }),
    task({
      id: 'index', title: 'The index',
      body: <p>In <Cell>B7</Cell> divide by the overall average of those four: <F>=B6/AVERAGE($B$6:$E$6)</F>, filled right.</p>,
      hint: 'Lock the overall average with dollar signs.',
      success: '0.74, 0.92, 1.09, 1.26.',
      cells: { B7: within(88 / 119.5, 1e-6), E7: within(150 / 119.5, 1e-6) }, uses: 'AVERAGE',
      sol: Object.fromEntries(['B', 'C', 'D', 'E'].map((l) => [`${l}7`, `=${l}6/AVERAGE($B$6:$E$6)`])),
    }),
    task({
      id: 'fc', title: 'Seasonal forecast',
      body: <p>Next year is forecast at 520 in total. In <Cell>B10</Cell> forecast Q1: the average quarter times the Q1 index, <F>=B9/4*B7</F>.</p>,
      hint: 'An average quarter is 520/4.',
      success: '95.7, below the average quarter, as the history says it should be.',
      cells: { B10: within((520 / 4) * (88 / 119.5), 1e-6) }, sol: { B10: '=B9/4*B7' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const CASH = {
  A1: 'Month', ...Object.fromEntries(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => [`${'BCDEFG'[i]}1`, m])),
  A2: 'Opening', B2: '5000', A3: 'Receipts', A4: 'Payments', A5: 'Closing',
  ...Object.fromEntries([12000, 13000, 11000, 14000, 15000, 16000].map((v, i) => [`${'BCDEFG'[i]}3`, String(v)])),
  ...Object.fromEntries([11000, 12500, 12000, 13500, 15500, 14000].map((v, i) => [`${'BCDEFG'[i]}4`, String(v)])),
  A7: 'Lowest balance', A8: 'Months under 6,000',
};
const CASH_SOL = Object.fromEntries(
  'BCDEFG'.split('').flatMap((l, i) => [[`${l}5`, `=${l}2+${l}3-${l}4`], ...(i > 0 ? [[`${l}2`, `=${'BCDEFG'[i - 1]}5`]] : [])]),
);
export const finCashflow: LessonContent = {
  key: 'fin-cashflow',
  title: 'Cash-flow forecast',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Profit is not cash', (
      <p>
        A business can be profitable and still run out of cash. A <strong>cash-flow forecast</strong> tracks the balance month by month: <strong>opening + receipts − payments = closing</strong>, and each month's opening
        is the previous month's closing.
      </p>
    )),
    custom({
      id: 'build', title: 'Roll the balance forward',
      body: (
        <p>
          Fill <Cell>B5:G5</Cell> with closing balances (<F>=B2+B3-B4</F>, filled right) and <Cell>C2:G2</Cell> with openings that link to the previous closing (<F>=B5</F> in C2, filled right).
        </p>
      ),
      hint: 'Opening of March is the closing of February.',
      success: 'June closes at 7,500.',
      seed: CASH, fresh: true, select: 'B5',
      check: (c) => !c.editing && allFormulas(c, [...'BCDEFG'.split('').map((l) => `${l}5`), ...'CDEFG'.split('').map((l) => `${l}2`)]) && c.value('G5') === 7500 && c.value('D5') === 5500,
      sol: { cells: CASH_SOL },
    }),
    task({
      id: 'low', title: 'The tightest month',
      body: <p>In <Cell>B7</Cell> find the lowest closing balance: <F>=MIN(B5:G5)</F>.</p>,
      hint: 'MIN over the closing row.',
      success: '5,500.',
      cells: { B7: 5500 }, uses: 'MIN', sol: { B7: '=MIN(B5:G5)' },
    }),
    task({
      id: 'warn', title: 'Count the warning months',
      body: <p>In <Cell>B8</Cell> count months closing under 6,000: <F>{'=COUNTIF(B5:G5,"<6000")'}</F>.</p>,
      hint: 'COUNTIF with a "<" criterion.',
      success: '2 months: March and May.',
      cells: { B8: 2 }, uses: 'COUNTIF', sol: { B8: '=COUNTIF(B5:G5,"<6000")' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const U2T = { ...BUD, A12: 'Break-even units' };
export const finUnit2Test: LessonContent = {
  key: 'fin-unit2-test',
  title: 'Unit 2 test',
  sheet: FIN_SHEET,
  steps: [
    info('intro', 'Budgets and forecasts test', <p>A small budget model: calculate, check variance, forecast and find break-even.</p>),
    task({
      id: 'profit', title: '1. Profit',
      body: <p>Using the inputs in B2:B5, compute revenue, variable costs and profit in <Cell>B8:B10</Cell>.</p>,
      hint: 'Same layout as the budget lesson.',
      success: '7,200.',
      seed: U2T, fresh: true, select: 'B8', cells: { B8: 30000, B9: 16800, B10: 7200 }, sol: { B8: '=B2*B3', B9: '=B2*B4', B10: '=B8-B9-B5' },
    }),
    task({
      id: 'margin', title: '2. Margin per unit',
      body: <p>In <Cell>D2</Cell> compute the contribution per unit (price minus cost per unit).</p>,
      hint: '=B3-B4',
      success: '11.',
      select: 'D2', cells: { D2: 11 }, sol: { D2: '=B3-B4' },
    }),
    task({
      id: 'be', title: '3. Break-even',
      body: <p>In <Cell>B12</Cell> compute break-even units: fixed costs divided by contribution per unit, rounded up with <strong>ROUNDUP</strong>.</p>,
      hint: '=ROUNDUP(B5/D2,0)',
      success: '546 units.',
      cells: { B12: 546 }, uses: 'ROUNDUP', sol: { B12: '=ROUNDUP(B5/D2,0)' },
    }),
    task({
      id: 'safety', title: '4. Margin of safety',
      body: <p>In <Cell>B13</Cell> show how far sales are above break-even as a share of sales: <F>=(B2-B12)/B2</F>.</p>,
      hint: 'Units sold minus break-even, over units sold.',
      success: '54.5% of sales could vanish before you lose money.',
      select: 'B13', cells: { B13: within((1200 - 546) / 1200, 1e-6) }, sol: { B13: '=(B2-B12)/B2' },
    }),
  ],
};

export const FIN1 = [finInterest, finCore, finLoan, finNpv, finXnpv, finUnit1Test, finBudget, finVariance, finRolling, finSeasonality, finCashflow, finUnit2Test];
void K;
