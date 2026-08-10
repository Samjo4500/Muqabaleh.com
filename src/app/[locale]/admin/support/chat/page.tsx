'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { localePath } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  body: string;
  updatedAt: string;
  createdBy?: { email?: string; name?: string | null };
};

/**
 * Live chat product is not wired — this surface shows open support tickets
 * as the operational inbox (no fake conversations).
 */
export default function Page() {
  const locale = useLocale();
  const [items, setItems] = useState<Ticket[]>([]);
  const [active, setActive] = useState<Ticket | null>(null);

  useEffect(() => {
    void fetch('/api/admin/resources?resource=support_tickets')
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d.items) ? d.items : [];
        setItems(list);
        setActive(list[0] ?? null);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'صندوق الدعم', en: 'Support Inbox' }}
        description={{
          ar: 'لا دردشة مباشرة بعد — هذا عرض لتذاكر الدعم المفتوحة مع رابط لإدارتها.',
          en: 'No live-chat product yet — open support tickets inbox with a link to manage them.',
        }}
        actions={
          <Link
            href={localePath('/admin/support/tickets', locale)}
            className="inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-sm"
          >
            <BiInline ar="إدارة التذاكر" en="Manage tickets" />
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="max-h-[520px] overflow-auto rounded-2xl border border-white/10">
          {items.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t)}
              className={`block w-full border-b border-white/5 px-3 py-3 text-start text-sm hover:bg-white/5 ${
                active?.id === t.id ? 'bg-white/5' : ''
              }`}
            >
              <div className="font-medium line-clamp-1">{t.subject}</div>
              <div className="text-xs text-[var(--text-muted)]">
                {t.createdBy?.email || '—'} · {t.status}
              </div>
            </button>
          ))}
          {!items.length ? (
            <p className="p-4 text-sm text-[var(--text-muted)]">No tickets</p>
          ) : null}
        </aside>
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          {active ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-medium">{active.subject}</h3>
                <Badge variant="outline">{active.status}</Badge>
                <Badge variant="outline">{active.priority}</Badge>
              </div>
              <p className="mb-2 text-xs text-[var(--text-muted)]">
                {active.createdBy?.email} · {new Date(active.updatedAt).toLocaleString()}
              </p>
              <div className="whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{active.body}</div>
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Select a ticket</p>
          )}
        </section>
      </div>
    </div>
  );
}
