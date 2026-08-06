/**
 * Shared LLM helpers for Jeannie writing tools and matching rationales.
 * Prefers OpenAI → Gemini → heuristic fallback.
 */

export async function callOpenAIJson(system: string, user: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || 'gpt-4o';
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export async function callGeminiText(system: string, user: string): Promise<string | null> {
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

export function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return null;
      }
    }
  }
  return null;
}

export async function generateJsonWithFallback(
  system: string,
  user: string,
  fallback: Record<string, unknown>,
): Promise<{ data: Record<string, unknown>; mode: 'openai' | 'gemini' | 'heuristic' }> {
  const openai = await callOpenAIJson(system, user);
  if (openai) {
    const parsed = extractJsonObject(openai);
    if (parsed) return { data: { ...fallback, ...parsed }, mode: 'openai' };
  }
  const gemini = await callGeminiText(system, `${system}\n\n${user}\n\nRespond with JSON only.`);
  if (gemini) {
    const parsed = extractJsonObject(gemini);
    if (parsed) return { data: { ...fallback, ...parsed }, mode: 'gemini' };
  }
  return { data: fallback, mode: 'heuristic' };
}
