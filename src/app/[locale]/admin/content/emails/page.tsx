'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'قوالب البريد الإلكتروني', en: 'Email Templates' }}
      description={{
        ar: 'ترحيب، إكمال مقابلة، إيصال دفع، إعادة تعيين كلمة المرور، موافقة شريك — عربي/إنجليزي.',
        en: 'Welcome, interview completion, payment receipt, password reset, partner approval — AR/EN.',
      }}
      resource="email_templates"
      columns={[
        { key: 'key', label: { ar: 'المفتاح', en: 'Key' } },
        { key: 'subjectAr', label: { ar: 'الموضوع (عربي)', en: 'Subject AR' } },
        { key: 'subjectEn', label: { ar: 'الموضوع (إنجليزي)', en: 'Subject EN' } },
        {
          key: 'isActive',
          label: { ar: 'الحالة', en: 'Active' },
          render: (row) => (row.isActive ? 'Active' : 'Off'),
        },
      ]}
      demoRows={[
        { id: 'e1', key: 'welcome', subjectAr: 'مرحباً بك في مقابلة', subjectEn: 'Welcome to Muqabaleh', isActive: true },
        { id: 'e2', key: 'interview_complete', subjectAr: 'اكتملت مقابلتك', subjectEn: 'Interview completed', isActive: true },
        { id: 'e3', key: 'payment_receipt', subjectAr: 'إيصال الدفع', subjectEn: 'Payment receipt', isActive: true },
        { id: 'e4', key: 'password_reset', subjectAr: 'إعادة تعيين كلمة المرور', subjectEn: 'Password reset', isActive: true },
        { id: 'e5', key: 'partner_approval', subjectAr: 'تمت الموافقة على الشراكة', subjectEn: 'Partner approved', isActive: true },
      ]}
    />
  );
}
