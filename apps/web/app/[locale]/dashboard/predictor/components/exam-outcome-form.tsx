'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState, useTransition } from 'react';

const FIELD =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#06005A] dark:border-white/15 dark:bg-transparent dark:text-gray-100 dark:focus:border-[#C46B10]';
const LABEL = 'mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400';

const todayLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const ExamOutcomeForm = ({ scored }: { scored: boolean }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [passed, setPassed] = useState<'yes' | 'no' | ''>('');
  const [score, setScore] = useState('');
  const [date, setDate] = useState('');
  const [today, setToday] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = todayLocal();
    setToday(t);
    setDate((current) => current || t);
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!passed) {
      setError('Say whether you passed.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/dashboard/exam-outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passed: passed === 'yes', score: scored ? Number(score) : undefined, takenAt: date }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? 'Could not save your result. Please try again.');
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError('Could not save your result. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-3">
      <div>
        <label htmlFor="outcome-date" className={LABEL}>
          Exam date
        </label>
        <input
          id="outcome-date"
          type="date"
          required
          value={date}
          max={today || undefined}
          onChange={(e) => setDate(e.target.value)}
          className={FIELD}
        />
      </div>
      <div>
        <label htmlFor="outcome-result" className={LABEL}>
          Result
        </label>
        <select id="outcome-result" value={passed} onChange={(e) => setPassed(e.target.value as 'yes' | 'no' | '')} className={FIELD}>
          <option value="">Choose…</option>
          <option value="yes">Passed</option>
          <option value="no">Did not pass</option>
        </select>
      </div>
      {scored && (
        <div>
          <label htmlFor="outcome-score" className={LABEL}>
            Three-digit score
          </label>
          <input
            id="outcome-score"
            type="number"
            inputMode="numeric"
            min={1}
            max={300}
            step={1}
            required
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className={FIELD}
          />
        </div>
      )}
      <div className="sm:col-span-3">
        <button
          type="submit"
          disabled={submitting || isPending}
          className="rounded-full border border-[#06005A] px-5 py-2.5 text-sm font-semibold text-[#06005A] transition-colors hover:bg-[#06005A] hover:text-white disabled:opacity-60 dark:border-white/30 dark:text-white"
        >
          {submitting ? 'Saving…' : 'Save my result'}
        </button>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </form>
  );
};
