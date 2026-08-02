'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  DollarSign,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';

const navItems = [
  { key: 'overview', icon: LayoutDashboard, href: '/interviewer/dashboard' },
  { key: 'upcoming', icon: CalendarDays, href: '/interviewer/dashboard/upcoming' },
  { key: 'calendar', icon: Calendar, href: '/interviewer/dashboard/calendar' },
  { key: 'earnings', icon: DollarSign, href: '/interviewer/dashboard/earnings' },
  { key: 'reviews', icon: Star, href: '/interviewer/dashboard/reviews' },
  { key: 'settings', icon: Settings, href: '/interviewer/dashboard/settings' },
  { key: 'help', icon: HelpCircle, href: '/interviewer/dashboard/help' },
] as const;

function SidebarNav({
  pathname,
  locale,
  t,
  onNavigate,
}: {
  pathname: string;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map((item) => {
        const fullPath = `/${locale}${item.href}`;
        const isActive =
          item.href === '/interviewer/dashboard'
            ? pathname === fullPath
            : pathname.startsWith(fullPath);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl border-s-2 px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? 'border-s-gold text-gold bg-gold/10'
                : 'border-s-transparent text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={20} strokeWidth={1.75} />
            <span>{t(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBottom({
  t,
  tc,
}: {
  t: ReturnType<typeof useTranslations>;
  tc: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="mt-auto border-t border-white/[0.08] p-4 space-y-3">
      <Link
        href={'/api/auth/signout'}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
        aria-label={tc('logout')}
      >
        <LogOut size={18} strokeWidth={1.75} />
        <span>{tc('logout')}</span>
      </Link>
    </div>
  );
}

export default function InterviewerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('interviewerDash');
  const tc = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-void">
      {/* Desktop sidebar — RTL: fixed right */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-s border-[rgba(212,175,55,0.1)] bg-[#0a0a0f] sticky top-0 h-screen">
        {/* Top: brand */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gold">
              مقابلة
            </span>
          </div>
        </div>

        <SidebarNav pathname={pathname} locale={locale} t={t} />
        <SidebarBottom t={t} tc={tc} />
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[rgba(212,175,55,0.1)] bg-[#0a0a0f]/80 px-4 backdrop-blur-md lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-white/5 cursor-pointer"
                aria-label="Menu"
              >
                <Menu size={20} strokeWidth={1.75} />
              </button>
            </SheetTrigger>
            <SheetContent
              side={locale === 'ar' ? 'left' : 'right'}
              className="w-64 border-s border-[rgba(212,175,55,0.1)] bg-[#0a0a0f] p-0"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="p-4 pb-2">
                <span className="text-lg font-bold text-gold">
                  مقابلة
                </span>
              </div>
              <SidebarNav
                pathname={pathname}
                locale={locale}
                t={t}
                onNavigate={() => setOpen(false)}
              />
              <SidebarBottom t={t} tc={tc} />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-bold text-gold">
            مقابلة
          </span>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#0f0f18]">
          {children}
        </main>
      </div>
    </div>
  );
}
