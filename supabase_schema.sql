-- ==============================================================================
-- SIH Memory Assistant: Cognitive Game Performance & Adaptive Difficulty Schema
-- ==============================================================================
-- This script sets up dedicated analytics and adaptive difficulty tracking tables
-- for Dhop Khel and other cognitive games in the SIH Memory Assistant app.

-- 1. Game Sessions Table
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    game_type TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'))
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_player_game ON public.game_sessions(player_id, game_type);

-- 2. Game Rounds Table
CREATE TABLE IF NOT EXISTS public.game_rounds (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    round_number INT NOT NULL,
    difficulty TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    accuracy NUMERIC NOT NULL,
    response_time INT NOT NULL, -- in milliseconds
    score NUMERIC NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_game_rounds_session ON public.game_rounds(session_id);

-- 3. Game Events Table
CREATE TABLE IF NOT EXISTS public.game_events (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    round_id BIGINT,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_game_events_session ON public.game_events(session_id);

-- 4. Performance Metrics Table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    game_type TEXT NOT NULL,
    accuracy NUMERIC NOT NULL,
    average_response_time INT NOT NULL,
    consistency_score NUMERIC NOT NULL,
    performance_score NUMERIC NOT NULL,
    difficulty TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_player_game ON public.performance_metrics(player_id, game_type);

-- 5. Difficulty Profiles Table
CREATE TABLE IF NOT EXISTS public.difficulty_profiles (
    id BIGSERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    game_type TEXT NOT NULL,
    current_difficulty TEXT NOT NULL,
    recent_score NUMERIC NOT NULL,
    promotion_count INT DEFAULT 0,
    demotion_count INT DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_player_game_difficulty UNIQUE (player_id, game_type)
);

CREATE INDEX IF NOT EXISTS idx_difficulty_profiles_player ON public.difficulty_profiles(player_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.difficulty_profiles ENABLE ROW LEVEL SECURITY;

-- Allow read and write for authenticated & anon clients
CREATE POLICY "Allow public read-write for game_sessions" ON public.game_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for game_rounds" ON public.game_rounds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for game_events" ON public.game_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for performance_metrics" ON public.performance_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for difficulty_profiles" ON public.difficulty_profiles FOR ALL USING (true) WITH CHECK (true);

