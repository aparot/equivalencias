import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
  const cookieStore = cookies();
  return createServerClient(supabaseUrl as string, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Parameters<typeof cookieStore.set>[0]) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: Parameters<typeof cookieStore.set>[0]) {
        cookieStore.set({ name, value: "", ...options });
      }
    }
  });
}
