// ---------------------------------------------------------------------------
// A small Power Query engine: tables, a list of recorded steps, and joins.
// ---------------------------------------------------------------------------
import * as E from './engine';

export type PqType = 'number' | 'text' | 'date';
export type PqTable = { cols: string[]; rows: E.Scalar[][]; types?: Record<string, PqType> };
export type Cmp = '=' | '<>' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'isNull' | 'notNull';
export type JoinKind = 'left' | 'right' | 'inner' | 'full' | 'leftAnti' | 'rightAnti';
export type AggOp = 'sum' | 'count' | 'average' | 'min' | 'max';

export type PqStep =
  | { op: 'source'; file: string }
  | { op: 'combineFolder'; folder: string }
  | { op: 'promoteHeaders' }
  | { op: 'changeType'; col: string; to: PqType }
  | { op: 'transformText'; cols: string[]; fn: 'trim' | 'clean' | 'upper' | 'lower' | 'proper' }
  | { op: 'replace'; col: string; find: string; with: string }
  | { op: 'splitColumn'; col: string; delimiter: string }
  | { op: 'filter'; col: string; cmp: Cmp; value?: string }
  | { op: 'removeErrors'; col: string }
  | { op: 'keepColumns'; cols: string[] }
  | { op: 'removeColumns'; cols: string[] }
  | { op: 'rename'; col: string; name: string }
  | { op: 'removeDuplicates'; cols: string[] }
  | { op: 'sort'; col: string; asc: boolean }
  | { op: 'fillDown'; col: string }
  | { op: 'addColumn'; name: string; formula: string }
  | { op: 'conditionalColumn'; name: string; col: string; cmp: Cmp; value: string; then: string; else: string }
  | { op: 'groupBy'; by: string[]; aggs: { name: string; col: string; agg: AggOp }[] }
  | { op: 'merge'; with: string; leftKey: string; rightKey: string; kind: JoinKind; expand: string[] }
  | { op: 'append'; with: string }
  | { op: 'unpivot'; cols: string[]; attr: string; value: string }
  | { op: 'unpivotOthers'; keep: string[]; attr: string; value: string }
  | { op: 'pivot'; attr: string; value: string; agg: AggOp }
  | { op: 'datePart'; col: string; part: 'year' | 'month' | 'day'; name: string };

export type PqEnv = {
  /** CSV text by file name. */
  files: Record<string, string>;
  /** File names inside each folder. */
  folders?: Record<string, string[]>;
  /** Results of other queries, for merge and append. */
  queries?: Record<string, PqTable>;
  /** Query parameters; a step value of "@Name" is replaced by the parameter. */
  params?: Record<string, string>;
};

export class PqError extends Error {}

const colIdx = (t: PqTable, name: string): number => {
  const i = t.cols.indexOf(name);
  if (i < 0) throw new PqError(`The column "${name}" was not found.`);
  return i;
};
const isNull = (v: E.Scalar) => v === null || v === '';
const text = (v: E.Scalar) => (v === null ? '' : v instanceof E.XlError ? v.code : typeof v === 'number' ? E.fmtGeneral(v) : String(v));
const num = (v: E.Scalar): number | null => {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return null;
  const x = E.literal(v);
  return typeof x === 'number' ? x : null;
};
const param = (env: PqEnv, v: string | undefined) => (v && v.startsWith('@') ? (env.params?.[v.slice(1)] ?? v) : (v ?? ''));

export function parseCsv(csv: string): E.Scalar[][] {
  const rows: E.Scalar[][] = [];
  for (const line of csv.replace(/\r/g, '').split('\n')) {
    if (line.trim() === '') continue;
    const cells: string[] = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ',') {
        cells.push(cur);
        cur = '';
      } else cur += ch;
    }
    cells.push(cur);
    rows.push(cells.map((c) => (c === '' ? null : c)));
  }
  return rows;
}

const fromCsv = (csv: string): PqTable => {
  const rows = parseCsv(csv);
  const width = Math.max(0, ...rows.map((r) => r.length));
  return { cols: Array.from({ length: width }, (_, i) => `Column${i + 1}`), rows: rows.map((r) => Array.from({ length: width }, (_, i) => r[i] ?? null)) };
};

const aggregate = (vals: E.Scalar[], agg: AggOp): E.Scalar => {
  if (agg === 'count') return vals.length;
  const nums = vals.map(num).filter((n): n is number => n !== null);
  if (!nums.length) return null;
  if (agg === 'sum') return nums.reduce((a, b) => a + b, 0);
  if (agg === 'average') return nums.reduce((a, b) => a + b, 0) / nums.length;
  return agg === 'min' ? Math.min(...nums) : Math.max(...nums);
};

const compareWith = (cell: E.Scalar, cmp: Cmp, raw: string): boolean => {
  if (cmp === 'isNull') return isNull(cell);
  if (cmp === 'notNull') return !isNull(cell);
  const a = num(cell);
  const b = num(raw);
  const useNum = a !== null && b !== null;
  const s = text(cell).toLowerCase();
  const t = raw.toLowerCase();
  switch (cmp) {
    case '=':
      return useNum ? a === b : s === t;
    case '<>':
      return useNum ? a !== b : s !== t;
    case '>':
      return useNum ? (a as number) > (b as number) : s > t;
    case '<':
      return useNum ? (a as number) < (b as number) : s < t;
    case '>=':
      return useNum ? (a as number) >= (b as number) : s >= t;
    case '<=':
      return useNum ? (a as number) <= (b as number) : s <= t;
    case 'contains':
      return s.includes(t);
    default:
      return s.startsWith(t);
  }
};

const proper = (s: string) => s.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (_m, a, b) => a + b.toUpperCase());
const unique = (name: string, taken: string[]) => {
  let n = name;
  let i = 1;
  while (taken.includes(n)) n = `${name}.${i++}`;
  return n;
};

/** Applies one step to a table. */
export function applyStep(t: PqTable | null, step: PqStep, env: PqEnv): PqTable {
  if (step.op === 'source') {
    const csv = env.files[step.file];
    if (csv === undefined) throw new PqError(`The file "${step.file}" was not found.`);
    return fromCsv(csv);
  }
  if (step.op === 'combineFolder') {
    const names = env.folders?.[step.folder];
    if (!names) throw new PqError(`The folder "${step.folder}" was not found.`);
    const parts = names.map((n) => {
      const tb = fromCsv(env.files[n] ?? '');
      const header = tb.rows[0] ?? [];
      return { name: n, cols: header.map((h, i) => text(h) || `Column${i + 1}`), rows: tb.rows.slice(1) };
    });
    const cols = ['Source.Name', ...new Set(parts.flatMap((p) => p.cols))];
    return { cols, rows: parts.flatMap((p) => p.rows.map((r) => cols.map((c) => (c === 'Source.Name' ? p.name : (r[p.cols.indexOf(c)] ?? null))))) };
  }
  if (!t) throw new PqError('Start with a data source.');
  const types = { ...t.types };
  switch (step.op) {
    case 'promoteHeaders': {
      const head = t.rows[0] ?? [];
      const cols: string[] = [];
      head.forEach((h, i) => cols.push(unique(text(h).trim() || `Column${i + 1}`, cols)));
      return { cols, rows: t.rows.slice(1), types: {} };
    }
    case 'changeType': {
      const i = colIdx(t, step.col);
      const rows = t.rows.map((r) => {
        const v = r[i];
        if (isNull(v)) return r;
        let out: E.Scalar;
        if (step.to === 'number') out = num(typeof v === 'string' ? v.replace(/[\s$]/g, '') : v) ?? new E.XlError('#VALUE!');
        else if (step.to === 'date') {
          const d = typeof v === 'number' ? v : E.parseDateText(text(v));
          out = d === null ? new E.XlError('#VALUE!') : d;
        } else out = text(v);
        return r.map((x, j) => (j === i ? out : x));
      });
      types[step.col] = step.to;
      return { cols: t.cols, rows, types };
    }
    case 'transformText': {
      const idx = step.cols.map((c) => colIdx(t, c));
      const fn = (s: string) =>
        step.fn === 'trim' ? s.trim().replace(/\s+/g, ' ') : step.fn === 'clean' ? s.replace(/[\x00-\x1f]/g, '') : step.fn === 'upper' ? s.toUpperCase() : step.fn === 'lower' ? s.toLowerCase() : proper(s);
      return { ...t, rows: t.rows.map((r) => r.map((v, j) => (idx.includes(j) && typeof v === 'string' ? fn(v) : v))) };
    }
    case 'replace': {
      const i = colIdx(t, step.col);
      return { ...t, rows: t.rows.map((r) => r.map((v, j) => (j === i && typeof v === 'string' ? v.split(step.find).join(param(env, step.with)) : v))) };
    }
    case 'splitColumn': {
      const i = colIdx(t, step.col);
      const parts = t.rows.map((r) => (typeof r[i] === 'string' ? (r[i] as string).split(step.delimiter) : [r[i]]));
      const n = Math.max(1, ...parts.map((p) => p.length));
      const names = Array.from({ length: n }, (_, k) => `${step.col}.${k + 1}`);
      const cols = [...t.cols.slice(0, i), ...names, ...t.cols.slice(i + 1)];
      const rows = t.rows.map((r, ri) => [...r.slice(0, i), ...Array.from({ length: n }, (_, k) => (parts[ri][k] === undefined ? null : parts[ri][k] === '' ? null : (parts[ri][k] as E.Scalar))), ...r.slice(i + 1)]);
      return { cols, rows, types };
    }
    case 'filter': {
      const i = colIdx(t, step.col);
      const v = param(env, step.value);
      return { ...t, rows: t.rows.filter((r) => compareWith(r[i], step.cmp, v)) };
    }
    case 'removeErrors': {
      const i = colIdx(t, step.col);
      return { ...t, rows: t.rows.filter((r) => !(r[i] instanceof E.XlError)) };
    }
    case 'keepColumns':
    case 'removeColumns': {
      step.cols.forEach((c) => colIdx(t, c));
      const keep = t.cols.filter((c) => (step.op === 'keepColumns' ? step.cols.includes(c) : !step.cols.includes(c)));
      const idx = keep.map((c) => t.cols.indexOf(c));
      return { cols: keep, rows: t.rows.map((r) => idx.map((i) => r[i])), types };
    }
    case 'rename': {
      const i = colIdx(t, step.col);
      const cols = t.cols.map((c, j) => (j === i ? step.name : c));
      if (types[step.col]) {
        types[step.name] = types[step.col];
        delete types[step.col];
      }
      return { cols, rows: t.rows, types };
    }
    case 'removeDuplicates': {
      const idx = step.cols.map((c) => colIdx(t, c));
      const seen = new Set<string>();
      return { ...t, rows: t.rows.filter((r) => { const k = idx.map((i) => text(r[i])).join('\u0001'); if (seen.has(k)) return false; seen.add(k); return true; }) };
    }
    case 'sort': {
      const i = colIdx(t, step.col);
      const rows = t.rows.map((r, k) => ({ r, k })).sort((a, b) => {
        const x = a.r[i];
        const y = b.r[i];
        if (isNull(x) || isNull(y)) return isNull(x) === isNull(y) ? a.k - b.k : isNull(x) ? 1 : -1;
        const nx = num(x);
        const ny = num(y);
        const c = nx !== null && ny !== null ? nx - ny : text(x).toLowerCase().localeCompare(text(y).toLowerCase());
        return c !== 0 ? (step.asc ? c : -c) : a.k - b.k;
      });
      return { ...t, rows: rows.map((o) => o.r) };
    }
    case 'fillDown': {
      const i = colIdx(t, step.col);
      let last: E.Scalar = null;
      return { ...t, rows: t.rows.map((r) => { if (!isNull(r[i])) last = r[i]; return r.map((v, j) => (j === i ? last : v)); }) };
    }
    case 'addColumn': {
      const names = [...t.cols].sort((a, b) => b.length - a.length);
      const rows = t.rows.map((r) => {
        const cells: Record<string, string> = {};
        let expr = step.formula;
        names.forEach((n, k) => {
          const key = E.keyOf(k % 20, Math.floor(k / 20));
          const v = r[t.cols.indexOf(n)];
          if (v !== null && !(v instanceof E.XlError)) cells[key] = typeof v === 'number' ? String(v) : `${v}`.replace(/^=/, "'=");
          expr = expr.split(`[${n}]`).join(key);
        });
        // A step that uses a cell holding an error returns that error, as Power Query does.
        const bad = names.map((n) => r[t.cols.indexOf(n)]).find((v, k) => v instanceof E.XlError && step.formula.includes(`[${names[k]}]`));
        if (bad) return [...r, bad];
        return [...r, E.buildEvaluator({ ...E.emptyData(), cells }).evalFormula(`=${expr}`)];
      });
      return { cols: [...t.cols, step.name], rows, types };
    }
    case 'conditionalColumn': {
      const i = colIdx(t, step.col);
      const v = param(env, step.value);
      return { cols: [...t.cols, step.name], rows: t.rows.map((r) => [...r, compareWith(r[i], step.cmp, v) ? (num(step.then) ?? step.then) : (num(step.else) ?? step.else)]), types };
    }
    case 'groupBy': {
      const by = step.by.map((c) => colIdx(t, c));
      const groups = new Map<string, E.Scalar[][]>();
      for (const r of t.rows) {
        const k = by.map((i) => text(r[i])).join('\u0001');
        groups.set(k, [...(groups.get(k) ?? []), r]);
      }
      const rows = [...groups.values()].map((g) => [...by.map((i) => g[0][i]), ...step.aggs.map((a) => aggregate(g.map((r) => r[colIdx(t, a.col)]), a.agg))]);
      return { cols: [...step.by, ...step.aggs.map((a) => a.name)], rows, types: {} };
    }
    case 'merge': {
      const R = env.queries?.[step.with];
      if (!R) throw new PqError(`The query "${step.with}" was not found.`);
      const li = colIdx(t, step.leftKey);
      const ri = colIdx(R, step.rightKey);
      const expand = step.expand.map((c) => colIdx(R, c));
      const names = step.expand.map((c) => unique(t.cols.includes(c) ? `${step.with}.${c}` : c, t.cols));
      const key = (v: E.Scalar) => text(v);
      const rightFor = (v: E.Scalar) => R.rows.filter((rr) => !isNull(v) && key(rr[ri]) === key(v));
      const blank = expand.map(() => null as E.Scalar);
      const out: E.Scalar[][] = [];
      const matchedRight = new Set<number>();
      for (const lr of t.rows) {
        const matches = rightFor(lr[li]);
        matches.forEach((m) => matchedRight.add(R.rows.indexOf(m)));
        if (step.kind === 'leftAnti') {
          if (!matches.length) out.push([...lr, ...blank]);
        } else if (step.kind === 'rightAnti') {
          // handled below
        } else if (matches.length) {
          for (const m of matches) out.push([...lr, ...expand.map((i) => m[i])]);
        } else if (step.kind === 'left' || step.kind === 'full') out.push([...lr, ...blank]);
      }
      if (step.kind === 'right' || step.kind === 'full' || step.kind === 'rightAnti') {
        R.rows.forEach((rr, k) => {
          if (matchedRight.has(k)) {
            if (step.kind === 'right') {
              // already added via left rows
            }
            return;
          }
          const row = t.cols.map((_, c) => (c === li ? rr[ri] : null));
          out.push([...row, ...expand.map((i) => rr[i])]);
        });
      }
      const cols = step.kind === 'leftAnti' || step.kind === 'rightAnti' ? [...t.cols, ...names] : [...t.cols, ...names];
      return { cols, rows: out, types };
    }
    case 'append': {
      const B = env.queries?.[step.with];
      if (!B) throw new PqError(`The query "${step.with}" was not found.`);
      const cols = [...new Set([...t.cols, ...B.cols])];
      const pick = (tb: PqTable) => tb.rows.map((r) => cols.map((c) => (tb.cols.includes(c) ? r[tb.cols.indexOf(c)] : null)));
      return { cols, rows: [...pick(t), ...pick(B)], types };
    }
    case 'unpivot':
    case 'unpivotOthers': {
      const un = step.op === 'unpivot' ? step.cols : t.cols.filter((c) => !step.keep.includes(c));
      const keep = t.cols.filter((c) => !un.includes(c));
      const kIdx = keep.map((c) => t.cols.indexOf(c));
      const rows: E.Scalar[][] = [];
      for (const r of t.rows) for (const c of un) rows.push([...kIdx.map((i) => r[i]), c, r[colIdx(t, c)]]);
      return { cols: [...keep, step.attr, step.value], rows, types: {} };
    }
    case 'pivot': {
      const ai = colIdx(t, step.attr);
      const vi = colIdx(t, step.value);
      const keepCols = t.cols.filter((_, i) => i !== ai && i !== vi);
      const kIdx = keepCols.map((c) => t.cols.indexOf(c));
      const attrs = [...new Set(t.rows.map((r) => text(r[ai])))];
      const groups = new Map<string, E.Scalar[][]>();
      for (const r of t.rows) {
        const k = kIdx.map((i) => text(r[i])).join('\u0001');
        groups.set(k, [...(groups.get(k) ?? []), r]);
      }
      const rows = [...groups.values()].map((g) => [...kIdx.map((i) => g[0][i]), ...attrs.map((a) => aggregate(g.filter((r) => text(r[ai]) === a).map((r) => r[vi]), step.agg))]);
      return { cols: [...keepCols, ...attrs], rows, types: {} };
    }
    case 'datePart': {
      const i = colIdx(t, step.col);
      return {
        cols: [...t.cols, step.name],
        rows: t.rows.map((r) => {
          const d = typeof r[i] === 'number' ? (r[i] as number) : E.parseDateText(text(r[i]));
          if (d === null) return [...r, new E.XlError('#VALUE!')];
          const p = E.serialToParts(d);
          return [...r, step.part === 'year' ? p.y : step.part === 'month' ? p.m : p.d];
        }),
        types,
      };
    }
    default:
      return t;
  }
}

/** Runs recorded steps in order. `upTo` is the number of steps to run (for previewing an earlier step). */
export function runSteps(steps: PqStep[], env: PqEnv, upTo = steps.length): { table: PqTable | null; error?: string; failedAt?: number } {
  let t: PqTable | null = null;
  for (let i = 0; i < Math.min(upTo, steps.length); i++) {
    try {
      t = applyStep(t, steps[i], env);
    } catch (e) {
      return { table: t, error: e instanceof Error ? e.message : 'Step failed', failedAt: i };
    }
  }
  return { table: t };
}

/** Evaluates every query, resolving merge/append references in dependency order. */
export function runAll(queries: Record<string, PqStep[]>, env: PqEnv): Record<string, { table: PqTable | null; error?: string }> {
  const out: Record<string, { table: PqTable | null; error?: string }> = {};
  const state: Record<string, 'running' | 'done'> = {};
  const go = (name: string): { table: PqTable | null; error?: string } => {
    if (out[name] && state[name] === 'done') return out[name];
    if (state[name] === 'running') return { table: null, error: 'Circular reference between queries.' };
    state[name] = 'running';
    const steps = queries[name] ?? [];
    const deps: Record<string, PqTable> = {};
    for (const s of steps) if ((s.op === 'merge' || s.op === 'append') && queries[s.with]) deps[s.with] = go(s.with).table ?? { cols: [], rows: [] };
    out[name] = runSteps(steps, { ...env, queries: { ...env.queries, ...deps } });
    state[name] = 'done';
    return out[name];
  };
  for (const n of Object.keys(queries)) go(n);
  return out;
}

/** Converts a table to sheet cells starting at `origin` (header row first). */
export function tableToCells(t: PqTable, origin = 'A1'): Record<string, string> {
  const p = E.parseKey(origin) ?? { c: 0, r: 0 };
  const cells: Record<string, string> = {};
  t.cols.forEach((c, i) => (cells[E.keyOf(p.c + i, p.r)] = c));
  t.rows.forEach((row, ri) =>
    row.forEach((v, ci) => {
      if (v === null || v instanceof E.XlError) return;
      const col = t.cols[ci];
      cells[E.keyOf(p.c + ci, p.r + 1 + ri)] = t.types?.[col] === 'date' && typeof v === 'number' ? E.formatDate(v, 'yyyy-mm-dd') : typeof v === 'number' ? String(v) : String(v);
    }),
  );
  return cells;
}

/** Human-readable label for the Applied Steps list. */
export function stepLabel(s: PqStep): string {
  switch (s.op) {
    case 'source':
      return `Source: ${s.file}`;
    case 'combineFolder':
      return `Combine files in ${s.folder}`;
    case 'promoteHeaders':
      return 'Promoted Headers';
    case 'changeType':
      return `Changed Type: ${s.col} to ${s.to}`;
    case 'transformText':
      return `${s.fn[0].toUpperCase()}${s.fn.slice(1)} text: ${s.cols.join(', ')}`;
    case 'replace':
      return `Replaced "${s.find}" in ${s.col}`;
    case 'splitColumn':
      return `Split ${s.col} by "${s.delimiter}"`;
    case 'filter':
      return `Filtered Rows: ${s.col} ${s.cmp}${s.value !== undefined && s.value !== '' ? ` ${s.value}` : ''}`;
    case 'removeErrors':
      return `Removed Errors: ${s.col}`;
    case 'keepColumns':
      return `Kept Columns: ${s.cols.join(', ')}`;
    case 'removeColumns':
      return `Removed Columns: ${s.cols.join(', ')}`;
    case 'rename':
      return `Renamed ${s.col} to ${s.name}`;
    case 'removeDuplicates':
      return `Removed Duplicates: ${s.cols.join(', ')}`;
    case 'sort':
      return `Sorted by ${s.col} ${s.asc ? 'ascending' : 'descending'}`;
    case 'fillDown':
      return `Filled Down: ${s.col}`;
    case 'addColumn':
      return `Added Column: ${s.name}`;
    case 'conditionalColumn':
      return `Added Conditional Column: ${s.name}`;
    case 'groupBy':
      return `Grouped by ${s.by.join(', ')}`;
    case 'merge':
      return `Merged with ${s.with} (${s.kind})`;
    case 'append':
      return `Appended ${s.with}`;
    case 'unpivot':
      return `Unpivoted ${s.cols.join(', ')}`;
    case 'unpivotOthers':
      return `Unpivoted other columns (kept ${s.keep.join(', ')})`;
    case 'pivot':
      return `Pivoted ${s.attr}`;
    case 'datePart':
      return `Extracted ${s.part} from ${s.col}`;
  }
}
