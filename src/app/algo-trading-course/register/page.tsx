import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { algoTradingCourse } from "@/data/algo-trading-course";

export const metadata: Metadata = {
  title: "Register | Vyntegra",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LegacyAlgoTradingCourseRegisterPage() {
  redirect(algoTradingCourse.registerRoute);
}
