import assert from 'node:assert/strict';
import test from 'node:test';
import { buildHealthResponse, checkDatabase } from './health';
import { prisma } from '../config/db';

test('healthy database reports ok with HTTP 200', () => {
  const result = buildHealthResponse('ok', 12);
  assert.equal(result.statusCode, 200);
  assert.equal(result.body.status, 'ok');
  assert.equal(result.body.database, 'ok');
  assert.equal(result.body.latencyMs, 12);
  assert.ok(result.body.timestamp instanceof Date);
});

test('unavailable database reports error with HTTP 503 and leaks no internals', () => {
  const result = buildHealthResponse('unavailable', 0);
  assert.equal(result.statusCode, 503);
  assert.equal(result.body.status, 'error');
  assert.equal(result.body.database, 'unavailable');

  const serialized = JSON.stringify(result.body);
  assert.equal(serialized.includes('postgres://'), false);
  assert.equal(serialized.includes('DATABASE_URL'), false);
  assert.equal(serialized.includes('stack'), false);
  assert.equal(serialized.includes('password'), false);
});

test('checkDatabase returns ok when Prisma connects', async () => {
  const originalQueryRaw = prisma.$queryRaw;
  let queried = false;
  prisma.$queryRaw = (async () => {
    queried = true;
    return [{ '?column?': 1 }];
  }) as typeof originalQueryRaw;

  try {
    assert.equal(await checkDatabase(), 'ok');
    assert.equal(queried, true);
  } finally {
    prisma.$queryRaw = originalQueryRaw;
  }
});

test('checkDatabase returns unavailable when Prisma fails', async () => {
  const originalQueryRaw = prisma.$queryRaw;
  prisma.$queryRaw = (async () => {
    throw new Error('P1001: Can\'t reach database server');
  }) as typeof originalQueryRaw;

  try {
    assert.equal(await checkDatabase(), 'unavailable');
  } finally {
    prisma.$queryRaw = originalQueryRaw;
  }
});

test('checkDatabase returns unavailable when the database check times out', async () => {
  const originalQueryRaw = prisma.$queryRaw;
  prisma.$queryRaw = (async () => new Promise(() => undefined)) as typeof originalQueryRaw;

  try {
    assert.equal(await checkDatabase(25), 'unavailable');
  } finally {
    prisma.$queryRaw = originalQueryRaw;
  }
});
