import type { TradingAgentProduct } from "@/types";

function svgDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function agentVisual(title: string, accent: string, path: string) {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#24272E"/>
          <stop offset="1" stop-color="#090A0C"/>
        </linearGradient>
        <linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#745B2E"/>
          <stop offset="0.56" stop-color="${accent}"/>
          <stop offset="1" stop-color="#D4C28D"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="750" fill="url(#bg)"/>
      <rect x="72" y="70" width="1056" height="610" rx="18" fill="#14161A" stroke="rgba(255,255,255,0.12)"/>
      <text x="116" y="136" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#F7F3EA">${title}</text>
      <text x="116" y="176" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#B8914A" letter-spacing="4">AI TRADING SOFTWARE AGENT</text>
      <rect x="116" y="228" width="290" height="126" rx="12" fill="#101114" stroke="rgba(255,255,255,0.10)"/>
      <rect x="456" y="228" width="290" height="126" rx="12" fill="#101114" stroke="rgba(255,255,255,0.10)"/>
      <rect x="796" y="228" width="290" height="126" rx="12" fill="#101114" stroke="rgba(255,255,255,0.10)"/>
      <text x="146" y="280" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#9CA0A7">Signal Score</text>
      <text x="146" y="322" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="#D4C28D">92.8%</text>
      <text x="486" y="280" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#9CA0A7">Risk Mode</text>
      <text x="486" y="322" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="#D4C28D">Guarded</text>
      <text x="826" y="280" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#9CA0A7">Latency</text>
      <text x="826" y="322" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="#D4C28D">18ms</text>
      <rect x="116" y="402" width="970" height="190" rx="14" fill="#1B1E23" stroke="rgba(255,255,255,0.10)"/>
      <path d="${path}" fill="none" stroke="url(#line)" stroke-width="8" stroke-linecap="round"/>
      <path d="M148 548 H1054 M148 500 H1054 M148 452 H1054" stroke="rgba(255,255,255,0.07)" stroke-width="2"/>
      <circle cx="992" cy="438" r="8" fill="${accent}"/>
      <text x="116" y="638" font-family="Arial, sans-serif" font-size="18" fill="#9CA0A7">Demo product visual. Trading software is not financial advice.</text>
    </svg>
  `);
}

const astroVynGoldVisual = agentVisual(
  "Astro-Vyn Gold",
  "#B8914A",
  "M148 532 C222 476 290 494 356 452 S492 410 584 458 S724 548 818 470 S954 404 1054 430",
);

const sentinelVisual = agentVisual(
  "Sentinel Grid",
  "#8FB8A0",
  "M148 510 C238 438 330 456 420 430 S604 388 682 454 S812 552 908 506 S1008 456 1054 412",
);

const driftVisual = agentVisual(
  "Drift Scalper",
  "#A9A0C8",
  "M148 548 C236 514 284 438 374 464 S512 540 598 476 S752 390 842 430 S986 524 1054 468",
);

export const products: TradingAgentProduct[] = [
  {
    id: "agent-pulse",
    slug: "astro-vyn-gold",
    name: "Astro-Vyn Gold",
    shortDescription:
      "A signal-monitoring agent for swing-trading workflows, alert review, and structured trade-preparation checklists.",
    fullDescription:
      "Astro-Vyn Gold is a rule-based Gold trading software agent for MetaTrader 5, designed for selective XAUUSD setups during the London session. It focuses on fixed-risk execution, controlled trade frequency, and risk-management logic such as spread checks, breakeven, trailing stop, and lot caps.",
    image: astroVynGoldVisual,
    screenshots: [astroVynGoldVisual],
    platform: "Web Dashboard",
    market: "Equities and Crypto",
    keyCapabilities: [
      "Tracks watchlist momentum and summarizes potential setup quality.",
      "Generates pre-trade checklist notes for review before manual execution.",
      "Highlights volatility, trend alignment, and risk reminders in one dashboard.",
    ],
    requirements: [
      "Modern browser with stable internet access.",
      "User-provided exchange or broker data export where applicable.",
      "Manual trade execution. This demo agent does not place live trades.",
    ],
    setupSteps: [
      "Create an account and open the Astro-Vyn Gold onboarding checklist.",
      "Add watchlist symbols and preferred market sessions.",
      "Review generated signal summaries before making any trading decision.",
    ],
    version: "Demo v0.9.0",
    updateHistory: [
      "Added watchlist signal summaries and risk checklist panels.",
      "Added demo dashboard visuals and structured product FAQs.",
    ],
    faqs: [
      {
        question: "Does Astro-Vyn Gold place trades automatically?",
        answer:
          "No. Astro-Vyn Gold is offered through subscription plans. You can choose Demo - 2 Months, 6 Months, or 1 Year. Users remain responsible for all trading decisions.",
      },
      {
        question: "Is this financial advice?",
        answer:
          "No. The product copy and demo flows are for software demonstration and should not be treated as investment advice.",
      },
    ],
    reviews: [
      {
        reviewerName: "Demo Customer",
        reviewText:
          "The checklist format made it easier to review trade ideas before acting on them.",
      },
    ],
    priceUsd: 149,
    featured: true,
    active: true,
  },
  {
    id: "agent-sentinel",
    slug: "sentinel-grid",
    name: "Sentinel Grid",
    shortDescription:
      "A portfolio-risk assistant for monitoring exposure, stop-review notes, and multi-asset alert conditions.",
    fullDescription:
      "Sentinel Grid is a dummy AI trading software agent used to show how Vyntegra can package risk-focused dashboards and monitoring flows for customers.",
    image: sentinelVisual,
    screenshots: [sentinelVisual],
    platform: "Web Dashboard",
    market: "Multi-Asset",
    keyCapabilities: [
      "Groups alerts by exposure, position theme, and market condition.",
      "Creates stop-review reminders and risk concentration notes.",
      "Provides a compact operating view for active monitoring sessions.",
    ],
    requirements: [
      "Portfolio or watchlist data entered by the user.",
      "Browser access to the Vyntegra dashboard.",
      "Manual review of all risk notes before acting.",
    ],
    setupSteps: [
      "Define portfolio groups, market categories, and risk thresholds.",
      "Connect or upload supported watchlist data.",
      "Use the daily review dashboard to inspect flagged conditions.",
    ],
    version: "Demo v0.8.5",
    updateHistory: [
      "Added exposure grouping and alert-priority states.",
      "Added multi-panel visual layout for demo product pages.",
    ],
    faqs: [
      {
        question: "Can Sentinel Grid connect to live accounts?",
        answer:
          "The dummy product describes a monitoring workflow. Any production integration would depend on approved broker or exchange support.",
      },
      {
        question: "Who is this agent for?",
        answer:
          "It is positioned for users who want clearer portfolio monitoring and structured risk-review prompts.",
      },
    ],
    reviews: [
      {
        reviewerName: "Demo Portfolio User",
        reviewText:
          "The risk grouping concept makes the dashboard feel less noisy than a standard alert list.",
      },
    ],
    priceUsd: 199,
    featured: true,
    active: true,
  },
  {
    id: "agent-drift",
    slug: "drift-scalper",
    name: "Drift Scalper",
    shortDescription:
      "A short-term market scanner concept for session momentum, micro-trend notes, and rapid review workflows.",
    fullDescription:
      "Drift Scalper is a dummy short-term trading assistant concept that demonstrates product depth, visual treatment, and checkout readiness without requiring live trading functionality.",
    image: driftVisual,
    screenshots: [driftVisual],
    platform: "Desktop Assisted Workflow",
    market: "Forex and Crypto",
    keyCapabilities: [
      "Scans short-term momentum shifts across selected symbols.",
      "Summarizes session conditions and potential invalidation notes.",
      "Supports rapid manual review with compact signal cards.",
    ],
    requirements: [
      "Desktop or laptop browser recommended.",
      "User-defined symbols, sessions, and risk preferences.",
      "Manual execution through the user's chosen platform.",
    ],
    setupSteps: [
      "Choose preferred markets and trading sessions.",
      "Set signal sensitivity and review frequency.",
      "Use the scanner output as a research aid, not automated advice.",
    ],
    version: "Demo v0.7.2",
    updateHistory: [
      "Added session momentum scoring and compact signal cards.",
      "Added FAQ and dummy product visuals for public demo use.",
    ],
    faqs: [
      {
        question: "Is Drift Scalper suitable for beginners?",
        answer:
          "It is a demonstration concept. Any real trading tool should be used only by users who understand market risk.",
      },
      {
        question: "Does it guarantee results?",
        answer:
          "No. No trading software can guarantee returns. This dummy product is for website demonstration only.",
      },
    ],
    reviews: [
      {
        reviewerName: "Demo Active Trader",
        reviewText:
          "The short-term scanner concept is clear and easy to understand from the product page.",
      },
    ],
    priceUsd: 129,
    featured: true,
    active: true,
  },
];
