import { beforeEach, describe, expect, it, vi } from 'vitest';

const syncSubscription = vi.fn();
const constructEvent = vi.fn();

vi.mock('stripe', () => ({
  default: class {
    webhooks = { constructEvent: (...a: unknown[]) => constructEvent(...a) };
    subscriptions = { retrieve: vi.fn() };
    billingPortal = { sessions: { create: vi.fn() } };
  },
}));
vi.mock('./subscription-sync', () => ({ syncSubscription: (...a: unknown[]) => syncSubscription(...a) }));
vi.mock('./ga4-measurement-protocol', () => ({ sendGA4Purchase: vi.fn() }));
vi.mock('./meta-capi', () => ({ sendMetaPurchase: vi.fn() }));
vi.mock('./payment-failed-email', () => ({ sendPaymentFailedEmail: vi.fn() }));
vi.mock('./subscription', () => ({ buildPaymentIssue: vi.fn() }));

const post = (headers: Record<string, string> = { 'stripe-signature': 'sig' }) =>
  new Request('http://localhost/api/webhooks/stripe', { method: 'POST', body: '{}', headers });

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_x');
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_x');
  });

  it.each(['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'])(
    'syncs the subscription on %s',
    async (type) => {
      const object = { id: 'sub_1' };
      constructEvent.mockReturnValue({ type, data: { object } });
      const { POST } = await import('../app/api/webhooks/stripe/route');
      expect((await POST(post())).status).toBe(200);
      expect(syncSubscription).toHaveBeenCalledWith(object);
    }
  );

  it('does not sync unrelated events', async () => {
    constructEvent.mockReturnValue({ type: 'customer.created', data: { object: {} } });
    const { POST } = await import('../app/api/webhooks/stripe/route');
    expect((await POST(post())).status).toBe(200);
    expect(syncSubscription).not.toHaveBeenCalled();
  });

  it('rejects a missing or invalid signature without syncing anything', async () => {
    const { POST } = await import('../app/api/webhooks/stripe/route');
    expect((await POST(post({}))).status).toBe(400);
    constructEvent.mockImplementation(() => {
      throw new Error('bad signature');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await POST(post())).status).toBe(400);
    expect(syncSubscription).not.toHaveBeenCalled();
  });

  it('lets a sync failure surface as an error so Stripe retries, instead of acknowledging it', async () => {
    constructEvent.mockReturnValue({ type: 'customer.subscription.created', data: { object: { id: 'sub_1' } } });
    syncSubscription.mockRejectedValue(new Error('db down'));
    const { POST } = await import('../app/api/webhooks/stripe/route');
    await expect(POST(post())).rejects.toThrow('db down');
  });
});
