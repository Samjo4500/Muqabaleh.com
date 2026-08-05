type JobRow = {
  id: string;
  title: string;
  titleAr: string | null;
  industry: string;
  type: string;
  description: string | null;
  descriptionAr: string | null;
  requirements: string | null;
  benefits: string | null;
  location: string | null;
  city: string | null;
  country?: string | null;
  department: string | null;
  employmentType: string;
  salaryRange: string | null;
  tags: string | null;
  isPublic: boolean;
  isFeatured: boolean;
  status: string;
  createdAt: Date;
  company?: { id: string; name: string; industry?: string; country?: string } | null;
  _count?: { applications?: number };
};

export function serializePublicJob(job: JobRow) {
  const tags = job.tags
    ? job.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  return {
    id: job.id,
    title: job.title,
    titleAr: job.titleAr,
    industry: job.industry,
    type: job.type,
    description: job.description,
    descriptionAr: job.descriptionAr,
    requirements: job.requirements,
    benefits: job.benefits,
    location: job.location,
    city: job.city,
    country: job.country || null,
    department: job.department,
    employmentType: job.employmentType,
    salaryRange: job.salaryRange,
    tags,
    isFeatured: job.isFeatured,
    status: job.status,
    createdAt: job.createdAt.toISOString(),
    company: job.company
      ? {
          id: job.company.id,
          name: job.company.name,
          industry: job.company.industry,
          country: job.company.country,
        }
      : null,
    applicationsCount: job._count?.applications ?? 0,
  };
}

export function serializeTalent(row: {
  id: string;
  role: string;
  level: string;
  industry: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  skills: string | null;
  yearsExperience: number | null;
  phone: string | null;
  linkedInUrl: string | null;
  desiredRole: string | null;
  desiredLocations: string | null;
  cvAssetId: string | null;
  cvFileName: string | null;
  photoAssetId: string | null;
  muqabalehScore: number | null;
  averageScore: number | null;
  interviewCount: number;
  languages: string;
  availability: string;
  openToWork: boolean;
  isVisible: boolean;
  isOptedIn: boolean;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    country: string | null;
    image: string | null;
  };
}) {
  return {
    id: row.id,
    userId: row.user.id,
    name: row.user.name,
    email: row.user.email,
    country: row.user.country,
    role: row.role,
    level: row.level,
    industry: row.industry,
    location: row.location,
    headline: row.headline,
    summary: row.summary,
    skills: row.skills
      ? row.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    yearsExperience: row.yearsExperience,
    phone: row.phone,
    linkedInUrl: row.linkedInUrl,
    desiredRole: row.desiredRole,
    desiredLocations: row.desiredLocations,
    hasCv: Boolean(row.cvAssetId),
    cvFileName: row.cvFileName,
    cvAssetId: row.cvAssetId,
    photoAssetId: row.photoAssetId || null,
    photoUrl: row.photoAssetId
      ? `/api/media/${row.photoAssetId}`
      : row.user.image,
    muqabalehScore: row.muqabalehScore,
    averageScore: row.averageScore,
    interviewCount: row.interviewCount,
    languages: row.languages,
    availability: row.availability,
    openToWork: row.openToWork,
    isVisible: row.isVisible,
    isOptedIn: row.isOptedIn,
    updatedAt: row.updatedAt.toISOString(),
  };
}
