"use client";

import { motion } from "motion/react";
import { Check, ArrowRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";

const services = [
  {
    title: "Claude × TradingView Setup",
    price: "₹2,000",
    delivery: "2-3 days",
    includes: [
      "Full MCP integration setup",
      "TradingView connection via CDP",
      "Custom indicator reading",
      "Troubleshooting & support",
    ],
    popular: true,
  },
  {
    title: "AWS Credits + Claude API",
    price: "₹1,000",
    delivery: "1-2 days",
    includes: [
      "AWS account setup guidance",
      "Claude API configuration",
      "Lambda function templates",
      "Cost optimization tips",
    ],
    popular: false,
  },
  {
    title: "Strategy → Pine Script",
    price: "₹750",
    delivery: "3-5 days",
    includes: [
      "Convert your strategy to Pine Script",
      "Backtesting on TradingView",
      "Parameter optimization",
      "Backtest report (+₹250)",
    ],
    popular: false,
  },
  {
    title: "MT5 EA Bot",
    price: "₹1,500",
    delivery: "5-7 days",
    includes: [
      "Custom Expert Advisor in MQL5",
      "Risk management built-in",
      "Telegram alerts integration",
      "Demo account testing",
    ],
    popular: false,
  },
  {
    title: "Career Guidance",
    price: "₹199",
    delivery: "30 min call",
    includes: [
      "1-on-1 video call",
      "AI/trading career roadmap",
      "Personalized learning path",
      "Resource recommendations",
    ],
    popular: false,
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 px-6 bg-surface/50">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          title="Services"
          subtitle="Skip the trial-and-error. Get implementation, not tutorials."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`glass-card rounded-2xl p-6 relative flex flex-col hover:shadow-[0_0_30px_rgba(202,138,4,0.08)] transition-shadow duration-300 ${
                service.popular ? "border-accent/40 shadow-[0_0_40px_rgba(202,138,4,0.1)]" : ""
              }`}
            >
              {service.popular && (
                <span className="absolute -top-3 left-6 bg-accent text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Popular
                </span>
              )}

              <h3 className="font-semibold text-lg">{service.title}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold gradient-text">
                  {service.price}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">
                Delivery: {service.delivery}
              </p>

              <ul className="mt-6 space-y-3 flex-1">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check
                      size={14}
                      className="text-accent mt-0.5 shrink-0"
                    />
                    <span className="text-muted">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium bg-accent/10 text-accent hover:bg-accent hover:text-black transition-all duration-200 cursor-pointer"
              >
                Buy Now <ArrowRight size={14} />
              </a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted mt-8"
        >
          Payments via Razorpay (UPI, Cards, Net Banking). Full refund if not
          delivered.
        </motion.p>
      </div>
    </section>
  );
}
