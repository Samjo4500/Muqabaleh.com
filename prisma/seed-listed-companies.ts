/**
 * Seed ListedCompany rows for the MENA ATS aggregator.
 * Only include boards verified live against public ATS APIs (HTTP 200).
 * Wrong slugs are inactive-on-404 by the fetcher — keep this list honest.
 *
 * Run: npx tsx prisma/seed-listed-companies.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type SeedCompany = {
  name: string;
  slug: string;
  ats: "GREENHOUSE" | "LEVER";
  country: string;
  industry?: string;
};

/** Verified 200 against boards-api.greenhouse.io / api.lever.co (Aug 2026). */
const COMPANIES: SeedCompany[] = [
  { name: "Careem", slug: "careem", ats: "GREENHOUSE", country: "UAE", industry: "Mobility" },
  { name: "Tamara", slug: "tamara", ats: "GREENHOUSE", country: "UAE/KSA", industry: "Fintech" },
  { name: "Jumia", slug: "jumia", ats: "GREENHOUSE", country: "Egypt/Nigeria", industry: "E-commerce" },
  { name: "Aldar Properties", slug: "aldar", ats: "LEVER", country: "UAE", industry: "Real Estate" },
  { name: "Fresha", slug: "fresha", ats: "LEVER", country: "UK/UAE", industry: "SaaS" },
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
  console.log(`Seeded ${upserted} verified ListedCompany rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
