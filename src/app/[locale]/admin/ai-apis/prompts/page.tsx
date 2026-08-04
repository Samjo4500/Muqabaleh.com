'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L } from '@/lib/admin/labels';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const DEFAULT_PROMPTS = [
  {
    key: 'interview_system',
    ar: 'أنت محاور ذكي لمنصة مقابلة. قيّم المرشح للمقابلات الوظيفية فقط.',
    en: 'You are an AI interviewer for Muqabaleh. Assess candidates for job interviews only.',
  },
  {
    key: 'scoring',
    ar: 'قيّم الإجابة على معايير المحتوى والوضوح والثقة والملاءمة الثقافية.',
    en: 'Score the answer on content, clarity, confidence, and cultural fit.',
  },
];

export default function AiPromptsPage() {
  const [prompts, setPrompts] = useState(DEFAULT_PROMPTS);

  const save = async () => {
    const res = await fetch('/api/admin/resources?resource=email_templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: `prompt_snapshot_${Date.now()}`,
        subjectAr: 'لقطة أوامر الذكاء الاصطناعي',
        subjectEn: 'AI prompt snapshot',
        bodyAr: JSON.stringify(prompts, null, 2),
        bodyEn: JSON.stringify(prompts, null, 2),
      }),
    });
    if (res.ok) toast.success(`${L.success.ar} / ${L.success.en}`);
    else toast.error(`${L.error.ar} / ${L.error.en}`);
  };

  return (
    <div>
      <AdminPageHeader
        title={{ ar: L.prompts.ar, en: L.prompts.en }}
        description={{
          ar: 'إدارة أوامر Gemini لمقابلات مقابلة (بدون اختبارات لغة).',
          en: 'Manage Gemini prompts for Muqabaleh interviews (no language-exam content).',
        }}
        actions={
          <Button type="button" size="sm" onClick={() => void save()}>
            <BiInline ar={L.save.ar} en={L.save.en} />
          </Button>
        }
      />

      <div className="space-y-4">
        {prompts.map((p, idx) => (
          <div key={p.key} className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-4">
            <BiLabel ar={`مفتاح: ${p.key}`} en={`Key: ${p.key}`} />
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-[var(--text-muted)]">العربية / Arabic</p>
                <Textarea
                  value={p.ar}
                  onChange={(e) => {
                    const next = [...prompts];
                    next[idx] = { ...p, ar: e.target.value };
                    setPrompts(next);
                  }}
                  rows={5}
                />
              </div>
              <div>
                <p className="mb-1 text-xs text-[var(--text-muted)]">English</p>
                <Textarea
                  value={p.en}
                  onChange={(e) => {
                    const next = [...prompts];
                    next[idx] = { ...p, en: e.target.value };
                    setPrompts(next);
                  }}
                  rows={5}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
