'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { localePath } from '@/i18n/navigation';

type Path = 'seeker' | 'employer' | 'agency' | 'academy';

export default function ConsoleOnboardingPage() {
  const t = useTranslations('console');
  const locale = useLocale();
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const router = useRouter();
  const [path, setPath] = useState<Path | null>(null);
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('11-50');

  const continueFlow = () => {
    if (path === 'employer') {
      router.push(localePath(`/console/${tenantSlug}`, locale));
      return;
    }
    // Phase 1: agency/academy not built yet
  };

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[var(--c-text)]">{t('onboardingTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('onboardingAsk')}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {(
          [
            ['seeker', t('pathSeeker')],
            ['employer', t('pathEmployer')],
            ['agency', t('pathAgency')],
            ['academy', t('pathAcademy')],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setPath(key)}
            className={`mq-console-card p-4 text-start text-sm font-semibold ${
              path === key ? 'ring-2 ring-[var(--c-primary)]' : ''
            }`}
          >
            {label}
            {key !== 'employer' && key !== 'seeker' ? (
              <span className="mt-1 block text-xs font-normal text-[var(--c-text-2)]">
                {t('phase2Later')}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {path === 'employer' ? (
        <div className="mq-console-surface space-y-3 rounded-xl p-4">
          <input
            className="mq-console-input w-full"
            placeholder={t('company')}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <input
            className="mq-console-input w-full"
            placeholder={t('industry')}
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
          <select
            className="mq-console-input w-full"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            {['1-10', '11-50', '51-200', '201-1000', '1000+'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button type="button" className="mq-console-btn-primary w-full" onClick={continueFlow}>
            {t('enterConsole')}
          </button>
        </div>
      ) : null}

      {path === 'seeker' ? (
        <a href={localePath('/app', locale)} className="mq-console-btn-primary inline-flex">
          {t('goSeeker')}
        </a>
      ) : null}

      {path === 'agency' || path === 'academy' ? (
        <p className="text-sm text-[var(--c-text-2)]">{t('phase2Later')}</p>
      ) : null}
    </div>
  );
}
