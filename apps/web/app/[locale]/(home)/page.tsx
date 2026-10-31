import Link from 'next/link';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';

const GREEN = '#1F4D3A';
const LIME = '#C7F000';
const PEACH = '#FF8A5B';

const FUNCTIONS = ['SUM', 'VLOOKUP', 'XLOOKUP', 'IF', 'INDEX', 'MATCH', 'COUNTIFS', 'SUMIFS', 'TEXTJOIN', 'FILTER', 'LET', 'PIVOT'];

const lessons = [
  { title: 'Formulas', sub: 'SUM, IF, AVERAGE', cells: ['12', '30', '=SUM(A1:B1)', '42'] },
  { title: 'Lookups', sub: 'XLOOKUP, INDEX/MATCH', cells: ['A-17', 'Pens', '=XLOOKUP', '$2.40'] },
  { title: 'Pivot tables', sub: 'Summarize in clicks', cells: ['North', '120', 'South', '98'] },
  { title: 'Charts', sub: 'Show the story', cells: ['Q1', '▂', 'Q2', '▆'] },
  { title: 'Cleaning data', sub: 'TRIM, TEXTSPLIT', cells: [' ann ', 'Ann', ' bob', 'Bob'] },
  { title: 'Shortcuts', sub: 'Work 3× faster', cells: ['Ctrl', '+', 'Shift', '↓'] },
];

const steps = [
  { n: '01', title: 'Do the task', body: 'Every lesson drops you into a real spreadsheet with one small goal. No videos to sit through.' },
  { n: '02', title: 'Get instant feedback', body: 'We check your formula as you type and show you why it works, or why it didn’t.' },
  { n: '03', title: 'Lock it in', body: 'Short repeats of what you missed make the skill stick, so you remember it next week.' },
];

const skills = [
  'Write formulas that don’t break',
  'Look up data across sheets',
  'Build pivot tables in minutes',
  'Clean messy exports fast',
  'Make charts people understand',
  'Use conditional formatting',
  'Automate with dynamic arrays',
  'Move faster with shortcuts',
];

const Grid = ({ cells, accent = false }: { cells: string[]; accent?: boolean }) => (
  <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-[#1F4D3A]/15 bg-white text-xs">
    {cells.map((c, i) => (
      <div
        key={i}
        className={`border-b border-r border-[#1F4D3A]/10 px-3 py-2 font-mono ${
          accent && c.startsWith('=') ? 'bg-[#C7F000]/60 font-semibold' : ''
        }`}
      >
        {c}
      </div>
    ))}
  </div>
);

const ExcelMock = () => (
  <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#1F4D3A]/10 bg-white shadow-[0_30px_80px_rgba(31,77,58,0.15)]">
    <div className="flex items-center gap-2 border-b border-[#1F4D3A]/10 bg-[#F3F6EC] px-4 py-3">
      <span className="size-2.5 rounded-full bg-[#FF8A5B]" />
      <span className="size-2.5 rounded-full bg-[#C7F000]" />
      <span className="size-2.5 rounded-full bg-[#1F4D3A]/30" />
      <span className="ml-3 text-xs text-[#1F4D3A]/60">Lesson 4 · Your first lookup</span>
    </div>
    <div className="grid md:grid-cols-[220px_1fr]">
      <aside className="hidden border-r border-[#1F4D3A]/10 p-4 text-sm md:block">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#1F4D3A]/40">Path</p>
        {['Cells & ranges', 'Basic formulas', 'Absolute refs', 'Your first lookup', 'Pivot tables'].map((t, i) => (
          <div
            key={t}
            className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 ${
              i === 3 ? 'bg-[#1F4D3A] text-[#C7F000]' : 'text-[#1F4D3A]/70'
            }`}
          >
            <span className={`size-1.5 rounded-full ${i < 3 ? 'bg-[#C7F000]' : i === 3 ? 'bg-[#C7F000]' : 'bg-[#1F4D3A]/20'}`} />
            {t}
          </div>
        ))}
      </aside>
      <div className="p-4 sm:p-6">
        <div className="mb-4 rounded-xl bg-[#F3F6EC] p-4 text-sm text-[#1F4D3A]">
          <span className="font-semibold">Goal:</span> Find the price of product <b>A-17</b> using XLOOKUP.
        </div>
        <div className="mb-2 flex items-center gap-2 rounded-md border border-[#1F4D3A]/15 px-3 py-1.5 font-mono text-xs">
          <span className="text-[#1F4D3A]/40">fx</span>
          =XLOOKUP(A2, Products!A:A, Products!C:C)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#F3F6EC] text-[#1F4D3A]/50">
                {['', 'A', 'B', 'C', 'D'].map((h) => (
                  <th key={h} className="border border-[#1F4D3A]/10 px-3 py-1.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['1', 'SKU', 'Item', 'Qty', 'Price'],
                ['2', 'A-17', 'Pens', '40', '$2.40'],
                ['3', 'B-02', 'Notebooks', '12', '$5.10'],
                ['4', 'C-33', 'Stapler', '6', '$9.80'],
              ].map((row, r) => (
                <tr key={r}>
                  {row.map((c, i) => (
                    <td
                      key={i}
                      className={`border border-[#1F4D3A]/10 px-3 py-1.5 ${
                        i === 0 ? 'bg-[#F3F6EC] text-center text-[#1F4D3A]/50' : ''
                      } ${r === 1 && i === 4 ? 'bg-[#C7F000] font-bold' : ''} ${r === 0 && i > 0 ? 'font-semibold' : ''}`}
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#1F4D3A]">
          <span className="grid size-5 place-items-center rounded-full bg-[#C7F000] text-xs">✓</span>
          Correct! XLOOKUP returned $2.40.
        </div>
      </div>
    </div>
  </div>
);

const floaters = [
  { t: 'SUM', c: GREEN, f: LIME, x: 'left-[6%] top-[12%]', r: '-8deg' },
  { t: 'IF', c: '#fff', f: GREEN, x: 'left-[22%] top-[58%]', r: '6deg' },
  { t: 'fx', c: GREEN, f: PEACH, x: 'right-[8%] top-[6%]', r: '10deg' },
  { t: 'VLOOKUP', c: GREEN, f: LIME, x: 'right-[18%] top-[62%]', r: '-6deg' },
  { t: '%', c: '#fff', f: GREEN, x: 'left-[2%] top-[80%]', r: '8deg' },
  { t: 'Σ', c: GREEN, f: PEACH, x: 'right-[3%] top-[34%]', r: '-12deg' },
];

const Home = () => (
  <div className="text-[#1F4D3A]">
    <SiteHeader />

    {/* Hero */}
    <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center sm:pt-28">
      <img src="/animateos-logo (4).png" alt="ExcelPanda logo" className="mx-auto mb-6 size-16 rounded-2xl shadow-md" />
      <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
        Master Excel,
        <br />
        <span className="relative inline-block">
          hands on.
          <span className="absolute inset-x-0 bottom-1 -z-10 h-3 rounded-full bg-[#C7F000] sm:h-4" />
        </span>
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-base text-[#1F4D3A]/70 sm:text-lg">
        Our bite-sized, interactive lessons make Excel skills easy to learn and remember. You learn by doing, not by watching.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="#start"
          className="rounded-full bg-[#1F4D3A] px-6 py-3 text-sm font-semibold text-[#C7F000] transition-transform hover:-translate-y-0.5"
        >
          Start learning free
        </Link>
        <Link href="#paths" className="rounded-full px-5 py-3 text-sm font-semibold text-[#1F4D3A] hover:bg-[#1F4D3A]/5">
          See the lessons <span className="text-[#FF8A5B]">→</span>
        </Link>
      </div>
      <p className="mt-12 text-xs uppercase tracking-[0.2em] text-[#1F4D3A]/40">Built for</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-lg font-semibold text-[#1F4D3A]/35">
        {['Analysts', 'Students', 'Finance teams', 'Founders', 'Operations'].map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
    </section>

    {/* Product mock */}
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-[#EEF3E2] px-4 py-10 sm:px-10 sm:py-16">
        <ExcelMock />
      </div>
    </section>

    {/* Big stats with floating chips */}
    <section className="relative mx-auto max-w-6xl overflow-hidden px-6 py-32 text-center">
      {floaters.map((f) => (
        <span
          key={f.t}
          style={{ ['--r' as string]: f.r, background: f.f, color: f.c }}
          className={`panda-float absolute hidden rounded-2xl px-4 py-3 font-mono text-sm font-bold shadow-lg sm:block ${f.x}`}
        >
          {f.t}
        </span>
      ))}
      <p className="text-sm font-medium text-[#1F4D3A]/60">Learning that actually sticks</p>
      <div className="mt-4 text-5xl font-semibold leading-[1.1] tracking-tight sm:text-7xl">
        <p>3-minute lessons</p>
        <p>100% hands-on</p>
        <p>
          <span className="rounded-xl bg-[#FF8A5B] px-3 text-white">0</span> setup needed
        </p>
      </div>
    </section>

    {/* Lesson library */}
    <section id="paths" className="py-20">
      <h2 className="mx-auto max-w-2xl px-6 text-center text-4xl font-semibold tracking-tight sm:text-5xl">
        Find the skill you need in seconds.
      </h2>
      <div className="mt-4 flex justify-center gap-2 text-sm">
        {['Formulas', 'Data', 'Visuals', 'Speed'].map((t, i) => (
          <span key={t} className={`rounded-full px-4 py-1.5 ${i === 0 ? 'bg-[#1F4D3A] text-[#C7F000]' : 'bg-white text-[#1F4D3A]/60'}`}>
            {t}
          </span>
        ))}
      </div>
      <div className="mt-12 flex gap-5 overflow-x-auto px-6 pb-6 sm:justify-center">
        {lessons.map((l, i) => (
          <article
            key={l.title}
            className="w-60 shrink-0 rounded-3xl border border-[#1F4D3A]/10 bg-white p-4 shadow-sm"
          >
            <Grid cells={l.cells} accent={i % 2 === 0} />
            <h3 className="mt-4 font-semibold">{l.title}</h3>
            <p className="text-sm text-[#1F4D3A]/60">{l.sub}</p>
          </article>
        ))}
      </div>
    </section>

    {/* Journeys */}
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="mx-auto max-w-2xl text-center text-4xl font-semibold tracking-tight sm:text-5xl">
        Follow a path from beginner to confident.
      </h2>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl bg-[#1F4D3A] p-8 text-white">
          <p className="text-xs uppercase tracking-widest text-[#C7F000]">Path 1</p>
          <h3 className="mt-2 text-2xl font-semibold">Excel Foundations</h3>
          <p className="mt-2 max-w-sm text-white/70">Cells, formulas, formatting and your first charts. Zero experience required.</p>
          <div className="mt-8 h-2 rounded-full bg-white/15">
            <div className="h-2 w-2/3 rounded-full bg-[#C7F000]" />
          </div>
        </div>
        <div className="rounded-3xl bg-[#C7F000] p-8">
          <p className="text-xs uppercase tracking-widest text-[#1F4D3A]/60">Path 2</p>
          <h3 className="mt-2 text-2xl font-semibold">Analyst Toolkit</h3>
          <p className="mt-2 max-w-sm text-[#1F4D3A]/75">Lookups, pivot tables and data cleaning for real reporting work.</p>
          <div className="mt-8 h-2 rounded-full bg-[#1F4D3A]/15">
            <div className="h-2 w-1/3 rounded-full bg-[#1F4D3A]" />
          </div>
        </div>
      </div>
    </section>

    {/* Practice to mastery */}
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">From practice to mastery.</h2>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.n} className="rounded-3xl border border-[#1F4D3A]/10 bg-white p-7">
            <span
              className="grid size-10 place-items-center rounded-xl font-mono text-sm font-bold"
              style={{ background: [LIME, PEACH, GREEN][i], color: i === 2 ? LIME : GREEN }}
            >
              {s.n}
            </span>
            <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#1F4D3A]/65">{s.body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Skills */}
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">What you’ll be able to do.</h2>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((s, i) => (
          <div key={s} className="rounded-2xl bg-white p-5 text-sm font-medium shadow-sm ring-1 ring-[#1F4D3A]/10">
            <span
              className="mb-3 block size-2.5 rounded-full"
              style={{ background: [LIME, PEACH, GREEN][i % 3] }}
            />
            {s}
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section id="start" className="px-6 py-24 text-center">
      <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Never feel lost in a spreadsheet again.</h2>
      <p className="mt-4 text-[#1F4D3A]/65">Start with a 3-minute lesson. No setup, no credit card.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/blog" className="rounded-full bg-[#1F4D3A] px-6 py-3 text-sm font-semibold text-[#C7F000]">
          Start learning free
        </Link>
        <Link href="/blog" className="rounded-full px-5 py-3 text-sm font-semibold hover:bg-[#1F4D3A]/5">
          Read the blog <span className="text-[#FF8A5B]">→</span>
        </Link>
      </div>
    </section>

    {/* Marquee */}
    <div className="overflow-hidden border-y border-[#1F4D3A]/10 py-6">
      <div className="panda-marquee flex w-max gap-4">
        {[...FUNCTIONS, ...FUNCTIONS].map((f, i) => (
          <span
            key={i}
            className="rounded-full border border-[#1F4D3A]/15 bg-white px-5 py-2 font-mono text-sm font-semibold"
          >
            <span style={{ color: i % 2 ? PEACH : '#7C9A00' }}>=</span>
            {f}()
          </span>
        ))}
      </div>
    </div>

    <SiteFooter />
  </div>
);

export default Home;
