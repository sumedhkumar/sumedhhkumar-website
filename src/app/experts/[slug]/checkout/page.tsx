import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { experts } from "@/data/experts";
import { hasRazorpayCheckoutConfiguration } from "@/lib/config";
import { getCryptoPaymentConfig } from "@/lib/payments/crypto";
import ExpertCheckout from "@/components/experts/ExpertCheckout";

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

  if (!expert) {
    notFound();
  }

  return (
    <main className="listing-page">
        <ExpertCheckout
          expert={expert}
          paymentsConfigured={hasRazorpayCheckoutConfiguration()}
          cryptoPaymentConfig={getCryptoPaymentConfig()}
        />
    </main>
  );
}
