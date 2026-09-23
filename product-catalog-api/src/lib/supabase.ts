import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | undefined;

export function isSupabaseConfigured(): boolean {
  const hasUrl = Boolean(process.env.SUPABASE_URL);
  const hasSecretKey = Boolean(process.env.SUPABASE_SECRET_KEY);

  if (hasUrl !== hasSecretKey) {
    throw new Error(
      "Set both SUPABASE_URL and SUPABASE_SECRET_KEY, or leave both unset.",
    );
  }

  return hasUrl;
}

export function getSupabaseAdminClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY together.",
    );
  }

  cachedClient ??= createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return cachedClient;
}
