import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=what-is-a-good-uworld-percentage`;

const S = {
  short: { id: 'short', title: 'The short answer' },
  typical: { id: 'typical', title: 'What do students typically score?' },
  predict: { id: 'predict', title: 'How well does UWorld percentage predict your score?' },
  depends: { id: 'depends', title: 'Why your percentage depends on how you use it' },
  track: { id: 'track', title: 'What to track instead' },
  improve: { id: 'improve', title: 'How to raise it' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What is a good UWorld percentage?',
    answer:
      'There is no official benchmark. One prep guide reports first-pass averages around 60 to 65% and treats percentages as learning metrics, not predictions.',
  },
  {
    question: 'Does UWorld percentage predict my Step 1 or Step 2 CK score?',
    answer:
      'Only loosely. Completing UWorld at least once is associated with better Step 1 scores, but timed self-assessments predict better than percentage correct.',
  },
  {
    question: 'Is 60% a good UWorld score?',
    answer:
      'It is in the range commonly reported for first passes, but it depends on your mode, pass number and timing. Track the trend and your weak areas.',
  },
  {
    question: 'Why is my timed percentage lower than tutor mode?',
    answer:
      'Timed blocks add pace pressure and remove immediate feedback, so scores are usually lower and closer to exam conditions.',
  },
  {
    question: 'Should I redo UWorld questions?',
    answer:
      'Many students redo missed or flagged questions rather than the whole bank, re-testing weak concepts a few days after first review.',
  },
  {
    question: 'How can I improve my percentage?',
    answer:
      'Review every explanation, log your misses, re-test them on a schedule and move to timed mixed blocks as the exam nears.',
  },
];

const Body = () => (
  <>
    <p>
      Nearly every UWorld user checks their percentage correct daily and wonders what it means. The
      short version is that it is a learning metric, not an exam score, and it predicts less than
      most people hope.
    </p>

    <H2 section={S.short} />
    <p>
      There is no official conversion from UWorld percentage to your exam result. One prep guide
      reports that average first-pass scores hover around 60 to 65%, and treats UWorld percentages
      as learning metrics rather than predictions. Use yours as a trend and a weak-area map, not as
      a number to compare with others.
    </p>

    <H2 section={S.typical} />
    <p>
      Students commonly start lower in early blocks and improve as they learn, often finishing a
      first pass higher than they started. One shared score report describes a first pass starting
      in the 40s and ending in the high 70s, for a 64% overall. That is a single anecdote, but the
      pattern of rising percentages as you learn is common.
    </p>

    <H2 section={S.predict} />
    <p>
      Research and community data say the relationship is real but modest. One study found that
      completing the UWorld bank at least once was positively associated with Step 1 scores. A
      student-reported survey on r/Step2 in 2021 estimated how well different practice measures
      explained real Step 2 CK scores: UWorld first-pass percentage explained about half of the
      variation (r² about 0.5), against about 0.6 for UWSA 2 and 0.63 for NBME 10. That survey is
      self-reported and unvalidated, so treat it as rough.
    </p>
    <p>
      The practical takeaway matches what prep guides say: timed self-assessments beat raw
      percentage correct as a predictor. See{' '}
      <Link href="/blog/how-many-nbme-practice-exams-step-2-ck">how many practice exams to take</Link>.
    </p>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.depends} />
    <ul>
      <li><strong>Mode:</strong> tutor-mode percentages run higher than timed ones.</li>
      <li><strong>Pass number:</strong> a second pass is easier because you have seen the questions.</li>
      <li><strong>Block selection:</strong> blocks by system you know well inflate the number.</li>
      <li><strong>Guessing and fatigue:</strong> late-day blocks score lower.</li>
    </ul>

    <H2 section={S.track} />
    <ul>
      <li>Your <strong>timed, mixed-block</strong> percentage across the last two weeks.</li>
      <li>Your <strong>score on full assessments</strong> (NBME, UWSA).</li>
      <li>The <strong>concepts you keep missing</strong>, not just how many.</li>
      <li>Whether your <strong>pace</strong> fits the new 20-question, 30-minute blocks. See our{' '}
        <Link href="/blog/usmle-timed-vs-tutor-mode">timed vs tutor mode guide</Link>.</li>
    </ul>

    <H2 section={S.improve} />
    <p>
      Review every explanation, log the concepts you miss, and re-test them within days, not weeks.
      MedPrep does that for you: the adaptive engine flags the concept behind each missed question
      and brings variations back through spaced repetition, so your weak areas improve instead of
      repeating. Start with the free sample questions:{' '}
        <Link href="/usmle/features/sample-questions">Step 1</Link>,{' '}
        <Link href="/usmle/features/sample-questions/step-2">Step 2 CK</Link> and{' '}
        <Link href="/usmle/features/sample-questions/step-3">Step 3</Link>. Then try the 7-day free trial.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Turn your misses into points"
      body="Adaptive practice that brings missed concepts back on a schedule. 7-day free trial."
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
  slug: 'what-is-a-good-uworld-percentage',
  title: 'What Is a Good UWorld Percentage? What It Does (and Does Not) Tell You',
  seoTitle: 'What Is a Good UWorld Percentage?',
  description:
    'What UWorld percentage correct means for Step 1 and Step 2 CK, typical first-pass averages, how well it predicts your score, and what to track instead.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Study plans',
  keywords: [
    'what is a good UWorld percentage',
    'UWorld percentage Step 1',
    'UWorld first pass average',
    'UWorld percent correct Step 2 CK',
    'does UWorld percentage predict score',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
