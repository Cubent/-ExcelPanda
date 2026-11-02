import { notFound } from 'next/navigation';
import { getCourseMaps, getLeaderboard, getStats } from '../../data';
import { getProfile } from '../../get-profile';
import { CourseView } from '../dashboard-view';

export const dynamic = 'force-dynamic';

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const { userId } = await getProfile();
  const [maps, stats, board] = await Promise.all([getCourseMaps(userId), getStats(userId), getLeaderboard(userId)]);
  const map = maps.find((m) => m.slug === slug);
  if (!map) notFound();
  return <CourseView map={map} stats={stats} board={board} />;
}
