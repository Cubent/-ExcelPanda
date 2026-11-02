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
];

const LESSONS: Record<string, LessonContent> = Object.fromEntries(ALL.map((l) => [l.key, l]));

export const getLessonContent = (key: string | null | undefined): LessonContent | null =>
  key ? (LESSONS[key] ?? null) : null;
