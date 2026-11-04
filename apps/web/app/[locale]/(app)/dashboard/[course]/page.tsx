import { markLocked } from '@/lib/subscription';
import { notFound } from 'next/navigation';
import { getCourseMaps, getStats } from '../../data';
import { getProfile } from '../../get-profile';
import { CourseView } from '../dashboard-view';

export const dynamic = 'force-dynamic';

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const { userId, billing } = await getProfile();
  const [maps, stats] = await Promise.all([getCourseMaps(userId), getStats(userId)]);
  const map = markLocked(maps, billing).find((m) => m.slug === slug);
  if (!map) notFound();
  return <CourseView map={map} stats={stats} />;
}
