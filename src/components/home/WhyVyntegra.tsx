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
    title: "Workflow first",
    icon: SlidersHorizontal,
    copy: "We map the trading or business workflow before recommending software, so the build starts with a clear operational shape.",
  },
  {
    title: "Execution-ready systems",
    icon: Wrench,
    copy: "Agents, automations, and custom tools are built around structured logic, handoff clarity, and practical implementation.",
  },
  {
    title: "Commercial clarity",
    icon: BadgeDollarSign,
    copy: "Scope, pricing paths, and next steps stay visible, so customers know what they are buying before they commit.",
  },
  {
    title: "Risk-conscious delivery",
    icon: ShieldCheck,
    copy: "No profit promises. Every trading software workflow is positioned as a tool that still needs review, testing, and risk control.",
  },
];

const highlights = [
  { value: "01", label: "Map the requirement" },
  { value: "02", label: "Choose the right path" },
  { value: "03", label: "Build with accountability" },
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
    label: "Tailored software scope",
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
              Clear software thinking from idea to execution.
            </h2>
            <p className="body-large">
              Vyntegra is built for users who want practical software, transparent buying paths, and technical guidance without inflated claims.
            </p>
            <div className="why-rule" aria-hidden="true" />
            <div className="why-highlights" aria-label="Vyntegra process highlights">
              {highlights.map((highlight) => (
                <div key={highlight.value} className="why-highlight">
                  <strong>{highlight.value}</strong>
                  <span>{highlight.label}</span>
                </div>
              ))}
            </div>
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
