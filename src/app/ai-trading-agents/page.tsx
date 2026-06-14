import type { Metadata } from "next";
import { products } from "@/data/products";
import AgentCard from "@/components/products/AgentCard";
import EmptyState from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "AI Trading Software Agents | Vyntegra",
  description:
    "Explore ready-to-purchase AI trading software agents with transparent USD pricing and detailed product information.",
};

export default function AiTradingAgentsPage() {
  const activeProducts = products.filter((product) => product.active);

  return (
    <main className="listing-page agents-page">
      <div className="listing-container">
        <header className="listing-hero">
          <h1 className="page-title">AI Trading Software Agents</h1>
          <p className="body-large">
            Explore ready-to-purchase AI trading software agents with
            transparent USD pricing and detailed product information.
          </p>
        </header>

        {activeProducts.length > 0 ? (
          <div className="agent-grid">
            {activeProducts.map((product) => (
              <AgentCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            heading="AI trading software agents will be available soon."
            copy="Product details and purchase options are being prepared."
          />
        )}
      </div>
    </main>
  );
}
