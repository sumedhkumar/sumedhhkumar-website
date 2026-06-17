import { site } from "@/data/site";
import type { Expert } from "@/types";

export const experts: Expert[] = [
  {
    id: "expert-sumedh-kumar",
    slug: "sumedh-kumar",
    fullName: site.founderName,
    professionalPhoto: site.founderPhoto,
    specialization:
      "AI trading workflows, algo strategy planning, TradingView, MT5, broker API workflows, backtesting basics, and risk-control planning",
    currentRole: "AI Trading & Algo Strategy Consultation",
    professionalSummary:
      "Sumedh helps traders, founders, and teams understand how AI and automation can be applied to trading workflows. The consultation focuses on turning trading ideas into structured rules, understanding algo-trading implementation paths, reviewing automation possibilities, and identifying whether a ready-made trading agent, custom software, or expert-led setup is the right next step.",
    expertiseAreas: [
      "AI-assisted trading workflows",
      "Algo-trading logic and strategy structuring",
      "TradingView and Pine Script planning",
      "MT5 automation concepts",
      "Dhan, Kite, and broker API workflow planning",
      "Backtesting approach and result interpretation basics",
      "Risk controls, position sizing logic, and execution safeguards",
      "Choosing between AI trading agents, custom tools, and expert consultation",
    ],
    relevantExperience: [
      "Strategy clarity: Clarify whether your trading idea can be converted into algorithmic rules.",
      "Automation planning: Map the basic workflow from strategy idea to automation-ready logic.",
      "Platform direction: Identify the right platform path, such as TradingView, MT5, broker API, or a custom system.",
      "AI workflow review: Discuss how AI tools can support strategy building, coding, review, and iteration.",
      "Risk and execution checks: Review basic risk-control and execution-safety considerations.",
      "Next-step fit: Decide whether an existing Vyntegra agent, a custom solution, or further expert guidance fits your requirement.",
    ],
    qualifications: [
      "Education: Bachelor of Engineering from MGM's Jawaharlal Nehru Engineering College; MBA in Artificial Intelligence from DY Patil University.",
      "AI and automation background: Generative AI, AI agents, Python, data workflows, and practical software scoping.",
      "Trading workflow focus: Strategy logic, automation planning, AI-assisted review, platform selection, and implementation readiness.",
      "Platform discussion areas: TradingView, Pine Script, MT5 concepts, Dhan, Kite, broker APIs, and custom software paths.",
      "Risk-aware planning: Backtesting basics, position sizing logic, execution safeguards, and workflow limitations.",
      "Professional foundation: Data science, operations, and product-scoping experience applied to practical consultation sessions.",
    ],
    linkedInUrl: "https://www.linkedin.com/in/sumedhkumar-bhalerao/",
    socialLinks: site.founderSocialLinks,
    consultationTopics: [
      "AI in trading workflows",
      "Algo trading and strategy-to-rule conversion",
      "TradingView and Pine Script planning",
      "MT5 automation basics",
      "Dhan, Kite, and broker API workflow planning",
      "Backtesting basics and risk-control review",
      "Choosing between an agent, custom software, or expert guidance",
    ],
    sessions: [
      {
        id: "sumedh-30-minute-consultation",
        label: "30-Minute Expert Consultation",
        durationMinutes: 30,
        feeUsd: 49,
        active: true,
      },
    ],
    featured: true,
    active: true,
    availabilitySummary:
      "Available for focused consultations on AI trading workflows, algo strategy planning, TradingView, MT5, broker API paths, backtesting basics, and risk-control considerations.",
  },
];
