"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Download, CheckCircle } from "lucide-react";

export default function Roadmap() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section id="roadmap" className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
            <Download size={28} className="text-accent" />
          </div>

          <h2 className="font-[var(--font-archivo)] text-3xl sm:text-4xl font-bold">
            Get the AI Engineer Roadmap
          </h2>
          <p className="mt-4 text-muted">
            A curated learning path covering Claude, AWS, Pine Script,
            automation, and real-world implementation — not theory.
          </p>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 glass-card rounded-2xl p-6 inline-flex items-center gap-3"
            >
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-sm">
                Check your email! Roadmap is on the way.
              </span>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-card border border-card-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
              />
              <button
                type="submit"
                className="bg-accent text-black px-6 py-3 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer whitespace-nowrap"
              >
                Download Free
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-muted/50">
            No spam. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
