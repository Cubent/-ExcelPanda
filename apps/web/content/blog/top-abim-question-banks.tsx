import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=top-abim-question-banks`;

const S = {
  compared: { id: 'abim-question-banks-compared', title: 'ABIM question banks compared' },
  medprep: { id: 'medprep', title: 'MedPrep Institute: adaptive practice (our product)' },
  uworld: { id: 'uworld', title: 'UWorld: the newer default for ABIM prep' },
  mksap: { id: 'mksap', title: 'MKSAP: the traditional ACP standard' },
  amboss: { id: 'amboss', title: 'AMBOSS: Knowledge+ with a library built in' },
  truelearn: { id: 'truelearn', title: 'TrueLearn: the budget-friendly entry point' },
  boardvitals: { id: 'boardvitals', title: 'BoardVitals: the cheapest confirmed guarantee tier' },
  choose: { id: 'how-to-choose', title: 'How to choose your ABIM question bank' },
  perDay: { id: 'questions-per-day', title: 'How many ABIM questions should you do per day?' },
  start: { id: 'when-to-start', title: 'When should you start an ABIM question bank?' },
  free: { id: 'free-abim-practice', title: 'Free ways to practice ABIM questions' },
  mostOut: { id: 'get-the-most-out-of-it', title: 'How to get the most out of your ABIM bank' },
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

const UWORLD_PRICES = ['90 days: $499', '180 days: $549', '360 days: $599', '730 days: $749'];
const MKSAP_PRICES = [
  '1-year, resident member: $415',
  '1-year, ACP member: $590',
  '1-year, nonmember: $849',
  '3-year, resident member: $495',
  '3-year, ACP member: $749',
  '3-year, nonmember: $1,275',
];
const AMBOSS_PRICES = ['1 month Qbank + 1 year library: $298', '6 months: $378', '12 months: $448'];
const TRUELEARN_PRICES = ['30 days: $140', '90 days: $200', '180 days: $240', '365 days: $310'];
const BOARDVITALS_PRICES = ['Cram, 1 month: $209', 'Prepare, 3 months: $319', 'Master, 6 months: $549'];
const MEDPREP_PRICES = [
  '$40 per month',
  '$110 per 3 months ($36.67 per month)',
  '$400 per year ($33.33 per month)',
];
const MEDPREP_ABIM_TOPICS = '10,400+';
const MEDPREP_TRIAL = '7-day free trial, cancel anytime';

const faqs: BlogFaq[] = [
  {
    question: 'What is the single best question bank for the ABIM exam?',
    answer:
      'There is no single answer: MKSAP is the traditional standard and bundles a full text review for ACP members, UWorld has the newest interface and the largest confirmed question count, AMBOSS bundles a library and practice exams, and TrueLearn and BoardVitals offer lower-cost options with pass guarantees. MedPrep Institute adds adaptive weak-area review on top of any primary bank.',
  },
  {
    question: 'Is MKSAP worth it if I am not an ACP member?',
    answer:
      'Compare the cost of ACP membership plus the member rate against the nonmember price ($849 for 1 year) before deciding. For many residents, membership plus the member rate works out cheaper than paying the nonmember price directly.',
  },
  {
    question: 'Do I need a question bank with a pass guarantee?',
    answer:
      'A guarantee is not required to pass, but TrueLearn and BoardVitals both offer one on their standard plans at a lower price than UWorld or MKSAP’s nonmember rate, which can be worth the peace of mind if budget allows.',
  },
  {
    question: 'Can I use more than one ABIM question bank?',
    answer:
      'Yes, and many residents do: a primary comprehensive resource like MKSAP or UWorld, plus a second bank or MedPrep’s adaptive review for additional weak-area practice. Use the second resource to find topics to revisit, not purely to raise your total question count.',
  },
  {
    question: 'How is this different from the ABIM study guide?',
    answer:
      'Our [ABIM study guide](/blog/abim-study-guide) covers when to start, a sample schedule for your final year, and general exam-prep strategy. This guide is the question-bank comparison specifically: verified prices, question counts, and which plan to buy from each provider.',
  },
];

const Body = () => (
  <>
    <p>
      This guide compares every major source of ABIM Internal Medicine board review questions:
      verified prices, question counts, what each one actually includes, and exactly which plan
      to buy. If you want our own study-plan guidance first, see the{' '}
      <Link href="/blog/abim-study-guide">ABIM study guide</Link> and{' '}
      <Link href="/blog/abim-syllabus">ABIM syllabus and blueprint guide</Link>.
    </p>

    <Callout title="MKSAP is not just a Qbank the way the others are" tone="disclosure">
      <p>
        UWorld, AMBOSS, TrueLearn and BoardVitals are primarily question banks. MKSAP, published
        by the American College of Physicians, bundles its questions with a full text review and
        Board Basics study guide as one program. Comparing it purely on a per-question basis
        undersells what the subscription actually includes.
      </p>
    </Callout>

    <H2 section={S.compared} />
    <p>
      The ABIM Internal Medicine Certification Exam is given once a year, so most residents and
      early-career internists build review time around a single annual deadline rather than a
      flexible testing window. MedPrep also offers a dedicated{' '}
      <Link href="/abim-internal-medicine-question-bank">ABIM question bank</Link>.
    </p>
    <ComparisonTable
      caption="ABIM question banks: questions, plans and prices"
      columns={[
        { key: 'bank', label: 'Question bank' },
        { key: 'questions', label: 'ABIM content' },
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
            questions: `${MEDPREP_ABIM_TOPICS} question topics`,
            plans: <Lines items={MEDPREP_PRICES} />,
            trial: MEDPREP_TRIAL,
            best: 'Residents who keep missing the same concepts and want spaced repetition that fits around shifts',
          },
        },
        {
          id: 'uworld',
          cells: {
            bank: 'UWorld',
            questions: '1,200+ in the QBank (1,816 across all ABIM products)',
            plans: <Lines items={UWORLD_PRICES} />,
            trial: 'Self-assessment forms sold separately: $50 each or $120 for all three',
            best: 'Exam-style volume with the newest, most polished interface',
          },
        },
        {
          id: 'mksap',
          cells: {
            bank: 'MKSAP (ACP)',
            questions: 'Almost 2,000 unique questions plus Board Basics and full text review',
            plans: <Lines items={MKSAP_PRICES} />,
            trial: 'No free trial confirmed. Pricing varies by ACP membership status',
            best: 'A comprehensive text-plus-questions program, not just a Qbank',
          },
        },
        {
          id: 'amboss',
          cells: {
            bank: 'AMBOSS',
            questions: '2,000+ questions plus a 1,500+ article library',
            plans: <Lines items={AMBOSS_PRICES} />,
            trial: '5-day free trial. 30-day money-back guarantee',
            best: 'A library and two full-length practice exams bundled with the Qbank',
          },
        },
        {
          id: 'truelearn',
          cells: {
            bank: 'TrueLearn',
            questions: '1,800+',
            plans: <Lines items={TRUELEARN_PRICES} />,
            trial: '5-day free trial. Pass guarantee on the ABIM Board Exam',
            best: 'Performance analytics with national benchmarking',
          },
        },
        {
          id: 'boardvitals',
          cells: {
            bank: 'BoardVitals',
            questions: '1,650+',
            plans: <Lines items={BOARDVITALS_PRICES} />,
            trial: 'Free trial, no card required. 100% pass guarantee on Prepare and Master',
            best: 'A pass guarantee without committing to UWorld or MKSAP pricing',
          },
        },
      ]}
      footnote={
        <>
          Each MedPrep topic produces a full board-style vignette when you reach it, so its figure
          is not directly comparable to a fixed, pre-written bank. MKSAP prices shown are for its
          1-year and 3-year digital subscriptions; nonmember pricing is substantially higher than
          ACP member or resident member rates.
        </>
      }
    />

    <H2 section={S.medprep} />
    <p>
      MedPrep Institute is the question bank we build, and it works differently from every fixed,
      pre-written bank below: instead of a static set of questions you work through once, an
      adaptive engine flags the concept behind every question you miss and brings you variations
      on it through spaced repetition over the following days. If you used MedPrep for the USMLE
      Steps, your progress carries over automatically into ABIM prep.
    </p>
    <h3>What you get for ABIM</h3>
    <ul>
      <li>Board-style internal medicine vignettes across every clinical discipline on the blueprint.</li>
      <li>An adaptive engine that targets your weak disciplines instead of moving on after one attempt.</li>
      <li>Built-in spaced repetition, so a missed concept comes back on a schedule.</li>
      <li>Physician-reviewed explanations.</li>
      <li>{MEDPREP_ABIM_TOPICS} ABIM question topics, each producing a full clinical vignette when you reach it.</li>
      <li>Five-question sets built to fit into short gaps in a resident&rsquo;s or attending&rsquo;s day.</li>
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
    <h3>Who it suits for ABIM, and where to add something</h3>
    <p>
      MedPrep suits residents and early-career internists who keep missing the same concepts and
      want reviews scheduled for them automatically instead of planning them by hand. It does not
      include an official-style self-assessment exam or a score predictor. Pair it with UWorld&rsquo;s
      self-assessment forms or MKSAP&rsquo;s own self-assessment questions for that piece.
    </p>
    <PostCta
      heading="Try the adaptive ABIM Qbank free for 7 days"
      body="Board-style vignettes with an adaptive engine and built-in spaced repetition for whatever you keep missing."
      href={signup('medprep-section')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.uworld} />
    <p>
      UWorld has become the newer default choice for ABIM prep among residents, with 1,200+
      questions in the main QBank (1,816 across all of its ABIM products) and the same detailed,
      visual explanation style it is known for on the USMLE Steps.
    </p>
    <h3>Strengths for ABIM</h3>
    <ul>
      <li>A modern, detailed explanation style many residents already know from Step prep.</li>
      <li>An optional Medical Library add-on with 1,300+ articles for an extra $50 on every plan.</li>
      <li>A Study Planner and one-time reset included on plans of 180 days or longer.</li>
    </ul>
    <h3>Drawbacks for ABIM</h3>
    <ul>
      <li>
        The highest entry price among banks with published pricing: $499 for 90 days, against
        $140 for TrueLearn&rsquo;s 30-day plan and $209 for BoardVitals&rsquo; 1-month Cram tier.
      </li>
      <li>Self-assessment forms are sold separately at $50 each, or $120 for all three, not bundled into any plan.</li>
    </ul>
    <h3>Which plan to buy for ABIM</h3>
    <p>
      Since self-assessments cost extra regardless of plan length, the deciding factor is runway.
      The 90-day plan ($499) covers a standard review block; if you are spreading review across
      your final year of residency rather than a short dedicated period, the 360-day plan ($599)
      adds nine more months for only $100 more than the 90-day plan.
    </p>

    <H2 section={S.mksap} />
    <p>
      MKSAP, published by the American College of Physicians, is the traditional standard for
      ABIM prep: a full text review and Board Basics study guide bundled with almost 2,000
      questions, not a standalone Qbank.
    </p>
    <h3>Strengths for ABIM</h3>
    <ul>
      <li>A complete review program, not just questions: full text chapters, Board Basics, and image-based Virtual Dx questions.</li>
      <li>Nearly 2,000 adaptive digital flashcards included alongside the question bank.</li>
      <li>Resident member pricing ($415 for 1 year) is competitive with other banks once the full program is counted.</li>
    </ul>
    <h3>Drawbacks for ABIM</h3>
    <ul>
      <li>Nonmember pricing is the highest in this comparison: $849 for 1 year, $1,275 for 3 years.</li>
      <li>No free trial confirmed on the official page we checked.</li>
      <li>All-digital only: the standalone print edition (MKSAP 19) is no longer available as of August 2026.</li>
    </ul>
    <h3>Which plan to buy for ABIM</h3>
    <p>
      If you are an ACP resident member, the 1-year resident rate ($415) is the clear default and
      among the cheapest options in this entire comparison. If you are not yet an ACP member,
      compare the cost of joining ACP against the nonmember price difference before paying the
      full $849.
    </p>

    <H2 section={S.amboss} />
    <p>
      AMBOSS Knowledge+ Internal Medicine Board Review bundles 2,000+ questions with its clinical
      library and two full-length, 60-question practice exams, inside the same kind of
      subscription AMBOSS sells for the USMLE Steps.
    </p>
    <h3>Strengths for ABIM</h3>
    <ul>
      <li>2,000+ questions plus a 1,500+ article clinical library included on every plan.</li>
      <li>Two full-length practice exams included, not sold as a separate add-on.</li>
      <li>A confirmed 5-day free trial and 30-day money-back guarantee on direct purchases.</li>
      <li>Automatic ABIM MOC point transmission and AMA PRA Category 1 Credit on completed content.</li>
    </ul>
    <h3>Drawbacks for ABIM</h3>
    <ul>
      <li>No score predictor confirmed for the Internal Medicine board review product specifically.</li>
      <li>The cheapest plan still bundles a full year of library access, which you may not need if you only want the Qbank.</li>
    </ul>
    <h3>Which plan to buy for ABIM</h3>
    <p>
      The entry plan (1 month of Qbank access plus 1 year of library access, $298) is the cheapest
      way to get the full practice-exam bundle. If you want Qbank access for longer than a month,
      the 6-month plan ($378) adds five more months of Qbank access for $80 more.
    </p>

    <H2 section={S.truelearn} />
    <p>
      TrueLearn has the lowest short-term entry price of any confirmed ABIM bank in this
      comparison, with 1,800+ questions and the same national-benchmarking analytics it uses
      across its other SmartBanks.
    </p>
    <h3>Strengths for ABIM</h3>
    <ul>
      <li>The lowest published short-term price here: $140 for 30 days.</li>
      <li>A pass guarantee specifically for the ABIM Board Exam.</li>
      <li>Performance analytics with national benchmarking against other test takers.</li>
      <li>A 5-day free trial, and purchased access can wait up to 365 days before you activate it.</li>
    </ul>
    <h3>Drawbacks for ABIM</h3>
    <ul>
      <li>A smaller confirmed question count than AMBOSS or UWorld&rsquo;s combined ABIM products.</li>
      <li>No bundled text review or library the way MKSAP or AMBOSS include.</li>
    </ul>
    <h3>Which plan to buy for ABIM</h3>
    <p>
      If you are spreading review across most of your final year, the 365-day plan ($310) works
      out to less than a dollar a day and is cheaper overall than UWorld&rsquo;s 360-day plan
      ($599). For a short, compressed timeline close to your test date, the 90-day plan ($200)
      still carries the pass guarantee.
    </p>

    <H2 section={S.boardvitals} />
    <p>
      BoardVitals sells the same three-tier structure for ABIM that it uses across its other board
      review products, Cram (1 month), Prepare (3 months) and Master (6 months), with 1,650+
      questions.
    </p>
    <h3>Strengths for ABIM</h3>
    <ul>
      <li>A 100% pass guarantee on the Prepare and Master tiers.</li>
      <li>A free trial with no card required, to sample the question style before paying anything.</li>
      <li>An optional CME certificate add-on, discounted for Master and Prepare subscribers.</li>
    </ul>
    <h3>Drawbacks for ABIM</h3>
    <ul>
      <li>The smallest confirmed question count among the guarantee-backed options in this comparison.</li>
      <li>Full-length practice exams are a paid add-on ($25, or $20 with Master/Prepare) rather than included.</li>
    </ul>
    <h3>Which plan to buy for ABIM</h3>
    <p>
      The Prepare tier (3 months, $319) is the cheapest option that still carries the pass
      guarantee. The Master tier (6 months, $549) only makes sense if you genuinely need six
      months of access, since it costs more than UWorld&rsquo;s 360-day plan for less total runway.
    </p>

    <H2 section={S.choose} />
    <ul>
      <li>
        <strong>You are an ACP resident member:</strong> MKSAP&rsquo;s resident rate ($415 for 1
        year) bundles a full text review with the question bank at a competitive price.
      </li>
      <li>
        <strong>You want the newest interface and already know UWorld from the Steps:</strong>{' '}
        UWorld, especially if you add the Medical Library.
      </li>
      <li>
        <strong>You want a library and practice exams bundled in:</strong> AMBOSS Knowledge+.
      </li>
      <li>
        <strong>Your budget or timeline is tight:</strong> TrueLearn ($140 for 30 days, $310 for a
        full year), or BoardVitals&rsquo; Prepare tier for a guarantee at a lower price than UWorld.
      </li>
      <li>
        <strong>You keep missing the same concepts no matter which bank you use:</strong> add
        MedPrep&rsquo;s adaptive review alongside your primary bank.
      </li>
    </ul>

    <H2 section={S.perDay} />
    <p>
      There is no single right number for ABIM. Early in your final year, a small daily set mixed
      across disciplines works well, since clinical rotations are already covering a real share of
      the blueprint. As your test date approaches, move toward timed, mixed blocks that mirror the
      actual exam&rsquo;s four-session format.
    </p>
    <Callout title="Clinical experience already covers part of the blueprint" tone="disclosure">
      <p>
        Unlike Step 1, you are not learning internal medicine for the first time. Question
        practice works best alongside your clinical experience, consolidating it into exam form,
        not replacing it.
      </p>
    </Callout>

    <H2 section={S.start} />
    <p>
      Since ABIM is offered only once a year, registration deadlines and study time both need to
      be planned earlier than you would for a USMLE Step. Most residents spread review across
      their final year rather than cramming into a short block at the end, and save official
      self-assessments for the final two to three weeks, when a score actually predicts readiness.
    </p>
    <p>
      If you have not built a full schedule yet, our{' '}
      <Link href="/blog/abim-study-guide">ABIM study guide</Link> includes a sample study plan
      built around a resident&rsquo;s final year, and our{' '}
      <Link href="/blog/abim-syllabus">ABIM syllabus guide</Link> breaks down the exact blueprint
      percentages by medical content category.
    </p>

    <H2 section={S.free} />
    <ul>
      <li>TrueLearn: a 5-day free trial.</li>
      <li>AMBOSS: a 5-day free trial.</li>
      <li>BoardVitals: a free trial with no card required.</li>
      <li>
        MedPrep Institute: a 7-day free trial, cancel anytime. Try{' '}
        <Link href="/abim/features/sample-questions">5 free ABIM sample questions</Link> right
        now, no account needed.
      </li>
      <li>
        The official <External href="https://www.abim.org/">ABIM website</External>: exam
        blueprint, policies and the current exam structure.
      </li>
      <li>Your program: ask your residency coordinator or medical library about institutional access before paying for anything.</li>
    </ul>

    <H2 section={S.mostOut} />
    <ol>
      <li>Read every explanation, including for questions you got right.</li>
      <li>Track misses by concept, not by question, so patterns stand out across disciplines.</li>
      <li>Let missed concepts come back on a schedule instead of only once. Spaced repetition does this automatically.</li>
      <li>Move to timed, mixed blocks as your exam date gets closer, since that is the closest rehearsal for the real thing.</li>
      <li>Use self-assessments to check readiness in your final weeks, not as daily practice.</li>
      <li>Register early. Missing an ABIM deadline can push certification back an entire year.</li>
    </ol>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Practice the concepts you actually miss"
      body="MedPrep Institute pairs board-style ABIM vignettes with an adaptive engine and built-in spaced repetition."
      href={signup('article-footer')}
      label="Start your 7-day free trial"
      note="Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p>Prices, question counts and trial terms were checked on the official pages below on October 2, 2026.</p>
    <ul>
      <li>
        <External href="https://medical.uworld.com/abim/">UWorld ABIM</External>
      </li>
      <li>
        <External href="https://www.acponline.org/featured-products/acp-mksap">ACP MKSAP</External>
      </li>
      <li>
        <External href="https://www.amboss.com/us/board-review/internal-medicine">
          AMBOSS Internal Medicine board review
        </External>
      </li>
      <li>
        <External href="https://truelearn.com/internal-medicine/">TrueLearn Internal Medicine</External>
      </li>
      <li>
        <External href="https://www.boardvitals.com/internal-medicine-board-review">
          BoardVitals Internal Medicine board review
        </External>
      </li>
      <li>
        <External href="https://www.abim.org/">ABIM.org</External> for the current exam structure
        and official materials
      </li>
    </ul>
    <p className="text-sm text-gray-500">
      MedPrep Institute is not affiliated with or endorsed by ABIM, ACP, UWorld, AMBOSS,
      TrueLearn, BoardVitals or any other company named here. All trademarks belong to their
      owners and are used descriptively. This guide is for general information and is not a
      guarantee of any exam result.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'top-abim-question-banks',
  title: 'Top ABIM Question Banks: A Full Comparison',
  seoTitle: 'Top ABIM Question Banks',
  description:
    'A deep-dive comparison of every major ABIM Internal Medicine question bank: verified prices, strengths, drawbacks and exactly which plan to buy.',
  publishedAt: '2026-10-02T19:00:00+02:00',
  updatedAt: '2026-10-02T19:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // A physician in a white coat reading a notebook, downloaded from Unsplash (free to use under
  // the Unsplash License): https://images.unsplash.com/photo-1778918006809-82a60e7a954b
  heroImage: '/blog/top-abim-question-banks-hero.jpg',
  category: 'Question banks',
  keywords: [
    'top ABIM question banks',
    'best ABIM question bank',
    'ABIM Qbank comparison',
    'UWorld vs MKSAP ABIM',
    'ABIM board review prices',
    'free ABIM practice questions',
  ],
  readingMinutes: 12,
  sections: Object.values(S),
  faqs,
  Body,
};
