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
