'use client';

import type { ReactNode } from 'react';
import { macKey, useIsMac } from './platform';

// A keyboard key cap, used inside lesson instructions.
export function K({ children }: { children: ReactNode }) {
  const mac = useIsMac();
  const label = mac && typeof children === 'string' ? macKey(children) : children;
  return (
    <kbd className="mx-0.5 inline-flex min-w-6 items-center justify-center rounded-md border border-b-2 border-[#0F2E22] bg-[#1F4D3A] px-1.5 py-0.5 font-sans text-[12px] font-semibold text-[#C7F000] shadow-sm">
      {label}
    </kbd>
  );
}

// An inline cell reference like B2.
export function Cell({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-[#C7F000]/45 px-1.5 py-0.5 font-mono text-[13px] font-semibold text-[#1F4D3A]">
      {children}
    </span>
  );
}

// A formula or code snippet to type, e.g. <F>{'=SUM(A1:A5)'}</F>. Pass the text as a string child.
export function F({ children }: { children: string }) {
  return (
    <code className="rounded-md bg-[#1F4D3A]/8 px-1.5 py-0.5 font-mono text-[13px] font-semibold text-[#1F4D3A]">
      {children}
    </code>
  );
}
