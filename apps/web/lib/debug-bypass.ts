/**
 * LOCAL DEBUGGING ONLY. Lets you open /dashboard pages without signing in and
 * renders the Score Predictor from mock data (see score-predictor.mock.ts).
 *
 * Doubly guarded so it cannot be switched on in a deployed build: it requires
 * NODE_ENV to be exactly "development" (which `next build`/`next start` and
 * every Vercel deployment are not) AND an explicit opt-in env var. To use it:
 *
 *   DASHBOARD_DEBUG_BYPASS=1 pnpm --filter web dev
 *
 * Remove this file, its use in middleware.ts and the mock branch in
 * dashboard/predictor/page.tsx before shipping if you do not want them in the repo.
 */
export const debugBypass = () =>
  process.env.NODE_ENV === 'development' && process.env.DASHBOARD_DEBUG_BYPASS === '1';
