'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Repeat } from 'lucide-react';

type BookingStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'NO_SHOW';
type PayoutStatus = 'PAID' | 'PENDING';

type MockBooking = {
  candidate: string;
  interviewer: string;
  company: string | null;
  date: string;
  status: BookingStatus;
  payout: PayoutStatus;
  slaOverdue: boolean;
};

const mockBookings: MockBooking[] = [
  { candidate: 'سارة المحمدي', interviewer: 'أ. ريم العتيبي', company: null, date: '2026-07-28', status: 'COMPLETED', payout: 'PAID', slaOverdue: false },
  { candidate: 'أحمد العتيبي', interviewer: 'م. سلطان الحربي', company: 'نيوم', date: '2026-07-27', status: 'COMPLETED', payout: 'PAID', slaOverdue: false },
  { candidate: 'نورة القحطاني', interviewer: 'د. طارق النعيمي', company: 'أرامكو', date: '2026-07-25', status: 'IN_PROGRESS', payout: 'PENDING', slaOverdue: true },
  { candidate: 'فهد العنزي', interviewer: 'د. منى الراشد', company: null, date: '2026-07-24', status: 'UPCOMING', payout: 'PENDING', slaOverdue: false },
  { candidate: 'خالد الشمري', interviewer: 'م. فيصل العمري', company: 'STC', date: '2026-07-20', status: 'NO_SHOW', payout: 'PENDING', slaOverdue: true },
  { candidate: 'ليلى الدوسري', interviewer: 'أ. ريم العتيبي', company: null, date: '2026-07-18', status: 'COMPLETED', payout: 'PAID', slaOverdue: false },
];

const STATUS_COLORS: Record<BookingStatus, string> = {
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  IN_PROGRESS: 'bg-cyan/10 text-cyan border-cyan/30',
  UPCOMING: 'bg-gold/10 text-gold border-gold/30',
  NO_SHOW: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const STATUS_KEYS: Record<BookingStatus, string> = {
  COMPLETED: 'statusCompleted',
  IN_PROGRESS: 'statusInProgress',
  UPCOMING: 'statusUpcoming',
  NO_SHOW: 'statusNoShow',
};

const PAYOUT_COLORS: Record<PayoutStatus, string> = {
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  PENDING: 'bg-[var(--status-amber)]/10 text-[var(--status-amber)] border-[var(--status-amber)]/30',
};

const PAYOUT_KEYS: Record<PayoutStatus, string> = {
  PAID: 'payoutPaid',
  PENDING: 'payoutPending',
};

export default function BookingsPage() {
  const t = useTranslations('adminPanel.bookings');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reassignOpen, setReassignOpen] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState('');

  const filtered = mockBookings.filter((b) => {
    if (statusFilter === 'SLA_OVERDUE' && !b.slaOverdue) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          {t('title')}
        </h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full glass-input sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('statusAll')}</SelectItem>
            <SelectItem value="SLA_OVERDUE">{t('statusSlaOverdue')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <GlowCard className="overflow-hidden !p-0">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-[var(--text-muted)]">{t('colCandidate')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colInterviewer')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colCompany')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colDate')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colStatus')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colPayout')}</TableHead>
                <TableHead className="text-[var(--text-muted)]">{t('colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b, i) => (
                <TableRow
                  key={i}
                  className={`border-white/[0.06] hover:bg-white/[0.02] ${b.slaOverdue ? 'bg-red-500/[0.04]' : ''}`}
                >
                  <TableCell className="font-medium text-[var(--text-primary)]">{b.candidate}</TableCell>
                  <TableCell className="text-[var(--text-muted)]">{b.interviewer}</TableCell>
                  <TableCell>
                    {b.company ? (
                      <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                        {b.company}
                      </Badge>
                    ) : (
                      <span className="text-[var(--text-faint)]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-[var(--text-muted)] font-mono">{b.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[b.status]}>
                      {t(STATUS_KEYS[b.status])}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={PAYOUT_COLORS[b.payout]}>
                      {t(PAYOUT_KEYS[b.payout])}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 border-cyan/30 text-cyan hover:bg-cyan/10"
                      onClick={() => setReassignOpen(true)}
                    >
                      <Repeat size={14} strokeWidth={1.75} />
                      {t('reassign')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlowCard>

      {/* Reassign Dialog */}
      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent className="glass-card !bg-[var(--bg-panel)] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">{t('reassignTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--text-muted)]">{t('reassignDesc')}</p>
          <Select value={selectedInterviewer} onValueChange={setSelectedInterviewer}>
            <SelectTrigger className="glass-input">
              <SelectValue placeholder={t('selectInterviewer')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">أ. ريم العتيبي</SelectItem>
              <SelectItem value="2">د. طارق النعيمي</SelectItem>
              <SelectItem value="3">د. منى الراشد</SelectItem>
              <SelectItem value="4">م. فيصل العمري</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              className="bg-cyan text-void hover:bg-cyan/80 font-bold"
              onClick={() => setReassignOpen(false)}
            >
              {t('reassign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
