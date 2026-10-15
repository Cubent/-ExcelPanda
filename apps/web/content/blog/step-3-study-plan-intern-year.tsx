import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-3-study-plan-intern-year`;

const S = {
  long: { id: 'long', title: 'How long should you study for Step 3?' },
  numbers: { id: 'numbers', title: 'How many questions and CCS cases?' },
  plan: { id: 'plan', title: 'A 4-week plan around a resident schedule' },
  ccs: { id: 'ccs', title: 'Do not skip the CCS software' },
  bank: { id: 'bank', title: 'Choosing a question bank for Step 3' },
  when: { id: 'when', title: 'When to take it' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'How long should I study for Step 3?',
    answer:
      'Most plans run two to eight weeks, with four weeks the most common. Strong Step 2 CK scores and a light schedule can shorten it.',
  },
  {
    question: 'How many UWorld questions should I do for Step 3?',
    answer:
      'One prep guide targets about 1,600 to 2,000 questions for an average background. UWorld lists 2,100+ Step 3 questions.',
  },
  {
    question: 'How many CCS cases should I do?',
    answer:
      'Suggestions range widely. One guide recommends 40 to 60 for an average background, with at least a few cases a day in the later weeks.',
  },
  {
    question: 'Can I study for Step 3 during intern year?',
    answer:
      'Yes, many residents do. Use short daily sets and protect post-call recovery. A two-week focused block helps if you have gaps.',
  },
  {
    question: 'What is the Step 3 passing score?',
    answer:
      '200 for exams taken on or after January 1, 2024.',
  },
  {
    question: 'Does MedPrep have CCS cases?',
    answer:
      'No. MedPrep covers Step 3 multiple-choice with spaced repetition. UWorld lists 90+ CCS cases if you want them.',
  },
];

const Body = () => (
  <>
    <p>
      Step 3 is the exam most people study for around a full-time job. Prep guides and resident
      forums mostly agree on the shape of a plan, even where their exact numbers differ. This guide
      pulls out the consistent parts and builds a four-week plan you can adapt.
    </p>

    <H2 section={S.long} />
    <p>
      Sources range from two to eight weeks, with four weeks the most common plan. Residents with a
      strong Step 2 CK score and a lighter rotation sometimes pass after about two focused weeks,
      while those with knowledge gaps or no CCS experience tend to plan longer. Step 3 is a
      two-day exam and still reports a three-digit score, with a passing standard of 200 for exams
      since January 1, 2024. See our{' '}
      <Link href="/blog/usmle-passing-scores-2026">passing scores guide</Link>.
    </p>

    <H2 section={S.numbers} />
    <p>
      Guidance varies, so treat numbers as rough. One prep guide targets about 1,600 to 2,000
      UWorld questions and 40 to 60 CCS cases for an average background, with a lower-effort
      version near 1,400 to 1,600 questions and 30 to 40 cases. UWorld lists 2,100+ Step 3
      questions and 90+ CCS cases, so those targets mean most of the bank rather than all of it.
    </p>

    <H2 section={S.plan} />
    <ComparisonTable
      caption="A 4-week Step 3 plan (adapt to your rotation)"
      columns={[
        { key: 'week', label: 'Week' },
        { key: 'focus', label: 'Focus' },
        { key: 'daily', label: 'Daily load' },
      ]}
      rows={[
        { id: 'w1', cells: { week: '1', focus: 'Internal medicine and ambulatory care questions; learn the CCS software', daily: '30 to 40 questions, 1 CCS case' } },
        { id: 'w2', cells: { week: '2', focus: 'Pediatrics, OB/GYN, surgery and psychiatry; biostatistics and ethics', daily: '40 questions, 2 CCS cases' } },
        { id: 'w3', cells: { week: '3', focus: 'Mixed timed blocks; weak areas from your errors', daily: '40 to 60 questions, 2 CCS cases' } },
        { id: 'w4', cells: { week: '4', focus: 'A practice assessment, review, light CCS; rest before Day 1', daily: 'Taper' } },
      ]}
      footnote="A template, not a guarantee. If you are post-call, do less and protect sleep."
    />    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.ccs} />
    <p>
      CCS is a separate, scored part of Step 3, and it is delivered in its own software that
      behaves differently from multiple-choice questions. Time you spend learning the interface
      pays off even if your clinical judgment is strong. Do cases from your question bank's CCS
      set, and practice entering orders and advancing time until it feels automatic.
    </p>

    <H2 section={S.bank} />
    <p>
      UWorld lists 90+ CCS case simulations for Step 3, which none of the other banks we compared
      list. If CCS practice matters to you, plan to use UWorld or another source for cases. For
      daily multiple-choice practice and spaced review of what you miss, MedPrep covers Step 3 with
      10,400+ question topics at $40 per month or $400 per year, and starts with a 7-day free
      trial. Try the{' '}
      <Link href="/usmle/features/sample-questions/step-3">free Step 3 sample questions</Link>{' '}
      first, with no account needed, or see the{' '}
      <Link href="/usmle-step-3-question-bank">MedPrep Step 3 question bank</Link>.
    </p>

    <H2 section={S.when} />
    <p>
      Many residents take Step 3 during intern year or early in PGY-2, depending on program
      timing and visa needs. Check your program's policy and your state's rules. Our{' '}
      <Link href="/blog/usmle-step-3-exam-dates-2026">Step 3 exam dates guide</Link> covers
      registration and scheduling.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Fit Step 3 prep around your shifts"
      body="Short daily sets with reviews scheduled for you. 7-day free trial."
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
  slug: 'step-3-study-plan-intern-year',
  title: 'USMLE Step 3 Study Plan for Intern Year: How Long, How Many Questions, How Many CCS Cases',
  seoTitle: 'Step 3 Study Plan for Intern Year (4 Weeks)',
  description:
    'How long to study for Step 3 during intern year, how many questions and CCS cases to aim for, and a realistic 4-week plan around a resident schedule.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Study plans',
  keywords: [
    'Step 3 study plan',
    'how long to study for Step 3',
    'Step 3 during intern year',
    'how many CCS cases Step 3',
    'Step 3 4 week study plan',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
