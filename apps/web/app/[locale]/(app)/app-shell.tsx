import { Flame, Gem, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { SiteLogo } from '../components/site-header';
import { BottomNav, SidebarNav } from './nav-links';
import { PandaBanner } from './panda-banner';
import { PaywallProvider } from './paywall-modal';
import { SidebarProfile } from './sidebar-profile';
import { Stat } from './ui';

// Shell shared by every signed-in page: sidebar on desktop, top bar and
// bottom nav on mobile.
export function AppShell({
  name,
  plan,
  stats,
  children,
}: {
  name?: string;
  plan?: string;
  stats: { streak: number; xp: number; gems: number };
  children: ReactNode;
}) {
  return (
    <PaywallProvider>
    <div className="min-h-screen overflow-x-clip bg-[#F7F8F4] text-[#1F4D3A]">
      <style>{`
        @keyframes dash-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
        @keyframes dash-pulse { 0% { box-shadow: 0 0 0 0 rgba(199,240,0,.6) } 70% { box-shadow: 0 0 0 16px rgba(199,240,0,0) } 100% { box-shadow: 0 0 0 0 rgba(199,240,0,0) } }
      `}</style>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#1F4D3A]/10 bg-[#F7F8F4]/90 px-4 py-3 backdrop-blur lg:hidden">
        <SiteLogo />
        <div className="flex items-center gap-4">
          <Stat icon={Flame} value={String(stats.streak)} tint="#C4562F" />
          <Stat icon={Zap} value={String(stats.xp)} tint="#9A6B00" />
          <Stat icon={Gem} value={String(stats.gems)} tint="#1D766B" />
        </div>
      </header>

      <div className="flex w-full">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-[#1F4D3A]/10 bg-white px-5 py-6 lg:flex">
          <div className="px-1">
            <SiteLogo />
          </div>
          <SidebarNav />
          <div className="mt-auto">
            <PandaBanner />
            <SidebarProfile name={name} plan={plan} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1">{children}</div>
      </div>

      <BottomNav />
    </div>
    </PaywallProvider>
  );
}
