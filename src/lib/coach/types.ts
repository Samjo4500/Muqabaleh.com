export type LabeledOption = { id: string; en: string; ar: string };

export type CoachGender = 'female' | 'male' | 'none';

export type AccessTierLabel = 'Free' | 'Pro' | 'Premium';

export type PrepSelections = {
  role: string;
  industry: string;
  seniority: string;
  language: 'ar' | 'en' | 'mixed';
  coachGender: CoachGender;
  companyName?: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type CompetencyScore = {
  name: string;
  score: number;
};

export type CoachScoreResult = {
  overallScore: number;
  grade: 'A' | 'B+' | 'B' | 'C' | 'D';
  competencyBreakdown: CompetencyScore[];
  strengths: [string, string, string] | string[];
  improvements: [string, string, string] | string[];
  recommendedNextSteps: string;
};

export type AccessGate = {
  maxInterviews: number | null;
  period: 'lifetime' | 'month' | 'unlimited';
  passportPdf: boolean;
  emailPassport: boolean;
  videoPlayback: boolean;
  linkedinBadge: boolean;
};

export type InterviewConfig = {
  version: number;
  site: string;
  brand: {
    name: string;
    nameAr: string;
    passportTitle: string;
    verifyBaseUrl: string;
    emailFrom: string;
    passportEmailSubject: string;
  };
  roles: LabeledOption[];
  industries: LabeledOption[];
  seniority: LabeledOption[];
  languages: LabeledOption[];
  coaches: {
    female: CoachProfile;
    male: CoachProfile;
    defaultPreference: 'female' | 'male';
  };
  heygen: { enabled: boolean; iframeBaseUrl: string };
  engine: {
    geminiModel: string;
    minQuestions: number;
    maxQuestions: number;
    whisperModel: string;
  };
  competencies: string[];
  accessGates: Record<AccessTierLabel, AccessGate>;
  tierMap: Record<string, AccessTierLabel>;
  storageKey: string;
};

export type CoachProfile = {
  id: string;
  name: string;
  nameAr: string;
  image: string;
  tts: { ar: string; en: string };
  heygenAvatarId: string;
};
