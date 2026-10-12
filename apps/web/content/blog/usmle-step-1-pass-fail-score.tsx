import { Callout } from '@/components/blog/callout';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-1-pass-fail-score`;

const S = {
  passfail: { id: 'is-step-1-pass-fail', title: 'Is USMLE Step 1 pass/fail?' },
  passing: { id: 'passing-score', title: 'What is the Step 1 passing score?' },
  report: { id: 'what-your-report-shows', title: 'What does your Step 1 score report show?' },
  matters: { id: 'does-it-still-matter', title: 'Does Step 1 still matter for residency?' },
  fail: { id: 'if-you-fail', title: 'What happens if you fail Step 1?' },
  oldscores: { id: 'old-three-digit-scores', title: 'What if you have an old three-digit score?' },
  prep: { id: 'what-passing-takes', title: 'What does passing take in practice?' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const Body = () => (
  <>
    <p>
      Step 1 no longer gives you a number to compare with classmates. It gives you a single
      outcome: pass or fail. This guide explains what that means, what the passing standard is,
      what your score report actually contains, and how programs use Step 1 now that the
      three-digit score is gone.
    </p>

    <H2 section={S.passfail} />
    <p>
      Yes. Since January 26, 2022, USMLE Step 1 reports only a pass or fail outcome. Examinees who
      tested before that date still have a three-digit score on their transcript, and those scores
      stay in place.
    </p>
    <p>
      Step 2 CK and Step 3 were not changed. Both still report a three-digit score alongside the
      pass/fail outcome. See our <Link href="/blog/usmle-step-2-ck-score-percentile">Step 2 CK
      score and percentile guide</Link> for how that score is distributed.
    </p>

    <H2 section={S.passing} />
    <p>
      The minimum passing standard for Step 1 is a three-digit score of 196. You will not see your
      own score, but the pass/fail decision is made against that standard. It is reviewed
      periodically by the USMLE program and can be revised.
    </p>
    <Callout title="Confirm the current standard" tone="disclosure">
      <p>
        Passing standards are set by the USMLE program and can change. Check the performance data
        and passing-standard pages on USMLE.org for the current number before you rely on it.
      </p>
    </Callout>

    <H2 section={S.report} />
    <p>
      A Step 1 report lists the pass or fail outcome and a performance profile by content area.
      The profile shows broad bands (for example, lower, borderline or higher) for disciplines and
      organ systems, not a numeric score. Failing examinees also receive more detail on where they
      fell short, to guide a retake.
    </p>
    <p>
      The practical value of the profile is as a study map. If you passed with several weak bands,
      that tells you where to spend time in your preclinical-to-clinical transition before Step 2
      CK.
    </p>

    <H2 section={S.matters} />
    <p>
      Pass/fail removed Step 1 as a ranking tool, but not as a requirement. A pass is still
      required to progress, and a fail is a visible red flag. What changed is where programs look
      for differentiation:
    </p>
    <ul>
      <li>
        <strong>Step 2 CK</strong> is now the main standardized score in most applications, which
        raises its importance and often pulls students toward taking it earlier.
      </li>
      <li>
        <strong>Clerkship grades, letters and away rotations</strong> carry more weight.
      </li>
      <li>
        <strong>Research, school reputation and program-specific signals</strong> fill in the
        remaining gaps.
      </li>
    </ul>
    <p>
      Many students respond by treating Step 1 as a pass-with-margin target and then putting their
      extra effort into Step 2 CK. Our{' '}
      <Link href="/blog/usmle-step-1-study-guide">Step 1 study guide</Link> covers how to plan for
      that.
    </p>

    <H2 section={S.fail} />
    <p>
      A fail does not end your path, but it needs a plan. In general:
    </p>
    <ul>
      <li>There is a mandatory waiting period before you may retake the exam.</li>
      <li>
        USMLE limits the number of attempts per Step and the number allowed in a 12-month period.
        A fourth attempt carries additional timing requirements.
      </li>
      <li>
        Every attempt, including a failed one, appears on your transcript. Programs see the full
        history.
      </li>
    </ul>
    <p>
      The exact waiting periods and attempt limits are set by the USMLE program, so read the
      current policy before you schedule a retake.
    </p>
    <p>
      The most reliable way to avoid a retake is to measure readiness honestly before test day.
      Use timed, mixed blocks and a self-assessment in your last two weeks, and move your date if
      the data says you are not ready.
    </p>

    <H2 section={S.oldscores} />
    <p>
      If you took Step 1 before the change, your three-digit score remains on your transcript and
      programs will see it. There is no conversion between those scores and pass/fail, and your
      old score does not change your status as a pass. For applicants who tested under both
      systems, the Step 2 CK score becomes the main way to show current performance.
    </p>

    <H2 section={S.prep} />
    <p>
      Because the exam only asks for a pass, the goal shifts from maximizing points to being
      reliably above the line. That favors steady daily question practice over cramming. A single
      pass through a good question bank, with every missed question reviewed, is enough for many
      students; a second pass on weak areas is a sensible margin. Our post on{' '}
      <Link href="/blog/two-passes-through-a-usmle-question-bank">
        doing two passes through a question bank
      </Link>{' '}
      lays out how.
    </p>
    <PostCta
      heading="Build a pass-with-margin Step 1 plan"
      body="Short daily sets, an adaptive engine that tracks what you keep missing, and reviews scheduled for you automatically."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <h3>Is USMLE Step 1 pass/fail?</h3>
    <p>Yes. Since January 26, 2022 it reports only pass or fail.</p>
    <h3>What score do you need to pass Step 1?</h3>
    <p>
      The minimum passing standard is a three-digit score of 196, though examinees are not shown
      their own number.
    </p>
    <h3>Can I see my Step 1 score?</h3>
    <p>
      No. You receive a pass or fail outcome and a performance profile by content area, not a
      numeric score.
    </p>
    <h3>Do residency programs care about Step 1 now?</h3>
    <p>
      A pass is required and a fail is a red flag, but programs rely more on Step 2 CK, clerkship
      performance and other signals to compare applicants.
    </p>
    <h3>Can I retake Step 1 if I pass?</h3>
    <p>No. Retakes are only allowed after a failed attempt.</p>
    <h3>What happens to my old three-digit Step 1 score?</h3>
    <p>It stays on your transcript. Pass/fail applies only to exams taken after the change.</p>
    <h3>Should I still take Step 1 seriously?</h3>
    <p>
      Yes. A pass is mandatory, and the knowledge carries into Step 2 CK, which does report a
      score.
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
      This guide reflects publicly available USMLE program information as of this writing.
      Passing standards, retake policies and reporting formats are set by the NBME and FSMB and
      can change without notice, so confirm current details directly on{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>{' '}
      before making plans. MedPrep Institute is not affiliated with or endorsed by NBME, FSMB,
      USMLE, ECFMG or any other company named here. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'usmle-step-1-pass-fail-score',
  title: 'USMLE Step 1 Pass/Fail: Passing Score, Score Report and What Programs See',
  seoTitle: 'USMLE Step 1 Pass/Fail: Passing Score Explained',
  description:
    'Step 1 is pass/fail. See the passing standard, what your score report shows, what happens if you fail, and how programs use Step 1 now.',
  publishedAt: '2026-10-12T10:00:00+02:00',
  updatedAt: '2026-10-12T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Scoring',
  keywords: [
    'USMLE Step 1 pass fail',
    'USMLE Step 1 passing score',
    'Step 1 pass/fail score report',
    'what happens if you fail Step 1',
    'Step 1 pass fail residency',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  Body,
};
