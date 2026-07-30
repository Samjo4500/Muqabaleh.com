'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { Clock, Building2, AlertTriangle, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/brand';
import { toast } from 'sonner';

interface Booking {
  id: string;
  candidateKey: string;
  date: string;
  time: string;
  isB2B: boolean;
  companyKey: string;
  requiredQ: number;
  nearSession: boolean;
  pastDue: boolean;
  status: 'upcoming' | 'completed' | 'noShow';
}

const upcomingBookings: Booking[] = [
  { id: '1', candidateKey: 'cand1Name', date: '2026-08-05', time: '10:00 AM', isB2B: true, companyKey: 'companyAramco', requiredQ: 3, nearSession: true, pastDue: false, status: 'upcoming' },
  { id: '2', candidateKey: 'cand2Name', date: '2026-08-06', time: '02:00 PM', isB2B: false, companyKey: '', requiredQ: 0, nearSession: false, pastDue: true, status: 'upcoming' },
  { id: '3', candidateKey: 'cand3Name', date: '2026-08-07', time: '11:30 AM', isB2B: true, companyKey: 'companyNeom', requiredQ: 5, nearSession: false, pastDue: false, status: 'upcoming' },
];

const pastBookings: Booking[] = [
  { id: '4', candidateKey: 'cand4Name', date: '2026-07-28', time: '09:00 AM', isB2B: false, companyKey: '', requiredQ: 0, nearSession: false, pastDue: false, status: 'completed' },
  { id: '5', candidateKey: 'cand5Name', date: '2026-07-25', time: '03:00 PM', isB2B: true, companyKey: 'companyStc', requiredQ: 2, nearSession: false, pastDue: false, status: 'noShow' },
  { id: '6', candidateKey: 'cand6Name', date: '2026-07-20', time: '01:00 PM', isB2B: false, companyKey: '', requiredQ: 0, nearSession: false, pastDue: false, status: 'completed' },
];

function BookingCard({ booking }: { booking: Booking }) {
  const t = useTranslations('interviewerPanel');
  const [url, setUrl] = useState('');

  return (
    <GlowCard>
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-[var(--text-primary)]">
            {t(booking.candidateKey)}
          </p>
          {booking.isB2B && (
            <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              {t('b2bBadge')}
            </Badge>
          )}
        </div>

        {/* B2B company info */}
        {booking.isB2B && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Building2 size={16} strokeWidth={1.75} />
            <span>{t(booking.companyKey)}</span>
            <span className="ms-1 text-xs text-[var(--text-faint)]">
              ({booking.requiredQ} {t('requiredQuestions')})
            </span>
          </div>
        )}

        {/* Date/time */}
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Clock size={16} strokeWidth={1.75} />
          <span>{booking.date}</span>
          <span className="text-[var(--text-faint)]">|</span>
          <span>{booking.time}</span>
        </div>

        {/* Meeting URL (upcoming only) */}
        {booking.status === 'upcoming' && (
          <>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('meetingUrlPlaceholder')}
                className="glass-input border-white/10"
              />
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-white/10 hover:border-gold hover:text-gold"
                onClick={() => toast.success(t('saveUrl'))}
              >
                {t('saveUrl')}
              </Button>
            </div>
            {booking.nearSession && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                <AlertTriangle size={16} strokeWidth={1.75} />
                <span>{t('urlWarning')}</span>
              </div>
            )}
            {/* Evaluate link */}
            <Link
              href={`/interviewer/bookings/${booking.id}/evaluate`}
              className="inline-flex items-center gap-1.5 text-sm text-gold transition-colors hover:text-gold/80"
            >
              <ExternalLink size={14} strokeWidth={1.75} />
              {t('evalTitle')}
            </Link>

            {/* Past-due action buttons */}
            {booking.pastDue && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => toast.success(t('markCompleted'))}
                >
                  {t('markCompleted')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => toast.info(t('markNoShow'))}
                >
                  {t('markNoShow')}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Status badge (past) */}
        {booking.status !== 'upcoming' && (
          <div className="flex items-center justify-between">
            <Badge
              className={
                booking.status === 'completed'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-red-500/30 bg-red-500/10 text-red-400'
              }
            >
              {booking.status === 'completed' ? (
                <CheckCircle2 size={14} strokeWidth={1.75} className="me-1.5" />
              ) : (
                <XCircle size={14} strokeWidth={1.75} className="me-1.5" />
              )}
              {booking.status === 'completed' ? t('statusCompleted') : t('statusNoShow')}
            </Badge>
          </div>
        )}
      </div>
    </GlowCard>
  );
}

export default function BookingsPage() {
  const t = useTranslations('interviewerPanel');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {t('bookingsTitle')}
      </h1>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="bg-white/5">
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:bg-gold data-[state=active]:text-[var(--bg-void)]"
          >
            {t('tabUpcoming')}
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="data-[state=active]:bg-gold data-[state=active]:text-[var(--bg-void)]"
          >
            {t('tabPast')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcomingBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pastBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
