'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Shield,
  QrCode,
  Brain,
  BarChart3,
  Mic,
  Check,
  CircleHelp,
  Quote,
  Play,
  Pause,
  Lock,
  Download,
  Share2,
  Globe,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  GlowCard,
  SectionHeading,
  ScoreBar,
  VerifiedBadge,
  PriceTag,
  InterviewAvatar,
  QrCard,
  LiveBadge,
  HeroStoryboard,
} from '@/components/brand';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import {
  OrganizationJsonLd,
  FaqJsonLd,
  ProductJsonLd,
} from '@/components/json-ld';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SCORES = [94, 90, 87, 92] as const;

const HUMAN_INTERVIEWERS = [
  { nameKey: 'human1Name', titleKey: 'human1Title', initials: 'ه س', rating: 4.9, price: 49, color: 'from-gold/30 to-gold/5' },
  { nameKey: 'human2Name', titleKey: 'human2Title', initials: 'ي غ', rating: 4.8, price: 59, color: 'from-emerald/30 to-emerald/5' },
  { nameKey: 'human3Name', titleKey: 'human3Title', initials: 'ر ع', rating: 4.8, price: 49, color: 'from-cyan/30 to-cyan/5' },
] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const t = useTranslations('landing');
  const tc = useTranslations('common');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationJsonLd />
      <ProductJsonLd />
      <Navbar />
      <main className="flex-1 pt-16">
        <HeroSection t={t} tc={tc} isRTL={isRTL} />
        <CountryMarquee t={t} isRTL={isRTL} />
        <StatsBand t={t} />
        <WhySection t={t} />
        <HowSection t={t} isRTL={isRTL} />
        <BeforeAfterSection t={t} isRTL={isRTL} />
        <ExperienceSection t={t} isRTL={isRTL} />
        <InterviewersSection t={t} isRTL={isRTL} />
        <PricingSection t={t} isRTL={isRTL} />
        <ReportPreviewSection t={t} isRTL={isRTL} />
        <TestimonialsSection t={t} />
        <FaqSection t={t} />
        <FaqJsonLd />
        <FinalCtaSection t={t} tc={tc} />
      </main>
      <Footer />
    </div>
  );
}

/* ================================================================== */
/*  1. HERO                                                            */
/* ================================================================== */

function HeroSection({ t, tc, isRTL }: { t: ReturnType<typeof useTranslations>; tc: ReturnType<typeof useTranslations>; isRTL: boolean }) {
  return (
    <HeroStoryboard>
      {/* Navbar spacer + hero text floats over the storyboard */}
      <div className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 md:pt-36 lg:px-8">
          <div className={`flex flex-col gap-8 ${isRTL ? 'items-start text-right' : 'items-start text-left'}`}>
            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-emerald rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
              </span>
              <span className="eyebrow">{t('heroEyebrow')}</span>
            </div>

            {/* H1 */}
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight drop-shadow-2xl md:text-5xl lg:text-6xl">
              {t('heroH1').split(t('heroH1Highlight')).map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <span className="gold-gradient-text">{t('heroH1Highlight')}</span>
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
            </h1>

            {/* Sub */}
            <p className="max-w-lg text-lg leading-relaxed text-white/70 drop-shadow-lg">
              {t('heroSub')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/register" className="btn-gold">
                {t('heroCta1')}
              </Link>
              <a href="#how" className="btn-ghost border-white/20 text-white hover:bg-white/10">
                {t('heroCta2')}
              </a>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-3 pt-4">
              <TrustChip icon={<Shield size={16} strokeWidth={1.75} />} label={t('trustPaypal')} />
              <TrustChip icon={<QrCode size={16} strokeWidth={1.75} />} label={t('trustQR')} />
              <TrustChip icon={<Globe size={16} strokeWidth={1.75} />} label={t('trustCountries')} />
            </div>
          </div>
        </div>
      </div>
    </HeroStoryboard>
  );
}

function TrustChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-[var(--text-muted)]">
      {icon}
      {label}
    </div>
  );
}



/* ================================================================== */
/*  2. COUNTRY MARQUEE                                                 */
/* ================================================================== */

function CountryMarquee({ t, isRTL }: { t: ReturnType<typeof useTranslations>; isRTL: boolean }) {
  const countries = t.raw('marqueeCountries') as string[];
  const doubled = [...countries, ...countries];

  return (
    <section id="countries" className="overflow-hidden border-y border-white/5 py-4">
      <div className={isRTL ? 'animate-marquee-rtl flex w-max gap-8' : 'animate-marquee flex w-max gap-8'}>
        {doubled.map((c, i) => (
          <span key={i} className="whitespace-nowrap text-sm text-[var(--text-faint)]">
            {c}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  3. STATS BAND                                                       */
/* ================================================================== */

function SimpleStat({ label }: { label: string }) {
  return (
    <div className="text-center">
      <div className="text-sm font-semibold text-gold">{label}</div>
    </div>
  );
}

function StatsBand({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section id="stats" className="py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        <SimpleStat label={t('statsInterviews')} />
        <SimpleStat label={t('statsUsers')} />
        <SimpleStat label={t('statsRating')} />
        <SimpleStat label={t('statsImprovement')} />
      </div>
    </section>
  );
}

/* ================================================================== */
/*  4. WHY MUQABALEH                                                   */
/* ================================================================== */

const WHY_ICONS = [Brain, BarChart3, Mic, QrCode, Shield] as const;

function WhySection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section id="why" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('whyTitle')}
          title={t('whyTitle')}
          titleHighlight={t('whyTitle')}
          sub={t('whySub')}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => {
            const Icon = WHY_ICONS[i - 1];
            return (
              <GlowCard key={i} className="flex flex-col gap-4 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
                  <Icon size={20} strokeWidth={1.75} className="text-gold" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {t(`whyFeature${i}Title`)}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                  {t(`whyFeature${i}Desc`)}
                </p>
              </GlowCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  5. HOW IT WORKS                                                    */
/* ================================================================== */

function HowSection({ t, isRTL }: { t: ReturnType<typeof useTranslations>; isRTL: boolean }) {
  return (
    <section id="how" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('howTitle')}
          title={t('howTitle')}
          titleHighlight={t('howTitle')}
          sub={t('howSub')}
        />
        <div className="relative mx-auto mt-16 max-w-2xl">
          {/* Vertical connecting line */}
          <div
            className={`absolute top-0 bottom-0 w-px bg-gradient-to-b from-gold/40 via-gold/10 to-transparent ${isRTL ? 'start-6 md:start-8' : 'start-6 md:start-8'}`}
          />

          {([1, 2, 3] as const).map((step) => (
            <div key={step} className="relative mb-12 flex gap-6 last:mb-0 md:gap-8">
              {/* Step number circle */}
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-void text-base font-bold text-gold md:h-16 md:w-16 md:text-lg">
                {step}
              </div>

              {/* Content */}
              <div className="pt-1 md:pt-3">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {t(`howStep${step}Title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {t(`howStep${step}Desc`)}
                </p>
                {/* Step 2: show fahd and noora avatars */}
                {step === 2 && (
                  <div className="mt-4 flex items-center gap-3">
                    <InterviewAvatar who="fahd" size="sm" />
                    <InterviewAvatar who="noora" size="sm" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  6. BEFORE / AFTER                                                  */
/* ================================================================== */

function BeforeAfterSection({ t, isRTL }: { t: ReturnType<typeof useTranslations>; isRTL: boolean }) {
  return (
    <section id="transform" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow=""
          title={t('whyTitle')}
          titleHighlight={t('whyTitle')}
          sub=""
        />
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          {/* Before card */}
          <div className="glass-card flex flex-col items-center gap-4 p-8 text-center opacity-60">
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <CircleHelp key={n} size={32} strokeWidth={1.75} className="text-[var(--text-faint)]" />
              ))}
            </div>
            <h3 className="text-xl font-bold text-[var(--text-muted)]">{t('beforeTitle')}</h3>
            <p className="text-sm leading-relaxed text-[var(--text-faint)]">{t('beforeDesc')}</p>
          </div>

          {/* Arrow divider */}
          <div className={`hidden items-center justify-center text-gold/50 md:flex ${isRTL ? 'rotate-180' : ''}`}>
            <span className="text-3xl">→</span>
          </div>

          {/* After card */}
          <div className="glass-card flex flex-col items-center gap-4 p-8 text-center">
            <div className="text-4xl font-extrabold text-emerald">91</div>
            <h3 className="text-xl font-bold text-emerald">{t('afterTitle')}</h3>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">{t('afterDesc')}</p>
            <VerifiedBadge size="sm" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  7. INTERVIEW EXPERIENCE                                             */
/* ================================================================== */

function ExperienceSection({ t, isRTL }: { t: ReturnType<typeof useTranslations>; isRTL: boolean }) {
  return (
    <section id="experience" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('experienceTitle')}
          title={t('experienceTitle')}
          titleHighlight={t('experienceTitle')}
          sub={t('experienceSub')}
        />

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="glass-card flex flex-col gap-4 p-6" style={{ transform: 'none' }}>
            {/* Interviewer bubble */}
            <div className={`flex items-start gap-3 ${isRTL ? '' : ''}`}>
              <InterviewAvatar who="noora" size="sm" />
              <div className="max-w-[80%] rounded-2xl rounded-tl-none border border-gold/20 bg-gold/5 px-4 py-3">
                <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                  {t('chatQuestion')}
                </p>
              </div>
            </div>

            {/* Candidate bubble */}
            <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`max-w-[80%] rounded-2xl rounded-tr-none border border-white/10 bg-white/5 px-4 py-3 ${isRTL ? 'rounded-tl-none rounded-tr-none' : ''}`}>
                <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                  {t('chatAnswer')}
                </p>
              </div>
            </div>

            {/* Disabled input */}
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-[var(--text-faint)]">{t('typeAnswerPlaceholder')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  8. INTERVIEWERS                                                     */
/* ================================================================== */

function InterviewersSection({ t, isRTL }: { t: ReturnType<typeof useTranslations>; isRTL: boolean }) {
  const [playingFahd, setPlayingFahd] = useState(false);
  const [playingNoora, setPlayingNoora] = useState(false);
  const fahdRef = useRef<HTMLAudioElement>(null);
  const nooraRef = useRef<HTMLAudioElement>(null);

  return (
    <section id="interviewers" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('interviewersTitle')}
          title={t('interviewersTitle')}
          titleHighlight={t('interviewersTitle')}
          sub={t('interviewersSub')}
        />

        <Tabs defaultValue="ai" className="mt-12">
          <TabsList className="mx-auto flex w-fit rounded-xl border border-white/10 bg-white/[0.03]">
            <TabsTrigger value="ai" className="rounded-lg px-6 text-sm">
              {t('tabAI')}
            </TabsTrigger>
            <TabsTrigger value="human" className="rounded-lg px-6 text-sm">
              {t('tabHuman')}
            </TabsTrigger>
          </TabsList>

          {/* AI Tab */}
          <TabsContent value="ai">
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {/* Fahd */}
              <GlowCard className="p-6">
                <div className="flex items-center gap-4">
                  <InterviewAvatar who="fahd" size="lg" />
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">فهد</h3>
                    <p className="text-sm text-[var(--text-muted)]">{t('tabAI')}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (playingFahd) {
                        fahdRef.current?.pause();
                        setPlayingFahd(false);
                      } else {
                        fahdRef.current?.play().catch(() => {});
                        setPlayingFahd(true);
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold transition-colors hover:bg-gold/20"
                    aria-label={t('playSample')}
                  >
                    {playingFahd ? <Pause size={16} strokeWidth={1.75} /> : <Play size={16} strokeWidth={1.75} className="ms-0.5" />}
                  </button>
                  <audio ref={fahdRef} src="/audio/fahd-sample.wav" onEnded={() => setPlayingFahd(false)} preload="none" />
                  <div className="flex items-end gap-[3px]">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <span
                        key={i}
                        className="waveform-bar"
                        style={{
                          animationDelay: `${i * 0.15}s`,
                          height: playingFahd ? undefined : '8px',
                          animationPlayState: playingFahd ? 'running' : 'paused',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </GlowCard>

              {/* Noora */}
              <GlowCard className="p-6">
                <div className="flex items-center gap-4">
                  <InterviewAvatar who="noora" size="lg" />
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">نورة</h3>
                    <p className="text-sm text-[var(--text-muted)]">{t('tabAI')}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (playingNoora) {
                        nooraRef.current?.pause();
                        setPlayingNoora(false);
                      } else {
                        nooraRef.current?.play().catch(() => {});
                        setPlayingNoora(true);
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold transition-colors hover:bg-gold/20"
                    aria-label={t('playSample')}
                  >
                    {playingNoora ? <Pause size={16} strokeWidth={1.75} /> : <Play size={16} strokeWidth={1.75} className="ms-0.5" />}
                  </button>
                  <audio ref={nooraRef} src="/audio/noora-sample.wav" onEnded={() => setPlayingNoora(false)} preload="none" />
                  <div className="flex items-end gap-[3px]">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <span
                        key={i}
                        className="waveform-bar"
                        style={{
                          animationDelay: `${i * 0.15}s`,
                          height: playingNoora ? undefined : '8px',
                          animationPlayState: playingNoora ? 'running' : 'paused',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </GlowCard>
            </div>
          </TabsContent>

          {/* Human Tab */}
          <TabsContent value="human">
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {HUMAN_INTERVIEWERS.map((person, i) => (
                <GlowCard key={i} className="flex flex-col items-center gap-4 p-6 text-center">
                  {/* Avatar placeholder — colored circle with initials */}
                  <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${person.color} text-xl font-bold text-[var(--text-primary)]`}>
                    {person.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{t(person.nameKey)}</h3>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{t(person.titleKey)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gold">
                    <span className="font-bold">{person.rating}</span>
                    <span className="text-[var(--text-faint)]">/5</span>
                  </div>
                  <PriceTag
                    usd={`${t('humanFrom')} $${person.price}`}
                    className="mb-2"
                  />
                  <Link
                    href={`/interviewers/${i + 1}`}
                    className="btn-ghost w-full text-center text-sm"
                  >
                    {t('viewProfile')}
                  </Link>
                </GlowCard>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  9. PRICING                                                          */
/* ================================================================== */

const PRICING_PLANS = [
  {
    titleKey: 'session1Title',
    priceKey: 'session1Price',
    badge: null,
    subKey: null,
    featureKey: 'feature1Session',
    criteriaKey: 'feature4Criteria',
    sar: '71', aed: '70', egp: '912', jod: '13',
    popular: false,
    planSlug: '1-session',
  },
  {
    titleKey: 'session3Title',
    priceKey: 'session3Price',
    badge: 'session3Badge',
    subKey: null,
    featureKey: 'feature3Sessions',
    criteriaKey: 'feature4Criteria',
    sar: '183', aed: '180', egp: '2352', jod: '35',
    popular: true,
    planSlug: '3-sessions',
  },
  {
    titleKey: 'session5Title',
    priceKey: 'session5Price',
    badge: null,
    subKey: null,
    featureKey: 'feature5Sessions',
    criteriaKey: 'feature4Criteria',
    sar: '258', aed: '253', egp: '3312', jod: '49',
    popular: false,
    planSlug: '5-sessions',
  },
  {
    titleKey: 'vipTitle',
    priceKey: 'vipPrice',
    badge: null,
    subKey: 'vipSub',
    featureKey: 'featureVipSession',
    criteriaKey: 'feature6CriteriaHuman',
    sar: '108', aed: '106', egp: '1392', jod: '21',
    popular: false,
    planSlug: 'vip',
  },
] as const;

function PricingSection({ t, isRTL }: { t: ReturnType<typeof useTranslations>; isRTL: boolean }) {
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('pricingTitle')}
          title={t('pricingTitle')}
          titleHighlight={t('pricingTitle')}
          sub={t('pricingSub')}
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_PLANS.map((plan, idx) => (
            <GlowCard
              key={idx}
              className={`relative flex flex-col items-center p-6 ${plan.popular ? 'border-gold/50 ring-1 ring-gold/30' : ''}`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 bg-gold text-void hover:bg-gold-hover">
                  {t(plan.badge)}
                </Badge>
              )}

              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {t(plan.titleKey)}
              </h3>
              {plan.subKey && (
                <p className="mt-1 text-xs text-[var(--text-faint)]">{t(plan.subKey)}</p>
              )}

              <PriceTag
                usd={t(plan.priceKey)}
                localApprox={t('localApprox', {
                  sar: plan.sar,
                  aed: plan.aed,
                  egp: plan.egp,
                  jod: plan.jod,
                })}
                className="my-5"
              />

              <ul className="mb-6 flex w-full flex-col gap-3">
                <PricingCheck text={t(plan.featureKey)} />
                <PricingCheck text={t(plan.criteriaKey)} />
                <PricingCheck text={t('featureCertificate')} />
                <PricingCheck text={t('featurePdf')} />
                <PricingCheck text={t('featureLinkedin')} />
              </ul>

              <Link href={`/auth/register?plan=${plan.planSlug}`} className="btn-gold w-full text-center text-sm">
                {t('choosePlan')}
              </Link>
            </GlowCard>
          ))}
        </div>

        {/* Trust signals */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-faint)]">
          <span className="flex items-center gap-1.5">
            <Lock size={14} strokeWidth={1.75} />
            {t('trustSSL')}
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={14} strokeWidth={1.75} />
            {t('trustBuyer')}
          </span>
          <span>{t('trustRefund')}</span>
        </div>
      </div>
    </section>
  );
}

function PricingCheck({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
      <Check size={16} strokeWidth={1.75} className="shrink-0 text-emerald" />
      {text}
    </li>
  );
}

/* ================================================================== */
/*  10. REPORT PREVIEW                                                  */
/* ================================================================== */

function ReportPreviewSection({ t, isRTL }: { t: ReturnType<typeof useTranslations>; isRTL: boolean }) {
  const scoreKeys = ['content', 'clarity', 'confidence', 'culturalFit'] as const;

  return (
    <section id="report" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('reportPreviewTitle')}
          title={t('reportPreviewTitle')}
          titleHighlight={t('reportPreviewTitle')}
          sub={t('reportPreviewSub')}
        />

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="glass-card relative overflow-hidden p-6 md:p-8" style={{ transform: 'none' }}>
            {/* Sample badge */}
            <Badge variant="outline" className="absolute top-4 end-4 border-gold/30 text-gold">
              {t('sampleBadge')}
            </Badge>

            {/* Header */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-void">
                <span className="text-2xl font-extrabold text-gold">91</span>
              </div>
              <div className="text-center sm:text-start">
                <p className="text-xs text-[var(--text-faint)]">{t('reportPreviewTitle')}</p>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('sampleName')}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{t('sampleScore')}</p>
                <VerifiedBadge size="sm" className="mt-2" />
              </div>
            </div>

            {/* Score bars */}
            <div className="mt-8 space-y-4">
              {scoreKeys.map((key, i) => (
                <ScoreBar key={key} label={t(key)} value={SCORES[i]} />
              ))}
            </div>

            {/* AI Feedback */}
            <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gold">AI</p>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                {t('reportFeedback')}
              </p>
            </div>

            {/* QR Code + actions */}
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
              <QrCard verificationId="MQBL-DEMO-2026" className="!p-4" />
              <div className="flex flex-col gap-3 sm:items-end">
                <button disabled className="btn-ghost flex items-center gap-2 text-sm opacity-50">
                  <Download size={16} strokeWidth={1.75} />
                  {t('downloadPdfDisabled')}
                </button>
                <button disabled className="btn-ghost flex items-center gap-2 text-sm opacity-50">
                  <Share2 size={16} strokeWidth={1.75} />
                  {t('shareLinkedinDisabled')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  11. TESTIMONIALS                                                    */
/* ================================================================== */

function TestimonialsSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section id="testimonials" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('testimonialsTitle')}
          title={t('testimonialsTitle')}
          titleHighlight={t('testimonialsTitle')}
          sub={t('testimonialsSub')}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {([1, 2, 3] as const).map((n) => (
            <GlowCard key={n} className="p-6">
              <Quote size={20} strokeWidth={1.75} className="mb-3 text-gold/40" />
              <p className="mb-4 text-sm leading-relaxed text-[var(--text-muted)]">
                {t(`testimonial${n}Text`)}
              </p>
              <div className="border-t border-white/5 pt-4">
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {t(`testimonial${n}Name`)}
                </p>
                <p className="text-xs text-[var(--text-faint)]">
                  {t(`testimonial${n}Role`)}
                </p>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  12. FAQ                                                             */
/* ================================================================== */

function FaqSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('faqTitle')}
          title={t('faqTitle')}
          titleHighlight={t('faqTitle')}
        />

        <Accordion type="single" collapsible className="mt-12">
          {([1, 2, 3, 4, 5, 6] as const).map((n) => (
            <AccordionItem key={n} value={`faq-${n}`} className="border-white/5">
              <AccordionTrigger className="text-start text-sm font-medium text-[var(--text-primary)] hover:no-underline">
                {t(`faqQ${n}`)}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-[var(--text-muted)]">
                {t(`faqA${n}`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  13. FINAL CTA                                                      */
/* ================================================================== */

function FinalCtaSection({ t, tc }: { t: ReturnType<typeof useTranslations>; tc: ReturnType<typeof useTranslations> }) {
  return (
    <section className="aurora-bg relative overflow-hidden py-24">
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold md:text-5xl">
          <span className="gold-gradient-text">{t('finalCta')}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--text-muted)]">
          {t('finalCtaSub')}
        </p>
        <a href="/demo" className="btn-gold mt-8 inline-block">
          {tc('startFree')}
        </a>
      </div>
    </section>
  );
}
