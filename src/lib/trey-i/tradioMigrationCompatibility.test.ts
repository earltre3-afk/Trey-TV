import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  new URL('../../../supabase/migrations/20260603000000_tradio_broadcast_studio_tables.sql', import.meta.url),
  'utf8',
);

test('broadcast studio table migration follows owner_user_id column established by earlier migration', () => {
  for (const table of [
    'tradio_shows',
    'tradio_show_episodes',
    'tradio_show_blocks',
    'tradio_show_scripts',
    'tradio_voice_renders',
    'tradio_station_drops',
  ]) {
    const tableBlock = migration.match(new RegExp(`create table if not exists public\\.${table} \\([\\s\\S]*?\\n\\);`));
    assert.ok(tableBlock, `missing create block for ${table}`);
    assert.match(tableBlock[0], /\bowner_user_id uuid\b/, `${table} should use owner_user_id`);
    assert.doesNotMatch(tableBlock[0], /\buser_id uuid\b/, `${table} should not recreate user_id`);
  }

  assert.doesNotMatch(migration, /idx_tradio_shows_user on public\.tradio_shows\(user_id\)/);
  assert.doesNotMatch(migration, /auth\.uid\(\) = user_id/);
  assert.doesNotMatch(migration, /\.user_id = auth\.uid\(\)/);
});
