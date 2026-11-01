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
import { Bar, Btn, Card, IconBox, Label, Pill, Stat, type Tone } from '../ui';

// ---------------------------------------------------------------------------
// Design-only mock data. No backend yet.
// ---------------------------------------------------------------------------

type NodeState = 'done' | 'current' | 'locked';
type LessonNode = {
  title: string;
  icon: LucideIcon;
  state: NodeState;
  kind?: 'lesson' | 'chest' | 'trophy';
  progress?: number; // 0..1, current node only
};
type Unit = {
  number: number;
  title: string;
  blurb: string;
  from: string;
  to: string;
  nodes: LessonNode[];
};

const UNITS: Unit[] = [
  {
    number: 1,
    title: 'Excel Basics',
    blurb: 'Cells, ranges and your first formulas',
    from: '#1F4D3A',
    to: '#2B6A50',
    nodes: [
      { title: 'Meet the grid', icon: Grid3x3, state: 'done' },
      { title: 'Cells & ranges', icon: BookOpen, state: 'done' },
      { title: 'Basic math', icon: Plus, state: 'done' },
      { title: 'SUM & AVERAGE', icon: Sigma, state: 'current', progress: 0.4 },
      { title: 'Bonus chest', icon: Gift, state: 'locked', kind: 'chest' },
      { title: 'Formatting', icon: Palette, state: 'locked' },
      { title: 'Unit 1 test', icon: Trophy, state: 'locked', kind: 'trophy' },
    ],
  },
  {
    number: 2,
    title: 'Formulas that Work',
    blurb: 'IF, lookups and fixing broken formulas',
    from: '#8A9A92',
    to: '#9AA89F',
    nodes: [
      { title: 'IF statements', icon: GitBranch, state: 'locked' },
      { title: 'COUNTIF & SUMIF', icon: ListChecks, state: 'locked' },
      { title: 'XLOOKUP', icon: Search, state: 'locked' },
      { title: 'Fix the #errors', icon: Wrench, state: 'locked' },
      { title: 'Bonus chest', icon: Gift, state: 'locked', kind: 'chest' },
      { title: 'Unit 2 test', icon: Trophy, state: 'locked', kind: 'trophy' },
    ],
  },
  {
    number: 3,
    title: 'Pivot Tables & Charts',
    blurb: 'Turn raw data into clear answers',
    from: '#8A9A92',
    to: '#9AA89F',
    nodes: [
      { title: 'Clean your data', icon: Sparkles, state: 'locked' },
      { title: 'Your first pivot', icon: Calculator, state: 'locked' },
      { title: 'Charts that pop', icon: ChartColumn, state: 'locked' },
      { title: 'Dashboards', icon: LayoutDashboard, state: 'locked' },
      { title: 'Unit 3 test', icon: Trophy, state: 'locked', kind: 'trophy' },
    ],
  },
];

// Horizontal wiggle (px) that gives the path its winding shape.
const WIGGLE = [0, 90, 150, 90, 0, -90, -150, -90];

const QUESTS: { icon: LucideIcon; tone: Tone; label: string; value: number; max: number }[] = [
  { icon: Zap, tone: 'amber', label: 'Earn 50 XP', value: 30, max: 50 },
  { icon: Target, tone: 'teal', label: 'Finish 2 lessons', value: 1, max: 2 },
  { icon: Flame, tone: 'coral', label: 'Get 5 answers in a row', value: 3, max: 5 },
];

const LEADERBOARD = [
  { name: 'Sofia P.', xp: 412, color: '#C79A00' },
  { name: 'Daniel R.', xp: 388, color: '#8A929C' },
  { name: 'You', xp: 230, color: '#1F4D3A', me: true },
  { name: 'Maria L.', xp: 201, color: '#2A9D8F' },
];

// --- path -------------------------------------------------------------------

function PathNode({ node, offset, mascot }: { node: LessonNode; offset: number; mascot?: boolean }) {
  const { state } = node;
  const size = node.kind === 'trophy' ? 92 : 84;
  const Icon = state === 'done' ? Check : node.icon;
  const face =
    state === 'done'
      ? { bg: '#1F4D3A', edge: '#0F2A1F', fg: '#ffffff' }
      : state === 'current'
        ? { bg: '#C7F000', edge: '#98BA00', fg: '#1F4D3A' }
        : { bg: '#EDEFEA', edge: '#D3D8CF', fg: '#9AA39C' };

  const R = 47;
  const C = 2 * Math.PI * R;

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

      <button
        type="button"
        aria-label={node.title}
        disabled={state === 'locked'}
        className="relative flex items-center justify-center rounded-full transition-transform active:translate-y-0.5"
        style={{
          width: size,
          height: size,
          background: face.bg,
          borderBottom: `6px solid ${face.edge}`,
          color: face.fg,
          animation: state === 'current' ? 'dash-pulse 2.2s infinite' : undefined,
          cursor: state === 'locked' ? 'not-allowed' : 'pointer',
        }}
      >
        {state === 'current' && (
          <svg
            className="pointer-events-none absolute -rotate-90"
            viewBox="0 0 100 100"
            style={{ width: size + 22, height: size + 22, left: -11, top: -11 }}
          >
            <circle cx="50" cy="50" r={R} fill="none" stroke="#1F4D3A" strokeOpacity="0.1" strokeWidth="3.5" />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="#1F4D3A"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - (node.progress ?? 0))}
            />
          </svg>
        )}
        <Icon size={node.kind === 'trophy' ? 40 : 34} strokeWidth={state === 'done' ? 3 : 2} />
      </button>

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

function UnitSection({ unit, first }: { unit: Unit; first: boolean }) {
  const locked = unit.nodes.every((n) => n.state === 'locked');
  const currentIdx = unit.nodes.findIndex((n) => n.state === 'current');
  const done = unit.nodes.filter((n) => n.state === 'done').length;
  return (
    <section className={first ? '' : 'mt-16'}>
      <div
        className="flex items-center justify-between rounded-2xl px-6 py-5 text-white shadow-sm"
        style={{ background: `linear-gradient(120deg, ${unit.from}, ${unit.to})` }}
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
          <PathNode key={node.title} node={node} offset={WIGGLE[i % WIGGLE.length]} mascot={i === currentIdx} />
        ))}
      </div>
    </section>
  );
}

// --- page -------------------------------------------------------------------

export function DashboardView({ name }: { name?: string }) {
  const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const doneDays = 4;

  return (
    <div className="flex w-full">
      <main className="min-w-0 flex-1 px-4 pb-32 pt-9 lg:px-12 lg:pb-16">
        <div className="mx-auto w-full max-w-[820px]">
          <div className="mb-8">
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
              {name ? `Welcome back, ${name}` : 'Welcome back'}
            </h1>
            <p className="mt-1.5 text-[15px] text-[#1F4D3A]/60">Pick up right where you left off.</p>
          </div>

          {UNITS.map((unit, i) => (
            <UnitSection key={unit.number} unit={unit} first={i === 0} />
          ))}
        </div>
      </main>

      <aside className="sticky top-0 hidden h-screen w-[380px] shrink-0 flex-col gap-4 overflow-y-auto py-9 pr-8 xl:flex">
        <div className="flex items-center justify-between px-1">
          <Stat icon={Flame} value="4" tint="#C4562F" />
          <Stat icon={Zap} value="230 XP" tint="#9A6B00" />
          <Stat icon={Gem} value="120" tint="#1D766B" />
        </div>

        <Card className="!p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBox icon={Flame} tone="coral" size={38} />
              <div className="leading-tight">
                <h3 className="text-[15px] font-semibold">4 day streak</h3>
                <p className="text-xs text-[#1F4D3A]/50">Practice today to keep it</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-between">
            {week.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex size-8 items-center justify-center rounded-full text-xs ${
                    i < doneDays
                      ? 'bg-[#C4562F] text-white'
                      : i === doneDays
                        ? 'border-2 border-dashed border-[#C4562F]/60'
                        : 'bg-[#1F4D3A]/8'
                  }`}
                  style={i > doneDays ? { background: 'rgba(31,77,58,0.08)' } : undefined}
                >
                  {i < doneDays && <Check size={15} strokeWidth={3} />}
                </span>
                <span className="text-[11px] font-medium text-[#1F4D3A]/45">{d}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="!p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">Daily quests</h3>
            <span className="flex items-center text-xs font-semibold text-[#1D766B]">
              View all <ChevronRight size={14} />
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {QUESTS.map((q) => (
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
                    <Bar value={q.value} max={q.max} height={6} color="#1F4D3A" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="!p-5">
          <Label>Course progress</Label>
          <div className="mt-2 flex items-end justify-between">
            <h3 className="text-[15px] font-semibold">Beginner to Excel master</h3>
            <span className="text-2xl font-semibold tracking-tight">18%</span>
          </div>
          <div className="mt-3">
            <Bar value={18} max={100} height={8} color="linear-gradient(90deg,#1F4D3A,#7FA800)" />
          </div>
          <p className="mt-3 text-[13px] text-[#1F4D3A]/60">
            About <span className="font-semibold text-[#1F4D3A]">3 weeks</span> to go at your pace.
          </p>
        </Card>

        <Card className="!p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">Bronze League</h3>
            <Pill tone="amber">3 days left</Pill>
          </div>
          <div className="mt-3 flex flex-col gap-0.5">
            {LEADERBOARD.map((p, i) => (
              <div
                key={p.name}
                className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${p.me ? 'bg-[#1F4D3A]/6' : ''}`}
                style={p.me ? { background: 'rgba(31,77,58,0.07)' } : undefined}
              >
                <span className="w-4 text-center text-xs font-semibold text-[#1F4D3A]/40">{i + 1}</span>
                <span
                  className="flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: p.color }}
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C7F000]">ExcelPanda Pro</p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">Master Excel faster</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-white/70">
            Unlimited lessons, mistake review and completion certificates.
          </p>
          <Btn variant="lime" className="mt-4 w-full">
            Try Pro free
          </Btn>
        </div>
      </aside>
    </div>
  );
}
