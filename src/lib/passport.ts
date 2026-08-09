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

type PoolSnapshot = {
  headline: string | null;
  desiredRole: string | null;
  isVisible: boolean;
  isOptedIn: boolean;
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

/** Load talent-pool fields with a raw fallback when schema drifts from production. */
async function loadPool(userId: string): Promise<PoolSnapshot | null> {
  try {
    return await db.candidatePool.findUnique({
      where: { userId },
      select: {
        headline: true,
        desiredRole: true,
        isVisible: true,
        isOptedIn: true,
      },
    });
  } catch (err) {
    console.warn('[passport] candidatePool prisma select failed, using raw fallback', err);
  }

  try {
    const colRows = await db.$queryRawUnsafe<Array<{ column_name: string }>>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema='public' AND table_name='CandidatePool'
         AND column_name IN ('headline','desiredRole','isVisible','isOptedIn')`,
    );
    const cols = new Set(colRows.map((c) => c.column_name));
    if (!cols.has('isVisible') || !cols.has('isOptedIn')) return null;

    const selectParts = [
      cols.has('headline') ? `"headline"` : `NULL AS "headline"`,
      cols.has('desiredRole') ? `"desiredRole"` : `NULL AS "desiredRole"`,
      `"isVisible"`,
      `"isOptedIn"`,
    ];

    const rows = await db.$queryRawUnsafe<PoolSnapshot[]>(
      `SELECT ${selectParts.join(', ')} FROM "CandidatePool" WHERE "userId" = $1 LIMIT 1`,
      userId,
    );
    return rows[0] ?? null;
  } catch (inner) {
    console.warn('[passport] candidatePool unavailable', inner);
    return null;
  }
}

/**
 * Build a Muqabaleh passport from the latest completed scored interview.
 * Score rule: newest COMPLETED interview with overallScore set.
 * AI practice sessions sync into Interview on finalize (0–100).
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
    },
  });

  if (!user) return null;

  const pool = await loadPool(userId);

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

  const score = latestInterview?.overallScore ?? null;
  const hasCompletedInterview = score != null;

  // Public only with explicit opt-in — completing an interview must not auto-publish.
  const isPubliclyVisible = Boolean(pool?.isVisible && pool?.isOptedIn);

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
