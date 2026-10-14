import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=two-passes-qbank`;

const S = {
  why: { id: 'why-two-passes', title: 'Why two passes beat one long grind' },
  first: { id: 'first-pass', title: 'Pass one: learn alongside your coursework' },
  second: { id: 'second-pass', title: 'Pass two: your dedicated study period' },
  calc: { id: 'daily-question-calculator', title: 'Daily question calculator' },
  timing: { id: 'timed-random-and-full-blocks', title: 'Timed, random and full blocks' },
  review: { id: 'triage-your-review', title: 'How to review without falling behind' },
  short: { id: 'not-enough-time', title: 'What if you do not have time for two passes?' },
  engine: {
    id: 'let-the-engine-run-your-second-pass',
    title: 'Let an adaptive engine run your second pass',
  },
  plan: { id: 'sample-two-pass-plan', title: 'A sample two-pass plan' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Do I really need two passes through a question bank?',
    answer:
      'No, but it is a reliable way to make sure the first pass sticks. If your time is limited, one full pass plus a focused second pass over what you missed captures most of the benefit.',
  },
  {
    question: 'When should I start the first pass?',
    answer:
      'Many students start in their pre-clinical years, alongside classes, in untimed topic mode. Starting earlier spreads the work over a longer period, so each day is small. Pick a plan length that matches when you will actually use it.',
  },
  {
    question: 'How many questions should I do a day?',
    answer:
      'Divide the total number of questions by your real study days. During coursework that is often around 8 to 12 a day. During dedicated study it is often between 60 and 120, depending on how many weeks you have.',
  },
  {
    question: 'Should I do timed or untimed questions?',
    answer:
      'Untimed while you are learning, timed and mixed during dedicated study. The exam is timed and unsorted, so your final weeks of practice should be too.',
  },
  {
    question: 'How long should I spend reviewing explanations?',
    answer:
      'Match it to the question. Read missed questions you should have known in full, treat guesses as misses, and only skim the ones you got right with confidence. Do not shorten your daily quota to make room for review.',
  },
  {
    question: 'Is Step 1 still worth this much effort now that it is pass/fail?',
    answer:
      'Step 1 is reported as pass/fail, so a comfortable margin matters more than a high score. The same planning still applies, and the concepts you learn carry into Step 2 CK, where a numeric score is still reported.',
  },
  {
    question: 'Does MedPrep Institute replace a second pass?',
    answer:
      'For many students it covers the point of one. Missed concepts return on a spaced schedule from different angles, so you revisit what you struggle with without re-running everything. It does not include official self-assessment exams, so use those separately to check readiness.',
  },
];

const Body = () => (
  <>
    <p>
      Almost every medical student hears the same advice about question banks: do two passes. It is
      easy to agree with and hard to picture. With thousands of questions to get through before
      test day, most people cannot see how one pass fits into a busy schedule, let alone two.
    </p>
    <p>
      The answer is planning. Two passes only work when you split them into two phases with two
      different jobs, and when you turn each phase into a small, fixed number of questions per day.
      This guide gives you the arithmetic, a calendar you can copy, and a way to review without
      falling behind. It applies to any question bank, and to{' '}
      <Link href="/usmle-step-1-question-bank">Step 1</Link>,{' '}
      <Link href="/usmle-step-2-question-bank">Step 2 CK</Link> and{' '}
      <Link href="/usmle-step-3-question-bank">Step 3</Link> alike.
    </p>

    <H2 section={S.why} />
    <p>
      A single pass tells you what you do not know. A second pass is where you fix it. The first
      time through, you meet most of the material cold, so your score mostly reflects exposure. The
      second time, you are checking whether the first pass actually stuck, and that is a much better
      picture of how ready you are.
    </p>
    <p>
      The other reason is memory. Seeing a concept once, even with a good explanation, fades within
      days. Seeing it again after a gap, especially a gap you have to work to bridge, is what moves
      it into long-term memory. Two passes are a rough, manual version of spaced repetition.
    </p>

    <H2 section={S.first} />
    <p>
      Pass one happens during coursework, well before dedicated study begins. Its job is learning,
      not testing. Use the bank as a companion to what you are already studying in class.
    </p>
    <h3>Turn each topic block into a daily number</h3>
    <p>
      When you start a new topic in class, check how many questions the bank has for that subject
      or system, then divide by the days in the block:
    </p>
    <p>
      <strong>questions in the topic ÷ days in the block = questions to do each day</strong>
    </p>
    <p>
      If a 21-day biochemistry block has 210 questions available, that is 10 questions a day. For
      most topics the answer lands around 8 to 12 questions daily, which is a small enough habit to
      survive exam weeks. Work ahead on light days so that a heavy day does not break the streak.
    </p>
    <h3>How to do pass one</h3>
    <ul>
      <li>
        <strong>Use untimed, tutor-style practice.</strong> You want the explanation right after
        each answer, while the question is still in your head.
      </li>
      <li>
        <strong>Do not chase your score.</strong> Early accuracy is not a prediction of anything.
        Accuracy matters in pass two.
      </li>
      <li>
        <strong>Stay in topic order.</strong> Practicing the system you just studied in class
        reinforces it while it is fresh.
      </li>
      <li>
        <strong>Note what you miss by concept.</strong> A pattern of misses in one area is worth
        more than any single wrong answer.
      </li>
    </ul>

    <H2 section={S.second} />
    <p>
      Pass two starts when dedicated study begins. Now the goal changes: you are practicing under
      realistic conditions and finding what is still weak.
    </p>
    <ol>
      <li>
        <strong>Reset your statistics if your bank allows it.</strong> A clean slate makes your
        dedicated-period accuracy an honest number instead of one blended with coursework guesses.
      </li>
      <li>
        <strong>Count your study days.</strong> Do not include off days. Only days you will really
        work belong in the count.
      </li>
      <li>
        <strong>Divide the total questions by those days.</strong> That is your daily quota.
      </li>
      <li>
        <strong>Protect the quota.</strong> When review runs long, do not cut questions. Cut review
        time on easy items instead (more on that below).
      </li>
    </ol>

    <H2 section={S.calc} />
    <p>
      The formula is <strong>total questions ÷ study days = questions per day</strong>. The table
      uses an example bank of 3,600 questions and six study days a week. Swap in your own bank size
      and schedule.
    </p>
    <ComparisonTable
      caption="Daily questions needed for a full second pass (example bank of 3,600 questions)"
      columns={[
        { key: 'length', label: 'Dedicated period' },
        { key: 'days', label: 'Study days (6 a week)' },
        { key: 'perDay', label: 'Questions per day' },
        { key: 'time', label: 'Time answering per day at 90 seconds each' },
      ]}
      rows={[
        { id: 'w4', cells: { length: '4 weeks', days: '24', perDay: '150', time: 'About 3.75 hours' } },
        { id: 'w6', cells: { length: '6 weeks', days: '36', perDay: '100', time: 'About 2.5 hours' } },
        { id: 'w8', cells: { length: '8 weeks', days: '48', perDay: '75', time: 'About 1.9 hours' } },
        { id: 'w10', cells: { length: '10 weeks', days: '60', perDay: '60', time: 'About 1.5 hours' } },
      ]}
      footnote="Time answering only. Reviewing explanations usually takes as long again, so budget for both."
    />
    <p>
      This table is the real lesson. If you only have four weeks, a full second pass means 150
      questions a day and a working day that is mostly questions. Knowing that early lets you choose
      a different plan before you are behind. It also tells you the latest date you can start.
    </p>

    <H2 section={S.timing} />
    <p>
      In pass one you practiced untimed. In pass two, move to timed, mixed blocks so you are training
      the conditions you will face on test day.
    </p>
    <ul>
      <li>
        <strong>Timed.</strong> Step 1 and Step 2 CK run in 60-minute blocks of up to 40 questions,
        which is about 90 seconds a question. Practicing at that pace builds the habit of moving
        on. Step 3 uses different block sizes, so check USMLE.org for the current layout.
      </li>
      <li>
        <strong>Random or mixed.</strong> The exam does not sort questions by system, so your
        practice should not either. Mixing makes you identify the topic, not just recall it.
      </li>
      <li>
        <strong>Full-length blocks.</strong> Work up to complete blocks to build stamina. The exam
        strings several of them together in one day.
      </li>
    </ul>

    <H2 section={S.review} />
    <p>
      Most people fall behind on review, not on questions. If you spend 90 seconds on each
      explanation in a 40-question block, that is an hour before you have even read anything in
      depth. Reviewing everything equally does not scale, so triage it.
    </p>
    <ComparisonTable
      caption="How to triage your explanation review"
      columns={[
        { key: 'result', label: 'What happened' },
        { key: 'meaning', label: 'What it usually means' },
        { key: 'action', label: 'What to do' },
      ]}
      rows={[
        {
          id: 'missed-known',
          cells: {
            result: 'Missed a question you should have known',
            meaning: 'A gap in something within reach',
            action: 'Read the full explanation and every wrong answer choice. Flag the concept to revisit.',
          },
        },
        {
          id: 'missed-new',
          cells: {
            result: 'Missed a genuinely new or very hard question',
            meaning: 'Low return for the time it costs',
            action: 'Read the core explanation, write one line, and move on.',
          },
        },
        {
          id: 'guessed',
          cells: {
            result: 'Got it right, but guessed',
            meaning: 'A gap that happened to go unnoticed',
            action: 'Treat it as a miss.',
          },
        },
        {
          id: 'confident',
          cells: {
            result: 'Got it right and felt sure',
            meaning: 'The concept is working',
            action: 'Skim the explanation for a stray detail, then move on.',
          },
        },
      ]}
      footnote="Time you save on the last two rows pays for the first."
    />
    <p>
      The point is to keep your question count constant and change how long each explanation gets.
      Cutting your daily quota to fit review is the mistake that breaks a second pass.
    </p>

    <H2 section={S.short} />
    <p>
      Not everyone has the weeks for a full second pass. If that is you, do one complete pass, then
      redo only the questions you missed or guessed. You will skip some material you would have
      benefited from, but you will spend your limited time on your weakest areas, which is where the
      points are.
    </p>
    <p>
      That partial pass is a version of what an adaptive question bank does automatically, which is
      the next section.
    </p>

    <H2 section={S.engine} />
    <p>
      Two passes are a manual workaround for a limitation of fixed-order question banks: the bank
      does not remember what you missed, so you have to. You calculate quotas, track weak concepts
      yourself, decide what to redo, and remember to redo it.
    </p>
    <p>
      MedPrep Institute is built to take that work off you. When you miss a question, the adaptive
      engine flags the underlying concept and brings you variations on it through spaced repetition
      over the following days, instead of just moving on. Your weakest disciplines are prioritized
      automatically, and you can restrict practice to one system, or leave it wide open.
    </p>
    <ComparisonTable
      caption="A manual two-pass plan vs MedPrep Institute"
      columns={[
        { key: 'task', label: 'The job' },
        { key: 'manual', label: 'Manual two-pass with a fixed-order bank' },
        { key: 'medprep', label: 'MedPrep Institute' },
      ]}
      rows={[
        {
          id: 'schedule',
          cells: {
            task: 'Scheduling reviews',
            manual: 'You plan and remember them yourself',
            medprep: 'Built-in spaced repetition schedules them, and a review calendar shows what is due',
          },
        },
        {
          id: 'weak',
          cells: {
            task: 'Finding weak areas',
            manual: 'You track misses by hand',
            medprep: 'The engine flags the underlying concept and prioritizes your weakest disciplines',
          },
        },
        {
          id: 'redo',
          cells: {
            task: 'Deciding what to redo',
            manual: 'You re-run whole blocks or filter by hand',
            medprep: 'Missed concepts return as new variations, from a different angle',
          },
        },
        {
          id: 'daily',
          cells: {
            task: 'Daily workload',
            manual: 'Set by a formula you calculate',
            medprep: 'Short five-question sets, so a small daily habit is enough',
          },
        },
        {
          id: 'guide',
          cells: {
            task: 'Study guide',
            manual: 'You build your own from your notes',
            medprep: 'A personalized guide of the objectives you keep missing, built from your own answers',
          },
        },
      ]}
      footnote="MedPrep does not include official-style self-assessment exams or a score predictor. Pair it with the official NBME assessments for full-length checks."
    />
    <p>
      MedPrep works best alongside the plan above, not instead of it. The daily-quota habit gives
      you structure, and the adaptive engine makes sure the time you put in goes to the concepts
      that need it. If you are short on time, it is also the closest thing to a targeted second pass
      that runs itself.
    </p>
    <PostCta
      heading="Let the engine handle your second pass"
      body="Practice in short five-question sets, and let MedPrep schedule the reviews for the concepts you miss."
      href={signup('engine-section')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.plan} />
    <p>
      Here is how the two phases fit together across a typical timeline. Adjust the numbers to your
      own schedule.
    </p>
    <ComparisonTable
      caption="A two-pass plan, from coursework to test day"
      columns={[
        { key: 'phase', label: 'Phase' },
        { key: 'when', label: 'When' },
        { key: 'mode', label: 'Mode' },
        { key: 'goal', label: 'Goal' },
      ]}
      rows={[
        {
          id: 'pass1',
          cells: {
            phase: 'Pass one',
            when: 'During coursework',
            mode: 'Untimed, by topic, about 8 to 12 questions a day',
            goal: 'Learn each topic while it is fresh',
          },
        },
        {
          id: 'reset',
          cells: {
            phase: 'Reset',
            when: 'Start of dedicated study',
            mode: 'Clear stats, count study days',
            goal: 'Set your daily quota',
          },
        },
        {
          id: 'pass2',
          cells: {
            phase: 'Pass two',
            when: 'Dedicated study',
            mode: 'Timed and mixed, quota per day',
            goal: 'Find what is still weak',
          },
        },
        {
          id: 'targeted',
          cells: {
            phase: 'Targeted review',
            when: 'Final weeks',
            mode: 'Missed and guessed concepts',
            goal: 'Close the remaining gaps',
          },
        },
        {
          id: 'check',
          cells: {
            phase: 'Readiness check',
            when: 'Close to test day',
            mode: 'Official self-assessments',
            goal: 'Confirm you are ready',
          },
        },
      ]}
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try the adaptive question bank free for 7 days"
      body="Short daily sets, reviews scheduled for you, and a personalized study guide built from what you miss."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      The arithmetic and study advice in this guide is general planning guidance, not a guarantee of
      any exam result. Exam format details can change, so check{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>{' '}
      for the current structure of each Step. MedPrep Institute is not affiliated with or endorsed
      by NBME, FSMB, USMLE or any other company. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'two-passes-through-a-usmle-question-bank',
  title: 'How to Get Through a USMLE Question Bank Twice: A Step-by-Step Two-Pass Plan',
  seoTitle: 'Two Passes Through a USMLE Qbank: Step-by-Step Plan',
  description:
    'A step-by-step plan for two passes through a USMLE question bank, with a daily question calculator, a review triage guide and a sample schedule.',
  publishedAt: '2026-09-26T12:00:00+02:00',
  updatedAt: '2026-09-26T12:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  heroImage: '/MedPrep (4).png',
  category: 'Study strategy',
  keywords: [
    'two passes through a question bank',
    'how to use a USMLE question bank',
    'UWorld two passes',
    'USMLE Step 1 study schedule',
    'qbank daily question calculator',
    'second pass qbank strategy',
    'how many questions per day USMLE',
    'spaced repetition USMLE',
  ],
  readingMinutes: 9,
  sections: Object.values(S),
  faqs,
  Body,
};
