'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ConsoleJobPosting } from '@/lib/console/types';

export default function EditJobPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const id = String(params.id);
  const t = useTranslations('console');
  const [job, setJob] = useState<ConsoleJobPosting | null>(null);
  const [status, setStatus] = useState('OPEN');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/console/${tenantSlug}/jobs/${id}`)
      .then((r) => r.json())
      .then((j) => {
        setJob(j.job || null);
        if (j.job?.status) setStatus(j.job.status);
      });
  }, [tenantSlug, id]);

  const save = async () => {
    const res = await fetch(`/api/console/${tenantSlug}/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.job) {
      setJob(json.job);
      setSaved(true);
    }
  };

  if (!job) return <p className="text-sm text-[var(--c-text-2)]">{t('loading')}</p>;

  const link = `https://muqabaleh.com/interview/${tenantSlug}/${job.interviewSlug}`;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h2 className="mq-console-title text-[1.65rem]">{job.title}</h2>
      <div className="mq-console-surface space-y-3 rounded-xl p-4">
        <p className="break-all text-sm text-[var(--c-text-2)]">{link}</p>
        <label className="block text-sm text-[var(--c-text-2)]">
          Status
          <select
            className="mq-console-input mt-1 w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {['DRAFT', 'OPEN', 'PAUSED', 'CLOSED'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-[var(--c-text-2)]">
          {t('questions')}: {job.questions.length} · {t('maxAttempts')}: {job.maxAttempts}
        </p>
        <button type="button" className="mq-console-btn-primary" onClick={() => void save()}>
          {t('save')}
        </button>
        {saved ? <p className="text-sm text-[#22C55E]">{t('saved')}</p> : null}
      </div>
    </div>
  );
}
