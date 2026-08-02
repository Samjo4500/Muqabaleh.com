'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TtsWaveBarsProps {
  isActive: boolean;
  barCount?: number;
  className?: string;
}

/**
 * Lightweight CSS-only animated wave bars that show when TTS is speaking.
 * No canvas, no audio context — just pure visual feedback.
 */
export function TtsWaveBars({ isActive, barCount = 5, className }: TtsWaveBarsProps) {
  return (
    <div className={cn('flex items-center gap-[3px]', className)} aria-hidden="true">
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'block w-[3px] rounded-full bg-gold transition-all duration-300',
            isActive
              ? 'animate-tts-bar'
              : 'h-[6px]'
          )}
          style={
            isActive
              ? {
                  animationDelay: `${i * 0.08}s`,
                  animationDuration: `${0.6 + i * 0.1}s`,
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}

/**
 * Canvas-based audio waveform that reacts to real audio playback.
 * Shows animated bars synced with the Audio element.
 */
interface AudioReactBarsProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

export function AudioReactBars({
  audioElement,
  isPlaying,
  barCount = 24,
  className,
}: AudioReactBarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const barsRef = useRef<number[]>([]);
  const targetRef = useRef<number[]>([]);

  useEffect(() => {
    barsRef.current = Array.from({ length: barCount }, () => 0.15);
    targetRef.current = Array.from({ length: barCount }, () => 0.15);
  }, [barCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
        if (isPlaying) {
          if (Math.random() < 0.12) {
            const center = barCount / 2;
            const dist = Math.abs(i - center) / center;
            const maxH = (1 - dist * 0.4) * H * 0.9;
            targetRef.current[i] = Math.max(H * 0.12, Math.random() * maxH);
          }
        } else {
          targetRef.current[i] = H * 0.1;
        }
        barsRef.current[i] +=
          (targetRef.current[i] - barsRef.current[i]) * 0.14;

        const x = i * gap + (gap - barW) / 2;
        const barH = barsRef.current[i];
        const y = (H - barH) / 2;

        ctx.fillStyle = '#D4A843';
        ctx.globalAlpha = isPlaying ? 1 : 0.25;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, barW / 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, barCount]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('h-8 w-full min-w-[100px]', className)}
    />
  );
}
