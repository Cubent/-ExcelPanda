import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=uworld-plans-and-prices`;

const S = {
  table: { id: 'table', title: 'UWorld plans at a glance' },
  assess: { id: 'assess', title: 'Self-assessments by plan' },
  extras: { id: 'extras', title: 'Extras that cost more' },
  which: { id: 'which', title: 'Which plan to buy' },
  cheaper: { id: 'cheaper', title: 'A cheaper way to cover the same weeks' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'How much does UWorld cost?',
    answer:
      'UWorld plans range from $349 for 30 days to $749 for 730 days. The 90-day plan is $459, 180 days is $519 and 360 days is $579.',
  },
  {
    question: 'How many self-assessments does UWorld include?',
    answer:
      'None on the 30-day plan, one on 90 days, two on 180 days and three on 360 and 730 days for Step 1 and Step 2 CK.',
  },
  {
    question: 'Which UWorld plan should I buy?',
    answer:
      'The 90-day plan is the usual starting point for a 2 to 3 month prep. Buy 180 days or more if you start during clerkships.',
  },
  {
    question: 'Does UWorld have a free trial?',
    answer:
      'UWorld\'s site lists a free trial for its Step 1 QBank. Check its page for current terms.',
  },
  {
    question: 'Is there a cheaper alternative to UWorld?',
    answer:
      'Yes. MedPrep Institute is $40 per month, $110 per three months or $400 per year with a 7-day free trial.',
  },
  {
    question: 'Are extra UWorld self-assessments available?',
    answer:
      'Yes, extra forms are $50 each with two weeks of access.',
  },
];

const Body = () => (
  <>
    <p>
      UWorld sells five plan lengths, and the self-assessments included change with the plan. Here is
      what each plan costs and who each one suits, using prices from UWorld's official pages as we
      last checked them.
    </p>

    <H2 section={S.table} />
    <ComparisonTable
      caption="UWorld plan prices (USMLE)"
      columns={[
        { key: 'plan', label: 'Plan' },
        { key: 'price', label: 'Price' },
        { key: 'month', label: 'About per month' },
        { key: 'sa', label: 'Self-assessments' },
      ]}
      rows={[
        { id: '30', cells: { plan: '30 days', price: '$349', month: '$349', sa: 'None' } },
        { id: '90', cells: { plan: '90 days', price: '$459', month: '$153', sa: '1' } },
        { id: '180', cells: { plan: '180 days', price: '$519', month: '$86', sa: '2' } },
        { id: '360', cells: { plan: '360 days', price: '$579', month: '$48', sa: '3' } },
        { id: '730', cells: { plan: '730 days', price: '$749', month: '$31', sa: '3' } },
      ]}
      footnote="Self-assessment counts apply to Step 1 and Step 2 CK; Step 3 differs. Confirm on UWorld's site, since prices change."
    />

    <H2 section={S.assess} />
    <p>
      The 30-day plan includes no self-assessments, the 90-day plan one, the 180-day plan two, and the
      360 and 730-day plans three. Extra forms are sold separately for $50 each, with two weeks of
      access.
    </p>

    <H2 section={S.extras} />
    <ul>
      <li><strong>QBank Plus</strong> adds medical videos for $99 more on every plan.</li>
      <li><strong>Extra self-assessment forms</strong> are $50 each.</li>
    </ul>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.which} />
    <ul>
      <li><strong>Short dedicated period (4 to 6 weeks):</strong> the 30-day plan plus one $50 form comes to $399, $60 less than the 90-day plan but with 60 fewer days of access.</li>
      <li><strong>Most students (2 to 3 months):</strong> the 90-day plan at $459 is the usual starting point.</li>
      <li><strong>Starting during clerkships:</strong> 180 or 360 days, since you will practice across months.</li>
      <li><strong>Step 1 and Step 2 CK both:</strong> compare the 360 and 730-day plans, which include three assessments.</li>
    </ul>

    <H2 section={S.cheaper} />
    <p>
      If you mainly need practice and scheduled review of weak concepts, MedPrep Institute is $40 per
      month or $110 for three months, and for any plan up to six months it costs less than UWorld,
      AMBOSS and TrueLearn. Many students use MedPrep for daily practice and buy one UWorld
      self-assessment form later. Start with the free{' '}
      <Link href="/usmle/features/sample-questions">Step 1</Link>,{' '}
      <Link href="/usmle/features/sample-questions/step-2">Step 2 CK</Link> and{' '}
      <Link href="/usmle/features/sample-questions/step-3">Step 3</Link> sample questions, then the
      7-day free trial. Compare in our{' '}
      <Link href="/blog/uworld-alternatives">UWorld alternatives</Link> and{' '}
      <Link href="/blog/medprep-vs-uworld">MedPrep vs UWorld</Link> posts.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Cover the same weeks for less"
      body="$40 per month, 7-day free trial, adaptive practice with spaced repetition."
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
  slug: 'uworld-plans-and-prices',
  title: 'UWorld Plans and Prices: Which Plan Should You Buy? (30, 90, 180, 360 or 730 Days)',
  seoTitle: 'UWorld Plans & Prices: Which Plan to Buy?',
  description:
    'UWorld plan prices by length, how many self-assessments each includes, extras that cost more, and a cheaper adaptive alternative for short timelines.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Question banks',
  keywords: [
    'UWorld price',
    'UWorld plans',
    'UWorld Step 1 price',
    'which UWorld plan to buy',
    'UWorld 90 day vs 180 day',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
