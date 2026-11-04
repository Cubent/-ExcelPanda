import Link from 'next/link';
import { HeaderAuth } from './header-auth';

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

// Floating pill header, shared by the homepage and the blog.
export const SiteHeader = () => (
  <header className="sticky top-4 z-50 mx-auto mt-4 w-[min(94%,900px)]">
    <div className="relative flex items-center justify-between rounded-full bg-[#1F4D3A] py-3 pl-6 pr-3">
      <SiteLogo light />
      <HeaderAuth />
    </div>
  </header>
);
