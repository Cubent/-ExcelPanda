import {
  Award,
  Calculator,
  CheckCircle2,
  Clock,
  Flame,
  Rocket,
  Sprout,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  DAILY_LESSON_GOAL,
  DAILY_XP_GOAL,
  WEEKLY_XP_GOAL,
  getCourseMap,
  getStats,
  weekStartUtc,
} from '../data';
import { getProfile } from '../get-profile';
import { Bar, Card, IconBox, Page, PageHeader, Pill, SectionTitle, type Tone } from '../ui';

export const metadata = { title: 'Quests – ExcelPanda' };

function hoursLeft(until: Date) {
  return Math.max(0, Math.ceil((until.getTime() - Date.now()) / 3_600_000));
}

export default async function QuestsPage() {
  const { userId } = await getProfile();
  const [stats, map] = await Promise.all([getStats(userId), getCourseMap(userId)]);

  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  const nextWeek = new Date(weekStartUtc().getTime() + 7 * 86_400_000);
  const daysLeft = Math.max(1, Math.ceil((nextWeek.getTime() - Date.now()) / 86_400_000));

  const daily: { icon: LucideIcon; tone: Tone; label: string; value: number; max: number }[] = [
    { icon: Zap, tone: 'amber', label: `Earn ${DAILY_XP_GOAL} XP`, value: stats.todayXp, max: DAILY_XP_GOAL },
    { icon: Target, tone: 'teal', label: `Finish ${DAILY_LESSON_GOAL} lessons`, value: stats.todayLessons, max: DAILY_LESSON_GOAL },
  ];

  const badges: { icon: LucideIcon; title: string; blurb: string; value: number; max: number }[] = [
    { icon: Sprout, title: 'First steps', blurb: 'Finish your first lesson', value: stats.lessonsDone, max: 1 },
    { icon: Calculator, title: 'Getting going', blurb: 'Finish 10 lessons', value: stats.lessonsDone, max: 10 },
    { icon: Flame, title: 'On fire', blurb: 'Reach a 7 day streak', value: stats.streak, max: 7 },
    { icon: Rocket, title: 'Weekly warrior', blurb: `Earn ${WEEKLY_XP_GOAL} XP in a week`, value: stats.weekXp, max: WEEKLY_XP_GOAL },
    { icon: Trophy, title: 'Unit master', blurb: 'Complete a whole unit', value: map?.unitsDone ?? 0, max: 1 },
    { icon: Award, title: 'Course complete', blurb: 'Finish every lesson', value: map?.completed ?? 0, max: Math.max(1, map?.total ?? 1) },
  ];
  const earnedCount = badges.filter((b) => b.value >= b.max).length;

  return (
    <Page>
      <PageHeader title="Quests" subtitle="Complete quests and earn badges as you learn." />

      <div
        className="rounded-2xl p-8 text-white shadow-sm"
        style={{ background: 'linear-gradient(120deg,#1F4D3A 0%,#2B6A50 100%)' }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C7F000]">Weekly challenge</p>
          <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <Clock size={12} /> {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
          </span>
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Earn {WEEKLY_XP_GOAL} XP this week</h2>
        <div className="mt-6 flex items-center gap-5">
          <div className="flex-1">
            <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div
                className="h-full rounded-full bg-[#C7F000]"
                style={{ width: `${Math.min(100, (stats.weekXp / WEEKLY_XP_GOAL) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold">
            {Math.min(stats.weekXp, WEEKLY_XP_GOAL)} / {WEEKLY_XP_GOAL} XP
          </span>
        </div>
      </div>

      <SectionTitle aside={<span className="text-sm text-[#1F4D3A]/50">Resets in {hoursLeft(tomorrow)} hours</span>}>
        Daily quests
      </SectionTitle>
      <Card className="!p-0">
        <div className="divide-y divide-[#1F4D3A]/8">
          {daily.map((q) => {
            const done = q.value >= q.max;
            return (
              <div key={q.label} className="flex items-center gap-5 px-6 py-5">
                <IconBox icon={q.icon} tone={q.tone} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[15px] font-semibold">{q.label}</p>
                    <span className="text-sm font-medium text-[#1F4D3A]/50">
                      {Math.min(q.value, q.max)}/{q.max}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <Bar value={Math.min(q.value, q.max)} max={q.max} height={8} />
                  </div>
                </div>
                <div className="flex w-10 items-center justify-end">
                  {done && <CheckCircle2 className="text-[#2A9D8F]" size={22} />}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <SectionTitle aside={<span className="text-sm text-[#1F4D3A]/50">{earnedCount} of {badges.length} earned</span>}>
        Badges
      </SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => {
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
                  {earned && <Pill tone="teal">Earned</Pill>}
                </div>
                <p className="mt-0.5 text-[13px] text-[#1F4D3A]/55">{b.blurb}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Bar value={Math.min(b.value, b.max)} max={b.max} height={5} />
                  <span className="text-xs font-medium text-[#1F4D3A]/45">
                    {Math.min(b.value, b.max)}/{b.max}
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
