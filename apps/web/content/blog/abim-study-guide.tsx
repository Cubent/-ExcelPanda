import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=abim-study-guide`;

const S = {
  what: { id: 'what-abim-tests', title: 'What the ABIM exam actually tests' },
  different: { id: 'not-a-usmle-step', title: 'How this is different from Step 1, 2 and 3' },
  when: { id: 'when-to-start', title: 'When to start studying' },
  outline: { id: 'content-outline', title: 'What to study: the exam blueprint' },
  resources: { id: 'core-resources', title: 'The core resources most residents use' },
  schedule: { id: 'sample-schedule', title: 'A sample study plan around your final year' },
  routine: { id: 'daily-routine', title: 'A sample daily routine that fits around residency' },
  tips: { id: 'study-tips', title: 'Tips that make the biggest difference' },
  final: { id: 'final-weeks', title: 'The final weeks and test day' },
  medprep: { id: 'medprep-institute', title: 'How MedPrep Institute fits into this plan' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'When should I take the ABIM exam?',
    answer:
      'Most residents take it in their final year of residency, once eligibility requirements are met. Registration deadlines fall well before the August test dates, so confirm your own program\'s timeline and register early.',
  },
  {
    question: 'Is the ABIM exam the same as a USMLE Step?',
    answer:
      'No. It is a board certification exam from the American Board of Internal Medicine, separate from the USMLE Steps administered by the NBME and FSMB, and it is not a licensing requirement the way the Steps are.',
  },
  {
    question: 'How many questions are on the exam?',
    answer:
      'The exam blueprint allows up to 240 single-best-answer questions across four timed sessions, with a portion of unscored pilot questions mixed in. Exact counts are set by ABIM and can change, so confirm on ABIM.org.',
  },
  {
    question: 'What happens if I do not pass?',
    answer:
      'ABIM publishes its own retake policies and timelines. Since the exam is offered once a year, confirm the current policy directly with ABIM rather than assuming.',
  },
  {
    question: 'What exactly does the ABIM exam cover?',
    answer:
      'See our [ABIM syllabus guide](/blog/abim-syllabus) for the full blueprint: all 18 medical content categories with their exact percentages, straight from ABIM’s official documentation.',
  },
  {
    question: 'Which ABIM question bank should I use?',
    answer:
      'See our [ABIM question bank comparison](/blog/top-abim-question-banks) for verified prices and a full strengths-and-drawbacks breakdown of UWorld, MKSAP, AMBOSS, TrueLearn and BoardVitals.',
  },
  {
    question: 'How is this different from studying for Step 3?',
    answer:
      'The content overlaps heavily with internal medicine topics from Step 3, but the exam is narrower, all internal medicine, rather than spanning every specialty, and it leans more on the judgment of a practicing internist than on multi-specialty breadth.',
  },
  {
    question: 'Does MedPrep Institute replace a self-assessment exam?',
    answer:
      'No. It is a question bank, meant to sit alongside ABIM\'s own self-assessment options, not replace them.',
  },
];

const Body = () => (
  <>
    <p>
      The ABIM Internal Medicine Certification Exam is the last exam most internal medicine
      residents take, usually near the end of residency, and it is a different kind of exam from
      the USMLE Steps that came before it: a board certification exam from the American Board of
      Internal Medicine, not a licensing exam from the NBME and FSMB. This guide covers what it
      tests, how it differs from the Steps, and how to build a study plan around your final year of
      residency. If you have not started practicing yet, you can pair this guide with the{' '}
      <Link href="/abim-internal-medicine-question-bank">ABIM question bank</Link> we build.
    </p>

    <H2 section={S.what} />
    <p>
      The exam evaluates the knowledge, diagnostic reasoning and clinical judgment expected of a
      practicing internist: recognizing both common and rare problems, making a diagnosis,
      ordering and interpreting tests, recommending treatment, and applying epidemiologic
      reasoning to patient care. It is computer-based, single-best-answer multiple choice, given
      once a year, typically in August, at Pearson VUE test centers. Exact dates, format and
      question counts are set by ABIM and can change, so check{' '}
      <a href="https://www.abim.org/" target="_blank" rel="noopener noreferrer">
        ABIM.org
      </a>{' '}
      for the current exam structure before you plan around it.
    </p>

    <H2 section={S.different} />
    <Callout title="This is board certification, not a USMLE Step" tone="disclosure">
      <p>
        Passing the ABIM exam is what lets you call yourself board certified in internal
        medicine. It is administered by ABIM, a different organization from the NBME and FSMB
        that write the USMLE Steps, and it is not required for a medical license the way the
        Steps are. Many employers and hospital credentialing committees expect board
        certification, and it is required to remain certified, but the exact requirements for your
        job or state can vary. Confirm current expectations with your program and any employer you
        are considering.
      </p>
    </Callout>

    <H2 section={S.when} />
    <p>
      Most residents take the exam in their final year, after enough of residency is complete to
      have covered the breadth of internal medicine. A few things that shape timing:
    </p>
    <ul>
      <li>
        <strong>Registration deadlines come earlier than you expect.</strong> ABIM sets
        registration windows well ahead of the August test dates, so confirm your eligibility and
        register early rather than assuming you can decide later.
      </li>
      <li>
        <strong>Your clinical rotations already cover most of the content.</strong> Unlike Step 1,
        you are not learning this material for the first time, you are consolidating three years
        of clinical experience into exam form.
      </li>
    </ul>

    <H2 section={S.outline} />
    <p>
      ABIM publishes a blueprint with the percentage of the exam assigned to each content area.
      The heaviest categories, at roughly 9 percent or more of the exam each, are:
    </p>
    <ul>
      <li><strong>Cardiovascular disease</strong> (the single largest category, around 14 percent).</li>
      <li><strong>Endocrinology, diabetes and metabolism.</strong></li>
      <li><strong>Gastroenterology.</strong></li>
      <li><strong>Infectious disease.</strong></li>
      <li><strong>Pulmonary disease.</strong></li>
      <li><strong>Rheumatology and orthopedics.</strong></li>
    </ul>
    <p>
      The rest of the exam spreads across hematology, medical oncology, nephrology and urology,
      neurology, psychiatry, dermatology, geriatric syndromes, allergy and immunology,
      obstetrics and gynecology, ophthalmology, otolaryngology and dental medicine, and a
      miscellaneous category, plus cross-cutting topics like critical care, clinical epidemiology,
      ethics, nutrition, palliative care and patient safety woven throughout. See our{' '}
      <Link href="/blog/abim-syllabus">ABIM syllabus guide</Link> for the exact percentage for
      every one of the 18 categories. ABIM reviews and updates this blueprint, so check the current
      version on{' '}
      <a href="https://www.abim.org/" target="_blank" rel="noopener noreferrer">
        ABIM.org
      </a>{' '}
      rather than treating these percentages as fixed.
    </p>

    <H2 section={S.resources} />
    <ul>
      <li>
        <strong>A question bank,</strong> for spaced practice across every category in the
        blueprint, not only the ones you feel strongest in.
      </li>
      <li>
        <strong>A concise review course or text,</strong> used to fill specific gaps, since most
        residents do not have time to read a comprehensive text cover to cover in their final
        year.
      </li>
      <li>
        <strong>Your own clinical experience,</strong> which covers a real share of the blueprint
        already. Question practice works best alongside it, not instead of it.
      </li>
    </ul>
    <p>
      If you are earlier in training, our guides to{' '}
      <Link href="/blog/usmle-step-2-ck-study-guide">USMLE Step 2 CK</Link> and{' '}
      <Link href="/blog/usmle-step-3-study-guide">USMLE Step 3</Link> cover the exams that come
      before this one.
    </p>

    <H2 section={S.schedule} />
    <p>
      Since the exam is once a year, most residents spread preparation across their final year
      rather than cramming into a short block at the end.
    </p>
    <ComparisonTable
      caption="A sample study plan across your final year of residency"
      columns={[
        { key: 'phase', label: 'When' },
        { key: 'focus', label: 'Focus' },
        { key: 'mode', label: 'Question practice' },
        { key: 'goal', label: 'Goal' },
      ]}
      rows={[
        {
          id: 'early',
          cells: {
            phase: 'Early in your final year',
            focus: 'Light daily habit, mixed across the blueprint',
            mode: 'Untimed, short sets between clinical duties',
            goal: 'Build the habit early, before registration deadlines pass',
          },
        },
        {
          id: 'mid',
          cells: {
            phase: 'Mid-year',
            focus: 'Cover every blueprint category at least once',
            mode: 'Timed, mixed sets',
            goal: 'Find gaps while you still have months to close them',
          },
        },
        {
          id: 'w4-2',
          featured: true,
          cells: {
            phase: 'Final 6 to 8 weeks',
            focus: 'Targeted review of what you keep missing',
            mode: 'Timed, missed-concept review',
            goal: 'Turn misses into strengths',
          },
        },
        {
          id: 'final',
          cells: {
            phase: 'Final 2 weeks',
            focus: 'Self-assessment and light review',
            mode: 'A full-length self-assessment if available',
            goal: 'Confirm readiness, then rest before test day',
          },
        },
      ]}
      footnote="Registering and starting early matters more here than for the Steps, since the exam is only offered once a year."
    />

    <H2 section={S.routine} />
    <ComparisonTable
      caption="A sample daily routine that fits around residency"
      columns={[
        { key: 'time', label: 'Window' },
        { key: 'activity', label: 'Activity' },
      ]}
      rows={[
        { id: 'morning', cells: { time: 'Before or between clinical duties', activity: 'One short mixed question set' } },
        { id: 'lightday', cells: { time: 'Lighter clinical days', activity: 'A longer timed set, plus full review of every explanation' } },
        { id: 'evening', cells: { time: 'Evening, when possible', activity: 'Light review of missed concepts from earlier in the day' } },
        { id: 'offday', cells: { time: 'A day off', activity: 'Self-assessment, closer to test day' } },
      ]}
      footnote="A small daily habit sustained across a full year adds up to far more coverage than a rushed final month."
    />

    <H2 section={S.tips} />
    <ol>
      <li>
        <strong>Register early.</strong> Missing an ABIM deadline can push your certification back
        an entire year, since the exam is only offered annually.
      </li>
      <li>
        <strong>Practice mixed across the blueprint,</strong> weighted toward the heaviest
        categories, cardiovascular disease especially, without ignoring the smaller ones entirely.
      </li>
      <li>
        <strong>Read every explanation,</strong> including for questions you got right, especially
        if you were not fully sure why.
      </li>
      <li>
        <strong>Track misses by concept,</strong> not by question, so patterns across a category
        stand out.
      </li>
      <li>
        <strong>Let missed concepts come back on a schedule</strong> instead of only once, from a
        different clinical angle each time.
      </li>
      <li>
        <strong>Use a self-assessment to check readiness,</strong> not as your main daily practice.
        Save it for your final weeks.
      </li>
    </ol>

    <H2 section={S.final} />
    <p>
      In the final weeks, taper new content and keep light review. Take time off close to the
      exam if your schedule allows it, rather than coming straight off a demanding rotation. On
      test day, pace yourself across all four sessions: if a question is taking too long, flag it,
      make your best answer, and move on.
    </p>

    <H2 section={S.medprep} />
    <p>
      MedPrep Institute is the question bank we build, meant to fit into the small gaps in a
      resident's final year rather than assume a dedicated study block.
    </p>
    <ul>
      <li>Internal medicine vignettes across the blueprint's categories, weighted or mixed.</li>
      <li>
        An adaptive engine that flags the concept behind a missed question and brings back
        variations on it through spaced repetition over the following days.
      </li>
      <li>
        Your weakest categories are prioritized automatically, and progress from Step 2 CK and
        Step 3 carries over if you studied here.
      </li>
      <li>Physician-reviewed explanations, and five-question sets built to fit around residency.</li>
    </ul>
    <p>
      It does not include an official self-assessment exam or a score predictor, so pair it with
      ABIM's own self-assessment options for readiness checks close to test day.
    </p>
    <PostCta
      heading="Try the ABIM Qbank free for 7 days"
      body="Five-question sets that fit around residency, with reviews scheduled for whatever you miss."
      href={signup('medprep-section')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Practice with an engine that remembers what you miss"
      body="Short daily sets, reviews scheduled for you, and your weakest categories prioritized automatically."
      href={signup('faq-end')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      This guide is general study planning guidance, not a guarantee of any exam or certification
      outcome. Exam format, timing, blueprint and registration requirements are set by the American
      Board of Internal Medicine and can change, so check{' '}
      <a href="https://www.abim.org/" target="_blank" rel="noopener noreferrer">
        ABIM.org
      </a>{' '}
      for the current structure before you plan around it. MedPrep Institute is not affiliated with
      or endorsed by ABIM, NBME, FSMB, USMLE or any other company named here. All trademarks belong
      to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'abim-study-guide',
  title: 'ABIM Internal Medicine Exam Study Guide: How to Prepare',
  seoTitle: 'ABIM Study Guide (2026): How to Prepare',
  description:
    'A complete ABIM Internal Medicine exam study guide: the blueprint, when to register, a sample study plan for your final year, and how it differs from the USMLE Steps.',
  publishedAt: '2026-09-28T12:00:00+02:00',
  updatedAt: '2026-09-28T12:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Physicians reviewing patient data, downloaded from Unsplash (free to use under the Unsplash License):
  // https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0
  heroImage: '/blog/abim-study-guide-hero.jpg',
  category: 'Study strategy',
  keywords: [
    'ABIM study guide',
    'how to study for ABIM',
    'ABIM exam blueprint',
    'ABIM certification exam format',
    'when to register for ABIM',
    'ABIM exam tips',
    'internal medicine board exam prep',
    'ABIM vs USMLE Step 3',
  ],
  readingMinutes: 9,
  sections: Object.values(S),
  faqs,
  Body,
};
