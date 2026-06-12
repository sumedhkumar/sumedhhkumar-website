import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { experts } from "@/data/experts";
import { availabilityText } from "@/data/site";
import { appConfig, isProductionPersistenceConfigured } from "@/lib/config";
import { hasExpertCalendlyUrl } from "@/lib/server/expert-booking";
import CalendlyEmbed from "@/components/experts/CalendlyEmbed";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Select Your Consultation Slot | Vyntegra",
  description: "Select a consultation slot after verified payment access.",
};

export default async function ExpertBookingPage({ params }: PageProps) {
  const { slug } = await params;
  const expert = experts.find((item) => item.slug === slug);

  if (!expert) {
    notFound();
  }

  const enabled =
    appConfig.expertBookingEnabled &&
    isProductionPersistenceConfigured() &&
    hasExpertCalendlyUrl(expert.id);

  return (
    <main className="listing-page">
      <div className="listing-container">
        <header className="listing-hero">
          <h1 className="page-title">Select Your Consultation Slot</h1>
          <p className="body-standard">
            Availability is configured in Indian Standard Time (IST).
          </p>
          <p className="body-standard">{availabilityText}</p>
        </header>

        <CalendlyEmbed expert={expert} enabled={enabled} />
      </div>
    </main>
  );
}
