// Excel Automation, unit 2: macros with the recorder.
import { grid, info } from './dsl';
import { Cell } from './kbd';
import { AUTO_SHEET, Code, codeHas, codeOf, lastRecorded, macroStep, ranOk } from './auto-util';
import type { LessonContent } from './types';

const REC = { lang: 'vba' as const, record: true };

// ---------------------------------------------------------------------------
const HEADER_CODE = `Sub Macro1()
    ActiveCell.Value = "Name"
    Range("B1").Select
    ActiveCell.Value = "Qty"
    Range("A2").Select
End Sub
`;
export const autoMacroWhat: LessonContent = {
  key: 'auto-macro-what',
  title: 'What a macro is',
  sheet: AUTO_SHEET,
  macro: REC,
  steps: [
    info('intro', 'Record your steps, replay them forever', (
      <>
        <p>
          A <strong>macro</strong> is a saved list of actions. The <strong>macro recorder</strong> watches what you do and writes it down as VBA code; running the macro replays it. You do not need to know any code to record one.
        </p>
        <p>
          In Excel: <strong>View → Macros → Record Macro</strong> (or the Developer tab). In this practice sheet, use the <strong>VBA Editor</strong> tab: press <strong>Record macro</strong>, switch to the <strong>Data</strong> tab and work, then come back and press{' '}
          <strong>Stop recording</strong>.
        </p>
      </>
    )),
    macroStep({
      id: 'record', title: 'Record your first macro',
      body: (
        <p>
          Press <strong>Record macro</strong>. On the Data tab, with <Cell>A1</Cell> selected, type <strong>Name</strong>, press Tab, type <strong>Qty</strong>, press Enter. Return to the VBA Editor and press <strong>Stop recording</strong>.
        </p>
      ),
      hint: 'Record, then work on the Data tab, then Stop. The recorded code appears in the editor.',
      success: 'Your actions became code. Each line is one step.',
      seed: {}, fresh: true, select: 'A1',
      check: (c) => !!c.macro && c.macro.recorded.length >= 1 && codeHas(c, /"Name"/) && codeHas(c, /"Qty"/) && !c.macro.recording,
      sol: { code: HEADER_CODE, record: { name: 'Macro1', relative: false } },
    }),
    macroStep({
      id: 'run', title: 'Run it on an empty sheet',
      body: <p>The sheet is empty again. Pick your macro in <strong>Macro to run</strong> and press <strong>Run</strong>. The headers should appear.</p>,
      hint: 'The Run button is next to the macro list.',
      success: 'Name and Qty were typed for you. That is the whole idea.',
      seed: {}, fresh: true, select: 'A1', view: 'macro',
      check: (c) => ranOk(c) && c.raw('A1') === 'Name' && c.raw('B1') === 'Qty',
      sol: { run: 'Macro1' },
    }),
    macroStep({
      id: 'edit', title: 'Change the macro by editing its code',
      body: (
        <p>
          A recorded macro is just text. In the editor, change <strong>"Qty"</strong> to <strong>"Units"</strong>, run the macro again, and check <Cell>B1</Cell>.
        </p>
      ),
      hint: 'Click in the code, edit the word, then Run.',
      success: 'Edited and re-run. You are already programming.',
      select: 'A1',
      check: (c) => ranOk(c) && codeHas(c, /"Units"/) && !codeHas(c, /"Qty"/) && c.raw('B1') === 'Units',
      sol: { code: HEADER_CODE.replace('"Qty"', '"Units"'), run: 'Macro1' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const ABS_CODE = `Sub Macro1()
    Range("D1").Select
    ActiveCell.Value = "Total"
    Range("D2").Select
End Sub
`;
const REL_CODE = `${ABS_CODE}
Sub Macro2()
    ActiveCell.Value = "Total"
    ActiveCell.Offset(1, 0).Select
End Sub
`;
export const autoMacroRel: LessonContent = {
  key: 'auto-macro-rel',
  title: 'Absolute vs relative recording',
  sheet: AUTO_SHEET,
  macro: REC,
  steps: [
    info('intro', 'Why macros break', (
      <>
        <p>
          By default the recorder is <strong>absolute</strong>: it remembers the exact cells you clicked (<code>Range("D1").Select</code>). Run it from anywhere and it still goes to D1.
        </p>
        <p>
          With <strong>Use relative references</strong> switched on it records movement instead (<code>ActiveCell.Offset(1, 0).Select</code>: one row down from wherever you are). That is what you want for a macro that works on whichever cell is selected.
        </p>
        <p>Most "my macro put the data in the wrong place" problems are a recording in the wrong mode.</p>
      </>
    )),
    macroStep({
      id: 'abs', title: 'Record an absolute macro',
      body: <p>Press Record macro. On the Data tab click <Cell>D1</Cell>, type <strong>Total</strong>, press Enter. Stop recording.</p>,
      hint: 'Leave "Use relative references" off.',
      success: 'The code says Range("D1").Select: a fixed address.',
      seed: {}, fresh: true, select: 'A1',
      check: (c) => !!c.macro && c.macro.recorded.length >= 1 && !lastRecorded(c)?.relative && codeHas(c, /Range\("D1"\)\.Select/) && codeHas(c, /"Total"/),
      sol: { code: ABS_CODE, record: { name: 'Macro1', relative: false } },
    }),
    macroStep({
      id: 'abs-run', title: 'Run it from somewhere else',
      body: <p>Click <Cell>A5</Cell>, then run the macro. Where does <strong>Total</strong> land?</p>,
      hint: 'Select A5 on the Data tab first, then run from the editor.',
      success: 'In D1, not A5. Absolute macros ignore where you are.',
      seed: {}, fresh: true, select: 'A5',
      check: (c) => ranOk(c) && c.raw('D1') === 'Total' && c.raw('A5') === '',
      sol: { run: 'Macro1' },
    }),
    macroStep({
      id: 'rel', title: 'Record a relative macro',
      body: <p>Press Record macro, tick <strong>Use relative references</strong>, then on the Data tab (with <Cell>A1</Cell> selected) type <strong>Total</strong> and press Enter. Stop recording.</p>,
      hint: 'Tick the box before you start working on the sheet.',
      success: 'This time the code moves with Offset: relative to the active cell.',
      seed: {}, fresh: true, select: 'A1',
      check: (c) => !!c.macro && c.macro.recorded.length >= 2 && !!lastRecorded(c)?.relative && codeHas(c, /Offset\(/) && !c.macro.recording,
      sol: { code: REL_CODE, record: { name: 'Macro2', relative: true } },
    }),
    macroStep({
      id: 'rel-run', title: 'Run the relative macro from F3',
      body: <p>Click <Cell>F3</Cell>, choose your <strong>relative</strong> macro in the list, and run it.</p>,
      hint: 'It is the second macro in the list.',
      success: 'Total landed in F3: the cell you were on. A relative macro works wherever you stand.',
      seed: {}, fresh: true, select: 'F3',
      check: (c) => ranOk(c, lastRecorded(c)?.name) && c.raw('F3') === 'Total' && c.raw('D1') === '',
      sol: { run: 'Macro2' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const TOTAL_CODE = `Sub AddTotal()
    Range("B6").Formula = "=SUM(B1:B5)"
    Range("B6").Font.Bold = True
End Sub
`;
const NUMS = grid([[12], [8], [20], [5], [15]], 1, 0);
export const autoMacroButtons: LessonContent = {
  key: 'auto-macro-buttons',
  title: 'Buttons & shortcuts',
  sheet: AUTO_SHEET,
  macro: { lang: 'vba', code: TOTAL_CODE, buttons: true },
  steps: [
    info('intro', 'Run a macro without opening anything', (
      <>
        <p>Three ways to run a macro quickly:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            A <strong>button</strong> on the sheet (Developer → Insert → Button, then assign the macro).
          </li>
          <li>
            A <strong>shortcut key</strong> such as Ctrl+Shift+T (set in Macro Options).
          </li>
          <li>
            A <strong>Quick Access Toolbar</strong> slot (Alt+1, Alt+2, …).
          </li>
        </ul>
        <p>The macro here, AddTotal, writes a SUM in B6 and makes it bold.</p>
      </>
    )),
    macroStep({
      id: 'button', title: 'Add a button',
      body: <p>In <strong>Buttons and shortcuts</strong> type <strong>Add total</strong> as the button text, choose <strong>AddTotal</strong>, and press <strong>Add button</strong>.</p>,
      hint: 'Both the text and the macro are needed.',
      success: 'The button appears on the sheet.',
      seed: NUMS, fresh: true, select: 'A1',
      check: (c) => !!c.macro?.buttons.some((b) => b.macro === 'AddTotal' && b.label.trim() !== ''),
      sol: { buttons: [{ label: 'Add total', macro: 'AddTotal' }] },
    }),
    macroStep({
      id: 'click', title: 'Click your button',
      body: <p>Press the new button. Then look at <Cell>B6</Cell> on the Data tab.</p>,
      hint: 'The button is just under the form.',
      success: '60, bold. One click instead of several steps.',
      select: 'A1',
      check: (c) => !!c.macro && c.macro.buttonRuns >= 1 && ranOk(c, 'AddTotal') && c.value('B6') === 60 && !!c.style('B6').b,
      sol: { click: 'Add total' },
    }),
    macroStep({
      id: 'shortcut', title: 'Give it a shortcut key',
      body: <p>Type <strong>T</strong> in the <strong>Shortcut Ctrl+Shift+</strong> box for AddTotal. In Excel this is under Macros → Options.</p>,
      hint: 'Choose AddTotal in "Macro to run" first, then type the letter.',
      success: 'Ctrl+Shift+T would now run it in Excel. (The practice sheet runs macros from buttons and the Run button; it does not capture the keyboard.)',
      select: 'A1',
      check: (c) => (c.macro?.shortcuts.AddTotal ?? '') === 'T',
      sol: { shortcuts: { AddTotal: 'T' } },
    }),
  ],
};

// ---------------------------------------------------------------------------
const READ_CODE = `Sub Label()
    Range("D4").Select
    ActiveCell.Value = "Total"
    Selection.Font.Bold = True
End Sub
`;
const WITH_CODE = `Sub Banner()
    With Range("A1:C1")
        .Font.Bold = True
        .Interior.Color = RGB(255, 235, 156)
    End With
End Sub
`;
export const autoMacroRead: LessonContent = {
  key: 'auto-macro-read',
  title: 'Reading recorded code',
  sheet: AUTO_SHEET,
  macro: { lang: 'vba', code: READ_CODE },
  steps: [
    info('intro', 'It is just instructions', (
      <>
        <p>Recorded code looks strange at first, but it follows a pattern:</p>
        <Code>{`Range("D4").Select          ' go to a cell
ActiveCell.Value = "Total"  ' type into the selected cell
Selection.Font.Bold = True  ' change how the selection looks`}</Code>
        <p>
          <strong>Object.Property = value</strong> sets something; <strong>Object.Method</strong> does something. <code>Range("D4")</code> is the object, <code>.Value</code> the property, <code>.Select</code> a method.
        </p>
        <p>
          Recorders add many <code>.Select</code> lines because they copy your mouse. Real code usually skips selecting and talks to the cell directly.
        </p>
      </>
    )),
    macroStep({
      id: 'retarget', title: 'Point it at a different cell',
      body: <p>The macro Label writes into D4. Edit the code so it writes into <Cell>E4</Cell> instead, then run it.</p>,
      hint: 'Change "D4" to "E4" and press Run.',
      success: 'E4 says Total, and D4 stayed empty.',
      seed: {}, fresh: true, select: 'A1',
      check: (c) => ranOk(c, 'Label') && c.raw('E4') === 'Total' && c.raw('D4') === '' && !!c.style('E4').b,
      sol: { code: READ_CODE.replace('"D4"', '"E4"'), run: 'Label' },
    }),
    macroStep({
      id: 'noselect', title: 'Remove the Select',
      body: <p>Rewrite the macro so it needs no <code>.Select</code> at all: set the value and bold directly on <code>Range("D4")</code>. Run it.</p>,
      hint: 'Range("D4").Value = "Total" and Range("D4").Font.Bold = True.',
      success: 'Same result, three fewer lines to go wrong, and it no longer jumps around the sheet.',
      resetPanels: true, macro: { lang: 'vba', code: READ_CODE },
      seed: {}, fresh: true, select: 'A1',
      check: (c) => ranOk(c) && !codeHas(c, /\.Select/i) && !codeHas(c, /ActiveCell|Selection/i) && c.raw('D4') === 'Total' && !!c.style('D4').b,
      sol: { code: 'Sub Label()\n    Range("D4").Value = "Total"\n    Range("D4").Font.Bold = True\nEnd Sub\n', run: 'Label' },
    }),
    macroStep({
      id: 'with', title: 'Change a colour inside With',
      body: <p>Banner formats A1:C1 inside a <code>With</code> block (everything starting with a dot applies to that range). Change the colour to a light green, <code>RGB(198, 239, 206)</code>, and run it.</p>,
      hint: 'Edit the three numbers in RGB(...).',
      success: 'RGB mixes red, green and blue from 0 to 255.',
      resetPanels: true, macro: { lang: 'vba', code: WITH_CODE },
      seed: grid([['A', 'B', 'C']]), fresh: true, select: 'A1',
      check: (c) => ranOk(c, 'Banner') && c.style('A1').bg === '#c6efce' && !!c.style('C1').b && codeHas(c, /With/i),
      sol: { code: WITH_CODE.replace('255, 235, 156', '198, 239, 206'), run: 'Banner' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const HELLO_CODE = `Sub Hello()
    Range("A1").Value = "Hello"
End Sub
`;
export const autoMacroSecurity: LessonContent = {
  key: 'auto-macro-security',
  title: 'Macro security',
  sheet: AUTO_SHEET,
  macro: { lang: 'vba', code: HELLO_CODE, trust: true, trustStart: 'disable' },
  steps: [
    info('intro', 'Macros can run anything', (
      <>
        <p>
          A macro can read files, delete data and send things over the network. Malicious macros in email attachments are one of the most common ways to attack a computer, so Excel blocks them by default.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Disable with notification</strong>: the safe choice. A yellow bar appears and you decide, per file.
          </li>
          <li>
            <strong>Trusted locations</strong>: folders you mark as safe, whose files run macros without asking.
          </li>
          <li>
            <strong>Digitally signed</strong> macros prove who wrote them.
          </li>
          <li>
            <strong>Enable all</strong> is never a good idea.
          </li>
        </ul>
        <p>Only enable macros in files from people you know and trust. Files from the internet open in Protected View until you click Enable Editing.</p>
      </>
    )),
    macroStep({
      id: 'blocked', title: 'Try to run a blocked macro',
      body: <p>Macros are disabled in this workbook. Press <strong>Run</strong> on Hello and read the message.</p>,
      hint: 'Run is at the top of the editor.',
      success: 'Blocked. Excel never runs a macro it has not been allowed to.',
      seed: {}, fresh: true, select: 'A1',
      check: (c) => !!c.macro?.run && !c.macro.run.ok && /disabled/i.test(c.macro.run.error?.message ?? ''),
      sol: { run: 'Hello' },
    }),
    macroStep({
      id: 'notify', title: 'Choose the safe setting',
      body: <p>In <strong>Trust Center: macro settings</strong> choose <strong>Disable all macros with notification</strong>. It lets you enable a file you trust, one at a time.</p>,
      hint: 'The second option.',
      success: 'The recommended setting.',
      select: 'A1',
      check: (c) => c.macro?.trust === 'notify',
      sol: { trust: 'notify' },
    }),
    macroStep({
      id: 'run', title: 'Enable this file and run it',
      body: <p>You trust this workbook, so it may run. Press Run again.</p>,
      hint: 'Run on Hello.',
      success: 'Hello appears in A1.',
      select: 'A1',
      check: (c) => ranOk(c, 'Hello') && c.raw('A1') === 'Hello',
      sol: { run: 'Hello' },
    }),
    macroStep({
      id: 'xlsm', title: 'Save it in a macro-enabled format',
      body: <p>Under <strong>Save as type</strong> choose <strong>Excel Macro-Enabled Workbook (*.xlsm)</strong>. An ordinary .xlsx would silently throw the macro away.</p>,
      hint: 'The warning disappears once you pick .xlsm.',
      success: 'Macros live only in .xlsm (or .xlsb) files.',
      select: 'A1',
      check: (c) => c.macro?.fileType === 'xlsm',
      sol: { fileType: 'xlsm' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const REPORT_CODE = `Sub Macro1()
    ActiveCell.Value = "Report"
    Selection.Font.Bold = True
End Sub
`;
export const autoUnit2Test: LessonContent = {
  key: 'auto-unit2-test',
  title: 'Unit 2 test',
  sheet: AUTO_SHEET,
  macro: { lang: 'vba', record: true, buttons: true, trust: true, trustStart: 'notify' },
  steps: [
    info('intro', 'Macros test', <p>Record, run, attach to a button, then secure the file.</p>),
    macroStep({
      id: 'record', title: '1. Record a header macro',
      body: <p>Record a macro that, on <Cell>A1</Cell>, types <strong>Report</strong> and makes it bold (Ctrl+B).</p>,
      hint: 'Record, type Report, Enter, click A1, Ctrl+B, then stop.',
      success: 'Recorded.',
      seed: {}, fresh: true, select: 'A1',
      check: (c) => !!c.macro && c.macro.recorded.length >= 1 && codeHas(c, /"Report"/) && codeHas(c, /Font\.Bold = True/i) && !c.macro.recording,
      sol: { code: REPORT_CODE, record: { name: 'Macro1', relative: false } },
    }),
    macroStep({
      id: 'run', title: '2. Run it on an empty sheet',
      body: <p>The sheet is empty. Run your macro with <Cell>A1</Cell> selected.</p>,
      hint: 'Pick it in the list and press Run.',
      success: 'Report, in bold.',
      seed: {}, fresh: true, select: 'A1',
      check: (c) => ranOk(c) && c.raw('A1') === 'Report' && !!c.style('A1').b,
      sol: { run: 'Macro1' },
    }),
    macroStep({
      id: 'button', title: '3. Add a button',
      body: <p>Add a button labelled <strong>Make header</strong> that runs your macro.</p>,
      hint: 'Buttons and shortcuts → text, macro, Add button.',
      success: 'Button added.',
      select: 'A1',
      check: (c) => !!c.macro?.buttons.some((b) => /make header/i.test(b.label) && b.macro === lastRecorded(c)?.name),
      sol: { buttons: [{ label: 'Make header', macro: 'Macro1' }] },
    }),
    macroStep({
      id: 'save', title: '4. Save it safely',
      body: <p>Set the file type to <strong>.xlsm</strong> and make sure macros are set to <strong>Disable with notification</strong>.</p>,
      hint: 'Both settings are under the toolbar.',
      success: 'Unit complete.',
      select: 'A1',
      check: (c) => c.macro?.fileType === 'xlsm' && c.macro?.trust === 'notify',
      sol: { fileType: 'xlsm', trust: 'notify' },
    }),
  ],
};

export const AUTO2 = [autoMacroWhat, autoMacroRel, autoMacroButtons, autoMacroRead, autoMacroSecurity, autoUnit2Test];
void codeOf;
