'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, Download, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { APPLICATION_STAGES, STAGE_LABELS } from '@/lib/ats/constants';
import { toast } from 'sonner';

type Application = {
  id: string;
  stage: string;
  coverLetter?: string | null;
  cvUrl?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  candidate: {
    id: string;
    name: string | null;
    email: string;
    role?: string | null;
    level?: string | null;
    headline?: string | null;
    phone?: string | null;
    muqabalehScore?: number | null;
  };
};

export default function JobDetailAtsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const params = useParams();
  const id = String(params.id || '');
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<{
    id: string;
    title: string;
    status: string;
    isPublic: boolean;
    applicationsCount?: number;
  } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});

  async function load() {
    const res = await fetch(`/api/b2b/jobs/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');
    setJob(data.job);
    setApplications(data.applications || []);
    setStageCounts(data.stageCounts || {});
  }

  useEffect(() => {
    if (!id) return;
    load()
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function updateStage(applicationId: string, stage: string) {
    const res = await fetch(`/api/b2b/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || 'Failed');
      return;
    }
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, stage } : a)),
    );
    toast.success(isAr ? 'تم تحديث المرحلة' : 'Stage updated');
    load().catch(() => {});
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-[var(--text-muted)]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center text-[var(--text-muted)]">
        {isAr ? 'الوظيفة غير موجودة' : 'Job not found'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            href="/b2b/jobs"
            className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-white/5"
          >
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{job.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline">{job.status}</Badge>
              {job.isPublic ? (
                <Badge variant="outline" className="border-teal-400/30 text-teal-300">
                  {isAr ? 'منشورة للعامة' : 'Public'}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <Link href="/b2b/talent">
          <Button variant="outline" className="cursor-pointer">
            {isAr ? 'تصفح قاعدة المواهب' : 'Browse talent pool'}
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {APPLICATION_STAGES.filter((s) => !['WITHDRAWN'].includes(s)).map((stage) => (
          <div
            key={stage}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3"
          >
            <p className="text-xs text-[var(--text-muted)]">
              {isAr ? STAGE_LABELS[stage].ar : STAGE_LABELS[stage].en}
            </p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {stageCounts[stage] || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">
                {isAr ? 'المتقدم' : 'Applicant'}
              </th>
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">
                {isAr ? 'الدور' : 'Role'}
              </th>
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">
                {isAr ? 'المرحلة' : 'Stage'}
              </th>
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">
                {isAr ? 'الملفات' : 'Files'}
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[var(--text-muted)]">
                  {isAr ? 'لا يوجد متقدمون بعد.' : 'No applicants yet.'}
                </td>
              </tr>
            ) : (
              applications.map((a) => (
                <tr key={a.id} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {a.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.photoUrl}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs">
                          {(a.candidate.name || a.candidate.email).slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {a.candidate.name || a.candidate.email}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">{a.candidate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {a.candidate.headline || a.candidate.role || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Select value={a.stage} onValueChange={(v) => updateStage(a.id, v)}>
                      <SelectTrigger className="w-[160px] glass-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STAGES.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {isAr ? STAGE_LABELS[stage].ar : STAGE_LABELS[stage].en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    {a.cvUrl ? (
                      <a
                        href={a.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-teal-300 hover:underline"
                      >
                        <Download size={14} />
                        CV
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
