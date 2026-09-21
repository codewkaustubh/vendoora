import assert from 'node:assert/strict';
import test from 'node:test';
import { prisma } from '../config/db';
import express from 'express';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import apiRouter from '../routes/api';

async function getJson(url: string) {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const response = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}${url}`);
    return { status: response.status, payload: await response.json() };
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('GET /api/services rejects an unknown category', async () => {
  const originalFindFirst = prisma.category.findFirst;
  prisma.category.findFirst = (async () => null) as unknown as typeof originalFindFirst;
  try {
    const { status, payload } = await getJson('/api/services?category=no-such-place');
    assert.equal(status, 400);
    assert.match(String(payload?.error || ''), /Unknown category/);
  } finally {
    prisma.category.findFirst = originalFindFirst;
  }
});

test('GET /api/services rejects a subcategory outside its category', async () => {
  const originalFindFirst = prisma.category.findFirst;
  const originalCount = prisma.service.count;
  const originalFindMany = prisma.service.findMany;
  let leafCalls = 0;
  prisma.category.findFirst = (async (args: any) => {
    if (args?.where?.parentId) {
      leafCalls += 1;
      return null;
    }
    return { id: 'parent-id', slug: 'venues', children: [{ id: 'child-1' }] };
  }) as unknown as typeof originalFindFirst;
  prisma.service.count = (async () => 0) as unknown as typeof originalCount;
  prisma.service.findMany = (async () => []) as unknown as typeof originalFindMany;
  try {
    const { status, payload } = await getJson('/api/services?category=venues&subcategory=dj');
    assert.equal(status, 400);
    assert.match(String(payload?.error || ''), /Unknown subcategory/);
    assert.equal(leafCalls, 1);
  } finally {
    prisma.category.findFirst = originalFindFirst;
    prisma.service.count = originalCount;
    prisma.service.findMany = originalFindMany;
  }
});

test('GET /api/services scopes a valid category+subcategory to the leaf row', async () => {
  const originalFindFirst = prisma.category.findFirst;
  const originalCount = prisma.service.count;
  const originalFindMany = prisma.service.findMany;
  const seen: any[] = [];
  prisma.category.findFirst = (async (args: any) => {
    if (args?.where?.parentId) return { id: 'leaf-id', slug: 'banquet-halls', parentId: 'parent-id' };
    return { id: 'parent-id', slug: 'venues', children: [{ id: 'leaf-id' }] };
  }) as unknown as typeof originalFindFirst;
  prisma.service.count = (async (args: any) => {
    seen.push(args?.where);
    return 2;
  }) as unknown as typeof originalCount;
  prisma.service.findMany = (async () => [
    { id: 's1', title: 'Grand Banquet Hall', vendor: { businessName: 'Royal Halls' }, category: { id: 'leaf-id', name: 'Banquet Halls' } },
  ]) as unknown as typeof originalFindMany;
  try {
    const { status, payload } = await getJson('/api/services?category=venues&subcategory=banquet-halls&city=Mumbai');
    assert.equal(status, 200);
    assert.deepEqual(seen[0]?.category, { is: { id: 'leaf-id' } });
    assert.equal(payload?.pagination?.total, 2);
    assert.equal(payload?.services?.length, 1);
  } finally {
    prisma.category.findFirst = originalFindFirst;
    prisma.service.count = originalCount;
    prisma.service.findMany = originalFindMany;
  }
});
