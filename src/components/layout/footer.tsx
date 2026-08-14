'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { SOCIAL_LINKS } from '@/lib/brand/social-links';
import { localePath } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('landing');
  const tc = useTranslations('common');
  const locale = useLocale();

  const productLinks = [
    { key: 'footerLinkPricing', href: '/#pricing' },
    { key: 'footerLinkBusiness', href: '/business' },
    { key: 'footerLinkInterviewers', href: '/interviewers' },
    { key: 'footerLinkJoin', href: '/join-as-interviewer' },
    { key: 'footerLinkVerify', href: '/verify' },
  ];

  const companyLinks = [
    { key: 'footerLinkAbout', href: '/about' },
    { key: 'footerLinkPress', href: '/press' },
    { key: 'footerLinkCompanies', href: '/companies' },
    { key: 'footerLinkDemo', href: '/demo' },
  ];

  const supportLinks = [
    { key: 'footerLinkSupport', href: '/support' },
    { key: 'footerLinkContact', href: '/support#contact' },
  ];

  const legalLinks = [
    { key: 'footerLinkPrivacy', href: '/privacy' },
    { key: 'footerLinkTerms', href: '/terms' },
    { key: 'footerLinkRefund', href: '/refund' },
  ];

  return (
    <footer className="mt-auto border-t border-white/5 bg-[var(--bg-panel)] pb-20 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-[var(--text-primary)]">
              {t('footerProduct')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={localePath(link.href, locale)}
                    className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-[var(--text-primary)]">
              {t('footerCompany')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {companyLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={localePath(link.href, locale)}
                    className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-[var(--text-primary)]">
              {t('footerSupport')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={localePath(link.href, locale)}
                    className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-[var(--text-primary)]">
              {t('footerLegal')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={localePath(link.href, locale)}
                    className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social links + contact */}
        <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/5 pt-8">
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 text-[var(--text-muted)] transition-colors hover:border-gold/30 hover:bg-gold/10 hover:text-gold"
                aria-label={social.name}
              >
                {social.svg}
              </a>
            ))}
          </div>
          <a
            href="mailto:hello@muqabaleh.com"
            className="flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            <Mail size={14} strokeWidth={1.75} />
            hello@muqabaleh.com
          </a>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center gap-4 border-t border-white/5 pt-6 sm:flex-row sm:justify-between">
          <p className="text-sm text-[var(--text-faint)]">
            {tc('madeWithLove')}
          </p>
          <p className="text-xs text-[var(--text-faint)]">
            {t('copyright')}
          </p>
          <BrandLogo size="nav" className="opacity-70" />
        </div>
      </div>
    </footer>
  );
}
