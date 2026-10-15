import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=free-usmle-practice-questions`;

const S = {
  sample: { id: 'free-medprep-sample-questions', title: 'Free MedPrep sample questions for every exam (no account needed)' },
  trials: { id: 'free-trials', title: 'Free trials from question banks' },
  official: { id: 'official-free-content', title: 'Official free content' },
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
      'Yes. MedPrep Institute publishes five free sample questions each for [Step 1](/usmle/features/sample-questions), [Step 2 CK](/usmle/features/sample-questions/step-2) and [Step 3](/usmle/features/sample-questions/step-3), with explanations for every answer choice and no account required. USMLE.org also publishes an interactive testing experience, and most question banks offer free trials.',
  },
  {
    question: 'Is there a free USMLE question bank?',
    answer:
      'MedPrep Institute gives a 7-day free trial of its full adaptive question bank, plus free sample questions with no account required. Lecturio lists a free tier with 1,000+ questions, and others offer five-day trials.',
  },
  {
    question: 'Where can I find free Step 1 questions with explanations?',
    answer:
      'MedPrep\'s [free Step 1 sample questions](/usmle/features/sample-questions) include a full explanation for every answer choice, and you do not need an account. For more, start the 7-day free trial.',
  },
  {
    question: 'Where can I find free Step 2 CK questions?',
    answer:
      'Try MedPrep\'s [free Step 2 CK sample questions](/usmle/features/sample-questions/step-2), then continue with its 7-day free trial. AMBOSS, TrueLearn and USMLE-Rx also offer five-day trials.',
  },
  {
    question: 'Are there free Step 3 or ABIM questions?',
    answer:
      'Yes. MedPrep has free [Step 3](/usmle/features/sample-questions/step-3) and [ABIM](/abim/features/sample-questions) sample questions, each with full explanations and no account required.',
  },
  {
    question: 'Does UWorld have a free trial?',
    answer:
      'UWorld\'s site lists a free trial for its Step 1 QBank, so check its page for current terms. MedPrep Institute offers a 7-day free trial plus free sample questions for every exam, with no account needed for the samples.',
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
      You do not have to pay to start practicing. MedPrep Institute publishes free sample
      questions for Step 1, Step 2 CK, Step 3 and the ABIM exam, with a full explanation for
      every answer choice and no account required, and a 7-day free trial of the full adaptive question bank. Between official content, free trials and
      sample sets, you can build a good picture of the exam and your weak areas before spending
      anything. This guide lists the free options we could confirm.
    </p>

    <H2 section={S.sample} />
    <p>
      Start here. Each page has five exam-style questions with a full explanation for every answer
      choice, not just the right one, and there is nothing to sign up for.
    </p>
    <ComparisonTable
      caption="Free MedPrep sample questions"
      columns={[
        { key: 'exam', label: 'Exam' },
        { key: 'what', label: 'What you get' },
        { key: 'go', label: 'Try it free' },
      ]}
      rows={[
        { id: 's1', featured: true, cells: { exam: 'USMLE Step 1', what: '5 questions, explanations for every choice', go: <Link href="/usmle/features/sample-questions">Free Step 1 questions</Link> } },
        { id: 's2', featured: true, cells: { exam: 'USMLE Step 2 CK', what: '5 questions, explanations for every choice', go: <Link href="/usmle/features/sample-questions/step-2">Free Step 2 CK questions</Link> } },
        { id: 's3', featured: true, cells: { exam: 'USMLE Step 3', what: '5 questions, explanations for every choice', go: <Link href="/usmle/features/sample-questions/step-3">Free Step 3 questions</Link> } },
        { id: 'abim', featured: true, cells: { exam: 'ABIM Internal Medicine', what: '5 questions, explanations for every choice', go: <Link href="/abim/features/sample-questions">Free ABIM questions</Link> } },
      ]}
      footnote="No account required. Want more than five? The 7-day free trial unlocks the full adaptive question bank."
    />
    <p>
      Prefer to see how a full session works? Read about{' '}
      <Link href="/usmle-step-1-practice-questions-exams">Step 1 practice questions and exams</Link>,
      or our dedicated{' '}
      <Link href="/usmle-step-1-question-bank">Step 1</Link>,{' '}
      <Link href="/usmle-step-2-question-bank">Step 2 CK</Link> and{' '}
      <Link href="/usmle-step-3-question-bank">Step 3</Link> question banks.
    </p>
    <PostCta
      heading="Finished the free questions? Keep going free for 7 days"
      body="Unlock the full adaptive question bank: NBME-style vignettes, missed concepts brought back on a schedule, and reviews planned for you."
      href={signup('after-samples')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.trials} />
    <ComparisonTable
      caption="Free trials and free tiers"
      columns={[
        { key: 'bank', label: 'Question bank' },
        { key: 'trial', label: 'Free option' },
      ]}
      rows={[
        { id: 'medprep', featured: true, cells: { bank: 'MedPrep Institute', trial: '7-day free trial, cancel anytime before day 7 and pay nothing' } },
        { id: 'amboss', cells: { bank: 'AMBOSS', trial: '5-day free trial' } },
        { id: 'truelearn', cells: { bank: 'TrueLearn', trial: '5-day trial with 120 questions' } },
        { id: 'usmlerx', cells: { bank: 'USMLE-Rx', trial: '5-day free trial, no card required' } },
        { id: 'lecturio', cells: { bank: 'Lecturio', trial: '7-day free trial, plus a free tier with 1,000+ questions and no card required' } },
      ]}
      footnote="UWorld's site also lists a free trial for its Step 1 QBank. Check its page for current terms."
    />
    <p>
      Trials are short, so start them when you can study daily. Use them on a block from your
      weakest system rather than a random set, so you learn how the explanations help you.
    </p>

    <H2 section={S.official} />
    <p>
      USMLE.org publishes official content outlines and an interactive testing experience so you can
      see the exam's format and interface. It will not replace a full question bank, but it is the
      most accurate preview of test day and costs nothing. The official NBME self-assessments are
      paid, but worth considering closer to your exam.
    </p>

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
  title: 'Free USMLE Practice Questions With Explanations (Step 1, 2 CK, 3, ABIM)',
  seoTitle: 'Free USMLE Practice Questions With Explanations',
  description:
    'Free USMLE Step 1, Step 2 CK, Step 3 and ABIM practice questions with full explanations, no account required, plus every free trial worth using.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Question banks',
  keywords: [
    'free USMLE practice questions',
    'free USMLE practice questions with explanations',
    'USMLE sample questions no sign up',
    'free ABIM practice questions',
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
