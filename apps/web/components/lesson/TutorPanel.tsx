'use client';

import { Send, Sparkles, X } from 'lucide-react';
import { Children, isValidElement, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

/** Plain text of a step body (it is JSX), so the tutor knows what the learner is reading. */
export function nodeToText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join(' ');
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return Children.toArray(props.children).map(nodeToText).join(' ');
  }
  return '';
}

export type TutorContext = {
  lesson: string;
  unit: string;
  stepNumber: number;
  stepTotal: number;
  stepTitle: string;
  stepText: string;
  hint?: string;
  solved: boolean;
  selection?: string;
  activeCell?: string;
  cells?: Record<string, string>;
};

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = ['Explain this step', 'Give me a hint', "Why isn't mine working?"];

/** The chunky, Duolingo-style button that sits in the lesson header. With `nudge` it shuffles and a speech bubble appears. */
export function TutorButton({ onClick, open, nudge, onDismissNudge }: { onClick: () => void; open: boolean; nudge?: boolean; onDismissNudge?: () => void }) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-label="Ask Panda for help"
        aria-expanded={open}
        className="group flex items-center gap-1.5 rounded-2xl border-2 border-b-4 border-[#98BA00] bg-[#C7F000] px-3 py-1.5 text-sm font-extrabold uppercase tracking-wide text-[#1F4D3A] transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5 active:border-b-2"
        style={nudge ? { animation: 'panda-shuffle 1.6s ease-in-out infinite' } : undefined}
      >
        <Sparkles size={17} strokeWidth={2.6} className="transition-transform group-hover:rotate-12" />
        <span className="hidden sm:inline">Ask Panda</span>
      </button>
      {nudge && !open && (
        <div
          role="status"
          className="absolute right-0 top-full z-30 mt-3 w-64 rounded-2xl border-2 border-b-4 border-[#1F4D3A]/15 bg-white p-3.5 pr-8 text-left shadow-[0_16px_40px_-12px_rgba(16,40,28,0.3)]"
          style={{ animation: 'panda-pop 350ms cubic-bezier(.2,.9,.3,1.2) both' }}
        >
          <span className="absolute -top-[7px] right-6 size-3 rotate-45 border-l-2 border-t-2 border-[#1F4D3A]/15 bg-white" />
          <p className="text-sm font-extrabold text-[#1F4D3A]">Stuck? Ask Panda for help!</p>
          <p className="mt-0.5 text-[13px] leading-snug text-[#1F4D3A]/65">
            I can see exactly which step you are on and nudge you in the right direction.
          </p>
          <button
            type="button"
            onClick={onDismissNudge}
            aria-label="Dismiss"
            className="absolute right-2 top-2 grid size-6 place-items-center rounded-lg text-[#1F4D3A]/45 hover:bg-[#1F4D3A]/8 hover:text-[#1F4D3A]"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export function TutorSidebar({
  open,
  onClose,
  getContext,
  stepLabel,
}: {
  open: boolean;
  onClose: () => void;
  getContext: () => TutorContext;
  stepLabel: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      setError(null);
      setInput('');
      const next: Msg[] = [...messages, { role: 'user', content: q }];
      setMessages([...next, { role: 'assistant', content: '' }]);
      setBusy(true);
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch('/api/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next, context: getContext() }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? 'Something went wrong. Please try again.');
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((m) => [...m.slice(0, -1), { role: 'assistant', content: acc }]);
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setMessages((m) => (m[m.length - 1]?.content === '' ? m.slice(0, -1) : m));
        setError(e instanceof Error ? e.message : 'Something went wrong.');
      } finally {
        setBusy(false);
      }
    },
    [busy, getContext, messages]
  );

  return (
    <>
      {open && <div className="fixed inset-0 z-[60] bg-[#0F2A1F]/30 backdrop-blur-[1px] sm:hidden" onClick={onClose} />}
      <aside
        aria-hidden={!open}
        aria-label="Panda tutor"
        onClick={(e) => e.stopPropagation()}
        className={`fixed right-0 top-0 z-[70] flex h-dvh w-full max-w-[400px] flex-col border-l-2 border-[#1F4D3A]/10 bg-white shadow-[-16px_0_40px_-16px_rgba(16,40,28,0.25)] transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b-2 border-[#1F4D3A]/10 px-4 py-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl border-2 border-b-4 border-[#98BA00] bg-[#C7F000] text-[#1F4D3A]">
            <Sparkles size={18} strokeWidth={2.6} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-extrabold leading-tight text-[#1F4D3A]">Panda tutor</p>
            <p className="truncate text-xs font-medium text-[#1F4D3A]/55">{stepLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tutor"
            className="grid size-9 place-items-center rounded-xl text-[#1F4D3A]/60 hover:bg-[#1F4D3A]/8 hover:text-[#1F4D3A]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border-2 border-b-4 border-[#1F4D3A]/10 bg-[#F7F8F4] p-4 text-sm leading-relaxed text-[#1F4D3A]/80">
              <p className="font-bold text-[#1F4D3A]">Stuck? I can see which step you are on.</p>
              <p className="mt-1">Ask me anything about this step and I will nudge you in the right direction without spoiling the fun.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'rounded-br-md border-b-4 border-[#0F2A1F] bg-[#1F4D3A] text-white'
                    : 'rounded-bl-md border-2 border-b-4 border-[#1F4D3A]/10 bg-white text-[#1F4D3A]'
                }`}
              >
                {m.content || (
                  <span className="inline-flex gap-1" aria-label="Thinking">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="size-1.5 animate-bounce rounded-full bg-[#1F4D3A]/40" style={{ animationDelay: `${d * 120}ms` }} />
                    ))}
                  </span>
                )}
              </div>
            </div>
          ))}
          {error && (
            <p role="alert" className="rounded-xl bg-[#FDECEA] px-3 py-2 text-sm font-medium text-[#C0392B]">
              {error}
            </p>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t-2 border-[#1F4D3A]/10 p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => send(s)}
                className="rounded-xl border-2 border-b-4 border-[#1F4D3A]/15 bg-white px-2.5 py-1 text-xs font-bold text-[#1F4D3A] transition-all hover:bg-[#1F4D3A]/5 active:translate-y-0.5 active:border-b-2 disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation(); // keep typing away from the sheet's keyboard shortcuts
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              maxLength={800}
              rows={1}
              placeholder="Ask about this step…"
              className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border-2 border-[#1F4D3A]/15 bg-[#F7F8F4] px-3.5 py-2.5 text-sm text-[#1F4D3A] outline-none placeholder:text-[#1F4D3A]/40 focus:border-[#1F4D3A]/40"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="grid size-11 shrink-0 place-items-center rounded-2xl border-b-4 border-[#0F2A1F] bg-[#1F4D3A] text-white transition-all hover:bg-[#245a43] active:translate-y-0.5 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
