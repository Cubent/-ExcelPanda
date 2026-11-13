import * as E from '@/components/sheet/engine';
import { Cell, K } from './kbd';
import type { LessonContent } from './types';
import { OnlyMac, OnlyWindows } from './platform';

const SHOP = {
  A1: 'Item',
  B1: 'Qty',
  C1: 'Price',
  A2: 'Pens',
  B2: '2',
  C2: '1.5',
  A3: 'Notebooks',
  B3: '5',
  C3: '3',
  A4: 'Stickers',
  B4: '10',
  C4: '0.5',
};

const isFormula = (raw: string) => raw.trim().startsWith('=');

// ---------------------------------------------------------------------------
// Cells & ranges
// ---------------------------------------------------------------------------
export const cellsRanges: LessonContent = {
  key: 'cells-ranges',
  title: 'Cells & ranges',
  steps: [
    {
      id: 'intro',
      title: 'One cell, many cells',
      body: (
        <>
          <p>
            A single box is a <strong>cell</strong>, like <Cell>B2</Cell>. A block of cells is a <strong>range</strong>,
            written with a colon: <Cell>B2:C4</Cell> means "from B2 down to C4".
          </p>
          <p>Almost everything in Excel works on ranges, so selecting them fast is the skill to build first.</p>
        </>
      ),
    },
    {
      id: 'range',
      title: 'Select a block',
      body: (
        <p>
          Click <Cell>B2</Cell>, then hold <K>Shift</K> and use the arrow keys to select the range <Cell>B2:C4</Cell> (the
          quantities and prices).
        </p>
      ),
      hint: 'From B2: Shift + → once, then Shift + ↓ twice. Or drag with the mouse.',
      success: 'Six cells selected. The status bar shows their Sum and Average.',
      seed: SHOP,
      fresh: true,
      select: 'B2',
      check: (c) => c.selection === 'B2:C4',
    },
    {
      id: 'row',
      title: 'Select a whole row',
      body: (
        <p>
          Click the row number <Cell>3</Cell> on the left edge to select the entire row.
        </p>
      ),
      hint: 'Keyboard fans: Shift + Space selects the row of the active cell.',
      success: 'The whole row is selected, all the way across.',
      check: (c) => c.rect.r1 === 2 && c.rect.r2 === 2 && c.rect.c1 === 0 && c.rect.c2 === E.COLS - 1,
    },
    {
      id: 'ctrl-shift',
      title: 'Select to the end of the data',
      body: (
        <>
          <p>
            You are on <Cell>B2</Cell>.{' '}
            <OnlyWindows>
              Hold <K>Ctrl</K> + <K>Shift</K> and press <K>↓</K>.
            </OnlyWindows>
            <OnlyMac>
              Hold <K>⌘ Cmd</K> + <K>⌃ Control</K> + <K>Shift</K> and press <K>↓</K>.
            </OnlyMac>
          </p>
          <p>It selects everything down to the last filled cell. No dragging, even on 10,000 rows.</p>
        </>
      ),
      hint: 'Hold the modifier keys and Shift together, then tap the down arrow.',
      success: 'B2:B4 is selected: the whole column of quantities in one move.',
      select: 'B2',
      check: (c) => c.events.has('ctrl+shift+down') && c.selection === 'B2:B4',
    },
    {
      id: 'namebox',
      title: 'Go anywhere with the Name Box',
      body: (
        <p>
          Click the <strong>Name Box</strong> (top left, it shows the current cell), type <Cell>C4</Cell> and press{' '}
          <K>Enter</K>. You teleport straight there.
        </p>
      ),
      hint: 'The Name Box is the small input left of the formula bar.',
      success: 'Typing an address is the fastest way to reach a far-away cell.',
      select: 'A1',
      check: (c) => c.events.has('name-box') && c.activeKey === 'C4',
    },
    {
      id: 'all',
      title: 'Select everything',
      body: (
        <p>
          Press <K>Ctrl</K> + <K>A</K> to select the whole sheet.
        </p>
      ),
      hint: 'Hold Ctrl and tap A.',
      success: 'Everything is selected. Handy before changing a font or clearing a sheet.',
      check: (c) => c.events.has('ctrl+a') && c.rect.c2 === E.COLS - 1 && c.rect.r2 === E.ROWS - 1,
    },
    {
      id: 'home',
      title: 'Back to the start',
      body: (
        <p>
          <OnlyWindows>
            Press <K>Ctrl</K> + <K>Home</K> to jump back to <Cell>A1</Cell> from anywhere.
          </OnlyWindows>
          <OnlyMac>
            Hold <K>⌘ Cmd</K> + <K>Fn</K> and press <K>←</K> (that is Home on a MacBook) to jump back to <Cell>A1</Cell> from
            anywhere.
          </OnlyMac>
        </p>
      ),
      hint: 'Hold the modifier keys and tap Home (on a MacBook: Fn + left arrow).',
      success: 'Lost in a big sheet? The Home jump always takes you back to A1.',
      select: 'D8',
      check: (c) => c.events.has('ctrl+home') && c.activeKey === 'A1',
    },
  ],
};

// ---------------------------------------------------------------------------
// Basic math
// ---------------------------------------------------------------------------
export const basicMath: LessonContent = {
  key: 'basic-math',
  title: 'Basic math',
  steps: [
    {
      id: 'intro',
      title: 'Excel is a calculator',
      body: (
        <>
          <p>
            Start any cell with <K>=</K> and Excel treats it as a formula. Use <K>+</K> <K>-</K> <K>*</K> <K>/</K> for add,
            subtract, multiply and divide.
          </p>
          <p>The cell shows the answer. The formula stays behind it, visible in the formula bar.</p>
        </>
      ),
    },
    {
      id: 'add',
      title: 'Add two numbers',
      body: (
        <p>
          In <Cell>A1</Cell> type <strong>=12+8</strong> and press <K>Enter</K>.
        </p>
      ),
      hint: 'Start with the equals sign, or Excel will treat it as plain text.',
      success: '20. You wrote a formula.',
      seed: {},
      fresh: true,
      select: 'A1',
      check: (c) => isFormula(c.raw('A1')) && c.value('A1') === 20 && !c.editing,
    },
    {
      id: 'multiply',
      title: 'Multiply',
      body: (
        <p>
          In <Cell>A2</Cell> type <strong>=6*7</strong>. The star <K>*</K> means multiply.
        </p>
      ),
      hint: 'Shift + 8 gives you the star on most keyboards.',
      success: '42. The star multiplies and the slash divides.',
      select: 'A2',
      check: (c) => isFormula(c.raw('A2')) && c.value('A2') === 42 && !c.editing,
    },
    {
      id: 'divide',
      title: 'Divide',
      body: (
        <p>
          In <Cell>A3</Cell> type <strong>=100/4</strong>.
        </p>
      ),
      hint: 'The forward slash is next to the right Shift key on most keyboards.',
      success: '25. Dividing by zero would show #DIV/0! instead.',
      select: 'A3',
      check: (c) => isFormula(c.raw('A3')) && c.value('A3') === 25 && !c.editing,
    },
    {
      id: 'refs',
      title: 'Use cells, not numbers',
      body: (
        <>
          <p>
            Real sheets use <strong>cell references</strong>. <Cell>B1</Cell> holds 10 and <Cell>B2</Cell> holds 4. In{' '}
            <Cell>C1</Cell> type <strong>=B1*B2</strong>.
          </p>
        </>
      ),
      hint: 'Type =B1*B2, or type = and click B1, type *, then click B2.',
      success: '40, pulled from two other cells.',
      seed: { B1: '10', B2: '4' },
      fresh: true,
      select: 'C1',
      check: (c) => isFormula(c.raw('C1')) && c.value('C1') === 40 && !c.editing,
    },
    {
      id: 'live',
      title: 'Change the input, the answer follows',
      body: (
        <p>
          Change <Cell>B1</Cell> to <strong>20</strong>. Watch <Cell>C1</Cell> update on its own.
        </p>
      ),
      hint: 'Click B1, type 20, press Enter.',
      success: '80. You never touched the formula. That is why spreadsheets beat calculators.',
      seed: { B1: '10', B2: '4', C1: '=B1*B2' },
      select: 'B1',
      check: (c) => c.value('B1') === 20 && c.value('C1') === 80 && !c.editing,
    },
    {
      id: 'order',
      title: 'Order of operations',
      body: (
        <>
          <p>
            Excel does multiplication before addition, like maths class. In <Cell>D1</Cell> type <strong>=2+3*4</strong>.
            What do you get?
          </p>
          <p>
            Now fix it with brackets: in <Cell>D2</Cell> type <strong>=(2+3)*4</strong>.
          </p>
        </>
      ),
      hint: 'D1 should show 14 and D2 should show 20.',
      success: 'Brackets go first. Use them whenever you need a different order.',
      seed: {},
      fresh: true,
      select: 'D1',
      check: (c) => c.value('D1') === 14 && c.value('D2') === 20 && isFormula(c.raw('D1')) && isFormula(c.raw('D2')) && !c.editing,
    },
    {
      id: 'percent',
      title: 'Percentages',
      body: (
        <p>
          A percent sign works inside formulas. In <Cell>A5</Cell> type <strong>=200*15%</strong> to find 15% of 200.
        </p>
      ),
      hint: 'Shift + 5 gives you the percent sign.',
      success: '30. Excel reads 15% as 0.15.',
      seed: {},
      fresh: true,
      select: 'A5',
      check: (c) => isFormula(c.raw('A5')) && c.value('A5') === 30 && !c.editing,
    },
    {
      id: 'fill',
      title: 'Copy a formula down',
      body: (
        <>
          <p>
            <Cell>C1</Cell> doubles <Cell>B1</Cell>. Select <Cell>C1:C3</Cell> and press <K>Ctrl</K> + <K>D</K> to fill the
            formula down.
          </p>
          <p>The references shift row by row: C2 becomes =B2*2, C3 becomes =B3*2.</p>
        </>
      ),
      hint: 'Click C1, Shift + ↓ twice, then Ctrl + D. Or drag the small square in the corner of C1.',
      success: 'One formula, copied down. This saves hours on real data.',
      seed: { B1: '3', B2: '5', B3: '8', C1: '=B1*2' },
      fresh: true,
      select: 'C1',
      check: (c) =>
        isFormula(c.raw('C2')) && isFormula(c.raw('C3')) && c.value('C2') === 10 && c.value('C3') === 16,
    },
  ],
};

// ---------------------------------------------------------------------------
// SUM & AVERAGE
// ---------------------------------------------------------------------------
const SCORES = { A1: 'Week 1', B1: '12', A2: 'Week 2', B2: '8', A3: 'Week 3', B3: '15', A4: 'Week 4', B4: '20', A5: 'Week 5', B5: '5' };

export const sumAverage: LessonContent = {
  key: 'sum-average',
  title: 'SUM & AVERAGE',
  steps: [
    {
      id: 'intro',
      title: 'Functions do the heavy lifting',
      body: (
        <>
          <p>
            A <strong>function</strong> is a ready-made formula. You give it a range and it returns an answer. Here are five
            weeks of sales in <Cell>B1:B5</Cell>.
          </p>
          <p>Typing =B1+B2+B3+B4+B5 works, but there is a much better way.</p>
        </>
      ),
    },
    {
      id: 'sum',
      title: 'SUM',
      body: (
        <p>
          Click <Cell>B6</Cell> and type <strong>=SUM(B1:B5)</strong>.
        </p>
      ),
      hint: 'SUM, open bracket, B1, colon, B5, close bracket.',
      success: '60. SUM adds every number in the range.',
      seed: SCORES,
      fresh: true,
      select: 'B6',
      check: (c) => isFormula(c.raw('B6')) && c.value('B6') === 60 && !c.editing,
    },
    {
      id: 'average',
      title: 'AVERAGE',
      body: (
        <p>
          In <Cell>B7</Cell> type <strong>=AVERAGE(B1:B5)</strong>.
        </p>
      ),
      hint: 'Same shape as SUM, different name.',
      success: '12. The average of the five weeks.',
      seed: { ...SCORES, B6: '=SUM(B1:B5)' },
      select: 'B7',
      check: (c) => isFormula(c.raw('B7')) && c.value('B7') === 12 && !c.editing,
    },
    {
      id: 'minmax',
      title: 'MIN and MAX',
      body: (
        <p>
          In <Cell>D1</Cell> type <strong>=MIN(B1:B5)</strong> for the worst week, and in <Cell>D2</Cell> type{' '}
          <strong>=MAX(B1:B5)</strong> for the best.
        </p>
      ),
      hint: 'D1 should show 5 and D2 should show 20.',
      success: 'Worst week 5, best week 20.',
      seed: SCORES,
      select: 'D1',
      check: (c) => isFormula(c.raw('D1')) && isFormula(c.raw('D2')) && c.value('D1') === 5 && c.value('D2') === 20 && !c.editing,
    },
    {
      id: 'count',
      title: 'COUNT',
      body: (
        <p>
          How many numbers are there? In <Cell>D3</Cell> type <strong>=COUNT(B1:B5)</strong>.
        </p>
      ),
      hint: 'COUNT only counts cells that contain numbers, not text.',
      success: '5 numbers. COUNT ignores the text labels in column A.',
      seed: SCORES,
      select: 'D3',
      check: (c) => isFormula(c.raw('D3')) && c.value('D3') === 5 && !c.editing,
    },
    {
      id: 'autosum',
      title: 'AutoSum shortcut',
      body: (
        <>
          <p>
            Click <Cell>B6</Cell> and press <K>Alt</K> + <K>=</K>. Excel writes the SUM for you and guesses the range.
          </p>
          <p>
            Press <K>Enter</K> to accept it.
          </p>
        </>
      ),
      hint: 'Hold Alt, tap the equals key, then press Enter.',
      success: 'The fastest SUM there is. Memorise it.',
      seed: SCORES,
      fresh: true,
      select: 'B6',
      check: (c) => c.events.has('autosum') && isFormula(c.raw('B6')) && c.value('B6') === 60 && !c.editing,
    },
    {
      id: 'point',
      title: 'Build a formula with the arrow keys',
      body: (
        <>
          <p>
            Click <Cell>D6</Cell> and type <strong>=SUM(</strong>. Now, instead of typing a range, point at it: press <K>←</K>{' '}
            twice and <K>↑</K> once to land on <Cell>B5</Cell>.
          </p>
          <p>
            Hold <K>Shift</K> and press <K>↑</K> four times to stretch up to <Cell>B1</Cell>. Type <strong>)</strong> and press{' '}
            <K>Enter</K>.
          </p>
        </>
      ),
      hint: 'Type =SUM( then ← ← ↑ lands on B5. Then Shift + ↑ four times, close the bracket, Enter.',
      success: 'No typing of cell names needed. This is how pros build formulas.',
      seed: SCORES,
      select: 'D6',
      check: (c) => c.events.has('point-arrow') && isFormula(c.raw('D6')) && c.value('D6') === 60 && !c.editing,
    },
  ],
};

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------
const PRICES = {
  A1: 'Product',
  B1: 'Price',
  C1: 'Margin',
  A2: 'Coffee',
  B2: '4.5',
  C2: '0.25',
  A3: 'Tea',
  B3: '3',
  C3: '0.3',
  A4: 'Cake',
  B4: '5.75',
  C4: '0.4',
};

export const formatting: LessonContent = {
  key: 'formatting',
  title: 'Formatting',
  toolbar: true,
  steps: [
    {
      id: 'intro',
      title: 'Make it readable',
      body: (
        <>
          <p>
            Numbers and text look the same until you format them. Good formatting tells the reader what to look at first.
          </p>
          <p>The formatting toolbar is switched on for this lesson. Most things also have a keyboard shortcut.</p>
        </>
      ),
    },
    {
      id: 'bold',
      title: 'Bold the headers',
      body: (
        <p>
          Select <Cell>A1:C1</Cell> and press <K>Ctrl</K> + <K>B</K>.
        </p>
      ),
      hint: 'Click A1, Shift + → twice, then Ctrl + B.',
      success: 'Headers stand out now.',
      seed: PRICES,
      fresh: true,
      select: 'A1',
      check: (c) => !!c.style('A1').b && !!c.style('B1').b && !!c.style('C1').b,
    },
    {
      id: 'currency',
      title: 'Currency',
      body: (
        <p>
          Select <Cell>B2:B4</Cell> and press <K>Ctrl</K> + <K>Shift</K> + <K>$</K> to show them as money.
        </p>
      ),
      hint: 'Shift + 4 gives you the dollar sign on a US keyboard.',
      success: 'The cell value is still 4.5. Only the way it looks changed.',
      seed: PRICES,
      select: 'B2',
      check: (c) => ['B2', 'B3', 'B4'].every((k) => c.style(k).fmt === 'currency'),
    },
    {
      id: 'percent',
      title: 'Percent',
      body: (
        <p>
          Select <Cell>C2:C4</Cell> and press <K>Ctrl</K> + <K>Shift</K> + <K>%</K>. 0.25 becomes 25%.
        </p>
      ),
      hint: 'Shift + 5 gives you the percent sign.',
      success: 'Percent format multiplies by 100 for display only.',
      seed: PRICES,
      select: 'C2',
      check: (c) => ['C2', 'C3', 'C4'].every((k) => c.style(k).fmt === 'percent'),
    },
    {
      id: 'center',
      title: 'Align the text',
      body: (
        <p>
          Select <Cell>B1:C1</Cell> and click the <strong>center align</strong> button in the toolbar.
        </p>
      ),
      hint: 'It is the button with the centered lines, next to the left and right align buttons.',
      success: 'Headers sit over their numbers now.',
      seed: PRICES,
      select: 'B1',
      check: (c) => c.style('B1').align === 'center' && c.style('C1').align === 'center',
    },
    {
      id: 'fill',
      title: 'Add a fill colour',
      body: (
        <p>
          Select <Cell>A1:C1</Cell> and pick a <strong>fill colour</strong> from the toolbar (the paint bucket).
        </p>
      ),
      hint: 'Look for the paint bucket icon and choose any colour.',
      success: 'A coloured header row is the classic table look.',
      seed: PRICES,
      select: 'A1',
      check: (c) => !!c.style('A1').bg && !!c.style('B1').bg && !!c.style('C1').bg,
    },
    {
      id: 'autofit',
      title: 'Fit the column to its content',
      body: (
        <p>
          Hover over the line between column headers <Cell>A</Cell> and <Cell>B</Cell> and <strong>double-click</strong> it.
          The column snaps to the widest text.
        </p>
      ),
      hint: 'The cursor turns into a left-right arrow when you are on the line.',
      success: 'No more cut-off text.',
      seed: { ...PRICES, A5: 'Chocolate croissant with extra almond' },
      select: 'A1',
      check: (c) => c.events.has('autofit'),
    },
  ],
};

// ---------------------------------------------------------------------------
// Unit 1 test
// ---------------------------------------------------------------------------
const ORDERS = {
  A1: 'Product',
  B1: 'Units',
  C1: 'Price',
  D1: 'Revenue',
  A2: 'Mug',
  B2: '10',
  C2: '8',
  A3: 'Shirt',
  B3: '4',
  C3: '20',
  A4: 'Cap',
  B4: '6',
  C4: '12',
};

export const unit1Test: LessonContent = {
  key: 'unit1-test',
  title: 'Unit 1 test',
  steps: [
    {
      id: 'intro',
      title: 'Show what you know',
      body: (
        <>
          <p>
            Five quick tasks on everything from Excel Basics. There is no extra help on the screen, but you can still use hints.
          </p>
          <p>
            Here is a small order sheet. Revenue is units times price.
          </p>
        </>
      ),
    },
    {
      id: 'revenue',
      title: '1. Revenue',
      body: (
        <p>
          In <Cell>D2</Cell> write a formula for revenue (units times price). Do not type the answer.
        </p>
      ),
      hint: '=B2*C2',
      success: 'Correct: 80.',
      seed: ORDERS,
      fresh: true,
      select: 'D2',
      check: (c) => isFormula(c.raw('D2')) && c.value('D2') === 80 && !c.editing,
    },
    {
      id: 'fill',
      title: '2. Copy it down',
      body: (
        <p>
          Fill the formula down to <Cell>D4</Cell>.
        </p>
      ),
      hint: 'Select D2:D4 and press Ctrl + D.',
      success: 'All three rows calculated.',
      seed: { ...ORDERS, D2: '=B2*C2' },
      select: 'D2',
      check: (c) => c.value('D3') === 80 && c.value('D4') === 72 && isFormula(c.raw('D3')) && isFormula(c.raw('D4')),
    },
    {
      id: 'total',
      title: '3. Total revenue',
      body: (
        <p>
          In <Cell>D5</Cell> add up the revenue column with a function.
        </p>
      ),
      hint: '=SUM(D2:D4)',
      success: 'Total revenue: 232.',
      seed: { ...ORDERS, D2: '=B2*C2', D3: '=B3*C3', D4: '=B4*C4' },
      select: 'D5',
      check: (c) => /sum/i.test(c.raw('D5')) && c.value('D5') === 232 && !c.editing,
    },
    {
      id: 'avg',
      title: '4. Average price',
      body: (
        <p>
          In <Cell>C5</Cell> find the average price of the three products.
        </p>
      ),
      hint: '=AVERAGE(C2:C4)',
      success: 'Average price: about 13.33.',
      seed: { ...ORDERS, D2: '=B2*C2', D3: '=B3*C3', D4: '=B4*C4', D5: '=SUM(D2:D4)' },
      select: 'C5',
      check: (c) => /average/i.test(c.raw('C5')) && typeof c.value('C5') === 'number' && Math.abs((c.value('C5') as number) - 40 / 3) < 0.001 && !c.editing,
    },
    {
      id: 'format',
      title: '5. Make it look right',
      body: (
        <p>
          Bold the header row <Cell>A1:D1</Cell> and show <Cell>D2:D5</Cell> as currency.
        </p>
      ),
      hint: 'Ctrl + B for bold. Ctrl + Shift + $ for currency.',
      success: 'Unit 1 complete.',
      seed: { ...ORDERS, D2: '=B2*C2', D3: '=B3*C3', D4: '=B4*C4', D5: '=SUM(D2:D4)' },
      select: 'A1',
      check: (c) => ['A1', 'B1', 'C1', 'D1'].every((k) => !!c.style(k).b) && ['D2', 'D3', 'D4', 'D5'].every((k) => c.style(k).fmt === 'currency'),
    },
  ],
};
