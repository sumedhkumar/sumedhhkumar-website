import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { algoTradingCourse } from "@/data/algo-trading-course";

export const metadata: Metadata = {
  title: "Free Masterclass Access | Vyntegra",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LegacyAlgoTradingCourseAccessPage() {
  redirect(algoTradingCourse.accessRoute);
}
