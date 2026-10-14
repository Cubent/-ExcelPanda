import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-2-ck-exam-dates-2026`;

const S = {
  when: { id: 'when-can-i-take-step-2-ck', title: 'When can I take the USMLE Step 2 CK exam?' },
  eligible: { id: 'who-is-eligible', title: 'Who is eligible to take Step 2 CK?' },
  register: { id: 'how-do-i-register', title: 'How do I register for Step 2 CK?' },
  schedule: { id: 'how-far-in-advance', title: 'How far in advance can I schedule my Step 2 CK exam?' },
  cost: { id: 'how-much-does-it-cost', title: 'How much does it cost to register for Step 2 CK in 2026?' },
  reschedule: { id: 'change-my-exam-date', title: 'How can I change my Step 2 CK exam date?' },
  format: { id: 'exam-format-change', title: 'Did the Step 2 CK exam format change in 2026?' },
  results: { id: 'when-will-i-get-results', title: 'When will I get my Step 2 CK results?' },
  preparing: { id: 'preparing-for-the-exam', title: 'Preparing for the exam' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Is there a fixed USMLE Step 2 CK exam date in 2026?',
    answer:
      'No. You apply for a roughly three-month eligibility period, then book an actual appointment inside that window through Prometric, on a first-come, first-served basis.',
  },
  {
    question: 'What changed about Step 2 CK registration in 2026?',
    answer:
      'International applicants moved to registering through FSMB, starting January 12, 2026. US and Canadian applicants continue to register through NBME, as of a service transition on January 26, 2026.',
  },
  {
    question: 'Did the Step 2 CK exam format change in 2026?',
    answer:
      'Yes. As of May 7, 2026, Step 2 CK moved from eight 60-minute blocks to sixteen 30-minute blocks, with more, shorter breaks. The total question count and testing day length stayed the same.',
  },
  {
    question: 'Is Step 2 CK pass/fail like Step 1?',
    answer:
      'No. Step 1 moved to pass/fail in 2022, but Step 2 CK still reports a three-digit score.',
  },
  {
    question: 'How long do Step 2 CK results take?',
    answer:
      'Typically within four weeks, though USMLE recommends allowing at least eight weeks before asking about a delayed report.',
  },
  {
    question: 'Does the new block format change how I should study?',
    answer:
      'The content and total question count are unchanged, so what you study does not need to change. Practicing in shorter timed sets can help you adjust to the new block rhythm before test day.',
  },
  {
    question: 'What about Step 3 exam dates?',
    answer:
      'Step 3 follows the same eligibility-period system, but it has its own prerequisites, fee and two-day format. See our [USMLE Step 3 exam dates guide](/blog/usmle-step-3-exam-dates-2026) for the specifics.',
  },
];

const Body = () => (
  <>
    <p>
      Step 2 CK brings its own set of practical questions: when to sit it relative to your
      clerkships, how registration and scheduling actually work, what it costs, and how the 2026
      format change affects test day. This guide walks through those questions based on the
      current USMLE instructions, alongside what is different for the 2026 cycle.
    </p>

    <H2 section={S.when} />
    <p>
      Most students take Step 2 CK during or shortly after their core clerkships, once they have
      clinical exposure across the major specialties. Because it still reports a three-digit
      score, and is now the main standardized score most residency programs see from applicants,
      many students time it deliberately around their residency application timeline rather than
      as early as possible.
    </p>
    <p>
      The exam is offered most of the year, on most weekdays and many Saturdays, except for major
      holidays and a maintenance window NBME and FSMB have historically used in early January.
      Exact closures are published on the official test center calendar for the current year.
    </p>

    <H2 section={S.eligible} />
    <ul>
      <li>
        <strong>US and Canadian MD students:</strong> officially enrolled in, or a graduate of, an
        LCME-accredited medical school in the US or Canada that awards an MD degree.
      </li>
      <li>
        <strong>US DO students:</strong> officially enrolled in, or a graduate of, a
        COCA-accredited medical school in the US that awards a DO degree.
      </li>
      <li>
        <strong>International medical graduates (IMGs):</strong> officially enrolled in, or a
        graduate of, a medical school outside the US and Canada that is listed in the World
        Directory of Medical Schools and meets ECFMG eligibility requirements.
      </li>
    </ul>

    <H2 section={S.register} />
    <p>
      As of 2026, US and Canadian applicants register for Step 2 CK directly through the{' '}
      <a href="https://www.nbme.org/" target="_blank" rel="noopener noreferrer">
        NBME
      </a>
      . International applicants register through the{' '}
      <a href="https://www.fsmb.org/" target="_blank" rel="noopener noreferrer">
        FSMB
      </a>
      , as of a service transition that took effect January 12, 2026 for international applicants
      and January 26, 2026 for US and Canadian applicants, covering all three Step exams. If you
      are working from an older guide, confirm you are using the current portal for your applicant
      type before you start.
    </p>
    <p>
      The process itself is the same shape as it has always been: register as a first-time user to
      receive your USMLE ID if you do not already have one from Step 1, submit a new application,
      and select the eligibility period you want to test in. You will then receive a scheduling
      permit by email, which you use to book your actual appointment through Prometric.
    </p>

    <H2 section={S.schedule} />
    <p>
      You can schedule your Step 2 CK appointment through Prometric up to six months in advance.
      When you apply, you select an eligibility period, a roughly three-month window during which
      you intend to test, then book a specific date and test center inside that window on a
      first-come, first-served basis.
    </p>
    <p>
      If your exam is coming up fast, our{' '}
      <Link href="/blog/usmle-step-2-ck-study-guide">USMLE Step 2 CK study guide</Link> has a
      sample four-week schedule to help you use clerkship-year knowledge efficiently in the time
      you have left.
    </p>

    <H2 section={S.cost} />
    <p>
      Based on NBME's published fee assistance amount, the 2026 Step 2 CK application fee for US
      and Canadian applicants is $695, paid by credit card and non-refundable. International
      applicants testing outside the US and Canada pay an additional regional surcharge on top of
      the base fee. If you do not test within your eligibility period, you will need to reapply,
      and extending an eligibility period carries its own separate fee.
    </p>
    <Callout title="Confirm the current fee before you budget" tone="disclosure">
      <p>
        Fees are set annually and have changed from year to year in the past, so treat any number
        you read, including this one, as a starting point. Confirm the exact current fee and any
        international surcharge on your MyUSMLE portal or the FSMB site before you register.
      </p>
    </Callout>

    <H2 section={S.reschedule} />
    <p>
      If you have already scheduled your Step 2 CK exam, you can reschedule it through the
      Prometric website. Changing your appointment inside 45 calendar days of your scheduled date
      carries a fee, so if you think you might need to move your date, do it as early as possible.
    </p>

    <H2 section={S.format} />
    <p>
      Yes. As of May 7, 2026, Step 2 CK moved from eight 60-minute blocks to sixteen 30-minute
      blocks.
    </p>
    <ComparisonTable
      caption="Step 2 CK format, before and after May 7, 2026"
      columns={[
        { key: 'measure', label: 'Measure' },
        { key: 'before', label: 'Before May 7, 2026' },
        { key: 'after', label: 'On or after May 7, 2026' },
      ]}
      rows={[
        { id: 'blocks', cells: { measure: 'Blocks', before: 'Eight 60-minute blocks', after: 'Sixteen 30-minute blocks' } },
        { id: 'perblock', cells: { measure: 'Questions per block', before: 'Up to 40', after: 'Up to 20' } },
        { id: 'total', cells: { measure: 'Total questions', before: 'Up to 318', after: 'Up to 318' } },
        { id: 'breaks', cells: { measure: 'Break time', before: 'At least 45 minutes', after: 'At least 55 minutes' } },
        { id: 'tutorial', cells: { measure: 'Optional tutorial', before: '15 minutes', after: '5 minutes' } },
        { id: 'day', cells: { measure: 'Total testing day', before: '9 hours', after: '9 hours' } },
      ]}
      footnote="Step 1 made the same kind of change on May 14, 2026 (seven 60-minute blocks became fourteen 30-minute blocks). Step 3 moved to the updated interface in March 2026."
    />
    <p>
      The total question count, scoring and overall 9-hour day did not change, only the rhythm
      inside it: more, shorter breaks instead of fewer, longer ones. If you are practicing with a
      question bank, practicing in shorter timed sets matches this better than one long
      40-question sitting.
    </p>

    <H2 section={S.results} />
    <p>
      Results are typically available within four weeks of your test date, though a number of
      factors can delay reporting, so USMLE recommends waiting at least eight weeks before you
      inquire about a missing score. Unlike Step 1, Step 2 CK still reports a three-digit score
      rather than pass/fail. You will be notified by email once your report is available, with
      instructions to access it online.
    </p>

    <H2 section={S.preparing} />
    <p>
      The biggest lever for Step 2 CK is using a question bank during your clerkships, not only
      afterward, so internal medicine questions get done during your internal medicine block,
      surgery during surgery, and so on. That reinforces clinical experience and question practice
      together, in a way that is hard to replicate later.
    </p>
    <p>
      Closer to test day, move to timed, mixed blocks rather than staying in untimed, by-specialty
      mode, since the real exam does not tell you which clerkship a question is testing. Save
      self-assessments for your final two weeks, to get an honest, timed read on where you stand.
    </p>
    <PostCta
      heading="Practice through your clerkships, not just after them"
      body="Short daily sets, an adaptive engine that tracks what you keep missing, and reviews scheduled for you automatically."
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
      This guide reflects publicly available USMLE program information as of this writing.
      Eligibility, registration procedures, fees, blackout dates and exam format are set by the
      NBME and FSMB and can change without notice, so confirm current details directly on{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>{' '}
      and in your MyUSMLE account before making plans. MedPrep Institute is not affiliated with or
      endorsed by NBME, FSMB, USMLE, ECFMG or any other company named here. All trademarks belong
      to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'usmle-step-2-ck-exam-dates-2026',
  title: 'USMLE Step 2 CK Exam Dates in 2026: What You Need to Know',
  seoTitle: 'USMLE Step 2 CK Exam Dates 2026: What Changed',
  description:
    'Eligibility, registration, cost, scheduling and results for USMLE Step 2 CK in 2026, plus what changed: a new registration process and a new block format.',
  publishedAt: '2026-09-28T15:00:00+02:00',
  updatedAt: '2026-09-28T15:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Notebook and glasses, downloaded from Unsplash (free to use under the Unsplash License):
  // https://images.unsplash.com/photo-1517842645767-c639042777db
  heroImage: '/blog/usmle-step-2-ck-exam-dates-2026-hero.jpg',
  category: 'Exam logistics',
  keywords: [
    'USMLE Step 2 CK exam dates 2026',
    'USMLE Step 2 CK 2026',
    'USMLE Step 2 CK registration',
    'USMLE Step 2 CK eligibility',
    'USMLE Step 2 CK cost',
    'USMLE Step 2 CK scheduling',
    'USMLE Step 2 CK results',
    'USMLE Step 2 CK new format',
  ],
  readingMinutes: 8,
  sections: Object.values(S),
  faqs,
  Body,
};
