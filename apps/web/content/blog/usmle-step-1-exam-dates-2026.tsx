import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-1-exam-dates-2026`;

const S = {
  when: { id: 'when-can-i-take-step-1', title: 'When can I take the USMLE Step 1 exam?' },
  eligible: { id: 'who-is-eligible', title: 'Who is eligible to take Step 1?' },
  register: { id: 'how-do-i-register', title: 'How do I register for Step 1?' },
  schedule: { id: 'how-far-in-advance', title: 'How far in advance can I schedule my Step 1 exam?' },
  cost: { id: 'how-much-does-it-cost', title: 'How much does it cost to register for Step 1 in 2026?' },
  reschedule: { id: 'change-my-exam-date', title: 'How can I change my Step 1 exam date?' },
  format: { id: 'exam-format-change', title: 'Did the Step 1 exam format change in 2026?' },
  results: { id: 'when-will-i-get-results', title: 'When will I get my Step 1 results?' },
  preparing: { id: 'preparing-for-the-exam', title: 'Preparing for the exam' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Is there a fixed USMLE Step 1 exam date in 2026?',
    answer:
      'No. You apply for a roughly three-month eligibility period, then book an actual appointment inside that window through Prometric, on a first-come, first-served basis.',
  },
  {
    question: 'What changed about Step 1 registration in 2026?',
    answer:
      'International applicants moved to registering through FSMB, starting January 12, 2026. US and Canadian applicants continue to register through NBME, as of a service transition on January 26, 2026.',
  },
  {
    question: 'Did the Step 1 exam format change in 2026?',
    answer:
      'Yes. As of May 14, 2026, Step 1 moved from seven 60-minute blocks to fourteen 30-minute blocks, with more, shorter breaks. The total question count and testing day length stayed the same.',
  },
  {
    question: 'How long do Step 1 results take?',
    answer:
      'Typically within four weeks, though USMLE recommends allowing at least eight weeks before asking about a delayed report.',
  },
  {
    question: 'Does the new block format change how I should study?',
    answer:
      'The content and total question count are unchanged, so what you study does not need to change. Practicing in shorter timed sets can help you adjust to the new block rhythm before test day.',
  },
  {
    question: 'What about Step 2 CK exam dates?',
    answer:
      'The same eligibility-period system and 2026 changes apply there too. See our [USMLE Step 2 CK exam dates guide](/blog/usmle-step-2-ck-exam-dates-2026) for the specifics.',
  },
  {
    question: 'What about Step 3 exam dates?',
    answer:
      'Step 3 follows the same eligibility-period system, but it has its own prerequisites, fee and two-day format. See our [USMLE Step 3 exam dates guide](/blog/usmle-step-3-exam-dates-2026) for the specifics.',
  },
  {
    question: 'What other Step 1 rules should I know about?',
    answer:
      'Attempt limits, exam order with Step 2 CK, and how pass/fail affects residency applications are separate from exam dates. Our [8 things to know about Step 1](/blog/8-things-to-know-usmle-step-1) covers those.',
  },
];

const Body = () => (
  <>
    <p>
      Between finding the right resources, building a study plan, and working through the sheer
      volume of material Step 1 covers, it is easy to let the practical side of the exam,
      eligibility, registration, scheduling, cost, results, slip to the back of your mind. This
      guide walks through those practical questions, based on the current USMLE instructions, plus
      what changed for 2026.
    </p>

    <H2 section={S.when} />
    <p>
      Most students take Step 1 between their second and third years of medical school. Since
      Step 1 became pass/fail in January 2022, many students now sit it earlier in the M2 year
      than students did when it still reported a three-digit score. Students on a non-traditional
      curriculum often take it after their NBME Shelf exams instead, and a smaller number take
      Step 2 CK before Step 1.
    </p>
    <p>
      The exam is offered most of the year, on most weekdays and many Saturdays, except for major
      holidays and a maintenance window NBME and FSMB have historically used in early January.
      Exact closures are published on the official test center calendar for the current year,
      rather than fixed from year to year.
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
      As of 2026, US and Canadian applicants register for Step 1 directly through the{' '}
      <a href="https://www.nbme.org/" target="_blank" rel="noopener noreferrer">
        NBME
      </a>
      . International applicants register through the{' '}
      <a href="https://www.fsmb.org/" target="_blank" rel="noopener noreferrer">
        FSMB
      </a>
      , as of a service transition that took effect January 12, 2026 for international applicants
      and January 26, 2026 for US and Canadian applicants. If you are working from an older guide
      or advice from someone who registered a year or two ago, confirm you are using the current
      portal for your applicant type before you start.
    </p>
    <p>
      In broad strokes, the process is the same as it has always been: register as a first-time
      user to receive your USMLE ID, submit a new application, and select the eligibility period
      you want to test in. You will then receive a scheduling permit by email, which you use to
      book your actual appointment through Prometric.
    </p>

    <H2 section={S.schedule} />
    <p>
      You can schedule your Step 1 appointment through Prometric up to six months in advance. When
      you apply, you select an eligibility period, a roughly three-month window during which you
      intend to test, and then book a specific date and test center inside that window on a
      first-come, first-served basis.
    </p>
    <p>
      If your exam is coming up fast, our{' '}
      <Link href="/blog/usmle-step-1-study-guide">USMLE Step 1 study guide</Link> has a sample
      six-week schedule to help you use the time you have left efficiently.
    </p>

    <H2 section={S.cost} />
    <p>
      Based on NBME's published fee assistance amount, the 2026 Step 1 application fee for US and
      Canadian applicants is $695, paid by credit card and non-refundable. International
      applicants testing outside the US and Canada pay an additional surcharge on top of the base
      fee. If you do not test within your eligibility period, you will need to reapply, and
      extending an eligibility period carries its own separate fee.
    </p>
    <Callout title="Confirm the current fee before you budget" tone="disclosure">
      <p>
        Fees are set annually and have changed from year to year in the past, so treat any number
        you read, including this one, as a starting point. Confirm the exact current fee on your
        MyUSMLE portal or the FSMB site before you register.
      </p>
    </Callout>

    <H2 section={S.reschedule} />
    <p>
      If you have already scheduled your Step 1 exam, you can reschedule it through the Prometric
      website. Changing your appointment inside 45 calendar days of your scheduled date carries a
      fee, so if you think you might need to move your date, do it as early as possible.
    </p>

    <H2 section={S.format} />
    <p>
      Yes, and this is the change most current test-takers will actually notice on test day. As of
      May 14, 2026, Step 1 moved from seven 60-minute blocks to fourteen 30-minute blocks.
    </p>
    <ComparisonTable
      caption="Step 1 format, before and after May 14, 2026"
      columns={[
        { key: 'measure', label: 'Measure' },
        { key: 'before', label: 'Before May 14, 2026' },
        { key: 'after', label: 'On or after May 14, 2026' },
      ]}
      rows={[
        { id: 'blocks', cells: { measure: 'Blocks', before: 'Seven 60-minute blocks', after: 'Fourteen 30-minute blocks' } },
        { id: 'perblock', cells: { measure: 'Questions per block', before: 'Up to 40', after: 'Up to 20' } },
        { id: 'total', cells: { measure: 'Total questions', before: 'Up to 280', after: 'Up to 280' } },
        { id: 'breaks', cells: { measure: 'Break time', before: 'At least 45 minutes', after: 'At least 55 minutes' } },
        { id: 'tutorial', cells: { measure: 'Optional tutorial', before: '15 minutes', after: '5 minutes' } },
        { id: 'day', cells: { measure: 'Total testing day', before: '8 hours', after: '8 hours' } },
      ]}
      footnote="Step 2 CK made the same kind of change on May 7, 2026 (eight 60-minute blocks became sixteen 30-minute blocks). Step 3 moved to the updated interface in March 2026."
    />
    <p>
      The total question count, pass/fail scoring and overall 8-hour day did not change, only the
      rhythm inside it: more, shorter breaks instead of fewer, longer ones. If you are practicing
      with a question bank, practicing in shorter timed sets matches this better than one long
      40-question sitting.
    </p>

    <H2 section={S.results} />
    <p>
      Results are typically available within four weeks of your test date, though a number of
      factors can delay reporting, so USMLE recommends waiting at least eight weeks before you
      inquire about a missing score. Since Step 1 has been pass/fail for exams taken on or after
      January 26, 2022, your report shows pass or fail rather than a three-digit score. You will
      be notified by email once your report is available, with instructions to access it online.
    </p>

    <H2 section={S.preparing} />
    <p>
      There is no single approach that works for everyone, but a few things apply to almost all
      students. Treat it as a marathon: build your knowledge base steadily rather than trying to
      compress it into the final weeks. Make the most of any dedicated study time your school
      gives you, and use a question bank throughout, not only at the end, so you get repeated
      exposure to concepts instead of meeting them once.
    </p>
    <p>
      Self-assessments are worth building into your plan too, closer to test day, to get an honest
      read on where you stand under real timing before it counts.
    </p>
    <PostCta
      heading="Build your Step 1 habit early"
      body="Short daily sets, an adaptive engine that tracks what you keep missing, and reviews scheduled for you automatically."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try the adaptive Step 1 Qbank free for 7 days"
      body="Short sets, reviews scheduled for you, and your weakest systems prioritized automatically."
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
  slug: 'usmle-step-1-exam-dates-2026',
  title: 'USMLE Step 1 Exam Dates in 2026: What You Need to Know',
  seoTitle: 'USMLE Step 1 Exam Dates 2026: What Changed',
  description:
    'Eligibility, registration, cost, scheduling and results for USMLE Step 1 in 2026, plus what changed: a new registration process and a new block format.',
  publishedAt: '2026-09-28T14:00:00+02:00',
  updatedAt: '2026-09-28T14:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Desk calendar, downloaded from Unsplash (free to use under the Unsplash License):
  // https://images.unsplash.com/photo-1506784983877-45594efa4cbe
  heroImage: '/blog/usmle-step-1-exam-dates-2026-hero.jpg',
  category: 'Exam logistics',
  keywords: [
    'USMLE Step 1 exam dates 2026',
    'USMLE Step 1 2026',
    'USMLE Step 1 registration',
    'USMLE Step 1 eligibility',
    'USMLE Step 1 cost',
    'USMLE Step 1 scheduling',
    'USMLE Step 1 results',
    'USMLE Step 1 new format',
  ],
  readingMinutes: 8,
  sections: Object.values(S),
  faqs,
  Body,
};
