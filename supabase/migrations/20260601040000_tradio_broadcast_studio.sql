-- Migration: Tradio Broadcast Studio Pass 1 Foundation
-- Creates tables: tradio_shows, tradio_show_episodes, tradio_show_blocks, tradio_show_scripts, tradio_broadcast_slots, tradio_station_drops, tradio_ad_slots, tradio_show_analytics
-- Enables Row Level Security (RLS) on all tables and configures secure policies.

-- Create UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. tradio_shows Table
CREATE TABLE IF NOT EXISTS public.tradio_shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id TEXT,
    public_profile_uid TEXT,
    trey_tv_uid TEXT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    show_type TEXT NOT NULL DEFAULT 'artist-show',
    mood_tags TEXT[] DEFAULT '{}',
    genre_tags TEXT[] DEFAULT '{}',
    audience_tags TEXT[] DEFAULT '{}',
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    cover_art_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS tradio_shows_owner_idx ON public.tradio_shows(owner_user_id);
CREATE INDEX IF NOT EXISTS tradio_shows_status_idx ON public.tradio_shows(status);

-- 2. tradio_show_episodes Table
CREATE TABLE IF NOT EXISTS public.tradio_show_episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID NOT NULL REFERENCES public.tradio_shows(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    episode_type TEXT NOT NULL DEFAULT 'normal',
    duration_target_seconds INTEGER DEFAULT 1800,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'needs_review', 'scheduled', 'published', 'hidden', 'archived')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS tradio_episodes_show_idx ON public.tradio_show_episodes(show_id);
CREATE INDEX IF NOT EXISTS tradio_episodes_owner_idx ON public.tradio_show_episodes(owner_user_id);
CREATE INDEX IF NOT EXISTS tradio_episodes_status_idx ON public.tradio_show_episodes(status);

-- 3. tradio_show_blocks Table
CREATE TABLE IF NOT EXISTS public.tradio_show_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID NOT NULL REFERENCES public.tradio_show_episodes(id) ON DELETE CASCADE,
    show_id UUID NOT NULL REFERENCES public.tradio_shows(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL CHECK (block_type IN ('intro', 'station_drop', 'voiceover', 'song', 'ad', 'interview', 'producer_spotlight', 'artist_spotlight', 'submission_block', 'silence', 'transition', 'outro')),
    title TEXT NOT NULL,
    description TEXT,
    script_text TEXT,
    media_url TEXT,
    asset_id TEXT,
    start_time_seconds INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 120,
    sort_order INTEGER NOT NULL DEFAULT 0,
    volume_level NUMERIC DEFAULT 1.0,
    fade_in_seconds NUMERIC DEFAULT 1.5,
    fade_out_seconds NUMERIC DEFAULT 1.5,
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    rights_status TEXT NOT NULL DEFAULT 'unclear' CHECK (rights_status IN ('tradio_native', 'creator_owned', 'approved_submission', 'licensed_catalog', 'unclear')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tradio_blocks_episode_idx ON public.tradio_show_blocks(episode_id);
CREATE INDEX IF NOT EXISTS tradio_blocks_show_idx ON public.tradio_show_blocks(show_id);

-- 4. tradio_show_scripts Table
CREATE TABLE IF NOT EXISTS public.tradio_show_scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID NOT NULL REFERENCES public.tradio_show_episodes(id) ON DELETE CASCADE,
    block_id UUID REFERENCES public.tradio_show_blocks(id) ON DELETE SET NULL,
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    script_type TEXT NOT NULL DEFAULT 'voiceover',
    prompt_input TEXT,
    script_text TEXT NOT NULL,
    revision_number INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'deprecated')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tradio_scripts_episode_idx ON public.tradio_show_scripts(episode_id);

-- 5. tradio_broadcast_slots Table
CREATE TABLE IF NOT EXISTS public.tradio_broadcast_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID NOT NULL REFERENCES public.tradio_shows(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES public.tradio_show_episodes(id) ON DELETE SET NULL,
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    recurrence_rule TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_times CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS tradio_slots_show_idx ON public.tradio_broadcast_slots(show_id);

-- 6. tradio_station_drops Table
CREATE TABLE IF NOT EXISTS public.tradio_station_drops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    show_id UUID REFERENCES public.tradio_shows(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    script_text TEXT NOT NULL,
    audio_url TEXT,
    voice_provider TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. tradio_ad_slots Table
CREATE TABLE IF NOT EXISTS public.tradio_ad_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID REFERENCES public.tradio_shows(id) ON DELETE SET NULL,
    episode_id UUID REFERENCES public.tradio_show_episodes(id) ON DELETE SET NULL,
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sponsor_name TEXT,
    script_text TEXT,
    media_url TEXT,
    slot_position TEXT NOT NULL DEFAULT 'mid-roll',
    duration_seconds INTEGER DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'empty' CHECK (status IN ('pending', 'filled', 'empty')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. tradio_show_analytics Table
CREATE TABLE IF NOT EXISTS public.tradio_show_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID NOT NULL REFERENCES public.tradio_shows(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES public.tradio_show_episodes(id) ON DELETE SET NULL,
    listens INTEGER DEFAULT 0,
    unique_listeners INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    replays INTEGER DEFAULT 0,
    skips INTEGER DEFAULT 0,
    completion_rate NUMERIC,
    avg_listen_seconds NUMERIC,
    segment_retention JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tradio_analytics_show_idx ON public.tradio_show_analytics(show_id);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES SETUP
-- ==========================================

-- Enable RLS on all 8 tables
ALTER TABLE public.tradio_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradio_show_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradio_show_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradio_show_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradio_broadcast_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradio_station_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradio_ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradio_show_analytics ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- Helper to determine if current user is admin
-- ------------------------------------------
CREATE OR REPLACE FUNCTION public.is_tradio_admin_or_owner()
RETURNS BOOLEAN AS $$
BEGIN
  -- Simple check: if there is a tradio_user_roles table, check if the authenticated user's role is 'admin' or 'owner'
  -- Otherwise fallback to auth checking.
  RETURN EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tradio_user_roles'
  ) AND EXISTS (
    SELECT 1 FROM public.tradio_user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ------------------------------------------
-- 1. tradio_shows Policies
-- ------------------------------------------

-- PUBLIC READ: Anyone can read published + public shows
CREATE POLICY "Public read published shows" ON public.tradio_shows
    FOR SELECT USING (status = 'published' AND visibility = 'public');

-- OWNER ACCESS: Owners have full control over their shows
CREATE POLICY "Owner shows manage" ON public.tradio_shows
    USING (auth.uid() = owner_user_id OR public.is_tradio_admin_or_owner());


-- ------------------------------------------
-- 2. tradio_show_episodes Policies
-- ------------------------------------------

-- PUBLIC READ: Anyone can read published + public episodes
CREATE POLICY "Public read published episodes" ON public.tradio_show_episodes
    FOR SELECT USING (status = 'published' AND visibility = 'public');

-- OWNER ACCESS: Owners have full control over their episodes
CREATE POLICY "Owner episodes manage" ON public.tradio_show_episodes
    USING (auth.uid() = owner_user_id OR public.is_tradio_admin_or_owner());


-- ------------------------------------------
-- 3. tradio_show_blocks Policies
-- ------------------------------------------

-- PUBLIC READ: Read blocks only if their parent episode is public & published
CREATE POLICY "Public read blocks of public published episodes" ON public.tradio_show_blocks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tradio_show_episodes ep
            WHERE ep.id = episode_id AND ep.status = 'published' AND ep.visibility = 'public'
        )
    );

-- OWNER ACCESS: Full control over owned blocks
CREATE POLICY "Owner blocks manage" ON public.tradio_show_blocks
    USING (auth.uid() = owner_user_id OR public.is_tradio_admin_or_owner());


-- ------------------------------------------
-- 4. tradio_show_scripts Policies
-- ------------------------------------------

-- OWNER ACCESS Only (Scripts are sensitive / proprietary creator drafts)
CREATE POLICY "Owner scripts manage" ON public.tradio_show_scripts
    USING (auth.uid() = owner_user_id OR public.is_tradio_admin_or_owner());


-- ------------------------------------------
-- 5. tradio_broadcast_slots Policies
-- ------------------------------------------

-- PUBLIC READ: Slots for scheduled public programs
CREATE POLICY "Public read slots" ON public.tradio_broadcast_slots
    FOR SELECT USING (visibility = 'public');

-- OWNER ACCESS: Slots management
CREATE POLICY "Owner slots manage" ON public.tradio_broadcast_slots
    USING (auth.uid() = owner_user_id OR public.is_tradio_admin_or_owner());


-- ------------------------------------------
-- 6. tradio_station_drops Policies
-- ------------------------------------------

-- PUBLIC READ: Active reusable station drops
CREATE POLICY "Public read active drops" ON public.tradio_station_drops
    FOR SELECT USING (status = 'active');

-- OWNER ACCESS: Drops management
CREATE POLICY "Owner drops manage" ON public.tradio_station_drops
    USING (auth.uid() = owner_user_id OR public.is_tradio_admin_or_owner());


-- ------------------------------------------
-- 7. tradio_ad_slots Policies
-- ------------------------------------------

-- OWNER ACCESS: Ads management
CREATE POLICY "Owner ads manage" ON public.tradio_ad_slots
    USING (auth.uid() = owner_user_id OR public.is_tradio_admin_or_owner());


-- ------------------------------------------
-- 8. tradio_show_analytics Policies
-- ------------------------------------------

-- OWNER / ADMINS Only: Sensitive dashboard analytics data
CREATE POLICY "Owner analytics read" ON public.tradio_show_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tradio_shows s
            WHERE s.id = show_id AND s.owner_user_id = auth.uid()
        ) OR public.is_tradio_admin_or_owner()
    );
