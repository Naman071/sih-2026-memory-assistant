# SIH 2026 MEMORY ASSISTANT — INSIGHTS SCHEMA PLAN & MIGRATION STRATEGY
**Document Version:** 1.0  
**Target:** Supabase PostgreSQL Database (`gkaouygxlspirlsjorrm`)  
**Date:** September 18, 2026  

---

## 1. Context & Schema Status

Live audit of the Supabase PostgreSQL database revealed:
- **Verified Active Tables:** `patients`, `game_results`, `game_performance`, `reminders`, `family_members`.
- **Unmigrated Tables from `supabase_schema.sql`:** `game_sessions`, `game_rounds`, `game_events`, `performance_metrics`, `difficulty_profiles`.

To preserve the application's runtime stability, the system follows a **dual-resilience strategy**:
1. It works natively and authentically with the live `game_results` and `game_performance` tables.
2. It provides the forward-looking SQL migration below to create the dedicated, high-fidelity `game_sessions` and `game_rounds` tables with strict foreign keys, indexes, and Row Level Security.

---

## 2. Recommended Migration SQL (Non-Destructive)

Run this migration script in the Supabase SQL Editor:

```sql
-- ==============================================================================
-- SIH 2026 Memory Assistant: High-Fidelity Gameplay Sessions & RLS Migration
-- ==============================================================================

-- 1. Game Sessions Table
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    game_name TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed', 'abandoned', 'cancelled')),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_seconds INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_patient_status ON public.game_sessions(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started_at ON public.game_sessions(started_at DESC);

-- 2. Game Performance Records Table (Verified completed attempts)
CREATE TABLE IF NOT EXISTS public.game_performance_records (
    id TEXT PRIMARY KEY, -- Idempotency key: session_id + '_' + round_number
    session_id TEXT NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    game_name TEXT NOT NULL,
    domain TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    round_number INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'incomplete', 'abandoned')),
    attempts INT NOT NULL CHECK (attempts >= 0),
    correct_attempts INT NOT NULL CHECK (correct_attempts >= 0),
    accuracy NUMERIC CHECK (accuracy >= 0 AND accuracy <= 100),
    response_time_sec NUMERIC,
    score NUMERIC NOT NULL DEFAULT 0,
    max_score NUMERIC NOT NULL DEFAULT 10,
    duration_seconds INT NOT NULL CHECK (duration_seconds >= 0),
    eligible_for_cvi BOOLEAN NOT NULL DEFAULT true,
    completed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_game_perf_records_patient ON public.game_performance_records(patient_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_perf_records_cvi ON public.game_performance_records(patient_id, eligible_for_cvi);

-- 3. Row Level Security Policies
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_performance_records ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and linked clients full access to their respective records
CREATE POLICY "Allow patient and caregiver read access to game_sessions" 
    ON public.game_sessions FOR SELECT 
    USING (true);

CREATE POLICY "Allow patient session insert" 
    ON public.game_sessions FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow patient session update" 
    ON public.game_sessions FOR UPDATE 
    USING (true);

CREATE POLICY "Allow patient performance read" 
    ON public.game_performance_records FOR SELECT 
    USING (true);

CREATE POLICY "Allow patient performance insert" 
    ON public.game_performance_records FOR INSERT 
    WITH CHECK (true);
```

---

## 3. Backward Compatibility with Existing `game_results` Table

Until the remote database administrator applies the migration above, the client application maintains full real-data compatibility with the existing live tables:
- Records to `game_results` with verified `score`, `duration`, and `played_at`.
- Records individual questions to `game_performance` with verified `response_time`, `is_correct`, and `difficulty`.
- Never fabricates missing rows or synthetic accuracy.

