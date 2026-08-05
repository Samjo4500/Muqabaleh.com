export type MemPrequal = {
  id: string;
  userId: string;
  userEmail: string;
  sessionId: string;
  targetRole: string;
  targetRoleAr?: string | null;
  seniorityLevel: string;
  questionTypes: string[];
  interviewRound: string;
  languagePreference: string;
  targetIndustry?: string | null;
  weaknessFocus?: string | null;
  durationPreset: string;
  numQuestions: number;
  estimatedDurationMin: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generatedPlan?: any;
  createdAt: string;
};

export type MemResponse = {
  id: string;
  sessionId: string;
  questionId: string;
  questionOrder: number;
  userAnswer: string;
  contentScore?: number;
  structureScore?: number;
  confidenceScore?: number;
  overallScore?: number;
  feedbackText?: string;
  feedbackTextAr?: string;
  improvementTip?: string;
  improvementTipAr?: string;
  rawAiResponse?: unknown;
  timeTakenSeconds: number;
  startedAt: string;
  completedAt: string;
  followUpCount: number;
  followUpResponses?: unknown;
};

export type MemSession = {
  id: string;
  userId: string;
  prequalId: string;
  status: string;
  language: string;
  numQuestionsTotal: number;
  numQuestionsAnswered: number;
  currentQuestionIndex: number;
  startedAt?: string | null;
  completedAt?: string | null;
  totalDurationSeconds?: number | null;
  overallScore?: number | null;
  strengths: string[];
  weaknesses: string[];
  actionItems?: unknown;
  fullReport?: unknown;
  createdAt: string;
  updatedAt: string;
  responses: MemResponse[];
};

const g = globalThis as unknown as {
  __mqInterviewStore?: {
    prequals: Map<string, MemPrequal>;
    sessions: Map<string, MemSession>;
  };
};

function store() {
  if (!g.__mqInterviewStore) {
    g.__mqInterviewStore = {
      prequals: new Map(),
      sessions: new Map(),
    };
  }
  return g.__mqInterviewStore;
}

export const memoryStore = {
  savePrequal(p: MemPrequal) {
    store().prequals.set(p.id, p);
  },
  getPrequal(id: string) {
    return store().prequals.get(id) ?? null;
  },
  findPrequalByClientSession(sessionId: string) {
    for (const p of store().prequals.values()) {
      if (p.sessionId === sessionId) return p;
    }
    return null;
  },
  saveSession(s: MemSession) {
    store().sessions.set(s.id, s);
  },
  getSession(id: string) {
    return store().sessions.get(id) ?? null;
  },
  findSessionByPrequal(prequalId: string) {
    for (const s of store().sessions.values()) {
      if (s.prequalId === prequalId) return s;
    }
    return null;
  },
  listSessions(userId: string) {
    return [...store().sessions.values()]
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};

/** Minimal bilingual bank used when DB questions are unavailable */
export const FALLBACK_QUESTIONS = [
  {
    id: 'fb-1',
    questionText: 'Tell me about yourself.',
    questionTextAr: 'حدّثني عن نفسك.',
    questionType: 'behavioral',
    difficulty: 'easy',
    timeLimitSeconds: 90,
    coachingTips: ['Present → past → future', 'Keep under 90 seconds'],
    followUpQuestions: [
      { text: 'What part of your background is most relevant to this role?', textAr: 'أي جزء من خلفيتك الأكثر صلة بهذا الدور؟' },
    ],
    evaluationRubric: { clarity: 3, relevance: 3, confidence: 2, structure: 2 },
    usageCount: 0,
    roleCategory: 'general',
    seniorityLevel: 'entry',
    interviewRound: 'phone_screen',
  },
  {
    id: 'fb-2',
    questionText: 'What is your greatest strength?',
    questionTextAr: 'ما هي أعظم نقاط قوتك؟',
    questionType: 'behavioral',
    difficulty: 'easy',
    timeLimitSeconds: 90,
    coachingTips: ['Back strength with a concrete example'],
    followUpQuestions: [
      { text: 'Can you share a recent example that proves this strength?', textAr: 'هل يمكنك مشاركة مثال حديث يثبت هذه القوة؟' },
    ],
    evaluationRubric: { specificity: 3, evidence: 3, relevance: 2, delivery: 2 },
    usageCount: 0,
    roleCategory: 'general',
    seniorityLevel: 'entry',
    interviewRound: 'phone_screen',
  },
  {
    id: 'fb-3',
    questionText: 'What is your greatest weakness?',
    questionTextAr: 'ما هي أكبر نقاط ضعفك؟',
    questionType: 'behavioral',
    difficulty: 'medium',
    timeLimitSeconds: 120,
    coachingTips: ['Show self-awareness and improvement actions'],
    followUpQuestions: [
      { text: 'What steps have you taken to improve this?', textAr: 'ما الخطوات التي اتخذتها لتحسين ذلك؟' },
    ],
    evaluationRubric: { honesty: 3, growth: 3, professionalism: 2, structure: 2 },
    usageCount: 0,
    roleCategory: 'general',
    seniorityLevel: 'entry',
    interviewRound: 'phone_screen',
  },
  {
    id: 'fb-4',
    questionText: 'Tell me about a time you faced a conflict at work.',
    questionTextAr: 'أخبرني عن مرة واجهت فيها خلافاً في العمل.',
    questionType: 'behavioral',
    difficulty: 'medium',
    timeLimitSeconds: 180,
    coachingTips: ['Use STAR and focus on resolution'],
    followUpQuestions: [
      { text: 'What would you do differently next time?', textAr: 'ماذا ستفعل بشكل مختلف في المرة القادمة؟' },
    ],
    evaluationRubric: { situation: 2, action: 3, result: 3, maturity: 2 },
    usageCount: 0,
    roleCategory: 'general',
    seniorityLevel: 'mid',
    interviewRound: 'behavioral',
  },
  {
    id: 'fb-5',
    questionText: 'What is the difference between REST and GraphQL?',
    questionTextAr: 'ما الفرق بين REST و GraphQL؟',
    questionType: 'technical',
    difficulty: 'easy',
    timeLimitSeconds: 120,
    coachingTips: ['Compare trade-offs, not just definitions'],
    followUpQuestions: [
      { text: 'When would you choose GraphQL over REST?', textAr: 'متى تختار GraphQL بدل REST؟' },
    ],
    evaluationRubric: { accuracy: 3, tradeoffs: 3, clarity: 2, examples: 2 },
    usageCount: 0,
    roleCategory: 'software_engineer',
    seniorityLevel: 'entry',
    interviewRound: 'technical',
  },
  {
    id: 'fb-6',
    questionText: 'How do you prioritize features?',
    questionTextAr: 'كيف تحدد أولويات الميزات؟',
    questionType: 'technical',
    difficulty: 'easy',
    timeLimitSeconds: 150,
    coachingTips: ['Mention impact, effort, and stakeholders'],
    followUpQuestions: [
      { text: 'How do you handle conflicting stakeholder priorities?', textAr: 'كيف تتعامل مع تعارض أولويات أصحاب المصلحة؟' },
    ],
    evaluationRubric: { framework: 3, stakeholders: 3, metrics: 2, clarity: 2 },
    usageCount: 0,
    roleCategory: 'product_manager',
    seniorityLevel: 'entry',
    interviewRound: 'technical',
  },
  {
    id: 'fb-7',
    questionText: 'How do you handle rejection?',
    questionTextAr: 'كيف تتعامل مع الرفض؟',
    questionType: 'behavioral',
    difficulty: 'easy',
    timeLimitSeconds: 120,
    coachingTips: ['Show resilience and learning'],
    followUpQuestions: [
      { text: 'Tell me about a specific rejection that taught you something.', textAr: 'أخبرني عن رفض محدد علّمك شيئاً.' },
    ],
    evaluationRubric: { resilience: 3, learning: 3, attitude: 2, structure: 2 },
    usageCount: 0,
    roleCategory: 'sales',
    seniorityLevel: 'entry',
    interviewRound: 'phone_screen',
  },
  {
    id: 'fb-8',
    questionText: 'What kind of work environment do you thrive in?',
    questionTextAr: 'في أي بيئة عمل تزدهر؟',
    questionType: 'cultural_fit',
    difficulty: 'easy',
    timeLimitSeconds: 90,
    coachingTips: ['Be honest and connect to the company culture'],
    followUpQuestions: [
      { text: 'What would make you leave a workplace?', textAr: 'ما الذي قد يدفعك لمغادرة مكان العمل؟' },
    ],
    evaluationRubric: { authenticity: 3, alignment: 3, clarity: 2, professionalism: 2 },
    usageCount: 0,
    roleCategory: 'general',
    seniorityLevel: 'entry',
    interviewRound: 'phone_screen',
  },
  {
    id: 'fb-9',
    questionText: 'Your engineering team says a feature will take 3 months. Your CEO wants it in 6 weeks. What do you do?',
    questionTextAr: 'يقول فريق الهندسة إن الميزة تحتاج ٣ أشهر، والمدير التنفيذي يريدها خلال ٦ أسابيع. ماذا تفعل؟',
    questionType: 'situational',
    difficulty: 'hard',
    timeLimitSeconds: 240,
    coachingTips: ['Negotiate scope, risk, and communication'],
    followUpQuestions: [
      { text: 'How do you communicate trade-offs to the CEO?', textAr: 'كيف توصل المقايضات إلى المدير التنفيذي؟' },
    ],
    evaluationRubric: { judgment: 3, communication: 3, prioritization: 2, leadership: 2 },
    usageCount: 0,
    roleCategory: 'product_manager',
    seniorityLevel: 'mid',
    interviewRound: 'behavioral',
  },
  {
    id: 'fb-10',
    questionText: 'What are your salary expectations?',
    questionTextAr: 'ما توقعاتك للراتب؟',
    questionType: 'salary',
    difficulty: 'medium',
    timeLimitSeconds: 120,
    coachingTips: ['Give a researched range and total compensation view'],
    followUpQuestions: [
      { text: 'How flexible are you on base versus equity/benefits?', textAr: 'ما مدى مرونتك بين الراتب الأساسي والمزايا/الأسهم؟' },
    ],
    evaluationRubric: { research: 3, range: 3, professionalism: 2, clarity: 2 },
    usageCount: 0,
    roleCategory: 'general',
    seniorityLevel: 'mid',
    interviewRound: 'final',
  },
  {
    id: 'fb-11',
    questionText: 'Explain Big O notation.',
    questionTextAr: 'اشرح مفهوم Big O.',
    questionType: 'technical',
    difficulty: 'easy',
    timeLimitSeconds: 120,
    coachingTips: ['Use a simple example like sorting or search'],
    followUpQuestions: [
      { text: 'What is the Big O of binary search?', textAr: 'ما هو Big O للبحث الثنائي؟' },
    ],
    evaluationRubric: { accuracy: 4, examples: 3, clarity: 3 },
    usageCount: 0,
    roleCategory: 'software_engineer',
    seniorityLevel: 'entry',
    interviewRound: 'technical',
  },
  {
    id: 'fb-12',
    questionText: 'How do you measure the success of a marketing campaign?',
    questionTextAr: 'كيف تقيس نجاح حملة تسويقية؟',
    questionType: 'technical',
    difficulty: 'easy',
    timeLimitSeconds: 150,
    coachingTips: ['Tie metrics to business goals'],
    followUpQuestions: [
      { text: 'Which leading vs lagging indicators do you watch?', textAr: 'أي مؤشرات رائدة ومتأخرة تراقبها؟' },
    ],
    evaluationRubric: { metrics: 3, business: 3, clarity: 2, examples: 2 },
    usageCount: 0,
    roleCategory: 'marketing_manager',
    seniorityLevel: 'entry',
    interviewRound: 'technical',
  },
  {
    id: 'fb-13',
    questionText: 'How do you handle missing data?',
    questionTextAr: 'كيف تتعامل مع البيانات المفقودة؟',
    questionType: 'technical',
    difficulty: 'easy',
    timeLimitSeconds: 150,
    coachingTips: ['Discuss diagnosis before imputation'],
    followUpQuestions: [
      { text: 'When would you drop rows versus impute values?', textAr: 'متى تحذف الصفوف ومتى تعوّض القيم؟' },
    ],
    evaluationRubric: { method: 3, rigor: 3, communication: 2, examples: 2 },
    usageCount: 0,
    roleCategory: 'data_analyst',
    seniorityLevel: 'entry',
    interviewRound: 'technical',
  },
  {
    id: 'fb-14',
    questionText: 'Your manager asks you to do something unethical. What do you do?',
    questionTextAr: 'يطلب منك مديرك فعل شيء غير أخلاقي. ماذا تفعل؟',
    questionType: 'situational',
    difficulty: 'hard',
    timeLimitSeconds: 180,
    coachingTips: ['Show integrity and process awareness'],
    followUpQuestions: [
      { text: 'Who would you escalate to and why?', textAr: 'لمن ستصعّد الأمر ولماذا؟' },
    ],
    evaluationRubric: { ethics: 4, judgment: 3, communication: 3 },
    usageCount: 0,
    roleCategory: 'general',
    seniorityLevel: 'mid',
    interviewRound: 'behavioral',
  },
  {
    id: 'fb-15',
    questionText: 'Where do you see yourself in 5 years?',
    questionTextAr: 'أين ترى نفسك خلال ٥ سنوات؟',
    questionType: 'behavioral',
    difficulty: 'medium',
    timeLimitSeconds: 120,
    coachingTips: ['Connect growth goals to the role'],
    followUpQuestions: [
      { text: 'What skills do you want to develop to get there?', textAr: 'ما المهارات التي تريد تطويرها للوصول إلى ذلك؟' },
    ],
    evaluationRubric: { ambition: 3, realism: 3, alignment: 2, clarity: 2 },
    usageCount: 0,
    roleCategory: 'general',
    seniorityLevel: 'entry',
    interviewRound: 'behavioral',
  },
];
