import { Code2, Cpu, PanelsTopLeft, Users } from "lucide-react";
import SectionIntro from "@/components/ui/SectionIntro";

const visualCards = [
  { icon: Cpu, label: "AI Trading Software Agents" },
  { icon: Users, label: "Expert Consultations" },
  { icon: Code2, label: "Custom Software Systems" },
  { icon: PanelsTopLeft, label: "Websites and Web Platforms" },
];

export default function AboutVyntegra() {
  return (
    <section id="about-vyntegra" className="section section-bg-secondary">
      <div className="container about-grid">
        <div>
          <SectionIntro heading="About Vyntegra" />
          <div style={{ display: "grid", gap: 16 }}>
            <p className="body-standard">
              Vyntegra develops practical technology solutions for real-world
              requirements. Our work includes ready-to-use AI trading software
              agents, expert consultations, websites, web platforms, custom
              software systems, workflow automation, and AI-enabled solutions
              where they add genuine value.
            </p>
            <p className="body-standard">
              We focus on clarity, usability, transparent communication, and
              solutions designed around the customer’s actual needs.
            </p>
          </div>
        </div>

        <div className="about-visual-grid">
          {visualCards.map((card) => (
            <article
              key={card.label}
              className="standard-card"
              style={{ minHeight: 132, padding: 20 }}
            >
              <card.icon size={20} color="#C7A56A" strokeWidth={1.75} />
              <p className="card-title" style={{ marginTop: 18 }}>
                {card.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
