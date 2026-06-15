import { ArrowRight, Code2, Cpu, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import SectionIntro from "@/components/ui/SectionIntro";

const offerings = [
  {
    icon: Cpu,
    title: "AI Trading Software Agents",
    description:
      "Ready-to-use trading software agents designed for defined strategies, structured execution, and platform-connected workflows.",
    cta: "View Agents",
    target: "/ai-trading-agents",
  },
  {
    icon: Users,
    title: "Strategy-to-Automation Systems",
    description:
      "Convert trading ideas, indicators, and rules into practical software workflows that can be tested, reviewed, and deployed with discipline.",
    cta: "Build a Trading System",
    target: "/experts",
  },
  {
    icon: Code2,
    title: "Custom Software Solutions",
    description:
      "Custom websites, dashboards, automation tools, and business software built around your exact workflow requirements.",
    cta: "Request a Custom Solution",
    target: "/custom-solutions",
  },
];

export default function CoreOfferings() {
  return (
    <section className="section section-bg-primary">
      <div className="container">
        <SectionIntro
          heading="What Vyntegra builds"
          copy="Technology for traders, teams, and businesses that need reliable software workflows instead of scattered manual processes."
        />

        <div className="offering-grid">
          {offerings.map((offering) => (
            <article
              key={offering.title}
              className="standard-card clickable-card"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <offering.icon
                size={20}
                color="#B8914A"
                strokeWidth={1.75}
                style={{ marginBottom: 20 }}
              />
              <h3 className="card-title" style={{ marginBottom: 12 }}>
                {offering.title}
              </h3>
              <p className="body-standard" style={{ flexGrow: 1 }}>
                {offering.description}
              </p>
              <Button
                href={offering.target}
                variant="secondary"
                style={{ marginTop: 24 }}
              >
                {offering.cta} <ArrowRight size={16} strokeWidth={1.75} />
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

