import type { ReactNode } from 'react';
import { AppShell } from './app-shell';
import { getStats } from './data';
import { getProfile } from './get-profile';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { name, userId } = await getProfile();
  const stats = await getStats(userId);
  return (
    <AppShell name={name} stats={{ streak: stats.streak, xp: stats.xp, gems: stats.gems }}>
      {children}
    </AppShell>
  );
}
