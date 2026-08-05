#!/usr/bin/env python3
"""Generate Super Admin section pages matching the full product spec."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "app" / "[locale]" / "admin"

def write(rel: str, content: str) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print("wrote", path.relative_to(ROOT.parent.parent.parent))


# ── Users ────────────────────────────────────────────────────────────

write(
    "users/all/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';
import { L } from '@/lib/admin/labels';

async function patchUser(id: string, body: Record<string, unknown>) {
  await fetch('/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...body }),
  });
}

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'جميع المستخدمين', en: 'All Users' }}
      description={{
        ar: 'بحث، تصفية، فرز، إجراءات جماعية وتصدير CSV/Excel.',
        en: 'Search, filter, sort, bulk actions, and CSV/Excel export.',
      }}
      resource="users"
      creatable={false}
      selectable
      columns={[
        { key: 'id', label: { ar: 'المعرّف', en: 'ID' } },
        { key: 'name', label: { ar: 'الاسم', en: 'Name' } },
        { key: 'email', label: { ar: 'البريد', en: 'Email' } },
        { key: 'role', label: { ar: 'الدور', en: 'Role' } },
        {
          key: 'accountType',
          label: { ar: 'النوع', en: 'Type (B2C/B2B)' },
          render: (row) => {
            const t = String(row.accountType ?? 'INDIVIDUAL');
            const isB2B = t === 'COMPANY' || t === 'B2B' || Boolean(row.companyId);
            return <Badge variant="outline">{isB2B ? 'B2B' : 'B2C'}</Badge>;
          },
        },
        {
          key: 'isActive',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => (
            <Badge variant="outline">{row.isActive ? 'Active' : 'Inactive'}</Badge>
          ),
        },
        {
          key: 'createdAt',
          label: { ar: 'تاريخ الإنشاء', en: 'Created At' },
          render: (row) => (row.createdAt ? new Date(String(row.createdAt)).toLocaleDateString() : '—'),
        },
      ]}
      bulkActions={[
        {
          id: 'activate',
          label: L.activate,
          onRun: async (ids) => {
            await Promise.all(ids.map((id) => patchUser(id, { isActive: true })));
          },
        },
        {
          id: 'deactivate',
          label: L.deactivate,
          onRun: async (ids) => {
            await Promise.all(ids.map((id) => patchUser(id, { isActive: false })));
          },
        },
        {
          id: 'email',
          label: L.emailAction,
          onRun: async (ids) => {
            alert(`${L.emailAction.ar} / ${L.emailAction.en}: ${ids.length}`);
          },
        },
      ]}
      rowActions={[
        {
          id: 'activate',
          label: L.activate,
          onRun: async (row) => patchUser(String(row.id), { isActive: true }),
        },
        {
          id: 'deactivate',
          label: L.deactivate,
          onRun: async (row) => patchUser(String(row.id), { isActive: false }),
        },
      ]}
    />
  );
}
''',
)

write(
    "users/candidates/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'المرشحون', en: 'Candidates' }}
      description={{
        ar: 'سجل المقابلات، حالة الاشتراك، متوسط الدرجات، وآخر نشاط.',
        en: 'Interview history, subscription status, score averages, last active.',
      }}
      resource="candidates"
      creatable={false}
      columns={[
        { key: 'name', label: { ar: 'الاسم', en: 'Name' } },
        { key: 'email', label: { ar: 'البريد', en: 'Email' } },
        { key: 'tier', label: { ar: 'الاشتراك', en: 'Subscription' } },
        { key: 'sessionsLeft', label: { ar: 'جلسات متبقية', en: 'Sessions left' } },
        {
          key: 'avgScore',
          label: { ar: 'متوسط الدرجات', en: 'Avg score' },
          render: (row) => String(row.avgScore ?? row.overallScore ?? '—'),
        },
        {
          key: 'interviewCount',
          label: { ar: 'المقابلات', en: 'Interviews' },
          render: (row) => {
            const c = row._count as { interviews?: number } | undefined;
            return String(c?.interviews ?? row.interviewCount ?? '—');
          },
        },
        {
          key: 'lastLoginAt',
          label: { ar: 'آخر نشاط', en: 'Last active' },
          render: (row) =>
            row.lastLoginAt ? new Date(String(row.lastLoginAt)).toLocaleDateString() : '—',
        },
      ]}
    />
  );
}
''',
)

write(
    "users/admins/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'المشرفون والمحررون', en: 'Admins & Moderators' }}
      description={{
        ar: 'إنشاء مشرف، صلاحيات تفصيلية، إعادة تعيين كلمة المرور، وسجل النشاط.',
        en: 'Create admins, granular permissions, password reset, activity log.',
      }}
      resource="admins"
      creatable
      columns={[
        { key: 'name', label: { ar: 'الاسم', en: 'Name' } },
        { key: 'email', label: { ar: 'البريد', en: 'Email' } },
        { key: 'role', label: { ar: 'الدور', en: 'Role' } },
        {
          key: 'permissions',
          label: { ar: 'الصلاحيات', en: 'Permissions' },
          render: () => (
            <span className="text-xs text-[var(--text-muted)]">
              Users · Billing · Content · Support · Settings
            </span>
          ),
        },
        {
          key: 'totpEnabled',
          label: { ar: 'التحقق الثنائي', en: '2FA' },
          render: (row) => (
            <Badge variant="outline">{row.totpEnabled ? 'Enabled' : 'Off'}</Badge>
          ),
        },
        {
          key: 'lastLoginAt',
          label: { ar: 'آخر دخول', en: 'Last login' },
          render: (row) =>
            row.lastLoginAt ? new Date(String(row.lastLoginAt)).toLocaleString() : '—',
        },
      ]}
      rowActions={[
        {
          id: 'reset',
          label: { ar: 'إعادة تعيين كلمة المرور', en: 'Reset password' },
          onRun: async (row) => {
            alert(`Password reset queued for ${row.email}`);
          },
        },
      ]}
    />
  );
}
''',
)

write(
    "users/companies/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'حسابات الشركات', en: 'Company Accounts' }}
      description={{
        ar: 'ملف الشركة، عدد المرشحين، باقة الاشتراك، وحالة العلامة البيضاء.',
        en: 'Company profile, candidates count, subscription tier, whitelabel status.',
      }}
      resource="companies"
      creatable={false}
      columns={[
        { key: 'name', label: { ar: 'اسم الشركة', en: 'Company name' } },
        { key: 'industry', label: { ar: 'المجال', en: 'Industry' } },
        { key: 'country', label: { ar: 'الدولة', en: 'Country' } },
        { key: 'plan', label: { ar: 'الباقة', en: 'Subscription tier' } },
        {
          key: 'employees',
          label: { ar: 'الموظفون/المرشحون', en: 'Employees/Candidates' },
          render: (row) => String(row.credits ?? row.employees ?? '—'),
        },
        {
          key: 'whitelabel',
          label: { ar: 'العلامة البيضاء', en: 'Whitelabel' },
          render: (row) => (
            <Badge variant="outline">{String(row.whitelabelStatus ?? 'Pending')}</Badge>
          ),
        },
        { key: 'domain', label: { ar: 'النطاق', en: 'Domain' }, render: (row) => String(row.domain ?? '—') },
      ]}
      demoRows={[
        {
          id: 'demo-co-1',
          name: 'NEOM Tech',
          industry: 'Technology',
          country: 'SA',
          plan: 'B2B_BUSINESS',
          credits: 42,
          whitelabelStatus: 'Active',
          domain: 'hire.neomtech.sa',
        },
      ]}
    />
  );
}
''',
)

# ── Interviews ───────────────────────────────────────────────────────

write(
    "interviews/templates/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'قوالب المقابلات', en: 'Interview Templates' }}
      description={{
        ar: 'إنشاء/تعديل/حذف القوالب: الاسم (عربي/إنجليزي)، المجال، الوظيفة، الصعوبة، المدة، عدد الأسئلة.',
        en: 'Create/edit/delete templates: name EN/AR, industry, job role, difficulty, duration, question count.',
      }}
      resource="templates"
      columns={[
        { key: 'titleAr', label: { ar: 'الاسم (عربي)', en: 'Name AR' } },
        { key: 'titleEn', label: { ar: 'الاسم (إنجليزي)', en: 'Name EN' } },
        { key: 'industry', label: { ar: 'المجال', en: 'Industry' } },
        {
          key: 'level',
          label: { ar: 'الصعوبة', en: 'Difficulty' },
          render: (row) => {
            const m: Record<string, string> = {
              EASY: 'سهل / Easy',
              MID: 'متوسط / Medium',
              MEDIUM: 'متوسط / Medium',
              HARD: 'صعب / Hard',
              JUNIOR: 'سهل / Easy',
              SENIOR: 'صعب / Hard',
            };
            return m[String(row.level)] ?? String(row.level);
          },
        },
        { key: 'durationMin', label: { ar: 'المدة (د)', en: 'Duration' } },
        {
          key: 'questionCount',
          label: { ar: 'عدد الأسئلة', en: 'Questions' },
          render: (row) => String(row.questionCount ?? '—'),
        },
        {
          key: 'isActive',
          label: { ar: 'الحالة', en: 'Active' },
          render: (row) => (
            <Badge variant="outline">{row.isActive ? 'Active' : 'Inactive'}</Badge>
          ),
        },
      ]}
    />
  );
}
''',
)

write(
    "interviews/questions/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'بنك الأسئلة', en: 'Question Bank' }}
      description={{
        ar: 'إضافة/تعديل/حذف الأسئلة، استيراد CSV، واقتراحات بالذكاء الاصطناعي (Gemini).',
        en: 'Add/edit/delete questions, CSV import, AI suggestions via Gemini.',
      }}
      resource="questions"
      columns={[
        { key: 'textAr', label: { ar: 'نص السؤال (عربي)', en: 'Question AR' } },
        { key: 'textEn', label: { ar: 'نص السؤال (إنجليزي)', en: 'Question EN' } },
        { key: 'category', label: { ar: 'الفئة', en: 'Category' } },
        { key: 'industry', label: { ar: 'المجال', en: 'Industry' } },
        { key: 'difficulty', label: { ar: 'الصعوبة', en: 'Difficulty' } },
        {
          key: 'expectedPoints',
          label: { ar: 'نقاط الإجابة المتوقعة', en: 'Expected answer points' },
          render: (row) => String(row.expectedPoints ?? '—'),
        },
        {
          key: 'rubric',
          label: { ar: 'معيار التقييم', en: 'Scoring rubric' },
          render: (row) => String(row.rubric ?? 'Default'),
        },
      ]}
    />
  );
}
''',
)

write(
    "interviews/sessions/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'الجلسات الحية', en: 'Live Sessions' }}
      description={{
        ar: 'عرض فوري للمقابلات الجارية، مراقبة للقراءة فقط، إيقاف قسري، وسجلات الجلسة.',
        en: 'Real-time ongoing interviews, read-only monitor, force-stop, session logs.',
      }}
      resource="sessions"
      creatable={false}
      columns={[
        { key: 'id', label: { ar: 'معرف الجلسة', en: 'Session ID' } },
        {
          key: 'user',
          label: { ar: 'المستخدم', en: 'User' },
          render: (row) => {
            const u = row.user as { email?: string } | undefined;
            return u?.email ?? '—';
          },
        },
        { key: 'industry', label: { ar: 'المجال', en: 'Industry' } },
        { key: 'mode', label: { ar: 'النمط', en: 'Mode' } },
        {
          key: 'status',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => <Badge variant="outline">{String(row.status)}</Badge>,
        },
        { key: 'overallScore', label: { ar: 'الدرجة', en: 'Score' } },
        {
          key: 'createdAt',
          label: { ar: 'بدأت', en: 'Started' },
          render: (row) =>
            row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : '—',
        },
      ]}
      rowActions={[
        {
          id: 'monitor',
          label: { ar: 'مراقبة', en: 'Monitor' },
          onRun: async (row) => alert(`Monitor (read-only): ${row.id}`),
        },
        {
          id: 'force-stop',
          label: { ar: 'إيقاف قسري', en: 'Force-stop' },
          onRun: async (row) => alert(`Force-stop queued: ${row.id}`),
        },
      ]}
    />
  );
}
''',
)

write(
    "interviews/rubrics/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'معايير التقييم', en: 'Scoring & Evaluation Rubrics' }}
      description={{
        ar: 'التواصل، المعرفة التقنية، الثقة، لغة الجسد، حل المشكلات — مع أوزان ونماذج ملاحظات عربي/إنجليزي.',
        en: 'Communication, Technical Knowledge, Confidence, Body Language, Problem Solving — weights + AR/EN feedback templates.',
      }}
      resource="rubrics"
      columns={[
        { key: 'nameAr', label: { ar: 'الاسم (عربي)', en: 'Name AR' } },
        { key: 'nameEn', label: { ar: 'الاسم (إنجليزي)', en: 'Name EN' } },
        { key: 'maxScore', label: { ar: 'الدرجة القصوى', en: 'Max score' } },
        {
          key: 'criteria',
          label: { ar: 'المعايير والأوزان', en: 'Criteria & weights %' },
          render: (row) => {
            const c = row.criteria;
            if (Array.isArray(c) && c.length) return `${c.length} criteria`;
            return 'Communication · Technical · Confidence · Body Language · Problem Solving';
          },
        },
        {
          key: 'isActive',
          label: { ar: 'الحالة', en: 'Active' },
          render: (row) => (row.isActive ? 'Active' : 'Inactive'),
        },
      ]}
    />
  );
}
''',
)

# ── Partners ─────────────────────────────────────────────────────────

write(
    "partners/whitelabel/page.tsx",
    r'''
'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      title={{ ar: 'شركاء العلامة البيضاء', en: 'Whitelabel Partners' }}
      description={{
        ar: 'نموذج الانضمام، النطاق المخصص، الشعار والألوان، ومفتاح API لكل شريك.',
        en: 'Onboarding form, custom domain, logo & branding, color scheme, API key per partner.',
      }}
      sections={[
        {
          title: { ar: 'إعداد الشريك', en: 'Partner setup' },
          fields: [
            { key: 'companyName', label: { ar: 'اسم الشركة', en: 'Company name' }, type: 'text' },
            { key: 'contactEmail', label: { ar: 'بريد التواصل', en: 'Contact email' }, type: 'text' },
            { key: 'customDomain', label: { ar: 'النطاق المخصص', en: 'Custom domain' }, type: 'text', value: 'interviews.partner.com' },
            { key: 'logoUrl', label: { ar: 'رابط الشعار', en: 'Logo URL' }, type: 'text' },
            { key: 'primaryColor', label: { ar: 'اللون الأساسي', en: 'Primary color' }, type: 'text', value: '#0ea5e9' },
            { key: 'secondaryColor', label: { ar: 'اللون الثانوي', en: 'Secondary color' }, type: 'text', value: '#0f172a' },
            { key: 'apiKey', label: { ar: 'مفتاح API للشريك', en: 'Partner API key' }, type: 'password', value: '' },
            { key: 'active', label: { ar: 'تفعيل الشريك', en: 'Partner active' }, type: 'toggle', value: true },
          ],
        },
      ]}
    />
  );
}
''',
)

write(
    "partners/applications/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'طلبات الشراكة', en: 'Partner Applications' }}
      description={{
        ar: 'مراجعة الطلبات، موافقة/رفض مع سبب، تواصل بالبريد، وتتبع الحالة.',
        en: 'Review requests, approve/reject with reason, email applicant, status tracker.',
      }}
      resource="partner_applications"
      columns={[
        { key: 'companyName', label: { ar: 'الشركة', en: 'Company' } },
        { key: 'contactName', label: { ar: 'جهة الاتصال', en: 'Contact' } },
        { key: 'email', label: { ar: 'البريد', en: 'Email' } },
        { key: 'country', label: { ar: 'الدولة', en: 'Country' } },
        {
          key: 'status',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => (
            <Badge variant="outline">{String(row.status ?? 'PENDING')}</Badge>
          ),
        },
        {
          key: 'createdAt',
          label: { ar: 'تاريخ الطلب', en: 'Submitted' },
          render: (row) =>
            row.createdAt ? new Date(String(row.createdAt)).toLocaleDateString() : '—',
        },
      ]}
      rowActions={[
        {
          id: 'approve',
          label: { ar: 'موافقة', en: 'Approve' },
          onRun: async (row) => alert(`Approved: ${row.companyName}`),
        },
        {
          id: 'reject',
          label: { ar: 'رفض', en: 'Reject' },
          onRun: async (row) => alert(`Rejected: ${row.companyName}`),
        },
        {
          id: 'email',
          label: { ar: 'مراسلة', en: 'Email' },
          onRun: async (row) => alert(`Email: ${row.email}`),
        },
      ]}
    />
  );
}
''',
)

write(
    "partners/revenue/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'تقاسم الإيرادات', en: 'Partner Revenue Share' }}
      description={{
        ar: 'نسبة العمولة، تقرير الأرباح الشهري، حالة الدفع، وتكامل PayPal.',
        en: 'Commission %, monthly earnings, payout status, PayPal payout integration.',
      }}
      resource="partner_applications"
      creatable={false}
      columns={[
        { key: 'companyName', label: { ar: 'الشريك', en: 'Partner' } },
        {
          key: 'commission',
          label: { ar: 'نسبة العمولة', en: 'Commission %' },
          render: (row) => String(row.commission ?? '15%'),
        },
        {
          key: 'monthlyEarnings',
          label: { ar: 'أرباح الشهر', en: 'Monthly earnings' },
          render: (row) => String(row.monthlyEarnings ?? '$0.00'),
        },
        {
          key: 'payoutStatus',
          label: { ar: 'حالة الدفع', en: 'Payout status' },
          render: (row) => (
            <Badge variant="outline">{String(row.payoutStatus ?? 'Pending')}</Badge>
          ),
        },
      ]}
      demoRows={[
        {
          id: 'rev-1',
          companyName: 'Gulf Hire',
          commission: '18%',
          monthlyEarnings: '$1,240.00',
          payoutStatus: 'Paid',
        },
        {
          id: 'rev-2',
          companyName: 'Cairo Talent',
          commission: '12%',
          monthlyEarnings: '$420.00',
          payoutStatus: 'Pending',
        },
      ]}
    />
  );
}
''',
)

# ── Billing ──────────────────────────────────────────────────────────

write(
    "billing/plans/page.tsx",
    r'''
'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';
import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <div className="space-y-10">
      <AdminDataTable
        title={{ ar: 'خطط الاشتراك', en: 'Subscription Plans' }}
        description={{
          ar: 'الاسم عربي/إنجليزي، السعر، العملة، الفترة، الميزات، رصيد المقابلات، ظهور الخطة، والتجربة المجانية.',
          en: 'Name EN/AR, price, currency, interval, features, interview credits, visibility, trial.',
        }}
        resource="subscriptions"
        creatable={false}
        columns={[
          { key: 'plan', label: { ar: 'الخطة', en: 'Plan' }, render: (row) => String(row.plan ?? row.planId ?? '—') },
          { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
          {
            key: 'user',
            label: { ar: 'مستخدم نموذجي', en: 'Sample user' },
            render: (row) => {
              const u = row.user as { email?: string } | undefined;
              return u?.email ?? '—';
            },
          },
        ]}
        demoRows={[
          { id: 'plan-free', plan: 'Free / مجاني', status: 'Public', user: { email: '—' } },
          { id: 'plan-pro', plan: 'Pro / احترافي — $9.99/mo', status: 'Public', user: { email: '—' } },
          { id: 'plan-unl', plan: 'Unlimited / بلا حدود — $29.99/mo', status: 'Public', user: { email: '—' } },
          { id: 'plan-partner', plan: 'Partner-only / للشركاء فقط', status: 'Partner-only', user: { email: '—' } },
        ]}
      />
      <AdminConfigPanel
        title={{ ar: 'محرر الخطة', en: 'Plan editor' }}
        sections={[
          {
            title: { ar: 'تفاصيل الخطة', en: 'Plan details' },
            fields: [
              { key: 'nameAr', label: { ar: 'الاسم (عربي)', en: 'Name AR' }, type: 'text', value: 'احترافي' },
              { key: 'nameEn', label: { ar: 'الاسم (إنجليزي)', en: 'Name EN' }, type: 'text', value: 'Pro' },
              { key: 'price', label: { ar: 'السعر', en: 'Price' }, type: 'number', value: '9.99' },
              {
                key: 'currency',
                label: { ar: 'العملة', en: 'Currency' },
                type: 'select',
                value: 'USD',
                options: [
                  { value: 'USD', label: 'USD' },
                  { value: 'SAR', label: 'SAR' },
                  { value: 'AED', label: 'AED' },
                ],
              },
              {
                key: 'interval',
                label: { ar: 'الفترة', en: 'Interval' },
                type: 'select',
                value: 'MONTHLY',
                options: [
                  { value: 'MONTHLY', label: 'Monthly' },
                  { value: 'YEARLY', label: 'Yearly' },
                ],
              },
              { key: 'credits', label: { ar: 'رصيد المقابلات', en: 'Interview credits' }, type: 'number', value: '10' },
              { key: 'features', label: { ar: 'قائمة الميزات', en: 'Features list' }, type: 'textarea', value: 'AI interviews\nDetailed scoring\nPDF report' },
              {
                key: 'visibility',
                label: { ar: 'الظهور', en: 'Visibility' },
                type: 'select',
                value: 'PUBLIC',
                options: [
                  { value: 'PUBLIC', label: 'Public' },
                  { value: 'HIDDEN', label: 'Hidden' },
                  { value: 'PARTNER', label: 'Partner-only' },
                ],
              },
              { key: 'trialDays', label: { ar: 'أيام التجربة', en: 'Trial days' }, type: 'number', value: '7' },
              { key: 'aiAvatar', label: { ar: 'وصول الأفاتار الذكي', en: 'AI avatar access' }, type: 'toggle', value: true },
            ],
          },
        ]}
      />
    </div>
  );
}
''',
)

write(
    "billing/subscriptions/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'الاشتراكات النشطة', en: 'Active Subscriptions' }}
      description={{
        ar: 'المستخدم/الشركة، الخطة، تاريخ البدء، الفوترة التالية، الحالة، وطريقة الدفع.',
        en: 'User/Company, plan, start date, next billing, status, payment method.',
      }}
      resource="subscriptions"
      creatable={false}
      columns={[
        {
          key: 'user',
          label: { ar: 'المستخدم/الشركة', en: 'User/Company' },
          render: (row) => {
            const u = row.user as { email?: string } | undefined;
            return u?.email ?? String(row.email ?? '—');
          },
        },
        { key: 'planId', label: { ar: 'الخطة', en: 'Plan' }, render: (row) => String(row.planId ?? row.plan ?? '—') },
        {
          key: 'startDate',
          label: { ar: 'تاريخ البدء', en: 'Start date' },
          render: (row) =>
            row.startTime || row.createdAt
              ? new Date(String(row.startTime ?? row.createdAt)).toLocaleDateString()
              : '—',
        },
        {
          key: 'nextBilling',
          label: { ar: 'الفوترة التالية', en: 'Next billing' },
          render: (row) =>
            row.nextBillingTime
              ? new Date(String(row.nextBillingTime)).toLocaleDateString()
              : '—',
        },
        {
          key: 'status',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => <Badge variant="outline">{String(row.status ?? '—')}</Badge>,
        },
        {
          key: 'paymentMethod',
          label: { ar: 'طريقة الدفع', en: 'Payment method' },
          render: () => 'PayPal',
        },
      ]}
      rowActions={[
        {
          id: 'cancel',
          label: { ar: 'إلغاء الاشتراك', en: 'Cancel' },
          onRun: async (row) => alert(`Cancel subscription ${row.id}`),
        },
        {
          id: 'extend',
          label: { ar: 'تمديد / ترقية مجانية', en: 'Extend / complimentary' },
          onRun: async (row) => alert(`Extend ${row.id}`),
        },
      ]}
    />
  );
}
''',
)

write(
    "billing/invoices/page.tsx",
    r'''
'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';
import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <div className="space-y-10">
      <AdminDataTable
        title={{ ar: 'الفواتير', en: 'Invoices' }}
        description={{
          ar: 'إنشاء/عرض الفواتير، تحميل PDF، ترقيم الفواتير، وإعدادات الضريبة/VAT.',
          en: 'Generate/view invoices, download PDF, invoice numbering, tax/VAT settings.',
        }}
        resource="transactions"
        creatable={false}
        columns={[
          { key: 'id', label: { ar: 'رقم الفاتورة', en: 'Invoice #' } },
          {
            key: 'user',
            label: { ar: 'المستخدم', en: 'User' },
            render: (row) => {
              const u = row.user as { email?: string } | undefined;
              return u?.email ?? '—';
            },
          },
          {
            key: 'amount',
            label: { ar: 'المبلغ', en: 'Amount' },
            render: (row) => `$${Number(row.amount ?? 0).toFixed(2)}`,
          },
          { key: 'currency', label: { ar: 'العملة', en: 'Currency' } },
          { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
          {
            key: 'createdAt',
            label: { ar: 'التاريخ', en: 'Date' },
            render: (row) =>
              row.createdAt ? new Date(String(row.createdAt)).toLocaleDateString() : '—',
          },
        ]}
        rowActions={[
          {
            id: 'pdf',
            label: { ar: 'تحميل PDF', en: 'Download PDF' },
            onRun: async (row) => alert(`PDF invoice ${row.id}`),
          },
        ]}
      />
      <AdminConfigPanel
        title={{ ar: 'إعدادات الفواتير', en: 'Invoice settings' }}
        sections={[
          {
            title: { ar: 'الترقيم والضريبة', en: 'Numbering & tax' },
            fields: [
              { key: 'prefix', label: { ar: 'بادئة الرقم', en: 'Number prefix' }, type: 'text', value: 'MQBL-INV-' },
              { key: 'nextNumber', label: { ar: 'الرقم التالي', en: 'Next number' }, type: 'number', value: '1001' },
              { key: 'vatRate', label: { ar: 'نسبة VAT %', en: 'VAT %' }, type: 'number', value: '15' },
              { key: 'vatEnabled', label: { ar: 'تفعيل الضريبة', en: 'Enable tax/VAT' }, type: 'toggle', value: true },
            ],
          },
        ]}
      />
    </div>
  );
}
''',
)

print('batch1 done')
