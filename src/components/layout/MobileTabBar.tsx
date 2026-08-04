'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { House, CalendarDays, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function MobileTabBar() {
  const t = useTranslations('mobile');
  const locale = useLocale();
  const pathname = usePathname();
  const { status } = useSession();

  // Strip locale prefix for matching
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';

  // Hide on landing page
  if (pathWithoutLocale === '/') return null;

  const tabs = [
    { key: 'home', href: `/${locale}`, icon: House, matchPath: '/' },
    { key: 'bookings', href: `/${locale}/app/bookings`, icon: CalendarDays, matchPath: '/app/bookings' },
    { key: 'profile', href: status === 'authenticated' ? `/${locale}/app/profile` : `/${locale}/auth/signin`, icon: User, matchPath: '/app/profile' },
  ] as const;

  const isActive = (matchPath: string) => {
    if (matchPath === '/') return pathWithoutLocale === '/' || pathWithoutLocale === '';
    return pathWithoutLocale.startsWith(matchPath);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="border-t border-white/[0.08] bg-[var(--bg-panel)]/95 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-around pb-[env(safe-area-inset-bottom)]">
          {tabs.map((tab) => {
            const active = isActive(tab.matchPath);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-4 py-1 transition-colors ${
                  active ? 'text-[var(--gold)]' : 'text-[var(--text-faint)]'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[10px] font-medium">
                  {t(`tab${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}`)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
