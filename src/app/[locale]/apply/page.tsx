'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Upload,
  FileVideo,
  FileText,
  Check,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { cn } from '@/lib/utils';
import { formatBytes, isAllowedVideoMime } from '@/lib/uploads/video';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ROLES = [
  'Sales Manager',
  'Software Engineer',
  'Marketing',
  'HR',
  'Accountant',
  'Customer Service',
  'Project Manager',
  'Data Analyst',
  'Operations Manager',
  'Graphic Designer',
] as const;

const INDUSTRIES = [
  'Tech',
  'Retail',
  'Healthcare',
  'Fintech',
  'E-commerce',
  'Construction',
  'Logistics',
  'Media',
  'Telecom',
  'Banking',
  'General',
] as const;

const LANGUAGES = [
  { key: 'ar', label: 'العربية', labelEn: 'Arabic' },
  { key: 'en', label: 'English', labelEn: 'English' },
  { key: 'fr', label: 'Français', labelEn: 'French' },
] as const;

const EXPERIENCE_OPTIONS = [
  { value: '1-3', label: '1-3' },
  { value: '4-7', label: '4-7' },
  { value: '8-15', label: '8-15' },
  { value: '15+', label: '15+' },
] as const;

const PRICE_TIERS = [
  { value: 'standard', labelKey: 'tierStandard', price: '$29' },
  { value: 'pro', labelKey: 'tierPro', price: '$49' },
  { value: 'executive', labelKey: 'tierExecutive', price: '$99' },
] as const;

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                   */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

/* ------------------------------------------------------------------ */
/*  File Upload Zone                                                   */
/* ------------------------------------------------------------------ */

function FileUploadZone({
  file,
  onFileChange,
  accept,
  helpText,
  formatsText,
  icon: Icon,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  file: File | null;
  onFileChange: (f: File | null) => void;
  accept: string;
  helpText: string;
  formatsText: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    onFileChange(f);
  };

  const handleClick = () => inputRef.current?.click();

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all',
        isDragging
          ? 'border-teal-300 bg-teal-300/5'
          : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]',
        file && 'border-teal-300/30 bg-teal-300/5'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {file ? (
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 size={32} className="text-teal-300" />
          <p className="text-sm text-[var(--text-primary)]">{file.name}</p>
          <p className="text-xs text-white/45">{formatBytes(file.size)}</p>
          <button
            onClick={removeFile}
            className="mt-1 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Icon size={32} strokeWidth={1.5} className="text-[var(--text-muted)]" />
          <div>
            <p className="text-sm text-[var(--text-muted)]">{helpText}</p>
            <p className="mt-1 text-xs text-[var(--text-faint)]">{formatsText}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-teal-300">
            <Upload size={14} />
            <span>Browse</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ApplyPage() {
  const t = useTranslations('apply');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  /* ── Form state ── */
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullNameAr, setFullNameAr] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [priceTier, setPriceTier] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [terms, setTerms] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoCap, setVideoCap] = useState<{ provider: 'blob' | 'inline'; maxBytes: number }>({
    provider: 'inline',
    maxBytes: 3_500_000,
  });

  /* ── Drag state ── */
  const [videoDragging, setVideoDragging] = useState(false);
  const [idDragging, setIdDragging] = useState(false);

  useEffect(() => {
    fetch('/api/uploads/video')
      .then((r) => r.json())
      .then((c: { provider?: 'blob' | 'inline'; maxBytes?: number }) => {
        if (c?.maxBytes) {
          setVideoCap({
            provider: c.provider === 'blob' ? 'blob' : 'inline',
            maxBytes: c.maxBytes,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  const takeVideoFile = (f: File | null) => {
    setUploadError(null);
    if (!f) {
      setVideoFile(null);
      return;
    }
    if (!isAllowedVideoMime(f.type, f.name)) {
      setUploadError(
        isRTL
          ? 'صيغة الفيديو غير مدعومة. استخدم MP4 أو MOV أو WebM.'
          : 'Unsupported video type. Use MP4, MOV, or WebM.',
      );
      return;
    }
    if (f.size > videoCap.maxBytes) {
      setUploadError(
        isRTL
          ? `الفيديو أكبر من ${formatBytes(videoCap.maxBytes)}. صغّر الملف أو فعّل تخزين الكائنات.`
          : `Video is larger than ${formatBytes(videoCap.maxBytes)}. Compress it, or enable object storage for 50MB clips.`,
      );
      return;
    }
    setVideoFile(f);
  };

  /* ── Form validation ── */
  const isValid =
    fullNameAr.trim() !== '' &&
    fullNameEn.trim() !== '' &&
    email.trim() !== '' &&
    phone.trim() !== '' &&
    yearsExperience !== '' &&
    roles.length > 0 &&
    industries.length > 0 &&
    languages.length > 0 &&
    priceTier !== '' &&
    terms;

  /* ── Handlers ── */
  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleIndustry = (industry: string) => {
    setIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleDragOver = (e: React.DragEvent, setter: (v: boolean) => void) => {
    e.preventDefault();
    setter(true);
  };

  const handleDragLeave = (e: React.DragEvent, setter: (v: boolean) => void) => {
    e.preventDefault();
    setter(false);
  };

  const handleDrop = (
    e: React.DragEvent,
    setter: (v: boolean) => void,
    fileSetter: (f: File | null) => void
  ) => {
    e.preventDefault();
    setter(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) {
      if (fileSetter === setVideoFile) takeVideoFile(file);
      else fileSetter(file);
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid || loading) return;

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('fullNameAr', fullNameAr);
        formData.append('fullNameEn', fullNameEn);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('linkedIn', linkedIn);
        formData.append('yearsExperience', yearsExperience);
        formData.append('roles', JSON.stringify(roles));
        formData.append('industries', JSON.stringify(industries));
        formData.append('languages', JSON.stringify(languages));
        formData.append('priceTier', priceTier);
        if (videoFile) {
          if (videoCap.provider === 'blob') {
            const { upload } = await import('@vercel/blob/client');
            const blob = await upload(videoFile.name, videoFile, {
              access: 'public',
              handleUploadUrl: '/api/uploads/video',
            });
            formData.append('videoIntroUrl', blob.url);
          } else {
            formData.append('videoIntro', videoFile);
          }
        }
        if (idFile) formData.append('idVerification', idFile);

        const res = await fetch('/api/interviewers/apply', {
          method: 'POST',
          body: formData,
        });
        const data = (await res.json().catch(() => ({}))) as {
          success?: boolean;
          error?: { ar?: string; en?: string } | string;
        };
        if (!res.ok || data.success === false) {
          const err =
            typeof data.error === 'string'
              ? data.error
              : isRTL
                ? data.error?.ar
                : data.error?.en;
          setUploadError(err || (isRTL ? 'تعذّر إرسال الطلب.' : 'Could not submit application.'));
          return;
        }

        setSubmitted(true);
      } catch {
        setUploadError(isRTL ? 'تعذّر رفع الفيديو. حاول مرة أخرى.' : 'Could not upload the video. Try again.');
      } finally {
        setLoading(false);
      }
    },
    [
      isValid,
      loading,
      fullNameAr,
      fullNameEn,
      email,
      phone,
      linkedIn,
      yearsExperience,
      roles,
      industries,
      languages,
      priceTier,
      videoFile,
      idFile,
      videoCap,
      isRTL,
    ]
  );

  /* ── Success View ── */
  if (submitted) {
    return (
      <AtelierShell>
        <div className="mq-wrap flex flex-1 items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="flex flex-col items-center text-center"
          >
            <CheckCircle2 size={64} strokeWidth={1.5} className="text-teal-300" />
            <h1 className="mq-display mt-6 text-3xl font-bold text-white">
              {t('successTitle')}
            </h1>
            <p className="mt-3 text-lg text-white/70">{t('successSubtext')}</p>
            <Link
              href="/"
              className={cn(
                'mq-btn mq-btn-primary mt-8 inline-flex items-center gap-2 px-8 py-3 text-base',
              )}
            >
              {t('backHome')}
              <ArrowRight
                size={16}
                className={cn('transition-transform', isRTL ? 'rotate-180' : '')}
              />
            </Link>
          </motion.div>
        </div>
      </AtelierShell>
    );
  }

  /* ── Form View ── */
  return (
    <AtelierShell showHeroLogo>
      <div className="mq-wrap mx-auto max-w-2xl pb-20 pt-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={itemVariants}
            className="mq-display mb-8 text-center text-3xl font-bold text-white"
          >
            {t('title')}
          </motion.h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* ── Full Name (Arabic) ── */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <Label className="text-sm text-[var(--text-muted)]">
                {t('fullNameAr')}
              </Label>
              <Input
                value={fullNameAr}
                onChange={(e) => setFullNameAr(e.target.value)}
                dir="rtl"
                className="glass-input h-11 w-full rounded-lg px-4"
              />
            </motion.div>

            {/* ── Full Name (English) ── */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <Label className="text-sm text-[var(--text-muted)]">
                {t('fullNameEn')}
              </Label>
              <Input
                value={fullNameEn}
                onChange={(e) => setFullNameEn(e.target.value)}
                dir="ltr"
                className="glass-input h-11 w-full rounded-lg px-4"
              />
            </motion.div>

            {/* ── Email ── */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <Label className="text-sm text-[var(--text-muted)]">
                {t('email')}
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="glass-input h-11 w-full rounded-lg px-4"
              />
            </motion.div>

            {/* ── Phone ── */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <Label className="text-sm text-[var(--text-muted)]">
                {t('phone')}
              </Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                placeholder="+966 5XX XXX XXXX"
                className="glass-input h-11 w-full rounded-lg px-4 placeholder:text-[var(--text-faint)]"
              />
            </motion.div>

            {/* ── LinkedIn ── */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <Label className="text-sm text-[var(--text-muted)]">
                {t('linkedIn')}
              </Label>
              <Input
                type="url"
                value={linkedIn}
                onChange={(e) => setLinkedIn(e.target.value)}
                dir="ltr"
                placeholder="https://linkedin.com/in/..."
                className="glass-input h-11 w-full rounded-lg px-4 placeholder:text-[var(--text-faint)]"
              />
            </motion.div>

            {/* ── Years of Experience ── */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <Label className="text-sm text-[var(--text-muted)]">
                {t('yearsExperience')}
              </Label>
              <Select value={yearsExperience} onValueChange={setYearsExperience}>
                <SelectTrigger className="glass-input h-11 w-full rounded-lg px-4">
                  <SelectValue placeholder={t('yearsExperience')} />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[var(--bg-panel)]">
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-[var(--text-primary)] focus:bg-white/5 focus:text-teal-300"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* ── Roles (multi-select checkbox grid) ── */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <Label className="text-sm text-[var(--text-muted)]">
                {t('roles')}
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ROLES.map((role) => {
                  const selected = roles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-start text-sm transition-all',
                        selected
                          ? 'border-teal-300/50 bg-teal-300/10 text-teal-300'
                          : 'border-white/10 bg-transparent text-[var(--text-muted)] hover:border-white/20 hover:bg-white/[0.02]'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
                          selected
                            ? 'border-teal-300 bg-teal-300'
                            : 'border-white/20'
                        )}
                      >
                        {selected && <Check size={12} className="text-black" />}
                      </div>
                      <span className="truncate">{role}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Industries (multi-select checkbox grid) ── */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <Label className="text-sm text-[var(--text-muted)]">
                {t('industries')}
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {INDUSTRIES.map((industry) => {
                  const selected = industries.includes(industry);
                  return (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => toggleIndustry(industry)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-start text-sm transition-all',
                        selected
                          ? 'border-teal-300/50 bg-teal-300/10 text-teal-300'
                          : 'border-white/10 bg-transparent text-[var(--text-muted)] hover:border-white/20 hover:bg-white/[0.02]'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
                          selected
                            ? 'border-teal-300 bg-teal-300'
                            : 'border-white/20'
                        )}
                      >
                        {selected && <Check size={12} className="text-black" />}
                      </div>
                      <span className="truncate">{industry}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Languages (toggle chips) ── */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <Label className="text-sm text-[var(--text-muted)]">
                {t('languages')}
              </Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => {
                  const selected = languages.includes(lang.key);
                  return (
                    <button
                      key={lang.key}
                      type="button"
                      onClick={() => toggleLanguage(lang.key)}
                      className={cn(
                        'rounded-full border px-5 py-2 text-sm font-medium transition-all',
                        selected
                          ? 'border-teal-300 bg-teal-300/15 text-teal-300'
                          : 'border-white/15 bg-transparent text-[var(--text-muted)] hover:border-white/25 hover:text-[var(--text-primary)]'
                      )}
                    >
                      {isRTL ? lang.label : lang.labelEn}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Price Tier (radio cards) ── */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <Label className="text-sm text-[var(--text-muted)]">
                {t('priceTier')}
              </Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {PRICE_TIERS.map((tier) => {
                  const selected = priceTier === tier.value;
                  return (
                    <button
                      key={tier.value}
                      type="button"
                      onClick={() => setPriceTier(tier.value)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl border px-4 py-4 text-center transition-all',
                        selected
                          ? 'border-teal-300 bg-teal-300/10'
                          : 'border-white/10 bg-transparent hover:border-white/20 hover:bg-white/[0.02]'
                      )}
                    >
                      <span
                        className={cn(
                          'text-lg font-bold',
                          selected ? 'text-teal-300' : 'text-[var(--text-primary)]'
                        )}
                      >
                        {tier.price}
                      </span>
                      <span
                        className={cn(
                          'text-xs',
                          selected ? 'text-teal-300' : 'text-[var(--text-muted)]'
                        )}
                      >
                        {t(tier.labelKey as Parameters<typeof t>[0])}
                      </span>
                      {selected && (
                        <CheckCircle2
                          size={16}
                          className="mt-1 text-teal-300"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Video Introduction Upload ── */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <Label className="text-sm text-[var(--text-muted)]">
                {t('videoIntro')}
              </Label>
              <FileUploadZone
                file={videoFile}
                onFileChange={takeVideoFile}
                accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                helpText={t('videoIntroHelp')}
                formatsText={
                  isRTL
                    ? `MP4 أو MOV أو WebM — حتى ${formatBytes(videoCap.maxBytes)}`
                    : `MP4, MOV, WebM — up to ${formatBytes(videoCap.maxBytes)}`
                }
                icon={FileVideo}
                isDragging={videoDragging}
                onDragOver={(e) => handleDragOver(e, setVideoDragging)}
                onDragLeave={(e) => handleDragLeave(e, setVideoDragging)}
                onDrop={(e) => handleDrop(e, setVideoDragging, setVideoFile)}
              />
            </motion.div>

            {/* ── ID Verification Upload ── */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <Label className="text-sm text-[var(--text-muted)]">
                {t('idVerification')}
              </Label>
              <FileUploadZone
                file={idFile}
                onFileChange={setIdFile}
                accept="image/jpeg,image/png,application/pdf"
                helpText={t('idVerificationHelp')}
                formatsText={t('idVerificationFormats')}
                icon={FileText}
                isDragging={idDragging}
                onDragOver={(e) => handleDragOver(e, setIdDragging)}
                onDragLeave={(e) => handleDragLeave(e, setIdDragging)}
                onDrop={(e) => handleDrop(e, setIdDragging, setIdFile)}
              />
            </motion.div>

            {/* ── Terms ── */}
            <motion.div variants={itemVariants} className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={terms}
                onCheckedChange={(checked) => setTerms(checked === true)}
                className="mt-0.5 border-white/20 data-[state=checked]:border-teal-300 data-[state=checked]:bg-teal-300 data-[state=checked]:text-[#070b14]"
              />
              <Label
                htmlFor="terms"
                className="cursor-pointer text-sm leading-relaxed text-white/55"
              >
                {t('terms')}
              </Label>
            </motion.div>

            {uploadError ? (
              <p className="text-sm text-rose-300" role="alert">
                {uploadError}
              </p>
            ) : null}

            {/* ── Submit ── */}
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                disabled={!isValid || loading}
                className={cn(
                  'mq-btn mq-btn-primary h-12 w-full text-base',
                  'disabled:cursor-not-allowed disabled:opacity-40'
                )}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    ...
                  </span>
                ) : (
                  t('submit')
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </AtelierShell>
  );
}
