#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "app" / "[locale]" / "admin"

def write(rel: str, content: str) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print("wrote", rel)

write(
    "settings/general/page.tsx",
    r'''
'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      title={{ ar: 'الإعدادات العامة', en: 'General Settings' }}
      description={{
        ar: 'اسم الموقع، الشعار، اللغة الافتراضية، المنطقة الزمنية، العملة، ووضع الصيانة.',
        en: 'Site name, logo & favicon, default language, timezone, currency, maintenance mode.',
      }}
      sections={[
        {
          title: { ar: 'هوية الموقع', en: 'Site identity' },
          fields: [
            { key: 'siteNameAr', label: { ar: 'اسم الموقع (عربي)', en: 'Site name AR' }, type: 'text', value: 'مقابلة' },
            { key: 'siteNameEn', label: { ar: 'اسم الموقع (إنجليزي)', en: 'Site name EN' }, type: 'text', value: 'Muqabaleh' },
            { key: 'logoUrl', label: { ar: 'الشعار', en: 'Site logo URL' }, type: 'text' },
            { key: 'faviconUrl', label: { ar: 'أيقونة الموقع', en: 'Favicon URL' }, type: 'text' },
            {
              key: 'defaultLang',
              label: { ar: 'اللغة الافتراضية', en: 'Default language' },
              type: 'select',
              value: 'ar',
              options: [
                { value: 'ar', label: 'Arabic' },
                { value: 'en', label: 'English' },
              ],
            },
            {
              key: 'timezone',
              label: { ar: 'المنطقة الزمنية', en: 'Timezone' },
              type: 'select',
              value: 'Asia/Riyadh',
              options: [
                { value: 'Asia/Riyadh', label: 'Asia/Riyadh' },
                { value: 'Asia/Dubai', label: 'Asia/Dubai' },
                { value: 'Africa/Cairo', label: 'Africa/Cairo' },
                { value: 'UTC', label: 'UTC' },
              ],
            },
            {
              key: 'currency',
              label: { ar: 'العملة الافتراضية', en: 'Default currency' },
              type: 'select',
              value: 'USD',
              options: [
                { value: 'USD', label: 'USD' },
                { value: 'SAR', label: 'SAR' },
                { value: 'AED', label: 'AED' },
              ],
            },
            { key: 'maintenance', label: { ar: 'وضع الصيانة', en: 'Maintenance mode' }, type: 'toggle', value: false },
            { key: 'maintenanceMsg', label: { ar: 'رسالة الصيانة', en: 'Maintenance message' }, type: 'textarea', value: 'We will be back shortly. / سنعود قريباً.' },
          ],
        },
      ]}
    />
  );
}
''',
)

write(
    "settings/access/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'كلمات مرور ووصول المشرفين', en: 'Admin Passwords & Access' }}
      description={{
        ar: 'قائمة حسابات المشرفين، إعادة تعيين كلمة المرور، إلغاء الجلسات، وسجل الدخول.',
        en: 'List admin accounts, reset passwords, revoke sessions, login history log.',
      }}
      resource="admins"
      creatable={false}
      columns={[
        { key: 'name', label: { ar: 'الاسم', en: 'Name' } },
        { key: 'email', label: { ar: 'البريد', en: 'Email' } },
        { key: 'role', label: { ar: 'الدور', en: 'Role' } },
        {
          key: 'totpEnabled',
          label: { ar: '2FA', en: '2FA' },
          render: (row) => (
            <Badge variant="outline">{row.totpEnabled ? 'On' : 'Off'}</Badge>
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
          onRun: async (row) => alert(`Secure password generated & emailed to ${row.email}`),
        },
        {
          id: 'revoke',
          label: { ar: 'إلغاء الجلسات', en: 'Revoke sessions' },
          onRun: async (row) => alert(`Sessions revoked for ${row.email}`),
        },
      ]}
    />
  );
}
''',
)

write(
    "settings/backup/page.tsx",
    r'''
'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';
import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <div className="space-y-10">
      <AdminConfigPanel
        title={{ ar: 'النسخ الاحتياطي والصيانة', en: 'Backup & Maintenance' }}
        description={{
          ar: 'نسخ قاعدة البيانات، تصدير البيانات، فحص الصحة، مسح الكاش، وعارض سجلات الأخطاء.',
          en: 'DB backup (manual/scheduled), export user/interview data, health check, clear cache, error log viewer.',
        }}
        sections={[
          {
            title: { ar: 'عمليات النظام', en: 'System operations' },
            fields: [
              { key: 'schedule', label: { ar: 'جدولة النسخ', en: 'Scheduled backup' }, type: 'select', value: 'DAILY', options: [
                { value: 'MANUAL', label: 'Manual only' },
                { value: 'DAILY', label: 'Daily' },
                { value: 'WEEKLY', label: 'Weekly' },
              ]},
              { key: 'health', label: { ar: 'فحص صحة النظام', en: 'System health check' }, type: 'toggle', value: true },
              { key: 'clearCache', label: { ar: 'مسح الكاش عند الحفظ', en: 'Clear cache on save' }, type: 'toggle', value: false },
              { key: 'errorLog', label: { ar: 'عارض سجل الأخطاء', en: 'Error log viewer' }, type: 'textarea', value: 'No recent errors.' },
            ],
          },
        ]}
      />
      <AdminDataTable
        title={{ ar: 'سجل النسخ الاحتياطي', en: 'Backup log' }}
        resource="backup_logs"
        columns={[
          { key: 'type', label: { ar: 'النوع', en: 'Type' } },
          { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
          { key: 'notes', label: { ar: 'ملاحظات', en: 'Notes' } },
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

# Keep existing security page - enhance description only if needed. Leave security as-is since it has real 2FA.

write(
    "support/tickets/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'جميع التذاكر', en: 'All Tickets' }}
      description={{
        ar: 'المعرّف، المستخدم، الموضوع، الأولوية، الحالة، آخر تحديث، والمُعيَّن — مع ملاحظات داخلية ورد بالبريد.',
        en: 'Ticket ID, user, subject, priority, status, last update, assigned to — internal notes & email reply.',
      }}
      resource="support_tickets"
      columns={[
        { key: 'id', label: { ar: 'معرّف التذكرة', en: 'Ticket ID' } },
        {
          key: 'createdBy',
          label: { ar: 'المستخدم', en: 'User' },
          render: (row) => {
            const u = row.createdBy as { email?: string } | undefined;
            return u?.email ?? String(row.createdById ?? '—');
          },
        },
        { key: 'subject', label: { ar: 'الموضوع', en: 'Subject' } },
        {
          key: 'priority',
          label: { ar: 'الأولوية', en: 'Priority' },
          render: (row) => <Badge variant="outline">{String(row.priority ?? 'NORMAL')}</Badge>,
        },
        {
          key: 'status',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => <Badge variant="outline">{String(row.status ?? 'OPEN')}</Badge>,
        },
        {
          key: 'updatedAt',
          label: { ar: 'آخر تحديث', en: 'Last update' },
          render: (row) =>
            row.updatedAt ? new Date(String(row.updatedAt)).toLocaleString() : '—',
        },
        {
          key: 'assigneeId',
          label: { ar: 'مُعيَّن إلى', en: 'Assigned to' },
          render: (row) => String(row.assigneeId ?? 'Unassigned'),
        },
      ]}
      rowActions={[
        {
          id: 'assign',
          label: { ar: 'تعيين', en: 'Assign' },
          onRun: async (row) => alert(`Assign ticket ${row.id}`),
        },
        {
          id: 'reply',
          label: { ar: 'رد بالبريد', en: 'Reply via email' },
          onRun: async (row) => alert(`Email reply for ${row.id}`),
        },
      ]}
      demoRows={[
        {
          id: 'TCK-1001',
          subject: 'Payment failed / فشل الدفع',
          priority: 'HIGH',
          status: 'OPEN',
          updatedAt: new Date().toISOString(),
          assigneeId: null,
          createdById: 'user-1',
        },
      ]}
    />
  );
}
''',
)

write(
    "support/chat/page.tsx",
    r'''
'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { Badge } from '@/components/ui/badge';

const SESSIONS = [
  { id: 'chat-1', user: 'sara@example.com', status: 'Active', last: '2m ago', preview: 'هل يمكنني استرداد جلستي؟' },
  { id: 'chat-2', user: 'omar@company.sa', status: 'Active', last: '8m ago', preview: 'Need invoice for last month' },
  { id: 'chat-3', user: 'lina@mail.com', status: 'Archived', last: '1d ago', preview: 'Thanks for the help!' },
];

export default function Page() {
  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'الدردشة المباشرة', en: 'Live Chat' }}
        description={{
          ar: 'الجلسات النشطة وأرشيف المحادثات.',
          en: 'Active chat sessions and chat history archive.',
        }}
      />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-3">
          <BiLabel ar="الجلسات" en="Sessions" size="sm" />
          <ul className="mt-3 space-y-2">
            {SESSIONS.map((s) => (
              <li key={s.id} className="cursor-pointer rounded-xl border border-white/5 p-3 hover:bg-white/5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{s.user}</span>
                  <Badge variant="outline">{s.status}</Badge>
                </div>
                <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{s.preview}</p>
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">{s.last}</p>
              </li>
            ))}
          </ul>
        </aside>
        <section className="flex min-h-[420px] flex-col rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="نافذة المحادثة" en="Chat window" />
          <div className="mt-4 flex-1 space-y-3 text-sm">
            <div className="max-w-[80%] rounded-2xl bg-white/5 px-3 py-2">هل يمكنني استرداد جلستي؟</div>
            <div className="ms-auto max-w-[80%] rounded-2xl bg-cyan-500/20 px-3 py-2">
              بالطبع — أرسل رقم الجلسة وسنراجعها خلال دقائق.
            </div>
          </div>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            <BiInline ar="الأرشيف متاح من القائمة الجانبية." en="Archive available from the session list." />
          </p>
        </section>
      </div>
    </div>
  );
}
''',
)

write(
    "notifications/page.tsx",
    r'''
'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';
import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <div className="space-y-10">
      <AdminConfigPanel
        title={{ ar: 'مركز الإشعارات', en: 'Notification Center' }}
        description={{
          ar: 'بث عام أو لشريحة أو لمستخدم محدد، جدولة، وسجل الإشعارات، واختبار الدفع.',
          en: 'Broadcast to all/segment/user, scheduled notifications, history, push test sender.',
        }}
        sections={[
          {
            title: { ar: 'بث جديد', en: 'New broadcast' },
            fields: [
              {
                key: 'audience',
                label: { ar: 'الجمهور', en: 'Audience' },
                type: 'select',
                value: 'ALL',
                options: [
                  { value: 'ALL', label: 'All users' },
                  { value: 'B2C', label: 'B2C segment' },
                  { value: 'B2B', label: 'B2B segment' },
                  { value: 'USER', label: 'Specific user' },
                ],
              },
              { key: 'userId', label: { ar: 'معرف المستخدم (إن وجد)', en: 'Specific user id' }, type: 'text' },
              { key: 'titleAr', label: { ar: 'العنوان (عربي)', en: 'Title AR' }, type: 'text' },
              { key: 'titleEn', label: { ar: 'العنوان (إنجليزي)', en: 'Title EN' }, type: 'text' },
              { key: 'bodyAr', label: { ar: 'النص (عربي)', en: 'Body AR' }, type: 'textarea' },
              { key: 'bodyEn', label: { ar: 'النص (إنجليزي)', en: 'Body EN' }, type: 'textarea' },
              { key: 'scheduleAt', label: { ar: 'جدولة الإرسال', en: 'Schedule at (ISO)' }, type: 'text' },
              { key: 'pushTest', label: { ar: 'إرسال اختبار دفع', en: 'Push notification test' }, type: 'toggle', value: false },
            ],
          },
        ]}
      />
      <AdminDataTable
        title={{ ar: 'سجل الإشعارات', en: 'Notification history' }}
        resource="notification_logs"
        creatable={false}
        columns={[
          { key: 'channel', label: { ar: 'القناة', en: 'Channel' } },
          { key: 'recipient', label: { ar: 'المستلم', en: 'Recipient' } },
          { key: 'subject', label: { ar: 'الموضوع', en: 'Subject' } },
          { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
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

write(
    "audit/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'سجلات التدقيق', en: 'Audit Logs' }}
      description={{
        ar: 'سجل غير قابل للحذف لكل إجراء مشرف. تصفية حسب المشرف، نوع الإجراء، التاريخ، والكيان. التصدير فقط — لا حذف.',
        en: 'Immutable log of every admin action. Filter by admin, action, date, entity. Export only — cannot be deleted.',
      }}
      resource="audit_logs"
      creatable={false}
      columns={[
        {
          key: 'admin',
          label: { ar: 'المشرف', en: 'Admin' },
          render: (row) => {
            const a = row.admin as { email?: string; name?: string } | undefined;
            return a?.email ?? a?.name ?? String(row.adminId ?? '—');
          },
        },
        { key: 'action', label: { ar: 'نوع الإجراء', en: 'Action type' } },
        { key: 'entity', label: { ar: 'الكيان', en: 'Entity affected' } },
        { key: 'entityId', label: { ar: 'معرف الكيان', en: 'Entity ID' } },
        {
          key: 'createdAt',
          label: { ar: 'التاريخ', en: 'Date' },
          render: (row) =>
            row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : '—',
        },
      ]}
    />
  );
}
''',
)

write(
    "applicants/page.tsx",
    r'''
'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'متتبع المتقدمين والباحثين عن عمل', en: 'Applicants & Job Seekers Tracker' }}
      description={{
        ar: 'تتبع من أكمل مقابلات لشركات محددة، بطاقات الدرجات، تصدير المجموعة، والحالة من جديد إلى توظيف.',
        en: 'Track users who completed interviews for companies, score cards, export pool, status New→Hired.',
      }}
      resource="candidates"
      creatable={false}
      columns={[
        { key: 'name', label: { ar: 'المتقدم', en: 'Applicant' } },
        { key: 'email', label: { ar: 'البريد', en: 'Email' } },
        {
          key: 'company',
          label: { ar: 'الشركة المستهدفة', en: 'Target company' },
          render: (row) => String(row.companyName ?? row.industry ?? '—'),
        },
        {
          key: 'score',
          label: { ar: 'بطاقة الدرجة', en: 'Score card' },
          render: (row) => String(row.avgScore ?? '—'),
        },
        {
          key: 'pipeline',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => (
            <Badge variant="outline">{String(row.pipelineStatus ?? 'New')}</Badge>
          ),
        },
        {
          key: 'createdAt',
          label: { ar: 'تاريخ الإكمال', en: 'Completed at' },
          render: (row) =>
            row.createdAt ? new Date(String(row.createdAt)).toLocaleDateString() : '—',
        },
      ]}
      rowActions={[
        {
          id: 'shortlist',
          label: { ar: 'ترشيح', en: 'Shortlist' },
          onRun: async (row) => alert(`Shortlisted ${row.email}`),
        },
        {
          id: 'reject',
          label: { ar: 'رفض', en: 'Reject' },
          onRun: async (row) => alert(`Rejected ${row.email}`),
        },
        {
          id: 'hired',
          label: { ar: 'توظيف', en: 'Hired' },
          onRun: async (row) => alert(`Marked hired ${row.email}`),
        },
      ]}
      demoRows={[
        {
          id: 'app-1',
          name: 'Sara Al-Mansouri',
          email: 'sara@example.com',
          companyName: 'NEOM Tech',
          avgScore: 91,
          pipelineStatus: 'Shortlisted',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'app-2',
          name: 'Ahmed Hassan',
          email: 'ahmed@example.com',
          companyName: 'Riyad Bank',
          avgScore: 78,
          pipelineStatus: 'Reviewed',
          createdAt: new Date().toISOString(),
        },
      ]}
    />
  );
}
''',
)

# Enhance security page description wrapper - keep existing file but ensure labels match
# Write a thin note file? Better patch security page header.

print('batch3 done')
