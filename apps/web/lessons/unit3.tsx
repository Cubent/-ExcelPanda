import { Cell, K } from './kbd';
import type { LessonContent } from './types';

const isFormula = (raw: string) => raw.trim().startsWith('=');
const uses = (raw: string, fn: string) => new RegExp(`\\b${fn}\\s*\\(`, 'i').test(raw);
const squash = (v: unknown) => String(v).trim().replace(/\s+/g, ' ').toLowerCase();
const near = (v: unknown, n: number, eps = 0.0005) => typeof v === 'number' && Math.abs(v - n) < eps;

// ---------------------------------------------------------------------------
// Clean your data
// ---------------------------------------------------------------------------
const MESSY = {
  A1: 'Raw name',
  A2: '  ana   LOPEZ ',
  A3: 'BEN kim',
  A4: ' cleo  park',
  A5: 'dev SHAH  ',
  B1: 'Clean name',
  D1: 'Phone',
  D2: '555-0101',
  D3: '555-0102',
};

export const cleanData: LessonContent = {
  key: 'clean-data',
  title: 'Clean your data',
  steps: [
    {
      id: 'intro',
      title: 'Real data is messy',
      body: (
        <>
          <p>
            Data pulled from forms and exports comes with stray spaces, random capitals and odd characters. Before you can
            analyse it, you clean it, and Excel has functions made for that.
          </p>
          <p>Column A below is a mess. Let's fix it without retyping a single name.</p>
        </>
      ),
    },
    {
      id: 'trim',
      title: 'TRIM extra spaces',
      body: (
        <>
          <p>
            In <Cell>B2</Cell> type <strong>=TRIM(A2)</strong>. It removes spaces at the start and end, and squashes double
            spaces to one.
          </p>
        </>
      ),
      hint: 'The result still has odd capitals, we fix that next.',
      success: 'The spaces are gone.',
      seed: MESSY,
      fresh: true,
      select: 'B2',
      check: (c) => uses(c.raw('B2'), 'TRIM') && c.value('B2') === 'ana LOPEZ' && !c.editing,
    },
    {
      id: 'proper',
      title: 'PROPER capitalises names',
      body: (
        <>
          <p>
            Functions can be nested. Replace <Cell>B2</Cell> with:
          </p>
          <p>
            <strong>=PROPER(TRIM(A2))</strong>
          </p>
        </>
      ),
      hint: 'TRIM runs first (inside), then PROPER on its result.',
      success: 'Ana Lopez. Each word starts with a capital.',
      seed: MESSY,
      select: 'B2',
      check: (c) => uses(c.raw('B2'), 'PROPER') && uses(c.raw('B2'), 'TRIM') && c.value('B2') === 'Ana Lopez' && !c.editing,
    },
    {
      id: 'fill',
      title: 'Clean the whole column',
      body: (
        <p>
          Fill it down to <Cell>B5</Cell> with <K>Ctrl</K> + <K>D</K> (select B2:B5 first).
        </p>
      ),
      hint: 'Click B2, Shift + ↓ three times, Ctrl + D.',
      success: 'Four messy names cleaned in two seconds.',
      seed: { ...MESSY, B2: '=PROPER(TRIM(A2))' },
      select: 'B2',
      check: (c) => c.value('B3') === 'Ben Kim' && c.value('B4') === 'Cleo Park' && c.value('B5') === 'Dev Shah',
    },
    {
      id: 'substitute',
      title: 'SUBSTITUTE removes characters',
      body: (
        <>
          <p>
            Phone numbers have dashes. In <Cell>E2</Cell> strip them out:
          </p>
          <p>
            <strong>=SUBSTITUTE(D2,"-","")</strong>
          </p>
        </>
      ),
      hint: 'Replace "-" with empty quotes "".',
      success: '5550101. SUBSTITUTE swaps one piece of text for another.',
      seed: MESSY,
      select: 'E2',
      check: (c) => uses(c.raw('E2'), 'SUBSTITUTE') && squash(c.value('E2')) === '5550101' && !c.editing,
    },
    {
      id: 'left',
      title: 'Take part of a text',
      body: (
        <>
          <p>
            Make a short code from the first 3 letters of the clean name. In <Cell>F2</Cell> type:
          </p>
          <p>
            <strong>=UPPER(LEFT(B2,3))</strong>
          </p>
          <p>LEFT takes characters from the start. RIGHT takes from the end. MID takes from the middle.</p>
        </>
      ),
      hint: 'B2 already holds Ana Lopez, so the code is ANA.',
      success: 'ANA.',
      seed: { ...MESSY, B2: '=PROPER(TRIM(A2))' },
      select: 'F2',
      check: (c) => uses(c.raw('F2'), 'LEFT') && c.value('F2') === 'ANA' && !c.editing,
    },
    {
      id: 'join',
      title: 'Join text together',
      body: (
        <>
          <p>
            Combine the code and phone into an ID. In <Cell>G2</Cell> type:
          </p>
          <p>
            <strong>=CONCAT(F2,"-",E2)</strong>
          </p>
        </>
      ),
      hint: 'CONCAT glues its arguments together, in order.',
      success: 'ANA-5550101. Clean, consistent IDs.',
      seed: { ...MESSY, B2: '=PROPER(TRIM(A2))', E2: '=SUBSTITUTE(D2,"-","")', F2: '=UPPER(LEFT(B2,3))' },
      select: 'G2',
      check: (c) => uses(c.raw('G2'), 'CONCAT') && c.value('G2') === 'ANA-5550101' && !c.editing,
    },
  ],
};

// ---------------------------------------------------------------------------
// Your first pivot
// ---------------------------------------------------------------------------
const ORDERS = {
  A1: 'Region',
  B1: 'Product',
  C1: 'Amount',
  A2: 'North',
  B2: 'Pen',
  C2: '40',
  A3: 'South',
  B3: 'Book',
  C3: '85',
  A4: 'North',
  B4: 'Book',
  C4: '60',
  A5: 'East',
  B5: 'Pen',
  C5: '30',
  A6: 'South',
  B6: 'Pen',
  C6: '45',
  A7: 'East',
  B7: 'Book',
  C7: '90',
  A8: 'North',
  B8: 'Bag',
  C8: '120',
  A9: 'South',
  B9: 'Bag',
  C9: '100',
};
const LABELS = { F1: 'North', F2: 'South', F3: 'East' };
const PIVOT_G = { G1: '=SUMIF($A$2:$A$9,F1,$C$2:$C$9)', G2: '=SUMIF($A$2:$A$9,F2,$C$2:$C$9)', G3: '=SUMIF($A$2:$A$9,F3,$C$2:$C$9)' };

export const firstPivot: LessonContent = {
  key: 'first-pivot',
  title: 'Your first pivot',
  steps: [
    {
      id: 'intro',
      title: 'What a pivot table does',
      body: (
        <>
          <p>
            A pivot table <strong>summarises</strong> a long list: one row per group (the Regions), with totals or counts
            beside each. Here are 8 orders. We will build the summary by hand so you understand exactly what a pivot does
            behind the scenes.
          </p>
          <p>
            The recipe: list each group once, then use <strong>SUMIF</strong> and <strong>COUNTIF</strong> to fill in the
            numbers.
          </p>
        </>
      ),
    },
    {
      id: 'labels',
      title: 'List each group once',
      body: (
        <p>
          In <Cell>F1:F3</Cell> type the three regions, one per cell: <strong>North</strong>, <strong>South</strong>,{' '}
          <strong>East</strong>.
        </p>
      ),
      hint: 'Type North, Enter, South, Enter, East, Enter.',
      success: 'These are the pivot rows.',
      seed: ORDERS,
      fresh: true,
      select: 'F1',
      check: (c) =>
        squash(c.raw('F1')) === 'north' && squash(c.raw('F2')) === 'south' && squash(c.raw('F3')) === 'east' && !c.editing,
    },
    {
      id: 'sumif',
      title: 'Total per region',
      body: (
        <>
          <p>
            In <Cell>G1</Cell> type:
          </p>
          <p>
            <strong>=SUMIF($A$2:$A$9,F1,$C$2:$C$9)</strong>
          </p>
          <p>
            The <strong>$</strong> signs lock the ranges so they do not move when we copy the formula. Press <K>F4</K> while
            typing a reference to add them.
          </p>
        </>
      ),
      hint: 'Region column A, the label in F1, and the amounts in column C.',
      success: '220. All of the North orders added up.',
      seed: { ...ORDERS, ...LABELS },
      select: 'G1',
      check: (c) => uses(c.raw('G1'), 'SUMIF') && c.raw('G1').includes('$') && c.value('G1') === 220 && !c.editing,
    },
    {
      id: 'fill',
      title: 'Fill the pivot down',
      body: (
        <p>
          Fill <Cell>G1</Cell> down to <Cell>G3</Cell>. Thanks to the locked ranges every row picks up its own label.
        </p>
      ),
      hint: 'Select G1:G3 and press Ctrl + D.',
      success: 'North 220, South 230, East 120.',
      seed: { ...ORDERS, ...LABELS, G1: PIVOT_G.G1 },
      select: 'G1',
      check: (c) => c.value('G2') === 230 && c.value('G3') === 120 && isFormula(c.raw('G2')),
    },
    {
      id: 'count',
      title: 'Count the orders',
      body: (
        <p>
          Add a second column: in <Cell>H1</Cell> type <strong>=COUNTIF($A$2:$A$9,F1)</strong>, then fill it down to{' '}
          <Cell>H3</Cell>.
        </p>
      ),
      hint: 'Same idea as SUMIF, but it counts rows.',
      success: 'North 3 orders, South 3, East 2. That is a two-value pivot.',
      seed: { ...ORDERS, ...LABELS, ...PIVOT_G },
      select: 'H1',
      check: (c) => uses(c.raw('H1'), 'COUNTIF') && c.value('H1') === 3 && c.value('H2') === 3 && c.value('H3') === 2,
    },
    {
      id: 'total',
      title: 'Grand total',
      body: (
        <p>
          In <Cell>G4</Cell> add the totals with <strong>=SUM(G1:G3)</strong>. It must match the sum of the raw amounts.
        </p>
      ),
      hint: 'Press Alt + = on G4 for a shortcut.',
      success: '570. A good pivot always adds back up to the source data.',
      seed: { ...ORDERS, ...LABELS, ...PIVOT_G },
      select: 'G4',
      check: (c) => uses(c.raw('G4'), 'SUM') && c.value('G4') === 570 && !c.editing,
    },
    {
      id: 'share',
      title: 'Share of total',
      body: (
        <>
          <p>
            In <Cell>I1</Cell> type <strong>=G1/$G$4</strong> to get the North's share, then press <K>Ctrl</K> +{' '}
            <K>Shift</K> + <K>%</K> to show it as a percentage.
          </p>
        </>
      ),
      hint: 'Do the formula first, then format the cell.',
      success: 'About 39%. Now you can see who drives the business.',
      seed: { ...ORDERS, ...LABELS, ...PIVOT_G, G4: '=SUM(G1:G3)' },
      select: 'I1',
      check: (c) => isFormula(c.raw('I1')) && near(c.value('I1'), 220 / 570) && c.style('I1').fmt === 'percent',
    },
  ],
};

// ---------------------------------------------------------------------------
// Charts that pop
// ---------------------------------------------------------------------------
const MONTHS = {
  A1: 'Month',
  B1: 'Sales',
  A2: 'Jan',
  B2: '120',
  A3: 'Feb',
  B3: '150',
  A4: 'Mar',
  B4: '90',
  A5: 'Apr',
  B5: '200',
  A6: 'May',
  B6: '170',
  A7: 'Jun',
  B7: '210',
};

export const chartsPop: LessonContent = {
  key: 'charts-pop',
  title: 'Charts that pop',
  steps: [
    {
      id: 'intro',
      title: 'Great charts start with great data',
      body: (
        <>
          <p>
            A chart is only as clear as the table behind it: one label column, one value column, no gaps. Pros also add{' '}
            <strong>helper columns</strong> that make the story obvious: change, growth, the average, the best point.
          </p>
          <p>Let's prepare monthly sales for charting. (You will drop it into a chart in Excel itself in one click.)</p>
        </>
      ),
    },
    {
      id: 'change',
      title: 'Change from last month',
      body: (
        <>
          <p>
            In <Cell>C3</Cell> type <strong>=B3-B2</strong>, then fill it down to <Cell>C7</Cell>.
          </p>
        </>
      ),
      hint: 'Select C3:C7 and press Ctrl + D.',
      success: 'March shows -60. Spikes and dips are easier to spot.',
      seed: MONTHS,
      fresh: true,
      select: 'C3',
      check: (c) => c.value('C3') === 30 && c.value('C4') === -60 && c.value('C7') === 40 && isFormula(c.raw('C7')),
    },
    {
      id: 'growth',
      title: 'Growth as a percentage',
      body: (
        <p>
          In <Cell>D3</Cell> type <strong>=(B3-B2)/B2</strong> and format it as a percent with <K>Ctrl</K> + <K>Shift</K> +{' '}
          <K>%</K>.
        </p>
      ),
      hint: 'Brackets first: (new - old) / old.',
      success: '25%. Percentages let you compare months fairly.',
      seed: MONTHS,
      select: 'D3',
      check: (c) => isFormula(c.raw('D3')) && near(c.value('D3'), 0.25) && c.style('D3').fmt === 'percent',
    },
    {
      id: 'average',
      title: 'A benchmark line',
      body: (
        <p>
          Charts look better with an average line. In <Cell>E2</Cell> type <strong>=AVERAGE($B$2:$B$7)</strong>.
        </p>
      ),
      hint: 'Lock the range with $ so it can be filled down later.',
      success: 'About 156.7. Anything above it is a good month.',
      seed: MONTHS,
      select: 'E2',
      check: (c) => uses(c.raw('E2'), 'AVERAGE') && near(c.value('E2'), 940 / 6, 0.01) && !c.editing,
    },
    {
      id: 'best',
      title: 'Find the star month',
      body: (
        <>
          <p>
            In <Cell>F2</Cell> find the highest sales with <strong>=MAX(B2:B7)</strong>.
          </p>
          <p>
            Then in <Cell>G2</Cell> find which month it was: <strong>=INDEX(A2:A7,MATCH(F2,B2:B7,0))</strong>.
          </p>
        </>
      ),
      hint: 'MATCH finds the position of 210, INDEX returns the month at that position.',
      success: 'Jun at 210. This is the point you would highlight on the chart.',
      seed: MONTHS,
      select: 'F2',
      check: (c) => c.value('F2') === 210 && uses(c.raw('G2'), 'INDEX') && c.value('G2') === 'Jun' && !c.editing,
    },
    {
      id: 'title',
      title: 'Write the chart title with a formula',
      body: (
        <>
          <p>
            A title that updates itself. In <Cell>H2</Cell> type:
          </p>
          <p>
            <strong>=CONCAT("Best month: ",G2)</strong>
          </p>
        </>
      ),
      hint: 'Text in quotes, then the cell reference.',
      success: 'Best month: Jun. Change the data and the title follows.',
      seed: { ...MONTHS, F2: '=MAX(B2:B7)', G2: '=INDEX(A2:A7,MATCH(F2,B2:B7,0))' },
      select: 'H2',
      check: (c) => isFormula(c.raw('H2')) && c.value('H2') === 'Best month: Jun' && !c.editing,
    },
  ],
};

// ---------------------------------------------------------------------------
// Dashboards
// ---------------------------------------------------------------------------
const SALES = {
  A1: 'Product',
  B1: 'Units',
  C1: 'Revenue',
  A2: 'Mug',
  B2: '10',
  C2: '80',
  A3: 'Shirt',
  B3: '4',
  C3: '80',
  A4: 'Cap',
  B4: '6',
  C4: '72',
  A5: 'Bag',
  B5: '3',
  C5: '75',
  A6: 'Pen',
  B6: '20',
  C6: '24',
  E1: 'Total revenue',
  E2: 'Units sold',
  E3: 'Average order',
  E4: 'Top product',
};

export const dashboards: LessonContent = {
  key: 'dashboards',
  title: 'Dashboards',
  toolbar: true,
  steps: [
    {
      id: 'intro',
      title: 'A dashboard is a few big numbers',
      body: (
        <>
          <p>
            A dashboard answers "how are we doing?" at a glance. It is a small block of <strong>KPIs</strong> (key numbers)
            that are all formulas, so they update when the data changes.
          </p>
          <p>
            Data sits on the left. The labels for your KPIs are already in <Cell>E1:E4</Cell>. Fill in the numbers next to
            them.
          </p>
        </>
      ),
    },
    {
      id: 'revenue',
      title: 'Total revenue',
      body: (
        <p>
          In <Cell>F1</Cell> total the revenue column.
        </p>
      ),
      hint: '=SUM(C2:C6)',
      success: '331.',
      seed: SALES,
      fresh: true,
      select: 'F1',
      check: (c) => uses(c.raw('F1'), 'SUM') && c.value('F1') === 331 && !c.editing,
    },
    {
      id: 'units',
      title: 'Units sold',
      body: (
        <p>
          In <Cell>F2</Cell> total the units column.
        </p>
      ),
      hint: '=SUM(B2:B6)',
      success: '43 units.',
      seed: SALES,
      select: 'F2',
      check: (c) => uses(c.raw('F2'), 'SUM') && c.value('F2') === 43 && !c.editing,
    },
    {
      id: 'avg',
      title: 'Average revenue per product',
      body: (
        <p>
          In <Cell>F3</Cell> find the average revenue.
        </p>
      ),
      hint: '=AVERAGE(C2:C6)',
      success: '66.2.',
      seed: SALES,
      select: 'F3',
      check: (c) => uses(c.raw('F3'), 'AVERAGE') && near(c.value('F3'), 66.2, 0.01) && !c.editing,
    },
    {
      id: 'top',
      title: 'Best product',
      body: (
        <>
          <p>
            In <Cell>F4</Cell> show the name of the product with the highest revenue by combining INDEX, MATCH and MAX:
          </p>
          <p>
            <strong>=INDEX(A2:A6,MATCH(MAX(C2:C6),C2:C6,0))</strong>
          </p>
        </>
      ),
      hint: 'MAX finds 80, MATCH finds where 80 is, INDEX returns the product name there.',
      success: 'Mug. A KPI that names the winner.',
      seed: SALES,
      select: 'F4',
      check: (c) => uses(c.raw('F4'), 'INDEX') && c.value('F4') === 'Mug' && !c.editing,
    },
    {
      id: 'style',
      title: 'Style it like a dashboard',
      body: (
        <>
          <p>
            Make the labels <Cell>E1:E4</Cell> bold with <K>Ctrl</K> + <K>B</K>, and show <Cell>F1</Cell> as currency with{' '}
            <K>Ctrl</K> + <K>Shift</K> + <K>$</K>.
          </p>
          <p>Optionally add a fill colour with the toolbar. Presentation matters on a dashboard.</p>
        </>
      ),
      hint: 'Select E1:E4 first for the bold, then click F1 for the currency.',
      success: 'Dashboard ready. Four KPIs, all live formulas.',
      seed: { ...SALES, F1: '=SUM(C2:C6)', F2: '=SUM(B2:B6)', F3: '=AVERAGE(C2:C6)', F4: '=INDEX(A2:A6,MATCH(MAX(C2:C6),C2:C6,0))' },
      select: 'E1',
      check: (c) => ['E1', 'E2', 'E3', 'E4'].every((k) => !!c.style(k).b) && c.style('F1').fmt === 'currency',
    },
  ],
};

// ---------------------------------------------------------------------------
// Unit 3 test
// ---------------------------------------------------------------------------
const TEAM = {
  A1: 'Name',
  B1: 'Region',
  C1: 'Sales',
  A2: '  dana   FOX ',
  B2: 'East',
  C2: '200',
  A3: 'lee  CHEN',
  B3: 'West',
  C3: '150',
  A4: ' omar  ali ',
  B4: 'East',
  C4: '100',
  A5: 'PRIYA rao',
  B5: 'West',
  C5: '250',
};

export const unit3Test: LessonContent = {
  key: 'unit3-test',
  title: 'Unit 3 test',
  steps: [
    {
      id: 'intro',
      title: 'Data analysis test',
      body: (
        <p>
          Five tasks: clean, summarise, share, find the top and present. The team data is in <Cell>A1:C5</Cell>.
        </p>
      ),
    },
    {
      id: 'clean',
      title: '1. Clean a name',
      body: (
        <p>
          In <Cell>D2</Cell> clean the name in A2 so it reads <strong>Dana Fox</strong>.
        </p>
      ),
      hint: '=PROPER(TRIM(A2))',
      success: 'Dana Fox.',
      seed: TEAM,
      fresh: true,
      select: 'D2',
      check: (c) => isFormula(c.raw('D2')) && c.value('D2') === 'Dana Fox' && !c.editing,
    },
    {
      id: 'summary',
      title: '2. East total',
      body: (
        <p>
          In <Cell>F1</Cell> total the sales of the <strong>East</strong> region.
        </p>
      ),
      hint: '=SUMIF(B2:B5,"East",C2:C5)',
      success: '300.',
      seed: TEAM,
      select: 'F1',
      check: (c) => uses(c.raw('F1'), 'SUMIF') && c.value('F1') === 300 && !c.editing,
    },
    {
      id: 'share',
      title: '3. East share',
      body: (
        <p>
          In <Cell>F2</Cell> show East's share of all sales as a <strong>percentage</strong>.
        </p>
      ),
      hint: '=F1/SUM(C2:C5) then Ctrl + Shift + %',
      success: 'About 43%.',
      seed: { ...TEAM, F1: '=SUMIF(B2:B5,"East",C2:C5)' },
      select: 'F2',
      check: (c) => isFormula(c.raw('F2')) && near(c.value('F2'), 300 / 700) && c.style('F2').fmt === 'percent',
    },
    {
      id: 'top',
      title: '4. Top performer',
      body: (
        <p>
          In <Cell>F3</Cell> find the best sales figure. In <Cell>F4</Cell> look up the name that goes with it.
        </p>
      ),
      hint: '=MAX(C2:C5) and =XLOOKUP(F3,C2:C5,A2:A5)',
      success: 'Priya made the top sale of 250.',
      seed: TEAM,
      select: 'F3',
      check: (c) => c.value('F3') === 250 && isFormula(c.raw('F4')) && squash(c.value('F4')) === 'priya rao',
    },
    {
      id: 'present',
      title: '5. Present it',
      body: (
        <p>
          Bold the header row <Cell>A1:C1</Cell> and show <Cell>C2:C5</Cell> as currency.
        </p>
      ),
      hint: 'Ctrl + B for bold. Ctrl + Shift + $ for currency.',
      success: 'Unit 3 complete. You finished the course basics.',
      seed: TEAM,
      select: 'A1',
      check: (c) => ['A1', 'B1', 'C1'].every((k) => !!c.style(k).b) && ['C2', 'C3', 'C4', 'C5'].every((k) => c.style(k).fmt === 'currency'),
    },
  ],
};
