'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import type { ReactNode } from 'react';

// "Start free": opens Clerk's sign-in modal for visitors; signed-in users go
// straight to the dashboard (which routes to /onboarding if not finished).
export function StartFreeButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Link href="/continue" className={className}>
        {children}
      </Link>
    );
  }

  return (
    <Link href="/sign-in" className={className}>
      {children}
    </Link>
  );
}
