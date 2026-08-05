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

    if (!email || !fullName || !whatsappNumber) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // 1. Create or get user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-10) + "A1!", // random password
      user_metadata: { full_name: fullName },
      email_confirm: true,
    });

    let userId = authData?.user?.id;

    if (authError && (authError.message.includes("already registered") || authError.message.includes("already been registered") || authError.message.includes("already exists"))) {
      // Find the user ID
      const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      if (!usersError && usersData) {
        const existingUser = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (existingUser) {
          userId = existingUser.id;
        }
      }
    } else if (authError) {
      return NextResponse.json(
        { ok: false, message: "Could not register user via admin API.", error: authError.message },
        { status: 500 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Could not resolve user ID for registration." },
        { status: 500 }
      );
    }

    // 2. Insert into course_registrations
    const { error: regError } = await supabaseAdmin
      .from("course_registrations")
      .upsert({
        user_id: userId,
        full_name: fullName,
        email: email,
        whatsapp_number: whatsappNumber,
        course_slug: courseSlug || "algo-trading",
        source: source || "",
        login_provider: "email_password",
      }, { onConflict: "user_id,course_slug" });

    if (regError) {
      return NextResponse.json(
        { ok: false, message: "Could not save registration.", error: regError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Registration successful!" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
