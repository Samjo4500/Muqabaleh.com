/**
 * Seed ListedCompany rows for the MENA ATS aggregator (Section 2).
 * Greenhouse + Lever slugs from the builder prompt. Ashby skipped for v1
 * (no headless browser; HTML parse deferred). Workable/Recruitee via one-time discovery later.
 *
 * Run: npx tsx prisma/seed-listed-companies.ts
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

type SeedCompany = {
  name: string;
  slug: string;
  ats: 'GREENHOUSE' | 'LEVER';
  country: string;
  industry?: string;
};

const GREENHOUSE: SeedCompany[] = [
  { name: 'Careem', slug: 'careem', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Tamara', slug: 'tamara', ats: 'GREENHOUSE', country: 'UAE/KSA' },
  { name: 'Tabby', slug: 'tabby', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Noon', slug: 'noon', ats: 'GREENHOUSE', country: 'UAE/KSA' },
  { name: 'Property Finder', slug: 'propertyfinder', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Bayzat', slug: 'bayzat', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Huspy', slug: 'huspy', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'TruKKer', slug: 'trukker', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Telda', slug: 'telda', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'MoneyFellows', slug: 'moneyfellows', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Capiter', slug: 'capiter', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'MaxAB', slug: 'maxab', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Trella', slug: 'trella', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Swvl', slug: 'swvl', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Paymob', slug: 'paymob', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Fatura', slug: 'fatura', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Rology', slug: 'rology', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Yodawy', slug: 'yodawy', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Elmenus', slug: 'elmenus', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Instabug', slug: 'instabug', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Si-Ware', slug: 'siware', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Vezeeta', slug: 'vezeeta', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Breadfast', slug: 'breadfast', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Cartona', slug: 'cartona', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Flextock', slug: 'flextock', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Bosta', slug: 'bosta', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'ShipBlu', slug: 'shipblu', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Rabbit', slug: 'rabbit', ats: 'GREENHOUSE', country: 'Egypt' },
  { name: 'Jumia', slug: 'jumia', ats: 'GREENHOUSE', country: 'Egypt/Nigeria' },
  { name: 'Souqalmal', slug: 'souqalmal', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'YallaCompare', slug: 'yallacompare', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Astra Tech', slug: 'astra-tech', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Pure Health', slug: 'purehealth', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Burjeel Holdings', slug: 'burjeelholdings', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'NMC Healthcare', slug: 'nmc-healthcare', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Al-Futtaim', slug: 'alfuttaim', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Majid Al Futtaim', slug: 'majidalfuttaim', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Chalhoub Group', slug: 'chalhoub', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Al Tayer Group', slug: 'altayer', ats: 'GREENHOUSE', country: 'UAE' },
  { name: 'Landmark Group', slug: 'landmarkgroup', ats: 'GREENHOUSE', country: 'UAE' },
];

const LEVER: SeedCompany[] = [
  { name: 'Aldar Properties', slug: 'aldar', ats: 'LEVER', country: 'UAE' },
  { name: 'Fresha', slug: 'fresha', ats: 'LEVER', country: 'UK/UAE' },
  { name: 'Kitopi', slug: 'kitopi', ats: 'LEVER', country: 'UAE' },
  { name: 'Sary', slug: 'sary', ats: 'LEVER', country: 'KSA' },
  { name: 'Foodics', slug: 'foodics', ats: 'LEVER', country: 'KSA' },
  { name: 'Nana', slug: 'nana', ats: 'LEVER', country: 'KSA' },
  { name: 'Jahez', slug: 'jahez', ats: 'LEVER', country: 'KSA' },
  { name: 'The Chefz', slug: 'thechefz', ats: 'LEVER', country: 'KSA' },
  { name: 'Mrsool', slug: 'mrsool', ats: 'LEVER', country: 'KSA' },
  { name: 'HungerStation', slug: 'hungerstation', ats: 'LEVER', country: 'KSA' },
  { name: 'ToYou', slug: 'toyou', ats: 'LEVER', country: 'KSA' },
  { name: 'Salasa', slug: 'salasa', ats: 'LEVER', country: 'KSA' },
  { name: 'Floward', slug: 'floward', ats: 'LEVER', country: 'KSA' },
  { name: 'Sprii', slug: 'sprii', ats: 'LEVER', country: 'KSA' },
  { name: 'Mumzworld', slug: 'mumzworld', ats: 'LEVER', country: 'UAE' },
  { name: 'The Modist', slug: 'themodist', ats: 'LEVER', country: 'UAE' },
  { name: 'Ounass', slug: 'ounass', ats: 'LEVER', country: 'UAE' },
  { name: 'Namshi', slug: 'namshi', ats: 'LEVER', country: 'UAE' },
  { name: 'Level Shoes', slug: 'levelshoes', ats: 'LEVER', country: 'UAE' },
  { name: 'Boutiqaat', slug: 'boutiqaat', ats: 'LEVER', country: 'Kuwait' },
  { name: 'The Entertainer', slug: 'theentertainer', ats: 'LEVER', country: 'UAE' },
  { name: 'Geidea', slug: 'geidea', ats: 'LEVER', country: 'KSA' },
  { name: 'Lean', slug: 'lean', ats: 'LEVER', country: 'KSA' },
  { name: 'Baraka', slug: 'baraka', ats: 'LEVER', country: 'UAE' },
  { name: 'BitOasis', slug: 'bitoasis', ats: 'LEVER', country: 'UAE' },
  { name: 'Rain', slug: 'rain', ats: 'LEVER', country: 'UAE/Bahrain' },
  { name: 'Sarwa', slug: 'sarwa', ats: 'LEVER', country: 'UAE' },
  { name: 'NymCard', slug: 'nymcard', ats: 'LEVER', country: 'UAE' },
  { name: 'Tarabut', slug: 'tarabut', ats: 'LEVER', country: 'UAE/Bahrain' },
  { name: 'Amal', slug: 'amal', ats: 'LEVER', country: 'UAE' },
  { name: 'Liwwa', slug: 'liwwa', ats: 'LEVER', country: 'Jordan' },
  { name: 'Wahed', slug: 'wahed', ats: 'LEVER', country: 'UK/UAE' },
  { name: 'Plum Fintech', slug: 'plum', ats: 'LEVER', country: 'UK/UAE' },
  { name: 'Now Money', slug: 'nowmoney', ats: 'LEVER', country: 'UAE' },
  { name: 'Yabi', slug: 'yabi', ats: 'LEVER', country: 'UAE' },
  { name: 'Roshni', slug: 'roshni', ats: 'LEVER', country: 'UAE' },
  { name: 'Qashio', slug: 'qashio', ats: 'LEVER', country: 'UAE' },
  { name: 'Pemo', slug: 'pemo', ats: 'LEVER', country: 'UAE' },
  { name: 'Alaan', slug: 'alaan', ats: 'LEVER', country: 'UAE' },
  { name: 'Wio Bank', slug: 'wio', ats: 'LEVER', country: 'UAE' },
];

async function main() {
  const companies = [...GREENHOUSE, ...LEVER];
  let upserted = 0;
  for (const c of companies) {
    await db.listedCompany.upsert({
      where: { slug: c.slug },
      create: {
        name: c.name,
        slug: c.slug,
        ats: c.ats,
        country: c.country,
        industry: c.industry ?? null,
        isActive: true,
      },
      update: {
        name: c.name,
        ats: c.ats,
        country: c.country,
        isActive: true,
      },
    });
    upserted += 1;
  }
  console.log(`Seeded ${upserted} ListedCompany rows (Greenhouse + Lever).`);
  console.log('Ashby / Workable / Recruitee deferred per compliance (Phase 2).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
