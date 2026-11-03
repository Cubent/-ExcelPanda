'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as E from '@/components/sheet/engine';
import { SheetModel, type SheetPatch } from '@/components/sheet/sheet-api';
import type { SheetSnapshot } from '@/components/sheet/SheetGrid';
import { runScript } from '@/components/sheet/ts-script';
import { listProcs, runVba, userFunctions } from '@/components/sheet/vba';

export type TrustLevel = 'disable' | 'notify' | 'signed' | 'enable';
export type MacroConfig = {
  lang: 'vba' | 'ts';
  /** Code the editor starts with. */
  code?: string;
  /** The code cannot be edited (for reading lessons). */
  locked?: boolean;
  /** Show the macro recorder. */
  record?: boolean;
  /** Show the button assignment area. */
  buttons?: boolean;
  /** Show Trust Center and file type settings. */
  trust?: boolean;
  /** The Trust Center level the lesson starts at. */
  trustStart?: TrustLevel;
};
export type MacroRun = { count: number; proc: string; ok: boolean; error?: { line: number; message: string }; output: string[] };
export type MacroState = {
  lang: 'vba' | 'ts';
  code: string;
  subs: string[];
  functions: string[];
  syntaxError?: string;
  run: MacroRun | null;
  /** True while the recorder is running. */
  recording: boolean;
  /** Names of macros recorded in this session, and whether relative references were on. */
  recorded: { name: string; relative: boolean }[];
  buttons: { label: string; macro: string }[];
  buttonRuns: number;
  trust: TrustLevel;
  fileType: 'xlsx' | 'xlsm';
  /** Macro name to its assigned shortcut letter. */
  shortcuts: Record<string, string>;
};

const sel = 'h-8 rounded-md border border-[#1F4D3A]/25 bg-white px-2 text-[13px] outline-none focus:border-[#1F4D3A]';
const btn = 'h-8 rounded-md px-3 text-xs font-bold disabled:opacity-40';

const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
const colName = (c: number) => E.colLabel(c);
const cellName = (p: E.Pos) => `${colName(p.c)}${p.r + 1}`;
const valueLiteral = (raw: string) => (raw.startsWith('=') ? null : /^-?\d+(\.\d+)?$/.test(raw.trim()) ? raw.trim() : q(raw));

/** Turns what changed between two sheet snapshots into recorded VBA lines. */
function recordStep(prev: SheetSnapshot, next: SheetSnapshot, relative: boolean): string[] {
  const lines: string[] = [];
  const keys = new Set([...Object.keys(prev.data.cells), ...Object.keys(next.data.cells)]);
  const prevKey = E.keyOf(prev.active.c, prev.active.r);
  for (const k of keys) {
    const a = prev.data.cells[k] ?? '';
    const b = next.data.cells[k] ?? '';
    if (a === b) continue;
    const target = k === prevKey ? 'ActiveCell' : `Range(${q(k)})`;
    if (b === '') lines.push(`${target}.ClearContents`);
    else if (b.startsWith('=')) lines.push(`${target}.Formula = ${q(b)}`);
    else lines.push(`${target}.Value = ${valueLiteral(b)}`);
  }
  const skeys = new Set([...Object.keys(prev.data.styles), ...Object.keys(next.data.styles)]);
  let boldOn: boolean | null = null;
  let nf: string | null | undefined;
  for (const k of skeys) {
    const a = prev.data.styles[k] ?? {};
    const b = next.data.styles[k] ?? {};
    if (!!a.b !== !!b.b) boldOn = !!b.b;
    if (a.nf !== b.nf) nf = b.nf ?? 'General';
  }
  const moved = prev.active.c !== next.active.c || prev.active.r !== next.active.r || prev.rect.c2 !== next.rect.c2 || prev.rect.r2 !== next.rect.r2;
  if (boldOn !== null) lines.push(`Selection.Font.Bold = ${boldOn ? 'True' : 'False'}`);
  if (nf) lines.push(`Selection.NumberFormat = ${q(nf)}`);
  if (moved) {
    const multi = next.rect.c1 !== next.rect.c2 || next.rect.r1 !== next.rect.r2;
    if (multi) lines.push(relative ? `ActiveCell.Range(${q(E.rectLabel({ c1: 0, r1: 0, c2: next.rect.c2 - next.rect.c1, r2: next.rect.r2 - next.rect.r1 }))}).Select` : `Range(${q(E.rectLabel(next.rect))}).Select`);
    else if (relative) lines.push(`ActiveCell.Offset(${next.active.r - prev.active.r}, ${next.active.c - prev.active.c}).Select`);
    else lines.push(`Range(${q(cellName(next.active))}).Select`);
  }
  return lines;
}

export function MacroPanel({
  config,
  snap,
  onState,
  onRun,
  onUdfs,
}: {
  config: MacroConfig;
  snap: SheetSnapshot | null;
  onState: (s: MacroState) => void;
  /** Applies a macro's result to the sheet. */
  onRun: (patch: SheetPatch, selection: { active: E.Pos; sel: E.Rect }) => void;
  /** Registers VBA functions for use in cell formulas. */
  onUdfs: (fns: Record<string, (args: E.Scalar[]) => E.Scalar>) => void;
}) {
  const [code, setCode] = useState(config.code ?? '');
  const [run, setRun] = useState<MacroRun | null>(null);
  const [recording, setRecording] = useState(false);
  const [relative, setRelative] = useState(false);
  const [recName, setRecName] = useState('Macro1');
  const [recLines, setRecLines] = useState<string[]>([]);
  const [recBase, setRecBase] = useState('');
  const [recorded, setRecorded] = useState<{ name: string; relative: boolean }[]>([]);
  const [buttons, setButtons] = useState<{ label: string; macro: string }[]>([]);
  const [buttonRuns, setButtonRuns] = useState(0);
  const [btnLabel, setBtnLabel] = useState('');
  const [btnMacro, setBtnMacro] = useState('');
  const [trust, setTrust] = useState<TrustLevel>(config.trustStart ?? 'disable');
  const [fileType, setFileType] = useState<'xlsx' | 'xlsm'>('xlsx');
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({});
  const [pick, setPick] = useState('');
  const prevSnap = useRef<SheetSnapshot | null>(null);
  const snapRef = useRef(snap);
  snapRef.current = snap;

  const shown = recording ? `${recBase}${recBase && !recBase.endsWith('\n') ? '\n' : ''}${recBase ? '\n' : ''}Sub ${recName}()\n${recLines.map((l) => `    ${l}`).join('\n')}${recLines.length ? '\n' : ''}End Sub\n` : code;
  const procs = useMemo(() => (config.lang === 'vba' ? listProcs(shown) : { subs: /function\s+main\s*\(/.test(shown) ? ['main'] : [], functions: [] as string[], error: undefined as string | undefined }), [shown, config.lang]);
  const procList = procs.subs;

  // Recorder: turn each change of the sheet into a line of code.
  useEffect(() => {
    // Compare against the last settled sheet (not one captured mid-typing), so a committed edit is seen.
    if (!snap || snap.editing) return;
    const prev = prevSnap.current;
    prevSnap.current = snap;
    if (!recording || !prev) return;
    const lines = recordStep(prev, snap, relative);
    if (lines.length) setRecLines((l) => [...l, ...lines]);
  }, [snap, recording, relative]);

  // VBA Function procedures become worksheet functions.
  useEffect(() => {
    if (config.lang !== 'vba') return;
    onUdfs(userFunctions(shown, () => new SheetModel(E.emptyData())));
    return () => onUdfs({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, config.lang]);

  const state: MacroState = {
    lang: config.lang,
    code: shown,
    subs: procs.subs,
    functions: procs.functions,
    syntaxError: procs.error,
    run,
    recording,
    recorded,
    buttons,
    buttonRuns,
    trust,
    fileType,
    shortcuts,
  };
  const onStateRef = useRef(onState);
  onStateRef.current = onState;
  const stateKey = JSON.stringify(state);
  useEffect(() => {
    onStateRef.current(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey]);

  const execute = (proc: string) => {
    const s = snapRef.current;
    if (!s) return;
    const trusted = !config.trust || trust === 'enable' || trust === 'notify';
    if (!trusted) {
      setRun((r) => ({ count: (r?.count ?? 0) + 1, proc, ok: false, error: { line: 0, message: 'Macros are disabled. Change the Trust Center setting first.' }, output: [] }));
      return;
    }
    const model = new SheetModel(s.data, s.active, s.rect);
    const res = config.lang === 'vba' ? runVba(shown, proc, model) : { ...runScript(shown, model), error: undefined as { line: number; message: string; num: number } | undefined };
    const err = config.lang === 'vba' ? (res as ReturnType<typeof runVba>).error : (res as ReturnType<typeof runScript>).error ? { line: 0, message: (res as ReturnType<typeof runScript>).error?.message ?? '', num: 0 } : undefined;
    // As in Excel, work done before an error stays.
    if (model.changed() || model.active !== s.active) onRun(model.patch(), { active: model.active, sel: model.sel });
    setRun((r) => ({ count: (r?.count ?? 0) + 1, proc, ok: res.ok, error: err ? { line: err.line, message: err.message } : undefined, output: res.output }));
  };

  const startRecording = () => {
    setRecBase(code);
    setRecLines([]);
    setRecName(`Macro${recorded.length + 1}`);
    if (snapRef.current && !snapRef.current.editing) prevSnap.current = snapRef.current;
    setRecording(true);
  };
  const stopRecording = () => {
    setCode(shown);
    setRecorded((r) => [...r, { name: recName, relative }]);
    setRecording(false);
    setPick(recName);
  };

  const lineCount = shown.split('\n').length;
  const lineH = 20;
  const runName = pick && procList.includes(pick) ? pick : (procList[0] ?? '');

  return (
    <div className="sheet-scroll flex h-full min-h-0 flex-col gap-2 overflow-auto bg-white p-3 text-[13px]" aria-label={config.lang === 'vba' ? 'Visual Basic editor' : 'Office Scripts editor'}>
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1F4D3A]/10 pb-2">
        {config.record && (
          <>
            {!recording ? (
              <button type="button" onClick={startRecording} className={`${btn} bg-[#C0392B] text-white`}>
                ● Record macro
              </button>
            ) : (
              <>
                <input aria-label="Macro name" value={recName} onChange={(e) => setRecName(e.target.value.replace(/[^A-Za-z0-9_]/g, ''))} className={`${sel} w-32`} />
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4D3A]/80">
                  <input type="checkbox" aria-label="Use relative references" checked={relative} onChange={(e) => setRelative(e.target.checked)} className="size-4 accent-[#1F4D3A]" />
                  Use relative references
                </label>
                <button type="button" onClick={stopRecording} disabled={!recName} className={`${btn} bg-[#1F4D3A] text-white`}>
                  ■ Stop recording
                </button>
              </>
            )}
          </>
        )}
        {!recording && (
          <>
            <select aria-label="Macro to run" className={`${sel} min-w-36`} value={runName} onChange={(e) => setPick(e.target.value)}>
              {procList.length === 0 && <option value="">No macros</option>}
              {procList.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <button type="button" onClick={() => execute(runName)} disabled={!runName || !!procs.error} className={`${btn} bg-[#C7F000] text-[#1F4D3A]`}>
              ▶ Run
            </button>
          </>
        )}
        {recording && <span className="text-xs font-bold text-[#C0392B]">Recording… do your steps on the Data tab, then come back and stop.</span>}
      </div>

      {config.trust && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[#1F4D3A]/15 bg-[#F7F8F4] p-2.5">
          <label className="min-w-64 flex-1">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Trust Center: macro settings</span>
            <select aria-label="Macro security" className={`${sel} w-full`} value={trust} onChange={(e) => setTrust(e.target.value as TrustLevel)}>
              <option value="disable">Disable all macros without notification</option>
              <option value="notify">Disable all macros with notification</option>
              <option value="signed">Disable all except digitally signed macros</option>
              <option value="enable">Enable all macros (not recommended)</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Save as type</span>
            <select aria-label="Save as type" className={sel} value={fileType} onChange={(e) => setFileType(e.target.value as 'xlsx' | 'xlsm')}>
              <option value="xlsx">Excel Workbook (*.xlsx)</option>
              <option value="xlsm">Excel Macro-Enabled Workbook (*.xlsm)</option>
            </select>
          </label>
          {fileType === 'xlsx' && code.trim() !== '' && <p className="basis-full text-xs font-semibold text-[#C0392B]">An .xlsx file cannot store macros. They would be lost when you save.</p>}
        </div>
      )}

      {config.buttons && (
        <div className="rounded-xl border border-[#1F4D3A]/15 bg-[#F7F8F4] p-2.5">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Buttons and shortcuts</span>
          <div className="flex flex-wrap items-end gap-2">
            <input aria-label="Button text" className={`${sel} w-36`} placeholder="Button text" value={btnLabel} onChange={(e) => setBtnLabel(e.target.value)} />
            <select aria-label="Assign macro" className={`${sel} min-w-32`} value={btnMacro} onChange={(e) => setBtnMacro(e.target.value)}>
              <option value="">Assign macro…</option>
              {procList.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <button type="button" disabled={!btnLabel.trim() || !btnMacro} onClick={() => { setButtons([...buttons, { label: btnLabel.trim(), macro: btnMacro }]); setBtnLabel(''); }} className={`${btn} bg-[#1F4D3A] text-white`}>
              Add button
            </button>
            <label className="flex items-center gap-1 text-xs font-semibold text-[#1F4D3A]/70">
              Shortcut Ctrl+Shift+
              <input
                aria-label="Shortcut key"
                className={`${sel} w-10 text-center uppercase`}
                maxLength={1}
                value={shortcuts[runName] ?? ''}
                onChange={(e) => setShortcuts({ ...shortcuts, [runName]: e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase() })}
              />
              <span className="text-[#1F4D3A]/50">for {runName || 'the chosen macro'}</span>
            </label>
          </div>
          {buttons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2" aria-label="Sheet buttons">
              {buttons.map((b, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setButtonRuns((n) => n + 1);
                    execute(b.macro);
                  }}
                  className="rounded-md border-2 border-[#1F4D3A]/30 bg-gradient-to-b from-white to-[#E7EBE3] px-4 py-1.5 text-xs font-semibold text-[#1F2937] shadow-sm hover:border-[#1F4D3A]"
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="relative min-h-[140px] flex-1 overflow-auto rounded-xl border border-[#1F4D3A]/15 bg-[#FBFCFA]">
        <div className="flex" style={{ minHeight: lineCount * lineH + 16 }}>
          <pre aria-hidden className="select-none border-r border-[#1F4D3A]/10 bg-[#F1F5EF] px-2 py-2 text-right text-xs text-[#1F4D3A]/40" style={{ lineHeight: `${lineH}px`, ...Object.fromEntries([['fontFamily', 'ui-monospace, Consolas, monospace']]) }}>
            {Array.from({ length: lineCount }, (_, i) => i + 1).join('\n')}
          </pre>
          <textarea
            aria-label="Code"
            spellCheck={false}
            readOnly={!!config.locked || recording}
            value={shown}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const t = e.currentTarget;
                const { selectionStart: a, selectionEnd: b } = t;
                const next = `${code.slice(0, a)}    ${code.slice(b)}`;
                setCode(next);
                requestAnimationFrame(() => t.setSelectionRange(a + 4, a + 4));
              }
              e.stopPropagation();
            }}
            className="w-full flex-1 resize-none bg-transparent px-3 py-2 text-[13px] text-[#1F2937] outline-none"
            style={{ lineHeight: `${lineH}px`, height: lineCount * lineH + 16, fontFamily: 'ui-monospace, Consolas, monospace' }}
          />
        </div>
      </div>

      {procs.error && <p className="text-xs font-semibold text-[#C0392B]">Syntax problem: {procs.error}</p>}
      {run && (
        <div className={`rounded-lg px-3 py-2 text-xs ${run.ok ? 'bg-[#E8F5E9] text-[#1D766B]' : 'bg-[#FDECEA] text-[#C0392B]'}`} aria-live="polite">
          <p className="font-bold">
            {run.ok ? `✓ ${run.proc} ran.` : `✗ ${run.proc} stopped${run.error?.line ? ` on line ${run.error.line}` : ''}.`} {run.error?.message}
          </p>
          {run.output.map((o, i) => (
            <p key={i} className="mt-0.5 font-mono text-[#1F2937]">
              {o}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
