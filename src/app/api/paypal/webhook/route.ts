import { NextRequest, NextResponse } from 'next/server';
import { handleWebhook } from '@/lib/paypal/webhook';

/**
 * POST /api/paypal/webhook
 *
 * Body is read raw so the signature can be verified over the exact bytes.
 * All logic lives in lib/paypal/webhook.ts.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const result = await handleWebhook(rawBody, req.headers);
  return NextResponse.json(result.body, { status: result.status });
}
