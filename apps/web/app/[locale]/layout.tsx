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
  metadataBase: new URL('https://www.excelpanda.org'),
  title: 'ExcelPanda: Learn Excel Hands On, Formulas to VBA',
  description: 'Learn Excel by doing. Short interactive lessons on formulas, lookups, pivot tables, Power Query, DAX, finance modelling and VBA, in your browser with nothing to install.',
  keywords: ['learn Excel online', 'Excel tutorials', 'Excel formulas', 'Excel pivot tables', 'Excel VBA tutorial', 'Power Query', 'Excel for finance', 'interactive Excel lessons', 'ExcelPanda'],
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
    title: 'ExcelPanda: Learn Excel Hands On, Formulas to VBA',
    description: 'Learn Excel by doing. Short interactive lessons on formulas, lookups, pivot tables, Power Query, DAX, finance modelling and VBA, in your browser with nothing to install.',
    url: 'https://www.excelpanda.org',
    siteName: 'ExcelPanda',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ExcelPanda: Learn Excel Hands On, Formulas to VBA',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExcelPanda: Learn Excel Hands On, Formulas to VBA',
    description: 'Learn Excel by doing. Short interactive lessons on formulas, lookups, pivot tables, Power Query, DAX, finance modelling and VBA, in your browser with nothing to install.',
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
            "alternateName": "ExcelPanda",
            "description": "Learn Excel by doing. Short interactive lessons on formulas, lookups, pivot tables, Power Query, DAX, finance modelling and VBA, in your browser with nothing to install.",
            "url": "https://www.excelpanda.org",
            "logo": "https://www.excelpanda.org/favicon.png",
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
