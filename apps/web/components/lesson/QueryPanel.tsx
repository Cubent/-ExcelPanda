'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as E from '@/components/sheet/engine';
import { type PqEnv, type PqStep, type PqTable, runAll, runSteps, stepLabel } from '@/components/sheet/pq';

export type QueryConfig = {
  /** CSV text by file name. */
  files: Record<string, string>;
  folders?: Record<string, string[]>;
  /** Queries that already exist when the lesson opens. */
  initial?: Record<string, PqStep[]>;
  params?: Record<string, string>;
  /** Where Close & Load writes the result on the sheet (default A1). */
  loadTo?: string;
  /** Transform operations offered in the ribbon (default: all). */
  ops?: PqStep['op'][];
  /** Hide "Get data" (the lesson starts with queries already set up). */
  noGetData?: boolean;
};
export type QueryResult = { steps: PqStep[]; table: PqTable | null; error?: string };
export type QueryState = {
  queries: Record<string, QueryResult>;
  params: Record<string, string>;
  /** The table each query last loaded onto the sheet. */
  loaded: Record<string, PqTable>;
  /** True when a loaded query no longer matches what its steps now produce. */
  stale: boolean;
  selected: string;
};

type Op = PqStep['op'];
type Field = { key: string; label: string; kind: 'col' | 'cols' | 'text' | 'select' | 'otherCol' | 'otherCols'; options?: string[]; initial?: string };

const OPS: { op: Op; label: string; group: string }[] = [
  { op: 'promoteHeaders', label: 'Use first row as headers', group: 'Table' },
  { op: 'changeType', label: 'Change type', group: 'Column' },
  { op: 'transformText', label: 'Format text (trim, case)', group: 'Column' },
  { op: 'replace', label: 'Replace values', group: 'Column' },
  { op: 'splitColumn', label: 'Split column', group: 'Column' },
  { op: 'datePart', label: 'Extract date part', group: 'Column' },
  { op: 'rename', label: 'Rename column', group: 'Column' },
  { op: 'fillDown', label: 'Fill down', group: 'Column' },
  { op: 'addColumn', label: 'Add custom column', group: 'Add' },
  { op: 'conditionalColumn', label: 'Add conditional column', group: 'Add' },
  { op: 'filter', label: 'Filter rows', group: 'Rows' },
  { op: 'removeErrors', label: 'Remove errors', group: 'Rows' },
  { op: 'removeDuplicates', label: 'Remove duplicates', group: 'Rows' },
  { op: 'sort', label: 'Sort', group: 'Rows' },
  { op: 'keepColumns', label: 'Choose columns to keep', group: 'Columns' },
  { op: 'removeColumns', label: 'Remove columns', group: 'Columns' },
  { op: 'groupBy', label: 'Group by', group: 'Transform' },
  { op: 'unpivot', label: 'Unpivot selected columns', group: 'Transform' },
  { op: 'unpivotOthers', label: 'Unpivot other columns', group: 'Transform' },
  { op: 'pivot', label: 'Pivot column', group: 'Transform' },
  { op: 'merge', label: 'Merge queries', group: 'Combine' },
  { op: 'append', label: 'Append queries', group: 'Combine' },
];

const CMPS = ['=', '<>', '>', '<', '>=', '<=', 'contains', 'startsWith', 'isNull', 'notNull'];
const AGGS = ['sum', 'count', 'average', 'min', 'max'];

function fieldsFor(op: Op): Field[] {
  switch (op) {
    case 'changeType':
      return [{ key: 'col', label: 'Column', kind: 'col' }, { key: 'to', label: 'Type', kind: 'select', options: ['number', 'text', 'date'] }];
    case 'transformText':
      return [{ key: 'cols', label: 'Columns', kind: 'cols' }, { key: 'fn', label: 'Transform', kind: 'select', options: ['trim', 'clean', 'upper', 'lower', 'proper'] }];
    case 'replace':
      return [{ key: 'col', label: 'Column', kind: 'col' }, { key: 'find', label: 'Value to find', kind: 'text' }, { key: 'with', label: 'Replace with', kind: 'text' }];
    case 'splitColumn':
      return [{ key: 'col', label: 'Column', kind: 'col' }, { key: 'delimiter', label: 'Delimiter', kind: 'text', initial: ',' }];
    case 'datePart':
      return [{ key: 'col', label: 'Date column', kind: 'col' }, { key: 'part', label: 'Part', kind: 'select', options: ['year', 'month', 'day'] }, { key: 'name', label: 'New column name', kind: 'text' }];
    case 'rename':
      return [{ key: 'col', label: 'Column', kind: 'col' }, { key: 'name', label: 'New name', kind: 'text' }];
    case 'fillDown':
    case 'removeErrors':
      return [{ key: 'col', label: 'Column', kind: 'col' }];
    case 'addColumn':
      return [{ key: 'name', label: 'New column name', kind: 'text' }, { key: 'formula', label: 'Formula, e.g. [Units]*[Price]', kind: 'text' }];
    case 'conditionalColumn':
      return [
        { key: 'name', label: 'New column name', kind: 'text' },
        { key: 'col', label: 'If column', kind: 'col' },
        { key: 'cmp', label: 'is', kind: 'select', options: CMPS },
        { key: 'value', label: 'Value', kind: 'text' },
        { key: 'then', label: 'Then', kind: 'text' },
        { key: 'else', label: 'Otherwise', kind: 'text' },
      ];
    case 'filter':
      return [{ key: 'col', label: 'Column', kind: 'col' }, { key: 'cmp', label: 'Keep rows where it', kind: 'select', options: CMPS }, { key: 'value', label: 'Value (or @Parameter)', kind: 'text' }];
    case 'removeDuplicates':
    case 'keepColumns':
    case 'removeColumns':
      return [{ key: 'cols', label: 'Columns', kind: 'cols' }];
    case 'sort':
      return [{ key: 'col', label: 'Column', kind: 'col' }, { key: 'order', label: 'Order', kind: 'select', options: ['ascending', 'descending'] }];
    case 'groupBy':
      return [
        { key: 'by', label: 'Group by', kind: 'cols' },
        { key: 'name', label: 'New column name', kind: 'text' },
        { key: 'col', label: 'Of column', kind: 'col' },
        { key: 'agg', label: 'Operation', kind: 'select', options: AGGS },
      ];
    case 'unpivot':
      return [{ key: 'cols', label: 'Columns to unpivot', kind: 'cols' }, { key: 'attr', label: 'Attribute column name', kind: 'text', initial: 'Attribute' }, { key: 'value', label: 'Value column name', kind: 'text', initial: 'Value' }];
    case 'unpivotOthers':
      return [{ key: 'keep', label: 'Columns to keep', kind: 'cols' }, { key: 'attr', label: 'Attribute column name', kind: 'text', initial: 'Attribute' }, { key: 'value', label: 'Value column name', kind: 'text', initial: 'Value' }];
    case 'pivot':
      return [{ key: 'attr', label: 'Column to turn into headers', kind: 'col' }, { key: 'value', label: 'Values column', kind: 'col' }, { key: 'agg', label: 'Combine duplicates by', kind: 'select', options: AGGS }];
    case 'merge':
      return [
        { key: 'with', label: 'Merge with query', kind: 'select' },
        { key: 'leftKey', label: 'Matching column in this query', kind: 'col' },
        { key: 'rightKey', label: 'Matching column in the other query', kind: 'otherCol' },
        { key: 'kind', label: 'Join kind', kind: 'select', options: ['left', 'right', 'inner', 'full', 'leftAnti', 'rightAnti'] },
        { key: 'expand', label: 'Columns to bring in', kind: 'otherCols' },
      ];
    case 'append':
      return [{ key: 'with', label: 'Append query', kind: 'select' }];
    default:
      return [];
  }
}

const JOIN_LABEL: Record<string, string> = {
  left: 'left outer (keep all of this query)',
  right: 'right outer',
  inner: 'inner (only matches)',
  full: 'full outer (everything)',
  leftAnti: 'left anti (no match in other)',
  rightAnti: 'right anti',
};

function buildStep(op: Op, v: Record<string, string | string[]>): PqStep {
  const s = (k: string) => String(v[k] ?? '').trim();
  const a = (k: string) => (Array.isArray(v[k]) ? (v[k] as string[]) : []);
  switch (op) {
    case 'promoteHeaders':
      return { op };
    case 'changeType':
      return { op, col: s('col'), to: s('to') as 'number' };
    case 'transformText':
      return { op, cols: a('cols'), fn: s('fn') as 'trim' };
    case 'replace':
      return { op, col: s('col'), find: String(v.find ?? ''), with: String(v.with ?? '') };
    case 'splitColumn':
      return { op, col: s('col'), delimiter: String(v.delimiter ?? '') };
    case 'datePart':
      return { op, col: s('col'), part: s('part') as 'year', name: s('name') || `${s('col')}.${s('part')}` };
    case 'rename':
      return { op, col: s('col'), name: s('name') };
    case 'fillDown':
    case 'removeErrors':
      return { op, col: s('col') } as PqStep;
    case 'addColumn':
      return { op, name: s('name'), formula: s('formula') };
    case 'conditionalColumn':
      return { op, name: s('name'), col: s('col'), cmp: s('cmp') as '=', value: s('value'), then: s('then'), else: s('else') };
    case 'filter':
      return { op, col: s('col'), cmp: s('cmp') as '=', value: s('value') };
    case 'removeDuplicates':
    case 'keepColumns':
    case 'removeColumns':
      return { op, cols: a('cols') } as PqStep;
    case 'sort':
      return { op, col: s('col'), asc: s('order') !== 'descending' };
    case 'groupBy':
      return { op, by: a('by'), aggs: [{ name: s('name') || `${s('agg')} of ${s('col')}`, col: s('col'), agg: s('agg') as 'sum' }] };
    case 'unpivot':
      return { op, cols: a('cols'), attr: s('attr') || 'Attribute', value: s('value') || 'Value' };
    case 'unpivotOthers':
      return { op, keep: a('keep'), attr: s('attr') || 'Attribute', value: s('value') || 'Value' };
    case 'pivot':
      return { op, attr: s('attr'), value: s('value'), agg: s('agg') as 'sum' };
    case 'merge':
      return { op, with: s('with'), leftKey: s('leftKey'), rightKey: s('rightKey'), kind: s('kind') as 'left', expand: a('expand') };
    case 'append':
      return { op, with: s('with') };
    default:
      return { op: 'promoteHeaders' };
  }
}

const sel = 'h-8 w-full rounded-md border border-[#1F4D3A]/25 bg-white px-2 text-[13px] outline-none focus:border-[#1F4D3A]';
const fmtCell = (v: E.Scalar, type?: string) => (v === null ? '' : v instanceof E.XlError ? 'Error' : type === 'date' && typeof v === 'number' ? E.formatDate(v, 'yyyy-mm-dd') : typeof v === 'number' ? E.fmtGeneral(v) : String(v));

export function QueryPanel({
  config,
  onState,
  onLoad,
}: {
  config: QueryConfig;
  onState: (s: QueryState) => void;
  /** Writes a loaded table onto the sheet. */
  onLoad: (name: string, table: PqTable, origin: string, prev?: PqTable) => void;
}) {
  const [steps, setSteps] = useState<Record<string, PqStep[]>>(() => ({ ...config.initial }));
  const [selected, setSelected] = useState<string>(() => Object.keys(config.initial ?? {})[0] ?? '');
  const [upTo, setUpTo] = useState<number | null>(null);
  const [params, setParams] = useState<Record<string, string>>(config.params ?? {});
  const [loaded, setLoaded] = useState<Record<string, PqTable>>({});
  const [op, setOp] = useState<Op>('promoteHeaders');
  const [vals, setVals] = useState<Record<string, string | string[]>>({});
  const [msg, setMsg] = useState<string | null>(null);

  const env: PqEnv = useMemo(() => ({ files: config.files, folders: config.folders, params }), [config.files, config.folders, params]);
  const results = useMemo(() => runAll(steps, env), [steps, env]);
  const names = Object.keys(steps);
  const cur = results[selected];
  const stepList = steps[selected] ?? [];
  const showUpTo = upTo ?? stepList.length;
  const preview = useMemo(() => (selected ? runSteps(stepList, { ...env, queries: Object.fromEntries(Object.entries(results).map(([k, r]) => [k, r.table ?? { cols: [], rows: [] }])) }, showUpTo) : { table: null }), [selected, stepList, showUpTo, env, results]);
  const table = preview.table;
  const available = config.ops ? OPS.filter((o) => config.ops?.includes(o.op)) : OPS;
  const fields = fieldsFor(op);
  const others = names.filter((n) => n !== selected);
  const otherTable = (n: string) => results[n]?.table ?? null;

  const stale = Object.entries(loaded).some(([n, t]) => JSON.stringify(results[n]?.table?.rows) !== JSON.stringify(t.rows) || JSON.stringify(results[n]?.table?.cols) !== JSON.stringify(t.cols));
  const result: Record<string, QueryResult> = Object.fromEntries(names.map((n) => [n, { steps: steps[n], table: results[n]?.table ?? null, error: results[n]?.error }]));

  const onStateRef = useRef(onState);
  onStateRef.current = onState;
  useEffect(() => {
    onStateRef.current({ queries: result, params, loaded, stale, selected });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, params, loaded, stale, selected, env]);

  const addQuery = (kind: 'file' | 'folder', name: string) => {
    if (!name) return;
    let q = name.replace(/\.[^.]+$/, '');
    let i = 2;
    while (steps[q]) q = `${name.replace(/\.[^.]+$/, '')} (${i++})`;
    setSteps({ ...steps, [q]: [kind === 'file' ? { op: 'source', file: name } : { op: 'combineFolder', folder: name }] });
    setSelected(q);
    setUpTo(null);
    setMsg(null);
  };

  const apply = () => {
    const step = buildStep(op, vals);
    const test = runSteps([...stepList, step], { ...env, queries: Object.fromEntries(Object.entries(results).map(([k, r]) => [k, r.table ?? { cols: [], rows: [] }])) });
    if (test.error) return setMsg(test.error);
    setSteps({ ...steps, [selected]: [...stepList, step] });
    setUpTo(null);
    setVals({});
    setMsg(null);
  };

  const initialFor = (f: Field) => vals[f.key] ?? f.initial ?? (f.kind === 'cols' || f.kind === 'otherCols' ? [] : '');
  const colOptions = table?.cols ?? [];

  const fieldUi = (f: Field) => {
    const value = initialFor(f);
    const set = (x: string | string[]) => setVals({ ...vals, [f.key]: x });
    if (f.kind === 'text') return <input aria-label={f.label} className={sel} value={String(value)} onChange={(e) => set(e.target.value)} />;
    if (f.kind === 'cols' || f.kind === 'otherCols') {
      const options = f.kind === 'cols' ? colOptions : (otherTable(String(vals.with ?? ''))?.cols ?? []);
      return (
        <div className="flex max-h-24 flex-wrap gap-1 overflow-auto rounded-md border border-[#1F4D3A]/15 bg-white p-1.5" role="group" aria-label={f.label}>
          {options.map((c) => {
            const on = (value as string[]).includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => set(on ? (value as string[]).filter((x) => x !== c) : [...(value as string[]), c])}
                className={`rounded px-2 py-0.5 text-[12px] font-medium ${on ? 'bg-[#1F4D3A] text-white' : 'bg-[#EEF1EA] text-[#1F4D3A]/70'}`}
              >
                {c}
              </button>
            );
          })}
        </div>
      );
    }
    const options =
      f.kind === 'col' ? colOptions : f.kind === 'otherCol' ? (otherTable(String(vals.with ?? ''))?.cols ?? []) : f.key === 'with' ? others : (f.options ?? []);
    return (
      <select aria-label={f.label} className={sel} value={String(value)} onChange={(e) => set(e.target.value)}>
        <option value="">Choose…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {f.key === 'kind' ? `${o}: ${JOIN_LABEL[o]}` : o}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="sheet-scroll flex h-full min-h-0 flex-col gap-2 overflow-auto bg-white p-3 text-[13px]" aria-label="Power Query editor">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1F4D3A]/10 pb-2">
        {!config.noGetData && (
          <select aria-label="Get data" className={`${sel} w-auto min-w-44`} value="" onChange={(e) => { const v = e.target.value; if (v.startsWith('folder:')) addQuery('folder', v.slice(7)); else if (v) addQuery('file', v); }}>
            <option value="">Get Data…</option>
            {Object.keys(config.files).map((f) => (
              <option key={f} value={f}>
                From file: {f}
              </option>
            ))}
            {Object.keys(config.folders ?? {}).map((f) => (
              <option key={f} value={`folder:${f}`}>
                From folder: {f}
              </option>
            ))}
          </select>
        )}
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Queries">
          {names.map((n) => (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={n === selected}
              onClick={() => { setSelected(n); setUpTo(null); setMsg(null); }}
              className={`rounded-md px-2.5 py-1 text-xs font-bold ${n === selected ? 'bg-[#1F4D3A] text-white' : 'bg-[#EEF1EA] text-[#1F4D3A]/70 hover:bg-[#1F4D3A]/10'}`}
            >
              {n}
              {loaded[n] ? ' ✓' : ''}
            </button>
          ))}
          {names.length === 0 && <span className="py-1 text-xs text-[#1F4D3A]/50">No queries yet. Use Get Data.</span>}
        </div>
        <div className="ml-auto flex gap-1.5">
          {Object.keys(params).length > 0 &&
            Object.entries(params).map(([k, v]) => (
              <label key={k} className="flex items-center gap-1 text-xs font-semibold text-[#1F4D3A]/70">
                @{k}
                <input aria-label={`Parameter ${k}`} className="h-7 w-16 rounded-md border border-[#1F4D3A]/25 px-1.5 text-[12px]" value={v} onChange={(e) => setParams({ ...params, [k]: e.target.value })} />
              </label>
            ))}
          {stale && (
            <button
              type="button"
              onClick={() => {
                const next = { ...loaded };
                for (const n of Object.keys(loaded)) {
                  const t = results[n]?.table;
                  if (t) {
                    next[n] = t;
                    onLoad(n, t, config.loadTo ?? 'A1', loaded[n]);
                  }
                }
                setLoaded(next);
              }}
              className="rounded-md bg-[#C7F000] px-3 py-1 text-xs font-bold text-[#1F4D3A] ring-2 ring-[#1F4D3A]/30"
            >
              Refresh
            </button>
          )}
          <button
            type="button"
            disabled={!cur?.table || !!cur.error}
            onClick={() => {
              if (!cur?.table) return;
              setLoaded({ ...loaded, [selected]: cur.table });
              onLoad(selected, cur.table, config.loadTo ?? 'A1', loaded[selected]);
              setMsg(`Loaded ${cur.table.rows.length} rows to the sheet.`);
            }}
            className="rounded-md bg-[#1F4D3A] px-3 py-1 text-xs font-bold text-white disabled:opacity-40"
          >
            Close &amp; Load
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[210px_1fr]">
        <aside className="space-y-2 rounded-xl border border-[#1F4D3A]/15 bg-[#F7F8F4] p-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#1F4D3A]/55">Applied steps</h3>
          <ol className="space-y-0.5">
            {stepList.map((s, i) => (
              <li key={i} className={`group flex items-center gap-1 rounded-md px-1.5 py-1 ${i + 1 === showUpTo ? 'bg-[#C7F000]/50' : 'hover:bg-[#1F4D3A]/6'}`}>
                <button type="button" className="min-w-0 flex-1 truncate text-left text-xs" onClick={() => setUpTo(i + 1 === stepList.length ? null : i + 1)} title={stepLabel(s)}>
                  {stepLabel(s)}
                </button>
                {i > 0 && (
                  <button type="button" aria-label={`Delete step ${i + 1}`} className="px-1 text-[#1F4D3A]/40 opacity-0 hover:text-[#C0392B] group-hover:opacity-100" onClick={() => { setSteps({ ...steps, [selected]: stepList.filter((_, j) => j !== i) }); setUpTo(null); }}>
                    ×
                  </button>
                )}
              </li>
            ))}
          </ol>
        </aside>

        <section className="min-w-0 space-y-2">
          {selected && (
            <div className="rounded-xl border border-[#1F4D3A]/15 bg-[#F7F8F4] p-2.5">
              <div className="flex flex-wrap items-end gap-2">
                <label className="block min-w-44 flex-1">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Transform</span>
                  <select aria-label="Transform" className={sel} value={op} onChange={(e) => { setOp(e.target.value as Op); setVals({}); setMsg(null); }}>
                    {[...new Set(available.map((o) => o.group))].map((g) => (
                      <optgroup key={g} label={g}>
                        {available.filter((o) => o.group === g).map((o) => (
                          <option key={o.op} value={o.op}>
                            {o.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
                {fields.map((f) => (
                  <label key={f.key} className={`block ${f.kind === 'cols' || f.kind === 'otherCols' ? 'min-w-52 flex-1' : 'min-w-36 flex-1'}`}>
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">{f.label}</span>
                    {fieldUi(f)}
                  </label>
                ))}
                <button type="button" onClick={apply} disabled={!stepList.length} className="h-8 rounded-md bg-[#1F4D3A] px-4 text-xs font-bold text-white disabled:opacity-40">
                  Apply step
                </button>
              </div>
              {(msg || cur?.error || preview.error) && <p className={`mt-1.5 text-xs font-semibold ${msg?.startsWith('Loaded') ? 'text-[#1D766B]' : 'text-[#C0392B]'}`}>{msg ?? preview.error ?? cur?.error}</p>}
            </div>
          )}

          <div className="overflow-auto rounded-xl border border-[#1F4D3A]/15">
            {table ? (
              <table className="w-full min-w-[320px] border-collapse text-[12.5px]" aria-label="Query preview">
                <thead>
                  <tr className="bg-[#1F4D3A] text-white">
                    <th className="w-8 px-2 py-1 text-left font-medium opacity-70">#</th>
                    {table.cols.map((c) => (
                      <th key={c} className="px-3 py-1 text-left font-semibold">
                        {c}
                        {table.types?.[c] && <span className="ml-1 text-[10px] font-normal text-[#C7F000]">{table.types[c] === 'number' ? '123' : table.types[c] === 'date' ? 'date' : 'abc'}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.slice(0, 14).map((r, i) => (
                    <tr key={i} className={i % 2 ? 'bg-[#F4F8F5]' : ''}>
                      <td className="px-2 py-1 text-[#1F4D3A]/40">{i + 1}</td>
                      {r.map((v, j) => (
                        <td key={j} className={`px-3 py-1 ${v === null ? 'italic text-[#1F4D3A]/35' : v instanceof E.XlError ? 'font-semibold text-[#C0392B]' : typeof v === 'number' ? 'text-right tabular-nums' : ''}`}>
                          {v === null ? 'null' : fmtCell(v, table.types?.[table.cols[j]])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-10 text-center text-sm text-[#1F4D3A]/50">{names.length ? 'This query has no result yet.' : 'Choose Get Data to start a query.'}</p>
            )}
            {table && table.rows.length > 14 && <p className="border-t border-[#1F4D3A]/10 px-3 py-1 text-xs text-[#1F4D3A]/50">Showing 14 of {table.rows.length} rows.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
