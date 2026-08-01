'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

interface AudioWaveformProps {
  audioUrl: string | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  color?: string;
  className?: string;
}

/**
 * Animated audio waveform visualizer.
 * When audioUrl is provided and isPlaying is true, shows animated bars.
 * When paused, bars settle to a static state.
 */
export function AudioWaveform({
  audioUrl,
  isPlaying,
  onPlayPause,
  color = 'var(--color-gold, #D4A843)',
  className = '',
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const barsRef = useRef<number[]>([]);
  const targetBarsRef = useRef<number[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const BAR_COUNT = 40;

  // Initialize bars
  useEffect(() => {
    barsRef.current = Array.from({ length: BAR_COUNT }, () => 0.1);
    targetBarsRef.current = Array.from({ length: BAR_COUNT }, () => 0.1);
  }, []);

  // Audio element
  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('ended', () => setCurrentTime(0));
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [audioUrl]);

  // Play/pause control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, audioUrl]);

  // Canvas animation
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
    const barW = Math.max(2, (W / BAR_COUNT) * 0.6);
    const gap = W / BAR_COUNT;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Update target bars
      for (let i = 0; i < BAR_COUNT; i++) {
        if (isPlaying) {
          // Generate smooth random targets
          if (Math.random() < 0.15) {
            const center = BAR_COUNT / 2;
            const dist = Math.abs(i - center) / center;
            const maxH = (1 - dist * 0.5) * H * 0.85;
            targetBarsRef.current[i] = Math.max(H * 0.1, Math.random() * maxH);
          }
        } else {
          targetBarsRef.current[i] = H * 0.08;
        }
        // Smooth interpolation
        barsRef.current[i] += (targetBarsRef.current[i] - barsRef.current[i]) * 0.12;
      }

      // Draw bars
      for (let i = 0; i < BAR_COUNT; i++) {
        const x = i * gap + (gap - barW) / 2;
        const barH = barsRef.current[i];
        const y = (H - barH) / 2;

        // Progress overlay: played portion is full opacity, rest is dimmer
        const progress = duration > 0 ? currentTime / duration : 0;
        const barProgress = i / BAR_COUNT;
        const alpha = barProgress <= progress ? 1 : 0.3;

        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, barW / 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, color, currentTime, duration]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onPlayPause}
        disabled={!audioUrl}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[var(--text-muted)] transition-colors hover:bg-white/10 hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <canvas
        ref={canvasRef}
        className="h-8 w-full min-w-[120px]"
      />
      {duration > 0 && (
        <span className="shrink-0 font-mono text-[10px] text-[var(--text-faint)]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      )}
    </div>
  );
}
