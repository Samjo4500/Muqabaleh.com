'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      title={{ ar: 'محتوى الصفحة الرئيسية', en: 'Landing Page Content' }}
      description={{
        ar: 'نص البطل عربي/إنجليزي، الأقسام، الشهادات، الأسئلة الشائعة، ووسوم SEO.',
        en: 'Hero EN/AR, feature sections, testimonials, FAQ, SEO meta tags.',
      }}
      sections={[
        {
          title: { ar: 'قسم البطل', en: 'Hero section' },
          fields: [
            { key: 'heroAr', label: { ar: 'العنوان (عربي)', en: 'Headline AR' }, type: 'textarea', value: 'استعد للمقابلة. عزّز ثقتك. اقترب من العرض.' },
            { key: 'heroEn', label: { ar: 'العنوان (إنجليزي)', en: 'Headline EN' }, type: 'textarea', value: 'Your Interview. Your Confidence. Your Offer.' },
            { key: 'subAr', label: { ar: 'الوصف (عربي)', en: 'Subtitle AR' }, type: 'textarea' },
            { key: 'subEn', label: { ar: 'الوصف (إنجليزي)', en: 'Subtitle EN' }, type: 'textarea' },
          ],
        },
        {
          title: { ar: 'SEO', en: 'SEO meta tags' },
          fields: [
            { key: 'seoTitle', label: { ar: 'عنوان SEO', en: 'SEO title' }, type: 'text', value: 'مقابلة | Muqabaleh' },
            { key: 'seoDesc', label: { ar: 'وصف SEO', en: 'SEO description' }, type: 'textarea' },
            { key: 'seoKeywords', label: { ar: 'الكلمات المفتاحية', en: 'Keywords' }, type: 'text' },
          ],
        },
        {
          title: { ar: 'الشهادات والأسئلة', en: 'Testimonials & FAQ' },
          fields: [
            { key: 'testimonials', label: { ar: 'مدير الشهادات (JSON)', en: 'Testimonials manager (JSON)' }, type: 'textarea', value: '[]' },
            { key: 'faq', label: { ar: 'مدير الأسئلة الشائعة (JSON)', en: 'FAQ manager (JSON)' }, type: 'textarea', value: '[]' },
          ],
        },
      ]}
    />
  );
}
