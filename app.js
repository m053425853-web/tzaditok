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
  currentTab = tabId;
  var sections = document.querySelectorAll(".view-section");
  for (var i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }
  var target = document.getElementById("view-" + tabId);
  if (target) target.classList.add("active");

  var pills = document.querySelectorAll(".pill-btn");
  for (var j = 0; j < pills.length; j++) {
    pills[j].classList.remove("active");
  }
  var activePill = document.getElementById("pill-" + tabId);
  if (activePill) activePill.classList.add("active");

  var bnavs = document.querySelectorAll(".bottom-nav-item");
  for (var k = 0; k < bnavs.length; k++) {
    bnavs[k].classList.remove("active");
  }
  var bnavId = tabId;
  if (tabId === "rabbis" || tabId === "customs" || tabId === "tzaddikim") {
    bnavId = "siddur"; // תחת לשונית יהדות
  }
  var activeBNav = document.getElementById("bnav-" + bnavId);
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
  ["torah", "nach", "generations", "aiseries"].forEach(function(k) {
    var box = document.getElementById("lib-sub-" + k);
    var btn = document.getElementById("lib-btn-" + k);
    if (box) {
      if (k === subId) box.classList.remove("hidden");
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
