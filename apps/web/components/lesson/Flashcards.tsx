'use client';

import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Card = { fn: string; group: string; syntax: string; what: string; example: string };

const CARDS: Card[] = [
  { fn: 'SUM', group: 'Maths', syntax: '=SUM(number1, [number2], …)', what: 'Adds numbers and ranges.', example: '=SUM(B2:B9) adds the eight cells.' },
  { fn: 'AVERAGE', group: 'Maths', syntax: '=AVERAGE(range)', what: 'The mean of the numbers, ignoring blanks and text.', example: '=AVERAGE(C2:C20)' },
  { fn: 'ROUND', group: 'Maths', syntax: '=ROUND(number, digits)', what: 'Rounds to a number of decimal places. Negative digits round to tens, hundreds.', example: '=ROUND(3.14159, 2) gives 3.14.' },
  { fn: 'MIN / MAX', group: 'Maths', syntax: '=MAX(range)', what: 'The smallest or largest number.', example: '=MAX(B2:B30)' },
  { fn: 'COUNT', group: 'Maths', syntax: '=COUNT(range)', what: 'Counts cells that hold numbers. COUNTA counts anything non-empty.', example: '=COUNT(A2:A50)' },
  { fn: 'SUMPRODUCT', group: 'Maths', syntax: '=SUMPRODUCT(array1, array2)', what: 'Multiplies matching items and adds the results. Also works with conditions.', example: '=SUMPRODUCT(B2:B6, C2:C6) is the total of qty × price.' },
  { fn: 'LARGE', group: 'Maths', syntax: '=LARGE(range, k)', what: 'The k-th biggest value. SMALL is the k-th smallest.', example: '=LARGE(B2:B20, 3) is the third highest.' },
  { fn: 'IF', group: 'Logic', syntax: '=IF(test, if_true, if_false)', what: 'Returns one thing when a test is true and another when it is not.', example: '=IF(B2>=50, "Pass", "Fail")' },
  { fn: 'IFS', group: 'Logic', syntax: '=IFS(test1, result1, test2, result2, …)', what: 'Checks tests in order and returns the first match. Avoids nested IFs.', example: '=IFS(B2>=90,"A", B2>=70,"B", TRUE,"C")' },
  { fn: 'AND / OR', group: 'Logic', syntax: '=AND(test1, test2)', what: 'AND is true when all tests are true; OR when at least one is.', example: '=IF(AND(B2>0, C2<100), "OK", "Check")' },
  { fn: 'IFERROR', group: 'Logic', syntax: '=IFERROR(value, if_error)', what: 'Shows a friendly result instead of an error.', example: '=IFERROR(B2/C2, 0)' },
  { fn: 'SWITCH', group: 'Logic', syntax: '=SWITCH(value, match1, result1, …, default)', what: 'Maps a value to a result without a long IF chain.', example: '=SWITCH(A2, "N","North", "S","South", "Other")' },
  { fn: 'SUMIF', group: 'Conditions', syntax: '=SUMIF(range, criteria, [sum_range])', what: 'Adds the cells that meet one condition.', example: '=SUMIF(A2:A9, "North", C2:C9)' },
  { fn: 'SUMIFS', group: 'Conditions', syntax: '=SUMIFS(sum_range, range1, crit1, range2, crit2)', what: 'Adds with several conditions. Note the sum range comes first.', example: '=SUMIFS(D:D, A:A, "North", B:B, "Pen")' },
  { fn: 'COUNTIF', group: 'Conditions', syntax: '=COUNTIF(range, criteria)', what: 'Counts the cells that meet a condition. Use ">10" for comparisons.', example: '=COUNTIF(B2:B30, ">10")' },
  { fn: 'AVERAGEIF', group: 'Conditions', syntax: '=AVERAGEIF(range, criteria, [avg_range])', what: 'The average of cells that meet a condition.', example: '=AVERAGEIF(A2:A9, "South", C2:C9)' },
  { fn: 'XLOOKUP', group: 'Lookup', syntax: '=XLOOKUP(find, look_in, return, [if_not_found])', what: 'Finds a value and returns the match from another column. Replaces VLOOKUP.', example: '=XLOOKUP(A2, F:F, G:G, "none")' },
  { fn: 'VLOOKUP', group: 'Lookup', syntax: '=VLOOKUP(find, table, col_number, FALSE)', what: 'The classic lookup. Searches the first column; FALSE means exact match.', example: '=VLOOKUP(A2, F2:H20, 3, FALSE)' },
  { fn: 'INDEX', group: 'Lookup', syntax: '=INDEX(range, row, [column])', what: 'Returns the value at a position in a range.', example: '=INDEX(B2:B9, 4)' },
  { fn: 'MATCH', group: 'Lookup', syntax: '=MATCH(find, range, 0)', what: 'The position of a value in a range. 0 means exact match. Pairs with INDEX.', example: '=INDEX(A2:A9, MATCH(MAX(B2:B9), B2:B9, 0))' },
  { fn: 'LEFT / RIGHT', group: 'Text', syntax: '=LEFT(text, n)', what: 'The first or last n characters.', example: '=LEFT("Excel", 2) gives Ex.' },
  { fn: 'MID', group: 'Text', syntax: '=MID(text, start, length)', what: 'Characters from the middle of text.', example: '=MID("Excel", 2, 3) gives xce.' },
  { fn: 'LEN', group: 'Text', syntax: '=LEN(text)', what: 'How many characters.', example: '=LEN(A2)' },
  { fn: 'TRIM', group: 'Text', syntax: '=TRIM(text)', what: 'Removes extra spaces, leaving single spaces between words.', example: '=TRIM("  a   b ")' },
  { fn: 'UPPER / LOWER / PROPER', group: 'Text', syntax: '=PROPER(text)', what: 'Changes the case. PROPER capitalises each word.', example: '=PROPER("ana lopez") gives Ana Lopez.' },
  { fn: 'TEXTJOIN', group: 'Text', syntax: '=TEXTJOIN(delimiter, ignore_empty, range)', what: 'Joins many cells with a separator.', example: '=TEXTJOIN(", ", TRUE, A2:A6)' },
  { fn: 'FIND / SEARCH', group: 'Text', syntax: '=FIND(text, within)', what: 'The position of text inside other text. FIND is case-sensitive; SEARCH is not.', example: '=FIND("@", A2)' },
  { fn: 'SUBSTITUTE', group: 'Text', syntax: '=SUBSTITUTE(text, old, new)', what: 'Replaces matching text inside a string.', example: '=SUBSTITUTE(A2, "-", "")' },
  { fn: 'TEXT', group: 'Text', syntax: '=TEXT(value, format)', what: 'Turns a number or date into text with a format.', example: '=TEXT(A2, "dd-mmm-yy")' },
  { fn: 'TODAY / NOW', group: 'Dates', syntax: '=TODAY()', what: "Today's date (NOW adds the time). Both update every day.", example: '=TODAY()-A2 is the days since A2.' },
  { fn: 'DATE', group: 'Dates', syntax: '=DATE(year, month, day)', what: 'Builds a date from parts.', example: '=DATE(2026, 3, 15)' },
  { fn: 'YEAR / MONTH / DAY', group: 'Dates', syntax: '=MONTH(date)', what: 'Pulls one part out of a date.', example: '=YEAR(A2)' },
  { fn: 'EDATE / EOMONTH', group: 'Dates', syntax: '=EDATE(date, months)', what: 'A date some months later. EOMONTH gives the end of that month.', example: '=EOMONTH(A2, 0) is the last day of A2’s month.' },
  { fn: 'DATEDIF', group: 'Dates', syntax: '=DATEDIF(start, end, "y")', what: 'Whole years ("y"), months ("m") or days ("d") between two dates.', example: '=DATEDIF(B2, TODAY(), "y") is an age.' },
  { fn: 'FILTER', group: 'Dynamic arrays', syntax: '=FILTER(range, condition, [if_empty])', what: 'Returns the rows that meet a condition, spilling into the cells below.', example: '=FILTER(A2:C20, C2:C20>100)' },
  { fn: 'SORT', group: 'Dynamic arrays', syntax: '=SORT(range, [column], [order])', what: 'A sorted copy that stays live. Order 1 ascending, -1 descending.', example: '=SORT(A2:B9, 2, -1)' },
  { fn: 'UNIQUE', group: 'Dynamic arrays', syntax: '=UNIQUE(range)', what: 'The distinct values, without duplicates.', example: '=UNIQUE(A2:A100)' },
  { fn: 'SEQUENCE', group: 'Dynamic arrays', syntax: '=SEQUENCE(rows, [cols], [start], [step])', what: 'Generates a list of numbers.', example: '=SEQUENCE(12) gives 1 to 12.' },
  { fn: 'LET', group: 'Dynamic arrays', syntax: '=LET(name, value, …, result)', what: 'Names an intermediate result so a long formula is short and fast.', example: '=LET(x, A2*B2, x + x*0.2)' },
  { fn: 'PMT', group: 'Finance', syntax: '=PMT(rate, nper, pv)', what: 'The regular payment on a loan. Negative: it is money you pay.', example: '=PMT(0.06/12, 60, 20000)' },
  { fn: 'FV', group: 'Finance', syntax: '=FV(rate, nper, pmt, [pv])', what: 'What savings will be worth.', example: '=FV(0.05, 10, -1000) saves 1,000 a year.' },
  { fn: 'NPV', group: 'Finance', syntax: '=NPV(rate, values)', what: 'Present value of future cash flows. The first value is one period away, so add the upfront cost outside.', example: '=B2+NPV(0.1, B3:B6)' },
  { fn: 'IRR', group: 'Finance', syntax: '=IRR(values)', what: 'The rate of return that makes NPV zero.', example: '=IRR(B2:B6)' },
];

const GROUPS = ['All', ...Array.from(new Set(CARDS.map((c) => c.group)))];
const KEY = 'xp-flashcards';

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

export function Flashcards() {
  const [known, setKnown] = useState<string[]>([]);
  const [group, setGroup] = useState('All');
  const [order, setOrder] = useState<string[]>([]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      if (Array.isArray(v)) setKnown(v);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(known));
    } catch {}
  }, [known, ready]);

  const pool = useMemo(() => CARDS.filter((c) => group === 'All' || c.group === group), [group]);
  // Start each round with the cards you do not know yet.
  const deal = useCallback(() => {
    const todo = pool.filter((c) => !known.includes(c.fn)).map((c) => c.fn);
    setOrder(shuffle(todo));
    setPos(0);
    setFlipped(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);
  useEffect(() => {
    if (ready) deal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, group]);

  const card = CARDS.find((c) => c.fn === order[pos]);
  const knownHere = pool.filter((c) => known.includes(c.fn)).length;
  const done = ready && order.length > 0 && pos >= order.length;
  const empty = ready && order.length === 0;

  const answer = useCallback(
    (gotIt: boolean) => {
      if (!card) return;
      if (gotIt) setKnown((k) => (k.includes(card.fn) ? k : [...k, card.fn]));
      else setOrder((o) => [...o, card.fn]); // it comes round again
      setPos((p) => p + 1);
      setFlipped(false);
    },
    [card],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && e.key === 'ArrowRight') answer(true);
      else if (flipped && e.key === 'ArrowLeft') answer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipped, answer]);

  const remaining = Math.max(0, order.length - pos);

  return (
    <div className="flex min-h-dvh flex-col bg-[#F7F8F4] text-[#1F4D3A]">
      <header className="flex items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/practice" aria-label="Back to practice" className="flex size-9 items-center justify-center rounded-xl text-[#1F4D3A]/60 hover:bg-[#1F4D3A]/8 hover:text-[#1F4D3A]">
          <X size={20} />
        </Link>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#1F4D3A]/10">
          <div className="h-full rounded-full bg-[#1F4D3A] transition-all duration-500" style={{ width: `${pool.length ? (knownHere / pool.length) * 100 : 0}%` }} />
        </div>
        <span className="text-sm font-semibold text-[#1F4D3A]/60">
          {knownHere}/{pool.length} known
        </span>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-wrap justify-center gap-1.5 px-4 pb-4">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${group === g ? 'bg-[#1F4D3A] text-white' : 'bg-white text-[#1F4D3A]/70 ring-1 ring-[#1F4D3A]/15 hover:bg-[#1F4D3A]/5'}`}
          >
            {g}
          </button>
        ))}
      </div>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 pb-10">
        {ready && (done || empty) ? (
          <div className="mt-10 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#C7F000] text-[#1F4D3A]">
              <Check size={30} strokeWidth={3.5} />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">{pool.length && knownHere === pool.length ? 'You know every card here' : 'Round complete'}</h1>
            <p className="mt-1.5 text-[15px] text-[#1F4D3A]/60">
              {knownHere} of {pool.length} cards marked as known.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setKnown((k) => k.filter((f) => !pool.some((c) => c.fn === f)));
                  setTimeout(deal, 0);
                }}
                className="flex items-center gap-2 rounded-xl border border-[#1F4D3A]/25 bg-white px-5 py-3 text-sm font-semibold hover:bg-[#1F4D3A]/5"
              >
                <RotateCcw size={16} /> Start over
              </button>
              {remaining === 0 && knownHere < pool.length && (
                <button type="button" onClick={deal} className="rounded-xl bg-[#1F4D3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#173d2e]">
                  Study the rest
                </button>
              )}
              <Link href="/practice" className="rounded-xl bg-[#1F4D3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#173d2e]">
                Done
              </Link>
            </div>
          </div>
        ) : card ? (
          <>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? 'Hide the answer' : 'Show the answer'}
              className="group relative h-72 w-full [perspective:1200px] focus:outline-none"
            >
              <div className="relative size-full transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-b-4 border-[#1F4D3A]/20 bg-white p-6 [backface-visibility:hidden]">
                  <span className="rounded-full bg-[#C7F000]/50 px-3 py-1 text-xs font-bold uppercase tracking-wide">{card.group}</span>
                  <h1 className="mt-5 font-mono text-4xl font-bold tracking-tight">{card.fn}</h1>
                  <p className="mt-5 text-sm text-[#1F4D3A]/50">What does it do? Tap or press Space to flip.</p>
                </div>
                <div className="absolute inset-0 flex flex-col justify-center rounded-3xl border-2 border-b-4 border-[#1F4D3A] bg-[#1F4D3A] p-6 text-left text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <code className="rounded-lg bg-black/20 px-3 py-2 font-mono text-[13px] text-[#C7F000]">{card.syntax}</code>
                  <p className="mt-4 text-[15px] leading-relaxed">{card.what}</p>
                  <p className="mt-3 text-sm text-white/70">
                    <span className="font-semibold text-white/90">Example: </span>
                    <code className="font-mono">{card.example}</code>
                  </p>
                </div>
              </div>
            </button>

            <div className="mt-6 flex w-full gap-3">
              <button type="button" disabled={!flipped} onClick={() => answer(false)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#C0392B]/30 bg-white py-3.5 text-sm font-bold text-[#C0392B] transition-colors hover:bg-[#FDECEA] disabled:opacity-35">
                <ArrowLeft size={16} /> Again
              </button>
              <button type="button" disabled={!flipped} onClick={() => answer(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1F4D3A] py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#173d2e] disabled:opacity-35">
                Got it <ArrowRight size={16} />
              </button>
            </div>
            <p className="mt-3 text-xs text-[#1F4D3A]/45">{remaining} left in this round. Space flips, ← again, → got it.</p>
          </>
        ) : null}
      </main>
    </div>
  );
}
