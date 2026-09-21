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

export interface CategorySeedSubRow {
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
}

export interface CategorySeedRow {
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
  subcategories?: CategorySeedSubRow[];
}

export const DOCUMENTED_CATEGORIES: CategorySeedRow[] = [
  {
    name: 'Venues', slug: 'venues', description: 'Palaces, lawns, banquet halls and celebration venues', icon: 'MapPinHouse', sortOrder: 1,
    subcategories: [
      { name: 'Banquet Halls', slug: 'banquet-halls', description: 'Indoor banquet and marriage halls', icon: 'Landmark', sortOrder: 1 },
      { name: 'Lawns', slug: 'lawns', description: 'Open lawn party venues', icon: 'TreeDeciduous', sortOrder: 2 },
      { name: 'Farmhouses', slug: 'farmhouses', description: 'Private farmhouses for events', icon: 'Warehouse', sortOrder: 3 },
      { name: 'Hotels', slug: 'hotels', description: 'Hotels and resorts with event spaces', icon: 'Building2', sortOrder: 4 },
      { name: 'Community Halls', slug: 'community-halls', description: 'Community and samaj halls', icon: 'Users', sortOrder: 5 },
      { name: 'Open Grounds', slug: 'open-grounds', description: 'Large open grounds and maidans', icon: 'TentTree', sortOrder: 6 },
    ],
  },
  {
    name: 'Catering', slug: 'catering', description: 'Live counters, fusion menus and full-service catering', icon: 'UtensilsCrossed', sortOrder: 2,
    subcategories: [
      { name: 'Veg Catering', slug: 'veg-catering', description: 'Pure vegetarian event catering', icon: 'Salad', sortOrder: 1 },
      { name: 'Non-Veg Catering', slug: 'non-veg-catering', description: 'Non-vegetarian event catering', icon: 'Drumstick', sortOrder: 2 },
      { name: 'Snacks', slug: 'snacks', description: 'Evening snacks and starters', icon: 'Cookie', sortOrder: 3 },
      { name: 'Desserts', slug: 'desserts', description: 'Desserts, sweets and mithai', icon: 'CakeSlice', sortOrder: 4 },
      { name: 'Live Counters', slug: 'live-counters', description: 'Live food and chaat counters', icon: 'CookingPot', sortOrder: 5 },
      { name: 'Food Stalls & Carts', slug: 'food-stalls-carts', description: 'Food stalls, carts and trucks', icon: 'Store', sortOrder: 6 },
    ],
  },
  {
    name: 'Decor', slug: 'decor', description: 'Floral canopies, stage design and thematic styling', icon: 'Sparkles', sortOrder: 3,
    subcategories: [
      { name: 'Wedding Decor', slug: 'wedding-decor', description: 'Full wedding mandap and venue decor', icon: 'Heart', sortOrder: 1 },
      { name: 'Birthday Decor', slug: 'birthday-decor', description: 'Birthday and party decoration', icon: 'PartyPopper', sortOrder: 2 },
      { name: 'Floral Decor', slug: 'floral-decor', description: 'Fresh flower arrangements and gates', icon: 'Flower2', sortOrder: 3 },
      { name: 'Stage Decor', slug: 'stage-decor', description: 'Stage backdrops and setting', icon: 'Presentation', sortOrder: 4 },
      { name: 'Festival Decor', slug: 'festival-decor', description: 'Diwali, Navratri and festive decor', icon: 'Star', sortOrder: 5 },
      { name: 'Theme Decor', slug: 'theme-decor', description: 'Concept and theme-based styling', icon: 'Wand2', sortOrder: 6 },
    ],
  },
  {
    name: 'Tent House', slug: 'tent-house', description: 'Tents, seating, furniture and event infrastructure', icon: 'Tent', sortOrder: 4,
    subcategories: [
      { name: 'Chairs', slug: 'chairs', description: 'Chairs and seating rentals', icon: 'Armchair', sortOrder: 1 },
      { name: 'Tables', slug: 'tables', description: 'Tables, counters and desks', icon: 'TableProperties', sortOrder: 2 },
      { name: 'Tents & Canopies', slug: 'tents-canopies', description: 'Waterproof tents and canopies', icon: 'Tent', sortOrder: 3 },
      { name: 'Fans & Coolers', slug: 'fans-coolers', description: 'Pedestal fans and cooler rentals', icon: 'Fan', sortOrder: 4 },
      { name: 'Carpets & Mats', slug: 'carpets-mats', description: 'Carpets, mats and flooring', icon: 'Layers', sortOrder: 5 },
      { name: 'Stages & Platforms', slug: 'stages-platforms', description: 'Portable stages and platforms', icon: 'Boxes', sortOrder: 6 },
    ],
  },
  {
    name: 'Cooling', slug: 'cooling', description: 'Air cooling, chillers and climate control rentals', icon: 'Snowflake', sortOrder: 5,
    subcategories: [
      { name: 'Air Coolers', slug: 'air-coolers', description: 'Room air cooler rentals', icon: 'AirVent', sortOrder: 1 },
      { name: 'Desert Coolers', slug: 'desert-coolers', description: 'Heavy-duty desert coolers', icon: 'Wind', sortOrder: 2 },
      { name: 'Fans', slug: 'fans', description: 'Pedestal and wall fans', icon: 'Fan', sortOrder: 3 },
      { name: 'Industrial Fans', slug: 'industrial-fans', description: 'High-volume industrial fans', icon: 'Tornado', sortOrder: 4 },
      { name: 'AC Units', slug: 'ac-units', description: 'Portable and tower AC units', icon: 'Refrigerator', sortOrder: 5 },
    ],
  },
  {
    name: 'Sound/DJ', slug: 'sound-dj', description: 'Audio systems, DJ setups and live sound engineering', icon: 'Music', sortOrder: 6,
    subcategories: [
      { name: 'DJ', slug: 'dj', description: 'Professional event DJs', icon: 'Disc3', sortOrder: 1 },
      { name: 'Speakers', slug: 'speakers', description: 'PA speakers and line arrays', icon: 'Speaker', sortOrder: 2 },
      { name: 'Amplifiers & Microphones', slug: 'amplifiers-microphones', description: 'Amps, mixers and wired mics', icon: 'Mic', sortOrder: 3 },
      { name: 'Professional Sound Systems', slug: 'professional-sound-systems', description: 'Concert-grade sound rigs', icon: 'AudioLines', sortOrder: 4 },
      { name: 'DJ Lights', slug: 'dj-lights', description: 'DJ and dance-floor lighting', icon: 'Zap', sortOrder: 5 },
    ],
  },
  {
    name: 'Lighting', slug: 'lighting', description: 'Stage lighting, moving heads and ambience lighting', icon: 'Lightbulb', sortOrder: 7,
    subcategories: [
      { name: 'Decorative & String Lighting', slug: 'decorative-string-lighting', description: 'Fairy lights and festoon strings', icon: 'Sparkle', sortOrder: 1 },
      { name: 'LED PAR & Uplighting', slug: 'led-par-uplighting', description: 'LED PAR cans and wall uplights', icon: 'LampDesk', sortOrder: 2 },
      { name: 'Moving Head & Stage Lighting', slug: 'moving-head-stage-lighting', description: 'Moving heads and stage wash', icon: 'Flashlight', sortOrder: 3 },
      { name: 'Spotlights & Special Effects', slug: 'spotlights-special-effects', description: 'Follow spots, lasers and fog', icon: 'Sun', sortOrder: 4 },
    ],
  },
  {
    name: 'Manpower', slug: 'manpower', description: 'Crew, coordinators and on-ground event staff', icon: 'Users', sortOrder: 8,
    subcategories: [
      { name: 'Waiters', slug: 'waiters', description: 'Service waiters and captains', icon: 'ConciergeBell', sortOrder: 1 },
      { name: 'Helpers', slug: 'helpers', description: 'General event helpers', icon: 'HelpingHand', sortOrder: 2 },
      { name: 'Cleaners', slug: 'cleaners', description: 'Cleaning and housekeeping crew', icon: 'Brush', sortOrder: 3 },
      { name: 'Security', slug: 'security', description: 'Bouncers and event security', icon: 'ShieldCheck', sortOrder: 4 },
      { name: 'Setup Staff', slug: 'setup-staff', description: 'Load, setup and teardown crew', icon: 'HardHat', sortOrder: 5 },
      { name: 'Event Staff', slug: 'event-staff', description: 'Hosts, ushers and coordinators', icon: 'ClipboardList', sortOrder: 6 },
    ],
  },
  {
    name: 'Photo/Video', slug: 'photo-video', description: 'Photography, cinematography and same-day edits', icon: 'Camera', sortOrder: 9,
    subcategories: [
      { name: 'Photography', slug: 'photography', description: 'Candid and traditional photography', icon: 'Aperture', sortOrder: 1 },
      { name: 'Videography', slug: 'videography', description: 'Event videography teams', icon: 'Video', sortOrder: 2 },
      { name: 'Cinematography', slug: 'cinematography', description: 'Cinematic wedding films', icon: 'Clapperboard', sortOrder: 3 },
      { name: 'Drone', slug: 'drone', description: 'Aerial drone coverage', icon: 'Send', sortOrder: 4 },
      { name: 'Photo Booth', slug: 'photo-booth', description: 'Selfie booths and props', icon: 'Frame', sortOrder: 5 },
      { name: 'Live Streaming', slug: 'live-streaming', description: 'Multi-cam live streaming', icon: 'Radio', sortOrder: 6 },
    ],
  },
  {
    name: 'Mehendi', slug: 'mehendi', description: 'Mehendi artists and henna design studios', icon: 'Palette', sortOrder: 10,
    subcategories: [
      { name: 'Bridal Mehendi', slug: 'bridal-mehendi', description: 'Full bridal mehendi packages', icon: 'Crown', sortOrder: 1 },
      { name: 'Festive Mehendi', slug: 'festive-mehendi', description: 'Karwa Chauth and festive designs', icon: 'Moon', sortOrder: 2 },
      { name: 'Mehendi Artists', slug: 'mehendi-artists', description: 'Home-visit mehendi artists', icon: 'Paintbrush', sortOrder: 3 },
    ],
  },
  {
    name: 'Disposables', slug: 'disposables', description: 'Crockery, cutlery and per-guest disposables', icon: 'Flame', sortOrder: 11,
    subcategories: [
      { name: 'Plates', slug: 'plates', description: 'Paper and bagasse plates', icon: 'Circle', sortOrder: 1 },
      { name: 'Cups', slug: 'cups', description: 'Tea, coffee and paper cups', icon: 'Coffee', sortOrder: 2 },
      { name: 'Glasses', slug: 'glasses', description: 'Water and juice glasses', icon: 'GlassWater', sortOrder: 3 },
      { name: 'Spoons & Forks', slug: 'spoons-forks', description: 'Wooden cutlery sets', icon: 'Utensils', sortOrder: 4 },
      { name: 'Bowls', slug: 'bowls', description: 'Serving and dessert bowls', icon: 'Soup', sortOrder: 5 },
      { name: 'Food Containers', slug: 'food-containers', description: 'Takeaway and parcel boxes', icon: 'Package', sortOrder: 6 },
    ],
  },
  {
    name: 'Transport', slug: 'transport', description: 'Guest transport, logistics and equipment movement', icon: 'Truck', sortOrder: 12,
    subcategories: [
      { name: 'Cars', slug: 'cars', description: 'Sedans, SUVs and luxury cars', icon: 'Car', sortOrder: 1 },
      { name: 'Buses', slug: 'buses', description: 'Mini and luxury coaches', icon: 'Bus', sortOrder: 2 },
      { name: 'Tempo Travellers', slug: 'tempo-travellers', description: 'Tempo travellers on hire', icon: 'Caravan', sortOrder: 3 },
      { name: 'Trucks & Pickups', slug: 'trucks-pickups', description: 'Loading tempos and pickups', icon: 'Truck', sortOrder: 4 },
      { name: 'Equipment Transport', slug: 'equipment-transport', description: 'Stage and gear shifting', icon: 'Forklift', sortOrder: 5 },
      { name: 'Ambulance', slug: 'ambulance', description: 'On-standby medical vans', icon: 'Cross', sortOrder: 6 },
    ],
  },
];

/**
 * `services.create` falls back to a "General" category when a vendor submits
 * an unknown category, so this row is part of the existing API contract and
 * must exist for that fallback to resolve. It is not new seed data. It is
 * flagged `isSystem` so customer-facing taxonomy endpoints never surface it:
 * it must never appear as a Browse Categories card.
 */
export const SEED_CATEGORIES: CategorySeedRow[] = [
  ...DOCUMENTED_CATEGORIES,
  {
    name: 'General',
    slug: 'general',
    description: 'Default category for services created without a known category',
    icon: 'LayoutGrid',
    sortOrder: 0,
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

  const seedRows: Array<CategorySeedRow & { isSystem?: boolean; parentName?: string }> = [
    ...SEED_CATEGORIES.map((row) => ({ ...row, isSystem: row.slug === 'general' })),
  ];
  for (const parent of DOCUMENTED_CATEGORIES) {
    for (const child of parent.subcategories ?? []) {
      seedRows.push({ ...child, parentName: parent.name });
    }
  }

  const parentIdsByName = new Map<string, string>();

  for (const category of seedRows) {
    const { parentName, subcategories: _subcategories, ...categoryData } = category;
    const existing = await db.category.findUnique({ where: { name: category.name } });
    if (existing) {
      alreadyPresent += 1;
      if (!parentName) {
        const existingId = (existing as { id?: unknown }).id;
        if (typeof existingId === 'string') parentIdsByName.set(category.name, existingId);
      }
      continue;
    }

    try {
      const parentId = parentName ? parentIdsByName.get(parentName) : undefined;
      const createdRow = await db.category.create({
        data: { ...categoryData, ...(parentId ? { parentId } : {}) },
      });
      created += 1;
      const createdId = (createdRow as { id?: unknown }).id;
      if (!parentName && typeof createdId === 'string') parentIdsByName.set(category.name, createdId);
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
