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

/** Extra sheet features a lesson can switch on: named ranges, other sheets, conditional formats, dropdown lists. */
export type SheetMeta = Pick<SheetData, 'names' | 'ext' | 'cf' | 'lists'>;

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
  /** Sheet features for this step (merged over the lesson's `meta`). */
  meta?: SheetMeta;
  /** Selection placed when the step starts, e.g. "A3". */
  select?: string;
  /** Test-only: a correct answer used by the automated lesson tests. Never shown to learners. */
  solution?: { cells?: Record<string, string>; styles?: Record<string, Style>; events?: string[]; names?: Record<string, string>; select?: string };
  /** Omit for an info-only step that can always be continued. */
  check?: (c: StepCtx) => boolean;
};

export type LessonContent = {
  /** Sheet features available for the whole lesson. */
  meta?: SheetMeta;
  /** Show the formatting toolbar for this lesson (needed for fill colour, alignment). */
  toolbar?: boolean;
  key: string;
  title: string;
  steps: LessonStep[];
};
