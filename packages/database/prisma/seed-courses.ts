/**
 * Seeds ExcelPanda course structure. Idempotent: safe to re-run.
 *
 * Lessons are structure only (title, icon, kind) with no teaching content yet.
 * Two extra courses are empty shells so the catalogue has somewhere to grow.
 */
import { database } from '../index';

type L = { title: string; icon: string; kind?: 'LESSON' | 'CHEST' | 'TEST'; contentKey?: string; xp?: number };
type U = { title: string; blurb: string; lessons: L[] };

const EXCEL_MASTERY: U[] = [
  {
    title: 'Getting Started',
    blurb: 'Cells, ranges and your first formulas',
    lessons: [
      { title: 'Meet the grid', icon: 'grid', contentKey: 'meet-the-grid', xp: 22 },
      { title: 'Cells & ranges', icon: 'book', contentKey: 'cells-ranges' },
      { title: 'Basic math', icon: 'plus', contentKey: 'basic-math' },
      { title: 'SUM & AVERAGE', icon: 'sigma', contentKey: 'sum-average' },
      { title: 'Bonus chest', icon: 'gift', kind: 'CHEST' },
      { title: 'Formatting', icon: 'palette', contentKey: 'formatting' },
      { title: 'Unit 1 test', icon: 'trophy', kind: 'TEST', contentKey: 'unit1-test' },
    ],
  },
  {
    title: 'Formulas that Work',
    blurb: 'IF, lookups and fixing broken formulas',
    lessons: [
      { title: 'IF statements', icon: 'branch', contentKey: 'if-statements' },
      { title: 'COUNTIF & SUMIF', icon: 'list', contentKey: 'countif-sumif' },
      { title: 'XLOOKUP', icon: 'search', contentKey: 'xlookup' },
      { title: 'Fix the #errors', icon: 'wrench', contentKey: 'fix-errors' },
      { title: 'Bonus chest', icon: 'gift', kind: 'CHEST' },
      { title: 'Unit 2 test', icon: 'trophy', kind: 'TEST', contentKey: 'unit2-test' },
    ],
  },
  {
    title: 'Pivot Tables & Charts',
    blurb: 'Turn raw data into clear answers',
    lessons: [
      { title: 'Clean your data', icon: 'sparkles', contentKey: 'clean-data' },
      { title: 'Your first pivot', icon: 'calculator', contentKey: 'first-pivot' },
      { title: 'Charts that pop', icon: 'chart', contentKey: 'charts-pop' },
      { title: 'Dashboards', icon: 'layout', contentKey: 'dashboards' },
      { title: 'Unit 3 test', icon: 'trophy', kind: 'TEST', contentKey: 'unit3-test' },
    ],
  },
];

const T = (title: string, icon: string, contentKey: string, kind?: 'TEST'): L => ({ title, icon, contentKey, ...(kind ? { kind } : {}) });

const FORMULAS_FUNCTIONS: U[] = [
  {
    title: 'References that Don\'t Break',
    blurb: 'Absolute, mixed and named references, and other sheets',
    lessons: [
      T('Relative vs absolute', 'wrench', 'ff-relative-absolute'),
      T('The F4 key', 'sparkles', 'ff-f4-key'),
      T('Named ranges', 'list', 'ff-named-ranges'),
      T('Mixed references', 'grid', 'ff-mixed-references'),
      T('Cross-sheet references', 'layout', 'ff-cross-sheet'),
      T('Unit 1 test', 'trophy', 'ff-unit1-test', 'TEST'),
    ],
  },
  {
    title: 'Logic & Conditions',
    blurb: 'AND, OR, nested IF, IFS, SWITCH and the IFS family',
    lessons: [
      T('AND, OR, NOT', 'branch', 'ff-and-or-not'),
      T('Nested IF & IFS', 'branch', 'ff-nested-if-ifs'),
      T('SWITCH', 'branch', 'ff-switch'),
      T('IFERROR & IFNA', 'wrench', 'ff-iferror-ifna'),
      T('SUMIFS, COUNTIFS, AVERAGEIFS', 'sigma', 'ff-ifs-family'),
      T('Unit 2 test', 'trophy', 'ff-unit2-test', 'TEST'),
    ],
  },
  {
    title: 'Text & Dates',
    blurb: 'Slice, join and clean text, and do date maths',
    lessons: [
      T('LEFT, RIGHT, MID, LEN', 'sparkles', 'ff-text-slice'),
      T('FIND, SEARCH, SUBSTITUTE', 'search', 'ff-find-substitute'),
      T('TEXTJOIN, CONCAT, &', 'plus', 'ff-textjoin'),
      T('TRIM, PROPER, TEXT', 'palette', 'ff-clean-text'),
      T('Dates are numbers', 'calculator', 'ff-dates-numbers'),
      T('DATEDIF, EDATE, WORKDAY', 'calculator', 'ff-date-math'),
      T('Unit 3 test', 'trophy', 'ff-unit3-test', 'TEST'),
    ],
  },
  {
    title: 'Lookups Done Right',
    blurb: 'XLOOKUP, VLOOKUP, INDEX and MATCH, and approximate matches',
    lessons: [
      T('XLOOKUP deep dive', 'search', 'ff-xlookup-deep'),
      T('VLOOKUP & HLOOKUP', 'search', 'ff-vlookup-hlookup'),
      T('INDEX + MATCH', 'search', 'ff-index-match'),
      T('Approximate match', 'search', 'ff-approx-match'),
      T('Lookup on two criteria', 'search', 'ff-multi-lookup'),
      T('Unit 4 test', 'trophy', 'ff-unit4-test', 'TEST'),
    ],
  },
  {
    title: 'Stats & Data Quality',
    blurb: 'Statistics, rankings, rounding, validation and conditional formatting',
    lessons: [
      T('MEDIAN, MODE, STDEV', 'chart', 'ff-descriptive-stats'),
      T('LARGE, SMALL, RANK', 'chart', 'ff-top-n'),
      T('Rounding & precision', 'calculator', 'ff-rounding'),
      T('Data validation', 'list', 'ff-validation'),
      T('Conditional formatting', 'palette', 'ff-conditional-formatting'),
      T('Final test', 'trophy', 'ff-final-test', 'TEST'),
    ],
  },
];

const XP: Record<string, number> = { LESSON: 10, CHEST: 0, TEST: 25 };

async function seedUnits(courseId: string, units: U[]) {
  for (const [ui, u] of units.entries()) {
    const unit = await database.unit.upsert({
      where: { courseId_order: { courseId, order: ui + 1 } },
      create: { courseId, order: ui + 1, title: u.title, blurb: u.blurb },
      update: { title: u.title, blurb: u.blurb },
    });
    for (const [li, l] of u.lessons.entries()) {
      const kind = l.kind ?? 'LESSON';
      await database.lesson.upsert({
        where: { unitId_order: { unitId: unit.id, order: li + 1 } },
        create: { unitId: unit.id, order: li + 1, title: l.title, icon: l.icon, kind, xp: l.xp ?? XP[kind], contentKey: l.contentKey ?? null },
        update: { title: l.title, icon: l.icon, kind, xp: l.xp ?? XP[kind], contentKey: l.contentKey ?? null },
      });
    }
  }
}

async function main() {
  // The course was first seeded as "excel-mastery"; keep its data under the new slug.
  await database.course.updateMany({ where: { slug: 'excel-mastery' }, data: { slug: 'excel-basics' } });
  const course = await database.course.upsert({
    where: { slug: 'excel-basics' },
    create: {
      slug: 'excel-basics',
      title: 'Excel Basics',
      description: 'From your first formula to pivot tables and dashboards.',
      order: 1,
      published: true,
    },
    update: {
      title: 'Excel Basics',
      description: 'From your first formula to pivot tables and dashboards.',
      order: 1,
      published: true,
    },
  });

  await seedUnits(course.id, EXCEL_MASTERY);

  const formulas = await database.course.upsert({
    where: { slug: 'formulas-functions' },
    create: {
      slug: 'formulas-functions',
      title: 'Formulas & Functions',
      description: 'The 40 functions that do 90% of real work: logic, text, dates, lookups and stats.',
      order: 2,
      published: true,
    },
    update: {
      title: 'Formulas & Functions',
      description: 'The 40 functions that do 90% of real work: logic, text, dates, lookups and stats.',
      order: 2,
      published: true,
    },
  });
  await seedUnits(formulas.id, FORMULAS_FUNCTIONS);

  // Empty shells: no units yet, not visible to learners.
  const shells = [
    { slug: 'advanced-formulas', title: 'Advanced Formulas', order: 3, description: 'Dynamic arrays, LET, LAMBDA and beyond.' },
    { slug: 'data-dashboards', title: 'Data & Dashboards', order: 4, description: 'Power Query, models and executive dashboards.' },
  ];
  for (const s of shells) {
    await database.course.upsert({
      where: { slug: s.slug },
      create: { ...s, published: false },
      update: { title: s.title, order: s.order, description: s.description },
    });
  }

  const [courses, units, lessons] = await Promise.all([
    database.course.count(),
    database.unit.count(),
    database.lesson.count(),
  ]);
  console.log(`Seeded: ${courses} courses, ${units} units, ${lessons} lessons`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => database.$disconnect());
