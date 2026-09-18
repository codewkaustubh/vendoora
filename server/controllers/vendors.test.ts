import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveVerificationStatus } from './vendors';

test('vendors cannot self-verify their own profile', () => {
  assert.equal(resolveVerificationStatus('PENDING', 'VENDOR', { verificationStatus: 'VERIFIED' }), 'PENDING');
  assert.equal(resolveVerificationStatus('PENDING', 'VENDOR', { verified: true }), 'PENDING');
  assert.equal(resolveVerificationStatus('REJECTED', 'VENDOR', { verified: true }), 'REJECTED');
  assert.equal(resolveVerificationStatus('PENDING', 'CLIENT', { verificationStatus: 'VERIFIED' }), 'PENDING');
});

test('only ADMIN callers may change verification status', () => {
  assert.equal(resolveVerificationStatus('PENDING', 'ADMIN', { verificationStatus: 'VERIFIED' }), 'VERIFIED');
  assert.equal(resolveVerificationStatus('VERIFIED', 'ADMIN', { verificationStatus: 'REJECTED' }), 'REJECTED');
  assert.equal(resolveVerificationStatus('PENDING', 'ADMIN', { verified: true }), 'VERIFIED');
  assert.equal(resolveVerificationStatus('VERIFIED', 'ADMIN', { verified: false }), 'REJECTED');
});

test('admin writes are validated and unknown roles keep the stored value', () => {
  assert.equal(resolveVerificationStatus('PENDING', 'ADMIN', { verificationStatus: 'SUPER_VERIFIED' }), 'PENDING');
  assert.equal(resolveVerificationStatus('PENDING', 'ADMIN', { verificationStatus: 123 }), 'PENDING');
  assert.equal(resolveVerificationStatus('PENDING', 'ADMIN', { verified: 'yes' }), 'PENDING');
  assert.equal(resolveVerificationStatus('PENDING', 'ADMIN', {}), 'PENDING');
  assert.equal(resolveVerificationStatus('VERIFIED', 'VENDOR', {}), 'VERIFIED');
});