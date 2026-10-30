import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();

// Run the real middleware logic with its heavy collaborators stubbed out.
vi.mock('@/env', () => ({ env: { FLAGS_SECRET: undefined } }));
vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: (handler: (auth: () => unknown, req: unknown) => unknown) => (req: unknown) => handler(() => authMock(), req),
}));
vi.mock('@repo/internationalization/middleware', () => ({ internationalizationMiddleware: () => undefined }));
vi.mock('@repo/security/middleware', async () => {
  const { NextResponse } = await import('next/server');
  return {
    noseconeMiddleware: () => () => NextResponse.next(),
    noseconeOptions: {},
    noseconeOptionsWithToolbar: {},
  };
});

const run = async (path: string) => {
  const { NextRequest } = await import('next/server');
  const { default: middleware } = await import('../middleware');
  return (middleware as unknown as (r: unknown) => Promise<Response>)(new NextRequest(`http://localhost${path}`));
};

describe('dashboard auth gate in middleware', () => {
  beforeEach(() => {
    vi.resetModules();
    authMock.mockResolvedValue({ userId: null });
  });
  afterEach(() => vi.unstubAllEnvs());

  it('redirects a signed-out visitor away from /dashboard (normal behaviour)', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    const res = await run('/dashboard/predictor');
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/sign-in');
  });

  it('STILL redirects in production even if the bypass variable is set', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DASHBOARD_DEBUG_BYPASS', '1');
    const res = await run('/dashboard/predictor');
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/sign-in');
  });

  it('protects onboarding and paywall too when the bypass is off', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DASHBOARD_DEBUG_BYPASS', '1');
    for (const path of ['/onboarding/trial', '/paywall', '/checkout/success']) {
      expect((await run(path)).status).toBe(307);
    }
  });

  it('lets a signed-out visitor through only in local development with the flag', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DASHBOARD_DEBUG_BYPASS', '1');
    const res = await run('/dashboard/predictor');
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });
});
