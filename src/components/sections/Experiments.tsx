"use client";

import { motion } from "motion/react";
import { ExternalLink, Zap, TrendingUp, Bot, Code } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

const experiments = [
  {
    number: "01",
    title: "Claude × TradingView MCP",
    desc: "Connected Claude Code to a live TradingView chart via Chrome DevTools Protocol. Real-time chart control, indicator reading, and strategy deployment from the terminal.",
    outcome: "Working integration — read indicators, deploy Pine Script, take screenshots, all via natural language.",
    icon: Zap,
    tags: ["Claude", "MCP", "CDP", "TradingView"],
  },
  {
    number: "02",
    title: "LuxAlgo Hybrid Gold Scalper",
    desc: "Built a Pine Script strategy combining Smart Money Concepts (Order Blocks, FVG, Liquidity Sweeps) with trend filters and dynamic TP/SL on 5-min Gold.",
    outcome: "Confluence scoring system (7/13 min), breakeven mechanism, session filtering — designed to cut almost all trades in profit.",
    icon: TrendingUp,
    tags: ["Pine Script", "Gold", "SMC", "Strategy"],
  },
  {
    number: "03",
    title: "AWS + Claude API Pipeline",
    desc: "Serverless architecture using AWS Lambda, API Gateway, and Claude APIs for automated document processing and analysis.",
    outcome: "Production-ready pipeline processing 1000+ documents/day with <2s latency.",
    icon: Bot,
    tags: ["AWS", "Lambda", "Claude API", "Serverless"],
  },
  {
    number: "04",
    title: "MT5 Expert Advisor Bot",
    desc: "Automated trading bot for MetaTrader 5 with risk management, trailing stops, and multi-timeframe analysis built in MQL5.",
    outcome: "Live-tested on demo accounts with configurable risk parameters and Telegram alerts.",
    icon: Code,
    tags: ["MT5", "MQL5", "Automation", "Trading"],
  },
];

export default function Experiments() {
  return (
    <section id="experiments" className="py-24 px-6 bg-surface/50">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          title="Experiments"
          subtitle="Public R&D — real systems tested in production, not tutorials."
        />

        <div className="grid md:grid-cols-2 gap-6">
          {experiments.map((exp, i) => (
            <motion.div
              key={exp.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 hover:border-accent/30 transition-colors duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <exp.icon size={20} className="text-accent" />
                  </div>
                  <span className="text-xs text-muted font-mono">
                    #{exp.number}
                  </span>
                </div>
                <ExternalLink
                  size={16}
                  className="text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              <h3 className="text-lg font-semibold mb-2">{exp.title}</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                {exp.desc}
              </p>

              <div className="border-t border-card-border pt-4">
                <p className="text-xs text-accent font-medium mb-3">
                  Outcome:
                </p>
                <p className="text-sm text-muted">{exp.outcome}</p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-muted border border-card-border rounded-full px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
