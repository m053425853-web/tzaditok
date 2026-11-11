-- ==========================================================================
-- צדיק-טוק (TzadikTok) - קוד SQL לשדרוג V39 (Supabase SQL Editor)
-- בטוח להרצה חוזרת (Idempotent):
-- 1. מוסיף לטבלת lessons תמיכה מלאה בהעלאת תוכן ע"י משתמשים עם is_approved = false כברירת מחדל
-- 2. מגדיר הרשאות UPDATE ו-DELETE על lessons ו-community_reviews למנהל המערכת בלבד (m053425853@gmail.com)
-- ==========================================================================

-- 1. וידוא מבנה טבלת lessons לתשתית העלאת תוכן במדור 'ללמוד'
CREATE TABLE IF NOT EXISTS public.lessons (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text DEFAULT '',
  video_url text DEFAULT '',
  category text DEFAULT 'הלכה',
  topic text DEFAULT 'הלכה',
  sub_category text DEFAULT 'הלכה',
  rabbi text DEFAULT 'בית המדרש',
  rabbi_name text DEFAULT 'בית המדרש',
  institution text DEFAULT 'צדיק-טוק',
  duration text DEFAULT '45:00',
  donate_url text DEFAULT '',
  is_approved boolean DEFAULT false
);

ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS video_url text DEFAULT '';
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS category text DEFAULT 'הלכה';
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS topic text DEFAULT 'הלכה';
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS sub_category text DEFAULT 'הלכה';
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS rabbi text DEFAULT 'בית המדרש';
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS rabbi_name text DEFAULT 'בית המדרש';
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS institution text DEFAULT 'צדיק-טוק';
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;
ALTER TABLE IF EXISTS public.lessons ALTER COLUMN is_approved SET DEFAULT false;

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lessons'
      AND cmd IN ('UPDATE', 'DELETE', 'ALL')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.lessons', pol.policyname);
  END LOOP;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lessons' AND policyname = 'Public read lessons') THEN
    CREATE POLICY "Public read lessons" ON public.lessons FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lessons' AND policyname = 'Public insert lessons pending approval') THEN
    CREATE POLICY "Public insert lessons pending approval" ON public.lessons FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- רק מנהל המערכת (m053425853@gmail.com) יכול לאשר (is_approved = true) או למחוק שיעורים ותכנים
CREATE POLICY "Admin only update lessons"
  ON public.lessons
  FOR UPDATE
  TO authenticated
  USING (lower(coalesce(auth.jwt() ->> 'email', '')) = 'm053425853@gmail.com')
  WITH CHECK (lower(coalesce(auth.jwt() ->> 'email', '')) = 'm053425853@gmail.com');

CREATE POLICY "Admin only delete lessons"
  ON public.lessons
  FOR DELETE
  TO authenticated
  USING (lower(coalesce(auth.jwt() ->> 'email', '')) = 'm053425853@gmail.com');


-- 2. נעילת הרשאות UPDATE ו-DELETE גם בטבלת community_reviews למנהל בלבד
ALTER TABLE IF EXISTS public.community_reviews ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_reviews'
      AND cmd IN ('UPDATE', 'DELETE', 'ALL')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.community_reviews', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admin only update community_reviews"
  ON public.community_reviews
  FOR UPDATE
  TO authenticated
  USING (lower(coalesce(auth.jwt() ->> 'email', '')) = 'm053425853@gmail.com')
  WITH CHECK (lower(coalesce(auth.jwt() ->> 'email', '')) = 'm053425853@gmail.com');

CREATE POLICY "Admin only delete community_reviews"
  ON public.community_reviews
  FOR DELETE
  TO authenticated
  USING (lower(coalesce(auth.jwt() ->> 'email', '')) = 'm053425853@gmail.com');
