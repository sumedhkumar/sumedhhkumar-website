import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import AgentCard from "@/components/products/AgentCard";
import EmptyState from "@/components/ui/EmptyState";
import SectionIntro from "@/components/ui/SectionIntro";

export default function FeaturedAgents() {
  const featuredProducts = products
    .filter((product) => product.featured && product.active)
    .slice(0, 3);

  return (
    <section id="ai-trading-agents" className="section section-bg-secondary">
      <div className="container">
        <SectionIntro
          heading="Featured AI Trading Software Agents"
          copy="Explore purpose-built software products with clear capabilities, transparent USD pricing, and direct purchase options."
        />

        {featuredProducts.length > 0 ? (
          <div className="agent-grid">
            {featuredProducts.map((product) => (
              <AgentCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            heading="AI trading software agents will be available soon."
            copy="Product details and purchase options are being prepared."
          />
        )}

        <Link
          href="/ai-trading-agents"
          className="body-standard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 28,
            color: "#D8CBA6",
            fontWeight: 700,
          }}
        >
          View All AI Trading Agents <ArrowRight size={16} strokeWidth={1.75} />
        </Link>
      </div>
    </section>
  );
}

