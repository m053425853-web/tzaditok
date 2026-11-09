/* ==========================================================================
   צדיק-טוק (TzadikTok Super-App) - פונקציות עזר גלובליות (utils.js - V33)
   ========================================================================== */

var STORAGE_KEYS = {
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
  MY_SUBMISSIONS: "tzadiktok_my_submissions_v18"
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

window.sbSafe = function(v) { return v ? String(v).trim() : ""; };
window.sbSafeUrl = function(v, d) { return v ? String(v).trim() : (d || ""); };
window.sbSafePhone = function(v) { return v ? String(v).trim() : ""; };
