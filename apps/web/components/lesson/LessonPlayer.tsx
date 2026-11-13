'use client';

import { ArrowLeft, ArrowRight, Check, Gem, Lightbulb, Settings2, Sparkles, Target, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as E from '@/components/sheet/engine';
import type { SheetData } from '@/components/sheet/engine';
import { SheetGrid, type SheetHandle, type SheetSnapshot } from '@/components/sheet/SheetGrid';
import { ChartPanel, type ChartState } from './ChartPanel';
import { PivotPanel, type PivotState } from './PivotPanel';
import { QueryPanel, type QueryState } from './QueryPanel';
import { ModelPanel, type ModelState } from './ModelPanel';
import { MacroPanel, type MacroState } from './MacroPanel';
import { FlowPanel, type FlowState } from './FlowPanel';
import { tableToCells } from '@/components/sheet/pq';
import { macify, useIsMac } from '@/lessons/platform';
import { getLessonContent } from '@/lessons/registry';
import { setSheetSize } from '@/components/sheet/engine';
import { playComplete, playNext, playSuccess } from './sounds';
import { nodeToText, TutorButton, TutorSidebar, type TutorContext } from './TutorPanel';
import type { LessonContent, SheetView, StepCtx } from '@/lessons/types';

const PRAISE = ['Well done!', 'Nice one!', 'Perfect!', 'You nailed it!', 'Spot on!', 'Great job!', 'Excellent!', 'Boom, correct!'];

const ANIM_CSS = `
@keyframes xp-pop{0%{opacity:0;transform:translateY(24px) scale(.85)}12%{opacity:1;transform:translateY(0) scale(1.06)}20%{transform:scale(1)}85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(16px)}}
@keyframes xp-check{0%{transform:scale(0) rotate(-45deg)}100%{transform:scale(1) rotate(0)}}
@keyframes xp-ring{0%{transform:scale(.8);opacity:.9}100%{transform:scale(1.5);opacity:0}}
@keyframes xp-rise{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
@keyframes xp-spin{0%{transform:scale(0) rotate(0)}100%{transform:scale(1) rotate(360deg)}}
@keyframes panda-shuffle{0%,60%,100%{transform:rotate(0) translateX(0)}10%{transform:rotate(-7deg) translateX(-3px)}20%{transform:rotate(7deg) translateX(3px)}30%{transform:rotate(-6deg) translateX(-3px)}40%{transform:rotate(6deg) translateX(3px)}50%{transform:rotate(-3deg)}}
@keyframes panda-pop{0%{opacity:0;transform:translateY(-8px) scale(.9)}100%{opacity:1;transform:none}}
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
const DEFAULT_OPTS: Opts = { layout: 'side', toolbar: false, status: true, full: false, sound: true };

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
  /** Lesson content built on the fly (practice sessions), instead of one from the registry. */
  content?: LessonContent;
  /** Practice mode: no XP, a Skip button, and optionally a countdown in seconds. */
  practice?: { mode: string; limitSec?: number };
};

const MISSED_KEY = 'xp-missed';
const readMissed = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(MISSED_KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};
const writeMissed = (list: string[]) => {
  try {
    localStorage.setItem(MISSED_KEY, JSON.stringify(list.slice(-80)));
  } catch {}
};
/** Steps you needed a hint for, or skipped. "Fix your mistakes" replays them. */
export const addMissed = (id: string) => {
  const l = readMissed();
  if (!l.includes(id)) writeMissed([...l, id]);
};
export const removeMissed = (id: string) => writeMissed(readMissed().filter((x) => x !== id));
export const getMissed = readMissed;

export function LessonPlayer({ contentKey, unitTitle, xp, alreadyDone, courseHref = '/dashboard', next: nextLesson = null, onComplete, content, practice }: Props) {
  const lesson = content ?? getLessonContent(contentKey);
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
  const [queryState, setQueryState] = useState<QueryState | null>(null);
  const [modelState, setModelState] = useState<ModelState | null>(null);
  const [macroState, setMacroState] = useState<MacroState | null>(null);
  const [flowState, setFlowState] = useState<FlowState | null>(null);
  const [view, setView] = useState<SheetView>('sheet');
  const [panelEpoch, setPanelEpoch] = useState(0);
  const [save, setSave] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [earned, setEarned] = useState({ xp: 0, gems: 0 });
  const [opts, setOpts] = useState<Opts>(DEFAULT_OPTS);
  const [menu, setMenu] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  // After 2 minutes on a step without solving it, nudge the learner towards the tutor.
  const [nudge, setNudge] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  // In the side-panel layout the compact sheet gets as many columns as fit, so there is no empty strip on its right.
  const [sideCols, setSideCols] = useState(10);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const measure = () => {
      const w = window.innerWidth;
      // Page padding (48) + side panel (380) + gap (16) + row header (46); below the lg breakpoint the panel stacks on top.
      const avail = w >= 1024 ? w - 48 - 380 - 16 - 46 : w - 32 - 46;
      setSideCols(Math.max(10, Math.min(20, Math.floor(avail / 92))));
    };
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, 200);
    };
    measure();
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);
  // Changing the column count remounts the grid: put the learner's work straight back.
  const snapRef = useRef<SheetSnapshot | null>(null);
  snapRef.current = snap;
  const lastCols = useRef(sideCols);
  useEffect(() => {
    if (lastCols.current === sideCols) return;
    lastCols.current = sideCols;
    const data = snapRef.current?.data;
    if (data) setTimeout(() => gridRef.current?.reset(data), 0);
  }, [sideCols]);
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
  // The larger sheet is used only for steps whose data does not fit the compact one (more than 14 rows or 10 columns),
  // and it stays for the rest of that exercise so your work is not lost.
  const largeSize = lesson?.sheet ?? { cols: 12, rows: 30 };
  const needsLarge = useMemo(() => {
    const out: boolean[] = [];
    let cur = false;
    (lesson?.steps ?? []).forEach((s, i) => {
      if (s.fresh || i === 0) cur = false;
      const keys = [...Object.keys(s.seed ?? {}), ...Object.keys(s.solution?.cells ?? {})];
      if (keys.some((k) => {
        const p = E.parseKey(k);
        return !!p && (p.r >= 14 || p.c >= 10);
      })) cur = true;
      out.push(cur);
    });
    return out;
  }, [lesson]);
  const autoLarge = !!needsLarge[index];
  const big = opts.full || autoLarge;
  if (opts.full) setSheetSize(26, 100);
  else if (autoLarge) setSheetSize(largeSize.cols, largeSize.rows);
  else setSheetSize(opts.layout === 'side' ? sideCols : 10, 14);
  // Remember which step you are on, so a reload picks up where you left off.
  const stepKey = `xp-lesson-step:${contentKey}`;
  const stepLoaded = useRef(false);
  const dataKey = `xp-lesson-data:${contentKey}`;
  const restoreData = useRef<SheetData | null>(null);
  useEffect(() => {
    try {
      const n = Number.parseInt(localStorage.getItem(stepKey) ?? '', 10);
      if (!alreadyDone && Number.isFinite(n) && n > 0 && n < (getLessonContent(contentKey)?.steps.length ?? 0)) {
        // Bring back the sheet as it was, not just the step, so earlier work is still there.
        try {
          const saved = JSON.parse(localStorage.getItem(dataKey) ?? 'null') as { index: number; data: SheetData } | null;
          if (saved && saved.index === n && saved.data?.cells) restoreData.current = { ...E.emptyData(), ...saved.data };
        } catch {}
        setIndex(n);
      }
    } catch {}
    stepLoaded.current = true;
  }, [stepKey, alreadyDone, contentKey]);
  useEffect(() => {
    if (!stepLoaded.current) return;
    try {
      if (finished) {
        localStorage.removeItem(stepKey);
        localStorage.removeItem(dataKey);
      } else localStorage.setItem(stepKey, String(index));
    } catch {}
  }, [index, finished, stepKey, dataKey]);
  // Keep a copy of the sheet for the current step so a reload can restore it.
  useEffect(() => {
    if (!stepLoaded.current || finished || alreadyDone || !snap || restoreData.current) return;
    try {
      localStorage.setItem(dataKey, JSON.stringify({ index, data: snap.data }));
    } catch {}
  }, [snap, index, finished, dataKey]);
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
  const hinted = useRef(new Set<number>());
  const solvedSet = useRef(new Set<number>());
  const missedId = (i: number) => {
    const sid = steps[i]?.id ?? '';
    return sid.includes(':') ? sid : `${lesson?.key}:${sid}`;
  };
  const [left, setLeft] = useState(practice?.limitSec ?? 0);
  const pivotCfg = step?.pivot ?? lesson?.pivot;
  const chartCfg = step?.chart ?? lesson?.chart;
  const queryCfg = step?.query ?? lesson?.query;
  const modelCfg = step?.model ?? lesson?.model;
  const macroCfg = step?.macro ?? lesson?.macro;
  const flowCfg = step?.flow ?? lesson?.flow;

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
      setQueryState(null);
      setModelState(null);
      setMacroState(null);
      setFlowState(null);
    }
    if (restoreData.current) {
      gridRef.current?.reset(restoreData.current);
      restoreData.current = null;
    }
    gridRef.current?.focus();
    bump((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, step, big]);

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
      query: queryState,
      model: modelState,
      macro: macroState,
      flow: flowState,
      view,
    };
    try {
      return step.check(ctx);
    } catch {
      return false;
    }
    // eventsRef is mutated in place, so depend on the render tick via snap + index.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, snap, pivotState, chartState, queryState, modelState, macroState, flowState, view, eventsRef.current.size]);

  // Celebrate the moment a step becomes solved.
  useEffect(() => {
    const solved = !!step?.check && done;
    if (solved && !wasDone.current) {
      wasDone.current = true;
      solvedSet.current.add(index);
      if (practice && !hinted.current.has(index)) removeMissed(missedId(index));
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


  // What the AI tutor is told about where the learner is right now.
  const tutorCtxRef = useRef<() => TutorContext>(() => ({ lesson: '', unit: '', stepNumber: 0, stepTotal: 0, stepTitle: '', stepText: '', solved: false }));
  tutorCtxRef.current = () => {
    const cells: Record<string, string> = {};
    if (snap) {
      for (const [k, v] of Object.entries(snap.data.cells)) if (v !== '' && Object.keys(cells).length < 60) cells[k] = v;
    }
    return {
      lesson: lesson?.title ?? '',
      unit: unitTitle,
      stepNumber: index + 1,
      stepTotal: steps.length,
      stepTitle: step?.title ?? '',
      stepText: step ? nodeToText(step.body) : '',
      hint: step?.hint,
      solved: !!step?.check && done,
      selection: snap ? E.rectLabel(snap.rect) : undefined,
      activeCell: snap ? E.keyOf(snap.active.c, snap.active.r) : undefined,
      cells,
    };
  };
  const getTutorContext = useCallback(() => tutorCtxRef.current(), []);
  const closeTutor = useCallback(() => {
    setTutorOpen(false);
    setTimeout(() => gridRef.current?.focus(), 0);
  }, []);

  // Shows for 5 seconds, then comes back every 2 minutes until the step is solved.
  useEffect(() => {
    setNudge(false);
    if (finished || tutorOpen || done) return;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const show = () => {
      setNudge(true);
      clearTimeout(hide);
      hide = setTimeout(() => setNudge(false), 5000);
    };
    const every = setInterval(show, 120_000);
    return () => {
      clearInterval(every);
      clearTimeout(hide);
    };
  }, [index, finished, tutorOpen, done]);
  useEffect(() => {
    if (done || tutorOpen) setNudge(false);
  }, [done, tutorOpen]);

  // Practice countdown: when it reaches zero the session ends.
  useEffect(() => {
    if (!practice?.limitSec || finished) return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [practice?.limitSec, finished]);
  useEffect(() => {
    if (practice?.limitSec && left <= 0 && !finished) {
      if (opts.sound) playComplete();
      setFinished(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

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

  const skip = () => {
    if (step.check) addMissed(missedId(index));
    next();
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
      <div className={`flex flex-wrap items-center gap-2 ${center ? 'justify-center' : ''}`}>
        <span className="rounded-full border-2 border-b-4 border-[#98BA00] bg-[#C7F000] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#1F4D3A]">
          Step {index + 1} of {total}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1F4D3A]/45">{unitTitle}</span>
      </div>
      <h1 className={`font-extrabold leading-tight tracking-tight text-[#1F4D3A] ${center ? 'mt-3 text-3xl' : 'mt-4 text-[28px]'}`}>{t(step.title)}</h1>
      <div
        className={`space-y-2.5 text-base leading-relaxed text-[#1F4D3A]/80 [&_strong]:font-bold [&_strong]:text-[#1F4D3A] [&_code]:rounded-md [&_code]:border [&_code]:border-[#1F4D3A]/10 [&_code]:bg-[#1F4D3A]/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:font-semibold [&_code]:text-[#14594F] ${center ? 'mx-auto mt-3 max-w-2xl' : 'mt-4 space-y-3'}`}
      >
        {step.body}
      </div>
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
        <button
          type="button"
          onClick={() => {
            setShowHint(true);
            hinted.current.add(index);
            addMissed(missedId(index));
          }}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#1F4D3A]/60 hover:text-[#1F4D3A]">
          <Lightbulb size={15} /> Show a hint
        </button>
      )
    ) : null;

  const back = () => {
    setPraise(null);
    wasDone.current = false;
    setShowHint(false);
    setIndex((i) => Math.max(0, i - 1));
  };
  const continueBtn = (cls: string) => (
    <div className={`flex shrink-0 gap-2 ${cls.includes('w-full') ? 'w-full' : ''}`}>
      {index > 0 && !practice && (
        <button
          type="button"
          onClick={back}
          aria-label="Previous step"
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border-2 border-b-4 border-[#1F4D3A]/15 bg-white px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-[#1F4D3A] transition-all hover:-translate-y-0.5 hover:bg-[#1F4D3A]/5 active:translate-y-0.5 active:border-b-2"
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}
      {practice && step.check && !done && (
        <button type="button" onClick={skip} className="flex shrink-0 items-center justify-center rounded-2xl border-2 border-b-4 border-[#1F4D3A]/15 bg-white px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-[#1F4D3A]/70 transition-all hover:-translate-y-0.5 hover:bg-[#1F4D3A]/5 active:translate-y-0.5 active:border-b-2">
          Skip
        </button>
      )}
      <button
        type="button"
        disabled={!done}
        onClick={next}
        className={`flex shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-[#0F2A1F] bg-[#1F4D3A] py-3 text-sm font-extrabold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-[#245a43] active:translate-y-0.5 active:border-b-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-[#1F4D3A]/10 disabled:bg-[#1F4D3A]/10 disabled:text-[#1F4D3A]/35 disabled:hover:bg-[#1F4D3A]/10 ${cls.includes('w-full') ? 'flex-1' : cls}`}
      >
        {index + 1 >= total ? 'Finish lesson' : 'Continue'} <ArrowRight size={16} />
      </button>
    </div>
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
      {process.env.NODE_ENV !== 'production' && !finished && (
        <div className="fixed bottom-3 left-3 z-[80] text-xs" onKeyDown={(e) => e.stopPropagation()}>
          {debugOpen && (
            <div className="mb-2 flex w-48 flex-col gap-1 rounded-xl border-2 border-[#1F4D3A]/15 bg-white p-2 shadow-lg">
              <p className="px-1 font-bold uppercase tracking-wider text-[#1F4D3A]/50">
                Step {index + 1}/{total} {done ? '· solved' : ''}
              </p>
              <button type="button" onClick={() => { setNudge(true); setTimeout(() => setNudge(false), 5000); }} className="rounded-lg bg-[#1F4D3A]/8 px-2 py-1.5 text-left font-semibold hover:bg-[#1F4D3A]/15">
                Show Panda nudge
              </button>
              <button type="button" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="rounded-lg bg-[#1F4D3A]/8 px-2 py-1.5 text-left font-semibold hover:bg-[#1F4D3A]/15 disabled:opacity-40">
                Previous step
              </button>
              <button type="button" onClick={() => setIndex((i) => Math.min(total - 1, i + 1))} disabled={index >= total - 1} className="rounded-lg bg-[#1F4D3A]/8 px-2 py-1.5 text-left font-semibold hover:bg-[#1F4D3A]/15 disabled:opacity-40">
                Skip step (no XP)
              </button>
              <button type="button" onClick={() => setIndex(total - 1)} className="rounded-lg bg-[#1F4D3A]/8 px-2 py-1.5 text-left font-semibold hover:bg-[#1F4D3A]/15">
                Jump to last step
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setDebugOpen((o) => !o)}
            className="rounded-xl border-2 border-b-4 border-[#1F4D3A]/20 bg-white px-3 py-1.5 font-extrabold uppercase tracking-wide text-[#1F4D3A]/70 hover:bg-[#1F4D3A]/5"
          >
            Debug
          </button>
        </div>
      )}
      <TutorSidebar open={tutorOpen} onClose={closeTutor} getContext={getTutorContext} stepLabel={`${lesson?.title ?? unitTitle} · Step ${Math.min(index + 1, steps.length)} of ${steps.length}`} />
      <div className="relative z-40 flex shrink-0 items-center justify-between gap-3 px-4 pt-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/animateos-logo (4).png" alt="ExcelPanda logo" className="size-7 rounded-lg object-cover" />
          <span className="text-[15px] font-semibold tracking-tight">ExcelPanda</span>
        </Link>
        <TutorButton onClick={() => { setNudge(false); setTutorOpen((o) => !o); }} open={tutorOpen} nudge={nudge} onDismissNudge={() => setNudge(false)} />
      </div>
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
        {practice?.limitSec && !finished && (
          <span className={`w-14 rounded-lg px-2 py-1 text-center text-sm font-bold tabular-nums ${left <= 30 ? 'bg-[#FDECEA] text-[#C0392B]' : 'bg-[#1F4D3A]/8 text-[#1F4D3A]'}`} aria-label="Time left">
            {Math.floor(Math.max(left, 0) / 60)}:{String(Math.max(left, 0) % 60).padStart(2, '0')}
          </span>
        )}
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
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{practice ? 'Session complete' : 'Lesson complete'}</h1>
            <p className="mt-1.5 text-[15px] text-[#1F4D3A]/60">
              {practice ? `${lesson.title}: you solved ${solvedSet.current.size} of ${checkCount}.` : `You finished “${lesson.title}”.`}
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {(practice
                ? ([
                    { icon: Target, label: 'Solved', value: `${solvedSet.current.size}/${checkCount}`, tone: 'bg-[#1F4D3A]/8 text-[#1F4D3A]' },
                    { icon: Zap, label: 'Skipped or hinted', value: String(hinted.current.size + Math.max(0, checkCount - solvedSet.current.size - hinted.current.size)), tone: 'bg-[#FFF3D1] text-[#9A6B00]' },
                    { icon: Gem, label: practice.limitSec ? 'Time left' : 'Mode', value: practice.limitSec ? `${Math.floor(Math.max(left, 0) / 60)}:${String(Math.max(left, 0) % 60).padStart(2, '0')}` : practice.mode, tone: 'bg-[#E3F4F1] text-[#14594F]' },
                  ] as const)
                : ([
                  { icon: Zap, label: 'XP earned', value: alreadyDone ? '0' : save === 'saved' ? `+${earned.xp || xp}` : save === 'error' ? '–' : '…', tone: 'bg-[#FFF3D1] text-[#9A6B00]' },
                  { icon: Gem, label: 'Gems', value: alreadyDone ? '0' : save === 'saved' ? `+${earned.gems}` : save === 'error' ? '–' : '…', tone: 'bg-[#E3F4F1] text-[#14594F]' },
                  { icon: Target, label: 'Steps done', value: `${checkCount}/${checkCount}`, tone: 'bg-[#1F4D3A]/8 text-[#1F4D3A]' },
                ] as const)
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
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-[#98BA00] bg-[#C7F000] px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-[#1F4D3A] transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5 active:border-b-2"
                  >
                    <span className="truncate">Next lesson: {nextLesson.title}</span> <ArrowRight size={16} className="shrink-0" />
                  </Link>
                )}
                <Link
                  href={courseHref}
                  className={
                    nextLesson
                      ? 'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1F4D3A]/15 px-5 py-3 text-sm font-semibold text-[#1F4D3A] transition-colors hover:bg-[#1F4D3A]/5'
                      : 'flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-[#98BA00] bg-[#C7F000] px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-[#1F4D3A] transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5 active:border-b-2'
                  }
                >
                  {practice ? 'Back to practice' : 'Back to your path'} {!nextLesson && <ArrowRight size={16} />}
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        // The scroller spans the full width, so its scrollbar sits at the window edge, away from the content.
        <div className="sheet-scroll flex min-h-0 flex-1 flex-col overflow-y-auto pr-2 sm:pr-3">
        <div
          className={
            opts.layout === 'side'
              ? `flex flex-1 flex-col gap-4 px-4 pb-6 sm:px-6 lg:flex-row ${big ? 'min-h-0' : ''}`
              : `mx-auto flex w-full ${autoLarge && !opts.full ? 'max-w-[1240px]' : 'max-w-[1010px]'} flex-1 flex-col px-4 pb-6 sm:px-6 ${big ? 'min-h-0' : ''}`
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

          <div className={`${opts.layout === 'side' ? `min-h-0 min-w-0 flex-1 ${big ? '' : 'shrink-0 self-start'}` : big ? 'mt-4 min-h-0' : 'mt-4 shrink-0'} ${big ? 'flex flex-1 flex-col' : ''}`}>
            {(pivotCfg || chartCfg || queryCfg || modelCfg || macroCfg || flowCfg) && (
              <div className="mb-2 flex gap-1.5" role="tablist" aria-label="Workbook sheets">
                {(
                  [
                    ['sheet', 'Data'],
                    pivotCfg && ['pivot', 'PivotTable'],
                    chartCfg && ['chart', 'Chart'],
                    queryCfg && ['query', 'Power Query'],
                    modelCfg && ['model', 'Data Model'],
                    macroCfg && ['macro', macroCfg.lang === 'ts' ? 'Office Script' : 'VBA Editor'],
                    flowCfg && ['flow', 'Power Automate'],
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
            <div className={view === 'sheet' ? (big ? 'min-h-0 flex-1' : '') : 'hidden'}>
              <SheetGrid key={big ? `full-${opts.full ? 'all' : largeSize.cols}` : `compact-${opts.layout === 'side' ? sideCols : 10}`} ref={gridRef} autoFocus toolbar={opts.toolbar || !!lesson.toolbar} statusBar={opts.status} noScroll={!big} fit={!big} tools={step.tools ?? lesson.tools} onState={setSnap} onEvent={onEvent} />
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
            {queryCfg && (
              <div className={view === 'query' ? 'h-[calc(100dvh-340px)] min-h-[360px] max-h-[640px] overflow-hidden rounded-xl border border-[#1F4D3A]/15 bg-white' : 'hidden'}>
                <QueryPanel
                  key={`q${panelEpoch}`}
                  config={queryCfg}
                  onState={setQueryState}
                  onLoad={(_n, t, origin, prev) => {
                    // A refresh replaces the old result: clear it first so shorter tables leave nothing behind.
                    const clear = prev ? Object.fromEntries(Object.keys(tableToCells(prev, origin)).map((k) => [k, ''])) : {};
                    gridRef.current?.apply({ ...clear, ...tableToCells(t, origin) });
                  }}
                />
              </div>
            )}
            {modelCfg && (
              <div className={view === 'model' ? 'h-[calc(100dvh-340px)] min-h-[360px] max-h-[700px] overflow-hidden rounded-xl border border-[#1F4D3A]/15 bg-white' : 'hidden'}>
                <ModelPanel key={`m${panelEpoch}`} config={modelCfg} onState={setModelState} />
              </div>
            )}
            {macroCfg && (
              <div className={view === 'macro' ? 'h-[calc(100dvh-340px)] min-h-[360px] max-h-[640px] overflow-hidden rounded-xl border border-[#1F4D3A]/15 bg-white' : 'hidden'}>
                <MacroPanel
                  key={`x${panelEpoch}`}
                  config={macroCfg}
                  snap={snap}
                  onState={setMacroState}
                  onRun={(patch, selection) => gridRef.current?.applyPatch(patch, selection)}
                  onUdfs={(fns) => {
                    E.setUserFunctions(fns);
                    gridRef.current?.refresh();
                  }}
                />
              </div>
            )}
            {flowCfg && (
              <div className={view === 'flow' ? 'h-[calc(100dvh-340px)] min-h-[360px] max-h-[640px] overflow-hidden rounded-xl border border-[#1F4D3A]/15 bg-white' : 'hidden'}>
                <FlowPanel key={`f${panelEpoch}`} config={flowCfg} onState={setFlowState} />
              </div>
            )}
          </div>

          {opts.layout === 'center' && (
            <div className="mt-6 flex shrink-0 items-center gap-4 pb-2">
              <div className="min-w-0 flex-1">{feedback}</div>
              {continueBtn('px-8')}
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
