export type CourseTestimonial = {
  name: string;
  roleOrContext: string;
  location: string;
  quote: string;
  verified: boolean;
  outcomeType: "learning" | "workflow" | "support";
  displayApproved: boolean;
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
  accessLessons: [
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
      title: "Lecture 3 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 4 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 5 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 6 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 7 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 8 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 9 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 10 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 11 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 12 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 13 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 14 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 15 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 16 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 17 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 18 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 19 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 20 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 21 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 22 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 23 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 24 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
    },
    {
      title: "Lecture 25 - Trading Automation Session",
      copy: "Continuing the practical workflow of building, testing, and understanding automation setups in this module.",
      placeholder: "",
      videoUrl: "",
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
      title: "Month 1 - Foundations & Setup",
      items: [
        "Trading automation basics",
        "Platform orientation",
        "MT5 and TradingView setup concepts",
        "How automation workflows are structured",
      ],
    },
    {
      title: "Month 2 - Strategy to Automation",
      items: [
        "Converting rules into workflow logic",
        "Alerts and execution flow",
        "Testing workflows",
        "Avoiding common automation mistakes",
      ],
    },
    {
      title: "Month 3 - Practical Deployment & Monitoring",
      items: [
        "Managing automated workflows",
        "Risk checks",
        "Monitoring behavior",
        "Final practical walkthrough",
        "Course wrap-up",
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
