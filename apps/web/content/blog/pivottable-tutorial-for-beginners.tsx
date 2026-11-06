import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) => `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=pivottable-tutorial-for-beginners`;

const S = {
  what: { id: 'what-is-a-pivottable', title: 'What a PivotTable does' },
  prep: { id: 'get-your-data-ready', title: 'Get your data ready' },
  build: { id: 'build-your-first-pivottable', title: 'Build your first PivotTable' },
  areas: { id: 'the-four-areas', title: 'The four areas of the field list' },
  tweak: { id: 'common-tweaks', title: 'Four tweaks you will use all the time' },
  refresh: { id: 'refresh-after-data-changes', title: 'Refresh after the data changes' },
  mistakes: { id: 'common-mistakes', title: 'Common mistakes' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What is a PivotTable in Excel?',
    answer:
      'A PivotTable is a tool that summarises a large table of data. You drag fields into rows, columns and values, and Excel totals, counts or averages the data for you without writing formulas.',
  },
  {
    question: 'Do PivotTables change my original data?',
    answer: 'No. A PivotTable reads your data and shows a summary. Your source table stays exactly as it was.',
  },
  {
    question: 'Why is my PivotTable not updating?',
    answer:
      'PivotTables do not always refresh on their own. Right-click the PivotTable and choose Refresh, or use the Refresh button on the PivotTable Analyze tab.',
  },
  {
    question: 'Why does my PivotTable count instead of sum?',
    answer:
      'Excel counts a field when the column contains text or blank cells. Clean the column so it holds only numbers, then set the value field to Sum.',
  },
  {
    question: 'PivotTable or formulas like SUMIFS?',
    answer:
      'Use a PivotTable when you want to explore and slice data quickly. Use SUMIFS when you need a fixed result in a specific cell that other formulas depend on.',
  },
];

const Body = () => (
  <>
    <Callout title="The short version">
      <p>
        Click inside your data, choose <strong>Insert, then PivotTable</strong>, and drag fields into Rows and Values. In a minute you
        get totals by category, with no formulas.
      </p>
    </Callout>

    <H2 section={S.what} />
    <p>
      Imagine a sales list with thousands of rows. You want total sales per region, or per product, or per month. Writing a formula
      for each is slow. A PivotTable builds that summary for you and lets you rearrange it by dragging fields around.
    </p>

    <H2 section={S.prep} />
    <p>PivotTables work best on tidy data. Before you start, check that:</p>
    <ul>
      <li>Every column has a heading in the first row, and no two headings are the same.</li>
      <li>There are no completely blank rows or columns in the middle of the data.</li>
      <li>Each column holds one kind of thing: all numbers, all dates or all text.</li>
      <li>There are no merged cells or subtotal rows inside the data.</li>
    </ul>
    <p>
      Turning the range into an Excel Table first (select it and press <code>Ctrl+T</code>) is a good habit, because the PivotTable
      then grows with your data.
    </p>

    <H2 section={S.build} />
    <ol>
      <li>Click any cell in your data.</li>
      <li>
        On the <strong>Insert</strong> tab, choose <strong>PivotTable</strong>.
      </li>
      <li>Check the range is right, choose a new worksheet, then select OK.</li>
      <li>
        In the field list, drag <strong>Region</strong> into Rows and <strong>Sales</strong> into Values.
      </li>
    </ol>
    <p>You now have one total per region. Drag another field, such as Product, into Columns to split each region further.</p>

    <H2 section={S.areas} />
    <ComparisonTable
      caption="PivotTable field list areas"
      columns={[
        { key: 'area', label: 'Area' },
        { key: 'what', label: 'What it does' },
        { key: 'example', label: 'Example' },
      ]}
      rows={[
        { id: 'rows', cells: { area: 'Rows', what: 'Lists each item down the side', example: 'One row per region' } },
        { id: 'cols', cells: { area: 'Columns', what: 'Spreads items across the top', example: 'One column per year' } },
        { id: 'values', cells: { area: 'Values', what: 'The numbers you total, count or average', example: 'Sum of sales' } },
        { id: 'filters', cells: { area: 'Filters', what: 'Lets you show part of the data', example: 'Only one sales rep' } },
      ]}
    />
    <PostCta
      heading="Build PivotTables with instant feedback"
      body="Practise real PivotTable tasks in short hands-on lessons that check your result as you go."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.tweak} />
    <ul>
      <li>
        <strong>Change Sum to Count or Average.</strong> Click the value field, choose Value Field Settings and pick the calculation.
      </li>
      <li>
        <strong>Group dates.</strong> Right-click a date in the PivotTable and choose Group to summarise by month, quarter or year.
      </li>
      <li>
        <strong>Sort.</strong> Right-click a value and sort largest to smallest to see your top performers first.
      </li>
      <li>
        <strong>Show values as a percentage.</strong> In Value Field Settings, use Show Values As to see each item as a share of the
        total.
      </li>
    </ul>

    <H2 section={S.refresh} />
    <p>
      If you change or add data, the PivotTable does not always update by itself. Right-click it and choose{' '}
      <strong>Refresh</strong>. If you added new rows outside a Table, you may also need to change the source range.
    </p>

    <H2 section={S.mistakes} />
    <ul>
      <li>
        <strong>Blank cells or text in a number column.</strong> Excel counts the column instead of summing it.
      </li>
      <li>
        <strong>Forgetting to refresh.</strong> The numbers look right but are out of date.
      </li>
      <li>
        <strong>Typing over a PivotTable.</strong> Edit the source data, not the summary.
      </li>
    </ul>
    <p>
      Want a plan for learning PivotTables alongside everything else? See our{' '}
      <Link href="/blog/learn-excel-fast-30-day-plan">30-day Excel plan</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Turn rows of data into answers"
      body="Short hands-on lessons, instant feedback and spaced review of what you missed."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Menu names can differ slightly between Excel versions. ExcelPanda is not affiliated with or endorsed by Microsoft. Microsoft and
      Excel are trademarks of the Microsoft group of companies.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'pivottable-tutorial-for-beginners',
  title: 'PivotTable Tutorial for Beginners: Summarise Data in 5 Minutes',
  seoTitle: 'Excel PivotTable Tutorial for Beginners (Step by Step)',
  description:
    'Learn how to create an Excel PivotTable step by step: prepare your data, drag fields, group dates, refresh and avoid the common mistakes.',
  publishedAt: '2026-11-05T10:00:00+01:00',
  updatedAt: '2026-11-05T10:00:00+01:00',
  author: { name: 'ExcelPanda Team', url: 'https://www.excelpanda.org' },
  heroImage: '/blog/pivottable-tutorial-hero.png',
  category: 'Tutorials',
  keywords: ['Excel PivotTable tutorial', 'how to make a pivot table', 'pivot table for beginners', 'Excel pivot table'],
  readingMinutes: 5,
  sections: Object.values(S),
  faqs,
  Body,
};
