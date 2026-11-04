import 'server-only';
import { database } from '@repo/database';
import { cache } from 'react';

// ---------------------------------------------------------------------------
// Course map
// ---------------------------------------------------------------------------

// TEMPORARY: lets you open any lesson, not just the next one. Set to false to restore the locked path.
export const UNLOCK_ALL = true;

export type NodeState = 'done' | 'current' | 'locked';
export type MapNode = {
  id: string;
  /** URL-friendly name, unique in the course, e.g. "meet-the-grid". */
  slug: string;
  title: string;
  icon: string;
  kind: 'LESSON' | 'CHEST' | 'TEST';
  xp: number;
  state: NodeState;
  /** Locked lessons are still openable when UNLOCK_ALL is on. */
  open: boolean;
};
export type MapUnit = {
  id: string;
  /** URL name, e.g. "excel-basics" for /dashboard/excel-basics. */
  slug: string;
  number: number;
  title: string;
  blurb: string;
  nodes: MapNode[];
  /** Premium unit the user has not unlocked. Set by the page, not stored. */
  locked?: boolean;
};
export type CourseMap = {
  courseId: string;
  /** URL name, e.g. "excel-basics" for /dashboard/excel-basics. */
  slug: string;
  title: string;
  description: string;
  units: MapUnit[];
  total: number;
  completed: number;
  unitsDone: number;
  current: MapNode | null;
  /** Premium course the user has not unlocked. Set by the page, not stored. */
  locked?: boolean;
};

// First published course, with per-lesson state for this user. Lessons unlock
// in order: everything before the first unfinished lesson is done, that one is
// current, the rest are locked.
export const getCourseMaps = cache(async (userId: string): Promise<CourseMap[]> => {
  const courses = await database.course.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
    include: {
      units: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
    },
  });
  if (courses.length === 0) return [];

  const progress = await database.userLessonProgress.findMany({
    where: { clerkUserId: userId },
    select: { lessonId: true },
  });
  const done = new Set(progress.map((p) => p.lessonId));
  // Lesson URLs are global (/lesson/<slug>), so slugs are unique across every course.
  const usedSlugs = new Set<string>();

  return courses.map((course) => {
  let currentAssigned = false;
  let current: MapNode | null = null;
  let total = 0;
  let completed = 0;
  let unitsDone = 0;

  const units: MapUnit[] = course.units.map((u) => {
    const nodes: MapNode[] = u.lessons.map((l) => {
      let state: NodeState;
      if (done.has(l.id)) {
        state = 'done';
      } else if (!currentAssigned) {
        state = 'current';
        currentAssigned = true;
      } else {
        state = 'locked';
      }
      let slug = l.title.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'lesson';
      if (usedSlugs.has(slug)) slug = `${slug}-${course.slug}`;
      usedSlugs.add(slug);
      const node: MapNode = { id: l.id, slug, title: l.title, icon: l.icon, kind: l.kind, xp: l.xp, state, open: UNLOCK_ALL || state !== 'locked' };
      if (state === 'current') current = node;
      total += 1;
      if (state === 'done') completed += 1;
      return node;
    });
    if (nodes.length > 0 && nodes.every((n) => n.state === 'done')) unitsDone += 1;
    const slug =
      u.title
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `unit-${u.order}`;
    return { id: u.id, slug, number: u.order, title: u.title, blurb: u.blurb, nodes };
  });

  return { courseId: course.id, slug: course.slug, title: course.title, description: course.description, units, total, completed, unitsDone, current };
  });
});

/** The first published course (kept for pages that only need one). */
export const getCourseMap = cache(async (userId: string): Promise<CourseMap | null> => (await getCourseMaps(userId))[0] ?? null);

/** Every lesson node across all published courses, with its unit. */
export function findLesson(maps: CourseMap[], idOrSlug: string) {
  for (const map of maps) {
    for (const unit of map.units) {
      const node = unit.nodes.find((n) => n.slug === idOrSlug || n.id === idOrSlug);
      if (node) return { map, unit, node };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Stats, streaks and quests
// ---------------------------------------------------------------------------

export const DAILY_XP_GOAL = 50;
export const DAILY_LESSON_GOAL = 2;
export const WEEKLY_XP_GOAL = 300;

const DAY_MS = 86_400_000;

export function todayUtc(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

// Monday 00:00 UTC of the current week.
export function weekStartUtc(): Date {
  const t = todayUtc();
  const dow = (t.getUTCDay() + 6) % 7; // Mon=0
  return new Date(t.getTime() - dow * DAY_MS);
}

export type Stats = {
  xp: number;
  gems: number;
  streak: number;
  todayXp: number;
  todayLessons: number;
  weekXp: number;
  weekActive: boolean[]; // Mon..Sun
  todayIndex: number; // 0..6
  lessonsDone: number;
};

export const getStats = cache(async (userId: string): Promise<Stats> => {
  const today = todayUtc();
  const weekStart = weekStartUtc();

  const [profile, days, lessonsDone] = await Promise.all([
    database.userProfile.findUnique({ where: { clerkUserId: userId }, select: { xp: true, gems: true } }),
    database.userActivityDay.findMany({
      where: { clerkUserId: userId },
      orderBy: { date: 'desc' },
      take: 400,
    }),
    database.userLessonProgress.count({ where: { clerkUserId: userId } }),
  ]);

  const key = (d: Date) => d.toISOString().slice(0, 10);
  const active = new Set(days.filter((d) => d.xp > 0 || d.lessons > 0).map((d) => key(d.date)));

  // Streak counts back from today, or from yesterday if today is still empty.
  let cursor = active.has(key(today)) ? today.getTime() : today.getTime() - DAY_MS;
  let streak = 0;
  while (active.has(key(new Date(cursor)))) {
    streak += 1;
    cursor -= DAY_MS;
  }

  const todayRow = days.find((d) => key(d.date) === key(today));
  const weekRows = days.filter((d) => d.date >= weekStart);

  return {
    xp: profile?.xp ?? 0,
    gems: profile?.gems ?? 0,
    streak,
    todayXp: todayRow?.xp ?? 0,
    todayLessons: todayRow?.lessons ?? 0,
    weekXp: weekRows.reduce((s, d) => s + d.xp, 0),
    weekActive: Array.from({ length: 7 }, (_, i) => active.has(key(new Date(weekStart.getTime() + i * DAY_MS)))),
    todayIndex: Math.round((today.getTime() - weekStart.getTime()) / DAY_MS),
    lessonsDone,
  };
});

// Courses that are not published yet, shown as "coming soon" cards.
export const getUpcomingCourses = cache(async () =>
  database.course.findMany({
    where: { published: false },
    orderBy: { order: 'asc' },
    select: { id: true, title: true, description: true },
  }),
);
