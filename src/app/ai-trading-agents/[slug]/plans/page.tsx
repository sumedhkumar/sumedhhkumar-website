import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  agentSubscriptionPlans,
  isSubscriptionAgentSlug,
} from "@/data/agent-subscription-plans";
import { products } from "@/data/products";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const planChips = ["MT5", "XAUUSD Gold", "Subscription Access", "Demo First"];

function formatUsd(value: number) {
  return `$${value}`;
}

function findProduct(slug: string) {
  return products.find((product) => product.slug === slug && product.active);
}

export function generateStaticParams() {
  return products
    .filter((product) => product.active && isSubscriptionAgentSlug(product.slug))
    .map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product || !isSubscriptionAgentSlug(product.slug)) {
    return {
      title: "AI Trading Software Agent Plans | Vyntegra",
    };
  }

  return {
    title: `Choose your ${product.name} subscription | Vyntegra`,
    description: `Select a ${product.name} subscription access term for demo testing or live evaluation.`,
  };
}

export default async function SubscriptionPlansPage({ params }: PageProps) {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product || !isSubscriptionAgentSlug(product.slug)) {
    notFound();
  }

  return (
    <main className="section-bg-primary astro-gold-plans-page">
      <div className="astro-gold-plans-shell">
        <header className="astro-gold-plans-hero">
          <p className="eyebrow">{product.name} Plans</p>
          <h1 className="page-title">Choose your {product.name} subscription</h1>
          <p className="body-large">
            Select the access term that fits your testing or live-evaluation
            plan. Start on demo before using any trading software on a live
            account.
          </p>
          <div className="astro-gold-badge-row" aria-label="Plan attributes">
            {planChips.map((chip) => (
              <span key={chip} className="astro-gold-badge">
                {chip}
              </span>
            ))}
          </div>
        </header>

        <section className="astro-gold-plans-grid" aria-label={`${product.name} subscription plans`}>
          {agentSubscriptionPlans.map((plan) => {
            const checkoutHref = `/ai-trading-agents/${product.slug}/checkout?plan=${plan.id}`;

            return (
              <article key={plan.id} className="astro-gold-pricing-card">
                <div className="astro-gold-pricing-card-top">
                  <div>
                    <p className="body-compact">{plan.durationLabel}</p>
                    <h2 className="card-title">{plan.name}</h2>
                  </div>
                  <CheckCircle2 size={22} color="#B8914A" strokeWidth={1.75} />
                </div>
                <p className="astro-gold-pricing-note">{plan.note}</p>
                <div className="astro-gold-pricing-price-row">
                  <span>{formatUsd(plan.originalPriceUsd)}</span>
                  <strong>{formatUsd(plan.priceUsd)}</strong>
                </div>
                <Link className="btn btn-primary" href={checkoutHref}>
                  Buy Now
                </Link>
              </article>
            );
          })}
        </section>

        <section className="astro-gold-plans-risk-note">
          <p>
            Subscriptions provide access for the selected term. Trading involves
            risk. Past performance and backtest results do not guarantee future
            results. {product.name} is trading software, not investment advice.
            Users are responsible for their own trading decisions.
          </p>
        </section>

        <Link className="astro-gold-back-link" href={`/ai-trading-agents/${product.slug}`}>
          Back to {product.name} overview
        </Link>
      </div>
    </main>
  );
}
