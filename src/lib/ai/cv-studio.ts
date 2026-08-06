import { db } from '@/lib/db';
import { generateJsonWithFallback } from '@/lib/ai/llm';
import { canUseCvStudio } from '@/lib/plans/entitlements';

export type CvStudioInput = {
  userId: string;
  sourceText: string;
  targetRole?: string;
  language?: 'en' | 'ar' | 'both';
};

/**
 * Jeannie Pro — CV studio: improve / rewrite a CV draft for a target role.
 */
export async function improveCvDraft(input: CvStudioInput) {
  const allowed = await canUseCvStudio(input.userId);
  if (!allowed) {
    return { ok: false as const, error: 'CV studio requires Jeannie Pro', status: 403 };
  }

  const source = input.sourceText.trim();
  if (source.length < 40) {
    return { ok: false as const, error: 'Paste a longer CV draft to improve', status: 400 };
  }

  const role = input.targetRole?.trim() || 'Target role';
  const lang = input.language || 'both';

  const fallback = {
    title: `${role} — improved CV`,
    content: [
      `PROFESSIONAL SUMMARY`,
      `Hire-ready ${role} candidate with verified Muqabaleh interview signal.`,
      ``,
      `EXPERIENCE`,
      source.slice(0, 1200),
      ``,
      `NOTES`,
      `- Quantify impact with metrics`,
      `- Keep bullets under two lines`,
      `- Align keywords to the target role`,
    ].join('\n'),
    contentAr: `ملخص محسّن لدور ${role}. أعد هيكلة الخبرات بنقاط أثر قابلة للقياس ووافق الكلمات المفتاحية مع الدور المستهدف.`,
    bullets: [
      'Lead with outcomes, not duties',
      'Mirror role keywords naturally',
      'Keep evidence interview-ready',
    ],
  };

  const { data, mode } = await generateJsonWithFallback(
    `You are Muqabaleh CV Studio for Jeannie Pro.
Rewrite the CV to be ATS-friendly and hire-ready for the target role.
Return JSON: { "title": string, "content": string, "contentAr": string, "bullets": string[] }
Language preference: ${lang}. Keep facts; do not invent employers.`,
    `Target role: ${role}\n\nSource CV:\n${source.slice(0, 8000)}`,
    fallback,
  );

  const title = String(data.title || fallback.title);
  const content = String(data.content || fallback.content);
  const contentAr = data.contentAr ? String(data.contentAr) : fallback.contentAr;
  const bullets = Array.isArray(data.bullets)
    ? data.bullets.map(String).slice(0, 8)
    : fallback.bullets;

  const doc = await db.jeannieDocument.create({
    data: {
      userId: input.userId,
      kind: 'CV_DRAFT',
      title,
      content,
      contentAr,
      meta: { mode, targetRole: role, bullets },
    },
  });

  return { ok: true as const, document: doc, mode };
}
