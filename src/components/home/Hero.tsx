import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section id="top" className="hero-section">
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">VYNTEGRA</p>
          <h1 className="hero-title">Technology solutions built with precision.</h1>
          <p className="body-large">
            Vyntegra develops AI trading software agents, connects customers
            with experienced professionals, and builds tailored websites,
            software systems, and AI-enabled solutions.
          </p>
          <div className="hero-actions">
            <Button href="/ai-trading-agents" variant="primary">
              Explore AI Trading Agents <ArrowRight size={16} strokeWidth={1.75} />
            </Button>
            <Button href="/experts" variant="secondary">
              Talk to Experts <ArrowRight size={16} strokeWidth={1.75} />
            </Button>
            <Button href="/#custom-solutions" variant="secondary">
              Request a Quote <ArrowRight size={16} strokeWidth={1.75} />
            </Button>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-panel hero-panel-top" />
          <div className="hero-panel hero-panel-middle">
            <svg viewBox="0 0 420 150" width="100%" height="100%">
              <path
                d="M8 116 C 44 80, 72 96, 104 70 S 170 48, 210 74 S 282 112, 326 56 S 380 34, 412 44"
                stroke="#C7A56A"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <div className="hero-panel-bottom">
            <div className="hero-panel" />
            <div className="hero-panel" />
          </div>
        </div>
      </div>
    </section>
  );
}
