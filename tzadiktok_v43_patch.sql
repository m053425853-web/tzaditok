-- ============================================================================
-- צדיק-טוק (TzadikTok) — קובץ עדכון לייקים אמיתיים ב-Supabase (V43)
-- 1. מוסיף עמודת `likes_count` (ברירת מחדל 0) לטבלת `lessons`.
-- 2. יוצר פונקציית RPC מאובטחת `increment_lesson_likes` שמאפשרת לכל משתמש
--    ללחוץ על הלב (להוסיף 1 או להוריד 1) ולשמור את המספר האמיתי במסד הנתונים.
-- ============================================================================

-- 1. הוספת עמודת likes_count שמתחילה מ-0 בטבלת lessons
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0 NOT NULL;

-- איפוס ערכי NULL אם היו קיימים ל-0
UPDATE public.lessons SET likes_count = 0 WHERE likes_count IS NULL;

-- 2. פונקציית RPC לעדכון אטומי של מספר הלייקים בטבלת lessons (+1 או -1, לא יורד מתחת ל-0)
CREATE OR REPLACE FUNCTION public.increment_lesson_likes(row_id bigint, delta_val integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_val integer;
BEGIN
  UPDATE public.lessons
  SET likes_count = GREATEST(0, COALESCE(likes_count, 0) + delta_val)
  WHERE id = row_id
  RETURNING likes_count INTO new_val;

  RETURN COALESCE(new_val, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_lesson_likes(bigint, integer) TO anon, authenticated;

-- רענון סכמת PostgREST
NOTIFY pgrst, 'reload schema';
