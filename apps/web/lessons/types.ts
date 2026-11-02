import type { ReactNode } from 'react';
import type { PivotState } from '@/components/lesson/PivotPanel';
import type { ChartConfig, ChartState, ChartType } from '@/components/lesson/ChartPanel';
import type { Pos, Rect, Scalar, SheetData, Style } from '@/components/sheet/engine';
import type { PivotConfig } from '@/components/sheet/pivot';
import type { QueryConfig, QueryState } from '@/components/lesson/QueryPanel';
import type { ModelConfig, ModelState } from '@/components/lesson/ModelPanel';
import type { PqStep } from '@/components/sheet/pq';
import type { Relationship } from '@/components/sheet/dax';
import type { ToolName } from '@/components/sheet/SheetGrid';

export type { ToolName };
export type PivotPanelConfig = {
  /** Table name or range the pivot reads. */
  source: string;
  initial?: PivotConfig;
  features?: { group?: boolean; showAs?: boolean; calc?: boolean; slicers?: boolean; filter?: boolean };
};
export type ChartPanelConfig = {
  initial?: Partial<ChartConfig>;
  allow?: { types?: ChartType[]; pivot?: boolean; options?: boolean; axisTitles?: boolean };
};
export type SheetView = 'sheet' | 'pivot' | 'chart' | 'query' | 'model';
export type { QueryConfig, QueryState } from '@/components/lesson/QueryPanel';
export type { ModelConfig, ModelState } from '@/components/lesson/ModelPanel';

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
  /** Latest state of the PivotTable and Chart builders (null until used). */
  pivot: PivotState | null;
  chart: ChartState | null;
  /** Power Query editor and data model state (null until the panel exists). */
  query: QueryState | null;
  model: ModelState | null;
  view: SheetView;
};

/** Extra sheet features a lesson can switch on: named ranges, other sheets, conditional formats, dropdown lists. */
export type SheetMeta = Pick<SheetData, 'names' | 'ext' | 'cf' | 'lists' | 'tables' | 'filter' | 'hidden' | 'slicers'>;

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
  /** Data tools shown for this step (defaults to the lesson's `tools`). */
  tools?: ToolName[];
  /** Switch to this tab when the step starts (default: the sheet). */
  view?: SheetView;
  /** Restart the PivotTable / Chart builders at the start of this step. */
  resetPanels?: boolean;
  /** Pivot / chart builders for this step (override the lesson's). */
  pivot?: PivotPanelConfig;
  chart?: ChartPanelConfig;
  query?: QueryConfig;
  model?: ModelConfig;
  /** Selection placed when the step starts, e.g. "A3". */
  select?: string;
  /** Test-only: a correct answer used by the automated lesson tests. Never shown to learners. */
  solution?: {
    cells?: Record<string, string>;
    styles?: Record<string, Style>;
    events?: string[];
    names?: Record<string, string>;
    select?: string;
    /** The sheet data after using a tool (tables, filter, hidden rows...). */
    data?: Partial<SheetData>;
    pivot?: PivotConfig;
    chart?: Partial<ChartConfig>;
    view?: SheetView;
    /** Steps appended to a query (created from its first step if new), and what to load. */
    query?: { name: string; steps: PqStep[]; remove?: PqStep['op'][]; load?: boolean; params?: Record<string, string> }[];
    /** Relationships, measures and the report fields for the data model. */
    model?: { relationships?: Relationship[]; measures?: Record<string, string>; report?: { rowField: string; measures: string[]; filters?: Record<string, string[]> } };
  };
  /** Omit for an info-only step that can always be continued. */
  check?: (c: StepCtx) => boolean;
};

export type LessonContent = {
  /** A bigger sheet that opens automatically for this lesson (it scrolls inside the page). */
  sheet?: { cols: number; rows: number };
  /** Data tools available in this lesson's sheet. */
  tools?: ToolName[];
  /** Pivot / chart builders (adds tabs above the sheet). */
  pivot?: PivotPanelConfig;
  chart?: ChartPanelConfig;
  query?: QueryConfig;
  model?: ModelConfig;
  /** Sheet features available for the whole lesson. */
  meta?: SheetMeta;
  /** Show the formatting toolbar for this lesson (needed for fill colour, alignment). */
  toolbar?: boolean;
  key: string;
  title: string;
  steps: LessonStep[];
};
