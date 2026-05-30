import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Supabase Server client for use inside Next.js Route Handlers, 
 * Server Actions, and Server Components.
 * Utilizes static fallbacks during build prerendering to prevent compilation crashes.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  
  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Fallback for Read-Only Server Components
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            // Fallback for Read-Only Server Components
          }
        },
      },
    }
  );
}

/**
 * Supabase Admin client utilizing service role credentials.
 * CRITICAL: Use only in server-side ingestion or critical tasks where RLS bypass is mandatory.
 * Utilizes static fallbacks during build prerendering to prevent compilation crashes.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key";
  
  return createClient(url, serviceRoleKey);
}
