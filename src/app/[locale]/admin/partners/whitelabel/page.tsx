'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { localePath } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';

type Partner = {
  id: string;
  name: string;
  slug: string;
  status: string;
  contactEmail: string;
  customDomain: string | null;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  supportEmail: string | null;
};

export default function Page() {
  const locale = useLocale();
  const [items, setItems] = useState<Partner[]>([]);
  const [active, setActive] = useState<Partner | null>(null);

  useEffect(() => {
    void fetch('/api/admin/partners/manage')
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d.items) ? d.items : [];
        setItems(list);
        setActive(list.find((p: Partner) => p.status === 'ACTIVE') ?? list[0] ?? null);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={{ ar: 'العلامة البيضاء', en: 'Whitelabel' }}
        description={{
          ar: 'معاينة هوية كل شريك من المحفظة. التعديل التشغيلي من محفظة الشركاء أو لوحة الشريك.',
          en: 'Preview each partner brand from the portfolio. Operational edits via Partner Portfolio or partner console.',
        }}
        actions={
          <Link
            href={localePath('/admin/partners/list', locale)}
            className="inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-sm"
          >
            <BiInline ar="محفظة الشركاء" en="Partner portfolio" />
          </Link>
        }
      />

      {!items.length ? (
        <p className="text-sm text-[var(--text-muted)]">
          No partners yet — approve an application to provision branding.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="max-h-[480px] overflow-auto rounded-2xl border border-white/10">
            {items.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p)}
                className={`block w-full border-b border-white/5 px-3 py-3 text-start text-sm hover:bg-white/5 ${
                  active?.id === p.id ? 'bg-white/5' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.primaryColor }} />
                  <span className="font-medium">{p.name}</span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">{p.slug}</div>
              </button>
            ))}
          </aside>
          {active ? (
            <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-medium">{active.name}</h3>
                <Badge variant="outline">{active.status}</Badge>
              </div>
              <div
                className="mb-5 rounded-xl border border-white/10 p-6"
                style={{
                  background: `linear-gradient(135deg, ${active.primaryColor}33, ${active.accentColor}22)`,
                }}
              >
                <div className="text-sm text-white/70">Preview surface</div>
                <div className="mt-2 text-2xl font-semibold">{active.name}</div>
                <div className="mt-1 text-sm text-white/60">{active.customDomain || `${active.slug}.partner`}</div>
              </div>
              <dl className="grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-[var(--text-muted)]">Contact</dt>
                  <dd>{active.contactEmail}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Support</dt>
                  <dd>{active.supportEmail || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Logo</dt>
                  <dd className="break-all">{active.logoUrl || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Colors</dt>
                  <dd>
                    {active.primaryColor} / {active.accentColor}
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
