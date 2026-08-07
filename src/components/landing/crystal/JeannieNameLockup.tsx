'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Size = 'md' | 'lg' | 'xl';

const SIZE: Record<
  Size,
  { en: string; ar: string; avatar: number; gap: string }
> = {
  md: {
    en: 'text-3xl md:text-4xl',
    ar: 'text-3xl md:text-4xl',
    avatar: 44,
    gap: 'gap-2.5 md:gap-3',
  },
  lg: {
    en: 'text-4xl md:text-5xl',
    ar: 'text-4xl md:text-5xl',
    avatar: 56,
    gap: 'gap-3 md:gap-3.5',
  },
  xl: {
    en: 'text-4xl md:text-6xl',
    ar: 'text-[2.35rem] md:text-6xl',
    avatar: 64,
    gap: 'gap-3 md:gap-4',
  },
};

/**
 * Bilingual Jeannie brand mark: Jeannie · avatar · جيني
 * Always LTR so English and Arabic stay separated by the avatar.
 */
export function JeannieNameLockup({
  size = 'xl',
  className,
  avatarSrc = '/images/hero-interview.webp',
}: {
  size?: Size;
  className?: string;
  avatarSrc?: string;
}) {
  const reduceMotion = useReducedMotion();
  const s = SIZE[size];

  return (
    <motion.div
      className={cn(
        'inline-flex max-w-full flex-wrap items-center',
        s.gap,
        className,
      )}
      dir="ltr"
      lang="en"
      aria-label="Jeannie جيني"
      animate={reduceMotion ? undefined : { opacity: [0.9, 1, 0.9] }}
      transition={{ duration: 3.4, repeat: Infinity }}
    >
      <span
        className={cn(
          'mq-display font-bold tracking-tight text-white',
          s.en,
        )}
      >
        Jeannie
      </span>

      <span
        className="relative inline-flex shrink-0 overflow-hidden rounded-full border border-teal-300/45 bg-teal-400/10 shadow-[0_0_24px_rgba(45,212,191,0.28)]"
        style={{ width: s.avatar, height: s.avatar }}
        aria-hidden
      >
        <Image
          src={avatarSrc}
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: 'center 18%' }}
          sizes={`${s.avatar}px`}
          priority={size === 'xl'}
        />
        <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/25" />
      </span>

      <span
        className={cn(
          'mq-jeannie-ar font-extrabold tracking-tight text-teal-100',
          s.ar,
        )}
        dir="rtl"
        lang="ar"
      >
        جيني
      </span>
    </motion.div>
  );
}
