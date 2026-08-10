/**
 * Seed ListedCompany rows for the MENA ATS aggregator.
 * Catalog lives in src/lib/jobs/listed-company-catalog.ts (shared with fetch sync).
 *
 * Run: npx tsx prisma/seed-listed-companies.ts
 * Or: npm run db:seed:listed-companies
 */
import { PrismaClient } from '@prisma/client';
import { LISTED_COMPANY_CATALOG } from '../src/lib/jobs/listed-company-catalog';

const db = new PrismaClient();

async function main() {
  let upserted = 0;
  for (const c of LISTED_COMPANY_CATALOG) {
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
