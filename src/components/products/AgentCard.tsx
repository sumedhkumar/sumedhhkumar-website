import { ArrowRight, CheckCircle2, Cpu } from "lucide-react";
import type { TradingAgentProduct } from "@/types";
import {
  getAgentSubscriptionPlans,
  isSubscriptionAgentSlug,
} from "@/data/agent-subscription-plans";
import { calculateFinalPrice } from "@/lib/pricing";
import Button from "@/components/ui/Button";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AgentCard({ product }: { product: TradingAgentProduct }) {
  const capabilities = product.keyCapabilities.slice(0, 2);
  const platformOrMarket = [product.platform, product.market]
    .filter(Boolean)
    .join(" - ");
  const isSubscriptionProduct = isSubscriptionAgentSlug(product.slug);
  const startingPlan = isSubscriptionProduct ? getAgentSubscriptionPlans(product.slug)[0] : null;
  const earlyAccessPrice = startingPlan
    ? calculateFinalPrice(product.slug, startingPlan.id, "EARLYACCESS")
    : null;

  return (
    <article className="standard-card clickable-card agent-showcase-card agent-catalog-card">
      <div className="agent-card-visual">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="agent-showcase-image"
            src={product.image}
            alt={`${product.name} product visual`}
          />
        ) : (
          <div className="agent-showcase-image agent-card-visual-empty">
            <span className="body-compact">Product visual pending</span>
          </div>
        )}
        <div className="agent-card-visual-meta" aria-hidden="true">
          <span><Cpu size={14} strokeWidth={1.8} /> Trading software</span>
          {platformOrMarket ? <span>{platformOrMarket}</span> : null}
        </div>
      </div>

      <div className="agent-showcase-content agent-catalog-card-content">
        <p className="eyebrow">Product profile</p>
        <h3 className="card-title">{product.name}</h3>
        <p className="body-standard agent-card-description">
          {product.shortDescription}
        </p>
        <ul className="agent-card-capabilities">
          {capabilities.map((capability) => (
            <li
              key={capability}
              className="body-compact agent-card-capability"
            >
              <CheckCircle2
                size={16}
                color="#B8914A"
                strokeWidth={1.75}
                style={{ flex: "0 0 auto", marginTop: 2 }}
              />
              <span>{capability}</span>
            </li>
          ))}
        </ul>

        <div className="agent-card-price-row">
          <p className="product-price">
            {isSubscriptionProduct && startingPlan
              ? `From ${formatUsd(earlyAccessPrice?.finalPriceUsd ?? startingPlan.priceUsd)}`
              : formatUsd(product.priceUsd)}
          </p>
          {isSubscriptionProduct && startingPlan ? (
            <span className="agent-card-coupon-note">Early Access price</span>
          ) : null}
        </div>

        <div className="agent-card-actions">
          <Button href={`/ai-trading-agents/${product.slug}`} variant="secondary">
            Product Details
          </Button>
          <Button
            href={
              isSubscriptionProduct
                ? `/ai-trading-agents/${product.slug}/plans`
                : `/ai-trading-agents/${product.slug}#purchase`
            }
            variant="primary"
          >
            {isSubscriptionProduct ? "View Plans" : "Buy Agent"} <ArrowRight size={16} strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </article>
  );
}

