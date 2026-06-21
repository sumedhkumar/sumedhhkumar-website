import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  getAgentSubscriptionPlans,
  isSubscriptionAgentSlug,
  type SubscriptionAgentSlug,
} from "@/data/agent-subscription-plans";
import { products } from "@/data/products";
import { hasProductRazorpayCheckoutConfiguration } from "@/lib/config";
import { getCryptoPaymentConfig } from "@/lib/payments/crypto";
import AgentPurchaseCard from "@/components/products/AgentPurchaseCard";
import AgentVisualGallery from "@/components/products/AgentVisualGallery";
import MobileAgentPurchaseBar from "@/components/products/MobileAgentPurchaseBar";
import ProductFAQ from "@/components/products/ProductFAQ";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type Product = (typeof products)[number];

type SubscriptionPageConfig = {
  subtitle: string;
  badges: string[];
  backtestTitle: string;
  backtestMetrics: [string, string][];
  overviewTitle: string;
  overviewCopy: string;
  specifications: [string, string][];
  worksTitle: string;
  worksSteps: string[];
  includedItems?: string[];
  operatingNotes: string[];
  performanceDisclaimer?: string;
};

function findProduct(slug: string) {
  return products.find((product) => product.slug === slug && product.active);
}

function renderList(items: string[]) {
  return (
    <ul className="pdp-checklist">
      {items.map((item) => (
        <li key={item} className="body-standard pdp-checklist-item">
          <CheckCircle2
            size={16}
            color="#B8914A"
            strokeWidth={1.75}
            className="pdp-checklist-icon"
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
    backtestTitle: "Backtest reference",
    backtestMetrics: [
      ["Backtest period", "2023-2025"],
      ["Mode", "Selective setups"],
      ["Risk model", "Fixed-risk execution"],
    ],
    overviewTitle: "How Astro-Vyn Gold works",
    overviewCopy:
      "Astro-Vyn Gold focuses on selective XAUUSD setups, fixed-risk execution, spread checks, breakeven logic, trailing stops, and lot caps for account protection.",
    specifications: [
      ["Platform", "MetaTrader 5 (MT5)"],
      ["Instrument", "XAUUSD Gold"],
      ["Operating focus", "Selective London-session workflows"],
      ["Execution controls", "Spread checks, breakeven, trailing stops, and lot caps"],
      ["Access", "Subscription license based on the selected plan"],
    ],
    worksTitle: "Get started",
    worksSteps: [
      "Choose a subscription term and complete checkout.",
      "Install and configure the software on MetaTrader 5.",
      "Run it on demo first and review behavior across London-session setups.",
    ],
    includedItems: [
      "Compiled Astro-Vyn Gold MT5 EA file for installation.",
      "Subscription license based on the selected plan.",
      "Setup guide and updates during the active subscription.",
      "Support access through the existing Vyntegra support flow.",
    ],
    operatingNotes: [
      "MetaTrader 5 account access is required; a stable VPS or desktop environment is recommended.",
      "Execution controls include spread checks, breakeven logic, trailing stops, and lot caps.",
      "Fixed-risk parameters and controlled trade frequency are part of the operating model.",
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
    backtestTitle: "Historical test reference",
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
    specifications: [
      ["Platform", "MetaTrader 5 (MT5)"],
      ["Instrument", "XAUUSD Gold"],
      ["Strategy", "Donchian breakout with ATR-based trailing"],
      ["Risk model", "Fixed-risk settings with day filters and cooldowns"],
      ["Access", "Subscription license based on the selected plan"],
    ],
    worksTitle: "Get started",
    worksSteps: [
      "Configure the software on MetaTrader 5 for XAUUSD.",
      "Use demo mode first to observe behavior across changing volatility.",
      "Review day filters, cooldowns, ATR stop logic, and trailing-stop settings before any live-market evaluation.",
    ],
    includedItems: [
      "Compiled Sentinel-Vyn MT5 EA file for installation.",
      "Subscription license based on the selected plan.",
      "Setup guide and updates during the active subscription.",
      "Support access through the existing Vyntegra support flow.",
    ],
    operatingNotes: [
      "MetaTrader 5 and XAUUSD access are required; test on demo before live-market evaluation.",
      "Fixed-risk operation does not use martingale, grid, or doubling-down logic.",
      "ATR stop logic, dynamic trailing, day filters, and cooldowns support the operating controls.",
      "The deposit reference is $500, with $1,000 preferred; leverage guidance is 1:100 to 1:500 depending on broker rules and risk tolerance.",
      "You remain responsible for risk settings, account exposure, and trading decisions.",
    ],
  },
  "apex-flux": {
    subtitle:
      "The Bitcoin trading software agent that does not chase. It waits for 18 SMA confirmation, then manages momentum with dynamic trailing exits.",
    badges: [
      "MT5",
      "BTCUSD Perpetual Futures",
      "5 Minute",
      "18 SMA Momentum",
      "Dynamic Trail",
    ],
    backtestTitle: "Provided test-period reference",
    backtestMetrics: [
      ["Total PnL", "+$7,587.45 (+0.76%)"],
      ["Profit factor", "8.458"],
      ["Win rate", "63.85% (83 of 130 trades)"],
      ["Reported max drawdown", "0.03% ($302.60)"],
      ["Total trades", "130 across 21 days"],
    ],
    performanceDisclaimer:
      "Past performance is not a guarantee of future results. These are provided test-period results, not a forecast. Trading involves risk. Always test on demo first and use risk settings appropriate for your account.",
    overviewTitle: "How Apex-Flux works",
    overviewCopy:
      "Apex-Flux is built for BTCUSD perpetual futures on MetaTrader 5. It uses 18 SMA momentum confirmation on the 5-minute chart to support selective trend entries, then uses dynamic trailing exits to manage an extended move until the trend invalidates.",
    specifications: [
      ["Platform", "MetaTrader 5 (MT5)"],
      ["Instrument", "BTCUSD perpetual futures"],
      ["Timeframe", "5 minutes"],
      ["Strategy", "18 SMA momentum with dynamic trailing exits"],
      ["Access", "Subscription license based on the selected plan"],
    ],
    worksTitle: "Get started",
    worksSteps: [
      "Download and install the compiled MT5 EA.",
      "Connect it to a BTCUSD 5-minute chart on MetaTrader 5.",
      "Enable automated trading, monitor settings, and test on demo before live use.",
    ],
    includedItems: [
      "Compiled Apex-Flux MT5 EA file for installation.",
      "Subscription license based on the selected plan.",
      "Setup guide and updates during the active subscription.",
      "Support access through the existing Vyntegra support flow.",
    ],
    operatingNotes: [
      "Designed for BTCUSD perpetual futures unless another instrument has been separately tested.",
      "MetaTrader 5 with BTCUSD access is required; a VPS is recommended for 24/7 Bitcoin markets.",
      "The deposit reference is $500, with $1,000 or more providing additional operating room; leverage guidance is 1:10 to 1:50 depending on broker rules and risk tolerance.",
      "Entries are SMA-confirmed, trades are independent, and the product does not use grid, martingale, or doubling-down logic.",
      "Risk per trade is configurable; 1-2% is a reference range, not a requirement. Demo testing for 1-2 weeks is recommended before live use.",
    ],
  },
};

function formatUsdInline(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function SubscriptionProductOverview({ product }: { product: Product }) {
  if (!isSubscriptionAgentSlug(product.slug)) {
    return null;
  }

  const config = subscriptionConfigs[product.slug];

  return (
    <>
      {/* ── Hero ── */}
      <header className="astro-gold-hero-panel pdp-hero">
        <p className="eyebrow pdp-hero-eyebrow">AI Trading Software Agent</p>
        <h1 className="page-title pdp-hero-title">{product.name}</h1>
        <p className="body-large astro-gold-subtitle pdp-hero-subtitle">{config.subtitle}</p>
        <div className="astro-gold-badge-row" aria-label="Product attributes">
          {config.badges.map((badge) => (
            <span key={badge} className="astro-gold-badge">
              {badge}
            </span>
          ))}
        </div>
      </header>

      {/* ── Overview + Specifications ── */}
      <section className="agent-product-summary pdp-section">
        <div className="pdp-section-header">
          <h2 className="subsection-title">{config.overviewTitle}</h2>
        </div>
        <p className="body-standard pdp-overview-copy">
          {config.overviewCopy}
        </p>
        <div className="pdp-specs-block">
          <h3 className="agent-inline-heading">Technical specifications</h3>
          <dl className="agent-specification-list">
            {config.specifications.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Backtest Metrics ── */}
      <section className="pdp-section pdp-metrics-section">
        <div className="pdp-section-header">
          <p className="eyebrow">Performance Data</p>
          <h2 className="subsection-title">{config.backtestTitle}</h2>
        </div>
        <div className="astro-gold-metric-grid pdp-metric-grid">
          {config.backtestMetrics.map(([label, value]) => (
            <div key={label} className="astro-gold-metric-card pdp-metric-card">
              <span className="pdp-metric-label">{label}</span>
              <strong className="pdp-metric-value">{value}</strong>
            </div>
          ))}
        </div>
        <p className="astro-gold-risk-disclaimer pdp-disclaimer">
          {config.performanceDisclaimer ??
            "Historical backtests are simulations based on past data and do not guarantee future results. Trading involves risk. Test on demo before using trading software in live market conditions."}
        </p>
      </section>

      {/* ── Subscription Plans ── */}
      <section className="pdp-section pdp-plans-section">
        <div className="astro-gold-section-heading pdp-plans-header">
          <div>
            <p className="eyebrow">Subscription Access</p>
            <h2 className="subsection-title">Choose your access term</h2>
          </div>
          <Link className="btn btn-secondary pdp-plans-cta" href={`/ai-trading-agents/${product.slug}/plans`}>
            Compare Plans
          </Link>
        </div>
        <div className="astro-gold-plan-grid pdp-plan-grid">
          {getAgentSubscriptionPlans(product.slug).map((plan, index) => {
            const badgeLabel = index === 0 ? "Entry Access" : index === 1 ? "Recommended" : "Best Value";
            const discountedPrice = plan.originalPriceUsd * 0.5;
            return (
              <article key={plan.id} className="astro-gold-plan-card pdp-plan-card">
                <span className="pdp-plan-badge">{badgeLabel}</span>
                <p className="pdp-plan-duration">{plan.durationLabel}</p>
                <h3 className="pdp-plan-name">{plan.name}</h3>
                <div className="pdp-plan-pricing">
                  <span className="pdp-plan-original">{formatUsdInline(plan.originalPriceUsd)}</span>
                  <strong className="pdp-plan-final">{formatUsdInline(discountedPrice)}</strong>
                </div>
                <span className="pdp-plan-coupon-tag">with EARLYACCESS</span>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Get Started Steps ── */}
      <section className="pdp-section pdp-steps-section">
        <div className="pdp-section-header">
          <p className="eyebrow">Setup</p>
          <h2 className="subsection-title">{config.worksTitle}</h2>
        </div>
        <ol className="astro-gold-step-list pdp-step-list">
          {config.worksSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {/* ── What you get ── */}
      {config.includedItems ? (
        <section className="pdp-section pdp-included-section">
          <div className="pdp-section-header">
            <p className="eyebrow">Included</p>
            <h2 className="subsection-title">What you get</h2>
          </div>
          {renderList(config.includedItems)}
        </section>
      ) : null}

      {/* ── Operating Notes ── */}
      <section className="pdp-section pdp-notes-section">
        <div className="pdp-section-header">
          <p className="eyebrow">Requirements</p>
          <h2 className="subsection-title">Operating requirements and controls</h2>
        </div>
        {renderList(config.operatingNotes)}
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

          <section className="pdp-section pdp-faq-section">
            <div className="pdp-section-header">
              <p className="eyebrow">Support</p>
              <h2 className="subsection-title">Frequently Asked Questions</h2>
            </div>
            <div className="pdp-faq-list">
              <ProductFAQ faqs={product.faqs} />
            </div>
          </section>

          {product.reviews.length > 0 ? (
            <section className="pdp-section pdp-reviews-section">
              <div className="pdp-section-header">
                <p className="eyebrow">Feedback</p>
                <h2 className="subsection-title">Reviews</h2>
              </div>
              <div className="pdp-reviews-grid">
                {product.reviews.map((review) => (
                  <article key={review.reviewText} className="pdp-review-card">
                    <p className="body-standard pdp-review-text">{review.reviewText}</p>
                    <p className="pdp-review-author">{review.reviewerName}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="product-aside">
          <AgentVisualGallery product={product} />
          <AgentPurchaseCard
            product={product}
            paymentsConfigured={paymentsConfigured}
            cryptoPaymentConfig={cryptoPaymentConfig}
          />
        </aside>
      </div>
      <MobileAgentPurchaseBar
        product={product}
        paymentsConfigured={paymentsConfigured}
        cryptoPaymentConfig={cryptoPaymentConfig}
      />
    </main>
  );
}
