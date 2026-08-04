'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { getLocaleSwitchPath } from '@/i18n/navigation';

export function CrystalFooter() {
  const t = useTranslations('crystal');
  const locale = useLocale();
  const pathname = usePathname();

  const columns = [
    {
      title: t('footerProduct'),
      links: [
        { label: t('footerPricing'), href: '#pricing' },
        { label: t('footerDemo'), href: '/demo' },
        { label: t('footerBusiness'), href: '/business' },
        { label: t('footerInterviewers'), href: '/interviewers' },
      ],
    },
    {
      title: t('footerResources'),
      links: [
        { label: t('footerBlog'), href: '/blog' },
        { label: t('footerSupport'), href: '/support' },
        { label: t('footerDemo'), href: '/demo' },
      ],
    },
    {
      title: t('footerCompany'),
      links: [
        { label: t('footerAbout'), href: '/about' },
        { label: t('footerContact'), href: '/support#contact' },
      ],
    },
    {
      title: t('footerLegal'),
      links: [
        { label: t('footerPrivacy'), href: '/privacy' },
        { label: t('footerTerms'), href: '/terms' },
        { label: t('footerRefund'), href: '/refund' },
      ],
    },
  ];

  const switchLocale = () => {
    const next = locale === 'ar' ? 'en' : 'ar';
    window.location.href = getLocaleSwitchPath(pathname, locale, next);
  };

  return (
    <footer className="border-t border-white/5 bg-black/40 backdrop-blur-lg">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/images/logos/v2-balanced-a-T.webp"
              alt={t('brand')}
              width={140}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={switchLocale}
            className="glass rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-[var(--text-secondary)] transition hover:border-white/20"
          >
            {t('footerLang')}: {locale === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
          <p className="text-xs text-[var(--text-faint)]">{t('footerRights')}</p>
          <div className="flex gap-2">
            {['X', 'in', 'IG'].map((s) => (
              <span
                key={s}
                className="glass flex h-9 w-9 items-center justify-center rounded-full text-xs text-[var(--text-muted)] transition hover:text-[var(--text-primary)] hover:shadow-[0_0_16px_rgba(99,102,241,0.35)]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
