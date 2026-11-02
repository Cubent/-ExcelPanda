'use client';

import { ArrowRight, Check, CheckCircle2, Gem, Lightbulb, Settings2, Sparkles, Target, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as E from '@/components/sheet/engine';
import { SheetGrid, type SheetHandle, type SheetSnapshot } from '@/components/sheet/SheetGrid';
import { ChartPanel, type ChartState } from './ChartPanel';
import { PivotPanel, type PivotState } from './PivotPanel';
import { macify, useIsMac } from '@/lessons/platform';
import { getLessonContent } from '@/lessons/registry';
import { setSheetSize } from '@/components/sheet/engine';
import { playComplete, playNext, playSuccess } from './sounds';
import type { SheetView, StepCtx } from '@/lessons/types';

const PRAISE = ['Well done!', 'Nice one!', 'Perfect!', 'You nailed it!', 'Spot on!', 'Great job!', 'Excellent!', 'Boom, correct!'];

const ANIM_CSS = `
@keyframes xp-pop{0%{opacity:0;transform:translateY(24px) scale(.85)}12%{opacity:1;transform:translateY(0) scale(1.06)}20%{transform:scale(1)}85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(16px)}}
@keyframes xp-check{0%{transform:scale(0) rotate(-45deg)}100%{transform:scale(1) rotate(0)}}
@keyframes xp-ring{0%{transform:scale(.8);opacity:.9}100%{transform:scale(1.5);opacity:0}}
@keyframes xp-rise{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
@keyframes xp-spin{0%{transform:scale(0) rotate(0)}100%{transform:scale(1) rotate(360deg)}}
@keyframes xp-fall{0%{opacity:1;transform:translate3d(0,-10vh,0) rotate(0)}100%{opacity:0;transform:translate3d(var(--dx),105vh,0) rotate(var(--rot))}}
`;

function Confetti() {
  const colors = ['#C7F000', '#1F4D3A', '#2A9D8F', '#F4B63F', '#E76F51'];
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden>
      {Array.from({ length: 48 }, (_, i) => (
        <span
          key={i}
          className="absolute top-0 block h-3 w-2 rounded-[2px]"
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            ['--dx' as string]: `${((i * 53) % 160) - 80}px`,
            ['--rot' as string]: `${(i * 97) % 720}deg`,
            animation: `xp-fall ${2.2 + ((i * 13) % 14) / 10}s ${((i * 7) % 12) / 10}s ease-in both`,
          }}
        />
      ))}
    </div>
  );
}

type Opts = { layout: 'center' | 'side'; toolbar: boolean; status: boolean; full: boolean; sound: boolean };
const DEFAULT_OPTS: Opts = { layout: 'center', toolbar: false, status: true, full: false, sound: true };

type Props = {
  contentKey: string;
  unitTitle: string;
  xp: number;
  alreadyDone: boolean;
  /** Where "back" and the exit button go: the course timeline. */
  courseHref?: string;
  /** The following lesson, for the "Next lesson" button. */
  next?: { href: string; title: string } | null;
  /** Server action that records completion (bound to this lesson). */
  onComplete: () => Promise<{ ok: boolean; xp: number; gems: number }>;
};

export function LessonPlayer({ contentKey, unitTitle, xp, alreadyDone, courseHref = '/dashboard', next: nextLesson = null, onComplete }: Props) {
  const lesson = getLessonContent(contentKey);
  const mac = useIsMac();
  const t = (x: string) => (mac ? macify(x) : x);
  const gridRef = useRef<SheetHandle>(null);
  const eventsRef = useRef<Set<string>>(new Set());
  const [, bump] = useState(0);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [snap, setSnap] = useState<SheetSnapshot | null>(null);
  const [pivotState, setPivotState] = useState<PivotState | null>(null);
  const [chartState, setChartState] = useState<ChartState | null>(null);
  const [view, setView] = useState<SheetView>('sheet');
  const [panelEpoch, setPanelEpoch] = useState(0);
  const [save, setSave] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [earned, setEarned] = useState({ xp: 0, gems: 0 });
  const [opts, setOpts] = useState<Opts>(DEFAULT_OPTS);
  const [menu, setMenu] = useState(false);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('xp-sheet-opts');
      if (raw) setOpts({ ...DEFAULT_OPTS, ...JSON.parse(raw) });
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem('xp-sheet-opts', JSON.stringify(opts));
    } catch {}
  }, [opts]);
  // Must run before the grid renders so it sees the right dimensions.
  if (opts.full) setSheetSize(26, 100);
  else setSheetSize(10, 14);
  // Remember which step you are on, so a reload picks up where you left off.
  const stepKey = `xp-lesson-step:${contentKey}`;
  const stepLoaded = useRef(false);
  useEffect(() => {
    try {
      const n = Number.parseInt(localStorage.getItem(stepKey) ?? '', 10);
      if (!alreadyDone && Number.isFinite(n) && n > 0 && n < (getLessonContent(contentKey)?.steps.length ?? 0)) setIndex(n);
    } catch {}
    stepLoaded.current = true;
  }, [stepKey, alreadyDone, contentKey]);
  useEffect(() => {
    if (!stepLoaded.current) return;
    try {
      if (finished) localStorage.removeItem(stepKey);
      else localStorage.setItem(stepKey, String(index));
    } catch {}
  }, [index, finished, stepKey]);
  const [praise, setPraise] = useState<{ text: string; n: number; xp: number } | null>(null);
  const wasDone = useRef(false);
  const praiseCount = useRef(0);

  const steps = lesson?.steps ?? [];
  // Lesson XP is split across the steps that have a task, summing exactly to the total.
  const checkIdx = steps.map((s, i) => (s.check ? i : -1)).filter((i) => i >= 0);
  const checkCount = checkIdx.length;
  const stepXp = (i: number) => {
    const k = checkIdx.indexOf(i);
    if (k < 0 || alreadyDone || checkIdx.length === 0) return 0;
    return Math.floor((xp * (k + 1)) / checkIdx.length) - Math.floor((xp * k) / checkIdx.length);
  };
  const step = steps[index];
  const pivotCfg = step?.pivot ?? lesson?.pivot;
  const chartCfg = step?.chart ?? lesson?.chart;

  // Start of each step: forget old events, set up the sheet, hand it focus.
  useEffect(() => {
    if (!step) return;
    eventsRef.current = new Set();
    setShowHint(false);
    const meta = {
      names: { ...lesson?.meta?.names, ...step.meta?.names },
      ext: step.meta?.ext ?? lesson?.meta?.ext,
      cf: step.meta?.cf ?? lesson?.meta?.cf,
      lists: step.meta?.lists ?? lesson?.meta?.lists,
      tables: step.meta?.tables ?? lesson?.meta?.tables,
      slicers: step.meta?.slicers ?? lesson?.meta?.slicers,
      ...('filter' in (step.meta ?? {}) ? { filter: step.meta?.filter, hidden: step.meta?.hidden } : {}),
    };
    if (step.fresh) gridRef.current?.reset({ ...E.emptyData(), cells: { ...step.seed }, ...meta });
    else {
      if (step.seed) gridRef.current?.apply(step.seed);
      gridRef.current?.setMeta(meta);
    }
    if (step.select) gridRef.current?.select(step.select);
    setView(step.view ?? 'sheet');
    if (step.resetPanels) {
      setPanelEpoch((n) => n + 1);
      setPivotState(null);
      setChartState(null);
    }
    gridRef.current?.focus();
    bump((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, step, opts.full]);

  const onEvent = useCallback((name: string) => {
    if (!eventsRef.current.has(name)) {
      eventsRef.current.add(name);
      bump((n) => n + 1);
    }
  }, []);

  const done = useMemo(() => {
    if (!step) return false;
    if (!step.check) return true;
    if (!snap) return false;
    const ev = E.buildEvaluator(snap.data);
    const rect = snap.rect;
    const ctx: StepCtx = {
      active: snap.active,
      rect,
      editing: snap.editing,
      data: snap.data,
      events: eventsRef.current,
      raw: (k) => snap.data.cells[k] ?? '',
      value: (k) => ev.value(k),
      display: (k) => ev.display(k),
      style: (k) => snap.data.styles[k] ?? {},
      selection: E.rectLabel(rect),
      activeKey: E.keyOf(snap.active.c, snap.active.r),
      pivot: pivotState,
      chart: chartState,
      view,
    };
    try {
      return step.check(ctx);
    } catch {
      return false;
    }
    // eventsRef is mutated in place, so depend on the render tick via snap + index.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, snap, pivotState, chartState, view, eventsRef.current.size]);

  // Celebrate the moment a step becomes solved.
  useEffect(() => {
    const solved = !!step?.check && done;
    if (solved && !wasDone.current) {
      wasDone.current = true;
      if (opts.sound) playSuccess();
      const n = praiseCount.current++;
      setPraise({ text: PRAISE[n % PRAISE.length], n, xp: stepXp(index) });
    }
    if (!done) wasDone.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, step]);

  useEffect(() => {
    if (!praise) return;
    const t = setTimeout(() => setPraise(null), 2200);
    return () => clearTimeout(t);
  }, [praise]);

  // Enter continues once the step is solved (and you are not mid-edit in a cell).
  const enterRef = useRef<() => boolean>(() => false);
  enterRef.current = () => {
    if (finished || !step || !done || snap?.editing) return false;
    next();
    return true;
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest('button, a, input, textarea') && !t.closest('[role=grid]')) return;
      if (e.repeat) return;
      if (enterRef.current()) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  if (!lesson || !step) return null;

  const total = steps.length;
  const progress = finished ? 100 : ((index + (step.check && done ? 1 : 0)) / total) * 100;

  const saveProgress = async () => {
    setSave('saving');
    try {
      const r = await onComplete();
      setEarned({ xp: r.xp, gems: r.gems });
      setSave(r.ok ? 'saved' : 'error');
    } catch {
      setSave('error');
    }
  };

  const next = () => {
    setPraise(null);
    wasDone.current = false;
    if (index + 1 >= total) {
      setFinished(true);
      if (opts.sound) playComplete();
      if (!alreadyDone) void saveProgress();
    } else {
      if (opts.sound) playNext();
      setIndex(index + 1);
    }
  };

  const heading = (center: boolean) => (
    <div className={center ? 'shrink-0 text-center' : ''}>
      <div className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1F4D3A]/50 ${center ? 'justify-center' : ''}`}>
        <span>{unitTitle}</span>
        <span>·</span>
        <span>
          Step {index + 1} of {total}
        </span>
      </div>
      <h1 className={`font-semibold leading-tight tracking-tight ${center ? 'mt-2 text-2xl' : 'mt-3 text-2xl'}`}>{t(step.title)}</h1>
      <div className={`space-y-2 text-[15px] leading-relaxed text-[#1F4D3A]/80 ${center ? 'mx-auto mt-2 max-w-2xl' : 'mt-4 space-y-3'}`}>{step.body}</div>
    </div>
  );

  const feedback =
    step.check && done ? (
      <div className="flex items-center gap-2.5 rounded-xl bg-[#2A9D8F]/10 px-3.5 py-2.5 text-sm text-[#14594F]">
        <Check size={18} className="shrink-0" strokeWidth={3} />
        <span className={opts.layout === 'center' ? 'truncate' : ''}>
          <strong className="mr-1.5">{PRAISE[index % PRAISE.length]}</strong>
          {stepXp(index) > 0 && <strong className="mr-1.5 rounded-full bg-[#C7F000] px-1.5 py-0.5 text-xs text-[#1F4D3A]">+{stepXp(index)} XP</strong>}
          {t(step.success ?? 'Nicely done.')}
        </span>
      </div>
    ) : step.check && step.hint ? (
      showHint ? (
        <div className="flex items-center gap-2 rounded-xl bg-[#FFF3D1]/70 px-3.5 py-2.5 text-sm text-[#7a5600]">
          <Lightbulb size={16} className="shrink-0" />
          <span className={opts.layout === 'center' ? 'truncate' : ''}>{t(step.hint)}</span>
        </div>
      ) : (
        <button type="button" onClick={() => setShowHint(true)} className="flex items-center gap-1.5 text-sm font-semibold text-[#1F4D3A]/60 hover:text-[#1F4D3A]">
          <Lightbulb size={15} /> Show a hint
        </button>
      )
    ) : null;

  const continueBtn = (cls: string) => (
    <button
      type="button"
      disabled={!done}
      onClick={next}
      className={`flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1F4D3A] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#173d2e] disabled:cursor-not-allowed disabled:bg-[#1F4D3A]/25 disabled:shadow-none ${cls}`}
    >
      {index + 1 >= total ? 'Finish lesson' : 'Continue'} <ArrowRight size={16} />
    </button>
  );

  return (
    <div
      className="relative flex h-dvh flex-col overflow-hidden bg-[#F7F8F4] text-[#1F4D3A]"
      onMouseUp={(e) => {
        // Clicking empty space gives the keyboard back to the sheet, unless you just selected text to copy it.
        if ((e.target as HTMLElement).closest('button, a, input, textarea, [role=grid]')) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) gridRef.current?.focus();
      }}
      onClick={(e) => {
        // After using a button (menu toggles, hint), hand the keyboard back to the sheet.
        if ((e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('[role=grid]')) {
          setTimeout(() => gridRef.current?.focus(), 0);
        }
      }}
    >
      <style>{ANIM_CSS}</style>
      {praise && (
        <div
          key={praise.n}
          className="pointer-events-none absolute inset-x-0 bottom-24 z-50 flex justify-center px-4"
          style={{ animation: 'xp-pop 2.2s cubic-bezier(.2,.9,.3,1.2) both' }}
        >
          <div className="flex items-center gap-2.5 rounded-full bg-[#1F4D3A] py-2.5 pl-3 pr-5 text-white shadow-[0_12px_32px_-8px_rgba(16,40,28,0.5)]">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#C7F000] text-[#1F4D3A]">
              <Check size={18} strokeWidth={3.5} style={{ animation: 'xp-check .5s .1s both' }} />
            </span>
            <span className="text-[15px] font-semibold">{praise.text}</span>
            <Sparkles size={16} className="text-[#C7F000]" style={{ animation: 'xp-spin 1.2s ease-out both' }} />
            {praise.xp > 0 && (
              <span className="rounded-full bg-[#C7F000] px-2 py-0.5 text-xs font-bold text-[#1F4D3A]" style={{ animation: 'xp-check .5s .15s both' }}>
                +{praise.xp} XP
              </span>
            )}
          </div>
        </div>
      )}
      {finished && <Confetti />}
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2 px-4 pt-3 sm:px-6">
        <img src="/animateos-logo (4).png" alt="ExcelPanda logo" className="size-7 rounded-lg object-cover" />
        <span className="text-[15px] font-semibold tracking-tight">ExcelPanda</span>
      </Link>
      <header className="flex items-center gap-4 px-4 pb-3 pt-2 sm:px-6">
        <Link
          href={courseHref}
          aria-label="Exit lesson"
          className="flex size-9 items-center justify-center rounded-xl text-[#1F4D3A]/60 transition-colors hover:bg-[#1F4D3A]/8 hover:text-[#1F4D3A]"
        >
          <X size={20} />
        </Link>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#1F4D3A]/10">
          <div
            className={`h-full rounded-full bg-[#1F4D3A] transition-all duration-500 ${praise ? 'brightness-125' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="w-10 text-right text-sm font-semibold text-[#1F4D3A]/60">
          {finished ? total : index + 1}/{total}
        </span>
        <div className="relative">
          <button
            type="button"
            aria-label="Sheet options"
            onClick={() => setMenu((m) => !m)}
            className={`flex size-9 items-center justify-center rounded-xl text-[#1F4D3A]/70 transition-colors hover:bg-[#1F4D3A]/8 hover:text-[#1F4D3A] ${menu ? 'bg-[#1F4D3A]/10' : ''}`}
          >
            <Settings2 size={18} />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-[#1F4D3A]/10 bg-white p-2 shadow-[0_16px_40px_-12px_rgba(16,40,28,0.25)]">
                <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1F4D3A]/45">Layout</p>
                <div className="grid grid-cols-2 gap-2 px-1.5 pb-2">
                  {(
                    [
                      ['center', 'Centered'],
                      ['side', 'Side panel'],
                    ] as const
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setOpts((o) => ({ ...o, layout: k }))}
                      className={`rounded-xl border-2 p-1.5 text-center transition-colors ${opts.layout === k ? 'border-[#1F4D3A] bg-[#C7F000]/15' : 'border-[#1F4D3A]/10 hover:border-[#1F4D3A]/30'}`}
                    >
                      <div className="flex h-14 gap-1 rounded-md bg-[#F7F8F4] p-1">
                        {k === 'side' ? (
                          <>
                            <div className="flex w-5 flex-col gap-0.5 rounded-sm bg-white p-0.5 ring-1 ring-[#1F4D3A]/10">
                              <span className="h-0.5 w-full rounded bg-[#1F4D3A]/50" />
                              <span className="h-0.5 w-3/4 rounded bg-[#1F4D3A]/25" />
                              <span className="mt-auto h-1.5 w-full rounded-sm bg-[#1F4D3A]" />
                            </div>
                            <div className="flex-1 rounded-sm bg-white ring-1 ring-[#1F4D3A]/10" />
                          </>
                        ) : (
                          <div className="flex flex-1 flex-col items-center gap-0.5">
                            <span className="h-0.5 w-8 rounded bg-[#1F4D3A]/50" />
                            <span className="h-0.5 w-12 rounded bg-[#1F4D3A]/25" />
                            <div className="mt-0.5 w-full flex-1 rounded-sm bg-white ring-1 ring-[#1F4D3A]/10" />
                            <span className="ml-auto h-1.5 w-5 rounded-sm bg-[#1F4D3A]" />
                          </div>
                        )}
                      </div>
                      <span className="mt-1 block text-xs font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
                <p className="px-2.5 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1F4D3A]/45">Sheet</p>
                {(
                  [
                    ['toolbar', 'Formatting toolbar'],
                    ['status', 'Status bar (Sum, Average)'],
                    ['full', 'Full-size sheet (A–Z, 100 rows)'],
                    ['sound', 'Sound effects'],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setOpts((o) => ({ ...o, [k]: !o[k] }))}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-[#1F4D3A]/5"
                  >
                    <span>{label}</span>
                    <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${opts[k] ? 'bg-[#1F4D3A]' : 'bg-[#1F4D3A]/20'}`}>
                      <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${opts[k] ? 'left-[18px]' : 'left-0.5'}`} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {finished ? (
        <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 pb-8">
          <div className="w-full max-w-lg text-center">
            <div className="relative mx-auto flex size-24 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[#C7F000]/40" style={{ animation: 'xp-ring 1.8s ease-out 2' }} />
              <span className="relative flex size-20 items-center justify-center rounded-full bg-[#C7F000] text-[#1F4D3A] shadow-[0_10px_30px_-8px_rgba(143,176,0,0.7)]" style={{ animation: 'xp-check .6s cubic-bezier(.2,.9,.3,1.3) both' }}>
                <Check size={38} strokeWidth={3.5} />
              </span>
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F4D3A]/50">{unitTitle}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Lesson complete</h1>
            <p className="mt-1.5 text-[15px] text-[#1F4D3A]/60">You finished “{lesson.title}”.</p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {(
                [
                  { icon: Zap, label: 'XP earned', value: alreadyDone ? '0' : save === 'saved' ? `+${earned.xp || xp}` : save === 'error' ? '–' : '…', tone: 'bg-[#FFF3D1] text-[#9A6B00]' },
                  { icon: Gem, label: 'Gems', value: alreadyDone ? '0' : save === 'saved' ? `+${earned.gems}` : save === 'error' ? '–' : '…', tone: 'bg-[#E3F4F1] text-[#14594F]' },
                  { icon: Target, label: 'Steps done', value: `${checkCount}/${checkCount}`, tone: 'bg-[#1F4D3A]/8 text-[#1F4D3A]' },
                ] as const
              ).map(({ icon: Icon, label, value, tone }, i) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#1F4D3A]/10 bg-white p-4 shadow-[0_1px_2px_rgba(16,40,28,0.04)]"
                  style={{ animation: `xp-rise .5s ${0.15 + i * 0.1}s cubic-bezier(.2,.9,.3,1) both` }}
                >
                  <span className={`mx-auto flex size-9 items-center justify-center rounded-xl ${tone}`}>
                    <Icon size={18} />
                  </span>
                  <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
                  <p className="text-xs font-medium text-[#1F4D3A]/50">{label}</p>
                </div>
              ))}
            </div>
            {save === 'error' && <p className="mt-4 text-sm font-semibold text-[#C0392B]">We couldn't save your XP. Check your connection and try again.</p>}

            <div className="mt-8 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1F4D3A]/45">What you practised</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {steps
                  .filter((s) => s.check)
                  .map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full border border-[#1F4D3A]/10 bg-white px-3 py-1.5 text-xs font-medium text-[#1F4D3A]/80">
                      <CheckCircle2 size={13} className="text-[#2A9D8F]" />
                      {t(s.title)}
                    </span>
                  ))}
              </div>
            </div>

            {save === 'error' ? (
              <button
                type="button"
                onClick={() => void saveProgress()}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F4D3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#173d2e]"
              >
                Try again
              </button>
            ) : (
              <div className={`mt-8 flex flex-col gap-3 ${save === 'saving' ? 'pointer-events-none opacity-50' : ''}`}>
                {nextLesson && (
                  <Link
                    href={nextLesson.href}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F4D3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#173d2e]"
                  >
                    <span className="truncate">Next lesson: {nextLesson.title}</span> <ArrowRight size={16} className="shrink-0" />
                  </Link>
                )}
                <Link
                  href={courseHref}
                  className={
                    nextLesson
                      ? 'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1F4D3A]/15 px-5 py-3 text-sm font-semibold text-[#1F4D3A] transition-colors hover:bg-[#1F4D3A]/5'
                      : 'flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F4D3A] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#173d2e]'
                  }
                >
                  Back to your path {!nextLesson && <ArrowRight size={16} />}
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={
            opts.layout === 'side'
              ? 'flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 sm:px-6 lg:flex-row'
              : 'mx-auto flex min-h-0 w-full max-w-[1010px] flex-1 flex-col px-4 pb-4 sm:px-6'
          }
        >
          {opts.layout === 'side' ? (
            <aside className="flex shrink-0 flex-col self-start rounded-2xl border border-[#1F4D3A]/10 bg-white p-6 shadow-[0_1px_2px_rgba(16,40,28,0.04),0_8px_24px_-12px_rgba(16,40,28,0.08)] lg:max-h-full lg:w-[380px] lg:overflow-y-auto">
              {heading(false)}
              <div className="mt-6">{feedback}</div>
              <div className="mt-3">{continueBtn('w-full')}</div>
            </aside>
          ) : (
            heading(true)
          )}

          <div className={`${opts.layout === 'side' ? `min-h-0 min-w-0 flex-1 ${opts.full ? '' : 'self-start'}` : 'mt-4 min-h-0'} ${opts.full ? 'flex flex-1 flex-col' : ''}`}>
            {(pivotCfg || chartCfg) && (
              <div className="mb-2 flex gap-1.5" role="tablist" aria-label="Workbook sheets">
                {(
                  [
                    ['sheet', 'Data'],
                    pivotCfg && ['pivot', 'PivotTable'],
                    chartCfg && ['chart', 'Chart'],
                  ] as (false | undefined | [SheetView, string])[]
                )
                  .filter((t): t is [SheetView, string] => !!t)
                  .map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={view === id}
                      onClick={() => {
                        setView(id);
                        if (id === 'sheet') setTimeout(() => gridRef.current?.focus(), 0);
                      }}
                      className={`rounded-t-lg border border-b-0 px-4 py-1.5 text-xs font-bold ${view === id ? 'border-[#1F4D3A]/25 bg-white text-[#1F4D3A]' : 'border-transparent bg-[#1F4D3A]/8 text-[#1F4D3A]/60 hover:bg-[#1F4D3A]/12'}`}
                    >
                      {label}
                    </button>
                  ))}
              </div>
            )}
            <div className={view === 'sheet' ? (opts.full ? 'min-h-0 flex-1' : '') : 'hidden'}>
              <SheetGrid key={opts.full ? 'full' : 'compact'} ref={gridRef} autoFocus toolbar={opts.toolbar || !!lesson.toolbar} statusBar={opts.status} noScroll={!opts.full} fit={!opts.full} tools={step.tools ?? lesson.tools} onState={setSnap} onEvent={onEvent} />
            </div>
            {pivotCfg && (
              <div className={view === 'pivot' ? 'h-[calc(100dvh-390px)] min-h-[300px] max-h-[460px] overflow-hidden rounded-xl border border-[#1F4D3A]/15 bg-white' : 'hidden'}>
                <PivotPanel key={`p${panelEpoch}`} data={snap?.data ?? E.emptyData()} source={pivotCfg.source} initial={pivotCfg.initial} features={pivotCfg.features} onState={setPivotState} />
              </div>
            )}
            {chartCfg && (
              <div className={view === 'chart' ? 'h-[calc(100dvh-390px)] min-h-[300px] max-h-[460px] overflow-hidden rounded-xl border border-[#1F4D3A]/15 bg-white' : 'hidden'}>
                <ChartPanel
                  key={`c${panelEpoch}`}
                  data={snap?.data ?? E.emptyData()}
                  selection={snap ? E.rectLabel(snap.rect) : ''}
                  pivot={pivotState?.result ?? null}
                  allow={chartCfg.allow}
                  initial={chartCfg.initial}
                  onState={setChartState}
                />
              </div>
            )}
          </div>

          {opts.layout === 'center' && (
            <div className="mt-4 flex shrink-0 items-center gap-4">
              <div className="min-w-0 flex-1">{feedback}</div>
              {continueBtn('px-8')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
