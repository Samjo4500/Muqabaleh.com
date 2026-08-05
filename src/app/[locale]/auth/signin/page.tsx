'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Loader2, AlertTriangle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

import { AuthShell } from '@/components/brand';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordField } from '@/components/auth/PasswordField';

export default function SignInPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [demoMode, setDemoMode] = useState(false);
  const [dbAvailable, setDbAvailable] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        setDemoMode(data.demoMode === true);
        setDbAvailable(!data.demoMode);
      })
      .catch(() => {
        setDemoMode(true);
        setDbAvailable(false);
      });
  }, []);

  const emailError =
    touched.email && !email
      ? t('errorEmailRequired')
      : touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? t('errorEmailInvalid')
        : '';

  const passwordError = touched.password && !password ? t('errorPasswordRequired') : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (emailError || passwordError || !email || !password) return;

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        totpCode: totpCode || undefined,
        rememberMe: rememberMe ? 'true' : 'false',
        redirect: false,
      });

      if (result?.error) {
        toast.error(t('loginFailed') || 'البريد أو كلمة المرور غير صحيحة');
      } else {
        router.push(`/${locale}/app`);
        router.refresh();
      }
    } catch {
      toast.error(t('loginFailed') || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title={t('signinTitle')} showBack>
      {!dbAvailable && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-400">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            {locale === 'ar'
              ? 'قاعدة البيانات غير متصلة. أدخل أي بريد وكلمة مرور للدخول كوضع عرض.'
              : 'Database not connected. Enter any email & password to browse as demo.'}
          </span>
        </div>
      )}
      {demoMode && dbAvailable && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-400">
          <Zap size={14} className="mt-0.5 shrink-0" />
          <span>
            {locale === 'ar'
              ? 'وضع العرض التوضيحي — أدخل أي بريد وكلمة مرور للدخول.'
              : 'Demo mode — enter any email & password to sign in.'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="signin-email" className="text-white/60">
            {t('email')}
          </Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/40"
              size={18}
              strokeWidth={1.75}
            />
            <Input
              id="signin-email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              aria-invalid={!!emailError}
              className={
                'glass-input h-11 ps-10' +
                (emailError ? ' !border-red-500 focus-visible:!border-red-500' : '')
              }
              autoComplete="email"
            />
          </div>
          {emailError ? (
            <p className="text-xs text-red-400" role="alert">
              {emailError}
            </p>
          ) : null}
        </div>

        <PasswordField
          id="signin-password"
          label={t('password')}
          value={password}
          onChange={setPassword}
          onBlur={() => setTouched((p) => ({ ...p, password: true }))}
          placeholder={t('passwordPlaceholder')}
          autoComplete="current-password"
          error={passwordError}
          showLabel={t('showPassword')}
          hideLabel={t('hidePassword')}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(v) => setRememberMe(v === true)}
              id="remember-me"
            />
            <span>{t('rememberMe')}</span>
          </label>
          <Link
            href={`/${locale}/auth/forgot-password`}
            className="text-sm text-teal-300 transition hover:text-teal-200"
          >
            {t('forgotLink')}
          </Link>
        </div>

        <details className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
          <summary className="cursor-pointer text-xs text-white/60">
            {locale === 'ar' ? 'رمز التحقق الثنائي (اختياري للمشرف)' : '2FA code (optional for admin)'}
          </summary>
          <div className="mt-2">
            <Input
              id="signin-totp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="glass-input h-11"
            />
          </div>
        </details>

        <button
          type="submit"
          disabled={loading}
          className="mq-btn mq-btn-primary flex w-full min-h-[48px] cursor-pointer items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : null}
          {t('login')}
        </button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-white/40">{t('or')}</span>
          <Separator className="flex-1" />
        </div>

        <p className="text-center text-sm text-white/60">
          {t('noAccount')}{' '}
          <Link
            href={`/${locale}/auth/register`}
            className="font-semibold text-teal-300 transition-colors hover:text-teal-200"
          >
            {t('createAccount')}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
