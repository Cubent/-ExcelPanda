import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=medprep-vs-uworld`;

const S = {
  summary: { id: 'summary', title: 'The short version' },
  how: { id: 'how', title: 'How they work differently' },
  table: { id: 'table', title: 'Side-by-side' },
  whymedprep: { id: 'whymedprep', title: "Why students pick MedPrep" },
  gaps: { id: 'gaps', title: 'What MedPrep does not have' },
  together: { id: 'together', title: 'Using them together' },
  trial: { id: 'trial', title: 'How to test it yourself' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Is MedPrep Institute as good as UWorld?',
    answer:
      'They are built for different jobs. UWorld is the standard for fixed, exam-style volume and self-assessments; MedPrep is an adaptive bank with built-in spaced repetition. MedPrep does not replace UWorld\'s self-assessments.',
  },
  {
    question: 'Is MedPrep cheaper than UWorld?',
    answer:
      'Yes. MedPrep is $40 per month or $400 per year, against $459 for UWorld\'s 90-day plan and $579 for its 360-day plan.',
  },
  {
    question: 'Does MedPrep have a free trial?',
    answer:
      'Yes, a 7-day free trial on every plan. Cancel before day 7 and you pay nothing.',
  },
  {
    question: 'Does MedPrep cover Step 3?',
    answer:
      'Yes, but it does not include CCS case simulations. UWorld lists 90+ CCS cases for Step 3.',
  },
  {
    question: 'Can I use MedPrep with UWorld?',
    answer:
      'Yes. Many students use a primary bank for volume and an adaptive bank for review of weak concepts.',
  },
  {
    question: 'Does MedPrep have self-assessments?',
    answer:
      'No. Use UWorld\'s self-assessments or the official NBME assessments for a scored readiness check.',
  },
];

const Body = () => (
  <>
    <p>
      We build MedPrep Institute, so treat this as a comparison from one side and judge it
      accordingly. We have tried to be specific about where UWorld is the better choice, because a
      student who picks the wrong tool is not helped by our post.
    </p>

    <H2 section={S.summary} />
    <p>
      MedPrep costs $40 per month or $400 per year with a 7-day free trial, against $459 for
      UWorld's 90-day plan and $579 for its 360-day plan. UWorld is a large, fixed bank of pre-written questions with official self-assessments, and it
      is the standard most students measure other banks against. MedPrep is an adaptive bank that
      reacts to what you miss and schedules reviews for you. They solve different problems.
    </p>

    <H2 section={S.how} />
    <p>
      In a fixed-order bank, a missed question is something you may flag and revisit later if you
      remember to. In MedPrep, a miss tells the engine which concept you are weak on, and variations
      on that concept come back over the following days through spaced repetition. You spend less
      time planning reviews and more time answering questions.
    </p>
    <p>
      MedPrep also counts question topics rather than fixed questions: each topic produces a full
      clinical vignette when you reach it. That is why its figures (7,500+ topics for Step 1) are
      not directly comparable to UWorld's 3,600+ pre-written Step 1 questions.
    </p>

    <H2 section={S.table} />
    <ComparisonTable
      caption="MedPrep Institute vs UWorld"
      columns={[
        { key: 'feature', label: 'Feature' },
        { key: 'medprep', label: 'MedPrep Institute' },
        { key: 'uworld', label: 'UWorld' },
      ]}
      rows={[
        { id: 'price', cells: { feature: 'Price', medprep: '$40 per month, $110 per 3 months, $400 per year', uworld: '$349 (30 days) to $749 (730 days); 90 days is $459' } },
        { id: 'format', cells: { feature: 'Question format', medprep: 'Adaptive; each topic generates a vignette', uworld: 'Fixed bank of pre-written questions' } },
        { id: 'review', cells: { feature: 'Review of misses', medprep: 'Built-in spaced repetition', uworld: 'Review is up to you; no scheduled concept review listed on the pages we checked' } },
        { id: 'exams', cells: { feature: 'Exams covered', medprep: 'Step 1, Step 2 CK, Step 3 and ABIM', uworld: 'Step 1, Step 2 CK and Step 3' } },
        { id: 'assess', cells: { feature: 'Self-assessments', medprep: 'Not included', uworld: 'Up to 3 on longer Step 1 and Step 2 CK plans' } },
        { id: 'ccs', cells: { feature: 'Step 3 CCS cases', medprep: 'Not included', uworld: '90+ CCS case simulations' } },
        { id: 'trial', cells: { feature: 'Free trial', medprep: '7 days, cancel anytime', uworld: 'Not confirmed on the official page' } },
      ]}
    />
    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.whymedprep} />
    <ul>
      <li><strong>Adaptive practice.</strong> Miss a question and the engine flags the concept, then brings variations back over the following days.</li>
      <li><strong>Spaced repetition built in.</strong> No decks to build and no review calendar to manage.</li>
      <li><strong>NBME-style vignettes with clinical images,</strong> by topic or mixed across systems.</li>
      <li><strong>Physician-reviewed explanations.</strong></li>
      <li><strong>Four exams, one subscription:</strong> Step 1, Step 2 CK, Step 3 and ABIM.</li>
      <li><strong>The lowest price</strong> for any plan of up to six months: $40 per month, $110 per 3 months or $400 per year.</li>
      <li>
        <strong>Try it before you pay:</strong> free sample questions for{' '}
        <Link href="/usmle/features/sample-questions">Step 1</Link>,{' '}
        <Link href="/usmle/features/sample-questions/step-2">Step 2 CK</Link> and{' '}
        <Link href="/usmle/features/sample-questions/step-3">Step 3</Link> with no account, then a
        7-day free trial.
      </li>
    </ul>

    <H2 section={S.gaps} />
    <p>
      MedPrep does not include CCS case simulations, official-style self-assessment exams or a score
      predictor. If you are taking Step 3, or you want a scored read on where you stand before
      Step 2 CK, plan to use UWorld's self-assessments or the official NBME assessments alongside.
    </p>

    <H2 section={S.together} />
    <p>
      A common setup is UWorld as the primary bank for volume and assessments, and MedPrep for
      daily adaptive review of the concepts you keep missing. If you can only afford one, pick based
      on your problem: choose UWorld if you need volume and assessments, and MedPrep if you need
      scheduled review and lower cost.
    </p>

    <H2 section={S.trial} />
    <p>
      Do the 7-day free trial with a block of questions from your weakest system, then check whether
      missed concepts come back when you expect them to. That is the feature you are paying for.
      For a wider view see the{' '}
      <Link href="/blog/best-usmle-question-banks">full question bank comparison</Link> and our{' '}
      <Link href="/blog/two-passes-through-a-usmle-question-bank">guide to two passes through a question bank</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Test MedPrep on your weakest system"
      body="7-day free trial. Cancel anytime before day 7 and pay nothing."
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
  slug: 'medprep-vs-uworld',
  title: 'MedPrep Institute vs UWorld: An Honest Comparison',
  seoTitle: 'MedPrep vs UWorld: Honest Comparison',
  description:
    'How MedPrep Institute compares with UWorld on price, how questions work, spaced repetition, self-assessments and who each one is best for.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Question banks',
  keywords: [
    'MedPrep vs UWorld',
    'MedPrep Institute review',
    'UWorld vs MedPrep',
    'adaptive USMLE question bank',
    'USMLE question bank with spaced repetition',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
