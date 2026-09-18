import assert from 'node:assert/strict';
import test from 'node:test';
import { prisma } from '../config/db';
import express from 'express';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import apiRouter from '../routes/api';

test('GET /api/marketplace/products/:id returns the listing with seller contact', async () => {
  const originalFindUnique = prisma.product.findUnique;
  const calls: any[] = [];
  prisma.product.findUnique = (async (args: any) => {
    calls.push(args);
    return {
      id: args.where.id,
      sellerId: 'seller-1',
      name: 'Pixel LED Dance Floor',
      price: 120000,
      condition: 'GOOD',
      location: 'Mumbai',
      available: true,
      seller: { id: 'seller-1', name: 'Gear Co', email: 'gear@example.com', city: 'Mumbai', state: 'MH' },
    };
  }) as unknown as typeof originalFindUnique;

  const app = express();
  app.use('/api', apiRouter);
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/marketplace/products/product-1`;
    const response = await fetch(url);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.deepEqual(calls, [{ where: { id: 'product-1' }, include: { seller: { select: { id: true, name: true, email: true, city: true, state: true } } } }]);
    assert.equal(payload.product.id, 'product-1');
    assert.equal(payload.product.seller.email, 'gear@example.com');
  } finally {
    prisma.product.findUnique = originalFindUnique;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('GET /api/marketplace/products/:id returns 404 for an unknown listing', async () => {
  const originalFindUnique = prisma.product.findUnique;
  prisma.product.findUnique = (async () => null) as unknown as typeof originalFindUnique;

  const app = express();
  app.use('/api', apiRouter);
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/marketplace/products/missing`;
    const response = await fetch(url);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Product listing not found' });
  } finally {
    prisma.product.findUnique = originalFindUnique;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('GET /api/marketplace/products still lists products', async () => {
  const originalCount = prisma.product.count;
  const originalFindMany = prisma.product.findMany;
  prisma.product.count = (async () => 1) as typeof originalCount;
  prisma.product.findMany = (async () => [
    { id: 'product-2', name: 'Hanger Tent', price: 420000, condition: 'MINT', location: 'Delhi', available: true },
  ]) as typeof originalFindMany;

  const app = express();
  app.use('/api', apiRouter);
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/marketplace/products`;
    const response = await fetch(url);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.products.length, 1);
    assert.equal(payload.products[0].id, 'product-2');
  } finally {
    prisma.product.count = originalCount;
    prisma.product.findMany = originalFindMany;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});