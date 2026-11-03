'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { buildDrill, buildMistakes, buildShortcuts } from '@/lessons/drills';
import { getLessonContent } from '@/lessons/registry';
import { LessonPlayer, getMissed } from './LessonPlayer';

export type PracticeMode = 'quick' | 'timed' | 'mistakes' | 'shortcuts' | 'cases';

const LABEL: Record<PracticeMode, string> = {
  quick: 'Quick drill',
  timed: 'Timed challenge',
  mistakes: 'Fix your mistakes',
  shortcuts: 'Shortcut trainer',
  cases: 'Real-world case',
};
const none = async () => ({ ok: true, xp: 0, gems: 0 });

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center text-[#1F4D3A]">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-[15px] text-[#1F4D3A]/65">{text}</p>
      <Link href="/practice" className="mt-6 rounded-xl bg-[#1F4D3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#173d2e]">
        Back to practice
      </Link>
    </div>
  );
}

/** Plays a practice session in the lesson player: no XP, a Skip button, and an optional countdown. */
export function PracticeRunner({ mode, seed, pool, caseKey }: { mode: PracticeMode; seed: number; pool?: string[]; caseKey?: string }) {
  const [missed, setMissed] = useState<string[] | null>(null);
  useEffect(() => {
    if (mode === 'mistakes') setMissed(getMissed());
  }, [mode]);

  const content = useMemo(() => {
    if (mode === 'quick') return buildDrill('quick', seed, pool, 5);
    if (mode === 'timed') return buildDrill('timed', seed, pool, 6);
    if (mode === 'shortcuts') return buildShortcuts(seed);
    if (mode === 'cases') return getLessonContent(caseKey);
    return missed ? buildMistakes(missed, seed) : null;
  }, [mode, seed, pool, caseKey, missed]);

  if (mode === 'mistakes' && missed === null) return null;
  if (!content) {
    return mode === 'mistakes' ? (
      <Empty title="No mistakes to fix" text="Steps where you used a hint or skipped will show up here. Do a few lessons or a drill, then come back." />
    ) : (
      <Empty title="Nothing to practise yet" text="This session could not be built. Try another mode." />
    );
  }
  return (
    <LessonPlayer
      key={content.key}
      contentKey={content.key}
      content={content}
      unitTitle={LABEL[mode]}
      xp={0}
      alreadyDone
      courseHref="/practice"
      practice={{ mode: LABEL[mode], limitSec: mode === 'timed' ? 300 : undefined }}
      onComplete={none}
    />
  );
}
