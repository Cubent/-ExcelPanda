// A small Office Scripts runner: TypeScript (types are stripped) calling a subset of the ExcelScript API.
import * as E from './engine';
import type { SheetModel } from './sheet-api';

export type ScriptResult = { ok: boolean; error?: { message: string }; output: string[] };

const COLORS: Record<string, string> = { red: '#ff0000', green: '#00b050', blue: '#0000ff', yellow: '#ffff00', black: '#000000', white: '#ffffff', orange: '#ffa500', gray: '#808080', grey: '#808080' };
const color = (c: string) => COLORS[c.toLowerCase()] ?? c;

/** Removes the type annotations that appear in typical Office Scripts, leaving plain JavaScript. */
export function stripTypes(code: string): string {
  let out = code;
  // function parameter and return types
  out = out.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*[\w.<>[\]| ]+)?\s*\{/g, (_m, name: string, params: string) => {
    const clean = params
      .split(',')
      .map((p) => p.replace(/\s*:\s*[\w.<>[\]| ]+/, '').trim())
      .filter(Boolean)
      .join(', ');
    return `function ${name}(${clean}) {`;
  });
  // let/const/var annotations
  out = out.replace(/\b(let|const|var)\s+(\w+)\s*:\s*[\w.<>[\]| ]+?\s*=/g, '$1 $2 =');
  // arrow function params in simple form: (a: number) =>
  out = out.replace(/\(([^()]*)\)\s*(?::\s*[\w.<>[\]| ]+)?\s*=>/g, (_m, params: string) => `(${params.split(',').map((p) => p.replace(/\s*:\s*[\w.<>[\]| ]+/, '').trim()).join(', ')}) =>`);
  // casts and non-null assertions
  out = out.replace(/\s+as\s+[\w.<>[\]| ]+/g, '');
  out = out.replace(/(\w|\))!(?=[.)[,;\s])/g, '$1');
  // interfaces / type aliases are removed
  out = out.replace(/^\s*(interface\s+\w+\s*\{[^}]*\}|type\s+\w+\s*=[^;]*;)\s*$/gm, '');
  return out;
}

/** Adds a step counter to every loop so an endless loop stops instead of freezing the page. */
export function guardLoops(code: string): string {
  let out = '';
  let i = 0;
  while (i < code.length) {
    const m = /\b(for|while)\s*\(/y;
    m.lastIndex = i;
    const prev = code[i - 1] ?? ' ';
    const hit = !/\w/.test(prev) ? m.exec(code) : null;
    if (hit) {
      let j = i + hit[0].length;
      let depth = 1;
      while (j < code.length && depth > 0) {
        if (code[j] === '(') depth++;
        else if (code[j] === ')') depth--;
        j++;
      }
      let k = j;
      while (/\s/.test(code[k] ?? '')) k++;
      out += code.slice(i, j);
      if (code[k] === '{') {
        out += `${code.slice(j, k)}{ __tick();`;
        i = k + 1;
      } else i = j;
      continue;
    }
    if (!/\w/.test(prev) && /^do\s*\{/.test(code.slice(i, i + 8))) {
      const mm = /^do\s*\{/.exec(code.slice(i)) as RegExpExecArray;
      out += `${mm[0]} __tick();`;
      i += mm[0].length;
      continue;
    }
    out += code[i++];
  }
  return out;
}

export function runScript(code: string, model: SheetModel): ScriptResult {
  const output: string[] = [];
  const cellsOf = (rc: E.Rect) => {
    const out: string[] = [];
    for (let r = rc.r1; r <= rc.r2; r++) for (let c = rc.c1; c <= rc.c2; c++) out.push(E.keyOf(c, r));
    return out;
  };
  const check = (rc: E.Rect) => {
    if (!E.inBounds(rc.c1, rc.r1) || !E.inBounds(rc.c2, rc.r2)) throw new Error('That range is outside this practice sheet.');
  };
  const scalar = (v: E.Scalar): string | number | boolean => (v === null ? '' : v instanceof E.XlError ? v.code : v);
  const textOf = (v: unknown): string => (v === null || v === undefined ? '' : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : String(v));

  const range = (rc: E.Rect): Record<string, unknown> => {
    const rows = rc.r2 - rc.r1 + 1;
    const cols = rc.c2 - rc.c1 + 1;
    const each = (fn: (k: string) => void) => cellsOf(rc).forEach(fn);
    const grid2 = <T>(fn: (k: string) => T): T[][] => Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => fn(E.keyOf(rc.c1 + c, rc.r1 + r))));
    const style = (patch: Partial<E.Style>) => {
      check(rc);
      each((k) => model.setStyle(k, patch));
    };
    const self: Record<string, unknown> = {
      getAddress: () => E.rectLabel(rc),
      getRowCount: () => rows,
      getColumnCount: () => cols,
      getRowIndex: () => rc.r1,
      getColumnIndex: () => rc.c1,
      getValue: () => (E.inBounds(rc.c1, rc.r1) ? scalar(model.value(E.keyOf(rc.c1, rc.r1))) : ''),
      getValues: () => grid2((k) => scalar(model.value(k))),
      getText: () => (E.inBounds(rc.c1, rc.r1) ? model.display(E.keyOf(rc.c1, rc.r1)) : ''),
      getFormula: () => model.raw(E.keyOf(rc.c1, rc.r1)),
      getFormulas: () => grid2((k) => model.raw(k)),
      setValue: (v: unknown) => {
        check(rc);
        each((k) => model.setRaw(k, textOf(v)));
        return self;
      },
      setValues: (vs: unknown[][]) => {
        check(rc);
        if (!Array.isArray(vs) || vs.length !== rows || vs.some((r) => !Array.isArray(r) || r.length !== cols)) throw new Error(`The values must be ${rows} rows by ${cols} columns to fit ${E.rectLabel(rc)}.`);
        vs.forEach((row, r) => row.forEach((v, c) => model.setRaw(E.keyOf(rc.c1 + c, rc.r1 + r), textOf(v))));
        return self;
      },
      setFormula: (f: string) => {
        check(rc);
        each((k) => model.setRaw(k, f));
        return self;
      },
      setFormulas: (fs: string[][]) => {
        check(rc);
        fs.forEach((row, r) => row.forEach((v, c) => model.setRaw(E.keyOf(rc.c1 + c, rc.r1 + r), v)));
        return self;
      },
      setNumberFormat: (f: string) => style({ nf: f.toLowerCase() === 'general' ? undefined : f }),
      setNumberFormatLocal: (f: string) => style({ nf: f.toLowerCase() === 'general' ? undefined : f }),
      clear: () => {
        check(rc);
        each((k) => {
          model.setRaw(k, '');
          model.clearStyle(k);
        });
      },
      getCell: (r: number, c: number) => range({ c1: rc.c1 + c, r1: rc.r1 + r, c2: rc.c1 + c, r2: rc.r1 + r }),
      getOffsetRange: (r: number, c: number) => range({ c1: rc.c1 + c, r1: rc.r1 + r, c2: rc.c2 + c, r2: rc.r2 + r }),
      getResizedRange: (r: number, c: number) => range({ ...rc, c2: rc.c2 + c, r2: rc.r2 + r }),
      getFormat: () => ({
        getFont: () => ({
          setBold: (b: boolean) => style({ b }),
          setItalic: (b: boolean) => style({ i: b }),
          setColor: (c: string) => style({ color: color(c) }),
          setSize: () => undefined,
          setName: () => undefined,
        }),
        getFill: () => ({ setColor: (c: string) => style({ bg: color(c) }), clear: () => style({ bg: undefined }) }),
        setHorizontalAlignment: (a: string) => style({ align: a.toLowerCase() === 'center' ? 'center' : a.toLowerCase() === 'right' ? 'right' : 'left' }),
        autofitColumns: () => undefined,
        autofitRows: () => undefined,
        setColumnWidth: () => undefined,
      }),
      select: () => {
        model.active = { c: rc.c1, r: rc.r1 };
        model.sel = rc;
      },
    };
    return self;
  };

  const rangeFromAddress = (a: string): E.Rect => {
    const clean = a.replace(/\$/g, '').replace(/^.*!/, '');
    const rc = E.parseRectLabel(model.names[clean.toUpperCase()] ?? clean);
    if (!rc) throw new Error(`The range "${a}" is not valid.`);
    return rc;
  };
  const sheet = {
    getName: () => 'Sheet1',
    getRange: (a?: string) => {
      if (!a) {
        const u = model.used();
        return range(u ? { c1: 0, r1: 0, c2: u.c2, r2: u.r2 } : { c1: 0, r1: 0, c2: 0, r2: 0 });
      }
      return range(rangeFromAddress(a));
    },
    getRangeByIndexes: (r: number, c: number, h: number, w: number) => range({ c1: c, r1: r, c2: c + w - 1, r2: r + h - 1 }),
    getCell: (r: number, c: number) => range({ c1: c, r1: r, c2: c, r2: r }),
    getUsedRange: () => {
      const u = model.used();
      return range(u ? { c1: 0, r1: 0, c2: u.c2, r2: u.r2 } : { c1: 0, r1: 0, c2: 0, r2: 0 });
    },
    activate: () => undefined,
  };
  const workbook = {
    getActiveWorksheet: () => sheet,
    getWorksheet: () => sheet,
    getWorksheets: () => [sheet],
    refreshAllDataConnections: () => output.push('Refreshed all data connections'),
    getSelectedRange: () => range(model.sel),
    getActiveCell: () => range({ c1: model.active.c, r1: model.active.r, c2: model.active.c, r2: model.active.r }),
  };

  let steps = 0;
  const tick = () => {
    if (++steps > 200000) throw new Error('The script ran too long. It may contain an endless loop.');
  };
  const consoleObj = { log: (...a: unknown[]) => output.push(a.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' ')) };
  try {
    const js = guardLoops(stripTypes(code));
    if (!/function\s+main\s*\(/.test(js)) return { ok: false, error: { message: 'The script needs a function called main(workbook: ExcelScript.Workbook).' }, output };
    // eslint-disable-next-line no-new-func
    const fn = new Function('console', '__tick', `"use strict";\n${js}\nreturn main;`);
    const main = fn(consoleObj, tick) as (wb: unknown) => unknown;
    main(workbook);
    return { ok: true, output };
  } catch (e) {
    return { ok: false, error: { message: e instanceof Error ? e.message : String(e) }, output };
  }
}
