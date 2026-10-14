import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=anki-vs-question-bank-usmle`;

const S = {
  short: { id: 'short', title: 'The short answer' },
  compare: { id: 'compare', title: 'What each one is good at' },
  problem: { id: 'problem', title: 'The problem with Anki-only or qbank-only prep' },
  combine: { id: 'combine', title: 'How to combine them' },
  builtin: { id: 'builtin', title: 'A question bank with spaced repetition built in' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Do I need Anki for Step 1?',
    answer:
      'No. Many students pass without it, but you do need some way to review missed concepts on a schedule.',
  },
  {
    question: 'Can I use only a question bank?',
    answer:
      'Yes, but review missed concepts deliberately, since they will not return on their own in a fixed-order bank.',
  },
  {
    question: 'Is Anki better than UWorld?',
    answer:
      'They do different jobs. Anki helps you remember facts, while a question bank trains vignette-style reasoning.',
  },
  {
    question: 'Does MedPrep replace Anki?',
    answer:
      'For many students it can, because spaced repetition is built into the question practice. You can still use Anki if you like it.',
  },
  {
    question: 'How many Anki cards per day?',
    answer:
      'Cap new cards so reviews stay manageable, and build cards from questions you miss.',
  },
];

const Body = () => (
  <>
    <p>
      Students argue about this endlessly: is Anki enough, do you need a question bank, or both?
      They train different skills. Flashcards help you remember facts. Questions train you to
      apply them under exam conditions. The best plans use spaced repetition inside the practice
      itself.
    </p>

    <H2 section={S.short} />
    <p>
      You need practice questions. You do not strictly need Anki, but you do need some form of
      spaced review, because facts you saw once in a question will fade without it.
    </p>

    <H2 section={S.compare} />
    <ComparisonTable
      caption="Anki vs a question bank"
      columns={[
        { key: 'f', label: '' },
        { key: 'a', label: 'Anki flashcards' },
        { key: 'q', label: 'Question bank' },
      ]}
      rows={[
        { id: 'skill', cells: { f: 'Trains', a: 'Recall of facts', q: 'Applying knowledge to clinical vignettes' } },
        { id: 'timing', cells: { f: 'Spacing', a: 'Built-in scheduling', q: 'Usually up to you' } },
        { id: 'format', cells: { f: 'Exam match', a: 'Low: single facts', q: 'High: vignette-style questions' } },
        { id: 'cost', cells: { f: 'Setup', a: 'Free app, time to build or find decks', q: 'Paid, ready to use' } },
      ]}
    />

    <H2 section={S.problem} />
    <p>
      Anki-only prep can leave you recalling facts but struggling with vignettes. Question-bank-only
      prep can leave you answering well today and forgetting next month, because a missed concept
      only returns if you remember to revisit it. Each one covers the other's gap.
    </p>

    <H2 section={S.combine} />
    <ul>
      <li>Make questions the core of your day.</li>
      <li>Create cards only from questions you miss, not whole chapters.</li>
      <li>Cap new cards per day so reviews do not take over.</li>
      <li>Drop cards that do not improve your accuracy.</li>
    </ul>
    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.builtin} />
    <p>
      If building and maintaining cards feels like a second job, an adaptive bank can do the
      scheduling for you. MedPrep flags the concept behind a missed question and brings variations
      back over the following days, so spaced repetition happens inside your question practice.
      AMBOSS also lists Anki integration. See our{' '}
      <Link href="/blog/two-passes-through-a-usmle-question-bank">guide to two passes through a question bank</Link>{' '}
      for how to structure review.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Skip card-making: try built-in spaced repetition"
      body="Missed concepts come back on a schedule, inside your question practice."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      This guide is general study information, not a guarantee of any result. MedPrep Institute is our own product. Exam rules are set by the NBME and FSMB and can change, so confirm current details on USMLE.org. MedPrep Institute is not affiliated with or endorsed by NBME, FSMB, USMLE or any other company named here. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'anki-vs-question-bank-usmle',
  title: 'Anki vs a Question Bank for USMLE: Do You Need Both?',
  seoTitle: 'Anki vs Question Bank for USMLE: Do You Need Both?',
  description:
    'Anki flashcards versus a USMLE question bank: what each does best, why spaced repetition matters, and how to combine them without burning out.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Study plans',
  keywords: [
    'Anki vs UWorld',
    'Anki vs question bank',
    'do I need Anki for USMLE',
    'spaced repetition USMLE',
    'USMLE Anki alternative',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
