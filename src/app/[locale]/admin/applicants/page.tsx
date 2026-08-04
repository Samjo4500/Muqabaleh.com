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
