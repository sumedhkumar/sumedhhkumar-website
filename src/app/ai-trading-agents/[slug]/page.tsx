import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { astroVynGoldPlans } from "@/data/astro-vyn-gold-plans";
import { products } from "@/data/products";
import { hasProductRazorpayCheckoutConfiguration } from "@/lib/config";
import { getCryptoPaymentConfig } from "@/lib/payments/crypto";
import AgentPurchaseCard from "@/components/products/AgentPurchaseCard";
import MobileAgentPurchaseBar from "@/components/products/MobileAgentPurchaseBar";
import ProductFAQ from "@/components/products/ProductFAQ";
import EmptyState from "@/components/ui/EmptyState";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function findProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

function renderList(items: string[]) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gap: 10 }}>
      {items.map((item) => (
        <li
          key={item}
          className="body-standard"
          style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
        >
          <CheckCircle2
            size={16}
            color="#B8914A"
            strokeWidth={1.75}
            style={{ flex: "0 0 auto", marginTop: 4 }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const astroGoldBadges = [
  "MT5",
  "XAUUSD Gold",
  "London Session",
  "Fixed Risk",
];

const astroGoldBacktestMetrics = [
  ["Backtest period", "2023-2025"],
  ["Mode", "Selective setups"],
  ["Risk model", "Fixed-risk execution"],
];

const astroGoldRiskControls = [
  "Spread checks before entries",
  "Breakeven and trailing stop logic",
  "Controlled trade frequency",
  "Lot caps for account protection",
];

function AstroVynGoldProductOverview({ product }: { product: NonNullable<ReturnType<typeof findProduct>> }) {
  return (
    <>
      <header className="astro-gold-hero-panel">
        <p className="eyebrow" style={{ marginBottom: 8 }}>
          AI Trading Software Agent
        </p>
        <h1 className="page-title">{product.name}</h1>
        <p className="body-large astro-gold-subtitle">
          Rule-based Gold trading software for MetaTrader 5, built for selective
          XAUUSD workflows during the London session.
        </p>
        <div className="astro-gold-badge-row" aria-label="Product attributes">
          {astroGoldBadges.map((badge) => (
            <span key={badge} className="astro-gold-badge">
              {badge}
            </span>
          ))}
        </div>
      </header>

      <section>
        <h2 className="subsection-title">Live Trading Results</h2>
        <div className="astro-gold-placeholder-grid" aria-label="Performance data placeholders">
          {["Myfxbook placeholder", "MQL5 placeholder"].map((label) => (
            <div key={label} className="astro-gold-data-placeholder" role="img" aria-label={label}>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="subsection-title">Backtest Snapshot</h2>
        <div className="astro-gold-metric-grid">
          {astroGoldBacktestMetrics.map(([label, value]) => (
            <div key={label} className="astro-gold-metric-card">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <p className="astro-gold-risk-disclaimer">
          Backtests are historical simulations and do not guarantee future results.
          Use trading software carefully and test on demo before live use.
        </p>
      </section>

      <section>
        <div className="astro-gold-section-heading">
          <div>
            <p className="eyebrow">Subscription Access</p>
            <h2 className="subsection-title">Choose your access term</h2>
          </div>
          <Link className="btn btn-secondary" href="/ai-trading-agents/astro-vyn-gold/plans">
            Compare Plans
          </Link>
        </div>
        <div className="astro-gold-plan-grid">
          {astroVynGoldPlans.map((plan) => (
            <article key={plan.id} className="astro-gold-plan-card">
              <p>{plan.durationLabel}</p>
              <h3>{plan.name}</h3>
              <span>${plan.originalPriceUsd}</span>
              <strong>${plan.priceUsd}</strong>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="subsection-title">How Astro-Vyn Gold works</h2>
        <ol className="astro-gold-step-list">
          <li>Install and configure the software on MetaTrader 5.</li>
          <li>Run it on demo first and review behavior across London-session setups.</li>
          <li>Use the fixed-risk controls and account-level safeguards before live evaluation.</li>
        </ol>
      </section>

      <section>
        <h2 className="subsection-title">Risk controls</h2>
        {renderList(astroGoldRiskControls)}
      </section>
    </>
  );
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product) {
    return {
      title: "AI Trading Software Agent | Vyntegra",
    };
  }

  return {
    title: `${product.name} | Vyntegra`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product) {
    notFound();
  }

  const paymentsConfigured = hasProductRazorpayCheckoutConfiguration();
  const cryptoPaymentConfig = getCryptoPaymentConfig();
  const isAstroVynGoldProduct = product.slug === "astro-vyn-gold";

  return (
    <main className="section-bg-primary product-page">
      <div className="product-detail">
        <div className="product-content">
          {isAstroVynGoldProduct ? (
            <AstroVynGoldProductOverview product={product} />
          ) : (
            <>
              <header>
                <p className="eyebrow" style={{ marginBottom: 8 }}>
                  AI Trading Software Agent
                </p>
                <h1 className="page-title">{product.name}</h1>
                <p className="body-large" style={{ marginTop: 16 }}>
                  A structured software agent built to support trading workflow
                  execution, automation logic, and disciplined system use.
                </p>
              </header>

              <section>
                <h2 className="subsection-title">Overview</h2>
                <p className="body-standard" style={{ marginTop: 16 }}>
                  This agent is designed to help users work with a defined
                  trading workflow in a more structured way. It may support
                  automation logic, platform-connected execution steps, or
                  strategy-based workflow management depending on the agent
                  configuration.
                </p>
              </section>

              <section>
                <h2 className="subsection-title">What this agent helps with</h2>
                {renderList([
                  "Structuring trading rules into a usable software workflow",
                  "Reducing manual repetition in execution-related processes",
                  "Supporting platform-connected trading workflows",
                  "Improving consistency in how a strategy is followed",
                  "Helping users review and operate defined trading logic",
                ])}
              </section>
            </>
          )}

          <section>
            <h2 className="subsection-title">Product Details</h2>
            {renderList(product.keyCapabilities.concat(product.requirements))}
          </section>

          <section>
            <h2 className="subsection-title">Product Visuals</h2>
            {product.screenshots.length > 0 ? (
              <div className="product-screenshot-grid">
                {product.screenshots.map((screenshot) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={screenshot}
                    src={screenshot}
                    alt={`${product.name} product screenshot`}
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                <EmptyState
                  heading="Product visuals pending"
                  copy="Detailed interface visuals will be added before the product is made available for purchase."
                />
              </div>
            )}
          </section>

          <section>
            <h2 className="subsection-title">Before you use this agent</h2>
            {renderList([
              "Review the agent details carefully.",
              "Understand the strategy or workflow it is designed for.",
              "Test the setup before using it in live market conditions.",
              "Use appropriate capital allocation and risk management.",
              "Do not rely on any software as a guarantee of profit.",
            ])}
          </section>

          <section>
            <h2 className="subsection-title">Important note</h2>
            <p className="body-standard" style={{ marginTop: 16 }}>
              This agent does not guarantee profitable trades. It does not
              replace trading knowledge, backtesting, risk management, or user
              judgment. Users are responsible for how they configure, test, and
              use the software.
            </p>
          </section>

          <section>
            <h2 className="subsection-title">Version and Updates</h2>
            <p className="body-standard" style={{ marginTop: 16 }}>
              {product.version}
            </p>
            {renderList(product.updateHistory)}
          </section>

          <section>
            <h2 className="subsection-title">Frequently Asked Questions</h2>
            <div style={{ marginTop: 16 }}>
              <ProductFAQ faqs={product.faqs} />
            </div>
          </section>

          {product.reviews.length > 0 ? (
            <section>
              <h2 className="subsection-title">
                {isAstroVynGoldProduct ? "Reviews" : "Customer Reviews"}
              </h2>
              <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
                {product.reviews.map((review) => (
                  <article key={review.reviewText} className="standard-card">
                    <p className="body-standard">{review.reviewText}</p>
                    <p className="tag" style={{ marginTop: 12 }}>
                      {review.reviewerName}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <AgentPurchaseCard
          product={product}
          paymentsConfigured={paymentsConfigured}
          cryptoPaymentConfig={cryptoPaymentConfig}
        />
      </div>
      <MobileAgentPurchaseBar
        product={product}
        paymentsConfigured={paymentsConfigured}
        cryptoPaymentConfig={cryptoPaymentConfig}
      />
    </main>
  );
}
