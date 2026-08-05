'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
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
    <footer className="border-t border-[var(--mq-line)] bg-white/50">
      <div className="mq-wrap grid gap-10 py-14 md:grid-cols-4">
        <div>
          <p className="mq-display mb-3 text-xl font-bold">
            <BiInline bi={C.brand} />
          </p>
          <T bi={C.footer.tagline} className="text-sm leading-relaxed text-[var(--mq-ink-soft)]" />
        </div>

        {(
          [
            [C.footer.services, col.services],
            [C.footer.company, col.company],
            [C.footer.legal, col.legal],
          ] as const
        ).map(([title, links]) => (
          <div key={title.en}>
            <T bi={title} className="mb-4 text-sm font-bold" />
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.href + l.bi.en}>
                  <Link
                    href={footerHref(l.href, locale)}
                    className="text-sm text-[var(--mq-mute)] transition-colors hover:text-[var(--mq-accent)]"
                  >
                    <BiInline bi={l.bi} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--mq-line)]">
        <div className="mq-wrap flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
          <T bi={C.footer.copyright} className="text-xs text-[var(--mq-mute)]" />
          <div className="flex flex-wrap gap-2">
            {['PayPal', 'Visa', 'Mastercard'].map((badge) => (
              <span
                key={badge}
                className="rounded-md border border-[var(--mq-line)] bg-white px-2.5 py-1 text-[11px] font-medium text-[var(--mq-mute)]"
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
