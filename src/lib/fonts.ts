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
  weight: ['700'],
  display: 'swap',
  variable: '--font-display-en',
  preload: false,
});

/** Body — English UI */
export const fontBodyEn = Manrope({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-body-en',
  preload: false,
});

/** Body — Arabic UI. Arabic-only subset: latin+arabic was 8 woff2 preloads. */
export const fontBodyAr = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-body-ar',
  preload: true,
});

/** Display — Arabic headlines */
export const fontDisplayAr = Readex_Pro({
  subsets: ['arabic'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-display-ar',
  preload: false,
});

/** Jeannie Arabic name mark */
export const fontJeannieAr = Cairo({
  subsets: ['arabic'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-jeannie-ar',
  preload: false,
});

export const fontVariablesAr = [
  fontBodyAr.variable,
  fontDisplayAr.variable,
  fontJeannieAr.variable,
].join(' ');

export const fontVariablesEn = [fontDisplayEn.variable, fontBodyEn.variable].join(' ');

export function fontVariablesFor(locale: string) {
  return locale === 'en' ? fontVariablesEn : fontVariablesAr;
}

/** @deprecated use fontVariablesFor(locale) so unused families are not applied */
export const fontVariables = [fontVariablesEn, fontVariablesAr].join(' ');
