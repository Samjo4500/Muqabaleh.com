/**
 * Seed ListedCompany rows for the MENA ATS aggregator.
 * Only include boards verified live against public ATS APIs (HTTP 200).
 * Global boards (stripe/spotify) are MENA-filtered at fetch time.
 *
 * Run: npx tsx prisma/seed-listed-companies.ts
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

type SeedCompany = {
  name: string;
  slug: string;
  ats: 'GREENHOUSE' | 'LEVER' | 'WORKABLE';
  country: string;
  industry?: string;
};

/** Verified live against public ATS APIs (Aug 2026). */
const COMPANIES: SeedCompany[] = [
  { name: 'Careem', slug: 'careem', ats: 'GREENHOUSE', country: 'UAE', industry: 'Mobility' },
  { name: 'Tamara', slug: 'tamara', ats: 'GREENHOUSE', country: 'UAE/KSA', industry: 'Fintech' },
  { name: 'Jumia', slug: 'jumia', ats: 'GREENHOUSE', country: 'Egypt', industry: 'E-commerce' },
  { name: 'Aldar Properties', slug: 'aldar', ats: 'LEVER', country: 'UAE', industry: 'Real Estate' },
  { name: 'Fresha', slug: 'fresha', ats: 'LEVER', country: 'MENA', industry: 'SaaS' },
  { name: 'Foodics', slug: 'foodics', ats: 'WORKABLE', country: 'KSA', industry: 'SaaS' },
  { name: 'Stripe', slug: 'stripe', ats: 'GREENHOUSE', country: 'Global→MENA', industry: 'Fintech' },
  { name: 'Spotify', slug: 'spotify', ats: 'LEVER', country: 'Global→MENA', industry: 'Media' },
];

async function main() {
  let upserted = 0;
  for (const c of COMPANIES) {
    await db.listedCompany.upsert({
      where: { slug: c.slug },
      create: {
        name: c.name,
        slug: c.slug,
        ats: c.ats,
        country: c.country,
        industry: c.industry,
        isActive: true,
      },
      update: {
        name: c.name,
        ats: c.ats,
        country: c.country,
        industry: c.industry,
        isActive: true,
      },
    });
    upserted += 1;
  }
  console.log(`Seeded ${upserted} verified ListedCompany rows (MENA focus).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
