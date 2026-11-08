/* ==========================================================================
   צדיק-טוק (TzadikTok Super-App) - פונקציות עזר גלובליות (utils.js)
   ========================================================================== */

var STORAGE_KEYS = {
  CART: "tzadiktok_cart_v18",
  NUSACH: "tzadiktok_nusach_v18",
  LIKES: "tzadiktok_likes_v18",
  CUSTOM_MITZVOT: "tzadiktok_mitzvot_v18",
  CUSTOM_MUSIC: "tzadiktok_music_v18",
  INTRO_SEEN: "tzadiktok_intro_seen_v18",

  /* V30: מפתחות שהיו חסרים. ב-app.js נעשה בהם שימוש (STORAGE_KEYS.RABBI_SHIURIM וכו'),
     אבל הם לא הוגדרו => הערך היה undefined => כל הנתונים נכתבו ל-localStorage["undefined"]
     ונדרסו זה את זה (מקור הכפילויות, ה-undefined בחברותא, וההתחברות שלא נשמרה). */
  USER_ACCOUNT: "tzadiktok_user_account_v19",
  RABBI_SHIURIM: "tzadiktok_rabbi_shiurim_v19",
  CHAVRUTA_LIST: "tzadiktok_chavruta_list_v19",
  PRAYER_WALL: "tzadiktok_prayer_wall_v19",
  FORUM_POSTS: "tzadiktok_forum_posts_v19",
  EDU_VIDEOS: "tzadiktok_edu_videos_v19",
  COMMUNITY_REVIEWS: "tzadiktok_community_reviews_v19",
  MY_SUBMISSIONS: "tzadiktok_my_submissions_v19",
  MY_YAHRZEITS: "tzadiktok_my_yahrzeits_v19",
  SAVED_ITEMS: "tzadiktok_saved_items_v19",
  HISTORY_ITEMS: "tzadiktok_history_items_v19",
  FOLLOWED_CREATORS: "tzadiktok_followed_creators_v19",
  WATCHED_EPISODES: "tzadiktok_watched_episodes_v19",
  MINYAN_CALLS: "tzadiktok_minyan_calls_v19",
  MITZVAH_TRACKER: "tzadiktok_mitzvah_tracker_v19",
  QUIZ_RESULTS: "tzadiktok_quiz_results_v19",
  STREAK_POINTS: "tzadiktok_streak_points_v19",
  STUDIO_DRAFTS: "tzadiktok_studio_drafts_v19",
  ORDERS_HISTORY: "tzadiktok_orders_history_v19",
  PREMIUM_STATUS: "tzadiktok_premium_status_v19",
  REL_SERVICES: "tzadiktok_rel_services_v19",
  ADMIN_LOGS: "tzadiktok_admin_logs_v19",
  ADMIN_ROLE: "tzadiktok_admin_role_v19",
  CITY_LOC: "tzadiktok_city_loc_v19",
  CUSTOM_LOGO: "tzadiktok_custom_logo_v19",
  LANGUAGE: "tzadiktok_language_v19",
  SHABBAT_ACTIVE: "tzadiktok_shabbat_active_v19"
};

/* ניקוי חד-פעמי של הזבל שנצבר במפתח "undefined" אצל משתמשים קיימים */
try { localStorage.removeItem("undefined"); } catch (e) {}

/* V30: ניקוי טקסט שמגיע ממסד הנתונים לפני שהוא נכנס ל-innerHTML / onclick="..."
   (כל אחד יכול להכניס שורות לטבלאות עם ה-anon key, לכן לא סומכים על התוכן). */
window.sbSafe = function(v) {
  return String(v == null ? "" : v)
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/['`\\]/g, "")
    .trim();
};
window.sbSafeUrl = function(v) {
  var u = String(v == null ? "" : v).trim();
  return /^https?:\/\/[^\s"'<>`\\]+$/i.test(u) ? u : "";
};
window.sbSafePhone = function(v) {
  return String(v == null ? "" : v).replace(/[^0-9+\-\s()]/g, "").trim();
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

window.buildWazeUrl = function(a, b) {
  /* V30: הקריאות באפליקציה שולחות (lat, lng); לפני כן נלקח רק ה-lat והקישור לא עבד */
  if (b !== undefined && b !== null && b !== "" && !isNaN(a) && !isNaN(b)) {
    return "https://waze.com/ul?ll=" + encodeURIComponent(a + "," + b) + "&navigate=yes";
  }
  return "https://waze.com/ul?q=" + encodeURIComponent(a || "");
};

window.buildGoogleMapsUrl = function(name, city) {
  var q = ((name || "") + " " + (city || "")).trim();
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
};

window.buildWhatsAppUrl = function(phone, textMessage) {
  var cleanPhone = String(phone || "972500000000").replace(/[^0-9]/g, "");
  var msg = textMessage ? "?text=" + encodeURIComponent(textMessage) : "";
  return "https://wa.me/" + cleanPhone + msg;
};

window.buildTelUrl = function(phone) {
  return "tel:" + String(phone || "").replace(/-/g, "").trim();
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
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackVal;
  } catch (e) {
    return fallbackVal;
  }
};

window.setStorageJson = function(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

window.formatPriceILS = function(num) {
  return "₪" + Number(num || 0).toLocaleString();
};
