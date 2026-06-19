import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getSubscriptionAgentPlan,
  isSubscriptionAgentSlug,
} from "@/data/agent-subscription-plans";
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

function findProduct(slug: string) {
  return products.find((product) => product.slug === slug && product.active);
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

export default async function SubscriptionCheckoutPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product) {
    notFound();
  }

  if (!isSubscriptionAgentSlug(product.slug)) {
    redirect(`/ai-trading-agents/${product.slug}#purchase`);
  }

  const query = await searchParams;
  const selectedPlan = getSubscriptionAgentPlan(
    product.slug,
    readPlanParam(query.plan),
  );

  if (!selectedPlan) {
    return (
      <main className="section-bg-primary astro-gold-checkout-page">
        <div className="astro-gold-checkout-shell">
          <section className="astro-gold-invalid-plan-card">
            <p className="eyebrow">{product.name} Checkout</p>
            <h1 className="subsection-title">Invalid subscription plan selected.</h1>
            <p className="body-standard">
              Please choose a valid {product.name} subscription plan.
            </p>
            <Link className="btn btn-primary" href={`/ai-trading-agents/${product.slug}/plans`}>
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
      `${product.name} subscription access. After payment verification, Vyntegra will send access/setup next steps by email.`,
  };
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

        <div className="astro-gold-checkout-grid">
          <section className="astro-gold-selected-plan-card">
            <h2 className="subsection-title">Selected plan</h2>
            <dl className="astro-gold-selected-plan-details">
              <div>
                <dt>Product</dt>
                <dd>{product.name}</dd>
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
              not guarantee future results. {product.name} is software tooling,
              not investment advice.
            </p>
            <Link className="astro-gold-back-link" href={`/ai-trading-agents/${product.slug}/plans`}>
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
