// Formulas & Functions, units 1 and 2: references that don't break, and logic.
import * as E from '@/components/sheet/engine';
import { custom, info, task } from './dsl';
import { Cell, F, K } from './kbd';
import type { LessonContent } from './types';

const norm = (s: string) => s.replace(/\s/g, '').toUpperCase();

const PRICES = {
  A1: 'Item', B1: 'Price', C1: 'Tax',
  A2: 'Mug', B2: '20', A3: 'Shirt', B3: '35', A4: 'Cap', B4: '15', A5: 'Bag', B5: '50',
  E1: 'Tax rate', E2: '0.2',
};

// ---------------------------------------------------------------------------
// Unit 1 · References that don't break
// ---------------------------------------------------------------------------
export const relativeAbsolute: LessonContent = {
  key: 'ff-relative-absolute',
  title: 'Relative vs absolute',
  steps: [
    info('intro', 'Why formulas break when copied', (
      <>
        <p>
          When you copy a formula down, Excel <strong>shifts</strong> every reference with it. That is called a{' '}
          <strong>relative reference</strong>, and it is usually what you want.
        </p>
        <p>
          But sometimes one cell must <strong>never move</strong>, like a single tax rate. That needs an{' '}
          <strong>absolute reference</strong>, written with dollar signs: <F>{'$E$2'}</F>.
        </p>
      </>
    )),
    custom({
      id: 'copy', title: 'Watch a formula break',
      body: (
        <>
          <p>
            The tax rate sits in <Cell>E2</Cell>. In <Cell>C2</Cell> type <F>{'=B2*E2'}</F>, then fill it down to{' '}
            <Cell>C5</Cell> with <K>Ctrl</K> + <K>D</K> (select C2:C5 first).
          </p>
          <p>Then look closely at <Cell>C3</Cell>.</p>
        </>
      ),
      hint: 'Click C2, type the formula, press Enter. Then select C2:C5 and press Ctrl + D.',
      success: 'C3 shows 0. It became =B3*E3, and E3 is empty. The tax rate moved down with the formula.',
      seed: PRICES, fresh: true, select: 'C2',
      check: (c) => norm(c.raw('C2')) === '=B2*E2' && norm(c.raw('C3')) === '=B3*E3' && norm(c.raw('C5')) === '=B5*E5',
      sol: { cells: { C2: '=B2*E2', C3: '=B3*E3', C4: '=B4*E4', C5: '=B5*E5' } },
    }),
    task({
      id: 'lock', title: 'Lock the tax rate',
      body: (
        <p>
          Edit <Cell>C2</Cell> to <F>{'=B2*$E$2'}</F>, then fill it down again. The dollar signs lock both the column and the row.
        </p>
      ),
      hint: 'The $ goes before the E and before the 2.',
      success: 'Every row now points at E2. Absolute references stay put when copied.',
      seed: { ...PRICES, C2: '=B2*E2', C3: '=B3*E3', C4: '=B4*E4', C5: '=B5*E5' },
      cells: { C2: 4, C3: 7, C4: 3, C5: 10 },
      also: (c) => norm(c.raw('C3')) === '=B3*$E$2' && norm(c.raw('C5')) === '=B5*$E$2',
      sol: { C2: '=B2*$E$2', C3: '=B3*$E$2', C4: '=B4*$E$2', C5: '=B5*$E$2' },
    }),
    task({
      id: 'change', title: 'Change the input once',
      body: (
        <p>
          The rate went up. Change <Cell>E2</Cell> to <strong>0.25</strong> and watch every row update.
        </p>
      ),
      hint: 'Click E2, type 0.25, press Enter.',
      success: 'One cell changed, four answers updated. That is the point of absolute references.',
      seed: { ...PRICES, C2: '=B2*$E$2', C3: '=B3*$E$2', C4: '=B4*$E$2', C5: '=B5*$E$2' },
      select: 'E2', cells: { E2: 0.25, C2: 5, C5: 12.5 }, plain: ['E2'],
      sol: { E2: '0.25' },
    }),
  ],
};

export const f4Key: LessonContent = {
  key: 'ff-f4-key',
  title: 'The F4 key',
  steps: [
    info('intro', 'Never type a dollar sign again', (
      <>
        <p>
          Press <K>F4</K> while the cursor is on a reference and Excel adds the dollar signs for you. Each press moves to the next
          style:
        </p>
        <p>
          <F>{'E2'}</F> → <F>{'$E$2'}</F> → <F>{'E$2'}</F> → <F>{'$E2'}</F> → back to <F>{'E2'}</F>
        </p>
        <p>
          On some laptops you need <K>Fn</K> + <K>F4</K>.
        </p>
      </>
    )),
    custom({
      id: 'press', title: 'Lock a cell with F4',
      body: (
        <>
          <p>
            In <Cell>C2</Cell> type <F>{'=B2*E2'}</F>. Do <strong>not</strong> press Enter yet. With the cursor right after{' '}
            <strong>E2</strong>, press <K>F4</K> once, then <K>Enter</K>.
          </p>
        </>
      ),
      hint: 'Type =B2*E2, press F4 (the reference becomes $E$2), then Enter.',
      success: '$E$2. The F4 key did the typing for you.',
      seed: PRICES, fresh: true, select: 'C2',
      check: (c) => norm(c.raw('C2')) === '=B2*$E$2' && c.events.has('f4') && !c.editing,
      sol: { cells: { C2: '=B2*$E$2' }, events: ['f4'] },
    }),
    task({
      id: 'fill', title: 'Copy it down',
      body: (
        <p>
          Fill <Cell>C2</Cell> down to <Cell>C5</Cell>. All four answers should now be correct.
        </p>
      ),
      hint: 'Select C2:C5 and press Ctrl + D.',
      success: '4, 7, 3, 10. Locked once, copied everywhere.',
      seed: { ...PRICES, C2: '=B2*$E$2' }, select: 'C2',
      cells: { C2: 4, C3: 7, C4: 3, C5: 10 },
      also: (c) => norm(c.raw('C5')) === '=B5*$E$2',
      sol: { C3: '=B3*$E$2', C4: '=B4*$E$2', C5: '=B5*$E$2' },
    }),
    custom({
      id: 'cycle', title: 'Cycle to a mixed reference',
      body: (
        <>
          <p>
            Mixed references lock only the row <em>or</em> the column. In <Cell>C2</Cell> type <F>{'=B2*E2'}</F>, press <K>F4</K>{' '}
            <strong>twice</strong> while the cursor is on E2, then <K>Enter</K>. You should end on <F>{'E$2'}</F>.
          </p>
        </>
      ),
      hint: 'First press gives $E$2, second gives E$2.',
      success: 'E$2 keeps the row fixed but lets the column move. You will use that in the next lesson.',
      seed: PRICES, fresh: true, select: 'C2',
      check: (c) => norm(c.raw('C2')) === '=B2*E$2' && c.events.has('f4') && !c.editing,
      sol: { cells: { C2: '=B2*E$2' }, events: ['f4'] },
    }),
  ],
};

export const namedRanges: LessonContent = {
  key: 'ff-named-ranges',
  title: 'Named ranges',
  steps: [
    info('intro', 'Give a cell a real name', (
      <>
        <p>
          <F>{'=B2*$E$2'}</F> does not tell you what E2 is. <F>{'=B2*TaxRate'}</F> does. A <strong>named range</strong> is a
          label for a cell or range, and it behaves like an absolute reference.
        </p>
        <p>
          Names cannot contain spaces and cannot look like a cell address (so <strong>A1</strong> is not allowed).
        </p>
      </>
    )),
    custom({
      id: 'define', title: 'Name a cell',
      body: (
        <p>
          Click <Cell>E2</Cell>. Then click the <strong>Name Box</strong> (top left), type <F>{'TaxRate'}</F> and press <K>Enter</K>.
        </p>
      ),
      hint: 'The Name Box is where "E2" is shown. Replace it with the word TaxRate.',
      success: 'E2 is now called TaxRate.',
      seed: PRICES, fresh: true, select: 'E2',
      check: (c) => c.data.names?.TAXRATE === 'E2' && c.events.has('define-name'),
      sol: { names: { TAXRATE: 'E2' }, events: ['define-name'] },
    }),
    task({
      id: 'use', title: 'Use the name in a formula',
      body: (
        <p>
          In <Cell>C2</Cell> type <F>{'=B2*TaxRate'}</F> and fill it down to <Cell>C5</Cell>.
        </p>
      ),
      hint: 'A name works anywhere a reference does, with no dollar signs.',
      success: 'It reads like English, and it does not move when copied.',
      seed: PRICES, select: 'C2', meta: { names: { TAXRATE: 'E2' } },
      cells: { C2: 4, C5: 10 }, uses: [],
      also: (c) => /TAXRATE/i.test(c.raw('C2')) && /TAXRATE/i.test(c.raw('C5')) && isFilled(c, ['C3', 'C4']),
      sol: { C2: '=B2*TaxRate', C3: '=B3*TaxRate', C4: '=B4*TaxRate', C5: '=B5*TaxRate' },
    }),
    custom({
      id: 'range', title: 'Name a whole range',
      body: (
        <p>
          Select <Cell>B2:B5</Cell>, click the Name Box, type <F>{'Prices'}</F> and press <K>Enter</K>.
        </p>
      ),
      hint: 'Select the four prices first, so the name covers all of them.',
      success: 'Prices now means B2:B5.',
      seed: PRICES, select: 'B2', meta: { names: { TAXRATE: 'E2' } },
      check: (c) => c.data.names?.PRICES === 'B2:B5',
      sol: { names: { PRICES: 'B2:B5' }, events: ['define-name'] },
    }),
    task({
      id: 'sum', title: 'Sum a named range',
      body: (
        <p>
          In <Cell>G1</Cell> type <F>{'=SUM(Prices)'}</F>.
        </p>
      ),
      hint: 'Use the name where you would normally type B2:B5.',
      success: '120. Much easier to read than =SUM(B2:B5).',
      seed: PRICES, select: 'G1', meta: { names: { TAXRATE: 'E2', PRICES: 'B2:B5' } },
      cells: { G1: 120 }, uses: 'SUM', also: (c) => /PRICES/i.test(c.raw('G1')),
      sol: { G1: '=SUM(Prices)' },
    }),
    custom({
      id: 'jump', title: 'Jump to a name',
      body: (
        <p>
          Names also work as shortcuts. Type <F>{'TaxRate'}</F> in the Name Box and press <K>Enter</K> to jump straight to E2.
        </p>
      ),
      hint: 'Click the Name Box, type the name, press Enter.',
      success: 'You jumped to E2 by name. In big workbooks this beats scrolling.',
      seed: PRICES, select: 'A1', meta: { names: { TAXRATE: 'E2', PRICES: 'B2:B5' } },
      check: (c) => c.events.has('name-jump') && c.activeKey === 'E2',
      sol: { events: ['name-jump'], select: 'E2' },
    }),
  ],
};

function isFilled(c: { raw(k: string): string }, keys: string[]) {
  return keys.every((k) => c.raw(k).trim().startsWith('='));
}

export const mixedReferences: LessonContent = {
  key: 'ff-mixed-references',
  title: 'Mixed references',
  steps: [
    info('intro', 'Lock the column, free the row', (
      <>
        <p>
          A <strong>mixed reference</strong> locks only one half. <F>{'$A2'}</F> keeps column A fixed. <F>{'B$1'}</F> keeps row 1
          fixed.
        </p>
        <p>It lets one formula fill a whole table. We will build a multiplication grid with a single formula.</p>
      </>
    )),
    task({
      id: 'first', title: 'Write the one formula',
      body: (
        <p>
          Numbers 1 to 3 run down column A and across row 1. In <Cell>B2</Cell> type <F>{'=$A2*B$1'}</F>.
        </p>
      ),
      hint: '$A2 locks the column (always read from A). B$1 locks the row (always read from row 1).',
      success: '1 × 1 = 1. Now let us copy it everywhere.',
      seed: { B1: '1', C1: '2', D1: '3', A2: '1', A3: '2', A4: '3' }, fresh: true, select: 'B2',
      cells: { B2: 1 }, also: (c) => norm(c.raw('B2')) === '=$A2*B$1',
      sol: { B2: '=$A2*B$1' },
    }),
    task({
      id: 'grid', title: 'Fill the whole grid',
      body: (
        <p>
          Select <Cell>B2:D4</Cell> and fill right and down: <K>Ctrl</K> + <K>R</K>, then <K>Ctrl</K> + <K>D</K>. (Or drag the corner
          handle.)
        </p>
      ),
      hint: 'Copy B2 across to D2 first, then select B2:D4 and fill down.',
      success: 'A full 3 × 3 table from one formula. Check D4: it is =$A4*D$1.',
      seed: { B1: '1', C1: '2', D1: '3', A2: '1', A3: '2', A4: '3', B2: '=$A2*B$1' }, select: 'B2',
      cells: { B2: 1, C3: 4, B4: 3, D4: 9 },
      also: (c) => norm(c.raw('D4')) === '=$A4*D$1',
      sol: { C2: '=$A2*C$1', D2: '=$A2*D$1', B3: '=$A3*B$1', C3: '=$A3*C$1', D3: '=$A3*D$1', B4: '=$A4*B$1', C4: '=$A4*C$1', D4: '=$A4*D$1' },
    }),
    task({
      id: 'change', title: 'Change a header',
      body: (
        <p>
          Change <Cell>D1</Cell> from 3 to <strong>10</strong>. The whole third column updates.
        </p>
      ),
      hint: 'Click D1, type 10, press Enter.',
      success: 'The grid is live. D4 is now 30.',
      seed: { B1: '1', C1: '2', D1: '3', A2: '1', A3: '2', A4: '3', B2: '=$A2*B$1', C2: '=$A2*C$1', D2: '=$A2*D$1', B3: '=$A3*B$1', C3: '=$A3*C$1', D3: '=$A3*D$1', B4: '=$A4*B$1', C4: '=$A4*C$1', D4: '=$A4*D$1' },
      select: 'D1', cells: { D1: 10, D4: 30 }, plain: ['D1'],
      sol: { D1: '10' },
    }),
  ],
};

const RATES_SHEET = { A1: 'Region', B1: 'Tax rate', A2: 'North', B2: '0.2', A3: 'South', B3: '0.15', A4: 'East', B4: '0.1' };
const RATES_TABLE = (
  <table className="mx-auto my-2 w-full max-w-xs overflow-hidden rounded-lg border border-[#1F4D3A]/15 text-left text-xs">
    <caption className="bg-[#1F4D3A] px-2 py-1 text-left font-semibold text-[#C7F000]">Sheet “Rates”</caption>
    <thead>
      <tr className="bg-[#1F4D3A]/8">
        <th className="px-2 py-1">A · Region</th>
        <th className="px-2 py-1">B · Tax rate</th>
      </tr>
    </thead>
    <tbody>
      {[['North', '0.2'], ['South', '0.15'], ['East', '0.1']].map(([a, b]) => (
        <tr key={a} className="border-t border-[#1F4D3A]/10">
          <td className="px-2 py-1">{a}</td>
          <td className="px-2 py-1">{b}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
const SALES3 = { A1: 'Region', B1: 'Sales', C1: 'Tax', A2: 'North', B2: '200', A3: 'South', B3: '120', A4: 'East', B4: '300' };

export const crossSheet: LessonContent = {
  key: 'ff-cross-sheet',
  title: 'Cross-sheet references',
  meta: { ext: { Rates: RATES_SHEET } },
  steps: [
    info('intro', 'Reach into another sheet', (
      <>
        <p>
          Real workbooks have many sheets. To use a cell from another sheet, put the sheet name and an exclamation mark in front:
        </p>
        <p>
          <F>{'Rates!B2'}</F>
        </p>
        <p>This lesson has a second sheet called <strong>Rates</strong>. Here is what is on it:</p>
        {RATES_TABLE}
      </>
    )),
    task({
      id: 'one', title: 'Pull in a tax rate',
      body: (
        <>
          {RATES_TABLE}
          <p>
            In <Cell>C2</Cell> multiply the sales by the North tax rate: <F>{'=B2*Rates!B2'}</F>.
          </p>
        </>
      ),
      hint: 'Rates!B2 is the North rate (0.2). 200 × 0.2 = 40.',
      success: '40. Excel read the 0.2 from the other sheet.',
      seed: SALES3, fresh: true, select: 'C2',
      cells: { C2: 40 }, also: (c) => /RATES!B2/i.test(c.raw('C2')),
      sol: { C2: '=B2*Rates!B2' },
    }),
    task({
      id: 'fill', title: 'Fill it down',
      body: (
        <p>
          Cross-sheet references shift just like normal ones. Fill <Cell>C2</Cell> down to <Cell>C4</Cell>.
        </p>
      ),
      hint: 'Both tables list North, South, East in the same order, so the rows line up.',
      success: '40, 18, 30. Each row picked up its own region.',
      seed: { ...SALES3, C2: '=B2*Rates!B2' }, select: 'C2',
      cells: { C2: 40, C3: 18, C4: 30 }, also: (c) => /RATES!B4/i.test(c.raw('C4')),
      sol: { C3: '=B3*Rates!B3', C4: '=B4*Rates!B4' },
    }),
    task({
      id: 'lookup', title: 'Look up across sheets',
      body: (
        <>
          <p>
            Relying on matching row order is risky. A lookup is safer. In <Cell>D2</Cell> type:
          </p>
          <p>
            <F>{'=XLOOKUP(A2,Rates!A2:A4,Rates!B2:B4)'}</F>
          </p>
        </>
      ),
      hint: 'Find the region (A2) in the Rates names, and return the rate next to it.',
      success: '0.2. Ranges work across sheets as well as single cells.',
      seed: SALES3, select: 'D2',
      cells: { D2: 0.2 }, uses: 'XLOOKUP', also: (c) => /RATES!/i.test(c.raw('D2')),
      sol: { D2: '=XLOOKUP(A2,Rates!A2:A4,Rates!B2:B4)' },
    }),
  ],
};

export const unit1Test: LessonContent = {
  key: 'ff-unit1-test',
  title: 'Unit 1 test',
  meta: { ext: { Rates: RATES_SHEET } },
  steps: [
    info('intro', 'References test', (
      <>
        <p>Five tasks on absolute references, names and other sheets. The price list is in A1:B4.</p>
        {RATES_TABLE}
      </>
    )),
    task({
      id: 'abs', title: '1. Lock the discount',
      body: (
        <p>
          <Cell>E2</Cell> holds a 10% discount. In <Cell>C2</Cell> write a formula for the discounted price that you can fill down
          to <Cell>C4</Cell> (use an absolute reference), then fill it.
        </p>
      ),
      hint: '=B2*(1-$E$2)',
      success: 'Correct: 18, 31.5, 13.5.',
      seed: { A1: 'Item', B1: 'Price', C1: 'After discount', A2: 'Mug', B2: '20', A3: 'Shirt', B3: '35', A4: 'Cap', B4: '15', E1: 'Discount', E2: '0.1', A5: 'Bag', B5: '0' },
      fresh: true, select: 'C2',
      cells: { C2: 18, C3: 31.5, C4: 13.5 }, also: (c) => c.raw('C4').includes('$E$2'),
      sol: { C2: '=B2*(1-$E$2)', C3: '=B3*(1-$E$2)', C4: '=B4*(1-$E$2)' },
    }),
    custom({
      id: 'name', title: '2. Name it',
      body: (
        <p>
          Give <Cell>E2</Cell> the name <F>{'Discount'}</F>.
        </p>
      ),
      hint: 'Select E2, type the name in the Name Box, press Enter.',
      success: 'Named.',
      seed: { E1: 'Discount', E2: '0.1' }, select: 'E2',
      check: (c) => c.data.names?.DISCOUNT === 'E2',
      sol: { names: { DISCOUNT: 'E2' }, events: ['define-name'] },
    }),
    task({
      id: 'use', title: '3. Use the name',
      body: (
        <p>
          In <Cell>D2</Cell> write the discounted price of B2 using the <strong>name</strong> instead of E2.
        </p>
      ),
      hint: '=B2*(1-Discount)',
      success: '18.',
      seed: { A1: 'Item', B1: 'Price', A2: 'Mug', B2: '20', E1: 'Discount', E2: '0.1' }, select: 'D2',
      meta: { names: { DISCOUNT: 'E2' } },
      cells: { D2: 18 }, also: (c) => /DISCOUNT/i.test(c.raw('D2')),
      sol: { D2: '=B2*(1-Discount)' },
    }),
    task({
      id: 'sheet', title: '4. Other sheet',
      body: (
        <p>
          <Cell>A2</Cell> says <strong>South</strong>. In <Cell>B2</Cell> pull its tax rate from the Rates sheet with a lookup.
        </p>
      ),
      hint: '=XLOOKUP(A2,Rates!A2:A4,Rates!B2:B4)',
      success: '0.15.',
      seed: { A1: 'Region', B1: 'Rate', A2: 'South' }, select: 'B2',
      cells: { B2: 0.15 }, uses: 'XLOOKUP', also: (c) => /RATES!/i.test(c.raw('B2')),
      sol: { B2: '=XLOOKUP(A2,Rates!A2:A4,Rates!B2:B4)' },
    }),
    task({
      id: 'mixed', title: '5. One formula, whole grid',
      body: (
        <p>
          Fill <Cell>B2:C3</Cell> with a <strong>single formula</strong> (fill right and down) that multiplies row labels in column
          A by column labels in row 1.
        </p>
      ),
      hint: '=$A2*B$1',
      success: 'Unit 1 complete.',
      seed: { B1: '2', C1: '5', A2: '3', A3: '4' }, fresh: true, select: 'B2',
      cells: { B2: 6, C2: 15, B3: 8, C3: 20 }, also: (c) => norm(c.raw('C3')) === '=$A3*C$1',
      sol: { B2: '=$A2*B$1', C2: '=$A2*C$1', B3: '=$A3*B$1', C3: '=$A3*C$1' },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 2 · Logic & conditions
// ---------------------------------------------------------------------------
const APPLICANTS = { A1: 'Name', B1: 'Age', C1: 'Score', A2: 'Ana', B2: '25', C2: '82', A3: 'Ben', B3: '17', C3: '90', A4: 'Cleo', B4: '30', C4: '45', A5: 'Dev', B5: '22', C5: '70' };

export const andOrNot: LessonContent = {
  key: 'ff-and-or-not',
  title: 'AND, OR, NOT',
  steps: [
    info('intro', 'Combine several tests', (
      <>
        <p>
          <strong>AND</strong> is true only if <em>every</em> test is true. <strong>OR</strong> is true if <em>any</em> test is
          true. <strong>NOT</strong> flips true and false.
        </p>
        <p>
          Applicants must be 18 or older <em>and</em> score at least 60.
        </p>
      </>
    )),
    task({
      id: 'and', title: 'AND',
      body: (
        <p>
          In <Cell>D2</Cell> type <F>{'=AND(B2>=18,C2>=60)'}</F>.
        </p>
      ),
      hint: 'Two tests inside the brackets, separated by a comma.',
      success: 'TRUE. Ana is 25 and scored 82.',
      seed: APPLICANTS, fresh: true, select: 'D2',
      cells: { D2: true }, uses: 'AND', sol: { D2: '=AND(B2>=18,C2>=60)' },
    }),
    task({
      id: 'fill', title: 'Copy it down',
      body: (
        <p>
          Fill <Cell>D2</Cell> down to <Cell>D5</Cell>.
        </p>
      ),
      hint: 'Select D2:D5 and press Ctrl + D.',
      success: 'Ben fails on age (17), Cleo on score (45).',
      seed: { ...APPLICANTS, D2: '=AND(B2>=18,C2>=60)' }, select: 'D2',
      cells: { D2: true, D3: false, D4: false, D5: true }, uses: 'AND',
      sol: { D3: '=AND(B3>=18,C3>=60)', D4: '=AND(B4>=18,C4>=60)', D5: '=AND(B5>=18,C5>=60)' },
    }),
    task({
      id: 'or', title: 'OR',
      body: (
        <p>
          Flag people for review if they are under 18 <strong>or</strong> scored under 50. In <Cell>E2</Cell> type{' '}
          <F>{'=OR(B2<18,C2<50)'}</F> and fill it down to <Cell>E5</Cell>.
        </p>
      ),
      hint: 'Ben (17) and Cleo (45) should be TRUE.',
      success: 'OR needs only one test to be true.',
      seed: APPLICANTS, select: 'E2',
      cells: { E2: false, E3: true, E4: true, E5: false }, uses: 'OR',
      sol: { E2: '=OR(B2<18,C2<50)', E3: '=OR(B3<18,C3<50)', E4: '=OR(B4<18,C4<50)', E5: '=OR(B5<18,C5<50)' },
    }),
    task({
      id: 'not', title: 'NOT',
      body: (
        <p>
          In <Cell>F2</Cell> type <F>{'=NOT(D2)'}</F>. It flips TRUE to FALSE.
        </p>
      ),
      hint: 'D2 is TRUE, so NOT(D2) is FALSE.',
      success: 'NOT is handy for "everything except".',
      seed: { ...APPLICANTS, D2: '=AND(B2>=18,C2>=60)' }, select: 'F2',
      cells: { F2: false }, uses: 'NOT', sol: { F2: '=NOT(D2)' },
    }),
    task({
      id: 'if', title: 'Put it inside IF',
      body: (
        <>
          <p>The real power is feeding AND or OR into IF. In <Cell>G2</Cell> type:</p>
          <p>
            <F>{'=IF(AND(B2>=18,C2>=60),"Admit","Reject")'}</F>
          </p>
          <p>
            Then fill down to <Cell>G5</Cell>.
          </p>
        </>
      ),
      hint: 'The first argument of IF can be any formula that returns TRUE or FALSE.',
      success: 'Admit, Reject, Reject, Admit. A real decision from two rules.',
      seed: APPLICANTS, select: 'G2',
      cells: { G2: 'Admit', G3: 'Reject', G4: 'Reject', G5: 'Admit' }, uses: ['IF', 'AND'],
      sol: Object.fromEntries([2, 3, 4, 5].map((r) => [`G${r}`, `=IF(AND(B${r}>=18,C${r}>=60),"Admit","Reject")`])),
    }),
  ],
};

const REPS = { A1: 'Rep', B1: 'Sales', A2: 'Ana', B2: '12000', A3: 'Ben', B3: '7500', A4: 'Cleo', B4: '3000', A5: 'Dev', B5: '9000' };

export const nestedIfIfs: LessonContent = {
  key: 'ff-nested-if-ifs',
  title: 'Nested IF & IFS',
  steps: [
    info('intro', 'Three or more outcomes', (
      <>
        <p>
          Commission tiers: sales of <strong>10,000+</strong> earn 10%, <strong>5,000+</strong> earn 5%, anything else earns 2%.
        </p>
        <p>One IF only picks between two results. For three you either nest IFs or use the newer IFS.</p>
      </>
    )),
    task({
      id: 'nested', title: 'Nest one IF inside another',
      body: (
        <>
          <p>
            In <Cell>C2</Cell> type <F>{'=IF(B2>=10000,0.1,IF(B2>=5000,0.05,0.02))'}</F> and fill it down to <Cell>C5</Cell>.
          </p>
          <p>Always test the biggest threshold first. Excel stops at the first true test.</p>
        </>
      ),
      hint: 'The second IF sits in the "if false" slot of the first.',
      success: '10%, 5%, 2%, 5%. Each rep landed in the right tier.',
      seed: REPS, fresh: true, select: 'C2',
      cells: { C2: 0.1, C3: 0.05, C4: 0.02, C5: 0.05 }, uses: 'IF',
      also: (c) => (c.raw('C2').match(/if\s*\(/gi)?.length ?? 0) >= 2,
      sol: Object.fromEntries([2, 3, 4, 5].map((r) => [`C${r}`, `=IF(B${r}>=10000,0.1,IF(B${r}>=5000,0.05,0.02))`])),
    }),
    task({
      id: 'ifs', title: 'The cleaner way: IFS',
      body: (
        <>
          <p>
            IFS takes pairs of <em>test, result</em> and returns the first true one. In <Cell>D2</Cell> type:
          </p>
          <p>
            <F>{'=IFS(B2>=10000,0.1,B2>=5000,0.05,TRUE,0.02)'}</F>
          </p>
          <p>
            The final <strong>TRUE</strong> is the catch-all. Fill down to <Cell>D5</Cell>. (IFS needs Excel 2019 or Microsoft 365.)
          </p>
        </>
      ),
      hint: 'No nesting and no pile of closing brackets.',
      success: 'Same answers, far easier to read.',
      seed: REPS, select: 'D2',
      cells: { D2: 0.1, D3: 0.05, D4: 0.02, D5: 0.05 }, uses: 'IFS',
      sol: Object.fromEntries([2, 3, 4, 5].map((r) => [`D${r}`, `=IFS(B${r}>=10000,0.1,B${r}>=5000,0.05,TRUE,0.02)`])),
    }),
    task({
      id: 'pay', title: 'Use the result',
      body: (
        <p>
          In <Cell>E2</Cell> work out the commission paid: sales times the rate in <Cell>D2</Cell>. Fill down.
        </p>
      ),
      hint: '=B2*D2',
      success: '1,200 for Ana. The tier lookup feeds a real payout.',
      seed: { ...REPS, D2: '=IFS(B2>=10000,0.1,B2>=5000,0.05,TRUE,0.02)', D3: '=IFS(B3>=10000,0.1,B3>=5000,0.05,TRUE,0.02)', D4: '=IFS(B4>=10000,0.1,B4>=5000,0.05,TRUE,0.02)', D5: '=IFS(B5>=10000,0.1,B5>=5000,0.05,TRUE,0.02)' },
      select: 'E2', cells: { E2: 1200, E3: 375, E4: 60, E5: 450 },
      sol: { E2: '=B2*D2', E3: '=B3*D3', E4: '=B4*D4', E5: '=B5*D5' },
    }),
    task({
      id: 'grade', title: 'Your turn: grade bands',
      body: (
        <>
          <p>
            Scores in column B: give a grade in <Cell>C2</Cell> using IFS: <strong>A</strong> for 90+, <strong>B</strong> for 75+,{' '}
            <strong>C</strong> for 60+, otherwise <strong>F</strong>. Fill it down.
          </p>
        </>
      ),
      hint: '=IFS(B2>=90,"A",B2>=75,"B",B2>=60,"C",TRUE,"F")',
      success: 'You can now build any tiered rule.',
      seed: { A1: 'Student', B1: 'Score', A2: 'Ana', B2: '92', A3: 'Ben', B3: '78', A4: 'Cleo', B4: '61', A5: 'Dev', B5: '40' }, fresh: true,
      select: 'C2', cells: { C2: 'A', C3: 'B', C4: 'C', C5: 'F' }, uses: 'IFS',
      sol: Object.fromEntries([2, 3, 4, 5].map((r) => [`C${r}`, `=IFS(B${r}>=90,"A",B${r}>=75,"B",B${r}>=60,"C",TRUE,"F")`])),
    }),
  ],
};

export const switchFn: LessonContent = {
  key: 'ff-switch',
  title: 'SWITCH',
  steps: [
    info('intro', 'Match a value to a label', (
      <>
        <p>
          When you compare <em>one cell</em> against a list of exact values, <strong>SWITCH</strong> is cleaner than a chain of IFs:
        </p>
        <p>
          <F>{'=SWITCH(value, match1, result1, match2, result2, ..., default)'}</F>
        </p>
      </>
    )),
    task({
      id: 'dept', title: 'Expand a code',
      body: (
        <>
          <p>
            Department codes live in column A. In <Cell>B2</Cell> turn <strong>HR</strong> into <strong>Human Resources</strong>,{' '}
            <strong>IT</strong> into <strong>Information Technology</strong>, <strong>FN</strong> into <strong>Finance</strong>:
          </p>
          <p>
            <F>{'=SWITCH(A2,"HR","Human Resources","IT","Information Technology","FN","Finance","Unknown")'}</F>
          </p>
        </>
      ),
      hint: 'The last value has no match before it, so it is the default.',
      success: 'Human Resources.',
      seed: { A1: 'Code', B1: 'Department', A2: 'HR', A3: 'IT', A4: 'FN', A5: 'XX' }, fresh: true, select: 'B2',
      cells: { B2: 'Human Resources' }, uses: 'SWITCH',
      sol: { B2: '=SWITCH(A2,"HR","Human Resources","IT","Information Technology","FN","Finance","Unknown")' },
    }),
    task({
      id: 'fill', title: 'Fill down and meet the default',
      body: (
        <p>
          Fill <Cell>B2</Cell> down to <Cell>B5</Cell>. <strong>XX</strong> is not in the list, so it should show the default.
        </p>
      ),
      hint: 'Select B2:B5 and press Ctrl + D.',
      success: 'Unknown for XX. The default catches everything else.',
      seed: { A1: 'Code', B1: 'Department', A2: 'HR', A3: 'IT', A4: 'FN', A5: 'XX', B2: '=SWITCH(A2,"HR","Human Resources","IT","Information Technology","FN","Finance","Unknown")' },
      select: 'B2', cells: { B3: 'Information Technology', B4: 'Finance', B5: 'Unknown' }, uses: 'SWITCH',
      sol: Object.fromEntries([3, 4, 5].map((r) => [`B${r}`, `=SWITCH(A${r},"HR","Human Resources","IT","Information Technology","FN","Finance","Unknown")`])),
    }),
    task({
      id: 'num', title: 'Numbers work too',
      body: (
        <>
          <p>
            <Cell>D2</Cell> holds a weekday number (1 to 3). In <Cell>E2</Cell> turn it into <strong>Mon</strong>, <strong>Tue</strong>{' '}
            or <strong>Wed</strong>, and show <strong>Other</strong> for anything else.
          </p>
        </>
      ),
      hint: '=SWITCH(D2,1,"Mon",2,"Tue",3,"Wed","Other")',
      success: 'Tue.',
      seed: { D1: 'Day no.', E1: 'Day', D2: '2' }, fresh: true, select: 'E2',
      cells: { E2: 'Tue' }, uses: 'SWITCH',
      sol: { E2: '=SWITCH(D2,1,"Mon",2,"Tue",3,"Wed","Other")' },
    }),
  ],
};

const LOOKUP4 = { A1: 'Item', B1: 'Price', A2: 'Pen', B2: '1.2', A3: 'Book', B3: '8.5', A4: 'Bag', B4: '25', D1: 'Find', E1: 'Price', D2: 'Book', D3: 'Desk', D4: 'Bag' };
const isErr = (v: E.Scalar) => v instanceof E.XlError;

export const iferrorIfna: LessonContent = {
  key: 'ff-iferror-ifna',
  title: 'IFERROR & IFNA',
  steps: [
    info('intro', 'Friendly errors', (
      <>
        <p>
          Errors are fine while you build, but a finished report should never show <strong>#N/A</strong> to your boss.
        </p>
        <p>
          <strong>IFNA</strong> replaces only <strong>#N/A</strong> (a lookup that found nothing). <strong>IFERROR</strong> replaces
          every error, including typos, which can hide real bugs. Prefer IFNA for lookups.
        </p>
      </>
    )),
    custom({
      id: 'break', title: 'Make the error appear',
      body: (
        <p>
          In <Cell>E2</Cell> type <F>{'=XLOOKUP(D2,A2:A4,B2:B4)'}</F> and fill it down to <Cell>E4</Cell>. <strong>Desk</strong> is not in
          the list.
        </p>
      ),
      hint: 'Select E2:E4 and press Ctrl + D.',
      success: 'E3 shows #N/A: Desk is not stocked.',
      seed: LOOKUP4, fresh: true, select: 'E2',
      check: (c) => /XLOOKUP/i.test(c.raw('E2')) && /XLOOKUP/i.test(c.raw('E4')) && isErr(c.value('E3')),
      sol: { cells: { E2: '=XLOOKUP(D2,A2:A4,B2:B4)', E3: '=XLOOKUP(D3,A2:A4,B2:B4)', E4: '=XLOOKUP(D4,A2:A4,B2:B4)' } },
    }),
    task({
      id: 'ifna', title: 'Wrap it in IFNA',
      body: (
        <>
          <p>
            Change <Cell>E2</Cell> so it shows <strong>Not stocked</strong> when nothing is found, then fill down:
          </p>
          <p>
            <F>{'=IFNA(XLOOKUP(D2,A2:A4,B2:B4),"Not stocked")'}</F>
          </p>
        </>
      ),
      hint: 'IFNA(thing_that_might_fail, what_to_show_instead).',
      success: 'Not stocked. A clear message instead of an error.',
      seed: { ...LOOKUP4, E2: '=XLOOKUP(D2,A2:A4,B2:B4)', E3: '=XLOOKUP(D3,A2:A4,B2:B4)', E4: '=XLOOKUP(D4,A2:A4,B2:B4)' }, select: 'E2',
      cells: { E2: 8.5, E3: 'Not stocked', E4: 25 }, uses: 'IFNA',
      sol: Object.fromEntries([2, 3, 4].map((r) => [`E${r}`, `=IFNA(XLOOKUP(D${r},A2:A4,B2:B4),"Not stocked")`])),
    }),
    task({
      id: 'iferror', title: 'IFERROR for everything else',
      body: (
        <p>
          <Cell>G2</Cell> holds 10 and <Cell>H2</Cell> holds 0. In <Cell>I2</Cell> divide G2 by H2 but show <strong>0</strong> if it
          fails: <F>{'=IFERROR(G2/H2,0)'}</F>.
        </p>
      ),
      hint: 'Dividing by zero gives #DIV/0!, which IFERROR catches.',
      success: '0. IFERROR works on any error type.',
      seed: { G1: 'Units', H1: 'Boxes', G2: '10', H2: '0' }, fresh: true, select: 'I2',
      cells: { I2: 0 }, uses: 'IFERROR', sol: { I2: '=IFERROR(G2/H2,0)' },
    }),
  ],
};

const SALES_IFS = {
  A1: 'Region', B1: 'Month', C1: 'Sales',
  A2: 'North', B2: 'Jan', C2: '100', A3: 'South', B3: 'Jan', C3: '80', A4: 'North', B4: 'Feb', C4: '150',
  A5: 'East', B5: 'Jan', C5: '60', A6: 'South', B6: 'Feb', C6: '120', A7: 'North', B7: 'Jan', C7: '90',
};

export const ifsFamily: LessonContent = {
  key: 'ff-ifs-family',
  title: 'SUMIFS · COUNTIFS · AVERAGEIFS',
  steps: [
    info('intro', 'More than one condition', (
      <>
        <p>
          SUMIF handles one condition. The <strong>IFS family</strong> handles many. Watch the argument order: <strong>SUMIFS</strong>{' '}
          puts the numbers to add <em>first</em>, then pairs of <em>range, condition</em>.
        </p>
        <p>
          <F>{'=SUMIFS(sum_range, range1, condition1, range2, condition2)'}</F>
        </p>
      </>
    )),
    task({
      id: 'sumifs', title: 'SUMIFS',
      body: (
        <p>
          Total sales for the <strong>North</strong> in <strong>Jan</strong>. In <Cell>F1</Cell> type{' '}
          <F>{'=SUMIFS(C2:C7,A2:A7,"North",B2:B7,"Jan")'}</F>.
        </p>
      ),
      hint: '100 + 90.',
      success: '190.',
      seed: SALES_IFS, fresh: true, select: 'F1',
      cells: { F1: 190 }, uses: 'SUMIFS', sol: { F1: '=SUMIFS(C2:C7,A2:A7,"North",B2:B7,"Jan")' },
    }),
    task({
      id: 'countifs', title: 'COUNTIFS',
      body: (
        <p>
          How many North sales happened in Jan? In <Cell>F2</Cell> type <F>{'=COUNTIFS(A2:A7,"North",B2:B7,"Jan")'}</F>. No sum range
          here, just pairs.
        </p>
      ),
      hint: 'Each pair is a range followed by its condition.',
      success: '2 rows match both conditions.',
      seed: SALES_IFS, select: 'F2',
      cells: { F2: 2 }, uses: 'COUNTIFS', sol: { F2: '=COUNTIFS(A2:A7,"North",B2:B7,"Jan")' },
    }),
    task({
      id: 'avgifs', title: 'AVERAGEIFS',
      body: (
        <p>
          Average North sales across all months. In <Cell>F3</Cell> type <F>{'=AVERAGEIFS(C2:C7,A2:A7,"North")'}</F>.
        </p>
      ),
      hint: '(100 + 150 + 90) ÷ 3.',
      success: 'About 113.33.',
      seed: SALES_IFS, select: 'F3',
      cells: { F3: 340 / 3 }, uses: 'AVERAGEIFS', sol: { F3: '=AVERAGEIFS(C2:C7,A2:A7,"North")' },
    }),
    task({
      id: 'ops', title: 'Conditions with operators',
      body: (
        <>
          <p>
            Total North sales that were <strong>at least 100</strong>. Operators go inside the quotes:
          </p>
          <p>
            <F>{'=SUMIFS(C2:C7,A2:A7,"North",C2:C7,">=100")'}</F> in <Cell>F4</Cell>.
          </p>
        </>
      ),
      hint: '100 + 150.',
      success: '250. The same range can be used as both the sum range and a condition range.',
      seed: SALES_IFS, select: 'F4',
      cells: { F4: 250 }, uses: 'SUMIFS', sol: { F4: '=SUMIFS(C2:C7,A2:A7,"North",C2:C7,">=100")' },
    }),
    task({
      id: 'maxifs', title: 'MAXIFS',
      body: (
        <p>
          Biggest North sale: in <Cell>F5</Cell> type <F>{'=MAXIFS(C2:C7,A2:A7,"North")'}</F>. MINIFS works the same way.
        </p>
      ),
      hint: 'Same shape as SUMIFS. MAXIFS needs Excel 2019 or later.',
      success: '150.',
      seed: SALES_IFS, select: 'F5',
      cells: { F5: 150 }, uses: 'MAXIFS', sol: { F5: '=MAXIFS(C2:C7,A2:A7,"North")' },
    }),
  ],
};

export const unit2Test: LessonContent = {
  key: 'ff-unit2-test',
  title: 'Unit 2 test',
  steps: [
    info('intro', 'Logic test', <p>Five tasks on IF, SWITCH, IFNA and the IFS family. Applicants and sales data are in the sheet.</p>),
    task({
      id: 'and', title: '1. Eligibility',
      body: (
        <p>
          In <Cell>D2</Cell> show <strong>Yes</strong> if the person is 18 or older <em>and</em> scored 60 or more, otherwise{' '}
          <strong>No</strong>.
        </p>
      ),
      hint: '=IF(AND(B2>=18,C2>=60),"Yes","No")',
      success: 'Yes.',
      seed: APPLICANTS, fresh: true, select: 'D2',
      cells: { D2: 'Yes' }, uses: ['IF', 'AND'], sol: { D2: '=IF(AND(B2>=18,C2>=60),"Yes","No")' },
    }),
    task({
      id: 'tiers', title: '2. Tiers',
      body: (
        <p>
          In <Cell>C2</Cell> give a bonus rate: 10% for sales of 10,000 or more, 5% for 5,000 or more, otherwise 2%. Any approach works.
        </p>
      ),
      hint: '=IFS(B2>=10000,0.1,B2>=5000,0.05,TRUE,0.02)',
      success: '10%.',
      seed: REPS, fresh: true, select: 'C2',
      cells: { C2: 0.1 }, sol: { C2: '=IFS(B2>=10000,0.1,B2>=5000,0.05,TRUE,0.02)' },
    }),
    task({
      id: 'switch', title: '3. Codes',
      body: (
        <p>
          In <Cell>B2</Cell> turn <strong>N</strong> into <strong>North</strong>, <strong>S</strong> into <strong>South</strong>, anything
          else into <strong>Other</strong>.
        </p>
      ),
      hint: '=SWITCH(A2,"N","North","S","South","Other")',
      success: 'North.',
      seed: { A1: 'Code', B1: 'Region', A2: 'N' }, fresh: true, select: 'B2',
      cells: { B2: 'North' }, uses: 'SWITCH', sol: { B2: '=SWITCH(A2,"N","North","S","South","Other")' },
    }),
    task({
      id: 'ifna', title: '4. Safe lookup',
      body: (
        <p>
          In <Cell>E2</Cell> look up <strong>Desk</strong> (cell D2) in the item list and show <strong>Not stocked</strong> when it is
          missing, using the right function for a missing lookup.
        </p>
      ),
      hint: '=IFNA(XLOOKUP(D2,A2:A4,B2:B4),"Not stocked")',
      success: 'Not stocked.',
      seed: { ...LOOKUP4, D2: 'Desk' }, fresh: true, select: 'E2',
      cells: { E2: 'Not stocked' }, uses: 'IFNA', sol: { E2: '=IFNA(XLOOKUP(D2,A2:A4,B2:B4),"Not stocked")' },
    }),
    task({
      id: 'sumifs', title: '5. Two conditions',
      body: (
        <p>
          In <Cell>F1</Cell> total the <strong>South</strong> sales in <strong>Feb</strong>.
        </p>
      ),
      hint: '=SUMIFS(C2:C7,A2:A7,"South",B2:B7,"Feb")',
      success: 'Unit 2 complete: 120.',
      seed: SALES_IFS, fresh: true, select: 'F1',
      cells: { F1: 120 }, uses: 'SUMIFS', sol: { F1: '=SUMIFS(C2:C7,A2:A7,"South",B2:B7,"Feb")' },
    }),
  ],
};
