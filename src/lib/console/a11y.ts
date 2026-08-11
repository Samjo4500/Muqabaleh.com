/** Console accessibility prefs — localStorage only, no DB. */

export type FontScale = 'standard' | 'large' | 'xl';

export type ConsoleA11yPrefs = {
  fontScale: FontScale;
  readerFont: boolean;
  reduceMotion: boolean;
  simpleMode: boolean;
};

export const A11Y_STORAGE_KEY = 'mq-console-a11y:v1';

export const DEFAULT_A11Y_PREFS: ConsoleA11yPrefs = {
  fontScale: 'standard',
  readerFont: false,
  reduceMotion: false,
  simpleMode: false,
};

export const FONT_SCALE_FACTOR: Record<FontScale, number> = {
  standard: 1,
  large: 1.125,
  xl: 1.25,
};

export function readA11yPrefs(): ConsoleA11yPrefs {
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_A11Y_PREFS };
    const parsed = JSON.parse(raw) as Partial<ConsoleA11yPrefs>;
    return {
      fontScale:
        parsed.fontScale === 'large' || parsed.fontScale === 'xl'
          ? parsed.fontScale
          : 'standard',
      readerFont: Boolean(parsed.readerFont),
      reduceMotion: Boolean(parsed.reduceMotion),
      simpleMode: Boolean(parsed.simpleMode),
    };
  } catch {
    return { ...DEFAULT_A11Y_PREFS };
  }
}

export function writeA11yPrefs(prefs: ConsoleA11yPrefs) {
  try {
    localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export type ScoreBand = 'low' | 'average' | 'strong';

export function scoreBand(score: number): ScoreBand {
  if (score < 50) return 'low';
  if (score < 70) return 'average';
  return 'strong';
}

export function gradeSpoken(grade: string): string {
  if (grade === 'B+') return 'B plus';
  return grade;
}

/** Nav keys hidden when Simple Mode is on. */
export const SIMPLE_MODE_HIDDEN_NAV = new Set([
  'navAnalytics',
  'navDevelopers',
  'navRevenue',
  'navAccreditation',
]);

export function stageShape(key: string): 'circle' | 'diamond' | 'star' | 'dash' | 'square' {
  switch (key) {
    case 'SHORTLISTED':
      return 'diamond';
    case 'HIRED':
      return 'star';
    case 'REJECTED':
      return 'dash';
    case 'NEW':
      return 'circle';
    default:
      return 'square';
  }
}
