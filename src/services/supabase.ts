import { createClient } from "@supabase/supabase-js";

const requiredKeys = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"] as const;

const missing = requiredKeys.filter((key) => !import.meta.env[key]);

if (missing.length) {
  throw new Error(`Missing Supabase environment variables: ${missing.join(", ")}`);
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
