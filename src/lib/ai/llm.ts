/**
 * Shared LLM helpers for Jeannie writing tools.
 * Gemini → heuristic. No OpenAI in the muqabaleh.com stack path.
 */

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
): Promise<{ data: Record<string, unknown>; mode: 'gemini' | 'heuristic' }> {
  const gemini = await callGeminiText(system, `${system}\n\n${user}\n\nRespond with JSON only.`);
  if (gemini) {
    const parsed = extractJsonObject(gemini);
    if (parsed) return { data: { ...fallback, ...parsed }, mode: 'gemini' };
  }
  return { data: fallback, mode: 'heuristic' };
}
