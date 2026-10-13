import { Callout } from '@/components/blog/callout';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-1-dedicated-study-period`;

const S = {
  short: { id: 'how-long', title: 'How long should your Step 1 dedicated study period be?' },
  factors: { id: 'what-decides-it', title: 'What decides the right length for you?' },
  before: { id: 'before-dedicated', title: 'What to do before dedicated study begins' },
  structure: { id: 'structuring-the-period', title: 'How to structure the period' },
  pf: { id: 'pass-fail-changes', title: 'How pass/fail changes the plan' },
  mistakes: { id: 'common-mistakes', title: 'Common mistakes' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const Body = () => (
  <>
    <p>
      "Dedicated" is the block of time between the end of your preclinical courses and your Step 1
      exam, when studying for the exam is your main job. Schools set it anywhere from a few weeks
      to a few months. This guide helps you decide how long yours should be and how to use it.
    </p>

    <H2 section={S.short} />
    <p>
      Many students use somewhere around four to eight weeks of full-time study. Schools that give
      more time often expect students to use the extra weeks for review rather than
      first-time learning. The right number depends on you, not on what a classmate did.
    </p>

    <H2 section={S.factors} />
    <ul>
      <li>
        <strong>Baseline performance.</strong> Take a practice assessment before you commit to a
        date. Scores well above the passing line suggest a shorter period; scores near it suggest
        a longer one.
      </li>
      <li>
        <strong>Preclinical retention.</strong> If you used spaced repetition and questions during
        your courses, you have less to rebuild.
      </li>
      <li>
        <strong>Daily capacity.</strong> Six to eight focused hours a day is sustainable for most.
        More rarely helps.
      </li>
      <li>
        <strong>Your goal.</strong> A comfortable pass needs less than the cushion some students
        want for peace of mind.
      </li>
    </ul>

    <H2 section={S.before} />
    <p>
      The strongest dedicated periods start earlier than the calendar says. During your courses:
    </p>
    <ul>
      <li>Do questions alongside each block, not only at the end.</li>
      <li>Keep a log of what you miss, since it becomes your dedicated-period study list.</li>
      <li>Take a baseline assessment at least a few weeks before dedicated begins.</li>
    </ul>

    <H2 section={S.structure} />
    <ol>
      <li>
        <strong>Weeks 1 to 2:</strong> a first pass through questions by system, reviewing every
        explanation.
      </li>
      <li>
        <strong>Weeks 3 to 4:</strong> weak-area review using your miss log, with spaced repetition
        for facts.
      </li>
      <li>
        <strong>Next block:</strong> timed, mixed blocks, to build stamina for a full test day.
      </li>
      <li>
        <strong>Final week:</strong> an assessment, light review and rest.
      </li>
    </ol>
    <p>
      Adapt the length of each phase to your total time. Our{' '}
      <Link href="/blog/usmle-step-1-study-guide">Step 1 study guide</Link> goes deeper on each
      stage.
    </p>

    <H2 section={S.pf} />
    <p>
      Step 1 is now pass/fail, so the aim is to clear the passing standard with margin, not to
      maximize a score. That usually shortens the amount of extra polishing needed and moves more
      of your effort to Step 2 CK. See our{' '}
      <Link href="/blog/usmle-step-1-pass-fail-score">Step 1 pass/fail guide</Link> for what that
      means for residency.
    </p>
    <Callout title="Don't borrow someone else's timeline" tone="disclosure">
      <p>
        Online dedicated-period posts reflect the author's school, baseline and goal. Your own
        assessment data is a better guide than a number from a forum.
      </p>
    </Callout>

    <H2 section={S.mistakes} />
    <ul>
      <li>Rereading content instead of practicing with questions.</li>
      <li>Skipping explanations for questions you got right.</li>
      <li>Adding more resources when the real issue is review quality.</li>
      <li>Skipping rest in the last days.</li>
    </ul>
    <PostCta
      heading="Make your dedicated period count"
      body="Short daily sets, an adaptive engine that tracks what you keep missing, and reviews scheduled for you automatically."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <h3>How long should dedicated study for Step 1 be?</h3>
    <p>
      Commonly four to eight weeks of full-time study, depending on your baseline and goals.
    </p>
    <h3>Is dedicated time enough on its own?</h3>
    <p>
      It works best on top of question practice during your courses.
    </p>
    <h3>How many hours a day should I study?</h3>
    <p>Six to eight focused hours is sustainable for most students.</p>
    <h3>When should I schedule the exam?</h3>
    <p>
      After a baseline assessment, once you can estimate how much time you need. Leave some
      flexibility.
    </p>
    <h3>Does pass/fail mean I can study less?</h3>
    <p>
      You are aiming for a comfortable pass rather than a maximum score, but the knowledge still
      carries into Step 2 CK.
    </p>
    <PostCta
      heading="Try the adaptive Step 1 Qbank free for 7 days"
      body="Short sets, reviews scheduled for you, and your weakest systems prioritized automatically."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      This guide offers general study advice, not a guarantee of any result. Exam rules are set by
      the NBME and FSMB and can change, so confirm current details on{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>
      . MedPrep Institute is not affiliated with or endorsed by NBME, FSMB, USMLE or any other
      company named here. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'usmle-step-1-dedicated-study-period',
  title: 'How Long Should Your USMLE Step 1 Dedicated Study Period Be?',
  seoTitle: 'Step 1 Dedicated Study Period: How Long?',
  description:
    'How long a Step 1 dedicated study period should be, what decides it, how to structure it and how pass/fail changes the plan.',
  publishedAt: '2026-10-13T10:05:00+02:00',
  updatedAt: '2026-10-13T10:05:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Study plans',
  keywords: [
    'Step 1 dedicated study period',
    'how long to study for Step 1',
    'Step 1 study schedule',
    'Step 1 dedicated time',
  ],
  readingMinutes: 5,
  sections: Object.values(S),
  Body,
};
