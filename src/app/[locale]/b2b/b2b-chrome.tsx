'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserSearch,
  Receipt,
  Settings,
  Menu,
  Home,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { B2BPreviewBanner, B2BPreviewContent } from '@/components/b2b/B2BPreviewGate';
import { LanguageSwitcherFixed } from '@/components/chrome/LanguageSwitcherFixed';
import { localePath } from '@/i18n/navigation';
import { B2B_CONSOLE_PREVIEW } from '@/lib/b2b-preview';

const navItems = [
  { key: 'navOverview', icon: LayoutDashboard, href: '/b2b' },
  { key: 'navJobs', icon: Briefcase, href: '/b2b/jobs' },
  { key: 'navTalent', icon: UserSearch, href: '/b2b/talent' },
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
        const href = localePath(item.href, locale);
        const isActive =
          item.href === '/b2b'
            ? pathname === href || pathname === item.href || pathname === `/${locale}/b2b`
            : pathname === href ||
              pathname.startsWith(`${href}/`) ||
              pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl border-s-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-s-teal-300 bg-teal-400/10 text-teal-300'
                : 'border-s-transparent text-white/50 hover:bg-white/5 hover:text-white'
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

export function B2BChrome({ children }: { children: React.ReactNode }) {
  const t = useTranslations('b2b');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAr = locale === 'ar';
  const preview = B2B_CONSOLE_PREVIEW;

  return (
    <div
      className="mq-atelier relative flex min-h-screen flex-col overflow-x-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-c" />
      </div>

      <LanguageSwitcherFixed />
      {preview ? <B2BPreviewBanner /> : null}

      <div className="relative z-10 flex flex-1">
        <aside className="hidden w-[260px] shrink-0 flex-col border-s border-white/10 bg-white/[0.03] backdrop-blur-xl lg:flex">
          <div className="p-4 pb-2">
            <div className="flex items-center gap-3">
              <BrandLogo size="nav" priority />
              <div>
                <span className="block text-sm font-bold text-white">{t('sidebarTitle')}</span>
                {preview ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300/80">
                    {isAr ? 'معاينة' : 'Preview'}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <Link
            href={localePath('/', locale)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <Home size={16} strokeWidth={1.75} />
            <span>{isAr ? 'الرئيسية' : 'Home'}</span>
          </Link>

          <SidebarNav pathname={pathname} locale={locale} t={t} />

          <div className="mt-auto space-y-3 border-t border-white/10 p-4">
            <p className="truncate px-1 text-sm font-medium text-white/80">{t('companyName')}</p>
            {preview ? (
              <Link
                href={localePath('/request-demo?from=b2b-sidebar', locale)}
                className="mq-btn mq-btn-primary flex w-full items-center justify-center py-2 text-sm"
              >
                {isAr ? 'اطلب عرضاً' : 'Request demo'}
              </Link>
            ) : null}
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 bg-[#070b14]/80 px-4 backdrop-blur-md lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="rounded-lg p-2 text-white/50 hover:bg-white/5"
                  aria-label="Menu"
                >
                  <Menu size={20} strokeWidth={1.75} />
                </button>
              </SheetTrigger>
              <SheetContent
                side={isAr ? 'left' : 'right'}
                className="w-[260px] border-s border-white/10 bg-[#070b14]/95 p-0 backdrop-blur-xl"
              >
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="p-4 pb-2">
                  <BrandLogo size="nav" />
                </div>
                <SidebarNav
                  pathname={pathname}
                  locale={locale}
                  t={t}
                  onNavigate={() => setOpen(false)}
                />
                {preview ? (
                  <div className="border-t border-white/10 p-4">
                    <Link
                      href={localePath('/request-demo?from=b2b-mobile', locale)}
                      className="mq-btn mq-btn-primary flex w-full items-center justify-center py-2 text-sm"
                      onClick={() => setOpen(false)}
                    >
                      {isAr ? 'اطلب عرضاً' : 'Request demo'}
                    </Link>
                  </div>
                ) : null}
              </SheetContent>
            </Sheet>
            <BrandLogo size="nav" />
            <span className="text-sm font-bold text-white">{t('sidebarTitle')}</span>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {preview ? <B2BPreviewContent>{children}</B2BPreviewContent> : children}
          </main>
        </div>
      </div>
    </div>
  );
}
