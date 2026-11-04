// Browser helpers that call our Stripe routes and follow the returned URL.
export type CheckoutPlan = 'annual' | 'annual_offer' | 'monthly' | 'lifetime';

async function go(path: string, body?: unknown) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? 'Could not reach checkout. Please try again.');
  window.location.href = data.url;
  // Keep the button busy while the browser navigates away.
  await new Promise(() => {});
}

export const startCheckout = (plan: CheckoutPlan, extra?: { answers?: unknown; returnTo?: 'paywall' | 'offer' }) =>
  go('/api/stripe/checkout', { plan, ...extra });
export const openPortal = () => go('/api/stripe/portal');
