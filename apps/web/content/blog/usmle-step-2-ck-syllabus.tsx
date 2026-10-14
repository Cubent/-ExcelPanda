import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=usmle-step-2-ck-syllabus`;

const S = {
  whatItIs: { id: 'what-the-syllabus-actually-is', title: 'What the Step 2 CK syllabus actually is' },
  systems: { id: 'systems-breakdown', title: 'The systems breakdown' },
  clinicalScience: { id: 'clinical-science-breakdown', title: 'The clinical science breakdown' },
  tasks: { id: 'physician-tasks-breakdown', title: 'The physician task breakdown' },
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
      'Because content areas, clinical sciences and physician tasks are three separate, overlapping ways of classifying the same set of questions, not three different sets of questions. Each table sums to roughly 100% on its own.',
  },
  {
    question: 'What is the single most heavily tested clinical science on Step 2 CK?',
    answer:
      'Medicine, at 55 to 65% of the exam, by a wide margin over Pediatrics, Obstetrics & Gynecology, Psychiatry and Surgery.',
  },
  {
    question: 'What is the single most heavily tested content area on Step 2 CK?',
    answer:
      'Nutrition, at 15 to 20%, though the spread across content areas is much flatter than the spread across clinical sciences, so no single area dominates the way Medicine does.',
  },
  {
    question: 'How is this different from the Step 1 syllabus?',
    answer:
      'Step 2 CK replaces Step 1’s discipline axis (Pathology, Physiology, Pharmacology, and so on) with a clinical science axis organized by rotation (Medicine, Pediatrics, OB/GYN, Psychiatry, Surgery), and its physician task list is far more granular, split across ten specific patient-care categories instead of Step 1’s four. See our [Step 1 syllabus guide](/blog/usmle-step-1-syllabus) for that breakdown.',
  },
  {
    question: 'What about the Step 3 syllabus?',
    answer:
      'See our [Step 3 syllabus guide](/blog/usmle-step-3-syllabus) for the same breakdown applied to Step 3, which drops the clinical science axis entirely and shifts heavily toward diagnosis and management instead of foundational science.',
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
      when they ask what Step 2 CK actually covers. The real document is the USMLE Step 2 CK
      Content Outline, published directly by the NBME and FSMB, and it breaks the exam down three
      different ways at once: by content area, by clinical science (rotation), and by physician
      task. This guide walks through all three, with the exact percentage ranges from the official
      outline.
    </p>

    <H2 section={S.whatItIs} />
    <p>
      Every Step 2 CK question is tagged along three separate axes simultaneously: a{' '}
      <strong>content area</strong> (an organ system or a cross-cutting area like Nutrition or
      Social Sciences), a <strong>clinical science</strong> (which core rotation the scenario comes
      from), and a <strong>physician task</strong> (what kind of clinical reasoning or management
      decision it&rsquo;s testing). A single question about managing a patient with new atrial
      fibrillation could count toward the cardiovascular system, Medicine as a clinical science,
      and pharmacotherapy as a physician task, all at once.
    </p>
    <Callout title="The percentages in each table do not need to add up with each other" tone="disclosure">
      <p>
        Content areas sum to roughly 100% on their own, clinical sciences sum to roughly 100% on
        their own, and physician tasks sum to roughly 100% on their own, because they are three
        separate, overlapping ways of classifying the same question pool, not three different
        question pools. Do not try to add a content area percentage to a clinical science
        percentage.
      </p>
    </Callout>

    <H2 section={S.systems} />
    <p>
      The content area breakdown tells you which organ systems and cross-cutting areas get the
      most questions, regardless of which rotation the scenario is drawn from.
    </p>
    <ComparisonTable
      caption="USMLE Step 2 CK content outline: content areas"
      columns={[
        { key: 'area', label: 'Content area' },
        { key: 'range', label: 'Percentage of exam' },
      ]}
      rows={[
        { id: 'nutrition', featured: true, cells: { area: 'Nutrition', range: '15-20%' } },
        {
          id: 'social',
          cells: {
            area: 'Social Sciences: Legal/Ethical Issues & Professionalism/Systems-based Practice & Patient Safety',
            range: '10-15%',
          },
        },
        { id: 'renal-repro', cells: { area: 'Renal & Urinary System & Reproductive Systems', range: '7-13%' } },
        { id: 'cardio', cells: { area: 'Cardiovascular System', range: '6-12%' } },
        { id: 'msk-skin', cells: { area: 'Musculoskeletal System/Skin & Subcutaneous Tissue', range: '6-12%' } },
        { id: 'behavioral', cells: { area: 'Behavioral Health', range: '5-10%' } },
        { id: 'blood-immune', cells: { area: 'Blood & Lymphoreticular/Immune Systems', range: '5-10%' } },
        { id: 'gi', cells: { area: 'Gastrointestinal System', range: '5-10%' } },
        { id: 'nervous', cells: { area: 'Nervous System & Special Senses', range: '5-10%' } },
        { id: 'resp', cells: { area: 'Respiratory System', range: '5-10%' } },
        { id: 'multisystem', cells: { area: 'Multisystem Processes & Disorders', range: '4-8%' } },
        { id: 'endocrine', cells: { area: 'Endocrine System', range: '3-7%' } },
        { id: 'pregnancy', cells: { area: 'Pregnancy, Childbirth & the Puerperium', range: '3-7%' } },
        {
          id: 'biostat',
          cells: {
            area: 'Biostatistics & Epidemiology/Population Health/Interpretation of Medical Literature',
            range: '3-5%',
          },
        },
        { id: 'human-dev', cells: { area: 'Human Development', range: '2-4%' } },
      ]}
      footnote="Ranges are the official NBME/FSMB figures. Nutrition carries the single largest range of any content area."
    />

    <H2 section={S.clinicalScience} />
    <p>
      The clinical science breakdown tells you which core clerkship a question&rsquo;s scenario is
      drawn from, independent of which organ system or content area it touches.
    </p>
    <ComparisonTable
      caption="USMLE Step 2 CK content outline: clinical science"
      columns={[
        { key: 'science', label: 'Clinical science' },
        { key: 'range', label: 'Percentage of exam' },
      ]}
      rows={[
        { id: 'medicine', featured: true, cells: { science: 'Medicine', range: '55-65%' } },
        { id: 'peds', cells: { science: 'Pediatrics', range: '17-27%' } },
        { id: 'obgyn', cells: { science: 'Obstetrics & Gynecology', range: '10-20%' } },
        { id: 'psych', cells: { science: 'Psychiatry', range: '10-15%' } },
        { id: 'surgery', cells: { science: 'Surgery', range: '5-15%' } },
      ]}
      footnote="Medicine alone can account for well over half the exam, by a wide margin over any other single rotation."
    />

    <H2 section={S.tasks} />
    <p>
      The physician task breakdown tells you what kind of clinical decision a question is actually
      asking you to make, separate from the subject matter or rotation entirely. Step 2 CK&rsquo;s
      task list is far more granular than Step 1&rsquo;s, reflecting its heavier emphasis on
      patient management.
    </p>
    <ComparisonTable
      caption="USMLE Step 2 CK content outline: physician tasks"
      columns={[
        { key: 'task', label: 'Physician task' },
        { key: 'range', label: 'Percentage of exam' },
      ]}
      rows={[
        { id: 'diagnosis', featured: true, cells: { task: 'Patient Care: Diagnosis', range: '16-20%' } },
        { id: 'labs', cells: { task: 'Patient Care: Laboratory/Diagnostic Studies', range: '13-17%' } },
        { id: 'mixed', cells: { task: 'Patient Care: Mixed Management', range: '12-16%' } },
        { id: 'pharm', cells: { task: 'Patient Care: Pharmacotherapy', range: '8-12%' } },
        { id: 'interventions', cells: { task: 'Patient Care: Clinical Interventions', range: '6-10%' } },
        { id: 'prevention', cells: { task: 'Patient Care: Health Maintenance/Disease Prevention', range: '5-10%' } },
        { id: 'prognosis', cells: { task: 'Patient Care: Prognosis/Outcome', range: '5-9%' } },
        { id: 'systems', cells: { task: 'Systems-based Practice & Patient Safety', range: '5-7%' } },
        { id: 'professionalism', cells: { task: 'Professionalism', range: '5-7%' } },
        { id: 'practice-based', cells: { task: 'Practice-based Learning & Improvement', range: '3-5%' } },
      ]}
      footnote="Diagnosis, lab/diagnostic interpretation and mixed management together make up roughly 40-53% of the exam, the three largest task categories by a clear margin."
    />

    <H2 section={S.meaning} />
    <p>
      Three things stand out once you see the actual numbers instead of guessing at them.
    </p>
    <ul>
      <li>
        <strong>Medicine dominates the clinical science axis.</strong> At 55 to 65%, internal
        medicine-style reasoning underlies well over half the exam, regardless of which content
        area a given question is attached to. If your review time is limited, depth in medicine
        pays off more than depth in any single other rotation.
      </li>
      <li>
        <strong>No single content area dominates the way Medicine dominates clinical sciences.</strong>{' '}
        The highest content area, Nutrition, tops out at 20%, and the spread across content areas
        is much flatter than the spread across clinical sciences. Skipping an entire rotation like
        Surgery or Psychiatry is a riskier bet than skipping depth in a smaller content area.
      </li>
      <li>
        <strong>Diagnosis and data interpretation outweigh pure management.</strong> Patient Care:
        Diagnosis and Laboratory/Diagnostic Studies together can account for close to a third of
        the exam, ahead of Mixed Management and Pharmacotherapy combined. Knowing the next
        diagnostic step matters at least as much as knowing the treatment.
      </li>
    </ul>
    <p>
      If you want a schedule that reflects this weighting, our{' '}
      <Link href="/blog/usmle-step-2-ck-study-guide">Step 2 CK study guide</Link> includes a sample
      four-week dedicated plan, and our{' '}
      <Link href="/blog/usmle-step-2-ck-exam-dates-2026">Step 2 CK exam dates guide</Link> covers
      registration, scheduling and the 2026 format change.
    </p>
    <PostCta
      heading="Practice across every system and rotation on this outline"
      body="NBME-style clinical vignettes with an adaptive engine that targets your weak spots, built-in spaced repetition, and physician-reviewed explanations."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try the adaptive Step 2 CK Qbank free for 7 days"
      body="Coverage across every content area and rotation on the official outline, weighted toward whatever you keep missing."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Percentage ranges are taken directly from the USMLE Step 2 CK Content Outline and
      Specifications, published by the NBME and FSMB at{' '}
      <a href="https://www.usmle.org/exam-resources/step-2-ck-materials/step-2-ck-content-outline-specifications" target="_blank" rel="noopener noreferrer">
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
  slug: 'usmle-step-2-ck-syllabus',
  title: 'USMLE Step 2 CK Syllabus: The Complete Content Outline',
  seoTitle: 'USMLE Step 2 CK Syllabus and Content Outline',
  description:
    'The official USMLE Step 2 CK content outline broken down by content area, clinical science and physician task, with exact percentage ranges from USMLE.org.',
  publishedAt: '2026-10-01T20:00:00+02:00',
  updatedAt: '2026-10-01T20:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Organized sticky notes on a desk, downloaded from Unsplash (free to use under the Unsplash
  // License): https://images.unsplash.com/photo-1586892477838-2b96e85e0f96
  heroImage: '/blog/usmle-step-2-ck-syllabus-hero.jpg',
  category: 'Study strategy',
  keywords: [
    'USMLE Step 2 CK syllabus',
    'USMLE Step 2 CK content outline',
    'Step 2 CK exam blueprint',
    'Step 2 CK clinical science breakdown',
    'what does Step 2 CK cover',
    'USMLE Step 2 CK topics',
  ],
  readingMinutes: 9,
  sections: Object.values(S),
  faqs,
  Body,
};
