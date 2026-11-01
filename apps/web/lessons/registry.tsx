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
];

const LESSONS: Record<string, LessonContent> = Object.fromEntries(ALL.map((l) => [l.key, l]));

export const getLessonContent = (key: string | null | undefined): LessonContent | null =>
  key ? (LESSONS[key] ?? null) : null;
