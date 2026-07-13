import type { TradingAgentProduct } from "@/types";

export const products: TradingAgentProduct[] = [
  {
    id: "agent-pulse",
    slug: "astro-vyn-gold",
    name: "Astro-Vyn Gold",
    shortDescription:
      "A rule-based MT5 XAUUSD trading software agent for selective London-session workflows with fixed-risk execution controls.",
    fullDescription:
      "Astro-Vyn Gold is a rule-based Gold trading software agent for MetaTrader 5, designed for selective XAUUSD setups during the London session. It focuses on fixed-risk execution, controlled trade frequency, and risk-management logic such as spread checks, breakeven, trailing stop, and lot caps.",
    image: "/images/optimized/agents/astro-vyn-gold/image-1.webp",
    screenshots: ["/images/optimized/agents/astro-vyn-gold/image-1.webp"],
    galleryImages: [
      "/images/optimized/agents/astro-vyn-gold/image-1.webp",
      "/images/optimized/agents/astro-vyn-gold/image-2.webp",
      "/images/optimized/agents/astro-vyn-gold/image-3.webp",
    ],
    galleryImageAlt: [
      "Astro-Vyn Gold performance summary by session, weekday, and month",
      "Astro-Vyn Gold six-month backtest report",
      "Astro-Vyn Gold six-month performance report",
    ],
    platform: "MetaTrader 5",
    market: "XAUUSD Gold",
    keyCapabilities: [
      "Selective XAUUSD logic for London-session workflows.",
      "Spread checks, breakeven logic, trailing stops, and lot caps.",
      "Fixed-risk parameters with controlled trade frequency.",
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
    priceUsd: 599,
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
    image: "/images/optimized/agents/sentinel-vyn/image-1.webp",
    screenshots: ["/images/optimized/agents/sentinel-vyn/image-1.webp"],
    galleryImages: [
      "/images/optimized/agents/sentinel-vyn/image-1.webp",
      "/images/optimized/agents/sentinel-vyn/image-2.webp",
      "/images/optimized/agents/sentinel-vyn/image-3.webp",
    ],
    galleryImageAlt: [
      "Sentinel-Vyn six-month backtest summary",
      "Sentinel-Vyn performance breakdown by session, weekday, and month",
      "Sentinel-Vyn six-month balance and equity curve",
    ],
    platform: "MetaTrader 5",
    market: "XAUUSD Gold",
    keyCapabilities: [
      "Donchian entries with ATR stop and trailing management.",
      "Day filters and cooldowns to reduce overactivity.",
      "Fixed-risk operation with no martingale, grid, or doubling-down logic.",
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
    priceUsd: 499,
    featured: true,
    active: true,
  },
  {
    id: "agent-apex-flux",
    slug: "apex-flux",
    name: "Apex-Flux",
    shortDescription:
      "A BTCUSD perpetual futures MT5 Expert Advisor using 18 SMA momentum confirmation and dynamic trailing exits on the 5-minute chart.",
    fullDescription:
      "Apex-Flux is a disciplined Bitcoin trading software agent for MetaTrader 5. It is designed for BTCUSD perpetual futures workflows, using selective 18 SMA momentum confirmation, independent trades, configurable risk, and dynamic trailing exits.",
    image: "/images/optimized/agents/apex-flux/performance-report.webp",
    screenshots: ["/images/optimized/agents/apex-flux/performance-report.webp"],
    galleryImages: ["/images/optimized/agents/apex-flux/performance-report.webp"],
    galleryImageAlt: [
      "Apex-Flux BTCUSD performance report showing cumulative profit and trade excursions",
    ],
    platform: "MetaTrader 5",
    market: "BTCUSD Perpetual Futures / 5 Minutes",
    keyCapabilities: [
      "18 SMA confirmation for selective BTCUSD momentum entries.",
      "Dynamic trailing exits for extended moves after confirmation.",
      "Independent trades with configurable risk and no grid or martingale logic.",
    ],
    requirements: [
      "MetaTrader 5 access with a BTCUSD perpetual futures symbol.",
      "Minimum deposit reference of $500, with $1,000 or more providing additional operating room.",
      "Recommended leverage range of 1:10 to 1:50, subject to broker rules and user risk tolerance.",
      "A VPS is recommended for continuous Bitcoin-market operation.",
    ],
    setupSteps: [
      "Download and install the compiled MT5 EA.",
      "Connect it to a BTCUSD 5-minute chart on MetaTrader 5.",
      "Enable automated trading, monitor settings, and test on demo before live use.",
    ],
    version: "Subscription release",
    updateHistory: [],
    faqs: [
      {
        question: "Do I need trading experience?",
        answer:
          "No advanced coding is required, but users should understand trading risk and follow the setup guide carefully.",
      },
      {
        question: "Is this for all crypto pairs?",
        answer:
          "No. Apex-Flux is built around BTCUSD perpetual futures. Other instruments require separate testing.",
      },
      {
        question: "Is this a lifetime purchase?",
        answer:
          "No. Apex-Flux is subscription-based and access depends on the selected plan.",
      },
      {
        question: "What if I want to stop using it?",
        answer:
          "Remove the EA from the chart and stop using it. Renewal and access terms follow the selected subscription plan and site terms.",
      },
    ],
    reviews: [],
    priceUsd: 399,
    featured: true,
    active: true,
  },
];
