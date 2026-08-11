'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { B2B_CONSOLE_PREVIEW } from '@/lib/b2b-preview';

type Member = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  joinedAt: string;
};

function roleBadge(role: string) {
  if (role.includes('ADMIN')) {
    return 'border-teal-300/30 bg-teal-400/10 text-teal-300';
  }
  return 'border-white/20 bg-white/5 text-[var(--text-muted)]';
}

export default function TeamPage() {
  const t = useTranslations('b2b.team');
  const [members, setMembers] = useState<Member[]>([]);
  const [seats, setSeats] = useState<{ used: number; cap: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/b2b/team');
      const data = await res.json();
      if (res.ok) {
        setMembers(data.members || []);
        setSeats(data.seats || null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleInvite = async () => {
    if (B2B_CONSOLE_PREVIEW) {
      toast.info('Preview mode — request a demo to invite teammates.');
      return;
    }
    if (!inviteEmail.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/b2b/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          name: inviteName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Invite failed');
        return;
      }
      if (data.tempPassword) {
        toast.success(`Invited. Temp password: ${data.tempPassword}`);
      } else {
        toast.success('Teammate added');
      }
      setInviteOpen(false);
      setInviteEmail('');
      setInviteName('');
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
          {seats ? (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {seats.used}/{seats.cap} seats
            </p>
          ) : null}
        </div>
        <Button
          onClick={() => setInviteOpen(true)}
          className="glass-button flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} strokeWidth={1.75} />
          {t('inviteMember')}
        </Button>
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">
                {t('colName')}
              </th>
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">
                {t('colEmail')}
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">
                {t('colRole')}
              </th>
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">
                {t('colJoined')}
              </th>
              <th className="px-4 py-3 text-end font-medium text-[var(--text-muted)]" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  <Loader2 className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  No teammates yet.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                    {m.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{m.email}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className={roleBadge(m.role)}>
                      {m.role.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-faint)]">
                    {new Date(m.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-[var(--text-faint)] opacity-40"
                      aria-label={t('remove')}
                      disabled
                    >
                      <Trash2 size={16} strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="border-white/10 bg-[#0b1220] text-white">
          <DialogTitle>{t('inviteMember')}</DialogTitle>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="glass-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => void handleInvite()}
              disabled={saving || !inviteEmail.trim()}
              className="glass-button"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : null}
              {t('inviteMember')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
