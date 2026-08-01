// ─── Muqabaleh Shared Constants ───

/**
 * 20 MENA countries (Israel excluded per spec).
 * Used across profile, B2B onboarding, and B2B settings.
 */
export const MENA_COUNTRIES = [
  { value: 'SAUDI_ARABIA', ar: '\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629', en: 'Saudi Arabia' },
  { value: 'UAE', ar: '\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629', en: 'UAE' },
  { value: 'EGYPT', ar: '\u0645\u0635\u0631', en: 'Egypt' },
  { value: 'JORDAN', ar: '\u0627\u0644\u0623\u0631\u062f\u0646', en: 'Jordan' },
  { value: 'KUWAIT', ar: '\u0627\u0644\u0643\u0648\u064a\u062a', en: 'Kuwait' },
  { value: 'BAHRAIN', ar: '\u0627\u0644\u0628\u062d\u0631\u064a\u0646', en: 'Bahrain' },
  { value: 'OMAN', ar: '\u0639\u0645\u0627\u0646', en: 'Oman' },
  { value: 'QATAR', ar: '\u0642\u0637\u0631', en: 'Qatar' },
  { value: 'LEBANON', ar: '\u0644\u0628\u0646\u0627\u0646', en: 'Lebanon' },
  { value: 'IRAQ', ar: '\u0627\u0644\u0639\u0631\u0627\u0642', en: 'Iraq' },
  { value: 'MOROCCO', ar: '\u0627\u0644\u0645\u063a\u0631\u0628', en: 'Morocco' },
  { value: 'ALGERIA', ar: '\u0627\u0644\u062c\u0632\u0627\u0626\u0631', en: 'Algeria' },
  { value: 'TUNISIA', ar: '\u062a\u0648\u0646\u0633', en: 'Tunisia' },
  { value: 'YEMEN', ar: '\u0627\u0644\u064a\u0645\u0646', en: 'Yemen' },
  { value: 'SUDAN', ar: '\u0627\u0644\u0633\u0648\u062f\u0627\u0646', en: 'Sudan' },
  { value: 'LIBYA', ar: '\u0644\u064a\u0628\u064a\u0627', en: 'Libya' },
  { value: 'SYRIA', ar: '\u0633\u0648\u0631\u064a\u0627', en: 'Syria' },
  { value: 'PALESTINE', ar: '\u0641\u0644\u0633\u0637\u064a\u0646', en: 'Palestine' },
  { value: 'SOMALIA', ar: '\u0627\u0644\u0635\u0648\u0645\u0627\u0644', en: 'Somalia' },
  { value: 'MAURITANIA', ar: '\u0645\u0648\u0631\u064a\u062a\u0627\u0646\u064a\u0627', en: 'Mauritania' },
] as const;

export const INDUSTRIES = [
  'IT', 'FINANCE', 'MEDICINE', 'ENGINEERING',
  'EDUCATION', 'MARKETING', 'SALES', 'HR',
] as const;

export const EXPERIENCES = [
  'JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE',
] as const;
