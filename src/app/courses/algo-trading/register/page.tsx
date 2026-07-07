import type { Metadata } from "next";
import AlgoTradingCourseRegister from "@/components/course/AlgoTradingCourseRegister";

export const metadata: Metadata = {
  title: "Register | Vyntegra Trading Automation Masterclass",
  description:
    "Create a Vyntegra course account to unlock Lecture 1 and Lecture 2 of the Trading Automation Masterclass.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Register | Vyntegra Trading Automation Masterclass",
    description:
      "Create a Vyntegra course account to unlock Lecture 1 and Lecture 2.",
    siteName: "Vyntegra",
    type: "website",
  },
};

type RegisterPageProps = {
  searchParams?: Promise<{
    mode?: string | string[];
  }>;
};

export default async function AlgoTradingCourseRegisterPage({
  searchParams,
}: RegisterPageProps) {
  const resolvedSearchParams = await searchParams;
  const mode = resolvedSearchParams?.mode === "login" ? "login" : "signup";

  return <AlgoTradingCourseRegister initialMode={mode} />;
}
