import {
  BadgeDollarSign,
  Headphones,
  IdCard,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";

const pillars = [
  {
    title: "Build With Context",
    icon: Wrench,
    copy:
      "Digital products, automations, and AI systems are shaped around real business requirements instead of generic packages.",
  },
  {
    title: "Buy With Clarity",
    icon: BadgeDollarSign,
    copy:
      "Product details, consultation flows, and USD pricing stay visible before a customer makes a decision.",
  },
  {
    title: "Work With Experts",
    icon: Headphones,
    copy:
      "Customers can review professional profiles, ask for support, and move from enquiry to next step with less friction.",
  },
];

const proofPoints = [
  {
    label: "Secure payment options",
    icon: ShieldCheck,
  },
  {
    label: "Detailed expert profiles",
    icon: IdCard,
  },
  {
    label: "Tailored solution scope",
    icon: SlidersHorizontal,
  },
  {
    label: "Direct customer support",
    icon: Headphones,
  },
];

export default function WhyVyntegra() {
  return (
    <section id="why-vyntegra" className="section section-bg-primary">
      <div className="container">
        <div className="why-layout">
          <div className="why-copy">
            <p className="eyebrow">Why Vyntegra</p>
            <h2 className="section-title" style={{ marginTop: 12 }}>
              Built for serious digital work.
            </h2>
            <p className="body-large">
              A tighter process for customers who want usable software,
              transparent buying paths, and technical guidance without the
              usual ambiguity.
            </p>
            <div className="why-rule" aria-hidden="true" />
          </div>

          <div className="why-content">
            <div className="why-pillars">
              {pillars.map((pillar) => (
                <article key={pillar.title} className="standard-card why-pillar">
                  <span className="why-pillar-icon">
                    <pillar.icon size={18} strokeWidth={1.75} />
                  </span>
                  <h3 className="card-title">{pillar.title}</h3>
                  <p className="body-compact">{pillar.copy}</p>
                </article>
              ))}
            </div>

            <div className="why-proof-strip" aria-label="Vyntegra proof points">
              {proofPoints.map((point) => (
                <div key={point.label} className="why-proof-item">
                  <point.icon size={17} strokeWidth={1.75} />
                  <span>{point.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
