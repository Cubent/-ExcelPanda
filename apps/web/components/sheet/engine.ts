// ---------------------------------------------------------------------------
// ExcelPanda spreadsheet engine: addressing, formulas, formatting, fill.
// Pure TypeScript with no React, so it can be unit tested on its own.
// ---------------------------------------------------------------------------

// Sheet size is switchable (lesson settings); set before rendering the grid.
export let COLS = 10;
export let ROWS = 14;
export function setSheetSize(cols: number, rows: number) {
  COLS = cols;
  ROWS = rows;
}

export type Pos = { c: number; r: number };
export type Rect = { c1: number; r1: number; c2: number; r2: number };

export type NumFmt = 'general' | 'number' | 'currency' | 'percent';
export type Style = {
  b?: boolean;
  i?: boolean;
  u?: boolean;
  align?: 'left' | 'center' | 'right';
  fmt?: NumFmt;
  dec?: number;
  bg?: string;
  color?: string;
};

export type SheetData = {
  cells: Record<string, string>;
  styles: Record<string, Style>;
  colW: Record<number, number>;
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
type Val = Scalar | RangeVal;

const isRange = (v: Val): v is RangeVal => typeof v === 'object' && v !== null && 'range' in v;

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
  return raw;
}

// --- tokenizer & parser -----------------------------------------------------

type Tok =
  | { t: 'num'; v: number }
  | { t: 'str'; v: string }
  | { t: 'ref'; v: string }
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
    m = /^\$?[A-Za-z]{1,3}\$?\d+(?![\w.(])/.exec(rest);
    if (m) {
      out.push({ t: 'ref', v: m[0].replace(/\$/g, '').toUpperCase() });
      i += m[0].length;
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
    else throw new XlError('#NAME?');
    i++;
  }
  return out;
}

type Node =
  | { k: 'num'; v: number }
  | { k: 'str'; v: string }
  | { k: 'bool'; v: boolean }
  | { k: 'ref'; key: string }
  | { k: 'range'; a: string; b: string }
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
  function postfix(): Node {
    let e = primary();
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
        return { k: 'range', a: t.v, b: t2.v };
      }
      return { k: 'ref', key: t.v };
    }
    if (t.t === 'name') {
      if (t.v === 'TRUE') return { k: 'bool', v: true };
      if (t.v === 'FALSE') return { k: 'bool', v: false };
      throw new XlError('#NAME?');
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
        args.push(cmp());
        const n = tokens[p++];
        if (!n) throw new XlError('#NAME?');
        if (n.t === 'comma') continue;
        if (n.t === 'rp') break;
        throw new XlError('#NAME?');
      }
      return { k: 'fn', name: t.v, args };
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
  value(key: string): Scalar;
  display(key: string): string;
};

function toNum(v: Val): number {
  if (isRange(v)) throw new XlError('#VALUE!');
  if (v instanceof XlError) throw v;
  if (v === null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const lit = literal(v);
  if (typeof lit === 'number') return lit;
  throw new XlError('#VALUE!');
}

function toStr(v: Val): string {
  if (isRange(v)) throw new XlError('#VALUE!');
  if (v instanceof XlError) throw v;
  if (v === null) return '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return fmtGeneral(v);
  return v;
}

function toBool(v: Val): boolean {
  if (isRange(v)) throw new XlError('#VALUE!');
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

export function buildEvaluator(data: SheetData): Evaluator {
  const memo = new Map<string, Scalar>();
  const stack = new Set<string>();
  const cache = new Map<string, Node | XlError>();

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
            out = isRange(v) ? new XlError('#VALUE!') : v === null ? 0 : v;
          }
        } catch (e) {
          out = e instanceof XlError ? e : new XlError('#VALUE!');
        }
        stack.delete(key);
      }
    } else {
      out = literal(raw);
    }
    memo.set(key, out);
    return out;
  }

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
        const p = parseKey(n.key);
        if (!p || !inBounds(p.c, p.r)) throw new XlError('#REF!');
        return cellValue(n.key);
      }
      case 'range':
        return rangeVal(n.a, n.b);
      case 'un': {
        const v = toNum(evalNode(n.e));
        return n.op === '-' ? -v : v;
      }
      case 'pct':
        return toNum(evalNode(n.e)) / 100;
      case 'bin': {
        if (n.op === '&') return toStr(evalNode(n.l)) + toStr(evalNode(n.r));
        if (['=', '<>', '<', '>', '<=', '>='].includes(n.op)) {
          const l = evalNode(n.l);
          const r = evalNode(n.r);
          if (isRange(l) || isRange(r)) throw new XlError('#VALUE!');
          const c = compare(l, r);
          switch (n.op) {
            case '=':
              return c === 0;
            case '<>':
              return c !== 0;
            case '<':
              return c < 0;
            case '>':
              return c > 0;
            case '<=':
              return c <= 0;
            default:
              return c >= 0;
          }
        }
        const a = toNum(evalNode(n.l));
        const b = toNum(evalNode(n.r));
        switch (n.op) {
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
      case 'fn':
        return callFn(n.name, n.args);
    }
  }

  function callFn(name: string, argNodes: Node[]): Val {
    // Lazy functions: only evaluate the branch that is needed.
    if (name === 'IF') {
      if (argNodes.length < 2 || argNodes.length > 3) throw new XlError('#VALUE!');
      const cond = toBool(evalNode(argNodes[0]));
      if (cond) return evalNode(argNodes[1]);
      return argNodes[2] ? evalNode(argNodes[2]) : false;
    }
    if (name === 'IFERROR') {
      if (argNodes.length !== 2) throw new XlError('#VALUE!');
      try {
        const v = evalNode(argNodes[0]);
        if (!isRange(v) && v instanceof XlError) return evalNode(argNodes[1]);
        return v;
      } catch (e) {
        if (e instanceof XlError) return evalNode(argNodes[1]);
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

    const args = argNodes.map(evalNode);
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
        need(3, 4);
        const [look, from, ret] = args;
        if (!isRange(from) || !isRange(ret) || from.vals.length !== ret.vals.length) throw new XlError('#VALUE!');
        const i = from.vals.findIndex((v) => v !== null && !(v instanceof XlError) && compare(v, look as Scalar) === 0);
        if (i >= 0) return ret.vals[i];
        if (args[3] !== undefined) return args[3] as Scalar;
        throw new XlError('#N/A');
      }
      case 'MATCH': {
        need(2, 3);
        const rg = args[1];
        if (!isRange(rg)) throw new XlError('#VALUE!');
        const i = rg.vals.findIndex((v) => v !== null && !(v instanceof XlError) && compare(v, args[0] as Scalar) === 0);
        if (i < 0) throw new XlError('#N/A');
        return i + 1;
      }
      case 'INDEX': {
        need(2, 3);
        const rg = args[0];
        if (!isRange(rg)) throw new XlError('#VALUE!');
        const r = Math.trunc(toNum(args[1]));
        const c = args[2] === undefined ? (rg.cols === 1 ? 1 : 0) : Math.trunc(toNum(args[2]));
        if (rg.cols === 1 || rg.rows === 1) {
          const idx = (rg.cols === 1 ? r : rg.rows === 1 && args[2] === undefined ? r : c) - 1;
          if (idx < 0 || idx >= rg.vals.length) throw new XlError('#REF!');
          return rg.vals[idx];
        }
        if (r < 1 || r > rg.rows || c < 1 || c > rg.cols) throw new XlError('#REF!');
        return rg.vals[(r - 1) * rg.cols + (c - 1)];
      }
      case 'VLOOKUP': {
        need(3, 4);
        const tbl = args[1];
        if (!isRange(tbl)) throw new XlError('#VALUE!');
        const col = Math.trunc(toNum(args[2]));
        if (col < 1 || col > tbl.cols) throw new XlError('#REF!');
        for (let r = 0; r < tbl.rows; r++) {
          const v = tbl.vals[r * tbl.cols];
          if (v !== null && !(v instanceof XlError) && compare(v, args[0] as Scalar) === 0) return tbl.vals[r * tbl.cols + col - 1];
        }
        throw new XlError('#N/A');
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
      default:
        throw new XlError('#NAME?');
    }
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

  const value = (key: string) => cellValue(key);
  const display = (key: string) => formatValue(cellValue(key), data.styles[key], data.cells[key] ?? '');
  return { value, display };
}

// --- formatting -------------------------------------------------------------

export function fmtGeneral(n: number): string {
  if (!Number.isFinite(n)) return '#NUM!';
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  const abs = Math.abs(n);
  if (abs >= 1e11 || (abs < 1e-9 && abs > 0)) return n.toExponential(5).replace(/\.?0+e/, 'e');
  return String(Number.parseFloat(n.toPrecision(10)));
}

export function formatValue(v: Scalar, style: Style | undefined, raw: string): string {
  if (v instanceof XlError) return v.code;
  if (v === null) return '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'string') return v;
  const fmt = style?.fmt ?? 'general';
  const dec = style?.dec;
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
      return seg.replace(/(?<![A-Za-z0-9_.])(\$?)([A-Za-z]{1,3})(\$?)(\d+)(?![\w.(])/g, (_m, ac, col, ar, row) => {
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
  const re = /(?<![A-Za-z0-9_.])(\$?)([A-Za-z]{1,3})(\$?)(\d+)(?![\w.(])/g;
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
