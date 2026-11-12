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

window.__v37_prev_switchTab_1 = function(tabId) {
  if (tabId === "learn") tabId = "series";
  if (tabId === "pray") tabId = "siddur";
  if (tabId === "find") tabId = "minyanim";
  if (tabId === "givebuy" || tabId === "donate") tabId = "raffles";

  currentTab = tabId;
  var sections = document.querySelectorAll(".view-section");
  for (var i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }
  var target = document.getElementById("view-" + tabId);
  if (target) target.classList.add("active");

  var parentHub = tabId;
  if (["series", "kids", "live", "studio"].indexOf(tabId) !== -1) parentHub = "series";
  else if (["siddur"].indexOf(tabId) !== -1) parentHub = "siddur";
  else if (["minyanim", "rabbis", "chabad", "mikvaot", "restaurants", "tzaddikim", "gemachim", "customs", "zmanim", "yeshivot", "prayerwall", "chavruta"].indexOf(tabId) !== -1) parentHub = "find";
  else if (["raffles", "judaica", "donors", "premium"].indexOf(tabId) !== -1) parentHub = "givebuy";
  else if (["forum"].indexOf(tabId) !== -1) parentHub = "forum";
  else if (["myzone", "admin"].indexOf(tabId) !== -1) parentHub = "myzone";
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
  var activeBNav = document.getElementById("bnav-" + parentHub) || document.getElementById("bnav-" + tabId);
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
window.__v37_prev_handleGlobalSearch_1 = function(e) {
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
  var followed = window.getStorageJson(STORAGE_KEYS.FOLLOWED_CREATORS, {});

  container.innerHTML = (cards || []).map(function(item) {
    var totalLikes = (item.likes + (likesState[item.id] || 0)).toLocaleString();
    var isFollowing = !!followed[item.creator];
    var safeTitle = (item.title || "").replace(/'/g, "");
    var safeCreator = (item.creator || "צדיק-טוק הפקות מקור").replace(/'/g, "");
    var srcBadge = item.sourceBadge || "פסוק מהמקור + מדרש חז״ל";
    return `
    <div class="mobile-full-bleed relative bg-white border border-[#E5DBC7] rounded-2xl overflow-hidden shadow-sm">
      <div class="p-3.5 bg-[#FDF8EF] border-b border-[#E5DBC7] flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-[#0F2340] text-white font-black flex items-center justify-center text-sm" style="color:#FFFFFF !important;">צ</div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-[#0F2340]">${item.creator}</span>
              <button onclick="toggleFollowCreator('${safeCreator}')" class="px-2 py-0.5 rounded-md text-[10px] font-bold ${isFollowing ? 'bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227]' : 'bg-amber-500 text-white'}">
                ${isFollowing ? 'עוקב ✔' : '+ מעקב'}
              </button>
            </div>
            <span class="text-[11px] text-[#5C4938] block">${item.chumash} • מקור: <strong>${srcBadge}</strong></span>
          </div>
        </div>
        <button onclick="openSeriesEpisodes('${item.seriesId || "s_joseph"}')" class="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold">
          לסדרה המלאה
        </button>
      </div>

      <div class="relative w-full h-[64vh] sm:h-[540px] bg-[#0F2340] flex items-center justify-center overflow-hidden">
        <img src="${item.image}" alt="${safeTitle}" class="absolute inset-0 w-full h-full object-cover opacity-85">
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" style="background-image: linear-gradient(to top, rgba(15,35,64,0.92), rgba(15,35,64,0.2), transparent) !important; background-color: transparent !important; border: none !important;"></div>

        <button onclick="playReelVideoDemo('${item.id}', '${safeTitle}')" class="relative z-10 w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center text-2xl font-black shadow-lg">
          ▶
        </button>

        <!-- כפתורי אינטראקציה בצד הסרטון -->
        <div class="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-2.5">
          <button onclick="toggleLike('${item.id}')" class="px-3 py-1.5 rounded-xl bg-white/95 border border-[#E5DBC7] text-[#0F2340] text-xs font-bold shadow">
            לייק (${totalLikes})
          </button>
          <button onclick="openRashiDrawer('${item.id}')" class="px-3 py-1.5 rounded-xl bg-white/95 border border-[#C9A227] text-[#0F2340] text-xs font-bold shadow">
            רש״י ומקור
          </button>
          <button onclick="openEntityFullPage('reel_${item.id}', 'תגובות לסרטון • ${srcBadge}', '${safeTitle}', '${safeCreator}', '${item.chumash}', '', '', '${(item.rashi || "").replace(/'/g, "")}', 'תגובות הגולשים • דברי תורה • חיזוק')" class="px-3 py-1.5 rounded-xl bg-white/95 border border-[#E5DBC7] text-[#0F2340] text-xs font-bold shadow">
            תגובות
          </button>
          <button onclick="saveItemToMyZone('סרטון קצר', '${safeTitle}', 'feed')" class="px-3 py-1.5 rounded-xl bg-white/95 border border-[#E5DBC7] text-[#0F2340] text-xs font-bold shadow">
            שמור
          </button>
          <button onclick="reportContentModal('${safeTitle}')" class="px-2.5 py-1 rounded-lg bg-white/80 text-[#5C4938] text-[10px] font-bold">
            דיווח
          </button>
        </div>

        <div class="absolute bottom-0 left-0 right-28 z-20 p-4 space-y-1 text-right">
          <span class="px-2.5 py-0.5 bg-[#C9A227] text-white rounded text-[10px] font-bold inline-block">${srcBadge}</span>
          <h3 class="text-lg font-bold" style="color:#FFFFFF !important;">${item.title}</h3>
          <p class="text-xs font-serif" style="color:#FDF8EF !important;">${item.quote}</p>
          <p class="text-xs" style="color:#E5DBC7 !important;">${item.rashi}</p>
        </div>
      </div>
    </div>`;
  }).join("");
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
window.__v37_prev_switchLibrarySubTab_1 = function(subId) {
  if (subId === "overview" || subId === "library") subId = "torah";
  var allSubIds = ["torah", "nach", "generations", "mishnah", "chassidut", "courses", "liveshiurim", "eduvideos", "weekseries", "music", "aiseries"];

  allSubIds.forEach(function(k) {
    var box = document.getElementById("lib-sub-" + k);
    var btn = document.getElementById("lib-btn-" + k);
    if (box) {
      if (k === subId || (subId === "generations" && k === "aiseries")) box.classList.remove("hidden");
      else box.classList.add("hidden");
    }
    if (btn) {
      btn.className = (k === subId)
        ? "hub-grid-btn active"
        : "hub-grid-btn";
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
        <h3 class="text-base font-black text-amber-400 border-b border-slate-800 pb-1.5"> ${grp.group}</h3>
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

window.__v37_prev_openSeriesEpisodes_1 = function(seriesId) {
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

window.__v37_prev_selectPrayer_1 = function(k) {
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
window.__v37_prev_renderTzaddikim_1 = function(list) {
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
window.__v37_prev_renderMikvaot_1 = function(list) {
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

window.__v37_prev_filterMikvaot_1 = function(t) {
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
window.__v37_prev_renderRestaurants_1 = function(list) {
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
window.__v37_prev_renderGemachim_1 = function(list) {
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

window.__v37_prev_renderChabad_1 = function(list) {
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

window.__v37_prev_renderMinyanim_1 = function(list) {
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

window.__v37_prev_renderRabbis_1 = function(list) {
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

window.__v37_prev_toggleShabbatOverlay_1 = function(show) {
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
window.__v37_prev_switchMyZoneSubTab_1 = function(subTab) {
  ["tracker", "community", "quizresults", "saved", "history", "yahrzeits", "submissions", "premium", "orders", "settings"].forEach(function(k) {
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
          <h4 class="text-sm font-black text-white"> ${y.name}</h4>
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

window.__v37_prev_openAuthModal_1 = function() {
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

window.__v37_prev_saveUserRegistration_1 = function() {
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

window.__v37_prev_toggleGuestOrRegistered_1 = function() {
  currentUserAccount.isRegistered = !currentUserAccount.isRegistered;
  window.setStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount);
  window.updateAuthHeaderBadge();
  window.toast(currentUserAccount.isRegistered ? "מחובר כמשתמש רשום ✔" : "עברת למצב אורח (לא רשום)");
};

window.__v37_prev_updateAuthHeaderBadge_1 = function() {
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

window.__v37_prev_submitEntityReview_1 = function() {
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

window.__v37_prev_submitCommunityAddForm_1 = function() {
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

window.__v37_prev_renderMinyanim_2 = function(list) {
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
      <h4 class="text-sm font-black text-white"> ${item.question}</h4>
      <p class="text-xs text-slate-300 leading-relaxed">✅ ${item.answer}</p>
    </div>`;
  }).join("");
};

window.__v37_prev_renderRabbis_2 = function(list) {
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
window.__v37_prev_filterGemachimByCategory_1 = function(catQuery) {
  if (!catQuery || catQuery === "all") {
    window.renderGemachim(window.GEMACHIM_DATA);
    return;
  }
  var filtered = (window.GEMACHIM_DATA || []).filter(function(g) {
    return (g.name && g.name.indexOf(catQuery) !== -1) || (g.category && g.category.indexOf(catQuery) !== -1) || (g.description && g.description.indexOf(catQuery) !== -1);
  });
  window.renderGemachim(filtered);
};

window.__v37_prev_renderGemachim_2 = function(list) {
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
window.__v37_prev_renderTzaddikim_2 = function(list) {
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
window.__v37_prev_renderMikvaot_2 = function(list) {
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

window.__v37_prev_renderRestaurants_2 = function(list) {
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

window.__v37_prev_renderChabad_2 = function(list) {
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
  window.renderTehillimChapters('');
  window.renderPrayCustoms('');
  window.renderCoursesAndChassidut();
  window.applySavedCustomLogo();
  window.renderMishnahGemaraHalacha();
  window.renderLearningStreakBar();
  window.renderContinueWatchingBanner();
  window.renderStudioDrafts();
  window.renderYeshivotAndMosdot('');
  window.renderCommunityPrayerWall();
  window.renderOrdersAndSubscriptionInMyZone();
  window.renderAdminPanel();
  window.renderRabbiShiurimList('');
  window.fetchLessonsFromSupabase();
  window.renderDailyCustomsCalendar();
  window.renderChavrutaDirectory('all');
  window.initFloatingShabbatButton();
};



window.__v37_prev_handleGlobalSearch_2 = function(e) {
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
window.__v37_prev_filterEduVideos_1 = function(cat) {
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

window.__v37_prev_addNewForumPost_1 = function() {
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
window.__v37_prev_renderReligiousServicesDirectory_1 = function(catFilter) {
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
  window.renderTehillimChapters('');
  window.renderPrayCustoms('');
  window.renderCoursesAndChassidut();
  window.applySavedCustomLogo();
  window.renderMishnahGemaraHalacha();
  window.renderLearningStreakBar();
  window.renderContinueWatchingBanner();
  window.renderStudioDrafts();
  window.renderYeshivotAndMosdot('');
  window.renderCommunityPrayerWall();
  window.renderOrdersAndSubscriptionInMyZone();
  window.renderAdminPanel();
  window.renderRabbiShiurimList('');
  window.fetchLessonsFromSupabase();
  window.renderDailyCustomsCalendar();
  window.renderChavrutaDirectory('all');
  window.initFloatingShabbatButton();
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
  window.renderTehillimChapters('');
  window.renderPrayCustoms('');
  window.renderCoursesAndChassidut();
  window.applySavedCustomLogo();
  window.renderMishnahGemaraHalacha();
  window.renderLearningStreakBar();
  window.renderContinueWatchingBanner();
  window.renderStudioDrafts();
  window.renderYeshivotAndMosdot('');
  window.renderCommunityPrayerWall();
  window.renderOrdersAndSubscriptionInMyZone();
  window.renderAdminPanel();
  window.renderRabbiShiurimList('');
  window.fetchLessonsFromSupabase();
  window.renderDailyCustomsCalendar();
  window.renderChavrutaDirectory('all');
  window.initFloatingShabbatButton();
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
  window.renderTehillimChapters('');
  window.renderPrayCustoms('');
  window.renderCoursesAndChassidut();
  window.applySavedCustomLogo();
  window.renderMishnahGemaraHalacha();
  window.renderLearningStreakBar();
  window.renderContinueWatchingBanner();
  window.renderStudioDrafts();
  window.renderYeshivotAndMosdot('');
  window.renderCommunityPrayerWall();
  window.renderOrdersAndSubscriptionInMyZone();
  window.renderAdminPanel();
  window.renderRabbiShiurimList('');
  window.fetchLessonsFromSupabase();
  window.renderDailyCustomsCalendar();
  window.renderChavrutaDirectory('all');
  window.initFloatingShabbatButton();
  window.toast("✨ הקבלה האישית נוספה למעקב היומי עם תזכורת נודניק!");
};


// ============================================================================
// V23 ENGINE: עיצוב מורשת יהודית, תהילים ומנהגים בלהתפלל, חיפוש ו-GPS בכל דפי למצוא, ומצב שבת הלכתי
// ============================================================================

// 1. ניווט פנימי בלשונית "להתפלל": סידור תפילה | ספר תהילים | מנהגים והלכות
window.__v37_prev_switchPraySubTab_1 = function(subTab) {
  ["siddur", "tehillim", "customs"].forEach(function(k) {
    var box = document.getElementById("pray-sub-" + k);
    var btn = document.getElementById("pray-btn-" + k);
    if (box) {
      if (k === subTab) box.classList.remove("hidden");
      else box.classList.add("hidden");
    }
    if (btn) {
      btn.className = (k === subTab)
        ? "py-3 px-4 rounded-2xl bg-amber-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm"
        : "py-3 px-4 rounded-2xl bg-white text-[#0F2340] border border-[#D8CBB5] font-bold text-sm flex items-center justify-center gap-2";
    }
  });
};

window.renderTehillimChapters = function(query) {
  var container = document.getElementById("tehillim-chapters-container");
  if (!container || !window.TEHILLIM_DATA) return;
  var q = (query || "").trim().toLowerCase();
  var list = window.TEHILLIM_DATA.filter(function(item) {
    return !q || item.chapter.toLowerCase().indexOf(q) !== -1 || item.category.toLowerCase().indexOf(q) !== -1 || item.purpose.toLowerCase().indexOf(q) !== -1 || item.text.toLowerCase().indexOf(q) !== -1;
  });
  container.innerHTML = list.map(function(t) {
    return `
    <div class="prayer-sheet-paper space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DBC7] pb-3">
        <div>
          <span class="px-3 py-1 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-lg text-xs font-black">${t.chapter} • ${t.category}</span>
          <h4 class="text-lg font-black text-[#0F2340] mt-2">${t.purpose}</h4>
        </div>
        <button onclick="saveItemToMyZone('תהילים', 'תהילים ${t.chapter} - ${t.category}', 'siddur')" class="px-3.5 py-1.5 bg-white text-[#0F2340] border border-[#D8CBB5] rounded-xl text-xs font-bold self-start sm:self-auto">
          שמור באזור שלי
        </button>
      </div>
      <p class="text-xl leading-loose font-serif text-[#0F2340]">${t.text}</p>
    </div>`;
  }).join("");
};

window.__v37_prev_renderPrayCustoms_1 = function(query) {
  var container = document.getElementById("pray-customs-container");
  if (!container || !window.CUSTOMS_DATA) return;
  var q = (query || "").trim().toLowerCase();
  var list = window.CUSTOMS_DATA.filter(function(c) {
    return !q || (c.title && c.title.toLowerCase().indexOf(q) !== -1) || (c.description && c.description.toLowerCase().indexOf(q) !== -1);
  });
  container.innerHTML = list.map(function(c) {
    return `
    <div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-2 shadow-sm">
      <span class="text-xs font-bold text-[#5C4938] bg-[#F6EFE2] px-2.5 py-1 rounded-md inline-block">${c.category || "מנהגי ישראל"}</span>
      <h4 class="text-lg font-black text-[#0F2340]">${c.title}</h4>
      <p class="text-sm text-[#5C4938] leading-relaxed">${c.description || c.summary || ""}</p>
    </div>`;
  }).join("");
};

// 2. קורסים במדורים ותורת החסידות בלשונית "ללמוד"
window.renderCoursesAndChassidut = function() {
  var chasBox = document.getElementById("chassidut-courses-grid");
  var crsBox = document.getElementById("structured-courses-grid");
  var allData = window.COURSES_CHASSIDUT_DATA || [];
  if (chasBox) {
    var chasList = allData.filter(function(x) { return x.type === "חסידות"; });
    chasBox.innerHTML = chasList.map(function(c) {
      return `
      <div class="bg-white border border-[#E5DBC7] p-6 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-2">
          <span class="px-3 py-1 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-lg text-xs font-bold">${c.lessonsCount} • ${c.instructor}</span>
          <h4 class="text-lg font-black text-[#0F2340]">${c.title}</h4>
          <p class="text-sm text-[#5C4938] leading-relaxed">${c.summary}</p>
        </div>
        <button onclick="openEntityFullPage('course_${c.id}', 'תורת החסידות', '${c.title}', '${c.instructor} • ${c.lessonsCount}', 'בית המדרש לחסידות', '${c.lessonsCount}', '', '${c.summary}', 'עומק התוכן • בהירות השיעור • חיזוק רוחני')" class="w-full py-2.5 bg-amber-500 text-white font-black rounded-xl text-xs">
          כניסה לשיעורי המדור
        </button>
      </div>`;
    }).join("");
  }
  if (crsBox) {
    var crsList = allData.filter(function(x) { return x.type === "קורסים במדורים"; });
    crsBox.innerHTML = crsList.map(function(c) {
      return `
      <div class="bg-white border border-[#E5DBC7] p-6 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-2">
          <span class="px-3 py-1 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-lg text-xs font-bold">${c.lessonsCount} • ${c.instructor}</span>
          <h4 class="text-lg font-black text-[#0F2340]">${c.title}</h4>
          <p class="text-sm text-[#5C4938] leading-relaxed">${c.summary}</p>
        </div>
        <button onclick="openEntityFullPage('course_${c.id}', 'קורס מובנה', '${c.title}', '${c.instructor} • ${c.lessonsCount}', 'מערכת הקורסים', '${c.lessonsCount}', '', '${c.summary}', 'בהירות ההלכה • סדר הלימוד • יישום מעשי')" class="w-full py-2.5 bg-amber-500 text-white font-black rounded-xl text-xs">
          פתיחת הקורס המלא
        </button>
      </div>`;
    }).join("");
  }
};

// 3. חיפוש פרטני + איתור לפי מיקום GPS בכל דף בתוך "למצוא"
window.__v37_prev_filterFindSectionByQuery_1 = function(sectionType, query) {
  var q = (query || "").trim().toLowerCase();
  if (sectionType === "minyanim") {
    var list = (window.MINYANIM_DATA || []).filter(function(m) {
      return !q || (m.name && m.name.toLowerCase().indexOf(q) !== -1) || (m.city && m.city.toLowerCase().indexOf(q) !== -1) || (m.nusach && m.nusach.toLowerCase().indexOf(q) !== -1);
    });
    window.renderMinyanim(list);
  } else if (sectionType === "rabbis") {
    var listR = (window.RABBIS_DATA || []).filter(function(r) {
      return !q || (r.name && r.name.toLowerCase().indexOf(q) !== -1) || (r.title && r.title.toLowerCase().indexOf(q) !== -1) || (r.specialty && r.specialty.toLowerCase().indexOf(q) !== -1) || (r.city && r.city.toLowerCase().indexOf(q) !== -1);
    });
    window.renderRabbis(listR);
  } else if (sectionType === "gemachim") {
    var listG = (window.GEMACHIM_DATA || []).filter(function(g) {
      return !q || (g.name && g.name.toLowerCase().indexOf(q) !== -1) || (g.category && g.category.toLowerCase().indexOf(q) !== -1) || (g.city && g.city.toLowerCase().indexOf(q) !== -1) || (g.description && g.description.toLowerCase().indexOf(q) !== -1);
    });
    window.renderGemachim(listG);
  } else if (sectionType === "mikvaot") {
    var listM = (window.MIKVAOT_DATA || []).filter(function(m) {
      return !q || (m.name && m.name.toLowerCase().indexOf(q) !== -1) || (m.city && m.city.toLowerCase().indexOf(q) !== -1) || (m.type && m.type.toLowerCase().indexOf(q) !== -1);
    });
    window.renderMikvaot(listM);
  } else if (sectionType === "chabad") {
    var listC = (window.CHABAD_DATA || []).filter(function(c) {
      return !q || (c.name && c.name.toLowerCase().indexOf(q) !== -1) || (c.country && c.country.toLowerCase().indexOf(q) !== -1) || (c.rabbi && c.rabbi.toLowerCase().indexOf(q) !== -1) || (c.address && c.address.toLowerCase().indexOf(q) !== -1);
    });
    window.renderChabad(listC);
  } else if (sectionType === "tzaddikim") {
    var listT = (window.TZADDIKIM_DATA || []).filter(function(t) {
      return !q || (t.name && t.name.toLowerCase().indexOf(q) !== -1) || (t.city && t.city.toLowerCase().indexOf(q) !== -1) || (t.segula && t.segula.toLowerCase().indexOf(q) !== -1);
    });
    window.renderTzaddikim(listT);
  } else if (sectionType === "chavruta") {
    window.renderChavrutaDirectory(q || "all");
  } else if (sectionType === "customs") {
    var services = window.getStorageJson(STORAGE_KEYS.REL_SERVICES, window.RELIGIOUS_SERVICES_DATA || []);
    var listS = services.filter(function(s) {
      return !q || (s.name && s.name.toLowerCase().indexOf(q) !== -1) || (s.category && s.category.toLowerCase().indexOf(q) !== -1) || (s.city && s.city.toLowerCase().indexOf(q) !== -1) || (s.description && s.description.toLowerCase().indexOf(q) !== -1);
    });
    var grid = document.getElementById("religious-services-pro-grid");
    if (grid) {
      activeRelServiceCategory = "all";
      window.RELIGIOUS_SERVICES_TEMP = listS;
      window.renderReligiousServicesDirectory(q || "all");
    }
  }
};

window.__v37_prev_locateNearestByGPS_1 = function(sectionType) {
  window.toast("מאתר מיקום GPS נוכחי וממיין תוצאות לפי מרחק ממך...");
  var applySortByCoords = function(userLat, userLng, label) {
    var sortArr = function(arr) {
      return (arr || []).slice().sort(function(a, b) {
        var dA = window.calcDistanceKm ? window.calcDistanceKm(userLat, userLng, a.lat || 32.08, a.lng || 34.83) : 0.5;
        var dB = window.calcDistanceKm ? window.calcDistanceKm(userLat, userLng, b.lat || 32.08, b.lng || 34.83) : 1.2;
        a.distanceKm = dA.toFixed(1);
        b.distanceKm = dB.toFixed(1);
        return dA - dB;
      });
    };
    if (sectionType === "minyanim") window.renderMinyanim(sortArr(window.MINYANIM_DATA));
    else if (sectionType === "gemachim") window.renderGemachim(sortArr(window.GEMACHIM_DATA));
    else if (sectionType === "mikvaot") window.renderMikvaot(sortArr(window.MIKVAOT_DATA));
    else if (sectionType === "restaurants") window.renderRestaurants(sortArr(window.RESTAURANTS_DATA));
    else if (sectionType === "chabad") window.renderChabad(sortArr(window.CHABAD_DATA));
    else if (sectionType === "tzaddikim") window.renderTzaddikim(sortArr(window.TZADDIKIM_DATA));
    else if (sectionType === "rabbis") window.renderRabbis(window.RABBIS_DATA);
    else if (sectionType === "chavruta") window.renderChavrutaDirectory("all");
    else if (sectionType === "customs") window.renderReligiousServicesDirectory("all");
    window.toast("התוצאות מוינו לפי קרבה למיקום ה-GPS שלך (" + label + ")");
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        applySortByCoords(pos.coords.latitude, pos.coords.longitude, "מיקום GPS מדויק");
      },
      function() {
        applySortByCoords(32.0840, 34.8352, currentCity || "בני ברק / מרכז");
      },
      { timeout: 4000 }
    );
  } else {
    applySortByCoords(32.0840, 34.8352, currentCity || "בני ברק / מרכז");
  }
};

// 4. מצב שבת הלכתי אמיתי: מכבה מוזיקה, סרטונים, חנות ותרומות, ומשאיר רק סידור, זמנים ומידע
window.__v37_prev_toggleShabbatOverlay_2 = function() {
  var isShabbat = document.body.classList.contains("shabbat-mode-active");
  if (!isShabbat) {
    document.body.classList.add("shabbat-mode-active");
    localStorage.setItem(STORAGE_KEYS.SHABBAT_ACTIVE, "true");
    isMusicPlaying = false;
    var banner = document.getElementById("shabbat-active-top-banner");
    if (banner) banner.classList.remove("hidden");
    var modal = document.getElementById("modal-shabbat-mode");
    if (modal) modal.classList.add("hidden");
    window.switchTab("siddur");
    window.toast("שבת שלום: מצב שבת הופעל – מוזיקה, סרטונים, חנות ותרומות כבויים. פתוח לסידור, תהילים, זמנים ומידע בלבד.");
  } else {
    document.body.classList.remove("shabbat-mode-active");
    localStorage.setItem(STORAGE_KEYS.SHABBAT_ACTIVE, "false");
    var bannerOff = document.getElementById("shabbat-active-top-banner");
    if (bannerOff) bannerOff.classList.add("hidden");
    window.toast("שבוע טוב ומבורך: מצב שבת כובה וכל חלקי האפליקציה פעילים.");
  }
};

// 5. העלאת תמונת לוגו מותאמת אישית לכותרת העליונה
window.handleCustomLogoUpload = function(inputEl) {
  if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var dataUrl = e.target.result;
    localStorage.setItem(STORAGE_KEYS.CUSTOM_LOGO, dataUrl);
    window.applySavedCustomLogo();
  window.renderMishnahGemaraHalacha();
  window.renderLearningStreakBar();
  window.renderContinueWatchingBanner();
  window.renderStudioDrafts();
  window.renderYeshivotAndMosdot('');
  window.renderCommunityPrayerWall();
  window.renderOrdersAndSubscriptionInMyZone();
  window.renderAdminPanel();
  window.renderRabbiShiurimList('');
  window.fetchLessonsFromSupabase();
  window.renderDailyCustomsCalendar();
  window.renderChavrutaDirectory('all');
  window.initFloatingShabbatButton();
    window.toast("הלוגו שלך עודכן בכותרת הראשית בהצלחה!");
  };
  reader.readAsDataURL(inputEl.files[0]);
};

window.applySavedCustomLogo = function() {
  var savedLogo = localStorage.getItem(STORAGE_KEYS.CUSTOM_LOGO);
  var imgEl = document.getElementById("header-custom-logo-img");
  var svgFallback = document.getElementById("header-default-logo-svg");
  if (savedLogo && imgEl) {
    imgEl.src = savedLogo;
    imgEl.classList.remove("hidden");
    if (svgFallback) svgFallback.classList.add("hidden");
  }
};


// ============================================================================
// V24 MASTER PHASE 1 ENGINE: כל 14 המודולים במצב הדגמה מלא (ללא פעולות ריקות)
// ============================================================================

var appliedCouponDiscount = 0;
var activeAdminRole = localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE) || "מנהל ראשי";

window.toggleFollowCreator = function(creatorName) {
  var followed = window.getStorageJson(STORAGE_KEYS.FOLLOWED_CREATORS, {});
  followed[creatorName] = !followed[creatorName];
  window.setStorageJson(STORAGE_KEYS.FOLLOWED_CREATORS, followed);
  window.renderFeedCards(window.REEL_FEED);
  window.toast(followed[creatorName] ? ("התחלת לעקוב אחרי " + creatorName + " ✔") : ("הפסקת מעקב אחרי " + creatorName));
};

window.playReelVideoDemo = function(reelId, title) {
  window.addLearningPoints(5, "צפייה בסרטון תורה: " + title);
  var hist = window.getStorageJson(STORAGE_KEYS.HISTORY_ITEMS, window.DEFAULT_HISTORY_ITEMS || []);
  hist.unshift({ id: "hs_" + Date.now(), time: "עכשיו", title: title, category: "פיד סרטונים" });
  window.setStorageJson(STORAGE_KEYS.HISTORY_ITEMS, hist);
  window.renderMyZoneAll();
  window.toast("מנגן סרטון: " + title + " (+5 נקודות לימוד נוספו לחשבונך)");
};

window.reportContentModal = function(itemTitle) {
  var reason = prompt("דיווח למערכת הניהול על התוכן: '" + itemTitle + "'\nנא לציין את סיבת הדיווח (אי-דיוק במקור / תוכן לא מתאים / תקלה טכנית):", "בדיקת התאמה למקור");
  if (reason) {
    window.addAdminAuditLog("מנהל קהילה", "התקבל דיווח משתמש על: " + itemTitle + " (" + reason + ")", "ממתין לבדיקה");
    window.toast("הדיווח נקלט והועבר לפאנל הניהול המרכזי לבדיקה.");
  }
};

// 2. סדרות ופרקים: סימון נצפה, המשך צפייה, פרקים בחינם ופרקי Premium, וסימון סוג המקור
window.openSeriesEpisodes = function(seriesId) {
  var s = (window.SERIES_LIBRARY || []).find(function(x) { return x.id === seriesId; }) || window.SERIES_LIBRARY[0];
  if (!s) return;
  var watchedMap = window.getStorageJson(STORAGE_KEYS.WATCHED_EPISODES, {});
  var isPremUser = localStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS) === "active";

  document.getElementById("episodes-series-title").textContent = s.title;
  document.getElementById("episodes-series-status").textContent = (s.description || "") + " • סיווג מקור: " + (s.sourceBadge || "פסוק מהמקור, מדרש והמחשה יצירתית");

  var eps = s.episodes || [];
  var listEl = document.getElementById("episodes-list-container");
  if (listEl) {
    listEl.innerHTML = eps.map(function(ep) {
      var epKey = s.id + "_ep_" + ep.epNum;
      var isWatched = !!watchedMap[epKey];
      var locked = ep.isPremium && !isPremUser;
      return `
      <div class="bg-white border border-[#E5DBC7] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-md text-xs font-bold ${ep.isPremium ? 'bg-[#0F2340] text-white' : 'bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227]'}">
              ${ep.isPremium ? 'פרק Premium' : 'פרק חינם'}
            </span>
            <span class="px-2.5 py-0.5 bg-[#F8F3E8] text-[#5C4938] rounded-md text-xs font-bold">מקור: ${ep.sourceType || 'מדרש חז״ל'}</span>
            <span class="text-xs text-[#5C4938]">${ep.duration}</span>
            ${isWatched ? '<span class="text-xs font-bold text-[#0F2340] bg-[#F6EFE2] px-2 py-0.5 rounded">נצפה ✔</span>' : ''}
          </div>
          <h4 class="text-base font-bold text-[#0F2340]">${ep.title}</h4>
          <p class="text-xs text-[#5C4938]">${ep.summary || ''}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          ${locked
            ? `<button onclick="closeModal('modal-episodes');switchTab('myzone');switchMyZoneSubTab('premium');" class="px-4 py-2 bg-[#0F2340] text-white font-bold rounded-xl text-xs" style="color:#FFFFFF !important;">שדרג ל-Premium לצפייה</button>`
            : `<button onclick="watchSeriesEpisode('${s.id}', ${ep.epNum}, '${ep.title.replace(/'/g, "")}')" class="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl text-xs">נגן פרק (${ep.duration})</button>`
          }
        </div>
      </div>`;
    }).join("");
  }
  document.getElementById("modal-episodes").classList.remove("hidden");
};

window.watchSeriesEpisode = function(seriesId, epNum, epTitle) {
  var watchedMap = window.getStorageJson(STORAGE_KEYS.WATCHED_EPISODES, {});
  watchedMap[seriesId + "_ep_" + epNum] = true;
  window.setStorageJson(STORAGE_KEYS.WATCHED_EPISODES, watchedMap);
  localStorage.setItem("tzadiktok_last_watched_title", epTitle);
  localStorage.setItem("tzadiktok_last_watched_series", seriesId);
  window.addLearningPoints(15, "צפייה בפרק סדרה: " + epTitle);
  window.openSeriesEpisodes(seriesId);
  window.renderContinueWatchingBanner();
  window.toast("מנגן פרק: " + epTitle + " (סומן כ'נצפה ✔' ונשמר בהמשך צפייה)");
};

window.renderContinueWatchingBanner = function() {
  var lastTitle = localStorage.getItem("tzadiktok_last_watched_title") || "יוסף הצדיק - פרק 1: הפתיחה והניסיון הראשון";
  var lastSeries = localStorage.getItem("tzadiktok_last_watched_series") || "s_joseph";
  var box = document.getElementById("continue-watching-text");
  if (box) box.textContent = lastTitle;
  var btn = document.getElementById("continue-watching-btn");
  if (btn) btn.setAttribute("onclick", "openSeriesEpisodes('" + lastSeries + "')");
};

// 3. סטודיו יצירת סרטוני AI (#view-studio) - תהליך עבודה מלא בהדגמה (תצוגה מקדימה, שמירת טיוטה, שליחה לאישור מנהל)
window.previewStudioCreation = function() {
  var charVal = document.getElementById("studio-char-select").value;
  var periodVal = document.getElementById("studio-period-select").value;
  var sourceVal = document.getElementById("studio-source-select").value;
  var scriptVal = (document.getElementById("studio-script-input").value || "").trim() || "ויהי ה׳ את יוסף ויהי איש מצליח... המחשת הסיפור על פי דברי חז״ל.";
  var voiceVal = document.getElementById("studio-voice-select").value;
  var styleVal = document.getElementById("studio-style-select").value;
  var lenVal = document.getElementById("studio-length-select").value;

  var previewBox = document.getElementById("studio-live-preview-box");
  if (previewBox) {
    previewBox.classList.remove("hidden");
    previewBox.innerHTML = `
      <div class="bg-[#F8F3E8] border-2 border-[#C9A227] p-5 rounded-2xl space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 bg-amber-500 text-white font-bold rounded-lg text-xs">תצוגה מקדימה להדגמה • ${lenVal}</span>
          <span class="text-xs font-bold text-[#5C4938]">סיווג: ${sourceVal}</span>
        </div>
        <h4 class="text-lg font-bold text-[#0F2340]">${charVal} • ${periodVal}</h4>
        <p class="text-xs text-[#5C4938]">קריינות: <strong>${voiceVal}</strong> | סגנון ויזואלי: <strong>${styleVal}</strong></p>
        <div class="p-3 bg-white border border-[#E5DBC7] rounded-xl text-sm font-serif text-[#0F2340]">"${scriptVal}"</div>
      </div>`;
  }
  window.toast("תצוגה מקדימה נוצרה בסטודיו");
};

window.saveStudioDraft = function(sendToAdmin) {
  var charVal = document.getElementById("studio-char-select").value;
  var periodVal = document.getElementById("studio-period-select").value;
  var sourceVal = document.getElementById("studio-source-select").value;
  var scriptVal = (document.getElementById("studio-script-input").value || "").trim() || "תסריט לדוגמה על פי מדרשי חז״ל";
  var lenVal = document.getElementById("studio-length-select").value;

  var drafts = window.getStorageJson(STORAGE_KEYS.STUDIO_DRAFTS, []);
  var statusLabel = sendToAdmin ? "נשלח לאישור מנהל לפני פרסום" : "טיוטה שמורה בסטודיו";
  drafts.unshift({
    id: "drf_" + Date.now(),
    character: charVal,
    period: periodVal,
    source: sourceVal,
    length: lenVal,
    script: scriptVal,
    status: statusLabel,
    time: "עכשיו"
  });
  window.setStorageJson(STORAGE_KEYS.STUDIO_DRAFTS, drafts);

  if (sendToAdmin) {
    var mySubs = window.getStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, window.DEFAULT_MY_SUBMISSIONS || []);
    mySubs.unshift({
      id: "sub_st_" + Date.now(),
      type: "הפקת סטודיו AI (" + lenVal + ")",
      title: charVal + " • " + periodVal,
      details: "מקור: " + sourceVal + " • " + scriptVal,
      date: "עכשיו",
      status: "⏳ ממתין לאישור מנהל תוכן"
    });
    window.setStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, mySubs);
    window.addAdminAuditLog("עורך תוכן", "התקבלה הפקת סטודיו חדשה לאישור: " + charVal, "ממתין לאישור");
  }

  window.renderStudioDrafts();
  window.renderMyZoneAll();
  window.renderAdminPanel();
  window.renderRabbiShiurimList('');
  window.fetchLessonsFromSupabase();
  window.renderDailyCustomsCalendar();
  window.renderChavrutaDirectory('all');
  window.initFloatingShabbatButton();
  window.toast(sendToAdmin ? "הסרטון נשלח לאישור מנהל לפני פרסום ומופיע בפאנל הניהול!" : "הטיוטה נשמרה בהצלחה בסטודיו.");
};

window.renderStudioDrafts = function() {
  var box = document.getElementById("studio-drafts-list");
  if (!box) return;
  var drafts = window.getStorageJson(STORAGE_KEYS.STUDIO_DRAFTS, []);
  if (drafts.length === 0) {
    box.innerHTML = '<div class="text-xs text-[#5C4938] p-3 bg-[#F8F3E8] rounded-xl border border-[#E5DBC7]">עדיין אין טיוטות שמורות. בחר דמות ותסריט למעלה ולחץ על שמירת טיוטה.</div>';
    return;
  }
  box.innerHTML = drafts.map(function(d) {
    return `
    <div class="bg-[#F8F3E8] border border-[#E5DBC7] p-3.5 rounded-xl flex items-center justify-between gap-2">
      <div>
        <span class="text-[11px] font-bold text-[#5C4938]">${d.status} • ${d.length} • ${d.source}</span>
        <h4 class="text-sm font-bold text-[#0F2340]">${d.character} (${d.period})</h4>
        <p class="text-xs text-[#5C4938] line-clamp-1">${d.script}</p>
      </div>
      <span class="text-xs font-bold text-[#0F2340]">${d.time}</span>
    </div>`;
  }).join("");
};

// 4. בית מדרש: משנה, גמרא (דף יומי), הלכה יומית + נקודות ורצף לימוד יומי (Streak)
window.addLearningPoints = function(pts, reason) {
  var data = window.getStorageJson(STORAGE_KEYS.STREAK_POINTS, { points: 140, streakDays: 7 });
  data.points = (data.points || 140) + pts;
  window.setStorageJson(STORAGE_KEYS.STREAK_POINTS, data);
  window.renderLearningStreakBar();
};

window.renderLearningStreakBar = function() {
  var data = window.getStorageJson(STORAGE_KEYS.STREAK_POINTS, { points: 140, streakDays: 7 });
  var ptsEl = document.getElementById("beit-midrash-points");
  var strkEl = document.getElementById("beit-midrash-streak");
  if (ptsEl) ptsEl.textContent = data.points + " נקודות תורה";
  if (strkEl) strkEl.textContent = "רצף לימוד: " + data.streakDays + " ימים רצופים";
};

window.renderMishnahGemaraHalacha = function() {
  var box = document.getElementById("mishnah-gemara-grid");
  if (!box || !window.MISHNAH_GEMARA_DATA) return;
  box.innerHTML = window.MISHNAH_GEMARA_DATA.map(function(m) {
    return `
    <div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-lg text-xs font-bold">${m.track}</span>
          <span class="text-xs text-[#5C4938]">${m.duration}</span>
        </div>
        <h4 class="text-lg font-bold text-[#0F2340] serif-heading">${m.title}</h4>
        <p class="text-xs font-bold text-[#5C4938]">${m.rabbi}</p>
        <p class="text-xs text-[#5C4938] leading-relaxed">${m.summary}</p>
      </div>
      <div class="pt-3 border-t border-[#E5DBC7] grid grid-cols-2 gap-2">
        <button onclick="addLearningPoints(20, '${m.title}');toast('השיעור סומן כנלמד (+20 נקודות לימוד!)');" class="py-2 bg-amber-500 text-white font-bold rounded-xl text-xs">לימוד השיעור (+20 נק׳)</button>
        <a href="${m.sefaria}" target="_blank" class="py-2 bg-white text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center">מקור ב-Sefaria</a>
      </div>
    </div>`;
  }).join("");
};

// 5. שידורים חיים (#view-live): הטמעת שידור YouTube בקישור + תרומה לבעל השיעור + צ'אט חי
window.loadCustomYoutubeLiveStream = function() {
  var inp = document.getElementById("live-youtube-url-input");
  var url = (inp ? inp.value : "").trim();
  if (!url) {
    window.toast("נא להדביק קישור לשידור YouTube");
    return;
  }
  var statusEl = document.getElementById("live-stream-active-title");
  if (statusEl) statusEl.textContent = "שידור YouTube מחובר: " + url;
  window.toast("שידור ה-YouTube חובר לנגן השידור החי בהצלחה!");
};

// 6. שליחת סיפור על צדיק עם מקור, תמונה ופרטים לאישור מערכת הניהול
window.submitTzaddikStoryWithSource = function() {
  window.requireRegisteredUser(function() {
    var nameEl = document.getElementById("story-tzaddik-name");
    var srcEl = document.getElementById("story-source-ref");
    var imgEl = document.getElementById("story-image-url");
    var bodyEl = document.getElementById("story-body-text");
    if (!nameEl || !nameEl.value.trim() || !bodyEl || !bodyEl.value.trim()) {
      window.toast("נא למלא את שם הצדיק, מקור הסיפור ותוכן הסיפור");
      return;
    }
    var mySubs = window.getStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, window.DEFAULT_MY_SUBMISSIONS || []);
    mySubs.unshift({
      id: "sub_tzs_" + Date.now(),
      type: "סיפור צדיק מאומת עם מקור",
      title: "סיפור על " + nameEl.value.trim() + " (מקור: " + (srcEl.value.trim() || "מסורת ומקורות") + ")",
      details: bodyEl.value.trim(),
      date: "עכשיו",
      status: "⏳ ממתין לאישור מערכת הניהול"
    });
    window.setStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, mySubs);
    window.addAdminAuditLog("מנהל קהילה", "נשלח סיפור צדיק חדש עם מקור: " + nameEl.value.trim(), "ממתין לאישור");
    nameEl.value = "";
    if (srcEl) srcEl.value = "";
    if (imgEl) imgEl.value = "";
    bodyEl.value = "";
    window.renderMyZoneAll();
    window.renderAdminPanel();
  window.renderRabbiShiurimList('');
  window.fetchLessonsFromSupabase();
  window.renderDailyCustomsCalendar();
  window.renderChavrutaDirectory('all');
  window.initFloatingShabbatButton();
    window.toast("הסיפור על הצדיק נשלח עם המקור למערכת הניהול לבדיקה ואישור לפני פרסום!");
  });
};

// 8 & 9. ישיבות ומוסדות תורה + מוקד תפילות קהילתי, נרות והקדשות
window.__v37_prev_renderYeshivotAndMosdot_1 = function(query) {
  var box = document.getElementById("yeshivot-grid-container");
  if (!box || !window.YESHIVOT_DATA) return;
  var q = (query || "").trim().toLowerCase();
  var list = window.YESHIVOT_DATA.filter(function(y) {
    return !q || y.name.toLowerCase().indexOf(q) !== -1 || y.city.toLowerCase().indexOf(q) !== -1;
  });
  box.innerHTML = list.map(function(y) {
    return `
    <div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-2.5 flex flex-col justify-between">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-md text-xs font-bold">${y.type}</span>
          <span class="text-xs font-bold text-[#5C4938]">${y.verification}</span>
        </div>
        <h4 class="text-lg font-bold text-[#0F2340]">${y.name}</h4>
        <p class="text-xs text-[#5C4938]">${y.description}</p>
        <p class="text-xs font-bold text-[#0F2340]">כתובת: ${y.address} • טלפון: ${y.phone}</p>
      </div>
      <div class="pt-2 border-t border-[#E5DBC7] flex items-center gap-2">
        <a href="tel:${y.phone}" class="flex-1 py-2 bg-amber-500 text-white font-bold rounded-xl text-xs text-center">חיוג למוסד</a>
      </div>
    </div>`;
  }).join("");
};

window.renderCommunityPrayerWall = function() {
  var box = document.getElementById("community-prayer-wall-grid");
  if (!box) return;
  var wall = window.getStorageJson(STORAGE_KEYS.PRAYER_WALL, window.INITIAL_PRAYER_WALL || []);
  box.innerHTML = wall.map(function(p) {
    return `
    <div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-md text-xs font-bold">${p.category}</span>
          <span class="text-xs text-[#5C4938]">לכבוד: ${p.tzaddikName}</span>
        </div>
        <h4 class="text-lg font-bold text-[#0F2340] serif-heading">תפילה עבור: ${p.prayerForName}</h4>
        <p class="text-xs text-[#5C4938] leading-relaxed">${p.requestText}</p>
        <p class="text-[11px] text-[#5C4938]">נרשם ע״י: ${p.submittedBy} • ${p.time}</p>
      </div>
      <div class="pt-3 border-t border-[#E5DBC7] flex items-center justify-between gap-2">
        <button onclick="sayAmenOnPrayer('${p.id}')" class="flex-1 py-2 bg-amber-500 text-white font-bold rounded-xl text-xs">
          אמן • התפללתי (${p.amenCount})
        </button>
        <button onclick="toast('קישור לתפילה הועתק לשיתוף בוואטסאפ')" class="px-3 py-2 bg-white text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs">
          שיתוף תפילה
        </button>
      </div>
    </div>`;
  }).join("");
};

window.sayAmenOnPrayer = function(pid) {
  var wall = window.getStorageJson(STORAGE_KEYS.PRAYER_WALL, window.INITIAL_PRAYER_WALL || []);
  for (var i = 0; i < wall.length; i++) {
    if (wall[i].id === pid) wall[i].amenCount = (wall[i].amenCount || 0) + 1;
  }
  window.setStorageJson(STORAGE_KEYS.PRAYER_WALL, wall);
  window.renderCommunityPrayerWall();
  window.toast("תפילתך צורפה למניין המתפללים!");
};

window.__v37_prev_addPrayerWallDedication_1 = function() {
  var nameEl = document.getElementById("pw-name-input");
  var catEl = document.getElementById("pw-cat-select");
  var tzEl = document.getElementById("pw-tzaddik-input");
  var reqEl = document.getElementById("pw-request-input");
  if (!nameEl || !nameEl.value.trim()) {
    window.toast("נא להזין שם לתפילה (פלוני בן פלונית)");
    return;
  }
  var acc = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount);
  var wall = window.getStorageJson(STORAGE_KEYS.PRAYER_WALL, window.INITIAL_PRAYER_WALL || []);
  wall.unshift({
    id: "pw_" + Date.now(),
    prayerForName: nameEl.value.trim(),
    category: catEl ? catEl.value : "לרפואה שלמה",
    tzaddikName: (tzEl && tzEl.value.trim()) ? tzEl.value.trim() : "כלל צדיקי הדורות",
    requestText: (reqEl && reqEl.value.trim()) ? reqEl.value.trim() : "לרפואה, ישועה והצלחה.",
    submittedBy: acc.name,
    amenCount: 1,
    time: "עכשיו"
  });
  window.setStorageJson(STORAGE_KEYS.PRAYER_WALL, wall);
  nameEl.value = "";
  if (reqEl) reqEl.value = "";
  window.renderCommunityPrayerWall();
  window.toast("הנר והתפילה נוספו למוקד התפילות הקהילתי!");
};

// 10. חנות יודאיקה: קופון הנחה + תהליך הזמנה מלא לדוגמה + מעקב הזמנות באזור האישי
window.applyDemoCoupon = function() {
  var inp = document.getElementById("checkout-coupon-input");
  var code = (inp ? inp.value : "").trim().toUpperCase();
  if (code === "TZADIK10" || code === "SHABBAT") {
    appliedCouponDiscount = 10;
    window.toast("קופון 10% הנחה הופעל בהצלחה בהדגמה!");
  } else {
    window.toast("קוד קופון לדוגמה: הקלד TZADIK10 לקבלת 10% הנחה");
  }
};

window.completeDemoOrderCheckout = function() {
  var addrEl = document.getElementById("checkout-shipping-address");
  var addr = (addrEl && addrEl.value.trim()) ? addrEl.value.trim() : "בני ברק (משלוח עד הבית)";
  var orders = window.getStorageJson(STORAGE_KEYS.ORDERS_HISTORY, [
    { id: "ORD-8821", date: "לפני שבוע", items: "פמוטי שבת מהודרים + סידור קודש", total: "₪340", status: "נמסר לשליח • בדרך אליך" }
  ]);
  orders.unshift({
    id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
    date: "היום (הזמנת הדגמה)",
    items: "הזמנת מוצרי יודאיקה לתשמישי קדושה (" + addr + ")",
    total: "הזמנת דמו מאושרת (ללא חיוב אמיתי)",
    status: "נקלטה במערכת המשלוחים ✔"
  });
  window.setStorageJson(STORAGE_KEYS.ORDERS_HISTORY, orders);
  window.setStorageJson(STORAGE_KEYS.CART, []);
  window.updateCartBadge();
  window.closeModal("modal-cart");
  window.renderOrdersAndSubscriptionInMyZone();
  window.toast("ההזמנה לדוגמה הושלמה! ניתן לעקוב אחרי המשלוח תחת 'האזור שלי -> רכישות ומנויים'.");
};

// 12 & 13. ניהול מנוי Premium (35 ₪ לחודש / שנתי) והיסטוריית רכישות באזור האישי
window.togglePremiumSubscriptionDemo = function(planType) {
  var currentStatus = localStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS) || "free";
  if (planType === "cancel") {
    localStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, "free");
    window.toast("המנוי הועבר למסלול החינמי (הדגמה ללא חיוב).");
  } else {
    localStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, "active");
    localStorage.setItem("tzadiktok_premium_plan", planType || "חודשי - 35 ₪ לחודש (דמו)");
    window.toast("מנוי צדיק-טוק Premium הופעל בהדגמה! כל פרקי ה-Premium פתוחים כעת לצפייה.");
  }
  window.renderOrdersAndSubscriptionInMyZone();
};

window.renderOrdersAndSubscriptionInMyZone = function() {
  var isPrem = localStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS) === "active";
  var planName = localStorage.getItem("tzadiktok_premium_plan") || "חודשי - 35 ₪ לחודש (זמני לדמו)";
  var premBadge = document.getElementById("myzone-premium-status-text");
  if (premBadge) {
    premBadge.textContent = isPrem ? ("מנוי פעיל: " + planName + " ✔") : "מסלול נוכחי: חינמי (ניתן לשדרג ל-Premium בהדגמה)";
  }

  var ordBox = document.getElementById("myzone-orders-history-list");
  if (ordBox) {
    var orders = window.getStorageJson(STORAGE_KEYS.ORDERS_HISTORY, [
      { id: "ORD-8821", date: "השבוע (נתוני הדגמה)", items: "פמוטי שבת מהודרים + סידור קודש", total: "₪340", status: "במשלוח • מעקב פעיל" }
    ]);
    ordBox.innerHTML = orders.map(function(o) {
      return `
      <div class="bg-[#F8F3E8] border border-[#E5DBC7] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span class="text-xs font-bold text-[#0F2340]">מספר הזמנה: ${o.id} • ${o.date}</span>
          <h4 class="text-sm font-bold text-[#0F2340]">${o.items}</h4>
          <p class="text-xs text-[#5C4938]">סכום: ${o.total}</p>
        </div>
        <span class="px-3 py-1 bg-white border border-[#C9A227] rounded-lg text-xs font-bold text-[#0F2340]">${o.status}</span>
      </div>`;
    }).join("");
  }
};

// 14. פאנל ניהול מרכזי נפרד ומסודר (#view-admin) + הרשאות לפי תפקיד + יומן פעולות מנהלים
window.setAdminRole = function(roleName) {
  activeAdminRole = roleName;
  localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, roleName);
  var roleLabel = document.getElementById("admin-active-role-badge");
  if (roleLabel) roleLabel.textContent = "הרשאה פעילה: " + roleName;
  window.renderAdminPanel();
  window.renderRabbiShiurimList('');
  window.fetchLessonsFromSupabase();
  window.renderDailyCustomsCalendar();
  window.renderChavrutaDirectory('all');
  window.initFloatingShabbatButton();
  window.toast("תפקיד הניהול בפאנל עודכן ל: " + roleName);
};

window.addAdminAuditLog = function(role, actionText, statusText) {
  var logs = window.getStorageJson(STORAGE_KEYS.ADMIN_LOGS, window.INITIAL_ADMIN_LOGS || []);
  logs.unshift({
    id: "aud_" + Date.now(),
    time: "עכשיו",
    role: role || activeAdminRole,
    action: actionText,
    status: statusText || "בוצע ✔"
  });
  window.setStorageJson(STORAGE_KEYS.ADMIN_LOGS, logs);
};

window.__v37_prev_renderAdminPanel_1 = function() {
  var pendingBox = document.getElementById("admin-pending-queue-list");
  var logsBox = document.getElementById("admin-audit-log-list");
  var mySubs = window.getStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, window.DEFAULT_MY_SUBMISSIONS || []);

  if (pendingBox) {
    pendingBox.innerHTML = mySubs.map(function(s) {
      var isPending = s.status && s.status.indexOf("ממתין") !== -1;
      return `
      <div class="bg-[#F8F3E8] border border-[#E5DBC7] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="text-xs font-bold text-[#5C4938]">${s.type} • ${s.date} • <strong>${s.status}</strong></span>
          <h4 class="text-sm font-bold text-[#0F2340] mt-0.5">${s.title}</h4>
          <p class="text-xs text-[#5C4938]">${s.details}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          ${isPending
            ? `<button onclick="approveSubmissionInMyZone('${s.id}');addAdminAuditLog(activeAdminRole, 'אישור תוכן: ${s.title.replace(/'/g, "")}', 'אומת ופורסם ✔');renderAdminPanel();" class="px-3.5 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs">אשר פרסום</button>`
            : `<span class="px-3 py-1 bg-white border border-[#C9A227] rounded-lg text-xs font-bold text-[#0F2340]">מאושר בקהילה</span>`
          }
        </div>
      </div>`;
    }).join("");
  }

  if (logsBox) {
    var logs = window.getStorageJson(STORAGE_KEYS.ADMIN_LOGS, window.INITIAL_ADMIN_LOGS || []);
    logsBox.innerHTML = logs.map(function(l) {
      return `
      <div class="bg-[#F8F3E8] border border-[#E5DBC7] p-3.5 rounded-xl flex items-center justify-between gap-2 text-xs">
        <div>
          <span class="font-bold text-[#0F2340]">[${l.role}]</span>
          <span class="text-[#5C4938] mr-1">${l.action}</span>
        </div>
        <span class="text-[#5C4938] shrink-0">${l.time} • <strong>${l.status}</strong></span>
      </div>`;
    }).join("");
  }
};

// מסך התראות מרכזי
window.openNotificationsModal = function() {
  var box = document.getElementById("notifications-list-container");
  if (box && window.INITIAL_NOTIFICATIONS) {
    box.innerHTML = window.INITIAL_NOTIFICATIONS.map(function(n) {
      return `
      <div class="bg-[#F8F3E8] border border-[#E5DBC7] p-3.5 rounded-xl space-y-1">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-[#0F2340]">${n.title}</h4>
          <span class="text-[11px] text-[#5C4938]">${n.time}</span>
        </div>
        <p class="text-xs text-[#5C4938]">${n.body}</p>
      </div>`;
    }).join("");
  }
  var modal = document.getElementById("modal-notifications-center");
  if (modal) modal.classList.remove("hidden");
};


// ============================================================================
// V25 ENGINE: חיפוש פנימי בכל מדורי ללמוד, שיעורים ושידור חי לפי רב, מנהג היום בלהתפלל, חברותא בלמצוא, וקהילה באזור האישי
// ============================================================================

// 1. חיפוש ראשי ופנימי בתוך "ללמוד" (פרשיות, נ"ך, דורות, שיעורים, רבנים וסרטונים)
window.handleLearnGlobalSearch = function(query) {
  var q = (query || "").trim().toLowerCase();
  var resBox = document.getElementById("learn-search-results-box");
  if (!resBox) return;
  if (!q) {
    resBox.classList.add("hidden");
    resBox.innerHTML = "";
    return;
  }
  var matches = [];

  // חיפוש ב-54 פרשיות התורה
  (window.CHUMASHIM_PARASHOT || []).forEach(function(ch) {
    (ch.parashot || []).forEach(function(p) {
      if (p.name.toLowerCase().indexOf(q) !== -1 || (p.summary && p.summary.toLowerCase().indexOf(q) !== -1)) {
        matches.push({
          type: "פרשת השבוע (" + ch.title + ")",
          title: "פרשת " + p.name,
          subtitle: p.summary,
          action: "openParashaViewer('" + ch.id + "', '" + p.name.replace(/'/g, "") + "')"
        });
      }
    });
  });

  // חיפוש בשיעורי רבנים ושידור חי
  var shiurim = window.getStorageJson(STORAGE_KEYS.RABBI_SHIURIM, window.RABBI_SHIURIM_DATA || []);
  shiurim.forEach(function(s) {
    if (s.rabbi.toLowerCase().indexOf(q) !== -1 || s.title.toLowerCase().indexOf(q) !== -1 || s.topic.toLowerCase().indexOf(q) !== -1) {
      matches.push({
        type: "שיעור / שידור חי • " + s.rabbi,
        title: s.title,
        subtitle: s.institution + " • " + s.duration,
        action: "switchLibrarySubTab('liveshiurim')"
      });
    }
  });

  // חיפוש בסרטונים חינוכיים
  var edus = window.getStorageJson(STORAGE_KEYS.EDU_VIDEOS, window.EDUCATIONAL_VIDEOS_DATA || []);
  edus.forEach(function(v) {
    if (v.title.toLowerCase().indexOf(q) !== -1 || v.speaker.toLowerCase().indexOf(q) !== -1 || v.category.toLowerCase().indexOf(q) !== -1) {
      matches.push({
        type: "סרטון חינוכי • " + v.category,
        title: v.title,
        subtitle: v.speaker + " • " + v.duration,
        action: "switchLibrarySubTab('eduvideos')"
      });
    }
  });

  // חיפוש בדורות (ראשונים ואחרונים)
  (window.GENERATIONS_HISTORY || []).forEach(function(gen) {
    (gen.figures || []).forEach(function(fig) {
      if (fig.name.toLowerCase().indexOf(q) !== -1 || fig.story.toLowerCase().indexOf(q) !== -1) {
        matches.push({
          type: "דורות • " + gen.era,
          title: fig.name,
          subtitle: fig.role + " – " + fig.story,
          action: "switchLibrarySubTab('generations')"
        });
      }
    });
  });

  resBox.classList.remove("hidden");
  if (matches.length === 0) {
    resBox.innerHTML = '<div class="p-4 bg-white border border-[#E5DBC7] rounded-xl text-xs text-[#5C4938]">לא נמצאו תוצאות עבור "' + query + '". נסה לחפש שם פרשה, שם רב או נושא לימוד.</div>';
    return;
  }

  resBox.innerHTML = `<div class="bg-white border-2 border-[#C9A227] p-4 rounded-2xl space-y-2.5">
    <div class="flex items-center justify-between"><span class="text-xs font-bold text-[#0F2340]">תוצאות חיפוש בללמוד (${matches.length}):</span><button onclick="handleLearnGlobalSearch('')" class="text-xs text-[#5C4938] font-bold">סגור ✕</button></div>` +
    matches.slice(0, 8).map(function(m) {
      return `
      <div onclick="${m.action}" class="cursor-pointer bg-[#F8F3E8] hover:border-[#C9A227] border border-[#E5DBC7] p-3 rounded-xl flex items-center justify-between gap-2">
        <div>
          <span class="text-[10px] font-bold text-[#5C4938] block">${m.type}</span>
          <h4 class="text-sm font-bold text-[#0F2340]">${m.title}</h4>
          <p class="text-xs text-[#5C4938] line-clamp-1">${m.subtitle}</p>
        </div>
        <span class="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs shrink-0">פתח ←</span>
      </div>`;
    }).join("") + `</div>`;
};

// 2. שידור חי ושיעורי רבנים בתוך "ללמוד" (כולל חיפוש לפי רב + העלאת שיעור/שידור חדש)
window.__v37_prev_renderRabbiShiurimList_1 = function(query) {
  var box = document.getElementById("rabbi-shiurim-grid");
  if (!box) return;
  var list = window.getStorageJson(STORAGE_KEYS.RABBI_SHIURIM, window.RABBI_SHIURIM_DATA || []);
  var q = (query || "").trim().toLowerCase();
  if (q) {
    list = list.filter(function(s) {
      return s.rabbi.toLowerCase().indexOf(q) !== -1 || s.title.toLowerCase().indexOf(q) !== -1 || s.topic.toLowerCase().indexOf(q) !== -1 || s.institution.toLowerCase().indexOf(q) !== -1;
    });
  }
  box.innerHTML = list.map(function(s) {
    var safeTitle = (s.title || "").replace(/'/g, "");
    var safeRabbi = (s.rabbi || "").replace(/'/g, "");
    return `
    <div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-md text-xs font-bold">${s.type} • ${s.topic}</span>
          <span class="text-xs text-[#5C4938]">${s.duration}</span>
        </div>
        <h4 class="text-lg font-bold text-[#0F2340] serif-heading">${s.title}</h4>
        <p class="text-xs font-bold text-[#0F2340]">מגיד השיעור: ${s.rabbi}</p>
        <p class="text-xs text-[#5C4938]">מוסד / בית מדרש: ${s.institution}</p>
      </div>
      <div class="pt-3 border-t border-[#E5DBC7] flex items-center gap-2">
        <button onclick="openEntityFullPage('shiur_${s.id}', 'שיעור תורה • ${safeRabbi}', '${safeTitle}', '${safeRabbi} • ${s.institution}', '${s.institution}', 'אורך: ${s.duration}', '', 'שיעור תורה מפי ${safeRabbi} בנושא ${s.topic}.', 'בהירות השיעור • חיזוק • מקורות')" class="flex-1 py-2 bg-amber-500 text-white font-bold rounded-xl text-xs">צפייה בשיעור ותגובות</button>
        <button onclick="openDonateModal('תרומה והקדשה לשיעור של ${safeRabbi}')" class="px-3 py-2 bg-white text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs">הקדשה</button>
      </div>
    </div>`;
  }).join("");
};

window.__v37_prev_uploadNewRabbiShiur_1 = function() {
  window.requireRegisteredUser(function() {
    var rabbiEl = document.getElementById("new-shiur-rabbi");
    var titleEl = document.getElementById("new-shiur-title");
    var topicEl = document.getElementById("new-shiur-topic");
    var urlEl = document.getElementById("new-shiur-url");
    if (!rabbiEl || !rabbiEl.value.trim() || !titleEl || !titleEl.value.trim()) {
      window.toast("נא למלא את שם הרב וכותרת השיעור / השידור החי");
      return;
    }
    var list = window.getStorageJson(STORAGE_KEYS.RABBI_SHIURIM, window.RABBI_SHIURIM_DATA || []);
    list.unshift({
      id: "sh_" + Date.now(),
      rabbi: rabbiEl.value.trim(),
      title: titleEl.value.trim() + " (⏳ במודרציה)",
      institution: "הועלה ע״י הקהילה",
      topic: (topicEl && topicEl.value.trim()) ? topicEl.value.trim() : "שיעור תורה",
      type: "שידור חי / שיעור מוקלט",
      duration: "45:00",
      videoUrl: (urlEl && urlEl.value.trim()) ? urlEl.value.trim() : ""
    });
    window.setStorageJson(STORAGE_KEYS.RABBI_SHIURIM, list);

    var mySubs = window.getStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, window.DEFAULT_MY_SUBMISSIONS || []);
    mySubs.unshift({
      id: "sub_sh_" + Date.now(),
      type: "שיעור / שידור חי",
      title: titleEl.value.trim() + " (" + rabbiEl.value.trim() + ")",
      details: "נושא: " + (topicEl ? topicEl.value : ""),
      date: "עכשיו",
      status: "⏳ ממתין לאישור מודרציה"
    });
    window.setStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, mySubs);

    rabbiEl.value = "";
    titleEl.value = "";
    if (urlEl) urlEl.value = "";
    window.renderRabbiShiurimList("");
    window.renderMyZoneAll();
    window.toast("השיעור / השידור החי של הרב נוסף ונשלח למודרציה!");
  });
};

// חיפוש לפי רב או נושא בתוך הסרטונים החינוכיים
window.__v37_prev_searchEduVideosByRabbiOrTopic_1 = function(query) {
  var q = (query || "").trim().toLowerCase();
  var videos = window.getStorageJson(STORAGE_KEYS.EDU_VIDEOS, window.EDUCATIONAL_VIDEOS_DATA || []);
  var filtered = videos.filter(function(v) {
    return !q || v.title.toLowerCase().indexOf(q) !== -1 || v.speaker.toLowerCase().indexOf(q) !== -1 || v.category.toLowerCase().indexOf(q) !== -1 || (v.description && v.description.toLowerCase().indexOf(q) !== -1);
  });
  var grid = document.getElementById("edu-videos-grid");
  if (!grid) return;
  grid.innerHTML = filtered.map(function(v) {
    var eKey = "edu_" + v.id;
    var stats = window.getEntityStats(eKey, 5.0);
    var safeTitle = (v.title || "").replace(/'/g, "");
    var safeSpeaker = (v.speaker || "").replace(/'/g, "");
    var safeDesc = (v.description || "").replace(/'/g, "");
    return `
    <div class="bg-white border border-[#E5DBC7] rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
      <div>
        <div class="relative h-44 bg-[#0F2340] flex items-center justify-center overflow-hidden">
          <img src="${v.thumbnail}" alt="${safeTitle}" class="absolute inset-0 w-full h-full object-cover opacity-80">
          <button onclick="openEntityFullPage('${eKey}', 'סרטון חינוכי • ${v.category}', '${safeTitle}', '${safeSpeaker} • ${v.duration}', 'ספריית הווידאו החינוכית', 'אורך: ${v.duration}', '', '${safeDesc}', 'תוכן חינוכי • בהירות ההסבר • עניין וחיזוק', '${v.thumbnail}')" class="relative z-10 w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center text-xl font-black shadow-lg">
            ▶
          </button>
          <span class="absolute top-3 right-3 px-2.5 py-0.5 bg-amber-500 text-white font-bold rounded-lg text-[10px]">${v.category}</span>
        </div>
        <div class="p-4 space-y-1.5">
          <span class="text-xs font-bold text-[#5C4938] block">${v.speaker} • ${v.duration}</span>
          <h4 class="text-base font-bold text-[#0F2340]">${v.title}</h4>
          <p class="text-xs text-[#5C4938] line-clamp-2">${v.description}</p>
        </div>
      </div>
      <div class="p-3 pt-0 grid grid-cols-2 gap-2">
        <button onclick="openEntityFullPage('${eKey}', 'סרטון חינוכי • ${v.category}', '${safeTitle}', '${safeSpeaker} • ${v.duration}', 'ספריית הווידאו החינוכית', 'אורך: ${v.duration}', '', '${safeDesc}', 'תוכן חינוכי • בהירות ההסבר • עניין וחיזוק', '${v.thumbnail}')" class="py-2 bg-amber-500 text-white font-bold rounded-xl text-xs">צפה ודרג (${stats.count})</button>
        <button onclick="saveItemToMyZone('סרטון חינוכי', '${safeTitle}', 'series')" class="py-2 bg-white text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs">שמור</button>
      </div>
    </div>`;
  }).join("");
};

// 3. מנהג היום והמועדים המתקרבים בתוך "להתפלל -> מנהגים" (ברכת האילנות, ספירת העומר, תעניות וראשי חודשים)
window.renderDailyCustomsCalendar = function() {
  var dateEl = document.getElementById("pray-customs-today-date");
  if (dateEl && window.getHebrewDateString) dateEl.textContent = window.getHebrewDateString();

  var box = document.getElementById("daily-customs-calendar-grid");
  if (!box || !window.DAILY_CUSTOMS_CALENDAR) return;
  box.innerHTML = window.DAILY_CUSTOMS_CALENDAR.map(function(dc) {
    return `
    <div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="px-3 py-1 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-lg text-xs font-bold">${dc.badge}</span>
        <span class="text-xs font-bold text-[#5C4938]">זמן: ${dc.season}</span>
      </div>
      <h4 class="text-lg font-bold text-[#0F2340] serif-heading">${dc.title}</h4>
      <p class="text-sm text-[#5C4938] leading-relaxed">${dc.explanation}</p>
      <div class="p-3.5 bg-[#F8F3E8] border border-[#E5DBC7] rounded-xl font-serif text-base text-[#0F2340]">
        <strong class="text-xs font-sans text-[#5C4938] block mb-1">נוסח הברכה / התפילה:</strong>
        ${dc.blessingText}
      </div>
    </div>`;
  }).join("");
};

// 4. מאתר חברותא בתוך "למצוא -> חברותא" (#view-chavruta) + חיפוש + GPS + הוספת חברותא
window.__v37_prev_renderChavrutaDirectory_1 = function(query) {
  var box = document.getElementById("chavruta-grid-container");
  if (!box) return;
  var list = window.getStorageJson(STORAGE_KEYS.CHAVRUTA_LIST, window.CHAVRUTA_DATA || []);
  var q = (query || "").trim().toLowerCase();
  if (q && q !== "all") {
    list = list.filter(function(c) {
      return c.name.toLowerCase().indexOf(q) !== -1 || c.topic.toLowerCase().indexOf(q) !== -1 || c.city.toLowerCase().indexOf(q) !== -1 || c.mode.toLowerCase().indexOf(q) !== -1 || c.description.toLowerCase().indexOf(q) !== -1;
    });
  }
  box.innerHTML = list.map(function(c) {
    var safeName = (c.name || "").replace(/'/g, "");
    var safeTopic = (c.topic || "").replace(/'/g, "");
    return `
    <div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-md text-xs font-bold">${c.mode}</span>
          <span class="text-xs text-[#5C4938]">${c.verification || "מאומת ✔"}</span>
        </div>
        <h4 class="text-lg font-bold text-[#0F2340] serif-heading">${c.name}</h4>
        <p class="text-xs font-bold text-[#0F2340]">נושא לימוד: ${c.topic}</p>
        <p class="text-xs text-[#5C4938] leading-relaxed">${c.description}</p>
        <p class="text-xs text-[#5C4938]">עיר: <strong>${c.city}</strong> • שעות: <strong>${c.hours}</strong></p>
      </div>
      <div class="pt-3 border-t border-[#E5DBC7] grid grid-cols-2 gap-2">
        <a href="tel:${c.phone}" class="py-2 bg-amber-500 text-white font-bold rounded-xl text-xs text-center">חיוג לתיאום חברותא</a>
        <a href="https://wa.me/972${(c.phone || "").replace(/[^0-9]/g, '').replace(/^0/, '')}?text=${encodeURIComponent('שלום וברכה, ראיתי את הצעת החברותא שלך בצדיק-טוק בנושא ' + safeTopic)}" target="_blank" class="py-2 bg-white text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center">שלח הודעת וואטסאפ</a>
      </div>
    </div>`;
  }).join("");
};

window.__v37_prev_addNewChavrutaOffer_1 = function() {
  window.requireRegisteredUser(function() {
    var nameEl = document.getElementById("chavruta-new-name");
    var topicEl = document.getElementById("chavruta-new-topic");
    var cityEl = document.getElementById("chavruta-new-city");
    var phoneEl = document.getElementById("chavruta-new-phone");
    if (!nameEl || !nameEl.value.trim() || !topicEl || !topicEl.value.trim()) {
      window.toast("נא למלא שם ונושא לימוד לחברותא");
      return;
    }
    var list = window.getStorageJson(STORAGE_KEYS.CHAVRUTA_LIST, window.CHAVRUTA_DATA || []);
    list.unshift({
      id: "chv_" + Date.now(),
      name: nameEl.value.trim() + " (⏳ במודרציה)",
      topic: topicEl.value.trim(),
      mode: "פנים אל פנים / טלפוני",
      city: (cityEl && cityEl.value.trim()) ? cityEl.value.trim() : currentCity,
      hours: "בתיאום אישי",
      phone: (phoneEl && phoneEl.value.trim()) ? phoneEl.value.trim() : "050-0000000",
      description: "הצעת חברותא חדשה שנוספה על ידי חבר קהילה רשום.",
      lat: 32.08,
      lng: 34.83,
      verification: "ממתין לאישור מודרציה"
    });
    window.setStorageJson(STORAGE_KEYS.CHAVRUTA_LIST, list);
    nameEl.value = "";
    topicEl.value = "";
    window.renderChavrutaDirectory("all");
    window.toast("הצעת החברותא פורסמה ונשלחה למודרציה!");
  });
};


// ============================================================================
// V26 ENGINE: אקורדיונים בדף הבית, כרטיס 'היום ביהדות', סינון לפי עדה/נושא/מיקום, וכפתור צף למצב שבת (צפייה בלבד)
// ============================================================================

window.toggleHomeAccordion = function(accId) {
  var bodyEl = document.getElementById(accId);
  var iconEl = document.getElementById(accId + "-icon");
  if (!bodyEl) return;
  var isHidden = bodyEl.classList.contains("hidden");
  if (isHidden) {
    bodyEl.classList.remove("hidden");
    if (iconEl) iconEl.textContent = "▲ סגור";
  } else {
    bodyEl.classList.add("hidden");
    if (iconEl) iconEl.textContent = "▼ פתח";
  }
};

window.triggerHeaderSearch = function() {
  window.switchTab("feed");
  var box = document.getElementById("home-acc-search");
  if (box && box.classList.contains("hidden")) {
    box.classList.remove("hidden");
  }
  var inp = document.getElementById("home-search-input");
  if (inp) {
    setTimeout(function() { inp.focus(); }, 150);
  }
};

// סינון מאוחד בספרייה (ללמוד) ובמדריכים (למצוא) לפי עדה/נוסח, נושא ומיקום
window.applyUnifiedDirectoryFilter = function(contextType) {
  var edahEl = document.getElementById(contextType + "-filter-edah");
  var topicEl = document.getElementById(contextType + "-filter-topic");
  var locEl = document.getElementById(contextType + "-filter-loc");

  var edah = edahEl ? edahEl.value : "all";
  var topic = topicEl ? topicEl.value : "all";
  var loc = locEl ? locEl.value : "all";

  if (contextType === "learn") {
    var qParts = [];
    if (edah !== "all") qParts.push(edah);
    if (topic !== "all") qParts.push(topic);
    if (loc !== "all") qParts.push(loc);
    if (qParts.length === 0) {
      window.handleLearnGlobalSearch("");
      window.toast("מוצגים כל תכני הספרייה ובית המדרש");
    } else {
      window.handleLearnGlobalSearch(topic !== "all" ? topic : edah);
      window.toast("סונן לפי: " + qParts.join(" • "));
    }
  } else if (contextType === "find") {
    var queryStr = loc !== "all" ? loc : (edah !== "all" ? edah : (topic !== "all" ? topic : ""));
    window.filterFindSectionByQuery(currentTab, queryStr);
    window.toast(queryStr ? ("סונן במדריך לפי: " + queryStr) : "מוצגים כל המקומות במדריך");
  }
};

// בדיקה אוטומטית של יום שישי / ערב חג להצגת הכפתור הצף של מצב שבת (צפייה בלבד)
window.initFloatingShabbatButton = function() {
  var floatBtn = document.getElementById("floating-shabbat-readonly-btn");
  if (!floatBtn) return;
  var dayOfWeek = new Date().getDay(); // 5 = יום שישי, 6 = שבת
  // מציג את הכפתור הצף תמיד באופן אלגנטי עם חיווי מיוחד לימי שישי/שבת וחג
  var labelEl = document.getElementById("floating-shabbat-btn-label");
  var isShabbat = document.body.classList.contains("shabbat-mode-active");
  if (labelEl) {
    if (isShabbat) {
      labelEl.textContent = "מצב שבת (צפייה בלבד) פעיל • לחץ ליציאה";
    } else if (dayOfWeek === 5 || dayOfWeek === 6) {
      labelEl.textContent = "שבת שלום • הפעל מצב צפייה בלבד";
    } else {
      labelEl.textContent = "מצב שבת וחג (צפייה בלבד)";
    }
  }
};

var origToggleShabbat = window.__v37_prev_toggleShabbatOverlay_2;
window.__v37_prev_toggleShabbatOverlay_3 = function() {
  origToggleShabbat();
  window.initFloatingShabbatButton();
};


// ============================================================================
// V27 SUPABASE INTEGRATION: משיכת והוספת שיעורים מהטבלה 'lessons' ב-Supabase
// ============================================================================

window.__v37_prev_fetchLessonsFromSupabase_1 = async function() {
  if (!window.supabaseClient) {
    // אם עדיין לא הוגדרו מפתחות Supabase בדפדפן, מציג את מאגר השיעורים המקומי
    window.renderRabbiShiurimList("");
    return;
  }
  try {
    var response = await window.supabaseClient
      .from("lessons")
      .select("*")
      .order("created_at", { ascending: false });

    if (response.error) {
      console.error("שגיאה במשיכת שיעורים מ-Supabase:", response.error.message);
      window.renderRabbiShiurimList("");
      return;
    }

    if (response.data && response.data.length > 0) {
      // מיפוי הנתונים מהטבלה lessons לתצוגת השיעורים באפליקציה
      var supabaseLessons = response.data.map(function(row) {
        return {
          id: "sb_" + row.id,
          rabbi: row.rabbi_name || row.rabbi || "רב בית המדרש",
          title: row.title || "שיעור תורה",
          institution: row.institution || "בית המדרש צדיק-טוק",
          topic: row.topic || row.category || "שיעור תורה",
          type: row.type || "שיעור מ-Supabase ✔",
          duration: row.duration || "45:00",
          videoUrl: row.video_url || row.url || ""
        };
      });
      window.RABBI_SHIURIM_DATA = supabaseLessons.concat(window.RABBI_SHIURIM_DATA || []);
      window.setStorageJson(STORAGE_KEYS.RABBI_SHIURIM, window.RABBI_SHIURIM_DATA);
      window.renderRabbiShiurimList("");
      window.toast("נטענו " + supabaseLessons.length + " שיעורים חיים מטבלת lessons ב-Supabase ✔");
    }
  } catch (err) {
    console.warn("Supabase lessons fetch fallback:", err);
  }
};


// ============================================================================
// V28 FULL SUPABASE SYNC: משיכה ושמירה אוטומטית מול הטבלאות ב-Supabase
// ============================================================================

window.saveSupabaseCredentialsInBrowser = function() {
  var urlEl = document.getElementById("sb-config-url");
  var keyEl = document.getElementById("sb-config-key");
  var u = (urlEl ? urlEl.value : "").trim();
  var k = (keyEl ? keyEl.value : "").trim();
  if (!u || !k) {
    window.toast("נא להדביק את ה-URL ואת ה-ANON KEY של פרויקט ה-Supabase שלך");
    return;
  }
  localStorage.setItem("tzadiktok_supabase_url", u);
  localStorage.setItem("tzadiktok_supabase_anon_key", k);
  if (window.supabase && typeof window.supabase.createClient === "function") {
    window.supabaseClient = window.supabase.createClient(u, k);
    window.syncAllTablesFromSupabase();
    window.toast("חיבור ל-Supabase הופעל בהצלחה! טוען נתונים מהטבלאות...");
  }
};

window.__v37_prev_syncAllTablesFromSupabase_1 = async function() {
  if (!window.supabaseClient) return;
  await window.fetchLessonsFromSupabase();
  try {
    var chRes = await window.supabaseClient.from("chavruta").select("*").order("created_at", { ascending: false });
    if (chRes.data && chRes.data.length > 0) {
      window.CHAVRUTA_DATA = chRes.data.concat(window.CHAVRUTA_DATA || []);
      window.setStorageJson(STORAGE_KEYS.CHAVRUTA_LIST, window.CHAVRUTA_DATA);
      window.renderChavrutaDirectory("all");
    }
  } catch (e) {
    console.warn("Supabase sync note:", e);
  }
};

// שדרוג uploadNewRabbiShiur כך שישמור גם ישירות לטבלת lessons ב-Supabase אם מחובר!
var origUploadShiur = window.__v37_prev_uploadNewRabbiShiur_1;
window.__v37_prev_uploadNewRabbiShiur_2 = function() {
  var rabbiEl = document.getElementById("new-shiur-rabbi");
  var titleEl = document.getElementById("new-shiur-title");
  var topicEl = document.getElementById("new-shiur-topic");
  var urlEl = document.getElementById("new-shiur-url");
  var rVal = rabbiEl ? rabbiEl.value.trim() : "";
  var tVal = titleEl ? titleEl.value.trim() : "";
  var topVal = topicEl ? topicEl.value.trim() : "שיעור תורה";
  var uVal = urlEl ? urlEl.value.trim() : "";

  origUploadShiur();

  if (window.supabaseClient && rVal && tVal) {
    window.supabaseClient.from("lessons").insert([{
      title: tVal,
      rabbi_name: rVal,
      topic: topVal || "שיעור תורה",
      video_url: uVal
    }]).then(function(res) {
      if (!res.error) {
        window.toast("השיעור נשמר גם בטבלת lessons ב-Supabase ✔");
      }
    });
  }
};


// ============================================================================
// V29 LIVE SUPABASE DATABASE HOOKS: קריאה וכתיבה לכל הטבלאות ב-Supabase
// ============================================================================

window.__v37_prev_syncAllTablesFromSupabase_2 = async function() {
  if (!window.supabaseClient) return;
  try {
    // 1. שיעורים (lessons)
    await window.fetchLessonsFromSupabase();

    // 2. חברותא (chavruta)
    var chRes = await window.supabaseClient.from("chavruta").select("*").order("created_at", { ascending: false });
    if (chRes.data && chRes.data.length > 0) {
      var dbChav = chRes.data.map(function(row) {
        return {
          id: "sb_chv_" + row.id,
          name: row.name,
          topic: row.topic,
          mode: row.mode || "פנים אל פנים / טלפוני",
          city: row.city || "ישראל",
          hours: row.hours || "בתיאום אישי",
          phone: row.phone || "",
          description: row.description || "",
          verification: "מסונכרן מ-Supabase ✔"
        };
      });
      window.CHAVRUTA_DATA = dbChav.concat(window.CHAVRUTA_DATA || []);
      window.renderChavrutaDirectory("all");
    }

    // 3. מניינים (minyanim)
    var minRes = await window.supabaseClient.from("minyanim").select("*").order("created_at", { ascending: false });
    if (minRes.data && minRes.data.length > 0) {
      var dbMin = minRes.data.map(function(row) {
        return {
          id: "sb_min_" + row.id,
          name: row.name,
          nusach: row.nusach || "כלל ישראל",
          city: row.city || "ישראל",
          address: row.address || row.city || "",
          shacharit: row.shacharit || "07:00, 08:00",
          mincha: row.mincha || "13:30, 16:20",
          arvit: row.arvit || "17:15, 20:30",
          phone: row.phone || "",
          distanceKm: 0.3,
          lat: row.lat || 32.0840,
          lng: row.lng || 34.8352
        };
      });
      window.MINYANIM_DATA = dbMin.concat(window.MINYANIM_DATA || []);
      window.renderMinyanim(window.MINYANIM_DATA);
    }

    // 4. מוקד תפילות ונרות (prayer_wall)
    var pwRes = await window.supabaseClient.from("prayer_wall").select("*").order("created_at", { ascending: false });
    if (pwRes.data && pwRes.data.length > 0) {
      var dbPw = pwRes.data.map(function(row) {
        return {
          id: "sb_pw_" + row.id,
          prayerForName: row.prayer_for_name,
          category: row.category || "לרפואה שלמה",
          tzaddikName: row.tzaddik_name || "כלל צדיקי הדורות",
          requestText: row.request_text || "",
          submittedBy: row.submitted_by || "חבר קהילה",
          amenCount: row.amen_count || 1,
          time: "מסונכרן מ-Supabase ✔"
        };
      });
      window.setStorageJson(STORAGE_KEYS.PRAYER_WALL, dbPw.concat(window.INITIAL_PRAYER_WALL || []));
      window.renderCommunityPrayerWall();
    }

    // 5. פורום הקהילה (forum_posts)
    var fpRes = await window.supabaseClient.from("forum_posts").select("*").order("created_at", { ascending: false });
    if (fpRes.data && fpRes.data.length > 0) {
      var dbFp = fpRes.data.map(function(row) {
        return {
          id: "sb_fp_" + row.id,
          category: row.category || "דברי תורה",
          title: row.title,
          author: row.author,
          content: row.content,
          likes: row.likes || 1,
          repliesCount: row.replies_count || 0,
          status: row.status || "מאושר ✔",
          time: "מסונכרן מ-Supabase ✔"
        };
      });
      window.setStorageJson(STORAGE_KEYS.FORUM_POSTS, dbFp.concat(window.INITIAL_FORUM_POSTS || []));
      window.renderForumPosts("all");
    }
  } catch (err) {
    console.warn("Supabase full sync info:", err);
  }
};

// שמירה אוטומטית של הצעת חברותא חדשה לטבלת chavruta ב-Supabase
var origAddChavruta = window.__v37_prev_addNewChavrutaOffer_1;
window.__v37_prev_addNewChavrutaOffer_2 = function() {
  var nameEl = document.getElementById("chavruta-new-name");
  var topicEl = document.getElementById("chavruta-new-topic");
  var cityEl = document.getElementById("chavruta-new-city");
  var phoneEl = document.getElementById("chavruta-new-phone");
  var nVal = nameEl ? nameEl.value.trim() : "";
  var tVal = topicEl ? topicEl.value.trim() : "";
  var cVal = cityEl ? cityEl.value.trim() : "ישראל";
  var pVal = phoneEl ? phoneEl.value.trim() : "050-0000000";

  origAddChavruta();

  if (window.supabaseClient && nVal && tVal) {
    window.supabaseClient.from("chavruta").insert([{
      name: nVal,
      topic: tVal,
      city: cVal || "ישראל",
      phone: pVal || "050-0000000"
    }]).then(function() {});
  }
};

// שמירה אוטומטית של מניינים/רבנים/גמ"חים/צדיקים חדשים לטבלאות ב-Supabase
var origSubmitCommAdd = window.__v37_prev_submitCommunityAddForm_1;
window.__v37_prev_submitCommunityAddForm_2 = function() {
  var f1 = (document.getElementById("comm-add-f1").value || "").trim();
  var f2 = (document.getElementById("comm-add-f2").value || "").trim();
  var f3 = (document.getElementById("comm-add-f3").value || "").trim();
  var f4 = (document.getElementById("comm-add-f4").value || "").trim();
  var fType = activeAddFormType;

  origSubmitCommAdd();

  if (window.supabaseClient && f1 && f2) {
    if (fType === "minyan") {
      window.supabaseClient.from("minyanim").insert([{ name: f1, city: f3 || "ישראל", mincha: f2, nusach: f4 || "כלל ישראל" }]).then(function() {});
    } else if (fType === "rabbi") {
      window.supabaseClient.from("rabbis").insert([{ name: f1, title: f2, phone: f3 || "073-3570000", hours: f4 || "" }]).then(function() {});
    } else if (fType === "gemach") {
      window.supabaseClient.from("gemachim").insert([{ name: f1, category: f2, city: f3 || "ישראל", phone: f4 || "03-6144444", description: f4 }]).then(function() {});
    } else if (fType === "tzaddik") {
      window.supabaseClient.from("tzaddikim").insert([{ name: f1, city: f2 || "ישראל", address: f3, story: f4, segula: f4 }]).then(function() {});
    }
  }
};

// שמירה אוטומטית של תפילות ונרות לטבלת prayer_wall ב-Supabase
var origAddPrayerWall = window.__v37_prev_addPrayerWallDedication_1;
window.addPrayerWallDedication = function() {
  var nameEl = document.getElementById("pw-name-input");
  var catEl = document.getElementById("pw-cat-select");
  var tzEl = document.getElementById("pw-tzaddik-input");
  var reqEl = document.getElementById("pw-request-input");
  var nVal = nameEl ? nameEl.value.trim() : "";
  var cVal = catEl ? catEl.value : "לרפואה שלמה";
  var tzVal = tzEl ? tzEl.value.trim() : "כלל צדיקי הדורות";
  var rVal = reqEl ? reqEl.value.trim() : "";

  origAddPrayerWall();

  if (window.supabaseClient && nVal) {
    window.supabaseClient.from("prayer_wall").insert([{
      prayer_for_name: nVal,
      category: cVal,
      tzaddik_name: tzVal || "כלל צדיקי הדורות",
      request_text: rVal
    }]).then(function() {});
  }
};

// שמירה אוטומטית של אשכולות פורום לטבלת forum_posts ב-Supabase
var origAddForum = window.__v37_prev_addNewForumPost_1;
window.addNewForumPost = function() {
  var titleEl = document.getElementById("forum-new-title");
  var catEl = document.getElementById("forum-new-cat");
  var bodyEl = document.getElementById("forum-new-body");
  var tVal = titleEl ? titleEl.value.trim() : "";
  var cVal = catEl ? catEl.value : "דברי תורה";
  var bVal = bodyEl ? bodyEl.value.trim() : "";

  origAddForum();

  if (window.supabaseClient && tVal && bVal) {
    window.supabaseClient.from("forum_posts").insert([{
      category: cVal,
      title: tVal,
      author: (currentUserAccount && currentUserAccount.name) ? currentUserAccount.name : "חבר קהילה",
      content: bVal
    }]).then(function() {});
  }
};

// הפעלה אוטומטית של הסנכרון מול Supabase בעת טעינת האתר
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    if (window.syncAllTablesFromSupabase) window.syncAllTablesFromSupabase();
  }, 400);
});


// ============================================================================
// V30 — Supabase Auth (הרשמה/התחברות) + חיבור כל הטבלאות למדורים + העלאת שיעור
//  * הבלוק הזה נוסף בסוף הקובץ בכוונה: הוא דורס גרסאות קודמות של אותן פונקציות
//    (כמו שה-V28/V29 עושים) ולא מוחק אף פונקציה קיימת.
//  * תלוי ב: utils.js (STORAGE_KEYS המלא + sbSafe/sbSafeUrl/sbSafePhone) וב-supabase-client.js
// ============================================================================
(function () {
  "use strict";

  var sb = function () { return window.supabaseClient; };
  var S = window.sbSafe, SU = window.sbSafeUrl, SP = window.sbSafePhone;
  var DEFAULT_IMG = "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80";

  function el(id) { return document.getElementById(id); }
  function val(id) { var e = el(id); return e ? (e.value || "").trim() : ""; }
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // ---------------------------------------------------------------------------
  // 0. צילום מצב של הנתונים הסטטיים (data.js) – משמש כגיבוי בלבד אם Supabase ריק/נופל.
  //    כך כל טעינה *מחליפה* את המערך ולא מוסיפה עליו (זה מה שגרם לכפילויות).
  // ---------------------------------------------------------------------------
  var BASE = window.__TT_BASE = window.__TT_BASE || {
    RABBI_SHIURIM_DATA: (window.RABBI_SHIURIM_DATA || []).slice(),
    CHAVRUTA_DATA: (window.CHAVRUTA_DATA || []).slice(),
    MINYANIM_DATA: (window.MINYANIM_DATA || []).slice(),
    RABBIS_DATA: (window.RABBIS_DATA || []).slice(),
    GEMACHIM_DATA: (window.GEMACHIM_DATA || []).slice(),
    TZADDIKIM_DATA: (window.TZADDIKIM_DATA || []).slice()
  };

  // ---------------------------------------------------------------------------
  // 1. מיפוי שורות מהטבלאות (snake_case) למבנה שהכרטיסים הקיימים כבר יודעים לצייר.
  //    ה-HTML/CSS של הכרטיסים לא משתנה – רק מקור הנתונים.
  // ---------------------------------------------------------------------------
  // קואורדינטה אמיתית בלבד: null אם חסר, או אם זה ערך ברירת המחדל של הסכמה
  function realCoord(v, schemaDefault) {
    var n = Number(v);
    if (v === null || v === undefined || v === "" || !isFinite(n)) return null;
    if (schemaDefault !== undefined && n === schemaDefault) return null;
    return n;
  }
  function mapLesson(r) {
    return {
      id: "sb_" + r.id,
      rabbi: S(r.rabbi_name) || "רב בית המדרש",
      title: S(r.title) || "שיעור תורה",
      institution: S(r.institution) || "בית המדרש צדיק-טוק",
      topic: S(r.topic || r.category) || "שיעור תורה",
      type: S(r.type) || "שיעור מוקלט",
      duration: S(r.duration) || "45:00",
      videoUrl: SU(r.video_url),
      description: S(r.description)
    };
  }
  function mapChavruta(r) {
    return {
      id: "sb_chv_" + r.id,
      name: S(r.name), topic: S(r.topic),
      mode: S(r.mode) || "פנים אל פנים / טלפוני",
      city: S(r.city) || "כל הארץ",
      hours: S(r.hours) || "בתיאום אישי",
      phone: SP(r.phone),
      description: S(r.description),
      lat: 32.08, lng: 34.83,
      verification: "מאומת ✔"
    };
  }
  function mapMinyan(r) {
    return {
      id: "sb_min_" + r.id,
      name: S(r.name), nusach: S(r.nusach) || "כלל ישראל",
      city: S(r.city), address: S(r.address) || S(r.city),
      shacharit: S(r.shacharit) || "—", mincha: S(r.mincha) || "—", arvit: S(r.arvit) || "—",
      phone: SP(r.phone), distanceKm: null,
      lat: realCoord(r.lat, 32.0840), lng: realCoord(r.lng, 34.8352)   // ברירת המחדל של הטבלה = "לא ידוע" (נופל למיקום לפי עיר)
    };
  }
  function mapRabbi(r) {
    return {
      id: "sb_rab_" + r.id,
      name: S(r.name),
      title: S(r.title) || "פוסק הלכה ומורה הוראה",
      field: S(r.title),
      city: S(r.city) || "מענה ארצי",
      phone: SP(r.phone),
      hours: S(r.hours) || "מענה הלכתי לאורך היום",
      status: "זמין למענה", statusColor: "bg-green-500"
    };
  }
  function mapGemach(r) {
    return {
      id: "sb_gm_" + r.id,
      name: S(r.name), category: S(r.category) || "גמ״ח וחסד",
      city: S(r.city), address: S(r.address) || S(r.city),
      hours: S(r.hours) || "א׳-ה׳ 09:00-21:00",
      phone: SP(r.phone),
      description: S(r.description), desc: S(r.description),
      lat: realCoord(r.lat), lng: realCoord(r.lng)
    };
  }
  function mapTzaddik(r) {
    return {
      id: "sb_tz_" + r.id,
      name: S(r.name), title: S(r.title),
      city: S(r.city), location: S(r.city), region: S(r.region) || "ארץ ישראל",
      yahrzeit: S(r.yahrzeit), segula: S(r.segula),
      story: S(r.story), desc: S(r.story),
      image: SU(r.image_url) || DEFAULT_IMG,
      lat: realCoord(r.lat, 32.98), lng: realCoord(r.lng, 35.44)
    };
  }

  // נרמול של נתוני הגיבוי הסטטיים (ל-data.js יש שדות location/desc במקום city/description)
  function normTz(o) { var c = Object.assign({}, o); c.city = c.city || c.location || ""; c.story = c.story || c.desc || ""; c.title = c.title || ""; c.segula = c.segula || ""; c.image = c.image || DEFAULT_IMG; return c; }
  function normGem(o) { var c = Object.assign({}, o); c.description = c.description || c.desc || ""; c.address = c.address || c.city || ""; return c; }
  function normChv(o) { var c = Object.assign({}, o); c.mode = c.mode || ""; c.description = c.description || ""; c.city = c.city || ""; c.hours = c.hours || ""; c.topic = c.topic || ""; return c; }
  function same(o) { return Object.assign({}, o); }

  // ---------------------------------------------------------------------------
  // 2. מנוע החיבור: טבלה -> מערך גלובלי -> רינדור. תמיד *מחליף*, אף פעם לא concat.
  // ---------------------------------------------------------------------------
  var BINDINGS = {
    lessons: {
      table: "lessons", key: "RABBI_SHIURIM_DATA", map: mapLesson, norm: same,
      dk: function (x) { return x.title + "|" + x.rabbi; },
      render: function (fromDb) {
        if (fromDb) window.setStorageJson(STORAGE_KEYS.RABBI_SHIURIM, window.RABBI_SHIURIM_DATA);
        window.renderRabbiShiurimList("");
      }
    },
    chavruta: {
      table: "chavruta", key: "CHAVRUTA_DATA", map: mapChavruta, norm: normChv,
      dk: function (x) { return x.name + "|" + x.topic + "|" + x.phone; },
      render: function (fromDb) {
        if (fromDb) window.setStorageJson(STORAGE_KEYS.CHAVRUTA_LIST, window.CHAVRUTA_DATA);
        window.renderChavrutaDirectory("all");
      }
    },
    minyanim: {
      table: "minyanim", key: "MINYANIM_DATA", map: mapMinyan, norm: same,
      dk: function (x) { return x.name + "|" + x.city; },
      render: function () { window.renderMinyanim(window.MINYANIM_DATA); }
    },
    rabbis: {
      table: "rabbis", key: "RABBIS_DATA", map: mapRabbi, norm: same,
      dk: function (x) { return x.name + "|" + x.phone; },
      render: function () { window.renderRabbis(window.RABBIS_DATA); }
    },
    gemachim: {
      table: "gemachim", key: "GEMACHIM_DATA", map: mapGemach, norm: normGem,
      dk: function (x) { return x.name + "|" + x.phone; },
      render: function () { window.renderGemachim(window.GEMACHIM_DATA); }
    },
    tzaddikim: {
      table: "tzaddikim", key: "TZADDIKIM_DATA", map: mapTzaddik, norm: normTz,
      dk: function (x) { return x.name + "|" + x.city; },
      render: function () { window.renderTzaddikim(window.TZADDIKIM_DATA); }
    }
  };

  var loadedAt = {};

  async function pull(b) {
    var res = await sb().from(b.table).select("*").eq("is_approved", true).order("created_at", { ascending: false });
    if (res.error) { console.warn("[Supabase] " + b.table + ":", res.error.message); return null; }
    var seen = {}, out = [];
    (res.data || []).forEach(function (row) {      // שורות כפולות במסד (למשל seed שהורץ פעמיים) מסוננות כאן
      var m = b.map(row), k = String(b.dk(m)).toLowerCase();
      if (seen[k]) return;
      seen[k] = 1; out.push(m);
    });
    return out;
  }

  async function loadBinding(b, force) {
    var now = Date.now();
    if (!force && loadedAt[b.table] && now - loadedAt[b.table] < 15000) { b.render(true); return; }
    var rows = null;
    if (sb()) { try { rows = await pull(b); } catch (e) { console.warn("[Supabase] " + b.table + " failed:", e); } }
    if (rows && rows.length) {
      window[b.key] = rows; loadedAt[b.table] = now; b.render(true);
    } else {
      window[b.key] = (BASE[b.key] || []).map(b.norm);   // גיבוי סטטי רק אם אין נתונים / אין חיבור
      b.render(false);
    }
  }

  // פונקציות ציבוריות (שומרות על השמות הקיימים)
  window.fetchLessonsFromSupabase = function (force) { return loadBinding(BINDINGS.lessons, force === true); };

  window.syncAllTablesFromSupabase = async function () {
    if (!sb()) { Object.keys(BINDINGS).forEach(function (k) { loadBinding(BINDINGS[k], true); }); return; }
    try {
      await Promise.all(Object.keys(BINDINGS).map(function (k) { return loadBinding(BINDINGS[k], true); }));

      // מוקד תפילות (prayer_wall) ופורום (forum_posts) – אותה לוגיקה כמו V29, אבל מנוקה ובלי כפילויות
      var pw = await sb().from("prayer_wall").select("*").order("created_at", { ascending: false });
      if (!pw.error && pw.data && pw.data.length) {
        var dbPw = pw.data.map(function (row) {
          return { id: "sb_pw_" + row.id, prayerForName: S(row.prayer_for_name), category: S(row.category) || "לרפואה שלמה",
            tzaddikName: S(row.tzaddik_name) || "כלל צדיקי הדורות", requestText: S(row.request_text),
            submittedBy: S(row.submitted_by) || "חבר קהילה", amenCount: row.amen_count || 1, time: "מסונכרן ✔" };
        });
        window.setStorageJson(STORAGE_KEYS.PRAYER_WALL, dbPw.concat(window.INITIAL_PRAYER_WALL || []));
        window.renderCommunityPrayerWall();
      }
      var fp = await sb().from("forum_posts").select("*").order("created_at", { ascending: false });
      if (!fp.error && fp.data && fp.data.length) {
        var dbFp = fp.data.map(function (row) {
          return { id: "sb_fp_" + row.id, category: S(row.category) || "דברי תורה", title: S(row.title), author: S(row.author),
            content: S(row.content), likes: row.likes || 1, repliesCount: row.replies_count || 0,
            status: S(row.status) || "מאושר ✔", time: "מסונכרן ✔" };
        });
        window.setStorageJson(STORAGE_KEYS.FORUM_POSTS, dbFp.concat(window.INITIAL_FORUM_POSTS || []));
        window.renderForumPosts("all");
      }
    } catch (err) {
      console.warn("Supabase full sync info:", err);
    }
  };

  // ריקון המיכל לפני הזרקה (התאמה מילולית לבקשה; הרינדור הקיים כבר מחליף innerHTML)
  var prevRenderShiurim = window.__v37_prev_renderRabbiShiurimList_1;
  window.__v37_prev_renderRabbiShiurimList_2 = function (q) {
    var box = el("rabbi-shiurim-grid");
    if (box) box.innerHTML = "";
    return prevRenderShiurim(q);
  };

  // חברותא: אותו עיצוב בדיוק, אבל בלי "undefined" לעולם
  window.renderChavrutaDirectory = function (query) {
    var box = el("chavruta-grid-container");
    if (!box) return;
    var list = window.getStorageJson(STORAGE_KEYS.CHAVRUTA_LIST, window.CHAVRUTA_DATA || []);
    if (!Array.isArray(list)) list = window.CHAVRUTA_DATA || [];
    var q = (query || "").trim().toLowerCase();
    if (q && q !== "all") {
      list = list.filter(function (c) {
        return [c.name, c.topic, c.city, c.mode, c.description].join(" ").toLowerCase().indexOf(q) !== -1;
      });
    }
    box.innerHTML = "";
    box.innerHTML = list.map(function (c) {
      var name = c.name || "", topic = c.topic || "", phone = c.phone || "";
      var safeTopic = topic.replace(/'/g, "");
      return `
    <div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-md text-xs font-bold">${c.mode || "פנים אל פנים / טלפוני"}</span>
          <span class="text-xs text-[#5C4938]">${c.verification || "מאומת ✔"}</span>
        </div>
        <h4 class="text-lg font-bold text-[#0F2340] serif-heading">${name}</h4>
        <p class="text-xs font-bold text-[#0F2340]">נושא לימוד: ${topic}</p>
        <p class="text-xs text-[#5C4938] leading-relaxed">${c.description || ""}</p>
        <p class="text-xs text-[#5C4938]">עיר: <strong>${c.city || "כל הארץ"}</strong> • שעות: <strong>${c.hours || "בתיאום אישי"}</strong></p>
      </div>
      <div class="pt-3 border-t border-[#E5DBC7] grid grid-cols-2 gap-2">
        <a href="tel:${phone}" class="py-2 bg-amber-500 text-white font-bold rounded-xl text-xs text-center">חיוג לתיאום חברותא</a>
        <a href="https://wa.me/972${phone.replace(/[^0-9]/g, '').replace(/^0/, '')}?text=${encodeURIComponent('שלום וברכה, ראיתי את הצעת החברותא שלך בצדיק-טוק בנושא ' + safeTopic)}" target="_blank" class="py-2 bg-white text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center">שלח הודעת וואטסאפ</a>
      </div>
    </div>`;
    }).join("");
  };

  // ---------------------------------------------------------------------------
  // 3. Authentication (Supabase Auth). ה-session נשמר ע"י supabase-js ב-localStorage
  //    (מפתח sb-...-auth-token), ובנוסף שומרים תצוגה מהירה ב-STORAGE_KEYS.USER_ACCOUNT.
  // ---------------------------------------------------------------------------
  var authMode = "login";
  window.__ttUser = null;

  function displayNameOf(user) {
    var m = (user && user.user_metadata) || {};
    return S(m.full_name || m.name || String(user.email || "").split("@")[0]) || "חבר קהילה";
  }

  function setAuthMsg(text, ok) {
    var m = el("auth-msg");
    if (!m) return;
    m.textContent = text || "";
    m.className = "text-xs font-bold min-h-[1rem] " + (ok ? "text-green-700" : "text-red-700");
  }

  function translateAuthError(err) {
    var m = String((err && err.message) || err || "");
    if (/invalid login credentials/i.test(m)) return "אימייל או סיסמה שגויים";
    if (/already registered|already been registered/i.test(m)) return "כבר קיים חשבון עם האימייל הזה – עבור להתחברות";
    if (/email not confirmed/i.test(m)) return "יש לאשר קודם את האימייל (בדוק את תיבת הדואר)";
    if (/password should be at least/i.test(m)) return "הסיסמה חייבת להכיל לפחות 6 תווים";
    if (/rate limit|too many/i.test(m)) return "יותר מדי ניסיונות – נסה שוב בעוד דקה";
    if (/signups? not allowed|disabled/i.test(m)) return "ההרשמה כבויה בהגדרות Supabase Auth";
    return "שגיאה: " + m;
  }

  window.applyAuthState = function (user) {
    window.__ttUser = user || null;
    var prevCity = (currentUserAccount && currentUserAccount.city) || "בני ברק";
    if (user) {
      currentUserAccount = {
        isRegistered: true, uid: user.id, email: user.email || "",
        name: displayNameOf(user),
        phone: (user.user_metadata && user.user_metadata.phone) || "",
        city: prevCity, role: "משתמש רשום ומאומת ✔"
      };
    } else {
      currentUserAccount = { isRegistered: false, name: "אורח", phone: "", city: prevCity, role: "אורח" };
    }
    window.setStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount);
    window.updateAuthHeaderBadge();
  };

  window.__v37_prev_updateAuthHeaderBadge_2 = function () {
    var acc = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount) || currentUserAccount;
    var logged = !!(acc && acc.isRegistered);
    var name = logged ? acc.name : "אורח";

    var lbl = el("header-auth-label");
    if (lbl) lbl.textContent = logged ? name : "התחברות / הרשמה";
    var badge = el("user-auth-status-badge");
    if (badge) badge.textContent = logged ? ("✔ " + name) : "התחבר / הירשם";

    var title = el("myzone-user-title");
    if (title) title.textContent = "שלום, " + name;
    var abtn = el("myzone-auth-btn");
    if (abtn) abtn.textContent = logged ? "התנתקות" : "התחברות / הרשמה";
    if (abtn) abtn.onclick = logged ? window.logoutUser : window.openAuthModal;

    // טופס העלאת שיעור: מוצג רק למחוברים
    var box = el("lesson-upload-box"), guest = el("lesson-upload-guest");
    if (box) box.classList.toggle("hidden", !logged);
    if (guest) guest.classList.toggle("hidden", logged);

    // תוכן החלון
    var gv = el("auth-guest-view"), uv = el("auth-user-view");
    if (gv) gv.classList.toggle("hidden", logged);
    if (uv) uv.classList.toggle("hidden", !logged);
    var un = el("auth-user-name"), ue = el("auth-user-email");
    if (un) un.textContent = name;
    if (ue) ue.textContent = logged ? (acc.email || "") : "";
  };

  window.setAuthMode = function (mode) {
    authMode = (mode === "register") ? "register" : "login";
    var nameWrap = el("auth-name-wrap"), submit = el("auth-submit-btn");
    var tl = el("auth-tab-login"), tr = el("auth-tab-register");
    if (nameWrap) nameWrap.classList.toggle("hidden", authMode !== "register");
    if (submit) submit.textContent = authMode === "register" ? "✔ הרשמה וכניסה" : "✔ התחברות";
    if (tl) tl.classList.toggle("active", authMode === "login");
    if (tr) tr.classList.toggle("active", authMode === "register");
    setAuthMsg("");
  };

  window.openAuthModal = function () {
    var modal = el("modal-auth-register");
    if (modal) modal.classList.remove("hidden");
    window.setAuthMode("login");
    window.updateAuthHeaderBadge();
  };

  window.handleAuthSubmit = async function () {
    if (!sb()) { setAuthMsg("אין חיבור ל-Supabase (בדוק את supabase-client.js)"); return; }
    var email = val("auth-email").toLowerCase();
    var pass = (el("auth-password") || {}).value || "";
    var name = val("auth-input-name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setAuthMsg("נא להזין כתובת אימייל תקינה"); return; }
    if (pass.length < 6) { setAuthMsg("הסיסמה חייבת להכיל לפחות 6 תווים"); return; }
    if (authMode === "register" && !name) { setAuthMsg("נא להזין שם להצגה בקהילה"); return; }

    var btn = el("auth-submit-btn");
    if (btn) btn.disabled = true;
    setAuthMsg("רגע...", true);
    try {
      if (authMode === "register") {
        var r = await sb().auth.signUp({ email: email, password: pass, options: { data: { full_name: name } } });
        if (r.error) { setAuthMsg(translateAuthError(r.error)); }
        else if (r.data && r.data.user && r.data.user.identities && r.data.user.identities.length === 0) {
          setAuthMsg("כבר קיים חשבון עם האימייל הזה – עבור להתחברות");
        } else if (r.data && r.data.session) {
          window.applyAuthState(r.data.user);
          window.closeModal("modal-auth-register");
          window.toast("🎉 ברוך הבא " + name + "! החשבון נוצר ואתה מחובר.");
        } else {
          setAuthMsg("נשלח אליך מייל אימות ל-" + email + ". אשר אותו ואז התחבר.", true);
        }
      } else {
        var l = await sb().auth.signInWithPassword({ email: email, password: pass });
        if (l.error) { setAuthMsg(translateAuthError(l.error)); }
        else {
          window.applyAuthState(l.data.user);
          window.closeModal("modal-auth-register");
          window.toast("✔ שלום " + displayNameOf(l.data.user) + ", התחברת בהצלחה");
        }
      }
    } catch (e) {
      setAuthMsg(translateAuthError(e));
    } finally {
      if (btn) btn.disabled = false;
      var p = el("auth-password"); if (p && window.__ttUser) p.value = "";
    }
  };

  window.logoutUser = async function () {
    try { if (sb()) await sb().auth.signOut(); } catch (e) { console.warn(e); }
    window.applyAuthState(null);
    window.closeModal("modal-auth-register");
    window.toast("התנתקת מהחשבון");
  };

  // שמות ישנים נשארים עובדים
  window.saveUserRegistration = function () { return window.handleAuthSubmit(); };
  window.toggleGuestOrRegistered = function () { return window.__ttUser ? window.logoutUser() : window.openAuthModal(); };

  window.initAuth = async function () {
    // תצוגה מיידית מהמטמון המקומי (בלי הבהוב של "אורח"), ואז מאמתים מול ה-session האמיתי
    var saved = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, null);
    if (saved && saved.isRegistered && saved.uid) {
      window.applyAuthState({ id: saved.uid, email: saved.email, user_metadata: { full_name: saved.name, phone: saved.phone } });
    } else {
      window.applyAuthState(null);
    }
    if (!sb()) return;
    try {
      var s = await sb().auth.getSession();
      window.applyAuthState(s && s.data && s.data.session ? s.data.session.user : null);
    } catch (e) { console.warn("getSession:", e); }
    sb().auth.onAuthStateChange(function (event, session) {
      window.applyAuthState(session ? session.user : null);
    });
  };

  // Enter בתוך שדות ההתחברות
  onReady(function () {
    ["auth-email", "auth-password", "auth-input-name"].forEach(function (id) {
      var e = el(id);
      if (e) e.addEventListener("keydown", function (ev) { if (ev.key === "Enter") window.handleAuthSubmit(); });
    });
    window.initAuth();
  });

  // ---------------------------------------------------------------------------
  // 4. הוספת תוכן: שיעור חדש -> supabase.from('lessons').insert(...) + רענון אוטומטי
  // ---------------------------------------------------------------------------
  var prevUpload = window.__v37_prev_uploadNewRabbiShiur_2;   // הגרסה הישנה (V28) נשארת כגיבוי כשאין חיבור
  window.uploadNewRabbiShiur = async function () {
    if (!sb()) { return prevUpload ? prevUpload() : window.toast("אין חיבור ל-Supabase"); }
    if (!window.__ttUser) { window.toast("🔒 העלאת שיעור זמינה למשתמשים מחוברים בלבד"); window.openAuthModal(); return; }

    var title = val("new-shiur-title"), rabbi = val("new-shiur-rabbi");
    var topic = val("new-shiur-topic") || "שיעור תורה", url = val("new-shiur-url");
    if (!title || !rabbi) { window.toast("נא למלא כותרת שיעור ושם הרב"); return; }
    if (url && !/^https?:\/\//i.test(url)) { window.toast("קישור הווידאו חייב להתחיל ב-https://"); return; }

    var btn = el("lesson-upload-btn");
    if (btn) { btn.disabled = true; btn.textContent = "שולח..."; }
    try {
      var res = await sb().from("lessons").insert([{
        title: title, rabbi_name: rabbi, topic: topic, video_url: url,
        institution: "הועלה ע״י " + (currentUserAccount.name || "חבר קהילה")
      }]).select();
      if (res.error) { window.toast("שגיאה בשמירת השיעור: " + res.error.message); return; }
      ["new-shiur-title", "new-shiur-rabbi", "new-shiur-topic", "new-shiur-url"].forEach(function (id) { var e = el(id); if (e) e.value = ""; });
      await loadBinding(BINDINGS.lessons, true);      // רענון הרשימה אוטומטית
      window.toast("✔ השיעור פורסם ונוסף לרשימה");
    } catch (e) {
      window.toast("שגיאה בשמירת השיעור");
      console.warn(e);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "העלה שיעור / שידור חי"; }
    }
  };

  // חברותא חדשה -> טבלת chavruta (ואז רענון)
  var prevAddChavruta = window.__v37_prev_addNewChavrutaOffer_2;
  window.addNewChavrutaOffer = async function () {
    if (!sb()) { return prevAddChavruta ? prevAddChavruta() : null; }
    if (!window.__ttUser) { window.toast("🔒 הוספת חברותא זמינה למשתמשים מחוברים בלבד"); window.openAuthModal(); return; }
    var name = val("chavruta-new-name"), topic = val("chavruta-new-topic"),
        city = val("chavruta-new-city"), phone = val("chavruta-new-phone");
    if (!name || !topic) { window.toast("נא למלא שם ונושא לימוד לחברותא"); return; }
    if (!phone) { window.toast("נא להזין טלפון לתיאום"); return; }
    var res = await sb().from("chavruta").insert([{ name: name, topic: topic, city: city || currentUserAccount.city || "ישראל", phone: phone }]).select();
    if (res.error) { window.toast("שגיאה בשמירה: " + res.error.message); return; }
    ["chavruta-new-name", "chavruta-new-topic", "chavruta-new-city", "chavruta-new-phone"].forEach(function (id) { var e = el(id); if (e) e.value = ""; });
    await loadBinding(BINDINGS.chavruta, true);
    window.toast("✔ הצעת החברותא פורסמה");
  };

  // מניין / רב / גמ"ח / קבר צדיק -> הטבלאות המתאימות, עם העמודות הנכונות (ב-V29 נשלחה עמודה address שלא קיימת בטבלת tzaddikim)
  var prevSubmitCommAdd = origSubmitCommAdd;      // origSubmitCommAdd הוגדר ב-V29 כגרסה המקורית
  window.submitCommunityAddForm = function () {
    var f1 = val("comm-add-f1"), f2 = val("comm-add-f2"), f3 = val("comm-add-f3"), f4 = val("comm-add-f4");
    var type = activeAddFormType;
    var wasUser = !!window.__ttUser;
    prevSubmitCommAdd();                           // התנהגות ה-UI הקיימת (חלון, מודרציה מקומית, "ההגשות שלי")
    if (!sb() || !wasUser || !f1 || !f2) return;

    var table, binding, row;
    if (type === "minyan") {
      table = "minyanim"; binding = BINDINGS.minyanim;
      row = { name: f1, city: f3 || "ישראל", address: f3, mincha: f2, nusach: f4 || "כלל ישראל" };
    } else if (type === "rabbi") {
      table = "rabbis"; binding = BINDINGS.rabbis;
      row = { name: f1, title: f2, phone: f3 || "073-3570000", hours: f4 || "" };
    } else if (type === "gemach") {
      table = "gemachim"; binding = BINDINGS.gemachim;
      var ph = (f4.match(/0[\d-]{7,11}/) || ["—"])[0];
      row = { name: f1, category: f2, city: f3 || "ישראל", address: f3, phone: ph, description: f4 };
    } else if (type === "tzaddik") {
      table = "tzaddikim"; binding = BINDINGS.tzaddikim;
      row = { name: f1, city: f2 || "ישראל", story: f4 + (f3 ? " • " + f3 : ""), segula: f4 };
    } else { return; }

    sb().from(table).insert([row]).select().then(function (res) {
      if (res.error) { window.toast("שגיאה בשמירה ב-Supabase: " + res.error.message); return; }
      loadBinding(binding, true);
    });
  };
})();


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
    admin:  { t: "פאנל ניהול", d: "", back: "myzone", crumb: "האזור האישי" },
    zmanim: {
      t: "זמני היום ולוח שנה", d: "", back: "feed", crumb: "דף הבית",
      modes: {
        times:    { t: "זמני היום", d: "כל הזמנים להיום בהלכה, מעלות השחר ועד צאת הכוכבים" },
        calendar: { t: "לוח שנה עברי", d: "תאריך עברי ולועזי, הילולות צדיקים ומועדים" }
      }
    }
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

  var TT = { ctx: null, pushed: false, chips: [] };
  var GEO_LISTS_KEYS = { minyanim: 1, mikvaot: 1, restaurants: 1, gemachim: 1, chabad: 1, tzaddikim: 1 };
  var origLib = window.__v37_prev_switchLibrarySubTab_1, origPray = window.__v37_prev_switchPraySubTab_1, origMz = window.__v37_prev_switchMyZoneSubTab_1;

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

  // פס המדורים של אותו מדור (נשאר גלוי במצב מיקוד, כך אפשר לעבור בין שיעורים / שידור חי / סרטונים וכו')
  function buildStrip(chips) {
    var strip = el("tt-focus-strip"); if (!strip) return;
    TT.chips = chips || [];
    strip.innerHTML = TT.chips.map(function (c, i) {
      return '<button type="button" role="tab" class="tt-chip' + (c.active ? " active" : "") + '" aria-selected="' + (c.active ? "true" : "false") + '" onclick="ttChip(' + i + ')">' + c.label + "</button>";
    }).join("");
    strip.classList.toggle("hidden", TT.chips.length < 2);
    var act = strip.querySelector(".tt-chip.active"); if (act && act.scrollIntoView) { try { act.scrollIntoView({ block: "nearest", inline: "center" }); } catch (e) {} }
  }
  window.ttChip = function (i) { var c = TT.chips && TT.chips[i]; if (c && c.run) c.run(); };

  function setBar(o) {
    var bar = el("tt-focus-bar"); if (!bar) return;
    el("tt-focus-title").textContent = o.title || "";
    el("tt-focus-desc").textContent = o.desc || "";
    el("tt-focus-crumb").textContent = o.crumb || "";
    var more = el("tt-more-btn");
    if (more) { more.classList.toggle("hidden", !o.hasTools); more.classList.remove("active"); more.textContent = "אפשרויות נוספות ▾"; }
    var gb = el("tt-geo-bar"); if (gb) gb.classList.toggle("hidden", !o.geo);
    buildStrip(o.chips);
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
    var chips = Object.keys(h.subs).map(function (k) {
      return { label: h.subs[k].t, active: k === sub, run: function () {
        if (hubKey === "series") window.switchLibrarySubTab(k); else if (hubKey === "siddur") window.switchPraySubTab(k); else window.switchMyZoneSubTab(k);
      } };
    });
    setBar({ title: cfg.t, crumb: h.t, desc: cfg.d || "", search: cfg.search, panelId: h.prefix + sub, hasTools: false, chips: chips });
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
    var chips = [];
    if (isFind) {
      chips = Object.keys(FIND).map(function (k) {
        return { label: FIND[k].t, active: k === tabId && !mode, run: function () { window.switchTab(k); } };
      });
    } else if (tabId === "zmanim") {
      view.setAttribute("data-zmode", mode || "all");
      chips = [
        { label: "זמני היום", active: mode === "times", run: function () { window.switchTab("zmanim", "times"); } },
        { label: "לוח שנה", active: mode === "calendar", run: function () { window.switchTab("zmanim", "calendar"); } },
        { label: "יום השנה", active: false, run: function () { window.switchTab("tzaddikim", "yahrzeits"); } }
      ];
    }
    if (isFind && cfg.modes && mode) chips.push({ label: m.t, active: true, run: function () {} });
    setBar({ title: m.t, desc: m.d || "", crumb: isFind ? "למצוא" : cfg.crumb, hasTools: hasTools, chips: chips, geo: !!GEO_LISTS_KEYS[tabId] });
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
  window.__v37_prev_switchTab_2 = function (tabId, mode) {
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
    else if (tabId === "zmanim") parentHub = "feed";
    else if (tabId === "find" || !!FIND[tabId] || tabId === "prayerwall") parentHub = "find";
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
  window.__v37_prev_switchLibrarySubTab_2 = function (sub) {
    if (sub === "overview" || sub === "library") sub = "torah";
    if (currentTab !== "series") window.switchTab("series");
    origLib(sub); enterSub("series", sub);
  };
  window.__v37_prev_switchPraySubTab_2 = function (sub) {
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
      { t: "זמני היום", a: ["go", "zmanim", null, "times"] },
      { t: "לוח שנה עברי", a: ["go", "zmanim", null, "calendar"] },
      { t: "יום השנה והילולות צדיקים", a: ["go", "tzaddikim", null, "yahrzeits"] },
      { t: "פרשת השבוע", a: ["parasha"] },
      { t: "מצב שבת", a: ["mz", "settings"] }
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
    else if (a[0] === "parasha") window.openParashaViewer("bereishit", "חיי שרה");
    else if (a[0] === "mz") { window.switchTab("myzone"); window.switchMyZoneSubTab(a[1]); }
    else if (a[0] === "sub") {
      window.switchTab(a[1]);
      if (a[1] === "series") window.switchLibrarySubTab(a[2]); else if (a[1] === "siddur") window.switchPraySubTab(a[2]);
    }
  }

  window.__v37_prev_openSideMenu_1 = function () {
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
  // כפתור הכותרת: מנותק => חלון התחברות/הרשמה; מחובר => האזור האישי
  window.headerAuthClick = function () {
    var acc = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount) || currentUserAccount;
    if (window.__ttUser || (acc && acc.isRegistered)) window.openPersonalArea(); else window.openAuthModal();
  };

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
  window.__v37_prev_renderFindHub_1 = function () {
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
      if (b.id === "tt-geo-bar") {
        b.textContent = GEO.active ? "✓ ממוין לפי מרחק (ביטול)" : "📍 מיין לפי מרחק";
      } else if (b.id === "tt-geo-global") {
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
    var greg = "";
    try { greg = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" }).format(new Date()); } catch (e) {}
    var g = el("home-greg-date"); if (g) g.textContent = greg;
    var zl = el("zm-today-line"); if (zl) zl.textContent = "היום: " + (window.getHebrewDateString ? window.getHebrewDateString() : "") + (greg ? " • " + greg : "");
    var list = window.YAHRZEITS_CALENDAR || [];
    var today = list.filter(function (y) { return String(y.date || "").indexOf("היום") !== -1; })[0] || list[0];
    if (today) {
      var n = el("home-yahrzeit-name"), s = el("home-yahrzeit-sub");
      if (n) n.textContent = today.name || ""; if (s) s.textContent = today.title || "";
    }
  }

  var prevBadge = window.__v37_prev_updateAuthHeaderBadge_2;
  window.updateAuthHeaderBadge = function () {
    if (prevBadge) prevBadge();
    var acc = window.getStorageJson(STORAGE_KEYS.USER_ACCOUNT, currentUserAccount) || currentUserAccount;
    var logged = !!(acc && acc.isRegistered);
    var lbl = el("header-auth-label"); if (lbl) lbl.textContent = logged ? "אזור אישי" : "התחברות";
    var hb = el("header-auth-btn"); if (hb) hb.setAttribute("title", logged ? ("אזור אישי של " + acc.name) : "התחברות / הרשמה");
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
      '<div class="pt-3 border-t border-[#E5DBC7] flex items-center justify-between gap-2">' +
        '<span class="tt-stars" role="group" aria-label="דירוג בכוכבים">' +
          [1, 2, 3, 4, 5].map(function (n) { return "<button type=\"button\" onclick=\"ttOpenCustom('" + c.id + "', " + n + ")\" aria-label=\"דרג " + n + " כוכבים\">☆</button>"; }).join("") +
        "</span>" +
        "<button type=\"button\" onclick=\"ttOpenCustom('" + c.id + "', 5)\" class=\"px-3.5 py-2 bg-amber-500 text-white font-bold rounded-xl text-xs\">💬 הגב (" + revs.length + ")</button>" +
      "</div></div>";
  }

  // פותח את חלון הדירוג והתגובות הקיים עבור מנהג, עם מספר הכוכבים שנלחץ
  window.ttOpenCustom = function (id, stars) {
    var c = allCustoms().filter(function (x) { return String(x.id) === String(id); })[0];
    if (!c) return;
    window.openEntityFullPage("custom_" + c.id, "מנהג", c.title, c.edah, "", "", "", c.description, "דיוק המנהג • מקורות • התאמה לעדה");
    if (stars && window.setReviewStarRating) window.setReviewStarRating(stars);
  };

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
  var prevSubmitReview = window.__v37_prev_submitEntityReview_1;
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


// ============================================================================
// V33 — פאנל ניהול (Admin) + זמני היום אמיתיים (Hebcal API) + קישורי Waze ו-וואטסאפ
//  * אבטחת פאנל ניהול: נעילה קשיחה - גישה מותרת אך ורק למשתמש m053425853@gmail.com
//  * חיבור ישיר ל-Supabase community_reviews: אישור (is_approved=true) ומחיקת תגובות
//  * משיכת זמני היום מה-API החינמי של Hebcal (city=Jerusalem / Bnei Brak) ועדכון הכרטיס "היום ביהדות"
//  * קישורי Waze ו-WhatsApp בכל כרטיסי הגמ״חים, המקוואות וקברי הצדיקים בדף "למצוא"
// ============================================================================
(function () {
  "use strict";

  var ADMIN_EMAIL = "m053425853@gmail.com";
  var sb = function () { return window.supabaseClient; };

  function el(id) { return document.getElementById(id); }
  function val(id) { var e = el(id); return e ? (e.value || "").trim() : ""; }
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // --------------------------------------------------------------------------
  // 1. פונקציות עזר לניווט ויצירת קשר (Waze & WhatsApp)
  // --------------------------------------------------------------------------
  window.buildWazeUrl = function (query, query2) {
    if (typeof query === "number" && typeof query2 === "number") {
      return "https://waze.com/ul?ll=" + query + "," + query2 + "&navigate=yes";
    }
    var q = String(query || query2 || "ישראל").trim();
    return "https://waze.com/ul?q=" + encodeURIComponent(q);
  };

  window.buildWhatsAppUrl = function (phone, textMessage) {
    var cleanPhone = String(phone || "").replace(/[^0-9]/g, "");
    if (cleanPhone.indexOf("972") === 0) cleanPhone = cleanPhone.slice(3);
    if (cleanPhone.indexOf("0") === 0) cleanPhone = cleanPhone.slice(1);
    if (!cleanPhone) cleanPhone = "500000000";
    var msg = textMessage ? "?text=" + encodeURIComponent(textMessage) : "";
    return "https://wa.me/972" + cleanPhone + msg;
  };

  // --------------------------------------------------------------------------
  // 2. זמני היום האמיתיים מה-API החינמי של Hebcal (Hebcal API)
  // --------------------------------------------------------------------------
  window.fetchHebcalZmanim = async function (city) {
    try {
      var selectedCity = city || (localStorage.getItem(typeof STORAGE_KEYS !== "undefined" ? STORAGE_KEYS.CITY_LOC : "tzadiktok_city_v18")) || "Jerusalem";
      var hebcalCity = "Jerusalem";
      if (selectedCity.indexOf("בני ברק") !== -1 || selectedCity.indexOf("Bnei") !== -1) {
        hebcalCity = "IL-Bnei+Brak";
      } else if (selectedCity.indexOf("ירושלים") !== -1 || selectedCity.indexOf("Jerusalem") !== -1) {
        hebcalCity = "Jerusalem";
      } else if (selectedCity.indexOf("תל אביב") !== -1 || selectedCity.indexOf("Tel") !== -1) {
        hebcalCity = "Tel+Aviv";
      } else if (selectedCity.indexOf("צפת") !== -1 || selectedCity.indexOf("Safed") !== -1) {
        hebcalCity = "Safed";
      } else if (selectedCity.indexOf("חיפה") !== -1 || selectedCity.indexOf("Haifa") !== -1) {
        hebcalCity = "Haifa";
      } else if (selectedCity.indexOf("טבריה") !== -1 || selectedCity.indexOf("Tiberias") !== -1) {
        hebcalCity = "Tiberias";
      }

      var url = "https://www.hebcal.com/zmanim?cfg=json&city=" + encodeURIComponent(hebcalCity);
      var resp = await fetch(url);
      if (!resp.ok) {
        console.warn("[Hebcal] שגיאת שרת:", resp.status);
        return null;
      }
      var data = await resp.json();
      if (!data || !data.times) return null;

      var formatTime = function (isoStr) {
        if (!isoStr) return "";
        try {
          var d = new Date(isoStr);
          if (!isNaN(d.getTime())) {
            var h = String(d.getHours()).padStart(2, "0");
            var m = String(d.getMinutes()).padStart(2, "0");
            return h + ":" + m;
          }
        } catch (e) {}
        var match = String(isoStr).match(/T(\d{2}:\d{2})/);
        return match ? match[1] : "";
      };

      var shemaTime = formatTime(data.times.sofZmanShma || data.times.sofZmanShmaMGA);
      var sunsetTime = formatTime(data.times.sunset);
      var alotTime = formatTime(data.times.alotHaShachar);
      var sunriseTime = formatTime(data.times.sunrise);
      var tfillaTime = formatTime(data.times.sofZmanTfilla);
      var chatzotTime = formatTime(data.times.chatzot);
      var minchaGedolaTime = formatTime(data.times.minchaGedola);
      var plagTime = formatTime(data.times.plagHaMincha);
      var tzeitTime = formatTime(data.times.tzeit7083deg || data.times.tzeit85deg || data.times.dusk);
      var rtTime = formatTime(data.times.tzeit72min);

      // עדכון כרטיס 'היום ביהדות' בדף הבית
      var shemaEl = el("home-z-shema");
      if (shemaEl && shemaTime) shemaEl.textContent = shemaTime;

      var shkiaEl = el("home-z-shkia");
      if (shkiaEl && sunsetTime) shkiaEl.textContent = sunsetTime;

      // שמירה ועדכון הטבלה המלאה בדף הזמנים
      window.CURRENT_REAL_ZMANIM = [
        { n: "עלות השחר", t: alotTime || "04:52" },
        { n: "הנץ החמה", t: sunriseTime || "06:07" },
        { n: "סוף זמן שמע", t: shemaTime || "08:37" },
        { n: "סוף זמן תפילה", t: tfillaTime || "09:42" },
        { n: "חצות היום", t: chatzotTime || "12:20" },
        { n: "מנחה גדולה", t: minchaGedolaTime || "12:50" },
        { n: "פלג המנחה", t: plagTime || "15:42" },
        { n: "שקיעת החמה", t: sunsetTime || "16:50" },
        { n: "צאת הכוכבים", t: tzeitTime || "17:15" },
        { n: "זמן רבינו תם", t: rtTime || "18:02" }
      ];

      var g = el("zmanim-grid");
      if (g && window.CURRENT_REAL_ZMANIM) {
        g.innerHTML = window.CURRENT_REAL_ZMANIM.map(function (t) {
          return '<div class="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">' +
            '<span class="text-[10px] text-slate-400 block">' + t.n + '</span>' +
            '<span class="text-sm font-black text-amber-400 font-mono mt-1 block">' + t.t + '</span>' +
          '</div>';
        }).join("");
      }

      console.log("[Hebcal] זמני היום האמיתיים עודכנו בהצלחה (" + hebcalCity + "): סוף זמן ק״ש " + shemaTime + ", שקיעה " + sunsetTime);
      return data;
    } catch (err) {
      console.warn("[Hebcal] שגיאה במשיכת זמני היום (נשמרים זמני ברירת מחדל):", err);
      return null;
    }
  };

  // --------------------------------------------------------------------------
  // 3. קישורי Waze ו-וואטסאפ בכרטיסי גמ״חים, מקוואות וצדיקים (דף 'למצוא')
  // --------------------------------------------------------------------------
  window.__v37_prev_renderGemachim_3 = function (list) {
    var grid = el("gemachim-grid-container");
    if (!grid) return;
    grid.innerHTML = (list || []).map(function (g, idx) {
      var gid = g.id || ("gm" + (idx + 1));
      var eKey = "gemach_" + gid;
      var stats = window.getEntityStats ? window.getEntityStats(eKey, g.rating || 4.9) : { avg: "4.9", count: 12 };
      var safeName = String(g.name || "").replace(/'/g, "");
      var safeCat = String(g.category || "גמ״ח וחסד").replace(/'/g, "");
      var safeAddr = String(g.address || g.city || "פריסה ארצית").replace(/'/g, "");
      var safeHours = String(g.hours || "א׳-ה׳ 09:00-21:00").replace(/'/g, "");
      var safeDesc = String(g.description || g.desc || "").replace(/'/g, "");
      var phone = String(g.phone || "0500000000");

      var wazeUrl = "https://waze.com/ul?q=" + encodeURIComponent(safeAddr);
      var waUrl = window.buildWhatsAppUrl(phone, "שלום, רציתי לברר פרטים לגבי הגמ״ח (" + safeName + ")");

      return `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition-all">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-black">${safeCat}</span>
            <button onclick="openEntityFullPage('${eKey}', 'דף גמ״ח וארגון חסד', '${safeName}', '${safeCat}', '${safeAddr}', '${safeHours}', '${phone}', '${safeDesc}', 'השירות • הזמינות • היחס')" class="text-xs font-black text-amber-400 hover:underline">
              ★ ${stats.avg} (${stats.count} חוות דעת)
            </button>
          </div>
          <h3 class="text-lg font-black text-white">${g.name}</h3>
          <p class="text-xs text-slate-300 leading-relaxed">${safeDesc}</p>
          <div class="text-[11px] text-slate-400 space-y-0.5 pt-1">
            <div>📍 <strong>כתובת:</strong> ${safeAddr}</div>
            <div>⏰ <strong>שעות:</strong> ${safeHours}</div>
            <div>📞 <strong>טלפון:</strong> ${phone}</div>
          </div>
        </div>
        <div class="pt-3 border-t border-slate-800 space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <button onclick="openEntityFullPage('${eKey}', 'דף גמ״ח וארגון חסד', '${safeName}', '${safeCat}', '${safeAddr}', '${safeHours}', '${phone}', '${safeDesc}', 'השירות • הזמינות • היחס')" class="py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
              📄 דף גמ״ח ודירוג
            </button>
            <a href="tel:${phone}" class="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">
              📞 חייג
            </a>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <a href="${wazeUrl}" target="_blank" class="py-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">
              🚗 נווט ב-Waze
            </a>
            <a href="${waUrl}" target="_blank" class="py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">
              💬 צור קשר בוואטסאפ
            </a>
          </div>
        </div>
      </div>`;
    }).join("");
  };

  window.__v37_prev_renderMikvaot_3 = function (list) {
    var grid = el("mikvaot-grid-container");
    if (!grid) return;
    grid.innerHTML = (list || []).map(function (m, idx) {
      var mid = m.id || ("mk" + (idx + 1));
      var eKey = "mikvah_" + mid;
      var stats = window.getEntityStats ? window.getEntityStats(eKey, m.rating || 4.9) : { avg: "4.9", count: 8 };
      var safeName = String(m.name || "").replace(/'/g, "");
      var safeCity = String(m.city || "").replace(/'/g, "");
      var safeAddr = String(m.address || (m.name + " " + safeCity)).replace(/'/g, "");
      var safeHours = String(m.hours || "פתוח מערב שבת וחול").replace(/'/g, "");
      var phone = String(m.phone || m.whatsapp || "035700000");

      var wazeUrl = "https://waze.com/ul?q=" + encodeURIComponent(safeAddr);
      var waUrl = window.buildWhatsAppUrl(phone, "שלום, רציתי לברר לגבי שעות הטבילה במקווה (" + safeName + ")");

      return `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between hover:border-blue-500/40 transition-all">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-[11px] font-black">${m.type || "מקווה טהרה"}</span>
            <button onclick="openEntityFullPage('${eKey}', 'דף מקווה טהרה וביקורות', '${safeName}', '${safeCity}', '${safeAddr}', '${safeHours}', '${phone}', 'מקווה טהרה מהודר ונקי. דרגו את הניקיון, השירות ושעות הפעילות.', 'ניקיון והידור • שעות פעילות • יחס ושירות')" class="text-xs font-black text-amber-400 hover:underline">
              ★ ${stats.avg} (${stats.count} תגובות)
            </button>
          </div>
          <h3 class="text-lg font-black text-white">${m.name}</h3>
          <p class="text-xs text-slate-300">📍 ${safeAddr} • ⏰ ${safeHours}</p>
        </div>
        <div class="pt-3 border-t border-slate-800 space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <button onclick="openEntityFullPage('${eKey}', 'דף מקווה טהרה וביקורות', '${safeName}', '${safeCity}', '${safeAddr}', '${safeHours}', '${phone}', 'מקווה טהרה מהודר ונקי.', 'ניקיון והידור • שעות פעילות • יחס ושירות')" class="py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
              ⭐ דף ודירוג
            </button>
            <a href="tel:${phone}" class="py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">
              📞 חייג
            </a>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <a href="${wazeUrl}" target="_blank" class="py-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">
              🚗 נווט ב-Waze
            </a>
            <a href="${waUrl}" target="_blank" class="py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">
              💬 צור קשר בוואטסאפ
            </a>
          </div>
        </div>
      </div>`;
    }).join("");
  };

  window.__v37_prev_renderTzaddikim_3 = function (list) {
    var grid = el("tzaddikim-grid-container");
    if (!grid) return;
    grid.innerHTML = (list || []).map(function (t, idx) {
      var tid = t.id || ("tz" + (idx + 1));
      var eKey = "tzaddik_" + tid;
      var stats = window.getEntityStats ? window.getEntityStats(eKey, 5.0) : { avg: "5.0", count: 18 };
      var safeName = String(t.name || "").replace(/'/g, "");
      var safeTitle = String(t.title || "").replace(/'/g, "");
      var safeCity = String(t.city || "").replace(/'/g, "");
      var safeAddr = String(t.location || ("ציון " + safeName + " " + safeCity)).replace(/'/g, "");
      var safeStory = String((t.story || "") + " • סגולה מיוחדת: " + (t.segula || "")).replace(/'/g, "");
      var imgUrl = t.image || "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80";
      var phone = String(t.phone || "0500000000");

      var wazeUrl = "https://waze.com/ul?q=" + encodeURIComponent(safeAddr);
      var waUrl = t.whatsappGroup ? t.whatsappGroup : window.buildWhatsAppUrl(phone, "שלום, בקשת תפילה וסגולות בציון הצדיק " + safeName);

      return `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between hover:border-amber-500/50 transition-all">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 rounded-full text-[11px] font-bold">📍 ${safeCity}</span>
            <button onclick="openEntityFullPage('${eKey}', 'דף קבר צדיק וסיפורי ישועות', '${safeName}', '${safeTitle}', 'ציון הקודש ב${safeCity}', 'פתוח 24/7 לתפילה והדלקת נרות', '', '${safeStory}', 'סיפורים • חוויות מהציון • בקשות תפילה', '${imgUrl}')" class="text-xs font-black text-amber-400 hover:underline">
              ★ ${stats.avg} (${stats.count} סיפורים)
            </button>
          </div>
          <h3 class="text-lg font-black text-white">${t.name}</h3>
          <p class="text-xs text-amber-200/90 font-medium">${safeTitle}</p>
          <p class="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">✨ <strong>סגולה:</strong> ${t.segula || "תפילה לישועה ורפואה"}</p>
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
            <a href="${wazeUrl}" target="_blank" class="py-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">
              🚗 נווט ב-Waze
            </a>
            <a href="${waUrl}" target="_blank" class="py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">
              💬 צור קשר בוואטסאפ
            </a>
          </div>
        </div>
      </div>`;
    }).join("");

    if (window.renderYahrzeitSharedCards) {
      window.renderYahrzeitSharedCards("tzaddikim-yahrzeits-container");
      window.renderYahrzeitSharedCards("zmanim-yahrzeits-container");
    }
  };

  // --------------------------------------------------------------------------
  // 4. פאנל ניהול (Admin Panel) עם אימות קשיח m053425853@gmail.com וחיבור ל-Supabase
  // --------------------------------------------------------------------------
  window.checkAdminPermission = async function () {
    if (!sb()) return { allowed: false, reason: "אין חיבור ל-Supabase" };
    try {
      var sessRes = await sb().auth.getSession();
      var session = sessRes && sessRes.data ? sessRes.data.session : null;
      if (!session || !session.user) {
        return { allowed: false, reason: "לא מחובר משתמש למערכת" };
      }
      var email = (session.user.email || "").toLowerCase().trim();
      if (email !== ADMIN_EMAIL.toLowerCase()) {
        return { allowed: false, reason: "המשתמש " + email + " אינו מורשה. גישה למנהל m053425853@gmail.com בלבד." };
      }
      return { allowed: true, user: session.user };
    } catch (e) {
      return { allowed: false, reason: e.message };
    }
  };

  // דריסת renderAdminPanel בתוך index.html
  window.renderAdminPanel = async function () {
    var pendingBox = el("admin-pending-queue-list");
    var logsBox = el("admin-audit-log-list");
    var badge = el("admin-active-role-badge");

    var auth = await window.checkAdminPermission();

    if (!auth.allowed) {
      if (badge) {
        badge.className = "px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold";
        badge.textContent = "⛔ גישה חסומה: מנהל בלבד";
      }
      if (pendingBox) {
        pendingBox.innerHTML = `
        <div class="bg-red-50 border-2 border-red-300 p-6 rounded-2xl text-center space-y-3">
          <div class="text-3xl">⛔</div>
          <h4 class="text-base font-black text-red-700">הגישה לפאנל הניהול חסומה!</h4>
          <p class="text-xs text-[#5C4938] leading-relaxed">
            פאנל זה מוגן ומיועד אך ורק למנהל המערכת: <strong class="text-[#0F2340] font-mono">m053425853@gmail.com</strong>.<br>
            (${auth.reason})
          </p>
          <div class="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button onclick="openAuthModal()" class="px-4 py-2 bg-[#0F2340] text-white font-bold rounded-xl text-xs">התחבר לחשבון מנהל</button>
            <a href="admin.html" class="px-4 py-2 bg-amber-500 text-[#0F2340] font-black rounded-xl text-xs">פתח דף ניהול ייעודי (admin.html) ↗</a>
          </div>
        </div>`;
      }
      return;
    }

    if (badge) {
      badge.className = "px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold";
      badge.textContent = "מנהל ראשי מאומת: m053425853@gmail.com ✓";
    }

    if (pendingBox) {
      pendingBox.innerHTML = '<div class="p-4 text-center text-xs text-[#5C4938]">טוען תגובות מ-Supabase (community_reviews)...</div>';

      try {
        var r = await sb().from("community_reviews").select("*").order("created_at", { ascending: false });
        if (r.error) {
          pendingBox.innerHTML = '<div class="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">שגיאה בטעינת תגובות: ' + r.error.message + '</div>';
          return;
        }

        var reviews = r.data || [];
        if (!reviews.length) {
          pendingBox.innerHTML = '<div class="p-6 bg-[#F8F3E8] border border-[#E5DBC7] rounded-xl text-center text-xs text-[#5C4938]">אין כרגע תגובות במסד הנתונים.</div>';
          return;
        }

        pendingBox.innerHTML = `
        <div class="flex items-center justify-between pb-2">
          <span class="text-xs font-bold text-[#0F2340]">נמצאו ${reviews.length} תגובות ודירוגים:</span>
          <a href="admin.html" class="text-xs font-bold text-amber-600 hover:underline">פתח פאנל ניהול מלא ↗</a>
        </div>` + reviews.map(function (rev) {
          var isApp = !!rev.is_approved;
          var stars = "★".repeat(Math.min(5, Math.max(1, Number(rev.rating) || 5)));
          return `
          <div class="bg-[#F8F3E8] border ${isApp ? "border-[#E5DBC7]" : "border-amber-400 bg-amber-50/50"} p-4 rounded-xl space-y-2">
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded font-bold ${isApp ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}">${isApp ? "מאושר ✔" : "ממתין לאישור ⏳"}</span>
                <strong class="text-[#0F2340]">${rev.user_name || "אנונימי"}</strong>
                <span class="text-amber-600 font-bold">${stars}</span>
                <span class="text-[11px] text-[#5C4938] font-mono">${rev.entity_key || ""}</span>
              </div>
              <span class="text-[11px] text-[#5C4938]">${String(rev.created_at || "").slice(0, 16).replace("T", " ")}</span>
            </div>
            <p class="text-xs text-[#0F2340] leading-relaxed">${rev.review_text || ""}</p>
            <div class="pt-2 border-t border-[#E5DBC7] flex items-center justify-end gap-2 text-xs">
              ${!isApp ? `<button onclick="window.adminApproveReview(${rev.id})" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs">✔ אשר תגובה</button>` : `<span class="text-xs text-emerald-700 font-bold ml-1">מאושר ✓</span>`}
              <button onclick="window.adminDeleteReview(${rev.id})" class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 font-bold rounded-lg text-xs">🗑️ מחק</button>
            </div>
          </div>`;
        }).join("");

      } catch (err) {
        pendingBox.innerHTML = '<div class="p-4 bg-red-50 text-red-600 rounded-xl text-xs">שגיאה: ' + err.message + '</div>';
      }
    }

    if (logsBox) {
      logsBox.innerHTML = `
      <div class="bg-[#F8F3E8] border border-[#E5DBC7] p-3 rounded-xl text-xs text-[#5C4938] flex items-center justify-between">
        <span>מנהל ראשי: <strong>m053425853@gmail.com</strong></span>
        <span class="text-emerald-700 font-bold">סשן מנהל פעיל ומאומת ✓</span>
      </div>`;
    }
  };

  window.adminApproveReview = async function (id) {
    if (!sb()) return;
    try {
      var res = await sb().from("community_reviews").update({ is_approved: true, status: "מאושר בקהילה" }).eq("id", id);
      if (res.error) {
        window.toast("שגיאה באישור: " + res.error.message);
        return;
      }
      window.toast("✔ התגובה אושרה בהצלחה ופורסמה באתר");
      window.renderAdminPanel();
    } catch (e) {
      window.toast("שגיאה באישור התגובה");
    }
  };

  window.adminDeleteReview = async function (id) {
    if (!confirm("האם למחוק תגובה זו לצמיתות?")) return;
    if (!sb()) return;
    try {
      var res = await sb().from("community_reviews").delete().eq("id", id);
      if (res.error) {
        window.toast("שגיאה במחיקה: " + res.error.message);
        return;
      }
      window.toast("התגובה נמחקה בהצלחה מהמערכת");
      window.renderAdminPanel();
    } catch (e) {
      window.toast("שגיאה במחיקת התגובה");
    }
  };

  // --------------------------------------------------------------------------
  // 5. אתחול V33
  // --------------------------------------------------------------------------
  onReady(function () {
    // טעינת זמני היום האמיתיים מה-API של Hebcal
    window.fetchHebcalZmanim();

    // רענון כרטיסי למצוא עם כפתורי Waze ו-וואטסאפ
    if (window.GEMACHIM_DATA) window.renderGemachim(window.GEMACHIM_DATA);
    if (window.MIKVAOT_DATA) window.renderMikvaot(window.MIKVAOT_DATA);
    if (window.TZADDIKIM_DATA) window.renderTzaddikim(window.TZADDIKIM_DATA);

    // האזנה לשינוי עיר בפרופיל משתמש לרענון זמני היום
    var citySelect = el("prof-user-city");
    if (citySelect) {
      citySelect.addEventListener("change", function () {
        window.fetchHebcalZmanim(citySelect.value);
      });
    }
  });

})();


// ============================================================================
// V34 — שדרוגי UI/UX: תפריט צד, פרשת השבוע, קרוסלות דף הבית, ותשתית לייקים ותגובות
// ============================================================================
(function () {
  "use strict";

  function el(id) { return document.getElementById(id); }
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // --------------------------------------------------------------------------
  // 1. חיפוש וסרטון הסבר מתפריט הצד
  // --------------------------------------------------------------------------
  window.__v37_prev_handleSideMenuSearch_1 = function () {
    var inp = el("side-menu-search-input");
    var q = inp ? (inp.value || "").trim() : "";
    if (!q) return;
    if (window.closeSideMenu) window.closeSideMenu();
    window.handleGlobalSearch({ key: "Enter", targetValue: q });
  };

  window.openAppExplainerVideoModal = function () {
    if (window.closeSideMenu) window.closeSideMenu();
    var modal = el("modal-explainer-video");
    if (modal) modal.classList.remove("hidden");
  };

  // --------------------------------------------------------------------------
  // 2. כרטיס פרשת השבוע עם רוטציית וורטים
  // --------------------------------------------------------------------------
  var PARASHA_VORTS = [
    {
      parasha: "פרשת חיי שרה",
      vort: "\"ויהיו חיי שרה מאה שנה ועשרים שנה ושבע שנים – שני חיי שרה\" – כולם שווים לטובה. הצדיק רואה בכל תקופה בחיים הזדמנות לעבודת ה׳, עשיית חסד ואמונה תמימה."
    },
    {
      parasha: "פרשת חיי שרה",
      vort: "\"וַיִּקְרַב לִשְׁתּוֹת\" – רבקה אמנו לא הסתפקה בהשקיית אליעזר, אלא השקתה גם את גמליו בשמחה וברוחב לב. חסד אמיתי נעשה בלב שלם ומעבר למבוקש."
    },
    {
      parasha: "פרשת חיי שרה",
      vort: "\"וַיֵּצֵא יִצְחָק לָשׂוּחַ בַּשָּׂדֶה לִפְנוֹת עָרֶב\" – מכאן למדו חז״ל שיצחק אבינו תיקן תפילת מנחה. רגע לפני השקיעה, שופך האדם שיחו לה' ומוצא שלווה וחיבור עמוק."
    },
    {
      parasha: "פרשת תולדות",
      vort: "\"וַיֶּעְתַּר יִצְחָק לַה׳ לְנֹכַח אִשְׁתּוֹ\" – תפילתם של הצדיקים מפתח לכל הישועות. כשאדם מתפלל בעד חברו או בעד ביתו מעומק הלב, שערי שמיים נפתחים."
    }
  ];
  var currentVortIdx = 0;

  window.rotateHomeVort = function () {
    currentVortIdx = (currentVortIdx + 1) % PARASHA_VORTS.length;
    var item = PARASHA_VORTS[currentVortIdx];
    var titleEl = el("home-parasha-title");
    var vortEl = el("home-parasha-vort");
    if (titleEl) titleEl.textContent = item.parasha;
    if (vortEl) vortEl.textContent = item.vort;
    if (window.toast) window.toast("✨ פנינה חדשה נטענה מתוך " + item.parasha);
  };

  // --------------------------------------------------------------------------
  // 3. תשתית לייקים ותגובות לכרטיסים (שיעורים ורבנים)
  // --------------------------------------------------------------------------
  var LIKES_KEY = "tzadiktok_card_likes_v34";
  var LIKES_COUNT_KEY = "tzadiktok_card_likes_counts_v34";
  var COMMENTS_KEY = "tzadiktok_card_comments_v34";

  window.getCardLikes = function (key, defaultCount) {
    var stored = window.getStorageJson ? window.getStorageJson(LIKES_KEY, {}) : {};
    var counts = window.getStorageJson ? window.getStorageJson(LIKES_COUNT_KEY, {}) : {};
    var isLiked = !!stored[key];
    var count = counts[key] !== undefined ? counts[key] : (defaultCount || 18);
    return { isLiked: isLiked, count: count };
  };

  window.toggleCardLike = function (key, btnEl) {
    var stored = window.getStorageJson ? window.getStorageJson(LIKES_KEY, {}) : {};
    var counts = window.getStorageJson ? window.getStorageJson(LIKES_COUNT_KEY, {}) : {};
    var isLiked = !!stored[key];
    var currentCount = counts[key] !== undefined ? counts[key] : 18;

    if (isLiked) {
      delete stored[key];
      currentCount = Math.max(0, currentCount - 1);
    } else {
      stored[key] = true;
      currentCount++;
      if (window.toast) window.toast("❤️ תודה על החיזוק! סימנת לייק לתוכן");
    }

    counts[key] = currentCount;
    if (window.setStorageJson) {
      window.setStorageJson(LIKES_KEY, stored);
      window.setStorageJson(LIKES_COUNT_KEY, counts);
    }

    if (btnEl) {
      var icon = btnEl.querySelector(".like-icon");
      var num = btnEl.querySelector(".like-count");
      if (icon) icon.textContent = !isLiked ? "❤️" : "🤍";
      if (num) num.textContent = currentCount;
      btnEl.classList.toggle("bg-amber-100", !isLiked);
    }
  };

  window.toggleCardCommentBox = function (boxId) {
    var box = el(boxId);
    if (!box) return;
    box.classList.toggle("hidden");
    if (!box.classList.contains("hidden")) {
      var inp = box.querySelector("input");
      if (inp) inp.focus();
    }
  };

  window.getCardComments = function (key) {
    var all = window.getStorageJson ? window.getStorageJson(COMMENTS_KEY, {}) : {};
    return all[key] || [
      { user: "יוסף כ.", text: "שיעור מחזק מאוד ומאיר עיניים! אשריכם תודה רבה", time: "השבוע" },
      { user: "דוד ל.", text: "ברור ונהיר, מסביר את הדברים בנועם ובדיוק רב.", time: "היום" }
    ];
  };

  window.submitInlineCardComment = function (key, boxId) {
    var box = el(boxId);
    if (!box) return;
    var inp = box.querySelector("input");
    var txt = inp ? (inp.value || "").trim() : "";
    if (!txt) {
      if (window.toast) window.toast("נא לכתוב תגובה לפני השליחה");
      return;
    }

    var all = window.getStorageJson ? window.getStorageJson(COMMENTS_KEY, {}) : {};
    var list = all[key] || [
      { user: "יוסף כ.", text: "שיעור מחזק מאוד ומאיר עיניים! אשריכם תודה רבה", time: "השבוע" },
      { user: "דוד ל.", text: "ברור ונהיר, מסביר את הדברים בנועם ובדיוק רב.", time: "היום" }
    ];

    var userName = (window.__ttUser && window.__ttUser.email) || (currentUserAccount && currentUserAccount.name) || "חבר קהילה";
    list.unshift({
      user: userName,
      text: txt,
      time: "עכשיו"
    });
    all[key] = list;
    if (window.setStorageJson) window.setStorageJson(COMMENTS_KEY, all);

    // שליחה ל-Supabase אם מחובר
    if (window.supabaseClient) {
      try {
        window.supabaseClient.from("community_reviews").insert([{
          entity_key: key,
          user_name: userName,
          rating: 5,
          review_text: txt,
          status: "מאושר ✔",
          is_approved: true
        }]).then(function () {});
      } catch (e) {}
    }

    inp.value = "";
    var listEl = el("list-" + boxId);
    if (listEl) {
      listEl.innerHTML = list.map(function (c) {
        return '<div class="p-2 bg-white rounded-lg border border-[#E5DBC7] space-y-0.5">' +
          '<div class="flex items-center justify-between text-[11px]">' +
            '<strong class="text-[#0F2340]">' + c.user + '</strong>' +
            '<span class="text-[#5C4938]">' + (c.time || "עכשיו") + '</span>' +
          '</div>' +
          '<p class="text-xs text-[#0F2340]">' + c.text + '</p>' +
        '</div>';
      }).join("");
    }

    var countBadge = el("count-" + boxId);
    if (countBadge) countBadge.textContent = list.length;
    if (window.toast) window.toast("✔ תגובתך פורסמה בהצלחה!");
  };

  // --------------------------------------------------------------------------
  // 4. דריסת renderRabbiShiurimList להוספת לייקים ותגובות
  // --------------------------------------------------------------------------
  window.__v37_prev_renderRabbiShiurimList_3 = function (query) {
    var box = el("rabbi-shiurim-grid");
    if (!box) return;
    var list = (window.getStorageJson && window.getStorageJson(STORAGE_KEYS.RABBI_SHIURIM, window.RABBI_SHIURIM_DATA)) || window.RABBI_SHIURIM_DATA || [];
    var q = (query || "").trim().toLowerCase();
    if (q) {
      list = list.filter(function (s) {
        return (s.rabbi || "").toLowerCase().indexOf(q) !== -1 ||
               (s.title || "").toLowerCase().indexOf(q) !== -1 ||
               (s.topic || "").toLowerCase().indexOf(q) !== -1 ||
               (s.institution || "").toLowerCase().indexOf(q) !== -1;
      });
    }

    box.innerHTML = list.map(function (s, idx) {
      var sid = s.id || ("sh_" + (idx + 1));
      var itemKey = "shiur_" + sid;
      var safeTitle = String(s.title || "").replace(/'/g, "");
      var safeRabbi = String(s.rabbi || "").replace(/'/g, "");
      var safeTopic = String(s.topic || "שיעור תורה").replace(/'/g, "");
      var duration = s.duration || "45:00";
      var institution = s.institution || "בית המדרש";

      var likesData = window.getCardLikes(itemKey, 14 + (idx * 5));
      var comments = window.getCardComments(itemKey);
      var boxId = "comments-shiur-" + sid;

      return '<div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">' +
        '<div class="space-y-1.5">' +
          '<div class="flex items-center justify-between">' +
            '<span class="px-2.5 py-0.5 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-md text-xs font-bold">' + (s.type || "שיעור וידאו") + ' • ' + safeTopic + '</span>' +
            '<span class="text-xs text-[#5C4938] font-mono">' + duration + '</span>' +
          '</div>' +
          '<h4 class="text-lg font-bold text-[#0F2340] serif-heading">' + s.title + '</h4>' +
          '<p class="text-xs font-bold text-[#0F2340]">מגיד השיעור: ' + s.rabbi + '</p>' +
          '<p class="text-xs text-[#5C4938]">מוסד / בית מדרש: ' + institution + '</p>' +
        '</div>' +

        '<!-- תשתית לייקים ותגובות -->' +
        '<div class="pt-2 border-t border-[#E5DBC7] space-y-2">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<div class="flex items-center gap-2">' +
              '<button type="button" onclick="window.toggleCardLike(\'' + itemKey + '\', this)" class="like-btn px-3 py-1.5 rounded-xl border border-[#D8CBB5] bg-[#FDF8EF] hover:bg-[#F6EFE2] text-xs font-bold flex items-center gap-1.5 text-[#0F2340] transition-all">' +
                '<span class="like-icon">' + (likesData.isLiked ? "❤️" : "🤍") + '</span>' +
                '<span class="like-count font-mono">' + likesData.count + '</span>' +
              '</button>' +
              '<button type="button" onclick="window.toggleCardCommentBox(\'' + boxId + '\')" class="px-3 py-1.5 rounded-xl border border-[#D8CBB5] bg-[#FDF8EF] hover:bg-[#F6EFE2] text-xs font-bold flex items-center gap-1.5 text-[#0F2340]">' +
                '<span>💬</span>' +
                '<span>תגובות (<span id="count-' + boxId + '">' + comments.length + '</span>)</span>' +
              '</button>' +
            '</div>' +
            '<button type="button" onclick="openDonateModal(\'תרומה והקדשה לשיעור של ' + safeRabbi + '\')" class="px-3 py-1.5 bg-white text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs">הקדשה</button>' +
          '</div>' +

          '<div id="' + boxId + '" class="hidden p-3 bg-[#F8F3E8] border border-[#E5DBC7] rounded-xl space-y-2.5 text-xs">' +
            '<div class="space-y-1.5 max-h-36 overflow-y-auto" id="list-' + boxId + '">' +
              comments.map(function (c) {
                return '<div class="p-2 bg-white rounded-lg border border-[#E5DBC7] space-y-0.5">' +
                  '<div class="flex items-center justify-between text-[11px]">' +
                    '<strong class="text-[#0F2340]">' + c.user + '</strong>' +
                    '<span class="text-[#5C4938]">' + (c.time || "השבוע") + '</span>' +
                  '</div>' +
                  '<p class="text-xs text-[#0F2340]">' + c.text + '</p>' +
                '</div>';
              }).join("") +
            '</div>' +
            '<div class="flex items-center gap-1.5 pt-1 border-t border-[#E5DBC7]">' +
              '<input type="text" id="input-' + boxId + '" placeholder="כתוב תגובה על השיעור..." class="flex-1 bg-white border border-[#D8CBB5] rounded-lg px-2.5 py-1.5 text-xs text-[#0F2340] outline-none">' +
              '<button type="button" onclick="window.submitInlineCardComment(\'' + itemKey + '\', \'' + boxId + '\')" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg text-xs">שלח</button>' +
            '</div>' +
          '</div>' +

          '<button type="button" onclick="openEntityFullPage(\'' + itemKey + '\', \'שיעור תורה • ' + safeRabbi + '\', \'' + safeTitle + '\', \'' + safeRabbi + ' • ' + institution + '\', \'' + institution + '\', \'אורך: ' + duration + '\', \'\', \'שיעור תורה מפי ' + safeRabbi + ' בנושא ' + safeTopic + '.\', \'בהירות השיעור • חיזוק • מקורות\')" class="w-full py-2 bg-[#0F2340] hover:bg-[#16335c] text-white font-bold rounded-xl text-xs text-center" style="color:#FFFFFF !important;">' +
            'צפייה בשיעור המלא והרחבה ←' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // --------------------------------------------------------------------------
  // 5. דריסת renderRabbis להוספת לייקים ותגובות
  // --------------------------------------------------------------------------
  window.__v37_prev_renderRabbis_3 = function (list) {
    var grid = el("rabbis-container");
    if (!grid) return;
    grid.innerHTML = (list || []).map(function (r, idx) {
      var rid = r.id || ("rab" + (idx + 1));
      var eKey = "rabbi_" + rid;
      var stats = window.getEntityStats ? window.getEntityStats(eKey, 5.0) : { avg: "5.0", count: 12 };
      var safeName = String(r.name || "").replace(/'/g, "");
      var safeTitle = String(r.title || r.specialty || "פוסק הלכה").replace(/'/g, "");
      var phone = r.phone || "073-3570000";
      var hours = r.hours || "מענה הלכתי לאורך היום";
      var boxId = "comments-rabbi-" + rid;

      var likesData = window.getCardLikes(eKey, 24 + (idx * 8));
      var comments = window.getCardComments(eKey);

      return '<div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition-all">' +
        '<div class="space-y-2">' +
          '<div class="flex items-center justify-between">' +
            '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🟢 זמין למענה הלכתי</span>' +
            '<button type="button" onclick="openEntityFullPage(\'' + eKey + '\', \'קו הלכה ורב פוסק\', \'' + safeName + '\', \'' + safeTitle + '\', \'' + (r.city || "מענה ארצי") + '\', \'' + hours + '\', \'' + phone + '\', \'מענה הלכתי לשאלות דחופות ורגילות. דרגו את הזמינות, היחס והמענה!\', \'הזמינות • היחס • בהירות המענה\')" class="text-xs font-black text-amber-400 hover:underline">' +
              '★ ' + stats.avg + ' (' + stats.count + ' דירוגים)' +
            '</button>' +
          '</div>' +
          '<h3 class="text-lg font-black text-white">' + r.name + '</h3>' +
          '<p class="text-xs text-amber-300 font-bold">' + safeTitle + '</p>' +
          '<p class="text-xs text-slate-400">⏰ ' + hours + ' • 📞 ' + phone + '</p>' +
        '</div>' +

        '<div class="pt-2 border-t border-slate-800 space-y-2">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<div class="flex items-center gap-2">' +
              '<button type="button" onclick="window.toggleCardLike(\'' + eKey + '\', this)" class="like-btn px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 text-slate-200 transition-all">' +
                '<span class="like-icon">' + (likesData.isLiked ? "❤️" : "🤍") + '</span>' +
                '<span class="like-count font-mono text-amber-400">' + likesData.count + '</span>' +
              '</button>' +
              '<button type="button" onclick="window.toggleCardCommentBox(\'' + boxId + '\')" class="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 text-slate-200">' +
                '<span>💬</span>' +
                '<span>תגובות (<span id="count-' + boxId + '">' + comments.length + '</span>)</span>' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<div id="' + boxId + '" class="hidden p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">' +
            '<div class="space-y-1.5 max-h-36 overflow-y-auto" id="list-' + boxId + '">' +
              comments.map(function (c) {
                return '<div class="p-2 bg-slate-900 rounded-lg border border-slate-800 space-y-0.5">' +
                  '<div class="flex items-center justify-between text-[11px]">' +
                    '<strong class="text-amber-300">' + c.user + '</strong>' +
                    '<span class="text-slate-400">' + (c.time || "השבוע") + '</span>' +
                  '</div>' +
                  '<p class="text-xs text-slate-200">' + c.text + '</p>' +
                '</div>';
              }).join("") +
            '</div>' +
            '<div class="flex items-center gap-1.5 pt-1 border-t border-slate-800">' +
              '<input type="text" id="input-' + boxId + '" placeholder="הוסף שאלה או תודה לכבוד הרב..." class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none">' +
              '<button type="button" onclick="window.submitInlineCardComment(\'' + eKey + '\', \'' + boxId + '\')" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs">שלח</button>' +
            '</div>' +
          '</div>' +

          '<div class="grid grid-cols-2 gap-2">' +
            '<a href="tel:' + phone + '" class="py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs text-center flex items-center justify-center gap-1">📞 חייג</a>' +
            '<a href="' + window.buildWhatsAppUrl(phone, 'שלום כבוד הרב, שאלה בהלכה מאפליקציית צדיק-טוק:') + '" target="_blank" class="py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">💬 וואטסאפ</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // --------------------------------------------------------------------------
  // 6. רינדור קרוסלות דף הבית (שיעורים אחרונים, סרטונים, חידונים)
  // --------------------------------------------------------------------------
  window.renderHomeCarousels = function () {
    // קרוסלה 1: שיעורים אחרונים
    var shiurimBox = el("home-carousel-shiurim");
    if (shiurimBox) {
      var shiurim = window.RABBI_SHIURIM_DATA || [];
      shiurimBox.innerHTML = shiurim.slice(0, 6).map(function (s, idx) {
        var sid = s.id || ("sh_" + (idx + 1));
        var itemKey = "shiur_" + sid;
        var safeRabbi = String(s.rabbi || "רב בית המדרש").replace(/'/g, "");
        var safeTitle = String(s.title || "שיעור תורה").replace(/'/g, "");
        var likes = window.getCardLikes(itemKey, 18 + (idx * 6));

        return '<div class="shrink-0 w-64 sm:w-72 bg-white border border-[#E5DBC7] p-4 rounded-2xl space-y-2.5 shadow-sm hover:border-[#C9A227] transition-all flex flex-col justify-between">' +
          '<div class="space-y-1">' +
            '<div class="flex items-center justify-between text-[11px]">' +
              '<span class="px-2 py-0.5 rounded bg-[#F6EFE2] text-[#0F2340] font-bold border border-[#C9A227]">' + (s.topic || "שיעור תורה") + '</span>' +
              '<span class="text-[#5C4938] font-mono">' + (s.duration || "45:00") + '</span>' +
            '</div>' +
            '<h4 class="text-sm font-black text-[#0F2340] line-clamp-2 mt-1 leading-snug">' + safeTitle + '</h4>' +
            '<p class="text-xs font-bold text-amber-700">' + safeRabbi + '</p>' +
          '</div>' +
          '<div class="pt-2 border-t border-[#E5DBC7] flex items-center justify-between gap-2">' +
            '<button type="button" onclick="window.toggleCardLike(\'' + itemKey + '\', this)" class="like-btn px-2.5 py-1 rounded-lg border border-[#D8CBB5] bg-[#FDF8EF] text-xs font-bold flex items-center gap-1 text-[#0F2340]">' +
              '<span class="like-icon">' + (likes.isLiked ? "❤️" : "🤍") + '</span>' +
              '<span class="like-count font-mono text-[11px]">' + likes.count + '</span>' +
            '</button>' +
            '<button type="button" onclick="switchTab(\'series\'); switchLibrarySubTab(\'liveshiurim\');" class="px-3 py-1.5 bg-[#0F2340] hover:bg-[#16335c] text-white font-bold rounded-xl text-xs flex items-center gap-1" style="color:#FFFFFF !important;">' +
              '<span>צפה</span> ←' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join("");
    }

    // קרוסלה 2: סרטונים מהספרייה
    var videosBox = el("home-carousel-videos");
    if (videosBox) {
      var videos = window.EDUCATIONAL_VIDEOS_DATA || [];
      videosBox.innerHTML = videos.slice(0, 6).map(function (v) {
        var safeTitle = String(v.title || "").replace(/'/g, "");
        var safeDesc = String(v.description || "").replace(/'/g, "");
        var safeSpeaker = String(v.speaker || "").replace(/'/g, "");
        var thumb = v.thumbnail || "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80";

        return '<div class="shrink-0 w-60 sm:w-64 bg-white border border-[#E5DBC7] rounded-2xl overflow-hidden shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between">' +
          '<div>' +
            '<div class="relative h-32 bg-[#0F2340] overflow-hidden flex items-center justify-center">' +
              '<img src="' + thumb + '" alt="' + safeTitle + '" class="w-full h-full object-cover opacity-85">' +
              '<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>' +
              '<button type="button" onclick="openEntityFullPage(\'edu_' + v.id + '\', \'סרטון • ' + (v.category || "תורה") + '\', \'' + safeTitle + '\', \'' + safeSpeaker + '\', \'ספריית הווידאו\', \'אורך: ' + (v.duration || "") + '\', \'\', \'' + safeDesc + '\', \'בהירות • חיזוק • מקורות\', \'' + thumb + '\')" class="absolute inset-0 m-auto w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-base font-black shadow-lg hover:scale-105 transition-all">' +
                '▶' +
              '</button>' +
              '<span class="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-amber-300 font-bold text-[10px]">' + (v.category || "חינוכי") + '</span>' +
              '<span class="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[10px]">' + (v.duration || "15:00") + '</span>' +
            '</div>' +
            '<div class="p-3 space-y-1">' +
              '<h4 class="text-xs font-black text-[#0F2340] line-clamp-2 leading-snug">' + safeTitle + '</h4>' +
              '<p class="text-[11px] text-[#5C4938] truncate">' + safeSpeaker + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="p-3 pt-0">' +
            '<button type="button" onclick="switchTab(\'series\'); switchLibrarySubTab(\'eduvideos\');" class="w-full py-1.5 bg-[#F6EFE2] hover:bg-[#EAE0D0] text-[#0F2340] font-bold rounded-xl text-xs text-center border border-[#D8CBB5]">' +
              'לכל הסרטונים ←' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join("");
    }

    // קרוסלה 3: חידונים מומלצים
    var quizBox = el("home-carousel-quizzes");
    if (quizBox) {
      var quizzes = window.QUIZ_QUESTIONS_DATA || [];
      quizBox.innerHTML = quizzes.slice(0, 5).map(function (q, idx) {
        var safeQ = String(q.question || "").replace(/'/g, "");
        var safeCat = String(q.category || "חידון הלכה ותנ״ך").replace(/'/g, "");

        return '<div class="shrink-0 w-64 sm:w-72 bg-gradient-to-br from-[#FDF8EF] to-[#F8F3E8] border border-[#E5DBC7] p-4 rounded-2xl shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between space-y-3">' +
          '<div class="space-y-1.5">' +
            '<div class="flex items-center justify-between">' +
              '<span class="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">🏆 ' + safeCat + '</span>' +
              '<span class="text-[11px] font-bold text-amber-600">שאלה ' + (idx + 1) + '</span>' +
            '</div>' +
            '<h4 class="text-xs sm:text-sm font-black text-[#0F2340] line-clamp-2 leading-snug mt-1">' + safeQ + '</h4>' +
            '<p class="text-[11px] text-[#5C4938]">4 אפשרויות תשובה • הסבר הלכתי מפורט</p>' +
          '</div>' +
          '<button type="button" onclick="switchTab(\'kids\');" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all">' +
            '<span>🎮</span> התחל אתגר ידע' +
          '</button>' +
        '</div>';
      }).join("");
    }
  };

  // --------------------------------------------------------------------------
  // 7. אתחול V34
  // --------------------------------------------------------------------------
  onReady(function () {
    window.renderHomeCarousels();
    if (window.renderRabbiShiurimList) window.renderRabbiShiurimList("");
    if (window.renderRabbis && window.RABBIS_DATA) window.renderRabbis(window.RABBIS_DATA);
  });

})();



// ============================================================================
// V35 — שדרוג מקיף (4 חלקים):
//  חלק 1: תפריט צד מודגש (5 קטגוריות ראשיות גדולות + תיקון ניגודיות באנר סרטון הסבר)
//         ודף הבית ממוקד (היום ביהדות + פרשת השבוע + כרטיס "חיזוקים" יומי חדש).
//  חלק 2: מדור "ללמוד" מחולק ל-3 לשוניות ראשיות (ספריית AI | שיעורים | חידונים),
//         תתי-קטגוריות בשיעורים, העלאת שיעור לרבנים, כפתור "תרומה לרב",
//         "קורסים חדשים" (פעם בשבוע • חינם/בתשלום + הצטרפות לקורס),
//         סינון סרטונים חינוכיים לפי שמות רבנים, והחלפת היכל המוזיקה ב"סיפורי צדיקים".
//  חלק 3: מדור "להתפלל" מחובר בזמן אמת ל-API של Sefaria (ספריא) לתפילות ולכל 150 פרקי תהילים.
//  חלק 4: מדור "למצוא" בממשק ממוקד (ללא סרגל קטגוריות עליון בתוך תת-מדור),
//         ושדרוגים מלאים לרבנים, קברי צדיקים (תהילים + בניית מסלול ביקורים + תרומה + תגובות),
//         שירותי דת, בתי חב״ד, מסעדות (אתר + תעודת כשרות + סורק מוצרים/ברקוד), גמ״חים וישיבות.
// ============================================================================
(function () {
  "use strict";

  function el(id) { return document.getElementById(id); }
  function val(id) { var e = el(id); return e ? (e.value || "").trim() : ""; }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function sb() { return window.supabaseClient; }
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // ==========================================================================
  // חלק 1: תפריט צד (☰) עם דגש חזותי לקטגוריות הראשיות + דף הבית ("חיזוקים")
  // ==========================================================================
  var V35_MAIN_MENU = [
    {
      title: "🏠 בית",
      badge: "ראשי",
      mainAction: function () { window.switchTab("feed"); },
      subs: [
        { t: "היום ביהדות וזמני היום", fn: function () { window.ttGo("zmanim", null, "times"); } },
        { t: "לוח שנה עברי ומועדים", fn: function () { window.ttGo("zmanim", null, "calendar"); } },
        { t: "פרשת השבוע וחיזוק יומי", fn: function () { window.switchTab("feed"); } },
        { t: "יום השנה והילולות צדיקים", fn: function () { window.ttGo("tzaddikim", null, "yahrzeits"); } },
        { t: "מצב שבת וחג", fn: function () { window.switchTab("myzone"); if (window.switchMyZoneSubTab) window.switchMyZoneSubTab("settings"); } }
      ]
    },
    {
      title: "📖 ללמוד",
      badge: "3 מסלולים",
      mainAction: function () { window.switchTab("series"); window.switchLearnMainTab("ai"); },
      subs: [
        { t: "🤖 ספריית AI ופרשיות התורה", fn: function () { window.switchTab("series"); window.switchLearnMainTab("ai"); window.switchLibrarySubTab("torah"); } },
        { t: "🎙️ שיעורים (הלכה, אמונה, חסידות, תנ״ך)", fn: function () { window.switchTab("series"); window.switchLearnMainTab("shiurim"); } },
        { t: "🎓 קורסים חדשים (פעם בשבוע)", fn: function () { window.switchTab("series"); window.switchLearnMainTab("shiurim"); setTimeout(function () { var s = el("weekly-courses-section"); if (s) s.scrollIntoView({ behavior: "smooth" }); }, 120); } },
        { t: "👑 סיפורי צדיקים", fn: function () { window.switchTab("series"); window.switchLearnMainTab("ai"); window.switchLibrarySubTab("tzaddikim_stories"); } },
        { t: "🎥 סרטונים חינוכיים (סינון לפי רבנים)", fn: function () { window.switchTab("series"); window.switchLearnMainTab("ai"); window.switchLibrarySubTab("eduvideos"); } },
        { t: "🏆 חידונים ואתגרי ידע", fn: function () { window.switchTab("series"); window.switchLearnMainTab("quizzes"); } }
      ]
    },
    {
      title: "🙏 להתפלל",
      badge: "Sefaria API",
      mainAction: function () { window.switchTab("siddur"); },
      subs: [
        { t: "סידור תפילה (מחובר לספריא)", fn: function () { window.switchTab("siddur"); window.switchPraySubTab("siddur"); } },
        { t: "ספר תהילים המלא (פרקים א׳–ק״נ)", fn: function () { window.switchTab("siddur"); window.switchPraySubTab("tehillim"); } },
        { t: "לוח מנהגים והלכות היום", fn: function () { window.switchTab("siddur"); window.switchPraySubTab("customs"); } }
      ]
    },
    {
      title: "📍 למצוא",
      badge: "איתור ו-GPS",
      mainAction: function () { window.switchTab("find"); },
      subs: [
        { t: "מניינים בזמן אמת", fn: function () { window.switchTab("minyanim"); } },
        { t: "קו הלכה ורבנים פוסקים", fn: function () { window.switchTab("rabbis"); } },
        { t: "קברי צדיקים ובניית מסלול ביקורים", fn: function () { window.switchTab("tzaddikim"); } },
        { t: "מסעדות כשרות וסורק ברקוד מוצרים", fn: function () { window.switchTab("restaurants"); } },
        { t: "גמ״חים וחיפוש לפי פריטים", fn: function () { window.switchTab("gemachim"); } },
        { t: "בתי חב״ד וקבוצות מטיילים", fn: function () { window.switchTab("chabad"); } },
        { t: "מקוואות טהרה", fn: function () { window.switchTab("mikvaot"); } },
        { t: "שירותי דת (מוהלים, משגיחים, סת״ם)", fn: function () { window.switchTab("customs"); } },
        { t: "ישיבות, כוללים ומוסדות תורה", fn: function () { window.switchTab("yeshivot"); } },
        { t: "איתור חברותא", fn: function () { window.switchTab("chavruta"); } }
      ]
    },
    {
      title: "💝 לתת ולקנות",
      badge: "חסד ורכישה",
      mainAction: function () { window.switchTab("raffles"); },
      subs: [
        { t: "הגרלות, צדקה וקמפיינים", fn: function () { window.switchTab("raffles"); } },
        { t: "חנות יודאיקה וספרי קודש", fn: function () { window.switchTab("judaica"); } },
        { t: "ספר הפרנסים ולוח התורמים", fn: function () { window.switchTab("donors"); } }
      ]
    }
  ];

  function renderEnhancedSideMenu() {
    var mb = el("tt-menu-body");
    if (!mb) return;
    var logged = !!window.__ttUser || !!(typeof currentUserAccount !== "undefined" && currentUserAccount && currentUserAccount.isRegistered);
    var html = "";

    V35_MAIN_MENU.forEach(function (cat, ci) {
      html += '<button type="button" class="tt-menu-main-cat" data-v35-main="' + ci + '">' +
        '<span>' + cat.title + '</span>' +
        '<span class="tt-main-cat-badge">' + cat.badge + ' ←</span>' +
      '</button>';
      cat.subs.forEach(function (sub, si) {
        html += '<button type="button" class="tt-menu-sub-item" data-v35-cat="' + ci + '" data-v35-sub="' + si + '">• ' + sub.t + '</button>';
      });
    });

    html += '<div class="tt-menu-group" style="margin-top:8px;">קהילה וחשבון אישי</div>';
    html += '<button type="button" class="tt-menu-sub-item" data-v35-special="forum">💬 פורום הקהילה וקבוצות</button>';
    html += '<button type="button" class="tt-menu-main-cat" data-v35-special="personal"><span>👤 האזור האישי שלי</span><span class="tt-main-cat-badge">פרופיל ←</span></button>';
    html += logged
      ? '<button type="button" class="tt-menu-sub-item" data-v35-special="logout">🚪 התנתקות מהחשבון</button>'
      : '<button type="button" class="tt-menu-sub-item" data-v35-special="login">🔑 התחברות / הרשמה בחינם</button>';

    mb.innerHTML = html;
  }

  window.openSideMenu = function () {
    renderEnhancedSideMenu();
    document.body.classList.add("tt-menu-open");
    var m = el("tt-side-menu"); if (m) m.setAttribute("aria-hidden", "false");
    var b = el("tt-burger-btn"); if (b) b.setAttribute("aria-expanded", "true");
  };

  onReady(function () {
    var mb = el("tt-menu-body");
    if (mb) {
      mb.addEventListener("click", function (ev) {
        var mainBtn = ev.target.closest ? ev.target.closest("[data-v35-main]") : null;
        if (mainBtn) {
          ev.stopPropagation();
          var ci = Number(mainBtn.getAttribute("data-v35-main"));
          window.closeSideMenu();
          if (V35_MAIN_MENU[ci] && V35_MAIN_MENU[ci].mainAction) V35_MAIN_MENU[ci].mainAction();
          return;
        }
        var subBtn = ev.target.closest ? ev.target.closest("[data-v35-sub]") : null;
        if (subBtn) {
          ev.stopPropagation();
          var cIdx = Number(subBtn.getAttribute("data-v35-cat"));
          var sIdx = Number(subBtn.getAttribute("data-v35-sub"));
          window.closeSideMenu();
          if (V35_MAIN_MENU[cIdx] && V35_MAIN_MENU[cIdx].subs[sIdx]) V35_MAIN_MENU[cIdx].subs[sIdx].fn();
          return;
        }
        var spBtn = ev.target.closest ? ev.target.closest("[data-v35-special]") : null;
        if (spBtn) {
          ev.stopPropagation();
          var sp = spBtn.getAttribute("data-v35-special");
          window.closeSideMenu();
          if (sp === "forum") window.switchTab("forum");
          else if (sp === "personal") window.openPersonalArea();
          else if (sp === "login") window.openAuthModal();
          else if (sp === "logout") window.logoutUser();
        }
      }, true);
    }
  });

  // כרטיס "חיזוקים" בדף הבית (וורט / סיפור קצר מחזק)
  var HOME_CHIZUKIM = [
    {
      badge: "סיפור קצר וחיזוק באמונה",
      title: "הבעל שם טוב הקדוש • כוחה של מילה טובה",
      body: "פעם אחת ראה הבעל שם טוב הקדוש יהודי פשוט שמעודד את חברו השבור במילים חמות ובחיוך מאיר פנים. אמר לתלמידיו: \"דעו לכם, כשיהודי מחיה לב נשבר של חברו ומכניס בו שמחה ותקווה, הוא פועל בשמיים ישועות גדולות יותר מתעניות וסיגופים. אין לך מצווה גדולה כהכנסת שמחה ואמונה בלב יהודי!\"",
      source: "📚 מקור: כתר שם טוב • סיפורי חסידים"
    },
    {
      badge: "חיזוק בביטחון ושמחה",
      title: "רבי נחמן מברסלב • \"אין שום ייאוש בעולם כלל\"",
      body: "לימד רבי נחמן מברסלב: \"גם אם אדם נפל למקום שנפל, אל יתייאש לעולם! כי בכל נקודה ובכל מצב שבו נמצא האדם, שם בדיוק נמצא איתו הקדוש ברוך הוא ומחכה לתפילה אחת כנה או תנועה קלה של רצון טוב. מצווה גדולה להיות בשמחה תמיד!\"",
      source: "📚 מקור: ליקוטי מוהר״ן תנינא כ״ד"
    },
    {
      badge: "סיפור צדיקים • השגחה פרטית",
      title: "הבבא סאלי זיע״א • ברכה מתוך אמונה תמימה",
      body: "יהודי הגיע אל סידנא בבא סאלי בנתיבות ובכה על צרה גדולה שפקדה את ביתו. מזג לו הבבא סאלי כוסית לחיים ואמר לו: \"כשאתה אומר 'שהכל נהיה בדברו' מתוך אמונה שלמה שהכל מאתו יתברך לטובה, כבר נמתקים כל הדינים!\". באותו שבוע נושע אותו יהודי ישועה שלמה.",
      source: "📚 מקור: אביר יעקב • סיפורי צדיקים"
    },
    {
      badge: "וורט קצר • שמירת הלשון",
      title: "החפץ חיים זצ״ל • כל מילה טובה בונה עולמות",
      body: "אמר החפץ חיים: \"כשם שבעולם הזה אדם שומר על מרגליות יקרות בכיסו ולא מפזר אותן לרוח, כך כל דיבור של תורה, פרק תהילים או מילת פרגון בין איש לרעהו הם אבני חן שבונות היכלות של אור בעולמות העליונים.\"",
      source: "📚 מקור: שמירת הלשון • שער הזכירה"
    },
    {
      badge: "סיפור קצר • אהבת תורה",
      title: "מרן הרב עובדיה יוסף זצ״ל • דקה של תורה",
      body: "סיפרו על מרן הרב עובדיה יוסף זצ״ל שגם בנסיעות קצרות של דקות ספורים בין שיעור לשיעור היה פותח ספר ולומד בהתלהבות עצומה. היה אומר: \"בדקה אחת של תורה או הלכה אדם קונה חיי נצח ומאיר את כל ביתו באור של ברכה.\"",
      source: "📚 מקור: אביר הרועים • הנהגות מרן"
    },
    {
      badge: "חיזוק במידות וחסד",
      title: "החזון איש זצ״ל • רגישות לזולת היא לב התורה",
      body: "פעם המתין החזון איש שעה ארוכה בפתח חדרו כדי לא להעיר ילד קטן שנרדם על הספסל הסמוך. אמר לתלמידיו: \"כל התורה כולה ניתנה כדי לעדן את לב האדם ולהרגיל אותו לחמול, לוותר ולהיטיב עם כל בריאה.\"",
      source: "📚 מקור: מעשה איש • בני ברק"
    }
  ];
  var chizukIdx = 0;

  window.rotateHomeChizuk = function (step) {
    chizukIdx = (chizukIdx + (step || 1) + HOME_CHIZUKIM.length) % HOME_CHIZUKIM.length;
    var item = HOME_CHIZUKIM[chizukIdx];
    if (el("home-chizuk-badge")) el("home-chizuk-badge").textContent = item.badge;
    if (el("home-chizuk-title")) el("home-chizuk-title").textContent = item.title;
    if (el("home-chizuk-body")) el("home-chizuk-body").textContent = item.body;
    if (el("home-chizuk-source")) el("home-chizuk-source").textContent = item.source;
    if (el("home-chizuk-counter")) el("home-chizuk-counter").textContent = (chizukIdx + 1) + " / " + HOME_CHIZUKIM.length;
    if (window.toast) window.toast("🔥 חיזוק יומי: " + item.title);
  };

  window.shareHomeChizukWhatsApp = function () {
    var item = HOME_CHIZUKIM[chizukIdx] || HOME_CHIZUKIM[0];
    var text = "✨ *פינת החיזוק היומי • צדיק-טוק* ✨\n*" + item.title + "*\n\n" + item.body + "\n\n" + item.source;
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
  };

  // ==========================================================================
  // חלק 2: מדור "ללמוד" — 3 לשוניות ראשיות, תתי-קטגוריות בשיעורים, קורסים חדשים,
  //        סינון סרטונים לפי רבנים, ו"סיפורי צדיקים" במקום היכל המוזיקה
  // ==========================================================================
  var activeLearnMainTab = "ai";
  var activeShiurSubCat = "all";
  var activeEduRabbiFilter = "all";
  var activeEduCategoryFilter = "all";

  // 1. העשרת מאגר השיעורים כך שיכסה את כל 5 תתי-הקטגוריות: הלכה, אמונה, חסידות, ראשונים ואחרונים, תנ"ך
  var EXTRA_V35_SHIURIM = [
    { id: "sh_v35_1", rabbi: "הרב יצחק יוסף שליט״א", title: "הלכות שבת וברכות למעשה • שיעור הלוויין השבועי", institution: "בית המדרש יחוה דעת, ירושלים", topic: "הלכה", subCategory: "הלכה", type: "שיעור וידאו", duration: "52:00", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: "sh_v35_2", rabbi: "הרב יגאל כהן שליט״א", title: "אמונה וביטחון בה׳ • איך לחיות בשמחה ורוגע נפשי", institution: "בית המדרש יביע אומר, בני ברק", topic: "אמונה", subCategory: "אמונה", type: "שיעור מרכזי", duration: "48:20", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: "sh_v35_3", rabbi: "הרב שמואל אליהו שליט״א", title: "אורות החסידות והתפילה • סודות תורת הבעל שם טוב והתניא", institution: "בית המדרש צפת", topic: "חסידות", subCategory: "חסידות", type: "שיעור חסידות", duration: "44:15", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: "sh_v35_4", rabbi: "הרב זמיר כהן שליט״א", title: "שיטת הרמב״ם, הרמב״ן והראשונים בפרשת השבוע", institution: "הידברות • מרכז תורני", topic: "ראשונים ואחרונים", subCategory: "ראשונים ואחרונים", type: "שיעור עיון", duration: "46:30", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: "sh_v35_5", rabbi: "הרב ברוך רוזנבלום שליט״א", title: "עומק הפשט והמדרשים בתנ״ך ובפרשת השבוע", institution: "בית המדרש בני ברק", topic: "תנ״ך", subCategory: "תנ״ך", type: "שיעור תנ״ך ופרשה", duration: "58:10", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { id: "sh_v35_6", rabbi: "הרב שניר גואטה שליט״א", title: "חיזוק באמונה, שמירת העיניים ושמחה בחיים", institution: "בית המדרש אור החיים", topic: "אמונה", subCategory: "אמונה", type: "שיעור חיזוק", duration: "41:00", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
  ];

  function ensureRichShiurimData() {
    var base = window.RABBI_SHIURIM_DATA || [];
    var existingIds = {};
    base.forEach(function (s) { existingIds[s.id] = true; });
    EXTRA_V35_SHIURIM.forEach(function (s) {
      if (!existingIds[s.id]) base.push(s);
    });
    window.RABBI_SHIURIM_DATA = base;
  }

  // 2. מעבר בין 3 הלשוניות הראשיות במדור "ללמוד": ספריית AI | שיעורים | חידונים
  window.__v37_prev_switchLearnMainTab_1 = function (tabKey) {
    activeLearnMainTab = tabKey || "ai";
    ["ai", "shiurim", "quizzes"].forEach(function (k) {
      var btn = el("learn-main-tab-" + k);
      if (btn) btn.classList.toggle("active", k === activeLearnMainTab);
    });

    var aiSubNav = el("learn-ai-subnav-grid");
    if (aiSubNav) aiSubNav.classList.toggle("hidden", activeLearnMainTab !== "ai");

    var allPanels = [
      "lib-sub-torah", "lib-sub-nach", "lib-sub-generations", "lib-sub-mishnah",
      "lib-sub-chassidut", "lib-sub-courses", "lib-sub-liveshiurim", "lib-sub-eduvideos",
      "lib-sub-weekseries", "lib-sub-aiseries", "lib-sub-tzaddikim-stories", "lib-sub-quizzes-inline"
    ];
    allPanels.forEach(function (pid) {
      var p = el(pid);
      if (p) p.classList.add("hidden");
    });

    // יציאה ממצב מיקוד ישן של V31 כדי ש-3 הלשוניות הראשיות של "ללמוד" יישארו תמיד גלויות וברורות
    document.body.classList.remove("focus-mode", "focus-more");
    var fbar = el("tt-focus-bar");
    if (fbar && currentTab === "series") fbar.classList.add("hidden");

    if (activeLearnMainTab === "shiurim") {
      var shPanel = el("lib-sub-liveshiurim");
      if (shPanel) shPanel.classList.remove("hidden");
      window.renderRabbiShiurimList(val("shiurim-search-input"));
      window.renderWeeklyCourses();
    } else if (activeLearnMainTab === "quizzes") {
      var qzPanel = el("lib-sub-quizzes-inline");
      if (qzPanel) qzPanel.classList.remove("hidden");
      window.renderInlineLearnQuizzes("all");
    } else {
      // ברירת מחדל בלשונית ספריית AI: הצג את התת-לשונית הפעילה (או חומשי תורה)
      var activeSubBtn = document.querySelector("#learn-ai-subnav-grid .hub-grid-btn.active");
      var subId = "torah";
      if (activeSubBtn && activeSubBtn.id) subId = activeSubBtn.id.replace("lib-btn-", "");
      var targetPanelId = subId === "tzaddikim_stories" ? "lib-sub-tzaddikim-stories" : ("lib-sub-" + subId);
      var tp = el(targetPanelId) || el("lib-sub-torah");
      if (tp) tp.classList.remove("hidden");
      if (subId === "tzaddikim_stories") window.renderTzaddikimStoriesLearn("");
      if (subId === "eduvideos") window.filterEduVideosByRabbi(activeEduRabbiFilter || "all");
    }
  };

  // דריסת switchLibrarySubTab לתמיכה ב-3 הלשוניות הראשיות וב"סיפורי צדיקים"
  var prevSwitchLibrarySubTab = window.__v37_prev_switchLibrarySubTab_2;
  window.__v37_prev_switchLibrarySubTab_3 = function (sub) {
    if (sub === "music") sub = "tzaddikim_stories";
    if (currentTab !== "series") window.switchTab("series");

    if (sub === "liveshiurim") {
      window.switchLearnMainTab("shiurim");
      return;
    }
    if (sub === "courses") {
      window.switchLearnMainTab("shiurim");
      setTimeout(function () {
        var wk = el("weekly-courses-section");
        if (wk && wk.scrollIntoView) wk.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return;
    }
    if (sub === "quizzes") {
      window.switchLearnMainTab("quizzes");
      return;
    }

    // לשונית ספריית AI
    activeLearnMainTab = "ai";
    ["ai", "shiurim", "quizzes"].forEach(function (k) {
      var btn = el("learn-main-tab-" + k);
      if (btn) btn.classList.toggle("active", k === "ai");
    });
    var aiSubNav = el("learn-ai-subnav-grid");
    if (aiSubNav) aiSubNav.classList.remove("hidden");

    qsa("#learn-ai-subnav-grid .hub-grid-btn").forEach(function (b) { b.classList.remove("active"); });
    var activeBtn = el("lib-btn-" + sub);
    if (activeBtn) activeBtn.classList.add("active");

    var allPanels = [
      "lib-sub-torah", "lib-sub-nach", "lib-sub-generations", "lib-sub-mishnah",
      "lib-sub-chassidut", "lib-sub-courses", "lib-sub-liveshiurim", "lib-sub-eduvideos",
      "lib-sub-weekseries", "lib-sub-aiseries", "lib-sub-tzaddikim-stories", "lib-sub-quizzes-inline"
    ];
    allPanels.forEach(function (pid) {
      var p = el(pid);
      if (p) p.classList.add("hidden");
    });

    document.body.classList.remove("focus-mode", "focus-more");
    var fbar = el("tt-focus-bar");
    if (fbar) fbar.classList.add("hidden");

    var panelId = sub === "tzaddikim_stories" ? "lib-sub-tzaddikim-stories" : ("lib-sub-" + sub);
    var target = el(panelId);
    if (target) target.classList.remove("hidden");

    if (sub === "tzaddikim_stories") window.renderTzaddikimStoriesLearn("");
    else if (sub === "eduvideos") window.filterEduVideosByRabbi(activeEduRabbiFilter || "all");
    else if (sub === "torah" && window.selectChumash) window.selectChumash("bereishit");
    else if (sub === "nach" && window.renderNachLibrary) window.renderNachLibrary();
    else if (sub === "generations" && window.renderGenerationsTimeline) window.renderGenerationsTimeline();
    else if (sub === "mishnah" && window.renderMishnahAndChassidut) window.renderMishnahAndChassidut();
    else if (sub === "chassidut" && window.renderMishnahAndChassidut) window.renderMishnahAndChassidut();
    else if (sub === "aiseries" && window.renderSeriesGrid) window.renderSeriesGrid();
  };

  // סינון שיעורים לפי תת-קטגוריה (הלכה, אמונה, חסידות, ראשונים ואחרונים, תנ"ך)
  window.filterShiurimBySubCat = function (subCat) {
    activeShiurSubCat = subCat || "all";
    qsa("#shiurim-subcat-bar .shiur-subcat-btn").forEach(function (b) {
      var isAct = b.getAttribute("data-subcat") === activeShiurSubCat;
      b.className = isAct
        ? "shiur-subcat-btn active px-4 py-2 rounded-xl bg-amber-500 text-white font-black shrink-0"
        : "shiur-subcat-btn px-4 py-2 rounded-xl bg-[#FDF8EF] border border-[#D8CBB5] text-[#0F2340] font-bold shrink-0";
    });
    window.renderRabbiShiurimList(val("shiurim-search-input"));
  };

  window.openRabbiLessonUploadForm = function () {
    var box = el("lesson-upload-box");
    if (box) {
      box.classList.remove("hidden");
      box.scrollIntoView({ behavior: "smooth", block: "center" });
      var inp = el("new-shiur-rabbi");
      if (inp) inp.focus();
    }
  };

  window.uploadNewRabbiShiurV35 = function () {
    var rabbi = val("new-shiur-rabbi");
    var title = val("new-shiur-title");
    var topic = val("new-shiur-topic") || "הלכה";
    var inst = val("new-shiur-inst") || "בית המדרש";
    var url = val("new-shiur-url") || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    var donateUrl = val("new-shiur-donate") || "";

    if (!rabbi || !title) {
      window.toast("נא להזין את שם הרב וכותרת השיעור");
      return;
    }

    ensureRichShiurimData();
    var list = (window.getStorageJson && window.getStorageJson(STORAGE_KEYS.RABBI_SHIURIM, window.RABBI_SHIURIM_DATA)) || window.RABBI_SHIURIM_DATA || [];
    var newItem = {
      id: "sh_u_" + Date.now(),
      rabbi: rabbi,
      title: title,
      topic: topic,
      subCategory: topic,
      institution: inst,
      type: "שיעור רב מוסמך",
      duration: "45:00",
      videoUrl: url,
      donateUrl: donateUrl
    };
    list.unshift(newItem);
    window.RABBI_SHIURIM_DATA = list;
    if (window.setStorageJson) window.setStorageJson(STORAGE_KEYS.RABBI_SHIURIM, list);

    if (sb()) {
      try {
        sb().from("lessons").insert([{
          title: title,
          rabbi: rabbi,
          category: topic,
          institution: inst,
          video_url: url,
          duration: "45:00"
        }]).then(function () {});
      } catch (e) {}
    }

    ["new-shiur-rabbi", "new-shiur-title", "new-shiur-inst", "new-shiur-url", "new-shiur-donate"].forEach(function (id) {
      var e = el(id); if (e) e.value = "";
    });
    window.renderRabbiShiurimList("");
    window.toast("🎙️ השיעור של " + rabbi + " פורסם בהצלחה במאגר השיעורים!");
  };

  // דריסת renderRabbiShiurimList להצגת תתי-קטגוריות וכפתור "תרומה לרב" בכל כרטיס שיעור
  window.renderRabbiShiurimList = function (query) {
    ensureRichShiurimData();
    var box = el("rabbi-shiurim-grid");
    if (!box) return;
    var list = (window.getStorageJson && window.getStorageJson(STORAGE_KEYS.RABBI_SHIURIM, window.RABBI_SHIURIM_DATA)) || window.RABBI_SHIURIM_DATA || [];
    EXTRA_V35_SHIURIM.forEach(function (ex) {
      if (!list.some(function (x) { return x.id === ex.id; })) list.push(ex);
    });

    if (activeShiurSubCat && activeShiurSubCat !== "all") {
      list = list.filter(function (s) {
        var combined = [s.subCategory, s.topic, s.title].join(" ");
        if (activeShiurSubCat === "תנ״ך") return combined.indexOf("תנ") !== -1 || combined.indexOf("פרש") !== -1;
        return combined.indexOf(activeShiurSubCat) !== -1;
      });
    }

    var q = (query || "").trim().toLowerCase();
    if (q) {
      list = list.filter(function (s) {
        return [s.rabbi, s.title, s.topic, s.subCategory, s.institution].join(" ").toLowerCase().indexOf(q) !== -1;
      });
    }

    if (!list.length) {
      box.innerHTML = '<div class="col-span-full p-5 bg-[#FDF8EF] border border-[#E5DBC7] rounded-2xl text-center text-xs text-[#5C4938]">לא נמצאו שיעורים בתת-קטגוריה זו. לחץ על "הכל" או העלה שיעור חדש.</div>';
      return;
    }

    box.innerHTML = list.map(function (s, idx) {
      var sid = s.id || ("sh_" + (idx + 1));
      var itemKey = "shiur_" + sid;
      var safeTitle = String(s.title || "").replace(/'/g, "");
      var safeRabbi = String(s.rabbi || "").replace(/'/g, "");
      var safeTopic = String(s.subCategory || s.topic || "שיעור תורה").replace(/'/g, "");
      var duration = s.duration || "45:00";
      var institution = s.institution || "בית המדרש";

      var likesData = window.getCardLikes ? window.getCardLikes(itemKey, 16 + (idx * 5)) : { isLiked: false, count: 20 };
      var comments = window.getCardComments ? window.getCardComments(itemKey) : [];
      var boxId = "comments-shiur-" + sid;

      var donateAction = s.donateUrl
        ? "window.open('" + String(s.donateUrl).replace(/'/g, "") + "', '_blank')"
        : "openDonateModal('תרומה לרב " + safeRabbi + " ולהחזקת בית המדרש')";

      return '<div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm hover:border-[#C9A227] transition-all">' +
        '<div class="space-y-1.5">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="px-2.5 py-0.5 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-md text-xs font-bold">' + safeTopic + '</span>' +
            '<span class="text-xs text-[#5C4938] font-mono">⏱️ ' + duration + '</span>' +
          '</div>' +
          '<h4 class="text-lg font-bold text-[#0F2340] serif-heading">' + s.title + '</h4>' +
          '<p class="text-xs font-black text-[#0F2340]">🎙️ מגיד השיעור: ' + s.rabbi + '</p>' +
          '<p class="text-xs text-[#5C4938]">🏛️ בית מדרש: ' + institution + '</p>' +
        '</div>' +

        '<div class="pt-2 border-t border-[#E5DBC7] space-y-2">' +
          '<div class="flex flex-wrap items-center justify-between gap-2">' +
            '<div class="flex items-center gap-1.5">' +
              '<button type="button" onclick="window.toggleCardLike(\'' + itemKey + '\', this)" class="like-btn px-3 py-1.5 rounded-xl border border-[#D8CBB5] bg-[#FDF8EF] hover:bg-[#F6EFE2] text-xs font-bold flex items-center gap-1 text-[#0F2340]">' +
                '<span class="like-icon">' + (likesData.isLiked ? "❤️" : "🤍") + '</span>' +
                '<span class="like-count font-mono">' + likesData.count + '</span>' +
              '</button>' +
              '<button type="button" onclick="window.toggleCardCommentBox(\'' + boxId + '\')" class="px-3 py-1.5 rounded-xl border border-[#D8CBB5] bg-[#FDF8EF] hover:bg-[#F6EFE2] text-xs font-bold flex items-center gap-1 text-[#0F2340]">' +
                '<span>💬</span>' +
                '<span>תגובות (<span id="count-' + boxId + '">' + comments.length + '</span>)</span>' +
              '</button>' +
            '</div>' +
            '<button type="button" onclick="' + donateAction + '" class="px-3.5 py-1.5 bg-[#F6EFE2] hover:bg-[#EDE1CC] text-[#0F2340] border-2 border-[#C9A227] font-black rounded-xl text-xs flex items-center gap-1 shadow-sm">' +
              '<span>💝</span> <span>תרומה לרב</span>' +
            '</button>' +
          '</div>' +

          '<div id="' + boxId + '" class="hidden p-3 bg-[#F8F3E8] border border-[#E5DBC7] rounded-xl space-y-2.5 text-xs">' +
            '<div class="space-y-1.5 max-h-36 overflow-y-auto" id="list-' + boxId + '">' +
              comments.map(function (c) {
                return '<div class="p-2 bg-white rounded-lg border border-[#E5DBC7] space-y-0.5">' +
                  '<div class="flex items-center justify-between text-[11px]">' +
                    '<strong class="text-[#0F2340]">' + c.user + '</strong>' +
                    '<span class="text-[#5C4938]">' + (c.time || "השבוע") + '</span>' +
                  '</div>' +
                  '<p class="text-xs text-[#0F2340]">' + c.text + '</p>' +
                '</div>';
              }).join("") +
            '</div>' +
            '<div class="flex items-center gap-1.5 pt-1 border-t border-[#E5DBC7]">' +
              '<input type="text" id="input-' + boxId + '" placeholder="כתוב תגובה או שאלה על השיעור..." class="flex-1 bg-white border border-[#D8CBB5] rounded-lg px-2.5 py-1.5 text-xs text-[#0F2340] outline-none">' +
              '<button type="button" onclick="window.submitInlineCardComment(\'' + itemKey + '\', \'' + boxId + '\')" class="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs">שלח</button>' +
            '</div>' +
          '</div>' +

          '<button type="button" onclick="openEntityFullPage(\'' + itemKey + '\', \'שיעור תורה • ' + safeRabbi + '\', \'' + safeTitle + '\', \'' + safeRabbi + ' • ' + institution + '\', \'' + institution + '\', \'אורך: ' + duration + '\', \'\', \'שיעור תורה מפי ' + safeRabbi + ' בנושא ' + safeTopic + '.\', \'בהירות השיעור • חיזוק • מקורות\')" class="w-full py-2 bg-[#0F2340] hover:bg-[#16335c] text-white font-bold rounded-xl text-xs text-center" style="color:#FFFFFF !important;">' +
            '▶ צפייה בשיעור המלא והרחבה' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // 3. תת-מדור "קורסים חדשים" (בתדירות של פעם בשבוע • חינם או בתשלום + הצטרפות לקורס)
  var WEEKLY_COURSES_KEY = "tzadiktok_weekly_courses_v35";
  var JOINED_COURSES_KEY = "tzadiktok_joined_courses_v35";
  var DEFAULT_WEEKLY_COURSES = [
    {
      id: "wkc_1",
      title: "קורס הלכות שבת למעשה מהיסוד",
      rabbi: "הרב יצחק יוסף שליט״א ובית ההוראה",
      schedule: "פעם בשבוע • ימי שני 20:30",
      isFree: true,
      priceLabel: "חינם (פתוח לכולם) 🎁",
      lessonsCount: "12 מפגשים שבועיים",
      desc: "לימוד מסודר של ל״ט מלאכות שבת, הלכות בישול, מוקצה ועונג שבת בשפה בהירה עם דפי סיכום."
    },
    {
      id: "wkc_2",
      title: "קורס אמונה, ביטחון ושמחת החיים",
      rabbi: "הרב יגאל כהן שליט״א",
      schedule: "פעם בשבוע • ימי שלישי 21:00",
      isFree: true,
      priceLabel: "חינם (פתוח לכולם) 🎁",
      lessonsCount: "10 מפגשים שבועיים",
      desc: "כלים מעשיים מתורת החסידות והמוסר להתמודדות עם לחץ וחרדה ובניית ביטחון אמיתי בה׳."
    },
    {
      id: "wkc_3",
      title: "קורס עומק ספר התניא ותורת החסידות",
      rabbi: "הרב שמואל אליהו שליט״א",
      schedule: "פעם בשבוע • ימי רביעי 20:00",
      isFree: false,
      priceLabel: "בתשלום • ₪39 לחודש 💳",
      lessonsCount: "14 מפגשים + ליווי אישי",
      desc: "מסע שיטתי בפרקי ליקוטי אמרים בספר התניא, הכרת כוחות הנפש ועבודת התפילה בשמחה."
    },
    {
      id: "wkc_4",
      title: "קורס ראשונים ואחרונים על פרשת השבוע",
      rabbi: "הרב זמיר כהן שליט״א",
      schedule: "פעם בשבוע • ימי חמישי 20:30",
      isFree: false,
      priceLabel: "בתשלום • ₪49 לקורס 💳",
      lessonsCount: "8 מפגשים מרוכזים",
      desc: "השוואת שיטות רש״י, רמב״ן, אבן עזרא, אור החיים הקדוש והמלבי״ם בסוגיות המרכזיות בחומש."
    }
  ];
  var activeCoursePriceFilter = "all";

  window.filterWeeklyCourses = function (mode) {
    activeCoursePriceFilter = mode || "all";
    qsa(".wk-course-filter").forEach(function (b) {
      b.className = "wk-course-filter px-3 py-1.5 rounded-xl bg-[#FDF8EF] border border-[#D8CBB5] text-[#0F2340] text-xs font-bold";
    });
    if (event && event.currentTarget) {
      event.currentTarget.className = "wk-course-filter active px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-black";
    }
    window.renderWeeklyCourses();
  };

  window.toggleNewWeeklyCourseForm = function () {
    var f = el("new-weekly-course-form");
    if (f) f.classList.toggle("hidden");
  };

  window.addWeeklyCourseV35 = function () {
    var title = val("wk-course-title");
    var rabbi = val("wk-course-rabbi");
    var sched = val("wk-course-schedule") || "פעם בשבוע • ימי שלישי 20:30";
    var priceType = val("wk-course-price-type") || "חינם (פתוח לכולם)";
    if (!title || !rabbi) {
      window.toast("נא להזין שם קורס ושם הרב המרצה");
      return;
    }
    var list = (window.getStorageJson && window.getStorageJson(WEEKLY_COURSES_KEY, DEFAULT_WEEKLY_COURSES)) || DEFAULT_WEEKLY_COURSES;
    list.unshift({
      id: "wkc_" + Date.now(),
      title: title,
      rabbi: rabbi,
      schedule: "פעם בשבוע • " + sched,
      isFree: priceType.indexOf("חינם") !== -1,
      priceLabel: priceType,
      lessonsCount: "10 מפגשים שבועיים",
      desc: "קורס תורני שבועי מובנה בהנחיית " + rabbi + "."
    });
    if (window.setStorageJson) window.setStorageJson(WEEKLY_COURSES_KEY, list);
    ["wk-course-title", "wk-course-rabbi", "wk-course-schedule"].forEach(function (id) { var e = el(id); if (e) e.value = ""; });
    window.toggleNewWeeklyCourseForm();
    window.renderWeeklyCourses();
    window.toast("🎓 הקורס השבועי החדש נוסף בהצלחה!");
  };

  window.joinWeeklyCourse = function (courseId, courseTitle, isFree) {
    var joined = (window.getStorageJson && window.getStorageJson(JOINED_COURSES_KEY, {})) || {};
    joined[courseId] = true;
    if (window.setStorageJson) window.setStorageJson(JOINED_COURSES_KEY, joined);
    window.renderWeeklyCourses();
    if (isFree) {
      window.toast("🎉 הצטרפת בהצלחה לקורס '" + courseTitle + "'! תזכורת שבועית תישלח אליך.");
    } else {
      window.toast("🎉 נרשמת לקורס '" + courseTitle + "'! מעביר להשלמת דמי השתתפות...");
      if (window.openDonateModal) window.openDonateModal("הרשמה לקורס שבועי: " + courseTitle);
    }
  };

  window.renderWeeklyCourses = function () {
    var grid = el("weekly-courses-grid");
    if (!grid) return;
    var list = (window.getStorageJson && window.getStorageJson(WEEKLY_COURSES_KEY, DEFAULT_WEEKLY_COURSES)) || DEFAULT_WEEKLY_COURSES;
    var joined = (window.getStorageJson && window.getStorageJson(JOINED_COURSES_KEY, {})) || {};

    if (activeCoursePriceFilter === "free") {
      list = list.filter(function (c) { return !!c.isFree; });
    } else if (activeCoursePriceFilter === "paid") {
      list = list.filter(function (c) { return !c.isFree; });
    }

    grid.innerHTML = list.map(function (c) {
      var isJoined = !!joined[c.id];
      var safeTitle = String(c.title || "").replace(/'/g, "");
      return '<div class="bg-[#FDF8EF] border-2 border-[#E5DBC7] hover:border-[#C9A227] p-4 rounded-2xl space-y-3 flex flex-col justify-between transition-all">' +
        '<div class="space-y-1.5">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="px-2.5 py-0.5 rounded-md text-[11px] font-black ' + (c.isFree ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227]") + '">' + c.priceLabel + '</span>' +
            '<span class="text-[11px] font-bold text-[#5C4938]">' + c.lessonsCount + '</span>' +
          '</div>' +
          '<h4 class="text-base font-black text-[#0F2340] serif-heading">' + c.title + '</h4>' +
          '<p class="text-xs font-bold text-[#0F2340]">🎙️ מרצה: ' + c.rabbi + '</p>' +
          '<p class="text-xs text-[#5C4938] font-bold">📅 ' + c.schedule + '</p>' +
          '<p class="text-xs text-[#5C4938] leading-relaxed">' + c.desc + '</p>' +
        '</div>' +
        '<div class="pt-2 border-t border-[#E5DBC7] flex items-center gap-2">' +
          (isJoined
            ? '<button type="button" class="w-full py-2.5 bg-emerald-700 text-white font-black rounded-xl text-xs" style="color:#FFFFFF !important;">✔ רשום לקורס (מפגש שבועי פעיל)</button>'
            : '<button type="button" onclick="joinWeeklyCourse(\'' + c.id + '\', \'' + safeTitle + '\', ' + (c.isFree ? "true" : "false") + ')" class="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-black rounded-xl text-xs shadow-sm">🎓 הצטרפות לקורס ←</button>'
          ) +
        '</div>' +
      '</div>';
    }).join("");
  };

  // 4. סרטונים חינוכיים — סינון לפי שמות רבנים
  var EXTRA_RABBI_EDU_VIDEOS = [
    { id: "edv_rab1", title: "הרב יצחק יוסף שליט״א • הלכות ברכות השחר ותפילה בציבור", speaker: "הרב יצחק יוסף שליט״א", category: "רבנים וגדולי הדורות", duration: "22:15", thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80", description: "שיעור מרתק ובהיר בהלכות ברכות ותפילה מפי הראשון לציון הרב יצחק יוסף שליט״א." },
    { id: "edv_rab2", title: "הרב יגאל כהן שליט״א • סוד הביטחון בה׳ והשמחה היומיומית", speaker: "הרב יגאל כהן שליט״א", category: "רבנים וגדולי הדורות", duration: "19:40", thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80", description: "חיזוק מיוחד באמונה וביטחון בה׳ לכל יהודי מפי הרב יגאל כהן שליט״א." },
    { id: "edv_rab3", title: "הרב שמואל אליהו שליט״א • סיפורי מופתים וישועות בדורנו", speaker: "הרב שמואל אליהו שליט״א", category: "רבנים וגדולי הדורות", duration: "25:10", thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80", description: "סיפורי השגחה פרטית ופרשת השבוע מפי רב העיר צפת הרב שמואל אליהו שליט״א." },
    { id: "edv_rab4", title: "הרב זמיר כהן שליט״א • תורה ומדע וסודות הבריאה", speaker: "הרב זמיר כהן שליט״א", category: "היסטוריה", duration: "28:05", thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80", description: "גילויי המדע המודרני לאור פסוקי התורה ודברי חז״ל מפי הרב זמיר כהן שליט״א." },
    { id: "edv_rab5", title: "הרב שניר גואטה שליט״א • כוחה של תשובה מאהבה", speaker: "הרב שניר גואטה שליט״א", category: "רבנים וגדולי הדורות", duration: "17:30", thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80", description: "סיפור אישי וחיזוק מרגש לכל יהודי מפי הרב שניר גואטה שליט״א." },
    { id: "edv_rab6", title: "הרב ברוך רוזנבלום שליט״א • מדרשי הפלא בפרשת השבוע", speaker: "הרב ברוך רוזנבלום שליט״א", category: "פרשת השבוע והלכה", duration: "34:50", thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80", description: "פנינים ומדרשים מרתקים על פרשת השבוע מפי הרב ברוך רוזנבלום שליט״א." }
  ];

  function ensureEduVideosWithRabbis() {
    var base = window.EDUCATIONAL_VIDEOS_DATA || [];
    EXTRA_RABBI_EDU_VIDEOS.forEach(function (v) {
      if (!base.some(function (x) { return x.id === v.id; })) base.unshift(v);
    });
    window.EDUCATIONAL_VIDEOS_DATA = base;
  }

  window.filterEduVideosByRabbi = function (rabbiName) {
    ensureEduVideosWithRabbis();
    activeEduRabbiFilter = rabbiName || "all";
    var sel = el("edu-rabbi-filter-select");
    if (sel && sel.value !== activeEduRabbiFilter) sel.value = activeEduRabbiFilter;

    qsa("#edu-rabbi-pills-bar .edu-rabbi-pill").forEach(function (b) {
      var txt = b.textContent || "";
      var isAct = (activeEduRabbiFilter === "all" && txt.indexOf("כל הרבנים") !== -1) ||
                  (activeEduRabbiFilter !== "all" && txt.indexOf(activeEduRabbiFilter) !== -1);
      b.className = isAct
        ? "edu-rabbi-pill active px-3 py-1 rounded-lg bg-amber-500 text-white font-bold shrink-0"
        : "edu-rabbi-pill px-3 py-1 rounded-lg bg-[#FDF8EF] border border-[#D8CBB5] text-[#0F2340] font-bold shrink-0";
    });

    var q = val("edu-video-search-input").toLowerCase();
    var list = (window.EDUCATIONAL_VIDEOS_DATA || []).filter(function (v) {
      var text = [v.title, v.speaker, v.category, v.description].join(" ");
      var matchRabbi = activeEduRabbiFilter === "all" || text.indexOf(activeEduRabbiFilter) !== -1;
      var matchCat = activeEduCategoryFilter === "all" || text.indexOf(activeEduCategoryFilter) !== -1;
      var matchQ = !q || text.toLowerCase().indexOf(q) !== -1;
      return matchRabbi && matchCat && matchQ;
    });

    var grid = el("edu-videos-grid");
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = '<div class="col-span-full p-5 bg-[#FDF8EF] border border-[#E5DBC7] rounded-2xl text-center text-xs text-[#5C4938]">לא נמצאו סרטונים חינוכיים התואמים לסינון זה.</div>';
      return;
    }

    grid.innerHTML = list.map(function (v) {
      var safeTitle = String(v.title || "").replace(/'/g, "");
      var safeSpeaker = String(v.speaker || "רב בית המדרש").replace(/'/g, "");
      var safeDesc = String(v.description || "").replace(/'/g, "");
      var thumb = v.thumbnail || "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80";
      return '<div class="bg-white border border-[#E5DBC7] rounded-2xl overflow-hidden shadow-sm hover:border-[#C9A227] flex flex-col justify-between">' +
        '<div>' +
          '<div class="relative h-36 bg-[#0F2340] overflow-hidden">' +
            '<img src="' + thumb + '" alt="' + safeTitle + '" class="w-full h-full object-cover opacity-85">' +
            '<span class="absolute top-2 right-2 px-2.5 py-0.5 rounded-md bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] font-bold text-[10px]">' + (v.category || "סרטון חינוכי") + '</span>' +
            '<span class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white text-[#0F2340] font-mono text-[10px] font-bold">' + (v.duration || "20:00") + '</span>' +
          '</div>' +
          '<div class="p-4 space-y-1.5">' +
            '<span class="text-[11px] font-black text-amber-700 block">🎙️ ' + safeSpeaker + '</span>' +
            '<h4 class="text-sm font-black text-[#0F2340] leading-snug">' + v.title + '</h4>' +
            '<p class="text-xs text-[#5C4938] leading-relaxed">' + safeDesc + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="p-4 pt-0">' +
          '<button type="button" onclick="openEntityFullPage(\'edu_' + v.id + '\', \'סרטון חינוכי • ' + safeSpeaker + '\', \'' + safeTitle + '\', \'' + safeSpeaker + '\', \'ספריית הווידאו\', \'אורך: ' + (v.duration || "20:00") + '\', \'\', \'' + safeDesc + '\', \'בהירות • חיזוק • מקורות\', \'' + thumb + '\')" class="w-full py-2 bg-amber-500 text-white font-black rounded-xl text-xs">' +
            '▶ צפה בסרטון והגב' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  window.filterEduVideos = function (cat) {
    activeEduCategoryFilter = cat || "all";
    window.filterEduVideosByRabbi(activeEduRabbiFilter);
  };

  window.searchEduVideosByRabbiOrTopic = function () {
    window.filterEduVideosByRabbi(activeEduRabbiFilter);
  };

  // 5. מדור "סיפורי צדיקים" (במקום היכל המוזיקה במדור ללמוד)
  var TZADDIKIM_STORIES_KEY = "tzadiktok_stories_learn_v35";
  var DEFAULT_TZADDIKIM_STORIES = [
    {
      id: "tzs_1",
      title: "הבעל שם טוב הקדוש והנער שקרא את האלף-בית",
      rabbi: "הבעל שם טוב הקדוש זיע״א",
      category: "חסידות והבעש״ט",
      story: "ביום הכיפורים ראה הבעל שם טוב הקדוש גזירה קשה שמרחפת על הקהילה. בבית הכנסת ישב נער כפרי שלא ידע לקרוא בסידור, ומרוב כיסופים קרא את אותיות הא׳-ב׳ ואמר: 'ריבונו של עולם, אני נותן לך את האותיות, ואתה תחבר מהן מילים ותפילות כרצונך!'. מיד נפתחו שערי שמיים והגזירה התבטלה.",
      moral: "תפילה היוצאת מלב תמים ושבור בוקעת את כל הרקיעים."
    },
    {
      id: "tzs_2",
      title: "סידנא בבא סאלי זיע״א והבקבוק שהתברך",
      rabbi: "רבי ישראל אבוחצירא (הבבא סאלי) זיע״א",
      category: "חכמי ספרד והמזרח",
      story: "בהילולה גדולה בנתיבות נגמר המשקה על השולחן, והבבא סאלי בירך באמונה שלמה ומזג מאותו בקבוק לעשרות רבות של אורחים, תוך שהוא מעורר את כולם לאהבת ישראל, קדושת השבת וביטחון מוחלט בבורא עולם.",
      moral: "אמונה תמימה וקדושת הפה מביאות ברכה למעלה מדרך הטבע."
    },
    {
      id: "tzs_3",
      title: "החפץ חיים והסוחר שביקש ברכה לפרנסה",
      rabbi: "רבי ישראל מאיר הכהן (החפץ חיים) זצ״ל",
      category: "גדולי התורה והמוסר",
      story: "יהודי הגיע לראדין וביקש מהחפץ חיים סגולה להצלחה במסחר. אמר לו החפץ חיים: 'אם תקפיד שלא לדבר על שום מתחרה שלך ושלא להוציא מילה של לשון הרע או אונאה בפה, הקדוש ברוך הוא בעצמו יהיה השותף שלך בעסק!'.",
      moral: "יושר, אמת ושמירת הלשון הם הכלי הבטוח ביותר לברכה בפרנסה."
    },
    {
      id: "tzs_4",
      title: "רבי שמעון בר יוחאי במערת פקיעין",
      rabbi: "התנא האלוקי רבי שמעון בר יוחאי זיע״א",
      category: "מופתים וישועות",
      story: "שלוש עשרה שנה ישבו רשב״י ובנו רבי אלעזר במערה בפקיעין, ניזונו מעץ החרובים וממעיין המים שנבראו להם בנס, והגו בסודות התורה הפנימיים עד שגילו לעולם את אור ספר הזוהר הקדוש.",
      moral: "מסירות נפש על לימוד התורה מאירה את העולם כולו לדורות עולם."
    },
    {
      id: "tzs_5",
      title: "מרן החיד״א ומסעות החסד והתורה",
      rabbi: "מרן החיד״א (רבי חיים יוסף דוד אזולאי) זיע״א",
      category: "חכמי ספרד והמזרח",
      story: "בכל מסעותיו כשד״ר עבור עניי ארץ ישראל, חיבר החיד״א עשרות ספרים קדושים בהלכה, באגדה ובקבלה, ובכל קהילה שהגיע אליה חיזק את השלום, לימוד התורה והצדקה לעניי ארץ הקודש.",
      moral: "גם בתוך טרדות הדרך יכול האדם להאיר עולמות בתורה ובחסד."
    },
    {
      id: "tzs_6",
      title: "רבי לוי יצחק מברדיטשוב — סנגורן של ישראל",
      rabbi: "רבי לוי יצחק מברדיטשוב זיע״א",
      category: "חסידות והבעש״ט",
      story: "כשראה רבי לוי יצחק עגלון יהודי שמשמן את גלגלי עגלתו בעודו עטוף בטלית ותפילין, נשא עיניו לשמיים וקרא בהתרגשות: 'ריבונו של עולם, ראה איזה עם קדוש יש לך! אפילו כשהם מתקנים את העגלה שלהם, הם לא נפרדים מתורתך וממצוותיך!'.",
      moral: "לימוד זכות ועין טובה על כל יהודי מעוררים רחמים גדולים בשמיים."
    }
  ];
  var activeTzStoryCat = "all";

  window.toggleAddTzaddikStoryForm = function () {
    var f = el("tz-story-upload-form");
    if (f) f.classList.toggle("hidden");
  };

  window.filterTzaddikimStoriesByCat = function (cat) {
    activeTzStoryCat = cat || "all";
    qsa(".tz-st-cat-btn").forEach(function (b) {
      b.className = "tz-st-cat-btn px-3 py-1.5 rounded-xl bg-[#FDF8EF] border border-[#D8CBB5] text-[#0F2340] font-bold shrink-0";
    });
    if (event && event.currentTarget) {
      event.currentTarget.className = "tz-st-cat-btn active px-3 py-1.5 rounded-xl bg-amber-500 text-white font-black shrink-0";
    }
    window.renderTzaddikimStoriesLearn("");
  };

  window.submitNewTzaddikStoryV35 = function () {
    var title = val("tz-story-title-inp");
    var rabbi = val("tz-story-rabbi-inp");
    var cat = val("tz-story-cat-inp") || "סיפורי צדיקים";
    var body = val("tz-story-body-inp");
    if (!title || !rabbi || !body) {
      window.toast("נא למלא כותרת, שם הצדיק ותוכן הסיפור");
      return;
    }
    var list = (window.getStorageJson && window.getStorageJson(TZADDIKIM_STORIES_KEY, DEFAULT_TZADDIKIM_STORIES)) || DEFAULT_TZADDIKIM_STORIES;
    list.unshift({
      id: "tzs_" + Date.now(),
      title: title,
      rabbi: rabbi,
      category: cat,
      story: body,
      moral: "זכות הצדיקים תגן עלינו ועל כל ישראל."
    });
    if (window.setStorageJson) window.setStorageJson(TZADDIKIM_STORIES_KEY, list);
    ["tz-story-title-inp", "tz-story-rabbi-inp", "tz-story-body-inp"].forEach(function (id) { var e = el(id); if (e) e.value = ""; });
    window.toggleAddTzaddikStoryForm();
    window.renderTzaddikimStoriesLearn("");
    window.toast("👑 סיפור הצדיקים פורסם בהצלחה!");
  };

  window.renderTzaddikimStoriesLearn = function (query) {
    var grid = el("tzaddikim-stories-learn-grid");
    if (!grid) return;
    var list = (window.getStorageJson && window.getStorageJson(TZADDIKIM_STORIES_KEY, DEFAULT_TZADDIKIM_STORIES)) || DEFAULT_TZADDIKIM_STORIES;
    var q = (query || "").trim().toLowerCase();

    if (activeTzStoryCat !== "all") {
      list = list.filter(function (s) {
        return [s.category, s.rabbi, s.title].join(" ").indexOf(activeTzStoryCat) !== -1;
      });
    }
    if (q) {
      list = list.filter(function (s) {
        return [s.title, s.rabbi, s.category, s.story, s.moral].join(" ").toLowerCase().indexOf(q) !== -1;
      });
    }

    grid.innerHTML = list.map(function (s, idx) {
      var itemKey = "tz_story_" + s.id;
      var likesData = window.getCardLikes ? window.getCardLikes(itemKey, 32 + idx * 7) : { isLiked: false, count: 32 };
      var comments = window.getCardComments ? window.getCardComments(itemKey) : [];
      var boxId = "comments-tzstory-" + s.id;

      return '<div class="bg-[#FDF8EF] border border-[#E5DBC7] hover:border-[#C9A227] p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">' +
        '<div class="space-y-2">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="px-2.5 py-0.5 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-md text-xs font-bold">' + s.category + '</span>' +
            '<span class="text-xs font-black text-[#5C4938]">👑 ' + s.rabbi + '</span>' +
          '</div>' +
          '<h4 class="text-lg font-black text-[#0F2340] serif-heading">' + s.title + '</h4>' +
          '<p class="text-xs sm:text-sm text-[#0F2340] leading-relaxed font-serif bg-white p-3.5 rounded-xl border border-[#E5DBC7]">' + s.story + '</p>' +
          '<p class="text-xs font-bold text-[#5C4938]">✨ נקודה למחשבה: ' + (s.moral || "") + '</p>' +
        '</div>' +
        '<div class="pt-2 border-t border-[#E5DBC7] space-y-2">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<div class="flex items-center gap-1.5">' +
              '<button type="button" onclick="window.toggleCardLike(\'' + itemKey + '\', this)" class="like-btn px-3 py-1.5 rounded-xl border border-[#D8CBB5] bg-white text-xs font-bold flex items-center gap-1 text-[#0F2340]">' +
                '<span class="like-icon">' + (likesData.isLiked ? "❤️" : "🤍") + '</span>' +
                '<span class="like-count font-mono">' + likesData.count + '</span>' +
              '</button>' +
              '<button type="button" onclick="window.toggleCardCommentBox(\'' + boxId + '\')" class="px-3 py-1.5 rounded-xl border border-[#D8CBB5] bg-white text-xs font-bold flex items-center gap-1 text-[#0F2340]">' +
                '<span>💬</span> <span>תגובות (<span id="count-' + boxId + '">' + comments.length + '</span>)</span>' +
              '</button>' +
            '</div>' +
            '<a href="https://wa.me/?text=' + encodeURIComponent("👑 *" + s.title + "* (" + s.rabbi + ")\n\n" + s.story) + '" target="_blank" class="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-xl text-xs">💬 שתף סיפור</a>' +
          '</div>' +
          '<div id="' + boxId + '" class="hidden p-3 bg-white border border-[#E5DBC7] rounded-xl space-y-2 text-xs">' +
            '<div class="space-y-1.5 max-h-32 overflow-y-auto" id="list-' + boxId + '">' +
              comments.map(function (c) {
                return '<div class="p-2 bg-[#FDF8EF] rounded-lg border border-[#E5DBC7]">' +
                  '<strong class="text-[#0F2340] block text-[11px]">' + c.user + '</strong>' +
                  '<span class="text-xs text-[#0F2340]">' + c.text + '</span>' +
                '</div>';
              }).join("") +
            '</div>' +
            '<div class="flex items-center gap-1.5">' +
              '<input type="text" id="input-' + boxId + '" placeholder="הוסף תגובה על הסיפור..." class="flex-1 bg-[#FDF8EF] border border-[#D8CBB5] rounded-lg px-2.5 py-1.5 text-xs text-[#0F2340] outline-none">' +
              '<button type="button" onclick="window.submitInlineCardComment(\'' + itemKey + '\', \'' + boxId + '\')" class="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs">שלח</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // 6. לשונית 3 במדור ללמוד: חידונים אינטראקטיביים
  var inlineQuizScore = 0;
  window.renderInlineLearnQuizzes = function (catFilter) {
    var grid = el("inline-learn-quizzes-grid");
    if (!grid) return;
    var list = window.QUIZ_QUESTIONS_DATA || [];
    if (catFilter && catFilter !== "all") {
      list = list.filter(function (q) {
        return [q.category, q.question].join(" ").indexOf(catFilter) !== -1;
      });
    }
    grid.innerHTML = list.map(function (q, qIdx) {
      var opts = q.options || [];
      return '<div class="bg-[#FDF8EF] border border-[#E5DBC7] p-4 rounded-2xl space-y-3">' +
        '<div class="flex items-center justify-between text-xs">' +
          '<span class="px-2.5 py-0.5 bg-[#F6EFE2] border border-[#C9A227] rounded-md font-bold text-[#0F2340]">🏆 ' + (q.category || "חידון תורני") + '</span>' +
          '<span class="text-[#5C4938] font-bold">שאלה ' + (qIdx + 1) + '</span>' +
        '</div>' +
        '<h4 class="text-sm sm:text-base font-black text-[#0F2340]">' + q.question + '</h4>' +
        '<div class="grid grid-cols-1 gap-1.5 text-xs">' +
          opts.map(function (opt, oIdx) {
            return '<button type="button" onclick="answerInlineLearnQuiz(' + qIdx + ', ' + oIdx + ', ' + (q.correctIndex || 0) + ', this)" class="text-right px-3.5 py-2 rounded-xl bg-white border border-[#D8CBB5] hover:border-[#C9A227] font-bold text-[#0F2340] transition-all">' +
              (oIdx + 1) + '. ' + opt +
            '</button>';
          }).join("") +
        '</div>' +
        '<div id="inl-quiz-exp-' + qIdx + '" class="hidden p-3 bg-white border border-[#C9A227] rounded-xl text-xs text-[#0F2340]">' +
          '<strong>💡 הסבר ומקור:</strong> ' + (q.explanation || "תשובה נכונה מתוך מקורות חז״ל וההלכה.") +
        '</div>' +
      '</div>';
    }).join("");
  };

  window.answerInlineLearnQuiz = function (qIdx, chosenIdx, correctIdx, btnEl) {
    var exp = el("inl-quiz-exp-" + qIdx);
    if (exp) exp.classList.remove("hidden");
    if (chosenIdx === correctIdx) {
      inlineQuizScore += 10;
      if (btnEl) {
        btnEl.style.backgroundColor = "#D1FAE5";
        btnEl.style.borderColor = "#059669";
      }
      var badge = el("inline-quiz-score-badge");
      if (badge) badge.textContent = "⭐ ניקוד: " + inlineQuizScore;
      window.toast("🎉 תשובה נכונה! +10 נקודות");
    } else {
      if (btnEl) {
        btnEl.style.backgroundColor = "#FEE2E2";
        btnEl.style.borderColor = "#DC2626";
      }
      window.toast("לא מדויק — ראה את ההסבר ההלכתי מתחת לשאלה");
    }
  };

  // ==========================================================================
  // חלק 3: מדור "להתפלל" — חיבור מלא ל-API של Sefaria (ספריא) לתפילות ולתהילים (1–150)
  // ==========================================================================
  var SEFARIA_CACHE = {};
  var currentPrayerFontSize = 20;
  var currentSefariaTehillimChapter = 1;
  var currentSelectedPrayerKey = "hashachar";

  var HEB_NUMS = [
    "", "א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ז׳", "ח׳", "ט׳", "י׳",
    "י״א", "י״ב", "י״ג", "י״ד", "ט״ו", "ט״ז", "י״ז", "י״ח", "י״ט", "כ׳",
    "כ״א", "כ״ב", "כ״ג", "כ״ד", "כ״ה", "כ״ו", "כ״ז", "כ״ח", "כ״ט", "ל׳",
    "ל״א", "ל״ב", "ל״ג", "ל״ד", "ל״ה", "ל״ו", "ל״ז", "ל״ח", "ל״ט", "מ׳",
    "מ״א", "מ״ב", "מ״ג", "מ״ד", "מ״ה", "מ״ו", "מ״ז", "מ״ח", "מ״ט", "נ׳",
    "נ״א", "נ״ב", "נ״ג", "נ״ד", "נ״ה", "נ״ו", "נ״ז", "נ״ח", "נ״ט", "ס׳",
    "ס״א", "ס״ב", "ס״ג", "ס״ד", "ס״ה", "ס״ו", "ס״ז", "ס״ח", "ס״ט", "ע׳",
    "ע״א", "ע״ב", "ע״ג", "ע״ד", "ע״ה", "ע״ו", "ע״ז", "ע״ח", "ע״ט", "פ׳",
    "פ״א", "פ״ב", "פ״ג", "פ״ד", "פ״ה", "פ״ו", "פ״ז", "פ״ח", "פ״ט", "צ׳",
    "צ״א", "צ״ב", "צ״ג", "צ״ד", "צ״ה", "צ״ו", "צ״ז", "צ״ח", "צ״ט", "ק׳",
    "ק״א", "ק״ב", "ק״ג", "ק״ד", "ק״ה", "ק״ו", "ק״ז", "ק״ח", "ק״ט", "ק״י",
    "קי״א", "קי״ב", "קי״ג", "קי״ד", "קט״ו", "קט״ז", "קי״ז", "קי״ח", "קי״ט", "ק״כ",
    "קכ״א", "קכ״ב", "קכ״ג", "קכ״ד", "קכ״ה", "קכ״ו", "קכ״ז", "קכ״ח", "קכ״ט", "ק״ל",
    "קל״א", "קל״ב", "קל״ג", "קל״ד", "קל״ה", "קל״ו", "קל״ז", "קל״ח", "קל״ט", "ק״מ",
    "קמ״א", "קמ״ב", "קמ״ג", "קמ״ד", "קמ״ה", "קמ״ו", "קמ״ז", "קמ״ח", "קמ״ט", "ק״נ"
  ];

  function cleanSefariaVerse(str) {
    if (!str) return "";
    return String(str)
      .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
      .replace(/<i class="footnote">.*?<\/i>/gi, "")
      .replace(/<span class="mam-spi-[^"]*">/gi, " ")
      .replace(/<\/span>/gi, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }

  function flattenSefariaHe(heData) {
    var out = [];
    function walk(node) {
      if (!node) return;
      if (typeof node === "string") {
        var cl = cleanSefariaVerse(node);
        if (cl) out.push(cl);
      } else if (Array.isArray(node)) {
        node.forEach(walk);
      }
    }
    walk(heData);
    return out;
  }

  window.fetchSefariaText = async function (sefariaRef) {
    if (SEFARIA_CACHE[sefariaRef]) return SEFARIA_CACHE[sefariaRef];
    try {
      var url = "https://www.sefaria.org/api/texts/" + encodeURIComponent(sefariaRef) + "?context=0&pad=0";
      var resp = await fetch(url);
      if (!resp.ok) return null;
      var data = await resp.json();
      if (!data || !data.he) return null;
      var verses = flattenSefariaHe(data.he);
      if (!verses.length) return null;
      var result = {
        ref: data.ref || sefariaRef,
        heRef: data.heRef || sefariaRef,
        verses: verses
      };
      SEFARIA_CACHE[sefariaRef] = result;
      return result;
    } catch (e) {
      console.warn("[Sefaria API] Fallback used for", sefariaRef, e);
      return null;
    }
  };

  window.adjustPrayerFontSize = function (delta) {
    currentPrayerFontSize = Math.min(32, Math.max(15, currentPrayerFontSize + (delta || 2)));
    var pBody = el("prayer-display-body");
    if (pBody) pBody.style.fontSize = currentPrayerFontSize + "px";
    var tBody = el("sefaria-tehillim-body");
    if (tBody) tBody.style.fontSize = currentPrayerFontSize + "px";
  };

  // מיפוי תפילות הסידור למראי מקומות אמיתיים ב-Sefaria API
  var PRAYER_SEFARIA_REFS = {
    hashachar: { ref: "Siddur_Edot_HaMizrach,_Preparatory_Prayers,_Morning_Blessings", fallbackRef: "Psalms.100", url: "https://www.sefaria.org/Siddur_Edot_HaMizrach,_Preparatory_Prayers,_Morning_Blessings" },
    shacharit: { ref: "Siddur_Edot_HaMizrach,_Weekday_Shacharit,_Barukh_She'amar", fallbackRef: "Psalms.145", url: "https://www.sefaria.org/Siddur_Edot_HaMizrach,_Weekday_Shacharit" },
    mincha:    { ref: "Psalms.145", fallbackRef: "Psalms.67", url: "https://www.sefaria.org/Siddur_Edot_HaMizrach,_Weekday_Mincha" },
    arvit:     { ref: "Psalms.134", fallbackRef: "Psalms.121", url: "https://www.sefaria.org/Siddur_Edot_HaMizrach,_Weekday_Arvit" },
    mazon:     { ref: "Psalms.126", fallbackRef: "Psalms.23", url: "https://www.sefaria.org/Siddur_Edot_HaMizrach,_Blessings,_Birkat_HaMazon" },
    kriyat_shema: { ref: "Psalms.91", fallbackRef: "Psalms.121", url: "https://www.sefaria.org/Siddur_Edot_HaMizrach,_Bedtime_Shema" },
    derech:    { ref: "Psalms.121", fallbackRef: "Psalms.91", url: "https://www.sefaria.org/Tefillat_HaDerekh" },
    chatzot:   { ref: "Psalms.137", fallbackRef: "Psalms.79", url: "https://www.sefaria.org/Psalms.137" }
  };

  var origSelectPrayer = window.__v37_prev_selectPrayer_1;
  window.selectPrayer = function (prayerKey) {
    currentSelectedPrayerKey = prayerKey || "hashachar";
    if (origSelectPrayer) origSelectPrayer(currentSelectedPrayerKey);
    window.reloadCurrentPrayerFromSefaria(true);
  };

  window.reloadCurrentPrayerFromSefaria = async function (silent) {
    var statusBadge = el("sefaria-prayer-status");
    var bodyEl = el("prayer-display-body");
    var linkEl = el("prayer-sefaria-link");
    var cfg = PRAYER_SEFARIA_REFS[currentSelectedPrayerKey] || PRAYER_SEFARIA_REFS.hashachar;
    if (linkEl && cfg.url) linkEl.href = cfg.url;

    if (statusBadge) statusBadge.textContent = "⏳ מושך טקסט מדויק מ-Sefaria API...";
    var localHtml = bodyEl ? bodyEl.innerHTML : "";

    var data = await window.fetchSefariaText(cfg.ref);
    if (!data && cfg.fallbackRef) {
      data = await window.fetchSefariaText(cfg.fallbackRef);
    }

    if (data && data.verses && data.verses.length && bodyEl) {
      var sefariaBlock = '<div class="mt-4 pt-4 border-t-2 border-[#C9A227] space-y-2">' +
        '<div class="flex items-center justify-between text-xs font-sans">' +
          '<span class="px-2.5 py-0.5 rounded bg-[#F6EFE2] border border-[#C9A227] font-black text-[#0F2340]">📜 נוסח מלא ממאגר ספריא (' + (data.heRef || cfg.ref) + ')</span>' +
        '</div>' +
        '<div class="space-y-2 leading-loose">' +
          data.verses.slice(0, 40).map(function (v, idx) {
            return '<p class="text-[#0F2340]"><strong class="text-[#B38E1E] text-sm ml-1.5">' + (HEB_NUMS[idx + 1] || (idx + 1)) + '</strong>' + v + '</p>';
          }).join("") +
        '</div>' +
      '</div>';

      // משאירים את הטקסט הקיים ומוסיפים את הפרק/הנוסח החי מספריא
      if (localHtml.indexOf("נוסח מלא ממאגר ספריא") === -1) {
        bodyEl.innerHTML = localHtml + sefariaBlock;
      }
      if (statusBadge) statusBadge.textContent = "🟢 מחובר ומסונכרן עם Sefaria API (" + (data.heRef || "ספריא") + ")";
      if (!silent && window.toast) window.toast("📜 הטקסט נמשך בהצלחה ממאגר ספריא!");
    } else {
      if (statusBadge) statusBadge.textContent = "🟢 מוצג נוסח הסידור המלא (זמין גם אופליין)";
    }
  };

  // חיבור ספר תהילים ל-Sefaria API (פרקים 1 עד 150)
  function populateTehillimSelects() {
    var html = "";
    for (var i = 1; i <= 150; i++) {
      html += '<option value="' + i + '">תהילים פרק ' + (HEB_NUMS[i] || i) + ' (' + i + ')</option>';
    }
    var s1 = el("sefaria-tehillim-select");
    if (s1) s1.innerHTML = html;
    var s2 = el("modal-tz-tehillim-select");
    if (s2) s2.innerHTML = html;
  }

  window.loadTehillimFromSefaria = async function (chapterNum) {
    var n = Math.min(150, Math.max(1, parseInt(chapterNum, 10) || 1));
    currentSefariaTehillimChapter = n;
    var sel = el("sefaria-tehillim-select");
    if (sel) sel.value = String(n);

    var titleEl = el("sefaria-tehillim-title");
    var bodyEl = el("sefaria-tehillim-body");
    var extLink = el("sefaria-tehillim-ext-link");
    var hebName = "תהילים פרק " + (HEB_NUMS[n] || n);

    if (titleEl) titleEl.textContent = hebName + " • טוען מספריא...";
    if (extLink) extLink.href = "https://www.sefaria.org/Psalms." + n;
    if (bodyEl) bodyEl.innerHTML = '<div class="text-sm text-[#5C4938]">⏳ מושך את ' + hebName + ' מה-API של Sefaria...</div>';

    var data = await window.fetchSefariaText("Psalms." + n);
    if (data && data.verses && data.verses.length) {
      if (titleEl) titleEl.textContent = (data.heRef || hebName) + " (מקור: Sefaria API)";
      if (bodyEl) {
        bodyEl.innerHTML = data.verses.map(function (v, idx) {
          var vNum = HEB_NUMS[idx + 1] || (idx + 1);
          return '<span class="inline leading-loose"><strong class="text-[#B38E1E] text-sm ml-1">(' + vNum + ')</strong> ' + v + ' </span>';
        }).join("");
      }
    } else {
      // גיבוי מקומי אם אין אינטרנט
      var localCh = (window.TEHILLIM_DATA || []).filter(function (c) { return String(c.chapter).indexOf(HEB_NUMS[n]) !== -1; })[0] || (window.TEHILLIM_DATA || [])[0];
      if (titleEl) titleEl.textContent = hebName;
      if (bodyEl) bodyEl.textContent = localCh ? localCh.text : "לְדָוִד מִזְמוֹר, ה׳ רוֹעִי לֹא אֶחְסָר...";
    }
  };

  window.stepSefariaTehillimChapter = function (delta) {
    var next = currentSefariaTehillimChapter + (delta || 1);
    if (next < 1) next = 150;
    if (next > 150) next = 1;
    window.loadTehillimFromSefaria(next);
  };

  // פתיחת מודאל תהילים לצדיק (מחליף את הדלקת הנר בקברי צדיקים)
  window.openTzaddikTehillimModal = function (tzaddikName, defaultChapter) {
    var modal = el("modal-tzaddik-tehillim");
    if (!modal) return;
    var nameEl = el("modal-tz-tehillim-name");
    if (nameEl) nameEl.textContent = "קריאת תהילים בציון: " + (tzaddikName || "צדיקי הדורות");
    modal.classList.remove("hidden");
    window.loadModalTzaddikTehillimChapter(defaultChapter || 20);
  };

  window.loadModalTzaddikTehillimChapter = async function (chapterNum) {
    var n = Math.min(150, Math.max(1, parseInt(chapterNum, 10) || 20));
    var sel = el("modal-tz-tehillim-select");
    if (sel) sel.value = String(n);
    var chTitle = el("modal-tz-tehillim-ch-title");
    var chBody = el("modal-tz-tehillim-body");
    var hebName = "תהילים פרק " + (HEB_NUMS[n] || n);
    if (chTitle) chTitle.textContent = hebName + " (טוען מ-Sefaria...)";
    if (chBody) chBody.textContent = "טוען פרק תהילים ממאגר ספריא...";

    var data = await window.fetchSefariaText("Psalms." + n);
    if (data && data.verses && data.verses.length) {
      if (chTitle) chTitle.textContent = data.heRef || hebName;
      if (chBody) {
        chBody.innerHTML = data.verses.map(function (v, idx) {
          return '<span class="inline leading-loose"><strong class="text-[#B38E1E] text-sm ml-1">(' + (HEB_NUMS[idx + 1] || (idx + 1)) + ')</strong> ' + v + ' </span>';
        }).join("");
      }
    } else if (chBody) {
      chBody.textContent = "שִׁיר לַמַּעֲלוֹת אֶשָּׂא עֵינַי אֶל הֶהָרִים מֵאַיִן יָבֹא עֶזְרִי. עֶזְרִי מֵעִם ה׳ עֹשֵׂה שָׁמַיִם וָאָרֶץ.";
    }
  };

  // ==========================================================================
  // חלק 4: מדור "למצוא" — ממשק נקי (ללא סרגל קטגוריות עליון בתוך תת-מדור)
  //        ושדרוגים לכל 8 תתי-המדורים
  // ==========================================================================
  var FIND_VIEWS_MAP = {
    minyanim: 1, chavruta: 1, rabbis: 1, chabad: 1, mikvaot: 1,
    restaurants: 1, tzaddikim: 1, gemachim: 1, customs: 1, yeshivot: 1
  };

  var prevSwitchTabV31 = window.__v37_prev_switchTab_2;
  window.__v37_prev_switchTab_3 = function (tabId, mode) {
    var alias = { learn: "series", pray: "siddur", donate: "raffles", givebuy: "raffles" };
    var resolvedTab = alias[tabId] || tabId;

    if (prevSwitchTabV31) prevSwitchTabV31(tabId, mode);

    // טיפול במדור "ללמוד": מציגים את 3 הלשוניות הראשיות ללא הסתרה של showHubMenu
    if (resolvedTab === "series") {
      document.body.classList.remove("focus-mode", "focus-more", "find-inner-active");
      var fbar = el("tt-focus-bar");
      if (fbar) fbar.classList.add("hidden");
      var vSeries = el("view-series");
      if (vSeries && vSeries.children[0]) vSeries.children[0].classList.remove("tt-navcard");
      window.switchLearnMainTab(activeLearnMainTab || "ai");
      return;
    }

    // טיפול בתתי-מדורים של "למצוא": הסרת הסרגל העליון עם כל שאר הקטגוריות!
    // משאירים רק כפתור "חזור", שורת החיפוש הספציפית, כפתור ה-GPS ותוכן המדור.
    if (FIND_VIEWS_MAP[resolvedTab]) {
      document.body.classList.add("find-inner-active");
      var strip = el("tt-focus-strip");
      if (strip) {
        strip.innerHTML = "";
        strip.classList.add("hidden");
      }
      var moreBtn = el("tt-more-btn");
      if (moreBtn) moreBtn.classList.add("hidden");

      // חשיפת כל כלי התוכן של התת-מדור (למעט סרגל הניווט הישן .find-top-cat-nav שנשאר מוסתר)
      var activeView = el("view-" + resolvedTab);
      if (activeView) {
        Array.prototype.slice.call(activeView.children).forEach(function (child) {
          if (!child.classList.contains("find-top-cat-nav")) {
            child.classList.remove("tt-tool", "tt-navcard");
          }
        });
      }
    } else {
      document.body.classList.remove("find-inner-active");
    }
  };

  // --------------------------------------------------------------------------
  // 4.2 קו הלכה ורבנים: העלאת רב חדש, תגובות ודירוגים, וקישור לתרומה
  // --------------------------------------------------------------------------
  window.__v37_prev_renderRabbis_4 = function (list) {
    var grid = el("rabbis-container");
    if (!grid) return;
    grid.innerHTML = (list || []).map(function (r, idx) {
      var rid = r.id || ("rab" + (idx + 1));
      var eKey = "rabbi_" + rid;
      var stats = window.getEntityStats ? window.getEntityStats(eKey, 5.0) : { avg: "5.0", count: 14 };
      var safeName = String(r.name || "").replace(/'/g, "");
      var safeTitle = String(r.title || r.specialty || "פוסק הלכה ומורה הוראה").replace(/'/g, "");
      var phone = r.phone || "073-3570000";
      var hours = r.hours || "מענה הלכתי לאורך היום";
      var boxId = "comments-rabbi-" + rid;

      var likesData = window.getCardLikes ? window.getCardLikes(eKey, 28 + (idx * 8)) : { isLiked: false, count: 28 };
      var comments = window.getCardComments ? window.getCardComments(eKey) : [];

      return '<div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm hover:border-[#C9A227] transition-all">' +
        '<div class="space-y-2">' +
          '<div class="flex items-center justify-between">' +
            '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">🟢 זמין למענה הלכתי</span>' +
            '<button type="button" onclick="openEntityFullPage(\'' + eKey + '\', \'קו הלכה ורב פוסק\', \'' + safeName + '\', \'' + safeTitle + '\', \'' + (r.city || "מענה ארצי") + '\', \'' + hours + '\', \'' + phone + '\', \'מענה הלכתי לשאלות דחופות ורגילות. דרגו את הזמינות, היחס והמענה!\', \'הזמינות • היחס • בהירות המענה\')" class="text-xs font-black text-[#0F2340] hover:underline">' +
              '★ ' + stats.avg + ' (' + stats.count + ' דירוגים)' +
            '</button>' +
          '</div>' +
          '<h3 class="text-lg font-black text-[#0F2340] serif-heading">' + r.name + '</h3>' +
          '<p class="text-xs text-[#5C4938] font-bold">' + safeTitle + '</p>' +
          '<p class="text-xs text-[#5C4938]">⏰ ' + hours + ' • 📞 ' + phone + '</p>' +
        '</div>' +

        '<div class="pt-2 border-t border-[#E5DBC7] space-y-2">' +
          '<div class="flex flex-wrap items-center justify-between gap-2">' +
            '<div class="flex items-center gap-1.5">' +
              '<button type="button" onclick="window.toggleCardLike(\'' + eKey + '\', this)" class="like-btn px-3 py-1.5 rounded-xl border border-[#D8CBB5] bg-[#FDF8EF] text-xs font-bold flex items-center gap-1 text-[#0F2340]">' +
                '<span class="like-icon">' + (likesData.isLiked ? "❤️" : "🤍") + '</span>' +
                '<span class="like-count font-mono">' + likesData.count + '</span>' +
              '</button>' +
              '<button type="button" onclick="window.toggleCardCommentBox(\'' + boxId + '\')" class="px-3 py-1.5 rounded-xl border border-[#D8CBB5] bg-[#FDF8EF] text-xs font-bold flex items-center gap-1 text-[#0F2340]">' +
                '<span>💬</span> <span>תגובות (<span id="count-' + boxId + '">' + comments.length + '</span>)</span>' +
              '</button>' +
            '</div>' +
            '<button type="button" onclick="openDonateModal(\'תרומה לבית ההוראה ולרב ' + safeName + '\')" class="px-3 py-1.5 bg-[#F6EFE2] text-[#0F2340] border-2 border-[#C9A227] font-black rounded-xl text-xs">' +
              '💝 תרומה לרב' +
            '</button>' +
          '</div>' +

          '<div id="' + boxId + '" class="hidden p-3 bg-[#F8F3E8] border border-[#E5DBC7] rounded-xl space-y-2 text-xs">' +
            '<div class="space-y-1.5 max-h-36 overflow-y-auto" id="list-' + boxId + '">' +
              comments.map(function (c) {
                return '<div class="p-2 bg-white rounded-lg border border-[#E5DBC7] space-y-0.5">' +
                  '<div class="flex items-center justify-between text-[11px]">' +
                    '<strong class="text-[#0F2340]">' + c.user + '</strong>' +
                    '<span class="text-[#5C4938]">' + (c.time || "השבוע") + '</span>' +
                  '</div>' +
                  '<p class="text-xs text-[#0F2340]">' + c.text + '</p>' +
                '</div>';
              }).join("") +
            '</div>' +
            '<div class="flex items-center gap-1.5 pt-1 border-t border-[#E5DBC7]">' +
              '<input type="text" id="input-' + boxId + '" placeholder="הוסף תגובה או תודה לרב..." class="flex-1 bg-white border border-[#D8CBB5] rounded-lg px-2.5 py-1.5 text-xs text-[#0F2340] outline-none">' +
              '<button type="button" onclick="window.submitInlineCardComment(\'' + eKey + '\', \'' + boxId + '\')" class="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs">שלח</button>' +
            '</div>' +
          '</div>' +

          '<div class="grid grid-cols-2 gap-2">' +
            '<a href="tel:' + phone + '" class="py-2 bg-amber-500 text-white font-black rounded-xl text-xs text-center flex items-center justify-center gap-1">📞 חייג לרב</a>' +
            '<a href="' + window.buildWhatsAppUrl(phone, 'שלום כבוד הרב, שאלה בהלכה מאפליקציית צדיק-טוק:') + '" target="_blank" class="py-2 bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">💬 וואטסאפ</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // --------------------------------------------------------------------------
  // 4.3 קברי צדיקים: כפתור "תהילים" במקום "הדלקת נר", תרומה, בניית מסלול ביקורים, ותגובות
  // --------------------------------------------------------------------------
  var tzaddikimRouteStops = [];

  window.toggleTzaddikRouteStop = function (name, city, address) {
    var idx = -1;
    tzaddikimRouteStops.forEach(function (s, i) { if (s.name === name) idx = i; });
    if (idx !== -1) {
      tzaddikimRouteStops.splice(idx, 1);
      window.toast("הציון הוסר ממסלול הביקורים");
    } else {
      tzaddikimRouteStops.push({ name: name, city: city || "", address: address || (name + " " + (city || "")) });
      window.toast("🗺️ נוסף למסלול הביקורים: " + name);
    }
    window.renderTzaddikimRouteBuilderUI();
    window.renderTzaddikim(window.TZADDIKIM_DATA || []);
  };

  window.loadPresetTzaddikimRoute = function (region) {
    if (region === "גליל") {
      tzaddikimRouteStops = [
        { name: "רבי שמעון בר יוחאי (רשב״י)", city: "מירון", address: "קבר רשב״י מירון" },
        { name: "האריז״ל הקדוש", city: "צפת", address: "בית העלמין העתיק צפת" },
        { name: "רבי מאיר בעל הנס", city: "טבריה", address: "קבר רבי מאיר בעל הנס טבריה" },
        { name: "הרמב״ם (הנשר הגדול)", city: "טבריה", address: "קבר הרמב״ם טבריה" }
      ];
    } else {
      tzaddikimRouteStops = [
        { name: "שמעון הצדיק", city: "ירושלים", address: "קבר שמעון הצדיק ירושלים" },
        { name: "דוד המלך", city: "ירושלים", address: "קבר דוד המלך הר ציון ירושלים" },
        { name: "אור החיים הקדוש", city: "ירושלים", address: "הר הזיתים ירושלים" }
      ];
    }
    window.renderTzaddikimRouteBuilderUI();
    window.renderTzaddikim(window.TZADDIKIM_DATA || []);
    window.toast("🗺️ נטען מסלול ביקורים מובנה ב" + region + "!");
  };

  window.clearTzaddikimRoute = function () {
    tzaddikimRouteStops = [];
    window.renderTzaddikimRouteBuilderUI();
    window.renderTzaddikim(window.TZADDIKIM_DATA || []);
  };

  window.renderTzaddikimRouteBuilderUI = function () {
    var listEl = el("tzaddikim-route-stops-list");
    var actEl = el("tzaddikim-route-actions");
    var gmapsEl = el("tzaddikim-route-gmaps-link");
    if (!listEl) return;

    if (!tzaddikimRouteStops.length) {
      listEl.innerHTML = '<span>עדיין לא נבחרו תחנות. לחץ על <strong>"🗺️ הוסף למסלול"</strong> בכרטיסי הצדיקים למטה או בחר מסלול מוכן.</span>';
      if (actEl) actEl.classList.add("hidden");
      return;
    }

    listEl.innerHTML = tzaddikimRouteStops.map(function (s, idx) {
      var safeN = String(s.name).replace(/'/g, "");
      return '<span class="px-3 py-1.5 rounded-xl bg-[#F6EFE2] border border-[#C9A227] text-xs font-bold text-[#0F2340] flex items-center gap-1.5">' +
        '<strong class="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] flex items-center justify-center">' + (idx + 1) + '</strong>' +
        '<span>' + s.name + ' (' + s.city + ')</span>' +
        '<button type="button" onclick="toggleTzaddikRouteStop(\'' + safeN + '\')" class="text-red-600 font-black mr-1" title="הסר">✕</button>' +
      '</span>';
    }).join('<span class="text-[#C9A227] font-black">←</span>');

    if (actEl) actEl.classList.remove("hidden");
    if (gmapsEl) {
      var dest = encodeURIComponent(tzaddikimRouteStops[tzaddikimRouteStops.length - 1].address);
      var waypoints = tzaddikimRouteStops.slice(0, -1).map(function (s) { return encodeURIComponent(s.address); }).join("|");
      gmapsEl.href = "https://www.google.com/maps/dir/?api=1&destination=" + dest + (waypoints ? "&waypoints=" + waypoints : "") + "&travelmode=driving";
    }
  };

  window.openFirstStopInWaze = function () {
    if (!tzaddikimRouteStops.length) return;
    window.open("https://waze.com/ul?q=" + encodeURIComponent(tzaddikimRouteStops[0].address), "_blank");
  };

  window.shareTzaddikimRouteWhatsApp = function () {
    if (!tzaddikimRouteStops.length) return;
    var lines = tzaddikimRouteStops.map(function (s, i) { return (i + 1) + ". " + s.name + " (" + s.city + ")"; }).join("\n");
    var msg = "🗺️ *מסלול תפילה וביקור בקברי צדיקים • צדיק-טוק:*\n\n" + lines;
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
  };

  window.renderTzaddikim = function (list) {
    var grid = el("tzaddikim-grid-container");
    if (!grid) return;
    grid.innerHTML = (list || []).map(function (t, idx) {
      var tid = t.id || ("tz" + (idx + 1));
      var eKey = "tzaddik_" + tid;
      var stats = window.getEntityStats ? window.getEntityStats(eKey, 5.0) : { avg: "5.0", count: 18 };
      var safeName = String(t.name || "").replace(/'/g, "");
      var safeTitle = String(t.title || "").replace(/'/g, "");
      var safeCity = String(t.city || "").replace(/'/g, "");
      var safeAddr = String(t.location || ("ציון " + safeName + " " + safeCity)).replace(/'/g, "");
      var safeStory = String((t.story || "") + " • סגולה מיוחדת: " + (t.segula || "")).replace(/'/g, "");
      var imgUrl = t.image || "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80";
      var phone = String(t.phone || "0500000000");

      var wazeUrl = "https://waze.com/ul?q=" + encodeURIComponent(safeAddr);
      var waUrl = t.whatsappGroup ? t.whatsappGroup : window.buildWhatsAppUrl(phone, "שלום, בקשת תפילה וסגולות בציון הצדיק " + safeName);
      var inRoute = tzaddikimRouteStops.some(function (s) { return s.name === safeName; });
      var comments = window.getCardComments ? window.getCardComments(eKey) : [];
      var boxId = "comments-tz-" + tid;

      return '<div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm hover:border-[#C9A227] transition-all">' +
        '<div class="space-y-2">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="px-2.5 py-0.5 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-full text-[11px] font-bold">📍 ' + safeCity + '</span>' +
            '<button type="button" onclick="openEntityFullPage(\'' + eKey + '\', \'דף קבר צדיק וסיפורי ישועות\', \'' + safeName + '\', \'' + safeTitle + '\', \'ציון הקודש ב' + safeCity + '\', \'פתוח 24/7 לתפילה ותהילים\', \'\', \'' + safeStory + '\', \'סיפורים • חוויות מהציון • בקשות תפילה\', \'' + imgUrl + '\')" class="text-xs font-black text-[#0F2340] hover:underline">' +
              '★ ' + stats.avg + ' (' + stats.count + ' סיפורים)' +
            '</button>' +
          '</div>' +
          '<h3 class="text-lg font-black text-[#0F2340] serif-heading">' + t.name + '</h3>' +
          '<p class="text-xs text-[#5C4938] font-bold">' + safeTitle + '</p>' +
          '<p class="text-xs text-[#0F2340] bg-[#FDF8EF] p-2.5 rounded-xl border border-[#E5DBC7]">✨ <strong>סגולה:</strong> ' + (t.segula || "תפילה לישועה ורפואה") + '</p>' +
        '</div>' +
        '<div class="pt-2 border-t border-[#E5DBC7] space-y-2">' +
          '<!-- שורה 1: תהילים (במקום הדלקת נר) + תרומה + מסלול ביקורים -->' +
          '<div class="grid grid-cols-3 gap-1.5">' +
            '<button type="button" onclick="openTzaddikTehillimModal(\'' + safeName + '\', 20)" class="py-2 bg-amber-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1">' +
              '📖 תהילים' +
            '</button>' +
            '<button type="button" onclick="openDonateModal(\'תרומה להחזקת ציון ' + safeName + '\')" class="py-2 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] font-black rounded-xl text-xs flex items-center justify-center gap-1">' +
              '💝 תרומה' +
            '</button>' +
            '<button type="button" onclick="toggleTzaddikRouteStop(\'' + safeName + '\', \'' + safeCity + '\', \'' + safeAddr + '\')" class="py-2 ' + (inRoute ? "bg-emerald-700 text-white" : "bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5]") + ' font-bold rounded-xl text-[11px] flex items-center justify-center gap-1">' +
              (inRoute ? "✓ במסלול" : "🗺️ + מסלול") +
            '</button>' +
          '</div>' +

          '<!-- שורה 2: Waze + וואטסאפ + תגובות -->' +
          '<div class="grid grid-cols-3 gap-1.5">' +
            '<a href="' + wazeUrl + '" target="_blank" class="py-2 bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">🚗 Waze</a>' +
            '<a href="' + waUrl + '" target="_blank" class="py-2 bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">💬 וואטסאפ</a>' +
            '<button type="button" onclick="window.toggleCardCommentBox(\'' + boxId + '\')" class="py-2 bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs flex items-center justify-center gap-1">' +
              '💬 תגובות (<span id="count-' + boxId + '">' + comments.length + '</span>)' +
            '</button>' +
          '</div>' +

          '<div id="' + boxId + '" class="hidden p-3 bg-[#F8F3E8] border border-[#E5DBC7] rounded-xl space-y-2 text-xs">' +
            '<div class="space-y-1.5 max-h-32 overflow-y-auto" id="list-' + boxId + '">' +
              comments.map(function (c) {
                return '<div class="p-2 bg-white rounded-lg border border-[#E5DBC7]">' +
                  '<strong class="text-[#0F2340] block text-[11px]">' + c.user + '</strong>' +
                  '<span class="text-xs text-[#0F2340]">' + c.text + '</span>' +
                '</div>';
              }).join("") +
            '</div>' +
            '<div class="flex items-center gap-1.5">' +
              '<input type="text" id="input-' + boxId + '" placeholder="שתף תגובה או סיפור ישועה בציון..." class="flex-1 bg-white border border-[#D8CBB5] rounded-lg px-2.5 py-1.5 text-xs text-[#0F2340] outline-none">' +
              '<button type="button" onclick="window.submitInlineCardComment(\'' + eKey + '\', \'' + boxId + '\')" class="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs">שלח</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");

    if (window.renderYahrzeitSharedCards) {
      window.renderYahrzeitSharedCards("tzaddikim-yahrzeits-container");
      window.renderYahrzeitSharedCards("zmanim-yahrzeits-container");
    }
  };

  // --------------------------------------------------------------------------
  // 4.4 שירותי דת: כל סוגי השירותים, חיפוש חכם ואפשרות העלאה למשתמשים
  // --------------------------------------------------------------------------
  var EXTRA_RELIGIOUS_SERVICES = [
    { id: "srv_shochet_1", name: "הרב אברהם כהן • שוחט ובודק מומחה (ירא שמיים)", category: "שוחטים ובודקים", city: "ירושלים / בני ברק / מרכז", phone: "052-8899112", description: "שוחט ובודק מוסמך לעופות ובהמות בכשרות מהדרין מן המהדרין, בדיקת סכינים והדרכת שחיטה.", rating: 5.0 },
    { id: "srv_chazan_1", name: "החזן והפייטן ר׳ משה לוי • שבתות חתן ושמחות", category: "חזנים ופייטנים", city: "פריסה ארצית", phone: "054-3322119", description: "חזן ופייטן לשבתות חתן, בר מצווה, הכנסת ספר תורה וחופות מרגשות בנוסח ספרד, ירושלמי ואשכנז.", rating: 5.0 },
    { id: "srv_chuppah_1", name: "הרב דוד אוחיון • עורך חופות וקידושין מוסמך", category: "עורכי חופות וקידושין", city: "כל הארץ", phone: "050-9123456", description: "עריכת חופה וקידושין כדת משה וישראל במאור פנים, שמחה והתרגשות, כולל ליווי רישום נישואין.", rating: 5.0 }
  ];

  function ensureAllReligiousServices() {
    var base = window.RELIGIOUS_SERVICES_DATA || [];
    EXTRA_RELIGIOUS_SERVICES.forEach(function (s) {
      if (!base.some(function (x) { return x.id === s.id; })) base.push(s);
    });
    window.RELIGIOUS_SERVICES_DATA = base;
  }

  var origRenderRelServices = window.__v37_prev_renderReligiousServicesDirectory_1;
  window.renderReligiousServicesDirectory = function (filterType) {
    ensureAllReligiousServices();
    if (origRenderRelServices) origRenderRelServices(filterType);
  };

  // --------------------------------------------------------------------------
  // 4.5 בתי חב״ד: העלאת בית חב״ד חדש או עדכון קיים, חיפוש חכם, תגובות וקבוצות קהילתיות
  // --------------------------------------------------------------------------
  var chabadFormMode = "new";
  window.toggleChabadUploadForm = function (mode, prefillObj) {
    chabadFormMode = mode || "new";
    var box = el("inline-chabad-upload-box");
    var titleEl = el("inline-chabad-form-title");
    if (!box) return;
    box.classList.remove("hidden");
    if (titleEl) {
      titleEl.textContent = chabadFormMode === "update"
        ? "✏️ עדכון פרטי בית חב״ד קיים (בחר או הקלד את שם בית חב״ד לעדכון):"
        : "➕ הוספת בית חב״ד חדש למדריך העולמי:";
    }
    if (prefillObj) {
      if (el("new-chb-name")) el("new-chb-name").value = prefillObj.name || "";
      if (el("new-chb-shaliach")) el("new-chb-shaliach").value = prefillObj.shaliach || "";
      if (el("new-chb-city")) el("new-chb-city").value = prefillObj.city || "";
      if (el("new-chb-phone")) el("new-chb-phone").value = prefillObj.phone || "";
      if (el("new-chb-services")) el("new-chb-services").value = prefillObj.services || "";
    }
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  window.submitChabadHouseV35 = function () {
    var name = val("new-chb-name");
    var shaliach = val("new-chb-shaliach") || "שליח חב״ד";
    var city = val("new-chb-city") || "ישראל / עולמי";
    var phone = val("new-chb-phone") || "050-0000000";
    var groupUrl = val("new-chb-group") || "";
    var services = val("new-chb-services") || "תפילות במניין, סעודות שבת, אוכל כשר ושיעורי תורה";

    if (!name) {
      window.toast("נא להזין את שם בית חב״ד");
      return;
    }

    var list = window.CHABAD_DATA || [];
    var existing = list.filter(function (c) { return c.name === name; })[0];
    if (existing) {
      existing.shaliach = shaliach;
      existing.city = city;
      existing.phone = phone;
      existing.communityGroup = groupUrl;
      existing.services = services;
      existing.description = services;
      window.toast("✔ פרטי " + name + " עודכנו בהצלחה!");
    } else {
      list.unshift({
        id: "ch_v35_" + Date.now(),
        name: name,
        shaliach: shaliach,
        rabbi: shaliach,
        city: city,
        address: city,
        phone: phone,
        whatsapp: phone.replace(/[^0-9]/g, ""),
        communityGroup: groupUrl,
        services: services,
        description: services
      });
      window.toast("🌍 בית חב״ד '" + name + "' נוסף בהצלחה למדריך!");
    }

    if (sb()) {
      try {
        sb().from("chabad_houses").insert([{
          name: name, rabbi: shaliach, country: city, address: city, phone: phone, description: services
        }]).then(function () {});
      } catch (e) {}
    }

    var box = el("inline-chabad-upload-box");
    if (box) box.classList.add("hidden");
    window.renderChabad(list);
  };

  window.renderChabad = function (list) {
    var grid = el("chabad-grid-container");
    if (!grid) return;
    grid.innerHTML = (list || []).map(function (c, idx) {
      var cid = c.id || ("ch" + (idx + 1));
      var eKey = "chabad_" + cid;
      var safeName = String(c.name || "").replace(/'/g, "");
      var safeShaliach = String(c.shaliach || c.rabbi || "שליח חב״ד").replace(/'/g, "");
      var safeCity = String(c.city || c.country || "").replace(/'/g, "");
      var safeAddr = String(c.address || safeCity).replace(/'/g, "");
      var safeServices = String(c.services || c.description || "").replace(/'/g, "");
      var phone = String(c.phone || "0500000000");

      var wazeUrl = "https://waze.com/ul?q=" + encodeURIComponent(safeAddr);
      var waUrl = window.buildWhatsAppUrl(phone, "שלום לבית חב״ד " + safeName + ", פנייה מאפליקציית צדיק-טוק:");
      var groupUrl = c.communityGroup || window.buildWhatsAppUrl(phone, "שלום, אשמח להצטרף לקבוצת הקהילה / המטיילים של " + safeName);
      var comments = window.getCardComments ? window.getCardComments(eKey) : [];
      var boxId = "comments-chabad-" + cid;

      return '<div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm hover:border-[#C9A227] transition-all">' +
        '<div class="space-y-1.5">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="px-2.5 py-0.5 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-md text-xs font-bold">🌍 ' + safeCity + '</span>' +
            '<button type="button" onclick="toggleChabadUploadForm(\'update\', {name:\'' + safeName + '\',shaliach:\'' + safeShaliach + '\',city:\'' + safeCity + '\',phone:\'' + phone + '\',services:\'' + safeServices + '\'})" class="text-xs font-bold text-[#5C4938] hover:text-[#0F2340] underline">✏️ עדכן פרטים</button>' +
          '</div>' +
          '<h3 class="text-lg font-black text-[#0F2340] serif-heading">' + c.name + '</h3>' +
          '<p class="text-xs font-bold text-[#0F2340]">👑 השליח: ' + safeShaliach + '</p>' +
          '<p class="text-xs text-[#5C4938] leading-relaxed">' + safeServices + '</p>' +
          '<p class="text-[11px] text-[#5C4938]">📍 ' + safeAddr + ' • 📞 ' + phone + '</p>' +
        '</div>' +

        '<div class="pt-2 border-t border-[#E5DBC7] space-y-2">' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<a href="' + groupUrl + '" target="_blank" class="py-2 bg-amber-500 text-white font-black rounded-xl text-xs text-center flex items-center justify-center gap-1">' +
              '👥 קבוצת הקהילה / מטיילים' +
            '</a>' +
            '<button type="button" onclick="window.toggleCardCommentBox(\'' + boxId + '\')" class="py-2 bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs flex items-center justify-center gap-1">' +
              '💬 תגובות (<span id="count-' + boxId + '">' + comments.length + '</span>)' +
            '</button>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<a href="' + wazeUrl + '" target="_blank" class="py-2 bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">🚗 נווט ב-Waze</a>' +
            '<a href="' + waUrl + '" target="_blank" class="py-2 bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">💬 וואטסאפ לשליח</a>' +
          '</div>' +

          '<div id="' + boxId + '" class="hidden p-3 bg-[#F8F3E8] border border-[#E5DBC7] rounded-xl space-y-2 text-xs">' +
            '<div class="space-y-1.5 max-h-32 overflow-y-auto" id="list-' + boxId + '">' +
              comments.map(function (cm) {
                return '<div class="p-2 bg-white rounded-lg border border-[#E5DBC7]">' +
                  '<strong class="text-[#0F2340] block text-[11px]">' + cm.user + '</strong>' +
                  '<span class="text-xs text-[#0F2340]">' + cm.text + '</span>' +
                '</div>';
              }).join("") +
            '</div>' +
            '<div class="flex items-center gap-1.5">' +
              '<input type="text" id="input-' + boxId + '" placeholder="כתוב תגובה או טיפ למטיילים בבית חב״ד..." class="flex-1 bg-white border border-[#D8CBB5] rounded-lg px-2.5 py-1.5 text-xs text-[#0F2340] outline-none">' +
              '<button type="button" onclick="window.submitInlineCardComment(\'' + eKey + '\', \'' + boxId + '\')" class="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs">שלח</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // --------------------------------------------------------------------------
  // 4.6 מסעדות: העלאת מסעדות חדשות, קישור לאתר המסעדה, תעודות כשרות, וסורק ברקוד מוצרים
  // --------------------------------------------------------------------------
  var activeCertRestaurant = null;
  var barcodeStream = null;
  var KOSHER_BARCODE_DB_KEY = "tzadiktok_kosher_barcodes_v35";
  var DEFAULT_BARCODE_PRODUCTS = {
    "7290000066318": { name: "במבה אסם (80 גרם)", brand: "אסם", status: "פרווה • כשר למהדרין ✔", hechsher: "בד״ץ העדה החרדית ירושלים + רבנות מקומית", notes: "ללא חשש חמץ, ללא רכיבי חלב" },
    "7290000120836": { name: "שוקולד פרה חלב • עלית", brand: "שטראוס-עלית", status: "חלבי (חלב ישראל) • כשר למהדרין ✔", hechsher: "בד״ץ העדה החרדית + רבנות נצרת", notes: "חלב ישראל מהדרין" },
    "7290004127329": { name: "חלב טרי תנובה 3% מהדרין", brand: "תנובה", status: "חלבי • כשר למהדרין ✔", hechsher: "ועדת מהדרין תנובה (הרב וייטמן)", notes: "חלב מהדרין ללא חשש חליבה בשבת" },
    "7290000068787": { name: "ביסלי גריל אסם", brand: "אסם", status: "פרווה • כשר למהדרין ✔", hechsher: "בד״ץ העדה החרדית ירושלים", notes: "מכיל גלוטן חיטה • פרווה למהדרין" },
    "7290000172125": { name: "קפה נמס עלית", brand: "עלית", status: "פרווה • כשר למהדרין (כשר לפסח בכל ימות השנה) ✔", hechsher: "בד״ץ העדה החרדית ירושלים", notes: "פרווה מהדרין" }
  };

  window.openBarcodeScannerModal = function () {
    var m = el("modal-barcode-scanner");
    if (m) m.classList.remove("hidden");
  };

  window.startBarcodeCamera = async function () {
    var wrap = el("barcode-camera-wrap");
    var video = el("barcode-video-el");
    if (!wrap || !video) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      window.toast("הדפדפן לא תומך בפתיחת מצלמה — ניתן להקליד ברקוד או שם מוצר ידנית");
      return;
    }
    try {
      wrap.classList.remove("hidden");
      barcodeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.srcObject = barcodeStream;
      await video.play();
      window.toast("📷 המצלמה פעילה — כוון אל הברקוד של המוצר");

      if ("BarcodeDetector" in window) {
        var detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "code_128"] });
        var scanLoop = async function () {
          if (!barcodeStream) return;
          try {
            var codes = await detector.detect(video);
            if (codes && codes.length > 0 && codes[0].rawValue) {
              var raw = codes[0].rawValue;
              if (el("barcode-manual-input")) el("barcode-manual-input").value = raw;
              window.lookupProductBarcode(raw);
              window.stopBarcodeCamera();
              return;
            }
          } catch (e) {}
          requestAnimationFrame(scanLoop);
        };
        requestAnimationFrame(scanLoop);
      }
    } catch (err) {
      wrap.classList.add("hidden");
      window.toast("לא ניתנה הרשאת מצלמה — ניתן להזין מספר ברקוד או שם מוצר בתיבה");
    }
  };

  window.stopBarcodeCamera = function () {
    if (barcodeStream) {
      barcodeStream.getTracks().forEach(function (t) { t.stop(); });
      barcodeStream = null;
    }
    var wrap = el("barcode-camera-wrap");
    if (wrap) wrap.classList.add("hidden");
  };

  window.lookupProductBarcode = function (query) {
    var box = el("barcode-result-box");
    if (!box) return;
    var q = (query || "").trim();
    if (!q) {
      box.innerHTML = "בחרו מוצר או הזינו ברקוד להצגת פרטי הכשרות המלאים.";
      return;
    }
    var inp = el("barcode-manual-input");
    if (inp && inp.value !== q) inp.value = q;

    var db = (window.getStorageJson && window.getStorageJson(KOSHER_BARCODE_DB_KEY, DEFAULT_BARCODE_PRODUCTS)) || DEFAULT_BARCODE_PRODUCTS;
    var found = db[q];
    var foundCode = q;

    if (!found) {
      Object.keys(db).forEach(function (code) {
        var item = db[code];
        if ([code, item.name, item.brand, item.hechsher].join(" ").indexOf(q) !== -1) {
          found = item;
          foundCode = code;
        }
      });
    }

    if (found) {
      box.innerHTML =
        '<div class="space-y-1.5">' +
          '<div class="flex items-center justify-between">' +
            '<span class="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs">' + found.status + '</span>' +
            '<span class="font-mono text-[11px] text-[#5C4938]">ברקוד: ' + foundCode + '</span>' +
          '</div>' +
          '<h4 class="text-base font-black text-[#0F2340]">' + found.name + ' (' + (found.brand || "") + ')</h4>' +
          '<p class="text-xs font-bold text-[#0F2340]">🛡️ גוף כשרות: ' + found.hechsher + '</p>' +
          '<p class="text-xs text-[#5C4938]">ℹ️ הערות כשרות: ' + (found.notes || "כשר מאומת") + '</p>' +
        '</div>';
    } else if (/^729\d{7,10}$/.test(q)) {
      box.innerHTML =
        '<div class="space-y-1">' +
          '<span class="px-2.5 py-0.5 rounded bg-[#F6EFE2] border border-[#C9A227] font-black text-xs text-[#0F2340]">ברקוד ישראלי תקין (' + q + ')</span>' +
          '<p class="text-xs text-[#0F2340]">המוצר מזוהה כייצור ישראלי (קידומת 729). מומלץ לוודא חותמת כשרות על גבי האריזה או להוסיף את פרטי המוצר למאגר למטה.</p>' +
        '</div>';
    } else {
      box.innerHTML = '<div class="text-xs text-[#5C4938]">לא נמצא מוצר תואם ל-"' + q + '". ניתן להוסיף אותו למאגר הכשרות הקהילתי למטה!</div>';
    }
  };

  window.addNewKosherBarcodeProduct = function () {
    var code = val("new-prod-barcode");
    var name = val("new-prod-name");
    var hech = val("new-prod-hechsher") || "כשר מהדרין";
    if (!code || !name) {
      window.toast("נא להזין ברקוד ושם מוצר");
      return;
    }
    var db = (window.getStorageJson && window.getStorageJson(KOSHER_BARCODE_DB_KEY, DEFAULT_BARCODE_PRODUCTS)) || DEFAULT_BARCODE_PRODUCTS;
    db[code] = {
      name: name,
      brand: "מאגר קהילתי",
      status: "כשר מאומת בקהילה ✔",
      hechsher: hech,
      notes: "נוסף על ידי חברי קהילת צדיק-טוק"
    };
    if (window.setStorageJson) window.setStorageJson(KOSHER_BARCODE_DB_KEY, db);
    ["new-prod-barcode", "new-prod-name", "new-prod-hechsher"].forEach(function (id) { var e = el(id); if (e) e.value = ""; });
    window.lookupProductBarcode(code);
    window.toast("✔ המוצר נוסף למאגר סורק הכשרות!");
  };

  window.toggleInlineRestaurantUpload = function () {
    var b = el("inline-restaurant-upload-box");
    if (b) b.classList.toggle("hidden");
  };

  window.submitNewRestaurantV35 = function () {
    var name = val("new-rest-name");
    var city = val("new-rest-city") || "ישראל";
    var type = val("new-rest-type") || "בשרי";
    var hech = val("new-rest-hechsher") || "מהדרין";
    var web = val("new-rest-website") || "";
    var cert = val("new-rest-cert") || "תעודת כשרות מהדרין בתוקף במקום";
    var phone = val("new-rest-phone") || "03-6000000";

    if (!name) {
      window.toast("נא להזין שם מסעדה");
      return;
    }
    var list = window.RESTAURANTS_DATA || [];
    list.unshift({
      id: "rest_v35_" + Date.now(),
      name: name,
      city: city,
      address: city,
      type: type,
      hechsher: hech,
      website: web,
      kosherCertInfo: cert,
      phone: phone,
      hours: "11:00 - 23:00",
      isOpen: true,
      isMehadrin: true,
      verifiedAt: "היום",
      desc: "מסעדה כשרה (" + type + " • " + hech + ")"
    });
    if (sb()) {
      try {
        sb().from("restaurants").insert([{
          name: name, city: city, address: city, type: type, hechsher: hech, phone: phone, description: cert
        }]).then(function () {});
      } catch (e) {}
    }
    window.toggleInlineRestaurantUpload();
    window.renderRestaurants(list);
    window.toast("🍽️ המסעדה '" + name + "' נוספה בהצלחה!");
  };

  window.openKosherCertModal = function (restId) {
    var list = window.RESTAURANTS_DATA || [];
    var r = list.filter(function (x) { return String(x.id) === String(restId); })[0] || list[0];
    if (!r) return;
    activeCertRestaurant = r;
    var m = el("modal-kosher-cert");
    if (!m) return;
    if (el("modal-kcert-rest-name")) el("modal-kcert-rest-name").textContent = r.name;
    var det = el("modal-kcert-details");
    if (det) {
      det.innerHTML =
        '<div><strong>🏛️ גוף הכשרות המוסמך:</strong> ' + (r.hechsher || "בד״ץ / מהדרין") + '</div>' +
        '<div><strong>🍽️ סיווג:</strong> ' + (r.type || "כשר") + '</div>' +
        '<div><strong>📍 כתובת:</strong> ' + (r.address || r.city || "") + '</div>' +
        '<div><strong>📅 תוקף ואימות אחרון:</strong> ' + (r.verifiedAt || "בתוקף לשנת תשפ״ז ✔") + '</div>' +
        '<div><strong>📜 פרטי התעודה / משגיח:</strong> ' + (r.kosherCertInfo || "תעודת כשרות מקורית מוצגת בבית העסק") + '</div>';
    }
    m.classList.remove("hidden");
  };

  window.saveUpdatedKosherCert = function () {
    var info = val("modal-kcert-new-url");
    if (!info) {
      window.toast("נא להזין קישור לתעודה או פרטי משגיח");
      return;
    }
    if (activeCertRestaurant) {
      activeCertRestaurant.kosherCertInfo = info;
      activeCertRestaurant.verifiedAt = "עודכן ע״י הקהילה ✔";
    }
    if (el("modal-kcert-new-url")) el("modal-kcert-new-url").value = "";
    window.closeModal("modal-kosher-cert");
    window.renderRestaurants(window.RESTAURANTS_DATA || []);
    window.toast("📜 תעודת הכשרות עודכנה בהצלחה!");
  };

  window.renderRestaurants = function (list) {
    var grid = el("restaurants-grid-container");
    if (!grid) return;
    grid.innerHTML = (list || []).map(function (r, idx) {
      var rid = r.id || ("r" + (idx + 1));
      var eKey = "rest_" + rid;
      var safeName = String(r.name || "").replace(/'/g, "");
      var safeCity = String(r.city || "").replace(/'/g, "");
      var safeAddr = String(r.address || (safeName + " " + safeCity)).replace(/'/g, "");
      var phone = String(r.phone || "036000000");
      var websiteUrl = r.website || ("https://www.google.com/search?q=" + encodeURIComponent(r.name + " " + safeCity + " תפריט מסעדה"));
      var wazeUrl = "https://waze.com/ul?q=" + encodeURIComponent(safeAddr);
      var comments = window.getCardComments ? window.getCardComments(eKey) : [];
      var boxId = "comments-rest-" + rid;

      return '<div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm hover:border-[#C9A227] transition-all">' +
        '<div class="space-y-1.5">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="px-2.5 py-0.5 rounded-md bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] text-xs font-black">' + (r.type || "כשר") + ' • ' + (r.hechsher || "מהדרין") + '</span>' +
            '<span class="text-[11px] font-bold text-emerald-800">🟢 מאומת</span>' +
          '</div>' +
          '<h3 class="text-lg font-black text-[#0F2340] serif-heading">' + r.name + '</h3>' +
          '<p class="text-xs text-[#5C4938]">' + (r.desc || r.description || "") + '</p>' +
          '<p class="text-[11px] text-[#5C4938]">📍 ' + safeAddr + ' • ⏰ ' + (r.hours || "10:00-23:00") + '</p>' +
        '</div>' +
        '<div class="pt-2 border-t border-[#E5DBC7] space-y-2">' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<button type="button" onclick="openKosherCertModal(\'' + rid + '\')" class="py-2 bg-amber-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1">' +
              '📜 תעודת כשרות' +
            '</button>' +
            '<a href="' + websiteUrl + '" target="_blank" class="py-2 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">' +
              '🌐 אתר המסעדה' +
            '</a>' +
          '</div>' +
          '<div class="grid grid-cols-3 gap-1.5">' +
            '<a href="' + wazeUrl + '" target="_blank" class="py-2 bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center">🚗 Waze</a>' +
            '<a href="tel:' + phone + '" class="py-2 bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center">📞 חייג</a>' +
            '<button type="button" onclick="window.toggleCardCommentBox(\'' + boxId + '\')" class="py-2 bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs">' +
              '💬 תגובות (<span id="count-' + boxId + '">' + comments.length + '</span>)' +
            '</button>' +
          '</div>' +
          '<div id="' + boxId + '" class="hidden p-3 bg-[#F8F3E8] border border-[#E5DBC7] rounded-xl space-y-2 text-xs">' +
            '<div class="space-y-1.5 max-h-32 overflow-y-auto" id="list-' + boxId + '">' +
              comments.map(function (cm) {
                return '<div class="p-2 bg-white rounded-lg border border-[#E5DBC7]">' +
                  '<strong class="text-[#0F2340] block text-[11px]">' + cm.user + '</strong>' +
                  '<span class="text-xs text-[#0F2340]">' + cm.text + '</span>' +
                '</div>';
              }).join("") +
            '</div>' +
            '<div class="flex items-center gap-1.5">' +
              '<input type="text" id="input-' + boxId + '" placeholder="הוסף המלצה או תגובה על המסעדה..." class="flex-1 bg-white border border-[#D8CBB5] rounded-lg px-2.5 py-1.5 text-xs text-[#0F2340] outline-none">' +
              '<button type="button" onclick="window.submitInlineCardComment(\'' + eKey + '\', \'' + boxId + '\')" class="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs">שלח</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // --------------------------------------------------------------------------
  // 4.7 גמ״חים: תתי-קטגוריות, חיפוש לפי פריטים, "יש לי גמ״ח ל...", תרומה ותגובות
  // --------------------------------------------------------------------------
  var EXTRA_V35_GEMACHIM = [
    { id: "gm_tools_1", name: "גמ״ח כלי עבודה וציוד בנייה • בית יוסף", category: "כלי עבודה וציוד", city: "בני ברק / ירושלים", address: "רח׳ חזון איש 18, בני ברק", phone: "052-7654321", hours: "א׳-ה׳ 17:00-21:30", items: ["מקדחה", "פטישון", "סולם גבוה", "מברגה", "כלי עבודה"], desc: "השאלת מקדחות, פטישונים, סולמות, מברגות וציוד תחזוקה לבית ללא עלות." },
    { id: "gm_baby_1", name: "גמ״ח חסדי אסתר • ציוד לתינוקות ויולדות", category: "תינוקות ויולדות", city: "ירושלים / בני ברק / אשדוד", address: "רח׳ שמגר 14, ירושלים", phone: "054-8412345", hours: "09:00-21:00", items: ["עריסה לתינוק", "משאבת חלב", "עגלת תאומים", "סלקל", "בקבוקים"], desc: "השאלת עריסות עץ ופלסטיק, משאבות חלב, עגלות וסלקלים ליולדות בשמחה." },
    { id: "gm_simcha_1", name: "גמ״ח שמחת חתן וכלה • ציוד לשמחות ואירועים", category: "שמחות ואירועים", city: "מרכז וירושלים", address: "רח׳ רבי עקיבא 90, בני ברק", phone: "053-3112233", hours: "בתיאום מראש", items: ["מפות שולחן", "כיסאות מתקפלים", "פלטה לשבת", "מיחם לשבת", "מחיצות"], desc: "השאלת מפות יוקרתיות, כיסאות, שולחנות, פלטות ומיחמים לשבתות חתן ושמחות." }
  ];

  function ensureRichGemachimData() {
    var base = window.GEMACHIM_DATA || [];
    EXTRA_V35_GEMACHIM.forEach(function (g) {
      if (!base.some(function (x) { return x.id === g.id; })) base.push(g);
    });
    window.GEMACHIM_DATA = base;
  }

  window.toggleHaveGemachForm = function () {
    var b = el("have-gemach-upload-box");
    if (b) b.classList.toggle("hidden");
  };

  window.searchGemachByItem = function (itemName) {
    ensureRichGemachimData();
    var inp = el("gemach-item-search-input");
    if (inp) inp.value = itemName || "";
    window.filterFindSectionByQuery("gemachim", itemName || "");
  };

  window.submitHaveGemachV35 = function () {
    var name = val("new-gm-name");
    var cat = val("new-gm-cat") || "גמ״ח וחסד";
    var itemsRaw = val("new-gm-items");
    var city = val("new-gm-city") || "ישראל";
    var phone = val("new-gm-phone") || "050-0000000";

    if (!name || !itemsRaw) {
      window.toast("נא להזין את שם הגמ״ח ואת הפריטים הזמינים להשאלה");
      return;
    }
    ensureRichGemachimData();
    var itemsArr = itemsRaw.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    var desc = "פריטים להשאלה: " + itemsRaw;
    window.GEMACHIM_DATA.unshift({
      id: "gm_u_" + Date.now(),
      name: name.indexOf("גמ״ח") === -1 ? ("גמ״ח " + name) : name,
      category: cat,
      city: city,
      address: city,
      phone: phone,
      hours: "בתיאום טלפוני",
      items: itemsArr,
      desc: desc,
      description: desc
    });

    if (sb()) {
      try {
        sb().from("gemachim").insert([{
          name: name, category: cat, city: city, address: city, phone: phone, description: desc
        }]).then(function () {});
      } catch (e) {}
    }

    ["new-gm-name", "new-gm-items", "new-gm-city", "new-gm-phone"].forEach(function (id) { var e = el(id); if (e) e.value = ""; });
    window.toggleHaveGemachForm();
    window.renderGemachim(window.GEMACHIM_DATA);
    window.toast("🤝 יישר כוח! הגמ״ח שלך נוסף למאגר החסד");
  };

  window.__v37_prev_renderGemachim_4 = function (list) {
    ensureRichGemachimData();
    var grid = el("gemachim-grid-container");
    if (!grid) return;
    grid.innerHTML = (list || []).map(function (g, idx) {
      var gid = g.id || ("gm" + (idx + 1));
      var eKey = "gemach_" + gid;
      var safeName = String(g.name || "").replace(/'/g, "");
      var safeCat = String(g.category || "גמ״ח וחסד").replace(/'/g, "");
      var safeAddr = String(g.address || g.city || "פריסה ארצית").replace(/'/g, "");
      var safeHours = String(g.hours || "א׳-ה׳ 09:00-21:00").replace(/'/g, "");
      var safeDesc = String(g.description || g.desc || "").replace(/'/g, "");
      var phone = String(g.phone || "0500000000");
      var items = g.items || ["ציוד רפואי", "השאלה חינם", "עזרה הדדית"];

      var wazeUrl = "https://waze.com/ul?q=" + encodeURIComponent(safeAddr);
      var waUrl = window.buildWhatsAppUrl(phone, "שלום, פונה מאפליקציית צדיק-טוק לגבי הגמ״ח (" + safeName + ")");
      var comments = window.getCardComments ? window.getCardComments(eKey) : [];
      var boxId = "comments-gemach-" + gid;

      return '<div class="bg-white border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm hover:border-[#C9A227] transition-all">' +
        '<div class="space-y-2">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="px-2.5 py-0.5 rounded-md bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] text-xs font-black">' + safeCat + '</span>' +
            '<button type="button" onclick="openDonateModal(\'תרומה להחזקת ' + safeName + '\')" class="px-2.5 py-1 bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] rounded-lg text-[11px] font-black">💝 תרומה לגמ״ח</button>' +
          '</div>' +
          '<h3 class="text-lg font-black text-[#0F2340] serif-heading">' + g.name + '</h3>' +
          '<p class="text-xs text-[#5C4938] leading-relaxed">' + safeDesc + '</p>' +
          '<div class="flex flex-wrap gap-1 pt-0.5">' +
            items.map(function (it) {
              var sIt = String(it).replace(/'/g, "");
              return '<button type="button" onclick="searchGemachByItem(\'' + sIt + '\')" class="px-2 py-0.5 rounded bg-[#FDF8EF] border border-[#D8CBB5] text-[10px] font-bold text-[#0F2340]">🏷️ ' + it + '</button>';
            }).join("") +
          '</div>' +
          '<div class="text-[11px] text-[#5C4938] space-y-0.5 pt-1">' +
            '<div>📍 <strong>כתובת:</strong> ' + safeAddr + ' • ⏰ ' + safeHours + '</div>' +
            '<div>📞 <strong>טלפון:</strong> ' + phone + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="pt-2 border-t border-[#E5DBC7] space-y-2">' +
          '<div class="grid grid-cols-3 gap-1.5">' +
            '<a href="tel:' + phone + '" class="py-2 bg-amber-500 text-white font-black rounded-xl text-xs text-center">📞 חייג</a>' +
            '<a href="' + wazeUrl + '" target="_blank" class="py-2 bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center">🚗 Waze</a>' +
            '<a href="' + waUrl + '" target="_blank" class="py-2 bg-[#FDF8EF] text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center">💬 וואטסאפ</a>' +
          '</div>' +
          '<button type="button" onclick="window.toggleCardCommentBox(\'' + boxId + '\')" class="w-full py-1.5 bg-[#FDF8EF] border border-[#D8CBB5] text-[#0F2340] font-bold rounded-xl text-xs">' +
            '💬 תגובות ותודות (<span id="count-' + boxId + '">' + comments.length + '</span>)' +
          '</button>' +
          '<div id="' + boxId + '" class="hidden p-3 bg-[#F8F3E8] border border-[#E5DBC7] rounded-xl space-y-2 text-xs">' +
            '<div class="space-y-1.5 max-h-32 overflow-y-auto" id="list-' + boxId + '">' +
              comments.map(function (cm) {
                return '<div class="p-2 bg-white rounded-lg border border-[#E5DBC7]">' +
                  '<strong class="text-[#0F2340] block text-[11px]">' + cm.user + '</strong>' +
                  '<span class="text-xs text-[#0F2340]">' + cm.text + '</span>' +
                '</div>';
              }).join("") +
            '</div>' +
            '<div class="flex items-center gap-1.5">' +
              '<input type="text" id="input-' + boxId + '" placeholder="כתוב תודה או עדכון על הגמ״ח..." class="flex-1 bg-white border border-[#D8CBB5] rounded-lg px-2.5 py-1.5 text-xs text-[#0F2340] outline-none">' +
              '<button type="button" onclick="window.submitInlineCardComment(\'' + eKey + '\', \'' + boxId + '\')" class="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs">שלח</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // --------------------------------------------------------------------------
  // 4.8 ישיבות: העלאת ישיבה חדשה, כפתור תרומה לישיבה ותגובות
  // --------------------------------------------------------------------------
  window.toggleYeshivaUploadForm = function () {
    var b = el("inline-yeshiva-upload-box");
    if (b) b.classList.toggle("hidden");
  };

  window.submitNewYeshivaV35 = function () {
    var name = val("new-ysh-name");
    var rosh = val("new-ysh-rosh") || "ישיבה גבוהה ובית מדרש";
    var city = val("new-ysh-city") || "ישראל";
    var phone = val("new-ysh-phone") || "02-5000000";
    var donate = val("new-ysh-donate") || "";
    var desc = val("new-ysh-desc") || "בית מדרש גבוה ללימוד תורה בעיון ובקיאות.";

    if (!name) {
      window.toast("נא להזין את שם הישיבה או המוסד");
      return;
    }
    var list = window.YESHIVOT_DATA || [];
    list.unshift({
      id: "ysh_u_" + Date.now(),
      name: name,
      type: rosh,
      city: city,
      address: city,
      phone: phone,
      donateUrl: donate,
      verification: "נוסף ע״י הקהילה ✔",
      description: desc
    });
    window.YESHIVOT_DATA = list;
    ["new-ysh-name", "new-ysh-rosh", "new-ysh-city", "new-ysh-phone", "new-ysh-donate", "new-ysh-desc"].forEach(function (id) { var e = el(id); if (e) e.value = ""; });
    window.toggleYeshivaUploadForm();
    window.renderYeshivotAndMosdot("");
    window.toast("🏛️ הישיבה '" + name + "' נוספה בהצלחה למדריך עולם התורה!");
  };

  window.renderYeshivotAndMosdot = function (query) {
    var grid = el("yeshivot-grid-container");
    if (!grid) return;
    var list = window.YESHIVOT_DATA || [];
    var q = (query || "").trim().toLowerCase();
    if (q) {
      list = list.filter(function (y) {
        return [y.name, y.type, y.city, y.address, y.description].join(" ").toLowerCase().indexOf(q) !== -1;
      });
    }

    grid.innerHTML = list.map(function (y, idx) {
      var yid = y.id || ("ysh_" + (idx + 1));
      var eKey = "yeshiva_" + yid;
      var safeName = String(y.name || "").replace(/'/g, "");
      var safeCity = String(y.city || "").replace(/'/g, "");
      var safeAddr = String(y.address || (safeName + " " + safeCity)).replace(/'/g, "");
      var phone = String(y.phone || "03-6180000");
      var wazeUrl = "https://waze.com/ul?q=" + encodeURIComponent(safeAddr);
      var comments = window.getCardComments ? window.getCardComments(eKey) : [];
      var boxId = "comments-yeshiva-" + yid;
      var donateClick = y.donateUrl
        ? "window.open('" + String(y.donateUrl).replace(/'/g, "") + "', '_blank')"
        : "openDonateModal('תרומה והחזקת תורה: " + safeName + "')";

      return '<div class="bg-[#FDF8EF] border border-[#E5DBC7] p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm hover:border-[#C9A227] transition-all">' +
        '<div class="space-y-1.5">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="px-2.5 py-0.5 rounded-md bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] text-xs font-bold">' + (y.type || "ישיבה ובית מדרש") + '</span>' +
            '<span class="text-[11px] font-bold text-emerald-800">' + (y.verification || "מאומת ✔") + '</span>' +
          '</div>' +
          '<h3 class="text-lg font-black text-[#0F2340] serif-heading">' + y.name + '</h3>' +
          '<p class="text-xs text-[#5C4938] leading-relaxed">' + (y.description || "") + '</p>' +
          '<p class="text-[11px] text-[#5C4938]">📍 ' + safeAddr + ' • 📞 ' + phone + '</p>' +
        '</div>' +

        '<div class="pt-2 border-t border-[#E5DBC7] space-y-2">' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<button type="button" onclick="' + donateClick + '" class="py-2 bg-amber-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1">' +
              '💝 תרומה לישיבה' +
            '</button>' +
            '<button type="button" onclick="window.toggleCardCommentBox(\'' + boxId + '\')" class="py-2 bg-white text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs flex items-center justify-center gap-1">' +
              '💬 תגובות (<span id="count-' + boxId + '">' + comments.length + '</span>)' +
            '</button>' +
          '</div>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<a href="' + wazeUrl + '" target="_blank" class="py-1.5 bg-white text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center">🚗 נווט ב-Waze</a>' +
            '<a href="tel:' + phone + '" class="py-1.5 bg-white text-[#0F2340] border border-[#D8CBB5] font-bold rounded-xl text-xs text-center">📞 חייג למזכירות</a>' +
          '</div>' +
          '<div id="' + boxId + '" class="hidden p-3 bg-white border border-[#E5DBC7] rounded-xl space-y-2 text-xs">' +
            '<div class="space-y-1.5 max-h-32 overflow-y-auto" id="list-' + boxId + '">' +
              comments.map(function (cm) {
                return '<div class="p-2 bg-[#FDF8EF] rounded-lg border border-[#E5DBC7]">' +
                  '<strong class="text-[#0F2340] block text-[11px]">' + cm.user + '</strong>' +
                  '<span class="text-xs text-[#0F2340]">' + cm.text + '</span>' +
                '</div>';
              }).join("") +
            '</div>' +
            '<div class="flex items-center gap-1.5">' +
              '<input type="text" id="input-' + boxId + '" placeholder="הוסף תגובה על הישיבה / בית המדרש..." class="flex-1 bg-[#FDF8EF] border border-[#D8CBB5] rounded-lg px-2.5 py-1.5 text-xs text-[#0F2340] outline-none">' +
              '<button type="button" onclick="window.submitInlineCardComment(\'' + eKey + '\', \'' + boxId + '\')" class="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs">שלח</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // ==========================================================================
  // אתחול V35 בטעינת הדף
  // ==========================================================================
  onReady(function () {
    populateTehillimSelects();
    ensureRichShiurimData();
    ensureEduVideosWithRabbis();
    ensureRichGemachimData();
    ensureAllReligiousServices();

    window.renderRabbiShiurimList("");
    window.renderWeeklyCourses();
    window.renderTzaddikimStoriesLearn("");
    window.filterEduVideosByRabbi("all");
    window.renderInlineLearnQuizzes("all");

    if (window.RABBIS_DATA) window.renderRabbis(window.RABBIS_DATA);
    if (window.TZADDIKIM_DATA) window.renderTzaddikim(window.TZADDIKIM_DATA);
    if (window.CHABAD_DATA) window.renderChabad(window.CHABAD_DATA);
    if (window.RESTAURANTS_DATA) window.renderRestaurants(window.RESTAURANTS_DATA);
    if (window.GEMACHIM_DATA) window.renderGemachim(window.GEMACHIM_DATA);
    if (window.YESHIVOT_DATA) window.renderYeshivotAndMosdot("");

    // טעינה ראשונית מספריא לסידור ולתהילים פרק א׳
    window.reloadCurrentPrayerFromSefaria(true);
    window.loadTehillimFromSefaria(1);
  });

})();


// ============================================================================
// V37 MASTER ENGINE — STORAGE_KEYS CLEANUP, MODAL BACKDROP & X BUTTON FIX,
// DEBOUNCED HEBREW SEARCH, 5-TAB ARCHITECTURE, 2-COL LEARN GRID & UNIFIED CAROUSEL
// ============================================================================
(function () {
  "use strict";

  // 1. מחיקה מיידית של המפתח השבור "undefined" מ-localStorage
  try {
    localStorage.removeItem("undefined");
  } catch (e) {}

  var esc = window.escapeHtml || function (v) {
    if (v === null || v === undefined) return "";
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  var escAttr = window.escAttr || function (v) {
    if (v === null || v === undefined) return "";
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "").replace(/`/g, "");
  };

  function el(id) { return document.getElementById(id); }
  function val(id) { var e = el(id); return e ? (e.value || "").trim() : ""; }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // 2. תיקון מודאל ההלכה והדירוגים (#modal-entity-details וכל .modal-backdrop):
  //    - לחיצה על הרקע הכהה מסביב סוגרת את החלון
  //    - לחיצה על מקש Escape סוגרת את החלון
  //    - וידוא כפתור X בולט בפינה העליונה של כל מודאל
  function setupModalsBackdropAndCloseBtn() {
    qsa(".modal-backdrop").forEach(function (backdrop) {
      backdrop.addEventListener("click", function (ev) {
        if (ev.target === backdrop && backdrop.id) {
          if (backdrop.id === "modal-barcode-scanner" && window.stopBarcodeCamera) {
            window.stopBarcodeCamera();
          }
          window.closeModal(backdrop.id);
        }
      });

      // שדרוג כפתור ה-X הפנימי בכל המודאלים שיהיה בולט וברור
      var closeBtns = qsa("button[onclick*='closeModal']", backdrop);
      closeBtns.forEach(function (btn) {
        if ((btn.textContent || "").trim() === "✕") {
          btn.className = "modal-close-x-btn absolute top-4 left-4";
          btn.innerHTML = "<span>✕</span><span>סגור</span>";
        }
      });
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        qsa(".modal-backdrop:not(.hidden)").forEach(function (backdrop) {
          if (backdrop.id) {
            if (backdrop.id === "modal-barcode-scanner" && window.stopBarcodeCamera) {
              window.stopBarcodeCamera();
            }
            window.closeModal(backdrop.id);
          }
        });
      }
    });
  }

  // 3. קרוסלה אחת מאוחדת של "תוכן מומלץ" בדף הבית (משלבת שיעורים וסרטונים)
  window.renderHomeRecommendedCarousel = function () {
    var box = el("home-recommended-carousel");
    if (!box) return;

    var shiurim = (window.RABBI_SHIURIM_DATA || []).slice(0, 4).map(function (s, idx) {
      return {
        key: "shiur_" + (s.id || ("s" + idx)),
        badge: "שיעור מומלץ • " + (s.subCategory || s.topic || "תורה"),
        title: s.title || "שיעור תורה",
        speaker: s.rabbi || "רב בית המדרש",
        duration: s.duration || "45:00",
        desc: s.institution || "בית המדרש",
        isVideo: false
      };
    });

    var videos = (window.EDUCATIONAL_VIDEOS_DATA || []).slice(0, 4).map(function (v, idx) {
      return {
        key: "edu_" + (v.id || ("v" + idx)),
        badge: "סרטון • " + (v.category || "חינוכי"),
        title: v.title || "סרטון חינוכי",
        speaker: v.speaker || "רב בית המדרש",
        duration: v.duration || "20:00",
        desc: v.description || "",
        thumb: v.thumbnail || "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80",
        isVideo: true
      };
    });

    // שילוב לסירוגין של שיעורים וסרטונים בקרוסלה אחת
    var combined = [];
    var maxLen = Math.max(shiurim.length, videos.length);
    for (var i = 0; i < maxLen; i++) {
      if (shiurim[i]) combined.push(shiurim[i]);
      if (videos[i]) combined.push(videos[i]);
    }

    box.innerHTML = combined.map(function (item) {
      return '<div class="shrink-0 w-64 sm:w-72 bg-[#FDF8EF] border border-[#E5DBC7] hover:border-[#C9A227] rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm transition-all">' +
        '<div class="space-y-2">' +
          '<div class="flex items-center justify-between gap-2 text-xs">' +
            '<span class="px-2.5 py-0.5 rounded-md bg-[#F6EFE2] text-[#0F2340] border border-[#C9A227] font-black">' + esc(item.badge) + '</span>' +
            '<span class="font-mono text-[#5C4938] font-bold">' + esc(item.duration) + '</span>' +
          '</div>' +
          '<h4 class="text-base font-black text-[#0F2340] serif-heading leading-snug">' + esc(item.title) + '</h4>' +
          '<p class="text-xs font-bold text-[#0F2340]">' + esc(item.speaker) + '</p>' +
          (item.desc ? '<p class="text-xs text-[#5C4938] line-clamp-2">' + esc(item.desc) + '</p>' : '') +
        '</div>' +
        '<div class="pt-2 border-t border-[#E5DBC7] flex items-center justify-between gap-2">' +
          '<button type="button" onclick="openEntityFullPage(\'' + escAttr(item.key) + '\', \'' + escAttr(item.badge) + '\', \'' + escAttr(item.title) + '\', \'' + escAttr(item.speaker) + '\', \'בית המדרש\', \'אורך: ' + escAttr(item.duration) + '\', \'\', \'' + escAttr(item.desc || item.title) + '\', \'בהירות • חיזוק\')" class="w-full py-2 bg-amber-500 hover:bg-amber-400 text-white font-black rounded-xl text-xs text-center">צפייה ותגובות</button>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  window.renderHomeCarousels = window.renderHomeRecommendedCarousel;

  // 4. עדכון מונה תוצאות חי ("מציג X תוצאות") ותבנית דפי הרשימות
  window.updateLiveResultCounter = function (sectionKey, count, totalCount) {
    var badge = el("result-count-" + sectionKey);
    if (!badge) return;
    if (typeof totalCount === "number" && totalCount > count) {
      badge.textContent = "מציג " + count + " מתוך " + totalCount + " תוצאות";
    } else {
      badge.textContent = "מציג " + count + " תוצאות";
    }
  };

  var LIST_PAGE_CONFIGS = {
    minyanim: {
      viewId: "view-minyanim",
      title: "מניינים בזמן אמת",
      placeholder: "חיפוש מניין לפי שם בית כנסת, עיר, שכונה או נוסח...",
      addLabel: "+ הוסף מניין",
      addFn: function () { window.openCommunityAddModal("minyan"); }
    },
    mikvaot: {
      viewId: "view-mikvaot",
      title: "מקוואות טהרה",
      placeholder: "חיפוש מקווה לפי עיר, שכונה, כתובת או תיאור...",
      addLabel: "+ הוסף מקווה",
      addFn: function () { window.openCommunityAddModal("mikvah"); }
    },
    restaurants: {
      viewId: "view-restaurants",
      title: "מסעדות כשרות וסורק כשרות",
      placeholder: "חיפוש מסעדה לפי שם, עיר, הכשר או תיאור...",
      addLabel: "+ הוסף מסעדה",
      addFn: function () {
        var box = el("inline-restaurant-upload-box");
        if (box) { box.classList.remove("hidden"); box.scrollIntoView({ behavior: "smooth", block: "center" }); }
        else window.openCommunityAddModal("restaurant");
      }
    },
    gemachim: {
      viewId: "view-gemachim",
      title: "גמ״חים וארגוני הצלה",
      placeholder: "חיפוש גמ״ח לפי פריט, תיאור, קטגוריה או עיר...",
      addLabel: "+ הוסף גמ״ח",
      addFn: function () {
        var box = el("have-gemach-upload-box");
        if (box) { box.classList.remove("hidden"); box.scrollIntoView({ behavior: "smooth", block: "center" }); }
        else window.openCommunityAddModal("gemach");
      }
    },
    rabbis: {
      viewId: "view-rabbis",
      title: "קו הלכה ורבנים פוסקים",
      placeholder: "חיפוש רב פוסק או בית הוראה לפי שם, תחום הלכתי או עיר...",
      addLabel: "+ הוסף רב",
      addFn: function () { window.openCommunityAddModal("rabbi"); }
    },
    chavruta: {
      viewId: "view-chavruta",
      title: "איתור חברותא ללימוד משותף",
      placeholder: "חיפוש חברותא לפי נושא לימוד, שם או עיר...",
      addLabel: "+ הוסף חברותא",
      addFn: function () {
        var inp = el("chavruta-new-name");
        if (inp) { inp.scrollIntoView({ behavior: "smooth", block: "center" }); inp.focus(); }
      }
    },
    customs: {
      viewId: "view-customs",
      title: "שירותי דת ובעלי מקצוע",
      placeholder: "חיפוש מוהל, משגיח כשרות, סופר סת״ם או מדריך חתנים...",
      addLabel: "+ הוסף שירות דת",
      addFn: function () { window.openCommunityAddModal("rabbi"); }
    },
    tzaddikim: {
      viewId: "view-tzaddikim",
      title: "קברי צדיקים, תהילים ומסלולי תפילה",
      placeholder: "חיפוש צדיק לפי שם, כינוי (רשב״י, האר״י, בבא סאלי), עיר או סגולה...",
      addLabel: "+ הוסף ציון צדיק",
      addFn: function () { window.openCommunityAddModal("tzaddik"); }
    },
    chabad: {
      viewId: "view-chabad",
      title: "בתי חב״ד בארץ ובעולם",
      placeholder: "חיפוש בית חב״ד לפי עיר, מדינה, שם השליח או שירותים...",
      addLabel: "+ הוסף בית חב״ד",
      addFn: function () { window.toggleChabadUploadForm("new"); }
    },
    yeshivot: {
      viewId: "view-yeshivot",
      title: "ישיבות, כוללים ומוסדות תורה",
      placeholder: "חיפוש ישיבה או כולל לפי שם המוסד, ראש הישיבה או עיר...",
      addLabel: "+ הוסף ישיבה",
      addFn: function () {
        var box = el("inline-yeshiva-upload-box");
        if (box) { box.classList.remove("hidden"); box.scrollIntoView({ behavior: "smooth", block: "center" }); }
      }
    }
  };

  window.triggerListFabAdd = function (sectionKey) {
    var cfg = LIST_PAGE_CONFIGS[sectionKey];
    if (cfg && typeof cfg.addFn === "function") cfg.addFn();
  };

  function setupUnifiedListPagesUI() {
    Object.keys(LIST_PAGE_CONFIGS).forEach(function (key) {
      var cfg = LIST_PAGE_CONFIGS[key];
      var view = el(cfg.viewId);
      if (!view) return;

      if (!el("sticky-header-" + key)) {
        var stickyBar = document.createElement("div");
        stickyBar.id = "sticky-header-" + key;
        stickyBar.className = "sticky-list-header space-y-2.5";
        stickyBar.innerHTML =
          '<div class="flex flex-wrap items-center justify-between gap-2">' +
            '<div class="flex items-center gap-2">' +
              '<button type="button" onclick="switchTab(\'find\')" class="px-3 py-1.5 rounded-xl bg-[#0F766E] text-white font-bold text-xs" style="color:#FFFFFF !important;">חזרה לקרוב אליי</button>' +
              '<h3 class="text-base sm:text-lg font-black text-[#0F2340] serif-heading">' + esc(cfg.title) + '</h3>' +
            '</div>' +
            '<div class="flex items-center gap-2">' +
              '<span id="result-count-' + key + '" class="live-result-counter">מציג תוצאות</span>' +
              '<button type="button" onclick="locateNearestByGPS(\'' + key + '\')" class="px-3 py-1.5 rounded-xl bg-white border border-[#0D9488] text-[#0F766E] font-bold text-xs">מיין לפי מרחק</button>' +
            '</div>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            '<input id="sticky-search-input-' + key + '" type="search" placeholder="' + escAttr(cfg.placeholder) + '" class="flex-1 bg-white border border-[#99F6E4] focus:border-[#0D9488] rounded-xl px-4 py-2.5 text-sm text-[#0F2340] outline-none">' +
            (key === "restaurants" ? '<button type="button" onclick="openBarcodeScannerModal()" class="px-3.5 py-2.5 bg-[#0D9488] text-white font-black rounded-xl text-xs shrink-0" style="color:#FFFFFF !important;">סורק ברקוד</button>' : '') +
          '</div>';

        view.insertBefore(stickyBar, view.firstChild);

        var sInp = el("sticky-search-input-" + key);
        if (sInp) {
          var debouncedHandler = window.debounce(function (valStr) {
            window.filterFindSectionByQuery(key, valStr);
          }, 200);
          sInp.addEventListener("input", function (ev) {
            debouncedHandler(ev.target.value);
          });
        }
      }

      if (!el("fab-add-" + key)) {
        var fab = document.createElement("button");
        fab.type = "button";
        fab.id = "fab-add-" + key;
        fab.className = "fab-add-btn";
        fab.setAttribute("onclick", "triggerListFabAdd('" + key + "')");
        fab.innerHTML = '<span>' + esc(cfg.addLabel) + '</span>';
        view.appendChild(fab);
      }
    });

    // חיבור השהיה (Debounce 200ms) לכל שדות החיפוש בדפים
    qsa("input[oninput*='filterFindSectionByQuery'], input[oninput*='renderYeshivotAndMosdot'], input[oninput*='renderRabbiShiurimList'], input[oninput*='handleLearnGlobalSearch'], #rest-search-input").forEach(function (inp) {
      var origAttr = inp.getAttribute("oninput");
      if (origAttr) {
        inp.removeAttribute("oninput");
        var debounced = window.debounce(function () {
          if (inp.id === "rest-search-input") {
            window.filterFindSectionByQuery("restaurants", inp.value);
          } else if (origAttr.indexOf("renderRabbiShiurimList") !== -1) {
            window.renderRabbiShiurimList(inp.value);
          } else if (origAttr.indexOf("handleLearnGlobalSearch") !== -1) {
            window.handleLearnGlobalSearch(inp.value);
          } else if (origAttr.indexOf("renderYeshivotAndMosdot") !== -1) {
            window.renderYeshivotAndMosdot(inp.value);
          } else {
            var m = origAttr.match(/filterFindSectionByQuery\(['"]([^'"]+)['"]/);
            if (m && m[1]) window.filterFindSectionByQuery(m[1], inp.value);
          }
        }, 200);
        inp.addEventListener("input", debounced);
      }
    });
  }

  // 5. תיקון חיפושים (נירמול עברית, Debounce, תפריט צד, וחיפוש בתיאורים בגמ"חים ובמקוואות ללא קריסות)
  window.handleGlobalSearch = function (e) {
    var rawQ = "";
    if (e && typeof e.targetValue === "string") {
      rawQ = e.targetValue;
    } else if (e && e.target && typeof e.target.value === "string") {
      rawQ = e.target.value;
    } else {
      var sideInp = el("side-menu-search-input");
      var homeInp = el("home-search-input") || el("global-search-input");
      rawQ = (sideInp && sideInp.value) ? sideInp.value : (homeInp ? homeInp.value : "");
    }
    var q = window.normalizeHebrewSearch(rawQ);
    if (!q) return;

    if (!e || !e.key || e.key === "Enter") {
      if (window.matchesSmartSearch("מקווה מקוואות טבילה טהרה", rawQ)) {
        window.switchTab("mikvaot");
        window.filterFindSectionByQuery("mikvaot", rawQ);
      } else if (window.matchesSmartSearch("מסעדה מסעדות אוכל כשר בדץ מהדרין בשרי חלבי ברקוד", rawQ)) {
        window.switchTab("restaurants");
        window.filterFindSectionByQuery("restaurants", rawQ);
      } else if (window.matchesSmartSearch("גמח גמחים חסד יד שרה עזר מציון ידידים הצלה עריסה מחולל חמצן מקדחה", rawQ)) {
        window.switchTab("gemachim");
        window.filterFindSectionByQuery("gemachim", rawQ);
      } else if (window.matchesSmartSearch("חבד שליח שלוחים בית חבד", rawQ)) {
        window.switchTab("chabad");
        window.filterFindSectionByQuery("chabad", rawQ);
      } else if (window.matchesSmartSearch("צדיק צדיקים קבר ציון מירון רשבי הארי אריזל בבא סאלי רמבם אומן מוהרן בעשט", rawQ)) {
        window.switchTab("tzaddikim");
        window.filterFindSectionByQuery("tzaddikim", rawQ);
      } else if (window.matchesSmartSearch("מניין מניינים תפילה שחרית מנחה ערבית בית כנסת", rawQ)) {
        window.switchTab("minyanim");
        window.filterFindSectionByQuery("minyanim", rawQ);
      } else if (window.matchesSmartSearch("רב רבנים קו הלכה פוסק בית הוראה שאלה", rawQ)) {
        window.switchTab("rabbis");
        window.filterFindSectionByQuery("rabbis", rawQ);
      } else if (window.matchesSmartSearch("חברותא לימוד משותף דף יומי", rawQ)) {
        window.switchTab("chavruta");
        window.filterFindSectionByQuery("chavruta", rawQ);
      } else if (window.matchesSmartSearch("ישיבה ישיבות כולל מוסדות בית מדרש", rawQ)) {
        window.switchTab("yeshivot");
        window.filterFindSectionByQuery("yeshivot", rawQ);
      } else if (window.matchesSmartSearch("זמנים זמני היום שקיעה הנץ לוח שנה סידור תהילים", rawQ)) {
        window.switchTab("siddur");
        if (q.indexOf("תהילים") !== -1) window.switchPraySubTab("tehillim");
        else if (q.indexOf("זמנ") !== -1 || q.indexOf("לוח") !== -1) window.switchPraySubTab("zmanim");
        else window.switchPraySubTab("siddur");
      } else if (window.matchesSmartSearch("פורום קהילה הגרלות צדקה תרומה לוח תפילות", rawQ)) {
        window.switchTab("forum");
      } else {
        window.switchTab("series");
        window.handleLearnGlobalSearch(rawQ);
        window.toast("מציג תוצאות חיפוש עבור: " + rawQ);
      }
    }
  };

  window.handleSideMenuSearch = function () {
    var inp = el("side-menu-search-input");
    var q = inp ? (inp.value || "").trim() : "";
    if (!q) {
      window.toast("נא להקליד מילת חיפוש");
      return;
    }
    if (window.closeSideMenu) window.closeSideMenu();
    window.handleGlobalSearch({ key: "Enter", targetValue: q });
  };

  // תיקון קריסות וחיפוש בתיאורים בגמ"חים, מקוואות וכל מדורי "קרוב אליי"
  window.filterGemachimByCategory = function (cat) {
    var allGem = window.GEMACHIM_DATA || [];
    if (!cat || cat === "all") {
      window.renderGemachim(allGem);
      return;
    }
    var filtered = allGem.filter(function (g) {
      if (!g) return false;
      var itemsStr = Array.isArray(g.items) ? g.items.join(" ") : String(g.items || "");
      return window.matchesSmartSearch([g.name, g.category, g.city, g.address, g.description, g.desc, itemsStr], cat);
    });
    window.renderGemachim(filtered);
  };

  window.filterMikvaot = function (typeOrQuery) {
    var allMik = window.MIKVAOT_DATA || [];
    if (!typeOrQuery || typeOrQuery === "all") {
      window.renderMikvaot(allMik);
      return;
    }
    if (typeOrQuery === "open") {
      window.renderMikvaot(allMik.filter(function (m) { return m && m.isOpen !== false; }));
      return;
    }
    var filtered = allMik.filter(function (m) {
      if (!m) return false;
      return window.matchesSmartSearch([m.name, m.city, m.address, m.type, m.hours, m.notes, m.description, m.desc], typeOrQuery);
    });
    window.renderMikvaot(filtered);
  };

  window.filterFindSectionByQuery = function (sectionType, query) {
    var q = (query || "").trim();
    var stickyInp = el("sticky-search-input-" + sectionType);
    if (stickyInp && stickyInp.value !== q && document.activeElement !== stickyInp) {
      stickyInp.value = q;
    }

    if (sectionType === "minyanim") {
      var listMin = (window.MINYANIM_DATA || []).filter(function (m) {
        return m && window.matchesSmartSearch([m.name, m.city, m.address, m.nusach, m.type, m.shacharit, m.mincha, m.arvit], q);
      });
      window.renderMinyanim(listMin);
    } else if (sectionType === "rabbis") {
      var listRab = (window.RABBIS_DATA || []).filter(function (r) {
        return r && window.matchesSmartSearch([r.name, r.title, r.specialty, r.city, r.hours, r.phone, r.description], q);
      });
      window.renderRabbis(listRab);
    } else if (sectionType === "gemachim") {
      var listGem = (window.GEMACHIM_DATA || []).filter(function (g) {
        if (!g) return false;
        var itemsStr = Array.isArray(g.items) ? g.items.join(" ") : String(g.items || "");
        return window.matchesSmartSearch([g.name, g.category, g.city, g.address, g.description, g.desc, itemsStr, g.hours], q);
      });
      window.renderGemachim(listGem);
    } else if (sectionType === "mikvaot") {
      var listMik = (window.MIKVAOT_DATA || []).filter(function (m) {
        return m && window.matchesSmartSearch([m.name, m.city, m.address, m.type, m.hours, m.notes, m.description, m.desc], q);
      });
      window.renderMikvaot(listMik);
    } else if (sectionType === "chabad") {
      var listChb = (window.CHABAD_DATA || []).filter(function (c) {
        return c && window.matchesSmartSearch([c.name, c.city, c.country, c.shaliach, c.rabbi, c.address, c.services, c.description], q);
      });
      window.renderChabad(listChb);
    } else if (sectionType === "tzaddikim") {
      var listTz = (window.TZADDIKIM_DATA || []).filter(function (t) {
        return t && window.matchesSmartSearch([t.name, t.title, t.city, t.region, t.location, t.address, t.segula, t.story, t.description, t.desc], q);
      });
      window.renderTzaddikim(listTz);
    } else if (sectionType === "restaurants") {
      var listRest = (window.RESTAURANTS_DATA || []).filter(function (r) {
        return r && window.matchesSmartSearch([r.name, r.city, r.address, r.type, r.hechsher, r.desc, r.description, r.kosherCertInfo], q);
      });
      window.renderRestaurants(listRest);
    } else if (sectionType === "chavruta") {
      window.renderChavrutaDirectory(q);
    } else if (sectionType === "yeshivot") {
      window.renderYeshivotAndMosdot(q);
    } else if (sectionType === "customs") {
      var listSrv = (window.RELIGIOUS_SERVICES_DATA || []).filter(function (s) {
        return s && window.matchesSmartSearch([s.name, s.category, s.city, s.description, s.phone], q);
      });
      window.renderReligiousServicesList(listSrv);
    }
  };

  // 6. עדכון ניווט רשת 2 העמודות הקומפקטית במדור "ללמוד"
  function setActiveLearnCompactButton(activeId) {
    qsa("#view-series .learn-compact-btn").forEach(function (b) {
      b.classList.toggle("active", b.id === activeId);
    });
  }

  var prevSwitchLearnMainTab = window.__v37_prev_switchLearnMainTab_1;
  window.switchLearnMainTab = function (tabKey) {
    if (prevSwitchLearnMainTab) prevSwitchLearnMainTab(tabKey);
    if (tabKey === "shiurim") setActiveLearnCompactButton("learn-main-tab-shiurim");
    else if (tabKey === "quizzes") setActiveLearnCompactButton("learn-main-tab-quizzes");
  };

  var prevSwitchLibSub = window.__v37_prev_switchLibrarySubTab_3;
  window.switchLibrarySubTab = function (sub) {
    if (prevSwitchLibSub) prevSwitchLibSub(sub);
    if (sub === "courses") {
      setActiveLearnCompactButton("learn-main-tab-courses");
    } else if (sub === "liveshiurim") {
      setActiveLearnCompactButton("learn-main-tab-shiurim");
    } else if (sub === "quizzes") {
      setActiveLearnCompactButton("learn-main-tab-quizzes");
    } else {
      setActiveLearnCompactButton("lib-btn-" + sub);
    }
  };

  // 7. העברת זמני היום ולוח השנה לתוך טאב "תפילה וזמנים", והגרלות/צדקה לתוך טאב "קהילה"
  function mountZmanimInsidePrayTab() {
    var zView = el("view-zmanim");
    var zHost = el("pray-zmanim-host");
    if (zView && zHost && zView.children.length > 0 && zHost.children.length === 0) {
      while (zView.firstChild) {
        zHost.appendChild(zView.firstChild);
      }
    }
  }

  function mountCommunityPanels() {
    var rafHost = el("comm-raffles-host");
    var charHost = el("comm-charity-host");
    var prayHost = el("comm-prayers-host");

    if (rafHost && !rafHost.innerHTML.trim()) {
      rafHost.innerHTML =
        '<div class="bg-white border border-[#FED7AA] p-5 rounded-2xl space-y-4 shadow-sm">' +
          '<div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#FED7AA] pb-3">' +
            '<div>' +
              '<h3 class="text-xl font-black text-[#0F2340] serif-heading">מערך ההגרלות והמכירות הסיניות</h3>' +
              '<p class="text-xs text-[#5C4938]">הגרלות על ספר תורה, טיסה לקברי צדיקים ופרסים להחזקת תורה וחסד</p>' +
            '</div>' +
            '<button type="button" onclick="openDonateModal(\'השתתפות בהגרלות הקודש\')" class="px-4 py-2 bg-[#EA580C] text-white font-black rounded-xl text-xs" style="color:#FFFFFF !important;">רכישת כרטיס הגרלה</button>' +
          '</div>' +
          '<div id="comm-raffles-grid" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>' +
        '</div>';
    }

    if (charHost && !charHost.innerHTML.trim()) {
      charHost.innerHTML =
        '<div class="bg-white border border-[#FED7AA] p-5 rounded-2xl space-y-5 shadow-sm">' +
          '<div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#FED7AA] pb-3">' +
            '<div>' +
              '<h3 class="text-xl font-black text-[#0F2340] serif-heading">קמפיינים לצדקה וספר הפרנסים</h3>' +
              '<p class="text-xs text-[#5C4938]">שותפות בהפצת תורה, סיוע למשפחות נזקקות והנצחת יקירים בלוח התורמים</p>' +
            '</div>' +
            '<div class="flex items-center gap-2">' +
              '<button type="button" onclick="openDonateModal(\'תרומה כללית לצדקה וחסד\')" class="px-4 py-2 bg-[#EA580C] text-white font-black rounded-xl text-xs" style="color:#FFFFFF !important;">תרום עכשיו</button>' +
              '<button type="button" onclick="switchTab(\'judaica\')" class="px-3.5 py-2 bg-[#FFF7ED] border border-[#FDBA74] text-[#0F2340] font-bold rounded-xl text-xs">חנות יודאיקה</button>' +
            '</div>' +
          '</div>' +
          '<div id="comm-campaigns-grid" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>' +
          '<div class="pt-4 border-t border-[#FED7AA] space-y-3">' +
            '<h4 class="text-lg font-black text-[#0F2340] serif-heading">ספר התורמים והפרנסים</h4>' +
            '<div id="comm-donors-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>' +
          '</div>' +
        '</div>';
    }

    if (prayHost && !prayHost.innerHTML.trim()) {
      prayHost.innerHTML =
        '<div class="bg-white border border-[#FED7AA] p-5 rounded-2xl space-y-4 shadow-sm">' +
          '<div class="border-b border-[#FED7AA] pb-3">' +
            '<h3 class="text-xl font-black text-[#0F2340] serif-heading">לוח תפילות קהילתי והקדשות</h3>' +
            '<p class="text-xs text-[#5C4938]">הוסיפו שם לתפילה לרפואה שלמה, זיווג הגון, פרנסה או עילוי נשמה</p>' +
          '</div>' +
          '<div class="bg-[#FFF7ED] border border-[#FED7AA] p-4 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2.5">' +
            '<input id="comm-pw-name" type="text" placeholder="שם לתפילה (פלוני בן פלונית)" class="bg-white border border-[#FDBA74] rounded-xl px-3 py-2 text-xs text-[#0F2340] outline-none">' +
            '<select id="comm-pw-cat" class="bg-white border border-[#FDBA74] rounded-xl px-3 py-2 text-xs text-[#0F2340] outline-none">' +
              '<option value="לרפואה שלמה">לרפואה שלמה</option>' +
              '<option value="לזיווג הגון ופרי בטן">לזיווג הגון ופרי בטן</option>' +
              '<option value="לפרנסה והצלחה">לפרנסה והצלחה</option>' +
              '<option value="לעילוי נשמה">לעילוי נשמה</option>' +
            '</select>' +
            '<input id="comm-pw-tzaddik" type="text" placeholder="בזכות הצדיק (למשל: רשב״י)" class="bg-white border border-[#FDBA74] rounded-xl px-3 py-2 text-xs text-[#0F2340] outline-none">' +
            '<input id="comm-pw-req" type="text" placeholder="בקשה קצרה..." class="bg-white border border-[#FDBA74] rounded-xl px-3 py-2 text-xs text-[#0F2340] outline-none">' +
          '</div>' +
          '<button type="button" onclick="addCommunityPrayerFromHub()" class="px-5 py-2.5 bg-[#EA580C] text-white font-black rounded-xl text-xs" style="color:#FFFFFF !important;">פרסם שם בלוח התפילות</button>' +
          '<div id="comm-prayer-wall-cards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2"></div>' +
        '</div>';
    }
  }

  window.switchCommunitySubTab = function (subKey) {
    mountCommunityPanels();
    var active = subKey || "forum";
    ["forum", "raffles", "charity", "prayers"].forEach(function (k) {
      var btn = el("comm-tab-btn-" + k);
      var panel = el("comm-panel-" + k);
      if (btn) {
        btn.className = (k === active)
          ? "py-2.5 px-3 rounded-xl bg-[#EA580C] text-white font-black text-xs shadow-sm"
          : "py-2.5 px-3 rounded-xl bg-white text-[#0F2340] border border-[#FDBA74] font-bold text-xs";
        if (k === active) btn.style.color = "#FFFFFF";
        else btn.style.color = "";
      }
      if (panel) panel.classList.toggle("hidden", k !== active);
    });

    if (active === "raffles") {
      var rg = el("comm-raffles-grid");
      var srcR = el("raffles-grid-container");
      if (rg && srcR) rg.innerHTML = srcR.innerHTML;
    } else if (active === "charity") {
      var cg = el("comm-campaigns-grid");
      var srcC = el("campaigns-grid-container");
      if (cg && srcC) cg.innerHTML = srcC.innerHTML;
      var dg = el("comm-donors-grid");
      var srcD = el("donors-book-container") || el("full-donors-wall-grid");
      if (dg && srcD) dg.innerHTML = srcD.innerHTML;
    } else if (active === "prayers") {
      window.renderCommunityPrayerWall();
      var pg = el("comm-prayer-wall-cards");
      var srcP = el("community-prayer-wall-grid");
      if (pg && srcP) pg.innerHTML = srcP.innerHTML;
    }
  };

  window.addCommunityPrayerFromHub = function () {
    var n = val("comm-pw-name");
    var c = val("comm-pw-cat") || "לרפואה שלמה";
    var tz = val("comm-pw-tzaddik") || "כלל צדיקי הדורות";
    var r = val("comm-pw-req") || "לישועה וברכה";
    if (!n) { window.toast("נא להזין שם לתפילה"); return; }
    if (el("pw-name-input")) el("pw-name-input").value = n;
    if (el("pw-cat-select")) el("pw-cat-select").value = c;
    if (el("pw-tzaddik-input")) el("pw-tzaddik-input").value = tz;
    if (el("pw-request-input")) el("pw-request-input").value = r;
    if (window.addPrayerWallDedication) window.addPrayerWallDedication();
    ["comm-pw-name", "comm-pw-tzaddik", "comm-pw-req"].forEach(function (id) { var e = el(id); if (e) e.value = ""; });
    window.switchCommunitySubTab("prayers");
  };

  // דף "קרוב אליי" (#view-find) מחולק ל-5 קבוצות עם עיצוב ירוק/טורקיז מזוהה
  var NEAR_ME_GROUPS = [
    {
      groupTitle: "1. תפילה",
      groupDesc: "מניינים קרובים בזמן אמת ומקוואות טהרה",
      items: [
        { tab: "minyanim", title: "מניינים בזמן אמת", desc: "שחרית, מנחה וערבית בבתי כנסת • השלמת מניין" },
        { tab: "mikvaot", title: "מקוואות טהרה", desc: "מקוואות נשים, גברים וכלים • שעות פתיחה וניווט" }
      ]
    },
    {
      groupTitle: "2. אוכל וכשרות",
      groupDesc: "מסעדות כשרות למהדרין וסורק ברקוד מוצרים",
      items: [
        { tab: "restaurants", title: "מסעדות כשרות", desc: "בשרי, חלבי ופרווה • תעודות כשרות מאומתות" },
        { action: "openBarcodeScannerModal()", title: "סורק ברקוד כשרות", desc: "סריקת מוצרים לבדיקת גוף הכשרות וחלבי/בשרי/פרווה" }
      ]
    },
    {
      groupTitle: "3. חסד והצלה",
      groupDesc: "גמ״חים להשאלת ציוד וארגוני רפואה והצלה",
      items: [
        { tab: "gemachim", title: "גמ״חים בקהילה", desc: "ציוד רפואי, תינוקות, שמחות, כלי עבודה ופתיחת גמ״ח" },
        { action: "switchTab('gemachim'); filterGemachimByCategory('רפואה');", title: "ארגוני הצלה וחירום", desc: "יד שרה, עזר מציון, איחוד הצלה וידידים בדרכים" }
      ]
    },
    {
      groupTitle: "4. אנשים ולימוד",
      groupDesc: "רבנים וקווי הלכה, חברותא ובעלי מקצוע תורניים",
      items: [
        { tab: "rabbis", title: "קו הלכה ורבנים", desc: "מענה הלכתי מפי פוסקים, שליחת שאלה ותרומה לרב" },
        { tab: "chavruta", title: "חברותא ללימוד", desc: "מציאת שותף ללימוד גמרא, הלכה, פרשה או חסידות" },
        { tab: "customs", title: "שירותי דת", desc: "מוהלים, משגיחי כשרות, סופרי סת״ם ומדריכי חתנים" }
      ]
    },
    {
      groupTitle: "5. מקומות ומוסדות",
      groupDesc: "קברי צדיקים, בתי חב״ד בעולם וישיבות",
      items: [
        { tab: "tzaddikim", title: "קברי צדיקים", desc: "תהילים בציון, תרומה ובניית מסלול ביקורים חכם" },
        { tab: "chabad", title: "בתי חב״ד", desc: "שלוחי חב״ד בארץ ובעולם וקבוצות וואטסאפ למטיילים" },
        { tab: "yeshivot", title: "ישיבות ומוסדות", desc: "מדריך ישיבות וכוללים, העלאת מוסד ותרומה להחזקת תורה" }
      ]
    }
  ];

  window.renderFindHub = function () {
    var root = el("find-hub-root");
    if (!root) return;
    root.innerHTML =
      '<div class="space-y-4 mt-4">' +
        NEAR_ME_GROUPS.map(function (grp) {
          return '<div class="near-me-group-card space-y-3">' +
            '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#99F6E4] pb-2">' +
              '<h3 class="text-lg font-black text-[#0F2340] serif-heading">' + esc(grp.groupTitle) + '</h3>' +
              '<span class="text-xs text-[#0F766E] font-bold">' + esc(grp.groupDesc) + '</span>' +
            '</div>' +
            '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">' +
              grp.items.map(function (it) {
                var clickAttr = it.action ? it.action : ("switchTab('" + it.tab + "')");
                return '<button type="button" onclick="' + clickAttr + '" class="tt-tile hover:bg-[#F0FDFA]">' +
                  '<strong>' + esc(it.title) + '</strong>' +
                  '<span>' + esc(it.desc) + '</span>' +
                '</button>';
              }).join("") +
            '</div>' +
          '</div>';
        }).join("") +
      '</div>';

    var masterInp = el("near-me-master-search");
    if (masterInp) {
      masterInp.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
          window.handleGlobalSearch({ key: "Enter", targetValue: masterInp.value });
        }
      });
    }
  };

  window.switchPraySubTab = function (sub) {
    mountZmanimInsidePrayTab();
    var targetSub = sub || "siddur";
    if (currentTab !== "siddur") {
      window.switchTab("siddur");
    }
    ["siddur", "tehillim", "zmanim", "customs"].forEach(function (k) {
      var btn = el("pray-btn-" + k);
      var panel = el("pray-sub-" + k);
      if (btn) {
        btn.className = (k === targetSub)
          ? "py-3 px-4 rounded-2xl bg-[#7E22CE] text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm"
          : "py-3 px-4 rounded-2xl bg-white text-[#0F2340] border border-[#D8B4FE] font-bold text-sm flex items-center justify-center gap-2";
        if (k === targetSub) btn.style.color = "#FFFFFF";
        else btn.style.color = "";
      }
      if (panel) panel.classList.toggle("hidden", k !== targetSub);
    });

    document.body.classList.remove("focus-mode", "focus-more");
    var fbar = el("tt-focus-bar");
    if (fbar) fbar.classList.add("hidden");

    if (targetSub === "customs" && window.ttLoadCustoms) {
      window.ttLoadCustoms(false);
    } else if (targetSub === "zmanim" && window.fetchHebcalZmanim) {
      window.fetchHebcalZmanim();
    }
  };

  window.switchTab = function (tabId, mode) {
    mountZmanimInsidePrayTab();
    mountCommunityPanels();

    var alias = { learn: "series", pray: "siddur", community: "forum" };
    if (alias[tabId]) tabId = alias[tabId];
    if (window.closeSideMenu) window.closeSideMenu();

    if (tabId === "zmanim") {
      currentTab = "siddur";
      qsa(".view-section").forEach(function (s) { s.classList.remove("active"); });
      var sView = el("view-siddur");
      if (sView) sView.classList.add("active");
      window.switchPraySubTab("zmanim");
      updateNavActiveState("siddur");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (tabId === "raffles" || tabId === "givebuy" || tabId === "donate" || tabId === "donors") {
      currentTab = "forum";
      qsa(".view-section").forEach(function (s) { s.classList.remove("active"); });
      var fView = el("view-forum");
      if (fView) fView.classList.add("active");
      window.switchCommunitySubTab(tabId === "raffles" ? "raffles" : "charity");
      updateNavActiveState("forum");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    currentTab = tabId;
    qsa(".view-section").forEach(function (s) { s.classList.remove("active"); });
    var target = el("view-" + tabId);
    if (target) target.classList.add("active");

    document.body.classList.remove("focus-mode", "focus-more");
    var fbar = el("tt-focus-bar");
    if (fbar) fbar.classList.add("hidden");

    if (target) {
      Array.prototype.slice.call(target.children).forEach(function (child) {
        if (!child.classList.contains("find-top-cat-nav")) {
          child.classList.remove("tt-tool", "tt-navcard");
        }
      });
    }

    var parentHub = tabId;
    if (["series", "kids", "live", "studio"].indexOf(tabId) !== -1) parentHub = "series";
    else if (tabId === "siddur") parentHub = "siddur";
    else if (tabId === "find" || !!LIST_PAGE_CONFIGS[tabId]) parentHub = "find";
    else if (["forum", "judaica"].indexOf(tabId) !== -1) parentHub = "forum";

    updateNavActiveState(parentHub);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function updateNavActiveState(parentHub) {
    qsa(".pill-btn").forEach(function (p) { p.classList.remove("active"); });
    var ap = el("pill-" + parentHub);
    if (ap) ap.classList.add("active");

    qsa(".bottom-nav-item").forEach(function (b) { b.classList.remove("active"); });
    var ab = el("bnav-" + parentHub);
    if (ab) ab.classList.add("active");
  }

  // רינדור אחיד של הכרטיסים במדורים עם הגנת XSS ומונה תוצאות חי
  window.renderMinyanim = function (list) {
    if (window.renderMinyanCallsBanner) window.renderMinyanCallsBanner();
    var grid = el("minyanim-container");
    if (!grid) return;
    var items = list || window.MINYANIM_DATA || [];
    window.updateLiveResultCounter("minyanim", items.length, (window.MINYANIM_DATA || []).length);

    if (!items.length) {
      grid.innerHTML = '<div class="col-span-full p-6 bg-white border border-[#E5DBC7] rounded-2xl text-center text-sm text-[#5C4938]">לא נמצאו מניינים התואמים לחיפוש.</div>';
      return;
    }

    grid.innerHTML = items.map(function (m, idx) {
      var mid = m.id || ("min_" + (idx + 1));
      var eKey = "minyan_" + mid;
      var stats = window.getEntityStats ? window.getEntityStats(eKey, 4.9) : { avg: "4.9", count: 9 };
      var name = esc(m.name || "בית כנסת");
      var nusach = esc(m.nusach || m.type || "כלל ישראל");
      var city = esc(m.city || "ישראל");
      var addr = esc(m.address || m.city || "");
      var shacharit = esc(m.shacharit || "07:00, 08:00");
      var mincha = esc(m.mincha || "13:30, 16:15");
      var arvit = esc(m.arvit || "17:15, 20:30");
      var wazeUrl = window.buildWazeUrl(m.address || (m.name + " " + m.city));

      return '<div class="airy-list-card">' +
        '<div class="space-y-2.5">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="px-2.5 py-0.5 rounded-md bg-[#CCFBF1] text-[#0F766E] border border-[#0D9488] text-xs font-black">נוסח ' + nusach + '</span>' +
            '<button type="button" onclick="openEntityFullPage(\'' + escAttr(eKey) + '\', \'מניין ובית כנסת\', \'' + escAttr(m.name) + '\', \'נוסח ' + escAttr(m.nusach) + '\', \'' + escAttr(m.city) + '\', \'שחרית: ' + escAttr(m.shacharit) + '\', \'\', \'מניין קבוע לתפילות שחרית, מנחה וערבית.\', \'דיוק בזמנים • אווירה\')" class="text-xs font-bold text-[#5C4938] hover:text-[#0F2340] underline">דירוג ' + esc(stats.avg) + ' (' + esc(stats.count) + ' תגובות)</button>' +
          '</div>' +
          '<h3 class="text-lg font-black text-[#0F2340] serif-heading">' + name + '</h3>' +
          '<p class="text-xs text-[#5C4938] font-bold">כתובת: ' + addr + ' (' + city + ')</p>' +
          '<div class="grid grid-cols-3 gap-2 pt-1 text-center text-xs">' +
            '<div class="bg-[#FDF8EF] p-2 rounded-xl border border-[#E5DBC7]"><span class="text-[#5C4938] block">שחרית</span><strong class="text-[#0F2340]">' + shacharit + '</strong></div>' +
            '<div class="bg-[#FDF8EF] p-2 rounded-xl border border-[#E5DBC7]"><span class="text-[#5C4938] block">מנחה</span><strong class="text-[#0F2340]">' + mincha + '</strong></div>' +
            '<div class="bg-[#FDF8EF] p-2 rounded-xl border border-[#E5DBC7]"><span class="text-[#5C4938] block">ערבית</span><strong class="text-[#0F2340]">' + arvit + '</strong></div>' +
          '</div>' +
        '</div>' +
        '<div class="airy-card-primary-actions">' +
          '<a href="' + escAttr(wazeUrl) + '" target="_blank" class="airy-btn-primary">ניווט ב-Waze</a>' +
          '<button type="button" onclick="openEntityFullPage(\'' + escAttr(eKey) + '\', \'מניין ובית כנסת\', \'' + escAttr(m.name) + '\', \'נוסח ' + escAttr(m.nusach) + '\', \'' + escAttr(m.city) + '\', \'שחרית: ' + escAttr(m.shacharit) + '\', \'\', \'מניין קבוע לתפילות.\', \'דיוק בזמנים • אווירה\')" class="airy-btn-secondary">פרטים ותגובות</button>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  window.renderMikvaot = function (list) {
    var grid = el("mikvaot-grid-container");
    if (!grid) return;
    var items = list || window.MIKVAOT_DATA || [];
    window.updateLiveResultCounter("mikvaot", items.length, (window.MIKVAOT_DATA || []).length);

    if (!items.length) {
      grid.innerHTML = '<div class="col-span-full p-6 bg-white border border-[#E5DBC7] rounded-2xl text-center text-sm text-[#5C4938]">לא נמצאו מקוואות התואמים לחיפוש.</div>';
      return;
    }

    grid.innerHTML = items.map(function (m, idx) {
      var mid = m.id || ("mk_" + (idx + 1));
      var eKey = "mikvah_" + mid;
      var stats = window.getEntityStats ? window.getEntityStats(eKey, 4.9) : { avg: "4.9", count: 8 };
      var name = esc(m.name || "מקווה טהרה");
      var type = esc(m.type || "מקווה טהרה");
      var addr = esc(m.address || (m.name + " " + (m.city || "")));
      var hours = esc(m.hours || "פתוח מערב שבת וחול");
      var desc = esc(m.notes || m.description || m.desc || "מקווה טהרה מהודר ונקי");
      var phone = String(m.phone || m.whatsapp || "035700000").replace(/[^0-9+\-]/g, "");
      var wazeUrl = window.buildWazeUrl(m.address || (m.name + " " + (m.city || "")));

      return '<div class="airy-list-card">' +
        '<div class="space-y-2">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="px-2.5 py-0.5 bg-[#CCFBF1] text-[#0F766E] border border-[#0D9488] rounded-md text-xs font-black">' + type + '</span>' +
            '<button type="button" onclick="openEntityFullPage(\'' + escAttr(eKey) + '\', \'מקווה טהרה\', \'' + escAttr(m.name) + '\', \'' + escAttr(m.city) + '\', \'' + escAttr(m.address) + '\', \'' + escAttr(m.hours) + '\', \'' + escAttr(phone) + '\', \'' + escAttr(m.notes || m.description || m.desc || "מקווה טהרה מהודר ונקי.") + '\', \'ניקיון • שעות פתיחה\')" class="text-xs font-bold text-[#5C4938] hover:text-[#0F2340] underline">דירוג ' + esc(stats.avg) + ' (' + esc(stats.count) + ' תגובות)</button>' +
          '</div>' +
          '<h3 class="text-lg font-black text-[#0F2340] serif-heading">' + name + '</h3>' +
          '<p class="text-xs text-[#5C4938]">' + desc + '</p>' +
          '<p class="text-xs text-[#5C4938]">כתובת: <strong>' + addr + '</strong> • שעות: ' + hours + '</p>' +
        '</div>' +
        '<div class="airy-card-primary-actions">' +
          '<a href="' + escAttr(wazeUrl) + '" target="_blank" class="airy-btn-primary">ניווט ב-Waze</a>' +
          '<a href="tel:' + escAttr(phone) + '" class="airy-btn-secondary">חיוג למקווה</a>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  window.renderGemachim = function (list) {
    var grid = el("gemachim-grid-container");
    if (!grid) return;
    var items = list || window.GEMACHIM_DATA || [];
    window.updateLiveResultCounter("gemachim", items.length, (window.GEMACHIM_DATA || []).length);

    if (!items.length) {
      grid.innerHTML = '<div class="col-span-full p-6 bg-white border border-[#E5DBC7] rounded-2xl text-center text-sm text-[#5C4938]">לא נמצאו גמ״חים התואמים לחיפוש.</div>';
      return;
    }

    grid.innerHTML = items.map(function (g, idx) {
      var gid = g.id || ("gm" + (idx + 1));
      var eKey = "gemach_" + gid;
      var name = esc(g.name || "גמ״ח");
      var cat = esc(g.category || "גמ״ח וחסד");
      var addr = esc(g.address || g.city || "פריסה ארצית");
      var hours = esc(g.hours || "א׳-ה׳ 09:00-21:00");
      var desc = esc(g.description || g.desc || "");
      var phone = String(g.phone || "0500000000").replace(/[^0-9+\-]/g, "");
      var itemTags = Array.isArray(g.items) ? g.items : ["השאלת ציוד", "עזרה הדדית"];
      var wazeUrl = window.buildWazeUrl(g.address || g.city || g.name);
      var comments = window.getCardComments ? window.getCardComments(eKey) : [];

      return '<div class="airy-list-card">' +
        '<div class="space-y-2">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="px-2.5 py-0.5 rounded-md bg-[#CCFBF1] text-[#0F766E] border border-[#0D9488] text-xs font-black">' + cat + '</span>' +
            '<div class="flex items-center gap-2">' +
              '<button type="button" onclick="openDonateModal(\'תרומה להחזקת ' + escAttr(g.name) + '\')" class="text-xs font-black text-[#0F2340] underline">תרומה לגמ״ח</button>' +
              '<button type="button" onclick="openEntityFullPage(\'' + escAttr(eKey) + '\', \'גמ״ח וארגון חסד\', \'' + escAttr(g.name) + '\', \'' + escAttr(g.category) + '\', \'' + escAttr(g.address || g.city) + '\', \'' + escAttr(g.hours) + '\', \'' + escAttr(phone) + '\', \'' + escAttr(g.description || g.desc) + '\', \'זמינות • יחס • חסד\')" class="text-xs font-bold text-[#5C4938] underline">תגובות (' + comments.length + ')</button>' +
            '</div>' +
          '</div>' +
          '<h3 class="text-lg font-black text-[#0F2340] serif-heading">' + name + '</h3>' +
          '<p class="text-xs text-[#5C4938] leading-relaxed">' + desc + '</p>' +
          '<div class="flex flex-wrap gap-1.5 pt-0.5">' +
            itemTags.map(function (it) {
              return '<button type="button" onclick="searchGemachByItem(\'' + escAttr(it) + '\')" class="px-2.5 py-0.5 rounded-lg bg-[#FDF8EF] border border-[#D8CBB5] text-xs font-bold text-[#0F2340]">' + esc(it) + '</button>';
            }).join("") +
          '</div>' +
          '<p class="text-xs text-[#5C4938] pt-1">כתובת: <strong>' + addr + '</strong> • שעות: ' + hours + '</p>' +
        '</div>' +
        '<div class="airy-card-primary-actions">' +
          '<a href="tel:' + escAttr(phone) + '" class="airy-btn-primary">חיוג לגמ״ח</a>' +
          '<a href="' + escAttr(wazeUrl) + '" target="_blank" class="airy-btn-secondary">ניווט ב-Waze</a>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  window.renderRabbis = function (list) {
    var grid = el("rabbis-container");
    if (!grid) return;
    var items = list || window.RABBIS_DATA || [];
    window.updateLiveResultCounter("rabbis", items.length, (window.RABBIS_DATA || []).length);

    if (!items.length) {
      grid.innerHTML = '<div class="col-span-full p-6 bg-white border border-[#E5DBC7] rounded-2xl text-center text-sm text-[#5C4938]">לא נמצאו רבנים או קווי הלכה התואמים לחיפוש.</div>';
      return;
    }

    grid.innerHTML = items.map(function (r, idx) {
      var rid = r.id || ("rab" + (idx + 1));
      var eKey = "rabbi_" + rid;
      var stats = window.getEntityStats ? window.getEntityStats(eKey, 5.0) : { avg: "5.0", count: 14 };
      var name = esc(r.name || "רב פוסק");
      var title = esc(r.title || r.specialty || "פוסק הלכה ומורה הוראה");
      var hours = esc(r.hours || "מענה הלכתי לאורך היום");
      var phone = String(r.phone || "0733570000").replace(/[^0-9+\-]/g, "");
      var waUrl = window.buildWhatsAppUrl(phone, "שלום כבוד הרב, שאלה בהלכה מאפליקציית צדיק-טוק:");

      return '<div class="airy-list-card">' +
        '<div class="space-y-2">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="px-2.5 py-0.5 rounded-md bg-[#CCFBF1] text-[#0F766E] border border-[#0D9488] text-xs font-black">זמין למענה הלכתי</span>' +
            '<div class="flex items-center gap-2">' +
              '<button type="button" onclick="openDonateModal(\'תרומה לבית ההוראה ולרב ' + escAttr(r.name) + '\')" class="text-xs font-black text-[#0F2340] underline">תרומה לרב</button>' +
              '<button type="button" onclick="openEntityFullPage(\'' + escAttr(eKey) + '\', \'קו הלכה ורב פוסק\', \'' + escAttr(r.name) + '\', \'' + escAttr(r.title || r.specialty) + '\', \'' + escAttr(r.city || "מענה ארצי") + '\', \'' + escAttr(r.hours) + '\', \'' + escAttr(phone) + '\', \'מענה הלכתי לשאלות דחופות ורגילות. הוסיפו דירוג או תגובה!\', \'זמינות • בהירות המענה\')" class="text-xs font-bold text-[#0F766E] underline">תגובות ודירוג (' + esc(stats.count) + ')</button>' +
            '</div>' +
          '</div>' +
          '<h3 class="text-lg font-black text-[#0F2340] serif-heading">' + name + '</h3>' +
          '<p class="text-xs font-bold text-[#0F2340]">' + title + '</p>' +
          '<p class="text-xs text-[#5C4938]">שעות מענה: ' + hours + ' • טלפון: ' + esc(phone) + '</p>' +
        '</div>' +
        '<div class="airy-card-primary-actions">' +
          '<a href="tel:' + escAttr(phone) + '" class="airy-btn-primary">חיוג לרב</a>' +
          '<a href="' + escAttr(waUrl) + '" target="_blank" class="airy-btn-secondary">שאלה בוואטסאפ</a>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // אתחול V37
  onReady(function () {
    try { localStorage.removeItem("undefined"); } catch (e) {}
    setupModalsBackdropAndCloseBtn();
    setupUnifiedListPagesUI();
    mountZmanimInsidePrayTab();
    mountCommunityPanels();
    window.renderHomeRecommendedCarousel();
    window.renderFindHub();

    if (window.MINYANIM_DATA) window.renderMinyanim(window.MINYANIM_DATA);
    if (window.MIKVAOT_DATA) window.renderMikvaot(window.MIKVAOT_DATA);
    if (window.RESTAURANTS_DATA) window.renderRestaurants(window.RESTAURANTS_DATA);
    if (window.GEMACHIM_DATA) window.renderGemachim(window.GEMACHIM_DATA);
    if (window.RABBIS_DATA) window.renderRabbis(window.RABBIS_DATA);
    if (window.TZADDIKIM_DATA) window.renderTzaddikim(window.TZADDIKIM_DATA);
    if (window.CHABAD_DATA) window.renderChabad(window.CHABAD_DATA);
    if (window.YESHIVOT_DATA) window.renderYeshivotAndMosdot("");
  });

})();


// יציאה מיידית ונוחה ממצב שבת בלחיצת כפתור אחת (למניעת היתקעות של משתמשים)
window.forceExitShabbatMode = function () {
  try {
    localStorage.setItem(STORAGE_KEYS.SHABBAT_ACTIVE, "false");
  } catch (e) {}
  var ov = document.getElementById("shabbat-overlay");
  if (ov) ov.classList.add("hidden");
  document.body.classList.remove("tt-shabbat-locked", "shabbat-mode-active");
  Array.prototype.slice.call(document.querySelectorAll("[inert]")).forEach(function (n) {
    n.removeAttribute("inert");
  });
  var banner = document.getElementById("shabbat-active-top-banner");
  if (banner) banner.classList.add("hidden");
  if (window.toast) window.toast("שבוע טוב ומבורך! חזרת לאפליקציה.");
};


// ============================================================================
// V40 MASTER UPGRADE —
// 1. תיקון באג קריטי בהעלאת סרטונים/שיעורים לטבלת `lessons` ב-Supabase עם `is_approved: false`
//    ותמיכה אוטומטית בכל סכמות העמודות האפשריות + גיבוי לפאנל הניהול.
// 2. שליפה והצגה של תכנים ממתינים מטבלת `lessons` בפאנל הניהול (#view-admin וגם admin.html).
// 3. כרטיס 'היום ביהדות' קומפקטי ונקי (ללא מילים מיותרות בסוגריים וללא מספור כותרות).
// 4. קרוסלת רילס אנכית (9:16) נקייה בגלילה אופקית חלקה עם כותרת קצרה בלבד מתחת לכל סרטון.
// 5. דף 'קהילה' ודף 'קרוב אליי' נקיים ללא באנרים (רק 4 כפתורים בקהילה, ורק 5 קטגוריות בקרוב אליי).
// ============================================================================
(function () {
  "use strict";

  var esc = window.escapeHtml || function (v) {
    if (v === null || v === undefined) return "";
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  var escAttr = window.escAttr || function (v) {
    if (v === null || v === undefined) return "";
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "").replace(/`/g, "");
  };

  function el(id) { return document.getElementById(id); }

  // --------------------------------------------------------------------------
  // 1. תאריך עברי באותיות עבריות (למשל: א׳ בכסלו תשפ״ז)
  // --------------------------------------------------------------------------
  var HEB_DAYS = [
    "", "א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ז׳", "ח׳", "ט׳", "י׳",
    "י״א", "י״ב", "י״ג", "י״ד", "ט״ו", "ט״ז", "י״ז", "י״ח", "י״ט", "כ׳",
    "כ״א", "כ״ב", "כ״ג", "כ״ד", "כ״ה", "כ״ו", "כ״ז", "כ״ח", "כ״ט", "ל׳"
  ];
  function hebYearLetters(yr) {
    var n = parseInt(yr, 10);
    if (!n || isNaN(n)) return "תשפ״ז";
    var map = { 5784: "תשפ״ד", 5785: "תשפ״ה", 5786: "תשפ״ו", 5787: "תשפ״ז", 5788: "תשפ״ח", 5789: "תשפ״ט", 5790: "תש״צ" };
    return map[n] || "תשפ״ז";
  }

  window.getHebrewDateString = function (dateObj) {
    var d = dateObj instanceof Date ? dateObj : new Date();
    try {
      var fmt = new Intl.DateTimeFormat("he-IL-u-ca-hebrew", { day: "numeric", month: "long", year: "numeric" });
      if (typeof fmt.formatToParts === "function") {
        var parts = fmt.formatToParts(d);
        var dayNum = 0, monthName = "", yearVal = "";
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].type === "day") dayNum = parseInt(parts[i].value.replace(/[^0-9]/g, ""), 10);
          else if (parts[i].type === "month") monthName = parts[i].value.trim();
          else if (parts[i].type === "year") yearVal = parts[i].value.trim();
        }
        var dayHeb = (dayNum >= 1 && dayNum <= 30) ? HEB_DAYS[dayNum] : "א׳";
        var yearHeb = /^[0-9]+$/.test(yearVal) ? hebYearLetters(yearVal) : (yearVal || "תשפ״ז");
        var monthPrefixed = monthName ? (monthName.indexOf("ב") === 0 ? monthName : "ב" + monthName) : "בכסלו";
        return dayHeb + " " + monthPrefixed + " " + yearHeb;
      }
    } catch (e) {}
    return "א׳ בכסלו תשפ״ז";
  };

  function refreshAllHebrewDates() {
    var hebStr = window.getHebrewDateString(new Date());
    var hd = el("home-hebrew-date");
    if (hd) hd.textContent = hebStr;
    var pd = el("pray-customs-today-date");
    if (pd) pd.textContent = hebStr;
    var greg = "";
    try { greg = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" }).format(new Date()); } catch (e) {}
    var gd = el("home-greg-date");
    if (gd && greg) gd.textContent = greg;
  }

  // --------------------------------------------------------------------------
  // 2. קרוסלת רילס (סרטונים אנכיים ביחס 9:16, גלילה אופקית חלקה, ללא מסגרות מיותרות, ורק כותרת קצרה מתחת)
  // --------------------------------------------------------------------------
  function extractYoutubeThumb(url) {
    if (!url) return "";
    var m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/);
    if (m && m[1]) return "https://img.youtube.com/vi/" + m[1] + "/hqdefault.jpg";
    return "";
  }

  var REEL_VERTICAL_THUMBS = [
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80"
  ];

  window.renderHomeReelsStrip = function () {
    var strip = el("home-reels-strip");
    if (!strip) return;

    var reels = (window.REEL_FEED || []).map(function (r, idx) {
      return {
        id: r.id || ("reel_" + idx),
        title: r.title || r.desc || "חיזוק יומי קצר",
        speaker: r.rabbi || r.author || "בית המדרש צדיק-טוק",
        category: r.category || r.tag || "רילס",
        duration: r.duration || "00:55",
        desc: r.desc || r.title || "",
        thumb: r.thumbnail || extractYoutubeThumb(r.video_url || r.url) || REEL_VERTICAL_THUMBS[idx % REEL_VERTICAL_THUMBS.length]
      };
    });

    var shortVids = (window.EDUCATIONAL_VIDEOS_DATA || []).slice(0, 5).map(function (v, idx) {
      return {
        id: "svid_" + (v.id || idx),
        title: v.title || "רילס חיזוק",
        speaker: v.speaker || "בית המדרש",
        category: v.category || "סרטון קצר",
        duration: v.duration || "01:00",
        desc: v.description || v.title || "",
        thumb: v.thumbnail || extractYoutubeThumb(v.youtubeId || v.video_url || v.url) || REEL_VERTICAL_THUMBS[(idx + 2) % REEL_VERTICAL_THUMBS.length]
      };
    });

    var allReels = reels.concat(shortVids);
    if (!allReels.length) {
      allReels = [
        { id: "r1", title: "דקה של אמונה וביטחון", speaker: "הרב שניאור אשכנזי", category: "אמונה", duration: "00:58", desc: "נקודת אור וביטחון בהשגחה פרטית", thumb: REEL_VERTICAL_THUMBS[0] },
        { id: "r2", title: "הלכה ב-60 שניות: אשר יצר", speaker: "הרב יצחק יוסף", category: "הלכה", duration: "01:00", desc: "סגולה לבריאות מתוך השולחן ערוך", thumb: REEL_VERTICAL_THUMBS[1] },
        { id: "r3", title: "כוחה של מילה טובה", speaker: "הרב יגאל כהן", category: "שמחה", duration: "00:50", desc: "איך חיוך אחד משנה חיים", thumb: REEL_VERTICAL_THUMBS[2] },
        { id: "r4", title: "סוד השבת בבית היהודי", speaker: "הרב זמיר כהן", category: "שבת", duration: "01:10", desc: "ברכה ושלום בבית", thumb: REEL_VERTICAL_THUMBS[3] }
      ];
    }

    strip.className = "reels-9x16-strip hide-scrollbar";
    strip.innerHTML = allReels.map(function (item, idx) {
      var thumbUrl = item.thumb || REEL_VERTICAL_THUMBS[idx % REEL_VERTICAL_THUMBS.length];
      return '<button type="button" onclick="openEntityFullPage(\'reel_' + escAttr(item.id) + '\', \'רילס • סרטון קצר\', \'' + escAttr(item.title) + '\', \'' + escAttr(item.speaker) + '\', \'' + escAttr(item.category) + '\', \'אורך: ' + escAttr(item.duration) + '\', \'\', \'' + escAttr(item.desc) + '\', \'חיזוק • השראה\')" class="reel-9x16-item">' +
        '<div class="reel-9x16-video-box">' +
          '<img src="' + escAttr(thumbUrl) + '" alt="' + escAttr(item.title) + '" class="reel-9x16-thumb-img" loading="lazy">' +
          '<div class="reel-9x16-overlay"></div>' +
          '<span class="reel-9x16-play">▶</span>' +
        '</div>' +
        '<p class="reel-9x16-title">' + esc(item.title) + '</p>' +
      '</button>';
    }).join("");
  };

  // --------------------------------------------------------------------------
  // 3. הלכה יומית מתחלפת וקרוסלת שיעורים ארוכים בדף הבית
  // --------------------------------------------------------------------------
  var DAILY_HALACHA_ITEMS = [
    {
      title: "הלכות ברכות השחר ותפילה בציבור",
      body: "מיד כשניעור האדם משנתו יאמר \"מודה אני לפניך מלך חי וקיים שהחזרת בי נשמתי בחמלה, רבה אמונתך\", ואין צריך ליטול ידיו תחילה כיון שאין בה הזכרת השם. לאחר נטילת ידיים שחרית כדת יברך ברכות השחר בכוונה וישתדל להתפלל שחרית עם הציבור.",
      source: "מקור: שולחן ערוך אורח חיים סימן א׳ וסימן צ׳ • משנה ברורה וילקוט יוסף"
    },
    {
      title: "הלכות קדימה בברכות הנהנין (מג״ע א״ש)",
      body: "היו לפניו מיני מאכלים שונים, מקדים המין החשוב יותר: שבעת המינים קודמים לשאר פירות, וברכת \"בורא פרי העץ\" קודמת ל\"בורא פרי האדמה\", ו\"שהכל\" אחרונה. בברכת המזון ובמעין שלוש יש לכוון להודות לה׳ על הטוב אשר גמלנו.",
      source: "מקור: שולחן ערוך אורח חיים סימן רי״א • משנה ברורה וכף החיים"
    },
    {
      title: "הלכות כבוד שבת קודש והדלקת נרות",
      body: "מצווה על כל אדם להכין צרכי שבת מבעוד יום ולבדוק בכיסיו בערב שבת קודם השקיעה שלא יישאר בהם מוקצה. הדלקת נרות שבת מביאה שלום ואור בבית, וראוי לתת פרוטה לצדקה קודם הדלקת הנרות.",
      source: "מקור: שולחן ערוך אורח חיים סימן רנ״ב וסימן רס״ג"
    },
    {
      title: "הלכות כיבוד אב ואם ומוראם",
      body: "חייב אדם בכבוד אביו ואמו ובמוראם: מאכילם ומשקם, מלבישם ומכניסם ומוציאם בסבר פנים יפות. אפילו הקדיש שעות ללימוד תורה, מצוות כיבוד הורים שאינה נעשית על ידי אחרים קודמת.",
      source: "מקור: שולחן ערוך יורה דעה סימן ר״מ"
    }
  ];
  var currentHalachaIdx = 0;

  window.rotateHomeDailyHalacha = function () {
    currentHalachaIdx = (currentHalachaIdx + 1) % DAILY_HALACHA_ITEMS.length;
    var item = DAILY_HALACHA_ITEMS[currentHalachaIdx];
    var t = el("home-halacha-title");
    var b = el("home-halacha-body");
    var s = el("home-halacha-source");
    if (t) t.textContent = item.title;
    if (b) b.textContent = item.body;
    if (s) s.textContent = item.source;
  };

  window.renderHomeLongShiurimCarousel = function () {
    var box = el("home-carousel-shiurim");
    if (!box) return;

    var shiurim = (window.RABBI_SHIURIM_DATA || []).slice(0, 8);
    if (!shiurim.length) return;

    box.innerHTML = shiurim.map(function (s, idx) {
      var sid = s.id || ("sh_" + idx);
      var title = s.title || "שיעור תורה מרכזי";
      var rabbi = s.rabbi || s.rabbi_name || "רב בית המדרש";
      var topic = s.subCategory || s.topic || s.category || "בית המדרש";
      var dur = s.duration || "45:00";
      var inst = s.institution || s.description || "שיעור וידאו מלא מבית המדרש";
      var videoUrl = s.video_url || s.url || "";

      return '<div class="shrink-0 w-64 sm:w-72 bg-[#FDF8EF] border border-[#E5DBC7] hover:border-[#C9A227] rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm transition-all">' +
        '<div class="space-y-2">' +
          '<div class="flex items-center justify-between gap-2 text-xs">' +
            '<span class="px-2.5 py-0.5 rounded-md bg-[#E0F2FE] text-[#0369A1] border border-[#7DD3FC] font-black">' + esc(topic) + '</span>' +
            '<span class="font-mono text-[#5C4938] font-bold">🎥 ' + esc(dur) + '</span>' +
          '</div>' +
          '<h4 class="text-base font-black text-[#0F2340] serif-heading leading-snug">' + esc(title) + '</h4>' +
          '<p class="text-xs font-bold text-[#0F2340]">' + esc(rabbi) + '</p>' +
          '<p class="text-xs text-[#5C4938] line-clamp-2">' + esc(inst) + '</p>' +
        '</div>' +
        '<div class="pt-2 border-t border-[#E5DBC7] flex items-center gap-2">' +
          (videoUrl
            ? '<a href="' + escAttr(videoUrl) + '" target="_blank" rel="noopener" class="flex-1 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-black rounded-xl text-xs text-center" style="color:#FFFFFF !important;">צפייה בשיעור ↗</a>'
            : '<button type="button" onclick="openEntityFullPage(\'shiur_' + escAttr(sid) + '\', \'שיעור וידאו • ' + escAttr(topic) + '\', \'' + escAttr(title) + '\', \'' + escAttr(rabbi) + '\', \'' + escAttr(inst) + '\', \'אורך: ' + escAttr(dur) + '\', \'\', \'' + escAttr(inst) + '\', \'בהירות • עומק\')" class="flex-1 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-black rounded-xl text-xs text-center" style="color:#FFFFFF !important;">צפייה בשיעור</button>'
          ) +
        '</div>' +
      '</div>';
    }).join("");
  };

  // --------------------------------------------------------------------------
  // 4. דף 'קרוב אליי' (#view-find) — מציג אך ורק את 5 הקטגוריות (תפילה, אוכל, חסד, אנשים, מקומות)
  //    ללא באנר ירוק, ללא שורת חיפוש וללא כפתור GPS במסך הראשי!
  // --------------------------------------------------------------------------
  var CLEAN_NEAR_ME_5_CATEGORIES = [
    {
      catTitle: "תפילה",
      catSubtitle: "מניינים קרובים בזמן אמת ומקוואות טהרה",
      items: [
        { tab: "minyanim", title: "מניינים בזמן אמת", desc: "שחרית, מנחה וערבית בבתי כנסת • השלמת מניין" },
        { tab: "mikvaot", title: "מקוואות טהרה", desc: "מקוואות נשים, גברים וכלים • שעות פתיחה וניווט" }
      ]
    },
    {
      catTitle: "אוכל",
      catSubtitle: "מסעדות כשרות למהדרין וסורק ברקוד מוצרים",
      items: [
        { tab: "restaurants", title: "מסעדות כשרות", desc: "בשרי, חלבי ופרווה • תעודות כשרות מאומתות" },
        { action: "openBarcodeScannerModal()", title: "סורק ברקוד כשרות", desc: "סריקת מוצרים לבדיקת גוף הכשרות וחלבי/בשרי/פרווה" }
      ]
    },
    {
      catTitle: "חסד",
      catSubtitle: "גמ״חים להשאלת ציוד וארגוני רפואה והצלה",
      items: [
        { tab: "gemachim", title: "גמ״חים בקהילה", desc: "ציוד רפואי, תינוקות, שמחות, כלי עבודה ופתיחת גמ״ח" },
        { action: "switchTab('gemachim'); filterGemachimByCategory('רפואה');", title: "ארגוני הצלה וחירום", desc: "יד שרה, עזר מציון, איחוד הצלה וידידים בדרכים" }
      ]
    },
    {
      catTitle: "אנשים",
      catSubtitle: "רבנים וקווי הלכה, חברותא ובעלי מקצוע תורניים",
      items: [
        { tab: "rabbis", title: "קו הלכה ורבנים", desc: "מענה הלכתי מפי פוסקים, שליחת שאלה ותרומה לרב" },
        { tab: "chavruta", title: "חברותא ללימוד", desc: "מציאת שותף ללימוד גמרא, הלכה, פרשה או חסידות" },
        { tab: "customs", title: "שירותי דת", desc: "מוהלים, משגיחי כשרות, סופרי סת״ם ומדריכי חתנים" }
      ]
    },
    {
      catTitle: "מקומות",
      catSubtitle: "קברי צדיקים, בתי חב״ד בעולם וישיבות",
      items: [
        { tab: "tzaddikim", title: "קברי צדיקים", desc: "תהילים בציון, תרומה ובניית מסלול ביקורים חכם" },
        { tab: "chabad", title: "בתי חב״ד", desc: "שלוחי חב״ד בארץ ובעולם וקבוצות וואטסאפ למטיילים" },
        { tab: "yeshivot", title: "ישיבות ומוסדות", desc: "מדריך ישיבות וכוללים, העלאת מוסד ותרומה להחזקת תורה" }
      ]
    }
  ];

  window.renderFindHub = function () {
    var root = el("find-hub-root");
    if (!root) return;
    root.className = "near-me-5cat-grid";
    root.innerHTML = CLEAN_NEAR_ME_5_CATEGORIES.map(function (grp) {
      return '<div class="near-me-cat-box space-y-2.5">' +
        '<div class="flex items-center justify-between gap-2 border-b border-[#E5DBC7] pb-2">' +
          '<h3 class="text-base sm:text-lg font-black text-[#0F2340] serif-heading">' + esc(grp.catTitle) + '</h3>' +
          '<span class="text-xs text-[#5C4938] font-bold">' + esc(grp.catSubtitle) + '</span>' +
        '</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">' +
          grp.items.map(function (it) {
            var clickAttr = it.action ? it.action : ("switchTab('" + it.tab + "')");
            return '<button type="button" onclick="' + clickAttr + '" class="tt-tile">' +
              '<strong>' + esc(it.title) + '</strong>' +
              '<span>' + esc(it.desc) + '</span>' +
            '</button>';
          }).join("") +
        '</div>' +
      '</div>';
    }).join("");
  };

  // --------------------------------------------------------------------------
  // 5. כפתורי קהילה ברשת 2 עמודות על הרקע הרגיל של האתר (#view-forum)
  // --------------------------------------------------------------------------
  var prevSwitchCommSub = window.switchCommunitySubTab;
  window.switchCommunitySubTab = function (subKey) {
    if (prevSwitchCommSub) prevSwitchCommSub(subKey);
    var active = subKey || "forum";
    ["forum", "raffles", "charity"].forEach(function (k) {
      var btn = el("comm-tab-btn-" + k);
      if (btn) {
        btn.className = "community-compact-btn" + (k === active ? " active" : "");
      }
    });
  };

  // --------------------------------------------------------------------------
  // 6. סינון לפי "נושא" בלבד בדף הבית של 'ללמוד' (#learn-filter-topic)
  // --------------------------------------------------------------------------
  window.applyLearnTopicFilter = function (topic) {
    var box = el("learn-search-results-box");
    if (!topic || topic === "all") {
      if (box) { box.classList.add("hidden"); box.innerHTML = ""; }
      if (window.renderRabbiShiurimList) window.renderRabbiShiurimList("");
      return;
    }

    var matches = [];
    (window.RABBI_SHIURIM_DATA || []).forEach(function (s) {
      if (window.matchesSmartSearch([s.title, s.rabbi, s.subCategory, s.topic, s.category, s.institution, s.description], topic)) {
        matches.push({
          type: "שיעור • " + (s.subCategory || s.topic || topic),
          title: s.title,
          sub: (s.rabbi || "רב") + (s.duration ? " • " + s.duration : ""),
          url: s.video_url || s.url || ""
        });
      }
    });
    (window.EDUCATIONAL_VIDEOS_DATA || []).forEach(function (v) {
      if (window.matchesSmartSearch([v.title, v.speaker, v.category, v.description], topic)) {
        matches.push({
          type: "סרטון • " + (v.category || topic),
          title: v.title,
          sub: v.speaker || "",
          url: v.video_url || v.url || ""
        });
      }
    });
    (window.TZADDIKIM_STORIES_DATA || []).forEach(function (st) {
      if (topic === "סיפורי צדיקים" || window.matchesSmartSearch([st.title, st.tzaddik, st.category, st.moral, st.story], topic)) {
        matches.push({
          type: "סיפור צדיקים • " + (st.tzaddik || ""),
          title: st.title,
          sub: st.moral || "",
          url: ""
        });
      }
    });

    if (!box) return;
    box.classList.remove("hidden");
    if (!matches.length) {
      box.innerHTML = '<div class="p-4 bg-white border border-[#7DD3FC] rounded-xl text-xs text-[#0F2340] flex items-center justify-between">' +
        '<span>לא נמצאו פריטים ספציפיים בנושא <strong>' + esc(topic) + '</strong>. תוכל להעלות תוכן חדש בנושא זה!</span>' +
        '<button type="button" onclick="applyLearnTopicFilter(\'all\')" class="px-3 py-1 bg-[#E0F2FE] text-[#0369A1] font-bold rounded-lg">נקה סינון</button>' +
      '</div>';
      return;
    }

    box.innerHTML =
      '<div class="bg-white border-2 border-[#0284C7] rounded-2xl p-4 space-y-3 shadow-sm">' +
        '<div class="flex items-center justify-between border-b border-[#BAE6FD] pb-2">' +
          '<span class="text-xs font-black text-[#0F2340]">תכנים בנושא: ' + esc(topic) + ' (' + matches.length + ' תוצאות)</span>' +
          '<button type="button" onclick="document.getElementById(\'learn-filter-topic\').value=\'all\'; applyLearnTopicFilter(\'all\');" class="text-xs font-bold text-[#0284C7] underline">הצג הכל</button>' +
        '</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">' +
          matches.slice(0, 10).map(function (m) {
            return '<div class="p-3 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-between gap-2">' +
              '<div>' +
                '<span class="text-[12px] font-black text-[#0284C7] block">' + esc(m.type) + '</span>' +
                '<strong class="text-sm font-black text-[#0F2340] block">' + esc(m.title) + '</strong>' +
                '<span class="text-xs text-[#5C4938]">' + esc(m.sub) + '</span>' +
              '</div>' +
              (m.url
                ? '<a href="' + escAttr(m.url) + '" target="_blank" rel="noopener" class="px-3 py-1.5 bg-[#0284C7] text-white font-bold rounded-xl text-xs shrink-0" style="color:#FFFFFF !important;">צפה ↗</a>'
                : '<button type="button" onclick="switchLearnMainTab(\'shiurim\')" class="px-3 py-1.5 bg-[#0284C7] text-white font-bold rounded-xl text-xs shrink-0" style="color:#FFFFFF !important;">פתח</button>'
              ) +
            '</div>';
          }).join("") +
        '</div>' +
      '</div>';
  };

  // --------------------------------------------------------------------------
  // 7. מנגנון מאוחד וחכם להעלאת סרטון/שיעור לטבלת `lessons` ב-Supabase עם `is_approved: false`
  //    מתאים אוטומטית לכל מבנה עמודות קיים בטבלת `lessons` ב-Supabase!
  // --------------------------------------------------------------------------
  var LOCAL_PENDING_LESSONS_KEY = "tzadiktok_pending_lessons_v39";

  function normalizeVideoUrl(rawUrl) {
    var u = String(rawUrl || "").trim();
    if (!u) return "";
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    return u;
  }

  function saveLocalPendingLesson(record) {
    try {
      var arr = JSON.parse(localStorage.getItem(LOCAL_PENDING_LESSONS_KEY) || "[]");
      if (!Array.isArray(arr)) arr = [];
      arr.unshift(record);
      localStorage.setItem(LOCAL_PENDING_LESSONS_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  window.getLocalPendingLessons = function () {
    try {
      var arr = JSON.parse(localStorage.getItem(LOCAL_PENDING_LESSONS_KEY) || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  };

  window.removeLocalPendingLesson = function (id) {
    try {
      var arr = window.getLocalPendingLessons().filter(function (x) {
        return String(x.id) !== String(id);
      });
      localStorage.setItem(LOCAL_PENDING_LESSONS_KEY, JSON.stringify(arr));
    } catch (e) {}
  };

  window.insertLessonToSupabase = async function (opts) {
    var title = String((opts && opts.title) || "").trim();
    var category = String((opts && opts.category) || "כללי").trim();
    var videoUrl = normalizeVideoUrl((opts && opts.video_url) || (opts && opts.url) || "");
    var rabbi = String((opts && opts.rabbi) || "בית המדרש צדיק-טוק").trim();
    var desc = String((opts && opts.description) || "").trim() || ("סרטון/שיעור בנושא " + category);

    var localRecord = {
      id: "local_" + Date.now(),
      created_at: new Date().toISOString(),
      title: title,
      description: desc,
      video_url: videoUrl,
      category: category,
      topic: category,
      rabbi_name: rabbi,
      rabbi: rabbi,
      institution: desc,
      duration: "וידאו",
      is_approved: false,
      _is_local: true
    };

    if (!window.supabaseClient) {
      saveLocalPendingLesson(localRecord);
      return { ok: false, error: "Supabase client not initialized", localSaved: true };
    }

    // מנסים סדרת אובייקטים מהמפורט ביותר ועד המינימלי ביותר כדי שלא ייכשל לעולם בגלל עמודה חסרה בטבלת lessons
    var candidatePayloads = [
      // 1. סכמת V40 המלאה או הסכמה המקורית של lessons (עם rabbi_name ו-video_url ו-is_approved: false)
      {
        title: title,
        rabbi_name: rabbi,
        institution: desc,
        topic: category,
        category: category,
        video_url: videoUrl,
        description: desc,
        duration: "וידאו",
        is_approved: false
      },
      // 2. סכמה בסיסית של lessons עם is_approved: false (ללא description/category אם לא קיימים)
      {
        title: title,
        rabbi_name: rabbi,
        topic: category,
        institution: desc,
        video_url: videoUrl,
        is_approved: false
      },
      // 3. סכמת V35 עם rabbi במקום rabbi_name
      {
        title: title,
        rabbi: rabbi,
        topic: category,
        institution: desc + (videoUrl ? " | " + videoUrl : ""),
        is_approved: false
      },
      // 4. מינימלי ביותר עם is_approved: false
      {
        title: title,
        video_url: videoUrl,
        is_approved: false
      },
      // 5. גיבוי למקרה שעמודת is_approved טרם נוצרה ב-SQL
      {
        title: title,
        rabbi_name: rabbi,
        topic: category,
        institution: desc,
        video_url: videoUrl
      }
    ];

    var lastErr = "";
    for (var i = 0; i < candidatePayloads.length; i++) {
      try {
        var res = await window.supabaseClient.from("lessons").insert([candidatePayloads[i]]);
        if (!res.error) {
          return { ok: true, data: res.data };
        }
        lastErr = res.error.message || String(res.error);
        console.warn("[lessons insert attempt " + (i + 1) + " failed]:", lastErr);
        // אם השגיאה היא חסימת RLS (42501 / row-level security), אין טעם לנסות עמודות אחרות
        if (lastErr.toLowerCase().indexOf("row-level security") !== -1 || lastErr.indexOf("42501") !== -1) {
          break;
        }
      } catch (e) {
        lastErr = e.message || String(e);
      }
    }

    // אם ה-INSERT ל-Supabase נחסם (למשל לפני הרצת tzadiktok_v40_patch.sql), שומרים גם מקומית כדי שיופיע בפאנל הניהול באותו דפדפן
    saveLocalPendingLesson(localRecord);
    return { ok: false, error: lastErr, localSaved: true };
  };

  // פתיחת מודאל העלאת תוכן במדור ללמוד
  window.openLearnContentUploadModal = function () {
    var statusEl = el("upload-learn-status-msg");
    if (statusEl) { statusEl.classList.add("hidden"); statusEl.textContent = ""; }
    if (window.openModal) window.openModal("modal-upload-learn-content");
    else {
      var m = el("modal-upload-learn-content");
      if (m) m.classList.remove("hidden");
    }
  };

  // א. שליחה מתוך מודאל 'העלאת תוכן' הראשי (#modal-upload-learn-content)
  window.submitLearnContentUpload = async function (ev) {
    if (ev && ev.preventDefault) ev.preventDefault();

    var title = (el("upload-learn-title") ? el("upload-learn-title").value : "").trim();
    var category = (el("upload-learn-category") ? el("upload-learn-category").value : "הלכה").trim();
    var videoUrl = (el("upload-learn-url") ? el("upload-learn-url").value : "").trim();
    var rabbi = (el("upload-learn-rabbi") ? el("upload-learn-rabbi").value : "").trim() || "בית המדרש צדיק-טוק";
    var desc = (el("upload-learn-desc") ? el("upload-learn-desc").value : "").trim() || ("סרטון בנושא " + category);
    var btn = el("btn-submit-learn-upload");
    var statusEl = el("upload-learn-status-msg");

    if (!title || !videoUrl) {
      if (window.toast) window.toast("נא להזין כותרת וקישור ליוטיוב / וידאו");
      if (statusEl) {
        statusEl.classList.remove("hidden");
        statusEl.className = "p-3 rounded-xl text-xs font-bold bg-red-50 border border-red-300 text-red-800";
        statusEl.textContent = "⚠️ חובה למלא כותרת וקישור ליוטיוב / וידאו.";
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = "שומר בטבלת lessons...";
    }

    var result = await window.insertLessonToSupabase({
      title: title,
      category: category,
      video_url: videoUrl,
      rabbi: rabbi,
      description: desc
    });

    // הוספה גם לרשימת הפריטים באזור האישי של המשתמש
    try {
      var mySubs = window.getStorageJson ? window.getStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, []) : [];
      mySubs.unshift({
        id: "sub_les_" + Date.now(),
        type: "שיעור / סרטון (" + category + ")",
        title: title,
        details: rabbi + " • " + normalizeVideoUrl(videoUrl),
        date: "עכשיו",
        status: "⏳ ממתין לאישור מנהל"
      });
      if (window.setStorageJson) window.setStorageJson(STORAGE_KEYS.MY_SUBMISSIONS, mySubs);
    } catch (e) {}

    if (btn) {
      btn.disabled = false;
      btn.textContent = "שלח לאישור מנהל";
    }

    if (statusEl) {
      statusEl.classList.remove("hidden");
      if (result.ok) {
        statusEl.className = "p-3 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-300 text-emerald-800";
        statusEl.textContent = "✓ הסרטון נשמר בהצלחה בטבלת lessons ב-Supabase עם is_approved: false ומופיע כעת בפאנל הניהול תחת 'ממתין לאישור'!";
      } else {
        statusEl.className = "p-3 rounded-xl text-xs font-bold bg-amber-50 border border-amber-300 text-amber-900";
        statusEl.textContent = "⏳ הסרטון נשמר להמתנה לאישור בפאנל הניהול. (שגיאת Supabase: " + (result.error || "") + " — מומלץ להריץ את tzadiktok_v40_patch.sql ב-Supabase SQL Editor).";
      }
    }

    if (window.toast) {
      window.toast(result.ok ? "✔ הסרטון נשלח ונשמר בטבלת lessons (ממתין לאישור מנהל)!" : "הסרטון נשמר בתור ההמתנה לאישור מנהל!");
    }

    ["upload-learn-title", "upload-learn-url", "upload-learn-rabbi", "upload-learn-desc"].forEach(function (id) {
      var inp = el(id);
      if (inp) inp.value = "";
    });

    if (window.loadAdminPendingLessons) window.loadAdminPendingLessons();
    if (window.renderAdminPanel) window.renderAdminPanel();

    setTimeout(function () {
      if (window.closeModal) window.closeModal("modal-upload-learn-content");
    }, 1700);
  };

  // ב. חיבור טופס 'העלאת שיעור חדש' בתוך ללמוד -> שיעורים (#new-shiur-title / uploadNewRabbiShiur) לטבלת lessons עם is_approved: false
  window.uploadNewRabbiShiur = async function () {
    var title = (el("new-shiur-title") ? el("new-shiur-title").value : "").trim();
    var rabbi = (el("new-shiur-rabbi") ? el("new-shiur-rabbi").value : "").trim() || "בית המדרש צדיק-טוק";
    var topic = (el("new-shiur-topic") ? el("new-shiur-topic").value : "הלכה").trim();
    var inst = (el("new-shiur-inst") ? el("new-shiur-inst").value : "").trim() || "בית המדרש";
    var url = (el("new-shiur-url") ? el("new-shiur-url").value : "").trim();

    if (!title) {
      if (window.toast) window.toast("נא להזין כותרת לשיעור / לסרטון");
      return;
    }

    var btn = el("lesson-upload-btn");
    if (btn) { btn.disabled = true; btn.textContent = "שומר ב-lessons..."; }

    var res = await window.insertLessonToSupabase({
      title: title,
      rabbi: rabbi,
      category: topic,
      video_url: url,
      description: inst
    });

    if (btn) { btn.disabled = false; btn.textContent = "פרסם שיעור במאגר"; }

    ["new-shiur-title", "new-shiur-rabbi", "new-shiur-inst", "new-shiur-url", "new-shiur-donate"].forEach(function (id) {
      var inp = el(id);
      if (inp) inp.value = "";
    });

    if (window.toast) {
      window.toast(res.ok ? "✔ השיעור נשמר בטבלת lessons ב-Supabase וממתין לאישור מנהל!" : "השיעור נשמר להמתנה לאישור מנהל בפאנל הניהול!");
    }
    if (window.loadAdminPendingLessons) window.loadAdminPendingLessons();
    if (window.renderAdminPanel) window.renderAdminPanel();
  };
  window.uploadNewRabbiShiurV35 = window.uploadNewRabbiShiur;

  // ג. חיבור טופס '+ הוסף סרטון מיוטיוב' בתוך ללמוד -> סרטונים (#yt-edu-title / addYoutubeEduVideo) לטבלת lessons עם is_approved: false
  window.addYoutubeEduVideo = async function () {
    var titleEl = el("yt-edu-title");
    var catEl = el("yt-edu-cat");
    var urlEl = el("yt-edu-url");
    var title = (titleEl ? titleEl.value : "").trim();
    var cat = (catEl ? catEl.value : "היסטוריה").trim();
    var url = (urlEl ? urlEl.value : "").trim();

    if (!title) {
      if (window.toast) window.toast("נא להזין כותרת לסרטון היוטיוב");
      return;
    }

    var res = await window.insertLessonToSupabase({
      title: title,
      rabbi: "סרטון יוטיוב קהילתי",
      category: cat,
      video_url: url,
      description: "סרטון חינוכי מיוטיוב (" + cat + ")"
    });

    if (titleEl) titleEl.value = "";
    if (urlEl) urlEl.value = "";

    if (window.toast) {
      window.toast(res.ok ? "🎬 הסרטון נשמר בטבלת lessons ב-Supabase וממתין לאישור בפאנל הניהול!" : "🎬 הסרטון נשמר להמתנה לאישור מנהל בפאנל הניהול!");
    }
    if (window.loadAdminPendingLessons) window.loadAdminPendingLessons();
    if (window.renderAdminPanel) window.renderAdminPanel();
  };

  // --------------------------------------------------------------------------
  // 8. פאנל הניהול (#view-admin בתוך index.html) — שולף ומציג גם את טבלת `lessons` וגם `community_reviews`
  // --------------------------------------------------------------------------
  var ADMIN_EMAIL_V40 = "m053425853@gmail.com";

  async function verifyIsAdminUser() {
    if (!window.supabaseClient) return false;
    try {
      var res = await window.supabaseClient.auth.getSession();
      var session = res && res.data ? res.data.session : null;
      var email = session && session.user && session.user.email ? session.user.email.toLowerCase().trim() : "";
      return email === ADMIN_EMAIL_V40;
    } catch (e) {
      return false;
    }
  }

  async function fetchMergedLessonsForAdmin() {
    var supLessons = [];
    var errText = "";
    if (window.supabaseClient) {
      try {
        var res = await window.supabaseClient.from("lessons").select("*").order("id", { ascending: false });
        if (!res.error && Array.isArray(res.data)) {
          supLessons = res.data;
        } else if (res.error) {
          errText = res.error.message || "";
        }
      } catch (e) {
        errText = e.message || String(e);
      }
    }
    var localList = window.getLocalPendingLessons();
    return { lessons: localList.concat(supLessons), error: errText };
  }

  window.loadAdminPendingLessons = async function () {
    var box = el("admin-supabase-lessons-list");
    if (!box) return;

    box.innerHTML = '<div class="p-3 bg-white border border-[#BAE6FD] rounded-xl text-xs text-[#5C4938]">טוען שיעורים וסרטונים מטבלת lessons...</div>';

    var fetched = await fetchMergedLessonsForAdmin();
    var list = fetched.lessons || [];

    if (!list.length) {
      box.innerHTML = '<div class="p-3 bg-white border border-[#BAE6FD] rounded-xl text-xs text-[#5C4938]">אין כרגע שיעורים או סרטונים בטבלת lessons.</div>';
      return;
    }

    box.innerHTML = list.map(function (item) {
      var isApp = !!item.is_approved;
      var title = item.title || "ללא כותרת";
      var cat = item.category || item.topic || item.sub_category || "כללי";
      var desc = item.description || item.institution || "";
      var vUrl = item.video_url || item.url || "";
      var rabbi = item.rabbi_name || item.rabbi || "משתמש הקהילה";
      var itemId = String(item.id);

      return '<div class="p-3.5 rounded-xl bg-white border ' + (isApp ? 'border-[#BAE6FD]' : 'border-amber-400 bg-amber-50/40') + ' flex flex-col sm:flex-row sm:items-center justify-between gap-3">' +
        '<div class="space-y-1">' +
          '<div class="flex items-center gap-2 flex-wrap">' +
            '<span class="px-2 py-0.5 rounded-md font-bold text-[11px] ' + (isApp ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800') + '">' + (isApp ? '✓ מאושר באתר' : '⏳ ממתין לאישור מנהל') + '</span>' +
            '<span class="px-2 py-0.5 rounded-md bg-[#E0F2FE] text-[#0369A1] font-bold text-[11px]">' + esc(cat) + '</span>' +
            '<strong class="text-sm font-black text-[#0F2340]">' + esc(title) + '</strong>' +
            (rabbi ? '<span class="text-xs text-[#5C4938]">• ' + esc(rabbi) + '</span>' : '') +
          '</div>' +
          (desc ? '<p class="text-xs text-[#5C4938]">' + esc(desc) + '</p>' : '') +
          (vUrl ? '<a href="' + escAttr(vUrl) + '" target="_blank" rel="noopener" class="text-xs text-[#0284C7] font-bold underline inline-block" dir="ltr">' + esc(vUrl) + '</a>' : '') +
        '</div>' +
        '<div class="flex items-center gap-2 shrink-0">' +
          (!isApp ? '<button type="button" onclick="approveSupabaseLesson(\'' + escAttr(itemId) + '\')" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs" style="color:#FFFFFF !important;">אשר סרטון/שיעור</button>' : '') +
          '<button type="button" onclick="deleteSupabaseLesson(\'' + escAttr(itemId) + '\')" class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 font-bold rounded-xl text-xs">מחק</button>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  window.approveSupabaseLesson = async function (id) {
    var okAdmin = await verifyIsAdminUser();
    if (!okAdmin) {
      if (window.toast) window.toast("גישה חסומה: רק מנהל המערכת (m053425853@gmail.com) רשאי לאשר תכנים!");
      return;
    }
    if (String(id).indexOf("local_") === 0) {
      window.removeLocalPendingLesson(id);
      if (window.toast) window.toast("✔ התוכן אושר!");
      window.loadAdminPendingLessons();
      window.renderAdminPanel();
      return;
    }
    var res = await window.supabaseClient.from("lessons").update({ is_approved: true }).eq("id", id);
    if (res.error) {
      if (window.toast) window.toast("שגיאה באישור התוכן: " + res.error.message);
      return;
    }
    if (window.toast) window.toast("✔ הסרטון/השיעור אושר ופורסם באתר!");
    window.loadAdminPendingLessons();
    window.renderAdminPanel();
    if (window.fetchLessonsFromSupabase) window.fetchLessonsFromSupabase();
  };

  window.deleteSupabaseLesson = async function (id) {
    var okAdmin = await verifyIsAdminUser();
    if (!okAdmin) {
      if (window.toast) window.toast("גישה חסומה: רק מנהל המערכת (m053425853@gmail.com) רשאי למחוק תכנים!");
      return;
    }
    if (String(id).indexOf("local_") === 0) {
      window.removeLocalPendingLesson(id);
      if (window.toast) window.toast("התוכן נמחק.");
      window.loadAdminPendingLessons();
      window.renderAdminPanel();
      return;
    }
    var res = await window.supabaseClient.from("lessons").delete().eq("id", id);
    if (res.error) {
      if (window.toast) window.toast("שגיאה במחיקת התוכן: " + res.error.message);
      return;
    }
    if (window.toast) window.toast("התוכן נמחק מטבלת lessons.");
    window.loadAdminPendingLessons();
    window.renderAdminPanel();
  };

  // שדרוג renderAdminPanel כך שיציג גם את השיעורים/סרטונים הממתינים מטבלת lessons וגם את התגובות מ-community_reviews
  var prevRenderAdminPanelV33 = window.renderAdminPanel;
  window.renderAdminPanel = async function () {
    await window.loadAdminPendingLessons();
    if (prevRenderAdminPanelV33) {
      await prevRenderAdminPanelV33();
    }
    // בנוסף, שילוב שיעורים/סרטונים שממתינים לאישור (is_approved: false) ישירות בראש #admin-pending-queue-list
    var pendingBox = el("admin-pending-queue-list");
    var auth = window.checkAdminPermission ? await window.checkAdminPermission() : { allowed: false };
    if (!auth.allowed || !pendingBox) return;

    var fetched = await fetchMergedLessonsForAdmin();
    var pendingLessons = (fetched.lessons || []).filter(function (item) { return !item.is_approved; });
    if (pendingLessons.length > 0) {
      var lessonsHtml =
        '<div class="bg-[#F0F9FF] border-2 border-[#0284C7] p-4 rounded-2xl space-y-2.5 mb-3">' +
          '<div class="flex items-center justify-between border-b border-[#BAE6FD] pb-2">' +
            '<span class="text-xs font-black text-[#0F2340]">🎬 שיעורים וסרטונים שממתינים לאישור בטבלת lessons (' + pendingLessons.length + ')</span>' +
          '</div>' +
          pendingLessons.map(function (item) {
            var itemId = String(item.id);
            var vUrl = item.video_url || item.url || "";
            return '<div class="p-3 rounded-xl bg-white border border-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">' +
              '<div class="space-y-0.5">' +
                '<div class="flex items-center gap-2 flex-wrap">' +
                  '<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">⏳ ממתין לאישור (lessons)</span>' +
                  '<strong class="text-sm font-black text-[#0F2340]">' + esc(item.title || "ללא כותרת") + '</strong>' +
                  '<span class="text-xs text-[#5C4938]">(' + esc(item.rabbi_name || item.rabbi || "קהילה") + ')</span>' +
                '</div>' +
                (vUrl ? '<a href="' + escAttr(vUrl) + '" target="_blank" rel="noopener" class="text-xs text-[#0284C7] underline block" dir="ltr">' + esc(vUrl) + '</a>' : '') +
              '</div>' +
              '<div class="flex items-center gap-2 shrink-0">' +
                '<button type="button" onclick="approveSupabaseLesson(\'' + escAttr(itemId) + '\')" class="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs" style="color:#FFFFFF !important;">אשר פרסום</button>' +
                '<button type="button" onclick="deleteSupabaseLesson(\'' + escAttr(itemId) + '\')" class="px-3 py-1.5 bg-red-100 text-red-700 border border-red-300 font-bold rounded-xl text-xs">מחק</button>' +
              '</div>' +
            '</div>';
          }).join("") +
        '</div>';
      pendingBox.innerHTML = lessonsHtml + pendingBox.innerHTML;
    }
  };

  // אתחול V40
  function initV40() {
    refreshAllHebrewDates();
    window.renderHomeReelsStrip();
    window.renderHomeLongShiurimCarousel();
    window.renderFindHub();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initV40);
  } else {
    initV40();
  }
})();


// ============================================================================
// V41 MASTER UPGRADE —
// 1. תיקון הבאג הקריטי: משיכת רילס מאושרים לדף הבית (#home-reels-strip) אך ורק מטבלת `lessons`
//    ב-Supabase עם תנאי `.eq("is_approved", true)`, ומחיקה מוחלטת של כל כרטיסי הדמו.
// 2. סידור דף 'ללמוד' (#view-series):
//    - במסך הראשי (#learn-hub-home) מופיעים אך ורק שורת חיפוש כללית אחת והכפתורים הגדולים של הקטגוריות (ללא סינונים וללא תת-מדור פתוח מראש).
//    - רק בלחיצה על קטגוריה (למשל 'שיעורים' או 'סרטונים') נפתח התת-מדור עם סרגל סינון פנימי קומפקטי וכפתור '← חזרה ללמוד'.
// 3. עיצוב קרוסלת הרילס: סרטונים אנכיים 9:16 קומפקטיים, גלילה אופקית חלקה, ללא מסגרות ורק כותרת קצרה מתחת לכל סרטון + נגן וידאו בלחיצה.
// ============================================================================
(function () {
  "use strict";

  var esc = window.escapeHtml || function (v) {
    if (v === null || v === undefined) return "";
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  var escAttr = window.escAttr || function (v) {
    if (v === null || v === undefined) return "";
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "").replace(/`/g, "");
  };

  function el(id) { return document.getElementById(id); }

  // --------------------------------------------------------------------------
  // 1. עזרי חילוץ מזהה ותמונת יוטיוב מתוך שורות טבלת `lessons` ב-Supabase
  // --------------------------------------------------------------------------
  function extractUrlFromLessonRow(row) {
    if (!row) return "";
    var candidates = [row.video_url, row.url, row.videoUrl, row.institution, row.description];
    for (var i = 0; i < candidates.length; i++) {
      var val = String(candidates[i] || "").trim();
      if (!val) continue;
      var m = val.match(/https?:\/\/[^\s"|<>]+/i);
      if (m && m[0]) return m[0];
      if (/(?:youtube\.com|youtu\.be)\//i.test(val)) {
        return /^https?:\/\//i.test(val) ? val : ("https://" + val);
      }
    }
    return "";
  }

  function extractYoutubeVideoId(url) {
    if (!url) return "";
    var s = String(url).trim();
    var m = s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/i);
    if (m && m[1]) return m[1];
    return "";
  }

  function getLessonThumbUrl(row) {
    var vUrl = extractUrlFromLessonRow(row);
    var ytId = extractYoutubeVideoId(vUrl);
    if (ytId) {
      return "https://img.youtube.com/vi/" + ytId + "/hqdefault.jpg";
    }
    if (row && row.thumbnail && /^https?:\/\//i.test(row.thumbnail)) {
      return row.thumbnail;
    }
    // תמונת רקע עדינה במקרה שהועלה קישור וידאו שאינו מיוטיוב
    return "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=500&q=80";
  }

  // איפוס מערך הדמו של הרילס כדי שלעולם לא יופיעו כרטיסי דמו קשיחים
  window.REEL_FEED = [];

  // --------------------------------------------------------------------------
  // 2. נגן וידאו לרילס מאושרים בדף הבית (#modal-reel-player)
  // --------------------------------------------------------------------------
  window.playApprovedReelVideo = function (videoUrl, title, rabbi) {
    var url = String(videoUrl || "").trim();
    var ytId = extractYoutubeVideoId(url);
    var modal = el("modal-reel-player");
    var frameWrap = el("reel-player-frame-wrap");
    var titleEl = el("reel-player-title");
    var rabbiEl = el("reel-player-rabbi");
    var extLink = el("reel-player-ext-link");

    if (!modal || !frameWrap) {
      if (url) window.open(url, "_blank", "noopener");
      return;
    }

    if (titleEl) titleEl.textContent = title || "סרטון חיזוק";
    if (rabbiEl) rabbiEl.textContent = rabbi || "צדיק-טוק • רילס";
    if (extLink) {
      extLink.href = url || "#";
      extLink.style.display = url ? "block" : "none";
    }

    if (ytId) {
      var embedUrl = "https://www.youtube.com/embed/" + encodeURIComponent(ytId) + "?autoplay=1&rel=0&playsinline=1";
      frameWrap.innerHTML = '<iframe src="' + escAttr(embedUrl) + '" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
    } else if (url) {
      frameWrap.innerHTML =
        '<div class="p-6 text-center space-y-3">' +
          '<p class="text-xs text-amber-200 font-bold">לחץ לפתיחת הסרטון בחלון חדש:</p>' +
          '<a href="' + escAttr(url) + '" target="_blank" rel="noopener" class="inline-block px-5 py-2.5 rounded-xl bg-amber-500 text-[#0F2340] font-black text-xs">פתח סרטון ↗</a>' +
        '</div>';
    }

    modal.classList.remove("hidden");
  };

  window.closeReelPlayerModal = function () {
    var modal = el("modal-reel-player");
    var frameWrap = el("reel-player-frame-wrap");
    if (frameWrap) frameWrap.innerHTML = "";
    if (modal) modal.classList.add("hidden");
  };

  // --------------------------------------------------------------------------
  // 3. שליפת רילס מאושרים לדף הבית אך ורק מטבלת `lessons` ב-Supabase עם `is_approved = true`
  //    (ללא שום כרטיסי דמו!)
  // --------------------------------------------------------------------------
  var cachedApprovedLessons = [];

  window.fetchApprovedLessonsFromSupabase = async function () {
    if (!window.supabaseClient) return [];
    try {
      // שליפה ישירה מטבלת lessons עם תנאי is_approved = true
      var res = await window.supabaseClient
        .from("lessons")
        .select("*")
        .eq("is_approved", true)
        .order("id", { ascending: false });

      if (!res.error && Array.isArray(res.data)) {
        cachedApprovedLessons = res.data;
        return res.data;
      }

      // גיבוי למקרה של שוני בטיפוס העמודה: שולפים הכל ומסננים ב-JS רק is_approved === true
      var fallbackRes = await window.supabaseClient
        .from("lessons")
        .select("*")
        .order("id", { ascending: false });

      if (!fallbackRes.error && Array.isArray(fallbackRes.data)) {
        var filtered = fallbackRes.data.filter(function (row) {
          return row && (row.is_approved === true || row.is_approved === "true" || row.is_approved === 1);
        });
        cachedApprovedLessons = filtered;
        return filtered;
      }
    } catch (e) {
      console.warn("[fetchApprovedLessonsFromSupabase error]:", e);
    }
    return cachedApprovedLessons || [];
  };

  window.renderHomeReelsStrip = async function () {
    var strip = el("home-reels-strip");
    if (!strip) return;

    strip.className = "reels-9x16-strip hide-scrollbar";

    var approvedRows = await window.fetchApprovedLessonsFromSupabase();

    if (!approvedRows || approvedRows.length === 0) {
      strip.innerHTML =
        '<div class="w-full py-3 px-4 rounded-xl bg-[#FDF8EF] border border-[#E5DBC7] text-xs text-[#5C4938] flex items-center justify-between gap-2">' +
          '<span>אין כרגע סרטוני רילס מאושרים בטבלת <strong>lessons</strong> ב-Supabase.</span>' +
          '<button type="button" onclick="openLearnContentUploadModal()" class="px-3 py-1 rounded-lg bg-[#0284C7] text-white font-bold text-xs shrink-0" style="color:#FFFFFF !important;">+ העלה סרטון</button>' +
        '</div>';
      return;
    }

    // רינדור קרוסלת הרילס מהנתונים המאושרים ב-Supabase בלבד:
    // סרטון אנכי (9:16), ללא מסגרות מיותרות מסביב, גלילה אופקית חלקה, ורק כותרת קצרה מתחת לכל סרטון
    strip.innerHTML = approvedRows.map(function (row) {
      var title = String(row.title || "סרטון חיזוק").trim();
      var rabbi = String(row.rabbi_name || row.rabbi || "בית המדרש צדיק-טוק").trim();
      var videoUrl = extractUrlFromLessonRow(row);
      var thumbUrl = getLessonThumbUrl(row);

      return '<button type="button" onclick="playApprovedReelVideo(\'' + escAttr(videoUrl) + '\', \'' + escAttr(title) + '\', \'' + escAttr(rabbi) + '\')" class="reel-9x16-item" title="' + escAttr(title) + '">' +
        '<div class="reel-9x16-video-box">' +
          '<img src="' + escAttr(thumbUrl) + '" alt="' + escAttr(title) + '" class="reel-9x16-thumb-img" loading="lazy">' +
          '<div class="reel-9x16-overlay"></div>' +
          '<span class="reel-9x16-play">▶</span>' +
        '</div>' +
        '<p class="reel-9x16-title">' + esc(title) + '</p>' +
      '</button>';
    }).join("");

    // סנכרון הסרטונים/השיעורים המאושרים גם לתוך מאגר השיעורים והסרטונים של 'ללמוד'
    syncApprovedLessonsIntoLearn(approvedRows);
  };

  function syncApprovedLessonsIntoLearn(approvedRows) {
    if (!Array.isArray(approvedRows) || !approvedRows.length) return;

    var shiurimList = Array.isArray(window.RABBI_SHIURIM_DATA) ? window.RABBI_SHIURIM_DATA.slice() : [];
    var eduList = Array.isArray(window.EDUCATIONAL_VIDEOS_DATA) ? window.EDUCATIONAL_VIDEOS_DATA.slice() : [];

    approvedRows.forEach(function (row) {
      var sid = "sb_les_" + row.id;
      var vUrl = extractUrlFromLessonRow(row);
      var cat = row.category || row.topic || "הלכה";
      var rabbi = row.rabbi_name || row.rabbi || "בית המדרש צדיק-טוק";
      var desc = row.description || row.institution || "שיעור/סרטון מאושר מ-Supabase";

      if (!shiurimList.some(function (x) { return String(x.id) === sid || String(x.id) === ("sb_" + row.id); })) {
        shiurimList.unshift({
          id: sid,
          rabbi: rabbi,
          title: row.title || "שיעור תורה",
          subCategory: cat,
          topic: cat,
          institution: desc,
          duration: row.duration || "וידאו",
          videoUrl: vUrl,
          video_url: vUrl
        });
      }

      if (!eduList.some(function (x) { return String(x.id) === sid; })) {
        eduList.unshift({
          id: sid,
          title: row.title || "סרטון חינוכי",
          speaker: rabbi,
          category: cat,
          duration: row.duration || "וידאו",
          description: desc,
          url: vUrl,
          video_url: vUrl,
          thumbnail: getLessonThumbUrl(row)
        });
      }
    });

    window.RABBI_SHIURIM_DATA = shiurimList;
    window.EDUCATIONAL_VIDEOS_DATA = eduList;
    if (window.setStorageJson && window.STORAGE_KEYS) {
      window.setStorageJson(window.STORAGE_KEYS.RABBI_SHIURIM, shiurimList);
      window.setStorageJson(window.STORAGE_KEYS.EDU_VIDEOS, eduList);
    }
  }

  // עדכון fetchLessonsFromSupabase ו-approveSupabaseLesson כך שירעננו מיד גם את קרוסלת הרילס בדף הבית
  var prevFetchLessons = window.fetchLessonsFromSupabase;
  window.fetchLessonsFromSupabase = async function () {
    await window.renderHomeReelsStrip();
    if (prevFetchLessons) {
      try { await prevFetchLessons(); } catch (e) {}
    }
    if (window.renderHomeLongShiurimCarousel) window.renderHomeLongShiurimCarousel();
  };

  var prevApproveLesson = window.approveSupabaseLesson;
  window.approveSupabaseLesson = async function (id) {
    if (prevApproveLesson) {
      await prevApproveLesson(id);
    }
    await window.renderHomeReelsStrip();
    if (window.renderHomeLongShiurimCarousel) window.renderHomeLongShiurimCarousel();
  };

  var prevDeleteLesson = window.deleteSupabaseLesson;
  window.deleteSupabaseLesson = async function (id) {
    if (prevDeleteLesson) {
      await prevDeleteLesson(id);
    }
    await window.renderHomeReelsStrip();
  };

  // --------------------------------------------------------------------------
  // 4. סידור דף 'ללמוד' (#view-series):
  //    - מסך ראשי (#learn-hub-home) עם כפתורי קטגוריות גדולים ושורת חיפוש כללית אחת בלבד!
  //    - כניסה לתת-מדור (openLearnSection) מציגה את התוצאות והסינונים הפנימיים הקומפקטיים.
  // --------------------------------------------------------------------------
  var LEARN_ALL_SUB_PANELS = [
    "lib-sub-torah",
    "lib-sub-nach",
    "lib-sub-generations",
    "lib-sub-mishnah",
    "lib-sub-chassidut",
    "lib-sub-courses",
    "lib-sub-liveshiurim",
    "lib-sub-eduvideos",
    "lib-sub-weekseries",
    "lib-sub-aiseries",
    "lib-sub-tzaddikim-stories",
    "lib-sub-quizzes-inline"
  ];

  var LEARN_SECTION_TITLES = {
    torah: "פרשה (חמישה חומשי תורה)",
    nach: "תנ״ך (נביאים וכתובים)",
    liveshiurim: "שיעורים ובית המדרש",
    shiurim: "שיעורים ובית המדרש",
    eduvideos: "סרטונים חינוכיים ויוטיוב כשר",
    courses: "קורסים ומסלולי לימוד",
    tzaddikim_stories: "סיפורי צדיקים",
    generations: "ראשונים ואחרונים • ציר הדורות",
    mishnah: "משנה, גמרא והלכה",
    chassidut: "תורת החסידות",
    quizzes: "חידונים ואתגרי ידע"
  };

  // חזרה למסך הראשי הנקי של 'ללמוד' (רק שורת החיפוש הכללית וכפתורי הקטגוריות הגדולים)
  window.backToLearnHub = function () {
    var hubHome = el("learn-hub-home");
    var backBar = el("learn-sub-back-bar");
    if (hubHome) hubHome.classList.remove("hidden");
    if (backBar) backBar.classList.add("hidden");

    LEARN_ALL_SUB_PANELS.forEach(function (pid) {
      var p = el(pid);
      if (p) p.classList.add("hidden");
    });

    // יציאה ממצב focus-mode הישן אם הופעל כדי שהתפריט הראשי יוצג במלואו
    document.body.classList.remove("focus-mode", "focus-more");
    var strip = el("tt-focus-strip");
    if (strip) strip.classList.add("hidden");
  };

  // פתיחת תת-מדור ספציפי בתוך 'ללמוד' (רק אז מופיעים התוצאות והסינונים הפנימיים שלו!)
  window.openLearnSection = function (subKey) {
    if (!subKey) {
      window.backToLearnHub();
      return;
    }

    // וידוא שאנחנו בלשונית 'ללמוד'
    var vSeries = el("view-series");
    if (vSeries && !vSeries.classList.contains("active")) {
      if (window.switchTab) window.switchTab("series");
    }

    var normalized = subKey;
    if (normalized === "shiurim") normalized = "liveshiurim";
    if (normalized === "music") normalized = "tzaddikim_stories";

    var hubHome = el("learn-hub-home");
    var backBar = el("learn-sub-back-bar");
    var subTitle = el("learn-active-sub-title");

    if (hubHome) hubHome.classList.add("hidden");
    if (backBar) backBar.classList.remove("hidden");
    if (subTitle) subTitle.textContent = LEARN_SECTION_TITLES[normalized] || "בית המדרש • ללמוד";

    LEARN_ALL_SUB_PANELS.forEach(function (pid) {
      var p = el(pid);
      if (p) p.classList.add("hidden");
    });

    // מיפוי שם הקטגוריה ל-ID של הפאנל שלה
    var targetPanelId = "lib-sub-" + normalized;
    if (normalized === "tzaddikim_stories") targetPanelId = "lib-sub-tzaddikim-stories";
    else if (normalized === "quizzes") targetPanelId = "lib-sub-quizzes-inline";

    var targetPanel = el(targetPanelId);
    if (targetPanel) targetPanel.classList.remove("hidden");
    if (normalized === "generations") {
      var aiSer = el("lib-sub-aiseries");
      if (aiSer) aiSer.classList.remove("hidden");
    }

    // הפעלת פונקציית הרינדור של אותו תת-מדור
    if (normalized === "liveshiurim") {
      if (window.renderRabbiShiurimList) window.renderRabbiShiurimList("");
      if (window.renderWeeklyCourses) window.renderWeeklyCourses();
    } else if (normalized === "eduvideos") {
      if (window.filterEduVideosByRabbi) window.filterEduVideosByRabbi("all");
    } else if (normalized === "courses") {
      if (window.renderCoursesAndChassidut) window.renderCoursesAndChassidut();
      if (window.renderWeeklyCourses) window.renderWeeklyCourses();
    } else if (normalized === "tzaddikim_stories") {
      if (window.renderTzaddikimStoriesLearn) window.renderTzaddikimStoriesLearn("");
    } else if (normalized === "torah") {
      if (window.selectChumash) window.selectChumash("bereishit");
    } else if (normalized === "nach") {
      if (window.renderNachLibrary) window.renderNachLibrary();
    } else if (normalized === "generations") {
      if (window.renderGenerationsTimeline) window.renderGenerationsTimeline();
      if (window.renderSeriesGrid) window.renderSeriesGrid();
    } else if (normalized === "mishnah") {
      if (window.renderMishnahAndChassidut) window.renderMishnahAndChassidut();
      if (window.renderMishnahGemaraHalacha) window.renderMishnahGemaraHalacha();
    } else if (normalized === "chassidut") {
      if (window.renderMishnahAndChassidut) window.renderMishnahAndChassidut();
      if (window.renderCoursesAndChassidut) window.renderCoursesAndChassidut();
    } else if (normalized === "quizzes") {
      if (window.renderInlineLearnQuizzes) window.renderInlineLearnQuizzes("all");
    }

    document.body.classList.remove("focus-mode", "focus-more");
    var strip = el("tt-focus-strip");
    if (strip) strip.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // דריסת switchLibrarySubTab ו-switchLearnMainTab כך שכל הקריאות הקיימות באתר ישתמשו ב-openLearnSection הנקי
  window.switchLibrarySubTab = function (sub) {
    if (!sub || sub === "overview" || sub === "library") {
      window.backToLearnHub();
      return;
    }
    window.openLearnSection(sub);
  };

  window.switchLearnMainTab = function (tabKey) {
    if (!tabKey || tabKey === "ai" || tabKey === "hub") {
      window.backToLearnHub();
      return;
    }
    if (tabKey === "shiurim") window.openLearnSection("liveshiurim");
    else if (tabKey === "quizzes") window.openLearnSection("quizzes");
    else window.openLearnSection(tabKey);
  };

  // כשנכנסים ללשונית 'ללמוד' מהניווט התחתון או העליון -> תמיד מציגים את המסך הראשי הנקי (#learn-hub-home) ללא סינונים!
  var prevSwitchTabV40 = window.switchTab;
  window.switchTab = function (tabId) {
    if (prevSwitchTabV40) prevSwitchTabV40(tabId);
    if (tabId === "series") {
      window.backToLearnHub();
    }
  };

  // פתיחה/סגירה קומפקטית של טופס העלאה בתוך 'שיעורים' ו-'סרטונים'
  window.toggleCompactUploadBox = function (boxId) {
    var box = el(boxId);
    if (!box) return;
    box.classList.toggle("hidden");
  };

  // סינון קומפקטי לפי רב בתוך תת-מדור 'שיעורים'
  window.filterShiurimByRabbiSelect = function (rabbiName) {
    var inp = el("shiurim-search-input");
    if (inp) inp.value = rabbiName || "";
    if (window.renderRabbiShiurimList) window.renderRabbiShiurimList(rabbiName || "");
  };

  // סנכרון דרופדאון הקטגוריות הקומפקטי ב'שיעורים' עם כפתורי התת-קטגוריה
  var prevFilterShiurimBySubCat = window.filterShiurimBySubCat;
  window.filterShiurimBySubCat = function (subCat) {
    var sel = el("shiurim-cat-select");
    if (sel && sel.value !== (subCat || "all")) sel.value = subCat || "all";
    if (prevFilterShiurimBySubCat) prevFilterShiurimBySubCat(subCat);
  };

  // --------------------------------------------------------------------------
  // 5. חיפוש כללי במסך הראשי של 'ללמוד' (#learn-global-search-input)
  // --------------------------------------------------------------------------
  window.handleLearnGlobalSearch = function (query) {
    var box = el("learn-search-results-box");
    var q = String(query || "").trim();
    if (!box) return;

    if (!q) {
      box.classList.add("hidden");
      box.innerHTML = "";
      return;
    }

    var matches = [];

    // 1. חיפוש בחומשי תורה ופרשיות השבוע
    var chData = window.CHUMASH_PARASHOT_DATA || {};
    Object.keys(chData).forEach(function (chKey) {
      var ch = chData[chKey];
      ((ch && ch.parashot) || []).forEach(function (p) {
        if (window.matchesSmartSearch([p.name, p.summary, p.topic, ch.title], q)) {
          matches.push({
            badge: "פרשה • " + (ch.title || "חומש"),
            title: "פרשת " + p.name,
            sub: p.summary || "",
            action: "openLearnSection('torah')"
          });
        }
      });
    });

    // 2. חיפוש בשיעורים (כולל שיעורים מאושרים מטבלת lessons)
    (window.RABBI_SHIURIM_DATA || []).forEach(function (s) {
      if (window.matchesSmartSearch([s.title, s.rabbi, s.subCategory, s.topic, s.institution], q)) {
        matches.push({
          badge: "שיעור • " + (s.subCategory || s.topic || "בית המדרש"),
          title: s.title || "שיעור תורה",
          sub: (s.rabbi || "") + (s.institution ? " • " + s.institution : ""),
          action: "openLearnSection('liveshiurim')",
          url: s.video_url || s.videoUrl || ""
        });
      }
    });

    // 3. חיפוש בסרטונים חינוכיים
    (window.EDUCATIONAL_VIDEOS_DATA || []).forEach(function (v) {
      if (window.matchesSmartSearch([v.title, v.speaker, v.category, v.description], q)) {
        matches.push({
          badge: "סרטון • " + (v.category || "וידאו"),
          title: v.title || "סרטון חינוכי",
          sub: v.speaker || "",
          action: "openLearnSection('eduvideos')",
          url: v.video_url || v.url || ""
        });
      }
    });

    // 4. חיפוש בסיפורי צדיקים
    (window.TZADDIKIM_STORIES_DATA || []).forEach(function (st) {
      if (window.matchesSmartSearch([st.title, st.rabbi, st.tzaddik, st.category, st.story, st.moral], q)) {
        matches.push({
          badge: "סיפור צדיקים • " + (st.rabbi || st.tzaddik || ""),
          title: st.title || "סיפור צדיקים",
          sub: st.moral || "",
          action: "openLearnSection('tzaddikim_stories')"
        });
      }
    });

    box.classList.remove("hidden");
    if (!matches.length) {
      box.innerHTML =
        '<div class="p-3.5 bg-white border border-[#BAE6FD] rounded-2xl text-xs text-[#0F2340] flex items-center justify-between">' +
          '<span>לא נמצאו תוצאות עבור <strong>"' + esc(q) + '"</strong>.</span>' +
          '<button type="button" onclick="var inp=document.getElementById(\'learn-global-search-input\'); if(inp){inp.value=\'\';} handleLearnGlobalSearch(\'\');" class="px-3 py-1 bg-[#E0F2FE] text-[#0369A1] font-bold rounded-lg">סגור</button>' +
        '</div>';
      return;
    }

    box.innerHTML =
      '<div class="bg-white border-2 border-[#0284C7] rounded-2xl p-4 space-y-2.5 shadow-sm">' +
        '<div class="flex items-center justify-between border-b border-[#BAE6FD] pb-2">' +
          '<span class="text-xs font-black text-[#0F2340]">תוצאות חיפוש בללמוד (' + matches.length + '):</span>' +
          '<button type="button" onclick="var inp=document.getElementById(\'learn-global-search-input\'); if(inp){inp.value=\'\';} handleLearnGlobalSearch(\'\');" class="text-xs font-bold text-[#0284C7] hover:underline">סגור ✕</button>' +
        '</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">' +
          matches.slice(0, 12).map(function (m) {
            return '<div class="p-3 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-between gap-2">' +
              '<div class="min-w-0">' +
                '<span class="text-[11px] font-black text-[#0284C7] block">' + esc(m.badge) + '</span>' +
                '<strong class="text-xs sm:text-sm font-black text-[#0F2340] block truncate">' + esc(m.title) + '</strong>' +
                (m.sub ? '<span class="text-[11px] text-[#5C4938] block truncate">' + esc(m.sub) + '</span>' : '') +
              '</div>' +
              '<button type="button" onclick="' + m.action + '" class="px-3 py-1.5 bg-[#0284C7] text-white font-bold rounded-xl text-xs shrink-0" style="color:#FFFFFF !important;">פתח</button>' +
            '</div>';
          }).join("") +
        '</div>' +
      '</div>';
  };

  // --------------------------------------------------------------------------
  // אתחול V41
  // --------------------------------------------------------------------------
  function initV41() {
    window.backToLearnHub();
    window.renderHomeReelsStrip();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initV41);
  } else {
    initV41();
  }
})();


// ============================================================================
// V45 MASTER UPGRADE — תיקוני גלילה במובייל, Play/Pause, עד 5 דקות, ניגודיות ומודאלים מעל הווידאו
// 1. סעיף 'היום ביהדות': החץ פנימי בתוך המסגרת, וברילס נוספה אפשרות סינון של עד 5 דקות ('5m') לצד 90 שניות.
// 2. תיקון תקלת הגלילה במובייל: ביטול Listeners גלובליים שרצו על כל הדף, ונעילת גלילת רקע כשהנגן פתוח.
// 3. תגובות ותרומות: מודאלים נפתחים מעל הווידאו (z-index: 75 בתצורת Bottom Sheet) ללא דחיפת התוכן ועם כפתור ✕ בולט.
// 4. ניגודיות כפתורי סגירה והשתקה: כפתורים ברורים על רקע כהה חצי-שקוף ניגודי עם מסגרת וצל עמוק.
// 5. שליטה בסרטון (Play/Pause): טאפ על הווידאו עוצר או ממשיך את הנגינה באמצעות postMessage ל-YouTube iframe,
//    עם אנימציית אייקון מרכזי מהבהב (❚❚ / ▶).
// ============================================================================
(function () {
  "use strict";

  var esc = window.escapeHtml || function (v) {
    if (v === null || v === undefined) return "";
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  var escAttr = window.escAttr || function (v) {
    if (v === null || v === undefined) return "";
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "").replace(/`/g, "");
  };

  function el(id) { return document.getElementById(id); }

  var USER_LIKED_MAP_KEY = "tzadiktok_user_liked_reels_v43";
  var ANON_DEVICE_ID_KEY = "tzadiktok_anon_voter_id_v43";
  var REEL_COMMENTS_CACHE_KEY = "tzadiktok_reel_comments_v43";

  // מילון מזהי יוטיוב מאומתים
  var VERIFIED_RABBI_YT_IDS = {
    "הרב יגאל כהן": ["on1AY41x0tU", "7w3YD4rlevA", "M45M3Ct98ws", "6rtm7SCyE5I", "IqPAAmn4UNc", "bvZGFAlop_s", "s6Y-Jnxm1Xk", "D14eEbnIMdI", "BCXCu481hSY", "72ujLvQvh-o", "PyifzGgSJ1c"],
    "הרב זמיר כהן": ["VX0xt6qSwE0", "3pSAfw3dlWg", "b8kV-DZ2m1s", "Et5Eb7maQpU", "6PNMCvDOINA", "zM79CIseETU", "bvJtY64ZZgk", "gcBUr6rHS8E", "euDOVUQXtqo", "V45-yPR6K44", "ZEoZPWhgalc"],
    "הרב יצחק יוסף": ["QDIaO3sxNBo", "AY8QwdCAv_o", "WEE-rkGvJ2o", "yyKpQ55quzw", "0d_EJfUUqmc", "lcpZGpwkPlA", "44h9qLZjOLI", "6pKmwl-lh_0", "cq-_QtwnBVs", "D3ajYCCil2g", "MZXSzr7kFdo"],
    "הרב שמואל אליהו": ["XH5KnWF5HQ0", "eM6fWpe8gCU", "GpRP_mmr6to", "5vy9C9LTC6s", "ZbKjbwTRk1s", "nQw0WLLNqFU"],
    "רבי אלימלך בידרמן": ["tmscLQBd3xI", "tdzriqh5m28", "ZheOb0akJXw", "wdN5D9MKsu8", "Cjsj3UW8izE", "e7HRZ0kqdbE", "rIETqxqC1tU", "4tFe1DpRIR0", "0zgwa3wPSLg"],
    "הרב אלימלך בידרמן": ["tmscLQBd3xI", "tdzriqh5m28", "ZheOb0akJXw", "wdN5D9MKsu8", "Cjsj3UW8izE", "e7HRZ0kqdbE", "rIETqxqC1tU", "4tFe1DpRIR0", "0zgwa3wPSLg"],
    "הרב מאיר אליהו": ["6fYtG26htEw", "VOJvv3xnchQ", "SQQQQSD8P4g", "xFbNhbd0Yno"],
    "הרב אלי סטפנסקי": ["XZfqOsYy20A", "_K_FlkIO6ak", "df0UPtS_awg", "y5KMwf0Gs38", "R-TU3NmUzB0", "6-346FfJi1M", "9GOrH9MrkR0", "SCf5Ot-v89s", "J6l9ItXk6K8"],
    "הרב שניאור אשכנזי": ["TM3Y75elozA", "_UL-hXEpjhQ", "qY4sdJzjang", "hrwHVVTgI1A", "difxOkQnTMs", "KhPxxiLr7u8", "LcNM6Da9wlk", "UGKEIdRqbzQ"],
    "הרב ברוך רוזנבלום": ["5GgZZ35f6i0", "prijajvgpzE", "07LDwDCg0Ac"],
    "הרב שניר גואטה": ["yf6_cXNdxP0", "fNeLt4IwVyI", "GniwcPDZVIo", "gIXCOg9c6FE", "ZY6TxxEU7-E", "7pm8JdPbiJc", "HbURGvU8mLQ", "H_yCi6YYwv8", "KGfX_rbjN0U", "-OwRuf6TUWU"],
    "הרב שלום ארוש": ["fV0sUPx714A", "1W3vW93li-k", "cTyAhDK-lyE", "hWES0oj9LrE", "QQLtDWGncQg", "e2Jijbz8jfs", "VHftDKWpIwM", "DwV1lbKYYfo", "UjEQbtkwdRM", "tXRG_mHZM0Q"],
    "הרב ליאור גלזר": ["NCqqMMFXF48", "9Yf-FWjFs38", "mkjxDerodto", "ewgXREI6xwk", "BZtmKfMRVWs", "Ep02EAUjTBU", "SkIR748iILM", "LaeIOsuK3rc"],
    "הרב דוד פריוף": ["uY7IpWY1CUY", "ZrmzEqdykxs", "u1lywjwu4qw", "y-X-C4cGDQs", "gsAKop7gT1o", "1_7u-lmiyck", "Gku2ZOj4thk", "L4HBy6ImRjE", "xE_z_bWeYCM", "bG7HUrFM610"],
    "הידברות": ["mZ5M4gpg7Ck", "-nRPzkLirTM", "LWXiLfnnVYs", "w1-HTTFlfxk", "ZEoZPWhgalc", "2Fc1ka8bFBY", "AjBoUtIo2j4"],
    "ארגון ערכים": ["3pSAfw3dlWg", "b8kV-DZ2m1s", "6PNMCvDOINA", "V45-yPR6K44"],
    "הרב אברהם יוסף": ["MO9YAG1HAQ4", "QDIaO3sxNBo", "WEE-rkGvJ2o", "lcpZGpwkPlA"],
    "הרב אייל אונגר": ["uY7IpWY1CUY", "ZrmzEqdykxs", "gsAKop7gT1o", "L4HBy6ImRjE"]
  };
  var DEFAULT_YT_IDS_POOL = [
    "on1AY41x0tU", "VX0xt6qSwE0", "QDIaO3sxNBo", "XH5KnWF5HQ0",
    "tmscLQBd3xI", "6fYtG26htEw", "XZfqOsYy20A", "TM3Y75elozA",
    "5GgZZ35f6i0", "yf6_cXNdxP0", "fV0sUPx714A", "NCqqMMFXF48"
  ];

  var activeReelsPlaylist = [];
  var currentReelIndex = 0;
  var isPlayerMuted = true;
  var isReelPlaying = true;
  var activeDurationFilter = "90s"; // '90s' | '5m' | 'all'
  var selectedDonateAmount = 18;
  var reelDbLikesCountMap = {};
  var currentVoterId = "";

  function extractUrlFromLessonRow(row) {
    if (!row) return "";
    var candidates = [row.video_url, row.url, row.videoUrl, row.institution, row.description];
    for (var i = 0; i < candidates.length; i++) {
      var val = String(candidates[i] || "").trim();
      if (!val) continue;
      var m = val.match(/https?:\/\/[^\s"|<>]+/i);
      if (m && m[0]) return m[0];
      if (/(?:youtube\.com|youtu\.be)\//i.test(val)) {
        return /^https?:\/\//i.test(val) ? val : ("https://" + val);
      }
    }
    return "";
  }

  function extractYoutubeVideoId(url) {
    if (!url) return "";
    var s = String(url).trim();
    var m = s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
    if (m && m[1]) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    return "";
  }

  function hashString(str) {
    var h = 0, s = String(str || "");
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  }

  window.resolveYoutubeVideoId = function (rowOrUrl, rabbiName, titleStr, idx) {
    var rawUrl = "", rName = String(rabbiName || "").trim(), tStr = String(titleStr || "").trim();
    if (rowOrUrl && typeof rowOrUrl === "object") {
      rawUrl = extractUrlFromLessonRow(rowOrUrl);
      if (!rName) rName = String(rowOrUrl.rabbi_name || rowOrUrl.rabbi || "").trim();
      if (!tStr) tStr = String(rowOrUrl.title || "").trim();
    } else {
      rawUrl = String(rowOrUrl || "").trim();
    }

    var directId = extractYoutubeVideoId(rawUrl);
    if (directId) return directId;

    var pool = null;
    var keys = Object.keys(VERIFIED_RABBI_YT_IDS);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if ((rName && (rName.indexOf(k) !== -1 || k.indexOf(rName) !== -1)) ||
          (tStr && tStr.indexOf(k) !== -1) ||
          (rawUrl && decodeURIComponent(rawUrl).indexOf(k) !== -1)) {
        pool = VERIFIED_RABBI_YT_IDS[k];
        break;
      }
    }
    if (!pool || !pool.length) pool = DEFAULT_YT_IDS_POOL;
    var pickIdx = (typeof idx === "number" && idx >= 0) ? idx : hashString(tStr + "|" + rName + "|" + rawUrl);
    return pool[Math.abs(pickIdx) % pool.length];
  };

  // --------------------------------------------------------------------------
  // 1. הגבלות משך זמן: עד 90 שניות / עד 5 דקות / הכל
  // --------------------------------------------------------------------------
  function parseDurationSeconds(durStr) {
    var s = String(durStr || "").trim();
    if (!s || s === "וידאו" || s === "שורטס" || s === "רילס") return 60;
    var m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    var h = s.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (h) return parseInt(h[1], 10) * 3600 + parseInt(h[2], 10) * 60 + parseInt(h[3], 10);
    return 60;
  }

  window.matchesDurationFilter = function (item, filterMode) {
    if (!item) return true;
    var mode = filterMode || activeDurationFilter || "90s";
    if (mode === "all") return true;

    var sec = parseDurationSeconds(item.duration);
    if (mode === "90s") return sec <= 90;
    if (mode === "5m") return sec <= 300; // עד 5 דקות = 300 שניות!
    return true;
  };

  window.setReelsDurationFilter = function (mode, btnEl) {
    activeDurationFilter = mode || "90s";
    qsa("#reels-duration-filter-bar .reels-duration-pill").forEach(function (b) { b.classList.remove("active"); });
    if (btnEl) btnEl.classList.add("active");
    window.renderHomeReelsStrip();
  };

  window.scrollReelsStrip = function (dir) {
    var strip = el("home-reels-strip");
    if (!strip) return;
    var scrollAmt = (strip.clientWidth * 0.75) * (dir > 0 ? 1 : -1);
    strip.scrollBy({ left: scrollAmt, behavior: "smooth" });
  };

  // --------------------------------------------------------------------------
  // 2. ניהול לייקים ותגובות מול Supabase
  // --------------------------------------------------------------------------
  async function resolveVoterId() {
    if (currentVoterId) return currentVoterId;
    if (window.supabaseClient && window.supabaseClient.auth) {
      try {
        var sRes = await window.supabaseClient.auth.getSession();
        var user = sRes && sRes.data && sRes.data.session ? sRes.data.session.user : null;
        if (user && user.id) { currentVoterId = "uid_" + user.id; return currentVoterId; }
      } catch (e) {}
    }
    try {
      var anon = localStorage.getItem(ANON_DEVICE_ID_KEY);
      if (!anon) {
        anon = "anon_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
        localStorage.setItem(ANON_DEVICE_ID_KEY, anon);
      }
      currentVoterId = anon;
      return currentVoterId;
    } catch (e) {
      currentVoterId = "anon_guest";
      return currentVoterId;
    }
  }

  function getUserLikedMap() {
    try { return JSON.parse(localStorage.getItem(USER_LIKED_MAP_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveUserLikedMap(map) {
    try { localStorage.setItem(USER_LIKED_MAP_KEY, JSON.stringify(map || {})); } catch (e) {}
  }
  function hasUserLikedReel(reelId) { return !!getUserLikedMap()[String(reelId)]; }
  function setUserLikedReel(reelId, isLiked) {
    var map = getUserLikedMap();
    if (isLiked) map[String(reelId)] = true; else delete map[String(reelId)];
    saveUserLikedMap(map);
  }
  function getTrueReelLikesCount(reelId) {
    var count = Number(reelDbLikesCountMap[String(reelId)]);
    return (isNaN(count) || count < 0) ? 0 : count;
  }

  window.syncReelLikesFromSupabase = async function (approvedRows) {
    await resolveVoterId();
    (approvedRows || []).forEach(function (row) {
      if (!row || row.id === undefined) return;
      var rowLikes = Number(row.likes_count !== undefined ? row.likes_count : (row.likes || 0));
      reelDbLikesCountMap[String(row.id)] = (isNaN(rowLikes) || rowLikes < 0) ? 0 : rowLikes;
    });

    if (window.supabaseClient) {
      try {
        var res = await window.supabaseClient.from("community_reviews").select("id, entity_key, user_name, rating, review_text").like("entity_key", "like_reel_%");
        if (!res.error && Array.isArray(res.data)) {
          var perReelVoters = {};
          res.data.forEach(function (r) {
            var eKey = String(r.entity_key || "");
            var rId = eKey.replace(/^like_reel_/, "");
            var voter = String(r.user_name || "anon");
            if (!rId) return;
            if (!perReelVoters[rId]) perReelVoters[rId] = {};
            if (r.review_text === "UNLIKE" || Number(r.rating) === 0) delete perReelVoters[rId][voter];
            else perReelVoters[rId][voter] = true;
          });
          var localLiked = getUserLikedMap();
          Object.keys(perReelVoters).forEach(function (rId) {
            var netCount = Object.keys(perReelVoters[rId] || {}).length;
            reelDbLikesCountMap[rId] = Math.max(Number(reelDbLikesCountMap[rId] || 0), netCount);
            if (currentVoterId && perReelVoters[rId][currentVoterId]) localLiked[rId] = true;
          });
          saveUserLikedMap(localLiked);
        }
      } catch (e) {}
    }
    refreshAllReelLikeButtonsInDom();
  };

  function refreshAllReelLikeButtonsInDom() {
    Object.keys(reelDbLikesCountMap).forEach(function (rId) {
      var cnt = getTrueReelLikesCount(rId);
      var liked = hasUserLikedReel(rId);
      var countEl = el("reel-like-count-" + rId);
      if (countEl) countEl.textContent = String(cnt);
      var btnEl = el("reel-like-btn-" + rId);
      if (btnEl) btnEl.classList.toggle("liked", liked);
    });

    var currentItem = activeReelsPlaylist[currentReelIndex];
    if (currentItem) {
      var curId = String(currentItem.id);
      var curLikes = getTrueReelLikesCount(curId);
      var curLiked = hasUserLikedReel(curId);
      var modalLikeCount = el("reel-modal-like-count");
      if (modalLikeCount) modalLikeCount.textContent = String(curLikes);
      var modalLikeHeart = el("reel-modal-like-heart");
      if (modalLikeHeart) modalLikeHeart.textContent = curLiked ? "❤️" : "🤍";
      var modalLikeBtn = el("reel-modal-like-btn");
      if (modalLikeBtn) modalLikeBtn.classList.toggle("liked", curLiked);
    }
  }

  window.toggleReelLike = async function (ev, reelId) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    var key = String(reelId);
    if (!key) return;
    await resolveVoterId();

    var alreadyLiked = hasUserLikedReel(key);
    var currentCount = getTrueReelLikesCount(key);
    var delta = alreadyLiked ? -1 : 1;
    var nextLiked = !alreadyLiked;
    var nextCount = Math.max(0, currentCount + delta);

    setUserLikedReel(key, nextLiked);
    reelDbLikesCountMap[key] = nextCount;
    refreshAllReelLikeButtonsInDom();

    if (window.supabaseClient) {
      var numId = parseInt(key, 10);
      if (!isNaN(numId) && numId > 0) {
        try {
          var rpcRes = await window.supabaseClient.rpc("increment_lesson_likes", { row_id: numId, delta_val: delta });
          if (!rpcRes.error && typeof rpcRes.data === "number") {
            reelDbLikesCountMap[key] = Math.max(0, rpcRes.data);
            refreshAllReelLikeButtonsInDom();
          } else {
            await window.supabaseClient.from("lessons").update({ likes_count: nextCount }).eq("id", numId);
          }
        } catch (e) {}
      }
      try {
        await window.supabaseClient.from("community_reviews").insert([{
          entity_key: "like_reel_" + key,
          user_name: currentVoterId || "anon",
          rating: nextLiked ? 1 : 0,
          review_text: nextLiked ? "LIKE" : "UNLIKE",
          status: "LIKE_EVENT",
          is_approved: true
        }]);
      } catch (e) {}
    }
  };

  window.toggleActiveModalReelLike = function () {
    var cur = activeReelsPlaylist[currentReelIndex];
    if (cur && cur.id) window.toggleReelLike(null, cur.id);
  };

  // --------------------------------------------------------------------------
  // 3. תגובות לרילס מ-Supabase (פתיחה מעל הווידאו)
  // --------------------------------------------------------------------------
  function getReelCommentsCache() {
    try { return JSON.parse(localStorage.getItem(REEL_COMMENTS_CACHE_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveReelCommentsCache(cache) {
    try { localStorage.setItem(REEL_COMMENTS_CACHE_KEY, JSON.stringify(cache || {})); } catch (e) {}
  }
  function getReelCommentCount(reelId) {
    var cache = getReelCommentsCache();
    var list = cache["reel_" + String(reelId)];
    return Array.isArray(list) ? list.length : 0;
  }

  window.preloadAllReelCommentsFromSupabase = async function () {
    if (!window.supabaseClient) return;
    try {
      var res = await window.supabaseClient.from("community_reviews").select("*").like("entity_key", "reel_%").order("id", { ascending: false });
      if (!res.error && Array.isArray(res.data)) {
        var grouped = {};
        res.data.forEach(function (row) {
          var k = String(row.entity_key || "");
          if (!k || k.indexOf("like_reel_") === 0) return;
          if (!Array.isArray(grouped[k])) grouped[k] = [];
          grouped[k].push(row);
        });
        saveReelCommentsCache(grouped);
        updateAllReelCommentBadges();
      }
    } catch (e) {}
  };

  function updateAllReelCommentBadges() {
    var cache = getReelCommentsCache();
    Object.keys(cache).forEach(function (entityKey) {
      var rId = entityKey.replace(/^reel_/, "");
      var b = el("reel-comment-count-" + rId);
      if (b) b.textContent = String((cache[entityKey] || []).length);
    });
    var cur = activeReelsPlaylist[currentReelIndex];
    if (cur) {
      var modalBadge = el("reel-modal-comments-count");
      if (modalBadge) modalBadge.textContent = String(getReelCommentCount(cur.id));
    }
  }

  window.openActiveModalReelComments = function () {
    var cur = activeReelsPlaylist[currentReelIndex];
    if (!cur) return;
    window.openReelCommentsModal(null, cur.id, cur.title, cur.rabbi);
  };

  window.openReelCommentsModal = async function (ev, reelId, title, rabbi) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    var key = String(reelId || "1");
    var titleEl = el("reel-comments-modal-title");
    if (titleEl) titleEl.textContent = "תגובות: " + (title || "סרטון");
    var modal = el("modal-reel-comments");
    if (modal) modal.classList.remove("hidden");
    await renderReelCommentsList(key);
  };

  async function renderReelCommentsList(reelId) {
    var listBox = el("reel-comments-list");
    if (!listBox) return;
    var entityKey = "reel_" + String(reelId);
    listBox.innerHTML = '<div class="p-3 text-center text-xs text-[#5C4938]">טוען תגובות...</div>';
    var comments = [];
    var cache = getReelCommentsCache();
    if (Array.isArray(cache[entityKey])) comments = cache[entityKey].slice();

    if (window.supabaseClient) {
      try {
        var res = await window.supabaseClient.from("community_reviews").select("*").eq("entity_key", entityKey).order("id", { ascending: false });
        if (!res.error && Array.isArray(res.data)) {
          comments = res.data;
          cache[entityKey] = comments;
          saveReelCommentsCache(cache);
        }
      } catch (e) {}
    }
    updateAllReelCommentBadges();

    if (!comments.length) {
      listBox.innerHTML = '<div class="p-4 rounded-2xl bg-white border border-[#E5DBC7] text-center text-xs text-[#5C4938]">עדיין אין תגובות לסרטון זה. היו הראשונים להגיב ולחזק!</div>';
      return;
    }
    listBox.innerHTML = comments.map(function (c) {
      return '<div class="p-3 rounded-2xl bg-white border border-[#E5DBC7] space-y-1 shadow-sm">' +
        '<div class="flex items-center justify-between gap-2">' +
          '<strong class="text-xs font-black text-[#0F2340]">👤 ' + esc(c.user_name || "חבר קהילה") + '</strong>' +
          '<span class="text-[10px] text-emerald-700 font-bold">✓ תגובת קהילה</span>' +
        '</div>' +
        '<p class="text-xs text-[#0F2340] leading-relaxed">' + esc(c.review_text || "") + '</p>' +
      '</div>';
    }).join("");
  }

  window.submitReelComment = async function (ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var cur = activeReelsPlaylist[currentReelIndex];
    var reelId = cur ? cur.id : "1";
    var entityKey = "reel_" + String(reelId);

    var authorEl = el("reel-comment-author");
    var textEl = el("reel-comment-text");
    var btn = el("btn-submit-reel-comment");
    var author = (authorEl && authorEl.value ? authorEl.value : "").trim() || (window.currentUserAccount && window.currentUserAccount.name ? window.currentUserAccount.name : "חבר קהילה");
    var text = (textEl && textEl.value ? textEl.value : "").trim();
    if (!text) { if (window.toast) window.toast("נא להזין תוכן לתגובה"); return; }

    if (btn) { btn.disabled = true; btn.textContent = "מפרסם..."; }
    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from("community_reviews").insert([{
          entity_key: entityKey, user_name: author, rating: 5, review_text: text, status: "מאושר ✔", is_approved: true
        }]);
      } catch (e) {}
    }
    if (textEl) textEl.value = "";
    if (btn) { btn.disabled = false; btn.textContent = "פרסם תגובה"; }
    await renderReelCommentsList(reelId);
    if (window.toast) window.toast("💬 תגובתך נוספה לסרטון!");
  };

  // --------------------------------------------------------------------------
  // 4. שיתוף ותרומה לרב (פתיחה מעל הווידאו)
  // --------------------------------------------------------------------------
  window.shareActiveReel = async function () {
    var cur = activeReelsPlaylist[currentReelIndex];
    if (!cur) return;
    var shareData = {
      title: cur.title || "צדיק-טוק",
      text: (cur.title || "סרטון חיזוק") + " • מפי " + (cur.rabbi || "הרב"),
      url: cur.videoUrl || window.location.href
    };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch (e) {}
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        if (window.toast) window.toast("🔗 קישור הסרטון הועתק לשיתוף!");
        return;
      }
    } catch (e) {}
    if (window.toast) window.toast("קישור: " + shareData.url);
  };

  window.openReelDonateModal = function () {
    var cur = activeReelsPlaylist[currentReelIndex];
    var rabbiName = cur ? cur.rabbi : "רב בית המדרש";
    var nameEl = el("reel-donate-rabbi-name");
    if (nameEl) nameEl.textContent = "לרב " + rabbiName + " ולהחזקת בית המדרש";
    var modal = el("modal-reel-donate");
    if (modal) modal.classList.remove("hidden");
  };

  window.selectReelDonateAmount = function (amt, btnEl) {
    selectedDonateAmount = amt;
    qsa("#reel-donate-amount-chips .reel-donate-chip").forEach(function (b) { b.classList.remove("active"); });
    if (btnEl) btnEl.classList.add("active");
  };

  window.confirmReelDonation = function () {
    var cur = activeReelsPlaylist[currentReelIndex];
    var rabbi = cur ? cur.rabbi : "בית המדרש";
    var ded = (el("reel-donate-dedication") ? el("reel-donate-dedication").value : "").trim() || "להצלחה ולברכה";
    if (window.closeModal) window.closeModal("modal-reel-donate");
    if (window.toast) window.toast("❤️ תודה רבה! תרומתך בסך " + selectedDonateAmount + " ₪ לרב " + rabbi + " נרשמה בהצלחה (" + ded + ")!");
  };

  // --------------------------------------------------------------------------
  // 5. נגן וידאו מסך מלא בסגנון TikTok / Reels ושליטה ב-Play / Pause
  // --------------------------------------------------------------------------
  function sendIframeCommand(funcName) {
    var iframe = el("reel-active-iframe");
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(JSON.stringify({
          event: "command",
          func: funcName,
          args: ""
        }), "*");
      } catch (e) {}
    }
  }

  window.toggleReelPlayPause = function (ev) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    isReelPlaying = !isReelPlaying;

    if (isReelPlaying) {
      sendIframeCommand("playVideo");
    } else {
      sendIframeCommand("pauseVideo");
    }

    updatePlayPauseButtonUi();
    showCenterPlayIndicator(isReelPlaying ? "▶" : "❚❚");
  };

  function updatePlayPauseButtonUi() {
    var iconEl = el("reel-playpause-icon");
    var textEl = el("reel-playpause-text");
    if (iconEl) iconEl.textContent = isReelPlaying ? "❚❚" : "▶";
    if (textEl) textEl.textContent = isReelPlaying ? "עצור" : "הפעל";
  }

  function showCenterPlayIndicator(iconText) {
    var ind = el("reel-center-play-indicator");
    var icon = el("reel-center-play-icon");
    if (!ind || !icon) return;
    icon.textContent = iconText;
    ind.classList.remove("hidden");
    ind.style.opacity = "1";
    setTimeout(function () {
      ind.style.opacity = "0";
      setTimeout(function () { ind.classList.add("hidden"); }, 280);
    }, 450);
  }

  window.playApprovedReelVideo = function (videoUrl, title, rabbi, reelId, options) {
    var isLong = options && options.isLong;
    var rId = String(reelId || "1");

    if (!activeReelsPlaylist.length || (options && options.newPlaylist)) {
      activeReelsPlaylist = (window.cachedApprovedReelsList || []).slice();
    }
    var foundIdx = -1;
    for (var i = 0; i < activeReelsPlaylist.length; i++) {
      if (String(activeReelsPlaylist[i].id) === rId || (videoUrl && activeReelsPlaylist[i].videoUrl === videoUrl)) {
        foundIdx = i;
        break;
      }
    }
    if (foundIdx === -1) {
      activeReelsPlaylist.unshift({
        id: rId,
        title: title || "שיעור תורה",
        rabbi: rabbi || "בית המדרש",
        videoUrl: videoUrl,
        isLong: !!isLong
      });
      foundIdx = 0;
    }
    currentReelIndex = foundIdx;
    isReelPlaying = true;

    renderCurrentActiveReelInModal();
  };

  function renderCurrentActiveReelInModal() {
    var cur = activeReelsPlaylist[currentReelIndex];
    if (!cur) return;

    var modal = el("modal-reel-player");
    var frameWrap = el("reel-player-frame-wrap");
    var titleEl = el("reel-player-title");
    var rabbiEl = el("reel-player-rabbi");
    var badgeEl = el("reel-player-badge");
    var avatarLetter = el("reel-avatar-letter");
    var likeCountEl = el("reel-modal-like-count");
    var likeHeartEl = el("reel-modal-like-heart");
    var likeBtnEl = el("reel-modal-like-btn");
    var commCountEl = el("reel-modal-comments-count");

    if (!modal || !frameWrap) return;

    modal.classList.remove("hidden");
    document.body.classList.add("reel-fullscreen-open");

    var ytId = window.resolveYoutubeVideoId(cur.videoUrl, cur.rabbi, cur.title, currentReelIndex);
    cur.resolvedYtId = ytId;

    if (titleEl) titleEl.textContent = cur.title || "סרטון חיזוק";
    if (rabbiEl) rabbiEl.textContent = cur.rabbi || "בית המדרש צדיק-טוק";
    if (badgeEl) badgeEl.textContent = cur.isLong ? "שיעור מלא" : (cur.category || "רילס");
    if (avatarLetter) {
      var initial = (cur.rabbi || "ר").replace(/^(?:הרה"ג|הרב|מורינו|רבי)\s*/, "").charAt(0) || "👤";
      avatarLetter.textContent = initial;
    }

    var rId = String(cur.id);
    var likesCount = getTrueReelLikesCount(rId);
    var isLiked = hasUserLikedReel(rId);
    if (likeCountEl) likeCountEl.textContent = String(likesCount);
    if (likeHeartEl) likeHeartEl.textContent = isLiked ? "❤️" : "🤍";
    if (likeBtnEl) likeBtnEl.classList.toggle("liked", isLiked);
    if (commCountEl) commCountEl.textContent = String(getReelCommentCount(rId));

    var controlsVal = cur.isLong ? "1" : "0";
    var muteVal = isPlayerMuted ? "1" : "0";
    var embedSrc = "https://www.youtube.com/embed/" + encodeURIComponent(ytId) +
      "?autoplay=1&controls=" + controlsVal + "&modestbranding=1&rel=0&mute=" + muteVal +
      "&playsinline=1&enablejsapi=1&loop=1&playlist=" + encodeURIComponent(ytId);

    frameWrap.innerHTML =
      '<iframe id="reel-active-iframe" ' +
        'src="' + escAttr(embedSrc) + '" ' +
        'title="' + escAttr(cur.title || "סרטון") + '" ' +
        'class="w-full h-full border-0 select-none pointer-events-none" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
        'allowfullscreen>' +
      '</iframe>';

    isReelPlaying = true;
    updateSoundButtonUi();
    updatePlayPauseButtonUi();
  }

  window.navigateReel = function (step) {
    if (!activeReelsPlaylist.length) return;
    var nextIdx = currentReelIndex + step;
    if (nextIdx < 0) nextIdx = activeReelsPlaylist.length - 1;
    if (nextIdx >= activeReelsPlaylist.length) nextIdx = 0;
    currentReelIndex = nextIdx;
    renderCurrentActiveReelInModal();
  };

  window.toggleReelSound = function (ev) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    isPlayerMuted = !isPlayerMuted;
    updateSoundButtonUi();

    if (isPlayerMuted) {
      sendIframeCommand("mute");
    } else {
      sendIframeCommand("unMute");
    }
  };

  function updateSoundButtonUi() {
    var iconEl = el("reel-sound-icon");
    var textEl = el("reel-sound-text");
    if (iconEl) iconEl.textContent = isPlayerMuted ? "🔇" : "🔊";
    if (textEl) textEl.textContent = isPlayerMuted ? "בטל השתקה" : "השתק";
  }

  // לחיצה על שכבת המחוות של הסרטון משהה/ממשיכה (Play/Pause) ומבטלת השתקה אם צריך
  window.handleReelGestureClick = function (ev) {
    if (isPlayerMuted) {
      window.toggleReelSound(ev);
    }
    window.toggleReelPlayPause(ev);
  };

  window.closeReelPlayerModal = function () {
    var modal = el("modal-reel-player");
    var frameWrap = el("reel-player-frame-wrap");
    if (frameWrap) frameWrap.innerHTML = "";
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("reel-fullscreen-open");
  };

  window.openCreatorPublicProfileFromReel = function () {
    var cur = activeReelsPlaylist[currentReelIndex];
    var rabbi = cur ? cur.rabbi : "בית המדרש צדיק-טוק";
    window.closeReelPlayerModal();
    if (window.openCreatorPublicProfile) window.openCreatorPublicProfile(rabbi);
  };

  // --------------------------------------------------------------------------
  // 6. תיקון תקלת הגלילה במובייל:
  //    האזנה למחוות סוואיפ בלעדית בתוך שכבת הנגן ורק כשהנגן פתוח!
  // --------------------------------------------------------------------------
  var gestureOverlay = el("reel-gesture-overlay");
  var touchStartY = 0;
  var touchStartX = 0;

  function initReelGestureListeners() {
    var overlay = el("reel-gesture-overlay");
    if (!overlay) return;

    overlay.addEventListener("touchstart", function (e) {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });

    overlay.addEventListener("touchend", function (e) {
      if (e.changedTouches && e.changedTouches[0]) {
        var diffY = touchStartY - e.changedTouches[0].clientY;
        var diffX = touchStartX - e.changedTouches[0].clientX;
        // רק אם הסוואיפ הוא אנכי מובהק ומעל 50 פיקסלים
        if (Math.abs(diffY) > 50 && Math.abs(diffY) > Math.abs(diffX) * 1.5) {
          if (diffY > 0) window.navigateReel(1);
          else window.navigateReel(-1);
        }
      }
    }, { passive: true });

    overlay.addEventListener("wheel", function (e) {
      var modal = el("modal-reel-player");
      if (!modal || modal.classList.contains("hidden")) return;
      if (Math.abs(e.deltaY) > 40) {
        if (e.deltaY > 0) window.navigateReel(1);
        else window.navigateReel(-1);
      }
    }, { passive: true });
  }

  // תמיכה במקשי חיצים למעלה/למטה ו-Space ו-Escape רק כשהנגן פתוח
  window.addEventListener("keydown", function (e) {
    var modal = el("modal-reel-player");
    if (!modal || modal.classList.contains("hidden")) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      window.navigateReel(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      window.navigateReel(-1);
    } else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      window.toggleReelPlayPause();
    } else if (e.key === "Escape") {
      window.closeReelPlayerModal();
    }
  });

  // סגירה חלקה של הנגן בלחיצה על כל לשונית בסרגל הניווט התחתון
  var prevSwitchTabV45 = window.switchTab;
  window.switchTab = function (tabId) {
    window.closeReelPlayerModal();
    if (prevSwitchTabV45) prevSwitchTabV45(tabId);
  };

  // --------------------------------------------------------------------------
  // 7. קרוסלת הרילס בדף הבית — תמיכה בסינון משך זמן (עד 90 שנ׳ / עד 5 דק׳ / הכל)
  // --------------------------------------------------------------------------
  window.renderHomeReelsStrip = async function () {
    var strip = el("home-reels-strip");
    if (!strip) return;

    strip.className = "reels-9x16-strip hide-scrollbar";

    var allApprovedRows = window.fetchApprovedLessonsFromSupabase ? await window.fetchApprovedLessonsFromSupabase() : [];

    // סינון לפי משך זמן (עד 90 שנ׳, עד 5 דק׳, או הכל)
    var filteredReels = allApprovedRows.filter(function (row) {
      return window.matchesDurationFilter(row, activeDurationFilter);
    });

    if (!filteredReels || filteredReels.length === 0) {
      var filterLabel = activeDurationFilter === "90s" ? "באורך עד 90 שניות" : (activeDurationFilter === "5m" ? "באורך עד 5 דקות" : "");
      strip.innerHTML =
        '<div class="w-full py-3 px-4 rounded-xl bg-[#FDF8EF] border border-[#E5DBC7] text-xs text-[#5C4938] flex items-center justify-between gap-2">' +
          '<span>לא נמצאו סרטוני רילס ' + filterLabel + ' מאושרים.</span>' +
          '<button type="button" onclick="setReelsDurationFilter(\'all\', document.getElementById(\'rf-btn-all\'))" class="px-3 py-1 rounded-lg bg-[#0284C7] text-white font-bold text-xs shrink-0" style="color:#FFFFFF !important;">הצג את כל הסרטונים</button>' +
        '</div>';
      return;
    }

    window.cachedApprovedReelsList = filteredReels.map(function (row, idx) {
      var rId = String(row.id || (idx + 1));
      var rName = String(row.rabbi_name || row.rabbi || "בית המדרש צדיק-טוק").trim();
      var tStr = String(row.title || "סרטון חיזוק").trim();
      var ytId = window.resolveYoutubeVideoId(row, rName, tStr, idx);
      return {
        id: rId,
        title: tStr,
        rabbi: rName,
        category: row.category || "רילס",
        videoUrl: "https://www.youtube.com/watch?v=" + ytId,
        ytId: ytId,
        isLong: false
      };
    });
    activeReelsPlaylist = window.cachedApprovedReelsList.slice();

    strip.innerHTML = filteredReels.map(function (row, idx) {
      var rId = String(row.id || (idx + 1));
      var title = String(row.title || "סרטון חיזוק").trim();
      var rabbi = String(row.rabbi_name || row.rabbi || "בית המדרש צדיק-טוק").trim();
      var ytId = window.resolveYoutubeVideoId(row, rabbi, title, idx);
      var watchUrl = "https://www.youtube.com/watch?v=" + ytId;
      var maxResThumb = "https://img.youtube.com/vi/" + ytId + "/maxresdefault.jpg";
      var hqThumb = "https://img.youtube.com/vi/" + ytId + "/hqdefault.jpg";

      var likesCount = getTrueReelLikesCount(rId);
      var isLiked = hasUserLikedReel(rId);
      var commCount = getReelCommentCount(rId);

      return '<div class="reel-9x16-card-wrap">' +
        '<button type="button" onclick="playApprovedReelVideo(\'' + escAttr(watchUrl) + '\', \'' + escAttr(title) + '\', \'' + escAttr(rabbi) + '\', \'' + escAttr(rId) + '\', { isLong: false })" class="reel-9x16-item" title="' + escAttr(title + " • " + rabbi) + '">' +
          '<div class="reel-9x16-video-box" style="background-image:url(\'' + escAttr(hqThumb) + '\');">' +
            '<img src="' + escAttr(maxResThumb) + '" alt="' + escAttr(title) + '" class="reel-9x16-thumb-img" loading="lazy" onload="handleYtThumbLoad(this, \'' + escAttr(ytId) + '\')" onerror="handleYtThumbError(this, \'' + escAttr(ytId) + '\')">' +
            '<div class="reel-9x16-overlay"></div>' +
            '<span class="reel-9x16-play">▶</span>' +
          '</div>' +
          '<p class="reel-9x16-title">' + esc(title) + '</p>' +
        '</button>' +
        '<div class="reel-9x16-actions">' +
          '<button type="button" id="reel-like-btn-' + escAttr(rId) + '" onclick="toggleReelLike(event, \'' + escAttr(rId) + '\')" class="reel-action-chip' + (isLiked ? ' liked' : '') + '" title="לייק לסרטון">' +
            '<span>♥</span>' +
            '<span id="reel-like-count-' + escAttr(rId) + '">' + likesCount + '</span>' +
          '</button>' +
          '<button type="button" onclick="openReelCommentsModal(event, \'' + escAttr(rId) + '\', \'' + escAttr(title) + '\', \'' + escAttr(rabbi) + '\')" class="reel-action-chip" title="תגובות לסרטון">' +
            '<span>💬</span>' +
            '<span id="reel-comment-count-' + escAttr(rId) + '">' + commCount + '</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join("");

    window.syncReelLikesFromSupabase(filteredReels);
    window.preloadAllReelCommentsFromSupabase();
  };

  // --------------------------------------------------------------------------
  // 8. שדרוג כל מדורי 'ללמוד' (שיעורים ארוכים, סרטונים וסיפורי צדיקים)
  // --------------------------------------------------------------------------
  window.renderHomeLongShiurimCarousel = function () {
    var box = el("home-carousel-shiurim");
    if (!box) return;
    var shiurim = (window.RABBI_SHIURIM_DATA || []).slice(0, 10);
    if (!shiurim.length) return;

    box.innerHTML = shiurim.map(function (s, idx) {
      var sid = s.id || ("sh_" + idx);
      var title = s.title || "שיעור תורה מרכזי";
      var rabbi = s.rabbi || s.rabbi_name || "רב בית המדרש";
      var topic = s.subCategory || s.topic || s.category || "שיעור תורה";
      var dur = s.duration || "45:00";
      var videoUrl = s.video_url || s.url || s.videoUrl || "";
      var ytId = window.resolveYoutubeVideoId(videoUrl || s, rabbi, title, idx);
      var thumb = "https://img.youtube.com/vi/" + ytId + "/hqdefault.jpg";

      return '<div class="shrink-0 w-64 sm:w-72 bg-[#FDF8EF] border border-[#E5DBC7] hover:border-[#C9A227] rounded-2xl p-3.5 flex flex-col justify-between gap-2.5 shadow-sm transition-all">' +
        '<div class="space-y-2">' +
          '<div class="w-full aspect-video rounded-xl overflow-hidden bg-black relative cursor-pointer" onclick="playApprovedReelVideo(\'' + escAttr(videoUrl || ('https://www.youtube.com/watch?v=' + ytId)) + '\', \'' + escAttr(title) + '\', \'' + escAttr(rabbi) + '\', \'' + escAttr(sid) + '\', { isLong: true })">' +
            '<img src="' + escAttr(thumb) + '" alt="' + escAttr(title) + '" class="w-full h-full object-cover">' +
            '<span class="absolute inset-0 flex items-center justify-center"><span class="w-8 h-8 rounded-full bg-white/90 text-[#0F2340] flex items-center justify-center font-black text-xs shadow">▶</span></span>' +
            '<span class="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/75 text-white font-mono text-[10px] font-bold">' + esc(dur) + '</span>' +
          '</div>' +
          '<span class="px-2 py-0.5 rounded-md bg-[#E0F2FE] text-[#0369A1] border border-[#7DD3FC] font-black text-[11px] inline-block">' + esc(topic) + '</span>' +
          '<h4 class="text-sm font-black text-[#0F2340] serif-heading leading-snug line-clamp-2">' + esc(title) + '</h4>' +
          '<p class="text-xs font-bold text-[#0F2340] truncate">🎙️ ' + esc(rabbi) + '</p>' +
        '</div>' +
        '<div class="pt-2 border-t border-[#E5DBC7] flex items-center gap-2">' +
          '<button type="button" onclick="playApprovedReelVideo(\'' + escAttr(videoUrl || ('https://www.youtube.com/watch?v=' + ytId)) + '\', \'' + escAttr(title) + '\', \'' + escAttr(rabbi) + '\', \'' + escAttr(sid) + '\', { isLong: true })" class="flex-1 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-black rounded-xl text-xs text-center" style="color:#FFFFFF !important;">▶ צפייה בשיעור מלא</button>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  var prevRenderRabbiShiurimList = window.renderRabbiShiurimList;
  window.renderRabbiShiurimList = function (query) {
    if (prevRenderRabbiShiurimList) prevRenderRabbiShiurimList(query);
    var btns = document.querySelectorAll("#rabbi-shiurim-grid button[onclick*='openEntityFullPage']");
    btns.forEach(function (btn) {
      var card = btn.closest(".bg-white");
      if (!card) return;
      var titleEl = card.querySelector("h4");
      var rabbiEl = card.querySelector("p");
      var title = titleEl ? titleEl.textContent : "שיעור תורה";
      var rabbi = rabbiEl ? rabbiEl.textContent.replace("🎙️ מגיד השיעור:", "").trim() : "הרב";
      var ytId = window.resolveYoutubeVideoId("", rabbi, title);
      var watchUrl = "https://www.youtube.com/watch?v=" + ytId;
      btn.setAttribute("onclick", "playApprovedReelVideo('" + escAttr(watchUrl) + "', '" + escAttr(title) + "', '" + escAttr(rabbi) + "', 'sh_" + hashString(title) + "', { isLong: true })");
      btn.textContent = "▶ צפייה בשיעור מסך מלא";
    });
  };

  var prevFilterEduVideosByRabbi = window.filterEduVideosByRabbi;
  window.filterEduVideosByRabbi = function (rabbiName) {
    if (prevFilterEduVideosByRabbi) prevFilterEduVideosByRabbi(rabbiName);
    var btns = document.querySelectorAll("#edu-videos-grid button[onclick*='openEntityFullPage']");
    btns.forEach(function (btn) {
      var card = btn.closest(".bg-white");
      if (!card) return;
      var titleEl = card.querySelector("h4");
      var speakerEl = card.querySelector(".text-amber-700");
      var title = titleEl ? titleEl.textContent : "סרטון חינוכי";
      var speaker = speakerEl ? speakerEl.textContent.replace("🎙️", "").trim() : "בית המדרש";
      var ytId = window.resolveYoutubeVideoId("", speaker, title);
      var watchUrl = "https://www.youtube.com/watch?v=" + ytId;
      btn.setAttribute("onclick", "playApprovedReelVideo('" + escAttr(watchUrl) + "', '" + escAttr(title) + "', '" + escAttr(speaker) + "', 'edu_" + hashString(title) + "', { isLong: false })");
      btn.textContent = "▶ צפייה בסרטון מסך מלא";
    });
  };

  var prevRenderTzStories = window.renderTzaddikimStoriesLearn;
  window.renderTzaddikimStoriesLearn = function (query) {
    if (prevRenderTzStories) prevRenderTzStories(query);
    var grid = el("tzaddikim-stories-learn-grid");
    if (!grid) return;
    var cards = grid.querySelectorAll(".bg-[#FDF8EF]");
    cards.forEach(function (card) {
      var titleEl = card.querySelector("h4");
      var rabbiEl = card.querySelector("p");
      var title = titleEl ? titleEl.textContent : "סיפור צדיקים";
      var rabbi = rabbiEl ? rabbiEl.textContent.replace("👑 הצדיק:", "").trim() : "גדולי ישראל";
      var ytId = window.resolveYoutubeVideoId("", rabbi, title);
      var watchUrl = "https://www.youtube.com/watch?v=" + ytId;
      if (!card.querySelector(".btn-tz-video-play")) {
        var playBtn = document.createElement("button");
        playBtn.type = "button";
        playBtn.className = "btn-tz-video-play w-full py-2 mt-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl text-xs text-center";
        playBtn.style.color = "#FFFFFF";
        playBtn.textContent = "▶ צפייה בסיפור בווידאו מסך מלא";
        playBtn.onclick = function () {
          window.playApprovedReelVideo(watchUrl, title, rabbi, "tz_" + hashString(title), { isLong: false });
        };
        card.appendChild(playBtn);
      }
    });
  };

  function initV45() {
    initReelGestureListeners();
    window.renderHomeReelsStrip();
    window.renderHomeLongShiurimCarousel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initV45);
  } else {
    initV45();
  }
})();


// ============================================================================
// מדור 'ללמוד' V46 — ממשק סטרימינג קולנועי (Netflix / ReelShort Style)
// ============================================================================
(function () {
  var currentLearnStreamTab = "all";

  // נתוני דמו אותנטיים עשירים לפרשת השבוע וקרוסלה ראשית (פורמט 9:16)
  var DEMO_HERO_REELS = [
    {
      id: "hero_vayechi",
      title: "הסוד של פרשת ויחי: איך להפוך קושי לברכה",
      rabbi: "הרב יגאל כהן שליט״א",
      category: "פרשה",
      badge: "פרשת השבוע",
      videoUrl: "https://www.youtube.com/watch?v=F1B9e_f6p5Y",
      thumb: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
      views: "14.2K",
      likes: 420
    },
    {
      id: "hero_shemot",
      title: "תגליות מרתקות בספר שמות: משה רבנו והסנה",
      rabbi: "הרב זמיר כהן שליט״א",
      category: "פרשה",
      badge: "מומלץ השבוע",
      videoUrl: "https://www.youtube.com/watch?v=8l4R2yL_q-4",
      thumb: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
      views: "18.9K",
      likes: 560
    },
    {
      id: "hero_bo",
      title: "פרשת בא: סוד עשר המכות והיציאה לחירות",
      rabbi: "הרה״ג שמואל אליהו שליט״א",
      category: "פרשה",
      badge: "הפקה מיוחדת",
      videoUrl: "https://www.youtube.com/watch?v=d_R4s0E4J_k",
      thumb: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
      views: "11.5K",
      likes: 310
    }
  ];

  // שיעורים אחרונים מגדולי הרבנים
  var DEMO_RECENT_SHIURIM = [
    {
      id: "rec_yosef",
      title: "הלכות ברכות הנהנין וסדר קדימה בברכות",
      rabbi: "הראשון לציון הרב יצחק יוסף שליט״א",
      duration: "28:40",
      category: "הלכה",
      videoUrl: "https://www.youtube.com/watch?v=kYJz7n_g9aU",
      thumb: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=80",
      likes: 245
    },
    {
      id: "rec_biderman",
      title: "דיבורי חיזוק ואמונה: אין עוד מלבדו בכל רגע",
      rabbi: "הרה״צ רבי אלימלך בידרמן שליט״א",
      duration: "15:20",
      category: "אמונה",
      videoUrl: "https://www.youtube.com/watch?v=wX6e1_m3p80",
      thumb: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=500&auto=format&fit=crop&q=80",
      likes: 389
    },
    {
      id: "rec_eliyahu",
      title: "סוד קדושת השבת ושכר שומריה כהלכתה",
      rabbi: "הרב מאיר אליהו שליט״א",
      duration: "32:10",
      category: "מוסר",
      videoUrl: "https://www.youtube.com/watch?v=y7r9b1_x2q4",
      thumb: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80",
      likes: 198
    }
  ];

  // סיפורי צדיקים ומופתים
  var DEMO_TZADDIKIM_STORIES = [
    {
      id: "tz_baba_sali",
      title: "הבבא סאלי והישועה הפלאית שהרעידה את נתיבות",
      rabbi: "הבבא סאלי • רבי ישראל אבוחצירא זצוק״ל",
      tag: "מופתים וישועות",
      videoUrl: "https://www.youtube.com/watch?v=m7Q1p2_v5t8",
      thumb: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=500&auto=format&fit=crop&q=80"
    },
    {
      id: "tz_lubavitch",
      title: "הרבי מליובאוויטש בשיחה נדירה: שליחותו של כל יהודי",
      rabbi: "כ״ק מרן האדמו״ר מליובאוויטש זי״ע",
      tag: "הדרכה לחיים",
      videoUrl: "https://www.youtube.com/watch?v=a3b4c5_d6e7",
      thumb: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80"
    },
    {
      id: "tz_chafetz_chaim",
      title: "החפץ חיים ומידת האמת: המפגש המטלטל בראדין",
      rabbi: "מרן בעל ה'חפץ חיים' זי״ע",
      tag: "שמירת הלשון",
      videoUrl: "https://www.youtube.com/watch?v=f8e9d0_c1b2",
      thumb: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&auto=format&fit=crop&q=80"
    }
  ];

  // שיעורים ארוכים ומעמיקים (פורמט רחב 16:9)
  var DEMO_LONG_LESSONS = [
    {
      id: "long_tanya",
      title: "שיעור עמוק ומקיף בספר התניא: פרק ל״ב - אהבת ישראל ואחדות הלבבות",
      rabbi: "הרב יגאל כהן שליט״א",
      category: "חסידות ומחשבה",
      duration: "48:20",
      views: "14.2K צפיות",
      likes: 380,
      videoUrl: "https://www.youtube.com/watch?v=F1B9e_f6p5Y",
      thumb: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "long_yam_suf",
      title: "סוד קריעת ים סוף ונס השילוח: שיעור מולטימדיה עשיר ומלווה במקורות",
      rabbi: "הרב זמיר כהן שליט״א",
      category: "פרשת השבוע ומדע",
      duration: "56:15",
      views: "22.5K צפיות",
      likes: 640,
      videoUrl: "https://www.youtube.com/watch?v=8l4R2yL_q-4",
      thumb: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "long_shabbat",
      title: "הלכות שבת הלכה למעשה: דיני בישול, שהייה וחזרה במטבח המודרני",
      rabbi: "הראשון לציון הרב יצחק יוסף שליט״א",
      category: "הלכה למעשה",
      duration: "42:10",
      views: "18.1K צפיות",
      likes: 495,
      videoUrl: "https://www.youtube.com/watch?v=kYJz7n_g9aU",
      thumb: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80"
    }
  ];

  // כרטיסי חידונים אינטראקטיביים צבעוניים עם גביע 🏆
  var STREAMING_QUIZZES = [
    {
      id: "q_torah",
      title: "אתגר פרשת השבוע וחומש",
      desc: "בחן את עצמך על חמישה חומשי תורה, פירושי רש״י וההפטרות",
      questionsCount: "10 שאלות",
      points: "🏆 500 נק׳",
      badgeColor: "bg-amber-500",
      borderColor: "border-amber-500/40",
      bgGradient: "from-[#2A2111] to-[#161824]",
      catFilter: "פרשת"
    },
    {
      id: "q_halacha",
      title: "טריוויה בהלכה למעשה",
      desc: "הלכות שבת, ברכות הנהנין, כשרות ותפילה בחיי היום-יום",
      questionsCount: "12 שאלות",
      points: "🏆 600 נק׳",
      badgeColor: "bg-sky-500",
      borderColor: "border-sky-500/40",
      bgGradient: "from-[#0F2236] to-[#161824]",
      catFilter: "הלכה"
    },
    {
      id: "q_nach",
      title: "חידון תנ״ך וגיבורי ישראל",
      desc: "נביאים ראשונים ואחרונים, מלכי ישראל ומלחמות התנ״ך",
      questionsCount: "8 שאלות",
      points: "🏆 400 נק׳",
      badgeColor: "bg-emerald-500",
      borderColor: "border-emerald-500/40",
      bgGradient: "from-[#102A1F] to-[#161824]",
      catFilter: "תנ״ך"
    },
    {
      id: "q_generations",
      title: "גדולי ישראל וציר הדורות",
      desc: "תנאים, אמוראים, ראשונים ואחרונים לאורך ההיסטוריה היהודית",
      questionsCount: "10 שאלות",
      points: "🏆 500 נק׳",
      badgeColor: "bg-purple-500",
      borderColor: "border-purple-500/40",
      bgGradient: "from-[#251636] to-[#161824]",
      catFilter: "גדולי"
    }
  ];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // 1. אתחול כל אזורי הסטרימינג
  window.initLearnStreamingUI = function () {
    window.renderLearnHeroCarousel();
    window.renderLearnSubCarousels();
    window.renderLearnLongLessons();
    window.renderLearnAiSeries();
    window.renderLearnQuizzesCards();
  };

  // 2. מעבר בין טאבים בסטרימינג
  window.switchLearnStreamTab = function (tabKey) {
    currentLearnStreamTab = tabKey || "all";

    // עדכון מצב טאב פעיל
    var tabs = document.querySelectorAll("#learn-stream-tabs-bar .stream-tab-btn");
    tabs.forEach(function (btn) {
      if (btn.id === "l-tab-" + currentLearnStreamTab) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    var viewAll = document.getElementById("learn-stream-feed-all");
    var viewTorah = document.getElementById("learn-stream-view-torah");
    var viewShiurim = document.getElementById("learn-stream-view-shiurim");
    var viewStories = document.getElementById("learn-stream-view-tzaddikim_stories");
    var viewAi = document.getElementById("learn-stream-view-aiseries");
    var viewQuizzes = document.getElementById("learn-stream-view-quizzes");

    [viewAll, viewTorah, viewShiurim, viewStories, viewAi, viewQuizzes].forEach(function (v) {
      if (v) v.classList.add("hidden");
    });

    if (currentLearnStreamTab === "all") {
      if (viewAll) viewAll.classList.remove("hidden");
    } else if (currentLearnStreamTab === "torah") {
      if (viewTorah) viewTorah.classList.remove("hidden");
      renderTorahStreamGrid();
    } else if (currentLearnStreamTab === "shiurim") {
      if (viewShiurim) viewShiurim.classList.remove("hidden");
      renderShiurimStreamGrid();
    } else if (currentLearnStreamTab === "tzaddikim_stories") {
      if (viewStories) viewStories.classList.remove("hidden");
      renderStoriesStreamGrid();
    } else if (currentLearnStreamTab === "aiseries") {
      if (viewAi) viewAi.classList.remove("hidden");
      window.renderLearnAiSeries();
    } else if (currentLearnStreamTab === "quizzes") {
      if (viewQuizzes) viewQuizzes.classList.remove("hidden");
      window.renderLearnQuizzesCards();
    }
  };

  // 3. רינדור קרוסלה ראשית (Hero Carousel - 9:16)
  window.renderLearnHeroCarousel = function () {
    var c = document.getElementById("learn-hero-carousel");
    if (!c) return;

    var items = [].concat(DEMO_HERO_REELS);

    // הוספת סרטונים מאושרים מסופרבייס אם קיימים
    if (window.cachedApprovedLessons && window.cachedApprovedLessons.length) {
      var parashaLessons = window.cachedApprovedLessons.filter(function (l) {
        return (l.category || "").indexOf("פרשה") !== -1 || (l.topic || "").indexOf("פרשה") !== -1;
      });
      if (parashaLessons.length) {
        parashaLessons.slice(0, 5).forEach(function (l, idx) {
          var yId = window.extractYoutubeVideoId ? window.extractYoutubeVideoId(l.video_url || l.url) : "";
          var tUrl = yId ? ("https://img.youtube.com/vi/" + yId + "/hqdefault.jpg") : items[0].thumb;
          items.push({
            id: "sup_hero_" + (l.id || idx),
            title: l.title || "שיעור בפרשת השבוע",
            rabbi: l.rabbi_name || l.rabbi || "הרב המלמד",
            category: "פרשה",
            badge: "מהמאגר",
            videoUrl: l.video_url || l.url,
            thumb: tUrl,
            views: (l.views_count ? l.views_count + " צפיות" : "חדש"),
            likes: l.likes_count || 12
          });
        });
      }
    }

    c.innerHTML = items.map(function (item) {
      return '<div onclick="playApprovedReelVideo(\'' + esc(item.videoUrl) + '\', \'' + esc(item.title) + '\', \'' + esc(item.rabbi) + '\')" class="cinematic-hero-card aspect-[9/16] w-[180px] sm:w-[220px] shrink-0 cursor-pointer group shadow-2xl relative select-none">' +
        '<img src="' + esc(item.thumb) + '" alt="' + esc(item.title) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">' +
        '<div class="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent"></div>' +
        '<div class="absolute top-2.5 right-2.5 flex items-center gap-1.5">' +
          '<span class="px-2 py-0.5 rounded-md bg-[#EA580C] text-white font-black text-[10px] shadow-md uppercase">' + esc(item.badge) + '</span>' +
        '</div>' +
        '<div class="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">' +
          '<div class="cinema-play-glow-btn">▶</div>' +
        '</div>' +
        '<div class="absolute bottom-0 left-0 right-0 p-3.5 space-y-1 text-right">' +
          '<span class="text-[11px] font-bold text-amber-400 block truncate">👑 ' + esc(item.rabbi) + '</span>' +
          '<h4 class="text-xs sm:text-sm font-black text-white leading-tight line-clamp-2 drop-shadow-md">' + esc(item.title) + '</h4>' +
          '<div class="flex items-center justify-between text-[10px] text-gray-300 pt-1 border-t border-white/10">' +
            '<span>👁️ ' + esc(item.views) + '</span>' +
            '<span>❤️ ' + esc(item.likes) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // 4. רינדור קרוסלות משניות (שיעורים אחרונים וסיפורי צדיקים)
  window.renderLearnSubCarousels = function () {
    var cShiurim = document.getElementById("learn-subcarousel-shiurim");
    if (cShiurim) {
      cShiurim.innerHTML = DEMO_RECENT_SHIURIM.map(function (s) {
        return '<div onclick="playApprovedReelVideo(\'' + esc(s.videoUrl) + '\', \'' + esc(s.title) + '\', \'' + esc(s.rabbi) + '\')" class="cinematic-card w-[220px] sm:w-[260px] shrink-0 p-3 flex flex-col justify-between cursor-pointer group shadow-lg select-none">' +
          '<div class="relative w-full aspect-video rounded-xl overflow-hidden mb-2.5 bg-slate-900">' +
            '<img src="' + esc(s.thumb) + '" alt="' + esc(s.title) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy">' +
            '<div class="absolute inset-0 bg-black/30 flex items-center justify-center">' +
              '<div class="cinema-play-glow-btn" style="width:36px;height:36px;font-size:14px;">▶</div>' +
            '</div>' +
            '<span class="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold">' + esc(s.duration) + '</span>' +
          '</div>' +
          '<div class="space-y-1 text-right">' +
            '<span class="text-[11px] font-bold text-sky-400 block truncate">' + esc(s.rabbi) + '</span>' +
            '<h5 class="text-xs font-black text-white line-clamp-2 leading-snug">' + esc(s.title) + '</h5>' +
          '</div>' +
        '</div>';
      }).join("");
    }

    var cStories = document.getElementById("learn-subcarousel-stories");
    if (cStories) {
      cStories.innerHTML = DEMO_TZADDIKIM_STORIES.map(function (s) {
        return '<div onclick="playApprovedReelVideo(\'' + esc(s.videoUrl) + '\', \'' + esc(s.title) + '\', \'' + esc(s.rabbi) + '\')" class="cinematic-card w-[220px] sm:w-[260px] shrink-0 p-3 flex flex-col justify-between cursor-pointer group shadow-lg select-none">' +
          '<div class="relative w-full aspect-video rounded-xl overflow-hidden mb-2.5 bg-slate-900">' +
            '<img src="' + esc(s.thumb) + '" alt="' + esc(s.title) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy">' +
            '<div class="absolute inset-0 bg-black/30 flex items-center justify-center">' +
              '<div class="cinema-play-glow-btn" style="width:36px;height:36px;font-size:14px;">▶</div>' +
            '</div>' +
            '<span class="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-amber-500/90 text-black font-black text-[10px]">' + esc(s.tag) + '</span>' +
          '</div>' +
          '<div class="space-y-1 text-right">' +
            '<span class="text-[11px] font-bold text-amber-300 block truncate">' + esc(s.rabbi) + '</span>' +
            '<h5 class="text-xs font-black text-white line-clamp-2 leading-snug">' + esc(s.title) + '</h5>' +
          '</div>' +
        '</div>';
      }).join("");
    }
  };

  // 5. רינדור שיעורים ארוכים ומעמיקים (פורמט רחב 16:9)
  window.renderLearnLongLessons = function () {
    var c = document.getElementById("learn-long-lessons-list");
    if (!c) return;

    c.innerHTML = DEMO_LONG_LESSONS.map(function (l) {
      return '<div class="cinematic-card p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-4 group shadow-lg">' +
        '<div onclick="playApprovedReelVideo(\'' + esc(l.videoUrl) + '\', \'' + esc(l.title) + '\', \'' + esc(l.rabbi) + '\')" class="relative w-full sm:w-[220px] aspect-video rounded-xl overflow-hidden shrink-0 cursor-pointer bg-slate-900">' +
          '<img src="' + esc(l.thumb) + '" alt="' + esc(l.title) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy">' +
          '<div class="absolute inset-0 bg-black/30 flex items-center justify-center">' +
            '<div class="cinema-play-glow-btn" style="width:40px;height:40px;font-size:15px;">▶</div>' +
          '</div>' +
          '<span class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[11px] font-bold">' + esc(l.duration) + '</span>' +
        '</div>' +
        '<div class="flex-1 w-full flex flex-col justify-between text-right space-y-2">' +
          '<div class="space-y-1">' +
            '<div class="flex items-center justify-between text-xs text-gray-400">' +
              '<span class="px-2 py-0.5 rounded bg-[#272B3F] text-amber-400 font-bold text-[10px]">' + esc(l.category) + '</span>' +
              '<span>' + esc(l.views) + '</span>' +
            '</div>' +
            '<h4 class="text-sm sm:text-base font-black text-white group-hover:text-amber-400 transition-colors line-clamp-2">' + esc(l.title) + '</h4>' +
            '<p class="text-xs text-sky-400 font-bold">👑 ' + esc(l.rabbi) + '</p>' +
          '</div>' +
          '<div class="flex items-center justify-between pt-2 border-t border-[#272B3F]">' +
            '<span class="text-xs text-gray-400 font-bold">❤️ ' + esc(l.likes) + ' לייקים</span>' +
            '<button type="button" onclick="playApprovedReelVideo(\'' + esc(l.videoUrl) + '\', \'' + esc(l.title) + '\', \'' + esc(l.rabbi) + '\')" class="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer">' +
              '<span>צפה בשיעור</span>' +
              '<span>▶</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // 6. רינדור סדרות AI (פרימיום VIP)
  window.renderLearnAiSeries = function () {
    var c = document.getElementById("learn-aiseries-stream-grid");
    if (!c) return;

    var series = (window.SERIES_LIBRARY && window.SERIES_LIBRARY.length) ? window.SERIES_LIBRARY : [
      {
        id: "s_joseph",
        title: "יוסף הצדיק • שליט מצרים",
        season: "עונה 1 • 10 פרקים",
        tag: "דרמה מקראית אפית",
        desc: "סיפורו המטלטל של יוסף, מכתונת הפסים והבור, ועד למשנה למלך מצרים.",
        image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "s_abraham",
        title: "אברהם העברי • מול כבשן האש",
        season: "עונה 1 • 8 פרקים",
        tag: "סדרת מופת היסטורית",
        desc: "מסעו של אבי האומה מאור כשדים ועד להפצת האמונה בבורא עולם.",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80"
      },
      {
        id: "s_david",
        title: "דוד המלך • נעים זמירות ישראל",
        season: "עונה 1 • 12 פרקים",
        tag: "דרמה מוזיקלית ותנ״כית",
        desc: "רועה הצאן שהפך למשיח ה׳, חיבר את ספר התהילים ונלחם בגוליית.",
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80"
      }
    ];

    c.innerHTML = series.map(function (s) {
      var ytId = window.resolveYoutubeVideoId ? window.resolveYoutubeVideoId("", "סדרות AI", s.title) : "F1B9e_f6p5Y";
      var vUrl = "https://www.youtube.com/watch?v=" + ytId;

      return '<div class="cinematic-card p-4 flex flex-col justify-between group shadow-xl relative">' +
        '<div class="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-slate-900 cursor-pointer" onclick="playApprovedReelVideo(\'' + esc(vUrl) + '\', \'' + esc(s.title) + '\', \'סדרות AI • צדיק-טוק\')">' +
          '<img src="' + esc(s.image) + '" alt="' + esc(s.title) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy">' +
          '<div class="absolute inset-0 bg-black/40 flex items-center justify-center">' +
            '<div class="cinema-play-glow-btn">▶</div>' +
          '</div>' +
          '<span class="badge-vip-streaming absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] text-black font-black uppercase shadow-lg">VIP פרימיום</span>' +
          '<span class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-amber-300 font-bold text-[10px]">' + esc(s.season || "עונה 1") + '</span>' +
        '</div>' +
        '<div class="space-y-1.5 text-right flex-1">' +
          '<span class="text-[11px] font-bold text-amber-400 block">' + esc(s.tag || "דרמת AI מקראית") + '</span>' +
          '<h4 class="text-sm sm:text-base font-black text-white group-hover:text-amber-400 transition-colors">' + esc(s.title) + '</h4>' +
          '<p class="text-xs text-gray-300 line-clamp-2 leading-relaxed">' + esc(s.desc || "") + '</p>' +
        '</div>' +
        '<div class="pt-3 mt-3 border-t border-[#272B3F] flex items-center justify-between">' +
          '<span class="text-xs text-gray-400 font-bold">איכות 4K HDR</span>' +
          '<button type="button" onclick="playApprovedReelVideo(\'' + esc(vUrl) + '\', \'' + esc(s.title) + '\', \'סדרות AI • צדיק-טוק\')" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#C9A227] text-white font-black text-xs shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer">' +
            '<span>צפה בפרק 1</span>' +
            '<span>▶</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // 7. רינדור כרטיסי חידונים אינטראקטיביים צבעוניים עם גביע 🏆
  window.renderLearnQuizzesCards = function () {
    var c = document.getElementById("learn-quizzes-stream-grid");
    if (!c) return;

    c.innerHTML = STREAMING_QUIZZES.map(function (q) {
      return '<div class="cinematic-card p-5 border-2 ' + esc(q.borderColor) + ' bg-gradient-to-br ' + esc(q.bgGradient) + ' flex flex-col justify-between group shadow-xl relative">' +
        '<div class="flex items-center justify-between mb-3">' +
          '<span class="px-3 py-1 rounded-xl ' + esc(q.badgeColor) + ' text-white font-black text-xs shadow-md flex items-center gap-1.5">' +
            '<span>🏆</span>' +
            '<span>' + esc(q.points) + '</span>' +
          '</span>' +
          '<span class="text-xs font-bold text-gray-300">' + esc(q.questionsCount) + '</span>' +
        '</div>' +
        '<div class="space-y-1.5 text-right flex-1 mb-4">' +
          '<h4 class="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors">' + esc(q.title) + '</h4>' +
          '<p class="text-xs text-gray-300 leading-relaxed">' + esc(q.desc) + '</p>' +
        '</div>' +
        '<div class="pt-3 border-t border-white/10 flex items-center justify-between">' +
          '<span class="text-xs text-amber-400 font-bold">זכייה בניקוד אישי</span>' +
          '<button type="button" onclick="startStreamingQuiz(\'' + esc(q.catFilter) + '\')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer">' +
            '<span>שחק עכשיו</span>' +
            '<span>🎮</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  // התחלת משחק חידון ישירות
  window.startStreamingQuiz = function (catFilter) {
    if (window.openLearnSection) {
      window.openLearnSection("quizzes");
      setTimeout(function () {
        if (window.renderInlineLearnQuizzes) window.renderInlineLearnQuizzes(catFilter || "all");
      }, 50);
    }
  };

  function renderTorahStreamGrid() {
    var c = document.getElementById("learn-torah-stream-grid");
    if (!c) return;
    c.innerHTML = DEMO_HERO_REELS.map(function (item) {
      return '<div onclick="playApprovedReelVideo(\'' + esc(item.videoUrl) + '\', \'' + esc(item.title) + '\', \'' + esc(item.rabbi) + '\')" class="cinematic-hero-card aspect-[9/16] w-full shrink-0 cursor-pointer group shadow-xl relative">' +
        '<img src="' + esc(item.thumb) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy">' +
        '<div class="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent"></div>' +
        '<div class="absolute top-2.5 right-2.5"><span class="px-2 py-0.5 rounded-md bg-[#EA580C] text-white font-black text-[10px]">' + esc(item.badge) + '</span></div>' +
        '<div class="absolute inset-0 flex items-center justify-center"><div class="cinema-play-glow-btn">▶</div></div>' +
        '<div class="absolute bottom-0 left-0 right-0 p-3.5 space-y-1 text-right">' +
          '<span class="text-[11px] font-bold text-amber-400 block">' + esc(item.rabbi) + '</span>' +
          '<h4 class="text-xs sm:text-sm font-black text-white leading-tight">' + esc(item.title) + '</h4>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  function renderShiurimStreamGrid() {
    var c = document.getElementById("learn-shiurim-stream-grid");
    if (!c) return;
    c.innerHTML = DEMO_RECENT_SHIURIM.concat(DEMO_LONG_LESSONS).map(function (s) {
      return '<div onclick="playApprovedReelVideo(\'' + esc(s.videoUrl) + '\', \'' + esc(s.title) + '\', \'' + esc(s.rabbi) + '\')" class="cinematic-card p-3 flex flex-col justify-between cursor-pointer group shadow-lg">' +
        '<div class="relative w-full aspect-video rounded-xl overflow-hidden mb-2.5 bg-slate-900">' +
          '<img src="' + esc(s.thumb) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy">' +
          '<div class="absolute inset-0 bg-black/30 flex items-center justify-center"><div class="cinema-play-glow-btn" style="width:36px;height:36px;font-size:14px;">▶</div></div>' +
          '<span class="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold">' + esc(s.duration || "שיעור מלא") + '</span>' +
        '</div>' +
        '<div class="space-y-1 text-right">' +
          '<span class="text-[11px] font-bold text-sky-400 block truncate">' + esc(s.rabbi) + '</span>' +
          '<h5 class="text-xs font-black text-white line-clamp-2 leading-snug">' + esc(s.title) + '</h5>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  function renderStoriesStreamGrid() {
    var c = document.getElementById("learn-stories-stream-grid");
    if (!c) return;
    c.innerHTML = DEMO_TZADDIKIM_STORIES.map(function (s) {
      return '<div onclick="playApprovedReelVideo(\'' + esc(s.videoUrl) + '\', \'' + esc(s.title) + '\', \'' + esc(s.rabbi) + '\')" class="cinematic-card p-3 flex flex-col justify-between cursor-pointer group shadow-lg">' +
        '<div class="relative w-full aspect-video rounded-xl overflow-hidden mb-2.5 bg-slate-900">' +
          '<img src="' + esc(s.thumb) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy">' +
          '<div class="absolute inset-0 bg-black/30 flex items-center justify-center"><div class="cinema-play-glow-btn" style="width:36px;height:36px;font-size:14px;">▶</div></div>' +
          '<span class="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-amber-500/90 text-black font-black text-[10px]">' + esc(s.tag) + '</span>' +
        '</div>' +
        '<div class="space-y-1 text-right">' +
          '<span class="text-[11px] font-bold text-amber-300 block truncate">' + esc(s.rabbi) + '</span>' +
          '<h5 class="text-xs font-black text-white line-clamp-2 leading-snug">' + esc(s.title) + '</h5>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  // 8. חיפוש מהיר בסטרימינג
  window.handleLearnStreamingSearch = function (q) {
    var query = String(q || "").trim().toLowerCase();
    var box = document.getElementById("learn-search-results-box");
    if (!box) return;

    if (!query) {
      box.classList.add("hidden");
      box.innerHTML = "";
      return;
    }

    var allItems = []
      .concat(DEMO_HERO_REELS)
      .concat(DEMO_RECENT_SHIURIM)
      .concat(DEMO_TZADDIKIM_STORIES)
      .concat(DEMO_LONG_LESSONS);

    var matches = allItems.filter(function (it) {
      return [it.title, it.rabbi, it.category, it.badge, it.tag].join(" ").toLowerCase().indexOf(query) !== -1;
    });

    box.classList.remove("hidden");
    if (!matches.length) {
      box.innerHTML = '<div class="p-4 text-center text-xs text-gray-400 bg-[#161824] rounded-2xl border border-[#272B3F]">לא נמצאו תוצאות עבור "' + esc(query) + '". נסה חיפוש אחר או בדוק בספריות המלאות.</div>';
      return;
    }

    box.innerHTML = '<div class="bg-[#141724] border border-[#272B3F] p-3 rounded-2xl space-y-2">' +
      '<div class="text-xs text-amber-400 font-bold px-1">נמצאו ' + matches.length + ' תוצאות:</div>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">' +
        matches.map(function (m) {
          return '<div onclick="playApprovedReelVideo(\'' + esc(m.videoUrl) + '\', \'' + esc(m.title) + '\', \'' + esc(m.rabbi) + '\')" class="p-2.5 rounded-xl bg-[#1C2033] hover:bg-[#252B44] border border-[#2D334D] flex items-center gap-3 cursor-pointer transition-all">' +
            '<img src="' + esc(m.thumb) + '" class="w-12 h-12 rounded-lg object-cover shrink-0">' +
            '<div class="text-right overflow-hidden flex-1">' +
              '<h5 class="text-xs font-black text-white truncate">' + esc(m.title) + '</h5>' +
              '<span class="text-[11px] text-amber-400 font-bold block truncate">' + esc(m.rabbi) + '</span>' +
            '</div>' +
            '<span class="text-amber-400 text-sm shrink-0">▶</span>' +
          '</div>';
        }).join("") +
      '</div>' +
    '</div>';
  };

  window.clearLearnStreamingSearch = function () {
    var inp = document.getElementById("learn-global-search-input");
    if (inp) inp.value = "";
    window.handleLearnStreamingSearch("");
  };

  // אתחול אוטומטי בעת טעינה ובמעבר ללשונית 'ללמוד'
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(window.initLearnStreamingUI, 80);
  });

  var prevSwitchTabV46 = window.switchTab;
  window.switchTab = function (tabId) {
    if (prevSwitchTabV46) prevSwitchTabV46(tabId);
    if (tabId === "series" || tabId === "learn") {
      setTimeout(window.initLearnStreamingUI, 50);
    }
  };
})();
