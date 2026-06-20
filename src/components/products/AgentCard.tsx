import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { TradingAgentProduct } from "@/types";
import { isSubscriptionAgentSlug } from "@/data/agent-subscription-plans";
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
  const capabilities = product.keyCapabilities.slice(0, 3);
  const platformOrMarket = [product.platform, product.market]
    .filter(Boolean)
    .join(" - ");
  const isSubscriptionProduct = isSubscriptionAgentSlug(product.slug);

  return (
    <article
      className="standard-card clickable-card agent-showcase-card"
      style={{ padding: 0, overflow: "hidden" }}
    >
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="agent-showcase-image"
          src={product.image}
          alt={`${product.name} product visual`}
          style={{
            aspectRatio: "16 / 10",
            width: "100%",
            objectFit: "cover",
            background: "#1B1E23",
          }}
        />
      ) : (
        <div
          className="agent-showcase-image"
          style={{
            aspectRatio: "16 / 10",
            background: "#1B1E23",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9CA0A7",
          }}
        >
          <span className="body-compact">Product visual pending</span>
        </div>
      )}

      <div className="agent-showcase-content">
        <p className="eyebrow" style={{ marginBottom: 8 }}>AI Trading Software Agent</p>
        <h3 className="card-title">{product.name}</h3>
        <p className="body-standard" style={{ marginTop: 12 }}>
          Built for traders who want a structured software workflow for {product.shortDescription.replace(/^[Aa]\s+/, '').replace(/\.$/, '')}.
        </p>
        <p className="body-small" style={{ marginTop: 8, color: "var(--foreground-muted)" }}>
          No profit guarantee. Use with proper testing and risk control.
        </p>
        {platformOrMarket ? (
          <p className="tag" style={{ marginTop: 12 }}>
            {platformOrMarket}
          </p>
        ) : null}

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "16px 0 0",
            display: "grid",
            gap: 8,
          }}
        >
          {capabilities.map((capability) => (
            <li
              key={capability}
              className="body-compact"
              style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
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

        <p className="product-price" style={{ marginTop: 20 }}>
          {isSubscriptionProduct ? "From $199" : formatUsd(product.priceUsd)}
        </p>

        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <Button href={`/ai-trading-agents/${product.slug}`} variant="secondary">
            View Details
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
        <div style={{ marginTop: 12, display: "grid" }}>
          <Button href="/experts" variant="secondary" style={{ width: "100%" }}>
            Discuss Before Buying
          </Button>
        </div>
      </div>
    </article>
  );
}

