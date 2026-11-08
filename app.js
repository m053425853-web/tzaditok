/* ==========================================================================
   צדיק-טוק (TzadikTok Super-App) - מנוע האפליקציה והאינטראקציות (app.js - V19)
   ========================================================================== */

var currentTab = "feed";
var currentNusach = localStorage.getItem(STORAGE_KEYS.NUSACH) || "mizrach";
var activePrayerKey = "hashachar";
var activeChumashId = "bereishit";
var restTypeFilter = "all";
var restHechFilter = "all";
var MITZVOT_LIST = window.getStorageJson(STORAGE_KEYS.CUSTOM_MITZVOT, window.DEFAULT_MITZVOT_DATA);

window.switchTab = function(tabId) {
  if (tabId === "learn") tabId = "series";
  if (tabId === "pray") tabId = "siddur";
  if (tabId === "find") tabId = "chabad";
  if (tabId === "givebuy" || tabId === "donate") tabId = "raffles";

  currentTab = tabId;
  var sections = document.querySelectorAll(".view-section");
  for (var i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }
  var target = document.getElementById("view-" + tabId);
  if (target) target.classList.add("active");

  var parentHub = tabId;
  if (["series", "kids", "live", "forum"].indexOf(tabId) !== -1) parentHub = "series";
  else if (["siddur", "minyanim", "rabbis"].indexOf(tabId) !== -1) parentHub = "siddur";
  else if (["chabad", "mikvaot", "restaurants", "tzaddikim", "gemachim", "customs", "zmanim"].indexOf(tabId) !== -1) parentHub = "find";
  else if (["donate", "judaica", "raffles", "donors"].indexOf(tabId) !== -1) parentHub = "givebuy";
  else if (["feed"].indexOf(tabId) !== -1) parentHub = "feed";

  var pills = document.querySelectorAll(".pill-btn");
  for (var j = 0; j < pills.length; j++) {
    pills[j].classList.remove("active");
  }
  var activePill = document.getElementById("pill-" + tabId) || document.getElementById("pill-" + parentHub);
  if (activePill) activePill.classList.add("active");

  var bnavs = document.querySelectorAll(".bottom-nav-item");
  for (var k = 0; k < bnavs.length; k++) {
    bnavs[k].classList.remove("active");
  }
  var activeBNav = document.getElementById("bnav-" + parentHub);
  if (activeBNav) activeBNav.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.openSuperDrawer = function() {
  var el = document.getElementById("modal-super-drawer");
  if (el) el.classList.remove("hidden");
};

window.selectDrawerTab = function(tabId) {
  window.closeModal("modal-super-drawer");
  window.switchTab(tabId);
};

window.closeModal = function(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add("hidden");
};

window.openIntroModal = function() {
  var el = document.getElementById("modal-intro-welcome");
  if (el) el.classList.remove("hidden");
};

window.closeIntroModal = function(dontShowAgain) {
  if (dontShowAgain) {
    localStorage.setItem(STORAGE_KEYS.INTRO_SEEN, "true");
  }
  window.closeModal("modal-intro-welcome");
};

// חיפוש חכם גלובלי
window.handleGlobalSearch = function(e) {
  var q = (document.getElementById("global-search-input").value || "").trim().toLowerCase();
  if (!q) return;
  if (e.key === "Enter") {
    if (q.includes("מקווה") || q.includes("טבילה")) window.switchTab("mikvaot");
    else if (q.includes("מסעד") || q.includes("אוכל") || q.includes("כשר")) window.switchTab("restaurants");
    else if (q.includes("גמח") || q.includes("גמ״ח") || q.includes("יד שרה") || q.includes("עזר")) window.switchTab("gemachim");
    else if (q.includes("חבד") || q.includes("חב״ד") || q.includes("שליח")) window.switchTab("chabad");
    else if (q.includes("הגרל") || q.includes("קמפיין") || q.includes("תרומ")) window.switchTab("raffles");
    else if (q.includes("סידור") || q.includes("תפיל") || q.includes("שחרית")) window.switchTab("siddur");
    else if (q.includes("צדיק") || q.includes("קבר") || q.includes("מירון")) window.switchTab("tzaddikim");
    else if (q.includes("מניין") || q.includes("מנין")) window.switchTab("minyanim");
    else if (q.includes("ספרי") || q.includes("חומש") || q.includes("פרש") || q.includes("נביא") || q.includes("ראשונים")) window.switchTab("series");
    else window.toast('חיפוש מהיר עבור: "' + q + '"');
  }
};

// ============================================================================
// 1. מסך ראשי (Home / Feed): לוח היום + זמנים דחופים + יארצייט יומי + שיעורים + פרשה + רילס
// ============================================================================
window.renderHomeDashboard = function() {
  var hebDateEl = document.getElementById("home-hebrew-date");
  if (hebDateEl) hebDateEl.textContent = window.getHebrewDateString();
};

window.renderFeedCards = function(cards) {
  var container = document.getElementById("feed-cards-container");
  if (!container) return;
  var likesState = window.getStorageJson(STORAGE_KEYS.LIKES, {});

  container.innerHTML = cards
    .map(function(item) {
      var totalLikes = (item.likes + (likesState[item.id] || 0)).toLocaleString();
      return `
      <div class="mobile-full-bleed relative bg-slate-950 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
        <div class="absolute top-0 left-0 right-0 z-20 p-3.5 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">צ</span>
            <div>
              <span class="text-xs font-black text-white flex items-center gap-1">${item.creator} <span class="text-cyan-400 text-[10px]">✔</span></span>
              <span class="text-[10px] text-amber-300 font-medium">${item.chumash}</span>
            </div>
          </div>
          <button onclick="openSeriesEpisodes('${item.seriesId || "s_joseph"}')" class="px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-[11px] font-black shadow-lg active:scale-95">
            📺 לפרק המלא
          </button>
        </div>

        <div class="relative w-full h-[72vh] sm:h-[620px] bg-slate-950 flex items-center justify-center overflow-hidden">
          <img src="${item.image}" alt="${item.title}" class="absolute inset-0 w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/95"></div>

          <button onclick="toast('מנגן סרטון רילס ב-4K')" class="relative z-10 w-16 h-16 rounded-full bg-amber-500/95 hover:bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-2xl active:scale-95 transition-all">
            ▶
          </button>

          <div class="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-3.5">
            <button onclick="toggleLike('${item.id}')" class="flex flex-col items-center gap-0.5">
              <div class="w-10 h-10 rounded-full bg-slate-900/85 border border-slate-700 flex items-center justify-center text-red-500 text-lg shadow-lg">❤️</div>
              <span id="like-count-${item.id}" class="text-[11px] font-bold text-white">${totalLikes}</span>
            </button>
            <button onclick="openRashiDrawer('${item.id}')" class="flex flex-col items-center gap-0.5">
              <div class="w-10 h-10 rounded-full bg-amber-500/25 border border-amber-500/60 flex items-center justify-center text-amber-300 text-lg shadow-lg">📖</div>
              <span class="text-[10px] font-bold text-amber-300">רש״י וחז״ל</span>
            </button>
            <button onclick="toast('הקישור הועתק לשיתוף בוואטסאפ!')" class="flex flex-col items-center gap-0.5">
              <div class="w-10 h-10 rounded-full bg-slate-900/85 border border-slate-700 flex items-center justify-center text-white text-lg shadow-lg">📤</div>
              <span class="text-[11px] font-bold text-white">שתף</span>
            </button>
          </div>

          <div class="absolute bottom-0 left-0 right-16 z-20 p-4 space-y-1.5 text-right">
            <h3 class="text-base font-black text-white">${item.title}</h3>
            <p class="text-xs text-amber-200 font-serif line-clamp-2">${item.quote}</p>
            <p class="text-[11px] text-slate-300 line-clamp-1">${item.rashi}</p>
          </div>
        </div>
      </div>
      `;
    })
    .join("");
};

window.filterFeedCards = function(cat) {
  var btns = document.querySelectorAll(".feed-tag-btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].className = "feed-tag-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 shrink-0";
  }
  var ev = (typeof window !== "undefined" && window.event) || (typeof event !== "undefined" ? event : null);
  if (ev && ev.target) {
    ev.target.className = "feed-tag-btn active px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shrink-0";
  }
  if (cat === "all") window.renderFeedCards(window.REEL_FEED);
  else window.renderFeedCards(window.REEL_FEED.filter(function(i) { return i.category === cat; }));
};

window.toggleLike = function(id) {
  var likesState = window.getStorageJson(STORAGE_KEYS.LIKES, {});
  likesState[id] = (likesState[id] || 0) + 1;
  window.setStorageJson(STORAGE_KEYS.LIKES, likesState);
  window.renderFeedCards(window.REEL_FEED);
  window.toast("אהבת את הפרק! ❤️");
};

window.openRashiDrawer = function(id) {
  var item = window.REEL_FEED.find(function(i) { return i.id === id; }) || window.REEL_FEED[0];
  document.getElementById("rashi-drawer-title").textContent = item.title;
  document.getElementById("rashi-text-content").textContent = item.rashi;
  document.getElementById("midrash-text-content").textContent = item.midrash;
  document.getElementById("pasuk-text-content").textContent = item.quote;
  document.getElementById("modal-rashi-drawer").classList.remove("hidden");
};

window.switchRashiTab = function(t) {
  if (t === "midrash") {
    document.getElementById("rashi-tab-midrash").classList.remove("hidden");
    document.getElementById("rashi-tab-pasuk").classList.add("hidden");
    document.getElementById("rtab-midrash").className = "flex-1 py-1.5 rounded-lg font-bold bg-amber-500 text-slate-950";
    document.getElementById("rtab-pasuk").className = "flex-1 py-1.5 rounded-lg font-bold text-slate-400 hover:text-white";
  } else {
    document.getElementById("rashi-tab-midrash").classList.add("hidden");
    document.getElementById("rashi-tab-pasuk").classList.remove("hidden");
    document.getElementById("rtab-pasuk").className = "flex-1 py-1.5 rounded-lg font-bold bg-amber-500 text-slate-950";
    document.getElementById("rtab-midrash").className = "flex-1 py-1.5 rounded-lg font-bold text-slate-400 hover:text-white";
  }
};

// ============================================================================
// 2. הספרייה המרכזית (Library): תורה (54 פרשיות) | נביאים וכתובים | היסטוריה ודורות | סדרות AI
// ============================================================================
window.switchLibrarySubTab = function(subId) {
  ["weekseries", "music", "torah", "nach", "generations", "aiseries", "eduvideos"].forEach(function(k) {
    var box = document.getElementById("lib-sub-" + k);
    var btn = document.getElementById("lib-btn-" + k);
    if (box) {
      if (k === subId || (subId === "generations" && k === "aiseries")) box.classList.remove("hidden");
      else box.classList.add("hidden");
    }
    if (btn) {
      btn.className = (k === subId)
        ? "px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black shrink-0 shadow-md"
        : "px-4 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-bold shrink-0";
    }
  });
};

window.selectChumash = function(chumashId) {
  activeChumashId = chumashId;
  var chObj = window.CHUMASHIM_PARASHOT.find(function(c) { return c.id === chumashId; }) || window.CHUMASHIM_PARASHOT[0];
  ["bereishit", "shemot", "vayikra", "bamidbar", "devarim"].forEach(function(id) {
    var b = document.getElementById("chumash-btn-" + id);
    if (b) {
      b.className = (id === chumashId)
        ? "px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shrink-0"
        : "px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs shrink-0 hover:border-amber-500/40";
    }
  });

  var headerTitle = document.getElementById("chumash-display-title");
  var headerSub = document.getElementById("chumash-display-subtitle");
  if (headerTitle) headerTitle.textContent = chObj.title;
  if (headerSub) headerSub.textContent = chObj.subtitle;

  var grid = document.getElementById("parashot-grid-container");
  if (!grid) return;
  grid.innerHTML = chObj.parashot
    .map(function(p, idx) {
      return `
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3 hover:border-amber-500/50 transition-all">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] px-2 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md font-bold">פרשה ${idx + 1} • ${chObj.title}</span>
            <span class="text-[10px] font-bold text-emerald-400">🎬 ${p.videoStatus}</span>
          </div>
          <h4 class="text-base font-black text-white mt-1.5">פרשת ${p.name}</h4>
          <p class="text-xs text-slate-300 leading-relaxed mt-1">${p.summary}</p>
          <p class="text-[11px] text-amber-300/90 mt-2 bg-slate-950 p-2 rounded-xl border border-slate-800/80">📖 <strong>פניני רש״י:</strong> ${p.rashi}</p>
        </div>
        <div class="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <button onclick="openParashaViewer('${chObj.id}', '${p.name}')" class="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-center">
            ▶ סרטון ותוכן הפרשה
          </button>
          <a href="https://www.sefaria.org/search?q=${encodeURIComponent("פרשת " + p.name)}" target="_blank" class="px-3 py-2 bg-slate-800 text-amber-300 font-bold rounded-xl">
            ספריא ↗
          </a>
        </div>
      </div>
    `;
    })
    .join("");
};

window.openParashaViewer = function(chumashId, parashaName) {
  var chObj = window.CHUMASHIM_PARASHOT.find(function(c) { return c.id === chumashId; }) || window.CHUMASHIM_PARASHOT[0];
  var pObj = chObj.parashot.find(function(p) { return p.name === parashaName; }) || chObj.parashot[0];
  document.getElementById("parasha-modal-title").textContent = "פרשת " + pObj.name + " (" + chObj.title + ")";
  document.getElementById("parasha-modal-summary").textContent = pObj.summary;
  document.getElementById("parasha-modal-rashi").textContent = pObj.rashi;
  document.getElementById("modal-parasha-viewer").classList.remove("hidden");
};

window.renderNachBooks = function() {
  var c = document.getElementById("nach-books-container");
  if (!c) return;
  c.innerHTML = window.NACH_BOOKS.map(function(grp) {
    return `
      <div class="space-y-3">
        <h3 class="text-base font-black text-amber-400 border-b border-slate-800 pb-1.5">📜 ${grp.group}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${grp.books
            .map(function(b) {
              return `
              <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3 hover:border-amber-500/40">
                <div>
                  <span class="text-[10px] px-2 py-0.5 bg-slate-800 text-amber-300 rounded font-bold">${b.chapters}</span>
                  <h4 class="text-sm font-black text-white mt-1.5">${b.name}</h4>
                  <p class="text-xs text-slate-300 mt-1 leading-relaxed">${b.desc}</p>
                </div>
                <div class="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                  <button onclick="toast('פותח חדר לימוד וסרטון עבור ' + '${b.name}')" class="flex-1 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl">🎬 צפה וקרא</button>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
  }).join("");
};

window.renderGenerationsHistory = function() {
  var c = document.getElementById("generations-history-container");
  if (!c) return;
  c.innerHTML = window.GENERATIONS_HISTORY.map(function(gen) {
    return `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span class="text-[11px] font-black text-amber-400">${gen.years}</span>
            <h3 class="text-lg font-black text-white">${gen.era}</h3>
            <p class="text-xs text-slate-300">${gen.desc}</p>
          </div>
          <button onclick="toast('ניתן להוסיף דמויות ורבנים לתקופה זו')" class="px-3 py-1.5 bg-slate-800 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold self-start">
            ➕ הוסף דמות / רב לדור זה
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          ${gen.figures
            .map(function(f) {
              return `
              <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 flex flex-col justify-between">
                <div>
                  <span class="text-[10px] text-amber-400 font-bold block">${f.role}</span>
                  <h4 class="text-sm font-black text-white">${f.name}</h4>
                  <p class="text-xs text-slate-300 mt-1 leading-relaxed">${f.story}</p>
                </div>
                <button onclick="toast('פותח סרטון ותולדות חייו של ' + '${f.name}')" class="w-full mt-2 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold rounded-xl text-xs transition-colors">
                  📖 סרטון ותולדות הצדיק
                </button>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
  }).join("");
};

window.renderSeries = function(seriesList) {
  var c = document.getElementById("series-grid-container");
  if (!c) return;
  c.innerHTML = seriesList
    .map(function(s) {
      return `
      <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-500/40 transition-all">
        <div class="relative h-44 w-full bg-slate-950 overflow-hidden">
          <img src="${s.image}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/60"></div>
          <span class="absolute top-3 right-3 px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">${s.badge}</span>
          <span class="absolute bottom-3 right-3 text-[11px] text-amber-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">${s.season}</span>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <span class="text-[11px] text-amber-400 font-bold">${s.era} • ${s.tag}</span>
            <h3 class="text-base font-black text-white mt-0.5">${s.title}</h3>
            <p class="text-xs text-slate-300 leading-relaxed mt-1.5">${s.desc}</p>
          </div>
          <button onclick="openSeriesEpisodes('${s.id}')" class="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs">
            🎬 צפה ברשימת הפרקים (${s.episodes ? s.episodes.length : s.episodesCount})
          </button>
        </div>
      </div>
    `;
    })
    .join("");
};

window.openSeriesEpisodes = function(seriesId) {
  var s = window.SERIES_LIBRARY.find(function(i) { return i.id === seriesId; }) || window.SERIES_LIBRARY[0];
  document.getElementById("episodes-series-title").textContent = s.title;
  document.getElementById("episodes-series-status").textContent = s.season;
  var list = document.getElementById("episodes-list-container");
  if (s.episodes) {
    list.innerHTML = s.episodes
      .map(function(ep) {
        return `
        <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 font-black flex items-center justify-center text-xs shrink-0">${ep.num}</span>
            <div>
              <h4 class="text-xs font-black text-white">${ep.title} (${ep.duration})</h4>
              <p class="text-[11px] text-slate-400">${ep.desc}</p>
            </div>
          </div>
          <button onclick="toast('מנגן פרק מלא')" class="px-3 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs shrink-0">▶ צפה</button>
        </div>
      `;
      })
      .join("");
  }
  document.getElementById("modal-episodes").classList.remove("hidden");
};

// ============================================================================
// 3. חנות יודאיקה
// ============================================================================
window.renderJudaica = function(products) {
  var c = document.getElementById("judaica-grid-container");
  if (!c) return;
  c.innerHTML = products
    .map(function(p) {
      return `
      <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-500/40 transition-all">
        <div class="relative h-44 w-full bg-slate-950 overflow-hidden">
          <img src="${p.image}" class="w-full h-full object-cover">
          <span class="absolute top-3 right-3 px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">${p.badge}</span>
          <span class="absolute bottom-3 left-3 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-black text-amber-400">${window.formatPriceILS(p.price)}</span>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <span class="text-[10px] text-amber-400 font-bold">${p.category}</span>
            <h3 class="text-base font-black text-white mt-0.5">${p.name}</h3>
            <p class="text-xs text-slate-300 mt-1">${p.desc}</p>
            <p class="text-[10px] text-slate-400 mt-1.5">כשרות: ${p.hechsher}</p>
          </div>
          <div class="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button onclick="addToCart('${p.id}')" class="flex-1 py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">🛒 הוסף לעגלה</button>
            <button onclick="buyNowWhatsApp('${p.id}')" class="px-3 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs">וואטסאפ</button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
};

window.filterJudaica = function(cat) {
  var btns = document.querySelectorAll(".judaica-cat-btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].className = "judaica-cat-btn px-4 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 shrink-0";
  }
  var ev = (typeof window !== "undefined" && window.event) || (typeof event !== "undefined" ? event : null);
  if (ev && ev.target) {
    ev.target.className = "judaica-cat-btn active px-4 py-1.5 rounded-xl font-bold bg-amber-500 text-slate-950 shrink-0";
  }
  if (cat === "all") window.renderJudaica(window.JUDAICA_PRODUCTS);
  else window.renderJudaica(window.JUDAICA_PRODUCTS.filter(function(p) { return p.category === cat; }));
};

window.addToCart = function(id) {
  var cart = window.getStorageJson(STORAGE_KEYS.CART, {});
  cart[id] = (cart[id] || 0) + 1;
  window.setStorageJson(STORAGE_KEYS.CART, cart);
  window.updateCartBadge();
  window.toast("המוצר נוסף לעגלת הקניות! 🛒");
};

window.updateCartBadge = function() {
  var cart = window.getStorageJson(STORAGE_KEYS.CART, {});
  var values = Object.values(cart);
  var count = 0;
  for (var i = 0; i < values.length; i++) count += values[i];
  var b1 = document.getElementById("cart-badge");
  var b2 = document.getElementById("judaica-cart-count");
  if (b1) b1.textContent = count;
  if (b2) b2.textContent = count;
};

window.openCartModal = function() {
  var cart = window.getStorageJson(STORAGE_KEYS.CART, {});
  var list = document.getElementById("cart-items-list");
  var total = 0;
  var entries = Object.entries(cart);
  if (entries.length === 0) {
    list.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">עגלת הקניות ריקה כרגע.</p>`;
  } else {
    list.innerHTML = entries
      .map(function(entry) {
        var id = entry[0];
        var qty = entry[1];
        var p = window.JUDAICA_PRODUCTS.find(function(i) { return i.id === id; });
        if (!p) return "";
        var sub = p.price * qty;
        total += sub;
        return `
          <div class="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <div>
              <h4 class="font-bold text-white">${p.name}</h4>
              <span class="text-amber-400">₪${p.price} × ${qty} = ${window.formatPriceILS(sub)}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="changeCartQty('${id}', -1)" class="w-6 h-6 rounded bg-slate-800 text-white">-</button>
              <span class="font-bold text-white px-1">${qty}</span>
              <button onclick="changeCartQty('${id}', 1)" class="w-6 h-6 rounded bg-slate-800 text-white">+</button>
            </div>
          </div>
        `;
      })
      .join("");
  }
  document.getElementById("cart-total-price").textContent = window.formatPriceILS(total);
  document.getElementById("modal-cart").classList.remove("hidden");
};

window.changeCartQty = function(id, delta) {
  var cart = window.getStorageJson(STORAGE_KEYS.CART, {});
  var next = (cart[id] || 0) + delta;
  if (next <= 0) delete cart[id];
  else cart[id] = next;
  window.setStorageJson(STORAGE_KEYS.CART, cart);
  window.updateCartBadge();
  window.openCartModal();
};

window.sendWhatsAppOrder = function() {
  var cart = window.getStorageJson(STORAGE_KEYS.CART, {});
  var entries = Object.entries(cart);
  if (entries.length === 0) return window.toast("העגלה ריקה");
  var lines = ["שלום צדיק-טוק! הזמנה חדשה מהמרקטפלייס:"];
  var total = 0;
  entries.forEach(function(entry) {
    var id = entry[0];
    var qty = entry[1];
    var p = window.JUDAICA_PRODUCTS.find(function(i) { return i.id === id; });
    if (p) {
      lines.push("• " + p.name + " (כמות: " + qty + ") - ₪" + (p.price * qty));
      total += p.price * qty;
    }
  });
  lines.push("סך הכל לתשלום: ₪" + total);
  window.open(window.buildWhatsAppUrl("972500000000", lines.join(" - ")), "_blank");
};

window.buyNowWhatsApp = function(id) {
  var p = window.JUDAICA_PRODUCTS.find(function(i) { return i.id === id; });
  if (!p) return;
  window.open(window.buildWhatsAppUrl("972500000000", "שלום, מעוניין להזמין: " + p.name), "_blank");
};

// ============================================================================
// 4. יהדות וסידור תפילה מחולק ומלא (ללא מוזיקה)
// ============================================================================
window.setNusach = function(n) {
  currentNusach = n;
  localStorage.setItem(STORAGE_KEYS.NUSACH, n);
  ["mizrach", "ashkenaz", "sefarad", "teiman"].forEach(function(k) {
    var b = document.getElementById("nusach-" + k);
    if (b) {
      b.className =
        k === n
          ? "px-2.5 py-1 rounded-lg font-bold bg-amber-500 text-slate-950"
          : "px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white";
    }
  });
  window.loadPrayer(activePrayerKey);
};

window.selectPrayer = function(k) {
  activePrayerKey = k;
  var btns = document.querySelectorAll(".prayer-nav-btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].className = "prayer-nav-btn px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 shrink-0";
  }
  var b = document.getElementById("ptab-" + k);
  if (b) b.className = "prayer-nav-btn active px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shrink-0";
  window.loadPrayer(k);
};

window.loadPrayer = function(k) {
  var p = window.PRAYERS_DATA[k] || window.PRAYERS_DATA["hashachar"];
  if (!p) return;
  document.getElementById("prayer-display-title").textContent = p.title;
  var body = (p.texts && p.texts[currentNusach]) || p.text || (p.texts && p.texts["mizrach"]) || "";
  document.getElementById("prayer-display-body").innerHTML = body;
  var link = document.getElementById("prayer-sefaria-link");
  if (link && p.sefaria) link.href = p.sefaria;
};

// 5. קברי צדיקים
window.renderTzaddikim = function(list) {
  var c = document.getElementById("tzaddikim-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(function(t) {
      return `
      <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
        <div class="relative h-40 w-full bg-slate-950 overflow-hidden">
          <img src="${t.image}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/60"></div>
          <span class="absolute top-3 right-3 px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">${t.region}</span>
          <div class="absolute bottom-3 right-3">
            <h3 class="text-base font-black text-white">${t.name}</h3>
            <p class="text-[11px] text-amber-300">${t.location}</p>
          </div>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between space-y-3 text-xs">
          <div>
            <p class="text-slate-300"><strong class="text-amber-400">הילולא:</strong> ${t.yahrzeit}</p>
            <p class="text-slate-300 mt-1"><strong class="text-amber-400">מסורת:</strong> ${t.segula}</p>
          </div>
          <div class="pt-3 border-t border-slate-800 flex items-center gap-2">
            <a href="${window.buildWazeUrl(t.waze)}" target="_blank" class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold text-center">🚗 Waze</a>
            <button onclick="openCandleModal('${t.name}')" class="flex-1 py-2 bg-amber-500 text-slate-950 font-black rounded-xl">🕯️ הדלק נר</button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
};

window.filterTzaddikim = function(reg) {
  var btns = document.querySelectorAll(".tz-region-btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].className = "tz-region-btn px-4 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 shrink-0";
  }
  var ev = (typeof window !== "undefined" && window.event) || (typeof event !== "undefined" ? event : null);
  if (ev && ev.target) {
    ev.target.className = "tz-region-btn active px-4 py-1.5 rounded-xl font-bold bg-amber-500 text-slate-950 shrink-0";
  }
  if (reg === "all") window.renderTzaddikim(window.TZADDIKIM_DATA);
  else window.renderTzaddikim(window.TZADDIKIM_DATA.filter(function(t) { return t.region === reg; }));
};

window.openCandleModal = function(name) {
  document.getElementById("candle-tzaddik-name").textContent = name + " זיע״א";
  document.getElementById("modal-candle").classList.remove("hidden");
};

window.confirmLightCandle = function() {
  var name = document.getElementById("candle-user-name").value.trim() || "ישראל";
  window.closeModal("modal-candle");
  window.toast("נר וירטואלי הודלק לעילוי נשמת הצדיק עבור " + name + "! 🕯️");
};

// 6. מקוואות
window.renderMikvaot = function(list) {
  var c = document.getElementById("mikvaot-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(function(m) {
      return `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">מקווה ${m.category}</span>
            <span class="text-xs font-bold ${m.isOpen ? "text-emerald-400" : "text-slate-400"}">${m.isOpen ? "🟢 פתוח עכשיו" : "שעות בהמשך"}</span>
          </div>
          <h3 class="text-base font-black text-white mt-2">${m.name}</h3>
          <p class="text-xs text-slate-300 mt-1">📍 ${m.address}</p>
          <p class="text-xs text-amber-300 font-mono mt-1">⏰ ${m.hours}</p>
          <p class="text-[11px] text-slate-400 mt-1">${m.notes}</p>
        </div>
        <div class="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs">
          <a href="${window.buildTelUrl(m.phone)}" class="flex-1 py-2 bg-slate-800 text-white font-bold rounded-xl text-center">📞 ${m.phone}</a>
          <a href="${window.buildWazeUrl(m.waze)}" target="_blank" class="flex-1 py-2 bg-blue-600 text-white font-bold rounded-xl text-center">🚗 Waze</a>
          <a href="${window.buildWhatsAppUrl(m.whatsapp, "שלום, מה שעות הטבילה היום?")}" target="_blank" class="p-2 bg-emerald-600 text-white font-bold rounded-xl">💬</a>
        </div>
      </div>
    `;
    })
    .join("");
};

window.filterMikvaot = function(t) {
  var btns = document.querySelectorAll(".mikvah-filter-btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].className = "mikvah-filter-btn px-4 py-2 rounded-xl font-bold bg-slate-800 text-slate-300 shrink-0";
  }
  var ev = (typeof window !== "undefined" && window.event) || (typeof event !== "undefined" ? event : null);
  if (ev && ev.target) {
    ev.target.className = "mikvah-filter-btn active px-4 py-2 rounded-xl font-bold bg-blue-500 text-slate-950 shrink-0";
  }
  if (t === "all") window.renderMikvaot(window.MIKVAOT_DATA);
  else if (t === "open") window.renderMikvaot(window.MIKVAOT_DATA.filter(function(m) { return m.isOpen; }));
  else window.renderMikvaot(window.MIKVAOT_DATA.filter(function(m) { return m.category === t; }));
};

// 7. מסעדות כשרות
window.renderRestaurants = function(list) {
  var c = document.getElementById("restaurants-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(function(r) {
      return `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">${r.type}</span>
            <span class="text-xs font-bold text-emerald-400">🟢 פתוח</span>
          </div>
          <h3 class="text-base font-black text-white mt-2">${r.name}</h3>
          <div class="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <span class="text-[10px] text-amber-300 block font-bold">תעודת כשרות:</span>
            <span class="text-xs font-black text-amber-400 block">${r.hechsher}</span>
          </div>
          <p class="text-xs text-slate-300 mt-2">📍 ${r.address}</p>
          <p class="text-xs text-slate-400 font-mono mt-0.5">⏰ ${r.hours}</p>
        </div>
        <div class="pt-3 border-t border-slate-800 space-y-2 text-xs">
          <div class="flex items-center gap-2">
            <a href="${window.buildWazeUrl(r.waze)}" target="_blank" class="flex-1 py-2 bg-slate-800 text-blue-400 font-bold rounded-xl text-center">🚗 Waze</a>
            <a href="${window.buildGoogleMapsUrl(r.name, r.city)}" target="_blank" class="flex-1 py-2 bg-slate-800 text-emerald-400 font-bold rounded-xl text-center">🗺️ מפות</a>
          </div>
          <a href="https://www.google.com/search?q=${encodeURIComponent(r.name + " " + r.city + " כשר בסביבה")}" target="_blank" class="block w-full py-2 bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-center">
            🔍 פתח בכשר בסביבה
          </a>
        </div>
      </div>
    `;
    })
    .join("");
};

window.applyRestaurantFilters = function() {
  var q = (document.getElementById("rest-search-input").value || "").trim().toLowerCase();
  var res = window.RESTAURANTS_DATA;
  if (q) res = res.filter(function(r) { return r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q); });
  if (restTypeFilter !== "all") res = res.filter(function(r) { return r.type === restTypeFilter; });
  if (restHechFilter !== "all") res = res.filter(function(r) { return r.hechsher.includes(restHechFilter); });
  window.renderRestaurants(res);
};

window.filterRestType = function(t) {
  restTypeFilter = t;
  var btns = document.querySelectorAll(".rest-type-btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].className = "rest-type-btn px-3 py-1 rounded-lg bg-slate-800 text-slate-300 shrink-0";
  }
  var ev = (typeof window !== "undefined" && window.event) || (typeof event !== "undefined" ? event : null);
  if (ev && ev.target) {
    ev.target.className = "rest-type-btn active px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold shrink-0";
  }
  window.applyRestaurantFilters();
};

window.filterRestHechsher = function(h) {
  restHechFilter = h;
  var btns = document.querySelectorAll(".rest-hech-btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].className = "rest-hech-btn px-3 py-1 rounded-lg bg-slate-800 text-slate-300 shrink-0";
  }
  var ev = (typeof window !== "undefined" && window.event) || (typeof event !== "undefined" ? event : null);
  if (ev && ev.target) {
    ev.target.className = "rest-hech-btn active px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold shrink-0";
  }
  window.applyRestaurantFilters();
};

// 8-15. גמ״חים, חב״ד, מניינים, הגרלות, זמנים + לוח שנה ויארצייטים, רבנים, מנהגים
window.renderGemachim = function(list) {
  var c = document.getElementById("gemachim-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(function(g) {
      return `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between">
        <div>
          <span class="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-[10px] font-bold">${g.category}</span>
          <h3 class="text-base font-black text-white mt-2">${g.name}</h3>
          <p class="text-xs text-amber-300 mt-1">📍 ${g.city}</p>
          <p class="text-xs text-slate-300 leading-relaxed mt-1.5">${g.desc}</p>
        </div>
        <div class="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs">
          <a href="${window.buildTelUrl(g.phone)}" class="flex-1 py-2 bg-cyan-500 text-slate-950 font-black rounded-xl text-center">📞 חייג: ${g.phone}</a>
          <a href="${window.buildWazeUrl(g.waze)}" target="_blank" class="px-4 py-2 bg-slate-800 text-slate-200 font-bold rounded-xl">🚗 Waze</a>
        </div>
      </div>
    `;
    })
    .join("");
};

window.renderChabad = function(list) {
  var c = document.getElementById("chabad-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(function(ch) {
      return `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between">
        <div>
          <span class="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold">שליח הרבי: ${ch.shaliach}</span>
          <h3 class="text-base font-black text-white mt-2">${ch.name}</h3>
          <p class="text-xs text-slate-400 mt-1">📍 ${ch.address} (${ch.city})</p>
          <p class="text-xs text-slate-300 mt-2">${ch.services}</p>
        </div>
        <div class="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs">
          <a href="${window.buildWhatsAppUrl(ch.whatsapp, "שלום וברכה לבית חב״ד!")}" target="_blank" class="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl text-center">💬 וואטסאפ לבית חב״ד</a>
          <a href="${window.buildWazeUrl(ch.waze)}" target="_blank" class="flex-1 py-2 bg-slate-800 text-amber-300 font-bold rounded-xl text-center">🚗 Waze</a>
        </div>
      </div>
    `;
    })
    .join("");
};

window.renderMinyanim = function(list) {
  var c = document.getElementById("minyanim-container");
  if (!c) return;
  c.innerHTML = list
    .map(function(m) {
      return `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2.5 text-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-amber-400 font-black">${m.type}</span>
            <span class="text-slate-400">📍 ${m.city}</span>
          </div>
          <h4 class="font-black text-white text-base mt-1">${m.name}</h4>
          <p class="text-slate-400">${m.address}</p>
          <p class="text-amber-200 font-mono mt-2">${m.times}</p>
        </div>
        <div class="pt-3 border-t border-slate-800 flex items-center gap-2">
          <button onclick="toast('אישרת הגעה למניין!')" class="flex-1 py-2 bg-amber-500 text-slate-950 font-black rounded-xl">✋ אני מצטרף</button>
          <a href="${window.buildWazeUrl(m.waze)}" target="_blank" class="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl">🚗 Waze</a>
        </div>
      </div>
    `;
    })
    .join("");
};

window.triggerMinyanAlert = function() {
  window.toast("📢 התראת 'קריאת מניין' נשלחה לכל המשתמשים ברדיוס 500 מטר להשלמת עשירי!");
};

window.renderRaffles = function(list) {
  var c = document.getElementById("raffles-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(function(rf) {
      return `
      <div class="bg-slate-900 border border-amber-500/30 p-5 rounded-3xl space-y-3 flex flex-col justify-between">
        <div>
          <span class="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">${rf.badge}</span>
          <h3 class="text-base font-black text-white mt-2">${rf.title}</h3>
          <p class="text-xs text-amber-300 mt-1">🎁 פרס: ${rf.prize}</p>
          <p class="text-[11px] text-slate-400 mt-1">הגרלה ב: ${rf.drawDate} • ${rf.org}</p>
        </div>
        <div class="space-y-2 pt-2 border-t border-slate-800">
          <span class="text-[10px] text-slate-400 block">בחר כרטיס קודש להשתתפות:</span>
          <div class="grid grid-cols-4 gap-1.5 text-xs">
            ${rf.prices
              .map(function(p) {
                return `<button onclick="toast('נרכש כרטיס הגרלה בסך ₪${p} בהצלחה! 🎟️')" class="py-1.5 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 rounded-lg font-bold text-amber-300 transition-colors">₪${p}</button>`;
              })
              .join("")}
          </div>
        </div>
      </div>
    `;
    })
    .join("");
};

window.renderCampaigns = function(list) {
  var c = document.getElementById("campaigns-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(function(cp) {
      var pct = Math.min(100, Math.round((cp.raised / cp.target) * 100));
      return `
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between">
          <div>
            <span class="text-[10px] text-amber-400 font-bold">${cp.tag}</span>
            <h3 class="text-base font-black text-white mt-1">${cp.title}</h3>
            <p class="text-xs text-slate-300 mt-1">${cp.desc}</p>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-xs font-bold">
              <span class="text-amber-400">${window.formatPriceILS(cp.raised)}</span>
              <span class="text-slate-400">יעד: ${window.formatPriceILS(cp.target)} (${pct}%)</span>
            </div>
            <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
              <div class="h-full bg-amber-500" style="width:${pct}%"></div>
            </div>
            <button onclick="openDonateModal()" class="w-full py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">❤️ שותפות בקמפיין</button>
          </div>
        </div>
      `;
    })
    .join("");
};

window.renderDonorsBook = function(list) {
  var c = document.getElementById("donors-book-container");
  if (!c) return;
  c.innerHTML = list
    .map(function(d) {
      return `
      <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
        <div>
          <span class="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">${d.tier}</span>
          <h4 class="font-black text-white mt-1">${d.name}</h4>
          <p class="text-[11px] text-slate-400">${d.dedication}</p>
        </div>
        <span class="text-sm font-black text-amber-400">${d.amount}</span>
      </div>
    `;
    })
    .join("");
};

// זמני היום + לוח שנה ויארצייטים (בלשונית זמנים)
window.renderZmanim = function() {
  var g = document.getElementById("zmanim-grid");
  if (!g) return;
  var tms = [
    { n: "עלות השחר", t: "04:52" },
    { n: "הנץ החמה", t: "06:07" },
    { n: "סוף זמן שמע", t: "08:37" },
    { n: "סוף זמן תפילה", t: "09:42" },
    { n: "חצות היום", t: "12:20" },
    { n: "מנחה גדולה", t: "12:50" },
    { n: "פלג המנחה", t: "15:42" },
    { n: "שקיעת החמה", t: "16:50" },
    { n: "צאת הכוכבים", t: "17:15" },
    { n: "זמן רבינו תם", t: "18:02" }
  ];
  g.innerHTML = tms
    .map(function(t) {
      return `
      <div class="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
        <span class="text-[10px] text-slate-400 block">${t.n}</span>
        <span class="text-sm font-black text-amber-400 font-mono mt-1 block">${t.t}</span>
      </div>
    `;
    })
    .join("");

  var yContainer = document.getElementById("zmanim-yahrzeits-container");
  if (yContainer && window.YAHRZEITS_CALENDAR) {
    yContainer.innerHTML = window.YAHRZEITS_CALENDAR.map(function(y) {
      return `
        <div class="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-2 text-xs">
          <div>
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-bold text-[10px]">🕯️ ${y.date}</span>
              <span class="text-[11px] text-slate-400">📍 ${y.location}</span>
            </div>
            <h4 class="text-sm font-black text-white mt-1.5">${y.name}</h4>
            <p class="text-[11px] text-amber-400 font-bold">${y.title}</p>
            <p class="text-xs text-slate-300 mt-1 leading-relaxed">${y.segula}</p>
          </div>
          <button onclick="openCandleModal('${y.name}')" class="w-full py-2 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 font-black rounded-xl text-xs transition-colors">
            🕯️ הדלק נר לעילוי נשמתו
          </button>
        </div>
      `;
    }).join("");
  }
};

window.renderCheshbon = function() {
  var c = document.getElementById("cheshbon-container");
  if (!c) return;
  c.innerHTML = MITZVOT_LIST.map(function(m) {
    return `
      <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <input type="checkbox" ${m.done ? "checked" : ""} onchange="toggleMitzvah('${m.id}')" class="w-4 h-4 accent-amber-500 rounded">
          <span class="text-white font-bold">${m.title}</span>
        </div>
        <span class="text-[10px] text-amber-400 font-mono">${m.time || "יומי"}</span>
      </div>
    `;
  }).join("");
};

window.toggleMitzvah = function(id) {
  var item = MITZVOT_LIST.find(function(i) { return i.id === id; });
  if (item) item.done = !item.done;
  window.setStorageJson(STORAGE_KEYS.CUSTOM_MITZVOT, MITZVOT_LIST);
  window.renderCheshbon();
  window.toast("חשבון הנפש היומי עודכן!");
};

window.openAddMitzvahModal = function() {
  document.getElementById("modal-add-mitzvah").classList.remove("hidden");
};

window.saveNewMitzvah = function() {
  var val = document.getElementById("new-mitzvah-title").value.trim();
  if (!val) return;
  MITZVOT_LIST.push({ id: "m_" + Date.now(), title: val, done: false, time: "אישי" });
  window.setStorageJson(STORAGE_KEYS.CUSTOM_MITZVOT, MITZVOT_LIST);
  window.renderCheshbon();
  window.closeModal("modal-add-mitzvah");
  window.toast("יעד מצווה אישי נוסף!");
};

window.renderRabbis = function(list) {
  var c = document.getElementById("rabbis-container");
  if (!c) return;
  c.innerHTML = list
    .map(function(r) {
      return `
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
        <span class="text-amber-400 font-bold">${r.role}</span>
        <h4 class="font-black text-white text-sm">${r.name}</h4>
        <p class="text-slate-400">${r.city} • ${r.desc}</p>
        <a href="${window.buildTelUrl(r.phone)}" class="block mt-2 py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-center">📞 חייג לבית ההוראה: ${r.phone}</a>
      </div>
    `;
    })
    .join("");
};

window.renderCustoms = function(list) {
  var c = document.getElementById("customs-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(function(item) {
      return `
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1.5">
        <h3 class="text-sm font-black text-amber-400">${item.name}</h3>
        <p class="text-xs text-slate-300">${item.desc}</p>
      </div>
    `;
    })
    .join("");
};

window.renderServices = function(list) {
  var c = document.getElementById("services-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(function(s) {
      return `
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center space-y-2 flex flex-col justify-between">
        <div>
          <span class="text-2xl">${s.icon}</span>
          <h4 class="text-xs font-black text-white mt-1">${s.title}</h4>
          <p class="text-[11px] text-slate-400 mt-0.5">${s.desc}</p>
        </div>
        <button onclick="toast('בקשת הזמנת שירות נשלחה!')" class="w-full py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs">הזמן עכשיו</button>
      </div>
    `;
    })
    .join("");
};

window.openAiStudioModal = function() {
  var sel = document.getElementById("ai-studio-voice");
  if (sel) {
    sel.innerHTML = window.VOICES_DATA.map(function(v) { return `<option value="${v.id}">${v.name} - ${v.desc}</option>`; }).join("");
  }
  document.getElementById("modal-ai-studio").classList.remove("hidden");
};

window.generateUserAiMovie = function() {
  window.closeModal("modal-ai-studio");
  window.toast("🎬 הסרטון שלך מופק כעת ב-AI עם כיסוי ראש מלא ויישלח לאישור!");
};

window.openDonateModal = function() {
  document.getElementById("modal-donate").classList.remove("hidden");
};

window.confirmDonateWithTicker = function() {
  var ded = document.getElementById("donate-dedication-input").value.trim() || "לזכות כלל ישראל";
  var ticker = document.getElementById("ticker-text");
  if (ticker) {
    ticker.textContent = "✨ תרומה חדשה התקבלה כעת: " + ded + " • " + ticker.textContent;
  }
  window.closeModal("modal-donate");
  window.toast("תודה! הקדשתך נוספה לרצועת התורמים החיה ולספר הפרנסים ❤️");
};

window.openSubscriptionModal = function() {
  document.getElementById("modal-sub").classList.remove("hidden");
};

window.openAdminModal = function() {
  document.getElementById("modal-admin").classList.remove("hidden");
};

window.toggleShabbatOverlay = function(show) {
  var el = document.getElementById("shabbat-overlay");
  if (show) el.classList.remove("hidden");
  else el.classList.add("hidden");
};

window.adjustGlobalFontSize = function() {
  var cur = document.body.style.fontSize;
  document.body.style.fontSize = cur === "19px" ? "16px" : "19px";
  window.toast("גודל הגופן הותאם");
};

window.addEventListener("DOMContentLoaded", function() {
  window.updateTodayDate();
  window.renderHomeDashboard();
  window.renderFeedCards(window.REEL_FEED);
  window.selectChumash("bereishit");
  window.renderNachBooks();
  window.renderGenerationsHistory();
  window.renderSeries(window.SERIES_LIBRARY);
  window.renderJudaica(window.JUDAICA_PRODUCTS);
  window.setNusach(currentNusach);
  window.renderTzaddikim(window.TZADDIKIM_DATA);
  window.renderMikvaot(window.MIKVAOT_DATA);
  window.renderRestaurants(window.RESTAURANTS_DATA);
  window.renderGemachim(window.GEMACHIM_DATA);
  window.renderChabad(window.CHABAD_DATA);
  window.renderMinyanim(window.MINYANIM_DATA);
  window.renderRaffles(window.RAFFLES_DATA);
  window.renderCampaigns(window.CAMPAIGNS_DATA);
  window.renderDonorsBook(window.DONORS_DATA);
  window.renderFullDonorsPage();
  window.renderMusicTracks('all');
  window.renderMyZoneAll();
  window.refreshAllCommunityViews();
  window.updateAuthHeaderBadge();
  window.renderHalachaQABank('');
  window.renderZmanim();
  window.renderCheshbon();
  window.renderRabbis(window.RABBIS_DATA);
  window.renderCustoms(window.CUSTOMS_DATA);
  window.renderServices(window.SERVICES_DATA);
  window.updateCartBadge();

  if (!localStorage.getItem(STORAGE_KEYS.INTRO_SEEN)) {
    setTimeout(function() {
      window.openIntroModal();
    }, 600);
  }
});


// ============================================================================
// V20 ADDITIONS: שפות, נגן מוזיקה, ספר הפרנסים, והאזור האישי שלי (שמורים, היסטוריה, יארצייטים, הגדרות)
// ============================================================================
var currentLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) || "he";
var currentCity = localStorage.getItem(STORAGE_KEYS.CITY_LOC) || "בני ברק";
var activeMusicGenre = "all";
var currentPlayingTrackId = "m1";
var isMusicPlaying = false;

window.setAppLanguage = function(langCode) {
  currentLang = langCode;
  localStorage.setItem(STORAGE_KEYS.LANGUAGE, langCode);
  var labels = { he: "🇮🇱 עברית", en: "🇺🇸 English", fr: "🇫🇷 Français", ru: "🇷🇺 Русский" };
  var headerLangBtn = document.getElementById("header-lang-label");
  if (headerLangBtn) headerLangBtn.textContent = labels[langCode] || "🇮🇱 עברית";
  var selectEl = document.getElementById("myzone-lang-select");
  if (selectEl) selectEl.value = langCode;
  ["he", "en", "fr", "ru"].forEach(function(l) {
    var b = document.getElementById("lang-btn-" + l);
    if (b) {
      b.className = (l === langCode)
        ? "px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
        : "px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs";
    }
  });
  window.toast("שפת הממשק עודכנה ל: " + (labels[langCode] || langCode));
};

window.cycleAppLanguage = function() {
  var order = ["he", "en", "fr", "ru"];
  var idx = (order.indexOf(currentLang) + 1) % order.length;
  window.setAppLanguage(order[idx]);
};

window.setUserCity = function(cityName) {
  currentCity = cityName;
  localStorage.setItem(STORAGE_KEYS.CITY_LOC, cityName);
  var cityBadges = document.querySelectorAll(".user-city-label");
  for (var i = 0; i < cityBadges.length; i++) {
    cityBadges[i].textContent = cityName;
  }
  window.toast("המיקום לזמני היום ומניינים עודכן ל: " + cityName + " 📍");
};

// מוזיקה וניגוני קודש
window.openMusicModal = function() {
  window.renderMusicTracks(activeMusicGenre);
  var el = document.getElementById("modal-music-library");
  if (el) el.classList.remove("hidden");
};

window.playMusicTrack = function(trackId) {
  currentPlayingTrackId = trackId;
  isMusicPlaying = true;
  var tr = (window.MUSIC_TRACKS_DATA || []).find(function(t) { return t.id === trackId; }) || window.MUSIC_TRACKS_DATA[0];
  var titleEl = document.getElementById("home-music-now-playing");
  if (titleEl && tr) titleEl.textContent = "מתנגן כעת: " + tr.title + " (" + tr.artist + ")";
  var btnEl = document.getElementById("home-music-play-btn");
  if (btnEl) btnEl.textContent = "⏸ השהה";
  window.renderMusicTracks(activeMusicGenre);
  if (tr) window.toast("🎵 מנגן: " + tr.title);
};

window.toggleHomeMusicPlay = function() {
  isMusicPlaying = !isMusicPlaying;
  var btnEl = document.getElementById("home-music-play-btn");
  if (btnEl) btnEl.textContent = isMusicPlaying ? "⏸ השהה" : "▶ נגן ניגון";
  var tr = (window.MUSIC_TRACKS_DATA || []).find(function(t) { return t.id === currentPlayingTrackId; }) || window.MUSIC_TRACKS_DATA[0];
  window.toast(isMusicPlaying ? ("🎵 מנגן: " + tr.title) : "⏸ הניגון הושהה");
};

window.renderMusicTracks = function(genreFilter) {
  activeMusicGenre = genreFilter || "all";
  var container = document.getElementById("music-tracks-container");
  if (!container || !window.MUSIC_TRACKS_DATA) return;
  var list = (activeMusicGenre === "all")
    ? window.MUSIC_TRACKS_DATA
    : window.MUSIC_TRACKS_DATA.filter(function(t) { return t.genre.indexOf(activeMusicGenre) !== -1; });

  container.innerHTML = list.map(function(t) {
    var active = (t.id === currentPlayingTrackId && isMusicPlaying);
    return `
    <div class="bg-slate-950 border ${active ? "border-amber-500" : "border-slate-800"} p-3.5 rounded-2xl flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <button onclick="playMusicTrack('${t.id}')" class="w-10 h-10 rounded-xl ${active ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-amber-400"} font-black flex items-center justify-center text-sm shrink-0">
          ${active ? "⏸" : "▶"}
        </button>
        <div>
          <h4 class="text-xs sm:text-sm font-black text-white">${t.title}</h4>
          <p class="text-[11px] text-slate-400">${t.artist} • <span class="text-amber-400">${t.genre}</span> • ${t.duration}</p>
        </div>
      </div>
      <button onclick="saveItemToMyZone('ניגון', '${t.title}', 'feed')" class="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded-xl text-[11px] font-bold shrink-0">
        ⭐ שמור
      </button>
    </div>`;
  }).join("");
};

// ספר הפרנסים ולוח התורמים המלא
window.renderFullDonorsPage = function() {
  var grid = document.getElementById("full-donors-wall-grid");
  if (!grid || !window.DONORS_DATA) return;
  grid.innerHTML = window.DONORS_DATA.map(function(d) {
    return `
    <div class="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/40 p-5 rounded-3xl space-y-2 shadow-xl">
      <div class="flex items-center justify-between">
        <span class="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">👑 ספר הפרנסים</span>
        <span class="text-base font-black text-amber-400">${d.amount || "₪180"}</span>
      </div>
      <h4 class="text-base font-black text-white">${d.name}</h4>
      <p class="text-xs text-amber-200 font-medium">${d.dedication}</p>
      <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>📍 ${d.city || "ישראל"}</span>
        <button onclick="toast('ברכה נשלחה לתורם! 🙌')" class="text-amber-400 font-bold hover:underline">🙌 שלח ברכת יישר כוח</button>
      </div>
    </div>`;
  }).join("");
};

// האזור שלי (My Zone): שמורים, היסטוריה, יארצייטים אישיים, הגדרות
window.switchMyZoneSubTab = function(subTab) {
  ["tracker", "quizresults", "saved", "history", "yahrzeits", "submissions", "settings"].forEach(function(k) {
    var box = document.getElementById("myzone-sub-" + k);
    var btn = document.getElementById("myzone-btn-" + k);
    if (box) {
      if (k === subTab) box.classList.remove("hidden");
      else box.classList.add("hidden");
    }
    if (btn) {
      btn.className = (k === subTab)
        ? "px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shrink-0 shadow"
        : "px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs shrink-0";
    }
  });
};

window.saveItemToMyZone = function(itemType, itemTitle, targetTab) {
  var list = window.getStorageJson(STORAGE_KEYS.SAVED_ITEMS, window.DEFAULT_SAVED_ITEMS || []);
  list.unshift({
    id: "sv_" + Date.now(),
    type: itemType,
    title: itemTitle,
    tab: targetTab || "feed"
  });
  window.setStorageJson(STORAGE_KEYS.SAVED_ITEMS, list);
  window.renderMyZoneAll();
  window.refreshAllCommunityViews();
  window.updateAuthHeaderBadge();
  window.renderHalachaQABank('');
  window.toast("נשמר ב'האזור שלי' -> הדברים השמורים שלי ⭐");
};

window.removeSavedItem = function(itemId) {
  var list = window.getStorageJson(STORAGE_KEYS.SAVED_ITEMS, window.DEFAULT_SAVED_ITEMS || []);
  list = list.filter(function(x) { return x.id !== itemId; });
  window.setStorageJson(STORAGE_KEYS.SAVED_ITEMS, list);
  window.renderMyZoneAll();
  window.refreshAllCommunityViews();
  window.updateAuthHeaderBadge();
  window.renderHalachaQABank('');
  window.toast("הוסר מהשמורים");
};

window.addPersonalYahrzeit = function() {
  var nameEl = document.getElementById("new-yahrzeit-name");
  var relEl = document.getElementById("new-yahrzeit-rel");
  var dateEl = document.getElementById("new-yahrzeit-date");
  if (!nameEl || !nameEl.value.trim()) {
    window.toast("נא להזין את שם הנפטר/ת");
    return;
  }
  var list = window.getStorageJson(STORAGE_KEYS.MY_YAHRZEITS, window.DEFAULT_PERSONAL_YAHRZEITS || []);
  list.unshift({
    id: "py_" + Date.now(),
    name: nameEl.value.trim(),
    relation: (relEl && relEl.value.trim()) ? relEl.value.trim() : "בן/בת משפחה",
    hebDate: (dateEl && dateEl.value.trim()) ? dateEl.value.trim() : "כ״ח במרחשוון",
    notes: "להדליק נר נשמה, לתת צדקה ולומר תהילים לעילוי נשמתו/ה."
  });
  window.setStorageJson(STORAGE_KEYS.MY_YAHRZEITS, list);
  nameEl.value = "";
  if (relEl) relEl.value = "";
  if (dateEl) dateEl.value = "";
  window.renderMyZoneAll();
  window.refreshAllCommunityViews();
  window.updateAuthHeaderBadge();
  window.renderHalachaQABank('');
  window.toast("היארצייט האישי נשמר בלוח שלך 🕯️");
};

window.removePersonalYahrzeit = function(id) {
  var list = window.getStorageJson(STORAGE_KEYS.MY_YAHRZEITS, window.DEFAULT_PERSONAL_YAHRZEITS || []);
  list = list.filter(function(x) { return x.id !== id; });
  window.setStorageJson(STORAGE_KEYS.MY_YAHRZEITS, list);
  window.renderMyZoneAll();
  window.refreshAllCommunityViews();
  window.updateAuthHeaderBadge();
  window.renderHalachaQABank('');
};

window.clearMyHistory = function() {
  window.setStorageJson(STORAGE_KEYS.HISTORY_ITEMS, []);
  window.renderMyZoneAll();
  window.refreshAllCommunityViews();
  window.updateAuthHeaderBadge();
  window.renderHalachaQABank('');
  window.toast("היסטוריית הצפייה והלימוד נוקתה");
};

window.renderMyZoneAll = function() {
  // 1. Saved items
  var savedContainer = document.getElementById("myzone-saved-list");
  var savedList = window.getStorageJson(STORAGE_KEYS.SAVED_ITEMS, window.DEFAULT_SAVED_ITEMS || []);
  if (savedContainer) {
    if (savedList.length === 0) {
      savedContainer.innerHTML = '<div class="text-xs text-slate-400 p-4 bg-slate-950 rounded-2xl border border-slate-800">עדיין לא שמרת פריטים. לחץ על ⭐ ליד פרשיות, תפילות או ניגונים כדי לשמור אותם כאן.</div>';
    } else {
      savedContainer.innerHTML = savedList.map(function(item) {
        return `
        <div class="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-3">
          <div>
            <span class="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">${item.type}</span>
            <h4 class="text-sm font-black text-white mt-1">${item.title}</h4>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button onclick="switchTab('${item.tab || "feed"}')" class="px-3 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">פתח ←</button>
            <button onclick="removeSavedItem('${item.id}')" class="px-2.5 py-1.5 bg-slate-900 text-slate-400 hover:text-red-400 border border-slate-800 rounded-xl text-xs">✕</button>
          </div>
        </div>`;
      }).join("");
    }
  }

  // 2. History items
  var histContainer = document.getElementById("myzone-history-list");
  var histList = window.getStorageJson(STORAGE_KEYS.HISTORY_ITEMS, window.DEFAULT_HISTORY_ITEMS || []);
  if (histContainer) {
    if (histList.length === 0) {
      histContainer.innerHTML = '<div class="text-xs text-slate-400 p-4 bg-slate-950 rounded-2xl border border-slate-800">ההיסטוריה ריקה כעת.</div>';
    } else {
      histContainer.innerHTML = histList.map(function(h) {
        return `
        <div class="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
          <div>
            <h4 class="text-xs sm:text-sm font-black text-white">${h.title}</h4>
            <p class="text-[11px] text-slate-400">${h.time} • <span class="text-amber-400">${h.category}</span></p>
          </div>
          <span class="text-xs text-slate-500">🕒</span>
        </div>`;
      }).join("");
    }
  }

  // 3. Personal Yahrzeits
  var yContainer = document.getElementById("myzone-yahrzeits-list");
  var yList = window.getStorageJson(STORAGE_KEYS.MY_YAHRZEITS, window.DEFAULT_PERSONAL_YAHRZEITS || []);
  if (yContainer) {
    yContainer.innerHTML = yList.map(function(y) {
      return `
      <div class="bg-slate-950 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-black rounded-lg text-[11px]">📅 ${y.hebDate}</span>
            <span class="text-[11px] text-slate-400">${y.relation}</span>
          </div>
          <h4 class="text-sm font-black text-white">🕯️ ${y.name}</h4>
          <p class="text-xs text-slate-300">${y.notes}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button onclick="openEntityFullPage('yahrzeit_' + '${y.id}', 'דף אישיות ביארצייט', '${y.name}', '${y.relation} • ${y.hebDate}', 'לוח יארצייטים אישי', 'יום הזיכרון: ${y.hebDate}', '', '${y.notes}', 'סיפורים • זיכרונות • דברי תורה')" class="px-3 py-2 bg-slate-800 text-amber-300 border border-amber-500/40 font-black rounded-xl text-xs">👤 דף אישיות ותגובות</button>
          <button onclick="openCandleModal('${y.name}')" class="px-3 py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">🕯️ הדלק נר</button>
          <button onclick="removePersonalYahrzeit('${y.id}')" class="px-2.5 py-2 bg-slate-900 text-slate-400 hover:text-red-400 border border-slate-800 rounded-xl text-xs">מחק</button>
        </div>
      </div>`;
    }).join("");
  }
};


// ============================================================================
// V21 COMMUNITY ENGINE: משתמש רשום (Auth), מודרציה, דירוג כוכבים, תגובות ודפי ישות מלאים
// ============================================================================

var currentUserAccount = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, {
  isRegistered: true,
  name: "חבר קהילת צדיק-טוק",
  phone: "052-0000000",
  city: "בני ברק",
  role: "משתמש רשום ומאומת ✔"
});

var activeEntityContext = {
  key: "minyan_m1",
  typeLabel: "מניין תפילה",
  title: "",
  subtitle: "",
  address: "",
  hours: "",
  phone: "",
  story: "",
  criteriaHint: "המקום • האווירה • הדיוק בזמנים"
};

var selectedStarRating = 5;
var activeAddFormType = "minyan";
var minyanPrayerFilter = "all";
var halachaUrgencyMode = "normal";

window.requireRegisteredUser = function(actionCallback) {
  var acc = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount);
  if (!acc || !acc.isRegistered) {
    var modal = document.getElementById("modal-auth-register");
    if (modal) modal.classList.remove("hidden");
    window.toast("🔒 פעולה זו זמינה למשתמשים רשומים בלבד – הירשם בחינם כעת");
    return false;
  }
  if (typeof actionCallback === "function") actionCallback();
  return true;
};

window.openAuthModal = function() {
  var acc = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount);
  var nameInput = document.getElementById("auth-input-name");
  var phoneInput = document.getElementById("auth-input-phone");
  var cityInput = document.getElementById("auth-input-city");
  if (nameInput && acc) nameInput.value = acc.name || "";
  if (phoneInput && acc) phoneInput.value = acc.phone || "";
  if (cityInput && acc) cityInput.value = acc.city || "בני ברק";
  var modal = document.getElementById("modal-auth-register");
  if (modal) modal.classList.remove("hidden");
};

window.saveUserRegistration = function() {
  var nameVal = (document.getElementById("auth-input-name").value || "").trim();
  var phoneVal = (document.getElementById("auth-input-phone").value || "").trim();
  var cityVal = (document.getElementById("auth-input-city").value || "בני ברק").trim();
  if (!nameVal) {
    window.toast("נא להזין שם מלא להרשמה");
    return;
  }
  currentUserAccount = {
    isRegistered: true,
    name: nameVal,
    phone: phoneVal || "050-0000000",
    city: cityVal,
    role: "משתמש רשום ומאומת ✔"
  };
  window.setStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount);
  window.updateAuthHeaderBadge();
  window.closeModal("modal-auth-register");
  window.toast("🎉 ברוך הבא " + nameVal + "! החשבון שלך פעיל וכעת תוכל להוסיף תוכן, לדרג ולהגיב.");
};

window.toggleGuestOrRegistered = function() {
  currentUserAccount.isRegistered = !currentUserAccount.isRegistered;
  window.setStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount);
  window.updateAuthHeaderBadge();
  window.toast(currentUserAccount.isRegistered ? "מחובר כמשתמש רשום ✔" : "עברת למצב אורח (לא רשום)");
};

window.updateAuthHeaderBadge = function() {
  var acc = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount);
  var badge = document.getElementById("user-auth-status-badge");
  if (badge) {
    badge.textContent = (acc && acc.isRegistered) ? ("✔ " + acc.name) : "התחבר / הירשם";
  }
};

window.getEntityReviews = function(entityKey) {
  var allRevs = window.getStorageJson(STORAGE_KEYS.COMMUNITY_REVIEWS, window.INITIAL_COMMUNITY_REVIEWS || {});
  return allRevs[entityKey] || [];
};

window.getEntityStats = function(entityKey, defaultRating) {
  var revs = window.getEntityReviews(entityKey);
  if (!revs || revs.length === 0) {
    return { avg: (defaultRating || 4.9).toFixed(1), count: 1 };
  }
  var sum = 0;
  for (var i = 0; i < revs.length; i++) sum += (Number(revs[i].rating) || 5);
  return { avg: (sum / revs.length).toFixed(1), count: revs.length };
};

// פתיחת דף ישות מלא + תגובות ודירוג כוכבים (מניין, רב/קו, גמ"ח, קבר צדיק, אישיות ביארצייט, מקווה, מסעדה, בית חב"ד)
window.openEntityFullPage = function(entityKey, typeLabel, title, subtitle, address, hours, phone, story, criteriaHint, imageUrl) {
  activeEntityContext = {
    key: entityKey,
    typeLabel: typeLabel || "כרטיס מידע קהילתי",
    title: title || "",
    subtitle: subtitle || "",
    address: address || "",
    hours: hours || "",
    phone: phone || "",
    story: story || "",
    criteriaHint: criteriaHint || "השירות • הזמינות • היחס",
    imageUrl: imageUrl || ""
  };

  document.getElementById("entity-modal-badge").textContent = activeEntityContext.typeLabel;
  document.getElementById("entity-modal-title").textContent = activeEntityContext.title;
  document.getElementById("entity-modal-subtitle").textContent = activeEntityContext.subtitle;

  var imgBox = document.getElementById("entity-modal-image-box");
  var imgEl = document.getElementById("entity-modal-image");
  if (imgBox && imgEl) {
    if (imageUrl) {
      imgEl.src = imageUrl;
      imgBox.classList.remove("hidden");
    } else {
      imgBox.classList.add("hidden");
    }
  }

  var infoHtml = "";
  if (address) infoHtml += '<div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800"><span class="text-slate-400 block text-[10px]">📍 כתובת ומיקום / הגעה:</span><span class="text-white font-bold text-xs">' + address + '</span></div>';
  if (hours) infoHtml += '<div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800"><span class="text-slate-400 block text-[10px]">⏰ שעות פעילות / זמנים:</span><span class="text-amber-300 font-bold text-xs">' + hours + '</span></div>';
  if (phone) infoHtml += '<div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800"><span class="text-slate-400 block text-[10px]">📞 טלפון ישיר:</span><a href="tel:' + phone + '" class="text-cyan-400 font-black text-xs hover:underline">' + phone + ' (חייג כעת)</a></div>';
  document.getElementById("entity-modal-info-grid").innerHTML = infoHtml;

  var storyBox = document.getElementById("entity-modal-story");
  if (storyBox) {
    storyBox.innerHTML = story ? ('<strong class="text-amber-400 block mb-1">📖 פרטים מלאים / סיפור ותולדות:</strong>' + story) : "";
    storyBox.style.display = story ? "block" : "none";
  }

  var critEl = document.getElementById("entity-modal-criteria-label");
  if (critEl) critEl.textContent = "דירוג וחוות דעת על: " + activeEntityContext.criteriaHint;

  window.setReviewStarRating(5);
  window.renderActiveEntityReviews();
  document.getElementById("modal-entity-details").classList.remove("hidden");
};

window.setReviewStarRating = function(stars) {
  selectedStarRating = stars;
  for (var i = 1; i <= 5; i++) {
    var b = document.getElementById("star-select-" + i);
    if (b) {
      b.className = (i <= stars)
        ? "text-2xl text-amber-400 transition-transform scale-110"
        : "text-2xl text-slate-600";
    }
  }
};

window.renderActiveEntityReviews = function() {
  var listEl = document.getElementById("entity-reviews-list");
  if (!listEl) return;
  var revs = window.getEntityReviews(activeEntityContext.key);
  var stats = window.getEntityStats(activeEntityContext.key, 5.0);
  var avgEl = document.getElementById("entity-modal-avg-rating");
  if (avgEl) avgEl.textContent = "★ " + stats.avg + " (" + revs.length + " תגובות ודירוגים)";

  if (revs.length === 0) {
    listEl.innerHTML = '<div class="text-xs text-slate-400 p-3 bg-slate-950 rounded-xl border border-slate-800">היה הראשון לדרג ולשתף חוות דעת או סיפור עבור ' + activeEntityContext.title + '!</div>';
    return;
  }
  listEl.innerHTML = revs.map(function(r) {
    var starsStr = "★★★★★".slice(0, r.rating) + "☆☆☆☆☆".slice(0, 5 - r.rating);
    var statusBadge = (r.status && r.status.indexOf("ממתין") !== -1)
      ? '<span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md text-[10px]">⏳ ממתין למודרציה</span>'
      : '<span class="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 rounded-md text-[10px]">✔ מאושר</span>';
    return `
    <div class="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-1.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs font-black text-white">👤 ${r.user}</span>
          ${statusBadge}
        </div>
        <span class="text-xs font-black text-amber-400">${starsStr}</span>
      </div>
      ${r.criteria ? `<p class="text-[11px] text-cyan-300 font-bold">${r.criteria}</p>` : ""}
      <p class="text-xs text-slate-200 leading-relaxed">${r.text}</p>
      <span class="text-[10px] text-slate-500 block">${r.date || "היום"}</span>
    </div>`;
  }).join("");
};

window.submitEntityReview = function() {
  window.requireRegisteredUser(function() {
    var textEl = document.getElementById("entity-review-input");
    var critInputEl = document.getElementById("entity-review-criteria-input");
    var txt = (textEl ? textEl.value : "").trim();
    if (!txt) {
      window.toast("נא לכתוב תגובה, חוות דעת או סיפור לפני השליחה");
      return;
    }
    var acc = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount);
    var allRevs = window.getStorageJson(STORAGE_KEYS.COMMUNITY_REVIEWS, window.INITIAL_COMMUNITY_REVIEWS || {});
    if (!allRevs[activeEntityContext.key]) allRevs[activeEntityContext.key] = [];

    var newRev = {
      user: acc.name + " (" + acc.city + ")",
      rating: selectedStarRating,
      criteria: (critInputEl && critInputEl.value.trim()) ? critInputEl.value.trim() : activeEntityContext.criteriaHint,
      text: txt,
      date: "עכשיו",
      status: "⏳ ממתין לאישור מודרציה"
    };
    allRevs[activeEntityContext.key].unshift(newRev);
    window.setStorageJson(STORAGE_KEYS.COMMUNITY_REVIEWS, allRevs);

    // שמירה גם תחת "התכנים שהוספתי" באזור האישי
    var mySubs = window.getStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, window.DEFAULT_MY_SUBMISSIONS || []);
    mySubs.unshift({
      id: "sub_rev_" + Date.now(),
      type: "תגובה ודירוג (" + activeEntityContext.typeLabel + ")",
      title: activeEntityContext.title + " • " + selectedStarRating + " כוכבים ★",
      details: txt,
      date: "עכשיו",
      status: "⏳ ממתין לאישור מודרציה"
    });
    window.setStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, mySubs);

    if (textEl) textEl.value = "";
    if (critInputEl) critInputEl.value = "";
    window.renderActiveEntityReviews();
    window.renderMyZoneAll();
  window.refreshAllCommunityViews();
  window.updateAuthHeaderBadge();
  window.renderHalachaQABank('');
    window.refreshAllCommunityViews();
    window.toast("✅ התגובה והדירוג נשלחו למודרציה ונשמרו ב'התכנים שהוספתי' באזור האישי!");
  });
};

// ============================================================================
// פתיחת טופס הוספת תוכן קהילתי (רק למשתמש רשום • עובר מודרציה לפני שעולה)
// תומך ב: minyan | minyan_call | rabbi | gemach | tzaddik | yahrzeit | mikvah | restaurant | chabad
// ============================================================================
window.openCommunityAddModal = function(formType) {
  window.requireRegisteredUser(function() {
    activeAddFormType = formType;
    var titles = {
      minyan: "🕍 הוספת מניין חדש (שחרית / מנחה / ערבית)",
      minyan_call: "📢 שליחת הודעת קריאת מניין בזמן אמת (חסר עשירי!)",
      rabbi: "📞 הוספת רב פוסק / קו הלכה ובית הוראה",
      gemach: "🤝 הוספת גמ״ח חדש / ארגון סיוע וחסד",
      tzaddik: "🕯️ הוספת קבר צדיק חדש למדריך",
      yahrzeit: "📅 הוספת יארצייט אישי / דף אישיות ביומן היארצייטים",
      mikvah: "💧 הוספת מקווה טהרה חדש",
      restaurant: "🍽️ הוספת מסעדה כשרה חדשה",
      chabad: "🏛️ הוספת בית חב״ד בעולם"
    };
    var placeholders = {
      minyan: { f1: "שם בית הכנסת / המניין", f2: "סוג תפילה ושעה (למשל: מנחה 13:45 / ערבית 20:00)", f3: "עיר וכתובת מדויקת", f4: "נוסח תפילה והערות (נגישות, שיעור, קפה)" },
      minyan_call: { f1: "כותרת הקריאה (למשל: חסרים 2 לעשירי במנחה!)", f2: "שעה מדויקת (למשל: עכשיו / בעוד 5 דקות)", f3: "מיקום מדויק וכתובת", f4: "טלפון איש קשר במקום" },
      rabbi: { f1: "שם הרב הפוסק / שם קו ההלכה", f2: "תחום התמחות ונוסח (אורח חיים, שבת, כשרות, טהרה)", f3: "מספר טלפון לחיוג ישיר / וואטסאפ", f4: "שעות מענה ופרטים נוספים" },
      gemach: { f1: "שם הגמ״ח / הארגון", f2: "קטגוריה (עזר מציון / יד שרה / ידידים / איחוד הצלה / גמ״חי שמחות / עריסות לתינוקות)", f3: "עיר, כתובת ושעות פעילות", f4: "טלפון ופירוט הציוד להשאלה" },
      tzaddik: { f1: "שם הצדיק זיע״א", f2: "עיר / אזור בארץ ובעולם", f3: "הוראות הגעה מדויקות וקישור לקבוצת וואטסאפ", f4: "תולדות הצדיק, סיפור מופת וסגולת הציון" },
      yahrzeit: { f1: "שם האישיות / הנפטר/ת (למשל: רבי אברהם בן שרה ז״ל)", f2: "תאריך הפטירה העברי (למשל: י״ד בכסלו)", f3: "מקום מנוחה / קרבה משפחתית", f4: "תקציר היסטוריה, סיפור חיים ודברי תורה לעילוי נשמתו/ה" },
      mikvah: { f1: "שם המקווה", f2: "סוג (מקווה נשים / גברים / כלים)", f3: "עיר, כתובת ושעות פתיחה", f4: "טלפון והערות על ניקיון ונגישות" },
      restaurant: { f1: "שם המסעדה הכשרה", f2: "סוג (בשרי / חלבי / פרווה) וגוף הכשרות (בד״ץ / מהדרין)", f3: "עיר, כתובת ושעות פתיחה", f4: "טלפון ומומלצי התפריט" },
      chabad: { f1: "שם בית חב״ד (עיר ומדינה)", f2: "שם השליח הראשי", f3: "כתובת מלאה ושירותים (מסעדה כשרה, מניינים, שבת)", f4: "טלפון ווואטסאפ ליצירת קשר" }
    };

    var cfg = placeholders[formType] || placeholders.minyan;
    document.getElementById("comm-add-modal-title").textContent = titles[formType] || "הוספת תוכן קהילתי";
    document.getElementById("comm-add-f1").placeholder = cfg.f1;
    document.getElementById("comm-add-f2").placeholder = cfg.f2;
    document.getElementById("comm-add-f3").placeholder = cfg.f3;
    document.getElementById("comm-add-f4").placeholder = cfg.f4;
    document.getElementById("comm-add-f1").value = "";
    document.getElementById("comm-add-f2").value = "";
    document.getElementById("comm-add-f3").value = "";
    document.getElementById("comm-add-f4").value = "";

    document.getElementById("modal-community-add").classList.remove("hidden");
  });
};

window.submitCommunityAddForm = function() {
  window.requireRegisteredUser(function() {
    var f1 = (document.getElementById("comm-add-f1").value || "").trim();
    var f2 = (document.getElementById("comm-add-f2").value || "").trim();
    var f3 = (document.getElementById("comm-add-f3").value || "").trim();
    var f4 = (document.getElementById("comm-add-f4").value || "").trim();

    if (!f1 || !f2) {
      window.toast("נא למלא לפחות את שני השדות הראשונים");
      return;
    }

    var acc = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount);
    var typeNames = {
      minyan: "מניין חדש",
      minyan_call: "הודעת קריאת מניין",
      rabbi: "רב / קו הלכה",
      gemach: "גמ״ח חדש",
      tzaddik: "קבר צדיק",
      yahrzeit: "יארצייט אישי / צדיק",
      mikvah: "מקווה טהרה",
      restaurant: "מסעדה כשרה",
      chabad: "בית חב״ד"
    };

    // שמירה ברשימת "התכנים שהוספתי" באזור האישי עם חותמת מודרציה
    var mySubs = window.getStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, window.DEFAULT_MY_SUBMISSIONS || []);
    mySubs.unshift({
      id: "sub_" + Date.now(),
      type: typeNames[activeAddFormType] || "תוכן קהילתי",
      title: f1,
      details: f2 + (f3 ? (" • " + f3) : "") + (f4 ? (" • " + f4) : ""),
      date: "עכשיו (ע״י " + acc.name + ")",
      status: "⏳ ממתין לאישור מודרציה"
    });
    window.setStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, mySubs);

    // הוספה גם לתצוגה החיה (עם תגית 'נוסף ע״י הקהילה • בבדיקת מודרציה') כדי שהמשתמש יראה את הפריט שלו מיד!
    if (activeAddFormType === "minyan_call") {
      var calls = window.getStorageJson(STORAGE_KEYS.MINYAN_CALLS, window.INITIAL_MINYAN_CALLS || []);
      calls.unshift({
        id: "mc_" + Date.now(),
        title: "📢 " + f1,
        location: f3 || acc.city,
        time: f2,
        user: acc.name + " (משתמש רשום ✔)",
        phone: f4 || acc.phone,
        status: "⏳ בבדיקת מודרציה"
      });
      window.setStorageJson(STORAGE_KEYS.MINYAN_CALLS, calls);
    } else if (activeAddFormType === "minyan") {
      window.MINYANIM_DATA.unshift({
        id: "m_usr_" + Date.now(),
        name: f1 + " (⏳ במודרציה)",
        nusach: f4 || "כלל ישראל",
        city: f3 || acc.city,
        shacharit: f2.indexOf("שחרית") !== -1 ? f2 : "07:00, 08:00",
        mincha: f2.indexOf("מנחה") !== -1 ? f2 : f2,
        arvit: f2.indexOf("ערבית") !== -1 ? f2 : "20:00, 21:00",
        distanceKm: 0.2,
        lat: 32.08,
        lng: 34.83
      });
    } else if (activeAddFormType === "rabbi") {
      window.RABBIS_DATA.unshift({
        id: "rab_usr_" + Date.now(),
        name: f1 + " (⏳ במודרציה)",
        title: f2,
        phone: f3 || "073-3570000",
        hours: f4 || "זמין למענה הלכתי",
        city: acc.city,
        available: true
      });
    } else if (activeAddFormType === "gemach") {
      window.GEMACHIM_DATA.unshift({
        id: "gm_usr_" + Date.now(),
        name: f1 + " (⏳ במודרציה)",
        category: f2 || "גמ״חי שמחות",
        city: f3 || acc.city,
        address: f3 || acc.city,
        hours: "בתיאום טלפוני",
        phone: f4 || acc.phone,
        description: f4 || "גמ״ח קהילתי שנוסף על ידי משתמש רשום.",
        rating: 5.0
      });
    } else if (activeAddFormType === "tzaddik") {
      window.TZADDIKIM_DATA.unshift({
        id: "tz_usr_" + Date.now(),
        name: f1 + " (⏳ במודרציה)",
        title: "ציון קדוש שנוסף ע״י הקהילה",
        region: "north",
        city: f2 || "ישראל",
        segula: f4 || "תפילה וישועה",
        story: f4 || f3,
        whatsappGroup: "https://wa.me/",
        lat: 32.9,
        lng: 35.4
      });
    } else if (activeAddFormType === "yahrzeit") {
      window.YAHRZEITS_CALENDAR.unshift({
        id: "yh_usr_" + Date.now(),
        date: f2,
        name: f1 + " (⏳ במודרציה)",
        title: f3 || "לעילוי נשמתו/ה",
        location: f3 || "ישראל",
        segula: f4 || "לימוד משניות והדלקת נר לעילוי נשמה",
        biography: f4 || "נוסף על ידי חבר קהילה רשום.",
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80"
      });
      var pyList = window.getStorageJson(STORAGE_KEYS.MY_YAHRZEITS, window.DEFAULT_PERSONAL_YAHRZEITS || []);
      pyList.unshift({
        id: "py_" + Date.now(),
        name: f1,
        relation: f3 || "לוח יארצייטים",
        hebDate: f2,
        notes: f4 || "הדלקת נר ולימוד משניות."
      });
      window.setStorageJson(STORAGE_KEYS.MY_YAHRZEITS, pyList);
    }

    window.closeModal("modal-community-add");
    window.refreshAllCommunityViews();
    window.renderMyZoneAll();
  window.refreshAllCommunityViews();
  window.updateAuthHeaderBadge();
  window.renderHalachaQABank('');
    window.toast("✅ נשלח למודרציה! התוכן מופיע כעת תחת 'התכנים שהוספתי' באזור האישי שלך.");
  });
};

window.approveSubmissionInMyZone = function(subId) {
  var mySubs = window.getStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, window.DEFAULT_MY_SUBMISSIONS || []);
  for (var i = 0; i < mySubs.length; i++) {
    if (mySubs[i].id === subId) {
      mySubs[i].status = "מאושר בקהילה ✔";
    }
  }
  window.setStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, mySubs);
  window.renderMyZoneAll();
  window.refreshAllCommunityViews();
  window.updateAuthHeaderBadge();
  window.renderHalachaQABank('');
  window.toast("✔ הפריט אושר במערכת המודרציה ופורסם לקהילה!");
};

// ============================================================================
// רינדור משודרג לכל המודולים עם כפתורי דף מלא, דירוג כוכבים ותגובות קהילה
// ============================================================================

// 1. מניינים + קריאות מניין + סינון שחרית/מנחה/ערבית + תגובות ודירוג
window.renderMinyanCallsBanner = function() {
  var box = document.getElementById("minyan-live-calls-container");
  if (!box) return;
  var calls = window.getStorageJson(STORAGE_KEYS.MINYAN_CALLS, window.INITIAL_MINYAN_CALLS || []);
  box.innerHTML = calls.map(function(c) {
    return `
    <div class="bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-950 border border-red-500/40 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div class="space-y-0.5">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 bg-red-600 text-white font-black rounded-md text-[10px] animate-pulse">קריאת מניין חיה</span>
          <span class="text-[11px] text-amber-300 font-bold">⏰ ${c.time}</span>
          <span class="text-[10px] text-slate-400">${c.user}</span>
        </div>
        <h4 class="text-sm font-black text-white">${c.title}</h4>
        <p class="text-xs text-slate-300">📍 ${c.location}</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <a href="tel:${c.phone}" class="px-3 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">📞 אני מגיע (${c.phone})</a>
      </div>
    </div>`;
  }).join("");
};

window.filterMinyanimByPrayer = function(prayerType) {
  minyanPrayerFilter = prayerType;
  ["all", "shacharit", "mincha", "arvit"].forEach(function(k) {
    var b = document.getElementById("minyan-filter-" + k);
    if (b) {
      b.className = (k === prayerType)
        ? "px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shrink-0"
        : "px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs shrink-0";
    }
  });
  window.renderMinyanim(window.MINYANIM_DATA);
};

window.renderMinyanim = function(list) {
  window.renderMinyanCallsBanner();
  var grid = document.getElementById("minyanim-container");
  if (!grid) return;
  grid.innerHTML = (list || []).map(function(m) {
    var eKey = "minyan_" + m.id;
    var stats = window.getEntityStats(eKey, 4.9);
    var safeName = (m.name || "").replace(/'/g, "");
    var safeCity = (m.city || "").replace(/'/g, "");
    var hoursSummary = "שחרית: " + m.shacharit + " | מנחה: " + m.mincha + " | ערבית: " + m.arvit;
    return `
    <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition-all">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">נוסח ${m.nusach}</span>
          <button onclick="openEntityFullPage('${eKey}', 'מניין תפילה ובית כנסת', '${safeName}', 'נוסח ${m.nusach} • ${safeCity}', '${safeCity}', '${hoursSummary}', '', 'בית כנסת פעיל עם מניינים קבועים לשחרית, מנחה וערבית.', 'המקום • האווירה • הדיוק בזמנים')" class="text-xs font-black text-amber-400 hover:underline flex items-center gap-1">
            <span>★ ${stats.avg}</span> <span class="text-slate-400">(${stats.count} תגובות)</span>
          </button>
        </div>
        <h3 class="text-lg font-black text-white">${m.name}</h3>
        <p class="text-xs text-slate-400">📍 ${m.city} • ${m.distanceKm || "0.4"} ק״מ ממך</p>
        <div class="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
          <div class="bg-slate-950 p-2 rounded-xl border ${minyanPrayerFilter==='shacharit'?'border-amber-500':'border-slate-800'}"><span class="text-slate-400 block text-[10px]">☀️ שחרית</span><span class="font-bold text-white">${m.shacharit}</span></div>
          <div class="bg-slate-950 p-2 rounded-xl border ${minyanPrayerFilter==='mincha'?'border-amber-500':'border-slate-800'}"><span class="text-slate-400 block text-[10px]">🌤️ מנחה</span><span class="font-bold text-amber-300">${m.mincha}</span></div>
          <div class="bg-slate-950 p-2 rounded-xl border ${minyanPrayerFilter==='arvit'?'border-amber-500':'border-slate-800'}"><span class="text-slate-400 block text-[10px]">🌙 ערבית</span><span class="font-bold text-cyan-300">${m.arvit}</span></div>
        </div>
      </div>
      <div class="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
        <button onclick="openEntityFullPage('${eKey}', 'מניין תפילה ובית כנסת', '${safeName}', 'נוסח ${m.nusach} • ${safeCity}', '${safeCity}', '${hoursSummary}', '', 'מניין קבוע ומדויק. דרגו את המקום, האווירה והדיוק בזמנים!', 'המקום • האווירה • הדיוק בזמנים')" class="py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-black rounded-xl text-xs">
          ⭐ תגובות ודירוג (${stats.count})
        </button>
        <a href="${window.buildWazeUrl(m.lat || 32.08, m.lng || 34.83)}" target="_blank" class="py-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold rounded-xl text-xs text-center">
          🚗 ניווט Waze
        </a>
      </div>
    </div>`;
  }).join("");
};

// 2. קו הלכה ישיר ובתי הוראה ארציים (שאלה דחופה | שאלה רגילה | חיפוש תשובות | הוספת רב/קו | תגובות ודירוג)
window.switchHalachaMode = function(mode) {
  halachaUrgencyMode = mode;
  ["urgent", "normal", "search"].forEach(function(m) {
    var btn = document.getElementById("halacha-mode-btn-" + m);
    var box = document.getElementById("halacha-mode-box-" + m);
    if (btn) {
      btn.className = (m === mode)
        ? "px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shrink-0 shadow"
        : "px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs shrink-0";
    }
    if (box) {
      if (m === mode) box.classList.remove("hidden");
      else box.classList.add("hidden");
    }
  });
  if (mode === "search") window.renderHalachaQABank("");
};

window.renderHalachaQABank = function(query) {
  var container = document.getElementById("halacha-qa-results");
  if (!container || !window.HALACHA_QA_DATA) return;
  var q = (query || "").trim().toLowerCase();
  var list = window.HALACHA_QA_DATA.filter(function(item) {
    return !q || item.question.toLowerCase().indexOf(q) !== -1 || item.answer.toLowerCase().indexOf(q) !== -1 || item.category.toLowerCase().indexOf(q) !== -1;
  });
  container.innerHTML = list.map(function(item) {
    return `
    <div class="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1.5">
      <div class="flex items-center justify-between">
        <span class="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 rounded-lg text-[10px] font-black">${item.category}</span>
        <span class="text-[11px] text-slate-400">פסק: ${item.rabbi}</span>
      </div>
      <h4 class="text-sm font-black text-white">❓ ${item.question}</h4>
      <p class="text-xs text-slate-300 leading-relaxed">✅ ${item.answer}</p>
    </div>`;
  }).join("");
};

window.renderRabbis = function(list) {
  var grid = document.getElementById("rabbis-container");
  if (!grid) return;
  grid.innerHTML = (list || []).map(function(r, idx) {
    var rid = r.id || ("rab" + (idx + 1));
    var eKey = "rabbi_" + rid;
    var stats = window.getEntityStats(eKey, 5.0);
    var safeName = (r.name || "").replace(/'/g, "");
    var safeTitle = (r.title || r.specialty || "פוסק הלכה").replace(/'/g, "");
    var phone = r.phone || "073-3570000";
    var hours = r.hours || "מענה הלכתי לאורך היום";
    return `
    <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition-all">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🟢 זמין למענה הלכתי</span>
          <button onclick="openEntityFullPage('${eKey}', 'קו הלכה ורב פוסק', '${safeName}', '${safeTitle}', '${r.city || "מענה ארצי"}', '${hours}', '${phone}', 'מענה הלכתי לשאלות דחופות ורגילות. דרגו את הזמינות, היחס והמענה!', 'הזמינות • היחס • בהירות המענה')" class="text-xs font-black text-amber-400 hover:underline">
            ★ ${stats.avg} (${stats.count} דירוגים)
          </button>
        </div>
        <h3 class="text-lg font-black text-white">${r.name}</h3>
        <p class="text-xs text-amber-300 font-bold">${safeTitle}</p>
        <p class="text-xs text-slate-400">⏰ ${hours} • 📞 ${phone}</p>
      </div>
      <div class="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2">
        <a href="tel:${phone}" class="py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs text-center">📞 חייג</a>
        <a href="https://wa.me/972${phone.replace(/[^0-9]/g, '').replace(/^0/, '')}?text=${encodeURIComponent('שלום כבוד הרב, שאלה בהלכה מאפליקציית צדיק-טוק:')}" target="_blank" class="py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold rounded-xl text-xs text-center">💬 שאלה</a>
        <button onclick="openEntityFullPage('${eKey}', 'קו הלכה ורב פוסק', '${safeName}', '${safeTitle}', '${r.city || "מענה ארצי"}', '${hours}', '${phone}', 'בית הוראה וקו הלכה ישיר. שתפו חוות דעת על הזמינות, היחס והמענה.', 'הזמינות • היחס • המענה')" class="py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold rounded-xl text-xs">
          ⭐ דרג (${stats.count})
        </button>
      </div>
    </div>`;
  }).join("");
};

// 3. אינדקס גמ"חים, רפואה וארגוני הצלה (סינון לפי תתי-הסעיפים + דף גמ"ח מלא + תגובות ודירוג)
window.filterGemachimByCategory = function(catQuery) {
  if (!catQuery || catQuery === "all") {
    window.renderGemachim(window.GEMACHIM_DATA);
    return;
  }
  var filtered = (window.GEMACHIM_DATA || []).filter(function(g) {
    return (g.name && g.name.indexOf(catQuery) !== -1) || (g.category && g.category.indexOf(catQuery) !== -1) || (g.description && g.description.indexOf(catQuery) !== -1);
  });
  window.renderGemachim(filtered);
};

window.renderGemachim = function(list) {
  var grid = document.getElementById("gemachim-grid-container");
  if (!grid) return;
  grid.innerHTML = (list || []).map(function(g, idx) {
    var gid = g.id || ("gm" + (idx + 1));
    var eKey = "gemach_" + gid;
    var stats = window.getEntityStats(eKey, g.rating || 4.9);
    var safeName = (g.name || "").replace(/'/g, "");
    var safeCat = (g.category || "גמ״ח וחסד").replace(/'/g, "");
    var safeAddr = (g.address || g.city || "פריסה ארצית").replace(/'/g, "");
    var safeHours = (g.hours || "א׳-ה׳ 09:00-21:00").replace(/'/g, "");
    var safeDesc = (g.description || "").replace(/'/g, "");
    return `
    <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition-all">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-black">${g.category}</span>
          <button onclick="openEntityFullPage('${eKey}', 'דף גמ״ח וארגון חסד', '${safeName}', '${safeCat}', '${safeAddr}', '${safeHours}', '${g.phone}', '${safeDesc}', 'השירות • הזמינות • היחס')" class="text-xs font-black text-amber-400 hover:underline">
            ★ ${stats.avg} (${stats.count} חוות דעת)
          </button>
        </div>
        <h3 class="text-lg font-black text-white">${g.name}</h3>
        <p class="text-xs text-slate-300 leading-relaxed">${g.description}</p>
        <div class="text-[11px] text-slate-400 space-y-0.5 pt-1">
          <div>📍 <strong>כתובת:</strong> ${safeAddr}</div>
          <div>⏰ <strong>שעות:</strong> ${safeHours}</div>
          <div>📞 <strong>טלפון:</strong> ${g.phone}</div>
        </div>
      </div>
      <div class="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2">
        <button onclick="openEntityFullPage('${eKey}', 'דף גמ״ח וארגון חסד', '${safeName}', '${safeCat}', '${safeAddr}', '${safeHours}', '${g.phone}', '${safeDesc}', 'השירות • הזמינות • היחס')" class="py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
          📄 דף גמ״ח ודירוג
        </button>
        <a href="tel:${g.phone}" class="py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black rounded-xl text-xs text-center">
          📞 חייג
        </a>
        <a href="${window.buildWazeUrl(g.lat || 32.08, g.lng || 34.83)}" target="_blank" class="py-2 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold rounded-xl text-xs text-center">
          🚗 Waze
        </a>
      </div>
    </div>`;
  }).join("");
};

// 4. מדריך 22 קברי צדיקים + דף קבר מלא + תגובות וסיפורים על הצדיק + יומן יארצייטים משולב
window.renderTzaddikim = function(list) {
  var grid = document.getElementById("tzaddikim-grid-container");
  if (!grid) return;
  grid.innerHTML = (list || []).map(function(t, idx) {
    var tid = t.id || ("tz" + (idx + 1));
    var eKey = "tzaddik_" + tid;
    var stats = window.getEntityStats(eKey, 5.0);
    var safeName = (t.name || "").replace(/'/g, "");
    var safeTitle = (t.title || "").replace(/'/g, "");
    var safeCity = (t.city || "").replace(/'/g, "");
    var safeStory = ((t.story || "") + " • סגולה מיוחדת: " + (t.segula || "")).replace(/'/g, "");
    var imgUrl = t.image || "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80";
    return `
    <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between hover:border-amber-500/50 transition-all">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 rounded-full text-[11px] font-bold">📍 ${t.city}</span>
          <button onclick="openEntityFullPage('${eKey}', 'דף קבר צדיק וסיפורי ישועות', '${safeName}', '${safeTitle}', 'ציון הקודש ב${safeCity} (ניווט Waze ישיר)', 'פתוח 24/7 לתפילה והדלקת נרות', '', '${safeStory}', 'סיפורים • חוויות מהציון • בקשות תפילה', '${imgUrl}')" class="text-xs font-black text-amber-400 hover:underline">
            ★ ${stats.avg} (${stats.count} סיפורים)
          </button>
        </div>
        <h3 class="text-lg font-black text-white">${t.name}</h3>
        <p class="text-xs text-amber-200/90 font-medium">${t.title || ""}</p>
        <p class="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">✨ <strong>סגולה:</strong> ${t.segula}</p>
      </div>
      <div class="pt-2 space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <button onclick="openEntityFullPage('${eKey}', 'דף קבר צדיק וסיפורי ישועות', '${safeName}', '${safeTitle}', 'ציון הקודש ב${safeCity}', 'פתוח 24/7', '', '${safeStory}', 'סיפורים • חוויות מהציון • בקשות תפילה', '${imgUrl}')" class="py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
            📄 דף קבר וסיפורים
          </button>
          <button onclick="openCandleModal('${safeName}')" class="py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black rounded-xl text-xs">
            🕯️ הדלק נר
          </button>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <a href="${window.buildWazeUrl(t.lat || 32.9, t.lng || 35.4)}" target="_blank" class="py-1.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold rounded-xl text-[11px] text-center">🚗 הוראות הגעה</a>
          <a href="${t.whatsappGroup || 'https://wa.me/'}" target="_blank" class="py-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-[11px] text-center">💬 קבוצת וואטסאפ</a>
        </div>
      </div>
    </div>`;
  }).join("");

  // רינדור יומן היארצייטים המשולב גם בתוך עמוד קברי צדיקים וגם בעמוד זמני היום
  window.renderYahrzeitSharedCards("tzaddikim-yahrzeits-container");
  window.renderYahrzeitSharedCards("zmanim-yahrzeits-container");
};

window.renderYahrzeitSharedCards = function(containerId) {
  var box = document.getElementById(containerId);
  if (!box || !window.YAHRZEITS_CALENDAR) return;
  box.innerHTML = window.YAHRZEITS_CALENDAR.map(function(y, idx) {
    var yid = y.id || ("yh_" + (idx + 1));
    var eKey = "yahrzeit_" + yid;
    var stats = window.getEntityStats(eKey, 5.0);
    var safeName = (y.name || "").replace(/'/g, "");
    var safeTitle = (y.title || "").replace(/'/g, "");
    var safeLoc = (y.location || "").replace(/'/g, "");
    var safeBio = (y.biography || y.segula || "").replace(/'/g, "");
    var imgUrl = y.image || "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80";
    return `
    <div class="bg-slate-950 border border-amber-500/30 p-4 rounded-2xl flex flex-col justify-between space-y-3 hover:border-amber-400 transition-all">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded-lg text-[10px]">📅 ${y.date}</span>
          <button onclick="openEntityFullPage('${eKey}', 'דף אישיות ביארצייט והילולא', '${safeName}', '${safeTitle} • ${y.date}', 'מקום מנוחה: ${safeLoc}', 'יום הילולא: ${y.date}', '', '${safeBio}', 'סיפורים • זיכרונות • דברי תורה לעילוי נשמתו', '${imgUrl}')" class="text-[11px] font-black text-amber-400 hover:underline">
            ★ ${stats.avg} (${stats.count} תגובות)
          </button>
        </div>
        <h4 class="text-sm font-black text-white">${y.name}</h4>
        <p class="text-[11px] text-amber-300 font-bold">${y.title} • 📍 ${y.location}</p>
        <p class="text-xs text-slate-300 leading-relaxed line-clamp-2">${y.segula}</p>
      </div>
      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
        <button onclick="openEntityFullPage('${eKey}', 'דף אישיות ביארצייט והילולא', '${safeName}', '${safeTitle} • ${y.date}', 'מקום מנוחה: ${safeLoc}', 'יום הילולא: ${y.date}', '', '${safeBio}', 'סיפורים • זיכרונות • דברי תורה לעילוי נשמתו', '${imgUrl}')" class="py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
          👤 דף אישיות ותגובות
        </button>
        <button onclick="openCandleModal('${safeName}')" class="py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-black rounded-xl text-xs">
          🕯️ הדלק נר
        </button>
      </div>
    </div>`;
  }).join("");
};

// רינדור "התכנים שהוספתי" באזור האישי שלי
window.renderMySubmissionsList = function() {
  var subContainer = document.getElementById("myzone-submissions-list");
  if (!subContainer) return;
  var mySubs = window.getStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, window.DEFAULT_MY_SUBMISSIONS || []);
  if (mySubs.length === 0) {
    subContainer.innerHTML = '<div class="text-xs text-slate-400 p-4 bg-slate-950 rounded-2xl border border-slate-800">עדיין לא הוספת תכנים לקהילה.</div>';
    return;
  }
  subContainer.innerHTML = mySubs.map(function(s) {
    var isPending = s.status && s.status.indexOf("ממתין") !== -1;
    return `
    <div class="bg-slate-950 border ${isPending ? 'border-amber-500/50' : 'border-slate-800'} p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 font-black rounded-md text-[10px]">${s.type}</span>
          <span class="px-2.5 py-0.5 ${isPending ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'} font-bold rounded-md text-[10px]">${s.status}</span>
          <span class="text-[10px] text-slate-500">${s.date}</span>
        </div>
        <h4 class="text-sm font-black text-white">${s.title}</h4>
        <p class="text-xs text-slate-300">${s.details}</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        ${isPending ? `<button onclick="approveSubmissionInMyZone('${s.id}')" class="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">✔ אשר מודרציה כעת</button>` : ""}
      </div>
    </div>`;
  }).join("");
};


// 5. שדרוג מקוואות, מסעדות כשרות, בתי חב"ד וחנות יודאיקה עם דף מלא, תגובות ודירוג כוכבים!
window.renderMikvaot = function(list) {
  var grid = document.getElementById("mikvaot-grid-container");
  if (!grid) return;
  grid.innerHTML = (list || []).map(function(m, idx) {
    var mid = m.id || ("mk" + (idx + 1));
    var eKey = "mikvah_" + mid;
    var stats = window.getEntityStats(eKey, m.rating || 4.9);
    var safeName = (m.name || "").replace(/'/g, "");
    var safeCity = (m.city || "").replace(/'/g, "");
    var safeHours = (m.hours || "פתוח מערב שבת וחול").replace(/'/g, "");
    return `
    <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between hover:border-blue-500/40 transition-all">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-[11px] font-black">${m.type || "מקווה טהרה"}</span>
          <button onclick="openEntityFullPage('${eKey}', 'דף מקווה טהרה וביקורות', '${safeName}', '${safeCity}', '${safeCity}', '${safeHours}', '${m.phone || ""}', 'מקווה טהרה מהודר ונקי. דרגו את הניקיון, השירות ושעות הפעילות.', 'ניקיון והידור • שעות פעילות • יחס ושירות')" class="text-xs font-black text-amber-400 hover:underline">
            ★ ${stats.avg} (${stats.count} תגובות)
          </button>
        </div>
        <h3 class="text-lg font-black text-white">${m.name}</h3>
        <p class="text-xs text-slate-300">📍 ${m.city} • ⏰ ${safeHours}</p>
      </div>
      <div class="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2">
        <button onclick="openEntityFullPage('${eKey}', 'דף מקווה טהרה וביקורות', '${safeName}', '${safeCity}', '${safeCity}', '${safeHours}', '${m.phone || ""}', 'מקווה טהרה מהודר ונקי.', 'ניקיון והידור • שעות פעילות • יחס ושירות')" class="py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
          ⭐ דף ודירוג
        </button>
        <a href="tel:${m.phone || "035700000"}" class="py-2 bg-slate-800 text-white font-bold rounded-xl text-xs text-center">📞 חייג</a>
        <a href="${window.buildWazeUrl(m.lat || 32.08, m.lng || 34.83)}" target="_blank" class="py-2 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold rounded-xl text-xs text-center">🚗 Waze</a>
      </div>
    </div>`;
  }).join("");
};

window.renderRestaurants = function(list) {
  var grid = document.getElementById("restaurants-grid-container");
  if (!grid) return;
  grid.innerHTML = (list || []).map(function(r, idx) {
    var rid = r.id || ("rst" + (idx + 1));
    var eKey = "rest_" + rid;
    var stats = window.getEntityStats(eKey, 4.9);
    var safeName = (r.name || "").replace(/'/g, "");
    var safeCity = (r.city || "").replace(/'/g, "");
    var safeHech = (r.hechsher || "מהדרין").replace(/'/g, "");
    return `
    <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-black">${r.type || "כשר"} • ${r.hechsher}</span>
          <button onclick="openEntityFullPage('${eKey}', 'דף מסעדה כשרה וביקורות', '${safeName}', '${r.type || ""} • ${safeHech}', '${safeCity}', 'פתוח א-ה ומוצ״ש', '${r.phone || ""}', 'מסעדה כשרה בפיקוח ${safeHech}. שתפו חוות דעת על האוכל, השירות והכשרות!', 'טעם וטריות • רמת כשרות • שירות ומחיר')" class="text-xs font-black text-amber-400 hover:underline">
            ★ ${stats.avg} (${stats.count} ביקורות)
          </button>
        </div>
        <h3 class="text-lg font-black text-white">${r.name}</h3>
        <p class="text-xs text-slate-300">📍 ${r.city} • 🛡️ ${r.hechsher}</p>
      </div>
      <div class="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2">
        <button onclick="openEntityFullPage('${eKey}', 'דף מסעדה כשרה וביקורות', '${safeName}', '${r.type || ""} • ${safeHech}', '${safeCity}', 'פתוח א-ה ומוצ״ש', '${r.phone || ""}', 'מסעדה כשרה בפיקוח ${safeHech}.', 'טעם וטריות • רמת כשרות • שירות ומחיר')" class="py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
          ⭐ דרג והגב
        </button>
        <a href="tel:${r.phone || "035700000"}" class="py-2 bg-slate-800 text-white font-bold rounded-xl text-xs text-center">📞 הזמן</a>
        <a href="${window.buildWazeUrl(r.lat || 32.08, r.lng || 34.83)}" target="_blank" class="py-2 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold rounded-xl text-xs text-center">🚗 Waze</a>
      </div>
    </div>`;
  }).join("");
};

window.renderChabad = function(list) {
  var grid = document.getElementById("chabad-grid-container");
  if (!grid) return;
  grid.innerHTML = (list || []).map(function(c, idx) {
    var cid = c.id || ("chb" + (idx + 1));
    var eKey = "chabad_" + cid;
    var stats = window.getEntityStats(eKey, 5.0);
    var safeName = (c.name || "").replace(/'/g, "");
    var safeRabbi = (c.rabbi || "").replace(/'/g, "");
    var safeAddr = (c.address || c.country || "").replace(/'/g, "");
    return `
    <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition-all">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 rounded-full text-[11px] font-black">🌍 ${c.country || "בעולם"}</span>
          <button onclick="openEntityFullPage('${eKey}', 'דף בית חב״ד בעולם', '${safeName}', 'השליח: ${safeRabbi}', '${safeAddr}', 'פתוח למניינים, אוכל כשר ושבתות', '${c.phone || ""}', 'בית חב״ד פתוח לכל יהודי במאור פנים.', 'אירוח שבת • אוכל כשר • מניינים ויחס חם')" class="text-xs font-black text-amber-400 hover:underline">
            ★ ${stats.avg} (${stats.count} המלצות)
          </button>
        </div>
        <h3 class="text-lg font-black text-white">${c.name}</h3>
        <p class="text-xs text-amber-300 font-bold">השליח: ${c.rabbi}</p>
        <p class="text-xs text-slate-400">📍 ${safeAddr}</p>
      </div>
      <div class="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2">
        <button onclick="openEntityFullPage('${eKey}', 'דף בית חב״ד בעולם', '${safeName}', 'השליח: ${safeRabbi}', '${safeAddr}', 'פתוח למניינים, אוכל כשר ושבתות', '${c.phone || ""}', 'בית חב״ד פתוח לכל יהודי.', 'אירוח שבת • אוכל כשר • מניינים ויחס חם')" class="py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
          ⭐ דף והמלצות
        </button>
        <a href="tel:${c.phone || ""}" class="py-2 bg-slate-800 text-white font-bold rounded-xl text-xs text-center">📞 חייג</a>
        <a href="${window.buildWazeUrl(c.lat || 32.08, c.lng || 34.83)}" target="_blank" class="py-2 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold rounded-xl text-xs text-center">🚗 Waze</a>
      </div>
    </div>`;
  }).join("");
};

window.refreshAllCommunityViews = function() {
  window.renderMikvaot(window.MIKVAOT_DATA);
  window.renderRestaurants(window.RESTAURANTS_DATA);
  window.renderChabad(window.CHABAD_DATA);
  window.renderMinyanim(window.MINYANIM_DATA);
  window.renderRabbis(window.RABBIS_DATA);
  window.renderGemachim(window.GEMACHIM_DATA);
  window.renderTzaddikim(window.TZADDIKIM_DATA);
  window.renderYahrzeitSharedCards("tzaddikim-yahrzeits-container");
  window.renderYahrzeitSharedCards("zmanim-yahrzeits-container");
  window.renderMySubmissionsList();
  window.filterEduVideos('all');
  window.renderActiveQuizQuestion();
  window.renderQuizResultsInMyZone();
  window.renderForumPosts('all');
  window.renderReligiousServicesDirectory('all');
  window.renderMyZoneMitzvahTracker();
};



window.handleGlobalSearch = function(e) {
  var inp = document.getElementById("home-search-input");
  var q = (inp ? inp.value : "").trim().toLowerCase();
  if (!q) return;
  if (!e || e.key === "Enter") {
    if (q.includes("מקווה") || q.includes("טבילה")) window.switchTab("mikvaot");
    else if (q.includes("מסעד") || q.includes("אוכל") || q.includes("כשר")) window.switchTab("restaurants");
    else if (q.includes("גמח") || q.includes("גמ״ח") || q.includes("יד שרה") || q.includes("עזר")) window.switchTab("gemachim");
    else if (q.includes("חבד") || q.includes("חב״ד") || q.includes("שליח")) window.switchTab("chabad");
    else if (q.includes("הגרל") || q.includes("קמפיין") || q.includes("תרומ")) window.switchTab("raffles");
    else if (q.includes("סידור") || q.includes("תפיל") || q.includes("שחרית")) window.switchTab("siddur");
    else if (q.includes("צדיק") || q.includes("קבר") || q.includes("מירון")) window.switchTab("tzaddikim");
    else if (q.includes("מניין") || q.includes("מנין")) window.switchTab("minyanim");
    else if (q.includes("מוהל") || q.includes("משגיח") || q.includes("חתן") || q.includes("שירות")) window.switchTab("customs");
    else if (q.includes("חידון") || q.includes("משחק") || q.includes("ילד")) window.switchTab("kids");
    else if (q.includes("פורום") || q.includes("דיון")) window.switchTab("forum");
    else if (q.includes("חי") || q.includes("שידור")) window.switchTab("live");
    else if (q.includes("ספרי") || q.includes("חומש") || q.includes("פרש") || q.includes("נביא") || q.includes("למוד")) window.switchTab("series");
    else window.toast("חיפוש מהיר עבור: " + q);
  }
};

// ============================================================================
// V22 ENGINE: סרטונים חינוכיים מיוטיוב, חידונים לילדים, פורום קהילתי, שירותי דת, ומעקב יומי עם נודניק
// ============================================================================

var activeEduCategory = "all";
var currentQuizIndex = 0;
var currentQuizScore = 0;
var activeForumCategory = "all";
var activeRelServiceCategory = "all";

// 1. סרטונים חינוכיים (היסטוריה, רבנים, פרשה, ילדים) + הורדה/הוספה מיוטיוב
window.filterEduVideos = function(cat) {
  activeEduCategory = cat || "all";
  var videos = window.getStorageJson(STORAGE_KEYS.EDU_VIDEOS, window.EDUCATIONAL_VIDEOS_DATA || []);
  var list = (activeEduCategory === "all")
    ? videos
    : videos.filter(function(v) { return v.category.indexOf(activeEduCategory) !== -1; });

  var grid = document.getElementById("edu-videos-grid");
  if (!grid) return;
  grid.innerHTML = list.map(function(v) {
    var eKey = "edu_" + v.id;
    var stats = window.getEntityStats(eKey, 5.0);
    var safeTitle = (v.title || "").replace(/'/g, "");
    var safeSpeaker = (v.speaker || "").replace(/'/g, "");
    var safeDesc = (v.description || "").replace(/'/g, "");
    return `
    <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-lg hover:border-amber-500/50 transition-all">
      <div>
        <div class="relative h-44 bg-slate-950 flex items-center justify-center overflow-hidden">
          <img src="${v.thumbnail}" alt="${safeTitle}" class="absolute inset-0 w-full h-full object-cover opacity-70">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40"></div>
          <button onclick="openEntityFullPage('${eKey}', 'סרטון חינוכי • ${v.category}', '${safeTitle}', '${safeSpeaker} • ${v.duration}', 'ספריית הווידאו החינוכית', 'אורך: ${v.duration}', '', '${safeDesc}', 'תוכן חינוכי • בהירות ההסבר • עניין וחיזוק', '${v.thumbnail}')" class="relative z-10 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black shadow-2xl">
            ▶
          </button>
          <span class="absolute top-3 right-3 px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded-lg text-[10px]">${v.category}</span>
          <span class="absolute bottom-2 left-3 px-2 py-0.5 bg-black/80 text-white font-mono rounded text-[10px]">${v.duration}</span>
        </div>
        <div class="p-4 space-y-1.5">
          <div class="flex items-center justify-between text-[11px] text-amber-400 font-bold">
            <span>🎙️ ${v.speaker}</span>
            <span>★ ${stats.avg} (${v.views || "10K"} צפיות)</span>
          </div>
          <h4 class="text-sm font-black text-white">${v.title}</h4>
          <p class="text-xs text-slate-400 line-clamp-2">${v.description}</p>
        </div>
      </div>
      <div class="p-3 pt-0 grid grid-cols-2 gap-2">
        <button onclick="openEntityFullPage('${eKey}', 'סרטון חינוכי • ${v.category}', '${safeTitle}', '${safeSpeaker} • ${v.duration}', 'ספריית הווידאו החינוכית', 'אורך: ${v.duration}', '', '${safeDesc}', 'תוכן חינוכי • בהירות ההסבר • עניין וחיזוק', '${v.thumbnail}')" class="py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
          🎬 צפה ודרג (${stats.count})
        </button>
        <button onclick="saveItemToMyZone('סרטון חינוכי', '${safeTitle}', 'series')" class="py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold rounded-xl text-xs">
          ⭐ שמור באזור שלי
        </button>
      </div>
    </div>`;
  }).join("");
};

window.addYoutubeEduVideo = function() {
  window.requireRegisteredUser(function() {
    var titleEl = document.getElementById("yt-edu-title");
    var catEl = document.getElementById("yt-edu-cat");
    var urlEl = document.getElementById("yt-edu-url");
    if (!titleEl || !titleEl.value.trim()) {
      window.toast("נא להזין כותרת לסרטון החינוכי");
      return;
    }
    var videos = window.getStorageJson(STORAGE_KEYS.EDU_VIDEOS, window.EDUCATIONAL_VIDEOS_DATA || []);
    var newVid = {
      id: "edv_" + Date.now(),
      title: titleEl.value.trim() + " (⏳ במודרציה)",
      speaker: "נוסף מיוטיוב ע״י הקהילה",
      category: catEl ? catEl.value : "היסטוריה",
      duration: "15:00",
      youtubeId: (urlEl && urlEl.value.trim()) ? urlEl.value.trim() : "youtube",
      views: "חדש",
      thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
      description: "סרטון חינוכי שנוסף מיוטיוב על ידי משתמש רשום ועובר בדיקת מודרציה."
    };
    videos.unshift(newVid);
    window.setStorageJson(STORAGE_KEYS.EDU_VIDEOS, videos);

    var mySubs = window.getStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, window.DEFAULT_MY_SUBMISSIONS || []);
    mySubs.unshift({
      id: "sub_yt_" + Date.now(),
      type: "סרטון חינוכי מיוטיוב",
      title: titleEl.value.trim(),
      details: "קטגוריה: " + newVid.category,
      date: "עכשיו",
      status: "⏳ ממתין לאישור מודרציה"
    });
    window.setStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, mySubs);

    titleEl.value = "";
    if (urlEl) urlEl.value = "";
    window.filterEduVideos("all");
    window.renderMyZoneAll();
    window.toast("🎬 הסרטון החינוכי נשלח למודרציה ונוסף לספרייה!");
  });
};

// 2. מנוע חידונים ומשחקים חינוכיים לילדים ולכל המשפחה + שמירת תוצאות באזור האישי
window.renderActiveQuizQuestion = function() {
  var qList = window.QUIZ_QUESTIONS_DATA || [];
  if (qList.length === 0) return;
  if (currentQuizIndex >= qList.length) currentQuizIndex = 0;
  var q = qList[currentQuizIndex];

  var counterEl = document.getElementById("quiz-step-counter");
  var catEl = document.getElementById("quiz-question-cat");
  var textEl = document.getElementById("quiz-question-text");
  var optsEl = document.getElementById("quiz-options-container");
  var scoreEl = document.getElementById("quiz-live-score");

  if (counterEl) counterEl.textContent = "שאלה " + (currentQuizIndex + 1) + " מתוך " + qList.length;
  if (catEl) catEl.textContent = q.category;
  if (textEl) textEl.textContent = q.question;
  if (scoreEl) scoreEl.textContent = "ניקוד מצטבר: " + currentQuizScore + " נק׳ 🏆";

  if (optsEl) {
    optsEl.innerHTML = q.options.map(function(opt, idx) {
      return `
      <button onclick="answerQuizQuestion(${idx})" class="w-full text-right p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-400 text-xs sm:text-sm font-bold text-white flex items-center justify-between transition-all">
        <span>${idx + 1}. ${opt}</span>
        <span class="text-amber-400">←</span>
      </button>`;
    }).join("");
  }
};

window.answerQuizQuestion = function(selectedIndex) {
  var qList = window.QUIZ_QUESTIONS_DATA || [];
  var q = qList[currentQuizIndex];
  var feedbackEl = document.getElementById("quiz-feedback-box");
  if (selectedIndex === q.correctIndex) {
    currentQuizScore += 20;
    if (feedbackEl) {
      feedbackEl.className = "p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 font-bold";
      feedbackEl.innerHTML = "🎉 <strong>תשובה נכונה! (+20 נק׳)</strong> • " + q.explanation;
    }
    window.toast("כל הכבוד! תשובה נכונה (+20 נקודות) 🏆");
  } else {
    if (feedbackEl) {
      feedbackEl.className = "p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200 font-bold";
      feedbackEl.innerHTML = "💡 <strong>כמעט!</strong> התשובה הנכונה היא: " + q.options[q.correctIndex] + " • " + q.explanation;
    }
  }

  if (currentQuizIndex + 1 < qList.length) {
    currentQuizIndex++;
    setTimeout(function() {
      window.renderActiveQuizQuestion();
    }, 1200);
  } else {
    // סיום החידון ושמירה אוטומטית ב"האזור האישי שלי -> תוצאות החידונים"
    var results = window.getStorageJson(STORAGE_KEYS.QUIZ_RESULTS, window.DEFAULT_QUIZ_RESULTS || []);
    var badge = currentQuizScore >= 80 ? "🥇 אלוף התורה והפרשה" : "🥈 מתמיד בחידון";
    results.unshift({
      id: "qres_" + Date.now(),
      title: "חידון צדיק-טוק (תורה, תנ״ך והלכה)",
      score: currentQuizScore + " מתוך 100 נקודות",
      badge: badge,
      date: "עכשיו"
    });
    window.setStorageJson(STORAGE_KEYS.QUIZ_RESULTS, results);
    window.renderQuizResultsInMyZone();
    window.toast("🏆 סיימת את החידון עם " + currentQuizScore + " נקודות! התוצאה נשמרה באזור האישי שלך.");
    currentQuizIndex = 0;
    currentQuizScore = 0;
    setTimeout(function() {
      window.renderActiveQuizQuestion();
    }, 1800);
  }
};

window.renderQuizResultsInMyZone = function() {
  var box = document.getElementById("myzone-quiz-results-list");
  if (!box) return;
  var results = window.getStorageJson(STORAGE_KEYS.QUIZ_RESULTS, window.DEFAULT_QUIZ_RESULTS || []);
  box.innerHTML = results.map(function(r) {
    return `
    <div class="bg-slate-950 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between gap-3">
      <div>
        <span class="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded-md text-[10px]">${r.badge}</span>
        <h4 class="text-sm font-black text-white mt-1">${r.title}</h4>
        <p class="text-xs text-amber-300 font-bold">ציון: ${r.score} • ${r.date}</p>
      </div>
      <button onclick="switchTab('kids')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold shrink-0">שחק שוב 🎮</button>
    </div>`;
  }).join("");
};

// 3. פורום קהילתי ובית מדרש חברתי
window.renderForumPosts = function(catFilter) {
  activeForumCategory = catFilter || "all";
  var posts = window.getStorageJson(STORAGE_KEYS.FORUM_POSTS, window.INITIAL_FORUM_POSTS || []);
  var list = (activeForumCategory === "all")
    ? posts
    : posts.filter(function(p) { return p.category.indexOf(activeForumCategory) !== -1; });

  var container = document.getElementById("forum-posts-container");
  if (!container) return;
  container.innerHTML = list.map(function(p) {
    var safeTitle = (p.title || "").replace(/'/g, "");
    var safeContent = (p.content || "").replace(/'/g, "");
    var eKey = "forum_" + p.id;
    return `
    <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 hover:border-amber-500/40 transition-all">
      <div class="flex items-center justify-between">
        <span class="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-black">${p.category}</span>
        <span class="text-[11px] text-slate-400">👤 ${p.author} • ${p.time} • <span class="text-emerald-400">${p.status || "מאושר ✔"}</span></span>
      </div>
      <h3 class="text-base font-black text-white">${p.title}</h3>
      <p class="text-xs text-slate-300 leading-relaxed">${p.content}</p>
      <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button onclick="toast('יישר כוח נשלח למחבר! 👍')" class="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 rounded-xl text-xs font-bold">👍 יישר כוח (${p.likes || 12})</button>
          <button onclick="openEntityFullPage('${eKey}', 'אשכול בפורום • ${p.category}', '${safeTitle}', 'נכתב ע״י ${p.author}', 'פורום קהילת צדיק-טוק', '${p.time}', '', '${safeContent}', 'תגובות לאשכול • דברי תורה • עזרה הדדית')" class="px-3 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">💬 תגובות לדיון (${p.repliesCount || 4})</button>
        </div>
      </div>
    </div>`;
  }).join("");
};

window.addNewForumPost = function() {
  window.requireRegisteredUser(function() {
    var titleEl = document.getElementById("forum-new-title");
    var catEl = document.getElementById("forum-new-cat");
    var bodyEl = document.getElementById("forum-new-body");
    if (!titleEl || !titleEl.value.trim() || !bodyEl || !bodyEl.value.trim()) {
      window.toast("נא להזין כותרת ותוכן לאשכול בפורום");
      return;
    }
    var acc = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount);
    var posts = window.getStorageJson(STORAGE_KEYS.FORUM_POSTS, window.INITIAL_FORUM_POSTS || []);
    posts.unshift({
      id: "fp_" + Date.now(),
      category: catEl ? catEl.value : "דברי תורה ופרשת השבוע",
      title: titleEl.value.trim(),
      author: acc.name + " (" + acc.city + ")",
      time: "עכשיו",
      content: bodyEl.value.trim(),
      likes: 1,
      repliesCount: 0,
      status: "⏳ ממתין לאישור מודרציה"
    });
    window.setStorageJson(STORAGE_KEYS.FORUM_POSTS, posts);

    var mySubs = window.getStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, window.DEFAULT_MY_SUBMISSIONS || []);
    mySubs.unshift({
      id: "sub_fp_" + Date.now(),
      type: "אשכול בפורום הקהילתי",
      title: titleEl.value.trim(),
      details: bodyEl.value.trim(),
      date: "עכשיו",
      status: "⏳ ממתין לאישור מודרציה"
    });
    window.setStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, mySubs);

    titleEl.value = "";
    bodyEl.value = "";
    window.renderForumPosts("all");
    window.renderMyZoneAll();
    window.toast("✅ האשכול נשלח למודרציה ופורסם בפורום הקהילתי!");
  });
};

// 4. שירותי דת בתוך "למצוא" (מוהלים, משגיחי כשרות, מדריכי חתנים, סופרי סת"ם, כלות)
window.renderReligiousServicesDirectory = function(catFilter) {
  activeRelServiceCategory = catFilter || "all";
  var services = window.getStorageJson(STORAGE_KEYS.REL_SERVICES, window.RELIGIOUS_SERVICES_DATA || []);
  var list = (activeRelServiceCategory === "all")
    ? services
    : services.filter(function(s) { return s.category.indexOf(activeRelServiceCategory) !== -1 || s.name.indexOf(activeRelServiceCategory) !== -1; });

  var grid = document.getElementById("religious-services-pro-grid");
  if (!grid) return;
  grid.innerHTML = list.map(function(s, idx) {
    var sid = s.id || ("srv_" + idx);
    var eKey = "relsrv_" + sid;
    var stats = window.getEntityStats(eKey, s.rating || 5.0);
    var safeName = (s.name || "").replace(/'/g, "");
    var safeCat = (s.category || "").replace(/'/g, "");
    var safeCity = (s.city || "").replace(/'/g, "");
    var safeDesc = (s.description || "").replace(/'/g, "");
    return `
    <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition-all">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-black">${s.category}</span>
          <button onclick="openEntityFullPage('${eKey}', 'שירותי דת • ${safeCat}', '${safeName}', '${safeCity}', '${safeCity}', 'בתיאום טלפוני', '${s.phone}', '${safeDesc}', 'מקצועיות ויראת שמיים • זמינות • יחס ושירות')" class="text-xs font-black text-amber-400 hover:underline">
            ★ ${stats.avg} (${stats.count} המלצות)
          </button>
        </div>
        <h3 class="text-base font-black text-white">${s.name}</h3>
        <p class="text-xs text-slate-300 leading-relaxed">${s.description}</p>
        <p class="text-[11px] text-slate-400">📍 ${s.city} • 📞 ${s.phone}</p>
      </div>
      <div class="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
        <a href="tel:${s.phone}" class="py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs text-center">📞 חייג כעת</a>
        <button onclick="openEntityFullPage('${eKey}', 'שירותי דת • ${safeCat}', '${safeName}', '${safeCity}', '${safeCity}', 'בתיאום טלפוני', '${s.phone}', '${safeDesc}', 'מקצועיות ויראת שמיים • זמינות • יחס ושירות')" class="py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold rounded-xl text-xs">
          ⭐ דרג והמלץ (${stats.count})
        </button>
      </div>
    </div>`;
  }).join("");
};

// 5. מעקב יומי, חשבון נפש ותזכורות מצוות (עשיתי ✔ / לא עשיתי ✗ / נודניק 🔔) בתוך האזור האישי שלי
window.renderMyZoneMitzvahTracker = function() {
  var box = document.getElementById("myzone-tracker-list");
  if (!box) return;
  var items = window.getStorageJson(STORAGE_KEYS.MITZVAH_TRACKER, window.DEFAULT_MITZVAH_TRACKER || []);
  var doneCount = items.filter(function(i) { return i.status === "done"; }).length;
  var summaryEl = document.getElementById("myzone-tracker-summary");
  if (summaryEl) summaryEl.textContent = "הושלמו היום: " + doneCount + " מתוך " + items.length + " יעדים רוחניים ✨";

  box.innerHTML = items.map(function(item) {
    var isDone = item.status === "done";
    var isMissed = item.status === "missed";
    return `
    <div class="bg-slate-950 border ${isDone ? 'border-emerald-500/50' : (isMissed ? 'border-red-500/40' : 'border-slate-800')} p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 bg-amber-500/15 text-amber-300 rounded text-[10px] font-black">${item.category}</span>
          <span class="text-[11px] ${item.snoozeActive ? 'text-cyan-400 font-bold' : 'text-slate-500'}">⏰ תזכורת: ${item.snoozeTime || '20:00'} ${item.snoozeActive ? '(נודניק פעיל 🔔)' : ''}</span>
        </div>
        <h4 class="text-sm font-black ${isDone ? 'text-emerald-300' : 'text-white'}">${item.title}</h4>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <button onclick="setMitzvahTrackerStatus('${item.id}', 'done')" class="px-3 py-1.5 rounded-xl text-xs font-black ${isDone ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-emerald-500'}">
          ✔ עשיתי
        </button>
        <button onclick="setMitzvahTrackerStatus('${item.id}', 'missed')" class="px-3 py-1.5 rounded-xl text-xs font-bold ${isMissed ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-red-500'}">
          ✗ לא עשיתי
        </button>
        <button onclick="toggleMitzvahSnooze('${item.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold ${item.snoozeActive ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-900 text-cyan-300 border border-cyan-500/30'}">
          🔔 ${item.snoozeActive ? 'נודניק פעיל' : 'הפעל נודניק'}
        </button>
      </div>
    </div>`;
  }).join("");
};

window.setMitzvahTrackerStatus = function(itemId, newStatus) {
  var items = window.getStorageJson(STORAGE_KEYS.MITZVAH_TRACKER, window.DEFAULT_MITZVAH_TRACKER || []);
  for (var i = 0; i < items.length; i++) {
    if (items[i].id === itemId) {
      items[i].status = newStatus;
      if (newStatus === "done") items[i].snoozeActive = false;
    }
  }
  window.setStorageJson(STORAGE_KEYS.MITZVAH_TRACKER, items);
  window.renderMyZoneMitzvahTracker();
  window.toast(newStatus === "done" ? "אשריך! סומן 'עשיתי' במעקב היומי ✔" : "סומן 'לא עשיתי' – תמיד אפשר להשלים או להפעיל נודניק 🔔");
};

window.toggleMitzvahSnooze = function(itemId) {
  var items = window.getStorageJson(STORAGE_KEYS.MITZVAH_TRACKER, window.DEFAULT_MITZVAH_TRACKER || []);
  for (var i = 0; i < items.length; i++) {
    if (items[i].id === itemId) {
      items[i].snoozeActive = !items[i].snoozeActive;
      window.toast(items[i].snoozeActive
        ? ("🔔 נודניק תזכורת הופעל עבור: " + items[i].title + " (יתריע שוב בעוד 30 דק׳)")
        : ("🔕 הנודניק כובה עבור: " + items[i].title));
    }
  }
  window.setStorageJson(STORAGE_KEYS.MITZVAH_TRACKER, items);
  window.renderMyZoneMitzvahTracker();
};

window.addNewMitzvahTrackerGoal = function() {
  var titleEl = document.getElementById("new-tracker-goal-title");
  var timeEl = document.getElementById("new-tracker-goal-time");
  if (!titleEl || !titleEl.value.trim()) {
    window.toast("נא להזין שם מצווה או קבלה אישית");
    return;
  }
  var items = window.getStorageJson(STORAGE_KEYS.MITZVAH_TRACKER, window.DEFAULT_MITZVAH_TRACKER || []);
  items.unshift({
    id: "mt_" + Date.now(),
    title: titleEl.value.trim(),
    category: "קבלה אישית",
    status: "pending",
    snoozeTime: (timeEl && timeEl.value.trim()) ? timeEl.value.trim() : "20:00",
    snoozeActive: true
  });
  window.setStorageJson(STORAGE_KEYS.MITZVAH_TRACKER, items);
  titleEl.value = "";
  window.renderMyZoneMitzvahTracker();
  window.toast("✨ הקבלה האישית נוספה למעקב היומי עם תזכורת נודניק!");
};
