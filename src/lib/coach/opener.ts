import type { PrepSelections } from './types';

const ROLE_LABELS: Record<string, { en: string; ar: string }> = {
  'software-engineer': { en: 'software engineer', ar: 'مهندس برمجيات' },
  'product-manager': { en: 'product manager', ar: 'مدير منتج' },
  'data-analyst': { en: 'data analyst', ar: 'محلل بيانات' },
  'marketing-manager': { en: 'marketing manager', ar: 'مدير تسويق' },
  'sales-executive': { en: 'sales executive', ar: 'تنفيذي مبيعات' },
  'hr-specialist': { en: 'HR specialist', ar: 'أخصائي موارد بشرية' },
  'finance-analyst': { en: 'finance analyst', ar: 'محلل مالي' },
  accountant: { en: 'accountant', ar: 'محاسب' },
  'operations-manager': { en: 'operations manager', ar: 'مدير عمليات' },
  'customer-success': { en: 'customer success', ar: 'نجاح العملاء' },
  'project-manager': { en: 'project manager', ar: 'مدير مشاريع' },
  'business-development': { en: 'business development', ar: 'تطوير الأعمال' },
  'ux-designer': { en: 'UX designer', ar: 'مصمم تجربة مستخدم' },
  'graphic-designer': { en: 'graphic designer', ar: 'مصمم جرافيك' },
  'content-writer': { en: 'content writer', ar: 'كاتب محتوى' },
  'digital-marketing': { en: 'digital marketing', ar: 'تسويق رقمي' },
  nurse: { en: 'nurse', ar: 'ممرض/ة' },
  pharmacist: { en: 'pharmacist', ar: 'صيدلي' },
  doctor: { en: 'doctor', ar: 'طبيب' },
  teacher: { en: 'teacher', ar: 'معلم' },
  'university-professor': { en: 'university professor', ar: 'أستاذ جامعي' },
  'civil-engineer': { en: 'civil engineer', ar: 'مهندس مدني' },
  'mechanical-engineer': { en: 'mechanical engineer', ar: 'مهندس ميكانيكي' },
  'electrical-engineer': { en: 'electrical engineer', ar: 'مهندس كهربائي' },
  'supply-chain': { en: 'supply chain', ar: 'سلسلة إمداد' },
};

const INDUSTRY_LABELS: Record<string, { en: string; ar: string }> = {
  'tech-saas': { en: 'tech / SaaS', ar: 'التقنية / SaaS' },
  technology: { en: 'technology', ar: 'التقنية' },
  healthcare: { en: 'healthcare', ar: 'الرعاية الصحية' },
  'finance-banking': { en: 'finance / banking', ar: 'المالية / البنوك' },
  'retail-ecommerce': { en: 'retail / e-commerce', ar: 'التجزئة / التجارة الإلكترونية' },
  manufacturing: { en: 'manufacturing', ar: 'التصنيع' },
  education: { en: 'education', ar: 'التعليم' },
  government: { en: 'government', ar: 'الحكومة' },
  consulting: { en: 'consulting', ar: 'الاستشارات' },
  logistics: { en: 'logistics', ar: 'اللوجستيات' },
  construction: { en: 'construction', ar: 'الإنشاءات' },
  media: { en: 'media', ar: 'الإعلام' },
  energy: { en: 'energy', ar: 'الطاقة' },
  other: { en: 'this sector', ar: 'هذا القطاع' },
};

const SENIORITY_LABELS: Record<string, { en: string; ar: string }> = {
  entry: { en: 'entry-level', ar: 'مستوى مبتدئ' },
  mid: { en: 'mid-level', ar: 'مستوى متوسط' },
  senior: { en: 'senior', ar: 'مستوى كبير' },
  manager: { en: 'manager-level', ar: 'مستوى إداري' },
  executive: { en: 'executive', ar: 'مستوى تنفيذي' },
};

const FIRST_QUESTION_EN: Record<string, string> = {
  'software-engineer':
    'First question: tell me about a recent project you owned end to end — what was the goal, what did you do, and what changed because of it?',
  'product-manager':
    'First question: walk me through a product you shipped recently. What problem were you solving, and how did you know it worked?',
  'data-analyst':
    'First question: describe an analysis you ran that changed a decision. What was the question, what did the data show, and what happened next?',
  default:
    'First question: tell me about a recent piece of work you are proud of — the situation, what you did, and the result.',
};

const FIRST_QUESTION_AR: Record<string, string> = {
  'software-engineer':
    'السؤال الأول: حدّثني عن مشروع أدرته من البداية للنهاية — ما الهدف، ماذا فعلت، وما الذي تغيّر بسببه؟',
  'product-manager':
    'السؤال الأول: اشرح منتجاً أطلقته مؤخراً. ما المشكلة التي كنت تحلها، وكيف عرفت أنه نجح؟',
  'data-analyst':
    'السؤال الأول: صف تحليلاً غيّر قراراً. ما السؤال، ماذا أظهرت البيانات، وماذا حدث بعد ذلك؟',
  default:
    'السؤال الأول: حدّثني عن عمل أخير تفتخر به — الموقف، ماذا فعلت، والنتيجة.',
};

function humanizeId(id: string): string {
  return id.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}

function pickLabel(
  map: Record<string, { en: string; ar: string }>,
  id: string,
  ar: boolean,
): string {
  const hit = map[id];
  if (hit) return ar ? hit.ar : hit.en;
  return humanizeId(id);
}

export function resolveOpenerCoachName(
  coachGender: PrepSelections['coachGender'],
  language: PrepSelections['language'],
): string {
  const ar = language === 'ar' || language === 'mixed';
  if (coachGender === 'male') return ar ? 'جين' : 'Jean';
  return ar ? 'جيني' : 'Jeannie';
}

export function getCachedCoachOpener(prep: PrepSelections): string {
  const ar = prep.language === 'ar' || prep.language === 'mixed';
  const name = resolveOpenerCoachName(prep.coachGender, prep.language);
  const role =
    prep.roleTitle?.trim() || pickLabel(ROLE_LABELS, prep.role, ar);
  const industry = pickLabel(INDUSTRY_LABELS, prep.industry, ar);
  const seniority = pickLabel(SENIORITY_LABELS, prep.seniority, ar);
  const question =
    (ar ? FIRST_QUESTION_AR[prep.role] : FIRST_QUESTION_EN[prep.role]) ||
    (ar ? FIRST_QUESTION_AR.default : FIRST_QUESTION_EN.default);

  if (ar) {
    return `مرحباً — أنا ${name}، مدرب المقابلات. سنتمرّن على مقابلة ${seniority} لدور ${role} في ${industry}. سأطرح سؤالاً واحداً في كل مرة؛ أجب بكلماتك. هل أنت مستعد؟ ${question}`;
  }

  return `Hi — I'm ${name}, your interview coach. We'll work through a ${seniority} ${role} interview in ${industry}. I'll ask one question at a time; answer in your own words. Ready? ${question}`;
}

export function needsCachedOpener(
  history: { role: string }[] | undefined,
  userMessage?: string,
): boolean {
  if (userMessage?.trim()) return false;
  if (!history || history.length === 0) return true;
  return !history.some((m) => m.role === 'assistant');
}
