import { getCourseMaps, getLeaderboard, getStats, getUpcomingCourses } from '../data';
import { getProfile } from '../get-profile';
import { DashboardView } from './dashboard-view';

export default async function DashboardPage() {
  const { name, userId } = await getProfile();
  const [maps, stats, board, upcoming] = await Promise.all([
    getCourseMaps(userId),
    getStats(userId),
    getLeaderboard(userId),
    getUpcomingCourses(),
  ]);
  return <DashboardView name={name} maps={maps} stats={stats} board={board} upcoming={upcoming} />;
}
