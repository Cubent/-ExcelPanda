import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=usmle-passing-scores-2026`;

const S = {
  table: { id: 'table', title: 'USMLE passing scores at a glance' },
  step1: { id: 'step1', title: 'Step 1: pass/fail' },
  step2: { id: 'step2', title: 'Step 2 CK: 218 since July 1, 2025' },
  step3: { id: 'step3', title: 'Step 3: 200 since January 1, 2024' },
  why: { id: 'why', title: 'Why passing standards change' },
  prep: { id: 'prep', title: 'What a higher standard means for your prep' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What is the passing score for Step 2 CK?',
    answer:
      '218, for exams taken on or after July 1, 2025. It was 214 before that.',
  },
  {
    question: 'What is the passing score for Step 3?',
    answer:
      '200, for exams taken on or after January 1, 2024. It was 198 before that.',
  },
  {
    question: 'What is the passing score for Step 1?',
    answer:
      'Step 1 is pass/fail only. The last published three-digit standard was 196, but USMLE no longer reports Step 1 numerically.',
  },
  {
    question: 'When did the Step 2 CK passing score change to 218?',
    answer:
      'The change was announced June 16, 2025 and applies to exams on or after July 1, 2025, including retakes.',
  },
  {
    question: 'Do passing scores change?',
    answer:
      'Yes. USMLE reviews each exam\'s standard every few years and may raise or lower it.',
  },
  {
    question: 'Does the new standard apply to retakers?',
    answer:
      'Yes. The Step 2 CK change applies to all examinees, including retakers.',
  },
];

const Body = () => (
  <>
    <p>
      Passing standards have moved recently, and plenty of guides still list the old numbers. This
      page collects the current figures, the effective dates, and the official announcements they
      come from.
    </p>

    <H2 section={S.table} />
    <ComparisonTable
      caption="USMLE passing standards (check USMLE.org for the latest)"
      columns={[
        { key: 'step', label: 'Exam' },
        { key: 'std', label: 'Passing standard' },
        { key: 'when', label: 'Applies to' },
      ]}
      rows={[
        { id: 's1', cells: { step: 'Step 1', std: 'Pass/fail only. Last published three-digit standard: 196', when: 'Exams on or after January 26, 2022 are reported pass/fail' } },
        { id: 's2', cells: { step: 'Step 2 CK', std: '218 (was 214)', when: 'Exams on or after July 1, 2025' } },
        { id: 's3', cells: { step: 'Step 3', std: '200 (was 198)', when: 'Exams on or after January 1, 2024' } },
      ]}
      footnote="Older guides still list 214 for Step 2 CK and 198 for Step 3. Those are out of date."
    />

    <H2 section={S.step1} />
    <p>
      Step 1 reports only pass or fail for exams taken on or after January 26, 2022. USMLE has said
      the passing standard on the old three-digit scale was 196, and that future reviews of the
      standard will not be reported as a three-digit number. See our{' '}
      <Link href="/blog/usmle-step-1-pass-fail-score">Step 1 pass/fail guide</Link>.
    </p>

    <H2 section={S.step2} />
    <p>
      The USMLE Management Committee announced on June 16, 2025 that the Step 2 CK passing standard
      would rise four points, from 214 to 218, for examinees testing on or after July 1, 2025. It
      applies to retakers as well as first-time examinees. Step 2 CK still reports a three-digit
      score, which is now the main number residency programs see. For where scores sit in the
      distribution, see our{' '}
      <Link href="/blog/usmle-step-2-ck-score-percentile">score and percentile guide</Link>.
    </p>

    <H2 section={S.step3} />
    <p>
      The Step 3 passing standard is 200 on the three-digit scale for exams on or after January 1,
      2024, up from 198. Our{' '}
      <Link href="/blog/usmle-step-3-study-guide">Step 3 study guide</Link> and{' '}
      <Link href="/blog/step-3-study-plan-intern-year">Step 3 study plan for intern year</Link> cover
      how to prepare.
    </p>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.why} />
    <p>
      The USMLE Management Committee reviews the passing standard for each exam every few years,
      using panels of physicians, surveys of stakeholders and trends in examinee performance, and
      decides whether to change it. Standards can go up or down, so check USMLE.org before you plan
      around a number.
    </p>

    <H2 section={S.prep} />
    <p>
      A few points of difference mostly affects borderline examinees. If your practice assessments
      sit close to the line, build margin with daily timed questions and targeted review of weak
      concepts rather than trying to hit the minimum exactly. If you have to retake, see the{' '}
      <Link href="/blog/usmle-attempt-limits-retake-rules">attempt limits guide</Link> and the{' '}
      <Link href="/blog/failed-usmle-step-retake-guide">retake recovery plan</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Build margin above the passing line"
      body="Adaptive daily practice with reviews scheduled for you. 7-day free trial."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Figures in this guide come from the USMLE program's published notices and from third-party summaries that we could not check against the primary source, and we say so where that applies. Standards, policies and score data change, so confirm current details on USMLE.org, ECFMG and NRMP before you plan around them. MedPrep Institute is our own product, and is not affiliated with or endorsed by NBME, FSMB, USMLE, ECFMG, NRMP, UWorld or any other company named here. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'usmle-passing-scores-2026',
  title: 'USMLE Passing Scores in 2026: Step 1, Step 2 CK (218) and Step 3 (200)',
  seoTitle: 'USMLE Passing Scores 2026: Step 1, 2 CK, 3',
  description:
    'Current USMLE passing standards: Step 1 pass/fail, Step 2 CK 218 since July 2025, Step 3 200 since January 2024, with effective dates and what changed.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Scoring',
  keywords: [
    'USMLE passing score 2026',
    'Step 2 CK passing score 218',
    'Step 3 passing score 200',
    'Step 1 passing score',
    'USMLE minimum passing score',
  ],
  readingMinutes: 5,
  sections: Object.values(S),
  faqs,
  Body,
};
