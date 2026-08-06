'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, Download, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { APPLICATION_STAGES, STAGE_LABELS } from '@/lib/ats/constants';
import { localePath } from '@/i18n/navigation';
import { B2B_CONSOLE_PREVIEW } from '@/lib/b2b-preview';
import { toast } from 'sonner';

type Application = {
  id: string;
  stage: string;
  coverLetter?: string | null;
  employerNote?: string | null;
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
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/b2b/jobs/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');
    setJob(data.job);
    const apps: Application[] = data.applications || [];
    setApplications(apps);
    setStageCounts(data.stageCounts || {});
    const drafts: Record<string, string> = {};
    for (const a of apps) drafts[a.id] = a.employerNote || '';
    setNoteDrafts(drafts);
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

  async function saveNote(applicationId: string) {
    setSavingNote(applicationId);
    try {
      const res = await fetch(`/api/b2b/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employerNote: noteDrafts[applicationId] ?? '' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || (isAr ? 'تعذّر الحفظ' : 'Failed to save'));
        return;
      }
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? { ...a, employerNote: data.application?.employerNote ?? noteDrafts[applicationId] }
            : a,
        ),
      );
      toast.success(isAr ? 'تم حفظ الملاحظة' : 'Note saved — candidate can see it');
    } finally {
      setSavingNote(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-white/50">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center text-white/50">
        {isAr ? 'الوظيفة غير موجودة' : 'Job not found'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            href={localePath('/b2b/jobs', locale)}
            className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
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
        <Link href={localePath('/b2b/talent', locale)}>
          <Button variant="outline" className="cursor-pointer">
            {isAr ? 'تصفح قاعدة المواهب' : 'Browse talent pool'}
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {APPLICATION_STAGES.filter((s) => !['WITHDRAWN'].includes(s)).map((stage) => (
          <div
            key={stage}
            className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
          >
            <p className="text-xs text-white/50">
              {isAr ? STAGE_LABELS[stage].ar : STAGE_LABELS[stage].en}
            </p>
            <p className="text-xl font-bold text-white">{stageCounts[stage] || 0}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="rounded-xl border border-white/10 px-4 py-10 text-center text-white/50">
            {isAr ? 'لا يوجد متقدمون بعد.' : 'No applicants yet.'}
          </div>
        ) : (
          applications.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-center gap-3">
                  {a.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.photoUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs">
                      {(a.candidate.name || a.candidate.email).slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">
                      {a.candidate.name || a.candidate.email}
                    </p>
                    <p className="text-xs text-white/50">{a.candidate.email}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {a.candidate.headline || a.candidate.role || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
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
                  {a.cvUrl ? (
                    <a
                      href={a.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-teal-300 hover:underline"
                    >
                      <Download size={14} />
                      CV
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="block text-xs font-semibold text-white/55">
                  {isAr ? 'ملاحظة للمتقدم (يظهرها في طلباتي)' : 'Note to candidate (visible on My applications)'}
                </label>
                <Textarea
                  value={noteDrafts[a.id] ?? ''}
                  onChange={(e) =>
                    setNoteDrafts((prev) => ({ ...prev, [a.id]: e.target.value }))
                  }
                  rows={3}
                  placeholder={
                    isAr
                      ? 'مثال: نراجع ملفك هذا الأسبوع…'
                      : 'e.g. We are reviewing your profile this week…'
                  }
                  className="glass-input resize-y"
                  disabled={B2B_CONSOLE_PREVIEW}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    size="sm"
                    className="cursor-pointer"
                    disabled={B2B_CONSOLE_PREVIEW || savingNote === a.id}
                    onClick={() => saveNote(a.id)}
                  >
                    {savingNote === a.id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : isAr ? (
                      'حفظ الملاحظة'
                    ) : (
                      'Save note'
                    )}
                  </Button>
                  {B2B_CONSOLE_PREVIEW ? (
                    <span className="text-xs text-amber-200/80">
                      {isAr
                        ? 'معاينة: الحفظ معطّل حتى تفعيل لوحة الأعمال.'
                        : 'Preview: saving is locked until the business console goes live.'}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
