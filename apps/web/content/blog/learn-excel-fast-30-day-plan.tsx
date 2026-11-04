import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) => `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=learn-excel-fast-30-day-plan`;

const S = {
  rules: { id: 'rules-that-make-it-stick', title: 'Four rules that make it stick' },
  overview: { id: 'the-plan-at-a-glance', title: 'The 30-day plan at a glance' },
  w1: { id: 'week-1-the-basics', title: 'Week 1: the basics' },
  w2: { id: 'week-2-logic-text-and-dates', title: 'Week 2: logic, text and dates' },
  w3: { id: 'week-3-lookups-and-clean-data', title: 'Week 3: lookups and clean data' },
  w4: { id: 'week-4-pivottables-charts-and-speed', title: 'Week 4: PivotTables, charts and speed' },
  day: { id: 'what-a-15-minute-day-looks-like', title: 'What a 15-minute day looks like' },
  after: { id: 'after-30-days', title: 'After 30 days' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'How long does it take to learn Excel?',
    answer:
      'Most people can handle everyday tasks like formulas, formatting and simple charts within a few weeks of short daily practice. Lookups, PivotTables and data cleaning take a little longer.',
  },
  {
    question: 'Can I learn Excel in 30 days?',
    answer:
      'You can get comfortable with the skills used most at work: formulas, lookups, cleaning data, PivotTables and charts. Mastery takes longer, but 30 days of regular practice builds a solid base.',
  },
  {
    question: 'How much should I practise each day?',
    answer: 'Fifteen focused minutes is enough if you do it every day. Regular short sessions beat one long weekend session.',
  },
  {
    question: 'Which Excel functions should I learn first?',
    answer:
      'SUM, IF, COUNTIF and a lookup function cover a large share of real work. After those, learn SUMIFS, text functions and PivotTables. See [XLOOKUP vs VLOOKUP](/blog/xlookup-vs-vlookup) for the lookup choice.',
  },
  {
    question: 'Do I need Excel installed to follow this plan?',
    answer: 'You need somewhere to practise. ExcelPanda lessons run in the browser, so there is nothing to install.',
  },
];

const Body = () => (
  <>
    <Callout title="The short version">
      <p>
        Spend 15 minutes a day for four weeks: basics first, then logic and text, then lookups and clean data, then PivotTables and
        charts. Type every formula yourself, and review what you get wrong.
      </p>
    </Callout>

    <p>
      Learning Excel feels slow when you try to do everything at once. This plan splits it into four weeks, each built around the
      skills people use most at work. Nothing here needs a long session. What matters is doing a little every day, in a real
      spreadsheet, and checking your answers.
    </p>

    <H2 section={S.rules} />
    <ol>
      <li>
        <strong>Type it, do not copy it.</strong> Writing the formula yourself is what builds memory.
      </li>
      <li>
        <strong>Use real data.</strong> A budget, a class list or a sales report you care about beats a perfect textbook example.
      </li>
      <li>
        <strong>Keep a list of mistakes.</strong> Revisit the formulas you got wrong a few days later. This spaced review is where the
        learning sticks.
      </li>
      <li>
        <strong>Do not skip days.</strong> Short and regular wins.
      </li>
    </ol>

    <H2 section={S.overview} />
    <ComparisonTable
      caption="30-day Excel plan"
      columns={[
        { key: 'week', label: 'Week' },
        { key: 'focus', label: 'Focus' },
        { key: 'skills', label: 'You will be able to' },
      ]}
      rows={[
        { id: '1', cells: { week: '1', focus: 'The basics', skills: 'Enter data, write formulas, copy them correctly and format a sheet' } },
        { id: '2', cells: { week: '2', focus: 'Logic, text and dates', skills: 'Make decisions with IF, count and sum with conditions, and clean text' } },
        { id: '3', cells: { week: '3', focus: 'Lookups and clean data', skills: 'Pull data between tables, sort and filter, remove duplicates' } },
        { id: '4', cells: { week: '4', focus: 'PivotTables, charts, speed', skills: 'Summarise thousands of rows, chart them and work faster with shortcuts' } },
      ]}
    />

    <H2 section={S.w1} />
    <ul>
      <li>
        <strong>Days 1 to 2:</strong> the grid, cells, ranges and entering data. Learn to select quickly.
      </li>
      <li>
        <strong>Days 3 to 4:</strong> your first formulas: <code>SUM</code>, <code>AVERAGE</code>, <code>MIN</code>,{' '}
        <code>MAX</code> and <code>COUNT</code>.
      </li>
      <li>
        <strong>Day 5:</strong> relative and absolute references, the dollar signs that stop formulas breaking when you copy them.
      </li>
      <li>
        <strong>Days 6 to 7:</strong> formatting numbers, dates and currency, and a mini review of the week.
      </li>
    </ul>

    <H2 section={S.w2} />
    <ul>
      <li>
        <strong>Days 8 to 10:</strong> <code>IF</code>, with <code>AND</code> and <code>OR</code>, then nested conditions.
      </li>
      <li>
        <strong>Days 11 to 12:</strong> <code>COUNTIF</code>, <code>SUMIF</code> and their multi-condition versions,{' '}
        <code>COUNTIFS</code> and <code>SUMIFS</code>.
      </li>
      <li>
        <strong>Days 13 to 14:</strong> text functions (<code>LEFT</code>, <code>RIGHT</code>, <code>TRIM</code>) and working with dates.
      </li>
    </ul>
    <PostCta
      heading="Do the plan in a real spreadsheet"
      body="Each ExcelPanda lesson drops you into a sheet with one small goal and checks your answer as you type."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.w3} />
    <ul>
      <li>
        <strong>Days 15 to 17:</strong> lookups. Learn one thoroughly. Our{' '}
        <Link href="/blog/xlookup-vs-vlookup">XLOOKUP vs VLOOKUP guide</Link> helps you choose.
      </li>
      <li>
        <strong>Days 18 to 19:</strong> sorting, filtering and turning a range into an Excel Table.
      </li>
      <li>
        <strong>Days 20 to 21:</strong> cleaning messy data: remove duplicates, split text into columns and fix inconsistent entries.
      </li>
    </ul>

    <H2 section={S.w4} />
    <ul>
      <li>
        <strong>Days 22 to 25:</strong> PivotTables: build one, group dates, add a second field and refresh after the data changes.
      </li>
      <li>
        <strong>Days 26 to 27:</strong> charts: pick the right type, label it clearly and keep it simple.
      </li>
      <li>
        <strong>Days 28 to 29:</strong> keyboard shortcuts for selecting, copying and formatting without the mouse.
      </li>
      <li>
        <strong>Day 30:</strong> a mini project. Take a real dataset, clean it, summarise it with a PivotTable and chart the result.
      </li>
    </ul>

    <H2 section={S.day} />
    <ol>
      <li>Two minutes: redo one formula from your mistakes list.</li>
      <li>Ten minutes: the day’s new skill, typed out in a sheet.</li>
      <li>Three minutes: write down one thing you got wrong or found confusing.</li>
    </ol>

    <H2 section={S.after} />
    <p>
      After the 30 days, choose your direction. If you want to automate work, learn Power Query and macros. If you work with
      numbers, move on to finance functions and modelling. If you want a credential, our{' '}
      <Link href="/blog/mo-201-excel-expert-exam-prep">MO-201 Excel Expert preparation guide</Link> covers what an advanced exam tests.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Start day one today"
      body="Short hands-on lessons, instant feedback and spaced review of what you missed, so the skills stay with you."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      This plan is a general study template, not a guarantee of results. How quickly you progress depends on your starting point and
      how regularly you practise. ExcelPanda is not affiliated with or endorsed by Microsoft. Microsoft and Excel are trademarks of the
      Microsoft group of companies.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'learn-excel-fast-30-day-plan',
  title: 'How to Learn Excel Fast: A 30-Day Plan (15 Minutes a Day)',
  seoTitle: 'Learn Excel Fast: A 30-Day Plan (15 Minutes a Day)',
  description:
    'A four-week plan to learn Excel in 30 days with 15 minutes a day: basics, logic, lookups, PivotTables and charts, with a daily routine that sticks.',
  publishedAt: '2026-11-04T10:10:00+01:00',
  updatedAt: '2026-11-04T10:10:00+01:00',
  author: { name: 'ExcelPanda Team', url: 'https://www.excelpanda.org' },
  category: 'Learning plans',
  keywords: ['learn Excel fast', 'learn Excel in 30 days', 'Excel study plan', 'Excel for beginners', 'how to learn Excel'],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
