import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=usmle-attempt-limits-retake-rules`;

const S = {
  short: { id: 'short', title: 'The short answer' },
  rules: { id: 'rules', title: 'The USMLE attempt rules' },
  count: { id: 'count', title: 'What counts as an attempt' },
  state: { id: 'state', title: 'State board and ECFMG rules' },
  after: { id: 'after', title: 'If you are near the limit' },
  older: { id: 'older', title: 'Why older guides say six attempts' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'How many times can you take USMLE Step 1?',
    answer:
      'Up to four times. Incomplete attempts count, and after four unsuccessful attempts you are ineligible to apply for any Step.',
  },
  {
    question: 'How many times can you take Step 2 CK?',
    answer:
      'Up to four times, with the same limits on spacing and the same rules about incomplete attempts.',
  },
  {
    question: 'How many times can you take Step 3?',
    answer:
      'Also four attempts, though state boards can set their own limits on attempts for licensure.',
  },
  {
    question: 'Can you take a USMLE Step more than three times in a year?',
    answer:
      'No. You may not take the same exam more than three times within a 12-month period.',
  },
  {
    question: 'How long must you wait for a fourth attempt?',
    answer:
      'ECFMG lists at least 12 months after your first attempt and at least six months after your most recent one. Confirm on USMLE.org.',
  },
  {
    question: 'Can you retake a Step you passed to raise your score?',
    answer:
      'Generally no. USMLE does not allow retaking a Step you have already passed.',
  },
];

const Body = () => (
  <>
    <p>
      Fear of running out of attempts drives a lot of searches. The good news is that the rules are
      simple. This guide sets them out as we last checked them, and points to where to confirm each
      one.
    </p>

    <H2 section={S.short} />
    <p>
      You can take each Step up to four times. You cannot take the same exam more than three times
      in any 12-month period, and a fourth attempt has a longer waiting period. After four
      unsuccessful attempts at a Step, you are ineligible to apply for any Step.
    </p>

    <H2 section={S.rules} />
    <ul>
      <li><strong>Four attempts per Step</strong> (Step 1, Step 2 CK and Step 3 each).</li>
      <li><strong>Three attempts in 12 months</strong> at the same exam, at most.</li>
      <li>
        <strong>Fourth attempt timing:</strong> ECFMG's booklet lists at least 12 months after your
        first attempt at that exam and at least six months after your most recent attempt.
      </li>
      <li><strong>No retake after a pass:</strong> USMLE generally does not allow you to retake a Step you have passed.</li>
    </ul>

    <H2 section={S.count} />
    <p>
      Incomplete attempts count toward the limit, and attempts at the formerly administered Step 2
      CS count too. Treat any test appointment where you begin the exam as an attempt.
    </p>

    <H2 section={S.state} />
    <p>
      For licensure, state medical boards may limit the number of attempts allowed to pass each
      Step, sometimes more strictly than USMLE. The FSMB site lists state-specific details. If you
      are an international graduate, also check ECFMG's requirements and timelines.
    </p>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.after} />
    <p>
      If you have already failed once, the most useful move is a diagnosis, not a date. Find the
      cause, rebuild with timed, mixed practice, and schedule only when assessments show a clear
      margin. Our{' '}
      <Link href="/blog/failed-usmle-step-retake-guide">failed Step retake guide</Link> walks
      through it, and the{' '}
      <Link href="/blog/usmle-passing-scores-2026">passing scores page</Link> lists current
      standards, including the Step 2 CK 218 standard that applies to retakers.
    </p>

    <H2 section={S.older} />
    <p>
      The four-attempt limit took effect in 2021. Older material, including a 2018 USMLE bulletin,
      lists a six-attempt limit. If a guide mentions six, it is out of date.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Plan your next attempt around data"
      body="Adaptive practice with reviews scheduled for you. 7-day free trial."
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
  slug: 'usmle-attempt-limits-retake-rules',
  title: 'How Many Times Can You Take USMLE Step 1, Step 2 CK and Step 3? Attempt Limits Explained',
  seoTitle: 'USMLE Attempt Limits: How Many Times Can You Retake?',
  description:
    'USMLE attempt limits explained: four attempts per Step, three in 12 months, the wait before a fourth attempt, what counts, and state board rules.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Scoring',
  keywords: [
    'how many times can you take USMLE Step 1',
    'USMLE attempt limit',
    'USMLE retake rules',
    'USMLE 4 attempts',
    'how many times can you fail Step 2 CK',
  ],
  readingMinutes: 5,
  sections: Object.values(S),
  faqs,
  Body,
};
