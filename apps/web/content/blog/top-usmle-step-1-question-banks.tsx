import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=top-usmle-step-1-question-banks`;

const S = {
  compared: { id: 'step-1-question-banks-compared', title: 'Step 1 question banks compared' },
  medprep: { id: 'medprep', title: 'MedPrep Institute: adaptive practice (our product)' },
  uworld: { id: 'uworld', title: 'UWorld: the default choice for a reason' },
  amboss: { id: 'amboss', title: 'AMBOSS: a library and score predictor built in' },
  truelearn: { id: 'truelearn', title: 'TrueLearn: the budget-friendly entry point' },
  boardvitals: { id: 'boardvitals', title: 'BoardVitals: a pass guarantee without a year-long commitment' },
  lecturio: { id: 'lecturio', title: 'Lecturio: questions bundled with a full video library' },
  usmlerx: { id: 'usmlerx', title: 'USMLE-Rx: built around First Aid' },
  kaplan: { id: 'kaplan', title: 'Kaplan Qbank' },
  choose: { id: 'how-to-choose', title: 'How to choose your Step 1 bank' },
  perDay: { id: 'questions-per-day', title: 'How many Step 1 questions should you do per day?' },
  start: { id: 'when-to-start', title: 'When should you start a Step 1 question bank?' },
  free: { id: 'free-step-1-practice', title: 'Free ways to practice Step 1 questions' },
  mostOut: { id: 'get-the-most-out-of-it', title: 'How to get the most out of your Step 1 bank' },
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
const MEDPREP_PRICES = [
  '$40 per month',
  '$110 per 3 months ($36.67 per month)',
  '$400 per year ($33.33 per month)',
];
const MEDPREP_STEP1_TOPICS = '7,500+';
const MEDPREP_TRIAL = '7-day free trial, cancel anytime';
const NOT_CONFIRMED = 'Not confirmed on the official page';

const faqs: BlogFaq[] = [
  {
    question: 'What is the single best question bank for USMLE Step 1?',
    answer:
      'UWorld is the most widely used Step 1 bank, with 3,600+ pre-written questions and up to three official self-assessments on longer plans. AMBOSS is the main alternative if you want a library and score predictor in the same subscription, TrueLearn and BoardVitals have lower entry prices, and MedPrep Institute adds adaptive weak-area review on top of any primary bank.',
  },
  {
    question: 'Is UWorld worth the price for Step 1?',
    answer:
      'For most students in dedicated study, yes. The 90-day plan at $459 is the usual starting point. If your budget is tighter, AMBOSS at $378 for six months or TrueLearn at $199 for 90 days covers similar ground with different tradeoffs, mainly around self-assessments and bundled extras.',
  },
  {
    question: 'Do I still need a question bank now that Step 1 is pass/fail?',
    answer:
      'Yes. Step 1 has been pass/fail since January 2022, but it is still an exam you must pass. Practice questions remain the most direct way to rehearse the exam’s format and find gaps, so a question bank matters less for chasing a specific score and more for building confidence that you will clear the passing standard.',
  },
  {
    question: 'Can I use more than one Step 1 question bank?',
    answer:
      'Yes, and many students do: a primary bank for volume and self-assessments, plus a second for different question styles or adaptive weak-area review. Use the second bank to find topics to revisit rather than purely to raise your total question count.',
  },
  {
    question: 'How is this different from the general USMLE question bank comparison?',
    answer:
      'Our [general comparison](/blog/best-usmle-question-banks) covers Step 1, Step 2 CK and Step 3 side by side using the same verified pricing data. This guide is the Step 1-only version, with a full strengths/drawbacks/which-plan-to-buy breakdown for each bank specifically for Step 1, instead of a shorter combined summary.',
  },
  {
    question: 'What about Step 2 CK or Step 3 question banks?',
    answer:
      'See our [Step 2 CK question bank comparison](/blog/top-usmle-step-2-ck-question-banks) and [Step 3 question bank comparison](/blog/top-usmle-step-3-question-banks) for the same depth of breakdown, applied to clerkship year and residency.',
  },
];

const Body = () => (
  <>
    <p>
      This guide is the Step 1-only, deep-dive version of our{' '}
      <Link href="/blog/best-usmle-question-banks">general USMLE question bank comparison</Link>.
      Same verified prices and question counts, but with a full breakdown of each bank
      specifically for Step 1: strengths, drawbacks, exactly which plan to buy, and how each one
      fits into a preclinical study schedule.
    </p>

    <H2 section={S.compared} />
    <p>
      Step 1 has been pass/fail since January 2022, so there is no score to chase. You still have
      to pass, and a question bank remains the most direct way to rehearse the exam&rsquo;s
      format and find the gaps a passing score depends on. If you want to see how our own Step 1
      practice works, read about the{' '}
      <Link href="/usmle-step-1-question-bank">MedPrep Step 1 question bank</Link>.
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
            questions: `${MEDPREP_STEP1_TOPICS} question topics`,
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
          Each MedPrep topic produces a full clinical vignette when you reach it, so its figure is
          not directly comparable to a fixed, pre-written bank. UWorld self-assessments: none on
          the 30-day plan, 1 on 90 days, 2 on 180 days and 3 on 360 and 730 days. UWorld QBank
          Plus, which adds medical videos, costs $99 more on every plan. Kaplan&rsquo;s pricing
          page returned an access error every time we checked it, so we are not repeating a
          number we could not verify directly.
        </>
      }
    />

    <H2 section={S.medprep} />
    <p>
      MedPrep Institute is the question bank we build, and it works differently from every fixed,
      pre-written bank below: instead of a static set of questions you work through once, an
      adaptive engine flags the concept behind every question you miss and brings you variations
      on it through spaced repetition over the following days.
    </p>
    <h3>What you get for Step 1</h3>
    <ul>
      <li>NBME-style vignettes with clinical images, across every Step 1 subject and organ system.</li>
      <li>An adaptive engine that targets your weak spots instead of moving on after one attempt.</li>
      <li>Built-in spaced repetition, so a missed concept comes back on a schedule rather than only if you remember to review it.</li>
      <li>Physician-reviewed explanations.</li>
      <li>{MEDPREP_STEP1_TOPICS} Step 1 question topics, each producing a full clinical vignette when you reach it.</li>
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
    <h3>Who it suits for Step 1, and where to add something</h3>
    <p>
      MedPrep suits students who keep missing the same concepts and want reviews scheduled for
      them automatically instead of planning them by hand. It does not include official-style
      self-assessment exams or a score predictor. Pair it with UWorld&rsquo;s self-assessments or
      the official NBME self-assessments for that piece.
    </p>
    <PostCta
      heading="Try the adaptive Step 1 Qbank free for 7 days"
      body="NBME-style vignettes with an adaptive engine and built-in spaced repetition for whatever you keep missing."
      href={signup('medprep-section')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.uworld} />
    <p>
      UWorld is the bank most students name first, and the numbers back that up: 3,600+ Step 1
      questions, all pre-written and reviewed, with vignette-style explanations that closely
      mirror the real exam&rsquo;s voice.
    </p>
    <h3>Strengths for Step 1</h3>
    <ul>
      <li>The largest pre-written Step 1 bank among those with published counts: 3,600+ questions.</li>
      <li>
        Official self-assessments bundled into longer plans, up to three on the 360 and 730-day
        plans, which are the closest thing to a real predictor of your Step 1 pass margin.
      </li>
      <li>Explanations written in the same clinical-vignette voice the real exam uses.</li>
      <li>An optional QBank Plus tier that adds medical videos for an extra $99.</li>
    </ul>
    <h3>Drawbacks for Step 1</h3>
    <ul>
      <li>
        The highest prices among banks with published pricing: $459 for 90 days, against $199 for
        TrueLearn&rsquo;s 90-day Step 1 plan and $378 for AMBOSS&rsquo;s six-month plan.
      </li>
      <li>The 30-day plan includes zero self-assessments.</li>
      <li>No confirmed free trial on the official page we checked, unlike AMBOSS or TrueLearn.</li>
    </ul>
    <h3>Which plan to buy for Step 1</h3>
    <p>
      UWorld sells extra self-assessment forms separately for $50 each, with two weeks of access
      per form. If your dedicated period is short, a 30-day plan ($349) plus one form ($50) comes
      to $399, which is $60 less than the 90-day plan ($459), but gives you 60 fewer days of
      question access. If your dedicated period runs longer than about five weeks, the 90-day plan
      is usually the better value once you account for the built-in self-assessment.
    </p>

    <H2 section={S.amboss} />
    <p>
      AMBOSS bundles its question bank with a clinical library, structured study plans, Anki
      integration and a score predictor, all inside the same subscription, which matters most
      during coursework when you are learning and practicing at the same time.
    </p>
    <h3>Strengths for Step 1</h3>
    <ul>
      <li>5,800+ Step questions across the Qbank, the largest published count in this list.</li>
      <li>A library you can jump into directly from a missed question, useful while you are still building foundational knowledge.</li>
      <li>A score predictor included on every plan, not sold as an add-on.</li>
      <li>A confirmed 5-day free trial and a 30-day money-back guarantee on direct purchases.</li>
    </ul>
    <h3>Drawbacks for Step 1</h3>
    <ul>
      <li>The published question count covers the whole Qbank, not a Step 1-specific figure, so you cannot tell exactly how many are Step 1 questions from the page alone.</li>
      <li>No official self-assessment forms confirmed on the page we checked, unlike UWorld.</li>
    </ul>
    <h3>Which plan to buy for Step 1</h3>
    <p>
      The 6-month plan ($378) covers a typical run from mid-coursework through the start of
      dedicated study. If you are an MS1 or early MS2 planning to use AMBOSS continuously through
      to Step 1, the Student Life plan ($1,199, through the end of PGY-1) can work out cheaper per
      month than renewing the 12-month plan every year, but only if you will genuinely use it that
      long.
    </p>

    <H2 section={S.truelearn} />
    <p>
      TrueLearn has the lowest entry prices of any bank with published pricing in this
      comparison, which makes it a common choice for students who want real exam-style practice
      without UWorld&rsquo;s price tag.
    </p>
    <h3>Strengths for Step 1</h3>
    <ul>
      <li>The lowest published prices here: $149 for 30 days, $199 for 90 days.</li>
      <li>A first-time pass guarantee on plans of 90 days or longer.</li>
      <li>Performance analytics with national benchmarking, so you can see where you stand against other test takers while you still have time to act on it.</li>
      <li>A 5-day free trial that includes 120 real questions, not a stripped-down demo.</li>
    </ul>
    <h3>Drawbacks for Step 1</h3>
    <ul>
      <li>A smaller bank than UWorld: 3,000+ questions against UWorld&rsquo;s 3,600+.</li>
      <li>No official self-assessment forms comparable to UWorld&rsquo;s.</li>
    </ul>
    <h3>Which plan to buy for Step 1</h3>
    <p>
      If your budget is the deciding factor, the 90-day plan ($199) gets you the pass guarantee
      and enough runway for a full dedicated period at less than half of UWorld&rsquo;s 90-day
      price. Students combining it with coursework for a longer runway tend to go with the 180-day
      plan ($299).
    </p>

    <H2 section={S.boardvitals} />
    <p>
      BoardVitals sells three tiers, Cram (1 month), Prepare (3 months) and Master (6 months), with
      a 100% pass guarantee attached to the two longer tiers.
    </p>
    <h3>Strengths for Step 1</h3>
    <ul>
      <li>3,300+ Step 1 questions, a respectable count for the price.</li>
      <li>A 100% pass guarantee on the Prepare and Master tiers, without committing to a 360 or 730-day UWorld plan.</li>
      <li>A genuine 1-month option (Cram) for students very close to their test date.</li>
    </ul>
    <h3>Drawbacks for Step 1</h3>
    <ul>
      <li>No self-assessment forms comparable to UWorld&rsquo;s.</li>
      <li>Less name recognition among students and residency programs than UWorld or AMBOSS.</li>
    </ul>
    <h3>Which plan to buy for Step 1</h3>
    <p>
      The Prepare tier (3 months, $259) is the natural default for a standard dedicated period,
      since it is the cheapest tier that still carries the pass guarantee. Save the 1-month Cram
      tier ($169) for a genuinely compressed timeline, since it does not include the guarantee.
    </p>

    <H2 section={S.lecturio} />
    <p>
      Lecturio pairs its question bank with a full video library, which suits students who prefer
      to review a concept on video before drilling it with questions, rather than jumping straight
      into practice.
    </p>
    <h3>Strengths for Step 1</h3>
    <ul>
      <li>2,200+ questions plus a video library in the same subscription.</li>
      <li>A free tier of 1,000+ questions with no card required, larger than most competitors&rsquo; free trials.</li>
      <li>A 7-day free trial on the paid tier.</li>
    </ul>
    <h3>Drawbacks for Step 1</h3>
    <ul>
      <li>The smallest pre-written bank in this comparison at 2,200+ questions.</li>
      <li>Pricing did not load on the page we checked, so we cannot compare it directly here.</li>
    </ul>
    <h3>Which plan to buy for Step 1</h3>
    <p>
      Start with the free tier, since 1,000+ questions is enough to genuinely evaluate the
      question style and video quality before paying anything. Confirm current pricing directly on
      Lecturio&rsquo;s site, since we could not verify it ourselves.
    </p>

    <H2 section={S.usmlerx} />
    <p>
      USMLE-Rx&rsquo;s Qmax is built specifically around First Aid, the single most widely used
      Step 1 review book, and its explanations reference specific First Aid page numbers.
    </p>
    <h3>Strengths for Step 1</h3>
    <ul>
      <li>Explanations tied directly to First Aid page numbers, useful if that is already your main review book.</li>
      <li>5,000+ questions in a single 12-month plan that also covers Step 2 CK.</li>
      <li>Three self-assessments included.</li>
      <li>A 5-day free trial with no card required.</li>
    </ul>
    <h3>Drawbacks for Step 1</h3>
    <ul>
      <li>Only one plan length (12 months) is published, so there is no shorter or cheaper option if you need less time.</li>
      <li>Less useful if you are not already using First Aid as your primary text.</li>
    </ul>
    <h3>Which plan to buy for Step 1</h3>
    <p>
      There is only one published plan, 12 months for $299, which also covers Step 2 CK. That
      makes it a reasonable single purchase if you plan to start Step 1 review early enough that
      the same subscription will still be active when you move into Step 2 CK prep.
    </p>

    <H2 section={S.kaplan} />
    <p>
      Kaplan sells a Step 1 Qbank with free sample questions, but its pricing pages returned an
      access error every time we tried to load them directly, so we are not repeating a number we
      could not verify ourselves. Its marketing emphasizes physiology and behavioral science
      content specifically. If you are considering it, check{' '}
      <External href="https://www.kaptest.com/">kaptest.com</External> directly for current
      pricing and question counts.
    </p>

    <H2 section={S.choose} />
    <ul>
      <li>
        <strong>You are in coursework and want to learn as you practice:</strong> AMBOSS, for the
        library and study plans built into every question, or MedPrep for a light daily habit with
        spaced repetition.
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
        <strong>You want a pass guarantee without committing to a full year:</strong>{' '}
        BoardVitals&rsquo; Prepare or Master plan.
      </li>
      <li>
        <strong>You are using First Aid as your main review book:</strong> USMLE-Rx&rsquo;s Qmax.
      </li>
      <li>
        <strong>You want video review alongside questions:</strong> Lecturio, starting with its
        free 1,000+ question tier.
      </li>
      <li>
        <strong>You keep missing the same concepts no matter which bank you use:</strong> add
        MedPrep&rsquo;s adaptive review alongside your primary bank.
      </li>
    </ul>

    <H2 section={S.perDay} />
    <p>
      There is no single right number for Step 1. During coursework, a small daily set tied to
      whatever system or subject you are currently studying works well, since it reinforces what
      you just learned instead of pulling in material you have not covered yet. During dedicated
      study, many students move to two or three full 40-question blocks a day, since Step 1 blocks
      hold up to 40 questions.
    </p>
    <Callout title="Review time matters more than volume" tone="disclosure">
      <p>
        Reading every explanation, including for questions you got right, is where most of the
        actual learning happens. Doubling your daily question count without reading explanations
        thoroughly tends to produce worse results than a smaller set reviewed carefully.
      </p>
    </Callout>

    <H2 section={S.start} />
    <p>
      Many students start a Step 1 bank alongside coursework in untimed, subject-based mode to
      build the habit and reinforce lecture material, then switch to a fresh, timed pass during
      dedicated study. If you plan to use official self-assessments to judge readiness, save them
      for the final two to three weeks before your exam, when a score is actually predictive of
      where you will land. Since most banks sell time-limited access (UWorld runs 30 to 730 days),
      buy a plan length that actually matches when you intend to use it, not just when you
      purchase it.
    </p>
    <p>
      If you have not built a full schedule yet, our{' '}
      <Link href="/blog/usmle-step-1-study-guide">Step 1 study guide</Link> includes a sample
      dedicated-period plan you can compress or stretch to fit your timeline.
    </p>

    <H2 section={S.free} />
    <ul>
      <li>TrueLearn: a 5-day free trial with 120 real Step 1 questions.</li>
      <li>AMBOSS: a 5-day free trial.</li>
      <li>Lecturio: a free tier of 1,000+ questions, no card required, plus a 7-day trial on the paid tier.</li>
      <li>USMLE-Rx: a 5-day free trial, no card required.</li>
      <li>Kaplan: free sample questions on their site.</li>
      <li>MedPrep Institute: a 7-day free trial, cancel anytime. Try{' '}
        <Link href="/usmle/features/sample-questions">5 free Step 1 sample questions</Link> right
        now, no account needed.
      </li>
      <li>
        The official <External href="https://www.usmle.org/">USMLE website</External>: content
        outlines, question format guidance and the interactive testing experience.
      </li>
      <li>Your school: ask the library or student affairs office about institutional access before paying for anything.</li>
    </ul>

    <H2 section={S.mostOut} />
    <ol>
      <li>Read every explanation, including for questions you answered correctly by guessing.</li>
      <li>Track misses by concept, not by question, so patterns stand out across subjects and systems.</li>
      <li>Let missed concepts come back on a schedule instead of only once. Spaced repetition does this for you automatically.</li>
      <li>Move to timed, mixed blocks as your exam date gets closer, since that is the closest rehearsal for the real thing.</li>
      <li>Use self-assessments to check readiness in your final weeks, not as daily practice.</li>
      <li>Do not chase raw question counts. Depth of review beats volume, especially with Step 1&rsquo;s pass/fail scoring.</li>
    </ol>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Practice the concepts you actually miss"
      body="MedPrep Institute pairs NBME-style Step 1 vignettes with an adaptive engine and built-in spaced repetition."
      href={signup('article-footer')}
      label="Start your 7-day free trial"
      note="Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p>Prices, question counts and trial terms were checked on the official pages below on September 24, 2026.</p>
    <ul>
      <li>
        <External href="https://medical.uworld.com/usmle/usmle-step-1/">UWorld Step 1</External>
      </li>
      <li>
        <External href="https://www.amboss.com/us/usmle">AMBOSS USMLE preparation</External>
      </li>
      <li>
        <External href="https://truelearn.com/usmle/">TrueLearn USMLE</External> and{' '}
        <External href="https://truelearn.com/usmle/step-1-prep-smartbank/">Step 1 SmartBank</External>
      </li>
      <li>
        <External href="https://www.boardvitals.com/USMLE-step1-questions">BoardVitals Step 1</External>
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
        <External href="https://www.usmle.org/">USMLE.org</External> for Step 1 scoring and
        official materials
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
  slug: 'top-usmle-step-1-question-banks',
  title: 'Top USMLE Step 1 Question Banks: A Full Comparison',
  seoTitle: 'Top USMLE Step 1 Question Banks',
  description:
    'A deep-dive comparison of every major USMLE Step 1 question bank: verified 2026 prices, strengths, drawbacks and exactly which plan to buy.',
  publishedAt: '2026-09-30T18:00:00+02:00',
  updatedAt: '2026-09-30T18:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Charts and pricing data on a desk, downloaded from Unsplash (free to use under the Unsplash
  // License): https://images.unsplash.com/photo-1711097383282-28097ae16b1d
  heroImage: '/blog/top-usmle-step-1-question-banks-hero.jpg',
  category: 'Question banks',
  keywords: [
    'top USMLE Step 1 question banks',
    'best Step 1 question bank',
    'USMLE Step 1 Qbank comparison',
    'UWorld vs AMBOSS Step 1',
    'Step 1 question bank prices 2026',
    'free Step 1 practice questions',
  ],
  readingMinutes: 12,
  sections: Object.values(S),
  faqs,
  Body,
};
