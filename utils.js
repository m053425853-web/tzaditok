/* ==========================================================================
   צדיק-טוק (TzadikTok Super-App) - פונקציות עזר גלובליות ואבטחה (utils.js - V37)
   כולל:
   1. כל 37 מפתחות ה-STORAGE_KEYS המלאים + מחיקה אוטומטית של localStorage.removeItem("undefined")
   2. פונקציית escapeHtml() להגנת XSS
   3. נירמול טקסט חיפוש בעברית (הסרת ניקוד, האחדת גרשיים) + מילון כינויים
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

  // 20 המפתחות שהיו חסרים וגרמו לשמירה תחת "undefined"
  ADMIN_ROLE: "tzadiktok_admin_role_v37",
  CHAVRUTA_LIST: "tzadiktok_chavruta_list_v37",
  CUSTOM_LOGO: "tzadiktok_custom_logo_v37",
  EDU_VIDEOS: "tzadiktok_edu_videos_v37",
  FOLLOWED_CREATORS: "tzadiktok_followed_creators_v37",
  FORUM_POSTS: "tzadiktok_forum_posts_v37",
  HISTORY_ITEMS: "tzadiktok_history_items_v37",
  MINYAN_CALLS: "tzadiktok_minyan_calls_v37",
  MITZVAH_TRACKER: "tzadiktok_mitzvah_tracker_v37",
  MY_YAHRZEITS: "tzadiktok_my_yahrzeits_v37",
  ORDERS_HISTORY: "tzadiktok_orders_history_v37",
  PRAYER_WALL: "tzadiktok_prayer_wall_v37",
  PREMIUM_STATUS: "tzadiktok_premium_status_v37",
  QUIZ_RESULTS: "tzadiktok_quiz_results_v37",
  RABBI_SHIURIM: "tzadiktok_rabbi_shiurim_v37",
  REL_SERVICES: "tzadiktok_rel_services_v37",
  SAVED_ITEMS: "tzadiktok_saved_items_v37",
  STREAK_POINTS: "tzadiktok_streak_points_v37",
  STUDIO_DRAFTS: "tzadiktok_studio_drafts_v37",
  WATCHED_EPISODES: "tzadiktok_watched_episodes_v37",

  // מפתחות קורסים, סיפורי צדיקים וסורק ברקוד
  WEEKLY_COURSES: "tzadiktok_weekly_courses_v35",
  JOINED_COURSES: "tzadiktok_joined_courses_v35",
  TZADDIKIM_STORIES: "tzadiktok_stories_learn_v35",
  KOSHER_BARCODES: "tzadiktok_kosher_barcodes_v35"
};
window.STORAGE_KEYS = STORAGE_KEYS;

// ניקוי מיידי של המפתח השבור "undefined" מ-localStorage
try {
  localStorage.removeItem("undefined");
} catch (e) {}

// הגנת XSS לכל טקסט שמוצג ב-innerHTML
window.escapeHtml = function(val) {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

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

// נירמול טקסט חיפוש בעברית: הסרת ניקוד וטעמים, האחדת גרשיים ומרכאות
window.normalizeHebrewSearch = function(str) {
  if (!str) return "";
  return String(str)
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/["'״׳’‘”“`´\-–—•]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

window.normalizeCompactHebrew = function(str) {
  if (!str) return "";
  return String(str)
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/["'״׳’‘”“`´\-–—•\s]/g, "")
    .toLowerCase();
};

window.SEARCH_ALIASES = [
  ["רשבי", "רבי שמעון בר יוחאי", "שמעון בר יוחאי", "מירון", "בר יוחאי"],
  ["הארי", "אריזל", "האריזל", "רבי יצחק לוריא", "יצחק לוריא", "צפת"],
  ["רמבם", "הרמבם", "רבי משה בן מימון", "משה בן מימון", "הנשר הגדול"],
  ["בבא סאלי", "הבבא סאלי", "סידנא בבא סאלי", "רבי ישראל אבוחצירא", "ישראל אבוחצירא", "נתיבות"],
  ["בעשט", "הבעשט", "בעל שם טוב", "הבעל שם טוב", "ישראל בן אליעזר"],
  ["מוהרן", "רבי נחמן", "נחמן מברסלב", "ברסלב", "אומן"],
  ["חפץ חיים", "החפץ חיים", "ישראל מאיר הכהן", "שמירת הלשון"],
  ["חזון איש", "החזון איש", "אברהם ישעיהו קרליץ"],
  ["אור החיים", "אור החיים הקדוש", "חיים בן עטר"],
  ["רבי מאיר", "רבי מאיר בעל הנס", "מאיר בעל הנס"],
  ["מרן", "הרב עובדיה", "עובדיה יוסף", "יביע אומר", "יחוה דעת"],
  ["גמח", "גמחים", "גמילות חסדים", "השאלת ציוד", "חסד"],
  ["יד שרה", "עזר מציון", "ציוד רפואי", "כיסא גלגלים", "מחולל חמצן"],
  ["ידידים", "סיוע בדרכים", "כבלים לרכב", "בוסטר"],
  ["איחוד הצלה", "הצלה", "עזרה ראשונה"]
];

window.expandSearchQueryTerms = function(rawQuery) {
  var norm = window.normalizeHebrewSearch(rawQuery);
  var compact = window.normalizeCompactHebrew(rawQuery);
  if (!norm && !compact) return [];
  var terms = [norm];
  if (compact && terms.indexOf(compact) === -1) terms.push(compact);

  (window.SEARCH_ALIASES || []).forEach(function(group) {
    var hit = group.some(function(alias) {
      var na = window.normalizeHebrewSearch(alias);
      var ca = window.normalizeCompactHebrew(alias);
      return (norm.length >= 2 && (na.indexOf(norm) !== -1 || norm.indexOf(na) !== -1)) ||
             (compact.length >= 2 && (ca.indexOf(compact) !== -1 || compact.indexOf(ca) !== -1));
    });
    if (hit) {
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

// השהיית הקלדה (Debounce) של 200ms
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
    if (!key || key === "undefined") {
      localStorage.removeItem("undefined");
      return fallbackVal;
    }
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackVal;
  } catch (e) {
    return fallbackVal;
  }
};

window.setStorageJson = function(key, val) {
  try {
    if (!key || key === "undefined") {
      localStorage.removeItem("undefined");
      return;
    }
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


// ניקוי אוטומטי של Service Workers ישנים ומטמון דפדפן כדי להבטיח טעינת גרסה V38 העדכנית ב-GitHub Pages / Vercel
(function() {
  try {
    localStorage.removeItem("undefined");
    var APP_VERSION = "v38";
    var prevVer = localStorage.getItem("tzadiktok_app_version");
    if (prevVer !== APP_VERSION) {
      localStorage.setItem("tzadiktok_app_version", APP_VERSION);
      if ("serviceWorker" in navigator && navigator.serviceWorker.getRegistrations) {
        navigator.serviceWorker.getRegistrations().then(function(regs) {
          regs.forEach(function(r) { r.unregister(); });
        });
      }
      if ("caches" in window && window.caches.keys) {
        window.caches.keys().then(function(names) {
          names.forEach(function(n) { window.caches.delete(n); });
        });
      }
    }
  } catch (e) {}
})();


// המרת תאריך עברי לאותיות עבריות תקניות תמיד (למשל: א׳ בכסלו תשפ״ז במקום "1 בכסלו 5787")
var HEB_DAY_LETTERS = [
  "", "א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ז׳", "ח׳", "ט׳", "י׳",
  "י״א", "י״ב", "י״ג", "י״ד", "ט״ו", "ט״ז", "י״ז", "י״ח", "י״ט", "כ׳",
  "כ״א", "כ״ב", "כ״ג", "כ״ד", "כ״ה", "כ״ו", "כ״ז", "כ״ח", "כ״ט", "ל׳"
];

function hebYearToLetters(yr) {
  var n = parseInt(yr, 10);
  if (!n || n < 5700 || n > 5900) return "תשפ״ז";
  var rem = n % 1000; // e.g., 787
  var hundredsMap = { 700: "תש", 800: "תת" };
  var tensMap = { 0: "", 10: "י", 20: "כ", 30: "ל", 40: "מ", 50: "נ", 60: "ס", 70: "ע", 80: "פ", 90: "צ" };
  var onesMap = { 0: "", 1: "א", 2: "ב", 3: "ג", 4: "ד", 5: "ה", 6: "ו", 7: "ז", 8: "ח", 9: "ט" };
  var h = Math.floor(rem / 100) * 100;
  var t = Math.floor((rem % 100) / 10) * 10;
  var o = rem % 10;
  var letters = (hundredsMap[h] || "תש") + (tensMap[t] || "פ") + (onesMap[o] || "ז");
  if (letters.length >= 2) {
    return letters.slice(0, -1) + "״" + letters.slice(-1);
  }
  return letters + "׳";
}

window.formatHebrewDateInLetters = function(dateObj) {
  try {
    var d = dateObj || new Date();
    var parts = new Intl.DateTimeFormat("he-IL-u-ca-hebrew", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).formatToParts(d);
    var dayVal = "", monthVal = "", yearVal = "";
    parts.forEach(function(p) {
      if (p.type === "day") dayVal = p.value;
      else if (p.type === "month") monthVal = p.value;
      else if (p.type === "year") yearVal = p.value;
    });
    var dayNum = parseInt(String(dayVal).replace(/[^0-9]/g, ""), 10);
    var dayHeb = (dayNum >= 1 && dayNum <= 30) ? HEB_DAY_LETTERS[dayNum] : (dayVal || "א׳");
    var yearNum = parseInt(String(yearVal).replace(/[^0-9]/g, ""), 10);
    var yearHeb = yearNum ? hebYearToLetters(yearNum) : (yearVal || "תשפ״ז");
    var cleanMonth = String(monthVal || "כסלו").replace(/^ב/, "");
    return dayHeb + " ב" + cleanMonth + " " + yearHeb;
  } catch (e) {
    return "א׳ בכסלו תשפ״ז";
  }
};

window.getHebrewDateString = function() {
  return window.formatHebrewDateInLetters(new Date());
};

// עדכון גרסת מטמון ל-v39
try {
  localStorage.setItem("tzadiktok_app_version", "v39");
} catch (e) {}
