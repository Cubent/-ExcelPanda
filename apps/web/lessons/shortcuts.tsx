// The shortcut trainer: one keyboard move per step. Each step stands alone, so the trainer can shuffle them.
import * as E from '@/components/sheet/engine';
import { custom, grid } from './dsl';
import { Cell, K } from './kbd';
import { OnlyMac, OnlyWindows } from './platform';
import type { LessonContent } from './types';

const DATA = grid([['Item', 'Qty', 'Price'], ['Pen', 10, 2.5], ['Book', 4, 12], ['Bag', 2, 30], ['Mug', 6, 8]]);
const COLUMN = grid(Array.from({ length: 12 }, (_, i) => [(i + 1) * 5]));
const NUMS = grid([[12], [8], [20], [5]], 1, 0);

export const shortcutTrainer: LessonContent = {
  key: 'trainer-shortcuts',
  title: 'Shortcut trainer',
  steps: [
    custom({
      id: 'sc-end', title: 'Jump to the last cell',
      body: <p>Press <K>Ctrl</K> + <K>End</K> to jump to the last used cell of the sheet.</p>,
      hint: 'Hold Ctrl, tap End.',
      success: 'C5: the bottom-right corner of the data.',
      seed: DATA, fresh: true, select: 'A1',
      check: (c) => c.events.has('ctrl+end') && c.activeKey === 'C5',
      sol: { select: 'C5', events: ['ctrl+end'] },
    }),
    custom({
      id: 'sc-jump', title: 'Jump down a column',
      body: <p>The numbers run down column A. From <Cell>A1</Cell>, get to the last one in a <strong>single jump</strong> with <OnlyWindows><K>Ctrl</K> + <K>↓</K></OnlyWindows><OnlyMac><K>⌘ Cmd</K> + <K>⌃ Control</K> + <K>↓</K></OnlyMac>.</p>,
      hint: 'Modifier + Arrow hops to the edge of a block of data.',
      success: 'A12 in one keystroke instead of eleven.',
      seed: COLUMN, fresh: true, select: 'A1',
      check: (c) => c.activeKey === 'A12',
      sol: { select: 'A12', events: ['arrow'] },
    }),
    custom({
      id: 'sc-shift', title: 'Select with Shift',
      body: <p>Select <Cell>A1:C3</Cell> using only the keyboard: hold <K>Shift</K> and press the arrow keys.</p>,
      hint: 'Shift+Right twice, Shift+Down twice.',
      success: 'A block selected without touching the mouse.',
      seed: DATA, fresh: true, select: 'A1',
      check: (c) => c.selection === 'A1:C3' && c.events.has('shift+arrow'),
      sol: { select: 'A1:C3', events: ['shift+arrow'] },
    }),
    custom({
      id: 'sc-col', title: 'Select a whole column',
      body: <p>Click <Cell>B2</Cell>, then select the entire column with <K>Ctrl</K> + <K>Space</K>.</p>,
      hint: 'Ctrl, then the space bar.',
      success: 'Column B is selected.',
      seed: DATA, fresh: true, select: 'B2',
      check: (c) => c.events.has('ctrl+space') && c.rect.c1 === 1 && c.rect.c2 === 1 && c.rect.r1 === 0 && c.rect.r2 === E.ROWS - 1,
      sol: { select: `B1:B${E.ROWS}`, events: ['ctrl+space'] },
    }),
    custom({
      id: 'sc-row', title: 'Select a whole row',
      body: <p>Click <Cell>A3</Cell>, then select the entire row with <K>Shift</K> + <K>Space</K>.</p>,
      hint: 'Shift, then the space bar.',
      success: 'Row 3 is selected.',
      seed: DATA, fresh: true, select: 'A3',
      check: (c) => c.events.has('shift+space') && c.rect.r1 === 2 && c.rect.r2 === 2 && c.rect.c1 === 0 && c.rect.c2 === E.COLS - 1,
      sol: { select: `A3:${E.colLabel(E.COLS - 1)}3`, events: ['shift+space'] },
    }),
    custom({
      id: 'sc-all', title: 'Select everything',
      body: <p>Select the whole sheet with <K>Ctrl</K> + <K>A</K>.</p>,
      hint: 'Ctrl and A.',
      success: 'Everything selected.',
      seed: DATA, fresh: true, select: 'B2',
      check: (c) => c.events.has('ctrl+a') || c.events.has('select-all'),
      sol: { events: ['ctrl+a'] },
    }),
    custom({
      id: 'sc-f2', title: 'Edit a cell in place',
      body: <p>Click <Cell>A2</Cell> and press <K>F2</K> to edit the cell without retyping it.</p>,
      hint: 'F2 puts the cursor inside the cell.',
      success: 'You are editing the existing text.',
      seed: DATA, fresh: true, select: 'A2',
      check: (c) => c.events.has('f2'),
      sol: { events: ['f2'] },
    }),
    custom({
      id: 'sc-date', title: "Today's date",
      body: <p>Click <Cell>D1</Cell> and press <K>Ctrl</K> + <K>;</K>, then Enter.</p>,
      hint: 'Ctrl and the semicolon.',
      success: 'A fixed date, stamped in one move.',
      seed: DATA, fresh: true, select: 'D1',
      check: (c) => c.events.has('ctrl+;') && typeof c.value('D1') === 'number' && !c.editing,
      sol: { cells: { D1: '2026-03-15' }, events: ['ctrl+;'] },
    }),
    custom({
      id: 'sc-sum', title: 'AutoSum',
      body: <p>Click <Cell>A5</Cell> (under the numbers) and press <K>Alt</K> + <K>=</K>, then Enter.</p>,
      hint: 'On a Mac use Cmd + Shift + T.',
      success: '45.',
      seed: NUMS, fresh: true, select: 'B5',
      check: (c) => c.events.has('autosum') && /^=SUM\(/i.test(c.raw('B5')) && c.value('B5') === 45 && !c.editing,
      sol: { cells: { B5: '=SUM(B1:B4)' }, events: ['autosum'] },
    }),
    custom({
      id: 'sc-copy', title: 'Copy and paste',
      body: <p>Copy <Cell>A2</Cell> and paste it into <Cell>E2</Cell> with <K>Ctrl</K> + <K>C</K> and <K>Ctrl</K> + <K>V</K>.</p>,
      hint: 'Ctrl+C on A2, click E2, Ctrl+V.',
      success: 'Copied without a menu.',
      seed: DATA, fresh: true, select: 'A2',
      check: (c) => c.events.has('ctrl+c') && c.events.has('ctrl+v') && c.raw('E2') === 'Pen',
      sol: { cells: { E2: 'Pen' }, events: ['ctrl+c', 'ctrl+v'] },
    }),
    custom({
      id: 'sc-undo', title: 'Undo a mistake',
      body: <p>In <Cell>E1</Cell> type anything and press Enter, then take it back with <K>Ctrl</K> + <K>Z</K>.</p>,
      hint: 'Ctrl and Z.',
      success: 'Undone. Ctrl+Y brings it back.',
      seed: DATA, fresh: true, select: 'E1',
      check: (c) => c.events.has('ctrl+z') && c.raw('E1') === '',
      sol: { events: ['ctrl+z'] },
    }),
    custom({
      id: 'sc-f4', title: 'Lock a reference',
      body: <p>In <Cell>B2</Cell> type <code>=A2*F1</code> and press <K>F4</K> on F1 to make it <strong>$F$1</strong>.</p>,
      hint: 'F4 cycles through the dollar-sign versions.',
      success: 'A locked reference you can fill down.',
      seed: { A2: '120', F1: '0.2' }, fresh: true, select: 'B2',
      check: (c) => c.events.has('f4') && /\$F\$1/.test(c.raw('B2')) && !c.editing,
      sol: { cells: { B2: '=A2*$F$1' }, events: ['f4'] },
    }),
  ],
};
