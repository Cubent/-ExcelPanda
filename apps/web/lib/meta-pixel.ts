// Meta (Facebook) Pixel helpers. The pixel id is public (it ships in the page
// source), so it lives here rather than in env.
export const META_PIXEL_ID = '1434794705246816';

export type MetaEvent =
  | 'PageView'
  | 'CompleteRegistration'
  | 'InitiateCheckout'
  | 'StartTrial'
  | 'Purchase';

type Fbq = (
  command: 'init' | 'track' | 'trackCustom',
  eventOrId: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

/** Fire a browser pixel event. No-ops when the pixel is blocked or not loaded yet. */
export const trackMeta = (
  event: MetaEvent,
  params?: Record<string, unknown>,
  eventId?: string,
) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', event, params, eventId ? { eventID: eventId } : undefined);
};

export type MetaPlanId = 'monthly' | 'quarterly' | 'yearly';

// Price of each plan in USD, mirrored from the paywall.
export const META_PLAN_VALUE: Record<MetaPlanId, number> = {
  monthly: 80,
  quarterly: 130,
  yearly: 400,
};

export const META_PLAN_KEY = 'mp_meta_plan';

/** Runs fn at most once per browser for the given key. */
export const once = (key: string, fn: () => void) => {
  try {
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, '1');
  } catch {
    // Storage blocked: fall through and fire anyway.
  }
  fn();
};
