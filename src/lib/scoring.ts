// ─── Muqabaleh Interview Score System ───
// Converts 0-100 scale to 1-10 Muqabaleh Score with level labels

export type ScoreLevel =
  | 'NEEDS_DEVELOPMENT'
  | 'DEVELOPING'
  | 'JOB_READY'
  | 'STRONG_CANDIDATE'
  | 'EXCEPTIONAL';

export interface MuqabalehScore {
  score: number;       // 1-10
  level: ScoreLevel;
  levelAr: string;
  levelEn: string;
}

const LEVEL_MAP: Record<ScoreLevel, { ar: string; en: string }> = {
  NEEDS_DEVELOPMENT:  { ar: 'يحتاج تطوير',     en: 'Needs Development' },
  DEVELOPING:         { ar: 'في طور التطوير',  en: 'Developing' },
  JOB_READY:          { ar: 'جاهز للعمل',      en: 'Job Ready' },
  STRONG_CANDIDATE:   { ar: 'متميز',            en: 'Strong Candidate' },
  EXCEPTIONAL:        { ar: 'استثنائي',          en: 'Exceptional' },
};

/**
 * Convert a 0-100 score to Muqabaleh 1-10 score with level.
 */
export function toMuqabalehScore(score100: number): MuqabalehScore {
  const clamped = Math.max(0, Math.min(100, score100));
  const score = Math.round((clamped / 100) * 9 + 1); // maps 0→1, 100→10
  const level = getScoreLevel(score);
  const labels = LEVEL_MAP[level];
  return {
    score,
    level,
    levelAr: labels.ar,
    levelEn: labels.en,
  };
}

function getScoreLevel(score: number): ScoreLevel {
  if (score >= 10) return 'EXCEPTIONAL';
  if (score >= 8)  return 'STRONG_CANDIDATE';
  if (score >= 6)  return 'JOB_READY';
  if (score >= 4)  return 'DEVELOPING';
  return 'NEEDS_DEVELOPMENT';
}

/**
 * Get the score color class for the 1-10 score.
 */
export function getScoreColor(score: number): string {
  if (score >= 8)  return 'text-emerald-400';
  if (score >= 6)  return 'text-[var(--gold)]';
  if (score >= 4)  return 'text-amber-400';
  return 'text-red-400';
}

/**
 * Get recommendation based on 1-10 score.
 */
export function getRecommendation(score: number): string {
  if (score >= 8)  return 'STRONG_RECOMMEND';
  if (score >= 6)  return 'RECOMMENDED';
  if (score >= 4)  return 'CONSIDER';
  return 'NOT_RECOMMENDED';
}

/**
 * Convert individual criterion scores (0-100) to 1-10.
 */
export function toCriterionScore(score100: number | null | undefined): number {
  if (score100 == null) return 0;
  return Math.round((Math.max(0, Math.min(100, score100)) / 100) * 9 + 1);
}

/**
 * Format score for display: "7/10"
 */
export function formatScore(score: number): string {
  return `${score}/10`;
}
