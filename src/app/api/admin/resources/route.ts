import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

type ResourceKey =
  | 'templates'
  | 'questions'
  | 'rubrics'
  | 'partner_applications'
  | 'email_templates'
  | 'notification_logs'
  | 'api_keys'
  | 'backup_logs'
  | 'support_tickets'
  | 'admin_roles'
  | 'ai_usage'
  | 'audit_logs'
  | 'users'
  | 'candidates'
  | 'admins'
  | 'companies'
  | 'sessions'
  | 'subscriptions'
  | 'transactions';

function parseResource(raw: string | null): ResourceKey | null {
  if (!raw) return null;
  const allowed: ResourceKey[] = [
    'templates',
    'questions',
    'rubrics',
    'partner_applications',
    'email_templates',
    'notification_logs',
    'api_keys',
    'backup_logs',
    'support_tickets',
    'admin_roles',
    'ai_usage',
    'audit_logs',
    'users',
    'candidates',
    'admins',
    'companies',
    'sessions',
    'subscriptions',
    'transactions',
  ];
  return allowed.includes(raw as ResourceKey) ? (raw as ResourceKey) : null;
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const resource = parseResource(req.nextUrl.searchParams.get('resource'));
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  if (!resource) {
    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
  }

  try {
    const items = await listResource(resource, q);
    return NextResponse.json({ items });
  } catch (e) {
    console.error('[admin/resources GET]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const resource = parseResource(req.nextUrl.searchParams.get('resource'));
  if (!resource) {
    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  try {
    const created = await createResource(resource, body);
    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'CREATE',
        entity: resource,
        entityId: created && typeof created === 'object' && 'id' in created ? String((created as { id: string }).id) : null,
        details: { body },
      });
    }
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e) {
    console.error('[admin/resources POST]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const resource = parseResource(req.nextUrl.searchParams.get('resource'));
  const id = req.nextUrl.searchParams.get('id');
  if (!resource || !id) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // audit_logs are immutable
  if (resource === 'audit_logs') {
    return NextResponse.json({ error: 'Audit logs are immutable' }, { status: 403 });
  }

  try {
    await deleteResource(resource, id);
    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'DELETE',
        entity: resource,
        entityId: id,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/resources DELETE]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

async function listResource(resource: ResourceKey, q: string) {
  switch (resource) {
    case 'templates':
      return db.interviewTemplate.findMany({
        where: q
          ? { OR: [{ titleAr: { contains: q, mode: 'insensitive' } }, { titleEn: { contains: q, mode: 'insensitive' } }] }
          : undefined,
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    case 'questions':
      return db.questionBankItem.findMany({
        where: q
          ? { OR: [{ textAr: { contains: q, mode: 'insensitive' } }, { textEn: { contains: q, mode: 'insensitive' } }] }
          : undefined,
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    case 'rubrics':
      return db.scoringRubric.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    case 'partner_applications':
      return db.partnerApplication.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    case 'email_templates':
      return db.emailTemplate.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    case 'notification_logs':
      return db.notificationLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    case 'api_keys':
      return db.apiKeyRecord.findMany({
        select: { id: true, provider: true, label: true, keyHint: true, isActive: true, lastUsedAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    case 'backup_logs':
      return db.backupLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    case 'support_tickets':
      return db.supportTicket.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    case 'admin_roles':
      return db.adminRole.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    case 'ai_usage':
      return db.aiApiUsage.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    case 'audit_logs':
      return db.adminAuditLog.findMany({
        include: { admin: { select: { email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
    case 'users':
      return db.user.findMany({
        where: q ? { OR: [{ email: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }] } : undefined,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tier: true,
          isActive: true,
          createdAt: true,
          sessionsLeft: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    case 'candidates':
      return db.user.findMany({
        where: { role: 'USER', ...(q ? { email: { contains: q, mode: 'insensitive' } } : {}) },
        select: { id: true, email: true, name: true, tier: true, sessionsLeft: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    case 'admins':
      return db.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        select: { id: true, email: true, name: true, role: true, totpEnabled: true, lastLoginAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    case 'companies':
      return db.company.findMany({
        where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    case 'sessions':
      return db.interview.findMany({
        select: {
          id: true,
          type: true,
          industry: true,
          mode: true,
          status: true,
          overallScore: true,
          createdAt: true,
          user: { select: { email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    case 'subscriptions':
      return db.paypalSubscription.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    case 'transactions':
      return db.payment.findMany({
        include: { user: { select: { email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    default:
      return [];
  }
}

async function createResource(resource: ResourceKey, body: Record<string, unknown>) {
  switch (resource) {
    case 'templates':
      return db.interviewTemplate.create({
        data: {
          titleAr: String(body.titleAr || 'قالب جديد'),
          titleEn: String(body.titleEn || 'New template'),
          industry: String(body.industry || 'GENERAL'),
          level: String(body.level || 'MID'),
        },
      });
    case 'questions':
      return db.questionBankItem.create({
        data: {
          textAr: String(body.textAr || 'سؤال جديد'),
          textEn: String(body.textEn || 'New question'),
          industry: String(body.industry || 'GENERAL'),
          difficulty: String(body.difficulty || 'MEDIUM'),
        },
      });
    case 'rubrics':
      return db.scoringRubric.create({
        data: {
          nameAr: String(body.nameAr || 'معيار جديد'),
          nameEn: String(body.nameEn || 'New rubric'),
          criteria: body.criteria ?? [],
        },
      });
    case 'partner_applications':
      return db.partnerApplication.create({
        data: {
          companyName: String(body.companyName || 'Partner'),
          contactName: String(body.contactName || 'Contact'),
          email: String(body.email || 'partner@example.com'),
          message: body.message ? String(body.message) : null,
        },
      });
    case 'email_templates':
      return db.emailTemplate.create({
        data: {
          key: String(body.key || `tpl_${Date.now()}`),
          subjectAr: String(body.subjectAr || 'موضوع'),
          subjectEn: String(body.subjectEn || 'Subject'),
          bodyAr: String(body.bodyAr || ''),
          bodyEn: String(body.bodyEn || ''),
        },
      });
    case 'support_tickets':
      return db.supportTicket.create({
        data: {
          subject: String(body.subject || 'New ticket / تذكرة جديدة'),
          body: String(body.body || ''),
          priority: String(body.priority || 'NORMAL'),
        },
      });
    case 'admin_roles':
      return db.adminRole.create({
        data: {
          key: String(body.key || `role_${Date.now()}`),
          nameAr: String(body.nameAr || 'دور'),
          nameEn: String(body.nameEn || 'Role'),
          permissions: body.permissions ?? [],
        },
      });
    case 'backup_logs':
      return db.backupLog.create({
        data: { type: 'MANUAL', status: 'PENDING', notes: 'Triggered from Super Admin' },
      });
    case 'api_keys':
      return db.apiKeyRecord.create({
        data: {
          provider: String(body.provider || 'gemini'),
          label: String(body.label || 'API Key'),
          keyHint: '••••••••',
          keyHash: `hash_${Date.now()}`,
        },
      });
    case 'notification_logs':
      return db.notificationLog.create({
        data: {
          channel: 'IN_APP',
          recipient: String(body.recipient || 'admin'),
          subject: String(body.subject || 'Notification'),
          body: String(body.body || ''),
          status: 'QUEUED',
        },
      });
    default:
      throw new Error('Create not supported');
  }
}

async function deleteResource(resource: ResourceKey, id: string) {
  switch (resource) {
    case 'templates':
      return db.interviewTemplate.delete({ where: { id } });
    case 'questions':
      return db.questionBankItem.delete({ where: { id } });
    case 'rubrics':
      return db.scoringRubric.delete({ where: { id } });
    case 'partner_applications':
      return db.partnerApplication.delete({ where: { id } });
    case 'email_templates':
      return db.emailTemplate.delete({ where: { id } });
    case 'notification_logs':
      return db.notificationLog.delete({ where: { id } });
    case 'api_keys':
      return db.apiKeyRecord.delete({ where: { id } });
    case 'backup_logs':
      return db.backupLog.delete({ where: { id } });
    case 'support_tickets':
      return db.supportTicket.delete({ where: { id } });
    case 'admin_roles':
      return db.adminRole.delete({ where: { id } });
    default:
      throw new Error('Delete not supported');
  }
}
