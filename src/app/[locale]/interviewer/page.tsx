'use client';

import { useTranslations } from 'next-intl';
import { Calendar, DollarSign, Star, ShieldCheck, AlertTriangle, Building2, Clock } from 'lucide-react';
import { GlowCard } from '@/components/brand';
import { Badge } from '@/components/ui/badge';

const upcomingBookings = [
  { candidateKey: 'cand1Name', date: '2026-08-05', time: '10:00 AM', isB2B: true, companyKey: 'companyAramco', requiredQ: 3, nearSession: true },
  { candidateKey: 'cand2Name', date: '2026-08-06', time: '02:00 PM', isB2B: false, companyKey: '', requiredQ: 0, nearSession: false },
  { candidateKey: 'cand3Name', date: '2026-08-07', time: '11:30 AM', isB2B: true, companyKey: 'companyNeom', requiredQ: 5, nearSession: false },
] as const;

export default function InterviewerDashboard() {
  const t = useTranslations('interviewerPanel');

  const kpis = [
    {
      label: t('kpiUpcoming'),
      value: '5',
      icon: Calendar,
      color: 'text-cyan-400',
    },
    {
      label: t('kpiEarnings'),
      value: '$487',
      icon: DollarSign,
      color: 'text-gold',
    },
    {
      label: t('kpiRating'),
      value: '4.8',
      icon: Star,
      color: 'text-gold',
    },
    {
      label: t('kpiAccreditation'),
      value: t('accredited'),
      icon: ShieldCheck,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {t('dashTitle')}
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlowCard key={kpi.label} className="flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 ${kpi.color}`}>
                <Icon size={24} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            </GlowCard>
          );
        })}
      </div>

      {/* Upcoming Bookings */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
          {t('upcomingBookings')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcomingBookings.map((booking, i) => (
            <GlowCard key={i}>
              <div className="space-y-3">
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
                {booking.isB2B && (
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Building2 size={16} strokeWidth={1.75} />
                    <span>{t(booking.companyKey)}</span>
                    <span className="ms-1 text-xs text-[var(--text-faint)]">
                      ({booking.requiredQ} {t('requiredQuestions')})
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <Clock size={16} strokeWidth={1.75} />
                  <span>{booking.date}</span>
                  <span className="text-[var(--text-faint)]">|</span>
                  <span>{booking.time}</span>
                </div>
                {booking.nearSession && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    <AlertTriangle size={16} strokeWidth={1.75} />
                    <span>{t('addMeetingUrlWarning')}</span>
                  </div>
                )}
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </div>
  );
}
