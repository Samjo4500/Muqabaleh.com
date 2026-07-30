'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlowCard } from '@/components/brand';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { ChevronDown, ChevronUp } from 'lucide-react';

type Status = 'PENDING' | 'APPROVED' | 'SUSPENDED';

type MockInterviewer = {
  name: string;
  title: string;
  sectors: string;
  sessions: number;
  rating: string;
  status: Status;
  bio: string;
};

const mockInterviewers: MockInterviewer[] = [
  { name: 'د. هدى السالم', title: 'مديرة موارد بشرية', sectors: 'sectors1', sessions: 0, rating: '-', status: 'PENDING', bio: 'bio1' },
  { name: 'م. سلطان الحربي', title: 'مهندس برمجيات أول', sectors: 'sectors2', sessions: 0, rating: '-', status: 'PENDING', bio: 'bio2' },
  { name: 'أ. ريم العتيبي', title: 'مديرة تسويق رقمي', sectors: 'sectors3', sessions: 34, rating: '4.8', status: 'APPROVED', bio: 'bio3' },
  { name: 'د. طارق النعيمي', title: 'استشاري مالي', sectors: 'sectors4', sessions: 56, rating: '4.9', status: 'APPROVED', bio: 'bio4' },
  { name: 'د. منى الراشد', title: 'استشارية صحية', sectors: 'sectors5', sessions: 22, rating: '4.7', status: 'APPROVED', bio: 'bio5' },
  { name: 'م. فيصل العمري', title: 'مهندس مدني', sectors: 'sectors6', sessions: 41, rating: '4.6', status: 'APPROVED', bio: 'bio6' },
  { name: 'أ. سعاد المالكي', title: 'مديرة تعليمية', sectors: 'sectors7', sessions: 18, rating: '3.2', status: 'SUSPENDED', bio: 'bio7' },
  { name: 'م. عمر البلوي', title: 'مطور تطبيقات', sectors: 'sectors8', sessions: 7, rating: '2.8', status: 'SUSPENDED', bio: 'bio8' },
];

const STATUS_COLORS: Record<Status, string> = {
  PENDING: 'bg-[var(--status-amber)]/10 text-[var(--status-amber)] border-[var(--status-amber)]/30',
  APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  SUSPENDED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const STATUS_KEYS: Record<Status, string> = {
  PENDING: 'statusPending',
  APPROVED: 'statusApproved',
  SUSPENDED: 'statusSuspended',
};

export default function InterviewersPage() {
  const t = useTranslations('adminPanel.interviewers');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [interviewers, setInterviewers] = useState(mockInterviewers);

  const filtered = interviewers.filter((u) => {
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    return true;
  });

  function approve(idx: number) {
    setInterviewers((prev) => {
      const copy = [...prev];
      const user = filtered[idx];
      const realIdx = prev.indexOf(user);
      copy[realIdx] = { ...copy[realIdx], status: 'APPROVED' as Status };
      return copy;
    });
  }

  function suspend(idx: number) {
    setInterviewers((prev) => {
      const copy = [...prev];
      const user = filtered[idx];
      const realIdx = prev.indexOf(user);
      copy[realIdx] = { ...copy[realIdx], status: 'SUSPENDED' as Status };
      return copy;
    });
  }

  function reject(idx: number) {
    setInterviewers((prev) => {
      const copy = [...prev];
      const user = filtered[idx];
      const realIdx = prev.indexOf(user);
      copy.splice(realIdx, 1);
      return copy;
    });
    setRejectOpen(false);
    setRejectReason('');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          {t('title')}
        </h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full glass-input sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('statusAll')}</SelectItem>
            <SelectItem value="PENDING">{t('statusPending')}</SelectItem>
            <SelectItem value="APPROVED">{t('statusApproved')}</SelectItem>
            <SelectItem value="SUSPENDED">{t('statusSuspended')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <GlowCard className="overflow-hidden !p-0">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-[var(--text-muted)]">{t('colName')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colTitle')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colSectors')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colSessions')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colRating')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colStatus')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u, i) => (
                <>
                  <TableRow
                    key={i}
                    className={`border-white/[0.06] hover:bg-white/[0.02] ${u.status === 'PENDING' ? 'bg-[var(--status-amber)]/[0.03]' : ''}`}
                  >
                    <TableCell>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 font-medium text-gold hover:underline"
                        onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                      >
                        {u.name}
                        {expandedIdx === i ? <ChevronUp size={14} strokeWidth={1.75} /> : <ChevronDown size={14} strokeWidth={1.75} />}
                      </button>
                    </TableCell>
                    <TableCell className="text-[var(--text-muted)]">{u.title}</TableCell>
                    <TableCell className="text-[var(--text-muted)] max-w-[160px] truncate">{t(u.sectors as `sectors${number}`)}</TableCell>
                    <TableCell className="text-[var(--text-primary)] font-mono">{u.sessions}</TableCell>
                    <TableCell className={u.rating === '-' ? 'text-[var(--text-faint)]' : 'text-gold font-mono'}>{u.rating}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[u.status]}>
                        {t(STATUS_KEYS[u.status])}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {u.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              className="h-8 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              onClick={() => approve(i)}
                            >
                              {t('approve')}
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                              onClick={() => setRejectOpen(true)}
                            >
                              {t('reject')}
                            </Button>
                          </>
                        )}
                        {u.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            className="h-8 bg-[var(--status-amber)]/10 text-[var(--status-amber)] border border-[var(--status-amber)]/30 hover:bg-[var(--status-amber)]/20"
                            onClick={() => suspend(i)}
                          >
                            {t('suspend')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedIdx === i && (
                    <TableRow key={`${i}-bio`} className="border-white/[0.06] hover:bg-transparent">
                      <TableCell colSpan={7} className="p-4">
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gold">
                            {t('bioPreview')}
                          </p>
                          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                            {t(u.bio as `bio${number}`)}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlowCard>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="glass-card !bg-[var(--bg-panel)] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">{t('rejectTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label className="text-[var(--text-muted)]">{t('rejectReason')}</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('rejectReasonPlaceholder')}
              className="glass-input min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => reject(0)}
              className="bg-red-500/80 text-white hover:bg-red-500 font-bold"
            >
              {t('reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
