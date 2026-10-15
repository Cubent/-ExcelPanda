import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=img-step-2-ck-score-internal-medicine-family-medicine`;

const S = {
  short: { id: 'short', title: 'The short answer' },
  table: { id: 'table', title: 'Reported Step 2 CK scores for matched IMGs' },
  read: { id: 'read', title: 'How to read these numbers' },
  target: { id: 'target', title: 'How to set your target' },
  img: { id: 'img', title: 'Where MedPrep fits for IMGs' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What Step 2 CK score do IMGs need for internal medicine?',
    answer:
      'One analysis of 2026 NRMP data reports a matched non-US IMG median near 251 versus about 243 for unmatched applicants. Other sources report lower averages, so check the NRMP IMG report.',
  },
  {
    question: 'What Step 2 CK score do IMGs need for family medicine?',
    answer:
      'Reported matched and unmatched non-US IMG medians are both around 230, so the score separates applicants less in family medicine.',
  },
  {
    question: 'Is there a Step 2 CK cutoff for IMGs?',
    answer:
      'There is no official cutoff, though many programs screen by score.',
  },
  {
    question: 'Does the 218 passing score affect IMGs?',
    answer:
      'It affects borderline examinees most, including IMGs and retakers, because the standard applies to all examinees.',
  },
  {
    question: 'Where can I find exact IMG match data?',
    answer:
      'The NRMP publishes Charting Outcomes in the Match: International Medical Graduates.',
  },
  {
    question: 'How should IMGs practice?',
    answer:
      'Start questions early, practice US-style single-best-answer vignettes under timed conditions, and add US clinical experience if you can.',
  },
];

const Body = () => (
  <>
    <p>
      International graduates ask what Step 2 CK score they need in the two largest fields, internal
      medicine and family medicine. There is no official cutoff, and the figures that circulate
      differ by source. This guide shows what one analysis of the 2026 NRMP data reports, flags the
      conflicts, and shows how to turn it into a target.
    </p>

    <H2 section={S.short} />
    <p>
      For internal medicine, reported medians for matched non-US IMGs sit near 250, and the gap
      between matched and unmatched applicants is meaningful. For family medicine, matched and
      unmatched medians are close, around 230, so the score matters less. These are secondary
      figures, so confirm against the NRMP report.
    </p>

    <H2 section={S.table} />
    <ComparisonTable
      caption="Reported median Step 2 CK, non-US IMGs (secondary analysis of 2026 NRMP data)"
      columns={[
        { key: 'field', label: 'Specialty' },
        { key: 'matched', label: 'Matched median' },
        { key: 'unmatched', label: 'Unmatched median' },
      ]}
      rows={[
        { id: 'im', cells: { field: 'Internal medicine', matched: 'about 251', unmatched: 'about 243' } },
        { id: 'fm', cells: { field: 'Family medicine', matched: 'about 230', unmatched: 'about 231' } },
      ]}
      footnote="From a third-party analysis of NRMP data. Other sources report different figures, for example a matched IMG average near 242 for internal medicine. Use the NRMP Charting Outcomes: International Medical Graduates report for exact numbers."
    />

    <H2 section={S.read} />
    <ul>
      <li><strong>Medians, not cutoffs.</strong> Half of matched applicants score below the median.</li>
      <li><strong>Sources conflict.</strong> Always check which group and year a number describes.</li>
      <li><strong>Scores are one factor.</strong> Letters, US clinical experience, visa status and application timing all matter.</li>
      <li><strong>The passing standard rose.</strong> Step 2 CK is 218 for exams on or after July 1, 2025. See our{' '}
        <Link href="/blog/usmle-passing-scores-2026">passing scores guide</Link>.</li>
    </ul>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.target} />
    <ol>
      <li>Pull the latest NRMP figures for your specialty and applicant type.</li>
      <li>Set a target at or above the matched median if you can, with margin above the passing score.</li>
      <li>Take an early practice assessment to measure your gap.</li>
      <li>Plan backward from your application timeline, and leave room for a retake. See our{' '}
        <Link href="/blog/usmle-attempt-limits-retake-rules">attempt limits guide</Link>.</li>
    </ol>
    <p>
      Our{' '}
      <Link href="/blog/usmle-for-imgs-step-1-step-2-ck">USMLE for IMGs guide</Link> and{' '}
      <Link href="/blog/step-2-ck-score-by-specialty">score by specialty guide</Link> give wider
      context.
    </p>

    <H2 section={S.img} />
    <p>
      IMGs often need more US-style practice because their curricula differ. MedPrep is $40 per
      month or $400 per year, so you can practice for months without the cost of a premium bank,
      with adaptive review that brings back the concepts you miss. Start with the{' '}
      <Link href="/usmle/features/sample-questions/step-2">free Step 2 CK sample questions</Link>{' '}
      (no account needed), then the 7-day free trial. MedPrep does not include self-assessment
      exams, so add the official NBME assessments for scored checks.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Practice for a US residency, from anywhere"
      body="$40 per month, 7-day free trial, free Step 2 CK sample questions."
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
  slug: 'img-step-2-ck-score-internal-medicine-family-medicine',
  title: 'Step 2 CK Score for IMGs: What Internal Medicine and Family Medicine Matches Look Like',
  seoTitle: 'IMG Step 2 CK Score for Internal & Family Medicine',
  description:
    'Step 2 CK scores reported for matched IMGs in internal medicine and family medicine, how they compare with unmatched applicants, and how to set a target.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'IMG guides',
  keywords: [
    'Step 2 CK score for IMG internal medicine',
    'IMG Step 2 CK score family medicine',
    'what Step 2 CK score do IMGs need',
    'IMG match Step 2 CK 2026',
    'non-US IMG Step 2 CK median',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
