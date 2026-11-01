'use server';

import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { getCourseMap, todayUtc } from '../(app)/data';

const GEMS = { LESSON: 2, CHEST: 15, TEST: 20 } as const;

// Marks the user's current lesson complete and awards XP and gems. Only the
// "current" lesson can be completed, so the path always unlocks in order.
export type CompleteResult = { ok: boolean; xp: number; gems: number };

export async function completeLesson(lessonId: string): Promise<CompleteResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, xp: 0, gems: 0 };

  const map = await getCourseMap(userId);
  const node = map?.units.flatMap((u) => u.nodes).find((n) => n.id === lessonId);
  if (!node) return { ok: false, xp: 0, gems: 0 };
  // Already completed (or not unlocked yet): nothing to award.
  if (node.state === 'done') return { ok: true, xp: 0, gems: 0 };
  if (!node.open) return { ok: false, xp: 0, gems: 0 };

  const date = todayUtc();
  try {
    await database.$transaction([
      database.userLessonProgress.create({ data: { clerkUserId: userId, lessonId } }),
      database.userProfile.update({
        where: { clerkUserId: userId },
        data: { xp: { increment: node.xp }, gems: { increment: GEMS[node.kind] } },
      }),
      database.userActivityDay.upsert({
        where: { clerkUserId_date: { clerkUserId: userId, date } },
        create: { clerkUserId: userId, date, xp: node.xp, lessons: 1 },
        update: { xp: { increment: node.xp }, lessons: { increment: 1 } },
      }),
    ]);
  } catch (e) {
    // Unique constraint = double submit; the completion is already recorded.
    if ((e as { code?: string }).code !== 'P2002') {
      console.error('completeLesson failed', e);
      return { ok: false, xp: 0, gems: 0 };
    }
    return { ok: true, xp: 0, gems: 0 };
  }

  return { ok: true, xp: node.xp, gems: GEMS[node.kind] };
}
