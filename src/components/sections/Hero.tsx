"use client";

import { motion } from "motion/react";
import { ArrowRight, Download } from "lucide-react";
import Button from "../ui/Button";

const tags = [
  "AI Research",
  "Trading Automation",
  "Claude Integrations",
  "AWS",
  "Pine Script",
  "MT5",
];

const stats = [
  { value: "9+", label: "Years Trading" },
  { value: "50+", label: "AI Systems Built" },
  { value: "100+", label: "Pine Scripts" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-24">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      {/* Floating geometric shapes */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-[15%] w-20 h-20 border border-accent/10 rounded-2xl hidden lg:block"
      />
      <motion.div
        animate={{ y: [10, -10, 10], rotate: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 left-[10%] w-14 h-14 border border-card-border rounded-full hidden lg:block"
      />
      <motion.div
        animate={{ y: [-5, 15, -5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-[8%] w-2 h-2 bg-accent/40 rounded-full hidden lg:block"
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted">Available for projects</span>
          </motion.div>

          {/* Main headline */}
          <h1 className="font-[var(--font-archivo)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]">
            Building AI systems
            <br />
            <span className="gradient-text animated-gradient bg-[linear-gradient(135deg,#CA8A04,#EAB308,#FDE047,#CA8A04)]">
              before they go mainstream.
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed"
          >
            9+ years in trading. Building AI-powered automation with Claude,
            TradingView, AWS, Pine Script & MT5. I test systems in production,
            then help others implement.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="primary" href="#services">
              Hire Me <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" href="#roadmap">
              <Download size={16} /> Get Free AI Roadmap
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-16 flex justify-center gap-12 sm:gap-16"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-xs text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-12 flex flex-wrap justify-center gap-3"
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-muted border border-card-border rounded-full px-3 py-1.5 hover:border-accent/30 transition-colors"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
    </section>
  );
}
