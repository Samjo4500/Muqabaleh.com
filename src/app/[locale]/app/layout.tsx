'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  CreditCard,
  FileBadge,
  User,
  LogOut,
  Menu,
  Home,
  ClipboardList,
  Sparkles,
  Bell,
  BadgeCheck,
  Bot,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { BackButton } from '@/components/navigation';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { LanguageSwitcherFixed } from '@/components/chrome/LanguageSwitcherFixed';
import { localePath } from '@/i18n/navigation';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, href: '/app' },
  { key: 'interviews', icon: MessageSquare, href: '/app/interviews' },
  { key: 'practice', icon: Sparkles, href: '/interview/prequal' },
  { key: 'applications', icon: ClipboardList, href: '/app/applications' },
  { key: 'jeannie', icon: Bot, href: '/app/jeannie' },
  { key: 'notifications', icon: Bell, href: '/app/notifications' },
  { key: 'packages', icon: Package, href: '/app/packages' },
  { key: 'payments', icon: CreditCard, href: '/app/payments' },
  { key: 'certificates', icon: FileBadge, href: '/app/certificates' },
  { key: 'passport', icon: BadgeCheck, href: '/app/passport' },
  { key: 'profile', icon: User, href: '/app/profile' },
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
        const bare = item.href;
        const isActive =
          bare === '/app'
            ? pathname === href || pathname === '/app' || pathname === `/${locale}/app`
            : pathname === href ||
              pathname.startsWith(`${href}/`) ||
              pathname.startsWith(bare) ||
              pathname.startsWith(`/${locale}${bare}`);
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

      <LanguageSwitcherFixed />

      <aside className="relative z-10 hidden w-[280px] shrink-0 flex-col border-e border-white/10 bg-white/[0.03] backdrop-blur-xl lg:flex">
        <div className="p-4 pb-2">
          <Link href={localePath('/app', locale)} className="inline-block" aria-label="Muqabaleh">
            <BrandLogo size="nav" priority />
          </Link>
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
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: localePath('/', locale) })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
            aria-label={t('app.sidebar.signOut')}
          >
            <LogOut size={18} strokeWidth={1.75} />
            <span>{t('app.sidebar.signOut')}</span>
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 bg-[#070b14]/80 px-4 pe-24 backdrop-blur-md lg:hidden">
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
              className="w-[280px] border-s border-white/10 bg-[#070b14]/95 p-0"
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
              <div className="border-t border-white/10 p-4">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: localePath('/', locale) })}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <LogOut size={18} strokeWidth={1.75} />
                  <span>{t('app.sidebar.signOut')}</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
          <Link href={localePath('/app', locale)} aria-label="Muqabaleh">
            <BrandLogo size="nav" />
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-4">
            <BackButton href={localePath('/', locale)} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
