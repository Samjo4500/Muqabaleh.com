'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Download, QrCode, Share2 } from 'lucide-react';
import { ScoreRing } from '@/components/console/score-ring';
import { CompetencyRadar } from '@/components/console/competency-radar';
import type { ConsolePassport } from '@/lib/console/types';

export default function PassportViewerPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const id = String(params.id);
  const t = useTranslations('console');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [passport, setPassport] = useState<ConsolePassport | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    const res = await fetch(`/api/console/${tenantSlug}/passports/${id}`);
    const json = await res.json();
    setPassport(json.passport || null);
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug, id]);

  const submitNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    await fetch(`/api/console/${tenantSlug}/passports/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    setNote('');
    await reload();
    setSaving(false);
  };

  if (!passport) {
    return <p className="text-sm text-[var(--c-text-2)]">{t('loading')}</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[55%_1fr]">
      <section className="mq-console-surface rounded-xl p-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <ScoreRing score={passport.score} grade={passport.grade} />
          <div className="min-w-0 flex-1 text-center sm:text-start">
            <h2 className="mq-console-title text-[1.65rem]">{passport.candidateName}</h2>
            <p className="text-sm text-[var(--c-text-2)]">
              {isAr ? passport.roleAr || passport.role : passport.role}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <a
                href={passport.verifyUrl}
                target="_blank"
                rel="noreferrer"
                className="mq-console-btn-ghost inline-flex items-center gap-2 text-sm"
              >
                <QrCode size={14} />
                {t('verifyQr')}
              </a>
              <button type="button" className="mq-console-btn-ghost inline-flex items-center gap-2 text-sm">
                <Download size={14} />
                {t('download')}
              </button>
              <button type="button" className="mq-console-btn-ghost inline-flex items-center gap-2 text-sm">
                <Share2 size={14} />
                {t('share')}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {passport.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[var(--c-primary-soft)] px-2 py-0.5 text-xs text-[var(--c-primary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="mq-console-surface rounded-xl p-4">
          <h3 className="mb-2 text-sm font-medium text-[var(--c-text)]">{t('radar')}</h3>
          <CompetencyRadar data={passport.competencies} />
        </div>

        <div className="mq-console-surface rounded-xl p-4">
          <h3 className="mb-2 text-sm font-medium text-[var(--c-text)]">{t('aiInsights')}</h3>
          <p className="text-sm text-[var(--c-text)]">
            {isAr ? passport.insights.summaryAr : passport.insights.summary}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-[#22C55E]">{t('greenFlags')}</p>
              <ul className="mt-1 space-y-1 text-sm text-[var(--c-text-2)]">
                {(isAr ? passport.insights.greenFlagsAr : passport.insights.greenFlags).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-[#EF4444]">{t('redFlags')}</p>
              <ul className="mt-1 space-y-1 text-sm text-[var(--c-text-2)]">
                {(isAr ? passport.insights.redFlagsAr : passport.insights.redFlags).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
                {!(isAr ? passport.insights.redFlagsAr : passport.insights.redFlags).length ? (
                  <li>—</li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mq-console-surface rounded-xl p-4 lg:col-span-2">
        <h3 className="mb-3 text-sm font-medium text-[var(--c-text)]">{t('transcript')}</h3>
        <div className="space-y-3">
          {passport.transcript.map((row, i) => (
            <div key={i} className="rounded-lg border border-[var(--c-border)] p-3">
              <p className="text-xs font-medium text-[var(--c-primary)]">
                Q: {isAr ? row.qAr || row.q : row.q}
              </p>
              <p className="mt-1 text-sm text-[var(--c-text)]">
                A: {isAr ? row.aAr || row.a : row.a}
              </p>
            </div>
          ))}
          {!passport.transcript.length ? (
            <p className="text-sm text-[var(--c-text-2)]">—</p>
          ) : null}
        </div>
      </section>

      <section className="mq-console-surface rounded-xl p-4 lg:col-span-2">
        <h3 className="mb-3 text-sm font-medium text-[var(--c-text)]">{t('teamNotes')}</h3>
        <div className="mb-3 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('notePlaceholder')}
            className="mq-console-input flex-1"
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => void submitNote()}
            className="mq-console-btn-primary"
          >
            {t('addNote')}
          </button>
        </div>
        <div className="space-y-2">
          {passport.notes.map((n) => (
            <div key={n.id} className="rounded-lg bg-[var(--c-surface-2)] p-3 text-sm">
              <p className="font-medium text-[var(--c-text)]">
                {n.author}{' '}
                <span className="text-xs font-normal text-[var(--c-text-2)]">
                  {new Date(n.at).toLocaleString(isAr ? 'ar' : 'en')}
                </span>
              </p>
              <p className="mt-1 text-[var(--c-text-2)]">{n.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
