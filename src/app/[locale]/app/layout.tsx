'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  CreditCard,
  FileBadge,
  User,
  Calendar,
  LogOut,
  Bell,
  Menu,
  Home,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { BackButton } from '@/components/navigation';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, href: '/app' },
  { key: 'interviews', icon: MessageSquare, href: '/app/interviews' },
  { key: 'packages', icon: Package, href: '/app/packages' },
  { key: 'payments', icon: CreditCard, href: '/app/payments' },
  { key: 'certificates', icon: FileBadge, href: '/app/certificates' },
  { key: 'profile', icon: User, href: '/app/profile' },
  { key: 'bookings', icon: Calendar, href: '/app/bookings' },
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
          item.href === '/app'
            ? pathname === fullPath || pathname === item.href
            : pathname.startsWith(fullPath) || pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl border-s-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-s-teal-300 bg-teal-400/10 text-teal-300'
                : 'border-s-transparent text-white/50 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={20} strokeWidth={1.75} />
            <span>{t(`app.sidebar.${item.key}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAr = locale === 'ar';

  return (
    <div
      className="mq-atelier relative flex min-h-screen overflow-x-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
      </div>

      <aside className="relative z-10 hidden w-[280px] shrink-0 flex-col border-e border-white/10 bg-white/[0.03] backdrop-blur-xl lg:flex">
        <div className="p-4 pb-2">
          <Link href="/app" className="inline-block">
            <BrandLogo size="sm" priority />
          </Link>
        </div>

        <Link
          href={localePath('/', locale)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white/50 transition-colors hover:text-white"
        >
          <Home size={16} strokeWidth={1.75} />
          <span>{locale === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </Link>

        <SidebarNav pathname={pathname} locale={locale} t={t} />

        <div className="mt-auto space-y-4 border-t border-white/10 p-4">
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center rounded-full border border-[var(--mq-sand)]/30 bg-[var(--mq-sand)]/10 px-3 py-1 text-xs font-bold text-[var(--mq-sand)]">
              {t('app.sidebar.sessionsLeft', { count: 3 })}
            </span>
          </div>
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={20} strokeWidth={1.75} />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-400/20 text-sm font-bold text-teal-300">
              {'\u0623'}
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-white/50 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
              aria-label={t('app.sidebar.signOut')}
            >
              <LogOut size={20} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex flex-1 flex-col">
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
              side={locale === 'ar' ? 'left' : 'right'}
              className="w-[280px] border-s border-white/10 bg-[#070b14]/95 p-0"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="p-4 pb-2">
                <BrandLogo size="sm" />
              </div>
              <SidebarNav
                pathname={pathname}
                locale={locale}
                t={t}
                onNavigate={() => setOpen(false)}
              />
              <div className="mt-auto border-t border-white/10 p-4">
                <span className="inline-flex items-center rounded-full border border-[var(--mq-sand)]/30 bg-[var(--mq-sand)]/10 px-3 py-1 text-xs font-bold text-[var(--mq-sand)]">
                  {t('app.sidebar.sessionsLeft', { count: 3 })}
                </span>
              </div>
            </SheetContent>
          </Sheet>
          <BrandLogo size="sm" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4">
            <BackButton href={`/${locale}`} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
