import { UserProfile } from '@clerk/nextjs';
import { BookOpen, Calendar, Flame, Gem, Zap } from 'lucide-react';
import { getStats } from '../data';
import { getProfile } from '../get-profile';
import { Card, IconBox, Page, PageHeader, Pill, SectionTitle } from '../ui';

export const metadata = { title: 'Profile – ExcelPanda' };

const LEVEL: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const GOAL: Record<string, string> = {
  work: 'Get better at my job',
  career: 'Land a new job',
  study: 'School or studies',
  personal: 'Personal projects',
};

export default async function ProfilePage() {
  const p = await getProfile();
  const stat = await getStats(p.userId);
  const joined = p.joinedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const minutes = Number(p.minutes);

  const facts: [string, string][] = [
    ['Starting level', LEVEL[p.level ?? ''] ?? '—'],
    ['Goal', GOAL[p.goal ?? ''] ?? '—'],
    ['Daily practice', minutes ? (minutes === 60 ? '1 hour' : `${minutes} minutes`) : '—'],
  ];

  const stats = [
    { icon: Flame, tone: 'coral' as const, value: String(stat.streak), label: 'Day streak' },
    { icon: Zap, tone: 'amber' as const, value: String(stat.xp), label: 'Total XP' },
    { icon: BookOpen, tone: 'green' as const, value: String(stat.lessonsDone), label: 'Lessons done' },
    { icon: Gem, tone: 'teal' as const, value: String(stat.gems), label: 'Gems' },
  ];

  return (
    <Page max={1000}>
      <PageHeader title="Profile" subtitle="Your progress, learning plan and account." />

      <Card className="!p-0 overflow-hidden">
        <div className="h-24" style={{ background: 'linear-gradient(120deg,#1F4D3A,#2B6A50)' }} />
        <div className="px-7 pb-7">
          <div className="-mt-10 flex items-end justify-between">
            <span className="flex size-20 items-center justify-center rounded-2xl border-4 border-white bg-[#C7F000] text-3xl font-semibold text-[#1F4D3A]">
              {(p.name ?? 'E')[0]}
            </span>
            <Pill tone="green">Free plan</Pill>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">{p.name ?? 'Excel learner'}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#1F4D3A]/55">
            <Calendar size={14} /> Learning since {joined}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-xl border border-[#1F4D3A]/10 px-4 py-3.5">
                <IconBox icon={s.icon} tone={s.tone} size={36} />
                <div className="leading-tight">
                  <p className="text-lg font-semibold">{s.value}</p>
                  <p className="text-xs text-[#1F4D3A]/50">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <SectionTitle>Your learning plan</SectionTitle>
      <Card className="!p-0">
        <div className="divide-y divide-[#1F4D3A]/8">
          {facts.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-[#1F4D3A]/60">{k}</span>
              <span className="text-sm font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>Account</SectionTitle>
      <UserProfile
        routing="hash"
        appearance={{
          variables: { colorBackground: '#ffffff' },
          elements: {
            rootBox: 'w-full',
            cardBox:
              'w-full max-w-none shadow-none rounded-2xl border border-[#1F4D3A]/10 bg-white',
            card: 'bg-white shadow-none',
            navbar: 'bg-white',
            scrollBox: 'bg-white',
            otpCodeFieldInput: '!bg-[#F1F3F0] !border-[#1F4D3A]/20 !text-black',
          },
        }}
      />
    </Page>
  );
}
