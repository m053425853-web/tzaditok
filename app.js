// ============================================================================
// V31 — ניווט חדש + UX: תפריט צד, מצב מיקוד (Progressive Disclosure), כרטיס "היום ביהדות",
//        מיון לפי GPS, אזור אישי כתפריט מלא, ומנהגים עם העלאה/דירוג/תגובות.
//  * נוסף בסוף הקובץ (אחרי V30). דורס גרסאות קודמות של אותן פונקציות ולא מוחק אותן.
// ============================================================================
(function () {
  "use strict";

  var S = window.sbSafe;
  function el(id) { return document.getElementById(id); }
  function val(id) { var e = el(id); return e ? (e.value || "").trim() : ""; }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function sb() { return window.supabaseClient; }
  function onReady(fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }
  function body() { return document.body; }

  // ===========================================================================
  // 1. הגדרות מדורים
  // ===========================================================================
  // מדורי "למצוא": מה נשאר על המסך במצב מיקוד (keep) – כל השאר נעלם / נכנס ל"אפשרויות נוספות"
  var FIND = {
    minyanim:    { t: "מניינים", d: "שחרית, מנחה וערבית בבתי כנסת ושטיבלאך • קריאת מניין להשלמת עשירי", keep: [".find-search-panel", "#minyanim-container"] },
    chavruta:    { t: "חברותא", d: "מצא חברותא ללימוד משותף לפי נושא ועיר, או הצע חברותא חדשה", keep: [".find-search-panel", "#chavruta-grid-container"] },
    rabbis:      { t: "קו הלכה ורבנים", d: "בתי הוראה וקווי הלכה ארציים • מענה לשאלות דחופות ורגילות", keep: [".find-search-panel", "#rabbis-container"] },
    chabad:      { t: "בתי חב״ד", d: "שלוחי חב״ד בארץ ובעולם: תפילות, סעודות שבת וכשרות", keep: [".find-search-panel", "#chabad-grid-container"] },
    mikvaot:     { t: "מקוואות", d: "מקוואות נשים, גברים וכלים עם שעות פתיחה וניווט", keep: [".find-search-panel", "#mikvaot-grid-container"] },
    restaurants: { t: "מסעדות כשרות", d: "מסעדה כשרה קרובה עם תעודת הכשר ברורה וניווט מהיר", keep: ["#rest-search-input", "#restaurants-grid-container"] },
    tzaddikim:   {
      t: "קברי צדיקים", d: "ציוני קודש בארץ: ניווט, סגולות והדלקת נר",
      keep: [".find-search-panel", "#tzaddikim-grid-container"],
      modes: { yahrzeits: { t: "יום השנה והילולות צדיקים", d: "יומן ימי השנה, הילולות ודפי אישיות", keep: ["#yahrzeit-diary-anchor"] } }
    },
    gemachim:    { t: "גמ״חים", d: "גמ״חי רפואה, הצלה, שמחות וחסד", keep: [".find-search-panel", "#gemachim-grid-container"] },
    customs:     { t: "שירותי דת", d: "מוהלים, משגיחי כשרות, מדריכי חתנים וסופרי סת״ם", keep: [".find-search-panel", "#religious-services-pro-grid"] },
    yeshivot:    { t: "ישיבות ומוסדות", d: "ישיבות, כוללים ובתי מדרש", keep: ["input"] }
  };
  // דפים עצמאיים בתוך "ללמוד": רק כפתור חזרה (בלי הסתרת תוכן)
  var VIEWF = {
    kids:   { t: "חידונים ומשחקים", d: "", back: "series", crumb: "ללמוד" },
    live:   { t: "שידור חי", d: "", back: "series", crumb: "ללמוד" },
    studio: { t: "אולפן יצירה", d: "", back: "series", crumb: "ללמוד" },
    admin:  { t: "פאנל ניהול", d: "", back: "myzone", crumb: "האזור האישי" }
  };
  // מדורים עם תתי-לשוניות: במצב "תפריט" רואים רק את הכפתורים, בלחיצה נכנסים למדור במצב מיקוד
  var HUBS = {
    series: {
      t: "ללמוד", view: "view-series", prefix: "lib-sub-", extra: ["lib-sub-aiseries"],
      subs: {
        torah: { t: "חמישה חומשי תורה", search: "dom" }, nach: { t: "נביאים וכתובים (נ״ך)", search: "dom" },
        generations: { t: "ראשונים ואחרונים", search: "dom" }, mishnah: { t: "משנה, גמרא והלכה", search: "dom" },
        chassidut: { t: "תורת החסידות", search: "dom" }, courses: { t: "קורסים במדורים", search: "dom" },
        liveshiurim: { t: "שידור חי ושיעורים" }, eduvideos: { t: "סרטונים חינוכיים" },
        music: { t: "היכל המוזיקה", search: "dom" }, weekseries: { t: "סדרת השבוע", search: "dom" }
      }
    },
    siddur: {
      t: "להתפלל", view: "view-siddur", prefix: "pray-sub-",
      subs: { siddur: { t: "סידור תפילה" }, tehillim: { t: "ספר תהילים" }, customs: { t: "מנהגים" } }
    },
    myzone: {
      t: "האזור האישי", view: "view-myzone", prefix: "myzone-sub-",
      subs: {
        community: { t: "קהילה, פורום וקבוצות" }, tracker: { t: "מעקב יומי וחשבון נפש" }, quizresults: { t: "תוצאות חידונים" },
        saved: { t: "הדברים השמורים שלי" }, history: { t: "ההיסטוריה שלי" }, yahrzeits: { t: "ימי השנה שלי" },
        submissions: { t: "התכנים שהוספתי" }, premium: { t: "מנוי Premium" }, orders: { t: "רכישות ותרומות" }, settings: { t: "ההגדרות שלי" }
      }
    }
  };
  Object.keys(HUBS).forEach(function (k) {
    var h = HUBS[k];
    h.panels = Object.keys(h.subs).map(function (s) { return h.prefix + s; }).concat(h.extra || []);
  });

  var TT = { ctx: null, pushed: false };
  var origLib = window.switchLibrarySubTab, origPray = window.switchPraySubTab, origMz = window.switchMyZoneSubTab;

  // ===========================================================================
  // 2. מצב מיקוד: כותרת/חיפוש מקומי/חזרה
  // ===========================================================================
  function cardsOf(panel) { return panel ? qsa(".grid > *", panel) : []; }

  function resetDomFilter() {
    qsa(".grid > *").forEach(function (c) { if (c.style && c.style.display === "none" && c.getAttribute("data-ttf")) { c.style.display = ""; c.removeAttribute("data-ttf"); } });
    var inp = el("tt-focus-search"); if (inp) inp.value = "";
  }

  window.ttFocusSearch = function (q) {
    var ctx = TT.ctx; if (!ctx || !ctx.panelId) return;
    q = (q || "").trim().toLowerCase();
    cardsOf(el(ctx.panelId)).forEach(function (c) {
      var hit = !q || (c.textContent || "").toLowerCase().indexOf(q) !== -1;
      if (hit) { if (c.getAttribute("data-ttf")) { c.style.display = ""; c.removeAttribute("data-ttf"); } }
      else { c.style.display = "none"; c.setAttribute("data-ttf", "1"); }
    });
  };

  function setBar(o) {
    var bar = el("tt-focus-bar"); if (!bar) return;
    el("tt-focus-title").textContent = o.title || "";
    el("tt-focus-desc").textContent = o.desc || "";
    el("tt-focus-crumb").textContent = o.crumb || "";
    var more = el("tt-more-btn");
    if (more) { more.classList.toggle("hidden", !o.hasTools); more.classList.remove("active"); more.textContent = "אפשרויות נוספות ▾"; }
    var wrap = el("tt-focus-search-wrap");
    var showSearch = false;
    if (o.search === "dom" && o.panelId) showSearch = cardsOf(el(o.panelId)).length >= 2;
    if (wrap) wrap.classList.toggle("hidden", !showSearch);
    resetDomFilter();
    bar.classList.remove("hidden");
  }

  function clearFocus() {
    TT.ctx = null;
    body().classList.remove("focus-mode", "focus-more");
    var bar = el("tt-focus-bar"); if (bar) bar.classList.add("hidden");
    resetDomFilter();
  }

  function pushFocusState() {
    if (TT.pushed) return;
    try { history.pushState({ ttFocus: 1 }, ""); TT.pushed = true; } catch (e) {}
  }

  window.ttToggleMore = function () {
    var on = body().classList.toggle("focus-more");
    var more = el("tt-more-btn");
    if (more) { more.classList.toggle("active", on); more.textContent = on ? "הסתר אפשרויות ▴" : "אפשרויות נוספות ▾"; }
  };

  // כניסה למדור פנימי בתוך Hub עם תתי-לשוניות
  function enterSub(hubKey, sub) {
    var h = HUBS[hubKey], cfg = h && h.subs[sub];
    if (!cfg) return;
    var view = el(h.view);
    if (view && view.children[0]) view.children[0].classList.add("tt-navcard");
    TT.ctx = { type: "sub", hub: hubKey, sub: sub, panelId: h.prefix + sub };
    body().classList.remove("focus-more");
    setBar({ title: cfg.t, crumb: h.t, desc: cfg.d || "", search: cfg.search, panelId: h.prefix + sub, hasTools: false });
    body().classList.add("focus-mode");
    pushFocusState();
    window.scrollTo({ top: 0 });
  }

  // מצב "תפריט" של Hub: רק כפתורי המדורים, כל הפאנלים סגורים
  function showHubMenu(hubKey) {
    var h = HUBS[hubKey]; if (!h) return;
    h.panels.forEach(function (id) { var p = el(id); if (p) p.classList.add("hidden"); });
    var view = el(h.view);
    if (view && view.children[0]) view.children[0].classList.add("tt-navcard");
    clearFocus();
  }

  function markTools(view, keep) {
    var any = false;
    Array.prototype.slice.call(view.children).forEach(function (c) {
      c.classList.remove("tt-tool", "tt-navcard");
      if (!keep || !keep.length) return;
      var has = keep.some(function (s) { try { return c.matches(s) || c.querySelector(s); } catch (e) { return false; } });
      if (!has) { c.classList.add("tt-tool"); any = true; }
    });
    return any;
  }

  // כניסה לדף מדור (למצוא / חידונים / שידור חי ...) במצב מיקוד
  function enterViewFocus(tabId, mode) {
    var cfg = FIND[tabId], isFind = !!cfg;
    if (!cfg) cfg = VIEWF[tabId];
    if (!cfg) return;
    var view = el("view-" + tabId); if (!view) return;
    var m = (mode && cfg.modes && cfg.modes[mode]) || cfg;
    var hasTools = markTools(view, isFind ? m.keep : null);
    TT.ctx = { type: "view", view: tabId, back: isFind ? "find" : cfg.back };
    body().classList.remove("focus-more");
    setBar({ title: m.t, desc: m.d || "", crumb: isFind ? "למצוא" : cfg.crumb, hasTools: hasTools });
    body().classList.add("focus-mode");
    pushFocusState();
  }

  function doBack() {
    var c = TT.ctx; if (!c) return;
    if (c.type === "sub") { showHubMenu(c.hub); window.scrollTo({ top: 0 }); }
    else { window.switchTab(c.back || "find"); }
  }
  window.ttBack = function () {
    if (TT.pushed && history.state && history.state.ttFocus) { history.back(); }   // כפתור "אחורה" של הדפדפן/הטלפון עובד אותו דבר
    else doBack();
  };
  window.addEventListener("popstate", function () {
    if (TT.pushed) { TT.pushed = false; if (TT.ctx) doBack(); }
  });

  // ===========================================================================
  // 3. switchTab חדש (הישן נשאר בקובץ). "find" הוא כעת דף-מדורים אמיתי ולא מניינים.
  // ===========================================================================
  window.switchTab = function (tabId, mode) {
    var alias = { learn: "series", pray: "siddur", donate: "raffles", givebuy: "raffles" };
    if (alias[tabId]) tabId = alias[tabId];
    window.closeSideMenu();
    if (TT.ctx) { clearFocus(); }

    currentTab = tabId;
    qsa(".view-section").forEach(function (s) { s.classList.remove("active"); });
    var target = el("view-" + tabId);
    if (target) target.classList.add("active");

    var parentHub = tabId;
    if (["series", "kids", "live", "studio"].indexOf(tabId) !== -1) parentHub = "series";
    else if (tabId === "siddur") parentHub = "siddur";
    else if (tabId === "find" || !!FIND[tabId] || ["zmanim", "prayerwall"].indexOf(tabId) !== -1) parentHub = "find";
    else if (["raffles", "judaica", "donors", "premium"].indexOf(tabId) !== -1) parentHub = "givebuy";
    else if (tabId === "forum") parentHub = "forum";
    else if (["myzone", "admin"].indexOf(tabId) !== -1) parentHub = "myzone";

    qsa(".pill-btn").forEach(function (p) { p.classList.remove("active"); });
    var ap = el("pill-" + tabId) || el("pill-" + parentHub);
    if (ap) ap.classList.add("active");
    qsa(".bottom-nav-item").forEach(function (b) { b.classList.remove("active"); });
    var ab = el("bnav-" + parentHub) || el("bnav-" + tabId);
    if (ab) ab.classList.add("active");

    if (HUBS[tabId]) showHubMenu(tabId);
    else if (FIND[tabId] || VIEWF[tabId]) enterViewFocus(tabId, mode);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // מעבר + גלילה לעוגן בתוך הדף (לחיצה על חלקי "היום ביהדות")
  window.ttGo = function (tab, anchorId, mode) {
    window.switchTab(tab, mode);
    if (anchorId) setTimeout(function () {
      var a = el(anchorId);
      if (a && a.scrollIntoView) a.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 90);
  };

  // תתי-לשוניות: כל כניסה למדור פנימי עוברת למצב מיקוד
  window.switchLibrarySubTab = function (sub) {
    if (sub === "overview" || sub === "library") sub = "torah";
    if (currentTab !== "series") window.switchTab("series");
    origLib(sub); enterSub("series", sub);
  };
  window.switchPraySubTab = function (sub) {
    if (currentTab !== "siddur") window.switchTab("siddur");
    origPray(sub); enterSub("siddur", sub);
    if (sub === "customs") window.ttLoadCustoms(false);
  };
  window.switchMyZoneSubTab = function (sub) {
    origMz(sub);
    if (currentTab === "myzone") enterSub("myzone", sub);
  };

  // ===========================================================================
  // 4. תפריט צד (המבורגר)
  // ===========================================================================
  var MENU = [
    { g: "ראשי", items: [
      { t: "דף הבית", a: ["tab", "feed"] },
      { t: "זמני היום", a: ["go", "zmanim", "zmanim-times-anchor"] },
      { t: "לוח שנה עברי", a: ["go", "zmanim", "zmanim-calendar-anchor"] },
      { t: "יום השנה והילולות צדיקים", a: ["go", "tzaddikim", "yahrzeit-diary-anchor", "yahrzeits"] }
    ] },
    { g: "ללמוד", items: [
      { t: "שיעורים ושידור חי", a: ["sub", "series", "liveshiurim"] },
      { t: "חמישה חומשי תורה", a: ["sub", "series", "torah"] },
      { t: "נביאים וכתובים", a: ["sub", "series", "nach"] },
      { t: "משנה, גמרא והלכה", a: ["sub", "series", "mishnah"] },
      { t: "תורת החסידות", a: ["sub", "series", "chassidut"] },
      { t: "סרטונים חינוכיים", a: ["sub", "series", "eduvideos"] },
      { t: "היכל המוזיקה", a: ["sub", "series", "music"] },
      { t: "חידונים ומשחקים", a: ["tab", "kids"] }
    ] },
    { g: "להתפלל", items: [
      { t: "סידור תפילה", a: ["sub", "siddur", "siddur"] },
      { t: "ספר תהילים", a: ["sub", "siddur", "tehillim"] },
      { t: "מנהגים", a: ["sub", "siddur", "customs"] }
    ] },
    { g: "למצוא", items: [{ t: "כל מדורי למצוא", a: ["tab", "find"], strong: true }].concat(
      ["minyanim", "chavruta", "rabbis", "chabad", "mikvaot", "restaurants", "tzaddikim", "gemachim", "customs", "yeshivot"].map(function (k) { return { t: FIND[k].t, a: ["tab", k] }; })
    ) },
    { g: "לתת ולקנות", items: [
      { t: "הגרלות וקמפיינים", a: ["tab", "raffles"] }, { t: "חנות יודאיקה", a: ["tab", "judaica"] }, { t: "ספר התורמים", a: ["tab", "donors"] }
    ] },
    { g: "קהילה", items: [{ t: "פורום הקהילה", a: ["tab", "forum"] }] }
  ];

  function buildMenu() {
    var logged = !!window.__ttUser || !!(currentUserAccount && currentUserAccount.isRegistered);
    var html = "";
    MENU.forEach(function (grp, gi) {
      html += '<div class="tt-menu-group">' + grp.g + "</div>";
      grp.items.forEach(function (it, ii) {
        html += '<button type="button" class="tt-menu-item' + (it.strong ? " tt-menu-strong" : "") + '" data-g="' + gi + '" data-i="' + ii + '">' + it.t + "</button>";
      });
    });
    html += '<div class="tt-menu-group">החשבון שלי</div>';
    html += '<button type="button" class="tt-menu-item tt-menu-strong" data-act="personal">האזור האישי</button>';
    html += logged
      ? '<button type="button" class="tt-menu-item" data-act="logout">התנתקות</button>'
      : '<button type="button" class="tt-menu-item" data-act="login">התחברות / הרשמה</button>';
    el("tt-menu-body").innerHTML = html;
  }

  function runAction(a) {
    if (a[0] === "tab") window.switchTab(a[1]);
    else if (a[0] === "go") window.ttGo(a[1], a[2], a[3]);
    else if (a[0] === "sub") {
      window.switchTab(a[1]);
      if (a[1] === "series") window.switchLibrarySubTab(a[2]); else if (a[1] === "siddur") window.switchPraySubTab(a[2]);
    }
  }

  window.openSideMenu = function () {
    buildMenu();
    body().classList.add("tt-menu-open");
    var m = el("tt-side-menu"); if (m) m.setAttribute("aria-hidden", "false");
    var b = el("tt-burger-btn"); if (b) b.setAttribute("aria-expanded", "true");
    var first = qsa(".tt-menu-item")[0]; if (first && first.focus) first.focus();
  };
  window.closeSideMenu = function () {
    if (!body().classList.contains("tt-menu-open")) return;
    body().classList.remove("tt-menu-open");
    var m = el("tt-side-menu"); if (m) m.setAttribute("aria-hidden", "true");
    var b = el("tt-burger-btn"); if (b) b.setAttribute("aria-expanded", "false");
  };
  window.openPersonalArea = function () { window.switchTab("myzone"); };

  onReady(function () {
    var mb = el("tt-menu-body");
    if (mb) mb.addEventListener("click", function (ev) {
      var btn = ev.target.closest ? ev.target.closest(".tt-menu-item") : null;
      if (!btn) return;
      var act = btn.getAttribute("data-act");
      if (act === "personal") { window.openPersonalArea(); return; }
      if (act === "login") { window.closeSideMenu(); window.openAuthModal(); return; }
      if (act === "logout") { window.closeSideMenu(); window.logoutUser(); return; }
      var it = MENU[Number(btn.getAttribute("data-g"))].items[Number(btn.getAttribute("data-i"))];
      window.closeSideMenu(); runAction(it.a);
    });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") window.closeSideMenu(); });
  });

  // ===========================================================================
  // 5. דף "למצוא" (רשימת המדורים) + GPS גלובלי
  // ===========================================================================
  var FIND_TILES = [
    ["minyanim", "שחרית, מנחה וערבית • קריאת מניין"], ["chavruta", "שותף ללימוד לפי נושא ועיר"],
    ["rabbis", "מענה הלכתי דחוף ורגיל"], ["chabad", "שלוחי חב״ד בארץ ובעולם"],
    ["mikvaot", "נשים, גברים וכלים"], ["restaurants", "לפי סוג, הכשר ועיר"],
    ["tzaddikim", "ציוני קודש, סגולות ונרות"], ["gemachim", "רפואה, הצלה וחסד"],
    ["customs", "מוהלים, משגיחים, סופרי סת״ם"], ["yeshivot", "ישיבות, כוללים ובתי מדרש"]
  ];
  window.renderFindHub = function () {
    var root = el("find-hub-root"); if (!root) return;
    root.innerHTML =
      '<div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3">' +
        '<div><h2 class="text-2xl font-black text-[#0F2340] serif-heading">למצוא</h2>' +
        '<p class="text-sm text-[#5C4938]">איתור שירותי יהדות, מניינים, רבנים וחסד. בחר מדור, ובתוכו תוכל לחפש ולמיין לפי מרחק ממך.</p></div>' +
        '<button id="tt-geo-global" type="button" onclick="locateNearestByGPS()" class="px-4 py-2 bg-white text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs">📍 מיין תוצאות לפי מרחק ממני</button>' +
      '</div>' +
      '<div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">' +
      FIND_TILES.map(function (t) {
        return '<button type="button" onclick="switchTab(\'' + t[0] + '\')" class="tt-tile"><strong>' + FIND[t[0]].t + "</strong><span>" + t[1] + "</span></button>";
      }).join("") + "</div>";
    refreshGeoButtons();
  };

  // ===========================================================================
  // 6. GPS – מיון מקוואות / גמ"חים / מסעדות (+ מניינים, חב"ד, קברי צדיקים) מהקרוב לרחוק
  // ===========================================================================
  var CITY = {
    "בני ברק": [32.0840, 34.8352], "תל אביב": [32.0853, 34.7818], "ירושלים": [31.7683, 35.2137], "חיפה": [32.7940, 34.9896],
    "צפת": [32.9646, 35.4960], "מירון": [32.9887, 35.4400], "טבריה": [32.7959, 35.5312], "נתיבות": [31.4200, 34.5890],
    "אשדוד": [31.8040, 34.6553], "אשקלון": [31.6688, 34.5743], "באר שבע": [31.2530, 34.7915], "פתח תקווה": [32.0840, 34.8878],
    "ראשון לציון": [31.9730, 34.7925], "רחובות": [31.8928, 34.8113], "בית שמש": [31.7470, 34.9881], "מודיעין עילית": [31.9332, 35.0436],
    "מודיעין": [31.8969, 35.0095], "אלעד": [32.0526, 34.9510], "חברון": [31.5326, 35.0998], "קרית גת": [31.6100, 34.7642],
    "נתניה": [32.3215, 34.8532], "חדרה": [32.4340, 34.9196], "רמת גן": [32.0684, 34.8248], "בת ים": [32.0171, 34.7454],
    "חולון": [32.0158, 34.7795], "גבעתיים": [32.0722, 34.8120], "אילת": [29.5577, 34.9519], "כרמיאל": [32.9191, 35.2903],
    "קרית שמונה": [33.2074, 35.5698], "עפולה": [32.6078, 35.2897], "ערד": [31.2589, 35.2128], "דימונה": [31.0686, 35.0333],
    "שדרות": [31.5253, 34.5961], "רמלה": [31.9293, 34.8722], "לוד": [31.9516, 34.8955], "אור יהודה": [32.0299, 34.8573],
    "בית שאן": [32.4974, 35.4970], "קרית מלאכי": [31.7290, 34.7440], "טבעון": [32.7190, 35.1290], "פרדס חנה": [32.4720, 34.9680],
    "בנגקוק": [13.7563, 100.5018], "ניו יורק": [40.7128, -74.0060], "לונדון": [51.5074, -0.1278], "פריז": [48.8566, 2.3522],
    "קטמנדו": [27.7172, 85.3240], "מומבאי": [19.0760, 72.8777], "מוסקבה": [55.7558, 37.6173]
  };
  var CITY_KEYS = Object.keys(CITY).sort(function (a, b) { return b.length - a.length; });   // התאמה ארוכה קודם

  var GEO = { pos: null, active: false };
  var GEO_LISTS = {
    minyanim:    { fn: "renderMinyanim",    grid: "minyanim-container",          data: "MINYANIM_DATA" },
    mikvaot:     { fn: "renderMikvaot",     grid: "mikvaot-grid-container",      data: "MIKVAOT_DATA" },
    restaurants: { fn: "renderRestaurants", grid: "restaurants-grid-container",  data: "RESTAURANTS_DATA" },
    gemachim:    { fn: "renderGemachim",    grid: "gemachim-grid-container",     data: "GEMACHIM_DATA" },
    chabad:      { fn: "renderChabad",      grid: "chabad-grid-container",       data: "CHABAD_DATA" },
    tzaddikim:   { fn: "renderTzaddikim",   grid: "tzaddikim-grid-container",    data: "TZADDIKIM_DATA" }
  };

  function num(v) { var n = Number(v); return (v !== null && v !== undefined && v !== "" && isFinite(n)) ? n : null; }

  // קואורדינטות לפריט: מדויקות אם קיימות, אחרת לפי שם העיר (ואז המרחק מסומן כ"בערך")
  function coordsOf(it) {
    var la = num(it.lat), ln = num(it.lng);
    if (la !== null && ln !== null) return { lat: la, lng: ln, approx: false };
    var text = [it.city, it.location, it.address, it.region, it.name].join(" ");
    for (var i = 0; i < CITY_KEYS.length; i++) {
      if (text.indexOf(CITY_KEYS[i]) !== -1) return { lat: CITY[CITY_KEYS[i]][0], lng: CITY[CITY_KEYS[i]][1], approx: true };
    }
    return null;
  }

  function annotate(list) {
    return (list || []).map(function (it) {
      var c = coordsOf(it), d = null;
      if (c && GEO.pos) d = window.calculateGpsDistanceKm(GEO.pos.lat, GEO.pos.lng, c.lat, c.lng);
      if (it.__dk0 === undefined) it.__dk0 = (it.distanceKm === undefined ? null : it.distanceKm);
      it.distanceKm = d === null ? "—" : String(d);
      return { it: it, d: d, approx: !!(c && c.approx) };
    });
  }

  function distLabel(x) {
    if (x.d === null) return "";
    var shown = x.approx ? ("כ-" + Math.max(1, Math.round(x.d)) + " ק״מ ממך • לפי העיר") : (x.d.toFixed(1) + " ק״מ ממך");
    return "📍 " + shown;
  }

  function decorate(gridId, rows) {
    var grid = el(gridId); if (!grid) return;
    rows.forEach(function (x, i) {
      var card = grid.children[i]; if (!card) return;
      var old = card.querySelector(".tt-dist"); if (old) old.remove();
      var lbl = distLabel(x); if (!lbl) return;
      card.classList.add("tt-has-dist");
      var b = document.createElement("span"); b.className = "tt-dist"; b.textContent = lbl;
      card.insertBefore(b, card.firstChild);
    });
  }

  // עוטפים את פונקציות הרינדור הקיימות: כשמיון GPS פעיל כל רינדור (גם אחרי חיפוש/סינון) ממוין ומקבל תווית מרחק
  Object.keys(GEO_LISTS).forEach(function (k) {
    var cfg = GEO_LISTS[k], orig = window[cfg.fn];
    if (typeof orig !== "function") return;
    window[cfg.fn] = function (list) {
      if (!GEO.active || !GEO.pos) return orig.call(this, list);
      var rows = annotate(list).sort(function (a, b) {
        if (a.d === null && b.d === null) return 0; if (a.d === null) return 1; if (b.d === null) return -1; return a.d - b.d;
      });
      var r = orig.call(this, rows.map(function (x) { return x.it; }));
      decorate(cfg.grid, rows);
      return r;
    };
  });

  function rerenderGeoLists() {
    window.renderMinyanim(window.MINYANIM_DATA); window.renderMikvaot(window.MIKVAOT_DATA);
    if (window.applyRestaurantFilters) window.applyRestaurantFilters(); else window.renderRestaurants(window.RESTAURANTS_DATA);
    window.renderGemachim(window.GEMACHIM_DATA); window.renderChabad(window.CHABAD_DATA); window.renderTzaddikim(window.TZADDIKIM_DATA);
  }

  function refreshGeoButtons() {
    qsa("button[onclick*='locateNearestByGPS']").forEach(function (b) {
      if (b.id === "tt-geo-global") {
        b.textContent = GEO.active ? "✓ ממוין לפי מרחק (לחץ לביטול)" : "📍 מיין תוצאות לפי מרחק ממני";
      } else {
        if (!b.__ttOrig) b.__ttOrig = b.innerHTML;
        b.innerHTML = GEO.active ? "✓ ממוין לפי מרחק (ביטול)" : b.__ttOrig;
      }
      b.classList.toggle("tt-geo-on", GEO.active);
    });
  }

  function geoErrorText(e) {
    if (!navigator.geolocation) return "הדפדפן לא תומך באיתור מיקום";
    if (e && e.code === 1) return "לא ניתנה הרשאת מיקום. אפשר לאפשר אותה בהגדרות האתר בדפדפן ולנסות שוב";
    if (e && e.code === 3) return "איתור המיקום לקח יותר מדי זמן, נסה שוב";
    if (location.protocol === "http:" && location.hostname !== "localhost") return "איתור מיקום עובד רק באתר מאובטח (https)";
    return "לא הצלחנו לאתר את המיקום שלך";
  }

  // הפונקציה הקיימת locateNearestByGPS נשארת בקובץ; זו גרסה אמיתית (מיקום אמיתי, בלי "מיקום ברירת מחדל" מומצא)
  window.locateNearestByGPS = function () {
    if (GEO.active) {
      GEO.active = false;
      Object.keys(GEO_LISTS).forEach(function (k) {
        (window[GEO_LISTS[k].data] || []).forEach(function (it) { if (it.__dk0 !== undefined) { it.distanceKm = it.__dk0; } });
      });
      rerenderGeoLists(); refreshGeoButtons(); window.toast("מיון לפי מרחק בוטל");
      return;
    }
    if (!navigator.geolocation) { window.toast(geoErrorText()); return; }
    window.toast("מאתר את המיקום שלך...");
    navigator.geolocation.getCurrentPosition(function (p) {
      GEO.pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      GEO.active = true;
      rerenderGeoLists(); refreshGeoButtons();
      window.toast("התוצאות ממוינות מהקרוב לרחוק");
    }, function (e) { window.toast(geoErrorText(e)); }, { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 });
  };
  window.__ttGeo = GEO;

  // ===========================================================================
  // 7. כרטיס "היום ביהדות" + כותרת/אזור אישי
  // ===========================================================================
  function renderHomeToday() {
    var d = el("home-hebrew-date"); if (d && window.getHebrewDateString) d.textContent = window.getHebrewDateString();
    var list = window.YAHRZEITS_CALENDAR || [];
    var today = list.filter(function (y) { return String(y.date || "").indexOf("היום") !== -1; })[0] || list[0];
    if (today) {
      var n = el("home-yahrzeit-name"), s = el("home-yahrzeit-sub");
      if (n) n.textContent = today.name || ""; if (s) s.textContent = today.title || "";
    }
  }

  var prevBadge = window.updateAuthHeaderBadge;
  window.updateAuthHeaderBadge = function () {
    if (prevBadge) prevBadge();
    var acc = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount) || currentUserAccount;
    var logged = !!(acc && acc.isRegistered);
    var lbl = el("header-auth-label"); if (lbl) lbl.textContent = logged ? ("שלום, " + acc.name) : "האזור האישי";
    var lt = el("myzone-logout-tile"); if (lt) lt.classList.toggle("hidden", !logged);
    var cb = el("custom-add-box"), cg = el("custom-add-guest");
    if (cb) cb.classList.toggle("hidden", !logged);
    if (cg) cg.classList.toggle("hidden", logged);
  };

  // ===========================================================================
  // 8. מנהגים (להתפלל › מנהגים): העלאה, דירוג כוכבים ותגובות (טבלאות customs + community_reviews)
  // ===========================================================================
  var CU = { db: [], at: 0, q: "" };

  function staticCustoms() {
    return (window.CUSTOMS_DATA || []).map(function (c, i) {
      return { id: "static_" + (i + 1), title: S(c.title || c.name), description: S(c.description || c.desc || c.summary),
        category: S(c.category) || "מנהגי עדות", edah: S(c.edah || c.name) || "כלל ישראל", author: "" };
    });
  }
  function mapCustom(r) {
    return { id: String(r.id), title: S(r.title), description: S(r.description), category: S(r.category) || "מנהגי ישראל",
      edah: S(r.edah) || "כלל ישראל", author: S(r.author_name) };
  }
  function allCustoms() { return CU.db.concat(staticCustoms()); }

  function customCard(c) {
    var key = "custom_" + c.id;
    var revs = (window.getEntityReviews ? window.getEntityReviews(key) : []) || [];
    var sum = 0; revs.forEach(function (r) { sum += Number(r.rating) || 0; });
    var stars = revs.length ? ("★ " + (sum / revs.length).toFixed(1) + " (" + revs.length + ")") : "עדיין לא דורג";
    return '<div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 shadow-sm flex flex-col justify-between">' +
      '<div class="space-y-2">' +
        '<div class="flex items-center justify-between gap-2">' +
          '<span class="text-xs font-bold text-[#5C4938] bg-[#F6EFE2] px-2.5 py-1 rounded-md inline-block">' + c.category + " • " + c.edah + "</span>" +
          '<span class="text-xs font-black text-[#0F2340] shrink-0">' + stars + "</span>" +
        "</div>" +
        '<h4 class="text-lg font-black text-[#0F2340]">' + c.title + "</h4>" +
        '<p class="text-sm text-[#5C4938] leading-relaxed">' + c.description + "</p>" +
        (c.author ? '<p class="text-[11px] text-[#5C4938]">הועלה ע״י ' + c.author + "</p>" : "") +
      "</div>" +
      '<div class="pt-3 border-t border-[#E5DBC7]">' +
        "<button onclick=\"openEntityFullPage('" + key + "', 'מנהג', '" + c.title + "', '" + c.edah + "', '', '', '', '" + c.description + "', 'דיוק המנהג • מקורות • התאמה לעדה')\" class=\"w-full py-2 bg-amber-500 text-white font-bold rounded-xl text-xs\">⭐ דרג והגב (" + revs.length + ")</button>" +
      "</div></div>";
  }

  // דורס את renderPrayCustoms הקודמת: היא קראה c.title/c.description אבל בנתונים השדות הם name/desc, ולכן הופיע "undefined"
  window.renderPrayCustoms = function (query) {
    var box = el("pray-customs-container"); if (!box) return;
    if (typeof query === "string") CU.q = query;
    var q = (CU.q || "").trim().toLowerCase();
    var list = allCustoms().filter(function (c) {
      return !q || [c.title, c.description, c.category, c.edah, c.author].join(" ").toLowerCase().indexOf(q) !== -1;
    });
    box.innerHTML = "";
    box.innerHTML = list.length ? list.map(customCard).join("")
      : '<div class="p-4 bg-white border border-[#E5DBC7] rounded-xl text-xs text-[#5C4938]">לא נמצאו מנהגים התואמים לחיפוש.</div>';
  };

  async function loadCustomReviews() {
    if (!sb()) return;
    var r = await sb().from("community_reviews").select("*").like("entity_key", "custom_%").eq("is_approved", true).order("created_at", { ascending: false });
    if (r.error) { console.warn("[Supabase] reviews:", r.error.message); return; }
    var all = window.getStorageJson(STORAGE_KEYS.COMMUNITY_REVIEWS, window.INITIAL_COMMUNITY_REVIEWS || {});
    Object.keys(all).forEach(function (k) { if (k.indexOf("custom_") === 0) delete all[k]; });
    (r.data || []).forEach(function (row) {
      (all[row.entity_key] = all[row.entity_key] || []).push({
        user: S(row.user_name) || "חבר קהילה", rating: Number(row.rating) || 5, criteria: S(row.criteria),
        text: S(row.review_text), date: String(row.created_at || "").slice(0, 10), status: "מאושר ✔"
      });
    });
    window.setStorageJson(STORAGE_KEYS.COMMUNITY_REVIEWS, all);
  }

  window.ttLoadCustoms = async function (force) {
    if (sb() && (force || Date.now() - CU.at > 15000)) {
      try {
        var r = await sb().from("customs").select("*").eq("is_approved", true).order("created_at", { ascending: false });
        if (r.error) console.warn("[Supabase] customs:", r.error.message);
        else { CU.db = (r.data || []).map(mapCustom); CU.at = Date.now(); }
        await loadCustomReviews();
      } catch (e) { console.warn(e); }
    }
    window.renderPrayCustoms();
  };

  window.ttToggleCustomForm = function () {
    var f = el("custom-add-form"); if (f) f.classList.toggle("hidden");
  };

  window.submitNewCustom = async function () {
    if (!window.__ttUser) { window.toast("🔒 העלאת מנהג זמינה למשתמשים מחוברים בלבד"); window.openAuthModal(); return; }
    if (!sb()) { window.toast("אין חיבור ל-Supabase"); return; }
    var title = val("custom-new-title"), desc = val("custom-new-desc");
    if (title.length < 3) { window.toast("נא להזין שם מנהג (לפחות 3 תווים)"); return; }
    if (desc.length < 10) { window.toast("נא לכתוב תיאור של המנהג (לפחות 10 תווים)"); return; }
    var btn = el("custom-submit-btn"); if (btn) { btn.disabled = true; btn.textContent = "שולח..."; }
    try {
      var res = await sb().from("customs").insert([{
        title: title, description: desc, edah: val("custom-new-edah") || "כלל ישראל",
        category: val("custom-new-category") || "מנהגי ישראל", author_name: currentUserAccount.name || "חבר קהילה"
      }]).select();
      if (res.error) {
        window.toast(/schema cache|does not exist|PGRST205|42P01/i.test(res.error.message + (res.error.code || ""))
          ? "הטבלה customs עדיין לא קיימת ב-Supabase – הרץ את קובץ ה-SQL (tzadiktok_ux_patch.sql)"
          : "שגיאה בשמירת המנהג: " + res.error.message);
        return;
      }
      ["custom-new-title", "custom-new-desc"].forEach(function (id) { var e = el(id); if (e) e.value = ""; });
      window.ttToggleCustomForm();
      await window.ttLoadCustoms(true);
      window.toast("✔ המנהג פורסם ונוסף לרשימה");
    } catch (e) { console.warn(e); window.toast("שגיאה בשמירת המנהג"); }
    finally { if (btn) { btn.disabled = false; btn.textContent = "פרסם מנהג"; } }
  };

  // דירוג/תגובה על מנהג: ה-UI הקיים (openEntityFullPage) נשאר, ובנוסף נשמר ב-community_reviews ונטען לכל המשתמשים
  var prevSubmitReview = window.submitEntityReview;
  window.submitEntityReview = function () {
    var key = activeEntityContext && activeEntityContext.key;
    var txt = val("entity-review-input"), crit = val("entity-review-criteria-input"), rating = selectedStarRating;
    var isCustom = key && String(key).indexOf("custom_") === 0;
    var user = window.__ttUser;
    prevSubmitReview();
    if (!isCustom || !txt || !user || !sb()) return;
    sb().from("community_reviews").insert([{
      entity_key: key, user_name: currentUserAccount.name || "חבר קהילה", rating: rating,
      criteria: crit || (activeEntityContext.criteriaHint || ""), review_text: txt, status: "מאושר ✔", is_approved: true
    }]).select().then(function (res) {
      if (res.error) { window.toast("שגיאה בשמירת התגובה: " + res.error.message); return; }
      loadCustomReviews().then(function () { window.renderActiveEntityReviews(); window.renderPrayCustoms(); });
    });
  };

  // ===========================================================================
  // 9. אתחול
  // ===========================================================================
  onReady(function () {
    renderHomeToday();
    window.renderFindHub();
    window.renderPrayCustoms();
    window.updateAuthHeaderBadge();
    refreshGeoButtons();
    window.ttLoadCustoms(true);
  });
})();
