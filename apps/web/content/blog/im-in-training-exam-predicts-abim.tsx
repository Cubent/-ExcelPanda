import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=im-in-training-exam-predicts-abim`;

const S = {
  short: { id: 'short', title: 'The short answer' },
  studies: { id: 'studies', title: 'What the studies found' },
  percentile: { id: 'percentile', title: 'Why raw score may beat percentile' },
  use: { id: 'use', title: 'How to use your ITE result' },
  plan: { id: 'plan', title: 'A plan if your score is low' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Does the IM-ITE predict ABIM certification exam results?',
    answer:
      'Yes, imperfectly. Studies find ITE scores predict pass or fail better than chance, with classification accuracy around 75 to 79% in one model.',
  },
  {
    question: 'What ITE percentile do I need to pass the ABIM exam?',
    answer:
      'The 35th percentile at PGY-2 was a common benchmark, but a 2007 study found the cut-points were lower. Raw score may be a more robust measure than percentile.',
  },
  {
    question: 'Is the ITE a better predictor than USMLE scores?',
    answer:
      'One 2020 study found third-year ITE scores predicted ABIM results better than USMLE Step 1 or Step 2 scores.',
  },
  {
    question: 'What should I do if my ITE score is low?',
    answer:
      'Use the content breakdown to find weak areas, start timed question practice earlier and re-test weak concepts on a schedule.',
  },
  {
    question: 'Can practice questions help for ABIM?',
    answer:
      'Yes. MedPrep has [free ABIM sample questions](/abim/features/sample-questions) and a 7-day free trial of the adaptive ABIM bank.',
  },
];

const Body = () => (
  <>
    <p>
      Residents want to know whether their in-training exam (IM-ITE) score says anything about the
      ABIM certification exam. The research says yes, but imperfectly. This guide summarizes what
      published studies found and how to turn a score into a study plan.
    </p>

    <H2 section={S.short} />
    <p>
      ITE scores predict ABIM results better than chance and often better than earlier USMLE scores,
      but no single score is fully predictive. Use it as a diagnostic that tells you where to work,
      not as a verdict.
    </p>

    <H2 section={S.studies} />
    <ul>
      <li>
        <strong>A 2007 study</strong> re-examined the long-used rule of thumb that the 35th percentile
        at PGY-2 predicts passing, and found the percentile cut-points were significantly lower than
        earlier work suggested. Its model classified performance correctly about 75 to 79% of the
        time, with scores above about 65% predicting a pass and below about 49% predicting a fail.
      </li>
      <li>
        <strong>A commentary</strong> noted pooled sensitivity of 0.83 and specificity of 0.75,
        which means frequent false positives and false negatives.
      </li>
      <li>
        <strong>A 2020 study</strong> in BMC Medical Education found that third-year ITE scores
        predicted ABIM results better than USMLE Step 1 or Step 2 scores. A 5% increase in ITE
        percentage raised the odds of passing (odds ratio about 2.9, with a wide confidence
        interval).
      </li>
    </ul>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.percentile} />
    <p>
      A 2022 analysis argued that raw ITE score is a more robust way to identify residents at risk
      than percentile rank, because percentile depends on how the comparison group performed in a
      given year. If your program reports both, look at the raw percentage as well.
    </p>

    <H2 section={S.use} />
    <ul>
      <li>Look at <strong>content-area breakdowns</strong>, not only the total.</li>
      <li>Compare year over year. Your <strong>trend</strong> matters more than one result.</li>
      <li>Treat a low score as a reason to start question practice earlier, not as a prediction of failure.</li>
    </ul>

    <H2 section={S.plan} />
    <ol>
      <li>List the three weakest content areas from your score report.</li>
      <li>Do timed, mixed question blocks, plus focused sets in those areas.</li>
      <li>Review every miss and log the concept.</li>
      <li>Re-test those concepts after a few days and again before the exam.</li>
    </ol>
    <p>
      MedPrep's adaptive engine automates the last two steps for ABIM-style vignettes: a miss flags
      the concept and variations return on a schedule. Try the free{' '}
      <Link href="/abim/features/sample-questions">ABIM sample questions</Link> first, then the
      7-day free trial. More: <Link href="/blog/abim-internal-medicine-pass-rate">ABIM pass rate and
      format</Link> and the <Link href="/blog/abim-study-guide">ABIM study guide</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Turn your ITE result into a study plan"
      body="Adaptive ABIM practice with reviews scheduled for you. 7-day free trial."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Figures in this guide come from the USMLE program's published notices and from third-party summaries that we could not check against the primary source, and we say so where that applies. Standards, policies and score data change, so confirm current details on USMLE.org, ECFMG and NRMP before you plan around them. MedPrep Institute is our own product, and is not affiliated with or endorsed by NBME, FSMB, USMLE, ECFMG, NRMP, UWorld or any other company named here. All trademarks belong to their owners. Study details come from published research, including <a href="https://www.amjmed.com/article/S0002-9343(07)00419-6/fulltext" target="_blank" rel="noopener noreferrer">The American Journal of Medicine (2007)</a> and <a href="https://link.springer.com/article/10.1186/s12909-020-1974-3" target="_blank" rel="noopener noreferrer">BMC Medical Education (2020)</a>.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'im-in-training-exam-predicts-abim',
  title: 'Does the IM In-Training Exam Predict ABIM Boards? What the Research Shows',
  seoTitle: 'Does the IM-ITE Predict ABIM Boards? Research',
  description:
    'What studies say about how well the Internal Medicine In-Training Examination predicts ABIM certification exam results, and how to use your ITE score.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'ABIM',
  keywords: [
    'IM-ITE predict ABIM',
    'in-training exam ABIM pass',
    'IM ITE score meaning',
    '35th percentile ITE ABIM',
    'internal medicine in-training exam',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
