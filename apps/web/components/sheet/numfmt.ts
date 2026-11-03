// Excel custom number formats: sections, digit placeholders, thousands separators and scaling, literals, percent, dates.

type Piece = { t: 'lit'; s: string } | { t: 'num'; s: string } | { t: 'at' } | { t: 'date'; s: string };

/** Splits a format on unquoted semicolons. */
function sections(fmt: string): string[] {
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < fmt.length; i++) {
    const ch = fmt[i];
    if (ch === '"') q = !q;
    if (ch === ';' && !q) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

const DATE_TOKEN = /^(yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d|hh|h|ss|s|AM\/PM)/i;

function tokenise(sec: string): Piece[] {
  const out: Piece[] = [];
  let i = 0;
  const lit = (s: string) => {
    const last = out[out.length - 1];
    if (last?.t === 'lit') last.s += s;
    else out.push({ t: 'lit', s });
  };
  while (i < sec.length) {
    const ch = sec[i];
    if (ch === '"') {
      const j = sec.indexOf('"', i + 1);
      lit(sec.slice(i + 1, j < 0 ? undefined : j));
      i = j < 0 ? sec.length : j + 1;
    } else if (ch === '\\') {
      lit(sec[i + 1] ?? '');
      i += 2;
    } else if (ch === '[') {
      const j = sec.indexOf(']', i);
      i = j < 0 ? sec.length : j + 1; // colour / condition tags are ignored
    } else if (ch === '_') {
      lit(' ');
      i += 2;
    } else if (ch === '*') {
      i += 2;
    } else if (ch === '@') {
      out.push({ t: 'at' });
      i++;
    } else if (/[0#?.,%]/.test(ch)) {
      let j = i;
      while (j < sec.length && /[0#?.,%]/.test(sec[j])) j++;
      out.push({ t: 'num', s: sec.slice(i, j) });
      i = j;
    } else {
      const m = DATE_TOKEN.exec(sec.slice(i));
      if (m) {
        out.push({ t: 'date', s: m[0] });
        i += m[0].length;
      } else {
        lit(ch);
        i++;
      }
    }
  }
  return out;
}

const grouped = (n: number, decimals: number, minInt: number, group: boolean) => {
  const s = Math.abs(n).toFixed(decimals);
  let [ip, fp = ''] = s.split('.');
  if (ip.length < minInt) ip = ip.padStart(minInt, '0');
  if (minInt === 0 && /^0+$/.test(ip)) ip = '';
  if (group) ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fp ? `${ip}.${fp}` : ip;
};

/** Formats a number using one numeric section. */
function numSection(v: number, pieces: Piece[], negativeSection: boolean, dateFmt: (v: number, p: string) => string): string {
  const hasDate = pieces.some((p) => p.t === 'date');
  if (hasDate) {
    const pat = pieces.map((p) => (p.t === 'lit' ? p.s : p.t === 'date' ? p.s : '')).join('');
    return dateFmt(v, pat);
  }
  const numIdx = pieces.findIndex((p) => p.t === 'num');
  if (numIdx < 0) return pieces.map((p) => (p.t === 'lit' ? p.s : '')).join('');
  const spec = (pieces[numIdx] as { s: string }).s;
  const percent = (spec.match(/%/g) ?? []).length;
  let body = spec.replace(/%/g, '');
  // Trailing commas scale by 1,000 each.
  let scale = 0;
  while (body.endsWith(',')) {
    scale++;
    body = body.slice(0, -1);
  }
  const group = body.includes(',');
  body = body.replace(/,/g, '');
  const [intPart, decPart = ''] = body.split('.');
  const minInt = (intPart.match(/0/g) ?? []).length;
  const decimals = decPart.length;
  let x = Math.abs(v) * 100 ** (percent ? 1 : 0) / 1000 ** scale;
  if (percent > 1) x *= 100 ** (percent - 1);
  const digits = grouped(x, decimals, minInt, group);
  const negative = v < 0 && !negativeSection && Math.round(x * 10 ** decimals) !== 0;
  const out = pieces
    .map((p, i) => {
      if (i === numIdx) return (negative ? '-' : '') + digits + (percent ? '%' : '');
      return p.t === 'lit' ? p.s : p.t === 'at' ? String(v) : '';
    })
    .join('');
  return out;
}

/** True when the format has at least one recognisable placeholder. */
export function isValidFormat(fmt: string): boolean {
  if (!fmt.trim()) return false;
  return sections(fmt).every((s) => tokenise(s).some((p) => p.t !== 'lit') || s.trim() === '' || /"/.test(s));
}

/**
 * Formats a value with an Excel number format. `dateFmt` formats a serial date with a pattern like "dd-mmm".
 */
export function formatWithPattern(v: number | string | boolean, fmt: string, dateFmt: (v: number, p: string) => string): string {
  if (fmt.trim().toLowerCase() === 'general') return String(v);
  const secs = sections(fmt);
  if (typeof v === 'string') {
    const text = secs[3] ?? (secs.length === 1 && /@/.test(secs[0]) ? secs[0] : null);
    if (text === null) return v;
    return tokenise(text).map((p) => (p.t === 'at' ? v : p.t === 'lit' ? p.s : '')).join('');
  }
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  let sec: string;
  let negSection = false;
  if (v < 0 && secs.length >= 2) {
    sec = secs[1];
    negSection = true;
  } else if (v === 0 && secs.length >= 3) sec = secs[2];
  else sec = secs[0];
  return numSection(v, tokenise(sec), negSection, dateFmt);
}
