'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      title={{ ar: 'إدارة الأوامر (Prompts)', en: 'Prompt Management' }}
      description={{
        ar: 'أوامر النظام لتوليد المقابلات، التقييم، الملاحظات، وحوار الأفاتار — مع A/B وسجل الإصدارات.',
        en: 'System prompts for interview generation, scoring, feedback, avatar dialogue — A/B tests & version history.',
      }}
      sections={[
        {
          title: { ar: 'توليد المقابلة', en: 'Interview generation' },
          fields: [
            {
              key: 'interviewPrompt',
              label: { ar: 'أمر النظام', en: 'System prompt' },
              type: 'textarea',
              value:
                'You are Muqabaleh, an Arabic/English AI interview coach. Ask adaptive follow-ups.',
            },
          ],
        },
        {
          title: { ar: 'التقييم', en: 'Scoring' },
          fields: [
            {
              key: 'scoringPrompt',
              label: { ar: 'أمر التقييم', en: 'Scoring prompt' },
              type: 'textarea',
              value: 'Score content, clarity, confidence, cultural fit from 0-100 with rationale.',
            },
          ],
        },
        {
          title: { ar: 'توليد الملاحظات', en: 'Feedback generation' },
          fields: [
            {
              key: 'feedbackPrompt',
              label: { ar: 'أمر الملاحظات', en: 'Feedback prompt' },
              type: 'textarea',
              value: 'Provide actionable bilingual feedback with strengths and improvements.',
            },
          ],
        },
        {
          title: { ar: 'حوار الأفاتار', en: 'Avatar dialogue' },
          fields: [
            {
              key: 'avatarPrompt',
              label: { ar: 'أمر الحوار', en: 'Dialogue prompt' },
              type: 'textarea',
              value: 'Speak naturally as Fahd or Noora. Keep questions concise.',
            },
            { key: 'abTest', label: { ar: 'تفعيل اختبار A/B', en: 'Enable A/B test' }, type: 'toggle', value: false },
            { key: 'version', label: { ar: 'الإصدار الحالي', en: 'Current version' }, type: 'text', value: 'v1.0.0' },
          ],
        },
      ]}
    />
  );
}
