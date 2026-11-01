import {
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
  type Ranked,
  type Stats,
} from '../data';
import { Bar, Btn, Card, IconBox, Label, Pill, Stat, type Tone } from '../ui';

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

function PathNode({ node, offset, mascot }: { node: MapNode; offset: number; mascot?: boolean }) {
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
          Start
          <span className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-[#1F4D3A]" />
        </div>
      )}

      {state === 'locked' && !node.open ? (
        <span aria-label={`${node.title} (locked)`} className={`${cls} cursor-not-allowed`} style={style}>
          {icon}
        </span>
      ) : (
        <Link href={`/lesson/${node.slug}`} aria-label={node.title} className={cls} style={style}>
          {icon}
        </Link>
      )}

      <span
        className={`mt-3 text-[13px] ${
          state === 'current' ? 'font-semibold text-[#1F4D3A]' : state === 'done' ? 'font-medium text-[#1F4D3A]/80' : 'text-[#1F4D3A]/40'
        }`}
      >
        {node.title}
      </span>

      {mascot && (
        <img
          src="/animateos-logo (4).png"
          alt=""
          className="absolute left-1/2 top-2 ml-16 hidden size-16 rounded-2xl object-cover shadow-md sm:block"
          style={{ animation: 'dash-float 2.6s ease-in-out infinite' }}
        />
      )}
    </div>
  );
}

function UnitSection({ unit, first }: { unit: MapUnit; first: boolean }) {
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
        <span className="hidden items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur sm:flex">
          {locked ? (
            <>
              <Lock size={15} /> Locked
            </>
          ) : (
            <>
              <BookOpen size={15} /> Guide
            </>
          )}
        </span>
      </div>

      <div className="mt-12 flex flex-col items-stretch gap-6 pb-2 [--wig:0.4] sm:[--wig:0.7] lg:[--wig:1]">
        {unit.nodes.map((node, i) => (
          <PathNode key={node.id} node={node} offset={WIGGLE[i % WIGGLE.length]} mascot={i === currentIdx} />
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

export function DashboardView({
  name,
  map,
  stats,
  board,
}: {
  name?: string;
  map: CourseMap | null;
  stats: Stats;
  board: Ranked[];
}) {
  const pct = map && map.total > 0 ? Math.round((map.completed / map.total) * 100) : 0;
  const remaining = map ? map.total - map.completed : 0;

  const quests: { icon: LucideIcon; tone: Tone; label: string; value: number; max: number }[] = [
    { icon: Zap, tone: 'amber', label: `Earn ${DAILY_XP_GOAL} XP`, value: Math.min(stats.todayXp, DAILY_XP_GOAL), max: DAILY_XP_GOAL },
    { icon: Target, tone: 'teal', label: `Finish ${DAILY_LESSON_GOAL} lessons`, value: Math.min(stats.todayLessons, DAILY_LESSON_GOAL), max: DAILY_LESSON_GOAL },
  ];

  // Show the top of the board, plus the viewer if they are further down.
  const top = board.slice(0, 4);
  const me = board.find((p) => p.me);
  const shown = me && !top.some((p) => p.me) ? [...top.slice(0, 3), me] : top;

  return (
    <div className="flex w-full">
      <main className="min-w-0 flex-1 px-4 pb-32 pt-9 lg:px-12 lg:pb-16">
        <div className="mx-auto w-full max-w-[820px]">
          <div className="mb-8">
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
              {name ? `Welcome back, ${name}` : 'Welcome back'}
            </h1>
            <p className="mt-1.5 text-[15px] text-[#1F4D3A]/60">
              {map ? `${map.title} · pick up right where you left off.` : 'Pick up right where you left off.'}
            </p>
          </div>

          {map && map.units.length > 0 ? (
            map.units.map((unit, i) => <UnitSection key={unit.id} unit={unit} first={i === 0} />)
          ) : (
            <EmptyPath />
          )}
        </div>
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

        {map && (
          <Card className="!p-5">
            <Label>Course progress</Label>
            <div className="mt-2 flex items-end justify-between">
              <h3 className="text-[15px] font-semibold">{map.title}</h3>
              <span className="text-2xl font-semibold tracking-tight">{pct}%</span>
            </div>
            <div className="mt-3">
              <Bar value={pct} max={100} height={8} color="linear-gradient(90deg,#1F4D3A,#7FA800)" />
            </div>
            <p className="mt-3 text-[13px] text-[#1F4D3A]/60">
              {remaining === 0 ? (
                'Course complete. Well done!'
              ) : (
                <>
                  <span className="font-semibold text-[#1F4D3A]">{remaining}</span> {remaining === 1 ? 'lesson' : 'lessons'} to go.
                </>
              )}
            </p>
          </Card>
        )}

        <Card className="!p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">This week</h3>
            <Link href="/leaderboard" className="flex items-center text-xs font-semibold text-[#1D766B]">
              Leaderboard <ChevronRight size={14} />
            </Link>
          </div>
          <div className="mt-3 flex flex-col gap-0.5">
            {shown.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl px-2.5 py-2"
                style={p.me ? { background: 'rgba(31,77,58,0.07)' } : undefined}
              >
                <span className="w-4 text-center text-xs font-semibold text-[#1F4D3A]/40">{p.rank}</span>
                <span
                  className="flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: p.me ? '#1F4D3A' : '#2A9D8F' }}
                >
                  {p.name[0]}
                </span>
                <span className="flex-1 text-[13px] font-semibold">{p.name}</span>
                <span className="text-xs font-medium text-[#1F4D3A]/55">{p.xp} XP</span>
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
            <Pill tone="lime">Soon</Pill>
          </div>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">Master Excel faster</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-white/70">
            Unlimited lessons, mistake review and completion certificates.
          </p>
          <Btn variant="lime" className="mt-4 w-full" disabled>
            Coming soon
          </Btn>
        </div>
      </aside>
    </div>
  );
}
