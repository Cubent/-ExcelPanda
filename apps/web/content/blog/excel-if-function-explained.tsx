import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) => `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=excel-if-function-explained`;

const S = {
  basic: { id: 'the-basic-if', title: 'The basic IF formula' },
  ops: { id: 'comparison-operators', title: 'Comparison operators' },
  andor: { id: 'and-and-or', title: 'Combine conditions with AND and OR' },
  nested: { id: 'nested-if', title: 'Nested IF and the easier IFS' },
  errors: { id: 'handle-errors-with-iferror', title: 'Handle errors with IFERROR' },
  mistakes: { id: 'common-mistakes', title: 'Common mistakes' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What does the IF function do in Excel?',
    answer: 'IF tests a condition and returns one value if it is true and another if it is false.',
  },
  {
    question: 'How many IFs can I nest?',
    answer:
      'Modern versions of Excel allow many levels of nesting, but long chains are hard to read. IFS or a lookup table is usually clearer.',
  },
  {
    question: 'Which versions have IFS?',
    answer: 'IFS is available in Excel 2019 and later and in Microsoft 365. It is not in Excel 2016 or earlier.',
  },
  {
    question: 'Why does my IF return the wrong result?',
    answer:
      'Common causes are numbers stored as text, extra spaces in text, or a condition that is the wrong way round. Check the cell values and the order of your tests.',
  },
  {
    question: 'Can IF check text?',
    answer:
      'Yes. Put the text in quotation marks, for example =IF(A2="Paid","Done","Chase"). Text comparisons ignore upper and lower case.',
  },
];

const Body = () => (
  <>
    <Callout title="The short version">
      <p>
        <code>=IF(test, value_if_true, value_if_false)</code>. Write the test first, then what you want when it is true, then what
        you want when it is not.
      </p>
    </Callout>

    <H2 section={S.basic} />
    <p>Say column B holds exam scores and you want to mark each one Pass or Fail, with 50 as the pass mark:</p>
    <pre>
      <code>{'=IF(B2>=50, "Pass", "Fail")'}</code>
    </pre>
    <p>
      Excel checks whether B2 is at least 50. If it is, the cell shows Pass. If not, it shows Fail. Copy the formula down the column
      and every row is marked.
    </p>

    <H2 section={S.ops} />
    <ComparisonTable
      caption="Comparison operators"
      columns={[
        { key: 'op', label: 'Operator' },
        { key: 'meaning', label: 'Meaning' },
        { key: 'example', label: 'Example' },
      ]}
      rows={[
        { id: 'eq', cells: { op: '=', meaning: 'Equal to', example: 'A2="Paid"' } },
        { id: 'ne', cells: { op: '<>', meaning: 'Not equal to', example: 'A2<>"Paid"' } },
        { id: 'gt', cells: { op: '>', meaning: 'Greater than', example: 'B2>100' } },
        { id: 'ge', cells: { op: '>=', meaning: 'Greater than or equal to', example: 'B2>=50' } },
        { id: 'lt', cells: { op: '<', meaning: 'Less than', example: 'B2<10' } },
        { id: 'le', cells: { op: '<=', meaning: 'Less than or equal to', example: 'B2<=10' } },
      ]}
    />

    <H2 section={S.andor} />
    <p>Use AND when every condition must be true, and OR when any one is enough.</p>
    <pre>
      <code>{'=IF(AND(B2>=50, C2>=50), "Pass", "Fail")'}</code>
    </pre>
    <pre>
      <code>{'=IF(OR(D2="Gold", D2="Silver"), "Discount", "No discount")'}</code>
    </pre>
    <PostCta
      heading="Practise IF until it feels natural"
      body="Short hands-on lessons let you write the formula yourself and check it instantly."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.nested} />
    <p>To grade scores as A, B or C you can put an IF inside another IF:</p>
    <pre>
      <code>{'=IF(B2>=80, "A", IF(B2>=60, "B", "C"))'}</code>
    </pre>
    <p>Excel tests the conditions in order and stops at the first true one. With more levels, IFS reads more cleanly:</p>
    <pre>
      <code>{'=IFS(B2>=80, "A", B2>=60, "B", TRUE, "C")'}</code>
    </pre>
    <p>The final TRUE acts as a catch-all for everything that did not match earlier.</p>

    <H2 section={S.errors} />
    <p>
      If a formula might return an error, wrap it in <code>IFERROR</code> to show something friendlier:
    </p>
    <pre>
      <code>{'=IFERROR(B2/C2, 0)'}</code>
    </pre>

    <H2 section={S.mistakes} />
    <ul>
      <li>
        <strong>Forgetting quotation marks around text.</strong> Write "Pass", not Pass.
      </li>
      <li>
        <strong>Wrong order in nested IFs.</strong> Test the strictest condition first, or an early test will catch everything.
      </li>
      <li>
        <strong>Numbers stored as text.</strong> They look like numbers but do not compare as numbers.
      </li>
    </ul>
    <p>
      Once IF is comfortable, move on to counting and summing with conditions, as laid out in our{' '}
      <Link href="/blog/learn-excel-fast-30-day-plan">30-day Excel plan</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Make Excel decide for you"
      body="Short hands-on lessons, instant feedback and spaced review of what you missed."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      ExcelPanda is not affiliated with or endorsed by Microsoft. Microsoft and Excel are trademarks of the Microsoft group of
      companies.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'excel-if-function-explained',
  title: 'Excel IF Function Explained: Examples for Beginners',
  seoTitle: 'Excel IF Function Explained (With Simple Examples)',
  description:
    'Learn the Excel IF function with clear examples: basic IF, AND and OR, nested IF, IFS and IFERROR, plus the mistakes that trip people up.',
  publishedAt: '2026-11-05T10:05:00+01:00',
  updatedAt: '2026-11-05T10:05:00+01:00',
  author: { name: 'ExcelPanda Team', url: 'https://www.excelpanda.org' },
  heroImage: '/blog/excel-if-function-hero.png',
  category: 'Tutorials',
  keywords: ['Excel IF function', 'IF formula Excel', 'nested IF', 'IFS function', 'Excel IF AND OR'],
  readingMinutes: 5,
  sections: Object.values(S),
  faqs,
  Body,
};
