// ---------------------------------------------------------------------------
// Data tools for the practice sheet: tables, sort, filter, remove duplicates,
// text to columns, find & replace, flash fill, goal seek, data tables.
// Pure functions over SheetData, so they can be unit tested without React.
// ---------------------------------------------------------------------------
import * as E from './engine';

type D = E.SheetData;

const blank = (v: string | undefined) => v === undefined || v.trim() === '';

// --- regions & tables -------------------------------------------------------

/** The block of connected filled cells around `pos`, like Ctrl+A on a table. */
export function currentRegion(data: D, pos: E.Pos): E.Rect | null {
  const filled = (c: number, r: number) => E.inBounds(c, r) && !blank(data.cells[E.keyOf(c, r)]);
  if (!filled(pos.c, pos.r)) return null;
  const seen = new Set<string>([`${pos.c},${pos.r}`]);
  const queue: E.Pos[] = [pos];
  let rc: E.Rect = { c1: pos.c, r1: pos.r, c2: pos.c, r2: pos.r };
  while (queue.length) {
    const p = queue.pop() as E.Pos;
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        const c = p.c + dc;
        const r = p.r + dr;
        if (!filled(c, r) || seen.has(`${c},${r}`)) continue;
        seen.add(`${c},${r}`);
        queue.push({ c, r });
        rc = { c1: Math.min(rc.c1, c), r1: Math.min(rc.r1, r), c2: Math.max(rc.c2, c), r2: Math.max(rc.r2, r) };
      }
    }
  }
  return rc;
}

export function tableRect(t: E.TableDef): E.Rect | null {
  return E.parseRectLabel(t.range);
}

export function tableAt(data: D, pos: E.Pos): E.TableDef | null {
  for (const t of data.tables ?? []) {
    const rc = tableRect(t);
    if (rc && pos.c >= rc.c1 && pos.c <= rc.c2 && pos.r >= rc.r1 && pos.r <= rc.r2) return t;
  }
  return null;
}

/** Turns a range (header row first) into a table. */
export function makeTable(data: D, rect: E.Rect, name?: string): D {
  const taken = new Set((data.tables ?? []).map((t) => t.name.toLowerCase()));
  let n = 1;
  while (taken.has(`table${n}`)) n++;
  const finalName = name && !taken.has(name.toLowerCase()) ? name : `Table${n}`;
  return { ...data, tables: [...(data.tables ?? []), { name: finalName, range: E.rectLabel(rect) }] };
}

/** Adds or removes the totals row of a table (a SUBTOTAL under each numeric column). */
export function setTotalsRow(data: D, name: string, on: boolean): D {
  const t = data.tables?.find((x) => x.name === name);
  const rc = t ? tableRect(t) : null;
  if (!t || !rc || !!t.totals === on) return data;
  const cells = { ...data.cells };
  let range: E.Rect;
  if (on) {
    const r = rc.r2 + 1;
    const ev = E.buildEvaluator(data);
    cells[E.keyOf(rc.c1, r)] = 'Total';
    for (let c = rc.c1 + 1; c <= rc.c2; c++) {
      const numeric = ev.value(E.keyOf(c, rc.r2)) !== null && typeof ev.value(E.keyOf(c, rc.r2)) === 'number';
      if (numeric) cells[E.keyOf(c, r)] = `=SUBTOTAL(109,${E.rectLabel({ c1: c, r1: rc.r1 + 1, c2: c, r2: rc.r2 })})`;
    }
    range = { ...rc, r2: r };
  } else {
    for (let c = rc.c1; c <= rc.c2; c++) delete cells[E.keyOf(c, rc.r2)];
    range = { ...rc, r2: rc.r2 - 1 };
  }
  return { ...data, cells, tables: (data.tables ?? []).map((x) => (x === t ? { ...x, range: E.rectLabel(range), totals: on } : x)) };
}

/** Grows a table when you type directly under it (or beside the header), and fills calculated columns. */
export function afterEdit(data: D, keys: string[]): D {
  let next = data;
  for (const key of keys) {
    const p = E.parseKey(key);
    if (!p || !next.tables?.length) continue;
    // 1. auto-expand
    const tables = (next.tables ?? []).map((t) => {
      const rc = tableRect(t);
      if (!rc || blank(next.cells[key])) return t;
      if (!t.totals && p.r === rc.r2 + 1 && p.c >= rc.c1 && p.c <= rc.c2) {
        // A new row: carry calculated columns (formulas in the row above) down into it.
        for (let c = rc.c1; c <= rc.c2; c++) {
          const above = next.cells[E.keyOf(c, rc.r2)];
          if (c !== p.c && blank(next.cells[E.keyOf(c, p.r)]) && above?.startsWith('=')) {
            next = { ...next, cells: { ...next.cells, [E.keyOf(c, p.r)]: E.adjustFormula(above, 0, 1) } };
          }
        }
        return { ...t, range: E.rectLabel({ ...rc, r2: p.r }) };
      }
      if (p.c === rc.c2 + 1 && p.r === rc.r1) return { ...t, range: E.rectLabel({ ...rc, c2: p.c }) };
      return t;
    });
    next = { ...next, tables };
    // 2. calculated column: a formula typed in one empty column fills the whole column
    const t = tableAt(next, p);
    const rc = t ? tableRect(t) : null;
    const raw = next.cells[key] ?? '';
    if (t && rc && raw.startsWith('=') && p.r > rc.r1) {
      const last = t.totals ? rc.r2 - 1 : rc.r2;
      const others: number[] = [];
      for (let r = rc.r1 + 1; r <= last; r++) if (r !== p.r) others.push(r);
      if (others.length && others.every((r) => blank(next.cells[E.keyOf(p.c, r)]))) {
        const cells = { ...next.cells };
        for (const r of others) cells[E.keyOf(p.c, r)] = E.adjustFormula(raw, 0, r - p.r);
        next = { ...next, cells };
      }
    }
  }
  return next;
}

// --- sorting ----------------------------------------------------------------

export type SortLevel = { col: number; asc: boolean };

function sortRank(v: E.Scalar): number {
  if (v === null || v === '') return 4;
  if (typeof v === 'number') return 0;
  if (typeof v === 'string') return 1;
  if (typeof v === 'boolean') return 2;
  return 3;
}

/** Sorts the rows of `rect` by one or more columns. Blanks always sink to the bottom. */
export function sortRows(data: D, rect: E.Rect, levels: SortLevel[], header: boolean): D {
  const first = rect.r1 + (header ? 1 : 0);
  if (first >= rect.r2 || !levels.length) return data;
  const ev = E.buildEvaluator(data);
  const rows: number[] = [];
  for (let r = first; r <= rect.r2; r++) rows.push(r);
  const cmp = (a: number, b: number) => {
    for (const lv of levels) {
      const va = ev.value(E.keyOf(lv.col, a));
      const vb = ev.value(E.keyOf(lv.col, b));
      const ra = sortRank(va);
      const rb = sortRank(vb);
      if (ra === 4 || rb === 4) {
        if (ra !== rb) return ra === 4 ? 1 : -1;
        continue;
      }
      let c = 0;
      if (ra !== rb) c = ra - rb;
      else if (typeof va === 'number' && typeof vb === 'number') c = va - vb;
      else c = String(va).toLowerCase().localeCompare(String(vb).toLowerCase());
      if (c !== 0) return lv.asc ? c : -c;
    }
    return a - b;
  };
  const sorted = [...rows].sort(cmp);
  const cells = { ...data.cells };
  const styles = { ...data.styles };
  sorted.forEach((oldR, i) => {
    const newR = first + i;
    for (let c = rect.c1; c <= rect.c2; c++) {
      const from = E.keyOf(c, oldR);
      const to = E.keyOf(c, newR);
      const raw = data.cells[from];
      if (blank(raw)) delete cells[to];
      else cells[to] = E.adjustFormula(raw as string, 0, newR - oldR);
      if (data.styles[from]) styles[to] = data.styles[from];
      else delete styles[to];
    }
  });
  return { ...data, cells, styles };
}

// --- filtering --------------------------------------------------------------

export function filterRect(f: E.FilterState): E.Rect | null {
  return E.parseRectLabel(f.range);
}

/** Distinct displayed values in a filter column (header excluded), sorted. */
export function uniqueValues(data: D, f: E.FilterState, col: number): string[] {
  const rc = filterRect(f);
  if (!rc) return [];
  const ev = E.buildEvaluator(data);
  const set = new Set<string>();
  for (let r = rc.r1 + 1; r <= rc.r2; r++) set.add(ev.display(E.keyOf(col, r)));
  return [...set].sort((a, b) => {
    const na = Number(a.replace(/[$,%]/g, ''));
    const nb = Number(b.replace(/[$,%]/g, ''));
    return !Number.isNaN(na) && !Number.isNaN(nb) && a !== '' && b !== '' ? na - nb : a.localeCompare(b);
  });
}

function passes(spec: E.FilterSpec, shown: string, v: E.Scalar): boolean {
  if (spec.values && !spec.values.includes(shown)) return false;
  if (spec.op && spec.val !== undefined && spec.val !== '') {
    const target = E.literal(spec.val);
    if (spec.op === 'contains') return shown.toLowerCase().includes(spec.val.toLowerCase());
    if (typeof v === 'number' && typeof target === 'number') {
      const d = v - target;
      return spec.op === '>' ? d > 0 : spec.op === '<' ? d < 0 : spec.op === '=' ? d === 0 : spec.op === '>=' ? d >= 0 : spec.op === '<=' ? d <= 0 : d !== 0;
    }
    const a = shown.toLowerCase();
    const b = spec.val.toLowerCase();
    return spec.op === '=' ? a === b : spec.op === '<>' ? a !== b : false;
  }
  return true;
}

/** Computes which rows are hidden for a filter. */
export function computeHidden(data: D, f: E.FilterState): number[] {
  const rc = filterRect(f);
  if (!rc) return [];
  const ev = E.buildEvaluator(data);
  const hidden: number[] = [];
  for (let r = rc.r1 + 1; r <= rc.r2; r++) {
    let ok = true;
    for (const [col, spec] of Object.entries(f.cols)) {
      const key = E.keyOf(Number(col), r);
      if (!passes(spec, ev.display(key), ev.value(key))) ok = false;
    }
    if (!ok) hidden.push(r);
  }
  return hidden;
}

/** Stores a filter and the rows it hides. Pass `undefined` to clear it. */
export function applyFilter(data: D, f: E.FilterState | undefined): D {
  if (!f) return { ...data, filter: undefined, hidden: undefined };
  const cols = Object.fromEntries(Object.entries(f.cols).filter(([, s]) => (s.values && s.values.length >= 0) || s.op));
  const state = { ...f, cols };
  return { ...data, filter: state, hidden: computeHidden(data, state) };
}

// --- duplicates, text to columns, find & replace ------------------------------

export function removeDuplicates(data: D, rect: E.Rect, cols: number[], header: boolean): { data: D; removed: number } {
  const first = rect.r1 + (header ? 1 : 0);
  const ev = E.buildEvaluator(data);
  const seen = new Set<string>();
  const keep: number[] = [];
  for (let r = first; r <= rect.r2; r++) {
    const k = cols.map((c) => ev.display(E.keyOf(c, r)).trim().toLowerCase()).join('\u0001');
    if (seen.has(k)) continue;
    seen.add(k);
    keep.push(r);
  }
  const cells = { ...data.cells };
  const styles = { ...data.styles };
  keep.forEach((oldR, i) => {
    const newR = first + i;
    for (let c = rect.c1; c <= rect.c2; c++) {
      const from = E.keyOf(c, oldR);
      const to = E.keyOf(c, newR);
      const raw = data.cells[from];
      if (blank(raw)) delete cells[to];
      else cells[to] = raw as string;
      if (data.styles[from]) styles[to] = data.styles[from];
      else delete styles[to];
    }
  });
  for (let r = first + keep.length; r <= rect.r2; r++) {
    for (let c = rect.c1; c <= rect.c2; c++) {
      delete cells[E.keyOf(c, r)];
      delete styles[E.keyOf(c, r)];
    }
  }
  return { data: { ...data, cells, styles }, removed: rect.r2 - first + 1 - keep.length };
}

export function textToColumns(data: D, col: number, r1: number, r2: number, delims: string[], consecutiveAsOne = false): D {
  if (!delims.length) return data;
  const esc = delims.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(`(?:${esc})${consecutiveAsOne ? '+' : ''}`);
  const cells = { ...data.cells };
  for (let r = r1; r <= r2; r++) {
    const raw = data.cells[E.keyOf(col, r)];
    if (blank(raw)) continue;
    const parts = (raw as string).split(re).map((p) => p.trim());
    parts.forEach((part, i) => {
      if (E.inBounds(col + i, r)) {
        if (part === '') delete cells[E.keyOf(col + i, r)];
        else cells[E.keyOf(col + i, r)] = part;
      }
    });
  }
  return { ...data, cells };
}

export function findReplace(
  data: D,
  find: string,
  replace: string,
  opts: { matchCase?: boolean; wholeCell?: boolean } = {},
): { data: D; count: number } {
  if (find === '') return { data, count: 0 };
  const esc = find.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  const flags = opts.matchCase ? 'g' : 'gi';
  const re = new RegExp(opts.wholeCell ? `^${esc}$` : esc, flags);
  const cells = { ...data.cells };
  let count = 0;
  for (const [k, raw] of Object.entries(data.cells)) {
    const matches = raw.match(re);
    if (!matches) continue;
    count += matches.length;
    cells[k] = raw.replace(re, replace);
  }
  return { data: { ...data, cells }, count };
}

// --- flash fill -------------------------------------------------------------

const SPLITS = [' ', ', ', ',', '@', '.', '-', '_', '/', '|'];
const proper = (s: string) => s.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (_m, a, b) => a + b.toUpperCase());
const CASES: ((s: string) => string)[] = [(s) => s, (s) => s.toUpperCase(), (s) => s.toLowerCase(), proper];

function candidates(): ((s: string) => string)[] {
  const base: ((s: string) => string)[] = [(s) => s.trim()];
  for (const d of SPLITS) {
    const toks = (s: string) => s.split(d).map((t) => t.trim()).filter(Boolean);
    for (let i = 0; i < 5; i++) base.push((s) => toks(s)[i] ?? '');
    base.push((s) => toks(s).slice(-1)[0] ?? '');
    base.push((s) => toks(s).slice(1).join(d.trim() ? d : ' '));
    base.push((s) => toks(s).slice(0, -1).join(d.trim() ? d : ' '));
    base.push((s) => toks(s).map((t) => t[0] ?? '').join(''));
    base.push((s) => {
      const t = toks(s);
      return t.length >= 2 ? `${t[1]} ${t[0]}` : '';
    });
    base.push((s) => {
      const t = toks(s);
      return t.length >= 2 ? `${t[0][0]}. ${t[t.length - 1]}` : '';
    });
    base.push((s) => {
      const t = toks(s);
      return t.length >= 2 ? `${t[1]}, ${t[0]}` : '';
    });
    base.push((s) => {
      const i = s.indexOf(d);
      return i < 0 ? '' : s.slice(0, i).trim();
    });
    base.push((s) => {
      const i = s.indexOf(d);
      return i < 0 ? '' : s.slice(i + d.length).trim();
    });
    base.push((s) => {
      const i = s.lastIndexOf(d);
      return i < 0 ? '' : s.slice(i + d.length).trim();
    });
  }
  for (let n = 1; n <= 8; n++) {
    base.push((s) => s.trim().slice(0, n));
    base.push((s) => s.trim().slice(-n));
  }
  base.push((s) => s.replace(/\D/g, ''));
  base.push((s) => s.replace(/[^A-Za-z]/g, ''));
  base.push((s) => s.replace(/\s+/g, ''));
  base.push((s) => s.replace(/[-\s().]/g, ''));
  const out: ((s: string) => string)[] = [];
  for (const b of base) for (const c of CASES) out.push((s) => c(b(s)));
  return out;
}

/**
 * Excel's Flash Fill (Ctrl+E): looks at the examples already typed above `row`
 * in column `col`, finds the text pattern that turns the cell to the left into
 * the example, and fills the rest of the column.
 */
export function flashFill(data: D, col: number, row: number): { data: D; filled: number } {
  const srcCol = col - 1;
  if (srcCol < 0) return { data, filled: 0 };
  const examples: { src: string; out: string }[] = [];
  let r = row - 1;
  while (r >= 0 && !blank(data.cells[E.keyOf(col, r)])) {
    examples.unshift({ src: data.cells[E.keyOf(srcCol, r)] ?? '', out: data.cells[E.keyOf(col, r)] ?? '' });
    r--;
  }
  // The active cell itself can be the example when it is already filled (Ctrl+E on the example row).
  const ev = E.buildEvaluator(data);
  const text = (c: number, rr: number) => {
    const raw = data.cells[E.keyOf(c, rr)] ?? '';
    return raw.startsWith('=') ? ev.display(E.keyOf(c, rr)) : raw;
  };
  let ex = examples.map((e, i) => ({ src: text(srcCol, row - examples.length + i), out: e.out }));
  const all = candidates();
  let rule: ((s: string) => string) | undefined;
  // The topmost non-blank cell is usually a header, so drop examples from the top until a rule fits.
  while (ex.length && !rule) {
    rule = all.find((fn) => ex.every((e) => fn(e.src) === e.out));
    if (!rule) ex = ex.slice(1);
  }
  if (!rule) return { data, filled: 0 };
  const cells = { ...data.cells };
  let filled = 0;
  for (let rr = row; E.inBounds(col, rr) && !blank(data.cells[E.keyOf(srcCol, rr)]); rr++) {
    const out = rule(text(srcCol, rr));
    if (out !== '') {
      cells[E.keyOf(col, rr)] = out;
      filled++;
    }
  }
  return { data: { ...data, cells }, filled };
}

// --- goal seek & data tables ----------------------------------------------------

const withCell = (data: D, key: string, value: number): D => ({ ...data, cells: { ...data.cells, [key]: String(value) } });
const numeric = (v: E.Scalar) => (typeof v === 'number' ? v : Number.NaN);

/** Finds the value of `changeKey` that makes `setKey` equal `target`. */
export function goalSeek(data: D, setKey: string, target: number, changeKey: string): { data: D; value: number; ok: boolean } {
  const f = (x: number) => numeric(E.buildEvaluator(withCell(data, changeKey, x)).value(setKey)) - target;
  const start = numeric(E.buildEvaluator(data).value(changeKey));
  let x0 = Number.isFinite(start) ? start : 0;
  let x1 = x0 === 0 ? 1 : x0 * 1.1;
  let f0 = f(x0);
  let f1 = f(x1);
  let x = x1;
  let ok = Math.abs(f0) < 1e-9;
  if (ok) x = x0;
  // Secant method
  for (let i = 0; i < 80 && !ok; i++) {
    if (!Number.isFinite(f0) || !Number.isFinite(f1) || f1 === f0) break;
    x = x1 - (f1 * (x1 - x0)) / (f1 - f0);
    const fx = f(x);
    if (!Number.isFinite(fx)) break;
    x0 = x1;
    f0 = f1;
    x1 = x;
    f1 = fx;
    if (Math.abs(fx) < 1e-9) ok = true;
  }
  if (!ok) {
    // Fall back to scanning for a sign change, then bisection.
    let lo = -1e6;
    let hi = 1e6;
    let flo = f(lo);
    const fhi = f(hi);
    if (Number.isFinite(flo) && Number.isFinite(fhi) && flo * fhi <= 0) {
      for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2;
        const fm = f(mid);
        if (Math.abs(fm) < 1e-9) {
          x = mid;
          ok = true;
          break;
        }
        if (flo * fm < 0) hi = mid;
        else {
          lo = mid;
          flo = fm;
        }
        x = mid;
      }
    }
  }
  const value = Number.parseFloat(x.toPrecision(12));
  return { data: ok ? withCell(data, changeKey, value) : data, value, ok };
}

/**
 * A what-if data table. Corner cell = top-left of `rect`. Two inputs: row values
 * across the top, column values down the left, formula in the corner. One input:
 * values down the left and formulas across the top (column input), or the reverse.
 */
export function dataTable(data: D, rect: E.Rect, rowInput: string | null, colInput: string | null): D {
  const cells = { ...data.cells };
  const evalWith = (overrides: Record<string, number>, key: string) => {
    const d: D = { ...data, cells: { ...data.cells } };
    for (const [k, v] of Object.entries(overrides)) d.cells[k] = String(v);
    const v = E.buildEvaluator(d).value(key);
    return typeof v === 'number' ? String(Number.parseFloat(v.toPrecision(12))) : String(v);
  };
  const num = (c: number, r: number) => numeric(E.buildEvaluator(data).value(E.keyOf(c, r)));
  if (rowInput && colInput) {
    const corner = E.keyOf(rect.c1, rect.r1);
    for (let r = rect.r1 + 1; r <= rect.r2; r++) {
      for (let c = rect.c1 + 1; c <= rect.c2; c++) {
        cells[E.keyOf(c, r)] = evalWith({ [rowInput]: num(c, rect.r1), [colInput]: num(rect.c1, r) }, corner);
      }
    }
  } else if (colInput) {
    for (let r = rect.r1 + 1; r <= rect.r2; r++) {
      for (let c = rect.c1 + 1; c <= rect.c2; c++) cells[E.keyOf(c, r)] = evalWith({ [colInput]: num(rect.c1, r) }, E.keyOf(c, rect.r1));
    }
  } else if (rowInput) {
    for (let r = rect.r1 + 1; r <= rect.r2; r++) {
      for (let c = rect.c1 + 1; c <= rect.c2; c++) cells[E.keyOf(c, r)] = evalWith({ [rowInput]: num(c, rect.r1) }, E.keyOf(rect.c1, r));
    }
  }
  return { ...data, cells };
}

// --- automation-course tools: custom formats, paste special, go to special ----------

const forEach = (rc: E.Rect, fn: (c: number, r: number, k: string) => void) => {
  for (let r = rc.r1; r <= rc.r2; r++) for (let c = rc.c1; c <= rc.c2; c++) fn(c, r, E.keyOf(c, r));
};
const valueText = (v: E.Scalar): string => {
  if (v === null) return '';
  if (v instanceof E.XlError) return v.code;
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return String(Number.parseFloat(v.toPrecision(12)));
  return v;
};

/** Applies (or clears, when `nf` is empty) a custom number format to a block. */
export function setNumberFormat(data: D, rect: E.Rect, nf: string): D {
  const styles = { ...data.styles };
  forEach(rect, (_c, _r, k) => {
    const cur = { ...styles[k] };
    if (nf.trim()) {
      cur.nf = nf;
      delete cur.fmt;
    } else delete cur.nf;
    if (Object.keys(cur).length) styles[k] = cur;
    else delete styles[k];
  });
  return { ...data, styles };
}

export type PasteWhat = 'all' | 'values' | 'formulas' | 'formats';
export type PasteOp = 'none' | 'add' | 'subtract' | 'multiply' | 'divide';
export type ClipLike = { rect: E.Rect; cells: Record<string, string>; styles: Record<string, E.Style> };

/** Paste Special: choose what to paste, an arithmetic operation, and whether to transpose. */
export function pasteSpecial(data: D, clip: ClipLike, dest: E.Rect, o: { what: PasteWhat; op: PasteOp; transpose: boolean; skipBlanks: boolean }): D {
  const src = clip.rect;
  const w = src.c2 - src.c1 + 1;
  const h = src.r2 - src.r1 + 1;
  // Values come from the sheet as it is now, so formulas paste as results.
  const ev = E.buildEvaluator(data);
  const cells = { ...data.cells };
  const styles = { ...data.styles };
  // The target block: the pasted shape, or the whole selection when it is a multiple of it (so one value can scale a range).
  const outW = o.transpose ? h : w;
  const outH = o.transpose ? w : h;
  const dw = dest.c2 - dest.c1 + 1;
  const dh = dest.r2 - dest.r1 + 1;
  const tileW = dw % outW === 0 ? dw : outW;
  const tileH = dh % outH === 0 ? dh : outH;
  for (let dr = 0; dr < tileH; dr++) {
    for (let dc = 0; dc < tileW; dc++) {
      const oc = dc % outW;
      const or = dr % outH;
      const sc = o.transpose ? or : oc;
      const sr = o.transpose ? oc : or;
      const sk = E.keyOf(src.c1 + sc, src.r1 + sr);
      const tc = dest.c1 + dc;
      const tr = dest.r1 + dr;
      if (!E.inBounds(tc, tr)) continue;
      const tk = E.keyOf(tc, tr);
      const raw = clip.cells[sk] ?? '';
      if (o.skipBlanks && blank(raw)) continue;
      if (o.what === 'formats') {
        if (clip.styles[sk]) styles[tk] = clip.styles[sk];
        else delete styles[tk];
        continue;
      }
      const isF = raw.startsWith('=');
      const srcVal = isF ? ev.value(sk) : null;
      let text = o.what === 'values' ? (isF ? valueText(srcVal) : raw) : isF ? E.adjustFormula(raw, tc - (src.c1 + sc), tr - (src.r1 + sr)) : raw;
      if (o.op !== 'none') {
        const a = ev.value(tk);
        const b = isF ? srcVal : Number(raw);
        const x = typeof a === 'number' ? a : a === null ? 0 : Number.NaN;
        const y = typeof b === 'number' ? b : Number(b);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          const r = o.op === 'add' ? x + y : o.op === 'subtract' ? x - y : o.op === 'multiply' ? x * y : y === 0 ? Number.NaN : x / y;
          text = Number.isFinite(r) ? valueText(r) : '#DIV/0!';
        }
      }
      if (blank(text)) delete cells[tk];
      else cells[tk] = text;
      if (o.what === 'all' && o.op === 'none') {
        if (clip.styles[sk]) styles[tk] = clip.styles[sk];
        else delete styles[tk];
      }
    }
  }
  return afterEdit({ ...data, cells, styles }, Object.keys(cells));
}

/** Go To Special → Blanks: fill empty cells with the value above, or a fixed value. */
export function fillBlanks(data: D, rect: E.Rect, how: 'above' | 'value', value = ''): D {
  const cells = { ...data.cells };
  for (let c = rect.c1; c <= rect.c2; c++) {
    for (let r = rect.r1; r <= rect.r2; r++) {
      const k = E.keyOf(c, r);
      if (!blank(cells[k])) continue;
      if (how === 'value') cells[k] = value;
      else if (r > rect.r1) cells[k] = `=${E.keyOf(c, r - 1)}`;
    }
  }
  return { ...data, cells };
}
/** Go To Special → Constants: clear typed values and keep the formulas. */
export function clearConstants(data: D, rect: E.Rect): D {
  const cells = { ...data.cells };
  forEach(rect, (_c, _r, k) => {
    if (!blank(cells[k]) && !cells[k].startsWith('=')) delete cells[k];
  });
  return { ...data, cells };
}
/** Go To Special → Formulas, then Paste Values: freeze formulas into their results. */
export function formulasToValues(data: D, rect: E.Rect): D {
  const ev = E.buildEvaluator(data);
  const cells = { ...data.cells };
  forEach(rect, (_c, _r, k) => {
    if (cells[k]?.startsWith('=')) {
      const t = valueText(ev.value(k));
      if (blank(t)) delete cells[k];
      else cells[k] = t;
    }
  });
  return { ...data, cells };
}
/** Counts for the Go To Special dialog. */
export function countSpecial(data: D, rect: E.Rect): { blanks: number; formulas: number; constants: number } {
  let blanks = 0;
  let formulas = 0;
  let constants = 0;
  forEach(rect, (_c, _r, k) => {
    const raw = data.cells[k];
    if (blank(raw)) blanks++;
    else if (raw?.startsWith('=')) formulas++;
    else constants++;
  });
  return { blanks, formulas, constants };
}
