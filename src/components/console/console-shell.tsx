'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Briefcase,
  Building2,
  FileBadge2,
  GraduationCap,
  KanbanSquare,
  KeyRound,
  LayoutDashboard,
  Moon,
  Settings,
  Sun,
  Users,
  Wallet,
} from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { LanguageSwitcherFixed } from '@/components/chrome/LanguageSwitcherFixed';
import { localePath } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { TenantType } from '@/lib/console/types';
import { ConsoleThemeProvider, useConsoleTheme } from './console-theme';

type NavItem = {
  key: string;
  href: string;
  icon: typeof LayoutDashboard;
  types?: TenantType[];
};

const NAV: NavItem[] = [
  { key: 'navDashboard', href: '', icon: LayoutDashboard },
  { key: 'navPipeline', href: '/pipeline', icon: KanbanSquare },
  { key: 'navPassports', href: '/passports', icon: FileBadge2 },
  { key: 'navJobs', href: '/jobs', icon: Briefcase },
  { key: 'navAnalytics', href: '/analytics', icon: BarChart3 },
  { key: 'navClients', href: '/clients', icon: Building2, types: ['AGENCY'] },
  { key: 'navRevenue', href: '/revenue', icon: Wallet, types: ['AGENCY'] },
  { key: 'navCohorts', href: '/cohorts', icon: GraduationCap, types: ['ACADEMY'] },
  { key: 'navFaculty', href: '/faculty', icon: Users, types: ['ACADEMY'] },
  { key: 'navAccreditation', href: '/accreditation', icon: FileBadge2, types: ['ACADEMY'] },
  { key: 'navDevelopers', href: '/developers', icon: KeyRound },
  { key: 'navTeam', href: '/team', icon: Users },
  { key: 'navSettings', href: '/settings', icon: Settings },
];

function ThemeToggle() {
  const { theme, toggle } = useConsoleTheme();
  const locale = useLocale();
  const isAr = locale === 'ar';
  return (
    <button
      type="button"
      onClick={toggle}
      className="mq-console-icon-btn"
      aria-label={isAr ? 'تبديل المظهر' : 'Toggle theme'}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function ShellInner({
  tenantSlug,
  orgName,
  tenantType,
  children,
}: {
  tenantSlug: string;
  orgName: string;
  tenantType: TenantType;
  children: React.ReactNode;
}) {
  const t = useTranslations('console');
  const locale = useLocale();
  const pathname = usePathname();
  const isAr = locale === 'ar';
  const base = `/console/${tenantSlug}`;
  const items = NAV.filter(
    (item) => !item.types || item.types.includes(tenantType),
  );

  const badge =
    tenantType === 'AGENCY'
      ? t('agencyBadge')
      : tenantType === 'ACADEMY'
        ? t('academyBadge')
        : t('employerBadge');

  return (
    <div className="flex min-h-screen flex-col" dir={isAr ? 'rtl' : 'ltr'} lang={isAr ? 'ar' : 'en'}>
      <LanguageSwitcherFixed />
      <div className="flex flex-1">
        <aside className="mq-console-sidebar hidden w-[260px] shrink-0 flex-col lg:flex">
          <div className="flex items-center gap-3 p-4 pb-2">
            <BrandLogo size="nav" priority />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[var(--c-text)]">{orgName}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--c-primary)]">
                {badge}
              </p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
            {items.map((item) => {
              const href = localePath(`${base}${item.href}`, locale);
              const bare = `${base}${item.href}`;
              const isActive =
                item.href === ''
                  ? pathname === localePath(base, locale) ||
                    pathname === base ||
                    pathname.endsWith(`/console/${tenantSlug}`)
                  : pathname.includes(bare);
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border-s-2 px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'border-s-[var(--c-primary)] bg-[var(--c-primary-soft)] text-[var(--c-primary)]'
                      : 'border-s-transparent text-[var(--c-text-2)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]',
                  )}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center justify-between border-t border-[var(--c-border)] p-3">
            <span className="text-xs text-[var(--c-text-2)]">muqabaleh.com</span>
            <ThemeToggle />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="mq-console-topbar flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--c-text-2)]">
                {t('commandCenter')}
              </p>
              <h1 className="text-lg font-bold text-[var(--c-text)]">{orgName}</h1>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 px-4 pb-24 pt-4 lg:px-6 lg:pb-8">{children}</main>

          <nav className="mq-console-bottom-nav lg:hidden">
            {items.slice(0, 5).map((item) => {
              const href = localePath(`${base}${item.href}`, locale);
              const Icon = item.icon;
              const bare = `${base}${item.href}`;
              const isActive =
                item.href === ''
                  ? pathname.endsWith(`/console/${tenantSlug}`)
                  : pathname.includes(bare);
              return (
                <Link
                  key={item.key}
                  href={href}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium',
                    isActive ? 'text-[var(--c-primary)]' : 'text-[var(--c-text-2)]',
                  )}
                >
                  <Icon size={18} />
                  <span className="truncate px-0.5">{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

export function ConsoleShell({
  tenantSlug,
  orgName,
  tenantType,
  children,
}: {
  tenantSlug: string;
  orgName: string;
  tenantType: TenantType;
  children: React.ReactNode;
}) {
  return (
    <ConsoleThemeProvider>
      <ShellInner tenantSlug={tenantSlug} orgName={orgName} tenantType={tenantType}>
        {children}
      </ShellInner>
    </ConsoleThemeProvider>
  );
}
