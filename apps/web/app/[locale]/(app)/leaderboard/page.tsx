import { Clock, Users } from 'lucide-react';
import { getLeaderboard, weekStartUtc } from '../data';
import { getProfile } from '../get-profile';
import { Card, IconBox, Page, PageHeader, Pill } from '../ui';

export const metadata = { title: 'Leaderboard – ExcelPanda' };

const COLORS = ['#C79A00', '#8A929C', '#C4562F', '#2A9D8F', '#5B4BC4', '#1F4D3A'];

export default async function LeaderboardPage() {
  const { userId } = await getProfile();
  const players = await getLeaderboard(userId);

  const nextWeek = new Date(weekStartUtc().getTime() + 7 * 86_400_000);
  const daysLeft = Math.max(1, Math.ceil((nextWeek.getTime() - Date.now()) / 86_400_000));

  const hasPodium = players.length >= 3 && players[2].xp > 0;
  const podium = hasPodium ? [players[1], players[0], players[2]] : [];
  const heights = [96, 128, 76];
  const places = [2, 1, 3];
  const colorOf = (id: string) => COLORS[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % COLORS.length];

  return (
    <Page max={1000}>
      <PageHeader title="Leaderboard" subtitle="Weekly XP. The ranking resets every Monday." />

      <Card className="!p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBox icon={Users} tone="green" />
            <div className="leading-tight">
              <h2 className="text-base font-semibold tracking-tight">This week</h2>
              <p className="text-sm text-[#1F4D3A]/55">{players.length} {players.length === 1 ? 'learner' : 'learners'} ranked</p>
            </div>
          </div>
          <Pill tone="amber">
            <Clock size={12} /> {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
          </Pill>
        </div>
      </Card>

      <Card className="mt-6 !p-0 overflow-hidden">
        {hasPodium && (
          <div
            className="flex items-end justify-center gap-5 px-6 pt-8"
            style={{ background: 'linear-gradient(180deg,#F1F6EC,#FFFFFF)' }}
          >
            {podium.map((p, i) => (
              <div key={p.id} className="flex w-32 flex-col items-center">
                <span
                  className="flex size-14 items-center justify-center rounded-full text-lg font-semibold text-white ring-4 ring-white"
                  style={{ background: p.me ? '#1F4D3A' : colorOf(p.id) }}
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
        )}

        <div className="p-2">
          {players.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 ${p.me ? 'ring-1 ring-[#1F4D3A]/25' : ''}`}
              style={p.me ? { background: 'rgba(31,77,58,0.06)' } : undefined}
            >
              <span className="w-6 text-center text-sm font-semibold text-[#1F4D3A]/40">{p.rank}</span>
              <span
                className="flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: p.me ? '#1F4D3A' : colorOf(p.id) }}
              >
                {p.name[0]}
              </span>
              <span className="flex-1 text-[15px] font-semibold">{p.name}</span>
              {p.me && <Pill tone="green">You</Pill>}
              <span className="w-20 text-right text-sm font-medium text-[#1F4D3A]/60">{p.xp} XP</span>
            </div>
          ))}
        </div>
        {players.every((p) => p.xp === 0) && (
          <p className="border-t border-[#1F4D3A]/8 px-6 py-5 text-center text-sm text-[#1F4D3A]/55">
            No XP earned yet this week. Complete a lesson to get on the board.
          </p>
        )}
      </Card>
    </Page>
  );
}
