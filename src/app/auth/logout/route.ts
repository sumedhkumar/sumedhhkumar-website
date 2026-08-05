import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { algoTradingCourse } from "@/data/algo-trading-course";
import {
  getSupabaseAuthConfig,
  isSupabaseAuthConfigured,
} from "@/lib/supabase/env";
import { getSafeInternalRedirectPath } from "@/lib/supabase/redirects";

export const runtime = "nodejs";

function getLogoutRedirectUrl(request: NextRequest) {
  const nextPath = getSafeInternalRedirectPath(
    request.nextUrl.searchParams.get("next"),
    algoTradingCourse.registerRoute,
  );

  return new URL(nextPath, request.url);
}

function expireSupabaseCookies(request: NextRequest, response: NextResponse) {
  request.cookies
    .getAll()
    .filter(({ name }) => name.startsWith("sb-"))
    .forEach(({ name }) => {
      response.cookies.set(name, "", {
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
      });
    });

  // Clear Vyntegra user cookies
  response.cookies.set("vyn_user_email", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("vyn_user_name", "", {
    maxAge: 0,
    path: "/",
  });
}

async function logout(request: NextRequest) {
  const response = NextResponse.redirect(getLogoutRedirectUrl(request));

  if (!isSupabaseAuthConfigured()) {
    expireSupabaseCookies(request, response);
    return response;
  }

  const { url, anonKey } = getSupabaseAuthConfig();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.signOut();
  expireSupabaseCookies(request, response);

  return response;
}

export async function GET(request: NextRequest) {
  return logout(request);
}

export async function POST(request: NextRequest) {
  return logout(request);
}
