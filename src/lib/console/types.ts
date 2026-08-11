export type TenantType = 'EMPLOYER' | 'AGENCY' | 'ACADEMY';
export type OrgPlan = 'STARTER' | 'PRO' | 'ENTERPRISE';
export type OrgMemberRole =
  | 'OWNER'
  | 'ADMIN'
  | 'HIRING_MANAGER'
  | 'REVIEWER'
  | 'INTERVIEWER';

export type WhiteLabelConfig = {
  logoUrl?: string | null;
  primaryColor?: string | null;
  font?: 'Inter' | 'Cairo' | 'Tajawal' | 'IBM Plex Sans Arabic' | string | null;
  customDomain?: string | null;
  fromEmail?: string | null;
  faviconUrl?: string | null;
};

export type InterviewQuestion = {
  id: string;
  text: string;
  textAr?: string;
};

export type JobBranding = {
  logoUrl?: string | null;
  welcomeMsg?: string | null;
  welcomeMsgAr?: string | null;
  outroMsg?: string | null;
  outroMsgAr?: string | null;
};

export type AgencyClient = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  industry: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  contactEmail: string | null;
  interviewsVolume: number;
  revenueUsd: number;
  commissionBps: number;
  candidateCount: number;
  status: 'ACTIVE' | 'PAUSED';
};

export type AcademyStudent = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  major: string;
  year: string;
  score: number | null;
  shareWithCareerCenter: boolean;
  status: 'INVITED' | 'STARTED' | 'COMPLETED';
};

export type AcademyCohort = {
  id: string;
  organizationId: string;
  name: string;
  major: string;
  year: string;
  deadline: string | null;
  facultyEmail: string | null;
  students: AcademyStudent[];
};

export type ConsoleApiKey = {
  id: string;
  organizationId: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
};

export type ConsoleWebhook = {
  id: string;
  organizationId: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
};

export type ConsoleOrganization = {
  id: string;
  slug: string;
  name: string;
  tenantType: TenantType;
  plan: OrgPlan;
  industry: string | null;
  size: string | null;
  country: string | null;
  companyId: string | null;
  whiteLabel: WhiteLabelConfig | null;
  status: string;
};

export type ConsoleMember = {
  id: string;
  organizationId: string;
  userId: string | null;
  role: OrgMemberRole;
  invitedEmail: string | null;
  invitedName: string | null;
  status: string;
  name?: string | null;
  email?: string | null;
  lastActiveAt?: string | null;
};

export type ConsoleJobPosting = {
  id: string;
  organizationId: string;
  title: string;
  titleAr: string | null;
  roleKey: string | null;
  difficulty: string;
  language: string;
  questions: InterviewQuestion[];
  branding: JobBranding | null;
  interviewSlug: string;
  expiresAt: string | null;
  maxAttempts: number;
  status: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED';
  createdAt: string;
  applicantCount?: number;
};

export type ConsolePipelineStage = {
  id: string;
  organizationId: string;
  key: string;
  labelEn: string;
  labelAr: string;
  sortOrder: number;
  isTerminal: boolean;
  color: string | null;
};

export type PassportGrade = 'A' | 'B+' | 'B' | 'C' | 'D';

export type ConsolePassport = {
  id: string;
  organizationId: string;
  candidateName: string;
  candidateEmail: string;
  avatarUrl: string | null;
  role: string;
  roleAr?: string | null;
  score: number;
  grade: PassportGrade;
  stageKey: string;
  jobId: string | null;
  jobTitle: string | null;
  submittedAt: string;
  /** Academy privacy shield */
  private?: boolean;
  competencies: {
    axis: string;
    axisAr: string;
    score: number;
    benchmark: number;
  }[];
  transcript: { q: string; qAr?: string; a: string; aAr?: string }[];
  insights: {
    summary: string;
    summaryAr: string;
    greenFlags: string[];
    greenFlagsAr: string[];
    redFlags: string[];
    redFlagsAr: string[];
  };
  notes: { id: string; author: string; body: string; at: string; mention?: string }[];
  tags: string[];
  verifyUrl: string;
};

export type ConsoleDashboard = {
  kpis: {
    passportsReceived: number;
    avgScore: number;
    interviewsCompleted: number;
    timeSavedHours: number;
  };
  feed: ConsolePassport[];
  pipelineCounts: Record<string, number>;
};

export type TenantBundle = {
  org: ConsoleOrganization;
  members: ConsoleMember[];
  stages: ConsolePipelineStage[];
  jobs: ConsoleJobPosting[];
  passports: ConsolePassport[];
  clients: AgencyClient[];
  cohorts: AcademyCohort[];
  apiKeys: ConsoleApiKey[];
  webhooks: ConsoleWebhook[];
};
