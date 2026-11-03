// Shared helpers for the Excel Automation course.
import type { ReactNode } from 'react';
import { custom } from './dsl';
import type { FlowConfig, LessonStep, MacroConfig, StepCtx } from './types';

export const AUTO_SHEET = { cols: 12, rows: 30 };

export const mac = (c: StepCtx) => c.macro;
export const codeOf = (c: StepCtx) => c.macro?.code ?? '';
export const codeHas = (c: StepCtx, re: RegExp) => re.test(codeOf(c));
/** The last run finished without an error (optionally for a named procedure). */
export const ranOk = (c: StepCtx, proc?: string) => !!c.macro?.run?.ok && (!proc || c.macro.run.proc.toLowerCase() === proc.toLowerCase());
export const lastRecorded = (c: StepCtx) => c.macro?.recorded[c.macro.recorded.length - 1];
export const val = (c: StepCtx, key: string) => c.value(key);

type MacroSol = NonNullable<NonNullable<LessonStep['solution']>['macro']>;
type FlowSol = NonNullable<NonNullable<LessonStep['solution']>['flow']>;
type StepOpts = {
  id: string;
  title: string;
  body: ReactNode;
  hint?: string;
  success?: string;
  macro?: MacroConfig;
  flow?: FlowConfig;
  resetPanels?: boolean;
  seed?: Record<string, string>;
  fresh?: boolean;
  select?: string;
  view?: 'macro' | 'sheet' | 'flow';
  check: (c: StepCtx) => boolean;
  sol: MacroSol;
  /** The flow a learner would build in the Power Automate tab (tests only). */
  solFlow?: FlowSol;
  cells?: Record<string, string>;
  solSelect?: string;
};
/** A step solved in the macro / script editor. */
export const macroStep = (o: StepOpts): LessonStep =>
  custom({
    id: o.id,
    title: o.title,
    body: o.body,
    hint: o.hint,
    success: o.success,
    macro: o.macro,
    flow: o.flow,
    resetPanels: o.resetPanels,
    seed: o.seed,
    fresh: o.fresh,
    select: o.select,
    view: o.view ?? 'macro',
    check: o.check,
    sol: { macro: o.sol, flow: o.solFlow, cells: o.cells, select: o.solSelect ?? o.select, view: o.view ?? 'macro' },
  });

/** Indents code for display inside a lesson body. */
export const Code = ({ children }: { children: string }) => (
  <pre className="my-2 overflow-x-auto rounded-lg bg-[#F1F5EF] px-3 py-2 font-mono text-[12.5px] leading-5 text-[#1F2937]">{children}</pre>
);
