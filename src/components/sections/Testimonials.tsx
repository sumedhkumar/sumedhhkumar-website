"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

const testimonials = [
  {
    name: "Rahul M.",
    role: "Trader",
    text: "Sumedh set up my Claude × TradingView integration in a day. What would have taken me weeks of debugging, he did in hours. Now I control my charts with natural language.",
    rating: 5,
  },
  {
    name: "Priya S.",
    role: "AI Enthusiast",
    text: "The Pine Script he wrote for my strategy was clean, well-optimized, and actually profitable on backtest. Worth every rupee.",
    rating: 5,
  },
  {
    name: "Ankit D.",
    role: "Startup Founder",
    text: "Got AWS + Claude API running for our document pipeline. The serverless setup he suggested cut our costs by 60% vs what we were paying before.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          title="Results"
          subtitle="Real outcomes from real implementations."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={14}
                    className="text-accent fill-accent"
                  />
                ))}
              </div>
              <p className="text-sm text-muted leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-card-border">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
