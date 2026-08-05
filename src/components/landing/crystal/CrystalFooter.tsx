'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { BrandLogo } from './BrandLogo';
import { BiInline, T } from './BiText';
import { C } from './copy';

function footerHref(href: string, locale: string) {
  if (href.startsWith('/#')) {
    const hash = href.slice(1);
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
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mq-wrap grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <BrandLogo size="md" />
            <p className="mq-display text-xl font-bold text-white">
              <BiInline bi={C.brand} />
            </p>
          </div>
          <T bi={C.footer.tagline} className="text-sm leading-relaxed text-white/55" />
        </div>

        {(
          [
            [C.footer.services, col.services],
            [C.footer.company, col.company],
            [C.footer.legal, col.legal],
          ] as const
        ).map(([title, links]) => (
          <div key={title.en}>
            <T bi={title} className="mb-4 text-sm font-bold text-white" />
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.href + l.bi.en}>
                  <Link
                    href={footerHref(l.href, locale)}
                    className="text-sm text-white/45 transition-colors hover:text-teal-300"
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
        <div className="mq-wrap flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
          <T bi={C.footer.copyright} className="text-xs text-white/40" />
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
