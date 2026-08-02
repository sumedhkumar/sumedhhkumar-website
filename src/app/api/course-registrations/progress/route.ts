import { isProductionPersistenceConfigured, serviceUnavailableResponse } from "@/lib/config";
import { updateCourseRegistrationProgress } from "@/lib/server/persistence";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";
import type { User } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProgressRequestBody = {
  courseSlug: string;
  progressState: boolean[];
};

async function getAuthenticatedUser(): Promise<
  { response: Response; user: null } | { response: null; user: User }
> {
  if (!isSupabaseAuthConfigured()) {
    return {
      response: Response.json(
        {
          ok: false,
          message: "Course account access is not configured yet. Set the Supabase Auth environment variables.",
        },
        { status: 503 },
      ),
      user: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      response: Response.json(
        {
          ok: false,
          message: "Please log in.",
        },
        { status: 401 },
      ),
      user: null,
    };
  }

  return { response: null, user };
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();

  if (auth.response) {
    return auth.response;
  }

  if (!isProductionPersistenceConfigured()) {
    return serviceUnavailableResponse();
  }

  try {
    const body = (await request.json()) as ProgressRequestBody;
    const { courseSlug, progressState } = body;

    if (!courseSlug || !Array.isArray(progressState)) {
      return Response.json(
        { ok: false, message: "Invalid request payload." },
        { status: 400 },
      );
    }

    // Basic validation of the progress state array
    const validProgressState = progressState.map((val) => Boolean(val));

    await updateCourseRegistrationProgress(
      auth.user.id,
      courseSlug,
      validProgressState
    );

    return Response.json({ ok: true, message: "Progress updated." });
  } catch (error) {
    console.error("Failed to update progress:", error);
    return Response.json(
      { ok: false, message: "Failed to update progress." },
      { status: 500 },
    );
  }
}
