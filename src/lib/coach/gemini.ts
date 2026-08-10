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
  // Provisional only — deliberately capped and labeled; never sold as passport-grade.
  const base = Math.min(70, Math.max(40, Math.round(38 + words / 55)));
  const mk = (name: string, delta: number) => ({
    name,
    score: Math.max(30, Math.min(75, base + delta)),
  });
  return {
    overallScore: base,
    grade: base >= 65 ? 'B' : base >= 50 ? 'C' : 'D',
    competencyBreakdown: [
      mk('Communication', 4),
      mk('Technical Depth', -2),
      mk('Problem Solving', 0),
      mk('Cultural Fit', 3),
      mk('Confidence', -1),
      mk('Leadership', 1),
    ],
    strengths: [
      'Engaged with the practice conversation',
      'Provided enough material to continue coaching',
      'Completed a full mock attempt',
    ],
    improvements: [
      'Retry when AI scoring is available for a verified passport',
      'Add quantified outcomes in STAR stories',
      'Deepen role-specific detail',
    ],
    recommendedNextSteps:
      'This is a provisional length-based estimate, not a verified Muqabaleh passport score. Retry when model scoring is available.',
    scoringMode: 'provisional',
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
  const hasSa = hasGoogleServiceAccount();
  if (!key && !hasSa) return heuristicScore(transcript);

  try {
    const text = await callGeminiPro(system, [
      { role: 'user', parts: [{ text: user }] },
    ]);
    if (!text) return heuristicScore(transcript);
    const parsed = extractJsonObject(text);
    if (!parsed) return heuristicScore(transcript);

    const overall = Number(parsed.overallScore);
    const grade = String(parsed.grade || 'B') as CoachScoreResult['grade'];
    const provisional = heuristicScore(transcript);
    const breakdown = Array.isArray(parsed.competencyBreakdown)
      ? (parsed.competencyBreakdown as CoachScoreResult['competencyBreakdown'])
      : provisional.competencyBreakdown;

    return {
      overallScore: Number.isFinite(overall) ? Math.max(0, Math.min(100, Math.round(overall))) : 60,
      grade: ['A', 'B+', 'B', 'C', 'D'].includes(grade) ? grade : 'B',
      competencyBreakdown: breakdown,
      strengths: Array.isArray(parsed.strengths)
        ? (parsed.strengths as string[]).slice(0, 3)
        : provisional.strengths,
      improvements: Array.isArray(parsed.improvements)
        ? (parsed.improvements as string[]).slice(0, 3)
        : provisional.improvements,
      recommendedNextSteps:
        typeof parsed.recommendedNextSteps === 'string'
          ? parsed.recommendedNextSteps
          : provisional.recommendedNextSteps,
      scoringMode: 'model',
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
