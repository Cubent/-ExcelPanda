'use client';

import { useEffect, useState, useTransition } from 'react';
import { completeOnboarding, saveOnboarding } from './actions';
import { startCheckout } from '@/lib/checkout-client';

// ---------------------------------------------------------------------------
// PLACEHOLDER MARKETING NUMBERS — replace with real figures before launch.
// ---------------------------------------------------------------------------
const LEARNER_COUNT = 12000;
const PATH_MINUTES = 1680; // minutes to master Excel completely (assumption: 1 hour/day = 4 weeks)
const weeksFor = (m: number) => Math.max(1, Math.ceil(PATH_MINUTES / (m * 7)));
const fmtMinutes = (m: number) => (m === 60 ? '1 hour' : `${m} min`);

type Option = { value: string; emoji: string; label: string };

type QuestionStep = {
  type: 'question';
  id: string;
  title: string;
  subtitle?: string;
  multi?: boolean;
  options: Option[];
};
type ScreenStep = {
  type: 'name' | 'social' | 'time-chart' | 'growth' | 'loading' | 'summary' | 'review' | 'trial' | 'reminder' | 'paywall';
  id: string;
};
type Step = QuestionStep | ScreenStep;

const STEPS: Step[] = [
  { type: 'name', id: 'name' },
  {
    type: 'question',
    id: 'role',
    title: 'What do you do day to day?',
    subtitle: 'So we can make the examples feel real.',
    options: [
      { value: 'student', emoji: '🎓', label: "I'm a student" },
      { value: 'office', emoji: '🏢', label: 'Office or admin work' },
      { value: 'finance', emoji: '💰', label: 'Finance or accounting' },
      { value: 'business', emoji: '🛍️', label: 'I run a business' },
      { value: 'other', emoji: '✨', label: 'Something else' },
    ],
  },
  {
    type: 'question',
    id: 'level',
    title: 'How well do you know Excel?',
    subtitle: 'Be honest, there are no wrong answers.',
    options: [
      { value: 'beginner', emoji: '🌱', label: "I'm brand new" },
      { value: 'intermediate', emoji: '📊', label: 'I know the basics' },
      { value: 'advanced', emoji: '🚀', label: 'I use formulas daily' },
    ],
  },
  {
    type: 'question',
    id: 'tried',
    title: 'Have you tried learning Excel before?',
    options: [
      { value: 'videos', emoji: '📺', label: 'Yes, YouTube videos' },
      { value: 'course', emoji: '📚', label: 'Yes, a course or class' },
      { value: 'alone', emoji: '🧗', label: 'Figured things out alone' },
      { value: 'never', emoji: '🆕', label: 'No, this is my first time' },
    ],
  },
  { type: 'social', id: 'social' },
  {
    type: 'question',
    id: 'goal',
    title: 'What do you want Excel for?',
    options: [
      { value: 'work', emoji: '💼', label: 'Get better at my job' },
      { value: 'career', emoji: '🎯', label: 'Land a new job' },
      { value: 'study', emoji: '🎓', label: 'School or studies' },
      { value: 'personal', emoji: '🏠', label: 'Personal projects' },
    ],
  },
  {
    type: 'question',
    id: 'change',
    title: 'What would mastering Excel change for you?',
    options: [
      { value: 'confidence', emoji: '💪', label: 'I would feel more confident' },
      { value: 'time', emoji: '⏰', label: 'I would save hours every week' },
      { value: 'promotion', emoji: '📈', label: 'I could grow my career' },
      { value: 'stress', emoji: '😌', label: 'Less stress with spreadsheets' },
    ],
  },
  {
    type: 'question',
    id: 'struggle',
    title: 'What frustrates you most about Excel?',
    options: [
      { value: 'dont-know-where-to-start', emoji: '🤯', label: "I don't know where to start" },
      { value: 'formulas-break', emoji: '💥', label: 'My formulas keep breaking' },
      { value: 'too-slow', emoji: '🐌', label: 'Everything takes too long' },
      { value: 'forget', emoji: '🫠', label: 'I learn it, then forget it' },
    ],
  },
  {
    type: 'question',
    id: 'minutes',
    title: 'How much time can you spend each day?',
    subtitle: 'Small and steady beats big and rare.',
    options: [
      { value: '5', emoji: '☕', label: '5 minutes' },
      { value: '10', emoji: '🕙', label: '10 minutes' },
      { value: '15', emoji: '📚', label: '15 minutes' },
      { value: '30', emoji: '🔥', label: '30 minutes' },
      { value: '60', emoji: '🚀', label: '1 hour' },
    ],
  },
  { type: 'time-chart', id: 'time-chart' },
  { type: 'growth', id: 'growth' },
  { type: 'loading', id: 'loading' },
  { type: 'summary', id: 'summary' },
  { type: 'review', id: 'review' },
  { type: 'trial', id: 'trial' },
  { type: 'reminder', id: 'reminder' },
  { type: 'paywall', id: 'paywall' },
];

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};
const GOAL_LABEL: Record<string, string> = {
  work: 'Get better at my job',
  career: 'Land a new job',
  study: 'School or studies',
  personal: 'Personal projects',
};

type Answers = Record<string, string | string[]>;

// --- small building blocks --------------------------------------------------

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function SocialScreen({ name }: { name: string }) {
  const count = useCountUp(LEARNER_COUNT);
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="flex -space-x-4">
        {AVATARS.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="size-16 rounded-full border-4 border-[#FBFCF7] object-cover"
          />
        ))}
      </div>
      <p className="mt-8 text-6xl font-extrabold tracking-tight text-[#1F4D3A]">
        {count.toLocaleString()}+
      </p>
      <p className="mt-3 max-w-sm text-xl font-semibold text-[#1F4D3A]">
        people just like you started their Excel journey right here.
      </p>
      <p className="mt-3 max-w-sm text-base text-[#1F4D3A]/60">
        {name ? `${name}, you are in good company.` : 'You are in good company.'} Let&apos;s build a plan that fits you.
      </p>
    </div>
  );
}

function TimeChartScreen({ minutes }: { minutes: number }) {
  const options = [5, 10, 15, 30, 60];
  const weeks = weeksFor;
  const max = weeks(5);
  const mine = weeks(minutes);
  const BAR_MAX = 190;
  return (
    <div className="flex flex-1 flex-col justify-center">
      <h1 className="text-3xl font-bold text-[#1F4D3A]">
        At {fmtMinutes(minutes)} a day, you can master Excel completely in{' '}
        <span className="rounded-xl bg-[#C7F000] px-2">
          ~{mine} {mine === 1 ? 'week' : 'weeks'}
        </span>
      </h1>
      <div className="mt-8 rounded-3xl border-2 border-b-4 border-[#1F4D3A]/10 bg-white px-5 pb-5 pt-8">
        <div className="flex items-end justify-around gap-2" style={{ height: BAR_MAX + 56 }}>
          {options.map((m, i) => {
            const w = weeks(m);
            const active = m === minutes;
            const h = Math.max(46, (w / max) * BAR_MAX);
            return (
              <div key={m} className="flex flex-1 flex-col items-center justify-end">
                <div className="mb-2 h-6">
                  {active && (
                    <span className="rounded-full bg-[#1F4D3A] px-2.5 py-1 text-xs font-bold text-[#C7F000]">You</span>
                  )}
                </div>
                <div
                  className={`flex w-full items-start justify-center rounded-2xl pt-3 ${
                    active ? 'bg-[#C7F000] ring-2 ring-[#1F4D3A]' : 'bg-[#1F4D3A]/10'
                  }`}
                  style={{
                    height: `${h}px`,
                    transformOrigin: 'bottom',
                    animation: `ep-grow 700ms ${i * 120}ms both cubic-bezier(.2,.8,.2,1)`,
                  }}
                >
                  <span className={`text-xl font-extrabold ${active ? 'text-[#1F4D3A]' : 'text-[#1F4D3A]/60'}`}>
                    {w}
                    <span className="text-xs font-bold"> wks</span>
                  </span>
                </div>
                <span
                  className={`mt-3 text-sm font-bold ${active ? 'text-[#1F4D3A]' : 'text-[#1F4D3A]/50'}`}
                >
                  {m === 60 ? '1 hr' : `${m} min`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-sm text-[#1F4D3A]/50">
        Estimate based on about {PATH_MINUTES / 60} hours of hands-on practice to master Excel.
      </p>
    </div>
  );
}

function GrowthScreen({ level, minutes }: { level: string; minutes: number }) {
  const totalWeeks = weeksFor(minutes);
  const ticks = Array.from(new Set([1, totalWeeks]));
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Master'];
  const startIdx = level === 'advanced' ? 2 : level === 'intermediate' ? 1 : 0;
  const W = 340;
  const H = 260;
  const left = 96;
  const right = 22;
  const top = 40;
  const bottom = 44;
  const plotW = W - left - right;
  const plotH = H - top - bottom;
  const yFor = (v: number) => top + plotH - (v / 100) * plotH;
  const start = startIdx * 25 + 12;
  const end = 90;
  const x = (t: number) => left + t * plotW;
  const pts = (to: number, curve: number) => {
    const out: [number, number][] = [];
    for (let i = 0; i <= 36; i++) {
      const t = i / 36;
      const eased = curve === 0 ? t : (1 - Math.exp(-curve * t)) / (1 - Math.exp(-curve));
      out.push([x(t), yFor(start + (to - start) * eased)]);
    }
    return out;
  };
  const toPath = (p: [number, number][]) => p.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
  const green = pts(end, 2.6);
  const orange = pts(start + 14, 0);
  const baseY = H - bottom;
  const area = `${toPath(green)} L${x(1)},${baseY} L${x(0)},${baseY} Z`;
  const sy = yFor(start);
  const ey = yFor(end);

  return (
    <div className="flex flex-1 flex-col justify-center">
      <h1 className="text-3xl font-bold text-[#1F4D3A]">
        From {levels[startIdx].toLowerCase()} to{' '}
        <span className="rounded-xl bg-[#C7F000] px-2">Excel master</span> in {totalWeeks} {totalWeeks === 1 ? 'week' : 'weeks'}
      </h1>
      <div className="mt-8 rounded-3xl border-2 border-b-4 border-[#1F4D3A]/10 bg-white p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Projected skill level over ${totalWeeks} weeks`}>
          <defs>
            <linearGradient id="ep-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#C7F000" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#C7F000" stopOpacity="0" />
            </linearGradient>
          </defs>
          {levels.map((name, i) => {
            const y = yFor(i * 25 + 12);
            const strong = i === startIdx || i === 3;
            return (
              <g key={name}>
                <line x1={left} x2={W - right} y1={y} y2={y} stroke="#1F4D3A" strokeOpacity="0.1" strokeDasharray="3 4" />
                <text x={left - 14} y={y + 4} textAnchor="end" fontSize="12" fontWeight="700" fill="#1F4D3A" fillOpacity={strong ? 1 : 0.45}>
                  {name}
                </text>
              </g>
            );
          })}
          {ticks.map((w) => (
            <text key={w} x={x(totalWeeks > 1 ? (w - 1) / (totalWeeks - 1) : 0)} y={H - 14} textAnchor={w === 1 ? 'start' : 'end'} fontSize="12" fontWeight="600" fill="#1F4D3A" fillOpacity="0.5">
              {w === 0 ? 'Today' : `Week ${w}`}
            </text>
          ))}
          <path d={area} fill="url(#ep-area)" style={{ animation: 'ep-fade 1s 1.4s both' }} />
          <path d={toPath(orange)} pathLength={1} fill="none" stroke="#FF8A5B" strokeWidth="3" strokeLinecap="round" strokeDasharray="1" style={{ animation: 'ep-draw 1.6s 0.2s both ease-out' }} />
          <path d={toPath(green)} pathLength={1} fill="none" stroke="#1F4D3A" strokeWidth="4" strokeLinecap="round" strokeDasharray="1" style={{ animation: 'ep-draw 1.8s 0.5s both ease-out' }} />

          {/* start marker: pill sits below the baseline, clear of both lines */}
          <circle cx={x(0)} cy={sy} r="6" fill="#fff" stroke="#1F4D3A" strokeWidth="3" />
          <rect x={x(0) - 8} y={sy + 12} width="86" height="22" rx="11" fill="#1F4D3A" />
          <text x={x(0) + 35} y={sy + 27} textAnchor="middle" fontSize="11" fontWeight="800" fill="#C7F000">You are here</text>

          {/* end marker: pill sits above the line's end */}
          <g style={{ animation: 'ep-fade 500ms 2.2s both' }}>
            <circle cx={x(1)} cy={ey} r="7" fill="#C7F000" stroke="#1F4D3A" strokeWidth="3" />
            <rect x={x(1) - 78} y={ey - 34} width="86" height="22" rx="11" fill="#C7F000" stroke="#1F4D3A" strokeWidth="2" />
            <text x={x(1) - 35} y={ey - 19} textAnchor="middle" fontSize="11" fontWeight="800" fill="#1F4D3A">Mastered 🏆</text>
          </g>
        </svg>
        <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 px-3 pb-1 text-sm font-semibold">
          <span className="flex items-center gap-2 text-[#1F4D3A]">
            <span className="h-1.5 w-5 rounded-full bg-[#1F4D3A]" /> With ExcelPanda
          </span>
          <span className="flex items-center gap-2 text-[#1F4D3A]/60">
            <span className="h-1.5 w-5 rounded-full bg-[#FF8A5B]" /> On your own
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm text-[#1F4D3A]/50">
        Illustration of the progress you can aim for with {fmtMinutes(minutes)} of practice a day.
      </p>
    </div>
  );
}

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const items = [
    'Reviewing your answers',
    'Picking your first lessons',
    'Sizing your daily practice',
    'Finishing your plan',
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= items.length) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((s) => s + 1), 850);
    return () => clearTimeout(t);
  }, [shown, items.length, onDone]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="text-6xl" style={{ animation: 'ep-bounce 1s infinite' }}>
        🐼
      </div>
      <h1 className="mt-6 text-3xl font-bold text-[#1F4D3A]">Building your plan…</h1>
      <ul className="mt-8 space-y-3 text-left">
        {items.map((item, i) => (
          <li
            key={item}
            className={`flex items-center gap-3 text-lg font-semibold transition-opacity duration-300 ${
              i < shown ? 'opacity-100' : 'opacity-20'
            }`}
          >
            <span
              className={`flex size-7 items-center justify-center rounded-full text-sm ${
                i < shown ? 'bg-[#C7F000] text-[#1F4D3A]' : 'bg-[#1F4D3A]/10'
              }`}
            >
              {i < shown ? '✓' : ''}
            </span>
            <span className="text-[#1F4D3A]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryScreen({ answers }: { answers: Answers }) {
  const level = LEVEL_LABEL[answers.level as string] ?? '—';
  const goal = GOAL_LABEL[answers.goal as string] ?? '—';
  const minutes = Number(answers.minutes) || 10;
  const weeks = weeksFor(minutes);
  const rows: [string, string][] = [
    ['Starting level', level],
    ['Your goal', goal],
    ['Daily practice', fmtMinutes(minutes)],
    ['Full mastery in', `~${weeks} ${weeks === 1 ? 'week' : 'weeks'}`],
  ];
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="text-center text-6xl" style={{ animation: 'ep-pop 500ms both' }}>
        🎉
      </div>
      <h1 className="mt-4 text-center text-3xl font-bold text-[#1F4D3A]">{answers.name ? `${answers.name}, your plan is ready!` : 'Your plan is ready!'}</h1>
      <div className="mt-8 divide-y divide-[#1F4D3A]/10 rounded-3xl border-2 border-b-4 border-[#1F4D3A]/10 bg-white">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-5 py-4">
            <span className="text-[#1F4D3A]/60">{k}</span>
            <span className="font-bold text-[#1F4D3A]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NameScreen({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="text-5xl" style={{ animation: 'ep-bounce 1.4s infinite' }}>🐼</div>
      <h1 className="mt-6 text-3xl font-bold text-[#1F4D3A]">Hi! I&apos;m Panda. What should I call you?</h1>
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={40}
        placeholder="Your first name"
        className="mt-8 rounded-2xl border-2 border-b-4 border-[#1F4D3A]/15 bg-white px-5 py-4 text-lg font-semibold text-[#1F4D3A] outline-none placeholder:text-[#1F4D3A]/30 focus:border-[#1F4D3A]"
      />
    </div>
  );
}

const AVATARS = [
  'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?q=80&w=240&auto=format&fit=crop&ixlib=rb-4.1.0',
  'https://images.unsplash.com/photo-1590086782792-42dd2350140d?q=80&w=240&auto=format&fit=crop&ixlib=rb-4.1.0',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=240&auto=format&fit=crop&ixlib=rb-4.1.0',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=240&auto=format&fit=crop&ixlib=rb-4.1.0',
  'https://images.unsplash.com/photo-1606122017369-d782bbb78f32?q=80&w=240&auto=format&fit=crop&ixlib=rb-4.1.0',
];

// PLACEHOLDER REVIEWS — replace names, photos and quotes with real learners before launch.
const REVIEWS = [
  { name: 'Jake T.', role: 'College student', img: AVATARS[0], text: 'I finally understand formulas instead of copying them. The bite-sized lessons fit between classes.' },
  { name: 'Daniel R.', role: 'Junior analyst', img: AVATARS[1], text: 'Pivot tables used to scare me. Now I build them without thinking. Practicing hands on made all the difference.' },
  { name: 'Mark S.', role: 'Operations manager', img: AVATARS[2], text: 'I cut my weekly reporting from three hours to thirty minutes. I wish I had started sooner.' },
  { name: 'Maria L.', role: 'Small business owner', img: AVATARS[3], text: 'Clear, simple and actually fun. I run my whole inventory in Excel now.' },
  { name: 'Sofia P.', role: 'Marketing coordinator', img: AVATARS[4], text: 'XLOOKUP finally clicked. The short daily practice keeps it fresh without feeling like homework.' },
];

function ReviewCard({ r }: { r: (typeof REVIEWS)[number] }) {
  return (
    <div className="rounded-3xl border-2 border-b-4 border-[#1F4D3A]/10 bg-white p-5 text-left">
      <div className="text-lg tracking-wider text-[#FFB800]">★★★★★</div>
      <p className="mt-2 text-base font-medium leading-snug text-[#1F4D3A]">&ldquo;{r.text}&rdquo;</p>
      <div className="mt-4 flex items-center gap-3">
        <img src={r.img} alt={r.name} className="size-10 rounded-full object-cover" />
        <div>
          <p className="text-sm font-bold text-[#1F4D3A]">{r.name}</p>
          <p className="text-xs text-[#1F4D3A]/60">{r.role}</p>
        </div>
      </div>
    </div>
  );
}

function ReviewScreen({ name }: { name: string }) {
  const fade = 'linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)';
  return (
    <div className="flex flex-1 flex-col">
      <div className="text-center">
        <div className="text-5xl">💚</div>
        <h1 className="mt-4 text-3xl font-bold text-[#1F4D3A]">
          {name ? `${name}, you're joining happy learners` : "You're joining happy learners"}
        </h1>
        <p className="mt-2 text-[#1F4D3A]/60">Here&apos;s what they say about learning Excel with Panda.</p>
      </div>
      <div className="relative mt-6 h-[380px] overflow-hidden" style={{ maskImage: fade, WebkitMaskImage: fade }}>
        <div className="flex flex-col gap-4" style={{ animation: 'ep-marquee 28s linear infinite' }}>
          {[...REVIEWS, ...REVIEWS].map((r, i) => (
            <ReviewCard key={i} r={r} />
          ))}
        </div>
      </div>
    </div>
  );
}


// --- free trial, reminder and paywall (mock checkout: Stripe comes later) -----

type PlanId = 'annual' | 'annual_offer' | 'lifetime' | 'monthly';

const PLANS: { id: Exclude<PlanId, 'annual_offer'>; name: string; blurb: string; price: string; unit: string; badge?: string }[] = [
  { id: 'annual', name: 'Annual', blurb: '$59.99, billed yearly', price: '$4.99', unit: '/month', badge: 'Best value' },
  { id: 'lifetime', name: 'Lifetime', blurb: 'Pay once, yours forever', price: '$199', unit: ' one-time' },
  { id: 'monthly', name: 'Monthly', blurb: 'Flexible, cancel anytime', price: '$19.99', unit: '/month' },
];

const BENEFITS = [
  'Every course, from your first formula to VBA',
  'Practice drills, flashcards and timed challenges',
  'Real spreadsheet tasks with instant feedback',
  'Cancel anytime, in two taps',
];

function TrialScreen() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="text-center">
        <span className="inline-block rounded-full bg-[#C7F000] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1F4D3A]">
          7 days free
        </span>
        <h1 className="mt-5 text-3xl font-bold leading-tight text-[#1F4D3A] sm:text-4xl">Try everything free for 7 days</h1>
        <p className="mt-3 text-[#1F4D3A]/60">Full access to every lesson. No payment due today.</p>
      </div>
      <div className="relative mt-8 overflow-hidden rounded-3xl bg-[#1F4D3A] p-6 text-white">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-[#C7F000]/15" />
        <img src="/animateos-logo (4).png" alt="" className="relative size-14 rounded-2xl" />
        <p className="relative mt-4 text-sm text-white/60">Your free trial includes</p>
        <ul className="relative mt-3 space-y-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-3 text-[15px] leading-snug">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#C7F000] text-[11px] font-bold text-[#1F4D3A]">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ReminderScreen() {
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <div className="relative mt-2 grid size-28 place-items-center rounded-full bg-[#C7F000]/30">
        <span className="text-6xl" style={{ animation: 'ep-bounce 1.6s ease-in-out infinite' }}>🔔</span>
        <span className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-[#FF8A5B] text-sm font-bold text-white">1</span>
      </div>
      <h1 className="mt-6 text-3xl font-bold leading-tight text-[#1F4D3A] sm:text-4xl">We&apos;ll remind you before your trial ends</h1>
      <p className="mt-3 max-w-sm text-[#1F4D3A]/60">No surprise charges. We&apos;ll send you a reminder 2 days before your trial is over.</p>
      <div className="mt-8 w-full rounded-3xl border-2 border-b-4 border-[#1F4D3A]/10 bg-white p-4 text-left shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/animateos-logo (4).png" alt="" className="size-11 rounded-xl" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-xs text-[#1F4D3A]/50">
              <span className="font-semibold uppercase tracking-wide">ExcelPanda</span>
              <span>Day 5</span>
            </div>
            <p className="mt-0.5 text-sm font-bold text-[#1F4D3A]">Your free trial ends in 2 days</p>
            <p className="text-sm text-[#1F4D3A]/60">Keep your streak going, or cancel with one tap.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ icon, day, title, text, last }: { icon: string; day: string; title: string; text: string; last?: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#C7F000] text-sm">{icon}</span>
        {!last && <span className="my-1 w-0.5 flex-1 rounded-full bg-[#1F4D3A]/15" />}
      </div>
      <div className={last ? '' : 'pb-3'}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1F4D3A]/45">{day}</p>
        <p className="text-sm font-bold leading-tight text-[#1F4D3A]">{title}</p>
        <p className="text-xs text-[#1F4D3A]/60">{text}</p>
      </div>
    </div>
  );
}

function PaywallScreen({
  plan,
  onPlan,
  showClose,
  onClose,
}: {
  plan: PlanId;
  onPlan: (p: PlanId) => void;
  showClose: boolean;
  onClose: () => void;
}) {
  const lifetime = plan === 'lifetime';
  return (
    <div className="flex flex-1 flex-col">
      <div className="-mt-6 mb-2 flex h-8 justify-end">
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full bg-[#1F4D3A]/10 text-sm text-[#1F4D3A]/70 hover:bg-[#1F4D3A]/15"
            style={{ animation: 'ep-fade 400ms both' }}
          >
            ✕
          </button>
        )}
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold leading-tight text-[#1F4D3A] sm:text-4xl">
          {lifetime ? 'Own ExcelPanda for good' : 'Start your 7-day free trial'}
        </h1>
        <p className="mt-2 text-[#1F4D3A]/60">{lifetime ? 'One payment. Every lesson, forever.' : 'Cancel anytime before it ends and you pay nothing.'}</p>
      </div>

      <div className="mt-5 rounded-2xl bg-[#F3F6EC] p-4">
        {lifetime ? (
          <>
            <TimelineItem icon="🔓" day="Today" title="Unlock everything" text="Instant lifetime access to every course." />
            <TimelineItem icon="♾️" day="Forever" title="No renewals" text="Pay once. All future lessons included." last />
          </>
        ) : (
          <>
            <TimelineItem icon="🔓" day="Today" title="Unlock every lesson" text="Start learning right away, free for 7 days." />
            <TimelineItem icon="🔔" day="Day 5" title="We remind you" text="A reminder lands before your trial ends." />
            <TimelineItem icon="⭐" day="Day 7" title="Trial ends" text="You are charged only if you keep going." last />
          </>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2.5" role="radiogroup" aria-label="Choose a plan">
        {PLANS.map((p) => {
          const active = plan === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onPlan(p.id)}
              className={`relative flex items-center gap-3 rounded-xl border-2 border-b-4 px-4 py-2.5 text-left transition-colors ${
                active ? 'border-[#1F4D3A] bg-[#C7F000]/25' : 'border-[#1F4D3A]/15 bg-white hover:bg-[#1F4D3A]/5'
              }`}
            >
              {p.badge && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-[#1F4D3A] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C7F000]">
                  {p.badge}
                </span>
              )}
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border-2 text-[10px] ${
                  active ? 'border-[#1F4D3A] bg-[#1F4D3A] text-[#C7F000]' : 'border-[#1F4D3A]/25'
                }`}
              >
                {active ? '✓' : ''}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold leading-tight text-[#1F4D3A]">{p.name}</span>
                <span className="block text-xs text-[#1F4D3A]/60">{p.blurb}</span>
              </span>
              <span className="shrink-0 text-right text-[#1F4D3A]">
                <span className="text-lg font-bold">{p.price}</span>
                <span className="text-xs text-[#1F4D3A]/60">{p.unit}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OfferScreen({ onFullPrice, onClose }: { onFullPrice: () => void; onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <div className="-mt-6 mb-2 flex h-8 w-full justify-end">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close and go to the dashboard"
          className="grid size-8 place-items-center rounded-full bg-[#1F4D3A]/10 text-sm text-[#1F4D3A]/70 hover:bg-[#1F4D3A]/15"
        >
          ✕
        </button>
      </div>
      <span className="rounded-full bg-[#FF8A5B] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">Limited offer</span>
      <h1 className="mt-5 text-3xl font-bold leading-tight text-[#1F4D3A] sm:text-4xl">Wait, here&apos;s a better deal</h1>
      <p className="mt-3 max-w-sm text-[#1F4D3A]/60">Get a full year of ExcelPanda for a fraction of the price.</p>
      <div className="relative mt-8 w-full overflow-hidden rounded-3xl bg-[#1F4D3A] p-7 text-white">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-[#C7F000]/15" />
        <p className="relative text-7xl font-extrabold leading-none tracking-tight text-[#C7F000] sm:text-8xl">60%</p>
        <p className="relative mt-1 text-xl font-bold uppercase tracking-widest">off</p>
        <p className="relative mt-5 text-white/60">
          <span className="line-through">$59.99</span> <span className="font-semibold text-white">$23.99</span> per year
        </p>
        <p className="relative mt-1 text-sm text-white/60">Just $2.00 a month, billed yearly</p>
      </div>
      <button type="button" onClick={onFullPrice} className="mt-6 text-sm font-medium text-[#1F4D3A]/60 underline underline-offset-4 hover:text-[#1F4D3A]">
        I&apos;d like to pay full price
      </button>
    </div>
  );
}

// --- main flow --------------------------------------------------------------

export function OnboardingFlow() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [pending, startTransition] = useTransition();
  const [plan, setPlan] = useState<PlanId>('annual');
  const [error, setError] = useState('');
  const [showClose, setShowClose] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const selected = step.type === 'question' ? answers[step.id] : undefined;
  const name = ((answers.name as string | undefined) ?? '').trim();
  const canContinue =
    step.type === 'name'
      ? name.length > 0
      : step.type !== 'question' ||
        (Array.isArray(selected) ? selected.length > 0 : Boolean(selected));

  const choose = (q: QuestionStep, value: string) => {
    if (q.multi) {
      const current = (answers[q.id] as string[] | undefined) ?? [];
      setAnswers({
        ...answers,
        [q.id]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      });
    } else {
      setAnswers({ ...answers, [q.id]: value });
    }
  };

  // After 8 seconds on the paywall a close button appears. Closing shows the limited offer once.
  const onPaywall = step.type === 'paywall';
  useEffect(() => {
    setShowClose(false);
    if (!onPaywall || offerOpen) return;
    const t = setTimeout(() => setShowClose(true), 8000);
    return () => clearTimeout(t);
  }, [onPaywall, offerOpen]);

  const openOffer = () => {
    setOfferOpen(true);
    setPlan('annual_offer');
    setError('');
  };
  const fullPrice = () => {
    setOfferOpen(false);
    setPlan('annual');
    setError('');
  };

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      return;
    }
    setError('');
    startTransition(async () => {
      try {
        const saved = await saveOnboarding(answers);
        if (!saved.ok) throw new Error('Please sign in again.');
        await startCheckout(plan);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      }
    });
    return;
  };

  const goToDashboard = () => {
    startTransition(() => {
      void completeOnboarding(answers);
    });
  };

  const summaryAnswers: Answers = answers;
  const minutes = Number(answers.minutes) || 10;
  const hideNav = step.type === 'loading';
  const ctaLabel = pending
    ? 'Saving…'
    : step.type === 'summary'
      ? 'Looks good'
      : step.type === 'trial'
        ? 'Start my free trial'
        : step.type === 'paywall'
          ? plan === 'lifetime'
            ? 'Get lifetime access'
            : plan === 'annual_offer'
              ? 'Claim my offer'
              : 'Start my 7-day free trial'
          : 'Continue';

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-10">
      <style>{`
        @keyframes ep-draw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
        @keyframes ep-grow { from { transform: scaleY(0) } to { transform: scaleY(1) } }
        @keyframes ep-pop { from { transform: scale(0); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes ep-bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @keyframes ep-marquee { from { transform: translateY(0) } to { transform: translateY(calc(-50% - 8px)) } }
        @keyframes ep-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ep-in { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
      `}</style>

      <div className="flex items-center gap-4">
        {index > 0 && !hideNav && (
          <button
            type="button"
            onClick={() => setIndex(index - 1)}
            className="text-2xl text-[#1F4D3A]/60 hover:text-[#1F4D3A]"
            aria-label="Back"
          >
            ←
          </button>
        )}
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#1F4D3A]/10">
          <div
            className="h-full rounded-full bg-[#C7F000] transition-all duration-500"
            style={{ width: `${((index + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div key={step.id} className="mt-10 flex flex-1 flex-col" style={{ animation: 'ep-in 350ms both' }}>
        {step.type === 'question' && (
          <>
            <h1 className="text-3xl font-bold text-[#1F4D3A]">{step.title}</h1>
            {step.subtitle && <p className="mt-2 text-[#1F4D3A]/60">{step.subtitle}</p>}
            <div className="mt-8 flex flex-col gap-3">
              {step.options.map((option) => {
                const active = Array.isArray(selected)
                  ? selected.includes(option.value)
                  : selected === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => choose(step, option.value)}
                    className={`flex items-center gap-4 rounded-2xl border-2 border-b-4 px-5 py-4 text-left text-lg font-semibold transition-colors ${
                      active
                        ? 'border-[#1F4D3A] bg-[#C7F000]/30 text-[#1F4D3A]'
                        : 'border-[#1F4D3A]/15 bg-white text-[#1F4D3A] hover:bg-[#1F4D3A]/5'
                    }`}
                  >
                    <span className="text-3xl">{option.emoji}</span>
                    <span className="flex-1">{option.label}</span>
                    {step.multi && (
                      <span
                        className={`flex size-6 items-center justify-center rounded-md border-2 text-sm ${
                          active ? 'border-[#1F4D3A] bg-[#1F4D3A] text-[#C7F000]' : 'border-[#1F4D3A]/20'
                        }`}
                      >
                        {active ? '✓' : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
        {step.type === 'name' && (
          <NameScreen value={(answers.name as string) ?? ''} onChange={(v) => setAnswers({ ...answers, name: v })} />
        )}
        {step.type === 'review' && (
          <ReviewScreen name={name} />
        )}
        {step.type === 'trial' && <TrialScreen />}
        {step.type === 'reminder' && <ReminderScreen />}
        {step.type === 'paywall' &&
          (offerOpen ? (
            <OfferScreen onFullPrice={fullPrice} onClose={goToDashboard} />
          ) : (
            <PaywallScreen plan={plan} onPlan={setPlan} showClose={showClose} onClose={openOffer} />
          ))}
        {step.type === 'social' && <SocialScreen name={name} />}
        {step.type === 'time-chart' && <TimeChartScreen minutes={minutes} />}
        {step.type === 'growth' && <GrowthScreen level={(answers.level as string) ?? 'beginner'} minutes={minutes} />}
        {step.type === 'loading' && <LoadingScreen onDone={() => setIndex((i) => i + 1)} />}
        {step.type === 'summary' && <SummaryScreen answers={summaryAnswers} />}
      </div>

      {!hideNav && (
        <button
          type="button"
          disabled={!canContinue || pending}
          onClick={next}
          className="mt-8 rounded-2xl border-b-4 border-black/20 bg-[#1F4D3A] py-4 text-lg font-bold uppercase tracking-wide text-[#C7F000] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {ctaLabel}
        </button>
      )}
      {step.type === 'paywall' && (
        <div className="mt-4 text-center text-xs text-[#1F4D3A]/50">
          {error && <p className="mb-2 text-sm font-medium text-[#C4562F]">{error}</p>}
          <p>
            {plan === 'lifetime'
              ? 'One-time payment. No subscription.'
              : plan === 'annual_offer'
                ? 'Billed today. Cancel anytime.'
                : 'No payment due today. Cancel anytime.'}
          </p>
        </div>
      )}
    </main>
  );
}
