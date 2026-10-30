'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState, useTransition } from 'react';

type Assessment = { id: string; source: string; label: string; score: number; takenAt: string };

const SOURCES = [
  { value: 'NBME', label: 'NBME form' },
  { value: 'UWSA', label: 'UWSA' },
  { value: 'FREE_120', label: 'Free 120' },
  { value: 'OTHER', label: 'Other' },
];

const SOURCE_LABEL = Object.fromEntries(SOURCES.map((s) => [s.value, s.label]));

const FIELD =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#06005A] dark:border-white/15 dark:bg-transparent dark:text-gray-100 dark:focus:border-[#C46B10]';
const LABEL = 'mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400';

const todayLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const AssessmentLogger = ({ assessments }: { assessments: Assessment[] }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [source, setSource] = useState('NBME');
  const [label, setLabel] = useState('');
  const [score, setScore] = useState('');
  const [date, setDate] = useState('');
  const [today, setToday] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Set after mount so the server-rendered HTML and the first client render agree.
  useEffect(() => {
    const t = todayLocal();
    setToday(t);
    setDate((current) => current || t);
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/dashboard/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, label, score: Number(score), takenAt: date }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? 'Could not save that exam. Please try again.');
        return;
      }
      setLabel('');
      setScore('');
      startTransition(() => router.refresh());
    } catch {
      setError('Could not save that exam. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this practice exam from your estimate?')) return;
    setError(null);
    const response = await fetch(`/api/dashboard/assessments?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) {
      setError('Could not remove that exam. Please try again.');
      return;
    }
    startTransition(() => router.refresh());
  };

  return (
    <div>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="assessment-source" className={LABEL}>
            Practice exam
          </label>
          <select id="assessment-source" value={source} onChange={(e) => setSource(e.target.value)} className={FIELD}>
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="assessment-label" className={LABEL}>
            Name
          </label>
          <input
            id="assessment-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={40}
            required
            placeholder={source === 'UWSA' ? 'UWSA 2' : source === 'FREE_120' ? 'Free 120' : 'NBME 12'}
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="assessment-score" className={LABEL}>
            Three-digit score
          </label>
          <input
            id="assessment-score"
            type="number"
            inputMode="numeric"
            min={1}
            max={300}
            step={1}
            required
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="e.g. 238"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="assessment-date" className={LABEL}>
            Date taken
          </label>
          <input
            id="assessment-date"
            type="date"
            required
            value={date}
            max={today || undefined}
            onChange={(e) => setDate(e.target.value)}
            className={FIELD}
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting || isPending}
            className="inline-flex items-center gap-2 rounded-full bg-[#06005A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a0080] disabled:opacity-60"
          >
            <Plus className="size-4" />
            {submitting ? 'Saving…' : 'Add practice exam'}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {assessments.length > 0 && (
        <ul className="mt-6 divide-y divide-gray-100 dark:divide-white/10">
          {assessments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#06005A] dark:text-white">{a.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {SOURCE_LABEL[a.source] ?? a.source} &middot;{' '}
                  {new Date(a.takenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[#06005A] dark:text-white">
                  {a.score}
                </span>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  aria-label={`Remove ${a.label}`}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-white/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
