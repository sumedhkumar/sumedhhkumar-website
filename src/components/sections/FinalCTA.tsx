"use client";

import { motion } from "motion/react";
import { ArrowRight, MessageCircle } from "lucide-react";
import Button from "../ui/Button";

export default function FinalCTA() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-[var(--font-archivo)] text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Need AI implementation
            <br />
            <span className="gradient-text">instead of tutorials?</span>
          </h2>
          <p className="mt-6 text-muted text-lg max-w-xl mx-auto">
            Let&apos;s talk about your project. I&apos;ll tell you exactly what&apos;s
            possible, what it costs, and how fast we can ship.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" href="#services">
              View Services <ArrowRight size={16} />
            </Button>
            <Button
              variant="secondary"
              href="https://wa.me/918999577757"
            >
              <MessageCircle size={16} /> WhatsApp
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
