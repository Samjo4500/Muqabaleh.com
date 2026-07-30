'use client';

import { useTranslations } from 'next-intl';
import { VerifiedBadge, QrCard, GlowCard } from '@/components/brand';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Award, Eye } from 'lucide-react';

const certs = [
  { nameKey: 'cert1Name', dateKey: 'cert1Date', score: 82, id: 'MQBL-82-2026-07-28' },
  { nameKey: 'cert2Name', dateKey: 'cert2Date', score: 91, id: 'MQBL-91-2026-07-26' },
  { nameKey: 'cert3Name', dateKey: 'cert3Date', score: 95, id: 'MQBL-95-2026-07-18' },
] as const;

export default function CertificatesPage() {
  const t = useTranslations('app.certificates');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certs.map((cert, i) => (
          <GlowCard key={i} className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
              <Award size={28} strokeWidth={1.75} className="text-gold" />
            </div>
            <h3 className="mb-1 text-sm font-bold text-[var(--text-primary)]">{t(cert.nameKey)}</h3>
            <div className="mb-1 flex items-center gap-2">
              <span className={`text-2xl font-bold ${cert.score >= 80 ? 'text-emerald' : 'text-amber'}`}>
                {cert.score}
              </span>
              <span className="text-sm text-[var(--text-faint)]">/100</span>
            </div>
            <span className="mb-4 text-xs text-[var(--text-faint)]">{t(cert.dateKey)}</span>
            <QrCard verificationId={cert.id} className="w-full max-w-[200px]" />
            <div className="mt-3 flex items-center gap-2">
              <VerifiedBadge size="sm" />
            </div>
            <Link href="/app/interview/1/report" className="mt-4 w-full">
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-[var(--text-muted)] hover:text-gold cursor-pointer"
              >
                <Eye size={16} strokeWidth={1.75} />
                {t('viewReport')}
              </Button>
            </Link>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}