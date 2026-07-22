import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes("placeholder") || supabaseUrl.includes("your-project")) return false;
  try {
    const parsed = new URL(supabaseUrl);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

if (!isSupabaseConfigured()) {
  console.warn("⚠️ Supabase credentials missing or unconfigured. App running in local fallback mode.");
}

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : "https://demo.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "demo-anon-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
