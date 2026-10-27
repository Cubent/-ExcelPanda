import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=step-2-ck-score-plateau`;

const S = {
  why: { id: 'why', title: 'Why scores stall' },
  diagnose: { id: 'diagnose', title: 'Step 1: Diagnose by error type' },
  table: { id: 'table', title: 'Match the fix to the error' },
  cycle: { id: 'cycle', title: 'Step 2: Run a two-week repair cycle' },
  retest: { id: 'retest', title: 'Step 3: Re-test on a schedule' },
  wrong: { id: 'wrong', title: 'What not to do' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Why are my Step 2 CK practice scores not improving?',
    answer:
      'Usually because your study volume does not match your errors. Sort misses by cause (content gap, management error or misread) and fix the cause, not just the volume.',
  },
  {
    question: 'How do I break a Step 2 CK plateau?',
    answer:
      'Diagnose by error type, pick three repair targets, run a short repair cycle and re-test those concepts on a schedule before taking another practice exam.',
  },
  {
    question: 'Should I add another question bank if I am plateauing?',
    answer:
      'Not before fixing your review process. A second bank helps with a specific job, such as weak-area review, not as a substitute for diagnosis.',
  },
  {
    question: 'How often should I take NBME practice exams?',
    answer:
      'Spread them out and take the next one after a repair cycle. More than six or seven full exams tends to add fatigue and noise. See our [practice exam guide](/blog/how-many-nbme-practice-exams-step-2-ck).',
  },
  {
    question: 'Can an AI tutor help with a plateau?',
    answer:
      'It can help you understand why a choice is wrong, but verify specifics against the explanation. See our [AI tutor guide](/blog/ai-tutor-for-usmle).',
  },
];

const Body = () => (
  <>
    <p>
      A flat practice score is frustrating, and the usual reaction, more questions and more hours, is
      often the wrong one. Prep guides that cover plateaus agree on the first move: find out why
      you are missing points before you add anything.
    </p>

    <H2 section={S.why} />
    <p>
      A flat score usually means your study volume is not matched to your errors. If you keep doing
      random blocks without changing how you review, you tend to repeat the same mistakes at a higher
      effort level.
    </p>

    <H2 section={S.diagnose} />
    <p>
      Sort every missed question by <strong>why</strong> you missed it, not by subject. Three
      categories cover most misses:
    </p>
    <ul>
      <li><strong>Content gap:</strong> you did not know the fact or mechanism.</li>
      <li><strong>Management error:</strong> you knew the diagnosis but not the next step or treatment.</li>
      <li><strong>Misread:</strong> you missed a keyword, or confused "most likely" with "next best step".</li>
    </ul>
    <p>
      Use your NBME score report as well, to see which systems pull your score down.
    </p>

    <H2 section={S.table} />
    <ComparisonTable
      caption="Error type and the fix"
      columns={[
        { key: 'type', label: 'Error type' },
        { key: 'fix', label: 'What helps' },
      ]}
      rows={[
        { id: 'content', cells: { type: 'Content gap', fix: 'Targeted topic review, then questions on that topic a few days later' } },
        { id: 'mgmt', cells: { type: 'Management error', fix: 'Drill treatment algorithms and next-step decisions, not diagnoses' } },
        { id: 'read', cells: { type: 'Misread', fix: 'Slow down on the stem; underline the question being asked before reading choices' } },
      ]}
      footnote="Based on recurring advice in Step 2 CK prep guides. Gains from any single fix vary."
    />    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.cycle} />
    <ol>
      <li>Pick your <strong>three</strong> weakest repair targets, not ten.</li>
      <li>Spend a few days on each: review the topic, then do a block of questions on it.</li>
      <li>Write the concept in one sentence and the trap that caught you.</li>
      <li>Ask why a wrong choice is wrong. MedPrep's AI Tutor can walk through it while you practice.</li>
    </ol>

    <H2 section={S.retest} />
    <p>
      Do not take another full practice exam after every block. Take the next one only after a full
      repair cycle, so each result tells you whether the fixes worked. In between, re-test the
      concepts you repaired after a day, a week and again before the exam. MedPrep does this for you:
      a missed question flags the concept, and variations come back over the following days. Try the{' '}
      <Link href="/usmle/features/sample-questions/step-2">free Step 2 CK sample questions</Link>,
      then the 7-day free trial. See also our{' '}
      <Link href="/blog/how-many-nbme-practice-exams-step-2-ck">practice exam schedule</Link>.
    </p>

    <H2 section={S.wrong} />
    <ul>
      <li>Adding a second question bank before fixing your review process.</li>
      <li>Rereading content you already know.</li>
      <li>Taking a practice exam every few days. Fatigue adds noise.</li>
      <li>Ignoring a stalled trend until the last week.</li>
    </ul>
    <p>
      If your exam is close and scores are near the passing line, talk to your advisor about timing.
      The current passing standard is in our{' '}
      <Link href="/blog/usmle-passing-scores-2026">passing scores guide</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Break your plateau with scheduled review"
      body="Adaptive practice that brings missed concepts back. 7-day free trial."
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
  slug: 'step-2-ck-score-plateau',
  title: 'Stuck on Your Step 2 CK Practice Scores? Fix the Plateau by Error Type',
  seoTitle: 'Step 2 CK Score Plateau: How to Fix It',
  description:
    'Flat NBME or UWorld scores before Step 2 CK? Diagnose the cause by error type, pick three repair targets and re-test on a schedule to break the plateau.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Study plans',
  keywords: [
    'Step 2 CK score plateau',
    'NBME score not improving',
    'stuck Step 2 CK practice scores',
    'how to improve Step 2 CK score',
    'Step 2 CK score not going up',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
