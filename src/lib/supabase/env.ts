export const supabaseAuthConfigurationMessage =
  "Supabase Auth is not configured correctly. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. NEXT_PUBLIC_SUPABASE_URL must be the full URL: https://<project-ref>.supabase.co.";

function isValidSupabaseUrl(value: string) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);

    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname === "/" &&
      !parsed.search &&
      !parsed.hash
    );
  } catch {
    return false;
  }
}

export function getSupabaseAuthConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

export function isSupabaseAuthConfigured() {
  const { url, anonKey } = getSupabaseAuthConfig();
  return Boolean(isValidSupabaseUrl(url) && anonKey);
}

export function getRequiredSupabaseAuthConfig() {
  const config = getSupabaseAuthConfig();

  if (!isValidSupabaseUrl(config.url) || !config.anonKey) {
    throw new Error(supabaseAuthConfigurationMessage);
  }

  return config;
}
