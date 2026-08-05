'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { localePath } from '@/i18n/navigation';

function RequestDemoForm() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const isAr = locale === 'ar';
  const source = searchParams.get('from') || 'request-demo';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, phone, teamSize, message, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || (isAr ? 'تعذّر الإرسال' : 'Could not submit'));
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : isAr ? 'حدث خطأ' : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mq-panel mt-10 rounded-2xl p-8 text-center">
        <CheckCircle2 className="mx-auto text-teal-300" size={48} strokeWidth={1.5} />
        <h2 className="mt-4 text-xl font-bold text-white">
          {isAr ? 'تم استلام طلبك' : 'Request received'}
        </h2>
        <p className="mt-2 text-sm text-white/55">
          {isAr
            ? 'سيتواصل معك فريق المبيعات قريباً لتفعيل الوصول.'
            : 'Our team will reach out shortly to enable access.'}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={localePath('/b2b', locale)} className="mq-btn mq-btn-ghost px-5 py-3 text-sm">
            {isAr ? 'معاينة اللوحة' : 'Preview console'}
          </Link>
          <Link href={localePath('/business', locale)} className="mq-btn mq-btn-primary px-5 py-3 text-sm">
            {isAr ? 'العودة للأعمال' : 'Back to Business'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mq-panel mt-10 space-y-4 rounded-2xl p-6 md:p-8" noValidate>
      <Field label={isAr ? 'الاسم' : 'Name'}>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="glass-input w-full rounded-xl px-4 py-3 text-sm"
          placeholder={isAr ? 'اسمك الكامل' : 'Your full name'}
        />
      </Field>
      <Field label={isAr ? 'البريد الإلكتروني للعمل' : 'Work email'}>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="glass-input w-full rounded-xl px-4 py-3 text-sm"
          placeholder="you@company.com"
        />
      </Field>
      <Field label={isAr ? 'الشركة' : 'Company'}>
        <input
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="glass-input w-full rounded-xl px-4 py-3 text-sm"
          placeholder={isAr ? 'اسم الشركة' : 'Company name'}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={isAr ? 'الهاتف (اختياري)' : 'Phone (optional)'}>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="glass-input w-full rounded-xl px-4 py-3 text-sm"
          />
        </Field>
        <Field label={isAr ? 'حجم الفريق' : 'Team size'}>
          <select
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="glass-input w-full rounded-xl px-4 py-3 text-sm"
          >
            <option value="">{isAr ? 'اختر' : 'Select'}</option>
            <option value="1-10">1–10</option>
            <option value="11-50">11–50</option>
            <option value="51-200">51–200</option>
            <option value="200+">200+</option>
          </select>
        </Field>
      </div>
      <Field label={isAr ? 'ماذا تحتاج؟ (اختياري)' : 'What do you need? (optional)'}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="glass-input w-full resize-none rounded-xl px-4 py-3 text-sm"
          placeholder={
            isAr
              ? 'مثلاً: فرز مرشحين، ATS، مقابلات بالذكاء الاصطناعي…'
              : 'e.g. candidate screening, ATS, AI interviews…'
          }
        />
      </Field>

      {error ? (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mq-btn mq-btn-primary inline-flex w-full items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isAr ? 'إرسال الطلب' : 'Submit request'}
      </button>

      <p className="text-center text-xs text-white/40">
        {isAr ? 'يمكنك أيضاً ' : 'You can also '}
        <Link href={localePath('/b2b', locale)} className="text-teal-300 hover:text-teal-200">
          {isAr ? 'معاينة اللوحة' : 'preview the console'}
        </Link>
        {isAr ? ' ببيانات تجريبية.' : ' with sample data.'}
      </p>
    </form>
  );
}

export function RequestDemoClient() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <AtelierShell showHeroLogo>
      <div className="mq-wrap mx-auto max-w-xl py-10 md:py-16">
        <p className="text-center text-xs font-bold tracking-[0.18em] text-teal-300/80">
          {isAr ? 'مقابلة للأعمال' : 'MUQABALEH FOR BUSINESS'}
        </p>
        <h1 className="mq-display mt-3 text-center text-3xl font-bold text-white md:text-4xl">
          {isAr ? 'اطلب عرضاً توضيحياً' : 'Request a demo'}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-center text-white/55">
          {isAr
            ? 'أخبرنا عن فريقك وسنتواصل لتفعيل معاينة كاملة للوحة التوظيف.'
            : 'Tell us about your team and we will unlock a guided walkthrough of the hiring console.'}
        </p>

        <Suspense
          fallback={
            <div className="mq-panel mt-10 rounded-2xl p-8 text-center text-white/50">…</div>
          }
        >
          <RequestDemoForm />
        </Suspense>
      </div>
    </AtelierShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-white/60">{label}</span>
      {children}
    </label>
  );
}
