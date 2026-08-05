'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Settings,
  Users,
  Wallet,
  Webhook,
  X,
} from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { PartnerRecord } from '@/lib/partner/types';

const NAV = [
  { href: '/partner', key: 'navOverview', icon: LayoutDashboard },
  { href: '/partner/clients', key: 'navClients', icon: Building2 },
  { href: '/partner/ats', key: 'navAts', icon: Briefcase },
  { href: '/partner/branding', key: 'navBranding', icon: Palette },
  { href: '/partner/analytics', key: 'navAnalytics', icon: BarChart3 },
  { href: '/partner/api-keys', key: 'navApiKeys', icon: KeyRound },
  { href: '/partner/webhooks', key: 'navWebhooks', icon: Webhook },
  { href: '/partner/revenue', key: 'navRevenue', icon: Wallet },
  { href: '/partner/billing', key: 'navBilling', icon: CreditCard },
  { href: '/partner/team', key: 'navTeam', icon: Users },
  { href: '/partner/docs', key: 'navDocs', icon: BookOpen },
  { href: '/partner/settings', key: 'navSettings', icon: Settings },
] as const;

function applyBrand(partner: PartnerRecord | null) {
  if (typeof document === 'undefined' || !partner) return;
  const root = document.documentElement;
  root.style.setProperty('--pc-primary', partner.primaryColor || '#0D9488');
  root.style.setProperty('--pc-accent', partner.accentColor || '#E8C97A');
}

export function PartnerShell({ children }: { children: ReactNode }) {
  const t = useTranslations('partnerConsole');
  const locale = useLocale();
  const pathname = usePathname() || '';
  const [open, setOpen] = useState(false);
  const [partner, setPartner] = useState<PartnerRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/partner/me');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setPartner(data.partner);
          applyBrand(data.partner);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const bare = useMemo(() => {
    return pathname.replace(/^\/(ar|en)/, '') || '/';
  }, [pathname]);

  const homeHref = localePath('/', locale);
  const hasCustomLogo = Boolean(
    partner?.logoUrl && !partner.logoUrl.includes('/images/logos/v2-balanced'),
  );

  const Nav = (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
      {NAV.map((item) => {
        const active =
          item.href === '/partner'
            ? bare === '/partner'
            : bare === item.href || bare.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={localePath(item.href, locale)}
            onClick={() => setOpen(false)}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
              active
                ? 'bg-[color-mix(in_srgb,var(--pc-primary)_18%,transparent)] text-white shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--pc-primary)_35%,transparent)]'
                : 'text-white/55 hover:bg-white/[0.04] hover:text-white/90',
            )}
          >
            <Icon
              size={18}
              className={active ? 'text-[var(--pc-primary)]' : 'text-white/35 group-hover:text-white/70'}
            />
            <span>{t(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );

  const LogoBlock = (
    <Link
      href={homeHref}
      className="block border-b border-white/10 px-4 py-4 transition hover:bg-white/[0.03]"
      aria-label="Muqabaleh"
      onClick={() => setOpen(false)}
    >
      {hasCustomLogo ? (
        <div className="flex items-center gap-3">
          <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/5 md:h-[56px] md:w-[56px]">
            <Image
              src={partner!.logoUrl!}
              alt={partner?.name || 'Partner'}
              fill
              className="object-contain p-1.5"
            />
          </div>
          <BrandLogo size="nav" priority className="min-w-0" />
        </div>
      ) : (
        <BrandLogo size="nav" priority />
      )}
      <div className="mt-2 truncate text-[11px] uppercase tracking-[0.16em] text-white/40">
        {partner?.name || t('sidebarTitle')} · {t('whiteLabelBadge')}
      </div>
    </Link>
  );

  return (
    <div className="pc-shell min-h-screen bg-[var(--pc-bg)] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="pc-orb absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-[var(--pc-primary)]/20 blur-3xl" />
        <div className="pc-orb absolute -right-20 top-40 h-[24rem] w-[24rem] rounded-full bg-[var(--pc-accent)]/15 blur-3xl" />
      </div>

      <aside className="fixed inset-y-0 start-0 z-40 hidden w-[300px] flex-col border-e border-white/10 bg-[#070b12]/90 backdrop-blur-2xl lg:flex">
        {LogoBlock}
        {Nav}
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: localePath('/', locale) })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white"
          >
            <LogOut size={18} />
            {t('signOut')}
          </button>
        </div>
      </aside>

      <div className="lg:ps-[300px]">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-[#070b12]/75 px-4 py-2.5 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-white/10 p-2 text-white/70 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu size={18} />
            </button>
            <Link href={homeHref} className="lg:hidden" aria-label="Muqabaleh">
              <BrandLogo size="nav" />
            </Link>
            <div className="hidden min-w-0 lg:block">
              <div className="truncate text-sm font-semibold text-white/90">
                {partner?.name || t('sidebarTitle')}
              </div>
              <div className="truncate text-xs text-white/40">
                {partner?.customDomain || `${partner?.slug || 'partner'}.muqabaleh.com`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-[color-mix(in_srgb,var(--pc-primary)_40%,transparent)] bg-[color-mix(in_srgb,var(--pc-primary)_12%,transparent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--pc-primary)] sm:inline">
              {partner?.plan || 'GROWTH'}
            </span>
            <Link
              href={localePath('/partner/branding', locale)}
              className="rounded-full bg-[var(--pc-primary)] px-3 py-1.5 text-xs font-bold text-slate-950"
            >
              {t('editBrand')}
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 start-0 flex w-[300px] flex-col bg-[#070b12] shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">{LogoBlock}</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="m-3 rounded-lg p-2 text-white/60"
              >
                <X size={18} />
              </button>
            </div>
            {Nav}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
