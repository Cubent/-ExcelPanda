import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) => `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=xlookup-vs-vlookup`;

const S = {
  short: { id: 'the-short-answer', title: 'The short answer' },
  table: { id: 'side-by-side', title: 'XLOOKUP vs VLOOKUP side by side' },
  problems: { id: 'what-goes-wrong-with-vlookup', title: 'What goes wrong with VLOOKUP' },
  fixes: { id: 'what-xlookup-fixes', title: 'What XLOOKUP fixes' },
  convert: { id: 'convert-a-vlookup', title: 'How to convert a VLOOKUP to XLOOKUP' },
  still: { id: 'when-to-still-use-vlookup', title: 'When to still use VLOOKUP' },
  extras: { id: 'xlookup-extras', title: 'Three XLOOKUP tricks worth learning' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Is XLOOKUP better than VLOOKUP?',
    answer:
      'For most work, yes. It looks in any direction, returns an exact match by default, does not break when you insert columns and handles missing values with a built-in argument. VLOOKUP is still useful when you must support older versions of Excel.',
  },
  {
    question: 'Which versions of Excel have XLOOKUP?',
    answer:
      'XLOOKUP is in Excel for Microsoft 365, Excel 2021 and Excel for the web. It is not in Excel 2019, 2016 or earlier.',
  },
  {
    question: 'Will VLOOKUP stop working?',
    answer: 'There is no sign of that. VLOOKUP still works in every version, and files that use it keep working.',
  },
  {
    question: 'Why does my lookup return the wrong value?',
    answer:
      'With VLOOKUP the usual cause is the final argument. If you leave it out, Excel does an approximate match, so add FALSE (or 0) when you need an exact match.',
  },
  {
    question: 'Should I learn VLOOKUP at all?',
    answer:
      'Yes, briefly. You will meet it in older workbooks and in exams built on older Office versions, such as [MO-201](/blog/mo-201-excel-expert-exam-prep).',
  },
];

const Body = () => (
  <>
    <Callout title="The short answer">
      <p>
        Use <code>XLOOKUP</code> if your version of Excel has it. It is simpler, safer and more flexible. Use{' '}
        <code>VLOOKUP</code> only when the file has to work in Excel 2019 or earlier, or when you are reading an older workbook.
      </p>
    </Callout>

    <H2 section={S.short} />
    <p>
      Both functions find a value in a list and return something from the same row. The difference is how much can go wrong along the
      way. VLOOKUP needs a column number and an extra argument to avoid approximate matching. XLOOKUP asks for the column you search
      and the column you want back, and it defaults to an exact match.
    </p>

    <H2 section={S.table} />
    <ComparisonTable
      caption="XLOOKUP vs VLOOKUP"
      columns={[
        { key: 'feature', label: 'Feature' },
        { key: 'vlookup', label: 'VLOOKUP' },
        { key: 'xlookup', label: 'XLOOKUP' },
      ]}
      rows={[
        { id: 'dir', cells: { feature: 'Search direction', vlookup: 'Looks right only', xlookup: 'Looks left or right' } },
        { id: 'default', cells: { feature: 'Default match', vlookup: 'Approximate', xlookup: 'Exact' } },
        { id: 'insert', cells: { feature: 'Inserting a column', vlookup: 'Can break the column number', xlookup: 'Keeps working' } },
        { id: 'missing', cells: { feature: 'Value not found', vlookup: 'Needs IFERROR around it', xlookup: 'Built-in if_not_found argument' } },
        { id: 'last', cells: { feature: 'Search from the bottom', vlookup: 'Not possible directly', xlookup: 'search_mode of -1' } },
        { id: 'versions', cells: { feature: 'Available in', vlookup: 'Every version', xlookup: 'Microsoft 365, Excel 2021, Excel for the web' } },
      ]}
    />

    <H2 section={S.problems} />
    <p>Take a product list in columns A to C (SKU, item, price). To find the price for the SKU in E2, the classic formula is:</p>
    <pre>
      <code>{'=VLOOKUP(E2, A:C, 3, FALSE)'}</code>
    </pre>
    <ul>
      <li>
        <strong>The 3 is hard-coded.</strong> If someone inserts a column between A and C, the 3 now points at the wrong column and
        nothing warns you.
      </li>
      <li>
        <strong>It only looks right.</strong> The value you search for must be in the first column of the range. If the SKU is in
        column C and the price in A, you cannot use VLOOKUP without rearranging the sheet.
      </li>
      <li>
        <strong>The last argument is easy to forget.</strong> Leave out <code>FALSE</code> and Excel does an approximate match,
        which can quietly return the wrong row.
      </li>
    </ul>

    <H2 section={S.fixes} />
    <p>The same job in XLOOKUP:</p>
    <pre>
      <code>{'=XLOOKUP(E2, A:A, C:C, "Not found")'}</code>
    </pre>
    <p>
      You name the column to search (A:A) and the column to return (C:C), so inserting a column cannot shift what you get back, and
      the search column can sit anywhere. The fourth argument is what to show when nothing matches, so you no longer need to wrap
      the formula in <code>IFERROR</code>.
    </p>

    <H2 section={S.convert} />
    <ol>
      <li>
        Take the lookup value, the first argument of your VLOOKUP, and keep it as the first argument of XLOOKUP.
      </li>
      <li>
        Split the VLOOKUP table into two columns: the first column becomes the search range and the column you want back becomes the
        return range.
      </li>
      <li>Delete the column number and the TRUE or FALSE. Exact matching is the default.</li>
      <li>Add a friendly message as the fourth argument if you want one.</li>
    </ol>
    <PostCta
      heading="Practise lookups in a real spreadsheet"
      body="Write VLOOKUP and XLOOKUP formulas yourself in short hands-on lessons and get instant feedback when they are wrong."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.still} />
    <ul>
      <li>The workbook will be opened in Excel 2019, 2016 or earlier, which do not have XLOOKUP.</li>
      <li>You are maintaining an older workbook where VLOOKUP already works and rewriting it adds risk.</li>
      <li>
        You are preparing for an exam built on an older Office version. <Link href="/blog/mo-201-excel-expert-exam-prep">MO-201</Link>{' '}
        is based on Office 2019, so it tests VLOOKUP, HLOOKUP, INDEX and MATCH rather than XLOOKUP.
      </li>
    </ul>

    <H2 section={S.extras} />
    <ul>
      <li>
        <strong>Return several columns at once.</strong> Give XLOOKUP a return range of more than one column, such as{' '}
        <code>C:D</code>, and it spills both values into the cells next to the formula.
      </li>
      <li>
        <strong>Find the last match.</strong> Set the last argument (<code>search_mode</code>) to <code>-1</code> to search from the
        bottom up, useful for the most recent entry.
      </li>
      <li>
        <strong>Match with wildcards.</strong> Set <code>match_mode</code> to <code>2</code> to use <code>*</code> and{' '}
        <code>?</code> in the lookup value.
      </li>
    </ul>
    <p>
      Once lookups feel natural, the next skills to learn are <code>SUMIFS</code>, PivotTables and Power Query. Our{' '}
      <Link href="/blog/learn-excel-fast-30-day-plan">30-day Excel plan</Link> shows the order we recommend.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Stop guessing at formulas"
      body="Short lessons where you type the formula, see the result and learn why it works. Lookups, SUMIFS, PivotTables and more."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Function behaviour and availability are described in Microsoft’s documentation for{' '}
      <a href="https://support.microsoft.com/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929" target="_blank" rel="noopener noreferrer">
        XLOOKUP
      </a>
      . Confirm availability for your version of Excel before sharing a workbook. ExcelPanda is not affiliated with or endorsed by
      Microsoft.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'xlookup-vs-vlookup',
  title: 'XLOOKUP vs VLOOKUP: Which Should You Use?',
  seoTitle: 'XLOOKUP vs VLOOKUP: Differences and Which to Use',
  description:
    'XLOOKUP vs VLOOKUP compared side by side, with the formula for each, how to convert, and the cases where VLOOKUP is still the right choice.',
  publishedAt: '2026-11-04T10:05:00+01:00',
  updatedAt: '2026-11-04T10:05:00+01:00',
  author: { name: 'ExcelPanda Team', url: 'https://www.excelpanda.org' },
  heroImage: '/blog/xlookup-vs-vlookup-hero.png',
  category: 'Formulas',
  keywords: ['XLOOKUP vs VLOOKUP', 'XLOOKUP', 'VLOOKUP', 'Excel lookup functions', 'replace VLOOKUP with XLOOKUP'],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
