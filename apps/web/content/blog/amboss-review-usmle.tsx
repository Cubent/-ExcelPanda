import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=amboss-review-usmle`;

const S = {
  short: { id: 'short', title: 'The short answer' },
  includes: { id: 'includes', title: 'What AMBOSS includes' },
  price: { id: 'price', title: 'AMBOSS pricing' },
  pros: { id: 'pros', title: 'Strengths and drawbacks' },
  compare: { id: 'compare', title: 'AMBOSS vs MedPrep vs UWorld' },
  verdict: { id: 'verdict', title: 'Verdict' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Is AMBOSS worth it for USMLE?',
    answer:
      'It is worth it if you will use both the Qbank and the library and can use six months or more. If you want only questions, cheaper options exist.',
  },
  {
    question: 'How much does AMBOSS cost?',
    answer:
      '$378 for six months, $448 for twelve, and $1,199 for Student Life through the end of PGY-1.',
  },
  {
    question: 'Does AMBOSS have a free trial?',
    answer:
      'Yes, a 5-day free trial, plus a 30-day money-back guarantee on direct purchases.',
  },
  {
    question: 'Is AMBOSS better than UWorld?',
    answer:
      'They differ. UWorld is the standard for exam-style volume and official self-assessments; AMBOSS bundles a library at a lower price.',
  },
  {
    question: 'Is there a cheaper alternative to AMBOSS?',
    answer:
      'MedPrep Institute is $40 per month with a 7-day free trial and adds spaced repetition, though it has no library.',
  },
];

const Body = () => (
  <>
    <p>
      AMBOSS pairs a question bank with a medical library, which makes it more of a study platform than
      a pure Qbank. Whether it is worth the price depends on whether you will use the library. Here is a
      straightforward review.
    </p>

    <H2 section={S.short} />
    <p>
      AMBOSS is a good fit if you want to learn and practice in one place. If you only want questions
      and scheduled review of weak concepts, you can spend less.
    </p>

    <H2 section={S.includes} />
    <ul>
      <li>A Qbank with 5,800+ Step questions across the bank.</li>
      <li>A medical library you can open next to each question.</li>
      <li>Study plans, Anki integration and clinical tools on every plan.</li>
      <li>A score predictor.</li>
    </ul>

    <H2 section={S.price} />
    <ComparisonTable
      caption="AMBOSS plans"
      columns={[
        { key: 'plan', label: 'Plan' },
        { key: 'price', label: 'Price' },
        { key: 'month', label: 'About per month' },
      ]}
      rows={[
        { id: '6', cells: { plan: '6 months', price: '$378', month: '$63' } },
        { id: '12', cells: { plan: '12 months', price: '$448', month: '$37' } },
        { id: 'sl', cells: { plan: 'Student Life (through the end of PGY-1)', price: '$1,199', month: 'varies' } },
      ]}
      footnote="From AMBOSS's official pages as we last checked. It offers a 5-day free trial and a 30-day money-back guarantee on direct purchases."
    />

    <H2 section={S.pros} />
    <h3>Strengths</h3>
    <ul>
      <li>Library and questions together in one plan.</li>
      <li>A lower price than UWorld on comparable timelines.</li>
      <li>Study plans and a score predictor in the same plan.</li>
    </ul>
    <h3>Drawbacks</h3>
    <ul>
      <li>The shortest plan is six months, so short timelines pay for access they will not use.</li>
      <li>Self-assessment forms were not confirmed on the page we checked.</li>
      <li>Scheduling reviews of your missed concepts is not described on its official pages.</li>
    </ul>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.compare} />
    <ComparisonTable
      caption="AMBOSS vs MedPrep vs UWorld"
      columns={[
        { key: 'f', label: '' },
        { key: 'medprep', label: 'MedPrep Institute' },
        { key: 'amboss', label: 'AMBOSS' },
        { key: 'uworld', label: 'UWorld' },
      ]}
      rows={[
        { id: 'p', featured: true, cells: { f: 'Price', medprep: '$40/month, $110/3 months, $400/year', amboss: '$378 (6 months), $448 (12 months)', uworld: '$459 (90 days), $579 (360 days)' } },
        { id: 't', featured: true, cells: { f: 'Free trial', medprep: '7 days + free samples', amboss: '5 days', uworld: 'Listed; check its site' } },
        { id: 'a', cells: { f: 'Scheduled review of misses', medprep: 'Built in', amboss: 'Anki integration', uworld: 'Not confirmed' } },
        { id: 'l', cells: { f: 'Library', medprep: 'No', amboss: 'Yes', uworld: 'No (videos with QBank Plus)' } },
      ]}
    />

    <H2 section={S.verdict} />
    <p>
      Choose AMBOSS if you want a library next to the questions and can use six months or more. Choose
      MedPrep if you want the lowest price, adaptive practice and an AI Tutor, with a free trial first. Try
      the free <Link href="/usmle/features/sample-questions">sample questions</Link> and compare. More:{' '}
      <Link href="/blog/uworld-vs-amboss">UWorld vs AMBOSS vs MedPrep</Link> and{' '}
      <Link href="/blog/usmle-question-bank-cost">question bank cost per month</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try a lower-cost adaptive alternative"
      body="$40 per month, 7-day free trial, AI Tutor included."
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
  slug: 'amboss-review-usmle',
  title: 'AMBOSS Review for USMLE: Price, Questions, Pros and Cons',
  seoTitle: 'AMBOSS Review for USMLE (Price, Pros, Cons)',
  description:
    'An honest AMBOSS review for USMLE: pricing, what is included, strengths, drawbacks and when a lower-cost adaptive bank like MedPrep is a better fit.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Question banks',
  keywords: [
    'AMBOSS review',
    'AMBOSS USMLE review',
    'is AMBOSS worth it',
    'AMBOSS price',
    'AMBOSS vs UWorld',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
