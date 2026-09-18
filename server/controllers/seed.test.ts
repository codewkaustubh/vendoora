import assert from 'node:assert/strict';
import test from 'node:test';
import { DOCUMENTED_CATEGORIES, SEED_CATEGORIES, seedDocumentedCategories } from '../../prisma/seed';
import { BASE_COSTS } from '../../src/components/budget/budgetCalculatorModel';

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
  assert.equal(result.created, SEED_CATEGORIES.length - 2);
  assert.equal(result.alreadyPresent, 2);
  assert.deepEqual(creates.sort(), SEED_CATEGORIES.map((c) => c.name).filter((n) => n !== 'Venues' && n !== 'General').sort());
});

test('seeding creates every category on an empty database', async () => {
  const db = {
    category: {
      findUnique: async () => null,
      create: async ({ data }: { data: { name: string } }) => ({ id: `new-${data.name}`, ...data }),
    },
  };

  const result = await seedDocumentedCategories(db as never);
  assert.equal(result.created, SEED_CATEGORIES.length);
  assert.equal(result.alreadyPresent, 0);
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
  assert.equal(result.alreadyPresent, SEED_CATEGORIES.length);
  assert.equal(calls, SEED_CATEGORIES.length);
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
