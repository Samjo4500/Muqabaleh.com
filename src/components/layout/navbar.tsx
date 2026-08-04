'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { getLocaleSwitchPath } from '@/i18n/navigation';

const NAV_LINKS = [
  { key: 'why', href: '#learners' },
  { key: 'how', href: '#how-it-works' },
  { key: 'interviewers', href: '#companies' },
  { key: 'pricing', href: '#pricing' },
  { key: 'blog', href: '/blog' },
] as const;

export function Navbar() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const tCrystal = useTranslations('crystal');
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
    const newPath = getLocaleSwitchPath(pathname, locale, next);
    window.location.href = newPath;
  };

  const localeLabel = locale === 'ar' ? 'EN' : 'AR';
  const isHome =
    pathname === '/' ||
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    pathname === '/en' ||
    pathname === '/en/';

  const resolveHref = (href: string) => {
    if (href.startsWith('#') && !isHome) {
      return locale === 'ar' ? `/${href}` : `/${locale}${href}`;
    }
    return href;
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/10 bg-[var(--bg-deep)]/60 backdrop-blur-xl'
          : 'bg-transparent'
      )}
    >
      <nav className="content-wrap flex h-[72px] items-center justify-between">
        <Link
          href="/"
          className="font-display shrink-0 text-lg font-bold tracking-[-0.02em] text-[var(--text-primary)]"
        >
          {tCrystal('brand')}
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
            onClick={switchLocale}
            className="glass rounded-full px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-white/20 hover:text-[var(--text-primary)]"
            aria-label={localeLabel}
          >
            {localeLabel}
          </button>
          <Link
            href="/auth/signin"
            className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            {tc('login')}
          </Link>
          <Link href="/assessment" className="glass-button text-sm !px-4 !py-2">
            {tc('startFree')}
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/assessment" className="glass-button text-xs !px-3 !py-1.5">
            {tc('startFree')}
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="flex items-center justify-center rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label={tCrystal('menu')}
              >
                <Menu size={20} strokeWidth={1.75} />
              </button>
            </SheetTrigger>
            <SheetContent
              side={locale === 'ar' ? 'left' : 'right'}
              className="w-72 border-white/10 bg-[var(--bg-deep)]/95 backdrop-blur-xl"
            >
              <SheetHeader>
                <SheetTitle className="font-display ms-2 text-start text-[var(--text-primary)]">
                  {tCrystal('brand')}
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    href={resolveHref(link.href)}
                    onClick={() => setOpen(false)}
                    className="min-h-[44px] rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
                  >
                    {t(link.key)}
                  </Link>
                ))}
                <hr className="my-2 border-white/10" />
                <button
                  onClick={() => {
                    switchLocale();
                    setOpen(false);
                  }}
                  className="glass min-h-[44px] rounded-full px-3 py-2.5 text-sm font-semibold text-[var(--text-secondary)]"
                >
                  {localeLabel}
                </button>
                <Link
                  href="/auth/signin"
                  onClick={() => setOpen(false)}
                  className="min-h-[44px] rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
                >
                  {tc('login')}
                </Link>
                <Link
                  href="/assessment"
                  onClick={() => setOpen(false)}
                  className="glass-button mt-2 min-h-[44px] text-center text-sm"
                >
                  {tc('startFree')}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
