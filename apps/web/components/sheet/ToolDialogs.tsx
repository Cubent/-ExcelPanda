'use client';

import { type ReactNode, useMemo, useState } from 'react';
import * as E from './engine';
import * as T from './tools';
import { AutomationDialog, type AutomationKind } from './AutomationDialogs';

export type DialogKind = 'names' | 'sort' | 'dedupe' | 'text2col' | 'find' | 'goalseek' | 'datatable' | 'slicer' | AutomationKind;

type Apply = (data: E.SheetData, note: string, event: string) => void;
type Props = {
  kind: DialogKind;
  data: E.SheetData;
  rect: E.Rect;
  active: E.Pos;
  /** What is on the clipboard, for Paste Special. */
  clip?: T.ClipLike | null;
  onApply: Apply;
  onClose: () => void;
};

const BRAND = '#1F4D3A';

export function Shell({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="absolute inset-0 z-[80] flex items-start justify-center bg-[#0F2A1F]/25 p-4 pt-10" onMouseDown={(e) => e.stopPropagation()}>
      <div role="dialog" aria-label={title} className="w-full max-w-[380px] rounded-xl border border-[#1F4D3A]/20 bg-white shadow-[0_20px_50px_-12px_rgba(16,40,28,0.4)]">
        <div className="flex items-center justify-between border-b border-[#1F4D3A]/10 px-4 py-2.5">
          <h3 className="text-sm font-semibold text-[#1F4D3A]">{title}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-md px-1.5 text-lg leading-none text-[#1F4D3A]/50 hover:bg-[#1F4D3A]/8">
            ×
          </button>
        </div>
        <div className="space-y-3 px-4 py-3 text-[13px] text-[#1F2937]">{children}</div>
        <div className="flex justify-end gap-2 border-t border-[#1F4D3A]/10 px-4 py-2.5">{footer}</div>
      </div>
    </div>
  );
}

export const Btn = ({ children, onClick, primary, disabled }: { children: ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors disabled:opacity-40 ${
      primary ? 'bg-[#1F4D3A] text-white hover:bg-[#173d2e]' : 'border border-[#1F4D3A]/20 text-[#1F4D3A] hover:bg-[#1F4D3A]/5'
    }`}
  >
    {children}
  </button>
);

export const Check = ({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) => (
  <label className="flex cursor-pointer items-center gap-2">
    <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="size-4 accent-[#1F4D3A]" />
    {label}
  </label>
);

export const inputCls = 'w-full rounded-md border border-[#1F4D3A]/25 bg-white px-2 py-1 text-[13px] outline-none focus:border-[#1F4D3A]';

/** The block a tool works on: the selection if it spans several cells, else the table or region under the cursor. */
export function workingRect(data: E.SheetData, rect: E.Rect, active: E.Pos): E.Rect | null {
  const multi = rect.c1 !== rect.c2 || rect.r1 !== rect.r2;
  if (multi) return rect;
  const t = T.tableAt(data, active);
  return (t && T.tableRect(t)) || T.currentRegion(data, active);
}

const headerName = (data: E.SheetData, rc: E.Rect, c: number, header: boolean) => {
  const h = header ? (data.cells[E.keyOf(c, rc.r1)] ?? '').trim() : '';
  return h ? `${h}` : `Column ${E.colLabel(c)}`;
};

export function ToolDialog({ kind, data, rect, active, clip, onApply, onClose }: Props) {
  const rc = useMemo(() => workingRect(data, rect, active), [data, rect, active]);

  // --- Sort ---
  const [header, setHeader] = useState(true);
  const [levels, setLevels] = useState<T.SortLevel[]>(() => [{ col: rc && active.c >= rc.c1 && active.c <= rc.c2 ? active.c : (rc?.c1 ?? 0), asc: true }]);
  // --- Dedupe ---
  const [dupCols, setDupCols] = useState<number[]>(() => (rc ? Array.from({ length: rc.c2 - rc.c1 + 1 }, (_, i) => rc.c1 + i) : []));
  // --- Text to columns ---
  const [delims, setDelims] = useState<Record<string, boolean>>({ comma: true });
  const [other, setOther] = useState('');
  const [consec, setConsec] = useState(false);
  // --- Find & replace ---
  const [find, setFind] = useState('');
  const [repl, setRepl] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeCell, setWholeCell] = useState(false);
  const [found, setFound] = useState<string | null>(null);
  // --- Goal seek ---
  const [setCell, setSetCell] = useState(E.keyOf(active.c, active.r));
  const [toValue, setToValue] = useState('');
  const [byCell, setByCell] = useState('');
  // --- Data table ---
  const [rowIn, setRowIn] = useState('');
  const [colIn, setColIn] = useState('');
  // --- Slicer ---
  const [slicerCol, setSlicerCol] = useState<number>(rc ? rc.c1 : 0);
  // --- Name Manager ---
  const [nmName, setNmName] = useState('');
  const [nmRefers, setNmRefers] = useState('');

  if (kind === 'numfmt' || kind === 'pastespecial' || kind === 'gotospecial') {
    return <AutomationDialog kind={kind} data={data} rect={rect} active={active} clip={clip} onApply={onApply} onClose={onClose} />;
  }

  if (kind === 'names') {
    const valid = /^[A-Za-z_][A-Za-z0-9_.]*$/.test(nmName) && !E.parseKey(nmName) && nmRefers.trim() !== '';
    const existing = Object.entries(data.names ?? {});
    return (
      <Shell
        title="Name Manager"
        onClose={onClose}
        footer={
          <>
            <Btn onClick={onClose}>Close</Btn>
            <Btn
              primary
              disabled={!valid}
              onClick={() => {
                const refers = nmRefers.trim();
                onApply({ ...data, names: { ...data.names, [nmName.toUpperCase()]: refers.startsWith('=') ? refers : refers.replace(/\$/g, '').toUpperCase() } }, `Name ${nmName.toUpperCase()} defined`, 'define-name');
              }}
            >
              Add name
            </Btn>
          </>
        }
      >
        <p className="text-xs text-[#1F4D3A]/70">
          A name can point at cells (like <strong>B2:B9</strong>) or hold a formula (like <strong>=LAMBDA(x,x*0.2)</strong>), which turns it into your own function.
        </p>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#1F4D3A]/60">Name</span>
          <input autoFocus aria-label="Name" className={inputCls} value={nmName} onChange={(e) => setNmName(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#1F4D3A]/60">Refers to</span>
          <input aria-label="Refers to" className={inputCls} placeholder="=LAMBDA(x,x*2)" value={nmRefers} onChange={(e) => setNmRefers(e.target.value)} />
        </label>
        {existing.length > 0 && (
          <ul className="max-h-24 space-y-0.5 overflow-auto rounded border border-[#1F4D3A]/15 bg-[#F7F8F4] p-2 text-xs">
            {existing.map(([k, v]) => (
              <li key={k} className="flex justify-between gap-3">
                <strong>{k}</strong>
                <span className="truncate font-mono text-[#1F4D3A]/70">{v}</span>
              </li>
            ))}
          </ul>
        )}
      </Shell>
    );
  }

  if (kind === 'sort') {
    if (!rc) return <Shell title="Sort" onClose={onClose} footer={<Btn onClick={onClose}>OK</Btn>}>Click a cell inside your data first.</Shell>;
    const cols = Array.from({ length: rc.c2 - rc.c1 + 1 }, (_, i) => rc.c1 + i);
    const first = rc.r1 + (header ? 1 : 0);
    const isNum = (c: number) => typeof E.buildEvaluator(data).value(E.keyOf(c, first)) === 'number';
    return (
      <Shell
        title="Sort"
        onClose={onClose}
        footer={
          <>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn primary onClick={() => onApply(T.sortRows(data, rc, levels, header), 'Sorted', 'sort')}>
              OK
            </Btn>
          </>
        }
      >
        <Check label="My data has headers" on={header} set={setHeader} />
        {levels.map((lv, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-semibold text-[#1F4D3A]/60">{i === 0 ? 'Sort by' : 'Then by'}</span>
            <select
              aria-label={`Sort level ${i + 1} column`}
              className={inputCls}
              value={lv.col}
              onChange={(e) => setLevels(levels.map((l, j) => (j === i ? { ...l, col: Number(e.target.value) } : l)))}
            >
              {cols.map((c) => (
                <option key={c} value={c}>
                  {headerName(data, rc, c, header)}
                </option>
              ))}
            </select>
            <select
              aria-label={`Sort level ${i + 1} order`}
              className={inputCls}
              value={lv.asc ? 'asc' : 'desc'}
              onChange={(e) => setLevels(levels.map((l, j) => (j === i ? { ...l, asc: e.target.value === 'asc' } : l)))}
            >
              <option value="asc">{isNum(lv.col) ? 'Smallest to Largest' : 'A to Z'}</option>
              <option value="desc">{isNum(lv.col) ? 'Largest to Smallest' : 'Z to A'}</option>
            </select>
          </div>
        ))}
        {levels.length < 3 && (
          <button type="button" className="text-xs font-semibold text-[#1D766B] hover:underline" onClick={() => setLevels([...levels, { col: cols[0], asc: true }])}>
            + Add level
          </button>
        )}
      </Shell>
    );
  }

  if (kind === 'dedupe') {
    if (!rc) return <Shell title="Remove Duplicates" onClose={onClose} footer={<Btn onClick={onClose}>OK</Btn>}>Click a cell inside your data first.</Shell>;
    const cols = Array.from({ length: rc.c2 - rc.c1 + 1 }, (_, i) => rc.c1 + i);
    return (
      <Shell
        title="Remove Duplicates"
        onClose={onClose}
        footer={
          <>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn
              primary
              disabled={!dupCols.length}
              onClick={() => {
                const res = T.removeDuplicates(data, rc, dupCols, header);
                const kept = rc.r2 - rc.r1 + 1 - (header ? 1 : 0) - res.removed;
                onApply(res.data, `${res.removed} duplicate values found and removed; ${kept} unique values remain.`, 'dedupe');
              }}
            >
              OK
            </Btn>
          </>
        }
      >
        <Check label="My data has headers" on={header} set={setHeader} />
        <p className="text-xs font-semibold text-[#1F4D3A]/60">Rows are duplicates when ALL the ticked columns match:</p>
        {cols.map((c) => (
          <Check
            key={c}
            label={headerName(data, rc, c, header)}
            on={dupCols.includes(c)}
            set={(v) => setDupCols(v ? [...dupCols, c] : dupCols.filter((x) => x !== c))}
          />
        ))}
      </Shell>
    );
  }

  if (kind === 'text2col') {
    const multi = rect.c1 !== rect.c2 || rect.r1 !== rect.r2;
    const region = T.currentRegion(data, active);
    const col = multi ? rect.c1 : active.c;
    const r1 = multi ? rect.r1 : active.r;
    const r2 = multi ? rect.r2 : (region?.r2 ?? active.r);
    const chars: Record<string, string> = { tab: '\t', semicolon: ';', comma: ',', space: ' ' };
    const chosen = [...Object.entries(delims).filter(([k, on]) => on && chars[k]).map(([k]) => chars[k]), ...(delims.other && other ? [other] : [])];
    return (
      <Shell
        title="Text to Columns"
        onClose={onClose}
        footer={
          <>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn primary disabled={!chosen.length} onClick={() => onApply(T.textToColumns(data, col, r1, r2, chosen, consec), 'Text split into columns', 'text-to-columns')}>
              Finish
            </Btn>
          </>
        }
      >
        <p className="text-xs text-[#1F4D3A]/70">
          Splitting {E.rectLabel({ c1: col, r1, c2: col, r2 })}. Choose what separates the pieces:
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {(['tab', 'semicolon', 'comma', 'space'] as const).map((k) => (
            <Check key={k} label={k[0].toUpperCase() + k.slice(1)} on={!!delims[k]} set={(v) => setDelims({ ...delims, [k]: v })} />
          ))}
          <div className="col-span-2 flex items-center gap-2">
            <Check label="Other:" on={!!delims.other} set={(v) => setDelims({ ...delims, other: v })} />
            <input aria-label="Other delimiter" className={`${inputCls} w-20`} value={other} maxLength={3} onChange={(e) => setOther(e.target.value)} />
          </div>
        </div>
        <Check label="Treat consecutive delimiters as one" on={consec} set={setConsec} />
      </Shell>
    );
  }

  if (kind === 'find') {
    return (
      <Shell
        title="Find and Replace"
        onClose={onClose}
        footer={
          <>
            <Btn onClick={onClose}>Close</Btn>
            <Btn
              primary
              disabled={!find}
              onClick={() => {
                const res = T.findReplace(data, find, repl, { matchCase, wholeCell });
                setFound(res.count ? `${res.count} replacement${res.count === 1 ? '' : 's'} made.` : 'We could not find a match.');
                if (res.count) onApply(res.data, `${res.count} replacement${res.count === 1 ? '' : 's'} made`, 'find-replace');
              }}
            >
              Replace All
            </Btn>
          </>
        }
      >
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#1F4D3A]/60">Find what</span>
          <input autoFocus aria-label="Find what" className={inputCls} value={find} onChange={(e) => setFind(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#1F4D3A]/60">Replace with</span>
          <input aria-label="Replace with" className={inputCls} value={repl} onChange={(e) => setRepl(e.target.value)} />
        </label>
        <div className="flex gap-4">
          <Check label="Match case" on={matchCase} set={setMatchCase} />
          <Check label="Match entire cell" on={wholeCell} set={setWholeCell} />
        </div>
        <p className="text-xs text-[#1F4D3A]/60">Wildcards: * is any text, ? is any one character.</p>
        {found && <p className="text-xs font-semibold text-[#1D766B]">{found}</p>}
      </Shell>
    );
  }

  if (kind === 'goalseek') {
    return (
      <Shell
        title="Goal Seek"
        onClose={onClose}
        footer={
          <>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn
              primary
              disabled={!setCell || toValue === '' || !byCell}
              onClick={() => {
                const target = Number.parseFloat(toValue);
                const res = T.goalSeek(data, setCell.toUpperCase().replace(/\$/g, ''), target, byCell.toUpperCase().replace(/\$/g, ''));
                onApply(res.data, res.ok ? `Goal Seeking found a solution: ${byCell.toUpperCase()} = ${res.value}` : 'Goal Seeking may not have found a solution.', 'goal-seek');
              }}
            >
              OK
            </Btn>
          </>
        }
      >
        <p className="text-xs text-[#1F4D3A]/70">Make a formula reach a target by changing one input cell.</p>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#1F4D3A]/60">Set cell (the formula)</span>
          <input aria-label="Set cell" className={inputCls} value={setCell} onChange={(e) => setSetCell(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#1F4D3A]/60">To value</span>
          <input aria-label="To value" className={inputCls} value={toValue} onChange={(e) => setToValue(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#1F4D3A]/60">By changing cell</span>
          <input aria-label="By changing cell" className={inputCls} value={byCell} onChange={(e) => setByCell(e.target.value)} />
        </label>
      </Shell>
    );
  }

  if (kind === 'datatable') {
    return (
      <Shell
        title="Data Table"
        onClose={onClose}
        footer={
          <>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn
              primary
              disabled={!rowIn && !colIn}
              onClick={() => onApply(T.dataTable(data, rect, rowIn ? rowIn.toUpperCase().replace(/\$/g, '') : null, colIn ? colIn.toUpperCase().replace(/\$/g, '') : null), 'Data table filled', 'data-table')}
            >
              OK
            </Btn>
          </>
        }
      >
        <p className="text-xs text-[#1F4D3A]/70">
          Selection {E.rectLabel(rect)}: formula in the top-left corner, trial values across the top and down the left.
        </p>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#1F4D3A]/60">Row input cell (values across the top)</span>
          <input aria-label="Row input cell" className={inputCls} value={rowIn} onChange={(e) => setRowIn(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#1F4D3A]/60">Column input cell (values down the left)</span>
          <input aria-label="Column input cell" className={inputCls} value={colIn} onChange={(e) => setColIn(e.target.value)} />
        </label>
      </Shell>
    );
  }

  // slicer
  const sRc = rc;
  if (!sRc) return <Shell title="Insert Slicer" onClose={onClose} footer={<Btn onClick={onClose}>OK</Btn>}>Click a cell inside your table first.</Shell>;
  const cols = Array.from({ length: sRc.c2 - sRc.c1 + 1 }, (_, i) => sRc.c1 + i);
  return (
    <Shell
      title="Insert Slicers"
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn
            primary
            onClick={() => {
              const name = (data.cells[E.keyOf(slicerCol, sRc.r1)] ?? `Column ${E.colLabel(slicerCol)}`).trim();
              const filter = data.filter ?? { range: E.rectLabel(sRc), cols: {} };
              onApply({ ...data, slicers: [...(data.slicers ?? []).filter((s) => s.col !== slicerCol), { col: slicerCol, name }], filter }, `Slicer added: ${name}`, 'slicer');
            }}
          >
            OK
          </Btn>
        </>
      }
    >
      <p className="text-xs text-[#1F4D3A]/70">Pick the column to filter with buttons:</p>
      {cols.map((c) => (
        <label key={c} className="flex cursor-pointer items-center gap-2">
          <input type="radio" name="slicer-col" checked={slicerCol === c} onChange={() => setSlicerCol(c)} className="size-4 accent-[#1F4D3A]" />
          {headerName(data, sRc, c, true)}
        </label>
      ))}
    </Shell>
  );
}

// ---------------------------------------------------------------------------
// Column filter dropdown (opened from the header arrows)
// ---------------------------------------------------------------------------
export function FilterMenu({
  data,
  col,
  onApply,
  onClose,
}: {
  data: E.SheetData;
  col: number;
  onApply: (data: E.SheetData, note: string, event: string) => void;
  onClose: () => void;
}) {
  const filter = data.filter as E.FilterState;
  const all = useMemo(() => T.uniqueValues(data, filter, col), [data, filter, col]);
  const cur = filter.cols[col];
  const [picked, setPicked] = useState<string[]>(cur?.values ?? all);
  const [query, setQuery] = useState('');
  const [op, setOp] = useState<E.FilterSpec['op'] | ''>(cur?.op ?? '');
  const [val, setVal] = useState(cur?.val ?? '');
  const shown = all.filter((v) => v.toLowerCase().includes(query.toLowerCase()));
  const header = (data.cells[E.keyOf(col, (T.filterRect(filter) as E.Rect).r1)] ?? '').trim() || `Column ${E.colLabel(col)}`;

  const commit = (spec: E.FilterSpec | null, event: string) => {
    const cols = { ...filter.cols };
    if (spec) cols[col] = spec;
    else delete cols[col];
    onApply(T.applyFilter(data, { ...filter, cols }), spec ? `Filtered by ${header}` : `Filter cleared from ${header}`, event);
  };

  return (
    <div className="w-56 rounded-md border border-[#1F4D3A] bg-white text-[13px] shadow-[0_8px_24px_rgba(0,0,0,0.22)]" onMouseDown={(e) => e.stopPropagation()}>
      <div className="space-y-2 p-2.5">
        <div className="flex gap-1">
          <select aria-label="Number filter" className={`${inputCls} w-20`} value={op} onChange={(e) => setOp(e.target.value as E.FilterSpec['op'] | '')}>
            <option value="">Filter…</option>
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
            <option value=">=">&gt;=</option>
            <option value="<=">&lt;=</option>
            <option value="=">=</option>
            <option value="<>">&lt;&gt;</option>
            <option value="contains">contains</option>
          </select>
          <input aria-label="Filter value" className={inputCls} value={val} placeholder="value" onChange={(e) => setVal(e.target.value)} />
        </div>
        <input aria-label="Search values" className={inputCls} placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="max-h-36 overflow-y-auto rounded border border-[#1F4D3A]/15 p-1.5">
          <label className="flex cursor-pointer items-center gap-2 py-0.5 font-semibold">
            <input
              type="checkbox"
              className="size-4 accent-[#1F4D3A]"
              checked={picked.length === all.length}
              onChange={(e) => setPicked(e.target.checked ? all : [])}
            />
            (Select All)
          </label>
          {shown.map((v) => (
            <label key={v} className="flex cursor-pointer items-center gap-2 py-0.5">
              <input
                type="checkbox"
                className="size-4 accent-[#1F4D3A]"
                checked={picked.includes(v)}
                onChange={(e) => setPicked(e.target.checked ? [...picked, v] : picked.filter((x) => x !== v))}
              />
              <span className="truncate">{v === '' ? '(Blanks)' : v}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-between gap-2">
          <Btn onClick={() => commit(null, 'filter-clear')}>Clear</Btn>
          <div className="flex gap-1.5">
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn
              primary
              onClick={() => {
                const spec: E.FilterSpec = {};
                if (op && val !== '') {
                  spec.op = op;
                  spec.val = val;
                }
                if (picked.length !== all.length) spec.values = picked;
                commit(spec.op || spec.values ? spec : null, 'filter');
              }}
            >
              OK
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slicer bar: one button per distinct value, above the grid
// ---------------------------------------------------------------------------
export function SlicerBar({ data, onApply }: { data: E.SheetData; onApply: Apply }) {
  const filter = data.filter;
  if (!data.slicers?.length || !filter) return null;
  return (
    <div className="flex flex-wrap items-start gap-3 border-b border-[#1F4D3A]/10 bg-[#F7F8F4] px-3 py-2">
      {data.slicers.map((s) => {
        const vals = T.uniqueValues(data, filter, s.col);
        const sel = filter.cols[s.col]?.values ?? vals;
        return (
          <div key={s.col} className="rounded-md border border-[#1F4D3A]/20 bg-white">
            <div className="flex items-center justify-between border-b border-[#1F4D3A]/10 bg-[#1F4D3A] px-2 py-0.5 text-[11px] font-semibold text-[#C7F000]">
              {s.name}
              <button
                type="button"
                title="Clear filter"
                aria-label={`Clear ${s.name} filter`}
                className="ml-2 text-white/80 hover:text-white"
                onClick={() => {
                  const cols = { ...filter.cols };
                  delete cols[s.col];
                  onApply(T.applyFilter(data, { ...filter, cols }), `${s.name} slicer cleared`, 'slicer-clear');
                }}
              >
                ⨯
              </button>
            </div>
            <div className="flex flex-wrap gap-1 p-1.5">
              {vals.map((v) => {
                const on = sel.includes(v);
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      // First click selects only that value; clicking more values adds them.
                      const all = filter.cols[s.col]?.values === undefined;
                      const next = all ? [v] : on ? sel.filter((x) => x !== v) : [...sel, v];
                      const cols = { ...filter.cols };
                      if (next.length === 0 || next.length === vals.length) delete cols[s.col];
                      else cols[s.col] = { values: next };
                      onApply(T.applyFilter(data, { ...filter, cols }), `Slicer: ${s.name}`, 'slicer-click');
                    }}
                    className={`rounded px-2 py-0.5 text-[12px] font-medium ${on ? 'bg-[#C7F000] text-[#1F4D3A]' : 'bg-[#EEF1EA] text-[#6B7280]'}`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
