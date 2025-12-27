import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./config/env";

/**
 * Step 8 Micro-test: Lazy initialization
 * 
 * Testing: Does accessing env.getters at module load time cause the error?
 * Solution: Create client lazily (only when first accessed)
 */

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    // Access env.getters here (when actually needed), not at module load
    supabaseInstance = createClient(
      env.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      env.supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseInstance;
}

// Create proxy for lazy initialization
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
  has(_target, prop) {
    return prop in getSupabaseClient();
  },
  ownKeys() {
    return Reflect.ownKeys(getSupabaseClient());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Reflect.getOwnPropertyDescriptor(getSupabaseClient(), prop);
  },
}) as SupabaseClient;
