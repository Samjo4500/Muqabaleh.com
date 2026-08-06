import { db } from '@/lib/db';
import { generateJsonWithFallback } from '@/lib/ai/llm';
import { canUseCoverLetterAi } from '@/lib/plans/entitlements';

export type CoverLetterInput = {
  userId: string;
  companyName: string;
  roleTitle: string;
  jobSummary?: string;
  candidateSummary?: string;
  language?: 'en' | 'ar' | 'both';
  opportunityId?: string;
};

/**
 * Jeannie Pro — cover letter generate + assist.
 */
export async function generateCoverLetter(input: CoverLetterInput) {
  const allowed = await canUseCoverLetterAi(input.userId);
  if (!allowed) {
    return {
      ok: false as const,
      error: 'Cover letter assist requires Jeannie Pro',
      status: 403,
    };
  }

  const company = input.companyName.trim();
  const role = input.roleTitle.trim();
  if (!company || !role) {
    return { ok: false as const, error: 'Company and role are required', status: 400 };
  }

  const pool = await db.candidatePool.findUnique({ where: { userId: input.userId } });
  const candidate =
    input.candidateSummary?.trim() ||
    pool?.summary ||
    pool?.headline ||
    'Candidate with a verified Muqabaleh passport';

  const fallback = {
    content: [
      `Dear Hiring Team at ${company},`,
      ``,
      `I am applying for the ${role} role. My Muqabaleh interview passport verifies hire-ready signal beyond a CV claim.`,
      ``,
      candidate.slice(0, 400),
      ``,
      `I would welcome the chance to discuss how I can contribute quickly.`,
      ``,
      `Kind regards`,
    ].join('\n'),
    contentAr: [
      `فريق التوظيف في ${company}،`,
      ``,
      `أتقدم لوظيفة ${role}. جواز مقابلة يوثّق جاهزيتي للتوظيف بما يتجاوز ادّعاء السيرة الذاتية.`,
      ``,
      `أرحب بفرصة مناقشة كيف يمكنني الإسهام بسرعة.`,
      ``,
      `مع التحية`,
    ].join('\n'),
    subject: `Application — ${role}`,
  };

  const { data, mode } = await generateJsonWithFallback(
    `You write concise professional cover letters for Muqabaleh Jeannie Pro.
Never spam. Keep under 180 words. Mention verified interview passport briefly.
Return JSON: { "content": string, "contentAr": string, "subject": string }`,
    `Company: ${company}
Role: ${role}
Job summary: ${input.jobSummary || 'n/a'}
Candidate: ${candidate}
Language: ${input.language || 'both'}`,
    fallback,
  );

  const content = String(data.content || fallback.content);
  const contentAr = String(data.contentAr || fallback.contentAr);
  const subject = String(data.subject || fallback.subject);

  const doc = await db.jeannieDocument.create({
    data: {
      userId: input.userId,
      kind: 'COVER_LETTER',
      title: subject,
      content,
      contentAr,
      meta: {
        mode,
        company,
        role,
        opportunityId: input.opportunityId || null,
      },
    },
  });

  if (input.opportunityId) {
    await db.jeannieOpportunity.updateMany({
      where: { id: input.opportunityId, userId: input.userId },
      data: { coverLetter: content },
    });
  }

  return { ok: true as const, document: doc, mode };
}
