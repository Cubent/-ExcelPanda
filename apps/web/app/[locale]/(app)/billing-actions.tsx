'use client';

import Link from 'next/link';
import { useState } from 'react';
import { openPortal, startCheckout, type CheckoutPlan } from '@/lib/checkout-client';

const btn = 'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50';

/** "Manage subscription" opens Stripe's billing portal (cancel, switch plan, update card, invoices). */
export function ManageSubscriptionButton({ className = '' }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className={className}>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError('');
          try {
            await openPortal();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Something went wrong.');
            setBusy(false);
          }
        }}
        className={`${btn} bg-[#1F4D3A] text-white hover:bg-[#173d2e]`}
      >
        {busy ? 'Opening…' : 'Manage subscription'}
      </button>
      {error && <p className="mt-2 text-sm text-[#C4562F]">{error}</p>}
    </div>
  );
}

export const ChoosePlanLink = () => (
  <Link href="/subscribe" className={`${btn} bg-[#C7F000] text-[#1F4D3A] hover:bg-[#d4f526]`}>
    Choose a plan
  </Link>
);

const PLANS: { id: CheckoutPlan; name: string; blurb: string; price: string; unit: string; badge?: string }[] = [
  { id: 'annual', name: 'Annual', blurb: '$59.99, billed yearly', price: '$4.99', unit: '/month', badge: 'Best value' },
  { id: 'lifetime', name: 'Lifetime', blurb: 'Pay once, yours forever', price: '$199', unit: ' one-time' },
  { id: 'monthly', name: 'Monthly', blurb: 'Flexible, cancel anytime', price: '$19.99', unit: '/month' },
];

/** Plan cards with a checkout button, used on /subscribe. */
export function PlanPicker() {
  const [plan, setPlan] = useState<CheckoutPlan>('annual');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lifetime = plan === 'lifetime';

  return (
    <div>
      <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Choose a plan">
        {PLANS.map((p) => {
          const active = plan === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPlan(p.id)}
              className={`relative flex items-center gap-3 rounded-xl border-2 border-b-4 px-4 py-3 text-left transition-colors ${
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
                <span className="block text-base font-bold leading-tight">{p.name}</span>
                <span className="block text-xs text-[#1F4D3A]/60">{p.blurb}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="text-lg font-bold">{p.price}</span>
                <span className="text-xs text-[#1F4D3A]/60">{p.unit}</span>
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError('');
          try {
            await startCheckout(plan);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Something went wrong.');
            setBusy(false);
          }
        }}
        className="mt-6 w-full rounded-2xl border-b-4 border-black/20 bg-[#1F4D3A] py-4 text-base font-bold uppercase tracking-wide text-[#C7F000] disabled:opacity-50"
      >
        {busy ? 'Opening checkout…' : lifetime ? 'Get lifetime access' : 'Start my 7-day free trial'}
      </button>
      {error && <p className="mt-3 text-center text-sm font-medium text-[#C4562F]">{error}</p>}
      <p className="mt-3 text-center text-xs text-[#1F4D3A]/50">
        {lifetime ? 'One-time payment. No subscription.' : 'No payment due today. Cancel anytime.'}
      </p>
    </div>
  );
}
