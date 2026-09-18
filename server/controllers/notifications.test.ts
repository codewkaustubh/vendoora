import assert from 'node:assert/strict';
import test from 'node:test';
import { buildNotificationData, canReadNotification, isUnread, markAllNotificationsRead } from './notifications';
import { prisma } from '../config/db';
import express from 'express';
import jwt from 'jsonwebtoken';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import apiRouter from '../routes/api';

test('builds a persisted unread notification payload', () => {
  assert.deepEqual(buildNotificationData('user-1', 'Booking created', 'A booking was created.', 'booking'), {
    userId: 'user-1',
    title: 'Booking created',
    message: 'A booking was created.',
    type: 'booking',
    time: 'Just now',
    read: false,
  });
});

test('authorizes notification access by user ownership', () => {
  assert.equal(canReadNotification({ userId: 'user-1' }, 'user-1'), true);
  assert.equal(canReadNotification({ userId: 'user-1' }, 'user-2'), false);
  assert.equal(canReadNotification(null, 'user-1'), false);
});

test('tracks notification read state', () => {
  assert.equal(isUnread({ read: false }), true);
  assert.equal(isUnread({ read: true }), false);
});

test('mark all read persists only the current user unread notifications', async () => {
  const calls: any[] = [];
  const db = { notification: { updateMany: (args: any) => { calls.push(args); return Promise.resolve({ count: 2 }); } } };
  await markAllNotificationsRead(db as any, 'user-1');
  assert.deepEqual(calls[0].where, { userId: 'user-1', read: false });
  assert.equal(calls[0].data.read, true);
  assert.ok(calls[0].data.readAt instanceof Date);
});

test('mark all read reports persistence failures rather than success', async () => {
  const db = { notification: { updateMany: () => Promise.reject(new Error('Database unavailable')) } };
  await assert.rejects(() => markAllNotificationsRead(db as any, 'user-1'), { message: 'Database unavailable' });
});

test('mark all read HTTP route enforces authentication and reports persistence outcomes', async () => {
  const originalUpdateMany = prisma.notification.updateMany;
  const calls: any[] = [];
  let failWrite = false;
  prisma.notification.updateMany = (async (args: any) => {
    calls.push(args);
    if (failWrite) throw new Error('Database unavailable');
    return { count: 2 };
  }) as typeof originalUpdateMany;

  const app = express();
  app.use('/api', apiRouter);
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/notifications/read-all`;
    const unauthenticated = await fetch(url, { method: 'PUT' });
    assert.equal(unauthenticated.status, 401);
    await unauthenticated.json();
    assert.equal(calls.length, 0);

    const token = jwt.sign({ id: 'notification-test-user', role: 'VENDOR' },
      process.env.JWT_SECRET || 'vendoora-super-secret-key-123', { expiresIn: '1m' });
    const options = { method: 'PUT', headers: { Authorization: `Bearer ${token}` } };
    const success = await fetch(url, options);
    assert.equal(success.status, 200);
    assert.deepEqual(await success.json(), { message: 'All notifications marked as read' });
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].where, { userId: 'notification-test-user', read: false });
    assert.equal(calls[0].data.read, true);
    assert.ok(calls[0].data.readAt instanceof Date);

    failWrite = true;
    const failure = await fetch(url, options);
    assert.equal(failure.status, 500);
    assert.deepEqual(await failure.json(), { error: 'Database unavailable' });
  } finally {
    prisma.notification.updateMany = originalUpdateMany;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
