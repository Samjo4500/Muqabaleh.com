'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { AcademyCohort } from '@/lib/console/types';

export default function FacultyPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const [cohorts, setCohorts] = useState<AcademyCohort[]>([]);

  useEffect(() => {
    fetch(`/api/console/${tenantSlug}/cohorts`)
      .then((r) => r.json())
      .then((j) => setCohorts(j.cohorts || []));
  }, [tenantSlug]);

  const rows = useMemo(
    () =>
      cohorts.map((c) => {
        const done = c.students.filter((s) => s.status === 'COMPLETED').length;
        const pct = c.students.length
          ? Math.round((done / c.students.length) * 100)
          : 0;
        return { ...c, done, pct };
      }),
    [cohorts],
  );

  const exportGradebook = (c: AcademyCohort) => {
    const lines = [
      'studentId,name,email,major,year,score,status',
      ...c.students.map(
        (s) =>
          `${s.studentId},${s.name},${s.email},${s.major},${s.year},${s.score ?? ''},${s.status}`,
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${c.name.replace(/\s+/g, '-').toLowerCase()}-gradebook.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mq-console-title text-[1.65rem]">{t('facultyTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('facultyHint')}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((c) => (
          <div key={c.id} className="mq-console-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-[var(--c-text)]">{c.name}</h3>
                <p className="text-xs text-[var(--c-text-2)]">
                  {c.facultyEmail || t('unassignedFaculty')}
                </p>
              </div>
              <button
                type="button"
                className="mq-console-btn-ghost text-xs"
                onClick={() => exportGradebook(c)}
              >
                {t('exportGradebook')}
              </button>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-[var(--c-text-2)]">
                <span>{t('progress')}</span>
                <span>
                  {c.done}/{c.students.length} ({c.pct}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--c-border)]">
                <div
                  className="h-full rounded-full bg-[var(--c-primary)] transition-all duration-200"
                  style={{ width: `${c.pct}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
