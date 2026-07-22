-- ====================================================================
-- Fully Idempotent Supabase Database Schema for Student Feedback System
-- Safe to run repeatedly in the Supabase SQL Editor without any errors!
-- ====================================================================

-- 1. Create the feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    mood TEXT DEFAULT 'neutral',
    rating INT NOT NULL DEFAULT 5,
    category TEXT DEFAULT 'UX',
    message TEXT DEFAULT '',
    would_recommend BOOLEAN DEFAULT TRUE,
    follow_up TEXT,
    overall_experience TEXT DEFAULT 'Good',
    learning_outcome TEXT DEFAULT 'Some useful things',
    most_useful_topic TEXT DEFAULT 'Mini Projects',
    clarity TEXT DEFAULT 'Somewhat clear',
    engagement TEXT DEFAULT 'Okay',
    speaker_support TEXT DEFAULT 'Good',
    impact_plan TEXT DEFAULT 'Improving skills',
    impact_plans JSONB DEFAULT '[]'::jsonb,
    recommendation TEXT DEFAULT 'Yes',
    suggestions TEXT,
    sentiment TEXT DEFAULT 'Neutral',
    sentiment_score FLOAT DEFAULT 0.5,
    summary TEXT DEFAULT '',
    created_at_client BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (Safely drop existing policies first to prevent 42710 errors)
DROP POLICY IF EXISTS "Allow public insert to feedback" ON public.feedback;
CREATE POLICY "Allow public insert to feedback" 
ON public.feedback 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select from feedback" ON public.feedback;
CREATE POLICY "Allow public select from feedback" 
ON public.feedback 
FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow public update to feedback" ON public.feedback;
CREATE POLICY "Allow public update to feedback" 
ON public.feedback 
FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- 4. Safely Enable Realtime Updates for Feedback Dashboard
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'feedback'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;
  END IF;
END $$;

-- 5. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback (rating);
