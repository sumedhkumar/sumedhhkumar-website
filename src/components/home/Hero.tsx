import { ArrowRight, Code2 } from "lucide-react";
import Button from "@/components/ui/Button";
import HeroCanvas from "@/components/home/HeroCanvas";

export default function Hero() {
  return (
    <section id="top" className="hero-section">
      <HeroCanvas />
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-pill">
            <span />
            AI Trading Software Agents
          </div>
          <h1 className="hero-title">
            Trading software built for disciplined execution.
          </h1>
          <p className="body-large">
            Vyntegra builds AI Trading Software Agents and custom automation systems that help convert trading logic into structured, execution-ready workflows.
          </p>
          <p className="hero-support-copy">
            No profit promises. No hype. Just serious software for traders who want better systems, cleaner automation, and professional implementation.
          </p>
          <div className="hero-actions">
            <Button href="/ai-trading-agents" variant="primary">
              Explore Agents <ArrowRight size={16} strokeWidth={1.75} />
            </Button>
            <Button href="/experts" variant="secondary">
              Talk to an Expert <ArrowRight size={16} strokeWidth={1.75} />
            </Button>
            <Button href="/custom-solutions" variant="secondary">
              Custom Software <Code2 size={16} strokeWidth={1.75} />
            </Button>
          </div>
          <p className="hero-risk-note">
            Trading involves risk. Software can support execution, but it cannot guarantee results.
          </p>
        </div>
      </div>
    </section>
  );
}
