import Link from 'next/link';
import { localePath } from '@/i18n/navigation';
import { BrandLogo } from './BrandLogo';
import { C, type Bi } from './copy';

const NAV_LINKS = [
  { bi: C.nav.jeannie, href: '#jeannie' },
  { bi: { en: 'How it works', ar: 'كيف يعمل' } as Bi, href: '#how' },
  { bi: { en: 'Passport', ar: 'الجواز' } as Bi, href: '#passport' },
  { bi: { en: 'Jobs', ar: 'الوظائف' } as Bi, href: '/jobs' },
  { bi: C.nav.pricing, href: '#pricing' },
] as const;

const TEAM_LINKS = [
  { bi: C.hero.forEmployers, href: '/business' },
  { bi: C.hero.forPartners, href: '/partners' },
] as const;

function pick(bi: Bi, locale: string) {
  return locale === 'ar' ? bi.ar : bi.en;
}

function resolveHref(href: string, locale: string) {
  if (href.startsWith('#')) return href;
  return localePath(href, locale);
}

/**
 * Server navbar — no Radix Sheet (that JS was on the mobile critical path).
 * Mobile uses native details/summary.
 */
export function CrystalNavbar({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const homeHref = localePath('/', locale);
  const menuLabel = isAr ? 'القائمة' : 'Menu';

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 pe-20 md:px-5 md:pe-24">
      <nav className="mq-glass-nav mq-wrap mx-auto flex h-[76px] items-center justify-between rounded-2xl px-4 md:h-[84px] md:px-6">
        <Link
          href={homeHref}
          className="relative z-10 flex h-full shrink-0 items-center overflow-visible"
          aria-label="Muqabaleh"
        >
          <BrandLogo size="nav" />
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={resolveHref(link.href, locale)}
              className="text-sm font-medium text-white/60 transition-colors hover:text-teal-300"
            >
              {pick(link.bi, locale)}
            </Link>
          ))}
          <span className="h-4 w-px bg-white/15" aria-hidden />
          {TEAM_LINKS.map((link) => (
            <Link
              key={link.href}
              href={localePath(link.href, locale)}
              className="text-xs font-medium text-white/40 transition-colors hover:text-white/70"
            >
              {pick(link.bi, locale)}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={localePath('/login', locale)}
            className="text-sm font-semibold text-white/65 hover:text-white"
          >
            {pick(C.nav.login, locale)}
          </Link>
          <Link
            href={localePath('/interview/prep', locale)}
            className="mq-btn mq-btn-primary !min-h-[42px] !px-4 !py-2 text-sm"
          >
            {pick(C.nav.getStarted, locale)}
          </Link>
        </div>

        <details className="relative lg:hidden">
          <summary
            className="mq-nav-summary flex cursor-pointer list-none items-center rounded-lg p-2 text-white/80"
            aria-label={menuLabel}
          >
            <span className="sr-only">{menuLabel}</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </summary>
          <div
            className={`absolute top-[calc(100%+8px)] z-50 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-white/10 bg-[#0a1220]/95 p-3 text-white shadow-2xl backdrop-blur-xl ${
              isAr ? 'start-0' : 'end-0'
            }`}
          >
            <div className="flex flex-col gap-1 pb-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={resolveHref(link.href, locale)}
                  className="min-h-[48px] rounded-xl px-3 py-3 text-sm font-semibold text-white hover:bg-white/5"
                >
                  {pick(link.bi, locale)}
                </Link>
              ))}
              <p className="mt-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">
                {isAr ? 'للفرق' : 'For teams'}
              </p>
              {TEAM_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={localePath(link.href, locale)}
                  className="min-h-[48px] rounded-xl px-3 py-3 text-sm font-semibold text-white/70 hover:bg-white/5"
                >
                  {pick(link.bi, locale)}
                </Link>
              ))}
              <hr className="my-2 border-white/10" />
              <Link href={localePath('/login', locale)} className="min-h-[48px] px-3 py-3 text-sm font-semibold">
                {pick(C.nav.login, locale)}
              </Link>
              <Link
                href={localePath('/interview/prep', locale)}
                className="mq-btn mq-btn-primary mt-2 text-center text-sm"
              >
                {pick(C.nav.getStarted, locale)}
              </Link>
            </div>
          </div>
        </details>
      </nav>
    </header>
  );
}
