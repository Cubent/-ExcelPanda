import { meetTheGrid } from './meet-the-grid';
import type { LessonContent } from './types';

// Lesson content keyed by the `contentKey` stored on each lesson in the DB.
const LESSONS: Record<string, LessonContent> = {
  [meetTheGrid.key]: meetTheGrid,
};

export const getLessonContent = (key: string | null | undefined): LessonContent | null =>
  key ? (LESSONS[key] ?? null) : null;
