import { NextResponse } from 'next/server';
import { getPublicPayPalConfig } from '@/lib/paypal';

export const dynamic = 'force-dynamic';

/** Public Client ID + mode. Does not expose PAYPAL_SECRET. */
export async function GET() {
  return NextResponse.json(getPublicPayPalConfig());
}
