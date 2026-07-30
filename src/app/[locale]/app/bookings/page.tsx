'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { InterviewAvatar, EmptyState } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, Clock, XCircle, Eye } from 'lucide-react';

type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

type Booking = {
  interviewer: 'fahd' | 'noora';
  interviewerKey: string;
  dateKey: string;
  timeKey: string;
  typeKey: string;
  score: number | null;
  status: BookingStatus;
};

const bookings: Booking[] = [
  { interviewer: 'fahd', interviewerKey: 'b1Interviewer', dateKey: 'b1Date', timeKey: 'b1Time', typeKey: 'b1Type', score: null, status: 'upcoming' },
  { interviewer: 'noora', interviewerKey: 'b6Interviewer', dateKey: 'b6Date', timeKey: 'b6Time', typeKey: 'b6Type', score: null, status: 'upcoming' },
  { interviewer: 'noora', interviewerKey: 'b2Interviewer', dateKey: 'b2Date', timeKey: 'b2Time', typeKey: 'b2Type', score: 91, status: 'completed' },
  { interviewer: 'fahd', interviewerKey: 'b3Interviewer', dateKey: 'b3Date', timeKey: 'b3Time', typeKey: 'b3Type', score: 76, status: 'completed' },
  { interviewer: 'fahd', interviewerKey: 'b4Interviewer', dateKey: 'b4Date', timeKey: 'b4Time', typeKey: 'b4Type', score: null, status: 'cancelled' },
  { interviewer: 'fahd', interviewerKey: 'b5Interviewer', dateKey: 'b5Date', timeKey: 'b5Time', typeKey: 'b5Type', score: null, status: 'cancelled' },
];

export default function BookingsPage() {
  const t = useTranslations('app.bookings');
  const tCommon = useTranslations('common');

  const [list, setList] = useState(bookings);

  const byStatus = (status: BookingStatus) => list.filter((b) => b.status === status);

  const statusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 px-2.5 py-0.5 text-xs font-medium text-amber">
            <Clock size={12} strokeWidth={1.75} />
            {t('upcoming')}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-2.5 py-0.5 text-xs font-medium text-emerald">
            <CheckCircle2 size={12} strokeWidth={1.75} />
            {t('completedTab')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
            <XCircle size={12} strokeWidth={1.75} />
            {t('cancelled')}
          </span>
        );
    }
  };

  const handleCancel = (idx: number) => {
    setList((prev) => prev.map((b, i) => (i === idx ? { ...b, status: 'cancelled' as const } : b)));
  };

  const BookingCard = ({ booking, index }: { booking: Booking; index: number }) => (
    <div className="glass-card flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <InterviewAvatar who={booking.interviewer} size="sm" />
        <div className="space-y-1">
          <span className="text-sm font-medium text-[var(--text-primary)]">{t(booking.interviewerKey)}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)]">{t(booking.dateKey)}</span>
            <span className="text-xs text-[var(--text-faint)]">{t(booking.timeKey)}</span>
            <span className="text-xs text-[var(--text-faint)]">{t(booking.typeKey)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {statusBadge(booking.status)}
        {booking.status === 'upcoming' && (
          <div className="flex items-center gap-2">
            <Link href="/app/interview/1">
              <Button size="sm" className="btn-gold cursor-pointer text-xs">
                {t('joinMeeting')}
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-[var(--text-muted)] hover:text-red-400 cursor-pointer">
                  {t('cancel')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[var(--bg-panel)] border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[var(--text-primary)]">{t('cancelTitle')}</AlertDialogTitle>
                  <AlertDialogDescription className="text-[var(--text-muted)]">{t('cancelWarning')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                    {tCommon('cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleCancel(index)}
                    className="bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                  >
                    {t('cancel')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        {booking.status === 'completed' && booking.score !== null && (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${booking.score >= 80 ? 'text-emerald' : 'text-amber'}`}>{booking.score}</span>
            <Link href="/app/interview/1/report">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-[var(--text-muted)] hover:text-gold cursor-pointer">
                <Eye size={14} strokeWidth={1.75} />
                {t('viewReport')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const renderTab = (status: BookingStatus) => {
    const items = byStatus(status);
    if (items.length === 0) {
      return <EmptyState icon={Clock} title={t('emptyTitle')} sub={t('emptySub')} />;
    }
    return <div className="space-y-3">{items.map((b, i) => <BookingCard key={i} booking={b} index={i} />)}</div>;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>

      <Tabs defaultValue="upcoming">
        <TabsList className="bg-white/5 p-1">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-[var(--text-muted)] cursor-pointer">
            {t('upcoming')}
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-[var(--text-muted)] cursor-pointer">
            {t('completedTab')}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-[var(--text-muted)] cursor-pointer">
            {t('cancelled')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          {renderTab('upcoming')}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {renderTab('completed')}
        </TabsContent>
        <TabsContent value="cancelled" className="mt-4">
          {renderTab('cancelled')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
