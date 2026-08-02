'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Receipt,
  Settings,
  LogOut,
  Menu,
  Home,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { BackButton } from '@/components/navigation';

const navItems = [
  { key: 'navOverview', icon: LayoutDashboard, href: '/b2b' },
  { key: 'navJobs', icon: Briefcase, href: '/b2b/jobs' },
  { key: 'navTeam', icon: Users, href: '/b2b/team' },
  { key: 'navBilling', icon: Receipt, href: '/b2b/billing' },
  { key: 'navSettings', icon: Settings, href: '/b2b/settings' },
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
          item.href === '/b2b'
            ? pathname === fullPath
            : pathname.startsWith(fullPath);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl border-s-2 px-3 py-2.5 text-sm font-medium transition-colors ${
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

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('b2b');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-void">
      {/* Desktop sidebar — RTL: fixed right */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-s border-white/[0.08] bg-[var(--bg-panel)]">
        {/* Top: logo + title */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logos/v2-balanced-a-T.webp"
              alt="Muqabaleh"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-sm font-bold text-[var(--text-primary)]">
              {t('sidebarTitle')}
            </span>
          </div>
        </div>

        {/* Home link */}
        <Link href={`/${locale}`} className='flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors'>
          <Home size={16} strokeWidth={1.75} />
          <span>{locale === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </Link>

        <SidebarNav pathname={pathname} locale={locale} t={t} />

        {/* Bottom: sessions badge, company name, sign out */}
        <div className="mt-auto border-t border-white/[0.08] p-4 space-y-3">
          <div className="flex justify-center">
            <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
              {t('sessionsBadge', { count: 15 })}
            </span>
          </div>
          <div className="px-1">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {t('companyName')}
            </p>
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label={t('signOut')}
          >
            <LogOut size={18} strokeWidth={1.75} />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/[0.08] bg-[var(--bg-panel)]/80 px-4 backdrop-blur-md lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-white/5"
                aria-label="Menu"
              >
                <Menu size={20} strokeWidth={1.75} />
              </button>
            </SheetTrigger>
            <SheetContent
              side={locale === 'ar' ? 'left' : 'right'}
              className="w-[260px] border-s border-white/[0.08] bg-[var(--bg-panel)] p-0"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="p-4 pb-2">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/logos/v2-balanced-a-T.webp"
                    alt="Muqabaleh"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {t('sidebarTitle')}
                  </span>
                </div>
              </div>
              <SidebarNav
                pathname={pathname}
                locale={locale}
                t={t}
                onNavigate={() => setOpen(false)}
              />
              <div className="mt-auto border-t border-white/[0.08] p-4 space-y-3">
                <div className="flex justify-center">
                  <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
                    {t('sessionsBadge', { count: 15 })}
                  </span>
                </div>
                <p className="truncate px-1 text-sm font-medium text-[var(--text-primary)]">
                  {t('companyName')}
                </p>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                  aria-label={t('signOut')}
                >
                  <LogOut size={18} strokeWidth={1.75} />
                  <span>{t('signOut')}</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
          <Image
            src="/images/logos/v2-balanced-a-T.webp"
            alt="Muqabaleh"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span className="text-sm font-bold text-[var(--text-primary)]">
            {t('sidebarTitle')}
          </span>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className='mb-4'>
            <BackButton href={`/${locale}`} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
