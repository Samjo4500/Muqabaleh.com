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
  const intent = searchParams.get('intent') || 'demo';

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
        body: JSON.stringify({
          name,
          email,
          company,
          phone,
          teamSize,
          message,
          source: intent === 'quote' ? `${source}:quote` : source,
        }),
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
        {intent === 'quote'
          ? isAr
            ? 'اطلب عرض السعر'
            : 'Request quote'
          : isAr
            ? 'اطلب العرض'
            : 'Request demo'}
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

function RequestDemoHeader() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const searchParams = useSearchParams();
  const isQuote = searchParams.get('intent') === 'quote';

  return (
    <>
      <p className="text-center text-xs font-bold tracking-[0.18em] text-teal-300/80">
        {isAr ? 'مقابلة' : 'MUQABALEH'}
      </p>
      <h1 className="mq-display mt-3 text-center text-3xl font-bold text-white md:text-4xl">
        {isQuote
          ? isAr
            ? 'احصل على عرض سعر'
            : 'Get a quote'
          : isAr
            ? 'اطلب عرضاً توضيحياً'
            : 'Request a demo'}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-white/55">
        {isQuote
          ? isAr
            ? 'أخبرنا عن احتياجك وسنرسل عرض سعر مخصّصاً — بدون أسعار عامة.'
            : 'Tell us what you need and we’ll send tailored pricing — no public rates.'
          : isAr
            ? 'أخبرنا عن فريقك وسنتواصل لتفعيل معاينة كاملة.'
            : 'Tell us about your team and we will unlock a guided walkthrough.'}
      </p>
    </>
  );
}

export function RequestDemoClient() {
  return (
    <AtelierShell showHeroLogo>
      <div className="mq-wrap mx-auto max-w-3xl py-10 md:py-16">
        <Suspense
          fallback={
            <div className="text-center text-white/50">…</div>
          }
        >
          <RequestDemoHeader />
          <RequestDemoPitch />
          <RequestDemoForm />
          <RequestDemoFollowup />
        </Suspense>
      </div>
    </AtelierShell>
  );
}

function RequestDemoPitch() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const audiences = isAr
    ? [
        { title: 'فرق التوظيف', body: 'فرز منظّم للجاهزية قبل الجولات الطويلة.' },
        { title: 'فرق المواهب', body: 'إشارة موحّدة بعد تدرّب المرشّح مع جيني.' },
        { title: 'وكالات التوظيف', body: 'جهّز المرشّحين ثم شارك النتائج بصلاحيات محددة.' },
        { title: 'الجامعات ومراكز المهنة', body: 'درّب أفواجاً بالعربية والإنجليزية بهوية مؤسستك.' },
      ]
    : [
        { title: 'Hiring teams', body: 'Structured readiness screening before long interview loops.' },
        { title: 'Talent teams', body: 'A consistent signal after candidates practise with Jeannie.' },
        { title: 'Recruitment agencies', body: 'Prep candidates, then share permission-scoped outcomes.' },
        { title: 'Universities & career teams', body: 'Train a cohort in Arabic and English under your brand.' },
      ];

  const steps = isAr
    ? [
        { n: '01', title: 'جهّز الدور', body: 'حدد عائلة الدور ومعايير الجاهزية التي تهم فريقك.' },
        { n: '02', title: 'ادعُ المرشّحين', body: 'أرسل رابط التدرّب — بالعربية أو الإنجليزية.' },
        { n: '03', title: 'راجع النتائج بصلاحيات محددة', body: 'اقرأ إشارات الجاهزية التي صُرّح لك بها — دون بيانات خاصة غير مأذونة.' },
      ]
    : [
        { n: '01', title: 'Set up the role', body: 'Define the role family and the readiness criteria that matter to your team.' },
        { n: '02', title: 'Invite candidates', body: 'Send a practice link — Arabic or English.' },
        { n: '03', title: 'Review permission-scoped outcomes', body: 'See the readiness signal you are allowed to see — not private data without consent.' },
      ];

  return (
    <div className="mt-10 space-y-8">
      <section>
        <h2 className="mq-display text-lg font-bold text-white md:text-xl">
          {isAr ? 'لمن مقابلة؟' : 'Who Muqabaleh is for'}
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {audiences.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
            >
              <p className="text-sm font-bold text-white">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/55">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mq-display text-lg font-bold text-white md:text-xl">
          {isAr ? 'ثلاث خطوات بسيطة' : 'A simple three-step flow'}
        </h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.n}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
            >
              <p className="text-xs font-bold tracking-[0.16em] text-teal-300/80">{step.n}</p>
              <p className="mt-2 text-sm font-bold text-white">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/55">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-teal-300/20 bg-teal-400/[0.06] px-5 py-5">
        <p className="text-sm font-bold text-white">
          {isAr ? 'خصوصية واستخدام مسؤول' : 'Privacy and responsible use'}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          {isAr
            ? 'مقابلة تدعم مسارات جاهزية وفرز منظّمة. ينبغي استخدامها مع قرار بشري مسؤول، وليست بديلاً عن عملية التوظيف القانونية. الجواز خاص افتراضياً.'
            : 'Muqabaleh supports structured readiness and screening workflows. Use it with responsible human decision-making — it does not replace a lawful hiring process. Passports stay private by default.'}
        </p>
        <Link
          href={localePath('/how-scores-work', locale)}
          className="mt-3 inline-flex text-sm font-semibold text-teal-300 hover:text-teal-200"
        >
          {isAr ? 'كيف تعمل درجات مقابلة' : 'How Muqabaleh scores work'}
        </Link>
      </section>

      <section>
        <h2 className="mq-display text-lg font-bold text-white md:text-xl">
          {isAr ? 'تجربة محدودة وواضحة' : 'Start with a focused pilot'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          {isAr
            ? 'فريق أو فوج واحد. عائلة دور واحدة. نتيجة قابلة للقياس — مثل وقت الفرز أو جاهزية المرشّحين قبل المقابلة البشرية.'
            : 'One team or cohort. One role family. A measurable outcome — such as screening time or candidate readiness before the human interview.'}
        </p>
      </section>
    </div>
  );
}

function RequestDemoFollowup() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  return (
    <p className="mt-5 text-center text-sm text-white/50">
      {isAr
        ? 'نرد خلال يوم عمل واحد. بلا رسائل مزعجة. بلا التزام.'
        : 'We respond within one business day. No spam. No obligation.'}
    </p>
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
