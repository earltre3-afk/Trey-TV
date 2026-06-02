import test from 'node:test';
import assert from 'node:assert/strict';
import { computePollTallies, nextRequestStatus, type PollOption } from './liveInteractionLogic';

const opts: PollOption[] = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }];

test('computePollTallies counts votes + percentages', () => {
  const t = computePollTallies(opts, [{ option_id: 'a' }, { option_id: 'a' }, { option_id: 'b' }]);
  assert.deepEqual(t, [
    { optionId: 'a', label: 'A', count: 2, pct: 67 },
    { optionId: 'b', label: 'B', count: 1, pct: 33 },
  ]);
});
test('computePollTallies with no votes is 0%', () => {
  const t = computePollTallies(opts, []);
  assert.deepEqual(t.map((x) => x.pct), [0, 0]);
});
test('nextRequestStatus allows valid transitions', () => {
  assert.equal(nextRequestStatus('pending', 'queue'), 'queued');
  assert.equal(nextRequestStatus('pending', 'decline'), 'declined');
  assert.equal(nextRequestStatus('queued', 'play'), 'played');
  assert.equal(nextRequestStatus('queued', 'decline'), 'declined');
});
test('nextRequestStatus rejects invalid transitions', () => {
  assert.equal(nextRequestStatus('played', 'queue'), null);
  assert.equal(nextRequestStatus('declined', 'play'), null);
});
