// Formulas & Functions, unit 3: text and dates.
import * as E from '@/components/sheet/engine';
import { date, info, task } from './dsl';
import { Cell, F, K } from './kbd';
import type { LessonContent } from './types';

const SKUS = { A1: 'SKU', A2: 'SKU-4821-RED', A3: 'SKU-1077-BLU', A4: 'SKU-9034-GRN' };

export const textSlice: LessonContent = {
  key: 'ff-text-slice',
  title: 'LEFT · RIGHT · MID · LEN',
  steps: [
    info('intro', 'Slice text apart', (
      <>
        <p>
          Product codes, IDs and names often hide several facts in one cell. These functions cut text where you tell them to:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <F>{'LEFT(text, n)'}</F> takes n characters from the start
          </li>
          <li>
            <F>{'RIGHT(text, n)'}</F> takes n from the end
          </li>
          <li>
            <F>{'MID(text, start, n)'}</F> takes n from the middle, counting from 1
          </li>
          <li>
            <F>{'LEN(text)'}</F> counts the characters
          </li>
        </ul>
      </>
    )),
    task({
      id: 'left', title: 'LEFT',
      body: (
        <p>
          Each code is <strong>SKU-4821-RED</strong>. In <Cell>B2</Cell> pull out the first three letters: <F>{'=LEFT(A2,3)'}</F>.
        </p>
      ),
      hint: 'LEFT(cell, how_many).',
      success: 'SKU.',
      seed: SKUS, fresh: true, select: 'B2',
      cells: { B2: 'SKU' }, uses: 'LEFT', sol: { B2: '=LEFT(A2,3)' },
    }),
    task({
      id: 'mid', title: 'MID',
      body: (
        <p>
          The number starts at character 5 and is 4 long. In <Cell>C2</Cell> type <F>{'=MID(A2,5,4)'}</F>.
        </p>
      ),
      hint: 'S-K-U-dash are characters 1 to 4, so the number starts at 5.',
      success: '4821.',
      seed: SKUS, select: 'C2',
      cells: { C2: '4821' }, uses: 'MID', sol: { C2: '=MID(A2,5,4)' },
      also: (c) => String(c.value('C2')) === '4821',
    }),
    task({
      id: 'right', title: 'RIGHT',
      body: (
        <p>
          The colour is the last three characters. In <Cell>D2</Cell> type <F>{'=RIGHT(A2,3)'}</F>.
        </p>
      ),
      hint: 'RIGHT counts from the end.',
      success: 'RED.',
      seed: SKUS, select: 'D2',
      cells: { D2: 'RED' }, uses: 'RIGHT', sol: { D2: '=RIGHT(A2,3)' },
    }),
    task({
      id: 'len', title: 'LEN',
      body: (
        <p>
          How long is each code? In <Cell>E2</Cell> type <F>{'=LEN(A2)'}</F>. Handy for spotting codes that are too short or long.
        </p>
      ),
      hint: 'Dashes count as characters.',
      success: '12.',
      seed: SKUS, select: 'E2',
      cells: { E2: 12 }, uses: 'LEN', sol: { E2: '=LEN(A2)' },
    }),
    task({
      id: 'fill', title: 'Fill all three rows',
      body: (
        <p>
          Put the formulas in <Cell>B2:E2</Cell> to work for every row: select <Cell>B2:E4</Cell> and press <K>Ctrl</K> + <K>D</K>.
        </p>
      ),
      hint: 'Select B2:E4, then Ctrl + D to fill down.',
      success: 'Three codes taken apart at once.',
      seed: { ...SKUS, B2: '=LEFT(A2,3)', C2: '=MID(A2,5,4)', D2: '=RIGHT(A2,3)', E2: '=LEN(A2)' }, select: 'B2',
      cells: { C4: '9034', D3: 'BLU', E4: 12 }, uses: {},
      sol: { B3: '=LEFT(A3,3)', C3: '=MID(A3,5,4)', D3: '=RIGHT(A3,3)', E3: '=LEN(A3)', B4: '=LEFT(A4,3)', C4: '=MID(A4,5,4)', D4: '=RIGHT(A4,3)', E4: '=LEN(A4)' },
      also: (c) => String(c.value('C4')) === '9034',
    }),
  ],
};

const EMAIL = { A1: 'Email', A2: 'ana.lopez@mail.com', A3: 'ben.kim@work.org' };

export const findSubstitute: LessonContent = {
  key: 'ff-find-substitute',
  title: 'FIND · SEARCH · SUBSTITUTE',
  steps: [
    info('intro', 'Find where something is', (
      <>
        <p>
          LEFT and MID need to know <em>how many</em> characters to take. <strong>FIND</strong> tells you where a character sits, so
          the formula adapts to every row.
        </p>
        <p>
          <strong>FIND</strong> is case-sensitive. <strong>SEARCH</strong> ignores case and allows wildcards. Both return a position
          number.
        </p>
      </>
    )),
    task({
      id: 'find', title: 'FIND the @',
      body: (
        <p>
          In <Cell>B2</Cell> type <F>{'=FIND("@",A2)'}</F>.
        </p>
      ),
      hint: 'ana.lopez is 9 characters, so the @ is character 10.',
      success: '10.',
      seed: EMAIL, fresh: true, select: 'B2',
      cells: { B2: 10 }, uses: 'FIND', sol: { B2: '=FIND("@",A2)' },
    }),
    task({
      id: 'user', title: 'Take everything before it',
      body: (
        <>
          <p>
            Combine FIND with LEFT. In <Cell>C2</Cell> type:
          </p>
          <p>
            <F>{'=LEFT(A2,FIND("@",A2)-1)'}</F>
          </p>
        </>
      ),
      hint: 'Subtract 1 so the @ itself is left out.',
      success: 'ana.lopez. Fill it down and it works for any length of name.',
      seed: EMAIL, select: 'C2',
      cells: { C2: 'ana.lopez' }, uses: ['LEFT', 'FIND'],
      sol: { C2: '=LEFT(A2,FIND("@",A2)-1)' },
    }),
    task({
      id: 'domain', title: 'Take everything after it',
      body: (
        <>
          <p>
            In <Cell>D2</Cell> get the domain with MID, starting just after the @:
          </p>
          <p>
            <F>{'=MID(A2,FIND("@",A2)+1,50)'}</F>
          </p>
        </>
      ),
      hint: 'Asking for 50 characters is safe: MID stops at the end of the text.',
      success: 'mail.com.',
      seed: EMAIL, select: 'D2',
      cells: { D2: 'mail.com' }, uses: ['MID', 'FIND'],
      sol: { D2: '=MID(A2,FIND("@",A2)+1,50)' },
    }),
    task({
      id: 'substitute', title: 'SUBSTITUTE swaps text',
      body: (
        <>
          <p>
            Turn the dot in the username into a space. In <Cell>E2</Cell> type:
          </p>
          <p>
            <F>{'=SUBSTITUTE(C2,".","")'}</F>
          </p>
          <p>Then edit it so the replacement is a single space instead of nothing.</p>
        </>
      ),
      hint: 'SUBSTITUTE(text, old, new). The new text goes in quotes: " ".',
      success: 'ana lopez.',
      seed: { ...EMAIL, C2: '=LEFT(A2,FIND("@",A2)-1)' }, select: 'E2',
      cells: { E2: 'ana lopez' }, uses: 'SUBSTITUTE', sol: { E2: '=SUBSTITUTE(C2,"."," ")' },
    }),
    task({
      id: 'search', title: 'SEARCH ignores case',
      body: (
        <p>
          In <Cell>F2</Cell> find the position of <strong>MAIL</strong> in the address, typed in capitals:{' '}
          <F>{'=SEARCH("MAIL",A2)'}</F>. FIND would fail here.
        </p>
      ),
      hint: 'SEARCH is not case-sensitive.',
      success: '11. Try FIND instead and you get #VALUE!.',
      seed: EMAIL, select: 'F2',
      cells: { F2: 11 }, uses: 'SEARCH', sol: { F2: '=SEARCH("MAIL",A2)' },
    }),
  ],
};

const PEOPLE = { A1: 'First', B1: 'Last', C1: 'City', A2: 'Ana', B2: 'Lopez', C2: 'Madrid', A3: 'Ben', B3: 'Kim', A4: 'Cleo', B4: 'Park', C4: 'Seoul' };

export const textJoin: LessonContent = {
  key: 'ff-textjoin',
  title: 'TEXTJOIN · CONCAT · &',
  steps: [
    info('intro', 'Glue text together', (
      <>
        <p>Three ways to join text, from simplest to most powerful:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            The <F>{'&'}</F> operator: <F>{'=A2&" "&B2'}</F>
          </li>
          <li>
            <strong>CONCAT</strong> joins any list of cells and text
          </li>
          <li>
            <strong>TEXTJOIN</strong> adds a delimiter and can skip blanks
          </li>
        </ul>
      </>
    )),
    task({
      id: 'amp', title: 'Join with &',
      body: (
        <p>
          In <Cell>D2</Cell> make a full name: <F>{'=A2&" "&B2'}</F>. The space in quotes goes between the names.
        </p>
      ),
      hint: 'Text in a formula always goes in double quotes.',
      success: 'Ana Lopez.',
      seed: PEOPLE, fresh: true, select: 'D2',
      cells: { D2: 'Ana Lopez' }, sol: { D2: '=A2&" "&B2' },
    }),
    task({
      id: 'concat', title: 'CONCAT',
      body: (
        <p>
          In <Cell>E2</Cell> write the same thing with CONCAT: <F>{'=CONCAT(B2,", ",A2)'}</F> for "Lopez, Ana".
        </p>
      ),
      hint: 'CONCAT takes the pieces in order, separated by commas.',
      success: 'Lopez, Ana.',
      seed: PEOPLE, select: 'E2',
      cells: { E2: 'Lopez, Ana' }, uses: 'CONCAT', sol: { E2: '=CONCAT(B2,", ",A2)' },
    }),
    task({
      id: 'textjoin', title: 'TEXTJOIN',
      body: (
        <>
          <p>
            In <Cell>F2</Cell> join all three columns with a comma and space:
          </p>
          <p>
            <F>{'=TEXTJOIN(", ",TRUE,A2:C2)'}</F>
          </p>
          <p>The delimiter comes first, then TRUE to skip empty cells, then the range.</p>
        </>
      ),
      hint: 'You can pass a whole range. No need to list each cell.',
      success: 'Ana, Lopez, Madrid.',
      seed: PEOPLE, select: 'F2',
      cells: { F2: 'Ana, Lopez, Madrid' }, uses: 'TEXTJOIN', sol: { F2: '=TEXTJOIN(", ",TRUE,A2:C2)' },
    }),
    task({
      id: 'blanks', title: 'Skip the blanks',
      body: (
        <p>
          Ben has no city. Fill <Cell>F2</Cell> down to <Cell>F4</Cell> and check <Cell>F3</Cell>: no stray comma.
        </p>
      ),
      hint: 'Select F2:F4 and press Ctrl + D.',
      success: 'Ben, Kim. The TRUE skipped the empty city, so no trailing ", ".',
      seed: { ...PEOPLE, F2: '=TEXTJOIN(", ",TRUE,A2:C2)' }, select: 'F2',
      cells: { F2: 'Ana, Lopez, Madrid', F3: 'Ben, Kim', F4: 'Cleo, Park, Seoul' }, uses: 'TEXTJOIN',
      sol: { F3: '=TEXTJOIN(", ",TRUE,A3:C3)', F4: '=TEXTJOIN(", ",TRUE,A4:C4)' },
    }),
    task({
      id: 'label', title: 'Build a sentence',
      body: (
        <p>
          In <Cell>G2</Cell> build <strong>Hello, Ana from Madrid!</strong> using <F>{'&'}</F> and the cells A2 and C2.
        </p>
      ),
      hint: '="Hello, "&A2&" from "&C2&"!"',
      success: 'Formulas can write sentences from data.',
      seed: PEOPLE, select: 'G2',
      cells: { G2: 'Hello, Ana from Madrid!' }, sol: { G2: '="Hello, "&A2&" from "&C2&"!"' },
    }),
  ],
};

const MESSY = { A1: 'Raw name', A2: '  ana   LOPEZ ', A3: 'BEN kim', A4: ' cleo  park', C1: 'Amount', C2: '1234.5', D1: 'Order date', D2: '2026-03-15' };

export const cleanText: LessonContent = {
  key: 'ff-clean-text',
  title: 'TRIM · PROPER · TEXT',
  steps: [
    info('intro', 'Tidy text and control how numbers look', (
      <>
        <p>
          <strong>TRIM</strong> removes extra spaces. <strong>PROPER</strong> capitalises each word. <strong>CLEAN</strong> removes
          hidden line breaks that arrive in copied data. <strong>TEXT</strong> turns a number or date into text with a format you
          choose, which is perfect for labels.
        </p>
      </>
    )),
    task({
      id: 'trim', title: 'TRIM and PROPER together',
      body: (
        <p>
          In <Cell>B2</Cell> clean the messy name in A2: <F>{'=PROPER(TRIM(A2))'}</F>. TRIM runs first, then PROPER.
        </p>
      ),
      hint: 'Functions can sit inside each other. The inner one runs first.',
      success: 'Ana Lopez.',
      seed: MESSY, fresh: true, select: 'B2',
      cells: { B2: 'Ana Lopez' }, uses: ['PROPER', 'TRIM'], sol: { B2: '=PROPER(TRIM(A2))' },
    }),
    task({
      id: 'fill', title: 'Fill it down',
      body: (
        <p>
          Fill <Cell>B2</Cell> down to <Cell>B4</Cell>.
        </p>
      ),
      hint: 'Select B2:B4 and press Ctrl + D.',
      success: 'Three messy names fixed in one move.',
      seed: { ...MESSY, B2: '=PROPER(TRIM(A2))' }, select: 'B2',
      cells: { B3: 'Ben Kim', B4: 'Cleo Park' }, uses: ['PROPER', 'TRIM'],
      sol: { B3: '=PROPER(TRIM(A3))', B4: '=PROPER(TRIM(A4))' },
    }),
    task({
      id: 'num', title: 'TEXT: format a number',
      body: (
        <>
          <p>
            In <Cell>E2</Cell> show the amount in C2 as money with two decimals and a thousands comma:
          </p>
          <p>
            <F>{'=TEXT(C2,"$#,##0.00")'}</F>
          </p>
        </>
      ),
      hint: '#,##0.00 means "thousands comma, always two decimals".',
      success: '$1,234.50. It is text now, great for labels, not for further maths.',
      seed: MESSY, select: 'E2',
      cells: { E2: '$1,234.50' }, uses: 'TEXT', sol: { E2: '=TEXT(C2,"$#,##0.00")' },
    }),
    task({
      id: 'pct', title: 'TEXT: percentages and padding',
      body: (
        <p>
          In <Cell>F2</Cell> show 0.256 as a percent with one decimal: <F>{'=TEXT(0.256,"0.0%")'}</F>.
        </p>
      ),
      hint: 'The % in the format multiplies by 100 for you.',
      success: '25.6%.',
      seed: MESSY, select: 'F2',
      cells: { F2: '25.6%' }, uses: 'TEXT', sol: { F2: '=TEXT(0.256,"0.0%")' },
    }),
    task({
      id: 'date', title: 'TEXT: format a date',
      body: (
        <>
          <p>
            D2 holds a date. Turn it into the words "March 2026" in <Cell>G2</Cell>:
          </p>
          <p>
            <F>{'=TEXT(D2,"mmmm yyyy")'}</F>
          </p>
          <p>
            Handy codes: <F>{'dd'}</F> day, <F>{'ddd'}</F> weekday, <F>{'mmm'}</F> short month, <F>{'yy'}</F> short year.
          </p>
        </>
      ),
      hint: 'mmmm is the full month name, yyyy the four-digit year.',
      success: 'March 2026.',
      seed: MESSY, select: 'G2',
      cells: { G2: 'March 2026' }, uses: 'TEXT', sol: { G2: '=TEXT(D2,"mmmm yyyy")' },
    }),
  ],
};

export const datesAreNumbers: LessonContent = {
  key: 'ff-dates-numbers',
  title: 'Dates are numbers',
  steps: [
    info('intro', 'A date is just a counting number', (
      <>
        <p>
          Excel stores a date as the <strong>number of days since 1900</strong>. Today is a number around 46,000. The format
          only decides how it <em>looks</em>.
        </p>
        <p>That is why you can add 30 to a date, subtract two dates, or ask for its month, all with ordinary maths.</p>
      </>
    )),
    task({
      id: 'type', title: 'Type a date',
      body: (
        <p>
          In <Cell>A2</Cell> type <strong>2026-03-15</strong> and press <K>Enter</K>. Excel recognises it and shows it as a date.
        </p>
      ),
      hint: 'Year-month-day always works. 3/15/2026 does too in the US format.',
      success: 'Typed text became a real date. Right-aligned, like a number, because it is one.',
      seed: { A1: 'Start' }, fresh: true, select: 'A2',
      cells: { A2: date(2026, 3, 15) }, plain: ['A2'], sol: { A2: '2026-03-15' },
    }),
    task({
      id: 'plus', title: 'Add days',
      body: (
        <p>
          In <Cell>B2</Cell> find the date 30 days later: <F>{'=A2+30'}</F>.
        </p>
      ),
      hint: 'Dates are numbers, so plain addition works.',
      success: '14 Apr 2026.',
      seed: { A1: 'Start', B1: 'Due', A2: '2026-03-15' }, select: 'B2',
      cells: { B2: date(2026, 3, 15) + 30 }, sol: { B2: '=A2+30' },
    }),
    task({
      id: 'date', title: 'Build a date with DATE',
      body: (
        <p>
          In <Cell>C2</Cell> create 25 December 2026 from its parts: <F>{'=DATE(2026,12,25)'}</F>. The order is year, month, day.
        </p>
      ),
      hint: 'DATE(year, month, day).',
      success: 'DATE is how you build a date from numbers in other cells.',
      seed: { A1: 'Start', C1: 'Event', A2: '2026-03-15' }, select: 'C2',
      cells: { C2: date(2026, 12, 25) }, uses: 'DATE', sol: { C2: '=DATE(2026,12,25)' },
    }),
    task({
      id: 'parts', title: 'Pull out the year, month and day',
      body: (
        <p>
          From A2 take <F>{'=YEAR(A2)'}</F> into <Cell>D2</Cell>, <F>{'=MONTH(A2)'}</F> into <Cell>E2</Cell> and <F>{'=DAY(A2)'}</F>{' '}
          into <Cell>F2</Cell>.
        </p>
      ),
      hint: 'D2 should be 2026, E2 is 3 and F2 is 15.',
      success: '2026, 3, 15. Perfect for grouping by month or year.',
      seed: { A1: 'Start', A2: '2026-03-15' }, select: 'D2',
      cells: { D2: 2026, E2: 3, F2: 15 }, sol: { D2: '=YEAR(A2)', E2: '=MONTH(A2)', F2: '=DAY(A2)' },
    }),
    task({
      id: 'diff', title: 'Days between two dates',
      body: (
        <p>
          How many days from A2 to the event in C2? In <Cell>G2</Cell> subtract: <F>{'=C2-A2'}</F>. If it shows as a date, press{' '}
          <K>Ctrl</K> + <K>Shift</K> + <K>~</K> to switch it back to General.
        </p>
      ),
      hint: 'Later date minus earlier date.',
      success: '285 days to go.',
      seed: { A1: 'Start', C1: 'Event', A2: '2026-03-15', C2: '=DATE(2026,12,25)' }, select: 'G2',
      cells: { G2: date(2026, 12, 25) - date(2026, 3, 15) }, sol: { G2: '=C2-A2' },
    }),
    task({
      id: 'today', title: 'TODAY',
      body: (
        <p>
          <F>{'=TODAY()'}</F> gives today's date and updates every day. Put it in <Cell>H2</Cell>.
        </p>
      ),
      hint: 'The brackets stay empty.',
      success: 'Live date. Use it for ages, countdowns and overdue checks.',
      seed: { A1: 'Start', A2: '2026-03-15' }, select: 'H2',
      cells: { H2: (v) => v === E.todaySerial() }, uses: 'TODAY', sol: { H2: '=TODAY()' },
    }),
  ],
};

const HIRE = { A1: 'Hired', B1: 'Today', A2: '2020-05-20', B2: '2026-03-15' };

export const dateMath: LessonContent = {
  key: 'ff-date-math',
  title: 'DATEDIF · EDATE · WORKDAY',
  steps: [
    info('intro', 'Date maths for real life', (
      <>
        <p>
          Contracts, invoices and project plans all run on dates. These functions handle the awkward parts: month lengths, leap
          years and weekends.
        </p>
        <p>
          <strong>A warning on DATEDIF:</strong> it works but is undocumented in Excel's function list, and its <F>{'"MD"'}</F> option
          is known to return wrong or negative answers near month ends. Use <F>{'"Y"'}</F>, <F>{'"M"'}</F>, <F>{'"D"'}</F> and{' '}
          <F>{'"YM"'}</F> and avoid <F>{'"MD"'}</F>.
        </p>
      </>
    )),
    task({
      id: 'years', title: 'Complete years',
      body: (
        <p>
          How many full years since A2 up to B2? In <Cell>C2</Cell> type <F>{'=DATEDIF(A2,B2,"Y")'}</F>.
        </p>
      ),
      hint: 'DATEDIF(start, end, unit). The unit goes in quotes.',
      success: '5 years (the sixth is not complete until May).',
      seed: HIRE, fresh: true, select: 'C2',
      cells: { C2: 5 }, uses: 'DATEDIF', sol: { C2: '=DATEDIF(A2,B2,"Y")' },
    }),
    task({
      id: 'months', title: 'The leftover months',
      body: (
        <p>
          Years and months make "5 years 9 months". In <Cell>D2</Cell> get the months <em>after</em> the full years:{' '}
          <F>{'=DATEDIF(A2,B2,"YM")'}</F>.
        </p>
      ),
      hint: 'YM ignores the years and counts the remaining months.',
      success: '9. So the tenure is 5 years, 9 months.',
      seed: HIRE, select: 'D2',
      cells: { D2: 9 }, uses: 'DATEDIF', sol: { D2: '=DATEDIF(A2,B2,"YM")' },
    }),
    task({
      id: 'edate', title: 'EDATE: move by months',
      body: (
        <p>
          A 3-month review after B2. In <Cell>E2</Cell> type <F>{'=EDATE(B2,3)'}</F>. EDATE handles months with different lengths for
          you.
        </p>
      ),
      hint: 'EDATE(start_date, months). Negative months go back.',
      success: '15 Jun 2026.',
      seed: HIRE, select: 'E2',
      cells: { E2: date(2026, 6, 15) }, uses: 'EDATE', sol: { E2: '=EDATE(B2,3)' },
    }),
    task({
      id: 'eomonth', title: 'EOMONTH: last day of a month',
      body: (
        <p>
          Invoices are due at month end. In <Cell>F2</Cell> type <F>{'=EOMONTH(B2,0)'}</F>. The 0 means "this month"; 1 would be next
          month.
        </p>
      ),
      hint: 'EOMONTH(start_date, months).',
      success: '31 Mar 2026.',
      seed: HIRE, select: 'F2',
      cells: { F2: date(2026, 3, 31) }, uses: 'EOMONTH', sol: { F2: '=EOMONTH(B2,0)' },
    }),
    task({
      id: 'workday', title: 'WORKDAY: skip weekends',
      body: (
        <p>
          A task takes 10 working days from B2. In <Cell>G2</Cell> type <F>{'=WORKDAY(B2,10)'}</F>.
        </p>
      ),
      hint: 'WORKDAY(start, days). It skips Saturdays and Sundays.',
      success: '27 Mar 2026, not 25 Mar. Weekends are skipped.',
      seed: HIRE, select: 'G2',
      cells: { G2: date(2026, 3, 27) }, uses: 'WORKDAY', sol: { G2: '=WORKDAY(B2,10)' },
    }),
    task({
      id: 'networkdays', title: 'NETWORKDAYS: count working days',
      body: (
        <p>
          How many working days from B2 to the end of the month (F2)? In <Cell>H2</Cell> type <F>{'=NETWORKDAYS(B2,F2)'}</F>.
        </p>
      ),
      hint: 'It counts both the start and end days if they are weekdays.',
      success: '12 working days left in March.',
      seed: { ...HIRE, F2: '=EOMONTH(B2,0)' }, select: 'H2',
      cells: { H2: 12 }, uses: 'NETWORKDAYS', sol: { H2: '=NETWORKDAYS(B2,F2)' },
    }),
  ],
};

export const unit3Test: LessonContent = {
  key: 'ff-unit3-test',
  title: 'Unit 3 test',
  steps: [
    info('intro', 'Text and dates test', <p>Five tasks mixing text functions and date maths.</p>),
    task({
      id: 'extract', title: '1. Extract',
      body: (
        <p>
          A2 holds <strong>INV-2026-0042</strong>. In <Cell>B2</Cell> extract just the four-digit year as text.
        </p>
      ),
      hint: '=MID(A2,5,4)',
      success: '2026.',
      seed: { A1: 'Invoice', A2: 'INV-2026-0042' }, fresh: true, select: 'B2',
      cells: { B2: '2026' }, also: (c) => String(c.value('B2')) === '2026', sol: { B2: '=MID(A2,5,4)' },
    }),
    task({
      id: 'user', title: '2. Before the @',
      body: (
        <p>
          In <Cell>B2</Cell> take everything before the <strong>@</strong> in the email.
        </p>
      ),
      hint: '=LEFT(A2,FIND("@",A2)-1)',
      success: 'ben.kim.',
      seed: { A1: 'Email', A2: 'ben.kim@work.org' }, fresh: true, select: 'B2',
      cells: { B2: 'ben.kim' }, uses: ['LEFT', 'FIND'], sol: { B2: '=LEFT(A2,FIND("@",A2)-1)' },
    }),
    task({
      id: 'join', title: '3. Tidy and join',
      body: (
        <p>
          A2 is a messy first name, B2 a messy last name. In <Cell>C2</Cell> produce a clean <strong>Ana Lopez</strong>.
        </p>
      ),
      hint: '=PROPER(TRIM(A2))&" "&PROPER(TRIM(B2))',
      success: 'Ana Lopez.',
      seed: { A1: 'First', B1: 'Last', A2: '  ana', B2: 'LOPEZ ' }, fresh: true, select: 'C2',
      cells: { C2: 'Ana Lopez' }, uses: ['TRIM'], sol: { C2: '=PROPER(TRIM(A2))&" "&PROPER(TRIM(B2))' },
    }),
    task({
      id: 'tenure', title: '4. Tenure',
      body: (
        <p>
          A2 is a hire date and B2 a review date. In <Cell>C2</Cell> give the number of complete years between them.
        </p>
      ),
      hint: '=DATEDIF(A2,B2,"Y")',
      success: '3.',
      seed: { A1: 'Hired', B1: 'Review', A2: '2022-08-10', B2: '2026-03-15' }, fresh: true, select: 'C2',
      cells: { C2: 3 }, uses: 'DATEDIF', sol: { C2: '=DATEDIF(A2,B2,"Y")' },
    }),
    task({
      id: 'due', title: '5. Due date',
      body: (
        <p>
          An invoice dated in A2 is due 30 days later but must land on a <strong>working day</strong> (use WORKDAY from the date + 29
          days, or a simpler approach that skips weekends). Put the due date in <Cell>B2</Cell>.
        </p>
      ),
      hint: '=WORKDAY(A2+29,1) or =WORKDAY(A2,22). Any correct due date that is a weekday and after A2+29 is fine.',
      success: 'Unit 3 complete.',
      seed: { A1: 'Invoice date', B1: 'Due', A2: '2026-03-02' }, fresh: true, select: 'B2',
      cells: { B2: (v) => typeof v === 'number' && v >= date(2026, 3, 31) && v <= date(2026, 4, 3) && ![0, 6].includes(E.serialToParts(v).wd) },
      uses: 'WORKDAY', sol: { B2: '=WORKDAY(A2+29,1)' },
    }),
  ],
};
