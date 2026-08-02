'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

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
            ? pathname === fullPath
            : pathname.startsWith(fullPath);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'border-s-gold text-gold bg-gold/10' : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]'}`}
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

  return (
    <div className="flex min-h-screen bg-void">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[280px] shrink-0 flex-col border-e border-white/[0.08] bg-[var(--bg-panel)]">
        <div className="p-4 pb-2">
          <Link href="/app" className="inline-block">
            <Image
              src="/images/logos/v2-balanced-a-T.webp"
              alt="Muqabaleh"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        <SidebarNav pathname={pathname} locale={locale} t={t} />

        {/* Bottom section */}
        <div className="mt-auto border-t border-white/[0.08] p-4 space-y-4">
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
              {t('app.sidebar.sessionsLeft', { count: 3 })}
            </span>
          </div>
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
              aria-label="Notifications"
            >
              <Bell size={20} strokeWidth={1.75} />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
              {'\u0623'}
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
              aria-label={t('app.sidebar.signOut')}
            >
              <LogOut size={20} strokeWidth={1.75} />
            </button>
          </div>
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
              className="w-[280px] border-s border-white/[0.08] bg-[var(--bg-panel)] p-0"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="p-4 pb-2">
                <Image
                  src="/images/logos/v2-balanced-a-T.webp"
                  alt="Muqabaleh"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                />
              </div>
              <SidebarNav
                pathname={pathname}
                locale={locale}
                t={t}
                onNavigate={() => setOpen(false)}
              />
              <div className="mt-auto border-t border-white/[0.08] p-4">
                <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
                  {t('app.sidebar.sessionsLeft', { count: 3 })}
                </span>
              </div>
            </SheetContent>
          </Sheet>
          <Image
            src="/images/logos/v2-balanced-a-T.webp"
            alt="Muqabaleh"
            width={100}
            height={28}
            className="h-7 w-auto"
          />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
