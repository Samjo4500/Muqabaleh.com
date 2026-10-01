export async function register() {
  // Normalize empty/alias env before any route runs (NEXTAUTH_URL, BREVO_KEY, …).
  const { applyRuntimeEnvDefaults } = await import('./lib/env/runtime');
  applyRuntimeEnvDefaults();

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
