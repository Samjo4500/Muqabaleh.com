import { getInterviewConfig } from './config';
import { extractJsonObject } from '@/lib/ai/llm';
import type { ChatMessage, CoachScoreResult, PrepSelections } from './types';
import { buildCoachSystemPrompt, buildScoringPrompt } from './prompts';

async function callGeminiPro(
  system: string,
  contents: { role: 'user' | 'model'; parts: { text: string }[] }[],
): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const preferred = getInterviewConfig().engine.geminiModel || 'gemini-1.5-pro';
  // AI Studio keys often accept flash aliases more reliably than pinned pro ids.
  const models = Array.from(
    new Set([preferred, 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']),
  );

  // Gemini chat history must start with a user turn.
  let history = contents.slice(0, -1);
  if (history[0]?.role === 'model') {
    history = [
      { role: 'user', parts: [{ text: 'Continue the interview.' }] },
      ...history,
    ];
  }
  const last = contents[contents.length - 1];
  const lastText = last?.parts?.[0]?.text || 'Continue.';

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const client = new GoogleGenerativeAI(key);

  for (const model of models) {
    try {
      const gen = client.getGenerativeModel({
        model,
        systemInstruction: system,
      });
      const chat = gen.startChat({ history });
      const result = await chat.sendMessage(lastText);
      const text = result.response.text() || null;
      if (text) return text;
    } catch (err) {
      console.error(`[coach/gemini] turn failed model=${model}`, err);
    }
  }
  return null;
}

function toGeminiHistory(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
    parts: [{ text: m.content }],
  }));
}

const OPENING_FALLBACK = {
  ar: 'مرحباً، أنا مدرب المقابلات في مقابلة. لنبدأ — حدّثني عن نفسك وخبرتك ذات الصلة بهذا الدور.',
  en: "Hello — I'm your interview coach on Muqabaleh. Let's begin: tell me about yourself and your relevant experience for this role.",
};

export async function generateCoachTurn(opts: {
  prep: PrepSelections;
  candidateName: string;
  history: ChatMessage[];
  userMessage?: string;
}): Promise<{ reply: string; complete: boolean }> {
  const system = buildCoachSystemPrompt(opts.prep, opts.candidateName);
  const history = [...opts.history];
  if (opts.userMessage?.trim()) {
    history.push({ role: 'user', content: opts.userMessage.trim() });
  }

  // Opening turn
  if (history.length === 0) {
    const kickoff =
      opts.prep.language === 'en'
        ? 'Please start the interview with a warm greeting and your first question.'
        : 'ابدأ المقابلة بترحيب قصير ثم اطرح السؤال الأول.';
    history.push({ role: 'user', content: kickoff });
  }

  const text = await callGeminiPro(system, toGeminiHistory(history));
  if (!text) {
    // Prefer contextual fallback — never crash the session.
    if (opts.userMessage?.trim()) {
      const fallbackFollow =
        opts.prep.language === 'en'
          ? 'Thank you. Could you share a specific example with numbers or outcomes?'
          : 'شكراً لك. هل يمكنك مشاركة مثال محدد بأرقام أو نتائج؟';
      return { reply: fallbackFollow, complete: false };
    }
    const fallback =
      opts.prep.language === 'en' ? OPENING_FALLBACK.en : OPENING_FALLBACK.ar;
    return { reply: fallback, complete: false };
  }

  const complete = text.includes('[[INTERVIEW_COMPLETE]]');
  const reply = text.replace(/\[\[INTERVIEW_COMPLETE\]\]/g, '').trim();
  return { reply, complete };
}

function heuristicScore(transcript: string): CoachScoreResult {
  const words = transcript.trim().split(/\s+/).filter(Boolean).length;
  const base = Math.min(88, Math.max(42, Math.round(40 + words / 40)));
  const mk = (name: string, delta: number) => ({
    name,
    score: Math.max(30, Math.min(95, base + delta)),
  });
  return {
    overallScore: base,
    grade: base >= 85 ? 'A' : base >= 75 ? 'B+' : base >= 65 ? 'B' : base >= 50 ? 'C' : 'D',
    competencyBreakdown: [
      mk('Communication', 4),
      mk('Technical Depth', -2),
      mk('Problem Solving', 0),
      mk('Cultural Fit', 3),
      mk('Confidence', -1),
    ],
    strengths: [
      'Clear structure in answers',
      'Willingness to engage with follow-ups',
      'Relevant examples shared',
    ],
    improvements: [
      'Add quantified outcomes',
      'Tighten STAR stories',
      'Deepen role-specific detail',
    ],
    recommendedNextSteps:
      'Book another Muqabaleh practice session focused on quantified impact stories.',
  };
}

export async function scoreTranscript(
  prep: PrepSelections,
  transcript: string,
): Promise<CoachScoreResult> {
  const { system, user } = buildScoringPrompt(prep, transcript);
  const key = process.env.GEMINI_API_KEY;
  if (!key) return heuristicScore(transcript);

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const modelName = getInterviewConfig().engine.geminiModel || 'gemini-1.5-pro';
    const client = new GoogleGenerativeAI(key);
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: system,
    });
    const result = await model.generateContent(user);
    const text = result.response.text() || '';
    const parsed = extractJsonObject(text);
    if (!parsed) return heuristicScore(transcript);

    const overall = Number(parsed.overallScore);
    const grade = String(parsed.grade || 'B') as CoachScoreResult['grade'];
    const breakdown = Array.isArray(parsed.competencyBreakdown)
      ? (parsed.competencyBreakdown as CoachScoreResult['competencyBreakdown'])
      : heuristicScore(transcript).competencyBreakdown;

    return {
      overallScore: Number.isFinite(overall) ? Math.max(0, Math.min(100, Math.round(overall))) : 60,
      grade: ['A', 'B+', 'B', 'C', 'D'].includes(grade) ? grade : 'B',
      competencyBreakdown: breakdown,
      strengths: Array.isArray(parsed.strengths)
        ? (parsed.strengths as string[]).slice(0, 3)
        : heuristicScore(transcript).strengths,
      improvements: Array.isArray(parsed.improvements)
        ? (parsed.improvements as string[]).slice(0, 3)
        : heuristicScore(transcript).improvements,
      recommendedNextSteps:
        typeof parsed.recommendedNextSteps === 'string'
          ? parsed.recommendedNextSteps
          : heuristicScore(transcript).recommendedNextSteps,
    };
  } catch (err) {
    console.error('[coach/gemini] score failed', err);
    return heuristicScore(transcript);
  }
}

/** Detect likely script for TTS voice selection. */
export function detectReplyLanguage(text: string, fallback: 'ar' | 'en'): 'ar' | 'en' {
  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  if (arabic === 0 && latin === 0) return fallback;
  return arabic >= latin ? 'ar' : 'en';
}
