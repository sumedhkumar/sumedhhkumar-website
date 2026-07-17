import type { Metadata } from "next";
import AlgoTradingCourseCampaignLanding from "@/components/course/AlgoTradingCourseCampaignLanding";

export const metadata: Metadata = {
  title: "2 Free Trading Automation Lectures | Vyntegra Masterclass",
  description:
    "Get free access to Lecture 1 and Lecture 2 of Vyntegra's Trading Automation Masterclass. Learn AI-assisted workflows for MT5 and TradingView. No payment required.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "2 Free Trading Automation Lectures | Vyntegra Masterclass",
    description:
      "Get free access to Lecture 1 and Lecture 2 of Vyntegra's Trading Automation Masterclass. Learn AI-assisted workflows for MT5 and TradingView. No payment required.",
    siteName: "Vyntegra",
    type: "website",
  },
};

export default function TradingAutomationMasterclassLandingPage() {
  return <AlgoTradingCourseCampaignLanding />;
}
