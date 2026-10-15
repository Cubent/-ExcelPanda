import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=uworld-vs-amboss`;

const S = {
  short: { id: 'short', title: 'The short answer: which one should you pick?' },
  table: { id: 'table', title: 'UWorld vs AMBOSS vs MedPrep side by side' },
  price: { id: 'price', title: 'What each one really costs per month' },
  why: { id: 'why', title: 'Why students choose MedPrep Institute' },
  wins: { id: 'wins', title: 'Where UWorld or AMBOSS still wins' },
  start: { id: 'start', title: 'Try MedPrep free in two minutes' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Is MedPrep cheaper than UWorld and AMBOSS?',
    answer:
      'Yes, for any plan of up to six months. MedPrep is $40 per month or $110 per three months, against $459 for UWorld\'s 90-day plan and $378 for AMBOSS\'s six-month plan. Every MedPrep plan starts with a 7-day free trial.',
  },
  {
    question: 'Is MedPrep better than UWorld or AMBOSS?',
    answer:
      'It is built differently. MedPrep is adaptive and schedules reviews of your missed concepts, at a lower price. UWorld is the standard for official self-assessments and Step 3 CCS cases, and AMBOSS bundles a library and score predictor.',
  },
  {
    question: 'Does MedPrep have a free trial?',
    answer:
      'Yes, 7 days on every plan, and you pay nothing if you cancel before day 7. There are also free [Step 1](/usmle/features/sample-questions), [Step 2 CK](/usmle/features/sample-questions/step-2) and [Step 3](/usmle/features/sample-questions/step-3) sample questions with no account required.',
  },
  {
    question: 'Is AMBOSS better than UWorld?',
    answer:
      'Neither is better for everyone. UWorld is the standard for exam-style volume and official self-assessments, while AMBOSS bundles a library and score predictor at a lower price.',
  },
  {
    question: 'Which has more questions, UWorld or AMBOSS?',
    answer:
      'AMBOSS lists 5,800+ Step questions across its Qbank. UWorld lists 3,600+ for Step 1 and 4,250+ for Step 2 CK. MedPrep counts 7,500+ Step 1 topics, each producing a full vignette. The counts are not directly comparable.',
  },
  {
    question: 'Which is best for Step 3?',
    answer:
      'UWorld if you need its 90+ CCS case simulations. MedPrep covers Step 3 with 10,400+ question topics at a lower price, and you can pair it with CCS practice elsewhere.',
  },
];

const Body = () => (
  <>
    <p>
      UWorld and AMBOSS are the two names every student hears first. Both are good. Both are also
      expensive, and neither one's official pages describe scheduling reviews of the concepts you
      keep missing for you. MedPrep Institute does, costs less than both for any plan of up to six months, and starts with a
      7-day free trial. Here is how all three compare.
    </p>

    <H2 section={S.short} />
    <ul>
      <li>
        <strong>Pick MedPrep Institute</strong> if you want the lowest price, adaptive practice and
        spaced repetition built in, with a free trial to prove it works for you.
      </li>
      <li>
        <strong>Pick UWorld</strong> if you need its official self-assessments or Step 3 CCS cases
        and can pay for them.
      </li>
      <li>
        <strong>Pick AMBOSS</strong> if you want a medical library and score predictor in the same
        subscription.
      </li>
    </ul>
    <p>
      You do not have to spend $459 to study well. Start with MedPrep, and add a
      self-assessment later only if you want a scored readiness check.
    </p>

    <H2 section={S.table} />
    <ComparisonTable
      caption="MedPrep Institute vs UWorld vs AMBOSS"
      columns={[
        { key: 'feature', label: 'Feature' },
        { key: 'medprep', label: 'MedPrep Institute' },
        { key: 'uworld', label: 'UWorld' },
        { key: 'amboss', label: 'AMBOSS' },
      ]}
      rows={[
        { id: 'price', featured: true, cells: { feature: 'Price', medprep: '$40 per month, $110 per 3 months, $400 per year', uworld: '$349 (30 days) to $749 (730 days); 90 days is $459', amboss: '$378 (6 months), $448 (12 months), $1,199 (Student Life)' } },
        { id: 'trial', featured: true, cells: { feature: 'Free trial', medprep: '7 days, plus free sample questions with no account', uworld: 'Listed on its Step 1 page; check its site for terms', amboss: '5-day free trial; 30-day money-back guarantee on direct purchases' } },
        { id: 'adaptive', featured: true, cells: { feature: 'Adaptive practice', medprep: 'Yes: misses are flagged and brought back', uworld: 'Fixed bank of pre-written questions', amboss: 'Not confirmed on the pages we checked' } },
        { id: 'spaced', featured: true, cells: { feature: 'Spaced repetition', medprep: 'Built in, scheduled for you', uworld: 'Not confirmed on the pages we checked', amboss: 'Anki integration' } },
        { id: 'exams', cells: { feature: 'Exams covered', medprep: 'Step 1, Step 2 CK, Step 3 and ABIM', uworld: 'Step 1, Step 2 CK and Step 3', amboss: 'USMLE Steps' } },
        { id: 'q', cells: { feature: 'Questions', medprep: '7,500+ Step 1 topics; each generates a full vignette', uworld: '3,600+ (Step 1), 4,250+ (Step 2 CK), 2,100+ plus 90+ CCS cases (Step 3)', amboss: '5,800+ Step questions across the Qbank' } },
        { id: 'a', cells: { feature: 'Self-assessments', medprep: 'Not included', uworld: 'Up to 3 for Step 1 and Step 2 CK, 2 for Step 3, depending on plan', amboss: 'Score predictor included' } },
        { id: 'extras', cells: { feature: 'Extras', medprep: 'Clinical images, physician-reviewed explanations', uworld: 'Medical videos with QBank Plus (+$99)', amboss: 'Library, study plans, clinical tools' } },
      ]}
      footnote="MedPrep counts question topics; each topic produces a full clinical vignette when you reach it, so its figure is not directly comparable to a fixed, pre-written bank."
    />

    <H2 section={S.price} />
    <p>
      Per month of access, MedPrep wins on every plan up to six months. MedPrep is $40 for one
      month and $110 for three (about $37 a month). UWorld's 90-day plan is $459, about $153 a
      month, and AMBOSS's six-month plan is $378, about $63 a month. Over a full year, MedPrep is
      $400 (about $33 a month), against $448 for AMBOSS (about $37) and $579 for UWorld (about
      $48).
    </p>
    <p>
      That is roughly $350 saved against UWorld's 90-day plan, enough to add UWorld's $50
      assessment forms later if you decide you want a scored check.
    </p>

    <H2 section={S.why} />
    <ul>
      <li><strong>Adaptive practice.</strong> Miss a question and the engine flags the concept, then brings variations back over the following days.</li>
      <li><strong>Spaced repetition built in.</strong> No decks to build and no review calendar to manage.</li>
      <li><strong>NBME-style vignettes with clinical images,</strong> by topic or mixed across systems.</li>
      <li><strong>Physician-reviewed explanations.</strong></li>
      <li><strong>Four exams, one subscription:</strong> Step 1, Step 2 CK, Step 3 and ABIM.</li>
      <li><strong>The lowest price</strong> for any plan of up to six months, with a 7-day free trial.</li>
    </ul>
    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.wins} />
    <p>
      We will be straight about the gaps. MedPrep has no official-style self-assessments, no Step 3
      CCS cases and no score predictor. If you want those, UWorld is the better source for
      assessments and CCS, and AMBOSS is the better source for a bundled library. Many students
      use MedPrep for daily practice and spaced review, and add an assessment form in the final
      weeks. Either way, you spend far less than a UWorld-only plan.
    </p>
    <p>
      For wider comparisons see the{' '}
      <Link href="/blog/best-usmle-question-banks">full question bank guide</Link>, our{' '}
      <Link href="/blog/uworld-alternatives">UWorld alternatives</Link> list and the{' '}
      <Link href="/blog/medprep-vs-uworld">MedPrep vs UWorld</Link> breakdown.
    </p>

    <H2 section={S.start} />
    <ol>
      <li>
        Try the free sample questions:{' '}
        <Link href="/usmle/features/sample-questions">Step 1</Link>,{' '}
        <Link href="/usmle/features/sample-questions/step-2">Step 2 CK</Link> and{' '}
        <Link href="/usmle/features/sample-questions/step-3">Step 3</Link>. Five questions each, a
        full explanation for every answer choice, no account needed.
      </li>
      <li>Start the 7-day free trial and do a block from your weakest system.</li>
      <li>Check that the concepts you missed come back when you expect them to.</li>
    </ol>
    <p>
      If it does not fit how you study, cancel before day 7 and pay nothing.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Start your free MedPrep trial"
      body="7 days free. Adaptive practice, spaced repetition and reviews planned for you. Cancel anytime before day 7 and pay nothing."
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
  title: 'UWorld vs AMBOSS vs MedPrep: Which USMLE Question Bank Is Worth Your Money?',
  seoTitle: 'UWorld vs AMBOSS vs MedPrep: Which Qbank?',
  description:
    'UWorld vs AMBOSS compared with MedPrep Institute on price, questions, spaced repetition and free trials, with a clear pick for each type of student.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Question banks',
  keywords: [
    'UWorld vs AMBOSS',
    'AMBOSS vs UWorld',
    'UWorld or AMBOSS',
    'UWorld vs AMBOSS vs MedPrep',
    'cheaper than UWorld and AMBOSS',
    'best USMLE question bank',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
