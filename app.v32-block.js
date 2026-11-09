

// ============================================================================
// V32 — מצב שבת כנעילה מלאה של המסך ("שבת שלום") עם קוד יציאה, בתוך האזור האישי › הגדרות
//  * הפונקציות הישנות (toggleShabbatOverlay הקודמות, מצב הצפייה-בלבד) נשארות בקובץ; כאן הגרסה האחרונה שדורסת אותן.
//  * הקוד נשמר מגובב (SHA-256) ב-localStorage של המכשיר. זו נעילה לשמירת השבת ולא אבטחה:
//    מי שמנקה נתוני אתר בדפדפן יכול לעקוף אותה.
// ============================================================================
(function () {
  "use strict";

  var CODE_KEY = "tzadiktok_shabbat_code_v19";
  var SALT = "tzadiktok-shabbat-v1:";
  var fails = 0, lockedUntil = 0;
  var LOCK_TARGETS = "header, main, nav.heritage-bottom-nav, #tt-side-menu, #tt-menu-overlay, .modal-backdrop";

  function el(id) { return document.getElementById(id); }
  function qsa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function isLocked() { return document.body.classList.contains("tt-shabbat-locked"); }

  // גיבוב הקוד (SHA-256). אם crypto.subtle לא זמין (אתר לא מאובטח) – גיבוב פשוט כגיבוי
  function hashCode(code) {
    var text = SALT + code;
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
      });
    }
    var h = 5381; for (var i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return Promise.resolve("x" + (h >>> 0).toString(16));
  }

  function getStored() { try { return localStorage.getItem(CODE_KEY) || ""; } catch (e) { return ""; } }
  function setActive(on) { try { localStorage.setItem(STORAGE_KEYS.SHABBAT_ACTIVE, on ? "true" : "false"); } catch (e) {} }

  function lock(on) {
    var ov = el("shabbat-overlay"); if (!ov) return;
    ov.classList.toggle("hidden", !on);
    document.body.classList.toggle("tt-shabbat-locked", on);
    document.body.classList.toggle("shabbat-mode-active", on);     // כובה מוזיקה/חנות/תרומות כמו במצב הקודם
    qsa(LOCK_TARGETS).forEach(function (n) { if (on) n.setAttribute("inert", ""); else n.removeAttribute("inert"); });
    qsa("audio, video").forEach(function (m) { try { if (on) m.pause(); } catch (e) {} });
    qsa("iframe").forEach(function (f) {                           // עוצר סרטונים מוטמעים כדי שלא ינגנו מאחורי השכבה
      if (on) { if (f.src && f.src !== "about:blank") { f.setAttribute("data-tt-src", f.src); f.src = "about:blank"; } }
      else if (f.getAttribute("data-tt-src")) { f.src = f.getAttribute("data-tt-src"); f.removeAttribute("data-tt-src"); }
    });
    if (on) {
      try { isMusicPlaying = false; } catch (e) {}
      var d = el("shabbat-overlay-date");
      if (d) {
        var greg = ""; try { greg = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" }).format(new Date()); } catch (e) {}
        d.textContent = (window.getHebrewDateString ? window.getHebrewDateString() : "") + (greg ? " • " + greg : "");
      }
      var inp = el("shabbat-exit-input"); if (inp) { inp.value = ""; setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50); }
      var msg = el("shabbat-exit-msg"); if (msg) msg.textContent = "";
    }
  }

  function refreshHint() {
    var h = el("shabbat-code-hint");
    if (h) h.textContent = getStored() ? "קוד יציאה שמור במכשיר ✓ (אפשר להזין קוד חדש כדי להחליף אותו)" : "עדיין לא הוגדר קוד יציאה: בחר 4–8 ספרות שתזכור.";
  }

  window.startShabbatMode = function () {
    var inp = el("shabbat-code-input");
    var code = inp ? (inp.value || "").trim() : "";
    var stored = getStored();
    if (!code && !stored) { window.toast("בחר קוד יציאה (4–8 ספרות) כדי להפעיל את מצב שבת"); if (inp) inp.focus(); return Promise.resolve(); }
    if (code && !/^\d{4,8}$/.test(code)) { window.toast("הקוד חייב להכיל 4 עד 8 ספרות בלבד"); if (inp) inp.focus(); return Promise.resolve(); }
    var go = function () {
      if (inp) inp.value = "";
      setActive(true); fails = 0; lockedUntil = 0;
      if (window.closeSideMenu) window.closeSideMenu();
      lock(true); refreshHint();
    };
    if (!code) { go(); return Promise.resolve(); }
    return hashCode(code).then(function (hsh) { try { localStorage.setItem(CODE_KEY, hsh); } catch (e) {} go(); });
  };

  window.exitShabbatMode = function () {
    var inp = el("shabbat-exit-input"), msg = el("shabbat-exit-msg");
    var say = function (t) { if (msg) msg.textContent = t; };
    var now = Date.now();
    if (now < lockedUntil) { say("יותר מדי ניסיונות. נסה שוב בעוד " + Math.ceil((lockedUntil - now) / 1000) + " שניות"); return Promise.resolve(); }
    var code = inp ? (inp.value || "").trim() : "";
    if (!code) { say("הזן את קוד היציאה"); return Promise.resolve(); }
    var stored = getStored();
    if (!stored) { lock(false); setActive(false); return Promise.resolve(); }        // אין קוד שמור (מצב חריג) – לא נועלים משתמש בחוץ
    return hashCode(code).then(function (hsh) {
      if (hsh === stored) {
        fails = 0; lock(false); setActive(false);
        window.toast("שבוע טוב ומבורך! האפליקציה פתוחה שוב.");
      } else {
        fails++;
        if (inp) { inp.value = ""; inp.focus(); }
        if (fails >= 5) { lockedUntil = Date.now() + 30000; fails = 0; say("קוד שגוי 5 פעמים. נסה שוב בעוד 30 שניות"); }
        else say("קוד שגוי, נסה שוב");
      }
    });
  };

  // תאימות לאחור: כל הקריאות הישנות ל-toggleShabbatOverlay (כפתור צף, באנר וכו') מגיעות לכאן
  window.toggleShabbatOverlay = function () {
    if (isLocked()) { var i = el("shabbat-exit-input"); if (i) i.focus(); return; }
    window.switchTab("myzone");
    window.switchMyZoneSubTab("settings");
    window.toast("הגדר קוד יציאה ולחץ על \"הפעל מצב שבת\"");
  };

  function init() {
    var inp = el("shabbat-exit-input");
    if (inp) inp.addEventListener("keydown", function (ev) { if (ev.key === "Enter") window.exitShabbatMode(); });
    var setup = el("shabbat-code-input");
    if (setup) setup.addEventListener("keydown", function (ev) { if (ev.key === "Enter") window.startShabbatMode(); });
    // שומר על מיקוד בתוך השכבה (Tab) כשהיא פעילה
    document.addEventListener("focusin", function (ev) {
      if (!isLocked()) return;
      var ov = el("shabbat-overlay");
      if (ov && !ov.contains(ev.target)) { var i = el("shabbat-exit-input"); if (i) i.focus(); }
    });
    refreshHint();
    // רענון הדף לא מבטל את הנעילה
    var wasActive = false; try { wasActive = localStorage.getItem(STORAGE_KEYS.SHABBAT_ACTIVE) === "true"; } catch (e) {}
    if (wasActive && getStored()) lock(true);
    else if (wasActive) setActive(false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
