-- ============================================================================
-- Migration: 20260518000100_repair_story_text_mojibake.sql
-- Purpose:   Safely repair mojibake / double-encoded UTF-8 text in the
--            interactive_story_playthroughs table.
--
-- SAFETY GUARANTEES:
--   • Only UPDATE rows where the corrupted sequences are actually present.
--   • Does NOT delete any stories.
--   • Does NOT break RLS (runs as migration, not as a user query).
--   • Does NOT require or reference profiles.age.
--   • Does NOT expose service role keys.
--   • All replacements are idempotent — safe to run more than once.
-- ============================================================================

-- Helper: replace the most common mojibake sequences in a text value.
-- These sequences arise when UTF-8 text was double-encoded as Latin-1.
CREATE OR REPLACE FUNCTION repair_story_text(t text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    -- Ellipsis … (U+2026) -> mojibake: â€¦
    replace(
    -- Left double quote " (U+201C) -> mojibake: â€œ
    replace(
    -- Right double quote " (U+201D) -> mojibake: â€
    replace(
    -- Left single quote ' (U+2018) -> mojibake: â€˜
    replace(
    -- Right single quote ' (U+2019) -> mojibake: â€™
    replace(
    -- Em dash — (U+2014) -> mojibake: â€"
    replace(
    -- En dash – (U+2013) -> mojibake: â€"  (same visual, different byte)
    replace(
    -- Bullet • (U+2022) -> mojibake: â€¢
    replace(
    -- Arrow → (U+2192) -> mojibake: â†'
    replace(
    -- Non-breaking space prefix Â\xa0 -> just NBSP
    replace(
    -- Lone Â -> remove
    replace(
    -- Replacement char -> remove
    replace(
      t,
      E'\u00e2\u20ac\u00a6', E'\u2026'   -- â€¦ -> …
    ),
      E'\u00e2\u20ac\u0153', E'\u201c'   -- â€œ -> "
    ),
      E'\u00e2\u20ac\u009d', E'\u201d'   -- â€\x9D -> "
    ),
      E'\u00e2\u20ac\u02dc', E'\u2018'   -- â€˜ -> '
    ),
      E'\u00e2\u20ac\u2122', E'\u2019'   -- â€™ -> '
    ),
      E'\u00e2\u20ac\u201d', E'\u2014'   -- â€" -> —
    ),
      E'\u00e2\u20ac\u201c', E'\u2013'   -- â€" -> –
    ),
      E'\u00e2\u20ac\u00a2', E'\u2022'   -- â€¢ -> •
    ),
      E'\u00e2\u2020\u2019', E'\u2192'   -- â†' -> →
    ),
      E'\u00c2\u00a0', E'\u00a0'         -- Â\xa0 -> NBSP
    ),
      E'\u00c2', ''                       -- lone Â -> remove
    ),
      E'\ufffd', ''                       -- replacement char -> remove
    );
$$;

-- ============================================================================
-- Repair the interactive_story_playthroughs table (if it exists).
-- The table stores playthroughs as JSONB (branch data).  We update the whole
-- branch column only when the text representation contains a known mojibake
-- sequence.  A pg-level text replacement on the jsonb cast is safe here
-- because the sequences are only in user-visible string values, not in keys
-- or structural characters.
-- ============================================================================

DO $$
DECLARE
  v_table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'interactive_story_playthroughs'
  ) INTO v_table_exists;

  IF NOT v_table_exists THEN
    RAISE NOTICE 'interactive_story_playthroughs table does not exist — skipping repair.';
    RETURN;
  END IF;

  -- Update branch JSONB: cast to text, replace mojibake, cast back to jsonb.
  -- Only touch rows that actually contain at least one corrupted sequence.
  UPDATE public.interactive_story_playthroughs
  SET branch = repair_story_text(branch::text)::jsonb
  WHERE
       branch::text LIKE E'%\u00e2\u20ac%'   -- catches most mojibake prefixes
    OR branch::text LIKE E'%\u00c2%'          -- Â artifacts
    OR branch::text LIKE E'%\ufffd%';          -- replacement char

  RAISE NOTICE 'interactive_story_playthroughs: mojibake repair complete.';
END
$$;

-- ============================================================================
-- Drop the helper function — it was only needed for this migration.
-- ============================================================================
DROP FUNCTION IF EXISTS repair_story_text(text);
