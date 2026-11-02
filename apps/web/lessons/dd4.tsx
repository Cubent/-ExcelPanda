// Data & Dashboards, unit 4: dashboard design.
import { custom, grid, info, task } from './dsl';
import { Cell, F } from './kbd';
import { DD_SHEET } from './dd-util';
import type { LessonContent, StepCtx } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const REV = [120, 135, 90, 150, 160, 145];
const TGT = [100, 110, 120, 130, 140, 150];
export const DASH = grid([['Month', 'Revenue', 'Target'], ...MONTHS.map((m, i) => [m, REV[i], TGT[i]])]);
const bar = (n: number) => '█'.repeat(Math.round(n / 20));
const cc = (c: StepCtx) => c.chart?.config;

// ---------------------------------------------------------------------------
export const dashKpi: LessonContent = {
  key: 'dd-dash-kpi',
  title: 'KPI cards',
  sheet: DD_SHEET,
  steps: [
    info('intro', 'Answer the main question first', (
      <>
        <p>
          A dashboard exists to answer a question at a glance: <em>are we on track?</em> The answer goes at the <strong>top-left</strong>, where eyes land first, as a few big numbers called{' '}
          <strong>KPI cards</strong>. Details and charts come below.
        </p>
        <p>
          Monthly revenue and target are in <Cell>A1:C7</Cell>. Build four KPIs in column E.
        </p>
      </>
    )),
    task({
      id: 'total', title: 'Total revenue',
      body: <p>In <Cell>E2</Cell> add up the revenue: <F>=SUM(B2:B7)</F>.</p>,
      hint: 'SUM over B2:B7.',
      success: '800.',
      seed: DASH, fresh: true, select: 'E2', cells: { E2: 800 }, uses: 'SUM', sol: { E2: '=SUM(B2:B7)' },
    }),
    task({
      id: 'vs', title: 'Against target',
      body: <p>In <Cell>E3</Cell> divide revenue by the total target: <F>=E2/SUM(C2:C7)</F>.</p>,
      hint: 'Target total is SUM(C2:C7).',
      success: '106.7% of target (shown as 1.0667 until you format it).',
      cells: { E3: 800 / 750 }, uses: 'SUM', sol: { E3: '=E2/SUM(C2:C7)' },
    }),
    task({
      id: 'best', title: 'Best month',
      body: <p>In <Cell>E4</Cell> return the name of the best month with <F>=INDEX(A2:A7,MATCH(MAX(B2:B7),B2:B7,0))</F>.</p>,
      hint: 'MAX finds the biggest revenue; MATCH finds where it is; INDEX returns the month.',
      success: 'May.',
      cells: { E4: 'May' }, uses: ['INDEX', 'MATCH', 'MAX'], sol: { E4: '=INDEX(A2:A7,MATCH(MAX(B2:B7),B2:B7,0))' },
    }),
    task({
      id: 'change', title: 'Change on last month',
      body: <p>In <Cell>E5</Cell> show how June compares with May: <F>=B7/B6-1</F>.</p>,
      hint: 'Latest divided by previous, minus one.',
      success: '-9.4%. A KPI should always say whether it is good or bad, not only how big it is.',
      cells: { E5: 145 / 160 - 1 }, sol: { E5: '=B7/B6-1' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const TITLE = grid([['Sales dashboard'], [''], ['Revenue', '800'], ['Target', '750'], ['Growth', '0.0667']]);
export const dashLayout: LessonContent = {
  key: 'dd-dash-layout',
  title: 'Layout & formatting',
  sheet: DD_SHEET,
  toolbar: true,
  steps: [
    info('intro', 'Design is hierarchy', (
      <>
        <p>People read a dashboard in a Z or F pattern: top-left first, then across, then down. So:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Put the headline numbers at the top, the detail below.</li>
          <li>Make the most important thing the biggest or boldest. Everything else recedes.</li>
          <li>Group related items and leave empty space between groups.</li>
          <li>Format numbers the way a reader expects: currency, percent, no needless decimals.</li>
        </ul>
      </>
    )),
    custom({
      id: 'title', title: 'Make the title stand out',
      body: <p>Select <Cell>A1</Cell> and make it <strong>bold</strong> with a dark <strong>fill colour</strong> and white text.</p>,
      hint: 'Use Bold, Fill colour and Font colour in the toolbar.',
      success: 'The title anchors the page.',
      seed: TITLE, fresh: true, select: 'A1',
      check: (c) => !!c.style('A1').b && !!c.style('A1').bg && !!c.style('A1').color,
      sol: { styles: { A1: { b: true, bg: '#1F4D3A', color: '#FFFFFF' } } },
    }),
    custom({
      id: 'currency', title: 'Format the numbers',
      body: <p>Format <Cell>B3:B4</Cell> as <strong>currency</strong> and <Cell>B5</Cell> as a <strong>percent</strong>.</p>,
      hint: 'Select the cells, then use the number-format buttons in the toolbar.',
      success: 'Revenue and target show as money, growth as a percent.',
      select: 'B3',
      check: (c) => c.style('B3').fmt === 'currency' && c.style('B4').fmt === 'currency' && c.style('B5').fmt === 'percent',
      sol: { styles: { B3: { fmt: 'currency' }, B4: { fmt: 'currency' }, B5: { fmt: 'percent' } } },
    }),
    custom({
      id: 'emphasis', title: 'Emphasise the headline',
      body: <p>Make the labels in <Cell>A3:A5</Cell> bold and give the key figure <Cell>B3</Cell> the bold treatment too. Everything else stays plain.</p>,
      hint: 'Bold A3, A4, A5 and B3.',
      success: 'Hierarchy: the eye goes to revenue first.',
      select: 'A3',
      check: (c) => !!c.style('A3').b && !!c.style('A4').b && !!c.style('A5').b && !!c.style('B3').b && !c.style('B4').b && !c.style('B5').b,
      sol: { styles: { A3: { b: true }, A4: { b: true }, A5: { b: true }, B3: { b: true, fmt: 'currency' } } },
    }),
  ],
};

// ---------------------------------------------------------------------------
const STATUS_CELLS = Object.fromEntries(
  MONTHS.map((_, i) => [`D${i + 2}`, (v: unknown) => v === (REV[i] >= TGT[i] ? '▲ On target' : '▼ Below target')]),
);
export const dashStatus: LessonContent = {
  key: 'dd-dash-status',
  title: 'Status that survives colour-blindness',
  sheet: DD_SHEET,
  steps: [
    info('intro', 'Never rely on red and green alone', (
      <p>
        About 1 in 12 men cannot tell red from green. A good status uses colour <em>and</em> a symbol <em>and</em> words, so the message survives in black-and-white, on a projector and for every reader.
      </p>
    )),
    task({
      id: 'status', title: 'Add a status column',
      body: (
        <p>
          In <Cell>D2</Cell> write <F>{'=IF(B2>=C2,"▲ On target","▼ Below target")'}</F> and fill it down to <Cell>D7</Cell>.
        </p>
      ),
      hint: 'Copy D2 and paste it into D3:D7, or type the formula in each cell.',
      success: 'Four months on target, two below.',
      seed: DASH, fresh: true, select: 'D2', cells: STATUS_CELLS, uses: 'IF',
      sol: Object.fromEntries(MONTHS.map((_, i) => [`D${i + 2}`, `=IF(B${i + 2}>=C${i + 2},"▲ On target","▼ Below target")`])),
    }),
    task({
      id: 'count', title: 'Count the good months',
      body: <p>In <Cell>F2</Cell> count the months on target: <F>{'=COUNTIF(D2:D7,"▲*")'}</F>.</p>,
      hint: 'The asterisk matches whatever text follows the symbol.',
      success: '4 of 6.',
      cells: { F2: 4 }, uses: 'COUNTIF', sol: { F2: '=COUNTIF(D2:D7,"▲*")' },
    }),
    task({
      id: 'summary', title: 'Write the headline as a sentence',
      body: <p>In <Cell>F3</Cell> join the count into a sentence: <F>{'=F2&" of "&COUNTA(A2:A7)&" months on target"'}</F>.</p>,
      hint: 'Join text and numbers with &.',
      success: '"4 of 6 months on target". Words beat decoration.',
      cells: { F3: '4 of 6 months on target' }, uses: ['COUNTA'], sol: { F3: '=F2&" of "&COUNTA(A2:A7)&" months on target"' },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const dashBars: LessonContent = {
  key: 'dd-dash-bars',
  title: 'In-cell bars',
  sheet: DD_SHEET,
  steps: [
    info('intro', 'A chart that lives in a cell', (
      <p>
        <strong>REPT</strong> repeats text a number of times. Repeat the block character <strong>█</strong> and you get a bar whose length follows the value. It updates with the data, works anywhere, and
        sits right beside the number.
      </p>
    )),
    task({
      id: 'one', title: 'Draw one bar',
      body: <p>In <Cell>D2</Cell> make one block per 20 units: <F>{'=REPT("█",ROUND(B2/20,0))'}</F>.</p>,
      hint: 'ROUND turns 6.0 into 6 blocks.',
      success: 'Six blocks for 120.',
      seed: DASH, fresh: true, select: 'D2', cells: { D2: bar(120) }, uses: ['REPT'], sol: { D2: '=REPT("█",ROUND(B2/20,0))' },
    }),
    task({
      id: 'all', title: 'Fill the column',
      body: <p>Copy the formula down so every month has a bar, <Cell>D2:D7</Cell>.</p>,
      hint: 'Relative references adjust as you fill down.',
      success: 'The shape of the year is visible in the cells themselves.',
      cells: Object.fromEntries(REV.map((v, i) => [`D${i + 2}`, bar(v)])), uses: ['REPT'],
      sol: Object.fromEntries(REV.map((_, i) => [`D${i + 2}`, `=REPT("█",ROUND(B${i + 2}/20,0))`])),
    }),
    task({
      id: 'target', title: 'Mark the target',
      body: <p>In <Cell>E2</Cell> add the target as a second bar in the same way, from column C.</p>,
      hint: 'Same formula with C2.',
      success: 'Compare the two bars: the gap is the story.',
      cells: { E2: bar(100) }, uses: ['REPT'], sol: { E2: '=REPT("█",ROUND(C2/20,0))' },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const dashChart: LessonContent = {
  key: 'dd-dash-chart',
  title: 'Choosing the right chart',
  sheet: DD_SHEET,
  chart: { allow: { types: ['column', 'bar', 'line', 'pie', 'combo'], options: true, axisTitles: true } },
  steps: [
    info('intro', 'One chart, one message', (
      <>
        <p>Match the chart to the question:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Trend over time</strong> → line.
          </li>
          <li>
            <strong>Compare categories</strong> → column or bar. Bars when the labels are long.
          </li>
          <li>
            <strong>Actual versus target</strong> → columns with the target as a line (combo).
          </li>
          <li>
            <strong>Parts of a whole</strong> → pie only for a few slices; otherwise a sorted bar.
          </li>
        </ul>
      </>
    )),
    custom({
      id: 'trend', title: 'Show the trend',
      body: <p>Open the <strong>Chart</strong> tab and chart the revenue by month (<strong>A1:B7</strong>) as a <strong>line</strong>.</p>,
      hint: 'Range A1:B7, type Line.',
      success: 'A line shows direction better than anything else.',
      seed: DASH, fresh: true, select: 'A1', view: 'chart', resetPanels: true,
      check: (c) => cc(c)?.type === 'line' && c.chart?.data.categories.length === 6 && c.chart?.data.series.length === 1,
      sol: { chart: { type: 'line', range: 'A1:B7' }, view: 'chart' },
    }),
    custom({
      id: 'target', title: 'Actual versus target',
      body: <p>Include the target (<strong>A1:C7</strong>) as a <strong>combo</strong> chart: columns for revenue, a line for the target.</p>,
      hint: 'Range A1:C7, type Combo.',
      success: 'You can see the months that fell short.',
      view: 'chart',
      check: (c) => cc(c)?.type === 'combo' && c.chart?.data.series.length === 2,
      sol: { chart: { type: 'combo', range: 'A1:C7' }, view: 'chart' },
    }),
    custom({
      id: 'title', title: 'Say what it shows',
      body: <p>Give the chart a title that states the message, not just the topic, for example <strong>Revenue missed target in March and June</strong>. Any title of at least three words will do.</p>,
      hint: 'Chart options → Title.',
      success: 'A good title tells the reader what to conclude.',
      view: 'chart',
      check: (c) => (cc(c)?.title ?? '').trim().split(/\s+/).filter(Boolean).length >= 3,
      sol: { chart: { type: 'combo', range: 'A1:C7', title: 'Revenue missed target in March and June' }, view: 'chart' },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const dashTest: LessonContent = {
  key: 'dd-dash-test',
  title: 'Unit test: dashboard',
  sheet: DD_SHEET,
  toolbar: true,
  chart: { allow: { types: ['column', 'line', 'combo'], options: true, axisTitles: true } },
  steps: [
    info('intro', 'Build the page', (
      <p>Use the monthly data to build a mini dashboard: a KPI, a status, a bar, and a chart.</p>
    )),
    task({
      id: 'kpi', title: '1. Headline KPI',
      body: <p>In <Cell>F2</Cell> show revenue as a percent of target: total revenue divided by total target.</p>,
      hint: '=SUM(B2:B7)/SUM(C2:C7)',
      success: '106.7%.',
      seed: DASH, fresh: true, select: 'F2', cells: { F2: 800 / 750 }, uses: ['SUM'], sol: { F2: '=SUM(B2:B7)/SUM(C2:C7)' },
    }),
    custom({
      id: 'fmt', title: '2. Format it as a percent',
      body: <p>Format <Cell>F2</Cell> as a <strong>percent</strong> and make it <strong>bold</strong>.</p>,
      hint: 'Toolbar: % and Bold.',
      success: 'A readable KPI.',
      select: 'F2',
      check: (c) => c.style('F2').fmt === 'percent' && !!c.style('F2').b,
      sol: { styles: { F2: { fmt: 'percent', b: true } } },
    }),
    task({
      id: 'status', title: '3. Status with a symbol',
      body: <p>In <Cell>D2</Cell> write a status for January that uses a symbol and words: ▲ On target when revenue reaches target, otherwise ▼ Below target.</p>,
      hint: '=IF(B2>=C2,"▲ On target","▼ Below target")',
      success: 'Redundant cues.',
      select: 'D2', cells: { D2: '▲ On target' }, uses: ['IF'], sol: { D2: '=IF(B2>=C2,"▲ On target","▼ Below target")' },
    }),
    custom({
      id: 'chart', title: '4. The chart',
      body: <p>In the Chart tab show actual versus target for all months as a <strong>combo</strong> chart.</p>,
      hint: 'Range A1:C7.',
      success: 'Unit complete.',
      view: 'chart', resetPanels: true,
      check: (c) => cc(c)?.type === 'combo' && c.chart?.data.series.length === 2 && c.chart?.data.categories.length === 6,
      sol: { chart: { type: 'combo', range: 'A1:C7' }, view: 'chart' },
    }),
  ],
};

export const DD4 = [dashKpi, dashLayout, dashStatus, dashBars, dashChart, dashTest];
