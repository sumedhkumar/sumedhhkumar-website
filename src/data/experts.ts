import { site } from "@/data/site";
import type { Expert } from "@/types";

export const experts: Expert[] = [
  {
    id: "expert-sumedh-kumar",
    slug: "sumedh-kumar",
    fullName: site.founderName,
    professionalPhoto: site.founderPhoto,
    specialization:
      "Generative AI, conversational AI, NLP, machine learning, SQL workflows, cloud data systems, and product scoping",
    currentRole: "Founder, Vyntegra | Data Scientist",
    professionalSummary:
      "Sumedhhkumar Bhalerao is a data scientist and Vyntegra founder with experience across Builder.ai, Reliance Retail, Skillcart E-Learning, EATCLUB Brands, and RIVIGO. His profile combines generative AI, conversational AI, NLP, machine learning, Python, SQL, cloud services, data systems, and operations experience, giving him a practical view of how intelligent software should be scoped, built, and used in real business workflows.",
    expertiseAreas: [
      "Generative AI, AI agents, conversational AI, and NLP planning",
      "Python, SQL, database development, data analysis, and ML workflows",
      "AWS, Microsoft Azure, Azure AI Studio, Azure Cosmos DB, and Elasticsearch",
      "Docker, Kubernetes, Streamlit prototypes, and cloud-backed product demos",
      "Trading-software concepts: dashboards, alerts, signal review, and automation",
      "Operations, e-commerce, supply-chain workflows, and customer-facing product scope",
    ],
    relevantExperience: [
      "Builder.ai - Data Scientist, Nov 2022 to Feb 2025: intelligent solutions, machine learning, NLP, conversational AI, generative AI, SQL, cloud, and data-system work.",
      "Reliance Retail - Supply Chain Analyst, Nov 2020 to Nov 2022: analytics exposure across retail and operations workflows.",
      "Skillcart E-Learning - Data Science Intern, Jun 2020 to Nov 2020: Python tooling, Python and ML training, marketing, online/offline product demos, and deal-closing conversations.",
      "EATCLUB Brands, formerly BOX8 - Manager, Nov 2019 to May 2020: customer, team, and execution experience.",
      "RIVIGO - Operations Executive, Jul 2018 to Nov 2019: operations management, e-commerce, and supply-chain execution.",
    ],
    qualifications: [
      "Education: Bachelor of Engineering from MGM's Jawaharlal Nehru Engineering College; MBA in Artificial Intelligence from DY Patil University.",
      "AI and cloud credentials: Advanced Python with Databases, Azure Cosmos DB SQL API, Kubernetes, Docker, Docker for Data Scientists, and Amazon SageMaker.",
      "Data science credentials: Coursera Data Science Orientation, Data Science Methodology, and Tools for Data Science.",
      "Operations discipline: Lean Six Sigma Master Black Belt, Lean Six Sigma Green Belt, and SAP ERP Essential Training.",
      "Core stack: AI Agents, Conversational AI, Generative AI, Streamlit, AWS, Azure, Elasticsearch, NLP, Python, ML, SQL, Docker, Kubernetes, and Database Development.",
    ],
    linkedInUrl: "https://www.linkedin.com/in/sumedhkumar-bhalerao/",
    socialLinks: site.founderSocialLinks,
    consultationTopics: [
      "AI product scope: AI agents, generative AI, and conversational AI workflows",
      "Data workflows: NLP, data-science, and machine-learning review",
      "Technical planning: Python, SQL, databases, cloud services, and integrations",
      "Trading concepts: Dashboards, automation, alerts, and signal-review flows",
      "Custom builds: Websites, web platforms, automations, and intelligent business tools",
      "Roadmapping: Discovery, feature priorities, quotation planning, and implementation sequence",
    ],
    sessions: [
      {
        id: "sumedh-discovery-call",
        label: "30-Minute Solution Discovery",
        durationMinutes: 30,
        feeUsd: 49,
        active: true,
      },
      {
        id: "sumedh-product-scope",
        label: "60-Minute Product Scope Review",
        durationMinutes: 60,
        feeUsd: 89,
        active: true,
      },
    ],
    featured: true,
    active: true,
    availabilitySummary:
      "Available for focused consultations on generative AI, conversational AI, data-science workflows, trading-software concepts, and custom software requirements.",
  },
];
