// A small VBA interpreter for the practice sheet. It supports the subset that spreadsheet macros use:
// Sub/Function, Dim/Const, If/Select Case, For/For Each/Do/While, With, On Error, Range/Cells/ActiveCell/Selection,
// worksheet functions, and the common string and math functions. It is not a complete VBA implementation.
import * as E from './engine';
import { formatWithPattern } from './numfmt';
import type { SheetModel } from './sheet-api';

// ---------------------------------------------------------------------------
// Values
// ---------------------------------------------------------------------------
type Obj =
  | { kind: 'range'; rc: E.Rect }
  | { kind: 'font'; rc: E.Rect }
  | { kind: 'interior'; rc: E.Rect }
  | { kind: 'app' }
  | { kind: 'wf' }
  | { kind: 'sheet' }
  | { kind: 'err' }
  | { kind: 'debug' }
  | { kind: 'dim'; rc: E.Rect | null; axis: 'rows' | 'cols' };
export type V = number | string | boolean | null | E.XlError | Obj;
const isObj = (v: V): v is Obj => typeof v === 'object' && v !== null && !(v instanceof E.XlError) && 'kind' in v;

export class VbaError extends Error {
  constructor(
    public num: number,
    public desc: string,
    public line = 0,
    public compile = false,
  ) {
    super(desc);
  }
}
class Signal {
  constructor(public kind: 'for' | 'do' | 'sub' | 'function') {}
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------
type Tok = { t: 'num' | 'str' | 'id' | 'op' | 'eol'; v: string; n?: number; l: string };
type Line = { toks: Tok[]; line: number };

function tokenise(src: string): Line[] {
  const raw = src.replace(/\r\n?/g, '\n').replace(/ _\n/g, ' ').split('\n');
  const out: Line[] = [];
  raw.forEach((text, i) => {
    const toks: Tok[] = [];
    let p = 0;
    while (p < text.length) {
      const ch = text[p];
      if (ch === ' ' || ch === '\t') {
        p++;
      } else if (ch === "'") {
        break;
      } else if (ch === '"') {
        let s = '';
        p++;
        while (p < text.length) {
          if (text[p] === '"') {
            if (text[p + 1] === '"') {
              s += '"';
              p += 2;
              continue;
            }
            break;
          }
          s += text[p++];
        }
        if (text[p] !== '"') throw new VbaError(0, 'Expected: end of string', i + 1, true);
        p++;
        toks.push({ t: 'str', v: s, l: s });
      } else if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(text[p + 1] ?? ''))) {
        const m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(text.slice(p)) as RegExpExecArray;
        toks.push({ t: 'num', v: m[0], n: Number(m[0]), l: m[0] });
        p += m[0].length;
      } else if (/[A-Za-z_]/.test(ch)) {
        const m = /^[A-Za-z_][A-Za-z0-9_]*[$%&!#]?/.exec(text.slice(p)) as RegExpExecArray;
        const word = m[0].replace(/[$%&!#]$/, '');
        toks.push({ t: 'id', v: word, l: word.toLowerCase() });
        p += m[0].length;
      } else {
        const two = text.slice(p, p + 2);
        if (['<>', '<=', '>=', ':='].includes(two)) {
          toks.push({ t: 'op', v: two, l: two });
          p += 2;
        } else if ('+-*/\\^&=<>(),.:'.includes(ch)) {
          toks.push({ t: 'op', v: ch, l: ch });
          p++;
        } else throw new VbaError(0, `Unexpected character "${ch}"`, i + 1, true);
      }
    }
    // Rem comments
    if (toks[0]?.l === 'rem') toks.length = 0;
    if (toks.length) out.push({ toks, line: i + 1 });
  });
  return out;
}

// ---------------------------------------------------------------------------
// AST
// ---------------------------------------------------------------------------
type Arg = { name?: string; e: Expr | null };
type Expr =
  | { k: 'num'; v: number }
  | { k: 'str'; v: string }
  | { k: 'bool'; v: boolean }
  | { k: 'empty' }
  | { k: 'id'; name: string }
  | { k: 'member'; obj: Expr | null; name: string }
  | { k: 'call'; fn: Expr; args: Arg[] }
  | { k: 'bin'; op: string; a: Expr; b: Expr }
  | { k: 'un'; op: string; a: Expr };

type Stmt = { line: number } & (
  | { s: 'dim'; names: { name: string; type: string }[] }
  | { s: 'const'; name: string; e: Expr }
  | { s: 'assign'; target: Expr; e: Expr }
  | { s: 'call'; e: Expr }
  | { s: 'if'; branches: { cond: Expr | null; body: Stmt[] }[] }
  | { s: 'for'; v: Expr; from: Expr; to: Expr; step: Expr | null; body: Stmt[] }
  | { s: 'foreach'; v: Expr; coll: Expr; body: Stmt[] }
  | { s: 'do'; pre: { until: boolean; cond: Expr } | null; post: { until: boolean; cond: Expr } | null; body: Stmt[] }
  | { s: 'select'; e: Expr; cases: { tests: CaseTest[] | null; body: Stmt[] }[] }
  | { s: 'with'; obj: Expr; body: Stmt[] }
  | { s: 'exit'; what: 'for' | 'do' | 'sub' | 'function' }
  | { s: 'onerror'; mode: 'next' | 'goto0' | 'label'; label?: string }
  | { s: 'label'; name: string }
);
type CaseTest = { op?: string; a: Expr; b?: Expr };
export type Proc = { name: string; kind: 'sub' | 'function'; params: { name: string; optional: boolean; def: Expr | null }[]; body: Stmt[]; line: number };
export type Program = { procs: Record<string, Proc>; globals: Stmt[]; explicit: boolean };

class Stream {
  i = 0;
  constructor(
    public toks: Tok[],
    public line: number,
  ) {}
  get cur(): Tok | undefined {
    return this.toks[this.i];
  }
  peek(n = 0): Tok | undefined {
    return this.toks[this.i + n];
  }
  done() {
    return this.i >= this.toks.length;
  }
  isOp(v: string) {
    return this.cur?.t === 'op' && this.cur.v === v;
  }
  isKw(v: string) {
    return this.cur?.t === 'id' && this.cur.l === v;
  }
  eatOp(v: string) {
    if (this.isOp(v)) {
      this.i++;
      return true;
    }
    return false;
  }
  eatKw(v: string) {
    if (this.isKw(v)) {
      this.i++;
      return true;
    }
    return false;
  }
  expectOp(v: string) {
    if (!this.eatOp(v)) this.fail(`Expected: ${v}`);
  }
  expectKw(v: string) {
    if (!this.eatKw(v)) this.fail(`Expected: ${v}`);
  }
  fail(msg: string): never {
    throw new VbaError(0, msg, this.line, true);
  }
}

// --- expressions -------------------------------------------------------------
const BOOL_OPS = ['or', 'xor', 'and'];
function parseExpr(s: Stream): Expr {
  return parseOr(s);
}
function parseOr(s: Stream): Expr {
  let a = parseAnd(s);
  while (s.cur?.t === 'id' && (s.cur.l === 'or' || s.cur.l === 'xor')) {
    const op = s.cur.l;
    s.i++;
    a = { k: 'bin', op, a, b: parseAnd(s) };
  }
  return a;
}
function parseAnd(s: Stream): Expr {
  let a = parseNot(s);
  while (s.isKw('and')) {
    s.i++;
    a = { k: 'bin', op: 'and', a, b: parseNot(s) };
  }
  return a;
}
function parseNot(s: Stream): Expr {
  if (s.eatKw('not')) return { k: 'un', op: 'not', a: parseNot(s) };
  return parseCmp(s);
}
function parseCmp(s: Stream): Expr {
  let a = parseConcat(s);
  while (s.cur?.t === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(s.cur.v)) {
    const op = s.cur.v;
    s.i++;
    a = { k: 'bin', op, a, b: parseConcat(s) };
  }
  return a;
}
function parseConcat(s: Stream): Expr {
  let a = parseAdd(s);
  while (s.isOp('&')) {
    s.i++;
    a = { k: 'bin', op: '&', a, b: parseAdd(s) };
  }
  return a;
}
function parseAdd(s: Stream): Expr {
  let a = parseMod(s);
  while (s.isOp('+') || s.isOp('-')) {
    const op = (s.cur as Tok).v;
    s.i++;
    a = { k: 'bin', op, a, b: parseMod(s) };
  }
  return a;
}
function parseMod(s: Stream): Expr {
  let a = parseIntDiv(s);
  while (s.isKw('mod')) {
    s.i++;
    a = { k: 'bin', op: 'mod', a, b: parseIntDiv(s) };
  }
  return a;
}
function parseIntDiv(s: Stream): Expr {
  let a = parseMul(s);
  while (s.isOp('\\')) {
    s.i++;
    a = { k: 'bin', op: '\\', a, b: parseMul(s) };
  }
  return a;
}
function parseMul(s: Stream): Expr {
  let a = parseUnary(s);
  while (s.isOp('*') || s.isOp('/')) {
    const op = (s.cur as Tok).v;
    s.i++;
    a = { k: 'bin', op, a, b: parseUnary(s) };
  }
  return a;
}
function parseUnary(s: Stream): Expr {
  if (s.isOp('-')) {
    s.i++;
    return { k: 'un', op: '-', a: parseUnary(s) };
  }
  if (s.isOp('+')) {
    s.i++;
    return parseUnary(s);
  }
  return parsePow(s);
}
function parsePow(s: Stream): Expr {
  let a = parsePostfix(s);
  while (s.isOp('^')) {
    s.i++;
    a = { k: 'bin', op: '^', a, b: parseUnary(s) };
  }
  return a;
}
function parseArgs(s: Stream): Arg[] {
  const args: Arg[] = [];
  if (s.eatOp(')')) return args;
  for (;;) {
    if (s.isOp(',')) {
      args.push({ e: null });
      s.i++;
      continue;
    }
    let name: string | undefined;
    if (s.cur?.t === 'id' && s.peek(1)?.t === 'op' && s.peek(1)?.v === ':=') {
      name = (s.cur as Tok).l;
      s.i += 2;
    }
    args.push({ name, e: parseExpr(s) });
    if (s.eatOp(',')) {
      if (s.isOp(')')) {
        args.push({ e: null });
        s.i++;
        return args;
      }
      continue;
    }
    s.expectOp(')');
    return args;
  }
}
function parsePostfix(s: Stream): Expr {
  let e = parsePrimary(s);
  for (;;) {
    if (s.isOp('.') && s.peek(1)?.t === 'id') {
      s.i++;
      const name = (s.cur as Tok).v;
      s.i++;
      e = { k: 'member', obj: e, name };
    } else if (s.isOp('(')) {
      s.i++;
      e = { k: 'call', fn: e, args: parseArgs(s) };
    } else return e;
  }
}
function parsePrimary(s: Stream): Expr {
  const t = s.cur;
  if (!t) s.fail('Expected: expression');
  if (t.t === 'num') {
    s.i++;
    return { k: 'num', v: t.n as number };
  }
  if (t.t === 'str') {
    s.i++;
    return { k: 'str', v: t.v };
  }
  if (t.t === 'op' && t.v === '(') {
    s.i++;
    const e = parseExpr(s);
    s.expectOp(')');
    return e;
  }
  if (t.t === 'op' && t.v === '.') {
    // inside With: .Property
    s.i++;
    const n = s.cur;
    if (!n || n.t !== 'id') s.fail('Expected: identifier');
    s.i++;
    return { k: 'member', obj: null, name: n.v };
  }
  if (t.t === 'id') {
    s.i++;
    if (t.l === 'true') return { k: 'bool', v: true };
    if (t.l === 'false') return { k: 'bool', v: false };
    if (t.l === 'nothing' || t.l === 'empty' || t.l === 'null') return { k: 'empty' };
    return { k: 'id', name: t.v };
  }
  return s.fail(`Unexpected "${t.v}"`);
}

// --- statements -------------------------------------------------------------
function endsWith(line: Line, ...kws: string[]): boolean {
  const t = line.toks;
  return kws.some((kw) => {
    const parts = kw.split(' ');
    return parts.every((p, i) => t[i]?.t === 'id' && t[i].l === p);
  });
}

class Parser {
  i = 0;
  constructor(public lines: Line[]) {}

  parseProgram(): Program {
    const procs: Record<string, Proc> = {};
    const globals: Stmt[] = [];
    let explicit = false;
    while (this.i < this.lines.length) {
      const ln = this.lines[this.i];
      const s = new Stream(ln.toks, ln.line);
      let k = 0;
      while (s.cur && ['public', 'private', 'friend', 'static'].includes(s.cur.l) && s.peek(1)?.t === 'id') {
        s.i++;
        k++;
      }
      void k;
      if (s.isKw('option')) {
        if (s.peek(1)?.l === 'explicit') explicit = true;
        this.i++;
      } else if (s.isKw('sub') || s.isKw('function')) {
        const p = this.parseProc(s, ln);
        procs[p.name.toLowerCase()] = p;
      } else if (s.isKw('dim') || s.isKw('const')) {
        globals.push(this.parseStmtFromStream(s, ln.line));
        this.i++;
      } else if (s.isKw('end') && s.peek(1)?.t === 'id') {
        throw new VbaError(0, `Invalid outside procedure`, ln.line, true);
      } else throw new VbaError(0, 'Invalid outside procedure', ln.line, true);
    }
    return { procs, globals, explicit };
  }

  parseProc(s: Stream, ln: Line): Proc {
    const kind = (s.cur as Tok).l as 'sub' | 'function';
    s.i++;
    const nameTok = s.cur;
    if (!nameTok || nameTok.t !== 'id') s.fail('Expected: identifier');
    s.i++;
    const params: Proc['params'] = [];
    if (s.eatOp('(')) {
      while (!s.isOp(')')) {
        let optional = false;
        while (s.isKw('optional') || s.isKw('byval') || s.isKw('byref') || s.isKw('paramarray')) {
          if (s.isKw('optional')) optional = true;
          s.i++;
        }
        const pn = s.cur;
        if (!pn || pn.t !== 'id') s.fail('Expected: identifier');
        s.i++;
        if (s.eatOp('(')) s.expectOp(')');
        if (s.eatKw('as')) s.i++;
        let def: Expr | null = null;
        if (s.eatOp('=')) def = parseExpr(s);
        params.push({ name: pn.v, optional, def });
        if (!s.eatOp(',')) break;
      }
      s.expectOp(')');
    }
    this.i++;
    const body = this.parseBlock((l) => endsWith(l, `end ${kind}`));
    if (this.i >= this.lines.length) throw new VbaError(0, `Expected: End ${kind === 'sub' ? 'Sub' : 'Function'}`, ln.line, true);
    this.i++;
    return { name: nameTok.v, kind, params, body, line: ln.line };
  }

  /** Parses statements until `stop` matches a line (which is left for the caller to consume). */
  parseBlock(stop: (l: Line) => boolean): Stmt[] {
    const out: Stmt[] = [];
    while (this.i < this.lines.length) {
      const ln = this.lines[this.i];
      if (stop(ln)) return out;
      out.push(this.parseStatement());
    }
    return out;
  }

  parseStatement(): Stmt {
    const ln = this.lines[this.i];
    const s = new Stream(ln.toks, ln.line);
    const first = s.cur as Tok;
    const kw = first.t === 'id' ? first.l : '';
    if (kw === 'if' && this.isBlockIf(s)) return this.parseBlockIf(s, ln);
    if (kw === 'for') return this.parseFor(s, ln);
    if (kw === 'do') return this.parseDo(s, ln);
    if (kw === 'while') {
      s.i++;
      const cond = parseExpr(s);
      this.i++;
      const body = this.parseBlock((l) => endsWith(l, 'wend'));
      this.expectEnd('Wend');
      return { s: 'do', pre: { until: false, cond }, post: null, body, line: ln.line };
    }
    if (kw === 'select' && s.peek(1)?.l === 'case') return this.parseSelect(s, ln);
    if (kw === 'with') {
      s.i++;
      const obj = parseExpr(s);
      this.i++;
      const body = this.parseBlock((l) => endsWith(l, 'end with'));
      this.expectEnd('End With');
      return { s: 'with', obj, body, line: ln.line };
    }
    this.i++;
    return this.parseStmtFromStream(s, ln.line);
  }

  expectEnd(what: string) {
    if (this.i >= this.lines.length) throw new VbaError(0, `Expected: ${what}`, this.lines[this.lines.length - 1]?.line ?? 0, true);
    this.i++;
  }

  isBlockIf(s: Stream): boolean {
    // Block If: the line ends with Then.
    const last = s.toks[s.toks.length - 1];
    return last?.t === 'id' && last.l === 'then';
  }

  parseBlockIf(s: Stream, ln: Line): Stmt {
    s.i++;
    const cond = parseExpr(s);
    s.expectKw('then');
    this.i++;
    const branches: { cond: Expr | null; body: Stmt[] }[] = [];
    let body = this.parseBlock((l) => endsWith(l, 'elseif', 'else', 'end if'));
    branches.push({ cond, body });
    for (;;) {
      if (this.i >= this.lines.length) throw new VbaError(0, 'Expected: End If', ln.line, true);
      const l = this.lines[this.i];
      if (endsWith(l, 'end if')) {
        this.i++;
        break;
      }
      const st = new Stream(l.toks, l.line);
      if (st.isKw('elseif')) {
        st.i++;
        const c = parseExpr(st);
        st.expectKw('then');
        this.i++;
        body = this.parseBlock((x) => endsWith(x, 'elseif', 'else', 'end if'));
        branches.push({ cond: c, body });
      } else {
        this.i++;
        body = this.parseBlock((x) => endsWith(x, 'end if'));
        branches.push({ cond: null, body });
      }
    }
    return { s: 'if', branches, line: ln.line };
  }

  parseFor(s: Stream, ln: Line): Stmt {
    s.i++;
    if (s.eatKw('each')) {
      const v = parsePostfix(s);
      s.expectKw('in');
      const coll = parseExpr(s);
      this.i++;
      const body = this.parseBlock((l) => endsWith(l, 'next'));
      this.expectEnd('Next');
      return { s: 'foreach', v, coll, body, line: ln.line };
    }
    const v = parsePostfix(s);
    s.expectOp('=');
    const from = parseExpr(s);
    s.expectKw('to');
    const to = parseExpr(s);
    const step = s.eatKw('step') ? parseExpr(s) : null;
    this.i++;
    const body = this.parseBlock((l) => endsWith(l, 'next'));
    this.expectEnd('Next');
    return { s: 'for', v, from, to, step, body, line: ln.line };
  }

  parseDo(s: Stream, ln: Line): Stmt {
    s.i++;
    let pre: { until: boolean; cond: Expr } | null = null;
    if (s.isKw('while') || s.isKw('until')) {
      const until = (s.cur as Tok).l === 'until';
      s.i++;
      pre = { until, cond: parseExpr(s) };
    }
    this.i++;
    const body = this.parseBlock((l) => endsWith(l, 'loop'));
    if (this.i >= this.lines.length) throw new VbaError(0, 'Expected: Loop', ln.line, true);
    const end = this.lines[this.i];
    const es = new Stream(end.toks, end.line);
    es.i++;
    let post: { until: boolean; cond: Expr } | null = null;
    if (es.isKw('while') || es.isKw('until')) {
      const until = (es.cur as Tok).l === 'until';
      es.i++;
      post = { until, cond: parseExpr(es) };
    }
    this.i++;
    return { s: 'do', pre, post, body, line: ln.line };
  }

  parseSelect(s: Stream, ln: Line): Stmt {
    s.i += 2;
    const e = parseExpr(s);
    this.i++;
    const cases: { tests: CaseTest[] | null; body: Stmt[] }[] = [];
    // skip to first Case
    while (this.i < this.lines.length && !endsWith(this.lines[this.i], 'case') && !endsWith(this.lines[this.i], 'end select')) this.i++;
    for (;;) {
      if (this.i >= this.lines.length) throw new VbaError(0, 'Expected: End Select', ln.line, true);
      const l = this.lines[this.i];
      if (endsWith(l, 'end select')) {
        this.i++;
        break;
      }
      const cs = new Stream(l.toks, l.line);
      cs.i++;
      let tests: CaseTest[] | null = null;
      if (cs.isKw('else')) cs.i++;
      else {
        tests = [];
        for (;;) {
          if (cs.eatKw('is')) {
            const op = (cs.cur as Tok).v;
            cs.i++;
            tests.push({ op, a: parseExpr(cs) });
          } else {
            const a = parseExpr(cs);
            if (cs.eatKw('to')) tests.push({ a, b: parseExpr(cs) });
            else tests.push({ op: '=', a });
          }
          if (!cs.eatOp(',')) break;
        }
      }
      this.i++;
      const body = this.parseBlock((x) => endsWith(x, 'case', 'end select'));
      cases.push({ tests, body });
    }
    return { s: 'select', e, cases, line: ln.line };
  }

  /** A statement that fits on the rest of one line. */
  parseStmtFromStream(s: Stream, line: number): Stmt {
    const first = s.cur as Tok;
    const kw = first.t === 'id' ? first.l : '';
    if (kw === 'dim' || kw === 'static' || kw === 'private' || kw === 'public') {
      s.i++;
      const names: { name: string; type: string }[] = [];
      for (;;) {
        const n = s.cur;
        if (!n || n.t !== 'id') s.fail('Expected: identifier');
        s.i++;
        if (s.eatOp('(')) {
          while (!s.isOp(')') && !s.done()) s.i++;
          s.expectOp(')');
        }
        let type = 'variant';
        if (s.eatKw('as')) {
          if (s.eatKw('new')) void 0;
          type = ((s.cur as Tok)?.l ?? 'variant').toLowerCase();
          s.i++;
          while (s.isOp('.') ) s.i += 2;
        }
        names.push({ name: n.v, type });
        if (!s.eatOp(',')) break;
      }
      return { s: 'dim', names, line };
    }
    if (kw === 'const') {
      s.i++;
      const n = s.cur as Tok;
      s.i++;
      if (s.eatKw('as')) s.i++;
      s.expectOp('=');
      return { s: 'const', name: n.v, e: parseExpr(s), line };
    }
    if (kw === 'exit') {
      s.i++;
      const w = (s.cur?.l ?? '') as 'for' | 'do' | 'sub' | 'function';
      if (!['for', 'do', 'sub', 'function'].includes(w)) s.fail('Expected: Sub, Function, For or Do');
      return { s: 'exit', what: w, line };
    }
    if (kw === 'on' && s.peek(1)?.l === 'error') {
      s.i += 2;
      if (s.eatKw('resume')) return { s: 'onerror', mode: 'next', line };
      s.expectKw('goto');
      const t = s.cur as Tok;
      if (t.t === 'num' && t.n === 0) return { s: 'onerror', mode: 'goto0', line };
      return { s: 'onerror', mode: 'label', label: t.l, line };
    }
    if (kw === 'if') {
      // single-line If
      s.i++;
      const cond = parseExpr(s);
      s.expectKw('then');
      const rest = s.toks.slice(s.i);
      let depth = 0;
      let elseAt = -1;
      rest.forEach((t, idx) => {
        if (t.t === 'op' && t.v === '(') depth++;
        else if (t.t === 'op' && t.v === ')') depth--;
        else if (depth === 0 && t.t === 'id' && t.l === 'else' && elseAt < 0) elseAt = idx;
      });
      const thenToks = elseAt >= 0 ? rest.slice(0, elseAt) : rest;
      const elseToks = elseAt >= 0 ? rest.slice(elseAt + 1) : null;
      const branches: { cond: Expr | null; body: Stmt[] }[] = [{ cond, body: [this.parseStmtFromStream(new Stream(thenToks, line), line)] }];
      if (elseToks?.length) branches.push({ cond: null, body: [this.parseStmtFromStream(new Stream(elseToks, line), line)] });
      return { s: 'if', branches, line };
    }
    if (kw === 'call') {
      s.i++;
      return { s: 'call', e: parsePostfix(s), line };
    }
    if (kw === 'set') s.i++;
    // label?
    if (first.t === 'id' && s.toks.length === 2 && s.peek(1)?.v === ':') return { s: 'label', name: first.l, line };
    // assignment or call statement
    const start = s.i;
    const target = parsePostfix(s);
    if (s.isOp('=')) {
      s.i++;
      return { s: 'assign', target, e: parseExpr(s), line };
    }
    if (s.done()) return { s: 'call', e: target, line };
    // Call with arguments and no parentheses: Foo a, b  or  Range("A1").Copy Destination:=Range("B1")
    void start;
    const callee = target;
    const args: Arg[] = [];
    while (!s.done()) {
      let name: string | undefined;
      if (s.cur?.t === 'id' && s.peek(1)?.t === 'op' && s.peek(1)?.v === ':=') {
        name = (s.cur as Tok).l;
        s.i += 2;
      }
      args.push({ name, e: parseExpr(s) });
      if (!s.eatOp(',')) break;
    }
    if (!s.done()) s.fail(`Unexpected "${s.cur?.v}"`);
    return { s: 'call', e: { k: 'call', fn: callee, args }, line };
  }
}
function parsePostfixNoCall(s: Stream): Expr {
  let e = parsePrimary(s);
  while (s.isOp('.') && s.peek(1)?.t === 'id') {
    s.i++;
    const name = (s.cur as Tok).v;
    s.i++;
    e = { k: 'member', obj: e, name };
  }
  return e;
}

export function parseVba(src: string): { ok: true; program: Program } | { ok: false; error: VbaError } {
  try {
    const lines = tokenise(src);
    return { ok: true, program: new Parser(lines).parseProgram() };
  } catch (e) {
    if (e instanceof VbaError) return { ok: false, error: e };
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Interpreter
// ---------------------------------------------------------------------------
const ROWS_MAX = 1048576;
const COLS_MAX = 16384;
const CONSTS: Record<string, V> = {
  vbcrlf: '\r\n', vbcr: '\r', vblf: '\n', vbnewline: '\n', vbtab: '\t', vbnullstring: '',
  vbblack: 0, vbred: 255, vbgreen: 65280, vbblue: 16711680, vbyellow: 65535, vbwhite: 16777215, vbmagenta: 16711935, vbcyan: 16776960,
  xlup: -4162, xldown: -4121, xltoleft: -4159, xltoright: -4161,
  xlcenter: -4108, xlleft: -4131, xlright: -4152, xlnone: -4142,
  vbokonly: 0, vbinformation: 64, vbexclamation: 48, vbcritical: 16, vbyesno: 4, vbyes: 6, vbno: 7, vbok: 1,
  xlcalculationautomatic: -4105, xlcalculationmanual: -4135,
};

const hex = (n: number) => `#${[n & 255, (n >> 8) & 255, (n >> 16) & 255].map((x) => x.toString(16).padStart(2, '0')).join('')}`;

type Ctx = {
  model: SheetModel;
  program: Program;
  globals: Map<string, V>;
  output: string[];
  steps: number;
  withs: Obj[];
  errNum: number;
  errDesc: string;
};
type Frame = { vars: Map<string, V>; proc: Proc | null; resumeNext: boolean; handler: string | null };

const MAX_STEPS = 300000;

function toNum(v: V, line: number): number {
  if (typeof v === 'number') return v;
  if (v === null) return 0;
  if (typeof v === 'boolean') return v ? -1 : 0;
  if (typeof v === 'string') {
    const t = v.trim();
    if (t !== '' && Number.isFinite(Number(t))) return Number(t);
    throw new VbaError(13, 'Type mismatch', line);
  }
  throw new VbaError(13, 'Type mismatch', line);
}
function toStr(v: V): string {
  if (v === null) return '';
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  if (typeof v === 'number') return String(Number.parseFloat(v.toPrecision(15)));
  if (typeof v === 'string') return v;
  if (v instanceof E.XlError) return v.code;
  return '';
}
function truthy(v: V, line: number): boolean {
  if (typeof v === 'boolean') return v;
  return toNum(v, line) !== 0;
}

class Interp {
  frames: Frame[] = [];
  constructor(public ctx: Ctx) {}

  get frame() {
    return this.frames[this.frames.length - 1];
  }
  tick(line: number) {
    if (++this.ctx.steps > MAX_STEPS) throw new VbaError(0, 'Execution timed out: the code may contain an infinite loop', line);
  }

  // --- variables --------------------------------------------------------------
  lookup(name: string): { found: boolean; v: V } {
    const l = name.toLowerCase();
    if (this.frame.vars.has(l)) return { found: true, v: this.frame.vars.get(l) as V };
    if (this.ctx.globals.has(l)) return { found: true, v: this.ctx.globals.get(l) as V };
    return { found: false, v: null };
  }
  assignVar(name: string, v: V) {
    const l = name.toLowerCase();
    if (this.frame.vars.has(l)) this.frame.vars.set(l, v);
    else if (this.ctx.globals.has(l)) this.ctx.globals.set(l, v);
    else if (this.ctx.program.explicit) throw new VbaError(0, `Variable not defined: ${name}`, 0, true);
    else this.frame.vars.set(l, v);
  }

  // --- ranges -----------------------------------------------------------------
  rangeFromAddress(addr: string, line: number): E.Rect {
    const clean = addr.replace(/\$/g, '').trim();
    const named = this.ctx.model.names[clean.toUpperCase()] ?? this.ctx.model.names[clean];
    const rc = E.parseRectLabel(named ?? clean);
    if (!rc) throw new VbaError(1004, 'Method \'Range\' of object \'_Global\' failed', line);
    return rc;
  }
  cellRect(c: number, r: number): E.Rect {
    return { c1: c, r1: r, c2: c, r2: r };
  }
  checkWrite(rc: E.Rect, line: number) {
    if (!E.inBounds(rc.c2, rc.r2) || !E.inBounds(rc.c1, rc.r1)) throw new VbaError(1004, 'Application-defined or object-defined error: that cell is outside this practice sheet', line);
  }
  cellsOf(rc: E.Rect): string[] {
    const out: string[] = [];
    for (let r = rc.r1; r <= rc.r2; r++) for (let c = rc.c1; c <= rc.c2; c++) out.push(E.keyOf(c, r));
    return out;
  }
  readCell(rc: E.Rect, line: number): V {
    if (rc.c1 !== rc.c2 || rc.r1 !== rc.r2) throw new VbaError(13, 'Type mismatch: a multi-cell range cannot be read as one value. Loop over the cells instead', line);
    if (!E.inBounds(rc.c1, rc.r1)) return null;
    const v = this.ctx.model.value(E.keyOf(rc.c1, rc.r1));
    return v as V;
  }
  writeValue(rc: E.Rect, v: V, line: number, formula = false) {
    this.checkWrite(rc, line);
    if (isObj(v)) throw new VbaError(13, 'Type mismatch', line);
    const text = v === null ? '' : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : v instanceof E.XlError ? v.code : typeof v === 'number' ? String(v) : v;
    void formula;
    for (const k of this.cellsOf(rc)) this.ctx.model.setRaw(k, text);
  }
  styleAll(rc: E.Rect, patch: Partial<E.Style>, line: number) {
    this.checkWrite(rc, line);
    for (const k of this.cellsOf(rc)) this.ctx.model.setStyle(k, patch);
  }
  endOf(rc: E.Rect, dir: number): E.Rect {
    const used = this.ctx.model.used();
    const filled = (c: number, r: number) => E.inBounds(c, r) && this.ctx.model.raw(E.keyOf(c, r)).trim() !== '';
    let c = rc.c1;
    let r = rc.r1;
    const dc = dir === -4161 ? 1 : dir === -4159 ? -1 : 0;
    const dr = dir === -4121 ? 1 : dir === -4162 ? -1 : 0;
    const maxR = used ? used.r2 : 0;
    const maxC = used ? used.c2 : 0;
    // Start beyond the used area: jump back to it, as Excel does when the cell is empty.
    if (r > maxR && dr < 0) r = maxR + 1;
    if (c > maxC && dc < 0) c = maxC + 1;
    const inRange = (cc: number, rr: number) => cc >= 0 && rr >= 0 && cc <= Math.max(maxC, c) && rr <= Math.max(maxR, r);
    if (filled(c, r) && filled(c + dc, r + dr)) {
      while (filled(c + dc, r + dr)) {
        c += dc;
        r += dr;
      }
    } else {
      c += dc;
      r += dr;
      while (inRange(c, r) && !filled(c, r)) {
        c += dc;
        r += dr;
      }
      if (!inRange(c, r) || c < 0 || r < 0) {
        c = Math.max(0, Math.min(c, dc > 0 ? COLS_MAX - 1 : 0));
        r = Math.max(0, Math.min(r, dr > 0 ? ROWS_MAX - 1 : 0));
        if (dc < 0) c = 0;
        if (dr < 0) r = 0;
      }
    }
    return this.cellRect(c, r);
  }

  // --- member access ----------------------------------------------------------
  getMember(obj: V, name: string, args: V[] | null, line: number): V {
    const n = name.toLowerCase();
    if (!isObj(obj)) throw new VbaError(424, 'Object required', line);
    const a = args ?? [];
    switch (obj.kind) {
      case 'app':
        if (n === 'activecell') return { kind: 'range', rc: this.cellRect(this.ctx.model.active.c, this.ctx.model.active.r) };
        if (n === 'selection') return { kind: 'range', rc: this.ctx.model.sel };
        if (n === 'worksheetfunction') return { kind: 'wf' };
        if (n === 'activesheet') return { kind: 'sheet' };
        if (n === 'range' || n === 'cells') return this.sheetMember(n, a, line);
        if (['screenupdating', 'displayalerts', 'calculation', 'enableevents', 'statusbar'].includes(n)) return null;
        if (n === 'evaluate') return this.ctx.model.evalFormula(toStr(a[0] ?? '')) as V;
        break;
      case 'wf':
        return this.worksheetFunction(name, a, line);
      case 'sheet':
        return this.sheetMember(n, a, line);
      case 'err':
        if (n === 'number') return this.ctx.errNum;
        if (n === 'description') return this.ctx.errDesc;
        if (n === 'clear') {
          this.ctx.errNum = 0;
          this.ctx.errDesc = '';
          return null;
        }
        break;
      case 'debug':
        if (n === 'print') {
          this.ctx.output.push(a.map(toStr).join(' '));
          return null;
        }
        break;
      case 'dim':
        if (n === 'count') {
          if (!obj.rc) return obj.axis === 'rows' ? ROWS_MAX : COLS_MAX;
          return obj.axis === 'rows' ? obj.rc.r2 - obj.rc.r1 + 1 : obj.rc.c2 - obj.rc.c1 + 1;
        }
        break;
      case 'font':
        if (n === 'bold') return !!this.ctx.model.style(E.keyOf(obj.rc.c1, obj.rc.r1)).b;
        if (n === 'italic') return !!this.ctx.model.style(E.keyOf(obj.rc.c1, obj.rc.r1)).i;
        break;
      case 'range':
        return this.rangeMember(obj, n, name, a, args !== null, line);
    }
    throw new VbaError(438, `Object doesn't support this property or method: ${name}`, line);
  }

  sheetMember(n: string, a: V[], line: number): V {
    if (n === 'range') {
      if (isObj(a[0] ?? null) && (a[0] as Obj).kind === 'range') {
        const x = (a[0] as { rc: E.Rect }).rc;
        const y = isObj(a[1] ?? null) ? (a[1] as { rc: E.Rect }).rc : x;
        return { kind: 'range', rc: { c1: Math.min(x.c1, y.c1), r1: Math.min(x.r1, y.r1), c2: Math.max(x.c2, y.c2), r2: Math.max(x.r2, y.r2) } };
      }
      return { kind: 'range', rc: this.rangeFromAddress(toStr(a[0] ?? ''), line) };
    }
    if (n === 'cells') {
      if (a.length === 0) return { kind: 'range', rc: { c1: 0, r1: 0, c2: COLS_MAX - 1, r2: ROWS_MAX - 1 } };
      const r = toNum(a[0] ?? 1, line);
      const c = toNum(a[1] ?? 1, line);
      return { kind: 'range', rc: this.cellRect(c - 1, r - 1) };
    }
    if (n === 'rows') return { kind: 'dim', rc: null, axis: 'rows' };
    if (n === 'columns') return { kind: 'dim', rc: null, axis: 'cols' };
    if (n === 'name') return 'Sheet1';
    if (n === 'usedrange') {
      const u = this.ctx.model.used();
      return { kind: 'range', rc: u ? { c1: 0, r1: 0, c2: u.c2, r2: u.r2 } : this.cellRect(0, 0) };
    }
    if (n === 'activate' || n === 'select') return null;
    throw new VbaError(438, `Object doesn't support this property or method: ${n}`, line);
  }

  rangeMember(o: { rc: E.Rect }, n: string, name: string, a: V[], hasArgs: boolean, line: number): V {
    const rc = o.rc;
    const single = rc.c1 === rc.c2 && rc.r1 === rc.r2;
    switch (n) {
      case 'value':
      case 'value2':
        return this.readCell(rc, line);
      case 'formula':
        return E.inBounds(rc.c1, rc.r1) ? this.ctx.model.raw(E.keyOf(rc.c1, rc.r1)) : '';
      case 'text':
        return E.inBounds(rc.c1, rc.r1) ? this.ctx.model.display(E.keyOf(rc.c1, rc.r1)) : '';
      case 'address': return E.rectLabel(rc);
      case 'row': return rc.r1 + 1;
      case 'column': return rc.c1 + 1;
      case 'count': return (rc.r2 - rc.r1 + 1) * (rc.c2 - rc.c1 + 1);
      case 'rows':
        if (hasArgs && a.length) return { kind: 'range', rc: { c1: rc.c1, c2: rc.c2, r1: rc.r1 + toNum(a[0], line) - 1, r2: rc.r1 + toNum(a[0], line) - 1 } };
        return { kind: 'dim', rc, axis: 'rows' };
      case 'columns':
        if (hasArgs && a.length) return { kind: 'range', rc: { r1: rc.r1, r2: rc.r2, c1: rc.c1 + toNum(a[0], line) - 1, c2: rc.c1 + toNum(a[0], line) - 1 } };
        return { kind: 'dim', rc, axis: 'cols' };
      case 'cells':
        if (!hasArgs || a.length === 0) return { kind: 'range', rc };
        return { kind: 'range', rc: this.cellRect(rc.c1 + toNum(a[1] ?? 1, line) - 1, rc.r1 + toNum(a[0], line) - 1) };
      case 'range': {
        if (!hasArgs) return { kind: 'range', rc };
        const sub = this.rangeFromAddress(toStr(a[0]), line);
        return { kind: 'range', rc: { c1: rc.c1 + sub.c1, r1: rc.r1 + sub.r1, c2: rc.c1 + sub.c2, r2: rc.r1 + sub.r2 } };
      }
      case 'offset': {
        const dr = toNum(a[0] ?? 0, line);
        const dc = toNum(a[1] ?? 0, line);
        const out = { c1: rc.c1 + dc, r1: rc.r1 + dr, c2: rc.c2 + dc, r2: rc.r2 + dr };
        if (out.c1 < 0 || out.r1 < 0) throw new VbaError(1004, 'Application-defined or object-defined error', line);
        return { kind: 'range', rc: out };
      }
      case 'resize': {
        const rr = a[0] === undefined || a[0] === null ? rc.r2 - rc.r1 + 1 : toNum(a[0], line);
        const cc = a[1] === undefined || a[1] === null ? rc.c2 - rc.c1 + 1 : toNum(a[1], line);
        return { kind: 'range', rc: { c1: rc.c1, r1: rc.r1, c2: rc.c1 + cc - 1, r2: rc.r1 + rr - 1 } };
      }
      case 'end': return { kind: 'range', rc: this.endOf(rc, toNum(a[0], line)) };
      case 'font': return { kind: 'font', rc };
      case 'interior': return { kind: 'interior', rc };
      case 'numberformat': return this.ctx.model.style(E.keyOf(rc.c1, rc.r1)).nf ?? 'General';
      case 'select':
      case 'activate':
        this.ctx.model.active = { c: rc.c1, r: rc.r1 };
        this.ctx.model.sel = rc;
        return null;
      case 'clearcontents':
        this.checkWrite(rc, line);
        for (const k of this.cellsOf(rc)) this.ctx.model.setRaw(k, '');
        return null;
      case 'clearformats':
        for (const k of this.cellsOf(rc)) if (E.inBounds(rc.c1, rc.r1)) this.ctx.model.clearStyle(k);
        return null;
      case 'clear':
        this.checkWrite(rc, line);
        for (const k of this.cellsOf(rc)) {
          this.ctx.model.setRaw(k, '');
          this.ctx.model.clearStyle(k);
        }
        return null;
      case 'copy': {
        const dest = a[0];
        if (!dest || !isObj(dest) || dest.kind !== 'range') return null; // copy to the clipboard only
        this.copyTo(rc, dest.rc, line);
        return null;
      }
      case 'autofit':
      case 'entirerow':
      case 'entirecolumn':
        return { kind: 'range', rc };
      default:
        void single;
        if (['columnwidth', 'rowheight', 'wraptext', 'horizontalalignment', 'verticalalignment'].includes(n)) return null;
    }
    throw new VbaError(438, `Object doesn't support this property or method: ${name}`, line);
  }

  copyTo(src: E.Rect, dest: E.Rect, line: number) {
    const w = src.c2 - src.c1 + 1;
    const h = src.r2 - src.r1 + 1;
    this.checkWrite({ c1: dest.c1, r1: dest.r1, c2: dest.c1 + w - 1, r2: dest.r1 + h - 1 }, line);
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const sk = E.keyOf(src.c1 + c, src.r1 + r);
        const tk = E.keyOf(dest.c1 + c, dest.r1 + r);
        const raw = this.ctx.model.raw(sk);
        this.ctx.model.setRaw(tk, raw.startsWith('=') ? E.adjustFormula(raw, dest.c1 - src.c1, dest.r1 - src.r1) : raw);
        const st = this.ctx.model.styles[sk];
        if (st) this.ctx.model.setStyle(tk, st);
        else this.ctx.model.clearStyle(tk);
      }
    }
  }

  setMember(obj: V, name: string, v: V, args: V[] | null, line: number) {
    const n = name.toLowerCase();
    if (!isObj(obj)) throw new VbaError(424, 'Object required', line);
    if (obj.kind === 'range') {
      const rc = obj.rc;
      switch (n) {
        case 'value':
        case 'value2':
        case 'formula':
          return this.writeValue(rc, v, line, n === 'formula');
        case 'numberformat':
          return this.styleAll(rc, { nf: toStr(v).toLowerCase() === 'general' ? undefined : toStr(v) }, line);
        case 'horizontalalignment': {
          const code = toNum(v, line);
          return this.styleAll(rc, { align: code === -4108 ? 'center' : code === -4152 ? 'right' : 'left' }, line);
        }
        case 'columnwidth':
        case 'rowheight':
        case 'wraptext':
        case 'verticalalignment':
          return;
      }
    }
    if (obj.kind === 'font') {
      if (n === 'bold') return this.styleAll(obj.rc, { b: truthy(v, line) }, line);
      if (n === 'italic') return this.styleAll(obj.rc, { i: truthy(v, line) }, line);
      if (n === 'underline') return this.styleAll(obj.rc, { u: true }, line);
      if (n === 'color') return this.styleAll(obj.rc, { color: hex(toNum(v, line)) }, line);
      if (['size', 'name', 'fontstyle'].includes(n)) return;
    }
    if (obj.kind === 'interior') {
      if (n === 'color') {
        const num = toNum(v, line);
        return this.styleAll(obj.rc, { bg: num === -4142 ? undefined : hex(num) }, line);
      }
      if (['colorindex', 'pattern', 'patterncolor', 'tintandshade'].includes(n)) return;
    }
    if (obj.kind === 'app') return;
    if (obj.kind === 'sheet' && n === 'name') return;
    void args;
    throw new VbaError(438, `Object doesn't support this property or method: ${name}`, line);
  }

  worksheetFunction(name: string, a: V[], line: number): V {
    const lit = (v: V): string => {
      if (isObj(v) && v.kind === 'range') return E.rectLabel(v.rc);
      if (typeof v === 'string') return `"${v.replace(/"/g, '""')}"`;
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      if (v === null) return '""';
      return toStr(v);
    };
    const r = this.ctx.model.evalFormula(`=${name.toUpperCase()}(${a.map(lit).join(',')})`);
    if (r instanceof E.XlError) throw new VbaError(1004, `Unable to get the ${name} property of the WorksheetFunction class`, line);
    return r as V;
  }

  // --- procedures -----------------------------------------------------------------
  callProc(p: Proc, args: V[], line: number): V {
    if (this.frames.length > 80) throw new VbaError(28, 'Out of stack space', line);
    const vars = new Map<string, V>();
    p.params.forEach((pm, i) => {
      if (i < args.length && args[i] !== undefined) vars.set(pm.name.toLowerCase(), args[i]);
      else if (pm.def) vars.set(pm.name.toLowerCase(), this.evalWith(pm.def, new Map()));
      else if (pm.optional) vars.set(pm.name.toLowerCase(), null);
      else throw new VbaError(449, 'Argument not optional', line);
    });
    if (p.kind === 'function') vars.set(p.name.toLowerCase(), null);
    this.frames.push({ vars, proc: p, resumeNext: false, handler: null });
    try {
      this.runBody(p.body);
    } catch (e) {
      if (!(e instanceof Signal)) throw e;
    } finally {
      const f = this.frames.pop() as Frame;
      if (p.kind === 'function') return (f.vars.get(p.name.toLowerCase()) ?? null) as V;
    }
    return null;
  }
  evalWith(e: Expr, vars: Map<string, V>): V {
    this.frames.push({ vars, proc: null, resumeNext: false, handler: null });
    try {
      return this.eval(e);
    } finally {
      this.frames.pop();
    }
  }

  runBody(body: Stmt[]) {
    let pc = 0;
    while (pc < body.length) {
      try {
        this.exec(body[pc]);
        pc++;
      } catch (e) {
        if (e instanceof VbaError && !e.compile && e.num !== 0) {
          this.ctx.errNum = e.num;
          this.ctx.errDesc = e.desc;
          const f = this.frame;
          if (f.resumeNext) {
            pc++;
            continue;
          }
          if (f.handler) {
            const idx = body.findIndex((s) => s.s === 'label' && s.name === f.handler);
            if (idx >= 0) {
              f.handler = null;
              pc = idx + 1;
              continue;
            }
          }
        }
        throw e;
      }
    }
  }
  execBlock(body: Stmt[]) {
    for (const s of body) {
      try {
        this.exec(s);
      } catch (e) {
        // On Error Resume Next carries on with the next statement, even inside a loop.
        if (e instanceof VbaError && !e.compile && e.num !== 0 && this.frame.resumeNext) {
          this.ctx.errNum = e.num;
          this.ctx.errDesc = e.desc;
          continue;
        }
        throw e;
      }
    }
  }

  exec(s: Stmt) {
    this.tick(s.line);
    switch (s.s) {
      case 'dim':
        for (const d of s.names) {
          const t = d.type;
          const init: V = ['integer', 'long', 'double', 'single', 'currency', 'byte', 'longlong'].includes(t) ? 0 : t === 'string' ? '' : t === 'boolean' ? false : null;
          this.frame.vars.set(d.name.toLowerCase(), init);
        }
        return;
      case 'const':
        this.frame.vars.set(s.name.toLowerCase(), this.eval(s.e));
        return;
      case 'assign': {
        const v = this.eval(s.e);
        this.assign(s.target, v, s.line);
        return;
      }
      case 'call':
        this.eval(s.e, true);
        return;
      case 'if':
        for (const b of s.branches) {
          if (b.cond === null || truthy(this.eval(b.cond), s.line)) {
            this.execBlock(b.body);
            return;
          }
        }
        return;
      case 'for': {
        const from = toNum(this.eval(s.from), s.line);
        const to = toNum(this.eval(s.to), s.line);
        const step = s.step ? toNum(this.eval(s.step), s.line) : 1;
        if (step === 0) throw new VbaError(0, 'For loop step cannot be zero', s.line);
        for (let i = from; step > 0 ? i <= to : i >= to; i += step) {
          this.assign(s.v, i, s.line);
          try {
            this.execBlock(s.body);
          } catch (e) {
            if (e instanceof Signal && e.kind === 'for') break;
            throw e;
          }
          this.tick(s.line);
        }
        return;
      }
      case 'foreach': {
        const coll = this.eval(s.coll);
        if (!isObj(coll) || coll.kind !== 'range') throw new VbaError(13, 'Type mismatch', s.line);
        for (const k of this.cellsOf(coll.rc)) {
          const p = E.parseKey(k) as E.Pos;
          this.assign(s.v, { kind: 'range', rc: this.cellRect(p.c, p.r) }, s.line);
          try {
            this.execBlock(s.body);
          } catch (e) {
            if (e instanceof Signal && e.kind === 'for') break;
            throw e;
          }
        }
        return;
      }
      case 'do': {
        for (;;) {
          this.tick(s.line);
          if (s.pre) {
            const c = truthy(this.eval(s.pre.cond), s.line);
            if (s.pre.until ? c : !c) break;
          }
          try {
            this.execBlock(s.body);
          } catch (e) {
            if (e instanceof Signal && e.kind === 'do') break;
            throw e;
          }
          if (s.post) {
            const c = truthy(this.eval(s.post.cond), s.line);
            if (s.post.until ? c : !c) break;
          }
        }
        return;
      }
      case 'select': {
        const v = this.eval(s.e);
        for (const c of s.cases) {
          if (c.tests === null || c.tests.some((t) => this.caseMatch(v, t, s.line))) {
            this.execBlock(c.body);
            return;
          }
        }
        return;
      }
      case 'with': {
        const o = this.eval(s.obj);
        if (!isObj(o)) throw new VbaError(424, 'Object required', s.line);
        this.ctx.withs.push(o);
        try {
          this.execBlock(s.body);
        } finally {
          this.ctx.withs.pop();
        }
        return;
      }
      case 'exit':
        throw new Signal(s.what);
      case 'onerror':
        this.frame.resumeNext = s.mode === 'next';
        this.frame.handler = s.mode === 'label' ? (s.label ?? null) : null;
        return;
      case 'label':
        return;
    }
  }

  caseMatch(v: V, t: CaseTest, line: number): boolean {
    const a = this.eval(t.a);
    if (t.b) {
      const b = this.eval(t.b);
      return toNum(v, line) >= toNum(a, line) && toNum(v, line) <= toNum(b, line);
    }
    return this.compare(t.op ?? '=', v, a, line);
  }

  assign(target: Expr, v: V, line: number) {
    if (target.k === 'id') {
      this.assignVar(target.name, v);
      return;
    }
    if (target.k === 'member') {
      const obj = target.obj ? this.eval(target.obj) : this.withTop(line);
      this.setMember(obj, target.name, v, null, line);
      return;
    }
    if (target.k === 'call') {
      // Cells(1, 2) = 5  or  Range("A1") = 5: the default property is Value
      const callee = this.evalCallee(target.fn, line);
      if (callee.kind === 'member') {
        const argv = this.evalArgs(target.args);
        const obj = this.getMember(callee.obj, callee.name, argv, line);
        this.setMember(obj, 'value', v, null, line);
        return;
      }
      const base = this.eval(target, false);
      if (isObj(base) && base.kind === 'range') return this.setMember(base, 'value', v, null, line);
    }
    throw new VbaError(0, 'Invalid assignment', line, true);
  }
  withTop(line: number): Obj {
    const o = this.ctx.withs[this.ctx.withs.length - 1];
    if (!o) throw new VbaError(0, 'Invalid use of "."', line, true);
    return o;
  }
  evalCallee(fn: Expr, line: number): { kind: 'member'; obj: V; name: string } | { kind: 'other' } {
    if (fn.k === 'member') return { kind: 'member', obj: fn.obj ? this.eval(fn.obj) : this.withTop(line), name: fn.name };
    return { kind: 'other' };
  }
  evalArgs(args: Arg[]): V[] {
    return args.map((a) => (a.e ? this.eval(a.e) : (undefined as unknown as V)));
  }

  compare(op: string, a: V, b: V, line: number): boolean {
    if (isObj(a) && a.kind === 'range') a = this.readCell(a.rc, line);
    if (isObj(b) && b.kind === 'range') b = this.readCell(b.rc, line);
    let x: number | string | boolean;
    let y: number | string | boolean;
    const A = a === null ? (typeof b === 'string' ? '' : 0) : a;
    const B = b === null ? (typeof a === 'string' ? '' : 0) : b;
    if (typeof A === 'string' && typeof B === 'string') {
      x = A;
      y = B;
    } else if (typeof A === 'string' || typeof B === 'string') {
      // number vs string: numbers sort before text; a numeric string compares as a number
      if (typeof A === 'string' && Number.isFinite(Number(A)) && A.trim() !== '') {
        x = Number(A);
        y = toNum(B as V, line);
      } else if (typeof B === 'string' && Number.isFinite(Number(B)) && B.trim() !== '') {
        x = toNum(A as V, line);
        y = Number(B);
      } else {
        x = typeof A === 'string' ? 1 : 0;
        y = typeof B === 'string' ? 1 : 0;
      }
    } else {
      x = toNum(A as V, line);
      y = toNum(B as V, line);
    }
    switch (op) {
      case '=': return x === y;
      case '<>': return x !== y;
      case '<': return x < y;
      case '>': return x > y;
      case '<=': return x <= y;
      default: return x >= y;
    }
  }

  // --- expressions -------------------------------------------------------------
  eval(e: Expr, asStatement = false): V {
    switch (e.k) {
      case 'num': return e.v;
      case 'str': return e.v;
      case 'bool': return e.v;
      case 'empty': return null;
      case 'id': return this.evalId(e.name, [], false, 0, asStatement);
      case 'member': {
        const obj = e.obj ? this.eval(e.obj) : this.withTop(0);
        const v = this.getMember(obj, e.name, null, 0);
        return v;
      }
      case 'call': return this.evalCall(e, asStatement);
      case 'un': {
        const a = this.eval(e.a);
        if (e.op === '-') return -toNum(this.deref(a), 0);
        const d = this.deref(a);
        return typeof d === 'boolean' ? !d : ~toNum(d, 0);
      }
      case 'bin': return this.evalBin(e);
    }
  }
  deref(v: V): V {
    if (isObj(v) && v.kind === 'range') return this.readCell(v.rc, 0);
    return v;
  }
  evalBin(e: { op: string; a: Expr; b: Expr }): V {
    const a = this.deref(this.eval(e.a));
    const b = this.deref(this.eval(e.b));
    const op = e.op;
    if (['=', '<>', '<', '>', '<=', '>='].includes(op)) return this.compare(op, a, b, 0);
    if (op === '&') return toStr(a) + toStr(b);
    if (op === 'and' || op === 'or' || op === 'xor') {
      if (typeof a === 'boolean' && typeof b === 'boolean') return op === 'and' ? a && b : op === 'or' ? a || b : a !== b;
      const x = toNum(a, 0);
      const y = toNum(b, 0);
      return op === 'and' ? x & y : op === 'or' ? x | y : x ^ y;
    }
    if (op === '+' && typeof a === 'string' && typeof b === 'string') return a + b;
    const x = toNum(a, 0);
    const y = toNum(b, 0);
    switch (op) {
      case '+': return x + y;
      case '-': return x - y;
      case '*': return x * y;
      case '/':
        if (y === 0) throw new VbaError(11, 'Division by zero', 0);
        return x / y;
      case '\\':
        if (Math.trunc(y) === 0) throw new VbaError(11, 'Division by zero', 0);
        return Math.trunc(Math.trunc(x) / Math.trunc(y));
      case 'mod':
        if (Math.trunc(y) === 0) throw new VbaError(11, 'Division by zero', 0);
        return Math.trunc(x) % Math.trunc(y);
      case '^': return x ** y;
    }
    throw new VbaError(0, 'Bad operator', 0, true);
  }

  evalCall(e: { fn: Expr; args: Arg[] }, asStatement: boolean): V {
    const argv = this.evalArgs(e.args);
    if (e.fn.k === 'id') return this.evalId(e.fn.name, argv, true, 0, asStatement, e.args);
    if (e.fn.k === 'member') {
      const obj = e.fn.obj ? this.eval(e.fn.obj) : this.withTop(0);
      // Named arguments (Destination:=...) are passed in order
      return this.getMember(obj, e.fn.name, argv, 0);
    }
    // a call on a call result, e.g. Range("A1")(2)
    const base = this.eval(e.fn);
    if (isObj(base) && base.kind === 'range') return this.rangeMember(base, 'cells', 'Cells', argv, true, 0);
    throw new VbaError(13, 'Type mismatch', 0);
  }

  evalId(name: string, args: V[], hasParens: boolean, line: number, asStatement: boolean, argNodes?: Arg[]): V {
    const l = name.toLowerCase();
    // 1. variables (no call syntax)
    if (!hasParens) {
      const v = this.lookup(name);
      if (v.found) return v.v;
    }
    // 2. procedures
    const p = this.ctx.program.procs[l];
    if (p) {
      // functions called with named arguments are not supported beyond order
      return this.callProc(p, args, line);
    }
    // 3. objects
    switch (l) {
      case 'range':
      case 'cells':
      case 'rows':
      case 'columns': {
        if ((l === 'rows' || l === 'columns') && !hasParens) return { kind: 'dim', rc: null, axis: l === 'rows' ? 'rows' : 'cols' };
        if (l === 'rows' || l === 'columns') {
          const n = toNum(args[0] ?? 1, line) - 1;
          return { kind: 'range', rc: l === 'rows' ? { c1: 0, c2: COLS_MAX - 1, r1: n, r2: n } : { c1: n, c2: n, r1: 0, r2: ROWS_MAX - 1 } };
        }
        return this.sheetMember(l, args, line);
      }
      case 'activecell': return { kind: 'range', rc: this.cellRect(this.ctx.model.active.c, this.ctx.model.active.r) };
      case 'selection': return { kind: 'range', rc: this.ctx.model.sel };
      case 'application': return { kind: 'app' };
      case 'activesheet':
      case 'thisworkbook':
      case 'activeworkbook': return { kind: 'sheet' };
      case 'worksheets':
      case 'sheets': return { kind: 'sheet' };
      case 'worksheetfunction': return { kind: 'wf' };
      case 'err': return { kind: 'err' };
      case 'debug': return { kind: 'debug' };
    }
    // 4. constants
    if (l in CONSTS) return CONSTS[l];
    // 5. built-in functions
    const f = this.builtin(l, args, line, asStatement, argNodes);
    if (f !== undefined) return f;
    if (hasParens || asStatement) throw new VbaError(35, `Sub or Function not defined: ${name}`, line);
    if (this.ctx.program.explicit) throw new VbaError(0, `Variable not defined: ${name}`, line, true);
    return null;
  }

  builtin(l: string, a: V[], line: number, asStatement: boolean, argNodes?: Arg[]): V | undefined {
    void argNodes;
    const s = (i: number) => toStr(this.deref(a[i] ?? null));
    const n = (i: number) => toNum(this.deref(a[i] ?? null), line);
    switch (l) {
      case 'msgbox': {
        this.ctx.output.push(`MsgBox: ${s(0)}`);
        return asStatement ? null : 1;
      }
      case 'len': return s(0).length;
      case 'left': return s(0).slice(0, n(1));
      case 'right': return n(1) <= 0 ? '' : s(0).slice(-n(1));
      case 'mid': return a[2] === undefined ? s(0).slice(n(1) - 1) : s(0).substr(n(1) - 1, n(2));
      case 'ucase': return s(0).toUpperCase();
      case 'lcase': return s(0).toLowerCase();
      case 'trim': return s(0).trim().replace(/ {2,}/g, ' ');
      case 'ltrim': return s(0).replace(/^\s+/, '');
      case 'rtrim': return s(0).replace(/\s+$/, '');
      case 'replace': return s(0).split(s(1)).join(s(2));
      case 'instr': {
        if (typeof a[0] === 'number' && a.length >= 3) return s(1).indexOf(s(2), n(0) - 1) + 1;
        return s(0).indexOf(s(1)) + 1;
      }
      case 'space': return ' '.repeat(Math.max(0, n(0)));
      case 'string': return s(1).charAt(0).repeat(Math.max(0, n(0)));
      case 'chr': return String.fromCharCode(n(0));
      case 'asc': return s(0).charCodeAt(0);
      case 'abs': return Math.abs(n(0));
      case 'int': return Math.floor(n(0));
      case 'fix': return Math.trunc(n(0));
      case 'sqr': {
        if (n(0) < 0) throw new VbaError(5, 'Invalid procedure call or argument', line);
        return Math.sqrt(n(0));
      }
      case 'round': {
        const d = a[1] === undefined ? 0 : n(1);
        const m = 10 ** d;
        const x = n(0) * m;
        const r = Math.round(x);
        // VBA rounds half to even
        const out = Math.abs(x % 1) === 0.5 ? 2 * Math.round(x / 2) : r;
        return out / m;
      }
      case 'sgn': return Math.sign(n(0));
      case 'cstr': return s(0);
      case 'cint':
      case 'clng': return Math.round(n(0));
      case 'cdbl':
      case 'csng': return n(0);
      case 'cbool': return truthy(this.deref(a[0] ?? null), line);
      case 'val': return Number.parseFloat(s(0)) || 0;
      case 'str': return (n(0) >= 0 ? ' ' : '') + toStr(n(0));
      case 'isnumeric': {
        const v = this.deref(a[0] ?? null);
        return typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)));
      }
      case 'isempty': return this.deref(a[0] ?? null) === null;
      case 'isdate': return typeof this.deref(a[0] ?? null) === 'number';
      case 'iserror': return this.deref(a[0] ?? null) instanceof E.XlError;
      case 'format': {
        const v = this.deref(a[0] ?? null);
        const f = s(1);
        if (typeof v === 'number') return formatWithPattern(v, f.replace(/0\.0+/g, (m) => m), (x, p) => E.formatDate(x, p));
        return toStr(v);
      }
      case 'rgb': return n(0) + n(1) * 256 + n(2) * 65536;
      case 'now':
      case 'date': return Math.floor((Date.now() - Date.UTC(1899, 11, 30)) / 86400000);
      case 'year': return E.serialToParts(n(0)).y;
      case 'month': return E.serialToParts(n(0)).m;
      case 'day': return E.serialToParts(n(0)).d;
      case 'dateserial': return E.dateToSerial(n(0), n(1), n(2));
      case 'ubound': return 0;
    }
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export type RunResult = { ok: boolean; error?: { line: number; message: string; num: number }; output: string[]; value: Scalar | undefined };
type Scalar = E.Scalar;

function init(program: Program, model: SheetModel) {
  const ctx: Ctx = { model, program, globals: new Map(), output: [], steps: 0, withs: [], errNum: 0, errDesc: '' };
  const it = new Interp(ctx);
  it.frames.push({ vars: new Map(), proc: null, resumeNext: false, handler: null });
  for (const g of program.globals) {
    if (g.s === 'dim' || g.s === 'const') {
      it.exec(g);
      for (const [k, v] of it.frame.vars) ctx.globals.set(k, v);
    }
  }
  it.frames.length = 0;
  return { ctx, it };
}

export function runVba(src: string, proc: string, model: SheetModel, args: Scalar[] = []): RunResult {
  const parsed = parseVba(src);
  if (!parsed.ok) return { ok: false, error: { line: parsed.error.line, message: `Compile error: ${parsed.error.desc}`, num: 0 }, output: [], value: undefined };
  const program = parsed.program;
  const p = program.procs[proc.toLowerCase()];
  if (!p) return { ok: false, error: { line: 0, message: `Sub or Function not defined: ${proc}`, num: 35 }, output: [], value: undefined };
  const { ctx, it } = init(program, model);
  let line = 0;
  try {
    it.frames.push({ vars: new Map(), proc: null, resumeNext: false, handler: null });
    const prevTick = it.tick.bind(it);
    it.tick = (l: number) => {
      line = l;
      prevTick(l);
    };
    const value = it.callProc(p, args as V[], p.line);
    return { ok: true, output: ctx.output, value: value instanceof E.XlError || isObj(value) ? null : (value as Scalar) };
  } catch (e) {
    if (e instanceof VbaError) {
      const message = e.compile ? `Compile error: ${e.desc}` : `Run-time error '${e.num}': ${e.desc}`;
      return { ok: false, error: { line: e.line || line, message, num: e.num }, output: ctx.output, value: undefined };
    }
    throw e;
  }
}

export function listProcs(src: string): { subs: string[]; functions: string[]; error?: string } {
  const parsed = parseVba(src);
  if (!parsed.ok) return { subs: [], functions: [], error: `Line ${parsed.error.line}: ${parsed.error.desc}` };
  const ps = Object.values(parsed.program.procs);
  return { subs: ps.filter((p) => p.kind === 'sub').map((p) => p.name), functions: ps.filter((p) => p.kind === 'function').map((p) => p.name) };
}

/** Worksheet functions defined by the module's Function procedures, for use in cell formulas. */
export function userFunctions(src: string, makeModel: () => SheetModel): Record<string, (args: Scalar[]) => Scalar> {
  const parsed = parseVba(src);
  const out: Record<string, (args: Scalar[]) => Scalar> = {};
  if (!parsed.ok) return out;
  for (const p of Object.values(parsed.program.procs)) {
    if (p.kind !== 'function') continue;
    out[p.name.toUpperCase()] = (args) => {
      const r = runVba(src, p.name, makeModel(), args);
      if (!r.ok) return new E.XlError('#VALUE!');
      return r.value === undefined ? null : r.value;
    };
  }
  return out;
}
