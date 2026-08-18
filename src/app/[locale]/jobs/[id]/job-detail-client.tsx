'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Building2, Loader2, MapPin, CheckCircle2 } from 'lucide-react';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { localePath } from '@/i18n/navigation';

type Job = {
  id: string;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  location?: string | null;
  city?: string | null;
  employmentType?: string;
  salaryRange?: string | null;
  department?: string | null;
  industry?: string;
  company?: { name: string } | null;
  tags?: string[];
};

export function JobDetailClient({ jobId }: { jobId: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { status } = useSession();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Not found');
        setJob(d.job);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  async function onApply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== 'authenticated') {
      window.location.href = localePath(
        `/auth/signin?callbackUrl=${encodeURIComponent(`/portal/jobs/${jobId}`)}`,
        locale,
      );
      return;
    }
    setSubmitting(true);
    setApplyError('');
    try {
      const form = new FormData(e.currentTarget);
      form.set('joinTalentPool', 'true');
      const res = await fetch(`/api/jobs/${jobId}/apply`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setApplyError(data.error || 'Failed');
        return;
      }
      setDone(true);
    } catch {
      setApplyError(isAr ? 'فشل التقديم' : 'Application failed');
    } finally {
      setSubmitting(false);
    }
  }

  const title = job ? (isAr && job.titleAr ? job.titleAr : job.title) : '';
  const description = job
    ? isAr && job.descriptionAr
      ? job.descriptionAr
      : job.description
    : '';

  return (
    <div
      className="mq-atelier relative min-h-screen"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <CrystalNavbar locale={locale} />
      <main className="mq-wrap py-10 md:py-14">
        {loading ? (
          <div className="flex justify-center py-20 text-white/50">
            <Loader2 className="animate-spin" />
          </div>
        ) : error || !job ? (
          <div className="mx-auto max-w-lg text-center">
            <p className="mb-4 text-white/70">{error || (isAr ? 'غير موجود' : 'Not found')}</p>
            <Link href={localePath('/portal/jobs', locale)} className="text-teal-300 hover:underline">
              {isAr ? 'كل الوظائف' : 'All jobs'}
            </Link>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.4fr_1fr]">
            <article className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-300/80">
                {job.department || job.industry}
              </p>
              <h1 className="mq-display text-3xl font-bold text-white md:text-4xl">{title}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-white/55">
                {job.company?.name ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 size={14} /> {job.company.name}
                  </span>
                ) : null}
                {(job.location || job.city) && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} /> {job.location || job.city}
                  </span>
                )}
                {job.salaryRange ? (
                  <span className="rounded-lg border border-amber-200/20 bg-amber-200/10 px-2 py-0.5 text-amber-100">
                    {job.salaryRange}
                  </span>
                ) : null}
              </div>
              {description ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                  {description}
                </p>
              ) : null}
              {job.requirements ? (
                <div>
                  <h2 className="mb-2 text-sm font-bold text-white">
                    {isAr ? 'المتطلبات' : 'Requirements'}
                  </h2>
                  <p className="whitespace-pre-wrap text-sm text-white/60">{job.requirements}</p>
                </div>
              ) : null}
              {job.benefits ? (
                <div>
                  <h2 className="mb-2 text-sm font-bold text-white">
                    {isAr ? 'المزايا' : 'Benefits'}
                  </h2>
                  <p className="whitespace-pre-wrap text-sm text-white/60">{job.benefits}</p>
                </div>
              ) : null}
              {job.tags?.length ? (
                <ul className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/50"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>

            <aside className="h-fit space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-lg font-bold text-white">
                {isAr ? 'قدّم الآن' : 'Apply now'}
              </h2>
              <p className="text-sm text-white/55">
                {isAr
                  ? 'ارفع سيرتك وصورتك. سنضيفك أيضاً لقاعدة المواهب ليجدك أصحاب العمل لاحقاً.'
                  : 'Upload your CV and photo. We will also add you to the talent pool so employers can find you later.'}
              </p>

              {done ? (
                <div className="flex gap-2 rounded-xl border border-teal-300/30 bg-teal-400/10 p-3 text-sm text-teal-100">
                  <CheckCircle2 size={18} className="shrink-0" />
                  {isAr ? 'تم استلام طلبك بنجاح.' : 'Your application was submitted.'}
                </div>
              ) : (
                <form onSubmit={onApply} className="space-y-3">
                  <label className="block space-y-1 text-sm">
                    <span className="text-white/60">
                      {isAr ? 'رسالة التقديم' : 'Cover letter'}
                    </span>
                    <textarea
                      name="coverLetter"
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="block space-y-1 text-sm">
                    <span className="text-white/60">
                      {isAr ? 'السيرة الذاتية *' : 'CV / resume *'}
                    </span>
                    <input
                      type="file"
                      name="cv"
                      required
                      accept=".pdf,.doc,.docx,application/pdf"
                      className="block w-full text-xs text-white/70 file:me-3 file:rounded-lg file:border-0 file:bg-teal-400/20 file:px-3 file:py-2 file:text-teal-100"
                    />
                  </label>
                  <label className="block space-y-1 text-sm">
                    <span className="text-white/60">
                      {isAr ? 'الصورة الشخصية' : 'Photo'}
                    </span>
                    <input
                      type="file"
                      name="photo"
                      accept="image/jpeg,image/png,image/webp"
                      className="block w-full text-xs text-white/70 file:me-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
                    />
                  </label>
                  {applyError ? (
                    <p className="text-sm text-rose-300">{applyError}</p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mq-btn mq-btn-primary flex w-full min-h-[46px] items-center justify-center gap-2 text-sm"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
                    {status === 'authenticated'
                      ? isAr
                        ? 'إرسال الطلب'
                        : 'Submit application'
                      : isAr
                        ? 'سجّل الدخول وقدّم'
                        : 'Sign in to apply'}
                  </button>
                </form>
              )}

              <Link
                href={localePath('/portal/jobs?tab=candidates', locale)}
                className="block text-center text-sm font-semibold text-teal-300 hover:underline"
              >
                {isAr
                  ? 'أو سجّل للشواغر المستقبلية من صفحة الشواغر'
                  : 'Or register for future vacancies on the Vacancies page'}
              </Link>
            </aside>
          </div>
        )}
      </main>
      <CrystalFooter />
    </div>
  );
}
