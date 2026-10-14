import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=abim-syllabus`;

const S = {
  whatItIs: { id: 'what-the-blueprint-actually-is', title: 'What the ABIM blueprint actually is' },
  categories: { id: 'content-categories', title: 'The medical content category breakdown' },
  tasks: { id: 'physician-tasks', title: 'What the exam actually asks you to do' },
  crossCutting: { id: 'cross-cutting-topics', title: 'Cross-cutting topics woven throughout' },
  format: { id: 'exam-format', title: 'Exam format' },
  meaning: { id: 'what-this-means-for-your-studying', title: 'What this means for how you study' },
  faq: { id: 'faq', title: 'Frequently asked questions' },
  sources: { id: 'sources', title: 'Sources and disclaimers' },
} satisfies Record<string, BlogSection>;

const H2 = ({ section }: { section: BlogSection }) => <h2 id={section.id}>{section.title}</h2>;

const faqs: BlogFaq[] = [
  {
    question: 'Is "blueprint" the same thing as "syllabus" or "content outline"?',
    answer:
      'Close enough for practical purposes. ABIM’s own term is the Internal Medicine Blueprint. The USMLE Steps use the term Content Outline and Specifications for the same kind of document; most students call either one the syllabus or the blueprint.',
  },
  {
    question: 'What is the single most heavily tested category on the ABIM exam?',
    answer:
      'Cardiovascular Disease, at 14% of the exam, the largest single category by several percentage points over the next tier.',
  },
  {
    question: 'Does ABIM publish a physician task percentage breakdown like the USMLE Steps?',
    answer:
      'No. ABIM lists the kinds of reasoning questions test, diagnosis, test interpretation, treatment, risk and prognosis, and pathophysiology, but does not assign a published percentage to each the way the USMLE Step content outlines do.',
  },
  {
    question: 'How is this different from the USMLE Step 3 syllabus?',
    answer:
      'Step 3 spans every specialty and classifies questions by both organ system and physician task, with published percentages for each. The ABIM blueprint is internal medicine only, and publishes percentages for medical content categories alone. See our [USMLE Step 3 syllabus guide](/blog/usmle-step-3-syllabus) for that comparison.',
  },
  {
    question: 'Which ABIM question bank should I use?',
    answer:
      'See our [ABIM question bank comparison](/blog/top-abim-question-banks) for verified prices and a full breakdown of UWorld, MKSAP, AMBOSS, TrueLearn and BoardVitals.',
  },
  {
    question: 'Does the blueprint ever change?',
    answer:
      'Yes. ABIM reviews and updates it annually based on surveys of trainees, program directors and certified practitioners, so treat the figures here as a snapshot and confirm the current blueprint directly on ABIM.org before building a study plan around exact percentages.',
  },
];

const Body = () => (
  <>
    <p>
      &ldquo;Syllabus&rdquo; isn&rsquo;t ABIM&rsquo;s own term either, but it&rsquo;s what most
      residents mean when they ask what the Internal Medicine Certification Exam actually covers.
      The real document is the ABIM Internal Medicine Blueprint, published directly by the American
      Board of Internal Medicine, and it breaks the exam down by eighteen medical content
      categories, each with an exact percentage of the exam. This guide walks through the full
      table, plus the exam format and the kind of reasoning each question is testing.
    </p>

    <H2 section={S.whatItIs} />
    <p>
      Unlike the USMLE Steps, which classify questions along two or three separate axes at once
      (system, discipline, physician task), the ABIM blueprint publishes exact percentages along a
      single axis: medical content category. ABIM reviews and updates the blueprint annually, and
      each major category can be expanded into subsection topics, though ABIM does not publish
      exact percentages below the roughly eighteen major categories, only a general indicator of
      which subsections are more or less heavily tested within a category.
    </p>
    <Callout title="These percentages describe a typical exam, not every exam" tone="disclosure">
      <p>
        ABIM&rsquo;s own blueprint documentation notes that the percentages below describe the
        content of a typical exam and are approximate; actual exam content can vary from one
        administration to the next.
      </p>
    </Callout>

    <H2 section={S.categories} />
    <p>
      The category breakdown tells you which medical content areas get the most questions.
      Cardiovascular Disease is the single largest category by a wide margin.
    </p>
    <ComparisonTable
      caption="ABIM Internal Medicine blueprint: medical content categories"
      columns={[
        { key: 'category', label: 'Medical content category' },
        { key: 'range', label: 'Percentage of exam' },
      ]}
      rows={[
        { id: 'cardio', featured: true, cells: { category: 'Cardiovascular Disease', range: '14%' } },
        { id: 'endo', cells: { category: 'Endocrinology, Diabetes, and Metabolism', range: '9%' } },
        { id: 'gi', cells: { category: 'Gastroenterology', range: '9%' } },
        { id: 'id', cells: { category: 'Infectious Disease', range: '9%' } },
        { id: 'pulm', cells: { category: 'Pulmonary Disease', range: '9%' } },
        { id: 'rheum', cells: { category: 'Rheumatology and Orthopedics', range: '9%' } },
        { id: 'heme', cells: { category: 'Hematology', range: '6%' } },
        { id: 'nephro', cells: { category: 'Nephrology and Urology', range: '6%' } },
        { id: 'onc', cells: { category: 'Medical Oncology', range: '6%' } },
        { id: 'neuro', cells: { category: 'Neurology', range: '4%' } },
        { id: 'psych', cells: { category: 'Psychiatry', range: '4%' } },
        { id: 'derm', cells: { category: 'Dermatology', range: '3%' } },
        { id: 'obgyn', cells: { category: 'Obstetrics and Gynecology', range: '3%' } },
        { id: 'geri', cells: { category: 'Geriatric Syndromes', range: '3%' } },
        { id: 'allergy', cells: { category: 'Allergy and Immunology', range: '2%' } },
        { id: 'misc', cells: { category: 'Miscellaneous', range: '2%' } },
        { id: 'ophtho', cells: { category: 'Ophthalmology', range: '1%' } },
        { id: 'ent', cells: { category: 'Otolaryngology and Dental Medicine', range: '1%' } },
      ]}
      footnote="Figures are ABIM's official percentages for a typical exam, totaling 100%. Cardiovascular Disease alone carries as much weight as the two smallest categories combined many times over."
    />

    <H2 section={S.tasks} />
    <p>
      ABIM does not publish a percentage breakdown by physician task the way the USMLE Steps do.
      Instead, the blueprint describes the kinds of work most questions ask you to do, across every
      content category:
    </p>
    <ul>
      <li>Making a diagnosis</li>
      <li>Ordering and interpreting results of tests</li>
      <li>Recommending treatment or other patient care</li>
      <li>Assessing risk, determining prognosis, and applying principles from epidemiologic studies</li>
      <li>Understanding the underlying pathophysiology of disease and basic science knowledge applicable to patient care</li>
    </ul>
    <p>
      Clinical information presented may include patient photographs, radiographs, electrocardiograms,
      and recordings of heart or lung sounds, so practice shouldn&rsquo;t be limited to text-only
      vignettes.
    </p>

    <H2 section={S.crossCutting} />
    <p>
      Beyond the eighteen named categories, ABIM notes that questions in any category may also
      draw on cross-cutting topics that don&rsquo;t get their own line in the blueprint: Critical
      Care Medicine, Prevention, Clinical Epidemiology, Ethics, Nutrition, Palliative and
      End-of-Life Care, Adolescent Medicine, Occupational Medicine, Patient Safety and Substance
      Abuse. Health equity content that is clinically important to a given discipline is included
      as well. None of these carry a published standalone percentage; they&rsquo;re woven into
      questions from the eighteen categories above rather than tested separately.
    </p>

    <H2 section={S.format} />
    <p>
      The exam is composed of up to 240 single-best-answer multiple-choice questions, of which
      approximately 35 are unscored pilot questions that do not count toward your score. It is
      computer-based, given once a year, typically in August, at Pearson VUE test centers across
      four timed sessions. Exact counts, format and dates are set by ABIM and can change, so check{' '}
      <a href="https://www.abim.org/" target="_blank" rel="noopener noreferrer">
        ABIM.org
      </a>{' '}
      for the current exam structure before you plan around it.
    </p>

    <H2 section={S.meaning} />
    <p>
      Three things stand out once you see the actual numbers instead of guessing at them.
    </p>
    <ul>
      <li>
        <strong>Cardiovascular Disease deserves disproportionate review time.</strong> At 14% of
        the exam, it&rsquo;s the single largest category, well ahead of the next tier of five
        categories that each sit at 9%. If your review time is limited, depth in cardiovascular
        disease pays off more than depth anywhere else.
      </li>
      <li>
        <strong>The middle of the blueprint is flat, not spiky.</strong> Five separate categories,
        endocrinology, gastroenterology, infectious disease, pulmonary disease, and rheumatology and
        orthopedics, all sit at exactly 9%. None of them can be safely deprioritized relative to the
        others.
      </li>
      <li>
        <strong>The exam leans on judgment, not pure recall.</strong> The five physician tasks ABIM
        lists, diagnosis, test interpretation, treatment, risk/prognosis, and pathophysiology, mirror
        what a practicing internist actually does day to day, which is why clinical experience during
        residency already covers a real share of the blueprint before you open a single practice
        question.
      </li>
    </ul>
    <p>
      If you want a full study plan built around your final year of residency, our{' '}
      <Link href="/blog/abim-study-guide">ABIM study guide</Link> includes a sample schedule and
      daily routine, and if you&rsquo;re earlier in training, our{' '}
      <Link href="/blog/usmle-step-3-syllabus">USMLE Step 3 syllabus guide</Link> covers the exam
      most residents take right before this one.
    </p>
    <PostCta
      heading="Practice across every category on the ABIM blueprint"
      body="Internal medicine vignettes with an adaptive engine that targets your weak spots, built-in spaced repetition, and physician-reviewed explanations."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try the ABIM Qbank free for 7 days"
      body="Coverage across every category on the official blueprint, weighted toward whatever you keep missing."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Percentages are taken directly from the ABIM Internal Medicine Blueprint, Certification
      Examination (CERT), published by the American Board of Internal Medicine at{' '}
      <a href="https://www.abim.org/about/abim-exams/blueprints/" target="_blank" rel="noopener noreferrer">
        abim.org
      </a>
      , checked on October 1, 2026. These figures are set by ABIM and can change, so confirm the
      current blueprint directly on ABIM.org before relying on it for exam preparation. MedPrep
      Institute is not affiliated with or endorsed by ABIM, NBME, FSMB or USMLE. All trademarks
      belong to their owners.
    </p>
  </>
);

export const post: BlogPost = {
  slug: 'abim-syllabus',
  title: 'ABIM Internal Medicine Syllabus: The Complete Blueprint',
  seoTitle: 'ABIM Syllabus and Exam Blueprint',
  description:
    'The official ABIM Internal Medicine Certification Exam blueprint broken down by all 18 medical content categories, with exact percentages from ABIM.org.',
  publishedAt: '2026-10-01T20:00:00+02:00',
  updatedAt: '2026-10-01T20:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Electrocardiogram tracing with pencil and protractor, downloaded from Unsplash (free to use
  // under the Unsplash License): https://images.unsplash.com/photo-1755287066058-80c68aaaf0e3
  heroImage: '/blog/abim-syllabus-hero.jpg',
  category: 'Study strategy',
  keywords: [
    'ABIM syllabus',
    'ABIM blueprint',
    'ABIM content outline',
    'ABIM exam categories',
    'what does ABIM cover',
    'ABIM internal medicine topics',
  ],
  readingMinutes: 8,
  sections: Object.values(S),
  faqs,
  Body,
};
