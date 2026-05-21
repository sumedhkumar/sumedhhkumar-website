"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

const faqs = [
  {
    q: "Who are your services for?",
    a: "Traders who want automated strategies, creators who want AI integrations, businesses that need Claude/AWS implementation, and anyone who wants to skip the learning curve and go straight to results.",
  },
  {
    q: "What's your refund policy?",
    a: "Full refund if I can't deliver what was promised. No questions asked within 7 days of purchase if work hasn't started.",
  },
  {
    q: "How fast is delivery?",
    a: "Most services are delivered within 2-7 days depending on complexity. Career guidance calls are scheduled within 48 hours.",
  },
  {
    q: "Do you offer ongoing support?",
    a: "Yes, all services include 7 days of post-delivery support via WhatsApp/Email for any issues or questions.",
  },
  {
    q: "Can I see a demo before paying?",
    a: "Absolutely. Check the Experiments section — those are real demos of my work. For custom projects, I can share a brief overview of the approach before you commit.",
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 bg-surface/50">
      <div className="max-w-3xl mx-auto">
        <SectionHeading title="FAQ" />

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
              >
                <span className="text-sm font-medium pr-4">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-muted shrink-0 transition-transform duration-200 ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 pb-5 text-sm text-muted leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
