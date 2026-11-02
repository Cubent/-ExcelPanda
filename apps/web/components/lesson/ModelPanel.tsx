'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as E from '@/components/sheet/engine';
import { type DaxModel, type DaxTable, type Relationship, evalMeasure, modelColumns, reportTable, validateDax } from '@/components/sheet/dax';

export type ModelConfig = {
  tables: Record<string, DaxTable>;
  relationships?: Relationship[];
  measures?: Record<string, string>;
  /** Hide the relationship / measure editors when a lesson only needs one of them. */
  allow?: { relationships?: boolean; measures?: boolean; report?: boolean };
  /** Start the report with these fields. */
  report?: { rowField?: string; measures?: string[]; filters?: Record<string, string[]> };
};
export type ModelState = {
  model: DaxModel;
  report: { rowField: string; measures: string[]; filters: Record<string, string[]>; table: { cols: string[]; rows: E.Scalar[][] } | null };
};

const inp = 'h-8 w-full rounded-md border border-[#1F4D3A]/25 bg-white px-2 text-[13px] outline-none focus:border-[#1F4D3A]';
const lab = 'mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55';
const show = (v: E.Scalar) => (v === null ? '' : v instanceof E.XlError ? v.code : typeof v === 'number' ? E.fmtGeneral(Math.round(v * 10000) / 10000) : String(v));

export function ModelPanel({ config, onState }: { config: ModelConfig; onState: (s: ModelState) => void }) {
  const allow = { relationships: true, measures: true, report: true, ...config.allow };
  const [rels, setRels] = useState<Relationship[]>(config.relationships ?? []);
  const [measures, setMeasures] = useState<Record<string, string>>(config.measures ?? {});
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mName, setMName] = useState('');
  const [mExpr, setMExpr] = useState('');
  const [mErr, setMErr] = useState<string | null>(null);
  const [rowField, setRowField] = useState(config.report?.rowField ?? '');
  const [picked, setPicked] = useState<string[]>(config.report?.measures ?? []);
  const [filters, setFilters] = useState<Record<string, string[]>>(config.report?.filters ?? {});
  const [fCol, setFCol] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const model: DaxModel = useMemo(() => ({ tables: config.tables, relationships: rels, measures }), [config.tables, rels, measures]);
  const cols = useMemo(() => modelColumns(model), [model]);
  const table = useMemo(() => {
    if (!rowField || picked.length === 0) return null;
    try {
      return reportTable(model, rowField, picked.filter((m) => m in measures), filters);
    } catch {
      return null;
    }
  }, [model, rowField, picked, filters, measures]);

  const ref = useRef(onState);
  ref.current = onState;
  useEffect(() => {
    ref.current({ model, report: { rowField, measures: picked, filters, table } });
  }, [model, rowField, picked, filters, table]);

  const distinct = (c: string) => {
    const m = /^(.+)\[(.+)\]$/.exec(c);
    const tb = m && config.tables[m[1]];
    if (!m || !tb) return [];
    const i = tb.cols.indexOf(m[2]);
    return [...new Set(tb.rows.map((r) => show(r[i])))].filter((x) => x !== '').slice(0, 40);
  };

  const addRel = () => {
    if (!from || !to) return setErr('Choose both columns.');
    if (from.split('[')[0] === to.split('[')[0]) return setErr('Pick columns from two different tables.');
    if (rels.some((r) => r.from === from && r.to === to)) return setErr('That relationship already exists.');
    setRels([...rels, { from, to }]);
    setFrom('');
    setTo('');
    setErr(null);
  };
  const addMeasure = () => {
    const name = mName.trim();
    if (!name) return setMErr('Name the measure.');
    const bad = validateDax(model, mExpr);
    if (bad) return setMErr(bad);
    setMeasures({ ...measures, [name]: mExpr.trim() });
    setMName('');
    setMExpr('');
    setMErr(null);
  };

  const total = (m: string) => {
    try {
      const r = evalMeasure(model, m, filters);
      return r.error ? r.error : show(r.value);
    } catch {
      return '';
    }
  };

  return (
    <div className="sheet-scroll flex h-full min-h-0 flex-col gap-3 overflow-auto bg-white p-3 text-[13px]" aria-label="Data model">
      <div className="grid gap-3 md:grid-cols-3">
        {Object.entries(config.tables).map(([name, t]) => (
          <div key={name} className="rounded-xl border border-[#1F4D3A]/15 bg-[#F7F8F4]">
            <div className="rounded-t-xl bg-[#1F4D3A] px-3 py-1.5 text-xs font-bold text-white">{name}</div>
            <ul className="px-3 py-1.5 text-xs text-[#1F4D3A]/80">
              {t.cols.map((c) => (
                <li key={c} className="py-0.5">
                  {c}
                  {rels.some((r) => r.from === `${name}[${c}]`) && <span className="ml-1 text-[#1D766B]">→ many</span>}
                  {rels.some((r) => r.to === `${name}[${c}]`) && <span className="ml-1 text-[#1D766B]">1 ←</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {allow.relationships && (
        <section className="rounded-xl border border-[#1F4D3A]/15 bg-[#F7F8F4] p-2.5">
          <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#1F4D3A]/55">Relationships</h3>
          <ul className="mb-2 space-y-0.5 text-xs">
            {rels.length === 0 && <li className="text-[#1F4D3A]/50">No relationships yet.</li>}
            {rels.map((r, i) => (
              <li key={i} className="flex items-center gap-2">
                <span>
                  {r.from} (many) → {r.to} (one)
                </span>
                <button type="button" aria-label={`Delete relationship ${i + 1}`} className="text-[#1F4D3A]/40 hover:text-[#C0392B]" onClick={() => setRels(rels.filter((_, j) => j !== i))}>
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-40 flex-1">
              <span className={lab}>Many side (fact table)</span>
              <select aria-label="Many side" className={inp} value={from} onChange={(e) => setFrom(e.target.value)}>
                <option value="">Choose…</option>
                {cols.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="min-w-40 flex-1">
              <span className={lab}>One side (lookup table)</span>
              <select aria-label="One side" className={inp} value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="">Choose…</option>
                {cols.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={addRel} className="h-8 rounded-md bg-[#1F4D3A] px-4 text-xs font-bold text-white">
              Create relationship
            </button>
          </div>
          {err && <p className="mt-1.5 text-xs font-semibold text-[#C0392B]">{err}</p>}
        </section>
      )}

      {allow.measures && (
        <section className="rounded-xl border border-[#1F4D3A]/15 bg-[#F7F8F4] p-2.5">
          <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#1F4D3A]/55">Measures</h3>
          <ul className="mb-2 space-y-0.5 text-xs">
            {Object.keys(measures).length === 0 && <li className="text-[#1F4D3A]/50">No measures yet.</li>}
            {Object.entries(measures).map(([n, f]) => (
              <li key={n} className="flex items-center gap-2">
                <span className="font-semibold">{n}</span>
                <code className="truncate text-[#1F4D3A]/70">:= {f}</code>
                <span className="ml-auto shrink-0 tabular-nums text-[#1D766B]">{total(n)}</span>
                <button type="button" aria-label={`Delete measure ${n}`} className="text-[#1F4D3A]/40 hover:text-[#C0392B]" onClick={() => { const { [n]: _x, ...rest } = measures; setMeasures(rest); setPicked(picked.filter((p) => p !== n)); }}>
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-end gap-2">
            <label className="w-40">
              <span className={lab}>Measure name</span>
              <input aria-label="Measure name" className={inp} value={mName} onChange={(e) => setMName(e.target.value)} />
            </label>
            <label className="min-w-60 flex-[3]">
              <span className={lab}>DAX formula</span>
              <input aria-label="DAX formula" className={`${inp} font-mono`} value={mExpr} onChange={(e) => setMExpr(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addMeasure(); }} placeholder="SUM(Sales[Units])" />
            </label>
            <button type="button" onClick={addMeasure} className="h-8 rounded-md bg-[#1F4D3A] px-4 text-xs font-bold text-white">
              Add measure
            </button>
          </div>
          {mErr && <p className="mt-1.5 text-xs font-semibold text-[#C0392B]">{mErr}</p>}
        </section>
      )}

      {allow.report && (
        <section className="rounded-xl border border-[#1F4D3A]/15 bg-[#F7F8F4] p-2.5">
          <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#1F4D3A]/55">Report</h3>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-44 flex-1">
              <span className={lab}>Rows</span>
              <select aria-label="Report rows" className={inp} value={rowField} onChange={(e) => setRowField(e.target.value)}>
                <option value="">Choose a field…</option>
                {cols.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <div className="min-w-52 flex-[2]">
              <span className={lab}>Values</span>
              <div className="flex flex-wrap gap-1" role="group" aria-label="Report values">
                {Object.keys(measures).map((m) => {
                  const on = picked.includes(m);
                  return (
                    <button key={m} type="button" aria-pressed={on} onClick={() => setPicked(on ? picked.filter((x) => x !== m) : [...picked, m])} className={`rounded px-2 py-1 text-xs font-medium ${on ? 'bg-[#1F4D3A] text-white' : 'bg-white text-[#1F4D3A]/70 ring-1 ring-[#1F4D3A]/15'}`}>
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="min-w-44 flex-1">
              <span className={lab}>Slicer on</span>
              <select aria-label="Slicer field" className={inp} value={fCol} onChange={(e) => setFCol(e.target.value)}>
                <option value="">None</option>
                {cols.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          {fCol && (
            <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Slicer">
              {distinct(fCol).map((v) => {
                const on = filters[fCol]?.includes(v);
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={!!on}
                    onClick={() => {
                      const cur = filters[fCol] ?? [];
                      const next = on ? cur.filter((x) => x !== v) : [...cur, v];
                      const f = { ...filters };
                      if (next.length) f[fCol] = next;
                      else delete f[fCol];
                      setFilters(f);
                    }}
                    className={`rounded px-2 py-0.5 text-xs font-medium ${on ? 'bg-[#C7F000] text-[#1F4D3A]' : 'bg-white text-[#1F4D3A]/70 ring-1 ring-[#1F4D3A]/15'}`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-2 overflow-auto rounded-lg border border-[#1F4D3A]/15 bg-white">
            {table ? (
              <table className="w-full border-collapse text-[12.5px]" aria-label="Report">
                <thead>
                  <tr className="bg-[#1F4D3A] text-white">
                    {table.cols.map((c) => (
                      <th key={c} className="px-3 py-1 text-left font-semibold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((r, i) => (
                    <tr key={i} className={`${i % 2 ? 'bg-[#F4F8F5]' : ''} ${r[0] === 'Total' ? 'font-bold' : ''}`}>
                      {r.map((v, j) => (
                        <td key={j} className={`px-3 py-1 ${typeof v === 'number' ? 'text-right tabular-nums' : ''}`}>
                          {show(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-6 text-center text-xs text-[#1F4D3A]/50">Choose rows and at least one measure to see the report.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
