import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  new URL(
    '../../../supabase/migrations/20260612000000_tradio_campaign_intelligence.sql',
    import.meta.url,
  ),
  'utf8',
);

test('campaign metrics migration follows every referenced Tradio table migration', () => {
  const migrationsDirectory = new URL('../../../supabase/migrations/', import.meta.url);
  const migrations = readdirSync(migrationsDirectory).sort();
  const campaignIndex = migrations.indexOf(
    '20260612000000_tradio_campaign_intelligence.sql',
  );

  assert.ok(campaignIndex > migrations.indexOf('20260610000001_tradio_post_show_producer.sql'));
  assert.ok(campaignIndex > migrations.indexOf('20260611000000_tradio_post_show_publisher.sql'));
});

test('campaign metrics migration creates a constrained private ledger', () => {
  assert.match(
    migration,
    /create table if not exists public\.tradio_campaign_metrics/i,
  );
  assert.match(
    migration,
    /owner_user_id uuid not null references auth\.users\(id\) on delete cascade/i,
  );
  assert.match(
    migration,
    /metric_source text not null default 'tradio' check\s*\(/i,
  );
  assert.match(migration, /'creator_manual'/);
  assert.match(migration, /'distribution_desk'/);
  assert.match(migration, /metric_type text not null check\s*\(/i);
  assert.match(migration, /'manual_views'/);
  assert.match(migration, /'clip_play'/);
  assert.match(migration, /metric_value numeric not null default 0 check \(metric_value >= 0\)/i);
});

test('campaign metrics migration enables RLS with no anonymous raw access', () => {
  assert.match(
    migration,
    /alter table public\.tradio_campaign_metrics enable row level security/i,
  );
  assert.match(
    migration,
    /grant select, insert, update, delete on public\.tradio_campaign_metrics to authenticated/i,
  );
  assert.match(
    migration,
    /grant all on public\.tradio_campaign_metrics to service_role/i,
  );
  assert.doesNotMatch(
    migration,
    /grant\s+.+\s+on\s+public\.tradio_campaign_metrics\s+to\s+anon/i,
  );
  assert.doesNotMatch(migration, /auth\.role\(\)/i);
});

test('campaign metrics policies scope creator writes and allow admin reads only', () => {
  assert.match(
    migration,
    /create policy "Creators can read own campaign metrics"[\s\S]*?for select[\s\S]*?to authenticated[\s\S]*?using \(\(select auth\.uid\(\)\) = owner_user_id\)/i,
  );
  assert.match(
    migration,
    /create policy "Creators can create own manual campaign metrics"[\s\S]*?for insert[\s\S]*?to authenticated[\s\S]*?entered_manually = true[\s\S]*?metric_source = 'creator_manual'/i,
  );
  assert.match(
    migration,
    /create policy "Creators can update own manual campaign metrics"[\s\S]*?for update[\s\S]*?using \([\s\S]*?owner_user_id[\s\S]*?entered_manually = true[\s\S]*?\)[\s\S]*?with check \([\s\S]*?owner_user_id[\s\S]*?metric_source = 'creator_manual'/i,
  );
  const updatePolicy = migration.match(
    /create policy "Creators can update own manual campaign metrics"([\s\S]*?)create policy "Creators can delete own manual campaign metrics"/i,
  )?.[1];
  assert.ok(updatePolicy);
  for (const table of [
    'tradio_broadcast_channels',
    'tradio_live_highlight_clips',
    'tradio_live_recordings',
    'tradio_post_show_assets',
    'tradio_post_show_applications',
    'tradio_distribution_drafts',
  ]) {
    assert.match(updatePolicy, new RegExp(`from public\\.${table}`, 'i'));
  }
  assert.match(
    migration,
    /create policy "Admins can read all campaign metrics"[\s\S]*?for select[\s\S]*?using \(public\.is_admin\(\(select auth\.uid\(\)\)\)\)/i,
  );
});

test('campaign metrics migration adds owner, entity, and reporting indexes', () => {
  assert.match(migration, /idx_tradio_campaign_metrics_owner/i);
  assert.match(migration, /idx_tradio_campaign_metrics_channel/i);
  assert.match(migration, /idx_tradio_campaign_metrics_clip/i);
  assert.match(migration, /idx_tradio_campaign_metrics_draft/i);
  assert.match(migration, /idx_tradio_campaign_metrics_reporting/i);
});
