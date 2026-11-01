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
  number: number;
  title: string;
  blurb: string;
  nodes: MapNode[];
};
export type CourseMap = {
  courseId: string;
  title: string;
  units: MapUnit[];
  total: number;
  completed: number;
  unitsDone: number;
  current: MapNode | null;
};

// First published course, with per-lesson state for this user. Lessons unlock
// in order: everything before the first unfinished lesson is done, that one is
// current, the rest are locked.
export const getCourseMap = cache(async (userId: string): Promise<CourseMap | null> => {
  const course = await database.course.findFirst({
    where: { published: true },
    orderBy: { order: 'asc' },
    include: {
      units: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
    },
  });
  if (!course) return null;

  const progress = await database.userLessonProgress.findMany({
    where: { clerkUserId: userId, lesson: { unit: { courseId: course.id } } },
    select: { lessonId: true },
  });
  const done = new Set(progress.map((p) => p.lessonId));

  let currentAssigned = false;
  let current: MapNode | null = null;
  let total = 0;
  let completed = 0;
  let unitsDone = 0;

  const usedSlugs = new Set<string>();
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
      if (usedSlugs.has(slug)) slug = `${slug}-${u.order}-${l.order}`;
      usedSlugs.add(slug);
      const node: MapNode = { id: l.id, slug, title: l.title, icon: l.icon, kind: l.kind, xp: l.xp, state, open: UNLOCK_ALL || state !== 'locked' };
      if (state === 'current') current = node;
      total += 1;
      if (state === 'done') completed += 1;
      return node;
    });
    if (nodes.length > 0 && nodes.every((n) => n.state === 'done')) unitsDone += 1;
    return { id: u.id, number: u.order, title: u.title, blurb: u.blurb, nodes };
  });

  return { courseId: course.id, title: course.title, units, total, completed, unitsDone, current };
});

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

// ---------------------------------------------------------------------------
// Leaderboard (this week's XP)
// ---------------------------------------------------------------------------

export type Ranked = { id: string; name: string; xp: number; me: boolean; rank: number };

export const getLeaderboard = cache(async (userId: string): Promise<Ranked[]> => {
  const rows = await database.userActivityDay.groupBy({
    by: ['clerkUserId'],
    where: { date: { gte: weekStartUtc() } },
    _sum: { xp: true },
    orderBy: { _sum: { xp: 'desc' } },
    take: 20,
  });

  const ids = new Set(rows.map((r) => r.clerkUserId));
  ids.add(userId); // always show the viewer, even with 0 XP this week

  const profiles = await database.userProfile.findMany({
    where: { clerkUserId: { in: [...ids] } },
    select: { clerkUserId: true, answers: true },
  });
  const nameOf = (id: string) => {
    const a = (profiles.find((p) => p.clerkUserId === id)?.answers ?? {}) as Record<string, unknown>;
    return typeof a.name === 'string' && a.name.trim() ? a.name.trim() : 'Learner';
  };

  const list = rows.map((r) => ({ id: r.clerkUserId, xp: r._sum.xp ?? 0 }));
  if (!list.some((r) => r.id === userId)) list.push({ id: userId, xp: 0 });

  return list.map((r, i) => ({
    id: r.id,
    name: r.id === userId ? 'You' : nameOf(r.id),
    xp: r.xp,
    me: r.id === userId,
    rank: i + 1,
  }));
});
