'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { CheckCircle2, FileUp, ImagePlus, Loader2 } from 'lucide-react';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';
import { fadeUp, stagger } from '@/components/landing/crystal/motion';
import { cn } from '@/lib/utils';

type Profile = {
  name?: string | null;
  email?: string;
  role?: string;
  level?: string;
  headline?: string | null;
  hasCv?: boolean;
  cvFileName?: string | null;
  photoUrl?: string | null;
};

const copy = {
  kicker: { en: 'Talent pool', ar: 'قاعدة المواهب' },
  title: {
    en: 'Get discovered by employers',
    ar: 'دع أصحاب العمل يكتشفونك',
  },
  subtitle: {
    en: 'Create your profile, upload your CV and photo, and opt in so companies and partners can find you for current and future roles.',
    ar: 'أنشئ ملفك، ارفع سيرتك وصورتك، وفعّل الظهور حتى تتمكن الشركات والشركاء من إيجادك للوظائف الحالية والمستقبلية.',
  },
  account: { en: 'Your account', ar: 'حسابك' },
  profile: { en: 'Professional profile', ar: 'الملف المهني' },
  files: { en: 'CV & photo', ar: 'السيرة والصورة' },
  submit: { en: 'Join the talent pool', ar: 'انضم لقاعدة المواهب' },
  update: { en: 'Save profile', ar: 'حفظ الملف' },
  signedIn: { en: 'Signed in as', ar: 'مسجّل الدخول باسم' },
  success: {
    en: 'You are in the talent pool. Employers can find you now.',
    ar: 'أنت الآن في قاعدة المواهب. يمكن لأصحاب العمل إيجادك.',
  },
  signInHint: {
    en: 'Already have an account?',
    ar: 'لديك حساب بالفعل؟',
  },
  signIn: { en: 'Sign in', ar: 'تسجيل الدخول' },
};

export function TalentClient() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const t = (bi: { en: string; ar: string }) => (isAr ? bi.ar : bi.en);
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [cvName, setCvName] = useState('');
  const [photoName, setPhotoName] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/talent/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setProfile(d.profile);
          if (d.profile.cvFileName) setCvName(d.profile.cvFileName);
        }
      })
      .catch(() => {});
  }, [status]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDone(false);
    const form = new FormData(e.currentTarget);
    form.set('openToWork', 'true');
    if (!form.get('desiredRole') && form.get('role')) {
      form.set('desiredRole', String(form.get('role')));
    }
    try {
      const endpoint =
        status === 'authenticated' ? '/api/talent/me' : '/api/talent/register';
      const method = status === 'authenticated' ? 'PATCH' : 'POST';
      const res = await fetch(endpoint, { method, body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed');
        return;
      }
      setDone(true);
      if (data.profile) setProfile(data.profile);
      if (data.createdAccount) {
        window.location.href = localePath(
          '/auth/signin?callbackUrl=/jobs/talent&from=talent',
          locale,
        );
      }
    } catch {
      setError(isAr ? 'حدث خطأ' : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const loggedIn = status === 'authenticated';

  return (
    <div
      className="mq-atelier relative min-h-screen overflow-x-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
      </div>
      <CrystalNavbar />

      <main className="mq-wrap py-10 md:py-14">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="mx-auto max-w-2xl"
        >
          <motion.div variants={fadeUp} className="mb-6 flex justify-center">
            <Link href={localePath('/', locale)} aria-label="Muqabaleh">
              <BrandLogo size="md" />
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="mq-kicker mb-2 text-center">
            {t(copy.kicker)}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mq-display mb-3 text-center text-3xl font-bold text-white md:text-4xl"
          >
            {t(copy.title)}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mb-8 text-center text-sm leading-relaxed text-white/60 md:text-base"
          >
            {t(copy.subtitle)}
          </motion.p>

          {done ? (
            <motion.div
              variants={fadeUp}
              className="mb-6 flex items-start gap-3 rounded-2xl border border-teal-300/30 bg-teal-400/10 px-4 py-3 text-sm text-teal-100"
            >
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
              <span>{t(copy.success)}</span>
            </motion.div>
          ) : null}

          <motion.form
            variants={fadeUp}
            onSubmit={onSubmit}
            className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl md:p-8"
          >
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-white">{t(copy.account)}</h2>
              {loggedIn ? (
                <p className="text-sm text-white/55">
                  {t(copy.signedIn)}{' '}
                  <span className="text-white">{session?.user?.email}</span>
                </p>
              ) : (
                <>
                  <Field label={isAr ? 'الاسم الكامل' : 'Full name'} name="name" required defaultValue={profile?.name || ''} />
                  <Field label={isAr ? 'البريد الإلكتروني' : 'Email'} name="email" type="email" required />
                  <Field
                    label={isAr ? 'كلمة المرور (٨ أحرف على الأقل)' : 'Password (8+ characters)'}
                    name="password"
                    type="password"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-white/45">
                    {t(copy.signInHint)}{' '}
                    <Link
                      href={localePath('/auth/signin?callbackUrl=/jobs/talent', locale)}
                      className="font-semibold text-teal-300 hover:underline"
                    >
                      {t(copy.signIn)}
                    </Link>
                  </p>
                </>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={isAr ? 'الدولة' : 'Country'}
                  name="country"
                  defaultValue=""
                />
                <Field
                  label={isAr ? 'الجوال' : 'Phone'}
                  name="phone"
                  defaultValue=""
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold text-white">{t(copy.profile)}</h2>
              <Field
                label={isAr ? 'المسمى / الدور المطلوب' : 'Desired role'}
                name="role"
                required
                defaultValue={profile?.role || ''}
                placeholder={isAr ? 'مثال: مهندس برمجيات' : 'e.g. Software Engineer'}
              />
              <Field
                label={isAr ? 'عنوان مختصر' : 'Headline'}
                name="headline"
                defaultValue={profile?.headline || ''}
                placeholder={
                  isAr
                    ? 'مثال: مطوّر Full-stack بخبرة ٥ سنوات'
                    : 'e.g. Full-stack developer with 5 years experience'
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm">
                  <span className="text-white/60">{isAr ? 'المستوى' : 'Level'}</span>
                  <select
                    name="level"
                    defaultValue={profile?.level || 'MID'}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                  >
                    <option value="JUNIOR">{isAr ? 'مبتدئ' : 'Junior'}</option>
                    <option value="MID">{isAr ? 'متوسط' : 'Mid'}</option>
                    <option value="SENIOR">{isAr ? 'خبير' : 'Senior'}</option>
                    <option value="LEAD">{isAr ? 'قيادي' : 'Lead'}</option>
                  </select>
                </label>
                <Field
                  label={isAr ? 'سنوات الخبرة' : 'Years of experience'}
                  name="yearsExperience"
                  type="number"
                  min={0}
                  max={50}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={isAr ? 'القطاع' : 'Industry'} name="industry" />
                <Field label={isAr ? 'الموقع' : 'Location'} name="location" />
              </div>
              <Field
                label={isAr ? 'المهارات (مفصولة بفواصل)' : 'Skills (comma-separated)'}
                name="skills"
                placeholder="React, Arabic, SAP…"
              />
              <Field label="LinkedIn" name="linkedInUrl" type="url" />
              <label className="block space-y-1.5 text-sm">
                <span className="text-white/60">{isAr ? 'نبذة' : 'Summary'}</span>
                <textarea
                  name="summary"
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-white/30"
                />
              </label>
              <input type="hidden" name="languages" value="AR,EN" />
              <input type="hidden" name="desiredRole" value="" id="desiredRoleMirror" />
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold text-white">{t(copy.files)}</h2>
              <label
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-8 text-center transition hover:border-teal-300/40',
                )}
              >
                <FileUp className="text-teal-300" size={22} />
                <span className="text-sm font-semibold text-white">
                  {isAr ? 'رفع السيرة الذاتية (PDF / Word)' : 'Upload CV / resume (PDF / Word)'}
                </span>
                <span className="text-xs text-white/45">
                  {cvName ||
                    (profile?.hasCv
                      ? profile.cvFileName || (isAr ? 'ملف مرفوع' : 'File on file')
                      : isAr
                        ? 'مطلوب · حتى ٣ ميجابايت'
                        : 'Required · up to 3 MB')}
                </span>
                <input
                  type="file"
                  name="cv"
                  accept=".pdf,.doc,.docx,application/pdf"
                  required={!profile?.hasCv}
                  className="sr-only"
                  onChange={(e) => setCvName(e.target.files?.[0]?.name || '')}
                />
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-8 text-center transition hover:border-amber-200/40">
                <ImagePlus className="text-amber-200" size={22} />
                <span className="text-sm font-semibold text-white">
                  {isAr ? 'رفع صورة شخصية' : 'Upload profile photo'}
                </span>
                <span className="text-xs text-white/45">
                  {photoName ||
                    (isAr ? 'اختياري · JPEG / PNG / WebP' : 'Optional · JPEG / PNG / WebP')}
                </span>
                <input
                  type="file"
                  name="photo"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => setPhotoName(e.target.files?.[0]?.name || '')}
                />
              </label>
            </section>

            {error ? (
              <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mq-btn mq-btn-primary mq-btn-shimmer flex w-full min-h-[48px] items-center justify-center gap-2 text-sm font-bold"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {loggedIn ? t(copy.update) : t(copy.submit)}
            </button>
          </motion.form>

          <p className="mt-6 text-center text-xs text-white/40">
            <Link href={localePath('/jobs', locale)} className="text-teal-300/80 hover:underline">
              {isAr ? 'العودة إلى الوظائف' : 'Back to jobs'}
            </Link>
          </p>
        </motion.div>
      </main>
      <CrystalFooter />
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  placeholder,
  minLength,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  minLength?: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-white/60">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        minLength={minLength}
        min={min}
        max={max}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-white/30"
      />
    </label>
  );
}
