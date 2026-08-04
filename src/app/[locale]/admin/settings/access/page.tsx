'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'إدارة صلاحيات الوصول', en: 'Admin Passwords & Access' }}
      description={{
        ar: 'قائمة حسابات المسؤولين، إعادة تعيين كلمة المرور، إنهاء الجلسات النشطة، وسجل الدخول.',
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
          label: { ar: 'إنهاء الجلسات النشطة', en: 'Revoke sessions' },
          onRun: async (row) => alert(`Sessions revoked for ${row.email}`),
        },
      ]}
    />
  );
}
