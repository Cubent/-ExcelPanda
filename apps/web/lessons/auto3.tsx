// Excel Automation, unit 3: VBA fundamentals.
import { grid, info } from './dsl';
import { Cell } from './kbd';
import { AUTO_SHEET, Code, codeHas, macroStep, ranOk } from './auto-util';
import type { LessonContent, MacroConfig } from './types';

const V = (code: string): MacroConfig => ({ lang: 'vba', code });

// ---------------------------------------------------------------------------
const HELLO = `Sub Hello()
    Range("A1").Value = "Hello"
End Sub
`;
const HELLO2 = `Sub Hello()
    Range("A1").Value = "Hello, Excel"
    Range("A2").Value = "Done"
End Sub

Sub Greet()
    Range("B1").Value = "Ana"
End Sub
`;
export const autoVbaEditor: LessonContent = {
  key: 'auto-vba-editor',
  title: 'The VBA editor',
  sheet: AUTO_SHEET,
  macro: V(HELLO),
  steps: [
    info('intro', 'Where macros live', (
      <>
        <p>
          Press <strong>Alt+F11</strong> in Excel to open the <strong>Visual Basic Editor</strong>. Code is stored in <strong>modules</strong>, and a module is a list of <strong>procedures</strong>:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            A <code>Sub</code> does something (changes cells, formats, shows a message). It starts with <code>Sub Name()</code> and ends with <code>End Sub</code>.
          </li>
          <li>
            A <code>Function</code> returns a value, and can be used in a cell like <code>=Tax(A1)</code>.
          </li>
        </ul>
        <p>
          The <strong>VBA Editor</strong> tab here is the editor. Everything on a line after an apostrophe is a comment. This course uses a practical subset of VBA, enough to automate real spreadsheets.
        </p>
      </>
    )),
    macroStep({
      id: 'run', title: 'Run a Sub',
      body: <p>Hello writes a greeting into <Cell>A1</Cell>. Press <strong>Run</strong>.</p>,
      hint: 'Run is at the top of the editor.',
      success: 'A1 now says Hello.',
      seed: {}, fresh: true, select: 'A1',
      check: (c) => ranOk(c, 'Hello') && c.raw('A1') === 'Hello',
      sol: { run: 'Hello' },
    }),
    macroStep({
      id: 'edit', title: 'Edit and run again',
      body: <p>Change the text to <strong>Hello, Excel</strong> and add a second line that writes <strong>Done</strong> into <Cell>A2</Cell>. Run it.</p>,
      hint: 'Copy the Range line, change "A1" to "A2" and the text.',
      success: 'Two lines, executed top to bottom.',
      seed: {}, fresh: true, select: 'A1',
      check: (c) => ranOk(c, 'Hello') && c.raw('A1') === 'Hello, Excel' && c.raw('A2') === 'Done',
      sol: { code: HELLO2, run: 'Hello' },
    }),
    macroStep({
      id: 'sub2', title: 'Add a second Sub',
      body: <p>Below Hello, add a new <code>Sub Greet()</code> that writes a name into <Cell>B1</Cell>, end it with <code>End Sub</code>, then choose <strong>Greet</strong> in the list and run it.</p>,
      hint: 'Sub Greet() ... End Sub, then pick Greet in the macro list.',
      success: 'One module, two procedures.',
      seed: {}, fresh: true, select: 'A1',
      check: (c) => !!c.macro?.subs.some((s) => s.toLowerCase() === 'greet') && ranOk(c, 'Greet') && c.raw('B1').trim() !== '',
      sol: { code: HELLO2, run: 'Greet' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const CALC0 = `Sub Calc()
    ' Declare price (Double) and qty (Integer), then put price * qty in A1
End Sub
`;
const NAME0 = `Sub FullName()
    Dim first As String, last As String
    first = "Ana"
    last = "Lopez"
    ' Write the full name (first, a space, last) into B1
End Sub
`;
const TAX0 = `Sub TaxDue()
    ' Define a constant TaxRate = 0.2, then write 250 * TaxRate into C1
End Sub
`;
const OOPS = `Sub Oops()
    Dim n As Integer
    n = "abc"
    Range("A1").Value = n * 2
End Sub
`;
export const autoVbaVars: LessonContent = {
  key: 'auto-vba-vars',
  title: 'Variables & data types',
  sheet: AUTO_SHEET,
  macro: V(CALC0),
  steps: [
    info('intro', 'Named boxes for values', (
      <>
        <p>
          A <strong>variable</strong> is a named place to keep a value while the code runs. <code>Dim</code> declares it, and <code>As</code> says what type of value it holds:
        </p>
        <Code>{`Dim qty As Integer      ' whole numbers
Dim price As Double     ' decimals
Dim name As String      ' text
Dim done As Boolean     ' True or False
Const TaxRate As Double = 0.2   ' a value that never changes`}</Code>
        <p>
          Join text with <code>&amp;</code>. Declaring types catches mistakes early, and <code>Option Explicit</code> at the top of a module makes VBA insist that every variable is declared.
        </p>
      </>
    )),
    macroStep({
      id: 'calc', title: 'Declare, assign, use',
      body: <p>Complete Calc: declare <code>price</code> as Double and <code>qty</code> as Integer, set them to <strong>19.5</strong> and <strong>4</strong>, and write <code>price * qty</code> into <Cell>A1</Cell>. Run it.</p>,
      hint: 'Dim price As Double, qty As Integer, then price = 19.5, qty = 4.',
      success: '78.',
      seed: {}, fresh: true, select: 'A1', resetPanels: true, macro: V(CALC0),
      check: (c) => ranOk(c) && c.value('A1') === 78 && codeHas(c, /\bDim\b/i) && codeHas(c, /\bAs\s+Double\b/i) && codeHas(c, /\bAs\s+Integer\b/i),
      sol: { code: 'Sub Calc()\n    Dim price As Double, qty As Integer\n    price = 19.5\n    qty = 4\n    Range("A1").Value = price * qty\nEnd Sub\n', run: 'Calc' },
    }),
    macroStep({
      id: 'text', title: 'Join text',
      body: <p>Write the full name into <Cell>B1</Cell> using <code>&amp;</code> to join first, a space and last. Run it.</p>,
      hint: 'Range("B1").Value = first & " " & last',
      success: 'Ana Lopez.',
      seed: {}, fresh: true, select: 'A1', resetPanels: true, macro: V(NAME0),
      check: (c) => ranOk(c) && c.raw('B1') === 'Ana Lopez' && codeHas(c, /&/),
      sol: { code: NAME0.replace("    ' Write the full name (first, a space, last) into B1\n", '    Range("B1").Value = first & " " & last\n'), run: 'FullName' },
    }),
    macroStep({
      id: 'const', title: 'A constant for a fixed value',
      body: <p>Define <code>Const TaxRate As Double = 0.2</code> and write <code>250 * TaxRate</code> into <Cell>C1</Cell>.</p>,
      hint: 'Const goes inside the Sub, before you use it.',
      success: '50. Change the constant in one place and every use follows.',
      seed: {}, fresh: true, select: 'A1', resetPanels: true, macro: V(TAX0),
      check: (c) => ranOk(c) && c.value('C1') === 50 && codeHas(c, /\bConst\s+TaxRate\b/i),
      sol: { code: 'Sub TaxDue()\n    Const TaxRate As Double = 0.2\n    Range("C1").Value = 250 * TaxRate\nEnd Sub\n', run: 'TaxDue' },
    }),
    macroStep({
      id: 'mismatch', title: 'Read an error message',
      body: <p>Run Oops. Excel stops with <strong>Type mismatch</strong>: you cannot multiply text by a number. Fix the assignment so <Cell>A1</Cell> ends up as <strong>42</strong>.</p>,
      hint: 'n holds a number, not "abc". Which number doubled gives 42?',
      success: 'The error message names the problem; the line number says where.',
      seed: {}, fresh: true, select: 'A1', resetPanels: true, macro: V(OOPS),
      check: (c) => ranOk(c, 'Oops') && c.value('A1') === 42,
      sol: { code: OOPS.replace('"abc"', '21'), run: 'Oops' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const NUM5 = grid([[3], [7], [2], [9], [5]]);
const RNG_A = `Sub Fill()
    ' Put "x" in C1:C5 with a single line
End Sub
`;
const RNG_B = `Sub Shift()
    ' Put 99 one column to the right of A1, using Offset
End Sub
`;
const RNG_C = `Sub LastRow()
    ' Put the number of the last used row in column A into D1
End Sub
`;
const RNG_D = `Sub Zero()
    ' Set the first three cells of column A to 0 using Resize
End Sub
`;
export const autoVbaRanges: LessonContent = {
  key: 'auto-vba-ranges',
  title: 'Ranges & cells',
  sheet: AUTO_SHEET,
  macro: V(RNG_A),
  steps: [
    info('intro', 'Talking to the sheet', (
      <>
        <p>The sheet is full of objects. The ones you will use most:</p>
        <Code>{`Range("A1")                  ' a cell or block by address
Range("A1:C3").Value = 0     ' write to every cell in the block
Cells(row, column)           ' a cell by numbers: Cells(2, 3) is C2
Range("A1").Offset(1, 2)     ' one row down, two columns right
Range("A1").Resize(3, 2)     ' grow to 3 rows by 2 columns
Cells(Rows.Count, 1).End(xlUp).Row   ' the last used row in column A`}</Code>
        <p>
          <code>.Value</code> is the cell's contents and <code>.Formula</code> its formula. The last-row line starts at the very bottom of the column and jumps up to the last filled cell, exactly like pressing Ctrl+Up.
        </p>
      </>
    )),
    macroStep({
      id: 'block', title: 'Write to a block',
      body: <p>Fill <Cell>C1:C5</Cell> with <strong>x</strong> in one line. Run Fill.</p>,
      hint: 'Range("C1:C5").Value = "x"',
      success: 'Five cells, one line.',
      seed: NUM5, fresh: true, select: 'A1', resetPanels: true, macro: V(RNG_A),
      check: (c) => ranOk(c) && ['C1', 'C2', 'C3', 'C4', 'C5'].every((k) => c.raw(k) === 'x'),
      sol: { code: RNG_A.replace("    ' Put \"x\" in C1:C5 with a single line\n", '    Range("C1:C5").Value = "x"\n'), run: 'Fill' },
    }),
    macroStep({
      id: 'offset', title: 'Offset',
      body: <p>Use <code>Offset</code> from <code>Range("A1")</code> to put <strong>99</strong> in <Cell>B1</Cell>. Run Shift.</p>,
      hint: 'Offset(rows, columns): 0 rows down, 1 column right.',
      success: 'B1 = 99.',
      seed: NUM5, fresh: true, select: 'A1', resetPanels: true, macro: V(RNG_B),
      check: (c) => ranOk(c) && c.raw('B1') === '99' && codeHas(c, /Offset\(/i),
      sol: { code: RNG_B.replace("    ' Put 99 one column to the right of A1, using Offset\n", '    Range("A1").Offset(0, 1).Value = 99\n'), run: 'Shift' },
    }),
    macroStep({
      id: 'last', title: 'Find the last row',
      body: <p>Put the number of the last used row of column A into <Cell>D1</Cell> using <code>End(xlUp)</code>.</p>,
      hint: 'Cells(Rows.Count, 1).End(xlUp).Row',
      success: '5. This line is the foundation of most "do this for all my data" macros.',
      seed: NUM5, fresh: true, select: 'A1', resetPanels: true, macro: V(RNG_C),
      check: (c) => ranOk(c) && c.value('D1') === 5 && codeHas(c, /End\(xlUp\)/i),
      sol: { code: RNG_C.replace("    ' Put the number of the last used row in column A into D1\n", '    Range("D1").Value = Cells(Rows.Count, 1).End(xlUp).Row\n'), run: 'LastRow' },
    }),
    macroStep({
      id: 'resize', title: 'Resize a range',
      body: <p>Use <code>Resize(3, 1)</code> on <code>Range("A1")</code> to set <Cell>A1:A3</Cell> to <strong>0</strong>. A4 and A5 must stay as they were.</p>,
      hint: 'Range("A1").Resize(3, 1).Value = 0',
      success: 'A1:A3 are 0, A4 and A5 untouched.',
      seed: NUM5, fresh: true, select: 'A1', resetPanels: true, macro: V(RNG_D),
      check: (c) => ranOk(c) && ['A1', 'A2', 'A3'].every((k) => c.raw(k) === '0') && c.raw('A4') === '9' && c.raw('A5') === '5',
      sol: { code: RNG_D.replace("    ' Set the first three cells of column A to 0 using Resize\n", '    Range("A1").Resize(3, 1).Value = 0\n'), run: 'Zero' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const NUM8 = grid([[5], [12], [8], [20], [3], [17], [9], [30]]);
const L_A = `Sub Squares()
    Dim i As Integer
    ' For i = 1 To 8, write the square of column A's value into column B
End Sub
`;
const L_B = `Sub Mark()
    Dim i As Integer
    For i = 1 To 8
        ' If A(i) is over 10, write "big" into column C of the same row
    Next i
End Sub
`;
const L_C = `Sub FirstOver()
    Dim total As Long, i As Integer
    ' Add the numbers down column A one by one. Stop when the running total passes 50
    ' and write how many numbers that took into E1
End Sub
`;
const L_D = `Sub CountBig()
    Dim c As Range, n As Integer
    ' Count the cells in A1:A8 that are over 10 and write the count into F1
End Sub
`;
export const autoVbaLoops: LessonContent = {
  key: 'auto-vba-loops',
  title: 'Loops & conditions',
  sheet: AUTO_SHEET,
  macro: V(L_A),
  steps: [
    info('intro', 'Do the same thing a hundred times', (
      <>
        <Code>{`For i = 1 To 8
    Cells(i, 2).Value = i * 2      ' runs 8 times
Next i

If x > 10 Then
    ...
ElseIf x = 10 Then
    ...
Else
    ...
End If

Do While total <= 50           ' repeat until the test is false
    ...
Loop

For Each c In Range("A1:A8")   ' visit every cell in a range
    ...
Next c`}</Code>
        <p>
          These four structures cover most automation. Always make sure a <code>Do While</code> loop changes something that eventually ends it, or it never stops (the editor halts runaway code after a while).
        </p>
      </>
    )),
    macroStep({
      id: 'for', title: 'A For loop',
      body: <p>Write the square of each number in <Cell>A1:A8</Cell> into column B (B1 = A1², B2 = A2²…).</p>,
      hint: 'For i = 1 To 8 … Cells(i, 2).Value = Cells(i, 1).Value ^ 2 … Next i',
      success: '25, 144, 64 … 900.',
      seed: NUM8, fresh: true, select: 'A1', resetPanels: true, macro: V(L_A),
      check: (c) => ranOk(c) && c.value('B1') === 25 && c.value('B3') === 64 && c.value('B8') === 900 && codeHas(c, /\bFor\b/i) && codeHas(c, /\bNext\b/i),
      sol: { code: L_A.replace("    ' For i = 1 To 8, write the square of column A's value into column B\n", '    For i = 1 To 8\n        Cells(i, 2).Value = Cells(i, 1).Value ^ 2\n    Next i\n'), run: 'Squares' },
    }),
    macroStep({
      id: 'if', title: 'Decide with If',
      body: <p>Inside the loop, when the value in column A is over <strong>10</strong>, write <strong>big</strong> in column C of the same row.</p>,
      hint: 'If Cells(i, 1).Value > 10 Then Cells(i, 3).Value = "big"',
      success: 'Rows 2, 4, 6 and 8 are marked.',
      seed: NUM8, fresh: true, select: 'A1', resetPanels: true, macro: V(L_B),
      check: (c) => ranOk(c) && ['C2', 'C4', 'C6', 'C8'].every((k) => c.raw(k) === 'big') && ['C1', 'C3', 'C5', 'C7'].every((k) => c.raw(k) === '') && codeHas(c, /\bIf\b/i),
      sol: { code: L_B.replace("        ' If A(i) is over 10, write \"big\" into column C of the same row\n", '        If Cells(i, 1).Value > 10 Then Cells(i, 3).Value = "big"\n'), run: 'Mark' },
    }),
    macroStep({
      id: 'while', title: 'Loop until a condition',
      body: <p>Add the numbers down column A one at a time, and stop once the running total is over <strong>50</strong>. Write how many numbers that took into <Cell>E1</Cell>.</p>,
      hint: 'i = i + 1: total = total + Cells(i, 1).Value, inside Do While total <= 50.',
      success: '6: 5 + 12 + 8 + 20 + 3 = 48, and the sixth number (17) takes it to 65.',
      seed: NUM8, fresh: true, select: 'A1', resetPanels: true, macro: V(L_C),
      check: (c) => ranOk(c) && c.value('E1') === 6 && codeHas(c, /Do\s+While/i) && codeHas(c, /\bLoop\b/i),
      sol: { code: 'Sub FirstOver()\n    Dim total As Long, i As Integer\n    i = 0\n    Do While total <= 50\n        i = i + 1\n        total = total + Cells(i, 1).Value\n    Loop\n    Range("E1").Value = i\nEnd Sub\n', run: 'FirstOver' },
    }),
    macroStep({
      id: 'each', title: 'Visit every cell',
      body: <p>Use <code>For Each</code> to count the cells in <Cell>A1:A8</Cell> that are over 10, and write the count into <Cell>F1</Cell>.</p>,
      hint: 'For Each c In Range("A1:A8") … If c.Value > 10 Then n = n + 1',
      success: '4.',
      seed: NUM8, fresh: true, select: 'A1', resetPanels: true, macro: V(L_D),
      check: (c) => ranOk(c) && c.value('F1') === 4 && codeHas(c, /For\s+Each/i),
      sol: { code: 'Sub CountBig()\n    Dim c As Range, n As Integer\n    For Each c In Range("A1:A8")\n        If c.Value > 10 Then n = n + 1\n    Next c\n    Range("F1").Value = n\nEnd Sub\n', run: 'CountBig' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const U_A = `Function Tax(amount As Double) As Double
    ' return 20% of amount
End Function
`;
const U_B = `Function Grade(score)
    ' return "Pass" when score is 50 or more, otherwise "Fail"
End Function
`;
const U_C = `Function Discount(price, Optional pct = 0.1)
    ' return the price after taking off pct
End Function
`;
export const autoVbaUdf: LessonContent = {
  key: 'auto-vba-udf',
  title: 'Functions & UDFs',
  sheet: AUTO_SHEET,
  macro: V(U_A),
  steps: [
    info('intro', 'Your own worksheet function', (
      <>
        <p>
          A <strong>Function</strong> is a procedure that returns a value. Inside a Function you assign the result to the function's own name. Once it exists you can use it in any cell like a built-in function. This is called a <strong>user-defined function</strong> (UDF).
        </p>
        <Code>{`Function Double(x)
    Double = x * 2        ' the return value
End Function
' in a cell:  =Double(A1)`}</Code>
        <p>
          A UDF called from a cell may only <em>return</em> a value. It cannot change other cells, which is Excel's rule too. Write the code on the <strong>VBA Editor</strong> tab and use the function in a cell on the <strong>Data</strong> tab.
        </p>
      </>
    )),
    macroStep({
      id: 'tax', title: 'Write Tax()',
      body: <p>Complete Tax so it returns 20% of the amount. Then type <code>=Tax(A1)</code> into <Cell>B1</Cell> on the Data tab.</p>,
      hint: 'Tax = amount * 0.2',
      success: '50.',
      seed: { A1: '250' }, fresh: true, select: 'B1', resetPanels: true, macro: V(U_A),
      check: (c) => codeHas(c, /Function\s+Tax\b/i) && /^=\s*Tax\(/i.test(c.raw('B1')) && c.value('B1') === 50 && !c.editing,
      sol: { code: U_A.replace("    ' return 20% of amount\n", '    Tax = amount * 0.2\n') },
      cells: { B1: '=Tax(A1)' },
    }),
    macroStep({
      id: 'grade', title: 'A UDF with a decision',
      body: <p>Complete Grade to return <strong>Pass</strong> for 50 or more, else <strong>Fail</strong>. Use it in <Cell>B1:B3</Cell> for the scores in A1:A3 (72, 31, 50).</p>,
      hint: 'If score >= 50 Then Grade = "Pass" Else Grade = "Fail"',
      success: 'Pass, Fail, Pass.',
      seed: { A1: '72', A2: '31', A3: '50' }, fresh: true, select: 'B1', resetPanels: true, macro: V(U_B),
      check: (c) => codeHas(c, /Function\s+Grade\b/i) && c.value('B1') === 'Pass' && c.value('B2') === 'Fail' && c.value('B3') === 'Pass' && /Grade\(/i.test(c.raw('B2')),
      sol: { code: U_B.replace("    ' return \"Pass\" when score is 50 or more, otherwise \"Fail\"\n", '    If score >= 50 Then\n        Grade = "Pass"\n    Else\n        Grade = "Fail"\n    End If\n') },
      cells: { B1: '=Grade(A1)', B2: '=Grade(A2)', B3: '=Grade(A3)' },
    }),
    macroStep({
      id: 'optional', title: 'An optional argument',
      body: <p>Complete Discount (default <strong>10%</strong> off). Then put <code>=Discount(100)</code> in <Cell>D1</Cell> and <code>=Discount(100, 0.25)</code> in <Cell>D2</Cell>.</p>,
      hint: 'Discount = price * (1 - pct)',
      success: '90 and 75. Optional arguments with a default make a function flexible.',
      seed: {}, fresh: true, select: 'D1', resetPanels: true, macro: V(U_C),
      check: (c) => codeHas(c, /Function\s+Discount\b/i) && c.value('D1') === 90 && c.value('D2') === 75 && /Discount\(/i.test(c.raw('D1')),
      sol: { code: U_C.replace("    ' return the price after taking off pct\n", '    Discount = price * (1 - pct)\n') },
      cells: { D1: '=Discount(100)', D2: '=Discount(100, 0.25)' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const D_A = `Sub Squares()
    Dim i As Integer
    For i = 1 To 3
        Cells(i, 1).Value = i * i
End Sub
`;
const D_B = `Sub Ratios()
    Dim i As Integer
    For i = 1 To 4
        Cells(i, 2).Value = 100 / Cells(i, 1).Value
    Next i
End Sub
`;
const D_C = `Sub Report()
    Call Totl
End Sub

Sub Total()
    Range("C1").Value = Application.WorksheetFunction.Sum(Range("A1:A3"))
End Sub
`;
const D_D = `Sub Doubles()
    Dim i As Integer
    For i = 1 To 4
        Cells(i, 2).Value = Cells(i, 1).Value * 2
    Next i
End Sub
`;
export const autoVbaDebug: LessonContent = {
  key: 'auto-vba-debug',
  title: 'Errors & debugging',
  sheet: AUTO_SHEET,
  macro: V(D_A),
  steps: [
    info('intro', 'Three kinds of mistake', (
      <>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Syntax errors</strong>: the code is not valid, like a missing <code>Next</code>. VBA refuses to run it and names the problem.
          </li>
          <li>
            <strong>Run-time errors</strong>: valid code that fails on the data, like dividing by zero. The run stops on that line with a number: 11 division by zero, 13 type mismatch, 35 procedure not found.
          </li>
          <li>
            <strong>Logic errors</strong>: it runs, but gives the wrong answer. Check with <code>Debug.Print</code> or <code>MsgBox</code>.
          </li>
        </ul>
        <p>
          Read the message and the <strong>line number</strong> under the editor. In real Excel you can also step through code with <strong>F8</strong> and pause with a breakpoint (<strong>F9</strong>). Lines before the failing line have already done their work.
        </p>
      </>
    )),
    macroStep({
      id: 'syntax', title: 'Fix a syntax error',
      body: <p>Run Squares. It will not start. Find what is missing and fix it so <Cell>A1:A3</Cell> hold 1, 4, 9.</p>,
      hint: 'Every For needs a matching Next.',
      success: '1, 4, 9.',
      seed: {}, fresh: true, select: 'A1', resetPanels: true, macro: V(D_A),
      check: (c) => ranOk(c, 'Squares') && c.value('A3') === 9 && c.value('A2') === 4,
      sol: { code: D_A.replace('End Sub', '    Next i\nEnd Sub'), run: 'Squares' },
    }),
    macroStep({
      id: 'div', title: 'Fix a run-time error',
      body: <p>Ratios divides 100 by each number in A1:A4, but A2 is 0. Run it, read the error, then make the macro write <strong>n/a</strong> when the divisor is zero. Expect 20, n/a, 5, 25.</p>,
      hint: 'If Cells(i, 1).Value = 0 Then … Else … End If',
      success: 'The zero row is handled instead of crashing.',
      seed: grid([[5], [0], [20], [4]]), fresh: true, select: 'A1', resetPanels: true, macro: V(D_B),
      check: (c) => ranOk(c, 'Ratios') && c.value('B1') === 20 && c.value('B2') === 'n/a' && c.value('B3') === 5 && c.value('B4') === 25,
      sol: {
        code: D_B.replace('        Cells(i, 2).Value = 100 / Cells(i, 1).Value\n', '        If Cells(i, 1).Value = 0 Then\n            Cells(i, 2).Value = "n/a"\n        Else\n            Cells(i, 2).Value = 100 / Cells(i, 1).Value\n        End If\n'),
        run: 'Ratios',
      },
    }),
    macroStep({
      id: 'name', title: 'Fix a misspelled name',
      body: <p>Run Report. It calls a Sub that does not exist. Fix the typo so <Cell>C1</Cell> shows <strong>60</strong>.</p>,
      hint: 'Compare the name after Call with the Sub below it.',
      success: '60. Typos in procedure names fail at run time, not when you type them.',
      seed: grid([[10], [20], [30]]), fresh: true, select: 'A1', resetPanels: true, macro: V(D_C),
      check: (c) => ranOk(c, 'Report') && c.value('C1') === 60,
      sol: { code: D_C.replace('Totl', 'Total'), run: 'Report' },
    }),
    macroStep({
      id: 'resume', title: 'Skip bad rows on purpose',
      body: (
        <p>
          Column A holds 2, <strong>x</strong>, 4, 5. Doubles fails on the text. Add <code>On Error Resume Next</code> as the first line so the bad row is skipped. Expect B1 = 4, B2 empty, B3 = 8, B4 = 10.
        </p>
      ),
      hint: 'On Error Resume Next goes right under Sub Doubles().',
      success: 'The bad row is skipped. Use this sparingly: it hides every error, not just the one you expect.',
      seed: { A1: '2', A2: 'x', A3: '4', A4: '5' }, fresh: true, select: 'A1', resetPanels: true, macro: V(D_D),
      check: (c) => ranOk(c, 'Doubles') && c.value('B1') === 4 && c.raw('B2') === '' && c.value('B3') === 8 && c.value('B4') === 10 && codeHas(c, /On Error Resume Next/i),
      sol: { code: D_D.replace('    Dim i As Integer\n', '    On Error Resume Next\n    Dim i As Integer\n'), run: 'Doubles' },
    }),
  ],
};

// ---------------------------------------------------------------------------
const T1 = `Sub Tens()
    Dim i As Integer
    ' For i = 1 To 5, write i * 10 into column A of row i
End Sub
`;
const T2 = `Sub Flag()
    Dim i As Integer
    ' For rows 1 to 5, write "high" in column C when column B is over 10
End Sub
`;
const T3 = `Function Twice(x)
    ' return x doubled
End Function
`;
const T4 = `Sub Fix()
    Range("A1").Valu = "ok"
End Sub
`;
export const autoUnit3Test: LessonContent = {
  key: 'auto-unit3-test',
  title: 'Unit 3 test',
  sheet: AUTO_SHEET,
  macro: V(T1),
  steps: [
    info('intro', 'VBA test', <p>Four small programs. Write the code, run it, check the sheet.</p>),
    macroStep({
      id: 'loop', title: '1. A loop',
      body: <p>Write 10, 20, 30, 40, 50 into <Cell>A1:A5</Cell> with a For loop.</p>,
      hint: 'Cells(i, 1).Value = i * 10',
      success: 'A5 = 50.',
      seed: {}, fresh: true, select: 'A1', resetPanels: true, macro: V(T1),
      check: (c) => ranOk(c) && c.value('A1') === 10 && c.value('A5') === 50 && codeHas(c, /\bFor\b/i),
      sol: { code: T1.replace("    ' For i = 1 To 5, write i * 10 into column A of row i\n", '    For i = 1 To 5\n        Cells(i, 1).Value = i * 10\n    Next i\n'), run: 'Tens' },
    }),
    macroStep({
      id: 'if', title: '2. A condition',
      body: <p>B1:B5 hold 3, 8, 12, 5, 20. Write <strong>high</strong> into column C beside every value over 10.</p>,
      hint: 'If Cells(i, 2).Value > 10 Then Cells(i, 3).Value = "high"',
      success: 'C3 and C5.',
      seed: grid([[3], [8], [12], [5], [20]], 1, 0), fresh: true, select: 'A1', resetPanels: true, macro: V(T2),
      check: (c) => ranOk(c) && c.raw('C3') === 'high' && c.raw('C5') === 'high' && ['C1', 'C2', 'C4'].every((k) => c.raw(k) === ''),
      sol: { code: T2.replace('    ' + "' For rows 1 to 5, write \"high\" in column C when column B is over 10\n", '    For i = 1 To 5\n        If Cells(i, 2).Value > 10 Then Cells(i, 3).Value = "high"\n    Next i\n'), run: 'Flag' },
    }),
    macroStep({
      id: 'udf', title: '3. A function',
      body: <p>Complete Twice, then enter <code>=Twice(A1)</code> in <Cell>B1</Cell> (A1 holds 21).</p>,
      hint: 'Twice = x * 2',
      success: '42.',
      seed: { A1: '21' }, fresh: true, select: 'B1', resetPanels: true, macro: V(T3),
      check: (c) => c.value('B1') === 42 && /Twice\(/i.test(c.raw('B1')),
      sol: { code: T3.replace("    ' return x doubled\n", '    Twice = x * 2\n') },
      cells: { B1: '=Twice(A1)' },
    }),
    macroStep({
      id: 'bug', title: '4. Find the bug',
      body: <p>Fix the code so it writes <strong>ok</strong> into <Cell>A1</Cell>.</p>,
      hint: 'Read the error message: one word is misspelled.',
      success: 'Unit complete.',
      seed: {}, fresh: true, select: 'A1', resetPanels: true, macro: V(T4),
      check: (c) => ranOk(c, 'Fix') && c.raw('A1') === 'ok',
      sol: { code: T4.replace('Valu ', 'Value '), run: 'Fix' },
    }),
  ],
};

export const AUTO3 = [autoVbaEditor, autoVbaVars, autoVbaRanges, autoVbaLoops, autoVbaUdf, autoVbaDebug, autoUnit3Test];
