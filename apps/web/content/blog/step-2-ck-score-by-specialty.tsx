import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-2-ck-score-by-specialty`;

const S = {
  short: { id: 'short-answer', title: 'What Step 2 CK score do you need for your specialty?' },
  table: { id: 'scores-by-specialty', title: 'Approximate Step 2 CK scores by specialty' },
  read: { id: 'how-to-read-these-numbers', title: 'How to read these numbers' },
  tiers: { id: 'tiers', title: 'A practical way to think about tiers' },
  below: { id: 'if-your-score-is-below-target', title: 'What if your score is below the typical range?' },
  plan: { id: 'setting-a-target', title: 'How to set your own target' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'What Step 2 CK score do I need for dermatology?',
    answer:
      'Dermatology is among the most competitive fields, and matched applicants average in the mid to high 250s or above. Check the latest NRMP Charting Outcomes for the exact figure.',
  },
  {
    question: 'What Step 2 CK score do I need for internal medicine?',
    answer:
      'Matched applicants cluster around the national average, with a wide range across programs.',
  },
  {
    question: 'What Step 2 CK score do I need for family medicine?',
    answer:
      'Family medicine is generally less score-driven, and matched applicants average a few points below the national mean.',
  },
  {
    question: 'Is there a Step 2 CK cutoff for residency?',
    answer:
      'Most programs do not publish one, though some screen on a minimum. A few points usually matter less than the rest of your application.',
  },
  {
    question: 'Do DO students and IMGs need higher scores?',
    answer:
      'In competitive specialties, often yes. Their matched-applicant distributions differ, so use the figures for your group.',
  },
  {
    question: 'Where can I find exact numbers?',
    answer:
      'The NRMP Charting Outcomes in the Match report, published for each specialty and applicant type.',
  },
];

const Body = () => (
  <>
    <p>
      "What Step 2 CK score do I need?" has no single answer, because the answer depends on the
      specialty. Programs in different fields weigh scores differently and the applicants who match
      into them differ widely. This guide gives approximate ranges by specialty, explains why they
      should be read carefully, and shows how to turn them into a target for your own preparation.
    </p>

    <H2 section={S.short} />
    <p>
      For most specialties, matched US MD applicants average somewhere between the low 240s and the
      high 250s. Primary-care fields sit toward the lower end, and the most competitive procedural
      and surgical fields sit toward the upper end. A score above the typical range helps, and a
      score below it can often be offset by other parts of your application.
    </p>

    <H2 section={S.table} />
    <ComparisonTable
      caption="Approximate mean Step 2 CK score of matched US MD seniors (rough ranges)"
      columns={[
        { key: 'tier', label: 'Group' },
        { key: 'fields', label: 'Example specialties' },
        { key: 'range', label: 'Approximate range' },
      ]}
      rows={[
        { id: 'high', cells: { tier: 'Most competitive', fields: 'Dermatology, plastic surgery, neurosurgery, orthopedic surgery, otolaryngology', range: 'about 255 to 265' } },
        { id: 'upper', cells: { tier: 'Competitive', fields: 'Radiology, anesthesiology, ophthalmology, urology, general surgery', range: 'low to mid 250s' } },
        { id: 'mid', cells: { tier: 'Moderate', fields: 'Internal medicine, pediatrics, emergency medicine, neurology, OB/GYN', range: 'about 245 to 252' } },
        { id: 'broad', cells: { tier: 'Less score-driven', fields: 'Family medicine, psychiatry, pathology, PM&R', range: 'about 240 to 248' } },
      ]}
      footnote="Rounded, approximate and grouped for readability from secondary summaries of NRMP data. Across all specialties, US MD seniors who matched to their preferred specialty averaged 250.4 (SD 13.2) in the 2024 Charting Outcomes. Use the NRMP report itself for exact figures by specialty and year."
    />

    <H2 section={S.read} />
    <ul>
      <li>
        <strong>These are means, not cutoffs.</strong> Half of matched applicants score below the
        mean. Programs rarely use a hard cutoff, though some screen on a minimum.
      </li>
      <li>
        <strong>They describe US MD seniors who matched.</strong> DO students and international
        graduates face different distributions, and often need to be higher in competitive fields.
      </li>
      <li>
        <strong>Applicants who did not match are not in the average.</strong> The score that
        guarantees an interview is higher than the score that sits at the mean.
      </li>
      <li>
        <strong>The numbers move.</strong> Since Step 1 became pass/fail, Step 2 CK has carried
        more weight, and the competitive-field averages have trended upward.
      </li>
    </ul>
    <Callout title="Check the source before you plan around a number" tone="disclosure">
      <p>
        The NRMP publishes Charting Outcomes in the Match for each specialty and applicant group.
        That report is the authoritative source. The ranges above are simplified and may be out of
        date.
      </p>
    </Callout>

    <H2 section={S.tiers} />
    <p>
      Rather than memorizing a number per specialty, work in three bands:
    </p>
    <ul>
      <li>
        <strong>Safe for most fields:</strong> comfortably above the national average.
      </li>
      <li>
        <strong>Competitive for demanding fields:</strong> roughly the high 250s and above.
      </li>
      <li>
        <strong>Below average:</strong> still a pass, and workable in many specialties when the
        rest of the application is strong, but plan for a wider application list.
      </li>
    </ul>
    <p>
      For where specific scores sit in the national distribution, see our{' '}
      <Link href="/blog/usmle-step-2-ck-score-percentile">Step 2 CK score and percentile guide</Link>.
    </p>

    <H2 section={S.below} />
    <p>
      A score below your target is not the end of the road. The levers that remain are strong
      clerkship grades, a letter from someone who knows you, away rotations in your field,
      research, and applying broadly, including to programs that weigh scores less. Advisors at
      your school will know how your specific field is currently trending.
    </p>

    <H2 section={S.plan} />
    <ol>
      <li>Look up your specialty in the latest NRMP Charting Outcomes.</li>
      <li>Set a target at or just above the mean for matched applicants of your type (MD, DO or IMG).</li>
      <li>Take a practice assessment early to measure the gap.</li>
      <li>Work backwards from your exam date and plan question practice around the gap.</li>
    </ol>
    <PostCta
      heading="Turn a target score into a daily plan"
      body="An adaptive engine that tracks what you keep missing and schedules reviews for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try the adaptive Step 2 CK Qbank free for 7 days"
      body="Short sets, reviews scheduled for you, and your weakest specialties prioritized automatically."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      The ranges in this guide are rounded, approximate groupings based on publicly reported
      NRMP match data and are not official figures. They change from year to year, so confirm
      current data in the NRMP Charting Outcomes in the Match report and with your school's
      advisors. MedPrep Institute is not affiliated with or endorsed by NRMP, NBME, FSMB, USMLE,
      ECFMG or any other company named here. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'step-2-ck-score-by-specialty',
  title: 'What Step 2 CK Score Do You Need? Scores by Specialty',
  seoTitle: 'Step 2 CK Score by Specialty: What You Need',
  description:
    'Approximate Step 2 CK scores of matched applicants by specialty, how to read them, and how to set a realistic target for your own preparation.',
  publishedAt: '2026-10-12T10:10:00+02:00',
  updatedAt: '2026-10-12T10:10:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Scoring',
  keywords: [
    'Step 2 CK score by specialty',
    'what Step 2 CK score do I need',
    'Step 2 CK score for dermatology',
    'Step 2 CK score for internal medicine',
    'good Step 2 CK score for residency',
  ],
  readingMinutes: 5,
  sections: Object.values(S),
  faqs,
  Body,
};
