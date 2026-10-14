import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=best-usmle-question-banks`;

const S = {
  step1: { id: 'step-1-question-banks', title: 'Step 1 question banks compared' },
  step2: { id: 'step-2-ck-question-banks', title: 'Step 2 CK question banks compared' },
  step3: { id: 'step-3-question-banks', title: 'Step 3 question banks compared' },
  uworld: { id: 'uworld-review', title: 'UWorld: strengths, drawbacks and which plan to buy' },
  versus: { id: 'uworld-vs-amboss', title: 'UWorld vs AMBOSS' },
  others: { id: 'other-question-banks', title: 'TrueLearn, Kaplan, BoardVitals, Lecturio and USMLE-Rx' },
  medprep: { id: 'medprep-institute', title: 'MedPrep Institute: adaptive practice (our product)' },
  choose: { id: 'how-to-choose', title: 'How to choose the right question bank' },
  perDay: { id: 'questions-per-day', title: 'How many questions should you do per day?' },
  start: { id: 'when-to-start', title: 'When should you start a question bank?' },
  free: { id: 'free-question-banks', title: 'Free ways to practice' },
  mostOut: { id: 'get-the-most-out-of-a-qbank', title: 'How to get the most out of a question bank' },
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

const UWORLD_PRICES = [
  '30 days: $349',
  '90 days: $459',
  '180 days: $519',
  '360 days: $579',
  '730 days: $749',
];
const AMBOSS_PRICES = ['6 months: $378', '12 months: $448', 'Student Life: $1,199 (through the end of PGY-1)'];
const TRUELEARN_STEP1_PRICES = [
  '30 days: $149',
  '90 days: $199',
  '180 days: $299',
  '365 days: $399',
  '545 days: $419',
];
const BOARDVITALS_STEP1_PRICES = ['Cram, 1 month: $169', 'Prepare, 3 months: $259', 'Master, 6 months: $449'];
const BOARDVITALS_STEP3_PRICES = ['Cram, 1 month: $109', 'Prepare, 3 months: $169', 'Master, 6 months: $249'];
const MEDPREP_PRICES = [
  '$40 per month',
  '$110 per 3 months ($36.67 per month)',
  '$400 per year ($33.33 per month)',
];

// Counted from the hand-authored title lists in apps/web/scripts/seed-ai-titles-*.mjs
// (unique titles per exam, rounded down to the hundred). Re-run the check-*-totals
// scripts against the live database before changing these.
const MEDPREP_TOPICS = {
  step1: '7,500+',
  step2: '5,300+',
  step3: '10,400+',
  abim: '5,500+',
};
const MEDPREP_TOPICS_NOTE =
  'MedPrep counts question topics; each topic produces a full clinical vignette when you reach it, so its figure is not directly comparable to a fixed, pre-written bank.';

const MEDPREP_TRIAL = '7-day free trial, cancel anytime';
const NOT_CONFIRMED = 'Not confirmed on the official page';
const NOT_LISTED = 'Not listed on the official page';

const faqs: BlogFaq[] = [
  {
    question: 'What is the best question bank for USMLE Step 1?',
    answer:
      'UWorld is the most widely used Step 1 bank, with 3,600+ pre-written questions and up to three official self-assessments. AMBOSS is the main alternative if you want a library and score predictor in one plan, TrueLearn and BoardVitals have lower entry prices, and MedPrep Institute adds adaptive weak-area review.',
  },
  {
    question: 'Is UWorld worth it for Step 1?',
    answer:
      'For most students it works well as a primary bank during dedicated study, with the 90-day plan at $459 as the usual starting point. If money is tight, AMBOSS at $378 for six months or TrueLearn at $199 for 90 days covers similar ground with different tradeoffs.',
  },
  {
    question: 'Do I need a question bank now that Step 1 is pass/fail?',
    answer:
      'Step 1 has been pass/fail since 2022, but it is still an exam you must pass. Practice questions are the most direct way to rehearse the format and find gaps, so a question bank matters less for chasing a score and more for confidence that you will clear the standard.',
  },
  {
    question: 'What is the best question bank for Step 2 CK?',
    answer:
      'UWorld’s 4,250+ question bank is the default choice, and TrueLearn’s 4,100+ question Step 2 CK and shelf bank is the main alternative, especially if you want shelf practice in the same subscription. USMLE-Rx’s Qmax is worth a look if you also want your Step 1 review in the same plan. Step 2 CK is scored, so self-assessments matter more.',
  },
  {
    question: 'What is the best question bank for Step 3?',
    answer:
      'UWorld, because its Step 3 page lists 90+ CCS case simulations alongside 2,100+ questions, and none of the other banks we checked list CCS cases. BoardVitals is a budget multiple-choice option if you already have CCS practice elsewhere.',
  },
  {
    question: 'Are there free USMLE question banks?',
    answer:
      'Yes. TrueLearn and AMBOSS each offer a 5-day free trial, Lecturio and MedPrep Institute each offer a 7-day free trial, USMLE-Rx offers a 5-day free trial, and USMLE.org publishes official content outlines and an interactive testing experience. Also ask your school about institutional access before paying.',
  },
  {
    question: 'Can I use more than one question bank?',
    answer:
      'Yes, and many students do: a primary bank for volume, plus a second for different question styles or adaptive weak-area review. Use the second bank to find topics to revisit rather than only to raise your question count.',
  },
];

const Body = () => (
  <>
    <p>
      Choosing a question bank is one of the biggest study decisions you will make for the USMLE,
      and the prices vary a lot. This guide compares eight options for Step 1, Step 2 CK and Step 3
      using the prices and question counts published on each company&rsquo;s own site, then tells
      you which one to pick for your situation.
    </p>

    <H2 section={S.step1} />
    <p>
      Step 1 has been pass/fail since 2022, so there is no score to chase. You still have to pass,
      and a question bank is the most direct way to rehearse the exam&rsquo;s format and find gaps.
      If you want to see how our own Step 1 practice works, read about the{' '}
      <Link href="/usmle-step-1-question-bank">MedPrep Step 1 question bank</Link>. For a full
      strengths, drawbacks and which-plan-to-buy breakdown of every bank below, see our{' '}
      <Link href="/blog/top-usmle-step-1-question-banks">Step 1-only question bank guide</Link>.
    </p>
    <ComparisonTable
      caption="USMLE Step 1 question banks: questions, plans and prices"
      columns={[
        { key: 'bank', label: 'Question bank' },
        { key: 'questions', label: 'Step 1 questions' },
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
            questions: `${MEDPREP_TOPICS.step1} question topics`,
            plans: <Lines items={MEDPREP_PRICES} />,
            trial: MEDPREP_TRIAL,
            best: 'Students who keep missing the same concepts and want spaced repetition built in',
          },
        },
        {
          id: 'uworld',
          cells: {
            bank: 'UWorld',
            questions: '3,600+',
            plans: <Lines items={UWORLD_PRICES} />,
            trial: NOT_CONFIRMED,
            best: 'Exam-style volume and official self-assessments during dedicated study',
          },
        },
        {
          id: 'amboss',
          cells: {
            bank: 'AMBOSS',
            questions: '5,800+ Step questions across the Qbank',
            plans: <Lines items={AMBOSS_PRICES} />,
            trial: '5-day free trial. 30-day money-back guarantee on direct purchases',
            best: 'Question bank, library, study plans and score predictor in one plan',
          },
        },
        {
          id: 'truelearn',
          cells: {
            bank: 'TrueLearn',
            questions: '3,000+',
            plans: <Lines items={TRUELEARN_STEP1_PRICES} />,
            trial: '5-day trial with 120 questions. Pass guarantee on plans of 90 days or longer',
            best: 'Performance analytics with national benchmarking',
          },
        },
        {
          id: 'boardvitals',
          cells: {
            bank: 'BoardVitals',
            questions: '3,300+',
            plans: <Lines items={BOARDVITALS_STEP1_PRICES} />,
            trial: '100% pass guarantee on the Prepare and Master plans',
            best: 'A pass guarantee without committing to a full year',
          },
        },
        {
          id: 'lecturio',
          cells: {
            bank: 'Lecturio',
            questions: '2,200+',
            plans: (
              <Lines
                items={[
                  '3-month, 12-month and 24-month plans available',
                  'Prices not listed on the page we checked',
                ]}
              />
            ),
            trial: '7-day free trial. Free tier with 1,000+ questions',
            best: 'Students who want video lectures alongside questions',
          },
        },
        {
          id: 'usmlerx',
          cells: {
            bank: 'USMLE-Rx',
            questions: '5,000+ (Qmax, shared with Step 2 CK)',
            plans: <Lines items={['12 months: $299 (Qmax, covers Step 1 and Step 2 CK)']} />,
            trial: '5-day free trial, no card required',
            best: 'Students using First Aid as their primary review book',
          },
        },
        {
          id: 'kaplan',
          cells: {
            bank: 'Kaplan Qbank',
            questions: NOT_CONFIRMED,
            plans: NOT_CONFIRMED,
            trial: 'Free sample questions',
            best: 'Physiology and behavioral science content',
          },
        },
      ]}
      footnote={
        <>
          {MEDPREP_TOPICS_NOTE} UWorld self-assessments: none on the 30-day plan, 1 on 90 days, 2
          on 180 days and 3 on 360 and 730 days. UWorld QBank Plus, which adds medical videos, costs
          $99 more on every plan.
          Kaplan&rsquo;s pricing page returned an access error every time we checked it, so we are
          not repeating a number we could not verify directly. &ldquo;Not confirmed&rdquo; means we
          could not verify it on the official page.
        </>
      }
    />

    <H2 section={S.step2} />
    <p>
      Step 2 CK still returns a three-digit score, so self-assessments and score prediction matter
      more here than they do for Step 1. MedPrep also offers a dedicated{' '}
      <Link href="/usmle-step-2-question-bank">Step 2 CK question bank</Link>. For a full
      strengths, drawbacks and which-plan-to-buy breakdown of every bank below, see our{' '}
      <Link href="/blog/top-usmle-step-2-ck-question-banks">Step 2 CK-only question bank guide</Link>.
    </p>
    <ComparisonTable
      caption="USMLE Step 2 CK question banks: questions, plans and prices"
      columns={[
        { key: 'bank', label: 'Question bank' },
        { key: 'questions', label: 'Step 2 CK questions' },
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
            questions: `${MEDPREP_TOPICS.step2} question topics`,
            plans: <Lines items={MEDPREP_PRICES} />,
            trial: MEDPREP_TRIAL,
            best: 'Clinical vignette practice that resurfaces your weak areas on a schedule',
          },
        },
        {
          id: 'uworld',
          cells: {
            bank: 'UWorld',
            questions: '4,250+',
            plans: <Lines items={UWORLD_PRICES} />,
            trial: NOT_CONFIRMED,
            best: 'Exam-style questions with up to three official self-assessments',
          },
        },
        {
          id: 'amboss',
          cells: {
            bank: 'AMBOSS',
            questions: '5,800+ Step questions across the Qbank',
            plans: <Lines items={AMBOSS_PRICES} />,
            trial: '5-day free trial. 30-day money-back guarantee on direct purchases',
            best: 'Question bank, library and score predictor in one plan',
          },
        },
        {
          id: 'truelearn',
          cells: {
            bank: 'TrueLearn',
            questions: '4,100+ Step 2 CK and shelf questions',
            plans: (
              <Lines
                items={[
                  'Step 2 CK plan prices are not listed on the page we checked',
                  'Step 1 + Step 2 CK Mastery Bundle (365 days each): $999',
                ]}
              />
            ),
            trial: 'First-time pass guarantee listed. Trial not confirmed for Step 2 CK',
            best: 'Shelf exam practice in the same bank as Step 2 CK',
          },
        },
        {
          id: 'boardvitals',
          cells: {
            bank: 'BoardVitals',
            questions: NOT_CONFIRMED,
            plans: NOT_CONFIRMED,
            trial: NOT_CONFIRMED,
            best: 'We could not load a Step 2 CK page on BoardVitals&rsquo; site to confirm details',
          },
        },
        {
          id: 'lecturio',
          cells: {
            bank: 'Lecturio',
            questions: NOT_CONFIRMED,
            plans: NOT_LISTED,
            trial: '7-day free trial',
            best: 'Not confirmed as a dedicated Step 2 CK bank on the page we checked',
          },
        },
        {
          id: 'usmlerx',
          cells: {
            bank: 'USMLE-Rx',
            questions: '5,000+ (Qmax, shared with Step 1)',
            plans: <Lines items={['12 months: $299 (Qmax, covers Step 1 and Step 2 CK)']} />,
            trial: '5-day free trial, no card required',
            best: 'One subscription that covers Step 1 and Step 2 CK together',
          },
        },
        {
          id: 'kaplan',
          cells: {
            bank: 'Kaplan Qbank',
            questions: NOT_CONFIRMED,
            plans: NOT_CONFIRMED,
            trial: 'Free sample questions',
            best: 'UpToDate-style clinical content, per Kaplan&rsquo;s marketing',
          },
        },
      ]}
      footnote={
        <>
          {MEDPREP_TOPICS_NOTE} UWorld Step 2 CK plans and self-assessments match the Step 1 plans
          listed above.
        </>
      }
    />

    <H2 section={S.step3} />
    <p>
      Step 3 also returns a three-digit score, and it includes Computer-based Case Simulations
      (CCS), where you manage a virtual patient by ordering tests and treatments. Among the banks we
      checked, only UWorld lists CCS cases on its official page. For a full strengths, drawbacks
      and which-plan-to-buy breakdown of every bank below, see our{' '}
      <Link href="/blog/top-usmle-step-3-question-banks">Step 3-only question bank guide</Link>.
    </p>
    <ComparisonTable
      caption="USMLE Step 3 question banks: questions, CCS cases, plans and prices"
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
            questions: `${MEDPREP_TOPICS.step3} question topics`,
            plans: <Lines items={MEDPREP_PRICES} />,
            trial: MEDPREP_TRIAL,
            best: 'Extra multiple-choice practice with adaptive review',
          },
        },
        {
          id: 'uworld',
          cells: {
            bank: 'UWorld',
            questions: '2,100+ questions and 90+ CCS cases',
            plans: <Lines items={['90 days: $449', '180 days: $499', '360 days: $599']} />,
            trial: `2 self-assessments on every plan. Free trial: ${NOT_CONFIRMED.toLowerCase()}`,
            best: 'The only bank we checked that lists CCS cases',
          },
        },
        {
          id: 'amboss',
          cells: {
            bank: 'AMBOSS',
            questions: 'Step 3 is covered by the USMLE plans (5,800+ Step questions across the Qbank)',
            plans: <Lines items={AMBOSS_PRICES} />,
            trial: '5-day free trial. 30-day money-back guarantee on direct purchases',
            best: 'Supplementary practice alongside a primary bank',
          },
        },
        {
          id: 'boardvitals',
          cells: {
            bank: 'BoardVitals',
            questions: '1,500+',
            plans: <Lines items={BOARDVITALS_STEP3_PRICES} />,
            trial: 'No CCS practice; pass guarantee on the Prepare and Master plans',
            best: 'Budget multiple-choice practice for Step 3',
          },
        },
        {
          id: 'truelearn',
          cells: {
            bank: 'TrueLearn',
            questions: NOT_LISTED,
            plans: 'Not applicable',
            trial: 'Not applicable',
            best: 'Use another bank for Step 3',
          },
        },
        {
          id: 'lecturio',
          cells: {
            bank: 'Lecturio',
            questions: NOT_LISTED,
            plans: 'Not applicable',
            trial: 'Not applicable',
            best: 'Use another bank for Step 3',
          },
        },
        {
          id: 'usmlerx',
          cells: {
            bank: 'USMLE-Rx',
            questions: NOT_LISTED,
            plans: 'Not applicable',
            trial: 'Not applicable',
            best: 'Use another bank for Step 3',
          },
        },
        {
          id: 'kaplan',
          cells: {
            bank: 'Kaplan Qbank',
            questions: NOT_CONFIRMED,
            plans: NOT_CONFIRMED,
            trial: 'Free sample questions',
            best: 'Budget option, per third-party reviews. We could not confirm details directly',
          },
        },
      ]}
      footnote={
        <>
          {MEDPREP_TOPICS_NOTE} UWorld Step 3 QBank Plus, which adds medical videos, costs $99 more
          on every plan.
        </>
      }
    />

    <H2 section={S.uworld} />
    <p>
      UWorld is the question bank most students name first, and its official pages back up the
      scale: 3,600+ Step 1 questions, 4,250+ Step 2 CK questions, and for Step 3, 2,100+ questions
      plus 90+ CCS cases.
    </p>
    <h3>Strengths</h3>
    <ul>
      <li>Large pre-written banks: 3,600+ questions for Step 1 and 4,250+ for Step 2 CK.</li>
      <li>Official self-assessments on longer plans, up to three for Step 1 and Step 2 CK.</li>
      <li>CCS case simulations for Step 3, which no other bank in this guide lists.</li>
      <li>An optional QBank Plus tier that adds medical videos.</li>
    </ul>
    <h3>Drawbacks</h3>
    <ul>
      <li>
        The highest prices of the banks we compared with published pricing: the 90-day plan is
        $459, against $199 for TrueLearn&rsquo;s 90-day Step 1 plan and $378 for AMBOSS&rsquo;s
        six-month plan.
      </li>
      <li>The 30-day plan includes no self-assessments.</li>
      <li>Videos are not included unless you pay $99 more for QBank Plus.</li>
      <li>We could not confirm a free trial on the official pages we checked.</li>
    </ul>
    <h3>Which plan to buy</h3>
    <p>
      UWorld sells extra self-assessment forms for $50 each, with two weeks of access. If your
      dedicated period is short, a 30-day plan ($349) plus one form ($50) comes to $399. That is $60
      less than the 90-day plan ($459), but it gives you 60 fewer days of question access. If you
      need more than a month of practice, the 90-day plan is usually the better value.
    </p>

    <H2 section={S.versus} />
    <p>
      This is the comparison students ask about most. The short version: UWorld is the reference
      point for exam-style volume and official self-assessments, and AMBOSS bundles a library and
      score predictor at a lower price.
    </p>
    <ComparisonTable
      caption="UWorld vs AMBOSS for USMLE preparation"
      columns={[
        { key: 'feature', label: 'Feature' },
        { key: 'uworld', label: 'UWorld' },
        { key: 'amboss', label: 'AMBOSS' },
      ]}
      rows={[
        {
          id: 'questions',
          cells: {
            feature: 'Questions',
            uworld: '3,600+ (Step 1), 4,250+ (Step 2 CK), 2,100+ plus 90+ CCS cases (Step 3)',
            amboss: '5,800+ Step questions across the Qbank',
          },
        },
        {
          id: 'price',
          cells: {
            feature: 'Price range',
            uworld: '$349 (30 days) to $749 (730 days)',
            amboss: '$378 (6 months), $448 (12 months), $1,199 (Student Life)',
          },
        },
        {
          id: 'extras',
          cells: {
            feature: 'Extras',
            uworld: 'Medical videos with QBank Plus (+$99)',
            amboss: 'Library, study plans, Anki integration, score predictor and clinical tools on every plan',
          },
        },
        {
          id: 'assessments',
          cells: {
            feature: 'Self-assessments',
            uworld: 'Up to 3 for Step 1 and Step 2 CK, 2 for Step 3, depending on plan',
            amboss: 'Score predictor included. Self-assessment forms not confirmed on the page we checked',
          },
        },
        {
          id: 'trial',
          cells: {
            feature: 'Trial and refunds',
            uworld: NOT_CONFIRMED,
            amboss: '5-day free trial. 30-day money-back guarantee on direct purchases',
          },
        },
      ]}
    />
    <p>
      If you want to learn while you practice and your budget is limited, AMBOSS is the more
      natural fit. If you want a widely used standard for exam-style volume and official
      self-assessments, UWorld is the safer primary bank. Many students use one as their primary
      bank and the other to see different question styles, but you do not need both.
    </p>

    <H2 section={S.others} />
    <h3>TrueLearn</h3>
    <p>
      TrueLearn lists 3,000+ Step 1 questions and 4,100+ Step 2 CK and shelf questions. It has the
      lowest entry prices of the banks with published pricing ($149 for 30 days of Step 1, $199 for
      90 days), a first-time pass guarantee on plans of 90 days or longer, and performance analytics
      with national benchmarking. Its USMLE page does not list a Step 3 bank, and its Step 1 bank is
      smaller than UWorld&rsquo;s.
    </p>
    <h3>BoardVitals</h3>
    <p>
      BoardVitals sells three plan tiers for both Step 1 and Step 3: Cram (1 month), Prepare (3
      months) and Master (6 months). Step 1 runs from $169 to $449 with 3,300+ questions, and Step 3
      runs from $109 to $249 with 1,500+ questions. The Prepare and Master plans on both carry a
      100% pass guarantee. We could not load a Step 2 CK product page on their site to confirm
      whether the same structure applies there.
    </p>
    <h3>Lecturio</h3>
    <p>
      Lecturio pairs its Qbank with a full video library. The Step 1 Qbank page lists 2,200+
      questions and a 7-day free trial, plus a free tier of 1,000+ questions with no card required.
      Its pricing page lists 3-month, 12-month and 24-month billing options for the Qbank-inclusive
      &ldquo;Premium&rdquo; tier, but the dollar amounts did not load on the page we checked, so we
      are not listing a price.
    </p>
    <h3>USMLE-Rx</h3>
    <p>
      USMLE-Rx&rsquo;s main product, Qmax, is a single 12-month plan at $299 that covers both Step 1
      and Step 2 CK together, with 5,000+ questions and three self-assessments. It is built around
      First Aid, referencing specific page numbers in its explanations, and offers a 5-day free
      trial with no card required. Its official pages do not list a Step 3 product.
    </p>
    <h3>Kaplan Qbank</h3>
    <p>
      Kaplan sells a Qbank for Step 1, Step 2 CK and Step 3, with free sample questions available.
      Its pricing pages returned an access error every time we tried to load them directly, so
      rather than repeat a number from a source we could not verify ourselves, we are not listing
      a price or question count here. Check kaptest.com directly if you are considering it.
    </p>

    <H2 section={S.medprep} />
    <p>
      MedPrep Institute is the question bank we build. It works differently from a fixed-order bank:
      when you miss a question, the adaptive engine flags the underlying concept and brings you
      variations on it through spaced repetition over the following days, instead of just moving on.
    </p>
    <h3>What you get</h3>
    <ul>
      <li>NBME-style vignettes with clinical images, by topic or mixed across systems.</li>
      <li>An adaptive engine that targets your weak spots.</li>
      <li>Built-in spaced repetition, so missed concepts come back on a schedule.</li>
      <li>Physician-reviewed explanations.</li>
      <li>Practice for Step 1, Step 2 CK, Step 3 and the ABIM exam.</li>
      <li>
        A large bank of question topics: {MEDPREP_TOPICS.step1} for Step 1, {MEDPREP_TOPICS.step2}{' '}
        for Step 2 CK, {MEDPREP_TOPICS.step3} for Step 3 and {MEDPREP_TOPICS.abim} for the ABIM
        exam. Each topic produces a full clinical vignette when you reach it.
      </li>
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
          cells: {
            plan: '3 months',
            price: '$110 every 3 months',
            monthly: '$36.67',
            note: 'Save 10%',
          },
        },
        {
          id: 'yearly',
          featured: true,
          cells: { plan: 'Yearly', price: '$400 per year', monthly: '$33.33', note: 'Save 20%, best value' },
        },
      ]}
      footnote="Every plan starts with a 7-day free trial. Cancel anytime before day 7 and pay nothing."
    />
    <h3>Who it suits, and where to add something</h3>
    <p>
      MedPrep suits students who keep missing the same concepts and want reviews scheduled for them
      instead of planning them by hand. It does not include CCS case simulations, official-style
      self-assessment exams or a score predictor. For those, pair it with UWorld&rsquo;s
      self-assessments or the official NBME assessments.
    </p>
    <PostCta
      heading="Try the adaptive question bank free for 7 days"
      body="Practice with NBME-style vignettes, and let the adaptive engine bring back the concepts you miss."
      href={signup('medprep-section')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.choose} />
    <ul>
      <li>
        <strong>You are in coursework and want to learn as you practice:</strong> AMBOSS, for the
        library and study plans, or MedPrep for a light daily habit with spaced repetition.
      </li>
      <li>
        <strong>You are in dedicated study and want exam-style volume plus self-assessments:</strong>{' '}
        UWorld.
      </li>
      <li>
        <strong>Your budget or timeline is tight:</strong> TrueLearn ($149 for 30 days, $199 for 90
        days), or a UWorld 30-day plan plus one self-assessment form ($399).
      </li>
      <li>
        <strong>You want a pass guarantee without committing to a full year:</strong> BoardVitals&rsquo;
        Prepare or Master plan.
      </li>
      <li>
        <strong>You are studying Step 1 and Step 2 CK together off First Aid:</strong> USMLE-Rx&rsquo;s
        Qmax.
      </li>
      <li>
        <strong>You keep missing the same concepts:</strong> add MedPrep&rsquo;s adaptive review
        alongside your primary bank.
      </li>
      <li>
        <strong>You are preparing for Step 3:</strong> UWorld for the CCS cases, plus another bank
        for extra multiple-choice practice.
      </li>
    </ul>

    <H2 section={S.perDay} />
    <p>
      There is no single right number. During coursework, a small daily set tied to what you are
      studying works well. During dedicated study, many students move to two or three full
      40-question blocks a day, since Step 1 and Step 2 CK blocks hold up to 40 questions. Review
      time matters more than volume: reading every explanation, including for questions you got
      right, is where most of the learning happens.
    </p>

    <H2 section={S.start} />
    <p>
      Many students use a bank alongside coursework in untimed, topic-based mode to build the habit,
      then do a fresh, timed pass during dedicated study. If you plan to use self-assessments to
      judge readiness, save them for close to your exam date. Because plans are time-limited
      (UWorld sells 30 to 730 days), buy the plan length that matches when you will actually use it.
    </p>

    <H2 section={S.free} />
    <ul>
      <li>TrueLearn: a 5-day free trial with 120 Step 1 questions.</li>
      <li>AMBOSS: a 5-day free trial.</li>
      <li>Lecturio: a 7-day free trial, plus a free tier of 1,000+ questions.</li>
      <li>USMLE-Rx: a 5-day free trial, no card required.</li>
      <li>MedPrep Institute: a 7-day free trial, cancel anytime.</li>
      <li>
        The official <External href="https://www.usmle.org/">USMLE website</External>: content
        outlines, question format guidance and the interactive testing experience for each Step.
      </li>
      <li>Your school: ask the library or student affairs office about institutional access.</li>
    </ul>

    <H2 section={S.mostOut} />
    <ol>
      <li>Read every explanation, including for questions you answered correctly by guessing.</li>
      <li>Track misses by concept, not by question, so you can see patterns.</li>
      <li>Return to missed concepts on a schedule instead of once. Spaced repetition does this for you.</li>
      <li>Move to timed, mixed blocks as your exam gets closer.</li>
      <li>Use self-assessments to check readiness, not as daily practice.</li>
      <li>Do not chase raw question counts. Depth of review beats volume.</li>
    </ol>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Practice the concepts you actually miss"
      body="MedPrep Institute pairs NBME-style vignettes with an adaptive engine and built-in spaced repetition, for Step 1, Step 2 CK, Step 3 and the ABIM exam."
      href={signup('article-footer')}
      label="Start your 7-day free trial"
      note="Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p>Prices, question counts and trial terms were checked on the official pages below on September 24, 2026.</p>
    <ul>
      <li>
        <External href="https://medical.uworld.com/usmle/usmle-step-1/">UWorld Step 1</External>,{' '}
        <External href="https://medical.uworld.com/usmle/usmle-step-2-ck/">Step 2 CK</External> and{' '}
        <External href="https://medical.uworld.com/usmle/usmle-step-3/">Step 3</External>
      </li>
      <li>
        <External href="https://www.amboss.com/us/usmle">AMBOSS USMLE preparation</External>
      </li>
      <li>
        <External href="https://truelearn.com/usmle/">TrueLearn USMLE</External> and{' '}
        <External href="https://truelearn.com/usmle/step-1-prep-smartbank/">Step 1 SmartBank</External>
      </li>
      <li>
        <External href="https://www.boardvitals.com/USMLE-step1-questions">
          BoardVitals Step 1
        </External>{' '}
        and{' '}
        <External href="https://www.boardvitals.com/USMLE-step3-questions">Step 3</External>
      </li>
      <li>
        <External href="https://www.lecturio.com/medical/usmle-step-1/qbank/">
          Lecturio Step 1 Qbank
        </External>{' '}
        and <External href="https://www.lecturio.com/medical/pricing/">pricing</External>
      </li>
      <li>
        <External href="https://usmle-rx.com/pricing/">USMLE-Rx pricing</External>
      </li>
      <li>
        <External href="https://www.usmle.org/">USMLE.org</External> for Step scoring and official
        materials
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
  slug: 'best-usmle-question-banks',
  title: 'Best USMLE Question Banks in 2026: Step 1, Step 2 CK and Step 3 Compared',
  seoTitle: 'Best USMLE Question Banks (2026): Prices Compared by Step',
  description:
    'Compare UWorld, AMBOSS, TrueLearn, BoardVitals, Lecturio, USMLE-Rx, Kaplan and MedPrep for Step 1, Step 2 CK and Step 3 with verified 2026 prices and free trials.',
  publishedAt: '2026-09-24T12:00:00+02:00',
  updatedAt: '2026-09-24T12:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Question banks',
  keywords: [
    'best USMLE question banks',
    'USMLE question bank comparison',
    'question banks for USMLE',
    'USMLE Step 1 question bank',
    'USMLE Step 2 CK question bank',
    'USMLE Step 3 question bank',
    'UWorld vs AMBOSS',
    'USMLE Qbank prices 2026',
  ],
  readingMinutes: 14,
  sections: Object.values(S),
  faqs,
  Body,
};
