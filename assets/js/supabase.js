"use strict";

/* ==========================================================
   CONFIGURACIÓN DE SUPABASE
========================================================== */

const SUPABASE_URL =
    "https://pypicgpbqbjcigryakgb.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_PSb1CB9fzGx731oy1Bf0fw_gbGXf9ji";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("✅ Supabase conectado");