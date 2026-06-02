import test from 'node:test';
import assert from 'node:assert/strict';
import { cumulativeStarts, pacingState, shouldAdvance } from './showRundown.ts';

const segs = [{ duration: 60 }, { duration: 120 }, { duration: 30 }];

test('cumulative start offsets', () => {
  assert.deepEqual(cumulativeStarts(segs), [0, 60, 180]);
});
test('shouldAdvance when elapsed reaches segment duration', () => {
  assert.equal(shouldAdvance({ segments: segs, currentIndex: 0, elapsedInSegment: 60 }), true);
  assert.equal(shouldAdvance({ segments: segs, currentIndex: 0, elapsedInSegment: 59 }), false);
});
test('shouldAdvance false on last segment', () => {
  assert.equal(shouldAdvance({ segments: segs, currentIndex: 2, elapsedInSegment: 999 }), false);
});
test('pacing on-time when wall matches plan', () => {
  const p = pacingState({ segments: segs, currentIndex: 1, elapsedInSegment: 0, wallElapsed: 60 });
  assert.equal(p.status, 'on-time');
  assert.equal(p.deltaSeconds, 0);
});
test('pacing behind when wall exceeds plan', () => {
  const p = pacingState({ segments: segs, currentIndex: 1, elapsedInSegment: 30, wallElapsed: 120 });
  assert.equal(p.status, 'behind');
  assert.equal(p.deltaSeconds, 30);
});
test('pacing ahead when wall is under plan', () => {
  const p = pacingState({ segments: segs, currentIndex: 1, elapsedInSegment: 0, wallElapsed: 40 });
  assert.equal(p.status, 'ahead');
  assert.equal(p.deltaSeconds, -20);
});
