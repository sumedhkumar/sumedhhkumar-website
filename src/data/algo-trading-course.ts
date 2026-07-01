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
  landing: "/courses/algo-trading",
  register: "/courses/algo-trading/register",
  access: "/courses/algo-trading/access",
} as const;

export const algoTradingCourseLinkPlaceholders = {
  introVideo: "VIDEO_PLACEHOLDER_INTRO",
  lecture0Video: "VIDEO_PLACEHOLDER_LECTURE_0",
  lecture1Video: "VIDEO_PLACEHOLDER_LECTURE_1",
  whatsappGroupUrl: "WHATSAPP_GROUP_LINK_PLACEHOLDER",
  whatsappPhone: "WHATSAPP_PHONE_NUMBER_PLACEHOLDER",
  paymentLink: "PAYMENT_LINK_PLACEHOLDER",
} as const;

const configuredCourseLinks = {
  introVideoUrl: (process.env.NEXT_PUBLIC_COURSE_INTRO_VIDEO_URL ?? "").trim(),
  lecture0VideoUrl: (
    process.env.NEXT_PUBLIC_COURSE_LECTURE_0_VIDEO_URL ?? ""
  ).trim(),
  lecture1VideoUrl: (
    process.env.NEXT_PUBLIC_COURSE_LECTURE_1_VIDEO_URL ?? ""
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
  primaryCta: "Get Free Access to Lecture 0 & Lecture 1",
  secondaryCta: "View Curriculum",
  subheading:
    "Learn how trading automation workflows are planned, set up, tested, and understood using MT5 and TradingView.",
  supportingLine:
    "A 3-month weekend program with live sessions, recordings, and WhatsApp support.",
  privacyNote:
    "We will use these details only to share the free lectures, course updates, and joining instructions.",
  disclaimer:
    "This is an educational course. It does not provide investment advice, profit guarantees, or assured returns. Trading involves financial risk.",
  pricing: {
    valueLabel: "\u20B945,000",
    launchOfferLabel: "\u20B928,999",
  },
  paymentInstructions: {
    activeCopy:
      "Use the external payment page only after reviewing the free lessons and joining instructions. Verification is manual, not instant.",
    placeholderCopy:
      "Payment link will be added here. For now, use the WhatsApp option to discuss joining the launch batch.",
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
      title: "Intro Video",
      copy: "A concise orientation to the program, learning flow, and how to approach the free preview.",
      placeholder: algoTradingCourseLinkPlaceholders.introVideo,
      videoUrl: configuredCourseLinks.introVideoUrl,
    },
    {
      title: "Lecture 0 - Course Roadmap & What You Get",
      copy: "Explains the complete roadmap, tools, course structure, and what students receive.",
      placeholder: algoTradingCourseLinkPlaceholders.lecture0Video,
      videoUrl: configuredCourseLinks.lecture0VideoUrl,
    },
    {
      title: "Lecture 1 - First Teaching Session",
      copy: "The first real teaching session before payment, built to help you judge the learning style.",
      placeholder: algoTradingCourseLinkPlaceholders.lecture1Video,
      videoUrl: configuredCourseLinks.lecture1VideoUrl,
    },
  ],
  accessLessons: [
    {
      title: "Intro Video",
      copy: "A quick orientation to the masterclass, who it is for, and how the free access flow works.",
      placeholder: algoTradingCourseLinkPlaceholders.introVideo,
      videoUrl: configuredCourseLinks.introVideoUrl,
    },
    {
      title: "Lecture 0 - Course Roadmap & What You Get",
      copy: "A complete overview of the course structure, tools covered, learning path, support, recordings, and joining process.",
      placeholder: algoTradingCourseLinkPlaceholders.lecture0Video,
      videoUrl: configuredCourseLinks.lecture0VideoUrl,
    },
    {
      title: "Lecture 1 - First Teaching Session",
      copy: "The first actual teaching session to help you understand the course quality before payment.",
      placeholder: algoTradingCourseLinkPlaceholders.lecture1Video,
      videoUrl: configuredCourseLinks.lecture1VideoUrl,
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
    "Intro Video + Lecture 0 + Lecture 1 free before payment",
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
    "Watch the intro video.",
    "Watch Lecture 0 and Lecture 1.",
    "Join the WhatsApp group for updates.",
    "Speak with us or use the payment link once added.",
    "Join the full 3-month launch batch.",
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
        "Yes. The intro video, Lecture 0, and Lecture 1 are available before any payment step.",
    },
    {
      question: "What do I get before paying?",
      answer:
        "You get access to the intro video, Lecture 0, and Lecture 1 before any payment step.",
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
        "Payment happens only after you create a free account and review the intro video, Lecture 0, and Lecture 1.",
    },
  ],
} as const;
