'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'معايير التقييم وقوائم الدرجات', en: 'Scoring & Evaluation Rubrics' }}
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
