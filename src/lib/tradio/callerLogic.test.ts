import test from 'node:test';
import assert from 'node:assert/strict';
import { nextCallerStatus, resolveCallerPublish } from './callerLogic.ts';

test('pending -> on_air via take', () => {
  assert.equal(nextCallerStatus('pending', 'take'), 'on_air');
});
test('on_air -> ended via disconnect', () => {
  assert.equal(nextCallerStatus('on_air', 'disconnect'), 'ended');
});
test('pending -> ended via decline', () => {
  assert.equal(nextCallerStatus('pending', 'decline'), 'ended');
});
test('illegal transition keeps current status', () => {
  assert.equal(nextCallerStatus('ended', 'take' as never), 'ended');
});
test('only an on_air caller in a live session may publish', () => {
  assert.equal(resolveCallerPublish({ status: 'on_air', sessionStatus: 'live' }), true);
  assert.equal(resolveCallerPublish({ status: 'pending', sessionStatus: 'live' }), false);
  assert.equal(resolveCallerPublish({ status: 'on_air', sessionStatus: 'ended' }), false);
});
