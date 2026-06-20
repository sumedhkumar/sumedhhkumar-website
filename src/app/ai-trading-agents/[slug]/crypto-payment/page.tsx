import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubscriptionAgentPlan } from "@/data/agent-subscription-plans";
import { products } from "@/data/products";
import { validateCoupon } from "@/lib/coupon-validation";
import { getCryptoPaymentConfig } from "@/lib/payments/crypto";
import { CryptoPaymentPanel } from "@/components/products/AgentPurchaseCard";
import EmptyState from "@/components/ui/EmptyState";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function findProduct(slug: string) {
  return products.find((product) => product.slug === slug && product.active);
}

export const metadata: Metadata = {
  title: "Pay with Crypto | Vyntegra",
  description: "Submit manual crypto payment proof for a Vyntegra product.",
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function CryptoPaymentPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const product = findProduct(slug);

  if (!product) {
    notFound();
  }

  const couponCode =
    typeof query.coupon === "string" ? query.coupon.trim() : "";
  const selectedPlanId =
    typeof query.plan === "string" ? query.plan.trim() : "";
  const selectedPlan =
    selectedPlanId
      ? getSubscriptionAgentPlan(product.slug, selectedPlanId)
      : null;

  if (selectedPlanId && !selectedPlan) {
    notFound();
  }

  const productPriceUsd = selectedPlan ? selectedPlan.priceUsd : product.priceUsd;
  const couponResult = couponCode && !selectedPlan
    ? validateCoupon({
        code: couponCode,
        amountUsd: productPriceUsd,
        target: {
          type: "product",
          productId: product.id,
        },
      })
    : null;
  const finalAmountUsd =
    couponResult?.ok && couponResult.discountAmountUsd > 0
      ? couponResult.finalAmountUsd
      : productPriceUsd;
  const cryptoPaymentConfig = getCryptoPaymentConfig();

  return (
    <main className="listing-page crypto-payment-page">
      <div className="listing-container crypto-payment-screen">
        <header className="listing-hero">
          <p className="eyebrow">Manual Crypto Payment</p>
          <h1 className="page-title">Complete Crypto Payment</h1>
          <p className="body-standard">
            Product: <strong>{product.name}</strong>
          </p>
          {selectedPlan ? (
            <p className="body-standard">
              Plan: <strong>{selectedPlan.name}</strong>
            </p>
          ) : null}
        </header>

        {cryptoPaymentConfig ? (
          <CryptoPaymentPanel
            targetType="product"
            product={product}
            finalAmountUsd={finalAmountUsd}
            couponCode={couponResult?.ok ? couponCode : ""}
            cryptoPaymentConfig={cryptoPaymentConfig}
            selectedPlan={selectedPlan ?? undefined}
          />
        ) : (
          <EmptyState
            heading="Crypto payment unavailable."
            copy="Crypto payment configuration is pending. Please choose another payment option or contact Vyntegra."
          />
        )}
      </div>
    </main>
  );
}
