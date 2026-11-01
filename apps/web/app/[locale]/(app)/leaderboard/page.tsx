import { ArrowUp, Crown, Gem, Medal, Trophy, type LucideIcon } from 'lucide-react';
import { Card, Page, PageHeader, Pill } from '../ui';

export const metadata = { title: 'Leaderboard – ExcelPanda' };

const LEAGUES: { name: string; icon: LucideIcon; current?: boolean }[] = [
  { name: 'Bronze', icon: Medal, current: true },
  { name: 'Silver', icon: Medal },
  { name: 'Gold', icon: Trophy },
  { name: 'Diamond', icon: Gem },
  { name: 'Master', icon: Crown },
];

const COLORS = ['#C79A00', '#8A929C', '#C4562F', '#2A9D8F', '#5B4BC4', '#1F4D3A'];

const PLAYERS = [
  { name: 'Sofia P.', xp: 412 },
  { name: 'Daniel R.', xp: 388 },
  { name: 'Priya K.', xp: 341 },
  { name: 'Lucas G.', xp: 302 },
  { name: 'Aisha B.', xp: 276 },
  { name: 'You', xp: 230, me: true },
  { name: 'Maria L.', xp: 201 },
  { name: 'Tom W.', xp: 188 },
  { name: 'Hannah V.', xp: 164 },
  { name: 'Omar F.', xp: 141 },
  { name: 'Chen Y.', xp: 118 },
  { name: 'Lena K.', xp: 97 },
];

const PROMOTE = 5; // top 5 move up

export default function LeaderboardPage() {
  const podium = [PLAYERS[1], PLAYERS[0], PLAYERS[2]];
  const heights = [96, 128, 76];
  const places = [2, 1, 3];

  return (
    <Page max={1000}>
      <PageHeader title="Leaderboard" subtitle="Earn XP this week to climb to the next league." />

      <Card>
        <div className="flex items-center justify-between">
          {LEAGUES.map((l) => {
            const Icon = l.icon;
            return (
              <div key={l.name} className="flex flex-1 flex-col items-center gap-2">
                <span
                  className="flex size-14 items-center justify-center rounded-2xl"
                  style={{
                    background: l.current ? '#1F4D3A' : '#EEF0EB',
                    color: l.current ? '#C7F000' : '#A4ABA5',
                  }}
                >
                  <Icon size={26} strokeWidth={1.8} />
                </span>
                <span className={`text-xs font-semibold ${l.current ? 'text-[#1F4D3A]' : 'text-[#1F4D3A]/40'}`}>
                  {l.name}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center justify-center gap-3 border-t border-[#1F4D3A]/8 pt-5">
          <h2 className="text-lg font-semibold tracking-tight">Bronze League</h2>
          <Pill tone="teal">Top {PROMOTE} move up</Pill>
          <Pill tone="amber">3 days left</Pill>
        </div>
      </Card>

      <Card className="mt-6 !p-0 overflow-hidden">
        <div
          className="flex items-end justify-center gap-5 px-6 pt-8"
          style={{ background: 'linear-gradient(180deg,#F1F6EC,#FFFFFF)' }}
        >
          {podium.map((p, i) => (
            <div key={p.name} className="flex w-32 flex-col items-center">
              <span
                className="flex size-14 items-center justify-center rounded-full text-lg font-semibold text-white ring-4 ring-white"
                style={{ background: COLORS[PLAYERS.indexOf(p) % COLORS.length] }}
              >
                {p.name[0]}
              </span>
              <span className="mt-2 text-sm font-semibold">{p.name}</span>
              <span className="text-xs font-medium text-[#1F4D3A]/55">{p.xp} XP</span>
              <div
                className="mt-3 flex w-full items-start justify-center rounded-t-xl pt-3 text-lg font-semibold"
                style={{
                  height: heights[i],
                  background: places[i] === 1 ? '#1F4D3A' : '#DDE6DF',
                  color: places[i] === 1 ? '#C7F000' : '#1F4D3A',
                }}
              >
                {places[i]}
              </div>
            </div>
          ))}
        </div>

        <div className="p-2">
          {PLAYERS.map((p, i) => (
            <div key={p.name}>
              {i === PROMOTE && (
                <div className="my-2 flex items-center gap-3 px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2A9D8F]">
                  <span className="h-px flex-1 bg-[#2A9D8F]/30" />
                  <ArrowUp size={13} /> Promotion zone
                  <span className="h-px flex-1 bg-[#2A9D8F]/30" />
                </div>
              )}
              <div
                className={`flex items-center gap-4 rounded-xl px-4 py-3 ${p.me ? 'ring-1 ring-[#1F4D3A]/25' : ''}`}
                style={p.me ? { background: 'rgba(31,77,58,0.06)' } : undefined}
              >
                <span className={`w-6 text-center text-sm font-semibold ${i < PROMOTE ? 'text-[#2A9D8F]' : 'text-[#1F4D3A]/40'}`}>
                  {i + 1}
                </span>
                <span
                  className="flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: COLORS[i % COLORS.length] }}
                >
                  {p.name[0]}
                </span>
                <span className="flex-1 text-[15px] font-semibold">{p.name}</span>
                {p.me && <Pill tone="green">You</Pill>}
                <span className="w-20 text-right text-sm font-medium text-[#1F4D3A]/60">{p.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}
