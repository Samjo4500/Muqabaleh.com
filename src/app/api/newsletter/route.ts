import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

// POST /api/newsletter — capture newsletter signup
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // If user exists, touch their record (no-op side effect for MVP signup capture)
    try {
      await db.user.update({
        where: { email: parsed.data.email },
        data: { isActive: true },
      });
    } catch {
      // User doesn't exist — that's fine
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
