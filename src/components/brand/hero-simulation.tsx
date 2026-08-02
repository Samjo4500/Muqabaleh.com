'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Sparkles, Zap, Globe2, ShieldCheck } from 'lucide-react';

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type SimStatus = 'online' | 'preparing' | 'analyzing' | 'done';
type SimStep = 'idle' | 'fahd-greeting' | 'fahd-question' | 'user-reply' | 'analyzing-score' | 'fahd-next' | 'cta';

/* ================================================================== */
/*  Ember Particles (Full-screen Canvas)                                */
/* ================================================================== */

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number; maxLife: number;
}

const EmberParticles = memo(function EmberParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const nextSpawnRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const MAX = 60;
    let frame = 0;

    function spawn(): Particle {
      return {
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(0.3 + Math.random() * 0.8),
        size: 1 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.5,
        life: 0,
        maxLife: 200 + Math.random() * 300,
      };
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      frame++;

      // spawn
      if (frame >= nextSpawnRef.current) {
        if (particlesRef.current.length < MAX) particlesRef.current.push(spawn());
        nextSpawnRef.current = frame + 3 + Math.floor(Math.random() * 8);
      }

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.02;
        p.life++;
        const progress = p.life / p.maxLife;
        const fade = progress < 0.1 ? progress / 0.1 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        const a = p.alpha * fade;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,168,67,${a})`;
        ctx.fill();

        // soft glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,168,67,${a * 0.15})`;
        ctx.fill();

        return p.life < p.maxLife;
      });

      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1]" />;
});

/* ================================================================== */
/*  Waveform Bars (Canvas)                                              */
/* ================================================================== */

type WaveformBarsProps = { active: boolean; barCount?: number; className?: string };

const WaveformBars = memo(function WaveformBars({ active, barCount = 16, className = '' }: WaveformBarsProps) {
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
/*  Score Ring (SVG)                                                    */
/* ================================================================== */

function SimScoreRing({ value, max = 10, size = 72, strokeWidth = 4, show }: { value: number; max?: number; size?: number; strokeWidth?: number; show: boolean }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const color = pct >= 0.7 ? '#D4A843' : pct >= 0.4 ? '#D4A843' : '#EF4444';
  return (
    <motion.svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90"
      initial={{ opacity: 0, scale: 0.8 }} animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
        animate={show ? { strokeDashoffset: circ * (1 - pct) } : { strokeDashoffset: circ }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ filter: 'drop-shadow(0 0 10px rgba(212,168,67,0.6))' }} />
      <motion.text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.28} fontWeight="bold" className="rotate-90"
        initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 0.8, duration: 0.4 }}>
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
    if (!active) { activeRef.current = false; idxRef.current = 0; return; }
    activeRef.current = true; idxRef.current = 0;
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
  return <span className="inline-block h-[1em] w-[2px] animate-pulse bg-gold align-middle ms-0.5" />;
}

/* ================================================================== */
/*  MAIN HERO                                                          */
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

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const observer = new IntersectionObserver(([e]) => setIsVisible(e.isIntersecting), { threshold: 0.05 });
    observer.observe(el); return () => observer.disconnect();
  }, []);

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

  const greeting = useTypingText(t('simStep1'), step === 'fahd-greeting' && isVisible);
  const question = useTypingText(t('simStep2'), step === 'fahd-question' && isVisible);
  const userReply = useTypingText(t('simUserReply'), step === 'user-reply' && isVisible, 25);
  const nextQ = useTypingText(t('simStep5'), step === 'fahd-next' && isVisible);

  const currentFahdText = step === 'fahd-greeting' ? greeting : step === 'fahd-question' ? question : step === 'fahd-next' ? nextQ : '';
  const isCurrentlyTypingFahd = (step === 'fahd-greeting' || step === 'fahd-question' || step === 'fahd-next') && isVisible;
  const showUserBubble = step === 'user-reply' || step === 'analyzing-score' || step === 'fahd-next' || step === 'cta';
  const showScoreCard = step === 'analyzing-score' || step === 'fahd-next' || step === 'cta';
  const showCta = step === 'cta';

  const statusCfg: Record<SimStatus, { dot: string; label: string; cls: string }> = {
    online: { dot: 'bg-emerald', label: t('simOnline'), cls: 'border-emerald/30 bg-emerald/10 text-emerald' },
    preparing: { dot: 'bg-amber-400', label: t('simPreparing'), cls: 'border-amber-400/30 bg-amber-400/10 text-amber-400' },
    analyzing: { dot: 'bg-violet-400', label: t('simAnalyzing'), cls: 'border-violet-400/30 bg-violet-400/10 text-violet-400' },
    done: { dot: 'bg-emerald', label: t('simOnline'), cls: 'border-emerald/30 bg-emerald/10 text-emerald' },
  };
  const sc = statusCfg[status];
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const stagger = (i: number) => ({ duration: 0.7, delay: 0.15 + i * 0.12 });

  return (
    <section
      ref={containerRef}
      className="hero-cinematic relative w-full overflow-hidden"
      style={{ backgroundColor: 'var(--bg-void)' }}
    >
      {/* ═══ BACKGROUND LAYERS ═══ */}
      {/* Mesh gradient orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="hero-mesh-orb hero-mesh-orb-1" />
        <div className="hero-mesh-orb hero-mesh-orb-2" />
        <div className="hero-mesh-orb hero-mesh-orb-3" />
        <div className="hero-mesh-orb hero-mesh-orb-4" />
      </div>

      {/* Perspective grid */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="hero-perspective-grid" />
      </div>

      {/* Ember particles */}
      <EmberParticles />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 z-[2] hero-vignette" aria-hidden="true" />

      {/* ═══ CONTENT ═══ */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8">

        {/* ─── TOP: Headline ─── */}
        <div className="w-full max-w-5xl text-center mb-10 lg:mb-14">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="eyebrow mb-5"
          >
            {t('heroEyebrow')}
          </motion.div>

          {/* H1 — MASSIVE */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="hero-headline mx-auto text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          >
            {t('heroH1')}{' '}
            <span className="gold-gradient-text hero-text-shimmer">{t('heroH1Highlight')}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg lg:text-xl"
          >
            {t('heroSub')}
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/auth/register" className="hero-cta-glow btn-gold inline-flex items-center gap-2.5 no-underline text-base sm:text-lg">
              {t('heroCta1')}
              <ArrowIcon size={20} strokeWidth={2.5} />
            </Link>
            <a href="#how" className="btn-ghost inline-flex items-center gap-2 no-underline text-base">
              <Sparkles size={16} strokeWidth={2} className="text-gold" />
              {t('heroCta2')}
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            {[{ icon: <Globe2 size={14} />, label: isRTL ? '+20 دولة' : '20+ Countries' },
              { icon: <Zap size={14} />, label: isRTL ? 'ذكاء اصطناعي رباعي' : '4-Criteria AI' },
              { icon: <ShieldCheck size={14} />, label: isRTL ? 'موثّق بـ QR' : 'QR Verified' },
            ].map((chip, i) => (
              <span key={i} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm px-4 py-2 text-xs font-medium text-[var(--text-faint)] sm:text-sm">
                <span className="text-gold/70">{chip.icon}</span>
                {chip.label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ─── BOTTOM: Full-width Holographic Terminal ─── */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hero-terminal-wrapper relative w-full max-w-6xl"
        >
          {/* Holographic border container */}
          <div className="hero-holo-border rounded-2xl lg:rounded-3xl">
            <div className="hero-terminal relative overflow-hidden rounded-2xl lg:rounded-3xl border border-white/[0.06]">

              {/* Scan line */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl lg:rounded-3xl z-30" aria-hidden="true">
                <div className="hero-scan-line" />
              </div>

              {/* ─── Terminal header bar ─── */}
              <div className="relative z-20 flex items-center gap-3 border-b border-white/[0.06] px-5 py-3 sm:px-6 sm:py-3.5">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-white/[0.08]" />
                  <span className="h-3 w-3 rounded-full bg-white/[0.08]" />
                  <span className={`h-3 w-3 rounded-full ${status === 'online' ? 'bg-emerald/60' : status === 'analyzing' ? 'bg-violet-400/60' : 'bg-amber-400/60'}`} />
                </div>
                <div className="flex-1 text-center text-[11px] sm:text-xs font-medium tracking-widest text-[var(--text-faint)] uppercase">
                  {isRTL ? 'مقابلة — Muqabaleh AI' : 'Muqabaleh — AI Interview Session'}
                </div>
                <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold ${sc.cls}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${sc.dot} ${status !== 'done' ? 'animate-pulse' : ''}`} />
                  {sc.label}
                </div>
              </div>

              {/* ─── Terminal body ─── */}
              <div className={`relative flex min-h-[300px] sm:min-h-[360px] lg:min-h-[400px] flex-col sm:flex-row`}>

                {/* Interviewer sidebar */}
                <div className={`hero-sidebar-glow relative z-10 flex flex-col items-center gap-3 border-b sm:border-b-0 sm:border-e border-white/[0.06] px-5 py-6 sm:w-[180px] lg:w-[200px] sm:shrink-0`}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }} animate={isVisible ? { scale: 1, opacity: 1 } : {}}
                    transition={stagger(0)}
                    className="relative hero-avatar-float"
                  >
                    <div className="hero-avatar-ring rounded-full p-[3px]">
                      <div className="rounded-full p-[2px]" style={{ background: 'var(--bg-panel)' }}>
                        <img src="/images/fahd-pro.webp" alt="Fahd" className="h-[72px] w-[72px] sm:h-[80px] sm:w-[80px] rounded-full object-cover" loading="eager" />
                      </div>
                    </div>
                    <span className="absolute bottom-0.5 end-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--bg-panel)] bg-emerald">
                      <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
                    </span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : {}} transition={stagger(1)}
                    className="text-xs sm:text-sm font-bold text-white/90 text-center leading-tight"
                  >
                    {t('simFahdTitle')}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : {}} transition={stagger(2)}
                    className="w-[100px] h-5 mt-1"
                  >
                    <WaveformBars active={isSpeaking} className="h-full w-full" />
                  </motion.div>

                  {/* Mini metrics in sidebar */}
                  <motion.div
                    initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : {}} transition={stagger(3)}
                    className="mt-2 flex flex-col items-center gap-2"
                  >
                    <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Q</span>
                      <span className="text-xs font-bold text-gold">2/5</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">⏱</span>
                      <span className="text-xs font-bold text-white/70">02:34</span>
                    </div>
                  </motion.div>
                </div>

                {/* ─── Chat area ─── */}
                <div className="flex flex-1 flex-col justify-center gap-3 p-4 sm:p-5 lg:p-6 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {/* Fahd bubble */}
                    {isCurrentlyTypingFahd && currentFahdText && (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: isRTL ? -20 : 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-start gap-3 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}
                      >
                        <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl ${isRTL ? 'rounded-tl-sm' : 'rounded-tr-sm'} border border-gold/15 bg-gold/[0.07] px-4 py-3 sm:px-5 sm:py-3.5 text-sm sm:text-[15px] leading-relaxed text-white/90`}
                        >
                          {currentFahdText}
                          <BlinkingCursor show={isCurrentlyTypingFahd && currentFahdText.length < (
                            step === 'fahd-greeting' ? t('simStep1').length :
                            step === 'fahd-question' ? t('simStep2').length :
                            t('simStep5').length
                          )} />
                        </div>
                      </motion.div>
                    )}

                    {/* User reply */}
                    {showUserBubble && userReply && (
                      <motion.div
                        initial={{ opacity: 0, x: isRTL ? 20 : -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-start ${isRTL ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl ${isRTL ? 'rounded-tr-sm' : 'rounded-tl-sm'} border border-white/[0.08] bg-white/[0.05] backdrop-blur-sm px-4 py-3 sm:px-5 sm:py-3.5 text-sm sm:text-[15px] leading-relaxed text-white/70`}
                        >
                          {userReply}
                          <BlinkingCursor show={step === 'user-reply' && userReply.length < t('simUserReply').length} />
                        </div>
                      </motion.div>
                    )}

                    {/* Score card */}
                    {showScoreCard && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className={`flex items-center gap-5 rounded-2xl border border-gold/10 bg-white/[0.03] backdrop-blur-sm p-5 ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <SimScoreRing value={7} max={10} size={72} strokeWidth={3.5} show={showScoreCard} />
                        <div className={`flex flex-col gap-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gold">AI Feedback</p>
                          <p className="text-xs sm:text-sm leading-relaxed text-white/60">{t('simFeedback')}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ─── CTA Overlay ─── */}
              <AnimatePresence>
                {showCta && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl lg:rounded-3xl px-6"
                    style={{ background: 'rgba(7,10,15,0.9)', backdropFilter: 'blur(8px)' }}
                  >
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white text-center">
                      <span className="gold-gradient-text">{t('simCtaHeadline')}</span>
                    </h3>
                    <Link href="/auth/register" className="btn-gold mt-2 no-underline text-base sm:text-lg">
                      {t('simCtaButton')}
                    </Link>
                    <p className="text-sm text-white/40">{t('simCtaSub')}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── Floating decorative badges ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }} animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.2 }}
            className={`hero-float-badge hero-float-badge-1 absolute -top-5 ${isRTL ? '-start-3 sm:-start-8' : '-end-3 sm:-end-8'}`}
          >
            <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-[var(--bg-panel)]/95 backdrop-blur-md px-3 py-2.5 shadow-2xl">
              <SimScoreRing value={7} max={10} size={40} strokeWidth={2.5} show={true} />
              <span className="text-[11px] font-bold text-gold/90">7/10</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.7 }} animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.4 }}
            className={`hero-float-badge hero-float-badge-2 absolute -bottom-4 ${isRTL ? '-end-4 sm:-end-10' : '-start-4 sm:-start-10'}`}
          >
            <div className="flex items-center gap-2 rounded-xl border border-emerald/20 bg-[var(--bg-panel)]/95 backdrop-blur-md px-3 py-2.5 shadow-2xl">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/20">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald animate-pulse" />
              </span>
              <span className="text-[11px] font-bold text-emerald/90">{t('simOnline')}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.7 }} animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.6 }}
            className={`hero-float-badge hero-float-badge-3 absolute top-1/2 -translate-y-1/2 ${isRTL ? '-start-6 sm:-start-14' : '-end-6 sm:-end-14'}`}
          >
            <div className="flex flex-col items-center gap-1 rounded-xl border border-violet-400/15 bg-[var(--bg-panel)]/95 backdrop-blur-md px-3 py-2.5 shadow-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400/70">AI</span>
              <span className="text-xs font-extrabold text-white/80">4-Criteria</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
