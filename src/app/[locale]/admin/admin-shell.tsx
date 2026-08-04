'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import {
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

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2" dir="rtl">
      {ADMIN_NAV.map((group) => {
        const open = openGroups[group.id] ?? group.id === activeGroup;
        const label = L[group.label];
        const single = group.items.length === 1;

        // Top-level single links (Dashboard, Notifications, Audit, Applicants)
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
                  ? 'bg-cyan-500/15 text-cyan-200'
                  : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]',
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
                'flex w-full items-center justify-between rounded-lg px-2 py-2 text-start text-[var(--text-muted)] hover:bg-white/5',
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
                          ? 'bg-cyan-500/15 text-cyan-200'
                          : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]',
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
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggle } = useAdminTheme();
  const backHref = localePath(parentAdminPath(pathname), locale);
  const showGlobalBack = !pathname.endsWith('/admin/dashboard') && !pathname.endsWith('/admin');

  return (
    <div className="flex min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)]" dir="rtl">
      <aside
        className={cn(
          'hidden flex-col border-s border-white/[0.08] bg-[var(--bg-panel)] transition-all lg:flex',
          collapsed ? 'w-[72px]' : 'w-[280px]',
        )}
      >
        <Link
          href={localePath('/', locale)}
          className="flex items-center gap-3 p-4 transition hover:bg-white/[0.04]"
          aria-label={`${L.home.ar} / ${L.home.en}`}
          title={`${L.home.ar} / ${L.home.en}`}
        >
          <Image src="/images/logos/v2-balanced-a-T.webp" alt="Muqabaleh" width={36} height={36} className="h-9 w-9" />
          {!collapsed ? (
            <div>
              <BiLabel ar={L.brand.ar} en={L.brand.en} />
              <p className="mt-1 text-[10px] font-semibold tracking-wide text-cyan-300/90">
                Control Panel · Spec v2
              </p>
            </div>
          ) : null}
        </Link>
        <SidebarNav pathname={pathname} locale={locale} collapsed={collapsed} />
        <div className="mt-auto space-y-2 border-t border-white/[0.08] p-3">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
              <ShieldCheck size={14} />
              {!collapsed ? <BiInline ar={L.systemAdmin.ar} en={L.systemAdmin.en} /> : null}
            </span>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-white/5"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {!collapsed ? <BiInline ar={L.theme.ar} en={L.theme.en} /> : null}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-white/5"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!collapsed ? <BiInline ar={collapsed ? L.expand.ar : L.collapse.ar} en={collapsed ? L.expand.en : L.collapse.en} /> : null}
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} />
            {!collapsed ? <BiInline ar={L.signOut.ar} en={L.signOut.en} /> : null}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/[0.08] bg-[var(--bg-panel)]/85 px-4 backdrop-blur-md lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-white/5" aria-label="Menu">
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] border-s border-white/[0.08] bg-[var(--bg-panel)] p-0">
              <SheetTitle className="sr-only">Admin Menu</SheetTitle>
              <Link
                href={localePath('/', locale)}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-4 transition hover:bg-white/[0.04]"
                aria-label={`${L.home.ar} / ${L.home.en}`}
              >
                <Image src="/images/logos/v2-balanced-a-T.webp" alt="Muqabaleh" width={32} height={32} className="h-8 w-8" />
                <BiLabel ar={L.brand.ar} en={L.brand.en} />
              </Link>
              <SidebarNav pathname={pathname} locale={locale} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link
            href={localePath('/', locale)}
            className="flex min-w-0 items-center gap-2"
            aria-label={`${L.home.ar} / ${L.home.en}`}
          >
            <Image src="/images/logos/v2-balanced-a-T.webp" alt="Muqabaleh" width={28} height={28} className="h-7 w-7 shrink-0" />
            <BiLabel ar={L.brand.ar} en={L.brand.en} size="sm" />
          </Link>
          <button type="button" onClick={toggle} className="ms-auto rounded-lg p-2 text-[var(--text-muted)] hover:bg-white/5">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {showGlobalBack ? (
            <div className="mb-4">
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
              >
                <ArrowRight size={16} />
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
