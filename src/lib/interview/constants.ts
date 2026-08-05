export const ROLE_OPTIONS = [
  { value: 'software_engineer', en: 'Software Engineer / Developer', ar: 'مهندس برمجيات / مطوّر' },
  { value: 'data_analyst', en: 'Data Analyst / Data Scientist', ar: 'محلل بيانات / عالم بيانات' },
  { value: 'product_manager', en: 'Product Manager', ar: 'مدير منتج' },
  { value: 'marketing_manager', en: 'Marketing Manager / Digital Marketer', ar: 'مدير تسويق / مسوّق رقمي' },
  { value: 'sales', en: 'Sales Representative / Account Manager', ar: 'مندوب مبيعات / مدير حسابات' },
  { value: 'hr', en: 'HR / Talent Acquisition', ar: 'موارد بشرية / استقطاب مواهب' },
  { value: 'finance', en: 'Finance / Accounting', ar: 'مالية / محاسبة' },
  { value: 'operations', en: 'Operations Manager', ar: 'مدير عمليات' },
  { value: 'design', en: 'UX / UI Designer', ar: 'مصمم تجربة / واجهة مستخدم' },
  { value: 'healthcare', en: 'Healthcare Professional', ar: 'أخصائي رعاية صحية' },
  { value: 'legal', en: 'Legal / Compliance', ar: 'قانوني / امتثال' },
  { value: 'consulting', en: 'Management Consultant', ar: 'مستشار إداري' },
  { value: 'general', en: 'General / Other', ar: 'عام / أخرى' },
] as const;

export const SENIORITY_OPTIONS = [
  { value: 'entry', en: 'Entry Level', ar: 'مستوى مبتدئ', hintEn: '0-2 years', hintAr: '٠–٢ سنوات' },
  { value: 'mid', en: 'Mid Level', ar: 'مستوى متوسط', hintEn: '3-5 years', hintAr: '٣–٥ سنوات' },
  { value: 'senior', en: 'Senior Level', ar: 'مستوى كبير', hintEn: '6-10 years', hintAr: '٦–١٠ سنوات' },
  { value: 'executive', en: 'Executive / Leadership', ar: 'تنفيذي / قيادي', hintEn: '10+ years or managing teams', hintAr: '١٠+ سنوات أو إدارة فرق' },
] as const;

export const QUESTION_TYPE_OPTIONS = [
  { value: 'behavioral', en: 'Behavioral', ar: 'سلوكي' },
  { value: 'technical', en: 'Technical', ar: 'تقني' },
  { value: 'situational', en: 'Situational', ar: 'موقفي' },
  { value: 'cultural_fit', en: 'Cultural Fit', ar: 'ملاءمة ثقافية' },
  { value: 'case_study', en: 'Case Study', ar: 'دراسة حالة' },
  { value: 'salary', en: 'Salary Negotiation', ar: 'تفاوض على الراتب' },
] as const;

export const ROUND_OPTIONS = [
  { value: 'phone_screen', en: 'Phone / Video Screen', ar: 'فرز هاتفي / عبر الفيديو' },
  { value: 'technical', en: 'Technical Round', ar: 'جولة تقنية' },
  { value: 'behavioral', en: 'Behavioral Round', ar: 'جولة سلوكية' },
  { value: 'final', en: 'Final / Culture Round', ar: 'جولة نهائية / ثقافية' },
  { value: 'full_mock', en: 'Full Mock Interview', ar: 'مقابلة تجريبية كاملة' },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'english', en: 'English', ar: 'الإنجليزية' },
  { value: 'arabic', en: 'Arabic', ar: 'العربية' },
  { value: 'bilingual', en: 'Bilingual (mix of both)', ar: 'ثنائي اللغة (مزيج)' },
] as const;

export const INDUSTRY_OPTIONS = [
  { value: 'tech', en: 'Technology', ar: 'تقنية' },
  { value: 'finance', en: 'Finance', ar: 'مالية' },
  { value: 'healthcare', en: 'Healthcare', ar: 'رعاية صحية' },
  { value: 'retail', en: 'Retail', ar: 'تجزئة' },
  { value: 'energy', en: 'Energy', ar: 'طاقة' },
  { value: 'government', en: 'Government', ar: 'حكومة' },
  { value: 'education', en: 'Education', ar: 'تعليم' },
  { value: 'consulting', en: 'Consulting', ar: 'استشارات' },
  { value: 'manufacturing', en: 'Manufacturing', ar: 'تصنيع' },
  { value: 'media', en: 'Media', ar: 'إعلام' },
  { value: 'real_estate', en: 'Real Estate', ar: 'عقارات' },
  { value: 'hospitality', en: 'Hospitality', ar: 'ضيافة' },
] as const;

export const WEAKNESS_OPTIONS = [
  { value: 'nervous', en: 'Getting nervous', ar: 'التوتر أثناء المقابلة' },
  { value: 'structure', en: 'Structuring answers', ar: 'تنظيم الإجابات' },
  { value: 'unexpected', en: 'Unexpected questions', ar: 'الأسئلة غير المتوقعة' },
  { value: 'technical_weak', en: 'Technical depth', ar: 'العمق التقني' },
  { value: 'salary_neg', en: 'Salary negotiation', ar: 'التفاوض على الراتب' },
  { value: 'language_conf', en: 'Language confidence', ar: 'الثقة باللغة' },
  { value: 'no_experience', en: 'Limited experience', ar: 'خبرة محدودة' },
  { value: 'tell_me_about', en: '“Tell me about yourself”', ar: 'سؤال «حدّثني عن نفسك»' },
  { value: 'other', en: 'Other', ar: 'أخرى' },
] as const;

export const DURATION_OPTIONS = [
  { value: 'quick', en: 'Quick', ar: 'سريعة', numQuestions: 5, estimatedDurationMin: 10 },
  { value: 'standard', en: 'Standard', ar: 'قياسية', numQuestions: 8, estimatedDurationMin: 20 },
  { value: 'deep', en: 'Deep Dive', ar: 'معمّقة', numQuestions: 12, estimatedDurationMin: 35 },
  { value: 'full', en: 'Full', ar: 'كاملة', numQuestions: 15, estimatedDurationMin: 50 },
] as const;

export const FOCUS_MAP: Record<string, string> = {
  behavioral: 'leadership & teamwork',
  technical: 'role-specific expertise',
  situational: 'problem-solving under pressure',
  cultural_fit: 'values alignment',
  case_study: 'strategic thinking',
  salary: 'negotiation skills',
};

export const WEAKNESS_TIPS: Record<string, string[]> = {
  nervous: ['Take a deep breath before answering', 'Use STAR format', 'It is okay to pause'],
  structure: ['Use STAR: Situation, Task, Action, Result', 'Answer in 3 parts', 'Keep under 2 minutes'],
  unexpected: ['No trick questions — be honest', 'Say how you would find out', 'Practice common 20'],
  technical_weak: ['Break into steps', 'Think out loud', 'Ask for clarification'],
  salary_neg: ['Research market rates', 'Give a range not a number', 'Focus on total comp'],
  language_conf: ['Speak slowly', 'Use simple sentences', 'Practice beforehand'],
  no_experience: ['Use academic projects', 'Focus on transferable skills', 'Show willingness'],
  tell_me_about: ['Structure: present → past → future', 'Connect to this role', 'Keep under 90 seconds'],
  other: ['Be specific with examples', 'Stay concise', 'Connect answers to the role'],
};

export function labelFor(
  options: readonly { value: string; en: string; ar: string }[],
  value: string | null | undefined,
  lang: 'en' | 'ar' = 'en',
): string {
  if (!value) return '';
  const hit = options.find((o) => o.value === value);
  if (!hit) return value;
  return lang === 'ar' ? hit.ar : hit.en;
}
