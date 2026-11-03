import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { LegalPage } from '../legal-page';

export const metadata: Metadata = createMetadata({
  title: 'Privacy Policy',
  description: 'How ExcelPanda collects, uses and protects your information.',
  path: '/legal/privacy',
});

const sections = [
  {
    title: 'Information we collect',
    body: (
      <>
        <p>We collect only what we need to run ExcelPanda.</p>
        <ul>
          <li>Account details, such as your name, email address and sign-in method.</li>
          <li>Learning data, such as your goals, lessons completed, XP, streaks and settings.</li>
          <li>Usage and device data, such as pages visited, browser type and approximate location.</li>
        </ul>
        <p>The spreadsheets you work in during lessons stay in your browser and are not uploaded.</p>
      </>
    ),
  },
  {
    title: 'How we use it',
    body: (
      <ul>
        <li>To provide the lessons and save your progress.</li>
        <li>To keep the service secure and prevent abuse.</li>
        <li>To understand how ExcelPanda is used so we can improve it.</li>
        <li>To send messages about your account when needed.</li>
      </ul>
    ),
  },
  {
    title: 'Cookies and analytics',
    body: (
      <p>
        We use cookies and similar storage to keep you signed in, remember your preferences and measure usage. You can block
        cookies in your browser settings, though some parts of the service may then stop working.
      </p>
    ),
  },
  {
    title: 'Service providers',
    body: (
      <p>
        We use trusted providers to host the service, handle sign-in, store data and measure usage. They process information only
        on our behalf. We do not sell your personal information.
      </p>
    ),
  },
  {
    title: 'Data retention',
    body: <p>We keep your information while your account is active and delete it when you ask us to, unless the law requires otherwise.</p>,
  },
  {
    title: 'Your rights',
    body: <p>You can ask to access, correct, export or delete your personal information. Depending on where you live, you may have further rights under local law.</p>,
  },
  {
    title: 'Children',
    body: <p>ExcelPanda is not directed at children under 13, and we do not knowingly collect their information.</p>,
  },
  {
    title: 'Changes to this policy',
    body: <p>We may update this policy from time to time. The date at the top shows when it last changed.</p>,
  },
] as const;

const PrivacyPage = () => (
  <LegalPage
    title="Privacy Policy"
    updated="3 November 2026"
    intro="This policy explains what information ExcelPanda collects, how we use it and the choices you have."
    sections={sections}
  />
);

export default PrivacyPage;
