import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=ai-tutor-for-usmle`;

const S = {
  what: { id: 'what', title: 'What an AI tutor is good at' },
  limits: { id: 'limits', title: 'Where an AI tutor falls short' },
  rules: { id: 'rules', title: 'Five rules for using one' },
  medprep: { id: 'medprep', title: 'MedPrep\'s AI Tutor' },
  combine: { id: 'combine', title: 'How to combine it with spaced repetition' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Can an AI tutor help me study for the USMLE?',
    answer:
      'Yes, for understanding: explaining why choices are wrong, re-explaining concepts and walking through vignettes. It is less reliable as a source of facts, so verify specifics.',
  },
  {
    question: 'Is an AI tutor accurate enough for Step 1 and Step 2 CK?',
    answer:
      'Not always. AI can state wrong facts confidently, so treat it as a study partner and check against the explanation or a standard reference.',
  },
  {
    question: 'How should I use an AI tutor with a question bank?',
    answer:
      'Commit to an answer first, ask why a choice is wrong, verify specifics, write the concept in your words and re-test it in a few days.',
  },
  {
    question: 'Does MedPrep have an AI tutor?',
    answer:
      'Yes. MedPrep\'s AI Tutor is available while you practice, to explain concepts, why an answer choice is wrong or how to approach a vignette.',
  },
  {
    question: 'Does an AI tutor replace explanations?',
    answer:
      'No. Physician-reviewed explanations remain the source of truth, and the tutor helps you understand them.',
  },
  {
    question: 'Can I try MedPrep\'s AI Tutor free?',
    answer:
      'Yes, with the 7-day free trial. You can also try the free [sample questions](/usmle/features/sample-questions) with no account.',
  },
];

const Body = () => (
  <>
    <p>
      AI tutors are showing up in question banks, and students are asking whether they help or just
      sound confident. They help with understanding, they are unreliable as a source of facts, and
      the way you use one matters more than which one you pick.
    </p>

    <H2 section={S.what} />
    <ul>
      <li><strong>Explaining why an answer choice is wrong,</strong> in plain language and at your level.</li>
      <li><strong>Re-explaining a concept</strong> a different way when the written explanation did not land.</li>
      <li><strong>Walking through a vignette</strong> step by step, from clues to diagnosis to next step.</li>
      <li><strong>Generating practice variations</strong> on a concept you keep missing.</li>
    </ul>

    <H2 section={S.limits} />
    <ul>
      <li>It can state wrong facts confidently, including drug doses, cutoffs and guideline details.</li>
      <li>It may not match the exam's expected answer when guidelines have changed or differ.</li>
      <li>It can encourage passive learning if you ask for answers before attempting the question.</li>
    </ul>
    <p>
      Treat it as a study partner, not an authority. The question bank's reviewed explanations and
      standard references remain the source of truth.
    </p>

    <H2 section={S.rules} />
    <ol>
      <li>Commit to an answer before you ask for help.</li>
      <li>Ask why, not what: "why is this choice wrong?" beats "what is the answer?"</li>
      <li>Verify any specific number or guideline in the explanation or a reference.</li>
      <li>Write the concept in your own words after the tutor explains it.</li>
      <li>Re-test the concept in a few days. Understanding fades without review.</li>
    </ol>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.medprep} />
    <p>
      MedPrep's AI Tutor sits inside the practice experience. Ask it about a concept, why an answer
      choice is wrong, or how to think through a vignette, while you are working on the question.
      It works alongside the physician-reviewed explanations, which stay the source of truth. Like
      any AI tool it can make mistakes, so check specifics against the explanation. See the{' '}
      <Link href="/usmle-step-1-practice-questions-exams">Step 1 practice questions and exams</Link>{' '}
      page, or try the free sample questions:{' '}
        <Link href="/usmle/features/sample-questions">Step 1</Link>,{' '}
        <Link href="/usmle/features/sample-questions/step-2">Step 2 CK</Link> and{' '}
        <Link href="/usmle/features/sample-questions/step-3">Step 3</Link>.
    </p>

    <H2 section={S.combine} />
    <p>
      Understanding a concept once is not retention. MedPrep pairs the tutor with an adaptive engine
      and spaced repetition: a missed question flags the concept, and variations come back over the
      following days. That loop, explain then re-test on a schedule, is what turns a good
      explanation into a point on exam day. Start with the 7-day free trial. Related reading: our
      guides to{' '}
      <Link href="/blog/how-to-review-missed-usmle-questions">reviewing missed questions</Link> and{' '}
      <Link href="/blog/anki-vs-question-bank-usmle">Anki vs a question bank</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try MedPrep's AI Tutor free for 7 days"
      body="Ask why, then re-test it on a schedule. Cancel anytime before day 7 and pay nothing."
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
  slug: 'ai-tutor-for-usmle',
  title: 'AI Tutor for USMLE: What It Can Do, Where It Falls Short and How to Use One',
  seoTitle: 'AI Tutor for USMLE: What It Can and Cannot Do',
  description:
    'How an AI tutor can help with USMLE questions, where it can mislead you, and how to use one safely inside a question bank, including MedPrep\'s AI Tutor.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Study plans',
  keywords: [
    'AI tutor for USMLE',
    'USMLE AI tutor',
    'AI for Step 1 and Step 2 CK',
    'AI explains USMLE questions',
    'best AI tutor for USMLE',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
