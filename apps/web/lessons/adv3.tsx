// Advanced Formulas, unit 5: text, regex, debugging, performance, error-proofing, and the final test.
import { custom, grid, info, task } from './dsl';
import { Cell, F } from './kbd';
import { ROWS, SALES, SHEET, revenue, sortRows, spill } from './adv-util';
import type { LessonContent } from './types';

const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);

// ---------------------------------------------------------------------------
// Unit 5 · Text, regex & errors
// ---------------------------------------------------------------------------
export const textSplitLesson: LessonContent = {
  key: 'adv-textsplit',
  title: 'TEXTSPLIT, TEXTBEFORE & TEXTAFTER',
  sheet: SHEET,
  steps: [
    info('intro', 'Take text apart with one formula', (
      <>
        <p>
          <strong>TEXTSPLIT</strong> cuts text at a separator and spills the pieces. <strong>TEXTBEFORE</strong> and <strong>TEXTAFTER</strong> return what sits before or after a
          marker. Together they replace most of the old LEFT/MID/FIND tricks and the Text to Columns tool, and they stay live.
        </p>
      </>
    )),
    spill({
      id: 'split', title: 'Split at a separator',
      body: <p>Split <strong>Lopez, Ana</strong> into two cells: <F>{'=TEXTSPLIT("Lopez, Ana",", ")'}</F> in <Cell>G2</Cell>.</p>,
      hint: 'The second argument is the separator (comma and a space).',
      success: 'Lopez in G2 and Ana in H2.',
      seed: {}, fresh: true, at: 'G2', expect: [['Lopez', 'Ana']], exact: true, uses: ['TEXTSPLIT'], sol: { G2: '=TEXTSPLIT("Lopez, Ana",", ")' },
    }),
    spill({
      id: 'grid', title: 'Columns and rows at once',
      body: (
        <>
          <p>
            Use a second separator for new <em>rows</em>. Split <strong>a,b;c,d</strong> by comma into columns and by semicolon into rows:
          </p>
          <p>
            <F>{'=TEXTSPLIT("a,b;c,d",",",";")'}</F>
          </p>
        </>
      ),
      hint: 'Third argument = the row separator.',
      success: 'A 2 × 2 grid.',
      seed: {}, fresh: true, at: 'G2', expect: [['a', 'b'], ['c', 'd']], exact: true, uses: ['TEXTSPLIT'], sol: { G2: '=TEXTSPLIT("a,b;c,d",",",";")' },
    }),
    task({
      id: 'count', title: 'Count the words',
      body: <p>A sentence is in <Cell>A2</Cell>. Count its words: <F>{'=COLUMNS(TEXTSPLIT(A2," "))'}</F> in <Cell>G2</Cell>.</p>,
      hint: 'Split on spaces, then count the pieces.',
      success: '4 words.',
      seed: grid([['Sentence'], ['the quick brown fox']]), fresh: true, select: 'G2', cells: { G2: 4 }, uses: ['COLUMNS', 'TEXTSPLIT'], sol: { G2: '=COLUMNS(TEXTSPLIT(A2," "))' },
    }),
    custom({
      id: 'beforeafter', title: 'Before and after a marker',
      body: (
        <>
          <p>
            An email is in <Cell>A2</Cell>. In <Cell>G2</Cell> get the part <strong>before</strong> the @ with <F>{'=TEXTBEFORE(A2,"@")'}</F>, and in <Cell>G3</Cell> the part{' '}
            <strong>after</strong> it with <F>{'=TEXTAFTER(A2,"@")'}</F>.
          </p>
        </>
      ),
      hint: 'Same shape for both: text, then the marker.',
      success: 'ana and mail.com.',
      seed: grid([['Email'], ['ana@mail.com']]), fresh: true, select: 'G2',
      check: (c) => c.value('G2') === 'ana' && c.value('G3') === 'mail.com' && /TEXTBEFORE/i.test(c.raw('G2')) && /TEXTAFTER/i.test(c.raw('G3')) && !c.editing,
      sol: { cells: { G2: '=TEXTBEFORE(A2,"@")', G3: '=TEXTAFTER(A2,"@")' } },
    }),
    task({
      id: 'last', title: 'The last piece: negative instance',
      body: (
        <>
          <p>
            A file name is in <Cell>A2</Cell>. A negative instance counts from the end. Get the extension after the <em>last</em> dot:
          </p>
          <p>
            <F>{'=TEXTAFTER(A2,".",-1)'}</F>
          </p>
        </>
      ),
      hint: 'Instance -1 means the last match.',
      success: 'xlsx, even though there are several dots.',
      seed: grid([['File'], ['report.final.v2.xlsx']]), fresh: true, select: 'G2', cells: { G2: 'xlsx' }, uses: ['TEXTAFTER'], sol: { G2: '=TEXTAFTER(A2,".",-1)' },
    }),
    spill({
      id: 'ignore', title: 'Skip empty pieces',
      body: (
        <>
          <p>
            <strong>a,,b,c</strong> has an empty slot. The fourth argument <F>{'TRUE'}</F> ignores empties (the third, row separator, is left blank):
          </p>
          <p>
            <F>{'=TEXTSPLIT("a,,b,c",",",,TRUE)'}</F>
          </p>
        </>
      ),
      hint: 'Two commas in a row leave the row separator empty.',
      success: 'a, b, c with no gap.',
      seed: {}, fresh: true, at: 'G2', expect: [['a', 'b', 'c']], exact: true, uses: ['TEXTSPLIT'], sol: { G2: '=TEXTSPLIT("a,,b,c",",",,TRUE)' },
    }),
  ],
};

export const regexLesson: LessonContent = {
  key: 'adv-regex',
  title: 'Regular expressions',
  sheet: SHEET,
  steps: [
    info('intro', 'Patterns, not positions', (
      <>
        <p>
          A <strong>regular expression</strong> (regex) describes a pattern of text, like "three digits, a dash, four digits". Excel for Microsoft 365 now has three regex functions:{' '}
          <F>{'REGEXTEST'}</F>, <F>{'REGEXEXTRACT'}</F> and <F>{'REGEXREPLACE'}</F>. They need a recent Microsoft 365 build (they are not in Excel 2021 or earlier).
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <F>{'\\d'}</F> a digit · <F>{'\\S'}</F> any non-space · <F>{'+'}</F> one or more · <F>{'{3}'}</F> exactly three
          </li>
          <li>
            <F>{'( )'}</F> groups, reused as <F>{'$1'}</F>, <F>{'$2'}</F> in a replacement
          </li>
          <li>Matching is case-sensitive unless you pass 1 as the last argument.</li>
        </ul>
        <p>Regex results are always text. Wrap them in VALUE to get numbers.</p>
      </>
    )),
    spill({
      id: 'test', title: 'REGEXTEST: does it match?',
      body: (
        <>
          <p>
            Four entries are in <Cell>A2:A5</Cell>. Flag the ones that look like an email address (no spaces, an @, a dot after it):
          </p>
          <p>
            <F>{'=REGEXTEST(A2:A5,"^\\S+@\\S+\\.\\S+$")'}</F>
          </p>
        </>
      ),
      hint: '^ is the start of the text and $ the end.',
      success: 'TRUE, FALSE, TRUE, FALSE.',
      seed: grid([['Entry'], ['ana@mail.com'], ['not an email'], ['ben@work.org'], ['x@y']]), fresh: true, at: 'G2', expect: [[true], [false], [true], [false]], exact: true, uses: ['REGEXTEST'],
      sol: { G2: '=REGEXTEST(A2:A5,"^\\S+@\\S+\\.\\S+$")' },
    }),
    task({
      id: 'extract', title: 'REGEXEXTRACT: pull out a pattern',
      body: (
        <>
          <p>
            Take the phone number out of the sentence in <Cell>A2</Cell>:
          </p>
          <p>
            <F>{'=REGEXEXTRACT(A2,"\\d{3}-\\d{4}")'}</F>
          </p>
        </>
      ),
      hint: 'Three digits, a dash, four digits.',
      success: '555-0101.',
      seed: grid([['Text'], ['Call 555-0101 after lunch']]), fresh: true, select: 'G2', cells: { G2: '555-0101' }, uses: ['REGEXEXTRACT'], sol: { G2: '=REGEXEXTRACT(A2,"\\d{3}-\\d{4}")' },
    }),
    task({
      id: 'replace', title: 'REGEXREPLACE: clean up',
      body: (
        <>
          <p>
            Delete every run of digits from <Cell>A2</Cell>:
          </p>
          <p>
            <F>{'=REGEXREPLACE(A2,"\\d+","")'}</F>
          </p>
        </>
      ),
      hint: '\\d+ means one or more digits.',
      success: 'abc.',
      seed: grid([['Text'], ['a1b22c333']]), fresh: true, select: 'G2', cells: { G2: 'abc' }, uses: ['REGEXREPLACE'], sol: { G2: '=REGEXREPLACE(A2,"\\d+","")' },
    }),
    task({
      id: 'groups', title: 'Capture groups: reorder a date',
      body: (
        <>
          <p>
            Brackets capture parts, and <F>{'$1'}</F>, <F>{'$2'}</F>, <F>{'$3'}</F> reuse them in any order. Turn <strong>2026/03/15</strong> into <strong>15-03-2026</strong>:
          </p>
          <p>
            <F>{'=REGEXREPLACE(A2,"(\\d+)/(\\d+)/(\\d+)","$3-$2-$1")'}</F>
          </p>
          <p>
            (The date is stored as text. Regex reads the stored value, so a cell Excel has already turned into a real date would be read as its serial number.)
          </p>
        </>
      ),
      hint: 'Group 1 is the year, 2 the month, 3 the day.',
      success: '15-03-2026.',
      seed: grid([['Date'], ['2026/03/15']]), fresh: true, select: 'G2', cells: { G2: '15-03-2026' }, uses: ['REGEXREPLACE'], sol: { G2: '=REGEXREPLACE(A2,"(\\d+)/(\\d+)/(\\d+)","$3-$2-$1")' },
    }),
    spill({
      id: 'all', title: 'Extract every match',
      body: (
        <>
          <p>
            Return mode <F>{'1'}</F> gives <em>all</em> matches as a list. Every number in the sentence in <Cell>A2</Cell>:
          </p>
          <p>
            <F>{'=REGEXEXTRACT(A2,"\\d+",1)'}</F>
          </p>
        </>
      ),
      hint: 'Mode 0 is the first match, 1 is all matches, 2 is the capture groups.',
      success: '12, 7 and 305, as text. Add VALUE() around it if you need numbers.',
      seed: grid([['Text'], ['Order 12, item 7 and 305']]), fresh: true, at: 'G2', expect: [['12'], ['7'], ['305']], exact: true, uses: ['REGEXEXTRACT'], sol: { G2: '=REGEXEXTRACT(A2,"\\d+",1)' },
    }),
  ],
};

const SC = grid([['Name', 'Score'], ['Ana', 62], ['Ben', 45], ['Cleo', 88], ['Dev', 51], ['Eli', 30], ['Fay', 74], ['Gus', 49], ['Hal', 90]]);
const scores = [62, 45, 88, 51, 30, 74, 49, 90];
const names = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fay', 'Gus', 'Hal'];
const over50 = scores.filter((s) => s > 50);

export const debuggingLesson: LessonContent = {
  key: 'adv-debug',
  title: 'Debugging long formulas',
  sheet: SHEET,
  steps: [
    info('intro', 'Find the broken piece', (
      <>
        <p>Long formulas fail in one small place. A reliable routine:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            <strong>Read it</strong> with <F>{'FORMULATEXT'}</F> in a nearby cell.
          </li>
          <li>
            <strong>Test the pieces</strong> in their own cells (in Excel, select part of a formula and press <strong>F9</strong>).
          </li>
          <li>
            Check <strong>range sizes match</strong> and arguments are in the right <strong>order</strong>.
          </li>
          <li>
            <strong>Rewrite with LET</strong> so each step has a name.
          </li>
        </ol>
        <p>
          The scores are in <Cell>A1:B9</Cell>.
        </p>
      </>
    )),
    task({
      id: 'text', title: 'Show a formula as text',
      body: <p><Cell>G1</Cell> holds a formula. In <Cell>G2</Cell> display its text with <F>{'=FORMULATEXT(G1)'}</F>.</p>,
      hint: 'FORMULATEXT takes a cell reference.',
      success: 'You can read formulas side by side with their results.',
      seed: { ...SC, G1: '=SUM(B2:B9)' }, fresh: true, select: 'G2', cells: { G2: '=SUM(B2:B9)' }, uses: ['FORMULATEXT'], sol: { G2: '=FORMULATEXT(G1)' },
    }),
    spill({
      id: 'size', title: 'Bug 1: ranges of different sizes',
      body: (
        <p>
          <Cell>G2</Cell> should list the names scoring above 50 but shows <strong>#VALUE!</strong>. Look at the ranges: one is a row short. Fix it.
        </p>
      ),
      hint: 'FILTER needs both ranges to be the same height. The formula uses A2:A9 and B2:B8.',
      success: 'The two ranges now line up, and the list appears.',
      seed: { ...SC, G2: '=FILTER(A2:A9,B2:B8>50)' }, fresh: true, at: 'G2', expect: names.filter((_, i) => scores[i] > 50).map((n) => [n]), exact: true, uses: ['FILTER'],
      sol: { G2: '=FILTER(A2:A9,B2:B9>50)' },
    }),
    task({
      id: 'swap', title: 'Bug 2: arguments in the wrong order',
      body: (
        <p>
          <Cell>G2</Cell> should return <strong>Ben</strong>'s score but returns <strong>#N/A</strong>. The look-in and return ranges are swapped. Fix it.
        </p>
      ),
      hint: 'XLOOKUP(find, look_in, return). Look in the names, return the scores.',
      success: '45.',
      seed: { ...SC, G2: '=XLOOKUP("Ben",B2:B9,A2:A9)' }, fresh: true, select: 'G2', cells: { G2: 45 }, uses: ['XLOOKUP'], sol: { G2: '=XLOOKUP("Ben",A2:A9,B2:B9)' },
    }),
    task({
      id: 'let', title: 'Refactor with LET',
      body: (
        <>
          <p>
            <Cell>G2</Cell> averages the scores above 50 but repeats the same FILTER twice. Rewrite it with <strong>LET</strong> so the FILTER appears only once and the answer is
            the same.
          </p>
        </>
      ),
      hint: '=LET(hi,FILTER(B2:B9,B2:B9>50),SUM(hi)/COUNT(hi))',
      success: 'Same answer, half the work, and it reads clearly.',
      seed: { ...SC, G2: '=SUM(FILTER(B2:B9,B2:B9>50))/COUNT(FILTER(B2:B9,B2:B9>50))' }, fresh: true, select: 'G2',
      cells: { G2: sum(over50) / over50.length }, uses: ['LET'], also: (c) => (c.raw('G2').match(/FILTER\(/gi)?.length ?? 0) === 1,
      sol: { G2: '=LET(hi,FILTER(B2:B9,B2:B9>50),SUM(hi)/COUNT(hi))' },
    }),
    task({
      id: 'calc', title: 'Bug 3: nothing to return',
      body: (
        <>
          <p>
            <Cell>G2</Cell> adds the scores of a student called Zed, who does not exist, and shows <strong>#CALC!</strong>. Make it show <strong>0</strong> instead by giving FILTER a
            third argument.
          </p>
        </>
      ),
      hint: '=SUM(FILTER(B2:B9,A2:A9="Zed",0))',
      success: '0. FILTER\'s "if empty" argument handles the no-match case.',
      seed: { ...SC, G2: '=SUM(FILTER(B2:B9,A2:A9="Zed"))' }, fresh: true, select: 'G2', cells: { G2: 0 }, uses: ['FILTER'], sol: { G2: '=SUM(FILTER(B2:B9,A2:A9="Zed",0))' },
    }),
  ],
};

const PERF = { ...grid([['Item', 'Value'], ['a', 10], ['b', 20], ['c', 30], ['d', 40], ['e', 50], ['f', 60], ['g', 70]]) };
const CODES = grid([['Code', 'Name'], ['A1', 'Apple'], ['B2', 'Banana'], ['C3', 'Cherry'], ['D4', 'Date']]);
const LOOK_SEED = {
  ...CODES,
  E1: 'Look up', E2: 'C3', E3: 'A1', E4: 'D4', E5: 'B2',
  G2: '=VLOOKUP(E2,A2:B5,2,FALSE)', G3: '=VLOOKUP(E3,A2:B5,2,FALSE)', G4: '=VLOOKUP(E4,A2:B5,2,FALSE)', G5: '=VLOOKUP(E5,A2:B5,2,FALSE)',
};

export const performanceLesson: LessonContent = {
  key: 'adv-performance',
  title: 'Faster workbooks',
  sheet: SHEET,
  steps: [
    info('intro', 'Make big workbooks recalculate quickly', (
      <>
        <p>Slow workbooks nearly always have one of these problems:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Volatile functions</strong> (OFFSET, INDIRECT, NOW, TODAY, RAND, RANDARRAY, RANDBETWEEN) that recalculate on every change, dragging along everything that depends on them
          </li>
          <li>The <strong>same heavy calculation repeated</strong> inside one formula (use LET)</li>
          <li>Hundreds of lookups that could be <strong>one</strong> spilling formula</li>
          <li>Ranges far larger than the data (whole columns) inside slow functions</li>
        </ul>
      </>
    )),
    task({
      id: 'offset', title: 'Remove OFFSET',
      body: <p><Cell>G2</Cell> sums a range using OFFSET. Replace it with a plain range that gives the same answer.</p>,
      hint: '=SUM(B2:B6)',
      success: '150, with no volatility.',
      seed: { ...PERF, G2: '=SUM(OFFSET(B1,1,0,5,1))' }, fresh: true, select: 'G2', cells: { G2: 150 }, also: (c) => !/OFFSET|INDIRECT/i.test(c.raw('G2')), sol: { G2: '=SUM(B2:B6)' },
    }),
    task({
      id: 'indirect', title: 'Remove INDIRECT',
      body: <p><Cell>G2</Cell> reads row 4 with INDIRECT. Replace it with INDEX (not volatile).</p>,
      hint: '=INDEX(B1:B8,4)',
      success: '30.',
      seed: { ...PERF, G2: '=INDIRECT("B"&4)' }, fresh: true, select: 'G2', cells: { G2: 30 }, uses: ['INDEX'], also: (c) => !/INDIRECT|OFFSET/i.test(c.raw('G2')), sol: { G2: '=INDEX(B1:B8,4)' },
    }),
    task({
      id: 'let', title: 'Calculate once with LET',
      body: <p><Cell>G2</Cell> adds up the same range three times. Rewrite it with LET so SUM(B2:B8) appears once.</p>,
      hint: '=LET(t,SUM(B2:B8),IF(t>100,t*0.1,t*0.05))',
      success: '28: same answer, one calculation.',
      seed: { ...PERF, G2: '=IF(SUM(B2:B8)>100,SUM(B2:B8)*0.1,SUM(B2:B8)*0.05)' }, fresh: true, select: 'G2', cells: { G2: 28 }, uses: ['LET'],
      also: (c) => (c.raw('G2').match(/SUM\(/gi)?.length ?? 0) === 1, sol: { G2: '=LET(t,SUM(B2:B8),IF(t>100,t*0.1,t*0.05))' },
    }),
    spill({
      id: 'one', title: 'Four lookups, one formula',
      body: (
        <>
          <p>
            <Cell>G2:G5</Cell> each hold their own VLOOKUP. Delete G3:G5, then replace G2 with <strong>one</strong> XLOOKUP that looks up the whole list <Cell>E2:E5</Cell> and spills.
          </p>
        </>
      ),
      hint: '=XLOOKUP(E2:E5,A2:A5,B2:B5)',
      success: 'Four names from one formula. Fewer formulas means less to recalculate.',
      seed: LOOK_SEED, fresh: true, at: 'G2', expect: [['Cherry'], ['Apple'], ['Date'], ['Banana']], exact: true, uses: ['XLOOKUP'], sol: { G2: '=XLOOKUP(E2:E5,A2:A5,B2:B5)', G3: '', G4: '', G5: '' },
    }),
  ],
};

const TOTALS = grid([['Item', 'Sales', 'Visits'], ['a', 100, 4], ['b', 80, 0], ['c', 60, 3], ['d', 40, 0], ['e', 90, 6]]);
const MESSY = grid([['Name'], ['Ana'], [''], ['Ben'], [''], ['Cleo']]);
for (const k of Object.keys(MESSY)) if (MESSY[k] === '') delete MESSY[k];

export const errorProofing: LessonContent = {
  key: 'adv-error-proofing',
  title: 'Error-proofing',
  sheet: SHEET,
  steps: [
    info('intro', 'Formulas that survive bad data', (
      <>
        <p>
          Real data has gaps, zeros and surprises. Dynamic-array formulas add new errors to know: <strong>#SPILL!</strong> (something is in the way), <strong>#CALC!</strong> (an empty result such as a
          FILTER with no match) and <strong>#N/A</strong> (not found). Defensive habits:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Give FILTER and XLOOKUP a fallback argument</li>
          <li>Use IFERROR / IFNA at the <strong>edge</strong> of a formula, not around everything</li>
          <li>Check inputs with ISNUMBER, ISBLANK before using them</li>
          <li>Leave room for results to spill and grow</li>
        </ul>
      </>
    )),
    task({
      id: 'filter', title: 'A FILTER that may find nothing',
      body: (
        <>
          <p>
            Show the items with sales above 500, or a message if there are none. In <Cell>G2</Cell>:
          </p>
          <p>
            <F>{'=IFERROR(FILTER(A2:A6,B2:B6>500),"nothing above 500")'}</F>
          </p>
        </>
      ),
      hint: 'IFERROR catches the #CALC! from an empty FILTER.',
      success: 'A friendly message instead of #CALC!.',
      seed: TOTALS, fresh: true, select: 'G2', cells: { G2: 'nothing above 500' }, uses: ['IFERROR', 'FILTER'], sol: { G2: '=IFERROR(FILTER(A2:A6,B2:B6>500),"nothing above 500")' },
    }),
    spill({
      id: 'divide', title: 'Divide safely, row by row',
      body: (
        <>
          <p>
            Sales per visit for every row. Two rows have zero visits. Handle every error in the whole array at once:
          </p>
          <p>
            <F>{'=IFERROR(B2:B6/C2:C6,0)'}</F>
          </p>
        </>
      ),
      hint: 'IFERROR works element by element on arrays.',
      success: '25, 0, 20, 0, 15: zeros instead of #DIV/0!.',
      seed: TOTALS, fresh: true, at: 'G2', expect: [[25], [0], [20], [0], [15]], exact: true, uses: ['IFERROR'], sol: { G2: '=IFERROR(B2:B6/C2:C6,0)' },
    }),
    task({
      id: 'default', title: 'A lookup with a default, using LET',
      body: (
        <>
          <p>
            Find "Zed" in column A and return his sales, or <strong>"not found"</strong>. Name the position first so it is not calculated twice:
          </p>
          <p>
            <F>{'=LET(r,XMATCH("Zed",A2:A6),IF(ISNA(r),"not found",INDEX(B2:B6,r)))'}</F>
          </p>
        </>
      ),
      hint: 'ISNA(r) is TRUE when the lookup failed.',
      success: 'not found.',
      seed: TOTALS, fresh: true, select: 'G2', cells: { G2: 'not found' }, uses: ['LET', 'ISNA'], sol: { G2: '=LET(r,XMATCH("Zed",A2:A6),IF(ISNA(r),"not found",INDEX(B2:B6,r)))' },
    }),
    task({
      id: 'guard', title: 'Check the input first',
      body: (
        <>
          <p>
            <Cell>A2</Cell> should hold a number but holds text. Double it only if it is a number, otherwise show <strong>check input</strong>:
          </p>
          <p>
            <F>{'=IF(ISNUMBER(A2),A2*2,"check input")'}</F>
          </p>
        </>
      ),
      hint: 'ISNUMBER returns FALSE for text.',
      success: 'check input.',
      seed: grid([['Value'], ['abc']]), fresh: true, select: 'G2', cells: { G2: 'check input' }, uses: ['ISNUMBER'], sol: { G2: '=IF(ISNUMBER(A2),A2*2,"check input")' },
    }),
    spill({
      id: 'blanks', title: 'Skip the gaps',
      body: (
        <>
          <p>
            The list in <Cell>A2:A6</Cell> has gaps. Return only the filled cells: <F>{'=FILTER(A2:A6,A2:A6<>"")'}</F>.
          </p>
        </>
      ),
      hint: 'Not-equal-to-empty-text is TRUE for filled cells.',
      success: 'Ana, Ben, Cleo with no blanks between them.',
      seed: MESSY, fresh: true, at: 'G2', expect: [['Ana'], ['Ben'], ['Cleo']], exact: true, uses: ['FILTER'], sol: { G2: '=FILTER(A2:A6,A2:A6<>"")' },
    }),
  ],
};

const TAX_LAMBDA = '=LAMBDA(x,x*0.2)';
const isLam = (c: { data: { names?: Record<string, string> } }, n: string) => /^=\s*LAMBDA\s*\(/i.test(c.data.names?.[n] ?? '');
const peaks = sortRows(ROWS.filter((r) => r[2] === 'Pen'), { by: (r) => r[3], desc: true });

export const finalTest: LessonContent = {
  key: 'adv-final-test',
  title: 'Final test',
  sheet: SHEET,
  tools: ['names'],
  steps: [
    info('intro', 'Advanced Formulas final test', <p>Six tasks from the whole course. The orders are in A1:E21.</p>),
    spill({
      id: 'filtersort', title: '1. FILTER and SORT',
      body: <p>In <Cell>G2</Cell> list every <strong>Pen</strong> order, biggest Units first.</p>,
      hint: '=SORT(FILTER(A2:E21,C2:C21="Pen"),4,-1)',
      success: 'Correct.',
      seed: SALES, fresh: true, at: 'G2', expect: peaks.map((r) => [...r]), exact: true, uses: ['SORT', 'FILTER'], sol: { G2: '=SORT(FILTER(A2:E21,C2:C21="Pen"),4,-1)' },
    }),
    task({
      id: 'let', title: '2. LET',
      body: <p>In <Cell>G2</Cell> use LET to name the total revenue (units × price, all orders) and return 10% of it.</p>,
      hint: '=LET(t,SUMPRODUCT(D2:D21,E2:E21),t*0.1)',
      success: 'Correct.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: sum(ROWS.map(revenue)) * 0.1 }, uses: ['LET'], sol: { G2: '=LET(t,SUMPRODUCT(D2:D21,E2:E21),t*0.1)' },
    }),
    custom({
      id: 'lambda', title: '3. Your own function',
      body: (
        <p>
          In the Name Manager define <F>{'TAX'}</F> as <F>{TAX_LAMBDA}</F>, then in <Cell>G2</Cell> use it on the total revenue of the Pen orders.
        </p>
      ),
      hint: '=TAX(SUMPRODUCT((C2:C21="Pen")*D2:D21*E2:E21))',
      success: 'Correct.',
      seed: SALES, fresh: true, select: 'G2',
      check: (c) => isLam(c, 'TAX') && /TAX\(/i.test(c.raw('G2')) && Math.abs(Number(c.value('G2')) - sum(ROWS.filter((r) => r[2] === 'Pen').map(revenue)) * 0.2) < 1e-9 && !c.editing,
      sol: { names: { TAX: TAX_LAMBDA }, cells: { G2: '=TAX(SUMPRODUCT((C2:C21="Pen")*D2:D21*E2:E21))' }, events: ['define-name'] },
    }),
    task({
      id: 'lookup', title: '4. A lookup from the bottom',
      body: <p>In <Cell>G2</Cell> find the Region of the <em>last</em> order for <strong>Ben</strong>.</p>,
      hint: '=XLOOKUP("Ben",B2:B21,A2:A21,"none",0,-1)',
      success: 'Correct.',
      seed: SALES, fresh: true, select: 'G2', cells: { G2: [...ROWS].reverse().find((r) => r[1] === 'Ben')![0] }, uses: ['XLOOKUP'], sol: { G2: '=XLOOKUP("Ben",B2:B21,A2:A21,"none",0,-1)' },
    }),
    spill({
      id: 'text', title: '5. Split text',
      body: <p>In <Cell>G2</Cell> split <strong>2026-03-15</strong> at the dashes into three cells.</p>,
      hint: '=TEXTSPLIT("2026-03-15","-")',
      success: 'Correct.',
      seed: {}, fresh: true, at: 'G2', expect: [['2026', '03', '15']], exact: true, uses: ['TEXTSPLIT'], sol: { G2: '=TEXTSPLIT("2026-03-15","-")' },
    }),
    task({
      id: 'debug', title: '6. Fix the bug',
      body: <p><Cell>G2</Cell> should give the average score above 50 but shows an error because the ranges differ in size. Fix it.</p>,
      hint: 'Make both ranges B2:B9.',
      success: 'Advanced Formulas complete!',
      seed: { ...SC, G2: '=AVERAGE(FILTER(B2:B9,B2:B8>50))' }, fresh: true, select: 'G2', cells: { G2: sum(over50) / over50.length }, uses: ['FILTER'], sol: { G2: '=AVERAGE(FILTER(B2:B9,B2:B9>50))' },
    }),
  ],
};

void Cell;
