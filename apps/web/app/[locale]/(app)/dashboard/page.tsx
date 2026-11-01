import { getCourseMap, getLeaderboard, getStats } from '../data';
import { getProfile } from '../get-profile';
import { DashboardView } from './dashboard-view';

export default async function DashboardPage() {
  const { name, userId } = await getProfile();
  const [map, stats, board] = await Promise.all([
    getCourseMap(userId),
    getStats(userId),
    getLeaderboard(userId),
  ]);
  return <DashboardView name={name} map={map} stats={stats} board={board} />;
}
