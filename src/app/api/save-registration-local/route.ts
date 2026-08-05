import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { ok: false, message: "Missing Supabase admin environment variables." },
      { status: 500 }
    );
  }

  // Create an admin client bypassing RLS
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const body = await request.json();
    const { email, fullName, whatsappNumber, courseSlug, source } = body;

    // Only fullName is required
    if (!fullName) {
      return NextResponse.json(
        { ok: false, message: "Full name is required." },
        { status: 400 }
      );
    }

    let userId: string | undefined;

    // If email is provided, create or find the user
    if (email) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-10) + "A1!", // random password
        user_metadata: { full_name: fullName },
        email_confirm: true,
      });

      userId = authData?.user?.id;

      if (authError && (
        authError.message.includes("already registered") ||
        authError.message.includes("already been registered") ||
        authError.message.includes("already exists")
      )) {
        // Returning user — find existing user ID and allow login
        const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
        if (!usersError && usersData) {
          const existingUser = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
          if (existingUser) {
            userId = existingUser.id;
          }
        }
      } else if (authError) {
        // Non-fatal: continue without a Supabase user ID
        console.warn("Could not create Supabase auth user:", authError.message);
      }
    }

    // If we have a userId, upsert into course_registrations
    if (userId) {
      const { error: regError } = await supabaseAdmin
        .from("course_registrations")
        .upsert({
          user_id: userId,
          full_name: fullName,
          email: email || "",
          whatsapp_number: whatsappNumber || "",
          course_slug: courseSlug || "algo-trading",
          source: source || "",
          login_provider: "email_password",
        }, { onConflict: "user_id,course_slug" });

      if (regError) {
        console.warn("Could not upsert course registration:", regError.message);
        // Non-fatal — still allow access
      }
    } else {
      // No Supabase user — try inserting with just the name (guest registration)
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(-6)}`;
      const { error: regError } = await supabaseAdmin
        .from("course_registrations")
        .insert({
          user_id: guestId,
          full_name: fullName,
          email: email || "",
          whatsapp_number: whatsappNumber || "",
          course_slug: courseSlug || "algo-trading",
          source: source || "",
          login_provider: "email_password",
        });

      if (regError) {
        console.warn("Guest registration insert failed:", regError.message);
        // Still return ok — access is cookie-based
      }
    }

    return NextResponse.json({ ok: true, message: "Registration successful!" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
