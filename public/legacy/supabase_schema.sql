-- ==============================================================================
-- CHAUDHARY DEVI LAL UNIVERSITY (CDLU), SIRSA
-- 13th TRIVENI YUVA MAHOTSAV 2026 - EVENT MANAGEMENT DATABASE SCHEMA
-- Compatible with Supabase PostgreSQL
-- ==============================================================================

-- 1. Create tables with RLS enabled
-- Enable uuid-ossp if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: events
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    participants_min INT DEFAULT 1,
    participants_max INT DEFAULT 1,
    accompanists_max INT DEFAULT 0,
    time_limit TEXT,
    stage TEXT,
    description TEXT,
    rules TEXT,
    age_limit INT,
    age_limit_text TEXT,
    scoring_criteria JSONB,
    official_number INT UNIQUE,
    trophy_event BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upgrade an existing events table created by an older version of the app.
-- CREATE TABLE IF NOT EXISTS does not add columns to an existing table.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS participants_min INT DEFAULT 1;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS participants_max INT DEFAULT 1;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS accompanists_max INT DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS time_limit TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS stage TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rules TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS age_limit INT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS age_limit_text TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS scoring_criteria JSONB;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS official_number INT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS trophy_event BOOLEAN DEFAULT TRUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Table: affiliated colleges. IDs come from the supplied CDLU college list;
-- spreadsheet serial numbers are used where no team code was supplied.
CREATE TABLE IF NOT EXISTS public.affiliated_colleges (
    id INT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

UPDATE public.affiliated_colleges SET is_active = FALSE WHERE id NOT IN (2601,2644,2628,2661,2639,2633,2647,2606,2638,2660,2654,2632,2617,2669,2614,2635,2618,2636,2655,2607,2622,2619,2640,2641,2620,2657,2643,2645,2637);

INSERT INTO public.affiliated_colleges (id, name) VALUES
    (2601, 'JCD M College of Education, Sirsa'),
    (2644, 'Shah Satnam Ji Boys College, Sirsa'),
    (2628, 'M.M. College of Education, Fatehabad'),
    (2661, 'CKRM Degree College, Jamal, Sirsa'),
    (2639, 'JCDM College of Engineering, Sirsa (Haryana)'),
    (2633, 'Dr. B.R. Ambedkar College, Mandi Dabwali'),
    (2647, 'Government College, Bhuna'),
    (2606, 'CMK National PG College, Sirsa'),
    (2638, 'Shri Guru Hari Singh College, Jiwan Nagar'),
    (2660, 'Shah Satnam Ji College of Education, Sirsa'),
    (2654, 'Government College for Girls, Rania'),
    (2632, 'Shaheed Baba Deep Singh College of Education, Aherwan, Ratia'),
    (2617, 'K.T. Government College, Ratia'),
    (2669, 'Shah Satnam Ji Girls College, Sirsa'),
    (2614, 'Lala Hansraj Phutela College of Law'),
    (2635, 'Mata Harki Devi College'),
    (2618, 'Janta Girls P.G. College'),
    (2636, 'SDS/GCW, Ratia'),
    (2655, 'Government National College, Sirsa'),
    (2607, 'JCD Institute of Business Management, Sirsa'),
    (2622, 'CMG/GCW Bhodia, Fatehabad'),
    (2619, 'JCD Memorial College, Sirsa'),
    (2640, 'Mata Harki Devi College of Education, Odhan'),
    (2641, 'Government College, Kalawali'),
    (2620, 'Government College for Women, Sirsa'),
    (2657, 'MP College Mandi Dabwali'),
    (2643, 'GOVT. College Bhattu Kallan, Fatehabad'),
    (2645, 'Shaheed Bhagat Singh College of Education, Kalawali, Sirsa'),
    (2637, 'M.M.P.G College Fatehabad')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_active = TRUE;

-- Table: registrations (Students & Teams)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.events(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL,
    category TEXT NOT NULL,
    college_name TEXT NOT NULL,
    college_id INT REFERENCES public.affiliated_colleges(id),
    participant_name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    class_name TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    dob DATE,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    team_manager_name TEXT,
    team_manager_phone TEXT,
    team_manager_email TEXT,
    team_members JSONB DEFAULT '[]'::jsonb,
    accompanists JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Eligible', -- 'Eligible', 'Under Review', 'Disqualified'
    chest_number INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: judges (Unique email based access assigned by Admin)
CREATE TABLE IF NOT EXISTS public.judges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL, -- The unique designated email assigned by Admin
    phone TEXT,
    organization TEXT,
    assigned_categories TEXT[] DEFAULT '{}',
    assigned_events TEXT[] DEFAULT '{}',
    pin TEXT DEFAULT '1234', -- Security PIN / passcode for judge verification
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: scores (Judges scoring student / team)
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id TEXT REFERENCES public.registrations(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    college_id INT REFERENCES public.affiliated_colleges(id),
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    judge_id UUID REFERENCES public.judges(id) ON DELETE CASCADE,
    judge_name TEXT NOT NULL,
    judge_email TEXT NOT NULL,
    criteria_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2),
    source_max_score NUMERIC(5,2),
    normalized_score NUMERIC(5,2),
    remarks TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(registration_id, judge_id, event_id)
);

ALTER TABLE public.scores ADD COLUMN IF NOT EXISTS max_score NUMERIC(5,2);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS official_number INT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS trophy_event BOOLEAN DEFAULT TRUE;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS college_id INT;
UPDATE public.registrations r
SET college_name = c.name
FROM public.affiliated_colleges c
WHERE r.college_id = c.id;
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_college_id_fkey;
-- The finalized-score trigger protects normal application writes, but an
-- idempotent schema migration may need to backfill college_id on old scores.
-- Remove only the trigger during this controlled migration and recreate it
-- immediately after the backfill. Finalized score values are never changed.
DROP TRIGGER IF EXISTS prevent_finalized_score_update ON public.scores;
DROP TRIGGER IF EXISTS prevent_finalized_score_change ON public.scores;
-- Migrate older/demo college IDs by matching their stored college name to the
-- authoritative affiliated-colleges list. Any remaining legacy ID is cleared
-- rather than blocking the entire schema migration with a foreign-key error.
UPDATE public.registrations r
SET college_id = c.id
FROM public.affiliated_colleges c
WHERE r.college_id IS NOT NULL
  AND lower(trim(r.college_name)) = lower(trim(c.name));
UPDATE public.registrations r
SET college_id = NULL
WHERE r.college_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM public.affiliated_colleges c
      WHERE c.id = r.college_id
  );
ALTER TABLE public.registrations ADD CONSTRAINT registrations_college_id_fkey
    FOREIGN KEY (college_id) REFERENCES public.affiliated_colleges(id);
ALTER TABLE public.scores ADD COLUMN IF NOT EXISTS source_max_score NUMERIC(5,2);
ALTER TABLE public.scores ADD COLUMN IF NOT EXISTS normalized_score NUMERIC(5,2);
ALTER TABLE public.judges ADD COLUMN IF NOT EXISTS assigned_events TEXT[] DEFAULT '{}';
ALTER TABLE public.scores ADD COLUMN IF NOT EXISTS college_id INT;
ALTER TABLE public.scores DROP CONSTRAINT IF EXISTS scores_college_id_fkey;
UPDATE public.scores s
SET college_id = r.college_id
FROM public.registrations r
WHERE s.registration_id = r.id
  AND s.college_id IS NULL;
UPDATE public.scores s
SET college_id = NULL
WHERE s.college_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM public.affiliated_colleges c
      WHERE c.id = s.college_id
  );
ALTER TABLE public.scores DROP COLUMN IF EXISTS college_name;
ALTER TABLE public.scores ADD CONSTRAINT scores_college_id_fkey
    FOREIGN KEY (college_id) REFERENCES public.affiliated_colleges(id);

-- Run the duplicate query in the deployment instructions before creating this
-- index if old data contains duplicate college/event registrations.
CREATE UNIQUE INDEX IF NOT EXISTS registrations_one_college_per_event
    ON public.registrations (college_id, event_id)
    WHERE college_id IS NOT NULL AND event_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.prevent_finalized_score_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' AND OLD.is_locked THEN
        -- Permit ON DELETE CASCADE when the parent registration is deleted,
        -- while still blocking a direct delete of a finalized score.
        IF NOT EXISTS (
            SELECT 1
            FROM public.registrations
            WHERE id = OLD.registration_id
        ) THEN
            RETURN OLD;
        END IF;
        RAISE EXCEPTION 'Finalized judge scores cannot be changed or deleted.';
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.is_locked THEN
        RAISE EXCEPTION 'Finalized judge scores cannot be changed or deleted.';
    END IF;
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_finalized_score_update ON public.scores;
DROP TRIGGER IF EXISTS prevent_finalized_score_change ON public.scores;
CREATE TRIGGER prevent_finalized_score_change
BEFORE UPDATE OR DELETE ON public.scores
FOR EACH ROW
EXECUTE FUNCTION public.prevent_finalized_score_change();

-- Table: admins (Admin & Super Admin accounts)
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'Super Admin', -- 'Super Admin', 'Cultural Coordinator', 'Stage Incharge'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A database-generated fallback protects imports and direct API inserts. The
-- browser also supplies a UUID-based ID so simultaneous public submissions do
-- not depend on LocalStorage or a client-side row count.
ALTER TABLE public.registrations
    ALTER COLUMN id SET DEFAULT (
        'CDLU-TYM-2026-' || upper(replace(gen_random_uuid()::text, '-', ''))
    );

-- Table: announcements (Official youth fest notices)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    badge TEXT DEFAULT 'Urgent',
    is_pinned BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. Enable Row Level Security (RLS) and Public/Anon Policies
-- ==============================================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliated_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow public read access to events
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read affiliated colleges" ON public.affiliated_colleges;
CREATE POLICY "Public read affiliated colleges" ON public.affiliated_colleges FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Public manage events" ON public.events;
CREATE POLICY "Public manage events" ON public.events FOR ALL USING (true);

-- Allow public to register (insert) and view their registrations
DROP POLICY IF EXISTS "Public registrations select" ON public.registrations;
CREATE POLICY "Public registrations select" ON public.registrations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public registrations insert" ON public.registrations;
CREATE POLICY "Public registrations insert" ON public.registrations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public registrations update" ON public.registrations;
CREATE POLICY "Public registrations update" ON public.registrations FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public registrations delete" ON public.registrations;
CREATE POLICY "Public registrations delete" ON public.registrations FOR DELETE USING (true);

-- Judges table policies
DROP POLICY IF EXISTS "Judges select" ON public.judges;
CREATE POLICY "Judges select" ON public.judges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Judges manage" ON public.judges;
CREATE POLICY "Judges manage" ON public.judges FOR ALL USING (true);

-- Scores table policies
DROP POLICY IF EXISTS "Scores select" ON public.scores;
CREATE POLICY "Scores select" ON public.scores FOR SELECT USING (true);
DROP POLICY IF EXISTS "Scores manage" ON public.scores;
CREATE POLICY "Scores manage" ON public.scores FOR ALL USING (true);

-- Admins table policies
DROP POLICY IF EXISTS "Admins select" ON public.admins;
CREATE POLICY "Admins select" ON public.admins FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage" ON public.admins;
CREATE POLICY "Admins manage" ON public.admins FOR ALL USING (true);

-- Announcements policies
DROP POLICY IF EXISTS "Announcements select" ON public.announcements;
CREATE POLICY "Announcements select" ON public.announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Announcements manage" ON public.announcements;
CREATE POLICY "Announcements manage" ON public.announcements FOR ALL USING (true);

-- ==============================================================================
-- 3. Seed Initial Data (Official CDLU 13th Triveni Yuva Mahotsav)
-- ==============================================================================

-- Insert default admin account
INSERT INTO public.admins (name, email, password, role)
VALUES 
    ('CDLU Cultural Secretary (Super Admin)', 'admin@cdlu.ac.in', 'cdlu@2026', 'Super Admin'),
    ('Stage Coordinator Admin', 'stage.admin@cdlu.ac.in', 'stage@2026', 'Cultural Coordinator')
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name, 
    password = EXCLUDED.password;

-- Remove the old demonstration judges. The official roster below is the only
-- seeded judge directory and remains editable from the admin portal.
-- Their demo scores may already be finalized, so temporarily remove only the
-- score-change guard while deleting these obsolete demo records. The guard is
-- recreated immediately after the cleanup.
DROP TRIGGER IF EXISTS prevent_finalized_score_change ON public.scores;
DROP TRIGGER IF EXISTS prevent_finalized_score_update ON public.scores;

DELETE FROM public.judges
WHERE email IN (
    'judge.music@cdlu.ac.in',
    'judge.dance@cdlu.ac.in',
    'judge.theatre@cdlu.ac.in',
    'judge.literary@cdlu.ac.in',
    'judge.finearts@cdlu.ac.in'
);

CREATE TRIGGER prevent_finalized_score_change
BEFORE UPDATE OR DELETE ON public.scores
FOR EACH ROW
EXECUTE FUNCTION public.prevent_finalized_score_change();

-- Official judge directory from Judges List 2026.
-- These records are initially available for event assignment. The generated
-- directory emails are identifiers; replace them with official login emails
-- before enabling judge authentication in production.
INSERT INTO public.judges (name, email, organization, assigned_categories, assigned_events, pin)
SELECT roster.name,
       'judge.roster.' || LPAD(roster.ordinality::TEXT, 3, '0') || '@cdlu.local',
       '13th Triveni Yuva Mahotsav 2026 - Official Judge List',
       CASE
           WHEN roster.name IN ('Mr. Vikas Rohilla', 'Mr. Amit Sharma', 'Mr. Gulab Singh', 'Sh. Dainy', 'Sh. Harvinder Rana', 'Sh. Tejender Gill', 'Sh. Kailash Verma', 'Dr. Madhu Sharma', 'Dr. Harwinder Singh', 'Dr. Ravi Guatam', 'Dr. Rajbir Bhardwaj', 'Dr. Dinesh Raheja', 'Dr. Sunil', 'Dr. Himani Gupta', 'Sh. Raj Mawar', 'Mr. Raj Methew')
               THEN ARRAY['Music']
           WHEN roster.name IN ('Sh. Sushil Kumar', 'Dr. Jagbir Rathi', 'Dr. Partap Rathi', 'Mr. Kuldeep Rathi', 'Sh. Ram Singh', 'Ms. Bhawana', 'Charanjeet Singh', 'Dr. Rakhi', 'Sh. Tarsem Chand Khaleri', 'Sh. Sanjay Kayat', 'Dr. Vaani', 'Sh. Anil Kaushik', 'Sh. V.D. Trikha', 'Sh. Azad', 'Sh. Azad Duhan', 'Mr. Ram Mehar', 'Ms. Salini Sharma', 'Sh. Harmandeep Ratan', 'Dr. Sanvi Jethwani', 'Dr. Manjor Singh', 'Dr. Harvinder Gill', 'Dr. Harsh Gogal Roy')
               THEN ARRAY['Dance']
           WHEN roster.name IN ('Mr. Vikas Rohilla', 'Dr. Sakeel Khan', 'Dr. Mandeep Sharma (K.D.)', 'Dr. Dharmendra Dangi')
               THEN ARRAY['Theatre']
           WHEN roster.name IN ('Dr. Renu Dahiya', 'Mr. Kapil Sehgal', 'Mr. Rajiv Ranjan', 'Dr. Aarti', 'Ms. Shweta', 'Ms. Yaxita', 'Dr. Shamshir Singh')
               THEN ARRAY['Literary']
           WHEN roster.name IN ('Dr. O.P. Kadyan', 'Dr. Amita Goyal', 'Dr. Aarti', 'Dr. Preet Kohli', 'Ms. Priyanka Sinha')
               THEN ARRAY['Fine Arts']
           ELSE ARRAY['Music', 'Dance', 'Theatre', 'Literary', 'Fine Arts']
       END,
       ARRAY[]::TEXT[],
       '1234'
FROM unnest(ARRAY[
    'Sh. Janardhan Sharma', 'Mr. Vikas Rohilla', 'Mr. Amit Sharma',
    'Dr. Anil Kaushik', 'Dr. Renu Dahiya', 'Mr. Gulab Singh',
    'Sh. Dainy', 'Sh. Harvinder Rana', 'Sh. Tejender Gill',
    'Dr. Parul', 'Sh. Kailash Verma', 'Dr. Madhu Sharma',
    'Dr. Harwinder Singh', 'Dr. Ravi Guatam', 'Dr. Rajbir Bhardwaj',
    'Dr. Dinesh Raheja', 'Dr. Sunil', 'Dr. Himani Gupta',
    'Hari Singh', 'Dr. Hanif', 'Dr. Pawan Bakshi', 'Dr. Renuka Gambhir',
    'Sh. Raj Mawar', 'Dr. Anil Bharti', 'Dr. Ravinder Nagar',
    'Sh. Mahavir Guddu', 'Dr. Sukhdass', 'Dr. Vijay Kumar Yamla',
    'Dr. Rama Kanta', 'Sh. Satish Haryanvi', 'Dr. Meenakshi',
    'Dr. Mukesh Rana', 'Dr. Rishpal', 'Dr. Chandni',
    'Dr. Raj Kumar Rathore', 'Dr. Bhupender Malhotra', 'Dr. Devender Verma',
    'Dr. Kiran Kapoor', 'Dr. Santosh Pathak', 'Dr. Ravi',
    'Dr. Vinod Khurana', 'Sh. Satish Balamia', 'Sh. Anil Soni',
    'Sh. Sanjeev Sharma', 'Dr. Quity', 'Dr. Mahender',
    'Sh. Charanjeet', 'Mrs. Leeta Saini', 'Sh. Sushil Kumar',
    'Dr. Jagbir Rathi', 'Dr. Partap Rathi', 'Mr. Kuldeep Rathi',
    'Sh. Ram Singh', 'Ms. Bhawana', 'Charanjeet Singh',
    'Dr. Rakhi', 'Sh. Tarsem Chand Khaleri', 'Sh. Sanjay Kayat',
    'Dr. Vaani', 'Sh. Anil Kaushik', 'Sh. V.D. Trikha',
    'Shri Shyam Gupta', 'Sh. Azad', 'Rajinder Sharma',
    'Sh. Azad Duhan', 'Dr. Sushil', 'Sh. Parveen Vasisht',
    'Sh. Ajit Kumar', 'Dr. Sonal', 'Sh. Sumer Singh',
    'Sh. Bahadur Singh', 'Dr. Ram Niwas Arya', 'Sh. Vijay Bhatia',
    'Sh. Rishiraj Sharma', 'Prof. Maha Singh Punia', 'Dinesh Chahal',
    'Sh. Vishal Vats', 'Prof. Jyoti Sheoran', 'Dr. Geetu Dhawan',
    'Prof. Vikram Kaushik', 'Dr. Shyam Vashisht', 'Dr. Vijay Kumar',
    'Dr. Suman Lata', 'Dr. Asha Poonia', 'Dr. Ramesh Chahal',
    'Sh. Sanjeet Siroha', 'Sh. Yashu Dass', 'Sh. Manoj Chhabra',
    'Sh. Rajender Kumar', 'Sh. Harish Chhikara', 'Dr. O.P. Kadyan',
    'Dr. S.Z.H. Nakvi', 'Mr. Navin Kumar', 'Sh. Anil Kumar Gulia',
    'Sh. Girish Shankar', 'Sh. Jagjit Singh', 'Sh. Girja Shankar',
    'Dr. Deepika', 'Ms. Nidhi', 'Dr. Rajesh Khapra', 'Mr. Vijay Dhore',
    'Ms. Gurpreet Kaur Saini', 'Ms. Priyanka Sinha', 'Mr. Raj Methew',
    'Mr. Kapil Sehgal', 'Mr. Raj Kumar', 'Mr. Ram Mehar',
    'Ms. Salini Sharma', 'Ms. Meenakshi', 'Mr. Rajiv Ranjan',
    'Dr. Amita Goyal', 'Dr. Aarti', 'Sh. Harmandeep Ratan',
    'Dr. Sanvi Jethwani', 'Dr. Sakeel Khan', 'Dr. Manjor Singh',
    'Dr. Mandeep Sharma (K.D.)', 'Dr. Harvinder Gill', 'Dr. Anil',
    'Dr. Harsh Gogal Roy', 'Ms. Shweta', 'Ms. Yaxita',
    'Dr. Shamshir Singh', 'Dr. Preet Kohli', 'Dr. Dharmendra Dangi',
    'Mr. Narender', 'Mr. Lakhvinder', 'Mr. Surender Kamboj',
    'Mr. Ajay Singh', 'Prof. Hukam Chand', 'Dr. Arvinder Singh',
    'Dr. Preetpal Singh', 'Ajay Kumar'
]) WITH ORDINALITY AS roster(name, ordinality)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    organization = EXCLUDED.organization,
    assigned_categories = EXCLUDED.assigned_categories;

-- Insert CDLU Official Events (Annexure II to VI - All 34 Official Guidelines Items + Cultural Procession)
INSERT INTO public.events (id, name, category, participants_min, participants_max, accompanists_max, time_limit, stage, description, rules, age_limit, age_limit_text, scoring_criteria)
VALUES
-- MUSIC (Items 1 - 11)
('music_classical_vocal', 'Classical Vocal Solo (Hindustani / Carnatic)', 'Music', 1, 1, 3, '8-10 min', 'Stage I (Auditorium)', 'Khayal, Dhrupad, Dhamar or Tarana', 'Item can be presented in Hindustani or Carnatic style. Cinema songs are strictly not allowed. Max 3 accompanists.', 25, '25 Years (as on July 1, 2026)', '{"sur": 30, "taal": 30, "selection_of_raga": 20, "overall_impact": 20}'::jsonb),
('music_classical_inst_perc', 'Classical Instrumental Solo (Percussion)', 'Music', 1, 1, 3, '8-10 min', 'Stage I (Auditorium)', 'Tabla, Pakhawaj, Mridangam, Dholak', 'Item can be presented in Hindustani or Carnatic style. Participant must bring own instrument. Max 3 accompanists.', 25, '25 Years (as on July 1, 2026)', '{"taal_clarity": 35, "layakari": 35, "composition": 15, "overall_impact": 15}'::jsonb),
('music_classical_inst_nonperc', 'Classical Instrumental Solo (Non-Percussion)', 'Music', 1, 1, 3, '8-10 min', 'Stage I (Auditorium)', 'Sitar, Sarod, Flute, Violin, Santoor', 'Item can be presented in Hindustani or Carnatic style. Casio not allowed. Max 3 accompanists.', 25, '25 Years (as on July 1, 2026)', '{"sur_swara": 35, "taal": 25, "raga_purity": 20, "overall_impact": 20}'::jsonb),
('music_light_vocal', 'Light Vocal Indian (Solo)*', 'Music', 1, 1, 3, '4-6 min', 'Stage I (Auditorium)', 'Geet, Ghazal, Bhajan, Shabad, Abhangas', 'Non-film songs only. 15s grace time. Max 3 accompanists.', 25, '25 Years (as on July 1, 2026)', '{"voice_quality": 30, "sur_melody": 30, "expression": 20, "presentation": 20}'::jsonb),
('music_western_vocal_solo', 'Western Vocal Solo*', 'Music', 1, 1, 3, '4-6 min', 'Stage I (Auditorium)', 'English Western Vocal Solo', 'Only English songs are allowed. Live accompaniment only. Max 3 accompanists.', 25, '25 Years (as on July 1, 2026)', '{"vocal_control": 30, "pitch_rhythm": 30, "diction": 20, "stage_appeal": 20}'::jsonb),
('music_indian_group_song', 'Indian Group Song', 'Music', 4, 6, 5, '8-10 min', 'Stage I (Auditorium)', 'Patriotic and Folk Songs (2 songs)', 'Maximum 6 singers and 5 accompanists. Non-film songs only.', 25, '25 Years (as on July 1, 2026)', '{"harmony_synchronization": 30, "sur_taal": 30, "theme_patriotic_value": 20, "presentation": 20}'::jsonb),
('music_western_group_song', 'Western Group Song', 'Music', 4, 6, 5, '8-10 min', 'Stage I (Auditorium)', 'Western English Group Choir/Song', 'Maximum 6 singers and 5 accompanists. In English only.', 25, '25 Years (as on July 1, 2026)', '{"harmony_blend": 35, "pitch_tempo": 25, "arrangement": 20, "overall_performance": 20}'::jsonb),
('music_folk_orchestra', 'Folk Orchestra (Haryanvi / Indian)', 'Music', 6, 9, 3, '8-10 min', 'Stage I (Auditorium)', 'Ensemble of Traditional Indian Folk Instruments', 'Maximum 9 participants, 3 accompanists. Traditional instruments only. Singing prohibited.', 25, '25 Years (as on July 1, 2026)', '{"folk_authenticity": 30, "coordination": 30, "melodic_structure": 20, "costume_appeal": 20}'::jsonb),
('music_western_inst_solo', 'Western Instrumental Solo', 'Music', 1, 1, 3, '6-8 min', 'Stage I (Auditorium)', 'Western percussion or non-percussion instrument', 'Maximum 1 participant with up to 3 accompanists. Live accompaniment only.', 25, '25 Years (as on July 1, 2026)', '{"technique_execution": 35, "tempo_rhythm": 30, "musicality": 20, "overall_impact": 15}'::jsonb),
('music_general_folk_solo', 'General Folk Song (Solo)', 'Music', 1, 1, 3, '3-5 min', 'Stage I (Auditorium)', 'Traditional Folk Song (Indian language/dialect, excluding Haryanvi)', 'Authentic traditional folk melody. Max 3 accompanists. No age limit.', NULL, 'No limit', '{"folk_dialect_authenticity": 35, "sur_taal": 30, "traditional_flavor": 20, "stage_presence": 15}'::jsonb),
('music_qawwali', 'Qawwali', 'Music', 6, 8, 4, '8-10 min', 'Stage I (Auditorium)', 'Traditional Sufi / Traditional Qawwali Ensemble', '6-8 participants, 4 accompanists. Live clapping and singing. No age limit.', NULL, 'No limit', '{"clapping_chorus_coordination": 30, "vocal_power_sur": 30, "poetry_depth": 20, "overall_atmosphere": 20}'::jsonb),

-- DANCE (Items 12 - 18)
('dance_classical_solo', 'Classical Dance (Solo)', 'Dance', 1, 1, 5, '8-10 min', 'Stage I (Auditorium)', 'Kathak, Kathakali, Bharatnatyam, Manipuri, Kuchipudi, Mohiniyattam, Odissi, Sattriya', 'Classical costume and live accompaniment only. Max 5 accompanists.', 25, '25 Years (as on July 1, 2026)', '{"bhav_expression": 30, "mudra_technique": 30, "taal_footwork": 25, "costume_makeup": 15}'::jsonb),
('dance_haryanvi_group', 'Haryanvi Group Dance', 'Dance', 8, 10, 5, '8-10 min', 'Stage II (Open Air Theatre)', 'Primitive, folk or tribal dance of Haryana (Phag, Khoria, Dhamal)', 'Traditional Haryanvi attires (Daman, Kurti, Chunder). Maximum 10 dancers, 5 accompanists.', 25, '25 Years (as on July 1, 2026)', '{"rhythm_steps": 30, "folk_authenticity": 30, "synchronization": 25, "costumes_props": 15}'::jsonb),
('dance_creative_choreography', 'Creative Choreography', 'Dance', 8, 12, 3, '8-10 min', 'Stage I (Auditorium)', 'Thematic Contemporary & Creative Dance Movement', 'Theme-based creative dance. 12 participants, 3 accompanists. Recorded track allowed.', 25, '25 Years (as on July 1, 2026)', '{"concept_story": 30, "formations_synchrony": 30, "technique_grace": 25, "music_costume_sync": 15}'::jsonb),
('dance_general_group', 'General Group Dance', 'Dance', 8, 10, 7, '8-10 min', 'Stage II (Open Air Theatre)', 'Regional Folk Dance of India (Bhangra, Giddha, Garba, Lavani)', 'Max 10 dancers, 7 accompanists. No puppet or ballet dance. No age limit.', NULL, 'No limit', '{"folk_energy_rhythm": 30, "choreography_sync": 30, "traditional_essence": 25, "costume_grace": 15}'::jsonb),
('dance_folk_ritual_group', 'Folk Ritual Dance (Group)', 'Dance', 10, 16, 0, '8-10 min', 'Stage II (Open Air Theatre)', 'Traditional Ritual Dance (Chhathi, Sagai, Baan, Chak Poojan, Byah, Vidai)', '10-16 students male & female. Traditional style only. No recorded film tune. No age limit.', NULL, 'No limit', '{"ritual_authenticity": 35, "traditional_presentation": 30, "coordination": 20, "costumes_props": 15}'::jsonb),
('dance_haryanvi_solo_female', 'Haryanvi Solo Dance (Female)', 'Dance', 1, 1, 4, '4-6 min', 'Stage II (Open Air Theatre)', 'Solo traditional folk dance of Haryana by female student', 'Haryanvi style and dress only. Max 4 accompanists (1 student singer allowed). No age limit.', NULL, 'No limit', '{"rhythm_grace": 35, "haryanvi_expression": 30, "footwork": 20, "costume_makeup": 15}'::jsonb),
('dance_haryanvi_solo_male', 'Haryanvi Solo Dance (Male)', 'Dance', 1, 1, 4, '4-6 min', 'Stage II (Open Air Theatre)', 'Solo traditional folk dance of Haryana by male student', 'Haryanvi style and dress only. Max 4 accompanists (1 student singer allowed). No age limit.', NULL, 'No limit', '{"folk_energy": 35, "traditional_steps": 30, "rhythm_taal": 20, "attire_appeal": 15}'::jsonb),

-- THEATRE (Items 19 - 22)
('theatre_one_act_play', 'One Act Play (Hindi / English / Regional)', 'Theatre', 4, 9, 5, '25-30 min', 'Stage I (Auditorium)', 'Dramatic Drama / Serious or Satirical One Act Play', 'Strict time limit 25 to 30 mins. Max 9 participants, 5 accompanists.', 25, '25 Years (as on July 1, 2026)', '{"acting_expression": 35, "direction_stagecraft": 25, "dialogue_delivery": 20, "theme_script": 20}'::jsonb),
('theatre_skit', 'Skit (Hindi / English / Regional)', 'Theatre', 4, 6, 3, '8-10 min', 'Stage I (Auditorium)', 'Short Humorous / Social Satirical Skit', 'Vulgarity or cheap comedy prohibited. Max 6 participants, 3 accompanists.', 25, '25 Years (as on July 1, 2026)', '{"humour_satire_content": 30, "acting_timing": 30, "dialogue_punch": 20, "social_message": 20}'::jsonb),
('theatre_mime', 'Mime', 'Theatre', 4, 6, 2, '4-5 min', 'Stage I (Auditorium)', 'Silent Pantomime with face paint and recorded/live music', 'No dialogue, sound effects or speech from performers. Max 6 participants, 2 accompanists.', 25, '25 Years (as on July 1, 2026)', '{"body_language_clarity": 35, "story_idea": 25, "timing_expression": 25, "make_up_costume": 15}'::jsonb),
('theatre_mimicry', 'Mimicry (Solo)*', 'Theatre', 1, 1, 0, '4-5 min', 'Stage I (Auditorium)', 'Voice modulation & imitation of machines, persons and sounds', 'Individual event. 15s grace time. Defamatory speech prohibited.', 25, '25 Years (as on July 1, 2026)', '{"voice_resemblance": 40, "variety_of_sounds": 30, "humour_wit": 20, "stage_confidence": 10}'::jsonb),

-- LITERARY (Items 23 - 28)
('lit_quiz', 'General Quiz (Team of 3)', 'Literary', 3, 3, 0, 'Preliminary + Final', 'Stage III (Seminar Hall)', 'Current Affairs, History, Haryana Culture, Science, Sports', 'Team of 3 students. Written prelim followed by oral finals.', 25, '25 Years (as on July 1, 2026)', '{"final_score": 100}'::jsonb),
('lit_vagmita_hindi', 'Vagmita (Hindi Elocution)*', 'Literary', 1, 1, 0, '4-5 min', 'Stage III (Seminar Hall)', 'Extempore speech on announced contemporary topic in Hindi', 'Paper reading strictly not allowed. 15s grace time.', 25, '25 Years (as on July 1, 2026)', '{"content_knowledge": 35, "language_fluency": 30, "articulation_expression": 20, "time_adherence": 15}'::jsonb),
('lit_elocution_english', 'English Elocution*', 'Literary', 1, 1, 0, '4-5 min', 'Stage III (Seminar Hall)', 'Speech in English on designated socio-economic theme', 'Paper reading not allowed. 15s grace time.', 25, '25 Years (as on July 1, 2026)', '{"content_depth": 35, "diction_vocabulary": 30, "confidence_body_language": 20, "timing": 15}'::jsonb),
('lit_debate_english', 'Debate - English (Team of 2)*', 'Literary', 2, 2, 0, '4-5 min each', 'Stage III (Seminar Hall)', '1 Participant FOR the motion, 1 Participant AGAINST the motion', 'Each speaker gets 4 to 5 minutes. 15s grace time. Paper reading prohibited.', 25, '25 Years (as on July 1, 2026)', '{"arguments_depth": 35, "rebuttal_oratory": 30, "fluency_style": 20, "decorum_timing": 15}'::jsonb),
('lit_debate_hindi', 'Vad Viwaad - Hindi Debate (Team of 2)*', 'Literary', 2, 2, 0, '4-5 min each', 'Stage III (Seminar Hall)', '1 Paksh (For), 1 Vipaksh (Against) in pure Hindi', 'Paper reading prohibited. 15s grace time.', 25, '25 Years (as on July 1, 2026)', '{"tark_shakti_arguments": 35, "shabdavali_shudhata": 30, "prabhawashali_vakta": 20, "samay_palan": 15}'::jsonb),
('lit_poetic_symposium', 'Poetic Symposium / Kavi Sammelan', 'Literary', 1, 1, 0, 'Decided by judges', 'Stage III (Seminar Hall)', 'Recitation of Self-Composed Poetry (Hindi / Haryanvi / Urdu / Punjabi / English)', 'Poem must be original and self-composed by participant. No age limit.', NULL, 'No limit', '{"poetic_merit_ras": 35, "recitation_tarannum": 30, "thought_uniqueness": 20, "audience_rapport": 15}'::jsonb),

-- FINE ARTS (Items 29 - 34)
('finearts_painting', 'On the Spot Painting', 'Fine Arts', 1, 1, 0, '120-150 min (2.5 Hours)', 'Stage IV (Fine Arts Studio)', 'Theme given on the spot. Water color, acrylic, or poster colors.', 'Drawing sheet provided by university (22" x 15"). Bring own colors/brushes.', 25, '25 Years (as on July 1, 2026)', '{"creativity_interpretation": 35, "composition_color_harmony": 35, "technical_skill": 20, "neatness": 10}'::jsonb),
('finearts_collage', 'Collage Making', 'Fine Arts', 1, 1, 0, '120-150 min (2.5 Hours)', 'Stage IV (Fine Arts Studio)', 'Collage making with magazines, newspapers and adhesive.', 'Hand tearing only (no scissors or blades). Theme given on the spot.', 25, '25 Years (as on July 1, 2026)', '{"theme_expression": 35, "artistic_arrangement": 30, "material_utilization": 25, "neatness": 10}'::jsonb),
('finearts_poster', 'Poster Making', 'Fine Arts', 1, 1, 0, '120-150 min (2.5 Hours)', 'Stage IV (Fine Arts Studio)', 'Poster design on national/social awareness theme', 'Half imperial sheet provided. Slogans allowed in Hindi or English.', 25, '25 Years (as on July 1, 2026)', '{"concept_visual_punch": 35, "typography_lettering": 30, "color_contrast": 25, "finishing": 10}'::jsonb),
('finearts_clay', 'Clay Modeling', 'Fine Arts', 1, 1, 0, '120-150 min (2.5 Hours)', 'Stage IV (Fine Arts Studio)', 'Sculpting in natural clay on specified theme (max 12" x 12" x 12")', 'Clay will be provided by host. Bring 2ft x 2ft plank. No molds or electric tools.', 25, '25 Years (as on July 1, 2026)', '{"sculptural_anatomy": 35, "creative_treatment": 30, "finish_texture": 25, "stability": 10}'::jsonb),
('finearts_cartooning', 'Cartooning', 'Fine Arts', 1, 1, 0, '120-150 min (2.5 Hours)', 'Stage IV (Fine Arts Studio)', 'Editorial / Comic Cartooning on political or cultural theme', 'Original caricature drawing with witty caption on half imperial sheet.', 25, '25 Years (as on July 1, 2026)', '{"wit_caricature": 35, "satirical_point": 30, "line_quality": 25, "neatness": 10}'::jsonb),
('finearts_rangoli', 'Rangoli', 'Fine Arts', 1, 1, 0, '120-150 min (2.5 Hours)', 'Stage IV (Fine Arts Studio)', 'Traditional Indian Floor Art (Floor space 4ft x 4ft)', 'Natural dry colors, flower petals, pulses. Freehand only. No stencils/dies.', 25, '25 Years (as on July 1, 2026)', '{"traditional_design": 35, "color_blending": 30, "symmetry_precision": 25, "overall_beauty": 10}'::jsonb),

-- CULTURAL PROCESSION (ADDITIONAL EVENT - AGE LIMIT IGNORED)
('cultural_procession', 'Cultural Procession (सांस्कृतिक शोभा यात्रा)', 'Procession', 10, 50, 0, '3-5 min', 'Inaugural Procession Route', 'Cultural procession / march past representing state, regional or national heritage.', 'Compulsory two college flags. Marks not counted towards Overall Championship Trophy. Age limit ignored.', NULL, 'No limit (Ignored)', '{"cultural_authenticity": 40, "discipline_march": 30, "presentation_costumes": 30}'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    participants_min = EXCLUDED.participants_min,
    participants_max = EXCLUDED.participants_max,
    accompanists_max = EXCLUDED.accompanists_max,
    time_limit = EXCLUDED.time_limit,
    stage = EXCLUDED.stage,
    description = EXCLUDED.description,
    rules = EXCLUDED.rules,
    age_limit = EXCLUDED.age_limit,
    age_limit_text = EXCLUDED.age_limit_text,
    scoring_criteria = EXCLUDED.scoring_criteria;

-- Insert initial announcements
INSERT INTO public.announcements (title, content, badge, is_pinned)
VALUES 
    ('13th Triveni Yuva Mahotsav Official Schedule Released', 'All colleges affiliated with CDLU must submit their team entries before the deadline. Inaugural function will begin at 9:30 AM in the University Auditorium.', 'Important', TRUE),
    ('I-Card Verification Notice', 'All student participants and accompanists must produce their official College ID and Mahotsav ID Slip during desk registration.', 'Notice', TRUE),
    ('Judges Orientation Briefing', 'Judges meeting scheduled at 9:00 AM in Committee Room, Vice-Chancellor Secretariat.', 'Judges', TRUE)
ON CONFLICT DO NOTHING;

-- Insert sample registrations for testing and instant preview
INSERT INTO public.registrations (
    id, event_id, event_name, category, college_name, college_id, participant_name, father_name, 
    gender, class_name, roll_no, dob, phone, email, team_manager_name, team_manager_phone, 
    team_manager_email, team_members, accompanists, status, chest_number
) VALUES 
(
    'CDLU-TYM-2026-001',
    'music_classical_vocal',
    'Classical Vocal Solo (Hindustani / Carnatic)',
    'Music',
    'University Teaching Departments (UTD), CDLU Sirsa',
    63,
    'Aman Sharma',
    'Sh. Rajesh Sharma',
    'Male',
    'MA Music (1st Sem)',
    '230101001',
    '2002-05-15',
    '9812345678',
    'aman.sharma@cdlu.ac.in',
    'Dr. K. S. Bishnoi',
    '9416000001',
    'cultural.utd@cdlu.ac.in',
    '[]'::jsonb,
    '[{"name": "Master Ramesh", "father_name": "Sh. Omprakash", "type": "Professional", "instrument": "Harmonium"}, {"name": "Suresh Kumar", "father_name": "Sh. Ram Niwas", "type": "Student", "instrument": "Tabla"}]'::jsonb,
    'Eligible',
    101
),
(
    'CDLU-TYM-2026-002',
    'dance_haryanvi_group',
    'Haryanvi Group Dance',
    'Dance',
    'Govt. National College, Sirsa',
    2655,
    'Sunita Devi',
    'Sh. Kuldeep Singh',
    'Female',
    'BA Final Year',
    '221004501',
    '2003-08-12',
    '9896000002',
    'sunita.gnc@gmail.com',
    'Prof. Neelam Rani',
    '9416000002',
    'contingent.gnc@gmail.com',
    '[
        {"name": "Pooja Rani", "father_name": "Sh. Rattan Lal", "class": "BA II", "roll_no": "221004502"},
        {"name": "Kavita Sihag", "father_name": "Sh. Balwan Singh", "class": "B.Sc II", "roll_no": "221004503"},
        {"name": "Monika", "father_name": "Sh. Dharamvir", "class": "BA I", "roll_no": "221004504"},
        {"name": "Anjali Verma", "father_name": "Sh. Mahabir Verma", "class": "B.Com III", "roll_no": "221004505"}
    ]'::jsonb,
    '[{"name": "Pandit Jagdish", "father_name": "Sh. Mani Ram", "type": "Professional", "instrument": "Dholak / Nagada"}]'::jsonb,
    'Eligible',
    102
),
(
    'CDLU-TYM-2026-003',
    'theatre_one_act_play',
    'One Act Play (Hindi / English / Haryanvi)',
    'Theatre',
    'Janta Girls College, Ellenabad',
    2618,
    'Ritika Mittal',
    'Sh. Pawan Mittal',
    'Female',
    'MA English',
    '230205010',
    '2001-11-20',
    '9416111222',
    'ritika.jgc@gmail.com',
    'Dr. Meenakshi',
    '9416000003',
    'theatre.jgc@gmail.com',
    '[
        {"name": "Simran Kaur", "father_name": "Sh. Harbhajan Singh", "class": "BA III", "roll_no": "220205011"},
        {"name": "Diksha", "father_name": "Sh. Subhash Chander", "class": "BA II", "roll_no": "220205012"},
        {"name": "Muskan", "father_name": "Sh. Rakesh", "class": "B.Com I", "roll_no": "230205013"}
    ]'::jsonb,
    '[]'::jsonb,
    'Eligible',
    103
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample scores so Admin Leaderboard and Judge portal has live interactive data immediately
INSERT INTO public.scores (
    registration_id, participant_name, college_id, event_id, event_name, 
    judge_id, judge_name, judge_email, criteria_breakdown, total_score, remarks, is_locked
)
SELECT 
    'CDLU-TYM-2026-001',
    'Aman Sharma',
    63,
    'music_classical_vocal',
    'Classical Vocal Solo (Hindustani / Carnatic)',
    j.id,
    j.name,
    j.email,
    '{"sur": 27, "taal": 26, "selection_of_raga": 18, "overall_impact": 18}'::jsonb,
    89.00,
    'Remarkable command over Raga Bhairav and vilambit khayal.',
    TRUE
FROM public.judges j WHERE j.email = 'judge.music@cdlu.ac.in'
ON CONFLICT (registration_id, judge_id, event_id) DO NOTHING;
