import type { ChatMessage } from './types';

export type CoachTurnDone = {
  reply?: string;
  complete?: boolean;
  sessionId?: string;
  history?: ChatMessage[];
  error?: string;
  upgradeRequired?: boolean;
};

export type CoachTurnSseHandlers = {
  onToken?: (text: string) => void;
  onDone?: (data: CoachTurnDone) => void;
  onError?: (data: CoachTurnDone) => void;
  onMeta?: (data: { sessionId?: string }) => void;
};

/** Parse one or more SSE frames. Returns unconsumed trailing buffer. */
export function applyCoachTurnSseChunk(
  buffer: string,
  chunk: string,
  handlers: CoachTurnSseHandlers,
): string {
  const combined = buffer + chunk;
  const parts = combined.split('\n\n');
  const rest = parts.pop() || '';
  for (const part of parts) {
    if (!part.trim()) continue;
    let event = 'message';
    const dataLines: string[] = [];
    for (const line of part.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
    }
    if (!dataLines.length) continue;
    try {
      const data = JSON.parse(dataLines.join('\n')) as CoachTurnDone & {
        text?: string;
        sessionId?: string;
      };
      if (event === 'token' && typeof data.text === 'string' && data.text) {
        handlers.onToken?.(data.text);
      } else if (event === 'done') {
        handlers.onDone?.(data);
      } else if (event === 'error') {
        handlers.onError?.(data);
      } else if (event === 'meta') {
        handlers.onMeta?.(data);
      }
    } catch {
      /* ignore incomplete frames */
    }
  }
  return rest;
}
