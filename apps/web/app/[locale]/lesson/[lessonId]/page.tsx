import { database } from '@repo/database';
import { ArrowLeft, CheckCircle2, Construction } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { LessonPlayer } from '@/components/lesson/LessonPlayer';
import { getLessonContent } from '@/lessons/registry';
import { getCourseMap } from '../../(app)/data';
import { getProfile } from '../../(app)/get-profile';
import { Btn, Card, Pill } from '../../(app)/ui';
import { completeLesson } from '../actions';

export const metadata = { title: 'Lesson – ExcelPanda' };
export const dynamic = 'force-dynamic';

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId: slug } = await params;
  const { userId } = await getProfile();
  const map = await getCourseMap(userId);

  const unit = map?.units.find((u) => u.nodes.some((n) => n.slug === slug || n.id === slug));
  const node = unit?.nodes.find((n) => n.slug === slug || n.id === slug);
  if (!unit || !node) notFound();
  if (node.state === 'locked') redirect('/dashboard');

  const row = await database.lesson.findUnique({ where: { id: node.id }, select: { contentKey: true } });
  const content = getLessonContent(row?.contentKey);

  if (content) {
    return (
      <LessonPlayer
        contentKey={content.key}
        unitTitle={unit.title}
        xp={node.xp}
        alreadyDone={node.state === 'done'}
        onComplete={completeLesson.bind(null, node.id)}
      />
    );
  }

  // No content written yet for this lesson.
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 text-[#1F4D3A]">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#1F4D3A]/60 hover:text-[#1F4D3A]"
      >
        <ArrowLeft size={16} /> Back to your path
      </Link>
      <Card className="!p-8">
        <div className="flex items-center gap-2">
          <Pill tone="green">
            Unit {unit.number} · {unit.title}
          </Pill>
          {node.state === 'done' && (
            <Pill tone="teal">
              <CheckCircle2 size={12} /> Completed
            </Pill>
          )}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{node.title}</h1>
        <div className="mt-8 flex items-start gap-4 rounded-xl border border-dashed border-[#1F4D3A]/20 bg-[#F7F8F4] p-5">
          <Construction className="mt-0.5 shrink-0 text-[#9A6B00]" size={22} />
          <div>
            <p className="font-semibold">Lesson content is coming soon</p>
            <p className="mt-1 text-sm leading-relaxed text-[#1F4D3A]/60">
              This lesson has not been written yet. You can still mark it complete to see your path, XP and streak update.
            </p>
          </div>
        </div>
        {node.state === 'current' && (
          <form
            action={async () => {
              'use server';
              await completeLesson(node.id);
              redirect('/dashboard');
            }}
            className="mt-8"
          >
            <Btn submit className="w-full sm:w-auto">
              Complete lesson{node.xp > 0 ? ` (+${node.xp} XP)` : ' and open chest'}
            </Btn>
          </form>
        )}
      </Card>
    </div>
  );
}
