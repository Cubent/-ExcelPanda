import { env } from '@/env';
import { clerkMiddleware } from '@clerk/nextjs/server';
import { internationalizationMiddleware } from '@repo/internationalization/middleware';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import { type NextRequest, NextResponse } from 'next/server';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets and Posthog ingest
  // Include API routes that need authentication
  // Include API routes that need authentication
  matcher: [
    // Match all routes except those starting with a dot or within _next directory
    '/((?!.*\\..*|_next).*)',
    // Match the root route
    '/',
    // Match API routes that need authentication
    '/(api|trpc)(.*)',
    // Clerk's own auto-proxy path
    '/__clerk/:path*',
  ],
};

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

const isProtectedRoute = (pathname: string) =>
  pathname.includes('/onboarding') ||
  pathname.includes('/dashboard') ||
  pathname.includes('/paywall') ||
  pathname.includes('/checkout/success');

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Skip middleware for email API routes to prevent blocking external API calls
  if (request.nextUrl.pathname.includes('/api/models/application')) {
    return NextResponse.next();
  }

  // Gate onboarding and dashboard behind auth. This must run before the i18n
  // middleware below, since i18n may return a rewrite response (not just a
  // redirect) that would otherwise short-circuit this check entirely.
  if (isProtectedRoute(request.nextUrl.pathname)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Skip i18n middleware for API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    const i18nResponse = internationalizationMiddleware(request);
    if (i18nResponse) {
      return i18nResponse;
    }
  }

  // Skip Arcjet for now to reduce middleware size
  // TODO: Re-enable when middleware size limit is increased or Arcjet is optimized
  // if (!env.ARCJET_KEY) {
  return securityHeaders();
  // }

  // Arcjet security disabled to reduce middleware bundle size
  // try {
  //   const { secure } = await import('@repo/security');
  //   await secure(
  //     [
  //       // See https://docs.arcjet.com/bot-protection/identifying-bots
  //       'CATEGORY:SEARCH_ENGINE', // Allow search engines
  //       'CATEGORY:PREVIEW', // Allow preview links to show OG images
  //       'CATEGORY:MONITOR', // Allow uptime monitoring services
  //     ],
  //     request
  //   );
  //   return securityHeaders();
  // } catch (error) {
  //   const { parseError } = await import('@repo/observability/error');
  //   const message = parseError(error);
  //   return NextResponse.json({ error: message }, { status: 403 });
  // }
});
