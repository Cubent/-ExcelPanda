import { database } from '@repo/database';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Flashcards } from '@/components/lesson/Flashcards';
import { PracticeRunner, type PracticeMode } from '@/components/lesson/PracticeRunner';
import { CASES } from '@/lessons/cases';
import { getProfile } from '../../(app)/get-profile';

export const metadata = { title: 'Practice – ExcelPanda' };
export const dynamic = 'force-dynamic';

const MODES = ['quick', 'timed', 'mistakes', 'shortcuts', 'cases', 'flashcards'];

export default async function TrainPage({ params, searchParams }: { params: Promise<{ mode: string }>; searchParams: Promise<{ c?: string }> }) {
  const { mode } = await params;
  const { c } = await searchParams;
  if (!MODES.includes(mode)) notFound();
  const { userId } = await getProfile();

  if (mode === 'flashcards') return <Flashcards />;

  if (mode === 'cases') {
    const chosen = CASES.find((x) => x.key === c);
    if (chosen) return <PracticeRunner mode="cases" seed={1} caseKey={chosen.key} />;
    return (
      <div className="mx-auto w-full max-w-[760px] px-4 py-10 text-[#1F4D3A]">
        <Link href="/practice" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#1F4D3A]/60 hover:text-[#1F4D3A]">
          <ArrowLeft size={16} /> Back to practice
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Real-world cases</h1>
        <p className="mt-2 text-[15px] text-[#1F4D3A]/60">Small, realistic sheets. Each is solved step by step with the functions you already know.</p>
        <div className="mt-8 space-y-3">
          {CASES.map((x) => (
            <Link
              key={x.key}
              href={`/train/cases?c=${x.key}`}
              className="flex items-center justify-between gap-4 rounded-2xl border-2 border-b-4 border-[#1F4D3A]/15 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#1F4D3A]/35"
            >
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{x.title.replace('Case: ', '')}</h2>
                <p className="mt-0.5 text-sm text-[#1F4D3A]/55">{x.steps.filter((s) => s.check).length} steps</p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-[#1F4D3A]/50" />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Quick drill and timed challenge draw from the lessons you have finished.
  let pool: string[] | undefined;
  if (mode === 'quick' || mode === 'timed') {
    const rows = await database.userLessonProgress.findMany({
      where: { clerkUserId: userId },
      orderBy: { completedAt: 'desc' },
      take: 25,
      select: { lesson: { select: { contentKey: true } } },
    });
    pool = rows.map((r) => r.lesson.contentKey).filter((k): k is string => !!k);
  }
  return <PracticeRunner mode={mode as PracticeMode} seed={Math.floor(Math.random() * 1_000_000_000)} pool={pool} />;
}
