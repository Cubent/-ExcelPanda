import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=how-many-nbme-practice-exams-step-2-ck`;

const S = {
  short: { id: 'short', title: 'The short answer: three to five' },
  which: { id: 'which', title: 'Which practice exams are the most predictive?' },
  schedule: { id: 'schedule', title: 'When to take each one' },
  between: { id: 'between', title: 'What to do in the weeks between exams' },
  read: { id: 'read', title: 'How to read a practice score without panicking' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'How many NBME practice exams should I take for Step 2 CK?',
    answer:
      'Most guides suggest three to five full practice exams in total, such as two or three recent NBME forms plus UWSA 2, and spread across the last six to ten weeks rather than all in the final two.',
  },
  {
    question: 'Is UWSA 2 or NBME more predictive for Step 2 CK?',
    answer:
      'Sources most often cite UWSA 2 and recent NBME forms as the best predictors. NBME forms tend to run slightly conservative and UWSA a little optimistic, but there is no official correlation data.',
  },
  {
    question: 'When should I take UWSA 2?',
    answer:
      'Commonly about five to seven days before your exam, not the day before.',
  },
  {
    question: 'Is the Free 120 a good predictor?',
    answer:
      'It is treated as a useful sanity check and format preview, not a precise predictor. See our [Free 120 guide](/blog/free-120-step-2-ck).',
  },
  {
    question: 'Can I over-test with practice exams?',
    answer:
      'Yes. Guides warn that more than six or seven full exams adds fatigue and noise. Use each result to change what you study.',
  },
  {
    question: 'Does MedPrep include NBME-style self-assessments?',
    answer:
      'No. MedPrep is adaptive daily practice with built-in spaced repetition. Use the official NBME assessments and UWSA for scored checks, and MedPrep to fix what they find.',
  },
];

const Body = () => (
  <>
    <p>
      "How many NBMEs should I take?" is one of the most common Step 2 CK questions, and there is no
      official answer. What we can do is pull together what prep guides and student forums agree on,
      tell you where the evidence is thin, and give you a schedule you can adapt.
    </p>

    <H2 section={S.short} />
    <p>
      Most sources land on about three to five full practice exams in total: two or three recent
      NBME forms, UWSA 2, and optionally UWSA 1 and the official{' '}
      <Link href="/blog/free-120-step-2-ck">Free 120</Link>. Guides also warn that taking more than
      six or seven tends to add fatigue and noise without adding information, since you are taking
      a test instead of fixing the weak areas it found.
    </p>

    <H2 section={S.which} />
    <ComparisonTable
      caption="Step 2 CK practice exams: what students and prep guides say"
      columns={[
        { key: 'exam', label: 'Exam' },
        { key: 'say', label: 'Commonly reported' },
      ]}
      rows={[
        { id: 'uwsa2', cells: { exam: 'UWSA 2', say: 'The most cited predictor; some students report it overpredicts slightly' } },
        { id: 'nbme', cells: { exam: 'Recent NBME forms', say: 'Close predictors, often a little conservative' } },
        { id: 'uwsa1', cells: { exam: 'UWSA 1', say: 'Useful, sometimes more optimistic than the real exam' } },
        { id: 'f120', cells: { exam: 'Free 120', say: 'A sanity check and format preview, not a precise predictor' } },
      ]}
      footnote="Based on prep guides and student forum discussions. We could not trace published correlation figures to a primary source, so we are not quoting any."
    />

    <H2 section={S.schedule} />
    <ul>
      <li><strong>6 to 10 weeks out:</strong> one recent NBME as a baseline, so you know the gap.</li>
      <li><strong>3 to 5 weeks out:</strong> a second NBME after you have fixed the first one's weak areas.</li>
      <li><strong>About a week out:</strong> UWSA 2, which sources commonly place 5 to 7 days before test day, not the day before.</li>
      <li><strong>Final days:</strong> taper. Review misses, sleep, and do not start another full exam.</li>
    </ul>
    <p>
      Spreading exams across the last 6 to 10 weeks works better than clustering them in the last
      two, because each result should change what you study.
    </p>    <PostCta
      heading="See if adaptive practice fits how you study"
      body="NBME-style vignettes, an engine that brings back the concepts you miss, and reviews scheduled for you."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.between} />
    <p>
      The exams measure; the weeks between them are where you improve. After each one, list the
      systems and concepts you missed and spend your next block of questions on exactly those. If
      you want that list built and re-tested for you, MedPrep's adaptive engine flags the concept
      behind each missed question and brings variations back over the following days. It does not
      include self-assessment exams, so pair it with the official NBME forms and UWSA for the
      scored checks.
    </p>

    <H2 section={S.read} />
    <ul>
      <li>Treat a score as a range, not a point.</li>
      <li>Look at the trend across exams more than any single result.</li>
      <li>Check the error pattern: knowledge gaps need review, timing problems need timed practice.</li>
      <li>Remember that fatigue and test conditions change results.</li>
    </ul>
    <p>
      For the bigger picture see our{' '}
      <Link href="/blog/step-2-ck-study-schedule">Step 2 CK study schedule</Link> and the{' '}
      <Link href="/blog/usmle-step-2-ck-score-percentile">score and percentile guide</Link>.
    </p>

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Fix what your practice exam found"
      body="Adaptive practice that brings missed concepts back on a schedule. 7-day free trial."
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
  slug: 'how-many-nbme-practice-exams-step-2-ck',
  title: 'How Many NBME Practice Exams Should You Take Before Step 2 CK? (And Which Ones)',
  seoTitle: 'How Many NBME Practice Exams Before Step 2 CK?',
  description:
    'How many NBME and UWSA practice exams to take before Step 2 CK, which are most predictive, when to take each, and how to use the weeks between them.',
  publishedAt: '2026-10-14T10:00:00+02:00',
  updatedAt: '2026-10-14T10:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  category: 'Study plans',
  keywords: [
    'how many NBME practice exams before Step 2 CK',
    'UWSA 2 vs NBME',
    'most predictive practice exam Step 2 CK',
    'Step 2 CK practice test schedule',
    'NBME vs UWSA',
  ],
  readingMinutes: 6,
  sections: Object.values(S),
  faqs,
  Body,
};
