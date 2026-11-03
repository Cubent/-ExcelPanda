// A small mutable view of the sheet for macros and scripts. Reads are evaluated; writes are collected as a patch.
import * as E from './engine';

export type SheetPatch = { cells: Record<string, string>; styles: Record<string, E.Style> };

export class SheetModel {
  cells: Record<string, string>;
  styles: Record<string, E.Style>;
  private base: E.SheetData;
  private ev: E.Evaluator | null = null;
  /** Selection, as in the Excel window. */
  active: E.Pos;
  sel: E.Rect;
  /** Named ranges, upper-cased. */
  names: Record<string, string>;
  private touched = new Set<string>();
  private touchedStyles = new Set<string>();

  constructor(data: E.SheetData, active: E.Pos = { c: 0, r: 0 }, sel?: E.Rect) {
    this.base = data;
    this.cells = { ...data.cells };
    this.styles = { ...data.styles };
    this.names = Object.fromEntries(Object.entries(data.names ?? {}).map(([k, v]) => [k.toUpperCase(), v]));
    this.active = active;
    this.sel = sel ?? { c1: active.c, r1: active.r, c2: active.c, r2: active.r };
  }

  private dirty() {
    this.ev = null;
  }
  private evaluator(): E.Evaluator {
    if (!this.ev) this.ev = E.buildEvaluator({ ...this.base, cells: this.cells, styles: this.styles });
    return this.ev;
  }

  inBounds(c: number, r: number) {
    return E.inBounds(c, r);
  }
  raw(key: string): string {
    return this.cells[key] ?? '';
  }
  value(key: string): E.Scalar {
    return this.evaluator().value(key);
  }
  display(key: string): string {
    return this.evaluator().display(key);
  }
  evalFormula(formula: string): E.Scalar {
    return this.evaluator().evalFormula(formula.startsWith('=') ? formula : `=${formula}`);
  }
  setRaw(key: string, raw: string) {
    if (raw === '') delete this.cells[key];
    else this.cells[key] = raw;
    this.touched.add(key);
    this.dirty();
  }
  style(key: string): E.Style {
    return this.styles[key] ?? {};
  }
  setStyle(key: string, patch: Partial<E.Style>) {
    const cur = { ...this.styles[key], ...patch };
    for (const k of Object.keys(cur) as (keyof E.Style)[]) if (cur[k] === undefined || cur[k] === false) delete cur[k];
    if (Object.keys(cur).length) this.styles[key] = cur;
    else delete this.styles[key];
    this.touchedStyles.add(key);
    this.dirty();
  }
  clearStyle(key: string) {
    delete this.styles[key];
    this.touchedStyles.add(key);
    this.dirty();
  }
  /** The last used row/column (0-based), or null when the sheet is empty. */
  used(): { r2: number; c2: number } | null {
    let r2 = -1;
    let c2 = -1;
    for (const k of Object.keys(this.cells)) {
      const p = E.parseKey(k);
      if (!p || this.cells[k] === '') continue;
      r2 = Math.max(r2, p.r);
      c2 = Math.max(c2, p.c);
    }
    return r2 < 0 ? null : { r2, c2 };
  }
  /** Everything that changed, as a patch for the grid (empty string clears a cell). */
  patch(): SheetPatch {
    const cells: Record<string, string> = {};
    for (const k of this.touched) cells[k] = this.cells[k] ?? '';
    const styles: Record<string, E.Style> = {};
    for (const k of this.touchedStyles) styles[k] = this.styles[k] ?? {};
    return { cells, styles };
  }
  changed(): boolean {
    return this.touched.size > 0 || this.touchedStyles.size > 0;
  }
}
