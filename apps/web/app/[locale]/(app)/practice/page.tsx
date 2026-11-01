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
import { Bar, Btn, Card, IconBox, Page, PageHeader, Pill, SectionTitle, type Tone } from '../ui';

export const metadata = { title: 'Practice – ExcelPanda' };

const MODES: {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  blurb: string;
  meta: string;
  progress: number;
  cta: string;
  locked?: boolean;
}[] = [
  { icon: Zap, tone: 'amber', title: 'Quick drill', blurb: 'Five fast questions on what you learned this week.', meta: '5 min', progress: 60, cta: 'Start drill' },
  { icon: Wrench, tone: 'coral', title: 'Fix your mistakes', blurb: 'Replay the questions you missed until they stick.', meta: '7 to review', progress: 20, cta: 'Review' },
  { icon: Layers, tone: 'teal', title: 'Formula flashcards', blurb: 'Flip through the functions you use most.', meta: '24 cards', progress: 45, cta: 'Open cards' },
  { icon: Timer, tone: 'violet', title: 'Timed challenge', blurb: 'Beat the clock on real spreadsheet tasks.', meta: '10 min', progress: 0, cta: 'Start challenge' },
  { icon: Puzzle, tone: 'green', title: 'Real-world cases', blurb: 'Budgets, reports and inventory sheets, step by step.', meta: '12 cases', progress: 10, cta: 'Browse cases' },
  { icon: Keyboard, tone: 'gray', title: 'Shortcut trainer', blurb: 'Learn the keyboard moves that save hours.', meta: 'Pro', progress: 0, cta: 'Unlock', locked: true },
];

const WEAK = [
  { topic: 'XLOOKUP', score: 42 },
  { topic: 'Absolute references', score: 55 },
  { topic: 'COUNTIF', score: 68 },
];

export default function PracticePage() {
  return (
    <Page>
      <PageHeader title="Practice" subtitle="Short sessions, steady progress. Choose how you want to train today." />

      <div
        className="relative overflow-hidden rounded-2xl p-8 text-white shadow-sm"
        style={{ background: 'linear-gradient(120deg,#1F4D3A 0%,#2B6A50 100%)' }}
      >
        <div className="relative z-10 max-w-lg">
          <Pill tone="lime">Recommended for you</Pill>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Sharpen your SUM and AVERAGE skills</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/75">
            A four minute drill built from the lesson you are on right now.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Btn variant="lime">
              Start practice <ArrowRight size={16} />
            </Btn>
            <span className="text-sm font-medium text-white/70">+20 XP</span>
          </div>
        </div>
        <Sigma
          className="absolute -right-6 -top-6 text-white/10"
          size={260}
          strokeWidth={1.2}
          aria-hidden
        />
      </div>

      <SectionTitle>Training modes</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MODES.map((m) => (
          <Card key={m.title} className={`flex flex-col ${m.locked ? 'bg-[#FBFBF9]' : ''}`}>
            <div className="flex items-start justify-between">
              <IconBox icon={m.icon} tone={m.tone} />
              <Pill tone={m.locked ? 'gray' : 'green'}>
                {m.locked && <Lock size={11} />}
                {m.meta}
              </Pill>
            </div>
            <h3 className="mt-5 text-base font-semibold">{m.title}</h3>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-[#1F4D3A]/60">{m.blurb}</p>
            <div className="mt-5 h-2">{m.progress > 0 && <Bar value={m.progress} max={100} height={6} />}</div>
            <Btn variant={m.locked ? 'secondary' : 'primary'} className="mt-4 w-full">
              {m.cta}
            </Btn>
          </Card>
        ))}
      </div>

      <SectionTitle aside={<span className="text-sm text-[#1F4D3A]/50">Based on your last 50 answers</span>}>
        Your weak spots
      </SectionTitle>
      <Card className="!p-0">
        <div className="divide-y divide-[#1F4D3A]/8">
          {WEAK.map((w) => (
            <div key={w.topic} className="flex items-center gap-5 px-6 py-4">
              <span className="w-48 text-sm font-semibold">{w.topic}</span>
              <div className="flex-1">
                <Bar value={w.score} max={100} color="#C4562F" height={6} />
              </div>
              <span className="w-12 text-right text-sm font-medium text-[#1F4D3A]/60">{w.score}%</span>
              <Btn variant="secondary" size="sm">
                Drill
              </Btn>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}
