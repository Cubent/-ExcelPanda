'use client';

import { Dumbbell, LifeBuoy, Map as MapIcon, Target, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Learn', icon: MapIcon, href: '/dashboard' },
  { label: 'Practice', icon: Dumbbell, href: '/practice' },
  { label: 'Quests', icon: Target, href: '/quests' },
  { label: 'Profile', icon: UserRound, href: '/profile' },
  { label: 'Support', icon: LifeBuoy, href: '/support' },
];

function useActive() {
  const pathname = usePathname() ?? '';
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const isActive = useActive();
  return (
    <nav className="mt-8 flex flex-col gap-1">
      {NAV.map(({ label, icon: Icon, href }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-medium transition-colors ${
              active ? 'bg-[#1F4D3A]/8 text-[#1F4D3A]' : 'text-[#1F4D3A]/65 hover:bg-[#1F4D3A]/5 hover:text-[#1F4D3A]'
            }`}
            style={active ? { background: 'rgba(31,77,58,0.08)' } : undefined}
          >
            {active && <span className="absolute -left-4 top-2 h-6 w-1 rounded-r-full bg-[#1F4D3A]" />}
            <Icon size={20} strokeWidth={active ? 2.3 : 1.9} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const isActive = useActive();
  const tabs = NAV.filter((n) => n.href !== '/support');
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-[#1F4D3A]/10 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      {tabs.map(({ label, icon: Icon, href }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium ${
              active ? 'text-[#1F4D3A]' : 'text-[#1F4D3A]/50'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.3 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
