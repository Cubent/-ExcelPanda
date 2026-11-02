'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as E from '@/components/sheet/engine';
import type { PivotResult } from '@/components/sheet/pivot';

export type ChartType = 'column' | 'bar' | 'line' | 'pie' | 'combo';
export type ChartConfig = {
  type: ChartType;
  /** Range the chart reads, e.g. "A1:C7". Ignored when `fromPivot` is true. */
  range: string;
  fromPivot: boolean;
  title: string;
  legend: boolean;
  labels: boolean;
  gridlines: boolean;
  /** In a combo chart, draw the second series on its own right-hand axis. */
  secondary: boolean;
  xTitle: string;
  yTitle: string;
};
export type ChartData = { categories: string[]; series: { name: string; values: number[] }[] };
export type ChartState = { config: ChartConfig; data: ChartData };

export const DEFAULT_CHART: ChartConfig = {
  type: 'column', range: '', fromPivot: false, title: '', legend: true, labels: false, gridlines: true, secondary: false, xTitle: '', yTitle: '',
};

const COLORS = ['#1F4D3A', '#2A9D8F', '#F4B63F', '#E76F51', '#6C8EAD', '#8FB300'];

/** Reads series from a sheet range: first column = categories, first row = series names. */
export function chartDataFromRange(data: E.SheetData, range: string): ChartData {
  const rc = E.parseRectLabel(range);
  if (!rc) return { categories: [], series: [] };
  const ev = E.buildEvaluator(data);
  const val = (c: number, r: number) => ev.value(E.keyOf(c, r));
  const firstColText = typeof val(rc.c1, rc.r1 + 1) === 'string' || (rc.c2 > rc.c1 && typeof val(rc.c1, rc.r1 + 1) !== 'number');
  const headerRow = typeof val(rc.c1 + (firstColText ? 1 : 0), rc.r1) === 'string' || val(rc.c1 + (firstColText ? 1 : 0), rc.r1) === null;
  const r0 = rc.r1 + (headerRow ? 1 : 0);
  const cats: string[] = [];
  for (let r = r0; r <= rc.r2; r++) cats.push(firstColText ? String(ev.display(E.keyOf(rc.c1, r))) : String(r - r0 + 1));
  const series: ChartData['series'] = [];
  for (let c = rc.c1 + (firstColText ? 1 : 0); c <= rc.c2; c++) {
    const name = headerRow ? String(ev.display(E.keyOf(c, rc.r1))) || `Series${series.length + 1}` : `Series${series.length + 1}`;
    const values: number[] = [];
    for (let r = r0; r <= rc.r2; r++) {
      const v = val(c, r);
      values.push(typeof v === 'number' ? v : 0);
    }
    series.push({ name, values });
  }
  return { categories: cats, series };
}

export function chartDataFromPivot(res: PivotResult): ChartData {
  return {
    categories: res.rowKeys,
    series: res.colKeys.map((name, ci) => ({ name, values: res.cells.map((row) => row[ci] ?? 0) })),
  };
}

const nice = (max: number) => {
  if (max <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(max));
  const n = max / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
};
const short = (n: number) => (Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : String(Number.parseFloat(n.toFixed(2))));

function Chart({ cfg, data }: { cfg: ChartConfig; data: ChartData }) {
  const W = 640;
  const H = 320;
  const m = { l: cfg.yTitle ? 58 : 46, r: cfg.type === 'combo' && cfg.secondary ? 46 : 16, t: cfg.title ? 40 : 18, b: cfg.xTitle ? (cfg.legend ? 74 : 58) : cfg.legend ? 54 : 40 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const n = data.categories.length;
  const sers = data.series;
  if (!n || !sers.length) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-[#1F4D3A]/50">
        {cfg.range || cfg.fromPivot ? 'No data found in that range.' : 'Type a range, like A1:C7, to draw a chart.'}
      </div>
    );
  }

  const title = cfg.title && (
    <text x={W / 2} y={22} textAnchor="middle" fontSize="15" fontWeight="700" fill="#1F4D3A">
      {cfg.title}
    </text>
  );

  if (cfg.type === 'pie') {
    const s = sers[0];
    const total = s.values.reduce((a, b) => a + Math.max(0, b), 0) || 1;
    const cx = cfg.legend ? W * 0.36 : W / 2;
    const cy = m.t + (H - m.t - 14) / 2;
    const rad = Math.min(cy - m.t + 8, 118);
    let acc = -Math.PI / 2;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={cfg.title || 'Pie chart'} className="h-auto w-full">
        {title}
        {s.values.map((v, i) => {
          const a = (Math.max(0, v) / total) * Math.PI * 2;
          const x1 = cx + rad * Math.cos(acc);
          const y1 = cy + rad * Math.sin(acc);
          const x2 = cx + rad * Math.cos(acc + a);
          const y2 = cy + rad * Math.sin(acc + a);
          const mid = acc + a / 2;
          const d = `M${cx},${cy} L${x1},${y1} A${rad},${rad} 0 ${a > Math.PI ? 1 : 0} 1 ${x2},${y2} Z`;
          acc += a;
          return (
            <g key={i}>
              <path d={d} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth="2" />
              {cfg.labels && a > 0.15 && (
                <text x={cx + rad * 0.62 * Math.cos(mid)} y={cy + rad * 0.62 * Math.sin(mid) + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">
                  {Math.round((v / total) * 100)}%
                </text>
              )}
            </g>
          );
        })}
        {cfg.legend &&
          data.categories.map((c, i) => (
            <g key={c} transform={`translate(${W * 0.64},${m.t + 10 + i * 22})`}>
              <rect width="12" height="12" rx="2" fill={COLORS[i % COLORS.length]} />
              <text x="19" y="11" fontSize="12" fill="#374151">
                {c}
              </text>
            </g>
          ))}
      </svg>
    );
  }

  const horizontal = cfg.type === 'bar';
  // The second series of a combo chart is a line, optionally on its own axis.
  const isLine = (si: number) => cfg.type === 'line' || (cfg.type === 'combo' && si > 0);
  const colSeries = sers.filter((_, i) => !isLine(i));
  const useSecondary = cfg.type === 'combo' && cfg.secondary && sers.length > 1;
  const maxOf = (list: typeof sers) => Math.max(...list.flatMap((s) => s.values), 0);
  const primaryMax = nice(Math.max(maxOf(useSecondary ? sers.slice(0, 1) : sers), 1));
  const secMax = nice(Math.max(maxOf(sers.slice(1)), 1));
  const ticks = 5;
  const bandW = (horizontal ? ih : iw) / n;
  const groupW = Math.min(bandW * 0.72, 90);
  const barW = groupW / Math.max(colSeries.length, 1);
  const scaleY = (v: number, sec = false) => ih - (v / (sec ? secMax : primaryMax)) * ih;
  const scaleX = (v: number) => (v / primaryMax) * iw;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={cfg.title || `${cfg.type} chart`} className="h-auto w-full">
      {title}
      <g transform={`translate(${m.l},${m.t})`}>
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const v = (primaryMax / ticks) * i;
          const pos = horizontal ? (iw / ticks) * i : ih - (ih / ticks) * i;
          return (
            <g key={i}>
              {cfg.gridlines && (horizontal ? <line x1={pos} x2={pos} y1={0} y2={ih} stroke="#E5E7EB" /> : <line x1={0} x2={iw} y1={pos} y2={pos} stroke="#E5E7EB" />)}
              {horizontal ? (
                <text x={pos} y={ih + 16} textAnchor="middle" fontSize="11" fill="#6B7280">
                  {short(v)}
                </text>
              ) : (
                <text x={-8} y={pos + 4} textAnchor="end" fontSize="11" fill="#6B7280">
                  {short(v)}
                </text>
              )}
              {useSecondary && !horizontal && (
                <text x={iw + 8} y={pos + 4} fontSize="11" fill="#E76F51">
                  {short((secMax / ticks) * i)}
                </text>
              )}
            </g>
          );
        })}
        <line x1={0} x2={horizontal ? 0 : iw} y1={horizontal ? 0 : ih} y2={ih} stroke="#9CA3AF" />
        {horizontal && <line x1={0} x2={0} y1={0} y2={ih} stroke="#9CA3AF" />}

        {data.categories.map((cat, ci) => {
          const base = ci * bandW + (bandW - groupW) / 2;
          return (
            <g key={ci}>
              {horizontal ? (
                <text x={-8} y={ci * bandW + bandW / 2 + 4} textAnchor="end" fontSize="11" fill="#374151">
                  {cat.length > 12 ? `${cat.slice(0, 11)}…` : cat}
                </text>
              ) : (
                <text x={ci * bandW + bandW / 2} y={ih + 16} textAnchor="middle" fontSize="11" fill="#374151">
                  {cat.length > 10 ? `${cat.slice(0, 9)}…` : cat}
                </text>
              )}
              {colSeries.map((s, si) => {
                const v = s.values[ci] ?? 0;
                if (horizontal) {
                  return (
                    <g key={si}>
                      <rect x={0} y={base + si * barW} width={scaleX(v)} height={barW - 2} rx="2" fill={COLORS[sers.indexOf(s) % COLORS.length]} />
                      {cfg.labels && (
                        <text x={scaleX(v) + 5} y={base + si * barW + barW / 2 + 3} fontSize="11" fill="#374151">
                          {short(v)}
                        </text>
                      )}
                    </g>
                  );
                }
                return (
                  <g key={si}>
                    <rect x={base + si * barW} y={scaleY(v)} width={barW - 2} height={ih - scaleY(v)} rx="2" fill={COLORS[sers.indexOf(s) % COLORS.length]} />
                    {cfg.labels && (
                      <text x={base + si * barW + (barW - 2) / 2} y={scaleY(v) - 5} textAnchor="middle" fontSize="11" fill="#374151">
                        {short(v)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {sers.map((s, si) => {
          if (!isLine(si)) return null;
          const sec = useSecondary && si > 0;
          const pts = s.values.map((v, i) => [i * bandW + bandW / 2, scaleY(v, sec)] as const);
          return (
            <g key={si}>
              <polyline fill="none" stroke={COLORS[si % COLORS.length]} strokeWidth="2.5" points={pts.map((p) => p.join(',')).join(' ')} />
              {pts.map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="3.5" fill="#fff" stroke={COLORS[si % COLORS.length]} strokeWidth="2" />
                  {cfg.labels && (
                    <text x={x} y={y - 8} textAnchor="middle" fontSize="11" fill="#374151">
                      {short(s.values[i])}
                    </text>
                  )}
                </g>
              ))}
            </g>
          );
        })}

        {cfg.xTitle && (
          <text x={iw / 2} y={ih + 40} textAnchor="middle" fontSize="12" fontWeight="600" fill="#4B5563">
            {cfg.xTitle}
          </text>
        )}
        {cfg.yTitle && (
          <text transform={`translate(${-m.l + 14},${ih / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fontWeight="600" fill="#4B5563">
            {cfg.yTitle}
          </text>
        )}
      </g>
      {cfg.legend && sers.length > 0 && (
        <g transform={`translate(${m.l},${H - 10})`}>
          {sers.map((s, i) => (
            <g key={i} transform={`translate(${i * 130},0)`}>
              <rect y={-9} width="11" height="11" rx="2" fill={COLORS[i % COLORS.length]} />
              <text x="16" fontSize="11" fill="#374151">
                {s.name.length > 14 ? `${s.name.slice(0, 13)}…` : s.name}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

const TYPES: { id: ChartType; label: string }[] = [
  { id: 'column', label: 'Column' },
  { id: 'bar', label: 'Bar' },
  { id: 'line', label: 'Line' },
  { id: 'pie', label: 'Pie' },
  { id: 'combo', label: 'Combo' },
];

const field = 'h-8 w-full rounded-md border border-[#1F4D3A]/25 bg-white px-2 text-[13px] outline-none focus:border-[#1F4D3A]';

export function ChartPanel({
  data,
  selection,
  pivot,
  allow,
  initial,
  onState,
}: {
  data: E.SheetData;
  /** The cells currently selected in the sheet, e.g. "A1:C7". */
  selection: string;
  pivot: PivotResult | null;
  allow?: { types?: ChartType[]; pivot?: boolean; options?: boolean; axisTitles?: boolean };
  initial?: Partial<ChartConfig>;
  onState: (s: ChartState | null) => void;
}) {
  const [cfg, setCfg] = useState<ChartConfig>({ ...DEFAULT_CHART, ...initial });
  const types = TYPES.filter((t) => !allow?.types || allow.types.includes(t.id));
  const chartData = useMemo(
    () => (cfg.fromPivot && pivot ? chartDataFromPivot(pivot) : chartDataFromRange(data, cfg.range)),
    [cfg.fromPivot, cfg.range, data, pivot],
  );
  const onStateRef = useRef(onState);
  onStateRef.current = onState;
  useEffect(() => {
    onStateRef.current({ config: cfg, data: chartData });
  }, [cfg, chartData]);
  const set = (p: Partial<ChartConfig>) => setCfg({ ...cfg, ...p });
  const check = (label: string, key: 'legend' | 'labels' | 'gridlines' | 'secondary') => (
    <label className="flex cursor-pointer items-center gap-2 text-[13px]">
      <input type="checkbox" className="size-4 accent-[#1F4D3A]" checked={cfg[key]} onChange={(e) => set({ [key]: e.target.checked })} />
      {label}
    </label>
  );

  return (
    <div className="sheet-scroll grid h-full min-h-0 gap-3 overflow-auto bg-white p-3 md:grid-cols-[250px_1fr]" aria-label="Chart builder">
      <aside className="space-y-3 rounded-xl border border-[#1F4D3A]/15 bg-[#F7F8F4] p-3">
        <h3 className="text-sm font-semibold text-[#1F4D3A]">Chart</h3>
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Chart type">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={cfg.type === t.id}
              onClick={() => set({ type: t.id })}
              className={`rounded-md border px-1 py-1.5 text-xs font-bold ${cfg.type === t.id ? 'border-[#1F4D3A] bg-[#C7F000]/50 text-[#1F4D3A]' : 'border-[#1F4D3A]/20 bg-white text-[#1F4D3A]/70 hover:bg-[#1F4D3A]/5'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {allow?.pivot && pivot && (
          <div className="flex gap-1.5">
            {[
              [false, 'Sheet range'],
              [true, 'PivotTable'],
            ].map(([v, label]) => (
              <button
                key={String(v)}
                type="button"
                aria-pressed={cfg.fromPivot === v}
                onClick={() => set({ fromPivot: v as boolean })}
                className={`flex-1 rounded-md border px-1 py-1 text-xs font-bold ${cfg.fromPivot === v ? 'border-[#1F4D3A] bg-[#C7F000]/50' : 'border-[#1F4D3A]/20 bg-white'}`}
              >
                {label as string}
              </button>
            ))}
          </div>
        )}

        {!cfg.fromPivot && (
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Data range</span>
            <input aria-label="Chart data range" className={field} placeholder="e.g. A1:C7" value={cfg.range} onChange={(e) => set({ range: e.target.value.toUpperCase() })} />
            {selection.includes(':') && (
              <button type="button" className="mt-1 text-xs font-semibold text-[#1D766B] hover:underline" onClick={() => set({ range: selection })}>
                Use selected cells ({selection})
              </button>
            )}
          </label>
        )}

        {allow?.options !== false && (
          <>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Chart title</span>
              <input aria-label="Chart title" className={field} value={cfg.title} onChange={(e) => set({ title: e.target.value })} />
            </label>
            {allow?.axisTitles && (
              <>
                <input aria-label="Horizontal axis title" className={field} placeholder="Horizontal axis title" value={cfg.xTitle} onChange={(e) => set({ xTitle: e.target.value })} />
                <input aria-label="Vertical axis title" className={field} placeholder="Vertical axis title" value={cfg.yTitle} onChange={(e) => set({ yTitle: e.target.value })} />
              </>
            )}
            <div className="space-y-1.5">
              {check('Legend', 'legend')}
              {check('Data labels', 'labels')}
              {check('Gridlines', 'gridlines')}
              {cfg.type === 'combo' && check('Second series on secondary axis', 'secondary')}
            </div>
          </>
        )}
      </aside>
      <section className="min-w-0 rounded-xl border border-[#1F4D3A]/15 bg-white p-3">
        <Chart cfg={cfg} data={chartData} />
      </section>
    </div>
  );
}
