import type { SocialLink } from "@/types";

const founderSocialLinks: SocialLink[] = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@Sumedhhkumar/",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/sumedhhkumar.ai/",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sumedhkumar-bhalerao/",
  },
];

export const site = {
  name: "Vyntegra",
  founderName: "Sumedhhkumar Bhalerao",
  founderSubtitle: "Founder, Vyntegra | Data Scientist",
  founderPhoto: "/images/sumedhhkumar-bhalerao-avatar.png",
  founderBio:
    "Sumedhhkumar Bhalerao is a data scientist and founder of Vyntegra, shaped by hands-on work across generative AI, conversational AI, NLP, machine learning, SQL, cloud platforms, and operations-led business systems. His professional experience includes data science work at Builder.ai, supply-chain analysis at Reliance Retail, data-science training and product demonstrations at Skillcart E-Learning, and operations roles across EATCLUB Brands and RIVIGO.",
  founderProfile:
    "At Vyntegra, he brings that mix of AI capability, product thinking, database fluency, and execution discipline into practical digital solutions. He focuses on turning broad customer requirements into clear product scope, usable workflows, automation opportunities, trading-software concepts, and implementation plans that can move from idea to working system.",
  founderHighlights: [
    "Data Scientist experience at Builder.ai across intelligent solutions, machine learning, NLP, conversational AI, generative AI, and SQL-led workflows.",
    "Professional background spanning Reliance Retail, Skillcart E-Learning, EATCLUB Brands, and RIVIGO, connecting analytics with operations and business execution.",
    "Certified across advanced Python/database work, Azure Cosmos DB, Kubernetes, Docker, AWS SageMaker, data science methodology, SAP ERP, and Lean Six Sigma.",
  ],
  founderFocusAreas: [
    "Generative AI and AI agents",
    "NLP and conversational AI",
    "Python, SQL, and database workflows",
    "Cloud, Docker, and Kubernetes",
    "Trading-software and automation concepts",
    "Product scope and delivery planning",
  ],
  founderSocialLinks,
};

export function getPublicContactDetails() {
  return {
    email:
      process.env.NEXT_PUBLIC_VYNTEGRA_CONTACT_EMAIL ??
      "mahajanshardul1@gmail.com",
    phone: process.env.NEXT_PUBLIC_VYNTEGRA_CONTACT_PHONE ?? "",
  };
}

export const availabilityText =
  "Weekdays: 6:00 PM to 10:00 PM IST - Weekends: 12:00 PM to 8:00 PM IST";
