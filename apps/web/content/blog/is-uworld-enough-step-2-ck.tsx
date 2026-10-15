import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=is-uworld-enough-step-2-ck`;

const S = {
  short: { id: 'short', title: 'The short answer' },
  who: { id: 'who', title: 'Who can stop at UWorld' },
  second: { id: 'second', title: 'When a second bank helps' },
  what: { id: 'what', title: 'What to add, and what it costs' },
  plan: { id: 'plan', title: 'A simple two-source plan' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Is UWorld enough for Step 2 CK?',
    answer:
      'For many students, yes, when paired with NBME and UWSA practice exams and careful review of misses. Students with weaker baselines or recurring weak areas often benefit from a second bank.',
  },
  {
    question: 'How many questions does UWorld have for Step 2 CK?',
    answer:
      'UWorld lists 4,250+ Step 2 CK questions.',
  },
  {
    question: 'Do I need two question banks for Step 2 CK?',
    answer:
      'No, but a second bank can help with weak areas, extra volume or spaced review.',
  },
  {
    question: 'What is the cheapest second question bank for Step 2 CK?',
    answer:
      'MedPrep Institute, at $40 per month or $110 for three months, with a 7-day free trial. USMLE-Rx\'s Qmax is $299 for 12 months.',
  },
  {
    question: 'Should I use AMBOSS and UWorld together?',
    answer:
      'Many students do. AMBOSS adds a library and score predictor, and you can use it as a second bank.',
  },
  {
    question: 'Is MedPrep a replacement for UWorld?',
    answer:
      'It is built differently, with adaptive practice and spaced repetition, and no self-assessments. Many students use it as a lower-cost second bank or as their main bank for daily practice.',
  },
];

const Body = () => (
  <>
    <p>
      UWorld is the default Step 2 CK question bank, and its Step 2 CK bank lists 4,250+
      questions. Whether it is enough on its own is one of the most common questions students
      ask. The honest answer is: often, with caveats.
    </p>

    <H2 section={S.short} />
    <p>
      Many students do well with UWorld as their main bank, paired with NBME and UWSA practice
      exams and careful review of misses. Even sources that sell competing banks say UWorld alone
      works for many candidates. A second bank is optional, and it helps most in specific cases.
    </p>

    <H2 section={S.who} />
    <ul>
      <li>You have a strong clerkship base and high baseline knowledge.</li>
      <li>You can protect full-time dedicated study.</li>
      <li>You review every explanation and re-test missed topics yourself.</li>
    </ul>

    <H2 section={S.second} />
    <ul>
      <li>You keep missing the same concepts and are not re-testing them on a schedule.</li>
      <li>You finished UWorld, or most of it, and still have weak systems.</li>
      <li>You want different question styles or more volume in specific areas.</li>
      <li>You need a lower-cost way to extend practice time past your UWorld plan.</li>
    </ul>
    <p>
      One caution from prep guides: a second bank that doubles your time without doubling your
      learning is not worth it. Choose it for a specific job.
    </p>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.what} />
    <ComparisonTable
      caption="Second-bank options for Step 2 CK"
      columns={[
        { key: 'bank', label: 'Option' },
        { key: 'cost', label: 'Published price' },
        { key: 'job', label: 'Best job' },
      ]}
      rows={[
        { id: 'medprep', featured: true, cells: { bank: 'MedPrep Institute', cost: '$40 per month, $110 per 3 months, $400 per year; 7-day free trial', job: 'Adaptive weak-area review with spaced repetition built in' } },
        { id: 'truelearn', cells: { bank: 'TrueLearn (Step 2 CK and shelf)', cost: 'See its site; lists 4,100+ questions', job: 'Shelf practice and national benchmarking' } },
        { id: 'amboss', cells: { bank: 'AMBOSS', cost: '$378 for 6 months, $448 for 12 months', job: 'Library and score predictor with the questions' } },
        { id: 'usmlerx', cells: { bank: 'USMLE-Rx Qmax', cost: '$299 for 12 months (Step 1 and Step 2 CK)', job: 'Students already using First Aid' } },
      ]}
      footnote="MedPrep counts question topics; each topic produces a full clinical vignette when you reach it. Prices are from each company's official pages as we last checked."
    />

    <H2 section={S.plan} />
    <ol>
      <li>Work through UWorld as your primary bank, by rotation if you can.</li>
      <li>Add MedPrep for daily adaptive practice on the concepts you keep missing.</li>
      <li>Take your practice assessments on the schedule in our{' '}
        <Link href="/blog/how-many-nbme-practice-exams-step-2-ck">NBME guide</Link>.</li>
      <li>Use the final weeks for timed, mixed blocks and your error log.</li>
    </ol>
    <p>
      Try the{' '}
      <Link href="/usmle/features/sample-questions/step-2">free Step 2 CK sample questions</Link>{' '}
      first, then see the{' '}
      <Link href="/usmle-step-2-question-bank">MedPrep Step 2 CK bank</Link> and our{' '}
      <Link href="/blog/uworld-vs-amboss">UWorld vs AMBOSS vs MedPrep</Link> comparison.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Add adaptive review to your Step 2 CK plan"
      body="$40 per month. 7-day free trial. Cancel anytime before day 7 and pay nothing."
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
  slug: 'is-uworld-enough-step-2-ck',
  title: 'Is UWorld Enough for Step 2 CK? When a Second Question Bank Helps',
  seoTitle: 'Is UWorld Enough for Step 2 CK? Second Qbank?',
  description:
    'Is UWorld alone enough for Step 2 CK? What the evidence says, who can stop at one bank, when a second bank helps and what to add for weak areas.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Question banks',
  keywords: [
    'is UWorld enough for Step 2 CK',
    'UWorld alone Step 2 CK',
    'second question bank Step 2 CK',
    'UWorld and AMBOSS Step 2 CK',
    'Step 2 CK UWorld questions',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
