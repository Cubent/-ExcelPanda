import type { ReactNode } from 'react';
import { AppShell } from './app-shell';
import { getProfile } from './get-profile';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { name } = await getProfile();
  return <AppShell name={name}>{children}</AppShell>;
}
