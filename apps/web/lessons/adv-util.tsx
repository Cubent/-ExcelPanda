// Shared data and builders for the Advanced Formulas course.
import * as E from '@/components/sheet/engine';
import { custom, grid, isF, matches, uses, type Want } from './dsl';

export type Row = [string, string, string, number, number];

/** 20 orders: Region, Rep, Product, Units, Price. */
export const ROWS: Row[] = [
  ['North', 'Ana', 'Pen', 10, 2],
  ['South', 'Ben', 'Book', 4, 9],
  ['East', 'Cleo', 'Pen', 12, 2],
  ['North', 'Dev', 'Bag', 3, 25],
  ['West', 'Ana', 'Lamp', 2, 18],
  ['South', 'Ben', 'Pen', 8, 2],
  ['East', 'Cleo', 'Book', 6, 9],
  ['North', 'Ana', 'Book', 5, 9],
  ['West', 'Dev', 'Pen', 14, 2],
  ['South', 'Cleo', 'Bag', 2, 25],
  ['East', 'Ben', 'Lamp', 4, 18],
  ['North', 'Dev', 'Pen', 9, 2],
  ['West', 'Ana', 'Book', 7, 9],
  ['South', 'Dev', 'Lamp', 3, 18],
  ['East', 'Ana', 'Bag', 5, 25],
  ['North', 'Cleo', 'Lamp', 6, 18],
  ['West', 'Ben', 'Bag', 4, 25],
  ['South', 'Ana', 'Pen', 11, 2],
  ['East', 'Dev', 'Book', 3, 9],
  ['West', 'Cleo', 'Pen', 8, 2],
];
export const HEADER = ['Region', 'Rep', 'Product', 'Units', 'Price'];
export const SALES = grid([HEADER, ...ROWS.map((r) => [...r])]);
export const SHEET = { cols: 12, rows: 30 };

export const uniq = <T,>(a: T[]) => [...new Set(a)];
/** Stable sort by one or more keys (ascending unless the key returns a negative flag via `desc`). */
export const sortRows = <T,>(a: T[], ...keys: { by: (x: T) => number | string; desc?: boolean }[]) =>
  a
    .map((x, i) => ({ x, i }))
    .sort((p, q) => {
      for (const k of keys) {
        const u = k.by(p.x);
        const v = k.by(q.x);
        const c = typeof u === 'number' && typeof v === 'number' ? u - v : String(u).toLowerCase().localeCompare(String(v).toLowerCase());
        if (c !== 0) return k.desc ? -c : c;
      }
      return p.i - q.i;
    })
    .map((o) => o.x);
export const units = (r: Row) => r[3];
export const revenue = (r: Row) => r[3] * r[4];

type CustomArg = Parameters<typeof custom>[0];
type SpillOpts = Omit<CustomArg, 'check' | 'sol'> & {
  /** The anchor cell where the formula is typed. */
  at: string;
  /** The values the spill must produce, row by row, starting at `at`. */
  expect: Want[][];
  /** Function names the formula must use. */
  uses?: string[];
  /** Also require the cells just below and to the right of the block to be empty (the result is exactly this size). */
  exact?: boolean;
  also?: CustomArg extends never ? never : (c: Parameters<CustomArg['check']>[0]) => boolean;
  sol: Record<string, string>;
  ev?: string[];
  names?: Record<string, string>;
};

/** A step solved by typing one formula that spills into a block of cells. */
export function spill(o: SpillOpts) {
  const { at, expect, uses: need = [], exact = false, also, sol, ev, names, ...rest } = o;
  const p = E.parseKey(at) as E.Pos;
  return custom({
    ...rest,
    select: rest.select ?? at,
    check: (c) => {
      if (c.editing) return false;
      const raw = c.raw(at);
      if (!isF(raw) || !uses(raw, ...need)) return false;
      for (let r = 0; r < expect.length; r++) {
        for (let k = 0; k < expect[r].length; k++) {
          const key = E.keyOf(p.c + k, p.r + r);
          if (!(r === 0 && k === 0) && c.raw(key) !== '') return false; // spilled cells must come from the formula, not be typed
          if (!matches(c.value(key), expect[r][k])) return false;
        }
      }
      if (exact) {
        const below = E.keyOf(p.c, p.r + expect.length);
        const right = E.keyOf(p.c + (expect[0]?.length ?? 1), p.r);
        if (c.display(below) !== '' || c.display(right) !== '') return false;
      }
      return also ? also(c) : true;
    },
    sol: { cells: sol, events: ev, names },
  });
}

export const rowsToCells = (rows: (string | number)[][]): Want[][] => rows.map((r) => [...r]);
