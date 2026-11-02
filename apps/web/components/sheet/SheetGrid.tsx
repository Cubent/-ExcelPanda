'use client';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  DollarSign,
  Italic,
  Paintbrush,
  Percent,
  Redo2,
  Sigma,
  Type,
  Underline,
  Undo2,
} from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent as RClipboardEvent,
  type KeyboardEvent as RKeyboardEvent,
  type MouseEvent as RMouseEvent,
} from 'react';
import * as E from './engine';
import { FilterMenu, SlicerBar, ToolDialog, type DialogKind } from './ToolDialogs';
import * as T from './tools';
import type { Pos, Rect, SheetData, Style } from './engine';

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------
const ROW_H = 24;
const COL_H = 24;
const ROW_HDR_W = 46;
const DEFAULT_COL_W = 92;
const CHAR_W = 7.4;
const BRAND = '#1F4D3A';
const GRID_LINE = '#E3E7E0';
const FONT = "Calibri, Carlito, 'Segoe UI', system-ui, sans-serif";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------
export type SheetSnapshot = {
  data: SheetData;
  active: Pos;
  rect: Rect;
  editing: boolean;
};

export type ToolName = 'table' | 'totals' | 'sort' | 'filter' | 'dedupe' | 'text2col' | 'flash' | 'find' | 'slicer' | 'goalseek' | 'datatable';

export type SheetHandle = {
  /** Merge cells in (only touching cells whose raw text differs). */
  apply(cells: Record<string, string>): void;
  /** Replace the whole sheet and clear undo history. */
  reset(data?: SheetData): void;
  /** Set named ranges (merged), extra read-only sheets, conditional formats and dropdown lists. */
  setMeta(meta: Pick<SheetData, 'names' | 'ext' | 'cf' | 'lists' | 'tables' | 'filter' | 'hidden' | 'slicers'>): void;
  select(label: string): void;
  focus(): void;
};

type Props = {
  initial?: Partial<SheetData>;
  toolbar?: boolean;
  statusBar?: boolean;
  /** Hide scrollbars and disable scrolling (sheet is sized to fit). */
  noScroll?: boolean;
  /** Data tools to show in a second toolbar row (and enable their shortcuts). */
  tools?: ToolName[];
  /** Card height hugs the grid instead of filling its parent. */
  fit?: boolean;
  autoFocus?: boolean;
  onState?: (s: SheetSnapshot) => void;
  onEvent?: (name: string) => void;
};

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------
type Editing = { text: string; mode: 'enter' | 'edit'; from: 'cell' | 'bar' };
type Clip = { rect: Rect; cells: Record<string, string>; styles: Record<string, Style>; cut: boolean; tsv: string };
type St = {
  data: SheetData;
  past: SheetData[];
  future: SheetData[];
  origin: Pos;
  focus: Pos;
  active: Pos;
  edit: Editing | null;
  clip: Clip | null;
  fill: Rect | null;
  point: Rect | null;
};

const ZERO: Pos = { c: 0, r: 0 };
const clamp = (p: Pos): Pos => ({
  c: Math.max(0, Math.min(E.COLS - 1, p.c)),
  r: Math.max(0, Math.min(E.ROWS - 1, p.r)),
});
const rectOfState = (s: St) => E.rectOf(s.origin, s.focus);
const selectAt = (s: St, p: Pos): St => ({ ...s, origin: p, focus: p, active: p });
const isFormula = (raw: string) => raw.startsWith('=') && raw.length > 1;

function pushData(s: St, data: SheetData): St {
  if (data === s.data) return s;
  return { ...s, data, past: [...s.past.slice(-99), s.data], future: [] };
}

function setCells(data: SheetData, changes: Record<string, string | null>): SheetData {
  const cells = { ...data.cells };
  let touched = false;
  for (const [k, v] of Object.entries(changes)) {
    if (v === null || v === '') {
      if (k in cells) {
        delete cells[k];
        touched = true;
      }
    } else if (cells[k] !== v) {
      cells[k] = v;
      touched = true;
    }
  }
  return touched ? { ...data, cells } : data;
}

function cleanStyle(st: Style): Style | null {
  const out: Style = {};
  if (st.b) out.b = true;
  if (st.i) out.i = true;
  if (st.u) out.u = true;
  if (st.align) out.align = st.align;
  if (st.fmt && st.fmt !== 'general') out.fmt = st.fmt;
  if (st.dec !== undefined) out.dec = st.dec;
  if (st.bg) out.bg = st.bg;
  if (st.color) out.color = st.color;
  return Object.keys(out).length ? out : null;
}

function forRect(rc: Rect, fn: (c: number, r: number, key: string) => void) {
  for (let r = rc.r1; r <= rc.r2; r++) for (let c = rc.c1; c <= rc.c2; c++) fn(c, r, E.keyOf(c, r));
}

// Excel-style Ctrl+Arrow: hop across a block of data, or to the next block.
function jump(data: SheetData, from: Pos, dc: number, dr: number): Pos {
  const filled = (c: number, r: number) => (data.cells[E.keyOf(c, r)] ?? '') !== '';
  let { c, r } = from;
  const nc = c + dc;
  const nr = r + dr;
  if (!E.inBounds(nc, nr)) return from;
  if (filled(c, r) && filled(nc, nr)) {
    while (E.inBounds(c + dc, r + dr) && filled(c + dc, r + dr)) {
      c += dc;
      r += dr;
    }
    return { c, r };
  }
  c = nc;
  r = nr;
  while (!filled(c, r)) {
    if (!E.inBounds(c + dc, r + dr)) return { c, r };
    c += dc;
    r += dr;
  }
  return { c, r };
}

function lastUsed(data: SheetData): Pos {
  let c = 0;
  let r = 0;
  for (const k of Object.keys(data.cells)) {
    const p = E.parseKey(k);
    if (p) {
      c = Math.max(c, p.c);
      r = Math.max(r, p.r);
    }
  }
  return { c, r };
}

function afterEnter(s: St, dir: 'down' | 'up' | 'right' | 'left'): St {
  const rc = rectOfState(s);
  const single = rc.c1 === rc.c2 && rc.r1 === rc.r2;
  const a = s.active;
  if (single) {
    const to = clamp({ c: a.c + (dir === 'right' ? 1 : dir === 'left' ? -1 : 0), r: a.r + (dir === 'down' ? 1 : dir === 'up' ? -1 : 0) });
    return selectAt(s, to);
  }
  let { c, r } = a;
  if (dir === 'down' || dir === 'up') {
    r += dir === 'down' ? 1 : -1;
    if (r > rc.r2) {
      r = rc.r1;
      c = c + 1 > rc.c2 ? rc.c1 : c + 1;
    } else if (r < rc.r1) {
      r = rc.r2;
      c = c - 1 < rc.c1 ? rc.c2 : c - 1;
    }
  } else {
    c += dir === 'right' ? 1 : -1;
    if (c > rc.c2) {
      c = rc.c1;
      r = r + 1 > rc.r2 ? rc.r1 : r + 1;
    } else if (c < rc.c1) {
      c = rc.c2;
      r = r - 1 < rc.r1 ? rc.r2 : r - 1;
    }
  }
  return { ...s, active: { c, r } };
}

function commitEdit(s: St, move: 'down' | 'up' | 'right' | 'left' | 'none'): St {
  if (!s.edit) return s;
  const key = E.keyOf(s.active.c, s.active.r);
  const text = E.normalizeInput(s.edit.text);
  let next: St = { ...s, edit: null, point: null, clip: null };
  next = pushData(next, T.afterEdit(setCells(next.data, { [key]: text }), [key]));
  return move === 'none' ? next : afterEnter(next, move);
}

function applyStyle(s: St, patch: (cur: Style, key: string) => Style): St {
  const rc = rectOfState(s);
  const styles = { ...s.data.styles };
  forRect(rc, (_c, _r, key) => {
    const next = cleanStyle(patch(styles[key] ?? {}, key));
    if (next) styles[key] = next;
    else delete styles[key];
  });
  return pushData(s, { ...s.data, styles });
}

function buildClip(s: St, cut: boolean): Clip {
  const rc = rectOfState(s);
  const cells: Record<string, string> = {};
  const styles: Record<string, Style> = {};
  const ev = E.buildEvaluator(s.data);
  const lines: string[] = [];
  for (let r = rc.r1; r <= rc.r2; r++) {
    const row: string[] = [];
    for (let c = rc.c1; c <= rc.c2; c++) {
      const k = E.keyOf(c, r);
      if (s.data.cells[k] !== undefined) cells[k] = s.data.cells[k];
      if (s.data.styles[k]) styles[k] = s.data.styles[k];
      row.push(ev.display(k));
    }
    lines.push(row.join('\t'));
  }
  return { rect: rc, cells, styles, cut, tsv: lines.join('\n') };
}

function pasteClip(s: St, clip: Clip): St {
  const dest = rectOfState(s);
  const src = clip.rect;
  const sw = src.c2 - src.c1 + 1;
  const sh = src.r2 - src.r1 + 1;
  const multiDest = (dest.c2 - dest.c1 + 1) % sw === 0 && (dest.r2 - dest.r1 + 1) % sh === 0;
  const tw = multiDest ? dest.c2 - dest.c1 + 1 : sw;
  const th = multiDest ? dest.r2 - dest.r1 + 1 : sh;
  const origin = { c: dest.c1, r: dest.r1 };

  const changes: Record<string, string | null> = {};
  const styles = { ...s.data.styles };

  if (clip.cut) forRect(src, (_c, _r, k) => {
    changes[k] = null;
    delete styles[k];
  });

  for (let dr = 0; dr < th; dr++) {
    for (let dc = 0; dc < sw * Math.ceil(tw / sw) && dc < tw; dc++) {
      const tc = origin.c + dc;
      const tr = origin.r + dr;
      if (!E.inBounds(tc, tr)) continue;
      const sc = src.c1 + (dc % sw);
      const sr = src.r1 + (dr % sh);
      const sk = E.keyOf(sc, sr);
      const tk = E.keyOf(tc, tr);
      const raw = clip.cells[sk] ?? '';
      // A cut keeps references intact; a copy shifts relative references.
      changes[tk] = clip.cut ? raw : E.adjustFormula(raw, tc - sc, tr - sr);
      if (clip.styles[sk]) styles[tk] = clip.styles[sk];
      else delete styles[tk];
    }
  }

  let next = pushData(s, { ...s.data, styles });
  next = pushData(next, setCells(next.data, changes));
  // collapse the two history entries into one
  if (next.past.length >= 2 && next.past[next.past.length - 1] !== s.data) {
    next = { ...next, past: [...next.past.slice(0, -2), s.data] };
  }
  const end = { c: Math.min(E.COLS - 1, origin.c + tw - 1), r: Math.min(E.ROWS - 1, origin.r + th - 1) };
  return { ...next, origin, focus: end, active: origin, clip: clip.cut ? null : next.clip };
}

function pasteText(s: St, text: string): St {
  const lines = text.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
  const dest = rectOfState(s);
  const changes: Record<string, string | null> = {};
  let maxC = dest.c1;
  lines.forEach((line, dr) => {
    line.split('\t').forEach((cell, dc) => {
      const c = dest.c1 + dc;
      const r = dest.r1 + dr;
      if (!E.inBounds(c, r)) return;
      changes[E.keyOf(c, r)] = cell;
      maxC = Math.max(maxC, c);
    });
  });
  const next = pushData(s, setCells(s.data, changes));
  return {
    ...next,
    origin: { c: dest.c1, r: dest.r1 },
    focus: { c: maxC, r: Math.min(E.ROWS - 1, dest.r1 + lines.length - 1) },
    active: { c: dest.c1, r: dest.r1 },
  };
}

// Extends `src` to `ext` (one axis), continuing series or copying formulas.
function applyFill(s: St, src: Rect, ext: Rect): St {
  const changes: Record<string, string | null> = {};
  const styles = { ...s.data.styles };
  const vertical = ext.r2 > src.r2 || ext.r1 < src.r1;
  const forward = vertical ? ext.r2 > src.r2 : ext.c2 > src.c2;
  const lines = vertical ? src.c2 - src.c1 + 1 : src.r2 - src.r1 + 1;
  const len = vertical ? src.r2 - src.r1 + 1 : src.c2 - src.c1 + 1;
  const count = vertical
    ? forward ? ext.r2 - src.r2 : src.r1 - ext.r1
    : forward ? ext.c2 - src.c2 : src.c1 - ext.c1;

  for (let l = 0; l < lines; l++) {
    const keyAt = (i: number) => (vertical ? E.keyOf(src.c1 + l, src.r1 + i) : E.keyOf(src.c1 + i, src.r1 + l));
    const raws = Array.from({ length: len }, (_, i) => s.data.cells[keyAt(i)] ?? '');
    const hasFormula = raws.some(isFormula);
    const series = hasFormula ? null : E.extendSeries(raws, count, forward);
    for (let i = 1; i <= count; i++) {
      const idx = forward ? (i - 1) % len : len - 1 - ((i - 1) % len);
      const offset = forward ? len - 1 + i - idx : -(i) - idx;
      const tc = vertical ? src.c1 + l : forward ? src.c2 + i : src.c1 - i;
      const tr = vertical ? (forward ? src.r2 + i : src.r1 - i) : src.r1 + l;
      if (!E.inBounds(tc, tr)) continue;
      const tk = E.keyOf(tc, tr);
      const sk = keyAt(idx);
      const raw = raws[idx];
      changes[tk] = hasFormula ? E.adjustFormula(raw, vertical ? 0 : offset, vertical ? offset : 0) : (series?.[i - 1] ?? raw);
      if (s.data.styles[sk]) styles[tk] = s.data.styles[sk];
      else delete styles[tk];
    }
  }
  let next = pushData(s, { ...s.data, styles });
  next = pushData(next, setCells(next.data, changes));
  if (next.past.length >= 2 && next.past[next.past.length - 1] !== s.data) {
    next = { ...next, past: [...next.past.slice(0, -2), s.data] };
  }
  return { ...next, origin: { c: ext.c1, r: ext.r1 }, focus: { c: ext.c2, r: ext.r2 }, active: { c: src.c1, r: src.r1 } };
}

function fillCopy(s: St, dir: 'down' | 'right'): St {
  const rc = rectOfState(s);
  const changes: Record<string, string | null> = {};
  const styles = { ...s.data.styles };
  const srcRect: Rect =
    dir === 'down'
      ? rc.r1 === rc.r2 ? { ...rc, r1: rc.r1 - 1, r2: rc.r1 - 1 } : { ...rc, r2: rc.r1 }
      : rc.c1 === rc.c2 ? { ...rc, c1: rc.c1 - 1, c2: rc.c1 - 1 } : { ...rc, c2: rc.c1 };
  if (srcRect.r1 < 0 || srcRect.c1 < 0) return s;
  forRect(rc, (c, r, k) => {
    const sc = dir === 'right' ? srcRect.c1 : c;
    const sr = dir === 'down' ? srcRect.r1 : r;
    if (sc === c && sr === r) return;
    const sk = E.keyOf(sc, sr);
    changes[k] = E.adjustFormula(s.data.cells[sk] ?? '', c - sc, r - sr);
    if (s.data.styles[sk]) styles[k] = s.data.styles[sk];
    else delete styles[k];
  });
  let next = pushData(s, { ...s.data, styles });
  next = pushData(next, setCells(next.data, changes));
  if (next.past.length >= 2 && next.past[next.past.length - 1] !== s.data) {
    next = { ...next, past: [...next.past.slice(0, -2), s.data] };
  }
  return next;
}

const PALETTE_FILL = ['', '#FFF2A8', '#D7F4C0', '#CFE5FF', '#FFD0CC', '#E6E8E4'];
const PALETTE_TEXT = ['', '#C0392B', '#1F7A4D', '#1F5FBF', '#8A5A00', '#6B7280'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const SheetGrid = forwardRef<SheetHandle, Props>(function SheetGrid(
  { initial, toolbar = true, statusBar = true, noScroll = false, tools, fit = false, autoFocus = false, onState, onEvent },
  handle,
) {
  const [st, setSt] = useState<St>(() => ({
    data: { ...E.emptyData(), ...initial },
    past: [],
    future: [],
    origin: ZERO,
    focus: ZERO,
    active: ZERO,
    edit: null,
    clip: null,
    fill: null,
    point: null,
  }));
  const ref = useRef(st);
  ref.current = st;
  const commit = useCallback((n: St) => {
    ref.current = n;
    setSt(n);
  }, []);

  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const onStateRef = useRef(onState);
  onStateRef.current = onState;
  const emit = useCallback((name: string) => onEventRef.current?.(name), []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef(0);
  const pendingCaret = useRef<number | null>(null);
  const pointRef = useRef<{ start: number; end: number } | null>(null);
  const pointNav = useRef<{ anchor: Pos; focus: Pos; ext?: boolean }>({ anchor: ZERO, focus: ZERO });
  const prevEditing = useRef(false);
  const dragRef = useRef<
    | null
    | { kind: 'cell' }
    | { kind: 'col'; c0: number }
    | { kind: 'row'; r0: number }
    | { kind: 'fill'; src: Rect }
    | { kind: 'resize'; c: number; x0: number; w0: number }
    | { kind: 'point'; anchor: Pos }
  >(null);

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [menu, setMenu] = useState<null | 'fill' | 'color'>(null);
  const [listOpen, setListOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [filterCol, setFilterCol] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // --- layout metrics ---------------------------------------------------------
  const widths = useMemo(
    () => Array.from({ length: E.COLS }, (_, c) => st.data.colW[c] ?? DEFAULT_COL_W),
    [st.data.colW],
  );
  const lefts = useMemo(() => {
    const a = [0];
    for (let c = 0; c < E.COLS; c++) a.push(a[c] + widths[c]);
    return a;
  }, [widths]);
  const totalW = lefts[E.COLS];
  const leftsRef = useRef(lefts);
  leftsRef.current = lefts;
  // Row geometry: filtered-out rows collapse to zero height.
  const hiddenSet = useMemo(() => new Set(st.data.hidden ?? []), [st.data.hidden]);
  const tops = useMemo(() => {
    const a = [0];
    for (let r = 0; r < E.ROWS; r++) a.push(a[r] + (hiddenSet.has(r) ? 0 : ROW_H));
    return a;
  }, [hiddenSet]);
  const topsRef = useRef(tops);
  topsRef.current = tops;

  const rect = rectOfState(st);
  const ev = useMemo(() => E.buildEvaluator(st.data), [st.data]);

  // --- imperative handle ------------------------------------------------------
  useImperativeHandle(
    handle,
    () => ({
      apply(cells) {
        const s = ref.current;
        commit(pushData(s, setCells(s.data, cells)));
      },
      reset(data) {
        const base = selectAt(ref.current, ZERO);
        commit({ ...base, data: { ...E.emptyData(), ...(data ?? {}) }, past: [], future: [], edit: null, clip: null, fill: null, point: null });
      },
      setMeta(meta) {
        const s = ref.current;
        commit({
          ...s,
          data: {
            ...s.data,
            names: { ...s.data.names, ...meta.names },
            ext: meta.ext ?? s.data.ext,
            cf: meta.cf ?? s.data.cf,
            lists: meta.lists ?? s.data.lists,
            // Tables and filters are replaced only when a step declares them.
            tables: meta.tables ?? s.data.tables,
            filter: 'filter' in meta ? meta.filter : s.data.filter,
            hidden: 'hidden' in meta ? meta.hidden : s.data.hidden,
            slicers: meta.slicers ?? s.data.slicers,
          },
        });
      },
      select(label) {
        const rc = E.parseRectLabel(label);
        if (!rc) return;
        const s = ref.current;
        commit({ ...s, origin: { c: rc.c1, r: rc.r1 }, focus: { c: rc.c2, r: rc.r2 }, active: { c: rc.c1, r: rc.r1 } });
      },
      focus() {
        scrollRef.current?.focus({ preventScroll: true });
      },
    }),
    [commit],
  );

  useEffect(() => {
    if (autoFocus) scrollRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  // --- report state upward -----------------------------------------------------
  useEffect(() => {
    onStateRef.current?.({ data: st.data, active: st.active, rect: E.rectOf(st.origin, st.focus), editing: !!st.edit });
  }, [st.data, st.active, st.origin, st.focus, st.edit]);

  // --- focus management for the editors ------------------------------------------
  useEffect(() => {
    const e = st.edit;
    if (e) {
      const input = e.from === 'bar' ? barRef.current : cellInputRef.current;
      if (input) {
        if (document.activeElement !== input) {
          input.focus();
          const p = pendingCaret.current ?? input.value.length;
          input.setSelectionRange(p, p);
          caretRef.current = p;
        } else if (pendingCaret.current !== null) {
          input.setSelectionRange(pendingCaret.current, pendingCaret.current);
          caretRef.current = pendingCaret.current;
        }
      }
      pendingCaret.current = null;
      prevEditing.current = true;
    } else if (prevEditing.current) {
      prevEditing.current = false;
      scrollRef.current?.focus({ preventScroll: true });
    }
  }, [st.edit]);

  // --- keep the moving cell in view ---------------------------------------------
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const rc = E.rectOf(st.origin, st.focus);
    const whole = (rc.r1 === 0 && rc.r2 === E.ROWS - 1) || (rc.c1 === 0 && rc.c2 === E.COLS - 1);
    // Selecting whole columns/rows/sheet must not scroll to the far corner.
    const p = whole || (st.origin.c === st.focus.c && st.origin.r === st.focus.r) ? st.active : st.focus;
    const left = lefts[p.c];
    const right = lefts[p.c + 1];
    const top = tops[p.r];
    const bottom = tops[p.r + 1];
    if (left < el.scrollLeft) el.scrollLeft = left;
    else if (right > el.scrollLeft + el.clientWidth - ROW_HDR_W) el.scrollLeft = right - el.clientWidth + ROW_HDR_W + 2;
    if (top < el.scrollTop) el.scrollTop = top;
    else if (bottom > el.scrollTop + el.clientHeight - COL_H) el.scrollTop = bottom - el.clientHeight + COL_H + 2;
  }, [st.active, st.focus, st.origin, lefts, tops]);

  // --- actions shared by keyboard + toolbar ---------------------------------------
  const startEdit = useCallback((s: St, mode: 'enter' | 'edit', text: string, from: 'cell' | 'bar' = 'cell') => {
    pointRef.current = null;
    return { ...s, edit: { text, mode, from }, clip: s.clip } as St;
  }, []);

  const undo = useCallback(() => {
    const s = ref.current;
    if (!s.past.length) return;
    const prev = s.past[s.past.length - 1];
    commit({ ...s, data: prev, past: s.past.slice(0, -1), future: [s.data, ...s.future] });
  }, [commit]);

  const redo = useCallback(() => {
    const s = ref.current;
    if (!s.future.length) return;
    const [next, ...rest] = s.future;
    commit({ ...s, data: next, past: [...s.past, s.data], future: rest });
  }, [commit]);

  const toggleProp = useCallback(
    (prop: 'b' | 'i' | 'u') => {
      const s = ref.current;
      const on = !s.data.styles[E.keyOf(s.active.c, s.active.r)]?.[prop];
      commit(applyStyle(s, (cur) => ({ ...cur, [prop]: on })));
    },
    [commit],
  );

  const setAlign = useCallback(
    (align: 'left' | 'center' | 'right') => {
      const s = ref.current;
      const same = s.data.styles[E.keyOf(s.active.c, s.active.r)]?.align === align;
      commit(applyStyle(s, (cur) => ({ ...cur, align: same ? undefined : align })));
    },
    [commit],
  );

  const setFmt = useCallback(
    (fmt: E.NumFmt) => {
      const s = ref.current;
      const same = s.data.styles[E.keyOf(s.active.c, s.active.r)]?.fmt === fmt;
      commit(applyStyle(s, (cur) => ({ ...cur, fmt: same ? 'general' : fmt, dec: undefined })));
    },
    [commit],
  );

  const bumpDecimals = useCallback(
    (delta: 1 | -1) => {
      const s = ref.current;
      const key = E.keyOf(s.active.c, s.active.r);
      const cur = s.data.styles[key];
      const shown = E.buildEvaluator(s.data).display(key);
      const shownDec = /\.(\d+)/.exec(shown)?.[1].length ?? 0;
      const base = cur?.dec ?? (cur?.fmt === 'percent' ? 0 : cur?.fmt && cur.fmt !== 'general' ? 2 : shownDec);
      const dec = Math.max(0, Math.min(10, base + delta));
      commit(applyStyle(s, (st0) => ({ ...st0, dec })));
    },
    [commit],
  );

  const autoSum = useCallback(() => {
    const s = ref.current;
    const rc = rectOfState(s);
    const numeric = (c: number, r: number) => typeof E.buildEvaluator(s.data).value(E.keyOf(c, r)) === 'number';
    const single = rc.c1 === rc.c2 && rc.r1 === rc.r2;
    if (single) {
      const a = s.active;
      let top = a.r - 1;
      while (top >= 0 && numeric(a.c, top)) top--;
      top++;
      if (top < a.r) return commit(startEdit(s, 'edit', `=SUM(${E.keyOf(a.c, top)}:${E.keyOf(a.c, a.r - 1)})`));
      let left = a.c - 1;
      while (left >= 0 && numeric(left, a.r)) left--;
      left++;
      if (left < a.c) return commit(startEdit(s, 'edit', `=SUM(${E.keyOf(left, a.r)}:${E.keyOf(a.c - 1, a.r)})`));
      return commit(startEdit(s, 'edit', '=SUM()'));
    }
    // Multi-cell selection: add a total under each column.
    const changes: Record<string, string> = {};
    const row = rc.r2 + 1;
    if (row < E.ROWS) {
      for (let c = rc.c1; c <= rc.c2; c++) changes[E.keyOf(c, row)] = `=SUM(${E.keyOf(c, rc.r1)}:${E.keyOf(c, rc.r2)})`;
    }
    commit(selectAt(pushData(s, setCells(s.data, changes)), { c: rc.c1, r: Math.min(E.ROWS - 1, row) }));
  }, [commit, startEdit]);

  // --- keyboard (grid focused, not editing) ----------------------------------------
  const onKeyDown = (e: RKeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    const s = ref.current;
    if (s.edit) return;
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key;
    const shift = e.shiftKey;

    const arrow: Record<string, [number, number, string]> = {
      ArrowUp: [0, -1, 'up'],
      ArrowDown: [0, 1, 'down'],
      ArrowLeft: [-1, 0, 'left'],
      ArrowRight: [1, 0, 'right'],
    };
    if (arrow[k]) {
      e.preventDefault();
      const [dc, dr, name] = arrow[k];
      const base = shift ? s.focus : s.active;
      let to: Pos;
      if (mod) {
        to = jump(s.data, base, dc, dr);
        emit(`ctrl+${name}`);
        if (shift) emit(`ctrl+shift+${name}`);
      } else {
        let t2 = clamp({ c: base.c + dc, r: base.r + dr });
        while (dr !== 0 && hiddenSet.has(t2.r) && t2.r + dr >= 0 && t2.r + dr < E.ROWS) t2 = { c: t2.c, r: t2.r + dr };
        to = hiddenSet.has(t2.r) ? base : t2;
        emit('arrow');
        if (shift) emit('shift+arrow');
      }
      commit(shift ? { ...s, focus: to } : selectAt(s, to));
      return;
    }

    if (k === 'Tab') {
      e.preventDefault();
      emit('tab');
      commit(afterEnter(s, shift ? 'left' : 'right'));
      return;
    }
    if (k === 'Enter') {
      e.preventDefault();
      emit('enter');
      commit(afterEnter(s, shift ? 'up' : 'down'));
      return;
    }
    if (k === 'F2') {
      e.preventDefault();
      emit('f2');
      commit(startEdit(s, 'edit', s.data.cells[E.keyOf(s.active.c, s.active.r)] ?? ''));
      return;
    }
    if (k === 'Delete' || k === 'Backspace') {
      e.preventDefault();
      const rc = rectOfState(s);
      const changes: Record<string, string | null> = {};
      forRect(rc, (_c, _r, key) => {
        changes[key] = null;
      });
      emit('delete');
      commit(pushData(s, setCells(s.data, changes)));
      return;
    }
    if (k === 'Escape') {
      emit('escape');
      commit({ ...s, clip: null });
      return;
    }
    if (k === 'Home') {
      e.preventDefault();
      const base = shift ? s.focus : s.active;
      const to = mod ? ZERO : { c: 0, r: base.r };
      commit(shift ? { ...s, focus: to } : selectAt(s, to));
      emit(mod ? 'ctrl+home' : 'home');
      return;
    }
    if (k === 'End' && mod) {
      e.preventDefault();
      const to = lastUsed(s.data);
      commit(shift ? { ...s, focus: to } : selectAt(s, to));
      emit('ctrl+end');
      return;
    }
    if (k === 'PageDown' || k === 'PageUp') {
      e.preventDefault();
      const rows = Math.max(1, Math.floor(((scrollRef.current?.clientHeight ?? 480) - COL_H) / ROW_H) - 1);
      const base = shift ? s.focus : s.active;
      const to = clamp({ c: base.c, r: base.r + (k === 'PageDown' ? rows : -rows) });
      commit(shift ? { ...s, focus: to } : selectAt(s, to));
      emit('page');
      return;
    }

    if (mod) {
      const lower = k.toLowerCase();
      if (lower === 'a') {
        e.preventDefault();
        commit({ ...s, origin: ZERO, focus: { c: E.COLS - 1, r: E.ROWS - 1 }, active: s.active });
        emit('ctrl+a');
        return;
      }
      if (k === ' ') {
        e.preventDefault();
        commit({ ...s, origin: { c: s.active.c, r: 0 }, focus: { c: s.active.c, r: E.ROWS - 1 } });
        emit('ctrl+space');
        return;
      }
      if (lower === 't' && has('table')) {
        e.preventDefault();
        doTable();
        return;
      }
      if (lower === 'l' && shift && has('filter')) {
        e.preventDefault();
        doFilter();
        return;
      }
      if (lower === 'h' && has('find')) {
        e.preventDefault();
        setDialog('find');
        return;
      }
      if (lower === 'e' && has('flash')) {
        e.preventDefault();
        doFlash();
        return;
      }
      if (lower === 'z' && !shift) {
        e.preventDefault();
        emit('ctrl+z');
        undo();
        return;
      }
      if (lower === 'y' || (lower === 'z' && shift)) {
        e.preventDefault();
        emit('ctrl+y');
        redo();
        return;
      }
      if (lower === 'b' || lower === 'i' || lower === 'u') {
        e.preventDefault();
        emit(`ctrl+${lower}`);
        toggleProp(lower);
        return;
      }
      if (lower === 'd' || lower === 'r') {
        e.preventDefault();
        emit(`ctrl+${lower}`);
        commit(fillCopy(s, lower === 'd' ? 'down' : 'right'));
        return;
      }
      if (k === ';') {
        e.preventDefault();
        const d = new Date();
        emit('ctrl+;');
        commit(pushData(s, setCells(s.data, { [E.keyOf(s.active.c, s.active.r)]: `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}` })));
        return;
      }
      if (shift && (k === '$' || k === '%' || k === '!' || k === '~' || k === '#')) {
        e.preventDefault();
        const map: Record<string, E.NumFmt> = { $: 'currency', '%': 'percent', '!': 'number', '~': 'general', '#': 'date' };
        emit(`ctrl+shift+${k}`);
        const fmt = map[k];
        commit(applyStyle(s, (cur) => ({ ...cur, fmt, dec: undefined })));
        return;
      }
      return; // copy/cut/paste are handled by clipboard events
    }

    if (shift && k === ' ') {
      e.preventDefault();
      commit({ ...s, origin: { c: 0, r: s.active.r }, focus: { c: E.COLS - 1, r: s.active.r } });
      emit('shift+space');
      return;
    }
    if (e.altKey && k === 'ArrowDown' && activeList) {
      e.preventDefault();
      setListOpen(true);
      return;
    }
    if (listOpen) setListOpen(false);
    if (e.altKey && k === '=') {
      e.preventDefault();
      emit('autosum');
      autoSum();
      return;
    }

    // Typing starts a replace-edit.
    if (k.length === 1 && !e.altKey) {
      e.preventDefault();
      commit(startEdit(s, 'enter', k));
    }
  };

  // --- editor key handling ------------------------------------------------------------
  // Excel point mode: while typing a formula where a reference is expected
  // (after "=", "(", "," or an operator) the arrow keys pick cells instead of
  // finishing the edit. Shift+arrow grows the reference into a range.
  const arrowPoint = (s: St, e: RKeyboardEvent<HTMLInputElement>): boolean => {
    if (!s.edit || e.ctrlKey || e.metaKey || e.altKey) return false;
    const caret = e.currentTarget.selectionStart ?? caretRef.current;
    caretRef.current = caret;
    let pointing = !!pointRef.current && caret === pointRef.current.end;
    if (!pointing && !canPoint(s.edit.text, caret)) {
      // Caret sits right after a typed reference ("=SUM(B2" or "=SUM(B2:"): arrows adjust that reference.
      if (!s.edit.text.startsWith('=')) return false;
      const before = s.edit.text.slice(0, caret);
      const m = /(\$?[A-Za-z]{1,2}\$?\d+)(:(\$?[A-Za-z]{1,2}\$?\d+)?)?$/.exec(before);
      if (!m || (m.index > 0 && /[A-Za-z0-9_.]/.test(before[m.index - 1]))) return false;
      const a1 = E.parseKey(m[1]);
      if (!a1) return false;
      const b1 = m[3] ? E.parseKey(m[3]) : null;
      const colonOnly = !!m[2] && !m[3];
      pointRef.current = { start: m.index, end: caret };
      pointNav.current = { anchor: a1, focus: b1 ?? a1, ext: colonOnly };
      pointing = true;
    }
    e.preventDefault();
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key] as [number, number];
    const nav = pointing ? pointNav.current : { anchor: s.active, focus: s.active, ext: false };
    const focus = clamp({ c: nav.focus.c + d[0], r: nav.focus.r + d[1] });
    const anchor = e.shiftKey || nav.ext ? nav.anchor : focus;
    pointNav.current = { anchor, focus, ext: nav.ext };
    emit('point-arrow');
    const next = insertPoint(s, E.rectOf(anchor, focus));
    pointNav.current = { anchor, focus, ext: nav.ext }; // insertPoint normalises; keep the real direction
    if (next) commit(next);
    return true;
  };

  const editKeyDown = (e: RKeyboardEvent<HTMLInputElement>) => {
    const s = ref.current;
    if (!s.edit) return;
    const k = e.key;
    if (k === 'Enter') {
      e.preventDefault();
      emit('enter');
      commit(commitEdit(s, e.shiftKey ? 'up' : 'down'));
    } else if (k === 'Tab') {
      e.preventDefault();
      emit('tab');
      commit(commitEdit(s, e.shiftKey ? 'left' : 'right'));
    } else if (k === 'Escape') {
      e.preventDefault();
      emit('escape');
      commit({ ...s, edit: null, point: null });
    } else if (k === 'F2') {
      e.preventDefault();
      emit('f2');
      commit({ ...s, edit: { ...s.edit, mode: s.edit.mode === 'enter' ? 'edit' : 'enter' } });
    } else if (k === 'F4') {
      e.preventDefault();
      emit('f4');
      const r = E.cycleAbsolute(s.edit.text, e.currentTarget.selectionStart ?? caretRef.current);
      pendingCaret.current = r.caret;
      commit({ ...s, edit: { ...s.edit, text: r.text } });
    } else if (k.startsWith('Arrow') && s.edit.mode === 'enter' && arrowPoint(s, e)) {
      // handled: moved the formula reference like Excel's point mode
    } else if (k.startsWith('Arrow') && s.edit.mode === 'enter' && s.edit.from === 'cell' && !e.shiftKey) {
      e.preventDefault();
      const dir = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[k] as 'up' | 'down' | 'left' | 'right';
      emit('arrow');
      commit(commitEdit(s, dir));
    } else if (e.altKey && k === '=') {
      e.preventDefault();
    }
  };

  const onEditChange = (text: string) => {
    const s = ref.current;
    if (!s.edit) return;
    pointRef.current = null;
    commit({ ...s, edit: { ...s.edit, text } });
  };

  // --- mouse --------------------------------------------------------------------------
  const hitTest = (clientX: number, clientY: number) => {
    const el = scrollRef.current;
    if (!el) return { c: -2, r: -2 };
    const b = el.getBoundingClientRect();
    const x = clientX - b.left + el.scrollLeft - ROW_HDR_W;
    const y = clientY - b.top + el.scrollTop - COL_H;
    let c = -1;
    if (x >= 0) {
      c = E.COLS - 1;
      for (let i = 0; i < E.COLS; i++) {
        if (x < leftsRef.current[i + 1]) {
          c = i;
          break;
        }
      }
    }
    let r = -1;
    if (y >= 0) {
      r = E.ROWS - 1;
      const tp = topsRef.current;
      for (let i = 0; i < E.ROWS; i++) {
        if (y < tp[i + 1]) {
          r = i;
          break;
        }
      }
    }
    return { c, r };
  };

  const canPoint = (text: string, caret: number) => {
    if (!text.startsWith('=')) return false;
    const before = text.slice(0, caret).trimEnd();
    return before.length > 0 && /[=(,+\-*/^&<>]$/.test(before);
  };

  const insertPoint = (s: St, rc: Rect): St | null => {
    if (!s.edit) return null;
    const label = E.rectLabel(rc);
    const text = s.edit.text;
    const caret = caretRef.current;
    let start: number;
    let end: number;
    if (pointRef.current && caret === pointRef.current.end) {
      start = pointRef.current.start;
      end = pointRef.current.end;
    } else if (canPoint(text, caret)) {
      start = end = caret;
    } else return null;
    const next = text.slice(0, start) + label + text.slice(end);
    pointRef.current = { start, end: start + label.length };
    pointNav.current = { anchor: { c: rc.c1, r: rc.r1 }, focus: { c: rc.c2, r: rc.r2 } };
    pendingCaret.current = start + label.length;
    caretRef.current = start + label.length;
    return { ...s, edit: { ...s.edit, text: next }, point: rc };
  };

  const onMouseDown = (e: RMouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT') return;
    const el = scrollRef.current!;
    const b = el.getBoundingClientRect();
    if (e.clientX - b.left > el.clientWidth || e.clientY - b.top > el.clientHeight) return; // scrollbar
    const { c, r } = hitTest(e.clientX, e.clientY);
    let s = ref.current;
    setMenu(null);

    if (c >= 0 && r >= 0) {
      e.preventDefault();
      el.focus({ preventScroll: true });
      if (s.edit) {
        const pointed = insertPoint(s, E.rectOf({ c, r }, { c, r }));
        if (pointed) {
          dragRef.current = { kind: 'point', anchor: { c, r } };
          commit(pointed);
          return;
        }
        s = commitEdit(s, 'none');
      }
      dragRef.current = { kind: 'cell' };
      const p = { c, r };
      commit(e.shiftKey ? { ...s, focus: p, clip: s.clip } : selectAt(s, p));
      return;
    }
    if (r === -1 && c >= 0) {
      e.preventDefault();
      el.focus({ preventScroll: true });
      if (s.edit) s = commitEdit(s, 'none');
      dragRef.current = { kind: 'col', c0: e.shiftKey ? s.origin.c : c };
      emit('select-column');
      commit(
        e.shiftKey
          ? { ...s, focus: { c, r: E.ROWS - 1 } }
          : { ...s, origin: { c, r: 0 }, focus: { c, r: E.ROWS - 1 }, active: { c, r: 0 } },
      );
      return;
    }
    if (c === -1 && r >= 0) {
      e.preventDefault();
      el.focus({ preventScroll: true });
      if (s.edit) s = commitEdit(s, 'none');
      dragRef.current = { kind: 'row', r0: e.shiftKey ? s.origin.r : r };
      emit('select-row');
      commit(
        e.shiftKey
          ? { ...s, focus: { c: E.COLS - 1, r } }
          : { ...s, origin: { c: 0, r }, focus: { c: E.COLS - 1, r }, active: { c: 0, r } },
      );
      return;
    }
    if (c === -1 && r === -1) {
      e.preventDefault();
      el.focus({ preventScroll: true });
      if (s.edit) s = commitEdit(s, 'none');
      emit('select-all');
      commit({ ...s, origin: ZERO, focus: { c: E.COLS - 1, r: E.ROWS - 1 }, active: ZERO });
    }
  };

  const onDoubleClick = (e: RMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    const { c, r } = hitTest(e.clientX, e.clientY);
    if (c < 0 || r < 0) return;
    const s = ref.current;
    if (s.edit) return;
    emit('dblclick');
    commit(startEdit(selectAt(s, { c, r }), 'edit', s.data.cells[E.keyOf(c, r)] ?? ''));
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const s = ref.current;
      const el = scrollRef.current;
      if (el) {
        const b = el.getBoundingClientRect();
        if (e.clientX > b.right - 24) el.scrollLeft += 24;
        else if (e.clientX < b.left + ROW_HDR_W + 12) el.scrollLeft -= 24;
        if (e.clientY > b.bottom - 24) el.scrollTop += 24;
        else if (e.clientY < b.top + COL_H + 12) el.scrollTop -= 24;
      }
      if (d.kind === 'resize') {
        const w = Math.max(32, Math.round(d.w0 + (e.clientX - d.x0)));
        commit({ ...s, data: { ...s.data, colW: { ...s.data.colW, [d.c]: w } } });
        return;
      }
      const { c, r } = hitTest(e.clientX, e.clientY);
      if (c === -2) return;
      if (d.kind === 'cell') {
        if (c < 0 && r < 0) return;
        const p = clamp({ c: Math.max(0, c), r: Math.max(0, r) });
        if (p.c !== s.focus.c || p.r !== s.focus.r) commit({ ...s, focus: p });
      } else if (d.kind === 'col') {
        const cc = Math.max(0, c);
        commit({ ...s, origin: { c: d.c0, r: 0 }, focus: { c: cc, r: E.ROWS - 1 } });
      } else if (d.kind === 'row') {
        const rr = Math.max(0, r);
        commit({ ...s, origin: { c: 0, r: d.r0 }, focus: { c: E.COLS - 1, r: rr } });
      } else if (d.kind === 'fill') {
        const p = clamp({ c: Math.max(0, c), r: Math.max(0, r) });
        const src = d.src;
        const dRow = p.r > src.r2 ? p.r - src.r2 : p.r < src.r1 ? p.r - src.r1 : 0;
        const dCol = p.c > src.c2 ? p.c - src.c2 : p.c < src.c1 ? p.c - src.c1 : 0;
        let ext: Rect = src;
        if (Math.abs(dRow) >= Math.abs(dCol) && dRow !== 0) ext = dRow > 0 ? { ...src, r2: p.r } : { ...src, r1: p.r };
        else if (dCol !== 0) ext = dCol > 0 ? { ...src, c2: p.c } : { ...src, c1: p.c };
        commit({ ...s, fill: E.rectsEqual(ext, src) ? null : ext });
      } else if (d.kind === 'point') {
        const p = clamp({ c: Math.max(0, c), r: Math.max(0, r) });
        const next = insertPoint(s, E.rectOf(d.anchor, p));
        if (next) commit(next);
      }
    };
    const up = () => {
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;
      const s = ref.current;
      if (d.kind === 'fill' && s.fill) {
        emit('fill-handle');
        commit({ ...applyFill(s, d.src, s.fill), fill: null });
      } else if (d.kind === 'fill') {
        commit({ ...s, fill: null });
      }
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    // handlers read everything from refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autoFit = (c: number) => {
    const s = ref.current;
    const evl = E.buildEvaluator(s.data);
    let max = 0;
    for (let r = 0; r < E.ROWS; r++) {
      const k = E.keyOf(c, r);
      if (s.data.cells[k] === undefined) continue;
      const bold = s.data.styles[k]?.b ? 1.1 : 1;
      max = Math.max(max, evl.display(k).length * CHAR_W * bold);
    }
    const w = Math.max(48, Math.ceil(max + 16));
    emit('autofit');
    commit({ ...s, data: { ...s.data, colW: { ...s.data.colW, [c]: w } } });
  };

  // --- clipboard ---------------------------------------------------------------------
  const onCopy = (e: RClipboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    e.preventDefault();
    const s = ref.current;
    const clip = buildClip(s, false);
    e.clipboardData.setData('text/plain', clip.tsv);
    emit('ctrl+c');
    commit({ ...s, clip });
  };
  const onCut = (e: RClipboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    e.preventDefault();
    const s = ref.current;
    const clip = buildClip(s, true);
    e.clipboardData.setData('text/plain', clip.tsv);
    emit('ctrl+x');
    commit({ ...s, clip });
  };
  const onPaste = (e: RClipboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    e.preventDefault();
    const s = ref.current;
    const text = e.clipboardData.getData('text/plain');
    emit('ctrl+v');
    if (s.clip && s.clip.tsv === text) commit(pasteClip(s, s.clip));
    else if (text) commit(pasteText(s, text));
  };

  // --- derived render data ------------------------------------------------------------
  const items = useMemo(() => {
    const keys = new Set<string>(Object.keys(st.data.cells));
    for (const [k, v] of Object.entries(st.data.styles)) if (v.bg) keys.add(k);
    // Conditional-format rules: which cells currently match, and the style they get.
    const tableStyle = new Map<string, Style>();
    for (const t of st.data.tables ?? []) {
      const rc = T.tableRect(t);
      if (!rc) continue;
      for (let r = rc.r1; r <= rc.r2; r++) {
        for (let c = rc.c1; c <= rc.c2; c++) {
          const key = E.keyOf(c, r);
          keys.add(key);
          if (r === rc.r1) tableStyle.set(key, { bg: '#1F4D3A', color: '#FFFFFF', b: true });
          else if (t.totals && r === rc.r2) tableStyle.set(key, { bg: '#DDE8DF', b: true });
          else if ((r - rc.r1) % 2 === 1) tableStyle.set(key, { bg: '#EAF1EC' });
        }
      }
    }
    const cfStyle = new Map<string, Style>();
    for (const rule of st.data.cf ?? []) {
      const rc = E.parseRectLabel(rule.range);
      if (!rc) continue;
      for (let r = rc.r1; r <= rc.r2; r++) {
        for (let c = rc.c1; c <= rc.c2; c++) {
          const v = ev.evalFormula(E.adjustFormula(rule.formula, c - rc.c1, r - rc.r1));
          if (v === true || (typeof v === 'number' && v !== 0)) {
            const key = E.keyOf(c, r);
            cfStyle.set(key, { ...cfStyle.get(key), ...rule.style });
            keys.add(key);
          }
        }
      }
    }
    const out: {
      key: string;
      left: number;
      top: number;
      w: number;
      spanW: number;
      text: string;
      align: 'left' | 'center' | 'right';
      style: Style;
      isErr: boolean;
    }[] = [];
    for (const key of keys) {
      const p = E.parseKey(key);
      if (!p || !E.inBounds(p.c, p.r)) continue;
      if (hiddenSet.has(p.r)) continue;
      const style: Style = { ...tableStyle.get(key), ...st.data.styles[key], ...cfStyle.get(key) };
      const val = ev.value(key);
      let text = ev.display(key);
      const isNum = typeof val === 'number';
      const isErr = val instanceof E.XlError;
      const align = style.align ?? (isNum ? 'right' : isErr || typeof val === 'boolean' ? 'center' : 'left');
      const w = widths[p.c];
      let spanW = w;
      if (align === 'left' && typeof val === 'string' && text.length * CHAR_W + 8 > w) {
        let c2 = p.c + 1;
        while (c2 < E.COLS && !st.data.cells[E.keyOf(c2, p.r)] && !st.data.styles[E.keyOf(c2, p.r)]?.bg) c2++;
        spanW = lefts[c2] - lefts[p.c];
      }
      if (isNum && text.length * CHAR_W * (style.b ? 1.08 : 1) + 8 > w) {
        text = '#'.repeat(Math.max(1, Math.floor((w - 8) / CHAR_W)));
      }
      out.push({ key, left: lefts[p.c], top: tops[p.r], w, spanW, text, align, style, isErr });
    }
    return out;
  }, [st.data, ev, widths, lefts, tops, hiddenSet]);

  const stats = useMemo(() => {
    if (rect.c1 === rect.c2 && rect.r1 === rect.r2) return null;
    let n = 0;
    let sum = 0;
    let count = 0;
    forRect(rect, (_c, _r, key) => {
      const v = ev.value(key);
      if (v !== null) count++;
      if (typeof v === 'number') {
        n++;
        sum += v;
      }
    });
    return { n, sum, count, avg: n ? sum / n : 0 };
  }, [rect, ev]);

  const activeKey = E.keyOf(st.active.c, st.active.r);
  const activeList = useMemo(() => {
    for (const [range, list] of Object.entries(st.data.lists ?? {})) {
      const rc = E.parseRectLabel(range);
      if (rc && st.active.c >= rc.c1 && st.active.c <= rc.c2 && st.active.r >= rc.r1 && st.active.r <= rc.r2) return list;
    }
    return null;
  }, [st.data.lists, st.active]);
  const pickFromList = (value: string) => {
    const s = ref.current;
    emit('dropdown');
    commit(pushData(s, setCells(s.data, { [E.keyOf(s.active.c, s.active.r)]: value })));
    setListOpen(false);
    scrollRef.current?.focus({ preventScroll: true });
  };
  // --- data tools ----------------------------------------------------------------
  const has = (name: ToolName) => !!tools?.includes(name);
  const applyTool = (data: SheetData, message: string, event: string) => {
    const s = ref.current;
    commit(pushData(s, data));
    emit(event);
    setDialog(null);
    setFilterCol(null);
    setNote(message);
    scrollRef.current?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 3500);
    return () => clearTimeout(t);
  }, [note]);
  const workRect = (): Rect | null => {
    const s = ref.current;
    const r = rectOfState(s);
    if (r.c1 !== r.c2 || r.r1 !== r.r2) return r;
    const t = T.tableAt(s.data, s.active);
    return (t && T.tableRect(t)) || T.currentRegion(s.data, s.active);
  };
  const doTable = () => {
    const s = ref.current;
    if (T.tableAt(s.data, s.active)) return setNote('That range is already a table');
    const rc = workRect();
    if (!rc) return setNote('Click inside your data first');
    applyTool(T.makeTable(s.data, rc), 'Table created', 'table');
  };
  const doTotals = () => {
    const s = ref.current;
    const t = T.tableAt(s.data, s.active);
    if (!t) return setNote('Click inside a table first');
    applyTool(T.setTotalsRow(s.data, t.name, !t.totals), t.totals ? 'Total row off' : 'Total row on', 'totals-row');
  };
  const doFilter = () => {
    const s = ref.current;
    if (s.data.filter) return applyTool(T.applyFilter(s.data, undefined), 'Filter removed', 'filter-off');
    const rc = workRect();
    if (!rc) return setNote('Click inside your data first');
    applyTool({ ...s.data, filter: { range: E.rectLabel(rc), cols: {} } }, 'Filter on: use the arrows in the header', 'filter-on');
  };
  const doQuickSort = (asc: boolean) => {
    const s = ref.current;
    const rc = workRect();
    if (!rc) return setNote('Click inside your data first');
    const evl = E.buildEvaluator(s.data);
    let header = true;
    for (let c = rc.c1; c <= rc.c2; c++) if (typeof evl.value(E.keyOf(c, rc.r1)) === 'number') header = false;
    applyTool(T.sortRows(s.data, rc, [{ col: Math.min(Math.max(s.active.c, rc.c1), rc.c2), asc }], header), asc ? 'Sorted A to Z' : 'Sorted Z to A', 'sort');
  };
  const doFlash = () => {
    const s = ref.current;
    const res = T.flashFill(s.data, s.active.c, s.active.r);
    if (res.filled) applyTool(res.data, `Flash Fill filled ${res.filled} cells`, 'flash-fill');
    else setNote('Flash Fill needs an example above, next to your data');
  };
  const activeStyle = st.data.styles[activeKey] ?? {};
  const barText = st.edit ? st.edit.text : (st.data.cells[activeKey] ?? '');

  // selection geometry
  const px = (rc: Rect) => ({
    left: lefts[rc.c1],
    top: tops[rc.r1],
    width: lefts[rc.c2 + 1] - lefts[rc.c1],
    height: tops[rc.r2 + 1] - tops[rc.r1],
  });
  const multi = rect.c1 !== rect.c2 || rect.r1 !== rect.r2;
  const tint: Rect[] = [];
  if (multi) {
    const a = st.active;
    if (a.r > rect.r1) tint.push({ ...rect, r2: a.r - 1 });
    if (a.r < rect.r2) tint.push({ ...rect, r1: a.r + 1 });
    if (a.c > rect.c1) tint.push({ c1: rect.c1, c2: a.c - 1, r1: a.r, r2: a.r });
    if (a.c < rect.c2) tint.push({ c1: a.c + 1, c2: rect.c2, r1: a.r, r2: a.r });
  }
  const wholeCols = rect.r1 === 0 && rect.r2 === E.ROWS - 1;
  const wholeRows = rect.c1 === 0 && rect.c2 === E.COLS - 1;

  const editW = st.edit
    ? Math.max(widths[st.active.c], Math.ceil(st.edit.text.length * CHAR_W + 22))
    : 0;

  const tbBtn = (active = false) =>
    `flex size-8 items-center justify-center rounded-md text-[#1F4D3A] transition-colors hover:bg-[#1F4D3A]/8 ${
      active ? 'bg-[#1F4D3A]/12' : ''
    }`;
  const keepFocus = (e: RMouseEvent) => e.preventDefault();

  return (
    <div
      className={`relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#1F4D3A]/15 bg-white ${fit ? '' : 'h-full'}`}
      style={{ fontFamily: FONT }}
    >
      {toolbar && (
        <div className="relative flex flex-wrap items-center gap-0.5 border-b border-[#1F4D3A]/10 bg-[#F7F8F4] px-2 py-1.5">
          <button type="button" title="Undo (Ctrl+Z)" className={tbBtn()} onMouseDown={keepFocus} onClick={undo} disabled={!st.past.length}>
            <Undo2 size={16} className={st.past.length ? '' : 'opacity-35'} />
          </button>
          <button type="button" title="Redo (Ctrl+Y)" className={tbBtn()} onMouseDown={keepFocus} onClick={redo} disabled={!st.future.length}>
            <Redo2 size={16} className={st.future.length ? '' : 'opacity-35'} />
          </button>
          <span className="mx-1 h-5 w-px bg-[#1F4D3A]/15" />
          <button type="button" title="Bold (Ctrl+B)" className={tbBtn(!!activeStyle.b)} onMouseDown={keepFocus} onClick={() => toggleProp('b')}>
            <Bold size={16} />
          </button>
          <button type="button" title="Italic (Ctrl+I)" className={tbBtn(!!activeStyle.i)} onMouseDown={keepFocus} onClick={() => toggleProp('i')}>
            <Italic size={16} />
          </button>
          <button type="button" title="Underline (Ctrl+U)" className={tbBtn(!!activeStyle.u)} onMouseDown={keepFocus} onClick={() => toggleProp('u')}>
            <Underline size={16} />
          </button>
          <span className="mx-1 h-5 w-px bg-[#1F4D3A]/15" />
          <button type="button" title="Align left" className={tbBtn(activeStyle.align === 'left')} onMouseDown={keepFocus} onClick={() => setAlign('left')}>
            <AlignLeft size={16} />
          </button>
          <button type="button" title="Center" className={tbBtn(activeStyle.align === 'center')} onMouseDown={keepFocus} onClick={() => setAlign('center')}>
            <AlignCenter size={16} />
          </button>
          <button type="button" title="Align right" className={tbBtn(activeStyle.align === 'right')} onMouseDown={keepFocus} onClick={() => setAlign('right')}>
            <AlignRight size={16} />
          </button>
          <span className="mx-1 h-5 w-px bg-[#1F4D3A]/15" />
          <button type="button" title="Currency (Ctrl+Shift+$)" className={tbBtn(activeStyle.fmt === 'currency')} onMouseDown={keepFocus} onClick={() => setFmt('currency')}>
            <DollarSign size={16} />
          </button>
          <button type="button" title="Percent (Ctrl+Shift+%)" className={tbBtn(activeStyle.fmt === 'percent')} onMouseDown={keepFocus} onClick={() => setFmt('percent')}>
            <Percent size={16} />
          </button>
          <button type="button" title="Decrease decimals" className={`${tbBtn()} text-[11px] font-bold`} onMouseDown={keepFocus} onClick={() => bumpDecimals(-1)}>
            .0←
          </button>
          <button type="button" title="Increase decimals" className={`${tbBtn()} text-[11px] font-bold`} onMouseDown={keepFocus} onClick={() => bumpDecimals(1)}>
            →.00
          </button>
          <span className="mx-1 h-5 w-px bg-[#1F4D3A]/15" />
          <div className="relative">
            <button type="button" title="Fill color" className={tbBtn(menu === 'fill')} onMouseDown={keepFocus} onClick={() => setMenu(menu === 'fill' ? null : 'fill')}>
              <Paintbrush size={16} />
              <span className="absolute bottom-1 h-[3px] w-4 rounded-full" style={{ background: activeStyle.bg ?? '#FFF2A8' }} />
            </button>
            {menu === 'fill' && (
              <div className="absolute left-0 top-9 z-50 flex gap-1.5 rounded-lg border border-[#1F4D3A]/15 bg-white p-2 shadow-lg" onMouseDown={keepFocus}>
                {PALETTE_FILL.map((col) => (
                  <button
                    key={col || 'none'}
                    type="button"
                    title={col || 'No fill'}
                    className="size-6 rounded-md border border-[#1F4D3A]/20"
                    style={{ background: col || 'repeating-linear-gradient(45deg,#fff 0 4px,#e5e7eb 4px 5px)' }}
                    onClick={() => {
                      commit(applyStyle(ref.current, (cur) => ({ ...cur, bg: col || undefined })));
                      setMenu(null);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button type="button" title="Text color" className={tbBtn(menu === 'color')} onMouseDown={keepFocus} onClick={() => setMenu(menu === 'color' ? null : 'color')}>
              <Type size={16} />
              <span className="absolute bottom-1 h-[3px] w-4 rounded-full" style={{ background: activeStyle.color ?? '#C0392B' }} />
            </button>
            {menu === 'color' && (
              <div className="absolute left-0 top-9 z-50 flex gap-1.5 rounded-lg border border-[#1F4D3A]/15 bg-white p-2 shadow-lg" onMouseDown={keepFocus}>
                {PALETTE_TEXT.map((col) => (
                  <button
                    key={col || 'none'}
                    type="button"
                    title={col || 'Automatic'}
                    className="size-6 rounded-md border border-[#1F4D3A]/20"
                    style={{ background: col || '#111827' }}
                    onClick={() => {
                      commit(applyStyle(ref.current, (cur) => ({ ...cur, color: col || undefined })));
                      setMenu(null);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <span className="mx-1 h-5 w-px bg-[#1F4D3A]/15" />
          <button type="button" title="AutoSum (Alt+=)" className={tbBtn()} onMouseDown={keepFocus} onClick={() => { emit('autosum'); autoSum(); }}>
            <Sigma size={17} />
          </button>
        </div>
      )}

      {tools && tools.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#1F4D3A]/10 bg-[#F1F5EF] px-2 py-1.5" role="toolbar" aria-label="Data tools">
          {(
            [
              has('table') && ['Table', 'Format as Table (Ctrl+T in Excel)', doTable],
              has('totals') && ['Total row', 'Show or hide the table total row', doTotals],
              has('sort') && ['Sort A→Z', 'Sort by the selected column', () => doQuickSort(true)],
              has('sort') && ['Sort Z→A', 'Sort by the selected column, reversed', () => doQuickSort(false)],
              has('sort') && ['Custom sort', 'Sort by several columns', () => setDialog('sort')],
              has('filter') && ['Filter', 'Turn the filter arrows on or off (Ctrl+Shift+L)', doFilter],
              has('slicer') && ['Slicer', 'Add a slicer', () => setDialog('slicer')],
              has('dedupe') && ['Remove duplicates', 'Remove duplicate rows', () => setDialog('dedupe')],
              has('text2col') && ['Text to columns', 'Split text into columns', () => setDialog('text2col')],
              has('flash') && ['Flash fill', 'Fill by example (Ctrl+E)', doFlash],
              has('find') && ['Find & replace', 'Find and replace (Ctrl+H)', () => setDialog('find')],
              has('goalseek') && ['Goal seek', 'What-if: Goal Seek', () => setDialog('goalseek')],
              has('datatable') && ['Data table', 'What-if: Data Table', () => setDialog('datatable')],
            ] as (false | [string, string, () => void])[]
          )
            .filter((b): b is [string, string, () => void] => !!b)
            .map(([label, title, fn]) => (
              <button
                key={label}
                type="button"
                title={title}
                onMouseDown={keepFocus}
                onClick={fn}
                className="rounded-md border border-[#1F4D3A]/20 bg-white px-2.5 py-1 text-xs font-semibold text-[#1F4D3A] transition-colors hover:bg-[#C7F000]/40"
              >
                {label}
              </button>
            ))}
        </div>
      )}
      <SlicerBar data={st.data} onApply={applyTool} />

      {/* Name box + formula bar */}
      <div className="flex items-center gap-2 border-b border-[#1F4D3A]/10 bg-white px-2 py-1.5">
        <input
          aria-label="Name box"
          className="h-7 w-24 rounded-md border border-[#1F4D3A]/15 bg-white px-2 text-center text-[13px] font-semibold text-[#1F4D3A] outline-none focus:border-[#1F4D3A]"
          value={nameDraft ?? E.rectLabel(rect)}
          onFocus={(e) => {
            setNameDraft(E.rectLabel(rect));
            e.currentTarget.select();
          }}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={() => setNameDraft(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const typed = (nameDraft ?? '').trim();
              const known = Object.entries(ref.current.data.names ?? {}).find(([k]) => k.toUpperCase() === typed.toUpperCase());
              const rc = E.parseRectLabel(known ? known[1] : typed);
              if (rc) {
                emit(known ? 'name-jump' : 'name-box');
                const s = ref.current;
                commit({ ...s, origin: { c: rc.c1, r: rc.r1 }, focus: { c: rc.c2, r: rc.r2 }, active: { c: rc.c1, r: rc.r1 } });
              } else if (/^[A-Za-z_][A-Za-z0-9_.]*$/.test(typed) && !E.parseKey(typed) && !/^[A-Za-z]{1,3}:[A-Za-z]{1,3}$/.test(typed)) {
                // Typing a new name over a selection defines a named range, like Excel.
                emit('define-name');
                const s = ref.current;
                commit({ ...s, data: { ...s.data, names: { ...s.data.names, [typed.toUpperCase()]: E.rectLabel(E.rectOf(s.origin, s.focus)) } } });
              }
              setNameDraft(null);
              scrollRef.current?.focus({ preventScroll: true });
            } else if (e.key === 'Escape') {
              setNameDraft(null);
              scrollRef.current?.focus({ preventScroll: true });
            }
          }}
        />
        <span className="select-none text-sm font-semibold italic text-[#1F4D3A]/50">fx</span>
        <input
          ref={barRef}
          aria-label="Formula bar"
          className="h-7 min-w-0 flex-1 rounded-md border border-transparent bg-white px-2 text-[13px] text-[#111827] outline-none focus:border-[#1F4D3A]/40"
          value={barText}
          spellCheck={false}
          onFocus={() => {
            const s = ref.current;
            if (!s.edit) commit(startEdit(s, 'edit', s.data.cells[activeKey] ?? '', 'bar'));
          }}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={editKeyDown}
          onSelect={(e) => {
            caretRef.current = e.currentTarget.selectionStart ?? 0;
          }}
        />
      </div>

      {/* Grid */}
      <div
        ref={scrollRef}
        tabIndex={0}
        role="grid"
        aria-label="Spreadsheet"
        className={`sheet-scroll relative min-h-0 ${fit ? '' : 'flex-1'} bg-white outline-none ${noScroll ? 'overflow-hidden' : 'overflow-auto'}`}
        style={{ fontSize: 13, cursor: 'cell' }}
        onKeyDown={onKeyDown}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        onCopy={onCopy}
        onCut={onCut}
        onPaste={onPaste}
      >
        <div style={{ position: 'relative', width: ROW_HDR_W + totalW, height: COL_H + tops[E.ROWS] }}>
          {/* column headers */}
          <div style={{ position: 'sticky', top: 0, height: COL_H, width: ROW_HDR_W + totalW, zIndex: 30 }}>
            <div
              style={{ position: 'sticky', left: 0, width: ROW_HDR_W, height: COL_H, zIndex: 31, borderRight: `1px solid ${GRID_LINE}`, borderBottom: `1px solid #CFD5CB` }}
              className="bg-[#EEF1EA]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" style={{ position: 'absolute', right: 5, bottom: 4 }}>
                <path d="M13 1 L13 13 L1 13 Z" fill="#B8BFB4" />
              </svg>
            </div>
            {widths.map((w, c) => {
              const inSel = c >= rect.c1 && c <= rect.c2;
              return (
                <div
                  key={c}
                  style={{
                    position: 'absolute',
                    left: ROW_HDR_W + lefts[c],
                    top: 0,
                    width: w,
                    height: COL_H,
                    borderRight: `1px solid ${GRID_LINE}`,
                    borderBottom: inSel ? `2px solid ${BRAND}` : '1px solid #CFD5CB',
                    background: inSel ? (wholeCols ? '#C9DCCF' : '#DCE8DF') : '#EEF1EA',
                    color: inSel ? BRAND : '#4B5563',
                    fontWeight: inSel ? 700 : 500,
                  }}
                  className="flex select-none items-center justify-center text-[12px]"
                >
                  {E.colLabel(c)}
                  <div
                    title="Drag to resize. Double-click to fit."
                    style={{ position: 'absolute', right: -3, top: 0, width: 7, height: COL_H, cursor: 'col-resize', zIndex: 5 }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      dragRef.current = { kind: 'resize', c, x0: e.clientX, w0: w };
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      autoFit(c);
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ position: 'relative', width: ROW_HDR_W + totalW, height: tops[E.ROWS] }}>
            {/* row headers */}
            <div style={{ position: 'sticky', left: 0, width: ROW_HDR_W, height: tops[E.ROWS], zIndex: 20 }}>
              {Array.from({ length: E.ROWS }, (_, r) => {
                if (hiddenSet.has(r)) return null;
                const inSel = r >= rect.r1 && r <= rect.r2;
                return (
                  <div
                    key={r}
                    style={{
                      position: 'absolute',
                      top: tops[r],
                      left: 0,
                      width: ROW_HDR_W,
                      height: ROW_H,
                      borderBottom: `1px solid ${GRID_LINE}`,
                      borderRight: inSel ? `2px solid ${BRAND}` : '1px solid #CFD5CB',
                      background: inSel ? (wholeRows ? '#C9DCCF' : '#DCE8DF') : '#EEF1EA',
                      color: inSel ? BRAND : '#4B5563',
                      fontWeight: inSel ? 700 : 500,
                    }}
                    className="flex select-none items-center justify-center text-[12px]"
                  >
                    {r + 1}
                  </div>
                );
              })}
            </div>

            {/* cell layer */}
            <div
              style={{
                position: 'absolute',
                left: ROW_HDR_W,
                top: 0,
                width: totalW,
                height: tops[E.ROWS],
                zIndex: 1,
                isolation: 'isolate',
              }}
            >
              {Array.from({ length: E.ROWS }, (_, r) =>
                hiddenSet.has(r) ? null : (
                  <div key={`hl${r}`} style={{ position: 'absolute', left: 0, top: tops[r] + ROW_H - 1, width: '100%', height: 1, background: GRID_LINE }} />
                ),
              )}
              {lefts.slice(1).map((x, i) => (
                <div key={i} style={{ position: 'absolute', left: x - 1, top: 0, width: 1, height: '100%', background: GRID_LINE }} />
              ))}

              {/* fills */}
              {items.map(
                (it) =>
                  it.style.bg && (
                    <div key={`bg-${it.key}`} style={{ position: 'absolute', left: it.left, top: it.top, width: it.w - 1, height: ROW_H - 1, background: it.style.bg }} />
                  ),
              )}

              {/* selection tint */}
              {tint.map((t, i) => (
                <div key={i} style={{ position: 'absolute', ...px(t), background: 'rgba(31,77,58,0.12)', pointerEvents: 'none' }} />
              ))}

              {/* cell text */}
              {items.map((it) => (
                <div
                  key={it.key}
                  style={{
                    position: 'absolute',
                    left: it.left,
                    top: it.top,
                    width: it.spanW,
                    height: ROW_H,
                    padding: '0 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: it.align === 'left' ? 'flex-start' : it.align === 'right' ? 'flex-end' : 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    fontWeight: it.style.b ? 700 : 400,
                    fontStyle: it.style.i ? 'italic' : 'normal',
                    textDecoration: it.style.u ? 'underline' : 'none',
                    color: it.isErr ? '#B42318' : (it.style.color ?? '#111827'),
                  }}
                >
                  {it.text}
                </div>
              ))}

              {/* copy marquee */}
              {st.clip && (
                <div
                  style={{ position: 'absolute', ...px(st.clip.rect), border: `2px dashed ${BRAND}`, pointerEvents: 'none', zIndex: 4 }}
                />
              )}
              {/* fill preview */}
              {st.fill && (
                <div style={{ position: 'absolute', ...px(st.fill), border: `2px dashed ${BRAND}`, background: 'rgba(31,77,58,0.05)', pointerEvents: 'none', zIndex: 4 }} />
              )}
              {/* formula point highlight */}
              {st.point && (
                <div style={{ position: 'absolute', ...px(st.point), border: '2px dashed #2563EB', background: 'rgba(37,99,235,0.07)', pointerEvents: 'none', zIndex: 4 }} />
              )}

              {/* selection border + fill handle */}
              {!st.edit && (
                <div
                  style={{ position: 'absolute', ...px(rect), border: `2px solid ${BRAND}`, pointerEvents: 'none', zIndex: 5, boxSizing: 'border-box' }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: -5,
                      bottom: -5,
                      width: 8,
                      height: 8,
                      background: BRAND,
                      border: '1px solid #fff',
                      cursor: 'crosshair',
                      pointerEvents: 'auto',
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      scrollRef.current?.focus({ preventScroll: true });
                      dragRef.current = { kind: 'fill', src: rectOfState(ref.current) };
                    }}
                  />
                </div>
              )}

              {/* filter arrows */}
              {st.data.filter &&
                (() => {
                  const fr = T.filterRect(st.data.filter);
                  if (!fr) return null;
                  return Array.from({ length: fr.c2 - fr.c1 + 1 }, (_, i) => {
                    const c = fr.c1 + i;
                    const on = !!st.data.filter?.cols[c];
                    return (
                      <button
                        key={`fa${c}`}
                        type="button"
                        aria-label={`Filter ${E.colLabel(c)}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFilterCol(filterCol === c ? null : c);
                        }}
                        style={{ position: 'absolute', left: lefts[c + 1] - 19, top: tops[fr.r1] + 3, width: 16, height: ROW_H - 6, zIndex: 9, background: on ? '#C7F000' : '#fff', border: '1px solid #9DB3A5', fontSize: 8, color: '#1F4D3A', cursor: 'pointer', padding: 0 }}
                      >
                        ▼
                      </button>
                    );
                  });
                })()}
              {filterCol !== null && st.data.filter && T.filterRect(st.data.filter) && (
                <div style={{ position: 'absolute', left: Math.max(0, Math.min(lefts[filterCol], totalW - 230)), top: tops[(T.filterRect(st.data.filter) as Rect).r1] + ROW_H, zIndex: 70 }}>
                  <FilterMenu key={filterCol} data={st.data} col={filterCol} onApply={applyTool} onClose={() => setFilterCol(null)} />
                </div>
              )}

              {/* dropdown arrow + list for cells with a list */}
              {!st.edit && activeList && (
                <div style={{ position: 'absolute', left: lefts[st.active.c], top: tops[st.active.r], width: widths[st.active.c], height: ROW_H, zIndex: 8, pointerEvents: 'none' }}>
                  <button
                    type="button"
                    aria-label="Open list"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setListOpen((o) => !o);
                    }}
                    style={{ position: 'absolute', right: 1, top: 1, width: 18, height: ROW_H - 2, pointerEvents: 'auto', background: '#E9EDE7', border: '1px solid #C9D3CB', fontSize: 9, color: '#1F4D3A', cursor: 'pointer' }}
                  >
                    ▼
                  </button>
                  {listOpen && (
                    <div
                      style={{ position: 'absolute', left: 0, top: ROW_H, minWidth: widths[st.active.c], pointerEvents: 'auto', background: '#fff', border: '1px solid #1F4D3A', boxShadow: '0 6px 16px rgba(0,0,0,0.18)', zIndex: 60 }}
                    >
                      {activeList.map((opt) => (
                        <div
                          key={opt}
                          role="option"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            pickFromList(opt);
                          }}
                          style={{ padding: '3px 8px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#DCE8DF')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* in-cell editor */}
              {st.edit && (
                <input
                  ref={cellInputRef}
                  aria-label="Cell editor"
                  value={st.edit.text}
                  spellCheck={false}
                  onChange={(e) => onEditChange(e.target.value)}
                  onKeyDown={editKeyDown}
                  onSelect={(e) => {
                    caretRef.current = e.currentTarget.selectionStart ?? 0;
                  }}
                  style={{
                    position: 'absolute',
                    left: lefts[st.active.c],
                    top: tops[st.active.r],
                    width: editW,
                    height: ROW_H,
                    zIndex: 40,
                    border: `2px solid ${BRAND}`,
                    outline: 'none',
                    padding: '0 3px',
                    font: 'inherit',
                    fontWeight: activeStyle.b ? 700 : 400,
                    fontStyle: activeStyle.i ? 'italic' : 'normal',
                    background: '#fff',
                    color: '#111827',
                    boxSizing: 'border-box',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {dialog && <ToolDialog kind={dialog} data={st.data} rect={rect} active={st.active} onApply={applyTool} onClose={() => setDialog(null)} />}
      {note && (
        <div role="status" className="pointer-events-none absolute bottom-10 left-3 z-[90] max-w-[80%] rounded-md bg-[#1F4D3A] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
          {note}
        </div>
      )}

      {statusBar && (
        <div className="flex min-h-7 items-center justify-end border-t border-[#1F4D3A]/10 bg-[#F7F8F4] px-3 py-1 text-[12px] text-[#1F4D3A]/70">
          {stats && stats.count > 0 && (
            <div className="flex items-center gap-4 font-medium">
              {stats.n > 0 && <span>Average: {E.fmtGeneral(Number.parseFloat(stats.avg.toFixed(8)))}</span>}
              <span>Count: {stats.count}</span>
              {stats.n > 0 && <span>Sum: {E.fmtGeneral(Number.parseFloat(stats.sum.toFixed(8)))}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
