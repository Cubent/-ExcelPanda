import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=usmle-question-bank-cost`;

const S = {
  prices: { id: 'prices', title: 'What each bank costs' },
  permonth: { id: 'permonth', title: 'Price per month of access' },
  cheapest: { id: 'cheapest', title: 'What is the cheapest option?' },
  hidden: { id: 'hidden', title: 'Costs that are easy to miss' },
  save: { id: 'save', title: 'How to spend less' },
  worth: { id: 'worth', title: 'Is the expensive option worth it?' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'How much does MedPrep cost?',
    answer:
      '$40 per month, $110 per three months or $400 per year, each with a 7-day free trial. Cancel before day 7 and you pay nothing.',
  },
  {
    question: 'How much does UWorld cost?',
    answer:
      'UWorld\'s published prices run from $349 for 30 days to $749 for 730 days, with the 90-day plan at $459. Extra self-assessment forms are $50 each and QBank Plus is $99 more.',
  },
  {
    question: 'What is the cheapest USMLE question bank?',
    answer:
      'MedPrep Institute, for any plan up to six months: $40 for one month, $110 for three, with a 7-day free trial. For a full year, USMLE-Rx\'s Qmax at $299 has the lowest monthly cost we found, ahead of MedPrep\'s $400 and TrueLearn\'s $399.',
  },
  {
    question: 'How much does AMBOSS cost?',
    answer:
      '$378 for six months and $448 for twelve, with a Student Life plan at $1,199 through the end of PGY-1.',
  },
  {
    question: 'Are question banks priced per exam?',
    answer:
      'Often yes. TrueLearn and BoardVitals price Steps separately, while USMLE-Rx\'s Qmax covers Step 1 and Step 2 CK together.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      'It varies. AMBOSS lists a 30-day money-back guarantee on direct purchases, and TrueLearn and BoardVitals list pass guarantees on longer plans. Read each policy before you buy.',
  },
];

const Body = () => (
  <>
    <p>
      MedPrep Institute is cheaper than UWorld, AMBOSS, TrueLearn and BoardVitals for any plan of
      up to six months, and it starts with a 7-day free trial. Question bank plans come in different lengths, so sticker prices are hard to compare. A
      $459 plan and a $378 plan are not obviously the same kind of deal. This guide lists the
      published prices and converts them to a monthly cost so you can compare like with like.
    </p>

    <H2 section={S.prices} />
    <ul>
      <li><strong>MedPrep Institute:</strong> $40 per month, $110 per 3 months, $400 per year, with a 7-day free trial on every plan.</li>
      <li><strong>UWorld:</strong> 30 days $349, 90 days $459, 180 days $519, 360 days $579, 730 days $749.</li>
      <li><strong>AMBOSS:</strong> 6 months $378, 12 months $448, Student Life $1,199 (through the end of PGY-1).</li>
      <li><strong>TrueLearn (Step 1):</strong> 30 days $149, 90 days $199, 180 days $299, 365 days $399, 545 days $419.</li>
      <li><strong>BoardVitals (Step 1):</strong> Cram (1 month) $169, Prepare (3 months) $259, Master (6 months) $449.</li>
      <li><strong>USMLE-Rx Qmax:</strong> 12 months $299, covering Step 1 and Step 2 CK.</li>
    </ul>

    <H2 section={S.permonth} />
    <ComparisonTable
      caption="Approximate cost per month of access (30 days = 1 month)"
      columns={[
        { key: 'plan', label: 'Plan' },
        { key: 'price', label: 'Price' },
        { key: 'month', label: 'About per month' },
      ]}
      rows={[
        { id: 'm1', featured: true, cells: { plan: 'MedPrep, monthly', price: '$40', month: '$40' } },
        { id: 'm12', featured: true, cells: { plan: 'MedPrep, yearly', price: '$400', month: '$33' } },
        { id: 'u90', cells: { plan: 'UWorld, 90 days', price: '$459', month: '$153' } },
        { id: 'u360', cells: { plan: 'UWorld, 360 days', price: '$579', month: '$48' } },
        { id: 'a6', cells: { plan: 'AMBOSS, 6 months', price: '$378', month: '$63' } },
        { id: 'a12', cells: { plan: 'AMBOSS, 12 months', price: '$448', month: '$37' } },
        { id: 't90', cells: { plan: 'TrueLearn, 90 days', price: '$199', month: '$66' } },
        { id: 't365', cells: { plan: 'TrueLearn, 365 days', price: '$399', month: '$33' } },
        { id: 'b3', cells: { plan: 'BoardVitals Prepare, 3 months', price: '$259', month: '$86' } },
        { id: 'r12', cells: { plan: 'USMLE-Rx Qmax, 12 months', price: '$299', month: '$25' } },
      ]}
      footnote="Rounded. Monthly cost is only meaningful if you will use the whole plan, so match the plan length to your study timeline."
    />

    <H2 section={S.cheapest} />
    <p>
      For one month, MedPrep's $40 monthly plan is the lowest we found, ahead of TrueLearn at $149
      and BoardVitals at $169. For three months, MedPrep's $110 beats TrueLearn's $199. For a
      year, USMLE-Rx's $299 is the lowest monthly cost, followed by MedPrep's yearly plan and
      TrueLearn's 365-day plan. UWorld is the highest at every length we compared.
    </p>

    <H2 section={S.hidden} />
    <ul>
      <li>UWorld's extra self-assessment forms are $50 each, and QBank Plus (videos) is $99 more on every plan.</li>
      <li>Banks differ by exam. TrueLearn and BoardVitals price Step 1, Step 2 CK and Step 3 separately, and USMLE-Rx's Qmax covers only Step 1 and Step 2 CK.</li>
      <li>Trial periods are short (five to seven days), so start them when you are ready to study.</li>
    </ul>
    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.save} />
    <ol>
      <li>Buy the plan length that matches your timeline, not the cheapest per month.</li>
      <li>Ask your school about institutional discounts or access before paying.</li>
      <li>Use free trials to confirm the explanations suit you.</li>
      <li>If you need Step 1 and Step 2 CK, check whether one plan covers both.</li>
    </ol>

    <H2 section={S.worth} />
    <p>
      Price does not predict how much you will learn. What matters is whether you complete the
      questions and review every explanation. A cheaper bank you finish beats an expensive one you
      abandon. Our{' '}
      <Link href="/blog/best-usmle-question-banks">full comparison</Link> and{' '}
      <Link href="/blog/uworld-alternatives">UWorld alternatives</Link> guides go deeper.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try MedPrep free for 7 days"
      body="Compare it on your own weakest topics before you spend anything."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Prices, question counts and plan details for other companies come from their official pages as we last checked them. They change often, so confirm current details on each company's site before you buy. MedPrep Institute is our own product. MedPrep Institute is not affiliated with or endorsed by UWorld, AMBOSS, TrueLearn, BoardVitals, Lecturio, USMLE-Rx, Kaplan, NBME, FSMB or USMLE. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'usmle-question-bank-cost',
  title: 'How Much Does a USMLE Question Bank Cost? Price Per Month Compared',
  seoTitle: 'USMLE Question Bank Cost: Price Per Month (2026)',
  description:
    'What UWorld, AMBOSS, TrueLearn, BoardVitals, USMLE-Rx and MedPrep cost, converted to price per month so you can compare plans of different lengths.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Question banks',
  keywords: [
    'USMLE question bank cost',
    'how much is UWorld',
    'UWorld price',
    'cheapest USMLE question bank',
    'USMLE qbank price comparison',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
