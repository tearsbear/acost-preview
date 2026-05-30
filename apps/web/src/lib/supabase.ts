import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase Browser client for use inside React Client Components.
 * Safe for client-side bundle execution.
 * Utilizes static fallbacks during build prerendering to prevent compilation crashes.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  
  return createBrowserClient(url, anonKey);
}
