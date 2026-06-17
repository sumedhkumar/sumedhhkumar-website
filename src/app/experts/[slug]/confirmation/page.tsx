import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { experts } from "@/data/experts";
import { validateBookingAccessToken } from "@/lib/server/payment-tokens";
import EmptyState from "@/components/ui/EmptyState";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Consultation Confirmed | Vyntegra",
  description: "Review consultation confirmation details.",
};

export function generateStaticParams() {
  return experts.map((expert) => ({ slug: expert.slug }));
}

export default async function ExpertConfirmationPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const expert = experts.find((item) => item.slug === slug);

  if (!expert) {
    notFound();
  }

  const token = typeof query.token === "string" ? query.token : "";

  if (!token || !validateBookingAccessToken(token)) {
    return (
      <main className="listing-page">
        <div className="listing-container">
          <EmptyState
            heading="Booking access unavailable."
            copy="Select an appointment during checkout and complete a verified consultation payment before confirmation."
          />
        </div>
      </main>
    );
  }

  return (
    <main className="listing-page">
      <div className="listing-container">
        <EmptyState
          heading="Confirmation details are pending."
          copy="Your appointment will appear here after successful payment verification and booking confirmation."
        />
      </div>
    </main>
  );
}
