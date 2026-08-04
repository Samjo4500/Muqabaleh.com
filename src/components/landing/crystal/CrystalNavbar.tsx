'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { localePath } from '@/i18n/navigation';
import { BiInline, BiText } from './BiText';
import { C } from './copy';

const NAV_LINKS = [
  { bi: C.nav.services, href: '#services' },
  { bi: C.nav.howItWorks, href: '#how-it-works' },
  { bi: C.nav.forCompanies, href: '#for-companies' },
  { bi: C.nav.pricing, href: '#pricing' },
  { bi: C.nav.jobs, href: '/jobs' },
  { bi: C.nav.blog, href: '/blog' },
] as const;

export function CrystalNavbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        const base = homeHref === '/' ? '' : homeHref;
        return `${base}${href}`;
      }
      return href;
    }
    return localePath(href, locale);
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3 md:px-6">
      <nav
        className={cn(
          'glass mx-auto flex h-[72px] max-w-7xl items-center justify-between rounded-2xl px-4 transition-all duration-300 md:px-6',
          scrolled
            ? 'bg-[var(--bg-deep)]/85 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl'
            : 'bg-white/[0.03]',
        )}
      >
        <Link
          href={homeHref}
          className="font-display shrink-0 text-xl font-bold tracking-[-0.02em] text-[var(--text-primary)]"
        >
          <BiInline bi={C.brand} />
        </Link>

        <div className="hidden items-center gap-5 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={resolveHref(link.href)}
              className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <BiInline bi={link.bi} />
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={localePath('/login', locale)}
            className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            <BiInline bi={C.nav.login} />
          </Link>
          <Link href={localePath('/register', locale)} className="glass-button text-sm !px-4 !py-2">
            <BiInline bi={C.nav.getStarted} />
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" className="rounded-lg p-2 text-[var(--text-muted)]" aria-label="Menu">
                <Menu size={20} strokeWidth={1.75} />
              </button>
            </SheetTrigger>
            <SheetContent
              side={locale === 'ar' ? 'left' : 'right'}
              className="w-80 border-white/10 bg-[var(--bg-deep)]/95 backdrop-blur-xl"
            >
              <SheetHeader>
                <SheetTitle className="font-display text-start text-[var(--text-primary)]">
                  <BiInline bi={C.brand} />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-2 pb-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={resolveHref(link.href)}
                    onClick={() => setOpen(false)}
                    className="min-h-[48px] rounded-lg px-3 py-2.5 hover:bg-white/5"
                  >
                    <BiText bi={link.bi} primaryClassName="text-sm font-medium" />
                  </Link>
                ))}
                <hr className="my-2 border-white/10" />
                <Link
                  href={localePath('/login', locale)}
                  onClick={() => setOpen(false)}
                  className="min-h-[48px] rounded-lg px-3 py-2.5"
                >
                  <BiText bi={C.nav.login} primaryClassName="text-sm font-medium" />
                </Link>
                <Link
                  href={localePath('/register', locale)}
                  onClick={() => setOpen(false)}
                  className="glass-button mt-2 min-h-[48px] text-center text-sm"
                >
                  <BiInline bi={C.nav.getStarted} />
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
