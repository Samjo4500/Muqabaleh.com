// ─── Muqabaleh AI Engine ───
// Integrates z-ai-web-dev-sdk for LLM, TTS, and ASR
// IMPORTANT: This module MUST only be used server-side

import ZAI from 'z-ai-web-dev-sdk';
import { db } from './db';
import crypto from 'crypto';

// ─── ZAI Singleton ───
let _zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
async function getZAI() {
  if (!_zai) _zai = await ZAI.create();
  return _zai;
}

// ─── Types ───
export interface InterviewParams {
  interviewerGender: 'MALE' | 'FEMALE';
  type: 'BEHAVIORAL' | 'TECHNICAL';
  industry: string;
  experience: string;
  language: 'AR' | 'EN';
}

export interface MessageRow {
  role: string;
  content: string;
  sequence: number;
}

export interface QuestionResult {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  done: boolean;
}

export interface EvaluationResult {
  overallScore: number;
  contentScore: number;
  clarityScore: number;
  confidenceScore: number;
  culturalFitScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  recommendation: 'RECOMMENDED' | 'CONSIDER' | 'NOT_RECOMMENDED';
}

const TOTAL_QUESTIONS = 7;
const EXPERIENCE_LABELS_AR: Record<string, string> = {
  JUNIOR: 'مبتدئ (0-2 سنوات)',
  MID: 'متوسط (3-6 سنوات)',
  SENIOR: 'أقدم (7-10 سنوات)',
  EXECUTIVE: 'تنفيذي (10+ سنوات)',
};
const EXPERIENCE_LABELS_EN: Record<string, string> = {
  JUNIOR: 'Junior (0-2 years)',
  MID: 'Mid-level (3-6 years)',
  SENIOR: 'Senior (7-10 years)',
  EXECUTIVE: 'Executive (10+ years)',
};

// ─── System Prompt Builder ───
export function buildSystemPrompt(params: InterviewParams): string {
  const isAr = params.language === 'AR';
  const interviewerName = params.interviewerGender === 'MALE' ? 'فهد' : 'نورة';
  const expLabel = isAr
    ? (EXPERIENCE_LABELS_AR[params.experience] || params.experience)
    : (EXPERIENCE_LABELS_EN[params.experience] || params.experience);

  const typeInstructions = isAr
    ? params.type === 'BEHAVIORAL'
      ? `نوع المقابلة: سلوكية. اتبع منهجية STAR (Situation, Task, Action, Result) في متابعة إجابات المرشح. اطلب أمثلة محددة من الواقع.`
      : `نوع المقابلة: تقنية. اطرح أسئلة في مجال ${params.industry} بمستوى ${expLabel}. تحقق من العمق التقني والفهم العملي.`
    : params.type === 'BEHAVIORAL'
      ? `Interview type: Behavioral. Follow the STAR methodology (Situation, Task, Action, Result) in follow-ups. Ask for specific real-world examples.`
      : `Interview type: Technical. Ask questions in the ${params.industry} field at ${expLabel} level. Verify technical depth and practical understanding.`;

  return isAr
    ? `أنت ${interviewerName}، محاور مهني دافئ ومحترم في منصة مقابلة (Muqabaleh). أن تجري مقابلة وظيفية ${params.type === 'BEHAVIORAL' ? 'سلوكية' : 'تقنية'} لمتخصص في مجال ${params.industry} بمستوى خبرة ${expLabel}.

القواعد الصارمة:
1. اطرح سؤالاً واحداً فقط في كل رسالة.
2. كن ودوداً ومحترفاً — استخدم اللغة العربية الفصحى مع لمسة دافئة.
3. لا تكرر الأسئلة أبداً.
4. استمع لإجابة المرشاح وأتبعها بسؤال متابعة مناسب أو سؤال جديد.
5. ${typeInstructions}
6. اطرح بالضبط ${TOTAL_QUESTIONS} أسئلة ثم اختم المقابلة بشكر مهذب.
7. عندما تطرح السؤال الأخير (السؤال رقم ${TOTAL_QUESTIONS})، قل: "شكراً لك على وقتك. هذا كان آخر سؤال. شكراً لمشاركتك في هذه المقابلة." وأضف في نهاية رسالتك: [INTERVIEW_DONE]
8. لا تُظهر [INTERVIEW_DONE] أبداً إلا في السؤال الأخير.
9. لا تُظهر أي شيء بين أقواس معقوفة غير [INTERVIEW_DONE].
10. اجعل أسئلتك متنوعة: بداية، متابعة، سيناريوهات، تحديات، إنجازات.
11. إذا كانت إجابة المرشاح قصيرة جداً، اطلب التوضيح بأدب.
12. لا تبدأ رسائلك بأي علامة ترقيم أو تنسيق — ابدأ بالكلام مباشرة.`
    : `You are ${interviewerName === 'فهد' ? 'Fahd' : 'Noora'}, a warm and professional interviewer on the Muqabaleh platform. You are conducting a ${params.type === 'BEHAVIORAL' ? 'behavioral' : 'technical'} interview for a ${params.industry} specialist at ${expLabel} level.

Strict rules:
1. Ask exactly ONE question per message.
2. Be warm and professional.
3. Never repeat questions.
4. Listen to the candidate's answer and follow up appropriately or ask a new question.
5. ${typeInstructions}
6. Ask exactly ${TOTAL_QUESTIONS} questions, then conclude the interview with a polite thank you.
7. When you ask the last question (question #${TOTAL_QUESTIONS}), say: "Thank you for your time. That was the final question. Thank you for participating in this interview." and add at the end of your message: [INTERVIEW_DONE]
8. Never show [INTERVIEW_DONE] except on the very last question.
9. Never show anything in brackets other than [INTERVIEW_DONE].
10. Make questions varied: opening, follow-up, scenarios, challenges, achievements.
11. If the candidate's answer is too short, politely ask for clarification.
12. Do not start your messages with any punctuation or formatting — start speaking directly.`;
}

// ─── Count interviewer questions ───
function countInterviewerQuestions(messages: MessageRow[]): number {
  return messages.filter(m => m.role === 'INTERVIEWER').length;
}

// ─── Fetch questions from bank for context ───
async function fetchQuestionBank(industry: string, type: string, language: string): Promise<string[]> {
  const questions = await db.question.findMany({
    where: { industry, type, isActive: true },
    take: 10,
  });
  return questions.map(q => language === 'AR' ? q.textAr : q.textEn);
}

// ─── Generate Next Question / Continue Interview ───
export async function generateInterviewResponse(
  interviewId: string,
  candidateMessage: string,
  params: InterviewParams,
): Promise<QuestionResult> {
  const zai = await getZAI();

  // Fetch all messages for context
  const dbMessages = await db.message.findMany({
    where: { interviewId },
    orderBy: { sequence: 'asc' },
  });

  const messageRows: MessageRow[] = dbMessages.map(m => ({
    role: m.role,
    content: m.content,
    sequence: m.sequence,
  }));

  const questionCount = countInterviewerQuestions(messageRows);

  // If we already have enough questions, return done
  if (questionCount >= TOTAL_QUESTIONS) {
    return { question: '', questionNumber: TOTAL_QUESTIONS, totalQuestions: TOTAL_QUESTIONS, done: true };
  }

  // Build conversation for LLM
  const systemPrompt = buildSystemPrompt(params);
  const questionBank = await fetchQuestionBank(params.industry, params.type, params.language);
  const bankContext = questionBank.length > 0
    ? (params.language === 'AR'
      ? `\n\nبنك أسئلة المرجعي (استلهم منها دون تكرارها حرفياً):\n${questionBank.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : `\n\nReference question bank (draw inspiration without verbatim repetition):\n${questionBank.map((q, i) => `${i + 1}. ${q}`).join('\n')}`)
    : '';

  // Build messages array for LLM
  const llmMessages: { role: string; content: string }[] = [
    { role: 'assistant', content: systemPrompt + bankContext },
  ];

  for (const msg of messageRows) {
    llmMessages.push({
      role: msg.role === 'INTERVIEWER' ? 'assistant' : 'user',
      content: msg.content,
    });
  }

  // Add the new candidate message
  llmMessages.push({ role: 'user', content: candidateMessage });

  // Call LLM
  const completion = await zai.chat.completions.create({
    messages: llmMessages,
    thinking: { type: 'disabled' },
  });

  let responseText = completion.choices[0]?.message?.content || '';

  // Check if interview is done
  const isDone = responseText.includes('[INTERVIEW_DONE]');
  responseText = responseText.replace(/\[INTERVIEW_DONE\]/g, '').trim();

  // Save messages to DB
  const nextSeq = (dbMessages[dbMessages.length - 1]?.sequence || 0) + 1;

  await db.message.create({
    data: {
      interviewId,
      role: 'CANDIDATE',
      content: candidateMessage,
      sequence: nextSeq,
    },
  });

  await db.message.create({
    data: {
      interviewId,
      role: 'INTERVIEWER',
      content: responseText,
      sequence: nextSeq + 1,
    },
  });

  return {
    question: responseText,
    questionNumber: questionCount + 1,
    totalQuestions: TOTAL_QUESTIONS,
    done: isDone,
  };
}

// ─── Start Interview (first question) ───
export async function startInterview(
  interviewId: string,
  params: InterviewParams,
): Promise<QuestionResult> {
  const zai = await getZAI();

  const systemPrompt = buildSystemPrompt(params);
  const questionBank = await fetchQuestionBank(params.industry, params.type, params.language);
  const bankContext = questionBank.length > 0
    ? (params.language === 'AR'
      ? `\n\nبنك أسئلة المرجعي (استلهم منها دون تكرارها حرفياً):\n${questionBank.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : `\n\nReference question bank (draw inspiration without verbatim repetition):\n${questionBank.map((q, i) => `${i + 1}. ${q}`).join('\n')}`)
    : '';

  const isAr = params.language === 'AR';
  const openingPrompt = isAr
    ? 'ابدأ المقابلة بتحية دافئة وسؤالك الأول. لا تُظهر [INTERVIEW_DONE] — هذه بداية المقابلة فقط.'
    : 'Start the interview with a warm greeting and your first question. Do not show [INTERVIEW_DONE] — this is just the beginning.';

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: systemPrompt + bankContext },
      { role: 'user', content: openingPrompt },
    ],
    thinking: { type: 'disabled' },
  });

  const responseText = (completion.choices[0]?.message?.content || '').replace(/\[INTERVIEW_DONE\]/g, '').trim();

  // Save the first interviewer message
  await db.message.create({
    data: {
      interviewId,
      role: 'INTERVIEWER',
      content: responseText,
      sequence: 1,
    },
  });

  return {
    question: responseText,
    questionNumber: 1,
    totalQuestions: TOTAL_QUESTIONS,
    done: false,
  };
}

// ─── Evaluation ───
const EVAL_SYSTEM_PROMPT_AR = `أنت مقيّم مقابلات وظيفية محترف. قيّم أداء المرشح بناءً على الأسئلة والأجوبة التالية.
أعد نتيجة JSON فقط بدون أي نص إضافي. الشكل المطلوب:
{
  "overallScore": number (0-100),
  "contentScore": number (0-100),
  "clarityScore": number (0-100),
  "confidenceScore": number (0-100),
  "culturalFitScore": number (0-100),
  "feedback": "فقرتان-ثلاث بالعربية الفصحى عن الأداء العام",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2", "نقطة قوة 3"],
  "improvements": ["نقطة تحسين 1", "نقطة تحسين 2", "نقطة تحسين 3"],
  "recommendation": "RECOMMENDED" أو "CONSIDER" أو "NOT_RECOMMENDED"
}

معايير التقييم:
- contentScore: جودة المحتوى، عمق الإجابات، استخدام أمثلة محددة
- clarityScore: وضوح التعبير، التنظيم المنطقي، الإيجاز
- confidenceScore: الثقة بالنفس، المبادرة، القدرة على التعامل مع الأسئلة الصعبة
- culturalFitScore: التوافق الثقافي، الاحترام، اللباقة
- overallScore: المتوسط المرجّح (المحتوى 30%، الوضوح 25%، الثقة 25%، الملاءمة 20%)

أعد JSON فقط. لا تضف أي نص قبله أو بعده.`;

const EVAL_SYSTEM_PROMPT_EN = `You are a professional interview evaluator. Evaluate the candidate's performance based on the questions and answers below.
Return JSON only without any additional text. Required format:
{
  "overallScore": number (0-100),
  "contentScore": number (0-100),
  "clarityScore": number (0-100),
  "confidenceScore": number (0-100),
  "culturalFitScore": number (0-100),
  "feedback": "2-3 paragraphs about overall performance",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "recommendation": "RECOMMENDED" or "CONSIDER" or "NOT_RECOMMENDED"
}

Evaluation criteria:
- contentScore: Content quality, answer depth, use of specific examples
- clarityScore: Expression clarity, logical organization, conciseness
- confidenceScore: Self-confidence, initiative, ability to handle difficult questions
- culturalFitScore: Cultural fit, respect, courtesy
- overallScore: Weighted average (Content 30%, Clarity 25%, Confidence 25%, Cultural 20%)

Return JSON only. Do not add any text before or after.`;

export async function evaluateInterview(
  interviewId: string,
  language: 'AR' | 'EN',
): Promise<EvaluationResult> {
  const zai = await getZAI();

  // Fetch all messages
  const messages = await db.message.findMany({
    where: { interviewId },
    orderBy: { sequence: 'asc' },
  });

  // Build conversation transcript
  const transcript = messages.map(m => {
    const role = m.role === 'INTERVIEWER'
      ? (language === 'AR' ? 'المحاور' : 'Interviewer')
      : (language === 'AR' ? 'المرشح' : 'Candidate');
    return `${role}: ${m.content}`;
  }).join('\n\n');

  const evalPrompt = language === 'AR'
    ? `قيّم المقابلة التالية:\n\n${transcript}`
    : `Evaluate the following interview:\n\n${transcript}`;

  const systemPrompt = language === 'AR' ? EVAL_SYSTEM_PROMPT_AR : EVAL_SYSTEM_PROMPT_EN;

  // Try LLM evaluation (up to 2 attempts)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: systemPrompt },
          { role: 'user', content: evalPrompt },
        ],
        thinking: { type: 'disabled' },
      });

      const raw = completion.choices[0]?.message?.content || '';
      const parsed = parseEvaluationJson(raw);
      if (parsed) return parsed;
    } catch (err) {
      console.error(`Evaluation attempt ${attempt} failed:`, err);
    }
  }

  // Fallback: heuristic evaluation (never hang)
  return heuristicEvaluation(messages, language);
}

function parseEvaluationJson(raw: string): EvaluationResult | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    const overallScore = clamp(parsed.overallScore, 0, 100);
    const contentScore = clamp(parsed.contentScore, 0, 100);
    const clarityScore = clamp(parsed.clarityScore, 0, 100);
    const confidenceScore = clamp(parsed.confidenceScore, 0, 100);
    const culturalFitScore = clamp(parsed.culturalFitScore, 0, 100);

    if (parsed.feedback && parsed.strengths && parsed.improvements && parsed.recommendation) {
      return {
        overallScore,
        contentScore,
        clarityScore,
        confidenceScore,
        culturalFitScore,
        feedback: String(parsed.feedback),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [String(parsed.strengths)],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String) : [String(parsed.improvements)],
        recommendation: ['RECOMMENDED', 'CONSIDER', 'NOT_RECOMMENDED'].includes(parsed.recommendation)
          ? parsed.recommendation
          : 'CONSIDER',
      };
    }
  } catch {
    // JSON parse failed
  }
  return null;
}

function heuristicEvaluation(messages: MessageRow[], language: 'AR' | 'EN'): EvaluationResult {
  const candidateMessages = messages.filter(m => m.role === 'CANDIDATE');
  const avgLength = candidateMessages.reduce((sum, m) => sum + m.content.length, 0) / Math.max(candidateMessages.length, 1);

  // Simple heuristic: score based on answer length and count
  const lengthScore = Math.min(100, (avgLength / 20) * 100);
  const countScore = Math.min(100, (candidateMessages.length / 7) * 100);

  const overallScore = Math.round((lengthScore * 0.6 + countScore * 0.4));

  const feedback = language === 'AR'
    ? 'تم إنشاء هذا التقييم تلقائياً بناءً على تحليل أساسي لإجاباتك. يُنصح بإجراء مقابلة أخرى للحصول على تقييم أكثر دقة.'
    : 'This evaluation was automatically generated based on basic answer analysis. Consider conducting another interview for a more accurate assessment.';

  return {
    overallScore,
    contentScore: Math.min(100, overallScore + 5),
    clarityScore: Math.min(100, overallScore - 2),
    confidenceScore: Math.min(100, overallScore - 5),
    culturalFitScore: Math.min(100, overallScore),
    feedback,
    strengths: language === 'AR'
      ? ['مشاركة فعالة في المقابلة', 'إجابات واضحة']
      : ['Active participation in the interview', 'Clear answers'],
    improvements: language === 'AR'
      ? ['تحسين عمق الإجابات', 'إضافة أمثلة محددة']
      : ['Improve answer depth', 'Add specific examples'],
    recommendation: overallScore >= 70 ? 'CONSIDER' : 'NOT_RECOMMENDED',
  };
}

function clamp(value: unknown, min: number, max: number): number {
  const num = typeof value === 'number' ? value : 0;
  return Math.max(min, Math.min(max, Math.round(num)));
}

// ─── Generate Verification ID ───
export function generateVerificationId(): string {
  const seg = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `MQBL-${seg()}-${seg()}-${seg()}`;
}

// ─── TTS (Text-to-Speech) ───
const ttsCache = new Map<string, Buffer>();

export async function textToSpeech(text: string, voice: 'fahd' | 'noora'): Promise<Buffer | null> {
  try {
    // Check cache
    const cacheKey = `${voice}:${text}`;
    if (ttsCache.has(cacheKey)) return ttsCache.get(cacheKey)!;

    const zai = await getZAI();

    // Truncate if too long (max 1024 chars)
    const truncated = text.length > 1024 ? text.slice(0, 1020) + '...' : text;

    const response = await zai.audio.tts.create({
      input: truncated,
      voice: voice === 'fahd' ? 'kazi' : 'chuichui',
      speed: 1.0,
      response_format: 'mp3',
      stream: false,
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    // Cache (limit to 100 entries)
    if (ttsCache.size > 100) {
      const firstKey = ttsCache.keys().next().value;
      ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, buffer);

    return buffer;
  } catch (err) {
    console.error('TTS failed:', err);
    return null;
  }
}

// ─── ASR (Speech-to-Text) ───
export async function speechToText(audioBuffer: Buffer): Promise<string> {
  const zai = await getZAI();
  const base64Audio = audioBuffer.toString('base64');

  const response = await zai.audio.asr.create({
    file_base64: base64Audio,
  });

  return response.text || '';
}

// ─── Rate Limiter (simple in-memory) ───
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(interviewId: string, maxPerHour: number = 20): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(interviewId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(interviewId, { count: 1, resetAt: now + 3600_000 });
    return true;
  }

  if (entry.count >= maxPerHour) return false;
  entry.count++;
  return true;
}
