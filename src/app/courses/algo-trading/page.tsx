import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { algoTradingCourse } from "@/data/algo-trading-course";

export const metadata: Metadata = {
  title: "Unlock 2 Free Trading Automation Lectures | Vyntegra",
  description:
    "Get free preview access to Lecture 1 and Lecture 2 of Vyntegra's Trading Automation Masterclass. No payment required.",
  openGraph: {
    title: "Unlock 2 Free Trading Automation Lectures | Vyntegra",
    description:
      "Get free preview access to Lecture 1 and Lecture 2 of Vyntegra's Trading Automation Masterclass. No payment required.",
    siteName: "Vyntegra",
    type: "website",
  },
};

export default function AlgoTradingCoursePage() {
  redirect(algoTradingCourse.route);
}
