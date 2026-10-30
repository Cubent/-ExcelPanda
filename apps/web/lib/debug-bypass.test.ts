import { afterEach, describe, expect, it, vi } from 'vitest';
import { debugBypass } from './debug-bypass';

afterEach(() => vi.unstubAllEnvs());

describe('debugBypass', () => {
  it('is on only in development WITH the explicit opt-in flag', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DASHBOARD_DEBUG_BYPASS', '1');
    expect(debugBypass()).toBe(true);
  });

  it('is off in development without the flag', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DASHBOARD_DEBUG_BYPASS', '');
    expect(debugBypass()).toBe(false);
  });

  it.each(['true', 'yes', '0', ' 1', 'on'])('only the exact value "1" counts (not %j)', (value) => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DASHBOARD_DEBUG_BYPASS', value);
    expect(debugBypass()).toBe(false);
  });

  it.each(['production', 'test', 'preview'])('is OFF when NODE_ENV is %s, even with the flag set', (env) => {
    vi.stubEnv('NODE_ENV', env);
    vi.stubEnv('DASHBOARD_DEBUG_BYPASS', '1');
    expect(debugBypass()).toBe(false);
  });
});
