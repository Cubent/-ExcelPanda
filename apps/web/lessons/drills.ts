// Builds practice sessions (quick drill, timed challenge, fix your mistakes, shortcut trainer) out of the lesson steps that already exist.
import { ALL } from './registry';
import { shortcutTrainer } from './shortcuts';
import type { LessonContent, LessonStep } from './types';

const PANELS = ['pivot', 'chart', 'query', 'model', 'macro', 'flow'] as const;

type Pick = { id: string; lesson: LessonContent; step: LessonStep };

/** Steps that stand alone: they reset the sheet, carry their own data, and need no extra panels. */
const standalone = (l: LessonContent, s: LessonStep) =>
  !!s.check && !!s.solution && !!s.fresh && !s.resetPanels && (s.view ?? 'sheet') === 'sheet' && !PANELS.some((k) => s[k]) && !PANELS.some((k) => l[k]);

let cache: Pick[] | null = null;
function eligible(): Pick[] {
  if (cache) return cache;
  cache = ALL.filter((l) => !l.key.startsWith('trainer-') && !l.key.startsWith('case-')).flatMap((l) =>
    l.steps.filter((s) => standalone(l, s)).map((s) => ({ id: `${l.key}:${s.id}`, lesson: l, step: s })),
  );
  return cache;
}

/** A small seeded shuffle, so the same seed gives the same session on server and client. */
export function shuffled<T>(items: T[], seed: number): T[] {
  let a = seed >>> 0 || 1;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function wrap(p: Pick): LessonStep {
  const { lesson: l, step: s } = p;
  const meta = { ...l.meta, ...s.meta, names: { ...l.meta?.names, ...s.meta?.names } };
  return { ...s, id: p.id, tools: s.tools ?? l.tools, meta };
}

function make(key: string, title: string, picks: Pick[]): LessonContent {
  return {
    key,
    title,
    sheet: { cols: 12, rows: 30 },
    toolbar: picks.some((p) => p.lesson.toolbar),
    steps: picks.map(wrap),
  };
}

/** Random standalone tasks, preferring lessons in `pool` (the ones you have finished). */
export function buildDrill(mode: 'quick' | 'timed', seed: number, pool: string[] | undefined, count: number): LessonContent | null {
  const all = eligible();
  const mine = pool && pool.length ? all.filter((p) => pool.includes(p.lesson.key)) : [];
  // If you have finished few lessons, top up from the rest so the session is never short.
  const rest = shuffled(all.filter((p) => !mine.includes(p)), seed + 7);
  const picks = [...shuffled(mine, seed), ...rest].slice(0, count);
  if (!picks.length) return null;
  return make(`drill-${mode}-${seed}`, mode === 'quick' ? 'Quick drill' : 'Timed challenge', picks);
}

/** The steps you needed a hint for or skipped, found by their saved ids. */
export function buildMistakes(ids: string[], seed: number): LessonContent | null {
  const byId = new Map(eligible().map((p) => [p.id, p]));
  const picks = shuffled(ids.map((id) => byId.get(id)).filter((p): p is Pick => !!p), seed).slice(0, 8);
  if (!picks.length) return null;
  return make(`drill-mistakes-${seed}`, 'Fix your mistakes', picks);
}

/** The shortcut trainer with its moves in a fresh order. */
export function buildShortcuts(seed: number, count = 8): LessonContent {
  return { ...shortcutTrainer, key: `trainer-shortcuts-${seed}`, steps: shuffled(shortcutTrainer.steps, seed).slice(0, count) };
}

/** How many saved ids can still be replayed. */
export const replayable = (ids: string[]) => {
  const byId = new Set(eligible().map((p) => p.id));
  return ids.filter((i) => byId.has(i)).length;
};
