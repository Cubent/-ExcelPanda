import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { LegalPage } from '../legal-page';

export const metadata: Metadata = createMetadata({
  title: 'Terms of Service',
  description: 'The terms that apply when you use ExcelPanda.',
  path: '/legal/terms',
});

const sections = [
  {
    title: 'Agreement',
    body: <p>By creating an account or using ExcelPanda, you agree to these terms. If you do not agree, please do not use the service.</p>,
  },
  {
    title: 'Your account',
    body: <p>Keep your sign-in details secure and give us accurate information. You are responsible for activity on your account.</p>,
  },
  {
    title: 'Acceptable use',
    body: (
      <ul>
        <li>Use ExcelPanda for your own learning and in line with the law.</li>
        <li>Do not copy, resell or scrape the lessons or content.</li>
        <li>Do not interfere with the service, test its security or attempt to access other users’ data.</li>
      </ul>
    ),
  },
  {
    title: 'Our content',
    body: <p>The lessons, design, code and branding belong to ExcelPanda and are licensed to you for personal, non-commercial use while you have an account.</p>,
  },
  {
    title: 'Free and paid features',
    body: <p>Some features are free today. We may introduce paid plans in future and will tell you before anything you use becomes paid.</p>,
  },
  {
    title: 'Disclaimer',
    body: <p>ExcelPanda is provided as is, without warranties of any kind. We aim for accurate lessons but cannot guarantee that the service will be uninterrupted or error free. ExcelPanda is not affiliated with or endorsed by Microsoft.</p>,
  },
  {
    title: 'Limitation of liability',
    body: <p>To the extent the law allows, ExcelPanda is not liable for indirect or consequential losses arising from your use of the service.</p>,
  },
  {
    title: 'Ending your account',
    body: <p>You can stop using ExcelPanda at any time. We may suspend or close accounts that break these terms.</p>,
  },
  {
    title: 'Changes to these terms',
    body: <p>We may update these terms. If you keep using the service after a change, you accept the updated terms.</p>,
  },
] as const;

const TermsPage = () => (
  <LegalPage
    title="Terms of Service"
    updated="3 November 2026"
    intro="These terms set out the rules for using ExcelPanda."
    sections={sections}
  />
);

export default TermsPage;
