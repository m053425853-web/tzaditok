/* ==========================================================================
   צדיק-טוק (TzadikTok Super-App) - פונקציות עזר גלובליות (utils.js)
   מכיל: חישוב תאריך עברי, יצירת קישורי Waze / Google Maps / WhatsApp,
   חישוב מרחק GPS (נוסחת Haversine), התראות Toast וניהול LocalStorage.
   ========================================================================== */

const STORAGE_KEYS = {
  CART: "tzadiktok_cart_v17",
  NUSACH: "tzadiktok_nusach_v17",
  LIKES: "tzadiktok_likes_v17",
  CUSTOM_MITZVOT: "tzadiktok_mitzvot_v17"
};

/**
 * 1. הצגת הודעת Toast קופצת בכל מקום באתר
 */
function toast(text) {
  const t = document.getElementById("toast");
  const tt = document.getElementById("toast-text");
  if (!t || !tt) return;
  tt.textContent = text;
  t.classList.remove("opacity-0", "-translate-y-4");
  t.classList.add("opacity-100", "translate-y-0");
  setTimeout(() => {
    t.classList.remove("opacity-100", "translate-y-0");
    t.classList.add("opacity-0", "-translate-y-4");
  }, 2600);
}

/**
 * 2. חישוב והצגת התאריך העברי המדויק של היום
 */
function getHebrewDateString() {
  try {
    const today = new Date();
    return new Intl.DateTimeFormat("he-IL-u-ca-hebrew", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(today);
  } catch (e) {
    return "כ״ז במרחשוון תשפ״ז";
  }
}

function updateTodayDate() {
  const hebStr = getHebrewDateString();
  const el = document.getElementById("todayHebrewHeader");
  if (el) el.textContent = hebStr;
}

/**
 * 3. יצירת קישור ניווט מהיר ל-Waze
 */
function buildWazeUrl(query) {
  return "https://waze.com/ul?q=" + encodeURIComponent(query || "");
}

/**
 * 4. יצירת קישור חיפוש ב-Google Maps
 */
function buildGoogleMapsUrl(name, city) {
  const q = ((name || "") + " " + (city || "")).trim();
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
}

/**
 * 5. יצירת קישור להודעת WhatsApp מוכנה
 */
function buildWhatsAppUrl(phone, textMessage) {
  const cleanPhone = String(phone || "972500000000").replace(/[^0-9]/g, "");
  const msg = textMessage ? "?text=" + encodeURIComponent(textMessage) : "";
  return "https://wa.me/" + cleanPhone + msg;
}

/**
 * 6. יצירת קישור חיוג טלפוני מהיר (tel:)
 */
function buildTelUrl(phone) {
  return "tel:" + String(phone || "").replace(/-/g, "").trim();
}

/**
 * 7. חישוב מרחק אווירי בקילומטרים בין שתי נקודות GPS (נוסחת Haversine)
 */
function calculateGpsDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // רדיוס כדור הארץ בק"מ
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(1);
}

/**
 * 8. עזר לשליפה ושמירה בטוחה ב-LocalStorage
 */
function getStorageJson(key, fallbackVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackVal;
  } catch (e) {
    return fallbackVal;
  }
}

function setStorageJson(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

/**
 * 9. עזר לעיצוב מחיר בשקלים
 */
function formatPriceILS(num) {
  return "₪" + Number(num || 0).toLocaleString();
}
