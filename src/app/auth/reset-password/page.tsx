import type { Metadata } from "next";
import { cookies } from "next/headers";
import AlgoTradingCoursePasswordReset from "@/components/course/AlgoTradingCoursePasswordReset";

export const metadata: Metadata = {
  title: "Reset Password | Vyntegra",
  description: "Reset your Vyntegra account password.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordPageContent />;
}

async function ResetPasswordPageContent() {
  const cookieStore = await cookies();
  const hasRecoveryMarker =
    cookieStore.get("vyntegra_password_recovery")?.value === "1";

  return (
    <AlgoTradingCoursePasswordReset
      initialRecoveryAllowed={hasRecoveryMarker}
    />
  );
}
