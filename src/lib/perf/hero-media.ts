/** Cap next/image srcset so full-bleed heroes do not request 1920w on phones. */
export const HERO_FULL_BLEED_SIZES =
  '(max-width: 640px) 640px, (max-width: 828px) 828px, (max-width: 1080px) 1080px, 1400px';

/** LCP hero — slightly lower than default 75, still sharp on retina. */
export const HERO_LCP_QUALITY = 62;

/** Below-fold cinematic frames. */
export const HERO_LAZY_QUALITY = 58;
