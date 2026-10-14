import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=usmle-step-3-syllabus`;

const S = {
  whatItIs: { id: 'what-the-syllabus-actually-is', title: "What the Step 3 syllabus actually is" },
  systems: { id: 'systems-breakdown', title: 'The systems breakdown' },
  tasks: { id: 'physician-tasks-breakdown', title: 'The physician task breakdown' },
  ccs: { id: 'ccs-and-the-content-outline', title: 'Where CCS fits into the content outline' },
  meaning: { id: 'what-this-means-for-your-studying', title: 'What this means for how you study' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Is "content outline" the same thing as "syllabus"?',
    answer:
      'Close enough for practical purposes. USMLE’s own term is the Content Outline and Specifications, published by the NBME and FSMB. Most students just call it the syllabus or the blueprint.',
  },
  {
    question: 'Why do the percentages in different tables not add up to 100% together?',
    answer:
      'Because systems and physician tasks are two separate, overlapping ways of classifying the same set of multiple-choice questions, not two different sets of questions. Each table sums to roughly 100% on its own.',
  },
  {
    question: 'What is the single most heavily tested system on Step 3?',
    answer:
      'Biostatistics & Epidemiology/Population Health & Interpretation of the Medical Literature, at 11 to 13%, though the spread across systems is relatively flat, so no single system dominates the way diagnosis and management dominate the physician task axis.',
  },
  {
    question: 'Does the content outline tell you how much CCS is worth?',
    answer:
      'No. The official outline lists which systems the case simulations cover but does not publish a percentage weighting for CCS, unlike the systems and physician task tables above.',
  },
  {
    question: 'How is this different from the Step 1 and Step 2 CK syllabus?',
    answer:
      'Step 3 drops Step 1’s discipline axis and Step 2 CK’s clinical science axis entirely, leaving only systems and physician tasks. The task axis also shifts dramatically: Diagnosis and Management together make up roughly two-thirds of Step 3, compared to 20 to 25% for diagnosis alone on Step 1. See our [Step 1 syllabus guide](/blog/usmle-step-1-syllabus) and [Step 2 CK syllabus guide](/blog/usmle-step-2-ck-syllabus) for the full comparison.',
  },
  {
    question: 'What about after Step 3? Does ABIM publish a similar blueprint?',
    answer:
      'Yes. See our [ABIM syllabus guide](/blog/abim-syllabus) for the Internal Medicine Certification Exam blueprint most residents take after Step 3, which uses a single medical-content-category axis instead of Step 3’s system and physician task axes.',
  },
  {
    question: 'Does the content outline ever change?',
    answer:
      'The NBME and FSMB can update it, so treat the figures here as a snapshot and confirm the current outline directly on USMLE.org before building a study plan around exact percentages.',
  },
];

const Body = () => (
  <>
    <p>
      &ldquo;Syllabus&rdquo; isn&rsquo;t the official term, but it&rsquo;s what most students mean
      when they ask what Step 3 actually covers. The real document is the USMLE Step 3 Content
      Outline and Specifications, published directly by the NBME and FSMB, and it breaks the
      multiple-choice portion of the exam down two different ways at once: by organ system and by
      physician task. This guide walks through both, with the exact percentage ranges from the
      official outline.
    </p>

    <H2 section={S.whatItIs} />
    <p>
      Every Step 3 multiple-choice question is tagged along two separate axes simultaneously: a{' '}
      <strong>system</strong> (which organ system or process the question is about) and a{' '}
      <strong>physician task</strong> (what kind of reasoning it&rsquo;s testing, like diagnosis
      versus management). The content outline covers both Day 1 (Foundations of Independent
      Practice) and Day 2 (Advanced Clinical Medicine) MCQ sessions combined; it does not assign a
      published percentage to the separate CCS case simulations on Day 2, which is covered
      separately below.
    </p>
    <Callout title="The percentages in each table do not need to add up with each other" tone="disclosure">
      <p>
        Systems sum to roughly 100% on their own, and physician tasks sum to roughly 100% on their
        own, because they are two separate ways of slicing the same multiple-choice question pool,
        not two different question pools. Do not try to add a system percentage to a physician
        task percentage.
      </p>
    </Callout>

    <H2 section={S.systems} />
    <p>
      The system breakdown tells you which organ systems and processes get the most questions
      across both MCQ sessions, regardless of what kind of reasoning each question is testing.
    </p>
    <ComparisonTable
      caption="USMLE Step 3 content outline: systems"
      columns={[
        { key: 'system', label: 'System' },
        { key: 'range', label: 'Percentage of exam' },
      ]}
      rows={[
        {
          id: 'biostat',
          featured: true,
          cells: {
            system: 'Biostatistics & Epidemiology/Population Health & Interpretation of the Medical Literature',
            range: '11-13%',
          },
        },
        { id: 'cardio', cells: { system: 'Cardiovascular System', range: '9-11%' } },
        { id: 'resp', cells: { system: 'Respiratory System', range: '8-10%' } },
        { id: 'nervous', cells: { system: 'Nervous System & Special Senses', range: '8-10%' } },
        { id: 'social', cells: { system: 'Social Sciences: Communication Skills, Ethics & Patient Safety', range: '7-9%' } },
        { id: 'preg', cells: { system: 'Pregnancy, Childbirth & the Puerperium, and Female Reproductive System & Breast', range: '7-9%' } },
        { id: 'gi', cells: { system: 'Gastrointestinal System', range: '6-8%' } },
        { id: 'immune', cells: { system: 'Immune System, Blood & Lymphoreticular System, and Multisystem Processes & Disorders', range: '6-8%' } },
        { id: 'endo', cells: { system: 'Endocrine System', range: '5-7%' } },
        { id: 'msk', cells: { system: 'Musculoskeletal System', range: '5-7%' } },
        { id: 'renal', cells: { system: 'Renal/Urinary System & Male Reproductive System', range: '4-6%' } },
        { id: 'skin', cells: { system: 'Skin & Subcutaneous Tissue', range: '4-6%' } },
        { id: 'behavioral', cells: { system: 'Behavioral Health', range: '4-6%' } },
        { id: 'human-dev', cells: { system: 'Human Development', range: '1-3%' } },
      ]}
      footnote="Ranges are the official NBME/FSMB figures for the combined Day 1 and Day 2 MCQ sessions. Biostatistics & Epidemiology carries the single largest range of any system category on Step 3."
    />

    <H2 section={S.tasks} />
    <p>
      The physician task breakdown tells you what kind of thinking a question is actually asking
      you to do, and it looks very different from Step 1 and Step 2 CK: diagnosis and management
      together make up roughly two-thirds of the exam.
    </p>
    <ComparisonTable
      caption="USMLE Step 3 content outline: physician tasks"
      columns={[
        { key: 'task', label: 'Physician task' },
        { key: 'range', label: 'Percentage of exam' },
      ]}
      rows={[
        { id: 'diagnosis', featured: true, cells: { task: 'Patient Care: Diagnosis', range: '33-36%' } },
        { id: 'management', cells: { task: 'Patient Care: Management', range: '32-35%' } },
        { id: 'practice-based', cells: { task: 'Practice-based Learning & Improvement', range: '11-13%' } },
        { id: 'medical-knowledge', cells: { task: 'Medical Knowledge: Applying Foundational Science Concepts', range: '11-12%' } },
        { id: 'communication', cells: { task: 'Communication, Professionalism, Systems-based Practice & Patient Safety', range: '7-9%' } },
      ]}
      footnote="Diagnosis and management together account for roughly two out of every three questions, the inverse of Step 1, where foundational science applying alone made up 60 to 70% of the exam."
    />

    <H2 section={S.ccs} />
    <p>
      Day 2 of Step 3 also includes Computer-based Case Simulations (CCS), where you manage a
      simulated patient in real time instead of answering discrete multiple-choice items. The
      official content outline does not publish a percentage weighting for CCS the way it does for
      systems and physician tasks; it only lists which systems the case simulations draw from,
      without an associated range. Budget dedicated CCS practice time separately from your
      MCQ-focused review, since the breakdown above doesn&rsquo;t capture it.
    </p>

    <H2 section={S.meaning} />
    <p>
      Three things stand out once you see the actual numbers instead of guessing at them.
    </p>
    <ul>
      <li>
        <strong>Step 3 is management-heavy, not knowledge-recall-heavy.</strong> Diagnosis and
        management together make up roughly two-thirds of the exam, while applying foundational
        science concepts drops to just 11 to 13%, a near-total reversal from Step 1&rsquo;s 60 to
        70%. Practice questions that ask &ldquo;what do you do next,&rdquo; not just &ldquo;what is
        the diagnosis,&rdquo; deserve the bulk of your review time.
      </li>
      <li>
        <strong>No single organ system dominates.</strong> The highest system category,
        Biostatistics &amp; Epidemiology, tops out at 13%, and the spread across the remaining
        thirteen system categories is relatively flat. Skipping an entire system is a riskier bet
        than skipping depth in any single smaller category.
      </li>
      <li>
        <strong>CCS needs its own study block.</strong> Because it carries no published percentage
        weighting, it&rsquo;s easy to under-allocate time to it. Treat case simulation practice as a
        separate line item in your schedule, not something you&rsquo;ll pick up automatically from
        MCQ review.
      </li>
    </ul>
    <p>
      If you want a week-by-week plan that actually reflects this weighting, our{' '}
      <Link href="/blog/usmle-step-3-study-guide">Step 3 study guide</Link> includes a sample
      schedule, and our{' '}
      <Link href="/blog/usmle-step-3-exam-dates-2026">Step 3 exam dates guide</Link> covers
      scheduling and registration logistics that the content outline does not.
    </p>
    <PostCta
      heading="Practice across every system and physician task on this outline"
      body="NBME-style vignettes with an adaptive engine that targets your weak spots, built-in spaced repetition, and physician-reviewed explanations."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try the adaptive Step 3 Qbank free for 7 days"
      body="Coverage across every system and physician task on the official outline, weighted toward whatever you keep missing."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Percentage ranges are taken directly from the USMLE Step 3 Content Outline and
      Specifications, published by the NBME and FSMB at{' '}
      <a href="https://www.usmle.org/exam-resources/step-3-materials/step-3-content-outline-and-specifications" target="_blank" rel="noopener noreferrer">
        usmle.org
      </a>
      , checked on October 1, 2026. These figures are set by the USMLE program and can change, so
      confirm the current outline directly on USMLE.org before relying on it for exam preparation.
      MedPrep Institute is not affiliated with or endorsed by NBME, FSMB or USMLE. All trademarks
      belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'usmle-step-3-syllabus',
  title: 'USMLE Step 3 Syllabus: The Complete Content Outline',
  seoTitle: 'USMLE Step 3 Syllabus and Content Outline',
  description:
    'The official USMLE Step 3 content outline broken down by system and physician task, plus where CCS fits in, with exact percentage ranges from USMLE.org.',
  publishedAt: '2026-10-01T19:00:00+02:00',
  updatedAt: '2026-10-01T19:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Pencil resting on a multiple-choice answer sheet, downloaded from Unsplash (free to use
  // under the Unsplash License): https://images.unsplash.com/photo-1606326608690-4e0281b1e588
  heroImage: '/blog/usmle-step-3-syllabus-hero.jpg',
  category: 'Study strategy',
  keywords: [
    'USMLE Step 3 syllabus',
    'USMLE Step 3 content outline',
    'Step 3 exam blueprint',
    'Step 3 systems and physician tasks',
    'what does Step 3 cover',
    'USMLE Step 3 topics',
  ],
  readingMinutes: 8,
  sections: Object.values(S),
  faqs,
  Body,
};
