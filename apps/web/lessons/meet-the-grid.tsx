import * as E from '@/components/sheet/engine';
import { Cell, K } from './kbd';
import { OnlyMac, OnlyWindows } from './platform';
import type { LessonContent } from './types';

const DATA = { A1: 'Hello', A3: '10', A4: '20', A5: '30' };

export const meetTheGrid: LessonContent = {
  key: 'meet-the-grid',
  title: 'Meet the grid',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to the grid',
      body: (
        <>
          <p>
            A spreadsheet is a huge grid of boxes called <strong>cells</strong>. Excel pros barely touch the mouse,
            because the keyboard is much faster.
          </p>
          <p>
            In the next few minutes you will move around, enter data, write your first formula and learn the shortcuts
            everyone uses. The sheet on the right is a real, working practice sheet.
          </p>
        </>
      ),
    },
    {
      id: 'click-cell',
      title: 'Meet a cell',
      body: (
        <p>
          Every cell has an address made of a column letter and a row number. Click the cell <Cell>B2</Cell>.
        </p>
      ),
      hint: 'Find column B along the top, then go down to row 2 on the left.',
      success: 'That is cell B2: column B, row 2. The Name Box in the top left always shows where you are.',
      check: (c) => c.activeKey === 'B2',
    },
    {
      id: 'arrows',
      title: 'Move with the arrow keys',
      body: (
        <p>
          Use the arrow keys <K>↑</K> <K>↓</K> <K>←</K> <K>→</K> to move to <Cell>D5</Cell>. Watch the Name Box change as
          you go.
        </p>
      ),
      hint: 'From B2 you need 2 steps right and 3 steps down.',
      success: 'Nice. Arrow keys are the quickest way to move one cell at a time.',
      select: 'B2',
      check: (c) => c.activeKey === 'D5' && c.events.has('arrow'),
    },
    {
      id: 'type',
      title: 'Type into a cell',
      body: (
        <p>
          Click <Cell>A1</Cell>, type <strong>Hello</strong> and press <K>Enter</K>. You can just start typing. There is no
          need to double-click first.
        </p>
      ),
      hint: 'Pressing Enter saves what you typed and moves you down one cell.',
      success: 'Text is saved with Enter. Notice it sits on the left of the cell, as text always does.',
      check: (c) => c.raw('A1').trim().toLowerCase() === 'hello' && !c.editing,
    },
    {
      id: 'numbers',
      title: 'Enter some numbers',
      body: (
        <>
          <p>
            Click <Cell>A3</Cell>. Type <strong>10</strong> and press <K>Enter</K>, then <strong>20</strong>{' '}
            <K>Enter</K>, then <strong>30</strong> <K>Enter</K>.
          </p>
          <p>Enter drops you to the next row, so you can type a whole list without touching the mouse.</p>
        </>
      ),
      hint: 'Three numbers in a column: A3, A4 and A5.',
      success: 'Numbers line up on the right. That is how Excel tells numbers and text apart.',
      seed: { A1: 'Hello' },
      check: (c) =>
        c.value('A3') === 10 && c.value('A4') === 20 && c.value('A5') === 30 && !c.editing,
    },
    {
      id: 'range',
      title: 'Select a range',
      body: (
        <>
          <p>
            Click <Cell>A3</Cell>, then hold <K>Shift</K> and press <K>↓</K> twice. You have selected the range{' '}
            <Cell>A3:A5</Cell>.
          </p>
          <p>Look at the status bar at the bottom of the sheet. Excel shows the Sum and Average of what you selected.</p>
        </>
      ),
      hint: 'You can also click A3 and drag down to A5 with the mouse.',
      success: 'A range is written with a colon: first cell, then last cell. Shift plus an arrow grows the selection.',
      seed: DATA,
      check: (c) => c.selection === 'A3:A5',
    },
    {
      id: 'column',
      title: 'Select a whole column',
      body: (
        <p>
          Click the column header <Cell>C</Cell> (the grey letter at the top) to select the entire column.
        </p>
      ),
      hint: 'Keyboard fans: put the cursor in column C and press Ctrl + Space.',
      success: 'Clicking a header selects the whole column. Row numbers on the left do the same for rows.',
      seed: DATA,
      check: (c) => c.rect.c1 === 2 && c.rect.c2 === 2 && c.rect.r1 === 0 && c.rect.r2 === E.ROWS - 1,
    },
    {
      id: 'ctrl-jump',
      title: 'Jump with Ctrl + Arrow',
      body: (
        <>
          <p>
            You are on <Cell>A3</Cell>. Hold <K>Ctrl</K> and press <K>↓</K> (the down arrow).
          </p>
          <p>
            Instead of moving one cell, you leap to the end of your data. On a sheet with thousands of rows this saves
            minutes.
          </p>
          <OnlyWindows>
          <details className="group rounded-xl bg-[#1F4D3A]/5 text-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3.5 font-semibold [&::-webkit-details-marker]:hidden">
              Not working? More info for Windows
              <svg
                className="size-4 shrink-0 transition-transform group-open:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="px-3.5 pb-3.5">
              <ol className="list-decimal space-y-1 pl-5">
                <li>Click anywhere on the sheet once, so it has focus. The selected cell is outlined in green.</li>
                <li>
                  Press and <strong>hold</strong> the <K>Ctrl</K> key at the bottom left of your keyboard.
                </li>
                <li>
                  While holding it, tap <K>↓</K> once, then let go of both.
                </li>
              </ol>
              <p className="mt-2 text-[#1F4D3A]/70">
                The outline should jump from A3 straight down to A5. It works in the other directions too: <K>Ctrl</K> +{' '}
                <K>↑</K> <K>←</K> <K>→</K>. Add <K>Shift</K> to select everything you jump over.
              </p>
              <p className="mt-3 font-semibold">Check Scroll Lock</p>
              <p className="mt-1 text-[#1F4D3A]/70">
                Arrow shortcuts can misbehave when <K>Scroll Lock</K> is on. Press the <K>ScrLk</K> key to switch it off.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[#1F4D3A]/70">
                <li>
                  If you are on a compact keyboard without a Scroll Lock key, open the Windows On-Screen Keyboard (
                  <K>Win</K> + <K>Ctrl</K> + <K>O</K>) and click the <K>ScrLk</K> button to toggle it off.
                </li>
              </ul>
            </div>
          </details>
          </OnlyWindows>
          <OnlyMac>
          <details className="group rounded-xl bg-[#1F4D3A]/5 text-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3.5 font-semibold [&::-webkit-details-marker]:hidden">
              Not working? More info for MacBook
              <svg
                className="size-4 shrink-0 transition-transform group-open:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="px-3.5 pb-3.5">
              <p>
                On a Mac the shortcut key is <K>⌘ Cmd</K>, not Ctrl. Hold <K>⌘ Cmd</K>, then tap <K>↓</K>.
              </p>
              <p className="mt-2 text-[#1F4D3A]/70">
                Plain <K>Ctrl</K> + <K>↓</K> is taken by macOS (it shows all your open windows), so it will not reach the
                sheet. The other shortcuts in this course swap the same way: <K>⌘</K> + <K>B</K> for bold, <K>⌘</K> +{' '}
                <K>Z</K> for undo, <K>⌘</K> + <K>C</K> to copy.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[#1F4D3A]/70">
                <li>
                  Arrow keys on a MacBook sit in the bottom right corner. The up and down arrows are the two small half-height
                  keys between left and right.
                </li>
                <li>
                  If a key combination does nothing, click the sheet once first so it has focus.
                </li>
              </ul>
            </div>
          </details>
          </OnlyMac>
        </>
      ),
      hint: 'Hold Ctrl first, then tap the down arrow.',
      success: 'You jumped straight to the last number. Ctrl + Arrow is one of the most useful shortcuts in Excel.',
      seed: DATA,
      fresh: true,
      select: 'A3',
      check: (c) => c.events.has('ctrl+down') && c.active.c === 0 && c.active.r > 2,
    },
    {
      id: 'sum',
      title: 'Your first formula',
      body: (
        <>
          <p>
            Click <Cell>A6</Cell>, type <strong>=SUM(A3:A5)</strong> and press <K>Enter</K>.
          </p>
          <p>Every formula starts with an equals sign. SUM adds up everything in the range you give it.</p>
        </>
      ),
      hint: 'Type it exactly: equals, SUM, open bracket, A3, colon, A5, close bracket.',
      success: 'The cell shows 60, the answer, while the formula lives behind it. Click A6 to see it in the formula bar.',
      seed: DATA,
      select: 'A6',
      check: (c) => c.raw('A6').startsWith('=') && c.value('A6') === 60 && !c.editing,
    },
    {
      id: 'live',
      title: 'Formulas update live',
      body: (
        <p>
          Change <Cell>A4</Cell> from 20 to <strong>50</strong>. Click it, type 50 and press <K>Enter</K>. Watch{' '}
          <Cell>A6</Cell> recalculate by itself.
        </p>
      ),
      hint: 'You do not need to touch A6. The formula does the work.',
      success: 'The total jumped to 90 automatically. This is the real power of a spreadsheet.',
      seed: { ...DATA, A6: '=SUM(A3:A5)' },
      check: (c) => c.value('A4') === 50 && c.value('A6') === 90 && !c.editing,
    },
    {
      id: 'bold',
      title: 'Make it bold',
      body: (
        <p>
          Click <Cell>A1</Cell> and press <K>Ctrl</K> + <K>B</K> to make the heading bold.
        </p>
      ),
      hint: 'Ctrl + I makes italic and Ctrl + U underlines.',
      success: 'Formatting shortcuts work on whatever is selected, even a whole range.',
      seed: { ...DATA, A4: '50', A6: '=SUM(A3:A5)' },
      check: (c) => !!c.style('A1').b && c.events.has('ctrl+b'),
    },
    {
      id: 'undo',
      title: 'Undo a mistake',
      body: (
        <>
          <p>
            Changed your mind? Press <K>Ctrl</K> + <K>Z</K> to undo the bold.
          </p>
          <p>
            Later, <K>Ctrl</K> + <K>Y</K> brings it back. Undo and redo are your safety net, so experiment freely.
          </p>
        </>
      ),
      hint: 'Press Ctrl and Z together.',
      success: 'Undone. You can undo many steps in a row.',
      check: (c) => !c.style('A1').b && c.events.has('ctrl+z'),
    },
  ],
};
