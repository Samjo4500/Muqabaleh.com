'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/brand';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ResetPasswordForm() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const params = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError(isAr ? 'رابط غير صالح.' : 'Invalid reset link.');
      return;
    }
    if (password.length < 8) {
      setError(
        isAr
          ? 'كلمة المرور 8 أحرف على الأقل.'
          : 'Password must be at least 8 characters.',
      );
      return;
    }
    if (password !== confirm) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(
          data.error || (isAr ? 'تعذّر التعيين.' : 'Could not reset password.'),
        );
        return;
      }
      setDone(true);
    } catch {
      setError(isAr ? 'تعذّر التعيين.' : 'Could not reset password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={isAr ? 'تعيين كلمة مرور جديدة' : 'Set a new password'}
      subtitle={
        isAr
          ? 'أدخل كلمة مرور جديدة لحسابك في مقابلة.'
          : 'Choose a new password for your Muqabaleh account.'
      }
      showBack
    >
      {done ? (
        <div className="space-y-4 text-center">
          <p className="text-emerald-300">
            {isAr ? 'تم تحديث كلمة المرور بنجاح.' : 'Password updated successfully.'}
          </p>
          <Link
            href={locale === 'ar' ? '/auth/signin' : '/en/auth/signin'}
            className="mq-btn mq-btn-primary inline-flex"
          >
            {isAr ? 'تسجيل الدخول' : 'Sign in'}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-white/60">
              {isAr ? 'كلمة المرور الجديدة' : 'New password'}
            </Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input h-11"
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-white/60">
              {isAr ? 'تأكيد كلمة المرور' : 'Confirm password'}
            </Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="glass-input h-11"
              autoComplete="new-password"
            />
          </div>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="mq-btn mq-btn-primary min-h-[48px] disabled:opacity-50"
          >
            {busy
              ? isAr
                ? 'جارٍ الحفظ…'
                : 'Saving…'
              : isAr
                ? 'حفظ كلمة المرور'
                : 'Save password'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
