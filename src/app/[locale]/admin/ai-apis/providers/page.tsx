'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      title={{ ar: 'إعدادات مزودي الذكاء الاصطناعي', en: 'AI Provider Settings' }}
      description={{
        ar: 'Google Gemini ومزوّد الصوت/الأفاتار — مفاتيح، نماذج، استخدام الرموز، وتقدير التكلفة.',
        en: 'Google Gemini and Avatar/TTS providers — keys, models, token usage, cost estimator.',
      }}
      sections={[
        {
          title: { ar: 'Google Gemini', en: 'Google Gemini API' },
          fields: [
            { key: 'geminiKey', label: { ar: 'مفتاح API', en: 'API key' }, type: 'password' },
            {
              key: 'geminiModel',
              label: { ar: 'النموذج', en: 'Model selection' },
              type: 'select',
              value: 'gemini-2.0-flash',
              options: [
                { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash' },
                { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro' },
                { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
              ],
            },
            { key: 'tokenTracker', label: { ar: 'تتبع الرموز (شهري)', en: 'Token usage tracker (monthly)' }, type: 'text', value: 'Auto from AiApiUsage' },
            { key: 'costEstimate', label: { ar: 'تقدير التكلفة', en: 'Cost estimator' }, type: 'text', value: '$0.00' },
            { key: 'geminiOn', label: { ar: 'تفعيل Gemini', en: 'Gemini ON/OFF' }, type: 'toggle', value: true },
          ],
        },
        {
          title: { ar: 'الأفاتار / تحويل النص لصوت', en: 'Avatar / TTS Provider' },
          fields: [
            { key: 'ttsKey', label: { ar: 'مفتاح API', en: 'API key' }, type: 'password' },
            {
              key: 'voice',
              label: { ar: 'الصوت', en: 'Voice selection' },
              type: 'select',
              value: 'MALE',
              options: [
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'NEUTRAL', label: 'Neutral' },
              ],
            },
            {
              key: 'langPriority',
              label: { ar: 'أولوية اللغة', en: 'Language priority' },
              type: 'select',
              value: 'AR',
              options: [
                { value: 'AR', label: 'Arabic first' },
                { value: 'EN', label: 'English first' },
              ],
            },
            { key: 'ttsOn', label: { ar: 'تفعيل TTS', en: 'TTS ON/OFF' }, type: 'toggle', value: true },
          ],
        },
      ]}
    />
  );
}
