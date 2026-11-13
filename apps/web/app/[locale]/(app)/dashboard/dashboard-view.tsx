import {
  ArrowLeft,
  BookOpen,
  Calculator,
  ChartColumn,
  Check,
  ChevronRight,
  Flame,
  GitBranch,
  Gem,
  Gift,
  Grid3x3,
  LayoutDashboard,
  Library,
  ListChecks,
  Lock,
  Palette,
  Plus,
  Search,
  Sigma,
  Sparkles,
  Target,
  Trophy,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import {
  DAILY_LESSON_GOAL,
  DAILY_XP_GOAL,
  type CourseMap,
  type MapNode,
  type MapUnit,
  type Stats,
} from '../data';
import type { ReactNode } from 'react';
import { ChartFigure, DashFigure, Dots, FxFigure, PandaFigure, SheetFigure, SigmaFigure, StarFigure } from './art';
import { Bar, Btn, Card, IconBox, Label, Pill, SectionTitle, Stat, type Tone } from '../ui';
import { PaywallButton, PremiumLink } from '../paywall-modal';
import { StartOrResume } from '../resume-label';

// Lucide icon per lesson `icon` key stored in the database.
const ICONS: Record<string, LucideIcon> = {
  grid: Grid3x3,
  book: BookOpen,
  plus: Plus,
  sigma: Sigma,
  gift: Gift,
  palette: Palette,
  trophy: Trophy,
  branch: GitBranch,
  list: ListChecks,
  search: Search,
  wrench: Wrench,
  sparkles: Sparkles,
  calculator: Calculator,
  chart: ChartColumn,
  layout: LayoutDashboard,
};

// Horizontal wiggle (px) that gives the path its winding shape.
const WIGGLE = [0, 90, 150, 90, 0, -90, -150, -90];

// --- path -------------------------------------------------------------------

function PathNode({ node, offset, mascot, premium, resume }: { node: MapNode; offset: number; mascot?: boolean; premium?: boolean; resume?: boolean }) {
  const { state } = node;
  const big = node.kind === 'TEST';
  const size = big ? 92 : 84;
  const Icon = state === 'done' ? Check : (ICONS[node.icon] ?? BookOpen);
  const face =
    state === 'done'
      ? { bg: '#1F4D3A', edge: '#0F2A1F', fg: '#ffffff' }
      : state === 'current'
        ? { bg: '#C7F000', edge: '#98BA00', fg: '#1F4D3A' }
        : { bg: '#EDEFEA', edge: '#D3D8CF', fg: '#9AA39C' };

  const style = {
    width: size,
    height: size,
    background: face.bg,
    borderBottom: `6px solid ${face.edge}`,
    color: face.fg,
    animation: state === 'current' ? 'dash-pulse 2.2s infinite' : undefined,
  };
  const cls = 'relative flex items-center justify-center rounded-full transition-transform active:translate-y-0.5';
  const icon = <Icon size={big ? 40 : 34} strokeWidth={state === 'done' ? 3 : 2} />;

  return (
    <div
      className={`relative flex flex-col items-center ${state === 'current' ? 'mt-10' : ''}`}
      style={{ transform: `translateX(calc(${offset}px * var(--wig, 1)))` }}
    >
      {state === 'current' && (
        <div
          className="absolute -top-11 z-10 rounded-lg bg-[#1F4D3A] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white shadow-md"
          style={{ animation: 'dash-float 1.8s ease-in-out infinite' }}
        >
          <StartOrResume contentKey={node.contentKey} resume={resume} />
          <span className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-[#1F4D3A]" />
        </div>
      )}

      {state === 'locked' && !node.open ? (
        <span aria-label={`${node.title} (locked)`} className={`${cls} cursor-not-allowed`} style={style}>
          {icon}
        </span>
      ) : (
        <PremiumLink locked={premium} href={`/lesson/${node.slug}`} aria-label={node.title} className={cls} style={style}>
          {icon}
        </PremiumLink>
      )}

      <span
        className={`mt-3 text-[13px] ${
          state === 'current' ? 'font-semibold text-[#1F4D3A]' : state === 'done' ? 'font-medium text-[#1F4D3A]/80' : 'text-[#1F4D3A]/40'
        }`}
      >
        {node.title}
      </span>

    </div>
  );
}

export function UnitSection({ unit, first, premium, resume }: { unit: MapUnit; first: boolean; premium?: boolean; resume?: boolean }) {
  const locked = unit.nodes.every((n) => n.state === 'locked');
  const currentIdx = unit.nodes.findIndex((n) => n.state === 'current');
  const done = unit.nodes.filter((n) => n.state === 'done').length;
  const [from, to] = locked ? ['#8A9A92', '#9AA89F'] : ['#1F4D3A', '#2B6A50'];
  return (
    <section className={first ? '' : 'mt-16'}>
      <div
        className="flex items-center justify-between rounded-2xl px-6 py-5 text-white shadow-sm"
        style={{ background: `linear-gradient(120deg, ${from}, ${to})` }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">
            Unit {unit.number}
            {!locked && ` · ${done}/${unit.nodes.length} complete`}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">{unit.title}</h2>
          <p className="mt-0.5 text-sm text-white/75">{unit.blurb}</p>
        </div>
        {(premium || locked) && (
          <span className="hidden items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur sm:flex">
            {premium ? (
              <>
                <Lock size={15} /> Premium
              </>
            ) : (
              <>
                <Lock size={15} /> Locked
              </>
            )}
          </span>
        )}
      </div>

      <div className="mt-12 flex flex-col items-stretch gap-6 pb-2 [--wig:0.4] sm:[--wig:0.7] lg:[--wig:1]">
        {unit.nodes.map((node, i) => (
          <PathNode key={node.id} node={node} offset={WIGGLE[i % WIGGLE.length]} mascot={i === currentIdx} premium={premium} resume={resume} />
        ))}
      </div>
    </section>
  );
}

function EmptyPath() {
  return (
    <Card className="flex flex-col items-center py-14 text-center">
      <IconBox icon={Library} tone="gray" size={52} />
      <h2 className="mt-4 text-lg font-semibold">No courses available yet</h2>
      <p className="mt-1 max-w-sm text-sm text-[#1F4D3A]/60">
        New courses are on the way. Your account is ready, so check back soon.
      </p>
    </Card>
  );
}

// --- page -------------------------------------------------------------------

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type RailProps = { map: CourseMap | null; stats: Stats };

/** Shared page frame: main column on the left, stats rail on the right. */
export function DashboardLayout({ map, stats, children }: RailProps & { children: ReactNode }) {
  const pct = map && map.total > 0 ? Math.round((map.completed / map.total) * 100) : 0;
  const remaining = map ? map.total - map.completed : 0;

  const quests: { icon: LucideIcon; tone: Tone; label: string; value: number; max: number }[] = [
    { icon: Zap, tone: 'amber', label: `Earn ${DAILY_XP_GOAL} XP`, value: Math.min(stats.todayXp, DAILY_XP_GOAL), max: DAILY_XP_GOAL },
    { icon: Target, tone: 'teal', label: `Finish ${DAILY_LESSON_GOAL} lessons`, value: Math.min(stats.todayLessons, DAILY_LESSON_GOAL), max: DAILY_LESSON_GOAL },
  ];

  return (
    <div className="flex w-full">
      <main className="min-w-0 flex-1 overflow-x-clip px-4 pb-32 pt-9 lg:px-12 lg:pb-16">
        <div className="mx-auto w-full max-w-[820px]">{children}</div>
      </main>

      <aside className="sticky top-0 hidden h-screen w-[380px] shrink-0 flex-col gap-4 overflow-y-auto py-9 pr-8 xl:flex">
        <div className="flex items-center justify-between px-1">
          <Stat icon={Flame} value={String(stats.streak)} tint="#C4562F" />
          <Stat icon={Zap} value={`${stats.xp} XP`} tint="#9A6B00" />
          <Stat icon={Gem} value={String(stats.gems)} tint="#1D766B" />
        </div>

        <Card className="!p-5">
          <div className="flex items-center gap-3">
            <IconBox icon={Flame} tone="coral" size={38} />
            <div className="leading-tight">
              <h3 className="text-[15px] font-semibold">
                {stats.streak} day streak
              </h3>
              <p className="text-xs text-[#1F4D3A]/50">
                {stats.weekActive[stats.todayIndex] ? 'You practiced today' : 'Complete a lesson to keep it'}
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-between">
            {WEEK.map((d, i) => {
              const active = stats.weekActive[i];
              const today = i === stats.todayIndex;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`flex size-8 items-center justify-center rounded-full text-xs ${
                      active ? 'bg-[#C4562F] text-white' : today ? 'border-2 border-dashed border-[#C4562F]/60' : ''
                    }`}
                    style={!active && !today ? { background: 'rgba(31,77,58,0.08)' } : undefined}
                  >
                    {active && <Check size={15} strokeWidth={3} />}
                  </span>
                  <span className={`text-[11px] font-medium ${today ? 'text-[#1F4D3A]' : 'text-[#1F4D3A]/45'}`}>{d}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="!p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">Daily quests</h3>
            <Link href="/quests" className="flex items-center text-xs font-semibold text-[#1D766B]">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {quests.map((q) => (
              <div key={q.label} className="flex items-center gap-3">
                <IconBox icon={q.icon} tone={q.tone} size={38} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold">{q.label}</p>
                    <span className="text-xs font-medium text-[#1F4D3A]/50">
                      {q.value}/{q.max}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <Bar value={q.value} max={q.max} height={6} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div
          className="rounded-2xl p-5 text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg,#1F4D3A,#143326)' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C7F000]">ExcelPanda Pro</p>
            <Pill tone="lime">7 days free</Pill>
          </div>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">Master Excel faster</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-white/70">
            Unlimited lessons, mistake review and completion certificates.
          </p>
          <PaywallButton className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C7F000] px-5 py-2.5 text-sm font-semibold text-[#1F4D3A] shadow-sm transition-colors hover:bg-[#d4f526]">
            Start free trial
          </PaywallButton>
        </div>
      </aside>
    </div>
  );
}

// --- course map page -------------------------------------------------------

export function CourseView({ map, stats }: RailProps & { map: CourseMap }) {
  const pct = map.total > 0 ? Math.round((map.completed / map.total) * 100) : 0;
  return (
    <DashboardLayout map={map} stats={stats}>
      <Link href="/dashboard" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#1F4D3A]/60 hover:text-[#1F4D3A]">
        <ArrowLeft size={16} /> All courses
      </Link>
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{map.title}</h1>
        <p className="mt-1.5 text-[15px] text-[#1F4D3A]/60">
          {pct}% complete · {map.total - map.completed} lessons to go
        </p>
      </div>
      {map.units.map((unit, i) => (
        <UnitSection key={unit.id} unit={unit} first={i === 0} premium={unit.locked} resume={map.completed > 0} />
      ))}
    </DashboardLayout>
  );
}

// --- overview: courses ------------------------------------------------------

// Difficulty of each course (1 = beginner, 2 = intermediate, 3 = advanced). Unknown courses fall back to their position.
const LEVELS: Record<string, 1 | 2 | 3> = {
  'excel-basics': 1,
  'formulas-functions': 1,
  'data-analysis-pivots': 2,
  'data-dashboards': 2,
  'excel-finance': 2,
  'advanced-formulas': 3,
  'excel-automation': 3,
};
const LEVEL_NAMES = ['Beginner', 'Intermediate', 'Advanced'] as const;
const LEVEL_COLORS = ['#58CC02', '#FFB800', '#FF4B4B'] as const;

/** Duolingo-style difficulty meter: three bars that fill up with the level. */
function LevelMeter({ level }: { level: 1 | 2 | 3 }) {
  const color = LEVEL_COLORS[level - 1];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color }}>
      <span className="flex items-end gap-0.5" aria-hidden>
        {[1, 2, 3].map((b) => (
          <span key={b} className="w-1 rounded-full" style={{ height: 6 + b * 3, background: b <= level ? color : '#1F4D3A22' }} />
        ))}
      </span>
      {LEVEL_NAMES[level - 1]}
    </span>
  );
}

export function DashboardView({
  name,
  maps,
  stats,
  upcoming,
}: Omit<RailProps, 'map'> & { name?: string; maps: CourseMap[]; upcoming: { id: string; title: string; description: string }[] }) {
  // Pick up the course you have started, otherwise the first one with something left to do.
  const usable = maps.filter((m) => !m.locked);
  const active = usable.find((m) => m.completed > 0 && m.current) ?? usable.find((m) => m.current) ?? usable[0] ?? maps[0] ?? null;
  const pct = active && active.total > 0 ? Math.round((active.completed / active.total) * 100) : 0;
  const next = active?.current ?? null;
  const nextUnit = next ? active?.units.find((u) => u.nodes.some((n) => n.id === next.id)) : null;
  const isFirstTime = maps.every((m) => m.completed === 0);

  return (
    <DashboardLayout map={active} stats={stats}>
      <div className="mb-7">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
          {isFirstTime ? 'Welcome' : 'Welcome back'}{name ? `, ${name}` : ''}
        </h1>
        {active && (
          <p className="mt-1.5 text-[15px] text-[#1F4D3A]/60">
            {active.title} · {pct}% complete · {active.total - active.completed} lessons to go
          </p>
        )}
      </div>

      {next && nextUnit && (
        <PremiumLink
          locked={nextUnit.locked}
          href={`/lesson/${next.slug}`}
          className="mb-9 flex w-full items-center gap-4 rounded-2xl bg-[#1F4D3A] p-5 text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <PandaFigure size={56} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white/60">{isFirstTime ? 'Start your first lesson' : 'Continue where you left off'}</p>
            <h2 className="truncate text-lg font-semibold tracking-tight">{next.title}</h2>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-xl bg-[#C7F000] px-4 py-2 text-sm font-semibold text-[#1F4D3A]">
            {nextUnit.locked ? <Lock size={14} /> : null} <StartOrResume contentKey={next.contentKey} resume={!!active && active.completed > 0} /> <ChevronRight size={16} />
          </span>
        </PremiumLink>
      )}

      <section>
        <SectionTitle>Courses</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {maps.filter((m) => m.units.length > 0).map((m, mi) => {
            const mpct = m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0;
            const status = m.completed >= m.total && m.total > 0 ? 'Complete' : m.completed > 0 ? 'In progress' : 'New';
            return (
              <PremiumLink
                key={m.courseId}
                locked={m.locked}
                href={`/dashboard/${m.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border-2 border-b-4 border-[#1F4D3A]/20 bg-white transition-all hover:-translate-y-0.5 hover:border-[#1F4D3A]/40 active:translate-y-0.5 active:border-b-2"
              >
                {mi % 7 === 0 ? (
                  <div className="relative h-40 overflow-hidden bg-[#C7F000]/55">
                    <Dots className="absolute inset-0 h-full w-full" />
                    <SheetFigure size={104} className="absolute left-[14%] top-6 -rotate-6 transition-transform group-hover:-rotate-3" />
                    <ChartFigure size={84} className="absolute right-[10%] top-3 rotate-6" />
                    <FxFigure size={54} className="absolute bottom-3 right-[34%] -rotate-12" />
                    <StarFigure size={30} className="absolute bottom-4 right-4 rotate-12" />
                  </div>
                ) : mi % 7 === 2 ? (
                  <div className="relative h-40 overflow-hidden bg-[#D4EDE6]">
                    <Dots className="absolute inset-0 h-full w-full" />
                    <ChartFigure size={112} className="absolute left-[10%] top-4 rotate-3 transition-transform group-hover:rotate-0" />
                    <SheetFigure size={84} className="absolute right-[12%] top-6 -rotate-6" />
                    <StarFigure size={32} className="absolute bottom-4 left-[44%] rotate-12" />
                  </div>
                ) : mi % 7 === 3 ? (
                  <div className="relative h-40 overflow-hidden bg-[#FAD9CB]">
                    <Dots className="absolute inset-0 h-full w-full" />
                    <SigmaFigure size={96} className="absolute left-[14%] top-5 -rotate-6 transition-transform group-hover:rotate-0" />
                    <FxFigure size={84} className="absolute right-[14%] top-8 rotate-6" />
                    <StarFigure size={30} className="absolute bottom-4 left-[46%] -rotate-12" />
                  </div>
                ) : mi % 7 === 4 ? (
                  <div className="relative h-40 overflow-hidden bg-[#DCE6F7]">
                    <Dots className="absolute inset-0 h-full w-full" />
                    <DashFigure size={116} className="absolute left-[12%] top-3 rotate-3 transition-transform group-hover:rotate-0" />
                    <SigmaFigure size={64} className="absolute right-[16%] top-8 -rotate-6" />
                    <StarFigure size={30} className="absolute bottom-4 left-[52%] rotate-12" />
                  </div>
                ) : mi % 7 === 5 ? (
                  <div className="relative h-40 overflow-hidden bg-[#E6DDF3]">
                    <Dots className="absolute inset-0 h-full w-full" />
                    <SigmaFigure size={104} className="absolute left-[14%] top-5 rotate-6 transition-transform group-hover:rotate-0" />
                    <ChartFigure size={84} className="absolute right-[12%] top-6 -rotate-6" />
                    <FxFigure size={46} className="absolute bottom-3 left-[46%] rotate-12" />
                  </div>
                ) : mi % 7 === 6 ? (
                  <div className="relative h-40 overflow-hidden bg-[#D9EAD3]">
                    <Dots className="absolute inset-0 h-full w-full" />
                    <FxFigure size={96} className="absolute left-[16%] top-5 rotate-6 transition-transform group-hover:rotate-0" />
                    <DashFigure size={88} className="absolute right-[12%] top-5 -rotate-6" />
                    <StarFigure size={30} className="absolute bottom-4 left-[48%] -rotate-12" />
                  </div>
                ) : (
                  <div className="relative h-40 overflow-hidden bg-[#FFE9A8]">
                    <Dots className="absolute inset-0 h-full w-full" />
                    <FxFigure size={112} className="absolute left-[12%] top-4 -rotate-6 transition-transform group-hover:-rotate-3" />
                    <SigmaFigure size={84} className="absolute right-[14%] top-5 rotate-6" />
                    <StarFigure size={32} className="absolute bottom-5 left-[8%] rotate-12" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold tracking-tight">{m.title}</h3>
                    {m.locked ? (
                      <Pill tone="amber">
                        <Lock size={12} /> Premium
                      </Pill>
                    ) : (
                      <Pill tone={status === 'New' ? 'gray' : 'lime'}>{status}</Pill>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#1F4D3A]/60">{m.description}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[#1F4D3A]/50">
                      {m.units.length} units · {m.total} lessons
                    </p>
                    <LevelMeter level={LEVELS[m.slug] ?? (Math.min(3, Math.floor((mi * 3) / Math.max(maps.length, 1)) + 1) as 1 | 2 | 3)} />
                  </div>
                  <div className="mt-4">
                    <Bar value={m.completed} max={Math.max(m.total, 1)} height={8} />
                    <p className="mt-2 text-xs font-medium text-[#1F4D3A]/50">{mpct}% complete</p>
                  </div>
                  <span className="mt-4 flex items-center justify-center rounded-2xl border-b-4 border-[#0F2A1F] bg-[#1F4D3A] py-3 text-sm font-bold uppercase tracking-wide text-white group-hover:bg-[#245a43]">
                    {m.locked ? (
                      <>
                        <Lock size={15} className="mr-2" /> Unlock
                      </>
                    ) : m.completed > 0 ? (
                      'Continue'
                    ) : (
                      'Start'
                    )}
                  </span>
                </div>
              </PremiumLink>
            );
          })}
          {upcoming.map((c, i) => (
            <div key={c.id} className="flex flex-col overflow-hidden rounded-3xl border-2 border-b-4 border-[#1F4D3A]/12 bg-white">
              <div className={`relative h-40 overflow-hidden ${i % 2 === 0 ? 'bg-[#DDF4EC]' : 'bg-[#FFF3D1]'}`}>
                <Dots className="absolute inset-0 h-full w-full" />
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-60 grayscale-[40%]">
                  {i % 2 === 0 ? <FxFigure size={84} className="-rotate-6" /> : <SigmaFigure size={84} className="rotate-6" />}
                  <StarFigure size={38} className="rotate-12" />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-tight">{c.title}</h3>
                  <Pill tone="gray">Coming soon</Pill>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-[#1F4D3A]/60">{c.description}</p>
                <span className="mt-5 flex items-center justify-center rounded-2xl border-b-4 border-[#1F4D3A]/15 bg-[#1F4D3A]/8 py-3 text-sm font-bold uppercase tracking-wide text-[#1F4D3A]/40">
                  Locked
                </span>
              </div>
            </div>
          ))}
        </div>
        {maps.length === 0 && upcoming.length === 0 && <EmptyPath />}
      </section>
    </DashboardLayout>
  );
}
