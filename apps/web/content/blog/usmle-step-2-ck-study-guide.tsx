import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-2-ck-study-guide`;

const S = {
  what: { id: 'what-step-2-ck-tests', title: 'What USMLE Step 2 CK actually tests' },
  scored: { id: 'still-scored', title: 'Why Step 2 CK is not pass/fail like Step 1' },
  when: { id: 'when-to-start', title: 'When to start studying' },
  outline: { id: 'content-outline', title: 'What to study: the content outline' },
  vignette: { id: 'reading-the-vignette', title: 'How to read a Step 2 CK vignette' },
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
    question: 'What are the Step 2 CK exam dates in 2026?',
    answer:
      'There is no fixed date. You apply for a three-month eligibility period, then book an actual appointment inside it through Prometric. Registration and the block format both changed in 2026, and our [USMLE Step 2 CK exam dates guide](/blog/usmle-step-2-ck-exam-dates-2026) covers what changed.',
  },
  {
    question: 'How long should I study for Step 2 CK?',
    answer:
      'Many students take two to six weeks of dedicated study after clerkships end, shorter than a typical Step 1 block, since clerkship experience already covers most of the content. Use question-bank practice during clerkships to make the dedicated period shorter.',
  },
  {
    question: 'Is Step 2 CK pass/fail like Step 1?',
    answer:
      'No. Step 1 moved to pass/fail in 2022, but Step 2 CK still reports a three-digit score, and it is now the main standardized score most residency programs see from applicants.',
  },
  {
    question: 'Should I take Step 2 CK before or after Step 3?',
    answer:
      'Step 2 CK comes before Step 3. Most students take it during medical school, after their core clerkships, well before Step 3, which is usually taken during residency. Our [USMLE Step 3 study guide](/blog/usmle-step-3-study-guide) covers that exam when you get there.',
  },
  {
    question: 'How many questions should I do a day?',
    answer:
      'Two full mixed blocks a day, with complete review of every explanation, is a realistic and sustainable pace for most students during dedicated study.',
  },
  {
    question: 'What is the biggest difference from studying for Step 1?',
    answer:
      'Vignettes are longer and center on management decisions rather than mechanisms, so practice should move to mixed, timed blocks earlier, and review should focus on why a management choice was right or wrong, not just on recalling a fact.',
  },
  {
    question: 'Does MedPrep Institute replace clerkship study?',
    answer:
      'No. It is a question bank, meant to sit alongside your clerkship rotations and a concise review text, not replace either.',
  },
  {
    question: 'Which Step 2 CK question bank should I use?',
    answer:
      'It depends on your budget and whether you want shelf-exam overlap. Our [Step 2 CK question bank comparison](/blog/top-usmle-step-2-ck-question-banks) breaks down UWorld, AMBOSS, TrueLearn and every other major bank, with verified prices and exactly which plan to buy for your situation.',
  },
  {
    question: 'What does Step 2 CK actually cover?',
    answer:
      'Our [Step 2 CK syllabus guide](/blog/usmle-step-2-ck-syllabus) breaks down the official content outline by content area, clinical science and physician task, with the exact percentage ranges from USMLE.org.',
  },
];

const Body = () => (
  <>
    <p>
      USMLE Step 2 CK usually lands during or right after your core clerkships, when you already
      know the material but have never had to apply all of it, across every specialty, in exam
      form. This guide covers what the exam tests, when to start, a sample schedule, and how to
      read its vignettes, so you can turn clerkship-year knowledge into an exam-ready plan. If you
      have not started practicing yet, you can pair this guide with the{' '}
      <Link href="/usmle-step-2-question-bank">Step 2 CK question bank</Link> we build.
    </p>

    <H2 section={S.what} />
    <p>
      Step 2 CK ("Clinical Knowledge") tests whether you can apply medical knowledge to patient
      care: diagnosing a presentation, choosing the next best step in management, interpreting a
      test result, and deciding how to follow a patient over time. It is computer-based,
      multiple-choice, and organized into timed blocks with breaks, across clerkship-style
      specialties rather than basic-science systems. Block count, timing and question format are
      set by the NBME and can change, so check{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>{' '}
      for the current exam structure before you plan around it.
    </p>

    <H2 section={S.scored} />
    <Callout title="This is the exam students still get numeric scores on" tone="disclosure">
      <p>
        Step 1 moved to pass/fail scoring in 2022, but Step 2 CK still reports a three-digit score.
        For most residency applicants, Step 2 CK is now the main standardized score programs see,
        which is a real shift in how much a strong performance here can matter. Confirm current
        expectations with your school's advising office, since how individual programs weigh it
        can vary by specialty and can change.
      </p>
    </Callout>
    <p>
      That makes the calculus different from Step 1: you are not just aiming to pass comfortably,
      you are aiming for your best real performance, which changes how much timed, mixed practice
      and self-assessment you want before test day.
    </p>

    <H2 section={S.when} />
    <ul>
      <li>
        <strong>During clerkships.</strong> Use a question bank alongside each rotation, so
        internal medicine questions get done during your internal medicine block, surgery during
        surgery, and so on. This is the single biggest lever for Step 2 CK, since clinical
        experience and question practice reinforce each other in a way that is hard to replicate
        later.
      </li>
      <li>
        <strong>Dedicated study period.</strong> Many students take somewhere between two and six
        weeks after clerkships end, shorter than a typical Step 1 block, since the content is
        already familiar. Use it to fill gaps in specialties you rotated through early, and to
        build timed, mixed-block stamina.
      </li>
    </ul>

    <H2 section={S.outline} />
    <p>Step 2 CK draws its content from the core clerkships, organized roughly as:</p>
    <ul>
      <li>
        <strong>Internal medicine,</strong> the single largest share of the exam, spanning
        cardiology, pulmonology, gastroenterology, endocrinology, nephrology, hematology and
        infectious disease.
      </li>
      <li>
        <strong>Surgery,</strong> including perioperative care and surgical emergencies, not only
        operative technique.
      </li>
      <li>
        <strong>Pediatrics, obstetrics and gynecology, and psychiatry,</strong> each with their own
        share of vignettes.
      </li>
      <li>
        <strong>Family medicine and preventive care,</strong> including screening guidelines and
        outpatient management.
      </li>
      <li>
        <strong>Cross-cutting topics:</strong> biostatistics, ethics, and patient safety and
        communication, which appear across every specialty rather than in one block.
      </li>
    </ul>
    <p>
      The exact blueprint and weighting is published and updated by the NBME. Use it to confirm
      your review is not skipping a whole specialty, rather than memorizing exact percentages.
    </p>

    <H2 section={S.vignette} />
    <p>
      Step 2 CK vignettes tend to be longer than Step 1's, and the correct answer is rarely the
      diagnosis itself. A few habits that speed this up:
    </p>
    <ol>
      <li>
        <strong>Read the question stem first,</strong> the actual question being asked, then read
        the vignette knowing what you are looking for.
      </li>
      <li>
        <strong>Identify what is being asked:</strong> diagnosis, next best step, next best test,
        or management. These call for different answers even from the same stem.
      </li>
      <li>
        <strong>Watch for the timeline.</strong> A patient's status "two days after" or "six months
        after" a first presentation is a different question than the initial presentation.
      </li>
      <li>
        <strong>Rule out the tempting wrong answer.</strong> The most common wrong choice is often
        correct for a related but different presentation. Confirm why it does not fit this one.
      </li>
    </ol>

    <H2 section={S.resources} />
    <ul>
      <li>
        <strong>A clinical-vignette question bank,</strong> which is where most Step 2 CK
        preparation happens, since the exam itself is vignette-based.
      </li>
      <li>
        <strong>A concise review text</strong> organized by clerkship, used to fill specific gaps
        rather than read cover to cover.
      </li>
      <li>
        <strong>Official self-assessments,</strong> saved for the final two weeks to check
        readiness under real timing.
      </li>
    </ul>
    <p>
      If you have not picked a question bank yet, our comparison of{' '}
      <Link href="/blog/best-usmle-question-banks">
        the best USMLE question banks for Step 1, Step 2 CK and Step 3
      </Link>{' '}
      covers prices, question counts and free trials as of 2026. If you are earlier in the
      sequence, our{' '}
      <Link href="/blog/usmle-step-1-study-guide">USMLE Step 1 study guide</Link> covers the exam
      that comes before this one.
    </p>

    <H2 section={S.schedule} />
    <p>
      Here is a sample four-week dedicated study period. Stretch or compress it based on how much
      of the content is still fresh from your clerkships.
    </p>
    <ComparisonTable
      caption="A sample four-week Step 2 CK dedicated study schedule"
      columns={[
        { key: 'phase', label: 'Week' },
        { key: 'focus', label: 'Focus' },
        { key: 'mode', label: 'Question practice' },
        { key: 'goal', label: 'Goal' },
      ]}
      rows={[
        {
          id: 'w1',
          cells: {
            phase: 'Week 1',
            focus: 'Review your weakest clerkships first',
            mode: 'Untimed, by specialty',
            goal: 'Close the biggest gaps early',
          },
        },
        {
          id: 'w2',
          cells: {
            phase: 'Week 2',
            focus: 'Cover every specialty at least once',
            mode: 'Timed, mixed blocks',
            goal: 'Build exam-day pacing across specialties',
          },
        },
        {
          id: 'w3',
          featured: true,
          cells: {
            phase: 'Week 3',
            focus: 'Targeted review of what you keep missing',
            mode: 'Timed, missed-concept review',
            goal: 'Turn misses into strengths',
          },
        },
        {
          id: 'w4',
          cells: {
            phase: 'Week 4',
            focus: 'Self-assessments and light review',
            mode: '1 to 2 full-length self-assessments',
            goal: 'Confirm readiness, then rest before test day',
          },
        },
      ]}
      footnote="If clerkships already gave you strong exposure to a specialty, spend less of week 1 on it and more on the ones you rotated through early or found hardest."
    />

    <H2 section={S.routine} />
    <ComparisonTable
      caption="A sample daily routine during dedicated study"
      columns={[
        { key: 'time', label: 'Block' },
        { key: 'activity', label: 'Activity' },
      ]}
      rows={[
        { id: 'block1', cells: { time: 'Morning', activity: 'One timed, mixed question block, plus review of every explanation' } },
        { id: 'break', cells: { time: 'Midday', activity: 'Break: food, movement, away from a screen' } },
        { id: 'block2', cells: { time: 'Afternoon', activity: 'A second block, or focused review of your weakest specialty' } },
        { id: 'wrapup', cells: { time: 'Evening', activity: 'Light review of missed concepts, then stop' } },
      ]}
      footnote="Two full mixed blocks a day, with complete review, is a realistic and sustainable pace for most students."
    />

    <H2 section={S.tips} />
    <ol>
      <li>
        <strong>Practice mixed, not by specialty,</strong> as soon as you have covered each
        specialty once. The real exam does not tell you which clerkship a question is testing.
      </li>
      <li>
        <strong>Read every explanation,</strong> including for questions you got right, especially
        if you were not fully sure why.
      </li>
      <li>
        <strong>Track misses by concept,</strong> not by question, so patterns across a specialty
        stand out.
      </li>
      <li>
        <strong>Let missed concepts come back on a schedule</strong> instead of only once, from a
        different clinical angle each time.
      </li>
      <li>
        <strong>Use self-assessments to check readiness,</strong> not as daily practice. Save them
        for when you are close to done.
      </li>
      <li>
        <strong>Protect sleep during the final two weeks.</strong> Long vignettes reward a clear
        head more than a few extra hours of cramming.
      </li>
    </ol>

    <H2 section={S.final} />
    <p>
      In the final week, taper new content and keep light review. Take at least one full day off
      close to the exam. On test day, treat every block the same way: if a long vignette is taking
      too long, flag it, make your best answer, and move on. Losing pace on the rest of the block
      costs more than any single hard question.
    </p>

    <H2 section={S.medprep} />
    <p>
      MedPrep Institute is the question bank we build, meant to slot into the plan above: it is
      where you do your clerkship and mixed-block practice, and it takes over the job of
      scheduling your review.
    </p>
    <ul>
      <li>Clinical management vignettes with clinical images, by specialty or mixed across the exam.</li>
      <li>
        An adaptive engine that flags the concept behind a missed question and brings back
        variations on it through spaced repetition over the following days.
      </li>
      <li>
        Your weakest specialties are prioritized automatically, and progress from Step 1 carries
        over if you studied here.
      </li>
      <li>Physician-reviewed explanations, and short five-question sets that fit around clerkships.</li>
    </ul>
    <p>
      It does not include official self-assessment exams or a score predictor, so pair it with the
      official NBME assessments for readiness checks close to test day.
    </p>
    <PostCta
      heading="Try the Step 2 CK Qbank free for 7 days"
      body="Clinical management vignettes, by specialty or mixed, with reviews scheduled for whatever you miss."
      href={signup('medprep-section')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Practice with an engine that remembers what you miss"
      body="Short daily sets, reviews scheduled for you, and your weakest specialties prioritized automatically."
      href={signup('faq-end')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      This guide is general study planning guidance, not a guarantee of any exam result or residency
      outcome. Exam format, timing and content outline details are set by the NBME and FSMB and can
      change, so check{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>{' '}
      for the current structure of Step 2 CK before you plan around it. How individual residency
      programs weigh USMLE scores varies and can change, so confirm current expectations with your
      school's advising office. MedPrep Institute is not affiliated with or endorsed by NBME, FSMB,
      USMLE or any other company named here. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'usmle-step-2-ck-study-guide',
  title: 'USMLE Step 2 CK Study Guide: How to Prepare, What to Study, and When to Start',
  seoTitle: 'USMLE Step 2 CK Study Guide (2026): How to Prepare',
  description:
    'A complete USMLE Step 2 CK study guide: when to start, a sample four-week schedule, the content outline, and how to read Step 2 CK vignettes.',
  publishedAt: '2026-09-27T14:00:00+02:00',
  updatedAt: '2026-09-27T14:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Surgical scene, downloaded from Unsplash (free to use under the Unsplash License):
  // https://images.unsplash.com/photo-1550831107-1553da8c8464
  heroImage: '/blog/usmle-step-2-ck-study-guide-hero.jpg',
  category: 'Study strategy',
  keywords: [
    'USMLE Step 2 CK study guide',
    'how to study for USMLE Step 2 CK',
    'Step 2 CK study schedule',
    'Step 2 CK content outline',
    'Step 2 CK dedicated study period',
    'when to start studying for Step 2 CK',
    'USMLE Step 2 CK tips',
    'Step 2 CK vignettes',
  ],
  readingMinutes: 10,
  sections: Object.values(S),
  faqs,
  Body,
};
