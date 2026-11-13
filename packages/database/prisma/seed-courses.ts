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

const DATA_ANALYSIS: U[] = [
  {
    title: 'Tables, Sorting & Filtering',
    blurb: 'Smart tables, sorting, filters, slicers and structured references',
    lessons: [
      T('Format as Table', 'grid', 'da-format-table'),
      T('Sort', 'list', 'da-sort'),
      T('Filter & search', 'search', 'da-filter'),
      T('Structured references', 'sigma', 'da-structured-refs'),
      T('Totals row & slicers', 'layout', 'da-totals-slicers'),
      T('Unit 1 test', 'trophy', 'da-unit1-test', 'TEST'),
    ],
  },
  {
    title: 'Cleaning Messy Data',
    blurb: 'Duplicates, text to columns, Flash Fill, find and replace',
    lessons: [
      T('Remove duplicates', 'sparkles', 'da-remove-duplicates'),
      T('Text to columns', 'sparkles', 'da-text-to-columns'),
      T('Flash Fill', 'sparkles', 'da-flash-fill'),
      T('Find & Replace', 'search', 'da-find-replace'),
      T('Numbers & dates stored as text', 'wrench', 'da-text-numbers'),
      T('Blanks & errors', 'wrench', 'da-blanks-errors'),
      T('Unit 2 test', 'trophy', 'da-unit2-test', 'TEST'),
    ],
  },
  {
    title: 'Pivot Tables',
    blurb: 'Summarise thousands of rows with rows, columns and values',
    lessons: [
      T('Your first PivotTable', 'calculator', 'da-first-pivot'),
      T('Summarize by', 'calculator', 'da-summarize-by'),
      T('Grouping dates', 'calculator', 'da-grouping'),
      T('Calculated fields', 'plus', 'da-calculated-fields'),
      T('Filters & slicers', 'layout', 'da-pivot-slicers'),
      T('Refresh & source data', 'wrench', 'da-refresh'),
      T('Unit 3 test', 'trophy', 'da-unit3-test', 'TEST'),
    ],
  },
  {
    title: 'Charts that Persuade',
    blurb: 'Pick the right chart, design it clearly, chart a pivot',
    lessons: [
      T('Pick the right chart', 'chart', 'da-pick-chart'),
      T('Build & edit a chart', 'chart', 'da-build-chart'),
      T('Combo & secondary axis', 'chart', 'da-combo-chart'),
      T('Mini charts in cells', 'chart', 'da-mini-charts'),
      T('Design for clarity', 'palette', 'da-chart-design'),
      T('Pivot charts', 'chart', 'da-pivot-charts'),
      T('Unit 4 test', 'trophy', 'da-unit4-test', 'TEST'),
    ],
  },
  {
    title: 'What-If & Analysis',
    blurb: 'Goal Seek, scenarios, data tables, forecasts and correlation',
    lessons: [
      T('Goal Seek', 'branch', 'da-goal-seek'),
      T('Scenarios', 'branch', 'da-scenarios'),
      T('Data tables', 'grid', 'da-data-tables'),
      T('Trends & forecasting', 'chart', 'da-forecast'),
      T('Correlation', 'chart', 'da-correlation'),
      T('Final test', 'trophy', 'da-final-test', 'TEST'),
    ],
  },
];

const ADVANCED: U[] = [
  {
    title: 'Dynamic Arrays',
    blurb: 'Spill ranges, SORT, FILTER, UNIQUE and SEQUENCE',
    lessons: [
      T('Spill ranges', 'sparkles', 'adv-spill'),
      T('SORT & SORTBY', 'list', 'adv-sort'),
      T('FILTER', 'search', 'adv-filter'),
      T('UNIQUE', 'sparkles', 'adv-unique'),
      T('SEQUENCE & RANDARRAY', 'plus', 'adv-sequence'),
      T('Unit 1 test', 'trophy', 'adv-unit1-test', 'TEST'),
    ],
  },
  {
    title: 'LET & LAMBDA',
    blurb: 'Name your steps, then write your own functions',
    lessons: [
      T('LET', 'branch', 'adv-let'),
      T('LAMBDA', 'branch', 'adv-lambda'),
      T('MAP, REDUCE & SCAN', 'sigma', 'adv-map-reduce'),
      T('BYROW, BYCOL & MAKEARRAY', 'grid', 'adv-byrow'),
      T('Reusable function libraries', 'layout', 'adv-lambda-library'),
      T('Unit 2 test', 'trophy', 'adv-unit2-test', 'TEST'),
    ],
  },
  {
    title: 'Array Thinking',
    blurb: 'Boolean arithmetic, SUMPRODUCT, constants and reshaping',
    lessons: [
      T('Boolean arithmetic', 'calculator', 'adv-boolean-arrays'),
      T('SUMPRODUCT', 'calculator', 'adv-sumproduct'),
      T('Array constants', 'list', 'adv-array-constants'),
      T('TAKE, DROP, CHOOSECOLS & stacking', 'grid', 'adv-reshape'),
      T('TOCOL, TOROW & WRAPROWS', 'grid', 'adv-tocol'),
      T('Unit 3 test', 'trophy', 'adv-unit3-test', 'TEST'),
    ],
  },
  {
    title: 'Advanced Lookups',
    blurb: 'XLOOKUP tricks, XMATCH, nearest match and many sheets',
    lessons: [
      T('XLOOKUP: rows, lists and wildcards', 'search', 'adv-xlookup-arrays'),
      T('XMATCH', 'search', 'adv-xmatch'),
      T('Nearest match & two-way lookups', 'search', 'adv-nearest'),
      T('INDIRECT & OFFSET (and why to avoid them)', 'wrench', 'adv-indirect-offset'),
      T('Consolidate many sheets', 'layout', 'adv-many-sheets'),
      T('Unit 4 test', 'trophy', 'adv-unit4-test', 'TEST'),
    ],
  },
  {
    title: 'Text, Regex & Errors',
    blurb: 'TEXTSPLIT, regular expressions, debugging and speed',
    lessons: [
      T('TEXTSPLIT, TEXTBEFORE & TEXTAFTER', 'sparkles', 'adv-textsplit'),
      T('Regular expressions', 'sparkles', 'adv-regex'),
      T('Debugging long formulas', 'wrench', 'adv-debug'),
      T('Faster workbooks', 'wrench', 'adv-performance'),
      T('Error-proofing', 'wrench', 'adv-error-proofing'),
      T('Final test', 'trophy', 'adv-final-test', 'TEST'),
    ],
  },
];

const DATA_DASHBOARDS: U[] = [
  {
    title: 'Power Query Basics',
    blurb: 'Get data, set types, clean text and shape rows',
    lessons: [
      T('Meet Power Query', 'sparkles', 'dd-pq-intro'),
      T('Data types & errors', 'wrench', 'dd-pq-types'),
      T('Cleaning text & values', 'wrench', 'dd-pq-clean'),
      T('Filtering, sorting & columns', 'list', 'dd-pq-rows'),
      T('Adding columns', 'plus', 'dd-pq-add'),
      T('Steps, parameters & refresh', 'branch', 'dd-pq-refresh'),
    ],
  },
  {
    title: 'Advanced Power Query',
    blurb: 'Merge, append, combine folders, unpivot and group',
    lessons: [
      T('Merge queries (lookups)', 'search', 'dd-pq-merge'),
      T('Join kinds', 'search', 'dd-pq-joins'),
      T('Append queries', 'layout', 'dd-pq-append'),
      T('Combine files from a folder', 'layout', 'dd-pq-folder'),
      T('Unpivot & pivot', 'grid', 'dd-pq-unpivot'),
      T('Group by & summarise', 'sigma', 'dd-pq-group'),
      T('Unit 2 test', 'trophy', 'dd-pq-test', 'TEST'),
    ],
  },
  {
    title: 'Data Model & DAX',
    blurb: 'Relationships, measures, CALCULATE and time intelligence',
    lessons: [
      T('Tables & relationships', 'grid', 'dd-model-rel'),
      T('Your first measures', 'calculator', 'dd-model-measures'),
      T('CALCULATE', 'sigma', 'dd-model-calculate'),
      T('Filter context', 'branch', 'dd-model-context'),
      T('Time intelligence', 'calculator', 'dd-model-time'),
      T('Row context, RELATED & VAR', 'branch', 'dd-model-iterators'),
      T('Unit 3 test', 'trophy', 'dd-model-test', 'TEST'),
    ],
  },
  {
    title: 'Dashboard Design',
    blurb: 'KPIs, layout, status, in-cell bars and the right chart',
    lessons: [
      T('KPI cards', 'sparkles', 'dd-dash-kpi'),
      T('Layout & formatting', 'layout', 'dd-dash-layout'),
      T('Status that survives colour-blindness', 'list', 'dd-dash-status'),
      T('In-cell bars', 'grid', 'dd-dash-bars'),
      T('Choosing the right chart', 'sigma', 'dd-dash-chart'),
      T('Unit 4 test', 'trophy', 'dd-dash-test', 'TEST'),
    ],
  },
  {
    title: 'Interactive Reporting',
    blurb: 'Dropdowns, dynamic titles, slicers and one-click refresh',
    lessons: [
      T('A dropdown that drives the page', 'search', 'dd-int-dropdown'),
      T('Dynamic titles & rankings', 'sparkles', 'dd-int-dynamic'),
      T('Slicers & visible-only totals', 'list', 'dd-int-slicer'),
      T('Switch what the dashboard shows', 'branch', 'dd-int-toggle'),
      T('Refresh the whole report', 'wrench', 'dd-int-refresh'),
      T('Course final', 'trophy', 'dd-final', 'TEST'),
    ],
  },
];

const EXCEL_FINANCE: U[] = [
  {
    title: 'Time Value of Money',
    blurb: 'Interest, loans, NPV and IRR',
    lessons: [
      T('Simple & compound interest', 'calculator', 'fin-interest'),
      T('PV, FV, PMT, NPER & RATE', 'calculator', 'fin-core'),
      T('Loan schedules', 'grid', 'fin-loan'),
      T('NPV & IRR', 'sigma', 'fin-npv'),
      T('XNPV & XIRR', 'sigma', 'fin-xnpv'),
      T('Unit 1 test', 'trophy', 'fin-unit1-test', 'TEST'),
    ],
  },
  {
    title: 'Budgets & Forecasts',
    blurb: 'Layout, variances, rolling forecasts and cash flow',
    lessons: [
      T('Budget layout', 'layout', 'fin-budget'),
      T('Variance analysis', 'list', 'fin-variance'),
      T('Rolling forecasts', 'branch', 'fin-rolling'),
      T('Seasonality', 'sparkles', 'fin-seasonality'),
      T('Cash-flow forecast', 'calculator', 'fin-cashflow'),
      T('Unit 2 test', 'trophy', 'fin-unit2-test', 'TEST'),
    ],
  },
  {
    title: 'Financial Statements',
    blurb: 'Income statement, balance sheet, cash flow and ratios',
    lessons: [
      T('Income statement', 'list', 'fin-income'),
      T('Balance sheet', 'grid', 'fin-balance'),
      T('Cash-flow statement', 'calculator', 'fin-cfs'),
      T('Linking the three statements', 'branch', 'fin-link'),
      T('Financial ratios', 'sigma', 'fin-ratios'),
      T('Unit 3 test', 'trophy', 'fin-unit3-test', 'TEST'),
    ],
  },
  {
    title: 'Modelling Best Practice',
    blurb: 'Audit, checks, names, scenarios and sensitivity',
    lessons: [
      T('Audit a model', 'wrench', 'fin-colours'),
      T('Checks & balances', 'wrench', 'fin-checks'),
      T('Named ranges & structure', 'search', 'fin-named'),
      T('Scenario switch', 'branch', 'fin-scenario'),
      T('Sensitivity analysis', 'grid', 'fin-sensitivity'),
      T('Unit 4 test', 'trophy', 'fin-unit4-test', 'TEST'),
    ],
  },
  {
    title: 'Capstones',
    blurb: 'Startup plan, loan comparison, DCF and a personal planner',
    lessons: [
      T('Capstone: startup plan', 'sparkles', 'fin-cap-startup'),
      T('Capstone: loan comparison', 'search', 'fin-cap-loan'),
      T('Capstone: DCF valuation', 'sigma', 'fin-cap-dcf'),
      T('Capstone: personal planner', 'calculator', 'fin-cap-personal'),
      T('Course final', 'trophy', 'fin-final', 'TEST'),
    ],
  },
];

const EXCEL_AUTOMATION: U[] = [
  {
    title: 'Speed Without Code',
    blurb: 'Styles, number formats, Paste Special, shortcuts and Go To Special',
    lessons: [
      T('Templates & styles', 'layout', 'auto-styles'),
      T('Custom number formats', 'calculator', 'auto-numfmt'),
      T('Paste Special mastery', 'grid', 'auto-paste'),
      T('Quick Access & shortcuts', 'sparkles', 'auto-shortcuts'),
      T('Go To Special', 'search', 'auto-gotospecial'),
      T('Unit 1 test', 'trophy', 'auto-unit1-test', 'TEST'),
    ],
  },
  {
    title: 'Macros with the Recorder',
    blurb: 'Record, run, edit, attach to buttons and keep them safe',
    lessons: [
      T('What a macro is', 'sparkles', 'auto-macro-what'),
      T('Absolute vs relative recording', 'branch', 'auto-macro-rel'),
      T('Buttons & shortcuts', 'plus', 'auto-macro-buttons'),
      T('Reading recorded code', 'list', 'auto-macro-read'),
      T('Macro security', 'wrench', 'auto-macro-security'),
      T('Unit 2 test', 'trophy', 'auto-unit2-test', 'TEST'),
    ],
  },
  {
    title: 'VBA Fundamentals',
    blurb: 'Variables, ranges, loops, custom functions and debugging',
    lessons: [
      T('The VBA editor', 'layout', 'auto-vba-editor'),
      T('Variables & data types', 'calculator', 'auto-vba-vars'),
      T('Ranges & cells', 'grid', 'auto-vba-ranges'),
      T('Loops & conditions', 'branch', 'auto-vba-loops'),
      T('Functions & UDFs', 'sigma', 'auto-vba-udf'),
      T('Errors & debugging', 'wrench', 'auto-vba-debug'),
      T('Unit 3 test', 'trophy', 'auto-unit3-test', 'TEST'),
    ],
  },
  {
    title: 'Modern Automation',
    blurb: 'Office Scripts, Power Automate and a one-click report',
    lessons: [
      T('Office Scripts basics', 'sparkles', 'auto-script-basics'),
      T('Power Automate flows', 'branch', 'auto-flow'),
      T('Automating a scheduled refresh', 'wrench', 'auto-refresh-flow'),
      T('Capstone: one-click monthly report', 'layout', 'auto-capstone'),
      T('Course final', 'trophy', 'auto-final', 'TEST'),
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

  const analysis = await database.course.upsert({
    where: { slug: 'data-analysis-pivots' },
    create: {
      slug: 'data-analysis-pivots',
      title: 'Data Analysis & Pivots',
      description: 'Turn thousands of messy rows into one clear answer: tables, cleaning, PivotTables, charts and what-if.',
      order: 3,
      published: true,
    },
    update: {
      title: 'Data Analysis & Pivots',
      description: 'Turn thousands of messy rows into one clear answer: tables, cleaning, PivotTables, charts and what-if.',
      order: 3,
      published: true,
    },
  });
  await seedUnits(analysis.id, DATA_ANALYSIS);

  const advanced = await database.course.upsert({
    where: { slug: 'advanced-formulas' },
    create: {
      slug: 'advanced-formulas',
      title: 'Advanced Formulas',
      description: 'Dynamic arrays, LET, LAMBDA, regex and the modern way to write formulas.',
      order: 4,
      published: true,
    },
    update: {
      title: 'Advanced Formulas',
      description: 'Dynamic arrays, LET, LAMBDA, regex and the modern way to write formulas.',
      order: 4,
      published: true,
    },
  });
  await seedUnits(advanced.id, ADVANCED);

  const dashboards = await database.course.upsert({
    where: { slug: 'data-dashboards' },
    create: {
      slug: 'data-dashboards',
      title: 'Data & Dashboards',
      description: 'Power Query, data models with DAX, and dashboards that update with one click.',
      order: 5,
      published: true,
    },
    update: {
      title: 'Data & Dashboards',
      description: 'Power Query, data models with DAX, and dashboards that update with one click.',
      order: 5,
      published: true,
    },
  });
  await seedUnits(dashboards.id, DATA_DASHBOARDS);

  const finance = await database.course.upsert({
    where: { slug: 'excel-finance' },
    create: {
      slug: 'excel-finance',
      title: 'Excel for Finance',
      description: 'Loans, NPV and IRR, budgets, financial statements and models a bank would trust.',
      order: 6,
      published: true,
    },
    update: {
      title: 'Excel for Finance',
      description: 'Loans, NPV and IRR, budgets, financial statements and models a bank would trust.',
      order: 6,
      published: true,
    },
  });
  await seedUnits(finance.id, EXCEL_FINANCE);

  const automation = await database.course.upsert({
    where: { slug: 'excel-automation' },
    create: {
      slug: 'excel-automation',
      title: 'Excel Automation',
      description: 'Shortcuts, macros, VBA, Office Scripts and Power Automate: stop doing it by hand.',
      order: 7,
      published: true,
    },
    update: {
      title: 'Excel Automation',
      description: 'Shortcuts, macros, VBA, Office Scripts and Power Automate: stop doing it by hand.',
      order: 7,
      published: true,
    },
  });
  await seedUnits(automation.id, EXCEL_AUTOMATION);

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
