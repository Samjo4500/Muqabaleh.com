export type Grade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';

export function scoreToGrade(score: number): Grade {
  if (score >= 9.5) return 'A+';
  if (score >= 9) return 'A';
  if (score >= 8) return 'B+';
  if (score >= 7) return 'B';
  if (score >= 6) return 'C+';
  if (score >= 5) return 'C';
  return 'D';
}

export function averageScores(scores: number[]): number {
  if (!scores.length) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

/**
 * @deprecated Fake cohort math — do not present as real percentiles.
 * Kept as a private band helper for honest score-band copy only.
 */
export function percentileFromScore(score: number): number {
  const clamped = Math.max(0, Math.min(10, score));
  return Math.round(Math.min(98, Math.max(5, clamped * 9.5)));
}

/** Honest score-band label (no invented peer cohort). */
export function scoreBandLabel(score: number): {
  band: 'strong' | 'solid' | 'developing';
  message: string;
  messageAr: string;
} {
  if (score >= 8) {
    return {
      band: 'strong',
      message: 'Strong practice band for this mock — keep sharpening quantified examples.',
      messageAr: 'نطاق أداء قوي لهذه المقابلة التجريبية — واصل تقوية الأمثلة القابلة للقياس.',
    };
  }
  if (score >= 6) {
    return {
      band: 'solid',
      message: 'Solid practice band — tighten STAR structure and outcomes to move up.',
      messageAr: 'نطاق أداء متين — أحكم هيكل STAR والنتائج للارتقاء.',
    };
  }
  return {
    band: 'developing',
    message: 'Developing practice band — prioritize structure and concrete evidence next session.',
    messageAr: 'نطاق قيد التطوير — أعطِ أولوية للهيكل والأدلة الملموسة في الجلسة التالية.',
  };
}

export function getDifficultyRange(
  level: string,
  round: string,
): string[] {
  if (round === 'phone_screen') return ['easy', 'medium'];
  if (level === 'entry') return ['easy', 'medium'];
  if (level === 'mid') return ['medium', 'hard'];
  if (level === 'senior') return ['medium', 'hard'];
  if (level === 'executive') return ['hard'];
  return ['easy', 'medium', 'hard'];
}

export function getDefaultTime(difficulty: string, level: string): number {
  const base: Record<string, number> = { easy: 90, medium: 180, hard: 300 };
  const multiplier: Record<string, number> = {
    entry: 1,
    mid: 1.2,
    senior: 1.5,
    executive: 2,
  };
  return Math.round((base[difficulty] ?? 180) * (multiplier[level] ?? 1));
}

export function getPositionType(
  index: number,
  total: number,
): 'warm_up' | 'opening' | 'core' | 'deep_dive' | 'closing' {
  if (index === 0) return 'warm_up';
  if (index === total - 1) return 'closing';
  if (index < total * 0.3) return 'opening';
  if (index > total * 0.7) return 'deep_dive';
  return 'core';
}
