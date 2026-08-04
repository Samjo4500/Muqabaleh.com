'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L } from '@/lib/admin/labels';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

type Tx = {
  id: string;
  email?: string;
  user?: { email?: string; name?: string | null };
  amount?: number;
  amountUsdCents?: number;
  status: string;
  paypalOrderId?: string | null;
  packageType?: string | null;
  type?: string;
  createdAt: string;
};

export default function AdminPaymentTransactionsPage() {
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resources?resource=transactions');
      const data = await res.json();
      setRows(Array.isArray(data.items) ? data.items : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refund = async (id: string) => {
    if (!confirm(`${L.refund.ar} / ${L.refund.en}?`)) return;
    const res = await fetch('/api/admin/payments/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || `${L.error.ar} / ${L.error.en}`);
      return;
    }
    toast.success(`${L.success.ar} / ${L.success.en}`);
    void load();
  };

  return (
    <div>
      <AdminPageHeader
        title={{ ar: L.transactions.ar, en: L.transactions.en }}
        description={{
          ar: 'عمليات PayPal المالية مع إمكانية استرداد المبلغ.',
          en: 'PayPal transactions with refund capability.',
        }}
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            <BiInline ar={L.refresh.ar} en={L.refresh.en} />
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg-panel)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <BiLabel ar="البريد" en="Email" size="sm" />
              </TableHead>
              <TableHead>
                <BiLabel ar="المبلغ" en="Amount" size="sm" />
              </TableHead>
              <TableHead>
                <BiLabel ar="PayPal" en="PayPal" size="sm" />
              </TableHead>
              <TableHead>
                <BiLabel ar={L.status.ar} en={L.status.en} size="sm" />
              </TableHead>
              <TableHead>
                <BiLabel ar={L.actions.ar} en={L.actions.en} size="sm" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <BiInline ar={L.loading.ar} en={L.loading.en} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <BiInline ar={L.empty.ar} en={L.empty.en} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((tx) => {
                const email = tx.user?.email || tx.email || '—';
                const amount =
                  typeof tx.amount === 'number'
                    ? `$${tx.amount.toFixed(2)}`
                    : typeof tx.amountUsdCents === 'number'
                      ? `$${(tx.amountUsdCents / 100).toFixed(2)}`
                      : '—';
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm">{email}</TableCell>
                    <TableCell className="text-sm">{amount}</TableCell>
                    <TableCell className="max-w-[160px] truncate text-xs text-[var(--text-muted)]">
                      {tx.paypalOrderId || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={tx.status === 'REFUNDED' || !tx.paypalOrderId}
                        onClick={() => void refund(tx.id)}
                      >
                        <BiInline ar={L.refund.ar} en={L.refund.en} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
