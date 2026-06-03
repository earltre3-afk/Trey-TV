-- TRANCE Database Initialization Migration
-- Phase 1 Production Backend Schema
-- Created: 2026-06-02

-- 1. EXTENSIONS & FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. CORE IDENTITY TABLES
CREATE TABLE trance_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    handle varchar(255) UNIQUE NOT NULL,
    display_name varchar(255) NOT NULL,
    avatar text,
    cover text,
    bio text,
    verified boolean DEFAULT false NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    xp integer DEFAULT 0 NOT NULL,
    xp_to_next integer DEFAULT 1000 NOT NULL,
    rank_title varchar(255) DEFAULT 'Rookie Trancer' NOT NULL,
    day_streak integer DEFAULT 0 NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    routines_mastered integer DEFAULT 0 NOT NULL,
    global_rank integer,
    trance_energy integer DEFAULT 100 NOT NULL,
    member_number serial NOT NULL,
    roles text[] DEFAULT '{"dancer"}'::text[] NOT NULL,
    permissions text[] DEFAULT '{"browse_public_routines", "practice_routines", "view_own_scores", "join_studio_rooms"}'::text[] NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT chk_roles CHECK (roles <@ ARRAY['listener/viewer', 'dancer', 'choreographer', 'studio_owner', 'studio_admin', 'studio_member', 'producer/team_helper', 'admin', 'owner']::text[])
);

CREATE TRIGGER update_trance_profiles_updated_at
    BEFORE UPDATE ON trance_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE trance_choreographer_profiles (
    id uuid PRIMARY KEY REFERENCES trance_profiles(id) ON DELETE CASCADE,
    tagline varchar(255) NOT NULL,
    cover text,
    sessions_count integer DEFAULT 0 NOT NULL,
    students_count integer DEFAULT 0 NOT NULL,
    plays_count integer DEFAULT 0 NOT NULL,
    quote text,
    moderation_status varchar(50) DEFAULT 'approved' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT chk_choreo_mod CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'rejected'))
);

CREATE TABLE trance_studio_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES trance_profiles(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    handle varchar(255) UNIQUE NOT NULL,
    avatar text,
    cover text,
    bio text,
    verified boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE trance_studio_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id uuid NOT NULL REFERENCES trance_studio_profiles(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES trance_profiles(id) ON DELETE CASCADE,
    role varchar(50) DEFAULT 'studio_member' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT uq_studio_user UNIQUE (studio_id, user_id),
    CONSTRAINT chk_membership_role CHECK (role IN ('studio_owner', 'studio_admin', 'studio_member'))
);

CREATE TABLE trance_studio_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id uuid NOT NULL REFERENCES trance_studio_profiles(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    cover text,
    locked boolean DEFAULT true NOT NULL,
    capacity integer DEFAULT 12 NOT NULL,
    status varchar(50) DEFAULT 'OPEN' NOT NULL,
    tagline varchar(255) NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT chk_room_status CHECK (status IN ('LIVE', 'LOCKED', 'OPEN'))
);

-- 3. ROUTINES & CHOREOGRAPHY TABLES
CREATE TABLE trance_routines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    tagline varchar(255) NOT NULL,
    cover text NOT NULL,
    choreographer_id uuid NOT NULL REFERENCES trance_choreographer_profiles(id) ON DELETE CASCADE,
    choreographer_name varchar(255) NOT NULL,
    choreographer_verified boolean DEFAULT false NOT NULL,
    style varchar(100) NOT NULL,
    difficulty varchar(50) NOT NULL,
    energy varchar(50) NOT NULL,
    duration_sec integer NOT NULL,
    bpm integer NOT NULL,
    formation varchar(50) DEFAULT 'Solo' NOT NULL,
    plays integer DEFAULT 0 NOT NULL,
    saves integer DEFAULT 0 NOT NULL,
    students integer DEFAULT 0 NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    trending_rank integer,
    visibility varchar(50) DEFAULT 'Public' NOT NULL,
    moderation_status varchar(50) DEFAULT 'approved' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT chk_routine_difficulty CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'Elite')),
    CONSTRAINT chk_routine_energy CHECK (energy IN ('Chill', 'Medium', 'High', 'Explosive')),
    CONSTRAINT chk_routine_visibility CHECK (visibility IN ('Public', 'Private', 'Studio-only', 'Link-only')),
    CONSTRAINT chk_routine_mod CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'rejected'))
);

CREATE TRIGGER update_trance_routines_updated_at
    BEFORE UPDATE ON trance_routines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE trance_routine_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id uuid NOT NULL REFERENCES trance_routines(id) ON DELETE CASCADE,
    asset_type varchar(50) NOT NULL,
    url text NOT NULL,
    size_bytes bigint NOT NULL,
    mime_type varchar(100) NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT chk_asset_type CHECK (asset_type IN ('full_video', 'preview', 'mirror', 'thumbnail'))
);

CREATE TABLE trance_count_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id uuid NOT NULL REFERENCES trance_routines(id) ON DELETE CASCADE,
    index integer NOT NULL,
    label varchar(255) NOT NULL,
    counts varchar(50) NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE trance_move_hints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id uuid NOT NULL REFERENCES trance_routines(id) ON DELETE CASCADE,
    timestamp varchar(50) NOT NULL,
    label varchar(255) NOT NULL,
    description text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE trance_direction_cues (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id uuid NOT NULL REFERENCES trance_routines(id) ON DELETE CASCADE,
    timestamp varchar(50) NOT NULL,
    direction varchar(50) NOT NULL,
    facing varchar(50) NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT chk_direction CHECK (direction IN ('up', 'down', 'left', 'right', 'up-right', 'up-left'))
);

CREATE TABLE trance_scoring_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id uuid NOT NULL REFERENCES trance_routines(id) ON DELETE CASCADE,
    weight_timing integer NOT NULL,
    weight_execution integer NOT NULL,
    weight_energy integer NOT NULL,
    weight_precision integer NOT NULL,
    weight_creativity integer NOT NULL,
    scale varchar(100) DEFAULT '0 - 100 Points' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 4. SESSIONS & RESULTS TABLES
CREATE TABLE trance_dance_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id uuid NOT NULL REFERENCES trance_routines(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES trance_profiles(id) ON DELETE CASCADE,
    mode varchar(50) NOT NULL,
    progress numeric DEFAULT 0.0 NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT chk_session_mode CHECK (mode IN ('Learn', 'Practice', 'Performance'))
);

CREATE TABLE trance_session_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id uuid NOT NULL REFERENCES trance_routines(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES trance_profiles(id) ON DELETE CASCADE,
    mode varchar(50) NOT NULL,
    status varchar(50) DEFAULT 'draft' NOT NULL,
    video_url text,
    pose_data_url text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT chk_attempt_mode CHECK (mode IN ('Learn', 'Practice', 'Performance')),
    CONSTRAINT chk_attempt_status CHECK (status IN ('draft', 'uploading', 'uploaded', 'processing', 'needs_review', 'ready', 'published', 'failed', 'archived'))
);

CREATE TRIGGER update_trance_session_attempts_updated_at
    BEFORE UPDATE ON trance_session_attempts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE trance_session_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id uuid NOT NULL REFERENCES trance_session_attempts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES trance_profiles(id) ON DELETE CASCADE,
    routine_id uuid NOT NULL REFERENCES trance_routines(id) ON DELETE CASCADE,
    total numeric NOT NULL,
    accuracy numeric NOT NULL,
    timing numeric NOT NULL,
    energy numeric NOT NULL,
    sync numeric NOT NULL,
    rank varchar(50) NOT NULL,
    is_pb boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE trance_pose_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id uuid NOT NULL REFERENCES trance_session_attempts(id) ON DELETE CASCADE,
    match_pct numeric NOT NULL,
    strengths text[] DEFAULT '{}'::text[] NOT NULL,
    missed_steps jsonb DEFAULT '[]'::jsonb NOT NULL,
    focus_areas text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE trance_leaderboard_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id uuid NOT NULL REFERENCES trance_routines(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES trance_profiles(id) ON DELETE CASCADE,
    score integer NOT NULL,
    accuracy numeric NOT NULL,
    streak integer DEFAULT 0 NOT NULL,
    badge_tier varchar(50) NOT NULL,
    anti_cheat_status varchar(50) DEFAULT 'passed' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT uq_routine_user_leaderboard UNIQUE (routine_id, user_id),
    CONSTRAINT chk_badge_tier CHECK (badge_tier IN ('gold', 'purple', 'cyan', 'magenta')),
    CONSTRAINT chk_anti_cheat CHECK (anti_cheat_status IN ('passed', 'flagged', 'auditing', 'rejected'))
);

CREATE TRIGGER update_trance_leaderboard_entries_updated_at
    BEFORE UPDATE ON trance_leaderboard_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. REWARDS, AUDITS & SYSTEM TABLES
CREATE TABLE trance_badges (
    id varchar(255) PRIMARY KEY,
    name varchar(255) NOT NULL,
    description text NOT NULL,
    tier varchar(50) NOT NULL,
    icon varchar(255) NOT NULL,
    CONSTRAINT chk_badge_tier_type CHECK (tier IN ('gold', 'purple', 'cyan', 'magenta', 'locked'))
);

CREATE TABLE trance_badge_awards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES trance_profiles(id) ON DELETE CASCADE,
    badge_id varchar(255) NOT NULL REFERENCES trance_badges(id) ON DELETE CASCADE,
    tx_hash varchar(255),
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

CREATE TABLE trance_rehearsal_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id uuid NOT NULL REFERENCES trance_studio_profiles(id) ON DELETE CASCADE,
    room_id uuid NOT NULL REFERENCES trance_studio_rooms(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    focus text NOT NULL,
    due_date timestamptz NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE trance_teacher_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id uuid NOT NULL REFERENCES trance_studio_profiles(id) ON DELETE CASCADE,
    room_id uuid NOT NULL REFERENCES trance_studio_rooms(id) ON DELETE CASCADE,
    choreographer_id uuid NOT NULL REFERENCES trance_profiles(id) ON DELETE CASCADE,
    comment text NOT NULL,
    audio_url text,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE trance_processing_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id uuid NOT NULL REFERENCES trance_routine_assets(id) ON DELETE CASCADE,
    status varchar(50) DEFAULT 'processing' NOT NULL,
    progress_pct integer DEFAULT 0 NOT NULL,
    error_msg text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT chk_job_status CHECK (status IN ('draft', 'uploading', 'uploaded', 'processing', 'needs_review', 'ready', 'published', 'failed', 'archived'))
);

CREATE TRIGGER update_trance_processing_jobs_updated_at
    BEFORE UPDATE ON trance_processing_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE trance_moderation_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type varchar(50) NOT NULL,
    target_id uuid NOT NULL,
    reporter_id uuid REFERENCES trance_profiles(id) ON DELETE SET NULL,
    reason text NOT NULL,
    status varchar(50) DEFAULT 'pending' NOT NULL,
    moderated_by uuid REFERENCES trance_profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT chk_mod_target CHECK (target_type IN ('routine', 'attempt', 'user')),
    CONSTRAINT chk_mod_status CHECK (status IN ('pending', 'approved', 'flagged', 'rejected'))
);

CREATE TABLE trance_follows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id uuid NOT NULL REFERENCES trance_profiles(id) ON DELETE CASCADE,
    choreographer_id uuid NOT NULL REFERENCES trance_profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT uq_follower_choreographer UNIQUE (follower_id, choreographer_id)
);

CREATE TABLE trance_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES trance_profiles(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    body text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE trance_analytics_events (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES trance_profiles(id) ON DELETE SET NULL,
    event_name varchar(255) NOT NULL,
    meta_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    environment varchar(50) DEFAULT 'production' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);


-- 6. INDEXES FOR PRODUCTION QUERY PATHS
CREATE INDEX idx_trance_profiles_handle ON trance_profiles (handle);
CREATE INDEX idx_trance_profiles_global_rank ON trance_profiles (global_rank);
CREATE INDEX idx_choreo_moderation ON trance_choreographer_profiles (moderation_status);
CREATE INDEX idx_studios_owner ON trance_studio_profiles (owner_id);
CREATE INDEX idx_studio_member_composite ON trance_studio_memberships (studio_id, user_id);
CREATE INDEX idx_rooms_studio ON trance_studio_rooms (studio_id);
CREATE INDEX idx_routines_style_difficulty ON trance_routines (style, difficulty);
CREATE INDEX idx_routines_choreo ON trance_routines (choreographer_id);
CREATE INDEX idx_routines_visibility ON trance_routines (visibility);
CREATE INDEX idx_attempts_user_routine ON trance_session_attempts (user_id, routine_id);
CREATE INDEX idx_scores_routine_total ON trance_session_scores (routine_id, total DESC);
CREATE INDEX idx_leaderboard_routine_score ON trance_leaderboard_entries (routine_id, score DESC, anti_cheat_status);
CREATE INDEX idx_awards_user ON trance_badge_awards (user_id);
CREATE INDEX idx_jobs_status ON trance_processing_jobs (status);
CREATE INDEX idx_mod_status ON trance_moderation_events (status);
CREATE INDEX idx_notifications_user_read ON trance_notifications (user_id, read);
CREATE INDEX idx_analytics_event ON trance_analytics_events (event_name, created_at DESC);


-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE trance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_choreographer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_studio_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_studio_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_studio_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_routine_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_count_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_move_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_direction_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_dance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_session_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_session_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_pose_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_badge_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_rehearsal_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_teacher_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trance_analytics_events ENABLE ROW LEVEL SECURITY;

-- Profile Policies
CREATE POLICY "Public profile view" ON trance_profiles FOR SELECT USING (true);
CREATE POLICY "Self profile update" ON trance_profiles FOR UPDATE USING (auth.uid() = id);

-- Choreographer Policies
CREATE POLICY "Public choreographer view" ON trance_choreographer_profiles FOR SELECT USING (true);
CREATE POLICY "Choreographer self manage" ON trance_choreographer_profiles FOR ALL USING (auth.uid() = id);

-- Studio Policies
CREATE POLICY "Studio profiles view by members" ON trance_studio_profiles FOR SELECT USING (
    owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM trance_studio_memberships
        WHERE studio_id = trance_studio_profiles.id AND user_id = auth.uid()
    )
);
CREATE POLICY "Studio manage by owner" ON trance_studio_profiles FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Membership view by members" ON trance_studio_memberships FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM trance_studio_memberships m
        WHERE m.studio_id = trance_studio_memberships.studio_id AND m.user_id = auth.uid() AND m.role IN ('studio_owner', 'studio_admin')
    )
);
CREATE POLICY "Membership manage by studio admin" ON trance_studio_memberships FOR ALL USING (
    EXISTS (
        SELECT 1 FROM trance_studio_memberships m
        WHERE m.studio_id = trance_studio_memberships.studio_id AND m.user_id = auth.uid() AND m.role IN ('studio_owner', 'studio_admin')
    )
);

CREATE POLICY "Studio room view by members" ON trance_studio_rooms FOR SELECT USING (
    locked = false OR EXISTS (
        SELECT 1 FROM trance_studio_memberships
        WHERE studio_id = trance_studio_rooms.studio_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Studio room manage by admin" ON trance_studio_rooms FOR ALL USING (
    EXISTS (
        SELECT 1 FROM trance_studio_memberships
        WHERE studio_id = trance_studio_rooms.studio_id AND user_id = auth.uid() AND role IN ('studio_owner', 'studio_admin')
    )
);

-- Routines Policies
CREATE POLICY "Routine select policy" ON trance_routines FOR SELECT USING (
    visibility = 'Public' 
    OR choreographer_id = auth.uid()
    OR (visibility = 'Studio-only' AND EXISTS (
        SELECT 1 FROM trance_studio_memberships m
        JOIN trance_studio_profiles s ON m.studio_id = s.id
        WHERE s.owner_id = trance_routines.choreographer_id AND m.user_id = auth.uid()
    ))
);
CREATE POLICY "Routine manage by choreographer" ON trance_routines FOR ALL USING (choreographer_id = auth.uid());

CREATE POLICY "Routine assets view" ON trance_routine_assets FOR SELECT USING (
    EXISTS (SELECT 1 FROM trance_routines r WHERE r.id = routine_id)
);
CREATE POLICY "Routine assets manage" ON trance_routine_assets FOR ALL USING (
    EXISTS (SELECT 1 FROM trance_routines r WHERE r.id = routine_id AND r.choreographer_id = auth.uid())
);

-- Count Sections, Move Hints, Direction Cues, Scoring Rules Policies
CREATE POLICY "Counts view" ON trance_count_sections FOR SELECT USING (EXISTS (SELECT 1 FROM trance_routines r WHERE r.id = routine_id));
CREATE POLICY "Counts manage" ON trance_count_sections FOR ALL USING (EXISTS (SELECT 1 FROM trance_routines r WHERE r.id = routine_id AND r.choreographer_id = auth.uid()));

CREATE POLICY "Hints view" ON trance_move_hints FOR SELECT USING (EXISTS (SELECT 1 FROM trance_routines r WHERE r.id = routine_id));
CREATE POLICY "Hints manage" ON trance_move_hints FOR ALL USING (EXISTS (SELECT 1 FROM trance_routines r WHERE r.id = routine_id AND r.choreographer_id = auth.uid()));

CREATE POLICY "Cues view" ON trance_direction_cues FOR SELECT USING (EXISTS (SELECT 1 FROM trance_routines r WHERE r.id = routine_id));
CREATE POLICY "Cues manage" ON trance_direction_cues FOR ALL USING (EXISTS (SELECT 1 FROM trance_routines r WHERE r.id = routine_id AND r.choreographer_id = auth.uid()));

CREATE POLICY "Rules view" ON trance_scoring_rules FOR SELECT USING (EXISTS (SELECT 1 FROM trance_routines r WHERE r.id = routine_id));
CREATE POLICY "Rules manage" ON trance_scoring_rules FOR ALL USING (EXISTS (SELECT 1 FROM trance_routines r WHERE r.id = routine_id AND r.choreographer_id = auth.uid()));

-- Session & Attempt Policies
CREATE POLICY "Session view" ON trance_dance_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Session manage" ON trance_dance_sessions FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Attempt view" ON trance_session_attempts FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM trance_studio_memberships m
        JOIN trance_routines r ON r.id = routine_id
        JOIN trance_studio_profiles s ON s.owner_id = r.choreographer_id
        WHERE m.studio_id = s.id AND m.user_id = auth.uid() AND m.role IN ('studio_owner', 'studio_admin')
    )
);
CREATE POLICY "Attempt manage" ON trance_session_attempts FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Score view" ON trance_session_scores FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM trance_studio_memberships m
        JOIN trance_routines r ON r.id = routine_id
        JOIN trance_studio_profiles s ON s.owner_id = r.choreographer_id
        WHERE m.studio_id = s.id AND m.user_id = auth.uid() AND m.role IN ('studio_owner', 'studio_admin')
    )
);
CREATE POLICY "Score write system" ON trance_session_scores FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Feedback view" ON trance_pose_feedback FOR SELECT USING (
    EXISTS (SELECT 1 FROM trance_session_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
);
CREATE POLICY "Feedback manage system" ON trance_pose_feedback FOR ALL USING (
    EXISTS (SELECT 1 FROM trance_session_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
);

CREATE POLICY "Leaderboard view" ON trance_leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Leaderboard upsert self" ON trance_leaderboard_entries FOR ALL USING (user_id = auth.uid());

-- Badges Policies
CREATE POLICY "Badge catalog read" ON trance_badges FOR SELECT USING (true);
CREATE POLICY "Badge awards view" ON trance_badge_awards FOR SELECT USING (true);
CREATE POLICY "Badge award insert system" ON trance_badge_awards FOR INSERT WITH CHECK (user_id = auth.uid());

-- Studio Activities Policies
CREATE POLICY "Assignments view" ON trance_rehearsal_assignments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM trance_studio_memberships
        WHERE studio_id = trance_rehearsal_assignments.studio_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Assignments manage" ON trance_rehearsal_assignments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM trance_studio_memberships
        WHERE studio_id = trance_rehearsal_assignments.studio_id AND user_id = auth.uid() AND role IN ('studio_owner', 'studio_admin')
    )
);

CREATE POLICY "Comments view" ON trance_teacher_comments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM trance_studio_memberships
        WHERE studio_id = trance_teacher_comments.studio_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Comments manage" ON trance_teacher_comments FOR ALL USING (
    choreographer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM trance_studio_memberships
        WHERE studio_id = trance_teacher_comments.studio_id AND user_id = auth.uid() AND role IN ('studio_owner', 'studio_admin')
    )
);

CREATE POLICY "Jobs view" ON trance_processing_jobs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM trance_routine_assets a
        JOIN trance_routines r ON r.id = a.routine_id
        WHERE a.id = asset_id AND r.choreographer_id = auth.uid()
    )
);
CREATE POLICY "Jobs manage system" ON trance_processing_jobs FOR ALL USING (true);

-- Moderation, Follows, Notification, Analytics Policies
CREATE POLICY "Moderation view self or admin" ON trance_moderation_events FOR SELECT USING (
    reporter_id = auth.uid() OR EXISTS (
        SELECT 1 FROM trance_profiles
        WHERE id = auth.uid() AND ('admin' = ANY(roles) OR 'owner' = ANY(roles))
    )
);
CREATE POLICY "Moderation insert" ON trance_moderation_events FOR INSERT WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "Moderation update admin" ON trance_moderation_events FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM trance_profiles
        WHERE id = auth.uid() AND ('admin' = ANY(roles) OR 'owner' = ANY(roles))
    )
);

CREATE POLICY "Follows view" ON trance_follows FOR SELECT USING (true);
CREATE POLICY "Follows manage self" ON trance_follows FOR ALL USING (follower_id = auth.uid());

CREATE POLICY "Notifications view self" ON trance_notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Notifications manage self" ON trance_notifications FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Analytics insert self" ON trance_analytics_events FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Analytics read admin" ON trance_analytics_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM trance_profiles
        WHERE id = auth.uid() AND ('admin' = ANY(roles) OR 'owner' = ANY(roles))
    )
);
