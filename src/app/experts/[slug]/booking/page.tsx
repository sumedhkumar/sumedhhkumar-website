import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { experts } from "@/data/experts";
import { availabilityText } from "@/data/site";
import { appConfig, isProductionPersistenceConfigured } from "@/lib/config";
import { hasExpertCalendlyUrl } from "@/lib/server/expert-booking";
import { validateBookingAccessToken } from "@/lib/server/payment-tokens";
import CalendlyEmbed from "@/components/experts/CalendlyEmbed";
import EmptyState from "@/components/ui/EmptyState";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Select Your Consultation Slot | Vyntegra",
  description: "Select a consultation slot after verified payment access.",
};

export default async function ExpertBookingPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const expert = experts.find((item) => item.slug === slug);

  if (!expert) {
    notFound();
  }

  const bookingAccessToken =
    typeof query.token === "string" ? query.token : "";
  const hasVerifiedPaymentAccess =
    bookingAccessToken !== "" && validateBookingAccessToken(bookingAccessToken);
  const enabled =
    hasVerifiedPaymentAccess &&
    appConfig.expertBookingEnabled &&
    isProductionPersistenceConfigured() &&
    hasExpertCalendlyUrl(expert.id);

  if (!hasVerifiedPaymentAccess) {
    return (
      <main className="listing-page">
        <div className="listing-container">
          <EmptyState
            heading="Verified payment required."
            copy="Select your appointment on checkout and complete payment before the booking can be confirmed."
          />
        </div>
      </main>
    );
  }

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

        <CalendlyEmbed
          expert={expert}
          enabled={enabled}
          bookingAccessToken={bookingAccessToken}
        />
      </div>
    </main>
  );
}
