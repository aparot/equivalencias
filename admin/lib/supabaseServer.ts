import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function isValidHttpUrl(value?: string) {
  return Boolean(value && (value.startsWith("http://") || value.startsWith("https://")));
}

export function getServerSupabase() {
  if (!isValidHttpUrl(supabaseUrl) || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl as string, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
