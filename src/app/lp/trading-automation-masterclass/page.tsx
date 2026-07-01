import type { Metadata } from "next";
import AlgoTradingCourseCampaignLanding from "@/components/course/AlgoTradingCourseCampaignLanding";

export const metadata: Metadata = {
  title: "Trading Automation Masterclass | Vyntegra",
  description:
    "A mobile-first introduction to the Vyntegra Trading Automation Masterclass with free registration for the first lessons.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Trading Automation Masterclass | Vyntegra",
    description:
      "Register free for the first Vyntegra Trading Automation Masterclass preview lessons.",
    siteName: "Vyntegra",
    type: "website",
  },
};

export default function TradingAutomationMasterclassLandingPage() {
  return <AlgoTradingCourseCampaignLanding />;
}
