import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { products } from "@/data/products";
import { hasAnyPaymentConfiguration } from "@/lib/config";
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

  const paymentsConfigured = hasAnyPaymentConfiguration();

  return (
    <main className="section-bg-primary product-page">
      <div className="product-detail">
        <div className="product-content">
          <header>
            <h1 className="page-title">{product.name}</h1>
            <p className="body-large" style={{ marginTop: 16 }}>
              {product.shortDescription}
            </p>
          </header>

          <section>
            <h2 className="subsection-title">Key Capabilities</h2>
            {renderList(product.keyCapabilities)}
          </section>

          <section>
            <h2 className="subsection-title">Compatibility and Requirements</h2>
            {renderList(product.requirements)}
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
            <h2 className="subsection-title">Setup Process</h2>
            {renderList(product.setupSteps)}
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
              <h2 className="subsection-title">Customer Reviews</h2>
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
        />
      </div>
      <MobileAgentPurchaseBar
        product={product}
        paymentsConfigured={paymentsConfigured}
      />
    </main>
  );
}

