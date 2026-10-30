import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const findPreference = vi.fn();
const getSubscription = vi.fn();
const resolveAccess = vi.fn();
const redirectMock = vi.fn((url: string) => {
  // Next's redirect() throws to abort rendering.
  throw new Error(`REDIRECT:${url}`);
});

vi.mock('@clerk/nextjs/server', () => ({ auth: () => authMock() }));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
  usePathname: () => '/dashboard',
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('next/server', () => ({ after: vi.fn() }));
vi.mock('@repo/database', () => ({
  database: {
    userPreference: { findUnique: (a: unknown) => findPreference(a) },
    userQuestionAttempt: { findFirst: vi.fn().mockResolvedValue({ id: 'x' }) },
  },
}));
vi.mock('@/lib/prepare-practice-set', () => ({ prepareNextSet: vi.fn() }));
vi.mock('@/lib/subscription', () => ({
  getSubscription: (...a: unknown[]) => getSubscription(...a),
  resolveAccess: (...a: unknown[]) => resolveAccess(...a),
  getPaymentIssue: vi.fn().mockResolvedValue(null),
}));
vi.mock('@repo/database/qbank', () => ({
  getOverviewStats: vi.fn().mockResolvedValue({
    questionsAnswered: 3,
    setsCompleted: 1,
    reviewsAnswered: 0,
    setsProgress: 1,
    reviewsProgress: 0,
    studyGuideUnlocked: false,
  }),
  getStudyGuideEntries: vi.fn().mockResolvedValue([]),
  SETS_TO_UNLOCK_STUDY_GUIDE: 3,
  REVIEWS_TO_UNLOCK_STUDY_GUIDE: 1,
}));
// Replace heavy children with markers so we can see which branch rendered.
vi.mock('../app/[locale]/dashboard/components/dashboard-shell', () => ({
  DashboardShell: ({ children }: { children: React.ReactNode }) => <main>SHELL{children}</main>,
}));
vi.mock('../app/[locale]/dashboard/components/practice-locked', () => ({ PracticeLocked: () => <p>LOCKED</p> }));
vi.mock('../app/[locale]/dashboard/practice/components/question-player', () => ({ QuestionPlayer: () => <p>PLAYER</p> }));
vi.mock('../app/[locale]/dashboard/components/next-exam-advantage-card', () => ({ NextExamAdvantageCard: () => null }));

/** A leftover variable from the removed debug bypass must have no effect, in any environment. */
const withStrayBypassVar = (env: 'development' | 'production') => {
  vi.stubEnv('NODE_ENV', env);
  vi.stubEnv('DASHBOARD_DEBUG_BYPASS', '1');
};

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ userId: 'user_1' });
  findPreference.mockResolvedValue({ exam: 'STEP_2_CK', examSelectedAt: new Date(), focusSystemIds: [] });
  getSubscription.mockResolvedValue(null); // a signed-in user with no subscription
  resolveAccess.mockResolvedValue({ allowed: false, issue: null });
});
afterEach(() => vi.unstubAllEnvs());

describe('dashboard layout gates', () => {
  const runLayout = async () => {
    const { default: Layout } = await import('../app/[locale]/dashboard/layout');
    return renderToStaticMarkup(await Layout({ children: <p>CHILD</p> }));
  };

  it('sends a signed-in user with no subscription to the paywall', async () => {
    await expect(runLayout()).rejects.toThrow('REDIRECT:/paywall');
  });

  it('sends a signed-in user with no exam chosen to onboarding', async () => {
    findPreference.mockResolvedValue(null);
    await expect(runLayout()).rejects.toThrow('REDIRECT:/onboarding/trial');
  });

  it('lets a subscribed user with an exam through', async () => {
    getSubscription.mockResolvedValue({ status: 'active', stripeSubscriptionId: 'sub_1' });
    expect(await runLayout()).toContain('CHILD');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it.each(['development', 'production'] as const)('ignores a stray debug variable in %s', async (env) => {
    withStrayBypassVar(env);
    await expect(runLayout()).rejects.toThrow('REDIRECT:/paywall');
    findPreference.mockResolvedValue(null);
    await expect(runLayout()).rejects.toThrow('REDIRECT:/onboarding/trial');
  });
});

describe('practice page lock', () => {
  const runPractice = async (searchParams: { preview?: string } = {}) => {
    const { default: Page } = await import('../app/[locale]/dashboard/practice/page');
    return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(searchParams) }));
  };

  it('shows the locked state without access', async () => {
    expect(await runPractice()).toContain('LOCKED');
  });

  it('shows the question player with access', async () => {
    resolveAccess.mockResolvedValue({ allowed: true, issue: null });
    const html = await runPractice();
    expect(html).toContain('PLAYER');
    expect(html).not.toContain('LOCKED');
  });

  it.each(['development', 'production'] as const)('stays locked with a stray debug variable in %s', async (env) => {
    withStrayBypassVar(env);
    expect(await runPractice()).toContain('LOCKED');
  });
});

describe('overview page lock', () => {
  const runOverview = async () => {
    const { DashboardOverview } = await import('../app/[locale]/dashboard/components/dashboard-overview');
    return renderToStaticMarkup(await DashboardOverview({}));
  };

  it('shows the locked block without access', async () => {
    expect(await runOverview()).toContain('LOCKED');
  });

  it('hides the locked block with access', async () => {
    resolveAccess.mockResolvedValue({ allowed: true, issue: null });
    const html = await runOverview();
    expect(html).not.toContain('LOCKED');
    expect(html).toContain('Overview');
  });

  it.each(['development', 'production'] as const)('stays locked with a stray debug variable in %s', async (env) => {
    withStrayBypassVar(env);
    expect(await runOverview()).toContain('LOCKED');
  });
});
