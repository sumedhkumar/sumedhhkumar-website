import type { Metadata } from "next";
import AlgoTradingCourseLanding from "@/components/course/AlgoTradingCourseLanding";

export const metadata: Metadata = {
  title: "Vyntegra Trading Automation Masterclass | Vyntegra",
  description:
    "A 3-month weekend trading automation education program covering MT5, TradingView, live sessions, recordings, and WhatsApp support.",
  openGraph: {
    title: "Vyntegra Trading Automation Masterclass | Vyntegra",
    description:
      "A 3-month weekend trading automation education program covering MT5, TradingView, live sessions, recordings, and WhatsApp support.",
    siteName: "Vyntegra",
    type: "website",
  },
};

export default function AlgoTradingCoursePage() {
  return <AlgoTradingCourseLanding />;
}
