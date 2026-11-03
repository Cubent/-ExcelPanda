// Financial functions, following Excel's sign convention: money you pay out is negative.

export class FinError extends Error {
  constructor(public code: '#NUM!' | '#VALUE!' | '#DIV/0!') {
    super(code);
  }
}
const num = (x: number) => {
  if (!Number.isFinite(x)) throw new FinError('#NUM!');
  return x;
};

export function fv(rate: number, nper: number, pmt: number, pv = 0, type = 0): number {
  if (rate === 0) return -(pv + pmt * nper);
  const g = (1 + rate) ** nper;
  return num(-(pv * g + (pmt * (1 + rate * type) * (g - 1)) / rate));
}
export function pv(rate: number, nper: number, pmt: number, fvv = 0, type = 0): number {
  if (rate === 0) return -(fvv + pmt * nper);
  const g = (1 + rate) ** nper;
  return num(-(fvv + (pmt * (1 + rate * type) * (g - 1)) / rate) / g);
}
export function pmt(rate: number, nper: number, pvv: number, fvv = 0, type = 0): number {
  if (nper === 0) throw new FinError('#NUM!');
  if (rate === 0) return -(pvv + fvv) / nper;
  const g = (1 + rate) ** nper;
  return num(-(rate * (pvv * g + fvv)) / ((1 + rate * type) * (g - 1)));
}
export function nper(rate: number, pmtv: number, pvv: number, fvv = 0, type = 0): number {
  if (rate === 0) {
    if (pmtv === 0) throw new FinError('#NUM!');
    return -(pvv + fvv) / pmtv;
  }
  const a = pmtv * (1 + rate * type) - fvv * rate;
  const b = pvv * rate + pmtv * (1 + rate * type);
  if (b === 0 || a / b <= 0) throw new FinError('#NUM!');
  return num(Math.log(a / b) / Math.log(1 + rate));
}
export function rate(n: number, pmtv: number, pvv: number, fvv = 0, type = 0, guess = 0.1): number {
  let r = guess;
  const f = (x: number) => (x === 0 ? pvv + pmtv * n + fvv : pvv * (1 + x) ** n + (pmtv * (1 + x * type) * ((1 + x) ** n - 1)) / x + fvv);
  for (let i = 0; i < 100; i++) {
    const h = 1e-7;
    const y = f(r);
    const d = (f(r + h) - f(r - h)) / (2 * h);
    if (!Number.isFinite(y) || !Number.isFinite(d) || d === 0) break;
    const next = r - y / d;
    if (Math.abs(next - r) < 1e-12) return num(next);
    r = next > -0.999999 ? next : -0.999999;
  }
  throw new FinError('#NUM!');
}
export function ipmt(r: number, per: number, n: number, pvv: number, fvv = 0, type = 0): number {
  if (per < 1 || per > n) throw new FinError('#NUM!');
  const p = pmt(r, n, pvv, fvv, type);
  if (type === 1) return per === 1 ? 0 : (fv(r, per - 2, p, pvv, 1) - p) * r;
  return fv(r, per - 1, p, pvv, 0) * r;
}
export function ppmt(r: number, per: number, n: number, pvv: number, fvv = 0, type = 0): number {
  return pmt(r, n, pvv, fvv, type) - ipmt(r, per, n, pvv, fvv, type);
}
export function cumipmt(r: number, n: number, pvv: number, start: number, end: number, type = 0): number {
  if (r <= 0 || n <= 0 || pvv <= 0 || start < 1 || end < start || end > n) throw new FinError('#NUM!');
  let s = 0;
  for (let k = Math.trunc(start); k <= Math.trunc(end); k++) s += ipmt(r, k, n, pvv, 0, type);
  return s;
}
export function cumprinc(r: number, n: number, pvv: number, start: number, end: number, type = 0): number {
  if (r <= 0 || n <= 0 || pvv <= 0 || start < 1 || end < start || end > n) throw new FinError('#NUM!');
  let s = 0;
  for (let k = Math.trunc(start); k <= Math.trunc(end); k++) s += ppmt(r, k, n, pvv, 0, type);
  return s;
}
/** Excel's NPV: the first value is discounted one period. */
export function npv(r: number, values: number[]): number {
  if (r === -1) throw new FinError('#DIV/0!');
  return values.reduce((s, v, i) => s + v / (1 + r) ** (i + 1), 0);
}
function solve(f: (x: number) => number, guess: number): number {
  let x = guess;
  for (let i = 0; i < 200; i++) {
    const h = 1e-7;
    const y = f(x);
    const d = (f(x + h) - f(x - h)) / (2 * h);
    if (!Number.isFinite(y) || !Number.isFinite(d) || d === 0) break;
    const next = x - y / d;
    if (Math.abs(next - x) < 1e-11) return next;
    x = next > -0.999999 ? next : -0.999999;
  }
  // Newton failed: fall back to bisection on a wide bracket.
  let lo = -0.9999;
  let hi = 10;
  let flo = f(lo);
  const fhi = f(hi);
  if (!Number.isFinite(flo) || !Number.isFinite(fhi) || flo * fhi > 0) throw new FinError('#NUM!');
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (flo * fm <= 0) hi = mid;
    else {
      lo = mid;
      flo = fm;
    }
  }
  return (lo + hi) / 2;
}
export function irr(values: number[], guess = 0.1): number {
  if (!values.some((v) => v > 0) || !values.some((v) => v < 0)) throw new FinError('#NUM!');
  return num(solve((x) => values.reduce((s, v, i) => s + v / (1 + x) ** i, 0), guess));
}
export function xnpv(r: number, values: number[], dates: number[]): number {
  if (values.length !== dates.length || r <= -1) throw new FinError('#NUM!');
  return values.reduce((s, v, i) => s + v / (1 + r) ** ((dates[i] - dates[0]) / 365), 0);
}
export function xirr(values: number[], dates: number[], guess = 0.1): number {
  if (values.length !== dates.length || !values.some((v) => v > 0) || !values.some((v) => v < 0)) throw new FinError('#NUM!');
  return num(solve((x) => xnpv(x, values, dates), guess));
}
export const sln = (cost: number, salvage: number, life: number) => {
  if (life === 0) throw new FinError('#DIV/0!');
  return (cost - salvage) / life;
};
export function ddb(cost: number, salvage: number, life: number, period: number, factor = 2): number {
  if (cost < 0 || salvage < 0 || life <= 0 || period < 1 || period > life) throw new FinError('#NUM!');
  let book = cost;
  let dep = 0;
  for (let k = 1; k <= Math.trunc(period); k++) {
    dep = Math.min((book * factor) / life, Math.max(0, book - salvage));
    book -= dep;
  }
  return dep;
}
export const effect = (nominal: number, k: number) => {
  if (nominal <= 0 || k < 1) throw new FinError('#NUM!');
  return (1 + nominal / Math.trunc(k)) ** Math.trunc(k) - 1;
};
export const nominal = (eff: number, k: number) => {
  if (eff <= 0 || k < 1) throw new FinError('#NUM!');
  return Math.trunc(k) * ((1 + eff) ** (1 / Math.trunc(k)) - 1);
};
