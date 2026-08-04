'use client';

import { useCallback, useEffect, useState } from 'react';
import { DollarSign, RefreshCw, UserCheck, Users } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L } from '@/lib/admin/labels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Stats {
  revenueTodayCents: number;
  revenueThisMonthCents: number;
  activeUsers: number;
  pendingApplications: number;
}

interface Transaction {
  id: string;
  email: string;
  name: string | null;
  packageType: string;
  amountUsdCents: number;
  status: string;
  createdAt: string;
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        fetch('/api/admin/stats').then((r) => r.json()),
        fetch('/api/admin/transactions').then((r) => r.json()),
      ]);
      setStats(s);
      setTransactions(Array.isArray(t?.transactions) ? t.transactions : Array.isArray(t) ? t : []);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cards = [
    {
      label: { ar: 'إيرادات اليوم', en: 'Revenue Today' },
      value: stats ? formatCents(stats.revenueTodayCents) : '—',
      icon: DollarSign,
    },
    {
      label: { ar: 'إيرادات الشهر', en: 'Revenue This Month' },
      value: stats ? formatCents(stats.revenueThisMonthCents) : '—',
      icon: DollarSign,
    },
    {
      label: { ar: 'مستخدمون نشطون', en: 'Active Users' },
      value: stats ? String(stats.activeUsers) : '—',
      icon: Users,
    },
    {
      label: { ar: 'طلبات معلّقة', en: 'Pending Applications' },
      value: stats ? String(stats.pendingApplications) : '—',
      icon: UserCheck,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title={{ ar: L.dashboard.ar, en: L.dashboard.en }}
        description={{
          ar: 'لوحة المشرف الأعلى لمنصة مقابلة — مقابلات بالذكاء الاصطناعي فقط.',
          en: 'Muqabaleh Super Admin dashboard — AI mock interview platform only.',
        }}
        backHref="/admin/dashboard"
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} className="gap-2">
            <RefreshCw size={14} />
            <BiInline ar={L.refresh.ar} en={L.refresh.en} />
          </Button>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label.en} className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <BiLabel ar={c.label.ar} en={c.label.en} size="sm" />
              <c.icon size={18} className="text-cyan-300" />
            </div>
            {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold">{c.value}</p>}
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg-panel)]">
        <div className="border-b border-white/10 px-4 py-3">
          <BiLabel ar={L.transactions.ar} en={L.transactions.en} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <BiLabel ar="البريد" en="Email" size="sm" />
              </TableHead>
              <TableHead>
                <BiLabel ar="الباقة" en="Package" size="sm" />
              </TableHead>
              <TableHead>
                <BiLabel ar="المبلغ" en="Amount" size="sm" />
              </TableHead>
              <TableHead>
                <BiLabel ar={L.status.ar} en={L.status.en} size="sm" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : transactions.slice(0, 10).map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm">{tx.email}</TableCell>
                    <TableCell className="text-sm">{tx.packageType}</TableCell>
                    <TableCell className="text-sm">{formatCents(tx.amountUsdCents)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
