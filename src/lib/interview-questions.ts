export type Role = 'SALES_MANAGER' | 'SOFTWARE_ENGINEER' | 'MARKETING_SPECIALIST' | 'HR_MANAGER' | 'ACCOUNTANT' | 'CUSTOMER_SERVICE' | 'PROJECT_MANAGER' | 'DATA_ANALYST' | 'OPERATIONS_MANAGER' | 'GRAPHIC_DESIGNER';

export type Level = 'ENTRY' | 'MID' | 'SENIOR';

export type Category = 'INTRO' | 'FAILURE' | 'INDUSTRY' | 'TEAM' | 'CULTURE' | 'TECHNICAL' | 'PRESSURE' | 'LEADERSHIP' | 'TREND' | 'CLOSING';

export interface Question {
  id: string;
  role: Role;
  level: Level;
  industry?: string;
  questionNumber: number;
  textAr: string;
  textEn: string;
  category: Category;
}

function q(id: string, role: Role, level: Level, num: number, cat: Category, ar: string, en: string, industry?: string): Question {
  return { id, role, level, industry, questionNumber: num, textAr: ar, textEn: en, category: cat };
}

// ═══════════════════════════════════════════════════════════════════
// GREETING
// ═══════════════════════════════════════════════════════════════════

export const GREETING = {
  ar: 'أهلاً وسهلاً. اسمي فهد، أنا مدير الموارد البشرية هنا. إن شاء الله اليوم ناخذ مقابلة خفيفة ونرتاح. ما راح أطول عليك — عشر أسئلة. جاهز؟',
  en: 'Welcome. I\'m Fahd, the HR manager here. We\'ll keep this light — ten questions. Ready?',
};

// ═══════════════════════════════════════════════════════════════════
// ALL QUESTIONS — organized by role
// ═══════════════════════════════════════════════════════════════════

const questions: Question[] = [

  // ───────────────────────────────────────────────────────────────
  // ROLE 1: SALES_MANAGER (SM)
  // ───────────────────────────────────────────────────────────────

  // SM Q1 INTRO
  q('SM-E-1', 'SALES_MANAGER', 'ENTRY', 1, 'INTRO',
    'عرفني عن نفسك. وش اللي يخلينا نختارك عن غيرك؟',
    "Tell me about yourself. What makes you different from other candidates?"),
  q('SM-M-1', 'SALES_MANAGER', 'MID', 1, 'INTRO',
    'عرفني عن نفسك بـ ٦٠ ثانية. وش أكبر صفقة قفلتها؟',
    "Tell me about yourself in 60 seconds. What's the biggest deal you've closed?"),
  q('SM-S-1', 'SALES_MANAGER', 'SENIOR', 1, 'INTRO',
    'عرفني عن نفسك. وش استراتيجيتك لزيادة المبيعات ٣٠٪ في ربع؟',
    "Tell me about yourself. What's your strategy to increase sales by 30% in a quarter?"),

  // SM Q2 FAILURE
  q('SM-E-2', 'SALES_MANAGER', 'ENTRY', 2, 'FAILURE',
    'وش أكبر غلطة سويتها مع عميل؟',
    "What's the biggest mistake you've made with a client?"),
  q('SM-M-2', 'SALES_MANAGER', 'MID', 2, 'FAILURE',
    'قلتلي عن صفقة خسرتها. وش تغيّر في طريقتك بعدها؟',
    "Tell me about a deal you lost. What changed in your approach after that?"),
  q('SM-S-2', 'SALES_MANAGER', 'SENIOR', 2, 'FAILURE',
    'صفقة كبيرة خسرتها للمنافس. وش السبب الجذري؟',
    "A major deal you lost to a competitor. What was the root cause?"),

  // SM Q3 INDUSTRY
  q('SM-TECH-3', 'SALES_MANAGER', 'ENTRY', 3, 'INDUSTRY',
    'عميل تقني يقول \'المنتج غالي\'. وش ترد؟',
    "A tech client says 'Your product is too expensive'. What do you say?",
    'TECH'),
  q('SM-RETAIL-3', 'SALES_MANAGER', 'ENTRY', 3, 'INDUSTRY',
    'عميل يقارنك بسعر أقل من المنافس. كيف تقنعه؟',
    "A client compares you to a competitor's lower price. How do you convince them?",
    'RETAIL'),
  q('SM-HEALTHCARE-3', 'SALES_MANAGER', 'ENTRY', 3, 'INDUSTRY',
    'مستشفى يرفض العقد بسبب الميزانية. وش تسوي؟',
    'A hospital rejects the contract due to budget. What do you do?',
    'HEALTHCARE'),

  // SM Q4 TEAM
  q('SM-E-4', 'SALES_MANAGER', 'ENTRY', 4, 'TEAM',
    'زميلك ياخذ عميلك. كيف تتصرف؟',
    'Your colleague takes your client. How do you react?'),
  q('SM-M-4', 'SALES_MANAGER', 'MID', 4, 'TEAM',
    'فريقك يتفكك بسبب خلاف على عميل كبير. وش الحل؟',
    'Your team is falling apart over a major client dispute. What\'s the solution?'),
  q('SM-S-4', 'SALES_MANAGER', 'SENIOR', 4, 'TEAM',
    'مديرك يطلب تخفيض سعر ٥٠٪ لعميل استراتيجي. تسويها ولا تقاوم؟',
    "Your boss asks for a 50% price cut for a strategic client. Do you comply or push back?"),

  // SM Q5 CULTURE
  q('SM-E-5', 'SALES_MANAGER', 'ENTRY', 5, 'CULTURE',
    'عميل خليجي يطلب خصم \'عشان خاطري\'. وش ترد؟',
    'A Gulf client asks for a discount "just for me". How do you respond?'),
  q('SM-M-5', 'SALES_MANAGER', 'MID', 5, 'CULTURE',
    'عميل سعودي يقول \'إن شاء الله\' وما يردّ. كيف تتابع؟',
    'A Saudi client says "inshallah" and doesn\'t commit. How do you follow up?'),
  q('SM-S-5', 'SALES_MANAGER', 'SENIOR', 5, 'CULTURE',
    'عميل كبير يطلب \'هدايا\' مقابل العقد. وش موقفك؟',
    'A major client asks for "gifts" in exchange for a contract. What\'s your stance?'),

  // SM Q6 INDUSTRY
  q('SM-TECH-6', 'SALES_MANAGER', 'ENTRY', 6, 'INDUSTRY',
    'وش الفرق بين SaaS و On-premise في المبيعات؟',
    "What's the difference between SaaS and On-premise in sales?",
    'TECH'),
  q('SM-RETAIL-6', 'SALES_MANAGER', 'ENTRY', 6, 'INDUSTRY',
    'كيف تقيس نجاح حملة ترويجية؟',
    'How do you measure the success of a promotional campaign?',
    'RETAIL'),
  q('SM-HEALTHCARE-6', 'SALES_MANAGER', 'ENTRY', 6, 'INDUSTRY',
    'وش دور CRM في مبيعات القطاع الصحي؟',
    "What's the role of CRM in healthcare sales?",
    'HEALTHCARE'),

  // SM Q7 PRESSURE
  q('SM-E-7', 'SALES_MANAGER', 'ENTRY', 7, 'PRESSURE',
    'مديرك يطلب تقرير في ٢ ساعة. وش تسوي؟',
    'Your boss asks for a report in 2 hours. What do you do?'),
  q('SM-M-7', 'SALES_MANAGER', 'MID', 7, 'PRESSURE',
    'ربع مالي ينتهي وتحتاج ٢٠٪ زيادة. وش خطتك؟',
    'A fiscal quarter is ending and you need 20% more. What\'s your plan?'),
  q('SM-S-7', 'SALES_MANAGER', 'SENIOR', 7, 'PRESSURE',
    'الشركة تخسر عميل استراتيجي. تعطيني خطة إنقاذ في ٢٤ ساعة.',
    'The company is losing a strategic client. Give me a rescue plan in 24 hours.'),

  // SM Q8 LEADERSHIP
  q('SM-E-8', 'SALES_MANAGER', 'ENTRY', 8, 'LEADERSHIP',
    'زميل جديد يبغى مساعدة. تساعده ولا تركز على هدفك؟',
    'A new colleague needs help. Do you help them or focus on your target?'),
  q('SM-M-8', 'SALES_MANAGER', 'MID', 8, 'LEADERSHIP',
    'فريقك يفشل في تحقيق الهدف. وش تسوي؟',
    'Your team is failing to meet targets. What do you do?'),
  q('SM-S-8', 'SALES_MANAGER', 'SENIOR', 8, 'LEADERSHIP',
    '٣ من فريقك يبغون يستقيلون معاً. وش تسوي؟',
    '3 of your team members want to resign together. What do you do?'),

  // SM Q9 TREND
  q('SM-TECH-9', 'SALES_MANAGER', 'ENTRY', 9, 'TREND',
    'AI يهدد وظائف المبيعات. وش رأيك؟',
    'AI threatens sales jobs. What\'s your take?',
    'TECH'),
  q('SM-RETAIL-9', 'SALES_MANAGER', 'ENTRY', 9, 'TREND',
    'التجارة الإلكترونية تقتل المحلات. كيف تتكيف؟',
    'E-commerce is killing physical stores. How do you adapt?',
    'RETAIL'),
  q('SM-HEALTHCARE-9', 'SALES_MANAGER', 'ENTRY', 9, 'TREND',
    'التأمين الصحي يتغير. كيف تسوّق منتج جديد؟',
    'Health insurance is changing. How do you market a new product?',
    'HEALTHCARE'),

  // SM Q10 CLOSING
  q('SM-E-10', 'SALES_MANAGER', 'ENTRY', 10, 'CLOSING',
    'وش تبي تتعلمه في السنة الجاية؟',
    'What do you want to learn this coming year?'),
  q('SM-M-10', 'SALES_MANAGER', 'MID', 10, 'CLOSING',
    'وين تشوف نفسك بعد ٣ سنوات؟',
    'Where do you see yourself in 3 years?'),
  q('SM-S-10', 'SALES_MANAGER', 'SENIOR', 10, 'CLOSING',
    'إذا أعطيتك مليون ريال ميزانية مبيعات. وش أول شي تسويه؟',
    'If I gave you a million riyal sales budget. What\'s the first thing you\'d do?'),

  // ───────────────────────────────────────────────────────────────
  // ROLE 2: SOFTWARE_ENGINEER (SE)
  // ───────────────────────────────────────────────────────────────

  // SE Q1 INTRO
  q('SE-E-1', 'SOFTWARE_ENGINEER', 'ENTRY', 1, 'INTRO',
    'عرفني عن نفسك. وش اللغة اللي تبرمج فيها؟',
    'Tell me about yourself. What programming language do you use?'),
  q('SE-M-1', 'SOFTWARE_ENGINEER', 'MID', 1, 'INTRO',
    'عرفني عن نفسك. وش آخر مشروع سويته؟',
    "Tell me about yourself. What's the last project you built?"),
  q('SE-S-1', 'SOFTWARE_ENGINEER', 'SENIOR', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر نظام بنيته؟',
    "Tell me about yourself. What's the largest system you've built?"),

  // SE Q2 FAILURE
  q('SE-E-2', 'SOFTWARE_ENGINEER', 'ENTRY', 2, 'FAILURE',
    'كود كسر النظام. وش تعلمت؟',
    'Code that broke the system. What did you learn?'),
  q('SE-M-2', 'SOFTWARE_ENGINEER', 'MID', 2, 'FAILURE',
    'مشروع تأخر بسببك. وش السبب؟',
    'A project was delayed because of you. What was the reason?'),
  q('SE-S-2', 'SOFTWARE_ENGINEER', 'SENIOR', 2, 'FAILURE',
    'قرار تقني غلط كلف الشركة. وش كان؟',
    'A wrong technical decision cost the company. What happened?'),

  // SE Q3 INDUSTRY
  q('SE-FINTECH-3', 'SOFTWARE_ENGINEER', 'ENTRY', 3, 'INDUSTRY',
    'كيف تحمي بيانات العملاء المالية؟',
    "How do you protect customers' financial data?",
    'FINTECH'),
  q('SE-ECOMMERCE-3', 'SOFTWARE_ENGINEER', 'ENTRY', 3, 'INDUSTRY',
    'وش تحديات الدفع الإلكتروني؟',
    'What are the challenges of electronic payments?',
    'E-COMMERCE'),
  q('SE-HEALTHTECH-3', 'SOFTWARE_ENGINEER', 'ENTRY', 3, 'INDUSTRY',
    'كيف تضمن خصوصية بيانات المرضى؟',
    'How do you ensure patient data privacy?',
    'HEALTHTECH'),

  // SE Q4 TEAM
  q('SE-E-4', 'SOFTWARE_ENGINEER', 'ENTRY', 4, 'TEAM',
    'زميلك يكتب كود غبي. كيف تقوله؟',
    'Your colleague writes bad code. How do you tell them?'),
  q('SE-M-4', 'SOFTWARE_ENGINEER', 'MID', 4, 'TEAM',
    'فريقك يتخانق على لغة البرمجة. وش تسوي؟',
    'Your team is arguing about programming languages. What do you do?'),
  q('SE-S-4', 'SOFTWARE_ENGINEER', 'SENIOR', 4, 'TEAM',
    '٢ فريق يبغون يدمجون أنظمة مختلفة. وش خطتك؟',
    '2 teams want to merge different systems. What\'s your plan?'),

  // SE Q5 CULTURE
  q('SE-E-5', 'SOFTWARE_ENGINEER', 'ENTRY', 5, 'CULTURE',
    'مديرك يطلب شي تقني مستحيل. وش ترد؟',
    'Your boss asks for something technically impossible. What do you say?'),
  q('SE-M-5', 'SOFTWARE_ENGINEER', 'MID', 5, 'CULTURE',
    'مدير غير تقني يفرض حل غلط. كيف تقنعه؟',
    'A non-technical manager imposes a wrong solution. How do you convince them?'),
  q('SE-S-5', 'SOFTWARE_ENGINEER', 'SENIOR', 5, 'CULTURE',
    'الشركة تبي تسرّح ٥٠٪ من المبرمجين. وش موقفك؟',
    'The company wants to lay off 50% of programmers. What\'s your stance?'),

  // SE Q6 TECHNICAL
  q('SE-E-6', 'SOFTWARE_ENGINEER', 'ENTRY', 6, 'TECHNICAL',
    'وش الفرق بين Array و Object؟',
    "What's the difference between Array and Object?"),
  q('SE-M-6', 'SOFTWARE_ENGINEER', 'MID', 6, 'TECHNICAL',
    'وش الفرق بين REST و GraphQL؟',
    "What's the difference between REST and GraphQL?"),
  q('SE-S-6', 'SOFTWARE_ENGINEER', 'SENIOR', 6, 'TECHNICAL',
    'وش الفرق بين Microservices و Monolith؟',
    "What's the difference between Microservices and Monolith?"),

  // SE Q7 PRESSURE
  q('SE-E-7', 'SOFTWARE_ENGINEER', 'ENTRY', 7, 'PRESSURE',
    'Bug في الإنتاج ومديرك يضغط. وش تسوي؟',
    'A bug in production and your boss is pressuring you. What do you do?'),
  q('SE-M-7', 'SOFTWARE_ENGINEER', 'MID', 7, 'PRESSURE',
    'مشروع ينزل بكرة وفي ١٠ bugs. وش الأولوية؟',
    'A project launches tomorrow and there are 10 bugs. What\'s the priority?'),
  q('SE-S-7', 'SOFTWARE_ENGINEER', 'SENIOR', 7, 'PRESSURE',
    'النظام ينهار الساعة ٢ بالليل. وش تسوي؟',
    'The system crashes at 2 AM. What do you do?'),

  // SE Q8 LEADERSHIP
  q('SE-E-8', 'SOFTWARE_ENGINEER', 'ENTRY', 8, 'LEADERSHIP',
    'زميل جديد يسألك كل ١٠ دقايق. وش تسوي؟',
    'A new colleague asks you every 10 minutes. What do you do?'),
  q('SE-M-8', 'SOFTWARE_ENGINEER', 'MID', 8, 'LEADERSHIP',
    'فريقك يتأخر بسبب شخص واحد بطيء. وش الحل؟',
    'Your team is delayed because of one slow person. What\'s the solution?'),
  q('SE-S-8', 'SOFTWARE_ENGINEER', 'SENIOR', 8, 'LEADERSHIP',
    '٥٠ مبرمج تحتك. كيف تضمن الجودة؟',
    'You have 50 programmers under you. How do you ensure quality?'),

  // SE Q9 TREND
  q('SE-FINTECH-9', 'SOFTWARE_ENGINEER', 'ENTRY', 9, 'TREND',
    'Blockchain — فرصة ولا فقاعة؟',
    'Blockchain — opportunity or bubble?',
    'FINTECH'),
  q('SE-ECOMMERCE-9', 'SOFTWARE_ENGINEER', 'ENTRY', 9, 'TREND',
    'Serverless — نعم ولا لا؟',
    'Serverless — yes or no?',
    'E-COMMERCE'),
  q('SE-HEALTHTECH-9', 'SOFTWARE_ENGINEER', 'ENTRY', 9, 'TREND',
    'AI تشخيص — أخلاقي ولا لا؟',
    'AI diagnosis — ethical or not?',
    'HEALTHTECH'),

  // SE Q10 CLOSING
  q('SE-E-10', 'SOFTWARE_ENGINEER', 'ENTRY', 10, 'CLOSING',
    'وش تبي تتعلمه السنة الجاية؟',
    'What do you want to learn this coming year?'),
  q('SE-M-10', 'SOFTWARE_ENGINEER', 'MID', 10, 'CLOSING',
    'وش أكبر تحدي تقني واجهته؟',
    "What's the biggest technical challenge you've faced?"),
  q('SE-S-10', 'SOFTWARE_ENGINEER', 'SENIOR', 10, 'CLOSING',
    'إذا بنيت نظام من الصفر اليوم. وش تختلف عن اللي قبل ٥ سنين؟',
    'If you built a system from scratch today. How would it differ from 5 years ago?'),

  // ───────────────────────────────────────────────────────────────
  // ROLE 3: MARKETING_SPECIALIST (MK)
  // ───────────────────────────────────────────────────────────────

  // MK Q1 INTRO
  q('MK-E-1', 'MARKETING_SPECIALIST', 'ENTRY', 1, 'INTRO',
    'عرفني عن نفسك. وش قناة التسويق اللي تحبها؟',
    "Tell me about yourself. What's your favorite marketing channel?"),
  q('MK-M-1', 'MARKETING_SPECIALIST', 'MID', 1, 'INTRO',
    'عرفني عن نفسك. وش آخر حملة سويتها؟',
    "Tell me about yourself. What's the last campaign you ran?"),
  q('MK-S-1', 'MARKETING_SPECIALIST', 'SENIOR', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر حملة قادتها؟',
    "Tell me about yourself. What's the biggest campaign you've led?"),

  // MK Q2 FAILURE
  q('MK-E-2', 'MARKETING_SPECIALIST', 'ENTRY', 2, 'FAILURE',
    'حملة فشلت. وش تعلمت؟',
    'A campaign failed. What did you learn?'),
  q('MK-M-2', 'MARKETING_SPECIALIST', 'MID', 2, 'FAILURE',
    'ميزانية ضاعت وما رجع ربح. وش السبب؟',
    'A budget was wasted with no ROI. What was the reason?'),
  q('MK-S-2', 'MARKETING_SPECIALIST', 'SENIOR', 2, 'FAILURE',
    'حملة كبيرة خسرت الشركة سمعتها. وش كان الخلل؟',
    "A major campaign damaged the company's reputation. What went wrong?"),

  // MK Q3 INDUSTRY
  q('MK-TECH-3', 'MARKETING_SPECIALIST', 'ENTRY', 3, 'INDUSTRY',
    'كيف تسوّق منتج تقني للعميل غير التقني؟',
    'How do you market a tech product to a non-technical customer?',
    'TECH'),
  q('MK-RETAIL-3', 'MARKETING_SPECIALIST', 'ENTRY', 3, 'INDUSTRY',
    'كيف تسوّق منتج بسعر أعلى من المنافس؟',
    'How do you market a product priced higher than competitors?',
    'RETAIL'),
  q('MK-HEALTHCARE-3', 'MARKETING_SPECIALIST', 'ENTRY', 3, 'INDUSTRY',
    'كيف تبني ثقة مع جمهور صحي محافظ؟',
    'How do you build trust with a conservative health audience?',
    'HEALTHCARE'),

  // MK Q4 TEAM
  q('MK-E-4', 'MARKETING_SPECIALIST', 'ENTRY', 4, 'TEAM',
    'المصمم يرفض فكرتك. وش تسوي؟',
    'The designer rejects your idea. What do you do?'),
  q('MK-M-4', 'MARKETING_SPECIALIST', 'MID', 4, 'TEAM',
    'المبيعات تقول الحملة ما تجيب عملاء. كيف ترد؟',
    "Sales says the campaign isn't bringing customers. How do you respond?"),
  q('MK-S-4', 'MARKETING_SPECIALIST', 'SENIOR', 4, 'TEAM',
    'المدير المالي يقطع ميزانيتك ٧٠٪. وش تسوي؟',
    'The CFO cuts your budget by 70%. What do you do?'),

  // MK Q5 CULTURE
  q('MK-E-5', 'MARKETING_SPECIALIST', 'ENTRY', 5, 'CULTURE',
    'عميل يبغى إعلان \'غربي\'. وش تسوي؟',
    'A client wants a "Western-style" ad. What do you do?'),
  q('MK-M-5', 'MARKETING_SPECIALIST', 'MID', 5, 'CULTURE',
    'مديرك يفرض فكرة تسويقية غلط. كيف تقنعه؟',
    'Your boss imposes a wrong marketing idea. How do you convince them?'),
  q('MK-S-5', 'MARKETING_SPECIALIST', 'SENIOR', 5, 'CULTURE',
    'الشركة تبي تسوّق شي ضد قيم المجتمع. وش موقفك؟',
    'The company wants to market something against community values. What\'s your stance?'),

  // MK Q6 TECHNICAL
  q('MK-E-6', 'MARKETING_SPECIALIST', 'ENTRY', 6, 'TECHNICAL',
    'وش الفرق بين SEO و SEM؟',
    "What's the difference between SEO and SEM?"),
  q('MK-M-6', 'MARKETING_SPECIALIST', 'MID', 6, 'TECHNICAL',
    'وش CAC و LTV؟',
    'What are CAC and LTV?'),
  q('MK-S-6', 'MARKETING_SPECIALIST', 'SENIOR', 6, 'TECHNICAL',
    'وش Attribution Modeling؟',
    'What is Attribution Modeling?'),

  // MK Q7 PRESSURE
  q('MK-E-7', 'MARKETING_SPECIALIST', 'ENTRY', 7, 'PRESSURE',
    'مديرك يبي نتائج بكرة. وش تسوي؟',
    'Your boss wants results by tomorrow. What do you do?'),
  q('MK-M-7', 'MARKETING_SPECIALIST', 'MID', 7, 'PRESSURE',
    'حملة ينزلها بكرة وما في محتوى. وش الخطة؟',
    "A campaign launches tomorrow and there's no content. What's the plan?"),
  q('MK-S-7', 'MARKETING_SPECIALIST', 'SENIOR', 7, 'PRESSURE',
    'الشركة تبي تغيّر هويتها التسويقية في أسبوع. وش تسوي؟',
    'The company wants to change its marketing identity in a week. What do you do?'),

  // MK Q8 LEADERSHIP
  q('MK-E-8', 'MARKETING_SPECIALIST', 'ENTRY', 8, 'LEADERSHIP',
    'زميلك يسرق فكرتك. وش تسوي؟',
    'Your colleague steals your idea. What do you do?'),
  q('MK-M-8', 'MARKETING_SPECIALIST', 'MID', 8, 'LEADERSHIP',
    'فريقك متشتت. كيف توحدهم؟',
    'Your team is scattered. How do you unite them?'),
  q('MK-S-8', 'MARKETING_SPECIALIST', 'SENIOR', 8, 'LEADERSHIP',
    '٣ فرق تسويق مختلفة. كيف تنسقهم؟',
    '3 different marketing teams. How do you coordinate them?'),

  // MK Q9 TREND
  q('MK-TECH-9', 'MARKETING_SPECIALIST', 'ENTRY', 9, 'TREND',
    'Influencer marketing — فعّال ولا فقاعة؟',
    'Influencer marketing — effective or bubble?',
    'TECH'),
  q('MK-RETAIL-9', 'MARKETING_SPECIALIST', 'ENTRY', 9, 'TREND',
    'TikTok Shop يقتل المتاجر. كيف تتكيف؟',
    'TikTok Shop is killing stores. How do you adapt?',
    'RETAIL'),
  q('MK-HEALTHCARE-9', 'MARKETING_SPECIALIST', 'ENTRY', 9, 'TREND',
    'التسويق الصحي — أخلاقي ولا استغلال؟',
    'Health marketing — ethical or exploitation?',
    'HEALTHCARE'),

  // MK Q10 CLOSING
  q('MK-E-10', 'MARKETING_SPECIALIST', 'ENTRY', 10, 'CLOSING',
    'وش تبي تتعلمه السنة الجاية؟',
    'What do you want to learn this coming year?'),
  q('MK-M-10', 'MARKETING_SPECIALIST', 'MID', 10, 'CLOSING',
    'وش أكبر تحدي واجهته في التسويق؟',
    "What's the biggest challenge you've faced in marketing?"),
  q('MK-S-10', 'MARKETING_SPECIALIST', 'SENIOR', 10, 'CLOSING',
    'إذا أعطيتك مليون دولار ميزانية. وين تصرفها؟',
    'If I gave you a million dollar budget. Where would you spend it?'),

  // ───────────────────────────────────────────────────────────────
  // ROLE 4: HR_MANAGER (HR)
  // ───────────────────────────────────────────────────────────────

  // HR Q1 INTRO
  q('HR-E-1', 'HR_MANAGER', 'ENTRY', 1, 'INTRO',
    'عرفني عن نفسك. وش يميزك في الموارد البشرية؟',
    'Tell me about yourself. What makes you stand out in HR?'),
  q('HR-M-1', 'HR_MANAGER', 'MID', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر تحدي واجهته في التوظيف؟',
    "Tell me about yourself. What's the biggest challenge you've faced in recruiting?"),
  q('HR-S-1', 'HR_MANAGER', 'SENIOR', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر تغيير سويته في ثقافة الشركة؟',
    "Tell me about yourself. What's the biggest change you've made to company culture?"),

  // HR Q2 FAILURE
  q('HR-E-2', 'HR_MANAGER', 'ENTRY', 2, 'FAILURE',
    'موظف استقال بعد أسبوع. وش تعلمت؟',
    'An employee resigned after a week. What did you learn?'),
  q('HR-M-2', 'HR_MANAGER', 'MID', 2, 'FAILURE',
    'توظفت شخص غلط. وش السبب؟',
    'You hired the wrong person. What was the reason?'),
  q('HR-S-2', 'HR_MANAGER', 'SENIOR', 2, 'FAILURE',
    'فشلت في تغيير ثقافة الشركة. وش كان الخلل؟',
    'You failed to change the company culture. What went wrong?'),

  // HR Q3 INDUSTRY
  q('HR-TECH-3', 'HR_MANAGER', 'ENTRY', 3, 'INDUSTRY',
    'كيف تتنافس مع Google وAmazon على المواهب؟',
    'How do you compete with Google and Amazon for talent?',
    'TECH'),
  q('HR-RETAIL-3', 'HR_MANAGER', 'ENTRY', 3, 'INDUSTRY',
    'كيف تخفض دوران الموظفين في التجزئة؟',
    'How do you reduce employee turnover in retail?',
    'RETAIL'),
  q('HR-HEALTHCARE-3', 'HR_MANAGER', 'ENTRY', 3, 'INDUSTRY',
    'كيف توظف أطباء في مناطق نائية؟',
    'How do you recruit doctors in remote areas?',
    'HEALTHCARE'),

  // HR Q4 TEAM
  q('HR-E-4', 'HR_MANAGER', 'ENTRY', 4, 'TEAM',
    'مدير قسم يرفض تعاون مع HR. وش تسوي؟',
    'A department manager refuses to cooperate with HR. What do you do?'),
  q('HR-M-4', 'HR_MANAGER', 'MID', 4, 'TEAM',
    'نزاع بين موظفين. وش خطوتك الأولى؟',
    'A dispute between employees. What\'s your first step?'),
  q('HR-S-4', 'HR_MANAGER', 'SENIOR', 4, 'TEAM',
    '٣ مديرين يتخانقون على موظف واحد. وش تسوي؟',
    '3 managers are fighting over one employee. What do you do?'),

  // HR Q5 CULTURE
  q('HR-E-5', 'HR_MANAGER', 'ENTRY', 5, 'CULTURE',
    'موظف يتأخر كل يوم. وش تسوي؟',
    'An employee is late every day. What do you do?'),
  q('HR-M-5', 'HR_MANAGER', 'MID', 5, 'CULTURE',
    'موظف يبغى راتب زيادة بسبب \'ظروف\'. كيف تتعامل؟',
    'An employee wants a raise due to "circumstances". How do you handle it?'),
  q('HR-S-5', 'HR_MANAGER', 'SENIOR', 5, 'CULTURE',
    'الشركة تبي تسرّح ٢٠٠ موظف. وش خطتك؟',
    'The company wants to lay off 200 employees. What\'s your plan?'),

  // HR Q6 TECHNICAL
  q('HR-E-6', 'HR_MANAGER', 'ENTRY', 6, 'TECHNICAL',
    'وش الفرق بين KPI و KRA؟',
    "What's the difference between KPI and KRA?"),
  q('HR-M-6', 'HR_MANAGER', 'MID', 6, 'TECHNICAL',
    'وش 360-Degree Feedback؟',
    'What is 360-Degree Feedback?'),
  q('HR-S-6', 'HR_MANAGER', 'SENIOR', 6, 'TECHNICAL',
    'وش Organizational Design؟',
    'What is Organizational Design?'),

  // HR Q7 PRESSURE
  q('HR-E-7', 'HR_MANAGER', 'ENTRY', 7, 'PRESSURE',
    'مديرك يبي ١٠ موظفين بكرة. وش تسوي؟',
    'Your boss wants 10 employees by tomorrow. What do you do?'),
  q('HR-M-7', 'HR_MANAGER', 'MID', 7, 'PRESSURE',
    'فريقك يبي ٥٠ موظف في شهر. وش الخطة؟',
    'Your team needs 50 employees in a month. What\'s the plan?'),
  q('HR-S-7', 'HR_MANAGER', 'SENIOR', 7, 'PRESSURE',
    'الشركة تبي توسّع ٣ دول في ٦ شهور. وش تسوي؟',
    'The company wants to expand to 3 countries in 6 months. What do you do?'),

  // HR Q8 LEADERSHIP
  q('HR-E-8', 'HR_MANAGER', 'ENTRY', 8, 'LEADERSHIP',
    'زميلك ينقل شائعات. وش تسوي؟',
    'Your colleague spreads rumors. What do you do?'),
  q('HR-M-8', 'HR_MANAGER', 'MID', 8, 'LEADERSHIP',
    'فريقك يفقد الثقة فيك. كيف ترجعها؟',
    'Your team has lost trust in you. How do you regain it?'),
  q('HR-S-8', 'HR_MANAGER', 'SENIOR', 8, 'LEADERSHIP',
    '٥٠ مدير موارد بشرية تحتك. كيف تضمن الجودة؟',
    'You have 50 HR managers under you. How do you ensure quality?'),

  // HR Q9 TREND
  q('HR-TECH-9', 'HR_MANAGER', 'ENTRY', 9, 'TREND',
    'Remote work — مستقبل ولا موضة؟',
    'Remote work — future or fad?',
    'TECH'),
  q('HR-RETAIL-9', 'HR_MANAGER', 'ENTRY', 9, 'TREND',
    'Gig economy — تهديد ولا فرصة؟',
    'Gig economy — threat or opportunity?',
    'RETAIL'),
  q('HR-HEALTHCARE-9', 'HR_MANAGER', 'ENTRY', 9, 'TREND',
    'AI في التوظيف الطبي — أخلاقي ولا لا؟',
    'AI in medical hiring — ethical or not?',
    'HEALTHCARE'),

  // HR Q10 CLOSING
  q('HR-E-10', 'HR_MANAGER', 'ENTRY', 10, 'CLOSING',
    'وش تبي تتعلمه السنة الجاية؟',
    'What do you want to learn this coming year?'),
  q('HR-M-10', 'HR_MANAGER', 'MID', 10, 'CLOSING',
    'وش أكبر تحدي واجهته في إدارة المواهب؟',
    "What's the biggest challenge you've faced in talent management?"),
  q('HR-S-10', 'HR_MANAGER', 'SENIOR', 10, 'CLOSING',
    'إذا بنيت قسم HR من الصفر. وش تختلف عن اللي قبل ١٠ سنين؟',
    'If you built an HR department from scratch. How would it differ from 10 years ago?'),

  // ───────────────────────────────────────────────────────────────
  // ROLE 5: ACCOUNTANT (AC)
  // ───────────────────────────────────────────────────────────────

  // AC Q1 INTRO
  q('AC-E-1', 'ACCOUNTANT', 'ENTRY', 1, 'INTRO',
    'عرفني عن نفسك. وش البرنامج المحاسبي اللي تستخدمه؟',
    'Tell me about yourself. What accounting software do you use?'),
  q('AC-M-1', 'ACCOUNTANT', 'MID', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر تقرير سويته؟',
    "Tell me about yourself. What's the biggest report you've produced?"),
  q('AC-S-1', 'ACCOUNTANT', 'SENIOR', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر خطأ مالي اكتشفته؟',
    "Tell me about yourself. What's the biggest financial error you've caught?"),

  // AC Q2 FAILURE
  q('AC-E-2', 'ACCOUNTANT', 'ENTRY', 2, 'FAILURE',
    'رقم غلط في التقرير. وش تعلمت؟',
    'A wrong number in a report. What did you learn?'),
  q('AC-M-2', 'ACCOUNTANT', 'MID', 2, 'FAILURE',
    'تقرير مالي خاطئ كلف الشركة. وش السبب؟',
    'A wrong financial report cost the company. What was the reason?'),
  q('AC-S-2', 'ACCOUNTANT', 'SENIOR', 2, 'FAILURE',
    'غش مالي اكتشفته متأخر. وش كان الخلل؟',
    'Financial fraud discovered late. What was the failure?'),

  // AC Q3 INDUSTRY
  q('AC-FINTECH-3', 'ACCOUNTANT', 'ENTRY', 3, 'INDUSTRY',
    'كيف تتعامل مع العملات الرقمية في المحاسبة؟',
    'How do you handle cryptocurrencies in accounting?',
    'FINTECH'),
  q('AC-RETAIL-3', 'ACCOUNTANT', 'ENTRY', 3, 'INDUSTRY',
    'كيف تدير مخزون يتغير كل يوم؟',
    'How do you manage inventory that changes daily?',
    'RETAIL'),
  q('AC-HEALTHCARE-3', 'ACCOUNTANT', 'ENTRY', 3, 'INDUSTRY',
    'كيف تتعامل مع مطالبات التأمين المعقدة؟',
    'How do you handle complex insurance claims?',
    'HEALTHCARE'),

  // AC Q4 TEAM
  q('AC-E-4', 'ACCOUNTANT', 'ENTRY', 4, 'TEAM',
    'زميلك يبي رقم قبل ما تخلص الحساب. وش تسوي؟',
    'Your colleague wants a number before you finish. What do you do?'),
  q('AC-M-4', 'ACCOUNTANT', 'MID', 4, 'TEAM',
    'المدير يبي تقرير غير دقيق. كيف ترد؟',
    'Your boss wants an inaccurate report. How do you respond?'),
  q('AC-S-4', 'ACCOUNTANT', 'SENIOR', 4, 'TEAM',
    'المدير المالي يبي \'تعديل\' في الأرقام. وش موقفك؟',
    'The CFO wants to "adjust" the numbers. What\'s your stance?'),

  // AC Q5 CULTURE
  q('AC-E-5', 'ACCOUNTANT', 'ENTRY', 5, 'CULTURE',
    'مديرك يطلب فاتورة وهمية. وش تسوي؟',
    'Your boss asks for a fake invoice. What do you do?'),
  q('AC-M-5', 'ACCOUNTANT', 'MID', 5, 'CULTURE',
    'الشركة تبي \'تخفيف\' الضرائب بشكل غير قانوني. وش تسوي؟',
    'The company wants to "reduce" taxes illegally. What do you do?'),
  q('AC-S-5', 'ACCOUNTANT', 'SENIOR', 5, 'CULTURE',
    'اكتشفت غش مالي من مدير كبير. وش تسوي؟',
    'You discovered financial fraud by a senior manager. What do you do?'),

  // AC Q6 TECHNICAL
  q('AC-E-6', 'ACCOUNTANT', 'ENTRY', 6, 'TECHNICAL',
    'وش الفرق بين Debit و Credit؟',
    "What's the difference between Debit and Credit?"),
  q('AC-M-6', 'ACCOUNTANT', 'MID', 6, 'TECHNICAL',
    'وش الفرق بين Cash Flow و P&L؟',
    "What's the difference between Cash Flow and P&L?"),
  q('AC-S-6', 'ACCOUNTANT', 'SENIOR', 6, 'TECHNICAL',
    'وش IFRS 15؟',
    'What is IFRS 15?'),

  // AC Q7 PRESSURE
  q('AC-E-7', 'ACCOUNTANT', 'ENTRY', 7, 'PRESSURE',
    'مديرك يبي التقرير بكرة. وش تسوي؟',
    'Your boss wants the report by tomorrow. What do you do?'),
  q('AC-M-7', 'ACCOUNTANT', 'MID', 7, 'PRESSURE',
    'المراجعة الداخلية بكرة وفي أخطاء. وش تسوي؟',
    'Internal audit is tomorrow and there are errors. What do you do?'),
  q('AC-S-7', 'ACCOUNTANT', 'SENIOR', 7, 'PRESSURE',
    'الهيئة الضريبية تبغى تقرير في ٢٤ ساعة. وش تسوي؟',
    'The tax authority wants a report in 24 hours. What do you do?'),

  // AC Q8 LEADERSHIP
  q('AC-E-8', 'ACCOUNTANT', 'ENTRY', 8, 'LEADERSHIP',
    'زميل جديد يسألك كل يوم. وش تسوي؟',
    'A new colleague asks you every day. What do you do?'),
  q('AC-M-8', 'ACCOUNTANT', 'MID', 8, 'LEADERSHIP',
    'فريقك يتأخر في التقارير. وش الحل؟',
    "Your team is late on reports. What's the solution?"),
  q('AC-S-8', 'ACCOUNTANT', 'SENIOR', 8, 'LEADERSHIP',
    '٢٠ محاسب تحتك. كيف تضمن الدقة؟',
    'You have 20 accountants under you. How do you ensure accuracy?'),

  // AC Q9 TREND
  q('AC-FINTECH-9', 'ACCOUNTANT', 'ENTRY', 9, 'TREND',
    'Blockchain في المحاسبة — فرصة ولا تهديد؟',
    'Blockchain in accounting — opportunity or threat?',
    'FINTECH'),
  q('AC-RETAIL-9', 'ACCOUNTANT', 'ENTRY', 9, 'TREND',
    'Automation في المخزون — نعم ولا لا؟',
    'Automation in inventory — yes or no?',
    'RETAIL'),
  q('AC-HEALTHCARE-9', 'ACCOUNTANT', 'ENTRY', 9, 'TREND',
    'AI في الفوترة الطبية — فعّال ولا لا؟',
    'AI in medical billing — effective or not?',
    'HEALTHCARE'),

  // AC Q10 CLOSING
  q('AC-E-10', 'ACCOUNTANT', 'ENTRY', 10, 'CLOSING',
    'وش تبي تتعلمه السنة الجاية؟',
    'What do you want to learn this coming year?'),
  q('AC-M-10', 'ACCOUNTANT', 'MID', 10, 'CLOSING',
    'وش أكبر تحدي واجهته في المراجعة؟',
    "What's the biggest challenge you've faced in auditing?"),
  q('AC-S-10', 'ACCOUNTANT', 'SENIOR', 10, 'CLOSING',
    'إذا غيّرت نظام المحاسبة بالكامل. وش أول شي تسويه؟',
    'If you changed the accounting system completely. What\'s the first thing you\'d do?'),

  // ───────────────────────────────────────────────────────────────
  // ROLE 6: CUSTOMER_SERVICE (CS)
  // ───────────────────────────────────────────────────────────────

  // CS Q1 INTRO
  q('CS-E-1', 'CUSTOMER_SERVICE', 'ENTRY', 1, 'INTRO',
    'عرفني عن نفسك. وش يميزك في التعامل مع الناس؟',
    'Tell me about yourself. What makes you good with people?'),
  q('CS-M-1', 'CUSTOMER_SERVICE', 'MID', 1, 'INTRO',
    'عرفني عن نفسك. وش أكثر موقف صعب واجهته مع عميل؟',
    "Tell me about yourself. What's the toughest situation you've faced with a customer?"),
  q('CS-S-1', 'CUSTOMER_SERVICE', 'SENIOR', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر تحسين سويته في خدمة العملاء؟',
    "Tell me about yourself. What's the biggest improvement you've made to customer service?"),

  // CS Q2 FAILURE
  q('CS-E-2', 'CUSTOMER_SERVICE', 'ENTRY', 2, 'FAILURE',
    'عميل زعل منك. وش تعلمت؟',
    'A customer got angry at you. What did you learn?'),
  q('CS-M-2', 'CUSTOMER_SERVICE', 'MID', 2, 'FAILURE',
    'شكوى وصلت للمدير. وش السبب؟',
    'A complaint reached the manager. What was the reason?'),
  q('CS-S-2', 'CUSTOMER_SERVICE', 'SENIOR', 2, 'FAILURE',
    'أزمة سمعتية بسبب خدمة عملاء. وش كان الخلل؟',
    'A reputation crisis due to customer service. What went wrong?'),

  // CS Q3 INDUSTRY
  q('CS-TELECOM-3', 'CUSTOMER_SERVICE', 'ENTRY', 3, 'INDUSTRY',
    'عميل يبغي إلغاء العقد. كيف تردّه؟',
    'A customer wants to cancel their contract. How do you retain them?',
    'TELECOM'),
  q('CS-ECOMMERCE-3', 'CUSTOMER_SERVICE', 'ENTRY', 3, 'INDUSTRY',
    'عميل استلم منتج مكسور. وش تسوي؟',
    'A customer received a broken product. What do you do?',
    'E-COMMERCE'),
  q('CS-BANKING-3', 'CUSTOMER_SERVICE', 'ENTRY', 3, 'INDUSTRY',
    'عميل يفقد حسابه. وش خطواتك؟',
    'A customer loses access to their account. What are your steps?',
    'BANKING'),

  // CS Q4 TEAM
  q('CS-E-4', 'CUSTOMER_SERVICE', 'ENTRY', 4, 'TEAM',
    'زميلك يرفض يساعدك. وش تسوي؟',
    'Your colleague refuses to help you. What do you do?'),
  q('CS-M-4', 'CUSTOMER_SERVICE', 'MID', 4, 'TEAM',
    'فريقك ما يتفق على حل للعميل. وش تسوي؟',
    "Your team can't agree on a solution for a customer. What do you do?"),
  q('CS-S-4', 'CUSTOMER_SERVICE', 'SENIOR', 4, 'TEAM',
    '٣ فرق مختلفة تلقي باللوم على بعض. وش تسوي؟',
    '3 different teams are blaming each other. What do you do?'),

  // CS Q5 CULTURE
  q('CS-E-5', 'CUSTOMER_SERVICE', 'ENTRY', 5, 'CULTURE',
    'عميل يصرخ. وش تسوي؟',
    'A customer is yelling. What do you do?'),
  q('CS-M-5', 'CUSTOMER_SERVICE', 'MID', 5, 'CULTURE',
    'عميل خليجي يقول \'أبغى المدير\'. كيف تتعامل؟',
    'A Gulf customer says "I want the manager". How do you handle it?'),
  q('CS-S-5', 'CUSTOMER_SERVICE', 'SENIOR', 5, 'CULTURE',
    'عميل VIP يهدد بالإعلام. وش خطتك؟',
    'A VIP customer threatens media exposure. What\'s your plan?'),

  // CS Q6 TECHNICAL
  q('CS-E-6', 'CUSTOMER_SERVICE', 'ENTRY', 6, 'TECHNICAL',
    'وش الفرق بين SLA و KPI؟',
    "What's the difference between SLA and KPI?"),
  q('CS-M-6', 'CUSTOMER_SERVICE', 'MID', 6, 'TECHNICAL',
    'وش First Contact Resolution؟',
    'What is First Contact Resolution?'),
  q('CS-S-6', 'CUSTOMER_SERVICE', 'SENIOR', 6, 'TECHNICAL',
    'وش Customer Effort Score؟',
    'What is Customer Effort Score?'),

  // CS Q7 PRESSURE
  q('CS-E-7', 'CUSTOMER_SERVICE', 'ENTRY', 7, 'PRESSURE',
    '١٠ عملاء ينتظرون. وش تسوي؟',
    '10 customers are waiting. What do you do?'),
  q('CS-M-7', 'CUSTOMER_SERVICE', 'MID', 7, 'PRESSURE',
    'نظام الكول سنتر ينهار. وش تسوي؟',
    'The call center system crashes. What do you do?'),
  q('CS-S-7', 'CUSTOMER_SERVICE', 'SENIOR', 7, 'PRESSURE',
    'أزمة إعلامية بسبب شكوى عميل. وش خطتك في ١ ساعة؟',
    "A media crisis due to a customer complaint. What's your 1-hour plan?"),

  // CS Q8 LEADERSHIP
  q('CS-E-8', 'CUSTOMER_SERVICE', 'ENTRY', 8, 'LEADERSHIP',
    'زميلك ينقل طاقة سلبية. وش تسوي؟',
    'Your colleague spreads negativity. What do you do?'),
  q('CS-M-8', 'CUSTOMER_SERVICE', 'MID', 8, 'LEADERSHIP',
    'فريقك يفقد الحماس. كيف ترجعه؟',
    'Your team has lost motivation. How do you bring it back?'),
  q('CS-S-8', 'CUSTOMER_SERVICE', 'SENIOR', 8, 'LEADERSHIP',
    '٥٠ موظف خدمة عملاء. كيف تضمن الجودة؟',
    'You have 50 customer service staff. How do you ensure quality?'),

  // CS Q9 TREND
  q('CS-TELECOM-9', 'CUSTOMER_SERVICE', 'ENTRY', 9, 'TREND',
    'Chatbots — تستبدل البشر ولا تساعدهم؟',
    'Chatbots — replacing humans or helping them?',
    'TELECOM'),
  q('CS-ECOMMERCE-9', 'CUSTOMER_SERVICE', 'ENTRY', 9, 'TREND',
    'Social media support — ضرورة ولا رفاهية؟',
    'Social media support — necessity or luxury?',
    'E-COMMERCE'),
  q('CS-BANKING-9', 'CUSTOMER_SERVICE', 'ENTRY', 9, 'TREND',
    'AI في خدمة العملاء — فعّال ولا بارد؟',
    'AI in customer service — effective or cold?',
    'BANKING'),

  // CS Q10 CLOSING
  q('CS-E-10', 'CUSTOMER_SERVICE', 'ENTRY', 10, 'CLOSING',
    'وش تبي تتعلمه السنة الجاية؟',
    'What do you want to learn this coming year?'),
  q('CS-M-10', 'CUSTOMER_SERVICE', 'MID', 10, 'CLOSING',
    'وش أكبر تحدي واجهته مع عميل صعب؟',
    "What's the biggest challenge you've faced with a difficult customer?"),
  q('CS-S-10', 'CUSTOMER_SERVICE', 'SENIOR', 10, 'CLOSING',
    'إذا غيّرت قسم خدمة العملاء بالكامل. وش أول شي تسويه؟',
    'If you changed the customer service department completely. What\'s the first thing you\'d do?'),

  // ───────────────────────────────────────────────────────────────
  // ROLE 7: PROJECT_MANAGER (PM)
  // ───────────────────────────────────────────────────────────────

  // PM Q1 INTRO
  q('PM-E-1', 'PROJECT_MANAGER', 'ENTRY', 1, 'INTRO',
    'عرفني عن نفسك. وش يميزك في إدارة المشاريع؟',
    'Tell me about yourself. What makes you stand out in project management?'),
  q('PM-M-1', 'PROJECT_MANAGER', 'MID', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر مشروع قدّيته؟',
    "Tell me about yourself. What's the biggest project you've managed?"),
  q('PM-S-1', 'PROJECT_MANAGER', 'SENIOR', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر فشل في مشروع قدّيته؟',
    "Tell me about yourself. What's the biggest failure in a project you've managed?"),

  // PM Q2 FAILURE
  q('PM-E-2', 'PROJECT_MANAGER', 'ENTRY', 2, 'FAILURE',
    'مشروع تأخر. وش تعلمت؟',
    'A project was delayed. What did you learn?'),
  q('PM-M-2', 'PROJECT_MANAGER', 'MID', 2, 'FAILURE',
    'مشروع تجاوز الميزانية ٥٠٪. وش السبب؟',
    'A project went 50% over budget. What was the reason?'),
  q('PM-S-2', 'PROJECT_MANAGER', 'SENIOR', 2, 'FAILURE',
    'مشروع استراتيجي فشل بالكامل. وش كان الخلل؟',
    'A strategic project failed completely. What went wrong?'),

  // PM Q3 INDUSTRY
  q('PM-CONSTRUCTION-3', 'PROJECT_MANAGER', 'ENTRY', 3, 'INDUSTRY',
    'مقاول فرعي تأخر. وش تسوي؟',
    'A subcontractor is delayed. What do you do?',
    'CONSTRUCTION'),
  q('PM-IT-3', 'PROJECT_MANAGER', 'ENTRY', 3, 'INDUSTRY',
    'مطوّر رئيسي استقال منتصف المشروع. وش تسوي؟',
    'A lead developer resigned mid-project. What do you do?',
    'IT'),
  q('PM-HEALTHCARE-3', 'PROJECT_MANAGER', 'ENTRY', 3, 'INDUSTRY',
    'جهة تنظيمية ترفض الترخيص. وش تسوي؟',
    'A regulatory body rejects the license. What do you do?',
    'HEALTHCARE'),

  // PM Q4 TEAM
  q('PM-E-4', 'PROJECT_MANAGER', 'ENTRY', 4, 'TEAM',
    'زميلك يرفض المهمة. وش تسوي؟',
    'Your colleague refuses the task. What do you do?'),
  q('PM-M-4', 'PROJECT_MANAGER', 'MID', 4, 'TEAM',
    'فريقك يتخانق على الأولويات. وش الحل؟',
    "Your team is arguing over priorities. What's the solution?"),
  q('PM-S-4', 'PROJECT_MANAGER', 'SENIOR', 4, 'TEAM',
    '٣ فرق من شركات مختلفة. كيف تنسقهم؟',
    '3 teams from different companies. How do you coordinate them?'),

  // PM Q5 CULTURE
  q('PM-E-5', 'PROJECT_MANAGER', 'ENTRY', 5, 'CULTURE',
    'مديرك يغيّر المتطلبات كل يوم. وش تسوي؟',
    'Your boss changes requirements every day. What do you do?'),
  q('PM-M-5', 'PROJECT_MANAGER', 'MID', 5, 'CULTURE',
    'العميل يطلب شي خارج النطاق. كيف ترد؟',
    'The client asks for something out of scope. How do you respond?'),
  q('PM-S-5', 'PROJECT_MANAGER', 'SENIOR', 5, 'CULTURE',
    'الشركة تبي تسرّح نصف فريق المشروع. وش تسوي؟',
    'The company wants to lay off half the project team. What do you do?'),

  // PM Q6 TECHNICAL
  q('PM-E-6', 'PROJECT_MANAGER', 'ENTRY', 6, 'TECHNICAL',
    'وش الفرق بين Agile و Waterfall؟',
    "What's the difference between Agile and Waterfall?"),
  q('PM-M-6', 'PROJECT_MANAGER', 'MID', 6, 'TECHNICAL',
    'وش Critical Path Method؟',
    'What is the Critical Path Method?'),
  q('PM-S-6', 'PROJECT_MANAGER', 'SENIOR', 6, 'TECHNICAL',
    'وش Earned Value Management؟',
    'What is Earned Value Management?'),

  // PM Q7 PRESSURE
  q('PM-E-7', 'PROJECT_MANAGER', 'ENTRY', 7, 'PRESSURE',
    'مشروع ينتهي بكرة وما خلص. وش تسوي؟',
    "A project is due tomorrow and isn't finished. What do you do?"),
  q('PM-M-7', 'PROJECT_MANAGER', 'MID', 7, 'PRESSURE',
    'عميل يغيّر المتطلبات قبل التسليم بأسبوع. وش تسوي؟',
    'The client changes requirements a week before delivery. What do you do?'),
  q('PM-S-7', 'PROJECT_MANAGER', 'SENIOR', 7, 'PRESSURE',
    'مشروع استراتيجي يتأخر ٦ شهور. وش خطتك؟',
    'A strategic project is delayed 6 months. What\'s your plan?'),

  // PM Q8 LEADERSHIP
  q('PM-E-8', 'PROJECT_MANAGER', 'ENTRY', 8, 'LEADERSHIP',
    'زميلك ينقل سلبية. وش تسوي؟',
    'Your colleague spreads negativity. What do you do?'),
  q('PM-M-8', 'PROJECT_MANAGER', 'MID', 8, 'LEADERSHIP',
    'فريقك يفقد الثقة في المشروع. كيف ترجعها؟',
    'Your team lost faith in the project. How do you restore it?'),
  q('PM-S-8', 'PROJECT_MANAGER', 'SENIOR', 8, 'LEADERSHIP',
    '٥٠ شخص في مشروع واحد. كيف تضمن التواصل؟',
    '50 people on one project. How do you ensure communication?'),

  // PM Q9 TREND
  q('PM-CONSTRUCTION-9', 'PROJECT_MANAGER', 'ENTRY', 9, 'TREND',
    'BIM — مستقبل ولا رفاهية؟',
    'BIM — future or luxury?',
    'CONSTRUCTION'),
  q('PM-IT-9', 'PROJECT_MANAGER', 'ENTRY', 9, 'TREND',
    'Remote teams — فعّالة ولا لا؟',
    'Remote teams — effective or not?',
    'IT'),
  q('PM-HEALTHCARE-9', 'PROJECT_MANAGER', 'ENTRY', 9, 'TREND',
    'Agile في المشاريع الطبية — ينفع ولا لا؟',
    'Agile in medical projects — does it work?',
    'HEALTHCARE'),

  // PM Q10 CLOSING
  q('PM-E-10', 'PROJECT_MANAGER', 'ENTRY', 10, 'CLOSING',
    'وش تبي تتعلمه السنة الجاية؟',
    'What do you want to learn this coming year?'),
  q('PM-M-10', 'PROJECT_MANAGER', 'MID', 10, 'CLOSING',
    'وش أكبر تحدي واجهته في إدارة المشاريع؟',
    "What's the biggest challenge you've faced in project management?"),
  q('PM-S-10', 'PROJECT_MANAGER', 'SENIOR', 10, 'CLOSING',
    'إذا قدّيت مشروع بمليار ريال. وش تختلف عن اللي قبل؟',
    'If you managed a billion riyal project. How would it differ from before?'),

  // ───────────────────────────────────────────────────────────────
  // ROLE 8: DATA_ANALYST (DA)
  // ───────────────────────────────────────────────────────────────

  // DA Q1 INTRO
  q('DA-E-1', 'DATA_ANALYST', 'ENTRY', 1, 'INTRO',
    'عرفني عن نفسك. وش الأدوات اللي تستخدمها؟',
    'Tell me about yourself. What tools do you use?'),
  q('DA-M-1', 'DATA_ANALYST', 'MID', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر تحليل سويته؟',
    "Tell me about yourself. What's the biggest analysis you've done?"),
  q('DA-S-1', 'DATA_ANALYST', 'SENIOR', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر تأثير سويته بالبيانات؟',
    "Tell me about yourself. What's the biggest impact you've made with data?"),

  // DA Q2 FAILURE
  q('DA-E-2', 'DATA_ANALYST', 'ENTRY', 2, 'FAILURE',
    'تحليل غلط أخذت قرار عليه. وش تعلمت؟',
    'A wrong analysis led to a decision. What did you learn?'),
  q('DA-M-2', 'DATA_ANALYST', 'MID', 2, 'FAILURE',
    'بيانات ناقصة أدت لقرار غلط. وش السبب؟',
    'Incomplete data led to a wrong decision. What was the reason?'),
  q('DA-S-2', 'DATA_ANALYST', 'SENIOR', 2, 'FAILURE',
    'نموذج تنبؤي فشل بالكامل. وش كان الخلل؟',
    'A predictive model failed completely. What went wrong?'),

  // DA Q3 INDUSTRY
  q('DA-RETAIL-3', 'DATA_ANALYST', 'ENTRY', 3, 'INDUSTRY',
    'كيف تتنبأ بمبيعات الموسم القادم؟',
    "How do you predict next season's sales?",
    'RETAIL'),
  q('DA-FINTECH-3', 'DATA_ANALYST', 'ENTRY', 3, 'INDUSTRY',
    'كيف تكتشف الاحتيال المالي؟',
    'How do you detect financial fraud?',
    'FINTECH'),
  q('DA-HEALTHCARE-3', 'DATA_ANALYST', 'ENTRY', 3, 'INDUSTRY',
    'كيف تحلل بيانات المرضى بدون خرق الخصوصية؟',
    'How do you analyze patient data without breaching privacy?',
    'HEALTHCARE'),

  // DA Q4 TEAM
  q('DA-E-4', 'DATA_ANALYST', 'ENTRY', 4, 'TEAM',
    'زميلك ما يفهم البيانات. كيف تشرحله؟',
    "Your colleague doesn't understand data. How do you explain it?"),
  q('DA-M-4', 'DATA_ANALYST', 'MID', 4, 'TEAM',
    'المدير يبي رسم بياني غلط. كيف تقنعه؟',
    'Your boss wants a misleading chart. How do you convince them?'),
  q('DA-S-4', 'DATA_ANALYST', 'SENIOR', 4, 'TEAM',
    'الشركة تبي \'أرقام تبرر قرارها\'. وش موقفك؟',
    'The company wants "numbers to justify their decision". What\'s your stance?'),

  // DA Q5 CULTURE
  q('DA-E-5', 'DATA_ANALYST', 'ENTRY', 5, 'CULTURE',
    'مديرك يبي تحليل في ساعة. وش تسوي؟',
    'Your boss wants an analysis in 1 hour. What do you do?'),
  q('DA-M-5', 'DATA_ANALYST', 'MID', 5, 'CULTURE',
    'الشركة تبي تخفي بيانات سلبية. وش تسوي؟',
    'The company wants to hide negative data. What do you do?'),
  q('DA-S-5', 'DATA_ANALYST', 'SENIOR', 5, 'CULTURE',
    'اكتشفت تلاعب في البيانات من قسم ثاني. وش تسوي؟',
    'You discovered data manipulation from another department. What do you do?'),

  // DA Q6 TECHNICAL
  q('DA-E-6', 'DATA_ANALYST', 'ENTRY', 6, 'TECHNICAL',
    'وش الفرق بين SQL و Excel؟',
    "What's the difference between SQL and Excel?"),
  q('DA-M-6', 'DATA_ANALYST', 'MID', 6, 'TECHNICAL',
    'وش A/B Testing؟',
    'What is A/B Testing?'),
  q('DA-S-6', 'DATA_ANALYST', 'SENIOR', 6, 'TECHNICAL',
    'وش Causal Inference؟',
    'What is Causal Inference?'),

  // DA Q7 PRESSURE
  q('DA-E-7', 'DATA_ANALYST', 'ENTRY', 7, 'PRESSURE',
    'مديرك يبي تقرير بكرة. وش تسوي؟',
    'Your boss wants a report by tomorrow. What do you do?'),
  q('DA-M-7', 'DATA_ANALYST', 'MID', 7, 'PRESSURE',
    'بيانات ضخمة ووقت قليل. وش الأولوية؟',
    'Massive data and little time. What\'s the priority?'),
  q('DA-S-7', 'DATA_ANALYST', 'SENIOR', 7, 'PRESSURE',
    'CEO يبي إجابة في ١ ساعة وبيانات معقدة. وش تسوي؟',
    'The CEO wants an answer in 1 hour with complex data. What do you do?'),

  // DA Q8 LEADERSHIP
  q('DA-E-8', 'DATA_ANALYST', 'ENTRY', 8, 'LEADERSHIP',
    'زميلك يستخدم Excel غلط. وش تسوي؟',
    'Your colleague uses Excel wrong. What do you do?'),
  q('DA-M-8', 'DATA_ANALYST', 'MID', 8, 'LEADERSHIP',
    'فريقك يستخدم ٥ أدوات مختلفة. وش الحل؟',
    'Your team uses 5 different tools. What\'s the solution?'),
  q('DA-S-8', 'DATA_ANALYST', 'SENIOR', 8, 'LEADERSHIP',
    '٢٠ محلل تحتك. كيف تضمن الجودة؟',
    'You have 20 analysts under you. How do you ensure quality?'),

  // DA Q9 TREND
  q('DA-RETAIL-9', 'DATA_ANALYST', 'ENTRY', 9, 'TREND',
    'AI في التنبؤ بالمبيعات — دقيق ولا لا؟',
    'AI in sales forecasting — accurate or not?',
    'RETAIL'),
  q('DA-FINTECH-9', 'DATA_ANALYST', 'ENTRY', 9, 'TREND',
    'Real-time analytics — ضرورة ولا رفاهية؟',
    'Real-time analytics — necessity or luxury?',
    'FINTECH'),
  q('DA-HEALTHCARE-9', 'DATA_ANALYST', 'ENTRY', 9, 'TREND',
    'Predictive health — أخلاقي ولا لا؟',
    'Predictive health — ethical or not?',
    'HEALTHCARE'),

  // DA Q10 CLOSING
  q('DA-E-10', 'DATA_ANALYST', 'ENTRY', 10, 'CLOSING',
    'وش تبي تتعلمه السنة الجاية؟',
    'What do you want to learn this coming year?'),
  q('DA-M-10', 'DATA_ANALYST', 'MID', 10, 'CLOSING',
    'وش أكبر تحدي واجهته في تحليل البيانات؟',
    "What's the biggest challenge you've faced in data analysis?"),
  q('DA-S-10', 'DATA_ANALYST', 'SENIOR', 10, 'CLOSING',
    'إذا بنيت قسم تحليل من الصفر. وش أول شي تسويه؟',
    'If you built an analytics department from scratch. What\'s the first thing you\'d do?'),

  // ───────────────────────────────────────────────────────────────
  // ROLE 9: OPERATIONS_MANAGER (OM)
  // ───────────────────────────────────────────────────────────────

  // OM Q1 INTRO
  q('OM-E-1', 'OPERATIONS_MANAGER', 'ENTRY', 1, 'INTRO',
    'عرفني عن نفسك. وش يميزك في العمليات؟',
    'Tell me about yourself. What makes you stand out in operations?'),
  q('OM-M-1', 'OPERATIONS_MANAGER', 'MID', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر تحسين سويته في العمليات؟',
    "Tell me about yourself. What's the biggest improvement you've made in operations?"),
  q('OM-S-1', 'OPERATIONS_MANAGER', 'SENIOR', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر أزمة عمليات قدّيتها؟',
    "Tell me about yourself. What's the biggest operations crisis you've managed?"),

  // OM Q2 FAILURE
  q('OM-E-2', 'OPERATIONS_MANAGER', 'ENTRY', 2, 'FAILURE',
    'خط إنتاج توقف. وش تعلمت؟',
    'A production line stopped. What did you learn?'),
  q('OM-M-2', 'OPERATIONS_MANAGER', 'MID', 2, 'FAILURE',
    'مخزون نفذ وما كان عندك بديل. وش السبب؟',
    'Inventory ran out and you had no alternative. What was the reason?'),
  q('OM-S-2', 'OPERATIONS_MANAGER', 'SENIOR', 2, 'FAILURE',
    'أزمة عمليات كلفت الشركة ملايين. وش كان الخلل؟',
    'An operations crisis cost the company millions. What went wrong?'),

  // OM Q3 INDUSTRY
  q('OM-MANUFACTURING-3', 'OPERATIONS_MANAGER', 'ENTRY', 3, 'INDUSTRY',
    'آلة رئيسية انكسرت. وش تسوي؟',
    'A main machine broke down. What do you do?',
    'MANUFACTURING'),
  q('OM-LOGISTICS-3', 'OPERATIONS_MANAGER', 'ENTRY', 3, 'INDUSTRY',
    'شحنة ضاعت في الطريق. وش تسوي؟',
    'A shipment was lost in transit. What do you do?',
    'LOGISTICS'),
  q('OM-RETAIL-3', 'OPERATIONS_MANAGER', 'ENTRY', 3, 'INDUSTRY',
    'مخزون ينفذ في الجمعة البيضاء. وش تسوي؟',
    'Inventory runs out on White Friday. What do you do?',
    'RETAIL'),

  // OM Q4 TEAM
  q('OM-E-4', 'OPERATIONS_MANAGER', 'ENTRY', 4, 'TEAM',
    'زميلك يرفض يتبع الإجراء. وش تسوي؟',
    'Your colleague refuses to follow procedure. What do you do?'),
  q('OM-M-4', 'OPERATIONS_MANAGER', 'MID', 4, 'TEAM',
    'قسمين يتخانقون على أولوية. وش الحل؟',
    "Two departments are arguing over priorities. What's the solution?"),
  q('OM-S-4', 'OPERATIONS_MANAGER', 'SENIOR', 4, 'TEAM',
    '٥ مصانع في دول مختلفة. كيف تنسقهم؟',
    '5 factories in different countries. How do you coordinate them?'),

  // OM Q5 CULTURE
  q('OM-E-5', 'OPERATIONS_MANAGER', 'ENTRY', 5, 'CULTURE',
    'مديرك يبي إنتاجية فوق الطاقة. وش تسوي؟',
    'Your boss wants productivity above capacity. What do you do?'),
  q('OM-M-5', 'OPERATIONS_MANAGER', 'MID', 5, 'CULTURE',
    'الشركة تبي تسرّح ٣٠٪ من العمال. وش تسوي؟',
    'The company wants to lay off 30% of workers. What do you do?'),
  q('OM-S-5', 'OPERATIONS_MANAGER', 'SENIOR', 5, 'CULTURE',
    'أزمة إعلامية بسبب ظروف عمل. وش خطتك؟',
    'A media crisis due to working conditions. What\'s your plan?'),

  // OM Q6 TECHNICAL
  q('OM-E-6', 'OPERATIONS_MANAGER', 'ENTRY', 6, 'TECHNICAL',
    'وش الفرق بين Efficiency و Effectiveness؟',
    "What's the difference between Efficiency and Effectiveness?"),
  q('OM-M-6', 'OPERATIONS_MANAGER', 'MID', 6, 'TECHNICAL',
    'وش Lean Six Sigma؟',
    'What is Lean Six Sigma?'),
  q('OM-S-6', 'OPERATIONS_MANAGER', 'SENIOR', 6, 'TECHNICAL',
    'وش Theory of Constraints؟',
    'What is the Theory of Constraints?'),

  // OM Q7 PRESSURE
  q('OM-E-7', 'OPERATIONS_MANAGER', 'ENTRY', 7, 'PRESSURE',
    'خط إنتاج يتوقف بكرة. وش تسوي؟',
    'A production line stops tomorrow. What do you do?'),
  q('OM-M-7', 'OPERATIONS_MANAGER', 'MID', 7, 'PRESSURE',
    'طلبية كبيرة وبوقت مستحيل. وش تسوي؟',
    'A huge order with an impossible deadline. What do you do?'),
  q('OM-S-7', 'OPERATIONS_MANAGER', 'SENIOR', 7, 'PRESSURE',
    'أزمة سلسلة إمداد عالمية. وش خطتك؟',
    "A global supply chain crisis. What's your plan?"),

  // OM Q8 LEADERSHIP
  q('OM-E-8', 'OPERATIONS_MANAGER', 'ENTRY', 8, 'LEADERSHIP',
    'زميلك ينقل شائعات. وش تسوي؟',
    'Your colleague spreads rumors. What do you do?'),
  q('OM-M-8', 'OPERATIONS_MANAGER', 'MID', 8, 'LEADERSHIP',
    'فريقك يفقد الحماس. كيف ترجعه؟',
    'Your team has lost motivation. How do you bring it back?'),
  q('OM-S-8', 'OPERATIONS_MANAGER', 'SENIOR', 8, 'LEADERSHIP',
    '١٠٠٠ موظف عمليات. كيف تضمن الجودة؟',
    '1,000 operations employees. How do you ensure quality?'),

  // OM Q9 TREND
  q('OM-MANUFACTURING-9', 'OPERATIONS_MANAGER', 'ENTRY', 9, 'TREND',
    'Automation — تسرّح البشر ولا تساعدهم؟',
    'Automation — replacing humans or helping them?',
    'MANUFACTURING'),
  q('OM-LOGISTICS-9', 'OPERATIONS_MANAGER', 'ENTRY', 9, 'TREND',
    'Drone delivery — واقع ولا خيال؟',
    'Drone delivery — reality or fiction?',
    'LOGISTICS'),
  q('OM-RETAIL-9', 'OPERATIONS_MANAGER', 'ENTRY', 9, 'TREND',
    'Just-in-time — آمن ولا خطر؟',
    'Just-in-time — safe or risky?',
    'RETAIL'),

  // OM Q10 CLOSING
  q('OM-E-10', 'OPERATIONS_MANAGER', 'ENTRY', 10, 'CLOSING',
    'وش تبي تتعلمه السنة الجاية؟',
    'What do you want to learn this coming year?'),
  q('OM-M-10', 'OPERATIONS_MANAGER', 'MID', 10, 'CLOSING',
    'وش أكبر تحدي واجهته في العمليات؟',
    "What's the biggest challenge you've faced in operations?"),
  q('OM-S-10', 'OPERATIONS_MANAGER', 'SENIOR', 10, 'CLOSING',
    'إذا غيّرت العمليات بالكامل. وش أول شي تسويه؟',
    'If you changed operations completely. What\'s the first thing you\'d do?'),

  // ───────────────────────────────────────────────────────────────
  // ROLE 10: GRAPHIC_DESIGNER (GD)
  // ───────────────────────────────────────────────────────────────

  // GD Q1 INTRO
  q('GD-E-1', 'GRAPHIC_DESIGNER', 'ENTRY', 1, 'INTRO',
    'عرفني عن نفسك. وش البرامج اللي تستخدمها؟',
    'Tell me about yourself. What software do you use?'),
  q('GD-M-1', 'GRAPHIC_DESIGNER', 'MID', 1, 'INTRO',
    'عرفني عن نفسك. وش آخر مشروع سويته؟',
    "Tell me about yourself. What's the last project you worked on?"),
  q('GD-S-1', 'GRAPHIC_DESIGNER', 'SENIOR', 1, 'INTRO',
    'عرفني عن نفسك. وش أكبر حملة بصرية قدّيتها؟',
    "Tell me about yourself. What's the biggest visual campaign you've led?"),

  // GD Q2 FAILURE
  q('GD-E-2', 'GRAPHIC_DESIGNER', 'ENTRY', 2, 'FAILURE',
    'تصميم رفضه العميل. وش تعلمت؟',
    'A design was rejected by the client. What did you learn?'),
  q('GD-M-2', 'GRAPHIC_DESIGNER', 'MID', 2, 'FAILURE',
    'مشروع تأخر بسبب التصاميم. وش السبب؟',
    'A project was delayed due to designs. What was the reason?'),
  q('GD-S-2', 'GRAPHIC_DESIGNER', 'SENIOR', 2, 'FAILURE',
    'هوية بصرية فشلت بالكامل. وش كان الخلل؟',
    'A visual identity failed completely. What went wrong?'),

  // GD Q3 INDUSTRY
  q('GD-TECH-3', 'GRAPHIC_DESIGNER', 'ENTRY', 3, 'INDUSTRY',
    'كيف تسوّق منتج تقني بصرياً للعميل العادي؟',
    'How do you visually market a tech product to everyday users?',
    'TECH'),
  q('GD-RETAIL-3', 'GRAPHIC_DESIGNER', 'ENTRY', 3, 'INDUSTRY',
    'كيف تصمم عرض واجهة يزيد المبيعات ٢٠٪؟',
    'How do you design a storefront display that increases sales 20%?',
    'RETAIL'),
  q('GD-MEDIA-3', 'GRAPHIC_DESIGNER', 'ENTRY', 3, 'INDUSTRY',
    'كيف تصمم غلاف يبيع مليون نسخة؟',
    'How do you design a cover that sells a million copies?',
    'MEDIA'),

  // GD Q4 TEAM
  q('GD-E-4', 'GRAPHIC_DESIGNER', 'ENTRY', 4, 'TEAM',
    'زميلك ينتقد تصميمك. وش تسوي؟',
    'Your colleague criticizes your design. What do you do?'),
  q('GD-M-4', 'GRAPHIC_DESIGNER', 'MID', 4, 'TEAM',
    'المسوّق يبي شي \'يبيع أكثر\' بس يكسر الهوية. وش تسوي؟',
    'The marketer wants something that "sells more" but breaks the identity. What do you do?'),
  q('GD-S-4', 'GRAPHIC_DESIGNER', 'SENIOR', 4, 'TEAM',
    'المدير يفرض فكرة تصميمية غلط. كيف تقنعه؟',
    'The boss imposes a wrong design idea. How do you convince them?'),

  // GD Q5 CULTURE
  q('GD-E-5', 'GRAPHIC_DESIGNER', 'ENTRY', 5, 'CULTURE',
    'عميل يبي تصميم \'غربي\'. وش تسوي؟',
    'A client wants a "Western-style" design. What do you do?'),
  q('GD-M-5', 'GRAPHIC_DESIGNER', 'MID', 5, 'CULTURE',
    'الشركة تبي تغيّر هويتها بشكل جذري. وش تسوي؟',
    'The company wants to radically change its identity. What do you do?'),
  q('GD-S-5', 'GRAPHIC_DESIGNER', 'SENIOR', 5, 'CULTURE',
    'الشركة تبي تصميم يخالف قيم المجتمع. وش موقفك؟',
    'The company wants a design that goes against community values. What\'s your stance?'),

  // GD Q6 TECHNICAL
  q('GD-E-6', 'GRAPHIC_DESIGNER', 'ENTRY', 6, 'TECHNICAL',
    'وش الفرق بين RGB و CMYK؟',
    "What's the difference between RGB and CMYK?"),
  q('GD-M-6', 'GRAPHIC_DESIGNER', 'MID', 6, 'TECHNICAL',
    'وش Grid System؟',
    'What is a Grid System?'),
  q('GD-S-6', 'GRAPHIC_DESIGNER', 'SENIOR', 6, 'TECHNICAL',
    'وش Design System؟',
    'What is a Design System?'),

  // GD Q7 PRESSURE
  q('GD-E-7', 'GRAPHIC_DESIGNER', 'ENTRY', 7, 'PRESSURE',
    'مديرك يبي تصميم بكرة. وش تسوي؟',
    'Your boss wants a design by tomorrow. What do you do?'),
  q('GD-M-7', 'GRAPHIC_DESIGNER', 'MID', 7, 'PRESSURE',
    'حملة ينزلها بكرة وما في تصاميم. وش الخطة؟',
    "A campaign launches tomorrow and there are no designs. What's the plan?"),
  q('GD-S-7', 'GRAPHIC_DESIGNER', 'SENIOR', 7, 'PRESSURE',
    'هوية بصرية كاملة في أسبوع. وش تسوي؟',
    'A complete visual identity in a week. What do you do?'),

  // GD Q8 LEADERSHIP
  q('GD-E-8', 'GRAPHIC_DESIGNER', 'ENTRY', 8, 'LEADERSHIP',
    'زميلك يسرق فكرتك. وش تسوي؟',
    'Your colleague steals your idea. What do you do?'),
  q('GD-M-8', 'GRAPHIC_DESIGNER', 'MID', 8, 'LEADERSHIP',
    'فريقك يتأخر في التسليم. وش الحل؟',
    "Your team is late on delivery. What's the solution?"),
  q('GD-S-8', 'GRAPHIC_DESIGNER', 'SENIOR', 8, 'LEADERSHIP',
    '٢٠ مصمم تحتك. كيف تضمن الجودة؟',
    'You have 20 designers under you. How do you ensure quality?'),

  // GD Q9 TREND
  q('GD-TECH-9', 'GRAPHIC_DESIGNER', 'ENTRY', 9, 'TREND',
    'AI في التصميم — تهديد ولا أداة؟',
    'AI in design — threat or tool?',
    'TECH'),
  q('GD-RETAIL-9', 'GRAPHIC_DESIGNER', 'ENTRY', 9, 'TREND',
    'Motion graphics — ضرورة ولا رفاهية؟',
    'Motion graphics — necessity or luxury?',
    'RETAIL'),
  q('GD-MEDIA-9', 'GRAPHIC_DESIGNER', 'ENTRY', 9, 'TREND',
    'Print vs Digital — وش مستقبل التصميم؟',
    'Print vs Digital — what\'s the future of design?',
    'MEDIA'),

  // GD Q10 CLOSING
  q('GD-E-10', 'GRAPHIC_DESIGNER', 'ENTRY', 10, 'CLOSING',
    'وش تبي تتعلمه السنة الجاية؟',
    'What do you want to learn this coming year?'),
  q('GD-M-10', 'GRAPHIC_DESIGNER', 'MID', 10, 'CLOSING',
    'وش أكبر تحدي واجهته في التصميم؟',
    "What's the biggest challenge you've faced in design?"),
  q('GD-S-10', 'GRAPHIC_DESIGNER', 'SENIOR', 10, 'CLOSING',
    'إذا بنيت قسم تصميم من الصفر. وش تختلف عن اللي قبل؟',
    'If you built a design department from scratch. How would it differ from before?'),


  // ═══════════════════════════════════════════════════════
  // INDUSTRY VARIANT QUESTIONS (Q3, Q6, Q9 per role)
  // ═══════════════════════════════════════════════════════

  // ── SALES_MANAGER industry variants ──
  q('SM-Q3-TECH', 'SALES_MANAGER', 'MID', 3, 'INDUSTRY',
    'عميل تقني يقول \"المنتج غالي\". وش ترد؟',
    'A tech client says "Your product is too expensive". What do you say?', 'TECH'),
  q('SM-Q3-RETAIL', 'SALES_MANAGER', 'MID', 3, 'INDUSTRY',
    'عميل يقارنك بسعر أقل من المنافس. كيف تقنعه؟',
    'A client compares you to a competitor\'s lower price. How do you convince them?', 'RETAIL'),
  q('SM-Q3-HC', 'SALES_MANAGER', 'MID', 3, 'INDUSTRY',
    'مستشفى يرفض العقد بسبب الميزانية. وش تسوي؟',
    'A hospital rejects the contract due to budget. What do you do?', 'HEALTHCARE'),
  q('SM-Q6-TECH', 'SALES_MANAGER', 'MID', 6, 'INDUSTRY',
    'وش الفرق بين SaaS و On-premise في المبيعات؟',
    'What\'s the difference between SaaS and On-premise in sales?', 'TECH'),
  q('SM-Q6-RETAIL', 'SALES_MANAGER', 'MID', 6, 'INDUSTRY',
    'كيف تقيس نجاح حملة ترويجية؟',
    'How do you measure the success of a promotional campaign?', 'RETAIL'),
  q('SM-Q6-HC', 'SALES_MANAGER', 'MID', 6, 'INDUSTRY',
    'وش دور CRM في مبيعات القطاع الصحي؟',
    'What\'s the role of CRM in healthcare sales?', 'HEALTHCARE'),
  q('SM-Q9-TECH', 'SALES_MANAGER', 'MID', 9, 'INDUSTRY',
    'AI يهدد وظائف المبيعات. وش رأيك؟',
    'AI threatens sales jobs. What\'s your take?', 'TECH'),
  q('SM-Q9-RETAIL', 'SALES_MANAGER', 'MID', 9, 'INDUSTRY',
    'التجارة الإلكترونية تقتل المحلات. كيف تتكيف؟',
    'E-commerce is killing physical stores. How do you adapt?', 'RETAIL'),
  q('SM-Q9-HC', 'SALES_MANAGER', 'MID', 9, 'INDUSTRY',
    'التأمين الصحي يتغير. كيف تسوّق منتج جديد؟',
    'Health insurance is changing. How do you market a new product?', 'HEALTHCARE'),

  // ── SOFTWARE_ENGINEER industry variants ──
  q('SE-Q3-FT', 'SOFTWARE_ENGINEER', 'MID', 3, 'INDUSTRY',
    'كيف تحمي بيانات العملاء المالية؟',
    'How do you protect customers\' financial data?', 'FINTECH'),
  q('SE-Q3-EC', 'SOFTWARE_ENGINEER', 'MID', 3, 'INDUSTRY',
    'وش تحديات الدفع الإلكتروني؟',
    'What are the challenges of electronic payments?', 'E-COMMERCE'),
  q('SE-Q3-HT', 'SOFTWARE_ENGINEER', 'MID', 3, 'INDUSTRY',
    'كيف تضمن خصوصية بيانات المرضى؟',
    'How do you ensure patient data privacy?', 'HEALTHTECH'),
  q('SE-Q6-FT', 'SOFTWARE_ENGINEER', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع الـ Webhooks في أنظمة الدفع؟',
    'How do you handle Webhooks in payment systems?', 'FINTECH'),
  q('SE-Q6-EC', 'SOFTWARE_ENGINEER', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع التزامن العالي في التسوق؟',
    'How do you handle high concurrency in e-commerce?', 'E-COMMERCE'),
  q('SE-Q6-HT', 'SOFTWARE_ENGINEER', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع HIPAA في تطبيقات الصحة؟',
    'How do you handle HIPAA in health applications?', 'HEALTHTECH'),
  q('SE-Q9-FT', 'SOFTWARE_ENGINEER', 'MID', 9, 'INDUSTRY',
    'Blockchain — فرصة ولا فقاعة؟',
    'Blockchain — opportunity or bubble?', 'FINTECH'),
  q('SE-Q9-EC', 'SOFTWARE_ENGINEER', 'MID', 9, 'INDUSTRY',
    'Serverless — نعم ولا لا؟',
    'Serverless — yes or no?', 'E-COMMERCE'),
  q('SE-Q9-HT', 'SOFTWARE_ENGINEER', 'MID', 9, 'INDUSTRY',
    'AI تشخيص — أخلاقي ولا لا؟',
    'AI diagnosis — ethical or not?', 'HEALTHTECH'),

  // ── MARKETING_SPECIALIST industry variants ──
  q('MK-Q3-TECH', 'MARKETING_SPECIALIST', 'MID', 3, 'INDUSTRY',
    'كيف تسوّق منتج تقني للعميل غير التقني؟',
    'How do you market a tech product to a non-technical customer?', 'TECH'),
  q('MK-Q3-RETAIL', 'MARKETING_SPECIALIST', 'MID', 3, 'INDUSTRY',
    'كيف تسوّق منتج بسعر أعلى من المنافس؟',
    'How do you market a product priced higher than competitors?', 'RETAIL'),
  q('MK-Q3-HC', 'MARKETING_SPECIALIST', 'MID', 3, 'INDUSTRY',
    'كيف تبني ثقة مع جمهور صحي محافظ؟',
    'How do you build trust with a conservative health audience?', 'HEALTHCARE'),
  q('MK-Q6-TECH', 'MARKETING_SPECIALIST', 'MID', 6, 'INDUSTRY',
    'كيف تقيس نجاح Product-Led Growth؟',
    'How do you measure Product-Led Growth success?', 'TECH'),
  q('MK-Q6-RETAIL', 'MARKETING_SPECIALIST', 'MID', 6, 'INDUSTRY',
    'كيف تحسب ROMI للحملات الترويجية؟',
    'How do you calculate ROMI for promotional campaigns?', 'RETAIL'),
  q('MK-Q6-HC', 'MARKETING_SPECIALIST', 'MID', 6, 'INDUSTRY',
    'كيف تقيس نجاح حملات التوعية الصحية؟',
    'How do you measure health awareness campaign success?', 'HEALTHCARE'),
  q('MK-Q9-TECH', 'MARKETING_SPECIALIST', 'MID', 9, 'INDUSTRY',
    'Influencer marketing — فعّال ولا فقاعة؟',
    'Influencer marketing — effective or bubble?', 'TECH'),
  q('MK-Q9-RETAIL', 'MARKETING_SPECIALIST', 'MID', 9, 'INDUSTRY',
    'TikTok Shop يقتل المتاجر. كيف تتكيف؟',
    'TikTok Shop is killing stores. How do you adapt?', 'RETAIL'),
  q('MK-Q9-HC', 'MARKETING_SPECIALIST', 'MID', 9, 'INDUSTRY',
    'التسويق الصحي — أخلاقي ولا استغلال؟',
    'Health marketing — ethical or exploitation?', 'HEALTHCARE'),

  // ── HR_MANAGER industry variants ──
  q('HR-Q3-TECH', 'HR_MANAGER', 'MID', 3, 'INDUSTRY',
    'كيف تتنافس مع Google وAmazon على المواهب؟',
    'How do you compete with Google and Amazon for talent?', 'TECH'),
  q('HR-Q3-RETAIL', 'HR_MANAGER', 'MID', 3, 'INDUSTRY',
    'كيف تخفض دوران الموظفين في التجزئة؟',
    'How do you reduce employee turnover in retail?', 'RETAIL'),
  q('HR-Q3-HC', 'HR_MANAGER', 'MID', 3, 'INDUSTRY',
    'كيف توظف أطباء في مناطق نائية؟',
    'How do you recruit doctors in remote areas?', 'HEALTHCARE'),
  q('HR-Q6-TECH', 'HR_MANAGER', 'MID', 6, 'INDUSTRY',
    'كيف تبني Employer Branding في قطاع التقنية؟',
    'How do you build Employer Branding in tech?', 'TECH'),
  q('HR-Q6-RETAIL', 'HR_MANAGER', 'MID', 6, 'INDUSTRY',
    'كيف تقيس رضا الموظفين في العمل المناوبي؟',
    'How do you measure employee satisfaction in shift work?', 'RETAIL'),
  q('HR-Q6-HC', 'HR_MANAGER', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع تراخيص الممارسة الطبية؟',
    'How do you handle medical licensing requirements?', 'HEALTHCARE'),
  q('HR-Q9-TECH', 'HR_MANAGER', 'MID', 9, 'INDUSTRY',
    'Remote work — مستقبل ولا موضة؟',
    'Remote work — future or fad?', 'TECH'),
  q('HR-Q9-RETAIL', 'HR_MANAGER', 'MID', 9, 'INDUSTRY',
    'Gig economy — تهديد ولا فرصة؟',
    'Gig economy — threat or opportunity?', 'RETAIL'),
  q('HR-Q9-HC', 'HR_MANAGER', 'MID', 9, 'INDUSTRY',
    'AI في التوظيف الطبي — أخلاقي ولا لا؟',
    'AI in medical hiring — ethical or not?', 'HEALTHCARE'),

  // ── ACCOUNTANT industry variants ──
  q('AC-Q3-FT', 'ACCOUNTANT', 'MID', 3, 'INDUSTRY',
    'كيف تتعامل مع العملات الرقمية في المحاسبة؟',
    'How do you handle cryptocurrencies in accounting?', 'FINTECH'),
  q('AC-Q3-RETAIL', 'ACCOUNTANT', 'MID', 3, 'INDUSTRY',
    'كيف تدير مخزون يتغير كل يوم؟',
    'How do you manage inventory that changes daily?', 'RETAIL'),
  q('AC-Q3-HC', 'ACCOUNTANT', 'MID', 3, 'INDUSTRY',
    'كيف تتعامل مع مطالبات التأمين المعقدة؟',
    'How do you handle complex insurance claims?', 'HEALTHCARE'),
  q('AC-Q6-FT', 'ACCOUNTANT', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع IFRS 9 في القطاع المالي؟',
    'How do you handle IFRS 9 in the financial sector?', 'FINTECH'),
  q('AC-Q6-RETAIL', 'ACCOUNTANT', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع حسابات الإيرادات المؤجلة؟',
    'How do you handle deferred revenue accounts?', 'RETAIL'),
  q('AC-Q6-HC', 'ACCOUNTANT', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع محاسبة التكاليف الطبية؟',
    'How do you handle medical cost accounting?', 'HEALTHCARE'),
  q('AC-Q9-FT', 'ACCOUNTANT', 'MID', 9, 'INDUSTRY',
    'Blockchain في المحاسبة — فرصة ولا تهديد؟',
    'Blockchain in accounting — opportunity or threat?', 'FINTECH'),
  q('AC-Q9-RETAIL', 'ACCOUNTANT', 'MID', 9, 'INDUSTRY',
    'Automation في المخزون — نعم ولا لا؟',
    'Automation in inventory — yes or no?', 'RETAIL'),
  q('AC-Q9-HC', 'ACCOUNTANT', 'MID', 9, 'INDUSTRY',
    'AI في الفوترة الطبية — فعّال ولا لا؟',
    'AI in medical billing — effective or not?', 'HEALTHCARE'),

  // ── CUSTOMER_SERVICE industry variants ──
  q('CS-Q3-TEL', 'CUSTOMER_SERVICE', 'MID', 3, 'INDUSTRY',
    'عميل يبغي إلغاء العقد. كيف تردّه؟',
    'A customer wants to cancel their contract. How do you retain them?', 'TELECOM'),
  q('CS-Q3-EC', 'CUSTOMER_SERVICE', 'MID', 3, 'INDUSTRY',
    'عميل استلم منتج مكسور. وش تسوي؟',
    'A customer received a broken product. What do you do?', 'E-COMMERCE'),
  q('CS-Q3-BK', 'CUSTOMER_SERVICE', 'MID', 3, 'INDUSTRY',
    'عميل يفقد حسابه. وش خطواتك؟',
    'A customer loses access to their account. What are your steps?', 'BANKING'),
  q('CS-Q6-TEL', 'CUSTOMER_SERVICE', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع شكاوى تغطية الشبكة؟',
    'How do you handle network coverage complaints?', 'TELECOM'),
  q('CS-Q6-EC', 'CUSTOMER_SERVICE', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع طلبات الاسترجاع المتكررة؟',
    'How do you handle repeated return requests?', 'E-COMMERCE'),
  q('CS-Q6-BK', 'CUSTOMER_SERVICE', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع شكاوى الرسوم المخفية؟',
    'How do you handle hidden fee complaints?', 'BANKING'),
  q('CS-Q9-TEL', 'CUSTOMER_SERVICE', 'MID', 9, 'INDUSTRY',
    'Chatbots — تستبدل البشر ولا تساعدهم؟',
    'Chatbots — replacing humans or helping them?', 'TELECOM'),
  q('CS-Q9-EC', 'CUSTOMER_SERVICE', 'MID', 9, 'INDUSTRY',
    'Social media support — ضرورة ولا رفاهية؟',
    'Social media support — necessity or luxury?', 'E-COMMERCE'),
  q('CS-Q9-BK', 'CUSTOMER_SERVICE', 'MID', 9, 'INDUSTRY',
    'AI في خدمة العملاء — فعّال ولا بارد؟',
    'AI in customer service — effective or cold?', 'BANKING'),

  // ── PROJECT_MANAGER industry variants ──
  q('PM-Q3-CON', 'PROJECT_MANAGER', 'MID', 3, 'INDUSTRY',
    'مقاول فرعي تأخر. وش تسوي؟',
    'A subcontractor is delayed. What do you do?', 'CONSTRUCTION'),
  q('PM-Q3-IT', 'PROJECT_MANAGER', 'MID', 3, 'INDUSTRY',
    'مطوّر رئيسي استقال منتصف المشروع. وش تسوي؟',
    'A lead developer resigned mid-project. What do you do?', 'IT'),
  q('PM-Q3-HC', 'PROJECT_MANAGER', 'MID', 3, 'INDUSTRY',
    'جهة تنظيمية ترفض الترخيص. وش تسوي؟',
    'A regulatory body rejects the license. What do you do?', 'HEALTHCARE'),
  q('PM-Q6-CON', 'PROJECT_MANAGER', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع BIM في مشاريع البناء؟',
    'How do you handle BIM in construction projects?', 'CONSTRUCTION'),
  q('PM-Q6-IT', 'PROJECT_MANAGER', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع DevOps في مشاريع IT؟',
    'How do you handle DevOps in IT projects?', 'IT'),
  q('PM-Q6-HC', 'PROJECT_MANAGER', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع موافقات الجهات الصحية؟',
    'How do you handle health authority approvals?', 'HEALTHCARE'),
  q('PM-Q9-CON', 'PROJECT_MANAGER', 'MID', 9, 'INDUSTRY',
    'BIM — مستقبل ولا رفاهية؟',
    'BIM — future or luxury?', 'CONSTRUCTION'),
  q('PM-Q9-IT', 'PROJECT_MANAGER', 'MID', 9, 'INDUSTRY',
    'Remote teams — فعّالة ولا لا؟',
    'Remote teams — effective or not?', 'IT'),
  q('PM-Q9-HC', 'PROJECT_MANAGER', 'MID', 9, 'INDUSTRY',
    'Agile في المشاريع الطبية — ينفع ولا لا؟',
    'Agile in medical projects — does it work?', 'HEALTHCARE'),

  // ── DATA_ANALYST industry variants ──
  q('DA-Q3-RET', 'DATA_ANALYST', 'MID', 3, 'INDUSTRY',
    'كيف تتنبأ بمبيعات الموسم القادم؟',
    'How do you predict next season\'s sales?', 'RETAIL'),
  q('DA-Q3-FT', 'DATA_ANALYST', 'MID', 3, 'INDUSTRY',
    'كيف تكتشف الاحتيال المالي؟',
    'How do you detect financial fraud?', 'FINTECH'),
  q('DA-Q3-HC', 'DATA_ANALYST', 'MID', 3, 'INDUSTRY',
    'كيف تحلل بيانات المرضى بدون خرق الخصوصية؟',
    'How do you analyze patient data without breaching privacy?', 'HEALTHCARE'),
  q('DA-Q6-RET', 'DATA_ANALYST', 'MID', 6, 'INDUSTRY',
    'كيف تبني نموذج توصية منتجات؟',
    'How do you build a product recommendation model?', 'RETAIL'),
  q('DA-Q6-FT', 'DATA_ANALYST', 'MID', 6, 'INDUSTRY',
    'كيف تبني نموذج Credit Scoring؟',
    'How do you build a Credit Scoring model?', 'FINTECH'),
  q('DA-Q6-HC', 'DATA_ANALYST', 'MID', 6, 'INDUSTRY',
    'كيف تحلل بيانات الأداء الطبي؟',
    'How do you analyze medical performance data?', 'HEALTHCARE'),
  q('DA-Q9-RET', 'DATA_ANALYST', 'MID', 9, 'INDUSTRY',
    'AI في التنبؤ بالمبيعات — دقيق ولا لا؟',
    'AI in sales forecasting — accurate or not?', 'RETAIL'),
  q('DA-Q9-FT', 'DATA_ANALYST', 'MID', 9, 'INDUSTRY',
    'Real-time analytics — ضرورة ولا رفاهية؟',
    'Real-time analytics — necessity or luxury?', 'FINTECH'),
  q('DA-Q9-HC', 'DATA_ANALYST', 'MID', 9, 'INDUSTRY',
    'Predictive health — أخلاقي ولا لا؟',
    'Predictive health — ethical or not?', 'HEALTHCARE'),

  // ── OPERATIONS_MANAGER industry variants ──
  q('OM-Q3-MFG', 'OPERATIONS_MANAGER', 'MID', 3, 'INDUSTRY',
    'آلة رئيسية انكسرت. وش تسوي؟',
    'A main machine broke down. What do you do?', 'MANUFACTURING'),
  q('OM-Q3-LOG', 'OPERATIONS_MANAGER', 'MID', 3, 'INDUSTRY',
    'شحنة ضاعت في الطريق. وش تسوي؟',
    'A shipment was lost in transit. What do you do?', 'LOGISTICS'),
  q('OM-Q3-RET', 'OPERATIONS_MANAGER', 'MID', 3, 'INDUSTRY',
    'مخزون ينفذ في الجمعة البيضاء. وش تسوي؟',
    'Inventory runs out on White Friday. What do you do?', 'RETAIL'),
  q('OM-Q6-MFG', 'OPERATIONS_MANAGER', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع ISO 9001 في التصنيع؟',
    'How do you handle ISO 9001 in manufacturing?', 'MANUFACTURING'),
  q('OM-Q6-LOG', 'OPERATIONS_MANAGER', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع Last-Mile Delivery؟',
    'How do you handle Last-Mile Delivery?', 'LOGISTICS'),
  q('OM-Q6-RET', 'OPERATIONS_MANAGER', 'MID', 6, 'INDUSTRY',
    'كيف تتعامل مع Omnichannel في التجزئة؟',
    'How do you handle Omnichannel in retail?', 'RETAIL'),
  q('OM-Q9-MFG', 'OPERATIONS_MANAGER', 'MID', 9, 'INDUSTRY',
    'Automation — تسرّح البشر ولا تساعدهم؟',
    'Automation — replacing humans or helping them?', 'MANUFACTURING'),
  q('OM-Q9-LOG', 'OPERATIONS_MANAGER', 'MID', 9, 'INDUSTRY',
    'Drone delivery — واقع ولا خيال؟',
    'Drone delivery — reality or fiction?', 'LOGISTICS'),
  q('OM-Q9-RET', 'OPERATIONS_MANAGER', 'MID', 9, 'INDUSTRY',
    'Just-in-time — آمن ولا خطر؟',
    'Just-in-time — safe or risky?', 'RETAIL'),

  // ── GRAPHIC_DESIGNER industry variants ──
  q('GD-Q3-TECH', 'GRAPHIC_DESIGNER', 'MID', 3, 'INDUSTRY',
    'كيف تسوّق منتج تقني بصرياً للعميل العادي؟',
    'How do you visually market a tech product to everyday users?', 'TECH'),
  q('GD-Q3-RETAIL', 'GRAPHIC_DESIGNER', 'MID', 3, 'INDUSTRY',
    'كيف تصمم عرض واجهة يزيد المبيعات ٢٠٪؟',
    'How do you design a storefront display that increases sales 20%?', 'RETAIL'),
  q('GD-Q3-MED', 'GRAPHIC_DESIGNER', 'MID', 3, 'INDUSTRY',
    'كيف تصمم غلاف يبيع مليون نسخة؟',
    'How do you design a cover that sells a million copies?', 'MEDIA'),
  q('GD-Q6-TECH', 'GRAPHIC_DESIGNER', 'MID', 6, 'INDUSTRY',
    'كيف تصمم UI/UX لمنتج SaaS؟',
    'How do you design UI/UX for a SaaS product?', 'TECH'),
  q('GD-Q6-RETAIL', 'GRAPHIC_DESIGNER', 'MID', 6, 'INDUSTRY',
    'كيف تصمم نظام Visual Merchandising؟',
    'How do you design a Visual Merchandising system?', 'RETAIL'),
  q('GD-Q6-MED', 'GRAPHIC_DESIGNER', 'MID', 6, 'INDUSTRY',
    'كيف تصمم غلاف مجلة يزيد المبيعات؟',
    'How do you design a magazine cover that boosts sales?', 'MEDIA'),
  q('GD-Q9-TECH', 'GRAPHIC_DESIGNER', 'MID', 9, 'INDUSTRY',
    'AI في التصميم — تهديد ولا أداة؟',
    'AI in design — threat or tool?', 'TECH'),
  q('GD-Q9-RETAIL', 'GRAPHIC_DESIGNER', 'MID', 9, 'INDUSTRY',
    'Motion graphics — ضرورة ولا رفاهية؟',
    'Motion graphics — necessity or luxury?', 'RETAIL'),
  q('GD-Q9-MED', 'GRAPHIC_DESIGNER', 'MID', 9, 'INDUSTRY',
    'Print vs Digital — وش مستقبل التصميم؟',
    'Print vs Digital — what\'s the future of design?', 'MEDIA'),

]; // END OF ALL QUESTIONS

// ═══════════════════════════════════════════════════════════════════
// METADATA & LOOKUP TABLES
// ═══════════════════════════════════════════════════════════════════

export const ALL_ROLES: Role[] = [
  'SALES_MANAGER',
  'SOFTWARE_ENGINEER',
  'MARKETING_SPECIALIST',
  'HR_MANAGER',
  'ACCOUNTANT',
  'CUSTOMER_SERVICE',
  'PROJECT_MANAGER',
  'DATA_ANALYST',
  'OPERATIONS_MANAGER',
  'GRAPHIC_DESIGNER',
];

export const ROLE_LABELS: Record<Role, { ar: string; en: string }> = {
  SALES_MANAGER:        { ar: 'مدير مبيعات',       en: 'Sales Manager' },
  SOFTWARE_ENGINEER:    { ar: 'مهندس برمجيات',     en: 'Software Engineer' },
  MARKETING_SPECIALIST: { ar: 'أخصائي تسويق',     en: 'Marketing Specialist' },
  HR_MANAGER:           { ar: 'مدير موارد بشرية',  en: 'HR Manager' },
  ACCOUNTANT:           { ar: 'محاسب',            en: 'Accountant' },
  CUSTOMER_SERVICE:     { ar: 'خدمة عملاء',       en: 'Customer Service' },
  PROJECT_MANAGER:      { ar: 'مدير مشاريع',      en: 'Project Manager' },
  DATA_ANALYST:         { ar: 'محلل بيانات',      en: 'Data Analyst' },
  OPERATIONS_MANAGER:   { ar: 'مدير عمليات',      en: 'Operations Manager' },
  GRAPHIC_DESIGNER:     { ar: 'مصمم جرافيك',      en: 'Graphic Designer' },
};

export const INDUSTRIES_BY_ROLE: Record<Role, string[]> = {
  SALES_MANAGER:        ['TECH', 'RETAIL', 'HEALTHCARE'],
  SOFTWARE_ENGINEER:    ['FINTECH', 'E-COMMERCE', 'HEALTHTECH'],
  MARKETING_SPECIALIST: ['TECH', 'RETAIL', 'HEALTHCARE'],
  HR_MANAGER:           ['TECH', 'RETAIL', 'HEALTHCARE'],
  ACCOUNTANT:           ['FINTECH', 'RETAIL', 'HEALTHCARE'],
  CUSTOMER_SERVICE:     ['TELECOM', 'E-COMMERCE', 'BANKING'],
  PROJECT_MANAGER:      ['CONSTRUCTION', 'IT', 'HEALTHCARE'],
  DATA_ANALYST:         ['RETAIL', 'FINTECH', 'HEALTHCARE'],
  OPERATIONS_MANAGER:   ['MANUFACTURING', 'LOGISTICS', 'RETAIL'],
  GRAPHIC_DESIGNER:     ['TECH', 'RETAIL', 'MEDIA'],
};

export const LEVEL_MAP: Record<string, Level> = {
  JUNIOR: 'ENTRY',
  ENTRY: 'ENTRY',
  MID: 'MID',
  MID_LEVEL: 'MID',
  SENIOR: 'SENIOR',
  EXECUTIVE: 'SENIOR',
};

// ═══════════════════════════════════════════════════════════════════
// SELECTION LOGIC
// ═══════════════════════════════════════════════════════════════════

/** Question numbers that use industry variants instead of level variants */
const INDUSTRY_SLOTS = [3, 6, 9];

/**
 * Returns exactly 10 question texts for the given role, level, and industry.
 *
 * For Q3, Q6, Q9 (industry slots):
 *   - If `industry` matches a variant, that variant is used.
 *   - Otherwise, the first available industry variant for that role + slot is used.
 *
 * For all other questions (Q1, Q2, Q4, Q5, Q7, Q8, Q10):
 *   - The question matching `level` is selected.
 */
export function getQuestions(
  role: Role,
  level: Level,
  industry?: string,
  language: 'AR' | 'EN' = 'AR',
): string[] {
  const roleQuestions = questions.filter((q) => q.role === role);
  const result: string[] = [];

  for (let num = 1; num <= 10; num++) {
    let selected: Question | undefined;

    if (INDUSTRY_SLOTS.includes(num)) {
      // Industry-specific slot (Q3, Q6, Q9)
      if (industry) {
        selected = roleQuestions.find(
          (q) => q.questionNumber === num && q.industry === industry,
        );
      }
      // Fallback: pick the first industry variant available
      if (!selected) {
        selected = roleQuestions.find(
          (q) => q.questionNumber === num && q.industry != null,
        );
      }
    } else {
      // Level-specific slot
      selected = roleQuestions.find(
        (q) => q.questionNumber === num && q.level === level,
      );
    }

    if (selected) {
      result.push(language === 'AR' ? selected.textAr : selected.textEn);
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════
// DEMO MODE
// ═══════════════════════════════════════════════════════════════════

/**
 * Returns 11 strings for the interview flow:
 *   [greeting+q1, q2, q3, q4, q5, q6, q7, q8, q9, q10+done]
 *
 * The first message combines the greeting with Q1.
 * The last message combines Q10 with the closing statement.
 */
export function getDemoQuestions(
  role: Role,
  level: Level,
  industry?: string,
  language: 'AR' | 'EN' = 'AR',
): string[] {
  const allQs = getQuestions(role, level, industry, language);
  const greeting = language === 'AR' ? GREETING.ar : GREETING.en;

  // First message: greeting + Q1
  const firstMsg = `${greeting}\n\n${allQs[0]}`;

  // Middle messages: Q2 through Q9
  const middle = allQs.slice(1, 9);

  // Last message: Q10 + closing
  const lastQ = allQs[9];
  const closing =
    language === 'AR'
      ? 'شكراً لك على وقتك. هذا كان آخر سؤال. شكراً لمشاركتك في هذه المقابلة. [INTERVIEW_DONE]'
      : 'Thank you for your time. That was the final question. Thank you for participating in this interview. [INTERVIEW_DONE]';
  const lastMsg = `${lastQ}\n\n${closing}`;

  return [firstMsg, ...middle, lastMsg];
}
