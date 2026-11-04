import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) => `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=mo-201-excel-expert-exam-prep`;

const S = {
  what: { id: 'what-is-mo-201', title: 'What is the MO-201 exam?' },
  glance: { id: 'exam-at-a-glance', title: 'The MO-201 exam at a glance' },
  version: { id: 'the-office-2019-trap', title: 'The Office 2019 trap that catches people out' },
  workbook: { id: 'manage-workbook-options-and-settings', title: 'Manage workbook options and settings (15-20%)' },
  format: { id: 'manage-and-format-data', title: 'Manage and format data (20-25%)' },
  formulas: { id: 'create-advanced-formulas-and-macros', title: 'Create advanced formulas and macros (30-35%)' },
  charts: { id: 'manage-advanced-charts-and-tables', title: 'Manage advanced charts and tables (25-30%)' },
  plan: { id: 'four-week-study-plan', title: 'A 4-week MO-201 study plan' },
  exam: { id: 'exam-day-tips', title: 'Exam-day tips for a task-based test' },
  help: { id: 'how-excelpanda-fits', title: 'Where ExcelPanda fits in your preparation' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What is the MO-201 exam?',
    answer:
      'MO-201 is the Microsoft Office Specialist: Excel Expert (Office 2019) exam. It is a hands-on test where you complete tasks in Excel, not a multiple-choice quiz.',
  },
  {
    question: 'Is XLOOKUP on the MO-201 exam?',
    answer:
      'MO-201 is built on Office 2019, which does not include XLOOKUP. Prepare with VLOOKUP, HLOOKUP, INDEX and MATCH. See [XLOOKUP vs VLOOKUP](/blog/xlookup-vs-vlookup) for how they differ.',
  },
  {
    question: 'What are the MO-201 skill areas?',
    answer:
      'Microsoft lists four: manage workbook options and settings (15-20%), manage and format data (20-25%), create advanced formulas and macros (30-35%), and manage advanced charts and tables (25-30%).',
  },
  {
    question: 'How long should I prepare for MO-201?',
    answer:
      'If you already use Excel most days, about four weeks of focused practice is a sensible starting point. If advanced formulas, PivotTables and macros are new to you, allow longer.',
  },
  {
    question: 'How much does the MO-201 exam cost?',
    answer:
      'Microsoft says the price depends on the country or region where you sit the exam, so check the price when you book.',
  },
  {
    question: 'Is there a Microsoft 365 version of the Excel Expert exam?',
    answer:
      'Microsoft’s MO-201 page is for Office 2019 and does not mention Microsoft 365. Check Microsoft Learn for the current exam list before you book.',
  },
];

const Body = () => (
  <>
    <Callout title="The short version">
      <p>
        MO-201 is Microsoft’s hands-on Excel Expert exam, built on Office 2019. About a third of the marks sit in advanced formulas
        and macros, so spend most of your time there, practise on Excel 2019 features, and drill the tasks under time pressure.
      </p>
    </Callout>

    <H2 section={S.what} />
    <p>
      MO-201 is the exam for the <strong>Microsoft Office Specialist: Excel Expert (Office 2019)</strong> certification. It sits above
      the associate-level Excel exam and focuses on the skills people use in real analysis work: custom formatting, advanced
      formulas, macros, PivotTables and advanced charts. Instead of choosing answers, you carry out tasks inside Excel, so knowing a
      feature exists is not enough. You have to be able to do it quickly, using the ribbon and dialogs.
    </p>

    <H2 section={S.glance} />
    <ComparisonTable
      caption="MO-201 at a glance"
      columns={[
        { key: 'item', label: 'Item' },
        { key: 'detail', label: 'Detail' },
      ]}
      rows={[
        { id: 'exam', cells: { item: 'Exam', detail: 'MO-201: Microsoft Excel Expert (Office 2019)' } },
        { id: 'format', cells: { item: 'Format', detail: 'Hands-on tasks completed in Excel' } },
        { id: 'a', cells: { item: 'Manage workbook options and settings', detail: '15-20%' } },
        { id: 'b', cells: { item: 'Manage and format data', detail: '20-25%' } },
        { id: 'c', cells: { item: 'Create advanced formulas and macros', detail: '30-35%' } },
        { id: 'd', cells: { item: 'Manage advanced charts and tables', detail: '25-30%' } },
        { id: 'lang', cells: { item: 'Languages', detail: 'English, Spanish, French, German, Japanese, Korean, Chinese (Simplified and Traditional)' } },
      ]}
      footnote="Skill areas, weightings and languages are from Microsoft Learn. Many prep sources report about 50 minutes and a 700 out of 1,000 pass mark, but Microsoft’s exam page does not state either, so confirm both when you book."
    />

    <H2 section={S.version} />
    <p>
      The biggest mistake is practising on the wrong version of Excel. MO-201 is an <strong>Office 2019</strong> exam. Many modern
      features are not in Excel 2019, including <code>XLOOKUP</code>, dynamic array functions such as <code>FILTER</code> and{' '}
      <code>UNIQUE</code>, and <code>LET</code>. If you learned Excel on Microsoft 365, you can arrive at the exam with habits that
      do not work there.
    </p>
    <ul>
      <li>
        <strong>Use:</strong> <code>VLOOKUP</code>, <code>HLOOKUP</code>, <code>INDEX</code> with <code>MATCH</code>,{' '}
        <code>IFS</code>, <code>SWITCH</code>, <code>MAXIFS</code>, <code>MINIFS</code>, <code>CONCAT</code> and{' '}
        <code>TEXTJOIN</code>, all available in Excel 2019.
      </li>
      <li>
        <strong>Know the difference:</strong> read <Link href="/blog/xlookup-vs-vlookup">XLOOKUP vs VLOOKUP</Link> so you can
        recognise both, but lean on the older lookups for this exam.
      </li>
    </ul>

    <H2 section={S.workbook} />
    <p>The smallest section, but the quickest marks if you have practised the settings screens.</p>
    <ul>
      <li>Workbook properties, protection and what each protection option actually locks.</li>
      <li>Excel options: calculation mode, default fonts, formula settings and the Quick Access Toolbar.</li>
      <li>Managing macros and trust settings, and saving a workbook in the right format.</li>
      <li>Data connections and refreshing external data.</li>
    </ul>

    <H2 section={S.format} />
    <ul>
      <li>Custom number formats, including showing thousands or millions and formatting by value.</li>
      <li>Conditional formatting driven by a formula, not just the built-in presets.</li>
      <li>Data validation lists and custom rules, plus advanced sorting and filtering.</li>
      <li>Flash Fill, text to columns, grouping, subtotals and removing duplicates.</li>
    </ul>

    <H2 section={S.formulas} />
    <p>
      This is the heaviest section, so it deserves roughly a third of your study time. Practise building each formula from scratch
      until you can do it without looking anything up.
    </p>
    <ul>
      <li>Lookups: <code>VLOOKUP</code>, <code>HLOOKUP</code>, <code>INDEX</code> and <code>MATCH</code>, including approximate matches.</li>
      <li>Logic and aggregation: nested <code>IF</code>, <code>IFS</code>, <code>SWITCH</code>, <code>SUMIFS</code>, <code>COUNTIFS</code>, <code>MAXIFS</code>.</li>
      <li>Dates and text: date arithmetic, <code>TEXT</code>, <code>TEXTJOIN</code> and <code>CONCAT</code>.</li>
      <li>Financial and what-if tools: <code>PMT</code>, Goal Seek, Scenario Manager and data tables.</li>
      <li>Named ranges, formula auditing and fixing errors.</li>
      <li>Recording, running and editing simple macros.</li>
    </ul>

    <H2 section={S.charts} />
    <ul>
      <li>PivotTables: grouping, calculated fields, slicers and timelines, and refreshing after the data changes.</li>
      <li>PivotCharts and keeping them tied to the table.</li>
      <li>Combination charts, secondary axes, trendlines and other advanced chart options.</li>
      <li>Excel Tables: structured references, total rows and table styles.</li>
    </ul>

    <PostCta
      heading="Build the skills the exam tests"
      body="Short hands-on lessons on lookups, PivotTables, conditional formatting, Power Query and VBA, in a real spreadsheet with instant feedback."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.plan} />
    <ul>
      <li>
        <strong>Week 1, formulas:</strong> lookups, <code>IFS</code>, <code>SUMIFS</code>, dates and text. Rebuild each from a blank
        sheet.
      </li>
      <li>
        <strong>Week 2, data and formatting:</strong> custom formats, formula-based conditional formatting, validation, advanced
        filters.
      </li>
      <li>
        <strong>Week 3, PivotTables and charts:</strong> every PivotTable option, then advanced charts and Excel Tables.
      </li>
      <li>
        <strong>Week 4, macros, settings and timed practice:</strong> workbook options, macro recording, then full timed run-throughs
        of mixed tasks. Review every miss.
      </li>
    </ul>

    <H2 section={S.exam} />
    <ul>
      <li>Read the whole task before touching the sheet. Many tasks contain two or three small requirements.</li>
      <li>Use the method you know best. A task is scored on the result, so a quick, reliable route beats a clever one.</li>
      <li>If a task is eating your time, move on and come back. Do not leave it half-done and forget it.</li>
      <li>Check your work against each part of the instruction before you finish.</li>
    </ul>

    <H2 section={S.help} />
    <p>
      ExcelPanda is not an official MO-201 course and is not affiliated with Microsoft. What it does give you is regular, hands-on
      practice in the same kind of skills: lookups, PivotTables, conditional formatting, Power Query and VBA, in short lessons you
      can do in a few minutes a day. Use it to build speed and confidence, and pair it with Microsoft’s official skills outline so
      you cover every objective.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Practise a little every day"
      body="Fifteen minutes of hands-on Excel beats a weekend cram. Start with the lessons that match your weakest section."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Exam details are from{' '}
      <a href="https://learn.microsoft.com/en-us/credentials/certifications/exams/mo-201/" target="_blank" rel="noopener noreferrer">
        Microsoft Learn
      </a>
      . Exams change, so confirm the current skills outline, price and format with Microsoft before you book. ExcelPanda is not
      affiliated with or endorsed by Microsoft. Microsoft and Excel are trademarks of the Microsoft group of companies.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'mo-201-excel-expert-exam-prep',
  title: 'How to Prepare for the MO-201 Excel Expert Exam',
  seoTitle: 'MO-201 Excel Expert Exam: How to Prepare (4-Week Plan)',
  description:
    'What the MO-201 Excel Expert exam covers, the Office 2019 trap to avoid, and a 4-week study plan for formulas, PivotTables, charts and macros.',
  publishedAt: '2026-11-04T10:00:00+01:00',
  updatedAt: '2026-11-04T10:00:00+01:00',
  author: { name: 'ExcelPanda Team', url: 'https://www.excelpanda.org' },
  category: 'Certification',
  keywords: ['MO-201', 'MO-201 exam', 'Excel Expert exam', 'MOS Excel Expert', 'Microsoft Excel certification', 'MO-201 study guide'],
  readingMinutes: 8,
  sections: Object.values(S),
  faqs,
  Body,
};
