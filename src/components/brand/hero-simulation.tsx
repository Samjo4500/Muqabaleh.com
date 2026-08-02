'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

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
/*  Waveform Bars (lightweight, CSS + tiny canvas)                       */
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
/*  Score Ring (inline, minimal)                                         */
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
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={show ? { strokeDashoffset: circ * (1 - pct) } : { strokeDashoffset: circ }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 8px rgba(212,168,67,0.5))` }}
      />
      <motion.text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={size * 0.28}
        fontWeight="bold"
        className="rotate-90"
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
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
/*  Floating Particles (CSS only)                                        */
/* ================================================================== */

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 20 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold/[0.07]"
          style={{
            width: `${3 + (i % 4) * 2}px`,
            height: `${3 + (i % 4) * 2}px`,
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            animation: `hero-float-particle ${6 + (i % 5)}s ease-in-out ${(i % 3)}s infinite alternate`,
          }}
        />
      ))}
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

  // IntersectionObserver for lazy load + pause
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

    // Step 1: Fahd greeting
    at(0, () => { setStep('fahd-greeting'); setStatus('online'); setIsSpeaking(true); });
    at(3500, () => { setIsSpeaking(false); setStatus('preparing'); });

    // Step 2: Fahd question
    at(5500, () => { setStep('fahd-question'); setStatus('online'); setIsSpeaking(true); });
    at(9000, () => { setIsSpeaking(false); });

    // Step 3: User reply
    at(9500, () => { setStep('user-reply'); });

    // Step 4: Analyzing
    at(15000, () => { setStatus('analyzing'); setStep('analyzing-score'); });

    // Step 5: Fahd next question
    at(22000, () => { setStatus('online'); setStep('fahd-next'); setIsSpeaking(true); });
    at(28000, () => { setIsSpeaking(false); });

    // Step 6: CTA
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

  return (
    <section
      ref={containerRef}
      className="relative min-h-[500px] md:min-h-[600px] overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1628, #0f1d2e)' }}
    >
      <FloatingParticles />

      <div className="relative z-10 mx-auto flex min-h-[500px] md:min-h-[600px] max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col md:flex-row items-stretch gap-6 md:gap-0 py-16 md:py-0 ${isRTL ? 'md:flex-row-reverse' : ''}`}>

          {/* ─── LEFT (40%): Interviewer Panel ─── */}
          <div className="flex flex-col items-center justify-center gap-5 md:w-[40%] md:py-16">
            {/* Avatar */}
            <div className="relative">
              <div
                className="rounded-full p-[4px]"
                style={{ background: 'linear-gradient(135deg, #F5D67B, #D4A843, #B8912A, #D4A843, #F5D67B)' }}
              >
                <div className="rounded-full bg-[#0a1628] p-[3px]">
                  <img
                    src="/images/fahd-pro.webp"
                    alt="Fahd"
                    className="h-[120px] w-[120px] md:h-[200px] md:w-[200px] rounded-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>
              {/* Online dot */}
              <span className="absolute bottom-2 end-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0a1628] bg-emerald">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald animate-pulse" />
              </span>
            </div>

            {/* Name */}
            <p className="text-base md:text-lg font-bold text-white">{t('simFahdTitle')}</p>

            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${sc.cls}`}>
              <span className={`h-2 w-2 rounded-full ${sc.dot} ${status !== 'done' ? 'animate-pulse' : ''}`} />
              {sc.label}
            </div>

            {/* Waveform */}
            <div className="w-[80px] md:w-[160px] h-6">
              <WaveformBars active={isSpeaking} className="h-full w-full" />
            </div>
          </div>

          {/* ─── RIGHT (60%): Chat Simulation ─── */}
          <div className="flex flex-1 flex-col justify-center gap-4 md:px-8">
            <AnimatePresence mode="wait">
              {/* Fahd speech bubble */}
              {isCurrentlyTypingFahd && currentFahdText && (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-3 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`relative max-w-[85%] rounded-2xl ${isRTL ? 'rounded-tl-sm' : 'rounded-tr-sm'} border border-gold/20 bg-gold/[0.08] px-5 py-3.5 text-sm md:text-base leading-relaxed text-white`}
                  >
                    {currentFahdText}
                    <BlinkingCursor show={isCurrentlyTypingFahd && currentFahdText.length < (step === 'fahd-greeting' ? t('simStep1').length : step === 'fahd-question' ? t('simStep2').length : t('simStep5').length)} />
                  </div>
                </motion.div>
              )}

              {/* User reply bubble */}
              {showUserBubble && userReply && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start ${isRTL ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl ${isRTL ? 'rounded-tr-sm' : 'rounded-tl-sm'} border border-white/10 bg-white/[0.06] backdrop-blur-sm px-5 py-3.5 text-sm md:text-base leading-relaxed text-white/80`}
                  >
                    {userReply}
                    <BlinkingCursor show={step === 'user-reply' && userReply.length < t('simUserReply').length} />
                  </div>
                </motion.div>
              )}

              {/* Score + Feedback card */}
              {showScoreCard && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`flex items-center gap-5 rounded-2xl border border-gold/15 bg-white/[0.04] backdrop-blur-sm p-5 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <SimScoreRing value={7} max={10} size={72} strokeWidth={4} show={showScoreCard} />
                  <div className={`flex flex-col gap-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-gold">AI Feedback</p>
                    <p className="text-sm leading-relaxed text-white/70">{t('simFeedback')}</p>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-4"
              style={{ background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(4px)' }}
            >
              <h2 className="text-2xl md:text-4xl font-extrabold text-white text-center">
                <span className="gold-gradient-text">{t('simCtaHeadline')}</span>
              </h2>
              <Link href="/auth/register" className="btn-gold mt-2 text-base md:text-lg no-underline">
                {t('simCtaButton')}
              </Link>
              <p className="text-sm text-white/50">{t('simCtaSub')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Particle keyframes injected once */}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes hero-float-particle { 0% { transform: translateY(0px) translateX(0px); opacity: 0.3; } 100% { transform: translateY(-30px) translateX(15px); opacity: 0.7; } }` }} />
    </section>
  );
}
