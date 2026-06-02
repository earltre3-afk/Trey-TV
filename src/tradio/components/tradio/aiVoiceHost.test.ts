import test from 'node:test';
import assert from 'node:assert/strict';
import { talkSegmentsWithScript } from './aiVoiceHost';
import type { RadioShow } from './data';

const show = {
  segments: [
    { id: '1', type: 'intro', title: 'Intro', duration: 60, script: 'Welcome in.' },
    { id: '2', type: 'music-block', title: 'Block', duration: 300, script: '' },
    { id: '3', type: 'host-talk', title: 'Talk', duration: 90, script: 'Here is the vibe.' },
    { id: '4', type: 'closing', title: 'Close', duration: 60 },                 // no script
    { id: '5', type: 'commercial', title: 'Ad', duration: 30, script: 'buy' },  // non-talk type
  ],
} as unknown as RadioShow;

test('returns only talk segments with a non-empty script', () => {
  const out = talkSegmentsWithScript(show);
  assert.deepEqual(out.map((s) => s.id), ['1', '3']);
});
test('handles null/empty show', () => {
  assert.deepEqual(talkSegmentsWithScript(null), []);
  assert.deepEqual(talkSegmentsWithScript({ segments: [] } as unknown as RadioShow), []);
});
