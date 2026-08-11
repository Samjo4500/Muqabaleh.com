'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ROLE_BANK, defaultQuestionsForRole } from '@/lib/console/defaults';
import { localePath } from '@/i18n/navigation';
import type { InterviewQuestion } from '@/lib/console/types';

export default function NewJobPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const locale = useLocale();
  const router = useRouter();
  const [roleKey, setRoleKey] = useState(ROLE_BANK[0].key);
  const [title, setTitle] = useState(ROLE_BANK[0].en);
  const [titleAr, setTitleAr] = useState(ROLE_BANK[0].ar);
  const [difficulty, setDifficulty] = useState('MID');
  const [language, setLanguage] = useState('MIXED');
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [expiresAt, setExpiresAt] = useState('');
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [questions, setQuestions] = useState<InterviewQuestion[]>(
    defaultQuestionsForRole(ROLE_BANK[0].key),
  );
  const [saving, setSaving] = useState(false);

  const onRole = (key: string) => {
    setRoleKey(key);
    const role = ROLE_BANK.find((r) => r.key === key);
    if (role) {
      setTitle(role.en);
      setTitleAr(role.ar);
      setQuestions(defaultQuestionsForRole(key));
    }
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/console/${tenantSlug}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        titleAr,
        roleKey,
        difficulty,
        language,
        maxAttempts,
        expiresAt: expiresAt || null,
        questions,
        branding: { welcomeMsg: welcomeMsg || null },
        status: 'OPEN',
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.job?.id) {
      router.push(localePath(`/console/${tenantSlug}/jobs`, locale));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[var(--c-text)]">{t('jobBuilder')}</h2>
        <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('jobsHint')}</p>
      </div>

      <div className="mq-console-surface space-y-4 rounded-xl p-4">
        <label className="block text-sm text-[var(--c-text-2)]">
          {t('roleSelector')}
          <select
            className="mq-console-input mt-1 w-full"
            value={roleKey}
            onChange={(e) => onRole(e.target.value)}
          >
            {ROLE_BANK.map((r) => (
              <option key={r.key} value={r.key}>
                {locale === 'ar' ? r.ar : r.en}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-[var(--c-text-2)]">
            Title (EN)
            <input className="mq-console-input mt-1 w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block text-sm text-[var(--c-text-2)]">
            العنوان (AR)
            <input className="mq-console-input mt-1 w-full" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm text-[var(--c-text-2)]">
            {t('difficulty')}
            <select className="mq-console-input mt-1 w-full" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-[var(--c-text-2)]">
            {t('languageLock')}
            <select className="mq-console-input mt-1 w-full" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="AR">AR</option>
              <option value="EN">EN</option>
              <option value="MIXED">Mixed</option>
            </select>
          </label>
          <label className="block text-sm text-[var(--c-text-2)]">
            {t('maxAttempts')}
            <input
              type="number"
              min={1}
              max={10}
              className="mq-console-input mt-1 w-full"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
            />
          </label>
        </div>

        <label className="block text-sm text-[var(--c-text-2)]">
          {t('expiry')}
          <input
            type="date"
            className="mq-console-input mt-1 w-full"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </label>

        <label className="block text-sm text-[var(--c-text-2)]">
          {t('welcomeMsg')}
          <textarea
            className="mq-console-input mt-1 min-h-[80px] w-full"
            value={welcomeMsg}
            onChange={(e) => setWelcomeMsg(e.target.value)}
          />
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--c-text)]">{t('questions')}</p>
            <button
              type="button"
              className="mq-console-btn-ghost text-sm"
              onClick={() =>
                setQuestions((q) => [
                  ...q,
                  { id: `q-${Date.now()}`, text: 'New question', textAr: 'سؤال جديد' },
                ])
              }
            >
              {t('addQuestion')}
            </button>
          </div>
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div key={q.id} className="rounded-lg border border-[var(--c-border)] p-3">
                <input
                  className="mq-console-input w-full"
                  value={q.text}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, text: e.target.value } : x)),
                    )
                  }
                />
                <input
                  className="mq-console-input mt-2 w-full"
                  value={q.textAr || ''}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, textAr: e.target.value } : x)),
                    )
                  }
                />
                <button
                  type="button"
                  className="mt-2 text-xs text-[#EF4444]"
                  onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== idx))}
                >
                  {t('delete')}
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="mq-console-btn-primary w-full"
        >
          {saving ? t('loading') : t('createJob')}
        </button>
      </div>
    </div>
  );
}
