/* ==========================================================================
   צדיק-טוק (TzadikTok Super-App) - פונקציות עזר גלובליות ואבטחה (utils.js - V36)
   כולל:
   1. כל מפתחות ה-STORAGE_KEYS המלאים (למניעת דריסת נתונים תחת undefined)
   2. פונקציית אבטחה escapeHtml() למניעת XSS בכל תצוגת innerHTML
   3. נירמול חיפוש בעברית (הסרת ניקוד, האחדת גרשיים) + מילון כינויים וראשי תיבות
   4. פונקציית השהיית הקלדה debounce(fn, 200)
   ========================================================================== */

var STORAGE_KEYS = {
  // מפתחות בסיס
  CART: "tzadiktok_cart_v18",
  NUSACH: "tzadiktok_nusach_v18",
  LIKES: "tzadiktok_likes_v18",
  CUSTOM_MITZVOT: "tzadiktok_mitzvot_v18",
  CUSTOM_MUSIC: "tzadiktok_music_v18",
  INTRO_SEEN: "tzadiktok_intro_seen_v18",
  LANGUAGE: "tzadiktok_lang_v18",
  CITY_LOC: "tzadiktok_city_v18",
  USER_ACCOUNT: "tzadiktok_user_account_v18",
  SHABBAT_ACTIVE: "tzadiktok_shabbat_active_v18",
  COMMUNITY_REVIEWS: "tzadiktok_community_reviews_v18",
  ADMIN_LOGS: "tzadiktok_admin_logs_v18",
  MY_SUBMISSIONS: "tzadiktok_my_submissions_v18",

  // 20 המפתחות שהיו חסרים וגרמו לדריסת נתונים תחת undefined
  ADMIN_ROLE: "tzadiktok_admin_role_v36",
  CHAVRUTA_LIST: "tzadiktok_chavruta_list_v36",
  CUSTOM_LOGO: "tzadiktok_custom_logo_v36",
  EDU_VIDEOS: "tzadiktok_edu_videos_v36",
  FOLLOWED_CREATORS: "tzadiktok_followed_creators_v36",
  FORUM_POSTS: "tzadiktok_forum_posts_v36",
  HISTORY_ITEMS: "tzadiktok_history_items_v36",
  MINYAN_CALLS: "tzadiktok_minyan_calls_v36",
  MITZVAH_TRACKER: "tzadiktok_mitzvah_tracker_v36",
  MY_YAHRZEITS: "tzadiktok_my_yahrzeits_v36",
  ORDERS_HISTORY: "tzadiktok_orders_history_v36",
  PRAYER_WALL: "tzadiktok_prayer_wall_v36",
  PREMIUM_STATUS: "tzadiktok_premium_status_v36",
  QUIZ_RESULTS: "tzadiktok_quiz_results_v36",
  RABBI_SHIURIM: "tzadiktok_rabbi_shiurim_v36",
  REL_SERVICES: "tzadiktok_rel_services_v36",
  SAVED_ITEMS: "tzadiktok_saved_items_v36",
  STREAK_POINTS: "tzadiktok_streak_points_v36",
  STUDIO_DRAFTS: "tzadiktok_studio_drafts_v36",
  WATCHED_EPISODES: "tzadiktok_watched_episodes_v36",

  // מפתחות שדרוגי תוכן V35-V36
  WEEKLY_COURSES: "tzadiktok_weekly_courses_v35",
  JOINED_COURSES: "tzadiktok_joined_courses_v35",
  TZADDIKIM_STORIES: "tzadiktok_stories_learn_v35",
  KOSHER_BARCODES: "tzadiktok_kosher_barcodes_v35"
};
window.STORAGE_KEYS = STORAGE_KEYS;

// 1. הגנת XSS מלאה: ניקוי כל מחרוזת שמגיעה מהמשתמש או ממסד הנתונים לפני הצגה ב-innerHTML
window.escapeHtml = function(val) {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// קיצור נוח לשימוש בתבניות HTML ובאטריביוטים של onclick
window.escAttr = function(val) {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "")
    .replace(/`/g, "");
};

// 2. נירמול טקסט חיפוש בעברית: הסרת ניקוד וטעמים, האחדת והסרת גרשיים/מרכאות ורווחים כפולים
window.normalizeHebrewSearch = function(str) {
  if (!str) return "";
  return String(str)
    .replace(/[\u0591-\u05C7]/g, "") // הסרת ניקוד וטעמי המקרא
    .replace(/["'״׳’‘”“`´\-–—•]/g, " ") // האחדת גרשיים, מרכאות ומקפים לרווח
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

// גרסה ללא רווחים להשוואת ראשי תיבות (כגון רשב"י -> רשבי)
window.normalizeCompactHebrew = function(str) {
  if (!str) return "";
  return String(str)
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/["'״׳’‘”“`´\-–—•\s]/g, "")
    .toLowerCase();
};

// 3. מילון כינויים וראשי תיבות דו-כיווני לחיפוש חכם (צדיקים, רבנים, ערים ומושגים)
window.SEARCH_ALIASES = [
  ["רשבי", "רבי שמעון בר יוחאי", "שמעון בר יוחאי", "מירון", "בר יוחאי", "הילולת רשבי"],
  ["הארי", "אריזל", "האריזל", "רבי יצחק לוריא", "יצחק לוריא", "הארי הקדוש"],
  ["רמבם", "הרמבם", "רבי משה בן מימון", "משה בן מימון", "הנשר הגדול"],
  ["בבא סאלי", "הבבא סאלי", "סידנא בבא סאלי", "רבי ישראל אבוחצירא", "ישראל אבוחצירא", "אבוחצירא"],
  ["בעשט", "הבעשט", "בעל שם טוב", "הבעל שם טוב", "ישראל בן אליעזר", "מזיבוז"],
  ["מוהרן", "רבי נחמן", "נחמן מברסלב", "ברסלב", "אומן", "ליקוטי מוהרן"],
  ["חפץ חיים", "החפץ חיים", "ישראל מאיר הכהן", "ראדין", "שמירת הלשון"],
  ["חזון איש", "החזון איש", "אברהם ישעיהו קרליץ"],
  ["אור החיים", "אור החיים הקדוש", "חיים בן עטר"],
  ["רבי מאיר", "רבי מאיר בעל הנס", "מאיר בעל הנס"],
  ["החידא", "חידא", "חיים יוסף דוד אזולאי"],
  ["מרן", "הרב עובדיה", "עובדיה יוסף", "יביע אומר", "יחוה דעת"],
  ["רשי", "רבי שלמה יצחקי", "שלמה יצחקי"],
  ["רמבן", "הרמבן", "רבי משה בן נחמן", "משה בן נחמן"],
  ["רבי אלימלך", "אלימלך מליזנסק", "ליזנסק", "נועם אלימלך"],
  ["רבי ישעיהלה", "ישעיהו מקרעסטיר", "קרעסטיר", "קרסטיר"],
  ["גמח", "גמחים", "גמילות חסדים", "השאלת ציוד", "חסד"],
  ["יד שרה", "עזר מציון", "ציוד רפואי", "כיסא גלגלים", "מחולל חמצן"],
  ["ידידים", "סיוע בדרכים", "כבלים לרכב", "בוסטר"],
  ["איחוד הצלה", "הצלה", "עזרה ראשונה", "חובשים"]
];

// בניית מערך מונחי חיפוש מורחב עבור שאילתה
window.expandSearchQueryTerms = function(rawQuery) {
  var norm = window.normalizeHebrewSearch(rawQuery);
  var compact = window.normalizeCompactHebrew(rawQuery);
  if (!norm && !compact) return [];
  var terms = [norm];
  if (compact && terms.indexOf(compact) === -1) terms.push(compact);

  (window.SEARCH_ALIASES || []).forEach(function(group) {
    var matchedGroup = group.some(function(alias) {
      var na = window.normalizeHebrewSearch(alias);
      var ca = window.normalizeCompactHebrew(alias);
      return (norm.length >= 2 && (na.indexOf(norm) !== -1 || norm.indexOf(na) !== -1)) ||
             (compact.length >= 2 && (ca.indexOf(compact) !== -1 || compact.indexOf(ca) !== -1));
    });
    if (matchedGroup) {
      group.forEach(function(alias) {
        var na = window.normalizeHebrewSearch(alias);
        var ca = window.normalizeCompactHebrew(alias);
        if (na && terms.indexOf(na) === -1) terms.push(na);
        if (ca && terms.indexOf(ca) === -1) terms.push(ca);
      });
    }
  });
  return terms;
};

// בדיקה חכמה האם אובייקט/טקסט תואם לשאילתת חיפוש (כולל תיאורים וכינויים)
window.matchesSmartSearch = function(haystackParts, rawQuery) {
  var q = (rawQuery || "").trim();
  if (!q || q === "all") return true;
  var joined = Array.isArray(haystackParts) ? haystackParts.filter(Boolean).join(" ") : String(haystackParts || "");
  var hayNorm = window.normalizeHebrewSearch(joined);
  var hayCompact = window.normalizeCompactHebrew(joined);
  var terms = window.expandSearchQueryTerms(q);
  if (!terms.length) return true;
  return terms.some(function(term) {
    return hayNorm.indexOf(term) !== -1 || hayCompact.indexOf(term) !== -1;
  });
};

// 4. השהיית הקלדה (Debounce) של 200ms למניעת עומס וקריסות בזמן הקלדה מהירה
window.debounce = function(fn, delay) {
  var wait = typeof delay === "number" ? delay : 200;
  var timer = null;
  return function() {
    var ctx = this;
    var args = arguments;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(ctx, args);
    }, wait);
  };
};

window.toast = function(text) {
  var t = document.getElementById("toast");
  var tt = document.getElementById("toast-text");
  if (!t || !tt) return;
  tt.textContent = text;
  t.classList.remove("opacity-0", "-translate-y-4");
  t.classList.add("opacity-100", "translate-y-0");
  setTimeout(function() {
    t.classList.remove("opacity-100", "translate-y-0");
    t.classList.add("opacity-0", "-translate-y-4");
  }, 2600);
};

window.getHebrewDateString = function() {
  try {
    var today = new Date();
    return new Intl.DateTimeFormat("he-IL-u-ca-hebrew", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(today);
  } catch (e) {
    return "כ״ח במרחשוון תשפ״ז";
  }
};

window.updateTodayDate = function() {
  var hebStr = window.getHebrewDateString();
  var el = document.getElementById("todayHebrewHeader");
  if (el) el.textContent = hebStr;
};

// קישור ניווט Waze אמיתי ותקני: https://waze.com/ul?q=[הכתובת]
window.buildWazeUrl = function(query, query2) {
  if (typeof query === "number" && typeof query2 === "number") {
    return "https://waze.com/ul?ll=" + query + "," + query2 + "&navigate=yes";
  }
  var q = String(query || query2 || "ישראל").trim();
  return "https://waze.com/ul?q=" + encodeURIComponent(q);
};

window.buildGoogleMapsUrl = function(name, city) {
  var q = ((name || "") + " " + (city || "")).trim();
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
};

// קישור וואטסאפ ישיר ותקני: https://wa.me/972[הטלפון בלי אפס]
window.buildWhatsAppUrl = function(phone, textMessage) {
  var cleanPhone = String(phone || "").replace(/[^0-9]/g, "");
  if (cleanPhone.indexOf("972") === 0) cleanPhone = cleanPhone.slice(3);
  if (cleanPhone.indexOf("0") === 0) cleanPhone = cleanPhone.slice(1);
  if (!cleanPhone) cleanPhone = "500000000";
  var msg = textMessage ? "?text=" + encodeURIComponent(textMessage) : "";
  return "https://wa.me/972" + cleanPhone + msg;
};

window.buildTelUrl = function(phone) {
  return "tel:" + String(phone || "").replace(/[^0-9+*#]/g, "").trim();
};

window.calculateGpsDistanceKm = function(lat1, lon1, lat2, lon2) {
  var toRad = function(deg) { return (deg * Math.PI) / 180; };
  var R = 6371;
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(1);
};

window.getStorageJson = function(key, fallbackVal) {
  try {
    if (!key || key === "undefined") return fallbackVal;
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackVal;
  } catch (e) {
    return fallbackVal;
  }
};

window.setStorageJson = function(key, val) {
  try {
    if (!key || key === "undefined") return;
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

window.formatPriceILS = function(num) {
  return "₪" + Number(num || 0).toLocaleString();
};

window.sbSafe = function(v) { return v ? window.escapeHtml(String(v).trim()) : ""; };
window.sbSafeUrl = function(v, d) {
  var s = v ? String(v).trim() : (d || "");
  if (/^javascript:/i.test(s)) return "#";
  return window.escapeHtml(s);
};
window.sbSafePhone = function(v) { return v ? window.escapeHtml(String(v).trim()) : ""; };
