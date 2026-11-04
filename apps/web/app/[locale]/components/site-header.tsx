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
      <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 text-base font-normal text-white">
        <Link href="/blog" className="rounded-full px-4 py-2 transition-colors hover:bg-white/10">
          Blog
        </Link>
        <Link href="/#paths" className="rounded-full px-4 py-2 transition-colors hover:bg-white/10">
          Lessons
        </Link>
      </nav>
      <HeaderAuth />
    </div>
  </header>
);
