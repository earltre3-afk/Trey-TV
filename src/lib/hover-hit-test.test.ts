import assert from 'node:assert/strict';
import test from 'node:test';
import { computeHoveredBubble } from './hover-hit-test.ts';

// Pivot is at (200, 700) for all these tests — represents the + button center.
const PIVOT_X = 200;
const PIVOT_Y = 700;

test('returns null when pointer is below pivot (dy >= 0)', () => {
  assert.equal(computeHoveredBubble(200, 720, PIVOT_X, PIVOT_Y), null);
  assert.equal(computeHoveredBubble(200, 700, PIVOT_X, PIVOT_Y), null);
});

test('returns null within dead-zone radius (< 30 px from pivot)', () => {
  // 20 px straight up
  assert.equal(computeHoveredBubble(200, 680, PIVOT_X, PIVOT_Y), null);
  // 29 px up + 0 right
  assert.equal(computeHoveredBubble(200, 671, PIVOT_X, PIVOT_Y), null);
});

test('photo bin: angle in [-90, -48) when above pivot beyond dead-zone', () => {
  // straight left + slight up — angle ≈ -90°
  assert.equal(computeHoveredBubble(100, 695, PIVOT_X, PIVOT_Y), 'photo');
  // -72° at radius 100 (well past dead-zone)
  // dx = 100 * sin(-72°) ≈ -95.1, dy = -100 * cos(-72°) ≈ -30.9
  assert.equal(computeHoveredBubble(200 - 95, 700 - 31, PIVOT_X, PIVOT_Y), 'photo');
});

test('video bin: angle in [-48, 0)', () => {
  // -24° at radius 110 → dx ≈ -44.7, dy ≈ -100.5
  assert.equal(computeHoveredBubble(200 - 45, 700 - 100, PIVOT_X, PIVOT_Y), 'video');
  // straight just-above-pivot but well past dead-zone, slightly left
  assert.equal(computeHoveredBubble(190, 600, PIVOT_X, PIVOT_Y), 'video');
});

test('story bin: angle in [0, +48)', () => {
  // +24° at radius 110 → dx ≈ +44.7, dy ≈ -100.5
  assert.equal(computeHoveredBubble(200 + 45, 700 - 100, PIVOT_X, PIVOT_Y), 'story');
  // straight just-above-pivot, slightly right
  assert.equal(computeHoveredBubble(210, 600, PIVOT_X, PIVOT_Y), 'story');
});

test('reel bin: angle in [+48, +90]', () => {
  // +72° at radius 100 → dx ≈ +95.1, dy ≈ -30.9
  assert.equal(computeHoveredBubble(200 + 95, 700 - 31, PIVOT_X, PIVOT_Y), 'reel');
  // straight right + slight up
  assert.equal(computeHoveredBubble(300, 695, PIVOT_X, PIVOT_Y), 'reel');
});

test('boundary at exactly -48° goes to video, not photo', () => {
  // -48° at radius 110 → dx ≈ -81.7, dy ≈ -73.6
  assert.equal(computeHoveredBubble(200 - 82, 700 - 74, PIVOT_X, PIVOT_Y), 'video');
});

test('boundary at exactly 0° goes to story', () => {
  // straight up, well past dead-zone
  assert.equal(computeHoveredBubble(200, 600, PIVOT_X, PIVOT_Y), 'story');
});

test('boundary at +48° (inclusive lower bound of reel bin)', () => {
  // Use exact math just past the boundary so the angle is unambiguously >= 48°.
  const rad = (48.05 * Math.PI) / 180;
  const dx = 110 * Math.sin(rad);
  const dy = -110 * Math.cos(rad);
  assert.equal(computeHoveredBubble(PIVOT_X + dx, PIVOT_Y + dy, PIVOT_X, PIVOT_Y), 'reel');
});
