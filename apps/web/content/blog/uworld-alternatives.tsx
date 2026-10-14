import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=uworld-alternatives`;

const S = {
  why: { id: 'why', title: 'Why students look for a UWorld alternative' },
  table: { id: 'table', title: 'The alternatives at a glance' },
  picks: { id: 'picks', title: 'Which alternative fits which student' },
  both: { id: 'both', title: 'Should you use UWorld and an alternative together?' },
  decide: { id: 'decide', title: 'How to decide in five minutes' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What is the best alternative to UWorld?',
    answer:
      'It depends on what you want to change. TrueLearn is the cheapest established third-party option, AMBOSS bundles a library and score predictor, USMLE-Rx is built around First Aid, and MedPrep adds adaptive weak-area review with built-in spaced repetition.',
  },
  {
    question: 'Is anything cheaper than UWorld?',
    answer:
      'Yes. TrueLearn starts at $149 for 30 days and $199 for 90 days of Step 1, AMBOSS is $378 for six months, and MedPrep is $40 per month or $400 per year. UWorld\'s 90-day plan is $459.',
  },
  {
    question: 'Can I pass Step 1 without UWorld?',
    answer:
      'Yes. UWorld is the most widely used bank, but students prepare successfully with other banks. What matters most is doing enough questions and reviewing every explanation.',
  },
  {
    question: 'Do any alternatives have free trials?',
    answer:
      'Most do. TrueLearn, AMBOSS and USMLE-Rx offer five-day trials, and Lecturio and MedPrep offer seven-day trials. We could not confirm a UWorld trial on its official pages.',
  },
  {
    question: 'Should I switch banks mid-prep?',
    answer:
      'Usually not, unless the current bank is not working. Switching costs you the performance history you have built, so change only if explanations or pacing are the problem.',
  },
];

const Body = () => (
  <>
    <p>
      UWorld is the question bank most students name first, and it is also the most expensive of the
      banks we compared with published pricing. If the price, the plan structure or the style does
      not fit you, there are real alternatives. This guide compares six of them using the prices and
      question counts on each company's own site.
    </p>

    <H2 section={S.why} />
    <p>
      The usual reasons are cost (UWorld's 90-day plan is $459), plan length (the 30-day plan
      includes no self-assessments), and wanting something different alongside it, such as a
      library, video lectures or built-in spaced repetition. None of these makes UWorld a bad
      choice. They are just the cases where another bank can fit better.
    </p>

    <H2 section={S.table} />
    <ComparisonTable
      caption="UWorld alternatives for USMLE Step 1: price and fit"
      columns={[
        { key: 'bank', label: 'Question bank' },
        { key: 'price', label: 'Entry price' },
        { key: 'questions', label: 'Step 1 questions' },
        { key: 'best', label: 'Best for' },
      ]}
      rows={[
        { id: 'uworld', cells: { bank: 'UWorld (for reference)', price: '$349 for 30 days, $459 for 90 days', questions: '3,600+', best: 'Exam-style volume and official self-assessments' } },
        { id: 'medprep', featured: true, cells: { bank: 'MedPrep Institute', price: '$40 per month, $400 per year', questions: '7,500+ question topics', best: 'Adaptive weak-area review with built-in spaced repetition' } },
        { id: 'amboss', cells: { bank: 'AMBOSS', price: '$378 for 6 months', questions: '5,800+ across the Qbank', best: 'Question bank, library and score predictor in one plan' } },
        { id: 'truelearn', cells: { bank: 'TrueLearn', price: '$149 for 30 days, $199 for 90 days', questions: '3,000+', best: 'Low entry price and national benchmarking' } },
        { id: 'boardvitals', cells: { bank: 'BoardVitals', price: '$169 for 1 month, $259 for 3 months', questions: '3,300+', best: 'A pass guarantee on longer plans' } },
        { id: 'usmlerx', cells: { bank: 'USMLE-Rx (Qmax)', price: '$299 for 12 months', questions: '5,000+ (shared with Step 2 CK)', best: 'Students using First Aid as their main book' } },
        { id: 'lecturio', cells: { bank: 'Lecturio', price: 'Not listed on the page we checked', questions: '2,200+', best: 'Video lectures alongside questions' } },
      ]}
      footnote="MedPrep counts question topics; each topic produces a full clinical vignette when you reach it, so its figure is not directly comparable to a fixed, pre-written bank."
    />

    <H2 section={S.picks} />
    <ul>
      <li>
        <strong>Tight budget, short timeline:</strong> TrueLearn at $149 for 30 days or $199 for 90
        days is the lowest entry price among the established third-party banks we compared (MedPrep's monthly plan is lower at $40). It also lists a first-time pass guarantee on plans
        of 90 days or longer.
      </li>
      <li>
        <strong>You want one subscription for learning and practice:</strong> AMBOSS bundles a
        library, study plans and a score predictor with the question bank.
      </li>
      <li>
        <strong>You study with First Aid:</strong> USMLE-Rx's Qmax is built around it and covers
        both Step 1 and Step 2 CK for $299 over 12 months.
      </li>
      <li>
        <strong>You keep missing the same concepts:</strong> MedPrep flags the concept behind a
        missed question and brings variations back through spaced repetition, so you are not
        planning reviews by hand.
      </li>
      <li>
        <strong>You want a guarantee:</strong> BoardVitals lists a 100% pass guarantee on its
        Prepare and Master plans.
      </li>
    </ul>
    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.both} />
    <p>
      Many students pair a primary bank with a second one for a different question style or for
      weak-area review. If you do, use the second bank to find topics to revisit, not just to raise
      your question count. UWorld's self-assessments are worth keeping in your plan either way,
      because most alternatives do not list an equivalent.
    </p>
    <p>
      Our full comparisons are in the{' '}
      <Link href="/blog/best-usmle-question-banks">best USMLE question banks guide</Link>, with
      separate breakdowns for{' '}
      <Link href="/blog/top-usmle-step-1-question-banks">Step 1</Link>,{' '}
      <Link href="/blog/top-usmle-step-2-ck-question-banks">Step 2 CK</Link> and{' '}
      <Link href="/blog/top-usmle-step-3-question-banks">Step 3</Link>.
    </p>

    <H2 section={S.decide} />
    <ol>
      <li>Set your budget and the number of weeks you have.</li>
      <li>Check which banks sell a plan that matches that length.</li>
      <li>Use the free trials (most banks offer five to seven days) on your top two.</li>
      <li>Pick the one whose explanations you actually finish reading.</li>
    </ol>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try an adaptive alternative free for 7 days"
      body="Practice with NBME-style vignettes and let the engine bring back the concepts you miss."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Prices, question counts and plan details for other companies come from their official pages as we last checked them. They change often, so confirm current details on each company's site before you buy. MedPrep Institute is our own product. MedPrep Institute is not affiliated with or endorsed by UWorld, AMBOSS, TrueLearn, BoardVitals, Lecturio, USMLE-Rx, Kaplan, NBME, FSMB or USMLE. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'uworld-alternatives',
  title: 'UWorld Alternatives: 6 USMLE Question Banks Compared by Price and Fit',
  seoTitle: 'UWorld Alternatives: USMLE Question Banks (2026)',
  description:
    'Looking for a UWorld alternative? Compare AMBOSS, TrueLearn, BoardVitals, USMLE-Rx, Lecturio and MedPrep on price, question count and who each one suits.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Question banks',
  keywords: [
    'UWorld alternatives',
    'UWorld alternative',
    'cheaper than UWorld',
    'best UWorld alternative',
    'USMLE question bank alternatives',
  ],
  readingMinutes: 7,
  sections: Object.values(S),
  faqs,
  Body,
};
