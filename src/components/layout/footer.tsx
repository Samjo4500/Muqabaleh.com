'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations('landing');
  const tc = useTranslations('common');
  const locale = useLocale();

  const productLinks = [
    { key: 'footerLinkPricing', href: '/pricing' },
    { key: 'footerLinkBusiness', href: '/business' },
    { key: 'footerLinkInterviewers', href: '/interviewers' },
    { key: 'footerLinkJoin', href: '/join-as-interviewer' },
    { key: 'footerLinkVerify', href: '/verify' },
  ];

  const companyLinks = [
    { key: 'footerLinkAbout', href: '/about' },
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
    <footer className="mt-auto border-t border-white/5 bg-[var(--bg-panel)]">
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
                    href={link.href}
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
                    href={link.href}
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
                    href={link.href}
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
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/5 pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-[var(--text-faint)]">
            {tc('madeWithLove')}
          </p>
          <p className="text-xs text-[var(--text-faint)]">
            {t('copyright')}
          </p>
          <Image
            src="/images/logos/v2-balanced-a-T.png"
            alt="مقابلة | Muqabaleh"
            width={100}
            height={28}
            className="h-7 w-auto opacity-50"
          />
        </div>
      </div>
    </footer>
  );
}
