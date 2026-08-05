'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
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
    const onScroll = () => setScrolled(window.scrollY > 20);
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
    <header className="sticky top-0 z-50 w-full px-3 pt-3 md:px-5">
      <nav
        className={cn(
          'mq-wrap mx-auto flex h-[68px] items-center justify-between rounded-2xl px-4 transition-all duration-300 md:px-6',
          scrolled
            ? 'border border-[rgba(16,35,58,0.1)] bg-white/90 shadow-[0_10px_40px_rgba(16,35,58,0.08)] backdrop-blur-xl'
            : 'border border-transparent bg-white/40 backdrop-blur-md',
        )}
      >
        <Link href={homeHref} className="mq-display text-xl font-bold tracking-tight text-[var(--mq-ink)] md:text-2xl">
          <BiInline bi={C.brand} />
        </Link>

        <div className="hidden items-center gap-6 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={resolveHref(link.href)}
              className="text-sm font-medium text-[var(--mq-ink-soft)] transition-colors hover:text-[var(--mq-accent)]"
            >
              <BiInline bi={link.bi} />
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={localePath('/login', locale)}
            className="text-sm font-semibold text-[var(--mq-ink-soft)] hover:text-[var(--mq-ink)]"
          >
            <BiInline bi={C.nav.login} />
          </Link>
          <Link href={localePath('/register', locale)} className="mq-btn mq-btn-primary !min-h-[42px] !px-4 !py-2 text-sm">
            <BiInline bi={C.nav.getStarted} />
          </Link>
        </div>

        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" className="rounded-lg p-2 text-[var(--mq-ink)]" aria-label="Menu">
                <Menu size={22} strokeWidth={1.75} />
              </button>
            </SheetTrigger>
            <SheetContent
              side={locale === 'ar' ? 'left' : 'right'}
              className="w-80 border-[var(--mq-line)] bg-[var(--mq-paper)] text-[var(--mq-ink)]"
            >
              <SheetHeader>
                <SheetTitle className="mq-display text-start text-[var(--mq-ink)]">
                  <BiInline bi={C.brand} />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-2 pb-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={resolveHref(link.href)}
                    onClick={() => setOpen(false)}
                    className="min-h-[48px] rounded-xl px-3 py-3 text-[var(--mq-ink)] hover:bg-white"
                  >
                    <T bi={link.bi} className="text-sm font-semibold" />
                  </Link>
                ))}
                <hr className="my-2 border-[var(--mq-line)]" />
                <Link href={localePath('/login', locale)} onClick={() => setOpen(false)} className="min-h-[48px] px-3 py-3">
                  <T bi={C.nav.login} className="text-sm font-semibold" />
                </Link>
                <Link
                  href={localePath('/register', locale)}
                  onClick={() => setOpen(false)}
                  className="mq-btn mq-btn-primary mt-2 text-center text-sm"
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
