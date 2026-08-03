import { NextRequest, NextResponse } from 'next/server';
import { hashSync } from 'bcryptjs';
import { db } from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp, sanitizeObject, auditLog } from '@/lib/security';
import { triggerWelcomeEmail } from '@/lib/email-triggers';

const registerSchema = z.object({
  accountType: z.enum(['INDIVIDUAL', 'B2B']),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  // B2B fields
  companyName: z.string().optional(),
  companySize: z.string().optional(),
  companyIndustry: z.string().optional(),
  companyCountry: z.string().optional(),
  // Individual fields
  country: z.string().optional(),
  industry: z.string().optional(),
  experience: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = await getClientIp();

  // Rate limit: 5 registrations per IP per 15 min
  const rl = checkRateLimit(ip, '/api/auth/register', 5);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many registration attempts' },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const data = registerSchema.parse(sanitizeObject(body));

    // Check if email exists
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل مسبقاً' },
        { status: 409 }
      );
    }

    const passwordHash = hashSync(data.password, 12);

    if (data.accountType === 'B2B') {
      // Create company + company admin
      const company = await db.company.create({
        data: {
          name: data.companyName || 'شركة جديدة',
          size: data.companySize || 'SMALL',
          industry: data.companyIndustry || '',
          country: data.companyCountry || '',
          plan: 'B2B_STARTER',
          credits: 0,
        },
      });

      const user = await db.user.create({
        data: {
          email: data.email,
          passwordHash,
          name: data.name,
          role: 'COMPANY_ADMIN',
          accountType: 'B2B',
          companyId: company.id,
          country: data.companyCountry,
          industry: data.companyIndustry,
        },
      });

      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountType: user.accountType,
        redirectTo: '/b2b/onboarding',
      });
    }

    // Individual user
    const user = await db.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: 'USER',
        accountType: 'INDIVIDUAL',
        country: data.country,
        industry: data.industry,
        experience: data.experience,
        sessionsLeft: 1, // Free trial session
      },
    });

    // Send welcome email (fire and forget)
    triggerWelcomeEmail(user.id, 'ar').catch(() => {});
    triggerWelcomeEmail(user.id, 'en').catch(() => {});

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountType: user.accountType,
      sessionsLeft: user.sessionsLeft,
      redirectTo: '/app',
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: e.issues },
        { status: 400 }
      );
    }
    console.error('Register error:', e);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    );
  }
}
