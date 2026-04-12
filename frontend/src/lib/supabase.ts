import { createClient } from "@supabase/supabase-js";

const url =
  (typeof __APP_SUPABASE_URL__ !== "undefined" && __APP_SUPABASE_URL__) ||
  import.meta.env.VITE_SUPABASE_URL;
const anonKey =
  (typeof __APP_SUPABASE_ANON_KEY__ !== "undefined" &&
    __APP_SUPABASE_ANON_KEY__) ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check frontend/.env",
  );
}

export const supabase = createClient(url, anonKey);
