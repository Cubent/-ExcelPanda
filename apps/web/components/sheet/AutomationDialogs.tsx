'use client';

import { useState } from 'react';
import * as E from './engine';
import * as T from './tools';
import { Btn, Check, Shell, inputCls, workingRect } from './ToolDialogs';

type Apply = (data: E.SheetData, note: string, event: string) => void;
export type AutomationKind = 'numfmt' | 'pastespecial' | 'gotospecial';
type Props = { kind: AutomationKind; data: E.SheetData; rect: E.Rect; active: E.Pos; clip?: T.ClipLike | null; onApply: Apply; onClose: () => void };

const PRESETS = ['0.0,"k"', '#,##0', '#,##0.00', '0.0%', '$#,##0', '#,##0;[Red]-#,##0', '0 "units"', '000', 'dd-mmm-yy'];

function Radio<V extends string>({ name, value, label, cur, set }: { name: string; value: V; label: string; cur: V; set: (v: V) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="radio" name={name} checked={cur === value} onChange={() => set(value)} className="size-4 accent-[#1F4D3A]" />
      {label}
    </label>
  );
}

export function AutomationDialog({ kind, data, rect, active, clip, onApply, onClose }: Props) {
  const [nfText, setNfText] = useState(() => data.styles[E.keyOf(active.c, active.r)]?.nf ?? '');
  const [pWhat, setPWhat] = useState<T.PasteWhat>('all');
  const [pOp, setPOp] = useState<T.PasteOp>('none');
  const [pTranspose, setPTranspose] = useState(false);
  const [pSkip, setPSkip] = useState(false);
  const [gAct, setGAct] = useState<'blanks-above' | 'blanks-value' | 'constants' | 'formulas'>('blanks-above');
  const [gValue, setGValue] = useState('');

  if (kind === 'numfmt') {
    const key = E.keyOf(active.c, active.r);
    const v = E.buildEvaluator(data).value(key);
    const sample = v === null || v instanceof E.XlError || typeof v === 'boolean' ? '' : E.formatValue(v, { nf: nfText || undefined }, data.cells[key] ?? '');
    return (
      <Shell
        title="Format Cells: Custom number format"
        onClose={onClose}
        footer={
          <>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn primary onClick={() => onApply(T.setNumberFormat(data, rect, nfText), nfText.trim() ? `Number format ${nfText} applied.` : 'Number format cleared.', 'number-format')}>
              OK
            </Btn>
          </>
        }
      >
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[#1F4D3A]/60">Type</span>
          <input aria-label="Number format" className={`${inputCls} font-mono`} value={nfText} onChange={(e) => setNfText(e.target.value)} placeholder='e.g. 0.0,"k"' />
        </label>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => setNfText(p)} className="rounded bg-[#EEF1EA] px-2 py-0.5 font-mono text-xs text-[#1F4D3A] hover:bg-[#1F4D3A]/10">
              {p}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#1F4D3A]/60">
          Sample: <strong className="text-[#1F4D3A]">{sample || ' '}</strong>
        </p>
      </Shell>
    );
  }

  if (kind === 'pastespecial') {
    if (!clip) {
      return (
        <Shell title="Paste Special" onClose={onClose} footer={<Btn onClick={onClose}>OK</Btn>}>
          Copy some cells first (Ctrl+C).
        </Shell>
      );
    }
    return (
      <Shell
        title="Paste Special"
        onClose={onClose}
        footer={
          <>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn primary onClick={() => onApply(T.pasteSpecial(data, clip, rect, { what: pWhat, op: pOp, transpose: pTranspose, skipBlanks: pSkip }), 'Pasted special.', 'paste-special')}>
              OK
            </Btn>
          </>
        }
      >
        <div>
          <p className="mb-1 text-xs font-semibold text-[#1F4D3A]/60">Paste</p>
          <div className="grid grid-cols-2 gap-1">
            <Radio name="what" value="all" label="All" cur={pWhat} set={setPWhat} />
            <Radio name="what" value="values" label="Values" cur={pWhat} set={setPWhat} />
            <Radio name="what" value="formulas" label="Formulas" cur={pWhat} set={setPWhat} />
            <Radio name="what" value="formats" label="Formats" cur={pWhat} set={setPWhat} />
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-[#1F4D3A]/60">Operation</p>
          <div className="grid grid-cols-3 gap-1">
            <Radio name="op" value="none" label="None" cur={pOp} set={setPOp} />
            <Radio name="op" value="add" label="Add" cur={pOp} set={setPOp} />
            <Radio name="op" value="subtract" label="Subtract" cur={pOp} set={setPOp} />
            <Radio name="op" value="multiply" label="Multiply" cur={pOp} set={setPOp} />
            <Radio name="op" value="divide" label="Divide" cur={pOp} set={setPOp} />
          </div>
        </div>
        <Check label="Skip blanks" on={pSkip} set={setPSkip} />
        <Check label="Transpose" on={pTranspose} set={setPTranspose} />
      </Shell>
    );
  }

  const rcg = workingRect(data, rect, active);
  if (!rcg) {
    return (
      <Shell title="Go To Special" onClose={onClose} footer={<Btn onClick={onClose}>OK</Btn>}>
        Select a block of cells first.
      </Shell>
    );
  }
  const n = T.countSpecial(data, rcg);
  return (
    <Shell
      title={`Go To Special: ${E.rectLabel(rcg)}`}
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn
            primary
            onClick={() => {
              const out = gAct === 'blanks-above' ? T.fillBlanks(data, rcg, 'above') : gAct === 'blanks-value' ? T.fillBlanks(data, rcg, 'value', gValue) : gAct === 'constants' ? T.clearConstants(data, rcg) : T.formulasToValues(data, rcg);
              onApply(out, 'Done.', 'goto-special');
            }}
          >
            OK
          </Btn>
        </>
      }
    >
      <Radio name="gts" value="blanks-above" label={`Blanks (${n.blanks}): fill with the cell above`} cur={gAct} set={setGAct} />
      <Radio name="gts" value="blanks-value" label={`Blanks (${n.blanks}): fill with a value`} cur={gAct} set={setGAct} />
      <Radio name="gts" value="constants" label={`Constants (${n.constants}): clear typed values, keep formulas`} cur={gAct} set={setGAct} />
      <Radio name="gts" value="formulas" label={`Formulas (${n.formulas}): replace with their values`} cur={gAct} set={setGAct} />
      {gAct === 'blanks-value' && <input aria-label="Fill value" className={inputCls} value={gValue} onChange={(e) => setGValue(e.target.value)} placeholder="Value" />}
    </Shell>
  );
}
