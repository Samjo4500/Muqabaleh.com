'use client';

import { useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { easeCrystal } from '@/components/landing/crystal/motion';
import { AppChromeHeader } from '@/components/chrome/AppChromeHeader';
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-teal-400/25 blur-[100px] will-change-transform"
          animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-0 top-24 h-80 w-80 rounded-full bg-amber-300/15 blur-[110px] will-change-transform"
          animate={{ x: [0, -50, 20, 0], y: [0, -25, 35, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <AppChromeHeader />

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-10 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeCrystal }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur md:p-10"
        >
          <p className="font-display text-4xl tracking-tight text-[var(--text-primary)] md:text-5xl">
            Muqabaleh
          </p>
          <h1 className="mt-3 text-xl font-medium text-[var(--text-primary)] md:text-2xl">
            {isAr ? 'مقابلة تجريبية بالذكاء الاصطناعي' : 'AI mock interview practice'}
          </h1>
          <p className="mt-3 max-w-xl text-[var(--text-secondary)]">
            {isAr
              ? 'خصّص جلستك حسب دورك ومستواك، ثم احصل على ملاحظات فورية.'
              : 'Personalize a session for your role and level, then get instant feedback.'}
          </p>

          {isAuthenticated ? (
            <div className="mt-8 space-y-4">
              {userEmail ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  {isAr ? 'متصل باسم ' : 'Signed in as '}
                  <span className="text-[var(--text-primary)]">{userEmail}</span>
                </p>
              ) : null}
              <button
                type="button"
                onClick={startAsAuthenticated}
                className="w-full rounded-xl bg-teal-300 px-5 py-3.5 text-sm font-semibold text-[var(--bg-deep)]"
              >
                {isAr ? 'ابدأ مقابلتك' : 'Start your interview'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleCapture} className="mt-8 space-y-4" noValidate>
              <div>
                <label htmlFor="demo-name" className="mb-1.5 block text-sm text-[var(--text-secondary)]">
                  {isAr ? 'الاسم' : 'Name'}
                </label>
                <input
                  id="demo-name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm outline-none focus:border-teal-400/50"
                  placeholder={isAr ? 'اسمك الكامل' : 'Your full name'}
                />
              </div>
              <div>
                <label htmlFor="demo-email" className="mb-1.5 block text-sm text-[var(--text-secondary)]">
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
                  className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm outline-none focus:border-teal-400/50"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="demo-password"
                  className="mb-1.5 block text-sm text-[var(--text-secondary)]"
                >
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
                  className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm outline-none focus:border-teal-400/50"
                  placeholder={isAr ? '٨ أحرف على الأقل' : 'At least 8 characters'}
                />
              </div>

              {error ? (
                <p className="text-sm text-rose-300" role="alert">
                  {error}{' '}
                  {error.toLowerCase().includes('registered') || error.includes('مسجّل') ? (
                    <Link
                      href={`${localePath('/auth/signin', locale)}?callbackUrl=${encodeURIComponent(prequalPath)}`}
                      className="underline text-teal-200"
                    >
                      {isAr ? 'تسجيل الدخول' : 'Sign in'}
                    </Link>
                  ) : null}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3.5 text-sm font-semibold text-[var(--bg-deep)] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isAr ? 'متابعة إلى مقابلتك' : 'Continue to your interview'}
              </button>

              <p className="text-center text-xs text-[var(--text-secondary)]">
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
    </div>
  );
}
