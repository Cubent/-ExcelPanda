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

/** Free users get the first unit of this course. Everything else needs a subscription. */
export const FREE_COURSE_SLUG = 'excel-basics';
export const FREE_UNITS = 1;

/** Flags premium courses and units the user has not unlocked. Subscribers get nothing flagged. */
export function markLocked<T extends { slug: string; units: { locked?: boolean }[] }>(
  maps: T[],
  b: Pick<Billing, 'status'>,
): (T & { locked: boolean })[] {
  const paid = hasAccess(b);
  return maps.map((m) => {
    const course = !paid && m.slug !== FREE_COURSE_SLUG;
    const units = m.units.map((u, i) => ({ ...u, locked: !paid && (course || i >= FREE_UNITS) }));
    return { ...m, locked: course, units };
  });
}

export function planLabel(b: Pick<Billing, 'plan' | 'status'>): string {
  if (!hasAccess(b)) return 'Free plan';
  if (b.status === 'lifetime') return 'Lifetime';
  const name = b.plan === 'annual' ? 'Annual' : b.plan === 'monthly' ? 'Monthly' : 'Pro';
  return b.status === 'trialing' ? `${name} · free trial` : name;
}
