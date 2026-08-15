/** Merge Gemini stream chunks that may be deltas or full snapshots. */
export function mergeGeminiStreamText(
  previous: string,
  incoming: string,
): { next: string; delta: string } {
  if (!incoming) return { next: previous, delta: '' };
  if (!previous) return { next: incoming, delta: incoming };
  if (incoming.startsWith(previous)) {
    return { next: incoming, delta: incoming.slice(previous.length) };
  }
  if (previous.endsWith(incoming)) {
    return { next: previous, delta: '' };
  }
  return { next: previous + incoming, delta: incoming };
}

export function extractTextFromGeminiChunk(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const obj = raw as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const parts = obj.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map((p) => p.text || '').join('');
}

export function consumeGeminiSseBuffer(
  buffer: string,
  chunk: string,
  onText: (text: string) => void,
): string {
  const combined = buffer + chunk;
  const parts = combined.split('\n\n');
  const rest = parts.pop() || '';
  for (const part of parts) {
    for (const line of part.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload) as unknown;
        const text = extractTextFromGeminiChunk(json);
        if (text) onText(text);
      } catch {
        /* ignore partial JSON */
      }
    }
  }
  return rest;
}
