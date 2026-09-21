import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidCategoryRow, toCategoryOptions, toCategoryTreeNode } from './categories';
import { prisma } from '../config/db';
import express from 'express';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import apiRouter from '../routes/api';

test('accepts only rows with id, name, and slug', () => {
  assert.equal(isValidCategoryRow({ id: 'a', name: 'Venues', slug: 'venues' }), true);
  assert.equal(isValidCategoryRow({ id: 'a', name: '', slug: 'venues' }), false);
  assert.equal(isValidCategoryRow({ id: 'a', name: 'Venues', slug: '' }), false);
  assert.equal(isValidCategoryRow({ id: '', name: 'Venues', slug: 'venues' }), false);
  assert.equal(isValidCategoryRow(null), false);
  assert.equal(isValidCategoryRow(undefined), false);
});

test('maps category rows to display options with slug as id', () => {
  const gradients = [
    'from-blue-500/10 to-indigo-500/10',
    'from-amber-500/10 to-orange-500/10',
  ];

  const options = toCategoryOptions([
    { id: 'id-1', name: 'Venues', slug: 'venues', icon: 'MapPin', image: null },
    { id: 'id-2', name: 'Catering', slug: 'catering', icon: '', image: null },
    { id: 'bad', name: '', slug: '' },
  ]);

  assert.equal(options.length, 2);
  assert.deepEqual(options[0], {
    id: 'venues',
    label: 'Venues',
    iconName: 'MapPin',
    gradient: gradients[0],
  });
  assert.deepEqual(options[1], {
    id: 'catering',
    label: 'Catering',
    iconName: 'LayoutGrid',
    gradient: gradients[1],
  });
});

test('rejects non-array payloads without throwing', () => {
  assert.deepEqual(toCategoryOptions(null), []);
  assert.deepEqual(toCategoryOptions(undefined), []);
  assert.deepEqual(toCategoryOptions({}), []);
  assert.deepEqual(toCategoryOptions('venues'), []);
});
test('toCategoryTreeNode maps a parent row with its subcategories', () => {
  const node = toCategoryTreeNode({
    id: 'parent-id',
    name: 'Venues',
    slug: 'venues',
    description: 'Venues',
    icon: 'MapPinHouse',
    image: null,
    sortOrder: 1,
    children: [
      { id: 'child-1', name: 'Banquet Halls', slug: 'banquet-halls', icon: 'Landmark', sortOrder: 1 },
      { id: 'bad', name: '', slug: '' },
      { id: 'child-2', name: 'Lawns', slug: 'lawns', icon: null, image: null, sortOrder: 2 },
    ],
  });

  assert.equal(node.sortOrder, 1);
  assert.equal(node.subcategories.length, 2);
  assert.deepEqual(node.subcategories[0], {
    id: 'child-1',
    name: 'Banquet Halls',
    slug: 'banquet-halls',
    description: null,
    icon: 'Landmark',
    image: null,
  });
});

test('GET /api/categories?tree=true returns curated parents, never system rows', async () => {
  const originalFindMany = prisma.category.findMany;
  const calls: any[] = [];
  prisma.category.findMany = (async (args: any) => {
    calls.push(args);
    return [
      {
        id: 'parent-id',
        name: 'Venues',
        slug: 'venues',
        description: 'Venues',
        icon: 'MapPinHouse',
        image: null,
        sortOrder: 1,
        children: [
          { id: 'child-1', name: 'Banquet Halls', slug: 'banquet-halls', icon: 'Landmark', sortOrder: 1 },
        ],
      },
    ];
  }) as unknown as typeof originalFindMany;

  const app = express();
  app.use('/api', apiRouter);
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/categories?tree=true`;
    const response = await fetch(url);
    assert.equal(response.status, 200);
    assert.deepEqual(calls[0].where, { parentId: null, isSystem: false });
    const payload = await response.json();
    assert.equal(payload.categories.length, 1);
    assert.equal(payload.categories[0].slug, 'venues');
    assert.deepEqual(payload.categories[0].subcategories.map((row: any) => row.slug), ['banquet-halls']);
    assert.ok(!payload.categories.some((row: any) => row.slug === 'general'));
  } finally {
    prisma.category.findMany = originalFindMany;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});


test('GET /api/categories returns rows ordered by name', async () => {
  const originalFindMany = prisma.category.findMany;
  const calls: any[] = [];
  prisma.category.findMany = (async (args: any) => {
    calls.push(args);
    return [
      { id: 'id-1', name: 'Venues', slug: 'venues' },
      { id: 'id-2', name: 'Catering', slug: 'catering' },
    ];
  }) as typeof originalFindMany;

  const app = express();
  app.use('/api', apiRouter);
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/categories`;
    const response = await fetch(url);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.deepEqual(calls, [{ orderBy: { name: 'asc' } }]);
    assert.deepEqual(
      payload.categories.map((row: any) => row.name),
      ['Venues', 'Catering'],
    );
  } finally {
    prisma.category.findMany = originalFindMany;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('GET /api/categories surfaces persistence failures as HTTP 500', async () => {
  const originalFindMany = prisma.category.findMany;
  prisma.category.findMany = (async () => {
    throw new Error('database unavailable');
  }) as typeof originalFindMany;

  const app = express();
  app.use('/api', apiRouter);
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/categories`;
    const response = await fetch(url);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'database unavailable' });
  } finally {
    prisma.category.findMany = originalFindMany;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
