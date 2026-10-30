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

const PROTECTED = ['/dashboard', '/dashboard/predictor', '/onboarding/trial', '/paywall', '/checkout/success'];

describe('auth gate in middleware', () => {
  beforeEach(() => {
    vi.resetModules();
    authMock.mockResolvedValue({ userId: null });
  });
  afterEach(() => vi.unstubAllEnvs());

  it.each(PROTECTED)('redirects a signed-out visitor from %s to sign-in', async (path) => {
    const res = await run(path);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/sign-in');
  });

  it('lets a signed-in user through', async () => {
    authMock.mockResolvedValue({ userId: 'user_1' });
    expect((await run('/dashboard/predictor')).status).toBe(200);
  });

  it('does not gate public pages', async () => {
    expect((await run('/blog')).status).toBe(200);
  });

  it.each(['development', 'production', 'test'])(
    'ignores any leftover debug variable: still redirects in %s',
    async (env) => {
      vi.stubEnv('NODE_ENV', env);
      vi.stubEnv('DASHBOARD_DEBUG_BYPASS', '1');
      for (const path of PROTECTED) {
        expect((await run(path)).status).toBe(307);
      }
    }
  );
});
