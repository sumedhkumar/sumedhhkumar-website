"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getRequiredSupabaseAuthConfig } from "@/lib/supabase/env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getRequiredSupabaseAuthConfig();

  return createBrowserClient(url, anonKey);
}
