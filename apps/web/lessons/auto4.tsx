// Excel Automation, unit 4: modern automation, capstone and final.
import { custom, grid, info } from './dsl';
import { Cell } from './kbd';
import { AUTO_SHEET, Code, codeHas, macroStep, ranOk } from './auto-util';
import type { LessonContent, MacroConfig } from './types';

const T = (code: string): MacroConfig => ({ lang: 'ts', code });
const V = (code: string, extra: Partial<MacroConfig> = {}): MacroConfig => ({ lang: 'vba', code, ...extra });
const RUN = 'Run script (Excel Online)';
const MAIL = 'Send an email (V2)';

// ---------------------------------------------------------------------------
const S0 = `function main(workbook: ExcelScript.Workbook) {
  let sheet = workbook.getActiveWorksheet();
  sheet.getRange("A1").setValue("Hello from Office Scripts");
}
`;
const S1 = `function main(workbook: ExcelScript.Workbook) {
  let sheet = workbook.getActiveWorksheet();
  sheet.getRange("A1:B1").setValues([["Name", "Qty"]]);
  sheet.getRange("A1:B1").getFormat().getFont().setBold(true);
}
`;
const S2 = `function main(workbook: ExcelScript.Workbook) {
  let sheet = workbook.getActiveWorksheet();
  for (let i = 1; i <= 5; i++) {
    sheet.getCell(i, 0).setValue(i * 10);
  }
}
`;
export const autoScriptBasics: LessonContent = {
  key: 'auto-script-basics',
  title: 'Office Scripts basics',
  sheet: AUTO_SHEET,
  macro: T(S0),
  steps: [
    info('intro', 'Automation for Excel on the web', (
      <>
        <p>
          <strong>Office Scripts</strong> is the modern, web-based alternative to VBA. Scripts are written in <strong>TypeScript</strong> (JavaScript with types), stored in your OneDrive, and run in Excel for the web. Because they live in the cloud, other tools
          such as Power Automate can run them.
        </p>
        <Code>{`function main(workbook: ExcelScript.Workbook) {
  let sheet = workbook.getActiveWorksheet();
  sheet.getRange("A1").setValue("Hello");
}`}</Code>
        <p>
          Every script has a <code>main</code> function that receives the <code>workbook</code>. From it you get a worksheet, then ranges, then call methods such as <code>setValue</code>, <code>getValue</code> and <code>getFormat()</code>. In Excel, <strong>Automate → Record Actions</strong>{' '}
          writes a script for you, just like the macro recorder.
        </p>
        <p>Where VBA says <code>Range("A1").Value = 1</code>, Office Scripts says <code>sheet.getRange("A1").setValue(1)</code>.</p>
      </>
    )),
    macroStep({
      id: 'run', title: 'Run a script',
      body: <p>Open the <strong>Office Script</strong> tab and press <strong>Run</strong>. The script writes into <Cell>A1</Cell>.</p>,
      hint: 'Run is at the top of the editor.',
      success: 'A1 now holds the greeting.',
      seed: {}, fresh: true, select: 'A1',
      check: (c) => ranOk(c) && c.raw('A1') === 'Hello from Office Scripts',
      sol: { run: 'main' },
    }),
    macroStep({
      id: 'header', title: 'Write a bold header row',
      body: <p>Change the script so it writes <strong>Name</strong> and <strong>Qty</strong> into <Cell>A1:B1</Cell> with <code>setValues</code> and makes them bold with <code>getFormat().getFont().setBold(true)</code>. Run it.</p>,
      hint: 'setValues takes a grid: [["Name", "Qty"]].',
      success: 'A formatted header from three lines.',
      seed: {}, fresh: true, select: 'A1', resetPanels: true, macro: T(S0),
      check: (c) => ranOk(c) && c.raw('A1') === 'Name' && c.raw('B1') === 'Qty' && !!c.style('A1').b && !!c.style('B1').b,
      sol: { code: S1, run: 'main' },
    }),
    macroStep({
      id: 'loop', title: 'Loop in TypeScript',
      body: <p>Use a <code>for</code> loop to write 10, 20, 30, 40, 50 into <Cell>A2:A6</Cell>. <code>sheet.getCell(row, column)</code> counts from 0, so row 1 is the second row.</p>,
      hint: 'for (let i = 1; i <= 5; i++) { sheet.getCell(i, 0).setValue(i * 10); }',
      success: 'The same loop idea as VBA, different spelling.',
      seed: {}, fresh: true, select: 'A1', resetPanels: true, macro: T(S0),
      check: (c) => ranOk(c) && c.value('A2') === 10 && c.value('A6') === 50 && codeHas(c, /\bfor\b/),
      sol: { code: S2, run: 'main' },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const autoFlow: LessonContent = {
  key: 'auto-flow',
  title: 'Power Automate flows',
  sheet: AUTO_SHEET,
  flow: {},
  steps: [
    info('intro', 'Let the cloud do the clicking', (
      <>
        <p>
          <strong>Power Automate</strong> builds <strong>flows</strong>: a <strong>trigger</strong> (what starts it) followed by <strong>actions</strong> (what happens). The Excel Online connector has a <strong>Run script</strong> action, so a flow can run an Office Script on a workbook, and then do
          things Excel cannot do alone: send an email, post to Teams, save a file.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Manual</strong>: you press a button.
          </li>
          <li>
            <strong>Recurrence</strong>: a schedule, such as every day at 07:00.
          </li>
          <li>
            <strong>Event</strong>: a file is created, an email arrives.
          </li>
        </ul>
        <p>
          The flow builder here is a simulation of the real designer. It checks your steps and logs a test run, but sends nothing for real.
        </p>
      </>
    )),
    macroStep({
      id: 'first', title: 'Build a manual flow',
      body: <p>Open the <strong>Power Automate</strong> tab. Choose the trigger <strong>Manually trigger a flow</strong>, add a step <strong>Run script</strong> with the script name <strong>FormatReport</strong>, and press <strong>Test flow</strong>.</p>,
      hint: '+ New step adds an action. Fill in the script name or the test will flag it.',
      success: 'The test ran: trigger fired, step succeeded.',
      view: 'flow',
      check: (c) => c.flow?.trigger === 'Manually trigger a flow' && c.flow.steps.some((s) => s.action === RUN && s.setting.trim() !== '') && c.flow.tests >= 1,
      sol: {},
      solFlow: { trigger: 'Manually trigger a flow', steps: [{ action: RUN, setting: 'FormatReport' }], test: true },
    }),
    macroStep({
      id: 'email', title: 'Email the result',
      body: <p>Add a second step <strong>Send an email (V2)</strong> to <strong>boss@example.com</strong> (any address), placed <em>after</em> the script, and test again.</p>,
      hint: 'Order matters: use the arrows on a step to move it. The script must run first.',
      success: 'Script first, then the email, which is the order the work happens in.',
      view: 'flow',
      check: (c) => {
        const f = c.flow;
        if (!f) return false;
        const run = f.steps.findIndex((s) => s.action === RUN);
        const mail = f.steps.findIndex((s) => s.action === MAIL && /.+@.+/.test(s.setting));
        return run >= 0 && mail > run && f.tests >= 2;
      },
      sol: {},
      solFlow: { steps: [{ action: RUN, setting: 'FormatReport' }, { action: MAIL, setting: 'boss@example.com' }], test: true },
    }),
    macroStep({
      id: 'schedule', title: 'Run it every morning',
      body: <p>Change the trigger to <strong>Recurrence (schedule)</strong>: every <strong>1 Day</strong> at <strong>07:00</strong>.</p>,
      hint: 'Pick the trigger, then set the interval, frequency and hour.',
      success: 'Now it runs by itself every morning.',
      view: 'flow',
      check: (c) => c.flow?.trigger === 'Recurrence (schedule)' && c.flow.recurrence.frequency === 'Day' && c.flow.recurrence.interval === 1 && c.flow.recurrence.hour === 7,
      sol: {},
      solFlow: { trigger: 'Recurrence (schedule)', recurrence: { frequency: 'Day', interval: 1, hour: 7 } },
    }),
  ],
};

// ---------------------------------------------------------------------------
const R0 = `function main(workbook: ExcelScript.Workbook) {
  // refresh every data connection (Power Query, pivots), then stamp the sheet
}
`;
const R1 = `function main(workbook: ExcelScript.Workbook) {
  workbook.refreshAllDataConnections();
  workbook.getActiveWorksheet().getRange("A1").setValue("Refreshed");
}
`;
export const autoRefreshFlow: LessonContent = {
  key: 'auto-refresh-flow',
  title: 'Automating a scheduled refresh',
  sheet: AUTO_SHEET,
  macro: T(R0),
  flow: {},
  steps: [
    info('intro', 'A report that updates itself', (
      <>
        <p>
          Put the pieces together. A <strong>Power Query</strong> connection pulls fresh data when it is refreshed. An <strong>Office Script</strong> can refresh every connection with one line, <code>workbook.refreshAllDataConnections()</code>. A <strong>Power Automate</strong> flow
          can run that script on a schedule and email the owner.
        </p>
        <p>The result: nobody opens the file, and the numbers are current by 06:00.</p>
      </>
    )),
    macroStep({
      id: 'script', title: 'Write the refresh script',
      body: <p>In the script call <code>workbook.refreshAllDataConnections()</code> and then write <strong>Refreshed</strong> into <Cell>A1</Cell> so you can see it ran. Run it.</p>,
      hint: 'Two lines inside main.',
      success: 'The log shows every connection refreshed.',
      seed: {}, fresh: true, select: 'A1',
      check: (c) => ranOk(c) && (c.macro?.run?.output ?? []).some((o) => /Refreshed all data connections/.test(o)) && c.raw('A1') === 'Refreshed',
      sol: { code: R1, run: 'main' },
    }),
    macroStep({
      id: 'flow', title: 'Schedule it',
      body: <p>In Power Automate: trigger <strong>Recurrence (schedule)</strong>, every <strong>1 Day</strong> at <strong>06:00</strong>. Add <strong>Run script</strong> (name it <strong>RefreshReport</strong>) then <strong>Send an email (V2)</strong> to an address. Press <strong>Test flow</strong>.</p>,
      hint: 'Fill in every step setting, or the test will point to the gap.',
      success: 'A daily 06:00 refresh and an email when it is done.',
      view: 'flow',
      check: (c) => {
        const f = c.flow;
        if (!f) return false;
        const run = f.steps.findIndex((s) => s.action === RUN && /refresh/i.test(s.setting));
        const mail = f.steps.findIndex((s) => s.action === MAIL && /.+@.+/.test(s.setting));
        return f.trigger === 'Recurrence (schedule)' && f.recurrence.frequency === 'Day' && f.recurrence.hour === 6 && run >= 0 && mail > run && f.tests >= 1;
      },
      sol: {},
      solFlow: { trigger: 'Recurrence (schedule)', recurrence: { frequency: 'Day', interval: 1, hour: 6 }, steps: [{ action: RUN, setting: 'RefreshReport' }, { action: MAIL, setting: 'owner@example.com' }], test: true },
    }),
  ],
};

// ---------------------------------------------------------------------------
const SALES = grid([['Region', 'Product', 'Amount'], ['North', 'Pen', 120], ['South', 'Book', 80], ['East', 'Bag', 95], ['North', 'Book', 60], ['South', 'Pen', 140], ['East', 'Pen', 50], ['North', 'Bag', 100], ['East', 'Book', 75]]);
const CAP0 = `Sub BuildReport()
    ' 1. Write the headers Region and Total in E1:F1
    ' 2. List North, South and East in E2:E4
End Sub
`;
const CAP1 = `Sub BuildReport()
    Range("E1").Value = "Region"
    Range("F1").Value = "Total"
    Range("E2").Value = "North"
    Range("E3").Value = "South"
    Range("E4").Value = "East"
End Sub
`;
const CAP2 = `Sub BuildReport()
    Dim r As Integer
    Range("E1").Value = "Region"
    Range("F1").Value = "Total"
    Range("E2").Value = "North"
    Range("E3").Value = "South"
    Range("E4").Value = "East"
    For r = 2 To 4
        Cells(r, 6).Value = Application.WorksheetFunction.SumIf(Range("A2:A9"), Cells(r, 5), Range("C2:C9"))
    Next r
End Sub
`;
const CAP3 = `Sub BuildReport()
    Dim r As Integer
    Range("E1:F10").Clear
    Range("E1").Value = "Region"
    Range("F1").Value = "Total"
    Range("E2").Value = "North"
    Range("E3").Value = "South"
    Range("E4").Value = "East"
    For r = 2 To 4
        Cells(r, 6).Value = Application.WorksheetFunction.SumIf(Range("A2:A9"), Cells(r, 5), Range("C2:C9"))
    Next r
    Range("E5").Value = "Total"
    Range("F5").Formula = "=SUM(F2:F4)"
    Range("E1:F1").Font.Bold = True
    Range("F2:F5").NumberFormat = "#,##0"
End Sub
`;
export const autoCapstone: LessonContent = {
  key: 'auto-capstone',
  title: 'Capstone: one-click monthly report',
  sheet: AUTO_SHEET,
  macro: V(CAP0, { buttons: true }),
  steps: [
    info('intro', 'Build the report macro', (
      <>
        <p>
          The sales data is in <Cell>A1:C9</Cell> (region, product, amount). Each month someone summarises it by region. You will turn that job into one macro, <strong>BuildReport</strong>, and a button, in four steps. Edit the same macro each time.
        </p>
      </>
    )),
    macroStep({
      id: 'labels', title: '1. Headers and region names',
      body: <p>Write <strong>Region</strong> and <strong>Total</strong> into <Cell>E1:F1</Cell>, and <strong>North</strong>, <strong>South</strong>, <strong>East</strong> into <Cell>E2:E4</Cell>. Run it.</p>,
      hint: 'Range("E1").Value = "Region" and so on.',
      success: 'The skeleton of the report.',
      seed: SALES, fresh: true, select: 'A1',
      check: (c) => ranOk(c, 'BuildReport') && c.raw('E1') === 'Region' && c.raw('F1') === 'Total' && c.raw('E2') === 'North' && c.raw('E3') === 'South' && c.raw('E4') === 'East',
      sol: { code: CAP1, run: 'BuildReport' },
    }),
    macroStep({
      id: 'totals', title: '2. Total each region',
      body: <p>Fill <Cell>F2:F4</Cell> with each region's total. Use <code>Application.WorksheetFunction.SumIf(...)</code> in a loop over rows 2 to 4. Run it.</p>,
      hint: 'SumIf(Range("A2:A9"), Cells(r, 5), Range("C2:C9"))',
      success: 'North 280, South 220, East 220.',
      select: 'A1',
      check: (c) => ranOk(c, 'BuildReport') && c.value('F2') === 280 && c.value('F3') === 220 && c.value('F4') === 220,
      sol: { code: CAP2, run: 'BuildReport' },
    }),
    macroStep({
      id: 'format', title: '3. Grand total and formatting',
      body: <p>Add a <strong>Total</strong> row in <Cell>E5:F5</Cell> (<code>=SUM(F2:F4)</code>), bold the headers E1:F1, and give <Cell>F2:F5</Cell> the number format <code>#,##0</code>. Also start the macro with <code>Range("E1:F10").Clear</code> so re-running never leaves old results behind.</p>,
      hint: 'Range("F5").Formula = "=SUM(F2:F4)"; Range("E1:F1").Font.Bold = True; Range("F2:F5").NumberFormat = "#,##0"',
      success: 'A finished, repeatable report: total 720.',
      select: 'A1',
      check: (c) => ranOk(c, 'BuildReport') && c.value('F5') === 720 && !!c.style('E1').b && !!c.style('F1').b && ['F2', 'F3', 'F4', 'F5'].every((k) => c.style(k).nf === '#,##0') && codeHas(c, /\.Clear\b/i),
      sol: { code: CAP3, run: 'BuildReport' },
    }),
    macroStep({
      id: 'button', title: '4. One click',
      body: <p>Add a button labelled <strong>Build report</strong> for BuildReport and press it.</p>,
      hint: 'Buttons and shortcuts → text, macro, Add button, then click it.',
      success: 'Course project done: the whole monthly job in one click. Change the data and click again.',
      select: 'A1',
      check: (c) => !!c.macro?.buttons.some((b) => b.macro === 'BuildReport' && /build report/i.test(b.label)) && c.macro.buttonRuns >= 1 && ranOk(c, 'BuildReport') && c.value('F5') === 720,
      sol: { buttons: [{ label: 'Build report', macro: 'BuildReport' }], click: 'Build report' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const FIN_SEED = { ...grid([['Item', 'Price'], ['Pen', 1200], ['Book', 850], ['Bag', 2300]]), D1: 'Region', D2: 'North', D5: 'South', G1: '500' };
const F_LOOP = `Sub Sevens()
    Dim i As Integer
    ' For i = 1 To 5, write i * 7 into column J of row i
End Sub
`;
const F_UDF = `Function Net(gross)
    ' return gross after 20% deductions
End Function
`;
export const autoFinal: LessonContent = {
  key: 'auto-final',
  title: 'Course final',
  sheet: AUTO_SHEET,
  tools: ['numfmt', 'gotospecial'],
  macro: V(F_LOOP, { record: true, buttons: true }),
  flow: {},
  steps: [
    info('intro', 'Five automation jobs', <p>No-code tools, a VBA loop, a custom function, and a cloud flow. One of each.</p>),
    custom({
      id: 'fmt', title: '1. Prices as dollars',
      body: <p>Format <Cell>B2:B4</Cell> with the custom number format <code>$#,##0</code>.</p>,
      hint: 'Number format → type it → OK.',
      success: '$1,200, $850, $2,300.',
      seed: FIN_SEED, fresh: true, select: 'B2', view: 'sheet',
      check: (c) => c.display('B2') === '$1,200' && c.display('B3') === '$850' && c.display('B4') === '$2,300',
      sol: { styles: Object.fromEntries(['B2', 'B3', 'B4'].map((k) => [k, { nf: '$#,##0' }])), events: ['number-format'], view: 'sheet' },
    }),
    custom({
      id: 'blanks', title: '2. Fill the blank regions',
      body: <p>Column D has region names with gaps in <Cell>D2:D5</Cell>. Fill the blanks with the cell above using Go to special.</p>,
      hint: 'Select D2:D5 → Go to special → Blanks → cell above.',
      success: 'North on every row, South on the last.',
      select: 'D2', view: 'sheet',
      check: (c) => ['D2', 'D3', 'D4'].every((k) => c.value(k) === 'North') && c.value('D5') === 'South',
      sol: { cells: { D3: '=D2', D4: '=D3' }, events: ['goto-special'], view: 'sheet' },
    }),
    macroStep({
      id: 'loop', title: '3. A VBA loop',
      body: <p>Write 7, 14, 21, 28, 35 into <Cell>J1:J5</Cell> with a For loop. Run it.</p>,
      hint: 'Cells(i, 10).Value = i * 7',
      success: 'J5 = 35.',
      seed: {}, fresh: true, select: 'A1', resetPanels: true, macro: V(F_LOOP, { record: true, buttons: true }),
      check: (c) => ranOk(c) && c.value('J1') === 7 && c.value('J5') === 35 && codeHas(c, /\bFor\b/i),
      sol: { code: F_LOOP.replace("    ' For i = 1 To 5, write i * 7 into column J of row i\n", '    For i = 1 To 5\n        Cells(i, 10).Value = i * 7\n    Next i\n'), run: 'Sevens' },
    }),
    macroStep({
      id: 'udf', title: '4. A custom function',
      body: <p>Complete Net (gross minus 20%) and use <code>=Net(G1)</code> in <Cell>H1</Cell>. G1 holds 500.</p>,
      hint: 'Net = gross * 0.8',
      success: '400.',
      seed: { G1: '500' }, fresh: true, select: 'H1', resetPanels: true, macro: V(F_UDF, { record: true, buttons: true }),
      check: (c) => codeHas(c, /Function\s+Net\b/i) && c.value('H1') === 400 && /Net\(/i.test(c.raw('H1')),
      sol: { code: F_UDF.replace("    ' return gross after 20% deductions\n", '    Net = gross * 0.8\n') },
      cells: { H1: '=Net(G1)' },
    }),
    macroStep({
      id: 'flow', title: '5. A scheduled flow',
      body: <p>Build a flow: trigger <strong>Recurrence (schedule)</strong> every <strong>1 Week</strong>, a <strong>Run script</strong> step named <strong>WeeklyReport</strong>, then a <strong>Send an email (V2)</strong> step to an address. Test it.</p>,
      hint: 'Fill in all settings before testing.',
      success: 'Course complete. You can now automate Excel at every level, from a shortcut to the cloud.',
      view: 'flow',
      check: (c) => {
        const f = c.flow;
        if (!f) return false;
        const run = f.steps.findIndex((s) => s.action === RUN && s.setting.trim() !== '');
        const mail = f.steps.findIndex((s) => s.action === MAIL && /.+@.+/.test(s.setting));
        return f.trigger === 'Recurrence (schedule)' && f.recurrence.frequency === 'Week' && f.recurrence.interval === 1 && run >= 0 && mail > run && f.tests >= 1;
      },
      sol: {},
      solFlow: { trigger: 'Recurrence (schedule)', recurrence: { frequency: 'Week', interval: 1, hour: 7 }, steps: [{ action: RUN, setting: 'WeeklyReport' }, { action: MAIL, setting: 'team@example.com' }], test: true },
    }),
  ],
};

export const AUTO4 = [autoScriptBasics, autoFlow, autoRefreshFlow, autoCapstone, autoFinal];
