import Link from 'next/link';
import { StartFreeButton } from '../components/start-free-button';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import { ReviewCard } from './review-card';

const GREEN = '#1F4D3A';
const LIME = '#C7F000';
const PEACH = '#FF8A5B';

const FUNCTIONS = ['SUM', 'VLOOKUP', 'XLOOKUP', 'IF', 'INDEX', 'MATCH', 'COUNTIFS', 'SUMIFS', 'TEXTJOIN', 'FILTER', 'LET', 'PIVOT'];

const FAQS: { q: string; a: string }[] = [{"q": "How do I learn Excel from scratch?", "a": "Start with cells, ranges and basic formulas such as SUM and AVERAGE, then move to lookups, pivot tables and charts. ExcelPanda breaks each of these into short, hands-on lessons so you practice every skill in a real spreadsheet instead of only reading about it."}, {"q": "How long does it take to learn Excel?", "a": "Most people can handle everyday tasks like formulas, formatting and simple charts within a few weeks of short daily practice. Lookups, pivot tables and data cleaning usually take a little longer, which is why lessons are kept to a few minutes each."}, {"q": "Do I need Excel installed to use ExcelPanda?", "a": "No. Lessons run in the browser, so there is nothing to install or set up before you start."}, {"q": "Which Excel functions should I learn first?", "a": "SUM, IF, COUNTIF, XLOOKUP and INDEX/MATCH cover a large share of real-world work. After those, learn SUMIFS, TEXTJOIN, FILTER and pivot tables."}, {"q": "Is learning by doing better than watching videos?", "a": "Videos are easy to follow but easy to forget. Typing the formula yourself, seeing the result and fixing mistakes builds the muscle memory that makes skills stick."}, {"q": "Is ExcelPanda free?", "a": "You can start with free lessons today. Paid plans for the full library may be added later, and the free lessons will remain free."}];

const TOPICS: { t: string; d: string }[] = [{"t": "Excel formulas", "d": "Write SUM, IF, COUNTIF and nested formulas that work the first time, and learn to read error messages."}, {"t": "Lookups and references", "d": "Pull data across sheets with XLOOKUP, VLOOKUP and INDEX/MATCH, and understand absolute versus relative references."}, {"t": "Pivot tables", "d": "Summarize thousands of rows in a few clicks, group dates, and build reports that update on refresh."}, {"t": "Charts and visuals", "d": "Pick the right chart, format it cleanly and make the key point obvious at a glance."}, {"t": "Data cleaning", "d": "Fix messy exports with TRIM, TEXTSPLIT, Flash Fill and Power Query basics."}, {"t": "Keyboard shortcuts", "d": "Navigate, select and format without the mouse and finish routine work in a fraction of the time."}];

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

const floaters = [
  { t: 'SUM', c: GREEN, f: LIME, x: 'left-[6%] top-[12%]', r: '-8deg' },
  { t: 'IF', c: '#fff', f: GREEN, x: 'left-[22%] top-[58%]', r: '6deg' },
  { t: 'fx', c: GREEN, f: PEACH, x: 'right-[8%] top-[6%]', r: '10deg' },
  { t: 'VLOOKUP', c: GREEN, f: LIME, x: 'right-[18%] top-[62%]', r: '-6deg' },
  { t: '%', c: '#fff', f: GREEN, x: 'left-[2%] top-[80%]', r: '8deg' },
  { t: 'Σ', c: GREEN, f: PEACH, x: 'right-[3%] top-[34%]', r: '-12deg' },
];

const Home = () => (
  <div className="min-h-screen bg-white text-[#1F4D3A]">
    <SiteHeader />

    {/* Hero */}
    <section className="-mt-[88px]">
      <div className="relative mx-auto grid items-center gap-10 overflow-hidden bg-[#F3F6EC] px-6 pb-32 pt-48 sm:px-16 lg:px-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Master Excel,
            <br />
            <span className="font-light">hands on.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[#1F4D3A]/75 sm:text-xl">
            Bite-sized, interactive lessons make Excel easy to learn and remember. You learn by doing, not by watching.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <StartFreeButton className="rounded-md bg-[#1F4D3A] px-7 py-3.5 text-base font-semibold text-[#C7F000] transition-opacity hover:opacity-90">
              Start learning free
            </StartFreeButton>
            <Link href="#paths" className="text-base font-semibold underline-offset-4 hover:underline">
              See the lessons →
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {[7, 8, 9].map((n) => (
                <img
                  key={n}
                  src={`/animateos-logo (${n}).png`}
                  alt=""
                  className="size-10 rounded-full border-2 border-[#F3F6EC] object-cover"
                />
              ))}
            </div>
            <p className="text-sm font-medium">Join 30,000+ Learners Across 40+ Countries</p>
          </div>
        </div>
      </div>
    </section>
    {/* Why ExcelPanda */}
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:gap-16">
      <div>
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">Learn it. Do it. Keep it.</h2>
        <p className="mt-5 max-w-md text-lg text-[#1F4D3A]/75">
          Short, real-spreadsheet tasks with instant feedback, so every skill sticks instead of fading by next week.
        </p>
        <ul className="mt-7 space-y-4 text-[15px]">
          {[
            ['Learn in a ', 'real spreadsheet', ', not from videos.'],
            ['Get ', 'instant feedback', ' on every formula you write.'],
            ['Go from ', 'first formula to VBA', ' in seven courses.'],
          ].map(([a, b, c]) => (
            <li key={b} className="flex items-center gap-3">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#1F4D3A] text-[11px] text-[#C7F000]">✓</span>
              <span>
                {a}
                <strong className="font-semibold">{b}</strong>
                {c}
              </span>
            </li>
          ))}
        </ul>
        <ReviewCard />
      </div>

      <img
        src="/animateos-logo (5).png"
        alt="ExcelPanda"
        className="aspect-square w-full rounded-lg object-cover shadow-2xl shadow-[#1F4D3A]/25"
      />
    </section>

    {/* Big stats with floating chips */}
    <section className="relative mx-auto max-w-6xl overflow-hidden px-6 py-32 text-center">
      {floaters.map((f) => (
        <span
          key={f.t}
          style={{ ['--r' as string]: f.r, background: f.f, color: f.c }}
          className={`panda-float absolute hidden rounded-2xl px-4 py-3 font-mono text-sm font-bold sm:block ${f.x}`}
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

    {/* Practice to mastery */}
    <section id="paths" className="mx-auto max-w-6xl px-6 py-20">
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
          <div key={s} className="rounded-2xl bg-white p-5 text-sm font-medium ring-1 ring-[#1F4D3A]/10">
            <span
              className="mb-3 block size-2.5 rounded-full"
              style={{ background: [LIME, PEACH, GREEN][i % 3] }}
            />
            {s}
          </div>
        ))}
      </div>
    </section>

    {/* SEO: what & why */}
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-20">
        <div>
          <p className="text-sm font-medium text-[#1F4D3A]/60">Learn Excel online</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            The fastest way to learn Excel is to use it.
          </h2>
        </div>
        <div className="space-y-5 text-lg leading-relaxed text-[#1F4D3A]/75">
          <p>
            ExcelPanda is an interactive Excel course built around short, practical exercises. Each lesson gives you a small
            goal, a real spreadsheet and instant feedback, so you learn formulas, functions and data skills by doing them.
          </p>
          <p>
            Whether you are starting from zero or tightening up your skills for work, you will build the habits that matter:
            clean data, readable formulas and reports you can trust.
          </p>
        </div>
      </div>
    </section>

    {/* SEO: topics */}
    <section className="border-y border-[#1F4D3A]/10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Excel topics you can learn here</h2>
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-[#1F4D3A]/10 bg-[#1F4D3A]/10 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t, i) => (
            <article key={t.t} className="bg-white p-8">
              <span className="font-mono text-sm" style={{ color: i % 2 ? PEACH : '#7C9A00' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-xl font-semibold">{t.t}</h3>
              <p className="mt-2 leading-relaxed text-[#1F4D3A]/65">{t.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* SEO: comparison */}
    <section className="mx-auto max-w-4xl px-6 py-24">
      <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">Learning by doing vs. watching videos</h2>
      <div className="mt-12 overflow-hidden rounded-3xl border border-[#1F4D3A]/10 bg-white">
        <table className="w-full text-left text-sm sm:text-base">
          <thead>
            <tr className="border-b border-[#1F4D3A]/10 bg-[#EEF3E2]">
              <th className="px-5 py-4 font-medium text-[#1F4D3A]/60"><span className="sr-only">Feature</span></th>
              <th className="px-5 py-4 font-medium text-[#1F4D3A]/60">Video courses</th>
              <th className="px-5 py-4 font-semibold">ExcelPanda</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['You practice', 'After the video, if at all', 'In every lesson'],
              ['Feedback', 'None, you check yourself', 'Instant, on your formula'],
              ['Lesson length', '10 to 40 minutes', 'About 3 minutes'],
              ['Remembering it', 'Rewatch to refresh', 'Short repeats of what you missed'],
            ].map((r) => (
              <tr key={r[0]} className="border-b border-[#1F4D3A]/10 last:border-0">
                <th scope="row" className="px-5 py-4 font-medium">{r[0]}</th>
                <td className="px-5 py-4 text-[#1F4D3A]/60">{r[1]}</td>
                <td className="px-5 py-4 font-medium">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    {/* SEO: course catalogue */}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "ItemList", "name": "ExcelPanda courses", "itemListElement": [{"@type": "ListItem", "position": 1, "item": {"@type": "Course", "name": "Excel Basics", "description": "From your first formula to pivot tables and dashboards.", "provider": {"@type": "Organization", "name": "ExcelPanda", "sameAs": "https://www.excelpanda.org"}, "isAccessibleForFree": true, "inLanguage": "en"}}, {"@type": "ListItem", "position": 2, "item": {"@type": "Course", "name": "Formulas & Functions", "description": "Logic, text, dates, lookups and stats: the functions that do most real work.", "provider": {"@type": "Organization", "name": "ExcelPanda", "sameAs": "https://www.excelpanda.org"}, "isAccessibleForFree": true, "inLanguage": "en"}}, {"@type": "ListItem", "position": 3, "item": {"@type": "Course", "name": "Data Analysis & Pivots", "description": "Tables, cleaning, PivotTables, charts and what-if analysis.", "provider": {"@type": "Organization", "name": "ExcelPanda", "sameAs": "https://www.excelpanda.org"}, "isAccessibleForFree": true, "inLanguage": "en"}}, {"@type": "ListItem", "position": 4, "item": {"@type": "Course", "name": "Advanced Formulas", "description": "Dynamic arrays, LET, LAMBDA, regex and the modern way to write formulas.", "provider": {"@type": "Organization", "name": "ExcelPanda", "sameAs": "https://www.excelpanda.org"}, "isAccessibleForFree": true, "inLanguage": "en"}}, {"@type": "ListItem", "position": 5, "item": {"@type": "Course", "name": "Data & Dashboards", "description": "Power Query, data models with DAX, and dashboards that refresh in one click.", "provider": {"@type": "Organization", "name": "ExcelPanda", "sameAs": "https://www.excelpanda.org"}, "isAccessibleForFree": true, "inLanguage": "en"}}, {"@type": "ListItem", "position": 6, "item": {"@type": "Course", "name": "Excel for Finance", "description": "Loans, NPV and IRR, budgets, financial statements and robust models.", "provider": {"@type": "Organization", "name": "ExcelPanda", "sameAs": "https://www.excelpanda.org"}, "isAccessibleForFree": true, "inLanguage": "en"}}, {"@type": "ListItem", "position": 7, "item": {"@type": "Course", "name": "Excel Automation", "description": "Shortcuts, macros, VBA, Office Scripts and Power Automate.", "provider": {"@type": "Organization", "name": "ExcelPanda", "sameAs": "https://www.excelpanda.org"}, "isAccessibleForFree": true, "inLanguage": "en"}}]}) }} />

    {/* SEO: FAQ */}
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
      <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">Excel learning questions, answered</h2>
      <div className="mt-12 divide-y divide-[#1F4D3A]/10 border-y border-[#1F4D3A]/10">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
              {f.q}
              <span className="text-2xl font-light text-[#FF8A5B] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-[#1F4D3A]/70">{f.a}</p>
          </details>
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
