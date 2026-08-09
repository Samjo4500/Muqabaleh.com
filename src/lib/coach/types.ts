export type LabeledOption = { id: string; en: string; ar: string };

export type LocalizedText = { en: string; ar: string };

export type RoleOption = LabeledOption & {
  category: string;
  industries: string[];
  questionFocus?: LocalizedText;
  rubric?: LocalizedText;
};

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
    passportTitleAr?: string;
    verifyBaseUrl: string;
    emailFrom: string;
    passportEmailSubject: string;
  };
  roleCategories: LabeledOption[];
  roles: RoleOption[];
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
    speechProvider?: string;
    speechEncoding?: string;
    speechSampleRateHertz?: number;
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
