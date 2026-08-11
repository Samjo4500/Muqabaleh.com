import type { ConsolePipelineStage, InterviewQuestion } from './types';

export const DEFAULT_PIPELINE_STAGES: Omit<
  ConsolePipelineStage,
  'id' | 'organizationId'
>[] = [
  {
    key: 'NEW',
    labelEn: 'New',
    labelAr: 'جديد',
    sortOrder: 0,
    isTerminal: false,
    color: '#38BDF8',
  },
  {
    key: 'REVIEWED',
    labelEn: 'Reviewed',
    labelAr: 'تمت المراجعة',
    sortOrder: 1,
    isTerminal: false,
    color: '#A78BFA',
  },
  {
    key: 'SHORTLISTED',
    labelEn: 'Shortlisted',
    labelAr: 'قائمة مختصرة',
    sortOrder: 2,
    isTerminal: false,
    color: '#FBBF24',
  },
  {
    key: 'INTERVIEWED',
    labelEn: 'Interviewed',
    labelAr: 'تمت المقابلة',
    sortOrder: 3,
    isTerminal: false,
    color: '#14B8A6',
  },
  {
    key: 'HIRED',
    labelEn: 'Hired',
    labelAr: 'تم التوظيف',
    sortOrder: 4,
    isTerminal: true,
    color: '#22C55E',
  },
  {
    key: 'REJECTED',
    labelEn: 'Rejected',
    labelAr: 'مرفوض',
    sortOrder: 5,
    isTerminal: true,
    color: '#EF4444',
  },
];

/** 25-role bank for Job Creator */
export const ROLE_BANK: { key: string; en: string; ar: string }[] = [
  { key: 'software_engineer', en: 'Software Engineer', ar: 'مهندس برمجيات' },
  { key: 'frontend_engineer', en: 'Frontend Engineer', ar: 'مهندس واجهات' },
  { key: 'backend_engineer', en: 'Backend Engineer', ar: 'مهندس خلفية' },
  { key: 'fullstack_engineer', en: 'Full-Stack Engineer', ar: 'مهندس متكامل' },
  { key: 'data_scientist', en: 'Data Scientist', ar: 'عالم بيانات' },
  { key: 'data_analyst', en: 'Data Analyst', ar: 'محلل بيانات' },
  { key: 'product_manager', en: 'Product Manager', ar: 'مدير منتج' },
  { key: 'project_manager', en: 'Project Manager', ar: 'مدير مشاريع' },
  { key: 'ux_designer', en: 'UX Designer', ar: 'مصمم تجربة مستخدم' },
  { key: 'ui_designer', en: 'UI Designer', ar: 'مصمم واجهات' },
  { key: 'marketing_manager', en: 'Marketing Manager', ar: 'مدير تسويق' },
  { key: 'sales_executive', en: 'Sales Executive', ar: 'مسؤول مبيعات' },
  { key: 'account_manager', en: 'Account Manager', ar: 'مدير حسابات' },
  { key: 'hr_business_partner', en: 'HR Business Partner', ar: 'شريك موارد بشرية' },
  { key: 'talent_acquisition', en: 'Talent Acquisition', ar: 'استقطاب مواهب' },
  { key: 'finance_analyst', en: 'Finance Analyst', ar: 'محلل مالي' },
  { key: 'operations_manager', en: 'Operations Manager', ar: 'مدير عمليات' },
  { key: 'customer_success', en: 'Customer Success', ar: 'نجاح العملاء' },
  { key: 'devops_engineer', en: 'DevOps Engineer', ar: 'مهندس DevOps' },
  { key: 'qa_engineer', en: 'QA Engineer', ar: 'مهندس جودة' },
  { key: 'cybersecurity', en: 'Cybersecurity Analyst', ar: 'محلل أمن سيبراني' },
  { key: 'legal_counsel', en: 'Legal Counsel', ar: 'مستشار قانوني' },
  { key: 'content_writer', en: 'Content Writer', ar: 'كاتب محتوى' },
  { key: 'business_analyst', en: 'Business Analyst', ar: 'محلل أعمال' },
  { key: 'executive_assistant', en: 'Executive Assistant', ar: 'مساعد تنفيذي' },
];

export function defaultQuestionsForRole(roleKey: string): InterviewQuestion[] {
  const role = ROLE_BANK.find((r) => r.key === roleKey);
  const label = role?.en || 'this role';
  const labelAr = role?.ar || 'هذا الدور';
  return [
    {
      id: 'q1',
      text: `Walk me through a recent project relevant to ${label}.`,
      textAr: `أخبرني عن مشروع حديث متعلق بـ${labelAr}.`,
    },
    {
      id: 'q2',
      text: `What is the hardest problem you solved in ${label}?`,
      textAr: `ما أصعب مشكلة حللتها في ${labelAr}؟`,
    },
    {
      id: 'q3',
      text: 'Tell me about a time you disagreed with a stakeholder.',
      textAr: 'أخبرني عن موقف اختلفت فيه مع أحد أصحاب المصلحة.',
    },
    {
      id: 'q4',
      text: 'How do you prioritize when everything is urgent?',
      textAr: 'كيف ترتّب الأولويات عندما يكون كل شيء عاجلاً؟',
    },
  ];
}

export function scoreToGrade(score: number): 'A' | 'B+' | 'B' | 'C' | 'D' {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B+';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  return 'D';
}

export function scoreColor(score: number): string {
  if (score < 50) return '#EF4444';
  if (score < 70) return '#F59E0B';
  return '#22C55E';
}
