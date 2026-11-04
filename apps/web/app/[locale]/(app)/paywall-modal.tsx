'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { PlanPicker } from './billing-actions';

// A paywall popup that any premium course can open instead of navigating.

type Ctx = { open: () => void };
const PaywallContext = createContext<Ctx>({ open: () => {} });
export const usePaywall = () => useContext(PaywallContext);

const STEPS: [string, string, string][] = [
  ['🔓', 'Today', 'Unlock every course, free for 7 days'],
  ['🔔', 'Day 5', 'We remind you before the trial ends'],
  ['⭐', 'Day 7', 'Trial ends. Cancel anytime before'],
];

function Modal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0F2A1F]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      style={{ animation: 'ep-fade 200ms both' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Unlock all courses"
        className="relative max-h-[94vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 text-[#1F4D3A] shadow-2xl sm:rounded-3xl sm:p-7"
        style={{ animation: 'pw-in 260ms cubic-bezier(.2,.8,.2,1) both' }}
      >
        <style>{`
          @keyframes ep-fade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes pw-in { from { opacity: 0; transform: translateY(24px) scale(.98) } to { opacity: 1; transform: none } }
        `}</style>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-[#1F4D3A]/10 text-sm text-[#1F4D3A]/70 hover:bg-[#1F4D3A]/15"
        >
          ✕
        </button>
        <span className="inline-block rounded-full bg-[#C7F000] px-3 py-1 text-[11px] font-bold uppercase tracking-widest">Premium course</span>
        <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight">Start your 7-day free trial</h2>
        <p className="mt-1.5 text-sm text-[#1F4D3A]/60">Unlock every course, drill and challenge. Cancel anytime before it ends and you pay nothing.</p>

        <div className="mt-5 rounded-2xl bg-[#F3F6EC] p-4">
          {STEPS.map(([icon, day, text], i) => (
            <div key={day} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#C7F000] text-xs">{icon}</span>
                {i < STEPS.length - 1 && <span className="my-1 w-0.5 flex-1 rounded-full bg-[#1F4D3A]/15" />}
              </div>
              <div className={i < STEPS.length - 1 ? 'pb-2.5' : ''}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1F4D3A]/45">{day}</p>
                <p className="text-[13px] font-semibold leading-snug">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <PlanPicker />
        </div>
      </div>
    </div>
  );
}

export function PaywallProvider({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);
  const open = useCallback(() => setShown(true), []);
  const value = useMemo(() => ({ open }), [open]);
  return (
    <PaywallContext.Provider value={value}>
      {children}
      {shown && <Modal onClose={() => setShown(false)} />}
    </PaywallContext.Provider>
  );
}

/** Opens the popup as soon as the page loads (used when a locked lesson was opened by URL). */
export function OpenPaywallOnMount() {
  const { open } = usePaywall();
  useEffect(() => open(), [open]);
  return null;
}

/** A normal link, or a button that opens the paywall when the destination is premium. */
export function PremiumLink({
  locked,
  href,
  className,
  style,
  children,
  ...rest
}: {
  locked?: boolean;
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  'aria-label'?: string;
}) {
  const { open } = usePaywall();
  if (!locked) {
    return (
      <Link href={href} className={className} style={style} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={open} className={`${className ?? ''} text-left`} style={style} {...rest}>
      {children}
    </button>
  );
}
