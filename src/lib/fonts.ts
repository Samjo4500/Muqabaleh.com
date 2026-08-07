import {
  Syne,
  Manrope,
  IBM_Plex_Sans_Arabic,
  Readex_Pro,
  Cairo,
} from 'next/font/google';

/** Display — English atelier headlines */
export const fontDisplayEn = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-display-en',
  preload: true,
});

/** Body — English UI */
export const fontBodyEn = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body-en',
  preload: true,
});

/** Body — Arabic UI */
export const fontBodyAr = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body-ar',
  preload: true,
});

/** Display — Arabic headlines */
export const fontDisplayAr = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display-ar',
  preload: true,
});

/** Jeannie Arabic name mark — not on critical path for every route */
export const fontJeannieAr = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['700', '800'],
  display: 'swap',
  variable: '--font-jeannie-ar',
  preload: false,
});

export const fontVariables = [
  fontDisplayEn.variable,
  fontBodyEn.variable,
  fontBodyAr.variable,
  fontDisplayAr.variable,
  fontJeannieAr.variable,
].join(' ');
