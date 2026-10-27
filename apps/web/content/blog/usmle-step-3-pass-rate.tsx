import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=usmle-step-3-pass-rate`;

const S = {
  rates: { id: 'rates', title: 'Step 3 first-time pass rates' },
  read: { id: 'read', title: 'How to read these numbers' },
  why: { id: 'why', title: 'Why some examinees do not pass' },
  beat: { id: 'beat', title: 'How to be in the passing group' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What is the USMLE Step 3 pass rate?',
    answer:
      'USMLE performance data shows first-time pass rates of about 96 to 97% for US graduates and 88 to 89% for non-US graduates in 2024 and 2025.',
  },
  {
    question: 'Is Step 3 harder for IMGs?',
    answer:
      'First-time pass rates are lower for non-US graduates in the published data, so IMGs benefit from earlier, more structured preparation.',
  },
  {
    question: 'What is the Step 3 passing score?',
    answer:
      '200, for exams taken on or after January 1, 2024.',
  },
  {
    question: 'Do repeat takers pass at lower rates?',
    answer:
      'Yes, generally, though we could not confirm exact repeat figures against the official table.',
  },
  {
    question: 'How long should I study for Step 3?',
    answer:
      'Most plans run two to eight weeks, with four common. See our [Step 3 plan](/blog/step-3-study-plan-intern-year).',
  },
];

const Body = () => (
  <>
    <p>
      Step 3 has high pass rates overall, but the gap between US and international graduates is
      real. Here are the first-time figures from USMLE's published performance data, with notes on
      where other sources disagree.
    </p>

    <H2 section={S.rates} />
    <ComparisonTable
      caption="USMLE Step 3 first-time pass rates (USMLE performance data)"
      columns={[
        { key: 'group', label: 'Examinee group' },
        { key: 'y24', label: '2024' },
        { key: 'y25', label: '2025' },
      ]}
      rows={[
        { id: 'us', cells: { group: 'US medical school graduates', y24: '97%', y25: '96%' } },
        { id: 'intl', cells: { group: 'Non-US medical school graduates', y24: '89%', y25: '88%' } },
      ]}
      footnote="From USMLE's Step 3 performance table as we found it. Other sites list different figures for non-US graduates (for example 85% for 2025), so check USMLE.org's performance data directly."
    />

    <H2 section={S.read} />
    <ul>
      <li><strong>First-time takers only.</strong> Repeat takers pass at lower rates, though we could not confirm exact figures.</li>
      <li><strong>US figures include MD and DO graduates</strong> in the table we found.</li>
      <li><strong>Passing standard:</strong> 200 for exams on or after January 1, 2024. See our <Link href="/blog/usmle-passing-scores-2026">passing scores guide</Link>.</li>
    </ul>

    <H2 section={S.why} />
    <p>
      Common reasons residents struggle include limited protected study time, unfamiliarity with the
      CCS case software, and rusty biostatistics, ethics and ambulatory care content. Step 3 also
      comes after Step 2 CK by a year or more, so knowledge fades without review.
    </p>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.beat} />
    <ul>
      <li>Plan two to eight weeks (four is common) and protect weekends. See our{' '}
        <Link href="/blog/step-3-study-plan-intern-year">Step 3 study plan for intern year</Link>.</li>
      <li>Learn the CCS software early; it is a separate scored part of the exam.</li>
      <li>Do timed multiple-choice blocks and review every miss.</li>
      <li>Use the <Link href="/blog/usmle-step-3-study-guide">Step 3 study guide</Link> for a full approach.</li>
    </ul>
    <p>
      MedPrep covers Step 3 with 10,400+ question topics and adaptive spaced repetition. Try the{' '}
      <Link href="/usmle/features/sample-questions/step-3">free Step 3 sample questions</Link> (no
      account needed), then the 7-day free trial. MedPrep does not include CCS cases, so pair it with
      UWorld's 90+ CCS simulations if you want them.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Prepare for Step 3 alongside your shifts"
      body="Short daily sets with reviews scheduled for you. 7-day free trial."
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
  slug: 'usmle-step-3-pass-rate',
  title: 'USMLE Step 3 Pass Rate: First-Time Results for US and International Graduates',
  seoTitle: 'USMLE Step 3 Pass Rate: US Grads vs IMGs',
  description:
    'USMLE Step 3 first-time pass rates for US and non-US graduates from USMLE performance data, the passing score, and what separates passers from non-passers.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Scoring',
  keywords: [
    'USMLE Step 3 pass rate',
    'Step 3 pass rate IMG',
    'Step 3 first-time pass rate',
    'how hard is Step 3',
    'Step 3 failure rate',
  ],
  readingMinutes: 5,
  sections: Object.values(S),
  faqs,
  Body,
};
