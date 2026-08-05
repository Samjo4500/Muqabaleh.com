import { hashSync } from 'bcryptjs';
import { db } from '../src/lib/db';

const INDUSTRIES = ['IT', 'FINANCE', 'MEDICINE', 'ENGINEERING', 'EDUCATION', 'MARKETING', 'SALES', 'HR'] as const;

// Helper: JSON array field for SQLite adaptation
const ja = (arr: string[]) => JSON.stringify(arr);

// Questions bank
const questions: { textAr: string; textEn: string; industry: string; type: string; difficulty: string; category: string }[] = [];

const behavioralQs: Record<string, { ar: string; en: string; cat: string }[]> = {
  IT: [
    { ar: 'أخبرني عن مرة واجهت فيها مشكلة تقنية معقدة في مشروع. كيف تعاملت معها؟', en: 'Tell me about a time you faced a complex technical problem in a project. How did you handle it?', cat: 'problem-solving' },
    { ar: 'صف موقفاً اضطررت فيه لتعلم تقنية جديدة بسرعة لتسليم مشروع.', en: 'Describe a situation where you had to learn a new technology quickly to deliver a project.', cat: 'adaptability' },
    { ar: 'كيف تتعامل مع الاختلافات مع زملاء الفريق في القرارات التقنية؟', en: 'How do you handle disagreements with team members on technical decisions?', cat: 'teamwork' },
    { ar: 'أخبرني عن أهم إنجاز تقني حققته في عملك السابق.', en: 'Tell me about your most significant technical achievement in your previous role.', cat: 'achievement' },
    { ar: 'كيف تدير أولوياتك عند العمل على عدة مشاريع في نفس الوقت؟', en: 'How do you manage priorities when working on multiple projects simultaneously?', cat: 'time-management' },
  ],
  FINANCE: [
    { ar: 'أخبرني عن قرار مالي اتخذته كان له تأثير كبير على المؤسسة.', en: 'Tell me about a financial decision you made that had a significant impact on the organization.', cat: 'decision-making' },
    { ar: 'كيف تتعامل مع ضغوط إعداد التقارير المالية في مواعيد محددة؟', en: 'How do you handle the pressure of preparing financial reports under tight deadlines?', cat: 'stress-management' },
    { ar: 'صف موقفاً اكتشفت فيه خطأ مالي. ماذا فعلت؟', en: 'Describe a situation where you discovered a financial error. What did you do?', cat: 'integrity' },
    { ar: 'كيف تشرح مفاهيم مالية معقدة لغير المتخصصين؟', en: 'How do you explain complex financial concepts to non-specialists?', cat: 'communication' },
    { ar: 'أخبرني عن تجربتك في إعداد الميزانية التشغيلية.', en: 'Tell me about your experience in preparing operational budgets.', cat: 'planning' },
  ],
  MEDICINE: [
    { ar: 'أخبرني عن موقف طبي حرج واجهته. كيف تعاملت معه؟', en: 'Tell me about a critical medical situation you faced. How did you handle it?', cat: 'crisis-management' },
    { ar: 'كيف تتعامل مع مريض لا يتفق مع خطة العلاج المقترحة؟', en: 'How do you handle a patient who disagrees with the proposed treatment plan?', cat: 'communication' },
    { ar: 'صف موقفاً تعلمت فيه من خطأ مهني.', en: 'Describe a situation where you learned from a professional mistake.', cat: 'learning' },
    { ar: 'كيف توازن بين الجودة وسرعة تقديم الرعاية الصحية؟', en: 'How do you balance quality and speed in healthcare delivery?', cat: 'prioritization' },
    { ar: 'أخبرني عن تجربتك في العمل ضمن فريق طبي متعدد التخصصات.', en: 'Tell me about your experience working in a multidisciplinary medical team.', cat: 'teamwork' },
  ],
  ENGINEERING: [
    { ar: 'أخبرني عن مشروع هندسي واجهت فيه تحديات غير متوقعة.', en: 'Tell me about an engineering project where you faced unexpected challenges.', cat: 'problem-solving' },
    { ar: 'كيف تضمن جودة العمل في مشاريعك الهندسية؟', en: 'How do you ensure quality in your engineering projects?', cat: 'quality' },
    { ar: 'صف تجربتك في إدارة فريق هندسي.', en: 'Describe your experience managing an engineering team.', cat: 'leadership' },
    { ar: 'أخبرني عن مرة اخترعت فيها حلاً إبداعياً لمشكلة هندسية.', en: 'Tell me about a time you invented a creative solution to an engineering problem.', cat: 'innovation' },
    { ar: 'كيف تدير المخاطر في المشاريع الهندسية الكبيرة؟', en: 'How do you manage risks in large engineering projects?', cat: 'risk-management' },
  ],
  EDUCATION: [
    { ar: 'كيف تتعامل مع طالب لا يستجيب للأساليب التقليدية في التدريس؟', en: 'How do you handle a student who does not respond to traditional teaching methods?', cat: 'adaptability' },
    { ar: 'أخبرني عن ابتكار تربوي قدمته وأثبت فعاليته.', en: 'Tell me about an educational innovation you introduced that proved effective.', cat: 'innovation' },
    { ar: 'كيف تقيّم تقدم الطلاب بشكل عادل؟', en: 'How do you assess student progress fairly?', cat: 'assessment' },
    { ar: 'صف موقفاً تعاملت فيه مع أولياء أمور متطلبين.', en: 'Describe a situation where you dealt with demanding parents.', cat: 'communication' },
    { ar: 'كيف تدمج التقنية في عملية التعليم؟', en: 'How do you integrate technology into the teaching process?', cat: 'technology' },
  ],
  MARKETING: [
    { ar: 'أخبرني عن حملة تسويقية ناجحة قمت بتخطيطها وتنفيذها.', en: 'Tell me about a successful marketing campaign you planned and executed.', cat: 'achievement' },
    { ar: 'كيف تقيس فعالية جهودك التسويقية؟', en: 'How do you measure the effectiveness of your marketing efforts?', cat: 'analytics' },
    { ar: 'صف موقفاً اضطررت فيه لتغيير استراتيجية تسويقية في منتصف الحملة.', en: 'Describe a situation where you had to change a marketing strategy mid-campaign.', cat: 'adaptability' },
    { ar: 'كيف تبني علامة تجارية قوية في سوق تنافسي؟', en: 'How do you build a strong brand in a competitive market?', cat: 'branding' },
    { ar: 'أخبرني عن تجربتك مع التسويق الرقمي ومواقع التواصل الاجتماعي.', en: 'Tell me about your experience with digital marketing and social media.', cat: 'digital' },
  ],
  SALES: [
    { ar: 'أخبرني عن أكبر صفقة حققتها. كيف خططت لها؟', en: 'Tell me about the biggest deal you closed. How did you plan for it?', cat: 'achievement' },
    { ar: 'كيف تتعامل مع رفض العميل المتكرر؟', en: 'How do you handle repeated customer rejection?', cat: 'resilience' },
    { ar: 'صف استراتيجيتك لبناء علاقات طويلة الأمد مع العملاء.', en: 'Describe your strategy for building long-term customer relationships.', cat: 'relationship-building' },
    { ar: 'كيف تتعرف على احتياجات العميل غير المعلنة؟', en: 'How do you identify a customer\'s unspoken needs?', cat: 'discovery' },
    { ar: 'أخبرني عن مرة فزت فيها بعميل من منافس قوي.', en: 'Tell me about a time you won a client from a strong competitor.', cat: 'competition' },
  ],
  HR: [
    { ar: 'أخبرني عن عملية توظيف ناجحة قمت بإدارتها من البداية للنهاية.', en: 'Tell me about a successful recruitment process you managed from start to finish.', cat: 'recruitment' },
    { ar: 'كيف تتعامل مع نزاع بين موظفين في الفريق؟', en: 'How do you handle a conflict between team members?', cat: 'conflict-resolution' },
    { ar: 'صف استراتيجيتك لتطوير المواهب في المؤسسة.', en: 'Describe your talent development strategy in the organization.', cat: 'talent-development' },
    { ar: 'كيف تضمن الامتثال لسياسات الموارد البشرية؟', en: 'How do you ensure compliance with HR policies?', cat: 'compliance' },
    { ar: 'أخبرني عن تجربتك في إدارة عملية تسريح الموظفين.', en: 'Tell me about your experience managing employee layoff processes.', cat: 'difficult-situations' },
  ],
};

const technicalQs: Record<string, { ar: string; en: string; cat: string }[]> = {
  IT: [
    { ar: 'ما الفرق بين SQL و NoSQL؟ متى تستخدم كل منهما؟', en: 'What is the difference between SQL and NoSQL? When would you use each?', cat: 'databases' },
    { ar: 'اشرح مفهوم الحاويات (Containers) وفوائدها في التطوير.', en: 'Explain the concept of Containers and their benefits in development.', cat: 'devops' },
    { ar: 'ما هي استراتيجيات التخزين المؤقت (caching) وكيف تختار الأنسب؟', en: 'What are caching strategies and how do you choose the most suitable one?', cat: 'architecture' },
    { ar: 'كيف تضمن أمان واجهة برمجية (API)؟ اذكر ٣ طرق على الأقل.', en: 'How do you secure an API? Mention at least 3 methods.', cat: 'security' },
    { ar: 'اشرح مبدأ REST وكيف تصمم واجهة RESTful جيدة.', en: 'Explain the REST principle and how to design a good RESTful API.', cat: 'api-design' },
  ],
  FINANCE: [
    { ar: 'كيف تقوم بتحليل القوائم المالية الثلاث الرئيسية؟', en: 'How do you analyze the three main financial statements?', cat: 'financial-analysis' },
    { ar: 'ما هي المؤشرات المالية الرئيسية التي تتابعها في الشركة؟', en: 'What are the key financial indicators you track in a company?', cat: 'kpis' },
    { ar: 'اشرح مفهوم التدفق النقدي الحر وأهميته.', en: 'Explain the concept of Free Cash Flow and its importance.', cat: 'cash-flow' },
    { ar: 'كيف تقيم المخاطر المالية في مشروع استثماري؟', en: 'How do you assess financial risks in an investment project?', cat: 'risk-assessment' },
    { ar: 'ما الفرق بين المحاسبة المالية والإدارية؟', en: 'What is the difference between financial and managerial accounting?', cat: 'accounting' },
  ],
  MEDICINE: [
    { ar: 'ما هي بروتوكولات التعامل مع حالات الطوارئ القلبية؟', en: 'What are the protocols for handling cardiac emergencies?', cat: 'emergency' },
    { ar: 'كيف تقرأ وتفسر نتائج التحاليل المخبرية الشائعة؟', en: 'How do you read and interpret common lab test results?', cat: 'diagnostics' },
    { ar: 'ما هي أحدث تطورات الطب الدقيق؟', en: 'What are the latest developments in precision medicine?', cat: 'modern-medicine' },
    { ar: 'اشرح مبادئ Evidence-Based Medicine وكيف تطبقها.', en: 'Explain the principles of Evidence-Based Medicine and how you apply them.', cat: 'ebm' },
    { ar: 'كيف تدير حالات الألم المزمن لدى المرضى؟', en: 'How do you manage chronic pain cases in patients?', cat: 'patient-care' },
  ],
  ENGINEERING: [
    { ar: 'ما هي مراحل دورة حياة المشروع الهندسي؟', en: 'What are the phases of an engineering project lifecycle?', cat: 'project-management' },
    { ar: 'كيف تجري تحليل الإجهاد والانفعال في التصميم الهيكلي؟', en: 'How do you perform stress and strain analysis in structural design?', cat: 'structural' },
    { ar: 'ما هي معايير الجودة ISO ذات الصلة بمجالك؟', en: 'What are the relevant ISO quality standards in your field?', cat: 'quality' },
    { ar: 'اشرح مفهوم التصميم المستدام في الهندسة.', en: 'Explain the concept of sustainable design in engineering.', cat: 'sustainability' },
    { ar: 'كيف تحسب الأحمال والأحمال الحرجة في المشاريع؟', en: 'How do you calculate loads and critical loads in projects?', cat: 'calculations' },
  ],
  EDUCATION: [
    { ar: 'ما هي النظريات التعليمية الأكثر تأثيراً في التعليم الحديث؟', en: 'What are the most influential learning theories in modern education?', cat: 'theory' },
    { ar: 'كيف تصمم اختباراً تقييمياً فعالاً؟', en: 'How do you design an effective assessment test?', cat: 'assessment-design' },
    { ar: 'ما دور التقنية في تحسين نتائج التعلم؟', en: 'What is the role of technology in improving learning outcomes?', cat: 'edtech' },
    { ar: 'كيف تتعامل مع الطلاب ذوي الاحتياجات الخاصة في الفصل؟', en: 'How do you handle students with special needs in the classroom?', cat: 'inclusion' },
    { ar: 'اشرح مفهوم التعلم التمايزي وكيف تطبقه.', en: 'Explain the concept of differentiated learning and how you apply it.', cat: 'differentiation' },
  ],
  MARKETING: [
    { ar: 'ما هي استراتيجيات تحسين محركات البحث (SEO) الحديثة؟', en: 'What are modern Search Engine Optimization (SEO) strategies?', cat: 'seo' },
    { ar: 'كيف تبني رحلة العميل (Customer Journey) الفعالة؟', en: 'How do you build an effective Customer Journey?', cat: 'customer-experience' },
    { ar: 'ما الفرق بين التسويق بالمحتوى والتسويق الرقمي؟', en: 'What is the difference between content marketing and digital marketing?', cat: 'strategy' },
    { ar: 'كيف تحلل بيانات التسويق لاتخاذ قرارات مبنية على الأدلة؟', en: 'How do you analyze marketing data to make evidence-based decisions?', cat: 'data-analytics' },
    { ar: 'اشرح مفهوم عائد الاستثمار التسويقي (MROI) وكيف تحسبه.', en: 'Explain Marketing ROI (MROI) and how you calculate it.', cat: 'metrics' },
  ],
  SALES: [
    { ar: 'ما هي مراحل دورة المبيعات وكيف تدير كل مرحلة؟', en: 'What are the stages of the sales cycle and how do you manage each?', cat: 'sales-process' },
    { ar: 'كيف تبني خط أنابيب المبيعات (Sales Pipeline) فعالاً؟', en: 'How do you build an effective Sales Pipeline?', cat: 'pipeline' },
    { ar: 'ما هي تقنيات التفاوض المتقدمة في المبيعات؟', en: 'What are advanced negotiation techniques in sales?', cat: 'negotiation' },
    { ar: 'كيف تستخدم CRM لإدارة علاقات العملاء؟', en: 'How do you use CRM to manage customer relationships?', cat: 'crm' },
    { ar: 'اشرح مفهءم B2B مقابل B2C في استراتيجيات البيع.', en: 'Explain B2B vs B2C in sales strategies.', cat: 'strategy' },
  ],
  HR: [
    { ar: 'ما هي أفضل الممارسات في عملية التوظيف والاختيار؟', en: 'What are best practices in recruitment and selection?', cat: 'recruitment' },
    { ar: 'كيف تصمم برنامج تقييم أداء فعالاً؟', en: 'How do you design an effective performance appraisal program?', cat: 'performance' },
    { ar: 'ما هي قوانين العمل الأساسية التي يجب معرفتها؟', en: 'What are the fundamental labor laws one should know?', cat: 'compliance' },
    { ar: 'كيف تحسب تكاليف الموظف الكلية؟', en: 'How do you calculate total employee costs?', cat: 'compensation' },
    { ar: 'اشرح استراتيجيات الاحتفاظ بالمواهب في المؤسسة.', en: 'Explain talent retention strategies in an organization.', cat: 'retention' },
  ],
};

// Build question arrays
for (const ind of INDUSTRIES) {
  const difficulties = ['EASY', 'MEDIUM', 'HARD', 'EASY', 'MEDIUM'];
  const behQs = behavioralQs[ind] || [];
  const techQs = technicalQs[ind] || [];
  behQs.forEach((q, i) => {
    questions.push({ textAr: q.ar, textEn: q.en, industry: ind, type: 'BEHAVIORAL', difficulty: difficulties[i] || 'MEDIUM', category: q.cat });
  });
  techQs.forEach((q, i) => {
    questions.push({ textAr: q.ar, textEn: q.en, industry: ind, type: 'TECHNICAL', difficulty: difficulties[i] || 'MEDIUM', category: q.cat });
  });
}

// Interviewer seed data
const interviewers = [
  { name: 'هدى السالم', email: 'huda@interviewer.com', slug: 'huda-al-salem', bioAr: 'مديرة موارد بشرية سابقة في شركة اتصالات كبرى بخبرة ١٢ عاماً. متخصصة في المقابلات السلوكية وتقييم الكفاءات القيادية.', bioEn: 'Former HR Director at a major telecom company with 12 years of experience. Specialized in behavioral interviews and leadership competency assessment.', title: 'مديرة موارد بشرية سابقة', industries: ['HR', 'MARKETING', 'SALES'], languages: ['ar', 'en'], years: 12, price: 4900, rating: 492 },
  { name: 'ياسر الغامدي', email: 'yasser@interviewer.com', slug: 'yasser-al-ghamdi', bioAr: 'مهندس برمجيات أول سابق في شركة تقنية رائدة. خبير في المقابلات التقنية وخوارزميات البيانات.', bioEn: 'Former Senior Software Engineer at a leading tech company. Expert in technical interviews and data algorithms.', title: 'مهندس برمجيات أول', industries: ['IT', 'ENGINEERING'], languages: ['ar', 'en'], years: 8, price: 4900, rating: 488 },
  { name: 'رنا العتيبي', email: 'rana@interviewer.com', slug: 'rana-al-otaibi', bioAr: 'مديرة تسويق رقمي سابقة في وكالة إعلانية دولية. متخصصة في تقييم مهارات التسويق الرقمي والتواصل.', bioEn: 'Former Digital Marketing Manager at an international ad agency. Specialized in assessing digital marketing and communication skills.', title: 'مديرة تسويق رقمي', industries: ['MARKETING', 'SALES'], languages: ['ar', 'en'], years: 7, price: 4900, rating: 485 },
  { name: 'سلطان الدوسري', email: 'sultan@interviewer.com', slug: 'sultan-al-dosari', bioAr: 'مدير مالي سابق في بنك خليجي. خبرة واسعة في المقابلات المالية وتحليل القوائم المالية.', bioEn: 'Former Finance Manager at a Gulf bank. Extensive experience in financial interviews and financial statement analysis.', title: 'مدير مالي', industries: ['FINANCE', 'HR'], languages: ['ar'], years: 15, price: 5900, rating: 493 },
  { name: 'منى القحطاني', email: 'mona@interviewer.com', slug: 'mona-al-qahtani', bioAr: 'طبيبة ومديرة تعليم طبي سابقة. متخصصة في مقابلات القطاع الطبي والأكاديمي.', bioEn: 'Physician and former medical education director. Specialized in medical and academic sector interviews.', title: 'طبيبة ومديرة تعليم طبي', industries: ['MEDICINE', 'EDUCATION'], languages: ['ar', 'en'], years: 10, price: 4900, rating: 478 },
  { name: 'خالد الشهري', email: 'khalid@interviewer.com', slug: 'khalid-al-shahri', bioAr: 'مهندس مدني سابق ورئيس قسم مشاريع. خبير في مقابلات القطاع الهندسي وإدارة المشاريع.', bioEn: 'Former Civil Engineer and Head of Projects. Expert in engineering sector interviews and project management.', title: 'مهندس مدني ورئيس مشاريع', industries: ['ENGINEERING', 'IT'], languages: ['ar'], years: 13, price: 4900, rating: 480 },
];

const pendingInterviewers = [
  { name: 'لمى الحربي', email: 'lama@interviewer.com', slug: 'lama-al-harbi', bioAr: 'مصممة تجربة مستخدم سابقة في شركة تقنية ناشئة.', bioEn: 'Former UX Designer at a tech startup.', title: 'مصممة تجربة مستخدم', industries: ['IT', 'MARKETING'], languages: ['ar', 'en'], years: 4, price: 4900, rating: 0 },
  { name: 'عمر المالكي', email: 'omar@interviewer.com', slug: 'omar-al-maliki', bioAr: 'محاسب قانوني يعمل على تأسيس مسيرة مهنية في التقييم المهني.', bioEn: 'Certified accountant building a career in professional assessment.', title: 'محاسب قانوني', industries: ['FINANCE'], languages: ['ar'], years: 6, price: 3900, rating: 0 },
];

async function seed() {
  console.log('🌱 Starting seed...');

  // 1. Admin
  const admin = await db.user.upsert({
    where: { email: 'admin@muqabaleh.com' },
    update: {},
    create: {
      email: 'admin@muqabaleh.com',
      passwordHash: hashSync('admin123', 12),
      name: 'مدير النظام',
      role: 'SUPER_ADMIN',
      accountType: 'INDIVIDUAL',
      sessionsLeft: 999,
      tier: 'UNLIMITED',
      isActive: true,
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  // 2. Seed company
  const seedCompany = await db.company.upsert({
    where: { id: 'seed-company-001' },
    update: {},
    create: {
      id: 'seed-company-001',
      name: 'شركة المستقبل التقنية',
      size: 'MEDIUM',
      industry: 'IT',
      country: 'SA',
      plan: 'B2B_PRO',
      credits: 25,
    },
  });

  const companyAdmin = await db.user.upsert({
    where: { email: 'company@seed.com' },
    update: {},
    create: {
      email: 'company@seed.com',
      passwordHash: hashSync('company123', 12),
      name: 'سارة المهيري',
      role: 'COMPANY_ADMIN',
      accountType: 'B2B',
      companyId: seedCompany.id,
      country: 'SA',
      industry: 'IT',
      sessionsLeft: 0,
    },
  });
  console.log(`  ✓ Company: ${seedCompany.name} (admin: ${companyAdmin.email})`);

  // 3. Regular user
  const regularUser = await db.user.upsert({
    where: { email: 'user@seed.com' },
    update: {},
    create: {
      email: 'user@seed.com',
      passwordHash: hashSync('user123', 12),
      name: 'أحمد الخالدي',
      role: 'USER',
      accountType: 'INDIVIDUAL',
      country: 'SA',
      industry: 'IT',
      experience: 'MID',
      sessionsLeft: 3,
      language: 'AR',
    },
  });
  console.log(`  ✓ User: ${regularUser.email} (${regularUser.sessionsLeft} sessions)`);

  // 4. Interviewers (marketplace model — InterviewerProfile removed)
  for (const intv of interviewers) {
    const user = await db.user.upsert({
      where: { email: intv.email },
      update: {},
      create: {
        email: intv.email,
        passwordHash: hashSync('interviewer123', 12),
        name: intv.name,
        role: 'INTERVIEWER',
        accountType: 'INDIVIDUAL',
        sessionsLeft: 0,
        tier: 'FREE',
      },
    });

    const existing = await db.interviewer.findUnique({ where: { userId: user.id } });
    const interviewer =
      existing ??
      (await db.interviewer.create({
        data: {
          userId: user.id,
          slug: intv.slug,
          fullName: intv.name,
          bioAr: intv.bioAr,
          bioEn: intv.bioEn,
          industries: ja(intv.industries),
          languages: ja(intv.languages),
          yearsExperience: intv.years,
          currentTitle: intv.title,
          specialties: ja(intv.industries),
          sessionPriceUsdCents: intv.price,
          hourlyRate: intv.price,
          status: 'ACTIVE',
          rating: intv.rating / 100,
          totalInterviews: Math.floor(Math.random() * 50) + 20,
          ndaAcceptedAt: new Date(),
          timezone: 'Asia/Riyadh',
        },
      }));

    // Weekly availability slots (Sun–Thu)
    const slotCount = await db.interviewerAvailability.count({
      where: { interviewerId: interviewer.id },
    });
    if (slotCount === 0) {
      for (let d = 0; d < 5; d++) {
        await db.interviewerAvailability.create({
          data: {
            interviewerId: interviewer.id,
            dayOfWeek: d,
            startTime: '09:00',
            endTime: '12:00',
            isAvailable: true,
          },
        });
        await db.interviewerAvailability.create({
          data: {
            interviewerId: interviewer.id,
            dayOfWeek: d,
            startTime: '14:00',
            endTime: '17:00',
            isAvailable: true,
          },
        });
      }
    }
    console.log(`  ✓ Interviewer: ${intv.name} (${intv.slug})`);
  }

  // 5. Pending interviewers
  for (const intv of pendingInterviewers) {
    const user = await db.user.upsert({
      where: { email: intv.email },
      update: {},
      create: {
        email: intv.email,
        passwordHash: hashSync('interviewer123', 12),
        name: intv.name,
        role: 'INTERVIEWER',
        accountType: 'INDIVIDUAL',
        sessionsLeft: 0,
        tier: 'FREE',
      },
    });

    const existing = await db.interviewer.findUnique({ where: { userId: user.id } });
    if (!existing) {
      await db.interviewer.create({
        data: {
          userId: user.id,
          slug: intv.slug,
          fullName: intv.name,
          bioAr: intv.bioAr,
          bioEn: intv.bioEn,
          industries: ja(intv.industries),
          languages: ja(intv.languages),
          yearsExperience: intv.years,
          currentTitle: intv.title,
          specialties: ja(intv.industries),
          sessionPriceUsdCents: intv.price,
          hourlyRate: intv.price,
          status: 'PENDING',
          ndaAcceptedAt: new Date(),
          timezone: 'Asia/Riyadh',
        },
      });
    }
    console.log(`  ⏳ Pending interviewer: ${intv.name}`);
  }

  // 6. Questions
  let qCount = 0;
  for (const q of questions) {
    await db.question.create({ data: q });
    qCount++;
  }
  console.log(`  ✓ Questions: ${qCount}`);

  // 7. Sample completed interviews for regular user
  const sampleInterviews = [
    {
      industry: 'IT', type: 'BEHAVIORAL', experience: 'MID',
      overallScore: 91, content: 94, clarity: 90, confidence: 87, cultural: 92,
      feedback: 'أظهر المرشح قدرة ممتازة على شرح تجاربه التقنية بشكل منظم ومقنع. إجاباته كانت شاملة ومحددة مع أمثلة واضحة من الواقع. يُنصح بالتركيز أكثر على عرض الأثر الكمي للإنجازات.',
      strengths: ja(['القدرة على التواصل التقني بوضوح', 'استخدام أمثلة واقعية', 'الترتيب المنظم للأفكار']),
      improvements: ja(['إضافة أرقام وقياسات للإنجازات', 'تقصير الإجابات قليلاً']),
      recommendation: 'RECOMMENDED', verificationId: 'MQBL-DEMO-2026-001',
    },
    {
      industry: 'IT', type: 'TECHNICAL', experience: 'MID',
      overallScore: 78, content: 82, clarity: 75, confidence: 73, cultural: 80,
      feedback: 'أظهر المرشح فهماً جيداً للمفاهيم التقنية الأساسية. يحتاج لتحسين العمق في بعض المجالات المتخصصة والأجوبة كانت أحياناً عامة.',
      strengths: ja(['فهم أساسيات قوي', 'قدرة جيدة على ربط المفاهيم']),
      improvements: ja(['زيادة العمق التقني', 'ممارسة الأسئلة المتقدمة', 'تحسين السرعة في الرد']),
      recommendation: 'CONSIDER', verificationId: 'MQBL-DEMO-2026-002',
    },
  ];

  for (const sample of sampleInterviews) {
    const interview = await db.interview.create({
      data: {
        userId: regularUser.id,
        mode: 'AI',
        type: sample.type,
        industry: sample.industry,
        experience: sample.experience,
        language: 'AR',
        status: 'COMPLETED',
        overallScore: sample.overallScore,
        contentScore: sample.content,
        clarityScore: sample.clarity,
        confidenceScore: sample.confidence,
        culturalFitScore: sample.cultural,
        feedback: sample.feedback,
        strengths: sample.strengths,
        improvements: sample.improvements,
        recommendation: sample.recommendation,
        sessionDebited: true,
        verificationId: sample.verificationId,
        expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
      },
    });

    // Add sample messages
    const msgs = [
      { role: 'INTERVIEWER', content: 'مرحباً أحمد! أنا فهد، محاورك الذكي. سأطرح عليك بعض أسئلة المقابلة في مجال تقنية المعلومات. هل أنت مستعد؟', seq: 1 },
      { role: 'CANDIDATE', content: 'أهلاً! نعم، أنا مستعد تماماً. يسعدني أن أبدأ.', seq: 2 },
      { role: 'INTERVIEWER', content: 'ممتاز. أخبرني عن مشروع تقني عملت عليه مؤخراً وتعتز به. ما كان دورك وما التحديات التي واجهتها؟', seq: 3 },
      { role: 'CANDIDATE', content: 'عملت على تطوير منصة إلكترونية لتجارة التجزئة. كنت مسؤولاً عن واجهة المستخدم وربطها مع واجهة برمجية الخلفية. التحدي الرئيسي كان تحسين أداء التطبيق مع زيادة عدد المستخدمين.', seq: 4 },
      { role: 'INTERVIEWER', content: 'كيف تعاملت مع تحدي الأداء؟ وما النتائج التي حققتها؟', seq: 5 },
      { role: 'CANDIDATE', content: 'استخدمت تقنيات التخزين المؤقت وضغط الصور وتحسين الاستعلامات. النتيجة كانت تحسناً بنسبة ٤٠٪ في سرعة التحميل وانخفاض معدل الارتداد بنسبة ٢٥٪.', seq: 6 },
      { role: 'INTERVIEWER', content: 'رائع! كيف تتعامل مع الاختلافات مع زملاء الفريق في القرارات التقنية؟', seq: 7 },
      { role: 'CANDIDATE', content: 'أؤمن بالحوار المفتوح. عادةً أعرض حجتي مع أدلة تقنية. إذا لم نتوصل لاتفاق، نختبر كلا الحلين بيانياً أو نستشير طرفاً ثالثاً من الفريق.', seq: 8 },
    ];
    for (const m of msgs) {
      await db.message.create({
        data: { interviewId: interview.id, role: m.role, content: m.content, sequence: m.seq },
      });
    }
    console.log(`  ✓ Interview: ${sample.verificationId} (score: ${sample.overallScore})`);
  }

  // 8. Demo company
  const demoCompany = await db.company.upsert({
    where: { id: 'demo-company-001' },
    update: {},
    create: {
      id: 'demo-company-001',
      name: 'شركة تجريبية - Demo',
      size: 'LARGE',
      industry: 'IT',
      country: 'AE',
      plan: 'B2B_PRO',
      credits: 50,
    },
  });

  const demoAdmin = await db.user.upsert({
    where: { email: 'demo@muqabaleh.com' },
    update: {},
    create: {
      email: 'demo@muqabaleh.com',
      passwordHash: hashSync('demo123', 12),
      name: 'محمد التجريبي',
      role: 'COMPANY_ADMIN',
      accountType: 'B2B',
      companyId: demoCompany.id,
      country: 'AE',
      industry: 'IT',
      sessionsLeft: 0,
    },
  });

  // Demo B2B Jobs
  const demoJob1 = await db.b2BJob.create({
    data: {
      companyId: demoCompany.id,
      title: 'مدير تسويق رقمي',
      industry: 'MARKETING',
      type: 'BEHAVIORAL',
      mode: 'AI',
      assignmentMode: 'AUTO',
      createdById: demoAdmin.id,
    },
  });

  const demoJob2 = await db.b2BJob.create({
    data: {
      companyId: demoCompany.id,
      title: 'مطور واجهات أمامية',
      industry: 'IT',
      type: 'TECHNICAL',
      mode: 'AI',
      assignmentMode: 'AUTO',
      createdById: demoAdmin.id,
    },
  });

  // Demo candidates for job 1
  const demoCandidates = ['نورة الحربي', 'فيصل العمري', 'لمى السيد', 'عبدالله الشمري', 'سارة القحطاني', 'محمد الأحمدي'];
  for (let i = 0; i < demoCandidates.length; i++) {
    const score = 65 + Math.floor(Math.random() * 30);
    await db.interview.create({
      data: {
        companyId: demoCompany.id,
        b2bJobId: demoJob1.id,
        guestName: demoCandidates[i],
        mode: 'AI',
        type: 'BEHAVIORAL',
        industry: 'MARKETING',
        language: 'AR',
        status: 'COMPLETED',
        overallScore: score,
        contentScore: Math.min(100, score + Math.floor(Math.random() * 10) - 5),
        clarityScore: Math.min(100, score + Math.floor(Math.random() * 10) - 5),
        confidenceScore: Math.min(100, score + Math.floor(Math.random() * 10) - 5),
        culturalFitScore: Math.min(100, score + Math.floor(Math.random() * 10) - 5),
        feedback: `تقييم تلقائي للمرشح ${demoCandidates[i]}. أظهر أداءً جيداً في المقابلة.`,
        strengths: ja(['تواصل جيد', 'إجابات منظمة']),
        improvements: ja(['تحسين العمق في الإجابات']),
        recommendation: score >= 80 ? 'RECOMMENDED' : score >= 70 ? 'CONSIDER' : 'NOT_RECOMMENDED',
        sessionDebited: true,
      },
    });
  }

  console.log(`  ✓ Demo company: ${demoCompany.name} (${demoCandidates.length} candidates)`);

  try {
    const { seedInterviewQuestions } = await import('./seed-interview-questions');
    await seedInterviewQuestions(db as never);
  } catch (err) {
    console.warn('  ⚠ Interview question seed skipped:', err);
  }

  console.log('\n✅ Seed complete!');
  console.log('\nCredentials:');
  console.log('  Admin:      admin@muqabaleh.com / admin123');
  console.log('  User:       user@seed.com / user123');
  console.log('  Company:    company@seed.com / company123');
  console.log('  Demo:       demo@muqabaleh.com / demo123');
  console.log('  Interviewer: huda@interviewer.com / interviewer123');
}

seed()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => void db.$disconnect());
