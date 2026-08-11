'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Report = {
  majors: { major: string; students: number; completed: number; avgScore: number }[];
  yearOverYear: { year: string; readiness: number }[];
};

export default function AccreditationPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    fetch(`/api/console/${tenantSlug}/accreditation`)
      .then((r) => r.json())
      .then((j) => setReport(j.report || null));
  }, [tenantSlug]);

  const exportPdfStub = () => {
    const text = report
      ? `Muqabaleh Accreditation Report\n\n${report.majors
          .map((m) => `${m.major}: avg ${m.avgScore} (${m.completed}/${m.students})`)
          .join('\n')}`
      : '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'muqabaleh-accreditation-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!report) return <p className="text-sm text-[var(--c-text-2)]">{t('loading')}</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--c-text)]">{t('accreditationTitle')}</h2>
          <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('accreditationHint')}</p>
        </div>
        <button type="button" className="mq-console-btn-primary" onClick={exportPdfStub}>
          {t('exportMinistry')}
        </button>
      </div>

      <section className="mq-console-surface overflow-x-auto rounded-xl p-4">
        <h3 className="mb-3 text-sm font-bold text-[var(--c-text)]">{t('readinessByMajor')}</h3>
        <table className="w-full min-w-[480px] text-sm">
          <thead className="text-[var(--c-text-2)]">
            <tr>
              <th className="p-2 text-start">{t('major')}</th>
              <th className="p-2 text-start">{t('students')}</th>
              <th className="p-2 text-start">{t('completed')}</th>
              <th className="p-2 text-start">{t('kpiAvgScore')}</th>
            </tr>
          </thead>
          <tbody>
            {report.majors.map((m) => (
              <tr key={m.major} className="border-t border-[var(--c-border)] text-[var(--c-text)]">
                <td className="p-2">{m.major}</td>
                <td className="p-2">{m.students}</td>
                <td className="p-2">{m.completed}</td>
                <td className="p-2 font-bold text-[var(--c-primary)]">{m.avgScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mq-console-surface rounded-xl p-4">
        <h3 className="mb-3 text-sm font-bold text-[var(--c-text)]">{t('yearOverYear')}</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.yearOverYear}>
              <CartesianGrid stroke="var(--c-border)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: 'var(--c-text-2)', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--c-text-2)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="readiness" fill="#D4AF37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
