import test from 'node:test';
import assert from 'node:assert/strict';
import { coerceSegmentType, validateGeneratedShow, SHOW_SEGMENT_TYPES, emptyForm } from './showPlan';

test('coerceSegmentType accepts canonical types', () => {
  for (const t of SHOW_SEGMENT_TYPES) assert.equal(coerceSegmentType(t), t);
});
test('coerceSegmentType is case-insensitive + tolerant', () => {
  assert.equal(coerceSegmentType('Music-Block'), 'music-block');
  assert.equal(coerceSegmentType('HOST-TALK'), 'host-talk');
});
test('coerceSegmentType rejects unknown', () => {
  assert.equal(coerceSegmentType('banana'), null);
  assert.equal(coerceSegmentType(42), null);
});
test('validateGeneratedShow drops invalid segments + clamps duration', () => {
  const show = validateGeneratedShow(
    { title: 'X', segments: [
      { type: 'intro', title: 'Hi', duration: 5, hostNotes: 'n', script: 's' },
      { type: 'bogus', title: 'Bad', duration: 100 },
      { type: 'music-block', title: 'Block', duration: 999999 },
    ] },
    emptyForm,
  );
  assert.equal(show.segments.length, 2);             // bogus dropped
  assert.equal(show.segments[0].duration, 15);       // clamped up to min
  assert.equal(show.segments[1].duration, 1800);     // clamped down to max
  assert.equal(show.aiGenerated, true);
});
test('validateGeneratedShow throws when no valid segments', () => {
  assert.throws(() => validateGeneratedShow({ title: 'X', segments: [{ type: 'nope', title: 'a', duration: 10 }] }, emptyForm));
});
