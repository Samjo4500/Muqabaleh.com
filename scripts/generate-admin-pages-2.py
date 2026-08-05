#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "app" / "[locale]" / "admin"

def write(rel: str, content: str) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print("wrote", rel)

write(
    "payments/overview/page.tsx",
    r'''
'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { L } from '@/lib/admin/labels';
import { DollarSign, Percent, AlertTriangle, Globe2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function Page() {
  const [stats, setStats] = useState<{
    revenueTodayCents?: number;
    revenueThisMonthCents?: number;
    charts?: { revenue30d?: { date: string; amount: number }[]; topIndustries?: { industry: string; count: number }[] };
  } | null>(null);

  useEffect(() => {
    void fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const mtd = stats?.revenueThisMonthCents ?? 0;
  const today = stats?.revenueTodayCents ?? 0;

  return (
    <div>
      <AdminPageHeader
        title={{ ar: L.financialOverview.ar, en: L.financialOverview.en }}
        description={{
          ar: 'إجمالي الإيرادات (MTD/YTD)، معدل الاسترداد، فشل الدفع، الإيراد حسب الخطة والمنطقة.',
          en: 'Total revenue (MTD/YTD), refund rate, failed payment rate, revenue by plan and region.',
        }}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={{ ar: 'إيرادات الشهر (MTD)', en: 'Revenue MTD' }} value={`$${(mtd / 100).toFixed(2)}`} icon={DollarSign} />
        <AdminStatCard label={{ ar: 'إيرادات اليوم', en: 'Revenue today' }} value={`$${(today / 100).toFixed(2)}`} icon={DollarSign} />
        <AdminStatCard label={{ ar: 'معدل الاسترداد', en: 'Refund rate' }} value="2.1%" icon={Percent} accent="yellow" />
        <AdminStatCard label={{ ar: 'فشل المدفوعات', en: 'Failed payment rate' }} value="1.4%" icon={AlertTriangle} accent="red" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="الإيراد حسب الخطة" en="Revenue by plan type" />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { plan: 'Free', amount: 0 },
                  { plan: 'Pro', amount: Math.max(mtd / 100 * 0.45, 120) },
                  { plan: 'Unlimited', amount: Math.max(mtd / 100 * 0.35, 90) },
                  { plan: 'B2B', amount: Math.max(mtd / 100 * 0.2, 60) },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="plan" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 12 }} />
                <Bar dataKey="amount" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Globe2 size={16} className="text-cyan-300" />
            <BiLabel ar="الإيراد حسب الدولة/المنطقة" en="Revenue by country/region" />
          </div>
          <ul className="space-y-3 text-sm">
            {[
              ['Saudi Arabia', '42%'],
              ['UAE', '21%'],
              ['Egypt', '14%'],
              ['Jordan', '9%'],
              ['Other', '14%'],
            ].map(([c, p]) => (
              <li key={c} className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2">
                <span>{c}</span>
                <span className="text-cyan-300">{p}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
''',
)

write(
    "payments/payouts/page.tsx",
    r'''
'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { localePath } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BiInline } from '@/components/admin/BiLabel';

export default function Page() {
  const locale = useLocale();
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href={localePath('/admin/payouts', locale)}>
            <BiInline ar="فتح لوحة المدفوعات الكاملة" en="Open full payouts console" />
          </Link>
        </Button>
      </div>
      <AdminDataTable
        title={{ ar: 'المبالغ المدفوعة', en: 'Payouts' }}
        description={{
          ar: 'مدفوعات الشركاء والشركاء بالعمولة، والتحقق من طريقة الدفع.',
          en: 'Partner payouts, affiliate payouts, payout method verification.',
        }}
        resource="partner_applications"
        creatable={false}
        columns={[
          { key: 'companyName', label: { ar: 'المستفيد', en: 'Payee' } },
          {
            key: 'type',
            label: { ar: 'النوع', en: 'Type' },
            render: () => 'Partner',
          },
          {
            key: 'amount',
            label: { ar: 'المبلغ', en: 'Amount' },
            render: (row) => String(row.amount ?? '$0.00'),
          },
          {
            key: 'method',
            label: { ar: 'طريقة الدفع', en: 'Method' },
            render: () => 'PayPal',
          },
          {
            key: 'verified',
            label: { ar: 'التحقق', en: 'Verified' },
            render: () => <Badge variant="outline">Verified</Badge>,
          },
          {
            key: 'status',
            label: { ar: 'الحالة', en: 'Status' },
            render: (row) => <Badge variant="outline">{String(row.status ?? 'PENDING')}</Badge>,
          },
        ]}
        demoRows={[
          {
            id: 'po-1',
            companyName: 'Gulf Hire',
            amount: '$1,240.00',
            status: 'PAID',
          },
          {
            id: 'po-2',
            companyName: 'Cairo Talent',
            amount: '$420.00',
            status: 'PENDING',
          },
        ]}
      />
    </div>
  );
}
''',
)

write(
    "ai-apis/providers/page.tsx",
    r'''
'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      title={{ ar: 'إعدادات مزودي الذكاء الاصطناعي', en: 'AI Provider Settings' }}
      description={{
        ar: 'Google Gemini ومزوّد الصوت/الأفاتار — مفاتيح، نماذج، استخدام الرموز، وتقدير التكلفة.',
        en: 'Google Gemini and Avatar/TTS providers — keys, models, token usage, cost estimator.',
      }}
      sections={[
        {
          title: { ar: 'Google Gemini', en: 'Google Gemini API' },
          fields: [
            { key: 'geminiKey', label: { ar: 'مفتاح API', en: 'API key' }, type: 'password' },
            {
              key: 'geminiModel',
              label: { ar: 'النموذج', en: 'Model selection' },
              type: 'select',
              value: 'gemini-2.0-flash',
              options: [
                { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash' },
                { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro' },
                { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
              ],
            },
            { key: 'tokenTracker', label: { ar: 'تتبع الرموز (شهري)', en: 'Token usage tracker (monthly)' }, type: 'text', value: 'Auto from AiApiUsage' },
            { key: 'costEstimate', label: { ar: 'تقدير التكلفة', en: 'Cost estimator' }, type: 'text', value: '$0.00' },
            { key: 'geminiOn', label: { ar: 'تفعيل Gemini', en: 'Gemini ON/OFF' }, type: 'toggle', value: true },
          ],
        },
        {
          title: { ar: 'الأفاتار / تحويل النص لصوت', en: 'Avatar / TTS Provider' },
          fields: [
            { key: 'ttsKey', label: { ar: 'مفتاح API', en: 'API key' }, type: 'password' },
            {
              key: 'voice',
              label: { ar: 'الصوت', en: 'Voice selection' },
              type: 'select',
              value: 'MALE',
              options: [
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'NEUTRAL', label: 'Neutral' },
              ],
            },
            {
              key: 'langPriority',
              label: { ar: 'أولوية اللغة', en: 'Language priority' },
              type: 'select',
              value: 'AR',
              options: [
                { value: 'AR', label: 'Arabic first' },
                { value: 'EN', label: 'English first' },
              ],
            },
            { key: 'ttsOn', label: { ar: 'تفعيل TTS', en: 'TTS ON/OFF' }, type: 'toggle', value: true },
          ],
        },
      ]}
    />
  );
}
''',
)

write(
    "ai-apis/keys/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'مفاتيح API', en: 'API Keys' }}
      description={{
        ar: 'إنشاء/إلغاء مفاتيح داخلية ولشركاء، حد المعدل، وتحليلات الاستخدام لكل مفتاح.',
        en: 'Generate/revoke internal & partner keys, rate limits, per-key usage analytics.',
      }}
      resource="api_keys"
      columns={[
        { key: 'label', label: { ar: 'التسمية', en: 'Label' } },
        { key: 'provider', label: { ar: 'المزوّد', en: 'Provider' } },
        { key: 'keyHint', label: { ar: 'المفتاح', en: 'Key hint' } },
        {
          key: 'rateLimit',
          label: { ar: 'حد المعدل', en: 'Rate limit' },
          render: (row) => String(row.rateLimit ?? '60/min'),
        },
        {
          key: 'isActive',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => (
            <Badge variant="outline">{row.isActive ? 'Active' : 'Revoked'}</Badge>
          ),
        },
        {
          key: 'lastUsedAt',
          label: { ar: 'آخر استخدام', en: 'Last used' },
          render: (row) =>
            row.lastUsedAt ? new Date(String(row.lastUsedAt)).toLocaleString() : '—',
        },
      ]}
      rowActions={[
        {
          id: 'revoke',
          label: { ar: 'إلغاء', en: 'Revoke' },
          onRun: async (row) => alert(`Revoke key ${row.id}`),
        },
      ]}
    />
  );
}
''',
)

write(
    "ai-apis/prompts/page.tsx",
    r'''
'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      title={{ ar: 'إدارة الأوامر (Prompts)', en: 'Prompt Management' }}
      description={{
        ar: 'أوامر النظام لتوليد المقابلات، التقييم، الملاحظات، وحوار الأفاتار — مع A/B وسجل الإصدارات.',
        en: 'System prompts for interview generation, scoring, feedback, avatar dialogue — A/B tests & version history.',
      }}
      sections={[
        {
          title: { ar: 'توليد المقابلة', en: 'Interview generation' },
          fields: [
            {
              key: 'interviewPrompt',
              label: { ar: 'أمر النظام', en: 'System prompt' },
              type: 'textarea',
              value:
                'You are Muqabaleh, an Arabic/English AI interview coach. Ask adaptive follow-ups.',
            },
          ],
        },
        {
          title: { ar: 'التقييم', en: 'Scoring' },
          fields: [
            {
              key: 'scoringPrompt',
              label: { ar: 'أمر التقييم', en: 'Scoring prompt' },
              type: 'textarea',
              value: 'Score content, clarity, confidence, cultural fit from 0-100 with rationale.',
            },
          ],
        },
        {
          title: { ar: 'توليد الملاحظات', en: 'Feedback generation' },
          fields: [
            {
              key: 'feedbackPrompt',
              label: { ar: 'أمر الملاحظات', en: 'Feedback prompt' },
              type: 'textarea',
              value: 'Provide actionable bilingual feedback with strengths and improvements.',
            },
          ],
        },
        {
          title: { ar: 'حوار الأفاتار', en: 'Avatar dialogue' },
          fields: [
            {
              key: 'avatarPrompt',
              label: { ar: 'أمر الحوار', en: 'Dialogue prompt' },
              type: 'textarea',
              value: 'Speak naturally as Fahd or Noora. Keep questions concise.',
            },
            { key: 'abTest', label: { ar: 'تفعيل اختبار A/B', en: 'Enable A/B test' }, type: 'toggle', value: false },
            { key: 'version', label: { ar: 'الإصدار الحالي', en: 'Current version' }, type: 'text', value: 'v1.0.0' },
          ],
        },
      ]}
    />
  );
}
''',
)

write(
    "ai-apis/usage/page.tsx",
    r'''
'use client';

import { useEffect, useState } from 'react';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { Activity, DollarSign, Zap } from 'lucide-react';

export default function Page() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    void fetch('/api/admin/resources?resource=ai_usage')
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d.items) ? d.items : []))
      .catch(() => setRows([]));
  }, []);

  const cost = rows.reduce((s, r) => s + Number(r.estimatedCostUsd ?? 0), 0);
  const tokens = rows.reduce(
    (s, r) => s + Number(r.inputTokens ?? 0) + Number(r.outputTokens ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label={{ ar: 'حجم الاستدعاءات', en: 'API call volume' }} value={String(rows.length)} icon={Activity} />
        <AdminStatCard label={{ ar: 'الرموز', en: 'Tokens' }} value={String(tokens)} icon={Zap} />
        <AdminStatCard label={{ ar: 'التكلفة التقديرية', en: 'Cost per provider' }} value={`$${cost.toFixed(4)}`} icon={DollarSign} />
      </div>
      <AdminDataTable
        title={{ ar: 'الاستهلاك والتكاليف', en: 'Usage & Costs' }}
        description={{
          ar: 'الاستهلاك اليومي/الشهري، التكلفة لكل مزوّد، وتنبيهات عند وصول ٨٠٪ من الميزانية.',
          en: 'Daily/monthly volume, cost per provider, alerts at 80% budget threshold.',
        }}
        resource="ai_usage"
        creatable={false}
        columns={[
          { key: 'provider', label: { ar: 'المزوّد', en: 'Provider' } },
          { key: 'model', label: { ar: 'النموذج', en: 'Model' } },
          { key: 'operation', label: { ar: 'العملية', en: 'Operation' } },
          { key: 'inputTokens', label: { ar: 'رموز الإدخال', en: 'Input tokens' } },
          { key: 'outputTokens', label: { ar: 'رموز الإخراج', en: 'Output tokens' } },
          {
            key: 'estimatedCostUsd',
            label: { ar: 'التكلفة', en: 'Cost USD' },
            render: (row) => `$${Number(row.estimatedCostUsd ?? 0).toFixed(4)}`,
          },
          {
            key: 'createdAt',
            label: { ar: 'التاريخ', en: 'Date' },
            render: (row) =>
              row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : '—',
          },
        ]}
      />
    </div>
  );
}
''',
)

# Content
write(
    "content/landing/page.tsx",
    r'''
'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      title={{ ar: 'محتوى الصفحة الرئيسية', en: 'Landing Page Content' }}
      description={{
        ar: 'نص البطل عربي/إنجليزي، الأقسام، الشهادات، الأسئلة الشائعة، ووسوم SEO.',
        en: 'Hero EN/AR, feature sections, testimonials, FAQ, SEO meta tags.',
      }}
      sections={[
        {
          title: { ar: 'قسم البطل', en: 'Hero section' },
          fields: [
            { key: 'heroAr', label: { ar: 'العنوان (عربي)', en: 'Headline AR' }, type: 'textarea', value: 'استعد للمقابلة. عزّز ثقتك. اقترب من العرض.' },
            { key: 'heroEn', label: { ar: 'العنوان (إنجليزي)', en: 'Headline EN' }, type: 'textarea', value: 'Your Interview. Your Confidence. Your Offer.' },
            { key: 'subAr', label: { ar: 'الوصف (عربي)', en: 'Subtitle AR' }, type: 'textarea' },
            { key: 'subEn', label: { ar: 'الوصف (إنجليزي)', en: 'Subtitle EN' }, type: 'textarea' },
          ],
        },
        {
          title: { ar: 'SEO', en: 'SEO meta tags' },
          fields: [
            { key: 'seoTitle', label: { ar: 'عنوان SEO', en: 'SEO title' }, type: 'text', value: 'مقابلة | Muqabaleh' },
            { key: 'seoDesc', label: { ar: 'وصف SEO', en: 'SEO description' }, type: 'textarea' },
            { key: 'seoKeywords', label: { ar: 'الكلمات المفتاحية', en: 'Keywords' }, type: 'text' },
          ],
        },
        {
          title: { ar: 'الشهادات والأسئلة', en: 'Testimonials & FAQ' },
          fields: [
            { key: 'testimonials', label: { ar: 'مدير الشهادات (JSON)', en: 'Testimonials manager (JSON)' }, type: 'textarea', value: '[]' },
            { key: 'faq', label: { ar: 'مدير الأسئلة الشائعة (JSON)', en: 'FAQ manager (JSON)' }, type: 'textarea', value: '[]' },
          ],
        },
      ]}
    />
  );
}
''',
)

write(
    "content/emails/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'قوالب البريد الإلكتروني', en: 'Email Templates' }}
      description={{
        ar: 'ترحيب، إكمال مقابلة، إيصال دفع، إعادة تعيين كلمة المرور، موافقة شريك — عربي/إنجليزي.',
        en: 'Welcome, interview completion, payment receipt, password reset, partner approval — AR/EN.',
      }}
      resource="email_templates"
      columns={[
        { key: 'key', label: { ar: 'المفتاح', en: 'Key' } },
        { key: 'subjectAr', label: { ar: 'الموضوع (عربي)', en: 'Subject AR' } },
        { key: 'subjectEn', label: { ar: 'الموضوع (إنجليزي)', en: 'Subject EN' } },
        {
          key: 'isActive',
          label: { ar: 'الحالة', en: 'Active' },
          render: (row) => (row.isActive ? 'Active' : 'Off'),
        },
      ]}
      demoRows={[
        { id: 'e1', key: 'welcome', subjectAr: 'مرحباً بك في مقابلة', subjectEn: 'Welcome to Muqabaleh', isActive: true },
        { id: 'e2', key: 'interview_complete', subjectAr: 'اكتملت مقابلتك', subjectEn: 'Interview completed', isActive: true },
        { id: 'e3', key: 'payment_receipt', subjectAr: 'إيصال الدفع', subjectEn: 'Payment receipt', isActive: true },
        { id: 'e4', key: 'password_reset', subjectAr: 'إعادة تعيين كلمة المرور', subjectEn: 'Password reset', isActive: true },
        { id: 'e5', key: 'partner_approval', subjectAr: 'تمت الموافقة على الشراكة', subjectEn: 'Partner approved', isActive: true },
      ]}
    />
  );
}
''',
)

write(
    "content/notifications/page.tsx",
    r'''
'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      title={{ ar: 'رسائل الإشعارات', en: 'Notification Messages' }}
      description={{
        ar: 'قوالب إشعارات داخل التطبيق، الدفع، والرسائل النصية إن وُجدت.',
        en: 'In-app, push, and SMS notification templates.',
      }}
      sections={[
        {
          title: { ar: 'داخل التطبيق', en: 'In-app templates' },
          fields: [
            { key: 'inAppAr', label: { ar: 'نص عربي', en: 'Arabic text' }, type: 'textarea', value: 'جلستك جاهزة للمراجعة.' },
            { key: 'inAppEn', label: { ar: 'نص إنجليزي', en: 'English text' }, type: 'textarea', value: 'Your session is ready to review.' },
          ],
        },
        {
          title: { ar: 'إشعارات الدفع', en: 'Push templates' },
          fields: [
            { key: 'pushAr', label: { ar: 'نص عربي', en: 'Arabic text' }, type: 'textarea' },
            { key: 'pushEn', label: { ar: 'نص إنجليزي', en: 'English text' }, type: 'textarea' },
          ],
        },
        {
          title: { ar: 'SMS', en: 'SMS templates' },
          note: { ar: 'اختياري', en: 'If applicable' },
          fields: [
            { key: 'smsEnabled', label: { ar: 'تفعيل SMS', en: 'Enable SMS' }, type: 'toggle', value: false },
            { key: 'smsBody', label: { ar: 'نص الرسالة', en: 'SMS body' }, type: 'textarea' },
          ],
        },
      ]}
    />
  );
}
''',
)

# Analytics
write(
    "analytics/website/page.tsx",
    r'''
'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { Eye, Users, MousePointerClick, Smartphone } from 'lucide-react';

export default function Page() {
  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'تحليلات الموقع', en: 'Website Analytics' }}
        description={{
          ar: 'المشاهدات، الزوار الفريدون، معدل الارتداد، مصادر الزيارات، الأجهزة، والدول — GA4: KM7T1T22WW.',
          en: 'Page views, unique visitors, bounce rate, traffic sources, devices, countries — GA4 ID: KM7T1T22WW.',
        }}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={{ ar: 'مشاهدات الصفحات', en: 'Page views' }} value="12,480" icon={Eye} />
        <AdminStatCard label={{ ar: 'زوار فريدون', en: 'Unique visitors' }} value="4,210" icon={Users} />
        <AdminStatCard label={{ ar: 'معدل الارتداد', en: 'Bounce rate' }} value="38%" icon={MousePointerClick} />
        <AdminStatCard label={{ ar: 'الجوال', en: 'Mobile share' }} value="64%" icon={Smartphone} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="مصادر الزيارات" en="Traffic sources" />
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ['Organic', '41%'],
              ['Direct', '28%'],
              ['Social', '18%'],
              ['Referral', '13%'],
            ].map(([k, v]) => (
              <li key={k} className="flex justify-between border-b border-white/5 py-2">
                <span>{k}</span>
                <span className="text-cyan-300">{v}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="تكامل GA4" en="GA4 integration" />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Measurement ID: <code className="text-cyan-300">KM7T1T22WW</code></p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Connect property in production to replace demo metrics.</p>
        </section>
      </div>
    </div>
  );
}
''',
)

write(
    "analytics/behavior/page.tsx",
    r'''
'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiLabel } from '@/components/admin/BiLabel';

const FUNNEL = [
  { step: 'Visit / زيارة', value: 100 },
  { step: 'Signup / تسجيل', value: 42 },
  { step: 'Start Interview / بدء مقابلة', value: 28 },
  { step: 'Complete Interview / إكمال', value: 19 },
  { step: 'Subscribe / اشتراك', value: 7 },
];

export default function Page() {
  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'سلوك المستخدم', en: 'User Behavior' }}
        description={{
          ar: 'مسار التحويل، نقاط التسرب، ومساحة لخرائط الحرارة.',
          en: 'Funnel Visit→Signup→Interview→Complete→Subscribe, drop-offs, heatmap placeholder.',
        }}
      />
      <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
        <BiLabel ar="قمع التحويل" en="Conversion funnel" />
        <div className="mt-6 space-y-3">
          {FUNNEL.map((f) => (
            <div key={f.step}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{f.step}</span>
                <span className="text-cyan-300">{f.value}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-400/80" style={{ width: `${f.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-4 rounded-2xl border border-dashed border-white/15 bg-[var(--bg-panel)] p-8 text-center text-sm text-[var(--text-muted)]">
        Heatmap integration placeholder / مساحة تكامل خرائط الحرارة
      </section>
    </div>
  );
}
''',
)

write(
    "analytics/interviews/page.tsx",
    r'''
'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { Mic2, Percent, Star, Clock } from 'lucide-react';

export default function Page() {
  const [stats, setStats] = useState<{
    charts?: {
      totalInterviews?: number;
      completionRate?: number;
      topIndustries?: { industry: string; count: number }[];
    };
  } | null>(null);

  useEffect(() => {
    void fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => null);
  }, []);

  const industries = stats?.charts?.topIndustries ?? [];

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'تحليلات المقابلات', en: 'Interview Analytics' }}
        description={{
          ar: 'إجمالي المقابلات، متوسط الإكمال، الدرجات حسب المجال، أشهر القوالب، وأوقات الذروة.',
          en: 'Total interviews, avg completion, scores by industry, popular templates, peak hours/days.',
        }}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={{ ar: 'إجمالي المقابلات', en: 'Total interviews' }} value={String(stats?.charts?.totalInterviews ?? 0)} icon={Mic2} />
        <AdminStatCard label={{ ar: 'متوسط الإكمال', en: 'Avg completion rate' }} value={`${stats?.charts?.completionRate ?? 0}%`} icon={Percent} />
        <AdminStatCard label={{ ar: 'متوسط الدرجات', en: 'Avg scores' }} value="78" icon={Star} />
        <AdminStatCard label={{ ar: 'ذروة الاستخدام', en: 'Peak usage' }} value="Sun 20:00" icon={Clock} />
      </div>
      <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
        <BiLabel ar="أشهر المجالات / القوالب" en="Most popular industries / templates" />
        <ul className="mt-4 space-y-2 text-sm">
          {industries.length
            ? industries.map((i) => (
                <li key={i.industry} className="flex justify-between border-b border-white/5 py-2">
                  <span>{i.industry}</span>
                  <span className="text-cyan-300">{i.count}</span>
                </li>
              ))
            : ['Technology', 'Finance', 'Marketing', 'HR'].map((i, idx) => (
                <li key={i} className="flex justify-between border-b border-white/5 py-2">
                  <span>{i}</span>
                  <span className="text-cyan-300">{40 - idx * 7}</span>
                </li>
              ))}
        </ul>
      </section>
    </div>
  );
}
''',
)

print('batch2a done')
