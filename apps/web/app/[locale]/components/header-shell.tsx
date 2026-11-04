'use client';

import { useEffect, useState, type ReactNode } from 'react';

// The floating header pill: slides in on load, then narrows and gets shorter once you scroll.
export function HeaderShell({ children }: { children: ReactNode }) {
  const [small, setSmall] = useState(false);

  useEffect(() => {
    // Two thresholds, so small scroll jitter near the top can never flip the header back and forth.
    const onScroll = () => setSmall((was) => (was ? window.scrollY > 8 : window.scrollY > 40));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    // The outer bar keeps a fixed height, and flow-root stops the pill's top margin from collapsing out of it,
    // so neither the white gap above the page nor a layout shift on scroll can happen.
    <header className="pointer-events-none sticky top-0 z-50 flow-root h-[88px]">
    <div
      className={`pointer-events-auto mx-auto transition-all duration-300 ease-out ${
        small ? 'mt-2 w-[min(92%,640px)]' : 'mt-4 w-[min(94%,900px)]'
      }`}
      style={{ animation: 'hdr-in 600ms cubic-bezier(.2,.8,.2,1) both' }}
    >
      <style>{`@keyframes hdr-in { from { opacity: 0; transform: translateY(-24px) } to { opacity: 1; transform: none } }`}</style>
      <div
        className={`relative flex items-center justify-between rounded-full bg-[#1F4D3A] transition-all duration-300 ease-out ${
          small
            ? 'py-1.5 pl-4 pr-1.5 shadow-lg shadow-[#1F4D3A]/25 [&>a:first-child>span]:text-base [&>a:first-child_img]:size-8 [&>a:last-child]:px-4 [&>a:last-child]:py-1.5 [&>a:last-child]:text-sm [&>div>a]:px-4 [&>div>a]:py-1.5 [&>div>a]:text-sm [&_button_img]:size-9 [&_button_span]:size-9'
            : 'py-3 pl-6 pr-3 [&>a:first-child_img]:size-10'
        } [&>a:first-child_img]:transition-all [&>a:first-child_img]:duration-300`}
      >
        {children}
      </div>
    </div>
    </header>
  );
}
