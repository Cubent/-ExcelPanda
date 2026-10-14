import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-3-study-guide`;

const S = {
  what: { id: 'what-step-3-tests', title: 'What USMLE Step 3 actually tests' },
  scored: { id: 'why-it-still-matters', title: 'Why passing Step 3 still matters' },
  format: { id: 'the-two-day-format', title: "Step 3's two-day format" },
  when: { id: 'when-to-start', title: 'When to start studying during residency' },
  outline: { id: 'content-outline', title: 'What to study: the content outline' },
  resources: { id: 'core-resources', title: 'The core resources most residents use' },
  schedule: { id: 'sample-schedule', title: 'A sample study plan around your schedule' },
  routine: { id: 'daily-routine', title: 'A sample daily routine that fits around shifts' },
  tips: { id: 'study-tips', title: 'Tips that make the biggest difference' },
  final: { id: 'final-week', title: 'The final week and test day' },
  medprep: { id: 'medprep-institute', title: 'How MedPrep Institute fits into this plan' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'When during residency should I take Step 3?',
    answer:
      'Most residents take it during PGY-1, often within a window set by their state medical board or residency program. Confirm your own program\'s timeline and your state\'s requirements early, since they vary.',
  },
  {
    question: 'What are the Step 3 exam dates in 2026?',
    answer:
      'There is no single fixed date. You apply for a roughly three-month eligibility period, then book actual test days through Prometric. Our [USMLE Step 3 exam dates 2026 guide](/blog/usmle-step-3-exam-dates-2026) covers eligibility, registration, cost and the format change in detail.',
  },
  {
    question: 'What does Step 3 actually cover?',
    answer:
      'See our [Step 3 syllabus guide](/blog/usmle-step-3-syllabus) for the exact percentage breakdown by system and physician task, straight from the official NBME/FSMB content outline.',
  },
  {
    question: 'Is Step 3 pass/fail like Step 1?',
    answer:
      'No. Step 3 reports a three-digit score, the same as Step 2 CK. Only Step 1 moved to pass/fail, in 2022.',
  },
  {
    question: 'Do I need to prepare for CCS separately?',
    answer:
      'Yes. Step 3\'s day two includes Computer-based Case Simulations, and most question banks, including ours, only cover multiple-choice practice. Pair your question bank with a dedicated CCS resource.',
  },
  {
    question: 'How do I study for Step 3 without a dedicated block?',
    answer:
      'Spread a smaller daily habit across more weeks instead of assuming full days off. Short, consistent question sets between shifts, with full review of every explanation, work better than a plan that assumes free time you may not get.',
  },
  {
    question: 'What comes after Step 3?',
    answer:
      'For internal medicine residents, the next major exam is board certification. Our [ABIM study guide](/blog/abim-study-guide) covers how to prepare for it.',
  },
  {
    question: 'Does my Step 3 score affect fellowship matching?',
    answer:
      'By the time you take Step 3, you are already in residency, so it does not factor into matching the way Step 2 CK can. It can still matter for licensure and, at some programs, for things like moonlighting eligibility. Confirm specifics with your program and state board.',
  },
  {
    question: 'Does MedPrep Institute replace CCS practice or self-assessments?',
    answer:
      'No. It is a multiple-choice question bank, meant to sit alongside a dedicated CCS resource and the official NBME self-assessments, not replace either.',
  },
  {
    question: 'Which Step 3 question bank should I use?',
    answer:
      'Our [Step 3 question bank comparison](/blog/top-usmle-step-3-question-banks) breaks down which banks actually have Step 3 content, which ones include CCS case simulations, and exactly which plan to buy.',
  },
];

const Body = () => (
  <>
    <p>
      USMLE Step 3 is different from the exams before it in one big way: you take it during
      residency, not medical school, usually while working full shifts. That changes everything
      about how you study for it. This guide covers what the exam tests, its two-day format, and
      how to build a study plan around a resident's schedule instead of a student's. If you have
      not started practicing yet, you can pair this guide with the{' '}
      <Link href="/usmle-step-3-question-bank">Step 3 question bank</Link> we build.
    </p>

    <H2 section={S.what} />
    <p>
      Step 3 tests whether you can manage a patient independently: not just diagnose a
      presentation, but decide what to do next, how to follow the patient over time, and how to
      handle the case as it evolves. It leans more on management-over-time and patient-safety
      questions than Step 2 CK did, and it also includes Computer-based Case Simulations (CCS),
      where you manage a simulated patient in real time rather than answer a multiple-choice
      question. Exact format and timing are set by the NBME and FSMB and can change, so check{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>{' '}
      for the current exam structure before you plan around it.
    </p>

    <H2 section={S.scored} />
    <Callout title="Step 3 is scored, and it is the last step before full licensure" tone="disclosure">
      <p>
        Like Step 2 CK, Step 3 reports a three-digit score rather than pass/fail. By the time you
        take it, residency placement is already settled, so the score itself is not part of
        matching. What it does affect is your medical license: some states set a passing score or
        a limited number of attempts as a licensing requirement, and some programs tie things like
        moonlighting eligibility to having passed it. Requirements vary by state and program, so
        confirm your own state medical board's rules and your program's timeline expectations.
      </p>
    </Callout>

    <H2 section={S.format} />
    <p>
      Step 3 is typically given over two test days, though the exact structure is set by the NBME
      and can change:
    </p>
    <ul>
      <li>
        <strong>Day one</strong> is standard multiple-choice questions, covering foundational and
        clinical material similar in spirit to Step 2 CK.
      </li>
      <li>
        <strong>Day two</strong> combines multiple-choice questions with the CCS cases, where you
        order tests, treatments and follow-up in a simulated patient encounter that plays out over
        simulated time.
      </li>
    </ul>
    <p>
      MedPrep Institute, like most question banks, focuses on multiple-choice practice. Pair it
      with a dedicated CCS resource for the case-simulation half of the exam.
    </p>

    <H2 section={S.when} />
    <p>
      Most residents take Step 3 during PGY-1, often within a window set by their state or
      program, before the demands of later training years get heavier. A few ways to fit studying
      around residency:
    </p>
    <ul>
      <li>
        <strong>Start earlier than feels necessary.</strong> Between shifts, call and post-call
        days, a resident's schedule is far less predictable than a student's, so a longer runway
        with a light daily habit beats waiting for a dedicated block that may not come.
      </li>
      <li>
        <strong>Do not assume a true dedicated period.</strong> Some programs give a short study
        block before the exam; many do not. Plan as if you will study around full clinical
        duties, and treat any dedicated time you do get as a bonus for final review.
      </li>
    </ul>

    <H2 section={S.outline} />
    <p>Step 3 draws broadly across specialties, with a shift in emphasis toward:</p>
    <ul>
      <li>
        <strong>Management over time,</strong> including chronic disease management and follow-up
        decisions, not only the initial diagnosis.
      </li>
      <li>
        <strong>Patient safety and systems-based practice,</strong> including error prevention,
        care coordination and quality improvement concepts.
      </li>
      <li>
        <strong>Population health and biostatistics,</strong> at a level suited to a practicing
        physician rather than a student.
      </li>
      <li>
        <strong>The same core clinical specialties</strong> as Step 2 CK: internal medicine,
        surgery, pediatrics, obstetrics and gynecology, psychiatry and family medicine.
      </li>
    </ul>
    <p>
      The exact blueprint and weighting is published and updated by the NBME. Use it to confirm
      your review is not skipping a whole category, rather than memorizing exact percentages.
    </p>

    <H2 section={S.resources} />
    <ul>
      <li>
        <strong>A multiple-choice question bank,</strong> for the day-one and day-two
        question-based content.
      </li>
      <li>
        <strong>A dedicated CCS practice resource,</strong> since most question banks, including
        ours, do not simulate the case-management day-two format.
      </li>
      <li>
        <strong>Official self-assessments,</strong> saved for your final couple of weeks to check
        readiness under real timing.
      </li>
    </ul>
    <p>
      If you have not picked a question bank yet, our comparison of{' '}
      <Link href="/blog/best-usmle-question-banks">
        the best USMLE question banks for Step 1, Step 2 CK and Step 3
      </Link>{' '}
      covers prices, question counts and free trials as of 2026. If Step 2 CK is still ahead of
      you, our{' '}
      <Link href="/blog/usmle-step-2-ck-study-guide">USMLE Step 2 CK study guide</Link> covers the
      exam that comes before this one.
    </p>

    <H2 section={S.schedule} />
    <p>
      Since a true dedicated period is not guaranteed, this plan spreads across six weeks of
      shift-compatible studying rather than assuming full days off.
    </p>
    <ComparisonTable
      caption="A sample six-week Step 3 study plan around a resident schedule"
      columns={[
        { key: 'phase', label: 'Weeks' },
        { key: 'focus', label: 'Focus' },
        { key: 'mode', label: 'Question practice' },
        { key: 'goal', label: 'Goal' },
      ]}
      rows={[
        {
          id: 'w1-2',
          cells: {
            phase: 'Weeks 1 to 2',
            focus: 'Review by specialty, light daily habit',
            mode: 'Untimed, short sets between shifts',
            goal: 'Rebuild what has faded since Step 2 CK',
          },
        },
        {
          id: 'w3-4',
          cells: {
            phase: 'Weeks 3 to 4',
            focus: 'Cover every specialty at least once',
            mode: 'Timed, mixed sets',
            goal: 'Build pacing without needing full-length blocks',
          },
        },
        {
          id: 'w5',
          featured: true,
          cells: {
            phase: 'Week 5',
            focus: 'Targeted review of what you keep missing, plus CCS practice',
            mode: 'Timed, missed-concept review',
            goal: 'Turn misses into strengths before test day',
          },
        },
        {
          id: 'w6',
          cells: {
            phase: 'Week 6',
            focus: 'Self-assessment and light review',
            mode: '1 full-length self-assessment if your schedule allows it',
            goal: 'Confirm readiness, then rest before test day',
          },
        },
      ]}
      footnote="If your program gives you a dedicated block, compress this into it. If not, this plan works spread thin across six weeks of normal duties."
    />

    <H2 section={S.routine} />
    <ComparisonTable
      caption="A sample daily routine that fits around residency"
      columns={[
        { key: 'time', label: 'Window' },
        { key: 'activity', label: 'Activity' },
      ]}
      rows={[
        { id: 'morning', cells: { time: 'Before or between shifts', activity: 'One short question set, five to ten questions' } },
        { id: 'postcall', cells: { time: 'Post-call or light days', activity: 'A longer timed set, plus full review of every explanation' } },
        { id: 'evening', cells: { time: 'Evening, when possible', activity: 'Light review of missed concepts from earlier in the day' } },
        { id: 'offday', cells: { time: 'A day off, if you get one', activity: 'CCS practice, or a self-assessment closer to test day' } },
      ]}
      footnote="Short, consistent sets you can actually finish beat a long block you have to skip on a bad call day."
    />

    <H2 section={S.tips} />
    <ol>
      <li>
        <strong>Protect a small daily habit</strong> over an ambitious plan you cannot sustain
        through a busy rotation. Five real questions beat forty skipped ones.
      </li>
      <li>
        <strong>Read every explanation,</strong> including for questions you got right, especially
        if you were not fully sure why.
      </li>
      <li>
        <strong>Track misses by concept,</strong> not by question, so patterns stand out even with
        limited study time.
      </li>
      <li>
        <strong>Let missed concepts come back on a schedule</strong> instead of only once, so you
        do not have to manually decide what to revisit.
      </li>
      <li>
        <strong>Do not skip CCS practice.</strong> It is a real part of day two, and question-bank
        practice alone will not prepare you for it.
      </li>
      <li>
        <strong>Protect sleep before test day</strong> more than you protect any single extra study
        session, especially coming off clinical duties.
      </li>
    </ol>

    <H2 section={S.final} />
    <p>
      In the final week, taper new content and keep light review. If your schedule allows it,
      request time off close to the exam rather than coming straight off a demanding rotation. On
      test day, treat every question the same way: if one is taking too long, flag it, make your
      best answer, and move on.
    </p>

    <H2 section={S.medprep} />
    <p>
      MedPrep Institute is the question bank we build, meant to fit into short gaps in a resident's
      day rather than assume you have a dedicated study block.
    </p>
    <ul>
      <li>Patient management vignettes, by discipline or mixed across the exam.</li>
      <li>
        An adaptive engine that flags the concept behind a missed question and brings back
        variations on it through spaced repetition over the following days.
      </li>
      <li>
        Your weakest disciplines are prioritized automatically, and progress from Step 2 CK carries
        over if you studied here.
      </li>
      <li>Physician-reviewed explanations, and five-question sets built to fit between patients.</li>
    </ul>
    <p>
      It does not include CCS case simulations, official self-assessment exams or a score
      predictor. Pair it with a dedicated CCS resource and the official NBME assessments for the
      parts it does not cover.
    </p>
    <PostCta
      heading="Try the Step 3 Qbank free for 7 days"
      body="Five-question sets that fit between patients, with reviews scheduled for whatever you miss."
      href={signup('medprep-section')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Practice with an engine that remembers what you miss"
      body="Short daily sets, reviews scheduled for you, and your weakest disciplines prioritized automatically."
      href={signup('faq-end')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      This guide is general study planning guidance, not a guarantee of any exam, licensing or
      program outcome. Exam format, timing and content outline details are set by the NBME and
      FSMB and can change, so check{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>{' '}
      for the current structure of Step 3 before you plan around it. Licensing requirements and
      timelines vary by state and are set by individual state medical boards, so confirm current
      requirements with your own board and residency program. MedPrep Institute is not affiliated
      with or endorsed by NBME, FSMB, USMLE or any other company named here. All trademarks belong
      to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'usmle-step-3-study-guide',
  title: 'USMLE Step 3 Study Guide: How to Prepare During Residency',
  seoTitle: 'USMLE Step 3 Study Guide (2026): How to Prepare',
  description:
    'A complete USMLE Step 3 study guide: the two-day format, when to take it during residency, a sample plan around shifts, and the content outline.',
  publishedAt: '2026-09-27T16:00:00+02:00',
  updatedAt: '2026-09-27T16:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Hospital patient room, downloaded from Unsplash (free to use under the Unsplash License):
  // https://images.unsplash.com/photo-1512678080530-7760d81faba6
  heroImage: '/blog/usmle-step-3-study-guide-hero.jpg',
  category: 'Study strategy',
  keywords: [
    'USMLE Step 3 study guide',
    'how to study for USMLE Step 3',
    'Step 3 study schedule',
    'Step 3 content outline',
    'Step 3 CCS',
    'when to take Step 3 during residency',
    'USMLE Step 3 tips',
    'Step 3 two day format',
  ],
  readingMinutes: 10,
  sections: Object.values(S),
  faqs,
  Body,
};
