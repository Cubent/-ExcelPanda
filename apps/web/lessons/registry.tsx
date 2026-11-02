import {
  andOrNot,
  crossSheet,
  f4Key,
  ifsFamily,
  iferrorIfna,
  mixedReferences,
  namedRanges,
  nestedIfIfs,
  relativeAbsolute,
  switchFn,
  unit1Test as ffUnit1Test,
  unit2Test as ffUnit2Test,
} from './ff1';
import { cleanText, dateMath, datesAreNumbers, findSubstitute, textJoin, textSlice, unit3Test as ffUnit3Test } from './ff2';
import {
  approxMatch,
  conditionalFormatting,
  descriptiveStats,
  finalTest as ffFinalTest,
  indexMatch,
  multiLookup,
  rounding,
  topN,
  unit4Test as ffUnit4Test,
  validationLesson,
  vlookupHlookup,
  xlookupDeep,
} from './ff3';
import {
  blanksErrors,
  filterData,
  findReplaceLesson,
  flashFillLesson,
  formatTable,
  removeDuplicatesLesson,
  sortData,
  structuredRefs,
  textNumbers,
  textToColumnsLesson,
  totalsSlicers,
  unit1Test as daUnit1Test,
  unit2Test as daUnit2Test,
} from './da1';
import {
  buildChart,
  calculatedFields,
  chartDesign,
  comboChart,
  firstPivot as daFirstPivot,
  grouping,
  miniCharts,
  pickRightChart,
  pivotCharts,
  pivotSlicers,
  refreshPivot,
  summarizeBy,
  unit3Test as daUnit3Test,
  unit4Test as daUnit4Test,
} from './da2';
import { correlation, dataTables, finalTest as daFinalTest, forecasting, goalSeekLesson, scenarios } from './da3';
import { meetTheGrid } from './meet-the-grid';
import type { LessonContent } from './types';
import { basicMath, cellsRanges, formatting, sumAverage, unit1Test } from './unit1';
import { countifSumif, fixErrors, ifStatements, unit2Test, xlookup } from './unit2';
import { chartsPop, cleanData, dashboards, firstPivot, unit3Test } from './unit3';

// Lesson content keyed by the `contentKey` stored on each lesson in the DB.
const ALL: LessonContent[] = [
  meetTheGrid,
  cellsRanges,
  basicMath,
  sumAverage,
  formatting,
  unit1Test,
  ifStatements,
  countifSumif,
  xlookup,
  fixErrors,
  unit2Test,
  cleanData,
  firstPivot,
  chartsPop,
  dashboards,
  unit3Test,
  // Formulas & Functions
  relativeAbsolute, f4Key, namedRanges, mixedReferences, crossSheet, ffUnit1Test,
  andOrNot, nestedIfIfs, switchFn, iferrorIfna, ifsFamily, ffUnit2Test,
  textSlice, findSubstitute, textJoin, cleanText, datesAreNumbers, dateMath, ffUnit3Test,
  xlookupDeep, vlookupHlookup, indexMatch, approxMatch, multiLookup, ffUnit4Test,
  descriptiveStats, topN, rounding, validationLesson, conditionalFormatting, ffFinalTest,
  // Data Analysis & Pivots
  formatTable, sortData, filterData, structuredRefs, totalsSlicers, daUnit1Test,
  removeDuplicatesLesson, textToColumnsLesson, flashFillLesson, findReplaceLesson, textNumbers, blanksErrors, daUnit2Test,
  daFirstPivot, summarizeBy, grouping, calculatedFields, pivotSlicers, refreshPivot, daUnit3Test,
  pickRightChart, buildChart, comboChart, miniCharts, chartDesign, pivotCharts, daUnit4Test,
  goalSeekLesson, scenarios, dataTables, forecasting, correlation, daFinalTest,
];

const LESSONS: Record<string, LessonContent> = Object.fromEntries(ALL.map((l) => [l.key, l]));

export const getLessonContent = (key: string | null | undefined): LessonContent | null =>
  key ? (LESSONS[key] ?? null) : null;
