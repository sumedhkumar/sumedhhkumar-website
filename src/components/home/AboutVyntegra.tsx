import {
  BadgeCheck,
  ClipboardCheck,
  Layers3,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SectionIntro from "@/components/ui/SectionIntro";

const methodSteps = [
  {
    number: "01",
    title: "Clarify the requirement",
    copy:
      "Understand the goal, user journey, constraints, and success criteria before recommending a solution.",
  },
  {
    number: "02",
    title: "Shape the system",
    copy:
      "Translate the requirement into a practical structure: features, flow, visuals, integrations, and delivery path.",
  },
  {
    number: "03",
    title: "Build with discipline",
    copy:
      "Focus on clean implementation, usable interfaces, clear communication, and reliable handoff.",
  },
];

const capabilities = [
  {
    icon: Sparkles,
    title: "AI-enabled products",
    copy: "AI agents, automation flows, trading dashboards, and intelligent business tools.",
  },
  {
    icon: Layers3,
    title: "Digital systems",
    copy: "Websites, web apps, internal tools, custom workflows, and structured product builds.",
  },
  {
    icon: MessagesSquare,
    title: "Consultative process",
    copy: "Transparent scoping, quotation support, expert discussions, and milestone clarity.",
  },
  {
    icon: ShieldCheck,
    title: "Premium execution",
    copy: "Graphite-first interfaces, restrained gold accents, responsive layouts, and clear UX.",
  },
];

export default function AboutVyntegra() {
  return (
    <section
      id="about-vyntegra"
      className="section section-bg-secondary about-section"
    >
      <div className="container about-grid">
        <div className="about-copy">
          <SectionIntro
            eyebrow="About Vyntegra"
            heading="A focused technology studio for serious digital work."
            copy="Vyntegra brings AI, software, and business workflows into one practical build process."
          />

          <div className="about-narrative">
            <p className="body-standard">
              The brand exists for customers who need more than a generic
              website or a vague automation idea. Every project starts with
              clarity: what the system must do, who will use it, what should be
              automated, and what needs to feel premium on screen.
            </p>
            <p className="body-standard">
              From AI trading software concepts to expert consultations and
              custom digital solutions, the goal is the same: structured
              thinking, polished interfaces, and execution that is easy to
              understand from first conversation to final delivery.
            </p>
          </div>

          <div className="about-method-list" aria-label="Vyntegra working method">
            {methodSteps.map((step) => (
              <article key={step.number} className="about-method-item">
                <span className="about-method-number">{step.number}</span>
                <div>
                  <h3 className="card-title">{step.title}</h3>
                  <p className="body-compact">{step.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="about-capability-panel">
          <div className="about-panel-header">
            <BadgeCheck size={18} strokeWidth={1.75} />
            <span>What Vyntegra is built to handle</span>
          </div>

          <div className="about-capability-list">
            {capabilities.map((item) => (
              <article key={item.title} className="about-capability-item">
                <span className="about-capability-icon">
                  <item.icon size={18} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="body-compact">{item.copy}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="about-delivery-note">
            <ClipboardCheck size={18} strokeWidth={1.75} />
            <p className="body-compact">
              Each engagement is scoped around usability, visual polish, and the
              technical path required to make the solution real.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
