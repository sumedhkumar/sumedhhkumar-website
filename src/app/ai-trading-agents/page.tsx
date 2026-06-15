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
            Explore software agents built to support structured trading workflows, strategy execution, and platform-connected automation.
          </p>
          <p className="body-standard" style={{ marginTop: 16 }}>
            Each Vyntegra agent is designed around a defined use case. These agents are not profit machines, signal guarantees, or financial advice. They are software tools built to help users execute and manage trading workflows with more structure.
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
            heading="No agents are available at the moment."
            copy="Please check back later or contact Vyntegra for a custom requirement."
          />
        )}
      </div>
    </main>
  );
}
