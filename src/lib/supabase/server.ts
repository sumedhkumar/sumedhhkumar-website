import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getRequiredSupabaseAuthConfig,
  isSupabaseAuthConfigured,
} from "@/lib/supabase/env";

export async function createSupabaseServerClient() {
  const { url, anonKey } = getRequiredSupabaseAuthConfig();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        } catch {
          // Server Components cannot always set cookies. Middleware refreshes
          // auth cookies for normal requests.
        }
      },
    },
  });
}

export async function getSupabaseAuthUser() {
  if (!isSupabaseAuthConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
