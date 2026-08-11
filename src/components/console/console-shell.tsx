'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Briefcase,
  Building2,
  FileBadge2,
  GraduationCap,
  Home,
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
import { SIMPLE_MODE_HIDDEN_NAV } from '@/lib/console/a11y';
import {
  CONSOLE_PRODUCT,
  consoleFullName,
  getConsoleEdition,
  welcomeStorageKey,
} from '@/lib/console/identity';
import {
  ConsoleA11yMenu,
  ConsoleA11yProvider,
  ConsoleSearchField,
  useConsoleA11y,
} from './console-a11y';
import { ConsoleThemeProvider, useConsoleTheme } from './console-theme';
import { ConsoleTour } from './console-tour';
import { ConsoleWelcome } from './console-welcome';

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
      {theme === 'dark' ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
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
  const ta = useTranslations('console.a11y');
  const locale = useLocale();
  const pathname = usePathname();
  const isAr = locale === 'ar';
  const { simpleMode } = useConsoleA11y();
  const base = `/console/${tenantSlug}`;
  const homeHref = localePath('/', locale);
  const deskHref = localePath(base, locale);
  const edition = getConsoleEdition(tenantType);
  const productName = isAr ? CONSOLE_PRODUCT.ar : CONSOLE_PRODUCT.en;
  const editionName = isAr ? edition.ar : edition.en;
  const fullName = consoleFullName(tenantType, locale);

  const items = useMemo(
    () =>
      NAV.filter((item) => {
        if (item.types && !item.types.includes(tenantType)) return false;
        if (simpleMode && SIMPLE_MODE_HIDDEN_NAV.has(item.key)) return false;
        return true;
      }),
    [tenantType, simpleMode],
  );

  const [welcomeDone, setWelcomeDone] = useState(false);
  useEffect(() => {
    const check = () => {
      try {
        if (sessionStorage.getItem(welcomeStorageKey(tenantSlug))) {
          setWelcomeDone(true);
        }
      } catch {
        setWelcomeDone(true);
      }
    };
    check();
    const timer = window.setInterval(check, 350);
    return () => window.clearInterval(timer);
  }, [tenantSlug]);

  const tourTargetFor = (key: string) => {
    if (key === 'navPipeline') return 'nav-pipeline';
    if (key === 'navTeam') return 'nav-team';
    if (key === 'navDashboard') return 'nav-dashboard';
    if (key === 'navJobs') return 'nav-jobs';
    if (key === 'navPassports') return 'nav-passports';
    return undefined;
  };

  return (
    <div className="flex min-h-screen flex-col" dir={isAr ? 'rtl' : 'ltr'} lang={isAr ? 'ar' : 'en'}>
      <ConsoleWelcome
        tenantSlug={tenantSlug}
        orgName={orgName}
        tenantType={tenantType}
      />
      <ConsoleTour tenantSlug={tenantSlug} enabled={welcomeDone} />
      <LanguageSwitcherFixed />
      <div className="flex flex-1">
        <aside className="mq-console-sidebar hidden w-[256px] shrink-0 flex-col lg:flex">
          <div className="px-3 pb-2 pt-4">
            <Link
              href={homeHref}
              className="mq-console-logo-home group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--c-surface-2)]"
              aria-label={isAr ? 'الصفحة الرئيسية — مقابلة' : 'Home — Muqabaleh'}
            >
              <BrandLogo size="nav" priority />
              <span className="flex items-center gap-1 text-[10px] tracking-wide text-[var(--c-text-3)] opacity-0 transition-opacity group-hover:opacity-100">
                <Home size={11} strokeWidth={1.5} />
                {isAr ? 'الرئيسية' : 'Home'}
              </span>
            </Link>

            <Link
              href={deskHref}
              className="mt-2 block rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-2.5 transition-colors hover:border-[var(--c-primary)]/40"
            >
              <p className="text-[11px] font-medium tracking-[0.14em] text-[var(--c-primary)] uppercase">
                {productName}
              </p>
              <p className="mt-0.5 truncate text-[13px] font-medium tracking-tight text-[var(--c-text)]">
                {editionName}
                <span className="text-[var(--c-text-3)]"> · {orgName}</span>
              </p>
            </Link>
          </div>

          <div className="mx-4 mb-2 h-px bg-[var(--c-border)]" />

          <nav
            className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 pb-4"
            aria-label={ta('navLabel')}
          >
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
                  data-active={isActive ? 'true' : 'false'}
                  aria-current={isActive ? 'page' : undefined}
                  data-tour={tourTargetFor(item.key)}
                  className="mq-console-nav-link"
                >
                  <Icon size={17} strokeWidth={1.5} className="opacity-80" aria-hidden />
                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-between border-t border-[var(--c-border)] px-4 py-3">
            <span className="text-[11px] tracking-wide text-[var(--c-text-3)]">
              muqabaleh.com
            </span>
            <ThemeToggle />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="mq-console-topbar flex items-center justify-between gap-3 px-4 py-3.5 lg:px-8">
            <div className="min-w-0">
              <div className="flex items-center gap-2 lg:hidden">
                <Link
                  href={homeHref}
                  className="mq-console-icon-btn"
                  aria-label={isAr ? 'الرئيسية' : 'Home'}
                >
                  <Home size={15} strokeWidth={1.5} />
                </Link>
                <Link href={deskHref} className="min-w-0">
                  <p className="mq-console-eyebrow truncate">{fullName}</p>
                  <h1 className="mt-0.5 truncate text-[1.05rem] font-medium tracking-tight text-[var(--c-text)]">
                    {orgName}
                  </h1>
                </Link>
              </div>
              <div className="hidden lg:block">
                <p className="mq-console-eyebrow">{fullName}</p>
                <h1 className="mt-0.5 text-[1.15rem] font-medium tracking-tight text-[var(--c-text)]">
                  {orgName}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ConsoleSearchField />
              <Link
                href={homeHref}
                className="mq-console-btn-ghost hidden items-center gap-1.5 text-xs sm:inline-flex"
              >
                <Home size={13} strokeWidth={1.5} aria-hidden />
                {isAr ? 'مقابلة' : 'Muqabaleh'}
              </Link>
              <ConsoleA11yMenu />
              <div className="lg:hidden">
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="relative flex-1 px-4 pb-24 pt-5 lg:px-8 lg:pb-10 lg:pt-7">
            {children}
          </main>

          <nav className="mq-console-bottom-nav lg:hidden" aria-label={ta('navLabel')}>
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
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[44px] flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-normal tracking-wide',
                    isActive ? 'text-[var(--c-primary)]' : 'text-[var(--c-text-3)]',
                  )}
                >
                  <Icon size={17} strokeWidth={1.5} aria-hidden />
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
      <ConsoleA11yProvider tenantSlug={tenantSlug}>
        <ShellInner tenantSlug={tenantSlug} orgName={orgName} tenantType={tenantType}>
          {children}
        </ShellInner>
      </ConsoleA11yProvider>
    </ConsoleThemeProvider>
  );
}
