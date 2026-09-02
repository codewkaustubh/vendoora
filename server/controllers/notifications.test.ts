import assert from 'node:assert/strict';
import test from 'node:test';
import { buildNotificationData, canReadNotification, isUnread } from './notifications';

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