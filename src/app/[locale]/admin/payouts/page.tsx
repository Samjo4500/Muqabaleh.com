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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle } from 'lucide-react';

type PayStatus = 'PAID' | 'PENDING' | 'REFUNDED';

type MockPayment = {
  date: string;
  user: string;
  amount: string;
  status: PayStatus;
  orderId: string;
};

type MockDue = {
  interviewer: string;
  amount: string;
  commission: string;
  net: string;
  status: 'PENDING';
};

const mockPayments: MockPayment[] = [
  { date: '2025-07-28', user: 'شركة نيوم', amount: '$149.00', status: 'PAID', orderId: 'ORD-8f3a2' },
  { date: '2025-07-27', user: 'سارة المحمدي', amount: '$19.00', status: 'PAID', orderId: 'ORD-7b1c4' },
  { date: '2025-07-26', user: 'شركة أرامكو', amount: '$399.00', status: 'PAID', orderId: 'ORD-6d2e8' },
  { date: '2025-07-25', user: 'أحمد العتيبي', amount: '$49.00', status: 'REFUNDED', orderId: 'ORD-5a9f1' },
  { date: '2025-07-24', user: 'نورة القحطاني', amount: '$19.00', status: 'PAID', orderId: 'ORD-4c8d3' },
  { date: '2025-07-23', user: 'شركة STC', amount: '$149.00', status: 'PENDING', orderId: 'ORD-3e7b5' },
  { date: '2025-07-22', user: 'فهد العنزي', amount: '$39.00', status: 'PAID', orderId: 'ORD-2f6a9' },
  { date: '2025-07-21', user: 'خالد الشمري', amount: '$19.00', status: 'PAID', orderId: 'ORD-1d5c7' },
];

const mockDues: MockDue[] = [
  { interviewer: 'أ. ريم العتيبي', amount: '$39.00', commission: '$13.65', net: '$25.35', status: 'PENDING' },
  { interviewer: 'د. طارق النعيمي', amount: '$78.00', commission: '$27.30', net: '$50.70', status: 'PENDING' },
  { interviewer: 'د. منى الراشد', amount: '$39.00', commission: '$13.65', net: '$25.35', status: 'PENDING' },
  { interviewer: 'م. فيصل العمري', amount: '$117.00', commission: '$40.95', net: '$76.05', status: 'PENDING' },
  { interviewer: 'م. سلطان الحربي', amount: '$39.00', commission: '$13.65', net: '$25.35', status: 'PENDING' },
];

const STATUS_COLORS: Record<PayStatus, string> = {
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  PENDING: 'bg-[var(--status-amber)]/10 text-[var(--status-amber)] border-[var(--status-amber)]/30',
  REFUNDED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const STATUS_KEYS: Record<PayStatus, string> = {
  PAID: 'statusPaid',
  PENDING: 'statusPending',
  REFUNDED: 'statusRefunded',
};

export default function PayoutsPage() {
  const t = useTranslations('adminPanel.payouts');
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [payMethod, setPayMethod] = useState('');
  const [payNote, setPayNote] = useState('');
  const [dues, setDues] = useState(mockDues);

  function markAsPaid() {
    setDues((prev) => prev.slice(1));
    setMarkPaidOpen(false);
    setPayMethod('');
    setPayNote('');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        {t('title')}
      </h1>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-white/[0.04] border border-white/[0.08]">
          <TabsTrigger value="all" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            {t('tabAll')}
          </TabsTrigger>
          <TabsTrigger value="dues" className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold">
            {t('tabDues')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <GlowCard className="overflow-hidden !p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-[var(--text-muted)]">{t('colDate')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colUser')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colAmount')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colStatus')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colOrderId')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayments.map((p, i) => (
                    <TableRow key={i} className="border-white/[0.06] hover:bg-white/[0.02]">
                      <TableCell className="text-[var(--text-muted)] font-mono">{p.date}</TableCell>
                      <TableCell className="font-medium text-[var(--text-primary)]">{p.user}</TableCell>
                      <TableCell className="text-gold font-mono font-bold">{p.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[p.status]}>
                          {t(STATUS_KEYS[p.status])}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[var(--text-faint)] font-mono text-xs">{p.orderId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GlowCard>
        </TabsContent>

        <TabsContent value="dues">
          <GlowCard className="overflow-hidden !p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-[var(--text-muted)]">{t('colInterviewer')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colAmount')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colCommission')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colNet')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colStatus')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colMethod')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dues.map((d, i) => (
                    <TableRow key={i} className="border-white/[0.06] hover:bg-white/[0.02]">
                      <TableCell className="font-medium text-[var(--text-primary)]">{d.interviewer}</TableCell>
                      <TableCell className="text-[var(--text-primary)] font-mono">{d.amount}</TableCell>
                      <TableCell className="text-[var(--text-muted)] font-mono">{d.commission}</TableCell>
                      <TableCell className="text-gold font-mono font-bold">{d.net}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-[var(--status-amber)]/10 text-[var(--status-amber)] border-[var(--status-amber)]/30">
                          {t('statusPending')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                          onClick={() => setMarkPaidOpen(true)}
                        >
                          <CheckCircle size={14} strokeWidth={1.75} />
                          {t('markAsPaid')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GlowCard>
        </TabsContent>
      </Tabs>

      {/* Mark as Paid Dialog */}
      <Dialog open={markPaidOpen} onOpenChange={setMarkPaidOpen}>
        <DialogContent className="glass-card !bg-[var(--bg-panel)] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">{t('markPaidTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[var(--text-muted)]">{t('paymentMethod')}</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder={t('paymentMethod')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">{t('methodBank')}</SelectItem>
                  <SelectItem value="wise">{t('methodWise')}</SelectItem>
                  <SelectItem value="payoneer">{t('methodPayoneer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text-muted)]">{t('note')}</Label>
              <Textarea
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder={t('notePlaceholder')}
                className="glass-input min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-emerald-500/80 text-white hover:bg-emerald-500 font-bold"
              onClick={markAsPaid}
            >
              {t('markAsPaid')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
