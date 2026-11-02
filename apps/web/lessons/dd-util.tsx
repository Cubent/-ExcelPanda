// Shared data and builders for the Data & Dashboards course.
import type { ReactNode } from 'react';
import type { PqStep, PqTable } from '@/components/sheet/pq';
import { type DaxModel, evalMeasure } from '@/components/sheet/dax';
import { custom } from './dsl';
import type { LessonStep, ModelConfig, QueryConfig, StepCtx } from './types';

export const DD_SHEET = { cols: 12, rows: 30 };

/** Practice files the Power Query lessons read from. */
export const FILES: Record<string, string> = {
  'sales.csv':
    'Date,Region,Product,Units,Price\n2026-01-05,North, pen ,10,2\n2026-01-09,south,BOOK,4,9\n2026-01-12,North,Bag,n/a,25\n2026-02-03,East,Pen,12,2\n2026-02-14,South,book,6,9\n2026-03-02,north,Bag,3,25\n',
  'orders.csv': 'OrderID,CustID,Amount\n1001,C1,120\n1002,C2,80\n1003,C1,45\n1004,C9,60\n1005,C3,200\n',
  'customers.csv': 'CustID,Name,City\nC1,Ana,Oslo\nC2,Ben,Rome\nC3,Cy,Lima\nC4,Di,Kyiv\n',
  'jan.csv': 'Item,Qty\nPen,5\nBag,2\n',
  'feb.csv': 'Item,Qty\nPen,7\nBook,3\n',
  'mar.csv': 'Item,Qty\nBag,4\nBook,6\n',
  'wide.csv': 'Product,Jan,Feb,Mar\nPen,10,20,15\nBag,30,40,25\n',
  'long.csv': 'Product,Month,Sales\nPen,Jan,10\nPen,Feb,20\nBag,Jan,30\nBag,Feb,40\nPen,Mar,15\n',
  'report.csv': 'Region,Rep,Sales\nNorth,Ana,10\n,Ben,20\n,Cy,30\nSouth,Di,40\n',
};
export const FOLDERS = { Monthly: ['jan.csv', 'feb.csv', 'mar.csv'] };

export const SRC = (file: string): PqStep[] => [{ op: 'source', file }, { op: 'promoteHeaders' }];

// ---- query-state helpers --------------------------------------------------------
export const qTable = (c: StepCtx, name: string): PqTable | null => c.query?.queries[name]?.table ?? null;
export const qSteps = (c: StepCtx, name: string): PqStep[] => c.query?.queries[name]?.steps ?? [];
export const qHas = (c: StepCtx, name: string, op: PqStep['op']) => qSteps(c, name).some((s) => s.op === op);
export const qCol = (t: PqTable | null, col: string) => (t ? t.rows.map((r) => r[t.cols.indexOf(col)]) : []);
export const qLoaded = (c: StepCtx, name: string) => !!c.query?.loaded[name] && !c.query.stale;
export const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export const isErr = (v: unknown) => typeof v === 'object' && v !== null;

type QStepOpts = {
  id: string;
  title: string;
  body: ReactNode;
  hint?: string;
  success?: string;
  query?: QueryConfig;
  resetPanels?: boolean;
  seed?: Record<string, string>;
  fresh?: boolean;
  select?: string;
  view?: 'query' | 'sheet' | 'model';
  check: (c: StepCtx) => boolean;
  sol: NonNullable<NonNullable<LessonStep['solution']>['query']>;
  solCells?: Record<string, string>;
};
/** A step solved in the Power Query editor. */
export const qstep = (o: QStepOpts): LessonStep =>
  custom({
    id: o.id,
    title: o.title,
    body: o.body,
    hint: o.hint,
    success: o.success,
    query: o.query,
    resetPanels: o.resetPanels,
    seed: o.seed,
    fresh: o.fresh,
    select: o.select,
    view: o.view ?? 'query',
    check: o.check,
    sol: { query: o.sol, cells: o.solCells, view: o.view ?? 'query' },
  });

// ---- data model -------------------------------------------------------------------
const months = (y: number) => Array.from({ length: 12 }, (_, i) => `${y}-${String(i + 1).padStart(2, '0')}-01`);
export const MODEL_TABLES: DaxModel['tables'] = {
  Sales: {
    cols: ['Date', 'ProductID', 'Units', 'Price'],
    rows: [
      ['2025-01-01', 1, 10, 2], ['2025-02-01', 2, 4, 9], ['2025-03-01', 1, 6, 2], ['2026-01-01', 1, 12, 2],
      ['2026-02-01', 3, 5, 25], ['2026-03-01', 2, 3, 9], ['2026-03-01', 3, 2, 25],
    ],
  },
  Products: { cols: ['ProductID', 'Name', 'Category'], rows: [[1, 'Pen', 'Stationery'], [2, 'Book', 'Stationery'], [3, 'Bag', 'Gear']] },
  Calendar: {
    cols: ['Date', 'Year', 'Month'],
    rows: [...months(2025), ...months(2026)].map((d) => [d, Number(d.slice(0, 4)), Number(d.slice(5, 7))]),
  },
};
export const REL_PRODUCT = { from: 'Sales[ProductID]', to: 'Products[ProductID]' };
export const REL_DATE = { from: 'Sales[Date]', to: 'Calendar[Date]' };
export const MODEL: ModelConfig = { tables: MODEL_TABLES };
export const MODEL_REL: ModelConfig = { tables: MODEL_TABLES, relationships: [REL_PRODUCT, REL_DATE] };

export const mRels = (c: StepCtx) => c.model?.model.relationships ?? [];
export const mMeasure = (c: StepCtx, name: string) => c.model?.model.measures[name];
export const mReport = (c: StepCtx) => c.model?.report;
export const mCell = (c: StepCtx, row: string, col: string) => {
  const t = c.model?.report.table;
  if (!t) return undefined;
  const r = t.rows.find((x) => String(x[0]) === row);
  return r ? r[t.cols.indexOf(col)] : undefined;
};
/** The value of a measure in the current model under optional filters (undefined if it does not exist or fails). */
export const mVal = (c: StepCtx, name: string, filters?: Record<string, string[]>) => {
  const m = c.model?.model;
  if (!m || !(name in m.measures)) return undefined;
  const r = evalMeasure(m, name, filters);
  return r.error ? undefined : r.value;
};
export const mUses = (c: StepCtx, name: string, ...fns: string[]) => fns.every((f) => new RegExp(`\\b${f}\\s*\\(`, 'i').test(c.model?.model.measures[name] ?? ''));
export const approx = (v: unknown, n: number, eps = 1e-3) => typeof v === 'number' && Math.abs(v - n) < eps;
