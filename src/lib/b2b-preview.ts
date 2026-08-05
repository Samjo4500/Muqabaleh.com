/**
 * Business console ships as a public preview until sales enables live access.
 * Set NEXT_PUBLIC_B2B_CONSOLE_LIVE=true (and optionally B2B_CONSOLE_LIVE=true on the server)
 * to unlock write APIs / remove the preview gate.
 */
export const B2B_CONSOLE_PREVIEW =
  process.env.NEXT_PUBLIC_B2B_CONSOLE_LIVE !== 'true' &&
  process.env.B2B_CONSOLE_LIVE !== 'true';

export function b2bPreviewWriteBlocked() {
  if (!B2B_CONSOLE_PREVIEW) return null;
  return {
    error:
      'Business console is in preview mode. Request a demo for full access.',
    code: 'B2B_PREVIEW_LOCKED' as const,
  };
}
