'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  DollarSign,
  CheckCircle2,
  Star,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

type BookingStatus = 'confirmed' | 'completed' | 'cancelled' | 'no-show';

type MockBooking = {
  candidate: string;
  specialty: string;
  date: string;
  status: BookingStatus;
};

const mockBookings: MockBooking[] = [
  { candidate: 'سارة المحمدي', specialty: 'هندسة برمجيات', date: '2025-08-02 10:00', status: 'confirmed' },
  { candidate: 'أحمد العتيبي', specialty: 'تطوير واجهات أمامية', date: '2025-08-01 14:00', status: 'completed' },
  { candidate: 'نورة القحطاني', specialty: 'علوم البيانات', date: '2025-07-30 09:00', status: 'completed' },
  { candidate: 'فهد العنزي', specialty: 'إدارة مشاريع', date: '2025-07-28 11:00', status: 'cancelled' },
  { candidate: 'خالد الشمري', specialty: 'تطوير Flutter', date: '2025-07-25 16:00', status: 'no-show' },
];

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  completed: 'bg-gold/10 text-gold border-gold/30',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  'no-show': 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

const STATUS_KEYS: Record<BookingStatus, string> = {
  confirmed: 'statusConfirmed',
  completed: 'statusCompleted',
  cancelled: 'statusCancelled',
  'no-show': 'statusNoShow',
};

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' },
  }),
};

const tableVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.4, duration: 0.5, ease: 'easeOut' },
  },
};

/* ------------------------------------------------------------------ */
/*  Stats cards data                                                   */
/* ------------------------------------------------------------------ */

const stats = [
  { value: '$487', labelKey: 'thisMonth', icon: DollarSign, color: 'text-gold' },
  { value: '23', labelKey: 'completed', icon: CheckCircle2, color: 'text-emerald-400' },
  { value: '4.8 ⭐', labelKey: 'avgRating', icon: Star, color: 'text-gold' },
  { value: '5', labelKey: 'upcomingCount', icon: Calendar, color: 'text-blue-400' },
] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function InterviewerDashboardPage() {
  const t = useTranslations('interviewerDash');

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gold md:text-3xl">
        {t('overview')}
      </h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.labelKey}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-[#0B0F17] border border-[rgba(212,175,55,0.1)] rounded-xl p-5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                  <Icon size={24} strokeWidth={1.75} className="text-gold" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-[var(--text-muted)]">{t(stat.labelKey)}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent bookings table */}
      <motion.div
        variants={tableVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#0B0F17] rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-[var(--text-muted)]">المرشح</TableHead>
                <TableHead className="text-[var(--text-muted)]">التخصص</TableHead>
                <TableHead className="text-[var(--text-muted)]">التاريخ</TableHead>
                <TableHead className="text-[var(--text-muted)]">الحالة</TableHead>
                <TableHead className="text-[var(--text-muted)]">الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBookings.map((b, i) => (
                <TableRow
                  key={i}
                  className="border-white/[0.06] hover:bg-white/[0.02]"
                >
                  <TableCell className="font-medium text-[var(--text-primary)]">
                    {b.candidate}
                  </TableCell>
                  <TableCell className="text-[var(--text-muted)]">
                    {b.specialty}
                  </TableCell>
                  <TableCell className="text-[var(--text-muted)] font-mono text-sm">
                    {b.date}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[b.status]}>
                      {t(STATUS_KEYS[b.status])}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(b.status === 'confirmed') && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 cursor-pointer"
                      >
                        <ExternalLink size={14} strokeWidth={1.75} />
                        {t('startInterview')}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
