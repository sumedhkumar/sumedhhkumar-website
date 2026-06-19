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

const sentinelVynVisual = agentVisual(
  "Sentinel-Vyn",
  "#8FB8A0",
  "M148 510 C238 438 330 456 420 430 S604 388 682 454 S812 552 908 506 S1008 456 1054 412",
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
    platform: "MetaTrader 5",
    market: "XAUUSD Gold",
    keyCapabilities: [
      "Tracks watchlist momentum and summarizes potential setup quality.",
      "Generates pre-trade checklist notes for review before manual execution.",
      "Highlights volatility, trend alignment, and risk reminders in one dashboard.",
    ],
    requirements: [
      "MetaTrader 5 account access.",
      "Stable VPS or desktop environment for continuous platform operation.",
      "Demo testing before any live-market evaluation.",
    ],
    setupSteps: [
      "Choose an Astro-Vyn Gold subscription plan.",
      "Install and configure the software on MetaTrader 5.",
      "Run demo testing before using the software in live market conditions.",
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
          "Astro-Vyn Gold is offered through subscription plans. You can choose Demo - 2 Months, 6 Months, or 1 Year. Users remain responsible for all trading decisions and risk settings.",
      },
      {
        question: "Is this financial advice?",
        answer:
          "No. Product copy and demo flows are for software demonstration and should not be treated as investment advice.",
      },
    ],
    reviews: [
      {
        reviewerName: "Demo Customer",
        reviewText:
          "The checklist format made it easier to review trade ideas before acting on them.",
      },
    ],
    priceUsd: 199,
    featured: true,
    active: true,
  },
  {
    id: "agent-sentinel",
    slug: "sentinel-vyn",
    name: "Sentinel-Vyn",
    shortDescription:
      "An MT5 Gold trading software agent built around Donchian breakout logic, ATR-based risk controls, and demo-first evaluation.",
    fullDescription:
      "Sentinel-Vyn is an AI trading software agent for MetaTrader 5 and XAUUSD workflows. It combines Donchian breakout logic, ATR trailing, volatility-adapted rules, fixed-risk controls, day filters, cooldowns, and safeguards that avoid martingale, grid, or doubling-down behavior.",
    image: sentinelVynVisual,
    screenshots: [sentinelVynVisual],
    platform: "MetaTrader 5",
    market: "XAUUSD Gold",
    keyCapabilities: [
      "Uses Donchian breakout logic with ATR stop and trailing-stop management.",
      "Adapts entries and exits to volatility conditions with fixed-risk settings.",
      "Includes day filters, cooldowns, and safeguards against martingale, grid, or doubling-down systems.",
    ],
    requirements: [
      "MetaTrader 5 account access.",
      "Minimum deposit of $500, with $1000 preferred for wider operating room.",
      "Leverage between 1:100 and 1:500, depending on broker rules and user risk tolerance.",
      "Demo testing before any live-market evaluation.",
    ],
    setupSteps: [
      "Choose a Sentinel-Vyn subscription plan.",
      "Install and configure the software on MetaTrader 5 for XAUUSD.",
      "Start on demo and review behavior across different volatility conditions.",
      "Move cautiously only after understanding the risk settings and account exposure.",
    ],
    version: "Demo v1.0.0",
    updateHistory: [
      "Added Donchian breakout workflow with ATR stop logic.",
      "Added volatility-adapted controls, cooldowns, day filters, and dynamic trailing stop support.",
    ],
    faqs: [
      {
        question: "What market is Sentinel-Vyn designed for?",
        answer:
          "Sentinel-Vyn is designed for MetaTrader 5 XAUUSD Gold workflows. Users should test on demo before considering any live-market use.",
      },
      {
        question: "Does Sentinel-Vyn use martingale or grid logic?",
        answer:
          "No. Sentinel-Vyn is positioned around fixed-risk execution and does not use martingale, grid, or doubling-down logic.",
      },
      {
        question: "What account size is recommended?",
        answer:
          "The minimum deposit reference is $500, while $1000 is preferred for more operating room. Users are responsible for choosing risk settings suitable for their account.",
      },
      {
        question: "Do backtest metrics guarantee future results?",
        answer:
          "No. Historical backtests are simulations based on past data and do not guarantee future performance.",
      },
    ],
    reviews: [
      {
        reviewerName: "Rahul M., Mumbai",
        reviewText:
          "The setup notes made the MT5 configuration process clearer, especially the reminder to test on demo first.",
      },
      {
        reviewerName: "Aditya K., Bengaluru",
        reviewText:
          "I liked that the risk controls are explained plainly instead of being buried inside technical settings.",
      },
      {
        reviewerName: "Neha P., Pune",
        reviewText:
          "The subscription page helped me compare access terms without feeling pushed into a larger plan.",
      },
      {
        reviewerName: "Vikram S., Delhi",
        reviewText:
          "The no martingale and no grid positioning was important for how I evaluate trading software.",
      },
      {
        reviewerName: "Isha R., Jaipur",
        reviewText:
          "The product page gave me enough context to ask better setup questions before purchase.",
      },
    ],
    priceUsd: 199,
    featured: true,
    active: true,
  },
];
