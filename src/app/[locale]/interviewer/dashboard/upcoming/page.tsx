'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                    */
/* ------------------------------------------------------------------ */

type MockBooking = {
  id: string;
  candidate: string;
  specialty: string;
  date: Date;
  dateStr: string;
  time: string;
  countdown: string;
};

function buildCountdown(target: Date, locale: string): string {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return locale === 'ar' ? 'بدأت الآن' : 'Started now';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    if (locale === 'ar') {
      return `بعد ${days} يوم${days > 2 ? '' : days === 2 ? 'ين' : days === 1 ? '' : ''} ${remHours > 0 ? `و ${remHours} ساعات` : ''}`;
    }
    return `in ${days} day${days > 1 ? 's' : ''} ${remHours > 0 ? `${remHours}h` : ''}`;
  }
  if (hours > 0) {
    return locale === 'ar'
      ? `بعد ${hours} ساعة${hours === 2 ? 'ين' : hours > 2 ? '' : ''}`
      : `in ${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return locale === 'ar'
    ? `بعد ${minutes} دقيقة`
    : `in ${minutes} min`;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

function generateMockBookings(locale: string): MockBooking[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const bookings = [
    { offsetHours: 3, name: 'سارة المحمدي', specialty: 'هندسة برمجيات', time: '10:00 ص' },
    { offsetHours: 18, name: 'أحمد العتيبي', specialty: 'تطوير واجهات أمامية', time: '2:00 م' },
    { offsetHours: 48, name: 'نورة القحطاني', specialty: 'علوم البيانات', time: '9:00 ص' },
    { offsetHours: 96, name: 'فهد العنزي', specialty: 'إدارة مشاريع', time: '11:00 ص' },
    { offsetHours: 168, name: 'خالد الشمري', specialty: 'تطوير Flutter', time: '4:00 م' },
  ];

  return bookings
    .map((b, i) => {
      const target = new Date(today.getTime() + b.offsetHours * 60 * 60 * 1000);
      return {
        id: `b-${i}`,
        candidate: b.name,
        specialty: b.specialty,
        date: target,
        dateStr: target.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time: b.time,
        countdown: buildCountdown(target, locale),
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function UpcomingPage() {
  const t = useTranslations('interviewerDash');
  const locale = useLocale();
  const bookings = generateMockBookings(locale);

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gold md:text-3xl">
        {t('upcoming')}
      </h1>

      {/* Subtitle */}
      <p className="text-sm text-[var(--text-muted)]">
        {locale === 'ar'
          ? 'المقابلات المجدولة خلال الـ ٣٠ يوم القادمة'
          : 'Interviews scheduled in the next 30 days'}
      </p>

      {/* Booking cards */}
      <div className="space-y-4">
        {bookings.map((booking, i) => (
          <motion.div
            key={booking.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#0B0F17] rounded-xl p-5 border-l-4 border-gold"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Info */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">{booking.candidate}</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {booking.specialty}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[var(--text-muted)]">{booking.dateStr}</span>
                  <span className="text-[var(--text-muted)]">—</span>
                  <span className="text-[var(--text-muted)]">{booking.time}</span>
                </div>
                {/* Countdown */}
                <div className="flex items-center gap-1.5 pt-1">
                  <Clock size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-500">{booking.countdown}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-[#0B0F17] transition-colors hover:bg-gold/90 cursor-pointer"
                >
                  <ExternalLink size={16} strokeWidth={2} />
                  {t('startInterview')}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 cursor-pointer"
                >
                  <X size={16} strokeWidth={2} />
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
