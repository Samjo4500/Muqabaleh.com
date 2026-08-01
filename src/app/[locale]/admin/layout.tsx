'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  BookOpen,
  CreditCard,
  MessageSquare,
  ScrollText,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  AlertTriangle,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';

import { AdminGate } from './admin-guard';

const navItems = [
  { key: 'navOverview', icon: LayoutDashboard, href: '/admin' },
  { key: 'navUsers', icon: Users, href: '/admin/users' },
  { key: 'navInterviewers', icon: UserCheck, href: '/admin/interviewers' },
  { key: 'navBookings', icon: Calendar, href: '/admin/bookings' },
  { key: 'navQuestions', icon: BookOpen, href: '/admin/questions' },
  { key: 'navPayouts', icon: CreditCard, href: '/admin/payouts' },
  { key: 'navInterviews', icon: MessageSquare, href: '/admin/interviews' },
  { key: 'navLogs', icon: ScrollText, href: '/admin/logs' },
  { key: 'navSettings', icon: Settings, href: '/admin/settings' },
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
          item.href === '/admin'
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

function SidebarBottom({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="mt-auto border-t border-white/[0.08] p-4 space-y-3">
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
          <ShieldCheck size={14} strokeWidth={1.75} />
          {t('systemAdminBadge')}
        </span>
      </div>
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
        aria-label={t('signOut')}
      >
        <LogOut size={18} strokeWidth={1.75} />
        <span>{t('signOut')}</span>
      </button>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('adminPanel');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => setDemoMode(data.demoMode === true))
      .catch(() => {});
  }, []);

  return (
    <AdminGate>
      <div className="flex min-h-screen bg-void">
      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 bg-amber-500/90 px-4 py-1.5 text-xs font-bold text-black">
          <AlertTriangle size={14} />
          DEMO MODE — {locale === 'ar' ? 'هذه بيانات تجريبية وليست حقيقية' : 'This is demo data, not real'}
        </div>
      )}

      {/* Desktop sidebar — RTL: fixed right */}
      <aside className={`hidden lg:flex w-[260px] shrink-0 flex-col border-s border-white/[0.08] bg-[var(--bg-panel)] ${demoMode ? 'pt-8' : ''}`}>
        {/* Top: logo + title */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logos/v2-balanced-a-T.png"
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

        <SidebarNav pathname={pathname} locale={locale} t={t} />
        <SidebarBottom t={t} />
      </aside>

      {/* Mobile top bar */}
      <div className={`flex flex-1 flex-col ${demoMode ? 'pt-8' : ''}`}>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/[0.08] bg-[var(--bg-panel)]/80 px-4 backdrop-blur-md lg:hidden">
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
              className="w-[260px] border-s border-white/[0.08] bg-[var(--bg-panel)] p-0"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="p-4 pb-2">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/logos/v2-balanced-a-T.png"
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
              <SidebarBottom t={t} />
            </SheetContent>
          </Sheet>
          <Image
            src="/images/logos/v2-balanced-a-T.png"
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
          {children}
        </main>
      </div>
    </div>
    </AdminGate>
  );
}
