import Link from 'next/link';
import { HeaderAuth } from './header-auth';
import { HeaderShell } from './header-shell';

export const SiteLogo = ({ className = '', light = false }: { className?: string; light?: boolean }) => (
  <Link href="/" className={`flex items-center gap-2 ${className}`}>
    <img
      src="/animateos-logo (4).png"
      alt="ExcelPanda logo"
      className="size-10 rounded-xl object-cover"
    />
    <span className={`text-lg font-semibold tracking-tight ${light ? 'text-white' : 'text-[#1F4D3A]'}`}>ExcelPanda</span>
  </Link>
);

// Floating pill header, shared by the homepage, the blog and the legal pages.
export const SiteHeader = () => (
  <HeaderShell>
    <SiteLogo light />
    <HeaderAuth />
  </HeaderShell>
);
