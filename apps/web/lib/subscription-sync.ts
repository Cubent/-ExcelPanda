import { database } from '@repo/database';
import type Stripe from 'stripe';
import { hasAccess } from './subscription';

export type SyncResult =
  /** Stored or updated the row for this subscription. */
  | 'synced'
  /** The user already had a row for a different (older) subscription; it now points at this one. */
  | 'replaced_previous'
  /** A late event for an older subscription that must not overwrite a live one. */
  | 'ignored_stale'
  /** Could not tell which user this subscription belongs to. */
  | 'unattributed';

const MAX_ATTEMPTS = 3;

const isUniqueViolation = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'P2002';

/**
 * Mirrors one Stripe subscription into the Subscription table. This is the ONLY
 * writer of that table (see app/api/webhooks/stripe/route.ts).
 *
 * The table holds one row per user (clerkUserId is unique), so a user who
 * subscribes again after cancelling has an existing row for an OLD Stripe
 * subscription. Inserting a second row would violate that constraint and the
 * webhook would fail forever, leaving them locked out while they pay. Instead
 * the row is re-pointed at the new subscription, unless the event is a late one
 * for an older, dead subscription arriving after a live one (Stripe does not
 * guarantee ordering), in which case it is ignored.
 *
 * Subscriptions created by hand in the Stripe dashboard have no clerkUserId
 * metadata. If the Stripe customer already belongs to a user (from an earlier
 * checkout) we attribute it to them; otherwise it cannot be attributed and is
 * logged, and the fix is to add a `clerkUserId` metadata key in Stripe.
 */
export async function syncSubscription(subscription: Stripe.Subscription): Promise<SyncResult> {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  let clerkUserId: string | undefined = subscription.metadata?.clerkUserId;
  if (!clerkUserId) {
    const known = await database.subscription.findFirst({
      where: { stripeCustomerId: customerId },
      select: { clerkUserId: true },
    });
    clerkUserId = known?.clerkUserId;
  }
  if (!clerkUserId) {
    console.error(
      `Stripe subscription ${subscription.id} has no clerkUserId metadata and its customer ${customerId} is not linked to a user. Add a "clerkUserId" metadata key to the subscription in Stripe.`
    );
    return 'unattributed';
  }

  const userId: string = clerkUserId;

  const data = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0]?.price.id ?? '',
    currentPeriodEnd: new Date(subscription.items.data[0]!.current_period_end * 1000),
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  // Re-read and retry if another webhook delivery changes the row underneath us.
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const existing = await database.subscription.findUnique({ where: { clerkUserId: userId } });

    if (!existing) {
      try {
        await database.subscription.create({ data: { clerkUserId: userId, ...data } });
        return 'synced';
      } catch (error) {
        if (isUniqueViolation(error)) continue;
        throw error;
      }
    }

    if (existing.stripeSubscriptionId === subscription.id) {
      await database.subscription.update({ where: { clerkUserId: userId }, data });
      return 'synced';
    }

    // A different subscription for a user who already has a row.
    const incomingIsLive = hasAccess({ status: subscription.status });
    const storedIsLive = hasAccess(existing);
    if (incomingIsLive || !storedIsLive) {
      const { count } = await database.subscription.updateMany({
        where: { clerkUserId: userId, stripeSubscriptionId: existing.stripeSubscriptionId },
        data,
      });
      if (count === 1) return 'replaced_previous';
      continue;
    }
    return 'ignored_stale';
  }

  throw new Error(`Could not sync Stripe subscription ${subscription.id} after ${MAX_ATTEMPTS} attempts`);
}
