export type Bi = { en: string; ar: string };

export type GuideCompany = {
  slug: string;
  name: Bi;
  /** Match ListedCompany / demo when present */
  aliases?: string[];
  country: Bi;
  industry: Bi;
  about: Bi;
  hook: Bi;
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Indicative MENA range label — not invented per-job numbers */
  salaryHint: Bi;
  companyQuestions: Bi[];
  cultureTips: Bi;
  relatedCompanySlugs: string[];
  relatedRoleSlugs: string[];
  publishedAt: string;
};

export type GuideRole = {
  slug: string;
  name: Bi;
  /** Coach config role id for Jeannie deep-link */
  coachRoleId: string;
  about: Bi;
  hook: Bi;
  difficulty: 1 | 2 | 3 | 4 | 5;
  salaryHint: Bi;
  questions: Bi[];
  answerTips: Bi;
  cultureTips: Bi;
  titleMatchers: string[];
  relatedRoleSlugs: string[];
  relatedCompanySlugs: string[];
  publishedAt: string;
};

export type RelatedJobCard = {
  id: string;
  title: string;
  slug: string;
  location: string;
  companyName: string;
  companySlug: string;
};
