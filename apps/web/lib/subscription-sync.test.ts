import { beforeEach, describe, expect, it, vi } from 'vitest';

type Row = {
  clerkUserId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  priceId: string;
  currentPeriodEnd: Date;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

// An in-memory stand-in for the Subscription table that enforces the SAME unique
// constraints as the real one (clerkUserId and stripeSubscriptionId), so any code
// that tries to insert a second row for a user fails here exactly as it does in Postgres.
let rows: Row[] = [];
const uniqueViolation = () => Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });

vi.mock('@repo/database', () => ({
  database: {
    subscription: {
      findFirst: async ({ where }: { where: { stripeCustomerId: string } }) =>
        rows.find((r) => r.stripeCustomerId === where.stripeCustomerId) ?? null,
      findUnique: async ({ where }: { where: { clerkUserId: string } }) =>
        rows.find((r) => r.clerkUserId === where.clerkUserId) ?? null,
      create: async ({ data }: { data: Row }) => {
        if (rows.some((r) => r.clerkUserId === data.clerkUserId || r.stripeSubscriptionId === data.stripeSubscriptionId)) {
          throw uniqueViolation();
        }
        rows.push({ ...data });
        return data;
      },
      update: async ({ where, data }: { where: { clerkUserId: string }; data: Partial<Row> }) => {
        const row = rows.find((r) => r.clerkUserId === where.clerkUserId)!;
        Object.assign(row, data);
        return row;
      },
      updateMany: async ({ where, data }: { where: { clerkUserId: string; stripeSubscriptionId: string }; data: Partial<Row> }) => {
        const row = rows.find((r) => r.clerkUserId === where.clerkUserId && r.stripeSubscriptionId === where.stripeSubscriptionId);
        if (!row) return { count: 0 };
        Object.assign(row, data);
        return { count: 1 };
      },
    },
  },
}));

const now = Math.floor(Date.now() / 1000);
const sub = (id: string, status: string, metadata: Record<string, string> = { clerkUserId: 'user_a' }, customer = 'cus_a') =>
  ({
    id,
    status,
    metadata,
    customer,
    items: { data: [{ price: { id: 'price_monthly' }, current_period_end: now + 30 * 86_400 }] },
    trial_end: now + 30 * 86_400,
    cancel_at_period_end: false,
  }) as never;

const summary = () => rows.map((r) => `${r.clerkUserId}:${r.stripeSubscriptionId}:${r.status}`);

describe('syncSubscription', () => {
  beforeEach(() => {
    rows = [];
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('creates a row for a new subscription and updates it as Stripe sends changes', async () => {
    const { syncSubscription } = await import('./subscription-sync');
    expect(await syncSubscription(sub('sub_1', 'trialing'))).toBe('synced');
    expect(await syncSubscription(sub('sub_1', 'active'))).toBe('synced');
    expect(summary()).toEqual(['user_a:sub_1:active']);
  });

  it('RETURNING CUSTOMER: a new subscription after a cancellation re-points the row instead of failing', async () => {
    const { syncSubscription } = await import('./subscription-sync');
    await syncSubscription(sub('sub_old', 'trialing'));
    await syncSubscription(sub('sub_old', 'canceled'));
    await expect(syncSubscription(sub('sub_new', 'trialing'))).resolves.toBe('replaced_previous');
    expect(summary()).toEqual(['user_a:sub_new:trialing']);
  });

  it('ignores a late event for an older subscription so it cannot lock out a live one', async () => {
    const { syncSubscription } = await import('./subscription-sync');
    await syncSubscription(sub('sub_old', 'canceled'));
    await syncSubscription(sub('sub_new', 'active'));
    expect(await syncSubscription(sub('sub_old', 'canceled'))).toBe('ignored_stale');
    expect(summary()).toEqual(['user_a:sub_new:active']);
  });

  it('lets a live subscription replace another live one (the newest event wins)', async () => {
    const { syncSubscription } = await import('./subscription-sync');
    await syncSubscription(sub('sub_1', 'active'));
    expect(await syncSubscription(sub('sub_2', 'trialing'))).toBe('replaced_previous');
    expect(summary()).toEqual(['user_a:sub_2:trialing']);
  });

  it('counts past_due as live, so a stale cancellation cannot override it', async () => {
    const { syncSubscription } = await import('./subscription-sync');
    await syncSubscription(sub('sub_new', 'past_due'));
    expect(await syncSubscription(sub('sub_old', 'canceled'))).toBe('ignored_stale');
    expect(summary()).toEqual(['user_a:sub_new:past_due']);
  });

  it('attributes a hand-made subscription with no metadata to the user who owns that Stripe customer', async () => {
    const { syncSubscription } = await import('./subscription-sync');
    await syncSubscription(sub('sub_old', 'canceled', { clerkUserId: 'user_a' }, 'cus_a'));
    expect(await syncSubscription(sub('sub_manual', 'trialing', {}, 'cus_a'))).toBe('replaced_previous');
    expect(summary()).toEqual(['user_a:sub_manual:trialing']);
  });

  it('reports, rather than guesses, a subscription it cannot attribute to anyone', async () => {
    const { syncSubscription } = await import('./subscription-sync');
    expect(await syncSubscription(sub('sub_x', 'trialing', {}, 'cus_unknown'))).toBe('unattributed');
    expect(rows).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('clerkUserId'));
  });

  it('keeps users separate', async () => {
    const { syncSubscription } = await import('./subscription-sync');
    await syncSubscription(sub('sub_a', 'active', { clerkUserId: 'user_a' }, 'cus_a'));
    await syncSubscription(sub('sub_b', 'trialing', { clerkUserId: 'user_b' }, 'cus_b'));
    await syncSubscription(sub('sub_b2', 'canceled', { clerkUserId: 'user_b' }, 'cus_b'));
    expect(summary().sort()).toEqual(['user_a:sub_a:active', 'user_b:sub_b:trialing']);
  });
});
