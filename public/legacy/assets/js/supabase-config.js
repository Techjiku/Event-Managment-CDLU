// ==============================================================================
// CHAUDHARY DEVI LAL UNIVERSITY (CDLU), SIRSA
// 13th TRIVENI YUVA MAHOTSAV 2026 - SUPABASE CLIENT CONFIGURATION
// ==============================================================================

window.SUPABASE_CONFIG = {
    URL: "https://mloifpvurnppsykpjtgc.supabase.co",
    ANON_KEY: "sb_publishable_ncBW2kFh7_wyAzjD1VJB-Q_scSGVmg-",
    FESTIVAL_NAME: "13th Triveni Yuva Mahotsav 2026",
    UNIVERSITY_NAME: "Chaudhary Devi Lal University, Sirsa",
    UNIVERSITY_CODE: "CDLU-TYM-2026"
};

// Initialize the Supabase Client if supabase-js library is loaded
let supabaseClient = null;
try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(
            window.SUPABASE_CONFIG.URL,
            window.SUPABASE_CONFIG.ANON_KEY,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true
                }
            }
        );
        console.log("✓ Supabase Client initialized for CDLU Event Management");
    } else {
        console.warn("Supabase library not yet loaded on window; db-service will retry.");
    }
} catch (e) {
    console.error("Error initializing Supabase client:", e);
}

window.getSupabase = function() {
    if (!supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(
            window.SUPABASE_CONFIG.URL,
            window.SUPABASE_CONFIG.ANON_KEY
        );
    }
    return supabaseClient;
};
