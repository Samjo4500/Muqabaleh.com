'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { AcademyCohort } from '@/lib/console/types';

export default function CohortsPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const [cohorts, setCohorts] = useState<AcademyCohort[]>([]);
  const [csv, setCsv] = useState(
    'name,email,studentId,major,year\nSara Demo,sara@bayan.edu,BAY-3001,Computer Science,2026',
  );
  const [name, setName] = useState('Imported Cohort');
  const [msg, setMsg] = useState<string | null>(null);

  const reload = async () => {
    const res = await fetch(`/api/console/${tenantSlug}/cohorts`);
    const json = await res.json();
    setCohorts(json.cohorts || []);
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  const importCsv = async () => {
    const lines = csv.trim().split('\n').slice(1);
    const students = lines
      .map((line) => line.split(',').map((x) => x.trim()))
      .filter((cols) => cols.length >= 5)
      .map(([n, email, studentId, major, year]) => ({
        name: n,
        email,
        studentId,
        major,
        year,
      }));
    if (!students.length) {
      setMsg(t('csvInvalid'));
      return;
    }
    const res = await fetch(`/api/console/${tenantSlug}/cohorts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        major: students[0].major,
        year: students[0].year,
        students,
      }),
    });
    if (res.ok) {
      setMsg(t('csvImported'));
      await reload();
    }
  };

  const toggleShare = async (cohortId: string, studentId: string, share: boolean) => {
    await fetch(`/api/console/${tenantSlug}/cohorts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'share', cohortId, studentId, share }),
    });
    await reload();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mq-console-title text-[1.65rem]">{t('cohortsTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('cohortsHint')}</p>
      </div>

      <section className="mq-console-surface space-y-3 rounded-xl p-4">
        <h3 className="text-sm font-medium tracking-tight text-[var(--c-text)]">{t('csvImport')}</h3>
        <input
          className="mq-console-input w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('cohortName')}
        />
        <textarea
          className="mq-console-input min-h-[120px] w-full font-mono text-xs"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
        <button type="button" className="mq-console-btn-primary" onClick={() => void importCsv()}>
          {t('importStudents')}
        </button>
        {msg ? <p className="text-sm text-[var(--c-primary)]">{msg}</p> : null}
        <p className="text-xs text-[var(--c-text-2)]">{t('privacyDefault')}</p>
      </section>

      {cohorts.map((c) => (
        <section key={c.id} className="mq-console-surface rounded-xl p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-medium text-[var(--c-text)]">{c.name}</h3>
              <p className="text-xs text-[var(--c-text-2)]">
                {c.major} · {c.year} · {c.students.length} {t('students')}
              </p>
            </div>
            <span className="text-xs text-[var(--c-text-2)]">
              {t('deadline')}:{' '}
              {c.deadline ? new Date(c.deadline).toLocaleDateString() : '—'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-[var(--c-text-2)]">
                <tr>
                  <th className="p-2 text-start">{t('name')}</th>
                  <th className="p-2 text-start">ID</th>
                  <th className="p-2 text-start">{t('kpiAvgScore')}</th>
                  <th className="p-2 text-start">Status</th>
                  <th className="p-2 text-start">{t('shareCareer')}</th>
                </tr>
              </thead>
              <tbody>
                {c.students.map((s) => (
                  <tr key={s.id} className="border-t border-[var(--c-border)] text-[var(--c-text)]">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.studentId}</td>
                    <td className="p-2">{s.score ?? '—'}</td>
                    <td className="p-2">{s.status}</td>
                    <td className="p-2">
                      <button
                        type="button"
                        className="mq-console-btn-ghost text-xs"
                        onClick={() =>
                          void toggleShare(c.id, s.id, !s.shareWithCareerCenter)
                        }
                      >
                        {s.shareWithCareerCenter ? t('shared') : t('private')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
