'use client';

import { useEffect, useRef, useState } from 'react';

export const TRIGGERS = ['Manually trigger a flow', 'Recurrence (schedule)', 'When a file is created in a folder', 'When a new email arrives'] as const;
export const ACTIONS = ['Run script (Excel Online)', 'Send an email (V2)', 'Post a message in Teams', 'Create file (OneDrive)', 'Condition'] as const;
export type FlowTrigger = (typeof TRIGGERS)[number];
export type FlowAction = (typeof ACTIONS)[number];
export type FlowConfig = {
  /** Offer only these triggers / actions (default: all). */
  triggers?: FlowTrigger[];
  actions?: FlowAction[];
  /** Flow the lesson starts with. */
  initial?: { trigger?: FlowTrigger; recurrence?: Recurrence; steps?: FlowStep[] };
};
export type Recurrence = { frequency: 'Minute' | 'Hour' | 'Day' | 'Week' | 'Month'; interval: number; hour: number };
export type FlowStep = { action: FlowAction; setting: string };
export type FlowState = {
  trigger: FlowTrigger | '';
  recurrence: Recurrence;
  steps: FlowStep[];
  on: boolean;
  /** Number of successful test runs. */
  tests: number;
  log: string[];
};

const sel = 'h-8 rounded-md border border-[#1F4D3A]/25 bg-white px-2 text-[13px] outline-none focus:border-[#1F4D3A]';
const SETTING_HINT: Record<FlowAction, string> = {
  'Run script (Excel Online)': 'Script name',
  'Send an email (V2)': 'To (email address)',
  'Post a message in Teams': 'Channel',
  'Create file (OneDrive)': 'File name',
  Condition: 'Condition, e.g. rows > 0',
};

export function FlowPanel({ config, onState }: { config: FlowConfig; onState: (s: FlowState) => void }) {
  const [trigger, setTrigger] = useState<FlowTrigger | ''>(config.initial?.trigger ?? '');
  const [rec, setRec] = useState<Recurrence>(config.initial?.recurrence ?? { frequency: 'Day', interval: 1, hour: 7 });
  const [steps, setSteps] = useState<FlowStep[]>(config.initial?.steps ?? []);
  const [on, setOn] = useState(true);
  const [tests, setTests] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const triggers = config.triggers ?? [...TRIGGERS];
  const actions = config.actions ?? [...ACTIONS];

  const ref = useRef(onState);
  ref.current = onState;
  const state: FlowState = { trigger, recurrence: rec, steps, on, tests, log };
  const key = JSON.stringify(state);
  useEffect(() => {
    ref.current(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const test = () => {
    const out: string[] = [];
    if (!trigger) {
      setLog(['The flow needs a trigger.']);
      return;
    }
    out.push(trigger === 'Recurrence (schedule)' ? `Trigger fired: every ${rec.interval} ${rec.frequency.toLowerCase()}${rec.interval > 1 ? 's' : ''}${rec.frequency === 'Day' || rec.frequency === 'Week' || rec.frequency === 'Month' ? ` at ${String(rec.hour).padStart(2, '0')}:00` : ''}` : `Trigger fired: ${trigger}`);
    if (!steps.length) {
      setLog([...out, 'The flow has no actions yet.']);
      return;
    }
    let bad = false;
    steps.forEach((s, i) => {
      if (!s.setting.trim()) {
        out.push(`✗ Step ${i + 1}: ${s.action}. Missing: ${SETTING_HINT[s.action]}.`);
        bad = true;
      } else out.push(`✓ Step ${i + 1}: ${s.action} (${s.setting})`);
    });
    setLog(out);
    if (!bad) setTests((n) => n + 1);
  };

  return (
    <div className="sheet-scroll flex h-full min-h-0 flex-col gap-3 overflow-auto bg-white p-3 text-[13px]" aria-label="Flow builder">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-[#1F4D3A]/55">Power Automate: cloud flow</span>
        <label className="flex items-center gap-2 text-xs font-semibold text-[#1F4D3A]/80">
          <input type="checkbox" aria-label="Flow is on" checked={on} onChange={(e) => setOn(e.target.checked)} className="size-4 accent-[#1F4D3A]" />
          {on ? 'On' : 'Off'}
        </label>
      </div>

      <div className="rounded-xl border-2 border-[#1F4D3A]/25 bg-[#F7F8F4] p-3">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Trigger</span>
        <select aria-label="Trigger" className={`${sel} w-full`} value={trigger} onChange={(e) => setTrigger(e.target.value as FlowTrigger)}>
          <option value="">Choose a trigger…</option>
          {triggers.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        {trigger === 'Recurrence (schedule)' && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span>Every</span>
            <input aria-label="Interval" type="number" min={1} className={`${sel} w-16`} value={rec.interval} onChange={(e) => setRec({ ...rec, interval: Math.max(1, Number(e.target.value) || 1) })} />
            <select aria-label="Frequency" className={sel} value={rec.frequency} onChange={(e) => setRec({ ...rec, frequency: e.target.value as Recurrence['frequency'] })}>
              {['Minute', 'Hour', 'Day', 'Week', 'Month'].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
            {['Day', 'Week', 'Month'].includes(rec.frequency) && (
              <>
                <span>at</span>
                <select aria-label="Hour" className={sel} value={rec.hour} onChange={(e) => setRec({ ...rec, hour: Number(e.target.value) })}>
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}
      </div>

      {steps.map((s, i) => (
        <div key={i} className="rounded-xl border border-[#1F4D3A]/20 bg-white p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#1F4D3A]/55">Step {i + 1}</span>
            <span className="flex gap-1">
              <button type="button" aria-label={`Move step ${i + 1} up`} disabled={i === 0} onClick={() => setSteps(steps.map((x, j, a) => (j === i - 1 ? a[i] : j === i ? a[i - 1] : x)))} className="rounded px-1.5 text-[#1F4D3A]/60 hover:bg-[#1F4D3A]/8 disabled:opacity-30">
                ↑
              </button>
              <button type="button" aria-label={`Move step ${i + 1} down`} disabled={i === steps.length - 1} onClick={() => setSteps(steps.map((x, j, a) => (j === i + 1 ? a[i] : j === i ? a[i + 1] : x)))} className="rounded px-1.5 text-[#1F4D3A]/60 hover:bg-[#1F4D3A]/8 disabled:opacity-30">
                ↓
              </button>
              <button type="button" aria-label={`Delete step ${i + 1}`} onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="rounded px-1.5 text-[#1F4D3A]/60 hover:text-[#C0392B]">
                ×
              </button>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <select aria-label={`Action ${i + 1}`} className={`${sel} min-w-52`} value={s.action} onChange={(e) => setSteps(steps.map((x, j) => (j === i ? { ...x, action: e.target.value as FlowAction } : x)))}>
              {actions.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <input aria-label={`Setting ${i + 1}`} className={`${sel} min-w-48 flex-1`} placeholder={SETTING_HINT[s.action]} value={s.setting} onChange={(e) => setSteps(steps.map((x, j) => (j === i ? { ...x, setting: e.target.value } : x)))} />
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setSteps([...steps, { action: actions[0], setting: '' }])} className="h-8 rounded-md border border-dashed border-[#1F4D3A]/40 px-4 text-xs font-bold text-[#1F4D3A] hover:bg-[#1F4D3A]/5">
          + New step
        </button>
        <button type="button" onClick={test} className="h-8 rounded-md bg-[#1F4D3A] px-4 text-xs font-bold text-white">
          Test flow
        </button>
      </div>

      {log.length > 0 && (
        <ul className="space-y-0.5 rounded-lg bg-[#F1F5EF] px-3 py-2 font-mono text-xs" aria-label="Test results">
          {log.map((l, i) => (
            <li key={i} className={l.startsWith('✗') || l.startsWith('The flow') ? 'text-[#C0392B]' : 'text-[#1F2937]'}>
              {l}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
