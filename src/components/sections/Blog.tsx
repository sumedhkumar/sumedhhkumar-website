"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

const posts = [
  {
    title: "How I Connected Claude to TradingView (MCP Guide)",
    category: "Claude",
    date: "2025",
    readTime: "8 min",
  },
  {
    title: "Building a Gold Scalping Strategy with Smart Money Concepts",
    category: "Trading",
    date: "2025",
    readTime: "12 min",
  },
  {
    title: "AWS Lambda + Claude API: Serverless Document Processing",
    category: "AWS",
    date: "2025",
    readTime: "6 min",
  },
  {
    title: "Pine Script v5: Dynamic TP/SL with ATR-Based Exits",
    category: "Pine Script",
    date: "2025",
    readTime: "10 min",
  },
];

export default function Blog() {
  return (
    <section id="blog" className="py-24 px-6 bg-surface/50">
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          title="Knowledge Hub"
          subtitle="Deep dives into AI, trading, and automation systems."
        />

        <div className="space-y-4">
          {posts.map((post, i) => (
            <motion.a
              key={post.title}
              href="#"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="glass-card rounded-xl p-5 flex items-center justify-between gap-4 hover:border-accent/30 transition-colors duration-300 cursor-pointer group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-muted">
                    {post.date} &middot; {post.readTime}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-medium group-hover:text-accent transition-colors">
                  {post.title}
                </h3>
              </div>
              <ArrowUpRight
                size={16}
                className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
