-- ====================================================================
-- Multi-Year & Dynamic Question Schema Migration for Supabase
-- Paste this script into your Supabase SQL Editor and click RUN
-- ====================================================================

-- 1. YEARS TABLE
CREATE TABLE IF NOT EXISTS public.years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,          -- 'FY', 'SY', 'TY', 'BTECH'
  label TEXT NOT NULL,                -- 'First Year', 'Second Year', etc.
  display_order INT NOT NULL DEFAULT 0,
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_id UUID NOT NULL REFERENCES public.years(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  session_date DATE,
  venue TEXT,
  feedback_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_year_id ON public.sessions(year_id);

-- 3. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_id UUID NOT NULL REFERENCES public.years(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (
    question_type IN (
      'short_text', 'paragraph', 'star_rating', 'emoji_rating',
      'yes_no', 'single_choice', 'multiple_choice', 'dropdown'
    )
  ),
  options JSONB DEFAULT '[]'::jsonb,
  placeholder TEXT,
  helper_text TEXT,
  is_required BOOLEAN NOT NULL DEFAULT true,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_year_id ON public.questions(year_id);

-- 4. RESPONSES TABLE
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  year_id UUID NOT NULL REFERENCES public.years(id),
  student_name TEXT NOT NULL,
  division TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),
  recommendation TEXT CHECK (recommendation IN ('Yes', 'Maybe', 'No')),
  sentiment TEXT CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responses_session_id ON public.responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_year_id ON public.responses(year_id);

-- 5. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answers_response_id ON public.answers(response_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);

-- ============================================
-- SEED ALL 4 YEARS (FY, SY, TY, BTECH) AS OPEN
-- ============================================
INSERT INTO public.years (code, label, display_order, is_open) VALUES
  ('FY', 'First Year', 1, true),
  ('SY', 'Second Year', 2, true),
  ('TY', 'Third Year', 3, true),
  ('BTECH', 'B.Tech', 4, true)
ON CONFLICT (code) DO UPDATE SET is_open = true;

-- SEED DEFAULT SESSIONS & QUESTIONS FOR ALL YEARS
DO $$
DECLARE
  fy_id UUID;
  sy_id UUID;
  ty_id UUID;
  btech_id UUID;
BEGIN
  SELECT id INTO fy_id FROM public.years WHERE code = 'FY' LIMIT 1;
  SELECT id INTO sy_id FROM public.years WHERE code = 'SY' LIMIT 1;
  SELECT id INTO ty_id FROM public.years WHERE code = 'TY' LIMIT 1;
  SELECT id INTO btech_id FROM public.years WHERE code = 'BTECH' LIMIT 1;

  -- 1. FIRST YEAR (FY) SESSIONS & QUESTIONS
  IF fy_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.sessions WHERE year_id = fy_id) THEN
      INSERT INTO public.sessions (year_id, title, description, venue, feedback_open)
      VALUES (fy_id, 'First Year Programming Guidance & Career Session', 'Interactive introductory session on programming languages, GitHub, and mini projects.', 'Main Auditorium', true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.questions WHERE year_id = fy_id) THEN
      INSERT INTO public.questions (year_id, label, question_type, options, is_required, order_index) VALUES
        (fy_id, 'How was your overall experience of the First Year session?', 'emoji_rating', '[]'::jsonb, true, 1),
        (fy_id, 'How would you rate this session overall?', 'star_rating', '[]'::jsonb, true, 2),
        (fy_id, 'Which topic helped you the most?', 'single_choice', '["Mini Projects", "GitHub Workflow", "LinkedIn Profile", "Career Guidance"]'::jsonb, true, 3),
        (fy_id, 'Was the explanation easy to understand?', 'yes_no', '[]'::jsonb, true, 4),
        (fy_id, 'Share your honest feedback or suggestions for improvement.', 'paragraph', '[]'::jsonb, false, 5);
    END IF;
  END IF;

  -- 2. SECOND YEAR (SY) SESSIONS & QUESTIONS
  IF sy_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.sessions WHERE year_id = sy_id) THEN
      INSERT INTO public.sessions (year_id, title, description, venue, feedback_open)
      VALUES (sy_id, 'Second Year Data Structures & Algorithms Deep Dive', 'Comprehensive guidance session on Core DSA, Stacks, Queues, Trees, and Problem Solving.', 'Lab 301', true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.questions WHERE year_id = sy_id) THEN
      INSERT INTO public.questions (year_id, label, question_type, options, is_required, order_index) VALUES
        (sy_id, 'How was your overall experience of the Second Year DSA session?', 'emoji_rating', '[]'::jsonb, true, 1),
        (sy_id, 'How would you rate the DSA explanation and problem-solving clarity?', 'star_rating', '[]'::jsonb, true, 2),
        (sy_id, 'Which area needs more focus in future SY sessions?', 'single_choice', '["Trees & Graphs", "Dynamic Programming", "Competitive Coding", "System Concepts"]'::jsonb, true, 3),
        (sy_id, 'Did the hands-on coding examples help clear your doubts?', 'yes_no', '[]'::jsonb, true, 4),
        (sy_id, 'Any specific suggestions for Second Year workshops?', 'paragraph', '[]'::jsonb, false, 5);
    END IF;
  END IF;

  -- 3. THIRD YEAR (TY) SESSIONS & QUESTIONS
  IF ty_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.sessions WHERE year_id = ty_id) THEN
      INSERT INTO public.sessions (year_id, title, description, venue, feedback_open)
      VALUES (ty_id, 'Third Year System Design & Full Stack Guidance', 'Advanced session on Web Architecture, Cloud Deployment, and Industrial Tech Stack.', 'Hall 202', true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.questions WHERE year_id = ty_id) THEN
      INSERT INTO public.questions (year_id, label, question_type, options, is_required, order_index) VALUES
        (ty_id, 'How was your overall experience of the Third Year Full Stack session?', 'emoji_rating', '[]'::jsonb, true, 1),
        (ty_id, 'How would you rate the System Architecture & Cloud guidance?', 'star_rating', '[]'::jsonb, true, 2),
        (ty_id, 'Which technology stack are you most interested in mastering?', 'single_choice', '["Full Stack Web", "Mobile App Dev", "Cloud & DevOps", "AI / Data Science"]'::jsonb, true, 3),
        (ty_id, 'Was the session content relevant for internship preparation?', 'yes_no', '[]'::jsonb, true, 4),
        (ty_id, 'Any feedback on Third Year internship & technical guidance?', 'paragraph', '[]'::jsonb, false, 5);
    END IF;
  END IF;

  -- 4. B.TECH SESSIONS & QUESTIONS
  IF btech_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.sessions WHERE year_id = btech_id) THEN
      INSERT INTO public.sessions (year_id, title, description, venue, feedback_open)
      VALUES (btech_id, 'B.Tech Capstone Project & Placement Strategy', 'Capstone project reviews, mock interview strategies, and industry readiness.', 'Seminar Hall B', true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.questions WHERE year_id = btech_id) THEN
      INSERT INTO public.questions (year_id, label, question_type, options, is_required, order_index) VALUES
        (btech_id, 'How was your overall experience of the B.Tech Placement session?', 'emoji_rating', '[]'::jsonb, true, 1),
        (btech_id, 'How would you rate the placement preparation & project guidance?', 'star_rating', '[]'::jsonb, true, 2),
        (btech_id, 'Which placement preparation module was most beneficial?', 'single_choice', '["Mock Technical Interviews", "System Design Rounds", "Resume Building", "Aptitude & Coding Tests"]'::jsonb, true, 3),
        (btech_id, 'Did you receive actionable feedback for your capstone project?', 'yes_no', '[]'::jsonb, true, 4),
        (btech_id, 'Any additional suggestions for B.Tech placement readiness?', 'paragraph', '[]'::jsonb, false, 5);
    END IF;
  END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Public READ policies
DROP POLICY IF EXISTS "public read open years" ON public.years;
CREATE POLICY "public read open years" ON public.years FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read sessions" ON public.sessions;
CREATE POLICY "public read sessions" ON public.sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read questions" ON public.questions;
CREATE POLICY "public read questions" ON public.questions FOR SELECT USING (true);

-- Public INSERT policies (Only for OPEN years)
DROP POLICY IF EXISTS "public insert responses for open years" ON public.responses;
CREATE POLICY "public insert responses for open years" ON public.responses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.years y WHERE y.id = year_id AND y.is_open = true)
  );

DROP POLICY IF EXISTS "public insert answers" ON public.answers;
CREATE POLICY "public insert answers" ON public.answers FOR INSERT WITH CHECK (true);

-- Public UPDATE / ALL for Admin (anon/authenticated)
DROP POLICY IF EXISTS "public admin manage years" ON public.years;
CREATE POLICY "public admin manage years" ON public.years FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public admin manage sessions" ON public.sessions;
CREATE POLICY "public admin manage sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public admin manage questions" ON public.questions;
CREATE POLICY "public admin manage questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);

-- Realtime enablement
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'years') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.years;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'sessions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'questions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'responses') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
  END IF;
END $$;
