import { Callout } from '@/components/blog/callout';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-3-exam-dates-2026`;

const S = {
  when: { id: 'when-can-i-take-step-3', title: 'When can I take the USMLE Step 3 exam?' },
  eligible: { id: 'who-is-eligible', title: 'Who is eligible to take Step 3?' },
  register: { id: 'how-do-i-register', title: 'How do I register for Step 3?' },
  schedule: { id: 'how-far-in-advance', title: 'How far in advance can I schedule my Step 3 exam?' },
  cost: { id: 'how-much-does-it-cost', title: 'How much does it cost to register for Step 3 in 2026?' },
  reschedule: { id: 'change-my-exam-date', title: 'How can I change my Step 3 exam date?' },
  format: { id: 'exam-format-change', title: 'Did the Step 3 exam format change in 2026?' },
  results: { id: 'when-will-i-get-results', title: 'When will I get my Step 3 results?' },
  preparing: { id: 'preparing-for-the-exam', title: 'Preparing for the exam' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Is there a fixed USMLE Step 3 exam date in 2026?',
    answer:
      'No. You apply for a roughly three-month eligibility period, then book actual appointments inside that window through Prometric, on a first-come, first-served basis.',
  },
  {
    question: 'Do I need to pass Step 1 and Step 2 CK before Step 3?',
    answer:
      'Yes. Step 3 eligibility requires having already passed both earlier Steps, and IMGs must also hold a valid, unexpired ECFMG Certificate.',
  },
  {
    question: 'Did the Step 3 exam format change in 2026?',
    answer:
      'Yes. On March 10, 2026, Step 3 moved to updated test delivery software with more, shorter blocks across both test days. Total questions, seat time, scoring, content and the CCS format stayed the same.',
  },
  {
    question: 'Is Step 3 pass/fail like Step 1?',
    answer:
      'No. Step 1 moved to pass/fail in 2022, but Step 3 still reports a three-digit score, the same as Step 2 CK.',
  },
  {
    question: 'How long do Step 3 results take?',
    answer:
      'Typically within four weeks, though USMLE recommends allowing at least eight weeks before asking about a delayed report.',
  },
  {
    question: 'What about Step 1 and Step 2 CK exam dates?',
    answer:
      'Both earlier Steps follow the same eligibility-period system, with their own 2026 format changes and fees. See our [USMLE Step 1 exam dates guide](/blog/usmle-step-1-exam-dates-2026) and [USMLE Step 2 CK exam dates guide](/blog/usmle-step-2-ck-exam-dates-2026) for the specifics.',
  },
];

const Body = () => (
  <>
    <p>
      Step 3 comes with its own logistics, different from Step 1 and Step 2 CK: it usually happens
      during residency, it has its own eligibility rules on top of the earlier Steps, and 2026
      brought a real change to how test day is structured. This guide walks through the practical
      questions, based on current USMLE instructions.
    </p>

    <H2 section={S.when} />
    <p>
      Most residents take Step 3 during their first year of residency, PGY-1, often within a
      window set by their state medical board or program. USMLE recommends applicants have
      completed, or be near completion of, at least one postgraduate training year in an
      accredited US graduate medical education program, though this is guidance rather than a
      strict requirement. If you need an H-1B visa, passing Step 3 before residency can matter,
      since some visa sponsorship pathways require a medical license, which in turn requires
      passing Step 3.
    </p>
    <p>
      The exam is offered most of the year, on most weekdays and many Saturdays, except for major
      holidays and a maintenance window NBME and FSMB have historically used in early January.
    </p>

    <H2 section={S.eligible} />
    <p>Step 3 has one prerequisite the earlier Steps do not: you must pass Step 1 and Step 2 CK first.</p>
    <ul>
      <li>
        <strong>US and Canadian MD graduates:</strong> have completed Step 1 and Step 2 CK, and
        meet any additional requirements of the state or jurisdiction they are applying through.
      </li>
      <li>
        <strong>US DO graduates:</strong> have completed Step 1 and Step 2 CK, meeting the same
        underlying requirement.
      </li>
      <li>
        <strong>International medical graduates (IMGs):</strong> in addition to passing Step 1 and
        Step 2 CK, must hold a valid, unexpired ECFMG Certificate at the time of application and
        on the actual testing date.
      </li>
    </ul>

    <H2 section={S.register} />
    <p>
      As of 2026, US and Canadian applicants register for Step 3 directly through the{' '}
      <a href="https://www.nbme.org/" target="_blank" rel="noopener noreferrer">
        NBME
      </a>
      . International applicants register through the{' '}
      <a href="https://www.fsmb.org/" target="_blank" rel="noopener noreferrer">
        FSMB
      </a>
      , as of a service transition that took effect January 12, 2026 for international applicants
      and January 26, 2026 for US and Canadian applicants, covering all three Step exams. Step 3
      applications have historically run through FSMB more often than the earlier Steps, since
      state medical boards are directly involved in licensure, so confirm the current process
      through your own state board alongside the FSMB or NBME portal.
    </p>
    <p>
      As with the earlier Steps, you select an eligibility period as part of your application,
      then receive a scheduling permit by email, which you use to book your actual appointment
      through Prometric.
    </p>

    <H2 section={S.schedule} />
    <p>
      You can schedule your Step 3 appointment through Prometric up to six months in advance.
      Because Step 3 is a two-day exam, you will typically book both days together, and test
      center availability for two consecutive or near-consecutive days can be tighter than for a
      single-day Step exam, so book early in your eligibility period.
    </p>
    <p>
      For the actual studying, our{' '}
      <Link href="/blog/usmle-step-3-study-guide">USMLE Step 3 study guide</Link> covers a sample
      plan built around a resident's schedule.
    </p>

    <H2 section={S.cost} />
    <p>
      The Step 3 application fee is higher than Step 1 or Step 2 CK, reflecting its two-day
      format: around $955 for the 2026 and 2027 eligibility periods, paid by credit card and
      non-refundable. International applicants and some other circumstances can carry additional
      processing fees.
    </p>
    <Callout title="Confirm the current fee before you budget" tone="disclosure">
      <p>
        Fees are set periodically and can change, so treat this figure as a starting point.
        Confirm the exact current fee on the FSMB Step 3 application fees page or your MyUSMLE
        portal before you register.
      </p>
    </Callout>

    <H2 section={S.reschedule} />
    <p>
      If you have already scheduled your Step 3 exam, you can reschedule it through the Prometric
      website. As with the earlier Steps, changing your appointment inside 45 calendar days of
      your scheduled date carries a fee, so if you think you might need to move your date, do it
      as early as possible, and remember you are coordinating two test days, not one.
    </p>

    <H2 section={S.format} />
    <p>
      Yes. On March 10, 2026, Step 3 moved to updated test delivery software, following the same
      pattern as the other two Steps: more blocks, each shorter, with the total questions, total
      seat time, scoring, content outline and CCS format unchanged.
    </p>
    <ul>
      <li>
        <strong>Day one</strong> is multiple-choice only: up to 232 questions across 12 blocks of
        18 to 20 questions, 30 minutes per block, in a roughly 7-hour day including breaks and an
        optional tutorial.
      </li>
      <li>
        <strong>Day two</strong> combines multiple-choice questions with Computer-based Case
        Simulations (CCS): up to 180 multiple-choice questions across 9 blocks of 20 questions, 30
        minutes per block, plus 13 to 14 CCS cases, each capped at 10 or 20 minutes of real time,
        in a roughly 9-hour day.
      </li>
    </ul>
    <p>
      Block counts and exact timing are set by the NBME and can be adjusted, so confirm the
      current structure on{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>{' '}
      close to your test date rather than relying on any single guide, including this one.
    </p>

    <H2 section={S.results} />
    <p>
      Results are typically available within four weeks of your test date, though a number of
      factors can delay reporting, so USMLE recommends waiting at least eight weeks before you
      inquire about a missing score. Step 3 still reports a three-digit score rather than
      pass/fail. You will be notified by email once your report is available.
    </p>

    <H2 section={S.preparing} />
    <p>
      Since Step 3 is offered once you are already in residency, treat a real dedicated study
      block as a bonus rather than a given, and build a small daily habit around your clinical
      duties well before your test date. Practice multiple-choice questions across every
      discipline in the blueprint, and pair that with dedicated CCS practice, since a
      multiple-choice question bank alone will not prepare you for day two.
    </p>
    <PostCta
      heading="Build your Step 3 habit around residency"
      body="Short daily sets, an adaptive engine that tracks what you keep missing, and reviews scheduled for you automatically."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try the adaptive Step 3 Qbank free for 7 days"
      body="Short sets that fit between patients, with reviews scheduled for you and your weakest disciplines prioritized automatically."
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
      </a>
      , the{' '}
      <a href="https://www.fsmb.org/" target="_blank" rel="noopener noreferrer">
        FSMB
      </a>{' '}
      and your own state medical board before making plans. MedPrep Institute is not affiliated
      with or endorsed by NBME, FSMB, USMLE, ECFMG or any other company named here. All trademarks
      belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'usmle-step-3-exam-dates-2026',
  title: 'USMLE Step 3 Exam Dates in 2026: What You Need to Know',
  seoTitle: 'USMLE Step 3 Exam Dates 2026: What Changed',
  description:
    'Eligibility, registration, cost, scheduling and results for USMLE Step 3 in 2026, plus what changed: an updated two-day format effective March 10, 2026.',
  publishedAt: '2026-09-28T16:00:00+02:00',
  updatedAt: '2026-09-28T16:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Laptop and desk workspace, downloaded from Unsplash (free to use under the Unsplash License):
  // https://images.unsplash.com/photo-1487611459768-bd414656ea10
  heroImage: '/blog/usmle-step-3-exam-dates-2026-hero.jpg',
  category: 'Exam logistics',
  keywords: [
    'USMLE Step 3 exam dates 2026',
    'USMLE Step 3 2026',
    'USMLE Step 3 registration',
    'USMLE Step 3 eligibility',
    'USMLE Step 3 cost',
    'USMLE Step 3 scheduling',
    'USMLE Step 3 results',
    'USMLE Step 3 new format',
  ],
  readingMinutes: 8,
  sections: Object.values(S),
  faqs,
  Body,
};
