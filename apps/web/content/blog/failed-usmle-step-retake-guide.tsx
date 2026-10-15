import { Callout } from '@/components/blog/callout';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=failed-usmle-step-retake-guide`;

const S = {
  first: { id: 'first-steps', title: 'What to do first after a fail' },
  rules: { id: 'retake-rules', title: 'What are the USMLE retake rules?' },
  why: { id: 'why-it-happened', title: 'Work out why it happened' },
  plan: { id: 'retake-plan', title: 'Build a retake plan' },
  apps: { id: 'effect-on-residency', title: 'How a fail affects residency applications' },
  support: { id: 'getting-support', title: 'Getting support' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Can I retake a USMLE Step after failing?',
    answer:
      'Yes, within the limit of four attempts per Step and the spacing rules.',
  },
  {
    question: 'How long do I have to wait to retake?',
    answer:
      'Yes, there are rules on spacing: no more than three attempts at the same exam in 12 months, and a fourth attempt must come at least 12 months after your first and six months after your latest. Confirm the current policy on USMLE.org.',
  },
  {
    question: 'Will residency programs see my failed attempt?',
    answer:
      'Yes. All attempts appear on your transcript.',
  },
  {
    question: 'Can I still match after failing a Step?',
    answer:
      'Many applicants do. Programs weigh the retake result and the rest of your application.',
  },
  {
    question: 'What should I change for the retake?',
    answer:
      'Use your performance profile and practice data to find the cause, then change your review method, not just your hours.',
  },
];

const Body = () => (
  <>
    <p>
      Failing a USMLE Step is hard, and it is also recoverable. Many physicians have a failed
      attempt behind them. This guide covers what to do first, how the retake rules work in
      general, and how to build a plan that turns a second attempt into a pass.
    </p>

    <H2 section={S.first} />
    <ol>
      <li>Take a day or two before making decisions. A rushed retake date is a common mistake.</li>
      <li>Download your score report and read the performance profile.</li>
      <li>Tell your dean's office or advisor, who can help with your school's policies.</li>
      <li>Look up the current retake rules before you register again.</li>
    </ol>

    <H2 section={S.rules} />
    <p>
      As we last checked, the main rules are:
    </p>
    <ul>
      <li>
        <strong>Four attempts per Step.</strong> Incomplete attempts count, and attempts at the
        formerly administered Step 2 CS count toward the limit. After four unsuccessful attempts you
        are ineligible to apply for any Step.
      </li>
      <li>
        <strong>No more than three attempts in 12 months</strong> at the same exam.
      </li>
      <li>
        <strong>A longer wait before a fourth attempt.</strong> ECFMG's booklet lists at least 12
        months after your first attempt at that exam and at least six months after your most recent
        one.
      </li>
      <li>You generally cannot retake a Step you have already passed.</li>
      <li>
        State licensing boards may set their own, stricter limits on attempts. The FSMB site lists
        state-specific details.
      </li>
    </ul>
    <p>
      We cover these in more detail in our{' '}
      <Link href="/blog/usmle-attempt-limits-retake-rules">USMLE attempt limits guide</Link>.
    </p>
    <Callout title="Check the current policy" tone="disclosure">
      <p>
        These rules change from time to time, and older guides still list a six-attempt limit.
        Confirm the current policy on USMLE.org and with your state board before you schedule.
      </p>
    </Callout>

    <H2 section={S.why} />
    <p>
      The cause shapes the fix. Common patterns include:
    </p>
    <ul>
      <li>
        <strong>Content gaps.</strong> Your performance profile points to specific systems or
        disciplines.
      </li>
      <li>
        <strong>Test-taking.</strong> You scored well on practice questions but ran short of time
        or lost focus late in the day.
      </li>
      <li>
        <strong>Readiness.</strong> You tested before assessments showed you were ready.
      </li>
      <li>
        <strong>Life factors.</strong> Illness, stress or a hard schedule. These are legitimate,
        and worth discussing with your school.
      </li>
    </ul>

    <H2 section={S.plan} />
    <ol>
      <li>Set a retake date only after a practice assessment shows a clear margin above passing.</li>
      <li>Rebuild from your weakest areas using questions, not just rereading.</li>
      <li>Practice in timed, mixed blocks to rebuild stamina.</li>
      <li>Take at least two assessments before the exam and move the date if the trend is flat.</li>
      <li>Protect sleep and breaks. Burnout is a real cause of second failures.</li>
    </ol>
    <p>
      The <Link href="/blog/usmle-step-1-study-guide">Step 1</Link>,{' '}
      <Link href="/blog/usmle-step-2-ck-study-guide">Step 2 CK</Link> and{' '}
      <Link href="/blog/usmle-step-3-study-guide">Step 3</Link> study guides each include a
      starting structure you can adapt.
    </p>

    <H2 section={S.apps} />
    <p>
      A failed attempt appears on your transcript and programs can see it. It is not
      disqualifying, and a strong pass on the retake, good clerkship performance and a clear
      account of what you changed all help. Applicants usually address it briefly and factually
      rather than avoiding it.
    </p>

    <H2 section={S.support} />
    <p>
      Talk to your advisor, a mentor who has been through it, and your school's student support
      services. If you are struggling with stress or low mood, reach out to a professional. You do
      not have to manage this alone.
    </p>
    <PostCta
      heading="Rebuild with a plan that tracks your weak spots"
      body="An adaptive engine that tracks what you keep missing and schedules reviews for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Start your retake prep with a free trial"
      body="Short sets, reviews scheduled for you, and your weakest areas prioritized automatically."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      This guide is general information, not advice about your individual circumstances. Retake
      rules and licensing requirements are set by the USMLE program and individual state boards and
      can change, so confirm current details on{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>
      . MedPrep Institute is not affiliated with or endorsed by NBME, FSMB, USMLE or any other
      company named here. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'failed-usmle-step-retake-guide',
  title: 'Failed a USMLE Step? Retake Rules, a Recovery Plan and Residency Impact',
  seoTitle: 'Failed USMLE? Retake Rules & Recovery Plan',
  description:
    'What to do after failing a USMLE Step: how the retake rules work, how to diagnose what went wrong, a retake plan and how a fail affects residency.',
  publishedAt: '2026-10-13T10:10:00+02:00',
  updatedAt: '2026-10-13T10:10:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Scoring',
  keywords: [
    'failed USMLE Step 1',
    'failed Step 2 CK',
    'USMLE retake rules',
    'USMLE retake policy',
    'what to do after failing USMLE',
  ],
  readingMinutes: 5,
  sections: Object.values(S),
  faqs,
  Body,
};
