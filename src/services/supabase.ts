import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://jpyltgbimcpuiotqfmot.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweWx0Z2JpbWNwdWlvdHFmbW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzcxNTMsImV4cCI6MjEwMDMxMzE1M30.PhzdVoXUkBlgYAMqedW-3jrs9ua2fFeZoh-iADthAuI";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

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
  console.warn("⚠️ Supabase credentials missing or unconfigured.");
} else {
  console.log("⚡ Supabase connected to:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
