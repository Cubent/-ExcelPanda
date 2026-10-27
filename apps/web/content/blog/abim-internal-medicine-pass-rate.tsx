import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=abim-internal-medicine-pass-rate`;

const S = {
  rate: { id: 'rate', title: 'What is the ABIM first-time pass rate?' },
  format: { id: 'format', title: 'What is the exam like?' },
  results: { id: 'results', title: 'When are ABIM results released?' },
  prepare: { id: 'prepare', title: 'How to be in the passing group' },
  miss: { id: 'miss', title: 'If you did not pass' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What is the ABIM Internal Medicine pass rate?',
    answer:
      'Reports put the 2025 first-time pass rate at about 86%, with 87% reported by ABIM for 2024. Confirm current numbers on ABIM\'s site.',
  },
  {
    question: 'How many questions are on the ABIM exam?',
    answer:
      'Third-party guides describe up to 240 single-best-answer questions, with about 40 unscored pretest items. Confirm on ABIM\'s site.',
  },
  {
    question: 'When are ABIM exam results released?',
    answer:
      'ABIM\'s results page says late October. Check your exam administration\'s date on ABIM\'s site.',
  },
  {
    question: 'How hard is the ABIM exam?',
    answer:
      'Most first-time takers pass, but about one in seven did not in 2025. Early question practice and scheduled review of weak areas help.',
  },
  {
    question: 'Can I try ABIM practice questions for free?',
    answer:
      'Yes. MedPrep has [free ABIM sample questions](/abim/features/sample-questions) with explanations and no account required, and a 7-day free trial of the full bank.',
  },
  {
    question: 'What if I fail the ABIM exam?',
    answer:
      'Diagnose your weak areas first, then rebuild with timed practice and scheduled review. Check ABIM\'s retake policies.',
  },
];

const Body = () => (
  <>
    <p>
      Most internal medicine residents pass the ABIM certification exam on the first attempt, but a
      meaningful minority do not. Knowing the numbers and the format helps you plan the final year of
      residency without over- or under-preparing.
    </p>

    <H2 section={S.rate} />
    <p>
      Reports put the 2025 first-time pass rate for the Internal Medicine certification exam at 86%,
      from 10,743 first-time takers of whom 1,504 did not pass. ABIM's published pass-rate document
      we found covers results through 2024, when the first-time rate was 87%, so the 2025 figure
      comes from secondary reports. Check ABIM's site for the latest numbers.
    </p>
    <ComparisonTable
      caption="ABIM Internal Medicine first-time pass rate"
      columns={[
        { key: 'year', label: 'Year' },
        { key: 'rate', label: 'First-time pass rate' },
      ]}
      rows={[
        { id: '2025', cells: { year: '2025', rate: 'about 86% (secondary reports)' } },
        { id: '2024', cells: { year: '2024', rate: 'about 87% (ABIM)' } },
      ]}
      footnote="Roughly one in seven first-time examinees did not pass in 2025. Confirm current figures on ABIM's site."
    />

    <H2 section={S.format} />
    <p>
      Third-party guides describe the exam as up to 240 single-best-answer multiple-choice questions,
      with about 40 unscored pretest questions mixed in, taken over roughly ten hours including
      breaks. Confirm the current structure on ABIM's site. Our{' '}
      <Link href="/blog/abim-syllabus">ABIM syllabus guide</Link> covers content weighting, and the{' '}
      <Link href="/blog/abim-study-guide">ABIM study guide</Link> gives a final-year schedule.
    </p>

    <H2 section={S.results} />
    <p>
      ABIM's results page says exam results are released in late October. Check the ABIM site for the
      date that applies to your exam administration.
    </p>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.prepare} />
    <ul>
      <li><strong>Start question practice early,</strong> not in the last month. The exam tests broad clinical judgment.</li>
      <li><strong>Use your in-training exam as a diagnostic.</strong> See{' '}
        <Link href="/blog/im-in-training-exam-predicts-abim">what the research says about the IM-ITE</Link>.</li>
      <li><strong>Re-test weak areas on a schedule,</strong> not once. Spaced review beats a single pass.</li>
      <li><strong>Simulate the day,</strong> with long timed blocks for stamina.</li>
    </ul>
    <p>
      MedPrep's ABIM question bank pairs board-style vignettes with an adaptive engine and built-in
      spaced repetition. Try the free{' '}
      <Link href="/abim/features/sample-questions">ABIM sample questions</Link> (no account needed),
      see the <Link href="/abim-internal-medicine-question-bank">ABIM question bank</Link>, or compare
      options in our <Link href="/blog/top-abim-question-banks">ABIM question bank guide</Link>.
    </p>

    <H2 section={S.miss} />
    <p>
      A fail is a setback, not an end. Diagnose before you re-book: which content areas and error
      types cost you points, then rebuild with timed, mixed practice and scheduled review. The method
      in our{' '}
      <Link href="/blog/how-to-review-missed-usmle-questions">guide to reviewing missed questions</Link>{' '}
      applies equally to ABIM prep. Check ABIM's current policies on retakes and timelines.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Prepare for ABIM with adaptive practice"
      body="Board-style vignettes, spaced repetition and reviews planned for you. 7-day free trial."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Figures in this guide come from the USMLE program's published notices and from third-party summaries that we could not check against the primary source, and we say so where that applies. Standards, policies and score data change, so confirm current details on USMLE.org, ECFMG and NRMP before you plan around them. MedPrep Institute is our own product, and is not affiliated with or endorsed by NBME, FSMB, USMLE, ECFMG, NRMP, UWorld or any other company named here. All trademarks belong to their owners. ABIM figures are from ABIM's published pass-rate document and secondary reports.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'abim-internal-medicine-pass-rate',
  title: 'ABIM Internal Medicine Pass Rate: First-Time Results, Exam Format and When Results Come Out',
  seoTitle: 'ABIM Internal Medicine Pass Rate (2025) and Format',
  description:
    'ABIM Internal Medicine first-time pass rate (86% in 2025), exam format, when results are released, and how to prepare so you are in the passing group.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'ABIM',
  keywords: [
    'ABIM pass rate',
    'ABIM internal medicine pass rate 2025',
    'ABIM exam format',
    'ABIM exam results date',
    'how hard is the ABIM exam',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
