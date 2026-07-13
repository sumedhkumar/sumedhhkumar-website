import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { isSubscriptionAgentSlug } from "@/data/agent-subscription-plans";
import { products } from "@/data/products";
import { hasProductRazorpayCheckoutConfiguration } from "@/lib/config";
import { getCryptoPaymentConfig } from "@/lib/payments/crypto";
import { calculateFinalPrice } from "@/lib/pricing";
import { AgentCheckoutPaymentPanel } from "@/components/products/AgentPurchaseCard";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function findProduct(slug: string) {
  return products.find((product) => product.slug === slug && product.active);
}

function readPlanParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function generateStaticParams() {
  return products
    .filter((product) => product.active && isSubscriptionAgentSlug(product.slug))
    .map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product || !isSubscriptionAgentSlug(product.slug)) {
    return {
      title: "AI Trading Software Agent Checkout | Vyntegra",
    };
  }

  return {
    title: `Complete your ${product.name} purchase | Vyntegra`,
    description: `Review your selected ${product.name} subscription and continue with secure payment.`,
  };
}

export default async function SubscriptionCheckoutPage({ params }: PageProps) {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product) {
    notFound();
  }

  if (!isSubscriptionAgentSlug(product.slug)) {
    redirect(`/ai-trading-agents/${product.slug}#purchase`);
  }

  const paymentsConfigured = hasProductRazorpayCheckoutConfiguration();
  const cryptoPaymentConfig = getCryptoPaymentConfig();

  return (
    <main className="section-bg-primary astro-gold-checkout-page">
      <div className="astro-gold-checkout-shell">
        <header className="astro-gold-checkout-hero">
          <p className="eyebrow">{product.name} Checkout</p>
          <h1 className="page-title">Complete your {product.name} purchase</h1>
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
