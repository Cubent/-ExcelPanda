// Small builders that keep lesson definitions short and consistent.
import type { ReactNode } from 'react';
import * as E from '@/components/sheet/engine';
import type { ChartPanelConfig, FlowConfig, LessonStep, MacroConfig, ModelConfig, QueryConfig, PivotPanelConfig, SheetMeta, SheetView, StepCtx, ToolName } from './types';

export const isF = (raw: string) => raw.trim().startsWith('=');
/** True when the formula calls every one of the named functions. */
export const uses = (raw: string, ...fns: string[]) => fns.every((fn) => new RegExp(`\\b${fn.replace('.', '\\.')}\\s*\\(`, 'i').test(raw));
export const squash = (v: unknown) => String(v).trim().replace(/\s+/g, ' ').toLowerCase();
/** Turns rows of values into cell addresses, e.g. grid([['Name','Qty'],['Pen',2]]) -> {A1:'Name',B1:'Qty',A2:'Pen',B2:'2'}. */
export const grid = (rows: (string | number)[][], c0 = 0, r0 = 0): Record<string, string> => {
  const out: Record<string, string> = {};
  rows.forEach((row, ri) => row.forEach((v, ci) => (out[E.keyOf(c0 + ci, r0 + ri)] = String(v))));
  return out;
};
export const date = (y: number, m: number, d: number) => E.dateToSerial(y, m, d);
export const near = (v: unknown, n: number, eps = 1e-6) => typeof v === 'number' && Math.abs(v - n) < eps;

export type Want = E.Scalar | ((v: E.Scalar) => boolean);
export const matches = (v: E.Scalar, want: Want): boolean => {
  if (typeof want === 'function') return want(v);
  if (typeof want === 'number') return near(v, want);
  if (typeof want === 'string') return typeof v === 'string' && squash(v) === squash(want);
  return v === want;
};

type Base = {
  id: string;
  title: string;
  body: ReactNode;
  hint?: string;
  success?: string;
  seed?: Record<string, string>;
  fresh?: boolean;
  select?: string;
  meta?: SheetMeta;
  tools?: ToolName[];
  view?: SheetView;
  resetPanels?: boolean;
  pivot?: PivotPanelConfig;
  chart?: ChartPanelConfig;
  query?: QueryConfig;
  model?: ModelConfig;
  macro?: MacroConfig;
  flow?: FlowConfig;
};

/** An information-only step. */
export const info = (id: string, title: string, body: ReactNode): LessonStep => ({ id, title, body });

/**
 * A step solved by writing formulas. Every cell in `cells` must hold a formula
 * (unless listed in `plain`) whose result matches, and every formula must use
 * the functions named in `uses`. `sol` is the scripted answer for the tests.
 */
export function task(
  o: Base & {
    cells: Record<string, Want>;
    plain?: string[];
    uses?: string | string[] | Record<string, string | string[]>;
    also?: (c: StepCtx) => boolean;
    sol: Record<string, string>;
    ev?: string[];
  },
): LessonStep {
  const need = (cell: string): string[] => {
    const u = o.uses;
    if (!u) return [];
    if (typeof u === 'string') return [u];
    if (Array.isArray(u)) return u;
    const v = u[cell];
    return v ? (Array.isArray(v) ? v : [v]) : [];
  };
  return {
    id: o.id,
    title: o.title,
    body: o.body,
    hint: o.hint,
    success: o.success,
    seed: o.seed,
    fresh: o.fresh,
    select: o.select ?? Object.keys(o.cells)[0],
    meta: o.meta,
    tools: o.tools,
    view: o.view,
    resetPanels: o.resetPanels,
    pivot: o.pivot,
    chart: o.chart,
    query: o.query,
    model: o.model,
    macro: o.macro,
    flow: o.flow,
    solution: { cells: o.sol, events: o.ev },
    check: (c) => {
      if (c.editing) return false;
      for (const [cell, want] of Object.entries(o.cells)) {
        const raw = c.raw(cell);
        const plain = o.plain?.includes(cell);
        if (!plain && !isF(raw)) return false;
        if (!uses(raw, ...need(cell))) return false;
        if (!matches(c.value(cell), want)) return false;
      }
      return o.also ? o.also(c) : true;
    },
  };
}

/** A step with a fully custom check (selection, formatting, events...). */
export function custom(
  o: Base & {
    check: (c: StepCtx) => boolean;
    sol: NonNullable<LessonStep['solution']>;
  },
): LessonStep {
  return {
    id: o.id,
    title: o.title,
    body: o.body,
    hint: o.hint,
    success: o.success,
    seed: o.seed,
    fresh: o.fresh,
    select: o.select,
    meta: o.meta,
    tools: o.tools,
    view: o.view,
    resetPanels: o.resetPanels,
    pivot: o.pivot,
    chart: o.chart,
    query: o.query,
    model: o.model,
    macro: o.macro,
    flow: o.flow,
    check: o.check,
    solution: o.sol,
  };
}
