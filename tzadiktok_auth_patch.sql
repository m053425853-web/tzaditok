-- ============================================================================
-- צדיק-טוק – תוספת ל-SQL (להריץ ב-Supabase SQL Editor, אחרי הסכמה המקורית)
-- ============================================================================

-- 1. ניקוי שורות כפולות (קורה אם הרצת את הסכמה עם ה-INSERT של ה-seed יותר מפעם אחת)
DELETE FROM public.lessons  a USING public.lessons  b WHERE a.id > b.id AND a.title = b.title AND a.rabbi_name = b.rabbi_name;
DELETE FROM public.chavruta a USING public.chavruta b WHERE a.id > b.id AND a.name  = b.name  AND a.phone      = b.phone;

-- 2. (אופציונלי) לשמור מי העלה כל שורה. ברירת המחדל auth.uid() ממלאת את זה אוטומטית
ALTER TABLE public.lessons    ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.chavruta   ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.minyanim   ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.rabbis     ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.gemachim   ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.tzaddikim  ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

-- 3. הוספת תוכן רק למשתמשים מחוברים (עד עכשיו ה-policy היה פתוח לכל מי שמחזיק את ה-anon key)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['lessons','minyanim','chavruta','rabbis','gemachim','tzaddikim'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public insert %1$s" ON public.%1$s', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth insert %1$s" ON public.%1$s', t);
    EXECUTE format('CREATE POLICY "Auth insert %1$s" ON public.%1$s FOR INSERT TO authenticated WITH CHECK (true)', t);
  END LOOP;
END $$;
