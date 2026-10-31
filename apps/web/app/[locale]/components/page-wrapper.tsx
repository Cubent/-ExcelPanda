import type { ReactNode } from 'react';

export function PageWrapper({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#FBFCF7]">{children}</div>;
}
