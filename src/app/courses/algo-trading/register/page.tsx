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

export default function AlgoTradingCourseRegisterPage() {
  return <AlgoTradingCourseRegister />;
}
