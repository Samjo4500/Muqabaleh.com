import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

// POST /api/newsletter — capture newsletter signup
// Intentionally does NOT mutate User.isActive (that reactivated soft-deleted accounts).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Accept signup without mutating User records.
    // A dedicated NewsletterSubscriber table can be added later.
    void parsed.data.email;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
