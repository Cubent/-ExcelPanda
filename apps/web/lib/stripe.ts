import 'server-only';
import Stripe from 'stripe';

let client: Stripe | null = null;
export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  client ??= new Stripe(key);
  return client;
}

export type PlanId = 'annual' | 'annual_offer' | 'monthly' | 'lifetime';
export const TRIAL_DAYS = 7;

export const PLAN_PRICE: Record<PlanId, string | undefined> = {
  annual: process.env.STRIPE_PRICE_ANNUAL,
  annual_offer: process.env.STRIPE_PRICE_ANNUAL_OFFER,
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  lifetime: process.env.STRIPE_PRICE_LIFETIME,
};

export const isPlan = (v: unknown): v is PlanId => v === 'annual' || v === 'annual_offer' || v === 'monthly' || v === 'lifetime';

export function planFromPriceId(id: string | undefined | null): PlanId | null {
  if (!id) return null;
  const hit = (Object.keys(PLAN_PRICE) as PlanId[]).find((p) => PLAN_PRICE[p] === id) ?? null;
  // The limited offer is still the yearly plan, just cheaper.
  return hit === 'annual_offer' ? 'annual' : hit;
}
