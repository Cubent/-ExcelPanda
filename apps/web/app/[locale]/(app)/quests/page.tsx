import {
  Award,
  Calculator,
  CheckCircle2,
  Clock,
  Crosshair,
  Flame,
  Gem,
  Gift,
  Moon,
  Sprout,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Bar, Card, IconBox, Page, PageHeader, Pill, SectionTitle, type Tone } from '../ui';

export const metadata = { title: 'Quests – ExcelPanda' };

const DAILY: { icon: LucideIcon; tone: Tone; label: string; value: number; max: number; reward: number }[] = [
  { icon: Zap, tone: 'amber', label: 'Earn 50 XP', value: 30, max: 50, reward: 10 },
  { icon: Target, tone: 'teal', label: 'Finish 2 lessons', value: 1, max: 2, reward: 15 },
  { icon: Flame, tone: 'coral', label: 'Get 5 answers in a row', value: 3, max: 5, reward: 20 },
];

const BADGES: { icon: LucideIcon; title: string; blurb: string; value: number; max: number }[] = [
  { icon: Sprout, title: 'First steps', blurb: 'Finish your first lesson', value: 1, max: 1 },
  { icon: Flame, title: 'On fire', blurb: 'Reach a 7 day streak', value: 4, max: 7 },
  { icon: Calculator, title: 'Formula fan', blurb: 'Use 25 different functions', value: 14, max: 25 },
  { icon: Crosshair, title: 'Sharpshooter', blurb: 'Answer 20 in a row correctly', value: 8, max: 20 },
  { icon: Moon, title: 'Night owl', blurb: 'Practice after 9pm', value: 0, max: 1 },
  { icon: Trophy, title: 'Unit master', blurb: 'Pass a unit test', value: 0, max: 1 },
];

export default function QuestsPage() {
  return (
    <Page>
      <PageHeader title="Quests" subtitle="Complete quests to earn gems and unlock badges." />

      <div
        className="rounded-2xl p-8 text-white shadow-sm"
        style={{ background: 'linear-gradient(120deg,#1F4D3A 0%,#2B6A50 100%)' }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C7F000]">Weekly challenge</p>
          <span className="flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <Clock size={12} /> 3 days left
          </span>
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Earn 300 XP this week</h2>
        <div className="mt-6 flex items-center gap-5">
          <div className="flex-1">
            <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div className="h-full rounded-full bg-[#C7F000]" style={{ width: '64%' }} />
            </div>
          </div>
          <span className="text-sm font-semibold">192 / 300 XP</span>
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/15" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Gift size={20} />
          </span>
        </div>
      </div>

      <SectionTitle aside={<span className="text-sm text-[#1F4D3A]/50">Resets in 9 hours</span>}>Daily quests</SectionTitle>
      <Card className="!p-0">
        <div className="divide-y divide-[#1F4D3A]/8">
          {DAILY.map((q) => {
            const done = q.value >= q.max;
            return (
              <div key={q.label} className="flex items-center gap-5 px-6 py-5">
                <IconBox icon={q.icon} tone={q.tone} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[15px] font-semibold">{q.label}</p>
                    <span className="text-sm font-medium text-[#1F4D3A]/50">
                      {q.value}/{q.max}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <Bar value={q.value} max={q.max} height={8} />
                  </div>
                </div>
                <div className="flex w-20 items-center justify-end">
                  {done ? (
                    <CheckCircle2 className="text-[#2A9D8F]" size={22} />
                  ) : (
                    <Pill tone="teal">
                      <Gem size={12} /> {q.reward}
                    </Pill>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <SectionTitle aside={<span className="text-sm text-[#1F4D3A]/50">1 of 6 earned</span>}>Badges</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((b) => {
          const earned = b.value >= b.max;
          const Icon = b.icon;
          return (
            <Card key={b.title} className="flex items-center gap-4 !p-5">
              <span
                className="flex size-16 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: earned ? '#1F4D3A' : '#EEF0EB',
                  color: earned ? '#C7F000' : '#A4ABA5',
                }}
              >
                <Icon size={28} strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-[15px] font-semibold">{b.title}</h3>
                  {earned && <Award size={15} className="shrink-0 text-[#2A9D8F]" />}
                </div>
                <p className="mt-0.5 text-[13px] text-[#1F4D3A]/55">{b.blurb}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Bar value={b.value} max={b.max} height={5} />
                  <span className="text-xs font-medium text-[#1F4D3A]/45">
                    {b.value}/{b.max}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}
