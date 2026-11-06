import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) => `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=excel-keyboard-shortcuts`;

const S = {
  move: { id: 'move-and-select', title: 'Move and select' },
  edit: { id: 'edit-and-fill', title: 'Edit and fill' },
  format: { id: 'format-and-structure', title: 'Format and structure' },
  formulas: { id: 'formula-shortcuts', title: 'Formula shortcuts' },
  learn: { id: 'how-to-learn-them', title: 'How to actually learn them' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const cols = [
  { key: 'keys', label: 'Shortcut' },
  { key: 'does', label: 'What it does' },
];

const faqs: BlogFaq[] = [
  {
    question: 'What are the most useful Excel shortcuts?',
    answer:
      'Ctrl+Arrow keys to jump through data, Ctrl+Shift+Arrow to select it, F4 to lock references, Alt+= to sum and Ctrl+T to make a Table cover most daily work.',
  },
  {
    question: 'Do these shortcuts work on a Mac?',
    answer: 'Many work with Cmd in place of Ctrl, but some differ. Check the shortcut list for Excel on Mac if one does not respond.',
  },
  {
    question: 'How many shortcuts should I learn?',
    answer:
      'Start with five and use them until they are automatic, then add more. A few well-learned shortcuts beat a long list you forget.',
  },
  {
    question: 'Is there a shortcut to show all formulas?',
    answer: 'Yes. Press Ctrl+` (the key above Tab) to switch between showing values and showing formulas.',
  },
];

const Body = () => (
  <>
    <Callout title="The short version">
      <p>
        Learn five first: <code>Ctrl+Arrow</code>, <code>Ctrl+Shift+Arrow</code>, <code>F4</code>, <code>Alt+=</code> and{' '}
        <code>Ctrl+T</code>. Add a few more each week.
      </p>
    </Callout>

    <p>
      Reaching for the mouse costs a second or two each time, and across a day of spreadsheet work that adds up. These shortcuts are
      the ones people use most, grouped by what you are doing.
    </p>

    <H2 section={S.move} />
    <ComparisonTable
      caption="Move and select shortcuts"
      columns={cols}
      rows={[
        { id: 'm1', cells: { keys: 'Ctrl + Arrow key', does: 'Jump to the edge of the data' } },
        { id: 'm2', cells: { keys: 'Ctrl + Shift + Arrow key', does: 'Select from here to the edge of the data' } },
        { id: 'm3', cells: { keys: 'Ctrl + Home', does: 'Go to cell A1' } },
        { id: 'm4', cells: { keys: 'Ctrl + End', does: 'Go to the last used cell' } },
        { id: 'm5', cells: { keys: 'Ctrl + Space', does: 'Select the whole column' } },
        { id: 'm6', cells: { keys: 'Shift + Space', does: 'Select the whole row' } },
      ]}
    />

    <H2 section={S.edit} />
    <ComparisonTable
      caption="Edit and fill shortcuts"
      columns={cols}
      rows={[
        { id: 'e1', cells: { keys: 'F2', does: 'Edit the active cell' } },
        { id: 'e2', cells: { keys: 'Ctrl + Z / Ctrl + Y', does: 'Undo / redo' } },
        { id: 'e3', cells: { keys: 'Ctrl + D', does: 'Fill down from the cell above' } },
        { id: 'e4', cells: { keys: 'Ctrl + R', does: 'Fill right from the cell on the left' } },
        { id: 'e5', cells: { keys: 'Alt + Enter', does: 'Start a new line inside a cell' } },
        { id: 'e6', cells: { keys: 'Ctrl + ;', does: 'Enter today’s date' } },
      ]}
    />
    <PostCta
      heading="Build speed with daily practice"
      body="Short hands-on lessons build the habits that make shortcuts stick."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.format} />
    <ComparisonTable
      caption="Format and structure shortcuts"
      columns={cols}
      rows={[
        { id: 'f1', cells: { keys: 'Ctrl + 1', does: 'Open Format Cells' } },
        { id: 'f2', cells: { keys: 'Ctrl + T', does: 'Turn a range into a Table' } },
        { id: 'f3', cells: { keys: 'Ctrl + Shift + L', does: 'Turn filters on or off' } },
        { id: 'f4', cells: { keys: 'Ctrl + +', does: 'Insert cells, rows or columns' } },
        { id: 'f5', cells: { keys: 'Ctrl + -', does: 'Delete cells, rows or columns' } },
      ]}
    />

    <H2 section={S.formulas} />
    <ComparisonTable
      caption="Formula shortcuts"
      columns={cols}
      rows={[
        { id: 'x1', cells: { keys: 'Alt + =', does: 'AutoSum the cells next to the active one' } },
        { id: 'x2', cells: { keys: 'F4', does: 'Cycle a reference between relative and absolute ($A$1)' } },
        { id: 'x3', cells: { keys: 'Ctrl + `', does: 'Show formulas instead of values' } },
        { id: 'x4', cells: { keys: 'Ctrl + E', does: 'Flash Fill: fill a column from a pattern you typed' } },
      ]}
    />
    <p>
      Flash Fill is in Excel 2013 and later. F4 saves the most mistakes, because it stops formulas breaking when you copy them.
    </p>

    <H2 section={S.learn} />
    <ol>
      <li>Pick five shortcuts and write them on a sticky note.</li>
      <li>Use only the keyboard for those actions for a week, even when it feels slower.</li>
      <li>Add five more the next week.</li>
    </ol>
    <p>
      Shortcuts are one part of working faster. For the full picture, see our{' '}
      <Link href="/blog/learn-excel-fast-30-day-plan">30-day Excel plan</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Get faster, one lesson a day"
      body="Short hands-on lessons, instant feedback and spaced review of what you missed."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Shortcuts are for Excel on Windows and can differ on Mac or in Excel for the web. ExcelPanda is not affiliated with or endorsed
      by Microsoft. Microsoft and Excel are trademarks of the Microsoft group of companies.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'excel-keyboard-shortcuts',
  title: 'Essential Excel Keyboard Shortcuts That Save Hours',
  seoTitle: 'Essential Excel Keyboard Shortcuts (Windows)',
  description:
    'Excel keyboard shortcuts for moving, selecting, editing, formatting and formulas, plus a simple way to make them stick.',
  publishedAt: '2026-11-05T10:10:00+01:00',
  updatedAt: '2026-11-05T10:10:00+01:00',
  author: { name: 'ExcelPanda Team', url: 'https://www.excelpanda.org' },
  heroImage: '/blog/excel-shortcuts-hero.png',
  category: 'Tips',
  keywords: ['Excel keyboard shortcuts', 'Excel shortcuts', 'Excel shortcuts Windows', 'work faster in Excel'],
  readingMinutes: 4,
  sections: Object.values(S),
  faqs,
  Body,
};
