import { db } from '@/lib/db';
import { generateVerificationId } from '@/lib/ai';

type SyncInput = {
  sessionId: string;
  userId: string;
  /** 0–10 engine score */
  overallScore10: number;
  contentScore10?: number | null;
  structureScore10?: number | null;
  confidenceScore10?: number | null;
  strengths?: string[];
  weaknesses?: string[];
  summary?: string | null;
  targetRole?: string | null;
  targetIndustry?: string | null;
  seniorityLevel?: string | null;
  interviewRound?: string | null;
  questionTypes?: string[] | null;
  language?: string | null;
};

function toHundred(score10: number | null | undefined): number | null {
  if (score10 == null || Number.isNaN(score10)) return null;
  return Math.max(0, Math.min(100, Math.round(score10 * 10)));
}

function mapType(questionTypes?: string[] | null, round?: string | null): string {
  const types = questionTypes ?? [];
  if (types.includes('technical')) return 'TECHNICAL';
  if (types.includes('behavioral')) return 'BEHAVIORAL';
  if (round?.includes('technical')) return 'TECHNICAL';
  return 'BEHAVIORAL';
}

function mapLanguage(language?: string | null): string {
  if (!language) return 'AR';
  const l = language.toLowerCase();
  if (l.startsWith('en')) return 'EN';
  if (l === 'bilingual') return 'AR';
  return 'AR';
}

function mapExperience(seniority?: string | null): string | null {
  switch ((seniority || '').toLowerCase()) {
    case 'entry':
    case 'junior':
      return 'JUNIOR';
    case 'mid':
      return 'MID';
    case 'senior':
      return 'SENIOR';
    case 'executive':
      return 'EXECUTIVE';
    default:
      return seniority?.toUpperCase() || null;
  }
}

/**
 * Upsert a legacy Interview row from a completed AI InterviewSession
 * so passport, certificates, and /verify keep working (0–100 scale).
 */
export async function syncSessionToPassportInterview(
  input: SyncInput,
): Promise<{ interviewId: string; verificationId: string } | null> {
  const marker = `ai-session:${input.sessionId}`;
  const overall = toHundred(input.overallScore10);
  if (overall == null) return null;

  const existing = await db.interview.findFirst({
    where: { userId: input.userId, position: marker },
    select: { id: true, verificationId: true },
  });

  const verificationId = existing?.verificationId || generateVerificationId();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 2);

  const industry =
    input.targetIndustry?.trim() ||
    input.targetRole?.trim() ||
    'General';

  const payload = {
    userId: input.userId,
    mode: 'AI',
    type: mapType(input.questionTypes, input.interviewRound),
    industry,
    experience: mapExperience(input.seniorityLevel),
    position: marker,
    language: mapLanguage(input.language),
    status: 'COMPLETED',
    overallScore: overall,
    contentScore: toHundred(input.contentScore10),
    clarityScore: toHundred(input.structureScore10),
    confidenceScore: toHundred(input.confidenceScore10),
    feedback: input.summary ?? null,
    strengths: input.strengths?.length ? JSON.stringify(input.strengths) : null,
    improvements: input.weaknesses?.length ? JSON.stringify(input.weaknesses) : null,
    recommendation: overall >= 85 ? 'STRONG_HIRE' : overall >= 70 ? 'HIRE' : 'PRACTICE',
    verificationId,
    expiresAt,
  };

  let interviewId: string;
  if (existing) {
    await db.interview.update({
      where: { id: existing.id },
      data: payload,
    });
    interviewId = existing.id;
  } else {
    const created = await db.interview.create({ data: payload });
    interviewId = created.id;
  }

  // Keep CandidatePool passport signal fresh for Jeannie matching
  try {
    const completed = await db.interview.count({
      where: {
        userId: input.userId,
        status: 'COMPLETED',
        overallScore: { not: null },
      },
    });
    const avg = await db.interview.aggregate({
      where: {
        userId: input.userId,
        status: 'COMPLETED',
        overallScore: { not: null },
      },
      _avg: { overallScore: true },
    });

    await db.candidatePool.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        role: input.targetRole?.trim() || 'Professional',
        level: mapExperience(input.seniorityLevel) || 'MID',
        industry: input.targetIndustry?.trim() || null,
        desiredRole: input.targetRole?.trim() || null,
        muqabalehScore: overall,
        averageScore: avg._avg.overallScore ?? overall,
        interviewCount: completed,
      },
      update: {
        muqabalehScore: overall,
        averageScore: avg._avg.overallScore ?? overall,
        interviewCount: completed,
        ...(input.targetRole?.trim()
          ? { desiredRole: input.targetRole.trim(), role: input.targetRole.trim() }
          : {}),
        ...(input.targetIndustry?.trim()
          ? { industry: input.targetIndustry.trim() }
          : {}),
      },
    });
  } catch (err) {
    console.error('[syncSessionToPassportInterview] candidate pool sync failed', err);
  }

  return { interviewId, verificationId };
}
