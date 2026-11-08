

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
      lat: Number(r.lat) || 32.084, lng: Number(r.lng) || 34.8352
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
      description: S(r.description), desc: S(r.description)
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
      lat: Number(r.lat) || 32.98, lng: Number(r.lng) || 35.44
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
  var prevRenderShiurim = window.renderRabbiShiurimList;
  window.renderRabbiShiurimList = function (q) {
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

  window.updateAuthHeaderBadge = function () {
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
  var prevUpload = window.uploadNewRabbiShiur;   // הגרסה הישנה (V28) נשארת כגיבוי כשאין חיבור
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
  var prevAddChavruta = window.addNewChavrutaOffer;
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
