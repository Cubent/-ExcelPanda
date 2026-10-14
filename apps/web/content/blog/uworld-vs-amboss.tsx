import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=uworld-vs-amboss`;

const S = {
  short: { id: 'short', title: 'The short answer' },
  table: { id: 'table', title: 'Side-by-side comparison' },
  price: { id: 'price', title: 'Price per month' },
  who: { id: 'who', title: 'Who should pick which' },
  third: { id: 'third', title: 'Where a third option fits' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Is AMBOSS better than UWorld?',
    answer:
      'Neither is better for everyone. UWorld is the standard for exam-style volume and official self-assessments, while AMBOSS bundles a library and score predictor at a lower price.',
  },
  {
    question: 'Is AMBOSS cheaper than UWorld?',
    answer:
      'Usually yes. AMBOSS is $378 for six months and $448 for twelve, against $459 for UWorld\'s 90-day plan and $579 for its 360-day plan.',
  },
  {
    question: 'Which has more questions?',
    answer:
      'AMBOSS lists 5,800+ Step questions across its Qbank. UWorld lists 3,600+ for Step 1 and 4,250+ for Step 2 CK, though the banks are structured differently so counts are not directly comparable.',
  },
  {
    question: 'Does AMBOSS have a free trial?',
    answer:
      'Yes, a five-day free trial, plus a 30-day money-back guarantee on direct purchases. We could not confirm a UWorld trial on its official pages.',
  },
  {
    question: 'Which is better for Step 3?',
    answer:
      'UWorld, because it lists 90+ CCS case simulations that none of the other banks we checked list.',
  },
  {
    question: 'Can I use both?',
    answer:
      'Yes, but you do not need to. If you do, use the second to find topics to revisit.',
  },
];

const Body = () => (
  <>
    <p>
      UWorld versus AMBOSS is the comparison students ask about most. They solve slightly different
      problems: UWorld is the reference point for exam-style volume and official self-assessments,
      and AMBOSS bundles a library and score predictor into a lower-priced plan.
    </p>

    <H2 section={S.short} />
    <p>
      Choose <strong>UWorld</strong> if you want the most widely used question bank and official
      self-assessments, and you can pay for it. Choose <strong>AMBOSS</strong> if you want to learn
      and practice in one subscription on a tighter budget. You do not need both.
    </p>

    <H2 section={S.table} />
    <ComparisonTable
      caption="UWorld vs AMBOSS for USMLE preparation"
      columns={[
        { key: 'feature', label: 'Feature' },
        { key: 'uworld', label: 'UWorld' },
        { key: 'amboss', label: 'AMBOSS' },
      ]}
      rows={[
        { id: 'q', cells: { feature: 'Questions', uworld: '3,600+ (Step 1), 4,250+ (Step 2 CK), 2,100+ plus 90+ CCS cases (Step 3)', amboss: '5,800+ Step questions across the Qbank' } },
        { id: 'p', cells: { feature: 'Price range', uworld: '$349 (30 days) to $749 (730 days)', amboss: '$378 (6 months), $448 (12 months), $1,199 (Student Life)' } },
        { id: 'e', cells: { feature: 'Extras', uworld: 'Medical videos with QBank Plus (+$99)', amboss: 'Library, study plans, Anki integration, score predictor and clinical tools on every plan' } },
        { id: 'a', cells: { feature: 'Self-assessments', uworld: 'Up to 3 for Step 1 and Step 2 CK, 2 for Step 3, depending on plan', amboss: 'Score predictor included. Self-assessment forms not confirmed on the page we checked' } },
        { id: 't', cells: { feature: 'Trial and refunds', uworld: 'Not confirmed on the official page', amboss: '5-day free trial. 30-day money-back guarantee on direct purchases' } },
      ]}
    />

    <H2 section={S.price} />
    <p>
      Per month of access, the gap is large for short plans. UWorld's 90-day plan is $459, or about
      $153 a month. AMBOSS's six-month plan is $378, or $63 a month. On longer plans they converge:
      UWorld's 360-day plan is $579 (about $48 a month) and AMBOSS's 12-month plan is $448 (about
      $37 a month).
    </p>
    <p>
      The right comparison is the plan that matches your timeline. If you only need two to three
      months, AMBOSS's minimum is six, so you may pay for access you do not use.
    </p>

    <H2 section={S.who} />
    <ul>
      <li><strong>Pick UWorld</strong> if self-assessments matter to you (Step 2 CK especially), or if you need Step 3 CCS case practice, which the other banks we checked do not list.</li>
      <li><strong>Pick AMBOSS</strong> if you want a library and study plans in the same place and your budget is limited.</li>
      <li><strong>Pick either</strong> and add the official NBME assessments if you only want one bank.</li>
    </ul>
    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.third} />
    <p>
      If your real problem is repeating the same mistakes, neither bank's official pages describe scheduling reviews of your missed concepts for you. MedPrep Institute does, at $40 per month or $400 per year, and it
      pairs well with either as a second bank. See the{' '}
      <Link href="/blog/best-usmle-question-banks">full question bank comparison</Link> or{' '}
      <Link href="/blog/uworld-alternatives">UWorld alternatives</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try adaptive practice free for 7 days"
      body="A second opinion on your weak spots, with reviews scheduled for you."
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
  slug: 'uworld-vs-amboss',
  title: 'UWorld vs AMBOSS for USMLE: Price, Questions and Which to Choose',
  seoTitle: 'UWorld vs AMBOSS: Which USMLE Qbank?',
  description:
    'UWorld vs AMBOSS compared on question count, price, self-assessments, trials and extras, with a clear recommendation for each type of student.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Question banks',
  keywords: [
    'UWorld vs AMBOSS',
    'AMBOSS vs UWorld',
    'UWorld or AMBOSS',
    'AMBOSS vs UWorld Step 1',
    'AMBOSS vs UWorld Step 2 CK',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
