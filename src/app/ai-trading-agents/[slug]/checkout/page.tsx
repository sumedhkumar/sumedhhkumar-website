import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { hasProductRazorpayCheckoutConfiguration } from "@/lib/config";
import { getCryptoPaymentConfig } from "@/lib/payments/crypto";
import CheckoutPlanClient from "./CheckoutPlanClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [{ slug: "astro-vyn-gold" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug !== "astro-vyn-gold") {
    return {
      title: "AI Trading Software Agent Checkout | Vyntegra",
    };
  }

  return {
    title: "Complete your Astro-Vyn Gold purchase | Vyntegra",
    description:
      "Review your selected Astro-Vyn Gold subscription and continue with secure payment.",
  };
}

export default async function AstroVynGoldCheckoutPage({
  params,
}: PageProps) {
  const { slug } = await params;

  if (slug !== "astro-vyn-gold") {
    notFound();
  }

  const product = products.find((item) => item.slug === "astro-vyn-gold");

  if (!product) {
    notFound();
  }

  const paymentsConfigured = hasProductRazorpayCheckoutConfiguration();
  const cryptoPaymentConfig = getCryptoPaymentConfig();

  return (
    <main className="section-bg-primary astro-gold-checkout-page">
      <div className="astro-gold-checkout-shell">
        <header className="astro-gold-checkout-hero">
          <p className="eyebrow">Astro-Vyn Gold Checkout</p>
          <h1 className="page-title">Complete your Astro-Vyn Gold purchase</h1>
          <p className="body-large">
            Review your selected subscription and continue with secure payment.
          </p>
        </header>

        <Suspense fallback={null}>
          <CheckoutPlanClient
            product={product}
            paymentsConfigured={paymentsConfigured}
            cryptoPaymentConfig={cryptoPaymentConfig}
          />
        </Suspense>
      </div>
    </main>
  );
}
