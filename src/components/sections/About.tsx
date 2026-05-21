"use client";

import { motion } from "motion/react";
import SectionHeading from "../ui/SectionHeading";

const timeline = [
  {
    year: "2017",
    title: "Trading Begins",
    desc: "Started trading Gold, Forex, and equities. Learned price action, risk management, and market structure the hard way.",
  },
  {
    year: "2020",
    title: "Algorithmic Trading",
    desc: "Moved from manual to systematic. Built Pine Script indicators, MT5 EAs, and backtesting frameworks.",
  },
  {
    year: "2023",
    title: "AI + Trading Convergence",
    desc: "Deep-dived into AI models. Started integrating Claude, GPT, and automation into trading workflows.",
  },
  {
    year: "2025",
    title: "Full-Stack AI Builder",
    desc: "Connected Claude to TradingView via MCP, deployed AWS pipelines, and now help others implement AI + trading systems.",
  },
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          title="Who is Sumedh?"
          subtitle="I experiment first, then help others implement what works."
        />

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-muted leading-relaxed">
              With <span className="text-foreground font-semibold">9+ years</span> in
              trading and AI, I&apos;ve done everything from manual price action on
              Gold to building fully automated systems that trade while I sleep.
              I don&apos;t theorize — I ship.
            </p>
            <p className="mt-4 text-muted leading-relaxed">
              From connecting Claude to live TradingView charts via MCP, to
              deploying serverless AI pipelines on AWS, to writing profitable
              Pine Script strategies — every experiment here was built from
              scratch and tested in real markets.
            </p>
            <p className="mt-4 text-muted leading-relaxed">
              My approach: test publicly, document results, package for others.
              I help traders, creators, and businesses skip months of
              trial-and-error and go straight to working implementations.
            </p>
            <p className="mt-6 text-foreground font-medium border-l-2 border-accent pl-4">
              &ldquo;I test AI systems before mainstream adoption and help people
              implement them.&rdquo;
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-card-border" />
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative pl-10 pb-8 last:pb-0"
              >
                <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-accent bg-background" />
                <span className="text-accent text-sm font-semibold">
                  {item.year}
                </span>
                <h3 className="text-foreground font-semibold mt-1">
                  {item.title}
                </h3>
                <p className="text-muted text-sm mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
