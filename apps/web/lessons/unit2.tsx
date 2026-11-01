import { Cell, K } from './kbd';
import type { LessonContent } from './types';

const isFormula = (raw: string) => raw.trim().startsWith('=');
const uses = (raw: string, fn: string) => new RegExp(`\\b${fn}\\s*\\(`, 'i').test(raw);

// ---------------------------------------------------------------------------
// IF statements
// ---------------------------------------------------------------------------
const GRADES = { A1: 'Student', B1: 'Score', A2: 'Ana', B2: '82', A3: 'Ben', B3: '45', A4: 'Cleo', B4: '67', A5: 'Dev', B5: '91' };

export const ifStatements: LessonContent = {
  key: 'if-statements',
  title: 'IF statements',
  steps: [
    {
      id: 'intro',
      title: 'Let Excel decide',
      body: (
        <>
          <p>
            <strong>IF</strong> makes a choice. It has three parts: a test, what to show if it is true, and what to show if it
            is false.
          </p>
          <p>
            <Cell>=IF(test, if_true, if_false)</Cell>
          </p>
        </>
      ),
    },
    {
      id: 'pass',
      title: 'Pass or fail',
      body: (
        <>
          <p>
            Students need 50 or more to pass. In <Cell>C2</Cell> type:
          </p>
          <p>
            <strong>=IF(B2&gt;=50,"Pass","Fail")</strong>
          </p>
        </>
      ),
      hint: 'Text inside a formula goes in double quotes. >= means "greater than or equal to".',
      success: 'Ana scored 82, so the test is true and she passes.',
      seed: GRADES,
      fresh: true,
      select: 'C2',
      check: (c) => uses(c.raw('C2'), 'IF') && c.value('C2') === 'Pass' && !c.editing,
    },
    {
      id: 'fill',
      title: 'Copy it down',
      body: (
        <p>
          Fill the formula from <Cell>C2</Cell> down to <Cell>C5</Cell>. Try <K>Ctrl</K> + <K>D</K> with C2:C5 selected.
        </p>
      ),
      hint: 'Click C2, Shift + ↓ three times, Ctrl + D.',
      success: 'Ben scored 45 and gets a Fail. Each row tests its own score.',
      seed: { ...GRADES, C2: '=IF(B2>=50,"Pass","Fail")' },
      select: 'C2',
      check: (c) => c.value('C3') === 'Fail' && c.value('C4') === 'Pass' && c.value('C5') === 'Pass' && isFormula(c.raw('C5')),
    },
    {
      id: 'numbers',
      title: 'Return numbers too',
      body: (
        <p>
          Students who score 80 or more get a 10% bonus on their score. In <Cell>D2</Cell> type{' '}
          <strong>=IF(B2&gt;=80,B2*10%,0)</strong>.
        </p>
      ),
      hint: 'The result can be a calculation, not just text.',
      success: '8.2. If Ana had scored 79 she would have got 0.',
      seed: GRADES,
      select: 'D2',
      check: (c) => uses(c.raw('D2'), 'IF') && Math.abs(Number(c.value('D2')) - 8.2) < 1e-9 && !c.editing,
    },
    {
      id: 'and',
      title: 'Combine tests with AND',
      body: (
        <>
          <p>
            Flag students who passed but did not reach 80. Cleo scored 67. In <Cell>E4</Cell> type:
          </p>
          <p>
            <strong>=IF(AND(B4&gt;=50,B4&lt;80),"Almost","")</strong>
          </p>
          <p>AND is true only when every test inside is true. OR needs just one.</p>
        </>
      ),
      hint: 'Both tests are true for 67, so IF returns "Almost".',
      success: 'Use AND and OR to build tests with more than one rule.',
      seed: GRADES,
      select: 'E4',
      check: (c) => uses(c.raw('E4'), 'AND') && /^=\s*IF/i.test(c.raw('E4').trim()) && c.value('E4') === 'Almost',
    },
    {
      id: 'nested',
      title: 'IF inside IF',
      body: (
        <>
          <p>
            Give letter grades: A for 90+, B for 70+, otherwise C. In <Cell>F2</Cell> put an IF inside the false part of
            another IF:
          </p>
          <p>
            <strong>=IF(B2&gt;=90,"A",IF(B2&gt;=70,"B","C"))</strong>
          </p>
        </>
      ),
      hint: 'Count your closing brackets: one for each IF.',
      success: 'B. Excel checks the first test, and only if it fails moves to the next.',
      seed: GRADES,
      select: 'F2',
      check: (c) => (c.raw('F2').match(/if\s*\(/gi)?.length ?? 0) >= 2 && c.value('F2') === 'B' && !c.editing,
    },
  ],
};

// ---------------------------------------------------------------------------
// COUNTIF & SUMIF
// ---------------------------------------------------------------------------
const SALES = {
  A1: 'Region',
  B1: 'Sales',
  A2: 'North',
  B2: '100',
  A3: 'South',
  B3: '80',
  A4: 'North',
  B4: '150',
  A5: 'East',
  B5: '60',
  A6: 'South',
  B6: '120',
  A7: 'North',
  B7: '90',
};

export const countifSumif: LessonContent = {
  key: 'countif-sumif',
  title: 'COUNTIF & SUMIF',
  steps: [
    {
      id: 'intro',
      title: 'Count and add with conditions',
      body: (
        <p>
          This sheet lists sales by region. <strong>COUNTIF</strong> counts the rows that match a condition and{' '}
          <strong>SUMIF</strong> adds up the matching ones. They answer questions like "how many" and "how much" in one cell.
        </p>
      ),
    },
    {
      id: 'countif',
      title: 'COUNTIF',
      body: (
        <>
          <p>
            How many sales were in the North? In <Cell>D1</Cell> type:
          </p>
          <p>
            <strong>=COUNTIF(A2:A7,"North")</strong>
          </p>
        </>
      ),
      hint: 'First the range to look in, then the thing to match in quotes.',
      success: '3 rows say North.',
      seed: SALES,
      fresh: true,
      select: 'D1',
      check: (c) => uses(c.raw('D1'), 'COUNTIF') && c.value('D1') === 3 && !c.editing,
    },
    {
      id: 'sumif',
      title: 'SUMIF',
      body: (
        <>
          <p>
            How much did the North sell in total? In <Cell>D2</Cell> type:
          </p>
          <p>
            <strong>=SUMIF(A2:A7,"North",B2:B7)</strong>
          </p>
          <p>Range to check, what to match, then the numbers to add.</p>
        </>
      ),
      hint: '100 + 150 + 90.',
      success: '340 for the North.',
      seed: SALES,
      select: 'D2',
      check: (c) => uses(c.raw('D2'), 'SUMIF') && c.value('D2') === 340 && !c.editing,
    },
    {
      id: 'operators',
      title: 'Conditions with > and <',
      body: (
        <p>
          How many sales were bigger than 90? In <Cell>D3</Cell> type <strong>=COUNTIF(B2:B7,"&gt;90")</strong>. Put the
          operator inside the quotes.
        </p>
      ),
      hint: 'The condition is the text ">90" in quotes.',
      success: '3 sales beat 90: 100, 150 and 120.',
      seed: SALES,
      select: 'D3',
      check: (c) => uses(c.raw('D3'), 'COUNTIF') && c.value('D3') === 3 && !c.editing,
    },
    {
      id: 'sumif-op',
      title: 'Add up the big ones',
      body: (
        <p>
          In <Cell>D4</Cell> add up only the sales over 90: <strong>=SUMIF(B2:B7,"&gt;90")</strong>. With no third argument it
          adds the same range it checks.
        </p>
      ),
      hint: '100 + 150 + 120.',
      success: '370.',
      seed: SALES,
      select: 'D4',
      check: (c) => uses(c.raw('D4'), 'SUMIF') && c.value('D4') === 370 && !c.editing,
    },
    {
      id: 'cell-crit',
      title: 'Point to a cell for the condition',
      body: (
        <>
          <p>
            Hard-coding "South" is brittle. <Cell>F1</Cell> says South. In <Cell>D5</Cell> use the cell instead:
          </p>
          <p>
            <strong>=SUMIF(A2:A7,F1,B2:B7)</strong>
          </p>
        </>
      ),
      hint: 'No quotes around F1, because it is a reference.',
      success: '200. Change F1 to another region and the answer follows.',
      seed: { ...SALES, F1: 'South' },
      select: 'D5',
      check: (c) => uses(c.raw('D5'), 'SUMIF') && /F\$?1/i.test(c.raw('D5')) && c.value('D5') === 200 && !c.editing,
    },
  ],
};

// ---------------------------------------------------------------------------
// XLOOKUP
// ---------------------------------------------------------------------------
const CATALOG = {
  A1: 'Product',
  B1: 'Price',
  A2: 'Pen',
  B2: '1.2',
  A3: 'Book',
  B3: '8.5',
  A4: 'Bag',
  B4: '25',
  A5: 'Lamp',
  B5: '18',
  D1: 'Find:',
  E1: 'Bag',
};

export const xlookup: LessonContent = {
  key: 'xlookup',
  title: 'XLOOKUP',
  steps: [
    {
      id: 'intro',
      title: 'Look things up',
      body: (
        <>
          <p>
            A lookup finds a value in one column and returns the matching value from another column, like checking a price
            list.
          </p>
          <p>
            <Cell>=XLOOKUP(find_this, look_here, return_this)</Cell>
          </p>
        </>
      ),
    },
    {
      id: 'basic',
      title: 'Your first XLOOKUP',
      body: (
        <>
          <p>
            <Cell>E1</Cell> says Bag. In <Cell>E2</Cell> find its price:
          </p>
          <p>
            <strong>=XLOOKUP(E1,A2:A5,B2:B5)</strong>
          </p>
        </>
      ),
      hint: 'Find E1 in the products A2:A5 and return from the prices B2:B5.',
      success: '25. The price of the Bag.',
      seed: CATALOG,
      fresh: true,
      select: 'E2',
      check: (c) => uses(c.raw('E2'), 'XLOOKUP') && c.value('E2') === 25 && !c.editing,
    },
    {
      id: 'change',
      title: 'Change what you search for',
      body: (
        <p>
          Change <Cell>E1</Cell> to <strong>Lamp</strong> and watch <Cell>E2</Cell> follow.
        </p>
      ),
      hint: 'Click E1, type Lamp, press Enter.',
      success: '18. One formula now answers any product.',
      seed: { ...CATALOG, E2: '=XLOOKUP(E1,A2:A5,B2:B5)' },
      select: 'E1',
      check: (c) => String(c.raw('E1')).trim().toLowerCase() === 'lamp' && c.value('E2') === 18 && !c.editing,
    },
    {
      id: 'missing',
      title: 'When it is not found',
      body: (
        <>
          <p>
            Searching for something that is not in the list gives an error. XLOOKUP lets you add a friendly fallback as the
            fourth argument. In <Cell>E3</Cell> type:
          </p>
          <p>
            <strong>=XLOOKUP("Desk",A2:A5,B2:B5,"Not found")</strong>
          </p>
        </>
      ),
      hint: 'There is no Desk in the list, so you get the fallback text.',
      success: 'Not found. A clean message beats #N/A.',
      seed: CATALOG,
      select: 'E3',
      check: (c) => uses(c.raw('E3'), 'XLOOKUP') && c.value('E3') === 'Not found' && !c.editing,
    },
    {
      id: 'vlookup',
      title: 'The older way: VLOOKUP',
      body: (
        <>
          <p>
            You will see <strong>VLOOKUP</strong> in older workbooks. It looks at the first column of a table and returns the
            column number you ask for. In <Cell>E4</Cell> type:
          </p>
          <p>
            <strong>=VLOOKUP(E1,A2:B5,2,FALSE)</strong>
          </p>
          <p>The 2 means "second column of the table". FALSE means exact match.</p>
        </>
      ),
      hint: 'E1 is Bag, so the answer is 25.',
      success: 'Same answer, different recipe. XLOOKUP is easier to read and can look left too.',
      seed: CATALOG,
      select: 'E4',
      check: (c) => uses(c.raw('E4'), 'VLOOKUP') && c.value('E4') === 25 && !c.editing,
    },
    {
      id: 'index-match',
      title: 'INDEX and MATCH',
      body: (
        <>
          <p>
            Another classic combo. <strong>MATCH</strong> finds the position of Bag in the list and <strong>INDEX</strong>{' '}
            returns the price at that position. In <Cell>E5</Cell> type:
          </p>
          <p>
            <strong>=INDEX(B2:B5,MATCH(E1,A2:A5,0))</strong>
          </p>
        </>
      ),
      hint: 'MATCH gives 3, then INDEX picks the 3rd price.',
      success: '25 again. Now you can read all three lookup styles.',
      seed: CATALOG,
      select: 'E5',
      check: (c) => uses(c.raw('E5'), 'INDEX') && uses(c.raw('E5'), 'MATCH') && c.value('E5') === 25 && !c.editing,
    },
  ],
};

// ---------------------------------------------------------------------------
// Fix the #errors
// ---------------------------------------------------------------------------
export const fixErrors: LessonContent = {
  key: 'fix-errors',
  title: 'Fix the #errors',
  steps: [
    {
      id: 'intro',
      title: 'Errors are clues',
      body: (
        <>
          <p>
            A cell starting with <strong>#</strong> is not a crash. It is Excel telling you what went wrong. Learn the common
            ones and you can fix any sheet.
          </p>
          <p>Each step below has a broken cell. Your job is to repair it.</p>
        </>
      ),
    },
    {
      id: 'div0',
      title: '#DIV/0!',
      body: (
        <>
          <p>
            <Cell>C1</Cell> divides 10 by 0, and you cannot divide by zero. Wrap it so it shows 0 instead of an error:
          </p>
          <p>
            <strong>=IFERROR(A1/B1,0)</strong>
          </p>
        </>
      ),
      hint: 'IFERROR(formula, what_to_show_if_it_fails).',
      success: 'IFERROR catches any error and swaps in your fallback.',
      seed: { A1: '10', B1: '0', C1: '=A1/B1' },
      fresh: true,
      select: 'C1',
      check: (c) => uses(c.raw('C1'), 'IFERROR') && c.value('C1') === 0 && !c.editing,
    },
    {
      id: 'name',
      title: '#NAME?',
      body: (
        <p>
          <Cell>D1</Cell> shows <strong>#NAME?</strong>. Excel does not know the function name. Look closely and correct the
          typo so it adds up A1:A3.
        </p>
      ),
      hint: 'SUMM is not a function. It should be SUM.',
      success: '#NAME? almost always means a typo in a function or range name.',
      seed: { A1: '10', A2: '20', A3: '30', D1: '=SUMM(A1:A3)' },
      fresh: true,
      select: 'D1',
      check: (c) => c.value('D1') === 60 && uses(c.raw('D1'), 'SUM') && !c.editing,
    },
    {
      id: 'value',
      title: '#VALUE!',
      body: (
        <p>
          <Cell>C1</Cell> adds A1 and B1, but B1 holds the word "five", not a number. Replace B1 with the number{' '}
          <strong>5</strong>.
        </p>
      ),
      hint: 'You cannot do maths on words. Type 5 in B1.',
      success: '#VALUE! means the wrong kind of data. Text where a number should be is the usual cause.',
      seed: { A1: '5', B1: 'five', C1: '=A1+B1' },
      fresh: true,
      select: 'B1',
      check: (c) => c.value('B1') === 5 && c.value('C1') === 10 && !c.editing,
    },
    {
      id: 'ref',
      title: '#REF! and circular references',
      body: (
        <p>
          <Cell>A1</Cell> says <strong>=A1+1</strong>, a formula that refers to itself, so Excel gives up with #REF!. Make it
          point at <Cell>B1</Cell> instead: <strong>=B1+1</strong>.
        </p>
      ),
      hint: 'Change the A1 inside the formula to B1.',
      success: '6. A formula can never use its own cell as an input.',
      seed: { B1: '5', A1: '=A1+1' },
      fresh: true,
      select: 'A1',
      check: (c) => c.value('A1') === 6 && /B\$?1/i.test(c.raw('A1')) && !c.editing,
    },
    {
      id: 'iserror',
      title: 'Spot errors with ISERROR',
      body: (
        <>
          <p>
            In big sheets you want a flag column. In <Cell>C1</Cell> type <strong>=ISERROR(B1)</strong>. It returns TRUE when
            B1 holds an error.
          </p>
        </>
      ),
      hint: 'B1 contains 1/0, so the answer should be TRUE.',
      success: 'TRUE. Combine with IF to decide what to do about it.',
      seed: { B1: '=1/0' },
      fresh: true,
      select: 'C1',
      check: (c) => uses(c.raw('C1'), 'ISERROR') && c.value('C1') === true && !c.editing,
    },
  ],
};

// ---------------------------------------------------------------------------
// Unit 2 test
// ---------------------------------------------------------------------------
const STAFF = {
  A1: 'Name',
  B1: 'Dept',
  C1: 'Sales',
  A2: 'Ana',
  B2: 'Retail',
  C2: '300',
  A3: 'Ben',
  B3: 'Online',
  C3: '120',
  A4: 'Cleo',
  B4: 'Retail',
  C4: '250',
  A5: 'Dev',
  B5: 'Online',
  C5: '410',
};

export const unit2Test: LessonContent = {
  key: 'unit2-test',
  title: 'Unit 2 test',
  steps: [
    {
      id: 'intro',
      title: 'Formulas test',
      body: (
        <p>
          Five tasks on IF, COUNTIF, SUMIF, XLOOKUP and error handling. The staff sales are in <Cell>A1:C5</Cell>.
        </p>
      ),
    },
    {
      id: 'if',
      title: '1. Bonus flag',
      body: (
        <p>
          In <Cell>D2</Cell> write a formula that shows "Yes" if sales are 300 or more and "No" otherwise.
        </p>
      ),
      hint: '=IF(C2>=300,"Yes","No")',
      success: 'Yes.',
      seed: STAFF,
      fresh: true,
      select: 'D2',
      check: (c) => uses(c.raw('D2'), 'IF') && c.value('D2') === 'Yes' && !c.editing,
    },
    {
      id: 'countif',
      title: '2. Count a department',
      body: (
        <p>
          In <Cell>F1</Cell> count how many people work in <strong>Retail</strong>.
        </p>
      ),
      hint: '=COUNTIF(B2:B5,"Retail")',
      success: '2 in Retail.',
      seed: STAFF,
      select: 'F1',
      check: (c) => uses(c.raw('F1'), 'COUNTIF') && c.value('F1') === 2 && !c.editing,
    },
    {
      id: 'sumif',
      title: '3. Online sales',
      body: (
        <p>
          In <Cell>F2</Cell> total the sales of the <strong>Online</strong> department.
        </p>
      ),
      hint: '=SUMIF(B2:B5,"Online",C2:C5)',
      success: '530 online.',
      seed: STAFF,
      select: 'F2',
      check: (c) => uses(c.raw('F2'), 'SUMIF') && c.value('F2') === 530 && !c.editing,
    },
    {
      id: 'lookup',
      title: '4. Look up a person',
      body: (
        <p>
          In <Cell>F3</Cell> look up <strong>Cleo</strong>'s department with XLOOKUP, using <Cell>A2:A5</Cell> and{' '}
          <Cell>B2:B5</Cell>.
        </p>
      ),
      hint: '=XLOOKUP("Cleo",A2:A5,B2:B5)',
      success: 'Retail.',
      seed: STAFF,
      select: 'F3',
      check: (c) => uses(c.raw('F3'), 'XLOOKUP') && c.value('F3') === 'Retail' && !c.editing,
    },
    {
      id: 'safe',
      title: '5. Make it safe',
      body: (
        <p>
          In <Cell>F4</Cell> look up "Zed" but show "Unknown" instead of an error. Any approach is fine.
        </p>
      ),
      hint: '=IFERROR(XLOOKUP("Zed",A2:A5,B2:B5),"Unknown")',
      success: 'Unit 2 complete.',
      seed: STAFF,
      select: 'F4',
      check: (c) => c.value('F4') === 'Unknown' && isFormula(c.raw('F4')) && !c.editing,
    },
  ],
};
