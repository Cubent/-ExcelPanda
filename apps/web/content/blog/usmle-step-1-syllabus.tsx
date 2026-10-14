import { Callout } from '@/components/blog/callout';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqList } from '@/components/blog/faq-list';
import { PostCta } from '@/components/blog/post-cta';
import Link from 'next/link';
import type { BlogFaq, BlogPost, BlogSection } from './types';

const signup = (medium: string) =>
  `/sign-up?utm_source=blog&utm_medium=${medium}&utm_campaign=usmle-step-1-syllabus`;

const S = {
  whatItIs: { id: 'what-the-syllabus-actually-is', title: "What the Step 1 syllabus actually is" },
  systems: { id: 'systems-breakdown', title: 'The systems breakdown' },
  disciplines: { id: 'disciplines-breakdown', title: 'The disciplines breakdown' },
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
      'Because systems, disciplines and physician tasks are three separate, overlapping ways of classifying the same set of questions, not three different sets of questions. Each table sums to roughly 100% on its own.',
  },
  {
    question: 'What is the single most heavily tested discipline on Step 1?',
    answer:
      'Pathology, at 45 to 55% of the exam, by a wide margin over every other discipline on the official outline.',
  },
  {
    question: 'What is the single most heavily tested organ system on Step 1?',
    answer:
      'Reproductive & Endocrine Systems, at 12 to 16%, though the spread across systems is much flatter than the spread across disciplines, so no single system dominates the way Pathology does.',
  },
  {
    question: 'What about the Step 2 CK syllabus?',
    answer:
      'See our [Step 2 CK syllabus guide](/blog/usmle-step-2-ck-syllabus) for the same breakdown applied to Step 2 CK, which replaces Step 1’s discipline axis with a clinical science axis organized by rotation.',
  },
  {
    question: 'What about the Step 3 syllabus?',
    answer:
      'See our [Step 3 syllabus guide](/blog/usmle-step-3-syllabus) for the same breakdown applied to Step 3, which drops the discipline axis entirely and shifts heavily toward diagnosis and management instead of foundational science.',
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
      when they ask what Step 1 actually covers. The real document is the USMLE Step 1 Content
      Outline, published directly by the NBME and FSMB, and it breaks the exam down three
      different ways at once: by organ system, by discipline, and by physician task. This guide
      walks through all three, with the exact percentage ranges from the official outline.
    </p>

    <H2 section={S.whatItIs} />
    <p>
      Every Step 1 question is tagged along three separate axes simultaneously: a <strong>system</strong>{' '}
      (which organ system or process the question is about), a <strong>discipline</strong> (which
      basic science field it draws on), and a <strong>physician task</strong> (what kind of
      reasoning it&rsquo;s testing). A single cardiology question about a drug&rsquo;s mechanism
      could count toward the cardiovascular system, pharmacology as a discipline, and medical
      knowledge as a task, all at once.
    </p>
    <Callout title="The percentages in each table do not need to add up with each other" tone="disclosure">
      <p>
        Systems sum to roughly 100% on their own, disciplines sum to roughly 100% on their own, and
        physician tasks sum to roughly 100% on their own, because they are three separate ways of
        slicing the same question pool, not three different question pools. Do not try to add a
        system percentage to a discipline percentage.
      </p>
    </Callout>

    <H2 section={S.systems} />
    <p>
      The system breakdown tells you which organ systems and processes get the most questions,
      regardless of what discipline the question is drawing from.
    </p>
    <ComparisonTable
      caption="USMLE Step 1 content outline: systems"
      columns={[
        { key: 'system', label: 'System' },
        { key: 'range', label: 'Percentage of exam' },
      ]}
      rows={[
        { id: 'repro-endo', featured: true, cells: { system: 'Reproductive & Endocrine Systems', range: '12-16%' } },
        { id: 'resp-renal', cells: { system: 'Respiratory & Renal/Urinary Systems', range: '11-15%' } },
        { id: 'behav-nervous', cells: { system: 'Behavioral Health & Nervous Systems/Special Senses', range: '10-14%' } },
        { id: 'blood-immune', cells: { system: 'Blood & Lymphoreticular/Immune Systems', range: '9-13%' } },
        { id: 'msk-skin', cells: { system: 'Musculoskeletal, Skin & Subcutaneous Tissue', range: '8-12%' } },
        { id: 'multisystem', cells: { system: 'Multisystem Processes & Disorders', range: '8-12%' } },
        { id: 'cardio', cells: { system: 'Cardiovascular System', range: '7-11%' } },
        { id: 'social', cells: { system: 'Social Sciences: Communication & Interpersonal Skills', range: '6-9%' } },
        { id: 'gi', cells: { system: 'Gastrointestinal System', range: '6-10%' } },
        { id: 'biostat', cells: { system: 'Biostatistics & Epidemiology/Population Health', range: '4-6%' } },
        { id: 'human-dev', cells: { system: 'Human Development', range: '1-3%' } },
      ]}
      footnote="Ranges are the official NBME/FSMB figures. Reproductive & Endocrine Systems carries the single largest range of any system category."
    />

    <H2 section={S.disciplines} />
    <p>
      The discipline breakdown tells you which basic science field a question is drawing its
      reasoning from, independent of which organ system it happens to be about.
    </p>
    <ComparisonTable
      caption="USMLE Step 1 content outline: disciplines"
      columns={[
        { key: 'discipline', label: 'Discipline' },
        { key: 'range', label: 'Percentage of exam' },
      ]}
      rows={[
        { id: 'pathology', featured: true, cells: { discipline: 'Pathology', range: '45-55%' } },
        { id: 'physiology', cells: { discipline: 'Physiology', range: '30-40%' } },
        { id: 'nutrition', cells: { discipline: 'Nutrition', range: '15-20%' } },
        { id: 'anatomy', cells: { discipline: 'Gross Anatomy & Embryology', range: '10-20%' } },
        { id: 'micro', cells: { discipline: 'Microbiology', range: '10-20%' } },
        { id: 'pharm', cells: { discipline: 'Pharmacology', range: '10-20%' } },
        { id: 'behavioral', cells: { discipline: 'Behavioral Sciences', range: '10-15%' } },
        { id: 'biochem', cells: { discipline: 'Biochemistry', range: '5-15%' } },
        { id: 'histology', cells: { discipline: 'Histology & Cell Biology', range: '5-15%' } },
        { id: 'immuno', cells: { discipline: 'Immunology', range: '5-15%' } },
        { id: 'genetics', cells: { discipline: 'Genetics', range: '5-10%' } },
      ]}
      footnote="Pathology and Physiology together can account for a large majority of the exam's reasoning load, well ahead of any other single discipline."
    />

    <H2 section={S.tasks} />
    <p>
      The physician task breakdown tells you what kind of thinking a question is actually asking
      you to do, separate from the subject matter entirely.
    </p>
    <ComparisonTable
      caption="USMLE Step 1 content outline: physician tasks"
      columns={[
        { key: 'task', label: 'Physician task' },
        { key: 'range', label: 'Percentage of exam' },
      ]}
      rows={[
        {
          id: 'medical-knowledge',
          featured: true,
          cells: { task: 'Medical Knowledge: Applying Foundational Science Concepts', range: '60-70%' },
        },
        { id: 'diagnosis', cells: { task: 'Patient Care: Diagnosis', range: '20-25%' } },
        { id: 'communication', cells: { task: 'Communication and Interpersonal Skills', range: '6-9%' } },
        { id: 'practice-based', cells: { task: 'Practice-based Learning & Improvement', range: '4-6%' } },
      ]}
      footnote="The majority of Step 1 is still foundational science applied to a scenario, not pure diagnosis or management, which is why heavy basic-science review still pays off even though the exam is written as clinical vignettes."
    />

    <H2 section={S.meaning} />
    <p>
      Three things stand out once you see the actual numbers instead of guessing at them.
    </p>
    <ul>
      <li>
        <strong>Pathology and Physiology dominate the discipline axis.</strong> At 45 to 55% and 30
        to 40% respectively, these two disciplines alone can account for the reasoning behind most
        questions on the exam, regardless of which organ system they are attached to. If your
        review time is limited, these are the two disciplines where depth matters most.
      </li>
      <li>
        <strong>No single organ system dominates the way Pathology dominates disciplines.</strong>{' '}
        The highest system category, Reproductive &amp; Endocrine, tops out at 16%, and the spread
        across systems is much flatter than the spread across disciplines. Skipping an entire
        organ system is a riskier bet than skipping depth in a smaller discipline like Genetics.
      </li>
      <li>
        <strong>Most of the exam is still foundational science, not management.</strong> Even
        though Step 1 is written entirely as clinical vignettes, 60 to 70% of it is classified as
        applying foundational science concepts, not diagnosis or patient management. The vignette
        format tests how you apply basic science, not how you run a clinic.
      </li>
    </ul>
    <p>
      If you want a week-by-week plan that actually reflects this weighting, our{' '}
      <Link href="/blog/usmle-step-1-study-guide">Step 1 study guide</Link> includes a sample
      dedicated-period schedule, and our{' '}
      <Link href="/blog/8-things-to-know-usmle-step-1">8 things to know about Step 1</Link> covers
      the exam&rsquo;s rules and policies that the content outline does not.
    </p>
    <PostCta
      heading="Practice across every system and discipline on this outline"
      body="NBME-style vignettes with an adaptive engine that targets your weak spots, built-in spaced repetition, and physician-reviewed explanations."
      href={signup('mid-post')}
      label="Start your free trial"
      note="7-day free trial. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.faq} />
    <FaqList faqs={faqs} />
    <PostCta
      heading="Try the adaptive Step 1 Qbank free for 7 days"
      body="Coverage across every system and discipline on the official outline, weighted toward whatever you keep missing."
      href={signup('faq-end')}
      label="Start your free trial"
      note="No charge today. Cancel anytime before day 7 and pay nothing."
    />

    <H2 section={S.sources} />
    <p className="text-sm text-gray-500">
      Percentage ranges are taken directly from the USMLE Step 1 Content Outline and
      Specifications, published by the NBME and FSMB at{' '}
      <a href="https://www.usmle.org/prepare-your-exam/step-1-materials/step-1-content-outline-and-specifications" target="_blank" rel="noopener noreferrer">
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
  slug: 'usmle-step-1-syllabus',
  title: 'USMLE Step 1 Syllabus: The Complete Content Outline',
  seoTitle: 'USMLE Step 1 Syllabus and Content Outline',
  description:
    'The official USMLE Step 1 content outline broken down by system, discipline and physician task, with exact percentage ranges from USMLE.org.',
  publishedAt: '2026-10-01T18:00:00+02:00',
  updatedAt: '2026-10-01T18:00:00+02:00',
  author: { name: 'MedPrep Institute Editorial Team', url: 'https://www.medprepinstitute.org' },
  // Hand writing in a notebook with colored highlighters, downloaded from Unsplash (free to use
  // under the Unsplash License): https://images.unsplash.com/photo-1712762056200-50d8f803ba10
  heroImage: '/blog/usmle-step-1-syllabus-hero.jpg',
  category: 'Study strategy',
  keywords: [
    'USMLE Step 1 syllabus',
    'USMLE Step 1 content outline',
    'Step 1 exam blueprint',
    'Step 1 systems and disciplines',
    'what does Step 1 cover',
    'USMLE Step 1 topics',
  ],
  readingMinutes: 8,
  sections: Object.values(S),
  faqs,
  Body,
};
