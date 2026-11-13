'use client';

import { useUser } from '@clerk/nextjs';
import { Bug, Check, CreditCard, HelpCircle, LifeBuoy, Lightbulb, Send, type LucideIcon } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

const TOPICS: { id: string; label: string; hint: string; icon: LucideIcon }[] = [
  { id: 'Bug', label: 'Something broke', hint: 'A lesson, the sheet or a page misbehaves', icon: Bug },
  { id: 'Billing', label: 'Billing', hint: 'Payments, trials or your plan', icon: CreditCard },
  { id: 'Question', label: 'Question', hint: 'Anything about ExcelPanda', icon: HelpCircle },
  { id: 'Idea', label: 'Idea', hint: 'Tell us what to build next', icon: Lightbulb },
];

const label = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#1F4D3A]/45';
const field =
  'w-full rounded-2xl border-2 border-[#1F4D3A]/15 bg-[#F7F8F4] px-4 py-3 text-[15px] outline-none placeholder:text-[#1F4D3A]/35 focus:border-[#1F4D3A]/40';

export function SupportForm() {
  const { user, isLoaded } = useUser();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState(''); // honeypot: left empty by people
  const [topic, setTopic] = useState('Question');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const addr = user?.primaryEmailAddress?.emailAddress;
    if (addr) setEmail((e) => e || addr);
  }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === 'sending') return;
    setError(null);
    setState('sending');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, email, message, name, website, page: document.referrer ? new URL(document.referrer).pathname : '' }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.');
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setState('idle');
    }
  };

  if (state === 'sent') {
    return (
      <div className="rounded-3xl border-2 border-b-4 border-[#1F4D3A]/10 bg-white px-6 py-14 text-center">
        <span className="mx-auto grid size-24 place-items-center rounded-full border-2 border-b-4 border-[#98BA00] bg-[#C7F000] text-[#1F4D3A]">
          <Check size={44} strokeWidth={3.5} />
        </span>
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight">Message sent!</h2>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-[#1F4D3A]/65">
          Thanks for reaching out. The ExcelPanda team will reply to <strong className="text-[#1F4D3A]">{email}</strong> soon.
        </p>
        <button
          type="button"
          onClick={() => {
            setMessage('');
            setState('idle');
          }}
          className="mt-8 rounded-2xl border-2 border-b-4 border-[#1F4D3A]/15 bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-[#1F4D3A] transition-all hover:-translate-y-0.5 hover:bg-[#1F4D3A]/5 active:translate-y-0.5 active:border-b-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="relative rounded-3xl border-2 border-b-4 border-[#1F4D3A]/10 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl border-2 border-b-4 border-[#98BA00] bg-[#C7F000] text-[#1F4D3A]">
          <LifeBuoy size={26} strokeWidth={2.6} />
        </span>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Contact ExcelPanda Support</h2>
          <p className="text-sm text-[#1F4D3A]/60">We usually reply within a day.</p>
        </div>
      </div>

      <p className={`${label} mt-7`}>What is it about?</p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {TOPICS.map(({ id, label: name, hint, icon: Icon }) => {
          const on = topic === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTopic(id)}
              aria-pressed={on}
              className={`flex items-center gap-3 rounded-2xl border-2 border-b-4 p-3.5 text-left transition-all active:translate-y-0.5 active:border-b-2 ${
                on ? 'border-[#98BA00] bg-[#C7F000]/30' : 'border-[#1F4D3A]/12 bg-white hover:bg-[#1F4D3A]/5'
              }`}
            >
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${on ? 'bg-[#C7F000]' : 'bg-[#1F4D3A]/8'}`}>
                <Icon size={19} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold">{name}</span>
                <span className="block text-xs leading-snug text-[#1F4D3A]/55">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {isLoaded && !user && (
        <>
          <label className={`${label} mt-6`} htmlFor="support-name">
            Your name
          </label>
          <input
            id="support-name"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex"
            className={field}
          />
        </>
      )}
      <input
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        name="website"
        className="absolute -left-[9999px] size-0 opacity-0"
      />

      <label className={`${label} mt-6`} htmlFor="support-email">
        Your email
      </label>
      <input
        id="support-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={field}
      />

      <label className={`${label} mt-5`} htmlFor="support-message">
        Message
      </label>
      <textarea
        id="support-message"
        required
        minLength={10}
        maxLength={4000}
        rows={7}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What happened? Which lesson or step were you on?"
        className={`${field} resize-y`}
      />

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-[#FDECEA] px-3.5 py-2.5 text-sm font-medium text-[#C0392B]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-[#0F2A1F] bg-[#1F4D3A] py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-[#245a43] active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === 'sending' ? (
          'Sending…'
        ) : (
          <>
            Send message <Send size={16} />
          </>
        )}
      </button>
    </form>
  );
}
