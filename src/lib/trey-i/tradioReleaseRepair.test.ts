import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const repoRoot = join(import.meta.dirname, '..', '..', '..');
const migrationDir = join(repoRoot, 'supabase', 'migrations');
const migrationFiles = readdirSync(migrationDir).filter((file) => file.endsWith('.sql'));
const repairFile = migrationFiles.find((file) =>
  file.endsWith('_tradio_release_schema_auth_rls_repair.sql'),
);
const repairSql = repairFile
  ? readFileSync(join(migrationDir, repairFile), 'utf8')
  : '';

test('Tradio migrations have unique version prefixes', () => {
  const versions = new Map<string, string[]>();
  for (const file of migrationFiles) {
    const version = file.match(/^(\d+)_/)?.[1];
    if (!version) continue;
    versions.set(version, [...(versions.get(version) ?? []), file]);
  }

  const duplicates = [...versions.entries()].filter(([, files]) => files.length > 1);
  assert.deepEqual(duplicates, []);
});

test('release repair migration normalizes schema and replaces unsafe public policies', () => {
  assert.ok(repairFile, 'missing Tradio release repair migration');
  assert.match(repairSql, /add column if not exists owner_user_id uuid/i);
  assert.match(repairSql, /add column if not exists visibility text/i);
  assert.match(repairSql, /drop policy if exists "tradio_shows_select"/i);
  assert.match(repairSql, /drop policy if exists "tradio_show_scripts_select"/i);
  assert.match(repairSql, /drop policy if exists "tradio_ad_slots_select"/i);
  assert.match(
    repairSql,
    /create policy "tradio_shows_public_select"[\s\S]*?to anon, authenticated[\s\S]*?status = 'published'[\s\S]*?visibility = 'public'/i,
  );
  assert.match(
    repairSql,
    /create policy "tradio_show_scripts_owner_admin_select"[\s\S]*?to authenticated[\s\S]*?owner_user_id[\s\S]*?is_admin/i,
  );
  assert.doesNotMatch(repairSql, /using\s*\(\s*true\s*\)/i);
  assert.doesNotMatch(repairSql, /auth\.role\s*\(/i);
});

test('public clip policy requires both published status and public visibility', () => {
  assert.match(
    repairSql,
    /create policy "Public clips visible to all"[\s\S]*?to anon[\s\S]*?visibility = 'public'[\s\S]*?clip_status = 'published'/i,
  );
  assert.doesNotMatch(
    repairSql,
    /create policy "Public clips visible to all"[\s\S]*?to anon, authenticated/i,
  );
});

test('Tradio service-role server modules never resolve a caller without a token', () => {
  const serverFiles = [
    'broadcastDistribution.server.ts',
    'broadcastLiveArchive.server.ts',
    'broadcastPostShow.server.ts',
    'broadcastPostShowPublisher.server.ts',
  ];

  for (const file of serverFiles) {
    const source = readFileSync(join(import.meta.dirname, file), 'utf8');
    assert.doesNotMatch(
      source,
      /\.auth\.getUser\(\s*\)/,
      `${file} still calls auth.getUser without an access token`,
    );
  }
});

test('clip mutations cannot bypass publishing gates', () => {
  const source = readFileSync(
    join(import.meta.dirname, 'broadcastLiveArchive.server.ts'),
    'utf8',
  );

  assert.match(
    source,
    /updateHighlightClipServer[\s\S]*?Publishing must use the gated publish flow/,
  );
  assert.match(
    source,
    /input\.clip_status !== undefined && input\.clip_status !== 'draft'/,
  );
  assert.match(
    source,
    /clip\.clip_status !== 'published' \|\| clip\.visibility !== 'public'/,
  );
});

test('public replay clip projection excludes private fields', () => {
  const source = readFileSync(
    join(import.meta.dirname, 'broadcastPublicReplayRules.ts'),
    'utf8',
  );
  const privateFields = [
    'owner_user_id',
    'prompt_input',
    'source_snapshot',
    'moderation_snapshot',
    'storage_path',
    'consent_snapshot',
    'rights_snapshot',
    'review_notes',
    'metadata',
  ];

  const columns = source.match(
    /PUBLIC_REPLAY_CLIP_COLUMNS\s*=\s*\[([\s\S]*?)\]\.join/,
  )?.[1] ?? '';
  for (const field of privateFields) {
    assert.doesNotMatch(columns, new RegExp(`['"]${field}['"]`));
  }
});
