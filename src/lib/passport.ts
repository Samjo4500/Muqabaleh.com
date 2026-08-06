import { db } from '@/lib/db';

export type PassportStatus = 'scored' | 'interview' | 'hired';

export type PassportPayload = {
  userId: string;
  displayName: string;
  image: string | null;
  headline: string | null;
  desiredRole: string | null;
  country: string | null;
  industry: string | null;
  experience: string | null;
  language: string | null;
  score: number | null;
  status: PassportStatus;
  scoreMax: number;
  verificationId: string | null;
  interviewIndustry: string | null;
  interviewType: string | null;
  completedAt: string | null;
  certificates: Array<{
    id: string;
    type: string | null;
    industry: string | null;
    score: number | null;
    issuedAt: string;
    verificationId: string;
  }>;
  isPubliclyVisible: boolean;
  hasCompletedInterview: boolean;
};

function resolveStatus(score: number | null): PassportStatus {
  if (score == null) return 'interview';
  if (score >= 85) return 'hired';
  return 'scored';
}

function displayNameFrom(name: string | null | undefined, fallback = 'Candidate'): string {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Build a Muqabaleh passport from the latest completed scored interview.
 * Score rule: newest COMPLETED interview with overallScore set.
 */
export async function buildPassport(
  userId: string,
  options?: { forPublic?: boolean }
): Promise<PassportPayload | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      country: true,
      industry: true,
      experience: true,
      language: true,
      candidatePool: {
        select: {
          headline: true,
          desiredRole: true,
          isVisible: true,
          isOptedIn: true,
        },
      },
    },
  });

  if (!user) return null;

  const latestInterview = await db.interview.findFirst({
    where: {
      userId,
      status: 'COMPLETED',
      overallScore: { not: null },
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      overallScore: true,
      verificationId: true,
      industry: true,
      type: true,
      updatedAt: true,
    },
  });

  const certRows = await db.interview.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      verificationId: { not: null },
    },
    orderBy: { updatedAt: 'desc' },
    take: 6,
    select: {
      id: true,
      type: true,
      industry: true,
      overallScore: true,
      updatedAt: true,
      verificationId: true,
    },
  });

  const pool = user.candidatePool;
  const score = latestInterview?.overallScore ?? null;
  const hasCompletedInterview = score != null;

  // Public share: visible in talent pool, or has a verified Muqabaleh score
  const isPubliclyVisible =
    Boolean(pool?.isVisible && pool?.isOptedIn) || hasCompletedInterview;

  if (options?.forPublic && !isPubliclyVisible) {
    return null;
  }

  return {
    userId: user.id,
    displayName: displayNameFrom(user.name),
    image: user.image,
    headline: pool?.headline ?? null,
    desiredRole: pool?.desiredRole ?? null,
    country: options?.forPublic ? null : user.country,
    industry: user.industry,
    experience: user.experience,
    language: user.language,
    score,
    status: resolveStatus(score),
    scoreMax: 100,
    verificationId: latestInterview?.verificationId ?? null,
    interviewIndustry: latestInterview?.industry ?? null,
    interviewType: latestInterview?.type ?? null,
    completedAt: latestInterview?.updatedAt?.toISOString() ?? null,
    certificates: certRows
      .filter((c): c is typeof c & { verificationId: string } => Boolean(c.verificationId))
      .map((c) => ({
        id: c.id,
        type: c.type,
        industry: c.industry,
        score: c.overallScore,
        issuedAt: c.updatedAt.toISOString(),
        verificationId: c.verificationId,
      })),
    isPubliclyVisible,
    hasCompletedInterview,
  };
}
