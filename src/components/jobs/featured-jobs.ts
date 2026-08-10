export type FeaturedJob = {
  id: string;
  company: string;
  titleEn: string;
  titleAr: string;
  locationEn: string;
  locationAr: string;
  /** Ultra HQ 1600×1600 poster faces */
  faceAr: string;
  faceEn: string;
};

/** Six FB-style Job of the Day posts — Arabic front / English back. */
export const FEATURED_JOBS: FeaturedJob[] = [
  {
    id: '01-careem-dubai',
    company: 'Careem',
    titleEn: 'Staff Software Engineer',
    titleAr: 'مهندس برمجيات أول',
    locationEn: 'Dubai, UAE',
    locationAr: 'دبي، الإمارات',
    faceAr: '/images/jobs-hero/faces/01-careem-dubai-ar.png',
    faceEn: '/images/jobs-hero/faces/01-careem-dubai-en.png',
  },
  {
    id: '02-mongodb-dubai',
    company: 'MongoDB',
    titleEn: 'Enterprise Account Executive',
    titleAr: 'ممثل حسابات مؤسسي',
    locationEn: 'Dubai, UAE',
    locationAr: 'دبي، الإمارات',
    faceAr: '/images/jobs-hero/faces/02-mongodb-dubai-ar.png',
    faceEn: '/images/jobs-hero/faces/02-mongodb-dubai-en.png',
  },
  {
    id: '03-tamara-riyadh',
    company: 'Tamara',
    titleEn: 'Fraud Investigator',
    titleAr: 'محقق احتيال',
    locationEn: 'Riyadh, KSA',
    locationAr: 'الرياض، السعودية',
    faceAr: '/images/jobs-hero/faces/03-tamara-riyadh-ar.png',
    faceEn: '/images/jobs-hero/faces/03-tamara-riyadh-en.png',
  },
  {
    id: '04-cloudflare-cairo',
    company: 'Cloudflare',
    titleEn: 'Senior Territory AE, Egypt',
    titleAr: 'مدير حسابات أول — مصر',
    locationEn: 'Cairo, Egypt',
    locationAr: 'القاهرة، مصر',
    faceAr: '/images/jobs-hero/faces/04-cloudflare-cairo-ar.png',
    faceEn: '/images/jobs-hero/faces/04-cloudflare-cairo-en.png',
  },
  {
    id: '05-careem-amman',
    company: 'Careem',
    titleEn: 'Operations Coordinator',
    titleAr: 'منسق عمليات',
    locationEn: 'Amman, Jordan',
    locationAr: 'عمّان، الأردن',
    faceAr: '/images/jobs-hero/faces/05-careem-amman-ar.png',
    faceEn: '/images/jobs-hero/faces/05-careem-amman-en.png',
  },
  {
    id: '06-trendyol-riyadh',
    company: 'Trendyol',
    titleEn: 'Marketing Intern',
    titleAr: 'متدرّب تسويق',
    locationEn: 'Riyadh, KSA',
    locationAr: 'الرياض، السعودية',
    faceAr: '/images/jobs-hero/faces/06-trendyol-riyadh-ar.png',
    faceEn: '/images/jobs-hero/faces/06-trendyol-riyadh-en.png',
  },
];
