import { getInterviewConfig } from './config';
import { extractJsonObject } from '@/lib/ai/llm';
import type { ChatMessage, CoachScoreResult, PrepSelections } from './types';
import { buildCoachSystemPrompt, buildScoringPrompt } from './prompts';
import { getGoogleAccessToken, hasGoogleServiceAccount } from './google-auth';

const GEMINI_MODEL_FALLBACKS = [
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
];

async function callGeminiPro(
  system: string,
  contents: { role: 'user' | 'model'; parts: { text: string }[] }[],
): Promise<string | null> {
  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    null;
  const accessToken = hasGoogleServiceAccount()
    ? await getGoogleAccessToken([
        'https://www.googleapis.com/auth/generative-language',
      ])
    : null;
  if (!accessToken && !key) return null;

  const preferred =
    getInterviewConfig().engine.geminiModel || 'gemini-flash-latest';
  // Prefer stable aliases — pinned ids are frequently retired for new projects.
  const models = Array.from(new Set([preferred, ...GEMINI_MODEL_FALLBACKS]));

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

  // Prefer service-account OAuth, then API key REST, then SDK.
  for (const model of models) {
    try {
      const rest = await callGeminiRest({
        accessToken,
        key,
        model,
        system,
        history,
        lastText,
      });
      if (rest) return rest;
    } catch (err) {
      console.error(`[coach/gemini] REST failed model=${model}`, err);
    }
  }

  if (!key) return null;

  try {
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
        console.error(`[coach/gemini] SDK failed model=${model}`, err);
      }
    }
  } catch (err) {
    console.error('[coach/gemini] SDK init failed', err);
  }
  return null;
}

async function callGeminiRest(opts: {
  accessToken: string | null;
  key: string | null;
  model: string;
  system: string;
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  lastText: string;
}): Promise<string | null> {
  const contents = [
    ...opts.history.map((h) => ({
      role: h.role,
      parts: h.parts,
    })),
    { role: 'user' as const, parts: [{ text: opts.lastText }] },
  ];
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: opts.system }] },
    contents,
  });

  const attempts: { auth: string; url: string; headers: Record<string, string> }[] =
    [];
  if (opts.accessToken) {
    attempts.push({
      auth: 'service_account',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent`,
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }
  if (opts.key) {
    attempts.push({
      auth: 'api_key',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent?key=${encodeURIComponent(opts.key)}`,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  for (const attempt of attempts) {
    const res = await fetch(attempt.url, {
      method: 'POST',
      headers: attempt.headers,
      body,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(
        `[coach/gemini] REST ${opts.model} ${attempt.auth}`,
        res.status,
        errText.slice(0, 220),
      );
      continue;
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    if (text) return text;
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
      mk('Leadership', 1),
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
  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    null;
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
