import type { ReactNode } from 'react';
import type { Pos, Rect, Scalar, SheetData, Style } from '@/components/sheet/engine';

// What a step's check() can look at: the live state of the practice sheet.
export type StepCtx = {
  active: Pos;
  rect: Rect;
  editing: boolean;
  data: SheetData;
  /** Names of keyboard/mouse events seen since this step began. */
  events: ReadonlySet<string>;
  raw(key: string): string;
  value(key: string): Scalar;
  display(key: string): string;
  style(key: string): Style;
  /** Selection as a label, e.g. "A3:A5". */
  selection: string;
  activeKey: string;
};

export type LessonStep = {
  id: string;
  title: string;
  body: ReactNode;
  hint?: string;
  /** Shown once the step is complete. */
  success?: string;
  /** Cells merged into the sheet when the step starts (keeps steps robust). */
  seed?: Record<string, string>;
  /** Wipe the sheet first so only the seed is on it (use when stray data would break the task). */
  fresh?: boolean;
  /** Selection placed when the step starts, e.g. "A3". */
  select?: string;
  /** Omit for an info-only step that can always be continued. */
  check?: (c: StepCtx) => boolean;
};

export type LessonContent = {
  key: string;
  title: string;
  steps: LessonStep[];
};
