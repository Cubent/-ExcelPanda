'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { ChevronUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Bottom-left account card in the app sidebar: click to toggle a menu with Sign out.
export function SidebarProfile({ name, plan = 'No plan' }: { name?: string; plan?: string }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const label = name ?? user?.firstName ?? 'You';
  const initial = (label || '?').charAt(0).toUpperCase();

  return (
    <div ref={box} className="relative mt-auto">
      {open && (
        <div role="menu" className="absolute inset-x-0 bottom-[calc(100%+8px)] rounded-2xl bg-white p-2 shadow-xl ring-1 ring-[#1F4D3A]/10">
          {email && <p className="truncate px-3 py-2 text-xs text-[#1F4D3A]/55">{email}</p>}
          <div className="my-1 h-px bg-[#1F4D3A]/10" />
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ redirectUrl: '/' })}
            className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-[#F3F6EC]"
          >
            Sign out
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl border border-[#1F4D3A]/10 bg-[#F7F8F4] px-3.5 py-3 text-left transition-colors hover:bg-[#F3F6EC]"
      >
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt="" className="size-9 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#C7F000] text-sm font-semibold">{initial}</span>
        )}
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-semibold">{label}</span>
          <span className="block text-xs text-[#1F4D3A]/50">{plan}</span>
        </span>
        <ChevronUp className={`size-4 shrink-0 text-[#1F4D3A]/50 transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>
    </div>
  );
}
