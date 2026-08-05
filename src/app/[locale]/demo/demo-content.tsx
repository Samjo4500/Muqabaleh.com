'use client';

import { useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { easeCrystal } from '@/components/landing/crystal/motion';
import { AtelierFlowShell } from '@/components/landing/crystal/AtelierFlowShell';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { localePath } from '@/i18n/navigation';

export default function DemoContent({
  isAuthenticated,
  userEmail,
}: {
  isAuthenticated: boolean;
  userEmail?: string | null;
}) {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === 'ar';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prequalPath = localePath('/interview/prequal', locale);

  const startAsAuthenticated = () => {
    router.push(prequalPath);
  };

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setError(isAr ? 'أدخل اسمك' : 'Enter your name');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(isAr ? 'أدخل بريداً إلكترونياً صالحاً' : 'Enter a valid email');
      return;
    }
    if (password.length < 8) {
      setError(
        isAr ? 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل' : 'Password must be at least 8 characters',
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType: 'INDIVIDUAL',
          name: trimmedName,
          email: trimmedEmail,
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        const login = await signIn('credentials', {
          email: trimmedEmail,
          password,
          redirect: false,
        });
        if (login?.ok) {
          router.push(prequalPath);
          return;
        }
        setError(
          isAr
            ? 'هذا البريد مسجّل. سجّل الدخول للمتابعة.'
            : 'This email is already registered. Sign in to continue.',
        );
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || (isAr ? 'تعذّر إنشاء الحساب' : 'Could not create account'));
      }

      const login = await signIn('credentials', {
        email: trimmedEmail,
        password,
        redirect: false,
      });
      if (!login?.ok) {
        router.push(
          `${localePath('/auth/signin', locale)}?callbackUrl=${encodeURIComponent(prequalPath)}`,
        );
        return;
      }
      router.push(prequalPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : isAr ? 'حدث خطأ' : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <AtelierFlowShell>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-10 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeCrystal }}
          className="mq-panel rounded-3xl p-6 md:p-10"
        >
          <div className="flex justify-center">
            <BrandLogo size="md" priority className="mq-logo-glow" />
          </div>
          <h1 className="mq-display mt-5 text-center text-xl font-medium text-white md:text-2xl">
            {isAr ? 'مقابلة تجريبية بالذكاء الاصطناعي' : 'AI mock interview practice'}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-white/60">
            {isAr
              ? 'خصّص جلستك حسب دورك ومستواك، ثم احصل على ملاحظات فورية.'
              : 'Personalize a session for your role and level, then get instant feedback.'}
          </p>

          {isAuthenticated ? (
            <div className="mt-8 space-y-4">
              {userEmail ? (
                <p className="text-center text-sm text-white/55">
                  {isAr ? 'متصل باسم ' : 'Signed in as '}
                  <span className="text-white">{userEmail}</span>
                </p>
              ) : null}
              <button
                type="button"
                onClick={startAsAuthenticated}
                className="mq-btn mq-btn-primary w-full py-3.5 text-sm"
              >
                {isAr ? 'ابدأ مقابلتك' : 'Start your interview'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleCapture} className="mt-8 space-y-4" noValidate>
              <div>
                <label htmlFor="demo-name" className="mb-1.5 block text-sm text-white/60">
                  {isAr ? 'الاسم' : 'Name'}
                </label>
                <input
                  id="demo-name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm"
                  placeholder={isAr ? 'اسمك الكامل' : 'Your full name'}
                />
              </div>
              <div>
                <label htmlFor="demo-email" className="mb-1.5 block text-sm text-white/60">
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  id="demo-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="demo-password" className="mb-1.5 block text-sm text-white/60">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <input
                  id="demo-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm"
                  placeholder={isAr ? '٨ أحرف على الأقل' : 'At least 8 characters'}
                />
              </div>

              {error ? (
                <p className="text-sm text-rose-300" role="alert">
                  {error}{' '}
                  {error.toLowerCase().includes('registered') || error.includes('مسجّل') ? (
                    <Link
                      href={`${localePath('/auth/signin', locale)}?callbackUrl=${encodeURIComponent(prequalPath)}`}
                      className="text-teal-200 underline"
                    >
                      {isAr ? 'تسجيل الدخول' : 'Sign in'}
                    </Link>
                  ) : null}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mq-btn mq-btn-primary inline-flex w-full items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isAr ? 'متابعة إلى مقابلتك' : 'Continue to your interview'}
              </button>

              <p className="text-center text-xs text-white/50">
                {isAr ? 'لديك حساب؟ ' : 'Already have an account? '}
                <Link
                  href={`${localePath('/auth/signin', locale)}?callbackUrl=${encodeURIComponent(prequalPath)}`}
                  className="text-teal-200 hover:text-teal-100"
                >
                  {isAr ? 'سجّل الدخول' : 'Sign in'}
                </Link>
              </p>
            </form>
          )}
        </motion.div>
      </main>
    </AtelierFlowShell>
  );
}
