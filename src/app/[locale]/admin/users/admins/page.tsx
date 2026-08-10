'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'المسؤولون والمشرفون', en: 'Admins & Moderators' }}
      description={{
        ar: 'إنشاء مسؤول، إعادة تعيين كلمة المرور، وتعطيل الجلسات (JWT).',
        en: 'Create admins, reset passwords, and revoke access (JWT deactivate).',
      }}
      resource="admins"
      creatable={false}
      columns={[
        { key: 'name', label: { ar: 'الاسم', en: 'Name' } },
        { key: 'email', label: { ar: 'البريد', en: 'Email' } },
        { key: 'role', label: { ar: 'الدور', en: 'Role' } },
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
          id: 'create',
          label: { ar: 'إنشاء مسؤول', en: 'Create admin' },
          onRun: async () => {
            const email = window.prompt('Admin email');
            if (!email) return;
            const name = window.prompt('Name', 'Admin') || 'Admin';
            const res = await fetch('/api/admin/admins', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'create', email, name, role: 'ADMIN' }),
            });
            const data = await res.json();
            if (!res.ok) {
              alert(data.error || 'Failed');
              return;
            }
            alert(`Created ${data.user.email}\nTemp password: ${data.tempPassword}`);
            window.location.reload();
          },
        },
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
      ]}
    />
  );
}
