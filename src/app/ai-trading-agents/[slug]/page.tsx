import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  agentSubscriptionPlans,
  isSubscriptionAgentSlug,
  type SubscriptionAgentSlug,
} from "@/data/agent-subscription-plans";
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

type Product = (typeof products)[number];

type SubscriptionPageConfig = {
  subtitle: string;
  badges: string[];
  performanceTitle: string;
  performanceLabels: string[];
  backtestTitle: string;
  backtestMetrics: [string, string][];
  overviewTitle: string;
  overviewCopy: string;
  worksTitle: string;
  worksSteps: string[];
  riskControls: string[];
  setupNotes: string[];
};

function findProduct(slug: string) {
  return products.find((product) => product.slug === slug && product.active);
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

const subscriptionConfigs: Record<SubscriptionAgentSlug, SubscriptionPageConfig> = {
  "astro-vyn-gold": {
    subtitle:
      "Rule-based Gold trading software for MetaTrader 5, built for selective XAUUSD workflows during the London session.",
    badges: ["MT5", "XAUUSD Gold", "London Session", "Fixed Risk"],
    performanceTitle: "Live Trading Results",
    performanceLabels: ["Myfxbook placeholder", "MQL5 placeholder"],
    backtestTitle: "Backtest Snapshot",
    backtestMetrics: [
      ["Backtest period", "2023-2025"],
      ["Mode", "Selective setups"],
      ["Risk model", "Fixed-risk execution"],
    ],
    overviewTitle: "How Astro-Vyn Gold works",
    overviewCopy:
      "Astro-Vyn Gold focuses on selective XAUUSD setups, fixed-risk execution, spread checks, breakeven logic, trailing stops, and lot caps for account protection.",
    worksTitle: "Setup workflow",
    worksSteps: [
      "Choose a subscription term and complete checkout.",
      "Install and configure the software on MetaTrader 5.",
      "Run it on demo first and review behavior across London-session setups.",
    ],
    riskControls: [
      "Spread checks before entries",
      "Breakeven and trailing stop logic",
      "Controlled trade frequency",
      "Lot caps for account protection",
    ],
    setupNotes: [
      "MetaTrader 5 account access is required.",
      "A stable VPS or desktop environment is recommended.",
      "Demo testing is recommended before live-market evaluation.",
    ],
  },
  "sentinel-vyn": {
    subtitle:
      "MT5 XAUUSD trading software using Donchian breakout logic, ATR trailing, fixed-risk controls, cooldowns, day filters, and volatility-adapted execution rules.",
    badges: [
      "MT5",
      "XAUUSD Gold",
      "Donchian Breakout",
      "ATR Trailing",
      "Fixed Risk",
      "No Martingale",
    ],
    performanceTitle: "Performance Data Snapshots",
    performanceLabels: ["Data Snapshot 1", "Data Snapshot 2", "Data Snapshot 3"],
    backtestTitle: "Historical Backtest Snapshot",
    backtestMetrics: [
      ["Instrument", "XAUUSD"],
      ["Win rate", "91%"],
      ["Profit factor", "5.80"],
      ["Sharpe", "3.85"],
      ["Max drawdown", "Under 12%"],
      ["Max consecutive losses", "2"],
    ],
    overviewTitle: "Strategy Overview",
    overviewCopy:
      "Sentinel-Vyn is designed for MetaTrader 5 Gold workflows. It uses Donchian breakout signals with ATR-based stop logic, dynamic trailing stops, volatility-adapted controls, and fixed-risk execution rules.",
    worksTitle: "How Sentinel-Vyn works",
    worksSteps: [
      "Configure the software on MetaTrader 5 for XAUUSD.",
      "Use demo mode first to observe behavior across changing volatility.",
      "Review day filters, cooldowns, ATR stop logic, and trailing-stop settings before any live-market evaluation.",
    ],
    riskControls: [
      "Fixed-risk configuration",
      "No martingale, grid, or doubling-down logic",
      "ATR stop and dynamic trailing-stop support",
      "Day filters and cooldowns to reduce overactivity",
      "Minimum deposit reference of $500, with $1000 preferred",
      "Leverage reference range of 1:100 to 1:500 depending on broker rules and user risk tolerance",
    ],
    setupNotes: [
      "Requires MetaTrader 5 and XAUUSD access.",
      "Run demo testing before live-market evaluation.",
      "Users remain responsible for risk settings, account exposure, and trading decisions.",
    ],
  },
};

function SubscriptionProductOverview({ product }: { product: Product }) {
  if (!isSubscriptionAgentSlug(product.slug)) {
    return null;
  }

  const config = subscriptionConfigs[product.slug];

  return (
    <>
      <header className="astro-gold-hero-panel">
        <p className="eyebrow" style={{ marginBottom: 8 }}>
          AI Trading Software Agent
        </p>
        <h1 className="page-title">{product.name}</h1>
        <p className="body-large astro-gold-subtitle">{config.subtitle}</p>
        <div className="astro-gold-badge-row" aria-label="Product attributes">
          {config.badges.map((badge) => (
            <span key={badge} className="astro-gold-badge">
              {badge}
            </span>
          ))}
        </div>
      </header>

      <section>
        <h2 className="subsection-title">{config.overviewTitle}</h2>
        <p className="body-standard" style={{ marginTop: 16 }}>
          {config.overviewCopy}
        </p>
      </section>

      <section>
        <h2 className="subsection-title">{config.performanceTitle}</h2>
        <div className="astro-gold-placeholder-grid" aria-label="Performance data placeholders">
          {config.performanceLabels.map((label) => (
            <div
              key={label}
              className="astro-gold-data-placeholder"
              role="img"
              aria-label={label}
              style={{ aspectRatio: "16 / 9" }}
            >
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="subsection-title">{config.backtestTitle}</h2>
        <div className="astro-gold-metric-grid">
          {config.backtestMetrics.map(([label, value]) => (
            <div key={label} className="astro-gold-metric-card">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <p className="astro-gold-risk-disclaimer">
          Historical backtests are simulations based on past data and do not
          guarantee future results. Trading involves risk. Test on demo before
          using trading software in live market conditions.
        </p>
      </section>

      <section>
        <div className="astro-gold-section-heading">
          <div>
            <p className="eyebrow">Subscription Access</p>
            <h2 className="subsection-title">Choose your access term</h2>
          </div>
          <Link className="btn btn-secondary" href={`/ai-trading-agents/${product.slug}/plans`}>
            Compare Plans
          </Link>
        </div>
        <div className="astro-gold-plan-grid">
          {agentSubscriptionPlans.map((plan) => (
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
        <h2 className="subsection-title">{config.worksTitle}</h2>
        <ol className="astro-gold-step-list">
          {config.worksSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="subsection-title">Setup requirements</h2>
        {renderList(config.setupNotes)}
      </section>

      <section>
        <h2 className="subsection-title">Risk controls</h2>
        {renderList(config.riskControls)}
      </section>
    </>
  );
}

function GenericProductOverview({ product }: { product: Product }) {
  return (
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
          This agent is designed to help users work with a defined trading
          workflow in a more structured way. It may support automation logic,
          platform-connected execution steps, or strategy-based workflow
          management depending on the agent configuration.
        </p>
      </section>
    </>
  );
}

export function generateStaticParams() {
  return products
    .filter((product) => product.active)
    .map((product) => ({ slug: product.slug }));
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
  const isSubscriptionProduct = isSubscriptionAgentSlug(product.slug);

  return (
    <main className="section-bg-primary product-page">
      <div className="product-detail">
        <div className="product-content">
          {isSubscriptionProduct ? (
            <SubscriptionProductOverview product={product} />
          ) : (
            <GenericProductOverview product={product} />
          )}

          {!isSubscriptionProduct ? (
            <>
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
            </>
          ) : null}

          <section>
            <h2 className="subsection-title">Frequently Asked Questions</h2>
            <div style={{ marginTop: 16 }}>
              <ProductFAQ faqs={product.faqs} />
            </div>
          </section>

          {product.reviews.length > 0 ? (
            <section>
              <h2 className="subsection-title">Reviews</h2>
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
