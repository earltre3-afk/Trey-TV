import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./MountedPlayer.tsx', import.meta.url), 'utf8');

test('mounted player uses a viewport-safe mobile width', () => {
  assert.match(source, /w-\[calc\(100vw-2rem\)\]/);
  assert.match(source, /max-w-80/);
  assert.match(source, /sm:w-80/);
  assert.doesNotMatch(source, /className="w-80\s/);
});
