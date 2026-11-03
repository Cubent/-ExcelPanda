import { createHash } from 'node:crypto';
import { META_PIXEL_ID } from './meta-pixel';

const GRAPH_VERSION = 'v21.0';

const sha256 = (value: string) =>
  createHash('sha256').update(value.trim().toLowerCase()).digest('hex');

type PurchaseInput = {
  /** Stripe invoice id: Meta uses it to drop duplicate deliveries. */
  eventId: string;
  eventTime: number;
  email?: string | null;
  clerkUserId?: string;
  value: number;
  currency: string;
};

// A real purchase happens when the trial ends and Stripe charges the card,
// days after the visitor left the site, so the browser pixel can never see it.
// This reports it server-side through the Conversions API. It needs a
// META_CAPI_ACCESS_TOKEN (Events Manager > Settings > Conversions API) and
// quietly does nothing until that is set.
export const sendMetaPurchase = async ({
  eventId,
  eventTime,
  email,
  clerkUserId,
  value,
  currency,
}: PurchaseInput) => {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) {
    console.warn('META_CAPI_ACCESS_TOKEN is not set: skipping Meta Purchase event');
    return;
  }

  const userData: Record<string, string[]> = {};
  if (email) userData.em = [sha256(email)];
  if (clerkUserId) userData.external_id = [sha256(clerkUserId)];

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            {
              event_name: 'Purchase',
              event_time: eventTime,
              event_id: eventId,
              action_source: 'website',
              event_source_url: 'https://www.excelpanda.org/',
              user_data: userData,
              custom_data: { value, currency: currency.toUpperCase() },
            },
          ],
        }),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) {
      console.error('Meta Conversions API error:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Meta Conversions API request failed:', error);
  }
};
