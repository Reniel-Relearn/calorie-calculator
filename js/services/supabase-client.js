import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "../config/environment.js";

let browserClient = null;

export function getSupabaseBrowserClient(environment = import.meta.env) {
  if (browserClient) return browserClient;

  const { supabaseUrl, supabasePublishableKey } =
    getPublicSupabaseConfig(environment);

  browserClient = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
