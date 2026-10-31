// Main layout component for the ExcelPanda website
import './styles.css';
import { AnalyticsProvider } from '@repo/analytics';

import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { getDictionary } from '@repo/internationalization';
import type { ReactNode } from 'react';
import { PageWrapper } from './components/page-wrapper';
import { PerformanceOptimizer } from '../../components/performance-optimizer';
import { PerformanceHints } from '../../components/seo-optimizer';
import { ErrorBoundary, ConsoleErrorSuppressor } from '../../components/error-boundary';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.excelpanda.com'),
  title: 'ExcelPanda – Master Excel, Hands On',
  description: 'ExcelPanda helps you master Excel hands on, with practical tutorials, real-world exercises and step-by-step guides.',
  keywords: ['ExcelPanda', 'Excel tutorials', 'learn Excel', 'Excel formulas', 'Excel hands on'],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'ExcelPanda – Master Excel, Hands On',
    description: 'ExcelPanda helps you master Excel hands on, with practical tutorials, real-world exercises and step-by-step guides.',
    url: 'https://www.excelpanda.com',
    siteName: 'ExcelPanda',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ExcelPanda – Master Excel, Hands On',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExcelPanda – Master Excel, Hands On',
    description: 'ExcelPanda helps you master Excel hands on, with practical tutorials, real-world exercises and step-by-step guides.',
    images: ['/og-image.png'],
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
};

type RootLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{
    locale: string;
  }>;
};

const RootLayout = async ({ children, params }: RootLayoutProperties) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <>
      <ConsoleErrorSuppressor />
      <PerformanceHints />
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "ExcelPanda",
            "alternateName": "ExcelPanda – Master Excel, Hands On",
            "description": "ExcelPanda helps you master Excel hands on, with practical tutorials, real-world exercises and step-by-step guides.",
            "url": "https://www.excelpanda.com",
            "logo": "https://www.excelpanda.com/favicon.png",
          })
        }}
      />
      <ErrorBoundary>
        <AnalyticsProvider>
          <PerformanceOptimizer />
          <PageWrapper>
            {children}
          </PageWrapper>
          <Toolbar />
        </AnalyticsProvider>
      </ErrorBoundary>
    </>
  );
};

export default RootLayout;
