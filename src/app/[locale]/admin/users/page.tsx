'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { GlowCard } from '@/components/brand';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type Role = 'USER' | 'ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_MEMBER' | 'INTERVIEWER';

type MockUser = {
  name: string;
  email: string;
  role: Role;
  accountType: 'personal' | 'b2b';
  sessionsLeft: number;
  active: boolean;
  created: string;
};

const mockUsers: MockUser[] = [
  { name: 'سارة المحمدي', email: 'sara@example.com', role: 'USER', accountType: 'personal', sessionsLeft: 3, active: true, created: '2025-06-15' },
  { name: 'أحمد العتيبي', email: 'ahmed@example.com', role: 'COMPANY_ADMIN', accountType: 'b2b', sessionsLeft: 47, active: true, created: '2025-05-20' },
  { name: 'نورة القحطاني', email: 'noura@example.com', role: 'USER', accountType: 'personal', sessionsLeft: 0, active: false, created: '2025-04-10' },
  { name: 'فهد العنزي', email: 'fahad@example.com', role: 'INTERVIEWER', accountType: 'personal', sessionsLeft: 12, active: true, created: '2025-03-22' },
  { name: 'خالد الشمري', email: 'khalid@example.com', role: 'COMPANY_MEMBER', accountType: 'b2b', sessionsLeft: 8, active: true, created: '2025-06-01' },
  { name: 'ليلى الدوسري', email: 'layla@example.com', role: 'USER', accountType: 'personal', sessionsLeft: 1, active: true, created: '2025-07-05' },
  { name: 'سلطان الحربي', email: 'sultan@example.com', role: 'ADMIN', accountType: 'personal', sessionsLeft: 0, active: true, created: '2025-01-01' },
  { name: 'هند السالم', email: 'hind@example.com', role: 'COMPANY_MEMBER', accountType: 'b2b', sessionsLeft: 5, active: false, created: '2025-05-18' },
];

const ROLE_BADGE_KEYS: Record<Role, string> = {
  USER: 'roleUser',
  ADMIN: 'roleAdmin',
  COMPANY_ADMIN: 'roleCompanyAdmin',
  COMPANY_MEMBER: 'roleCompanyMember',
  INTERVIEWER: 'roleInterviewer',
};

const ROLE_COLORS: Record<Role, string> = {
  USER: 'bg-[var(--bg-card)] text-[var(--text-muted)] border-white/10',
  ADMIN: 'bg-red-500/10 text-red-400 border-red-500/30',
  COMPANY_ADMIN: 'bg-gold/10 text-gold border-gold/30',
  COMPANY_MEMBER: 'bg-cyan/10 text-cyan border-cyan/30',
  INTERVIEWER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

export default function UsersPage() {
  const t = useTranslations('adminPanel.users');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionCount, setSessionCount] = useState('');
  const [users, setUsers] = useState(mockUsers);

  const filtered = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter === 'active' && !u.active) return false;
    if (statusFilter === 'inactive' && u.active) return false;
    if (search && !u.name.includes(search) && !u.email.includes(search)) return false;
    return true;
  });

  function toggleActive(idx: number) {
    setUsers((prev) => {
      const copy = [...prev];
      const user = filtered[idx];
      const realIdx = prev.indexOf(user);
      copy[realIdx] = { ...copy[realIdx], active: !copy[realIdx].active };
      return copy;
    });
  }

  function addSessions(idx: number) {
    const count = parseInt(sessionCount, 10);
    if (isNaN(count) || count <= 0) return;
    setUsers((prev) => {
      const copy = [...prev];
      const user = filtered[idx];
      const realIdx = prev.indexOf(user);
      copy[realIdx] = { ...copy[realIdx], sessionsLeft: copy[realIdx].sessionsLeft + count };
      return copy;
    });
    setDialogOpen(false);
    setSessionCount('');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        {t('title')}
      </h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} strokeWidth={1.75} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="ps-10 glass-input"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full glass-input sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('roleAll')}</SelectItem>
            <SelectItem value="USER">{t('roleUser')}</SelectItem>
            <SelectItem value="ADMIN">{t('roleAdmin')}</SelectItem>
            <SelectItem value="COMPANY_ADMIN">{t('roleCompanyAdmin')}</SelectItem>
            <SelectItem value="COMPANY_MEMBER">{t('roleCompanyMember')}</SelectItem>
            <SelectItem value="INTERVIEWER">{t('roleInterviewer')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full glass-input sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('statusAll')}</SelectItem>
            <SelectItem value="active">{t('statusActive')}</SelectItem>
            <SelectItem value="inactive">{t('statusInactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <GlowCard className="overflow-hidden !p-0">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-[var(--text-muted)]">{t('colName')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colEmail')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colRole')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colAccountType')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colSessionsLeft')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colStatus')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colCreated')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u, i) => (
                <TableRow key={i} className="border-white/[0.06] hover:bg-white/[0.02]">
                  <TableCell className="font-medium text-[var(--text-primary)]">{u.name}</TableCell>
                  <TableCell className="text-[var(--text-muted)]">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ROLE_COLORS[u.role]}>
                      {t(ROLE_BADGE_KEYS[u.role])}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--text-muted)]">{u.accountType === 'b2b' ? t('typeB2B') : t('typePersonal')}</TableCell>
                  <TableCell className="text-[var(--text-primary)] font-mono">{u.sessionsLeft}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={u.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}>
                      {u.active ? t('statusActive') : t('statusInactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--text-muted)]">{u.created}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={u.active}
                        onCheckedChange={() => toggleActive(i)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 border-gold/30 text-gold hover:bg-gold/10"
                        onClick={() => setDialogOpen(true)}
                      >
                        <Plus size={14} strokeWidth={1.75} />
                        {t('addSessions')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlowCard>

      {/* Add Sessions Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card !bg-[var(--bg-panel)] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">{t('addSessionsTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label className="text-[var(--text-muted)]">{t('sessionsCount')}</Label>
            <Input
              type="number"
              min={1}
              value={sessionCount}
              onChange={(e) => setSessionCount(e.target.value)}
              placeholder={t('sessionsPlaceholder')}
              className="glass-input"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => addSessions(0)}
              className="bg-gold text-void hover:bg-gold-hover font-bold"
            >
              {t('addSessions')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
