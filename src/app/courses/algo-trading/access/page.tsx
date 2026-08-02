import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AlgoTradingCourseAccess, {
  AlgoTradingCourseAccessBlocked,
} from "@/components/course/AlgoTradingCourseAccess";
import { algoTradingCourse } from "@/data/algo-trading-course";
import { isProductionPersistenceConfigured } from "@/lib/config";
import {
  getCourseRegistrationByUserId,
  updateCourseRegistrationLastLogin,
} from "@/lib/server/persistence";
import { getSupabaseAuthUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Free Masterclass Access | Vyntegra",
  description:
    "Watch Lecture 1 and Lecture 2 for the Vyntegra Trading Automation Masterclass.",
  robots: {
    index: false,
    follow: false,
  },
};

const courseSlug = algoTradingCourse.slug;
const accessPath = algoTradingCourse.accessRoute;
const registerPath = algoTradingCourse.registerRoute;

function redirectToRegister(searchParams?: Record<string, string>): never {
  const params = new URLSearchParams({
    next: accessPath,
    ...searchParams,
  });

  redirect(`${registerPath}?${params.toString()}`);
}

export default async function AlgoTradingCourseProtectedAccessPage() {
  const user = await getSupabaseAuthUser();

  if (!user) {
    redirectToRegister();
  }

  if (!isProductionPersistenceConfigured()) {
    return <AlgoTradingCourseAccessBlocked />;
  }

  const registration = await getCourseRegistrationByUserId(user.id, courseSlug);

  if (!registration) {
    redirectToRegister({ completeProfile: "1" });
  }

  if (registration.accessStatus === "blocked") {
    return <AlgoTradingCourseAccessBlocked />;
  }

  try {
    await updateCourseRegistrationLastLogin(user.id, courseSlug);
  } catch {
    // Access should not fail if the login timestamp cannot be refreshed.
  }

  return (
    <AlgoTradingCourseAccess
      registrationEmail={registration.email}
      registrationFullName={registration.fullName}
      initialProgress={registration.progressState}
    />
  );
}
