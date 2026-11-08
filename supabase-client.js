/* ==========================================================================
   צדיק-טוק (TzadikTok) - חיבור חי ל-Supabase (supabase-client.js - V29)
   מחובר אוטומטית לפרויקט: https://tmywerelympjvpqnspsc.supabase.co
   ========================================================================== */

window.NEXT_PUBLIC_SUPABASE_URL = "https://tmywerelympjvpqnspsc.supabase.co";
window.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FRh1RR6YT_3tUl1lo9nG1Q_C00EB1P7";

(function() {
  var url = localStorage.getItem("tzadiktok_supabase_url") || window.NEXT_PUBLIC_SUPABASE_URL;
  var key = localStorage.getItem("tzadiktok_supabase_anon_key") || window.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (window.supabase && typeof window.supabase.createClient === "function" && url && key) {
    window.supabaseClient = window.supabase.createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    console.log("צדיק-טוק מחובר ל-Supabase בהצלחה:", url);
  } else {
    window.supabaseClient = null;
  }
})();
