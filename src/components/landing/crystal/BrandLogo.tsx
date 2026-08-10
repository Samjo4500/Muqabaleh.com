'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Enhanced Muqabaleh wordmark (mic + bilingual) — HQ master for all surfaces. */
const LOGO_FULL = '/images/logos/muqabaleh-wordmark.webp';
const LOGO_NAV = '/images/logos/muqabaleh-wordmark-nav.webp';

export function BrandLogo({
  size = 'md',
  className,
  priority = false,
}: {
  size?: 'sm' | 'nav' | 'md' | 'lg' | 'hero';
  className?: string;
  priority?: boolean;
}) {
  // Unified scale: nav is a bit larger than before; footer/md matches nav family.
  const dims = {
    sm: { w: 160, h: 84, className: 'h-10 w-auto' },
    nav: { w: 300, h: 158, className: 'h-[60px] w-auto md:h-[68px]' },
    md: { w: 300, h: 158, className: 'h-[60px] w-auto' },
    lg: { w: 360, h: 190, className: 'h-[72px] w-auto md:h-20' },
    hero: {
      w: 720,
      h: 380,
      className: 'h-auto w-[17rem] sm:w-[21rem] md:w-[25rem]',
    },
  }[size];

  const src = size === 'hero' || size === 'lg' ? LOGO_FULL : LOGO_NAV;

  return (
    <Image
      src={src}
      alt="Muqabaleh | مقابلة"
      width={dims.w}
      height={dims.h}
      priority={priority}
      sizes={
        size === 'hero'
          ? '(max-width: 640px) 272px, (max-width: 768px) 336px, 400px'
          : '(max-width: 768px) 180px, 240px'
      }
      className={cn('object-contain', dims.className, className)}
    />
  );
}
