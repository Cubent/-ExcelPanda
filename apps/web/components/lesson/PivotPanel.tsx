'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as E from '@/components/sheet/engine';
import { type PivotAgg, type PivotConfig, type PivotResult, type ShowAs, aggLabel, computePivot, readSource } from '@/components/sheet/pivot';

export type PivotState = { config: PivotConfig; result: PivotResult; fresh: boolean };

const AGGS: PivotAgg[] = ['sum', 'count', 'average', 'max', 'min'];
const GROUPS = [
  { id: '', label: 'No grouping' },
  { id: 'month', label: 'Months' },
  { id: 'quarter', label: 'Quarters' },
  { id: 'year', label: 'Years' },
];

const fmt = (v: number | null, show: ShowAs, money?: boolean) => {
  if (v === null) return '';
  if (show !== 'value') return `${(v * 100).toFixed(1).replace(/\.0$/, '')}%`;
  const s = Number.isInteger(v) ? v.toLocaleString('en-US') : v.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return money ? `$${s}` : s;
};

const sel = 'h-8 w-full rounded-md border border-[#1F4D3A]/25 bg-white px-2 text-[13px] outline-none focus:border-[#1F4D3A]';

/**
 * A PivotTable builder. It works on a snapshot of the sheet: changes to the source data do not
 * show until you press Refresh, exactly like Excel.
 */
export function PivotPanel({
  data,
  source,
  initial,
  features,
  onState,
}: {
  data: E.SheetData;
  /** Range ("A1:E20") or table name the pivot reads. */
  source: string;
  initial?: PivotConfig;
  /** Which advanced controls to show. */
  features?: { group?: boolean; showAs?: boolean; calc?: boolean; slicers?: boolean; filter?: boolean };
  onState: (s: PivotState | null) => void;
}) {
  const [snapshot, setSnapshot] = useState<E.SheetData>(data);
  const [config, setConfig] = useState<PivotConfig>(initial ?? { source, values: [] });
  const [calcName, setCalcName] = useState('');
  const [calcExpr, setCalcExpr] = useState('');

  const info = useMemo(() => readSource(snapshot, config.source), [snapshot, config.source]);
  const allFields = [...info.fields, ...(config.calc ?? []).map((c) => c.name)];
  const result = useMemo(() => computePivot(snapshot, config), [snapshot, config]);
  const live = useMemo(() => computePivot(data, config), [data, config]);
  const fresh = JSON.stringify(result.cells) === JSON.stringify(live.cells) && JSON.stringify(result.rowKeys) === JSON.stringify(live.rowKeys);

  const onStateRef = useRef(onState);
  onStateRef.current = onState;
  useEffect(() => {
    onStateRef.current({ config, result, fresh });
  }, [config, result, fresh]);

  const v0 = config.values[0];
  const show: ShowAs = v0?.show ?? 'value';
  const colKeys = result.colKeys;
  const hasRows = !!config.rows;
  const used = new Set([config.rows, config.cols, ...config.values.map((v) => v.field), config.filter?.field].filter(Boolean) as string[]);

  const distinct = (field: string) => [...new Set(readSource(snapshot, config.source).rows.map((r) => String(r[field] ?? '')))].sort();
  const set = (patch: Partial<PivotConfig>) => setConfig({ ...config, ...patch });
  const dateLike = (field: string) => /date|month|day/i.test(field);

  return (
    <div className="sheet-scroll grid h-full min-h-0 gap-3 overflow-auto bg-white p-3 md:grid-cols-[250px_1fr]" aria-label="PivotTable builder">
      <aside className="space-y-3 rounded-xl border border-[#1F4D3A]/15 bg-[#F7F8F4] p-3 text-[13px]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1F4D3A]">PivotTable Fields</h3>
          <button
            type="button"
            onClick={() => setSnapshot(data)}
            className={`rounded-md px-2.5 py-1 text-xs font-bold ${fresh ? 'border border-[#1F4D3A]/20 text-[#1F4D3A]/60' : 'bg-[#C7F000] text-[#1F4D3A] ring-2 ring-[#1F4D3A]/30'}`}
          >
            Refresh
          </button>
        </div>
        {!fresh && <p className="rounded-md bg-[#FFF3D1] px-2 py-1 text-xs text-[#7a5600]">The source data changed. Press Refresh to update the pivot.</p>}

        <div className="flex flex-wrap gap-1">
          {allFields.map((f) => (
            <span key={f} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${used.has(f) ? 'bg-[#1F4D3A] text-white' : 'bg-white text-[#1F4D3A]/70 ring-1 ring-[#1F4D3A]/15'}`}>
              {f}
            </span>
          ))}
        </div>

        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Rows</span>
          <select aria-label="Rows field" className={sel} value={config.rows ?? ''} onChange={(e) => set({ rows: e.target.value || undefined, group: undefined })}>
            <option value="">(none)</option>
            {allFields.filter((f) => !config.calc?.some((c) => c.name === f)).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        {features?.group && config.rows && (
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Group Rows by</span>
            <select
              aria-label="Group by"
              className={sel}
              value={typeof config.group === 'string' ? config.group : ''}
              onChange={(e) => set({ group: (e.target.value || undefined) as PivotConfig['group'] })}
            >
              {GROUPS.filter((g) => g.id === '' || dateLike(config.rows ?? '')).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Columns</span>
          <select aria-label="Columns field" className={sel} value={config.cols ?? ''} onChange={(e) => set({ cols: e.target.value || undefined })}>
            <option value="">(none)</option>
            {info.fields.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Values</span>
          {config.values.map((v, i) => (
            <div key={i} className="mb-1.5 flex gap-1">
              <select
                aria-label={`Value ${i + 1} field`}
                className="h-8 min-w-0 flex-1 rounded-md border border-[#1F4D3A]/25 bg-white px-1.5 text-[13px] outline-none focus:border-[#1F4D3A]"
                value={v.field}
                onChange={(e) => set({ values: config.values.map((x, j) => (j === i ? { ...x, field: e.target.value } : x)) })}
              >
                {allFields.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <select
                aria-label={`Value ${i + 1} summarize by`}
                className="h-8 w-[82px] shrink-0 rounded-md border border-[#1F4D3A]/25 bg-white px-1.5 text-[13px] outline-none focus:border-[#1F4D3A]"
                value={v.agg}
                onChange={(e) => set({ values: config.values.map((x, j) => (j === i ? { ...x, agg: e.target.value as PivotAgg } : x)) })}
              >
                {AGGS.map((a) => (
                  <option key={a} value={a}>
                    {aggLabel(a)}
                  </option>
                ))}
              </select>
              <button type="button" aria-label="Remove value" className="px-1 text-[#1F4D3A]/50 hover:text-[#C0392B]" onClick={() => set({ values: config.values.filter((_, j) => j !== i) })}>
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-xs font-semibold text-[#1D766B] hover:underline"
            onClick={() => set({ values: [...config.values, { field: allFields.find((f) => !config.values.some((v) => v.field === f) && f !== config.rows) ?? allFields[0], agg: 'sum' }] })}
          >
            + Add value
          </button>
        </div>

        {features?.showAs && config.values.length === 1 && (
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Show values as</span>
            <select aria-label="Show values as" className={sel} value={show} onChange={(e) => set({ values: [{ ...config.values[0], show: e.target.value as ShowAs }] })}>
              <option value="value">Normal</option>
              <option value="pctTotal">% of Grand Total</option>
              <option value="pctRow">% of Row Total</option>
              <option value="pctCol">% of Column Total</option>
            </select>
          </label>
        )}

        {features?.filter && (
          <div>
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Report filter</span>
            <div className="flex gap-1">
              <select
                aria-label="Filter field"
                className={sel}
                value={config.filter?.field ?? ''}
                onChange={(e) => set({ filter: e.target.value ? { field: e.target.value, value: distinct(e.target.value)[0] ?? '' } : undefined })}
              >
                <option value="">(none)</option>
                {info.fields.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              {config.filter && (
                <select aria-label="Filter value" className={sel} value={config.filter.value} onChange={(e) => set({ filter: { field: config.filter?.field ?? '', value: e.target.value } })}>
                  {distinct(config.filter.field).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {features?.calc && (
          <div>
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Calculated field</span>
            <input aria-label="Field name" className={`${sel} mb-1`} placeholder="Name, e.g. Profit" value={calcName} onChange={(e) => setCalcName(e.target.value)} />
            <input aria-label="Field formula" className={`${sel} mb-1`} placeholder="Formula, e.g. Revenue-Cost" value={calcExpr} onChange={(e) => setCalcExpr(e.target.value)} />
            <button
              type="button"
              disabled={!calcName.trim() || !calcExpr.trim()}
              className="rounded-md border border-[#1F4D3A]/20 px-2.5 py-1 text-xs font-bold text-[#1F4D3A] disabled:opacity-40"
              onClick={() => {
                set({ calc: [...(config.calc ?? []).filter((c) => c.name !== calcName.trim()), { name: calcName.trim(), formula: calcExpr.trim().replace(/^=/, '') }] });
                setCalcName('');
                setCalcExpr('');
              }}
            >
              Add field
            </button>
          </div>
        )}

        {features?.slicers && (
          <div>
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Slicer</span>
            <select
              aria-label="Slicer field"
              className={sel}
              value={Object.keys(config.slicers ?? {})[0] ?? ''}
              onChange={(e) => set({ slicers: e.target.value ? { [e.target.value]: distinct(e.target.value) } : undefined })}
            >
              <option value="">(none)</option>
              {info.fields.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            {Object.entries(config.slicers ?? {}).map(([field, keep]) => (
              <div key={field} className="mt-1.5 flex flex-wrap gap-1">
                {distinct(field).map((v) => {
                  const on = keep.includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set({ slicers: { [field]: on ? keep.filter((x) => x !== v) : [...keep, v] } })}
                      className={`rounded px-2 py-0.5 text-[12px] font-medium ${on ? 'bg-[#C7F000] text-[#1F4D3A]' : 'bg-white text-[#6B7280] ring-1 ring-[#1F4D3A]/15'}`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </aside>

      <section className="min-w-0 overflow-auto rounded-xl border border-[#1F4D3A]/15 bg-white p-3">
        {config.values.length === 0 && !config.rows ? (
          <p className="py-10 text-center text-sm text-[#1F4D3A]/55">Choose fields on the left to build your PivotTable.</p>
        ) : (
          <table className="w-full min-w-[320px] border-collapse text-[13px]" aria-label="PivotTable">
            <thead>
              <tr className="bg-[#1F4D3A] text-white">
                <th className="px-3 py-1.5 text-left font-semibold">{hasRows ? (typeof config.group === 'string' ? `${config.rows} (${config.group}s)` : config.rows) : ''}</th>
                {colKeys.map((k) => (
                  <th key={k} className="px-3 py-1.5 text-right font-semibold">
                    {k}
                  </th>
                ))}
                {config.cols && config.values.length === 1 && <th className="px-3 py-1.5 text-right font-semibold">Grand Total</th>}
              </tr>
            </thead>
            <tbody>
              {result.rowKeys.map((rk, ri) => (
                <tr key={rk} className={ri % 2 ? 'bg-[#F4F8F5]' : ''}>
                  <td className="px-3 py-1.5 font-medium">{hasRows ? rk : ''}</td>
                  {result.cells[ri].map((v, ci) => (
                    <td key={ci} className="px-3 py-1.5 text-right tabular-nums">
                      {fmt(v, show)}
                    </td>
                  ))}
                  {config.cols && config.values.length === 1 && <td className="px-3 py-1.5 text-right font-semibold tabular-nums">{fmt(result.rowTotals[ri], show)}</td>}
                </tr>
              ))}
              <tr className="border-t-2 border-[#1F4D3A]/40 bg-[#DDE8DF] font-bold">
                <td className="px-3 py-1.5">Grand Total</td>
                {result.colTotals.map((v, ci) => (
                  <td key={ci} className="px-3 py-1.5 text-right tabular-nums">
                    {fmt(v, show)}
                  </td>
                ))}
                {config.cols && config.values.length === 1 && <td className="px-3 py-1.5 text-right tabular-nums">{fmt(result.grand, show)}</td>}
              </tr>
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
