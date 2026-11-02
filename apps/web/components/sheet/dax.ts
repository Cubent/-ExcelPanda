// ---------------------------------------------------------------------------
// A small DAX engine for the data-model lessons: tables, relationships,
// measures, filter context, CALCULATE and basic time intelligence.
// ---------------------------------------------------------------------------
import * as E from './engine';

export type DaxTable = { cols: string[]; rows: E.Scalar[][] };
export type Relationship = { from: string; to: string }; // "Sales[ProductID]" -> "Products[ProductID]" (many to one)
export type DaxModel = { tables: Record<string, DaxTable>; relationships: Relationship[]; measures: Record<string, string> };

type TableVal = { table: string; rows: number[] };
type ColVal = { colRef: { table: string; col: string } };
type DVal = E.Scalar | TableVal | ColVal;
type Ctx = {
  col: Map<string, Set<string>>;
  rowF: Map<string, Set<number>>;
  row: Map<string, number>;
  vars: Record<string, DVal>;
};

export class DaxError extends Error {}

// --- parsing ----------------------------------------------------------------

type Tok = { t: 'num'; v: number } | { t: 'str'; v: string } | { t: 'id'; v: string } | { t: 'col'; table: string; col: string } | { t: 'meas'; v: string } | { t: 'op'; v: string };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    const rest = src.slice(i);
    let m: RegExpExecArray | null;
    if (ch === '"') {
      let j = i + 1;
      let s = '';
      while (j < src.length && !(src[j] === '"' && src[j + 1] !== '"')) {
        if (src[j] === '"') j++;
        s += src[j++];
      }
      out.push({ t: 'str', v: s });
      i = j + 1;
      continue;
    }
    if ((m = /^(\d+\.?\d*|\.\d+)/.exec(rest))) {
      out.push({ t: 'num', v: Number.parseFloat(m[0]) });
      i += m[0].length;
      continue;
    }
    if ((m = /^(?:'([^']+)'|([A-Za-z_][A-Za-z0-9_]*))\[([^\]]+)\]/.exec(rest))) {
      out.push({ t: 'col', table: m[1] ?? m[2], col: m[3] });
      i += m[0].length;
      continue;
    }
    if ((m = /^\[([^\]]+)\]/.exec(rest))) {
      out.push({ t: 'meas', v: m[1] });
      i += m[0].length;
      continue;
    }
    if ((m = /^'([^']+)'/.exec(rest))) {
      out.push({ t: 'id', v: m[1] });
      i += m[0].length;
      continue;
    }
    if ((m = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(rest))) {
      out.push({ t: 'id', v: m[0] });
      i += m[0].length;
      continue;
    }
    if ((m = /^(<>|<=|>=|&&|\|\||[-+*/^&=<>(),{}])/.exec(rest))) {
      out.push({ t: 'op', v: m[0] });
      i += m[0].length;
      continue;
    }
    throw new DaxError(`Unexpected character "${ch}".`);
  }
  return out;
}

type Node =
  | { k: 'num'; v: number }
  | { k: 'str'; v: string }
  | { k: 'col'; table: string; col: string }
  | { k: 'meas'; name: string }
  | { k: 'id'; name: string }
  | { k: 'un'; e: Node }
  | { k: 'bin'; op: string; l: Node; r: Node }
  | { k: 'fn'; name: string; args: Node[] }
  | { k: 'set'; items: Node[] }
  | { k: 'let'; vars: { name: string; e: Node }[]; ret: Node };

const PREC: Record<string, number> = { '||': 1, '&&': 2, '=': 3, '<>': 3, '<': 3, '>': 3, '<=': 3, '>=': 3, '&': 4, '+': 5, '-': 5, '*': 6, '/': 6, '^': 7 };

function parse(src: string): Node {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => peek()?.t === 'op' && (peek() as { v: string }).v === v;
  const isId = (v: string) => peek()?.t === 'id' && (peek() as { v: string }).v.toUpperCase() === v;

  function expr(minPrec = 0): Node {
    let left = unary();
    for (;;) {
      const t = peek();
      if (!t || t.t !== 'op' || PREC[t.v] === undefined || PREC[t.v] < minPrec) break;
      p++;
      const right = expr(PREC[t.v] + (t.v === '^' ? 0 : 1));
      left = { k: 'bin', op: t.v, l: left, r: right };
    }
    return left;
  }
  function unary(): Node {
    if (isOp('-')) {
      p++;
      return { k: 'un', e: unary() };
    }
    return primary();
  }
  function primary(): Node {
    const t = toks[p++];
    if (!t) throw new DaxError('The expression ended unexpectedly.');
    if (t.t === 'num') return { k: 'num', v: t.v };
    if (t.t === 'str') return { k: 'str', v: t.v };
    if (t.t === 'col') return { k: 'col', table: t.table, col: t.col };
    if (t.t === 'meas') return { k: 'meas', name: t.v };
    if (t.t === 'op') {
      if (t.v === '(') {
        const e = expr();
        if (!isOp(')')) throw new DaxError('A closing bracket is missing.');
        p++;
        return e;
      }
      if (t.v === '{') {
        const items: Node[] = [];
        while (!isOp('}')) {
          items.push(expr());
          if (isOp(',')) p++;
          else if (!isOp('}')) throw new DaxError('Expected a comma or }.');
        }
        p++;
        return { k: 'set', items };
      }
      throw new DaxError(`Unexpected "${t.v}".`);
    }
    // identifier
    if (t.v.toUpperCase() === 'VAR') {
      const vars: { name: string; e: Node }[] = [];
      p--;
      while (isId('VAR')) {
        p++;
        const name = (toks[p++] as { v: string }).v;
        if (!isOp('=')) throw new DaxError('VAR needs an = sign.');
        p++;
        vars.push({ name, e: expr() });
      }
      if (!isId('RETURN')) throw new DaxError('VAR needs a RETURN.');
      p++;
      return { k: 'let', vars, ret: expr() };
    }
    if (isOp('(')) {
      p++;
      const args: Node[] = [];
      if (!isOp(')')) {
        for (;;) {
          args.push(expr());
          if (isOp(',')) {
            p++;
            continue;
          }
          break;
        }
      }
      if (!isOp(')')) throw new DaxError('A closing bracket is missing.');
      p++;
      return { k: 'fn', name: t.v.toUpperCase(), args };
    }
    return { k: 'id', name: t.v };
  }

  const e = expr();
  if (p < toks.length) throw new DaxError('Unexpected text at the end of the expression.');
  return e;
}

// --- evaluation -------------------------------------------------------------

const vkey = (v: E.Scalar) => (v === null ? '' : typeof v === 'number' ? String(v) : String(v));
const nOf = (v: DVal): number => {
  if (v === null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    const x = E.literal(v);
    if (typeof x === 'number') return x;
  }
  throw new DaxError('A number was expected here.');
};
const isTable = (v: DVal): v is TableVal => typeof v === 'object' && v !== null && 'rows' in v && 'table' in v;
const isColVal = (v: DVal): v is ColVal => typeof v === 'object' && v !== null && 'colRef' in v;
const dateSerial = (v: E.Scalar): number | null => (typeof v === 'number' ? v : typeof v === 'string' ? E.parseDateText(v) : null);
const ISO = (serial: number) => E.formatDate(serial, 'yyyy-mm-dd');

class Engine {
  constructor(public model: DaxModel) {}
  cache = new Map<string, number>();

  table(name: string): DaxTable {
    const key = Object.keys(this.model.tables).find((k) => k.toLowerCase() === name.toLowerCase());
    if (!key) throw new DaxError(`The table "${name}" was not found.`);
    return this.model.tables[key];
  }
  tname(name: string): string {
    const key = Object.keys(this.model.tables).find((k) => k.toLowerCase() === name.toLowerCase());
    if (!key) throw new DaxError(`The table "${name}" was not found.`);
    return key;
  }
  colIndex(table: string, col: string): number {
    const t = this.table(table);
    const i = t.cols.findIndex((c) => c.toLowerCase() === col.toLowerCase());
    if (i < 0) throw new DaxError(`The column "${table}[${col}]" was not found.`);
    return i;
  }
  refParts(r: string): { table: string; col: string } {
    const m = /^'?([^'[]+)'?\[([^\]]+)\]$/.exec(r.trim());
    if (!m) throw new DaxError(`"${r}" is not a column reference.`);
    return { table: this.tname(m[1]), col: m[2] };
  }

  /** Rows of `table` visible in the filter context (own filters, plus filters flowing down from related dimension tables). */
  visible(table: string, ctx: Ctx, seen = new Set<string>()): number[] {
    const t = this.table(table);
    seen.add(table);
    let rows = t.rows.map((_, i) => i);
    for (const [key, set] of ctx.col) {
      const { table: tn, col } = this.refParts(key);
      if (tn !== table) continue;
      const ci = this.colIndex(table, col);
      rows = rows.filter((i) => set.has(vkey(t.rows[i][ci])));
    }
    const rf = ctx.rowF.get(table);
    if (rf) rows = rows.filter((i) => rf.has(i));
    for (const rel of this.model.relationships) {
      const from = this.refParts(rel.from);
      if (from.table !== table) continue;
      const to = this.refParts(rel.to);
      if (seen.has(to.table)) continue;
      const constrained = [...ctx.col.keys()].some((k) => this.refParts(k).table === to.table) || ctx.rowF.has(to.table) || this.hasUpstream(to.table, ctx);
      if (!constrained) continue;
      const dimRows = this.visible(to.table, ctx, new Set(seen));
      const di = this.colIndex(to.table, to.col);
      const keys = new Set(dimRows.map((r) => vkey(this.table(to.table).rows[r][di])));
      const fi = this.colIndex(table, from.col);
      rows = rows.filter((i) => keys.has(vkey(t.rows[i][fi])));
    }
    return rows;
  }
  hasUpstream(table: string, ctx: Ctx): boolean {
    return this.model.relationships.some((rel) => {
      const from = this.refParts(rel.from);
      if (from.table !== table) return false;
      const to = this.refParts(rel.to);
      return [...ctx.col.keys()].some((k) => this.refParts(k).table === to.table) || ctx.rowF.has(to.table) || this.hasUpstream(to.table, ctx);
    });
  }

  colValues(c: ColVal['colRef'], ctx: Ctx): E.Scalar[] {
    const ci = this.colIndex(c.table, c.col);
    const t = this.table(c.table);
    return this.visible(c.table, ctx).map((i) => t.rows[i][ci]);
  }

  rowValue(table: string, col: string, ctx: Ctx): E.Scalar {
    const tn = this.tname(table);
    const ci = this.colIndex(tn, col);
    const r = ctx.row.get(tn);
    if (r === undefined) throw new DaxError(`"${tn}[${col}]" needs a row context. Use SUMX or another iterator.`);
    return this.table(tn).rows[r][ci];
  }

  related(table: string, col: string, ctx: Ctx): E.Scalar {
    const target = this.tname(table);
    const ci = this.colIndex(target, col);
    for (const [from, r] of ctx.row) {
      for (const rel of this.model.relationships) {
        const f = this.refParts(rel.from);
        const t = this.refParts(rel.to);
        if (f.table === from && t.table === target) {
          const key = vkey(this.table(from).rows[r][this.colIndex(from, f.col)]);
          const ti = this.colIndex(target, t.col);
          const hit = this.table(target).rows.find((row) => vkey(row[ti]) === key);
          return hit ? hit[ci] : null;
        }
      }
    }
    throw new DaxError('RELATED needs a relationship between these tables.');
  }

  ev(n: Node, ctx: Ctx): DVal {
    switch (n.k) {
      case 'num':
      case 'str':
        return n.v;
      case 'set':
        throw new DaxError('A list can only be used with IN.');
      case 'col': {
        const tn = this.tname(n.table);
        this.colIndex(tn, n.col);
        if (ctx.row.has(tn)) return this.rowValue(tn, n.col, ctx);
        return { colRef: { table: tn, col: n.col } };
      }
      case 'meas': {
        const key = Object.keys(this.model.measures).find((k) => k.toLowerCase() === n.name.toLowerCase());
        if (!key) throw new DaxError(`The measure or column [${n.name}] was not found.`);
        return this.scalar(this.ev(parse(this.model.measures[key]), ctx));
      }
      case 'id': {
        if (n.name in ctx.vars) return ctx.vars[n.name];
        const up = n.name.toUpperCase();
        if (up === 'TRUE') return true;
        if (up === 'FALSE') return false;
        const key = Object.keys(this.model.tables).find((k) => k.toLowerCase() === n.name.toLowerCase());
        if (key) return { table: key, rows: this.visible(key, ctx) };
        throw new DaxError(`"${n.name}" was not found.`);
      }
      case 'un':
        return -nOf(this.scalar(this.ev(n.e, ctx)));
      case 'let': {
        const c2 = { ...ctx, vars: { ...ctx.vars } };
        for (const v of n.vars) c2.vars[v.name] = this.ev(v.e, c2);
        return this.ev(n.ret, c2);
      }
      case 'bin': {
        if (n.op === 'IN') return null;
        if (n.op === '&&') return this.truthy(this.ev(n.l, ctx)) && this.truthy(this.ev(n.r, ctx));
        if (n.op === '||') return this.truthy(this.ev(n.l, ctx)) || this.truthy(this.ev(n.r, ctx));
        const l = this.scalar(this.ev(n.l, ctx));
        const r = this.scalar(this.ev(n.r, ctx));
        switch (n.op) {
          case '+':
            return nOf(l) + nOf(r);
          case '-':
            return nOf(l) - nOf(r);
          case '*':
            return nOf(l) * nOf(r);
          case '/':
            if (nOf(r) === 0) throw new DaxError('Division by zero. Use DIVIDE to handle it.');
            return nOf(l) / nOf(r);
          case '^':
            return nOf(l) ** nOf(r);
          case '&':
            return `${l ?? ''}${r ?? ''}`;
          default: {
            const a = typeof l === 'string' && typeof r === 'string' ? l.toLowerCase() : l;
            const b = typeof l === 'string' && typeof r === 'string' ? r.toLowerCase() : r;
            const x = a === null ? 0 : a;
            const y = b === null ? 0 : b;
            const lt = typeof x === 'number' && typeof y === 'number' ? x < y : String(x) < String(y);
            const eqv = x === y || (typeof x !== typeof y && String(x) === String(y));
            return n.op === '=' ? eqv : n.op === '<>' ? !eqv : n.op === '<' ? lt : n.op === '>' ? !lt && !eqv : n.op === '<=' ? lt || eqv : !lt;
          }
        }
      }
      case 'fn':
        return this.fn(n, ctx);
    }
  }

  truthy(v: DVal): boolean {
    const s = this.scalar(v);
    return s === true || (typeof s === 'number' && s !== 0);
  }

  scalar(v: DVal): E.Scalar {
    if (isTable(v)) {
      if (v.rows.length === 1 && this.table(v.table).cols.length === 1) return this.table(v.table).rows[v.rows[0]][0];
      throw new DaxError('A table cannot be used where a single value is expected.');
    }
    if (isColVal(v)) {
      const vals = [...new Set(this.colValues(v.colRef, { col: new Map(), rowF: new Map(), row: new Map(), vars: {} }).map(vkey))];
      throw new DaxError(`"${v.colRef.table}[${v.colRef.col}]" returns ${vals.length} values. Use an aggregation like SUM.`);
    }
    return v;
  }

  /** Rows of a table expression (a table name, FILTER, ALL ...). */
  tableOf(v: DVal): TableVal {
    if (isTable(v)) return v;
    throw new DaxError('A table was expected here.');
  }

  nums(v: DVal, ctx: Ctx): number[] {
    if (isColVal(v)) return this.colValues(v.colRef, ctx).map((x) => (typeof x === 'number' ? x : null)).filter((x): x is number => x !== null);
    throw new DaxError('A column such as Sales[Amount] was expected here.');
  }

  /** Applies one CALCULATE filter argument to a copy of the context. */
  applyFilter(arg: Node, ctx: Ctx): Ctx {
    const out: Ctx = { col: new Map(ctx.col), rowF: new Map(ctx.rowF), row: new Map(ctx.row), vars: ctx.vars };
    if (arg.k === 'fn') {
      const name = arg.name;
      if (name === 'ALL') {
        const a = arg.args[0];
        if (a?.k === 'col') out.col.delete(`${this.tname(a.table)}[${a.col}]`);
        else if (a?.k === 'id') {
          const t = this.tname(a.name);
          for (const k of [...out.col.keys()]) if (this.refParts(k).table === t) out.col.delete(k);
          out.rowF.delete(t);
        }
        return out;
      }
      if (name === 'FILTER' || name === 'VALUES') {
        const tv = this.tableOf(this.ev(arg, ctx));
        out.rowF.set(tv.table, new Set(tv.rows));
        return out;
      }
      if (name === 'SAMEPERIODLASTYEAR' || name === 'DATEADD' || name === 'DATESYTD' || name === 'PARALLELPERIOD') {
        const ref = arg.args[0];
        if (ref?.k !== 'col') throw new DaxError(`${name} needs a date column such as Calendar[Date].`);
        const tn = this.tname(ref.table);
        const key = `${tn}[${ref.col}]`;
        const ci = this.colIndex(tn, ref.col);
        const cal = this.table(tn);
        const visibleDates = this.visible(tn, ctx).map((i) => cal.rows[i][ci]).map(dateSerial).filter((d): d is number => d !== null);
        if (!visibleDates.length) return out;
        let keep: number[] = [];
        if (name === 'DATESYTD') {
          const last = Math.max(...visibleDates);
          const y = E.serialToParts(last).y;
          keep = cal.rows.map((r) => dateSerial(r[ci])).filter((d): d is number => d !== null && E.serialToParts(d).y === y && d <= last);
        } else {
          const n = name === 'SAMEPERIODLASTYEAR' ? -1 : nOf(this.scalar(this.ev(arg.args[1], ctx)));
          const unit = name === 'SAMEPERIODLASTYEAR' ? 'YEAR' : String((arg.args[2] as Node & { name?: string })?.name ?? (arg.args[2] as { v?: string })?.v ?? 'DAY').toUpperCase();
          const shift = (d: number): number => {
            if (unit === 'DAY') return d + n;
            const { y, m, d: day } = E.serialToParts(d);
            const months = unit === 'YEAR' ? n * 12 : unit === 'QUARTER' ? n * 3 : n;
            const t = y * 12 + (m - 1) + months;
            const ny = Math.floor(t / 12);
            const nm = (t % 12) + 1;
            const dim = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
            return E.dateToSerial(ny, nm, Math.min(day, dim));
          };
          keep = visibleDates.map(shift);
        }
        out.col.set(key, new Set(keep.map((d) => ISO(d))));
        // Other filters on the date table (year, month ...) no longer apply to a shifted period.
        for (const k of [...out.col.keys()]) if (k !== key && this.refParts(k).table === tn) out.col.delete(k);
        return out;
      }
    }
    // a boolean predicate on one column, such as Products[Category] = "Pens"
    const refs: { table: string; col: string }[] = [];
    const collect = (x: Node) => {
      if (x.k === 'col') refs.push({ table: this.tname(x.table), col: x.col });
      else if (x.k === 'bin') {
        collect(x.l);
        collect(x.r);
      } else if (x.k === 'un') collect(x.e);
      else if (x.k === 'fn') x.args.forEach(collect);
    };
    collect(arg);
    const uniq = [...new Set(refs.map((r) => `${r.table}[${r.col}]`))];
    if (uniq.length !== 1) throw new DaxError('A CALCULATE filter must refer to exactly one column. Use FILTER for more complex conditions.');
    const { table, col } = this.refParts(uniq[0]);
    const t = this.table(table);
    const ci = this.colIndex(table, col);
    const allowed = new Set<string>();
    const base: Ctx = { col: new Map(), rowF: new Map(), row: new Map(), vars: ctx.vars };
    t.rows.forEach((row, i) => {
      const c2: Ctx = { ...base, row: new Map([[table, i]]) };
      if (this.truthy(this.ev(arg, c2))) allowed.add(vkey(row[ci]));
    });
    out.col.set(uniq[0], allowed);
    return out;
  }

  fn(n: Extract<Node, { k: 'fn' }>, ctx: Ctx): DVal {
    const a = n.args;
    const e = (i: number) => this.ev(a[i], ctx);
    const s = (i: number) => this.scalar(e(i));
    const col = (i: number): ColVal['colRef'] => {
      const v = e(i);
      if (!isColVal(v)) throw new DaxError(`${n.name} needs a column such as Sales[Amount].`);
      return v.colRef;
    };
    const iterate = (tv: TableVal, body: Node): E.Scalar[] =>
      tv.rows.map((r) => {
        const c2: Ctx = { ...ctx, row: new Map([...ctx.row, [tv.table, r]]) };
        return this.scalar(this.ev(body, c2));
      });
    switch (n.name) {
      case 'SUM':
        return this.nums(e(0), ctx).reduce((x, y) => x + y, 0);
      case 'AVERAGE': {
        const v = this.nums(e(0), ctx);
        return v.length ? v.reduce((x, y) => x + y, 0) / v.length : null;
      }
      case 'MIN':
      case 'MAX': {
        if (a.length === 2) return n.name === 'MIN' ? Math.min(nOf(s(0)), nOf(s(1))) : Math.max(nOf(s(0)), nOf(s(1)));
        const v = this.nums(e(0), ctx);
        return v.length ? (n.name === 'MIN' ? Math.min(...v) : Math.max(...v)) : null;
      }
      case 'COUNT':
        return this.nums(e(0), ctx).length;
      case 'COUNTA':
        return this.colValues(col(0), ctx).filter((x) => x !== null && x !== '').length;
      case 'DISTINCTCOUNT':
        return new Set(this.colValues(col(0), ctx).map(vkey)).size;
      case 'COUNTROWS':
        return a.length ? this.tableOf(e(0)).rows.length : 0;
      case 'SUMX':
        return iterate(this.tableOf(e(0)), a[1]).reduce<number>((x, y) => x + (typeof y === 'number' ? y : 0), 0);
      case 'AVERAGEX': {
        const v = iterate(this.tableOf(e(0)), a[1]).filter((x): x is number => typeof x === 'number');
        return v.length ? v.reduce((x, y) => x + y, 0) / v.length : null;
      }
      case 'MAXX':
      case 'MINX': {
        const v = iterate(this.tableOf(e(0)), a[1]).filter((x): x is number => typeof x === 'number');
        return v.length ? (n.name === 'MAXX' ? Math.max(...v) : Math.min(...v)) : null;
      }
      case 'FILTER': {
        const tv = this.tableOf(e(0));
        return {
          table: tv.table,
          rows: tv.rows.filter((r) => {
            const c2: Ctx = { ...ctx, row: new Map([...ctx.row, [tv.table, r]]) };
            return this.truthy(this.ev(a[1], c2));
          }),
        };
      }
      case 'ALL': {
        const x = a[0];
        if (x?.k === 'id') {
          const t = this.tname(x.name);
          return { table: t, rows: this.table(t).rows.map((_, i) => i) };
        }
        throw new DaxError('ALL is used inside CALCULATE or with a table name.');
      }
      case 'VALUES': {
        const x = a[0];
        if (x?.k === 'col') return { colRef: { table: this.tname(x.table), col: x.col } };
        return this.ev(x, ctx);
      }
      case 'RELATED': {
        const x = a[0];
        if (x?.k !== 'col') throw new DaxError('RELATED needs a column reference.');
        return this.related(x.table, x.col, ctx);
      }
      case 'CALCULATE': {
        let c2 = ctx;
        for (let i = 1; i < a.length; i++) c2 = this.applyFilter(a[i], c2);
        return this.scalar(this.ev(a[0], c2));
      }
      case 'TOTALYTD': {
        const c2 = this.applyFilter({ k: 'fn', name: 'DATESYTD', args: [a[1]] }, ctx);
        return this.scalar(this.ev(a[0], c2));
      }
      case 'DIVIDE': {
        const d = nOf(s(1));
        if (d === 0) return a[2] ? s(2) : null;
        return nOf(s(0)) / d;
      }
      case 'IF':
        return this.truthy(e(0)) ? e(1) : a[2] ? e(2) : null;
      case 'SWITCH': {
        const target = a[0].k === 'id' && a[0].name.toUpperCase() === 'TRUE' ? true : s(0);
        let i = 1;
        for (; i + 1 < a.length; i += 2) {
          const cand = this.scalar(this.ev(a[i], ctx));
          if (cand === target || (typeof cand === 'number' && cand === Number(target))) return e(i + 1);
        }
        return i < a.length ? e(i) : null;
      }
      case 'AND':
        return this.truthy(e(0)) && this.truthy(e(1));
      case 'OR':
        return this.truthy(e(0)) || this.truthy(e(1));
      case 'NOT':
        return !this.truthy(e(0));
      case 'ISBLANK': {
        const v = s(0);
        return v === null || v === '';
      }
      case 'BLANK':
        return null;
      case 'TRUE':
        return true;
      case 'FALSE':
        return false;
      case 'ROUND': {
        const f = 10 ** nOf(s(1));
        return Math.round(nOf(s(0)) * f) / f;
      }
      case 'ABS':
        return Math.abs(nOf(s(0)));
      case 'INT':
        return Math.floor(nOf(s(0)));
      case 'YEAR':
      case 'MONTH':
      case 'DAY': {
        const d = dateSerial(s(0));
        if (d === null) throw new DaxError('A date was expected here.');
        const p = E.serialToParts(d);
        return n.name === 'YEAR' ? p.y : n.name === 'MONTH' ? p.m : p.d;
      }
      case 'SELECTEDVALUE': {
        const vals = [...new Set(this.colValues(col(0), ctx).map(vkey))];
        if (vals.length === 1) return this.colValues(col(0), ctx).find((x) => vkey(x) === vals[0]) ?? null;
        return a[1] ? s(1) : null;
      }
      case 'SAMEPERIODLASTYEAR':
      case 'DATEADD':
      case 'DATESYTD':
        throw new DaxError(`${n.name} must be used as a filter inside CALCULATE.`);
      default:
        throw new DaxError(`The function ${n.name} is not supported in these lessons.`);
    }
  }
}

const emptyCtx = (filters?: Record<string, string[]>): Ctx => ({
  col: new Map(Object.entries(filters ?? {}).map(([k, v]) => [k, new Set(v.map(String))])),
  rowF: new Map(),
  row: new Map(),
  vars: {},
});

/** Evaluates an expression or measure in an optional filter context, e.g. { "Products[Category]": ["Pens"] }. */
export function evalDax(model: DaxModel, expr: string, filters?: Record<string, string[]>): { value: E.Scalar; error?: string } {
  try {
    const eng = new Engine(model);
    const v = eng.scalar(eng.ev(parse(expr), emptyCtx(filters)));
    return { value: v };
  } catch (e) {
    return { value: null, error: e instanceof Error ? e.message : 'Invalid expression.' };
  }
}

export function evalMeasure(model: DaxModel, name: string, filters?: Record<string, string[]>) {
  return evalDax(model, `[${name}]`, filters);
}

/** Checks the syntax and that the expression can be evaluated with no filters. */
export function validateDax(model: DaxModel, expr: string): string | null {
  if (!expr.trim()) return 'Type an expression.';
  const r = evalDax(model, expr);
  return r.error ?? null;
}

/** One row per distinct value of `rowField`, plus a grand total, with each measure evaluated in that context. */
export function reportTable(model: DaxModel, rowField: string, measureNames: string[], filters?: Record<string, string[]>): { cols: string[]; rows: E.Scalar[][] } {
  const eng = new Engine(model);
  const { table, col } = eng.refParts(rowField);
  const ci = eng.colIndex(table, col);
  const values = eng.visible(table, emptyCtx(filters)).map((i) => eng.table(table).rows[i][ci]);
  const distinct = [...new Map(values.map((v) => [vkey(v), v])).values()].sort((x, y) => (typeof x === 'number' && typeof y === 'number' ? x - y : vkey(x).localeCompare(vkey(y))));
  const rows = distinct.map((v) => [v, ...measureNames.map((m) => evalMeasure(model, m, { ...filters, [`${table}[${col}]`]: [vkey(v)] }).value)]);
  rows.push(['Total', ...measureNames.map((m) => evalMeasure(model, m, filters).value)]);
  return { cols: [col, ...measureNames], rows };
}

/** Table and column names of a model, for pickers. */
export const modelColumns = (model: DaxModel): string[] => Object.entries(model.tables).flatMap(([t, tb]) => tb.cols.map((c) => `${t}[${c}]`));
