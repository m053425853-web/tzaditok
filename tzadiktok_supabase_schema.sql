-- ============================================================================
-- צדיק-טוק (TzadikTok Super-App) - קוד מלא להרצה ב-Supabase SQL Editor
-- הוראות: העתק את כל הקוד הזה, הדבק ב-SQL Editor ב-Supabase ולחץ על RUN
-- ============================================================================

-- 1. טבלת שיעורים ושידורים חיים (lessons) - עבור מדור 'ללמוד -> שידור חי ושיעורים' ו-'סרטונים חינוכיים'
CREATE TABLE IF NOT EXISTS public.lessons (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  rabbi_name TEXT NOT NULL,
  institution TEXT DEFAULT 'בית המדרש צדיק-טוק',
  topic TEXT DEFAULT 'שיעור תורה',
  category TEXT DEFAULT 'פרשת השבוע והלכה',
  type TEXT DEFAULT 'שידור חי ומוקלט',
  duration TEXT DEFAULT '45:00',
  video_url TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  description TEXT DEFAULT '',
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. טבלת מניינים (minyanim) - עבור 'למצוא -> מניינים'
CREATE TABLE IF NOT EXISTS public.minyanim (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  nusach TEXT DEFAULT 'עדות המזרח',
  city TEXT NOT NULL,
  address TEXT DEFAULT '',
  shacharit TEXT DEFAULT '07:00, 08:00',
  mincha TEXT DEFAULT '13:30, 16:20',
  arvit TEXT DEFAULT '17:15, 20:30',
  phone TEXT DEFAULT '',
  lat DOUBLE PRECISION DEFAULT 32.0840,
  lng DOUBLE PRECISION DEFAULT 34.8352,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. טבלת חברותא (chavruta) - עבור 'למצוא -> חברותא'
CREATE TABLE IF NOT EXISTS public.chavruta (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  mode TEXT DEFAULT 'פנים אל פנים / טלפוני',
  city TEXT DEFAULT 'כל הארץ',
  hours TEXT DEFAULT 'בתיאום אישי',
  phone TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. טבלת קו הלכה ורבנים פוסקים (rabbis) - עבור 'למצוא -> קו הלכה ורבנים'
CREATE TABLE IF NOT EXISTS public.rabbis (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT DEFAULT 'פוסק הלכה ומורה הוראה',
  city TEXT DEFAULT 'מענה ארצי',
  phone TEXT NOT NULL,
  hours TEXT DEFAULT 'א׳-ה׳ 09:00-22:00',
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. טבלת גמ"חים וארגוני הצלה (gemachim) - עבור 'למצוא -> גמ"חים'
CREATE TABLE IF NOT EXISTS public.gemachim (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT DEFAULT '',
  hours TEXT DEFAULT 'א׳-ה׳ 09:00-21:00',
  phone TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. טבלת קברי צדיקים (tzaddikim) - עבור 'למצוא -> קברי צדיקים'
CREATE TABLE IF NOT EXISTS public.tzaddikim (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT DEFAULT '',
  city TEXT NOT NULL,
  region TEXT DEFAULT 'ארץ ישראל',
  yahrzeit TEXT DEFAULT '',
  segula TEXT DEFAULT '',
  story TEXT DEFAULT '',
  image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  lat DOUBLE PRECISION DEFAULT 32.98,
  lng DOUBLE PRECISION DEFAULT 35.44,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. טבלת מוקד תפילות קהילתי והדלקת נרות (prayer_wall)
CREATE TABLE IF NOT EXISTS public.prayer_wall (
  id BIGSERIAL PRIMARY KEY,
  prayer_for_name TEXT NOT NULL,
  category TEXT DEFAULT 'לרפואה שלמה',
  tzaddik_name TEXT DEFAULT 'כלל צדיקי הדורות',
  request_text TEXT DEFAULT '',
  submitted_by TEXT DEFAULT 'חבר קהילה',
  amen_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. טבלת תגובות ודירוגים של הקהילה (community_reviews) - עם מודרציה
CREATE TABLE IF NOT EXISTS public.community_reviews (
  id BIGSERIAL PRIMARY KEY,
  entity_key TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  criteria TEXT DEFAULT '',
  review_text TEXT NOT NULL,
  status TEXT DEFAULT 'ממתין לאישור מודרציה',
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. טבלת פורום הקהילה וסיפורי צדיקים (forum_posts)
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id BIGSERIAL PRIMARY KEY,
  category TEXT DEFAULT 'דברי תורה ופרשת השבוע',
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  source_ref TEXT DEFAULT '',
  likes INTEGER DEFAULT 1,
  replies_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ממתין לאישור מודרציה',
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- הפעלת Row Level Security (RLS) והרשאות קריאה והוספה לאפליקציה
-- ============================================================================
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minyanim ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chavruta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rabbis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gemachim ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tzaddikim ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_wall ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- הרשאות קריאה פומביות (SELECT) לכל המשתמשים באתר
DROP POLICY IF EXISTS "Public read lessons" ON public.lessons;
CREATE POLICY "Public read lessons" ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert lessons" ON public.lessons;
CREATE POLICY "Public insert lessons" ON public.lessons FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read minyanim" ON public.minyanim;
CREATE POLICY "Public read minyanim" ON public.minyanim FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert minyanim" ON public.minyanim;
CREATE POLICY "Public insert minyanim" ON public.minyanim FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read chavruta" ON public.chavruta;
CREATE POLICY "Public read chavruta" ON public.chavruta FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert chavruta" ON public.chavruta;
CREATE POLICY "Public insert chavruta" ON public.chavruta FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read rabbis" ON public.rabbis;
CREATE POLICY "Public read rabbis" ON public.rabbis FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert rabbis" ON public.rabbis;
CREATE POLICY "Public insert rabbis" ON public.rabbis FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read gemachim" ON public.gemachim;
CREATE POLICY "Public read gemachim" ON public.gemachim FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert gemachim" ON public.gemachim;
CREATE POLICY "Public insert gemachim" ON public.gemachim FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read tzaddikim" ON public.tzaddikim;
CREATE POLICY "Public read tzaddikim" ON public.tzaddikim FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert tzaddikim" ON public.tzaddikim;
CREATE POLICY "Public insert tzaddikim" ON public.tzaddikim FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read prayer_wall" ON public.prayer_wall;
CREATE POLICY "Public read prayer_wall" ON public.prayer_wall FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert prayer_wall" ON public.prayer_wall;
CREATE POLICY "Public insert prayer_wall" ON public.prayer_wall FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read community_reviews" ON public.community_reviews;
CREATE POLICY "Public read community_reviews" ON public.community_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert community_reviews" ON public.community_reviews;
CREATE POLICY "Public insert community_reviews" ON public.community_reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read forum_posts" ON public.forum_posts;
CREATE POLICY "Public read forum_posts" ON public.forum_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert forum_posts" ON public.forum_posts;
CREATE POLICY "Public insert forum_posts" ON public.forum_posts FOR INSERT WITH CHECK (true);

-- ============================================================================
-- הזנת נתונים ראשוניים (Seed Data) לטבלת lessons ולשאר הטבלאות
-- ============================================================================
INSERT INTO public.lessons (title, rabbi_name, institution, topic, category, type, duration, video_url, description)
VALUES
  ('הלכות ברכות ותפילה למעשה • הלוויין השבועי', 'הרב יצחק יוסף שליט״א', 'בית המדרש יחוה דעת, ירושלים', 'הלכה למעשה', 'פרשת השבוע והלכה', 'שידור חי ומוקלט', '52:00', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'שיעור הלכתי מקיף בהלכות ברכות השחר ותפילה.'),
  ('אמונה וביטחון בה׳ • איך לחיות בשמחה וברוגע', 'הרב יגאל כהן שליט״א', 'בית המדרש יביע אומר, בני ברק', 'אמונה וחיזוק', 'רבנים וגדולי הדורות', 'שיעור וידאו מרכזי', '48:20', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'חיזוק באמונה והשגחה פרטית בחיי היום-יום.'),
  ('אורות פרשת השבוע וגאולת ישראל', 'הרב שמואל אליהו שליט״א', 'בית הכנסת המרכזי, צפת', 'פרשת השבוע', 'פרשת השבוע והלכה', 'שידור חי ומוקלט', '41:15', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'מסרים מפרשת השבוע לחיי המשפחה והעם.'),
  ('פרשת השבוע במבט החסידות והרבי מליובאוויטש', 'הרב שניאור אשכנזי שליט״א', 'שיעורי חסידות ותניא', 'חסידות ופרשה', 'רבנים וגדולי הדורות', 'שיעור וידאו מרכזי', '44:50', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'ביאור עמוק בפרשת השבוע על פי תורת החסידות.');

INSERT INTO public.chavruta (name, topic, mode, city, hours, phone, description)
VALUES
  ('אריאל כהן • אברך ובן תורה', 'גמרא • הדף היומי או מסכת ברכות', 'פנים אל פנים / טלפוני', 'בני ברק', '20:30–22:00', '052-7611223', 'לימוד בחברותא באווירה נעימה ומאירת פנים.'),
  ('נתנאל לוי • לימוד הלכה ופרשה', 'משנה ברורה / ילקוט יוסף ופרשת השבוע', 'טלפוני / זום', 'ירושלים', '08:30–09:15 או 21:00', '054-8422334', 'לימוד יומי קבוע של 20-30 דקות בהלכה למעשה.');
