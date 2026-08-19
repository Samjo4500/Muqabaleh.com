import Link from 'next/link';
import { localePath } from '@/i18n/navigation';
import { SOCIAL_LINKS } from '@/lib/brand/social-links';
import { C, type Bi } from './copy';
import { BrandLogo } from './BrandLogo';

function pick(bi: Bi, locale: string) {
  return locale === 'ar' ? bi.ar : bi.en;
}

function footerHref(href: string, locale: string) {
  if (href.startsWith('/#')) {
    const hash = href.slice(1);
    const home = localePath('/', locale);
    return home === '/' ? hash : `${home}${hash}`;
  }
  if (href.startsWith('mailto:') || href.startsWith('http')) return href;
  return localePath(href, locale);
}

const COLS = {
  product: [
    { bi: C.nav.howItWorks, href: '/#jeannie' },
    { bi: C.nav.jeannie, href: '/#jeannie' },
    { bi: C.footer.practice, href: '/interview/prequal' },
    { bi: { en: 'Student 100', ar: 'باقة الطلاب 100' }, href: '/student100' },
    { bi: C.nav.pricing, href: '/#pricing' },
    { bi: C.footer.howScores, href: '/how-scores-work' },
    { bi: C.footer.verify, href: '/verify' },
  ],
  company: [
    { bi: C.footer.about, href: '/about' },
    { bi: { en: 'Company profile', ar: 'ملف الشركة' }, href: '/company-profile' },
    { bi: C.nav.forCompanies, href: '/business' },
    { bi: C.nav.partners, href: '/partners' },
    { bi: C.nav.blog, href: '/blog' },
  ],
  support: [
    { bi: C.footer.support, href: '/support' },
    { bi: C.footer.contact, href: '/support#contact' },
    { bi: C.footer.faq, href: '/#faq' },
  ],
  legal: [
    { bi: C.footer.privacy, href: '/privacy' },
    { bi: C.footer.terms, href: '/terms' },
    { bi: C.footer.refund, href: '/refund' },
  ],
} as const;

/** Server footer for the homepage — no next-intl client hook. */
export function HomeFooter({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const lang = isAr ? 'ar' : 'en';

  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mq-wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="mb-4">
            <Link href={localePath('/', locale)} aria-label="Muqabaleh" className="inline-flex">
              <BrandLogo size="nav" loading="lazy" />
            </Link>
          </div>
          <p className="mb-5 text-sm leading-relaxed text-white/55" dir={dir} lang={lang}>
            {pick(C.footer.tagline, locale)}
          </p>
          <a
            href="mailto:info@muqabaleh.com"
            className="mb-4 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-teal-300"
          >
            {pick(C.footer.email, locale)}
          </a>
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/45 transition-colors hover:border-teal-300/35 hover:text-teal-200"
                aria-label={social.name}
              >
                {social.svg}
              </a>
            ))}
          </div>
        </div>

        {(
          [
            [C.footer.product, COLS.product],
            [C.footer.company, COLS.company],
            [C.footer.supportCol, COLS.support],
            [C.footer.legal, COLS.legal],
          ] as const
        ).map(([title, links]) => (
          <div key={title.en}>
            <p className="mb-4 text-sm font-bold text-white" dir={dir} lang={lang}>
              {pick(title, locale)}
            </p>
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.href + l.bi.en}>
                  <Link
                    href={footerHref(l.href, locale)}
                    className="text-sm text-white/45 transition-colors hover:text-teal-300"
                  >
                    {pick(l.bi, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mq-wrap flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
          <p className="text-xs text-white/40" dir={dir} lang={lang}>
            {pick(C.footer.copyright, locale)}
          </p>
          <div className="flex flex-wrap gap-2">
            {['PayPal', 'Visa', 'Mastercard'].map((badge) => (
              <span
                key={badge}
                className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/45 backdrop-blur-md"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
