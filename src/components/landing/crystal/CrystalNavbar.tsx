'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { localePath } from '@/i18n/navigation';
import { BrandLogo } from './BrandLogo';
import { BiInline, T } from './BiText';
import { C } from './copy';

/** Product story first; Pricing always last before auth CTAs. */
const NAV_LINKS = [
  { bi: C.nav.howItWorks, href: '#jeannie-magic' },
  { bi: C.nav.jeannie, href: '#jeannie' },
  { bi: C.nav.forCompanies, href: '/business' },
  { bi: C.nav.partners, href: '/partners' },
  { bi: C.nav.pricing, href: '#pricing' },
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
    <header className="sticky top-0 z-50 w-full px-3 pt-3 pe-20 md:px-5 md:pe-24">
      <nav
        className={cn(
          'mq-glass-nav mq-wrap mx-auto flex h-[68px] items-center justify-between rounded-2xl px-4 transition-all duration-300 md:px-6',
          scrolled && 'border-white/20 bg-[rgba(8,12,22,0.78)] shadow-[0_16px_50px_rgba(0,0,0,0.45)]',
        )}
      >
        <Link
          href={homeHref}
          className="relative z-10 flex h-full shrink-0 items-center overflow-visible"
          aria-label="Muqabaleh"
        >
          <BrandLogo size="nav" priority />
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={resolveHref(link.href)}
              className="text-sm font-medium text-white/60 transition-colors hover:text-teal-300"
            >
              <BiInline bi={link.bi} />
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={localePath('/login', locale)}
            className="text-sm font-semibold text-white/65 hover:text-white"
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
              <button type="button" className="rounded-lg p-2 text-white/80" aria-label="Menu">
                <Menu size={22} strokeWidth={1.75} />
              </button>
            </SheetTrigger>
            <SheetContent
              side={locale === 'ar' ? 'left' : 'right'}
              className="w-80 border-white/10 bg-[#0a1220]/95 text-white backdrop-blur-xl"
            >
              <SheetHeader>
                <SheetTitle className="text-start">
                  <Link
                    href={localePath('/', locale)}
                    aria-label="Muqabaleh"
                    onClick={() => setOpen(false)}
                    className="inline-flex"
                  >
                    <BrandLogo size="nav" />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-2 pb-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={resolveHref(link.href)}
                    onClick={() => setOpen(false)}
                    className="min-h-[48px] rounded-xl px-3 py-3 text-white hover:bg-white/5"
                  >
                    <T bi={link.bi} className="text-sm font-semibold" />
                  </Link>
                ))}
                <hr className="my-2 border-white/10" />
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
