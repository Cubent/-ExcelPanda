'use client';

import { Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const KEY = 'xp-panda-banner-dismissed';

// Announcement card above the account card in the sidebar: tells people the AI tutor exists.
export function PandaBanner() {
  const [hidden, setHidden] = useState(true); // start hidden so a dismissed banner never flashes
  useEffect(() => {
    try {
      setHidden(localStorage.getItem(KEY) === '1');
    } catch {
      setHidden(false);
    }
  }, []);
  if (hidden) return null;

  return (
    <div
      className="relative mb-3 overflow-hidden rounded-2xl border-2 border-b-4 border-[#0F2A1F] p-4 text-white"
      style={{ background: 'linear-gradient(140deg,#1F4D3A 0%,#143326 100%)' }}
    >
      <span className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-[#C7F000]/20 blur-xl" />
      <span className="pointer-events-none absolute -bottom-8 -left-4 size-20 rounded-full bg-[#C7F000]/10 blur-xl" />
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          setHidden(true);
          try {
            localStorage.setItem(KEY, '1');
          } catch {}
        }}
        className="absolute right-2 top-2 grid size-6 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
      >
        <X size={14} />
      </button>
      <div className="relative flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-b-4 border-[#98BA00] bg-[#C7F000] text-[#1F4D3A]">
          <Sparkles size={17} strokeWidth={2.6} />
        </span>
        <span className="rounded-full bg-[#C7F000] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#1F4D3A]">New</span>
      </div>
      <p className="relative mt-3 text-[15px] font-extrabold leading-snug tracking-tight">Stuck on a lesson? Ask Panda!</p>
      <p className="relative mt-1 text-[13px] leading-snug text-white/70">
        Our new AI tutor knows exactly which step you are on and nudges you in the right direction. Tap <strong className="font-bold text-[#C7F000]">Ask Panda</strong> inside any lesson.
      </p>
    </div>
  );
}
