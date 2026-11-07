/* ==========================================================================
   צדיק-טוק (TzadikTok Super-App) - מנוע האפליקציה והאינטראקציות (app.js)
   משתמש בפונקציות העזר מתוך utils.js ובמאגרי המידע מתוך data.js
   ========================================================================== */

let currentTab = "feed";
let currentNusach = localStorage.getItem(STORAGE_KEYS.NUSACH) || "mizrach";
let activePrayerKey = "mazon";
let currentNiggunIdx = 0;
let isNiggunPlaying = false;
let restTypeFilter = "all";
let restHechFilter = "all";
let MITZVOT_LIST = getStorageJson(STORAGE_KEYS.CUSTOM_MITZVOT, DEFAULT_MITZVOT_DATA);

function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll(".view-section").forEach((el) => el.classList.remove("active"));
  const target = document.getElementById("view-" + tabId);
  if (target) target.classList.add("active");

  document.querySelectorAll(".pill-btn").forEach((b) => b.classList.remove("active"));
  const activePill = document.getElementById("pill-" + tabId);
  if (activePill) activePill.classList.add("active");

  document.querySelectorAll(".bottom-nav-item").forEach((b) => b.classList.remove("active"));
  const activeBNav = document.getElementById("bnav-" + tabId);
  if (activeBNav) activeBNav.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openSuperDrawer() {
  document.getElementById("modal-super-drawer").classList.remove("hidden");
}

function selectDrawerTab(tabId) {
  closeModal("modal-super-drawer");
  switchTab(tabId);
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

// חיפוש חכם גלובלי
function handleGlobalSearch(e) {
  const q = (document.getElementById("global-search-input").value || "").trim().toLowerCase();
  if (!q) return;
  if (e.key === "Enter") {
    if (q.includes("מקווה") || q.includes("טבילה")) switchTab("mikvaot");
    else if (q.includes("מסעד") || q.includes("אוכל") || q.includes("כשר")) switchTab("restaurants");
    else if (q.includes("גמח") || q.includes("גמ״ח") || q.includes("יד שרה") || q.includes("עזר")) switchTab("gemachim");
    else if (q.includes("חבד") || q.includes("חב״ד") || q.includes("שליח")) switchTab("chabad");
    else if (q.includes("הגרל") || q.includes("קמפיין") || q.includes("תרומ")) switchTab("raffles");
    else if (q.includes("סידור") || q.includes("תפיל") || q.includes("שחרית")) switchTab("siddur");
    else if (q.includes("צדיק") || q.includes("קבר") || q.includes("מירון")) switchTab("tzaddikim");
    else if (q.includes("מניין") || q.includes("מנין")) switchTab("minyanim");
    else if (q.includes("סדר") || q.includes("יוסף") || q.includes("דוד")) switchTab("series");
    else toast('חיפוש מהיר עבור: "' + q + '"');
  }
}

// 1. פיד רילס 9:16 + מגירת פניני רש״י וחז״ל
function renderFeedCards(cards) {
  const container = document.getElementById("feed-cards-container");
  if (!container) return;
  const likesState = getStorageJson(STORAGE_KEYS.LIKES, {});

  container.innerHTML = cards
    .map((item) => {
      const totalLikes = (item.likes + (likesState[item.id] || 0)).toLocaleString();
      return `
      <div class="relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div class="absolute top-0 left-0 right-0 z-20 p-3.5 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">צ</span>
            <div>
              <span class="text-xs font-black text-white flex items-center gap-1">${item.creator} <span class="text-cyan-400 text-[10px]">✔</span></span>
              <span class="text-[10px] text-amber-300 font-medium">${item.chumash}</span>
            </div>
          </div>
          <button onclick="openSeriesEpisodes('${item.seriesId || "s_joseph"}')" class="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black shadow">
            📺 לפרק המלא
          </button>
        </div>

        <div class="relative w-full aspect-[9/14] bg-slate-950 flex items-center justify-center overflow-hidden">
          <img src="${item.image}" alt="${item.title}" class="absolute inset-0 w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/95"></div>

          <button onclick="toast('מנגן סרטון רילס ב-4K (100% כיסוי ראש מלא)')" class="relative z-10 w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-2xl active:scale-95 transition-all">
            ▶
          </button>

          <div class="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-3">
            <button onclick="toggleLike('${item.id}')" class="flex flex-col items-center gap-0.5">
              <div class="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-red-500 text-base">❤️</div>
              <span id="like-count-${item.id}" class="text-[10px] font-bold text-white">${totalLikes}</span>
            </button>
            <button onclick="openRashiDrawer('${item.id}')" class="flex flex-col items-center gap-0.5">
              <div class="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 text-base">📖</div>
              <span class="text-[9px] font-bold text-amber-300">רש״י וחז״ל</span>
            </button>
            <button onclick="toast('הקישור הועתק לשיתוף בוואטסאפ!')" class="flex flex-col items-center gap-0.5">
              <div class="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-white text-base">📤</div>
              <span class="text-[10px] font-bold text-white">שתף</span>
            </button>
          </div>

          <div class="absolute bottom-0 left-0 right-14 z-20 p-4 space-y-1 text-right">
            <h3 class="text-sm font-black text-white">${item.title}</h3>
            <p class="text-[11px] text-amber-200 font-serif line-clamp-2">${item.quote}</p>
            <p class="text-[10px] text-slate-300 line-clamp-1">${item.rashi}</p>
          </div>
        </div>
      </div>
      `;
    })
    .join("");
}

function filterFeedCards(cat) {
  document.querySelectorAll(".feed-tag-btn").forEach((b) => {
    b.className = "feed-tag-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 shrink-0";
  });
  const ev = (typeof window !== "undefined" && window.event) || (typeof event !== "undefined" ? event : null);
  if (ev && ev.target) {
    ev.target.className = "feed-tag-btn active px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shrink-0";
  }
  if (cat === "all") renderFeedCards(REEL_FEED);
  else renderFeedCards(REEL_FEED.filter((i) => i.category === cat));
}

function toggleLike(id) {
  const likesState = getStorageJson(STORAGE_KEYS.LIKES, {});
  likesState[id] = (likesState[id] || 0) + 1;
  setStorageJson(STORAGE_KEYS.LIKES, likesState);
  renderFeedCards(REEL_FEED);
  toast("אהבת את הפרק! ❤️");
}

function openRashiDrawer(id) {
  const item = REEL_FEED.find((i) => i.id === id) || REEL_FEED[0];
  document.getElementById("rashi-drawer-title").textContent = item.title;
  document.getElementById("rashi-text-content").textContent = item.rashi;
  document.getElementById("midrash-text-content").textContent = item.midrash;
  document.getElementById("pasuk-text-content").textContent = item.quote;
  document.getElementById("modal-rashi-drawer").classList.remove("hidden");
}

function switchRashiTab(t) {
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
}

// 2. ספריית 9 סדרות ההיסטוריה
function renderSeries(seriesList) {
  const c = document.getElementById("series-grid-container");
  if (!c) return;
  c.innerHTML = seriesList
    .map(
      (s) => `
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
    `
    )
    .join("");
}

function openSeriesEpisodes(seriesId) {
  const s = SERIES_LIBRARY.find((i) => i.id === seriesId) || SERIES_LIBRARY[0];
  document.getElementById("episodes-series-title").textContent = s.title;
  document.getElementById("episodes-series-status").textContent = s.season;
  const list = document.getElementById("episodes-list-container");
  if (s.episodes) {
    list.innerHTML = s.episodes
      .map(
        (ep) => `
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
      `
      )
      .join("");
  }
  document.getElementById("modal-episodes").classList.remove("hidden");
}

// 3. חנות יודאיקה ומרקטפלייס
function renderJudaica(products) {
  const c = document.getElementById("judaica-grid-container");
  if (!c) return;
  c.innerHTML = products
    .map(
      (p) => `
      <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-500/40 transition-all">
        <div class="relative h-44 w-full bg-slate-950 overflow-hidden">
          <img src="${p.image}" class="w-full h-full object-cover">
          <span class="absolute top-3 right-3 px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">${p.badge}</span>
          <span class="absolute bottom-3 left-3 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-black text-amber-400">${formatPriceILS(p.price)}</span>
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
    `
    )
    .join("");
}

function filterJudaica(cat) {
  document.querySelectorAll(".judaica-cat-btn").forEach((b) => {
    b.className = "judaica-cat-btn px-4 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 shrink-0";
  });
  const ev = (typeof window !== "undefined" && window.event) || (typeof event !== "undefined" ? event : null);
  if (ev && ev.target) {
    ev.target.className = "judaica-cat-btn active px-4 py-1.5 rounded-xl font-bold bg-amber-500 text-slate-950 shrink-0";
  }
  if (cat === "all") renderJudaica(JUDAICA_PRODUCTS);
  else renderJudaica(JUDAICA_PRODUCTS.filter((p) => p.category === cat));
}

function addToCart(id) {
  const cart = getStorageJson(STORAGE_KEYS.CART, {});
  cart[id] = (cart[id] || 0) + 1;
  setStorageJson(STORAGE_KEYS.CART, cart);
  updateCartBadge();
  toast("המוצר נוסף לעגלת הקניות! 🛒");
}

function updateCartBadge() {
  const cart = getStorageJson(STORAGE_KEYS.CART, {});
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const b1 = document.getElementById("cart-badge");
  const b2 = document.getElementById("judaica-cart-count");
  if (b1) b1.textContent = count;
  if (b2) b2.textContent = count;
}

function openCartModal() {
  const cart = getStorageJson(STORAGE_KEYS.CART, {});
  const list = document.getElementById("cart-items-list");
  let total = 0;
  const entries = Object.entries(cart);
  if (entries.length === 0) {
    list.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">עגלת הקניות ריקה כרגע.</p>`;
  } else {
    list.innerHTML = entries
      .map(([id, qty]) => {
        const p = JUDAICA_PRODUCTS.find((i) => i.id === id);
        if (!p) return "";
        const sub = p.price * qty;
        total += sub;
        return `
          <div class="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <div>
              <h4 class="font-bold text-white">${p.name}</h4>
              <span class="text-amber-400">₪${p.price} × ${qty} = ${formatPriceILS(sub)}</span>
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
  document.getElementById("cart-total-price").textContent = formatPriceILS(total);
  document.getElementById("modal-cart").classList.remove("hidden");
}

function changeCartQty(id, delta) {
  const cart = getStorageJson(STORAGE_KEYS.CART, {});
  const next = (cart[id] || 0) + delta;
  if (next <= 0) delete cart[id];
  else cart[id] = next;
  setStorageJson(STORAGE_KEYS.CART, cart);
  updateCartBadge();
  openCartModal();
}

function sendWhatsAppOrder() {
  const cart = getStorageJson(STORAGE_KEYS.CART, {});
  const entries = Object.entries(cart);
  if (entries.length === 0) return toast("העגלה ריקה");
  let lines = ["שלום צדיק-טוק! הזמנה חדשה מהמרקטפלייס:"];
  let total = 0;
  entries.forEach(([id, qty]) => {
    const p = JUDAICA_PRODUCTS.find((i) => i.id === id);
    if (p) {
      lines.push(`• ${p.name} (כמות: ${qty}) - ₪${p.price * qty}`);
      total += p.price * qty;
    }
  });
  lines.push(`סך הכל לתשלום: ₪${total}`);
  window.open(buildWhatsAppUrl("972500000000", lines.join(" - ")), "_blank");
}

function buyNowWhatsApp(id) {
  const p = JUDAICA_PRODUCTS.find((i) => i.id === id);
  if (!p) return;
  window.open(buildWhatsAppUrl("972500000000", "שלום, מעוניין להזמין: " + p.name), "_blank");
}

// 4. סידור תפילה רב-נוסחי (4 נוסחים)
function setNusach(n) {
  currentNusach = n;
  localStorage.setItem(STORAGE_KEYS.NUSACH, n);
  ["mizrach", "ashkenaz", "sefarad", "teiman"].forEach((k) => {
    const b = document.getElementById("nusach-" + k);
    if (b) {
      b.className =
        k === n
          ? "px-2.5 py-1 rounded-lg font-bold bg-amber-500 text-slate-950"
          : "px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white";
    }
  });
  loadPrayer(activePrayerKey);
}

function selectPrayer(k) {
  activePrayerKey = k;
  document.querySelectorAll(".prayer-nav-btn").forEach((b) => {
    b.className = "prayer-nav-btn px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 shrink-0";
  });
  const b = document.getElementById("ptab-" + k);
  if (b) b.className = "prayer-nav-btn active px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shrink-0";
  loadPrayer(k);
}

function loadPrayer(k) {
  const p = PRAYERS_DATA[k];
  if (!p) return;
  document.getElementById("prayer-display-title").textContent = p.title;
  const body = (p.texts && p.texts[currentNusach]) || p.text || (p.texts && p.texts["mizrach"]) || "";
  document.getElementById("prayer-display-body").innerHTML = body;
  const link = document.getElementById("prayer-sefaria-link");
  if (link && p.sefaria) link.href = p.sefaria;
}

// 5. קברי צדיקים (22 אתרים) + שימוש ב-buildWazeUrl מתוך utils.js
function renderTzaddikim(list) {
  const c = document.getElementById("tzaddikim-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(
      (t) => `
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
            <a href="${buildWazeUrl(t.waze)}" target="_blank" class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold text-center">🚗 Waze</a>
            <button onclick="openCandleModal('${t.name}')" class="flex-1 py-2 bg-amber-500 text-slate-950 font-black rounded-xl">🕯️ הדלק נר</button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

function filterTzaddikim(reg) {
  document.querySelectorAll(".tz-region-btn").forEach((b) => {
    b.className = "tz-region-btn px-4 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 shrink-0";
  });
  const ev = (typeof window !== "undefined" && window.event) || (typeof event !== "undefined" ? event : null);
  if (ev && ev.target) {
    ev.target.className = "tz-region-btn active px-4 py-1.5 rounded-xl font-bold bg-amber-500 text-slate-950 shrink-0";
  }
  if (reg === "all") renderTzaddikim(TZADDIKIM_DATA);
  else renderTzaddikim(TZADDIKIM_DATA.filter((t) => t.region === reg));
}

function openCandleModal(name) {
  document.getElementById("candle-tzaddik-name").textContent = name + " זיע״א";
  document.getElementById("modal-candle").classList.remove("hidden");
}

function confirmLightCandle() {
  const name = document.getElementById("candle-user-name").value.trim() || "ישראל";
  closeModal("modal-candle");
  toast(`נר וירטואלי הודלק לעילוי נשמת הצדיק עבור ${name}! 🕯️`);
}

// 6. מקוואות טהרה
function renderMikvaot(list) {
  const c = document.getElementById("mikvaot-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(
      (m) => `
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
          <a href="${buildTelUrl(m.phone)}" class="flex-1 py-2 bg-slate-800 text-white font-bold rounded-xl text-center">📞 ${m.phone}</a>
          <a href="${buildWazeUrl(m.waze)}" target="_blank" class="flex-1 py-2 bg-blue-600 text-white font-bold rounded-xl text-center">🚗 Waze</a>
          <a href="${buildWhatsAppUrl(m.whatsapp, "שלום, מה שעות הטבילה היום?")}" target="_blank" class="p-2 bg-emerald-600 text-white font-bold rounded-xl">💬</a>
        </div>
      </div>
    `
    )
    .join("");
}

function filterMikvaot(t) {
  document.querySelectorAll(".mikvah-filter-btn").forEach((b) => {
    b.className = "mikvah-filter-btn px-4 py-2 rounded-xl font-bold bg-slate-800 text-slate-300 shrink-0";
  });
  const ev = (typeof window !== "undefined" && window.event) || (typeof event !== "undefined" ? event : null);
  if (ev && ev.target) {
    ev.target.className = "mikvah-filter-btn active px-4 py-2 rounded-xl font-bold bg-blue-500 text-slate-950 shrink-0";
  }
  if (t === "all") renderMikvaot(MIKVAOT_DATA);
  else if (t === "open") renderMikvaot(MIKVAOT_DATA.filter((m) => m.isOpen));
  else renderMikvaot(MIKVAOT_DATA.filter((m) => m.category === t));
}

// 7. מסעדות כשרות בסביבה
function renderRestaurants(list) {
  const c = document.getElementById("restaurants-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(
      (r) => `
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
            <a href="${buildWazeUrl(r.waze)}" target="_blank" class="flex-1 py-2 bg-slate-800 text-blue-400 font-bold rounded-xl text-center">🚗 Waze</a>
            <a href="${buildGoogleMapsUrl(r.name, r.city)}" target="_blank" class="flex-1 py-2 bg-slate-800 text-emerald-400 font-bold rounded-xl text-center">🗺️ מפות</a>
          </div>
          <a href="https://www.google.com/search?q=${encodeURIComponent(r.name + " " + r.city + " כשר בסביבה")}" target="_blank" class="block w-full py-2 bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-center">
            🔍 פתח בכשר בסביבה
          </a>
        </div>
      </div>
    `
    )
    .join("");
}

function applyRestaurantFilters() {
  const q = (document.getElementById("rest-search-input").value || "").trim().toLowerCase();
  let res = RESTAURANTS_DATA;
  if (q) res = res.filter((r) => r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q));
  if (restTypeFilter !== "all") res = res.filter((r) => r.type === restTypeFilter);
  if (restHechFilter !== "all") res = res.filter((r) => r.hechsher.includes(restHechFilter));
  renderRestaurants(res);
}

function filterRestType(t) {
  restTypeFilter = t;
  document.querySelectorAll(".rest-type-btn").forEach((b) => {
    b.className = "rest-type-btn px-3 py-1 rounded-lg bg-slate-800 text-slate-300 shrink-0";
  });
  const ev = (typeof window !== "undefined" && window.event) || (typeof event !== "undefined" ? event : null);
  if (ev && ev.target) {
    ev.target.className = "rest-type-btn active px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold shrink-0";
  }
  applyRestaurantFilters();
}

function filterRestHechsher(h) {
  restHechFilter = h;
  document.querySelectorAll(".rest-hech-btn").forEach((b) => {
    b.className = "rest-hech-btn px-3 py-1 rounded-lg bg-slate-800 text-slate-300 shrink-0";
  });
  const ev = (typeof window !== "undefined" && window.event) || (typeof event !== "undefined" ? event : null);
  if (ev && ev.target) {
    ev.target.className = "rest-hech-btn active px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold shrink-0";
  }
  applyRestaurantFilters();
}

// 8. גמ״חים וחסד
function renderGemachim(list) {
  const c = document.getElementById("gemachim-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(
      (g) => `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between">
        <div>
          <span class="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-[10px] font-bold">${g.category}</span>
          <h3 class="text-base font-black text-white mt-2">${g.name}</h3>
          <p class="text-xs text-amber-300 mt-1">📍 ${g.city}</p>
          <p class="text-xs text-slate-300 leading-relaxed mt-1.5">${g.desc}</p>
        </div>
        <div class="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs">
          <a href="${buildTelUrl(g.phone)}" class="flex-1 py-2 bg-cyan-500 text-slate-950 font-black rounded-xl text-center">📞 חייג: ${g.phone}</a>
          <a href="${buildWazeUrl(g.waze)}" target="_blank" class="px-4 py-2 bg-slate-800 text-slate-200 font-bold rounded-xl">🚗 Waze</a>
        </div>
      </div>
    `
    )
    .join("");
}

// 9. בתי חב״ד בעולם
function renderChabad(list) {
  const c = document.getElementById("chabad-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(
      (ch) => `
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between">
        <div>
          <span class="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold">שליח הרבי: ${ch.shaliach}</span>
          <h3 class="text-base font-black text-white mt-2">${ch.name}</h3>
          <p class="text-xs text-slate-400 mt-1">📍 ${ch.address} (${ch.city})</p>
          <p class="text-xs text-slate-300 mt-2">${ch.services}</p>
        </div>
        <div class="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs">
          <a href="${buildWhatsAppUrl(ch.whatsapp, "שלום וברכה לבית חב״ד!")}" target="_blank" class="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl text-center">💬 וואטסאפ לבית חב״ד</a>
          <a href="${buildWazeUrl(ch.waze)}" target="_blank" class="flex-1 py-2 bg-slate-800 text-amber-300 font-bold rounded-xl text-center">🚗 Waze</a>
        </div>
      </div>
    `
    )
    .join("");
}

// 10. מניינים חיים
function renderMinyanim(list) {
  const c = document.getElementById("minyanim-container");
  if (!c) return;
  c.innerHTML = list
    .map(
      (m) => `
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
          <a href="${buildWazeUrl(m.waze)}" target="_blank" class="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl">🚗 Waze</a>
        </div>
      </div>
    `
    )
    .join("");
}

function triggerMinyanAlert() {
  toast("📢 התראת 'קריאת מניין' נשלחה לכל המשתמשים ברדיוס 500 מטר להשלמת עשירי!");
}

// 12. הגרלות, קמפיינים וספר הפרנסים
function renderRaffles(list) {
  const c = document.getElementById("raffles-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(
      (rf) => `
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
              .map(
                (p) =>
                  `<button onclick="toast('נרכש כרטיס הגרלה בסך ₪${p} בהצלחה! 🎟️')" class="py-1.5 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 rounded-lg font-bold text-amber-300 transition-colors">₪${p}</button>`
              )
              .join("")}
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderCampaigns(list) {
  const c = document.getElementById("campaigns-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map((cp) => {
      const pct = Math.min(100, Math.round((cp.raised / cp.target) * 100));
      return `
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 flex flex-col justify-between">
          <div>
            <span class="text-[10px] text-amber-400 font-bold">${cp.tag}</span>
            <h3 class="text-base font-black text-white mt-1">${cp.title}</h3>
            <p class="text-xs text-slate-300 mt-1">${cp.desc}</p>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-xs font-bold">
              <span class="text-amber-400">${formatPriceILS(cp.raised)}</span>
              <span class="text-slate-400">יעד: ${formatPriceILS(cp.target)} (${pct}%)</span>
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
}

function renderDonorsBook(list) {
  const c = document.getElementById("donors-book-container");
  if (!c) return;
  c.innerHTML = list
    .map(
      (d) => `
      <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
        <div>
          <span class="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">${d.tier}</span>
          <h4 class="font-black text-white mt-1">${d.name}</h4>
          <p class="text-[11px] text-slate-400">${d.dedication}</p>
        </div>
        <span class="text-sm font-black text-amber-400">${d.amount}</span>
      </div>
    `
    )
    .join("");
}

// 13-15. זמני היום, חשבון נפש, רבנים, מנהגים ושירותים
function renderZmanim() {
  const g = document.getElementById("zmanim-grid");
  if (!g) return;
  const tms = [
    { n: "הנץ החמה", t: "06:07" },
    { n: "סוף זמן שמע", t: "08:37" },
    { n: "חצות היום", t: "12:20" },
    { n: "מנחה גדולה", t: "12:50" },
    { n: "שקיעת החמה", t: "16:50" },
    { n: "צאת הכוכבים", t: "17:15" }
  ];
  g.innerHTML = tms
    .map(
      (t) => `
      <div class="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
        <span class="text-[10px] text-slate-400 block">${t.n}</span>
        <span class="text-sm font-black text-amber-400 font-mono mt-1 block">${t.t}</span>
      </div>
    `
    )
    .join("");
}

function renderCheshbon() {
  const c = document.getElementById("cheshbon-container");
  if (!c) return;
  c.innerHTML = MITZVOT_LIST.map(
    (m) => `
      <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <input type="checkbox" ${m.done ? "checked" : ""} onchange="toggleMitzvah('${m.id}')" class="w-4 h-4 accent-amber-500 rounded">
          <span class="text-white font-bold">${m.title}</span>
        </div>
        <span class="text-[10px] text-amber-400 font-mono">${m.time || "יומי"}</span>
      </div>
    `
  ).join("");
}

function toggleMitzvah(id) {
  const item = MITZVOT_LIST.find((i) => i.id === id);
  if (item) item.done = !item.done;
  setStorageJson(STORAGE_KEYS.CUSTOM_MITZVOT, MITZVOT_LIST);
  renderCheshbon();
  toast("חשבון הנפש היומי עודכן!");
}

function openAddMitzvahModal() {
  document.getElementById("modal-add-mitzvah").classList.remove("hidden");
}

function saveNewMitzvah() {
  const val = document.getElementById("new-mitzvah-title").value.trim();
  if (!val) return;
  MITZVOT_LIST.push({ id: "m_" + Date.now(), title: val, done: false, time: "אישי" });
  setStorageJson(STORAGE_KEYS.CUSTOM_MITZVOT, MITZVOT_LIST);
  renderCheshbon();
  closeModal("modal-add-mitzvah");
  toast("יעד מצווה אישי נוסף!");
}

function renderRabbis(list) {
  const c = document.getElementById("rabbis-container");
  if (!c) return;
  c.innerHTML = list
    .map(
      (r) => `
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
        <span class="text-amber-400 font-bold">${r.role}</span>
        <h4 class="font-black text-white text-sm">${r.name}</h4>
        <p class="text-slate-400">${r.city} • ${r.desc}</p>
        <a href="${buildTelUrl(r.phone)}" class="block mt-2 py-1.5 bg-slate-800 text-amber-300 font-bold rounded-xl text-center">📞 חייג לבית ההוראה: ${r.phone}</a>
      </div>
    `
    )
    .join("");
}

function renderCustoms(list) {
  const c = document.getElementById("customs-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(
      (item) => `
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1.5">
        <h3 class="text-sm font-black text-amber-400">${item.name}</h3>
        <p class="text-xs text-slate-300">${item.desc}</p>
      </div>
    `
    )
    .join("");
}

function renderServices(list) {
  const c = document.getElementById("services-grid-container");
  if (!c) return;
  c.innerHTML = list
    .map(
      (s) => `
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center space-y-2 flex flex-col justify-between">
        <div>
          <span class="text-2xl">${s.icon}</span>
          <h4 class="text-xs font-black text-white mt-1">${s.title}</h4>
          <p class="text-[11px] text-slate-400 mt-0.5">${s.desc}</p>
        </div>
        <button onclick="toast('בקשת הזמנת שירות נשלחה!')" class="w-full py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs">הזמן עכשיו</button>
      </div>
    `
    )
    .join("");
}

// נגן ניגונים צף
function toggleNiggunPlayer() {
  isNiggunPlaying = !isNiggunPlaying;
  const btn = document.getElementById("niggun-play-btn");
  const st = document.getElementById("niggun-status");
  if (isNiggunPlaying) {
    btn.textContent = "⏸";
    st.textContent = "מנגן כעת בקדושה...";
    toast("נגן הניגונים הופעל 🎵");
  } else {
    btn.textContent = "🎵";
    st.textContent = "מושהה";
  }
}

function nextNiggunTrack() {
  currentNiggunIdx = (currentNiggunIdx + 1) % NIGGUNIM_DATA.length;
  const tr = NIGGUNIM_DATA[currentNiggunIdx];
  document.getElementById("niggun-title").textContent = tr.title;
  document.getElementById("niggun-status").textContent = tr.artist + " • " + tr.duration;
  toast(`עבר לניגון: ${tr.title}`);
}

// סטודיו AI ומודאלים
function openAiStudioModal() {
  const sel = document.getElementById("ai-studio-voice");
  if (sel) {
    sel.innerHTML = VOICES_DATA.map((v) => `<option value="${v.id}">${v.name} - ${v.desc}</option>`).join("");
  }
  document.getElementById("modal-ai-studio").classList.remove("hidden");
}

function generateUserAiMovie() {
  closeModal("modal-ai-studio");
  toast("🎬 הסרטון שלך מופק כעת ב-AI עם כיסוי ראש מלא ויישלח לאישור!");
}

function openDonateModal() {
  document.getElementById("modal-donate").classList.remove("hidden");
}

function confirmDonateWithTicker() {
  const ded = document.getElementById("donate-dedication-input").value.trim() || "לזכות כלל ישראל";
  const ticker = document.getElementById("ticker-text");
  if (ticker) {
    ticker.textContent = `✨ תרומה חדשה התקבלה כעת: ${ded} • ` + ticker.textContent;
  }
  closeModal("modal-donate");
  toast("תודה! הקדשתך נוספה לרצועת התורמים החיה ולספר הפרנסים ❤️");
}

function openSubscriptionModal() {
  document.getElementById("modal-sub").classList.remove("hidden");
}

function openAdminModal() {
  document.getElementById("modal-admin").classList.remove("hidden");
}

function toggleShabbatOverlay(show) {
  const el = document.getElementById("shabbat-overlay");
  if (show) el.classList.remove("hidden");
  else el.classList.add("hidden");
}

function adjustGlobalFontSize() {
  const cur = document.body.style.fontSize;
  document.body.style.fontSize = cur === "19px" ? "16px" : "19px";
  toast("גודל הגופן הותאם");
}

// אתחול האפליקציה בטעינת העמוד
window.addEventListener("DOMContentLoaded", () => {
  updateTodayDate();
  renderFeedCards(REEL_FEED);
  renderSeries(SERIES_LIBRARY);
  renderJudaica(JUDAICA_PRODUCTS);
  setNusach(currentNusach);
  renderTzaddikim(TZADDIKIM_DATA);
  renderMikvaot(MIKVAOT_DATA);
  renderRestaurants(RESTAURANTS_DATA);
  renderGemachim(GEMACHIM_DATA);
  renderChabad(CHABAD_DATA);
  renderMinyanim(MINYANIM_DATA);
  renderRaffles(RAFFLES_DATA);
  renderCampaigns(CAMPAIGNS_DATA);
  renderDonorsBook(DONORS_DATA);
  renderZmanim();
  renderCheshbon();
  renderRabbis(RABBIS_DATA);
  renderCustoms(CUSTOMS_DATA);
  renderServices(SERVICES_DATA);
  updateCartBadge();
});
