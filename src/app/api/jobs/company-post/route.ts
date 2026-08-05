import { NextRequest, NextResponse } from 'next/server';
import { hashSync } from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAtsSession } from '@/lib/ats/auth';
import { serializePublicJob } from '@/lib/ats/serialize';
import { MENA_COUNTRIES } from '@/lib/constants';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp, sanitizeObject } from '@/lib/security';
import { triggerWelcomeEmail } from '@/lib/email-triggers';

const COUNTRY_CODES = new Set([
  ...MENA_COUNTRIES.map((c) => c.code),
  'REMOTE',
]);

const schema = z.object({
  // Company / account (required when not logged in as company)
  contactName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200).optional(),
  companyName: z.string().min(2).max(160),
  companySize: z.string().max(40).optional(),
  companyIndustry: z.string().max(80).optional(),
  companyCountry: z.string().max(8),
  // Vacancy
  title: z.string().min(2).max(160),
  titleAr: z.string().max(160).optional().nullable(),
  description: z.string().max(20000).optional().nullable(),
  requirements: z.string().max(10000).optional().nullable(),
  employmentType: z
    .enum(['fulltime', 'contract', 'remote', 'hybrid'])
    .default('fulltime'),
  careerLevel: z
    .enum(['JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'])
    .optional()
    .nullable(),
  department: z.string().max(80).optional().nullable(),
  country: z.string().max(8),
  city: z.string().max(80).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  salaryRange: z.string().max(80).optional().nullable(),
  tags: z.string().max(400).optional().nullable(),
});

/**
 * Public: companies register (or use existing company session) and post a vacancy.
 */
export async function POST(req: NextRequest) {
  const ip = await getClientIp();
  const rl = checkRateLimit(ip, '/api/jobs/company-post', 8);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
  }

  try {
    const body = schema.parse(sanitizeObject(await req.json()));
    if (!COUNTRY_CODES.has(body.country) || !COUNTRY_CODES.has(body.companyCountry)) {
      return NextResponse.json({ error: 'Invalid country' }, { status: 400 });
    }

    const session = await getAtsSession();
    let companyId = session?.companyId || null;
    let userId = session?.id || null;
    let createdAccount = false;

    if (
      session &&
      (session.role === 'COMPANY_ADMIN' || session.role === 'SUPER_ADMIN') &&
      companyId
    ) {
      // Existing company session — post vacancy only
      userId = session.id;
    } else {
      // Register new company + admin
      if (!body.password || body.password.length < 8) {
        return NextResponse.json(
          { error: 'Password (8+ characters) is required to register your company' },
          { status: 400 },
        );
      }
      const email = body.email.trim().toLowerCase();
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          {
            error:
              'Email already registered. Sign in as a company account, then post a vacancy.',
          },
          { status: 409 },
        );
      }

      const company = await db.company.create({
        data: {
          name: body.companyName.trim(),
          size: body.companySize || 'SMALL',
          industry: body.companyIndustry || 'Other',
          country: body.companyCountry,
          plan: 'B2B_STARTER',
          credits: 0,
        },
      });

      const user = await db.user.create({
        data: {
          email,
          passwordHash: hashSync(body.password, 12),
          name: body.contactName.trim(),
          role: 'COMPANY_ADMIN',
          accountType: 'B2B',
          companyId: company.id,
          country: body.companyCountry,
          industry: body.companyIndustry || null,
        },
      });

      companyId = company.id;
      userId = user.id;
      createdAccount = true;
      triggerWelcomeEmail(user.id, 'ar').catch(() => {});
      triggerWelcomeEmail(user.id, 'en').catch(() => {});
    }

    if (!companyId || !userId) {
      return NextResponse.json({ error: 'Unable to resolve company' }, { status: 400 });
    }

    const countryMeta = MENA_COUNTRIES.find((c) => c.code === body.country);
    const locationLabel =
      body.location ||
      (body.country === 'REMOTE'
        ? 'Remote · MENA'
        : [body.city, countryMeta?.name_en].filter(Boolean).join(', ') ||
          countryMeta?.name_en ||
          body.country);

    const job = await db.b2BJob.create({
      data: {
        companyId,
        createdById: userId,
        title: body.title.trim(),
        titleAr: body.titleAr || null,
        industry: body.companyIndustry || 'Other',
        type: 'behavioral',
        mode: 'AI',
        description: body.description || null,
        requirements: body.requirements || null,
        employmentType: body.employmentType,
        careerLevel: body.careerLevel || null,
        department: body.department || null,
        country: body.country,
        city: body.city || null,
        location: locationLabel,
        salaryRange: body.salaryRange || null,
        tags: body.tags || null,
        isPublic: true,
        status: 'OPEN',
      },
      include: {
        company: { select: { id: true, name: true, industry: true, country: true } },
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        createdAccount,
        job: serializePublicJob(job),
        redirectTo: createdAccount
          ? '/auth/signin?callbackUrl=/b2b/jobs&from=vacancies'
          : '/b2b/jobs',
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: e.issues }, { status: 400 });
    }
    console.error('POST /api/jobs/company-post', e);
    return NextResponse.json({ error: 'Failed to post vacancy' }, { status: 500 });
  }
}
