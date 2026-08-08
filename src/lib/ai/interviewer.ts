/**
 * Muqabaleh AI Interviewer
 * Prefers Gemini (GEMINI_API_KEY), then heuristic scoring. No OpenAI.
 */

export type FeedbackResult = {
  contentScore: number;
  structureScore: number;
  confidenceScore: number;
  overallScore: number;
  feedbackText: string;
  feedbackTextAr: string;
  improvementTip: string;
  improvementTipAr: string;
  followUpQuestion?: string | null;
  followUpQuestionAr?: string | null;
  strengths: string[];
  weaknesses: string[];
  raw: unknown;
};

export type InterviewerContext = {
  role: string;
  level: string;
  round: string;
  language: string;
  industry?: string | null;
  weakness?: string | null;
  question: string;
  questionType: string;
  timeLimit: number;
  timeTaken: number;
  answer: string;
  isFollowUp?: boolean;
  /** Company-specific mock from jobs portal — practice only */
  companyName?: string | null;
  roleTitle?: string | null;
  jobDescription?: string | null;
};

const SYSTEM_PROMPT = `You are an expert AI interviewer for Muqabaleh, an AI-powered mock interview platform.

RULES:
1. Ask questions exactly as provided. Do not rephrase unless user asks for clarification.
2. After user answers, provide feedback: Content (0-10), Structure (0-10), Confidence (0-10).
3. Give 1 specific improvement tip per answer.
4. If answer is weak (overall < 6), ask a follow-up to dig deeper.
5. Tone: professional but encouraging.
6. Language: adapt to interview language setting.
7. Arabic: use formal Modern Standard Arabic (Fusha) with professional business tone.
8. Time: note if over time.
9. NEVER give the "perfect answer" during interview — save for final report.
10. If user says "I don't know," coach: "That's okay. How would you approach finding the answer?"

Respond ONLY with valid JSON in this shape:
{
  "contentScore": 0-10,
  "structureScore": 0-10,
  "confidenceScore": 0-10,
  "overallScore": 0-10,
  "feedbackText": "2-3 sentences constructive feedback in English",
  "feedbackTextAr": "نفس الملاحظات بالعربية الفصحى",
  "improvementTip": "1 specific actionable tip in English",
  "improvementTipAr": "نصيحة عملية واحدة بالعربية",
  "followUpQuestion": "optional follow-up in English or null",
  "followUpQuestionAr": "متابعة اختيارية بالعربية أو null",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1"]
}`;

function clampScore(n: unknown, fallback = 6): number {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(10, Math.round(v * 10) / 10));
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function heuristicFeedback(ctx: InterviewerContext): FeedbackResult {
  const words = ctx.answer.trim().split(/\s+/).filter(Boolean).length;
  const lower = ctx.answer.toLowerCase();
  const hasStar =
    /situation|task|action|result|موقف|مهمة|إجراء|نتيجة/.test(lower) ||
    words > 80;
  const content = Math.min(9.5, 4 + Math.min(words / 25, 4) + (hasStar ? 1 : 0));
  const structure = hasStar ? 7.5 : words > 40 ? 6 : 4.5;
  const confidence = words < 15 ? 4 : words > 60 ? 7.5 : 6.5;
  const overall = Math.round(((content + structure + confidence) / 3) * 10) / 10;
  const weak = overall < 6;
  const ar = ctx.language === 'arabic' || ctx.language === 'bilingual';

  return {
    contentScore: clampScore(content),
    structureScore: clampScore(structure),
    confidenceScore: clampScore(confidence),
    overallScore: clampScore(overall),
    feedbackText: weak
      ? 'Your answer has a useful starting point, but it needs more concrete evidence and a clearer structure. Anchor the story in a specific situation and end with a measurable result.'
      : 'Solid answer with relevant points. You communicated clearly; tightening structure and quantifying impact would make it even stronger.',
    feedbackTextAr: weak
      ? 'إجابتك نقطة انطلاق جيدة، لكنها تحتاج أدلة ملموسة وهيكل أوضح. اربط القصة بموقف محدد واختم بنتيجة قابلة للقياس.'
      : 'إجابة متينة ونقاط ذات صلة. التواصل واضح؛ تحسين الهيكل وقياس الأثر سيجعلها أقوى.',
    improvementTip: hasStar
      ? 'Add one metric (time saved, revenue, quality) to prove impact.'
      : 'Rewrite using STAR: Situation, Task, Action, Result — under two minutes.',
    improvementTipAr: hasStar
      ? 'أضف مقياساً واحداً (وقت موفر، إيراد، جودة) لإثبات الأثر.'
      : 'أعد الصياغة بإطار STAR: الموقف، المهمة، الإجراء، النتيجة — في أقل من دقيقتين.',
    followUpQuestion: weak
      ? 'Can you walk me through a specific example with the outcome you achieved?'
      : null,
    followUpQuestionAr: weak
      ? 'هل يمكنك شرح مثال محدد مع النتيجة التي حققتها؟'
      : null,
    strengths: words > 40 ? ['Relevant content', 'Willingness to elaborate'] : ['Engagement'],
    weaknesses: weak ? ['Needs more structure', 'Thin evidence'] : ['Could quantify impact'],
    raw: { mode: 'heuristic', words, ar },
  };
}

async function callGemini(system: string, user: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const client = new GoogleGenerativeAI(key);
    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: system,
    });
    const result = await model.generateContent(user);
    return result.response.text() || null;
  } catch {
    return null;
  }
}

function normalizeFeedback(parsed: Record<string, unknown>, ctx: InterviewerContext): FeedbackResult {
  const contentScore = clampScore(parsed.contentScore);
  const structureScore = clampScore(parsed.structureScore);
  const confidenceScore = clampScore(parsed.confidenceScore);
  const overallScore = clampScore(
    parsed.overallScore ?? (contentScore + structureScore + confidenceScore) / 3,
  );
  const fallback = heuristicFeedback(ctx);
  return {
    contentScore,
    structureScore,
    confidenceScore,
    overallScore,
    feedbackText: String(parsed.feedbackText || fallback.feedbackText),
    feedbackTextAr: String(parsed.feedbackTextAr || fallback.feedbackTextAr),
    improvementTip: String(parsed.improvementTip || fallback.improvementTip),
    improvementTipAr: String(parsed.improvementTipAr || fallback.improvementTipAr),
    followUpQuestion:
      overallScore < 6
        ? (parsed.followUpQuestion as string | null | undefined) ?? fallback.followUpQuestion
        : (parsed.followUpQuestion as string | null | undefined) ?? null,
    followUpQuestionAr:
      overallScore < 6
        ? (parsed.followUpQuestionAr as string | null | undefined) ??
          fallback.followUpQuestionAr
        : (parsed.followUpQuestionAr as string | null | undefined) ?? null,
    strengths: Array.isArray(parsed.strengths)
      ? (parsed.strengths as string[]).slice(0, 3)
      : fallback.strengths,
    weaknesses: Array.isArray(parsed.weaknesses)
      ? (parsed.weaknesses as string[]).slice(0, 2)
      : fallback.weaknesses,
    raw: parsed,
  };
}

export async function evaluateAnswer(ctx: InterviewerContext): Promise<FeedbackResult> {
  if (!ctx.answer?.trim()) {
    return {
      ...heuristicFeedback({ ...ctx, answer: 'I do not know' }),
      contentScore: 2,
      structureScore: 2,
      confidenceScore: 3,
      overallScore: 2.3,
      feedbackText:
        "That's okay if you're unsure. Share how you would approach finding the answer — interviewers value problem-solving process.",
      feedbackTextAr:
        'لا بأس إن لم تكن متأكداً. شارك كيف ستبحث عن الإجابة — المحاورون يقدّرون أسلوب حل المشكلات.',
      improvementTip: 'Outline 2–3 steps you would take to investigate the answer.',
      improvementTipAr: 'ارسم خطوتين إلى ثلاث خطوات لكيفية البحث عن الإجابة.',
      followUpQuestion: 'How would you approach finding the answer?',
      followUpQuestionAr: 'كيف ستتعامل مع إيجاد الإجابة؟',
    };
  }

  const companyBlock =
    ctx.companyName && ctx.roleTitle
      ? `
COMPANY-SPECIFIC MOCK (candidate is practicing for a real listing — they will apply themselves):
- Target company: ${ctx.companyName}
- Target role title: ${ctx.roleTitle}
- Role snippet: ${ctx.jobDescription || 'n/a'}
Score answers for fit to THIS company and role. Prefer feedback that references the employer/role when relevant.`
      : '';

  const userPrompt = `
CONTEXT:
- Role: ${ctx.role}
- Level: ${ctx.level}
- Round: ${ctx.round}
- Language: ${ctx.language}
- Industry: ${ctx.industry || 'n/a'}
- Weakness Focus: ${ctx.weakness || 'n/a'}
- Current Question: ${ctx.question}
- Question Type: ${ctx.questionType}
- Time Limit: ${ctx.timeLimit}s
- Time Taken: ${ctx.timeTaken}s
- Is Follow-up answer: ${ctx.isFollowUp ? 'yes' : 'no'}
${companyBlock}

CANDIDATE ANSWER:
"""
${ctx.answer}
"""

Evaluate and return JSON only.`;

  const geminiText = await callGemini(SYSTEM_PROMPT, userPrompt);
  if (geminiText) {
    const parsed = extractJson(geminiText);
    if (parsed && typeof parsed === 'object') {
      return normalizeFeedback(parsed as Record<string, unknown>, ctx);
    }
  }

  return heuristicFeedback(ctx);
}
