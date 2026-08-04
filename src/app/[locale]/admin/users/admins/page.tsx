'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'المسؤولون والمشرفون', en: 'Admins & Moderators' }}
      description={{
        ar: 'إنشاء مسؤول، صلاحيات تفصيلية، إعادة تعيين كلمة المرور، وسجل النشاط.',
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
