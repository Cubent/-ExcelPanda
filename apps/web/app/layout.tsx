import './[locale]/styles.css';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { MetaPixel } from '../components/meta-pixel';
import { UmamiAnalytics } from '../components/umami-analytics';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.excelpanda.com'),
  title: 'ExcelPanda – Master Excel, Hands On',
  description: 'ExcelPanda helps you master Excel hands on, with practical tutorials, real-world exercises and step-by-step guides.',
  keywords: ['ExcelPanda', 'Excel tutorials', 'learn Excel', 'Excel formulas', 'Excel hands on'],
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'ExcelPanda',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=3', sizes: 'any' },
      { url: '/favicon.png?v=3', type: 'image/png' },
      { url: '/favicon-16x16.png?v=3', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=3', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png?v=3', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png?v=3', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=3',
    apple: '/apple-touch-icon.png?v=3',
  },
  openGraph: {
    title: 'ExcelPanda – Master Excel, Hands On',
    description: 'ExcelPanda helps you master Excel hands on, with practical tutorials, real-world exercises and step-by-step guides.',
    type: 'website',
    locale: 'en_US',
    siteName: 'ExcelPanda',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExcelPanda – Master Excel, Hands On',
    description: 'ExcelPanda helps you master Excel hands on, with practical tutorials, real-world exercises and step-by-step guides.',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html className={cn(fonts, 'scroll-smooth')} suppressHydrationWarning>
      <body style={{ backgroundColor: '#ffffff' }}>
        <ClerkProvider
          appearance={{
            cssLayerName: 'clerk',
            variables: {
              colorPrimary: '#1F4D3A',
              colorPrimaryForeground: '#ffffff',
              colorBackground: '#F5F5F5',
              colorForeground: '#000000',
              colorNeutral: '#1F4D3A',
              colorInput: '#ffffff',
              colorInputForeground: '#000000',
              colorMutedForeground: '#4b5563',
            },
            elements: {
              // The OTP digit boxes (email verification code) don't pick up
              // colorInput the way regular text fields do — they render at
              // colorBackground instead, which is a light grey nearly
              // matching the card behind it. Force them white with a
              // visible border so the code is actually readable.
              otpCodeFieldInput: {
                backgroundColor: '#ffffff',
                borderColor: '#d1d5db',
                color: '#000000',
              },
            },
          }}
        >
          <MetaPixel />
          <UmamiAnalytics />
          <DesignSystemProvider>
            {children}
          </DesignSystemProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
