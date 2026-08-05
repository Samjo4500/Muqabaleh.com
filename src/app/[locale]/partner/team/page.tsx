'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, UserPlus } from 'lucide-react';
import type { PartnerMember } from '@/lib/partner/types';
import { Field, PageHeader, Panel } from '@/components/partner/ui';

export default function PartnerTeamPage() {
  const t = useTranslations('partnerConsole');
  const [members, setMembers] = useState<PartnerMember[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PARTNER_MEMBER' as 'PARTNER_ADMIN' | 'PARTNER_MEMBER',
  });

  const load = async () => {
    const res = await fetch('/api/partner/team');
    const data = await res.json();
    setMembers(data.members || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch('/api/partner/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ name: '', email: '', password: '', role: 'PARTNER_MEMBER' });
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow={t('navTeam')} title={t('teamTitle')} description={t('teamDesc')} />

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Panel title={t('inviteMember')}>
          <form className="space-y-3" onSubmit={submit}>
            <Field label={t('fieldName')}>
              <input
                className="pc-input"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label={t('fieldAdminEmail')}>
              <input
                className="pc-input"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label={t('fieldTempPassword')}>
              <input
                className="pc-input"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>
            <Field label={t('fieldRole')}>
              <select
                className="pc-input"
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as 'PARTNER_ADMIN' | 'PARTNER_MEMBER',
                  })
                }
              >
                <option value="PARTNER_MEMBER">{t('roleMember')}</option>
                <option value="PARTNER_ADMIN">{t('roleAdmin')}</option>
              </select>
            </Field>
            <button type="submit" className="pc-btn pc-btn-primary" disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {t('invite')}
            </button>
          </form>
        </Panel>

        <Panel title={t('teamRoster')}>
          <ul className="space-y-3">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{m.name || m.email}</div>
                  <div className="text-xs text-white/45">
                    {m.email} · {m.role}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    m.isActive ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/10 text-white/50'
                  }`}
                >
                  {m.isActive ? t('active') : t('inactive')}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
