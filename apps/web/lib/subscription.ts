// Billing state helpers shared by the app, the profile page and the access checks.
export type Billing = {
  plan: string | null;
  status: string | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

const LIVE = ['trialing', 'active', 'past_due', 'lifetime'];

/** past_due keeps access while Stripe retries the card. */
export const hasAccess = (b: Pick<Billing, 'status'>) => !!b.status && LIVE.includes(b.status);

export function planLabel(b: Pick<Billing, 'plan' | 'status'>): string {
  if (!hasAccess(b)) return 'No plan';
  if (b.status === 'lifetime') return 'Lifetime';
  const name = b.plan === 'annual' ? 'Annual' : b.plan === 'monthly' ? 'Monthly' : 'Pro';
  return b.status === 'trialing' ? `${name} · free trial` : name;
}
