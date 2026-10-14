import { Callout } from '@/components/blog/callout';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=8-things-step-1`;

const S = {
  passFail: { id: 'pass-fail-since-2022', title: "1. It's been pass/fail since 2022, and that changes what you should optimize for" },
  anyOrder: { id: 'no-required-order-with-step-2-ck', title: "2. You don't have to pass it before Step 2 CK" },
  format: { id: 'the-block-format-changed-for-2026', title: '3. The block format changed for 2026 test takers' },
  attempts: { id: 'you-only-get-four-attempts', title: '4. You only get four attempts, and the timing rules are strict' },
  visible: { id: 'attempts-are-still-visible', title: "5. Pass/fail doesn't mean invisible: programs still see your attempt history" },
  step2Weight: { id: 'step-2-ck-carries-more-weight', title: '6. Step 2 CK carries more weight than it used to' },
  dedicated: { id: 'no-single-correct-dedicated-length', title: "7. There's no single correct dedicated period length" },
  eligibility: { id: 'eligibility-requirements', title: '8. You have to be enrolled in, or a graduate of, an eligible medical school' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Does Step 1 still matter if it\'s pass/fail?',
    answer:
      'Yes. You still have to pass it to progress, your attempt history is still visible to residency programs, and how comfortably you pass can still shape decisions like away rotations or specialty choice, even without a score attached.',
  },
  {
    question: 'Can I take Step 2 CK before Step 1?',
    answer:
      'There is no USMLE rule against it, though almost no one does, and your own medical school may have its own policy requiring a specific order. Confirm with your school before assuming you have flexibility here.',
  },
  {
    question: 'How many times can I take Step 1?',
    answer:
      'Four attempts total, with restrictions on timing between them: no more than three attempts in any 12-month period, and a fourth attempt only after at least 12 months from your first attempt and 6 months from your most recent one.',
  },
  {
    question: 'Do residency programs see how many times I took Step 1?',
    answer:
      'Yes. Your USMLE transcript reports every attempt, and this is visible to programs through ERAS, even though the pass itself does not come with a score.',
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
      Most Step 1 guides walk through content review and study schedules. This one doesn't. These
      are eight things about the exam itself, its rules, its history, and how it fits into the
      rest of your training, that are easy to miss or get slightly wrong, especially if you are
      relying on advice written before 2022.
    </p>

    <H2 section={S.passFail} />
    <p>
      Step 1 has reported pass/fail, with no three-digit score, since January 26, 2022. If you are
      early in medical school, this is probably the first thing anyone told you about the exam.
      What is easier to miss is what it actually changes: since there is no score to maximize past
      the passing standard, the marginal value of squeezing out extra points disappears once you
      are comfortably above it. Time spent chasing a higher score you will never see is time not
      spent building the foundation you will lean on for Step 2 CK, which is still scored.
    </p>

    <H2 section={S.anyOrder} />
    <p>
      There is no USMLE requirement that you pass Step 1 before attempting Step 2 CK. The two can
      be taken in either order. Almost everyone still takes Step 1 first, generally at the end of
      their second year, since it lines up with when foundational science coursework wraps up, but
      that is convention, not a rule. Step 3 is the one with an actual prerequisite: you must pass
      both Step 1 and Step 2 CK before you are eligible for it.
    </p>
    <p>
      Individual medical schools can still set their own internal policies about exam order and
      timing, so check your own school's requirements before assuming you have full flexibility.
    </p>

    <H2 section={S.format} />
    <p>
      As of May 14, 2026, Step 1 moved from seven 60-minute blocks to fourteen 30-minute blocks.
      The total question count (up to 280), the overall 8-hour testing day, and the scoring itself
      did not change, only the rhythm: more, shorter blocks, with slightly more total break time
      and a shorter optional tutorial. Our{' '}
      <Link href="/blog/usmle-step-1-exam-dates-2026">Step 1 exam dates guide</Link> covers the
      full before-and-after comparison along with registration and scheduling.
    </p>

    <H2 section={S.attempts} />
    <p>
      You get a maximum of four attempts at Step 1. If you have not passed after your fourth
      attempt, including any incomplete attempts, you become permanently ineligible to retake it.
      The timing between attempts is also restricted, not just the total count:
    </p>
    <ul>
      <li>You cannot take the same Step more than three times within any rolling 12-month window.</li>
      <li>
        A fourth attempt must come at least 12 months after your first attempt, and at least 6
        months after your most recent attempt.
      </li>
      <li>An incomplete attempt, one you start but do not finish, still counts as an attempt.</li>
    </ul>
    <Callout title="Confirm current policy before you plan around it" tone="disclosure">
      <p>
        Attempt limits and timing rules are set by the USMLE program and can change. Confirm the
        current policy on USMLE.org before making decisions based on these numbers.
      </p>
    </Callout>

    <H2 section={S.visible} />
    <p>
      Pass/fail removed the score, not the record. Your USMLE transcript still shows every
      attempt at every Step exam, including how many times you sat for Step 1 and whether any of
      those attempts were failures, and this transcript is part of what residency programs can see
      through ERAS. A single pass on the first attempt and a pass on a third attempt both show up
      as "pass," but the attempt history behind that pass is not hidden. This is one of the more
      common misunderstandings about what pass/fail actually protects you from: it removes score
      comparison between applicants, not visibility into your testing history.
    </p>

    <H2 section={S.step2Weight} />
    <p>
      With Step 1 no longer producing a comparable score, many residency programs have leaned more
      heavily on Step 2 CK as their main standardized, numeric data point for screening
      applicants, alongside clerkship grades, letters, and research. This shift has been widely
      reported across residency program director surveys since the 2022 change. The practical
      takeaway is not that Step 1 does not matter, passing it is still required and still shapes
      your timeline, but that Step 2 CK is now carrying more of the weight Step 1 used to carry on
      its own.
    </p>
    <p>
      If you have not started Step 2 CK prep yet, our{' '}
      <Link href="/blog/usmle-step-2-ck-study-guide">Step 2 CK study guide</Link> covers what
      changes once clerkships are the setting instead of preclinical coursework.
    </p>
    <PostCta
      heading="Build habits now that carry into Step 2 CK"
      body="Short daily sets, an adaptive engine that tracks what you keep missing, and reviews scheduled for you automatically."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.dedicated} />
    <p>
      Ask around and you will hear anywhere from 4 to 10 weeks described as the "right" dedicated
      period for Step 1. Both are right, for different people. The number that matters is not a
      universal week count, it is how much content review and how many timed practice questions
      you need to get through given your starting point, your baseline practice scores, and how
      much of the curriculum you covered well the first time. A shorter, focused period with
      strong daily consistency regularly outperforms a longer period spent unfocused. If you are
      building a plan, our{' '}
      <Link href="/blog/usmle-step-1-study-guide">Step 1 study guide</Link> includes a sample
      schedule you can compress or stretch to fit your own timeline.
    </p>

    <H2 section={S.eligibility} />
    <p>
      Step 1 is not open to the general public. To be eligible, you must be officially enrolled
      in, or a graduate of, an LCME-accredited MD program or a COCA-accredited DO program in the
      US or Canada, or, for international medical graduates, enrolled in or a graduate of a
      medical school listed in the World Directory of Medical Schools and meet ECFMG eligibility
      requirements. You cannot self-study and register independently of a medical school
      affiliation.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
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
      Eligibility, attempt limits, exam format and other policies are set by the NBME and FSMB and
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
  slug: '8-things-to-know-usmle-step-1',
  title: '8 Things You Should Know About USMLE Step 1',
  seoTitle: '8 Things to Know About USMLE Step 1',
  description:
    'Eight lesser-known facts about USMLE Step 1: pass/fail rules, retake limits, exam order, the 2026 format change and more.',
  publishedAt: '2026-09-29T19:00:00+02:00',
  updatedAt: '2026-09-29T19:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Hand checking off items on a digital checklist, downloaded from Unsplash (free to use under
  // the Unsplash License): https://images.unsplash.com/photo-1754548930574-6a995e5eb5a7
  heroImage: '/blog/usmle-step-1-8-things-hero.jpg',
  category: 'Exam logistics',
  keywords: [
    '8 things to know about USMLE Step 1',
    'USMLE Step 1 facts',
    'USMLE Step 1 pass fail',
    'USMLE Step 1 retake policy',
    'USMLE Step 1 attempts',
    'Step 1 vs Step 2 CK order',
  ],
  readingMinutes: 8,
  sections: Object.values(S),
  faqs,
  Body,
};
