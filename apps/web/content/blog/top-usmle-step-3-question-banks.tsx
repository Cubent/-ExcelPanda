import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=top-usmle-step-3-question-banks`;

const S = {
  compared: { id: 'step-3-question-banks-compared', title: 'Step 3 question banks compared' },
  medprep: { id: 'medprep', title: 'MedPrep Institute: adaptive practice (our product)' },
  uworld: { id: 'uworld', title: 'UWorld: the most established Step 3 bank' },
  amboss: { id: 'amboss', title: 'AMBOSS: Step 3 covered under the same USMLE plan' },
  boardvitals: { id: 'boardvitals', title: 'BoardVitals: budget multiple-choice practice' },
  kaplan: { id: 'kaplan', title: 'Kaplan Qbank' },
  noStep3: { id: 'banks-without-step-3', title: 'Banks without a Step 3 product' },
  choose: { id: 'how-to-choose', title: 'How to choose your Step 3 bank' },
  perDay: { id: 'questions-per-day', title: 'How many Step 3 questions should you do per day?' },
  start: { id: 'when-to-start', title: 'When should you start a Step 3 question bank?' },
  free: { id: 'free-step-3-practice', title: 'Free ways to practice Step 3 questions' },
  mostOut: { id: 'get-the-most-out-of-it', title: 'How to get the most out of your Step 3 bank' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const External = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

const Lines = ({ items }: { items: string[] }) => (
  <ul className="space-y-1">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

const AMBOSS_PRICES = ['6 months: $378', '12 months: $448', 'Student Life: $1,199 (through the end of PGY-1)'];
const BOARDVITALS_STEP3_PRICES = ['Cram, 1 month: $109', 'Prepare, 3 months: $169', 'Master, 6 months: $249'];
const MEDPREP_PRICES = [
  '$40 per month',
  '$110 per 3 months ($36.67 per month)',
  '$400 per year ($33.33 per month)',
];
const MEDPREP_STEP3_TOPICS = '10,400+';
const MEDPREP_TRIAL = '7-day free trial, cancel anytime';
const NOT_CONFIRMED = 'Not confirmed on the official page';
const NOT_LISTED = 'Not listed on the official page';

const faqs: BlogFaq[] = [
  {
    question: 'What is the single best question bank for USMLE Step 3?',
    answer:
      'UWorld, since it is the most established Step 3 bank in this comparison, with 2,100+ multiple-choice questions and official self-assessments included on every plan. If you already have AMBOSS from an earlier Step, it covers Step 3 multiple-choice practice at no extra cost.',
  },
  {
    question: 'Do TrueLearn, Lecturio or USMLE-Rx cover Step 3?',
    answer:
      'No. None of their official pages we checked list a Step 3 product. If you used one of them for Step 1 or Step 2 CK, plan on a different bank for Step 3.',
  },
  {
    question: 'When during residency should I take Step 3?',
    answer:
      'Most residents take it during PGY-1, often within a window set by their state medical board or residency program. Confirm your own program’s timeline and your state’s requirements early, since they vary.',
  },
  {
    question: 'How is this different from the general USMLE question bank comparison?',
    answer:
      'Our [general comparison](/blog/best-usmle-question-banks) covers Step 1, Step 2 CK and Step 3 side by side using the same verified pricing data. This guide is the Step 3-only version, with a full strengths, drawbacks and which-plan-to-buy breakdown for each bank that actually has Step 3 content, plus honest notes on which banks do not.',
  },
  {
    question: 'What about Step 1 or Step 2 CK question banks?',
    answer:
      'See our [Step 1 question bank comparison](/blog/top-usmle-step-1-question-banks) and [Step 2 CK question bank comparison](/blog/top-usmle-step-2-ck-question-banks) for the same depth of breakdown, applied to preclinical prep and clerkship year.',
  },
];

const Body = () => (
  <>
    <p>
      This guide is the Step 3-only, deep-dive version of our{' '}
      <Link href="/blog/best-usmle-question-banks">general USMLE question bank comparison</Link>.
      Same verified prices and question counts, but with a full breakdown of each bank
      specifically for Step 3: strengths, drawbacks, and exactly which plan to buy.
    </p>

    <Callout title="Step 3 has a much smaller bank market than Step 1 or Step 2 CK" tone="disclosure">
      <p>
        Three of the banks in our general comparison, TrueLearn, Lecturio and USMLE-Rx, do not
        list a Step 3 product at all. We are not guessing at coverage that is not there. This
        guide focuses on the banks that actually have confirmed Step 3 content.
      </p>
    </Callout>

    <H2 section={S.compared} />
    <p>
      Step 3 also returns a three-digit score, like Step 2 CK, and is given over two test days.
      MedPrep also offers a dedicated{' '}
      <Link href="/usmle-step-3-question-bank">Step 3 question bank</Link>.
    </p>
    <ComparisonTable
      caption="USMLE Step 3 question banks: questions, plans and prices"
      columns={[
        { key: 'bank', label: 'Question bank' },
        { key: 'questions', label: 'Step 3 content' },
        { key: 'plans', label: 'Plans and prices' },
        { key: 'trial', label: 'Trial or guarantee' },
        { key: 'best', label: 'Best for' },
      ]}
      rows={[
        {
          id: 'medprep',
          featured: true,
          cells: {
            bank: 'MedPrep Institute',
            questions: `${MEDPREP_STEP3_TOPICS} question topics`,
            plans: <Lines items={MEDPREP_PRICES} />,
            trial: MEDPREP_TRIAL,
            best: 'Extra multiple-choice practice with adaptive review, fitting into a resident schedule',
          },
        },
        {
          id: 'uworld',
          cells: {
            bank: 'UWorld',
            questions: '2,100+',
            plans: <Lines items={['90 days: $449', '180 days: $499', '360 days: $599']} />,
            trial: `2 self-assessments on every plan. Free trial: ${NOT_CONFIRMED.toLowerCase()}`,
            best: 'Exam-style volume with official self-assessments on every plan',
          },
        },
        {
          id: 'amboss',
          cells: {
            bank: 'AMBOSS',
            questions: 'Step 3 is covered by the USMLE plans (5,800+ Step questions across the Qbank)',
            plans: <Lines items={AMBOSS_PRICES} />,
            trial: '5-day free trial. 30-day money-back guarantee on direct purchases',
            best: 'Supplementary multiple-choice practice alongside a primary bank',
          },
        },
        {
          id: 'boardvitals',
          cells: {
            bank: 'BoardVitals',
            questions: '1,500+',
            plans: <Lines items={BOARDVITALS_STEP3_PRICES} />,
            trial: '100% pass guarantee on the Prepare and Master plans',
            best: 'Budget multiple-choice practice for Step 3',
          },
        },
        {
          id: 'kaplan',
          cells: {
            bank: 'Kaplan Qbank',
            questions: NOT_CONFIRMED,
            plans: NOT_CONFIRMED,
            trial: 'Free sample questions',
            best: 'Budget option per third-party reviews, not confirmed directly',
          },
        },
        {
          id: 'truelearn',
          cells: {
            bank: 'TrueLearn',
            questions: NOT_LISTED,
            plans: 'Not applicable',
            trial: 'Not applicable',
            best: 'No Step 3 product on the page we checked',
          },
        },
        {
          id: 'lecturio',
          cells: {
            bank: 'Lecturio',
            questions: NOT_LISTED,
            plans: 'Not applicable',
            trial: 'Not applicable',
            best: 'No Step 3 product on the page we checked',
          },
        },
        {
          id: 'usmlerx',
          cells: {
            bank: 'USMLE-Rx',
            questions: NOT_LISTED,
            plans: 'Not applicable',
            trial: 'Not applicable',
            best: 'No Step 3 product on the page we checked',
          },
        },
      ]}
      footnote={
        <>
          Each MedPrep topic produces a full clinical vignette when you reach it, so its figure is
          not directly comparable to a fixed, pre-written bank. UWorld Step 3 QBank Plus, which
          adds medical videos, costs $99 more on every plan.
        </>
      }
    />

    <H2 section={S.medprep} />
    <p>
      MedPrep Institute is the question bank we build. Instead of a static set of Step 3
      vignettes, an adaptive engine flags the concept behind every question you miss and brings
      you variations on it through spaced repetition. If you used MedPrep for Step 1 or Step 2 CK,
      your progress carries over automatically into Step 3.
    </p>
    <h3>What you get for Step 3</h3>
    <ul>
      <li>NBME-style patient management vignettes across every clinical discipline.</li>
      <li>An adaptive engine that targets your weak disciplines instead of moving on after one attempt.</li>
      <li>Built-in spaced repetition, so a missed concept comes back on a schedule.</li>
      <li>Physician-reviewed explanations.</li>
      <li>{MEDPREP_STEP3_TOPICS} Step 3 question topics, each producing a full clinical vignette when you reach it.</li>
      <li>Five-question sets built to fit into short gaps in a resident&rsquo;s day, between patients or after a shift.</li>
    </ul>
    <ComparisonTable
      caption="MedPrep Institute plans and pricing"
      columns={[
        { key: 'plan', label: 'Plan' },
        { key: 'price', label: 'Price' },
        { key: 'monthly', label: 'Effective monthly cost' },
        { key: 'note', label: 'Notes' },
      ]}
      rows={[
        {
          id: 'monthly',
          cells: { plan: 'Monthly', price: '$40 per month', monthly: '$40', note: '7-day free trial' },
        },
        {
          id: 'quarterly',
          cells: { plan: '3 months', price: '$110 every 3 months', monthly: '$36.67', note: 'Save 10%' },
        },
        {
          id: 'yearly',
          featured: true,
          cells: { plan: 'Yearly', price: '$400 per year', monthly: '$33.33', note: 'Save 20%, best value' },
        },
      ]}
      footnote="Every plan starts with a 7-day free trial. Cancel anytime before day 7 and pay nothing."
    />
    <h3>Who it suits for Step 3, and where to add something</h3>
    <p>
      MedPrep suits residents who need multiple-choice practice that fits around shift work and
      resurfaces weak concepts automatically. Pair it with the official NBME self-assessments to
      check readiness closer to your test date.
    </p>
    <PostCta
      heading="Try the adaptive Step 3 Qbank free for 7 days"
      body="Five-question sets that fit between patients, with reviews scheduled for whatever you miss."
      href={signup('medprep-section')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.uworld} />
    <p>
      UWorld is the most established Step 3 bank in this comparison, with 2,100+ multiple-choice
      questions and official self-assessments included on every plan regardless of length.
    </p>
    <h3>Strengths for Step 3</h3>
    <ul>
      <li>The largest confirmed multiple-choice bank in this comparison at 2,100+ questions.</li>
      <li>Two official self-assessments included on every plan, regardless of length.</li>
      <li>An optional QBank Plus tier that adds medical videos for $99 more.</li>
    </ul>
    <h3>Drawbacks for Step 3</h3>
    <ul>
      <li>The most expensive Step 3 bank with published pricing: $449 for 90 days, against $169 for BoardVitals&rsquo; 90-day Prepare plan.</li>
      <li>No confirmed free trial on the official page we checked.</li>
    </ul>
    <h3>Which plan to buy for Step 3</h3>
    <p>
      Since both self-assessments are included on every plan length, the deciding factor is
      runway, not features. A 90-day plan ($449) covers a typical residency study block; if your
      schedule means you will realistically need more than three months of access around shift
      work, the 180-day plan ($499) adds three more months for only $50 more.
    </p>

    <H2 section={S.amboss} />
    <p>
      AMBOSS does not sell a separate Step 3 product. Step 3 questions are covered under the same
      USMLE plan that includes Step 1 and Step 2 CK content, drawn from its 5,800+ Step question
      Qbank.
    </p>
    <h3>Strengths for Step 3</h3>
    <ul>
      <li>One subscription covers Step 1, Step 2 CK and Step 3 multiple-choice practice together.</li>
      <li>A library and score predictor included on every plan.</li>
      <li>A confirmed 5-day free trial and 30-day money-back guarantee on direct purchases.</li>
    </ul>
    <h3>Drawbacks for Step 3</h3>
    <ul>
      <li>No Step 3-specific question count published, since it is part of the combined Qbank figure.</li>
      <li>No official self-assessment forms confirmed for Step 3 on the page we checked.</li>
    </ul>
    <h3>Which plan to buy for Step 3</h3>
    <p>
      If you already have an active AMBOSS subscription from Step 1 or Step 2 CK, it already
      covers Step 3 multiple-choice practice at no extra cost. If you are starting fresh for Step
      3 only, the 6-month plan ($378) is a reasonable supplementary purchase alongside a primary
      bank.
    </p>

    <H2 section={S.boardvitals} />
    <p>
      BoardVitals sells the same three-tier structure for Step 3 that it uses for Step 1: Cram (1
      month), Prepare (3 months) and Master (6 months), with 1,500+ questions.
    </p>
    <h3>Strengths for Step 3</h3>
    <ul>
      <li>The lowest published prices in this comparison: $109 to $249 depending on tier.</li>
      <li>A 100% pass guarantee on the Prepare and Master tiers.</li>
      <li>A genuine 1-month option for residents very close to their test date.</li>
    </ul>
    <h3>Drawbacks for Step 3</h3>
    <ul>
      <li>The smallest confirmed multiple-choice bank in this comparison at 1,500+ questions.</li>
      <li>Less name recognition among residents and programs than UWorld or AMBOSS.</li>
    </ul>
    <h3>Which plan to buy for Step 3</h3>
    <p>
      The Prepare tier (3 months, $169) is the cheapest option that still carries the pass
      guarantee, and the natural default for a standard study block. Save the 1-month Cram tier
      ($109) for a genuinely compressed timeline.
    </p>

    <H2 section={S.kaplan} />
    <p>
      Kaplan sells a Step 3 Qbank with free sample questions, positioned in third-party reviews as
      a budget option, though we could not confirm pricing or question counts ourselves: its
      pricing pages returned an access error every time we tried to load them directly. Check{' '}
      <External href="https://www.kaptest.com/">kaptest.com</External> directly if you are
      considering it.
    </p>

    <H2 section={S.noStep3} />
    <p>
      TrueLearn, Lecturio and USMLE-Rx each sell question banks for Step 1 and, in TrueLearn&rsquo;s
      case, Step 2 CK and shelf exams, but none of their official pages we checked list a Step 3
      product. If you are using one of these for Step 1 or Step 2 CK, plan on a different bank for
      Step 3 rather than assuming the same subscription will carry over.
    </p>

    <H2 section={S.choose} />
    <ul>
      <li>
        <strong>You already have AMBOSS from Step 1 or Step 2 CK:</strong> your subscription
        already covers Step 3 multiple-choice questions at no extra cost.
      </li>
      <li>
        <strong>You want the most established, highest-volume bank:</strong> UWorld, especially if
        you want official self-assessments included.
      </li>
      <li>
        <strong>Your budget is tight:</strong> BoardVitals&rsquo; Prepare tier ($169 for 3 months).
      </li>
      <li>
        <strong>You want extra multiple-choice volume that fits around resident shifts:</strong>{' '}
        MedPrep, for five-question sets and adaptive review.
      </li>
      <li>
        <strong>You were using TrueLearn, Lecturio or USMLE-Rx for earlier Steps:</strong> plan on
        switching banks for Step 3, since none of them list a Step 3 product.
      </li>
    </ul>

    <H2 section={S.perDay} />
    <p>
      Step 3&rsquo;s two-day format changes how volume should work compared to Step 1 or Step 2
      CK. Spread your practice across both days&rsquo; worth of material instead of only drilling
      one, since each day draws from a broad range of disciplines and management scenarios.
    </p>
    <Callout title="A small daily habit beats an ambitious one you cannot sustain" tone="disclosure">
      <p>
        Residency schedules are far less predictable than a student&rsquo;s. Five real questions
        answered and reviewed properly beats forty skipped ones on a bad call day.
      </p>
    </Callout>

    <H2 section={S.start} />
    <p>
      Most residents take Step 3 during PGY-1, often within a window set by their state medical
      board or residency program, and a true dedicated study block is not guaranteed the way it
      was for Step 1 or Step 2 CK. Build a small daily habit early rather than waiting for a
      dedicated period that may not come, and treat any protected study time your program does
      give you as a bonus for final review, not your primary study window.
    </p>
    <p>
      If you have not built a full schedule yet, our{' '}
      <Link href="/blog/usmle-step-3-study-guide">Step 3 study guide</Link> includes a sample
      six-week plan built specifically around a resident&rsquo;s shift schedule.
    </p>

    <H2 section={S.free} />
    <ul>
      <li>AMBOSS: a 5-day free trial, which includes Step 3 multiple-choice questions.</li>
      <li>Kaplan: free sample questions on their site.</li>
      <li>
        MedPrep Institute: a 7-day free trial, cancel anytime. Try{' '}
        <Link href="/usmle/features/sample-questions/step-3">5 free Step 3 sample questions</Link>{' '}
        right now, no account needed.
      </li>
      <li>
        The official <External href="https://www.usmle.org/">USMLE website</External>: content
        outlines, format guidance and the interactive testing experience.
      </li>
      <li>Your program: ask your residency coordinator or medical library about institutional access before paying for anything.</li>
    </ul>

    <H2 section={S.mostOut} />
    <ol>
      <li>Protect a small daily habit over an ambitious plan you cannot sustain through a busy rotation.</li>
      <li>Read every explanation, including for questions you got right.</li>
      <li>Track misses by concept, not by question, so patterns stand out even with limited study time.</li>
      <li>Let missed concepts come back on a schedule instead of only once. Spaced repetition does this automatically.</li>
      <li>Use official self-assessments to check readiness in your final weeks, not as daily practice.</li>
      <li>Protect sleep before test day more than you protect any single extra study session, especially coming off clinical duties.</li>
    </ol>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Practice the concepts you actually miss"
      body="MedPrep Institute pairs NBME-style Step 3 vignettes with an adaptive engine and built-in spaced repetition."
      href={signup('article-footer')}
      label="Start your 7-day free trial"
      note="Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p>Prices, question counts and trial terms were checked on the official pages below on September 24, 2026.</p>
    <ul>
      <li>
        <External href="https://medical.uworld.com/usmle/usmle-step-3/">UWorld Step 3</External>
      </li>
      <li>
        <External href="https://www.amboss.com/us/usmle">AMBOSS USMLE preparation</External>
      </li>
      <li>
        <External href="https://www.boardvitals.com/USMLE-step3-questions">
          BoardVitals Step 3
        </External>
      </li>
      <li>
        <External href="https://www.kaptest.com/">Kaplan</External>
      </li>
      <li>
        <External href="https://www.usmle.org/">USMLE.org</External> for Step 3 scoring, format
        and official materials
      </li>
    </ul>
    <p className="text-sm text-gray-500">
      MedPrep Institute is not affiliated with or endorsed by NBME, FSMB, USMLE, UWorld, AMBOSS,
      TrueLearn, BoardVitals, Lecturio, USMLE-Rx, Kaplan or any other company named here. All
      trademarks belong to their owners and are used descriptively. This guide is for general
      information and is not a guarantee of any exam result.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'top-usmle-step-3-question-banks',
  title: 'Top USMLE Step 3 Question Banks: A Full Comparison',
  seoTitle: 'Top USMLE Step 3 Question Banks',
  description:
    'A deep-dive comparison of every major USMLE Step 3 question bank: verified prices, strengths, drawbacks and exactly which plan to buy.',
  publishedAt: '2026-10-01T14:00:00+02:00',
  updatedAt: '2026-10-01T16:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Hands typing with a stethoscope nearby, downloaded from Unsplash (free to use under the
  // Unsplash License): https://images.unsplash.com/photo-1758691462848-ba1e929da259
  heroImage: '/blog/top-usmle-step-3-question-banks-hero.jpg',
  category: 'Question banks',
  keywords: [
    'top USMLE Step 3 question banks',
    'best Step 3 question bank',
    'USMLE Step 3 Qbank comparison',
    'Step 3 question bank prices',
    'free Step 3 practice questions',
  ],
  readingMinutes: 11,
  sections: Object.values(S),
  faqs,
  Body,
};
