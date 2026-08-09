'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { MuqabalehScoreBadge } from '@/components/brand/muqabaleh-score-badge';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalPassportShowcase() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section id="passport" className="mq-section scroll-mt-28">
      <div className="mq-wrap">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14"
        >
          <motion.div variants={fadeUp} className="max-w-xl">
            <p className="mq-kicker mb-3">
              <BiInline bi={C.passport.eyebrow} />
            </p>
            <T
              as="h2"
              bi={C.passport.title}
              className="mq-display mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl"
            />
            <T as="p" bi={C.passport.sub} className="mb-6 text-base text-white/60 md:text-lg" />
            <ul className="mb-8 space-y-3">
              {C.passport.bullets.map((b) => (
                <li key={b.en} className="flex items-start gap-3 text-sm text-white/70 md:text-base">
                  <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-teal-300/30 bg-teal-400/10 text-teal-300">
                    <ShieldCheck size={12} />
                  </span>
                  <BiInline bi={b} />
                </li>
              ))}
            </ul>
            <Link
              href={localePath('/interview/prequal', locale)}
              className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center gap-2 px-6 text-sm font-bold"
            >
              <Sparkles size={16} />
              <BiInline bi={C.passport.cta} />
            </Link>
          </motion.div>

          {/* Visible passport — sample credential employers can understand */}
          <motion.div
            variants={fadeUp}
            className="relative mx-auto w-full max-w-md"
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <motion.div
              className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-teal-400/15 blur-3xl"
              animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.96, 1.04, 0.96] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
            <div
              className="relative overflow-hidden rounded-[1.75rem] border border-teal-300/30 shadow-[0_40px_100px_rgba(0,0,0,0.45)]"
              style={{
                background:
                  'linear-gradient(165deg, rgba(14,28,42,0.98) 0%, rgba(8,14,24,0.99) 55%, rgba(6,12,20,1) 100%)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  background:
                    'radial-gradient(circle at 90% 10%, rgba(45,212,191,0.22), transparent 40%), radial-gradient(circle at 10% 90%, rgba(232,201,122,0.12), transparent 45%)',
                }}
                aria-hidden
              />
              <div className="relative border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300/80">
                      Muqabaleh Passport
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {isAr ? 'جاهزية موثّقة بالمقابلة' : 'Interview-verified readiness'}
                    </p>
                  </div>
                  <span className="rounded-lg border border-teal-300/30 bg-teal-400/10 px-2.5 py-1 text-[10px] font-bold text-teal-200">
                    {isAr ? 'موثّق' : 'VERIFIED'}
                  </span>
                </div>
              </div>

              <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <h3 className="mq-display text-xl font-bold text-white">
                    {isAr ? 'سارة المنصوري' : 'Sara Al-Mansouri'}
                  </h3>
                  <p className="text-sm text-white/55">
                    {isAr ? 'مديرة منتجات · دبي' : 'Product Manager · Dubai'}
                  </p>
                  <p className="text-xs text-white/40">
                    {isAr ? 'عربية + إنجليزية · لهجات مرحّب بها' : 'Arabic + English · dialects welcome'}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(isAr
                      ? ['وضوح', 'ثقة', 'هيكل', 'ثنائي اللغة']
                      : ['Clarity', 'Confidence', 'Structure', 'Bilingual']
                    ).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-white/55"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 self-start sm:self-center">
                  <MuqabalehScoreBadge
                    score={86}
                    status="scored"
                    locale={locale}
                    size="lg"
                    max={100}
                    className="pointer-events-none"
                  />
                </div>
              </div>

              <div className="relative flex items-center justify-between border-t border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/15 bg-white p-1">
                    <Image
                      src="/images/passport-qr-demo.png"
                      alt=""
                      width={48}
                      height={48}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white/70">
                      {isAr ? 'تحقق عام' : 'Public verify'}
                    </p>
                    <p className="font-mono text-[10px] text-white/35">MQB-DEMO</p>
                  </div>
                </div>
                <motion.span
                  className="text-[11px] font-bold text-teal-300/90"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                >
                  {isAr ? 'قابل للمشاركة' : 'Shareable'}
                </motion.span>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-white/35">
              {isAr ? 'نموذج توضيحي — درجاتك خاصة حتى تشاركها.' : 'Sample preview — your scores stay private until you share.'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
