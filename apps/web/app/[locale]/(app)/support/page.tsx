import { Page, PageHeader } from '../ui';
import { SupportForm } from './support-form';

export const metadata = { title: 'Support – ExcelPanda' };

export default function SupportPage() {
  return (
    <Page max={720}>
      <PageHeader title="Support" subtitle="Stuck, found a bug or have an idea? Send us a message." />
      <SupportForm />
    </Page>
  );
}
