import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=free-120-step-2-ck`;

const S = {
  what: { id: 'what', title: 'What is the Free 120?' },
  get: { id: 'get', title: 'Where to get it' },
  when: { id: 'when', title: 'When to take it' },
  score: { id: 'score', title: 'Does the Free 120 predict your score?' },
  next: { id: 'next', title: 'What to do after the Free 120' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What is the Free 120 for Step 2 CK?',
    answer:
      'The community name for the official Step 2 CK Sample Test Questions published free by USMLE. It gives you real question style and interface practice.',
  },
  {
    question: 'Where do I get the Free 120?',
    answer:
      'From the Step 2 CK section of USMLE.org. It has been offered as a PDF and as an interactive version.',
  },
  {
    question: 'Is the Free 120 a good predictor of my Step 2 CK score?',
    answer:
      'It is a useful sanity check but not a precise predictor, because a 120-question set carries more noise than a full exam.',
  },
  {
    question: 'Where can I find more free Step 2 CK questions?',
    answer:
      'MedPrep publishes [free Step 2 CK sample questions](/usmle/features/sample-questions/step-2) with full explanations and no account required, plus a 7-day free trial of the full bank.',
  },
  {
    question: 'When should I take the Free 120?',
    answer:
      'Early for format familiarity, or mid-prep as one of your practice assessments. Avoid taking it the day before the exam.',
  },
];

const Body = () => (
  <>
    <p>
      Search "Free 120" and you will find it mentioned in nearly every Step 2 CK study plan. It is
      the USMLE program's own sample test, it costs nothing, and it is the closest thing to
      official test-day format you can get for free.
    </p>

    <H2 section={S.what} />
    <p>
      "Free 120" is the community nickname for the official Step 2 CK Sample Test Questions
      published by USMLE. The name comes from the question count. It uses the real exam's question
      style and interface conventions, which makes it a good format preview.
    </p>

    <H2 section={S.get} />
    <p>
      The set is free on USMLE.org, and has been offered both as a PDF and as an interactive
      version that mimics the testing interface. Download or launch it from the Step 2 CK section
      of the USMLE website, since links and formats can change.
    </p>

    <H2 section={S.when} />
    <ul>
      <li><strong>Early:</strong> to see the format and find out how much you remember from clerkships.</li>
      <li><strong>Mid-prep:</strong> as one of your three to five full practice assessments (see our guide to{' '}
        <Link href="/blog/how-many-nbme-practice-exams-step-2-ck">how many practice exams to take</Link>).</li>
      <li><strong>Not on the last day:</strong> save energy for rest and review.</li>
    </ul>

    <H2 section={S.score} />
    <p>
      Students treat it as a sanity check, not a precise predictor. It is a small set, and a result
      on 120 questions has more noise than a full-length exam. Use it to spot weak systems and get
      used to the interface, and rely on full NBME forms and UWSA for scored estimates.
    </p>

    <H2 section={S.next} />
    <p>
      After the Free 120, practice the question style at volume. MedPrep publishes free Step 2 CK
      sample questions with a full explanation for every answer choice and no account required:{' '}
      <Link href="/usmle/features/sample-questions/step-2">try the free Step 2 CK questions</Link>.
      When you want more, the 7-day free trial unlocks the full adaptive Step 2 CK bank, which
      brings back the concepts you miss. See the{' '}
      <Link href="/usmle-step-2-question-bank">MedPrep Step 2 CK question bank</Link> and our{' '}
      <Link href="/blog/free-usmle-practice-questions">free practice questions guide</Link>.
    </p>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Keep practicing free: 7-day trial"
      body="Step 2 CK adaptive practice with reviews scheduled for you."
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
  slug: 'free-120-step-2-ck',
  title: 'The Free 120 for Step 2 CK: What It Is, Where to Get It and How to Use It',
  seoTitle: 'Free 120 Step 2 CK: What It Is & How to Use It',
  description:
    'What the Free 120 is, where to get the official Step 2 CK sample test for free, when to take it, and where to practice next with free questions.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Study plans',
  keywords: [
    'Free 120 Step 2 CK',
    'Free 120 USMLE',
    'Step 2 CK Free 120 score',
    'official Step 2 CK sample questions',
    'USMLE Step 2 CK sample test',
  ],
  readingMinutes: 5,
  sections: Object.values(S),
  faqs,
  Body,
};
