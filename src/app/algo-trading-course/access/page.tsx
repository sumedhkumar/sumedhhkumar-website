import type { Metadata } from "next";
import AlgoTradingCourseAccess from "@/components/course/AlgoTradingCourseAccess";

export const metadata: Metadata = {
  title: "Free Masterclass Access | Vyntegra",
  description:
    "Watch the free intro, Lecture 0 and Lecture 1 for the Vyntegra Trading Automation Masterclass.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Free Masterclass Access | Vyntegra",
    description:
      "Watch the free intro, Lecture 0 and Lecture 1 for the Vyntegra Trading Automation Masterclass.",
    siteName: "Vyntegra",
    type: "website",
  },
};

export default function AlgoTradingCourseAccessPage() {
  return <AlgoTradingCourseAccess />;
}
