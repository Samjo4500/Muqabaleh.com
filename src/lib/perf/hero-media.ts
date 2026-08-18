/** Static LCP sources — already compressed webp, skip the image optimizer round-trip. */
export const HERO_LCP_MOBILE = '/images/hero-interview-768.webp';
export const HERO_LCP_TABLET = '/images/hero-interview-1280.webp';
export const HERO_LCP_DESKTOP = '/images/hero-interview.webp';

/** Cap next/image srcset on non-LCP full-bleed frames (jobs / Jeannie). */
export const HERO_FULL_BLEED_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1080px) 100vw, 1080px';

export const HERO_LCP_QUALITY = 62;
export const HERO_LAZY_QUALITY = 58;
