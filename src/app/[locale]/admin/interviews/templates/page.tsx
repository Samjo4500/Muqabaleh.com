'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'نماذج المقابلات', en: 'Interview Templates' }}
      description={{
        ar: 'إنشاء/تعديل/حذف النماذج: الاسم (عربي/إنجليزي)، القطاع، المسمى الوظيفي، مستوى الصعوبة، المدة، عدد الأسئلة.',
        en: 'Create/edit/delete templates: name EN/AR, industry, job role, difficulty level, duration, question count.',
      }}
      resource="templates"
      columns={[
        { key: 'titleAr', label: { ar: 'الاسم (عربي)', en: 'Name AR' } },
        { key: 'titleEn', label: { ar: 'الاسم (إنجليزي)', en: 'Name EN' } },
        { key: 'industry', label: { ar: 'القطاع', en: 'Industry' } },
        {
          key: 'level',
          label: { ar: 'مستوى الصعوبة', en: 'Difficulty' },
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
