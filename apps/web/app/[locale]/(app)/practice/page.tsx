import {
  ArrowRight,
  Keyboard,
  Layers,
  Puzzle,
  Sigma,
  Timer,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { getCourseMaps } from '../data';
import { getProfile } from '../get-profile';
import { Btn, Card, IconBox, Page, PageHeader, Pill, SectionTitle, type Tone } from '../ui';

export const metadata = { title: 'Practice – ExcelPanda' };

// Practice modes are planned but need lesson content first, so they are
// shown as upcoming rather than faking progress.
const MODES: { icon: LucideIcon; tone: Tone; title: string; blurb: string }[] = [
  { icon: Zap, tone: 'amber', title: 'Quick drill', blurb: 'Five fast questions on what you learned this week.' },
  { icon: Wrench, tone: 'coral', title: 'Fix your mistakes', blurb: 'Replay the questions you missed until they stick.' },
  { icon: Layers, tone: 'teal', title: 'Formula flashcards', blurb: 'Flip through the functions you use most.' },
  { icon: Timer, tone: 'violet', title: 'Timed challenge', blurb: 'Beat the clock on real spreadsheet tasks.' },
  { icon: Puzzle, tone: 'green', title: 'Real-world cases', blurb: 'Budgets, reports and inventory sheets, step by step.' },
  { icon: Keyboard, tone: 'gray', title: 'Shortcut trainer', blurb: 'Learn the keyboard moves that save hours.' },
];

export default async function PracticePage() {
  const { userId } = await getProfile();
  const maps = await getCourseMaps(userId);
  const current = (maps.find((m) => m.completed > 0 && m.current) ?? maps.find((m) => m.current))?.current ?? null;

  return (
    <Page>
      <PageHeader title="Practice" subtitle="Short sessions, steady progress. More ways to train are on the way." />

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
              : 'New lessons and practice modes are coming soon.'}
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
              <Pill tone="gray">Soon</Pill>
            </div>
            <h3 className="mt-5 text-base font-semibold">{m.title}</h3>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-[#1F4D3A]/60">{m.blurb}</p>
            <Btn variant="secondary" className="mt-5 w-full" disabled>
              Coming soon
            </Btn>
          </Card>
        ))}
      </div>
    </Page>
  );
}
