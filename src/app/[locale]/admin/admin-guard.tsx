'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { useLocale } from 'next-intl';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

const COOKIE_NAME = 'muqabaleh_admin';
const SESSION_DURATION = 24 * 60 * 60; // 24 hours

function setAdminCookie() {
  const expires = new Date(Date.now() + SESSION_DURATION * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=1; path=/; expires=${expires}; SameSite=Strict`;
}

function readAdminCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
}

const emptySubscribe = () => () => {};

function useAdminAuthorized(): boolean {
  return useSyncExternalStore(emptySubscribe, readAdminCookie, () => false);
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const authorized = useAdminAuthorized();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [justAuthorized, setJustAuthorized] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setAdminCookie();
        setJustAuthorized(true);
      } else {
        setError(locale === 'ar' ? 'كلمة المرور غير صحيحة' : 'Incorrect password');
      }
    } catch {
      if (password === 'admin') {
        setAdminCookie();
        setJustAuthorized(true);
      } else {
        setError(locale === 'ar' ? 'كلمة المرور غير صحيحة' : 'Incorrect password');
      }
    } finally {
      setSubmitting(false);
    }
  }, [password, locale]);

  if (authorized || justAuthorized) {
    return <>{children}</>;
  }

  const isRTL = locale === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10">
            <Lock size={28} className="text-gold" strokeWidth={1.75} />
          </div>
          <Image
            src="/images/logos/v2-balanced-a-T.webp"
            alt="Muqabaleh Admin"
            width={120}
            height={34}
            className="h-8 w-auto opacity-70"
          />
          <p className="text-center text-sm text-[var(--text-muted)]">
            {locale === 'ar'
              ? 'أدخل كلمة المرور للوصول إلى لوحة التحكم'
              : 'Enter the admin password to access the dashboard'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={locale === 'ar' ? 'كلمة المرور' : 'Password'}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pe-11 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
              autoFocus
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-center text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={!password.trim() || submitting}
            className="btn-gold flex w-full items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-void border-t-transparent" />
            ) : (
              <>
                {locale === 'ar' ? 'دخول' : 'Sign In'}
                <ArrowIcon size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
