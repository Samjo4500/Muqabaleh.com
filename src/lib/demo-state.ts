// ─── Shared Demo State ───
// Single source of truth for in-memory demo interview state.
// Must be imported by both guest/interview and guest/[token]/messages routes.

export interface DemoInterviewState {
  id: string;
  language: string;
  status: string;
  messageCount: number;
  questions: string[];
}

/**
 * In-memory demo state — shared across all API routes in the same server process.
 *
 * NOTE: In development/restart, this resets. In production with multiple
 * instances, each instance has its own map. This is acceptable for demo mode.
 */
export const demoInterviews = new Map<string, DemoInterviewState>();
