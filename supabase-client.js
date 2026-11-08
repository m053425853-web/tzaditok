/* ==========================================================================
   צדיק-טוק (TzadikTok) - חיבור ל-Supabase (supabase-client.js)
   תומך גם ב-NEXT_PUBLIC_SUPABASE_URL וגם בהגדרה ישירה בדפדפן
   ========================================================================== */

(function() {
  var SUPABASE_URL = (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_SUPABASE_URL)
    || window.NEXT_PUBLIC_SUPABASE_URL
    || localStorage.getItem("tzadiktok_supabase_url")
    || "";

  var SUPABASE_ANON_KEY = (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    || window.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || localStorage.getItem("tzadiktok_supabase_anon_key")
    || "";

  if (window.supabase && typeof window.supabase.createClient === "function" && SUPABASE_URL && SUPABASE_ANON_KEY) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("מחובר ל-Supabase בהצלחה ✔");
  } else {
    window.supabaseClient = null;
  }
})();
