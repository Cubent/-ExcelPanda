import { getCourseMaps, getStats, getUpcomingCourses } from '../data';
import { markLocked } from '@/lib/subscription';
import { getProfile } from '../get-profile';
import { OpenPaywallOnMount } from '../paywall-modal';
import { DashboardView } from './dashboard-view';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ upgrade?: string }> }) {
  const { upgrade } = await searchParams;
  const { name, userId, billing } = await getProfile();
  const [maps, stats, upcoming] = await Promise.all([
    getCourseMaps(userId),
    getStats(userId),
    getUpcomingCourses(),
  ]);
  return (
    <>
      {upgrade && <OpenPaywallOnMount />}
      <DashboardView name={name} maps={markLocked(maps, billing)} stats={stats} upcoming={upcoming} />
    </>
  );
}
