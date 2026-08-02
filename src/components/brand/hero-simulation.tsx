'use client';

import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Sparkles, Zap, Globe2, ShieldCheck, Activity, Cpu, Radio } from 'lucide-react';

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type SimStatus = 'idle' | 'online' | 'preparing' | 'analyzing' | 'done';
type SimStep = 'idle' | 'fahd-greeting' | 'fahd-question' | 'user-reply' | 'analyzing-score' | 'fahd-next' | 'cta';

/* ================================================================== */
/*  AI CORE VISUALIZATION — Orbital ring system with particles          */
/* ================================================================== */

interface OrbitalParticle {
  ring: number;
  angle: number;
  speed: number;
  size: number;
  alpha: number;
}

function AiCoreInner({ status }: { status: SimStatus }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const particlesRef = useRef<OrbitalParticle[]>([]);
  const timeRef = useRef(0);

  const init = useCallback((size: number) => {
    const particles: OrbitalParticle[] = [];
    const ringCount = 4;
    for (let r = 0; r < ringCount; r++) {
      const count = 6 + r * 3;
      for (let i = 0; i < count; i++) {
        particles.push({
          ring: r,
          angle: (i / count) * Math.PI * 2 + Math.random() * 0.3,
          speed: (0.003 + Math.random() * 0.004) * (r % 2 === 0 ? 1 : -1),
          size: 1.2 + Math.random() * 1.8,
          alpha: 0.3 + Math.random() * 0.5,
        });
      }
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const container = canvas.parentElement; if (!container) return;
    const dpr = window.devicePixelRatio || 1;
    let W = 0, H = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      if (particlesRef.current.length === 0) init(Math.min(W, H));
    };
    resize();
    window.addEventListener('resize', resize);

    const isActive = status === 'online' || status === 'analyzing';
    const isAnalyzing = status === 'analyzing';

    function draw() {
      ctx.clearRect(0, 0, W, H);
      timeRef.current += 0.016;
      const t = timeRef.current;
      const cx = W / 2, cy = H / 2;
      const baseR = Math.min(W, H) * 0.38;

      // Core glow
      const glowR = baseR * (0.35 + Math.sin(t * 1.5) * 0.05);
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      if (isAnalyzing) {
        coreGrad.addColorStop(0, `rgba(139,92,246,${0.25 + Math.sin(t * 3) * 0.1})`);
        coreGrad.addColorStop(0.5, 'rgba(139,92,246,0.08)');
        coreGrad.addColorStop(1, 'rgba(139,92,246,0)');
      } else {
        coreGrad.addColorStop(0, `rgba(212,168,67,${isActive ? 0.3 + Math.sin(t * 2) * 0.1 : 0.15})`);
        coreGrad.addColorStop(0.5, 'rgba(212,168,67,0.06)');
        coreGrad.addColorStop(1, 'rgba(212,168,67,0)');
      }
      ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI * 2); ctx.fillStyle = coreGrad; ctx.fill();

      // Inner core dot
      const coreDot = baseR * 0.06;
      ctx.beginPath(); ctx.arc(cx, cy, coreDot, 0, Math.PI * 2);
      ctx.fillStyle = isAnalyzing ? 'rgba(139,92,246,0.9)' : 'rgba(212,168,67,0.9)'; ctx.fill();
      // Core dot glow
      ctx.beginPath(); ctx.arc(cx, cy, coreDot * 3, 0, Math.PI * 2);
      ctx.fillStyle = isAnalyzing ? 'rgba(139,92,246,0.15)' : 'rgba(212,168,67,0.15)'; ctx.fill();

      // Orbital rings
      const ringCount = 4;
      for (let r = 0; r < ringCount; r++) {
        const ringR = baseR * (0.35 + r * 0.18);
        const rotation = t * (0.15 + r * 0.08) * (r % 2 === 0 ? 1 : -1);
        const alpha = isActive ? 0.2 + r * 0.03 : 0.08;
        const color = isAnalyzing
          ? `rgba(139,92,246,${alpha})`
          : `rgba(212,168,67,${alpha})`;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        // Draw ring arc (partial)
        const arcLen = Math.PI * (0.6 + r * 0.25);
        const arcStart = (r * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(0, 0, ringR, arcStart, arcStart + arcLen);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Second arc segment
        ctx.beginPath();
        ctx.arc(0, 0, ringR, arcStart + arcLen + 0.4, arcStart + arcLen + 0.4 + arcLen * 0.5);
        ctx.strokeStyle = isAnalyzing ? `rgba(139,92,246,${alpha * 0.5})` : `rgba(212,168,67,${alpha * 0.5})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }

      // Draw particles on rings
      for (const p of particlesRef.current) {
        p.angle += p.speed * (isActive ? (isAnalyzing ? 2.5 : 1.5) : 0.5);
        const ringR = baseR * (0.35 + p.ring * 0.18);
        const px = cx + Math.cos(p.angle) * ringR;
        const py = cy + Math.sin(p.angle) * ringR;
        const pAlpha = isActive ? p.alpha : p.alpha * 0.3;
        const pColor = isAnalyzing ? `rgba(139,92,246,${pAlpha})` : `rgba(212,168,67,${pAlpha})`;

        ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = pColor; ctx.fill();

        // Glow
        if (isActive) {
          ctx.beginPath(); ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = isAnalyzing ? `rgba(139,92,246,${pAlpha * 0.12})` : `rgba(212,168,67,${pAlpha * 0.12})`;
          ctx.fill();
        }
      }

      // Energy pulses (expanding rings from center)
      if (isActive && Math.random() < (isAnalyzing ? 0.015 : 0.006)) {
        // We'll just draw a subtle flash
        const flashR = baseR * 0.15;
        const flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
        flashGrad.addColorStop(0, isAnalyzing ? 'rgba(139,92,246,0.15)' : 'rgba(212,168,67,0.12)');
        flashGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(cx, cy, flashR, 0, Math.PI * 2);
        ctx.fillStyle = flashGrad; ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [status, init]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
const AiCore = memo(AiCoreInner);

/* ================================================================== */
/*  FLOATING PARTICLES — Background atmosphere                          */
/* ================================================================== */

interface FParticle { x: number; y: number; vx: number; vy: number; size: number; life: number; maxLife: number; }

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const particlesRef = useRef<FParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.parentElement?.getBoundingClientRect().width ?? window.innerWidth;
      H = canvas.parentElement?.getBoundingClientRect().height ?? window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Spawn new particles
      if (Math.random() < 0.15) {
        particlesRef.current.push({
          x: Math.random() * W, y: H + 5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(0.2 + Math.random() * 0.5),
          size: 0.5 + Math.random() * 1.5,
          life: 0,
          maxLife: 200 + Math.random() * 300,
        });
      }

      // Update and draw
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life++;
        const progress = p.life / p.maxLife;
        const alpha = progress < 0.1 ? progress / 0.1 : progress > 0.8 ? (1 - progress) / 0.2 : 1;
        if (p.life >= p.maxLife) return false;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,168,67,${alpha * 0.35})`;
        ctx.fill();
        return true;
      });

      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1]" />;
}

/* ================================================================== */
/*  SCORE RING — SVG animated circular gauge                            */
/* ================================================================== */

function ScoreRing({ value, max = 10, size = 100, show }: { value: number; max?: number; size?: number; show: boolean }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  return (
    <motion.svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      initial={{ opacity: 0, scale: 0.6, rotate: -90 }} animate={show ? { opacity: 1, scale: 1, rotate: 0 } : {}}
      transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={3} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#D4A843" strokeWidth={3} strokeLinecap="round"
        strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
        animate={show ? { strokeDashoffset: circ * (1 - pct) } : {}}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        style={{ filter: 'drop-shadow(0 0 8px rgba(212,168,67,0.5))' }} />
      <motion.text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill="#D4A843" fontSize={size * 0.28} fontWeight="bold"
        initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}>
        {value}
      </motion.text>
      <motion.text x={size/2} y={size/2 + size * 0.18} textAnchor="middle" dominantBaseline="central"
        fill="rgba(255,255,255,0.25)" fontSize={size * 0.08} fontWeight="600"
        initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}>
        / {max}
      </motion.text>
    </motion.svg>
  );
}

/* ================================================================== */
/*  CRITERIA BARS — Animated horizontal bars                            */
/* ================================================================== */

function CriteriaBars({ show }: { show: boolean }) {
  const criteria = [
    { label_en: 'Clarity', label_ar: 'الوضوح', value: 85, color: '#D4A843' },
    { label_en: 'Depth', label_ar: 'العمق', value: 72, color: '#8B5CF6' },
    { label_en: 'Relevance', label_ar: 'الصلة', value: 90, color: '#10B981' },
    { label_en: 'Confidence', label_ar: 'الثقة', value: 78, color: '#22D3EE' },
  ];
  return (
    <div className="flex flex-col gap-3">
      {criteria.map((c, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={show ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }} className="flex items-center gap-3">
          <span className="w-16 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)] shrink-0">{c.label_en}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={show ? { width: `${c.value}%` } : {}}
              transition={{ delay: 0.4 + i * 0.12, duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}40` }} />
          </div>
          <span className="w-7 text-[10px] font-bold text-right" style={{ color: c.color }}>{c.value}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  TYPING HOOK + CURSOR                                                 */
/* ================================================================== */

function useTypingText(text: string, active: boolean, speedMs = 30) {
  const [d, setD] = useState('');
  const idx = useRef(0); const on = useRef(false);
  useEffect(() => {
    if (!active) { on.current = false; idx.current = 0; return; }
    on.current = true; idx.current = 0;
    const iv = setInterval(() => {
      if (!on.current) { clearInterval(iv); return; }
      idx.current++; setD(text.slice(0, idx.current));
      if (idx.current >= text.length) clearInterval(iv);
    }, speedMs);
    return () => { on.current = false; clearInterval(iv); };
  }, [text, active, speedMs]);
  return d;
}

function Cursor({ show }: { show: boolean }) {
  if (!show) return null;
  return <span className="inline-block h-[1em] w-[2px] animate-pulse bg-gold align-middle ms-0.5" />;
}

/* ================================================================== */
/*  MAIN HERO — THE NEURAL COMMAND DECK                                */
/* ================================================================== */

export function HeroSimulation() {
  const t = useTranslations('landing');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  const [step, setStep] = useState<SimStep>('idle');
  const [status, setStatus] = useState<SimStatus>('idle');

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!vis) return;
    const T: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => T.push(setTimeout(fn, ms));
    at(0, () => { setStep('fahd-greeting'); setStatus('online'); });
    at(3000, () => { setStep('fahd-question'); });
    at(7500, () => setStep('user-reply'));
    at(12000, () => { setStatus('analyzing'); setStep('analyzing-score'); });
    at(18000, () => { setStatus('online'); setStep('fahd-next'); });
    at(24000, () => { setStep('cta'); setStatus('done'); });
    return () => T.forEach(clearTimeout);
  }, [vis]);

  const g1 = useTypingText(t('simStep1'), step === 'fahd-greeting' && vis);
  const g2 = useTypingText(t('simStep2'), step === 'fahd-question' && vis);
  const ur = useTypingText(t('simUserReply'), step === 'user-reply' && vis, 25);
  const g3 = useTypingText(t('simStep5'), step === 'fahd-next' && vis);

  const fahdText = step === 'fahd-greeting' ? g1 : step === 'fahd-question' ? g2 : step === 'fahd-next' ? g3 : '';
  const typing = (step === 'fahd-greeting' || step === 'fahd-question' || step === 'fahd-next') && vis;
  const showUser = step === 'user-reply' || step === 'analyzing-score' || step === 'fahd-next' || step === 'cta';
  const showScore = step === 'analyzing-score' || step === 'fahd-next' || step === 'cta';
  const showCta = step === 'cta';

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // Timestamp for data feed
  const [timestamp, setTimestamp] = useState('00:00');
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!vis || step === 'idle' || step === 'cta') return;
    const iv = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        const m = String(Math.floor(next / 60)).padStart(2, '0');
        const s = String(next % 60).padStart(2, '0');
        setTimestamp(`${m}:${s}`);
        return next;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [vis, step]);

  const st = (i: number) => ({ duration: 0.7, delay: 0.15 + i * 0.1 });

  return (
    <section ref={ref} className="relative w-full overflow-hidden" style={{ backgroundColor: 'var(--bg-void)', minHeight: '85vh' }}>
      {/* -- BACKGROUND LAYERS -- */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="hero-mesh-orb hero-mesh-orb-1" />
        <div className="hero-mesh-orb hero-mesh-orb-2" />
        <div className="hero-mesh-orb hero-mesh-orb-3" />
      </div>
      <FloatingParticles />
      <div className="pointer-events-none absolute inset-0 z-[2] hero-vignette" aria-hidden="true" />

      {/* -- CONTENT -- */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8" style={{ minHeight: '85vh' }}>

        {/* === TOP: HEADLINE + CTA === */}
        <div className="w-full max-w-4xl text-center mb-10 lg:mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={vis ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="eyebrow mb-4">
            {t('heroEyebrow')}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={vis ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}
            className="hero-headline mx-auto text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t('heroH1')}{' '}
            <span className="hero-aurora-text">{t('heroH1Highlight')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={vis ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg lg:text-xl">
            {t('heroSub')}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={vis ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/register" className="hero-cta-pulse btn-gold inline-flex items-center gap-2.5 no-underline text-base sm:text-lg">
              {t('heroCta1')} <Arrow size={20} strokeWidth={2.5} />
            </Link>
            <a href="#how" className="btn-ghost inline-flex items-center gap-2 no-underline text-base">
              <Sparkles size={16} strokeWidth={2} className="text-gold" /> {t('heroCta2')}
            </a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {[{ icon: <Globe2 size={14} />, label: isRTL ? '+20 دولة' : '20+ Countries' },
              { icon: <Zap size={14} />, label: isRTL ? 'ذكاء اصطناعي رباعي' : '4-Criteria AI' },
              { icon: <ShieldCheck size={14} />, label: isRTL ? 'موثّق بـ QR' : 'QR Verified' },
            ].map((c, i) => (
              <span key={i} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm px-4 py-2 text-xs font-medium text-[var(--text-faint)] sm:text-sm">
                <span className="text-gold/70">{c.icon}</span> {c.label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* === COMMAND DECK === */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={vis ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-5xl"
        >
          {/* Holographic border */}
          <div className="hero-holo-border">
            <div className="hero-deck relative overflow-hidden rounded-2xl lg:rounded-3xl border border-white/[0.06]">

              {/* Scan line */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl lg:rounded-3xl z-30" aria-hidden="true">
                <div className="hero-scan-line" />
              </div>

              {/* Top bar */}
              <div className="relative z-20 flex items-center gap-3 border-b border-white/[0.06] px-5 py-3">
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
                  <span className={`h-2.5 w-2.5 rounded-full transition-colors duration-500 ${status === 'online' || status === 'done' ? 'bg-emerald/60' : status === 'analyzing' ? 'bg-violet-400/60' : status === 'preparing' ? 'bg-amber-400/60' : 'bg-white/[0.08]'}`} />
                </div>
                <div className="flex-1 text-center text-[10px] sm:text-[11px] font-medium tracking-[0.2em] text-[var(--text-faint)] uppercase">
                  {isRTL ? 'مقابلة ذكية — Muqabaleh AI' : 'Muqabaleh — Smart Interview'}
                </div>
                <div className="flex items-center gap-4">
                  {status !== 'idle' && status !== 'done' && (
                    <span className="text-[10px] font-mono text-[var(--text-faint)]">{timestamp}</span>
                  )}
                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold transition-colors duration-500 ${
                    status === 'online' || status === 'done' ? 'border-emerald/30 bg-emerald/10 text-emerald' :
                    status === 'analyzing' ? 'border-violet-400/30 bg-violet-400/10 text-violet-400' :
                    status === 'preparing' ? 'border-amber-400/30 bg-amber-400/10 text-amber-400' :
                    'border-white/[0.06] bg-white/[0.03] text-[var(--text-faint)]'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      status === 'online' || status === 'done' ? 'bg-emerald' :
                      status === 'analyzing' ? 'bg-violet-400' :
                      status === 'preparing' ? 'bg-amber-400' :
                      'bg-white/20'
                    } ${status !== 'done' ? 'animate-pulse' : ''}`} />
                    {status === 'online' ? t('simOnline') :
                     status === 'preparing' ? t('simPreparing') :
                     status === 'analyzing' ? t('simAnalyzing') :
                     status === 'done' ? t('simOnline') :
                     isRTL ? 'في الانتظار' : 'Standby'}
                  </div>
                </div>
              </div>

              {/* Deck body — 3 columns */}
              <div className="relative flex flex-col md:flex-row min-h-[280px] sm:min-h-[320px]">

                {/* -- COLUMN 1: AI CORE -- */}
                <div className="relative w-full md:w-[200px] lg:w-[240px] shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-e border-white/[0.06] py-6 md:py-0">
                  <div className="relative" style={{ width: 180, height: 180 }}>
                    <AiCore status={status} />
                    {/* Status icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <motion.div animate={status === 'analyzing' ? { rotate: 360 } : {}}
                        transition={status === 'analyzing' ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[var(--bg-panel)]/80 backdrop-blur-sm">
                        {status === 'analyzing' ? <Cpu size={18} className="text-violet-400" /> :
                         status === 'online' ? <Radio size={18} className="text-emerald" /> :
                         status === 'done' ? <Activity size={18} className="text-gold" /> :
                         <Cpu size={18} className="text-[var(--text-faint)]" />}
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* -- COLUMN 2: DATA STREAM -- */}
                <div className={`hero-data-stream flex-1 flex flex-col justify-center gap-2.5 p-5 sm:p-6 overflow-hidden relative ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
                  <AnimatePresence mode="wait">
                    {typing && fahdText && (
                      <motion.div key={step} initial={{ opacity: 0, x: isRTL ? -15 : 15 }}
                        animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? 15 : -15 }} transition={{ duration: 0.3 }}
                        className="flex items-start gap-3">
                        <div className={`shrink-0 mt-1 flex h-6 w-6 items-center justify-center rounded-md bg-gold/15 ${isRTL ? 'order-2' : 'order-1'}`}>
                          <Cpu size={12} className="text-gold" />
                        </div>
                        <div className={`flex-1 rounded-xl border border-gold/10 bg-gold/[0.04] px-4 py-3 text-sm leading-relaxed text-white/85 ${isRTL ? 'order-1' : 'order-2'}`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gold/50 block mb-1">AI Interviewer</span>
                          {fahdText}
                          <Cursor show={typing && fahdText.length < (
                            step === 'fahd-greeting' ? t('simStep1').length :
                            step === 'fahd-question' ? t('simStep2').length :
                            t('simStep5').length
                          )} />
                        </div>
                      </motion.div>
                    )}

                    {showUser && ur && (
                      <motion.div initial={{ opacity: 0, x: isRTL ? 15 : -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                        className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="shrink-0 mt-1 flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.08]">
                          <span className="text-[10px] font-bold text-white/50">U</span>
                        </div>
                        <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-white/60">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/25 block mb-1">{isRTL ? 'المستخدم' : 'User'}</span>
                          {ur}
                          <Cursor show={step === 'user-reply' && ur.length < t('simUserReply').length} />
                        </div>
                      </motion.div>
                    )}

                    {showScore && !showCta && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        className="flex items-center gap-3">
                        <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md bg-violet-400/15">
                          <Activity size={12} className="text-violet-400" />
                        </div>
                        <div className="flex-1 rounded-xl border border-violet-400/10 bg-violet-400/[0.04] px-4 py-3">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-violet-400/50 block mb-1">{t('simAnalyzing')}</span>
                          <p className="text-sm leading-relaxed text-white/50">{t('simFeedback')}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* -- COLUMN 3: METRICS -- */}
                <div className="w-full md:w-[200px] lg:w-[220px] shrink-0 border-t md:border-t-0 md:border-s border-white/[0.06] p-5 flex flex-col items-center justify-center gap-4">
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={vis ? { opacity: 1, scale: 1 } : {}} transition={st(0)}>
                    <ScoreRing value={7} max={10} size={90} show={showScore} />
                  </motion.div>
                  {showScore && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
                      className="w-full max-w-[180px]">
                      <CriteriaBars show={showScore} />
                    </motion.div>
                  )}
                  {!showScore && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Q</span>
                        <span className="text-xs font-bold text-gold">{step === 'fahd-greeting' || step === 'fahd-question' ? '1' : step === 'user-reply' || step === 'analyzing-score' ? '1' : step === 'fahd-next' ? '2' : '0'}/5</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                        <span className="text-[10px] font-bold text-[var(--text-faint)]">⏱</span>
                        <span className="text-xs font-bold text-white/50 font-mono">{timestamp}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Overlay */}
              <AnimatePresence>
                {showCta && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl lg:rounded-3xl px-6"
                    style={{ background: 'rgba(7,10,15,0.92)', backdropFilter: 'blur(8px)' }}>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white text-center">
                      <span className="hero-aurora-text">{t('simCtaHeadline')}</span>
                    </h3>
                    <Link href="/auth/register" className="hero-cta-pulse btn-gold mt-2 no-underline text-base sm:text-lg">{t('simCtaButton')}</Link>
                    <p className="text-sm text-white/40">{t('simCtaSub')}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Floating HUD badges */}
          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={vis ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.6, delay: 1.2 }}
            className={`hero-float-badge hero-float-badge-1 absolute -top-4 ${isRTL ? '-start-2 sm:-start-8' : '-end-2 sm:-end-8'}`}>
            <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-[var(--bg-panel)]/95 backdrop-blur-md px-3 py-2 shadow-2xl">
              <ScoreRing value={7} max={10} size={36} show={true} />
              <span className="text-[11px] font-bold text-gold/90">7/10</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={vis ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.6, delay: 1.4 }}
            className={`hero-float-badge hero-float-badge-2 absolute -bottom-3 ${isRTL ? '-end-3 sm:-end-8' : '-start-3 sm:-start-8'}`}>
            <div className="flex items-center gap-2 rounded-xl border border-emerald/20 bg-[var(--bg-panel)]/95 backdrop-blur-md px-3 py-2 shadow-2xl">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald/20">
                <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
              </span>
              <span className="text-[11px] font-bold text-emerald/90">{t('simOnline')}</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={vis ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.6, delay: 1.6 }}
            className={`hero-float-badge hero-float-badge-3 absolute top-1/2 -translate-y-1/2 ${isRTL ? '-start-5 sm:-start-12' : '-end-5 sm:-end-12'}`}>
            <div className="flex flex-col items-center gap-0.5 rounded-xl border border-violet-400/15 bg-[var(--bg-panel)]/95 backdrop-blur-md px-3 py-2 shadow-2xl">
              <span className="text-[9px] font-bold uppercase tracking-wider text-violet-400/70">NEURAL</span>
              <span className="text-[11px] font-extrabold text-white/80">4-Criteria</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
