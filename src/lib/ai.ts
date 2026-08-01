// ─── Muqabaleh AI Engine ───
// Primary: Google Gemini 1.5 Flash (LLM) + Azure Speech (TTS)
// Fallback: z-ai-web-dev-sdk (when API keys not configured)
// IMPORTANT: This module MUST only be used server-side

import { db } from './db';
import crypto from 'crypto';

// ─── Gemini Setup ───
let _geminiModel: any = null;
let _geminiClient: any = null;

async function getGeminiModel() {
  if (_geminiModel) return _geminiModel;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    _geminiClient = new GoogleGenerativeAI(apiKey);
    _geminiModel = _geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    return _geminiModel;
  } catch {
    return null;
  }
}

// ─── ZAI Fallback Setup ───
let _zai: Awaited<ReturnType<typeof import('z-ai-web-dev-sdk').default.create>> | null = null;
async function getZAI() {
  if (!_zai) {
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    _zai = await ZAI.create();
  }
  return _zai;
}

// ─── Unified LLM Call ───
// Tries Gemini first, falls back to z-ai-web-dev-sdk
async function callLLM(messages: { role: string; content: string }[]): Promise<string> {
  // Try Gemini first
  const geminiModel = await getGeminiModel();
  if (geminiModel) {
    try {
      // Gemini format: first message with role=system is systemInstruction,
      // then alternating user/model messages
      let systemInstruction: string | undefined;
      const geminiHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
      let lastUserMsg = '';

      for (const msg of messages) {
        if (msg.role === 'system' || msg.role === 'assistant') {
          // Our convention: first 'assistant' message is the system prompt
          if (!systemInstruction && geminiHistory.length === 0) {
            systemInstruction = msg.content;
          } else {
            geminiHistory.push({ role: 'model', parts: [{ text: msg.content }] });
          }
        } else {
          geminiHistory.push({ role: 'user', parts: [{ text: msg.content }] });
          lastUserMsg = msg.content;
        }
      }

      // If there's a trailing user message, remove it from history (Gemini sends it as prompt)
      if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role === 'user') {
        lastUserMsg = geminiHistory.pop()!.parts[0].text;
      }

      const request: Record<string, unknown> = {
        contents: geminiHistory.length > 0 ? geminiHistory : [{ role: 'user', parts: [{ text: lastUserMsg }] }],
      };
      if (systemInstruction) {
        request.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const result = await geminiModel.generateContent(request);
      const response = result.response;
      const text = response.text();
      if (text) return text;
    } catch (err) {
      console.error('Gemini LLM failed, falling back to ZAI:', err);
    }
  }

  // Fallback: z-ai-web-dev-sdk
  const zai = await getZAI();
  const completion = await zai.chat.completions.create({
    messages: messages as any,
    thinking: { type: 'disabled' },
  });
  return completion.choices[0]?.message?.content || '';
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

const TOTAL_QUESTIONS = 5;
const EXPERIENCE_LABELS_AR: Record<string, string> = {
  JUNIOR: '\u0645\u0628\u062a\u062f\u0626 (0-2 \u0633\u0646\u0648\u0627\u062a)',
  MID: '\u0645\u062a\u0648\u0633\u0637 (3-6 \u0633\u0646\u0648\u0627\u062a)',
  SENIOR: '\u0623\u0642\u062f\u0645 (7-10 \u0633\u0646\u0648\u0627\u062a)',
  EXECUTIVE: '\u062a\u0646\u0641\u064a\u0630\u064a (10+ \u0633\u0646\u0648\u0627\u062a)',
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
  const interviewerName = params.interviewerGender === 'MALE' ? '\u0641\u0647\u062f' : '\u0646\u0648\u0631\u0629';
  const expLabel = isAr
    ? (EXPERIENCE_LABELS_AR[params.experience] || params.experience)
    : (EXPERIENCE_LABELS_EN[params.experience] || params.experience);

  const typeInstructions = isAr
    ? params.type === 'BEHAVIORAL'
      ? `\u0646\u0648\u0639 \u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0629: \u0633\u0644\u0648\u0643\u064a\u0629. \u0627\u062a\u0628\u0639 \u0645\u0646\u0647\u062c\u064a\u0629 STAR (Situation, Task, Action, Result) \u0641\u064a \u0645\u062a\u0627\u0628\u0639\u0629 \u0625\u062c\u0627\u0628\u0627\u062a \u0627\u0644\u0645\u0631\u0634\u062d. \u0627\u0637\u0644\u0628 \u0623\u0645\u062b\u0644\u0629 \u0645\u062d\u062f\u062f\u0629 \u0645\u0646 \u0627\u0644\u0648\u0627\u0642\u0639.`
      : `\u0646\u0648\u0639 \u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0629: \u062a\u0642\u0646\u064a\u0629. \u0627\u0637\u0631\u062d \u0623\u0633\u0626\u0644\u0629 \u0641\u064a \u0645\u062c\u0627\u0644 ${params.industry} \u0628\u0645\u0633\u062a\u0648\u0649 ${expLabel}. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0639\u0645\u0642 \u0627\u0644\u062a\u0642\u0646\u064a \u0648\u0627\u0644\u0641\u0647\u0645 \u0627\u0644\u0639\u0645\u0644\u064a.`
    : params.type === 'BEHAVIORAL'
      ? `Interview type: Behavioral. Follow the STAR methodology (Situation, Task, Action, Result) in follow-ups. Ask for specific real-world examples.`
      : `Interview type: Technical. Ask questions in the ${params.industry} field at ${expLabel} level. Verify technical depth and practical understanding.`;

  return isAr
    ? `\u0623\u0646\u062a ${interviewerName}\u060c \u0645\u062d\u0627\u0648\u0631 \u0645\u0647\u0646\u064a \u062f\u0627\u0641\u0626 \u0648\u0645\u062d\u062a\u0631\u0645 \u0641\u064a \u0645\u0646\u0635\u0629 \u0645\u0642\u0627\u0628\u0644\u0629 (Muqabaleh). \u0623\u0646 \u062a\u062c\u0631\u064a \u0645\u0642\u0627\u0628\u0644\u0629 \u0648\u0638\u064a\u0641\u064a\u0629 ${params.type === 'BEHAVIORAL' ? '\u0633\u0644\u0648\u0643\u064a\u0629' : '\u062a\u0642\u0646\u064a\u0629'} \u0644\u0645\u062a\u062e\u0635\u0635 \u0641\u064a \u0645\u062c\u0627\u0644 ${params.industry} \u0628\u0645\u0633\u062a\u0648\u0649 \u062e\u0628\u0631\u0629 ${expLabel}.

\u0627\u0644\u0642\u0648\u0627\u0639\u062f \u0627\u0644\u0635\u0627\u0631\u0645\u0629:
1. \u0627\u0637\u0631\u062d \u0633\u0624\u0627\u0644\u0627\u064b \u0648\u0627\u062d\u062f\u0627\u064b \u0641\u0642\u0637 \u0641\u064a \u0643\u0644 \u0631\u0633\u0627\u0644\u0629.
2. \u0643\u0646 \u0648\u062f\u0648\u062f\u0627\u064b \u0648\u0645\u062d\u062a\u0631\u0641\u0627\u064b \u2014 \u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0641\u0635\u062d\u0649 \u0645\u0639 \u0644\u0645\u0633\u0629 \u062f\u0627\u0641\u0626\u0629.
3. \u0644\u0627 \u062a\u0643\u0631\u0631 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0623\u0628\u062f\u0627\u064b.
4. \u0627\u0633\u062a\u0645\u0639 \u0644\u0625\u062c\u0627\u0628\u0629 \u0627\u0644\u0645\u0631\u0634\u0627\u062d \u0648\u0623\u062a\u0628\u0639\u0647\u0627 \u0628\u0633\u0624\u0627\u0644 \u0645\u062a\u0627\u0628\u0639\u0629 \u0645\u0646\u0627\u0633\u0628 \u0623\u0648 \u0633\u0624\u0627\u0644 \u062c\u062f\u064a\u062f.
5. ${typeInstructions}
6. \u0627\u0637\u0631\u062d \u0628\u0627\u0644\u0636\u0628\u0637 ${TOTAL_QUESTIONS} \u0623\u0633\u0626\u0644\u0629 \u062b\u0645 \u0627\u062e\u062a\u0645 \u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0629 \u0628\u0634\u0643\u0631 \u0645\u0647\u0630\u0628.
7. \u0639\u0646\u062f\u0645\u0627 \u062a\u0637\u0631\u062d \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0623\u062e\u064a\u0631 (\u0627\u0644\u0633\u0624\u0627\u0644 \u0631\u0642\u0645 ${TOTAL_QUESTIONS})\u060c \u0642\u0644: "\u0634\u0643\u0631\u0627\u064b \u0644\u0643 \u0639\u0644\u0649 \u0648\u0642\u062a\u0643. \u0647\u0630\u0627 \u0643\u0627\u0646 \u0622\u062e\u0631 \u0633\u0624\u0627\u0644. \u0634\u0643\u0631\u0627\u064b \u0644\u0645\u0634\u0627\u0631\u0643\u062a\u0643 \u0641\u064a \u0647\u0630\u0647 \u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0629." \u0648\u0623\u0636\u0641 \u0641\u064a \u0646\u0647\u0627\u064a\u0629 \u0631\u0633\u0627\u0644\u062a\u0643: [INTERVIEW_DONE]
8. \u0644\u0627 \u062a\u064f\u0638\u0647\u0631 [INTERVIEW_DONE] \u0623\u0628\u062f\u0627\u064b \u0625\u0644\u0627 \u0641\u064a \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0623\u062e\u064a\u0631.
9. \u0644\u0627 \u062a\u064f\u0638\u0647\u0631 \u0623\u064a \u0634\u064a\u0621 \u0628\u064a\u0646 \u0623\u0642\u0648\u0627\u0633 \u0645\u0639\u0642\u0648\u0641\u0629 \u063a\u064a\u0631 [INTERVIEW_DONE].
10. \u0627\u062c\u0639\u0644 \u0623\u0633\u0626\u0644\u062a\u0643 \u0645\u062a\u0646\u0648\u0639\u0629: \u0628\u062f\u0627\u064a\u0629\u060c \u0645\u062a\u0627\u0628\u0639\u0629\u060c \u0633\u064a\u0646\u0627\u0631\u064a\u0648\u0647\u0627\u062a\u060c \u062a\u062d\u062f\u064a\u0627\u062a\u060c \u0625\u0646\u062c\u0627\u0632\u0627\u062a.
11. \u0625\u0630\u0627 \u0643\u0627\u0646\u062a \u0625\u062c\u0627\u0628\u0629 \u0627\u0644\u0645\u0631\u0634\u0627\u062d \u0642\u0635\u064a\u0631\u0629 \u062c\u062f\u0627\u064b\u060c \u0627\u0637\u0644\u0628 \u0627\u0644\u062a\u0648\u0636\u064a\u062d \u0628\u0623\u062f\u0628.
12. \u0644\u0627 \u062a\u0628\u062f\u0623 \u0631\u0633\u0627\u0626\u0644\u0643 \u0628\u0623\u064a \u0639\u0644\u0627\u0645\u0629 \u062a\u0631\u0642\u064a\u0645 \u0623\u0648 \u062a\u0646\u0633\u064a\u0642 \u2014 \u0627\u0628\u062f\u0623 \u0628\u0627\u0644\u0643\u0644\u0627\u0645 \u0645\u0628\u0627\u0634\u0631\u0629.`
    : `You are ${interviewerName === '\u0641\u0647\u062f' ? 'Fahd' : 'Noora'}, a warm and professional interviewer on the Muqabaleh platform. You are conducting a ${params.type === 'BEHAVIORAL' ? 'behavioral' : 'technical'} interview for a ${params.industry} specialist at ${expLabel} level.

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
12. Do not start your messages with any punctuation or formatting \u2014 start speaking directly.`;
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

  if (questionCount >= TOTAL_QUESTIONS) {
    return { question: '', questionNumber: TOTAL_QUESTIONS, totalQuestions: TOTAL_QUESTIONS, done: true };
  }

  const systemPrompt = buildSystemPrompt(params);
  const questionBank = await fetchQuestionBank(params.industry, params.type, params.language);
  const bankContext = questionBank.length > 0
    ? (params.language === 'AR'
      ? `\n\n\u0628\u0646\u0643 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0631\u062c\u0639\u064a (\u0627\u0633\u062a\u0644\u0647\u0645 \u0645\u0646\u0647\u0627 \u062f\u0648\u0646 \u062a\u0643\u0631\u0627\u0631\u0647\u0627 \u062d\u0631\u0641\u064a\u0627\u064b):\n${questionBank.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : `\n\nReference question bank (draw inspiration without verbatim repetition):\n${questionBank.map((q, i) => `${i + 1}. ${q}`).join('\n')}`)
    : '';

  const llmMessages: { role: string; content: string }[] = [
    { role: 'assistant', content: systemPrompt + bankContext },
  ];

  for (const msg of messageRows) {
    llmMessages.push({
      role: msg.role === 'INTERVIEWER' ? 'assistant' : 'user',
      content: msg.content,
    });
  }
  llmMessages.push({ role: 'user', content: candidateMessage });

  const responseText = await callLLM(llmMessages);

  const isDone = responseText.includes('[INTERVIEW_DONE]');
  const cleaned = responseText.replace(/\[INTERVIEW_DONE\]/g, '').trim();

  const nextSeq = (dbMessages[dbMessages.length - 1]?.sequence || 0) + 1;

  await db.message.create({
    data: { interviewId, role: 'CANDIDATE', content: candidateMessage, sequence: nextSeq },
  });
  await db.message.create({
    data: { interviewId, role: 'INTERVIEWER', content: cleaned, sequence: nextSeq + 1 },
  });

  return {
    question: cleaned,
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
  const systemPrompt = buildSystemPrompt(params);
  const questionBank = await fetchQuestionBank(params.industry, params.type, params.language);
  const bankContext = questionBank.length > 0
    ? (params.language === 'AR'
      ? `\n\n\u0628\u0646\u0643 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0631\u062c\u0639\u064a (\u0627\u0633\u062a\u0644\u0647\u0645 \u0645\u0646\u0647\u0627 \u062f\u0648\u0646 \u062a\u0643\u0631\u0627\u0631\u0647\u0627 \u062d\u0631\u0641\u064a\u0627\u064b):\n${questionBank.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : `\n\nReference question bank (draw inspiration without verbatim repetition):\n${questionBank.map((q, i) => `${i + 1}. ${q}`).join('\n')}`)
    : '';

  const isAr = params.language === 'AR';
  const openingPrompt = isAr
    ? '\u0627\u0628\u062f\u0623 \u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0629 \u0628\u062a\u062d\u064a\u0629 \u062f\u0627\u0641\u0626\u0629 \u0648\u0633\u0624\u0627\u0644\u0643 \u0627\u0644\u0623\u0648\u0644. \u0644\u0627 \u062a\u064f\u0638\u0647\u0631 [INTERVIEW_DONE] \u2014 \u0647\u0630\u0647 \u0628\u062f\u0627\u064a\u0629 \u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0629 \u0641\u0642\u0637.'
    : 'Start the interview with a warm greeting and your first question. Do not show [INTERVIEW_DONE] \u2014 this is just the beginning.';

  const responseText = await callLLM([
    { role: 'assistant', content: systemPrompt + bankContext },
    { role: 'user', content: openingPrompt },
  ]);

  const cleaned = responseText.replace(/\[INTERVIEW_DONE\]/g, '').trim();

  await db.message.create({
    data: { interviewId, role: 'INTERVIEWER', content: cleaned, sequence: 1 },
  });

  return {
    question: cleaned,
    questionNumber: 1,
    totalQuestions: TOTAL_QUESTIONS,
    done: false,
  };
}

// ─── Evaluation ───
const EVAL_SYSTEM_PROMPT_AR = `\u0623\u0646\u062a \u0645\u0642\u064a\u0651\u0645 \u0645\u0642\u0627\u0628\u0644\u0627\u062a \u0648\u0638\u064a\u0641\u064a\u0629 \u0645\u062d\u062a\u0631\u0641. \u0642\u064a\u0651\u0645 \u0623\u062f\u0627\u0621 \u0627\u0644\u0645\u0631\u0634\u062d \u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062c\u0648\u0628\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629.
\u0623\u0639\u062f \u0646\u062a\u064a\u062c\u0629 JSON \u0641\u0642\u0637 \u0628\u062f\u0648\u0646 \u0623\u064a \u0646\u0635 \u0625\u0636\u0627\u0641\u064a. \u0627\u0644\u0634\u0643\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628:
{
  "overallScore": number (0-100),
  "contentScore": number (0-100),
  "clarityScore": number (0-100),
  "confidenceScore": number (0-100),
  "culturalFitScore": number (0-100),
  "feedback": "\u0641\u0642\u0631\u062a\u0627\u0646-\u062b\u0644\u0627\u062b \u0628\u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0641\u0635\u062d\u0649 \u0639\u0646 \u0627\u0644\u0623\u062f\u0627\u0621 \u0627\u0644\u0639\u0627\u0645",
  "strengths": ["\u0646\u0642\u0637\u0629 \u0642\u0648\u0629 1", "\u0646\u0642\u0637\u0629 \u0642\u0648\u0629 2", "\u0646\u0642\u0637\u0629 \u0642\u0648\u0629 3"],
  "improvements": ["\u0646\u0642\u0637\u0629 \u062a\u062d\u0633\u064a\u0646 1", "\u0646\u0642\u0637\u0629 \u062a\u062d\u0633\u064a\u0646 2", "\u0646\u0642\u0637\u0629 \u062a\u062d\u0633\u064a\u0646 3"],
  "recommendation": "RECOMMENDED" \u0623\u0648 "CONSIDER" \u0623\u0648 "NOT_RECOMMENDED"
}

\u0645\u0639\u0627\u064a\u064a\u0631 \u0627\u0644\u062a\u0642\u064a\u064a\u0645:
- contentScore: \u062c\u0648\u062f\u0629 \u0627\u0644\u0645\u062d\u062a\u0648\u0649\u060c \u0639\u0645\u0642 \u0627\u0644\u0625\u062c\u0627\u0628\u0627\u062a\u060c \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0623\u0645\u062b\u0644\u0629 \u0645\u062d\u062f\u062f\u0629
- clarityScore: \u0648\u0636\u0648\u062d \u0627\u0644\u062a\u0639\u0628\u064a\u0631\u060c \u0627\u0644\u062a\u0646\u0638\u064a\u0645 \u0627\u0644\u0645\u0646\u0637\u0642\u064a\u060c \u0627\u0644\u0625\u064a\u062c\u0627\u0632
- confidenceScore: \u0627\u0644\u062b\u0642\u0629 \u0628\u0627\u0644\u0646\u0641\u0633\u060c \u0627\u0644\u0645\u0628\u0627\u062f\u0631\u0629\u060c \u0627\u0644\u0642\u062f\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u062a\u0639\u0627\u0645\u0644 \u0645\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0635\u0639\u0628\u0629
- culturalFitScore: \u0627\u0644\u062a\u0648\u0627\u0641\u0642 \u0627\u0644\u062b\u0642\u0627\u0641\u064a\u060c \u0627\u0644\u0627\u062d\u062a\u0631\u0627\u0645\u060c \u0627\u0644\u0644\u0628\u0627\u0642\u0629
- overallScore: \u0627\u0644\u0645\u062a\u0648\u0633\u0637 \u0627\u0644\u0645\u0631\u062c\u0651\u062d (\u0627\u0644\u0645\u062d\u062a\u0648\u0649 30%\u060c \u0627\u0644\u0648\u0636\u0648\u062d 25%\u060c \u0627\u0644\u062b\u0642\u0629 25%\u060c \u0627\u0644\u0645\u0644\u0627\u0621\u0645\u0629 20%)

\u0623\u0639\u062f JSON \u0641\u0642\u0637. \u0644\u0627 \u062a\u0636\u0641 \u0623\u064a \u0646\u0635 \u0642\u0628\u0644\u0647 \u0623\u0648 \u0628\u0639\u062f\u0647.`;

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
  const messages = await db.message.findMany({
    where: { interviewId },
    orderBy: { sequence: 'asc' },
  });

  const transcript = messages.map(m => {
    const role = m.role === 'INTERVIEWER'
      ? (language === 'AR' ? '\u0627\u0644\u0645\u062d\u0627\u0648\u0631' : 'Interviewer')
      : (language === 'AR' ? '\u0627\u0644\u0645\u0631\u0634\u062d' : 'Candidate');
    return `${role}: ${m.content}`;
  }).join('\n\n');

  const evalPrompt = language === 'AR'
    ? `\u0642\u064a\u0651\u0645 \u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629:\n\n${transcript}`
    : `Evaluate the following interview:\n\n${transcript}`;

  const systemPrompt = language === 'AR' ? EVAL_SYSTEM_PROMPT_AR : EVAL_SYSTEM_PROMPT_EN;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await callLLM([
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: evalPrompt },
      ]);
      const parsed = parseEvaluationJson(raw);
      if (parsed) return parsed;
    } catch (err) {
      console.error(`Evaluation attempt ${attempt} failed:`, err);
    }
  }

  return heuristicEvaluation(messages, language);
}

function parseEvaluationJson(raw: string): EvaluationResult | null {
  try {
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
        overallScore, contentScore, clarityScore, confidenceScore, culturalFitScore,
        feedback: String(parsed.feedback),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [String(parsed.strengths)],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String) : [String(parsed.improvements)],
        recommendation: ['RECOMMENDED', 'CONSIDER', 'NOT_RECOMMENDED'].includes(parsed.recommendation)
          ? parsed.recommendation : 'CONSIDER',
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
  const lengthScore = Math.min(100, (avgLength / 20) * 100);
  const countScore = Math.min(100, (candidateMessages.length / 7) * 100);
  const overallScore = Math.round((lengthScore * 0.6 + countScore * 0.4));

  const feedback = language === 'AR'
    ? '\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0647\u0630\u0627 \u0627\u0644\u062a\u0642\u064a\u064a\u0645 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b \u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 \u062a\u062d\u0644\u064a\u0644 \u0623\u0633\u0627\u0633\u064a \u0644\u0625\u062c\u0627\u0628\u0627\u062a\u0643. \u064a\u064f\u0646\u0635\u062d \u0628\u0625\u062c\u0631\u0627\u0621 \u0645\u0642\u0627\u0628\u0644\u0629 \u0623\u062e\u0631\u0649 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u062a\u0642\u064a\u064a\u0645 \u0623\u0643\u062b\u0631 \u062f\u0642\u0629.'
    : 'This evaluation was automatically generated based on basic answer analysis. Consider conducting another interview for a more accurate assessment.';

  return {
    overallScore,
    contentScore: Math.min(100, overallScore + 5),
    clarityScore: Math.min(100, overallScore - 2),
    confidenceScore: Math.min(100, overallScore - 5),
    culturalFitScore: Math.min(100, overallScore),
    feedback,
    strengths: language === 'AR' ? ['\u0645\u0634\u0627\u0631\u0643\u0629 \u0641\u0639\u0627\u0644\u0629 \u0641\u064a \u0627\u0644\u0645\u0642\u0627\u0628\u0644\u0629', '\u0625\u062c\u0627\u0628\u0627\u062a \u0648\u0627\u0636\u062d\u0629']
      : ['Active participation in the interview', 'Clear answers'],
    improvements: language === 'AR' ? ['\u062a\u062d\u0633\u064a\u0646 \u0639\u0645\u0642 \u0627\u0644\u0625\u062c\u0627\u0628\u0627\u062a', '\u0625\u0636\u0627\u0641\u0629 \u0623\u0645\u062b\u0644\u0629 \u0645\u062d\u062f\u062f\u0629']
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
// Primary: Azure Speech Services (ar-SA-Zariyah / ar-SA-Hamed)
// Fallback: z-ai-web-dev-sdk
const ttsCache = new Map<string, Buffer>();

export async function textToSpeech(text: string, voice: 'fahd' | 'noora'): Promise<Buffer | null> {
  try {
    const cacheKey = `${voice}:${text}`;
    if (ttsCache.has(cacheKey)) return ttsCache.get(cacheKey)!;

    const truncated = text.length > 1024 ? text.slice(0, 1020) + '...' : text;
    let buffer: Buffer | null = null;

    // Try Azure Speech first
    const azureKey = process.env.AZURE_SPEECH_KEY;
    const azureRegion = process.env.AZURE_SPEECH_REGION || 'eastus';
    if (azureKey) {
      try {
        const azureVoice = voice === 'fahd' ? 'ar-SA-Zariyah' : 'ar-SA-Hamed';
        const ssml = `<speak version='1.0' xml:lang='ar-SA'><voice name='${azureVoice}'>${truncated.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</voice></speak>`;

        const res = await fetch(
          `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
          {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': azureKey,
              'Content-Type': 'application/ssml+xml',
              'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
              'User-Agent': 'Muqabaleh',
            },
            body: ssml,
          },
        );

        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          buffer = Buffer.from(new Uint8Array(arrayBuf));
        }
      } catch (err) {
        console.error('Azure TTS failed, falling back to ZAI:', err);
      }
    }

    // Fallback: z-ai-web-dev-sdk
    if (!buffer) {
      const zai = await getZAI();
      const response = await zai.audio.tts.create({
        input: truncated,
        voice: voice === 'fahd' ? 'kazi' : 'chuichui',
        speed: 1.0,
        response_format: 'mp3',
        stream: false,
      });
      const arrayBuf = await response.arrayBuffer();
      buffer = Buffer.from(new Uint8Array(arrayBuf));
    }

    if (ttsCache.size > 100) {
      const firstKey = ttsCache.keys().next().value!;
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
  const response = await zai.audio.asr.create({ file_base64: base64Audio });
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
