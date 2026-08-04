'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { BiInline, BiText } from './BiText';
import { C } from './copy';

function footerHref(href: string, locale: string) {
  if (href.startsWith('/#')) {
    const hash = href.slice(1); // #services
    const home = localePath('/', locale);
    return home === '/' ? hash : `${home}${hash}`;
  }
  return localePath(href, locale);
}

export function CrystalFooter() {
  const locale = useLocale();

  const col = {
    services: [
      { bi: C.nav.services, href: '/#services' },
      { bi: C.nav.howItWorks, href: '/#how-it-works' },
      { bi: C.nav.pricing, href: '/#pricing' },
      { bi: C.nav.jobs, href: '/jobs' },
    ],
    company: [
      { bi: C.footer.about, href: '/about' },
      { bi: C.nav.forCompanies, href: '/#for-companies' },
      { bi: C.nav.blog, href: '/blog' },
      { bi: C.footer.support, href: '/support' },
    ],
    legal: [
      { bi: C.footer.privacy, href: '/privacy' },
      { bi: C.footer.terms, href: '/terms' },
      { bi: C.footer.refund, href: '/refund' },
    ],
  };

  return (
    <footer className="border-t border-white/10 bg-[var(--bg-deep)]">
      <div className="content-wrap grid gap-10 py-14 md:grid-cols-4">
        <div>
          <p className="font-display mb-3 text-lg font-bold">
            <BiInline bi={C.brand} />
          </p>
          <BiText
            bi={C.footer.tagline}
            primaryClassName="text-sm leading-relaxed text-[var(--text-secondary)]"
          />
        </div>

        {(
          [
            [C.footer.services, col.services],
            [C.footer.company, col.company],
            [C.footer.legal, col.legal],
          ] as const
        ).map(([title, links]) => (
          <div key={title.en}>
            <BiText bi={title} className="mb-4" primaryClassName="text-sm font-semibold" />
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.href + l.bi.en}>
                  <Link
                    href={footerHref(l.href, locale)}
                    className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    <BiInline bi={l.bi} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="content-wrap flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
          <BiText
            bi={C.footer.copyright}
            primaryClassName="text-xs text-[var(--text-muted)]"
          />
          <div className="flex flex-wrap gap-2">
            {['PayPal', 'Visa', 'Mastercard'].map((badge) => (
              <span
                key={badge}
                className="glass rounded-md px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]"
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
