import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=usmle-timed-vs-tutor-mode`;

const S = {
  short: { id: 'short', title: 'The short answer' },
  blocks: { id: 'blocks', title: 'The exam format changed: practice 20-question blocks' },
  schedule: { id: 'schedule', title: 'A simple schedule: tutor early, timed later' },
  why: { id: 'why', title: 'Why untimed scores can mislead' },
  review: { id: 'review', title: 'The review step matters either way' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Should I use timed or tutor mode?',
    answer:
      'Tutor mode early, while learning concepts, and timed, mixed blocks as the exam approaches.',
  },
  {
    question: 'When should I switch to timed mode?',
    answer:
      'Commonly once dedicated study begins, with most blocks timed in the final three to four weeks.',
  },
  {
    question: 'How many questions should a block have now?',
    answer:
      'The real exam now uses 30-minute blocks of up to 20 questions for Step 1 (from May 14, 2026) and Step 2 CK (from May 7, 2026), so 20-question timed sets match it best.',
  },
  {
    question: 'Do tutor-mode scores predict my exam score?',
    answer:
      'Not well. Untimed scores can overstate readiness, so check your performance in timed blocks.',
  },
  {
    question: 'Do I need to review questions I got right?',
    answer:
      'Yes, especially guesses and right answers for the wrong reasons.',
  },
];

const Body = () => (
  <>
    <p>
      Almost every question bank offers tutor mode and timed mode, and students argue about which
      to use. The consistent advice is that the answer changes over time: tutor mode while you are
      learning, timed mode as the exam gets close.
    </p>

    <H2 section={S.short} />
    <p>
      Use tutor mode early, when your aim is to understand concepts and learn from explanations
      right after each question. Switch to timed, mixed blocks as dedicated study progresses, so
      you build pacing and stamina. UWorld's own guidance follows the same pattern.
    </p>

    <H2 section={S.blocks} />
    <p>
      Older advice recommends 40-question blocks, which matched the old format. The exam changed:
      Step 1 moved to fourteen 30-minute blocks of up to 20 questions for exams on or after May 14,
      2026, and Step 2 CK moved to sixteen 30-minute blocks from May 7, 2026. If you are practicing
      for those, a timed set of about 20 questions in 30 minutes is the unit that matches the real
      exam. See our{' '}
      <Link href="/blog/usmle-step-2-ck-exam-dates-2026">Step 2 CK exam dates guide</Link> and{' '}
      <Link href="/blog/usmle-step-1-exam-dates-2026">Step 1 exam dates guide</Link> for the format
      details.
    </p>

    <H2 section={S.schedule} />
    <ComparisonTable
      caption="A tutor-to-timed progression"
      columns={[
        { key: 'phase', label: 'Phase' },
        { key: 'mode', label: 'Mode' },
        { key: 'why', label: 'Why' },
      ]}
      rows={[
        { id: 'early', cells: { phase: 'Early', mode: 'Mostly tutor, untimed, by system', why: 'Learn concepts from explanations while they are fresh' } },
        { id: 'mid', cells: { phase: 'Middle', mode: 'About half timed, mixed blocks', why: 'Start building pace without losing review depth' } },
        { id: 'late', cells: { phase: 'Final 3 to 4 weeks', mode: 'Mostly timed, 20-question blocks, mixed', why: 'Rehearse the real exam rhythm and endurance' } },
      ]}
      footnote="One common pattern from prep guides. Adjust to your baseline and timeline."
    />    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.why} />
    <p>
      Untimed tutor-mode scores tend to overstate how you will do under exam conditions, because you
      can read explanations after each question and take as long as you like. Timed blocks show
      whether you can reach the right answer at pace.
    </p>

    <H2 section={S.review} />
    <p>
      Whatever mode you use, the learning happens in review. Read the explanation for every
      question, including the ones you got right, and log the concepts you missed. See our guide
      to{' '}
      <Link href="/blog/how-to-review-missed-usmle-questions">reviewing missed questions</Link>.
      MedPrep brings missed concepts back for you through spaced repetition, so you are not
      relying on memory to revisit them. Try the free sample questions to see how explanations
      work:{' '}
        <Link href="/usmle/features/sample-questions">Step 1</Link>,{' '}
        <Link href="/usmle/features/sample-questions/step-2">Step 2 CK</Link> and{' '}
        <Link href="/usmle/features/sample-questions/step-3">Step 3</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Practice at exam pace"
      body="Timed, mixed practice with reviews scheduled for you. 7-day free trial."
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
  slug: 'usmle-timed-vs-tutor-mode',
  title: 'Timed vs Tutor Mode for USMLE Question Banks: When to Switch (and the New 20-Question Blocks)',
  seoTitle: 'Timed vs Tutor Mode: When to Switch for USMLE',
  description:
    'When to use tutor mode and when to switch to timed blocks for Step 1 and Step 2 CK, and how the new 30-minute, 20-question exam blocks change practice.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Study plans',
  keywords: [
    'timed vs tutor mode UWorld',
    'tutor mode vs timed mode',
    'USMLE timed blocks',
    '20 question blocks Step 1',
    'UWorld timed or tutor',
  ],
  readingMinutes: 5,
  sections: Object.values(S),
  faqs,
  Body,
};
