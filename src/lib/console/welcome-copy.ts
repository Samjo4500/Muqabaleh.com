/** Visual theme only — copy lives in i18n (`console.welcomeOs`). */
export type WelcomeThemeVisual = {
  i18nKey: 'najmTech' | 'atlasAgency' | 'bayanUniversity' | 'fallback';
  accent: string;
  border: string;
  glow: string;
  ring: string;
};

const THEMES: Record<string, WelcomeThemeVisual> = {
  'najm-tech': {
    i18nKey: 'najmTech',
    accent: 'text-cyan-400',
    border: 'border-cyan-500/25',
    glow: 'rgba(34, 211, 238, 0.14)',
    ring: '#22d3ee',
  },
  'atlas-agency': {
    i18nKey: 'atlasAgency',
    accent: 'text-sky-400',
    border: 'border-sky-500/25',
    glow: 'rgba(56, 189, 248, 0.14)',
    ring: '#38bdf8',
  },
  'bayan-university': {
    i18nKey: 'bayanUniversity',
    accent: 'text-[#d3ac65]',
    border: 'border-[#d3ac65]/25',
    glow: 'rgba(211, 172, 101, 0.14)',
    ring: '#d3ac65',
  },
};

const FALLBACK: WelcomeThemeVisual = {
  i18nKey: 'fallback',
  accent: 'text-[#d3ac65]',
  border: 'border-[#d3ac65]/25',
  glow: 'rgba(211, 172, 101, 0.14)',
  ring: '#d3ac65',
};

export function getWelcomeThemeVisual(tenantSlug: string): WelcomeThemeVisual {
  return THEMES[tenantSlug] || FALLBACK;
}
