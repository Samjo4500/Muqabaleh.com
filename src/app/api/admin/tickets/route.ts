import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';
import { sendEmail } from '@/lib/email';

/**
 * PATCH { ticketId, status?, assigneeId?, priority?, replySubject?, replyBody? }
 * Assign / close tickets; optional email reply to creator.
 */
export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    ticketId?: string;
    status?: string;
    assigneeId?: string | null;
    priority?: string;
    replySubject?: string;
    replyBody?: string;
  };

  const ticketId = String(body.ticketId || '').trim();
  if (!ticketId) {
    return NextResponse.json({ error: 'ticketId required' }, { status: 400 });
  }

  const data: {
    status?: string;
    assigneeId?: string | null;
    priority?: string;
    closedAt?: Date | null;
  } = {};

  if (typeof body.status === 'string') {
    data.status = body.status.toUpperCase();
    if (data.status === 'CLOSED' || data.status === 'RESOLVED') {
      data.closedAt = new Date();
    }
    if (data.status === 'OPEN' || data.status === 'IN_PROGRESS') {
      data.closedAt = null;
    }
  }
  if (body.assigneeId === null) data.assigneeId = null;
  else if (typeof body.assigneeId === 'string') data.assigneeId = body.assigneeId || auth.adminId || null;
  if (typeof body.priority === 'string') data.priority = body.priority.toUpperCase();

  // Default assign-to-self when only "assign" with no assignee
  if (data.assigneeId === undefined && body.assigneeId === undefined && !body.status && !body.replyBody) {
    data.assigneeId = auth.adminId ?? null;
    data.status = data.status ?? 'IN_PROGRESS';
  }

  const ticket = await db.supportTicket.update({
    where: { id: ticketId },
    data,
    include: {
      createdBy: { select: { email: true, name: true } },
    },
  });

  let emailed = false;
  if (body.replyBody && ticket.createdBy?.email) {
    try {
      await sendEmail({
        to: ticket.createdBy.email,
        subject: body.replySubject || `Re: ${ticket.subject}`,
        html: `<p>${String(body.replyBody).replace(/\n/g, '<br/>')}</p><hr/><p style="color:#666;font-size:12px">Muqabaleh Support</p>`,
      });
      emailed = true;
    } catch (err) {
      console.error('[admin/tickets] reply email failed', err);
    }
  }

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'support_ticket',
      entityId: ticket.id,
      details: { ...data, emailed },
    });
  }

  return NextResponse.json({ ok: true, ticket, emailed });
}
