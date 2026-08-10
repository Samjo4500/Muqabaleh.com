'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Mail } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { BrandLogo } from './BrandLogo';
import { NewsletterCapture } from '@/components/marketing/NewsletterCapture';
import { BiInline, T } from './BiText';
import { C } from './copy';

const SOCIAL_LINKS = [
  {
    name: 'X (Twitter)',
    href: 'https://x.com/muqabaleh',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/muqabaleh',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/muqabaleh',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/muqabaleh',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

function footerHref(href: string, locale: string) {
  if (href.startsWith('/#')) {
    const hash = href.slice(1);
    const home = localePath('/', locale);
    return home === '/' ? hash : `${home}${hash}`;
  }
  if (href.startsWith('mailto:') || href.startsWith('http')) return href;
  return localePath(href, locale);
}

export function CrystalFooter() {
  const locale = useLocale();

  const col = {
    product: [
      { bi: C.nav.howItWorks, href: '/#jeannie-magic' },
      { bi: C.nav.jeannie, href: '/#jeannie' },
      { bi: C.footer.practice, href: '/interview/prequal' },
      { bi: C.nav.pricing, href: '/#pricing' },
      { bi: C.footer.verify, href: '/verify' },
    ],
    company: [
      { bi: C.footer.about, href: '/about' },
      { bi: C.nav.forCompanies, href: '/business' },
      { bi: C.nav.partners, href: '/partners' },
      { bi: C.nav.blog, href: '/blog' },
      { bi: C.footer.requestDemo, href: '/request-demo?from=footer' },
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
  };

  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mq-wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="mb-4">
            <Link href={localePath('/', locale)} aria-label="Muqabaleh" className="inline-flex">
              <BrandLogo size="md" />
            </Link>
          </div>
          <T bi={C.footer.tagline} className="mb-5 text-sm leading-relaxed text-white/55" />
          <a
            href="mailto:hello@muqabaleh.com"
            className="mb-4 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-teal-300"
          >
            <Mail size={14} strokeWidth={1.75} />
            <BiInline bi={C.footer.email} />
          </a>
          <div className="mb-5 flex items-center gap-2">
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
          <NewsletterCapture variant="footer" />
        </div>

        {(
          [
            [C.footer.product, col.product],
            [C.footer.company, col.company],
            [C.footer.supportCol, col.support],
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
