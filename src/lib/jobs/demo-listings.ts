/**
 * Curated demo listings for UI when the DB has no active ListedJob rows yet.
 * Not scraped. Source = EMPLOYER_POSTED style samples for design/preview.
 */

export type DemoCompany = {
  name: string;
  slug: string;
  country: string;
  industry: string;
  logoUrl: string | null;
};

export type DemoJob = {
  id: string;
  title: string;
  slug: string;
  location: string;
  department: string;
  employmentType: string;
  description: string;
  requirements: string;
  applyUrl: string;
  source: 'EMPLOYER_POSTED';
  company: DemoCompany;
};

const companies: Record<string, DemoCompany> = {
  careem: {
    name: 'Careem',
    slug: 'careem',
    country: 'UAE',
    industry: 'Mobility / Super app',
    logoUrl: null,
  },
  tabby: {
    name: 'Tabby',
    slug: 'tabby',
    country: 'UAE',
    industry: 'Fintech',
    logoUrl: null,
  },
  foodics: {
    name: 'Foodics',
    slug: 'foodics',
    country: 'KSA',
    industry: 'Restaurant tech',
    logoUrl: null,
  },
  jahez: {
    name: 'Jahez',
    slug: 'jahez',
    country: 'KSA',
    industry: 'Food delivery',
    logoUrl: null,
  },
  vezeeta: {
    name: 'Vezeeta',
    slug: 'vezeeta',
    country: 'Egypt',
    industry: 'Healthtech',
    logoUrl: null,
  },
  instabug: {
    name: 'Instabug',
    slug: 'instabug',
    country: 'Egypt',
    industry: 'Developer tools',
    logoUrl: null,
  },
};

function clip(s: string) {
  return s.length > 300 ? `${s.slice(0, 297)}…` : s;
}

export const DEMO_JOBS: DemoJob[] = [
  {
    id: 'demo-careem-pm',
    title: 'Product Manager',
    slug: 'product-manager',
    location: 'Dubai, UAE',
    department: 'Product',
    employmentType: 'Full-time',
    description: clip(
      'Own roadmap for a core rider experience. Partner with design, engineering, and ops across MENA markets. Strong bilingual communication preferred.',
    ),
    requirements: '5+ years product · marketplace or mobility · Arabic/English',
    applyUrl: 'https://boards.greenhouse.io/careem',
    source: 'EMPLOYER_POSTED',
    company: companies.careem,
  },
  {
    id: 'demo-tabby-fe',
    title: 'Senior Frontend Engineer',
    slug: 'senior-frontend-engineer',
    location: 'Remote · MENA',
    department: 'Engineering',
    employmentType: 'Full-time',
    description: clip(
      'Build high-performance checkout and account experiences in React. Collaborate with product and design on BNPL journeys used across the region.',
    ),
    requirements: 'React/TypeScript · performance · fintech a plus',
    applyUrl: 'https://boards.greenhouse.io/tabby',
    source: 'EMPLOYER_POSTED',
    company: companies.tabby,
  },
  {
    id: 'demo-foodics-cs',
    title: 'Customer Success Lead',
    slug: 'customer-success-lead',
    location: 'Riyadh, KSA',
    department: 'Customer Success',
    employmentType: 'Full-time',
    description: clip(
      'Lead CS for enterprise restaurant groups. Drive adoption, retention, and executive relationships. Arabic fluency required.',
    ),
    requirements: 'B2B SaaS CS · Arabic native · team leadership',
    applyUrl: 'https://jobs.lever.co/foodics',
    source: 'EMPLOYER_POSTED',
    company: companies.foodics,
  },
  {
    id: 'demo-jahez-ops',
    title: 'Operations Manager',
    slug: 'operations-manager',
    location: 'Jeddah, KSA',
    department: 'Operations',
    employmentType: 'Full-time',
    description: clip(
      'Scale city operations for delivery quality and partner performance. Data-driven, calm under pressure, strong stakeholder communication.',
    ),
    requirements: 'Ops leadership · logistics · Arabic/English',
    applyUrl: 'https://jobs.lever.co/jahez',
    source: 'EMPLOYER_POSTED',
    company: companies.jahez,
  },
  {
    id: 'demo-vezeeta-growth',
    title: 'Growth Marketing Manager',
    slug: 'growth-marketing-manager',
    location: 'Cairo, Egypt',
    department: 'Marketing',
    employmentType: 'Full-time',
    description: clip(
      'Own acquisition experiments across paid and organic. Partner with product on funnels that help patients find care faster.',
    ),
    requirements: 'Performance marketing · analytics · Arabic/English',
    applyUrl: 'https://boards.greenhouse.io/vezeeta',
    source: 'EMPLOYER_POSTED',
    company: companies.vezeeta,
  },
  {
    id: 'demo-instabug-se',
    title: 'Solutions Engineer',
    slug: 'solutions-engineer',
    location: 'Cairo / Remote',
    department: 'Sales Engineering',
    employmentType: 'Full-time',
    description: clip(
      'Help mobile teams evaluate Instabug. Run demos, technical proofs, and bilingual conversations with engineering buyers.',
    ),
    requirements: 'Mobile/SDK familiarity · demos · clear English',
    applyUrl: 'https://boards.greenhouse.io/instabug',
    source: 'EMPLOYER_POSTED',
    company: companies.instabug,
  },
];

export function getDemoJob(companySlug: string, jobSlug: string) {
  return DEMO_JOBS.find((j) => j.company.slug === companySlug && j.slug === jobSlug) ?? null;
}

export function getDemoCompanyJobs(companySlug: string) {
  return DEMO_JOBS.filter((j) => j.company.slug === companySlug);
}

export function getDemoCompany(companySlug: string) {
  return companies[companySlug] ?? getDemoCompanyJobs(companySlug)[0]?.company ?? null;
}
