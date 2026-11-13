// Per-user limits for the AI tutor: a short burst window plus a daily cap.
// This is an in-memory limiter, so counts are kept per server instance and reset on restart or cold start.
// It stops a single user from hammering the API, but for hard guarantees on serverless, swap it for a shared store
// (e.g. Upstash Redis) behind the same `checkTutorLimit` function.

export const TUTOR_LIMITS = {
  /** Messages allowed per rolling minute. */
  perMinute: 6,
  /** Messages allowed per rolling 24 hours. */
  perDay: 40,
} as const;

const MINUTE = 60_000;
const DAY = 86_400_000;

const hits = new Map<string, number[]>();

type Result =
  | { ok: true; remainingToday: number }
  | { ok: false; reason: string; retryAfterSec: number; remainingToday: number };

export async function checkTutorLimit(userId: string): Promise<Result> {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < DAY);

  const lastMinute = recent.filter((t) => now - t < MINUTE);
  if (lastMinute.length >= TUTOR_LIMITS.perMinute) {
    hits.set(userId, recent);
    const retryAfterSec = Math.max(1, Math.ceil((lastMinute[0] + MINUTE - now) / 1000));
    return {
      ok: false,
      reason: `You are asking quickly. Try again in ${retryAfterSec}s.`,
      retryAfterSec,
      remainingToday: Math.max(0, TUTOR_LIMITS.perDay - recent.length),
    };
  }
  if (recent.length >= TUTOR_LIMITS.perDay) {
    hits.set(userId, recent);
    const retryAfterSec = Math.max(1, Math.ceil((recent[0] + DAY - now) / 1000));
    return {
      ok: false,
      reason: `You have used all ${TUTOR_LIMITS.perDay} tutor questions for today. Come back tomorrow!`,
      retryAfterSec,
      remainingToday: 0,
    };
  }

  recent.push(now);
  hits.set(userId, recent);

  // Keep the map from growing forever.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < DAY)) hits.delete(k);
  }
  return { ok: true, remainingToday: TUTOR_LIMITS.perDay - recent.length };
}
