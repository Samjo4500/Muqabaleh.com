'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type SimStatus = 'online' | 'preparing' | 'analyzing' | 'done';

type SimStep =
  | 'idle'
  | 'fahd-greeting'
  | 'fahd-question'
  | 'user-reply'
  | 'analyzing-score'
  | 'fahd-next'
  | 'cta';

/* ================================================================== */
/*  Waveform Bars (Canvas)                                              */
/* ================================================================== */

type WaveformBarsProps = { active: boolean; barCount?: number; className?: string };

const WaveformBars = memo(function WaveformBars({ active, barCount = 12, className = '' }: WaveformBarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const barsRef = useRef<number[]>(Array.from({ length: barCount }, () => 0.15));
  const targetRef = useRef<number[]>(Array.from({ length: barCount }, () => 0.15));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const barW = Math.max(2, (W / barCount) * 0.55);
    const gap = W / barCount;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < barCount; i++) {
        if (active && Math.random() < 0.14) {
          const center = barCount / 2;
          const dist = Math.abs(i - center) / center;
          const maxH = (1 - dist * 0.4) * H * 0.9;
          targetRef.current[i] = Math.max(H * 0.1, Math.random() * maxH);
        } else if (!active) {
          targetRef.current[i] = H * 0.08;
        }
        barsRef.current[i] += (targetRef.current[i] - barsRef.current[i]) * 0.14;

        const x = i * gap + (gap - barW) / 2;
        const barH = barsRef.current[i];
        const y = (H - barH) / 2;
        ctx.fillStyle = '#D4A843';
        ctx.globalAlpha = active ? 1 : 0.3;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, barW / 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active, barCount]);

  return <canvas ref={canvasRef} className={className} />;
});

/* ================================================================== */
/*  Score Ring (SVG, animated)                                           */
/* ================================================================== */

function SimScoreRing({ value, max = 10, size = 72, strokeWidth = 4, show }: { value: number; max?: number; size?: number; strokeWidth?: number; show: boolean }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const color = pct >= 0.7 ? '#D4A843' : pct >= 0.4 ? '#D4A843' : '#EF4444';

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={show ? { strokeDashoffset: circ * (1 - pct) } : { strokeDashoffset: circ }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ filter: 'drop-shadow(0 0 8px rgba(212,168,67,0.5))' }}
      />
      <motion.text
        x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.28} fontWeight="bold" className="rotate-90"
        initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 0.8, duration: 0.4 }}
      >
        {value}/{max}
      </motion.text>
    </motion.svg>
  );
}

/* ================================================================== */
/*  Typing Text Hook                                                    */
/* ================================================================== */

function useTypingText(text: string, active: boolean, speedMs = 30) {
  const [displayed, setDisplayed] = useState('');
  const idxRef = useRef(0);
  const activeRef = useRef(false);

  useEffect(() => {
    if (!active) {
      activeRef.current = false;
      idxRef.current = 0;
      return;
    }
    activeRef.current = true;
    idxRef.current = 0;
    const interval = setInterval(() => {
      if (!activeRef.current) { clearInterval(interval); return; }
      idxRef.current += 1;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) clearInterval(interval);
    }, speedMs);
    return () => { activeRef.current = false; clearInterval(interval); };
  }, [text, active, speedMs]);

  return displayed;
}

/* ================================================================== */
/*  Blinking Cursor                                                     */
/* ================================================================== */

function BlinkingCursor({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-block h-[1em] w-[2px] animate-pulse bg-gold align-middle ms-0.5" />
  );
}

/* ================================================================== */
/*  Floating Grid Dots (background decoration)                          */
/* ================================================================== */

function GridDots() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full opacity-[0.03]">
        <defs>
          <pattern id="hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#D4A843" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>
    </div>
  );
}

/* ================================================================== */
/*  Floating Orbs (aurora-like background blurs)                        */
/* ================================================================== */

function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />
    </div>
  );
}

/* ================================================================== */
/*  Scan Line Effect                                                    */
/* ================================================================== */

function ScanLine() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
      <div className="hero-scan-line" />
    </div>
  );
}

/* ================================================================== */
/*  MAIN HERO SIMULATION                                                */
/* ================================================================== */

export function HeroSimulation() {
  const t = useTranslations('landing');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<SimStep>('idle');
  const [status, setStatus] = useState<SimStatus>('online');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Simulation timeline
  useEffect(() => {
    if (!isVisible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => { timers.push(setTimeout(fn, ms)); };

    at(0, () => { setStep('fahd-greeting'); setStatus('online'); setIsSpeaking(true); });
    at(3500, () => { setIsSpeaking(false); setStatus('preparing'); });
    at(5500, () => { setStep('fahd-question'); setStatus('online'); setIsSpeaking(true); });
    at(9000, () => { setIsSpeaking(false); });
    at(9500, () => { setStep('user-reply'); });
    at(15000, () => { setStatus('analyzing'); setStep('analyzing-score'); });
    at(22000, () => { setStatus('online'); setStep('fahd-next'); setIsSpeaking(true); });
    at(28000, () => { setIsSpeaking(false); });
    at(30000, () => { setStep('cta'); setStatus('done'); });

    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  // Typing texts
  const greeting = useTypingText(t('simStep1'), step === 'fahd-greeting' && isVisible);
  const question = useTypingText(t('simStep2'), step === 'fahd-question' && isVisible);
  const userReply = useTypingText(t('simUserReply'), step === 'user-reply' && isVisible, 25);
  const nextQ = useTypingText(t('simStep5'), step === 'fahd-next' && isVisible);

  const currentFahdText = step === 'fahd-greeting' ? greeting : step === 'fahd-question' ? question : step === 'fahd-next' ? nextQ : '';
  const isCurrentlyTypingFahd = (step === 'fahd-greeting' || step === 'fahd-question' || step === 'fahd-next') && isVisible;
  const showUserBubble = step === 'user-reply' || step === 'analyzing-score' || step === 'fahd-next' || step === 'cta';
  const showScoreCard = step === 'analyzing-score' || step === 'fahd-next' || step === 'cta';
  const showCta = step === 'cta';

  // Status config
  const statusCfg: Record<SimStatus, { dot: string; label: string; cls: string }> = {
    online: { dot: 'bg-emerald', label: t('simOnline'), cls: 'border-emerald/30 bg-emerald/10 text-emerald' },
    preparing: { dot: 'bg-amber-400', label: t('simPreparing'), cls: 'border-amber-400/30 bg-amber-400/10 text-amber-400' },
    analyzing: { dot: 'bg-violet-400', label: t('simAnalyzing'), cls: 'border-violet-400/30 bg-violet-400/10 text-violet-400' },
    done: { dot: 'bg-emerald', label: t('simOnline'), cls: 'border-emerald/30 bg-emerald/10 text-emerald' },
  };
  const sc = statusCfg[status];

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section
      ref={containerRef}
      className="relative min-h-[600px] lg:min-h-[700px] overflow-hidden"
      style={{ backgroundColor: 'var(--bg-void)' }}
    >
      {/* ─── Background layers ─── */}
      <FloatingOrbs />
      <GridDots />

      {/* ─── Main content ─── */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:py-24">

        {/* ═══════ LEFT: Copy + CTA ═══════ */}
        <div className={`flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-start ${isRTL ? 'lg:order-2' : ''}`}>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="eyebrow"
          >
            {t('heroEyebrow')}
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl xl:text-[3.5rem]"
          >
            {t('heroH1')}{' '}
            <span className="gold-gradient-text">{t('heroH1Highlight')}</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-lg text-base leading-relaxed text-[var(--text-muted)] lg:text-lg"
          >
            {t('heroSub')}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <Link href="/auth/register" className="btn-gold inline-flex items-center gap-2 no-underline text-base">
              {t('heroCta1')}
              <ArrowIcon size={18} strokeWidth={2.5} />
            </Link>
            <a href="#how" className="btn-ghost inline-flex items-center gap-2 no-underline text-base">
              <Sparkles size={16} strokeWidth={2} className="text-gold" />
              {t('heroCta2')}
            </a>
          </motion.div>

          {/* Trust chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            {['20+ Countries', '4-Criteria AI', 'QR Verified'].map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-[var(--text-faint)]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold/60" />
                {chip}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ═══════ RIGHT: 3D Floating Terminal ═══════ */}
        <div className={`relative flex-1 ${isRTL ? 'lg:order-1' : ''}`}>
          {/* Glow behind terminal */}
          <div className="hero-terminal-glow" />

          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 8 }}
            animate={isVisible ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hero-terminal relative overflow-hidden rounded-2xl border border-white/[0.08]"
            style={{ perspective: '1200px' }}
          >
            <ScanLine />

            {/* Terminal header bar */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 text-center text-[11px] font-medium tracking-wider text-[var(--text-faint)] uppercase">
                Muqabaleh — AI Interview
              </div>
              <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${sc.cls}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot} ${status !== 'done' ? 'animate-pulse' : ''}`} />
                {sc.label}
              </div>
            </div>

            {/* Terminal body: interviewer + chat */}
            <div className="flex min-h-[340px] flex-col sm:flex-row">

              {/* ─── Interviewer sidebar ─── */}
              <div className="flex flex-col items-center gap-3 border-b sm:border-b-0 sm:border-e border-white/[0.06] px-5 py-5 sm:w-[140px] sm:shrink-0">
                {/* Avatar with gold ring */}
                <div className="relative hero-avatar-float">
                  <div className="rounded-full p-[3px]" style={{ background: 'linear-gradient(135deg, #F5D67B, #D4A843, #B8912A, #D4A843, #F5D67B)' }}>
                    <div className="rounded-full p-[2px]" style={{ background: 'var(--bg-panel)' }}>
                      <img
                        src="/images/fahd-pro.webp"
                        alt="Fahd"
                        className="h-[64px] w-[64px] rounded-full object-cover"
                        loading="eager"
                      />
                    </div>
                  </div>
                  <span className="absolute bottom-0 end-0 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[var(--bg-panel)] bg-emerald">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
                  </span>
                </div>
                <p className="text-xs font-bold text-white/90 text-center leading-tight">{t('simFahdTitle')}</p>
                {/* Waveform */}
                <div className="w-[80px] h-5 mt-1">
                  <WaveformBars active={isSpeaking} className="h-full w-full" />
                </div>
              </div>

              {/* ─── Chat area ─── */}
              <div className="flex flex-1 flex-col justify-center gap-3 p-4 sm:p-5 overflow-hidden">
                <AnimatePresence mode="wait">
                  {/* Fahd speech bubble */}
                  {isCurrentlyTypingFahd && currentFahdText && (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, scale: 0.92, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`relative flex items-start gap-2.5 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      <div className={`relative max-w-[88%] rounded-2xl rounded-tl-sm ${isRTL ? 'rounded-tr-sm rounded-tl-2xl' : 'rounded-tl-sm rounded-tr-2xl'} border border-gold/15 bg-gold/[0.07] px-4 py-3 text-[13px] sm:text-sm leading-relaxed text-white/90`}
                      >
                        {currentFahdText}
                        <BlinkingCursor show={isCurrentlyTypingFahd && currentFahdText.length < (step === 'fahd-greeting' ? t('simStep1').length : step === 'fahd-question' ? t('simStep2').length : t('simStep5').length)} />
                      </div>
                    </motion.div>
                  )}

                  {/* User reply bubble */}
                  {showUserBubble && userReply && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex items-start ${isRTL ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[82%] rounded-2xl ${isRTL ? 'rounded-tl-sm' : 'rounded-tr-sm'} border border-white/[0.08] bg-white/[0.05] backdrop-blur-sm px-4 py-3 text-[13px] sm:text-sm leading-relaxed text-white/70`}
                      >
                        {userReply}
                        <BlinkingCursor show={step === 'user-reply' && userReply.length < t('simUserReply').length} />
                      </div>
                    </motion.div>
                  )}

                  {/* Score + Feedback card */}
                  {showScoreCard && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.15 }}
                      className={`flex items-center gap-4 rounded-xl border border-gold/10 bg-white/[0.03] backdrop-blur-sm p-4 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <SimScoreRing value={7} max={10} size={64} strokeWidth={3.5} show={showScoreCard} />
                      <div className={`flex flex-col gap-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gold">AI Feedback</p>
                        <p className="text-xs leading-relaxed text-white/60">{t('simFeedback')}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ─── CTA Overlay inside terminal ─── */}
            <AnimatePresence>
              {showCta && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl px-6"
                  style={{ background: 'rgba(7,10,15,0.88)', backdropFilter: 'blur(6px)' }}
                >
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white text-center">
                    <span className="gold-gradient-text">{t('simCtaHeadline')}</span>
                  </h3>
                  <Link href="/auth/register" className="btn-gold mt-1 no-underline text-sm sm:text-base">
                    {t('simCtaButton')}
                  </Link>
                  <p className="text-xs text-white/40">{t('simCtaSub')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Floating decorative badges around terminal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
            className={`hero-float-badge hero-float-badge-1 absolute -top-4 ${isRTL ? '-start-4' : '-end-4'}`}
          >
            <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-[var(--bg-panel)]/90 backdrop-blur-sm px-3 py-2 shadow-lg">
              <SimScoreRing value={7} max={10} size={36} strokeWidth={2.5} show={true} />
              <span className="text-[10px] font-bold text-gold/80">7/10</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 1.0 }}
            className={`hero-float-badge hero-float-badge-2 absolute -bottom-3 ${isRTL ? '-end-6' : '-start-6'}`}
          >
            <div className="flex items-center gap-2 rounded-xl border border-emerald/20 bg-[var(--bg-panel)]/90 backdrop-blur-sm px-3 py-2 shadow-lg">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/20">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald animate-pulse" />
              </span>
              <span className="text-[10px] font-bold text-emerald/80">Live</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
