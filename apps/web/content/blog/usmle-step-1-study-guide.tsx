import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-1-study-guide`;

const S = {
  what: { id: 'what-step-1-tests', title: 'What USMLE Step 1 actually tests' },
  passFail: { id: 'pass-fail', title: 'Does Step 1 still matter now that it is pass/fail?' },
  when: { id: 'when-to-start', title: 'When to start studying' },
  outline: { id: 'content-outline', title: 'What to study: the content outline' },
  resources: { id: 'core-resources', title: 'The core resources most students use' },
  schedule: { id: 'sample-schedule', title: 'A sample study schedule' },
  routine: { id: 'daily-routine', title: 'A sample daily routine during dedicated study' },
  tips: { id: 'study-tips', title: 'Tips that make the biggest difference' },
  final: { id: 'final-week', title: 'The final week and test day' },
  medprep: { id: 'medprep-institute', title: 'How MedPrep Institute fits into this plan' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What are the Step 1 exam dates in 2026?',
    answer:
      'There is no fixed date. You apply for a three-month eligibility period, then book an actual appointment inside it through Prometric. Registration and the block format both changed in 2026, and our [USMLE Step 1 exam dates guide](/blog/usmle-step-1-exam-dates-2026) covers what changed.',
  },
  {
    question: 'What else should I know about Step 1 besides how to study for it?',
    answer:
      'A few rules and policies surprise people who only focus on content review: attempt limits, exam order, and how pass/fail actually affects residency applications. Our [8 things to know about Step 1](/blog/8-things-to-know-usmle-step-1) covers those details.',
  },
  {
    question: 'How long should I study for Step 1?',
    answer:
      'Most students spend four to eight weeks in dedicated study, after building habits with a question bank and flashcards during coursework. The dedicated period is for review and timed practice, not a first encounter with the material.',
  },
  {
    question: 'Is Step 1 still important if it is pass/fail?',
    answer:
      'Yes. You no longer need to chase a high score, but you do need to pass comfortably and actually retain the material, since Step 2 CK and your clerkships build directly on it. Step 2 CK is still scored, and we cover preparing for it in our [USMLE Step 2 CK study guide](/blog/usmle-step-2-ck-study-guide).',
  },
  {
    question: 'How many questions should I do a day?',
    answer:
      'Two full 40-question blocks a day, with complete review of every explanation, is a realistic and sustainable pace for most students during dedicated study. Fewer, with full review, beats more blocks done superficially.',
  },
  {
    question: 'When should I take my first self-assessment?',
    answer:
      'Many students take one early in dedicated study to get a baseline, then save the rest for the final two weeks, when the results best reflect your actual readiness.',
  },
  {
    question: 'What if I am behind on my schedule?',
    answer:
      'Adjust the plan around your weakest areas rather than trying to cover everything equally. Triage: spend the most review time on concepts you missed that most other test-takers get right, since those represent the most reachable points.',
  },
  {
    question: 'Does MedPrep Institute replace First Aid or Anki?',
    answer:
      'No. It is a question bank, meant to sit alongside a content review book and flashcards, not replace either.',
  },
  {
    question: 'Which Step 1 question bank should I use?',
    answer:
      'It depends on your budget and where you are in your timeline. Our [Step 1 question bank comparison](/blog/top-usmle-step-1-question-banks) breaks down UWorld, AMBOSS, TrueLearn and every other major bank, with verified prices and exactly which plan to buy for your situation.',
  },
  {
    question: 'What does Step 1 actually cover?',
    answer:
      'Our [Step 1 syllabus guide](/blog/usmle-step-1-syllabus) breaks down the official content outline by system, discipline and physician task, with the exact percentage ranges from USMLE.org.',
  },
];

const Body = () => (
  <>
    <p>
      USMLE Step 1 is usually the first big standardized exam of medical school, and it is easy to
      let the sheer size of it turn into panic. This guide lays out what the exam covers, when to
      start, a sample schedule you can adapt, and the study habits that make the most difference,
      so you can turn a huge syllabus into a plan with a start date and an end date. If you have
      not started practicing yet, you can pair this guide with the{' '}
      <Link href="/usmle-step-1-question-bank">Step 1 question bank</Link> we build.
    </p>

    <H2 section={S.what} />
    <p>
      Step 1 tests whether you understand and can apply the basic science that underlies clinical
      medicine: things like physiology, pharmacology, pathology, microbiology and biostatistics,
      presented through patient vignettes rather than as bare facts. It is computer-based,
      multiple-choice, and split into timed blocks with breaks in between. Block count, timing and
      question format are set by the NBME and can change, so check{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>{' '}
      for the current exam structure before you sit down to plan around it.
    </p>

    <H2 section={S.passFail} />
    <p>
      Since January 2022, Step 1 has been scored as pass/fail rather than a three-digit score. That
      changes what you are optimizing for: instead of chasing a number, your job is to pass with a
      comfortable margin and actually retain the material, since it is the foundation Step 2 CK
      builds on.
    </p>
    <Callout title="Why it is still worth taking seriously" tone="disclosure">
      <p>
        A pass/fail score is not reported as a number, but the underlying knowledge is not optional.
        Step 2 CK, your clerkships, and later exams all assume you actually know this material, not
        just that you cleared a bar once. Treat the pass/fail format as a reason to stop
        over-studying for a score and not as a reason to under-study the content.
      </p>
    </Callout>

    <H2 section={S.when} />
    <p>
      Most students study for Step 1 in two phases: alongside pre-clinical coursework, and then in
      a dedicated study period once coursework ends.
    </p>
    <ul>
      <li>
        <strong>During coursework.</strong> Use a question bank and flashcards alongside each
        organ-system block as you learn it, so the material has a second exposure while it is
        still fresh, instead of meeting it for the first time months later.
      </li>
      <li>
        <strong>Dedicated study period.</strong> Most schools give students somewhere between four
        and eight weeks between the end of coursework and the exam. Use the first stretch for a
        systematic pass through your weak systems, and the final stretch for full-length, timed
        practice and self-assessments.
      </li>
    </ul>
    <p>
      If your school's timeline differs, the phases matter more than the exact number of weeks.
      Build in your habits during coursework, and treat the dedicated period as review and
      practice, not as your first encounter with the material.
    </p>

    <H2 section={S.outline} />
    <p>
      Step 1's content outline is broad by design, since it is meant to test how basic science
      connects across every organ system. Two ways to organize your review:
    </p>
    <ul>
      <li>
        <strong>By organ system:</strong> cardiovascular, pulmonary, renal, gastrointestinal,
        endocrine, reproductive, musculoskeletal, neurology and psychiatry, hematology and oncology,
        and dermatology, each combining the relevant anatomy, physiology, pathology and
        pharmacology.
      </li>
      <li>
        <strong>Cross-cutting topics:</strong> biostatistics and epidemiology, immunology,
        microbiology, genetics, and ethics and patient safety, which show up throughout the exam
        instead of in one block.
      </li>
    </ul>
    <p>
      The exact blueprint and the weight given to each area is published and updated by the NBME.
      Use it to check your review is not skipping a whole category, rather than trying to memorize
      exact percentages.
    </p>

    <H2 section={S.resources} />
    <p>
      Nearly every successful Step 1 plan is built from the same few kinds of resources, used
      together rather than in isolation:
    </p>
    <ul>
      <li>
        <strong>A content review book,</strong> read once per system to build a scaffold of what
        matters before you drill into questions.
      </li>
      <li>
        <strong>Spaced-repetition flashcards,</strong> to keep facts and associations from decaying
        between when you learn them and when the exam actually happens.
      </li>
      <li>
        <strong>A question bank,</strong> which is where most of the real learning happens: reading
        an explanation after getting a vignette wrong teaches you the concept in the form the exam
        will actually ask about it.
      </li>
      <li>
        <strong>Official self-assessments,</strong> saved for the final two weeks, to check
        readiness under real timing rather than as daily practice.
      </li>
    </ul>
    <p>
      If you have not picked a question bank yet, our comparison of{' '}
      <Link href="/blog/best-usmle-question-banks">
        the best USMLE question banks for Step 1, Step 2 CK and Step 3
      </Link>{' '}
      covers prices, question counts and free trials as of 2026.
    </p>

    <H2 section={S.schedule} />
    <p>
      Here is a sample layout for a six-week dedicated study period. Compress or stretch each phase
      to match your own timeline and where your practice scores are.
    </p>
    <ComparisonTable
      caption="A sample six-week Step 1 dedicated study schedule"
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
            focus: 'Systematic review of your weakest systems',
            mode: 'Untimed, by system',
            goal: 'Close the biggest gaps first',
          },
        },
        {
          id: 'w3-4',
          cells: {
            phase: 'Weeks 3 to 4',
            focus: 'Full content review, second pass on flashcards',
            mode: 'Timed, mixed blocks',
            goal: 'Build exam-day stamina and pacing',
          },
        },
        {
          id: 'w5',
          featured: true,
          cells: {
            phase: 'Week 5',
            focus: 'Targeted review of what you keep missing',
            mode: 'Timed, missed-concept review',
            goal: 'Turn misses into strengths',
          },
        },
        {
          id: 'w6',
          cells: {
            phase: 'Week 6',
            focus: 'Self-assessments and light review',
            mode: '1 to 2 full-length self-assessments',
            goal: 'Confirm readiness, then rest before test day',
          },
        },
      ]}
      footnote="Adjust the length of each phase based on your practice scores, not the calendar. If week 4 self-assessments are already strong, spend more of week 5 on rest and less on new material."
    />

    <H2 section={S.routine} />
    <p>
      A sustainable daily routine beats a heroic one you cannot repeat for six weeks straight.
    </p>
    <ComparisonTable
      caption="A sample daily routine during dedicated study"
      columns={[
        { key: 'time', label: 'Block' },
        { key: 'activity', label: 'Activity' },
      ]}
      rows={[
        { id: 'flash', cells: { time: 'Morning', activity: 'Spaced-repetition flashcard review (30 to 45 minutes)' } },
        { id: 'block1', cells: { time: 'Late morning', activity: 'One timed question block, plus review of every explanation' } },
        { id: 'break', cells: { time: 'Midday', activity: 'Break: food, movement, away from a screen' } },
        { id: 'block2', cells: { time: 'Afternoon', activity: 'A second question block, or content review for your weakest system' } },
        { id: 'wrapup', cells: { time: 'Evening', activity: 'Light review, update flashcards for anything you missed, then stop' } },
      ]}
      footnote="Two full 40-question blocks a day, with full review, is a realistic and sustainable pace for most students."
    />

    <H2 section={S.tips} />
    <ol>
      <li>
        <strong>Read every explanation,</strong> including for questions you got right, especially
        if you were not fully sure why.
      </li>
      <li>
        <strong>Track misses by concept, not by question.</strong> A pattern across several missed
        questions is worth more to fix than any single one.
      </li>
      <li>
        <strong>Let missed concepts come back on a schedule</strong> instead of only once. Seeing a
        concept again a few days after you missed it, from a different angle, is what moves it into
        long-term memory.
      </li>
      <li>
        <strong>Move to timed, mixed blocks</strong> as the exam gets closer, since that is the
        actual test format.
      </li>
      <li>
        <strong>Use self-assessments to check readiness,</strong> not as your main daily practice.
        Save them for when you are close to done.
      </li>
      <li>
        <strong>Protect sleep during the final two weeks.</strong> Recall and stamina both suffer
        more from short sleep than most students expect.
      </li>
    </ol>

    <H2 section={S.final} />
    <p>
      In the final week, taper. Cut new content, keep light review and flashcards, and take at
      least one full day off close to the exam. On test day, treat every block the same way: if a
      question is taking too long, flag it, make your best guess, and move on. A single hard
      question is not worth losing pace on the rest of the block.
    </p>

    <H2 section={S.medprep} />
    <p>
      MedPrep Institute is the question bank we build, and it is meant to slot into the plan above
      rather than replace the phases: it is where you do your timed blocks, and it takes over the
      job of scheduling your review.
    </p>
    <ul>
      <li>NBME-style vignettes with clinical images, by system or mixed across the exam.</li>
      <li>
        An adaptive engine that flags the concept behind a missed question and brings back
        variations on it through spaced repetition over the following days, instead of leaving that
        tracking to you.
      </li>
      <li>Your weakest systems are prioritized automatically as you practice.</li>
      <li>Physician-reviewed explanations, and short five-question sets that fit a busy day.</li>
    </ul>
    <p>
      It does not include official self-assessment exams or a score predictor, so pair it with the
      official NBME assessments for readiness checks close to test day.
    </p>
    <PostCta
      heading="Try the Step 1 Qbank free for 7 days"
      body="Timed or untimed practice, by system or mixed, with reviews scheduled for whatever you miss."
      href={signup('medprep-section')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Practice with an engine that remembers what you miss"
      body="Short daily sets, reviews scheduled for you, and your weakest systems prioritized automatically."
      href={signup('faq-end')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      This guide is general study planning guidance, not a guarantee of any exam result. Exam
      format, timing and content outline details are set by the NBME and FSMB and can change, so
      check{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>{' '}
      for the current structure of Step 1 before you plan around it. MedPrep Institute is not
      affiliated with or endorsed by NBME, FSMB, USMLE or any other company named here. All
      trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'usmle-step-1-study-guide',
  title: 'USMLE Step 1 Study Guide: How to Prepare, What to Study, and When to Start',
  seoTitle: 'USMLE Step 1 Study Guide (2026): How to Prepare',
  description:
    'A complete USMLE Step 1 study guide: when to start, a sample six-week schedule, the content outline, and how to study now that Step 1 is pass/fail.',
  publishedAt: '2026-09-27T12:00:00+02:00',
  updatedAt: '2026-09-27T12:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Library shelves, downloaded from Unsplash (free to use under the Unsplash License):
  // https://images.unsplash.com/photo-1521587760476-6c12a4b040da
  heroImage: '/blog/usmle-step-1-study-guide-hero.jpg',
  category: 'Study strategy',
  keywords: [
    'USMLE Step 1 study guide',
    'how to study for USMLE Step 1',
    'Step 1 study schedule',
    'Step 1 pass fail',
    'USMLE Step 1 content outline',
    'Step 1 dedicated study period',
    'when to start studying for Step 1',
    'USMLE Step 1 tips',
  ],
  readingMinutes: 10,
  sections: Object.values(S),
  faqs,
  Body,
};
