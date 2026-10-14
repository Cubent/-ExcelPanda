import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=how-many-practice-questions-usmle`;

const S = {
  short: { id: 'short', title: 'The short answer' },
  math: { id: 'math', title: 'Turn your timeline into a daily target' },
  quality: { id: 'quality', title: 'Why review matters more than volume' },
  stages: { id: 'stages', title: 'How the number changes through your prep' },
  signs: { id: 'signs', title: 'Signs you are doing too many or too few' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'How many questions per day should I do for Step 1?',
    answer:
      'On a dedicated schedule, commonly 40 to 100. To finish a 3,600-question bank in six weeks you would average about 86 a day.',
  },
  {
    question: 'How many questions per day for Step 2 CK?',
    answer:
      'Often similar, with a larger bank. Finishing 4,250 questions in eight weeks is about 76 a day.',
  },
  {
    question: 'Do I need to finish the whole bank?',
    answer:
      'Not necessarily. Many students complete one pass or a focused partial pass, then redo missed questions.',
  },
  {
    question: 'Is it better to do fewer questions and review more?',
    answer:
      'Usually yes. Careful review of fewer questions beats rushing through more.',
  },
  {
    question: 'Should I do timed or tutor mode?',
    answer:
      'Start with tutor or untimed mode to learn, then move to timed, mixed blocks as the exam approaches.',
  },
];

const Body = () => (
  <>
    <p>
      "How many questions should I do?" has no fixed answer, but you can work out a sensible number
      from the size of your bank and the time you have. This guide shows the math and explains why
      reviewing questions matters more than counting them.
    </p>

    <H2 section={S.short} />
    <p>
      Most students aim to complete one full pass of a major question bank, with each explanation
      read, before the exam. On a dedicated schedule, that usually means somewhere between 40 and
      100 questions a day, depending on bank size and how many weeks you have.
    </p>

    <H2 section={S.math} />
    <ComparisonTable
      caption="Daily question targets to finish one pass (calendar days, including rest days)"
      columns={[
        { key: 'bank', label: 'Bank size' },
        { key: 'four', label: 'In 4 weeks' },
        { key: 'six', label: 'In 6 weeks' },
        { key: 'eight', label: 'In 8 weeks' },
      ]}
      rows={[
        { id: 's1', cells: { bank: '3,600 questions (UWorld Step 1)', four: 'about 129 a day', six: 'about 86 a day', eight: 'about 64 a day' } },
        { id: 's2', cells: { bank: '4,250 questions (UWorld Step 2 CK)', four: 'about 152 a day', six: 'about 101 a day', eight: 'about 76 a day' } },
        { id: 's3', cells: { bank: '2,100 questions (UWorld Step 3)', four: 'about 75 a day', six: 'about 50 a day', eight: 'about 38 a day' } },
      ]}
      footnote="Question counts are the bank sizes listed on UWorld's official pages. Bank sizes vary by company."
    />
    <p>
      If the number looks unrealistic, you have three levers: lengthen the timeline, do a partial
      pass focused on weak systems, or start earlier (during clerkships for Step 2 CK). Our{' '}
      <Link href="/blog/step-2-ck-study-schedule">Step 2 CK study schedule</Link> shows how to
      spread this out.
    </p>

    <H2 section={S.quality} />
    <p>
      Doing 40 questions and reviewing each one carefully teaches more than doing 120 and skimming.
      A rough rule: if review takes you less time than answering, you are probably skipping
      explanations. Track the concepts you miss, because that list, not your question count, tells
      you what to study next. See{' '}
      <Link href="/blog/how-to-review-missed-usmle-questions">how to review missed questions</Link>.
    </p>
    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.stages} />
    <ul>
      <li><strong>Early:</strong> lower volume, untimed or tutor mode, thorough review.</li>
      <li><strong>Middle:</strong> timed, mixed blocks of about 40 a day or more.</li>
      <li><strong>Final two weeks:</strong> taper volume, take self-assessments, revisit weak areas.</li>
    </ul>

    <H2 section={S.signs} />
    <ul>
      <li><strong>Too many:</strong> you are rushing explanations, scores are flat, you are exhausted.</li>
      <li><strong>Too few:</strong> you will not finish a pass before the exam, or you rarely see some systems.</li>
    </ul>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Let the engine plan your reviews"
      body="Short daily sets with missed concepts brought back on a schedule."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      This guide is general study information, not a guarantee of any result. MedPrep Institute is our own product. Exam rules are set by the NBME and FSMB and can change, so confirm current details on USMLE.org. MedPrep Institute is not affiliated with or endorsed by NBME, FSMB, USMLE or any other company named here. All trademarks belong to their owners. Bank sizes are those listed on each company's official pages and change.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'how-many-practice-questions-usmle',
  title: 'How Many Practice Questions Should You Do for USMLE Step 1, 2 CK and 3?',
  seoTitle: 'How Many Practice Questions for USMLE Prep?',
  description:
    'How many practice questions to do per day for Step 1, Step 2 CK and Step 3, with a table that turns bank size and timeline into a daily target.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Study plans',
  keywords: [
    'how many practice questions USMLE',
    'how many questions per day Step 1',
    'how many UWorld questions per day',
    'how many questions to do for Step 2 CK',
  ],
  readingMinutes: 5,
  sections: Object.values(S),
  faqs,
  Body,
};
