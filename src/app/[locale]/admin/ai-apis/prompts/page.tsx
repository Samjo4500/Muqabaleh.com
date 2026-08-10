'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      settingKey="ai_prompts"
      title={{ ar: 'إدارة التعليمات النصية', en: 'Prompt Management' }}
      description={{
        ar: 'التعليمات الأساسية للنظام لتوليد المقابلات، التقييم، الملاحظات، وحوار الأفاتار — مع اختبار A/B للتعليمات وسجل الإصدارات.',
        en: 'System prompts for interview generation, scoring, feedback, avatar dialogue — A/B tests & version history.',
      }}
      sections={[
        {
          title: { ar: 'توليد المقابلة', en: 'Interview generation' },
          fields: [
            {
              key: 'interviewPrompt',
              label: { ar: 'التعليمات الأساسية للنظام', en: 'System prompt' },
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
              label: { ar: 'تعليمات التقييم', en: 'Scoring prompt' },
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
              label: { ar: 'تعليمات الملاحظات', en: 'Feedback prompt' },
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
              label: { ar: 'تعليمات الحوار', en: 'Dialogue prompt' },
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
