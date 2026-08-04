'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "بنك الأسئلة", en: "Question Bank" }}
      resource="questions"
      creatable={true}
      columns={[
    { key: 'textAr', label: { ar: 'السؤال', en: 'Question AR' } },
    { key: 'textEn', label: { ar: 'Question', en: 'Question EN' } },
    { key: 'industry', label: { ar: 'القطاع', en: 'Industry' } },
    { key: 'difficulty', label: { ar: 'الصعوبة', en: 'Difficulty' } }
      ]}
    />
  );
}
