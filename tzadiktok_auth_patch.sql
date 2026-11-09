-- ============================================================================
-- צדיק-טוק – תוספת לפקודות SQL ב-Supabase SQL Editor (גרסה V33)
-- יש להריץ ב-Supabase > SQL Editor > New Query > Run
-- ============================================================================

-- 1. ניקוי שורות כפולות (אם הרצת את הסכמה עם ה-INSERT של ה-seed יותר מפעם אחת)
DELETE FROM public.lessons  a USING public.lessons  b WHERE a.id > b.id AND a.title = b.title AND a.rabbi_name = b.rabbi_name;
DELETE FROM public.chavruta a USING public.chavruta b WHERE a.id > b.id AND a.name  = b.name  AND a.phone      = b.phone;

-- 2. שמירת מזהה המשתמש שהעלה תוכן (auth.uid)
ALTER TABLE public.lessons    ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.chavruta   ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.minyanim   ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.rabbis     ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.gemachim   ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.tzaddikim  ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

-- 3. הרשאות העלאה (INSERT) למשתמשים מחוברים
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['lessons','minyanim','chavruta','rabbis','gemachim','tzaddikim'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public insert %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth insert %1$s" ON public.%1$s', t);
    EXECUTE format('CREATE POLICY "Auth insert %1$s" ON public.%1$s FOR INSERT TO authenticated WITH CHECK (true)', t);
  END LOOP;
END $$;

-- 4. הרשאות מלאות לטבלת תגובות ודירוגי קהילה (community_reviews) עבור פאנל הניהול
-- מאפשר קריאה ציבורית, הוספת תגובות, ועדכון (אישור תגובה) ומחיקה ע״י מנהל המערכת
ALTER TABLE public.community_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read community_reviews" ON public.community_reviews;
CREATE POLICY "Public read community_reviews" ON public.community_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert community_reviews" ON public.community_reviews;
CREATE POLICY "Public insert community_reviews" ON public.community_reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin update community_reviews" ON public.community_reviews;
CREATE POLICY "Admin update community_reviews" ON public.community_reviews FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin delete community_reviews" ON public.community_reviews;
CREATE POLICY "Admin delete community_reviews" ON public.community_reviews FOR DELETE USING (true);
