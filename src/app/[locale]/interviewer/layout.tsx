'use client';

import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  LayoutDashboard, Calendar, CalendarCheck, DollarSign, User, LogOut, Menu, Home,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { BackButton } from '@/components/navigation';

const DASHBOARD_PATHS = ['/dashboard', '/availability', '/bookings', '/earnings', '/profile'];

function isDashboardPath(pathname: string): boolean {
  const bare = pathname.replace(/^\/(ar|en)\//, '');
  return DASHBOARD_PATHS.some(function (p) { return bare.startsWith(p); });
}

const navItems = [
  { key: 'navOverview', icon: LayoutDashboard, href: '/interviewer/dashboard' },
  { key: 'navAvailability', icon: Calendar, href: '/interviewer/availability' },
  { key: 'navBookings', icon: CalendarCheck, href: '/interviewer/bookings' },
  { key: 'navEarnings', icon: DollarSign, href: '/interviewer/earnings' },
  { key: 'navProfile', icon: User, href: '/interviewer/profile' },
];

function SidebarNav({ pathname, locale, t, onNavigate }: {
  pathname: string;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map(function (item) {
        const fullPath = '/' + locale + item.href;
        const isActive = pathname.startsWith(fullPath);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={
              'flex items-center gap-3 rounded-xl border-s-2 px-3 py-2.5 text-sm font-medium transition-colors ' +
              (isActive
                ? 'border-s-gold text-gold bg-gold/10'
                : 'border-s-transparent text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]')
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            <span>{t(item.key as 'navOverview')}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('interviewerPanel');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-void">
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-s border-white/[0.08] bg-[var(--bg-panel)]">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <Image src="/images/logos/v2-balanced-a-T.webp" alt="Muqabaleh" width={32} height={32} className="h-8 w-8" />
            <span className="text-sm font-bold text-[var(--text-primary)]">{t('sidebarTitle')}</span>
          </div>
        </div>
        <Link href={'/' + locale} className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <Home size={16} strokeWidth={1.75} />
          <span>{locale === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </Link>
        <SidebarNav pathname={pathname} locale={locale} t={t} />
        <div className="mt-auto border-t border-white/[0.08] p-4 space-y-3">
          <div className="flex justify-center">
            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              {t('accredited')}
            </span>
          </div>
          <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400">
            <LogOut size={18} strokeWidth={1.75} />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/[0.08] bg-[var(--bg-panel)]/80 px-4 backdrop-blur-md lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-white/5">
                <Menu size={20} strokeWidth={1.75} />
              </button>
            </SheetTrigger>
            <SheetContent side={locale === 'ar' ? 'left' : 'right'} className="w-[260px] border-s border-white/[0.08] bg-[var(--bg-panel)] p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="p-4 pb-2">
                <div className="flex items-center gap-3">
                  <Image src="/images/logos/v2-balanced-a-T.webp" alt="Muqabaleh" width={32} height={32} className="h-8 w-8" />
                  <span className="text-sm font-bold text-[var(--text-primary)]">{t('sidebarTitle')}</span>
                </div>
              </div>
              <SidebarNav pathname={pathname} locale={locale} t={t} onNavigate={function() { setOpen(false); }} />
              <div className="mt-auto border-t border-white/[0.08] p-4 space-y-3">
                <div className="flex justify-center">
                  <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">{t('accredited')}</span>
                </div>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400">
                  <LogOut size={18} strokeWidth={1.75} />
                  <span>{t('signOut')}</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
          <Image src="/images/logos/v2-balanced-a-T.webp" alt="Muqabaleh" width={28} height={28} className="h-7 w-7" />
          <span className="text-sm font-bold text-[var(--text-primary)]">{t('sidebarTitle')}</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4"><BackButton href={'/' + locale} /></div>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function InterviewerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (!isDashboardPath(pathname)) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
