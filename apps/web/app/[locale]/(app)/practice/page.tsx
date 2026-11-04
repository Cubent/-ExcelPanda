import {
  ArrowRight,
  Keyboard,
  Layers,
  Lock,
  Puzzle,
  Sigma,
  Timer,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { hasAccess, markLocked } from '@/lib/subscription';
import { getCourseMaps } from '../data';
import { getProfile } from '../get-profile';
import { OpenPaywallOnMount, PremiumLink } from '../paywall-modal';
import { Btn, Card, IconBox, Page, PageHeader, Pill, SectionTitle, type Tone } from '../ui';

export const metadata = { title: 'Practice – ExcelPanda' };

const MODES: { icon: LucideIcon; tone: Tone; title: string; blurb: string; href: string; cta: string }[] = [
  { icon: Zap, tone: 'amber', title: 'Quick drill', blurb: 'Five fast tasks drawn from the lessons you have finished.', href: '/train/quick', cta: 'Start drill' },
  { icon: Wrench, tone: 'coral', title: 'Fix your mistakes', blurb: 'Replay the steps where you needed a hint or skipped, until they stick.', href: '/train/mistakes', cta: 'Replay mistakes' },
  { icon: Layers, tone: 'teal', title: 'Formula flashcards', blurb: 'Flip through the functions you use most.', href: '/train/flashcards', cta: 'Open flashcards' },
  { icon: Timer, tone: 'violet', title: 'Timed challenge', blurb: 'Six spreadsheet tasks in five minutes. Beat the clock.', href: '/train/timed', cta: 'Start challenge' },
  { icon: Puzzle, tone: 'green', title: 'Real-world cases', blurb: 'Budgets, reports and inventory sheets, step by step.', href: '/train/cases', cta: 'Pick a case' },
  { icon: Keyboard, tone: 'gray', title: 'Shortcut trainer', blurb: 'Learn the keyboard moves that save hours.', href: '/train/shortcuts', cta: 'Train shortcuts' },
];

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ upgrade?: string }> }) {
  const { upgrade } = await searchParams;
  const { userId, billing } = await getProfile();
  const locked = !hasAccess(billing);
  const maps = markLocked(await getCourseMaps(userId), billing).filter((m) => !m.locked);
  const current = (maps.find((m) => m.completed > 0 && m.current) ?? maps.find((m) => m.current))?.current ?? null;

  return (
    <Page>
      {upgrade && <OpenPaywallOnMount />}
      <PageHeader title="Practice" subtitle="Short sessions, steady progress. Practice earns no XP, so there is no pressure." />

      <div
        className="relative overflow-hidden rounded-2xl p-8 text-white shadow-sm"
        style={{ background: 'linear-gradient(120deg,#1F4D3A 0%,#2B6A50 100%)' }}
      >
        <div className="relative z-10 max-w-lg">
          <Pill tone="lime">{current ? 'Up next' : 'All caught up'}</Pill>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            {current ? current.title : 'You have finished every lesson'}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/75">
            {current
              ? 'Continue where you left off on your learning path.'
              : 'Keep your skills sharp with the training modes below.'}
          </p>
          {current && (
            <div className="mt-6 flex items-center gap-4">
              <Btn variant="lime" href={`/lesson/${current.slug}`}>
                Continue <ArrowRight size={16} />
              </Btn>
              {current.xp > 0 && <span className="text-sm font-medium text-white/70">+{current.xp} XP</span>}
            </div>
          )}
        </div>
        <Sigma className="absolute -right-6 -top-6 text-white/10" size={260} strokeWidth={1.2} aria-hidden />
      </div>

      <SectionTitle>Training modes</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MODES.map((m) => (
          <Card key={m.title} className="flex flex-col">
            <div className="flex items-start justify-between">
              <IconBox icon={m.icon} tone={m.tone} />
              {locked && (
                <Pill tone="amber">
                  <Lock size={12} /> Premium
                </Pill>
              )}
            </div>
            <h3 className="mt-5 text-base font-semibold">{m.title}</h3>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-[#1F4D3A]/60">{m.blurb}</p>
            {locked ? (
              <PremiumLink
                locked
                href={m.href}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1F4D3A]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#1F4D3A] shadow-sm transition-colors hover:bg-[#1F4D3A]/5"
              >
                <Lock size={15} /> Unlock
              </PremiumLink>
            ) : (
              <Btn variant="secondary" className="mt-5 w-full" href={m.href}>
                {m.cta} <ArrowRight size={16} />
              </Btn>
            )}
          </Card>
        ))}
      </div>
    </Page>
  );
}
