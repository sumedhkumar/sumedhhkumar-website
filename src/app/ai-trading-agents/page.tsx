import type { Metadata } from "next";
import { ArrowDown, MailCheck, ShieldCheck, WalletCards } from "lucide-react";
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
        <header className="listing-hero agent-catalog-hero">
          <p className="eyebrow">Vyntegra Catalog</p>
          <h1 className="page-title">AI Trading Software Agents</h1>
          <p className="body-large agent-catalog-lede">
            Purpose-built trading software for defined market workflows, execution rules, and risk-aware evaluation.
          </p>
          <p className="body-standard agent-catalog-disclaimer">
            Each product is designed around a defined workflow. Vyntegra software is not financial advice and does not guarantee profits or trading outcomes.
          </p>
          <a className="btn btn-primary agent-catalog-cta" href="#agent-catalog">
            Explore Agents <ArrowDown size={16} strokeWidth={1.75} />
          </a>
        </header>

        <section className="agent-clarity-strip" aria-label="Purchase and risk information">
          <div><WalletCards size={18} aria-hidden="true" /><span>Crypto payment with manual verification</span></div>
          <div><MailCheck size={18} aria-hidden="true" /><span>Email confirmation after proof submission</span></div>
          <div><ShieldCheck size={18} aria-hidden="true" /><span>Trading involves risk. <a href="/terms#ai-trading-software-agents-risk-disclaimer">Read the risk disclosure</a></span></div>
        </section>

        {activeProducts.length > 0 ? (
          <>
            <section id="agent-catalog" className="agent-catalog-section" aria-labelledby="agent-catalog-heading">
              <div className="agent-section-heading">
                <div>
                  <p className="eyebrow">Available Software</p>
                  <h2 id="agent-catalog-heading" className="subsection-title">Choose a workflow to evaluate</h2>
                </div>
                <p className="body-compact">Start with the operating focus, inspect the supporting report images, then compare access terms.</p>
              </div>
              <div className="agent-grid">
                {activeProducts.map((product) => (
                  <AgentCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <EmptyState
            heading="No agents are available at the moment."
            copy="Please check back later or contact Vyntegra for a custom requirement."
          />
        )}
        <section className="agent-risk-panel" aria-labelledby="agent-risk-heading">
          <p className="eyebrow">Important Risk Notice</p>
          <h2 id="agent-risk-heading" className="subsection-title">Test before live-market use.</h2>
          <p className="body-standard">Trading software does not guarantee outcomes. You remain responsible for trading decisions, risk settings, and account exposure.</p>
        </section>
      </div>
    </main>
  );
}
