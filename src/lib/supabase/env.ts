const missingSupabaseAuthMessage =
  "Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";

export function getSupabaseAuthConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

export function isSupabaseAuthConfigured() {
  const { url, anonKey } = getSupabaseAuthConfig();
  return Boolean(url && anonKey);
}

export function getRequiredSupabaseAuthConfig() {
  const config = getSupabaseAuthConfig();

  if (!config.url || !config.anonKey) {
    throw new Error(missingSupabaseAuthMessage);
  }

  return config;
}
