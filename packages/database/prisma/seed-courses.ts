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
    title: 'Excel Basics',
    blurb: 'Cells, ranges and your first formulas',
    lessons: [
      { title: 'Meet the grid', icon: 'grid', contentKey: 'meet-the-grid', xp: 22 },
      { title: 'Cells & ranges', icon: 'book' },
      { title: 'Basic math', icon: 'plus' },
      { title: 'SUM & AVERAGE', icon: 'sigma' },
      { title: 'Bonus chest', icon: 'gift', kind: 'CHEST' },
      { title: 'Formatting', icon: 'palette' },
      { title: 'Unit 1 test', icon: 'trophy', kind: 'TEST' },
    ],
  },
  {
    title: 'Formulas that Work',
    blurb: 'IF, lookups and fixing broken formulas',
    lessons: [
      { title: 'IF statements', icon: 'branch' },
      { title: 'COUNTIF & SUMIF', icon: 'list' },
      { title: 'XLOOKUP', icon: 'search' },
      { title: 'Fix the #errors', icon: 'wrench' },
      { title: 'Bonus chest', icon: 'gift', kind: 'CHEST' },
      { title: 'Unit 2 test', icon: 'trophy', kind: 'TEST' },
    ],
  },
  {
    title: 'Pivot Tables & Charts',
    blurb: 'Turn raw data into clear answers',
    lessons: [
      { title: 'Clean your data', icon: 'sparkles' },
      { title: 'Your first pivot', icon: 'calculator' },
      { title: 'Charts that pop', icon: 'chart' },
      { title: 'Dashboards', icon: 'layout' },
      { title: 'Unit 3 test', icon: 'trophy', kind: 'TEST' },
    ],
  },
];

const XP: Record<string, number> = { LESSON: 10, CHEST: 0, TEST: 25 };

async function main() {
  const course = await database.course.upsert({
    where: { slug: 'excel-mastery' },
    create: {
      slug: 'excel-mastery',
      title: 'Excel Mastery',
      description: 'From your first formula to confident, professional spreadsheets.',
      order: 1,
      published: true,
    },
    update: { title: 'Excel Mastery', order: 1, published: true },
  });

  for (const [ui, u] of EXCEL_MASTERY.entries()) {
    const unit = await database.unit.upsert({
      where: { courseId_order: { courseId: course.id, order: ui + 1 } },
      create: { courseId: course.id, order: ui + 1, title: u.title, blurb: u.blurb },
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

  // Empty shells: no units yet, not visible to learners.
  const shells = [
    { slug: 'advanced-formulas', title: 'Advanced Formulas', order: 2, description: 'Dynamic arrays, LET, LAMBDA and beyond.' },
    { slug: 'data-dashboards', title: 'Data & Dashboards', order: 3, description: 'Power Query, models and executive dashboards.' },
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
