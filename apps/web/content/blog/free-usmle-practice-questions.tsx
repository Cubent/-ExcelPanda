import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=free-usmle-practice-questions`;

const S = {
  official: { id: 'official', title: 'Official free content' },
  trials: { id: 'trials', title: 'Free trials from question banks' },
  sample: { id: 'sample', title: 'Free sample questions on MedPrep' },
  school: { id: 'school', title: 'Check your school first' },
  use: { id: 'use', title: 'How to get the most from free practice' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Are there free USMLE practice questions?',
    answer:
      'Yes. USMLE.org publishes an interactive testing experience and content outlines, most question banks offer free trials, and MedPrep publishes free sample questions for Steps 1, 2 CK and 3.',
  },
  {
    question: 'Is there a free USMLE question bank?',
    answer:
      'Lecturio lists a free tier with 1,000+ questions. Others offer time-limited trials of five to seven days.',
  },
  {
    question: 'Does UWorld have a free trial?',
    answer:
      'We could not confirm one on UWorld\'s official pages.',
  },
  {
    question: 'Where can I find free Step 2 CK questions?',
    answer:
      'Use trials from AMBOSS, TrueLearn, USMLE-Rx or MedPrep, and the free Step 2 CK sample questions on the MedPrep site.',
  },
  {
    question: 'Can my school give me a question bank?',
    answer:
      'Often. Ask your dean\'s office or library about institutional access before you pay.',
  },
];

const Body = () => (
  <>
    <p>
      You do not have to pay to start practicing. Between official content, free trials and
      sample sets, you can build a good picture of the exam and your weak areas before spending
      anything. This guide lists the free options we could confirm.
    </p>

    <H2 section={S.official} />
    <p>
      USMLE.org publishes official content outlines and an interactive testing experience so you can
      see the exam's format and interface. It will not replace a full question bank, but it is the
      most accurate preview of test day and costs nothing. The official NBME self-assessments are
      paid, but worth considering closer to your exam.
    </p>

    <H2 section={S.trials} />
    <ComparisonTable
      caption="Free trials and free tiers"
      columns={[
        { key: 'bank', label: 'Question bank' },
        { key: 'trial', label: 'Free option' },
      ]}
      rows={[
        { id: 'amboss', cells: { bank: 'AMBOSS', trial: '5-day free trial' } },
        { id: 'truelearn', cells: { bank: 'TrueLearn', trial: '5-day trial with 120 questions' } },
        { id: 'usmlerx', cells: { bank: 'USMLE-Rx', trial: '5-day free trial, no card required' } },
        { id: 'lecturio', cells: { bank: 'Lecturio', trial: '7-day free trial, plus a free tier with 1,000+ questions and no card required' } },
        { id: 'medprep', featured: true, cells: { bank: 'MedPrep Institute', trial: '7-day free trial, cancel anytime before day 7 and pay nothing' } },
      ]}
      footnote="We could not confirm a free trial for UWorld on its official pages."
    />
    <p>
      Trials are short, so start them when you can study daily. Use them on a block from your
      weakest system rather than a random set, so you learn how the explanations help you.
    </p>

    <H2 section={S.sample} />
    <p>
      MedPrep publishes free sample questions with explanations for each exam:{' '}
      <Link href="/usmle/features/sample-questions">Step 1</Link>,{' '}
      <Link href="/usmle/features/sample-questions/step-2">Step 2 CK</Link> and{' '}
      <Link href="/usmle/features/sample-questions/step-3">Step 3</Link>. They are a quick way to
      see the question style before you start a trial.
    </p>
    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.school} />
    <p>
      Many medical schools provide institutional access to at least one question bank. Ask your
      dean's office or library before you pay, since it could cover your primary bank.
    </p>

    <H2 section={S.use} />
    <ul>
      <li>Do timed blocks, not just single questions.</li>
      <li>Read every explanation, including for questions you got right.</li>
      <li>Write down the concepts you missed and revisit them in a few days.</li>
    </ul>
    <p>
      Once you know what suits you, see the{' '}
      <Link href="/blog/usmle-question-bank-cost">price per month comparison</Link> and the{' '}
      <Link href="/blog/best-usmle-question-banks">full question bank guide</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Start with a free 7-day trial"
      body="Practice NBME-style vignettes and see which concepts the engine brings back."
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
  slug: 'free-usmle-practice-questions',
  title: 'Free USMLE Practice Questions: Where to Get Them (Step 1, 2 CK, 3)',
  seoTitle: 'Free USMLE Practice Questions (Step 1, 2 CK, 3)',
  description:
    'Every legitimate way to practice USMLE questions for free: official sample content, free trials from major question banks, and school access.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Question banks',
  keywords: [
    'free USMLE practice questions',
    'free USMLE Step 1 questions',
    'free Step 2 CK questions',
    'free USMLE question bank',
    'USMLE sample questions',
  ],
  readingMinutes: 5,
  sections: Object.values(S),
  faqs,
  Body,
};
