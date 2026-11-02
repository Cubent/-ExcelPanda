// Formulas & Functions, units 4 and 5: lookups, then stats and data quality.
import * as E from '@/components/sheet/engine';
import { custom, info, task } from './dsl';
import { Cell, F, K } from './kbd';
import type { LessonContent } from './types';

const norm = (s: string) => s.replace(/\s/g, '').toUpperCase();

const CATALOG = {
  A1: 'ID', B1: 'Product', C1: 'Price',
  A2: 'P-101', B2: 'Pen', C2: '1.2', A3: 'P-102', B3: 'Book', C3: '8.5',
  A4: 'P-103', B4: 'Bag', C4: '25', A5: 'P-104', B5: 'Lamp', C5: '18',
};

// ---------------------------------------------------------------------------
// Unit 4 · Lookups done right
// ---------------------------------------------------------------------------
export const xlookupDeep: LessonContent = {
  key: 'ff-xlookup-deep',
  title: 'XLOOKUP deep dive',
  steps: [
    info('intro', 'The modern lookup', (
      <>
        <p>
          <F>{'=XLOOKUP(find_this, look_here, return_this, [if_not_found], [match_mode], [search_mode])'}</F>
        </p>
        <p>
          It looks in one column and returns from another, in either direction, with a built-in "not found" message. XLOOKUP needs
          Excel 2021 or Microsoft 365. Older versions use VLOOKUP or INDEX with MATCH, which you will learn next.
        </p>
      </>
    )),
    task({
      id: 'basic', title: 'Find a name from an ID',
      body: (
        <p>
          <Cell>F2</Cell> holds <strong>P-103</strong>. In <Cell>G2</Cell> return its product name: <F>{'=XLOOKUP(F2,A2:A5,B2:B5)'}</F>.
        </p>
      ),
      hint: 'Look in the ID column A, return from the product column B.',
      success: 'Bag.',
      seed: { ...CATALOG, F1: 'Find', G1: 'Result', F2: 'P-103' }, fresh: true, select: 'G2',
      cells: { G2: 'Bag' }, uses: 'XLOOKUP', sol: { G2: '=XLOOKUP(F2,A2:A5,B2:B5)' },
    }),
    task({
      id: 'left', title: 'Look to the left',
      body: (
        <p>
          VLOOKUP can only return from columns to the <em>right</em>. XLOOKUP has no such limit. <Cell>F3</Cell> says{' '}
          <strong>Lamp</strong>. In <Cell>G3</Cell> find its ID: <F>{'=XLOOKUP(F3,B2:B5,A2:A5)'}</F>.
        </p>
      ),
      hint: 'Look in the product column B, return from the ID column A (to its left).',
      success: 'P-104.',
      seed: { ...CATALOG, F1: 'Find', G1: 'Result', F2: 'P-103', F3: 'Lamp' }, select: 'G3',
      cells: { G3: 'P-104' }, uses: 'XLOOKUP', sol: { G3: '=XLOOKUP(F3,B2:B5,A2:A5)' },
    }),
    task({
      id: 'missing', title: 'A friendly "not found"',
      body: (
        <>
          <p>
            <Cell>F4</Cell> asks for an ID that does not exist. Add the fourth argument so it shows a message instead of #N/A:
          </p>
          <p>
            <F>{'=XLOOKUP(F4,A2:A5,B2:B5,"No such ID")'}</F>
          </p>
        </>
      ),
      hint: 'The fourth argument is the "if not found" result.',
      success: 'No such ID.',
      seed: { ...CATALOG, F1: 'Find', G1: 'Result', F4: 'P-999' }, select: 'G4',
      cells: { G4: 'No such ID' }, uses: 'XLOOKUP', sol: { G4: '=XLOOKUP(F4,A2:A5,B2:B5,"No such ID")' },
    }),
    task({
      id: 'last', title: 'Find the last match',
      body: (
        <>
          <p>
            A price history lists <strong>P-101</strong> three times. You want the <em>latest</em> price (the last row). The sixth
            argument, <F>{'-1'}</F>, searches from the bottom up. The fifth is <F>{'0'}</F> for an exact match:
          </p>
          <p>
            <F>{'=XLOOKUP("P-101",A2:A4,B2:B4,"none",0,-1)'}</F> in <Cell>D2</Cell>.
          </p>
        </>
      ),
      hint: 'Arguments: find, look_in, return, not_found, match_mode (0 exact), search_mode (-1 last to first).',
      success: '1.4, the most recent price.',
      seed: { A1: 'ID', B1: 'Price', C1: 'Date', A2: 'P-101', B2: '1', C2: '2026-01-05', A3: 'P-101', B3: '1.2', C3: '2026-02-10', A4: 'P-101', B4: '1.4', C4: '2026-03-01' }, fresh: true,
      select: 'D2', cells: { D2: 1.4 }, uses: 'XLOOKUP', also: (c) => /-1\s*\)\s*$/.test(c.raw('D2').trim()),
      sol: { D2: '=XLOOKUP("P-101",A2:A4,B2:B4,"none",0,-1)' },
    }),
  ],
};

export const vlookupHlookup: LessonContent = {
  key: 'ff-vlookup-hlookup',
  title: 'VLOOKUP & HLOOKUP',
  steps: [
    info('intro', 'Read the workbooks you inherit', (
      <>
        <p>
          <strong>VLOOKUP</strong> has been the lookup for 30 years, so most real workbooks use it. You must be able to read and fix
          it.
        </p>
        <p>
          <F>{'=VLOOKUP(find_this, table, column_number, FALSE)'}</F>
        </p>
        <p>
          It searches the <em>first column</em> of the table and returns from the column number you give. The last argument,{' '}
          <F>{'FALSE'}</F>, means exact match, and you almost always want it.
        </p>
      </>
    )),
    task({
      id: 'basic', title: 'Your first VLOOKUP',
      body: (
        <p>
          In <Cell>F2</Cell> find the price of <strong>P-102</strong>: <F>{'=VLOOKUP("P-102",A2:C5,3,FALSE)'}</F>. Column 3 of the
          table is Price.
        </p>
      ),
      hint: 'Count columns inside the table: ID is 1, Product is 2, Price is 3.',
      success: '8.5.',
      seed: CATALOG, fresh: true, select: 'F2',
      cells: { F2: 8.5 }, uses: 'VLOOKUP', sol: { F2: '=VLOOKUP("P-102",A2:C5,3,FALSE)' },
    }),
    task({
      id: 'debug', title: 'Debug: the missing FALSE',
      body: (
        <>
          <p>
            <Cell>F2</Cell> should find <strong>P-103</strong>'s price but shows <strong>#N/A</strong>. The formula forgot the last
            argument. Without it VLOOKUP assumes the data is sorted and guesses.
          </p>
          <p>Fix it by adding <F>{',FALSE'}</F> before the closing bracket.</p>
        </>
      ),
      hint: 'The formula is =VLOOKUP("P-103",A2:B4,2). Add ,FALSE at the end.',
      success: '25. Always type FALSE (or 0) unless you really mean an approximate match.',
      seed: { A1: 'ID', B1: 'Price', A2: 'P-104', B2: '18', A3: 'P-101', B3: '1.2', A4: 'P-103', B4: '25', F2: '=VLOOKUP("P-103",A2:B4,2)' }, fresh: true,
      select: 'F2', cells: { F2: 25 }, uses: 'VLOOKUP', also: (c) => /FALSE|,\s*0\s*\)\s*$/i.test(c.raw('F2')),
      sol: { F2: '=VLOOKUP("P-103",A2:B4,2,FALSE)' },
    }),
    task({
      id: 'fill', title: 'Lock the table and fill down',
      body: (
        <>
          <p>
            Three IDs are in <Cell>G2:G4</Cell>. In <Cell>H2</Cell> look up each one's price and fill down. The table must be locked
            with dollar signs, or it slides down as you copy:
          </p>
          <p>
            <F>{'=VLOOKUP(G2,$A$2:$C$5,3,FALSE)'}</F>
          </p>
        </>
      ),
      hint: 'Use F4 right after selecting the table part to add the dollars.',
      success: 'Three lookups, one formula. Locked table, relative lookup value.',
      seed: { ...CATALOG, G2: 'P-104', G3: 'P-101', G4: 'P-103' }, select: 'H2',
      cells: { H2: 18, H3: 1.2, H4: 25 }, uses: 'VLOOKUP', also: (c) => c.raw('H4').includes('$A$2:$C$5'),
      sol: { H2: '=VLOOKUP(G2,$A$2:$C$5,3,FALSE)', H3: '=VLOOKUP(G3,$A$2:$C$5,3,FALSE)', H4: '=VLOOKUP(G4,$A$2:$C$5,3,FALSE)' },
    }),
    task({
      id: 'hlookup', title: 'HLOOKUP: the sideways one',
      body: (
        <>
          <p>
            When data runs <em>across</em> rows, use HLOOKUP. Months are in B1:E1 and sales in row 2. In <Cell>B4</Cell> find March:
          </p>
          <p>
            <F>{'=HLOOKUP("Mar",B1:E2,2,FALSE)'}</F>
          </p>
        </>
      ),
      hint: 'The 2 means the second row of the table.',
      success: '120. It is VLOOKUP turned on its side.',
      seed: { A1: 'Month', B1: 'Jan', C1: 'Feb', D1: 'Mar', E1: 'Apr', A2: 'Sales', B2: '100', C2: '110', D2: '120', E2: '130' }, fresh: true, select: 'B4',
      cells: { B4: 120 }, uses: 'HLOOKUP', sol: { B4: '=HLOOKUP("Mar",B1:E2,2,FALSE)' },
    }),
  ],
};

const GRID = {
  B1: 'Jan', C1: 'Feb', D1: 'Mar',
  A2: 'North', B2: '100', C2: '110', D2: '120',
  A3: 'South', B3: '80', C3: '90', D3: '95',
  A4: 'East', B4: '60', C4: '70', D4: '85',
};

export const indexMatch: LessonContent = {
  key: 'ff-index-match',
  title: 'INDEX + MATCH',
  steps: [
    info('intro', 'The two-function lookup', (
      <>
        <p>
          <strong>MATCH</strong> finds <em>where</em> something is in a list. <strong>INDEX</strong> returns the item at a given
          position. Together they do what VLOOKUP does, but in any direction, and they survive inserted columns.
        </p>
      </>
    )),
    task({
      id: 'match', title: 'MATCH: the position',
      body: (
        <p>
          In <Cell>F2</Cell> find where <strong>P-103</strong> sits in the IDs: <F>{'=MATCH("P-103",A2:A5,0)'}</F>. The 0 means exact.
        </p>
      ),
      hint: 'It is the 3rd item in the list.',
      success: '3.',
      seed: CATALOG, fresh: true, select: 'F2',
      cells: { F2: 3 }, uses: 'MATCH', sol: { F2: '=MATCH("P-103",A2:A5,0)' },
    }),
    task({
      id: 'index', title: 'INDEX: the item at a position',
      body: (
        <p>
          In <Cell>F3</Cell> return the 3rd price: <F>{'=INDEX(C2:C5,3)'}</F>.
        </p>
      ),
      hint: 'INDEX(range, position).',
      success: '25.',
      seed: CATALOG, select: 'F3',
      cells: { F3: 25 }, uses: 'INDEX', sol: { F3: '=INDEX(C2:C5,3)' },
    }),
    task({
      id: 'combo', title: 'Combine them',
      body: (
        <>
          <p>
            Feed MATCH into INDEX so the position is found automatically. In <Cell>F4</Cell>:
          </p>
          <p>
            <F>{'=INDEX(C2:C5,MATCH("P-103",A2:A5,0))'}</F>
          </p>
        </>
      ),
      hint: 'MATCH runs first and returns 3, then INDEX uses it.',
      success: '25. Now swap the ID for a cell reference and you have a reusable lookup.',
      seed: CATALOG, select: 'F4',
      cells: { F4: 25 }, uses: ['INDEX', 'MATCH'], sol: { F4: '=INDEX(C2:C5,MATCH("P-103",A2:A5,0))' },
    }),
    task({
      id: 'left', title: 'Look left, no problem',
      body: (
        <p>
          Find the ID for <strong>Lamp</strong> (the answer sits left of the product column): in <Cell>F5</Cell> use{' '}
          <F>{'=INDEX(A2:A5,MATCH("Lamp",B2:B5,0))'}</F>.
        </p>
      ),
      hint: 'Return range A, match range B.',
      success: 'P-104.',
      seed: CATALOG, select: 'F5',
      cells: { F5: 'P-104' }, uses: ['INDEX', 'MATCH'], sol: { F5: '=INDEX(A2:A5,MATCH("Lamp",B2:B5,0))' },
    }),
    task({
      id: 'twoway', title: 'Two-way lookup',
      body: (
        <>
          <p>
            Sales are in a grid by region (down) and month (across). Find <strong>South</strong> in <strong>Feb</strong> by matching
            both the row and the column, in <Cell>F2</Cell>:
          </p>
          <p>
            <F>{'=INDEX(B2:D4,MATCH("South",A2:A4,0),MATCH("Feb",B1:D1,0))'}</F>
          </p>
        </>
      ),
      hint: 'INDEX(grid, row_number, column_number): the row from one MATCH, the column from the other.',
      success: '90. A pro move VLOOKUP cannot do on its own.',
      seed: GRID, fresh: true, select: 'F2',
      cells: { F2: 90 }, uses: ['INDEX', 'MATCH'], also: (c) => (c.raw('F2').match(/match\s*\(/gi)?.length ?? 0) >= 2,
      sol: { F2: '=INDEX(B2:D4,MATCH("South",A2:A4,0),MATCH("Feb",B1:D1,0))' },
    }),
  ],
};

const BANDS = { A1: 'Score from', B1: 'Grade', A2: '0', B2: 'F', A3: '60', B3: 'D', A4: '70', B4: 'C', A5: '80', B5: 'B', A6: '90', B6: 'A' };
const STUDENTS = { D1: 'Student', E1: 'Score', F1: 'Grade', D2: 'Ana', E2: '92', D3: 'Ben', E3: '78', D4: 'Cleo', E4: '61' };

export const approxMatch: LessonContent = {
  key: 'ff-approx-match',
  title: 'Approximate match',
  steps: [
    info('intro', 'Bands, tiers and brackets', (
      <>
        <p>
          Sometimes there is no exact match. A score of 78 is not in the table, but it belongs in the <strong>70+</strong> band. An{' '}
          <strong>approximate match</strong> finds the largest threshold that is not above your value.
        </p>
        <p>
          <strong>Rule:</strong> the threshold column must be sorted from smallest to largest.
        </p>
      </>
    )),
    task({
      id: 'vlookup', title: 'VLOOKUP with TRUE',
      body: (
        <>
          <p>
            The grade bands are in A1:B6. In <Cell>F2</Cell> grade Ana's score:
          </p>
          <p>
            <F>{'=VLOOKUP(E2,$A$2:$B$6,2,TRUE)'}</F>
          </p>
        </>
      ),
      hint: 'TRUE (or leaving it out) means approximate match.',
      success: 'A. 92 falls in the 90+ band.',
      seed: { ...BANDS, ...STUDENTS }, fresh: true, select: 'F2',
      cells: { F2: 'A' }, uses: 'VLOOKUP', sol: { F2: '=VLOOKUP(E2,$A$2:$B$6,2,TRUE)' },
    }),
    task({
      id: 'fill', title: 'Grade everyone',
      body: (
        <p>
          Fill <Cell>F2</Cell> down to <Cell>F4</Cell>.
        </p>
      ),
      hint: 'Select F2:F4 and press Ctrl + D.',
      success: 'Ben is C (78) and Cleo is D (61). Between thresholds, the lower one wins.',
      seed: { ...BANDS, ...STUDENTS, F2: '=VLOOKUP(E2,$A$2:$B$6,2,TRUE)' }, select: 'F2',
      cells: { F2: 'A', F3: 'C', F4: 'D' }, uses: 'VLOOKUP',
      sol: { F3: '=VLOOKUP(E3,$A$2:$B$6,2,TRUE)', F4: '=VLOOKUP(E4,$A$2:$B$6,2,TRUE)' },
    }),
    task({
      id: 'xlookup', title: 'XLOOKUP match mode -1',
      body: (
        <>
          <p>
            XLOOKUP does it with a clearer setting. A match mode of <F>{'-1'}</F> means "exact, or the next smaller". In{' '}
            <Cell>G3</Cell> grade Ben:
          </p>
          <p>
            <F>{'=XLOOKUP(E3,A2:A6,B2:B6,"",-1)'}</F>
          </p>
        </>
      ),
      hint: 'The fourth argument (not found) is empty quotes here.',
      success: 'C.',
      seed: { ...BANDS, ...STUDENTS }, select: 'G3',
      cells: { G3: 'C' }, uses: 'XLOOKUP', sol: { G3: '=XLOOKUP(E3,A2:A6,B2:B6,"",-1)' },
    }),
    task({
      id: 'tax', title: 'Tax brackets with INDEX and MATCH',
      body: (
        <>
          <p>
            Income bands in A2:A4 with rates in B2:B4. For an income of 25,000 in <Cell>D2</Cell>, find the rate in{' '}
            <Cell>E2</Cell>:
          </p>
          <p>
            <F>{'=INDEX(B2:B4,MATCH(D2,A2:A4,1))'}</F>
          </p>
          <p>
            The 1 in MATCH means "largest value that is not bigger than mine".
          </p>
        </>
      ),
      hint: '25,000 sits between 10,000 and 40,000, so it takes the 10,000 band: 10%.',
      success: '10%.',
      seed: { A1: 'Income from', B1: 'Rate', A2: '0', B2: '0', A3: '10000', B3: '0.1', A4: '40000', B4: '0.2', D1: 'Income', E1: 'Rate', D2: '25000' }, fresh: true,
      select: 'E2', cells: { E2: 0.1 }, uses: ['INDEX', 'MATCH'], sol: { E2: '=INDEX(B2:B4,MATCH(D2,A2:A4,1))' },
    }),
  ],
};

const ORDERS = {
  A1: 'Region', B1: 'Product', C1: 'Price',
  A2: 'North', B2: 'Pen', C2: '1', A3: 'North', B3: 'Book', C3: '8',
  A4: 'South', B4: 'Pen', C4: '1.2', A5: 'South', B5: 'Book', C5: '8.5',
  A6: 'East', B6: 'Pen', C6: '1.1', A7: 'East', B7: 'Book', C7: '7.5',
  F1: 'Region', G1: 'Product', H1: 'Price', F2: 'South', G2: 'Book',
};

export const multiLookup: LessonContent = {
  key: 'ff-multi-lookup',
  title: 'Lookup on two criteria',
  steps: [
    info('intro', 'When one column is not enough', (
      <>
        <p>
          The price depends on <strong>both</strong> region and product. A lookup matches one column, so we need a trick. There are
          two classic ones: a <strong>helper key</strong> column, and <strong>SUMIFS</strong> as a lookup.
        </p>
      </>
    )),
    task({
      id: 'key', title: 'Build a helper key',
      body: (
        <>
          <p>
            In <Cell>D2</Cell> join region and product with a separator: <F>{'=A2&"|"&B2'}</F>. Fill it down to <Cell>D7</Cell>.
          </p>
        </>
      ),
      hint: 'The | keeps "NorthPen" and "NorthPen" style collisions apart.',
      success: 'Each row now has one unique key like South|Book.',
      seed: ORDERS, fresh: true, select: 'D2',
      cells: { D2: 'North|Pen', D5: 'South|Book', D7: 'East|Book' },
      sol: Object.fromEntries([2, 3, 4, 5, 6, 7].map((r) => [`D${r}`, `=A${r}&"|"&B${r}`])),
    }),
    task({
      id: 'lookup', title: 'Look up the key',
      body: (
        <>
          <p>
            Build the same key from the two inputs and look it up. In <Cell>H2</Cell>:
          </p>
          <p>
            <F>{'=XLOOKUP(F2&"|"&G2,D2:D7,C2:C7)'}</F>
          </p>
        </>
      ),
      hint: 'F2 is South and G2 is Book, so the key is South|Book.',
      success: '8.5.',
      seed: { ...ORDERS, ...Object.fromEntries([2, 3, 4, 5, 6, 7].map((r) => [`D${r}`, `=A${r}&"|"&B${r}`])) }, select: 'H2',
      cells: { H2: 8.5 }, uses: 'XLOOKUP', sol: { H2: '=XLOOKUP(F2&"|"&G2,D2:D7,C2:C7)' },
    }),
    task({
      id: 'sumifs', title: 'No helper column: SUMIFS',
      body: (
        <>
          <p>
            If the answer is a <strong>number</strong> and each combination appears once, SUMIFS can look it up with no helper
            column:
          </p>
          <p>
            <F>{'=SUMIFS(C2:C7,A2:A7,F2,B2:B7,G2)'}</F> in <Cell>I2</Cell>.
          </p>
          <p>It breaks (adds the rows) if a combination appears twice, so use it only when keys are unique.</p>
        </>
      ),
      hint: 'Sum range first, then region pair, then product pair.',
      success: '8.5 again.',
      seed: ORDERS, select: 'I2',
      cells: { I2: 8.5 }, uses: 'SUMIFS', sol: { I2: '=SUMIFS(C2:C7,A2:A7,F2,B2:B7,G2)' },
    }),
  ],
};

export const unit4Test: LessonContent = {
  key: 'ff-unit4-test',
  title: 'Unit 4 test',
  steps: [
    info('intro', 'Lookup test', <p>Five lookups, from exact to approximate to two-way.</p>),
    task({
      id: 'x', title: '1. XLOOKUP',
      body: (
        <p>
          In <Cell>F2</Cell> return the product for ID <strong>P-104</strong> and show <strong>Unknown</strong> if it is missing.
        </p>
      ),
      hint: '=XLOOKUP("P-104",A2:A5,B2:B5,"Unknown")',
      success: 'Lamp.',
      seed: CATALOG, fresh: true, select: 'F2',
      cells: { F2: 'Lamp' }, uses: 'XLOOKUP', sol: { F2: '=XLOOKUP("P-104",A2:A5,B2:B5,"Unknown")' },
    }),
    task({
      id: 'v', title: '2. VLOOKUP',
      body: (
        <p>
          In <Cell>F2</Cell> use VLOOKUP (exact match) to return the price of <strong>P-101</strong>.
        </p>
      ),
      hint: '=VLOOKUP("P-101",A2:C5,3,FALSE)',
      success: '1.2.',
      seed: CATALOG, fresh: true, select: 'F2',
      cells: { F2: 1.2 }, uses: 'VLOOKUP', also: (c) => /FALSE|,\s*0\s*\)\s*$/i.test(c.raw('F2')), sol: { F2: '=VLOOKUP("P-101",A2:C5,3,FALSE)' },
    }),
    task({
      id: 'im', title: '3. INDEX and MATCH',
      body: (
        <p>
          In <Cell>F2</Cell> return the <strong>ID</strong> of the product <strong>Bag</strong> (it sits to the left of the product
          column).
        </p>
      ),
      hint: '=INDEX(A2:A5,MATCH("Bag",B2:B5,0))',
      success: 'P-103.',
      seed: CATALOG, fresh: true, select: 'F2',
      cells: { F2: 'P-103' }, uses: ['INDEX', 'MATCH'], sol: { F2: '=INDEX(A2:A5,MATCH("Bag",B2:B5,0))' },
    }),
    task({
      id: 'approx', title: '4. Bands',
      body: (
        <p>
          In <Cell>F2</Cell> return the grade for Ben's score in E3 using the band table in A1:B6.
        </p>
      ),
      hint: '=VLOOKUP(E3,A2:B6,2,TRUE)',
      success: 'C.',
      seed: { ...BANDS, ...STUDENTS }, fresh: true, select: 'F2',
      cells: { F2: 'C' }, sol: { F2: '=VLOOKUP(E3,A2:B6,2,TRUE)' },
    }),
    task({
      id: 'two', title: '5. Two-way',
      body: (
        <p>
          In <Cell>F2</Cell> return <strong>East</strong> sales in <strong>Mar</strong> from the grid.
        </p>
      ),
      hint: '=INDEX(B2:D4,MATCH("East",A2:A4,0),MATCH("Mar",B1:D1,0))',
      success: 'Unit 4 complete: 85.',
      seed: GRID, fresh: true, select: 'F2',
      cells: { F2: 85 }, uses: ['INDEX', 'MATCH'], sol: { F2: '=INDEX(B2:D4,MATCH("East",A2:A4,0),MATCH("Mar",B1:D1,0))' },
    }),
  ],
};

// ---------------------------------------------------------------------------
// Unit 5 · Stats & data quality
// ---------------------------------------------------------------------------
const SCORES = [55, 60, 65, 70, 70, 75, 80, 100];
const SCORE_CELLS = Object.fromEntries(SCORES.map((v, i) => [`A${i + 2}`, String(v)]));
const mean = SCORES.reduce((a, b) => a + b, 0) / SCORES.length;
const STDEV_S = Math.sqrt(SCORES.reduce((a, b) => a + (b - mean) ** 2, 0) / (SCORES.length - 1));

export const descriptiveStats: LessonContent = {
  key: 'ff-descriptive-stats',
  title: 'MEDIAN · MODE · STDEV',
  steps: [
    info('intro', 'Describe a dataset in four numbers', (
      <>
        <p>
          Eight exam scores sit in <Cell>A2:A9</Cell>. One student scored 100, far above the rest. That outlier will show why the
          <strong> average</strong> alone can mislead.
        </p>
      </>
    )),
    task({
      id: 'avg', title: 'Average',
      body: (
        <p>
          In <Cell>C2</Cell> type <F>{'=AVERAGE(A2:A9)'}</F>.
        </p>
      ),
      hint: 'Add them all up and divide by 8.',
      success: '71.875. Pulled up by the 100.',
      seed: { A1: 'Score', ...SCORE_CELLS }, fresh: true, select: 'C2',
      cells: { C2: mean }, uses: 'AVERAGE', sol: { C2: '=AVERAGE(A2:A9)' },
    }),
    task({
      id: 'median', title: 'MEDIAN',
      body: (
        <p>
          The <strong>median</strong> is the middle value, so one extreme score barely moves it. In <Cell>C3</Cell> type{' '}
          <F>{'=MEDIAN(A2:A9)'}</F>.
        </p>
      ),
      hint: 'Between 70 and 70, the two middle values.',
      success: '70. A fairer "typical" score than the average here.',
      seed: { A1: 'Score', ...SCORE_CELLS }, select: 'C3',
      cells: { C3: 70 }, uses: 'MEDIAN', sol: { C3: '=MEDIAN(A2:A9)' },
    }),
    task({
      id: 'mode', title: 'MODE',
      body: (
        <p>
          The <strong>mode</strong> is the most common value. In <Cell>C4</Cell> type <F>{'=MODE(A2:A9)'}</F>.
        </p>
      ),
      hint: 'Two students scored the same.',
      success: '70.',
      seed: { A1: 'Score', ...SCORE_CELLS }, select: 'C4',
      cells: { C4: 70 }, uses: 'MODE', sol: { C4: '=MODE(A2:A9)' },
    }),
    task({
      id: 'stdev', title: 'Standard deviation',
      body: (
        <>
          <p>
            <strong>Standard deviation</strong> measures how spread out the scores are. A small number means everyone scored
            similarly. For a sample (these 8 students out of a bigger class) use <F>{'STDEV.S'}</F>:
          </p>
          <p>
            <F>{'=STDEV.S(A2:A9)'}</F> in <Cell>C5</Cell>.
          </p>
        </>
      ),
      hint: 'STDEV.S for a sample, STDEV.P when you have the whole population.',
      success: 'About 13.9. Most scores sit within 14 points of the average.',
      seed: { A1: 'Score', ...SCORE_CELLS }, select: 'C5',
      cells: { C5: STDEV_S }, uses: 'STDEV.S', sol: { C5: '=STDEV.S(A2:A9)' },
    }),
    task({
      id: 'range', title: 'The range',
      body: (
        <p>
          How wide is the spread? In <Cell>C6</Cell> subtract the lowest from the highest: <F>{'=MAX(A2:A9)-MIN(A2:A9)'}</F>.
        </p>
      ),
      hint: 'Highest minus lowest.',
      success: '45 points from lowest to highest.',
      seed: { A1: 'Score', ...SCORE_CELLS }, select: 'C6',
      cells: { C6: 45 }, uses: ['MAX', 'MIN'], sol: { C6: '=MAX(A2:A9)-MIN(A2:A9)' },
    }),
  ],
};

const TEAM = { A1: 'Rep', B1: 'Sales', A2: 'Ana', B2: '120', A3: 'Ben', B3: '95', A4: 'Cleo', B4: '150', A5: 'Dev', B5: '80', A6: 'Eli', B6: '130', A7: 'Fay', B7: '110' };

export const topN: LessonContent = {
  key: 'ff-top-n',
  title: 'LARGE · SMALL · RANK',
  steps: [
    info('intro', 'Leaderboards', (
      <>
        <p>
          MAX only gives the single biggest. <strong>LARGE(range, k)</strong> gives the k-th biggest, <strong>SMALL</strong> the k-th
          smallest, and <strong>RANK</strong> tells you where one value stands.
        </p>
      </>
    )),
    task({
      id: 'large', title: 'LARGE',
      body: (
        <p>
          In <Cell>D2</Cell> find the <strong>top</strong> sale and in <Cell>D3</Cell> the <strong>second</strong> and in <Cell>D4</Cell>{' '}
          the <strong>third</strong> with <F>{'=LARGE(B2:B7,1)'}</F>, <F>{'=LARGE(B2:B7,2)'}</F> and <F>{'=LARGE(B2:B7,3)'}</F>.
        </p>
      ),
      hint: 'The second argument is the position: 1 for biggest, 2 for next.',
      success: '150, 130, 120.',
      seed: TEAM, fresh: true, select: 'D2',
      cells: { D2: 150, D3: 130, D4: 120 }, uses: 'LARGE',
      sol: { D2: '=LARGE(B2:B7,1)', D3: '=LARGE(B2:B7,2)', D4: '=LARGE(B2:B7,3)' },
    }),
    task({
      id: 'name', title: 'Who made the top sale?',
      body: (
        <>
          <p>
            LARGE gives the number, not the person. Look the person up with INDEX and MATCH. In <Cell>E2</Cell>:
          </p>
          <p>
            <F>{'=INDEX(A2:A7,MATCH(D2,B2:B7,0))'}</F>
          </p>
        </>
      ),
      hint: 'Find D2 (150) in the sales, and return the name at that position.',
      success: 'Cleo.',
      seed: { ...TEAM, D2: '=LARGE(B2:B7,1)' }, select: 'E2',
      cells: { E2: 'Cleo' }, uses: ['INDEX', 'MATCH'], sol: { E2: '=INDEX(A2:A7,MATCH(D2,B2:B7,0))' },
    }),
    task({
      id: 'small', title: 'SMALL',
      body: (
        <p>
          In <Cell>D6</Cell> find the lowest sale with <F>{'=SMALL(B2:B7,1)'}</F>.
        </p>
      ),
      hint: 'SMALL works like LARGE from the bottom.',
      success: '80.',
      seed: TEAM, select: 'D6',
      cells: { D6: 80 }, uses: 'SMALL', sol: { D6: '=SMALL(B2:B7,1)' },
    }),
    task({
      id: 'rank', title: 'RANK',
      body: (
        <>
          <p>
            In <Cell>C2</Cell> rank each rep, biggest first, and fill down:
          </p>
          <p>
            <F>{'=RANK(B2,$B$2:$B$7)'}</F>
          </p>
          <p>The list is locked with dollar signs so it stays put while the value moves.</p>
        </>
      ),
      hint: 'Fill C2 down to C7.',
      success: 'Ana is 3rd, Cleo is 1st.',
      seed: TEAM, select: 'C2',
      cells: { C2: 3, C3: 5, C4: 1, C5: 6, C6: 2, C7: 4 }, uses: 'RANK',
      sol: Object.fromEntries([2, 3, 4, 5, 6, 7].map((r) => [`C${r}`, `=RANK(B${r},$B$2:$B$7)`])),
    }),
  ],
};

const CART = { A1: 'Item', B1: 'Price', A2: 'Pen', B2: '1.115', A3: 'Book', B3: '2.225', A4: 'Bag', B4: '3.335' };

export const rounding: LessonContent = {
  key: 'ff-rounding',
  title: 'Rounding & precision',
  steps: [
    info('intro', 'Why the total is off by a penny', (
      <>
        <p>
          Formatting a cell to 2 decimals only changes how it <em>looks</em>. The real number underneath keeps all its decimals. Add
          up three prices that <em>display</em> as 1.12, 2.23, 3.34 and you may get 6.68 instead of 6.69.
        </p>
        <p>
          When money must add up exactly, round the <em>values</em> with a function.
        </p>
      </>
    )),
    task({
      id: 'round', title: 'ROUND',
      body: (
        <p>
          In <Cell>C2</Cell> round the price to 2 decimals: <F>{'=ROUND(B2,2)'}</F>. Fill down to <Cell>C4</Cell>.
        </p>
      ),
      hint: 'ROUND(number, decimal_places).',
      success: '1.12, 2.23, 3.34.',
      seed: CART, fresh: true, select: 'C2',
      cells: { C2: 1.12, C3: 2.23, C4: 3.34 }, uses: 'ROUND',
      sol: { C2: '=ROUND(B2,2)', C3: '=ROUND(B3,2)', C4: '=ROUND(B4,2)' },
    }),
    task({
      id: 'sum', title: 'Add the rounded values',
      body: (
        <p>
          In <Cell>C5</Cell> total the rounded column with <F>{'=SUM(C2:C4)'}</F>, and in <Cell>B5</Cell> total the originals. Compare.
        </p>
      ),
      hint: 'B5 is 6.675 (shown as 6.68), C5 is exactly 6.69.',
      success: 'The rounded column totals 6.69. Decide which one your invoice should use, then be consistent.',
      seed: { ...CART, C2: '=ROUND(B2,2)', C3: '=ROUND(B3,2)', C4: '=ROUND(B4,2)' }, select: 'B5',
      cells: { B5: 6.675, C5: 6.69 }, uses: 'SUM', sol: { B5: '=SUM(B2:B4)', C5: '=SUM(C2:C4)' },
    }),
    task({
      id: 'up', title: 'ROUNDUP and ROUNDDOWN',
      body: (
        <p>
          ROUND goes to the nearest. In <Cell>E2</Cell> always go up to a whole number with <F>{'=ROUNDUP(7.21,0)'}</F>, and in{' '}
          <Cell>E3</Cell> always go down with <F>{'=ROUNDDOWN(7.99,0)'}</F>.
        </p>
      ),
      hint: 'You need 8 and 7.',
      success: '8 and 7. Useful for "how many boxes do I need?".',
      seed: {}, fresh: true, select: 'E2',
      cells: { E2: 8, E3: 7 }, sol: { E2: '=ROUNDUP(7.21,0)', E3: '=ROUNDDOWN(7.99,0)' },
    }),
    task({
      id: 'ceiling', title: 'CEILING, FLOOR and MROUND',
      body: (
        <>
          <p>These round to a multiple instead of decimals:</p>
          <p>
            <F>{'=CEILING(4.2,0.5)'}</F> in <Cell>G2</Cell> (round up to a half), <F>{'=FLOOR(4.7,0.5)'}</F> in <Cell>G3</Cell> (round
            down to a half) and <F>{'=MROUND(23,5)'}</F> in <Cell>G4</Cell> (nearest 5).
          </p>
        </>
      ),
      hint: 'Expected: 4.5, 4.5 and 25.',
      success: '4.5, 4.5, 25. Great for pricing in steps and rounding times to 15 minutes.',
      seed: {}, fresh: true, select: 'G2',
      cells: { G2: 4.5, G3: 4.5, G4: 25 }, sol: { G2: '=CEILING(4.2,0.5)', G3: '=FLOOR(4.7,0.5)', G4: '=MROUND(23,5)' },
    }),
    task({
      id: 'trunc', title: 'TRUNC just chops',
      body: (
        <p>
          <strong>TRUNC</strong> cuts decimals off without rounding. In <Cell>I2</Cell> type <F>{'=TRUNC(8.97)'}</F>.
        </p>
      ),
      hint: 'Compare with ROUND(8.97,0), which gives 9.',
      success: '8.',
      seed: {}, fresh: true, select: 'I2',
      cells: { I2: 8 }, uses: 'TRUNC', sol: { I2: '=TRUNC(8.97)' },
    }),
  ],
};

const TASKS = { A1: 'Task', B1: 'Status', A2: 'Write brief', A3: 'Design', A4: 'Review', A5: 'Publish', A6: 'Report' };
const STATUS_LIST = { 'B2:B6': ['To do', 'Doing', 'Done'] };

export const validationLesson: LessonContent = {
  key: 'ff-validation',
  title: 'Data validation',
  steps: [
    info('intro', 'Stop bad data at the door', (
      <>
        <p>
          <strong>Data validation</strong> limits what can go into a cell: a dropdown list, a number range, a date range. Clean input
          means fewer broken formulas later. In Excel you set it up from <strong>Data → Data Validation</strong>.
        </p>
        <p>
          Here the Status column already has a dropdown list. We will use it, then write the formulas that check data.
        </p>
      </>
    )),
    custom({
      id: 'pick', title: 'Pick from a dropdown',
      body: (
        <p>
          Click <Cell>B2</Cell>. A small ▼ appears at its right edge. Click it (or press <K>Alt</K> + <K>↓</K>) and choose{' '}
          <strong>Done</strong>.
        </p>
      ),
      hint: 'The arrow only shows when the cell is selected.',
      success: 'Only the three allowed values can be chosen, so typos like "Dnoe" cannot happen.',
      seed: TASKS, fresh: true, select: 'B2', meta: { lists: STATUS_LIST },
      check: (c) => c.events.has('dropdown') && c.raw('B2') === 'Done',
      sol: { cells: { B2: 'Done' }, events: ['dropdown'] },
    }),
    task({
      id: 'count', title: 'Count the finished tasks',
      body: (
        <p>
          With clean statuses, counting is reliable. In <Cell>D1</Cell> type <F>{'=COUNTIF(B2:B6,"Done")'}</F>.
        </p>
      ),
      hint: 'Three tasks are Done.',
      success: '3.',
      seed: { ...TASKS, B2: 'Done', B3: 'Doing', B4: 'Done', B5: 'To do', B6: 'Done' }, fresh: true, select: 'D1', meta: { lists: STATUS_LIST },
      cells: { D1: 3 }, uses: 'COUNTIF', sol: { D1: '=COUNTIF(B2:B6,"Done")' },
    }),
    task({
      id: 'check', title: 'Check numbers with a formula',
      body: (
        <>
          <p>
            Not every value arrives through a dropdown. Ages in A2:A5 include a text entry and a negative. In <Cell>B2</Cell> test
            whether the age is a <strong>number between 0 and 120</strong>, and fill down:
          </p>
          <p>
            <F>{'=AND(ISNUMBER(A2),A2>=0,A2<=120)'}</F>
          </p>
        </>
      ),
      hint: 'ISNUMBER checks it is a number. AND combines all three tests.',
      success: 'TRUE, FALSE, FALSE, TRUE. The bad rows are exposed.',
      seed: { A1: 'Age', B1: 'Valid?', A2: '25', A3: 'abc', A4: '-3', A5: '40' }, fresh: true, select: 'B2',
      cells: { B2: true, B3: false, B4: false, B5: true }, uses: ['AND', 'ISNUMBER'],
      sol: Object.fromEntries([2, 3, 4, 5].map((r) => [`B${r}`, `=AND(ISNUMBER(A${r}),A${r}>=0,A${r}<=120)`])),
    }),
    task({
      id: 'invalid', title: 'Count the bad rows',
      body: (
        <p>
          In <Cell>D1</Cell> count how many entries failed: <F>{'=COUNTIF(B2:B5,FALSE)'}</F>.
        </p>
      ),
      hint: 'FALSE (no quotes) is a logical value.',
      success: '2 bad entries to fix.',
      seed: { A1: 'Age', B1: 'Valid?', A2: '25', A3: 'abc', A4: '-3', A5: '40', B2: '=AND(ISNUMBER(A2),A2>=0,A2<=120)', B3: '=AND(ISNUMBER(A3),A3>=0,A3<=120)', B4: '=AND(ISNUMBER(A4),A4>=0,A4<=120)', B5: '=AND(ISNUMBER(A5),A5>=0,A5<=120)' },
      fresh: true, select: 'D1', cells: { D1: 2 }, uses: 'COUNTIF', sol: { D1: '=COUNTIF(B2:B5,FALSE)' },
    }),
  ],
};

const REGIONS = { A1: 'Rep', B1: 'Sales', D1: 'Target', E1: '100', A2: 'Ana', B2: '120', A3: 'Ben', B3: '80', A4: 'Cleo', B4: '60', A5: 'Dev', B5: '150', A6: 'Eli', B6: '95', A7: 'Fay', B7: '110' };
const CF_BELOW = [{ range: 'B2:B7', formula: '=B2<$E$1', style: { bg: '#F8D7DA', color: '#8A1C1C', b: true } }];

export const conditionalFormatting: LessonContent = {
  key: 'ff-conditional-formatting',
  title: 'Conditional formatting',
  meta: { cf: CF_BELOW },
  steps: [
    info('intro', 'Colour that follows the data', (
      <>
        <p>
          <strong>Conditional formatting</strong> colours cells automatically when a rule is true. In Excel it lives under{' '}
          <strong>Home → Conditional Formatting</strong>.
        </p>
        <p>
          The secret: every rule is just a <strong>formula that returns TRUE or FALSE</strong>. If you can write that test, you can
          colour anything. Here a rule already paints sales below the target (cell <Cell>E1</Cell>) red.
        </p>
      </>
    )),
    custom({
      id: 'see', title: 'Make the red disappear',
      body: (
        <>
          <p>
            Three reps are in red. Change <Cell>E1</Cell> (the target) so <strong>nobody</strong> is below it. Watch the colours
            vanish as you press <K>Enter</K>.
          </p>
        </>
      ),
      hint: 'The lowest sale is 60, so a target of 60 or less clears every cell.',
      success: 'The rule reads E1 live. Change the data and the colours follow.',
      seed: REGIONS, fresh: true, select: 'E1',
      check: (c) => ['B2', 'B3', 'B4', 'B5', 'B6', 'B7'].every((k) => typeof c.value(k) === 'number' && (c.value(k) as number) >= (c.value('E1') as number)) && !c.editing,
      sol: { cells: { E1: '50' } },
    }),
    task({
      id: 'test', title: 'Write the rule\'s test',
      body: (
        <>
          <p>
            Set the target back (it is 100). In <Cell>C2</Cell> write the very test the rule uses and fill down to <Cell>C7</Cell>:
          </p>
          <p>
            <F>{'=B2<$E$1'}</F>
          </p>
          <p>The $ locks the target so every row compares against the same cell.</p>
        </>
      ),
      hint: 'TRUE rows are the ones the rule colours.',
      success: 'The TRUE cells match the red ones. Now you can see what a rule "sees".',
      seed: REGIONS, fresh: true, select: 'C2',
      cells: { C2: false, C3: true, C4: true, C5: false, C6: true, C7: false },
      also: (c) => norm(c.raw('C3')) === '=B3<$E$1',
      sol: Object.fromEntries([2, 3, 4, 5, 6, 7].map((r) => [`C${r}`, `=B${r}<$E$1`])),
    }),
    task({
      id: 'row', title: 'Colour the whole row',
      body: (
        <>
          <p>
            To colour <em>entire rows</em> you lock the <strong>column</strong> but let the row move: <F>{'=$B2<$E$1'}</F>. Type that
            into <Cell>G2</Cell> to see it evaluate for Ana's row.
          </p>
        </>
      ),
      hint: '$B locks column B, so the rule keeps reading sales even when applied to columns A and C.',
      success: 'FALSE for Ana (120 is not below 100). This mixed reference is the single most useful rule pattern.',
      seed: REGIONS, fresh: true, select: 'G2',
      cells: { G2: false }, also: (c) => norm(c.raw('G2')) === '=$B2<$E$1',
      sol: { G2: '=$B2<$E$1' },
    }),
    task({
      id: 'top', title: 'Highlight the top 3',
      body: (
        <>
          <p>
            A "top 3" rule is a RANK test. In <Cell>H2</Cell> type <F>{'=RANK(B2,$B$2:$B$7)<=3'}</F> and tell Excel which reps are
            in the top 3.
          </p>
        </>
      ),
      hint: 'Ana (120) ranks 2nd, so it is TRUE.',
      success: 'TRUE. Ana is in the top 3. Fill it down and you can see all three winners.',
      seed: REGIONS, fresh: true, select: 'H2',
      cells: { H2: true }, uses: 'RANK', sol: { H2: '=RANK(B2,$B$2:$B$7)<=3' },
    }),
  ],
};

export const finalTest: LessonContent = {
  key: 'ff-final-test',
  title: 'Final test',
  steps: [
    info('intro', 'Formulas & Functions final test', (
      <p>
        Six mixed tasks from the whole course. Use whatever approach works. Some answers can be built several ways.
      </p>
    )),
    task({
      id: 'abs', title: '1. Locked reference',
      body: (
        <p>
          <Cell>E2</Cell> holds a 20% commission. In <Cell>C2</Cell> write a formula for commission that you can fill down to{' '}
          <Cell>C4</Cell>, then fill it.
        </p>
      ),
      hint: '=B2*$E$2',
      success: 'Correct.',
      seed: { A1: 'Rep', B1: 'Sales', C1: 'Commission', A2: 'Ana', B2: '1000', A3: 'Ben', B3: '800', A4: 'Cleo', B4: '600', E1: 'Rate', E2: '0.2' }, fresh: true,
      select: 'C2', cells: { C2: 200, C3: 160, C4: 120 }, also: (c) => c.raw('C4').includes('$E$2'),
      sol: { C2: '=B2*$E$2', C3: '=B3*$E$2', C4: '=B4*$E$2' },
    }),
    task({
      id: 'ifs', title: '2. Tiers',
      body: (
        <p>
          In <Cell>D2</Cell> label sales: <strong>High</strong> if 900 or more, <strong>Mid</strong> if 700 or more, else{' '}
          <strong>Low</strong>.
        </p>
      ),
      hint: '=IFS(B2>=900,"High",B2>=700,"Mid",TRUE,"Low")',
      success: 'High.',
      seed: { A1: 'Rep', B1: 'Sales', A2: 'Ana', B2: '1000' }, fresh: true, select: 'D2',
      cells: { D2: 'High' }, sol: { D2: '=IFS(B2>=900,"High",B2>=700,"Mid",TRUE,"Low")' },
    }),
    task({
      id: 'sumifs', title: '3. Two conditions',
      body: (
        <p>
          In <Cell>F1</Cell> total the <strong>North</strong> sales from <strong>Feb</strong>.
        </p>
      ),
      hint: '=SUMIFS(C2:C7,A2:A7,"North",B2:B7,"Feb")',
      success: '150.',
      seed: { A1: 'Region', B1: 'Month', C1: 'Sales', A2: 'North', B2: 'Jan', C2: '100', A3: 'South', B3: 'Jan', C3: '80', A4: 'North', B4: 'Feb', C4: '150', A5: 'East', B5: 'Jan', C5: '60', A6: 'South', B6: 'Feb', C6: '120', A7: 'North', B7: 'Jan', C7: '90' }, fresh: true,
      select: 'F1', cells: { F1: 150 }, uses: 'SUMIFS', sol: { F1: '=SUMIFS(C2:C7,A2:A7,"North",B2:B7,"Feb")' },
    }),
    task({
      id: 'text', title: '4. Clean text',
      body: (
        <p>
          A2 holds <strong>  MARIA   gomez </strong>. In <Cell>B2</Cell> return the properly cased, trimmed name.
        </p>
      ),
      hint: '=PROPER(TRIM(A2))',
      success: 'Maria Gomez.',
      seed: { A1: 'Name', A2: '  MARIA   gomez ' }, fresh: true, select: 'B2',
      cells: { B2: 'Maria Gomez' }, uses: ['PROPER', 'TRIM'], sol: { B2: '=PROPER(TRIM(A2))' },
    }),
    task({
      id: 'date', title: '5. Dates',
      body: (
        <p>
          A2 is a start date. In <Cell>B2</Cell> return the date exactly <strong>6 months</strong> later.
        </p>
      ),
      hint: '=EDATE(A2,6)',
      success: 'Correct.',
      seed: { A1: 'Start', B1: 'Review', A2: '2026-01-31' }, fresh: true, select: 'B2',
      cells: { B2: date(2026, 7, 31) }, uses: 'EDATE', sol: { B2: '=EDATE(A2,6)' },
    }),
    task({
      id: 'lookup', title: '6. Lookup',
      body: (
        <p>
          In <Cell>F2</Cell> return the price of <strong>Bag</strong> from the catalog, and show <strong>n/a</strong> if it is missing.
        </p>
      ),
      hint: '=IFNA(XLOOKUP("Bag",B2:B5,C2:C5),"n/a")',
      success: 'Course complete! 25.',
      seed: CATALOG, fresh: true, select: 'F2',
      cells: { F2: 25 }, sol: { F2: '=IFNA(XLOOKUP("Bag",B2:B5,C2:C5),"n/a")' },
    }),
  ],
};

function date(y: number, m: number, d: number) {
  return E.dateToSerial(y, m, d);
}
