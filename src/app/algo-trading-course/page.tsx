import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { algoTradingCourse } from "@/data/algo-trading-course";

export const metadata: Metadata = {
  title: "Vyntegra Trading Automation Masterclass | Vyntegra",
};

export default function LegacyAlgoTradingCoursePage() {
  redirect(algoTradingCourse.route);
}
