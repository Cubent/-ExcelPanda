import { hasAccess, planLabel } from '@/lib/subscription';
import { ManageSubscriptionButton, PlanPicker } from '../billing-actions';
import { getProfile } from '../get-profile';
import { Card, Page, PageHeader } from '../ui';

export const metadata = { title: 'Choose a plan – ExcelPanda' };

export default async function SubscribePage() {
  const { billing } = await getProfile();
  const active = hasAccess(billing);

  return (
    <Page max={560}>
      <PageHeader
        title={active ? 'You’re all set' : 'Choose your plan'}
        subtitle={active ? `Your plan: ${planLabel(billing)}.` : 'Every course, drill and challenge. Start with 7 days free.'}
      />
      <Card>
        {active ? (
          <div>
            <p className="text-[15px] text-[#1F4D3A]/70">You already have full access. You can change or cancel your plan any time.</p>
            <ManageSubscriptionButton className="mt-5" />
          </div>
        ) : (
          <PlanPicker />
        )}
      </Card>
    </Page>
  );
}
