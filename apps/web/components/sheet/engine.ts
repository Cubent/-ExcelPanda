// ---------------------------------------------------------------------------
// ExcelPanda spreadsheet engine: addressing, formulas, formatting, fill.
// Pure TypeScript with no React, so it can be unit tested on its own.
// ---------------------------------------------------------------------------
import * as Fin from './finance';
import { formatWithPattern } from './numfmt';

// Sheet size is switchable (lesson settings); set before rendering the grid.
export let COLS = 10;
export let ROWS = 14;
export function setSheetSize(cols: number, rows: number) {
  COLS = cols;
  ROWS = rows;
}

export type Pos = { c: number; r: number };
export type Rect = { c1: number; r1: number; c2: number; r2: number };

export type NumFmt = 'general' | 'number' | 'currency' | 'percent' | 'date';
export type Style = {
  b?: boolean;
  i?: boolean;
  u?: boolean;
  align?: 'left' | 'center' | 'right';
  fmt?: NumFmt;
  /** A custom number format such as 0.0,"k" (takes precedence over fmt). */
  nf?: string;
  dec?: number;
  bg?: string;
  color?: string;
};

/** Conditional-format rule: `formula` is written for the top-left cell of `range`. */
export type CfRule = { range: string; formula: string; style: Style };

/** An Excel Table: a named block with a header row. `range` includes the header (and the totals row, if any). */
export type TableDef = { name: string; range: string; totals?: boolean };
/** One column's filter: pick values, or compare with an operator. */
export type FilterSpec = { values?: string[]; op?: '>' | '<' | '=' | '>=' | '<=' | '<>' | 'contains'; val?: string };
/** `range` includes the header row; `cols` is keyed by absolute column index. */
export type FilterState = { range: string; cols: Record<number, FilterSpec> };

export type SheetData = {
  /** Tables in the sheet (banded, with structured references like Table1[Sales]). */
  tables?: TableDef[];
  /** Row indexes currently hidden by a filter. */
  hidden?: number[];
  /** The active filter, if any. */
  filter?: FilterState;
  /** Slicers: button panels that filter a column. */
  slicers?: { col: number; name: string }[];
  cells: Record<string, string>;
  styles: Record<string, Style>;
  colW: Record<number, number>;
  /** Named ranges, e.g. { TAXRATE: "B1", PRICES: "B2:B9" }. */
  names?: Record<string, string>;
  /** Read-only extra sheets that formulas can reference, e.g. Rates!B2. */
  ext?: Record<string, Record<string, string>>;
  /** Conditional formatting rules (display only). */
  cf?: CfRule[];
  /** Dropdown lists by cell key or range label, e.g. { "C2:C9": ["Yes", "No"] }. */
  lists?: Record<string, string[]>;
};

export const emptyData = (): SheetData => ({ cells: {}, styles: {}, colW: {} });

// --- addressing -------------------------------------------------------------

export function colLabel(c: number): string {
  let s = '';
  let n = c + 1;
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function colIndex(label: string): number {
  let n = 0;
  for (const ch of label.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export const keyOf = (c: number, r: number) => `${colLabel(c)}${r + 1}`;

export function parseKey(k: string): Pos | null {
  const m = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(k.trim());
  if (!m) return null;
  return { c: colIndex(m[1]), r: parseInt(m[2], 10) - 1 };
}

export const inBounds = (c: number, r: number) => c >= 0 && r >= 0 && c < COLS && r < ROWS;

export function rectOf(a: Pos, b: Pos): Rect {
  return {
    c1: Math.min(a.c, b.c),
    r1: Math.min(a.r, b.r),
    c2: Math.max(a.c, b.c),
    r2: Math.max(a.r, b.r),
  };
}

export function rectLabel(rc: Rect): string {
  const a = keyOf(rc.c1, rc.r1);
  if (rc.c1 === rc.c2 && rc.r1 === rc.r2) return a;
  return `${a}:${keyOf(rc.c2, rc.r2)}`;
}

// Parses "B2", "B2:D4", "C:C" or "3:3" into a rect.
export function parseRectLabel(text: string): Rect | null {
  const t = text.trim().toUpperCase();
  const col = /^([A-Z]{1,3}):([A-Z]{1,3})$/.exec(t);
  if (col) return rectOf({ c: colIndex(col[1]), r: 0 }, { c: colIndex(col[2]), r: ROWS - 1 });
  const row = /^(\d+):(\d+)$/.exec(t);
  if (row) return rectOf({ c: 0, r: +row[1] - 1 }, { c: COLS - 1, r: +row[2] - 1 });
  const parts = t.split(':');
  const a = parseKey(parts[0]);
  const b = parts[1] ? parseKey(parts[1]) : a;
  if (!a || !b) return null;
  if (!inBounds(a.c, a.r) || !inBounds(b.c, b.r)) return null;
  return rectOf(a, b);
}

export const rectsEqual = (a: Rect, b: Rect) =>
  a.c1 === b.c1 && a.r1 === b.r1 && a.c2 === b.c2 && a.r2 === b.r2;

// --- values & errors --------------------------------------------------------

export class XlError {
  constructor(public code: string) {}
  toString() {
    return this.code;
  }
}
export type Scalar = number | string | boolean | XlError | null;
type RangeVal = { range: true; vals: Scalar[]; rows: number; cols: number };
type Env = Record<string, Val>;
type Lambda = { lambda: true; params: string[]; body: Node; env: Env } | { lambda: true; builtin: string };
type Val = Scalar | RangeVal | Lambda;
const isLambda = (v: Val): v is Lambda => typeof v === 'object' && v !== null && 'lambda' in v;

const isRange = (v: Val): v is RangeVal => typeof v === 'object' && v !== null && 'range' in v;

// --- dates ------------------------------------------------------------------

const DAY_MS = 86_400_000;
const EPOCH = Date.UTC(1899, 11, 30); // Excel serial 0 (valid for dates after Feb 1900)
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const dateToSerial = (y: number, m: number, d: number) => Math.round((Date.UTC(y, m - 1, d) - EPOCH) / DAY_MS);
export function serialToParts(n: number) {
  const dt = new Date(EPOCH + Math.floor(n) * DAY_MS);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), wd: dt.getUTCDay() };
}
export function todaySerial() {
  const n = new Date();
  return dateToSerial(n.getFullYear(), n.getMonth() + 1, n.getDate());
}
const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** Parses typed date text: 2026-03-15, 3/15/2026, 15 Mar 2026, Mar 15, 2026. */
export function parseDateText(text: string): number | null {
  const t = text.trim();
  let y: number;
  let m: number;
  let d: number;
  let x: RegExpExecArray | null;
  const monthIdx = (name: string) => MONTH_NAMES.findIndex((n) => n.toLowerCase().startsWith(name.toLowerCase().slice(0, 3))) + 1;
  if ((x = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t))) [y, m, d] = [+x[1], +x[2], +x[3]];
  else if ((x = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t))) [y, m, d] = [+x[3], +x[1], +x[2]];
  else if ((x = /^(\d{1,2}) ([A-Za-z]{3,9}) (\d{4})$/.exec(t))) [y, m, d] = [+x[3], monthIdx(x[2]), +x[1]];
  else if ((x = /^([A-Za-z]{3,9}) (\d{1,2}),? (\d{4})$/.exec(t))) [y, m, d] = [+x[3], monthIdx(x[1]), +x[2]];
  else return null;
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m) || y < 1900) return null;
  return dateToSerial(y, m, d);
}

/** Formats a serial with Excel-style date codes (yyyy, mmm, dd, ddd, h:mm ...). */
export function formatDate(serial: number, pattern = 'd mmm yyyy'): string {
  const { y, m, d, wd } = serialToParts(serial);
  const frac = serial - Math.floor(serial);
  const secs = Math.round(frac * 86400);
  const hh = Math.floor(secs / 3600) % 24;
  const mi = Math.floor((secs % 3600) / 60);
  const ss = secs % 60;
  const ampm = /AM\/PM/i.test(pattern);
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return pattern.replace(/AM\/PM|yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d|hh|h|ss|s/gi, (tok, off: number) => {
    const t = tok.toLowerCase();
    const minuteCtx = (t === 'mm' || t === 'm') && (pattern[off - 1] === ':' || pattern[off + tok.length] === ':' || /h/i.test(pattern.slice(Math.max(0, off - 3), off)));
    if (t === 'am/pm') return hh >= 12 ? 'PM' : 'AM';
    if (t === 'yyyy') return String(y);
    if (t === 'yy') return pad(y % 100);
    if (minuteCtx) return t === 'mm' ? pad(mi) : String(mi);
    if (t === 'mmmm') return MONTH_NAMES[m - 1];
    if (t === 'mmm') return MONTH_NAMES[m - 1].slice(0, 3);
    if (t === 'mm') return pad(m);
    if (t === 'm') return String(m);
    if (t === 'dddd') return DAY_NAMES[wd];
    if (t === 'ddd') return DAY_NAMES[wd].slice(0, 3);
    if (t === 'dd') return pad(d);
    if (t === 'd') return String(d);
    if (t === 'hh' || t === 'h') {
      const h = ampm ? hh % 12 || 12 : hh;
      return t === 'hh' ? pad(h) : String(h);
    }
    if (t === 'ss') return pad(ss);
    return String(ss);
  });
}

// Interprets what the user typed (not starting with "=") as a typed value.
export function literal(raw: string): Scalar {
  const t = raw.trim();
  if (t === '') return null;
  const up = t.toUpperCase();
  if (up === 'TRUE') return true;
  if (up === 'FALSE') return false;
  const compact = t.replace(/\s/g, '');
  const m = /^([-+]?)\$?(\d[\d,]*\.?\d*|\.\d+)(%?)$/.exec(compact);
  if (m) {
    let n = Number.parseFloat(m[2].replace(/,/g, ''));
    if (Number.isNaN(n)) return raw;
    if (m[1] === '-') n = -n;
    if (m[3]) n /= 100;
    return n;
  }
  if (/^[-+]?\d+(\.\d+)?e[-+]?\d+$/i.test(compact)) return Number.parseFloat(compact);
  const date = parseDateText(t);
  if (date !== null) return date;
  return raw;
}

// --- tokenizer & parser -----------------------------------------------------

type Tok =
  | { t: 'num'; v: number }
  | { t: 'str'; v: string }
  | { t: 'ref'; v: string; sheet?: string; spill?: boolean }
  | { t: 'lb' }
  | { t: 'rb' }
  | { t: 'semi' }
  | { t: 'struct'; table?: string; col: string; row: boolean }
  | { t: 'name'; v: string }
  | { t: 'fn'; v: string }
  | { t: 'op'; v: string }
  | { t: 'lp' }
  | { t: 'rp' }
  | { t: 'comma' };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      let s = '';
      while (j < src.length) {
        if (src[j] === '"') {
          if (src[j + 1] === '"') {
            s += '"';
            j += 2;
            continue;
          }
          break;
        }
        s += src[j++];
      }
      if (j >= src.length) throw new XlError('#NAME?');
      out.push({ t: 'str', v: s });
      i = j + 1;
      continue;
    }
    const rest = src.slice(i);
    let m = /^(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i.exec(rest);
    if (m) {
      out.push({ t: 'num', v: Number.parseFloat(m[0]) });
      i += m[0].length;
      continue;
    }
    m = /^([A-Za-z_][A-Za-z0-9_.]*)?\[(@)?\[?([^\]\[]+?)\]?\]/.exec(rest);
    if (m) {
      out.push({ t: 'struct', table: m[1], col: m[3].trim(), row: !!m[2] });
      i += m[0].length;
      continue;
    }
    m = /^(?:'([^']+)'|([A-Za-z_][A-Za-z0-9_]*))!\$?([A-Za-z]{1,3})\$?(\d+)(?![\w.(])/.exec(rest);
    if (m) {
      out.push({ t: 'ref', v: `${m[3]}${m[4]}`.toUpperCase(), sheet: m[1] ?? m[2] });
      i += m[0].length;
      continue;
    }
    m = /^\$?[A-Za-z]{1,3}\$?\d+(?![\w.(!])/.exec(rest);
    if (m) {
      const spill = src[i + m[0].length] === '#';
      out.push({ t: 'ref', v: m[0].replace(/\$/g, '').toUpperCase(), spill });
      i += m[0].length + (spill ? 1 : 0);
      continue;
    }
    m = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(rest);
    if (m) {
      const isFn = src[i + m[0].length] === '(';
      out.push(isFn ? { t: 'fn', v: m[0].toUpperCase() } : { t: 'name', v: m[0].toUpperCase() });
      i += m[0].length;
      continue;
    }
    m = /^(<=|>=|<>|[-+*/^&=<>%:])/.exec(rest);
    if (m) {
      out.push({ t: 'op', v: m[0] });
      i += m[0].length;
      continue;
    }
    if (ch === '(') out.push({ t: 'lp' });
    else if (ch === ')') out.push({ t: 'rp' });
    else if (ch === ',') out.push({ t: 'comma' });
    else if (ch === '{') out.push({ t: 'lb' });
    else if (ch === '}') out.push({ t: 'rb' });
    else if (ch === ';') out.push({ t: 'semi' });
    else throw new XlError('#NAME?');
    i++;
  }
  return out;
}

type Node =
  | { k: 'num'; v: number }
  | { k: 'str'; v: string }
  | { k: 'bool'; v: boolean }
  | { k: 'ref'; key: string; sheet?: string; spill?: boolean }
  | { k: 'arr'; rows: Node[][] }
  | { k: 'call'; fn: Node; args: Node[] }
  | { k: 'blank' }
  | { k: 'range'; a: string; b: string; sheet?: string }
  | { k: 'name'; name: string }
  | { k: 'struct'; table?: string; col: string; row: boolean }
  | { k: 'un'; op: string; e: Node }
  | { k: 'pct'; e: Node }
  | { k: 'bin'; op: string; l: Node; r: Node }
  | { k: 'fn'; name: string; args: Node[] };

function parse(tokens: Tok[]): Node {
  let p = 0;
  const peek = () => tokens[p];
  const isOp = (...ops: string[]) => {
    const t = tokens[p];
    return t?.t === 'op' && ops.includes(t.v);
  };

  function cmp(): Node {
    let l = concat();
    while (isOp('=', '<>', '<', '>', '<=', '>=')) {
      const op = (tokens[p++] as { v: string }).v;
      l = { k: 'bin', op, l, r: concat() };
    }
    return l;
  }
  function concat(): Node {
    let l = add();
    while (isOp('&')) {
      p++;
      l = { k: 'bin', op: '&', l, r: add() };
    }
    return l;
  }
  function add(): Node {
    let l = mul();
    while (isOp('+', '-')) {
      const op = (tokens[p++] as { v: string }).v;
      l = { k: 'bin', op, l, r: mul() };
    }
    return l;
  }
  function mul(): Node {
    let l = pow();
    while (isOp('*', '/')) {
      const op = (tokens[p++] as { v: string }).v;
      l = { k: 'bin', op, l, r: pow() };
    }
    return l;
  }
  function pow(): Node {
    let l = unary();
    while (isOp('^')) {
      p++;
      l = { k: 'bin', op: '^', l, r: unary() };
    }
    return l;
  }
  function unary(): Node {
    if (isOp('-', '+')) {
      const op = (tokens[p++] as { v: string }).v;
      return { k: 'un', op, e: unary() };
    }
    return postfix();
  }
  function parseArgs(): Node[] {
    const args: Node[] = [];
    if (tokens[p]?.t === 'rp') {
      p++;
      return args;
    }
    for (;;) {
      if (tokens[p]?.t === 'comma' || tokens[p]?.t === 'rp') args.push({ k: 'blank' });
      else args.push(cmp());
      const n = tokens[p++];
      if (!n) throw new XlError('#NAME?');
      if (n.t === 'comma') continue;
      if (n.t === 'rp') break;
      throw new XlError('#NAME?');
    }
    return args;
  }
  function postfix(): Node {
    let e = primary();
    while (tokens[p]?.t === 'lp' && (e.k === 'fn' || e.k === 'call')) {
      p++;
      e = { k: 'call', fn: e, args: parseArgs() };
    }
    while (isOp('%')) {
      p++;
      e = { k: 'pct', e };
    }
    return e;
  }
  function primary(): Node {
    const t = peek();
    if (!t) throw new XlError('#NAME?');
    p++;
    if (t.t === 'num') return { k: 'num', v: t.v };
    if (t.t === 'str') return { k: 'str', v: t.v };
    if (t.t === 'ref') {
      if (isOp(':')) {
        p++;
        const t2 = tokens[p++];
        if (!t2 || t2.t !== 'ref') throw new XlError('#NAME?');
        return { k: 'range', a: t.v, b: t2.v, sheet: t.sheet };
      }
      return { k: 'ref', key: t.v, sheet: t.sheet, spill: t.spill };
    }
    if (t.t === 'struct') return { k: 'struct', table: t.table, col: t.col, row: t.row };
    if (t.t === 'name') {
      if (t.v === 'TRUE') return { k: 'bool', v: true };
      if (t.v === 'FALSE') return { k: 'bool', v: false };
      return { k: 'name', name: t.v };
    }
    if (t.t === 'fn') {
      if (tokens[p]?.t !== 'lp') throw new XlError('#NAME?');
      p++;
      const args: Node[] = [];
      if (tokens[p]?.t === 'rp') {
        p++;
        return { k: 'fn', name: t.v, args };
      }
      for (;;) {
        if (tokens[p]?.t === 'comma' || tokens[p]?.t === 'rp') args.push({ k: 'blank' });
        else args.push(cmp());
        const n = tokens[p++];
        if (!n) throw new XlError('#NAME?');
        if (n.t === 'comma') continue;
        if (n.t === 'rp') break;
        throw new XlError('#NAME?');
      }
      return { k: 'fn', name: t.v, args };
    }
    if (t.t === 'lb') {
      const rows: Node[][] = [[]];
      for (;;) {
        rows[rows.length - 1].push(cmp());
        const n = tokens[p++];
        if (!n) throw new XlError('#NAME?');
        if (n.t === 'comma') continue;
        if (n.t === 'semi') {
          rows.push([]);
          continue;
        }
        if (n.t === 'rb') break;
        throw new XlError('#NAME?');
      }
      return { k: 'arr', rows };
    }
    if (t.t === 'lp') {
      const e = cmp();
      if (tokens[p++]?.t !== 'rp') throw new XlError('#NAME?');
      return e;
    }
    throw new XlError('#NAME?');
  }

  const node = cmp();
  if (p < tokens.length) throw new XlError('#NAME?');
  return node;
}

// --- evaluation -------------------------------------------------------------

export type Evaluator = {
  /** The rectangle a dynamic-array formula spills into, for its anchor cell or any cell inside it. */
  spillOf(key: string): Rect | null;
  /** Every cell that currently holds a spilled value (not an anchor). */
  spillMembers(): string[];
  /** Evaluates a formula (starting with =) as if typed into a cell, for conditional-format rules. */
  evalFormula(formula: string): Scalar;
  value(key: string): Scalar;
  display(key: string): string;
};

function toNum(v: Val): number {
  if (isRange(v) || isLambda(v)) throw new XlError('#VALUE!');
  if (v instanceof XlError) throw v;
  if (v === null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const lit = literal(v);
  if (typeof lit === 'number') return lit;
  throw new XlError('#VALUE!');
}

function toStr(v: Val): string {
  if (isRange(v) || isLambda(v)) throw new XlError('#VALUE!');
  if (v instanceof XlError) throw v;
  if (v === null) return '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return fmtGeneral(v);
  return v;
}

function toBool(v: Val): boolean {
  if (isRange(v) || isLambda(v)) throw new XlError('#VALUE!');
  if (v instanceof XlError) throw v;
  if (v === null) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const u = v.toUpperCase();
  if (u === 'TRUE') return true;
  if (u === 'FALSE') return false;
  throw new XlError('#VALUE!');
}

function typeRank(v: Scalar): number {
  if (v === null) return 0;
  if (typeof v === 'number') return 1;
  if (typeof v === 'string') return 2;
  return 3;
}

function compare(a: Scalar, b: Scalar): number {
  if (a instanceof XlError) throw a;
  if (b instanceof XlError) throw b;
  // Empty cells compare like 0 or "" depending on the other side.
  if (a === null) a = typeof b === 'string' ? '' : typeof b === 'boolean' ? false : 0;
  if (b === null) b = typeof a === 'string' ? '' : typeof a === 'boolean' ? false : 0;
  const ra = typeRank(a);
  const rb = typeRank(b);
  if (ra !== rb) return ra < rb ? -1 : 1;
  if (typeof a === 'string' && typeof b === 'string') {
    const x = a.toLowerCase();
    const y = b.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
  }
  const x = Number(a);
  const y = Number(b);
  return x < y ? -1 : x > y ? 1 : 0;
}

function roundHalfAway(n: number, d: number, mode: 'round' | 'up' | 'down'): number {
  const f = 10 ** d;
  const abs = Math.abs(n) * f;
  const eps = abs * 1e-12;
  let r: number;
  if (mode === 'round') r = Math.round(abs + eps);
  else if (mode === 'up') r = Math.ceil(abs - eps);
  else r = Math.floor(abs + eps);
  return (Math.sign(n) * r) / f;
}

// Excel-style criteria for SUMIF / COUNTIF: ">5", "<>x", "=3", "ap*".
function matcher(crit: Scalar): (v: Scalar) => boolean {
  if (crit instanceof XlError) throw crit;
  if (typeof crit === 'number' || typeof crit === 'boolean') {
    return (v) => v !== null && !(v instanceof XlError) && compare(v, crit) === 0;
  }
  const text = crit === null ? '' : crit;
  const m = /^(<=|>=|<>|<|>|=)?(.*)$/s.exec(text);
  const op = m?.[1] ?? '=';
  const rhsRaw = m?.[2] ?? '';
  const rhs = literal(rhsRaw);
  return (v) => {
    if (v instanceof XlError) return false;
    if (typeof rhs === 'number') {
      if (typeof v !== 'number') return op === '<>';
      const c = v - rhs;
      return op === '=' ? c === 0 : op === '<>' ? c !== 0 : op === '<' ? c < 0 : op === '>' ? c > 0 : op === '<=' ? c <= 0 : c >= 0;
    }
    const s = (v === null ? '' : String(v)).toLowerCase();
    const pat = rhsRaw.toLowerCase();
    if (/[*?]/.test(pat)) {
      const re = new RegExp(`^${pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
      const hit = re.test(s);
      return op === '<>' ? !hit : hit;
    }
    if (op === '=') return s === pat;
    if (op === '<>') return s !== pat;
    return false;
  };
}

// Formats a number with an Excel-style pattern ("0.00", "#,##0", "$#,##0.00", "0%", "00000").
function formatNumberPattern(v: number, pattern: string): string {
  const m = /^([^#0,.%]*)([#0,.]+)(%?)(.*)$/.exec(pattern);
  if (!m) return pattern;
  const [, prefix, core, pct, suffix] = m;
  const [intPart, decPart = ''] = core.split('.');
  const decimals = decPart.replace(/,/g, '').length;
  const minInt = (intPart.match(/0/g) ?? []).length;
  const grouped = intPart.includes(',');
  const n = pct ? v * 100 : v;
  const fixed = Math.abs(n).toFixed(decimals);
  let [i, d = ''] = fixed.split('.');
  i = i.padStart(minInt, '0');
  if (minInt === 0 && i === '0' && decimals > 0) i = '';
  if (grouped) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${n < 0 ? '-' : ''}${prefix}${i}${d ? `.${d}` : ''}${pct}${suffix}`;
}

function textFormat(v: Scalar, pattern: string): string {
  if (typeof v !== 'number') return toStr(v);
  if (/[ymdhs]/i.test(pattern.replace(/"[^"]*"/g, ''))) return formatDate(v, pattern);
  return formatNumberPattern(v, pattern);
}

function isWeekend(serial: number) {
  const wd = serialToParts(serial).wd;
  return wd === 0 || wd === 6;
}

function addMonths(serial: number, months: number) {
  const { y, m, d } = serialToParts(serial);
  const t = y * 12 + (m - 1) + months;
  const ny = Math.floor(t / 12);
  const nm = (t % 12) + 1;
  return { y: ny, m: nm, d: Math.min(d, daysInMonth(ny, nm)) };
}

function dateDif(a: number, b: number, unit: string): number {
  if (a > b) throw new XlError('#NUM!');
  const s1 = serialToParts(a);
  const e1 = serialToParts(b);
  const months = (e1.y - s1.y) * 12 + (e1.m - s1.m) - (e1.d < s1.d ? 1 : 0);
  switch (unit) {
    case 'D':
      return Math.floor(b) - Math.floor(a);
    case 'M':
      return months;
    case 'Y':
      return Math.floor(months / 12);
    case 'YM':
      return months % 12;
    case 'YD': {
      const clamp = (y: number) => dateToSerial(y, s1.m, Math.min(s1.d, daysInMonth(y, s1.m)));
      let start = clamp(e1.y);
      if (start > b) start = clamp(e1.y - 1);
      return Math.floor(b) - start;
    }
    case 'MD': {
      // Excel's own "MD" is unreliable near month ends; this is the sane reading.
      if (e1.d >= s1.d) return e1.d - s1.d;
      const pm = e1.m === 1 ? 12 : e1.m - 1;
      const py = e1.m === 1 ? e1.y - 1 : e1.y;
      return e1.d + daysInMonth(py, pm) - s1.d;
    }
    default:
      throw new XlError('#NUM!');
  }
}

// --- arrays, lambdas, text and regex helpers ---------------------------------------------

const mkArr = (rows: number, cols: number, vals: Scalar[]): RangeVal => ({ range: true, vals, rows, cols });
const asArr = (v: Val): RangeVal => {
  if (isLambda(v)) throw new XlError('#VALUE!');
  return isRange(v) ? v : mkArr(1, 1, [v]);
};
const atRC = (a: RangeVal, r: number, c: number): Scalar => a.vals[r * a.cols + c];
const fromRows = (rows: Scalar[][]): RangeVal => mkArr(rows.length, rows[0]?.length ?? 0, rows.flat());
const rowsOf = (a: RangeVal): Scalar[][] => Array.from({ length: a.rows }, (_, r) => a.vals.slice(r * a.cols, (r + 1) * a.cols));
const transposeArr = (a: RangeVal): RangeVal => fromRows(Array.from({ length: a.cols }, (_, c) => Array.from({ length: a.rows }, (_, r) => atRC(a, r, c))));
const errOf = (e: unknown): XlError => (e instanceof XlError ? e : new XlError('#VALUE!'));
const toInt = (v: Val | undefined, d: number): number => (v === undefined || v === null ? d : Math.trunc(toNum(v)));

/** Applies an operator to two scalars (used by elementwise array maths). */
function binScalar(op: string, l: Scalar, r: Scalar): Scalar {
  if (op === '&') return toStr(l) + toStr(r);
  if (['=', '<>', '<', '>', '<=', '>='].includes(op)) {
    const c = compare(l, r);
    return op === '=' ? c === 0 : op === '<>' ? c !== 0 : op === '<' ? c < 0 : op === '>' ? c > 0 : op === '<=' ? c <= 0 : c >= 0;
  }
  const a = toNum(l);
  const b = toNum(r);
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) throw new XlError('#DIV/0!');
      return a / b;
    default: {
      const v = a ** b;
      if (!Number.isFinite(v)) throw new XlError('#NUM!');
      return v;
    }
  }
}

/** Elementwise operation with Excel's broadcasting (a single row or column stretches to fit). */
function broadcast2(a: Val, b: Val, fn: (x: Scalar, y: Scalar) => Scalar): Val {
  if (!isRange(a) && !isRange(b)) return fn(a as Scalar, b as Scalar);
  const A = asArr(a);
  const B = asArr(b);
  const dim = (x: number, y: number) => (x === 1 ? y : y === 1 ? x : Math.max(x, y));
  const rows = dim(A.rows, B.rows);
  const cols = dim(A.cols, B.cols);
  const vals: Scalar[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ra = A.rows === 1 ? 0 : r;
      const ca = A.cols === 1 ? 0 : c;
      const rb = B.rows === 1 ? 0 : r;
      const cb = B.cols === 1 ? 0 : c;
      if (ra >= A.rows || ca >= A.cols || rb >= B.rows || cb >= B.cols) {
        vals.push(new XlError('#N/A'));
        continue;
      }
      try {
        vals.push(fn(atRC(A, ra, ca), atRC(B, rb, cb)));
      } catch (e) {
        vals.push(errOf(e));
      }
    }
  }
  return mkArr(rows, cols, vals);
}

function mapScalars(a: Val, fn: (x: Scalar) => Scalar): Val {
  if (!isRange(a)) return fn(a as Scalar);
  return mkArr(a.rows, a.cols, a.vals.map((x) => {
    try {
      return fn(x);
    } catch (e) {
      return errOf(e);
    }
  }));
}

/** Runs a scalar function over array arguments, element by element. */
function liftOver(args: Val[], apply: (a: Val[]) => Val): Val {
  const arrays = args.filter(isRange) as RangeVal[];
  const rows = Math.max(...arrays.map((a) => a.rows));
  const cols = Math.max(...arrays.map((a) => a.cols));
  const vals: Scalar[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let na = false;
      const one = args.map((a) => {
        if (!isRange(a)) return a;
        const rr = a.rows === 1 ? 0 : r;
        const cc = a.cols === 1 ? 0 : c;
        if (rr >= a.rows || cc >= a.cols) {
          na = true;
          return null;
        }
        return atRC(a, rr, cc);
      });
      if (na) {
        vals.push(new XlError('#N/A'));
        continue;
      }
      try {
        const v = apply(one);
        vals.push(isRange(v) || isLambda(v) ? new XlError('#VALUE!') : v);
      } catch (e) {
        vals.push(errOf(e));
      }
    }
  }
  return mkArr(rows, cols, vals);
}

/** Scalar functions that automatically work on whole arrays. */
const LIFT = new Set([
  'ABS', 'INT', 'SQRT', 'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'MOD', 'POWER', 'UPPER', 'LOWER', 'PROPER', 'TRIM', 'LEN', 'LEFT', 'RIGHT', 'MID', 'TEXT',
  'VALUE', 'NOT', 'ISNUMBER', 'ISTEXT', 'ISBLANK', 'EXACT', 'SUBSTITUTE', 'FIND', 'SEARCH', 'YEAR', 'MONTH', 'DAY', 'WEEKDAY', 'DATE', 'EDATE',
  'EOMONTH', 'CEILING', 'FLOOR', 'MROUND', 'TRUNC', 'REPT', 'DAYS', 'TEXTBEFORE', 'TEXTAFTER', 'REGEXTEST', 'REGEXREPLACE', 'ISNA', 'CLEAN',
]);

/** Function names that can be passed as a lambda (for example BYROW(A1:C5, SUM)). */
const BUILTIN_LAMBDAS = new Set(['SUM', 'AVERAGE', 'MAX', 'MIN', 'COUNT', 'COUNTA', 'PRODUCT', 'MEDIAN', 'STDEV.S', 'STDEV.P', 'LEN', 'UPPER', 'LOWER', 'PROPER', 'TRIM', 'ABS', 'SQRT', 'ROUND']);

const sortRank = (v: Scalar): number => (v === null || v === '' ? 4 : typeof v === 'number' ? 0 : typeof v === 'string' ? 1 : typeof v === 'boolean' ? 2 : 3);
function cmpSortable(a: Scalar, b: Scalar): number {
  const ra = sortRank(a);
  const rb = sortRank(b);
  if (ra !== rb) return ra - rb;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'string' && typeof b === 'string') return a.toLowerCase().localeCompare(b.toLowerCase());
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return 0;
}
const keyOfScalar = (v: Scalar) => `${typeof v}:${v instanceof XlError ? v.code : String(v ?? '').toLowerCase()}`;
const truthy = (v: Scalar): boolean => {
  if (v instanceof XlError) throw v;
  return toBool(v);
};

type Invoke = (f: Lambda, a: Val[]) => Val;

const splitTexts = (text: string, delims: string[], ci: boolean): string[] => {
  const real = delims.filter((d) => d !== '');
  if (!real.length) return [text];
  const esc = real.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return text.split(new RegExp(esc, ci ? 'i' : ''));
};

function textBeforeAfter(name: string, args: Val[]): Val {
  const text = toStr(args[0]);
  const delim = toStr(args[1]);
  const inst = toInt(args[2], 1);
  const ci = toInt(args[3], 0) === 1;
  const matchEnd = toInt(args[4], 0) === 1;
  const notFound = args[5];
  const hay = ci ? text.toLowerCase() : text;
  const needle = ci ? delim.toLowerCase() : delim;
  const fail = (): Val => (notFound !== undefined && notFound !== null ? (notFound as Val) : new XlError('#N/A'));
  if (needle === '' || inst === 0) return fail();
  const positions: number[] = [];
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + needle.length)) positions.push(i);
  let idx: number;
  if (inst > 0) idx = positions[inst - 1] ?? -1;
  else idx = positions[positions.length + inst] ?? -1;
  if (idx < 0) {
    if (matchEnd && Math.abs(inst) === positions.length + 1) idx = inst > 0 ? text.length : 0;
    else return fail();
  }
  const end = idx + (positions.includes(idx) ? needle.length : 0);
  return name === 'TEXTBEFORE' ? text.slice(0, idx) : text.slice(end);
}

function makeRegex(pattern: string, ci: boolean, flags = ''): RegExp {
  try {
    return new RegExp(pattern, flags + (ci ? 'i' : ''));
  } catch {
    throw new XlError('#VALUE!');
  }
}

function xmatchOne(look: Scalar, from: RangeVal, mode: number, search: number): number | null {
  const idxs = from.vals.map((_, i) => i);
  if (search < 0) idxs.reverse();
  const live = (v: Scalar) => v !== null && !(v instanceof XlError);
  if (mode === 2) {
    const m = matcher(look);
    const hit = idxs.find((i) => m(from.vals[i]));
    return hit === undefined ? null : hit;
  }
  let hit = idxs.find((i) => live(from.vals[i]) && compare(from.vals[i], look) === 0);
  if (hit === undefined && (mode === -1 || mode === 1)) {
    let best = -1;
    for (const i of idxs) {
      const v = from.vals[i];
      if (!live(v)) continue;
      const c = compare(v, look);
      if (mode === -1 && c < 0 && (best < 0 || compare(v, from.vals[best]) > 0)) best = i;
      if (mode === 1 && c > 0 && (best < 0 || compare(v, from.vals[best]) < 0)) best = i;
    }
    if (best >= 0) hit = best;
  }
  return hit === undefined ? null : hit;
}

/** Dynamic-array and higher-order functions. Returns undefined when `name` is not one of them. */
function arrayFn(name: string, args: Val[], invoke: Invoke): Val | undefined {
  switch (name) {
    case 'SEQUENCE': {
      const rows = toInt(args[0], 1);
      const cols = toInt(args[1], 1);
      const start = args[2] === undefined || args[2] === null ? 1 : toNum(args[2]);
      const step = args[3] === undefined || args[3] === null ? 1 : toNum(args[3]);
      if (rows < 1 || cols < 1 || rows * cols > 20000) throw new XlError('#CALC!');
      return mkArr(rows, cols, Array.from({ length: rows * cols }, (_, i) => start + step * i));
    }
    case 'RANDARRAY': {
      const rows = toInt(args[0], 1);
      const cols = toInt(args[1], 1);
      const lo = args[2] === undefined || args[2] === null ? 0 : toNum(args[2]);
      const hi = args[3] === undefined || args[3] === null ? 1 : toNum(args[3]);
      const whole = args[4] !== undefined && args[4] !== null && toBool(args[4]);
      if (rows < 1 || cols < 1 || rows * cols > 20000) throw new XlError('#CALC!');
      return mkArr(rows, cols, Array.from({ length: rows * cols }, () => (whole ? Math.floor(lo + Math.random() * (hi - lo + 1)) : lo + Math.random() * (hi - lo))));
    }
    case 'ROWS':
      return asArr(args[0]).rows;
    case 'COLUMNS':
      return asArr(args[0]).cols;
    case 'TRANSPOSE':
      return transposeArr(asArr(args[0]));
    case 'FILTER': {
      const A = asArr(args[0]);
      const I = asArr(args[1]);
      let out: Scalar[][];
      if (I.cols === 1 && I.rows === A.rows) out = rowsOf(A).filter((_, r) => truthy(I.vals[r]));
      else if (I.rows === 1 && I.cols === A.cols) out = rowsOf(transposeArr(A)).filter((_, c) => truthy(I.vals[c]));
      else throw new XlError('#VALUE!');
      if (!out.length) {
        if (args[2] !== undefined && args[2] !== null) return args[2];
        throw new XlError('#CALC!');
      }
      const res = fromRows(out);
      return I.rows === 1 && I.cols !== 1 ? transposeArr(res) : res;
    }
    case 'SORT': {
      let A = asArr(args[0]);
      const idx = toInt(args[1], 1);
      const order = toInt(args[2], 1) === -1 ? -1 : 1;
      const byCol = args[3] !== undefined && args[3] !== null && toBool(args[3]);
      if (byCol) A = transposeArr(A);
      if (idx < 1 || idx > A.cols) throw new XlError('#VALUE!');
      const rows = rowsOf(A).map((row, i) => ({ row, i }));
      rows.sort((x, y) => {
        const a = x.row[idx - 1];
        const b = y.row[idx - 1];
        const ra = sortRank(a);
        const rb = sortRank(b);
        if (ra === 4 || rb === 4) return ra === rb ? x.i - y.i : ra === 4 ? 1 : -1;
        const c = cmpSortable(a, b) * order;
        return c !== 0 ? c : x.i - y.i;
      });
      const out = fromRows(rows.map((x) => x.row));
      return byCol ? transposeArr(out) : out;
    }
    case 'SORTBY': {
      const A = asArr(args[0]);
      const keys: { by: RangeVal; order: number }[] = [];
      for (let i = 1; i < args.length; i += 2) {
        const by = asArr(args[i]);
        if (by.vals.length !== A.rows && by.vals.length !== A.cols) throw new XlError('#VALUE!');
        keys.push({ by, order: toInt(args[i + 1], 1) === -1 ? -1 : 1 });
      }
      if (!keys.length) throw new XlError('#VALUE!');
      const horizontal = keys[0].by.rows === 1 && A.cols === keys[0].by.cols && A.rows !== A.cols;
      const base = horizontal ? transposeArr(A) : A;
      const idxs = Array.from({ length: base.rows }, (_, i) => i);
      idxs.sort((x, y) => {
        for (const k of keys) {
          const a = k.by.vals[x];
          const b = k.by.vals[y];
          const ra = sortRank(a);
          const rb = sortRank(b);
          if (ra === 4 || rb === 4) {
            if (ra !== rb) return ra === 4 ? 1 : -1;
            continue;
          }
          const c = cmpSortable(a, b) * k.order;
          if (c !== 0) return c;
        }
        return x - y;
      });
      const out = fromRows(idxs.map((i) => rowsOf(base)[i]));
      return horizontal ? transposeArr(out) : out;
    }
    case 'UNIQUE': {
      let A = asArr(args[0]);
      const byCol = args[1] !== undefined && args[1] !== null && toBool(args[1]);
      const once = args[2] !== undefined && args[2] !== null && toBool(args[2]);
      if (byCol) A = transposeArr(A);
      const counts = new Map<string, number>();
      const first = new Map<string, Scalar[]>();
      for (const row of rowsOf(A)) {
        const k = row.map(keyOfScalar).join('\u0001');
        counts.set(k, (counts.get(k) ?? 0) + 1);
        if (!first.has(k)) first.set(k, row);
      }
      const out = [...first.entries()].filter(([k]) => !once || counts.get(k) === 1).map(([, row]) => row);
      if (!out.length) throw new XlError('#CALC!');
      const res = fromRows(out);
      return byCol ? transposeArr(res) : res;
    }
    case 'TAKE':
    case 'DROP': {
      const A = asArr(args[0]);
      const take = name === 'TAKE';
      const range = (n: number, len: number): [number, number] => (take ? (n >= 0 ? [0, Math.min(n, len)] : [Math.max(0, len + n), len]) : n >= 0 ? [Math.min(n, len), len] : [0, Math.max(0, len + n)]);
      const [r1, r2] = args[1] === undefined || args[1] === null ? [0, A.rows] : range(toInt(args[1], 0), A.rows);
      const [c1, c2] = args[2] === undefined || args[2] === null ? [0, A.cols] : range(toInt(args[2], 0), A.cols);
      if (r2 <= r1 || c2 <= c1) throw new XlError('#CALC!');
      return fromRows(rowsOf(A).slice(r1, r2).map((row) => row.slice(c1, c2)));
    }
    case 'CHOOSECOLS':
    case 'CHOOSEROWS': {
      const A = name === 'CHOOSECOLS' ? asArr(args[0]) : transposeArr(asArr(args[0]));
      const picks = args.slice(1).flatMap((a) => (isRange(a) ? a.vals.map((v) => toInt(v, 0)) : [toInt(a, 0)]));
      const out = rowsOf(A).map((row) =>
        picks.map((p) => {
          const i = p > 0 ? p - 1 : A.cols + p;
          if (p === 0 || i < 0 || i >= A.cols) throw new XlError('#VALUE!');
          return row[i];
        }),
      );
      const res = fromRows(out);
      return name === 'CHOOSECOLS' ? res : transposeArr(res);
    }
    case 'HSTACK':
    case 'VSTACK': {
      const parts = args.map(asArr);
      if (name === 'HSTACK') {
        const rows = Math.max(...parts.map((p) => p.rows));
        return fromRows(Array.from({ length: rows }, (_, r) => parts.flatMap((p) => Array.from({ length: p.cols }, (_, c) => (r < p.rows ? atRC(p, r, c) : new XlError('#N/A'))))));
      }
      const cols = Math.max(...parts.map((p) => p.cols));
      return fromRows(parts.flatMap((p) => rowsOf(p).map((row) => Array.from({ length: cols }, (_, c) => (c < row.length ? row[c] : new XlError('#N/A'))))));
    }
    case 'TOCOL':
    case 'TOROW': {
      const A = asArr(args[0]);
      const ignore = toInt(args[1], 0);
      const byCol = args[2] !== undefined && args[2] !== null && toBool(args[2]);
      let vals = byCol ? transposeArr(A).vals : A.vals;
      vals = vals.filter((v) => !((ignore === 1 || ignore === 3) && (v === null || v === '')) && !((ignore === 2 || ignore === 3) && v instanceof XlError));
      if (!vals.length) throw new XlError('#CALC!');
      return name === 'TOCOL' ? mkArr(vals.length, 1, vals) : mkArr(1, vals.length, vals);
    }
    case 'WRAPROWS':
    case 'WRAPCOLS': {
      const A = asArr(args[0]);
      const n = toInt(args[1], 0);
      if (n < 1) throw new XlError('#NUM!');
      const pad = args[2] === undefined || args[2] === null ? new XlError('#N/A') : (args[2] as Scalar);
      const vals = [...A.vals];
      while (vals.length % n) vals.push(pad);
      const chunks: Scalar[][] = [];
      for (let i = 0; i < vals.length; i += n) chunks.push(vals.slice(i, i + n));
      const res = fromRows(chunks);
      return name === 'WRAPROWS' ? res : transposeArr(res);
    }
    case 'SUMPRODUCT': {
      const arrs = args.map(asArr);
      const size = arrs[0].vals.length;
      if (arrs.some((a) => a.rows !== arrs[0].rows || a.cols !== arrs[0].cols)) throw new XlError('#VALUE!');
      let total = 0;
      for (let i = 0; i < size; i++) {
        let p = 1;
        for (const a of arrs) {
          const v = a.vals[i];
          if (v instanceof XlError) throw v;
          p *= typeof v === 'number' ? v : 0;
        }
        total += p;
      }
      return total;
    }
    case 'XMATCH': {
      const from = asArr(args[1]);
      const mode = toInt(args[2], 0);
      const search = toInt(args[3], 1);
      const one = (look: Scalar): Scalar => {
        const i = xmatchOne(look, from, mode, search);
        return i === null ? new XlError('#N/A') : i + 1;
      };
      if (isRange(args[0])) return mapScalars(args[0], one);
      const v = one(args[0] as Scalar);
      if (v instanceof XlError) throw v;
      return v;
    }
    case 'XLOOKUP': {
      if (args.length < 3 || args.length > 6) throw new XlError('#VALUE!');
      const from = asArr(args[1]);
      const ret = asArr(args[2]);
      const mode = toInt(args[4], 0);
      const search = toInt(args[5], 1);
      const vertical = from.cols === 1;
      if ((vertical && ret.rows !== from.rows) || (!vertical && from.rows === 1 && ret.cols !== from.cols) || (!vertical && from.rows !== 1)) throw new XlError('#VALUE!');
      const pick = (i: number): Val => (vertical ? (ret.cols === 1 ? ret.vals[i] : mkArr(1, ret.cols, ret.vals.slice(i * ret.cols, (i + 1) * ret.cols))) : ret.rows === 1 ? ret.vals[i] : mkArr(ret.rows, 1, Array.from({ length: ret.rows }, (_, r) => atRC(ret, r, i))));
      const one = (look: Scalar): Val => {
        const i = xmatchOne(look, from, mode, search);
        if (i !== null) return pick(i);
        if (args[3] !== undefined && args[3] !== null) return args[3];
        throw new XlError('#N/A');
      };
      if (!isRange(args[0])) return one(args[0] as Scalar);
      const looks = args[0];
      const results = looks.vals.map((l) => {
        try {
          return one(l);
        } catch (e) {
          return errOf(e);
        }
      });
      if (results.every((r) => !isRange(r))) return mkArr(looks.rows, looks.cols, results as Scalar[]);
      return fromRows(results.flatMap((r) => (isRange(r) ? rowsOf(r) : [[r as Scalar]])));
    }
    case 'MAP': {
      const f = args[args.length - 1];
      if (!isLambda(f) || args.length < 2) throw new XlError('#VALUE!');
      const arrs = args.slice(0, -1).map(asArr);
      const rows = arrs[0].rows;
      const cols = arrs[0].cols;
      if (arrs.some((a) => a.rows !== rows || a.cols !== cols)) throw new XlError('#VALUE!');
      return mkArr(rows, cols, arrs[0].vals.map((_, i) => {
        try {
          const v = invoke(f, arrs.map((a) => a.vals[i]));
          return isRange(v) || isLambda(v) ? new XlError('#CALC!') : v;
        } catch (e) {
          return errOf(e);
        }
      }));
    }
    case 'REDUCE':
    case 'SCAN': {
      const f = args[args.length - 1];
      if (!isLambda(f)) throw new XlError('#VALUE!');
      const hasInit = args.length === 3;
      const A = asArr(args[hasInit ? 1 : 0]);
      let acc: Val = hasInit ? args[0] : (A.vals[0] ?? null);
      const out: Scalar[] = [];
      A.vals.forEach((v, i) => {
        if (!hasInit && i === 0) {
          out.push(acc as Scalar);
          return;
        }
        acc = invoke(f, [acc, v]);
        out.push(isRange(acc) || isLambda(acc) ? new XlError('#CALC!') : acc);
      });
      return name === 'REDUCE' ? acc : mkArr(A.rows, A.cols, out);
    }
    case 'BYROW':
    case 'BYCOL': {
      const f = args[1];
      if (!isLambda(f)) throw new XlError('#VALUE!');
      const A = asArr(args[0]);
      const rowWise = name === 'BYROW';
      const n = rowWise ? A.rows : A.cols;
      const vals: Scalar[] = Array.from({ length: n }, (_, i) => {
        const slice = rowWise ? mkArr(1, A.cols, A.vals.slice(i * A.cols, (i + 1) * A.cols)) : mkArr(A.rows, 1, Array.from({ length: A.rows }, (_, r) => atRC(A, r, i)));
        try {
          const v = invoke(f, [slice]);
          return isRange(v) || isLambda(v) ? new XlError('#CALC!') : v;
        } catch (e) {
          return errOf(e);
        }
      });
      return rowWise ? mkArr(n, 1, vals) : mkArr(1, n, vals);
    }
    case 'MAKEARRAY': {
      const rows = toInt(args[0], 0);
      const cols = toInt(args[1], 0);
      const f = args[2];
      if (!isLambda(f) || rows < 1 || cols < 1 || rows * cols > 20000) throw new XlError('#VALUE!');
      const vals: Scalar[] = [];
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          try {
            const v = invoke(f, [r, c]);
            vals.push(isRange(v) || isLambda(v) ? new XlError('#CALC!') : v);
          } catch (e) {
            vals.push(errOf(e));
          }
        }
      }
      return mkArr(rows, cols, vals);
    }
    case 'TEXTSPLIT': {
      const text = toStr(args[0]);
      const colD = (args[1] === undefined || args[1] === null ? [''] : isRange(args[1]) ? args[1].vals.map(toStr) : [toStr(args[1])]) as string[];
      const rowD = (args[2] === undefined || args[2] === null ? [] : isRange(args[2]) ? args[2].vals.map(toStr) : [toStr(args[2])]) as string[];
      const ignore = args[3] !== undefined && args[3] !== null && toBool(args[3]);
      const ci = toInt(args[4], 0) === 1;
      const pad: Scalar = args[5] === undefined || args[5] === null ? new XlError('#N/A') : (args[5] as Scalar);
      const rowParts = rowD.length ? splitTexts(text, rowD, ci) : [text];
      const grid = rowParts.map((rp) => {
        let parts = colD.some((d) => d !== '') ? splitTexts(rp, colD, ci) : [rp];
        if (ignore) parts = parts.filter((p) => p !== '');
        return parts as Scalar[];
      });
      const width = Math.max(...grid.map((g) => g.length));
      return fromRows(grid.map((g) => [...g, ...Array.from({ length: width - g.length }, () => pad)]));
    }
    case 'TEXTBEFORE':
    case 'TEXTAFTER':
      return textBeforeAfter(name, args);
    case 'REGEXTEST': {
      const re = makeRegex(toStr(args[1]), toInt(args[2], 0) === 1);
      return re.test(toStr(args[0]));
    }
    case 'REGEXEXTRACT': {
      const mode = toInt(args[2], 0);
      const ci = toInt(args[3], 0) === 1;
      const pattern = toStr(args[1]);
      const one = (t: Scalar): Val => {
        const text = toStr(t);
        if (mode === 1) {
          const all = [...text.matchAll(makeRegex(pattern, ci, 'g'))].map((m) => m[0]);
          if (!all.length) throw new XlError('#N/A');
          return mkArr(all.length, 1, all);
        }
        const m = makeRegex(pattern, ci).exec(text);
        if (!m) throw new XlError('#N/A');
        if (mode === 2) {
          const groups = m.slice(1).map((g) => g ?? '');
          if (!groups.length) throw new XlError('#N/A');
          return mkArr(1, groups.length, groups);
        }
        return m[0];
      };
      if (isRange(args[0]) && mode === 0) return mapScalars(args[0], (t) => one(t) as Scalar);
      return one(args[0] as Scalar);
    }
    case 'REGEXREPLACE': {
      const text = toStr(args[0]);
      const occ = toInt(args[3], 0);
      const ci = toInt(args[4], 0) === 1;
      const repl = toStr(args[2]);
      const pattern = toStr(args[1]);
      if (occ === 0) return text.replace(makeRegex(pattern, ci, 'g'), repl);
      const matches = [...text.matchAll(makeRegex(pattern, ci, 'g'))];
      const m = occ > 0 ? matches[occ - 1] : matches[matches.length + occ];
      if (!m || m.index === undefined) return text;
      const piece = m[0].replace(makeRegex(pattern, ci), repl);
      return text.slice(0, m.index) + piece + text.slice(m.index + m[0].length);
    }
    default:
      return undefined;
  }
}

export function buildEvaluator(data: SheetData): Evaluator {
  const memo = new Map<string, Scalar>();
  const stack = new Set<string>();
  const cache = new Map<string, Node | XlError>();

  let env: Env = {};
  let curKey = '';
  let primed = false;
  let priming = false;
  const spills = new Map<string, Scalar>();
  let prevSpills = new Map<string, Scalar>();
  const spillRects = new Map<string, Rect>();
  let prevRects = new Map<string, Rect>();
  const memberOf = new Map<string, string>();

  function settleArray(key: string, v: RangeVal): Scalar {
    const first = v.vals[0] === null || v.vals[0] === undefined ? 0 : v.vals[0];
    if (v.vals.length <= 1) return first;
    const p = parseKey(key);
    if (!p) return new XlError('#REF!');
    const rc: Rect = { c1: p.c, r1: p.r, c2: p.c + v.cols - 1, r2: p.r + v.rows - 1 };
    if (!inBounds(rc.c2, rc.r2)) return new XlError('#SPILL!');
    for (const t of data.tables ?? []) {
      const tr = parseRectLabel(t.range);
      if (tr && rc.c1 <= tr.c2 && rc.c2 >= tr.c1 && rc.r1 <= tr.r2 && rc.r2 >= tr.r1) return new XlError('#SPILL!');
    }
    for (let r = rc.r1; r <= rc.r2; r++) {
      for (let c = rc.c1; c <= rc.c2; c++) {
        const k = keyOf(c, r);
        if (k === key) continue;
        if ((data.cells[k] ?? '') !== '' || (memberOf.has(k) && memberOf.get(k) !== key)) return new XlError('#SPILL!');
      }
    }
    spillRects.set(key, rc);
    for (let r = 0; r < v.rows; r++) {
      for (let c = 0; c < v.cols; c++) {
        if (r === 0 && c === 0) continue;
        const k = keyOf(rc.c1 + c, rc.r1 + r);
        const x = atRC(v, r, c);
        spills.set(k, x === null ? 0 : x);
        memberOf.set(k, key);
      }
    }
    return first;
  }

  function prime() {
    if (primed || priming) return;
    priming = true;
    const keys = Object.keys(data.cells)
      .filter((k) => (data.cells[k] ?? '').startsWith('=') && (data.cells[k] ?? '').length > 1)
      .sort((a, b) => {
        const pa = parseKey(a);
        const pb = parseKey(b);
        return pa && pb ? pa.r - pb.r || pa.c - pb.c : 0;
      });
    if (keys.some((k) => /[A-Z]\(|#|\{/.test((data.cells[k] ?? '').toUpperCase()))) {
      for (let pass = 0; pass < 5; pass++) {
        prevSpills = new Map(spills);
        prevRects = new Map(spillRects);
        spills.clear();
        spillRects.clear();
        memberOf.clear();
        memo.clear();
        stack.clear();
        for (const k of keys) cellValue(k);
        if (JSON.stringify([...prevSpills]) === JSON.stringify([...spills])) break;
      }
    }
    priming = false;
    primed = true;
  }

  function cellValue(key: string): Scalar {
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    const raw = data.cells[key] ?? '';
    let out: Scalar;
    if (raw.startsWith('=') && raw.length > 1) {
      if (stack.has(key)) {
        out = new XlError('#REF!');
      } else {
        stack.add(key);
        const prevKey = curKey;
        curKey = key;
        try {
          let ast = cache.get(raw);
          if (!ast) {
            try {
              ast = parse(tokenize(raw.slice(1)));
            } catch (e) {
              ast = e instanceof XlError ? e : new XlError('#NAME?');
            }
            cache.set(raw, ast);
          }
          if (ast instanceof XlError) out = ast;
          else {
            const v = evalNode(ast);
            out = isLambda(v) ? new XlError('#CALC!') : isRange(v) ? settleArray(key, v) : v === null ? 0 : v;
          }
        } catch (e) {
          out = e instanceof XlError ? e : new XlError('#VALUE!');
        }
        curKey = prevKey;
        stack.delete(key);
      }
    } else if (raw === '' && (spills.has(key) || prevSpills.has(key))) {
      out = spills.get(key) ?? prevSpills.get(key) ?? null;
    } else {
      out = literal(raw);
    }
    memo.set(key, out);
    return out;
  }

  const extSheet = (name: string): Record<string, string> | null => {
    const hit = Object.keys(data.ext ?? {}).find((k) => k.toLowerCase() === name.toLowerCase());
    return hit ? (data.ext as Record<string, Record<string, string>>)[hit] : null;
  };
  const extValue = (sheet: string, key: string): Scalar => {
    const sh = extSheet(sheet);
    if (!sh) throw new XlError('#REF!');
    const raw = sh[key] ?? '';
    return raw === '' ? null : literal(raw);
  };
  function extRange(sheet: string, aKey: string, bKey: string): RangeVal {
    const a = parseKey(aKey);
    const b = parseKey(bKey);
    if (!a || !b || !extSheet(sheet)) throw new XlError('#REF!');
    const rc = rectOf(a, b);
    const vals: Scalar[] = [];
    for (let r = rc.r1; r <= rc.r2; r++) for (let c = rc.c1; c <= rc.c2; c++) vals.push(extValue(sheet, keyOf(c, r)));
    return { range: true, vals, rows: rc.r2 - rc.r1 + 1, cols: rc.c2 - rc.c1 + 1 };
  }
  // Structured references: Table1[Sales], Table1[@Sales], [@Sales].
  function structInfo(n: { table?: string; col: string }) {
    const here = parseKey(curKey);
    const tbl = n.table
      ? data.tables?.find((t) => t.name.toLowerCase() === n.table?.toLowerCase())
      : data.tables?.find((t) => {
          const rc = parseRectLabel(t.range);
          return !!(rc && here && here.c >= rc.c1 && here.c <= rc.c2 && here.r >= rc.r1 && here.r <= rc.r2);
        });
    const rc = tbl ? parseRectLabel(tbl.range) : null;
    if (!tbl || !rc) throw new XlError('#REF!');
    let col = -1;
    for (let c = rc.c1; c <= rc.c2; c++) {
      const h = data.cells[keyOf(c, rc.r1)] ?? '';
      if (h.toLowerCase().trim() === n.col.toLowerCase()) col = c;
    }
    if (col < 0) throw new XlError('#REF!');
    return { col, r1: rc.r1 + 1, r2: tbl.totals ? rc.r2 - 1 : rc.r2 };
  }
  const nameCache = new Map<string, Node | XlError>();
  const namedFormula = (name: string): string | null => {
    const hit = Object.keys(data.names ?? {}).find((k) => k.toUpperCase() === name.toUpperCase());
    const v = hit ? (data.names as Record<string, string>)[hit] : undefined;
    return v && v.trim().startsWith('=') ? v.trim() : null;
  };
  const evalNamedFormula = (text: string): Val => {
    let ast = nameCache.get(text);
    if (!ast) {
      try {
        ast = parse(tokenize(text.slice(1)));
      } catch (e) {
        ast = errOf(e);
      }
      nameCache.set(text, ast);
    }
    if (ast instanceof XlError) throw ast;
    const saved = env;
    env = {};
    try {
      return evalNode(ast);
    } finally {
      env = saved;
    }
  };
  function invoke(f: Lambda, a: Val[]): Val {
    if ('builtin' in f) return applyFn(f.builtin, a);
    const saved = env;
    env = { ...f.env };
    f.params.forEach((p, i) => {
      env[p.toUpperCase()] = a[i] === undefined ? null : a[i];
    });
    try {
      return evalNode(f.body);
    } finally {
      env = saved;
    }
  }
  function lambdaNamed(name: string): Lambda | null {
    const e = env[name.toUpperCase()];
    if (e !== undefined && isLambda(e)) return e;
    const text = namedFormula(name);
    if (!text) return null;
    const v = evalNamedFormula(text);
    return isLambda(v) ? v : null;
  }
  function spillRange(key: string): Val {
    const rc = spillRects.get(key) ?? prevRects.get(key);
    if (!rc) throw new XlError('#REF!');
    const vals: Scalar[] = [];
    for (let r = rc.r1; r <= rc.r2; r++) for (let c = rc.c1; c <= rc.c2; c++) vals.push(cellValue(keyOf(c, r)));
    return mkArr(rc.r2 - rc.r1 + 1, rc.c2 - rc.c1 + 1, vals);
  }
  const resolveName = (name: string): Node => {
    const hit = Object.keys(data.names ?? {}).find((k) => k.toUpperCase() === name.toUpperCase());
    if (!hit) throw new XlError('#NAME?');
    const [a, b] = ((data.names as Record<string, string>)[hit] ?? '').replace(/\$/g, '').toUpperCase().split(':');
    if (!a) throw new XlError('#NAME?');
    return b ? { k: 'range', a, b } : { k: 'ref', key: a };
  };

  function rangeVal(aKey: string, bKey: string): RangeVal {
    const a = parseKey(aKey);
    const b = parseKey(bKey);
    if (!a || !b || !inBounds(a.c, a.r) || !inBounds(b.c, b.r)) throw new XlError('#REF!');
    const rc = rectOf(a, b);
    const vals: Scalar[] = [];
    for (let r = rc.r1; r <= rc.r2; r++) for (let c = rc.c1; c <= rc.c2; c++) vals.push(cellValue(keyOf(c, r)));
    return { range: true, vals, rows: rc.r2 - rc.r1 + 1, cols: rc.c2 - rc.c1 + 1 };
  }

  const flatNums = (args: Val[]): number[] => {
    const out: number[] = [];
    for (const a of args) {
      if (isRange(a)) {
        for (const v of a.vals) {
          if (v instanceof XlError) throw v;
          if (typeof v === 'number') out.push(v);
        }
      } else {
        out.push(toNum(a));
      }
    }
    return out;
  };

  function evalNode(n: Node): Val {
    switch (n.k) {
      case 'num':
      case 'str':
      case 'bool':
        return n.v;
      case 'ref': {
        if (!n.sheet && !n.spill && env[n.key] !== undefined) return env[n.key];
        if (n.spill) return spillRange(n.key);
        if (n.sheet) return extValue(n.sheet, n.key);
        const p = parseKey(n.key);
        if (!p || !inBounds(p.c, p.r)) throw new XlError('#REF!');
        return cellValue(n.key);
      }
      case 'range':
        return n.sheet ? extRange(n.sheet, n.a, n.b) : rangeVal(n.a, n.b);
      case 'blank':
        return null;
      case 'arr': {
        const rows = n.rows.map((r) => r.map((c) => evalNode(c)));
        const width = Math.max(...rows.map((r) => r.length));
        return mkArr(rows.length, width, rows.flatMap((r) => Array.from({ length: width }, (_, i) => (r[i] === undefined ? new XlError('#N/A') : (r[i] as Scalar)))));
      }
      case 'call': {
        const f = evalNode(n.fn);
        if (!isLambda(f)) throw new XlError('#VALUE!');
        return invoke(f, n.args.map((a) => evalNode(a)));
      }
      case 'name': {
        const up = n.name.toUpperCase();
        if (env[up] !== undefined) return env[up];
        const named = namedFormula(n.name);
        if (named) return evalNamedFormula(named);
        if (BUILTIN_LAMBDAS.has(up) && !Object.keys(data.names ?? {}).some((k) => k.toUpperCase() === up)) return { lambda: true, builtin: up };
        return evalNode(resolveName(n.name));
      }
      case 'struct': {
        const { col, r1, r2 } = structInfo(n);
        if (n.row) {
          const here = parseKey(curKey);
          if (!here || here.r < r1 || here.r > r2) throw new XlError('#VALUE!');
          return cellValue(keyOf(col, here.r));
        }
        const vals: Scalar[] = [];
        for (let r = r1; r <= r2; r++) vals.push(cellValue(keyOf(col, r)));
        return { range: true, vals, rows: r2 - r1 + 1, cols: 1 };
      }
      case 'un':
        return mapScalars(evalNode(n.e), (x) => (n.op === '-' ? -toNum(x) : toNum(x)));
      case 'pct':
        return mapScalars(evalNode(n.e), (x) => toNum(x) / 100);
      case 'bin': {
        const l = evalNode(n.l);
        const r = evalNode(n.r);
        return broadcast2(l, r, (x, y) => binScalar(n.op, x, y));
      }
      case 'fn':
        return callFn(n.name, n.args);
    }
  }

  function callFn(name: string, argNodes: Node[]): Val {
    // Lazy functions: only evaluate the branch that is needed.
    if (name === 'IF') {
      if (argNodes.length < 2 || argNodes.length > 3) throw new XlError('#VALUE!');
      const condV = evalNode(argNodes[0]);
      if (isRange(condV)) {
        const tv = evalNode(argNodes[1]);
        const fv: Val = argNodes[2] && argNodes[2].k !== 'blank' ? evalNode(argNodes[2]) : false;
        const pick = (v: Val, r: number, c: number): Scalar => (isRange(v) ? atRC(v, v.rows === 1 ? 0 : r, v.cols === 1 ? 0 : c) : (v as Scalar));
        return mkArr(condV.rows, condV.cols, condV.vals.map((cv, i) => {
          const r = Math.floor(i / condV.cols);
          const c = i % condV.cols;
          try {
            return toBool(cv) ? pick(tv, r, c) : pick(fv, r, c);
          } catch (e) {
            return errOf(e);
          }
        }));
      }
      const cond = toBool(condV);
      if (cond) return evalNode(argNodes[1]);
      return argNodes[2] ? evalNode(argNodes[2]) : false;
    }
    if (name === 'LET') {
      if (argNodes.length < 3 || argNodes.length % 2 === 0) throw new XlError('#VALUE!');
      const saved = env;
      env = { ...env };
      try {
        for (let i = 0; i < argNodes.length - 1; i += 2) {
          const nm = argNodes[i];
          const id = nm.k === 'name' ? nm.name : nm.k === 'ref' ? nm.key : null;
          if (!id) throw new XlError('#NAME?');
          // Errors are values inside LET, so ISNA(r) or IFERROR(r, ...) can inspect them.
          try {
            env[id.toUpperCase()] = evalNode(argNodes[i + 1]);
          } catch (e) {
            if (e instanceof XlError) env[id.toUpperCase()] = e;
            else throw e;
          }
        }
        return evalNode(argNodes[argNodes.length - 1]);
      } finally {
        env = saved;
      }
    }
    if (name === 'LAMBDA') {
      if (!argNodes.length) throw new XlError('#VALUE!');
      const params = argNodes.slice(0, -1).map((a) => {
        const id = a.k === 'name' ? a.name : a.k === 'ref' ? a.key : null;
        if (!id) throw new XlError('#NAME?');
        return id;
      });
      return { lambda: true, params, body: argNodes[argNodes.length - 1], env: { ...env } };
    }
    if (name === 'ROW' || name === 'COLUMN') {
      const isRow = name === 'ROW';
      const node = argNodes[0];
      if (!node || node.k === 'blank') {
        const here = parseKey(curKey);
        if (!here) throw new XlError('#VALUE!');
        return isRow ? here.r + 1 : here.c + 1;
      }
      if (node.k === 'ref' && !node.sheet) {
        const pp = parseKey(node.key);
        if (!pp) throw new XlError('#REF!');
        return isRow ? pp.r + 1 : pp.c + 1;
      }
      if (node.k === 'range' && !node.sheet) {
        const pa = parseKey(node.a);
        const pb = parseKey(node.b);
        if (!pa || !pb) throw new XlError('#REF!');
        const rc = rectOf(pa, pb);
        const n = isRow ? rc.r2 - rc.r1 + 1 : rc.c2 - rc.c1 + 1;
        const vals = Array.from({ length: n }, (_, i) => (isRow ? rc.r1 : rc.c1) + i + 1);
        return isRow ? mkArr(n, 1, vals) : mkArr(1, n, vals);
      }
      throw new XlError('#VALUE!');
    }
    if (name === 'FORMULATEXT' || name === 'ISFORMULA') {
      const node = argNodes[0];
      if (!node || node.k !== 'ref' || node.sheet) throw new XlError('#VALUE!');
      const raw = data.cells[node.key] ?? '';
      const isF = raw.startsWith('=') && raw.length > 1;
      if (name === 'ISFORMULA') return isF;
      if (!isF) throw new XlError('#N/A');
      return raw;
    }
    if (name === 'INDIRECT') {
      const text = toStr(evalNode(argNodes[0])).trim();
      const m = /^(?:(?:'([^']+)'|([A-Za-z_][\w.]*))!)?(\$?[A-Za-z]{1,3}\$?\d+)(?::(\$?[A-Za-z]{1,3}\$?\d+))?$/.exec(text);
      if (!m) {
        if (namedFormula(text) === null && Object.keys(data.names ?? {}).some((k) => k.toUpperCase() === text.toUpperCase())) return evalNode(resolveName(text));
        throw new XlError('#REF!');
      }
      const sheet = m[1] ?? m[2];
      const a = m[3].replace(/\$/g, '').toUpperCase();
      const b = m[4]?.replace(/\$/g, '').toUpperCase();
      if (sheet) return b ? extRange(sheet, a, b) : extValue(sheet, a);
      if (b) return rangeVal(a, b);
      const pp = parseKey(a);
      if (!pp || !inBounds(pp.c, pp.r)) throw new XlError('#REF!');
      return cellValue(a);
    }
    if (name === 'OFFSET') {
      const node = argNodes[0];
      let rc: Rect | null = null;
      if (node?.k === 'ref' && !node.sheet) {
        const pp = parseKey(node.key);
        if (pp) rc = { c1: pp.c, r1: pp.r, c2: pp.c, r2: pp.r };
      } else if (node?.k === 'range' && !node.sheet) {
        const pa = parseKey(node.a);
        const pb = parseKey(node.b);
        if (pa && pb) rc = rectOf(pa, pb);
      }
      if (!rc) throw new XlError('#VALUE!');
      const dr = toInt(evalNode(argNodes[1]), 0);
      const dc = toInt(evalNode(argNodes[2]), 0);
      const h = argNodes[3] && argNodes[3].k !== 'blank' ? toInt(evalNode(argNodes[3]), 1) : rc.r2 - rc.r1 + 1;
      const w = argNodes[4] && argNodes[4].k !== 'blank' ? toInt(evalNode(argNodes[4]), 1) : rc.c2 - rc.c1 + 1;
      const r1 = rc.r1 + dr;
      const c1 = rc.c1 + dc;
      if (h < 1 || w < 1 || !inBounds(c1, r1) || !inBounds(c1 + w - 1, r1 + h - 1)) throw new XlError('#REF!');
      if (h === 1 && w === 1) return cellValue(keyOf(c1, r1));
      return rangeVal(keyOf(c1, r1), keyOf(c1 + w - 1, r1 + h - 1));
    }
    if (name === 'IFERROR') {
      if (argNodes.length !== 2) throw new XlError('#VALUE!');
      try {
        const v = evalNode(argNodes[0]);
        if (isRange(v)) {
          if (!v.vals.some((x) => x instanceof XlError)) return v;
          const alt = evalNode(argNodes[1]);
          return mkArr(v.rows, v.cols, v.vals.map((x, i) => (x instanceof XlError ? (isRange(alt) ? alt.vals[i % alt.vals.length] : (alt as Scalar)) : x)));
        }
        if (v instanceof XlError) return evalNode(argNodes[1]);
        return v;
      } catch (e) {
        if (e instanceof XlError) return evalNode(argNodes[1]);
        throw e;
      }
    }

    if (name === 'IFNA') {
      if (argNodes.length !== 2) throw new XlError('#VALUE!');
      try {
        const v = evalNode(argNodes[0]);
        if (!isRange(v) && v instanceof XlError && v.code === '#N/A') return evalNode(argNodes[1]);
        return v;
      } catch (e) {
        if (e instanceof XlError && e.code === '#N/A') return evalNode(argNodes[1]);
        throw e;
      }
    }
    if (name === 'IFS') {
      if (argNodes.length < 2 || argNodes.length % 2 !== 0) throw new XlError('#VALUE!');
      for (let i = 0; i < argNodes.length; i += 2) {
        if (toBool(evalNode(argNodes[i]))) return evalNode(argNodes[i + 1]);
      }
      throw new XlError('#N/A');
    }
    if (name === 'SWITCH') {
      if (argNodes.length < 3) throw new XlError('#VALUE!');
      const target = evalNode(argNodes[0]);
      if (isRange(target)) throw new XlError('#VALUE!');
      let i = 1;
      for (; i + 1 < argNodes.length; i += 2) {
        const cand = evalNode(argNodes[i]);
        if (!isRange(cand) && !isLambda(cand) && compare(target as Scalar, cand) === 0) return evalNode(argNodes[i + 1]);
      }
      if (i < argNodes.length) return evalNode(argNodes[i]); // default value
      throw new XlError('#N/A');
    }
    if (name === 'CHOOSE') {
      if (argNodes.length < 2) throw new XlError('#VALUE!');
      const idx = Math.trunc(toNum(evalNode(argNodes[0])));
      if (idx < 1 || idx >= argNodes.length) throw new XlError('#VALUE!');
      return evalNode(argNodes[idx]);
    }
    if (name === 'SUBTOTAL') {
      if (argNodes.length < 2) throw new XlError('#VALUE!');
      const fn = Math.trunc(toNum(evalNode(argNodes[0]))) % 100;
      const hidden = new Set(data.hidden ?? []);
      const vals: Scalar[] = [];
      for (const a of argNodes.slice(1)) {
        if (a.k === 'range' && !a.sheet) {
          const pa = parseKey(a.a);
          const pb = parseKey(a.b);
          if (!pa || !pb) throw new XlError('#REF!');
          const rc = rectOf(pa, pb);
          for (let r = rc.r1; r <= rc.r2; r++) if (!hidden.has(r)) for (let c = rc.c1; c <= rc.c2; c++) vals.push(cellValue(keyOf(c, r)));
        } else if (a.k === 'struct' && !a.row) {
          const { col, r1, r2 } = structInfo(a);
          for (let r = r1; r <= r2; r++) if (!hidden.has(r)) vals.push(cellValue(keyOf(col, r)));
        } else {
          const v = evalNode(a);
          if (isRange(v)) vals.push(...v.vals);
          else vals.push(v as Scalar);
        }
      }
      const nums = vals.filter((v): v is number => typeof v === 'number');
      for (const v of vals) if (v instanceof XlError) throw v;
      const mean = nums.length ? nums.reduce((t, v) => t + v, 0) / nums.length : 0;
      switch (fn) {
        case 1:
          if (!nums.length) throw new XlError('#DIV/0!');
          return mean;
        case 2:
          return nums.length;
        case 3:
          return vals.filter((v) => v !== null).length;
        case 4:
          return nums.length ? Math.max(...nums) : 0;
        case 5:
          return nums.length ? Math.min(...nums) : 0;
        case 6:
          return nums.length ? nums.reduce((t, v) => t * v, 1) : 0;
        case 7:
        case 8:
        case 10:
        case 11: {
          const pop = fn === 8 || fn === 11;
          if (nums.length < (pop ? 1 : 2)) throw new XlError('#DIV/0!');
          const variance = nums.reduce((t, v) => t + (v - mean) ** 2, 0) / (pop ? nums.length : nums.length - 1);
          return fn <= 8 ? Math.sqrt(variance) : variance;
        }
        case 9:
          return nums.reduce((t, v) => t + v, 0);
        default:
          throw new XlError('#VALUE!');
      }
    }
    if (name === 'ISNA') {
      if (argNodes.length !== 1) throw new XlError('#VALUE!');
      try {
        const v = evalNode(argNodes[0]);
        return !isRange(v) && v instanceof XlError && v.code === '#N/A';
      } catch (e) {
        if (e instanceof XlError) return e.code === '#N/A';
        throw e;
      }
    }
    if (name === 'ISERROR') {
      if (argNodes.length !== 1) throw new XlError('#VALUE!');
      try {
        const v = evalNode(argNodes[0]);
        return !isRange(v) && v instanceof XlError;
      } catch (e) {
        if (e instanceof XlError) return true;
        throw e;
      }
    }

    return applyFn(name, argNodes.map((a) => evalNode(a)));
  }

  function applyFn(name: string, args: Val[]): Val {
    // Criteria functions given an array of criteria return one answer per criterion (e.g. SUMIFS(..., UNIQUE(...)#)).
    const critIdx =
      name === 'COUNTIF' || name === 'SUMIF' || name === 'AVERAGEIF'
        ? [1]
        : name === 'COUNTIFS'
          ? args.map((_, i) => i).filter((i) => i % 2 === 1)
          : name === 'SUMIFS' || name === 'AVERAGEIFS' || name === 'MAXIFS' || name === 'MINIFS'
            ? args.map((_, i) => i).filter((i) => i >= 2 && i % 2 === 0)
            : [];
    const arrayCrit = critIdx.find((i) => isRange(args[i]));
    if (arrayCrit !== undefined) return mapScalars(args[arrayCrit], (c) => {
      const v = applyFn(name, args.map((a, i) => (i === arrayCrit ? c : a)));
      return isRange(v) || isLambda(v) ? new XlError('#VALUE!') : v;
    });
    if (LIFT.has(name) && args.some(isRange)) return liftOver(args, (a) => applyFn(name, a));
    const af = arrayFn(name, args, invoke);
    if (af !== undefined) return af;
    const need = (min: number, max = min) => {
      if (args.length < min || args.length > max) throw new XlError('#VALUE!');
    };

    switch (name) {
      case 'SUM':
        return flatNums(args).reduce((s, v) => s + v, 0);
      case 'PRODUCT': {
        const nums = flatNums(args);
        return nums.length ? nums.reduce((s, v) => s * v, 1) : 0;
      }
      case 'AVERAGE': {
        const nums = flatNums(args);
        if (!nums.length) throw new XlError('#DIV/0!');
        return nums.reduce((s, v) => s + v, 0) / nums.length;
      }
      case 'MIN': {
        const nums = flatNums(args);
        return nums.length ? Math.min(...nums) : 0;
      }
      case 'MAX': {
        const nums = flatNums(args);
        return nums.length ? Math.max(...nums) : 0;
      }
      case 'MEDIAN': {
        const nums = flatNums(args).sort((a, b) => a - b);
        if (!nums.length) throw new XlError('#NUM!');
        const mid = Math.floor(nums.length / 2);
        return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
      }
      case 'COUNT': {
        let n = 0;
        for (const a of args) {
          if (isRange(a)) n += a.vals.filter((v) => typeof v === 'number').length;
          else if (typeof a === 'number' || (typeof a === 'string' && typeof literal(a) === 'number')) n++;
        }
        return n;
      }
      case 'COUNTA': {
        let n = 0;
        for (const a of args) {
          if (isRange(a)) n += a.vals.filter((v) => v !== null).length;
          else if (a !== null) n++;
        }
        return n;
      }
      case 'ROUND':
      case 'ROUNDUP':
      case 'ROUNDDOWN': {
        need(1, 2);
        const mode = name === 'ROUND' ? 'round' : name === 'ROUNDUP' ? 'up' : 'down';
        return roundHalfAway(toNum(args[0]), args[1] === undefined ? 0 : Math.trunc(toNum(args[1])), mode);
      }
      case 'ABS':
        need(1);
        return Math.abs(toNum(args[0]));
      case 'INT':
        need(1);
        return Math.floor(toNum(args[0]));
      case 'SQRT': {
        need(1);
        const v = toNum(args[0]);
        if (v < 0) throw new XlError('#NUM!');
        return Math.sqrt(v);
      }
      case 'POWER': {
        need(2);
        const v = toNum(args[0]) ** toNum(args[1]);
        if (!Number.isFinite(v)) throw new XlError('#NUM!');
        return v;
      }
      case 'MOD': {
        need(2);
        const d = toNum(args[1]);
        if (d === 0) throw new XlError('#DIV/0!');
        const n = toNum(args[0]);
        return n - d * Math.floor(n / d);
      }
      case 'AND':
        return flatBools(args).every(Boolean);
      case 'OR':
        return flatBools(args).some(Boolean);
      case 'NOT':
        need(1);
        return !toBool(args[0]);
      case 'CONCAT':
      case 'CONCATENATE': {
        let s = '';
        for (const a of args) {
          if (isRange(a)) for (const v of a.vals) s += toStr(v);
          else s += toStr(a);
        }
        return s;
      }
      case 'LEN':
        need(1);
        return toStr(args[0]).length;
      case 'UPPER':
        need(1);
        return toStr(args[0]).toUpperCase();
      case 'LOWER':
        need(1);
        return toStr(args[0]).toLowerCase();
      case 'PROPER':
        need(1);
        return toStr(args[0]).toLowerCase().replace(/(^|[^a-z])([a-z])/g, (_m, a, b) => a + b.toUpperCase());
      case 'TRIM':
        need(1);
        return toStr(args[0]).trim().replace(/\s+/g, ' ');
      case 'LEFT': {
        need(1, 2);
        return toStr(args[0]).slice(0, args[1] === undefined ? 1 : Math.max(0, toNum(args[1])));
      }
      case 'RIGHT': {
        need(1, 2);
        const s = toStr(args[0]);
        const n = args[1] === undefined ? 1 : Math.max(0, toNum(args[1]));
        return n === 0 ? '' : s.slice(-n);
      }
      case 'MID': {
        need(3);
        const start = Math.max(1, toNum(args[1]));
        return toStr(args[0]).substr(start - 1, Math.max(0, toNum(args[2])));
      }
      case 'COUNTIF': {
        need(2);
        const rg = args[0];
        if (!isRange(rg)) throw new XlError('#VALUE!');
        const m = matcher(args[1] as Scalar);
        return rg.vals.filter(m).length;
      }
      case 'SUMIF': {
        need(2, 3);
        const rg = args[0];
        if (!isRange(rg)) throw new XlError('#VALUE!');
        const sumRg = args[2] ?? rg;
        if (!isRange(sumRg)) throw new XlError('#VALUE!');
        const m = matcher(args[1] as Scalar);
        let s = 0;
        rg.vals.forEach((v, i) => {
          const sv = sumRg.vals[i];
          if (m(v) && typeof sv === 'number') s += sv;
        });
        return s;
      }
      case 'XLOOKUP': {
        need(3, 6);
        const [look, from, ret] = args;
        if (isRange(look) || !isRange(from) || !isRange(ret) || from.vals.length !== ret.vals.length) throw new XlError('#VALUE!');
        const mode = args[4] === undefined ? 0 : Math.trunc(toNum(args[4]));
        const rev = args[5] !== undefined && toNum(args[5]) === -1;
        const idxs = from.vals.map((_, i) => i);
        if (rev) idxs.reverse();
        const live = (v: Scalar) => v !== null && !(v instanceof XlError);
        let hit = -1;
        if (mode === 2) {
          const m2 = matcher(look as Scalar);
          hit = idxs.find((i) => m2(from.vals[i])) ?? -1;
        } else {
          hit = idxs.find((i) => live(from.vals[i]) && compare(from.vals[i], look as Scalar) === 0) ?? -1;
          if (hit < 0 && (mode === -1 || mode === 1)) {
            let best = -1;
            for (const i of idxs) {
              const v = from.vals[i];
              if (!live(v)) continue;
              const c = compare(v, look as Scalar);
              if (mode === -1 && c < 0 && (best < 0 || compare(v, from.vals[best]) > 0)) best = i;
              if (mode === 1 && c > 0 && (best < 0 || compare(v, from.vals[best]) < 0)) best = i;
            }
            hit = best;
          }
        }
        if (hit >= 0) return ret.vals[hit];
        if (args[3] !== undefined) return args[3] as Scalar;
        throw new XlError('#N/A');
      }
      case 'MATCH': {
        need(2, 3);
        const rg = args[1];
        if (!isRange(rg) || isRange(args[0])) throw new XlError('#VALUE!');
        const type = args[2] === undefined ? 1 : Math.trunc(toNum(args[2]));
        const live = (v: Scalar) => v !== null && !(v instanceof XlError);
        let pos = -1;
        if (type === 0) {
          pos = rg.vals.findIndex((v) => live(v) && compare(v, args[0] as Scalar) === 0);
        } else {
          for (let i = 0; i < rg.vals.length; i++) {
            const v = rg.vals[i];
            if (!live(v)) continue;
            const c = compare(v, args[0] as Scalar);
            if (type === 1 ? c <= 0 : c >= 0) pos = i;
            else break;
          }
        }
        if (pos < 0) throw new XlError('#N/A');
        return pos + 1;
      }
      case 'INDEX': {
        need(2, 3);
        const rg = args[0];
        if (!isRange(rg)) throw new XlError('#VALUE!');
        const r = Math.trunc(toNum(args[1]));
        const c = args[2] === undefined ? (rg.cols === 1 ? 1 : 0) : Math.trunc(toNum(args[2]));
        // Row 0 means "the whole column", column 0 means "the whole row" (a 2-D range only).
        if (rg.cols > 1 && rg.rows > 1 && args[2] !== undefined) {
          if (r === 0 && c >= 1 && c <= rg.cols) return mkArr(rg.rows, 1, Array.from({ length: rg.rows }, (_, i) => rg.vals[i * rg.cols + c - 1]));
          if (c === 0 && r >= 1 && r <= rg.rows) return mkArr(1, rg.cols, rg.vals.slice((r - 1) * rg.cols, r * rg.cols));
        }
        if (rg.cols === 1 || rg.rows === 1) {
          const idx = (rg.cols === 1 ? r : rg.rows === 1 && args[2] === undefined ? r : c) - 1;
          if (idx < 0 || idx >= rg.vals.length) throw new XlError('#REF!');
          return rg.vals[idx];
        }
        if (r < 1 || r > rg.rows || c < 1 || c > rg.cols) throw new XlError('#REF!');
        return rg.vals[(r - 1) * rg.cols + (c - 1)];
      }
      case 'VLOOKUP':
      case 'HLOOKUP': {
        need(3, 4);
        const tbl = args[1];
        if (!isRange(tbl) || isRange(args[0])) throw new XlError('#VALUE!');
        const idx = Math.trunc(toNum(args[2]));
        const approx = args[3] === undefined ? true : toBool(args[3]);
        const horizontal = name === 'HLOOKUP';
        const lines = horizontal ? tbl.cols : tbl.rows;
        const depth = horizontal ? tbl.rows : tbl.cols;
        if (idx < 1 || idx > depth) throw new XlError('#REF!');
        const key = (i: number) => tbl.vals[horizontal ? i : i * tbl.cols];
        const out = (i: number) => tbl.vals[horizontal ? (idx - 1) * tbl.cols + i : i * tbl.cols + idx - 1];
        let found = -1;
        for (let i = 0; i < lines; i++) {
          const v = key(i);
          if (v === null || v instanceof XlError) continue;
          const c = compare(v, args[0] as Scalar);
          if (approx) {
            if (c <= 0) found = i;
            else break;
          } else if (c === 0) {
            found = i;
            break;
          }
        }
        if (found < 0) throw new XlError('#N/A');
        return out(found);
      }
      case 'SUBSTITUTE': {
        need(3);
        const from = toStr(args[1]);
        return from === '' ? toStr(args[0]) : toStr(args[0]).split(from).join(toStr(args[2]));
      }
      case 'VALUE': {
        need(1);
        const v = literal(toStr(args[0]).trim());
        if (typeof v !== 'number') throw new XlError('#VALUE!');
        return v;
      }
      case 'ISNUMBER':
        need(1);
        return typeof args[0] === 'number';
      case 'ISTEXT':
        need(1);
        return typeof args[0] === 'string';
      case 'ISBLANK':
        need(1);
        return args[0] === null;
      case 'ISERROR':
        need(1);
        return args[0] instanceof XlError;
      case 'COUNTBLANK': {
        need(1);
        const rg = args[0];
        return isRange(rg) ? rg.vals.filter((v) => v === null || v === '').length : 0;
      }
      // ---- multi-criteria aggregates
      case 'SUMIFS':
      case 'AVERAGEIFS':
      case 'MAXIFS':
      case 'MINIFS': {
        if (args.length < 3 || args.length % 2 === 0) throw new XlError('#VALUE!');
        const target = args[0];
        if (!isRange(target)) throw new XlError('#VALUE!');
        const mask = critMask(args.slice(1), target.vals.length);
        const nums: number[] = [];
        target.vals.forEach((v, i) => {
          if (mask[i] && typeof v === 'number') nums.push(v);
        });
        if (name === 'SUMIFS') return nums.reduce((t, v) => t + v, 0);
        if (name === 'AVERAGEIFS') {
          if (!nums.length) throw new XlError('#DIV/0!');
          return nums.reduce((t, v) => t + v, 0) / nums.length;
        }
        if (!nums.length) return 0;
        return name === 'MAXIFS' ? Math.max(...nums) : Math.min(...nums);
      }
      case 'COUNTIFS': {
        if (args.length < 2 || args.length % 2 !== 0) throw new XlError('#VALUE!');
        const first = args[0];
        if (!isRange(first)) throw new XlError('#VALUE!');
        return critMask(args, first.vals.length).filter(Boolean).length;
      }
      case 'AVERAGEIF': {
        need(2, 3);
        const rg = args[0];
        const avg = args[2] ?? rg;
        if (!isRange(rg) || !isRange(avg)) throw new XlError('#VALUE!');
        const m = matcher(args[1] as Scalar);
        const nums: number[] = [];
        rg.vals.forEach((v, i) => {
          const a = avg.vals[i];
          if (m(v) && typeof a === 'number') nums.push(a);
        });
        if (!nums.length) throw new XlError('#DIV/0!');
        return nums.reduce((t, v) => t + v, 0) / nums.length;
      }
      // ---- ranking & statistics
      case 'LARGE':
      case 'SMALL': {
        need(2);
        const nums = flatNums([args[0]]).sort((a, b) => (name === 'LARGE' ? b - a : a - b));
        const k = Math.trunc(toNum(args[1]));
        if (k < 1 || k > nums.length) throw new XlError('#NUM!');
        return nums[k - 1];
      }
      case 'RANK':
      case 'RANK.EQ': {
        need(2, 3);
        const v = toNum(args[0]);
        const nums = flatNums([args[1]]);
        if (!nums.includes(v)) throw new XlError('#N/A');
        const asc = args[2] !== undefined && toNum(args[2]) !== 0;
        return nums.filter((x) => (asc ? x < v : x > v)).length + 1;
      }
      case 'MODE':
      case 'MODE.SNGL': {
        const nums = flatNums(args);
        const counts = new Map<number, number>();
        for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1);
        let best: number | null = null;
        let bestN = 1;
        for (const n of nums) {
          const c = counts.get(n) ?? 0;
          if (c > bestN) {
            best = n;
            bestN = c;
          }
        }
        if (best === null) throw new XlError('#N/A');
        return best;
      }
      case 'STDEV':
      case 'STDEV.S':
      case 'STDEV.P':
      case 'VAR':
      case 'VAR.S':
      case 'VAR.P': {
        const nums = flatNums(args);
        const pop = name.endsWith('.P');
        if (nums.length < (pop ? 1 : 2)) throw new XlError('#DIV/0!');
        const mean = nums.reduce((t, v) => t + v, 0) / nums.length;
        const ss = nums.reduce((t, v) => t + (v - mean) ** 2, 0);
        const variance = ss / (pop ? nums.length : nums.length - 1);
        return name.startsWith('STDEV') ? Math.sqrt(variance) : variance;
      }
      case 'CEILING':
      case 'FLOOR':
      case 'MROUND': {
        need(1, 2);
        const n = toNum(args[0]);
        const sig = args[1] === undefined ? 1 : toNum(args[1]);
        if (sig === 0) return 0;
        const q = n / sig;
        const r = name === 'CEILING' ? Math.ceil(q - 1e-12) : name === 'FLOOR' ? Math.floor(q + 1e-12) : Math.round(q + Math.sign(q) * 1e-12);
        return Number.parseFloat((r * sig).toPrecision(14));
      }
      case 'TRUNC': {
        need(1, 2);
        const d = args[1] === undefined ? 0 : Math.trunc(toNum(args[1]));
        const f = 10 ** d;
        return Math.trunc(toNum(args[0]) * f) / f;
      }
      // ---- text
      case 'FIND':
      case 'SEARCH': {
        need(2, 3);
        const needle = toStr(args[0]);
        const hay = toStr(args[1]);
        const start = args[2] === undefined ? 1 : Math.trunc(toNum(args[2]));
        if (start < 1 || start > hay.length + 1) throw new XlError('#VALUE!');
        let idx = -1;
        if (name === 'FIND') idx = hay.indexOf(needle, start - 1);
        else if (/[*?]/.test(needle)) {
          const re = new RegExp(needle.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.'), 'i');
          const mm = re.exec(hay.slice(start - 1));
          idx = mm ? mm.index + start - 1 : -1;
        } else idx = hay.toLowerCase().indexOf(needle.toLowerCase(), start - 1);
        if (idx < 0) throw new XlError('#VALUE!');
        return idx + 1;
      }
      case 'TEXTJOIN': {
        if (args.length < 3) throw new XlError('#VALUE!');
        const delim = toStr(args[0]);
        const skip = toBool(args[1]);
        const parts: string[] = [];
        for (const a of args.slice(2)) {
          const list = isRange(a) ? a.vals : [a];
          for (const v of list) {
            if (v instanceof XlError) throw v;
            const t = toStr(v);
            if (skip && t === '') continue;
            parts.push(t);
          }
        }
        return parts.join(delim);
      }
      case 'CLEAN':
        need(1);
        // eslint-disable-next-line no-control-regex
        return toStr(args[0]).replace(/[\x00-\x1f]/g, '');
      case 'EXACT':
        need(2);
        return toStr(args[0]) === toStr(args[1]);
      case 'REPT': {
        need(2);
        const n = Math.trunc(toNum(args[1]));
        if (n < 0) throw new XlError('#VALUE!');
        return toStr(args[0]).repeat(n);
      }
      case 'TEXT':
        need(2);
        return textFormat(args[0] as Scalar, toStr(args[1]));
      // ---- dates & times
      case 'TODAY':
        need(0);
        return todaySerial();
      case 'NOW': {
        need(0);
        const n = new Date();
        return todaySerial() + (n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds()) / 86400;
      }
      case 'DATE': {
        need(3);
        const y = Math.trunc(toNum(args[0]));
        const m = Math.trunc(toNum(args[1]));
        const d = Math.trunc(toNum(args[2]));
        return dateToSerial(y < 100 ? 1900 + y : y, m, d);
      }
      case 'DATEVALUE': {
        need(1);
        const v = parseDateText(toStr(args[0]));
        if (v === null) throw new XlError('#VALUE!');
        return v;
      }
      case 'YEAR':
      case 'MONTH':
      case 'DAY': {
        need(1);
        const parts = serialToParts(toNum(args[0]));
        return name === 'YEAR' ? parts.y : name === 'MONTH' ? parts.m : parts.d;
      }
      case 'WEEKDAY': {
        need(1, 2);
        const wd = serialToParts(toNum(args[0])).wd; // 0 = Sunday
        const type = args[1] === undefined ? 1 : Math.trunc(toNum(args[1]));
        if (type === 1) return wd + 1;
        if (type === 2) return ((wd + 6) % 7) + 1;
        if (type === 3) return (wd + 6) % 7;
        throw new XlError('#NUM!');
      }
      case 'DAYS':
        need(2);
        return Math.floor(toNum(args[0])) - Math.floor(toNum(args[1]));
      case 'DATEDIF':
        need(3);
        return dateDif(toNum(args[0]), toNum(args[1]), toStr(args[2]).toUpperCase());
      case 'EDATE': {
        need(2);
        const t = addMonths(toNum(args[0]), Math.trunc(toNum(args[1])));
        return dateToSerial(t.y, t.m, t.d);
      }
      case 'EOMONTH': {
        need(2);
        const t = addMonths(toNum(args[0]), Math.trunc(toNum(args[1])));
        return dateToSerial(t.y, t.m, daysInMonth(t.y, t.m));
      }
      case 'WORKDAY':
      case 'NETWORKDAYS': {
        need(2, 3);
        const hol = new Set<number>();
        if (args[2] !== undefined) for (const h of isRange(args[2]) ? args[2].vals : [args[2]]) if (typeof h === 'number') hol.add(Math.floor(h));
        const startD = Math.floor(toNum(args[0]));
        if (name === 'WORKDAY') {
          let left = Math.trunc(toNum(args[1]));
          const step = left < 0 ? -1 : 1;
          let cur = startD;
          while (left !== 0) {
            cur += step;
            if (!isWeekend(cur) && !hol.has(cur)) left -= step;
          }
          return cur;
        }
        const endD = Math.floor(toNum(args[1]));
        const [lo, hi] = startD <= endD ? [startD, endD] : [endD, startD];
        let n = 0;
        for (let d = lo; d <= hi; d++) if (!isWeekend(d) && !hol.has(d)) n++;
        return startD <= endD ? n : -n;
      }
      case 'SLOPE':
      case 'INTERCEPT':
      case 'CORREL':
      case 'RSQ': {
        need(2);
        const [ys, xs] = pairs(args[0], args[1]);
        const fit = linFit(xs, ys);
        if (name === 'SLOPE') return fit.slope;
        if (name === 'INTERCEPT') return fit.intercept;
        return name === 'CORREL' ? fit.r : fit.r * fit.r;
      }
      case 'FORECAST':
      case 'FORECAST.LINEAR': {
        need(3);
        const [ys, xs] = pairs(args[1], args[2]);
        const fit = linFit(xs, ys);
        return fit.intercept + fit.slope * toNum(args[0]);
      }
      case 'PV': case 'FV': case 'PMT': case 'NPER': case 'RATE': case 'IPMT': case 'PPMT': case 'CUMIPMT': case 'CUMPRINC':
      case 'NPV': case 'IRR': case 'XNPV': case 'XIRR': case 'SLN': case 'DDB': case 'EFFECT': case 'NOMINAL': {
        const n = (i: number, d?: number) => (args[i] === undefined || args[i] === null ? (d ?? 0) : toNum(args[i]));
        try {
          switch (name) {
            case 'FV': need(3, 5); return Fin.fv(n(0), n(1), n(2), n(3), n(4));
            case 'PV': need(3, 5); return Fin.pv(n(0), n(1), n(2), n(3), n(4));
            case 'PMT': need(3, 5); return Fin.pmt(n(0), n(1), n(2), n(3), n(4));
            case 'NPER': need(3, 5); return Fin.nper(n(0), n(1), n(2), n(3), n(4));
            case 'RATE': need(3, 6); return Fin.rate(n(0), n(1), n(2), n(3), n(4), n(5, 0.1));
            case 'IPMT': need(4, 6); return Fin.ipmt(n(0), n(1), n(2), n(3), n(4), n(5));
            case 'PPMT': need(4, 6); return Fin.ppmt(n(0), n(1), n(2), n(3), n(4), n(5));
            case 'CUMIPMT': need(6); return Fin.cumipmt(n(0), n(1), n(2), n(3), n(4), n(5));
            case 'CUMPRINC': need(6); return Fin.cumprinc(n(0), n(1), n(2), n(3), n(4), n(5));
            case 'NPV': need(2, 255); return Fin.npv(n(0), flatNums(args.slice(1)));
            case 'IRR': need(1, 2); return Fin.irr(flatNums([args[0]]), n(1, 0.1));
            case 'XNPV': need(3); return Fin.xnpv(n(0), flatNums([args[1]]), flatNums([args[2]]));
            case 'XIRR': need(2, 3); return Fin.xirr(flatNums([args[0]]), flatNums([args[1]]), n(2, 0.1));
            case 'SLN': need(3); return Fin.sln(n(0), n(1), n(2));
            case 'DDB': need(4, 5); return Fin.ddb(n(0), n(1), n(2), n(3), n(4, 2));
            case 'EFFECT': need(2); return Fin.effect(n(0), n(1));
            default: need(2); return Fin.nominal(n(0), n(1));
          }
        } catch (e) {
          if (e instanceof Fin.FinError) throw new XlError(e.code);
          throw e;
        }
      }
      case 'NA':
        throw new XlError('#N/A');
      case 'ISNA':
        need(1);
        return args[0] instanceof XlError && args[0].code === '#N/A';
      default: {
        const lam = lambdaNamed(name);
        if (lam) return invoke(lam, args);
        const udf = userFunctions[name];
        if (udf) {
          const flat = args.map((a) => (isRange(a) ? (a.vals[0] ?? null) : isLambda(a) ? null : a)) as Scalar[];
          return udf(flat);
        }
        throw new XlError('#NAME?');
      }
    }
  }

  // Pairs of numbers from two equal-length ranges, skipping rows where either is not a number.
  function pairs(a: Val, b: Val): [number[], number[]] {
    if (!isRange(a) || !isRange(b) || a.vals.length !== b.vals.length) throw new XlError('#N/A');
    const x: number[] = [];
    const y: number[] = [];
    a.vals.forEach((v, i) => {
      const w = b.vals[i];
      if (typeof v === 'number' && typeof w === 'number') {
        x.push(v);
        y.push(w);
      }
    });
    if (x.length < 2) throw new XlError('#DIV/0!');
    return [x, y];
  }
  function linFit(x: number[], y: number[]) {
    const n = x.length;
    const mx = x.reduce((t, v) => t + v, 0) / n;
    const my = y.reduce((t, v) => t + v, 0) / n;
    let sxx = 0;
    let syy = 0;
    let sxy = 0;
    for (let i = 0; i < n; i++) {
      sxx += (x[i] - mx) ** 2;
      syy += (y[i] - my) ** 2;
      sxy += (x[i] - mx) * (y[i] - my);
    }
    if (sxx === 0 || syy === 0) throw new XlError('#DIV/0!');
    const slope = sxy / sxx;
    return { slope, intercept: my - slope * mx, r: sxy / Math.sqrt(sxx * syy) };
  }

  // Row-by-row AND of (range, criteria) pairs for the *IFS functions.
  function critMask(pairs: Val[], n: number): boolean[] {
    const mask: boolean[] = Array.from({ length: n }, () => true);
    for (let i = 0; i < pairs.length; i += 2) {
      const rg = pairs[i];
      if (!isRange(rg) || rg.vals.length !== n) throw new XlError('#VALUE!');
      const crit = pairs[i + 1];
      if (isRange(crit)) throw new XlError('#VALUE!');
      const m = matcher(crit as Scalar);
      rg.vals.forEach((v, j) => {
        if (!m(v)) mask[j] = false;
      });
    }
    return mask;
  }

  function flatBools(args: Val[]): boolean[] {
    const out: boolean[] = [];
    for (const a of args) {
      if (isRange(a)) {
        for (const v of a.vals) {
          if (v instanceof XlError) throw v;
          if (typeof v === 'boolean') out.push(v);
          else if (typeof v === 'number') out.push(v !== 0);
        }
      } else out.push(toBool(a));
    }
    return out;
  }

  const evalFormula = (formula: string): Scalar => {
    prime();
    try {
      const ast = parse(tokenize(formula.replace(/^=/, '')));
      const v = evalNode(ast);
      return isRange(v) || isLambda(v) ? new XlError('#VALUE!') : v;
    } catch (e) {
      return e instanceof XlError ? e : new XlError('#VALUE!');
    }
  };
  const value = (key: string) => {
    prime();
    return cellValue(key);
  };
  const display = (key: string) => {
    prime();
    const raw = data.cells[key] ?? '';
    let style = data.styles[key];
    let hint = raw;
    // A bare reference (=C1) shows in the same format as the cell it points at, like Excel.
    const m = /^=\s*\$?([A-Z]{1,3})\$?(\d+)\s*$/i.exec(raw);
    if (m && (!style || !style.fmt || style.fmt === 'general')) {
      const ref = `${m[1].toUpperCase()}${m[2]}`;
      hint = data.cells[ref] ?? '';
      if (data.styles[ref]?.fmt === 'date') style = { ...style, fmt: 'date' };
    }
    return formatValue(cellValue(key), style, hint);
  };
  const spillOf = (key: string): Rect | null => {
    prime();
    const anchor = spillRects.has(key) ? key : memberOf.get(key);
    return anchor ? (spillRects.get(anchor) ?? null) : null;
  };
  const spillMembers = (): string[] => {
    prime();
    return [...spills.keys()];
  };
  return { value, display, evalFormula, spillOf, spillMembers };
}

// --- formatting -------------------------------------------------------------

export function fmtGeneral(n: number): string {
  if (!Number.isFinite(n)) return '#NUM!';
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  const abs = Math.abs(n);
  if (abs >= 1e11 || (abs < 1e-9 && abs > 0)) return n.toExponential(5).replace(/\.?0+e/, 'e');
  return String(Number.parseFloat(n.toPrecision(10)));
}

/** Worksheet functions written as VBA Function procedures (upper-case names). Set by the macro panel. */
let userFunctions: Record<string, (args: Scalar[]) => Scalar> = {};
export function setUserFunctions(fns: Record<string, (args: Scalar[]) => Scalar>) {
  userFunctions = fns;
}

export function formatValue(v: Scalar, style: Style | undefined, raw: string): string {
  if (v instanceof XlError) return v.code;
  if (v === null) return '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (style?.nf && (typeof v === 'number' || typeof v === 'string')) {
    try {
      return formatWithPattern(v, style.nf, formatDate);
    } catch {
      /* fall through to the normal display */
    }
  }
  if (typeof v === 'string') return v;
  let fmt: NumFmt = style?.fmt ?? 'general';
  const dec = style?.dec;
  if (fmt === 'general') {
    if (raw.startsWith('=')) {
      if (/^=\s*NOW\s*\(/i.test(raw)) return formatDate(v, 'd mmm yyyy h:mm');
      if (/^=\s*(DATE|TODAY|EDATE|EOMONTH|WORKDAY|DATEVALUE)\s*\(/i.test(raw)) fmt = 'date';
    } else if (parseDateText(raw) !== null) fmt = 'date';
  }
  if (fmt === 'date') return formatDate(v, 'd mmm yyyy');
  const grouped = (n: number, d: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (fmt === 'number') return grouped(v, dec ?? 2);
  if (fmt === 'currency') return `${v < 0 ? '-' : ''}$${grouped(Math.abs(v), dec ?? 2)}`;
  if (fmt === 'percent') return `${grouped(v * 100, dec ?? 0)}%`;
  // General: apply a decimals override if set, otherwise show typed numbers as typed.
  if (dec !== undefined) return grouped(v, dec).replace(/,/g, '');
  if (!raw.startsWith('=') && /^[-+]?\$?[\d,]*\.?\d+%$/.test(raw.replace(/\s/g, ''))) return raw.trim();
  return fmtGeneral(v);
}

// --- formula reference shifting (copy / fill) --------------------------------

export function adjustFormula(raw: string, dc: number, dr: number): string {
  if (!raw.startsWith('=')) return raw;
  return raw
    .split(/("(?:[^"]|"")*")/)
    .map((seg, idx) => {
      if (idx % 2 === 1) return seg;
      return seg.replace(/(?<![A-Za-z0-9_.\[@])(\$?)([A-Za-z]{1,3})(\$?)(\d+)(?![\w.(!\]])/g, (_m, ac, col, ar, row) => {
        const c = ac ? colIndex(col) : colIndex(col) + dc;
        const r = ar ? +row - 1 : +row - 1 + dr;
        if (!inBounds(c, r)) return '#REF!';
        return `${ac}${colLabel(c)}${ar}${r + 1}`;
      });
    })
    .join('');
}

// Cycles the reference touching `caret` through A1 -> $A$1 -> A$1 -> $A1 (F4).
export function cycleAbsolute(text: string, caret: number): { text: string; caret: number } {
  const re = /(?<![A-Za-z0-9_.])(\$?)([A-Za-z]{1,3})(\$?)(\d+)(?![\w.(!])/g;
  let m: RegExpExecArray | null = re.exec(text);
  while (m) {
    const start = m.index;
    const end = start + m[0].length;
    if (caret >= start && caret <= end) {
      const [, ac, col, ar, row] = m;
      const next = !ac && !ar ? ['$', '$'] : ac && ar ? ['', '$'] : !ac && ar ? ['$', ''] : ['', ''];
      const repl = `${next[0]}${col}${next[1]}${row}`;
      return { text: text.slice(0, start) + repl + text.slice(end), caret: start + repl.length };
    }
    m = re.exec(text);
  }
  return { text, caret };
}

// Uppercases formulas outside string literals, like Excel does on commit.
export function normalizeInput(text: string): string {
  if (!text.startsWith('=')) return text;
  return text
    .split(/("(?:[^"]|"")*")/)
    .map((seg, i) => (i % 2 === 1 ? seg : seg.toUpperCase()))
    .join('');
}

// --- series fill ------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function keepCase(sample: string, word: string) {
  if (sample === sample.toUpperCase()) return word.toUpperCase();
  if (sample === sample.toLowerCase()) return word.toLowerCase();
  return word;
}

// Continues `src` (raw strings, no formulas) for `count` more cells. `forward`
// false extends upward/leftward, where the series runs in reverse.
export function extendSeries(src: string[], count: number, forward: boolean): string[] {
  const out: string[] = [];
  const nums = src.map((s) => {
    const v = literal(s);
    return typeof v === 'number' && !/%$/.test(s.trim()) ? v : null;
  });

  // Numbers: a single value repeats; two or more continue the linear trend.
  if (src.length >= 2 && nums.every((n) => n !== null)) {
    const list = nums as number[];
    const step = (list[list.length - 1] - list[0]) / (list.length - 1);
    for (let i = 1; i <= count; i++) {
      const v = forward ? list[list.length - 1] + step * i : list[0] - step * i;
      out.push(fmtGeneral(Number.parseFloat(v.toFixed(10))));
    }
    return out;
  }

  if (src.length === 1) {
    const s = src[0];
    const dir = forward ? 1 : -1;
    const mi = MONTHS.findIndex((m) => m.toLowerCase() === s.trim().toLowerCase());
    if (mi >= 0) return Array.from({ length: count }, (_, i) => keepCase(s, MONTHS[(((mi + dir * (i + 1)) % 12) + 12) % 12]));
    const di = DAYS.findIndex((d) => d.toLowerCase() === s.trim().toLowerCase());
    if (di >= 0) return Array.from({ length: count }, (_, i) => keepCase(s, DAYS[(((di + dir * (i + 1)) % 7) + 7) % 7]));
    const m = /^(.*?)(\d+)$/.exec(s);
    if (m && typeof literal(s) !== 'number') {
      const width = m[2].length;
      const base = Number.parseInt(m[2], 10);
      return Array.from({ length: count }, (_, i) => {
        const n = base + dir * (i + 1);
        return `${m[1]}${n < 0 ? 0 : String(n).padStart(width, '0')}`;
      });
    }
  }

  // Anything else repeats the pattern.
  for (let i = 0; i < count; i++) {
    const idx = forward ? i % src.length : src.length - 1 - (i % src.length);
    out.push(src[idx]);
  }
  return out;
}
