'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'إدارة صلاحيات الوصول', en: 'Admin Passwords & Access' }}
      description={{
        ar: 'إعادة تعيين كلمة المرور أو تعطيل الحساب لإنهاء جلسات JWT.',
        en: 'Reset passwords or deactivate accounts to end JWT sessions.',
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
          onRun: async (row) => {
            const res = await fetch('/api/admin/admins', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'reset_password', userId: row.id }),
            });
            const data = await res.json();
            if (!res.ok) {
              alert(data.error || 'Failed');
              return;
            }
            alert(`New password for ${data.email}:\n${data.tempPassword}`);
          },
        },
        {
          id: 'revoke',
          label: { ar: 'إنهاء الجلسات (تعطيل)', en: 'Revoke sessions' },
          onRun: async (row) => {
            if (!confirm('Deactivate this admin and rotate password?')) return;
            const res = await fetch('/api/admin/admins', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'revoke_sessions', userId: row.id }),
            });
            const data = await res.json();
            if (!res.ok) {
              alert(data.error || 'Failed');
              return;
            }
            alert(`${data.note}\nTemp password if reactivated: ${data.tempPassword}`);
          },
        },
      ]}
    />
  );
}
