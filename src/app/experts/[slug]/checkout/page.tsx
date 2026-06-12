import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { experts } from "@/data/experts";
import { hasAnyPaymentConfiguration } from "@/lib/config";
import ExpertCheckout from "@/components/experts/ExpertCheckout";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Book a Consultation | Vyntegra",
  description: "Select an expert consultation session and payment option.",
};

export default async function ExpertCheckoutPage({ params }: PageProps) {
  const { slug } = await params;
  const expert = experts.find((item) => item.slug === slug);

  if (!expert) {
    notFound();
  }

  return (
    <main className="listing-page">
      <ExpertCheckout
        expert={expert}
        paymentsConfigured={hasAnyPaymentConfiguration()}
      />
    </main>
  );
}
