import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=do-students-usmle-or-comlex`;

const S = {
  short: { id: 'short', title: 'The short answer' },
  eligible: { id: 'eligible', title: 'Are DO students eligible for the USMLE?' },
  why: { id: 'why', title: 'Why many DO students take Step 2 CK anyway' },
  decide: { id: 'decide', title: 'How to decide' },
  prep: { id: 'prep', title: 'Preparing for Step 2 CK as a DO student' },
  check: { id: 'check', title: 'What to confirm before you register' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Do DO students have to take the USMLE?',
    answer:
      'No. DO students can rely on COMLEX for ACGME-accredited residency programs, though many also take Step 2 CK.',
  },
  {
    question: 'Can DO students take the USMLE?',
    answer:
      'Yes. US DO students and graduates from COCA-accredited schools are eligible and register through the NBME.',
  },
  {
    question: 'Should I take USMLE Step 2 CK as a DO student?',
    answer:
      'It often helps if you are targeting competitive specialties or programs that review USMLE scores for comparison. Ask your advisor and check each program\'s requirements.',
  },
  {
    question: 'Do DO students need ECFMG certification?',
    answer:
      'No. ECFMG certification applies to international medical graduates, not US DO graduates.',
  },
  {
    question: 'Where can I practice for Step 2 CK as a DO student?',
    answer:
      'MedPrep offers [free Step 2 CK sample questions](/usmle/features/sample-questions/step-2) with no account required, plus a 7-day free trial of the full adaptive bank.',
  },
  {
    question: 'Does MedPrep cover COMLEX?',
    answer:
      'MedPrep is built for USMLE preparation. Check COMLEX-specific resources for Level exams.',
  },
];

const Body = () => (
  <>
    <p>
      DO students can match through COMLEX alone, but a growing number also take the USMLE. Whether
      you should depends on your specialty, your target programs and how you want to be compared
      with MD applicants. This guide sets out the facts we could confirm and what to check yourself.
    </p>

    <H2 section={S.short} />
    <p>
      No, DO students are not required to take the USMLE. Most can rely on COMLEX for ACGME-accredited
      residency programs. Many take USMLE Step 2 CK as well, because it gives programs a score on the
      same scale they use for MD applicants.
    </p>

    <H2 section={S.eligible} />
    <p>
      Yes. US DO students and graduates are eligible for the USMLE if they are enrolled in, or have
      graduated from, a COCA-accredited medical school that awards the DO degree. Unlike international
      graduates, DOs do not need ECFMG certification. You register for the USMLE through the NBME.
      See our <Link href="/blog/usmle-step-2-ck-exam-dates-2026">Step 2 CK exam dates guide</Link>
      for registration, scheduling and the 2026 format.
    </p>

    <H2 section={S.why} />
    <ul>
      <li><strong>A common yardstick.</strong> Programs that review hundreds of applicants find a single USMLE score easier to compare across schools.</li>
      <li><strong>Competitive specialties.</strong> One third-party analysis reports higher match rates for DOs who took Step 2 CK than for those relying on COMLEX alone. That source is a blog with limited data, so treat it as directional, not proven.</li>
      <li><strong>Program preferences.</strong> Some programs state a preference for USMLE scores. Check each program's requirements.</li>
    </ul>
    <p>
      The same analysis reports average Step 2 CK scores for matched DO students around 243. We could
      not confirm that figure against the NRMP report, so check the latest Charting Outcomes for your
      specialty. For where scores sit overall, see our{' '}
      <Link href="/blog/usmle-step-2-ck-score-percentile">score and percentile guide</Link>.
    </p>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.decide} />
    <ComparisonTable
      caption="COMLEX only or COMLEX plus USMLE Step 2 CK?"
      columns={[
        { key: 'case', label: 'Your situation' },
        { key: 'lean', label: 'Usually leans toward' },
      ]}
      rows={[
        { id: 'comp', cells: { case: 'Targeting a competitive specialty or highly ranked programs', lean: 'Taking Step 2 CK' } },
        { id: 'strong', cells: { case: 'Strong practice scores and a few months to prepare', lean: 'Taking Step 2 CK' } },
        { id: 'osteo', cells: { case: 'Targeting DO-friendly programs that accept COMLEX scores', lean: 'COMLEX may be enough' } },
        { id: 'weak', cells: { case: 'Borderline practice scores and limited time', lean: 'Discuss with your dean; the risk of a weak score matters' } },
      ]}
      footnote="General guidance, not advice for your circumstances. Ask your advisor and check each program's stated requirements."
    />

    <H2 section={S.prep} />
    <p>
      Step 2 CK rewards the same clinical reasoning you are building in clerkships, so questions
      during rotations help. If you are adding it to a COMLEX schedule, plan the order carefully and
      leave time for both. MedPrep is built for USMLE preparation, with adaptive practice and
      spaced repetition for Step 2 CK. Try the{' '}
      <Link href="/usmle/features/sample-questions/step-2">free Step 2 CK sample questions</Link>{' '}
      (no account needed) or see the{' '}
      <Link href="/usmle-step-2-question-bank">Step 2 CK question bank</Link>, then start the 7-day
      free trial. Our{' '}
      <Link href="/blog/step-2-ck-study-schedule">4, 8 and 12-week schedules</Link> show how to
      structure the weeks.
    </p>

    <H2 section={S.check} />
    <ul>
      <li>Each target program's stated exam requirements and preferences.</li>
      <li>Your school's guidance and recent match results for your specialty.</li>
      <li>NBOME's current COMLEX policies, which we have not covered here.</li>
      <li>Current USMLE eligibility and scheduling rules on USMLE.org.</li>
    </ul>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Add Step 2 CK to your plan"
      body="Adaptive Step 2 CK practice with reviews scheduled for you. 7-day free trial."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Figures in this guide come from the USMLE program's published notices and from third-party summaries that we could not check against the primary source, and we say so where that applies. Standards, policies and score data change, so confirm current details on USMLE.org, ECFMG and NRMP before you plan around them. MedPrep Institute is our own product, and is not affiliated with or endorsed by NBME, FSMB, USMLE, ECFMG, NRMP, UWorld or any other company named here. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'do-students-usmle-or-comlex',
  title: 'Do DO Students Need the USMLE? COMLEX vs USMLE for Residency',
  seoTitle: 'Do DO Students Need the USMLE? COMLEX vs USMLE',
  description:
    'Do DO students have to take the USMLE? Eligibility, when COMLEX is enough, why many DOs take Step 2 CK anyway, and how to decide for your target specialty.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Exam logistics',
  keywords: [
    'do DO students need USMLE',
    'COMLEX vs USMLE',
    'DO students Step 2 CK',
    'should DOs take USMLE',
    'DO residency USMLE or COMLEX',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
