'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { getLocaleSwitchPath } from '@/i18n/navigation';

export function CrystalFooter() {
  const t = useTranslations('landing.footer');
  const tLanding = useTranslations('landing');
  const locale = useLocale();
  const pathname = usePathname();

  const columns = [
    {
      title: t('product'),
      links: [
        { label: t('pricing'), href: '#pricing' },
        { label: t('demo'), href: '/demo' },
        { label: t('business'), href: '/business' },
      ],
    },
    {
      title: t('resources'),
      links: [
        { label: t('blog'), href: '/blog' },
        { label: t('support'), href: '/support' },
        { label: t('demo'), href: '/demo' },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: t('about'), href: '/about' },
        { label: t('support'), href: '/support#contact' },
      ],
    },
    {
      title: t('legal'),
      links: [
        { label: t('privacy'), href: '/privacy' },
        { label: t('terms'), href: '/terms' },
        { label: t('refund'), href: '/refund' },
      ],
    },
  ];

  const switchLocale = () => {
    const next = locale === 'ar' ? 'en' : 'ar';
    window.location.href = getLocaleSwitchPath(pathname, locale, next);
  };

  return (
    <footer className="border-t border-white/5 bg-black/40 backdrop-blur-lg">
      <div className="content-wrap py-12">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="font-display text-lg font-bold tracking-[-0.02em] text-[var(--text-primary)]">
              {tLanding('brand')}
            </Link>
            <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">{t('tagline')}</p>
          </div>
          <button
            type="button"
            onClick={switchLocale}
            className="glass rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-[var(--text-secondary)] transition hover:border-white/20"
          >
            {t('language')}: {locale === 'ar' ? 'EN' : 'AR'}
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
          <p className="text-xs text-[var(--text-muted)]">{t('copyright')}</p>
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
