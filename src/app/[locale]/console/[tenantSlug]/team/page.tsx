'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ConsoleMember, OrgMemberRole } from '@/lib/console/types';

const ROLES: OrgMemberRole[] = [
  'OWNER',
  'ADMIN',
  'HIRING_MANAGER',
  'REVIEWER',
  'INTERVIEWER',
];

export default function TeamPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const [members, setMembers] = useState<ConsoleMember[]>([]);
  const [seats, setSeats] = useState({ used: 0, cap: 5 });
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<OrgMemberRole>('REVIEWER');
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const res = await fetch(`/api/console/${tenantSlug}/team`);
    const json = await res.json();
    setMembers(json.members || []);
    setSeats(json.seats || { used: 0, cap: 5 });
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  const invite = async () => {
    setError(null);
    const res = await fetch(`/api/console/${tenantSlug}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Failed');
      return;
    }
    setEmail('');
    setName('');
    await reload();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[var(--c-text)]">{t('teamTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--c-text-2)]">
          {t('seats', { used: seats.used, cap: seats.cap })}
        </p>
      </div>

      <div className="mq-console-surface grid gap-3 rounded-xl p-4 md:grid-cols-4">
        <input
          className="mq-console-input"
          placeholder="email@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="mq-console-input"
          placeholder={t('name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="mq-console-input"
          value={role}
          onChange={(e) => setRole(e.target.value as OrgMemberRole)}
        >
          {ROLES.filter((r) => r !== 'OWNER').map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button type="button" className="mq-console-btn-primary" onClick={() => void invite()}>
          {t('qaInvite')}
        </button>
      </div>
      {error ? <p className="text-sm text-[#EF4444]">{error}</p> : null}

      <div className="mq-console-surface overflow-x-auto rounded-xl">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-[var(--c-text-2)]">
            <tr>
              <th className="p-3 text-start">{t('name')}</th>
              <th className="p-3 text-start">Email</th>
              <th className="p-3 text-start">{t('role')}</th>
              <th className="p-3 text-start">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-[var(--c-border)] text-[var(--c-text)]">
                <td className="p-3">{m.name || '—'}</td>
                <td className="p-3">{m.email || m.invitedEmail}</td>
                <td className="p-3">{m.role}</td>
                <td className="p-3">{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[var(--c-text-2)]">{t('rbacHint')}</p>
    </div>
  );
}
