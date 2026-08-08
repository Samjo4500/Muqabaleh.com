import { readFileSync } from 'fs';
import { join } from 'path';
import type { InterviewConfig } from './types';

let cached: InterviewConfig | null = null;

/** Load /config/interview-config.json — safe fallback if file missing. */
export function getInterviewConfig(): InterviewConfig {
  if (cached) return cached;
  try {
    const path = join(process.cwd(), 'config', 'interview-config.json');
    const raw = readFileSync(path, 'utf8');
    cached = JSON.parse(raw) as InterviewConfig;
    return cached;
  } catch (err) {
    console.error('[coach/config] failed to load interview-config.json', err);
    cached = FALLBACK_CONFIG;
    return cached;
  }
}

/** Client-safe subset (no secrets). */
export function getPublicInterviewConfig() {
  const c = getInterviewConfig();
  return {
    roles: c.roles,
    industries: c.industries,
    seniority: c.seniority,
    languages: c.languages,
    coaches: c.coaches,
    heygen: c.heygen,
    engine: {
      minQuestions: c.engine.minQuestions,
      maxQuestions: c.engine.maxQuestions,
    },
    storageKey: c.storageKey,
    brand: {
      name: c.brand.name,
      nameAr: c.brand.nameAr,
      passportTitle: c.brand.passportTitle,
    },
  };
}

const FALLBACK_CONFIG: InterviewConfig = {
  version: 1,
  site: 'muqabaleh.com',
  brand: {
    name: 'Muqabaleh',
    nameAr: 'مقابلة',
    passportTitle: 'Muqabaleh Interview Passport',
    verifyBaseUrl: 'https://muqabaleh.com/verify',
    emailFrom: 'Muqabaleh <noreply@muqabaleh.com>',
    passportEmailSubject: 'Your Interview Passport is Ready — Muqabaleh',
  },
  roles: [{ id: 'other', en: 'Other', ar: 'أخرى' }],
  industries: [{ id: 'other', en: 'Other', ar: 'أخرى' }],
  seniority: [{ id: 'mid', en: 'Mid-level', ar: 'متوسط' }],
  languages: [
    { id: 'ar', en: 'Arabic', ar: 'العربية' },
    { id: 'en', en: 'English', ar: 'الإنجليزية' },
    { id: 'mixed', en: 'Mixed', ar: 'مختلط' },
  ],
  coaches: {
    female: {
      id: 'female',
      name: 'Jeannie',
      nameAr: 'جيني',
      image: '/images/hero-interview.webp',
      tts: { ar: 'ar-XA-Wavenet-B', en: 'en-US-Wavenet-F' },
      heygenAvatarId: '',
    },
    male: {
      id: 'male',
      name: 'Jean',
      nameAr: 'جين',
      image: '/images/fahd.webp',
      tts: { ar: 'ar-XA-Wavenet-A', en: 'en-US-Wavenet-D' },
      heygenAvatarId: '',
    },
    defaultPreference: 'female',
  },
  heygen: { enabled: false, iframeBaseUrl: '' },
  engine: {
    geminiModel: 'gemini-1.5-pro',
    minQuestions: 5,
    maxQuestions: 7,
    speechProvider: 'google-cloud-stt',
    speechEncoding: 'WEBM_OPUS',
    speechSampleRateHertz: 48000,
  },
  competencies: [
    'Communication',
    'Technical Depth',
    'Problem Solving',
    'Cultural Fit',
    'Confidence',
  ],
  accessGates: {
    Free: {
      maxInterviews: 1,
      period: 'lifetime',
      passportPdf: false,
      emailPassport: false,
      videoPlayback: false,
      linkedinBadge: false,
    },
    Pro: {
      maxInterviews: 3,
      period: 'month',
      passportPdf: true,
      emailPassport: true,
      videoPlayback: false,
      linkedinBadge: false,
    },
    Premium: {
      maxInterviews: null,
      period: 'unlimited',
      passportPdf: true,
      emailPassport: true,
      videoPlayback: true,
      linkedinBadge: true,
    },
  },
  tierMap: {
    FREE: 'Free',
    BASIC: 'Pro',
    PRO: 'Pro',
    PREMIUM: 'Premium',
    JEANNIE: 'Premium',
    JEANNIE_PRO: 'Premium',
    UNLIMITED: 'Premium',
    MASTERY_PACK: 'Premium',
  },
  storageKey: 'mq_coach_prep',
};
