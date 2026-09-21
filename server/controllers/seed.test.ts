import assert from 'node:assert/strict';
import test from 'node:test';
import { DOCUMENTED_CATEGORIES, SEED_CATEGORIES, seedDocumentedCategories } from '../../prisma/seed';
import { BASE_COSTS } from '../../src/components/budget/budgetCalculatorModel';

const EXPECTED_SUBCATEGORIES: Record<string, string[]> = {
  'Venues': ['Banquet Halls', 'Lawns', 'Farmhouses', 'Hotels', 'Community Halls', 'Open Grounds'],
  'Catering': ['Veg Catering', 'Non-Veg Catering', 'Snacks', 'Desserts', 'Live Counters', 'Food Stalls & Carts'],
  'Decor': ['Wedding Decor', 'Birthday Decor', 'Floral Decor', 'Stage Decor', 'Festival Decor', 'Theme Decor'],
  'Tent House': ['Chairs', 'Tables', 'Tents & Canopies', 'Fans & Coolers', 'Carpets & Mats', 'Stages & Platforms'],
  'Cooling': ['Air Coolers', 'Desert Coolers', 'Fans', 'Industrial Fans', 'AC Units'],
  'Sound/DJ': ['DJ', 'Speakers', 'Amplifiers & Microphones', 'Professional Sound Systems', 'DJ Lights'],
  'Lighting': ['Decorative & String Lighting', 'LED PAR & Uplighting', 'Moving Head & Stage Lighting', 'Spotlights & Special Effects'],
  'Manpower': ['Waiters', 'Helpers', 'Cleaners', 'Security', 'Setup Staff', 'Event Staff'],
  'Photo/Video': ['Photography', 'Videography', 'Cinematography', 'Drone', 'Photo Booth', 'Live Streaming'],
  'Mehendi': ['Bridal Mehendi', 'Festive Mehendi', 'Mehendi Artists'],
  'Disposables': ['Plates', 'Cups', 'Glasses', 'Spoons & Forks', 'Bowls', 'Food Containers'],
  'Transport': ['Cars', 'Buses', 'Tempo Travellers', 'Trucks & Pickups', 'Equipment Transport', 'Ambulance'],
};

test('documented categories cover every budget calculator pricing key', () => {
  const slugs = new Set(SEED_CATEGORIES.map((category) => category.slug));
  for (const pricingKey of Object.keys(BASE_COSTS)) {
    assert.ok(slugs.has(pricingKey), `budget pricing key "${pricingKey}" has no seeded category slug`);
  }
});

test('seed rows are unique by name and slug', () => {
  const names = SEED_CATEGORIES.map((category) => category.name);
  const slugs = SEED_CATEGORIES.map((category) => category.slug);
  assert.equal(new Set(names).size, names.length);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const category of SEED_CATEGORIES) {
    assert.equal(category.name.length > 0, true);
    assert.equal(category.slug.length > 0, true);
  }
});

test('seeding is idempotent and never overwrites existing rows', async () => {
  const creates: string[] = [];
  const db = {
    category: {
      findUnique: async ({ where }: { where: { name: string } }) =>
        where.name === 'Venues' || where.name === 'General' ? { id: 'existing', name: where.name } : null,
      create: async ({ data }: { data: { name: string } }) => {
        creates.push(data.name);
        return { id: `new-${data.name}`, ...data };
      },
    },
  };

  const result = await seedDocumentedCategories(db as never);
  const expectedNames = [
    ...SEED_CATEGORIES.map((c) => c.name),
    ...DOCUMENTED_CATEGORIES.flatMap((c) => (c.subcategories ?? []).map((child) => child.name)),
  ].filter((n) => n !== 'Venues' && n !== 'General');
  assert.equal(result.created, expectedNames.length);
  assert.equal(result.alreadyPresent, 2);
  assert.deepEqual(creates.sort(), expectedNames.sort());
});

test('seeding creates every category and subcategory on an empty database', async () => {
  const db = {
    category: {
      findUnique: async () => null,
      create: async ({ data }: { data: { name: string } }) => ({ id: `new-${data.name}`, ...data }),
    },
  };

  const result = await seedDocumentedCategories(db as never);
  const expected = SEED_CATEGORIES.length + DOCUMENTED_CATEGORIES.reduce((count, parent) => count + (parent.subcategories ?? []).length, 0);
  assert.equal(result.created, expected);
  assert.equal(result.alreadyPresent, 0);
});

test('seeded subcategories link to their parent category', async () => {
  const writes: Array<{ name: string; parentId?: string }> = [];
  const idsByName: Record<string, string> = {};
  let counter = 0;
  const db = {
    category: {
      findUnique: async () => null,
      create: async ({ data }: { data: { name: string; parentId?: string } }) => {
        counter += 1;
        const id = `id-${counter}`;
        idsByName[data.name] = id;
        writes.push({ name: data.name, parentId: data.parentId });
        return { id, ...data };
      },
    },
  };

  await seedDocumentedCategories(db as never);

  const banquet = writes.find((row) => row.name === 'Banquet Halls');
  const venues = writes.find((row) => row.name === 'Venues');
  assert.ok(banquet?.parentId, 'Banquet Halls must carry a parentId');
  assert.equal(banquet?.parentId, idsByName['Venues']);
  assert.equal(venues?.parentId, undefined);

  const general = writes.find((row) => row.name === 'General');
  assert.ok(general, 'General fallback row is still seeded');
});

test('a concurrent duplicate insert is counted as already present', async () => {
  let calls = 0;
  const db = {
    category: {
      findUnique: async () => null,
      create: async () => {
        calls += 1;
        const error = new Error('Unique constraint failed') as Error & { code?: string };
        error.code = 'P2002';
        throw error;
      },
    },
  };

  const result = await seedDocumentedCategories(db as never);
  assert.equal(result.created, 0);
  const expected = SEED_CATEGORIES.length + DOCUMENTED_CATEGORIES.reduce((count, parent) => count + (parent.subcategories ?? []).length, 0);
  assert.equal(result.alreadyPresent, expected);
  assert.equal(calls, expected);
});

test('non-duplicate seed failures propagate', async () => {
  const db = {
    category: {
      findUnique: async () => null,
      create: async () => {
        const error = new Error('Connection refused') as Error & { code?: string };
        error.code = 'P1001';
        throw error;
      },
    },
  };

  await assert.rejects(() => seedDocumentedCategories(db as never), /Connection refused/);
});

test('seed rows carry descriptions and lucide icon names', () => {
  for (const category of DOCUMENTED_CATEGORIES) {
    assert.ok(category.description.length > 5, `${category.name} missing description`);
    assert.ok(category.icon.length > 0, `${category.name} missing icon`);
  }
});

test('documented taxonomy matches the approved category/subcategory list', () => {
  assert.equal(DOCUMENTED_CATEGORIES.length, 12);
  const byName = new Map(DOCUMENTED_CATEGORIES.map((category) => [category.name, category]));
  for (const [parent, expectedChildren] of Object.entries(EXPECTED_SUBCATEGORIES)) {
    const row = byName.get(parent);
    assert.ok(row, `missing top-level category "${parent}"`);
    assert.deepEqual(
      (row?.subcategories ?? []).map((child) => child.name),
      expectedChildren,
      `subcategory mismatch for "${parent}"`,
    );
    for (const child of row?.subcategories ?? []) {
      assert.ok(child.slug.length > 0, `${parent} / ${child.name} missing slug`);
      assert.ok(child.icon.length > 0, `${parent} / ${child.name} missing icon`);
    }
  }
  assert.deepEqual(
    DOCUMENTED_CATEGORIES.map((category) => category.name),
    Object.keys(EXPECTED_SUBCATEGORIES),
    'top-level category order changed',
  );
});
