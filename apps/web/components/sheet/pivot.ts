// ---------------------------------------------------------------------------
// Pivot table engine: summarises a block of rows by one or two fields.
// ---------------------------------------------------------------------------
import * as E from './engine';

export type PivotAgg = 'sum' | 'count' | 'average' | 'max' | 'min';
export type ShowAs = 'value' | 'pctTotal' | 'pctRow' | 'pctCol';
export type PivotValue = { field: string; agg: PivotAgg; show?: ShowAs };
export type GroupBy = 'month' | 'quarter' | 'year' | { band: number };

export type PivotConfig = {
  /** A range label ("A1:D20") or a table name ("Table1"). The first row holds field names. */
  source: string;
  rows?: string;
  cols?: string;
  values: PivotValue[];
  /** Report filter: only rows where `field` equals `value`. */
  filter?: { field: string; value: string };
  /** Slicers: only rows whose field value is in the list. */
  slicers?: Record<string, string[]>;
  /** Group the Rows field (a date or a number). */
  group?: GroupBy;
  /** Calculated fields: name and a formula over other field names, e.g. "Revenue-Cost". */
  calc?: { name: string; formula: string }[];
};

export type PivotResult = {
  fields: string[];
  rowLabel: string;
  rowKeys: string[];
  colKeys: string[];
  /** Matrix [row][col]; null where the group has no data. */
  cells: (number | null)[][];
  rowTotals: (number | null)[];
  colTotals: (number | null)[];
  grand: number | null;
  /** True when the source rows match what the sheet holds right now. */
  rowCount: number;
};

type Row = Record<string, E.Scalar>;

export function aggLabel(a: PivotAgg) {
  return { sum: 'Sum', count: 'Count', average: 'Average', max: 'Max', min: 'Min' }[a];
}

/** Reads the source block into field names and row objects. */
export function readSource(data: E.SheetData, source: string): { fields: string[]; rows: Row[]; formats: Record<string, E.NumFmt | undefined> } {
  const t = data.tables?.find((x) => x.name.toLowerCase() === source.toLowerCase());
  const rc = E.parseRectLabel(t ? t.range : source);
  if (!rc) return { fields: [], rows: [], formats: {} };
  const ev = E.buildEvaluator(data);
  const fields: string[] = [];
  const formats: Record<string, E.NumFmt | undefined> = {};
  for (let c = rc.c1; c <= rc.c2; c++) {
    fields.push(String(ev.value(E.keyOf(c, rc.r1)) ?? '').trim() || `Column${c + 1}`);
    formats[fields[fields.length - 1]] = data.styles[E.keyOf(c, rc.r1 + 1)]?.fmt;
  }
  const last = t?.totals ? rc.r2 - 1 : rc.r2;
  const rows: Row[] = [];
  for (let r = rc.r1 + 1; r <= last; r++) {
    const row: Row = {};
    let any = false;
    fields.forEach((f, i) => {
      const v = ev.value(E.keyOf(rc.c1 + i, r));
      row[f] = v;
      if (v !== null && v !== '') any = true;
    });
    if (any) rows.push(row);
  }
  return { fields, rows, formats };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function groupKey(v: E.Scalar, by: GroupBy): { label: string; sort: number } {
  if (typeof v !== 'number') return { label: String(v ?? '(blank)'), sort: Number.MAX_SAFE_INTEGER };
  if (typeof by === 'object') {
    const lo = Math.floor(v / by.band) * by.band;
    return { label: `${lo}-${lo + by.band - 1}`, sort: lo };
  }
  const { y, m } = E.serialToParts(v);
  if (by === 'year') return { label: String(y), sort: y };
  if (by === 'quarter') return { label: `Q${Math.floor((m - 1) / 3) + 1} ${y}`, sort: y * 10 + Math.floor((m - 1) / 3) };
  return { label: `${MONTHS[m - 1]} ${y}`, sort: y * 100 + m };
}

function aggregate(vals: number[], agg: PivotAgg): number | null {
  if (agg === 'count') return vals.length;
  if (!vals.length) return null;
  if (agg === 'sum') return vals.reduce((a, b) => a + b, 0);
  if (agg === 'average') return vals.reduce((a, b) => a + b, 0) / vals.length;
  return agg === 'max' ? Math.max(...vals) : Math.min(...vals);
}

/** Sum of a calculated field (e.g. Revenue-Cost) over a set of rows, evaluated on the aggregated field sums. */
function calcValue(formula: string, rows: Row[], fields: string[]): number | null {
  const sums = new Map<string, number>();
  for (const f of fields) sums.set(f, rows.reduce((t, r) => t + (typeof r[f] === 'number' ? (r[f] as number) : 0), 0));
  const cells: Record<string, string> = {};
  let expr = formula;
  [...fields].sort((a, b) => b.length - a.length).forEach((f, i) => {
    const key = E.keyOf(0, i);
    cells[key] = String(sums.get(f) ?? 0);
    expr = expr.split(f).join(key);
  });
  const v = E.buildEvaluator({ ...E.emptyData(), cells }).evalFormula(`=${expr}`);
  return typeof v === 'number' ? v : null;
}

export function computePivot(data: E.SheetData, cfg: PivotConfig): PivotResult {
  const { fields: baseFields, rows: all } = readSource(data, cfg.source);
  const fields = [...baseFields, ...(cfg.calc ?? []).map((c) => c.name)];
  let rows = all;
  if (cfg.filter) rows = rows.filter((r) => String(r[cfg.filter?.field ?? ''] ?? '') === cfg.filter?.value);
  for (const [f, keep] of Object.entries(cfg.slicers ?? {})) rows = rows.filter((r) => keep.includes(String(r[f] ?? '')));

  const label = (row: Row, field: string | undefined, grouped: boolean): { label: string; sort: number } => {
    if (!field) return { label: 'Total', sort: 0 };
    const v = row[field];
    if (grouped && cfg.group) return groupKey(v, cfg.group);
    return { label: v === null ? '(blank)' : typeof v === 'number' ? E.fmtGeneral(v) : String(v), sort: typeof v === 'number' ? v : Number.MAX_SAFE_INTEGER };
  };

  const rowSet = new Map<string, number>();
  const colSet = new Map<string, number>();
  for (const r of rows) {
    const rk = label(r, cfg.rows, true);
    rowSet.set(rk.label, rk.sort);
    if (cfg.cols) {
      const ck = label(r, cfg.cols, false);
      colSet.set(ck.label, ck.sort);
    }
  }
  const order = (m: Map<string, number>) => [...m.entries()].sort((a, b) => (a[1] !== b[1] ? a[1] - b[1] : a[0].localeCompare(b[0]))).map(([k]) => k);
  const rowKeys = cfg.rows ? order(rowSet) : ['Total'];
  // Several value fields become columns (as in Excel); one value + a column field spreads that field across.
  const spread = !!cfg.cols && cfg.values.length === 1;
  const colKeys = !spread ? cfg.values.map((v) => (calcNames(cfg).includes(v.field) ? v.field : `${aggLabel(v.agg)} of ${v.field}`)) : order(colSet);

  const cellValue = (subset: Row[], v: PivotValue): number | null => {
    const calc = cfg.calc?.find((c) => c.name === v.field);
    if (calc) return calcValue(calc.formula, subset, baseFields);
    const nums = subset.map((r) => r[v.field]).filter((x): x is number => typeof x === 'number');
    if (v.agg === 'count') return subset.filter((r) => r[v.field] !== null && r[v.field] !== '').length;
    return aggregate(nums, v.agg);
  };

  const inRow = (r: Row, rk: string) => !cfg.rows || label(r, cfg.rows, true).label === rk;
  const inCol = (r: Row, ck: string) => !spread || label(r, cfg.cols, false).label === ck;

  const cells: (number | null)[][] = rowKeys.map((rk) =>
    colKeys.map((ck, ci) => cellValue(rows.filter((r) => inRow(r, rk) && inCol(r, ck)), spread ? cfg.values[0] : cfg.values[ci])),
  );
  // Row totals exist only when a column field spreads one value across; the Grand Total row always exists.
  const rowTotals = rowKeys.map((rk) => (spread ? cellValue(rows.filter((r) => inRow(r, rk)), cfg.values[0]) : null));
  const colTotals = colKeys.map((ck, ci) => cellValue(rows.filter((r) => inCol(r, ck)), spread ? cfg.values[0] : cfg.values[ci]));
  const grand = spread ? cellValue(rows, cfg.values[0]) : cfg.values.length === 1 ? colTotals[0] : null;

  const show = cfg.values[0]?.show ?? 'value';
  if (show !== 'value' && cfg.values.length === 1 && grand) {
    const div = (n: number | null, d: number | null) => (n === null || !d ? null : n / d);
    const out = cells.map((row, ri) =>
      row.map((v, ci) => div(v, show === 'pctTotal' ? grand : show === 'pctRow' ? (rowTotals[ri] ?? grand) : colTotals[ci])),
    );
    return {
      fields,
      rowLabel: cfg.rows ?? '',
      rowKeys,
      colKeys,
      cells: out,
      rowTotals: rowTotals.map((v) => (v === null ? null : show === 'pctRow' ? 1 : div(v, grand))),
      colTotals: colTotals.map((v) => (show === 'pctCol' ? 1 : div(v, grand))),
      grand: 1,
      rowCount: rows.length,
    };
  }
  return { fields, rowLabel: cfg.rows ?? '', rowKeys, colKeys, cells, rowTotals, colTotals, grand, rowCount: rows.length };
}

const calcNames = (cfg: PivotConfig) => (cfg.calc ?? []).map((c) => c.name);

/** Looks up one cell of a computed pivot by labels. */
export function pivotCell(res: PivotResult, rowKey: string, colKey?: string): number | null {
  const ri = res.rowKeys.findIndex((k) => k.toLowerCase() === rowKey.toLowerCase());
  if (ri < 0) return null;
  if (colKey === undefined) {
    return res.rowTotals[ri] ?? (res.cells[ri].length === 1 ? res.cells[ri][0] : null);
  }
  const ci = res.colKeys.findIndex((k) => k.toLowerCase() === colKey.toLowerCase());
  return ci < 0 ? null : res.cells[ri][ci];
}
