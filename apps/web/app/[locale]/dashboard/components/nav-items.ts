import {
  BookMarked,
  BookOpen,
  History,
  Home,
  RotateCcw,
  Target,
  TrendingUp,
  UserRound,
} from 'lucide-react';

// Shared by the desktop sidebar and the mobile menu so they never drift apart.
export const NAV_ITEMS = [
  { label: 'My Dashboard', href: '/dashboard', icon: Home },
  { label: 'Practice', href: '/dashboard/practice', icon: Target },
  { label: 'Review', href: '/dashboard/review', icon: RotateCcw },
  { label: 'Topics', href: '/dashboard/topics', icon: BookOpen },
  { label: 'Study Guide', href: '/dashboard/study-guide', icon: BookMarked },
  { label: 'Score Predictor', href: '/dashboard/predictor', icon: TrendingUp },
  { label: 'History', href: '/dashboard/history', icon: History },
  { label: 'Account', href: '/dashboard/account', icon: UserRound },
];

export const isActiveNavItem = (pathname: string, href: string) =>
  href === '/dashboard'
    ? pathname === '/dashboard' || pathname.endsWith('/dashboard')
    : pathname.includes(href) &&
      (pathname.length === pathname.indexOf(href) + href.length ||
        pathname[pathname.indexOf(href) + href.length] === '/');
