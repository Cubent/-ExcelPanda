import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=how-to-review-missed-usmle-questions`;

const S = {
  why: { id: 'why', title: 'Why review matters more than the question' },
  types: { id: 'types', title: 'Sort every miss into a type' },
  steps: { id: 'steps', title: 'The five-step review' },
  log: { id: 'log', title: 'Keep a simple error log' },
  schedule: { id: 'schedule', title: 'Schedule the return' },
  auto: { id: 'auto', title: 'Letting software do the scheduling' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'How should I review UWorld questions?',
    answer:
      'Read every explanation, name the type of mistake, write the concept in your own words, and plan when you will see it again.',
  },
  {
    question: 'Should I review questions I got right?',
    answer:
      'Yes, especially guesses and questions you got right for the wrong reason.',
  },
  {
    question: 'How long should review take?',
    answer:
      'Often as long as or longer than answering the block. If review is much shorter, you are probably skimming.',
  },
  {
    question: 'What is an error log?',
    answer:
      'A running list of missed concepts with the mistake type and when you revisited them. It shows you what to study next.',
  },
  {
    question: 'How often should I revisit missed concepts?',
    answer:
      'After a day, after about a week, and again before the exam.',
  },
];

const Body = () => (
  <>
    <p>
      Most of the learning in a question bank happens after you answer, not while you answer. Yet
      many students read an explanation once and move on. This guide gives a short, repeatable
      process for turning each miss into something you will not miss again.
    </p>

    <H2 section={S.why} />
    <p>
      A question you got wrong is a free diagnosis of a weak spot. If you do not capture it, you
      will pay for the same mistake again on a later block, or on test day.
    </p>

    <H2 section={S.types} />
    <ul>
      <li><strong>Knowledge gap:</strong> you did not know the fact or mechanism.</li>
      <li><strong>Reasoning error:</strong> you knew the fact but chose the wrong approach.</li>
      <li><strong>Misread:</strong> you missed a keyword, a lab value or the question stem.</li>
      <li><strong>Guess:</strong> you got it right or wrong without a reason.</li>
    </ul>
    <p>
      Each type needs a different fix. Knowledge gaps need review, reasoning errors need worked
      examples, and misreads need slower reading.
    </p>

    <H2 section={S.steps} />
    <ol>
      <li>Read the explanation for the right answer, then for each wrong option.</li>
      <li>Name the type of mistake.</li>
      <li>Write the concept in one sentence, in your own words.</li>
      <li>Note the trap that caught you.</li>
      <li>Move on and plan when you will see it again.</li>
    </ol>
    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.log} />
    <p>
      A simple spreadsheet works: date, topic, mistake type, one-sentence concept and a check column
      for when you revisited it. Review the log weekly, and look for patterns, since the same topic
      appearing five times is your next study block.
    </p>

    <H2 section={S.schedule} />
    <p>
      Revisit each concept after a day, after about a week and again before the exam. Re-test
      yourself with questions rather than rereading the explanation. Our{' '}
      <Link href="/blog/anki-vs-question-bank-usmle">Anki vs question bank guide</Link> covers
      spaced review in more depth, and the{' '}
      <Link href="/blog/how-many-practice-questions-usmle">daily question target guide</Link> helps
      you leave enough time to do this.
    </p>

    <H2 section={S.auto} />
    <p>
      Doing this by hand works, but it takes discipline. MedPrep's adaptive engine does the logging
      and scheduling for you: a miss flags the concept and variations on it return over the
      following days. You can try it with a 7-day free trial and compare the results to your own
      log.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Let the engine handle your error log"
      body="Missed concepts come back on a schedule, automatically."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      This guide is general study information, not a guarantee of any result. MedPrep Institute is our own product. Exam rules are set by the NBME and FSMB and can change, so confirm current details on USMLE.org. MedPrep Institute is not affiliated with or endorsed by NBME, FSMB, USMLE or any other company named here. All trademarks belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'how-to-review-missed-usmle-questions',
  title: 'How to Review Missed USMLE Questions (Error Log Method)',
  seoTitle: 'How to Review Missed USMLE Questions Effectively',
  description:
    'A simple process for reviewing wrong answers on USMLE practice questions: sort the error, log the concept, and schedule it to come back.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Study plans',
  keywords: [
    'how to review UWorld questions',
    'how to review wrong answers USMLE',
    'USMLE error log',
    'how to learn from missed questions',
    'USMLE review method',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
