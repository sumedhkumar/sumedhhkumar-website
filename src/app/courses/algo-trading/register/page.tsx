import type { Metadata } from "next";
import AlgoTradingCourseRegister from "@/components/course/AlgoTradingCourseRegister";

export const metadata: Metadata = {
  title: "Register | Vyntegra Trading Automation Masterclass",
  description:
    "Create a Vyntegra course account to continue to the free course preview for the Trading Automation Masterclass.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Register | Vyntegra Trading Automation Masterclass",
    description:
      "Create a Vyntegra course account to continue to the free course preview.",
    siteName: "Vyntegra",
    type: "website",
  },
};

export default function AlgoTradingCourseRegisterPage() {
  return <AlgoTradingCourseRegister />;
}
