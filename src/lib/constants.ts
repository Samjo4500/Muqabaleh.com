// ─── Muqabaleh Shared Constants ───

/**
 * 20 MENA countries.
 * Used across profile, B2B onboarding, and B2B settings.
 */
export interface Country {
  code: string;
  name_en: string;
  name_ar: string;
  dialect_code: string;
  flag_emoji: string;
  is_gulf: boolean;
}

export const MENA_COUNTRIES: Country[] = [
  { code: 'SA', name_en: 'Saudi Arabia', name_ar: 'المملكة العربية السعودية', dialect_code: 'ar-SA', flag_emoji: '🇸🇦', is_gulf: true },
  { code: 'AE', name_en: 'UAE', name_ar: 'الإمارات العربية المتحدة', dialect_code: 'ar-AE', flag_emoji: '🇦🇪', is_gulf: true },
  { code: 'QA', name_en: 'Qatar', name_ar: 'قطر', dialect_code: 'ar-QA', flag_emoji: '🇶🇦', is_gulf: true },
  { code: 'BH', name_en: 'Bahrain', name_ar: 'البحرين', dialect_code: 'ar-BH', flag_emoji: '🇧🇭', is_gulf: true },
  { code: 'KW', name_en: 'Kuwait', name_ar: 'الكويت', dialect_code: 'ar-KW', flag_emoji: '🇰🇼', is_gulf: true },
  { code: 'OM', name_en: 'Oman', name_ar: 'عمان', dialect_code: 'ar-OM', flag_emoji: '🇴🇲', is_gulf: true },
  { code: 'JO', name_en: 'Jordan', name_ar: 'الأردن', dialect_code: 'ar-JO', flag_emoji: '🇯🇴', is_gulf: false },
  { code: 'EG', name_en: 'Egypt', name_ar: 'مصر', dialect_code: 'ar-EG', flag_emoji: '🇪🇬', is_gulf: false },
  { code: 'DZ', name_en: 'Algeria', name_ar: 'الجزائر', dialect_code: 'ar-DZ', flag_emoji: '🇩🇿', is_gulf: false },
  { code: 'DJ', name_en: 'Djibouti', name_ar: 'جيبوتي', dialect_code: 'ar-DJ', flag_emoji: '🇩🇯', is_gulf: false },
  { code: 'IR', name_en: 'Iran', name_ar: 'إيران', dialect_code: 'fa-IR', flag_emoji: '🇮🇷', is_gulf: false },
  { code: 'IQ', name_en: 'Iraq', name_ar: 'العراق', dialect_code: 'ar-IQ', flag_emoji: '🇮🇶', is_gulf: false },
  { code: 'LB', name_en: 'Lebanon', name_ar: 'لبنان', dialect_code: 'ar-LB', flag_emoji: '🇱🇧', is_gulf: false },
  { code: 'LY', name_en: 'Libya', name_ar: 'ليبيا', dialect_code: 'ar-LY', flag_emoji: '🇱🇾', is_gulf: false },
  { code: 'MR', name_en: 'Mauritania', name_ar: 'موريتانيا', dialect_code: 'ar-MR', flag_emoji: '🇲🇷', is_gulf: false },
  { code: 'MA', name_en: 'Morocco', name_ar: 'المغرب', dialect_code: 'ar-MA', flag_emoji: '🇲🇦', is_gulf: false },
  { code: 'PS', name_en: 'Palestine', name_ar: 'فلسطين', dialect_code: 'ar-PS', flag_emoji: '🇵🇸', is_gulf: false },
  { code: 'SY', name_en: 'Syria', name_ar: 'سوريا', dialect_code: 'ar-SY', flag_emoji: '🇸🇾', is_gulf: false },
  { code: 'TN', name_en: 'Tunisia', name_ar: 'تونس', dialect_code: 'ar-TN', flag_emoji: '🇹🇳', is_gulf: false },
  { code: 'YE', name_en: 'Yemen', name_ar: 'اليمن', dialect_code: 'ar-YE', flag_emoji: '🇾🇪', is_gulf: false },
];

export const INDUSTRIES = [
  'IT', 'FINANCE', 'MEDICINE', 'ENGINEERING',
  'EDUCATION', 'MARKETING', 'SALES', 'HR',
] as const;

export const EXPERIENCES = [
  'JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE',
] as const;
