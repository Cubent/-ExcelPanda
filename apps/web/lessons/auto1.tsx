// Excel Automation, unit 1: speed without code.
import { custom, grid, info, task } from './dsl';
import { Cell, F } from './kbd';
import { AUTO_SHEET } from './auto-util';
import type { LessonContent } from './types';

const BLUE = '#1F4D3A';

// ---------------------------------------------------------------------------
const TBL = grid([['Item', 'Qty', 'Price'], ['Pen', 10, 2.5], ['Book', 4, 12], ['Bag', 2, 30], [''], ['Item', 'Qty', 'Price'], ['Mug', 6, 8], ['Cap', 3, 15]]);
export const autoStyles: LessonContent = {
  key: 'auto-styles',
  title: 'Templates & styles',
  sheet: AUTO_SHEET,
  toolbar: true,
  steps: [
    info('intro', 'Format once, reuse forever', (
      <>
        <p>
          Consistent formatting is the cheapest automation there is. Excel gives you three layers:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Cell Styles</strong> (Home → Cell Styles) name a look, such as "Heading 1" or "Input", so one change restyles every cell that uses it.
          </li>
          <li>
            <strong>Format Painter</strong> copies a look onto other cells in one click.
          </li>
          <li>
            A <strong>template</strong> (.xltx) is a workbook with the layout, styles and formulas already in place. Every "New from template" starts from it.
          </li>
        </ul>
        <p>On the practice sheet you format cells directly with the toolbar. The idea is the same.</p>
      </>
    )),
    custom({
      id: 'header', title: 'Style the header row',
      body: <p>Select <Cell>A1:C1</Cell> and give it <strong>bold</strong>, a <strong>fill colour</strong> and a <strong>font colour</strong>.</p>,
      hint: 'Use Bold, Fill colour and Font colour in the toolbar, with A1:C1 selected.',
      success: 'That is your header style. Next, apply it to the second table.',
      seed: TBL, fresh: true, select: 'A1',
      check: (c) => ['A1', 'B1', 'C1'].every((k) => !!c.style(k).b && !!c.style(k).bg && !!c.style(k).color) && c.style('A1').bg === c.style('C1').bg,
      sol: { styles: Object.fromEntries(['A1', 'B1', 'C1'].map((k) => [k, { b: true, bg: BLUE, color: '#FFFFFF' }])) },
    }),
    custom({
      id: 'painter', title: 'Make the second table match',
      body: <p>The second table's header is in <Cell>A6:C6</Cell>. Give it exactly the same look as the first: same fill, same font colour, bold.</p>,
      hint: 'Pick the same colours again, or copy A1:C1 and paste.',
      success: 'Two tables, one look. With a Cell Style, you would change both at once.',
      select: 'A6',
      check: (c) => ['A6', 'B6', 'C6'].every((k) => !!c.style(k).b && c.style(k).bg === c.style('A1').bg && c.style(k).color === c.style('A1').color && !!c.style(k).bg),
      sol: { styles: Object.fromEntries(['A6', 'B6', 'C6'].map((k) => [k, { b: true, bg: BLUE, color: '#FFFFFF' }])) },
    }),
    custom({
      id: 'money', title: 'Format the prices',
      body: <p>Give the prices in <Cell>C2:C4</Cell> and <Cell>C7:C8</Cell> the <strong>currency</strong> format.</p>,
      hint: 'Select the cells and use the $ number-format button.',
      success: 'A template would carry this formatting too, so the next file starts finished.',
      select: 'C2',
      check: (c) => ['C2', 'C3', 'C4', 'C7', 'C8'].every((k) => c.style(k).fmt === 'currency'),
      sol: { styles: Object.fromEntries(['C2', 'C3', 'C4', 'C7', 'C8'].map((k) => [k, { fmt: 'currency' as const }])) },
    }),
    info('template', 'Saving it as a template', (
      <p>
        In Excel: <strong>File → Save As → Excel Template (*.xltx)</strong>. New workbooks made from it open as copies, so the original stays clean. Keep inputs, formulas and styles in the template; keep data out of it.
      </p>
    )),
  ],
};

// ---------------------------------------------------------------------------
const NF = {
  ...grid([['Revenue', 'Change', 'Date', 'Month', 'Units'], [1250000, -500, '', '', 12], [830000, 1200, '', '', 7], [2400000, 0, '', '', 30]]),
  C2: '2026-03-15', D2: '2026-03-15',
};
export const autoNumFmt: LessonContent = {
  key: 'auto-numfmt',
  title: 'Custom number formats',
  sheet: AUTO_SHEET,
  tools: ['numfmt'],
  steps: [
    info('intro', 'Change how a number looks, not what it is', (
      <>
        <p>
          A <strong>custom number format</strong> is a short code that controls the display. The cell still holds the real number, so formulas are unaffected. Press <strong>Number format</strong> to open the dialog (in Excel:{' '}
          <strong>Ctrl+1 → Custom</strong>).
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code>0</code> a digit that always shows; <code>#</code> a digit that shows only if needed; <code>,</code> thousands separator.
          </li>
          <li>
            A trailing comma divides by 1,000: <code>0.0,"k"</code> shows 1,234 as 1.2k; two commas for millions.
          </li>
          <li>
            Text goes in quotes: <code>0 "units"</code>.
          </li>
          <li>
            Up to four sections, separated by semicolons: <code>positive;negative;zero;text</code>.
          </li>
          <li>
            Dates: <code>dd-mmm-yy</code>, <code>mmm yyyy</code>, <code>dddd</code>.
          </li>
        </ul>
      </>
    )),
    custom({
      id: 'millions', title: 'Show millions',
      body: <p>Select <Cell>A2:A4</Cell> and apply <F>{'0.0,,"M"'}</F>. Revenue should read 1.3M, 0.8M, 2.4M.</p>,
      hint: 'Two trailing commas divide by a million.',
      success: 'The cell still holds 1,250,000. Only the display changed.',
      seed: NF, fresh: true, select: 'A2',
      check: (c) => c.display('A2') === '1.3M' && c.display('A3') === '0.8M' && c.display('A4') === '2.4M' && c.value('A2') === 1250000 && c.events.has('number-format'),
      sol: { styles: Object.fromEntries(['A2', 'A3', 'A4'].map((k) => [k, { nf: '0.0,,"M"' }])), events: ['number-format'] },
    }),
    custom({
      id: 'neg', title: 'Red negatives and a dash for zero',
      body: <p>Select <Cell>B2:B4</Cell> and apply <F>{'#,##0;[Red]-#,##0;"-"'}</F>.</p>,
      hint: 'Three sections: positive; negative; zero.',
      success: '-500 (red in Excel), 1,200 and a dash for zero.',
      select: 'B2',
      check: (c) => c.display('B2') === '-500' && c.display('B3') === '1,200' && c.display('B4') === '-' && /\[Red\]/i.test(c.style('B2').nf ?? ''),
      sol: { styles: Object.fromEntries(['B2', 'B3', 'B4'].map((k) => [k, { nf: '#,##0;[Red]-#,##0;"-"' }])), events: ['number-format'] },
    }),
    custom({
      id: 'dates', title: 'Dates your way',
      body: <p><Cell>C2</Cell> holds a date. Show it as <F>dd-mmm-yy</F> (15-Mar-26) and <Cell>D2</Cell> as <F>mmm yyyy</F> (Mar 2026).</p>,
      hint: 'Open Number format on each cell and type the code.',
      success: 'One date, two displays.',
      select: 'C2',
      check: (c) => c.display('C2') === '15-Mar-26' && c.display('D2') === 'Mar 2026',
      sol: { styles: { C2: { nf: 'dd-mmm-yy' }, D2: { nf: 'mmm yyyy' } }, events: ['number-format'] },
    }),
    custom({
      id: 'units', title: 'Add a unit label',
      body: <p>Select <Cell>E2:E4</Cell> and apply <F>{'0 "units"'}</F>. They show as 12 units but are still numbers you can add up.</p>,
      hint: 'Put the text in double quotes.',
      success: '12 units, 7 units, 30 units. A SUM of them still works.',
      select: 'E2',
      check: (c) => c.display('E2') === '12 units' && c.display('E4') === '30 units' && c.value('E2') === 12,
      sol: { styles: Object.fromEntries(['E2', 'E3', 'E4'].map((k) => [k, { nf: '0 "units"' }])), events: ['number-format'] },
    }),
  ],
};

// ---------------------------------------------------------------------------
const PS = { ...grid([[10], [20], [30]], 1, 0), A1: '=B1*2', A2: '=B2*2', A3: '=B3*2' };
const PS_PRICES = { ...PS, E1: '5', E2: '10', E3: '15', G5: '1000' };
export const autoPaste: LessonContent = {
  key: 'auto-paste',
  title: 'Paste Special mastery',
  sheet: AUTO_SHEET,
  tools: ['pastespecial'],
  steps: [
    info('intro', 'Paste is not one command', (
      <>
        <p>
          After copying (<strong>Ctrl+C</strong>), <strong>Paste Special</strong> lets you choose <em>what</em> to paste and whether to do maths while pasting:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Values</strong>: freeze formulas into their results.
          </li>
          <li>
            <strong>Formats</strong>: copy only the look.
          </li>
          <li>
            <strong>Transpose</strong>: turn a column into a row.
          </li>
          <li>
            <strong>Operation</strong>: add, subtract, multiply or divide the destination by the copied number.
          </li>
        </ul>
        <p>
          Copy cells with <strong>Ctrl+C</strong>, click the destination, then press <strong>Paste special</strong> in the toolbar.
        </p>
      </>
    )),
    custom({
      id: 'values', title: 'Paste values',
      body: (
        <p>
          <Cell>A1:A3</Cell> hold formulas. Copy them and paste them into <Cell>D1</Cell> as <strong>Values</strong>, so D1:D3 show 20, 40, 60 as plain numbers.
        </p>
      ),
      hint: 'Ctrl+C on A1:A3, click D1, Paste special → Values → OK.',
      success: 'D1:D3 are numbers, not formulas. They will not change if the inputs do.',
      seed: PS, fresh: true, select: 'A1',
      check: (c) => ['D1', 'D2', 'D3'].every((k, i) => c.raw(k) === String((i + 1) * 20)) && c.raw('A1').startsWith('=') && c.events.has('paste-special'),
      sol: { cells: { D1: '20', D2: '40', D3: '60' }, events: ['ctrl+c', 'paste-special'] },
    }),
    custom({
      id: 'transpose', title: 'Transpose',
      body: <p>Copy <Cell>B1:B3</Cell> (a column) and paste it into <Cell>F1</Cell> with <strong>Transpose</strong> ticked, making a row: 10, 20, 30.</p>,
      hint: 'Tick Transpose in the dialog.',
      success: 'F1:H1 now hold the numbers sideways.',
      select: 'B1',
      check: (c) => c.raw('F1') === '10' && c.raw('G1') === '20' && c.raw('H1') === '30' && c.raw('F2') === '' && c.events.has('paste-special'),
      sol: { cells: { F1: '10', G1: '20', H1: '30' }, events: ['ctrl+c', 'paste-special'] },
    }),
    custom({
      id: 'multiply', title: 'Scale a whole range',
      body: (
        <p>
          The prices in <Cell>E1:E3</Cell> are in thousands. Copy the <strong>1000</strong> in <Cell>G5</Cell>, select <Cell>E1:E3</Cell>, then Paste special with the operation <strong>Multiply</strong>. They become 5000, 10000, 15000.
        </p>
      ),
      hint: 'Copy G5 first. Then select E1:E3 and choose Multiply.',
      success: 'The whole range was multiplied in place. No helper column needed.',
      seed: PS_PRICES, select: 'G5',
      check: (c) => c.raw('E1') === '5000' && c.raw('E2') === '10000' && c.raw('E3') === '15000' && c.events.has('paste-special'),
      sol: { cells: { E1: '5000', E2: '10000', E3: '15000' }, events: ['ctrl+c', 'paste-special'] },
    }),
  ],
};

// ---------------------------------------------------------------------------
const SC = { ...grid([['Price'], [120], [80], [200], [60]]), E1: 'Rate', F1: '0.2' };
export const autoShortcuts: LessonContent = {
  key: 'auto-shortcuts',
  title: 'Quick Access & shortcuts',
  sheet: AUTO_SHEET,
  steps: [
    info('intro', 'Make Excel yours', (
      <>
        <p>
          The <strong>Quick Access Toolbar</strong> (QAT) is a strip of your own favourite commands above the ribbon. Right-click any command and choose <em>Add to Quick Access Toolbar</em>. The best part: Excel gives each QAT
          slot a keyboard shortcut. Tap <strong>Alt</strong>, then the slot number: the first is <strong>Alt+1</strong>, the second <strong>Alt+2</strong>, and so on.
        </p>
        <p>
          A good QAT holds the commands you use all day but that are buried in menus: <strong>Paste Values</strong>, <strong>Format Painter</strong>, <strong>Sort</strong>, <strong>Clear Formats</strong>. Before you build a macro, ask whether a QAT slot or a shortcut
          already does the job.
        </p>
        <p>The practice sheet cannot show a QAT, but it does support the real shortcuts below.</p>
      </>
    )),
    custom({
      id: 'date', title: "Today's date in one keystroke",
      body: <p>Click <Cell>C1</Cell> and press <strong>Ctrl + ;</strong>, then Enter. It types today's date as a fixed value.</p>,
      hint: 'Hold Ctrl and press the semicolon key.',
      success: 'A date that does not change tomorrow, unlike =TODAY().',
      seed: SC, fresh: true, select: 'C1',
      check: (c) => c.events.has('ctrl+;') && typeof c.value('C1') === 'number' && Number(c.value('C1')) > 40000 && !c.editing,
      sol: { cells: { C1: '2026-03-15' }, events: ['ctrl+;'] },
    }),
    custom({
      id: 'sum', title: 'AutoSum from the keyboard',
      body: <p>Click <Cell>A6</Cell>, press <strong>Alt + =</strong> and Enter. Excel writes the SUM for the column above.</p>,
      hint: 'On a Mac use Cmd+Shift+T.',
      success: '460.',
      select: 'A6',
      check: (c) => c.events.has('autosum') && /^=SUM\(/i.test(c.raw('A6')) && c.value('A6') === 460 && !c.editing,
      sol: { cells: { A6: '=SUM(A2:A5)' }, events: ['autosum'] },
    }),
    custom({
      id: 'f4', title: 'Lock a reference with F4',
      body: <p>In <Cell>B2</Cell> type <F>=A2*F1</F>, then press <strong>F4</strong> while the cursor is on F1 to make it <strong>$F$1</strong>. Enter.</p>,
      hint: 'Each F4 press cycles through $F$1, F$1, $F1, F1.',
      success: '24, with the rate locked so you can fill it down.',
      select: 'B2',
      check: (c) => c.events.has('f4') && /\$F\$1/.test(c.raw('B2')) && c.value('B2') === 24 && !c.editing,
      sol: { cells: { B2: '=A2*$F$1' }, events: ['f4'] },
    }),
    info('more', 'Shortcuts worth learning first', (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Ctrl+Shift+L</strong> filter on/off, <strong>Ctrl+T</strong> make a table, <strong>Ctrl+1</strong> format cells.
        </li>
        <li>
          <strong>Ctrl+Arrow</strong> jump to the edge of data, <strong>Ctrl+Shift+Arrow</strong> select to it.
        </li>
        <li>
          <strong>Ctrl+D</strong> fill down, <strong>Ctrl+R</strong> fill right, <strong>F2</strong> edit a cell.
        </li>
        <li>
          <strong>Alt+E, S, V</strong> still opens Paste Special on many versions.
        </li>
      </ul>
    )),
  ],
};

// ---------------------------------------------------------------------------
const GTS = grid([['Region', 'Rep', 'Sales'], ['North', 'Ana', 10], ['', 'Ben', 20], ['', 'Cy', 30], ['South', 'Di', 40], ['', 'Eve', 50]]);
const GTS_FILL = { A3: '=A2', A4: '=A3', A6: '=A5' };
const INP = { ...grid([['Input', 'Result'], [100, '=A2*2'], [200, '=A3*2'], [300, '=A4*2']]) };
export const autoGoToSpecial: LessonContent = {
  key: 'auto-gotospecial',
  title: 'Go To Special',
  sheet: AUTO_SHEET,
  tools: ['gotospecial'],
  steps: [
    info('intro', 'Act on cells by what they contain', (
      <>
        <p>
          <strong>Go To Special</strong> (F5 → Special) selects every cell of one kind in a block: <em>blanks</em>, <em>constants</em> (typed values), <em>formulas</em>, errors and more. Then you do one thing to all of them at once.
        </p>
        <p>
          On the practice sheet, select a block and press <strong>Go to special</strong>. It offers the three jobs people use it for most.
        </p>
      </>
    )),
    custom({
      id: 'blanks', title: 'Fill the blank group labels',
      body: <p>A report exported with the region only on its first row. Select <Cell>A2:A6</Cell>, press Go to special, and fill the <strong>blanks with the cell above</strong>.</p>,
      hint: 'Choose "Blanks: fill with the cell above".',
      success: 'Every row now knows its region. The new cells are formulas (=A2 and so on).',
      seed: GTS, fresh: true, select: 'A2',
      check: (c) => ['A2', 'A3', 'A4', 'A5', 'A6'].map((k) => c.value(k)).join() === 'North,North,North,South,South' && c.events.has('goto-special'),
      sol: { cells: GTS_FILL, events: ['goto-special'] },
    }),
    custom({
      id: 'values', title: 'Freeze them as values',
      body: <p>Those fill-down formulas will break if you sort. Select <Cell>A2:A6</Cell> again and use <strong>Formulas: replace with their values</strong>.</p>,
      hint: 'Same dialog, last option.',
      success: 'Plain text again, safe to sort.',
      select: 'A2',
      check: (c) => ['A2', 'A3', 'A4', 'A5', 'A6'].every((k) => !c.raw(k).startsWith('=')) && ['A2', 'A3', 'A4', 'A5', 'A6'].map((k) => c.raw(k)).join() === 'North,North,North,South,South',
      sol: { cells: { A3: 'North', A4: 'North', A6: 'South' }, events: ['goto-special'] },
    }),
    custom({
      id: 'constants', title: 'Reset the inputs, keep the formulas',
      body: <p>To reuse a model, clear its inputs but keep its calculations. Select <Cell>A2:B4</Cell> and choose <strong>Constants: clear typed values</strong>.</p>,
      hint: 'The formulas in column B must survive.',
      success: 'The inputs are gone; B2:B4 still hold =A2*2 and so on, ready for new numbers.',
      seed: INP, fresh: true, select: 'A2',
      check: (c) => ['A2', 'A3', 'A4'].every((k) => c.raw(k) === '') && c.raw('B2') === '=A2*2' && c.raw('B4') === '=A4*2' && c.events.has('goto-special'),
      sol: { cells: { A2: '', A3: '', A4: '' }, events: ['goto-special'] },
    }),
  ],
};

// ---------------------------------------------------------------------------
const U1T = { ...grid([['Region', 'Sales'], ['East', 1250000], ['', 830000], ['', 2400000]]), D1: 'Q1', D2: '=B2/1000', D3: '=B3/1000' };
export const autoUnit1Test: LessonContent = {
  key: 'auto-unit1-test',
  title: 'Unit 1 test',
  sheet: AUTO_SHEET,
  tools: ['numfmt', 'pastespecial', 'gotospecial'],
  toolbar: true,
  steps: [
    info('intro', 'Speed without code: test', <p>Four quick jobs. Use the tools instead of typing.</p>),
    custom({
      id: 'fmt', title: '1. Show sales in millions',
      body: <p>Format <Cell>B2:B4</Cell> as <F>{'0.0,,"M"'}</F>.</p>,
      hint: 'Number format dialog.',
      success: '1.3M, 0.8M, 2.4M.',
      seed: U1T, fresh: true, select: 'B2',
      check: (c) => c.display('B2') === '1.3M' && c.display('B4') === '2.4M',
      sol: { styles: Object.fromEntries(['B2', 'B3', 'B4'].map((k) => [k, { nf: '0.0,,"M"' }])), events: ['number-format'] },
    }),
    custom({
      id: 'blanks', title: '2. Fill the region',
      body: <p>Fill the blanks in <Cell>A2:A4</Cell> with the cell above.</p>,
      hint: 'Go to special → Blanks → cell above.',
      success: 'East on every row.',
      select: 'A2',
      check: (c) => ['A2', 'A3', 'A4'].every((k) => c.value(k) === 'East'),
      sol: { cells: { A3: '=A2', A4: '=A3' }, events: ['goto-special'] },
    }),
    custom({
      id: 'values', title: '3. Freeze the thousands column',
      body: <p>Replace the formulas in <Cell>D2:D3</Cell> with their values.</p>,
      hint: 'Go to special → Formulas → values.',
      success: '1250 and 830 as plain numbers.',
      select: 'D2',
      check: (c) => c.raw('D2') === '1250' && c.raw('D3') === '830',
      sol: { cells: { D2: '1250', D3: '830' }, events: ['goto-special'] },
    }),
    task({
      id: 'sum', title: '4. Total with AutoSum',
      body: <p>Click <Cell>B5</Cell> and press <strong>Alt + =</strong>, then Enter.</p>,
      hint: 'Alt+= on Windows.',
      success: 'Unit complete.',
      select: 'B5', cells: { B5: 4480000 }, uses: 'SUM', sol: { B5: '=SUM(B2:B4)' }, ev: ['autosum'],
    }),
  ],
};

export const AUTO1 = [autoStyles, autoNumFmt, autoPaste, autoShortcuts, autoGoToSpecial, autoUnit1Test];
