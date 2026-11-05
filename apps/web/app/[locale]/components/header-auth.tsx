'use client';

import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { StartFreeButton } from './start-free-button';

// Right side of the marketing header: "Start free" for visitors, Dashboard + a profile dropdown once signed in.
export function HeaderAuth() {
  const { isLoaded, isSignedIn } = useAuth();
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

  if (!isLoaded) return <span aria-hidden className="h-9 w-28 sm:h-12 sm:w-32" />;

  if (!isSignedIn) {
    return (
      <StartFreeButton className="rounded-full bg-[#C7F000] px-4 py-2 text-sm font-semibold text-[#1F4D3A] transition-colors hover:bg-[#d6ff1a] sm:px-6 sm:py-2.5 sm:text-base">
        Start free
      </StartFreeButton>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const name = user?.fullName || user?.firstName || email;
  const initial = (name || '?').charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      <Link
        href="/dashboard"
        className="rounded-full bg-[#C7F000] px-3.5 py-1.5 text-sm font-semibold text-[#1F4D3A] transition-colors hover:bg-[#d6ff1a] sm:px-6 sm:py-2.5 sm:text-base"
      >
        Dashboard
      </Link>
      <div ref={box} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Account menu"
          className="block rounded-full outline-none ring-[#C7F000] focus-visible:ring-2"
        >
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="" className="size-9 rounded-full border-2 border-[#C7F000] object-cover sm:size-12" />
          ) : (
            <span className="grid size-9 place-items-center rounded-full bg-[#C7F000] text-base font-semibold text-[#1F4D3A] sm:size-12 sm:text-lg">{initial}</span>
          )}
        </button>
        {open && (
          <div role="menu" className="absolute right-0 top-[calc(100%+12px)] z-50 w-64 rounded-2xl bg-white p-2 text-[#1F4D3A] shadow-xl ring-1 ring-[#1F4D3A]/10">
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-semibold">{name}</p>
              {email && email !== name && <p className="truncate text-xs text-[#1F4D3A]/55">{email}</p>}
            </div>
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
      </div>
    </div>
  );
}
