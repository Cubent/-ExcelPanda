import 'server-only';
import { redirect } from 'next/navigation';
import { getProfile } from '@/app/[locale]/(app)/get-profile';
import { hasAccess } from './subscription';

/**
 * Locks lessons and practice behind a subscription. Off until PAYWALL_ENFORCED=true,
 * so nothing is blocked while payments are still being tested.
 */
export async function requireAccess() {
  const profile = await getProfile();
  if (process.env.PAYWALL_ENFORCED !== 'true') return profile;
  if (!hasAccess({ status: profile.billing.status })) redirect('/subscribe');
  return profile;
}
