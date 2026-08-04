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
        { key: 'industry', label: { ar: 'القطاع', en: 'Industry' } },
        { key: 'difficulty', label: { ar: 'مستوى الصعوبة', en: 'Difficulty' } },
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
