'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AtelierFlowShell } from '@/components/landing/crystal/AtelierFlowShell';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';
import type { PrepSelections } from '@/lib/coach/types';

const STORAGE_KEY = 'mq_coach_prep';

export function ArabicSmokeTestClient({
  locale,
  language,
  roleId,
}: {
  locale: string;
  language: PrepSelections['language'];
  roleId: string;
}) {
  const router = useRouter();
  const isAr = locale === 'ar' || language === 'ar';
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/interview/coach/config');
        const cfg = (await res.json()) as {
          roles?: { id: string; industries?: string[] }[];
          industries?: { id: string }[];
          seniority?: { id: string }[];
          storageKey?: string;
        };
        const role =
          cfg.roles?.find((r) => r.id === roleId) ||
          cfg.roles?.find((r) => r.id.includes('software')) ||
          cfg.roles?.[0];
        if (!role) throw new Error('role_missing');
        const prep: PrepSelections = {
          role: role.id,
          industry: role.industries?.[0] || cfg.industries?.[0]?.id || 'tech-saas',
          seniority: cfg.seniority?.find((s) => s.id === 'mid')?.id || 'mid',
          language,
          coachGender: 'female',
          companyName: language === 'ar' ? 'شركة تجريبية' : 'Smoke Test Co',
        };
        sessionStorage.setItem(cfg.storageKey || STORAGE_KEY, JSON.stringify(prep));
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) {
          setError(
            isAr
              ? 'تعذّر تجهيز اختبار العربية.'
              : 'Could not prepare the Arabic smoke test.',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAr, language, roleId]);

  return (
    <AtelierFlowShell>
      <div
        className="mq-wrap py-12"
        dir={isAr ? 'rtl' : 'ltr'}
        lang={isAr ? 'ar' : 'en'}
      >
        <Link href={localePath('/', locale)} aria-label="Muqabaleh">
          <BrandLogo size="nav" />
        </Link>
        <h1 className="mq-display mt-8 text-3xl font-bold text-white">
          {isAr ? 'اختبار عربي سريع لجيني' : 'Jeannie Arabic smoke test'}
        </h1>
        <p className="mt-2 max-w-xl text-white/60">
          {isAr
            ? 'يجهّز جلسة عربية بالدور المحدد ثم ينقلك إلى المقابلة. تحقق من الأسئلة، الميكروفون، الردود، والجواز.'
            : 'Preloads an Arabic session for the selected role, then opens the interview. Check questions, mic, replies, and passport.'}
        </p>
        <ul className="mt-6 space-y-2 text-sm text-white/70">
          <li>• lang={language}</li>
          <li>• role={roleId}</li>
          <li>• STT: Google ar-SA / en-US</li>
        </ul>
        {error ? <p className="mt-4 text-rose-300">{error}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!ready}
            className="mq-btn mq-btn-primary disabled:opacity-50"
            onClick={() => router.push(localePath('/interview/session', locale))}
          >
            {isAr ? 'ابدأ الاختبار الآن' : 'Start smoke test'}
          </button>
          <Link href={localePath('/interview/prep', locale)} className="mq-btn mq-btn-ghost">
            {isAr ? 'نموذج الإعداد الكامل' : 'Full prep form'}
          </Link>
        </div>
      </div>
    </AtelierFlowShell>
  );
}
