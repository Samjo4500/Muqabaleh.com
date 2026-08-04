'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { getLocaleSwitchPath, localePath } from '@/i18n/navigation';

const NAV_LINKS = [
  { key: 'learners', href: '#learners' },
  { key: 'howItWorks', href: '#how-it-works' },
  { key: 'companies', href: '#companies' },
  { key: 'pricing', href: '#pricing' },
  { key: 'blog', href: '/blog' },
] as const;

export function CrystalNavbar() {
  const t = useTranslations('landing.nav');
  const tLanding = useTranslations('landing');
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchLocale = () => {
    const next = locale === 'ar' ? 'en' : 'ar';
    window.location.href = getLocaleSwitchPath(pathname, locale, next);
  };

  const localeLabel = locale === 'ar' ? 'EN' : 'AR';
  const homeHref = localePath('/', locale);
  const isHome =
    pathname === '/' ||
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    pathname === '/en' ||
    pathname === '/en/';

  const resolveHref = (href: string) => {
    if (href.startsWith('#')) {
      if (!isHome) {
        return `${homeHref === '/' ? '' : homeHref}${href}`;
      }
      return href;
    }
    return localePath(href, locale);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-6">
      <nav
        className={cn(
          'glass mx-auto flex h-[72px] max-w-7xl items-center justify-between rounded-2xl px-4 transition-all duration-300 md:px-6',
          scrolled ? 'bg-[var(--bg-deep)]/70 shadow-[0_8px_30px_rgba(0,0,0,0.35)]' : 'bg-white/[0.03]'
        )}
      >
        <Link
          href={homeHref}
          className="font-display shrink-0 text-lg font-bold tracking-[-0.02em] text-[var(--text-primary)]"
        >
          {tLanding('brand')}
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={resolveHref(link.href)}
              className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              {t(link.key)}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={switchLocale}
            className="glass rounded-full px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)]"
            aria-label={localeLabel}
          >
            {localeLabel}
          </button>
          <Link
            href={localePath('/auth/signin', locale)}
            className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            {t('signIn')}
          </Link>
          <Link href={localePath('/demo', locale)} className="glass-button text-sm !px-4 !py-2">
            {t('startFree')}
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href={localePath('/demo', locale)} className="glass-button text-xs !px-3 !py-1.5">
            {t('startFree')}
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="rounded-lg p-2 text-[var(--text-muted)]"
                aria-label={t('menu')}
              >
                <Menu size={20} strokeWidth={1.75} />
              </button>
            </SheetTrigger>
            <SheetContent
              side={locale === 'ar' ? 'left' : 'right'}
              className="w-72 border-white/10 bg-[var(--bg-deep)]/95 backdrop-blur-xl"
            >
              <SheetHeader>
                <SheetTitle className="font-display text-start text-[var(--text-primary)]">
                  {tLanding('brand')}
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    href={resolveHref(link.href)}
                    onClick={() => setOpen(false)}
                    className="min-h-[44px] rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                  >
                    {t(link.key)}
                  </Link>
                ))}
                <hr className="my-2 border-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    switchLocale();
                    setOpen(false);
                  }}
                  className="glass min-h-[44px] rounded-full px-3 py-2.5 text-sm font-semibold text-[var(--text-secondary)]"
                >
                  {localeLabel}
                </button>
                <Link
                  href={localePath('/auth/signin', locale)}
                  onClick={() => setOpen(false)}
                  className="min-h-[44px] rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)]"
                >
                  {t('signIn')}
                </Link>
                <Link
                  href={localePath('/demo', locale)}
                  onClick={() => setOpen(false)}
                  className="glass-button mt-2 min-h-[44px] text-center text-sm"
                >
                  {t('startFree')}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
