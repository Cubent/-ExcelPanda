import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=truelearn-vs-uworld-step-2-ck`;

const S = {
  short: { id: 'short', title: 'The short answer' },
  table: { id: 'table', title: 'TrueLearn vs UWorld vs MedPrep' },
  harder: { id: 'harder', title: 'Is TrueLearn harder or easier than UWorld?' },
  who: { id: 'who', title: 'Who should pick which' },
  third: { id: 'third', title: 'A cheaper third option' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Is TrueLearn as good as UWorld for Step 2 CK?',
    answer:
      'Third-party reviewers describe similar difficulty and style, with UWorld the more established benchmark and TrueLearn adding shelf practice and national benchmarking.',
  },
  {
    question: 'Is TrueLearn cheaper than UWorld?',
    answer:
      'Generally reported to be cheaper, but TrueLearn\'s Step 2 CK pricing was not listed on the page we checked, so confirm on its site.',
  },
  {
    question: 'Which has more Step 2 CK questions?',
    answer:
      'UWorld lists 4,250+ and TrueLearn lists 4,100+, including shelf practice.',
  },
  {
    question: 'Does TrueLearn have a free trial?',
    answer:
      'Yes, a 5-day trial with 120 questions. MedPrep offers a 7-day free trial and free sample questions with no account.',
  },
  {
    question: 'Is there a cheaper option than both?',
    answer:
      'MedPrep Institute is $40 per month or $400 per year with a 7-day free trial, and adds spaced repetition and an AI Tutor.',
  },
  {
    question: 'Do I need both UWorld and TrueLearn?',
    answer:
      'No. One primary bank plus the official NBME assessments is enough for many students.',
  },
];

const Body = () => (
  <>
    <p>
      TrueLearn is the most common alternative to UWorld for Step 2 CK, usually because of price and
      shelf-exam coverage. MedPrep Institute is a third option that costs less than both for plans of up
      to six months and adds adaptive review. Here is how they compare.
    </p>

    <H2 section={S.short} />
    <p>
      UWorld is the established benchmark with the largest official self-assessment set. TrueLearn is a
      lower-cost alternative that includes shelf practice and national benchmarking. MedPrep is the
      lowest-cost option for plans up to six months, with spaced repetition built in. For most students
      one primary bank plus the official NBME assessments is enough.
    </p>

    <H2 section={S.table} />
    <ComparisonTable
      caption="Step 2 CK: MedPrep vs UWorld vs TrueLearn"
      columns={[
        { key: 'f', label: 'Feature' },
        { key: 'medprep', label: 'MedPrep Institute' },
        { key: 'uworld', label: 'UWorld' },
        { key: 'truelearn', label: 'TrueLearn' },
      ]}
      rows={[
        { id: 'price', featured: true, cells: { f: 'Price', medprep: '$40 per month, $110 per 3 months, $400 per year', uworld: '$349 (30 days) to $749 (730 days); 90 days is $459', truelearn: 'Step 2 CK pricing not listed on the page we checked; check its site' } },
        { id: 'trial', featured: true, cells: { f: 'Free trial', medprep: '7 days, plus free sample questions with no account', uworld: 'Listed on its Step 1 page; check its site', truelearn: '5-day trial with 120 questions' } },
        { id: 'q', cells: { f: 'Step 2 CK questions', medprep: '5,300+ question topics; each generates a full vignette', uworld: '4,250+', truelearn: '4,100+ (includes shelf practice)' } },
        { id: 'assess', cells: { f: 'Self-assessments', medprep: 'Not included', uworld: 'Up to 3 on longer plans', truelearn: 'See its site' } },
        { id: 'adaptive', featured: true, cells: { f: 'Adaptive practice and spaced repetition', medprep: 'Built in', uworld: 'Not confirmed on the pages we checked', truelearn: 'Performance analytics with national benchmarking' } },
        { id: 'shelf', cells: { f: 'Shelf exam practice', medprep: 'By-system practice across every rotation', uworld: 'Not confirmed on the pages we checked', truelearn: 'Yes, same bank' } },
      ]}
      footnote="Prices and counts are from each company's official pages as we last checked and change often. MedPrep counts question topics; each topic produces a full clinical vignette when you reach it."
    />

    <H2 section={S.harder} />
    <p>
      We found no independent head-to-head data on difficulty. Third-party reviewers describe
      TrueLearn questions as similar in difficulty, length and complexity to UWorld's, and UWorld as the
      benchmark others aim at. TrueLearn has published its own blind test in which examinees preferred
      its questions, but that is vendor marketing and measured preference, not difficulty.
    </p>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.who} />
    <ul>
      <li><strong>Pick UWorld</strong> if you want the benchmark bank and its official self-assessments.</li>
      <li><strong>Pick TrueLearn</strong> if you are mid-clerkship and want shelf practice and benchmarking in one bank.</li>
      <li><strong>Pick MedPrep</strong> if you want the lowest price, scheduled review of your weak concepts, and a free trial to test it.</li>
    </ul>

    <H2 section={S.third} />
    <p>
      MedPrep is $40 per month or $400 per year, so it costs less than UWorld, and it works as a
      low-cost way to add adaptive practice and scheduled review to either bank.
      Start with the{' '}
      <Link href="/usmle/features/sample-questions/step-2">free Step 2 CK sample questions</Link>, then
      the 7-day free trial. See also the{' '}
      <Link href="/blog/top-usmle-step-2-ck-question-banks">full Step 2 CK question bank guide</Link>{' '}
      and <Link href="/blog/is-uworld-enough-step-2-ck">whether UWorld alone is enough</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try the low-cost adaptive option free"
      body="$40 per month, 7-day free trial, free Step 2 CK samples."
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
  slug: 'truelearn-vs-uworld-step-2-ck',
  title: 'TrueLearn vs UWorld for Step 2 CK: Questions, Price and Which to Buy',
  seoTitle: 'TrueLearn vs UWorld Step 2 CK: Which to Buy?',
  description:
    'TrueLearn vs UWorld for Step 2 CK compared on question count, shelf practice, assessments and price, plus a cheaper adaptive third option.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Question banks',
  keywords: [
    'TrueLearn vs UWorld',
    'TrueLearn vs UWorld Step 2 CK',
    'TrueLearn review',
    'is TrueLearn as good as UWorld',
    'TrueLearn or UWorld',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
