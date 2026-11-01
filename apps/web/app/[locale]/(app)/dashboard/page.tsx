import { getProfile } from '../get-profile';
import { DashboardView } from './dashboard-view';

export default async function DashboardPage() {
  const { name } = await getProfile();
  return <DashboardView name={name} />;
}
