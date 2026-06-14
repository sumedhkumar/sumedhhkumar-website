import { ArrowRight, Bot, UserRoundCheck, Workflow } from "lucide-react";

const pathways = [
  {
    title: "AI Trading Agents",
    copy: "Ready-to-use software agents for structured trading workflows.",
    href: "/ai-trading-agents",
    cta: "View agents",
    icon: Bot,
  },
  {
    title: "Talk to Experts",
    copy: "Book focused consultation with experienced professionals.",
    href: "/experts",
    cta: "Explore experts",
    icon: UserRoundCheck,
  },
  {
    title: "Custom Solutions",
    copy: "Request websites, automations, AI systems, or tailored software.",
    href: "/custom-solutions",
    cta: "Request a quote",
    icon: Workflow,
  },
];

export default function ProductPathways() {
  return (
    <section className="product-pathways-section" aria-label="Vyntegra main products">
      <div className="container">
        <div className="product-pathways depth-panel">
          {pathways.map((pathway) => (
            <a key={pathway.title} href={pathway.href} className="product-pathway">
              <span className="product-pathway-icon">
                <pathway.icon size={20} strokeWidth={1.75} />
              </span>
              <span className="product-pathway-copy">
                <strong>{pathway.title}</strong>
                <span>{pathway.copy}</span>
              </span>
              <span className="product-pathway-cta">
                {pathway.cta}
                <ArrowRight size={15} strokeWidth={1.85} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}