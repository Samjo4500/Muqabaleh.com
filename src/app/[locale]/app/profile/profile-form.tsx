'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import {
  User,
  Lock,
  AlertTriangle,
  Loader2,
  Mail,
  BadgeCheck,
  FileUp,
  ImagePlus,
} from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlowCard } from '@/components/brand';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { WorkPreferencesField } from '@/components/profile/WorkPreferencesField';

import {
  MENA_COUNTRIES,
  INDUSTRIES,
  EXPERIENCES,
  type WorkPreferenceCode,
} from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export type ProfileFormData = {
  name: string;
  email: string;
  country: string | null;
  industry: string | null;
  experience: string | null;
  interviewerGender: string;
  language: string;
};

export function ProfileForm({ user, locale }: { user: ProfileFormData; locale: string }) {
  const t = useTranslations('app.profile');
  const tDash = useTranslations('app.dashboard');
  const tCommon = useTranslations('common');
  const router = useRouter();

  /* ---- Profile fields ---- */
  const [name, setName] = useState(user.name ?? '');
  const [country, setCountry] = useState(user.country ?? '');
  const [industry, setIndustry] = useState(user.industry ?? '');
  const [experience, setExperience] = useState(user.experience ?? '');
  const [gender, setGender] = useState(user.interviewerGender ?? 'MALE');
  const [language, setLanguage] = useState(user.language ?? 'AR');
  const [workPreferences, setWorkPreferences] = useState<WorkPreferenceCode[]>([]);
  const [cvAssetId, setCvAssetId] = useState<string | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [pendingCv, setPendingCv] = useState<File | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/talent/me');
        if (!res.ok) return;
        const data = await res.json();
        const profile = data.profile as
          | {
              workPreferences?: string[];
              cvAssetId?: string | null;
              cvFileName?: string | null;
              photoUrl?: string | null;
            }
          | null;
        if (cancelled || !profile) return;
        if (Array.isArray(profile.workPreferences)) {
          setWorkPreferences(profile.workPreferences as WorkPreferenceCode[]);
        }
        setCvAssetId(profile.cvAssetId || null);
        setCvFileName(profile.cvFileName || null);
        setPhotoUrl(profile.photoUrl || null);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pendingPhoto) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(pendingPhoto);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingPhoto]);

  /* ---- Password fields ---- */
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  /* ---- Loading states ---- */
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ---- Delete confirmation step ---- */
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);

  /* ================================================================ */
  /*  Save profile                                                     */
  /* ================================================================ */
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          country: country || undefined,
          industry: industry || undefined,
          experience: experience || undefined,
          interviewerGender: gender,
          language,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save');
      }

      if (pendingCv || pendingPhoto) {
        const form = new FormData();
        if (name) form.set('name', name);
        if (country) form.set('country', country);
        if (industry) form.set('industry', industry);
        if (experience) {
          form.set('level', experience);
          form.set('role', experience);
        } else {
          form.set('role', 'Professional');
        }
        for (const pref of workPreferences) form.append('workPreferences', pref);
        if (pendingCv) form.set('cv', pendingCv);
        if (pendingPhoto) form.set('photo', pendingPhoto);

        const talentRes = await fetch('/api/talent/me', {
          method: 'PATCH',
          body: form,
        });
        const talentData = await talentRes.json().catch(() => ({}));
        if (!talentRes.ok) {
          throw new Error(talentData.error || 'Failed to upload documents');
        }
        const profile = talentData.profile as
          | {
              cvAssetId?: string | null;
              cvFileName?: string | null;
              photoUrl?: string | null;
            }
          | undefined;
        if (profile) {
          setCvAssetId(profile.cvAssetId || null);
          setCvFileName(profile.cvFileName || null);
          setPhotoUrl(profile.photoUrl || null);
        }
        setPendingCv(null);
        setPendingPhoto(null);
        toast.success(t('documentsSaved'));
      } else {
        await fetch('/api/talent/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || undefined,
            country: country || undefined,
            industry: industry || undefined,
            level: experience || undefined,
            role: experience || 'Professional',
            workPreferences,
          }),
        }).catch(() => {});
        toast.success(t('saved'));
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tCommon('error'));
    } finally {
      setSaving(false);
    }
  };

  /* ================================================================ */
  /*  Change password                                                  */
  /* ================================================================ */
  const handlePassword = async () => {
    if (newPw !== confirmPw) {
      toast.error(t('passwordMismatch'));
      return;
    }
    if (newPw.length < 8) {
      toast.error(t('passwordMinLength'));
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to change password');
      }
      toast.success(t('passwordChanged'));
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tCommon('error'));
    } finally {
      setPwSaving(false);
    }
  };

  /* ================================================================ */
  /*  Delete account                                                   */
  /* ================================================================ */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/users/me/delete', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      await signOut({ callbackUrl: `/${locale}` });
    } catch {
      toast.error(tCommon('error'));
      setDeleting(false);
    }
  };

  /* ================================================================ */
  /*  Helpers                                                          */
  /* ================================================================ */
  const countryLabel = (val: string) => {
    const found = MENA_COUNTRIES.find((c) => c.code === val);
    return found ? (locale === 'ar' ? found.name_ar : found.name_en) : val;
  };

  const industryKey = (val: string) => {
    const map: Record<string, string> = {
      IT: 'fieldIt', FINANCE: 'fieldFinance', MEDICINE: 'fieldMedicine',
      ENGINEERING: 'fieldEngineering', EDUCATION: 'fieldEducation',
      MARKETING: 'fieldMarketing', SALES: 'fieldSales', HR: 'fieldHr',
    };
    return map[val] ?? val;
  };

  const expKey = (val: string) => {
    const map: Record<string, string> = {
      JUNIOR: 'expJunior', MID: 'expMid', SENIOR: 'expSenior', EXECUTIVE: 'expExecutive',
    };
    return map[val] ?? val;
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
        <Link
          href={localePath('/app/passport', locale)}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-teal-300/30 bg-teal-400/10 px-3.5 text-sm font-semibold text-teal-200 transition-colors hover:bg-teal-400/15"
        >
          <BadgeCheck size={16} strokeWidth={1.75} />
          {t('viewPassport')}
        </Link>
      </div>

      {/* ── Profile form ── */}
      <GlowCard className="space-y-5 p-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
            <User size={20} strokeWidth={1.75} className="text-gold" />
          </div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">{t('title')}</h2>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-sm text-[var(--text-muted)]">{t('name')}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('namePlaceholder')}
            className="glass-input"
          />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-1.5">
          <Label className="text-sm text-[var(--text-muted)]">{t('email')}</Label>
          <div className="flex items-center gap-2">
            <Mail size={16} strokeWidth={1.5} className="text-[var(--text-faint)]" />
            <span className="text-sm text-[var(--text-muted)]">{user.email}</span>
          </div>
        </div>

        {/* CV + profile photo */}
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {t('documentsTitle')}
            </p>
            <p className="mt-1 text-xs text-[var(--text-faint)]">{t('documentsHint')}</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              {photoPreview || photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview || photoUrl || ''}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/30">
                  <User size={28} strokeWidth={1.5} />
                </div>
              )}
            </div>

            <div className="grid min-w-0 flex-1 gap-3">
              <label className="flex cursor-pointer flex-col gap-1 rounded-xl border border-dashed border-white/15 px-3 py-3 transition-colors hover:border-teal-300/40">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
                  <FileUp size={16} className="text-teal-300" />
                  {cvAssetId || pendingCv ? t('replaceCv') : t('uploadCv')}
                </span>
                <span className="text-xs text-white/45">
                  {pendingCv
                    ? t('cvSelected', { name: pendingCv.name })
                    : cvFileName || (cvAssetId ? t('viewCv') : t('noCvYet'))}
                </span>
                <span className="text-[11px] text-white/35">{t('uploadCvHint')}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  onChange={(e) => setPendingCv(e.target.files?.[0] || null)}
                />
              </label>
              {cvAssetId && !pendingCv ? (
                <a
                  href={`/api/media/${cvAssetId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-teal-300 hover:underline"
                >
                  {t('viewCv')}
                  {cvFileName ? ` · ${cvFileName}` : ''}
                </a>
              ) : null}

              <label className="flex cursor-pointer flex-col gap-1 rounded-xl border border-dashed border-white/15 px-3 py-3 transition-colors hover:border-amber-200/40">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
                  <ImagePlus size={16} className="text-amber-200" />
                  {photoUrl || pendingPhoto ? t('replacePhoto') : t('uploadPhoto')}
                </span>
                <span className="text-xs text-white/45">
                  {pendingPhoto
                    ? t('photoSelected', { name: pendingPhoto.name })
                    : t('uploadPhotoHint')}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => setPendingPhoto(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Country */}
        <div className="space-y-1.5">
          <Label className="text-sm text-[var(--text-muted)]">{t('country')}</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="glass-input w-full">
              <SelectValue placeholder={t('countryPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-panel)] border-white/10">
              {MENA_COUNTRIES.map((c) => (
                <SelectItem
                  key={c.code}
                  value={c.code}
                  className="text-[var(--text-primary)] focus:bg-white/5"
                >
                  {locale === 'ar' ? c.name_ar : c.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Industry */}
        <div className="space-y-1.5">
          <Label className="text-sm text-[var(--text-muted)]">{t('industry')}</Label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="glass-input w-full">
              <SelectValue placeholder={t('industryPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-panel)] border-white/10">
              {INDUSTRIES.map((ind) => (
                <SelectItem
                  key={ind}
                  value={ind}
                  className="text-[var(--text-primary)] focus:bg-white/5"
                >
                  {tDash(industryKey(ind))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Experience */}
        <div className="space-y-1.5">
          <Label className="text-sm text-[var(--text-muted)]">{t('experience')}</Label>
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger className="glass-input w-full">
              <SelectValue placeholder={t('expPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-panel)] border-white/10">
              {EXPERIENCES.map((exp) => (
                <SelectItem
                  key={exp}
                  value={exp}
                  className="text-[var(--text-primary)] focus:bg-white/5"
                >
                  {tDash(expKey(exp))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <WorkPreferencesField
            locale={locale}
            value={workPreferences}
            onChange={setWorkPreferences}
          />
        </div>

        {/* Preferred Interviewer Gender */}
        <div className="space-y-1.5">
          <Label className="text-sm text-[var(--text-muted)]">{t('preferredGender')}</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="glass-input w-full">
              <SelectValue placeholder={t('genderPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-panel)] border-white/10">
              <SelectItem value="MALE" className="text-[var(--text-primary)] focus:bg-white/5">
                {t('genderMale')}
              </SelectItem>
              <SelectItem value="FEMALE" className="text-[var(--text-primary)] focus:bg-white/5">
                {t('genderFemale')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-1.5">
          <Label className="text-sm text-[var(--text-muted)]">{t('language')}</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="glass-input w-full">
              <SelectValue placeholder={t('langPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-panel)] border-white/10">
              <SelectItem value="AR" className="text-[var(--text-primary)] focus:bg-white/5">
                {'\u0627\u0644\u0639\u0631\u0628\u064a\u0629'}
              </SelectItem>
              <SelectItem value="EN" className="text-[var(--text-primary)] focus:bg-white/5">
                English
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Save button */}
        <Button onClick={handleSave} disabled={saving} className="btn-gold cursor-pointer">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {t('save')}
        </Button>
      </GlowCard>

      {/* ── Change password ── */}
      <GlowCard className="space-y-5 p-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
            <Lock size={20} strokeWidth={1.75} className="text-gold" />
          </div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">{t('changePassword')}</h2>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm text-[var(--text-muted)]">{t('currentPassword')}</Label>
          <Input
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            className="glass-input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-[var(--text-muted)]">{t('newPassword')}</Label>
          <Input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="glass-input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-[var(--text-muted)]">{t('confirmPassword')}</Label>
          <Input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            className="glass-input"
          />
        </div>
        <Button
          onClick={handlePassword}
          disabled={pwSaving}
          variant="outline"
          className="border-white/10 text-[var(--text-primary)] hover:border-gold/30 hover:text-gold cursor-pointer"
        >
          {pwSaving && <Loader2 size={16} className="animate-spin" />}
          {t('changePassword')}
        </Button>
      </GlowCard>

      {/* ── Danger zone ── */}
      <GlowCard className="space-y-4 p-6 border-red-500/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
            <AlertTriangle size={20} strokeWidth={1.75} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-red-400">{t('dangerZone')}</h2>
            <p className="mt-1 text-xs text-[var(--text-faint)]">{t('deleteWarning')}</p>
          </div>
        </div>

        <AlertDialog
          open={deleteStep >= 1}
          onOpenChange={(open) => {
            if (!open) setDeleteStep(0);
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
            >
              {t('deleteAccount')}
            </Button>
          </AlertDialogTrigger>

          {deleteStep === 1 ? (
            <AlertDialogContent className="bg-[var(--bg-panel)] border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[var(--text-primary)]">
                  {t('deleteConfirmTitle')}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[var(--text-muted)]">
                  {t('deleteWarning')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                  {tCommon('cancel')}
                </AlertDialogCancel>
                <Button
                  onClick={() => setDeleteStep(2)}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                >
                  {t('deleteConfirm1')}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          ) : (
            <AlertDialogContent className="bg-[var(--bg-panel)] border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[var(--text-primary)]">
                  {t('deleteConfirm2')}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[var(--text-muted)]">
                  {t('deleteWarning')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                  {tCommon('cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async (e) => {
                    e.preventDefault();
                    await handleDelete();
                  }}
                  disabled={deleting}
                  className="bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                >
                  {deleting && <Loader2 size={16} className="animate-spin" />}
                  {t('deleteConfirm2')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>
      </GlowCard>
    </div>
  );
}
