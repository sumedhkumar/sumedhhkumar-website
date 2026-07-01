"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getAgentSubscriptionPlans,
  getSubscriptionAgentPlan,
} from "@/data/agent-subscription-plans";
import { AgentCheckoutPaymentPanel } from "@/components/products/AgentPurchaseCard";
import { calculateFinalPrice } from "@/lib/pricing";
import type { CryptoPaymentConfig, TradingAgentProduct } from "@/types";

type CheckoutPlanClientProps = {
  product: TradingAgentProduct;
  paymentsConfigured: boolean;
  cryptoPaymentConfig: CryptoPaymentConfig | null;
};

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CheckoutPlanClient({
  product,
  paymentsConfigured,
  cryptoPaymentConfig,
}: CheckoutPlanClientProps) {
  const searchParams = useSearchParams();
  const plans = getAgentSubscriptionPlans(product.slug);
  const selectedPlan =
    getSubscriptionAgentPlan(product.slug, searchParams.get("plan") ?? "") ??
    plans[0];

  if (!selectedPlan) {
    return null;
  }

  const defaultPricing = calculateFinalPrice(
    product.slug,
    selectedPlan.id,
    "EARLYACCESS",
  );
  const defaultPayablePrice = defaultPricing.ok
    ? defaultPricing.finalPriceUsd
    : selectedPlan.priceUsd;

  const checkoutProduct = {
    ...product,
    priceUsd: selectedPlan.priceUsd,
    fullDescription:
      `${product.name} subscription access. After payment verification, Vyntegra will send access/setup next steps by email.`,
  };

  return (
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
            <dt>Default payable price</dt>
            <dd className="astro-gold-selected-payable">
              {formatUsd(defaultPayablePrice)}
            </dd>
          </div>
          <div>
            <dt>Note</dt>
            <dd>{selectedPlan.note}</dd>
          </div>
        </dl>
        <p className="astro-gold-checkout-risk-copy">
          Trading involves risk. Past performance and backtest results do not
          guarantee future results. {product.name} is software tooling, not
          investment advice.
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
  );
}
