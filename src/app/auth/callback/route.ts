import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  courseAuthErrorFallbackPath,
  getSafeInternalRedirectPath,
} from "@/lib/supabase/redirects";

export const runtime = "nodejs";

const passwordRecoveryCookieName = "vyntegra_password_recovery";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeInternalRedirectPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL(courseAuthErrorFallbackPath, requestUrl));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL(courseAuthErrorFallbackPath, requestUrl));
    }

    const response = NextResponse.redirect(new URL(nextPath, requestUrl));

    if (nextPath === "/auth/reset-password") {
      response.cookies.set(passwordRecoveryCookieName, "1", {
        httpOnly: true,
        maxAge: 15 * 60,
        path: "/auth/reset-password",
        sameSite: "lax",
        secure: requestUrl.protocol === "https:",
      });
    }

    return response;
  } catch {
    return NextResponse.redirect(new URL(courseAuthErrorFallbackPath, requestUrl));
  }
}
