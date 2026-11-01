import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

// Shared building blocks for the signed-in pages (design-only for now).

const TONES = {
  green: { bg: '#E8F0EA', fg: '#1F4D3A' },
  lime: { bg: '#F0FAC2', fg: '#4F6B00' },
  coral: { bg: '#FDEBE3', fg: '#C4562F' },
  teal: { bg: '#DDF1EE', fg: '#1D766B' },
  amber: { bg: '#FFF3D1', fg: '#9A6B00' },
  violet: { bg: '#ECE8FB', fg: '#5B4BC4' },
  gray: { bg: '#EEF0EB', fg: '#7B837C' },
} as const;
export type Tone = keyof typeof TONES;

export function IconBox({
  icon: Icon,
  tone = 'green',
  size = 44,
}: {
  icon: LucideIcon;
  tone?: Tone;
  size?: number;
}) {
  const t = TONES[tone];
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-xl"
      style={{ width: size, height: size, background: t.bg, color: t.fg }}
    >
      <Icon size={Math.round(size * 0.48)} strokeWidth={2} />
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#1F4D3A]/10 bg-white p-6 shadow-[0_1px_2px_rgba(16,40,28,0.04),0_8px_24px_-12px_rgba(16,40,28,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Bar({
  value,
  max,
  color = '#1F4D3A',
  height = 8,
}: {
  value: number;
  max: number;
  color?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full overflow-hidden rounded-full bg-[#1F4D3A]/8" style={{ height, background: 'rgba(31,77,58,0.08)' }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Stat({
  icon: Icon,
  value,
  tint,
}: {
  icon: LucideIcon;
  value: string;
  tint: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: tint }}>
      <Icon size={18} strokeWidth={2.2} fill="currentColor" fillOpacity={0.15} />
      {value}
    </span>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1F4D3A]/50">{children}</p>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-[#1F4D3A]/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 mt-10 flex items-center justify-between">
      <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
      {aside}
    </div>
  );
}

// Standard page container: fills the space next to the sidebar.
export function Page({ children, max = 1200 }: { children: ReactNode; max?: number }) {
  return (
    <main className="min-w-0 flex-1 px-4 pb-32 pt-9 lg:px-12 lg:pb-16">
      <div className="mx-auto w-full" style={{ maxWidth: max }}>
        {children}
      </div>
    </main>
  );
}

export function Btn({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  submit,
  disabled,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'lime' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
  href?: string;
  submit?: boolean;
  disabled?: boolean;
}) {
  const variants = {
    primary: 'bg-[#1F4D3A] text-white shadow-sm hover:bg-[#173d2e]',
    secondary: 'border border-[#1F4D3A]/15 bg-white text-[#1F4D3A] shadow-sm hover:bg-[#1F4D3A]/5',
    lime: 'bg-[#C7F000] text-[#1F4D3A] shadow-sm hover:bg-[#d4f526]',
    ghost: 'text-[#1F4D3A] hover:bg-[#1F4D3A]/5',
  };
  const sizes = { sm: 'px-3.5 py-2 text-[13px]', md: 'px-5 py-2.5 text-sm' };
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors ${
    disabled ? 'cursor-not-allowed opacity-50' : ''
  } ${variants[variant]} ${sizes[size]} ${className}`;
  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={submit ? 'submit' : 'button'} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function Pill({ children, tone = 'green' }: { children: ReactNode; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: t.bg, color: t.fg }}
    >
      {children}
    </span>
  );
}
