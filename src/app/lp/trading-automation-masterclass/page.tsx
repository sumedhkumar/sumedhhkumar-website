import type { Metadata } from "next";
import AlgoTradingCourseCampaignLanding from "@/components/course/AlgoTradingCourseCampaignLanding";

export const metadata: Metadata = {
  title: "Trading Automation Masterclass | Vyntegra",
  description:
    "Register free to unlock Lecture 1 and Lecture 2 and learn the workflow behind AI-assisted trading automation.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Trading Automation Masterclass | Vyntegra",
    description:
      "Register free to unlock Lecture 1 and Lecture 2 and learn the workflow behind AI-assisted trading automation.",
    siteName: "Vyntegra",
    type: "website",
  },
};

export default function TradingAutomationMasterclassLandingPage() {
  return <AlgoTradingCourseCampaignLanding />;
}
