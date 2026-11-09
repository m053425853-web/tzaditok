-- ==========================================================================
-- צדיק-טוק (TzadikTok) - קוד SQL משלים לשדרוג V35 (Supabase SQL Editor)
-- בטוח להרצה חוזרת (Idempotent - IF NOT EXISTS): מוסיף טבלאות ועמודות חדשות
-- עבור קורסים שבועיים, סיפורי צדיקים, ישיבות, סורק מוצרי כשרות ושדות תרומה/תעודה
-- ==========================================================================

-- 1. הוספת עמודות חדשות לטבלאות קיימות (ללא פגיעה במידע קיים)
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS sub_category text DEFAULT 'הלכה';
ALTER TABLE IF EXISTS public.lessons ADD COLUMN IF NOT EXISTS donate_url text DEFAULT '';

ALTER TABLE IF EXISTS public.restaurants ADD COLUMN IF NOT EXISTS website_url text DEFAULT '';
ALTER TABLE IF EXISTS public.restaurants ADD COLUMN IF NOT EXISTS kosher_cert_info text DEFAULT '';

ALTER TABLE IF EXISTS public.gemachim ADD COLUMN IF NOT EXISTS items_list text DEFAULT '';
ALTER TABLE IF EXISTS public.gemachim ADD COLUMN IF NOT EXISTS donate_url text DEFAULT '';

ALTER TABLE IF EXISTS public.chabad_houses ADD COLUMN IF NOT EXISTS community_group_url text DEFAULT '';

-- 2. טבלת קורסים שבועיים חדשים (weekly_courses)
CREATE TABLE IF NOT EXISTS public.weekly_courses (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  rabbi text NOT NULL,
  schedule text DEFAULT 'פעם בשבוע',
  is_free boolean DEFAULT true,
  price_label text DEFAULT 'חינם (פתוח לכולם)',
  lessons_count text DEFAULT '10 מפגשים שבועיים',
  description text DEFAULT ''
);
ALTER TABLE public.weekly_courses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_courses' AND policyname = 'Public read weekly_courses') THEN
    CREATE POLICY "Public read weekly_courses" ON public.weekly_courses FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_courses' AND policyname = 'Authenticated insert weekly_courses') THEN
    CREATE POLICY "Authenticated insert weekly_courses" ON public.weekly_courses FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 3. טבלת סיפורי צדיקים במדור ללמוד (tzaddikim_stories)
CREATE TABLE IF NOT EXISTS public.tzaddikim_stories (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  rabbi text NOT NULL,
  category text DEFAULT 'סיפורי צדיקים',
  story text NOT NULL,
  moral text DEFAULT '',
  is_approved boolean DEFAULT true
);
ALTER TABLE public.tzaddikim_stories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tzaddikim_stories' AND policyname = 'Public read tzaddikim_stories') THEN
    CREATE POLICY "Public read tzaddikim_stories" ON public.tzaddikim_stories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tzaddikim_stories' AND policyname = 'Public insert tzaddikim_stories') THEN
    CREATE POLICY "Public insert tzaddikim_stories" ON public.tzaddikim_stories FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 4. טבלת ישיבות ומוסדות תורה (yeshivot)
CREATE TABLE IF NOT EXISTS public.yeshivot (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  type text DEFAULT 'ישיבה גבוהה ובית מדרש',
  city text DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  donate_url text DEFAULT '',
  description text DEFAULT '',
  is_approved boolean DEFAULT true
);
ALTER TABLE public.yeshivot ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'yeshivot' AND policyname = 'Public read yeshivot') THEN
    CREATE POLICY "Public read yeshivot" ON public.yeshivot FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'yeshivot' AND policyname = 'Public insert yeshivot') THEN
    CREATE POLICY "Public insert yeshivot" ON public.yeshivot FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 5. טבלת מוצרי ברקוד כשרות (kosher_products)
CREATE TABLE IF NOT EXISTS public.kosher_products (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  barcode text UNIQUE NOT NULL,
  product_name text NOT NULL,
  brand text DEFAULT '',
  kosher_status text DEFAULT 'כשר ✔',
  hechsher text DEFAULT '',
  notes text DEFAULT ''
);
ALTER TABLE public.kosher_products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kosher_products' AND policyname = 'Public read kosher_products') THEN
    CREATE POLICY "Public read kosher_products" ON public.kosher_products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kosher_products' AND policyname = 'Public insert kosher_products') THEN
    CREATE POLICY "Public insert kosher_products" ON public.kosher_products FOR INSERT WITH CHECK (true);
  END IF;
END $$;
