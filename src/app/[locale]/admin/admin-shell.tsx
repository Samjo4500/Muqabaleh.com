'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { AdminNotificationBell } from '@/components/admin/AdminNotificationBell';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { LanguageSwitcherFixed } from '@/components/chrome/LanguageSwitcherFixed';
import { L } from '@/lib/admin/labels';
import { ADMIN_NAV, parentAdminPath } from '@/lib/admin/nav';
import { localePath } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

function useAdminTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem('muqabaleh-admin-theme');
    const next = stored === 'light' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('light', next === 'light');
    document.documentElement.classList.toggle('dark', next === 'dark');
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    window.localStorage.setItem('muqabaleh-admin-theme', next);
    document.documentElement.classList.toggle('light', next === 'light');
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return { theme, toggle };
}

function SidebarNav({
  pathname,
  locale,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  locale: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const activeGroup = useMemo(() => {
    for (const g of ADMIN_NAV) {
      if (g.items.some((i) => pathname.includes(i.href))) return g.id;
    }
    return 'main';
  }, [pathname]);

  useEffect(() => {
    setOpenGroups((prev) => ({ ...prev, [activeGroup]: true }));
  }, [activeGroup]);

  const isAr = locale === 'ar';

  return (
    <nav
      className="flex flex-1 flex-col gap-1 overflow-y-auto p-2"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      {ADMIN_NAV.map((group) => {
        const open = openGroups[group.id] ?? group.id === activeGroup;
        const label = L[group.label];
        const single = group.items.length === 1;

        if (single) {
          const item = group.items[0];
          const href = localePath(item.href, locale);
          const isActive = pathname === href || pathname.endsWith(item.href);
          return (
            <Link
              key={group.id}
              href={href}
              onClick={onNavigate}
              className={cn(
                'mb-1 block rounded-lg px-2 py-2 transition',
                collapsed && 'text-center',
                isActive
                  ? 'bg-teal-400/15 text-teal-200'
                  : 'text-white/50 hover:bg-white/5 hover:text-white',
              )}
            >
              {!collapsed ? <BiLabel ar={label.ar} en={label.en} size="sm" /> : <span className="text-xs">•</span>}
            </Link>
          );
        }

        return (
          <div key={group.id} className="mb-1">
            <button
              type="button"
              onClick={() => setOpenGroups((p) => ({ ...p, [group.id]: !open }))}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-2 py-2 text-start text-white/50 hover:bg-white/5 hover:text-white',
                collapsed && 'justify-center',
              )}
            >
              {!collapsed ? <BiLabel ar={label.ar} en={label.en} size="sm" /> : <span className="text-xs">•</span>}
              {!collapsed ? <ChevronDown size={14} className={cn('transition', open && 'rotate-180')} /> : null}
            </button>
            {open && !collapsed ? (
              <div className="ms-1 mt-0.5 space-y-0.5 border-s border-white/10 ps-2">
                {group.items.map((item) => {
                  const itemLabel = L[item.label];
                  const href = localePath(item.href, locale);
                  const isActive = pathname === href || pathname.endsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={href}
                      onClick={onNavigate}
                      className={cn(
                        'block rounded-lg px-2 py-2 transition',
                        isActive
                          ? 'bg-teal-400/15 text-teal-200'
                          : 'text-white/50 hover:bg-white/5 hover:text-white',
                      )}
                    >
                      <BiLabel ar={itemLabel.ar} en={itemLabel.en} size="sm" />
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggle } = useAdminTheme();
  const backHref = localePath(parentAdminPath(pathname), locale);
  const showGlobalBack = !pathname.endsWith('/admin/dashboard') && !pathname.endsWith('/admin');
  const homeLabel = isAr ? L.home.ar : L.home.en;
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  return (
    <div
      className="mq-atelier relative flex min-h-screen overflow-x-hidden text-white"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-c" />
      </div>

      <aside
        className={cn(
          'relative z-10 hidden flex-col border-e border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all lg:flex',
          collapsed ? 'w-[72px]' : 'w-[280px]',
        )}
      >
        <Link
          href={localePath('/', locale)}
          className="block p-4 transition hover:bg-white/[0.04]"
          aria-label={homeLabel}
          title={homeLabel}
        >
          <BrandLogo size={collapsed ? 'sm' : 'nav'} priority />
          {!collapsed ? (
            <p className="mt-2 text-[10px] font-semibold tracking-wide text-teal-300/90">
              Control Panel · Spec v2
            </p>
          ) : null}
        </Link>
        <SidebarNav pathname={pathname} locale={locale} collapsed={collapsed} />
        <div className="mt-auto space-y-2 border-t border-white/10 p-3">
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300">
              <ShieldCheck size={14} />
              {!collapsed ? <BiInline ar={L.systemAdmin.ar} en={L.systemAdmin.en} /> : null}
            </span>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {!collapsed ? <BiInline ar={L.theme.ar} en={L.theme.en} /> : null}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!collapsed ? (
              <BiInline
                ar={collapsed ? L.expand.ar : L.collapse.ar}
                en={collapsed ? L.expand.en : L.collapse.en}
              />
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: localePath('/', locale) })}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut size={16} />
            {!collapsed ? <BiInline ar={L.signOut.ar} en={L.signOut.en} /> : null}
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/10 bg-[#070b14]/92 px-4 backdrop-blur-md lg:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="rounded-lg p-2 text-white/50 hover:bg-white/5 lg:hidden"
                aria-label="Menu"
              >
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent
              side={isAr ? 'right' : 'left'}
              className="w-[280px] border-e border-white/10 bg-[#070b14]/95 p-0"
            >
              <SheetTitle className="sr-only">Admin Menu</SheetTitle>
              <Link
                href={localePath('/', locale)}
                onClick={() => setOpen(false)}
                className="block p-4 transition hover:bg-white/[0.04]"
                aria-label={homeLabel}
              >
                <BrandLogo size="nav" />
                <p className="mt-2 text-[10px] font-semibold tracking-wide text-teal-300/90">
                  Control Panel · Spec v2
                </p>
              </Link>
              <SidebarNav pathname={pathname} locale={locale} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link
            href={localePath('/', locale)}
            className="flex min-w-0 items-center gap-2 lg:hidden"
            aria-label={homeLabel}
          >
            <BrandLogo size="nav" />
          </Link>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-semibold text-white">
              <BiInline ar={L.systemAdmin.ar} en={L.systemAdmin.en} />
            </p>
            <p className="truncate text-[11px] text-white/45">
              <BiInline ar={L.alertsEmails.ar} en={L.alertsEmails.en} />
            </p>
          </div>
          <div className="ms-auto flex items-center gap-2" dir="ltr">
            <button
              type="button"
              onClick={toggle}
              className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/5 hover:text-white"
              aria-label={isAr ? L.theme.ar : L.theme.en}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <LanguageSwitcherFixed variant="inline" />
            <AdminNotificationBell />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {showGlobalBack ? (
            <div className="mb-4">
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70 hover:border-teal-300/40 hover:text-teal-200"
              >
                <BackIcon size={16} />
                <BiInline ar={L.back.ar} en={L.back.en} />
              </Link>
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
