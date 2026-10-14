import { Callout } from '@/components/blog/callout';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=usmle-for-imgs`;

const S = {
  path: { id: 'the-img-pathway', title: 'What is the USMLE pathway for IMGs?' },
  exams: { id: 'which-exams', title: 'Which USMLE exams do IMGs need?' },
  eligible: { id: 'eligibility-and-registration', title: 'Eligibility and registration' },
  order: { id: 'what-order', title: 'In what order should IMGs take the exams?' },
  scores: { id: 'scores-for-imgs', title: 'Scores and competitiveness for IMGs' },
  prep: { id: 'preparing-from-abroad', title: 'Preparing from outside the US' },
  next: { id: 'after-the-exams', title: 'After the exams: ECFMG certification and the Match' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Which USMLE exams do IMGs need to take?',
    answer:
      'Step 1 and Step 2 CK for ECFMG certification, and Step 3 for licensure, usually during residency.',
  },
  {
    question: 'Is Step 1 pass/fail for IMGs?',
    answer:
      'Yes. Pass/fail applies to all examinees.',
  },
  {
    question: 'Where do IMGs register?',
    answer:
      'International applicants register through the FSMB.',
  },
  {
    question: 'Should IMGs take Step 2 CK before applying?',
    answer:
      'Generally yes, because programs rely on the score. Plan so your result is available in time.',
  },
  {
    question: 'Do IMGs need higher scores?',
    answer:
      'Often a higher score helps offset other factors, especially in competitive specialties.',
  },
  {
    question: 'Can I take the exams outside my home country?',
    answer:
      'Yes, at Prometric centers worldwide, subject to availability and regional fees.',
  },
];

const Body = () => (
  <>
    <p>
      International medical graduates (IMGs) make up a substantial share of US residents, and the
      USMLE is the common thread in every pathway. This guide explains which exams IMGs need, how
      eligibility and registration work, and how to think about scores and preparation when you are
      studying from abroad.
    </p>

    <H2 section={S.path} />
    <p>
      To train in the US, IMGs generally need ECFMG certification, which requires passing the
      USMLE exams, meeting medical education requirements and showing English proficiency.
      Certification makes you eligible to apply to US residency programs.
    </p>

    <H2 section={S.exams} />
    <ul>
      <li>
        <strong>Step 1:</strong> basic science and its clinical application. Pass/fail.
      </li>
      <li>
        <strong>Step 2 CK:</strong> clinical knowledge. Reports a three-digit score, which is now
        the main score programs see.
      </li>
      <li>
        <strong>Step 3:</strong> usually taken after the Match, during residency, though some IMGs
        take it earlier to strengthen an application or meet visa needs.
      </li>
    </ul>
    <p>
      The older clinical-skills exam is no longer part of the pathway. Check ECFMG for the
      current list of requirements.
    </p>

    <H2 section={S.eligible} />
    <p>
      IMGs must attend a medical school listed in the World Directory of Medical Schools and meet
      ECFMG eligibility requirements before sitting Step 1 or Step 2 CK. International applicants
      now register through the FSMB. Our{' '}
      <Link href="/blog/usmle-step-2-ck-exam-dates-2026">Step 2 CK exam dates guide</Link> and{' '}
      <Link href="/blog/usmle-step-1-exam-dates-2026">Step 1 exam dates guide</Link> cover
      registration, fees and scheduling.
    </p>
    <Callout title="Fees and test-center availability vary" tone="disclosure">
      <p>
        International test centers can have limited seats, and regional surcharges apply. Book
        early and confirm current costs with the registration service.
      </p>
    </Callout>

    <H2 section={S.order} />
    <p>
      Most IMGs take Step 1 first, then Step 2 CK. Because Step 2 CK now carries so much weight,
      many aim to take it with enough time before application season to receive a score. Plan
      backwards from the application timeline, and leave room for a possible retake.
    </p>

    <H2 section={S.scores} />
    <p>
      Match data shows IMGs entering most specialties with scores at or above the matched-applicant
      average, particularly in competitive fields. Strong Step 2 CK performance is one of the most
      direct ways to offset factors an IMG cannot change, such as school location. See our{' '}
      <Link href="/blog/step-2-ck-score-by-specialty">score by specialty guide</Link> and{' '}
      <Link href="/blog/usmle-step-2-ck-score-percentile">percentile guide</Link>.
    </p>

    <H2 section={S.prep} />
    <ul>
      <li>
        Start question practice early, since your curriculum may differ from US-style exam
        reasoning.
      </li>
      <li>
        Practice in the US exam's single-best-answer style, with timed, mixed blocks.
      </li>
      <li>
        Add US clinical experience (observerships or electives) if you can, since it helps both
        the exam and your application.
      </li>
      <li>Build in extra time for visa, travel and test-center logistics.</li>
    </ul>

    <H2 section={S.next} />
    <p>
      After the exams, you complete ECFMG certification and apply through ERAS and the NRMP Match.
      US clinical experience, strong letters and a well-chosen program list all matter, and each
      has its own deadlines.
    </p>
    <PostCta
      heading="Build US-style exam reasoning from wherever you study"
      body="Short daily sets, an adaptive engine that tracks what you keep missing, and reviews scheduled for you automatically."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try the adaptive Qbank free for 7 days"
      body="Short sets, reviews scheduled for you, and your weakest areas prioritized automatically."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      This guide is general information. ECFMG, USMLE and NRMP requirements, fees and deadlines
      change, so confirm current details directly with{' '}
      <a href="https://www.ecfmg.org/" target="_blank" rel="noopener noreferrer">
        ECFMG
      </a>{' '}
      and{' '}
      <a href="https://www.usmle.org/" target="_blank" rel="noopener noreferrer">
        USMLE.org
      </a>
      . MedPrep Institute is not affiliated with or endorsed by ECFMG, NBME, FSMB, USMLE, NRMP or
      any other company named here. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'usmle-for-imgs-step-1-step-2-ck',
  title: 'USMLE for IMGs: Step 1, Step 2 CK and the Path to a US Residency',
  seoTitle: 'USMLE for IMGs: Step 1, Step 2 CK & ECFMG Path',
  description:
    'Which USMLE exams international medical graduates need, how eligibility and registration work, what scores to aim for and how to prepare from abroad.',
  publishedAt: '2026-10-13T10:15:00+02:00',
  updatedAt: '2026-10-13T10:15:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'IMG guides',
  keywords: [
    'USMLE for IMGs',
    'IMG USMLE Step 1 Step 2 CK',
    'ECFMG certification USMLE',
    'international medical graduate USMLE',
    'IMG residency requirements',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
