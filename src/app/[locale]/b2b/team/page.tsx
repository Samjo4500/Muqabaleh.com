'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const MEMBERS = [
  { name: 'm1Name', email: 'm1Email', role: 'm1Role', date: 'm1Date' },
  { name: 'm2Name', email: 'm2Email', role: 'm2Role', date: 'm2Date' },
  { name: 'm3Name', email: 'm3Email', role: 'm3Role', date: 'm3Date' },
  { name: 'm4Name', email: 'm4Email', role: 'm4Role', date: 'm4Date' },
] as const;

function roleBadge(role: string) {
  if (role === 'roleAdmin' || role === 'مدير' || role === 'Admin') {
    return 'border-teal-300/30 bg-teal-400/10 text-teal-300';
  }
  return 'border-white/20 bg-white/5 text-[var(--text-muted)]';
}

export default function TeamPage() {
  const t = useTranslations('b2b.team');
  const tCommon = useTranslations('common');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');

  const handleInvite = () => {
    toast.info(tCommon('comingSoon'));
    setInviteOpen(false);
    setInviteEmail('');
    setInviteRole('');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
        <Button
          onClick={() => setInviteOpen(true)}
          className="glass-button flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} strokeWidth={1.75} />
          {t('inviteMember')}
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">{t('colName')}</th>
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">{t('colEmail')}</th>
              <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">{t('colRole')}</th>
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">{t('colJoined')}</th>
              <th className="px-4 py-3 text-end font-medium text-[var(--text-muted)]" />
            </tr>
          </thead>
          <tbody>
            {MEMBERS.map((m, i) => {
              const roleVal = t(m.role);
              return (
                <tr
                  key={i}
                  className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{t(m.name)}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{t(m.email)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className={roleBadge(roleVal)}>
                      {roleVal}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-faint)]">{t(m.date)}</td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-[var(--text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label={t('remove')}
                    >
                      <Trash2 size={16} strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {MEMBERS.map((m, i) => {
          const roleVal = t(m.role);
          return (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{t(m.name)}</p>
                  <p className="mt-1 text-xs text-[var(--text-faint)]">{t(m.email)}</p>
                </div>
                <Badge variant="outline" className={roleBadge(roleVal)}>{roleVal}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">{t('colJoined')}: {t(m.date)}</span>
                <button
                  type="button"
                  className="rounded-lg p-2 text-[var(--text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                  aria-label={t('remove')}
                >
                  <Trash2 size={16} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="border-white/[0.08] bg-[var(--bg-panel)] sm:max-w-md">
          <DialogTitle className="text-lg font-bold text-[var(--text-primary)]">{t('inviteTitle')}</DialogTitle>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-sm text-[var(--text-muted)]">{t('inviteEmail')}</Label>
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={t('inviteEmailPlaceholder')}
                className="glass-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-[var(--text-muted)]">{t('inviteRole')}</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder={t('inviteRolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('roleAdmin')}</SelectItem>
                  <SelectItem value="member">{t('roleMember')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setInviteOpen(false)}
              className="text-[var(--text-muted)] hover:text-teal-300 cursor-pointer"
            >
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleInvite} className="glass-button cursor-pointer">
              {t('sendInvite')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
