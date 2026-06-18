import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAstroVynGoldPlan } from "@/data/astro-vyn-gold-plans";
import { products } from "@/data/products";
import { hasProductRazorpayCheckoutConfiguration } from "@/lib/config";
import { getCryptoPaymentConfig } from "@/lib/payments/crypto";
import { AgentCheckoutPaymentPanel } from "@/components/products/AgentPurchaseCard";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ plan?: string | string[] }>;
};

function formatUsd(value: number) {
  return `$${value}`;
}

function readPlanParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

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
  searchParams,
}: PageProps) {
  const { slug } = await params;

  if (slug !== "astro-vyn-gold") {
    redirect(`/ai-trading-agents/${slug}#purchase`);
  }

  const product = products.find((item) => item.slug === "astro-vyn-gold");

  if (!product) {
    notFound();
  }

  const query = await searchParams;
  const selectedPlan = getAstroVynGoldPlan(readPlanParam(query.plan));

  if (!selectedPlan) {
    return (
      <main className="section-bg-primary astro-gold-checkout-page">
        <div className="astro-gold-checkout-shell">
          <section className="astro-gold-invalid-plan-card">
            <p className="eyebrow">Astro-Vyn Gold Checkout</p>
            <h1 className="subsection-title">Invalid subscription plan selected.</h1>
            <p className="body-standard">
              Please choose a valid Astro-Vyn Gold subscription plan.
            </p>
            <Link className="btn btn-primary" href="/ai-trading-agents/astro-vyn-gold/plans">
              Back to plans
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const checkoutProduct = {
    ...product,
    priceUsd: selectedPlan.priceUsd,
    fullDescription:
      "Astro-Vyn Gold subscription access. After payment verification, Vyntegra will send access/setup next steps by email.",
  };
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

        <div className="astro-gold-checkout-grid">
          <section className="astro-gold-selected-plan-card">
            <h2 className="subsection-title">Selected plan</h2>
            <dl className="astro-gold-selected-plan-details">
              <div>
                <dt>Product</dt>
                <dd>Astro-Vyn Gold</dd>
              </div>
              <div>
                <dt>Plan</dt>
                <dd>{selectedPlan.name}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{selectedPlan.durationLabel}</dd>
              </div>
              <div>
                <dt>Original price</dt>
                <dd className="astro-gold-selected-original">
                  {formatUsd(selectedPlan.originalPriceUsd)}
                </dd>
              </div>
              <div>
                <dt>Payable price</dt>
                <dd className="astro-gold-selected-payable">
                  {formatUsd(selectedPlan.priceUsd)}
                </dd>
              </div>
              <div>
                <dt>Note</dt>
                <dd>{selectedPlan.note}</dd>
              </div>
            </dl>
            <p className="astro-gold-checkout-risk-copy">
              Trading involves risk. Past performance and backtest results do
              not guarantee future results. Astro-Vyn Gold is software tooling,
              not investment advice.
            </p>
            <Link className="astro-gold-back-link" href="/ai-trading-agents/astro-vyn-gold/plans">
              Change selected plan
            </Link>
          </section>

          <AgentCheckoutPaymentPanel
            product={checkoutProduct}
            paymentsConfigured={paymentsConfigured}
            cryptoPaymentConfig={cryptoPaymentConfig}
            selectedPlan={selectedPlan}
          />
        </div>
      </div>
    </main>
  );
}
