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
import * as ADV1 from './adv1';
import * as ADV2 from './adv2';
import * as ADV3 from './adv3';
import { DD1 } from './dd1';
import { DD2 } from './dd2';
import { DD3 } from './dd3';
import { DD4 } from './dd4';
import { DD5 } from './dd5';
import { FIN1 } from './fin1';
import { FIN2 } from './fin2';
import { AUTO1 } from './auto1';
import { AUTO2 } from './auto2';
import { AUTO3 } from './auto3';
import { AUTO4 } from './auto4';
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
  // Advanced Formulas
  ADV1.spillLesson, ADV1.sortFunctions, ADV1.filterFunction, ADV1.uniqueFunction, ADV1.sequenceFunction, ADV1.unit1Test,
  ADV1.letFunction, ADV1.lambdaFunction, ADV1.mapReduceScan, ADV1.byRowByCol, ADV1.lambdaLibrary, ADV1.unit2Test,
  ADV2.booleanArrays, ADV2.sumproductLesson, ADV2.arrayConstants, ADV2.reshapeFunctions, ADV2.tocolWrap, ADV2.unit3Test,
  ADV2.xlookupArrays, ADV2.xmatchLesson, ADV2.nearestTwoWay, ADV2.indirectOffset, ADV2.manySheets, ADV2.unit4Test,
  ADV3.textSplitLesson, ADV3.regexLesson, ADV3.debuggingLesson, ADV3.performanceLesson, ADV3.errorProofing, ADV3.finalTest,
  ...DD1, ...DD2, ...DD3, ...DD4, ...DD5, ...FIN1, ...FIN2, ...AUTO1, ...AUTO2, ...AUTO3, ...AUTO4,
];

const LESSONS: Record<string, LessonContent> = Object.fromEntries(ALL.map((l) => [l.key, l]));

export const getLessonContent = (key: string | null | undefined): LessonContent | null =>
  key ? (LESSONS[key] ?? null) : null;
