import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { experts } from "@/data/experts";
import { hasRazorpayCheckoutConfiguration } from "@/lib/config";
import ExpertCheckout from "@/components/experts/ExpertCheckout";
import EmptyState from "@/components/ui/EmptyState";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Book a Consultation | Vyntegra",
  description: "Select an expert consultation session and payment option.",
};

export function generateStaticParams() {
  return experts.map((expert) => ({ slug: expert.slug }));
}

export default async function ExpertCheckoutPage({ params }: PageProps) {
  const { slug } = await params;
  const expert = experts.find((item) => item.slug === slug);

  if (!expert || !expert.active) {
    notFound();
  }

  const hasActiveThirtyMinuteSession = expert.sessions.some(
    (session) => session.active && session.durationMinutes === 30,
  );

  if (!hasActiveThirtyMinuteSession) {
    return (
      <main className="listing-page">
        <div className="listing-container">
          <EmptyState
            heading="Consultation unavailable."
            copy="This expert does not have an active 30-minute session available right now."
          />
        </div>
      </main>
    );
  }

  return (
    <main className="listing-page">
        <ExpertCheckout
          expert={expert}
          paymentsConfigured={hasRazorpayCheckoutConfiguration()}
        />
    </main>
  );
}
