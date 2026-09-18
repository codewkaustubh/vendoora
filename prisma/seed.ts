import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Idempotent production seed for the documented VENDOORA service categories.
 *
 * Safety guarantees:
 *  - Running repeatedly is safe: categories that already exist are left
 *    untouched (no update, no delete, no overwrite of admin/vendor edits).
 *  - Only the documented category names are touched. Nothing else in the
 *    database is created, modified, or removed.
 *  - Slug values intentionally match the pricing keys in
 *    `src/components/budget/budgetCalculatorModel.ts` (BASE_COSTS), because
 *    `BudgetCalculatorModal` sends `Category.slug` as the budget calculator's
 *    service id. Changing a slug would silently break budget math.
 *
 * Run with:  npx prisma db seed
 */

export interface CategorySeedRow {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export const DOCUMENTED_CATEGORIES: CategorySeedRow[] = [
  { name: 'Venues', slug: 'venues', description: 'Palaces, lawns, banquet halls and celebration venues', icon: 'MapPinHouse' },
  { name: 'Catering', slug: 'catering', description: 'Live counters, fusion menus and full-service catering', icon: 'UtensilsCrossed' },
  { name: 'Decor', slug: 'decor', description: 'Floral canopies, stage design and thematic styling', icon: 'Sparkles' },
  { name: 'Tent House', slug: 'tent-house', description: 'Tents, seating, furniture and event infrastructure', icon: 'Tent' },
  { name: 'Cooling', slug: 'cooling', description: 'Air cooling, chillers and climate control rentals', icon: 'Snowflake' },
  { name: 'Sound/DJ', slug: 'sound-dj', description: 'Audio systems, DJ setups and live sound engineering', icon: 'Music' },
  { name: 'Lighting', slug: 'lighting', description: 'Stage lighting, moving heads and ambience lighting', icon: 'Lightbulb' },
  { name: 'Manpower', slug: 'manpower', description: 'Crew, coordinators and on-ground event staff', icon: 'Users' },
  { name: 'Photo/Video', slug: 'photo-video', description: 'Photography, cinematography and same-day edits', icon: 'Camera' },
  { name: 'Mehendi', slug: 'mehendi', description: 'Mehendi artists and henna design studios', icon: 'Palette' },
  { name: 'Disposables', slug: 'disposables', description: 'Crockery, cutlery and per-guest disposables', icon: 'Flame' },
  { name: 'Transport', slug: 'transport', description: 'Guest transport, logistics and equipment movement', icon: 'Truck' },
];

/**
 * `services.create` falls back to a "General" category when a vendor submits
 * an unknown category, so this row is part of the existing API contract and
 * must exist for that fallback to resolve. It is not new seed data.
 */
export const SEED_CATEGORIES: CategorySeedRow[] = [
  ...DOCUMENTED_CATEGORIES,
  {
    name: 'General',
    slug: 'general',
    description: 'Default category for services created without a known category',
    icon: 'LayoutGrid',
  },
];

type SeedDb = {
  category: {
    findUnique: (args: { where: { name: string } }) => Promise<unknown>;
    create: (args: { data: CategorySeedRow }) => Promise<unknown>;
  };
};

export async function seedDocumentedCategories(db: SeedDb): Promise<{ created: number; alreadyPresent: number }> {
  let created = 0;
  let alreadyPresent = 0;

  for (const category of SEED_CATEGORIES) {
    const existing = await db.category.findUnique({ where: { name: category.name } });
    if (existing) {
      alreadyPresent += 1;
      continue;
    }

    try {
      await db.category.create({ data: category });
      created += 1;
    } catch (error) {
      // A concurrent seed already inserted the same unique name; treat as present.
      if ((error as { code?: string }).code !== 'P2002') throw error;
      alreadyPresent += 1;
    }
  }

  return { created, alreadyPresent };
}

export async function runSeed() {
  return seedDocumentedCategories(prisma);
}

const isDirectRun = process.argv[1]?.replace(/\\/g, '/').endsWith('prisma/seed.ts');

if (isDirectRun) {
  runSeed()
    .then((result) => {
      console.log(`Category seed complete: ${result.created} created, ${result.alreadyPresent} already present.`);
      return prisma.$disconnect();
    })
    .catch((error) => {
      console.error('Category seed failed:', error instanceof Error ? error.message : error);
      return prisma.$disconnect().then(() => {
        process.exitCode = 1;
      });
    });
}
