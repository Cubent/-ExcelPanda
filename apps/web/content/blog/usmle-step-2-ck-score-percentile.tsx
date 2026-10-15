import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-2-ck-score-percentile`;

const S = {
  scale: { id: 'how-step-2-ck-is-scored', title: 'How is Step 2 CK scored?' },
  passing: { id: 'passing-score', title: 'What is the Step 2 CK passing score?' },
  average: { id: 'average-score', title: 'What is the average Step 2 CK score?' },
  percentile: { id: 'percentile-estimates', title: 'Step 2 CK score to percentile: estimates' },
  good: { id: 'what-is-a-good-score', title: 'What counts as a good Step 2 CK score?' },
  nbme: { id: 'predicting-your-score', title: 'Can practice exams predict your score?' },
  improve: { id: 'raising-your-score', title: 'How do you raise your Step 2 CK score?' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What is the passing score for Step 2 CK?',
    answer:
      'The minimum passing standard is 218 for exams taken on or after July 1, 2025. It was 214 before that.',
  },
  {
    question: 'What is the average Step 2 CK score?',
    answer:
      'First-time US MD examinees averaged about 250 in 2024 to 2025, with a standard deviation of about 15.',
  },
  {
    question: 'Is there an official Step 2 CK percentile?',
    answer:
      'No. USMLE publishes score distributions but not an official percentile chart, so any conversion is an estimate.',
  },
  {
    question: 'Is a 250 a good Step 2 CK score?',
    answer:
      'It is right at the average for first-time US MD examinees, which is solid for many specialties but may be below the typical match score for the most competitive ones.',
  },
  {
    question: 'Is Step 2 CK pass/fail?',
    answer:
      'No. Step 2 CK reports a three-digit score and a pass/fail outcome.',
  },
  {
    question: 'How long do results take?',
    answer:
      'Typically within four weeks of the test date. See our [Step 2 CK exam dates guide](/blog/usmle-step-2-ck-exam-dates-2026).',
  },
];

const Body = () => (
  <>
    <p>
      With Step 1 now pass/fail, Step 2 CK is the main number programs see. That makes the first
      question most students ask a practical one: what does my score mean, and how does it compare
      with everyone else? This guide explains the scale, gives the passing standard and a typical
      average, and offers rough percentile estimates you can use for planning.
    </p>

    <H2 section={S.scale} />
    <p>
      Step 2 CK reports a three-digit score along with a pass/fail outcome. The score is derived
      from your performance and then equated, so a given score reflects the same level of
      performance across test forms and test dates. It is not a percentage of questions correct,
      and it is not a percentile.
    </p>

    <H2 section={S.passing} />
    <p>
      The minimum passing standard for Step 2 CK is 218 on the three-digit scale, for exams taken on
      or after July 1, 2025. The USMLE Management Committee announced the four-point increase from
      214 on June 16, 2025, and it applies to retakers as well as first-time examinees. Standards
      are reviewed every few years, so confirm the current number on USMLE.org.
    </p>

    <H2 section={S.average} />
    <p>
      First-time examinees from US MD programs averaged about 250 in 2024 to 2025, with a standard
      deviation of about 15. Reports citing USMLE data show the mean rising from 248 in 2022 to
      2023 and 249 in 2023 to 2024. Among US MD seniors who matched to their preferred specialty,
      the NRMP's 2024 Charting Outcomes reports a mean of 250.4 (SD 13.2). Averages for DO
      students and international graduates differ, so check USMLE's performance data for your
      group.
    </p>

    <H2 section={S.percentile} />
    <p>
      USMLE does not publish an official score-to-percentile chart. What you can do is estimate. If
      you assume a mean near 250 and a standard deviation near 15, the table below gives a rough
      sense of where a score sits. Real score distributions are not perfectly bell-shaped, and the
      comparison group matters, so treat the numbers as planning aids rather than facts.
    </p>
    <ComparisonTable
      caption="Approximate Step 2 CK percentile by score (estimate, mean 250, SD 15)"
      columns={[
        { key: 'score', label: 'Score' },
        { key: 'pct', label: 'Approximate percentile' },
        { key: 'read', label: 'Rough interpretation' },
      ]}
      rows={[
        { id: '218', cells: { score: '218', pct: 'about 2nd', read: 'At the passing standard' } },
        { id: '225', cells: { score: '225', pct: 'about 5th', read: 'Passing, below average' } },
        { id: '235', cells: { score: '235', pct: 'about 16th', read: 'Passing, below average' } },
        { id: '245', cells: { score: '245', pct: 'about 37th', read: 'Slightly below average' } },
        { id: '250', cells: { score: '250', pct: 'about 50th', read: 'Average' } },
        { id: '255', cells: { score: '255', pct: 'about 63rd', read: 'Above average' } },
        { id: '260', cells: { score: '260', pct: 'about 75th', read: 'Strong' } },
        { id: '265', cells: { score: '265', pct: 'about 84th', read: 'Strong' } },
        { id: '270', cells: { score: '270', pct: 'about 91st', read: 'Very strong' } },
        { id: '280', cells: { score: '280', pct: 'about 98th', read: 'Exceptional' } },
      ]}
      footnote="Normal-distribution estimate for planning only. Not an official USMLE conversion."
    />

    <H2 section={S.good} />
    <p>
      "Good" depends on the goal. For passing, anything at or above 218 is good enough. For
      competitiveness, the target depends on your specialty and the rest of your application. A
      score around or above the mean rarely hurts in less score-sensitive specialties, while the
      most competitive specialties tend to match applicants well above the average. Our{' '}
      <Link href="/blog/step-2-ck-score-by-specialty">Step 2 CK score by specialty guide</Link>{' '}
      breaks that down.
    </p>
    <Callout title="A score is one input" tone="disclosure">
      <p>
        Programs read a score alongside grades, letters, research and fit. A few points rarely
        decide an application, so aim for a clear target rather than chasing every point.
      </p>
    </Callout>

    <H2 section={S.nbme} />
    <p>
      Practice assessments are the best available predictor, but they are estimates. Most students
      take one or two in the final weeks and compare the result with a target. Scores from a single
      assessment can vary by several points, and the relationship between assessment form and real
      exam score is not exact. Use the trend across assessments and your question bank
      performance, not one number.
    </p>

    <H2 section={S.improve} />
    <ul>
      <li>
        <strong>Do questions during clerkships,</strong> not only afterward. It ties clinical
        experience to exam-style reasoning.
      </li>
      <li>
        <strong>Review every miss.</strong> The explanation is where most of the learning happens.
      </li>
      <li>
        <strong>Switch to timed, mixed blocks</strong> about four to six weeks out, since the real
        exam does not label the specialty.
      </li>
      <li>
        <strong>Repeat weak areas</strong> with spaced review rather than rereading content.
      </li>
    </ul>
    <p>
      See the <Link href="/blog/usmle-step-2-ck-study-guide">Step 2 CK study guide</Link> for a
      sample schedule.
    </p>
    <PostCta
      heading="Aim your Step 2 CK score where you need it"
      body="An adaptive engine that tracks what you keep missing and schedules reviews for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try the adaptive Step 2 CK Qbank free for 7 days"
      body="Short sets, reviews scheduled for you, and your weakest specialties prioritized automatically."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      This guide reflects publicly available USMLE program information as of this writing. The
      percentile figures are our own estimates, not official USMLE data. Passing standards, score
      distributions and policies are set by the NBME and FSMB and can change without notice, so
      confirm current details directly on{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>
      . MedPrep Institute is not affiliated with or endorsed by NBME, FSMB, USMLE, ECFMG or any
      other company named here. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'usmle-step-2-ck-score-percentile',
  title: 'USMLE Step 2 CK Score and Percentile: Passing, Average and What It Means',
  seoTitle: 'USMLE Step 2 CK Score & Percentile Guide',
  description:
    'Step 2 CK passing score, average, and an estimated score-to-percentile table, plus what counts as a good score and how to raise yours.',
  publishedAt: '2026-10-12T10:05:00+02:00',
  updatedAt: '2026-10-12T10:05:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Scoring',
  keywords: [
    'USMLE Step 2 CK score',
    'Step 2 CK percentile',
    'Step 2 CK passing score',
    'average Step 2 CK score',
    'good Step 2 CK score',
    'Step 2 CK score percentile chart',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
