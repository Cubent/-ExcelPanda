import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-2-ck-study-schedule`;

const S = {
  choose: { id: 'how-long-do-you-need', title: 'How long do you need to study for Step 2 CK?' },
  compare: { id: 'schedules-at-a-glance', title: 'The 4, 8 and 12-week schedules at a glance' },
  four: { id: 'four-week-schedule', title: 'A 4-week Step 2 CK study schedule' },
  eight: { id: 'eight-week-schedule', title: 'An 8-week Step 2 CK study schedule' },
  twelve: { id: 'twelve-week-schedule', title: 'A 12-week Step 2 CK study schedule' },
  daily: { id: 'a-typical-day', title: 'What a typical study day looks like' },
  adjust: { id: 'adjusting-the-plan', title: 'How to adjust the plan as you go' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const Body = () => (
  <>
    <p>
      The right Step 2 CK schedule depends on how much clinical knowledge you carry out of your
      clerkships, how much time you can protect, and what score you are aiming for. This guide
      gives three templates (4, 8 and 12 weeks) built around the same core: question practice
      first, targeted review second, and honest self-assessment before test day.
    </p>

    <H2 section={S.choose} />
    <p>
      Many students land on four to eight weeks of dedicated time after their clerkships, and
      those who did question practice during their rotations can often use the shorter end. If
      you are balancing a rotation or working, the twelve-week version spreads the same load across
      more days. There is no universally correct length, so pick the one that lets you finish a
      full pass of questions with time left to review.
    </p>

    <H2 section={S.compare} />
    <ComparisonTable
      caption="Step 2 CK schedule templates"
      columns={[
        { key: 'plan', label: 'Plan' },
        { key: 'fit', label: 'Best for' },
        { key: 'qs', label: 'Daily questions (rough)' },
        { key: 'focus', label: 'Main focus' },
      ]}
      rows={[
        { id: '4', cells: { plan: '4 weeks', fit: 'Strong clerkship year, high daily availability', qs: '60 to 80', focus: 'One pass of mixed questions, rapid review of misses' } },
        { id: '8', cells: { plan: '8 weeks', fit: 'Most students', qs: '40 to 60', focus: 'One pass by system, then mixed blocks, then weak areas' } },
        { id: '12', cells: { plan: '12 weeks', fit: 'Studying alongside a rotation or job', qs: '20 to 40', focus: 'Steady pass with spaced review and a second look at misses' } },
      ]}
      footnote="Question counts are starting points. Adjust them to how thoroughly you review explanations."
    />

    <H2 section={S.four} />
    <ul>
      <li>
        <strong>Week 1:</strong> take a baseline practice assessment, then start timed, mixed
        blocks. Skim explanations for everything, and note recurring weak topics.
      </li>
      <li>
        <strong>Weeks 2 and 3:</strong> continue mixed blocks daily. Spend the afternoon on focused
        review of your weakest areas, using your missed-question log rather than rereading texts.
      </li>
      <li>
        <strong>Week 4:</strong> take a second assessment early in the week, review it fully, then
        taper. Keep the last two days light.
      </li>
    </ul>

    <H2 section={S.eight} />
    <ul>
      <li>
        <strong>Weeks 1 to 4:</strong> work through questions by system or specialty, in tutor or
        untimed mode if you need to build confidence. Review every explanation.
      </li>
      <li>
        <strong>Weeks 5 and 6:</strong> move to timed, mixed blocks, since the real exam does not
        label specialties. Take an assessment at the end of week 6.
      </li>
      <li>
        <strong>Week 7:</strong> redo missed and flagged questions and fix the weak areas the
        assessment exposed.
      </li>
      <li>
        <strong>Week 8:</strong> take a final assessment, then review lightly and rest before test
        day.
      </li>
    </ul>

    <H2 section={S.twelve} />
    <ul>
      <li>
        <strong>Weeks 1 to 6:</strong> a steady, moderate daily set, ideally matched to your
        current rotation, so each clerkship reinforces the corresponding questions.
      </li>
      <li>
        <strong>Weeks 7 to 9:</strong> switch to mixed blocks and add a weekly review session on
        past misses.
      </li>
      <li>
        <strong>Weeks 10 to 12:</strong> assessments in weeks 10 and 12, a repeat of weak areas in
        between, and a light final few days.
      </li>
    </ul>
    <Callout title="Match the format to the real exam" tone="disclosure">
      <p>
        As of May 2026 the exam runs as sixteen 30-minute blocks, so timed sets of about 20
        questions mirror test day closely. See our{' '}
        <Link href="/blog/usmle-step-2-ck-exam-dates-2026">Step 2 CK exam dates guide</Link> for
        details of the change.
      </p>
    </Callout>

    <H2 section={S.daily} />
    <ol>
      <li>Morning: one or two timed blocks.</li>
      <li>Midday: review every explanation, right and wrong, and log what you missed.</li>
      <li>Afternoon: a focused review of one weak area, using questions rather than rereading.</li>
      <li>Evening: a short flashcard or spaced-review session, then stop.</li>
    </ol>

    <H2 section={S.adjust} />
    <p>
      If your assessment scores are flat, the problem is usually review quality, not question
      volume. Slow down on explanations, re-test missed topics a few days later, and cut low-value
      content. If you are well ahead of target, shorten the plan rather than padding it. For the
      score you should aim for, see our{' '}
      <Link href="/blog/step-2-ck-score-by-specialty">score by specialty guide</Link>, and for the
      wider strategy, the <Link href="/blog/usmle-step-2-ck-study-guide">Step 2 CK study guide</Link>.
    </p>
    <PostCta
      heading="Put your Step 2 CK schedule on autopilot"
      body="Short daily sets, an adaptive engine that tracks what you keep missing, and reviews scheduled for you automatically."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <h3>How many weeks should I study for Step 2 CK?</h3>
    <p>
      Four to eight weeks of dedicated time is common, longer if you are studying alongside other
      work. Choose the length that lets you finish a full question pass with time to review.
    </p>
    <h3>How many questions should I do per day?</h3>
    <p>
      Roughly 40 to 80 on a dedicated schedule, fewer if you are balancing a rotation. Reviewing
      explanations thoroughly matters more than the count.
    </p>
    <h3>Should I study by system or in mixed blocks?</h3>
    <p>
      Start by system if you need to rebuild knowledge, then move to timed, mixed blocks as the
      exam approaches.
    </p>
    <h3>When should I take practice assessments?</h3>
    <p>
      One early as a baseline, and one or two in the final weeks to check readiness.
    </p>
    <h3>Can I study during my clerkships?</h3>
    <p>
      Yes, and it is one of the most effective strategies. Match questions to your current
      rotation.
    </p>
    <h3>What if I fall behind?</h3>
    <p>
      Cut low-yield material and protect review time, or move your exam date if the data says you
      are not ready.
    </p>
    <PostCta
      heading="Try the adaptive Step 2 CK Qbank free for 7 days"
      body="Short sets, reviews scheduled for you, and your weakest specialties prioritized automatically."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      These schedules are general study templates, not guarantees of a score. Exam format and
      policies are set by the NBME and FSMB and can change, so confirm current details on{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>
      . MedPrep Institute is not affiliated with or endorsed by NBME, FSMB, USMLE or any other
      company named here. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'step-2-ck-study-schedule',
  title: 'USMLE Step 2 CK Study Schedule: 4, 8 and 12-Week Plans',
  seoTitle: 'Step 2 CK Study Schedule: 4, 8 & 12-Week Plans',
  description:
    'Three Step 2 CK study schedules (4, 8 and 12 weeks) with daily question targets, assessment timing and tips for adjusting as you go.',
  publishedAt: '2026-10-13T10:00:00+02:00',
  updatedAt: '2026-10-13T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Study plans',
  keywords: [
    'Step 2 CK study schedule',
    '4 week Step 2 CK study plan',
    '8 week Step 2 CK study plan',
    '12 week Step 2 CK study plan',
    'how long to study for Step 2 CK',
  ],
  readingMinutes: 7,
  sections: Object.values(S),
  Body,
};
