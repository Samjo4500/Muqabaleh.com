import { NextResponse } from 'next/server';

// GET /api/config — tells the frontend which services are available
// This endpoint NEVER requires authentication or a database
export async function GET() {
  const isDemoMode = process.env.DEMO_MODE === 'true';

  return NextResponse.json({
    demoMode: isDemoMode,
    services: {
      database: !!process.env.DATABASE_URL,
      gemini: !!process.env.GEMINI_API_KEY,
      azureSpeech: !!process.env.AZURE_SPEECH_KEY,
      paypal: !!process.env.PAYPAL_CLIENT_ID,
      email: !!process.env.RESEND_API_KEY,
      auth: !!(process.env.NEXTAUTH_SECRET && process.env.DATABASE_URL),
    },
  });
}
