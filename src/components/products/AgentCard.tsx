import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { TradingAgentProduct } from "@/types";
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
    .join(" · ");

  return (
    <article
      className="standard-card clickable-card"
      style={{ padding: 0, overflow: "hidden" }}
    >
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={`${product.name} product visual`}
          style={{
            aspectRatio: "16 / 10",
            width: "100%",
            objectFit: "cover",
            background: "#132731",
          }}
        />
      ) : (
        <div
          style={{
            aspectRatio: "16 / 10",
            background: "#132731",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8F98A0",
          }}
        >
          <span className="body-compact">Product visual pending</span>
        </div>
      )}

      <div style={{ padding: 24 }}>
        <h3 className="card-title">{product.name}</h3>
        <p className="body-standard" style={{ marginTop: 12 }}>
          {product.shortDescription}
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
                color="#C7A56A"
                strokeWidth={1.75}
                style={{ flex: "0 0 auto", marginTop: 2 }}
              />
              <span>{capability}</span>
            </li>
          ))}
        </ul>

        <p className="product-price" style={{ marginTop: 20 }}>
          {formatUsd(product.priceUsd)}
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
            href={`/ai-trading-agents/${product.slug}#purchase`}
            variant="primary"
          >
            Buy Now <ArrowRight size={16} strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </article>
  );
}
