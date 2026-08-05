export type CourseTestimonial = {
  name: string;
  roleOrContext: string;
  location: string;
  quote: string;
  verified: boolean;
  outcomeType: "learning" | "workflow" | "support";
  displayApproved: boolean;
};

export type CourseLesson = {
  title: string;
  copy: string;
  placeholder: string;
  videoUrl: string;
};

export type CourseModule = {
  title: string;
  description: string;
  lessons: CourseLesson[];
};

export const algoTradingCourseRoutes = {
  landing: "/lp/trading-automation-masterclass",
  register: "/courses/algo-trading/register",
  access: "/courses/algo-trading/access",
} as const;

export const algoTradingCourseLinkPlaceholders = {
  lecture1Video: "VIDEO_PLACEHOLDER_LECTURE_1",
  lecture2Video: "VIDEO_PLACEHOLDER_LECTURE_2",
  whatsappGroupUrl: "WHATSAPP_GROUP_LINK_PLACEHOLDER",
  whatsappPhone: "WHATSAPP_PHONE_NUMBER_PLACEHOLDER",
  paymentLink: "PAYMENT_LINK_PLACEHOLDER",
} as const;

const configuredCourseLinks = {
  introVideoUrl: (process.env.NEXT_PUBLIC_COURSE_INTRO_VIDEO_URL ?? "").trim(),
  lecture1VideoUrl: (
    process.env.NEXT_PUBLIC_COURSE_INTRO_VIDEO_URL ?? ""
  ).trim(),
  lecture2VideoUrl: (
    process.env.NEXT_PUBLIC_COURSE_INTRO_VIDEO_URL ?? ""
  ).trim(),
  whatsappGroupUrl: (
    process.env.NEXT_PUBLIC_COURSE_WHATSAPP_GROUP_URL ?? ""
  ).trim(),
  whatsappPhone: (process.env.NEXT_PUBLIC_COURSE_WHATSAPP_PHONE ?? "").trim(),
  paymentLink: (process.env.NEXT_PUBLIC_COURSE_PAYMENT_LINK ?? "").trim(),
} as const;

const coursePlaceholderValues = new Set<string>(
  Object.values(algoTradingCourseLinkPlaceholders),
);

function isConfiguredPlaceholder(value: string) {
  return coursePlaceholderValues.has(value.trim());
}

export function getSafeCourseExternalUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue || isConfiguredPlaceholder(trimmedValue)) {
    return "";
  }

  try {
    const parsed = new URL(trimmedValue);

    if (parsed.protocol !== "https:") {
      return "";
    }

    return parsed.href;
  } catch {
    return "";
  }
}

export function getSafeCourseVideoUrl(value: string) {
  return getSafeCourseExternalUrl(value);
}

function getSafeYoutubeVideoId(value: string) {
  const safeUrl = getSafeCourseExternalUrl(value);

  if (!safeUrl) {
    return "";
  }

  try {
    const parsed = new URL(safeUrl);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const firstPathSegment = parsed.pathname.split("/").filter(Boolean)[0] ?? "";

    if (host === "youtu.be") {
      return firstPathSegment;
    }

    if (host === "youtube.com" && parsed.pathname === "/watch") {
      return parsed.searchParams.get("v") ?? "";
    }

    if (
      (host === "youtube.com" || host === "youtube-nocookie.com") &&
      firstPathSegment === "embed"
    ) {
      return parsed.pathname.split("/").filter(Boolean)[1] ?? "";
    }
  } catch {
    return "";
  }

  return "";
}

function getSafeVimeoVideoId(value: string) {
  const safeUrl = getSafeCourseExternalUrl(value);

  if (!safeUrl) {
    return "";
  }

  try {
    const parsed = new URL(safeUrl);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const pathSegments = parsed.pathname.split("/").filter(Boolean);

    if (host === "vimeo.com") {
      return pathSegments[0] ?? "";
    }

    if (host === "player.vimeo.com" && pathSegments[0] === "video") {
      return pathSegments[1] ?? "";
    }
  } catch {
    return "";
  }

  return "";
}

export function getSafeCourseVideoEmbedUrl(value: string) {
  const videoId = getSafeYoutubeVideoId(value).trim();

  if (/^[A-Za-z0-9_-]{6,64}$/.test(videoId)) {
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }

  const vimeoVideoId = getSafeVimeoVideoId(value).trim();

  if (/^\d{6,16}$/.test(vimeoVideoId)) {
    return `https://player.vimeo.com/video/${vimeoVideoId}`;
  }

  return "";
}

export function getSafeCourseIntroEmbedUrl(value: string) {
  return getSafeCourseVideoEmbedUrl(value);
}

export function getSafeCoursePaymentUrl(value: string) {
  return getSafeCourseExternalUrl(value);
}

export function getSafeCourseWhatsappGroupUrl(value: string) {
  const safeUrl = getSafeCourseExternalUrl(value);

  if (!safeUrl.startsWith("https://chat.whatsapp.com/")) {
    return "";
  }

  return safeUrl;
}

export function getSafeCourseWhatsappContactUrl(
  phoneNumber: string,
  message: string,
) {
  const trimmedPhoneNumber = phoneNumber.trim();

  if (!trimmedPhoneNumber || isConfiguredPlaceholder(trimmedPhoneNumber)) {
    return "";
  }

  if (!/^[+\d\s().-]+$/.test(trimmedPhoneNumber)) {
    return "";
  }

  const numericPhoneNumber = trimmedPhoneNumber.replace(/\D/g, "");

  if (
    numericPhoneNumber.length < 8 ||
    numericPhoneNumber.length > 15
  ) {
    return "";
  }

  return `https://wa.me/${numericPhoneNumber}?text=${encodeURIComponent(message)}`;
}

export const algoTradingCourse = {
  slug: "algo-trading",
  name: "Vyntegra Trading Automation Masterclass",
  eyebrow: "Vyntegra Education",
  routes: algoTradingCourseRoutes,
  route: algoTradingCourseRoutes.landing,
  registerRoute: algoTradingCourseRoutes.register,
  accessRoute: algoTradingCourseRoutes.access,
  linkPlaceholders: algoTradingCourseLinkPlaceholders,
  links: {
    ...configuredCourseLinks,
    whatsappPrefilledMessage:
      "Hi, I watched the Vyntegra Trading Automation Masterclass free lectures. I want to discuss the \u20B928,999 launch offer and course joining process.",
  },
  support: {
    accessWhatsappPrefilledMessage:
      "Hi, I have unlocked the Vyntegra Trading Automation Masterclass free lessons and need help with the next steps.",
    accessEmailSubject: "Vyntegra course access support",
    fullCourseInquirySubject: "Full course access enquiry",
  },
  visuals: {
    heroWorkflowSlide: {
      src: "/images/course/trading-automation-workflow-slide.svg",
      alt: "AI trading automation workflow preview",
    },
    lessonPreviews: [
      {
        src: "/images/course/lecture-1-roadmap-slide.svg",
        alt: "Lecture 1 roadmap slide preview",
      },
      {
        src: "/images/course/lecture-2-teaching-slide.svg",
        alt: "Lecture 2 teaching session slide preview",
      },
    ],
    founderPortrait: "/images/optimized/sumedhhkumar-bhalerao-profile.webp",
  },
  founderContext: {
    copy:
      "Vyntegra focuses on practical AI automation and trading workflow education with clear scope, review discipline, and responsible implementation thinking.",
    credibilityPoints: [
      "Practical AI automation and trading workflow education.",
      "Beginner-friendly structure for understanding the moving parts.",
      "No signal-selling or promised-return positioning.",
    ],
  },
  primaryCta: "Get Free Access to Lecture 1 + Lecture 2",
  secondaryCta: "View Curriculum",
  subheading:
    "Learn how trading automation workflows are planned, set up, tested, and understood using MT5 and TradingView.",
  supportingLine:
    "A 3-month weekend program with live sessions, recordings, and WhatsApp support.",
  privacyNote:
    "We will use these details only to share the free lectures, course updates, and joining instructions.",
  disclaimer:
    "This is an educational course. It does not provide investment advice or profit guarantees. Trading involves financial risk.",
  pricing: {
    valueLabel: "\u20B944,999",
    launchOfferLabel: "\u20B929,999",
  },
  paymentInstructions: {
    activeCopy:
      "Use the external payment page only after reviewing the free lessons and joining instructions. Verification is manual, not instant.",
    placeholderCopy:
      "For full-course joining, contact Vyntegra support to discuss the launch batch.",
    configuredLabel: "External payment page configured",
    pendingLabel: "Payment link will be added after final setup",
  },
  afterPaymentSteps: [
    "Complete the payment using the secure external payment page.",
    "Keep your payment confirmation/reference ready.",
    "Contact us on WhatsApp or wait for manual verification instructions.",
    "The team will verify your payment and activate your full-course access.",
  ],
  manualVerificationNote:
    "Payments are reviewed manually by the Vyntegra team before full-course access is confirmed.",
  paidStatusCopy:
    "Your launch-batch payment is marked as paid. Full-course joining instructions will be shared through the official course communication channel.",
  manualVerificationStatusCopy:
    "Your payment is marked for manual verification. The team will review and update your access status after confirmation.",
  stats: [
    ["3 Months", "Structured weekend learning"],
    ["2 Hours Every Weekend", "Focused live sessions"],
    ["MT5 + TradingView", "Platforms covered"],
    ["Recordings Included", "Review after class"],
  ],
  previewLessons: [
    {
      title: "Lecture 1 - Course Roadmap",
      copy: "A concise overview of the course structure, tools covered, learning path, support, recordings, and joining process.",
      placeholder: algoTradingCourseLinkPlaceholders.lecture1Video,
      videoUrl: configuredCourseLinks.lecture1VideoUrl,
    },
    {
      title: "Lecture 2 - First Teaching Session",
      copy: "The first teaching session to help you understand the learning style and platform-oriented workflow.",
      placeholder: algoTradingCourseLinkPlaceholders.lecture2Video,
      videoUrl: configuredCourseLinks.lecture2VideoUrl,
    },
  ],
  courseModules: [
    {
      title: "Foundations & Course Overview",
      description: "Understand the course structure, tools, and the fundamentals of trading automation before diving in.",
      lessons: [
        {
          title: "Lecture 1 - Course Roadmap",
          copy: "A concise overview of the course structure, tools covered, learning path, support, recordings, and joining process.",
          placeholder: algoTradingCourseLinkPlaceholders.lecture1Video,
          videoUrl: configuredCourseLinks.lecture1VideoUrl,
        },
        {
          title: "Lecture 2 - First Teaching Session",
          copy: "The first teaching session to help you understand the learning style and platform-oriented workflow.",
          placeholder: algoTradingCourseLinkPlaceholders.lecture2Video,
          videoUrl: configuredCourseLinks.lecture2VideoUrl,
        },
        {
          title: "Lecture 3 - What Is Trading Automation",
          copy: "A clear explanation of what trading automation means, how it works at a high level, and what to realistically expect.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 4 - Manual vs Automated Workflows",
          copy: "Comparing manual and automated trading workflows to understand when automation adds value and when it does not.",
          placeholder: "",
          videoUrl: "",
        },
      ],
    },
    {
      title: "Platform Setup & Configuration",
      description: "Install, configure, and connect the platforms you will use throughout the course.",
      lessons: [
        {
          title: "Lecture 5 - MT5 Installation & Orientation",
          copy: "Step-by-step walkthrough of downloading, installing, and navigating the MetaTrader 5 platform interface.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 6 - TradingView Account & Chart Setup",
          copy: "Setting up your TradingView account, configuring chart layouts, and understanding the workspace for automation.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 7 - Broker Connection & Demo Account",
          copy: "Connecting your broker to MT5 and setting up a demo account for safe practice and testing.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 8 - Platform Integration Checkpoint",
          copy: "Verifying that all platform connections are working correctly and troubleshooting common setup issues.",
          placeholder: "",
          videoUrl: "",
        },
      ],
    },
    {
      title: "Strategy Logic & Indicators",
      description: "Learn how to read indicators, structure rules, and think about strategy logic before automating.",
      lessons: [
        {
          title: "Lecture 9 - Moving Averages & Trend Detection",
          copy: "Understanding moving averages, crossover signals, and how trend detection forms the basis of many automation rules.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 10 - RSI & Momentum Indicators",
          copy: "How RSI and momentum indicators work, when they are useful, and how to interpret their signals for rule-based logic.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 11 - Applying Indicators on Charts",
          copy: "Hands-on session adding indicators to TradingView charts, adjusting parameters, and reading combined signals.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 12 - Building Rule-Based Strategy Notes",
          copy: "Converting observations into clear, written rules that define entry conditions, exit conditions, and filters.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 13 - Strategy Logic Review & Refinement",
          copy: "Reviewing strategy notes for clarity, removing ambiguity, and preparing the logic for automation implementation.",
          placeholder: "",
          videoUrl: "",
        },
      ],
    },
    {
      title: "Alert & Automation Workflows",
      description: "Set up alerts, webhooks, and the execution flow that turns strategy rules into automated actions.",
      lessons: [
        {
          title: "Lecture 14 - TradingView Alerts Deep Dive",
          copy: "Creating, configuring, and managing TradingView alerts with conditions that match your strategy rules.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 15 - Webhook Setup & Signal Flow",
          copy: "Understanding webhooks, how signals travel from TradingView to execution endpoints, and setting up the connection.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 16 - Pine Script Basics for Alerts",
          copy: "Writing simple Pine Script conditions that power your TradingView alerts and automate signal generation.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 17 - End-to-End Execution Flow",
          copy: "Walking through the complete flow from alert trigger to order execution, understanding each step in the chain.",
          placeholder: "",
          videoUrl: "",
        },
      ],
    },
    {
      title: "Testing & Risk Management",
      description: "Validate your setup with testing discipline and build risk controls before going live.",
      lessons: [
        {
          title: "Lecture 18 - Backtesting Fundamentals",
          copy: "Understanding backtesting concepts, limitations, and how to use historical data to evaluate strategy logic.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 19 - Paper Trading & Forward Testing",
          copy: "Running your automation in paper trading mode to observe behavior without financial risk before going live.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 20 - Position Sizing & Capital Allocation",
          copy: "Learning position sizing principles, how to allocate capital responsibly, and why this matters for automation.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 21 - Risk Controls & Safety Checks",
          copy: "Implementing stop-loss rules, maximum drawdown limits, and circuit-breaker logic to protect against unexpected behavior.",
          placeholder: "",
          videoUrl: "",
        },
      ],
    },
    {
      title: "Deployment & Monitoring",
      description: "Go live with confidence, monitor your workflows, and maintain discipline in real market conditions.",
      lessons: [
        {
          title: "Lecture 22 - Going Live Checklist",
          copy: "The final pre-launch review covering every check you need before switching from demo to live trading.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 23 - Monitoring Dashboards & Alerts",
          copy: "Setting up monitoring tools, notification systems, and dashboards to keep track of live automation behavior.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 24 - Troubleshooting & Common Issues",
          copy: "Identifying and resolving common automation issues including connection drops, missed signals, and order failures.",
          placeholder: "",
          videoUrl: "",
        },
        {
          title: "Lecture 25 - Course Wrap-Up & Next Steps",
          copy: "Reviewing everything covered, consolidating your workflow, and planning your continued learning and practice path.",
          placeholder: "",
          videoUrl: "",
        },
      ],
    },
  ],
  learningOutcomes: [
    "Trading automation fundamentals",
    "MT5 setup basics",
    "TradingView workflow and alert logic",
    "Strategy-to-automation thinking",
    "Testing and common mistakes",
    "Risk-control mindset",
    "Monitoring and practical workflow discipline",
  ],
  practicalResults: [
    {
      title: "MT5 setup workflow understanding",
      copy: "Understand the sequence of platform setup, connection points, and checks before using an automated workflow.",
    },
    {
      title: "TradingView alert logic workflow",
      copy: "Learn how alert conditions, signal flow, and action steps fit together in a structured automation plan.",
    },
    {
      title: "Automation-ready strategy structure",
      copy: "Turn strategy notes into cleaner rules, inputs, conditions, and review steps that can be discussed or implemented responsibly.",
    },
    {
      title: "Testing checklist before usage",
      copy: "Use a practical checklist for setup review, scenario checks, and common mistakes before relying on any workflow.",
    },
    {
      title: "Risk-control and monitoring routine",
      copy: "Build a routine for monitoring behavior, reviewing alerts, and keeping risk checks visible during live market conditions.",
    },
    {
      title: "Deployment-readiness map",
      copy: "Know what needs to be prepared before moving from learning to a practical platform workflow.",
    },
  ],
  workflowTransformations: [
    {
      before: "Random strategy notes",
      after: "Clear rule-based workflow map",
      copy: "Move from scattered ideas to a structured view of conditions, actions, and review points.",
    },
    {
      before: "Confusing platform setup",
      after: "Step-by-step MT5 and TradingView setup checklist",
      copy: "Follow the setup path with clearer checkpoints instead of guessing what comes next.",
    },
    {
      before: "Blind automation usage",
      after: "Testing, risk checks, and monitoring routine",
      copy: "Understand why review discipline matters before any automated workflow is used.",
    },
    {
      before: "No clarity on alerts or execution flow",
      after: "Structured alert-to-action workflow understanding",
      copy: "See how alerts, decisions, and operational steps connect in a practical process.",
    },
  ],
  curriculum: [
    {
      title: "Module 1 - Foundations & Course Overview",
      items: [
        "Course roadmap and learning path",
        "First teaching session and learning style",
        "What trading automation means",
        "Manual vs automated workflows",
      ],
    },
    {
      title: "Module 2 - Platform Setup & Configuration",
      items: [
        "MT5 installation and orientation",
        "TradingView account and chart setup",
        "Broker connection and demo account",
        "Platform integration checkpoint",
      ],
    },
    {
      title: "Module 3 - Strategy Logic & Indicators",
      items: [
        "Moving averages and trend detection",
        "RSI and momentum indicators",
        "Applying indicators on charts",
        "Building rule-based strategy notes",
        "Strategy logic review and refinement",
      ],
    },
    {
      title: "Module 4 - Alert & Automation Workflows",
      items: [
        "TradingView alerts deep dive",
        "Webhook setup and signal flow",
        "Pine Script basics for alerts",
        "End-to-end execution flow",
      ],
    },
    {
      title: "Module 5 - Testing & Risk Management",
      items: [
        "Backtesting fundamentals",
        "Paper trading and forward testing",
        "Position sizing and capital allocation",
        "Risk controls and safety checks",
      ],
    },
    {
      title: "Module 6 - Deployment & Monitoring",
      items: [
        "Going live checklist",
        "Monitoring dashboards and alerts",
        "Troubleshooting common issues",
        "Course wrap-up and next steps",
      ],
    },
  ],
  included: [
    "3-month weekend live training",
    "2 hours every weekend",
    "Recordings",
    "WhatsApp support",
    "MT5 and TradingView focused training",
    "Lecture 1 + Lecture 2 free before payment",
    "Practical automation workflow understanding",
  ],
  paidProgramIncluded: [
    "3-month weekend live training",
    "2 hours every weekend",
    "Recordings",
    "WhatsApp support",
    "MT5 and TradingView focused training",
    "Practical automation workflow understanding",
  ],
  accessNextSteps: [
    "Start with Lecture 1.",
    "Continue to Lecture 2.",
    "Join the WhatsApp group for updates.",
    "Speak with us if you need help with access or next steps.",
  ],
  testimonials: [] as CourseTestimonial[],
  audienceFit: [
    "Traders who want to understand automation workflows before using tools.",
    "Beginners who want a structured setup path for MT5 and TradingView.",
    "People exploring alerts, workflow logic, and platform-oriented automation.",
    "Learners who want weekend sessions, recordings, and WhatsApp support.",
  ],
  audienceNotFit: [
    "People expecting promised profits or certain outcomes.",
    "People looking for financial advice or trade recommendations.",
    "People who want a one-click money system instead of learning the workflow.",
  ],
  faqs: [
    {
      question: "Is the free access really free?",
      answer:
        "Yes. Lecture 1 and Lecture 2 are available before any payment step.",
    },
    {
      question: "What do I get before paying?",
      answer:
        "You get access to Lecture 1 and Lecture 2 before any payment step.",
    },
    {
      question: "Do I need coding experience?",
      answer:
        "Coding experience is not required to start, but serious learning and practice are still needed to understand automation workflows clearly.",
    },
    {
      question: "Do I need trading experience?",
      answer:
        "Basic market familiarity helps, but the course is designed to explain the setup and workflow concepts carefully.",
    },
    {
      question: "Will recordings be available?",
      answer:
        "Yes. Recordings are included so students can revisit weekend sessions after class.",
    },
    {
      question: "Will there be WhatsApp support?",
      answer:
        "Yes. WhatsApp doubt support is included for course-related questions and joining instructions.",
    },
    {
      question: "Which platforms are covered?",
      answer: "The course currently covers MT5 and TradingView.",
    },
    {
      question: "Is this investment advice?",
      answer:
        "No. This is an educational program, not financial advice or a promise of trading outcomes.",
    },
    {
      question: "Does this promise trading profits?",
      answer:
        "No. The course teaches automation workflow structure, platform setup concepts, testing discipline, and monitoring routines. Trading outcomes remain uncertain and involve financial risk.",
    },
    {
      question: "When does payment happen?",
      answer:
        "Payment happens only after you create a free account and review Lecture 1 and Lecture 2.",
    },
  ],
} as const;

/** Flat list of all lessons across all modules (derived from courseModules). */
export const algoTradingCourseAccessLessons: CourseLesson[] =
  algoTradingCourse.courseModules.flatMap(
    (m): readonly CourseLesson[] => m.lessons,
  );
